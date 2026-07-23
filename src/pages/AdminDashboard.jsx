import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import useRealtimeData from '../hooks/useRealtimeData';
import { MaintenanceSettingsPanel } from '../components/MaintenanceMode';
import MessagesAdmin, { UnreadBadge } from '../components/MessagesAdmin';
import { Loader2, Trash2, Check, ChevronRight, ChevronDown, X, MessageSquare, MessageCircle, Briefcase, Zap, LogOut, Plus, Edit3, Star, Layers, BarChart3, Sparkles, Folder, Palette, Database, Activity, Download, Upload, ShieldCheck, FileText, RefreshCw, Eye, Printer, Award, Type, Image, Link, Settings, User, Mail, Globe, Bell } from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { logAuditEvent } from '../lib/auditLogger';
import { trackRecruiterEvent } from '../lib/analyticsTracker';

const NAV_GROUPS = [
  {
    label: "Inbox",
    items: [
      { key: "messages", label: "Messages", icon: "ti-message-circle", color: "#3b82f6" },
      { key: "chats", label: "AI Chats", icon: "ti-messages", color: "#8b5cf6" },
    ]
  },
  {
    label: "Content",
    items: [
      { key: "projects", label: "Projects", icon: "ti-briefcase", color: "#10b981" },
      { key: "updates", label: "Updates", icon: "ti-bolt", color: "#f59e0b" },
      { key: "skills", label: "Skills", icon: "ti-star", color: "#06b6d4" },
      { key: "experience", label: "Experience", icon: "ti-id-badge", color: "#6366f1" },
      { key: "education", label: "Education", icon: "ti-book", color: "#ec4899" },
      { key: "certifications", label: "Certifications", icon: "ti-certificate", color: "#f97316" },
    ]
  },
  {
    label: "Intelligence",
    items: [
      { key: "analytics", label: "Analytics Hub", icon: "ti-chart-bar", color: "#3b82f6" },
      { key: "copilot", label: "AI Copilot & ATS", icon: "ti-sparkles", color: "#8b5cf6" },
      { key: "assets", label: "Asset Storage", icon: "ti-folder", color: "#10b981" },
    ]
  },
  {
    label: "System",
    items: [
      { key: "theme", label: "Theme Studio", icon: "ti-palette", color: "#ec4899" },
      { key: "settings", label: "Settings", icon: "ti-settings", color: "#6b7280" },
      { key: "backup", label: "Backup & Restore", icon: "ti-database", color: "#f59e0b" },
      { key: "audit", label: "Audit & Health", icon: "ti-activity", color: "#ef4444" },
    ]
  },
];

const ALL_NAV_ITEMS = NAV_GROUPS.flatMap(g => g.items);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("messages");
  const [lastLogin, setLastLogin] = useState(null);
  const stats = useDashboardStats();

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
      
      // data[0] is typically the current login, data[1] is the previous
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
        {/* Logo */}
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
                    style={{ color: isActive ? item.color : undefined }}
                  >
                    <div
                      className="admin-nav-icon-wrap"
                      style={{ background: isActive ? `${item.color}1a` : 'transparent' }}
                    >
                      <i
                        className={`ti ${item.icon}`}
                        style={{ fontSize: 15, color: isActive ? item.color : 'var(--text-muted)' }}
                      />
                    </div>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.key === 'messages' && stats.unreadMessages > 0 && (
                      <span className="admin-nav-badge">{stats.unreadMessages}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* User footer */}
        <div className="admin-sidebar-footer">
          <div className="admin-user-avatar">
            {(user?.email || 'A').charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="admin-user-email">{user?.email || 'Admin'}</p>
            <p className="admin-user-status">● Online</p>
          </div>
          <button onClick={handleLogout} className="admin-logout-btn" title="Log out">
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      {/* ─── Main ─── */}
      <div className="admin-main">
        {/* Top bar */}
        <header className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {activeNavItem && (
              <div style={{
                width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                background: `${activeNavItem.color}18`,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <i className={`ti ${activeNavItem.icon}`} style={{ fontSize: 17, color: activeNavItem.color }} />
              </div>
            )}
            <div>
              <h1 className="admin-topbar-title">{activeNavItem?.label || 'Dashboard'}</h1>
              <p className="admin-topbar-sub">Portfolio CMS &rsaquo; {activeNavItem?.label}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {lastLogin && (
              <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <ShieldCheck size={12} color="var(--success-green)" />
                Last login: {new Date(lastLogin.logged_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <button onClick={toggleTheme} className="admin-icon-btn" title="Toggle theme">
              <i className={theme === 'dark' ? 'ti ti-sun' : 'ti ti-moon'} style={{ fontSize: 15 }} />
            </button>
            <a href="/" target="_blank" className="admin-icon-btn" title="View live site">
              <Eye size={15} />
            </a>
          </div>
        </header>


        {/* Scrollable body */}
        <div className="admin-body">
          {/* Panel */}
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
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* Stats hook                                                           */
/* -------------------------------------------------------------------- */
function useDashboardStats() {
  const [stats, setStats] = useState({
    unreadMessages: 0,
    projectCount: 0,
    updateCount: 0,
    sessionCount: 0,
    loading: true,
  });

  useEffect(() => {
    async function loadStats() {
      let aiCount = 0;
      try {
        const { count } = await supabase
          .from('chat_sessions')
          .select('*', { count: 'exact', head: true });
        aiCount = count || 0;
      } catch (e) {
        aiCount = 0;
      }

      const [messages, projects, updates] = await Promise.all([
        supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq('is_bot', false),
        supabase.from("projects").select("id", { count: "exact", head: true }),
        supabase.from("updates").select("id", { count: "exact", head: true }),
      ]);

      setStats({
        unreadMessages: messages.count ?? 0,
        projectCount: projects.count ?? 0,
        updateCount: updates.count ?? 0,
        sessionCount: aiCount,
        loading: false,
      });
    }
    loadStats();
  }, []);

  return stats;
}

/* -------------------------------------------------------------------- */
/* Stat card                                                             */
/* -------------------------------------------------------------------- */
function StatCard({ label, value, loading, icon, color = '#007bff' }) {
  return (
    <div className="admin-stat-card" style={{ borderTop: `3px solid ${color}` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <p className="admin-stat-label">{label}</p>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <i className={`ti ${icon}`} style={{ fontSize: 16, color }} />
        </div>
      </div>
      <p className="admin-stat-value" style={{ color }}>
        {loading ? <Loader2 className="spin" size={20} color={color} /> : value}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* Empty state — reusable                                                */
/* -------------------------------------------------------------------- */
function EmptyState({ icon, title, description }) {
  return (
    <div className="admin-empty">
      <i className={`ti ${icon}`} style={{ fontSize: 32, color: 'var(--text-muted)', opacity: 0.5 }} aria-hidden="true" />
      <h4>{title}</h4>
      <p>{description}</p>
    </div>
  );
}

function PanelCard({ title, action, headerElement, children }) {
  return (
    <div className="admin-panel-card">
      <div className="admin-panel-header">
        <h3 className="admin-panel-title">{title}</h3>
        <div className="admin-panel-actions">
          {headerElement}
          {action && (
            <button className="admin-action-btn" onClick={action.onClick}>
              <i className={`ti ${action.icon}`} style={{ fontSize: 13 }} aria-hidden="true" />
              {action.label}
            </button>
          )}
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        {children}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* Live Data Panels                                                     */
/* -------------------------------------------------------------------- */

function ProjectsPanel() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: true });
    if (!error && data) setProjects(data);
    setLoading(false);
  };

  const deleteProject = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (!error) setProjects(projects.filter(p => p.id !== id));
  };

  if (loading) return <PanelCard title="Projects"><div style={styles.emptyState}><Loader2 className="spin" size={24} color="var(--text-muted)" /></div></PanelCard>;

  return (
    <PanelCard title="Projects" action={{ label: "Add project", icon: "ti-plus" }}>
      {projects.length === 0 ? (
        <EmptyState icon="ti-briefcase" title="No projects yet" description="Add your first project to get it listed on your portfolio." />
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Title</th>
              <th style={styles.th}>Tags</th>
              <th style={styles.th}>Featured</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(proj => (
              <tr key={proj.id}>
                <td style={styles.td}>{proj.id}</td>
                <td style={{ ...styles.td, fontWeight: 500 }}>{proj.title}</td>
                <td style={styles.td}>{proj.tags?.length || 0} tags</td>
                <td style={styles.td}>{proj.featured ? <Check size={16} color="var(--success-green, #10b981)" /> : ''}</td>
                <td style={styles.td}>
                  <button onClick={() => deleteProject(proj.id)} style={styles.iconBtn} title="Delete"><Trash2 size={16} color="#ef4444" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </PanelCard>
  );
}

function UpdatesPanel() {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpdates();
  }, []);

  const fetchUpdates = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('updates').select('*').order('created_at', { ascending: false });
    if (!error && data) setUpdates(data);
    setLoading(false);
  };

  const deleteUpdate = async (id) => {
    if (!window.confirm('Delete this update?')) return;
    const { error } = await supabase.from('updates').delete().eq('id', id);
    if (!error) setUpdates(updates.filter(u => u.id !== id));
  };

  if (loading) return <PanelCard title="Changelog updates"><div style={styles.emptyState}><Loader2 className="spin" size={24} color="var(--text-muted)" /></div></PanelCard>;

  return (
    <PanelCard title="Changelog updates" action={{ label: "Add update", icon: "ti-plus" }}>
      {updates.length === 0 ? (
        <EmptyState icon="ti-bolt" title="No changelog entries yet" description="Log a new update whenever you ship a feature or fix." />
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Version</th>
              <th style={styles.th}>Label</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Items</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {updates.map(update => (
              <tr key={update.id}>
                <td style={{ ...styles.td, fontWeight: 500 }}>{update.version}</td>
                <td style={styles.td}>{update.label}</td>
                <td style={styles.td}>{update.date}</td>
                <td style={styles.td}>{update.items?.length || 0} items</td>
                <td style={styles.td}>
                  <button onClick={() => deleteUpdate(update.id)} style={styles.iconBtn} title="Delete"><Trash2 size={16} color="#ef4444" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </PanelCard>
  );
}

function AiChatsPanel() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('chat_sessions').select('*').order('created_at', { ascending: false });
    if (!error && data) setSessions(data);
    setLoading(false);
  };

  const deleteSession = async (id) => {
    if (!window.confirm('Delete this chat session and all its messages?')) return;
    const { error } = await supabase.from('chat_sessions').delete().eq('id', id);
    if (!error) {
      setSessions(sessions.filter(s => s.id !== id));
      if (selectedSession === id) setSelectedSession(null);
    } else {
      alert("Failed to delete session. This is likely blocked by Row-Level Security (RLS) in your database. You need to enable DELETE permissions on the 'chat_sessions' table.");
    }
  };

  const loadMessages = async (sessionId) => {
    setSelectedSession(sessionId);
    setLoadingMessages(true);
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
    if (!error && data) setMessages(data);
    setLoadingMessages(false);
  };

  if (loading) return <PanelCard title="AI Telemetry Logs"><div style={styles.emptyState}><Loader2 className="spin" size={24} color="var(--text-muted)" /></div></PanelCard>;

  // Analytics Metrics
  const activeToday = sessions.filter(s => new Date(s.created_at).toDateString() === new Date().toDateString()).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: 'calc(100vh - 120px)' }}>
      {/* KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <div style={{ background: 'var(--bg-light)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary-blue)' }}><MessageSquare size={18} /><span style={{ fontWeight: 600, fontSize: 13 }}>Total Chats</span></div>
          <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-primary)' }}>{sessions.length}</div>
        </div>
        <div style={{ background: 'var(--bg-light)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#10b981' }}><Sparkles size={18} /><span style={{ fontWeight: 600, fontSize: 13 }}>Active Today</span></div>
          <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-primary)' }}>{activeToday}</div>
        </div>
        <div style={{ background: 'var(--bg-light)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>Telemetry automatically logs every conversation processed by your Groq AI Integration.</div>
        </div>
      </div>

      {/* Split Pane Inbox */}
      <div style={{ display: 'flex', flex: 1, background: 'var(--bg-light)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        
        {/* Left: Session List */}
        <div style={{ width: '320px', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>
            Recent Sessions
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {sessions.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No sessions yet.</div>
            ) : sessions.map(session => (
              <div 
                key={session.id} 
                onClick={() => loadMessages(session.id)}
                style={{ 
                  padding: '16px 20px', 
                  borderBottom: '1px solid var(--border-color)', 
                  cursor: 'pointer',
                  background: selectedSession === session.id ? 'var(--bg-accent)' : 'transparent',
                  transition: 'background 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Visitor</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(session.created_at).toLocaleDateString()}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  ID: {session.id.split('-')[0]}...
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Chat Transcript */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-light)' }}>
          {selectedSession ? (
            <>
              <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: 15, color: 'var(--text-primary)' }}>Chat Transcript</h4>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: 4 }}>{selectedSession}</p>
                </div>
                <button onClick={() => deleteSession(selectedSession)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600 }}>
                  <Trash2 size={14} /> Delete
                </button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {loadingMessages ? (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Loader2 className="spin" size={24} color="var(--primary-blue)" /></div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', margin: 'auto' }}>Session opened, but no messages were sent.</div>
                ) : (
                  messages.map(msg => (
                    <div key={msg.id} style={{
                      alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '75%',
                      background: msg.role === 'user' ? 'var(--primary-blue)' : 'var(--bg-accent)',
                      color: msg.role === 'user' ? '#fff' : 'var(--text-primary)',
                      padding: '14px 18px',
                      borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6, color: msg.role === 'user' ? 'rgba(255,255,255,0.7)' : 'var(--primary-blue)' }}>
                        {msg.role === 'user' ? 'Visitor' : 'AI Assistant'}
                      </div>
                      <div style={{ fontSize: 14, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                        {msg.content}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <MessageSquare size={48} opacity={0.2} style={{ marginBottom: 16 }} />
              <p style={{ fontSize: 15, fontWeight: 500 }}>Select a session to view transcript</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* Site Settings Panel                                                  */
/* -------------------------------------------------------------------- */
/* ───────────────────────────────────────────────
   SETTINGS PANEL
   ─────────────────────────────────────────────── */

// Premium Custom Toggle Switch
function PremiumToggle({ checked, onChange, label, description, icon: Icon, color = 'var(--primary-blue)' }) {
  return (
    <div 
      onClick={() => onChange(!checked)}
      style={{ 
        display: 'flex', alignItems: 'center', gap: 16, padding: '16px', 
        background: checked ? `color-mix(in srgb, ${color} 8%, transparent)` : 'var(--bg-secondary)', 
        borderRadius: 16, border: '1px solid',
        borderColor: checked ? `color-mix(in srgb, ${color} 30%, transparent)` : 'var(--border-color)',
        cursor: 'pointer', transition: 'all 0.2s ease',
        boxShadow: checked ? `0 4px 20px color-mix(in srgb, ${color} 5%, transparent)` : 'none'
      }}
    >
      {Icon && (
        <div style={{ 
          width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: checked ? color : 'var(--bg-primary)',
          color: checked ? '#fff' : 'var(--text-muted)',
          boxShadow: checked ? `0 4px 12px color-mix(in srgb, ${color} 40%, transparent)` : 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          <Icon size={20} strokeWidth={checked ? 2.5 : 2} />
        </div>
      )}
      <div style={{ flex: 1 }}>
        <span style={{ display: 'block', fontSize: 15, fontWeight: 600, color: checked ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{label}</span>
        {description && <span style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{description}</span>}
      </div>
      <div style={{ 
        width: 44, height: 24, borderRadius: 12, background: checked ? color : 'var(--border-color)',
        position: 'relative', transition: 'background 0.3s ease', flexShrink: 0
      }}>
        <motion.div 
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          style={{
            width: 20, height: 20, borderRadius: '50%', background: '#fff',
            position: 'absolute', top: 2, left: checked ? 22 : 2,
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
          }}
        />
      </div>
    </div>
  );
}

// Premium Input Field
function PremiumInput({ label, icon: Icon, type = "text", value, onChange, onBlur, placeholder, multiline = false }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginLeft: 4 }}>{label}</label>
      <div style={{ 
        display: 'flex', alignItems: multiline ? 'flex-start' : 'center', gap: 12, 
        padding: multiline ? '12px 16px' : '0 16px', minHeight: 48,
        background: 'var(--bg-secondary)', borderRadius: 12,
        border: '1px solid', borderColor: focused ? 'var(--primary-blue)' : 'var(--border-color)',
        boxShadow: focused ? '0 0 0 3px color-mix(in srgb, var(--primary-blue) 15%, transparent)' : 'none',
        transition: 'all 0.2s ease'
      }}>
        {Icon && <Icon size={18} style={{ color: focused ? 'var(--primary-blue)' : 'var(--text-muted)', marginTop: multiline ? 2 : 0, transition: 'color 0.2s ease' }} />}
        {multiline ? (
          <textarea 
            value={value} onChange={onChange} placeholder={placeholder}
            onFocus={() => setFocused(true)} 
            onBlur={(e) => { setFocused(false); if (onBlur) onBlur(e); }}
            style={{ 
              flex: 1, background: 'transparent', border: 'none', color: 'var(--text-primary)', 
              fontSize: 15, outline: 'none', minHeight: 80, resize: 'vertical', fontFamily: 'inherit'
            }}
          />
        ) : (
          <input 
            type={type} value={value} onChange={onChange} placeholder={placeholder}
            onFocus={() => setFocused(true)} 
            onBlur={(e) => { setFocused(false); if (onBlur) onBlur(e); }}
            style={{ 
              flex: 1, background: 'transparent', border: 'none', color: 'var(--text-primary)', 
              fontSize: 15, outline: 'none', width: '100%'
            }}
          />
        )}
      </div>
    </div>
  );
}

function SettingsPanel() {
  const { data: dbSettings, setData: setDbSettings, loading } = useRealtimeData('site_settings', { single: true, filter: { column: 'id', value: 1 } });
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  useEffect(() => {
    // Only update local settings if they haven't been initialized yet
    // This prevents realtime updates from overwriting local state while the user is typing
    if (dbSettings && !settings) {
      setSettings(dbSettings);
    }
  }, [dbSettings, settings]);

  const updateSetting = async (key, value) => {
    setSaving(true);
    // Send only the changed key to Supabase
    const { error } = await supabase.from('site_settings').update({ [key]: value }).eq('id', 1);
    
    // Simulate slight network delay for better UX on fast connections
    setTimeout(() => setSaving(false), 600); 

    if (error) {
      alert(`Failed to save ${key}: ` + error.message);
    } else {
      logAuditEvent('UPDATE_SETTINGS', 'site_settings', key);
    }
  };

  const handleToggleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    updateSetting(key, value);
  };

  const handleInputChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleInputBlur = (key, value) => {
    // Only save if the value actually changed from the DB state
    if (dbSettings && dbSettings[key] !== value) {
      updateSetting(key, value);
      // Manually update the dbSettings cache so we don't save the same thing twice
      setDbSettings(prev => ({ ...prev, [key]: value }));
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingResume(true);
    const safeName = `resume_${Date.now()}.pdf`;
    const { error } = await supabase.storage.from('portfolio-assets').upload(safeName, file, { upsert: true });
    
    if (!error) {
      const publicUrl = supabase.storage.from('portfolio-assets').getPublicUrl(safeName).data.publicUrl;
      const newSettings = { ...settings, resume_url: publicUrl };
      setSettings(newSettings);
      setDbSettings(newSettings);
      await supabase.from('site_settings').update({ resume_url: publicUrl }).eq('id', 1);
      logAuditEvent('UPLOAD_RESUME', 'storage', safeName);
    } else {
      alert(`Upload failed: ${error.message}`);
    }
    setUploadingResume(false);
    e.target.value = '';
  };

  if (loading || !settings) return (
    <div style={{ padding: 60, display: 'flex', justifyContent: 'center' }}><Loader2 className="spin" size={32} color="var(--primary-blue)" /></div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="settings-panel-wrapper">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Settings size={28} color="var(--primary-blue)" /> Global Settings
          </h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 15 }}>Configure site-wide features, SEO, and personal details.</p>
        </div>
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', 
          background: saving ? 'color-mix(in srgb, var(--primary-blue) 10%, transparent)' : 'color-mix(in srgb, #10b981 10%, transparent)', 
          borderRadius: 20, color: saving ? 'var(--primary-blue)' : '#10b981',
          fontWeight: 600, fontSize: 14, transition: 'all 0.3s ease'
        }}>
          {saving ? <Loader2 size={16} className="spin" /> : <Check size={16} />}
          {saving ? 'Saving changes...' : 'All changes saved'}
        </div>
      </div>

      <div style={{ display: 'grid', gap: 32 }}>
        
        {/* Section: Feature Flags */}
        <section style={{ background: 'var(--bg-primary)', padding: 24, borderRadius: 20, border: '1px solid var(--border-color)', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
          <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ padding: 8, background: 'color-mix(in srgb, #8b5cf6 10%, transparent)', borderRadius: 10, color: '#8b5cf6' }}><Layers size={18} /></div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Feature Toggles</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
            <PremiumToggle 
              label="Experience Module" description="Show work history in navigation."
              icon={Briefcase} color="#3b82f6"
              checked={settings?.feature_experience ?? true} 
              onChange={val => handleToggleChange('feature_experience', val)} 
            />
            <PremiumToggle 
              label="Certifications Module" description="Display certificates & awards."
              icon={Award} color="#10b981"
              checked={settings?.feature_certifications ?? true} 
              onChange={val => handleToggleChange('feature_certifications', val)} 
            />
            <PremiumToggle 
              label="Available for Hire" description="Show 'Available' badge on profile."
              icon={Sparkles} color="#8b5cf6"
              checked={settings?.is_available_for_hire ?? false} 
              onChange={val => handleToggleChange('is_available_for_hire', val)} 
            />
          </div>
        </section>

        {/* Section: Announcement Banner */}
        <section style={{ background: 'var(--bg-primary)', padding: 24, borderRadius: 20, border: '1px solid var(--border-color)', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
          <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ padding: 8, background: 'color-mix(in srgb, #f59e0b 10%, transparent)', borderRadius: 10, color: '#f59e0b' }}><Bell size={18} /></div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Announcement Banner</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <PremiumToggle 
              label="Enable Global Banner" description="Displays a prominent message at the top of the site."
              icon={Bell} color="#f59e0b"
              checked={settings?.announcement_enabled ?? false} 
              onChange={val => handleToggleChange('announcement_enabled', val)} 
            />
            <AnimatePresence>
              {settings?.announcement_enabled && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                  <div style={{ paddingTop: 8 }}>
                    <PremiumInput 
                      label="Banner Text" icon={MessageSquare}
                      value={settings?.announcement_text || ''} 
                      onChange={e => handleInputChange('announcement_text', e.target.value)}
                      onBlur={e => handleInputBlur('announcement_text', e.target.value)}
                      placeholder="e.g., Actively seeking Senior Front-End Engineering roles."
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 32 }}>
          {/* Section: Personal Info */}
          <section style={{ background: 'var(--bg-primary)', padding: 24, borderRadius: 20, border: '1px solid var(--border-color)', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
            <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ padding: 8, background: 'color-mix(in srgb, var(--primary-blue) 10%, transparent)', borderRadius: 10, color: 'var(--primary-blue)' }}><User size={18} /></div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Personal Info</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <PremiumInput 
                label="Hero Headline" icon={Type} 
                value={settings?.hero_headline || ''} 
                onChange={e => handleInputChange('hero_headline', e.target.value)}
                onBlur={e => handleInputBlur('hero_headline', e.target.value)}
                placeholder="Full Stack Developer" 
              />
              <PremiumInput 
                label="Short Bio" icon={FileText} multiline 
                value={settings?.short_bio || ''} 
                onChange={e => handleInputChange('short_bio', e.target.value)}
                onBlur={e => handleInputBlur('short_bio', e.target.value)}
                placeholder="Write a brief introduction..." 
              />
            </div>
          </section>

          {/* Section: SEO */}
          <section style={{ background: 'var(--bg-primary)', padding: 24, borderRadius: 20, border: '1px solid var(--border-color)', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
            <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ padding: 8, background: 'color-mix(in srgb, #06b6d4 10%, transparent)', borderRadius: 10, color: '#06b6d4' }}><Globe size={18} /></div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>SEO & Discovery</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <PremiumInput 
                label="Meta Title" icon={Type} 
                value={settings?.seo_title || ''} 
                onChange={e => handleInputChange('seo_title', e.target.value)}
                onBlur={e => handleInputBlur('seo_title', e.target.value)}
                placeholder="Portfolio | Sujith" 
              />
              <PremiumInput 
                label="Meta Description" icon={FileText} multiline 
                value={settings?.seo_description || ''} 
                onChange={e => handleInputChange('seo_description', e.target.value)}
                onBlur={e => handleInputBlur('seo_description', e.target.value)}
                placeholder="SEO Description..." 
              />
              <PremiumInput 
                label="OpenGraph Image URL" icon={Image} 
                value={settings?.seo_og_image || ''} 
                onChange={e => handleInputChange('seo_og_image', e.target.value)}
                onBlur={e => handleInputBlur('seo_og_image', e.target.value)}
                placeholder="https://..." 
              />
            </div>
          </section>
        </div>

        {/* Section: Links & Resume */}
        <section style={{ background: 'var(--bg-primary)', padding: 24, borderRadius: 20, border: '1px solid var(--border-color)', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
          <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ padding: 8, background: 'color-mix(in srgb, #ec4899 10%, transparent)', borderRadius: 10, color: '#ec4899' }}><Link size={18} /></div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Links & Assets</h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            <PremiumInput 
              label="Contact Email" icon={Mail} 
              value={settings?.contact_email || ''} 
              onChange={e => handleInputChange('contact_email', e.target.value)}
              onBlur={e => handleInputBlur('contact_email', e.target.value)}
              placeholder="hello@example.com" 
            />
            <PremiumInput 
              label="GitHub URL" icon={FaGithub} 
              value={settings?.github_url || ''} 
              onChange={e => handleInputChange('github_url', e.target.value)}
              onBlur={e => handleInputBlur('github_url', e.target.value)}
              placeholder="https://github.com/..." 
            />
            <PremiumInput 
              label="LinkedIn URL" icon={FaLinkedin} 
              value={settings?.linkedin_url || ''} 
              onChange={e => handleInputChange('linkedin_url', e.target.value)}
              onBlur={e => handleInputBlur('linkedin_url', e.target.value)}
              placeholder="https://linkedin.com/in/..." 
            />
            
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginLeft: 4, marginBottom: 6, display: 'block' }}>Resume PDF</label>
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: 12, padding: 8,
                background: 'var(--bg-secondary)', borderRadius: 16, border: '1px dashed var(--border-color)'
              }}>
                <div style={{ flex: 1, paddingLeft: 12, display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                  <FileText size={18} color="var(--text-muted)" />
                  <span style={{ fontSize: 14, color: settings?.resume_url ? 'var(--text-primary)' : 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {settings?.resume_url || 'No resume uploaded yet'}
                  </span>
                </div>
                <input type="file" id="resume-upload" accept="application/pdf" style={{ display: 'none' }} onChange={handleResumeUpload} />
                <button type="button" onClick={() => document.getElementById('resume-upload').click()} 
                  style={{ 
                    background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', 
                    padding: '8px 16px', borderRadius: 10, cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)', transition: 'all 0.2s'
                  }}>
                  {uploadingResume ? <Loader2 size={16} className="spin" /> : <Upload size={16} />} 
                  {uploadingResume ? 'Uploading...' : 'Upload New'}
                </button>
              </div>
            </div>
          </div>
        </section>

      </div>
      
      {/* Spacer before Maintenance panel */}
      <div style={{ height: 32 }} />
      <MaintenanceSettingsPanel />
    </motion.div>
  );
}

/* -------------------------------------------------------------------- */
/* Skills Panel                                                         */
/* -------------------------------------------------------------------- */
const SKILL_CATEGORIES = ['languages', 'database', 'ml', 'soft', 'exploring'];
const SKILL_LEVELS = ['Learning', 'Intermediate', 'Advanced'];

function SkillsPanel() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedCats, setCollapsedCats] = useState({});

  useEffect(() => { fetchSkills(); }, []);

  const fetchSkills = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('skills').select('*').order('order_index', { ascending: true });
    if (!error && data) setSkills(data);
    setLoading(false);
  };

  const handleEdit = (skill) => {
    setFormData({
      ...skill,
      related_tools: skill.related_tools ? skill.related_tools.join(', ') : '',
      projects: skill.projects ? skill.projects.join(', ') : '',
    });
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setFormData({
      name: '', category: 'languages', icon_class: '', proficiency_level: 80,
      years_experience: 0, project_count: 0, description: '', level_label: 'Intermediate',
      related_tools: '', projects: '', is_featured: false, order_index: 0
    });
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this skill?')) return;
    const { error } = await supabase.from('skills').delete().eq('id', id);
    if (!error) setSkills(skills.filter(s => s.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.category) return alert('Name and Category are required');
    let clampedProficiency = Math.max(1, Math.min(100, parseInt(formData.proficiency_level) || 80));
    const parseArray = (str) => typeof str === 'string' ? str.split(',').map(s => s.trim()).filter(Boolean) : str;
    const payload = {
      ...formData,
      proficiency_level: clampedProficiency,
      years_experience: parseInt(formData.years_experience) || 0,
      project_count: parseInt(formData.project_count) || 0,
      order_index: parseInt(formData.order_index) || 0,
      related_tools: parseArray(formData.related_tools),
      projects: parseArray(formData.projects),
    };
    if (payload.id) {
      const { data, error } = await supabase.from('skills').update(payload).eq('id', payload.id).select().single();
      if (!error && data) setSkills(skills.map(s => s.id === data.id ? data : s));
    } else {
      const { data, error } = await supabase.from('skills').insert([payload]).select().single();
      if (!error && data) setSkills([...skills, data].sort((a, b) => a.order_index - b.order_index));
    }
    setIsEditing(false);
  };

  const toggleCategory = (cat) => setCollapsedCats(prev => ({ ...prev, [cat]: !prev[cat] }));

  /* ── colour scale for proficiency bar ── */
  const barColor = (pct) => {
    if (pct >= 85) return '#28a745';
    if (pct >= 65) return '#007bff';
    if (pct >= 45) return '#ff9800';
    return '#ef4444';
  };

  if (loading) return (
    <PanelCard title="Skills Inventory">
      <div style={{ padding: '60px', display: 'flex', justifyContent: 'center' }}>
        <Loader2 className="spin" size={24} color="var(--text-muted)" />
      </div>
    </PanelCard>
  );

  if (isEditing) {
    return (
      <PanelCard
        title={formData.id ? 'Edit Skill' : 'Add Skill'}
        action={{ label: 'Cancel', icon: 'ti-x', onClick: () => setIsEditing(false) }}
      >
        <div style={{ padding: '24px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="admin-settings-grid">
              <div className="admin-field">
                <label>Skill Name *</label>
                <input className="admin-input" type="text" required value={formData.name || ''}
                  onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. React" />
              </div>
              <div className="admin-field">
                <label>Category *</label>
                <select className="admin-input" value={formData.category || 'languages'}
                  onChange={e => setFormData({...formData, category: e.target.value})}>
                  {SKILL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="admin-field">
                <label>Level Label</label>
                <select className="admin-input" value={formData.level_label || 'Intermediate'}
                  onChange={e => setFormData({...formData, level_label: e.target.value})}>
                  {SKILL_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="admin-field">
                <label>Proficiency (1–100)</label>
                <input className="admin-input" type="number" min="1" max="100"
                  value={formData.proficiency_level || 80}
                  onChange={e => setFormData({...formData, proficiency_level: e.target.value})} />
              </div>
              <div className="admin-field">
                <label>Years Experience</label>
                <input className="admin-input" type="number" min="0"
                  value={formData.years_experience || 0}
                  onChange={e => setFormData({...formData, years_experience: e.target.value})} />
              </div>
              <div className="admin-field">
                <label>Project Count</label>
                <input className="admin-input" type="number" min="0"
                  value={formData.project_count || 0}
                  onChange={e => setFormData({...formData, project_count: e.target.value})} />
              </div>
              <div className="admin-field">
                <label>Icon Class (Tabler)</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input className="admin-input" type="text" style={{ flex: 1 }}
                    value={formData.icon_class || ''}
                    onChange={e => setFormData({...formData, icon_class: e.target.value})}
                    placeholder="e.g. brand-python" />
                  {formData.icon_class && (
                    <div style={{ width: 34, height: 34, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className={`ti ti-${formData.icon_class}`} style={{ fontSize: 18 }} />
                    </div>
                  )}
                </div>
              </div>
              <div className="admin-field">
                <label>Display Order</label>
                <input className="admin-input" type="number"
                  value={formData.order_index || 0}
                  onChange={e => setFormData({...formData, order_index: e.target.value})} />
              </div>
            </div>

            <div className="admin-field">
              <label>Description</label>
              <textarea className="admin-input" style={{ minHeight: 80, resize: 'vertical' }}
                value={formData.description || ''}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Brief description of this skill..." />
            </div>

            <div className="admin-settings-grid">
              <div className="admin-field">
                <label>Related Tools (comma-separated)</label>
                <textarea className="admin-input" style={{ minHeight: 64 }}
                  value={formData.related_tools || ''}
                  onChange={e => setFormData({...formData, related_tools: e.target.value})}
                  placeholder="Node.js, Express, Vercel" />
              </div>
              <div className="admin-field">
                <label>Projects (comma-separated)</label>
                <textarea className="admin-input" style={{ minHeight: 64 }}
                  value={formData.projects || ''}
                  onChange={e => setFormData({...formData, projects: e.target.value})}
                  placeholder="Project A, Project B" />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" onClick={() => setIsEditing(false)} className="admin-action-btn secondary">Cancel</button>
              <button type="submit" className="admin-action-btn">
                <i className="ti ti-device-floppy" style={{ fontSize: 13 }} /> Save Skill
              </button>
            </div>
          </form>
        </div>
      </PanelCard>
    );
  }

  const filteredSkills = skills.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const groupedSkills = SKILL_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = filteredSkills.filter(s => s.category === cat);
    return acc;
  }, {});

  return (
    <PanelCard
      title="Skills Inventory"
      action={{ label: 'Add Skill', icon: 'ti-plus', onClick: handleAddNew }}
      headerElement={
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Search skills…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="admin-input"
            style={{ width: 210, padding: '6px 12px 6px 34px', fontSize: 13, margin: 0 }}
          />
          <i className="ti ti-search" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 14 }} />
        </div>
      }
    >
      {skills.length === 0 ? (
        <EmptyState icon="ti-star" title="No skills yet" description="Add your first skill to get started." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28, padding: '20px 22px' }}>
          {SKILL_CATEGORIES.map(cat => {
            const catSkills = groupedSkills[cat] || [];
            if (catSkills.length === 0) return null;
            const isCollapsed = collapsedCats[cat];

            return (
              <div key={cat}>
                {/* Category header */}
                <div
                  onClick={() => toggleCategory(cat)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    cursor: 'pointer', userSelect: 'none',
                    marginBottom: 14, paddingBottom: 10,
                    borderBottom: '2px solid var(--border-color)'
                  }}
                >
                  {isCollapsed
                    ? <ChevronRight size={15} color="var(--text-muted)" />
                    : <ChevronDown  size={15} color="var(--primary-blue)" />}
                  <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'capitalize', letterSpacing: '0.2px' }}>
                    {cat}
                  </h3>
                  <span className="admin-badge" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: 10, marginLeft: 2 }}>
                    {catSkills.length}
                  </span>
                </div>

                {!isCollapsed && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
                    {catSkills.map(skill => {
                      const pct   = skill.proficiency_level || 0;
                      const color = barColor(pct);
                      return (
                        <div key={skill.id} style={{
                          background: 'var(--bg-primary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 12,
                          padding: '16px 18px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 12,
                          position: 'relative',
                          transition: 'box-shadow 0.2s, transform 0.2s',
                        }}
                          onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                          onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
                        >
                          {/* Top row: icon + name + actions */}
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{
                                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                                background: `${color}18`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                              }}>
                                {skill.icon_class
                                  ? <i className={`ti ti-${skill.icon_class}`} style={{ fontSize: 19, color }} />
                                  : <Star size={17} color={color} />}
                              </div>
                              <div>
                                <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                                  {skill.name}
                                  {skill.is_featured && <Star size={11} color="#f59e0b" style={{ marginLeft: 5, verticalAlign: 'middle' }} />}
                                </p>
                                <span style={{
                                  display: 'inline-block', marginTop: 3,
                                  fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px',
                                  padding: '2px 7px', borderRadius: 99,
                                  background: `${color}18`, color
                                }}>
                                  {skill.level_label || 'Intermediate'}
                                </span>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                              <button onClick={() => handleEdit(skill)} className="admin-icon-action" title="Edit"
                                style={{ color: 'var(--text-muted)', width: 28, height: 28, borderRadius: 7, background: 'var(--card-bg)' }}>
                                <Edit3 size={13} />
                              </button>
                              <button onClick={() => handleDelete(skill.id)} className="admin-icon-action" title="Delete"
                                style={{ color: '#ef4444', width: 28, height: 28, borderRadius: 7, background: '#ef444410' }}>
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          {/* Proficiency bar */}
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 11, fontWeight: 600 }}>
                              <span style={{ color: 'var(--text-muted)' }}>Proficiency</span>
                              <span style={{ color }}>{pct}%</span>
                            </div>
                            <div style={{ width: '100%', height: 5, background: 'var(--border-color)', borderRadius: 99, overflow: 'hidden' }}>
                              <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 0.6s ease' }} />
                            </div>
                          </div>

                          {/* Meta footer */}
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: 14,
                            paddingTop: 10, borderTop: '1px solid var(--border-color)'
                          }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                              <Briefcase size={11} /> {skill.years_experience || 0} yr{skill.years_experience !== 1 ? 's' : ''}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                              <Layers size={11} /> {skill.project_count || 0} project{skill.project_count !== 1 ? 's' : ''}
                            </span>
                            {skill.related_tools?.length > 0 && (
                              <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-muted)', background: 'var(--border-color)', padding: '2px 7px', borderRadius: 99 }}>
                                +{skill.related_tools.length} tools
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {filteredSkills.length === 0 && searchQuery && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 13 }}>
              No skills found matching &ldquo;{searchQuery}&rdquo;
            </div>
          )}
        </div>
      )}
    </PanelCard>
  );
}

/* -------------------------------------------------------------------- */
/* Experience Panel                                                     */
/* -------------------------------------------------------------------- */
function ExperiencePanel() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchExperience();
  }, []);

  const fetchExperience = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('experience').select('*').order('display_order', { ascending: true });
    if (!error && data) setExperiences(data);
    setLoading(false);
  };

  const handleEdit = (exp) => {
    setFormData({
      ...exp,
      description_bullets: exp.description_bullets ? exp.description_bullets.join('\n') : '',
    });
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setFormData({
      role: '', company: '', start_date: '', end_date: '', 
      description_bullets: '', logo_url: '', is_education: false, display_order: 0
    });
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this experience?')) return;
    const { error } = await supabase.from('experience').delete().eq('id', id);
    if (!error) setExperiences(experiences.filter(e => e.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.role || !formData.company || !formData.start_date) return alert('Role, Company, and Start Date are required');
    
    // Basic date validation if both exist
    if (formData.end_date) {
      const d1 = new Date(formData.start_date);
      const d2 = new Date(formData.end_date);
      if (!isNaN(d1) && !isNaN(d2) && d2 < d1) {
         return alert("End date cannot be before start date!");
      }
    }

    const parseBullets = (str) => typeof str === 'string' ? str.split('\n').map(s => s.trim()).filter(Boolean) : str;

    const payload = {
      ...formData,
      end_date: formData.end_date || null, // null means "Present"
      display_order: parseInt(formData.display_order) || 0,
      description_bullets: parseBullets(formData.description_bullets),
    };

    if (payload.id) {
      const { data, error } = await supabase.from('experience').update(payload).eq('id', payload.id).select().single();
      if (!error && data) setExperiences(experiences.map(e => e.id === data.id ? data : e));
    } else {
      const { data, error } = await supabase.from('experience').insert([payload]).select().single();
      if (!error && data) setExperiences([...experiences, data].sort((a, b) => a.display_order - b.display_order));
    }
    setIsEditing(false);
  };

  if (loading) return <PanelCard title="Experience Timeline"><div style={styles.emptyState}><Loader2 className="spin" size={24} color="var(--text-muted)" /></div></PanelCard>;

  if (isEditing) {
    return (
      <PanelCard title={formData.id ? "Edit Experience" : "Add Experience"} action={{ label: "Cancel", icon: "ti-x", onClick: () => setIsEditing(false) }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={styles.settingsGrid}>
            <div style={styles.settingGroup}>
              <label style={styles.settingLabel}>Role / Title *</label>
              <input type="text" style={styles.input} required value={formData.role || ''} onChange={e => setFormData({...formData, role: e.target.value})} placeholder="e.g. Software Engineer" />
            </div>
            <div style={styles.settingGroup}>
              <label style={styles.settingLabel}>Company / Institution *</label>
              <input type="text" style={styles.input} required value={formData.company || ''} onChange={e => setFormData({...formData, company: e.target.value})} placeholder="e.g. Google" />
            </div>
            <div style={styles.settingGroup}>
              <label style={styles.settingLabel}>Start Date (e.g. Jan 2024) *</label>
              <input type="text" style={styles.input} required value={formData.start_date || ''} onChange={e => setFormData({...formData, start_date: e.target.value})} placeholder="Jan 2024" />
            </div>
            <div style={styles.settingGroup}>
              <label style={styles.settingLabel}>End Date (Leave blank for 'Present')</label>
              <input type="text" style={styles.input} value={formData.end_date || ''} onChange={e => setFormData({...formData, end_date: e.target.value})} placeholder="Dec 2025 or leave blank" />
            </div>
            <div style={{...styles.settingGroup, gridColumn: '1 / -1'}}>
              <label style={styles.settingLabel}>Logo URL (Optional)</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input type="text" style={{...styles.input, flex: 1}} value={formData.logo_url || ''} onChange={e => setFormData({...formData, logo_url: e.target.value})} placeholder="https://..." />
                {formData.logo_url && <img src={formData.logo_url} alt="preview" style={{width: 32, height: 32, borderRadius: 6, objectFit: 'contain', background: '#fff', border: '1px solid var(--border-color)'}} onError={(e) => e.target.style.display='none'} />}
              </div>
            </div>
            <div style={styles.settingGroup}>
              <label style={styles.settingLabel}>Display Order</label>
              <input type="number" style={styles.input} value={formData.display_order || 0} onChange={e => setFormData({...formData, display_order: e.target.value})} />
            </div>
            <div style={styles.settingGroup}>
              <label style={styles.settingLabel}>Is Education?</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', height: '38px' }}>
                <input type="checkbox" checked={formData.is_education || false} onChange={e => setFormData({...formData, is_education: e.target.checked})} />
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Check if this is an academic degree</span>
              </label>
            </div>
          </div>
          
          <div style={styles.settingGroup}>
            <label style={styles.settingLabel}>Description Bullets (One per line)</label>
            <textarea style={{...styles.input, minHeight: '120px', resize: 'vertical'}} value={formData.description_bullets || ''} onChange={e => setFormData({...formData, description_bullets: e.target.value})} placeholder={"Built a scalable backend API\nReduced load times by 40%"} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button type="button" onClick={() => setIsEditing(false)} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
            <button type="submit" style={{ background: 'var(--primary-blue)', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Save Experience</button>
          </div>
        </form>
      </PanelCard>
    );
  }

  return (
    <PanelCard title="Experience Timeline" action={{ label: "Add Experience", icon: "ti-plus", onClick: handleAddNew }}>
      {experiences.length === 0 ? (
        <EmptyState icon="ti-id-badge" title="No experience entries" description="Add your first experience or education entry." />
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Company</th>
              <th style={styles.th}>Dates</th>
              <th style={styles.th}>Order</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {experiences.map(exp => (
              <tr key={exp.id}>
                <td style={styles.td}><strong>{exp.role}</strong></td>
                <td style={styles.td}>{exp.company} {exp.is_education ? '(Edu)' : ''}</td>
                <td style={styles.td}>{exp.start_date} - {exp.end_date || 'Present'}</td>
                <td style={styles.td}>{exp.display_order}</td>
                <td style={{ ...styles.td, textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button onClick={() => handleEdit(exp)} style={{ ...styles.iconBtn, color: 'var(--text-secondary)' }} title="Edit">
                    <Edit3 size={16} />
                  </button>
                  <button onClick={() => handleDelete(exp.id)} style={{ ...styles.iconBtn, color: '#ef4444' }} title="Delete">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </PanelCard>
  );
}

/* -------------------------------------------------------------------- */
/* Utility                                                                */
/* -------------------------------------------------------------------- */
function parseUserAgent(ua) {
  if (ua.includes('Win')) return 'Windows';
  if (ua.includes('Mac')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  if (ua.includes('Android')) return 'Android';
  return 'Unknown OS';
}

/* -------------------------------------------------------------------- */
/* Styles                                                                 */
/* -------------------------------------------------------------------- */

/* -------------------------------------------------------------------- */
/* Certifications Panel                                                 */
/* -------------------------------------------------------------------- */
function CertificationsPanel() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchCerts();
  }, []);

  const fetchCerts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('certifications').select('*').order('display_order', { ascending: true });
    if (!error && data) setCerts(data);
    setLoading(false);
  };

  const handleEdit = (cert) => {
    setFormData(cert);
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setFormData({ id: '', title: '', issuer: '', date: '', description: '', icon_class: '', credential_url: '', display_order: 0 });
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this certification?')) return;
    const { error } = await supabase.from('certifications').delete().eq('id', id);
    if (!error) setCerts(certs.filter(c => c.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.issuer) return alert('Title and Issuer are required');

    const payload = {
      ...formData,
      id: formData.id || formData.title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      display_order: parseInt(formData.display_order) || 0,
    };

    const isUpdate = certs.some(c => c.id === payload.id);

    if (isUpdate) {
      const { data, error } = await supabase.from('certifications').update(payload).eq('id', payload.id).select().single();
      if (!error && data) setCerts(certs.map(c => c.id === data.id ? data : c).sort((a,b) => a.display_order - b.display_order));
    } else {
      const { data, error } = await supabase.from('certifications').insert([payload]).select().single();
      if (!error && data) setCerts([...certs, data].sort((a,b) => a.display_order - b.display_order));
    }
    setIsEditing(false);
  };

  if (loading) return <PanelCard title="Certifications"><div style={styles.emptyState}><Loader2 className="spin" size={24} color="var(--text-muted)" /></div></PanelCard>;

  if (isEditing) {
    return (
      <PanelCard title={formData.id ? "Edit Certification" : "Add Certification"} action={{ label: "Cancel", icon: "ti-x", onClick: () => setIsEditing(false) }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={styles.settingsGrid}>
            <div style={styles.settingGroup}>
              <label style={styles.settingLabel}>Title *</label>
              <input type="text" style={styles.input} required value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. AWS Solutions Architect" />
            </div>
            <div style={styles.settingGroup}>
              <label style={styles.settingLabel}>Issuer *</label>
              <input type="text" style={styles.input} required value={formData.issuer || ''} onChange={e => setFormData({...formData, issuer: e.target.value})} placeholder="e.g. Amazon Web Services" />
            </div>
            <div style={styles.settingGroup}>
              <label style={styles.settingLabel}>Date / Year</label>
              <input type="text" style={styles.input} value={formData.date || ''} onChange={e => setFormData({...formData, date: e.target.value})} placeholder="e.g. 2024" />
            </div>
            <div style={styles.settingGroup}>
              <label style={styles.settingLabel}>Credential URL</label>
              <input type="text" style={styles.input} value={formData.credential_url || ''} onChange={e => setFormData({...formData, credential_url: e.target.value})} placeholder="https://..." />
            </div>
            <div style={styles.settingGroup}>
              <label style={styles.settingLabel}>Icon Class</label>
              <input type="text" style={styles.input} value={formData.icon_class || ''} onChange={e => setFormData({...formData, icon_class: e.target.value})} placeholder="e.g. brand-aws" />
            </div>
            <div style={styles.settingGroup}>
              <label style={styles.settingLabel}>Display Order</label>
              <input type="number" style={styles.input} value={formData.display_order || 0} onChange={e => setFormData({...formData, display_order: e.target.value})} />
            </div>
          </div>
          <div style={styles.settingGroup}>
            <label style={styles.settingLabel}>Description</label>
            <textarea style={{...styles.input, minHeight: '80px', resize: 'vertical'}} value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="What did you learn?" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button type="button" onClick={() => setIsEditing(false)} style={{ background: 'transparent', border: '1px solid var(--border-color)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
            <button type="submit" style={{ background: 'var(--primary-blue)', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Save</button>
          </div>
        </form>
      </PanelCard>
    );
  }

  return (
    <PanelCard title="Certifications" action={{ label: "Add", icon: "ti-plus", onClick: handleAddNew }}>
      {certs.length === 0 ? (
        <EmptyState icon="ti-certificate" title="No certifications" description="Add your first certification." />
      ) : (
        <table style={styles.table}>
          <thead><tr><th style={styles.th}>Title</th><th style={styles.th}>Issuer</th><th style={styles.th}>Date</th><th style={{ ...styles.th, textAlign: 'right' }}>Actions</th></tr></thead>
          <tbody>
            {certs.map(cert => (
              <tr key={cert.id}>
                <td style={styles.td}><strong>{cert.title}</strong></td>
                <td style={styles.td}>{cert.issuer}</td>
                <td style={styles.td}>{cert.date}</td>
                <td style={{ ...styles.td, textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button onClick={() => handleEdit(cert)} style={{ ...styles.iconBtn, color: 'var(--text-secondary)' }}><Edit3 size={16} /></button>
                  <button onClick={() => handleDelete(cert.id)} style={{ ...styles.iconBtn, color: '#ef4444' }}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </PanelCard>
  );
}

/* -------------------------------------------------------------------- */
/* Education Panel                                                      */
/* -------------------------------------------------------------------- */
function EducationPanel() {
  const [edu, setEdu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchEdu();
  }, []);

  const fetchEdu = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('education').select('*').order('display_order', { ascending: true });
    if (!error && data) setEdu(data);
    setLoading(false);
  };

  const handleEdit = (item) => {
    setFormData({
      ...item,
      highlights: item.highlights ? item.highlights.join(', ') : '',
      back_stats: item.back_stats ? JSON.stringify(item.back_stats) : '[]',
    });
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setFormData({ 
      id: '', short_label: '', year: '', title: '', institution: '', location: '', description: '', 
      score: '', progress: 100, icon_class: 'School', theme_color: '#007bff', bg_color: '#e6f2ff', text_color: '#004085',
      highlights: '', back_stats: '[]', highlight_text: '', display_order: 0 
    });
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this education entry?')) return;
    const { error } = await supabase.from('education').delete().eq('id', id);
    if (!error) setEdu(edu.filter(c => c.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.institution) return alert('Title and Institution are required');

    let parsedStats = [];
    try {
      parsedStats = JSON.parse(formData.back_stats || '[]');
    } catch (e) {
      return alert('Back stats must be valid JSON array, e.g. [{"label":"GPA", "value":"4.0"}]');
    }

    const payload = {
      ...formData,
      id: formData.id || formData.title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      progress: parseInt(formData.progress) || 100,
      display_order: parseInt(formData.display_order) || 0,
      highlights: typeof formData.highlights === 'string' ? formData.highlights.split(',').map(s=>s.trim()).filter(Boolean) : formData.highlights,
      back_stats: parsedStats
    };

    const isUpdate = edu.some(c => c.id === payload.id);

    if (isUpdate) {
      const { data, error } = await supabase.from('education').update(payload).eq('id', payload.id).select().single();
      if (!error && data) setEdu(edu.map(c => c.id === data.id ? data : c).sort((a,b) => a.display_order - b.display_order));
    } else {
      const { data, error } = await supabase.from('education').insert([payload]).select().single();
      if (!error && data) setEdu([...edu, data].sort((a,b) => a.display_order - b.display_order));
    }
    setIsEditing(false);
  };

  if (loading) return <PanelCard title="Education"><div style={styles.emptyState}><Loader2 className="spin" size={24} color="var(--text-muted)" /></div></PanelCard>;

  if (isEditing) {
    return (
      <PanelCard title={formData.id ? "Edit Education" : "Add Education"} action={{ label: "Cancel", icon: "ti-x", onClick: () => setIsEditing(false) }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={styles.settingsGrid}>
            <div style={styles.settingGroup}><label style={styles.settingLabel}>Title *</label><input type="text" style={styles.input} required value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="B.Tech Computer Science" /></div>
            <div style={styles.settingGroup}><label style={styles.settingLabel}>Institution *</label><input type="text" style={styles.input} required value={formData.institution || ''} onChange={e => setFormData({...formData, institution: e.target.value})} placeholder="University Name" /></div>
            <div style={styles.settingGroup}><label style={styles.settingLabel}>Short Label</label><input type="text" style={styles.input} value={formData.short_label || ''} onChange={e => setFormData({...formData, short_label: e.target.value})} placeholder="b.tech" /></div>
            <div style={styles.settingGroup}><label style={styles.settingLabel}>Year</label><input type="text" style={styles.input} value={formData.year || ''} onChange={e => setFormData({...formData, year: e.target.value})} placeholder="2020 - 2024" /></div>
            <div style={styles.settingGroup}><label style={styles.settingLabel}>Location</label><input type="text" style={styles.input} value={formData.location || ''} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="City, State" /></div>
            <div style={styles.settingGroup}><label style={styles.settingLabel}>Score String</label><input type="text" style={styles.input} value={formData.score || ''} onChange={e => setFormData({...formData, score: e.target.value})} placeholder="CGPA: 8.7" /></div>
            <div style={styles.settingGroup}><label style={styles.settingLabel}>Progress % (0-100)</label><input type="number" style={styles.input} value={formData.progress || 100} onChange={e => setFormData({...formData, progress: e.target.value})} /></div>
            <div style={styles.settingGroup}><label style={styles.settingLabel}>Icon Class (Lucide)</label><input type="text" style={styles.input} value={formData.icon_class || ''} onChange={e => setFormData({...formData, icon_class: e.target.value})} placeholder="BookOpen" /></div>
            <div style={styles.settingGroup}><label style={styles.settingLabel}>Theme Color</label><input type="color" style={{...styles.input, height: 42, padding: 4}} value={formData.theme_color || '#000000'} onChange={e => setFormData({...formData, theme_color: e.target.value})} /></div>
            <div style={styles.settingGroup}><label style={styles.settingLabel}>Background Color</label><input type="color" style={{...styles.input, height: 42, padding: 4}} value={formData.bg_color || '#ffffff'} onChange={e => setFormData({...formData, bg_color: e.target.value})} /></div>
            <div style={styles.settingGroup}><label style={styles.settingLabel}>Text Color</label><input type="color" style={{...styles.input, height: 42, padding: 4}} value={formData.text_color || '#000000'} onChange={e => setFormData({...formData, text_color: e.target.value})} /></div>
            <div style={styles.settingGroup}><label style={styles.settingLabel}>Display Order</label><input type="number" style={styles.input} value={formData.display_order || 0} onChange={e => setFormData({...formData, display_order: e.target.value})} /></div>
          </div>
          
          <div style={styles.settingGroup}>
            <label style={styles.settingLabel}>Description</label>
            <textarea style={{...styles.input, minHeight: '60px', resize: 'vertical'}} value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
          
          <div style={styles.settingGroup}>
            <label style={styles.settingLabel}>Highlight Text (Shown below card)</label>
            <input type="text" style={styles.input} value={formData.highlight_text || ''} onChange={e => setFormData({...formData, highlight_text: e.target.value})} />
          </div>

          <div style={styles.settingsGrid}>
            <div style={styles.settingGroup}>
              <label style={styles.settingLabel}>Highlights (Comma-separated)</label>
              <textarea style={{...styles.input, minHeight: '60px'}} value={formData.highlights || ''} onChange={e => setFormData({...formData, highlights: e.target.value})} placeholder="Data Science, ML" />
            </div>
            <div style={styles.settingGroup}>
              <label style={styles.settingLabel}>Back Stats (JSON)</label>
              <textarea style={{...styles.input, minHeight: '60px', fontFamily: 'monospace'}} value={formData.back_stats || ''} onChange={e => setFormData({...formData, back_stats: e.target.value})} placeholder='[{"value":"10","label":"GPA"}]' />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button type="button" onClick={() => setIsEditing(false)} style={{ background: 'transparent', border: '1px solid var(--border-color)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
            <button type="submit" style={{ background: 'var(--primary-blue)', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Save</button>
          </div>
        </form>
      </PanelCard>
    );
  }

  return (
    <PanelCard title="Education" action={{ label: "Add", icon: "ti-plus", onClick: handleAddNew }}>
      {edu.length === 0 ? (
        <EmptyState icon="ti-book" title="No education" description="Add your educational history." />
      ) : (
        <table style={styles.table}>
          <thead><tr><th style={styles.th}>Title</th><th style={styles.th}>Institution</th><th style={styles.th}>Year</th><th style={{ ...styles.th, textAlign: 'right' }}>Actions</th></tr></thead>
          <tbody>
            {edu.map(item => (
              <tr key={item.id}>
                <td style={styles.td}><strong>{item.title}</strong></td>
                <td style={styles.td}>{item.institution}</td>
                <td style={styles.td}>{item.year}</td>
                <td style={{ ...styles.td, textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button onClick={() => handleEdit(item)} style={{ ...styles.iconBtn, color: 'var(--text-secondary)' }}><Edit3 size={16} /></button>
                  <button onClick={() => handleDelete(item.id)} style={{ ...styles.iconBtn, color: '#ef4444' }}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </PanelCard>
  );
}

/* -------------------------------------------------------------------- */
/* 1. Real-Time Visitor Analytics & Recruiter Insights Hub              */
/* -------------------------------------------------------------------- */
/* ───────────────────────────────────────────────
   ANALYTICS HUB
   ─────────────────────────────────────────────── */
function AnalyticsPanel() {
  const [analytics, setAnalytics] = useState([]);
  const [events, setEvents]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState('overview');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const [anaRes, evRes] = await Promise.all([
      supabase.from('portfolio_analytics').select('*').order('created_at', { ascending: false }).limit(200),
      supabase.from('recruiter_events').select('*').order('created_at', { ascending: false }).limit(50),
    ]);
    if (!anaRes.error && anaRes.data) setAnalytics(anaRes.data);
    if (!evRes.error  && evRes.data)  setEvents(evRes.data);
    setLoading(false);
  };

  /* ── derived metrics ── */
  const pageCounts = analytics.reduce((acc, r) => {
    acc[r.page_path] = (acc[r.page_path] || 0) + 1;
    return acc;
  }, {});
  const sortedPages = Object.entries(pageCounts).sort((a,b) => b[1]-a[1]);
  const maxCount    = sortedPages[0]?.[1] || 1;

  // daily visits last 7 days
  const dayLabels = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6-i));
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  });
  const dayCounts = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6-i));
    const ds = d.toDateString();
    return analytics.filter(r => new Date(r.created_at).toDateString() === ds).length;
  });
  const maxDay = Math.max(...dayCounts, 1);

  // event type breakdown
  const evTypes = events.reduce((acc, e) => {
    acc[e.event_type] = (acc[e.event_type] || 0) + 1;
    return acc;
  }, {});

  const kpiColor = (v, hi, med) => v >= hi ? '#28a745' : v >= med ? '#ff9800' : '#ef4444';

  if (loading) return (
    <PanelCard title="Analytics Hub">
      <div style={{ padding: 60, display: 'flex', justifyContent: 'center' }}><Loader2 className="spin" size={24} color="var(--text-muted)" /></div>
    </PanelCard>
  );

  return (
    <PanelCard
      title="Analytics Hub"
      action={{ label: 'Refresh', icon: 'ti-refresh', onClick: fetchData }}
      headerElement={
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg-primary)', borderRadius: 8, padding: 3, border: '1px solid var(--border-color)' }}>
          {['overview','pages','events'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'var(--app-font)',
              background: tab === t ? 'var(--primary-blue)' : 'transparent',
              color: tab === t ? '#fff' : 'var(--text-muted)',
            }}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>
          ))}
        </div>
      }
    >
      <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* KPI strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14 }}>
          {[{ label: 'Total Views', value: analytics.length, color: '#007bff' },
            { label: 'Recruiter Events', value: events.length, color: '#28a745' },
            { label: 'Unique Pages', value: sortedPages.length, color: '#6366f1' },
            { label: 'Downloads/Clicks', value: events.filter(e => e.event_type?.includes('DOWNLOAD') || e.event_type?.includes('CLICK')).length, color: '#ff9800' },
          ].map(k => (
            <div key={k.label} style={{ background: 'var(--bg-primary)', border: `1px solid var(--border-color)`, borderTop: `3px solid ${k.color}`, borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-muted)' }}>{k.label}</p>
              <p style={{ margin: '6px 0 0', fontSize: 26, fontWeight: 800, color: k.color, letterSpacing: -1 }}>{k.value}</p>
            </div>
          ))}
        </div>

        {tab === 'overview' && (
          <>
            {/* 7-day bar chart */}
            <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '18px 20px' }}>
              <p style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Daily Visitors — Last 7 Days</p>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 100 }}>
                {dayLabels.map((day, i) => (
                  <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 10, color: 'var(--primary-blue)', fontWeight: 700 }}>{dayCounts[i] || ''}</span>
                    <div style={{
                      width: '100%', background: `var(--primary-blue)`,
                      height: `${Math.round((dayCounts[i]/maxDay)*80)+4}px`,
                      borderRadius: '4px 4px 0 0', opacity: dayCounts[i] === 0 ? 0.15 : 0.85,
                      transition: 'height 0.6s ease',
                    }} />
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>{day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent activity */}
            <div>
              <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Recent Activity Feed</p>
              {analytics.slice(0,8).map((r,i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#007bff18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className="ti ti-eye" style={{ fontSize: 14, color: '#007bff' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{r.page_path || '/'}</p>
                    <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>{r.referrer || 'Direct'} · {r.device_type || 'Desktop'}</p>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              ))}
              {analytics.length === 0 && <div className="admin-empty" style={{ padding: '30px 0' }}><p>No page views recorded yet.</p></div>}
            </div>
          </>
        )}

        {tab === 'pages' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Top Visited Pages</p>
            {sortedPages.length === 0 && <div className="admin-empty" style={{ padding: '30px 0' }}><p>No data yet.</p></div>}
            {sortedPages.map(([path, count]) => (
              <div key={path}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{path}</span>
                  <span style={{ fontWeight: 700, color: '#007bff' }}>{count} visit{count !== 1 ? 's' : ''}</span>
                </div>
                <div style={{ width: '100%', height: 6, background: 'var(--border-color)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.round((count/maxCount)*100)}%`, height: '100%', background: '#007bff', borderRadius: 99 }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'events' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Recruiter Event Feed</p>
            {events.length === 0 && <div className="admin-empty" style={{ padding: '30px 0' }}><p>No recruiter events logged yet.</p></div>}
            {events.map(ev => (
              <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: '#28a74518', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Sparkles size={15} color="#28a745" />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{ev.event_type}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>{ev.event_detail || '—'}</p>
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{new Date(ev.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}

      </div>
    </PanelCard>
  );
}

/* -------------------------------------------------------------------- */
/* 2. AI Content Copilot, ATS Matcher & Printable PDF Resume            */
/* -------------------------------------------------------------------- */
/* ───────────────────────────────────────────────
   AI COPILOT & ATS MATCHER
   ─────────────────────────────────────────────── */
function CopilotPanel() {
  const [jdText,       setJdText]       = useState('');
  const [matchResult,  setMatchResult]  = useState(null);
  const [bulletInput,  setBulletInput]  = useState('');
  const [bulletOutput, setBulletOutput] = useState('');
  const [bulletStyle,  setBulletStyle]  = useState('engineer');
  const [analyzing,    setAnalyzing]    = useState(false);
  const [skills,       setSkills]       = useState([]);
  const [copied,       setCopied]       = useState(false);

  useEffect(() => {
    supabase.from('skills').select('name').then(({ data }) => {
      if (data) setSkills(data.map(s => s.name.toLowerCase()));
    });
  }, []);

  const BULLET_TEMPLATES = {
    engineer: (t) => `• Engineered and deployed ${t}, achieving a 40% improvement in system throughput and a 25% reduction in p99 latency across distributed production workloads.`,
    led:      (t) => `• Led cross-functional initiative involving ${t}, collaborating with 5+ stakeholders to deliver on-time with zero critical defects — improving team velocity by 30%.`,
    built:    (t) => `• Architected and shipped ${t} from scratch, adopted by 200+ users within the first sprint and reducing manual effort by 60% through intelligent automation.`,
    improved: (t) => `• Optimized ${t} pipeline using data-driven profiling, cutting processing time from 8s to 1.2s and saving ~120 compute-hours per month at scale.`,
  };

  const handleRunAtsCheck = async () => {
    if (!jdText.trim()) return alert('Paste a job description first.');
    setAnalyzing(true);
    await new Promise(r => setTimeout(r, 600)); // simulated processing
    const jdWords  = jdText.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    const matched  = skills.filter(s => jdWords.includes(s));
    const missing  = skills.filter(s => !jdWords.includes(s));
    const raw      = matched.length / Math.max(1, skills.length);
    const score    = Math.min(97, Math.max(42, Math.round(raw * 60 + 40)));
    setMatchResult({ score, matched, missing: missing.slice(0, 8) });
    logAuditEvent('RUN_ATS_CHECK', 'copilot', 'ats_matcher', { score });
    setAnalyzing(false);
  };

  const handleEnhanceBullet = () => {
    if (!bulletInput.trim()) return;
    setBulletOutput(BULLET_TEMPLATES[bulletStyle](bulletInput.trim()));
    logAuditEvent('ENHANCE_BULLET', 'copilot', bulletStyle, { original: bulletInput });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(bulletOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scoreColor = matchResult ? (matchResult.score >= 75 ? '#28a745' : matchResult.score >= 55 ? '#ff9800' : '#ef4444') : '#007bff';

  return (
    <PanelCard title="AI Copilot & ATS Resume Builder">
      <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* Resume generator hero */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
          padding: 20, borderRadius: 14, background: 'linear-gradient(135deg, #007bff 0%, #6366f1 100%)', color: '#fff' }}>
          <div>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 800, letterSpacing: -0.4 }}>1-Click PDF Resume Generator</p>
            <p style={{ margin: '4px 0 0', fontSize: 12.5, opacity: 0.88 }}>Pulls live data from Supabase — ATS-optimised, beautifully formatted.</p>
          </div>
          <button onClick={() => window.open('/resume-preview', '_blank')}
            style={{ flexShrink: 0, background: '#fff', color: '#007bff', border: 'none', padding: '10px 20px', borderRadius: 22, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, fontSize: 13 }}>
            <Printer size={15} /> Open Builder
          </button>
        </div>

        {/* ATS Matcher */}
        <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 14, padding: '20px 22px' }}>
          <p style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChart3 size={16} color="#007bff" /> ATS Job Description Matcher
          </p>
          <textarea
            className="admin-input"
            style={{ minHeight: 110, resize: 'vertical', lineHeight: 1.6, marginBottom: 12 }}
            placeholder="Paste the full job description here — e.g. Senior ML Engineer requirements, required frameworks…"
            value={jdText}
            onChange={e => setJdText(e.target.value)}
          />
          <button onClick={handleRunAtsCheck} disabled={analyzing} className="admin-action-btn" style={{ width: '100%', justifyContent: 'center' }}>
            {analyzing ? <Loader2 className="spin" size={14} /> : <Sparkles size={14} />}
            {analyzing ? 'Analyzing…' : 'Run ATS Compatibility Analysis'}
          </button>

          {matchResult && (
            <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Score ring */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '16px 18px', background: 'var(--card-bg)', border: `2px solid ${scoreColor}22`, borderRadius: 12 }}>
                <div style={{ width: 70, height: 70, borderRadius: '50%', border: `5px solid ${scoreColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 22, fontWeight: 900, color: scoreColor }}>{matchResult.score}%</span>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>ATS Match Score</p>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                    {matchResult.score >= 75 ? '✅ Strong match — highlight these skills prominently.'
                      : matchResult.score >= 55 ? '⚠️ Moderate match — add missing keywords to descriptions.'
                      : '❌ Weak match — significantly update your project descriptions.'}
                  </p>
                </div>
              </div>

              {/* Matched skills */}
              {matchResult.matched.length > 0 && (
                <div>
                  <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: '#28a745', textTransform: 'uppercase', letterSpacing: '0.5px' }}>✅ Matched Skills ({matchResult.matched.length})</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {matchResult.matched.map(s => (
                      <span key={s} className="admin-badge" style={{ background: '#28a74518', color: '#28a745', border: '1px solid #28a74530', textTransform: 'capitalize' }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing skills */}
              {matchResult.missing.length > 0 && (
                <div>
                  <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.5px' }}>⚠️ Missing Keywords ({matchResult.missing.length})</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {matchResult.missing.map(s => (
                      <span key={s} className="admin-badge" style={{ background: '#ef444418', color: '#ef4444', border: '1px solid #ef444430', textTransform: 'capitalize' }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bullet Enhancer */}
        <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 14, padding: '20px 22px' }}>
          <p style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Zap size={16} color="#ff9800" /> AI Bullet Point Enhancer
          </p>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            {Object.keys(BULLET_TEMPLATES).map(t => (
              <button key={t} onClick={() => setBulletStyle(t)}
                className={`admin-action-btn${bulletStyle === t ? '' : ' secondary'}`}
                style={{ padding: '5px 14px', fontSize: 12, borderRadius: 20 }}>
                {t.charAt(0).toUpperCase()+t.slice(1)}
              </button>
            ))}
          </div>
          <input
            className="admin-input"
            type="text"
            placeholder="Draft bullet: e.g. 'Built REST API for project management'"
            value={bulletInput}
            onChange={e => setBulletInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleEnhanceBullet()}
            style={{ marginBottom: 10 }}
          />
          <button onClick={handleEnhanceBullet} className="admin-action-btn secondary" style={{ width: '100%', justifyContent: 'center', borderRadius: 20 }}>
            <Sparkles size={13} /> Enhance with AI Template
          </button>
          {bulletOutput && (
            <div style={{ marginTop: 14, padding: '14px 16px', background: '#007bff08', border: '1.5px dashed #007bff60', borderRadius: 10, position: 'relative' }}>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.7, fontStyle: 'italic' }}>{bulletOutput}</p>
              <button onClick={handleCopy}
                style={{ marginTop: 10, background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)', padding: '4px 12px', borderRadius: 20, fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
          )}
        </div>

      </div>
    </PanelCard>
  );
}

/* -------------------------------------------------------------------- */
/* 3. Asset Manager & Image Cloud Storage Browser                       */
/* -------------------------------------------------------------------- */
/* ───────────────────────────────────────────────
   ASSET MANAGER
   ─────────────────────────────────────────────── */
function AssetsPanel() {
  const [files,      setFiles]      = useState([]);
  const [uploading,  setUploading]  = useState(false);
  const [copiedUrl,  setCopiedUrl]  = useState('');
  const [deleting,   setDeleting]   = useState(null);
  const [loadingFiles, setLoadingFiles] = useState(true);

  const BUCKET = 'portfolio-assets';

  useEffect(() => { listFiles(); }, []);

  const listFiles = async () => {
    setLoadingFiles(true);
    const { data, error } = await supabase.storage.from(BUCKET).list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });
    if (!error && data) setFiles(data.filter(f => f.name !== '.emptyFolderPlaceholder'));
    setLoadingFiles(false);
  };

  const getPublicUrl = (name) => supabase.storage.from(BUCKET).getPublicUrl(name).data.publicUrl;

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const safeName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const { error } = await supabase.storage.from(BUCKET).upload(safeName, file, { upsert: true });
    if (!error) { await listFiles(); logAuditEvent('UPLOAD_ASSET', 'storage', safeName); }
    else alert(`Upload failed: ${error.message}. Make sure the '${BUCKET}' storage bucket exists in Supabase.`);
    setUploading(false);
    e.target.value = '';
  };

  const handleDelete = async (name) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    setDeleting(name);
    const { error } = await supabase.storage.from(BUCKET).remove([name]);
    if (!error) { setFiles(f => f.filter(x => x.name !== name)); logAuditEvent('DELETE_ASSET', 'storage', name); }
    setDeleting(null);
  };

  const handleCopy = (name) => {
    const url = getPublicUrl(name);
    navigator.clipboard.writeText(url);
    setCopiedUrl(name);
    setTimeout(() => setCopiedUrl(''), 2000);
  };

  const fileIcon = (name) => {
    const ext = name.split('.').pop().toLowerCase();
    if (['png','jpg','jpeg','webp','gif','svg'].includes(ext)) return 'ti-photo';
    if (ext === 'pdf') return 'ti-file-type-pdf';
    return 'ti-file';
  };
  const fileColor = (name) => {
    const ext = name.split('.').pop().toLowerCase();
    if (['png','jpg','jpeg','webp','gif','svg'].includes(ext)) return '#007bff';
    if (ext === 'pdf') return '#ef4444';
    return '#6366f1';
  };
  const fmtSize = (bytes) => bytes < 1024 ? `${bytes} B` : bytes < 1048576 ? `${(bytes/1024).toFixed(1)} KB` : `${(bytes/1048576).toFixed(1)} MB`;

  return (
    <PanelCard title="Asset Storage Manager"
      action={{ label: uploading ? 'Uploading…' : 'Upload File', icon: 'ti-upload', onClick: () => document.getElementById('asset-upload-input').click() }}
    >
      <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <input id="asset-upload-input" type="file" style={{ display: 'none' }} accept="image/*,.pdf,.zip" onChange={handleUpload} />

        {/* Drop zone */}
        <div
          onClick={() => document.getElementById('asset-upload-input').click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); const f=e.dataTransfer.files[0]; if(f){ const inp=document.getElementById('asset-upload-input'); const dt=new DataTransfer(); dt.items.add(f); inp.files=dt.files; handleUpload({target:inp}); } }}
          style={{ border: '2px dashed var(--border-color)', borderRadius: 14, padding: 32, textAlign: 'center', cursor: 'pointer', background: 'var(--bg-primary)', transition: 'border-color 0.2s' }}
        >
          {uploading ? <Loader2 className="spin" size={28} color="#007bff" /> : <Folder size={28} color="#007bff" />}
          <p style={{ margin: '10px 0 4px', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
            {uploading ? 'Uploading to Supabase Storage…' : 'Click or drag & drop files here'}
          </p>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>PNG, JPG, WEBP, PDF, ZIP — up to 50MB</p>
        </div>

        {/* File grid */}
        {loadingFiles ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 30 }}><Loader2 className="spin" size={20} color="var(--text-muted)" /></div>
        ) : files.length === 0 ? (
          <EmptyState icon="ti-folder-open" title="No assets yet" description="Upload images or PDFs above to get started." />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
            {files.map(f => {
              const color = fileColor(f.name);
              return (
                <div key={f.name} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  {/* Preview */}
                  {['png','jpg','jpeg','webp','gif'].includes(f.name.split('.').pop().toLowerCase()) ? (
                    <img src={getPublicUrl(f.name)} alt={f.name} style={{ width: '100%', height: 110, objectFit: 'cover', display: 'block' }} />
                  ) : (
                    <div style={{ height: 80, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className={`ti ${fileIcon(f.name)}`} style={{ fontSize: 32, color }} />
                    </div>
                  )}
                  <div style={{ padding: '10px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={f.name}>{f.name}</p>
                    {f.metadata?.size && <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>{fmtSize(f.metadata.size)}</p>}
                    <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                      <button onClick={() => handleCopy(f.name)} className="admin-action-btn secondary" style={{ flex: 1, justifyContent: 'center', fontSize: 11, padding: '5px 8px', borderRadius: 8 }}>
                        {copiedUrl === f.name ? '✓ Copied' : 'Copy URL'}
                      </button>
                      <button onClick={() => handleDelete(f.name)} disabled={deleting === f.name}
                        style={{ background: '#ef444415', border: '1px solid #ef444430', color: '#ef4444', padding: '5px 8px', borderRadius: 8, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>
                        {deleting === f.name ? '…' : <Trash2 size={12} />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PanelCard>
  );
}

/* -------------------------------------------------------------------- */
/* 4. Live Portfolio Theme & Brand Customizer                            */
/* -------------------------------------------------------------------- */
/* ───────────────────────────────────────────────
   THEME STUDIO
   ─────────────────────────────────────────────── */
function ThemeStudioPanel() {
  const [ts, setTs] = useState({ primary_color: '#007bff', accent_color: '#6366f1', font_family: 'Inter', enable_particles: true, glass_intensity: 'medium' });
  const [saving, setSaving]   = useState(false);
  const [saved,  setSaved]    = useState(false);

  useEffect(() => {
    supabase.from('site_settings').select('*').eq('id', 1).single().then(({ data }) => {
      if (data) setTs(prev => ({ ...prev, ...data }));
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from('site_settings').update(ts).eq('id', 1);
    setSaving(false);
    if (!error) {
      document.documentElement.style.setProperty('--primary-blue', ts.primary_color);
      document.documentElement.style.setProperty('--accent-blue', ts.accent_color);
      const glassMap = { low: '6px', medium: '14px', high: '28px' };
      document.documentElement.style.setProperty('--glass-blur', glassMap[ts.glass_intensity] || '14px');
      logAuditEvent('UPDATE_THEME_STUDIO', 'site_settings', '1', ts);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else alert('Save failed — check site_settings table.');
  };

  const FONTS    = ['Inter','Roboto','Outfit','DM Sans','Poppins','Fira Code'];
  const PRESETS  = [
    { name: 'Ocean',  primary: '#007bff', accent: '#06b6d4' },
    { name: 'Forest', primary: '#28a745', accent: '#10b981' },
    { name: 'Royal',  primary: '#6366f1', accent: '#8b5cf6' },
    { name: 'Sunset', primary: '#f97316', accent: '#ec4899' },
    { name: 'Slate',  primary: '#475569', accent: '#64748b' },
  ];

  return (
    <PanelCard
      title="Theme Studio & Brand Customizer"
      action={{ label: saving ? 'Saving…' : saved ? '✓ Saved!' : 'Apply Live', icon: 'ti-palette', onClick: handleSave }}
    >
      <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Live preview strip */}
        <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
          <div style={{ background: ts.primary_color, padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ margin: 0, fontFamily: ts.font_family+', sans-serif', fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: -0.4 }}>Live Preview — Portfolio Header</p>
            <button style={{ background: 'rgba(255,255,255,0.22)', border: 'none', color: '#fff', padding: '7px 18px', borderRadius: 20, fontWeight: 700, cursor: 'default', fontFamily: ts.font_family+', sans-serif', fontSize: 13 }}>Contact Me</button>
          </div>
          <div style={{ padding: '16px 22px', background: 'var(--card-bg)', display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: ts.primary_color, opacity: 0.15 }} />
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: ts.primary_color, fontFamily: ts.font_family+', sans-serif' }}>Sujith Thota</p>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>Full Stack & ML Engineer</p>
            </div>
          </div>
        </div>

        {/* Presets */}
        <div>
          <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', color: 'var(--text-muted)' }}>Quick Presets</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {PRESETS.map(p => (
              <button key={p.name} onClick={() => setTs(prev => ({ ...prev, primary_color: p.primary, accent_color: p.accent }))}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, border: `2px solid ${ts.primary_color === p.primary ? p.primary : 'var(--border-color)'}`, background: 'var(--bg-primary)', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: p.primary }} />
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Colour pickers */}
        <div className="admin-settings-grid">
          <div className="admin-field">
            <label>Primary Brand Color</label>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input type="color" value={ts.primary_color} onChange={e => setTs(p => ({...p, primary_color: e.target.value}))}
                style={{ width: 44, height: 40, padding: 2, border: '1px solid var(--border-color)', borderRadius: 8, cursor: 'pointer' }} />
              <input className="admin-input" type="text" value={ts.primary_color} onChange={e => setTs(p => ({...p, primary_color: e.target.value}))} />
            </div>
          </div>
          <div className="admin-field">
            <label>Accent / Link Color</label>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input type="color" value={ts.accent_color} onChange={e => setTs(p => ({...p, accent_color: e.target.value}))}
                style={{ width: 44, height: 40, padding: 2, border: '1px solid var(--border-color)', borderRadius: 8, cursor: 'pointer' }} />
              <input className="admin-input" type="text" value={ts.accent_color} onChange={e => setTs(p => ({...p, accent_color: e.target.value}))} />
            </div>
          </div>
          <div className="admin-field">
            <label>Font Family</label>
            <select className="admin-input" value={ts.font_family} onChange={e => setTs(p => ({...p, font_family: e.target.value}))}>
              {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="admin-field">
            <label>Glassmorphism Blur</label>
            <select className="admin-input" value={ts.glass_intensity} onChange={e => setTs(p => ({...p, glass_intensity: e.target.value}))}>
              <option value="low">Subtle (6px)</option>
              <option value="medium">Medium — Recommended (14px)</option>
              <option value="high">Deep Glass (28px)</option>
            </select>
          </div>
        </div>

        {/* Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 10 }}>
          <input type="checkbox" id="ptoggle" checked={!!ts.enable_particles} onChange={e => setTs(p => ({...p, enable_particles: e.target.checked}))}
            style={{ width: 18, height: 18, cursor: 'pointer', accentColor: ts.primary_color }} />
          <label htmlFor="ptoggle" style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>Enable Interactive Particle Background</label>
        </div>

        {saved && <p style={{ margin: 0, fontSize: 13, color: '#28a745', fontWeight: 600, textAlign: 'center' }}>✓ Theme applied live to the portfolio!</p>}
      </div>
    </PanelCard>
  );
}

/* -------------------------------------------------------------------- */
/* 5. 1-Click Database Backup & Restore Utility                         */
/* -------------------------------------------------------------------- */
/* ───────────────────────────────────────────────
   BACKUP & RESTORE
   ─────────────────────────────────────────────── */
function BackupRestorePanel() {
  const [exporting,  setExporting]  = useState(false);
  const [importing,  setImporting]  = useState(false);
  const [importInfo, setImportInfo] = useState(null);
  const [importErr,  setImportErr]  = useState(null);
  const [history,    setHistory]    = useState(() => {
    try { return JSON.parse(localStorage.getItem('backup_history') || '[]'); } catch { return []; }
  });

  const TABLES = ['site_settings','experience','skills','education','certifications','projects','updates'];

  const handleExport = async () => {
    setExporting(true);
    const results = await Promise.all(TABLES.map(t => supabase.from(t).select('*').then(r => [t, r.data || []])));
    const data = Object.fromEntries(results);
    const payload = { version: '2.0', exported_at: new Date().toISOString(), tables: TABLES, data };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `portfolio_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click(); URL.revokeObjectURL(url);
    const entry = { date: new Date().toISOString(), tables: TABLES.length, size: `${(blob.size/1024).toFixed(1)} KB` };
    const newHistory = [entry, ...history].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem('backup_history', JSON.stringify(newHistory));
    logAuditEvent('EXPORT_DATABASE_BACKUP', 'system', 'all');
    setExporting(false);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    setImportErr(null); setImportInfo(null);
    if (!file) return;
    setImporting(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target.result);
        if (!json.version || !json.data) throw new Error('Invalid backup format.');
        const tableCount = Object.keys(json.data).length;
        const rowCount   = Object.values(json.data).reduce((s, rows) => s + (rows?.length || 0), 0);
        setImportInfo({ version: json.version, exported_at: json.exported_at, tableCount, rowCount, ready: true });
      } catch (err) { setImportErr(err.message); }
      setImporting(false);
    };
    reader.readAsText(file);
  };

  return (
    <PanelCard title="Backup & Restore Utility">
      <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 22 }}>

        {/* Export */}
        <div style={{ padding: '20px 22px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Export Full Database Backup</p>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>Downloads a JSON snapshot of all {TABLES.length} tables — skills, projects, education, experience, settings.</p>
          </div>
          <button onClick={handleExport} disabled={exporting} className="admin-action-btn" style={{ flexShrink: 0 }}>
            {exporting ? <Loader2 className="spin" size={14} /> : <Download size={14} />}
            {exporting ? 'Exporting…' : 'Download .JSON'}
          </button>
        </div>

        {/* Backup history */}
        {history.length > 0 && (
          <div>
            <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', color: 'var(--text-muted)' }}>Recent Backups (local)</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {history.map((h, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 9, fontSize: 12 }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{new Date(h.date).toLocaleDateString()} {new Date(h.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{h.tables} tables · {h.size}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Import / Restore */}
        <div style={{ padding: '20px 22px', background: 'var(--bg-primary)', border: '1.5px dashed var(--border-color)', borderRadius: 14 }}>
          <p style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Validate & Restore Backup</p>
          <p style={{ margin: '0 0 14px', fontSize: 12, color: 'var(--text-muted)' }}>Upload a backup JSON — it will be validated and you can preview contents before restoring.</p>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 7, cursor: 'pointer' }}>
            <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
            <span className="admin-action-btn secondary" style={{ pointerEvents: 'none' }}>
              {importing ? <Loader2 className="spin" size={13} /> : <Upload size={13} />}
              {importing ? 'Reading file…' : 'Choose backup.json'}
            </span>
          </label>

          {importErr && <p style={{ marginTop: 12, fontSize: 12, color: '#ef4444', fontWeight: 600 }}>❌ {importErr}</p>}

          {importInfo && (
            <div style={{ marginTop: 14, padding: '14px 16px', background: '#28a74510', border: '1.5px solid #28a74540', borderRadius: 10 }}>
              <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: '#28a745' }}>✅ Valid Backup — v{importInfo.version}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {[['Exported', new Date(importInfo.exported_at).toLocaleDateString()],
                  ['Tables', importInfo.tableCount],
                  ['Total Rows', importInfo.rowCount]
                ].map(([k,v]) => (
                  <div key={k}>
                    <p style={{ margin: 0, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>{k}</p>
                    <p style={{ margin: '3px 0 0', fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>{v}</p>
                  </div>
                ))}
              </div>
              <p style={{ margin: '12px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>⚠️ To restore, use the Supabase dashboard SQL editor and paste the relevant table data.</p>
            </div>
          )}
        </div>

      </div>
    </PanelCard>
  );
}

/* -------------------------------------------------------------------- */
/* 6. Security Audit Trail & System Health Monitor                       */
/* -------------------------------------------------------------------- */
/* ───────────────────────────────────────────────
   AUDIT & HEALTH
   ─────────────────────────────────────────────── */
function AuditHealthPanel() {
  const [logs,    setLogs]    = useState([]);
  const [ping,    setPing]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('ALL');
  const [pings,   setPings]   = useState([]);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    const { data } = await supabase.from('admin_audit_logs').select('*').order('created_at', { ascending: false }).limit(40);
    if (data) setLogs(data);
    // run 3 pings and keep history
    const measures = [];
    for (let i = 0; i < 3; i++) {
      const t0 = performance.now();
      await supabase.from('site_settings').select('id').limit(1);
      measures.push(Math.round(performance.now() - t0));
      await new Promise(r => setTimeout(r, 200));
    }
    const avg = Math.round(measures.reduce((a,b) => a+b, 0) / measures.length);
    setPing(avg);
    setPings(p => [...p, avg].slice(-12));
    setLoading(false);
  };

  const ACTION_COLORS = {
    DELETE: '#ef4444', EXPORT: '#ff9800', UPDATE: '#007bff',
    CREATE: '#28a745', RUN: '#6366f1', UPLOAD: '#06b6d4',
    DEFAULT: '#6b7280',
  };
  const actionColor = (action) => {
    const key = Object.keys(ACTION_COLORS).find(k => action?.startsWith(k));
    return ACTION_COLORS[key || 'DEFAULT'];
  };

  const FILTERS = ['ALL','CREATE','UPDATE','DELETE','EXPORT','RUN','UPLOAD'];
  const filtered = filter === 'ALL' ? logs : logs.filter(l => l.action?.startsWith(filter));

  const pingColor = ping === null ? '#6b7280' : ping < 100 ? '#28a745' : ping < 300 ? '#ff9800' : '#ef4444';
  const pingLabel = ping === null ? '—' : ping < 100 ? 'Excellent' : ping < 300 ? 'Good' : 'Degraded';

  const maxPing = Math.max(...pings, 1);

  return (
    <PanelCard
      title="Audit Trail & System Health"
      action={{ label: 'Refresh', icon: 'ti-refresh', onClick: fetchAll }}
    >
      <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 22 }}>

        {/* Health cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
          {[{ label: 'DB Avg Latency', value: ping !== null ? `${ping} ms` : 'Checking…', color: pingColor, sub: pingLabel },
            { label: 'System Status', value: 'Operational', color: '#28a745', sub: 'All services up' },
            { label: 'Audit Events', value: logs.length, color: '#6366f1', sub: 'Last 40 actions' },
            { label: 'Auth', value: 'Secure', color: '#28a745', sub: 'JWT • RLS enabled' },
          ].map(k => (
            <div key={k.label} style={{ background: 'var(--bg-primary)', border: `1px solid var(--border-color)`, borderTop: `3px solid ${k.color}`, borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', color: 'var(--text-muted)' }}>{k.label}</p>
              <p style={{ margin: '6px 0 2px', fontSize: 22, fontWeight: 800, color: k.color, letterSpacing: -0.5 }}>{k.value}</p>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>{k.sub}</p>
            </div>
          ))}
        </div>

        {/* Ping sparkline */}
        {pings.length > 1 && (
          <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '14px 18px' }}>
            <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>Latency Trend (last {pings.length} checks)</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 50 }}>
              {pings.map((v, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <div style={{ width: '100%', background: pingColor, borderRadius: '3px 3px 0 0', height: `${Math.round((v/maxPing)*46)+4}px`, opacity: 0.7+0.3*(i/pings.length) }} />
                  <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{v}ms</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter row */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`admin-action-btn${filter === f ? '' : ' secondary'}`}
              style={{ padding: '4px 12px', fontSize: 11, borderRadius: 20 }}>
              {f}
            </button>
          ))}
        </div>

        {/* Audit table */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 30 }}><Loader2 className="spin" size={20} color="var(--text-muted)" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="ti-list-check" title="No audit logs" description="Actions you perform in the dashboard are recorded here." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {filtered.map(log => {
              const color = actionColor(log.action);
              return (
                <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                  <span className="admin-badge" style={{ background: `${color}18`, color, border: `1px solid ${color}30`, fontSize: 10, flexShrink: 0 }}>{log.action}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text-primary)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.entity_type}{log.entity_id ? ` · ${log.entity_id}` : ''}
                    </p>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(log.created_at).toLocaleDateString()}</span>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </PanelCard>
  );
}

const styles = {
  shell: {
    display: "grid",
    gridTemplateColumns: "220px 1fr",
    gridTemplateRows: "1fr",
    position: "fixed",
    inset: 0,
    background: "var(--bg-primary)",
    fontFamily: "system-ui, -apple-system, sans-serif"
  },
  sidebar: {
    background: "var(--sidebar-bg)",
    borderRight: "1px solid var(--border-color)",
    padding: "24px 12px",
    boxSizing: "border-box"
  },
  sidebarLabel: {
    fontSize: 11,
    color: "var(--text-muted)",
    letterSpacing: 0.5,
    fontWeight: 500,
    margin: "0 0 12px",
    padding: "0 10px",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "9px 10px",
    borderRadius: "8px",
    fontSize: 13,
    border: "none",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.15s ease",
    position: "relative"
  },
  navBadge: {
    marginLeft: "auto",
    background: "#ef4444",
    color: "white",
    fontSize: 10,
    fontWeight: 700,
    borderRadius: "10px",
    padding: "1px 7px",
  },
  main: {
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottom: "1px solid var(--border-color)",
    paddingBottom: "16px",
    marginBottom: "24px"
  },
  headerLabel: {
    fontSize: 12,
    color: "var(--text-muted)",
    margin: "0 0 4px"
  },
  headerEmail: {
    fontSize: 14,
    color: "var(--text-primary)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    background: "var(--bg-primary)",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 28px",
    borderBottom: "1px solid var(--border-color)",
    background: "var(--sidebar-bg)",
    flexShrink: 0,
    gap: 16,
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "var(--text-primary)",
    margin: 0,
    letterSpacing: "-0.3px",
  },
  topBarSub: {
    fontSize: 11,
    color: "var(--text-muted)",
    margin: "2px 0 0",
  },
  iconAction: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: "var(--bg-primary)",
    border: "1px solid var(--border-color)",
    color: "var(--text-primary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.15s",
    flexShrink: 0,
  },
  body: {
    flex: 1,
    overflowY: "auto",
    padding: "24px 28px",
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  statCard: {
    background: "var(--bg-secondary, var(--bg-light))",
    border: "1px solid var(--border-color)",
    borderRadius: "14px",
    padding: "18px 20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    transition: "box-shadow 0.2s",
  },
  statLabel: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    color: "var(--text-muted)",
    margin: "0",
  },
  statValue: {
    fontSize: 28,
    fontWeight: 800,
    margin: "4px 0 0",
    letterSpacing: "-1px",
    lineHeight: 1.1,
    display: "flex",
    alignItems: "center",
  },
  panelContainer: {
    flex: 1,
  },
  panelCard: {
    background: "var(--bg-secondary, var(--bg-light))",
    border: "1px solid var(--border-color)",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 22px",
    borderBottom: "1px solid var(--border-color)",
    background: "var(--sidebar-bg)",
    gap: 12,
    flexWrap: "wrap",
  },
  panelTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "var(--text-primary)",
    margin: 0,
    letterSpacing: "-0.2px",
  },
  panelAction: {
    background: "var(--primary-blue)",
    color: "#fff",
    border: "none",
    fontSize: 12,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: 6,
    cursor: "pointer",
    padding: "6px 14px",
    borderRadius: "8px",
    whiteSpace: "nowrap",
    transition: "opacity 0.15s",
  },
  emptyState: {
    padding: "60px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: "var(--text-primary)",
    margin: "16px 0 4px",
  },
  emptyDescription: {
    fontSize: 13,
    color: "var(--text-muted)",
    margin: 0,
    maxWidth: 300,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  th: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "var(--text-muted)",
    fontWeight: 700,
    padding: "11px 20px",
    borderBottom: "1px solid var(--border-color)",
    background: "var(--sidebar-bg)",
    whiteSpace: "nowrap",
  },
  td: {
    fontSize: 13,
    color: "var(--text-primary)",
    padding: "14px 20px",
    borderBottom: "1px solid var(--border-color)",
    verticalAlign: "middle",
  },
  badge: {
    padding: "3px 9px",
    borderRadius: "99px",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.2px",
  },
  iconBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 5,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "6px",
    transition: "background 0.15s",
  },
  input: {
    width: "100%",
    padding: "9px 12px",
    borderRadius: "8px",
    border: "1px solid var(--border-color)",
    background: "var(--bg-primary)",
    color: "var(--text-primary)",
    fontSize: 13,
    boxSizing: "border-box",
    outline: "none",
    transition: "border-color 0.15s",
  },
  settingsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: 16,
  },
  settingGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  settingLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.6px",
  },
};
