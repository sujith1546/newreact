import { useState, useRef, useEffect, useCallback } from 'react';
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
import { useTheme } from '../context/ThemeContext';

const SECTIONS = [
  { id: 'home', Component: Home },
  { id: 'about', Component: About },
  { id: 'skills', Component: Skills },
  { id: 'projects', Component: Projects },
  { id: 'education', Component: Education },
  { id: 'experience', Component: Experience },
  { id: 'certifications', Component: Certifications },
  { id: 'contact', Component: Contact },
];

// Section display labels
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

export default function MainLayout() {
  const { theme, pageTransition } = useTheme();
  const [activeSection, setActiveSection] = useState('home');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [slideDirection, setSlideDirection] = useState(0);
  const [emailCopied, setEmailCopied] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleNavigate = (e) => {
      const section = e.detail?.section;
      if (section) handleNavClick(section);
    };
    window.addEventListener('navigate-section', handleNavigate);
    return () => window.removeEventListener('navigate-section', handleNavigate);
  }, []);



  const handleNavClick = (id) => {
    const ALL_PAGES = ['home', 'skills', 'projects', 'education', 'experience', 'certifications', 'contact'];
    const currentIndex = ALL_PAGES.indexOf(activeSection);
    const nextIndex = ALL_PAGES.indexOf(id);
    
    if (currentIndex !== -1 && nextIndex !== -1) {
      setSlideDirection(nextIndex > currentIndex ? 1 : -1);
    } else {
      setSlideDirection(0);
    }

    setActiveSection(id);
    if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
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
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now()
    };
  };

  const handleTouchEnd = (e) => {
    if (!isMobile || !touchStartRef.current) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const dx = touchEndX - touchStartRef.current.x;
    const dy = touchEndY - touchStartRef.current.y;
    const dt = Date.now() - touchStartRef.current.time;

    // Detect fast horizontal swipe (distance > 50px, predominantly horizontal, under 500ms)
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 2 && dt < 500) {
      const SWIPE_PAGES = ['home', 'skills', 'projects', 'contact'];
      const currentIndex = SWIPE_PAGES.indexOf(activeSection);
      if (currentIndex !== -1) {
        if (dx < 0 && currentIndex < SWIPE_PAGES.length - 1) { // Swipe Left -> Next Page
          handleNavClick(SWIPE_PAGES[currentIndex + 1]);
        } else if (dx > 0 && currentIndex > 0) { // Swipe Right -> Prev Page
          handleNavClick(SWIPE_PAGES[currentIndex - 1]);
        }
      }
    }
    touchStartRef.current = null;
  };

  // Contextual CTA config per section
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

  const activeSectionData = SECTIONS.find(s => s.id === activeSection);
  const ActiveComponent = activeSectionData ? activeSectionData.Component : Home;

  return (
    <div className="layout">
      {/* ── Mobile top header — smart & animated ── */}
      <header className="mobile-top-header">

        {/* LEFT: avatar beacon + animated name/section title */}
        <div className="mh-left">
          {/* Availability beacon avatar */}
          <div className="mh-beacon-wrap">
            <button
              className="mh-avatar-btn"
              onClick={() => setIsStatusOpen(true)}
              aria-label="Availability status"
            >
              <div className="mh-avatar-ring" />
              <img src="/profile_photo.png" alt="Sujith Thota" className="mh-avatar-img" />
            </button>
          </div>

          {/* Animated section title */}
          <div className="mh-title-wrap">
            <AnimatePresence mode="wait">
              {activeSection === 'home' ? (
                <motion.div
                  key="name"
                  className="mh-name"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span className="mh-name-main">Sujith Thota</span>
                  <span className="mh-name-sub">Portfolio</span>
                </motion.div>
              ) : (
                <motion.div
                  key={activeSection}
                  className="mh-section-label"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                >
                  {SECTION_LABELS[activeSection]}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT: contextual CTA + theme toggle */}
        <div className="mh-right">
          {/* Contextual CTA — cross-fades on section change */}
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
          <AnimatePresence mode={isMobile ? "popLayout" : "wait"}>
            <motion.div
              key={activeSection}
              id={activeSection}
              initial={
                isMobile 
                  ? { 
                      opacity: slideDirection > 0 ? 1 : 0.6, 
                      x: slideDirection > 0 ? '100%' : '-15%', 
                      scale: slideDirection > 0 ? 1 : 0.92,
                      zIndex: slideDirection > 0 ? 2 : 1
                    } 
                  : (pageTransition === 'slide' ? { opacity: 0, x: 50 } :
                     pageTransition === 'scale' ? { opacity: 0, scale: 0.95 } :
                     pageTransition === 'flip'  ? { opacity: 0, rotateY: 90 } :
                     { opacity: 0, y: 8 })
              }
              animate={
                isMobile 
                  ? { 
                      opacity: 1, 
                      x: 0, 
                      scale: 1,
                      zIndex: 2
                    }
                  : (pageTransition === 'slide' ? { opacity: 1, x: 0 } :
                     pageTransition === 'scale' ? { opacity: 1, scale: 1 } :
                     pageTransition === 'flip'  ? { opacity: 1, rotateY: 0 } :
                     { opacity: 1, y: 0 })
              }
              exit={
                isMobile 
                  ? { 
                      opacity: slideDirection > 0 ? 0.6 : 1, 
                      x: slideDirection > 0 ? '-15%' : '100%', 
                      scale: slideDirection > 0 ? 0.92 : 1,
                      zIndex: slideDirection > 0 ? 1 : 2
                    }
                  : (pageTransition === 'slide' ? { opacity: 0, x: -50 } :
                     pageTransition === 'scale' ? { opacity: 1, scale: 1.05 } :
                     pageTransition === 'flip'  ? { opacity: 0, rotateY: -90 } :
                     { opacity: 0, y: -8 })
              }
              transition={{ 
                duration: isMobile ? 0.4 : (pageTransition === 'flip' ? 0.4 : 0.25), 
                ease: isMobile ? [0.16, 1, 0.3, 1] : "easeInOut" 
              }}
              style={{
                perspective: pageTransition === 'flip' ? '1000px' : 'none',
                transformStyle: pageTransition === 'flip' ? 'preserve-3d' : 'flat',
                width: isMobile ? 'calc(100% - 24px)' : '100%',
                height: isMobile ? 'calc(100% - 24px)' : '100%',
                position: isMobile ? 'absolute' : 'relative',
                top: isMobile ? '12px' : 0,
                left: isMobile ? '12px' : 0,
              }}
              className={`text-content${activeSection === 'home' ? ' home-content' : ''}${['contact','education','about','skills','experience','projects','certifications'].includes(activeSection) ? ' wide-content' : ''}`}
            >
              <ActiveComponent onNavClick={handleNavClick} />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <WelcomeModal onNavClick={handleNavClick} />
      
      {!isMobile && (
        <>
          <TimezoneStatus />
          <DarkModeToggle />
        </>
      )}
      <ChatBot />
      <CommandPalette />

      {/* Mobile System Health / Status Dropdown */}
      {isMobile && <MobileStatusPanel isOpen={isStatusOpen} onClose={() => setIsStatusOpen(false)} />}

      {/* Mobile-only floating bottom tab capsule */}
      {isMobile && <MobileBottomNav activeSection={activeSection} onNavClick={handleNavClick} />}
    </div>
  );
}
