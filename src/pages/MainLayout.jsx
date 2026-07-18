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
  const [beaconOpen, setBeaconOpen] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const scrollRef = useRef(null);
  const beaconRef = useRef(null);

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

  // Close beacon popover when tapping outside
  useEffect(() => {
    if (!beaconOpen) return;
    const handleOutside = (e) => {
      if (beaconRef.current && !beaconRef.current.contains(e.target)) {
        setBeaconOpen(false);
      }
    };
    setTimeout(() => document.addEventListener('pointerdown', handleOutside), 0);
    return () => document.removeEventListener('pointerdown', handleOutside);
  }, [beaconOpen]);

  const handleNavClick = (id) => {
    setActiveSection(id);
    if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('sujithreddy1546@gmail.com');
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
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
          <div className="mh-beacon-wrap" ref={beaconRef}>
            <button
              className="mh-avatar-btn"
              onClick={() => setBeaconOpen(v => !v)}
              aria-label="Availability status"
            >
              <div className="mh-avatar-ring" />
              <img src="/profile_photo.png" alt="Sujith Thota" className="mh-avatar-img" />
            </button>

            {/* Popover tooltip */}
            <AnimatePresence>
              {beaconOpen && (
                <motion.div
                  className="mh-beacon-popover"
                  initial={{ opacity: 0, y: -6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span className="mh-beacon-dot" />
                  <div>
                    <p className="mh-popover-title">Available for work</p>
                    <p className="mh-popover-sub">Open to full-time &amp; internship roles</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
      <main className="main-content" ref={scrollRef}>
        <div className="scroll-container">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              id={activeSection}
              initial={
                pageTransition === 'slide' ? { opacity: 0, x: 50 } :
                pageTransition === 'scale' ? { opacity: 0, scale: 0.95 } :
                pageTransition === 'flip'  ? { opacity: 0, rotateY: 90 } :
                { opacity: 0, y: 8 } // Default fade
              }
              animate={
                pageTransition === 'slide' ? { opacity: 1, x: 0 } :
                pageTransition === 'scale' ? { opacity: 1, scale: 1 } :
                pageTransition === 'flip'  ? { opacity: 1, rotateY: 0 } :
                { opacity: 1, y: 0 }
              }
              exit={
                pageTransition === 'slide' ? { opacity: 0, x: -50 } :
                pageTransition === 'scale' ? { opacity: 0, scale: 1.05 } :
                pageTransition === 'flip'  ? { opacity: 0, rotateY: -90 } :
                { opacity: 0, y: -8 }
              }
              transition={{ 
                duration: pageTransition === 'flip' ? 0.4 : 0.25, 
                ease: "easeInOut" 
              }}
              style={{
                perspective: pageTransition === 'flip' ? '1000px' : 'none',
                transformStyle: pageTransition === 'flip' ? 'preserve-3d' : 'flat'
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

      {/* Mobile-only floating bottom tab capsule */}
      {isMobile && <MobileBottomNav activeSection={activeSection} onNavClick={handleNavClick} />}
    </div>
  );
}
