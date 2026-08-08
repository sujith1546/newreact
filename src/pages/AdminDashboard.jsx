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
