import { useState, useEffect, useRef } from 'react';
import { Home, Cpu, Briefcase, Mail, MoreHorizontal, GraduationCap, Award, FileText, Share, X, Moon, Sun, FileDown, Settings, ChevronLeft, ChevronDown, ChevronRight, Monitor, Bell, Wand2, Globe, Trash2, User, UserPlus, Copy, Check, MapPin, School, Sparkles, Atom, HelpCircle, Zap, BookOpen, Code2, ExternalLink, Star, Info, Navigation, Layers, Shield, Clock } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { IconBolt, IconLayoutGrid } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocalTime } from '../hooks/useLocalTime';
import { useTheme } from '../context/ThemeContext';
import WhatsNewPanel from './WhatsNewPanel';
import AdvancedProfile from './AdvancedProfile';
import { updates } from '../data/updates';

const sunPath = "M 12 8 C 14.2 8 16 9.8 16 12 C 16 14.2 14.2 16 12 16 C 9.8 16 8 14.2 8 12 C 8 9.8 9.8 8 12 8 Z M12 2v2 M12 20v2 M4.93 4.93l1.41 1.41 M17.66 17.66l1.41 1.41 M2 12h2 M20 12h2 M6.34 17.66l-1.41 1.41 M19.07 4.93l-1.41 1.41";
const moonPath = "M 12 3 C 16.97 3 21 7.03 21 12 C 21 16.97 16.97 21 12 21 C 14.5 17.5 16 14.5 16 12 C 16 9.5 14.5 6.5 12 3 Z M12 2v0 M12 20v0 M4.93 4.93l0 0 M17.66 17.66l0 0 M2 12h0 M20 12h0 M6.34 17.66l0 0 M19.07 4.93l0 0";

export default function MobileBottomNav({ activeSection, onNavClick }) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isUpdatesOpen, setIsUpdatesOpen] = useState(false);
  const [isGithubStatsOpen, setIsGithubStatsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [toast, setToast] = useState(null); // { label, prevValue, nextValue, undo }
  const [tapCount, setTapCount] = useState(0);
  const [hasSettingsScrolled, setHasSettingsScrolled] = useState(false);
  const [isSettingsScrollable, setIsSettingsScrollable] = useState(false);

  // IntersectionObserver removed because we now render components dynamically instead of in a single scrolling feed.
  const localTime = useLocalTime();
  const { 
    theme, toggleTheme, 
    accentColor, setAccentColor, 
    fontFamily, setFontFamily, 
    uiAudio, setUiAudio,
    pageTransition, setPageTransition,
    playSound,
    notifyOnContact, setNotifyOnContact,
    photoAccent, setPhotoAccent,
    activePreset, setActivePreset,
    devMode, setDevMode,
    flags, setFlags,
    getAllPrefs, applyAllPrefs,
    applyPreset
  } = useTheme();

  const drawerRef = useRef(null);
  const settingsRef = useRef(null);
  const settingsContentRef = useRef(null);
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

  const handleDownloadVCard = () => {
    playSound();
    const vcard = `BEGIN:VCARD
VERSION:3.0
N:Thota;Sujith;;;
FN:Sujith Thota
TITLE:Data Science & Full Stack Developer
EMAIL;TYPE=PREFER,INTERNET:sujithreddy1546@gmail.com
URL:https://sujith-thota.vercel.app/
X-SOCIALPROFILE;TYPE=github:https://github.com/sujith1546
END:VCARD`;

    const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sujith_thota.vcf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsMoreOpen(false);
  };


  const announce = (label, prevValue, nextValue, undo) => {
    setToast({ label, prevValue, nextValue, undo });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    if (isSettingsOpen) {
      setHasSettingsScrolled(false);
      setIsSettingsScrollable(false);
      setTimeout(() => {
        if (settingsContentRef.current) {
          const { scrollHeight, clientHeight } = settingsContentRef.current;
          setIsSettingsScrollable(scrollHeight > clientHeight + 5);
        }
      }, 150);
    }
  }, [isSettingsOpen]);

  const handleSettingsScroll = (e) => {
    if (e.target.scrollTop > 10 && !hasSettingsScrolled) {
      setHasSettingsScrolled(true);
    }
  };

  const handleDarkModeToggle = (e) => {
    playSound();
    const prev = theme;
    const next = theme === 'dark' ? 'light' : 'dark';
    toggleTheme(e);
    announce('Dark Mode', prev === 'dark' ? 'On' : 'Off', next === 'dark' ? 'On' : 'Off', () => {
      toggleTheme();
    });
  };

  const handleAccentColorSelect = (color) => {
    playSound();
    const prev = accentColor;
    setAccentColor(color);
    announce('Accent Color', prev, color, () => {
      setAccentColor(prev);
    });
  };

  const handlePhotoAccentClick = () => {
    playSound();
    const img = document.getElementById('profile-avatar-img');
    if (!img) return;
    try {
      const color = extractDominantColor(img);
      const prev = accentColor;
      setPhotoAccent(color);
      setAccentColor(color);
      announce('Accent Color', prev, 'Photo Accent', () => {
        setAccentColor(prev);
      });
    } catch (e) {
      console.error(e);
      alert("Could not extract color. Make sure the profile image is fully loaded.");
    }
  };

  const handleFontSelect = (font) => {
    playSound();
    const prev = fontFamily;
    setFontFamily(font);
    announce('Typography', prev === 'modern' ? 'Modern' : 'Mono', font === 'modern' ? 'Modern' : 'Mono', () => {
      setFontFamily(prev);
    });
  };

  const handleNotifyToggle = () => {
    playSound();
    const prev = notifyOnContact;
    const next = !notifyOnContact;
    setNotifyOnContact(next);
    announce('Notifications', prev ? 'On' : 'Off', next ? 'On' : 'Off', () => {
      setNotifyOnContact(prev);
    });
  };

  const handleReduceMotionToggle = () => {
    playSound();
    const prev = reduceMotion;
    const next = !reduceMotion;
    setReduceMotion(next);
    announce('Reduce Motion', prev ? 'On' : 'Off', next ? 'On' : 'Off', () => {
      setReduceMotion(prev);
    });
  };

  const handleUiAudioToggle = () => {
    const prev = uiAudio;
    const next = !uiAudio;
    setUiAudio(next);
    if (next) setTimeout(playSound, 50);
    announce('UI Audio', prev ? 'On' : 'Off', next ? 'On' : 'Off', () => {
      setUiAudio(prev);
    });
  };

  const handleFlagToggle = (key, value) => {
    playSound();
    const nextFlags = { ...flags, [key]: !value };
    setFlags(nextFlags);
    announce(`Flag: ${key}`, value ? 'On' : 'Off', !value ? 'On' : 'Off', () => {
      setFlags(flags);
    });
  };

  const handleExportPrefs = () => {
    playSound();
    const json = JSON.stringify(getAllPrefs(), null, 2);
    navigator.clipboard.writeText(json);
    announce('Settings Export', 'State', 'Copied to Clipboard', () => {});
  };

  const handleImportPrefs = () => {
    playSound();
    const input = prompt('Paste your exported settings JSON:');
    if (!input) return;
    try {
      const parsed = JSON.parse(input);
      const prev = getAllPrefs();
      applyAllPrefs(parsed);
      announce('Settings Import', 'Custom Config', 'Restored', () => {
        applyAllPrefs(prev);
      });
    } catch (e) {
      alert('That JSON could not be read. Check it and try again.');
    }
  };

  const handleVersionTap = () => {
    playSound();
    const next = tapCount + 1;
    if (next >= 5) {
      setDevMode(true);
      setTapCount(0);
      announce('Dev Mode', 'Locked', 'Unlocked 🛠️', () => {
        setDevMode(false);
      });
    } else {
      setTapCount(next);
    }
  };

  const navItems = [
    { id: 'home', label: 'Home', Icon: Home },
    { id: 'skills', label: 'Skills', Icon: IconBolt },
    { id: 'projects', label: 'Projects', Icon: IconLayoutGrid },
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
            transition={{ type: 'spring', damping: 32, stiffness: 350, mass: 0.9 }}
          >
            <div className="drawer-handle" />

            {/* Header: avatar + name + close */}
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
                style={{ position: 'static', transform: 'none', marginLeft: 'auto' }}
                onClick={() => { setIsMoreOpen(false); moreBtnRef.current?.focus(); }}
                aria-label="Close menu"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="drawer-scroll-area">
              {/* Explore */}
              <p className="drawer-sections-label">Explore</p>
              <div className="drawer-explore-row">
                <button onClick={() => handleTabClick('education')} className="drawer-explore-item">
                  <div className="drawer-item-box"><GraduationCap size={20} /></div>
                  <span>Education</span>
                </button>
                <button onClick={() => handleTabClick('experience')} className="drawer-explore-item">
                  <div className="drawer-item-box"><Briefcase size={20} /></div>
                  <span>Experience</span>
                </button>
                <button onClick={() => handleTabClick('certifications')} className="drawer-explore-item">
                  <div className="drawer-item-box"><Award size={20} /></div>
                  <span>Certs</span>
                </button>
                <button onClick={() => { playSound(); setIsGithubStatsOpen(true); setIsMoreOpen(false); }} className="drawer-explore-item">
                  <div className="drawer-item-box"><FaGithub size={20} /></div>
                  <span>GitHub</span>
                </button>
                <button onClick={() => { playSound(); setIsMoreOpen(false); window.dispatchEvent(new CustomEvent('open-chatbot')); }} className="drawer-explore-item">
                  <div className="drawer-item-box" style={{ color: '#06b6d4', background: 'rgba(6,182,212,0.1)', borderColor: 'rgba(6,182,212,0.2)' }}><Atom size={20} /></div>
                  <span>Atom AI</span>
                </button>
              </div>

              <div className="drawer-divider" />

              {/* Actions */}
              <p className="drawer-sections-label">Actions</p>
              <div className="drawer-actions-list">
                <button onClick={() => triggerEvent('open-resume')} className="drawer-action-row-btn">
                  <FileDown size={17} /><span>Resume</span>
                </button>
                <button onClick={handleDownloadVCard} className="drawer-action-row-btn">
                  <UserPlus size={17} /><span>Save Contact</span>
                </button>
                <button onClick={handleShare} className="drawer-action-row-btn">
                  <Share size={17} /><span>Share</span>
                </button>
                <button onClick={() => { playSound(); setIsProfileOpen(true); setIsMoreOpen(false); }} className="drawer-action-row-btn">
                  <User size={17} /><span>Profile</span>
                </button>
                <button onClick={() => { playSound(); setIsUpdatesOpen(true); setIsMoreOpen(false); }} className="drawer-action-row-btn">
                  <Sparkles size={17} /><span>Updates</span>
                </button>
                <button onClick={() => { playSound(); setIsSettingsOpen(true); setIsMoreOpen(false); }} className="drawer-action-row-btn">
                  <Settings size={17} /><span>Settings</span>
                </button>
                <button onClick={() => { playSound(); setIsHelpOpen(true); setIsMoreOpen(false); }} className="drawer-action-row-btn">
                  <HelpCircle size={17} /><span>Help</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Slide-In Drawer (Left) */}
      <AdvancedProfile 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
        playSound={playSound}
        triggerEvent={triggerEvent}
        handleExploreClick={handleExploreClick}
      />

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
            transition={{ type: 'spring', damping: 32, stiffness: 350, mass: 0.9 }}
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
            
            <div className="settings-content" ref={settingsContentRef} onScroll={handleSettingsScroll} style={{ paddingBottom: '40px' }}>
              
              <div className="settings-group" style={{ marginTop: '16px' }}>
                <span className="settings-group-label">Appearance</span>
                <div className="settings-card">
                  <div className="settings-row" onClick={handleDarkModeToggle}>
                    <div className="settings-row-left">
                      <div className="settings-row-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.4s ease', transform: theme === 'dark' ? 'rotate(360deg)' : 'rotate(0deg)' }}>
                          <motion.path
                            initial={{ d: sunPath }}
                            animate={{ d: theme === 'dark' ? moonPath : sunPath }}
                            transition={{ duration: 0.4, ease: 'easeInOut' }}
                          />
                        </svg>
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
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      {['blue', 'purple', 'emerald', 'rose'].map(color => (
                        <div 
                          key={color}
                          onClick={() => handleAccentColorSelect(color)}
                          style={{
                            width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer',
                            background: color === 'blue' ? '#007bff' : color === 'purple' ? '#8b5cf6' : color === 'emerald' ? '#10b981' : '#f43f5e',
                            border: accentColor === color ? '3px solid var(--text-primary)' : '2px solid transparent',
                            transform: accentColor === color ? 'scale(1.1)' : 'scale(1)',
                            transition: 'all 0.2s'
                          }}
                        />
                      ))}
                      
                      {/* 5th swatch: dynamic color extraction */}
                      <button
                        className="accent-swatch accent-swatch--photo"
                        style={{
                          width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer',
                          background: photoAccent ?? 'conic-gradient(red, purple, blue, green, red)',
                          border: accentColor === photoAccent ? '3px solid var(--text-primary)' : '2px solid transparent',
                          transform: accentColor === photoAccent ? 'scale(1.1)' : 'scale(1)',
                          transition: 'all 0.2s',
                          padding: 0
                        }}
                        onClick={handlePhotoAccentClick}
                        aria-label="Use color from your photo"
                      />
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

                  <div className="settings-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
                    <div className="settings-row-text">
                      <h4>Page Transitions</h4>
                      <p>Advanced navigation animations</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', width: '100%' }}>
                      {[
                        { id: 'fade', label: 'Classic Fade' },
                        { id: 'slide', label: 'iOS Slide' },
                        { id: 'scale', label: 'Liquid Scale' },
                        { id: 'flip', label: '3D Flip' }
                      ].map(t => (
                        <button
                          key={t.id}
                          onClick={() => { playSound(); setPageTransition(t.id); }}
                          style={{
                            padding: '10px',
                            border: `1px solid ${pageTransition === t.id ? 'var(--primary-blue)' : 'var(--border-color)'}`,
                            background: pageTransition === t.id ? 'rgba(0, 123, 255, 0.08)' : 'var(--bg-primary)',
                            borderRadius: '10px',
                            color: pageTransition === t.id ? 'var(--primary-blue)' : 'var(--text-primary)',
                            fontWeight: 600,
                            fontSize: '12.5px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {/* Notifications Preferences Section (Tier 1.1) */}
              <div className="settings-group">
                <span className="settings-group-label">Notifications</span>
                <div className="settings-card">
                  <div className="settings-row" onClick={handleNotifyToggle}>
                    <div className="settings-row-left">
                      <div className="settings-row-text">
                        <h4>Confirmation Emails</h4>
                        <p>Send visitors a confirmation email on contact</p>
                      </div>
                    </div>
                    <div className={`settings-toggle ${notifyOnContact ? 'active' : ''}`}>
                      <div className="settings-toggle-knob" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-group">
                <span className="settings-group-label">Accessibility</span>
                <div className="settings-card">
                  <div className="settings-row" onClick={handleReduceMotionToggle}>
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
                  
                  <div className="settings-row" onClick={handleUiAudioToggle}>
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

              {/* Developer Panel (Tier 3.6) */}
              {devMode && (
                <div className="settings-group">
                  <span className="settings-group-label">Developer Mode</span>
                  <div className="settings-card">
                    {Object.entries(flags).map(([key, value]) => (
                      <div className="settings-row" key={key} onClick={() => handleFlagToggle(key, value)}>
                        <div className="settings-row-left">
                          <div className="settings-row-text">
                            <h4>{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                            <p>Toggle developer flag</p>
                          </div>
                        </div>
                        <div className={`settings-toggle ${value ? 'active' : ''}`}>
                          <div className="settings-toggle-knob" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                  
                  {/* JSON Export/Import Rows (Tier 3.8) */}
                  <div className="settings-row" onClick={handleExportPrefs}>
                    <div className="settings-row-left">
                      <div className="settings-row-icon">
                        <FileText size={16} />
                      </div>
                      <div className="settings-row-text">
                        <h4>Export Settings</h4>
                        <p>Copy preferences as JSON to clipboard</p>
                      </div>
                    </div>
                  </div>
                  <div className="settings-row" onClick={handleImportPrefs}>
                    <div className="settings-row-left">
                      <div className="settings-row-icon">
                        <Globe size={16} />
                      </div>
                      <div className="settings-row-text">
                        <h4>Import Settings</h4>
                        <p>Paste JSON string to restore preferences</p>
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

                  {/* Privacy Disclosure Row (Tier 1.2) */}
                  <div className="settings-row settings-row--info">
                    <div className="settings-row-left" style={{ gap: '10px' }}>
                      <div className="settings-row-text">
                        <h4 style={{ fontSize: '13.5px' }}>Privacy Disclosure</h4>
                        <p style={{ lineHeight: '1.4', fontSize: '11px', marginTop: '2px' }}>
                          Your preferences are stored only in this browser's local storage. Nothing is sent to a server.
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Version Footer (Tier 1.3) */}
              <div className="settings-version-footer" onClick={handleVersionTap} style={{ cursor: 'default', userSelect: 'none' }}>
                v1.4.0 · built with Vite + React
                {tapCount > 0 && tapCount < 5 && (
                  <span style={{ opacity: 0.5 }}> ({5 - tapCount} more to unlock dev options)</span>
                )}
              </div>

              {/* Scroll Indicator */}
              <AnimatePresence>
                {isSettingsScrollable && !hasSettingsScrolled && (
                  <motion.div 
                    className="settings-drawer-scroll-indicator"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      animate={{ y: [0, 6, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                    >
                      <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '2px' }}>Scroll</span>
                      <ChevronDown size={16} />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GitHub Stats Slide-Up Drawer */}
      <AnimatePresence>
        {isGithubStatsOpen && (
          <>
            <motion.div
              className="more-overlay-backdrop"
              style={{ zIndex: 102 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGithubStatsOpen(false)}
            />
            <motion.div
              className="more-overlay-sheet"
              style={{ zIndex: 103 }}
              role="dialog"
              aria-modal="true"
              aria-label="GitHub Stats"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 350, mass: 0.9 }}
            >
              <div className="drawer-handle" />
              <div className="drawer-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaGithub size={20} style={{ color: 'var(--text-primary)' }} />
                  <div>
                    <p className="drawer-header-title">GitHub Stats</p>
                    <p className="drawer-header-sub">sujith1546</p>
                  </div>
                </div>
                <button className="drawer-close-btn" onClick={() => setIsGithubStatsOpen(false)}>
                  <X size={16} />
                </button>
              </div>

              <div className="drawer-scroll-area" style={{ padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                {/* Live Stats Card */}
                <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '12px', display: 'flex', justifyContent: 'center' }}>
                  <img 
                    src={`https://github-readme-stats.vercel.app/api?username=sujith1546&show_icons=true&theme=transparent&hide_border=true&title_color=${theme === 'dark' ? 'fff' : '000'}&text_color=${theme === 'dark' ? 'ccc' : '333'}&icon_color=${theme === 'dark' ? '60a5fa' : '3b82f6'}`} 
                    alt="GitHub Stats"
                    style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                  />
                </div>

                {/* Top Languages Card */}
                <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '12px', display: 'flex', justifyContent: 'center' }}>
                  <img 
                    src={`https://github-readme-stats.vercel.app/api/top-langs/?username=sujith1546&layout=compact&theme=transparent&hide_border=true&title_color=${theme === 'dark' ? 'fff' : '000'}&text_color=${theme === 'dark' ? 'ccc' : '333'}`} 
                    alt="Top Languages"
                    style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                  />
                </div>

                <div style={{ flex: 1 }} />

                <a 
                  href="https://github.com/sujith1546" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    width: '100%', padding: '14px', background: 'var(--primary-blue)', 
                    color: '#fff', borderRadius: '14px', fontWeight: 600, fontSize: '14px',
                    textDecoration: 'none', marginTop: '10px'
                  }}
                >
                  View Full Profile <Share size={16} />
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Updates Slide-Up Drawer */}
      <WhatsNewPanel 
        open={isUpdatesOpen} 
        onClose={() => setIsUpdatesOpen(false)} 
        releases={updates} 
      />

      {/* Help Slide-Up Drawer */}
      <AnimatePresence>
        {isHelpOpen && (
          <>
            <motion.div 
              className="more-overlay-backdrop"
              style={{ zIndex: 102 }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsHelpOpen(false)}
            />
            <motion.div 
              className="more-overlay-sheet"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 350, mass: 0.9 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.35 }}
              onDragEnd={(_, info) => { if (info.offset.y > 100 || info.velocity.y > 500) setIsHelpOpen(false); }}
              style={{ zIndex: 103, display: 'flex', flexDirection: 'column', height: '88vh', maxHeight: '88dvh' }}
            >
              <div className="drawer-handle" />

              {/* Header */}
              <div style={{ padding: '16px 18px 14px', borderBottom: '1px solid var(--border-color)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '14px',
                    background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))',
                    border: '1px solid rgba(59,130,246,0.2)',
                    color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <HelpCircle size={22} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Help & Info</h3>
                    <p style={{ margin: '1px 0 0', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Portfolio Guide</p>
                  </div>
                </div>
                <button className="drawer-close-btn" onClick={() => setIsHelpOpen(false)}>
                  <X size={16} />
                </button>
              </div>

              {/* Scrollable Body - Matching the Apple-like mobile view */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '32px' }}>

                <div className="settings-group">
                  <span className="settings-group-label">About This App</span>
                  <div className="settings-card">
                    <div className="settings-row">
                      <div className="settings-row-left">
                        <div className="settings-row-icon" style={{color: '#10b981', borderColor: 'rgba(16,185,129,0.2)', background: 'rgba(16,185,129,0.1)'}}>
                          <Info size={16} />
                        </div>
                        <div className="settings-row-text">
                          <h4>Purpose</h4>
                          <p>Built for personal use and experimentation.</p>
                        </div>
                      </div>
                    </div>
                    <div className="settings-row">
                      <div className="settings-row-left">
                        <div className="settings-row-icon" style={{color: '#8b5cf6', borderColor: 'rgba(139,92,246,0.2)', background: 'rgba(139,92,246,0.1)'}}>
                          <User size={16} />
                        </div>
                        <div className="settings-row-text">
                          <h4>Developed By</h4>
                          <p>Sujith Thota</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="settings-group">
                  <span className="settings-group-label">Features & Integrations</span>
                  <div className="settings-card">
                    <div className="settings-row">
                      <div className="settings-row-left">
                        <div className="settings-row-icon" style={{color: '#3b82f6', borderColor: 'rgba(59,130,246,0.2)', background: 'rgba(59,130,246,0.1)'}}>
                          <Atom size={16} />
                        </div>
                        <div className="settings-row-text">
                          <h4>Atom AI</h4>
                          <p>Real LLM integration via Groq & Voyage AI.</p>
                        </div>
                      </div>
                    </div>
                    <div className="settings-row">
                      <div className="settings-row-left">
                        <div className="settings-row-icon" style={{color: '#f59e0b', borderColor: 'rgba(245,158,11,0.2)', background: 'rgba(245,158,11,0.1)'}}>
                          <Shield size={16} />
                        </div>
                        <div className="settings-row-text">
                          <h4>Security</h4>
                          <p>Enterprise-grade Rate Limiting & Bot Traps.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="settings-group">
                  <span className="settings-group-label">Navigation Tips</span>
                  <div className="settings-card">
                    <div className="settings-row">
                      <div className="settings-row-left">
                        <div className="settings-row-text">
                          <p style={{ lineHeight: '1.5', fontSize: '13px' }}>
                            • Swipe horizontally on some cards to reveal actions.<br/>
                            • Use the <strong>More</strong> menu for deeper settings.<br/>
                            • Tap the microphone in Chat to use Voice Commands.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ flex: 1 }} />

                {/* Close button */}
                <motion.button
                  onClick={() => setIsHelpOpen(false)}
                  whileTap={{ scale: 0.96 }}
                  style={{ 
                    width: '100%', padding: '16px',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)', borderRadius: '18px', fontWeight: 700, fontSize: '14.5px',
                    border: '1px solid var(--border-color)', cursor: 'pointer', letterSpacing: '-0.01em',
                    marginTop: 'auto',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
                  }}
                >
                  Got it, let's explore!
                </motion.button>
              </div>
            </motion.div>
          </>
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

      {/* Dynamic Island Notifications */}
      <div className="dynamic-island-wrapper">
        <AnimatePresence>
          {toast && (
            <motion.div
              className="dynamic-island"
              initial={{ opacity: 0, y: -20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.8 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              layout
            >
              <div className="dynamic-island-icon">
                <Bell size={14} />
              </div>
              <span className="dynamic-island-text">
                {toast.label}: {toast.prevValue} → {toast.nextValue}
              </span>
              <button
                className="dynamic-island-undo"
                onClick={() => {
                  toast.undo();
                  setToast(null);
                }}
              >
                Undo
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        /* Style configurations are declared globally in index.css as requested */
      `}</style>
    </>
  );
}

// >>> UTILS for dynamic color extraction and settings undo
function extractDominantColor(imgElement) {
  try {
    const canvas = document.createElement('canvas');
    const size = 50;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imgElement, 0, 0, size, size);

    const { data } = ctx.getImageData(0, 0, size, size);
    let r = 0, g = 0, b = 0, count = 0;

    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3];
      if (alpha < 200) continue; // skip transparent pixels
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      count++;
    }

    r = Math.round(r / count);
    g = Math.round(g / count);
    b = Math.round(b / count);

    return `rgb(${r}, ${g}, ${b})`;
  } catch (e) {
    console.error("Canvas sampling error", e);
    return '#007bff'; // fallback to standard blue
  }
}
