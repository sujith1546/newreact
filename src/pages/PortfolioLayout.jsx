import React, { useState, useRef, useEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Mail, Briefcase, Check } from 'lucide-react';
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
  PerformanceHUD,
  LiveStateInspector,
  MobileStatusPanel,
  ParticleCanvas,
  SectionSpotlight
} from '../components';

import Home from './Home';
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
  { id: 'home',           Component: Home           },
  { id: 'about',          Component: About          },
  { id: 'skills',         Component: Skills         },
  { id: 'projects',       Component: Projects       },
  { id: 'education',      Component: Education      },
  { id: 'experience',     Component: Experience     },
  { id: 'certifications', Component: Certifications },
  { id: 'contact',        Component: Contact        },
];

const SECTION_LABELS = {
  home: null,
  about: 'About Me',
  skills: 'Skills & Expertise',
  projects: 'Featured Projects',
  education: 'Education',
  experience: 'Experience',
  certifications: 'Certifications',
  contact: 'Contact',
};

const NAV_DURATION = 0.45;
const NAV_EASE     = [0.22, 1, 0.36, 1];
const PROGRESS_DURATION = NAV_DURATION * 0.8;

const mobilePageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

let hasHandledInitialRefresh = false;

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

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Intelligently redirect to home page ONLY on full browser refresh (F5/Reload)
  useEffect(() => {
    if (!hasHandledInitialRefresh) {
      hasHandledInitialRefresh = true;
      const navEntry = performance.getEntriesByType?.('navigation')?.[0];
      const isReload = navEntry?.type === 'reload';

      if (isReload && location.pathname !== '/' && location.pathname !== '/home') {
        navigate('/home', { replace: true });
      }
    }
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

    const curIdx  = ALL_PAGES.indexOf(activeSection);
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
    navigator.clipboard.writeText('sujithreddy1546@gmail.com');
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };

  const touchStartRef = useRef(null);

  const handleTouchStart = (e) => {
    if (!isMobile) return;
    touchStartRef.current = {
      x:    e.touches[0].clientX,
      y:    e.touches[0].clientY,
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
        else if (dx > 0 && idx > 0)                  handleNavClick(SWIPE_PAGES[idx - 1]);
      }
    }
    touchStartRef.current = null;
  };

  const ctaMap = {
    home:           { label: 'Hire Me',    icon: Briefcase,  action: () => handleNavClick('contact'), style: 'accent' },
    about:          { label: 'Resume',     icon: FileText,   action: () => window.dispatchEvent(new CustomEvent('open-resume')), style: 'ghost' },
    skills:         { label: 'Resume',     icon: FileText,   action: () => window.dispatchEvent(new CustomEvent('open-resume')), style: 'ghost' },
    projects:       { label: 'GitHub',     icon: FaGithub,   action: () => window.open('https://github.com/sujith1546', '_blank'), style: 'ghost' },
    education:      { label: 'Resume',     icon: FileText,   action: () => window.dispatchEvent(new CustomEvent('open-resume')), style: 'ghost' },
    experience:     { label: 'Resume',     icon: FileText,   action: () => window.dispatchEvent(new CustomEvent('open-resume')), style: 'ghost' },
    certifications: { label: 'Resume',     icon: FileText,   action: () => window.dispatchEvent(new CustomEvent('open-resume')), style: 'ghost' },
    contact:        { label: emailCopied ? 'Copied!' : 'Copy Email', icon: emailCopied ? Check : Mail, action: handleCopyEmail, style: emailCopied ? 'success' : 'ghost' },
  };
  const cta = ctaMap[activeSection] || ctaMap.home;

  const ActiveComponent = SECTIONS.find(s => s.id === activeSection)?.Component ?? Home;

  const mobileTransition = {
    type:     'tween',
    ease:     NAV_EASE,
    duration: NAV_DURATION,
  };

  return (
    <div className="layout">
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
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="scroll-container">
          <AnimatePresence mode={isMobile ? "sync" : "wait"} initial={false} custom={slideDirection}>
            <motion.div
              key={activeSection}
              id={activeSection}
              custom={slideDirection}

              variants={isMobile ? mobilePageVariants : undefined}
              initial={isMobile ? 'initial' : { opacity: 0 }}
              animate={isMobile ? 'animate' : { opacity: 1 }}
              exit={isMobile ? 'exit' : { opacity: 0 }}

              transition={isMobile ? mobileTransition : { duration: 0.25, ease: 'easeInOut' }}

              style={{
                width:                     isMobile ? 'calc(100% - 24px)' : '100%',
                height:                    isMobile ? 'calc(100% - 24px)' : 'auto',
                position:                  isMobile ? 'absolute' : 'relative',
                top:                       isMobile ? '12px' : 0,
                left:                      isMobile ? '12px' : 0,
                willChange:                'transform',
                backfaceVisibility:        'hidden',
                WebkitBackfaceVisibility:  'hidden',
              }}
              className={`text-content
                ${activeSection === 'home' ? ' home-content' : ''}
                ${['contact','education','about','skills','experience','projects','certifications'].includes(activeSection) ? ' wide-content' : ''}
              `}
            >
              <Suspense fallback={
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
                  <div className="spinner"></div>
                </div>
              }>
                <ActiveComponent onNavClick={handleNavClick} />
              </Suspense>
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

      {!isMobile && <TimezoneStatus />}
      <ChatBot />
      <CommandPalette />
      <SettingsSidebar />
      <PerformanceHUD />
      <LiveStateInspector />

      {isMobile && <MobileStatusPanel isOpen={isStatusOpen} onClose={() => setIsStatusOpen(false)} />}
      {isMobile && <MobileBottomNav activeSection={activeSection} onNavClick={handleNavClick} />}
    </div>
  );
}
