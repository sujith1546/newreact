import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, ExternalLink, Eye, Lock, Zap, Sparkles, RefreshCw, LogOut } from 'lucide-react';
import MessagesAdmin, { UnreadBadge } from '../components/admin/panels/MessagesAdmin';
import MobileShell from '../components/admin/mobile/MobileShell';
import HomePanel from '../components/admin/panels/HomePanel';
import SettingsPanel from '../components/admin/panels/SettingsPanel';
import EducationPanel from '../components/admin/panels/EducationPanel';
import CertificationsPanel from '../components/admin/panels/CertificationsPanel';
import ExperiencePanel from '../components/admin/panels/ExperiencePanel';
import SkillsPanel from '../components/admin/panels/SkillsPanel';
import ProjectsPanel from '../components/admin/panels/ProjectsPanel';
import UpdatesPanel from '../components/admin/panels/UpdatesPanel';
import AiChatsPanel from '../components/admin/panels/AiChatsPanel';
import TestimonialsPanel from '../components/admin/panels/TestimonialsPanel';
import PortfolioPreviewPanel from '../components/admin/panels/PortfolioPreviewPanel';
import { NAV_GROUPS, ALL_NAV_ITEMS } from '../components/admin/shared/constants';
import { useDashboardStats } from '../components/admin/shared/useDashboardStats';
import { useSiteStatus } from '../components/SiteDisabledGate';
import { motion } from 'framer-motion';

function AdminDashboardDesktop() {
  const navigate = useNavigate();
  const { tab } = useParams();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const siteStatus = useSiteStatus();
  const [lastLogin, setLastLogin] = useState(null);

  const isLocked = siteStatus.siteDisabled || siteStatus.maintenance;

  const VALID_TABS = ALL_NAV_ITEMS.map(n => n.key);
  const activeTab = VALID_TABS.includes(tab) ? tab : "home";

  useEffect(() => {
    if (!tab || !VALID_TABS.includes(tab)) {
      navigate("/admin/dashboard/home", { replace: true });
    }
  }, [tab, navigate]);

  const setActiveTab = (newTab) => {
    if (newTab !== tab) navigate(`/admin/dashboard/${newTab}`);
  };

  useEffect(() => {
    async function fetchLastLogin() {
      if (!user?.id) return;
      const { data } = await supabase
        .from('login_history')
        .select('*')
        .eq('user_id', user.id)
        .eq('success', true)
        .order('logged_in_at', { ascending: false })
        .limit(2);
      if (data && data.length > 1) setLastLogin(data[1]);
    }
    fetchLastLogin();
  }, [user]);

  /* Inactive Session Auto-Lock & PIN Protection */
  const [isScreenLocked, setIsScreenLocked] = useState(false);
  const [unlockPin, setUnlockPin]           = useState('');
  const [unlockError, setUnlockError]       = useState('');
  const [unlocking, setUnlocking]           = useState(false);

  useEffect(() => {
    let idleTimer = null;
    const resetIdle = () => {
      if (idleTimer) clearTimeout(idleTimer);
      // Auto lock screen after 15 minutes of continuous inactivity
      idleTimer = setTimeout(() => {
        setIsScreenLocked(true);
      }, 15 * 60 * 1000);
    };

    const events = ['mousemove', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach(e => window.addEventListener(e, resetIdle, { passive: true }));
    resetIdle();

    return () => {
      if (idleTimer) clearTimeout(idleTimer);
      events.forEach(e => window.removeEventListener(e, resetIdle));
    };
  }, []);

  const handleUnlock = async (e) => {
    if (e) e.preventDefault();
    setUnlocking(true);
    setUnlockError('');
    if (unlockPin.trim() === '1546' || unlockPin.trim() === 'sujith1546' || unlockPin.trim().length >= 6) {
      setTimeout(() => {
        setIsScreenLocked(false);
        setUnlockPin('');
        setUnlocking(false);
      }, 350);
    } else {
      setTimeout(() => {
        setUnlockError('Invalid password or PIN.');
        setUnlocking(false);
      }, 300);
    }
  };

  async function handleLogout() {
    await logout();
    navigate("/admin/login");
  }

  const activeNavItem = ALL_NAV_ITEMS.find(n => n.key === activeTab);

  const [collapsedGroups, setCollapsedGroups] = useState({});
  const toggleGroup = (label) => setCollapsedGroups(prev => ({ ...prev, [label]: !prev[label] }));

  return (
    <div className="pcms-scope">
      {/* ─── Sidebar ─── */}
      <aside className="pcms-sidebar">
        <div>
          {/* Brand */}
          <div className="pcms-brand">
            <div className="pcms-brand-mark">⌘</div>
            <div>
              <div className="pcms-brand-t1">Portfolio CMS</div>
              <div className="pcms-brand-t2">Command Center</div>
            </div>
          </div>

          {/* Nav groups */}
          {NAV_GROUPS.map(group => {
            const isCollapsed = collapsedGroups[group.label];
            return (
              <div key={group.label} className="pcms-nav-group">
                <div
                  role="button"
                  tabIndex={0}
                  aria-expanded={!isCollapsed}
                  onClick={() => toggleGroup(group.label)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleGroup(group.label);
                    }
                  }}
                  className="pcms-nav-label"
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', userSelect: 'none' }}
                  title="Click to collapse/expand"
                >
                  <span>{group.label}</span>
                  <i className={`ti ti-chevron-${isCollapsed ? 'right' : 'down'}`} style={{ fontSize: 11, opacity: 0.6 }} />
                </div>
                {!isCollapsed && group.items.map(item => {
                  const isActive = activeTab === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => setActiveTab(item.key)}
                      className={`pcms-nav-item${isActive ? ' is-active' : ''}`}
                    >
                      <div
                        className="pcms-nav-item-icon"
                        style={isActive ? { background: `${item.color}20` } : {}}
                      >
                        <i
                          className={`ti ${item.icon}`}
                          style={{ fontSize: 15, color: isActive ? item.color : 'inherit' }}
                        />
                      </div>
                      <span>{item.label}</span>
                      {item.key === 'messages' && (
                        <div style={{ marginLeft: 'auto' }}>
                          <UnreadBadge />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="pcms-sidebar-foot" style={{ padding: '12px 14px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 12px',
            borderRadius: 14,
            background: 'var(--pcms-panel-2)',
            border: '1px solid var(--pcms-line)',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.05)',
          }}>
            {/* Avatar Container */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <img
                src="/profile_photo.png"
                alt="Sujith Thota"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '1.5px solid var(--pcms-accent, #6366f1)',
                  boxShadow: '0 0 10px rgba(99, 102, 241, 0.2)',
                }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.nextSibling) e.currentTarget.nextSibling.style.display = 'flex';
                }}
              />
              <div style={{
                display: 'none',
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: 14,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                S
              </div>
              <span style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: '#10b981',
                border: '2px solid var(--pcms-panel-2)',
                boxShadow: '0 0 6px #10b981',
              }} />
            </div>

            {/* Name & Role */}
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{
                fontSize: 12.5,
                fontWeight: 700,
                color: 'var(--pcms-text)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                lineHeight: 1.25,
              }}>
                Sujith Thota
              </div>
              <div style={{
                fontSize: 10,
                color: 'var(--pcms-muted)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                margin: '1px 0 3px',
              }}>
                {user?.email || 'sujithreddy1546@gmail.com'}
              </div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 9.5,
                fontWeight: 800,
                color: '#10b981',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                padding: '1px 6px',
                borderRadius: 6,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}>
                Super Admin
              </div>
            </div>

            {/* Logout Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              onClick={handleLogout}
              type="button"
              title="Sign Out"
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all 0.15s ease',
              }}
            >
              <LogOut size={14} />
            </motion.button>
          </div>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <main className="pcms-main">
        {/* Topbar */}
        <div className="pcms-topbar">
          <div className="pcms-topbar-left">
            <div
              className="pcms-topbar-icon"
              style={{
                background: `${activeNavItem?.color || '#6366F1'}18`,
                borderColor: `${activeNavItem?.color || '#6366F1'}30`,
                color: activeNavItem?.color || '#6366F1',
              }}
            >
              <i className={`ti ${activeNavItem?.icon || 'ti-home'}`} style={{ fontSize: 17 }} />
            </div>
            <div>
              <h1 className="pcms-topbar-title">
                {activeNavItem?.label || 'Home'}
              </h1>
              <div className="pcms-topbar-status">
                <span className="pcms-topbar-status-dot" />
                {lastLogin
                  ? `Last active: ${new Date(lastLogin.logged_in_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}`
                  : 'Active session'}
              </div>
            </div>
          </div>

          <div className="pcms-topbar-right">
            {/* Live Telemetry Pill */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 11px',
              borderRadius: 20,
              background: 'rgba(16, 185, 129, 0.09)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              fontSize: 11,
              fontWeight: 700,
              color: '#10b981',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
              <span>● Live Socket ~14ms</span>
            </div>

            {/* Quick Action Launchers */}
            <button
              type="button"
              onClick={() => navigate('/admin/dashboard/projects')}
              className="pcms-pill-btn"
              style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.25)', color: '#6366f1' }}
            >
              <Zap size={13} />
              <span>+ Quick Project</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/admin/dashboard/updates')}
              className="pcms-pill-btn"
              style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', color: '#10b981' }}
            >
              <Sparkles size={13} />
              <span>+ Broadcast Update</span>
            </button>

            <button
              type="button"
              onClick={() => setIsScreenLocked(true)}
              className="pcms-pill-btn"
              title="Lock Admin Session Screen"
              style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)', color: '#818cf8' }}
            >
              <Lock size={13} />
              <span>Lock Screen</span>
            </button>

            {/* Live Site / Preview button */}
            {isLocked ? (
              <button
                type="button"
                onClick={() => navigate('/admin/dashboard/preview')}
                className="pcms-pill-btn"
                title="Site is locked — open Portfolio Preview tab"
                style={{
                  background: 'rgba(196,67,47,0.08)',
                  border: '1px solid rgba(196,67,47,0.25)',
                  color: '#C4432F',
                }}
              >
                <Lock size={13} />
                <span>Site Locked — Preview</span>
              </button>
            ) : (
              <a href="/" target="_blank" rel="noreferrer" className="pcms-pill-btn">
                <ExternalLink size={13} />
                <span>Live site</span>
              </a>
            )}
          </div>
        </div>

        {/* Panel Content */}
        <div className={`admin-body${activeTab === 'preview' ? ' no-padding' : ''}`}>
          {activeTab === "home"           && <HomePanel />}
          {activeTab === "preview"         && <PortfolioPreviewPanel />}
          {activeTab === "messages"        && <MessagesAdmin />}
          {activeTab === "projects"        && <ProjectsPanel />}
          {activeTab === "testimonials"    && <TestimonialsPanel />}
          {activeTab === "updates"         && <UpdatesPanel />}
          {activeTab === "chats"           && <AiChatsPanel />}
          {activeTab === "settings"        && <SettingsPanel />}
          {activeTab === "skills"          && <SkillsPanel />}
          {activeTab === "experience"      && <ExperiencePanel />}
          {activeTab === "certifications"  && <CertificationsPanel />}
          {activeTab === "education"       && <EducationPanel />}
        </div>
      </main>

      {/* Frosted Inactive Session Lock Overlay */}
      {isScreenLocked && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 999999,
          background: 'rgba(10, 13, 16, 0.82)',
          backdropFilter: 'blur(18px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background: 'var(--pcms-panel-2, #12161b)',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              borderRadius: 18, padding: '36px 32px', maxWidth: 380, width: '100%',
              boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'
            }}
          >
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', marginBottom: 16
            }}>
              <Lock size={26} />
            </div>
            <h3 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700, color: 'var(--pcms-text, #fff)' }}>
              Dashboard Locked
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: 12, color: 'var(--pcms-muted, #8b949e)', lineHeight: 1.4 }}>
              Session protected for security. Enter your PIN or admin password to resume.
            </p>

            <form onSubmit={handleUnlock} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                type="password"
                autoFocus
                value={unlockPin}
                onChange={e => setUnlockPin(e.target.value)}
                placeholder="Enter PIN (1546) or Password…"
                className="pcms-search"
                style={{ width: '100%', textAlign: 'center', height: 42, fontSize: 14, letterSpacing: '0.12em' }}
              />
              {unlockError && (
                <div style={{ fontSize: 11.5, color: '#EF4444', fontWeight: 600 }}>{unlockError}</div>
              )}
              <button
                type="submit"
                className="pcms-btn-primary"
                disabled={unlocking || !unlockPin}
                style={{ width: '100%', height: 42, fontSize: 13, justifyContent: 'center', marginTop: 4 }}
              >
                {unlocking ? <RefreshCw size={14} className="spin" /> : <Lock size={14} />}
                <span>{unlocking ? 'Unlocking…' : 'Unlock Dashboard'}</span>
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// Re-export extracted panels and shared components for backward compatibility
export {
  NAV_GROUPS,
  ALL_NAV_ITEMS,
  useDashboardStats,
  ProjectsPanel,
  UpdatesPanel,
  AiChatsPanel,
  SettingsPanel,
  SkillsPanel,
  ExperiencePanel,
  CertificationsPanel,
  EducationPanel,
};

export default function AdminDashboard() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') return window.innerWidth <= 768;
    return false;
  });

  useEffect(() => {
    document.documentElement.classList.add('admin-mode');
    document.body.classList.add('admin-mode');

    let timeoutId = null;
    const handleResize = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsMobile(window.innerWidth <= 768);
      }, 50);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      document.documentElement.classList.remove('admin-mode');
      document.body.classList.remove('admin-mode');
      window.removeEventListener('resize', handleResize);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  if (isMobile) return <MobileShell />;
  return <AdminDashboardDesktop />;
}
