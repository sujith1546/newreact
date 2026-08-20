import React, { useEffect, useState } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { MotionConfig, motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import AppProviders from './AppProviders';
import AppRoutes from './routes';
import {
  DynamicIsland,
  DevToolsDetector,
  SEOHelmet,
  AnnouncementBanner,
  SplashScreen,
} from '../components';
import { trackPageView } from '../lib/analyticsTracker';
import { prefetchTable } from '../hooks/useRealtimeData';
import PWAInstallPrompt from '../components/widgets/PWAInstallPrompt';
import SiteDisabledGate from '../components/SiteDisabledGate';
import AdminLoginModal from '../components/admin/AdminLoginModal';
import { useDevSecurityShield } from '../hooks/useDevSecurityShield';
import useSeoMeta from '../hooks/useSeoMeta';
import ErrorBoundary from '../shared/feedback/ErrorBoundary';

function GlobalAdminModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    window.addEventListener('open-admin-login', handleOpen);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('open-admin-login', handleOpen);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return <AdminLoginModal isOpen={isOpen} onClose={() => setIsOpen(false)} />;
}

function RoutedAppShell() {
  const location = useLocation();

  // Track visited pages for 404 breadcrumb trail & analytics
  useEffect(() => {
    try {
      const trail = JSON.parse(sessionStorage.getItem("visited_trail") || "[]");
      if (trail[trail.length - 1] !== location.pathname) {
        trail.push(location.pathname);
        sessionStorage.setItem("visited_trail", JSON.stringify(trail.slice(-6)));
      }
    } catch (err) {
      // Ignore storage errors on restrictive browsers
    }
    
    // Log page view to analytics (exclude admin pages)
    if (!location.pathname.startsWith('/admin')) {
      trackPageView(location.pathname);
    }
  }, [location.pathname]);

  return (
    <>
      <SEOHelmet />
      <AppRoutes location={location} />
    </>
  );
}

function AppContent() {
  const { reduceMotion } = useTheme();
  const isSim = typeof window !== 'undefined' && (
    window.location.search.includes('preview=mobile') || 
    window.location.search.includes('sim=1')
  );
  const [appReady, setAppReady] = useState(isSim);
  const [showContent, setShowContent] = useState(isSim);
  useDevSecurityShield();
  useSeoMeta();

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

    // Safety fallback timer: force show content after 1200ms max
    const safetyTimer = setTimeout(forceUnlock, 1200);

    async function prefetchData() {
      try {
        document.body.style.overflow = 'hidden';

        const conn = typeof navigator !== 'undefined' ? (navigator.connection || navigator.mozConnection || navigator.webkitConnection) : null;
        const effectiveType = conn?.effectiveType || '4g';
        const saveData = conn?.saveData || false;
        const isFastNetwork = effectiveType === '4g' && !saveData;

        // Core required data
        const corePromises = [
          prefetchTable('site_settings', { single: true, filter: { column: 'id', value: 1 } })
        ];

        if (isFastNetwork) {
          corePromises.push(
            prefetchTable('projects', { orderColumn: 'created_at', ascending: true }),
            prefetchTable('experience', { orderColumn: 'display_order', ascending: true }),
            prefetchTable('skills', { orderColumn: 'order_index', ascending: true }),
            prefetchTable('education', { orderColumn: 'display_order', ascending: true }),
            prefetchTable('certifications', { orderColumn: 'display_order', ascending: true })
          );
        } else {
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

        // Silent Background Prefetching
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
  }, [isSim]);

  return (
    <MotionConfig reducedMotion={reduceMotion ? "always" : "never"}>
      <SplashScreen isReady={appReady} />
      
      {showContent && (
        <BrowserRouter>
          <SiteDisabledGate>
            <AnnouncementBanner />
            <DynamicIsland />
            <DevToolsDetector />
            <PWAInstallPrompt />
            <ErrorBoundary>
              <RoutedAppShell />
            </ErrorBoundary>
          </SiteDisabledGate>
          <GlobalAdminModal />
        </BrowserRouter>
      )}
    </MotionConfig>
  );
}

export default function App() {
  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
}
