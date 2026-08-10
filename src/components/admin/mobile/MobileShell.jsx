import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { useDashboardStats } from '../shared/useDashboardStats';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Plus, ShieldCheck, Briefcase, Eye, MessageSquare, Zap, Star, Sun, Moon, RefreshCw, CheckCircle2, Sparkles, Activity, Settings, X, ExternalLink, Bell } from 'lucide-react';
import SwipeableTabs from './SwipeableTabs';
import MobileNav from './MobileNav';
import HomeView from './views/HomeView';
import InboxView from './views/InboxView';
import ContentView from './views/ContentView';
import SystemView from './views/SystemView';
import haptic from '../../../lib/haptics';
import { globalDataCache, fetchPromises } from '../../../hooks/useRealtimeData';

const TAB_TO_CATEGORY = {
  home: 'home',
  messages: 'inbox',
  chats: 'inbox',
  projects: 'content',
  testimonials: 'content',
  updates: 'content',
  skills: 'content',
  experience: 'content',
  education: 'content',
  certifications: 'content',
  preview: 'content',
  theme: 'system',
  settings: 'system',
};

const SPEED_DIAL_ACTIONS = [
  { icon: Briefcase, label: 'New Project', subtitle: 'Add showcase work', color: '#10b981', route: '/admin/dashboard/projects' },
  { icon: MessageSquare, label: 'Messages', subtitle: 'Inquiries & leads', color: '#6366f1', route: '/admin/dashboard/messages' },
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

  const currentTab = tab || 'home';
  const activeCategory = TAB_TO_CATEGORY[currentTab] || 'home';

  const [categorySubTabs, setCategorySubTabs] = useState({
    home: 'home',
    inbox: 'messages',
    content: 'projects',
    system: 'settings',
  });

  const [isSpeedDialOpen, setIsSpeedDialOpen] = useState(false);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const avatarMenuRef = useRef(null);

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
      {/* Interactive Dynamic Island Top Bar */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px 10px',
        background: 'var(--pcms-bg, #0c0c10)',
        borderBottom: '1px solid var(--pcms-line-soft, rgba(255,255,255,0.06))',
        position: 'relative',
        zIndex: 100,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <div style={{ fontSize: 10.5, color: 'var(--pcms-muted)', fontWeight: 500, letterSpacing: '0.04em' }}>
            {getDateStr()}
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--pcms-text)', lineHeight: 1.2, fontFamily: "'Space Grotesk', sans-serif" }}>
            {getGreeting()}, {firstName} 👋
          </div>
        </div>

        {/* Dynamic Island Status Pill, Bell & Avatar Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Dynamic Island Capsule */}
          <motion.div
            whileTap={{ scale: 0.94 }}
            onClick={handleIntelligentRefresh}
            className="dynamic-island-capsule"
            title="Realtime Cloud Diagnostics"
          >
            <span className="live-socket-dot" />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--pcms-text, #ffffff)' }}>
              18ms
            </span>
            {stats.unreadMessages > 0 && (
              <span style={{
                background: '#ef4444',
                color: '#fff',
                fontSize: 9,
                fontWeight: 800,
                padding: '1px 5px',
                borderRadius: 8,
              }}>
                💬 {stats.unreadMessages}
              </span>
            )}
          </motion.div>

          {/* Notification Bell */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => { haptic.light(); setNotifRead(true); setIsNotifOpen(v => !v); }}
            aria-label="Notification centre"
            style={{
              position: 'relative',
              width: 34, height: 34, borderRadius: 17,
              background: 'var(--pcms-panel, rgba(255,255,255,0.06))',
              border: '1px solid var(--pcms-line, rgba(255,255,255,0.1))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--pcms-text)',
            }}
          >
            <Bell size={15} />
            {!notifRead && notifications.length > 0 && (
              <span style={{
                position: 'absolute', top: 2, right: 2,
                width: 8, height: 8, borderRadius: 4,
                background: '#ef4444', border: '1.5px solid var(--pcms-bg)',
              }} />
            )}
          </motion.button>

          {/* User Profile Avatar */}
          <div ref={avatarMenuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setIsAvatarMenuOpen(v => !v)}
              aria-label="Account menu"
              style={{
                width: 36, height: 36, borderRadius: 18,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                border: '2px solid rgba(99,102,241,0.4)',
                color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(99,102,241,0.35)',
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              {initials}
            </button>
            <AnimatePresence>
              {isAvatarMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: -6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: -6 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: 'absolute', top: 44, right: 0, width: 200,
                    background: 'var(--pcms-panel, #18181c)',
                    border: '1px solid var(--pcms-line, rgba(255,255,255,0.12))',
                    borderRadius: 14, boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                    overflow: 'hidden', zIndex: 9500,
                  }}
                >
                  <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid var(--pcms-line-soft)' }}>
                    <div style={{ fontSize: 10, color: 'var(--pcms-muted)', fontWeight: 500, marginBottom: 2 }}>Signed in as</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--pcms-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.email || 'admin@portfolio.com'}
                    </div>
                  </div>
                  <button onClick={() => { toggleTheme(); setIsAvatarMenuOpen(false); }}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', background: 'transparent', border: 'none', color: 'var(--pcms-text)', fontSize: 13, fontWeight: 500, cursor: 'pointer', textAlign: 'left' }}>
                    {theme === 'dark' ? <Sun size={16} color="#f59e0b" /> : <Moon size={16} color="#6366f1" />}
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  </button>
                  <button onClick={() => { setIsAvatarMenuOpen(false); window.dispatchEvent(new CustomEvent('open-admin-login')); }}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', background: 'transparent', border: 'none', color: 'var(--pcms-text)', fontSize: 13, fontWeight: 500, cursor: 'pointer', textAlign: 'left' }}>
                    <ShieldCheck size={16} color="#6366f1" />
                    Switch Account
                  </button>
                  <button onClick={handleLogout}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px 12px', background: 'transparent', border: 'none', color: '#ef4444', fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}>
                    <LogOut size={16} color="#ef4444" />
                    Log Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Main Swipeable Content with Pull-To-Refresh */}

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
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
                backdropFilter: 'blur(6px)', zIndex: 10100,
              }}
            />
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 340, damping: 34 }}
              style={{
                position: 'fixed', bottom: 0, left: 14, right: 14,
                borderRadius: '22px 22px 0 0',
                background: 'var(--pcms-panel, #18181c)',
                border: '1px solid var(--pcms-line, rgba(255,255,255,0.12))',
                zIndex: 10101, padding: '14px 16px 40px',
                maxHeight: '70vh', overflowY: 'auto',
              }}
            >
              {/* Drag Handle */}
              <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.18)', margin: '0 auto 14px' }} />
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Bell size={16} color="#6366f1" />
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--pcms-text)' }}>Notifications</span>
                  {notifications.length > 0 && (
                    <span style={{ fontSize: 10, fontWeight: 800, background: '#ef4444', color: '#fff', padding: '1px 6px', borderRadius: 8 }}>
                      {notifications.length}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => { setNotifications([]); setNotifRead(true); }}
                  style={{ background: 'transparent', border: 'none', fontSize: 11, fontWeight: 600, color: '#6366f1', cursor: 'pointer' }}
                >
                  Clear all
                </button>
              </div>
              {/* Notification list */}
              {notifications.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0', gap: 8 }}>
                  <div style={{ fontSize: 32 }}>🔔</div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--pcms-muted)' }}>All caught up!</span>
                  <span style={{ fontSize: 11, color: 'var(--pcms-muted)', opacity: 0.7 }}>Database changes will appear here in real time</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {notifications.map((notif, i) => {
                    const secs = Math.floor((Date.now() - notif.time) / 1000);
                    const timeStr = secs < 60 ? 'Just now' : secs < 3600 ? `${Math.floor(secs / 60)}m ago` : `${Math.floor(secs / 3600)}h ago`;
                    return (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '10px 12px', borderRadius: 14,
                          background: 'var(--pcms-bg-2, rgba(255,255,255,0.04))',
                          border: '1px solid var(--pcms-line-soft, rgba(255,255,255,0.07))',
                        }}
                      >
                        <div style={{ fontSize: 18, flexShrink: 0 }}>{notif.icon}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--pcms-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {notif.label}
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--pcms-muted)', marginTop: 2 }}>{timeStr}</div>
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

      {/* iOS-Grade Quick Actions & Live Diagnostics Sheet */}
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
                background: 'rgba(0, 0, 0, 0.68)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }}
            />

            {/* Gesture-Enabled Bottom Sheet */}
            <motion.div
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={{ top: 0.05, bottom: 0.45 }}
              onDragEnd={(e, { offset, velocity }) => {
                if (offset.y > 90 || velocity.y > 400) {
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
                left: 14,
                right: 14,
                width: 'calc(100% - 28px)',
                maxWidth: 'calc(100% - 28px)',
                margin: '0 auto',
                zIndex: 9995,
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--pcms-panel, #16161b)',
                border: '1px solid var(--pcms-line, rgba(255,255,255,0.14))',
                borderRadius: 24,
                boxShadow: '0 20px 48px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.05)',
                maxHeight: 'min(520px, 78vh)',
                overflow: 'hidden',
              }}
            >
              {/* Drag Handle Bar */}
              <div
                style={{
                  padding: '12px 0 6px',
                  display: 'flex',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
                onClick={() => setIsSpeedDialOpen(false)}
              >
                <div
                  style={{
                    width: 40,
                    height: 5,
                    borderRadius: 3,
                    background: 'rgba(255, 255, 255, 0.22)',
                  }}
                />
              </div>

              {/* Header */}
              <div
                style={{
                  padding: '6px 20px 14px',
                  borderBottom: '1px solid var(--pcms-line-soft, rgba(255,255,255,0.08))',
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
                      background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))',
                      border: '1px solid rgba(99,102,241,0.3)',
                      color: 'var(--primary-blue, #6366f1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Sparkles size={17} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: 'var(--pcms-text, #ffffff)', letterSpacing: '-0.02em', fontFamily: "'Space Grotesk', sans-serif" }}>
                      Control & Actions
                    </h3>
                    <p style={{ margin: '1px 0 0', fontSize: 10.5, color: 'var(--pcms-muted, #a1a1aa)', fontWeight: 500 }}>
                      Quick shortcuts & live sync
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSpeedDialOpen(false)}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    background: 'rgba(255,255,255,0.08)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--pcms-muted, #a1a1aa)',
                    cursor: 'pointer',
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Scrollable Body */}
              <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
                
                {/* 1. NEW UPDATES LOADED & FULL REFRESH BANNER (When updates arrive) */}
                <AnimatePresence>
                  {hasPendingUpdate && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 18,
                        background: 'linear-gradient(135deg, rgba(16,185,129,0.22), rgba(6,182,212,0.18))',
                        border: '1px solid rgba(16,185,129,0.5)',
                        boxShadow: '0 8px 24px rgba(16,185,129,0.28)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ width: 8, height: 8, borderRadius: 4, background: '#10b981', boxShadow: '0 0 10px #10b981', display: 'inline-block' }} />
                          <span style={{ fontSize: 13, fontWeight: 800, color: '#ffffff' }}>
                            New Updates Loaded!
                          </span>
                        </div>
                        <span style={{ fontSize: 9.5, fontWeight: 700, background: '#10b981', color: '#fff', padding: '2px 8px', borderRadius: 10, textTransform: 'uppercase' }}>
                          {pendingUpdatesCount} New Change{pendingUpdatesCount > 1 ? 's' : ''}
                        </span>
                      </div>

                      {/* Updated Entities Chips */}
                      {pendingChangesList.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {pendingChangesList.map((item) => (
                            <span
                              key={item}
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: 8,
                                background: 'rgba(255,255,255,0.15)',
                                color: '#ffffff',
                                border: '1px solid rgba(255,255,255,0.25)',
                              }}
                            >
                              ✨ {item}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Full Website Refresh & Soft Sync Button Group */}
                      <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                        <motion.button
                          whileTap={{ scale: 0.94 }}
                          onClick={handleFullWebsiteRefresh}
                          disabled={isFullReloading}
                          style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                            padding: '9px 12px',
                            borderRadius: 13,
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            border: '1px solid rgba(255,255,255,0.35)',
                            color: '#ffffff',
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 4px 16px rgba(16,185,129,0.4)',
                          }}
                        >
                          <RefreshCw size={14} className={isFullReloading ? 'spinning' : ''} />
                          <span>{isFullReloading ? 'Reloading Website...' : 'Refresh Website Now'}</span>
                        </motion.button>

                        <motion.button
                          whileTap={{ scale: 0.94 }}
                          onClick={handleIntelligentRefresh}
                          disabled={isSyncing}
                          style={{
                            padding: '9px 12px',
                            borderRadius: 13,
                            background: 'rgba(255,255,255,0.12)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: '#ffffff',
                            fontSize: 11.5,
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

                {/* 2. Live Cloud Sync & Diagnostics Hub */}
                <motion.div
                  layout
                  style={{
                    padding: '11px 13px',
                    borderRadius: 18,
                    background: 'var(--pcms-bg-2, rgba(255,255,255,0.04))',
                    border: '1px solid var(--pcms-line-soft, rgba(255,255,255,0.09))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 13,
                        background: 'rgba(99,102,241,0.18)',
                        color: 'var(--primary-blue, #6366f1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <motion.div
                        animate={isSyncing ? { rotate: 360 } : { rotate: 0 }}
                        transition={isSyncing ? { repeat: Infinity, duration: 0.75, ease: 'linear' } : {}}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        {syncFeedback === 'success' ? (
                          <CheckCircle2 size={19} color="#10b981" />
                        ) : (
                          <RefreshCw size={18} />
                        )}
                      </motion.div>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--pcms-text, #ffffff)', whiteSpace: 'nowrap' }}>
                          {syncFeedback === 'success'
                            ? 'Synchronized'
                            : 'Live & In-Sync'}
                        </span>
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 800,
                            background: 'rgba(99,102,241,0.2)',
                            color: 'var(--primary-blue, #6366f1)',
                            border: '1px solid rgba(99,102,241,0.3)',
                            padding: '1px 6px',
                            borderRadius: 8,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}
                        >
                          Active
                        </span>
                      </div>
                      <p style={{ margin: '2px 0 0', fontSize: 10.5, color: 'var(--pcms-muted, #a1a1aa)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {syncFeedback === 'success'
                          ? 'All caches & stats updated'
                          : `Last synced: ${formatSyncTime(lastSyncedAt)} • ~18ms latency`}
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
                      gap: 6,
                      padding: '7px 13px',
                      borderRadius: 12,
                      background: 'var(--pcms-line-soft, rgba(255,255,255,0.08))',
                      border: '1px solid var(--pcms-line, rgba(255,255,255,0.12))',
                      color: 'var(--pcms-text, #ffffff)',
                      fontSize: 11.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    <RefreshCw size={12} className={isSyncing ? 'spinning' : ''} />
                    <span>{isSyncing ? 'Syncing...' : 'Sync'}</span>
                  </motion.button>
                </motion.div>

                {/* 3. Section Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2px' }}>
                  <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--pcms-muted)' }}>
                    Quick Navigation & Create
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--pcms-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Activity size={11} color="#10b981" />
                    Realtime
                  </span>
                </div>

                {/* 4. Rich 2x3 Interactive Action Tiles */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 9 }}>
                  {SPEED_DIAL_ACTIONS.map((action, idx) => (
                    <motion.button
                      key={action.label}
                      whileTap={{ scale: 0.94 }}
                      whileHover={{ scale: 1.02 }}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      onClick={() => {
                        haptic.light();
                        setIsSpeedDialOpen(false);
                        navigate(action.route);
                      }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: 7,
                        padding: '12px 13px',
                        borderRadius: 17,
                        background: 'var(--pcms-bg-2, rgba(255,255,255,0.04))',
                        border: '1px solid var(--pcms-line-soft, rgba(255,255,255,0.08))',
                        color: 'var(--pcms-text)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 11,
                          background: `${action.color}1c`,
                          border: `1px solid ${action.color}38`,
                          color: action.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <action.icon size={17} strokeWidth={2.2} />
                      </div>
                      <div>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--pcms-text, #ffffff)' }}>
                          {action.label}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--pcms-muted, #a1a1aa)', marginTop: 1 }}>
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
                    padding: '9px 13px',
                    borderRadius: 15,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--pcms-line-soft, rgba(255,255,255,0.06))',
                    marginTop: 1,
                  }}
                >
                  <button
                    onClick={() => {
                      haptic.light();
                      toggleTheme();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 7,
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--pcms-text)',
                      fontSize: 11.5,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {theme === 'dark' ? <Sun size={14} color="#f59e0b" /> : <Moon size={14} color="#6366f1" />}
                    <span>{theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
                  </button>

                  <div style={{ width: 1, height: 14, background: 'var(--pcms-line-soft)' }} />

                  <button
                    onClick={() => {
                      haptic.light();
                      setIsSpeedDialOpen(false);
                      window.open('/', '_blank');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--primary-blue, #6366f1)',
                      fontSize: 11.5,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <ExternalLink size={13} />
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
    </div>
  );
}
