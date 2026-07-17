import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { HelmetProvider } from 'react-helmet-async';
import { AnimatePresence } from 'framer-motion';
import MainLayout from './pages/MainLayout';
const NotFound = React.lazy(() => import('./pages/NotFound'));

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

export default function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Suspense fallback={<Loader />}>
            <AnimatedRoutes />
          </Suspense>
        </BrowserRouter>
      </ThemeProvider>
    </HelmetProvider>
  );
}
