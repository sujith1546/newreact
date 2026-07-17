import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import WelcomeModal from '../components/WelcomeModal';
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
  const scrollRef = useRef(null);

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
      <ParticleCanvas />
      <Sidebar activeSection={activeSection} onNavClick={handleNavClick} />
      <main className="main-content" ref={scrollRef}>
        <div className="scroll-container">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className={`text-content${activeSection === 'home' ? ' home-content' : ''}${['contact','education','about','skills','experience','projects','certifications'].includes(activeSection) ? ' wide-content' : ''}`}
            >
              <ActiveComponent onNavClick={handleNavClick} />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <WelcomeModal onNavClick={handleNavClick} />
      
      <TimezoneStatus />
      <DarkModeToggle />
      <ChatBot />
      <CommandPalette />
    </div>
  );
}
