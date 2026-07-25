import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import MobileBottomNav from '../MobileBottomNav';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Sparkles } from 'lucide-react';

export default function MobileLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const getSectionFromPath = (path) => {
    const cleanPath = path.replace(/^\//, '');
    return cleanPath || 'home';
  };

  useEffect(() => {
    if (location.pathname === '/') {
      navigate('/home', { replace: true });
    }
  }, [location.pathname, navigate]);

  const activeSection = getSectionFromPath(location.pathname);

  const handleNavClick = (id) => {
    const targetPath = `/${id}`;
    if (location.pathname !== targetPath) {
      navigate(targetPath);
    }
  };

  return (
    <div className="mobile-app-layout" style={{ minHeight: '100vh', paddingBottom: '70px', background: 'var(--bg-primary)' }}>
      {/* Mobile Top Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 900,
          display: 'flex',
          alignItems: 'center',
          justify-content: 'space-between',
          padding: '12px 18px',
          background: 'var(--bg-secondary, rgba(255,255,255,0.85))',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #007bff, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 13 }}>
            ST
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              Sujith Thota
            </h1>
            <p style={{ margin: 0, fontSize: 10, color: 'var(--text-muted)', fontWeight: 500 }}>
              Data Science · AI
            </p>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            border: '1px solid var(--border-color)',
            background: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            justify-content: 'center',
            cursor: 'pointer',
          }}
        >
          {theme === 'dark' ? <Sun size={16} color="#f59e0b" /> : <Moon size={16} color="#6366f1" />}
        </button>
      </header>

      {/* Main Outlet Render */}
      <main className="mobile-page-container" style={{ padding: '16px' }}>
        <Outlet />
      </main>

      {/* Shared Mobile Bottom Navigation */}
      <MobileBottomNav activeSection={activeSection} onNavClick={handleNavClick} />
    </div>
  );
}
