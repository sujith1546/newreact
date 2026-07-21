import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Mail, Briefcase, Check } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import WelcomeModal from '../components/WelcomeModal';
import MobileBottomNav from '../components/MobileBottomNav';
import DarkModeToggle from '../components/DarkModeToggle';
import TimezoneStatus from '../components/TimezoneStatus';
import ChatBot from '../components/ChatBot';
import CommandPalette from '../components/CommandPalette';
import MobileStatusPanel from '../components/MobileStatusPanel';
import Home from '../pages/Home';
import About from '../pages/About';
import Skills from '../pages/Skills';
import Projects from '../pages/Projects';
import Education from '../pages/Education';
import Experience from '../pages/Experience';
import Certifications from '../pages/Certifications';
import Contact from '../pages/Contact';
import ParticleCanvas from '../components/ParticleCanvas';
import SectionSpotlight from '../components/SectionSpotlight';
import { useTheme } from '../context/ThemeContext';

const SECTIONS = [
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

const ALL_PAGES = [
  'home', 'about', 'skills', 'projects',
  'education', 'experience', 'certifications', 'contact'
];

// ─── Navigation timing ────────────────────────────────────────────────────────
// Apple UIKit NavigationController decelerate curve.
const NAV_DURATION = 0.34;
const NAV_EASE     = [0.32, 0.72, 0, 1];
const PROGRESS_DURATION = 0.3;

// ─── Page transition variants ─────────────────────────────────────────────────
// Using framer-motion's `custom` prop pattern so AnimatePresence can pass the
// CURRENT slideDirection to the exiting component's `exit` variant — even after
// the component has been removed from the React tree. Without this, the exit
// direction is stale from the previous render, causing the wrong-direction bug.
const mobilePageVariants = {
  initial: (dir) => ({
    x:       dir > 0 ? '100%' : dir < 0 ? '-100%' : 0,
    opacity: dir === 0 ? 0 : 1,
  }),
  animate: { x: 0, opacity: 1 },
  exit: (dir) => ({
    x:       dir > 0 ? '-100%' : dir < 0 ? '100%' : 0,
    opacity: dir === 0 ? 0 : 1,
  }),
};

export default function MainLayout() {
  const { theme, pageTransition } = useTheme();
  const [activeSection,    setActiveSection]    = useState('home');
  const [isMobile,         setIsMobile]         = useState(window.innerWidth <= 900);
  const [isStatusOpen,     setIsStatusOpen]      = useState(false);
  const [slideDirection,   setSlideDirection]   = useState(0); // 1=fwd, -1=back, 0=replace
  const [isNavActive,      setIsNavActive]      = useState(false); // drives progress bar
  const [emailCopied,      setEmailCopied]      = useState(false);
  const [spotlightSection, setSpotlightSection] = useState(null); // AI Screen Director
  const scrollRef   = useRef(null);
  const navTimerRef = useRef(null);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const onNavigate = (e) => {
      const { section, highlight } = e.detail || {};
      if (section) {
        handleNavClick(section);
        if (highlight) {
          // Small extra delay so the page transition starts before spotlight fires
          setTimeout(() => setSpotlightSection(section), 200);
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
    setActiveSection(id);
    if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: 'auto' });

    // Auto-dismiss progress bar after animation completes
    clearTimeout(navTimerRef.current);
    navTimerRef.current = setTimeout(() => setIsNavActive(false), 500);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('sujithreddy1546@gmail.com');
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };

  // ─── Swipe gesture ──────────────────────────────────────────────────────────
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

  // ─── Contextual CTA ─────────────────────────────────────────────────────────
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

  // ─── Mobile page transition variants ────────────────────────────────────────
  // The "seamless synchronized push" pattern:
  //   Both entering and exiting pages move at the exact same speed + easing.
  //   This makes them feel like a SINGLE physical surface sliding laterally —
  //   the same mechanic used in iOS UINavigationController.
  //
  //   Forward (dir=1):  entering slides in from right (+100%) → 0
  //                     exiting  slides out to the left  (0 → -100%)
  //
  //   Backward (dir=-1): entering slides in from left  (-100%) → 0
  //                      exiting  slides out to the right (0 → +100%)
  //
  //   Initial direction=0 (page load): simple cross-fade, no slide.
  //
  const mobileTransition = {
    type:     'tween',
    ease:     NAV_EASE,
    duration: NAV_DURATION,
  };

  // Desktop: honour the user-selected pageTransition from settings
  const getDesktopInitial = () => {
    if (pageTransition === 'slide') return { opacity: 0, x: 50 };
    if (pageTransition === 'scale') return { opacity: 0, scale: 0.96 };
    if (pageTransition === 'flip')  return { opacity: 0, rotateY: 90 };
    return { opacity: 0, y: 8 };
  };
  const getDesktopAnimate = () => {
    if (pageTransition === 'slide') return { opacity: 1, x: 0 };
    if (pageTransition === 'scale') return { opacity: 1, scale: 1 };
    if (pageTransition === 'flip')  return { opacity: 1, rotateY: 0 };
    return { opacity: 1, y: 0 };
  };
  const getDesktopExit = () => {
    if (pageTransition === 'slide') return { opacity: 0, x: -50 };
    if (pageTransition === 'scale') return { opacity: 1, scale: 1.04 };
    if (pageTransition === 'flip')  return { opacity: 0, rotateY: -90 };
    return { opacity: 0, y: -8 };
  };

  return (
    <div className="layout">

      {/* ── Navigation progress bar ──────────────────────────────────────────
          A thin accent-colored line that sweeps across below the header
          during every page navigation. Signature of premium apps. */}
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

      {/* ── Mobile top header ────────────────────────────────────────────── */}
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
          <DarkModeToggle />
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
              initial={isMobile ? 'initial' : getDesktopInitial()}
              animate={isMobile ? 'animate' : getDesktopAnimate()}
              exit={isMobile ? 'exit' : getDesktopExit()}

              transition={isMobile
                ? mobileTransition
                : { duration: pageTransition === 'flip' ? 0.4 : 0.25, ease: 'easeInOut' }
              }

              style={{
                perspective:               pageTransition === 'flip' ? '1000px' : 'none',
                transformStyle:            pageTransition === 'flip' ? 'preserve-3d' : 'flat',
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
                ${spotlightSection && spotlightSection === activeSection ? ' ai-highlighted' : ''}
              `}
            >
              <ActiveComponent onNavClick={handleNavClick} />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <WelcomeModal onNavClick={handleNavClick} />

      {/* ── AI Screen Director Spotlight ─────────────────────────────── */}
      <SectionSpotlight
        section={spotlightSection}
        onDismiss={() => setSpotlightSection(null)}
      />

      {!isMobile && (
        <>
          <TimezoneStatus />
          <DarkModeToggle />
        </>
      )}
      <ChatBot />
      <CommandPalette />

      {isMobile && <MobileStatusPanel isOpen={isStatusOpen} onClose={() => setIsStatusOpen(false)} />}
      {isMobile && <MobileBottomNav activeSection={activeSection} onNavClick={handleNavClick} />}
    </div>
  );
}
