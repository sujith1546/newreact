import React, { useState, useEffect, useRef } from 'react';
import { Home, Cpu, Briefcase, Mail, MoreHorizontal, GraduationCap, Clock, Award, FileText, QrCode, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocalTime } from '../hooks/useLocalTime';
import { useTheme } from '../context/ThemeContext';

export default function MobileBottomNav({ activeSection, onNavClick }) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [observedActive, setObservedActive] = useState('home');
  const localTime = useLocalTime();
  const { theme, toggleTheme } = useTheme();

  const drawerRef = useRef(null);
  const moreBtnRef = useRef(null);

  // IntersectionObserver to detect which section is currently active/visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setObservedActive(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-15% 0px -55% 0px',
        threshold: 0
      }
    );

    const ids = ['home', 'skills', 'projects', 'contact'];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [activeSection]); // Re-run when section mounts/unmounts

  // Keyboard accessibility and Focus trapping in More Drawer
  useEffect(() => {
    if (!isMoreOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMoreOpen(false);
        moreBtnRef.current?.focus();
      }

      if (e.key === 'Tab') {
        const focusableElements = drawerRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) { // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else { // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    // Auto-focus first focusable element inside the drawer
    setTimeout(() => {
      const firstBtn = drawerRef.current?.querySelector('button');
      firstBtn?.focus();
    }, 100);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMoreOpen]);

  const handleTabClick = (sectionId) => {
    onNavClick(sectionId);
    setIsMoreOpen(false);
    
    // Smooth scroll offset logic
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  };

  const triggerEvent = (eventName) => {
    window.dispatchEvent(new CustomEvent(eventName));
    setIsMoreOpen(false);
    moreBtnRef.current?.focus();
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Sujith Thota | Portfolio',
      text: 'Check out Sujith Thota\'s machine learning & full-stack developer portfolio!',
      url: window.location.origin
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share sheet failed', err);
      }
    } else {
      navigator.clipboard.writeText(shareData.url);
      alert('Link copied to clipboard!');
    }
  };

  const navItems = [
    { id: 'home', label: 'Home', Icon: Home },
    { id: 'skills', label: 'Skills', Icon: Cpu },
    { id: 'projects', label: 'Projects', Icon: Briefcase },
    { id: 'contact', label: 'Contact', Icon: Mail },
  ];

  return (
    <>
      {/* Translucent overlay backdrop */}
      <AnimatePresence>
        {isMoreOpen && (
          <motion.div
            className="more-overlay-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setIsMoreOpen(false);
              moreBtnRef.current?.focus();
            }}
          />
        )}
      </AnimatePresence>

      {/* Slide-up drawer sheet */}
      <AnimatePresence>
        {isMoreOpen && (
          <motion.div
            ref={drawerRef}
            className="more-overlay-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="More options navigation"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          >
            <div className="drawer-handle" />
            
            {/* Header info */}
            <div className="drawer-header-profile">
              <img src="/profile_photo.png" alt="Sujith Thota" className="drawer-avatar" />
              <div className="drawer-profile-info">
                <h4>Sujith Thota</h4>
                <p>Vellore, India · {localTime}</p>
              </div>
              <button 
                className="drawer-close-btn" 
                onClick={() => {
                  setIsMoreOpen(false);
                  moreBtnRef.current?.focus();
                }}
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>
            
            {/* Secondary Sections */}
            <div className="drawer-sections-label">SECONDARY SECTIONS</div>
            <div className="drawer-grid">
              <button onClick={() => handleTabClick('education')} className="drawer-item">
                <div className="drawer-icon-wrapper">
                  <GraduationCap size={20} />
                </div>
                <span>Education</span>
              </button>

              <button onClick={() => handleTabClick('experience')} className="drawer-item">
                <div className="drawer-icon-wrapper">
                  <Clock size={20} />
                </div>
                <span>Experience</span>
              </button>

              <button onClick={() => handleTabClick('certifications')} className="drawer-item">
                <div className="drawer-icon-wrapper">
                  <Award size={20} />
                </div>
                <span>Certificates</span>
              </button>
            </div>

            {/* Quick action buttons */}
            <div className="drawer-sections-label">ACTIONS</div>
            <div className="drawer-actions-row">
              <button onClick={() => triggerEvent('open-resume')} className="action-button-pill">
                <FileText size={16} />
                <span>View Resume</span>
              </button>
              <button onClick={handleShare} className="action-button-pill">
                <QrCode size={16} />
                <span>Share Portfolio</span>
              </button>
            </div>

            {/* Redundant theme toggle at the bottom */}
            <div className="drawer-theme-row">
              <span>Theme Preference</span>
              <button onClick={toggleTheme} className="drawer-theme-toggle-btn" aria-label="Toggle dark mode">
                {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Nav Capsule */}
      <nav className="mobile-nav-capsule" role="navigation" aria-label="Mobile navigation">
        {navItems.map(({ id, label, Icon }) => {
          // Highlight based on the IntersectionObserver observed active section
          const isActive = observedActive === id && !isMoreOpen;
          return (
            <motion.button
              key={id}
              onClick={() => handleTabClick(id)}
              className={`nav-capsule-tab${isActive ? ' nav-capsule-tab-active' : ''}`}
              aria-current={isActive ? "page" : undefined}
              aria-label={label}
              whileTap={{ scale: 0.85 }}
              transition={{ type: "spring", stiffness: 400, damping: 32 }}
            >
              {isActive && (
                <motion.div
                  layoutId="active-nav-pill"
                  className="nav-capsule-active-pill"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <Icon size={18} aria-hidden="true" />
              <span>{label}</span>
            </motion.button>
          );
        })}

        {/* More Tab Trigger */}
        <motion.button
          ref={moreBtnRef}
          onClick={() => setIsMoreOpen(!isMoreOpen)}
          className={`nav-capsule-tab${isMoreOpen ? ' nav-capsule-tab-active' : ''}`}
          aria-expanded={isMoreOpen}
          aria-haspopup="dialog"
          aria-label="More options menu"
          whileTap={{ scale: 0.85 }}
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
        >
          {isMoreOpen && (
            <motion.div
              layoutId="active-nav-pill"
              className="nav-capsule-active-pill"
              transition={{ type: "spring", stiffness: 400, damping: 32 }}
            />
          )}
          <MoreHorizontal size={18} aria-hidden="true" />
          <span>More</span>
        </motion.button>
      </nav>

      <style>{`
        /* Style configurations are declared globally in index.css as requested */
      `}</style>
    </>
  );
}
