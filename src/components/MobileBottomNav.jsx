import { useState, useEffect, useRef } from 'react';
import { Home, Cpu, Briefcase, Mail, MoreHorizontal, GraduationCap, Award, FileText, Share, X, Moon, Sun, FileDown, Settings, ChevronLeft, Monitor, Bell, Wand2, Globe, Trash2, User, Copy, Check, MapPin, School } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocalTime } from '../hooks/useLocalTime';
import { useTheme } from '../context/ThemeContext';

export default function MobileBottomNav({ activeSection, onNavClick }) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  // IntersectionObserver removed because we now render components dynamically instead of in a single scrolling feed.
  const localTime = useLocalTime();
  const { theme, toggleTheme, accentColor, setAccentColor, fontFamily, setFontFamily, uiAudio, setUiAudio, playSound } = useTheme();

  const drawerRef = useRef(null);
  const settingsRef = useRef(null);
  const profileRef = useRef(null);
  const moreBtnRef = useRef(null);

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
    playSound();
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

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('sujithreddy1546@gmail.com').then(() => {
      setCopiedEmail(true);
      playSound();
      setTimeout(() => setCopiedEmail(false), 1500);
    });
  };

  const handleExploreClick = (target) => {
    playSound();
    setIsProfileOpen(false);
    
    if (target === 'github') {
      window.open('https://github.com/sujith1546', '_blank');
      return;
    }
    
    onNavClick(target);
    setTimeout(() => {
      const el = document.getElementById(target);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
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
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
          >
            <div className="drawer-handle" />
            
            {/* Header info */}
            <div className="drawer-header-profile">
              <img src="/profile_photo.png" alt="Sujith Thota" className="drawer-avatar" />
              <div className="drawer-profile-info">
                <h4>Sujith Thota</h4>
                <div className="drawer-status-badge">
                  <span className="drawer-status-dot" />
                  <span>Available for opportunities</span>
                </div>
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
            
            {/* Explore Section */}
            <div className="drawer-section">
              <div className="drawer-sections-label">Explore</div>
              <div className="drawer-explore-row">
                <button onClick={() => handleTabClick('education')} className="drawer-explore-item">
                  <div className="drawer-item-box">
                    <GraduationCap size={20} />
                  </div>
                  <span>Education</span>
                </button>

                <button onClick={() => handleTabClick('experience')} className="drawer-explore-item">
                  <div className="drawer-item-box">
                    <Briefcase size={20} />
                  </div>
                  <span>Experience</span>
                </button>

                <button onClick={() => handleTabClick('certifications')} className="drawer-explore-item">
                  <div className="drawer-item-box">
                    <Award size={20} />
                  </div>
                  <span>Certificates</span>
                </button>

                <a href="https://github.com/sujith1546" target="_blank" rel="noopener noreferrer" className="drawer-explore-item">
                  <div className="drawer-item-box">
                    <FaGithub size={20} />
                  </div>
                  <span>GitHub</span>
                </a>
              </div>
            </div>

            {/* Actions Section */}
            <div className="drawer-section">
              <div className="drawer-sections-label">Actions</div>
              <div className="drawer-actions-list">
                <button onClick={() => triggerEvent('open-resume')} className="drawer-action-row-btn">
                  <FileDown size={18} />
                  <span>View resume</span>
                </button>
                <button onClick={handleShare} className="drawer-action-row-btn">
                  <Share size={18} />
                  <span>Share portfolio</span>
                </button>
                <button onClick={() => { playSound(); setIsProfileOpen(true); setIsMoreOpen(false); }} className="drawer-action-row-btn">
                  <User size={18} />
                  <span>Profile</span>
                </button>
                <button onClick={() => { playSound(); setIsSettingsOpen(true); setIsMoreOpen(false); }} className="drawer-action-row-btn">
                  <Settings size={18} />
                  <span>Settings</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Slide-In Drawer (Left) */}
      <AnimatePresence>
        {isProfileOpen && (
          <>
            <motion.div
              className="more-overlay-backdrop"
              style={{ zIndex: 102 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileOpen(false)}
            />
            <motion.div
              ref={profileRef}
              className="profile-overlay-sheet"
              role="dialog"
              aria-modal="true"
              aria-labelledby="profileTitle"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            >
              <div className="profile-header">
                <h3 id="profileTitle">My Profile</h3>
                <button 
                  className="profile-close-btn" 
                  onClick={() => setIsProfileOpen(false)}
                  aria-label="Close profile"
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </div>
              
              <div className="profile-content">
                <div className="profile-banner"></div>
                
                <div className="profile-identity">
                  <div className="avatar-row">
                    <div className="profile-avatar-square">
                      <img src="/profile_photo.png" alt="Sujith Thota" />
                    </div>
                    <div className="status-row">
                      <span className="status-dot"></span>
                      <span className="label">Available for work</span>
                    </div>
                  </div>

                  <p className="profile-name">Sujith Thota</p>
                  <p className="profile-title">Data Science and Full Stack Developer</p>

                  <div className="stats-row">
                    <div className="stat-tile">
                      <p className="value">8.7</p>
                      <p className="label">VIT CGPA</p>
                    </div>
                    <div className="stat-tile">
                      <p className="value">15+</p>
                      <p className="label">Certifications</p>
                    </div>
                    <div className="stat-tile">
                      <p className="value">5+</p>
                      <p className="label">ML projects</p>
                    </div>
                  </div>

                  <div className="detail-list">
                    <div className="detail-row">
                      <School size={15} aria-hidden="true" />
                      <span>B.Tech CSE, VIT University, Vellore</span>
                    </div>
                    <div className="detail-row">
                      <MapPin size={15} aria-hidden="true" />
                      <span>Vellore, India</span>
                    </div>
                    <div className="detail-row">
                      <Mail size={15} aria-hidden="true" />
                      <span className="email-link">sujithreddy1546@gmail.com</span>
                      {copiedEmail ? (
                        <Check size={13} className="copy-icon" style={{ color: '#10b981' }} />
                      ) : (
                        <Copy size={13} className="copy-icon" onClick={handleCopyEmail} aria-label="Copy email" />
                      )}
                    </div>
                  </div>

                  <div className="tag-row">
                    <span className="tag">Machine learning</span>
                    <span className="tag">Neural networks</span>
                    <span className="tag">Web apps</span>
                  </div>
                </div>

                <div className="explore-section">
                  <p className="section-label">Explore</p>
                  <div className="nav-list">
                    <button className="nav-item" onClick={() => handleExploreClick('experience')}>
                      <Briefcase size={15} aria-hidden="true" />
                      <span>Experience</span>
                    </button>
                    <button className="nav-item" onClick={() => handleExploreClick('certifications')}>
                      <Award size={15} aria-hidden="true" />
                      <span>Certificates</span>
                    </button>
                    <button className="nav-item" onClick={() => handleExploreClick('github')}>
                      <FaGithub size={15} aria-hidden="true" />
                      <span>GitHub</span>
                    </button>
                  </div>
                </div>

              </div>

              <div className="profile-footer">
                <button className="profile-resume-btn" onClick={() => { playSound(); setIsProfileOpen(false); triggerEvent('open-resume'); }}>
                  <FileText size={15} aria-hidden="true" />
                  View Resume
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Settings Slide-In Drawer */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            ref={settingsRef}
            className="settings-overlay-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Settings menu"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
          >
            <div className="settings-header">
              <button 
                className="settings-back-btn" 
                onClick={() => setIsSettingsOpen(false)}
                aria-label="Go back"
              >
                <ChevronLeft size={24} />
              </button>
              <h3>Settings</h3>
            </div>
            
            <div className="settings-content">
              
              <div className="settings-group">
                <span className="settings-group-label">Appearance</span>
                <div className="settings-card">
                  <div className="settings-row" onClick={() => { playSound(); toggleTheme(); }}>
                    <div className="settings-row-left">
                      <div className="settings-row-icon">
                        {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
                      </div>
                      <div className="settings-row-text">
                        <h4>Dark Mode</h4>
                        <p>Toggle dark or light theme</p>
                      </div>
                    </div>
                    <div className={`settings-toggle ${theme === 'dark' ? 'active' : ''}`}>
                      <div className="settings-toggle-knob" />
                    </div>
                  </div>
                  
                  <div className="settings-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
                    <div className="settings-row-text">
                      <h4>Accent Color</h4>
                      <p>Personalize the app color scheme</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      {['blue', 'purple', 'emerald', 'rose'].map(color => (
                        <div 
                          key={color}
                          onClick={() => { playSound(); setAccentColor(color); }}
                          style={{
                            width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer',
                            background: color === 'blue' ? '#007bff' : color === 'purple' ? '#8b5cf6' : color === 'emerald' ? '#10b981' : '#f43f5e',
                            border: accentColor === color ? '3px solid var(--text-primary)' : '2px solid transparent',
                            transform: accentColor === color ? 'scale(1.1)' : 'scale(1)',
                            transition: 'all 0.2s'
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="settings-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
                    <div className="settings-row-text">
                      <h4>Typography</h4>
                      <p>Change the app font style</p>
                    </div>
                    <div style={{ display: 'flex', width: '100%', background: 'var(--bg-secondary)', borderRadius: '10px', padding: '4px', border: '1px solid var(--border-color)' }}>
                      <button 
                        onClick={() => { playSound(); setFontFamily('modern'); }}
                        style={{ flex: 1, padding: '8px', border: 'none', background: fontFamily === 'modern' ? 'var(--bg-primary)' : 'transparent', borderRadius: '8px', color: 'var(--text-primary)', fontWeight: 600, fontSize: '13px', fontFamily: "'Inter', sans-serif" }}
                      >
                        Modern Sans
                      </button>
                      <button 
                        onClick={() => { playSound(); setFontFamily('developer'); }}
                        style={{ flex: 1, padding: '8px', border: 'none', background: fontFamily === 'developer' ? 'var(--bg-primary)' : 'transparent', borderRadius: '8px', color: 'var(--text-primary)', fontWeight: 600, fontSize: '13px', fontFamily: "'Fira Code', monospace" }}
                      >
                        Dev Mono
                      </button>
                    </div>
                  </div>

                </div>
              </div>

              <div className="settings-group">
                <span className="settings-group-label">Accessibility</span>
                <div className="settings-card">
                  <div className="settings-row" onClick={() => { playSound(); setReduceMotion(!reduceMotion); }}>
                    <div className="settings-row-left">
                      <div className="settings-row-icon">
                        <Wand2 size={16} />
                      </div>
                      <div className="settings-row-text">
                        <h4>Reduce Motion</h4>
                        <p>Disable heavy animations</p>
                      </div>
                    </div>
                    <div className={`settings-toggle ${reduceMotion ? 'active' : ''}`}>
                      <div className="settings-toggle-knob" />
                    </div>
                  </div>
                  
                  <div className="settings-row" onClick={() => { setUiAudio(!uiAudio); if(!uiAudio) { setTimeout(playSound, 50); } }}>
                    <div className="settings-row-left">
                      <div className="settings-row-icon">
                        <Bell size={16} />
                      </div>
                      <div className="settings-row-text">
                        <h4>UI Audio</h4>
                        <p>Sound effects on interactions</p>
                      </div>
                    </div>
                    <div className={`settings-toggle ${uiAudio ? 'active' : ''}`}>
                      <div className="settings-toggle-knob" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-group">
                <span className="settings-group-label">System</span>
                <div className="settings-card">
                  <div className="settings-row">
                    <div className="settings-row-left">
                      <div className="settings-row-icon">
                        <Globe size={16} />
                      </div>
                      <div className="settings-row-text">
                        <h4>Language</h4>
                        <p>English (US)</p>
                      </div>
                    </div>
                  </div>
                  <div className="settings-row" onClick={() => {
                    if(confirm("Are you sure you want to clear local data?")) {
                      localStorage.clear();
                      alert("Cache cleared successfully.");
                    }
                  }}>
                    <div className="settings-row-left">
                      <div className="settings-row-icon" style={{color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)'}}>
                        <Trash2 size={16} />
                      </div>
                      <div className="settings-row-text">
                        <h4 style={{color: '#ef4444'}}>Clear App Cache</h4>
                        <p>Free up local storage</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="settings-row" onClick={() => {
                    alert("To install: Tap the Share icon in Safari, then 'Add to Home Screen'.");
                  }}>
                    <div className="settings-row-left">
                      <div className="settings-row-icon" style={{color: '#0ea5e9', borderColor: 'rgba(14, 165, 233, 0.2)', background: 'rgba(14, 165, 233, 0.05)'}}>
                        <FileDown size={16} />
                      </div>
                      <div className="settings-row-text">
                        <h4 style={{color: '#0ea5e9'}}>Install App</h4>
                        <p>Add to Home Screen</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Nav Capsule */}
      <nav className="mobile-nav-capsule" role="navigation" aria-label="Mobile navigation">
        {navItems.map(({ id, label, Icon }) => {
          // Highlight based on the currently active section prop
          const isActive = activeSection === id && !isMoreOpen;
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
