import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, Eye } from 'lucide-react';
import MessagesAdmin, { UnreadBadge } from '../components/admin/panels/MessagesAdmin';

import SettingsPanel from '../components/admin/panels/SettingsPanel';
import EducationPanel from '../components/admin/panels/EducationPanel';
import CertificationsPanel from '../components/admin/panels/CertificationsPanel';
import ExperiencePanel from '../components/admin/panels/ExperiencePanel';
import SkillsPanel from '../components/admin/panels/SkillsPanel';
import ProjectsPanel from '../components/admin/panels/ProjectsPanel';
import UpdatesPanel from '../components/admin/panels/UpdatesPanel';
import AssetsPanel from '../components/admin/panels/AssetsPanel';
import ThemeStudioPanel from '../components/admin/panels/ThemeStudioPanel';
import BackupRestorePanel from '../components/admin/panels/BackupRestorePanel';
import AuditHealthPanel from '../components/admin/panels/AuditHealthPanel';
import CopilotPanel from '../components/admin/panels/CopilotPanel';
import AiChatsPanel from '../components/admin/panels/AiChatsPanel';
import AnalyticsPanel from '../components/admin/panels/AnalyticsPanel';

import { NAV_GROUPS, ALL_NAV_ITEMS, styles } from '../components/admin/shared/constants';
import { useDashboardStats } from '../components/admin/shared/useDashboardStats';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { tab } = useParams();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTabState] = useState(tab || "messages");
  const [lastLogin, setLastLogin] = useState(null);
  const stats = useDashboardStats();

  useEffect(() => {
    if (tab && tab !== activeTab) {
      setActiveTabState(tab);
    } else if (!tab) {
      navigate("/admin/dashboard/messages", { replace: true });
    }
  }, [tab, activeTab, navigate]);

  const setActiveTab = (newTab) => {
    setActiveTabState(newTab);
    navigate(`/admin/dashboard/${newTab}`);
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
      
      if (data && data.length > 1) {
        setLastLogin(data[1]);
      }
    }
    fetchLastLogin();
  }, [user]);

  async function handleLogout() {
    await logout();
    navigate("/admin/login");
  }

  const activeNavItem = ALL_NAV_ITEMS.find(n => n.key === activeTab);

  return (
    <div className="admin-shell">
      {/* ─── Sidebar ─── */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <div className="admin-logo-icon">
            <i className="ti ti-command" style={{ fontSize: 18, color: '#fff' }} />
          </div>
          <div>
            <p className="admin-logo-title">Portfolio CMS</p>
            <p className="admin-logo-sub">Admin Console</p>
          </div>
        </div>

        {/* Nav groups */}
        <div className="admin-nav-scroll">
          {NAV_GROUPS.map(group => (
            <div key={group.label} className="admin-nav-group">
              <p className="admin-nav-group-label">{group.label}</p>
              {group.items.map(item => {
                const isActive = activeTab === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveTab(item.key)}
                    className={`admin-nav-btn${isActive ? ' active' : ''}`}
                    style={{
                      background: isActive ? `${item.color}14` : 'transparent',
                      color: isActive ? item.color : undefined,
                      borderLeft: isActive ? `3px solid ${item.color}` : '3px solid transparent'
                    }}
                  >
                    <div
                      className="admin-nav-icon-wrap"
                      style={{ background: isActive ? `${item.color}22` : 'transparent' }}
                    >
                      <i
                        className={`ti ${item.icon}`}
                        style={{ fontSize: 15, color: isActive ? item.color : 'var(--text-muted)' }}
                      />
                    </div>
                    <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
                    {item.key === 'messages' && (
                      <div style={{ marginLeft: 'auto' }}>
                        <UnreadBadge />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="admin-sidebar-footer">
          <div className="admin-user-info" style={{ minWidth: 0, flex: 1, marginRight: 8 }}>
            <div className="admin-avatar">
              {user?.email?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="admin-user-meta" style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
              <p className="admin-user-email" style={{ margin: 0, fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email || 'admin@portfolio'}</p>
              <p className="admin-user-role" style={{ margin: 0, fontSize: 10, color: 'var(--text-muted)' }}>Super Admin</p>
            </div>
          </div>

          <button onClick={handleLogout} className="admin-logout-btn" title="Log Out">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <main className="admin-main">
        {/* Advanced Top Navigation Bar */}
        <header className="admin-header">
          <div className="admin-header-title-wrap">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ 
                width: 28, height: 28, borderRadius: 8, 
                background: `${activeNavItem?.color || '#3b82f6'}1a`, 
                display: 'flex', alignItems: 'center', justifyContent: 'center' 
              }}>
                <i className={`ti ${activeNavItem?.icon || 'ti-dashboard'}`} style={{ fontSize: 15, color: activeNavItem?.color || '#3b82f6' }} />
              </div>
              <h1 className="admin-header-title">
                {activeNavItem?.label || 'Dashboard'}
              </h1>
            </div>
            {lastLogin && (
              <p className="admin-header-sub">
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                Last active session: {new Date(lastLogin.logged_in_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })} ({lastLogin.ip_address})
              </p>
            )}
          </div>

          <div className="admin-header-actions">
            <button
              onClick={toggleTheme}
              className="admin-topbar-pill-btn"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              <i className={theme === 'dark' ? 'ti ti-sun' : 'ti ti-moon'} style={{ fontSize: 15, color: theme === 'dark' ? '#f59e0b' : '#6366f1' }} />
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            <a href="/" target="_blank" rel="noreferrer" className="admin-topbar-pill-btn" title="View live portfolio site">
              <Eye size={15} color="var(--primary-blue)" />
              <span>Live Site</span>
            </a>
          </div>
        </header>

        {/* Dynamic Panel Mounting */}
        <div className="admin-body">
          <div>
            {activeTab === "messages"       && <MessagesAdmin />}
            {activeTab === "projects"       && <ProjectsPanel />}
            {activeTab === "updates"        && <UpdatesPanel />}
            {activeTab === "chats"          && <AiChatsPanel />}
            {activeTab === "settings"       && <SettingsPanel />}
            {activeTab === "skills"         && <SkillsPanel />}
            {activeTab === "experience"     && <ExperiencePanel />}
            {activeTab === "certifications" && <CertificationsPanel />}
            {activeTab === "education"      && <EducationPanel />}
            {activeTab === "analytics"      && <AnalyticsPanel />}
            {activeTab === "copilot"        && <CopilotPanel />}
            {activeTab === "assets"         && <AssetsPanel />}
            {activeTab === "theme"          && <ThemeStudioPanel />}
            {activeTab === "backup"         && <BackupRestorePanel />}
            {activeTab === "audit"          && <AuditHealthPanel />}
          </div>
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
  AnalyticsPanel,
  CopilotPanel,
  AssetsPanel,
  ThemeStudioPanel,
  BackupRestorePanel,
  AuditHealthPanel,
};
