import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, ExternalLink, Eye, Lock } from 'lucide-react';
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

const DESKTOP_DOCK_TABS = [
  { key: 'home', label: 'Home', icon: 'ti-home', color: '#6366f1' },
  { key: 'messages', label: 'Inbox', icon: 'ti-message-circle', color: '#3b82f6' },
  { key: 'projects', label: 'Projects', icon: 'ti-briefcase', color: '#10b981' },
  { key: 'settings', label: 'System', icon: 'ti-settings', color: '#ec4899' },
];

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
        <div className="pcms-sidebar-foot">
          <div className="pcms-user-row">
            <div className="pcms-user-avatar">
              {user?.email?.[0]?.toUpperCase() || 'A'}
            </div>
            <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
              <div className="pcms-user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email || 'admin@portfolio.dev'}
              </div>
              <div className="pcms-user-role">⬤ Super admin</div>
            </div>
            <svg
              onClick={handleLogout}
              className="pcms-user-exit"
              width="16" height="16"
              viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8"
              title="Sign out"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="M16 17l5-5-5-5M21 12H9" />
            </svg>
          </div>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <main className="pcms-main">
        {/* Glassmorphic Floating Dock Topbar */}
        <div
          className="pcms-topbar"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            padding: '10px 18px',
            borderRadius: 20,
            background: 'var(--pcms-panel-2, rgba(18, 18, 22, 0.85))',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--pcms-line, rgba(255, 255, 255, 0.14))',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
            marginBottom: 20,
          }}
        >
          {/* Left: Active Title & Status */}
          <div className="pcms-topbar-left" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              className="pcms-topbar-icon"
              style={{
                background: `${activeNavItem?.color || '#6366F1'}18`,
                borderColor: `${activeNavItem?.color || '#6366F1'}30`,
                color: activeNavItem?.color || '#6366F1',
                width: 36,
                height: 36,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <i className={`ti ${activeNavItem?.icon || 'ti-home'}`} style={{ fontSize: 17 }} />
            </div>
            <div>
              <h1 className="pcms-topbar-title" style={{ margin: 0, fontSize: 15, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>
                {activeNavItem?.label || 'Home'}
              </h1>
              <div className="pcms-topbar-status" style={{ fontSize: 11, color: 'var(--pcms-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span className="pcms-topbar-status-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
                {lastLogin
                  ? `Last active: ${new Date(lastLogin.logged_in_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}`
                  : 'Active session'}
              </div>
            </div>
          </div>

          {/* Center: Floating Dock Category Navigation Pills */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: 'var(--pcms-panel, rgba(255,255,255,0.04))',
            padding: '4px 6px',
            borderRadius: 16,
            border: '1px solid var(--pcms-line-soft)',
          }}>
            {DESKTOP_DOCK_TABS.map((dockTab) => {
              const isDockActive = activeTab === dockTab.key ||
                (dockTab.key === 'messages' && (activeTab === 'messages' || activeTab === 'chats')) ||
                (dockTab.key === 'projects' && ['projects', 'testimonials', 'updates', 'skills', 'experience', 'education', 'certifications', 'preview'].includes(activeTab)) ||
                (dockTab.key === 'settings' && activeTab === 'settings');

              return (
                <button
                  key={dockTab.key}
                  onClick={() => setActiveTab(dockTab.key)}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    padding: '7px 14px',
                    borderRadius: 12,
                    border: 'none',
                    background: 'transparent',
                    color: isDockActive ? dockTab.color : 'var(--pcms-muted)',
                    fontSize: 12,
                    fontWeight: isDockActive ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'color 0.2s ease',
                  }}
                >
                  {isDockActive && (
                    <motion.div
                      layoutId="desktopDockActivePill"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 12,
                        background: `${dockTab.color}18`,
                        border: `1px solid ${dockTab.color}40`,
                      }}
                    />
                  )}
                  <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <i className={`ti ${dockTab.icon}`} style={{ fontSize: 14, color: isDockActive ? dockTab.color : 'inherit' }} />
                    <span>{dockTab.label}</span>
                    {dockTab.key === 'messages' && (
                      <UnreadBadge />
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right: Theme Toggle & Live Site Action Buttons */}
          <div className="pcms-topbar-right" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={toggleTheme} className="pcms-pill-btn" type="button">
              {theme === 'dark'
                ? <Sun size={13} />
                : <Moon size={13} />}
              <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
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
