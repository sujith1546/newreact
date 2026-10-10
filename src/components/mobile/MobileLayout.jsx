// MobileLayout - redesigned top bar v2
import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import MobileBottomNav from '../MobileBottomNav';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Search, X, Briefcase } from 'lucide-react';
import useRealtimeData from '../../hooks/useRealtimeData';

import MobileHomeView from './views/MobileHomeView';
import MobileAboutView from './views/MobileAboutView';
import MobileSkillsView from './views/MobileSkillsView';
import MobileProjectsView from './views/MobileProjectsView';
import MobileEducationView from './views/MobileEducationView';
import MobileExperienceView from './views/MobileExperienceView';
import MobileCertificationsView from './views/MobileCertificationsView';
import MobileContactView from './views/MobileContactView';

const viewsMap = {
  home: MobileHomeView,
  about: MobileAboutView,
  skills: MobileSkillsView,
  projects: MobileProjectsView,
  education: MobileEducationView,
  experience: MobileExperienceView,
  certifications: MobileCertificationsView,
  contact: MobileContactView,
};

const SECTION_LABELS = {
  home: 'Home',
  about: 'About Me',
  skills: 'Skills',
  projects: 'Projects',
  education: 'Education',
  experience: 'Experience',
  certifications: 'Certifications',
  contact: 'Contact',
};

const QUICK_LINKS = [
  { label: 'Home', id: 'home' },
  { label: 'About Me', id: 'about' },
  { label: 'Skills', id: 'skills' },
  { label: 'Projects', id: 'projects' },
  { label: 'Education', id: 'education' },
  { label: 'Experience', id: 'experience' },
  { label: 'Certifications', id: 'certifications' },
  { label: 'Contact', id: 'contact' },
];

function MobileTopBar({ activeSection, onNavClick, theme, toggleTheme, dbSettings }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const searchInputRef = useRef(null);

  const isAvailable = dbSettings?.available_for_hire !== false;
  const ownerName = dbSettings?.owner_name || 'Sujith Thota';
  const ownerRole = dbSettings?.owner_role || 'Data Science · AI';

  // Track scroll for elevation effect
  useEffect(() => {
    const container = document.querySelector('.mobile-app-layout');
    if (!container) return;
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Focus search input when opening
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setSearchQuery('');
    }
  }, [searchOpen]);

  const filteredLinks = QUICK_LINKS.filter(l =>
    l.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchSelect = (id) => {
    onNavClick(id);
    setSearchOpen(false);
  };

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 900,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          minHeight: 62,
          background: theme === 'dark'
            ? 'rgba(15, 15, 20, 0.88)'
            : 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: scrolled
            ? '1px solid var(--border-color)'
            : '1px solid transparent',
          boxShadow: scrolled
            ? (theme === 'dark'
              ? '0 2px 20px rgba(0,0,0,0.4)'
              : '0 2px 20px rgba(0,0,0,0.08)')
            : 'none',
          transition: 'box-shadow 0.25s ease, border-color 0.25s ease',
        }}
      >
        {/* ── LEFT: Avatar + Identity ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, flex: 1, minWidth: 0 }}>
          {/* Monogram Avatar with availability glow ring */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {/* Outer glow ring */}
            <div style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              padding: 2,
              background: isAvailable
                ? 'conic-gradient(from 0deg, #22c55e, #6366f1, #3b82f6, #22c55e)'
                : 'var(--border-color)',
              boxShadow: isAvailable
                ? '0 0 0 0 rgba(34,197,94,0), 0 0 12px rgba(99,102,241,0.35)'
                : 'none',
              animation: isAvailable ? 'mobiletopbar-ring-spin 4s linear infinite' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              {/* Inner monogram circle */}
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: theme === 'dark'
                  ? 'linear-gradient(145deg, #1e1b4b 0%, #312e81 40%, #1e40af 100%)'
                  : 'linear-gradient(145deg, #4338ca 0%, #6366f1 50%, #3b82f6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* Shine overlay */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '50%',
                  borderRadius: '50% 50% 0 0',
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 100%)',
                  pointerEvents: 'none',
                }} />
                {/* ST Text */}
                <span style={{
                  color: '#fff',
                  fontWeight: 900,
                  fontSize: 13,
                  letterSpacing: '0.04em',
                  fontFamily: "'Inter', sans-serif",
                  lineHeight: 1,
                  textShadow: '0 1px 4px rgba(0,0,0,0.35)',
                  userSelect: 'none',
                }}>
                  ST
                </span>
              </div>
            </div>

            {/* Pulsing availability dot */}
            {isAvailable && (
              <span style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: '#22c55e',
                border: `2.5px solid ${theme === 'dark' ? 'rgba(15,15,20,0.9)' : '#fff'}`,
                boxShadow: '0 0 0 0 rgba(34,197,94,0.5)',
                animation: 'mobiletopbar-pulse 2.2s infinite',
              }} />
            )}
          </div>

          {/* Name + badge */}
          <div style={{ minWidth: 0 }}>
            <h1 style={{
              margin: 0,
              fontSize: 14,
              fontWeight: 800,
              color: 'var(--text-primary)',
              lineHeight: 1.25,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              letterSpacing: '-0.01em',
            }}>
              {ownerName}
            </h1>
            {/* "Open to Hire" badge */}
            {isAvailable && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                marginTop: 2,
                padding: '1px 7px',
                borderRadius: 99,
                background: 'rgba(34,197,94,0.12)',
                border: '1px solid rgba(34,197,94,0.35)',
                fontSize: 9.5,
                fontWeight: 700,
                color: '#16a34a',
                letterSpacing: '0.02em',
                lineHeight: 1.6,
                textTransform: 'uppercase',
              }}>
                <Briefcase size={8} strokeWidth={2.5} />
                Open to Hire
              </span>
            )}
            {!isAvailable && (
              <p style={{ margin: 0, fontSize: 10, color: 'var(--text-muted)', fontWeight: 500, lineHeight: 1.4 }}>
                {ownerRole}
              </p>
            )}
          </div>
        </div>

        {/* ── RIGHT: Action Buttons ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {/* Search Button */}
          <motion.button
            id="mobile-topbar-search-btn"
            onClick={() => setSearchOpen(true)}
            whileTap={{ scale: 0.88 }}
            style={{
              width: 36,
              height: 36,
              borderRadius: 11,
              border: '1px solid var(--border-color)',
              background: theme === 'dark'
                ? 'rgba(255,255,255,0.06)'
                : 'rgba(0,0,0,0.04)',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              outline: 'none',
            }}
            aria-label="Search sections"
          >
            <Search size={15} strokeWidth={2.2} />
          </motion.button>

          {/* Theme Toggle */}
          <motion.button
            id="mobile-topbar-theme-btn"
            onClick={toggleTheme}
            whileTap={{ scale: 0.88 }}
            style={{
              width: 36,
              height: 36,
              borderRadius: 11,
              border: '1px solid var(--border-color)',
              background: theme === 'dark'
                ? 'rgba(245,158,11,0.1)'
                : 'rgba(99,102,241,0.08)',
              color: theme === 'dark' ? '#f59e0b' : '#6366f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              outline: 'none',
              transition: 'background 0.3s ease',
            }}
            aria-label="Toggle theme"
          >
            <motion.div
              key={theme}
              initial={{ rotate: -30, opacity: 0, scale: 0.6 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 30, opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {theme === 'dark'
                ? <Sun size={15} strokeWidth={2.2} />
                : <Moon size={15} strokeWidth={2.2} />
              }
            </motion.div>
          </motion.button>
        </div>
      </header>

      {/* ── Search Overlay ── */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            key="search-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setSearchOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1100,
              background: theme === 'dark'
                ? 'rgba(0,0,0,0.7)'
                : 'rgba(0,0,0,0.35)',
              backdropFilter: 'blur(6px)',
            }}
          >
            <motion.div
              initial={{ y: -20, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 340, damping: 28 }}
              onClick={e => e.stopPropagation()}
              style={{
                position: 'absolute',
                top: 12,
                left: 12,
                right: 12,
                borderRadius: 18,
                overflow: 'hidden',
                background: theme === 'dark' ? '#1a1a26' : '#fff',
                boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
                border: '1px solid var(--border-color)',
              }}
            >
              {/* Search input */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 16px',
                borderBottom: '1px solid var(--border-color)',
              }}>
                <Search size={16} color="var(--text-muted)" strokeWidth={2.2} />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search sections…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    fontSize: 15,
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--app-font)',
                  }}
                />
                <button
                  onClick={() => setSearchOpen(false)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    border: 'none',
                    background: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <X size={14} strokeWidth={2.4} />
                </button>
              </div>

              {/* Results list */}
              <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                {filteredLinks.length > 0 ? filteredLinks.map((link, i) => (
                  <motion.button
                    key={link.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => handleSearchSelect(link.id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '13px 16px',
                      border: 'none',
                      borderBottom: i < filteredLinks.length - 1 ? '1px solid var(--border-color)' : 'none',
                      background: activeSection === link.id
                        ? (theme === 'dark' ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.07)')
                        : 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: 9,
                      background: activeSection === link.id
                        ? 'linear-gradient(135deg, #6366f1, #3b82f6)'
                        : (theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 13,
                    }}>
                      {activeSection === link.id ? '✦' : '›'}
                    </div>
                    <span style={{
                      fontSize: 14,
                      fontWeight: activeSection === link.id ? 700 : 500,
                      color: activeSection === link.id ? 'var(--primary-blue)' : 'var(--text-primary)',
                    }}>
                      {link.label}
                    </span>
                    {activeSection === link.id && (
                      <span style={{
                        marginLeft: 'auto',
                        fontSize: 10,
                        fontWeight: 700,
                        color: 'var(--primary-blue)',
                        opacity: 0.8,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}>
                        Active
                      </span>
                    )}
                  </motion.button>
                )) : (
                  <div style={{
                    padding: '28px 16px',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: 13,
                  }}>
                    No sections match "{searchQuery}"
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyframe animations */}
      <style>{`
        @keyframes mobiletopbar-pulse {
          0%   { box-shadow: 0 0 0 0 rgba(34,197,94,0.5); }
          70%  { box-shadow: 0 0 0 5px rgba(34,197,94,0); }
          100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
        }
        @keyframes mobiletopbar-ring-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}

export default function MobileLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { data: dbSettings } = useRealtimeData('site_settings', {
    single: true,
    filter: { column: 'id', value: 1 },
  });

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
  const ActiveView = viewsMap[activeSection] || MobileHomeView;

  const handleNavClick = (id) => {
    const targetPath = `/${id}`;
    if (location.pathname !== targetPath) {
      navigate(targetPath);
    }
  };

  return (
    <div className="mobile-app-layout" style={{ minHeight: '100vh', paddingBottom: '70px', background: 'var(--bg-primary)' }}>
      {/* Redesigned Mobile Top Header */}
      <MobileTopBar
        activeSection={activeSection}
        onNavClick={handleNavClick}
        theme={theme}
        toggleTheme={toggleTheme}
        dbSettings={dbSettings}
      />

      {/* Main Active Mobile View */}
      <main className="mobile-page-container" style={{ padding: '16px' }}>
        <ActiveView />
      </main>

      {/* Shared Mobile Bottom Navigation */}
      <MobileBottomNav activeSection={activeSection} onNavClick={handleNavClick} />
    </div>
  );
}
