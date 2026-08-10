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
} from './components';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { trackPageView } from './lib/analyticsTracker';
import { supabase } from './lib/supabaseClient';
import { PersonaProvider } from "./context/PersonaContext";
import { prefetchTable } from "./hooks/useRealtimeData";

import PWAInstallPrompt from './components/widgets/PWAInstallPrompt';
import SiteDisabledGate from './components/SiteDisabledGate';
import { useDevSecurityShield } from './hooks/useDevSecurityShield';

function SecurityToast({ message }) {
  if (!message) return null;
  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 99999999,
      background: 'rgba(15, 23, 42, 0.95)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '1px solid rgba(59, 130, 246, 0.35)',
      color: '#f8fafc',
      padding: '10px 20px',
      borderRadius: 999,
      fontSize: 13,
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(59, 130, 246, 0.25)',
      pointerEvents: 'none',
      letterSpacing: '0.01em'
    }}>
      <span>{message}</span>
    </div>
  );
}

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
    try {
      const trail = JSON.parse(sessionStorage.getItem("visited_trail") || "[]");
      // Ensure we don't duplicate the last path
      if (trail[trail.length - 1] !== location.pathname) {
        trail.push(location.pathname);
        sessionStorage.setItem("visited_trail", JSON.stringify(trail.slice(-6)));
      }
    } catch (err) {
      // Ignore storage errors on restrictive mobile browsers
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
            <Route path="education" element={null} />
            <Route path="experience" element={null} />
            <Route path="certifications" element={null} />
            <Route path="contact" element={null} />
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
  const isSim = typeof window !== 'undefined' && (
    window.location.search.includes('preview=mobile') || 
    window.location.search.includes('sim=1')
  );
  const [appReady, setAppReady] = useState(isSim);
  const [showContent, setShowContent] = useState(isSim);
  const { toastMessage } = useDevSecurityShield();

  useEffect(() => {
    let mounted = true;

    const forceUnlock = () => {
      if (mounted) {
        setAppReady(true);
        setShowContent(true);
        document.body.style.overflow = 'unset';
      }
    };

    if (isSim) {
      forceUnlock();
      return () => { mounted = false; };
    }

    // Safety fallback timer: force show content after 1200ms max, regardless of network speed/mobile latency
    const safetyTimer = setTimeout(forceUnlock, 1200);

    async function prefetchData() {
      try {
        // Prevent layout shift scrollbars during splash screen
        document.body.style.overflow = 'hidden';

        // Detect client network capabilities
        const conn = typeof navigator !== 'undefined' ? (navigator.connection || navigator.mozConnection || navigator.webkitConnection) : null;
        const effectiveType = conn?.effectiveType || '4g';
        const saveData = conn?.saveData || false;
        const isFastNetwork = effectiveType === '4g' && !saveData;

        // Stage 1: Always fetch global required data
        const corePromises = [
          prefetchTable('site_settings', { single: true, filter: { column: 'id', value: 1 } })
        ];

        if (isFastNetwork) {
          // Fast connection: Parallel batch prefetch all primary tables immediately
          corePromises.push(
            prefetchTable('projects', { orderColumn: 'created_at', ascending: true }),
            prefetchTable('experience', { orderColumn: 'display_order', ascending: true }),
            prefetchTable('skills', { orderColumn: 'order_index', ascending: true }),
            prefetchTable('education', { orderColumn: 'display_order', ascending: true }),
            prefetchTable('certifications', { orderColumn: 'display_order', ascending: true })
          );
        } else {
          // Route-specific intelligent prefetching for constrained connections
          const path = window.location.pathname;
          if (path.startsWith('/projects')) {
            corePromises.push(prefetchTable('projects', { orderColumn: 'created_at', ascending: true }));
          } else if (path.startsWith('/experience')) {
            corePromises.push(prefetchTable('experience', { orderColumn: 'display_order', ascending: true }));
          } else if (path.startsWith('/skills')) {
            corePromises.push(prefetchTable('skills', { orderColumn: 'order_index', ascending: true }));
          } else if (path.startsWith('/education')) {
            corePromises.push(prefetchTable('education', { orderColumn: 'display_order', ascending: true }));
          } else if (path.startsWith('/certifications')) {
            corePromises.push(prefetchTable('certifications', { orderColumn: 'display_order', ascending: true }));
          }
        }

        await Promise.all(corePromises);
      } catch (e) {
        // Ignore prefetch failures
      } finally {
        clearTimeout(safetyTimer);
        forceUnlock();

        // Stage 3: Silent Background Prefetching Engine
        setTimeout(async () => {
          try {
            await Promise.all([
              prefetchTable('projects', { orderColumn: 'created_at', ascending: true }),
              prefetchTable('experience', { orderColumn: 'display_order', ascending: true }),
              prefetchTable('skills', { orderColumn: 'order_index', ascending: true }),
              prefetchTable('education', { orderColumn: 'display_order', ascending: true }),
              prefetchTable('certifications', { orderColumn: 'display_order', ascending: true })
            ]);
          } catch (err) {}
        }, 800);
      }
    }
    
    prefetchData();

    return () => {
      mounted = false;
      clearTimeout(safetyTimer);
    };
  }, []);

  return (
    <MotionConfig reducedMotion={reduceMotion ? "always" : "never"}>
      <SplashScreen isReady={appReady} />
      
      {showContent && (
        <IslandProvider>
          <BrowserRouter>
            <SiteDisabledGate>
              <AnnouncementBanner />
              <DynamicIsland />
              <DevToolsDetector />
              <PWAInstallPrompt />
              <SecurityToast message={toastMessage} />
              <Suspense fallback={<Loader />}>
                <AnimatedRoutes />
              </Suspense>
            </SiteDisabledGate>
          </BrowserRouter>
        </IslandProvider>
      )}
    </MotionConfig>
  );
}

export default function App() {
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
