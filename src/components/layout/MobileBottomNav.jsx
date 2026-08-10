import { useState, useEffect, useRef } from 'react';
import { Home, Cpu, Briefcase, Mail, MoreHorizontal, GraduationCap, Award, FileText, Share, X, Moon, Sun, FileDown, Settings, ChevronLeft, ChevronDown, ChevronRight, Monitor, Bell, Wand2, Globe, Trash2, User, UserPlus, Copy, Check, MapPin, School, Sparkles, Atom, HelpCircle, Zap, BookOpen, Code2, ExternalLink, Star, Info, Navigation, Layers, Shield, Clock, Compass, RefreshCw } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { IconBolt, IconLayoutGrid } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLocalTime } from '../../hooks/useLocalTime';
import { useTheme } from '../../context/ThemeContext';
import { usePersona } from '../../context/PersonaContext';
import useRealtimeData, { globalDataCache, fetchPromises } from '../../hooks/useRealtimeData';
import WhatsNewPanel from '../widgets/WhatsNewPanel';
import AdvancedProfile from '../widgets/AdvancedProfile';
import haptic from '../../lib/haptics';

const sunPath = "M 12 8 C 14.2 8 16 9.8 16 12 C 16 14.2 14.2 16 12 16 C 9.8 16 8 14.2 8 12 C 8 9.8 9.8 8 12 8 Z M12 2v2 M12 20v2 M4.93 4.93l1.41 1.41 M17.66 17.66l1.41 1.41 M2 12h2 M20 12h2 M6.34 17.66l-1.41 1.41 M19.07 4.93l-1.41 1.41";
const moonPath = "M 12 3 C 16.97 3 21 7.03 21 12 C 21 16.97 16.97 21 12 21 C 14.5 17.5 16 14.5 16 12 C 16 9.5 14.5 6.5 12 3 Z M12 2v0 M12 20v0 M4.93 4.93l0 0 M17.66 17.66l0 0 M2 12h0 M20 12h0 M6.34 17.66l0 0 M19.07 4.93l0 0";

export default function MobileBottomNav({ activeSection, onNavClick }) {
  const { data: dbSettings } = useRealtimeData('site_settings', { single: true, filter: { column: 'id', value: 1 } });
  const navigate = useNavigate();

  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isUpdatesOpen, setIsUpdatesOpen] = useState(false);
  const [isGithubStatsOpen, setIsGithubStatsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [toast, setToast] = useState(null); // { label, prevValue, nextValue, undo }
  const [tapCount, setTapCount] = useState(0);

  // Real-Time Cloud Sync State inside More Drawer
  const [isSyncing, setIsSyncing] = useState(false);
  const [isFullReloading, setIsFullReloading] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState(() => Date.now());

  const handleSoftSync = () => {
    haptic.medium();
    setIsSyncing(true);
    Object.keys(globalDataCache).forEach((k) => delete globalDataCache[k]);
    Object.keys(fetchPromises).forEach((k) => delete fetchPromises[k]);
    window.dispatchEvent(new CustomEvent('pcms_force_refresh'));
    setTimeout(() => {
      setIsSyncing(false);
      setLastSyncedAt(Date.now());
      haptic.success();
    }, 550);
  };

  const handleFullWebsiteRefresh = async () => {
    haptic.success();
    setIsFullReloading(true);
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const r of regs) await r.unregister();
      }
      if ('caches' in window) {
        const names = await caches.keys();
        for (const n of names) await caches.delete(n);
      }
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('swr_cache_') || key.startsWith('cache_')) localStorage.removeItem(key);
      });
      Object.keys(globalDataCache).forEach((k) => delete globalDataCache[k]);
      Object.keys(fetchPromises).forEach((k) => delete fetchPromises[k]);
      window.dispatchEvent(new CustomEvent('pcms_force_refresh'));
    } catch (_) {}
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  const formatSyncTime = (timestamp) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 5) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };



  // PWA Install Prompt Listener
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      if (isIOS) {
        alert("To install the app on iOS, tap the Share icon and select 'Add to Home Screen'.");
      } else {
        alert("App is already installed or your browser doesn't support automatic installation. You can install it from your browser's menu.");
      }
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

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
    haptic.light();
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
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText('sujithreddy1546@gmail.com').then(() => {
        setCopiedEmail(true);
        playSound();
        setTimeout(() => setCopiedEmail(false), 1500);
      }).catch(() => { });
    } else {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 1500);
    }
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

    if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share sheet failed', err);
      }
    } else if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareData.url).catch(() => { });
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
    if (link.parentNode) link.parentNode.removeChild(link);
    URL.revokeObjectURL(url);
    setIsMoreOpen(false);
    triggerIsland({ title: 'vCard Downloaded', subtitle: 'Saved contact card', icon: <Check size={16} strokeWidth={3} />, color: '#10b981', duration: 2000 });
  };


  const announce = (label, prevValue, nextValue, undo) => {
    setToast({ label, prevValue, nextValue, undo });
    setTimeout(() => setToast(null), 4000);
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
    announce('Settings Export', 'State', 'Copied to Clipboard', () => { });
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

  const { getSectionOrder } = usePersona();

  const baseNavItems = [
    { id: 'home', label: 'Home', Icon: Home },
    { id: 'skills', label: 'Skills', Icon: IconBolt },
    { id: 'projects', label: 'Projects', Icon: IconLayoutGrid },
    { id: 'contact', label: 'Contact', Icon: Mail },
  ];
  const navItems = getSectionOrder(baseNavItems);

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
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0.05, bottom: 0.5 }}
            onDragEnd={(e, { offset, velocity }) => {
              if (offset.y > 100 || velocity.y > 400) {
                haptic.medium();
                setIsMoreOpen(false);
              }
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 380, mass: 0.8 }}
          >
            <div className="drawer-handle" />

            {/* Header: avatar + name + close */}
            <div className="drawer-header-profile">
              <img
                src="/profile_photo.png"
                alt="Sujith Thota"
                className="drawer-avatar"
              />
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
            <div className="drawer-scroll-area" style={{ padding: '0 14px 20px' }}>
              {/* ⚡ Live Cloud Diagnostics & Telemetry Bar */}
              <div style={{
                margin: '8px 0 14px',
                padding: '10px 12px',
                borderRadius: 16,
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                  <span style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: '#10b981',
                    boxShadow: '0 0 8px #10b981',
                    flexShrink: 0,
                  }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                    Live Sync
                  </span>
                  <span style={{ fontSize: 9.5, color: 'var(--text-muted)', background: 'var(--bg-primary)', padding: '1px 6px', borderRadius: 6, border: '1px solid var(--border-color)' }}>
                    ~18ms
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={handleSoftSync}
                    disabled={isSyncing}
                    style={{
                      padding: '5px 9px',
                      borderRadius: 8,
                      background: 'rgba(99,102,241,0.12)',
                      border: '1px solid rgba(99,102,241,0.25)',
                      color: 'var(--primary-blue, #6366f1)',
                      fontSize: 10.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <RefreshCw size={11} className={isSyncing ? 'spinning' : ''} />
                    <span>{isSyncing ? 'Syncing' : 'Soft Sync'}</span>
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={handleFullWebsiteRefresh}
                    disabled={isFullReloading}
                    style={{
                      padding: '5px 9px',
                      borderRadius: 8,
                      background: 'rgba(16,185,129,0.12)',
                      border: '1px solid rgba(16,185,129,0.25)',
                      color: '#10b981',
                      fontSize: 10.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <RefreshCw size={11} className={isFullReloading ? 'spinning' : ''} />
                    <span>{isFullReloading ? 'Reloading' : 'Hard Reload'}</span>
                  </motion.button>
                </div>
              </div>

              {/* Explore Navigation Row */}
              <p className="drawer-sections-label" style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '12px 0 8px' }}>
                <Compass size={13} style={{ color: 'var(--primary-blue)' }} />
                <span>EXPLORE</span>
              </p>
              <div className="drawer-explore-row">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => { haptic.light(); handleTabClick('education'); }}
                  className="drawer-explore-item"
                >
                  <div className="drawer-item-box"><GraduationCap size={17} /></div>
                  <span>Education</span>
                </motion.button>

                {dbSettings?.feature_experience !== false && (
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => { haptic.light(); handleTabClick('experience'); }}
                    className="drawer-explore-item"
                  >
                    <div className="drawer-item-box"><Briefcase size={17} /></div>
                    <span>Experience</span>
                  </motion.button>
                )}

                {dbSettings?.feature_certifications !== false && (
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => { haptic.light(); handleTabClick('certifications'); }}
                    className="drawer-explore-item"
                  >
                    <div className="drawer-item-box"><Award size={17} /></div>
                    <span>Certs</span>
                  </motion.button>
                )}

                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => { haptic.light(); playSound(); setIsGithubStatsOpen(true); setIsMoreOpen(false); }}
                  className="drawer-explore-item"
                >
                  <div className="drawer-item-box"><FaGithub size={17} /></div>
                  <span>GitHub</span>
                </motion.button>
              </div>

              <div className="drawer-divider" />

              {/* Feature Actions Grid */}
              <p className="drawer-sections-label" style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '12px 0 8px' }}>
                <Zap size={13} style={{ color: '#f59e0b' }} />
                <span>QUICK ACTIONS</span>
              </p>
              <div className="drawer-actions-grid">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => { haptic.light(); playSound(); setIsMoreOpen(false); window.dispatchEvent(new CustomEvent('open-chatbot')); }}
                  className="drawer-explore-item"
                >
                  <div className="drawer-item-box" style={{ color: '#06b6d4', background: 'rgba(6,182,212,0.12)', borderColor: 'rgba(6,182,212,0.25)' }}>
                    <Atom size={17} />
                  </div>
                  <span>Atom AI</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => { haptic.light(); triggerEvent('open-resume'); }}
                  className="drawer-explore-item"
                >
                  <div className="drawer-item-box" style={{ color: '#8b5cf6', background: 'rgba(139,92,246,0.12)', borderColor: 'rgba(139,92,246,0.25)' }}>
                    <FileText size={17} />
                  </div>
                  <span>Resume</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => { haptic.light(); handleDownloadVCard(); }}
                  className="drawer-explore-item"
                >
                  <div className="drawer-item-box" style={{ color: '#10b981', background: 'rgba(16,185,129,0.12)', borderColor: 'rgba(16,185,129,0.25)' }}>
                    <UserPlus size={17} />
                  </div>
                  <span>Contact</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => { haptic.light(); handleShare(); }}
                  className="drawer-explore-item"
                >
                  <div className="drawer-item-box" style={{ color: '#3b82f6', background: 'rgba(59,130,246,0.12)', borderColor: 'rgba(59,130,246,0.25)' }}>
                    <Share size={17} />
                  </div>
                  <span>Share</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => { haptic.light(); playSound(); handleInstallClick(); setIsMoreOpen(false); }}
                  className="drawer-explore-item"
                >
                  <div className="drawer-item-box" style={{ color: '#ec4899', background: 'rgba(236,72,153,0.12)', borderColor: 'rgba(236,72,153,0.25)' }}>
                    <FileDown size={17} />
                  </div>
                  <span>Install App</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => { haptic.light(); playSound(); setIsProfileOpen(true); setIsMoreOpen(false); }}
                  className="drawer-explore-item"
                >
                  <div className="drawer-item-box" style={{ color: '#6366f1', background: 'rgba(99,102,241,0.12)', borderColor: 'rgba(99,102,241,0.25)' }}>
                    <User size={17} />
                  </div>
                  <span>Profile</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => { haptic.light(); playSound(); window.dispatchEvent(new CustomEvent('open-all-settings')); setIsMoreOpen(false); }}
                  className="drawer-explore-item"
                >
                  <div className="drawer-item-box" style={{ color: '#64748b', background: 'rgba(100,116,139,0.12)', borderColor: 'rgba(100,116,139,0.25)' }}>
                    <Settings size={17} />
                  </div>
                  <span>Settings</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => { haptic.light(); playSound(); setIsMoreOpen(false); window.dispatchEvent(new CustomEvent('open-admin-login')); }}
                  className="drawer-explore-item"
                >
                  <div className="drawer-item-box" style={{ color: '#ef4444', background: 'rgba(239,68,68,0.12)', borderColor: 'rgba(239,68,68,0.25)' }}>
                    <Shield size={17} />
                  </div>
                  <span>Admin</span>
                </motion.button>
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
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.35 }}
              onDragEnd={(_, info) => { if (info.offset.y > 100 || info.velocity.y > 500) setIsGithubStatsOpen(false); }}
            >
              <div className="drawer-handle" />
              <div className="drawer-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <FaGithub size={18} style={{ color: 'var(--text-primary)' }} />
                  </div>
                  <div>
                    <p className="drawer-header-title">GitHub</p>
                    <p className="drawer-header-sub">@sujith1546</p>
                  </div>
                </div>
                <button className="drawer-close-btn" onClick={() => setIsGithubStatsOpen(false)}>
                  <X size={16} />
                </button>
              </div>

              <div className="drawer-scroll-area" style={{ padding: '16px 18px 28px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

                {/* Quick stats row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {[
                    { label: 'Repos', value: '15+' },
                    { label: 'Commits', value: '200+' },
                    { label: 'Stars', value: '10+' },
                  ].map(s => (
                    <div key={s.label} style={{
                      background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
                      borderRadius: 14, padding: '12px 10px', textAlign: 'center'
                    }}>
                      <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{s.value}</p>
                      <p style={{ margin: '2px 0 0', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Stats image — with loading + error states */}
                {(() => {
                  const themeParam = theme === 'dark' ? 'dark' : 'default';
                  const statsUrl = `https://github-readme-stats.vercel.app/api?username=sujith1546&show_icons=true&theme=${themeParam}&hide_border=true&rank_icon=github&include_all_commits=true`;
                  const langsUrl = `https://github-readme-stats.vercel.app/api/top-langs/?username=sujith1546&layout=compact&theme=${themeParam}&hide_border=true&langs_count=6`;
                  return (
                    <>
                      <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 16, overflow: 'hidden', minHeight: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img
                          src={statsUrl}
                          alt="GitHub Stats"
                          style={{ width: '100%', height: 'auto', display: 'block' }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div style={{ display: 'none', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 24, color: 'var(--text-secondary)' }}>
                          <FaGithub size={28} style={{ opacity: 0.3 }} />
                          <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>Stats unavailable right now</p>
                        </div>
                      </div>

                      <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 16, overflow: 'hidden', minHeight: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img
                          src={langsUrl}
                          alt="Top Languages"
                          style={{ width: '100%', height: 'auto', display: 'block' }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div style={{ display: 'none', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 24, color: 'var(--text-secondary)' }}>
                          <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>Languages unavailable</p>
                        </div>
                      </div>
                    </>
                  );
                })()}

                {/* Open profile button */}
                <a
                  href="https://github.com/sujith1546"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '14px', background: '#0f0f0f',
                    color: '#fff', borderRadius: 14, fontWeight: 700, fontSize: 14,
                    textDecoration: 'none', letterSpacing: '-0.01em',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.25)'
                  }}
                >
                  <FaGithub size={16} />
                  Open GitHub Profile
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
              <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid var(--border-color)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(59,130,246,0.1)',
                    border: '1px solid rgba(59,130,246,0.2)',
                    color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <HelpCircle size={18} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Help & Info</h3>
                    <p style={{ margin: '1px 0 0', fontSize: '9px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Portfolio Guide</p>
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
                        <div className="settings-row-icon" style={{ color: '#10b981', borderColor: 'rgba(16,185,129,0.2)', background: 'rgba(16,185,129,0.1)' }}>
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
                        <div className="settings-row-icon" style={{ color: '#8b5cf6', borderColor: 'rgba(139,92,246,0.2)', background: 'rgba(139,92,246,0.1)' }}>
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
                        <div className="settings-row-icon" style={{ color: '#3b82f6', borderColor: 'rgba(59,130,246,0.2)', background: 'rgba(59,130,246,0.1)' }}>
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
                        <div className="settings-row-icon" style={{ color: '#f59e0b', borderColor: 'rgba(245,158,11,0.2)', background: 'rgba(245,158,11,0.1)' }}>
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
                            • Swipe horizontally on some cards to reveal actions.<br />
                            • Use the <strong>More</strong> menu for deeper settings.<br />
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
              {isActive && (
                <motion.div
                  layoutId="mobileActiveTabPill"
                  className="nav-capsule-active-pill"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                />
              )}
              <motion.div
                animate={{ scale: isActive ? 1.16 : 1, y: isActive ? -1 : 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Icon size={18} aria-hidden="true" />
              </motion.div>
              <span>{label}</span>
            </motion.button>
          );
        })}

        {/* More Tab Trigger */}
        <motion.button
          ref={moreBtnRef}
          onClick={() => {
            haptic.medium();
            setIsMoreOpen(!isMoreOpen);
          }}
          className={`nav-capsule-tab${isMoreOpen ? ' nav-capsule-tab-active' : ''}`}
          aria-expanded={isMoreOpen}
          aria-haspopup="dialog"
          aria-label="More options menu"
          whileTap={{ scale: 0.85 }}
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
        >
          {isMoreOpen && (
            <motion.div
              layoutId="mobileActiveTabPill"
              className="nav-capsule-active-pill"
              transition={{ type: "spring", stiffness: 450, damping: 32 }}
            />
          )}
          <motion.div
            animate={{
              scale: isMoreOpen ? 1.16 : 1,
              y: isMoreOpen ? -1 : 0,
              rotate: isMoreOpen ? 90 : 0,
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {isMoreOpen ? <X size={18} aria-hidden="true" /> : <MoreHorizontal size={18} aria-hidden="true" />}
          </motion.div>
          <span>{isMoreOpen ? 'Close' : 'More'}</span>
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

