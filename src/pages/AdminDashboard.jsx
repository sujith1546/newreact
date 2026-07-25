import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import useRealtimeData from '../hooks/useRealtimeData';
import { MaintenanceSettingsPanel } from '../components/MaintenanceMode';
import MessagesAdmin, { UnreadBadge } from '../components/MessagesAdmin';
import { Menu, Loader2, Trash2, Check, ChevronRight, ChevronDown, X, MessageSquare, MessageCircle, Briefcase, Zap, LogOut, Plus, Edit3, Star, Layers, BarChart3, Sparkles, Folder, Palette, Database, Activity, Download, Upload, ShieldCheck, FileText, RefreshCw, Eye, Printer, Award, Type, Image, Link, Settings, User, Mail, Globe, Bell } from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { logAuditEvent } from '../lib/auditLogger';
import { trackRecruiterEvent } from '../lib/analyticsTracker';
import VisitorGlobe from '../components/VisitorGlobe';

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
  const { tab } = useParams();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTabState] = useState(tab || "messages");
  const [lastLogin, setLastLogin] = useState(null);
  const [visitorMarkers, setVisitorMarkers] = useState([]);
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
    // Setup Supabase Realtime presence for Visitor Globe
    // First remove any lingering channel with the same name to prevent "cannot add presence callbacks after subscribe" error
    const existingChannel = supabase.getChannels().find(c => c.topic === 'realtime:visitor_presence' || c.topic === 'visitor_presence');
    if (existingChannel) {
      supabase.removeChannel(existingChannel);
    }

    const channel = supabase.channel('visitor_presence');
    
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const markers = [];
        for (const id in state) {
          state[id].forEach((presence) => {
            if (presence.lat && presence.lng) {
              markers.push({ location: [presence.lat, presence.lng], size: 0.1 });
            }
          });
        }
        setVisitorMarkers(markers);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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


        <div className="admin-body">
          {/* Real-time Visitor Globe Widget (visible on Analytics Hub or as a permanent widget) */}
          {activeTab === "analytics" && (
            <div style={{ padding: '20px', background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Globe size={18} color="var(--primary-blue)" />
                  Live Visitor Map
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
                  Real-time visualization of current visitors browsing the portfolio across the globe.
                  Active users: <span style={{ color: 'var(--success-green)', fontWeight: 600 }}>{visitorMarkers.length}</span>
                </p>
              </div>
              <div style={{ width: '150px', height: '150px' }}>
                <VisitorGlobe markers={visitorMarkers} />
              </div>
            </div>
          )}

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

function AiChatsPanel() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    fetchSessions();
    
    // Subscribe to new sessions
    const sessionSub = supabase.channel('realtime-sessions')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_sessions' }, (payload) => {
        setSessions(prev => [payload.new, ...prev]);
      })
      .subscribe();
      
    // Subscribe to new messages
    const messageSub = supabase.channel('realtime-messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload) => {
        setMessages(prev => {
          // Only append if it belongs to the currently viewed session
          if (payload.new.session_id === selectedSession) {
            return [...prev, payload.new];
          }
          return prev;
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(sessionSub);
      supabase.removeChannel(messageSub);
    };
  }, [selectedSession]);

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


/* -------------------------------------------------------------------- */
/* Skills Panel                                                         */
/* -------------------------------------------------------------------- */
const SKILL_CATEGORIES = ['languages', 'database', 'ml', 'soft', 'exploring'];
const SKILL_LEVELS = ['Learning', 'Intermediate', 'Advanced'];

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
/* -------------------------------------------------------------------- */
/* ───────────────────────────────────────────────
   THEME STUDIO
   ─────────────────────────────────────────────── */
/* -------------------------------------------------------------------- */
/* ───────────────────────────────────────────────
   BACKUP & RESTORE
   ─────────────────────────────────────────────── */
/* -------------------------------------------------------------------- */
/* ───────────────────────────────────────────────
   AUDIT & HEALTH
   ─────────────────────────────────────────────── */
const styles = {
  btn: {
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    border: '1px solid var(--border-color)',
    background: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    transition: 'all 0.2s ease',
  },
  btnPrimary: {
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    border: 'none',
    background: '#3b82f6',
    color: '#ffffff',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
  },

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
