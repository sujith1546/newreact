import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Home, Cpu, Briefcase, Mail, MoreHorizontal, GraduationCap, Award, FileText, Share, X, Moon, Sun, FileDown, Settings, ChevronLeft, ChevronDown, ChevronRight, Monitor, Bell, Wand2, Globe, Trash2, User, UserPlus, Copy, Check, MapPin, School, Sparkles, Atom, HelpCircle, Zap, BookOpen, Code2, ExternalLink, Star, Info, Navigation, Layers, Shield, Clock, Compass, RefreshCw, Lock, GitCommit, GitBranch, ArrowUpRight, Activity, CheckCircle2, Loader2 } from 'lucide-react';
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
  const githubDragControls = useDragControls();

  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isUpdatesOpen, setIsUpdatesOpen] = useState(false);
  const [isGithubStatsOpen, setIsGithubStatsOpen] = useState(false);

  // GitHub Commits & Live Activity State
  const [ghCommits, setGhCommits] = useState([
    {
      sha: 'e36daa7',
      message: 'fix(mobile): resolve Framer Motion touch gestures & smooth bottom sheet',
      date: '2026-08-03T11:20:00Z',
      url: 'https://github.com/sujith1546/newreact'
    },
    {
      sha: '9f46d3b',
      message: 'feat: mobile UI optimizations, Dynamic Island polish & Bento metrics',
      date: '2026-08-03T09:45:00Z',
      url: 'https://github.com/sujith1546/newreact'
    },
    {
      sha: '766e710',
      message: 'refactor: simplify dashboard panels and enhance skills radar animations',
      date: '2026-08-02T18:15:00Z',
      url: 'https://github.com/sujith1546/newreact'
    },
    {
      sha: '39b49ca',
      message: 'perf: core theme tokens, responsive carousels and offline PWA cache',
      date: '2026-08-02T14:10:00Z',
      url: 'https://github.com/sujith1546/newreact'
    }
  ]);
  const [ghLoading, setGhLoading] = useState(false);

  useEffect(() => {
    if (!isGithubStatsOpen) return;
    let active = true;
    setGhLoading(true);
    fetch('https://api.github.com/users/sujith1546/events/public', {
      headers: { Accept: 'application/vnd.github.v3+json' }
    })
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(events => {
        if (!active || !Array.isArray(events)) return;
        const pushEvents = events.filter(e => e.type === 'PushEvent');
        const live = [];
        pushEvents.forEach(pe => {
          if (pe.payload && pe.payload.commits) {
            pe.payload.commits.forEach(c => {
              live.push({
                sha: c.sha ? c.sha.substring(0, 7) : 'head',
                message: c.message || 'Updated codebase',
                date: pe.created_at,
                url: `https://github.com/${pe.repo ? pe.repo.name : 'sujith1546/newreact'}/commit/${c.sha}`
              });
            });
          }
        });
        if (live.length > 0) setGhCommits(live.slice(0, 5));
      })
      .catch(() => {})
      .finally(() => { if (active) setGhLoading(false); });

    return () => { active = false; };
  }, [isGithubStatsOpen]);

  const formatGhTimeAgo = (dateStr) => {
    if (!dateStr) return 'recently';
    const diffSec = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diffSec < 60) return `${Math.max(1, diffSec)}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay}d ago`;
  };
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

      {/* ── GITHUB STATS & COMMITS SLIDE-UP SHEET (Mobile Only Portal) ── */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isGithubStatsOpen && (
            <div style={{ position: 'relative', zIndex: 99999 }}>
              <motion.div
                className="gh-sheet-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                onClick={() => setIsGithubStatsOpen(false)}
              />
              <motion.div
                className="gh-sheet"
                role="dialog"
                aria-modal="true"
                aria-label="GitHub Profile & Activity"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%', transition: { duration: 0.22, ease: [0.32, 0.72, 0, 1] } }}
                transition={{ type: 'spring', damping: 30, stiffness: 320, mass: 0.85 }}
                drag="y"
                dragControls={githubDragControls}
                dragListener={false}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: 0.5 }}
                onDragEnd={(_, info) => {
                  if (info.offset.y > 100 || info.velocity.y > 500) setIsGithubStatsOpen(false);
                }}
              >
                {/* Dedicated Touch Handle Bar */}
                <div
                  className="gh-sheet-handle-bar"
                  onPointerDown={(e) => githubDragControls.start(e)}
                >
                  <div className="gh-sheet-handle" />
                </div>

                {/* Header (also draggable) */}
                <div
                  className="gh-sheet-header"
                  onPointerDown={(e) => {
                    if (!e.target.closest('.gh-sheet-close')) {
                      githubDragControls.start(e);
                    }
                  }}
                >
                  <div className="gh-sheet-header-left">
                    <div className="gh-sheet-header-icon">
                      <FaGithub size={17} />
                    </div>
                    <div className="gh-sheet-title">
                      <h3>GitHub Activity</h3>
                      <p>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                        @sujith1546 · Public Activity
                      </p>
                    </div>
                  </div>
                  <button
                    className="gh-sheet-close"
                    onClick={() => setIsGithubStatsOpen(false)}
                    aria-label="Close GitHub sheet"
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* Body / Scroll Area */}
                <div className="gh-sheet-body">
                  <div className="gh-sheet-content">

                    {/* Hero Identity Card */}
                    <div className="gh-hero-card">
                      <div className="gh-hero-avatar-wrap">
                        <img src="/IMG_0322.jpg" alt="Sujith Thota" className="gh-hero-avatar" />
                        <span className="gh-hero-live-badge" />
                      </div>
                      <div className="gh-hero-info">
                        <div className="gh-hero-name-row">
                          <span className="gh-hero-name">Sujith Thota</span>
                          <span className="gh-hero-tag">@sujith1546</span>
                        </div>
                        <p className="gh-hero-bio">Full-Stack &amp; AI Engineer · Building reactive web apps</p>
                        <div className="gh-hero-meta">
                          <span className="gh-meta-pill">
                            <GitBranch size={10} style={{ color: '#10b981' }} />
                            main branch active
                          </span>
                          <span className="gh-meta-pill">
                            <Activity size={10} style={{ color: '#3b82f6' }} />
                            Public activity
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bento Stats Grid */}
                    <div className="gh-bento-grid">
                      <div className="gh-bento-card gh-bento-blue">
                        <div className="gh-bento-head">
                          <span className="gh-bento-label">Repositories</span>
                          <Code2 size={13} />
                        </div>
                        <span className="gh-bento-val">15+</span>
                        <span className="gh-bento-sub">Public repos</span>
                      </div>

                      <div className="gh-bento-card gh-bento-amber">
                        <div className="gh-bento-head">
                          <span className="gh-bento-label">Contributions</span>
                          <GitCommit size={13} />
                        </div>
                        <span className="gh-bento-val">200+</span>
                        <span className="gh-bento-sub">Yearly commits</span>
                      </div>

                      <div className="gh-bento-card gh-bento-purple">
                        <div className="gh-bento-head">
                          <span className="gh-bento-label">Earned Stars</span>
                          <Star size={13} />
                        </div>
                        <span className="gh-bento-val">10+</span>
                        <span className="gh-bento-sub">Community stars</span>
                      </div>

                      <div className="gh-bento-card gh-bento-green">
                        <div className="gh-bento-head">
                          <span className="gh-bento-label">Pipeline Status</span>
                          <CheckCircle2 size={13} />
                        </div>
                        <span className="gh-bento-val">100%</span>
                        <span className="gh-bento-sub">CI/CD passing</span>
                      </div>
                    </div>

                    {/* Live Commits List */}
                    <div className="gh-section-box">
                      <div className="gh-section-box-header">
                        <div className="gh-section-box-title">
                          <GitCommit size={12} style={{ color: '#3b82f6' }} />
                          <span>Recent Commits &amp; Activity</span>
                        </div>
                        {ghLoading && <Loader2 size={12} className="spin" style={{ color: 'var(--text-muted)' }} />}
                      </div>

                      <div className="gh-commits-list">
                        {ghCommits.map((c, idx) => (
                          <a
                            key={c.sha || idx}
                            href={c.url || `https://github.com/sujith1546/newreact/commit/${c.sha}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="gh-commit-row"
                          >
                            <div className="gh-commit-left">
                              <span className="gh-commit-sha">{c.sha}</span>
                              <span className="gh-commit-msg">{c.message}</span>
                            </div>
                            <div className="gh-commit-right">
                              <span className="gh-commit-time">{formatGhTimeAgo(c.date)}</span>
                              <ArrowUpRight size={11} className="gh-commit-arrow" />
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>

                    {/* Primary Tech Stack Breakdown */}
                    <div className="gh-section-box">
                      <div className="gh-section-box-header">
                        <div className="gh-section-box-title">
                          <Zap size={12} style={{ color: '#f59e0b' }} />
                          <span>Primary Language Breakdown</span>
                        </div>
                        <span className="gh-stack-count">4 core languages</span>
                      </div>

                      <div className="gh-stack-bar">
                        <div style={{ width: '42%', background: '#3b82f6' }} title="Python 42%" />
                        <div style={{ width: '34%', background: '#f59e0b' }} title="JavaScript 34%" />
                        <div style={{ width: '15%', background: '#8b5cf6' }} title="TypeScript 15%" />
                        <div style={{ width: '9%', background: '#10b981' }} title="HTML/CSS 9%" />
                      </div>

                      <div className="gh-stack-legend">
                        <span className="gh-legend-item"><span className="gh-legend-dot" style={{ background: '#3b82f6' }} />Python 42%</span>
                        <span className="gh-legend-item"><span className="gh-legend-dot" style={{ background: '#f59e0b' }} />JavaScript 34%</span>
                        <span className="gh-legend-item"><span className="gh-legend-dot" style={{ background: '#8b5cf6' }} />TypeScript 15%</span>
                        <span className="gh-legend-item"><span className="gh-legend-dot" style={{ background: '#10b981' }} />HTML/CSS 9%</span>
                      </div>
                    </div>

                    {/* Action CTA Buttons */}
                    <div className="gh-actions-row">
                      <a
                        href="https://github.com/sujith1546"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="gh-action-primary"
                      >
                        <FaGithub size={15} />
                        <span>Open GitHub Profile</span>
                        <ExternalLink size={13} style={{ marginLeft: 'auto', opacity: 0.8 }} />
                      </a>

                      <a
                        href="https://github.com/sujith1546/newreact"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="gh-action-secondary"
                      >
                        <Code2 size={14} />
                        <span>Portfolio Code</span>
                        <ArrowUpRight size={13} style={{ marginLeft: 'auto', opacity: 0.8 }} />
                      </a>
                    </div>

                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}


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

        /* ════════ GITHUB SLIDE-UP BOTTOM SHEET ════════ */
        .gh-sheet-backdrop {
          position: fixed !important;
          inset: 0 !important;
          background: rgba(0, 0, 0, 0.55) !important;
          backdrop-filter: blur(12px) !important;
          -webkit-backdrop-filter: blur(12px) !important;
          z-index: 99998 !important;
        }

        .gh-sheet {
          position: fixed !important;
          bottom: 0 !important;
          left: 0 !important;
          right: 0 !important;
          width: 100% !important;
          z-index: 99999 !important;
          background: #FFFFFF !important;
          border-top: 1.5px solid var(--border-color, #E2E8F0) !important;
          border-top-left-radius: 24px !important;
          border-top-right-radius: 24px !important;
          box-shadow: 0 -16px 48px rgba(0, 0, 0, 0.28), 0 -1px 0 rgba(255, 255, 255, 0.08) !important;
          display: flex !important;
          flex-direction: column !important;
          max-height: min(84dvh, 720px) !important;
          min-height: 52dvh !important;
          touch-action: pan-y !important;
          box-sizing: border-box !important;
          overflow: hidden !important;
        }

        [data-theme="dark"] .gh-sheet {
          background: #161B22 !important;
          border-top-color: rgba(255, 255, 255, 0.14) !important;
          box-shadow: 0 -18px 50px rgba(0, 0, 0, 0.65), 0 -1px 0 rgba(255, 255, 255, 0.1) !important;
        }

        .gh-sheet-handle-bar {
          width: 100% !important;
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          padding: 10px 0 6px !important;
          cursor: grab !important;
          touch-action: none !important;
          user-select: none !important;
          -webkit-user-select: none !important;
        }
        .gh-sheet-handle-bar:active { cursor: grabbing !important; }

        .gh-sheet-handle {
          width: 38px !important;
          height: 4.5px !important;
          border-radius: 999px !important;
          background: var(--border-color, #CBD5E1) !important;
          transition: background 0.2s ease, transform 0.2s ease !important;
        }
        .gh-sheet-handle-bar:active .gh-sheet-handle {
          transform: scaleX(1.15) !important;
          background: var(--primary-blue, #3B82F6) !important;
        }
        [data-theme="dark"] .gh-sheet-handle {
          background: rgba(255, 255, 255, 0.25) !important;
        }

        .gh-sheet-header {
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          padding: 4px 16px 12px !important;
          border-bottom: 1px solid var(--border-color, #E2E8F0) !important;
          flex-shrink: 0 !important;
          cursor: grab !important;
          touch-action: none !important;
          user-select: none !important;
          -webkit-user-select: none !important;
        }
        .gh-sheet-header:active { cursor: grabbing !important; }

        .gh-sheet-header-left {
          display: flex !important;
          align-items: center !important;
          gap: 10px !important;
          flex: 1 !important;
          min-width: 0 !important;
        }

        .gh-sheet-header-icon {
          width: 32px !important;
          height: 32px !important;
          border-radius: 10px !important;
          background: #0F172A !important;
          color: #FFFFFF !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          flex-shrink: 0 !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25) !important;
        }
        [data-theme="dark"] .gh-sheet-header-icon {
          background: #F8FAFC !important;
          color: #0F172A !important;
        }

        .gh-sheet-title h3 {
          font-size: 13.5px !important;
          font-weight: 800 !important;
          color: var(--text-primary, #111827) !important;
          margin: 0 !important;
          letter-spacing: -0.015em !important;
          line-height: 1.25 !important;
        }
        [data-theme="dark"] .gh-sheet-title h3 {
          color: #F9FAFB !important;
        }
        .gh-sheet-title p {
          font-size: 9.5px !important;
          font-weight: 700 !important;
          color: #10B981 !important;
          margin: 1px 0 0 !important;
          display: flex !important;
          align-items: center !important;
          gap: 4px !important;
          letter-spacing: 0.02em !important;
        }

        .gh-sheet-close {
          width: 30px !important;
          height: 30px !important;
          border-radius: 50% !important;
          background: var(--bg-primary, #F3F4F6) !important;
          border: 1px solid var(--border-color, #CBD5E1) !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          color: var(--text-secondary, #6B7280) !important;
          cursor: pointer !important;
          flex-shrink: 0 !important;
          margin-left: 8px !important;
          transition: transform 0.15s ease, background 0.15s ease !important;
          -webkit-tap-highlight-color: transparent !important;
        }
        .gh-sheet-close:active {
          transform: scale(0.9) !important;
        }
        [data-theme="dark"] .gh-sheet-close {
          background: rgba(255, 255, 255, 0.08) !important;
          border-color: rgba(255, 255, 255, 0.14) !important;
          color: #D1D5DB !important;
        }

        .gh-sheet-body {
          flex: 1 !important;
          overflow-y: auto !important;
          padding: 0 !important;
          display: flex !important;
          flex-direction: column !important;
          overscroll-behavior: contain !important;
          -webkit-overflow-scrolling: touch !important;
        }
        .gh-sheet-body::-webkit-scrollbar { display: none !important; }

        .gh-sheet-content {
          padding: 12px 16px max(24px, env(safe-area-inset-bottom, 24px)) !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 12px !important;
        }

        /* ── Hero Profile Card inside Sheet ── */
        .gh-hero-card {
          display: flex !important;
          align-items: center !important;
          gap: 12px !important;
          padding: 12px 14px !important;
          background: var(--bg-secondary, #F8FAFC) !important;
          border: 1.2px solid var(--border-color, #E2E8F0) !important;
          border-radius: 16px !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02) !important;
        }
        [data-theme="dark"] .gh-hero-card {
          background: rgba(255, 255, 255, 0.03) !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
        }

        .gh-hero-avatar-wrap {
          position: relative !important;
          flex-shrink: 0 !important;
        }
        .gh-hero-avatar {
          width: 46px !important;
          height: 46px !important;
          border-radius: 14px !important;
          object-fit: cover !important;
          border: 1.5px solid var(--border-color, #CBD5E1) !important;
          display: block !important;
        }
        .gh-hero-live-badge {
          position: absolute !important;
          bottom: -2px !important;
          right: -2px !important;
          width: 10px !important;
          height: 10px !important;
          border-radius: 50% !important;
          background: #10B981 !important;
          border: 2px solid var(--bg-secondary, #FFFFFF) !important;
        }

        .gh-hero-info {
          flex: 1 !important;
          min-width: 0 !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 2px !important;
        }
        .gh-hero-name-row {
          display: flex !important;
          align-items: center !important;
          gap: 6px !important;
        }
        .gh-hero-name {
          font-size: 13.5px !important;
          font-weight: 800 !important;
          color: var(--text-primary, #111827) !important;
          letter-spacing: -0.01em !important;
        }
        [data-theme="dark"] .gh-hero-name {
          color: #F9FAFB !important;
        }
        .gh-hero-tag {
          font-size: 10px !important;
          font-weight: 600 !important;
          color: var(--text-muted, #64748B) !important;
        }
        .gh-hero-bio {
          font-size: 10.5px !important;
          color: var(--text-secondary, #475569) !important;
          line-height: 1.35 !important;
          margin: 0 !important;
        }
        [data-theme="dark"] .gh-hero-bio {
          color: #94A3B8 !important;
        }
        .gh-hero-meta {
          display: flex !important;
          align-items: center !important;
          gap: 6px !important;
          margin-top: 4px !important;
        }
        .gh-meta-pill {
          display: inline-flex !important;
          align-items: center !important;
          gap: 4px !important;
          font-size: 8.5px !important;
          font-weight: 700 !important;
          color: var(--text-secondary, #475569) !important;
          background: var(--bg-primary, #FFFFFF) !important;
          border: 1px solid var(--border-color, #E2E8F0) !important;
          padding: 2px 6px !important;
          border-radius: 6px !important;
        }
        [data-theme="dark"] .gh-meta-pill {
          background: rgba(255, 255, 255, 0.05) !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
          color: #CBD5E1 !important;
        }

        /* ── Bento Stats Grid ── */
        .gh-bento-grid {
          display: grid !important;
          grid-template-columns: repeat(4, 1fr) !important;
          gap: 8px !important;
        }
        .gh-bento-card {
          display: flex !important;
          flex-direction: column !important;
          padding: 9px 8px !important;
          border-radius: 12px !important;
          border: 1.2px solid var(--border-color, #E2E8F0) !important;
          background: var(--bg-secondary, #F8FAFC) !important;
          gap: 1px !important;
        }
        [data-theme="dark"] .gh-bento-card {
          background: rgba(255, 255, 255, 0.03) !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
        }
        .gh-bento-head {
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          margin-bottom: 3px !important;
        }
        .gh-bento-label {
          font-size: 8px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          color: var(--text-muted, #64748B) !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
        }
        .gh-bento-val {
          font-size: 15px !important;
          font-weight: 800 !important;
          line-height: 1.1 !important;
          letter-spacing: -0.02em !important;
          color: var(--text-primary, #111827) !important;
        }
        [data-theme="dark"] .gh-bento-val {
          color: #F9FAFB !important;
        }
        .gh-bento-sub {
          font-size: 7.5px !important;
          font-weight: 600 !important;
          color: var(--text-muted, #94A3B8) !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
        }

        .gh-bento-blue .gh-bento-head svg { color: #3B82F6 !important; }
        .gh-bento-amber .gh-bento-head svg { color: #F59E0B !important; }
        .gh-bento-purple .gh-bento-head svg { color: #8B5CF6 !important; }
        .gh-bento-green .gh-bento-head svg { color: #10B981 !important; }

        /* ── Section Box Container ── */
        .gh-section-box {
          display: flex !important;
          flex-direction: column !important;
          padding: 11px 12px !important;
          background: var(--bg-secondary, #F8FAFC) !important;
          border: 1.2px solid var(--border-color, #E2E8F0) !important;
          border-radius: 14px !important;
          gap: 8px !important;
        }
        [data-theme="dark"] .gh-section-box {
          background: rgba(255, 255, 255, 0.02) !important;
          border-color: rgba(255, 255, 255, 0.09) !important;
        }
        .gh-section-box-header {
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
        }
        .gh-section-box-title {
          display: flex !important;
          align-items: center !important;
          gap: 6px !important;
          font-size: 9.5px !important;
          font-weight: 800 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.06em !important;
          color: var(--text-secondary, #475569) !important;
        }
        [data-theme="dark"] .gh-section-box-title {
          color: #94A3B8 !important;
        }
        .gh-stack-count {
          font-size: 8.5px !important;
          font-weight: 600 !important;
          color: var(--text-muted, #94A3B8) !important;
        }

        /* Commits list */
        .gh-commits-list {
          display: flex !important;
          flex-direction: column !important;
          gap: 6px !important;
        }
        .gh-commit-row {
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          gap: 8px !important;
          padding: 6px 8px !important;
          background: var(--bg-primary, #FFFFFF) !important;
          border: 1px solid var(--border-color, #E2E8F0) !important;
          border-radius: 8px !important;
          text-decoration: none !important;
          color: inherit !important;
          transition: transform 0.12s ease, border-color 0.12s ease !important;
          -webkit-tap-highlight-color: transparent !important;
        }
        .gh-commit-row:active {
          transform: scale(0.98) !important;
        }
        [data-theme="dark"] .gh-commit-row {
          background: rgba(255, 255, 255, 0.04) !important;
          border-color: rgba(255, 255, 255, 0.08) !important;
        }
        .gh-commit-left {
          display: flex !important;
          align-items: center !important;
          gap: 7px !important;
          flex: 1 !important;
          min-width: 0 !important;
        }
        .gh-commit-sha {
          font-family: monospace !important;
          font-size: 9px !important;
          font-weight: 700 !important;
          color: #3B82F6 !important;
          background: rgba(59, 130, 246, 0.1) !important;
          border: 1px solid rgba(59, 130, 246, 0.25) !important;
          padding: 1px 5px !important;
          border-radius: 4px !important;
          flex-shrink: 0 !important;
        }
        .gh-commit-msg {
          font-size: 10px !important;
          font-weight: 600 !important;
          color: var(--text-primary, #1E293B) !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
        }
        [data-theme="dark"] .gh-commit-msg {
          color: #F1F5F9 !important;
        }
        .gh-commit-right {
          display: flex !important;
          align-items: center !important;
          gap: 4px !important;
          flex-shrink: 0 !important;
        }
        .gh-commit-time {
          font-size: 8.5px !important;
          font-weight: 500 !important;
          color: var(--text-muted, #94A3B8) !important;
        }
        .gh-commit-arrow {
          color: var(--text-muted, #94A3B8) !important;
        }

        /* Stack bar */
        .gh-stack-bar {
          display: flex !important;
          height: 6px !important;
          border-radius: 3px !important;
          overflow: hidden !important;
          background: var(--border-color, #E2E8F0) !important;
        }
        .gh-stack-legend {
          display: flex !important;
          flex-wrap: wrap !important;
          gap: 8px !important;
        }
        .gh-legend-item {
          display: inline-flex !important;
          align-items: center !important;
          gap: 4px !important;
          font-size: 9px !important;
          font-weight: 600 !important;
          color: var(--text-secondary, #475569) !important;
        }
        [data-theme="dark"] .gh-legend-item {
          color: #94A3B8 !important;
        }
        .gh-legend-dot {
          width: 6px !important;
          height: 6px !important;
          border-radius: 50% !important;
          display: inline-block !important;
        }

        /* Action Buttons */
        .gh-actions-row {
          display: flex !important;
          gap: 8px !important;
          margin-top: 2px !important;
        }
        .gh-action-primary {
          flex: 1 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 6px !important;
          background: #0F172A !important;
          color: #FFFFFF !important;
          font-size: 11.5px !important;
          font-weight: 700 !important;
          padding: 10px 12px !important;
          border-radius: 12px !important;
          text-decoration: none !important;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.18) !important;
          transition: transform 0.12s ease !important;
          -webkit-tap-highlight-color: transparent !important;
        }
        .gh-action-primary:active { transform: scale(0.98) !important; }
        [data-theme="dark"] .gh-action-primary {
          background: #FFFFFF !important;
          color: #0F172A !important;
          box-shadow: 0 4px 14px rgba(255, 255, 255, 0.15) !important;
        }

        .gh-action-secondary {
          flex: 1 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 6px !important;
          background: var(--bg-secondary, #F8FAFC) !important;
          border: 1.2px solid var(--border-color, #E2E8F0) !important;
          color: var(--text-primary, #0F172A) !important;
          font-size: 11.5px !important;
          font-weight: 700 !important;
          padding: 10px 12px !important;
          border-radius: 12px !important;
          text-decoration: none !important;
          transition: transform 0.12s ease !important;
          -webkit-tap-highlight-color: transparent !important;
        }
        .gh-action-secondary:active { transform: scale(0.98) !important; }
        [data-theme="dark"] .gh-action-secondary {
          background: rgba(255, 255, 255, 0.05) !important;
          border-color: rgba(255, 255, 255, 0.12) !important;
          color: #F8FAFC !important;
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

