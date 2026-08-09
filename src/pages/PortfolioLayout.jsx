import React, { useState, useRef, useEffect, Suspense, lazy, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { FileText, Mail, Briefcase, Check, RefreshCw, Sparkles, CheckCircle2, Activity } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { globalDataCache, fetchPromises } from '../hooks/useRealtimeData';
import { subscribeToRealtimeSync } from '../lib/broadcastSyncEngine';
import haptic from '../lib/haptics';
import { FaGithub } from 'react-icons/fa';
import {
  Sidebar,
  WelcomeModal,
  MobileBottomNav,
  DarkModeToggle,
  SettingsDropdown,
  SettingsSidebar,
  TimezoneStatus,
  ChatBot,
  CommandPalette,
  MobileStatusPanel,
  ParticleCanvas,
  SectionSpotlight
} from '../components';
import CommandPaletteModal from '../components/ui/CommandPaletteModal';

const Home = lazy(() => import('./Home'));
const About = lazy(() => import('./About'));
const Skills = lazy(() => import('./Skills'));
const Projects = lazy(() => import('./Projects'));
const Education = lazy(() => import('./Education'));
const Experience = lazy(() => import('./Experience'));
const Certifications = lazy(() => import('./Certifications'));
const Contact = lazy(() => import('./Contact'));
import { useTheme } from '../context/ThemeContext';
import { usePersona } from '../context/PersonaContext';
import useRealtimeData from '../hooks/useRealtimeData';
import { trackPageView } from '../lib/analyticsTracker';
import { useLocation, useNavigate } from 'react-router-dom';

const SECTIONS_DEF = [
  { id: 'home', Component: Home },
  { id: 'about', Component: About },
  { id: 'skills', Component: Skills },
  { id: 'projects', Component: Projects },
  { id: 'education', Component: Education },
  { id: 'experience', Component: Experience },
  { id: 'certifications', Component: Certifications },
  { id: 'contact', Component: Contact },
];

const SECTION_LABELS = {
  home: null,
  about: 'About Me',
  skills: 'Skills',
  projects: 'Projects',
  education: 'Education',
  experience: 'Experience',
  certifications: 'Certifications',
  contact: 'Contact',
};

const SECTION_HEADERS = {
  home: {
    title: 'Home',
    subtitle: 'Data Science Specialist & Full-Stack Developer',
  },
  about: {
    title: 'About Me',
    subtitle: 'Passionate developer crafting intelligent digital experiences',
  },
  skills: {
    title: 'Skills',
    subtitle: 'Technical competencies and proficiency levels',
  },
  projects: {
    title: 'Projects',
    subtitle: 'Showcase of intelligent digital applications & systems',
  },
  education: {
    title: 'Education',
    subtitle: 'My academic journey — from foundation to university',
  },
  experience: {
    title: 'Experience',
    subtitle: 'Professional background, internships, and project roles',
  },
  certifications: {
    title: 'Certifications',
    subtitle: 'Verified technical achievements and credentials',
  },
  contact: {
    title: 'Contact',
    subtitle: 'Get in touch for opportunities, projects, or collaboration',
  },
};

const NAV_DURATION = 0.45;
const NAV_EASE = [0.22, 1, 0.36, 1];
const PROGRESS_DURATION = NAV_DURATION * 0.8;

const mobilePageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export default function PortfolioLayout() {
  const { data: dbSettings } = useRealtimeData('site_settings', { single: true, filter: { column: 'id', value: 1 } });
  const { getSectionOrder } = usePersona();
  const location = useLocation();
  const navigate = useNavigate();

  const baseSections = SECTIONS_DEF.filter(sec => {
    if (sec.id === 'experience' && dbSettings?.feature_experience === false) return false;
    if (sec.id === 'certifications' && dbSettings?.feature_certifications === false) return false;
    return true;
  });

  const SECTIONS = getSectionOrder(baseSections);
  const ALL_PAGES = SECTIONS.map(s => s.id);

  const getSectionFromPath = (path) => {
    const cleanPath = path.replace(/^\//, '');
    return cleanPath || 'home';
  };
  const activeSection = getSectionFromPath(location.pathname);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [slideDirection, setSlideDirection] = useState(0);
  const [isNavActive, setIsNavActive] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [spotlightSection, setSpotlightSection] = useState(null);
  const [spotlightKeyword, setSpotlightKeyword] = useState('');
  const scrollRef = useRef(null);
  const navTimerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // ── Public Realtime Sync & Pull-To-Refresh State ──
  const [liveNotification, setLiveNotification] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDist, setPullDist] = useState(0);
  const touchStartY = useRef(0);
  const isPullingRef = useRef(false);

  // 1. Inter-Tab & Supabase Realtime Listener for Visitors
  useEffect(() => {
    const channel = supabase
      .channel('public_portfolio_realtime')
      .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
        const table = payload.table || 'content';
        const label = table.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
        haptic.medium();
        window.dispatchEvent(new CustomEvent('pcms_sync_event', {
          detail: { label, message: `${label} synchronized via cloud` }
        }));
        // Soft purge caches
        Object.keys(globalDataCache).forEach((k) => delete globalDataCache[k]);
        Object.keys(fetchPromises).forEach((k) => delete fetchPromises[k]);
        window.dispatchEvent(new CustomEvent('pcms_force_refresh'));
      })
      .subscribe();

    const unsubscribeBroadcast = subscribeToRealtimeSync((syncMsg) => {
      const table = syncMsg.table || 'content';
      const label = table.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
      haptic.success();
      window.dispatchEvent(new CustomEvent('pcms_sync_event', {
        detail: { label, message: `P2P sync (~${syncMsg.pingMs || 1}ms)` }
      }));
      Object.keys(globalDataCache).forEach((k) => delete globalDataCache[k]);
      Object.keys(fetchPromises).forEach((k) => delete fetchPromises[k]);
      window.dispatchEvent(new CustomEvent('pcms_force_refresh'));
    });

    return () => {
      supabase.removeChannel(channel);
      if (typeof unsubscribeBroadcast === 'function') unsubscribeBroadcast();
    };
  }, []);

  // Auto-dismiss live notification toast after 5s
  useEffect(() => {
    if (liveNotification) {
      const timer = setTimeout(() => setLiveNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [liveNotification]);

  // 2. In-Memory Soft Refresh Handler
  const handleSoftRefresh = useCallback(() => {
    haptic.medium();
    setIsRefreshing(true);
    Object.keys(globalDataCache).forEach((k) => delete globalDataCache[k]);
    Object.keys(fetchPromises).forEach((k) => delete fetchPromises[k]);
    window.dispatchEvent(new CustomEvent('pcms_force_refresh'));
    setTimeout(() => {
      setIsRefreshing(false);
      haptic.success();
    }, 600);
  }, []);

  // 3. Liquid Touch Pull-To-Refresh Handlers
  const handlePullTouchStart = useCallback((e) => {
    if (!isMobile) return;
    if (scrollRef.current && scrollRef.current.scrollTop <= 2) {
      touchStartY.current = e.touches[0].clientY;
      isPullingRef.current = true;
    }
  }, [isMobile]);

  const handlePullTouchMove = useCallback((e) => {
    if (!isMobile || !isPullingRef.current) return;
    const currentY = e.touches[0].clientY;
    const dy = currentY - touchStartY.current;
    if (dy > 0 && scrollRef.current && scrollRef.current.scrollTop <= 2) {
      const damped = Math.min(80, dy * 0.45);
      setPullDist(damped);
    }
  }, [isMobile]);

  const handlePullTouchEnd = useCallback(() => {
    if (!isMobile || !isPullingRef.current) return;
    if (pullDist >= 55) {
      handleSoftRefresh();
    }
    setPullDist(0);
    isPullingRef.current = false;
  }, [isMobile, pullDist, handleSoftRefresh]);

  // Cursor glow effect (desktop only with rAF throttling)
  useEffect(() => {
    if (isMobile) return;
    let rafId = null;
    const handleMouseMove = (e) => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        document.documentElement.style.setProperty('--cursor-x', `${e.clientX}px`);
        document.documentElement.style.setProperty('--cursor-y', `${e.clientY}px`);
        rafId = null;
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isMobile]);

  // Scroll progress
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const total = scrollHeight - clientHeight;
      setScrollProgress(total > 0 ? scrollTop / total : 0);
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [activeSection]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (location.pathname === '/') {
      navigate('/home', { replace: true });
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    trackPageView(`/${activeSection}`);
  }, [activeSection]);

  useEffect(() => {
    const onNavigate = (e) => {
      const { section, highlight } = e.detail || {};
      if (section) {
        if (section !== 'resume') handleNavClick(section);
        if (highlight) {
          const kw = e.detail?.keyword || '';
          setSpotlightSection(null);
          setSpotlightKeyword('');
          setTimeout(() => {
            setSpotlightSection(section);
            setSpotlightKeyword(kw);
          }, 150);
        }
      }
    };
    window.addEventListener('navigate-section', onNavigate);
    return () => window.removeEventListener('navigate-section', onNavigate);
  }, []);

  const handleNavClick = (id) => {
    if (id === activeSection) return;

    const curIdx = ALL_PAGES.indexOf(activeSection);
    const nextIdx = ALL_PAGES.indexOf(id);
    const dir = (curIdx !== -1 && nextIdx !== -1)
      ? (nextIdx > curIdx ? 1 : -1)
      : 0;

    setSlideDirection(dir);
    setIsNavActive(true);

    const targetPath = `/${id}`;
    navigate(targetPath);

    if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: 'auto' });

    clearTimeout(navTimerRef.current);
    navTimerRef.current = setTimeout(() => setIsNavActive(false), 500);
  };

  const handleCopyEmail = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText('sujithreddy1546@gmail.com').catch(() => { });
    }
    try {
      import('../utils/conversionTracker').then(({ trackRecruiterIntent }) => {
        trackRecruiterIntent('email_copy', 'Recruiter copied contact email');
      });
    } catch (_) {}
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };

  const touchStartRef = useRef(null);

  const handleTouchStart = (e) => {
    if (!isMobile) return;
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    };
  };

  const handleTouchEnd = (e) => {
    if (!isMobile || !touchStartRef.current) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    const dt = Date.now() - touchStartRef.current.time;

    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 2 && dt < 500) {
      const SWIPE_PAGES = ['home', 'skills', 'projects', 'contact'];
      const idx = SWIPE_PAGES.indexOf(activeSection);
      if (idx !== -1) {
        if (dx < 0 && idx < SWIPE_PAGES.length - 1) handleNavClick(SWIPE_PAGES[idx + 1]);
        else if (dx > 0 && idx > 0) handleNavClick(SWIPE_PAGES[idx - 1]);
      }
    }
    touchStartRef.current = null;
  };

  const ctaMap = {
    home: { label: 'Hire Me', icon: Briefcase, action: () => handleNavClick('contact'), style: 'accent' },
    about: { label: 'Resume', icon: FileText, action: () => window.dispatchEvent(new CustomEvent('open-resume')), style: 'ghost' },
    skills: { label: 'Resume', icon: FileText, action: () => window.dispatchEvent(new CustomEvent('open-resume')), style: 'ghost' },
    projects: { label: 'GitHub', icon: FaGithub, action: () => window.open('https://github.com/sujith1546', '_blank'), style: 'ghost' },
    education: { label: 'Resume', icon: FileText, action: () => window.dispatchEvent(new CustomEvent('open-resume')), style: 'ghost' },
    experience: { label: 'Resume', icon: FileText, action: () => window.dispatchEvent(new CustomEvent('open-resume')), style: 'ghost' },
    certifications: { label: 'Resume', icon: FileText, action: () => window.dispatchEvent(new CustomEvent('open-resume')), style: 'ghost' },
    contact: { label: emailCopied ? 'Copied!' : 'Copy Email', icon: emailCopied ? Check : Mail, action: handleCopyEmail, style: emailCopied ? 'success' : 'ghost' },
  };
  const cta = ctaMap[activeSection] || ctaMap.home;

  const ActiveComponent = SECTIONS.find(s => s.id === activeSection)?.Component ?? Home;

  const mobileTransition = {
    type: 'tween',
    ease: NAV_EASE,
    duration: NAV_DURATION,
  };

  return (
    <div className="layout">
      {/* Desktop Scroll Progress Bar */}
      {!isMobile && scrollProgress > 0 && (
        <div style={{
          position: 'fixed', top: 0, left: 0, zIndex: 9999,
          height: 2, background: 'linear-gradient(90deg, var(--primary-blue), #8b5cf6)',
          width: `${scrollProgress * 100}%`,
          transition: 'width 0.1s linear',
          boxShadow: '0 0 8px var(--primary-blue)',
        }} />
      )}
      <AnimatePresence>
        {isMobile && isNavActive && (
          <motion.div
            className="nav-progress-bar"
            key="nav-progress"
            initial={{ scaleX: 0, opacity: 1 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              scaleX: { duration: PROGRESS_DURATION, ease: NAV_EASE },
              opacity: { duration: 0.2 },
            }}
          />
        )}
      </AnimatePresence>

      <header className="mobile-top-header">
        <div className="mh-left">
          <div className="mh-beacon-wrap">
            <button className="mh-avatar-btn" onClick={() => setIsStatusOpen(true)} aria-label="Availability status">
              <div className="mh-avatar-ring" />
              <img src="/profile_photo.png" alt="Sujith Thota" className="mh-avatar-img" />
            </button>
          </div>
          <div className="mh-title-wrap">
            <AnimatePresence mode="wait">
              {activeSection === 'home' ? (
                <motion.div key="name" className="mh-name"
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span className="mh-name-main">Sujith Thota</span>
                  <span className="mh-name-sub">Portfolio</span>
                </motion.div>
              ) : (
                <motion.div key={activeSection} className="mh-section-label"
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                >
                  {SECTION_LABELS[activeSection]}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="mh-right">
          {!isMobile && (
            <AnimatePresence mode="wait">
              <motion.button
                key={activeSection + (emailCopied ? '-copied' : '')}
                className={`mh-cta mh-cta--${cta.style}`}
                onClick={cta.action}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                whileTap={{ scale: 0.93 }}
              >
                <cta.icon size={13} />
                <span>{cta.label}</span>
              </motion.button>
            </AnimatePresence>
          )}
          {isMobile && (
            <>
              <DarkModeToggle />
              <SettingsDropdown />
            </>
          )}
        </div>
      </header>

      <ParticleCanvas />
      <Sidebar activeSection={activeSection} onNavClick={handleNavClick} />

      <main
        className="main-content"
        ref={scrollRef}
        onTouchStart={(e) => {
          handleTouchStart(e);
          handlePullTouchStart(e);
        }}
        onTouchMove={handlePullTouchMove}
        onTouchEnd={(e) => {
          handleTouchEnd(e);
          handlePullTouchEnd();
        }}
      >
        {/* Liquid Pull-To-Refresh Indicator */}
        {isMobile && (pullDist > 0 || isRefreshing) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: isRefreshing ? 48 : pullDist,
              transition: isRefreshing ? 'height 0.25s ease' : 'none',
              overflow: 'hidden',
              position: 'relative',
              zIndex: 100,
            }}
          >
            <motion.div
              animate={isRefreshing ? { rotate: 360 } : { scale: Math.min(1.1, pullDist / 55) }}
              transition={isRefreshing ? { repeat: Infinity, duration: 0.75, ease: 'linear' } : {}}
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: pullDist >= 55 || isRefreshing ? 'rgba(16,185,129,0.18)' : 'var(--bg-secondary)',
                border: `1.5px solid ${pullDist >= 55 || isRefreshing ? '#10b981' : 'var(--border-color)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: pullDist >= 55 || isRefreshing ? '#10b981' : 'var(--text-muted)',
                boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
              }}
            >
              <RefreshCw size={15} className={isRefreshing ? 'spinning' : ''} />
            </motion.div>
          </div>
        )}


        <div className="scroll-container">
          <AnimatePresence mode={isMobile ? "sync" : "wait"} initial={false} custom={slideDirection}>
            <motion.div
              key={activeSection}
              id={activeSection}
              custom={slideDirection}

              initial={isMobile ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}

              transition={isMobile ? mobileTransition : { duration: 0.25, ease: 'easeInOut' }}

              style={{
                width: '100%',
                minHeight: '100%',
                position: 'relative',
                willChange: 'transform',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              }}
              className={`text-content
                ${activeSection === 'home' ? ' home-content' : ''}
                ${['contact', 'education', 'about', 'skills', 'experience', 'projects', 'certifications'].includes(activeSection) ? ' wide-content' : ''}
              `}
            >
              <ErrorBoundary>
                <Suspense fallback={
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%', flexDirection: 'column', gap: 16 }}>
                    <div className="spinner" />
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading...</span>
                  </div>
                }>
                  <ActiveComponent onNavClick={handleNavClick} />
                </Suspense>
              </ErrorBoundary>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <WelcomeModal onNavClick={handleNavClick} />

      <SectionSpotlight
        section={spotlightSection}
        keyword={spotlightKeyword}
        onDismiss={() => { setSpotlightSection(null); setSpotlightKeyword(''); }}
      />

      {!isMobile && SECTION_HEADERS[activeSection] && (
        <div
          style={{
            position: 'fixed',
            top: '14px',
            left: '320px',
            zIndex: 1900,
            display: 'flex',
            flexDirection: 'column',
            pointerEvents: 'none',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}
            >
              <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.2px', lineHeight: 1.2 }}>
                {SECTION_HEADERS[activeSection].title}
              </span>
              <span style={{ fontSize: '11.5px', fontWeight: 500, color: 'var(--text-secondary)', lineHeight: 1.2 }}>
                {SECTION_HEADERS[activeSection].subtitle}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {!isMobile && <TimezoneStatus />}
      <ChatBot />
      <CommandPalette />
      <CommandPaletteModal />
      <SettingsSidebar />

      {isMobile && <MobileStatusPanel isOpen={isStatusOpen} onClose={() => setIsStatusOpen(false)} />}
      {isMobile && <MobileBottomNav activeSection={activeSection} onNavClick={handleNavClick} />}
    </div>
  );
}
