import React, { Suspense } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PortfolioLayout from '../pages/PortfolioLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import ErrorBoundary from '../shared/feedback/ErrorBoundary';
import RouteErrorFallback from '../shared/feedback/RouteErrorFallback';

// Lazy loaded page components
const NotFound = React.lazy(() => import('../pages/NotFound'));
const AdminDashboard = React.lazy(() => import('../pages/AdminDashboard'));
const AdminMfaSetup = React.lazy(() => import('../pages/AdminMfaSetup'));
const ResumePreview = React.lazy(() => import('../pages/ResumePreview'));
const LandingShowcase = React.lazy(() => import('../pages/LandingShowcase'));

export function AdminLoginRedirect() {
  const navigate = useNavigate();
  React.useEffect(() => {
    navigate('/', { replace: true });
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('open-admin-login'));
    }, 120);
  }, [navigate]);
  return null;
}

export function DynamicMainLayout() {
  return <PortfolioLayout />;
}

// Fallback spinner for Suspense
export const RouteLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-primary, #ffffff)' }}>
    <div className="spinner"></div>
  </div>
);

/**
 * AppRoutes Component
 * Centralized declarative route tree with per-route ErrorBoundary protection & Suspense fallbacks
 */
export default function AppRoutes({ location }) {
  return (
    <ErrorBoundary fallback={<RouteErrorFallback />}>
      <AnimatePresence mode="wait">
        <Suspense fallback={<RouteLoader />}>
          <Routes location={location} key={location.pathname}>
            {/* Public Portfolio Layout */}
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

            {/* Resume Viewer & Landing Showcase */}
            <Route path="/resume-preview" element={<ResumePreview />} />
            <Route path="/landing" element={<LandingShowcase />} />

            {/* Admin Authentication & Console */}
            <Route path="/admin/login" element={<AdminLoginRedirect />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/dashboard/:tab" element={<AdminDashboard />} />
              <Route path="/admin/mfa-setup" element={<AdminMfaSetup />} />
            </Route>

            {/* 404 Catch-All */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </ErrorBoundary>
  );
}
