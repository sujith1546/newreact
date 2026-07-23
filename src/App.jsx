import React, { Suspense, useEffect } from 'react';
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
    <div className="spinner">Loading...</div>
  </div>
);

function AppContent() {
  const { reduceMotion } = useTheme();
  return (
    <MotionConfig reducedMotion={reduceMotion ? "always" : "never"}>
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
    </MotionConfig>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}
