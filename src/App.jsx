import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { IslandProvider } from './context/IslandContext';
import { HelmetProvider } from 'react-helmet-async';
import { AnimatePresence, MotionConfig } from 'framer-motion';
import PortfolioLayout from './pages/PortfolioLayout';
import {
  DynamicIsland,
  DevToolsDetector,
  SEOHelmet,
  AnnouncementBanner,
  SplashScreen,
  MaintenanceGate
} from './components';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { trackPageView } from './lib/analyticsTracker';
import { supabase } from './lib/supabaseClient';
import { PersonaProvider } from "./context/PersonaContext";
import { prefetchTable } from "./hooks/useRealtimeData";

import PWAInstallPrompt from './components/widgets/PWAInstallPrompt';

const NotFound = React.lazy(() => import('./pages/NotFound'));
const AdminLogin = React.lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const AdminMfaSetup = React.lazy(() => import('./pages/AdminMfaSetup'));
const ResumePreview = React.lazy(() => import('./pages/ResumePreview'));

function DynamicMainLayout() {
  return <PortfolioLayout />;
}

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
    <>
      <SEOHelmet />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<DynamicMainLayout />}>
            <Route index element={null} />
            <Route path="home" element={null} />
            <Route path="about" element={null} />
            <Route path="skills" element={null} />
            <Route path="projects" element={null} />
            <Route path="blog" element={null} />
            <Route path="education" element={null} />
            <Route path="experience" element={null} />
            <Route path="certifications" element={null} />
            <Route path="contact" element={null} />
            <Route path="updates" element={null} />
          </Route>
          <Route path="/resume-preview" element={<ResumePreview />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/dashboard/:tab" element={<AdminDashboard />} />
            <Route path="/admin/mfa-setup" element={<AdminMfaSetup />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </>
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
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    async function prefetchData() {
      try {
        // Prevent layout shift scrollbars during splash screen
        document.body.style.overflow = 'hidden';

        // Stage 1: Always fetch global required data
        const corePromises = [
          prefetchTable('site_settings', { single: true, filter: { column: 'id', value: 1 } })
        ];

        // Route-specific intelligent prefetching (deep linking)
        const path = window.location.pathname;
        if (path.startsWith('/projects')) {
          corePromises.push(prefetchTable('projects', { orderColumn: 'created_at', ascending: true }));
        } else if (path.startsWith('/experience')) {
          corePromises.push(prefetchTable('experience', { orderColumn: 'display_order', ascending: true }));
        } else if (path.startsWith('/skills')) {
          corePromises.push(prefetchTable('skills', { orderColumn: 'order_index', ascending: true }));
        } else if (path.startsWith('/education')) {
          corePromises.push(prefetchTable('education', { orderColumn: 'display_order', ascending: true }));
        }

        await Promise.all(corePromises);

        // Stage 2: Release the Splash Screen to fade out
        setAppReady(true);
        // Safely mount background content slightly before splash unmounts for a seamless crossfade
        setTimeout(() => {
          setShowContent(true);
          document.body.style.overflow = 'unset';
        }, 200);

        // Stage 3: Silent Background Prefetching Engine (Everything else)
        setTimeout(async () => {
          await Promise.all([
            prefetchTable('projects', { orderColumn: 'created_at', ascending: true }),
            prefetchTable('experience', { orderColumn: 'display_order', ascending: true }),
            prefetchTable('skills', { orderColumn: 'order_index', ascending: true }),
            prefetchTable('education', { orderColumn: 'display_order', ascending: true })
          ]);
        }, 1000); 
        
      } catch (e) {
        setAppReady(true);
        setShowContent(true);
        document.body.style.overflow = 'unset';
      }
    }
    
    prefetchData();
  }, []);

  return (
    <MotionConfig reducedMotion={reduceMotion ? "always" : "never"}>
      <SplashScreen isReady={appReady} />
      
      {showContent && (
        <>
          <AnnouncementBanner />
          <IslandProvider>
            <DynamicIsland />
            <DevToolsDetector />
            <PWAInstallPrompt />
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
    let broadcastChannel;

    const broadcastPresence = async () => {
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
        return;
      }
      try {
        let geoData;
        const cachedLoc = sessionStorage.getItem('visitor_location');
        if (cachedLoc) {
          geoData = JSON.parse(cachedLoc);
        } else {
          try {
            const res = await fetch('/api/geo', {
              headers: { 'Content-Type': 'application/json' },
            });
            if (res.ok) {
              const data = await res.json();
              if (data && !data.isBot && data.lat && data.lng) {
                geoData = { lat: data.lat, lng: data.lng, country: data.country, region: data.region, deviceType: data.deviceType };
                sessionStorage.setItem('visitor_location', JSON.stringify(geoData));
              }
            } else {
              geoData = { lat: 20.5937, lng: 78.9629, country: 'India', region: 'Asia-South', deviceType: 'desktop' };
              sessionStorage.setItem('visitor_location', JSON.stringify(geoData));
            }
          } catch {
            // Fallback coarse location if offline/local dev
            geoData = { lat: 20.5937, lng: 78.9629, country: 'India', region: 'Asia-South', deviceType: 'desktop' };
          }
        }

        if (geoData && geoData.lat && geoData.lng) {
          // Use Broadcast channel for lightweight fire-and-forget ping events
          broadcastChannel = supabase.channel('visitor_events');
          broadcastChannel.subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              broadcastChannel.send({
                type: 'broadcast',
                event: 'visitor_ping',
                payload: {
                  lat: geoData.lat,
                  lng: geoData.lng,
                  country: geoData.country || 'Global',
                  deviceType: geoData.deviceType || 'desktop',
                  page: window.location.pathname,
                  timestamp: new Date().toISOString(),
                },
              });
            }
          });
        }
      } catch {
        /* silent fallback */
      }
    };
    
    setTimeout(broadcastPresence, 1500);

    return () => {
      if (broadcastChannel) supabase.removeChannel(broadcastChannel);
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
