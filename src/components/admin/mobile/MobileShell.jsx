import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { useDashboardStats } from '../shared/useDashboardStats';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Plus, ShieldCheck, Briefcase, Eye, MessageSquare, Zap, Star, Sun, Moon } from 'lucide-react';
import SwipeableTabs from './SwipeableTabs';
import MobileNav from './MobileNav';
import HomeView from './views/HomeView';
import InboxView from './views/InboxView';
import ContentView from './views/ContentView';
import SystemView from './views/SystemView';

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
  { icon: Briefcase, label: 'New Project', color: '#10b981', route: '/admin/dashboard/projects' },
  { icon: MessageSquare, label: 'Messages', color: '#6366f1', route: '/admin/dashboard/messages' },
  { icon: Zap, label: 'New Update', color: '#f59e0b', route: '/admin/dashboard/updates' },
  { icon: Star, label: 'Add Skill', color: '#06b6d4', route: '/admin/dashboard/skills' },
  { icon: Eye, label: 'Preview Site', color: '#8b5cf6', route: '/admin/dashboard/preview' },
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
  const { theme, toggleTheme } = useTheme();
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
          <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--pcms-text)', lineHeight: 1.2, fontFamily: "''Space Grotesk'', sans-serif" }}>
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
              fontFamily: "''Space Grotesk'', sans-serif",
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

      {/* FAB Speed Dial Backdrop */}
      <AnimatePresence>
        {isSpeedDialOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsSpeedDialOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 8800, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
          />
        )}
      </AnimatePresence>

      {/* Speed Dial Action Buttons */}
      <AnimatePresence>
        {isSpeedDialOpen && (
          <div style={{ position: 'fixed', bottom: 138, right: 14, zIndex: 8900, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
            {SPEED_DIAL_ACTIONS.map((action, i) => (
              <motion.div key={action.label}
                initial={{ opacity: 0, y: 20, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.85 }}
                transition={{ duration: 0.18, delay: i * 0.045 }}
                style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ background: 'var(--pcms-panel, #18181c)', border: '1px solid var(--pcms-line, rgba(255,255,255,0.12))', color: 'var(--pcms-text)', fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.3)', whiteSpace: 'nowrap' }}>
                  {action.label}
                </div>
                <button onClick={() => { setIsSpeedDialOpen(false); navigate(action.route); }}
                  style={{ width: 44, height: 44, borderRadius: 22, background: action.color + '22', border: '1.5px solid ' + action.color + '55', color: action.color, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 14px ' + action.color + '33', flexShrink: 0 }}>
                  <action.icon size={20} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* FAB Button */}
      <motion.button
        onClick={() => setIsSpeedDialOpen(v => !v)}
        aria-label="Quick Actions"
        animate={{ rotate: isSpeedDialOpen ? 45 : 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        style={{
          position: 'fixed', bottom: 78, right: 16, zIndex: 8950,
          width: 50, height: 50, borderRadius: 25,
          background: isSpeedDialOpen ? 'linear-gradient(135deg, #ef4444, #f97316)' : 'linear-gradient(135deg, #6366f1, #3b82f6)',
          border: '1px solid rgba(255,255,255,0.2)', color: '#ffffff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: isSpeedDialOpen ? '0 8px 24px rgba(239,68,68,0.5)' : '0 8px 24px rgba(99,102,241,0.5)',
          cursor: 'pointer', transition: 'background 0.25s ease, box-shadow 0.25s ease',
        }}
      >
        <Plus size={24} />
      </motion.button>

      {/* Bottom Navigation */}
      <MobileNav
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        unreadMessagesCount={stats.unreadMessages}
      />
    </div>
  );
}
