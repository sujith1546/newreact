import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { useDashboardStats } from '../shared/useDashboardStats';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Plus, ShieldCheck, Briefcase, Eye, MessageSquare, Zap, Star, Sun, Moon, RefreshCw, CheckCircle2, Sparkles, Activity, Settings, X, ExternalLink } from 'lucide-react';
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

  // Intelligent Realtime Sync & Refresh State
  const [hasPendingUpdate, setHasPendingUpdate] = useState(false);
  const [pendingUpdatesCount, setPendingUpdatesCount] = useState(0);
  const [lastSyncedAt, setLastSyncedAt] = useState(() => Date.now());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState(null);
  const lastVisibilityRef = useRef(Date.now());

  // 1. Listen for realtime database changes & tab visibility re-focus
  useEffect(() => {
    const handleDataUpdate = () => {
      setHasPendingUpdate(true);
      setPendingUpdatesCount((prev) => prev + 1);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const elapsedSec = (Date.now() - lastVisibilityRef.current) / 1000;
        if (elapsedSec > 45) {
          setHasPendingUpdate(true);
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
      setLastSyncedAt(Date.now());
      setSyncFeedback('success');
      haptic.success();

      setTimeout(() => {
        setSyncFeedback(null);
      }, 2500);
    }, 450);
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
    navigate('/admin/login');
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
      {/* Personalized Greeting Top Bar */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px 10px',
        background: 'var(--pcms-bg, #0c0c10)',
        borderBottom: '1px solid var(--pcms-line-soft, rgba(255,255,255,0.06))',
        position: 'relative',
        zIndex: 100,
        flexShrink: 0,
      }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--pcms-muted)', fontWeight: 500, letterSpacing: '0.04em', marginBottom: 2 }}>
            {getDateStr()}
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--pcms-text)', lineHeight: 1.2, fontFamily: "'Space Grotesk', sans-serif" }}>
            {getGreeting()}, {firstName} 👋
          </div>
        </div>
        <div ref={avatarMenuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setIsAvatarMenuOpen(v => !v)}
            aria-label="Account menu"
            style={{
              width: 40, height: 40, borderRadius: 20,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              border: '2px solid rgba(99,102,241,0.4)',
              color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer',
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
                  position: 'absolute', top: 48, right: 0, width: 200,
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
                <button onClick={() => { setIsAvatarMenuOpen(false); navigate('/admin/login'); }}
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
      </header>

      {/* Main Swipeable Content */}
      <main className="admin-mobile-content">
        <SwipeableTabs
          activeCategory={activeCategory}
          onCategoryChange={handleSelectCategory}
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
                maxHeight: 'min(500px, 75vh)',
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
                      Quick shortcuts & diagnostics
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
              <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>
                {/* 1. Live Cloud Sync & Diagnostics Hub */}
                <motion.div
                  layout
                  style={{
                    padding: '12px 14px',
                    borderRadius: 18,
                    background: hasPendingUpdate
                      ? 'linear-gradient(135deg, rgba(16,185,129,0.18), rgba(6,182,212,0.14))'
                      : 'var(--pcms-bg-2, rgba(255,255,255,0.04))',
                    border: hasPendingUpdate
                      ? '1px solid rgba(16,185,129,0.45)'
                      : '1px solid var(--pcms-line-soft, rgba(255,255,255,0.09))',
                    boxShadow: hasPendingUpdate ? '0 6px 20px rgba(16,185,129,0.22)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 14,
                        background: hasPendingUpdate
                          ? 'rgba(16,185,129,0.25)'
                          : 'rgba(99,102,241,0.18)',
                        color: hasPendingUpdate ? '#10b981' : 'var(--primary-blue, #6366f1)',
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
                          <CheckCircle2 size={20} color="#10b981" />
                        ) : (
                          <RefreshCw size={19} />
                        )}
                      </motion.div>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--pcms-text, #ffffff)', whiteSpace: 'nowrap' }}>
                          {syncFeedback === 'success'
                            ? 'Synchronized'
                            : hasPendingUpdate
                            ? 'Update Available'
                            : 'Live & In-Sync'}
                        </span>
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 800,
                            background: hasPendingUpdate ? '#10b981' : 'rgba(99,102,241,0.2)',
                            color: hasPendingUpdate ? '#ffffff' : 'var(--primary-blue, #6366f1)',
                            border: `1px solid ${hasPendingUpdate ? 'rgba(255,255,255,0.3)' : 'rgba(99,102,241,0.3)'}`,
                            padding: '1px 6px',
                            borderRadius: 8,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}
                        >
                          {hasPendingUpdate ? 'Live' : 'Active'}
                        </span>
                      </div>
                      <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--pcms-muted, #a1a1aa)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {hasPendingUpdate
                          ? `${pendingUpdatesCount || 1} change(s) • Tap to refresh`
                          : syncFeedback === 'success'
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
                      padding: '8px 14px',
                      borderRadius: 13,
                      background: hasPendingUpdate
                        ? 'linear-gradient(135deg, #10b981, #059669)'
                        : 'var(--pcms-line-soft, rgba(255,255,255,0.08))',
                      border: hasPendingUpdate
                        ? '1px solid rgba(255,255,255,0.3)'
                        : '1px solid var(--pcms-line, rgba(255,255,255,0.12))',
                      color: '#ffffff',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: hasPendingUpdate ? '0 4px 14px rgba(16,185,129,0.35)' : 'none',
                      flexShrink: 0,
                    }}
                  >
                    <RefreshCw size={13} className={isSyncing ? 'spinning' : ''} />
                    <span>{isSyncing ? 'Syncing...' : hasPendingUpdate ? 'Refresh' : 'Sync'}</span>
                  </motion.button>
                </motion.div>

                {/* 2. Section Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2px' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--pcms-muted)' }}>
                    Quick Navigation & Create
                  </span>
                  <span style={{ fontSize: 10.5, color: 'var(--pcms-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Activity size={11} color="#10b981" />
                    Realtime
                  </span>
                </div>

                {/* 3. Rich 2x3 Interactive Action Tiles */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                  {SPEED_DIAL_ACTIONS.map((action, idx) => (
                    <motion.button
                      key={action.label}
                      whileTap={{ scale: 0.94 }}
                      whileHover={{ scale: 1.02 }}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.035 }}
                      onClick={() => {
                        haptic.light();
                        setIsSpeedDialOpen(false);
                        navigate(action.route);
                      }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: 8,
                        padding: '14px 14px',
                        borderRadius: 18,
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
                          width: 36,
                          height: 36,
                          borderRadius: 12,
                          background: `${action.color}1c`,
                          border: `1px solid ${action.color}38`,
                          color: action.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <action.icon size={18} strokeWidth={2.2} />
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--pcms-text, #ffffff)' }}>
                          {action.label}
                        </div>
                        <div style={{ fontSize: 10.5, color: 'var(--pcms-muted, #a1a1aa)', marginTop: 2 }}>
                          {action.subtitle}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* 4. Quick Control Footer Strip */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 16,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--pcms-line-soft, rgba(255,255,255,0.06))',
                    marginTop: 2,
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
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {theme === 'dark' ? <Sun size={15} color="#f59e0b" /> : <Moon size={15} color="#6366f1" />}
                    <span>{theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
                  </button>

                  <div style={{ width: 1, height: 16, background: 'var(--pcms-line-soft)' }} />

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
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <ExternalLink size={14} />
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
