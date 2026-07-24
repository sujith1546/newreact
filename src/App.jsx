import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { IslandProvider } from './context/IslandContext';
import { HelmetProvider } from 'react-helmet-async';
import { AnimatePresence, MotionConfig } from 'framer-motion';
import { useTheme } from './context/ThemeContext';
import MainLayout from './pages/MainLayout';
import DynamicIsland from './components/DynamicIsland';
import DevToolsDetector from './components/DevToolsDetector';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { MaintenanceGate } from './components/MaintenanceMode';
import SEOHelmet from './components/SEOHelmet';
import AnnouncementBanner from './components/AnnouncementBanner';
import { trackPageView } from './lib/analyticsTracker';
import { supabase } from './lib/supabaseClient';
import { PersonaProvider } from "./context/PersonaContext";
import SplashScreen from "./components/SplashScreen";
import { globalDataCache } from "./hooks/useRealtimeData";

const NotFound = React.lazy(() => import('./pages/NotFound'));
const AdminLogin = React.lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const AdminMfaSetup = React.lazy(() => import('./pages/AdminMfaSetup'));
const ResumePreview = React.lazy(() => import('./pages/ResumePreview'));

// Wrapper for AnimatePresence to access useLocation
function AnimatedRoutes() {
  const location = useLocation();

  // Track visited pages for 404 breadcrumb trail
  useEffect(() => {
    const trail = JSON.parse(sessionStorage.getItem("visited_trail") || "[]");
    // Ensure we don't duplicate the last path
    if (trail[trail.length - 1] !== location.pathname) {
      trail.push(location.pathname);
      sessionStorage.setItem("visited_trail", JSON.stringify(trail.slice(-6)));
    }
    
    // Log page view to Supabase analytics
    // Only track non-admin routes to avoid polluting data with dashboard views
    if (!location.pathname.startsWith('/admin')) {
      trackPageView(location.pathname);
    }
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<MainLayout />} />
        <Route path="/resume-preview" element={<ResumePreview />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/mfa-setup" element={<AdminMfaSetup />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

// Fallback spinner for Suspense
const Loader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-color)' }}>
    <div className="spinner"></div>
  </div>
);

function AppContent() {
  const { reduceMotion } = useTheme();
  const [appReady, setAppReady] = useState(false);
  const [showContent, setShowContent] = useState(false); // Controls when App Content mounts to prevent layout shifts

  useEffect(() => {
    async function prefetchData() {
      try {
        // Fetch core data required for initial paint
        const [profileRes, settingsRes] = await Promise.all([
          supabase.from('profile').select('*').single(),
          supabase.from('site_settings').select('*').single()
        ]);
        
        if (!profileRes.error) {
           globalDataCache[`profile_${JSON.stringify({select:'*', single:true, orderColumn:'id', ascending:true, filter:null})}`] = profileRes.data;
        }
        if (!settingsRes.error) {
           globalDataCache[`site_settings_${JSON.stringify({select:'*', single:true, orderColumn:'id', ascending:true, filter: { column: 'id', value: 1 }})}`] = settingsRes.data;
        }

        // Release the Splash Screen to fade out
        setAppReady(true);
        // Safely mount background content slightly before splash unmounts for a seamless crossfade
        setTimeout(() => setShowContent(true), 200);

        // Silent Background SWR Cache Population (Heavy Data)
        setTimeout(async () => {
          const fetchConfigs = [
            { table: 'projects', options: { select: '*', single: false, orderColumn: 'created_at', ascending: true, filter: null } },
            { table: 'experience', options: { select: '*', single: false, orderColumn: 'display_order', ascending: true, filter: null } },
            { table: 'skills', options: { select: '*', single: false, orderColumn: 'order_index', ascending: true, filter: null } },
            { table: 'education', options: { select: '*', single: false, orderColumn: 'display_order', ascending: true, filter: null } }
          ];
          
          await Promise.all(fetchConfigs.map(async ({ table, options }) => {
             const res = await supabase.from(table).select(options.select).order(options.orderColumn, { ascending: options.ascending });
             if (!res.error) {
               globalDataCache[`${table}_${JSON.stringify(options)}`] = res.data;
             }
          }));
        }, 800); // Wait until splash screen is done animating before using network
        
      } catch (e) {
        setAppReady(true);
        setShowContent(true);
      }
    }
    
    prefetchData();
  }, []);

  return (
    <MotionConfig reducedMotion={reduceMotion ? "always" : "never"}>
      <SplashScreen isReady={appReady} />
      
      {showContent && (
        <>
          <SEOHelmet />
          <AnnouncementBanner />
          <IslandProvider>
            <DynamicIsland />
            <DevToolsDetector />
            <BrowserRouter>
              <Suspense fallback={<Loader />}>
                <MaintenanceGate>
                  <AnimatedRoutes />
                </MaintenanceGate>
              </Suspense>
            </BrowserRouter>
          </IslandProvider>
        </>
      )}
    </MotionConfig>
  );
}

export default function App() {
  useEffect(() => {
    let presenceChannel;

    const broadcastPresence = async () => {
      try {
        let lat, lng;
        const cachedLoc = sessionStorage.getItem('visitor_location');
        if (cachedLoc) {
          const parsed = JSON.parse(cachedLoc);
          lat = parsed.lat;
          lng = parsed.lng;
        } else {
          // Fallback chain for IP Geolocation APIs to prevent rate-limit (429) & CORS errors
          try {
            const res = await fetch('https://get.geojs.io/v1/ip/geo.json');
            if (!res.ok) throw new Error('geojs failed');
            const data = await res.json();
            if (data && data.latitude && data.longitude) {
              lat = parseFloat(data.latitude);
              lng = parseFloat(data.longitude);
            } else {
              throw new Error('invalid geojs data');
            }
          } catch (err1) {
            try {
              const res2 = await fetch('https://freeipapi.com/api/json');
              if (!res2.ok) throw new Error('freeipapi failed');
              const data2 = await res2.json();
              if (data2 && data2.latitude && data2.longitude) {
                lat = parseFloat(data2.latitude);
                lng = parseFloat(data2.longitude);
              } else {
                throw new Error('invalid freeipapi data');
              }
            } catch (err2) {
              // If all APIs fail, gracefully skip instead of throwing red console errors
              console.warn('Visitor location APIs unavailable, skipping globe presence broadcast.');
            }
          }

          if (lat && lng) {
            sessionStorage.setItem('visitor_location', JSON.stringify({ lat, lng }));
          }
        }

        if (lat && lng) {
          presenceChannel = supabase.channel('visitor_presence');
          presenceChannel.subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
              await presenceChannel.track({
                lat,
                lng,
                online_at: new Date().toISOString()
              });
            }
          });
        }
      } catch (e) {
        // Silently ignore if adblocker or fetch fails
      }
    };
    
    // Delay broadcast slightly to not block initial render
    setTimeout(broadcastPresence, 2000);

    return () => {
      if (presenceChannel) supabase.removeChannel(presenceChannel);
    };
  }, []);

  return (
    <HelmetProvider>
      <ThemeProvider>
        <PersonaProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </PersonaProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}
