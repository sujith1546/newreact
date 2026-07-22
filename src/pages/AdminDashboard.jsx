import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from '../context/AuthContext';
import { Loader2, Trash2, Check, ChevronRight, X, MessageSquare, MessageCircle, Briefcase, Zap, LogOut, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
  { key: "messages", label: "Messages", icon: "ti-message-circle" },
  { key: "projects", label: "Projects", icon: "ti-briefcase" },
  { key: "updates", label: "Updates", icon: "ti-bolt" },
  { key: "chats", label: "AI chats", icon: "ti-messages" },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
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

  return (
    <div style={styles.shell}>
      <style>{`
        body { 
          background-color: #1e1e1e !important; 
          margin: 0; 
          padding: 0; 
          zoom: 1 !important;
          min-height: 100vh;
        }
        #root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
      `}</style>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <p style={styles.sidebarLabel}>Admin</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                style={{
                  ...styles.navItem,
                  background: isActive ? "rgba(59, 130, 246, 0.2)" : "transparent",
                  color: isActive ? "#3b82f6" : "#d4d4d8",
                  fontWeight: isActive ? 600 : 500,
                  borderRadius: "8px"
                }}
              >
                <i className={`ti ${item.icon}`} style={{ fontSize: 16 }} aria-hidden="true" />
                {item.label}
                {item.key === "messages" && stats.unreadMessages > 0 && (
                  <span style={styles.navBadge}>{stats.unreadMessages}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <div style={styles.main}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <p style={styles.headerLabel}>Signed in as</p>
            <p style={styles.headerEmail}>{user?.email || "—"}</p>
            {lastLogin && (
              <p style={styles.lastLoginText}>
                Last login: {new Date(lastLogin.logged_in_at).toLocaleString()} 
                {lastLogin.user_agent ? ` from ${parseUserAgent(lastLogin.user_agent)}` : ''}
              </p>
            )}
          </div>
          <button onClick={handleLogout} style={styles.logoutButton}>
            <LogOut size={14} />
            Log out
          </button>
        </div>

        {/* Stats row */}
        <div style={styles.statsRow}>
          <StatCard label="Legit Messages" value={stats.unreadMessages} loading={stats.loading} />
          <StatCard label="Projects" value={stats.projectCount} loading={stats.loading} />
          <StatCard label="Changelog entries" value={stats.updateCount} loading={stats.loading} />
          <StatCard label="AI sessions" value={stats.sessionCount} loading={stats.loading} />
        </div>

        {/* Panel content */}
        <div style={styles.panelWrap}>
          {activeTab === "messages" && <MessagesPanel />}
          {activeTab === "projects" && <ProjectsPanel />}
          {activeTab === "updates" && <UpdatesPanel />}
          {activeTab === "chats" && <AiChatsPanel />}
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
      const [messages, projects, updates, sessions] = await Promise.all([
        supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq('is_bot', false),
        supabase.from("projects").select("id", { count: "exact", head: true }),
        supabase.from("updates").select("id", { count: "exact", head: true }),
        supabase.from("chat_sessions").select("id", { count: "exact", head: true }),
      ]);

      setStats({
        unreadMessages: messages.count ?? 0,
        projectCount: projects.count ?? 0,
        updateCount: updates.count ?? 0,
        sessionCount: sessions.count ?? 0,
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
function StatCard({ label, value, loading }) {
  return (
    <div style={styles.statCard}>
      <p style={styles.statLabel}>{label}</p>
      <p style={styles.statValue}>{loading ? "—" : value}</p>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* Empty state — reusable                                                */
/* -------------------------------------------------------------------- */
function EmptyState({ icon, title, description }) {
  return (
    <div style={styles.emptyState}>
      <i className={`ti ${icon}`} style={{ fontSize: 28, color: "#a1a1aa" }} aria-hidden="true" />
      <p style={styles.emptyTitle}>{title}</p>
      <p style={styles.emptyDescription}>{description}</p>
    </div>
  );
}

function PanelCard({ title, action, children }) {
  return (
    <div style={styles.panelCard}>
      <div style={styles.panelHeader}>
        <h3 style={styles.panelTitle}>{title}</h3>
        {action && (
          <button style={styles.panelAction}>
            <i className={`ti ${action.icon}`} style={{ fontSize: 14 }} aria-hidden="true" />
            {action.label}
          </button>
        )}
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

function MessagesPanel() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .eq('is_bot', false)
      .order('created_at', { ascending: false });
    if (!error && data) setMessages(data);
    setLoading(false);
  };

  const deleteMessage = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    const { error } = await supabase.from('contact_messages').delete().eq('id', id);
    if (!error) setMessages(messages.filter(m => m.id !== id));
  };

  if (loading) return <PanelCard title="Contact messages"><div style={styles.emptyState}><Loader2 className="spin" size={24} color="var(--text-muted)" /></div></PanelCard>;

  return (
    <PanelCard title="Contact messages">
      {messages.length === 0 ? (
        <EmptyState icon="ti-inbox" title="No messages yet" description="Submissions from your contact form will show up here." />
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Message</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {messages.map(msg => (
              <tr key={msg.id}>
                <td style={styles.td}>{new Date(msg.created_at).toLocaleDateString()}</td>
                <td style={{ ...styles.td, fontWeight: 500 }}>{msg.name}</td>
                <td style={styles.td}>{msg.email}</td>
                <td style={{ ...styles.td, maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{msg.message}</td>
                <td style={styles.td}>
                  <button onClick={() => deleteMessage(msg.id)} style={styles.deleteBtn} title="Delete"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </PanelCard>
  );
}

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
                <td style={styles.td}>{proj.featured ? <Check size={16} color="var(--fill-success, #10b981)" /> : ''}</td>
                <td style={styles.td}>
                  <button onClick={() => deleteProject(proj.id)} style={styles.deleteBtn} title="Delete"><Trash2 size={16} /></button>
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
                  <button onClick={() => deleteUpdate(update.id)} style={styles.deleteBtn} title="Delete"><Trash2 size={16} /></button>
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

  if (loading) return <PanelCard title="AI telemetry logs"><div style={styles.emptyState}><Loader2 className="spin" size={24} color="var(--text-muted)" /></div></PanelCard>;

  if (selectedSession) {
    return (
      <PanelCard title={`Session: ${selectedSession}`}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
          <button onClick={() => setSelectedSession(null)} style={{ ...styles.panelAction, marginRight: '1rem' }}>
            <X size={14} /> Back
          </button>
        </div>

        {loadingMessages ? (
          <div style={styles.emptyState}><Loader2 className="spin" size={24} color="var(--text-muted)" /></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--surface-0)', padding: '1.5rem', borderRadius: '12px' }}>
            {messages.map((msg, i) => (
              <div key={msg.id || i} style={{ 
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                background: msg.role === 'user' ? 'var(--bg-accent)' : 'var(--surface-1)',
                border: `1px solid ${msg.role === 'user' ? 'var(--border-accent)' : 'var(--border)'}`,
                padding: '1rem',
                borderRadius: '12px',
                maxWidth: '80%'
              }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: msg.role === 'user' ? 'var(--text-accent)' : 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
                  {msg.role}
                </div>
                <div style={{ fontSize: '0.95rem', lineHeight: 1.5, whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </PanelCard>
    );
  }

  return (
    <PanelCard title="AI telemetry logs">
      {sessions.length === 0 ? (
        <EmptyState icon="ti-messages" title="No chat sessions recorded yet" description="Conversations from your AI assistant will appear here once visitors start chatting." />
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Session ID</th>
              <th style={styles.th}>Started At</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map(session => (
              <tr key={session.id}>
                <td style={{ ...styles.td, fontFamily: 'monospace', color: 'var(--text-accent)' }}>{session.id}</td>
                <td style={styles.td}>{new Date(session.created_at).toLocaleString()}</td>
                <td style={{ ...styles.td, display: 'flex', gap: 8 }}>
                  <button onClick={() => loadMessages(session.id)} style={styles.viewBtn} title="View Chat"><ChevronRight size={16} /></button>
                  <button onClick={() => deleteSession(session.id)} style={styles.deleteBtn} title="Delete"><Trash2 size={16} /></button>
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

const styles = {
  shell: {
    display: "flex",
    alignItems: "stretch",
    minHeight: "100vh",
    flexGrow: 1,
    background: "#1e1e1e",
    fontFamily: "system-ui, -apple-system, sans-serif"
  },
  sidebar: {
    width: 220,
    background: "#2a2a2a",
    borderRight: "1px solid #3f3f46",
    padding: "24px 12px",
    flexShrink: 0,
    minHeight: "100vh",
    boxSizing: "border-box"
  },
  sidebarLabel: {
    fontSize: 11,
    color: "#a1a1aa",
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
    width: "100%",
    textAlign: "left",
    cursor: "pointer",
  },
  navBadge: {
    marginLeft: "auto",
    background: "#ef4444",
    color: "#ffffff",
    fontSize: 11,
    fontWeight: 500,
    borderRadius: 999,
    padding: "1px 7px",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px 24px",
    borderBottom: "1px solid #3f3f46",
  },
  headerLabel: {
    fontSize: 12,
    color: "#a1a1aa",
    margin: 0,
  },
  headerEmail: {
    fontSize: 13,
    color: "#ffffff",
    margin: 0,
    fontWeight: 500
  },
  lastLoginText: {
    fontSize: 11,
    color: "#71717a",
    margin: "4px 0 0 0",
  },
  logoutButton: {
    height: 32,
    padding: "0 12px",
    borderRadius: "8px",
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.2)",
    color: "#ef4444",
    fontSize: 12,
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    gap: 6,
    cursor: "pointer",
  },
  statsRow: {
    padding: 24,
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 12,
  },
  statCard: {
    background: "#2a2a2a",
    border: "1px solid #3f3f46",
    borderRadius: "8px",
    padding: "1rem",
  },
  statLabel: {
    fontSize: 12,
    color: "#a1a1aa",
    margin: "0 0 4px",
  },
  statValue: {
    fontSize: 22,
    fontWeight: 500,
    margin: 0,
    color: "#ffffff",
  },
  panelWrap: {
    padding: "0 24px 24px",
    flex: 1,
  },
  panelCard: {
    background: "#2a2a2a",
    border: "1px solid #3f3f46",
    borderRadius: 12,
    padding: "1.25rem",
  },
  panelHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: 500,
    margin: 0,
    color: "#ffffff",
  },
  panelAction: {
    height: 32,
    padding: "0 12px",
    borderRadius: "8px",
    background: "transparent",
    border: "1px solid #52525b",
    color: "#ffffff",
    fontSize: 12,
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    gap: 6,
    cursor: "pointer",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 0",
    gap: 8,
    textAlign: "center",
  },
  emptyTitle: {
    fontSize: 14,
    color: "#ffffff",
    margin: 0,
    fontWeight: 500,
  },
  emptyDescription: {
    fontSize: 12,
    color: "#a1a1aa",
    margin: 0,
    maxWidth: 280,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  th: {
    padding: "12px 16px",
    borderBottom: "1px solid #3f3f46",
    color: "#a1a1aa",
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  td: {
    padding: "16px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
    color: "#ffffff",
    fontSize: 13,
  },
  deleteBtn: {
    background: "transparent",
    border: "none",
    color: "#ef4444",
    cursor: "pointer",
    padding: 6,
    borderRadius: 6,
  },
  viewBtn: {
    background: "transparent",
    border: "none",
    color: "#10b981",
    cursor: "pointer",
    padding: 6,
    borderRadius: 6,
  }
};
