import { useState, useEffect, useRef } from 'react';
import { Home, Cpu, Briefcase, Mail, MoreHorizontal, GraduationCap, Award, FileText, Share, X, Moon, Sun, FileDown, Settings, ChevronLeft, ChevronDown, ChevronRight, Monitor, Bell, Wand2, Globe, Trash2, User, UserPlus, Copy, Check, MapPin, School, Sparkles, Atom, HelpCircle, Zap, BookOpen, Code2, ExternalLink, Star, Info, Navigation, Layers, Shield, Clock, Compass, RefreshCw, Lock } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { 
  IconHome, 
  IconBulb, 
  IconBriefcase, 
  IconMail, 
  IconDots, 
  IconX,
  IconSchool,
  IconAward,
  IconSparkles,
  IconBrandGithub,
  IconAtom,
  IconFileText,
  IconAddressBook,
  IconShare,
  IconDownload,
  IconUser,
  IconSettings,
  IconShieldLock
} from '@tabler/icons-react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLocalTime } from '../../hooks/useLocalTime';
import { useTheme } from '../../context/ThemeContext';
import { usePersona } from '../../context/PersonaContext';
import useRealtimeData, { globalDataCache, fetchPromises } from '../../hooks/useRealtimeData';
import useModuleStatus from '../../hooks/useModuleStatus';
import WhatsNewPanel from '../widgets/WhatsNewPanel';
import AdvancedProfile from '../widgets/AdvancedProfile';
import haptic from '../../lib/haptics';

const sunPath = "M 12 8 C 14.2 8 16 9.8 16 12 C 16 14.2 14.2 16 12 16 C 9.8 16 8 14.2 8 12 C 8 9.8 9.8 8 12 8 Z M12 2v2 M12 20v2 M4.93 4.93l1.41 1.41 M17.66 17.66l1.41 1.41 M2 12h2 M20 12h2 M6.34 17.66l-1.41 1.41 M19.07 4.93l-1.41 1.41";
const moonPath = "M 12 3 C 16.97 3 21 7.03 21 12 C 21 16.97 16.97 21 12 21 C 14.5 17.5 16 14.5 16 12 C 16 9.5 14.5 6.5 12 3 Z M12 2v0 M12 20v0 M4.93 4.93l0 0 M17.66 17.66l0 0 M2 12h0 M20 12h0 M6.34 17.66l0 0 M19.07 4.93l0 0";

export default function MobileBottomNav({ activeSection, onNavClick }) {
  const { data: dbSettings } = useRealtimeData('site_settings', { single: true, filter: { column: 'id', value: 1 } });
  const { isModuleEnabled, notifyModuleDisabled } = useModuleStatus();
  const navigate = useNavigate();
  const dragControls = useDragControls();

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
    { id: 'home', label: 'Home', Icon: IconHome },
    { id: 'skills', label: 'Skills', Icon: IconBulb },
    { id: 'projects', label: 'Work', Icon: IconBriefcase },
    { id: 'contact', label: 'Contact', Icon: IconMail },
  ];
  const navItems = getSectionOrder(baseNavItems);

  return (
    <>
      {/* More Bottom Sheet — Flat Advanced Version (All buttons, No scroll) */}
      <AnimatePresence>
        {isMoreOpen && (
          <div className="more-sheet-backdrop" onClick={() => setIsMoreOpen(false)}>
            <motion.div
              ref={drawerRef}
              className="more-sheet"
              role="dialog"
              aria-modal="true"
              aria-label="More options menu"
              onClick={(e) => e.stopPropagation()}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 380, mass: 0.8 }}
            >
              <div className="sheet-handle" />

              <div className="sheet-header">
                <div className="sheet-identity">
                  <img
                    src="/profile_photo.png"
                    alt="Sujith Thota"
                    className="sheet-avatar"
                  />
                  <div>
                    <p className="sheet-name">Sujith Thota</p>
                    <p className="sheet-status">
                      <span className="status-dot" />Available for opportunities
                    </p>
                  </div>
                </div>
                <button
                  className="sheet-close"
                  aria-label="Close"
                  onClick={() => setIsMoreOpen(false)}
                >
                  ✕
                </button>
              </div>

              <div className="sync-banner">
                <div className="sync-live">
                  <span className="pill-dot" />Live sync active
                </div>
                <div className="sync-actions">
                  <button className="sync-btn" onClick={handleSoftSync} disabled={isSyncing}>
                    {isSyncing ? 'Syncing...' : 'Soft sync'}
                  </button>
                  <button className="sync-btn" onClick={handleFullWebsiteRefresh} disabled={isFullReloading}>
                    {isFullReloading ? 'Reloading...' : 'Hard reload'}
                  </button>
                </div>
              </div>

              <p className="section-label">Explore sections</p>
              <div className="tile-grid">
                <button
                  className="tile"
                  onClick={() => { haptic.light(); handleTabClick('education'); }}
                  aria-label="Education"
                >
                  <IconSchool size={17} stroke={1.75} />
                  <span>Education</span>
                </button>

                <button
                  className="tile"
                  onClick={() => {
                    if (!isModuleEnabled('experience')) {
                      notifyModuleDisabled('experience');
                      return;
                    }
                    haptic.light();
                    handleTabClick('experience');
                  }}
                  aria-label="Experience"
                >
                  <IconBriefcase size={17} stroke={1.75} />
                  <span>Experience</span>
                </button>

                <button
                  className="tile"
                  onClick={() => {
                    if (!isModuleEnabled('certifications')) {
                      notifyModuleDisabled('certifications');
                      return;
                    }
                    haptic.light();
                    handleTabClick('certifications');
                  }}
                  aria-label="Certs"
                >
                  <IconAward size={17} stroke={1.75} />
                  <span>Certs</span>
                </button>

                <button
                  className="tile"
                  onClick={() => { haptic.light(); handleTabClick('moments'); }}
                  aria-label="Moments"
                >
                  <IconSparkles size={17} stroke={1.75} />
                  <span>Moments</span>
                </button>

                <button
                  className="tile"
                  onClick={() => { haptic.light(); playSound(); setIsGithubStatsOpen(true); setIsMoreOpen(false); }}
                  aria-label="GitHub"
                >
                  <IconBrandGithub size={17} stroke={1.75} />
                  <span>GitHub</span>
                </button>
              </div>

              <p className="section-label">Tools &amp; shortcuts</p>
              <div className="tile-grid">
                <button
                  className="tile"
                  onClick={() => { haptic.light(); playSound(); setIsMoreOpen(false); window.dispatchEvent(new CustomEvent('open-chatbot')); }}
                  aria-label="Atom AI"
                >
                  <IconAtom size={17} stroke={1.75} />
                  <span>Atom AI</span>
                </button>

                <button
                  className="tile"
                  onClick={() => { haptic.light(); triggerEvent('open-resume'); setIsMoreOpen(false); }}
                  aria-label="Resume"
                >
                  <IconFileText size={17} stroke={1.75} />
                  <span>Resume</span>
                </button>

                <button
                  className="tile"
                  onClick={() => { haptic.light(); handleDownloadVCard(); }}
                  aria-label="vCard"
                >
                  <IconAddressBook size={17} stroke={1.75} />
                  <span>vCard</span>
                </button>

                <button
                  className="tile"
                  onClick={() => { haptic.light(); handleShare(); }}
                  aria-label="Share"
                >
                  <IconShare size={17} stroke={1.75} />
                  <span>Share</span>
                </button>

                <button
                  className="tile"
                  onClick={() => { haptic.light(); playSound(); handleInstallClick(); setIsMoreOpen(false); }}
                  aria-label="Install App"
                >
                  <IconDownload size={17} stroke={1.75} />
                  <span>Install app</span>
                </button>

                <button
                  className="tile"
                  onClick={() => { haptic.light(); playSound(); setIsProfileOpen(true); setIsMoreOpen(false); }}
                  aria-label="Profile"
                >
                  <IconUser size={17} stroke={1.75} />
                  <span>Profile</span>
                </button>

                <button
                  className="tile"
                  onClick={() => { haptic.light(); playSound(); window.dispatchEvent(new CustomEvent('open-all-settings')); setIsMoreOpen(false); }}
                  aria-label="Settings"
                >
                  <IconSettings size={17} stroke={1.75} />
                  <span>Settings</span>
                </button>

                <button
                  className="tile"
                  onClick={() => { haptic.light(); playSound(); setIsMoreOpen(false); window.dispatchEvent(new CustomEvent('open-admin-login')); }}
                  aria-label="Admin"
                >
                  <IconShieldLock size={17} stroke={1.75} />
                  <span>Admin</span>
                </button>
              </div>
            </motion.div>
          </div>
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

      {/* Bottom Nav — Option 3: minimal underline tabs */}
      <nav className="bottom-nav mobile-nav-capsule" role="navigation" aria-label="Mobile navigation">
        {navItems.map(({ id, label, Icon }) => {
          // Highlight based on the currently active section prop
          const isActive = (activeSection === id || (id === 'projects' && activeSection === 'projects')) && !isMoreOpen;
          return (
            <button
              key={id}
              onClick={() => handleTabClick(id)}
              className={`nav-item nav-capsule-tab${isActive ? ' active nav-capsule-tab-active' : ''}`}
              aria-current={isActive ? "page" : undefined}
              aria-label={label}
            >
              {isActive && <div className="nav-item-indicator" />}
              <Icon size={19} stroke={1.75} aria-hidden="true" />
              <span>{label}</span>
            </button>
          );
        })}

        {/* More Tab Trigger */}
        <button
          ref={moreBtnRef}
          onClick={() => {
            haptic.medium();
            setIsMoreOpen(!isMoreOpen);
          }}
          className={`nav-item nav-capsule-tab${isMoreOpen ? ' active nav-capsule-tab-active' : ''}`}
          aria-expanded={isMoreOpen}
          aria-haspopup="dialog"
          aria-label="More options menu"
        >
          {isMoreOpen && <div className="nav-item-indicator" />}
          {isMoreOpen ? <IconX size={19} stroke={1.75} aria-hidden="true" /> : <IconDots size={19} stroke={1.75} aria-hidden="true" />}
          <span>{isMoreOpen ? 'Close' : 'More'}</span>
        </button>
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
        .bottom-nav {
          position: fixed !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          z-index: 9998 !important;
          height: 64px !important;
          background: #FFFFFF !important;
          border-top: 1px solid #E5E7EB !important;
          border-left: none !important;
          border-right: none !important;
          border-bottom: none !important;
          border-radius: 0 !important;
          display: flex !important;
          align-items: stretch !important;
          justify-content: space-around !important;
          padding: 0 4px !important;
          padding-bottom: env(safe-area-inset-bottom, 0px) !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          box-shadow: none !important;
          box-sizing: border-box !important;
        }

        [data-theme="dark"] .bottom-nav {
          background: #0d1117 !important;
          border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
        }

        .nav-item {
          flex: 1 !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 3px !important;
          position: relative !important;
          text-decoration: none !important;
          color: #9CA3AF !important;
          background: transparent !important;
          border: none !important;
          cursor: pointer !important;
          font-family: inherit !important;
          padding: 0 !important;
          outline: none !important;
          transition: color 0.15s ease !important;
          -webkit-tap-highlight-color: transparent !important;
        }

        [data-theme="dark"] .nav-item {
          color: #6B7280 !important;
        }

        .nav-item svg {
          font-size: 19px !important;
          width: 20px !important;
          height: 20px !important;
          stroke-width: 1.75 !important;
        }

        .nav-item span {
          font-size: 10px !important;
          line-height: 1 !important;
          font-weight: 400 !important;
          transition: color 0.15s ease, font-weight 0.15s ease !important;
        }

        .nav-item.active {
          color: #3B82F6 !important;
        }

        .nav-item.active span {
          font-weight: 500 !important;
          color: #3B82F6 !important;
        }

        .nav-item.active::before,
        .nav-item-indicator {
          content: "" !important;
          position: absolute !important;
          top: 0 !important;
          left: 20% !important;
          right: 20% !important;
          height: 2px !important;
          background: #3B82F6 !important;
          border-radius: 2px !important;
        }

        /* More Bottom Sheet — Flat Advanced Styles */
        .more-sheet-backdrop {
          position: fixed !important;
          inset: 0 !important;
          background: rgba(0, 0, 0, 0.45) !important;
          display: flex !important;
          align-items: flex-end !important;
          z-index: 10000 !important;
        }

        .more-sheet {
          width: 100% !important;
          background: #FFFFFF !important;
          border-top-left-radius: 24px !important;
          border-top-right-radius: 24px !important;
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.06) !important;
          padding: 10px 16px calc(14px + env(safe-area-inset-bottom, 8px)) !important;
          box-sizing: border-box !important;
          overflow: hidden !important;
        }

        [data-theme="dark"] .more-sheet {
          background: #0D1117 !important;
          border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
          box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.5) !important;
        }

        .sheet-handle {
          width: 36px !important;
          height: 4px !important;
          border-radius: 4px !important;
          background: #E5E7EB !important;
          margin: 0 auto 10px !important;
        }

        [data-theme="dark"] .sheet-handle {
          background: rgba(255, 255, 255, 0.15) !important;
        }

        .sheet-header {
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          margin-bottom: 10px !important;
        }

        .sheet-identity {
          display: flex !important;
          align-items: center !important;
          gap: 10px !important;
        }

        .sheet-avatar {
          width: 38px !important;
          height: 38px !important;
          border-radius: 50% !important;
          border: 1px solid #E5E7EB !important;
          object-fit: cover !important;
        }

        [data-theme="dark"] .sheet-avatar {
          border-color: rgba(255, 255, 255, 0.1) !important;
        }

        .sheet-name {
          font-weight: 600 !important;
          font-size: 14px !important;
          margin: 0 !important;
          color: #111827 !important;
          line-height: 1.2 !important;
        }

        [data-theme="dark"] .sheet-name {
          color: #F9FAFB !important;
        }

        .sheet-status {
          font-size: 11px !important;
          color: #6B7280 !important;
          margin: 0 !important;
          display: flex !important;
          align-items: center !important;
          gap: 4px !important;
          line-height: 1.2 !important;
        }

        [data-theme="dark"] .sheet-status {
          color: #9CA3AF !important;
        }

        .status-dot {
          width: 6px !important;
          height: 6px !important;
          border-radius: 50% !important;
          background: #22C55E !important;
          display: inline-block !important;
        }

        .sheet-close {
          width: 28px !important;
          height: 28px !important;
          border-radius: 50% !important;
          background: #F3F4F6 !important;
          border: none !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          color: #6B7280 !important;
          font-size: 13px !important;
          cursor: pointer !important;
        }

        [data-theme="dark"] .sheet-close {
          background: rgba(255, 255, 255, 0.08) !important;
          color: #D1D5DB !important;
        }

        .sync-banner {
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          background: #EFF6FF !important;
          border-radius: 12px !important;
          padding: 7px 12px !important;
          margin-bottom: 10px !important;
        }

        [data-theme="dark"] .sync-banner {
          background: rgba(59, 130, 246, 0.1) !important;
          border: 1px solid rgba(59, 130, 246, 0.2) !important;
        }

        .sync-live {
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          font-size: 12px !important;
          font-weight: 500 !important;
          color: #1D4ED8 !important;
        }

        [data-theme="dark"] .sync-live {
          color: #60A5FA !important;
        }

        .pill-dot {
          width: 8px !important;
          height: 8px !important;
          border-radius: 50% !important;
          background: #22C55E !important;
          display: inline-block !important;
        }

        .sync-actions {
          display: flex !important;
          gap: 6px !important;
        }

        .sync-btn {
          background: #FFFFFF !important;
          border: 1px solid #DBEAFE !important;
          color: #1D4ED8 !important;
          font-size: 10px !important;
          font-weight: 500 !important;
          padding: 3px 9px !important;
          border-radius: 16px !important;
          cursor: pointer !important;
        }

        [data-theme="dark"] .sync-btn {
          background: rgba(255, 255, 255, 0.08) !important;
          border-color: rgba(255, 255, 255, 0.15) !important;
          color: #93C5FD !important;
        }

        .section-label {
          font-size: 11px !important;
          font-weight: 600 !important;
          letter-spacing: 0.04em !important;
          color: #9CA3AF !important;
          text-transform: uppercase !important;
          margin: 0 0 6px !important;
          display: block !important;
        }

        .tile-grid {
          display: grid !important;
          grid-template-columns: repeat(4, 1fr) !important;
          gap: 6px !important;
          margin-bottom: 8px !important;
        }

        .tile {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 4px !important;
          background: #F9FAFB !important;
          border: 1px solid #F3F4F6 !important;
          border-radius: 12px !important;
          padding: 7px 4px !important;
          text-decoration: none !important;
          cursor: pointer !important;
          font-family: inherit !important;
          outline: none !important;
          -webkit-tap-highlight-color: transparent !important;
        }

        [data-theme="dark"] .tile {
          background: rgba(255, 255, 255, 0.04) !important;
          border-color: rgba(255, 255, 255, 0.08) !important;
        }

        .tile svg,
        .tile i {
          font-size: 17px !important;
          width: 18px !important;
          height: 18px !important;
          color: #3B82F6 !important;
          stroke-width: 1.75 !important;
        }

        .tile span {
          font-size: 10px !important;
          color: #4B5563 !important;
          text-align: center !important;
          line-height: 1.1 !important;
          font-weight: 400 !important;
        }

        [data-theme="dark"] .tile span {
          color: #9CA3AF !important;
        }
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

