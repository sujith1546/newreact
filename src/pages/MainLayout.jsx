import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

export default function MainLayout() {
  const [activeSection, setActiveSection] = useState('home');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  const scrollRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleNavigate = (e) => {
      const section = e.detail?.section;
      if (section) {
        handleNavClick(section);
      }
    };
    window.addEventListener('navigate-section', handleNavigate);
    return () => window.removeEventListener('navigate-section', handleNavigate);
  }, []);

  const handleNavClick = (id) => {
    setActiveSection(id);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const activeSectionData = SECTIONS.find(s => s.id === activeSection);
  const ActiveComponent = activeSectionData ? activeSectionData.Component : Home;

  return (
    <div className="layout">
      {/* Mobile-only header bar */}
      <header className="mobile-top-header">
        <div className="mobile-header-left" onDoubleClick={() => window.dispatchEvent(new CustomEvent('open-qr'))}>
          <img src="/profile_photo.png" alt="Sujith Thota" />
          <h2>Sujith Thota</h2>
        </div>
        <div className="mobile-header-right">
          <TimezoneStatus />
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
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
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
