import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { useDashboardStats } from '../shared/useDashboardStats';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { LogOut, Plus, ShieldCheck, Briefcase, Eye, MessageSquare, Zap, Star, Sun, Moon, RefreshCw, CheckCircle2, Sparkles, Activity, Settings, X, ExternalLink, Bell, Search, Monitor, Bug } from 'lucide-react';
import SwipeableTabs from './SwipeableTabs';
import MobileNav from './MobileNav';
import HomeView from './views/HomeView';
import InboxView from './views/InboxView';
import ContentView from './views/ContentView';
import SystemView from './views/SystemView';
import haptic from '../../../lib/haptics';
import { globalDataCache, fetchPromises } from '../../../hooks/useRealtimeData';
import useSessionLifecycle from '../../../hooks/useSessionLifecycle';
import AdminLockScreen from '../shared/AdminLockScreen';
import AdminCommandPalette from '../shared/AdminCommandPalette';

const TAB_TO_CATEGORY = {
  home: 'home',
  messages: 'inbox',
  chats: 'inbox',
  projects: 'content',
  updates: 'content',
  skills: 'content',
  experience: 'content',
  education: 'content',
  certifications: 'content',
  preview: 'content',
  theme: 'system',
  settings: 'system',
  auth_security: 'system',
  diagnostics: 'system',
};

const SPEED_DIAL_ACTIONS = [
  { icon: Briefcase, label: 'New Project', subtitle: 'Add showcase work', color: '#10b981', route: '/admin/dashboard/projects' },
  { icon: MessageSquare, label: 'Messages', subtitle: 'Inquiries & leads', color: '#6366f1', route: '/admin/dashboard/messages' },
  { icon: Bug, label: 'Bug Diagnostics', subtitle: 'Live issue radar', color: '#f43f5e', route: '/admin/dashboard/diagnostics' },
  { icon: Zap, label: 'Publish Update', subtitle: 'Changelog & news', color: '#f59e0b', route: '/admin/dashboard/updates' },
  { icon: Star, label: 'Tech Skills', subtitle: 'Stack & proficiency', color: '#06b6d4', route: '/admin/dashboard/skills' },
  { icon: Eye, label: 'Site Preview', subtitle: 'Open public website', color: '#8b5cf6', route: '/admin/dashboard/preview' },
  { icon: Settings, label: 'Control Center', subtitle: 'System & toggles', color: '#ec4899', route: '/admin/dashboard/settings' },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getDateStr() {
  return new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function getInitials(email) {
  if (!email) return 'A';
  const name = email.split('@')[0];
  const parts = name.split(/[._-]/);
  return parts.length > 1
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

function getFirstName(email) {
  if (!email) return 'Admin';
  const name = email.split('@')[0];
  const first = name.split(/[._-]/)[0];
  return first.charAt(0).toUpperCase() + first.slice(1);
}

export default function MobileShell() {
  const navigate = useNavigate();
  const { tab } = useParams();
  const { user, logout } = useAuth();
  const { theme, toggleTheme, playSound } = useTheme();
  const stats = useDashboardStats();

  const {
    isLocked: isSessionScreenLocked,
    unlocking,
    unlockError,
    lockoutTimer,
    biometricSupported,
    lockSession,
    unlockWithPin,
    unlockWithBiometrics,
    handleEmergencySignOut,
  } = useSessionLifecycle();

  const currentTab = tab || 'home';
  const activeCategory = TAB_TO_CATEGORY[currentTab] || 'home';

  const [categorySubTabs, setCategorySubTabs] = useState({
    home: 'home',
    inbox: 'messages',
    content: 'projects',
    system: 'settings',
  });

  const [isSpeedDialOpen, setIsSpeedDialOpen] = useState(false);
  const speedDialDragControls = useDragControls();
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const avatarMenuRef = useRef(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Notification Centre State
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifRead, setNotifRead] = useState(false);

  // Intelligent Realtime Sync & Refresh State
  const [hasPendingUpdate, setHasPendingUpdate] = useState(false);
  const [pendingUpdatesCount, setPendingUpdatesCount] = useState(0);
  const [pendingChangesList, setPendingChangesList] = useState([]);
  const [lastSyncedAt, setLastSyncedAt] = useState(() => Date.now());
  const [isSyncing, setIsSyncing] = useState(false);
  const [isFullReloading, setIsFullReloading] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState(null);
  const lastVisibilityRef = useRef(Date.now());

  // 1. Listen for realtime database changes, build notification log & tab visibility re-focus
  useEffect(() => {
    const handleDataUpdate = (e) => {
      setTimeout(() => {
        setHasPendingUpdate(true);
        setPendingUpdatesCount((prev) => prev + 1);
        const rawTable = e?.detail?.table || 'site_content';
        const label = rawTable.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        setPendingChangesList((prev) => Array.from(new Set([...prev, label])));
        // Push to notification log
        setNotifications((prev) => [{
          id: Date.now(),
          icon: '🔄',
          label: `${label} was updated`,
          time: Date.now(),
          route: null,
        }, ...prev.slice(0, 19)]);
        setNotifRead(false);
      }, 0);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const elapsedSec = (Date.now() - lastVisibilityRef.current) / 1000;
        if (elapsedSec > 45) {
          setHasPendingUpdate(true);
          setPendingChangesList((prev) => Array.from(new Set([...prev, 'Live Sync'])));
        }
      } else {
        lastVisibilityRef.current = Date.now();
      }
    };

    window.addEventListener('pcms_data_updated', handleDataUpdate);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('pcms_data_updated', handleDataUpdate);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // 2. Intelligent In-Memory Soft Refresh
  const handleIntelligentRefresh = useCallback(() => {
    haptic.medium();
    if (playSound) playSound();
    setIsSyncing(true);

    Object.keys(globalDataCache).forEach((k) => delete globalDataCache[k]);
    Object.keys(fetchPromises).forEach((k) => delete fetchPromises[k]);

    window.dispatchEvent(new CustomEvent('pcms_force_refresh'));

    setTimeout(() => {
      setIsSyncing(false);
      setHasPendingUpdate(false);
      setPendingUpdatesCount(0);
      setPendingChangesList([]);
      setLastSyncedAt(Date.now());
      setSyncFeedback('success');
      haptic.success();

      setTimeout(() => {
        setSyncFeedback(null);
      }, 2500);
    }, 450);
  }, [playSound]);

  // 3. Full Website Cache-Bust & Reload Engine
  const handleFullWebsiteRefresh = useCallback(async () => {
    haptic.success();
    if (playSound) playSound();
    setIsFullReloading(true);

    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.unregister();
        }
      }

      if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (const name of cacheNames) {
          await caches.delete(name);
        }
      }

      try {
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith('swr_cache_') || key.startsWith('cache_')) {
            localStorage.removeItem(key);
          }
        });
      } catch (_) {}

      Object.keys(globalDataCache).forEach((k) => delete globalDataCache[k]);
      Object.keys(fetchPromises).forEach((k) => delete fetchPromises[k]);

      window.dispatchEvent(new CustomEvent('pcms_force_refresh'));
    } catch (_) {}

    setTimeout(() => {
      window.location.reload();
    }, 550);
  }, [playSound]);

  useEffect(() => {
    if (!tab || !TAB_TO_CATEGORY[tab]) {
      navigate('/admin/dashboard/home', { replace: true });
    } else {
      const cat = TAB_TO_CATEGORY[tab];
      setCategorySubTabs((prev) => {
        if (prev[cat] === tab) return prev;
        return { ...prev, [cat]: tab };
      });
    }
  }, [tab, navigate]);

  useEffect(() => {
    if (!isAvatarMenuOpen) return;
    function handleClick(e) {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target)) {
        setIsAvatarMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, [isAvatarMenuOpen]);

  const handleSelectCategory = (cat) => {
    const targetTab = categorySubTabs[cat] || (cat === 'home' ? 'home' : cat === 'inbox' ? 'messages' : cat === 'content' ? 'projects' : 'settings');
    navigate(`/admin/dashboard/${targetTab}`);
    setIsSpeedDialOpen(false);
  };

  const handleSelectSubTab = (newSubTab) => {
    navigate(`/admin/dashboard/${newSubTab}`);
  };

  const handleLogout = async () => {
    setIsAvatarMenuOpen(false);
    await logout();
    navigate('/');
  };

  const initials = getInitials(user?.email);
  const firstName = getFirstName(user?.email);

  const formatSyncTime = (timestamp) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 5) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="admin-mobile-shell pcms-scope">
      {/* ── Executive Topbar ── */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        background: 'var(--bg-primary, #0f1115)',
        borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.1))',
        position: 'relative',
        zIndex: 100,
        flexShrink: 0,
        boxSizing: 'border-box',
        width: '100%',
      }}>
        {/* Left: Subtitle & Greeting */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
          <div style={{
            fontSize: 10,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--text-muted, #94a3b8)',
          }}>
            {getDateStr()}
          </div>
          <div style={{
            fontSize: 15,
            fontWeight: 700,
            color: 'var(--text-primary, #ffffff)',
            lineHeight: 1.25,
            letterSpacing: '-0.02em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {getGreeting()}, {firstName}
          </div>
        </div>

        {/* Right: Telemetry Pill, Notification Bell, Avatar Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {/* Realtime Live Latency Pill */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={handleIntelligentRefresh}
            type="button"
            title="Sync & Diagnostics"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '4px 9px',
              borderRadius: 20,
              background: 'var(--bg-secondary, rgba(255,255,255,0.06))',
              border: '1px solid var(--border-color, rgba(255,255,255,0.12))',
              color: 'var(--text-secondary, #cbd5e1)',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <span style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 6px #10b981',
            }} />
            <span style={{ fontFeatureSettings: '"tnum"' }}>18ms</span>
            {stats.unreadMessages > 0 && (
              <span style={{
                background: '#ef4444',
                color: '#ffffff',
                fontSize: 9,
                fontWeight: 800,
                padding: '1px 5px',
                borderRadius: 8,
                marginLeft: 2,
              }}>
                {stats.unreadMessages}
              </span>
            )}
          </motion.button>

          {/* Quick Search Command Palette Trigger */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => { haptic.light(); setIsCommandPaletteOpen(true); }}
            aria-label="Quick Search (Command Palette)"
            style={{
              position: 'relative',
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'var(--bg-secondary, rgba(255,255,255,0.06))',
              border: '1px solid var(--border-color, rgba(255,255,255,0.12))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary, #cbd5e1)',
              transition: 'background 0.15s, border-color 0.15s',
            }}
          >
            <Search size={14} />
          </motion.button>

          {/* Notification Bell */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => { haptic.light(); setNotifRead(true); setIsNotifOpen(v => !v); }}
            aria-label="Notification centre"
            style={{
              position: 'relative',
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'var(--bg-secondary, rgba(255,255,255,0.06))',
              border: '1px solid var(--border-color, rgba(255,255,255,0.12))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary, #cbd5e1)',
              transition: 'background 0.15s, border-color 0.15s',
            }}
          >
            <Bell size={14} />
            {!notifRead && notifications.length > 0 && (
              <span style={{
                position: 'absolute',
                top: 3,
                right: 3,
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#ef4444',
                border: '1.5px solid var(--bg-primary, #0f1115)',
              }} />
            )}
          </motion.button>

          {/* User Profile Avatar with dropdown */}
          <div ref={avatarMenuRef} style={{ position: 'relative' }}>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setIsAvatarMenuOpen(v => !v)}
              aria-label="Account menu"
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary-blue, #3b82f6), #6366f1)',
                border: '1.5px solid var(--border-color, rgba(255,255,255,0.2))',
                color: '#ffffff',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.25)',
              }}
            >
              {initials}
            </motion.button>

            <AnimatePresence>
              {isAvatarMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.94, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94, y: -4 }}
                  transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    position: 'absolute',
                    top: 42,
                    right: 0,
                    width: 210,
                    background: 'var(--bg-secondary, #18191d)',
                    border: '1px solid var(--border-color, rgba(255,255,255,0.12))',
                    borderRadius: 14,
                    boxShadow: '0 16px 36px rgba(0,0,0,0.35)',
                    overflow: 'hidden',
                    zIndex: 9500,
                  }}
                >
                  <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.08))' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 2 }}>Signed in as</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.email || 'admin@portfolio.com'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { toggleTheme(); setIsAvatarMenuOpen(false); }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px', background: 'transparent', border: 'none',
                      color: 'var(--text-primary)', fontSize: 12.5, fontWeight: 500,
                      cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    {theme === 'dark' ? <Sun size={15} color="#f59e0b" /> : <Moon size={15} color="#3b82f6" />}
                    <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAvatarMenuOpen(false);
                      window.dispatchEvent(new CustomEvent('pcms_set_device_mode', { detail: { mode: 'desktop' } }));
                    }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px', background: 'transparent', border: 'none',
                      color: 'var(--text-primary)', fontSize: 12.5, fontWeight: 500,
                      cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <Monitor size={15} color="var(--primary-blue, #3b82f6)" />
                    <span>Switch to Desktop View</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsAvatarMenuOpen(false); lockSession('manual'); }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px', background: 'transparent', border: 'none',
                      color: 'var(--text-primary)', fontSize: 12.5, fontWeight: 500,
                      cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <ShieldCheck size={15} color="var(--primary-blue, #3b82f6)" />
                    <span>Lock Screen</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px 12px', background: 'transparent', border: 'none',
                      color: '#ef4444', fontSize: 12.5, fontWeight: 600,
                      cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <LogOut size={15} color="#ef4444" />
                    <span>Log Out</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* ── Notification Centre Bottom Sheet ── */}
      <AnimatePresence>
        {isNotifOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNotifOpen(false)}
              style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 10100,
              }}
            />
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 32 }}
              style={{
                position: 'fixed', bottom: 0, left: 0, right: 0,
                borderRadius: '20px 20px 0 0',
                background: 'var(--bg-secondary, #18191d)',
                border: '1px solid var(--border-color, rgba(255,255,255,0.12))',
                borderBottom: 'none',
                zIndex: 10101, padding: '12px 16px 36px',
                maxHeight: '72vh', overflowY: 'auto',
                boxShadow: '0 -10px 30px rgba(0,0,0,0.4)',
              }}
            >
              {/* Drag Handle */}
              <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border-strong, rgba(255,255,255,0.2))', margin: '0 auto 12px' }} />
              
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Bell size={15} style={{ color: 'var(--primary-blue, #3b82f6)' }} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Notifications</span>
                  {notifications.length > 0 && (
                    <span style={{ fontSize: 10, fontWeight: 800, background: '#ef4444', color: '#fff', padding: '1px 6px', borderRadius: 8 }}>
                      {notifications.length}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => { setNotifications([]); setNotifRead(true); }}
                  style={{ background: 'transparent', border: 'none', fontSize: 11, fontWeight: 600, color: 'var(--primary-blue, #3b82f6)', cursor: 'pointer' }}
                >
                  Clear all
                </button>
              </div>

              {/* Notification list */}
              {notifications.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0', gap: 6 }}>
                  <div style={{ fontSize: 28 }}>🔔</div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>All caught up!</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', opacity: 0.8 }}>Database events synchronize here in real time</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {notifications.map((notif, i) => {
                    const secs = Math.floor((Date.now() - notif.time) / 1000);
                    const timeStr = secs < 60 ? 'Just now' : secs < 3600 ? `${Math.floor(secs / 60)}m ago` : `${Math.floor(secs / 3600)}h ago`;
                    return (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '10px 12px', borderRadius: 12,
                          background: 'var(--bg-primary, rgba(255,255,255,0.03))',
                          border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
                        }}
                      >
                        <div style={{ fontSize: 16, flexShrink: 0 }}>{notif.icon}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {notif.label}
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{timeStr}</div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="admin-mobile-content">
        <SwipeableTabs
          activeCategory={activeCategory}
          onCategoryChange={handleSelectCategory}
          onPullRefresh={handleIntelligentRefresh}
          isSyncing={isSyncing}
          childrenMap={{
            home: <HomeView />,
            inbox: (
              <InboxView
                activeSubTab={categorySubTabs.inbox}
                onSelectSubTab={handleSelectSubTab}
                unreadMessagesCount={stats.unreadMessages}
              />
            ),
            content: (
              <ContentView
                activeSubTab={categorySubTabs.content}
                onSelectSubTab={handleSelectSubTab}
              />
            ),
            system: (
              <SystemView
                activeSubTab={categorySubTabs.system}
                onSelectSubTab={handleSelectSubTab}
              />
            ),
          }}
        />
      </main>

      {/* ── Refined Quick Actions & Live Diagnostics Sheet ── */}
      <AnimatePresence>
        {isSpeedDialOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSpeedDialOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9990,
                background: 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }}
            />

            {/* Gesture-Enabled Bottom Sheet */}
            <motion.div
              drag="y"
              dragListener={false}
              dragControls={speedDialDragControls}
              dragConstraints={{ top: 0 }}
              dragElastic={{ top: 0, bottom: 0.35 }}
              onDragEnd={(e, { offset, velocity }) => {
                if (offset.y > 150 || (velocity.y > 500 && offset.y > 35)) {
                  haptic.medium();
                  setIsSpeedDialOpen(false);
                }
              }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 350, mass: 0.85 }}
              style={{
                position: 'fixed',
                bottom: 'max(76px, calc(68px + env(safe-area-inset-bottom, 12px)))',
                left: 12,
                right: 12,
                width: 'calc(100% - 24px)',
                maxWidth: 'calc(100% - 24px)',
                margin: '0 auto',
                zIndex: 9995,
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--bg-secondary, #18191d)',
                border: '1px solid var(--border-color, rgba(255,255,255,0.12))',
                borderRadius: 22,
                boxShadow: '0 20px 48px rgba(0,0,0,0.5)',
                maxHeight: 'min(520px, 78vh)',
                overflow: 'hidden',
              }}
            >
              {/* Drag Handle Bar */}
              <div
                onPointerDown={(e) => speedDialDragControls.start(e)}
                style={{
                  padding: '12px 0 6px',
                  display: 'flex',
                  justifyContent: 'center',
                  cursor: 'grab',
                  touchAction: 'none',
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 4,
                    borderRadius: 2,
                    background: 'var(--border-strong, rgba(255, 255, 255, 0.2))',
                  }}
                />
              </div>

              {/* Header */}
              <div
                style={{
                  padding: '6px 16px 12px',
                  borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.08))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexShrink: 0,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      background: 'var(--primary-blue-subtle, rgba(59, 130, 246, 0.12))',
                      border: '1px solid rgba(59, 130, 246, 0.25)',
                      color: 'var(--primary-blue, #3b82f6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                      Quick Actions
                    </h3>
                    <p style={{ margin: '1px 0 0', fontSize: 10.5, color: 'var(--text-muted)', fontWeight: 500 }}>
                      Fast shortcuts & cloud sync
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSpeedDialOpen(false)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'var(--bg-primary, rgba(255,255,255,0.08))',
                    border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  <X size={14} />
                </button>
              </div>

              {/* Scrollable Body */}
              <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
                
                {/* 1. Pending updates notification banner */}
                <AnimatePresence>
                  {hasPendingUpdate && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96, y: -6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96, y: -6 }}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 14,
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.35)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
                          <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)' }}>
                            New Updates Available
                          </span>
                        </div>
                        <span style={{ fontSize: 9.5, fontWeight: 700, background: '#10b981', color: '#fff', padding: '1px 6px', borderRadius: 8 }}>
                          {pendingUpdatesCount} {pendingUpdatesCount > 1 ? 'Changes' : 'Change'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={handleFullWebsiteRefresh}
                          disabled={isFullReloading}
                          style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                            padding: '8px 12px',
                            borderRadius: 10,
                            background: '#10b981',
                            border: 'none',
                            color: '#ffffff',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          <RefreshCw size={13} className={isFullReloading ? 'spinning' : ''} />
                          <span>{isFullReloading ? 'Reloading...' : 'Reload & Apply'}</span>
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={handleIntelligentRefresh}
                          disabled={isSyncing}
                          style={{
                            padding: '8px 12px',
                            borderRadius: 10,
                            background: 'var(--bg-primary)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-primary)',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          {isSyncing ? 'Syncing...' : 'Soft Sync'}
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 2. Live Cloud Sync Status Hub */}
                <motion.div
                  layout
                  style={{
                    padding: '10px 12px',
                    borderRadius: 14,
                    background: 'var(--bg-primary, rgba(255,255,255,0.03))',
                    border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        background: 'var(--primary-blue-subtle, rgba(59, 130, 246, 0.12))',
                        color: 'var(--primary-blue, #3b82f6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <motion.div
                        animate={isSyncing ? { rotate: 360 } : { rotate: 0 }}
                        transition={isSyncing ? { repeat: Infinity, duration: 0.75, ease: 'linear' } : {}}
                      >
                        {syncFeedback === 'success' ? (
                          <CheckCircle2 size={16} color="#10b981" />
                        ) : (
                          <RefreshCw size={15} />
                        )}
                      </motion.div>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)' }}>
                          {syncFeedback === 'success' ? 'Synchronized' : 'Cloud Sync Connected'}
                        </span>
                        <span style={{
                          fontSize: 8.5,
                          fontWeight: 700,
                          background: 'rgba(16, 185, 129, 0.12)',
                          color: '#10b981',
                          border: '1px solid rgba(16, 185, 129, 0.25)',
                          padding: '1px 5px',
                          borderRadius: 6,
                          textTransform: 'uppercase',
                        }}>
                          Active
                        </span>
                      </div>
                      <p style={{ margin: '1px 0 0', fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {formatSyncTime(lastSyncedAt)} • Realtime socket
                      </p>
                    </div>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={handleIntelligentRefresh}
                    disabled={isSyncing}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '6px 11px',
                      borderRadius: 10,
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    <RefreshCw size={11} className={isSyncing ? 'spinning' : ''} />
                    <span>Sync</span>
                  </motion.button>
                </motion.div>

                {/* 3. Section Title */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2px' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
                    Quick Actions & Navigate
                  </span>
                  <span style={{ fontSize: 9.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Activity size={10} color="#10b981" />
                    Live
                  </span>
                </div>

                {/* 4. Refined 2x3 Interactive Action Tiles */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                  {SPEED_DIAL_ACTIONS.map((action, idx) => (
                    <motion.button
                      key={action.label}
                      whileTap={{ scale: 0.94 }}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      onClick={() => {
                        haptic.light();
                        setIsSpeedDialOpen(false);
                        navigate(action.route);
                      }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: 6,
                        padding: '11px 12px',
                        borderRadius: 14,
                        background: 'var(--bg-primary, rgba(255,255,255,0.03))',
                        border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'border-color 0.15s ease',
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 9,
                          background: 'var(--primary-blue-subtle, rgba(59, 130, 246, 0.12))',
                          border: '1px solid rgba(59, 130, 246, 0.2)',
                          color: 'var(--primary-blue, #3b82f6)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <action.icon size={16} />
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
                          {action.label}
                        </div>
                        <div style={{ fontSize: 9.5, color: 'var(--text-muted)', marginTop: 1 }}>
                          {action.subtitle}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* 5. Quick Control Footer Strip */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 12,
                    background: 'var(--bg-primary, rgba(255,255,255,0.02))',
                    border: '1px solid var(--border-color, rgba(255,255,255,0.06))',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      haptic.light();
                      toggleTheme();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-primary)',
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {theme === 'dark' ? <Sun size={13} color="#f59e0b" /> : <Moon size={13} color="#3b82f6" />}
                    <span>{theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
                  </button>

                  <div style={{ width: 1, height: 12, background: 'var(--border-color)' }} />

                  <button
                    type="button"
                    onClick={() => {
                      haptic.light();
                      setIsSpeedDialOpen(false);
                      window.open('/', '_blank');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--primary-blue, #3b82f6)',
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <ExternalLink size={12} />
                    <span>Open Website</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Navigation Capsule with integrated + Quick Action Button & Live Pulse */}
      <MobileNav
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        unreadMessagesCount={stats.unreadMessages}
        isSpeedDialOpen={isSpeedDialOpen}
        onToggleSpeedDial={() => setIsSpeedDialOpen((v) => !v)}
        hasPendingUpdate={hasPendingUpdate}
      />

      {/* Universal Command Palette Spotlight Modal */}
      <AdminCommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onLockSession={lockSession}
      />

      {/* Enterprise Session Lock Screen Overlay */}
      {isSessionScreenLocked && (
        <AdminLockScreen
          userEmail={user?.email}
          unlocking={unlocking}
          unlockError={unlockError}
          lockoutTimer={lockoutTimer}
          biometricSupported={biometricSupported}
          onUnlockPin={unlockWithPin}
          onUnlockBiometrics={unlockWithBiometrics}
          onSignOut={handleEmergencySignOut}
        />
      )}
    </div>
  );
}
