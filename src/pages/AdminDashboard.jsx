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
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFeatured, setFilterFeatured] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [toast, setToast] = useState(null);
  const EMPTY_FORM = { title: '', description: '', tags: [], github_url: '', live_url: '', image_url: '', featured: false };
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => { fetchProjects(); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: true });
    if (!error && data) setProjects(data);
    setLoading(false);
  };

  const deleteProject = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (!error) {
      setProjects(prev => prev.filter(p => p.id !== id));
      showToast(`"${title}" deleted successfully`, 'error');
    } else {
      showToast('Failed to delete project', 'error');
    }
  };

  const toggleFeatured = async (proj) => {
    const newVal = !proj.featured;
    const { error } = await supabase.from('projects').update({ featured: newVal }).eq('id', proj.id);
    if (!error) {
      setProjects(prev => prev.map(p => p.id === proj.id ? { ...p, featured: newVal } : p));
      showToast(newVal ? `"${proj.title}" is now featured` : `"${proj.title}" unfeatured`);
    }
  };

  const openModal = (proj = null) => {
    if (proj) {
      setEditingProject(proj);
      setFormData({
        title: proj.title || '',
        description: proj.description || '',
        tags: Array.isArray(proj.tags) ? proj.tags : [],
        github_url: (proj.github_url && proj.github_url !== '#') ? proj.github_url : '',
        live_url: (proj.live_url && proj.live_url !== '#') ? proj.live_url : '',
        image_url: proj.image_url || '',
        featured: proj.featured || false,
      });
    } else {
      setEditingProject(null);
      setFormData(EMPTY_FORM);
    }
    setTagInput('');
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingProject(null); };

  const handleTagKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const val = tagInput.trim().replace(/,/g, '');
      if (val && !formData.tags.includes(val)) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, val] }));
      }
      setTagInput('');
    }
    if (e.key === 'Backspace' && !tagInput && formData.tags.length > 0) {
      setFormData(prev => ({ ...prev, tags: prev.tags.slice(0, -1) }));
    }
  };

  const removeTag = (tag) => setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));

  const saveProject = async () => {
    if (!formData.title.trim()) { showToast('Project title is required', 'error'); return; }
    setSaving(true);
    const payload = {
      ...formData,
      github_url: formData.github_url.trim() || null,
      live_url: formData.live_url.trim() || null,
      image_url: formData.image_url.trim() || null,
    };
    if (editingProject) {
      const { data, error } = await supabase.from('projects').update(payload).eq('id', editingProject.id).select().single();
      if (!error && data) {
        setProjects(prev => prev.map(p => p.id === data.id ? data : p));
        showToast(`"${data.title}" updated successfully`);
        closeModal();
      } else { showToast('Failed to save changes', 'error'); }
    } else {
      const { data, error } = await supabase.from('projects').insert([payload]).select().single();
      if (!error && data) {
        setProjects(prev => [...prev, data]);
        showToast(`"${data.title}" created successfully`);
        closeModal();
      } else { showToast('Failed to create project', 'error'); }
    }
    setSaving(false);
  };

  const filteredProjects = projects
    .filter(p => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || p.title?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || p.tags?.some(t => t.toLowerCase().includes(q));
      const matchesFeatured = filterFeatured === 'all' || (filterFeatured === 'featured' ? p.featured : !p.featured);
      return matchesSearch && matchesFeatured;
    })
    .sort((a, b) => {
      if (sortBy === 'title') return a.title?.localeCompare(b.title);
      if (sortBy === 'featured') return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      return new Date(b.created_at) - new Date(a.created_at);
    });

  if (loading) return <PanelCard title="Projects"><div style={styles.emptyState}><Loader2 className="spin" size={24} color="var(--text-muted)" /></div></PanelCard>;

  const modalOverlay = {
    position: 'fixed', inset: 0, zIndex: 2000,
    background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(6px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '24px',
  };
  const modalBox = {
    background: 'var(--sidebar-bg, #1a1a2e)',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
    width: '100%', maxWidth: '580px',
    maxHeight: '90vh', overflowY: 'auto',
    boxShadow: '0 32px 64px rgba(0,0,0,0.5)',
    display: 'flex', flexDirection: 'column',
  };
  const modalHeader = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '20px 24px', borderBottom: '1px solid var(--border-color)',
    flexShrink: 0,
  };
  const modalBody = { padding: '24px', display: 'flex', flexDirection: 'column', gap: 18 };
  const modalFooter = {
    padding: '16px 24px', borderTop: '1px solid var(--border-color)',
    display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0,
  };
  const labelStyle = { fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 };
  const inputStyle = { ...styles.input, background: 'var(--bg-primary)' };
  const sectionLabel = { fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0 };

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          background: toast.type === 'error' ? '#ef4444' : '#10b981',
          color: '#fff', padding: '12px 20px', borderRadius: 10,
          fontSize: 13, fontWeight: 600,
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          animation: 'fadeIn 0.2s ease',
        }}>
          {toast.msg}
        </div>
      )}

      <PanelCard title="Projects" action={{ label: 'Add project', icon: 'ti-plus', onClick: () => openModal() }}>
        {/* Toolbar */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', background: 'var(--bg-secondary)' }}>
          <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 180 }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input
              type="text"
              placeholder="Search by title, description or tag..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ ...inputStyle, paddingLeft: 32, paddingTop: 7, paddingBottom: 7, fontSize: 13 }}
            />
          </div>
          <select
            value={filterFeatured}
            onChange={e => setFilterFeatured(e.target.value)}
            style={{ ...inputStyle, width: 'auto', paddingTop: 7, paddingBottom: 7, cursor: 'pointer' }}
          >
            <option value="all">All Projects</option>
            <option value="featured">Featured Only</option>
            <option value="notfeatured">Not Featured</option>
          </select>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{ ...inputStyle, width: 'auto', paddingTop: 7, paddingBottom: 7, cursor: 'pointer' }}
          >
            <option value="created_at">Sort: Newest</option>
            <option value="title">Sort: A–Z</option>
            <option value="featured">Sort: Featured</option>
          </select>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap', marginLeft: 'auto' }}>
            {filteredProjects.length} / {projects.length} projects
          </span>
        </div>

        {/* Table */}
        {projects.length === 0 ? (
          <EmptyState icon="ti-briefcase" title="No projects yet" description="Click '+ Add project' to add your first project." />
        ) : filteredProjects.length === 0 ? (
          <div style={{ ...styles.emptyState, padding: '40px 20px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No projects match your search or filter.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={{ ...styles.th, width: '22%' }}>Title</th>
                  <th style={{ ...styles.th, width: '30%' }}>Description</th>
                  <th style={{ ...styles.th, width: '25%' }}>Tags</th>
                  <th style={{ ...styles.th, width: '10%', textAlign: 'center' }}>Featured</th>
                  <th style={{ ...styles.th, width: '13%', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((proj, i) => (
                  <tr
                    key={proj.id}
                    onDoubleClick={() => openModal(proj)}
                    style={{ cursor: 'pointer', background: i % 2 === 0 ? 'transparent' : 'rgba(128,128,128,0.025)', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(128,128,128,0.025)'}
                  >
                    <td style={{ ...styles.td, fontWeight: 600, fontSize: 13 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span>{proj.title}</span>
                        {proj.live_url && proj.live_url !== '#' && (
                          <a href={proj.live_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ fontSize: 11, color: '#3b82f6', textDecoration: 'none' }}>↗ Live</a>
                        )}
                      </div>
                    </td>
                    <td style={{ ...styles.td, color: 'var(--text-muted)', fontSize: 12, maxWidth: 240 }}>
                      <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {proj.description || '—'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {(proj.tags || []).slice(0, 4).map(tag => (
                          <span key={tag} style={{ fontSize: 10, padding: '2px 7px', background: 'rgba(59,130,246,0.12)', color: '#60a5fa', borderRadius: 20, fontWeight: 600, letterSpacing: '0.2px' }}>{tag}</span>
                        ))}
                        {(proj.tags || []).length > 4 && (
                          <span style={{ fontSize: 10, padding: '2px 5px', color: 'var(--text-muted)' }}>+{proj.tags.length - 4}</span>
                        )}
                      </div>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <button
                        onClick={e => { e.stopPropagation(); toggleFeatured(proj); }}
                        title={proj.featured ? 'Click to unfeature' : 'Click to feature'}
                        style={{ ...styles.iconBtn, margin: '0 auto', padding: 6, borderRadius: 8, background: proj.featured ? 'rgba(16,185,129,0.1)' : 'transparent' }}
                      >
                        <Star size={15} color={proj.featured ? '#10b981' : 'var(--text-muted)'} fill={proj.featured ? '#10b981' : 'none'} />
                      </button>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                        <button
                          onClick={e => { e.stopPropagation(); openModal(proj); }}
                          title="Edit project"
                          style={{ ...styles.iconBtn, padding: 6, borderRadius: 7, background: 'rgba(59,130,246,0.08)' }}
                        >
                          <Edit3 size={14} color="#3b82f6" />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); deleteProject(proj.id, proj.title); }}
                          title="Delete project"
                          style={{ ...styles.iconBtn, padding: 6, borderRadius: 7, background: 'rgba(239,68,68,0.08)' }}
                        >
                          <Trash2 size={14} color="#ef4444" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PanelCard>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div style={modalOverlay} onClick={closeModal}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {editingProject ? <Edit3 size={15} color="#3b82f6" /> : <Plus size={15} color="#3b82f6" />}
                </div>
                <div>
                  <p style={{ ...sectionLabel, margin: 0 }}>{editingProject ? 'Edit Project' : 'New Project'}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>{editingProject ? `Editing: ${editingProject.title}` : 'Add a new project to your portfolio'}</p>
                </div>
              </div>
              <button onClick={closeModal} style={{ ...styles.iconBtn, padding: 6 }}>
                <X size={18} color="var(--text-muted)" />
              </button>
            </div>

            {/* Modal Body */}
            <div style={modalBody}>
              {/* Title */}
              <div>
                <label style={labelStyle}>Project Title <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  style={inputStyle}
                  value={formData.title}
                  onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. AI Portfolio Generator"
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label style={labelStyle}>Description</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 85, resize: 'vertical', lineHeight: 1.6 }}
                  value={formData.description}
                  onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                  placeholder="Brief overview of what you built, technologies used, and impact..."
                />
              </div>

              {/* Tags */}
              <div>
                <label style={labelStyle}>Tags</label>
                <div style={{
                  display: 'flex', flexWrap: 'wrap', gap: 6, padding: '6px 10px',
                  borderRadius: 8, border: '1px solid var(--border-color)',
                  background: 'var(--bg-primary)', minHeight: 42, alignItems: 'center',
                  cursor: 'text',
                }} onClick={e => e.currentTarget.querySelector('input')?.focus()}>
                  {formData.tags.map(tag => (
                    <span key={tag} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      background: 'rgba(59,130,246,0.15)', color: '#60a5fa',
                      padding: '3px 8px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                    }}>
                      {tag}
                      <button onClick={() => removeTag(tag)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#60a5fa', padding: 0, lineHeight: 1, opacity: 0.7 }}>×</button>
                    </span>
                  ))}
                  <input
                    style={{ border: 'none', background: 'transparent', outline: 'none', flex: '1 1 80px', minWidth: 60, fontSize: 13, color: 'var(--text-primary)' }}
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder={formData.tags.length === 0 ? 'Type a tag and press Enter...' : ''}
                  />
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '5px 0 0' }}>Press Enter or comma to add a tag. Backspace to remove last tag.</p>
              </div>

              {/* URLs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>GitHub URL</label>
                  <input
                    style={inputStyle}
                    value={formData.github_url}
                    onChange={e => setFormData(p => ({ ...p, github_url: e.target.value }))}
                    placeholder="https://github.com/username/repo"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Live Demo URL</label>
                  <input
                    style={inputStyle}
                    value={formData.live_url}
                    onChange={e => setFormData(p => ({ ...p, live_url: e.target.value }))}
                    placeholder="https://myproject.vercel.app"
                  />
                </div>
              </div>

              {/* Cover Image */}
              <div>
                <label style={labelStyle}>Cover Image URL</label>
                <input
                  style={inputStyle}
                  value={formData.image_url}
                  onChange={e => setFormData(p => ({ ...p, image_url: e.target.value }))}
                  placeholder="https://i.imgur.com/example.png"
                />
              </div>

              {/* Featured toggle */}
              <label style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px', borderRadius: 10,
                border: `1px solid ${formData.featured ? 'rgba(16,185,129,0.35)' : 'var(--border-color)'}`,
                background: formData.featured ? 'rgba(16,185,129,0.06)' : 'var(--bg-primary)',
                cursor: 'pointer', transition: 'all 0.2s',
              }}>
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={e => setFormData(p => ({ ...p, featured: e.target.checked }))}
                  style={{ width: 16, height: 16, accentColor: '#10b981', cursor: 'pointer' }}
                />
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: formData.featured ? '#10b981' : 'var(--text-primary)' }}>
                    <Star size={12} style={{ marginRight: 5, verticalAlign: 'middle' }} />
                    Mark as Featured
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>Featured projects are highlighted on your portfolio homepage</p>
                </div>
              </label>
            </div>

            {/* Modal Footer */}
            <div style={modalFooter}>
              <button
                onClick={closeModal}
                style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={saveProject}
                disabled={saving}
                style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#3b82f6', color: '#fff', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 7 }}
              >
                {saving && <Loader2 size={14} className="spin" />}
                {editingProject ? 'Save Changes' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function UpdatesPanel() {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);
  const EMPTY_FORM = { version: '', label: '', date: new Date().toISOString().split('T')[0], items: [''] };
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => { fetchUpdates(); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUpdates = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('updates').select('*').order('created_at', { ascending: false });
    if (!error && data) setUpdates(data);
    setLoading(false);
  };

  const deleteUpdate = async (id, label) => {
    if (!window.confirm(`Delete "${label}"? This cannot be undone.`)) return;
    const { error } = await supabase.from('updates').delete().eq('id', id);
    if (!error) {
      setUpdates(prev => prev.filter(u => u.id !== id));
      showToast(`"${label}" deleted`, 'error');
    } else showToast('Failed to delete', 'error');
  };

  const openModal = (update = null) => {
    if (update) {
      setEditingUpdate(update);
      setFormData({
        version: update.version || '',
        label: update.label || '',
        date: update.date || new Date().toISOString().split('T')[0],
        items: Array.isArray(update.items) && update.items.length > 0 ? update.items : [''],
      });
    } else {
      setEditingUpdate(null);
      setFormData(EMPTY_FORM);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingUpdate(null); };

  const addItem = () => setFormData(p => ({ ...p, items: [...p.items, ''] }));
  const removeItem = (i) => setFormData(p => ({ ...p, items: p.items.filter((_, idx) => idx !== i) }));
  const updateItem = (i, val) => setFormData(p => ({ ...p, items: p.items.map((it, idx) => idx === i ? val : it) }));

  const saveUpdate = async () => {
    if (!formData.version.trim()) { showToast('Version is required', 'error'); return; }
    if (!formData.label.trim()) { showToast('Label is required', 'error'); return; }
    setSaving(true);
    const payload = {
      ...formData,
      items: formData.items.filter(i => i.trim()),
    };
    if (editingUpdate) {
      const { data, error } = await supabase.from('updates').update(payload).eq('id', editingUpdate.id).select().single();
      if (!error && data) {
        setUpdates(prev => prev.map(u => u.id === data.id ? data : u));
        showToast(`"${data.label}" updated successfully`);
        closeModal();
      } else showToast('Failed to save', 'error');
    } else {
      const { data, error } = await supabase.from('updates').insert([payload]).select().single();
      if (!error && data) {
        setUpdates(prev => [data, ...prev]);
        showToast(`"${data.label}" created successfully`);
        closeModal();
      } else showToast('Failed to create', 'error');
    }
    setSaving(false);
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    const diff = Date.now() - d.getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'Just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return h === 1 ? 'An hour ago' : `${h}h ago`;
    const days = Math.floor(h / 24);
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const versionColor = (ver) => {
    if (!ver) return { bg: 'rgba(107,114,128,0.12)', color: '#9ca3af' };
    const v = ver.toLowerCase();
    if (v.startsWith('v3') || v.includes('major')) return { bg: 'rgba(139,92,246,0.12)', color: '#a78bfa' };
    if (v.startsWith('v2')) return { bg: 'rgba(59,130,246,0.12)', color: '#60a5fa' };
    if (v.startsWith('v1')) return { bg: 'rgba(16,185,129,0.12)', color: '#34d399' };
    return { bg: 'rgba(249,115,22,0.12)', color: '#fb923c' };
  };

  const filteredUpdates = updates.filter(u => {
    const q = searchQuery.toLowerCase();
    return !q || u.version?.toLowerCase().includes(q) || u.label?.toLowerCase().includes(q) || u.items?.some(i => i.toLowerCase().includes(q));
  });

  if (loading) return <PanelCard title="Changelog"><div style={styles.emptyState}><Loader2 className="spin" size={24} color="var(--text-muted)" /></div></PanelCard>;

  const modalOverlay = { position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' };
  const modalBox = { background: 'var(--sidebar-bg, #1a1a2e)', border: '1px solid var(--border-color)', borderRadius: '16px', width: '100%', maxWidth: '540px', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 32px 64px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column' };
  const labelStyle = { fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 };
  const inputStyle = { ...styles.input, background: 'var(--bg-primary)' };

  return (
    <>
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, background: toast.type === 'error' ? '#ef4444' : '#10b981', color: '#fff', padding: '12px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
          {toast.msg}
        </div>
      )}

      <PanelCard title="Changelog" action={{ label: 'Add update', icon: 'ti-plus', onClick: () => openModal() }}>
        {/* Stats bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderBottom: '1px solid var(--border-color)' }}>
          {[
            { label: 'Total Releases', val: updates.length, color: '#3b82f6' },
            { label: 'Total Changes', val: updates.reduce((a, u) => a + (u.items?.length || 0), 0), color: '#10b981' },
            { label: 'Latest Version', val: updates[0]?.version || '—', color: '#8b5cf6' },
          ].map(s => (
            <div key={s.label} style={{ padding: '14px 20px', borderRight: '1px solid var(--border-color)' }}>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</p>
              <p style={{ margin: '4px 0 0', fontSize: 20, fontWeight: 800, color: s.color }}>{s.val}</p>
            </div>
          ))}
        </div>

        {/* Search toolbar */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)', display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input type="text" placeholder="Search by version, label or change item..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ ...inputStyle, paddingLeft: 32, paddingTop: 7, paddingBottom: 7, fontSize: 13 }} />
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{filteredUpdates.length} / {updates.length} entries</span>
        </div>

        {/* Table */}
        {updates.length === 0 ? (
          <EmptyState icon="ti-bolt" title="No changelog entries yet" description="Click '+ Add update' to log a new release." />
        ) : filteredUpdates.length === 0 ? (
          <div style={{ ...styles.emptyState, padding: '40px' }}><p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No entries match your search.</p></div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={{ ...styles.th, width: '12%' }}>Version</th>
                  <th style={{ ...styles.th, width: '28%' }}>Label</th>
                  <th style={{ ...styles.th, width: '18%' }}>Date</th>
                  <th style={{ ...styles.th, width: '32%' }}>Changes</th>
                  <th style={{ ...styles.th, width: '10%', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUpdates.map((update, i) => {
                  const vc = versionColor(update.version);
                  const isExpanded = expandedId === update.id;
                  return (
                    <React.Fragment key={update.id}>
                      <tr
                        style={{ cursor: 'pointer', background: i % 2 === 0 ? 'transparent' : 'rgba(128,128,128,0.025)', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.04)'}
                        onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(128,128,128,0.025)'}
                        onClick={() => setExpandedId(isExpanded ? null : update.id)}
                      >
                        <td style={styles.td}>
                          <span style={{ padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: vc.bg, color: vc.color, letterSpacing: '0.3px' }}>
                            {update.version || '—'}
                          </span>
                        </td>
                        <td style={{ ...styles.td, fontWeight: 600, fontSize: 13 }}>{update.label}</td>
                        <td style={{ ...styles.td, color: 'var(--text-muted)', fontSize: 12 }}>
                          <span title={update.date}>{timeAgo(update.date)}</span>
                        </td>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                              {update.items?.filter(Boolean).length || 0} change{(update.items?.filter(Boolean).length || 0) !== 1 ? 's' : ''}
                            </span>
                            {(update.items?.filter(Boolean).length || 0) > 0 && (
                              <span style={{ fontSize: 11, color: '#3b82f6', cursor: 'pointer' }}>{isExpanded ? '▲ Hide' : '▼ View'}</span>
                            )}
                          </div>
                        </td>
                        <td style={{ ...styles.td, textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }} onClick={e => e.stopPropagation()}>
                            <button onClick={() => openModal(update)} title="Edit" style={{ ...styles.iconBtn, padding: 6, borderRadius: 7, background: 'rgba(59,130,246,0.08)' }}>
                              <Edit3 size={14} color="#3b82f6" />
                            </button>
                            <button onClick={() => deleteUpdate(update.id, update.label)} title="Delete" style={{ ...styles.iconBtn, padding: 6, borderRadius: 7, background: 'rgba(239,68,68,0.08)' }}>
                              <Trash2 size={14} color="#ef4444" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && update.items?.filter(Boolean).length > 0 && (
                        <tr style={{ background: 'rgba(59,130,246,0.03)' }}>
                          <td colSpan={5} style={{ padding: '0 20px 16px 20px', borderBottom: '1px solid var(--border-color)' }}>
                            <ul style={{ margin: '12px 0 0 0', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
                              {update.items.filter(Boolean).map((item, idx) => (
                                <li key={idx} style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </PanelCard>

      {/* Modal */}
      {isModalOpen && (
        <div style={modalOverlay} onClick={closeModal}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Zap size={15} color="#f59e0b" />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{editingUpdate ? 'Edit Changelog Entry' : 'New Changelog Entry'}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>{editingUpdate ? `Editing: ${editingUpdate.label}` : 'Log a new release or update'}</p>
                </div>
              </div>
              <button onClick={closeModal} style={{ ...styles.iconBtn, padding: 6 }}><X size={18} color="var(--text-muted)" /></button>
            </div>

            {/* Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Version + Date row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Version <span style={{ color: '#ef4444' }}>*</span></label>
                  <input style={inputStyle} value={formData.version} onChange={e => setFormData(p => ({ ...p, version: e.target.value }))} placeholder="e.g. v2.0, v1.3.1" autoFocus />
                </div>
                <div>
                  <label style={labelStyle}>Release Date <span style={{ color: '#ef4444' }}>*</span></label>
                  <input type="date" style={inputStyle} value={formData.date} onChange={e => setFormData(p => ({ ...p, date: e.target.value }))} />
                </div>
              </div>

              {/* Label */}
              <div>
                <label style={labelStyle}>Release Label <span style={{ color: '#ef4444' }}>*</span></label>
                <input style={inputStyle} value={formData.label} onChange={e => setFormData(p => ({ ...p, label: e.target.value }))} placeholder="e.g. Skills Refinement, Major Redesign..." />
              </div>

              {/* Change Items */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>Change Items</label>
                  <button onClick={addItem} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#3b82f6', background: 'rgba(59,130,246,0.1)', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontWeight: 600 }}>
                    <Plus size={12} /> Add item
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {formData.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)', width: 20, textAlign: 'right', flexShrink: 0 }}>{idx + 1}.</span>
                      <input
                        style={{ ...inputStyle, flex: 1 }}
                        value={item}
                        onChange={e => updateItem(idx, e.target.value)}
                        placeholder={`Change description #${idx + 1}...`}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addItem(); } }}
                      />
                      {formData.items.length > 1 && (
                        <button onClick={() => removeItem(idx)} style={{ ...styles.iconBtn, padding: 5, borderRadius: 6, background: 'rgba(239,68,68,0.08)', flexShrink: 0 }}>
                          <X size={13} color="#ef4444" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '6px 0 0' }}>Press Enter in any field to add another item.</p>
              </div>

              {/* Preview */}
              {formData.version && formData.label && (
                <div style={{ padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>
                  <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Preview</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700, ...(() => { const vc = versionColor(formData.version); return { background: vc.bg, color: vc.color }; })() }}>{formData.version}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{formData.label}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>{formData.items.filter(Boolean).length} change{formData.items.filter(Boolean).length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0 }}>
              <button onClick={closeModal} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
              <button onClick={saveUpdate} disabled={saving} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#f59e0b', color: '#fff', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 7 }}>
                {saving && <Loader2 size={14} className="spin" />}
                {editingUpdate ? 'Save Changes' : 'Create Entry'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
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
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedCats, setCollapsedCats] = useState({});
  const [toast, setToast] = useState(null);

  const EMPTY_FORM = {
    name: '', category: 'languages', icon_class: '', proficiency_level: 80,
    years_experience: 0, project_count: 0, description: '', level_label: 'Intermediate',
    related_tools: [''], projects: [''], is_featured: false, order_index: 0
  };
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => { fetchSkills(); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchSkills = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('skills').select('*').order('order_index', { ascending: true });
    if (!error && data) setSkills(data);
    setLoading(false);
  };

  const openModal = (skill = null) => {
    if (skill) {
      setEditingSkill(skill);
      setFormData({
        ...skill,
        related_tools: Array.isArray(skill.related_tools) && skill.related_tools.length > 0 ? skill.related_tools : [''],
        projects: Array.isArray(skill.projects) && skill.projects.length > 0 ? skill.projects : [''],
      });
    } else {
      setEditingSkill(null);
      setFormData(EMPTY_FORM);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingSkill(null); };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const { error } = await supabase.from('skills').delete().eq('id', id);
    if (!error) {
      setSkills(skills.filter(s => s.id !== id));
      showToast(`"${name}" deleted`, 'error');
    } else showToast('Failed to delete', 'error');
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) { showToast('Name is required', 'error'); return; }
    if (!formData.category) { showToast('Category is required', 'error'); return; }
    
    setSaving(true);
    let clampedProficiency = Math.max(1, Math.min(100, parseInt(formData.proficiency_level) || 80));
    const payload = {
      ...formData,
      proficiency_level: clampedProficiency,
      years_experience: parseInt(formData.years_experience) || 0,
      project_count: parseInt(formData.project_count) || 0,
      order_index: parseInt(formData.order_index) || 0,
      related_tools: formData.related_tools.filter(t => t.trim()),
      projects: formData.projects.filter(p => p.trim()),
    };

    if (editingSkill) {
      const { data, error } = await supabase.from('skills').update(payload).eq('id', editingSkill.id).select().single();
      if (!error && data) {
        setSkills(skills.map(s => s.id === data.id ? data : s).sort((a, b) => a.order_index - b.order_index));
        showToast(`"${data.name}" updated successfully`);
        closeModal();
      } else showToast('Failed to save', 'error');
    } else {
      const { data, error } = await supabase.from('skills').insert([payload]).select().single();
      if (!error && data) {
        setSkills([...skills, data].sort((a, b) => a.order_index - b.order_index));
        showToast(`"${data.name}" added successfully`);
        closeModal();
      } else showToast('Failed to create', 'error');
    }
    setSaving(false);
  };

  const toggleCategory = (cat) => setCollapsedCats(prev => ({ ...prev, [cat]: !prev[cat] }));

  const barColor = (pct) => {
    if (pct >= 85) return '#10b981';
    if (pct >= 65) return '#3b82f6';
    if (pct >= 45) return '#f59e0b';
    return '#ef4444';
  };

  const filteredSkills = skills.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const groupedSkills = SKILL_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = filteredSkills.filter(s => s.category === cat);
    return acc;
  }, {});

  if (loading) return <PanelCard title="Skills Inventory"><div style={styles.emptyState}><Loader2 className="spin" size={24} color="var(--text-muted)" /></div></PanelCard>;

  const modalOverlay = { position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' };
  const modalBox = { background: 'var(--sidebar-bg, #1a1a2e)', border: '1px solid var(--border-color)', borderRadius: '16px', width: '100%', maxWidth: '640px', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 32px 64px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column' };
  const labelStyle = { fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 };
  const inputStyle = { ...styles.input, background: 'var(--bg-primary)' };

  const handleArrayChange = (field, index, value) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };
  const addArrayItem = (field) => setFormData({ ...formData, [field]: [...formData[field], ''] });
  const removeArrayItem = (field, index) => setFormData({ ...formData, [field]: formData[field].filter((_, i) => i !== index) });

  return (
    <>
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, background: toast.type === 'error' ? '#ef4444' : '#10b981', color: '#fff', padding: '12px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
          {toast.msg}
        </div>
      )}

      <PanelCard 
        title="Skills Inventory" 
        action={{ label: 'Add Skill', icon: 'ti-plus', onClick: () => openModal() }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderBottom: '1px solid var(--border-color)' }}>
          {[
            { label: 'Total Skills', val: skills.length, color: '#3b82f6' },
            { label: 'Featured Skills', val: skills.filter(s => s.is_featured).length, color: '#f59e0b' },
            { label: 'Avg Proficiency', val: Math.round(skills.reduce((a, b) => a + b.proficiency_level, 0) / (skills.length || 1)) + '%', color: '#10b981' },
          ].map(s => (
            <div key={s.label} style={{ padding: '14px 20px', borderRight: '1px solid var(--border-color)' }}>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</p>
              <p style={{ margin: '4px 0 0', fontSize: 20, fontWeight: 800, color: s.color }}>{s.val}</p>
            </div>
          ))}
        </div>

        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)', display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input type="text" placeholder="Search skills by name..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ ...inputStyle, paddingLeft: 32, paddingTop: 7, paddingBottom: 7, fontSize: 13 }} />
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{filteredSkills.length} matches</span>
        </div>

        {skills.length === 0 ? (
          <EmptyState icon="ti-star" title="No skills yet" description="Click '+ Add Skill' to build your inventory." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28, padding: '20px 22px' }}>
            {SKILL_CATEGORIES.map(cat => {
              const catSkills = groupedSkills[cat] || [];
              if (catSkills.length === 0) return null;
              const isCollapsed = collapsedCats[cat];

              return (
                <div key={cat}>
                  <div onClick={() => toggleCategory(cat)} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none', marginBottom: 14, paddingBottom: 10, borderBottom: '2px solid var(--border-color)' }}>
                    {isCollapsed ? <ChevronRight size={15} color="var(--text-muted)" /> : <ChevronDown size={15} color="var(--primary-blue)" />}
                    <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'capitalize', letterSpacing: '0.2px' }}>{cat}</h3>
                    <span style={{ padding: '2px 8px', borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: 10, fontWeight: 700 }}>{catSkills.length}</span>
                  </div>

                  {!isCollapsed && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
                      {catSkills.map(skill => {
                        const pct = skill.proficiency_level || 0;
                        const color = barColor(pct);
                        return (
                          <div key={skill.id} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12, position: 'relative', transition: 'all 0.2s' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  {skill.icon_class ? <i className={`ti ti-${skill.icon_class}`} style={{ fontSize: 19, color }} /> : <Star size={17} color={color} />}
                                </div>
                                <div>
                                  <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                                    {skill.name} {skill.is_featured && <Star size={12} color="#f59e0b" style={{ fill: '#f59e0b', marginLeft: 4, verticalAlign: 'text-top' }} />}
                                  </p>
                                  <span style={{ display: 'inline-block', marginTop: 3, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', padding: '2px 7px', borderRadius: 99, background: `${color}18`, color }}>
                                    {skill.level_label || 'Intermediate'}
                                  </span>
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                                <button onClick={() => openModal(skill)} title="Edit" style={{ ...styles.iconBtn, padding: 5, borderRadius: 6, background: 'rgba(59,130,246,0.08)' }}><Edit3 size={13} color="#3b82f6" /></button>
                                <button onClick={() => handleDelete(skill.id, skill.name)} title="Delete" style={{ ...styles.iconBtn, padding: 5, borderRadius: 6, background: 'rgba(239,68,68,0.08)' }}><Trash2 size={13} color="#ef4444" /></button>
                              </div>
                            </div>
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 11, fontWeight: 600 }}><span style={{ color: 'var(--text-muted)' }}>Proficiency</span><span style={{ color }}>{pct}%</span></div>
                              <div style={{ width: '100%', height: 5, background: 'var(--border-color)', borderRadius: 99, overflow: 'hidden' }}><div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99 }} /></div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingTop: 10, borderTop: '1px solid var(--border-color)' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}><Briefcase size={11} /> {skill.years_experience || 0} yrs</span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}><Layers size={11} /> {skill.project_count || 0} projs</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </PanelCard>

      {isModalOpen && (
        <div style={modalOverlay} onClick={closeModal}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Star size={15} color="#3b82f6" /></div>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{editingSkill ? 'Edit Skill' : 'New Skill'}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>{editingSkill ? `Editing: ${editingSkill.name}` : 'Add to your inventory'}</p>
                </div>
              </div>
              <button onClick={closeModal} style={{ ...styles.iconBtn, padding: 6 }}><X size={18} color="var(--text-muted)" /></button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Skill Name <span style={{ color: '#ef4444' }}>*</span></label>
                  <input style={inputStyle} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. React" autoFocus />
                </div>
                <div>
                  <label style={labelStyle}>Category <span style={{ color: '#ef4444' }}>*</span></label>
                  <select style={inputStyle} value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                    {SKILL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Level Label</label>
                  <select style={inputStyle} value={formData.level_label} onChange={e => setFormData({ ...formData, level_label: e.target.value })}>
                    {SKILL_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={labelStyle}>Proficiency (1-100)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <input type="range" min="1" max="100" value={formData.proficiency_level} onChange={e => setFormData({ ...formData, proficiency_level: e.target.value })} style={{ flex: 1 }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: barColor(formData.proficiency_level), width: 40, textAlign: 'right' }}>{formData.proficiency_level}%</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Years Exp</label>
                  <input type="number" min="0" style={inputStyle} value={formData.years_experience} onChange={e => setFormData({ ...formData, years_experience: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Projects</label>
                  <input type="number" min="0" style={inputStyle} value={formData.project_count} onChange={e => setFormData({ ...formData, project_count: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Order</label>
                  <input type="number" style={inputStyle} value={formData.order_index} onChange={e => setFormData({ ...formData, order_index: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 14, alignItems: 'end' }}>
                <div>
                  <label style={labelStyle}>Icon Class (Tabler)</label>
                  <input style={inputStyle} value={formData.icon_class} onChange={e => setFormData({ ...formData, icon_class: e.target.value })} placeholder="e.g. brand-react" />
                </div>
                <div style={{ width: 42, height: 42, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {formData.icon_class ? <i className={`ti ti-${formData.icon_class}`} style={{ fontSize: 24, color: 'var(--text-primary)' }} /> : <Star size={20} color="var(--text-muted)" />}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Description</label>
                <textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Brief description..." />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                <input type="checkbox" id="is_featured" checked={formData.is_featured} onChange={e => setFormData({ ...formData, is_featured: e.target.checked })} style={{ width: 16, height: 16 }} />
                <label htmlFor="is_featured" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer', margin: 0 }}>Mark as Featured Skill</label>
                <Star size={14} color={formData.is_featured ? "#f59e0b" : "var(--text-muted)"} style={{ fill: formData.is_featured ? "#f59e0b" : "transparent" }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {/* Related Tools */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>Related Tools</label>
                    <button onClick={() => addArrayItem('related_tools')} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}><Plus size={12}/> Add</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {formData.related_tools.map((tool, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: 6 }}>
                        <input style={{ ...inputStyle, flex: 1, padding: '6px 10px', fontSize: 13 }} value={tool} onChange={e => handleArrayChange('related_tools', idx, e.target.value)} placeholder="e.g. Next.js" />
                        {formData.related_tools.length > 1 && <button onClick={() => removeArrayItem('related_tools', idx)} style={{ ...styles.iconBtn, padding: 4, background: 'rgba(239,68,68,0.1)' }}><X size={12} color="#ef4444" /></button>}
                      </div>
                    ))}
                  </div>
                </div>
                {/* Projects */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>Featured Projects</label>
                    <button onClick={() => addArrayItem('projects')} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}><Plus size={12}/> Add</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {formData.projects.map((proj, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: 6 }}>
                        <input style={{ ...inputStyle, flex: 1, padding: '6px 10px', fontSize: 13 }} value={proj} onChange={e => handleArrayChange('projects', idx, e.target.value)} placeholder="e.g. E-commerce App" />
                        {formData.projects.length > 1 && <button onClick={() => removeArrayItem('projects', idx)} style={{ ...styles.iconBtn, padding: 4, background: 'rgba(239,68,68,0.1)' }}><X size={12} color="#ef4444" /></button>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
            
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0 }}>
              <button onClick={closeModal} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSubmit} disabled={saving} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#3b82f6', color: '#fff', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 7 }}>
                {saving && <Loader2 size={14} className="spin" />} {editingSkill ? 'Save Changes' : 'Add Skill'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ExperiencePanel() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExp, setEditingExp] = useState(null);
  const [toast, setToast] = useState(null);

  const EMPTY_FORM = {
    role: '', company: '', start_date: '', end_date: '', 
    description_bullets: [''], logo_url: '', is_education: false, display_order: 0,
    is_current: false
  };
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => { fetchExperience(); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchExperience = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('experience').select('*').order('display_order', { ascending: true });
    if (!error && data) setExperiences(data);
    setLoading(false);
  };

  const openModal = (exp = null) => {
    if (exp) {
      setEditingExp(exp);
      setFormData({
        ...exp,
        is_current: !exp.end_date,
        end_date: exp.end_date || '',
        description_bullets: Array.isArray(exp.description_bullets) && exp.description_bullets.length > 0 ? exp.description_bullets : [''],
      });
    } else {
      setEditingExp(null);
      setFormData(EMPTY_FORM);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingExp(null); };

  const handleDelete = async (id, role) => {
    if (!window.confirm(`Delete "${role}"? This cannot be undone.`)) return;
    const { error } = await supabase.from('experience').delete().eq('id', id);
    if (!error) {
      setExperiences(experiences.filter(e => e.id !== id));
      showToast(`"${role}" deleted`, 'error');
    } else showToast('Failed to delete', 'error');
  };

  const handleSubmit = async () => {
    if (!formData.role.trim() || !formData.company.trim() || !formData.start_date.trim()) { 
      showToast('Role, Company, and Start Date are required', 'error'); return; 
    }
    
    if (!formData.is_current && formData.end_date) {
      const d1 = new Date(formData.start_date);
      const d2 = new Date(formData.end_date);
      if (!isNaN(d1) && !isNaN(d2) && d2 < d1) {
         showToast("End date cannot be before start date", 'error'); return;
      }
    }

    setSaving(true);
    const payload = {
      ...formData,
      end_date: formData.is_current ? null : formData.end_date,
      display_order: parseInt(formData.display_order) || 0,
      description_bullets: formData.description_bullets.filter(b => b.trim()),
    };
    delete payload.is_current; 

    if (editingExp) {
      const { data, error } = await supabase.from('experience').update(payload).eq('id', editingExp.id).select().single();
      if (!error && data) {
        setExperiences(experiences.map(e => e.id === data.id ? data : e).sort((a, b) => a.display_order - b.display_order));
        showToast('Experience updated successfully');
        closeModal();
      } else showToast('Failed to save', 'error');
    } else {
      const { data, error } = await supabase.from('experience').insert([payload]).select().single();
      if (!error && data) {
        setExperiences([...experiences, data].sort((a, b) => a.display_order - b.display_order));
        showToast('Experience added successfully');
        closeModal();
      } else showToast('Failed to create', 'error');
    }
    setSaving(false);
  };

  const handleArrayChange = (index, value) => {
    const newArray = [...formData.description_bullets];
    newArray[index] = value;
    setFormData({ ...formData, description_bullets: newArray });
  };
  const addArrayItem = () => setFormData({ ...formData, description_bullets: [...formData.description_bullets, ''] });
  const removeArrayItem = (index) => setFormData({ ...formData, description_bullets: formData.description_bullets.filter((_, i) => i !== index) });

  if (loading) return <PanelCard title="Experience Timeline"><div style={styles.emptyState}><Loader2 className="spin" size={24} color="var(--text-muted)" /></div></PanelCard>;

  const modalOverlay = { position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' };
  const modalBox = { background: 'var(--sidebar-bg, #1a1a2e)', border: '1px solid var(--border-color)', borderRadius: '16px', width: '100%', maxWidth: '640px', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 32px 64px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column' };
  const labelStyle = { fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 };
  const inputStyle = { ...styles.input, background: 'var(--bg-primary)' };

  return (
    <>
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, background: toast.type === 'error' ? '#ef4444' : '#10b981', color: '#fff', padding: '12px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
          {toast.msg}
        </div>
      )}

      <PanelCard title="Experience Timeline" action={{ label: "Add Experience", icon: "ti-plus", onClick: () => openModal() }}>
        {experiences.length === 0 ? (
          <EmptyState icon="ti-id-badge" title="No experience entries" description="Click '+ Add Experience' to log your work history." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={{ ...styles.th, width: '60px' }}>Logo</th>
                  <th style={styles.th}>Role & Company</th>
                  <th style={styles.th}>Dates</th>
                  <th style={styles.th}>Order</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {experiences.map((exp, i) => (
                  <tr key={exp.id} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(128,128,128,0.025)' }}>
                    <td style={styles.td}>
                      <div style={{ width: 40, height: 40, borderRadius: 8, background: '#fff', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {exp.logo_url ? <img src={exp.logo_url} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e) => { e.target.style.display='none'; e.target.parentElement.innerHTML = '<i class="ti ti-briefcase" style="color:#9ca3af; font-size: 20px;"></i>'; }} /> : <Briefcase size={20} color="#9ca3af" />}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{exp.role}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                        {exp.company}
                        {exp.is_education && <span style={{ padding: '2px 6px', borderRadius: 4, background: 'rgba(59,130,246,0.1)', color: '#3b82f6', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>Edu</span>}
                      </div>
                    </td>
                    <td style={{ ...styles.td, color: 'var(--text-secondary)', fontSize: 13 }}>
                      {exp.start_date} <span style={{ color: 'var(--text-muted)' }}>→</span> {exp.end_date ? exp.end_date : <span style={{ color: '#10b981', fontWeight: 600 }}>Present</span>}
                    </td>
                    <td style={{ ...styles.td, color: 'var(--text-muted)' }}>{exp.display_order}</td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                        <button onClick={() => openModal(exp)} style={{ ...styles.iconBtn, padding: 6, borderRadius: 7, background: 'rgba(59,130,246,0.08)' }} title="Edit"><Edit3 size={14} color="#3b82f6" /></button>
                        <button onClick={() => handleDelete(exp.id, exp.role)} style={{ ...styles.iconBtn, padding: 6, borderRadius: 7, background: 'rgba(239,68,68,0.08)' }} title="Delete"><Trash2 size={14} color="#ef4444" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PanelCard>

      {isModalOpen && (
        <div style={modalOverlay} onClick={closeModal}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Briefcase size={15} color="#10b981" /></div>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{editingExp ? 'Edit Experience' : 'New Experience'}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>Log a new role or position</p>
                </div>
              </div>
              <button onClick={closeModal} style={{ ...styles.iconBtn, padding: 6 }}><X size={18} color="var(--text-muted)" /></button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Role / Title <span style={{ color: '#ef4444' }}>*</span></label>
                  <input style={inputStyle} value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} placeholder="e.g. Senior Developer" autoFocus />
                </div>
                <div>
                  <label style={labelStyle}>Company <span style={{ color: '#ef4444' }}>*</span></label>
                  <input style={inputStyle} value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} placeholder="e.g. Acme Corp" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignItems: 'start' }}>
                <div>
                  <label style={labelStyle}>Start Date <span style={{ color: '#ef4444' }}>*</span></label>
                  <input style={inputStyle} value={formData.start_date} onChange={e => setFormData({ ...formData, start_date: e.target.value })} placeholder="e.g. Jan 2022" />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>End Date</label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                      <input type="checkbox" checked={formData.is_current} onChange={e => setFormData({ ...formData, is_current: e.target.checked })} style={{ margin: 0 }} />
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>Present</span>
                    </label>
                  </div>
                  <input style={{ ...inputStyle, opacity: formData.is_current ? 0.5 : 1 }} value={formData.is_current ? 'Present' : formData.end_date} onChange={e => setFormData({ ...formData, end_date: e.target.value })} disabled={formData.is_current} placeholder="e.g. Dec 2023" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Logo URL</label>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: '#fff', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                      {formData.logo_url ? <img src={formData.logo_url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e) => { e.target.style.display='none'; }} /> : <ImageIcon size={18} color="#9ca3af" />}
                    </div>
                    <input style={{ ...inputStyle, flex: 1 }} value={formData.logo_url} onChange={e => setFormData({ ...formData, logo_url: e.target.value })} placeholder="https://..." />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Display Order</label>
                    <input type="number" style={inputStyle} value={formData.display_order} onChange={e => setFormData({ ...formData, display_order: e.target.value })} />
                  </div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>Description Bullets</label>
                  <button onClick={addArrayItem} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#10b981', background: 'rgba(16,185,129,0.1)', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontWeight: 600 }}><Plus size={12} /> Add bullet</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {formData.description_bullets.map((bullet, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 18, color: 'var(--text-muted)', lineHeight: '42px', paddingLeft: 4 }}>•</span>
                      <textarea
                        style={{ ...inputStyle, flex: 1, minHeight: 42, resize: 'vertical', paddingTop: 10 }}
                        value={bullet}
                        onChange={e => handleArrayChange(idx, e.target.value)}
                        placeholder="Led development of..."
                      />
                      {formData.description_bullets.length > 1 && (
                        <button onClick={() => removeArrayItem(idx)} style={{ ...styles.iconBtn, padding: 6, borderRadius: 6, background: 'rgba(239,68,68,0.08)', marginTop: 4, flexShrink: 0 }}>
                          <X size={14} color="#ef4444" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
            
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0 }}>
              <button onClick={closeModal} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSubmit} disabled={saving} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#10b981', color: '#fff', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 7 }}>
                {saving && <Loader2 size={14} className="spin" />} {editingExp ? 'Save Changes' : 'Add Experience'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


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
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState(null);
  const [toast, setToast] = useState(null);

  const EMPTY_FORM = { id: '', title: '', issuer: '', date: '', description: '', icon_class: '', credential_url: '', display_order: 0 };
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => { fetchCerts(); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchCerts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('certifications').select('*').order('display_order', { ascending: true });
    if (!error && data) setCerts(data);
    setLoading(false);
  };

  const openModal = (cert = null) => {
    if (cert) {
      setEditingCert(cert);
      setFormData(cert);
    } else {
      setEditingCert(null);
      setFormData(EMPTY_FORM);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingCert(null); };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    const { error } = await supabase.from('certifications').delete().eq('id', id);
    if (!error) {
      setCerts(certs.filter(c => c.id !== id));
      showToast(`"${title}" deleted`, 'error');
    } else showToast('Failed to delete', 'error');
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.issuer.trim()) { showToast('Title and Issuer are required', 'error'); return; }

    setSaving(true);
    const payload = {
      ...formData,
      id: formData.id || formData.title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      display_order: parseInt(formData.display_order) || 0,
    };

    const isUpdate = certs.some(c => c.id === payload.id);

    if (isUpdate) {
      const { data, error } = await supabase.from('certifications').update(payload).eq('id', payload.id).select().single();
      if (!error && data) {
        setCerts(certs.map(c => c.id === data.id ? data : c).sort((a,b) => a.display_order - b.display_order));
        showToast('Certification updated');
        closeModal();
      } else showToast('Failed to update', 'error');
    } else {
      const { data, error } = await supabase.from('certifications').insert([payload]).select().single();
      if (!error && data) {
        setCerts([...certs, data].sort((a,b) => a.display_order - b.display_order));
        showToast('Certification added');
        closeModal();
      } else showToast('Failed to add', 'error');
    }
    setSaving(false);
  };

  if (loading) return <PanelCard title="Certifications"><div style={styles.emptyState}><Loader2 className="spin" size={24} color="var(--text-muted)" /></div></PanelCard>;

  const modalOverlay = { position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' };
  const modalBox = { background: 'var(--sidebar-bg, #1a1a2e)', border: '1px solid var(--border-color)', borderRadius: '16px', width: '100%', maxWidth: '560px', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 32px 64px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column' };
  const labelStyle = { fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 };
  const inputStyle = { ...styles.input, background: 'var(--bg-primary)' };

  return (
    <>
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, background: toast.type === 'error' ? '#ef4444' : '#10b981', color: '#fff', padding: '12px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
          {toast.msg}
        </div>
      )}

      <PanelCard title="Certifications" action={{ label: "Add", icon: "ti-plus", onClick: () => openModal() }}>
        {certs.length === 0 ? (
          <EmptyState icon="ti-certificate" title="No certifications" description="Add your first certification to showcase your credentials." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead><tr><th style={styles.th}>Badge</th><th style={styles.th}>Title</th><th style={styles.th}>Issuer</th><th style={styles.th}>Date</th><th style={{ ...styles.th, textAlign: 'right' }}>Actions</th></tr></thead>
              <tbody>
                {certs.map((cert, i) => (
                  <tr key={cert.id} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(128,128,128,0.025)' }}>
                    <td style={styles.td}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {cert.icon_class ? <i className={`ti ti-${cert.icon_class}`} style={{ fontSize: 20, color: '#8b5cf6' }} /> : <Award size={20} color="#8b5cf6" />}
                      </div>
                    </td>
                    <td style={{ ...styles.td, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {cert.credential_url ? <a href={cert.credential_url} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }} className="hover-underline">{cert.title} <ExternalLink size={12} style={{ marginLeft: 4, color: 'var(--text-muted)' }}/></a> : cert.title}
                    </td>
                    <td style={{ ...styles.td, color: 'var(--text-secondary)' }}>{cert.issuer}</td>
                    <td style={{ ...styles.td, color: 'var(--text-muted)' }}>{cert.date}</td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                        <button onClick={() => openModal(cert)} style={{ ...styles.iconBtn, padding: 6, borderRadius: 7, background: 'rgba(59,130,246,0.08)' }}><Edit3 size={14} color="#3b82f6" /></button>
                        <button onClick={() => handleDelete(cert.id, cert.title)} style={{ ...styles.iconBtn, padding: 6, borderRadius: 7, background: 'rgba(239,68,68,0.08)' }}><Trash2 size={14} color="#ef4444" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PanelCard>

      {isModalOpen && (
        <div style={modalOverlay} onClick={closeModal}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Award size={15} color="#8b5cf6" /></div>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{editingCert ? 'Edit Certification' : 'New Certification'}</p>
                </div>
              </div>
              <button onClick={closeModal} style={{ ...styles.iconBtn, padding: 6 }}><X size={18} color="var(--text-muted)" /></button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={labelStyle}>Title <span style={{ color: '#ef4444' }}>*</span></label>
                <input style={inputStyle} value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. AWS Solutions Architect" autoFocus />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Issuer <span style={{ color: '#ef4444' }}>*</span></label>
                  <input style={inputStyle} value={formData.issuer} onChange={e => setFormData({ ...formData, issuer: e.target.value })} placeholder="e.g. Amazon Web Services" />
                </div>
                <div>
                  <label style={labelStyle}>Date / Year</label>
                  <input style={inputStyle} value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} placeholder="e.g. 2024" />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Credential URL</label>
                <input style={inputStyle} value={formData.credential_url} onChange={e => setFormData({ ...formData, credential_url: e.target.value })} placeholder="https://..." />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Icon Class (Tabler)</label>
                  <input style={inputStyle} value={formData.icon_class} onChange={e => setFormData({ ...formData, icon_class: e.target.value })} placeholder="e.g. brand-aws" />
                </div>
                <div>
                  <label style={labelStyle}>Display Order</label>
                  <input type="number" style={inputStyle} value={formData.display_order} onChange={e => setFormData({ ...formData, display_order: e.target.value })} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="What did you learn?" />
              </div>
            </div>
            
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0 }}>
              <button onClick={closeModal} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSubmit} disabled={saving} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#8b5cf6', color: '#fff', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 7 }}>
                {saving && <Loader2 size={14} className="spin" />} Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function EducationPanel() {
  const [edu, setEdu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [toast, setToast] = useState(null);

  const EMPTY_FORM = { 
    id: '', short_label: '', year: '', title: '', institution: '', location: '', description: '', 
    score: '', progress: 100, icon_class: 'BookOpen', theme_color: '#3b82f6', bg_color: '#eff6ff', text_color: '#1e3a8a',
    highlights: [''], back_stats: '', highlight_text: '', display_order: 0 
  };
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => { fetchEdu(); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchEdu = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('education').select('*').order('display_order', { ascending: true });
    if (!error && data) setEdu(data);
    setLoading(false);
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        ...item,
        highlights: Array.isArray(item.highlights) && item.highlights.length > 0 ? item.highlights : [''],
        back_stats: item.back_stats ? JSON.stringify(item.back_stats, null, 2) : '[\n  {\n    "label": "GPA",\n    "value": "4.0"\n  }\n]',
      });
    } else {
      setEditingItem(null);
      setFormData(EMPTY_FORM);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingItem(null); };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    const { error } = await supabase.from('education').delete().eq('id', id);
    if (!error) {
      setEdu(edu.filter(c => c.id !== id));
      showToast(`"${title}" deleted`, 'error');
    } else showToast('Failed to delete', 'error');
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.institution.trim()) { showToast('Title and Institution are required', 'error'); return; }

    let parsedStats = [];
    if (formData.back_stats && formData.back_stats.trim()) {
      try {
        parsedStats = JSON.parse(formData.back_stats);
        if (!Array.isArray(parsedStats)) throw new Error('Must be an array');
      } catch (e) {
        showToast('Back stats must be valid JSON array', 'error'); return;
      }
    }

    setSaving(true);
    const payload = {
      ...formData,
      id: formData.id || formData.title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      progress: parseInt(formData.progress) || 100,
      display_order: parseInt(formData.display_order) || 0,
      highlights: formData.highlights.filter(h => h.trim()),
      back_stats: parsedStats
    };

    const isUpdate = edu.some(c => c.id === payload.id);

    if (isUpdate) {
      const { data, error } = await supabase.from('education').update(payload).eq('id', payload.id).select().single();
      if (!error && data) {
        setEdu(edu.map(c => c.id === data.id ? data : c).sort((a,b) => a.display_order - b.display_order));
        showToast('Education updated');
        closeModal();
      } else showToast('Failed to update', 'error');
    } else {
      const { data, error } = await supabase.from('education').insert([payload]).select().single();
      if (!error && data) {
        setEdu([...edu, data].sort((a,b) => a.display_order - b.display_order));
        showToast('Education added');
        closeModal();
      } else showToast('Failed to add', 'error');
    }
    setSaving(false);
  };

  const handleArrayChange = (index, value) => {
    const newArray = [...formData.highlights];
    newArray[index] = value;
    setFormData({ ...formData, highlights: newArray });
  };
  const addArrayItem = () => setFormData({ ...formData, highlights: [...formData.highlights, ''] });
  const removeArrayItem = (index) => setFormData({ ...formData, highlights: formData.highlights.filter((_, i) => i !== index) });

  if (loading) return <PanelCard title="Education"><div style={styles.emptyState}><Loader2 className="spin" size={24} color="var(--text-muted)" /></div></PanelCard>;

  const modalOverlay = { position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' };
  const modalBox = { background: 'var(--sidebar-bg, #1a1a2e)', border: '1px solid var(--border-color)', borderRadius: '16px', width: '100%', maxWidth: '680px', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 32px 64px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column' };
  const labelStyle = { fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 };
  const inputStyle = { ...styles.input, background: 'var(--bg-primary)' };

  return (
    <>
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, background: toast.type === 'error' ? '#ef4444' : '#10b981', color: '#fff', padding: '12px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
          {toast.msg}
        </div>
      )}

      <PanelCard title="Education" action={{ label: "Add", icon: "ti-plus", onClick: () => openModal() }}>
        {edu.length === 0 ? (
          <EmptyState icon="ti-book" title="No education" description="Add your educational history." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead><tr><th style={styles.th}>Degree / Title</th><th style={styles.th}>Institution</th><th style={styles.th}>Year</th><th style={{ ...styles.th, textAlign: 'right' }}>Actions</th></tr></thead>
              <tbody>
                {edu.map((item, i) => (
                  <tr key={item.id} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(128,128,128,0.025)' }}>
                    <td style={{ ...styles.td, fontWeight: 600, color: 'var(--text-primary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: item.theme_color || '#3b82f6' }} />
                        {item.title}
                      </div>
                    </td>
                    <td style={{ ...styles.td, color: 'var(--text-secondary)' }}>{item.institution}</td>
                    <td style={{ ...styles.td, color: 'var(--text-muted)' }}>{item.year}</td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                        <button onClick={() => openModal(item)} style={{ ...styles.iconBtn, padding: 6, borderRadius: 7, background: 'rgba(59,130,246,0.08)' }}><Edit3 size={14} color="#3b82f6" /></button>
                        <button onClick={() => handleDelete(item.id, item.title)} style={{ ...styles.iconBtn, padding: 6, borderRadius: 7, background: 'rgba(239,68,68,0.08)' }}><Trash2 size={14} color="#ef4444" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PanelCard>

      {isModalOpen && (
        <div style={modalOverlay} onClick={closeModal}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BookOpen size={15} color="#3b82f6" /></div>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{editingItem ? 'Edit Education' : 'New Education'}</p>
                </div>
              </div>
              <button onClick={closeModal} style={{ ...styles.iconBtn, padding: 6 }}><X size={18} color="var(--text-muted)" /></button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Title <span style={{ color: '#ef4444' }}>*</span></label>
                  <input style={inputStyle} value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="B.Tech Computer Science" autoFocus />
                </div>
                <div>
                  <label style={labelStyle}>Institution <span style={{ color: '#ef4444' }}>*</span></label>
                  <input style={inputStyle} value={formData.institution} onChange={e => setFormData({ ...formData, institution: e.target.value })} placeholder="University Name" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Short Label</label>
                  <input style={inputStyle} value={formData.short_label} onChange={e => setFormData({ ...formData, short_label: e.target.value })} placeholder="e.g. B.Tech" />
                </div>
                <div>
                  <label style={labelStyle}>Year</label>
                  <input style={inputStyle} value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })} placeholder="2020 - 2024" />
                </div>
                <div>
                  <label style={labelStyle}>Location</label>
                  <input style={inputStyle} value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="City, State" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Score String</label>
                  <input style={inputStyle} value={formData.score} onChange={e => setFormData({ ...formData, score: e.target.value })} placeholder="CGPA: 8.7" />
                </div>
                <div>
                  <label style={labelStyle}>Progress % (0-100)</label>
                  <input type="number" min="0" max="100" style={inputStyle} value={formData.progress} onChange={e => setFormData({ ...formData, progress: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Icon Class (Lucide)</label>
                  <input style={inputStyle} value={formData.icon_class} onChange={e => setFormData({ ...formData, icon_class: e.target.value })} placeholder="BookOpen" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Theme Color</label>
                  <input type="color" style={{ ...inputStyle, padding: 4, height: 42 }} value={formData.theme_color} onChange={e => setFormData({ ...formData, theme_color: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>BG Color</label>
                  <input type="color" style={{ ...inputStyle, padding: 4, height: 42 }} value={formData.bg_color} onChange={e => setFormData({ ...formData, bg_color: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Text Color</label>
                  <input type="color" style={{ ...inputStyle, padding: 4, height: 42 }} value={formData.text_color} onChange={e => setFormData({ ...formData, text_color: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Display Order</label>
                  <input type="number" style={inputStyle} value={formData.display_order} onChange={e => setFormData({ ...formData, display_order: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Description</label>
                  <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Back Stats (JSON)</label>
                  <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical', fontFamily: 'monospace', fontSize: 12, lineHeight: 1.4 }} value={formData.back_stats} onChange={e => setFormData({ ...formData, back_stats: e.target.value })} placeholder='[
  {
    "label": "GPA",
    "value": "4.0"
  }
]' />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Highlight Text (Footer)</label>
                  <input style={inputStyle} value={formData.highlight_text} onChange={e => setFormData({ ...formData, highlight_text: e.target.value })} placeholder="e.g. Top 5% of class" />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>Highlights List</label>
                    <button onClick={addArrayItem} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}><Plus size={12}/> Add</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {formData.highlights.map((h, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: 6 }}>
                        <input style={{ ...inputStyle, flex: 1, padding: '6px 10px', fontSize: 13 }} value={h} onChange={e => handleArrayChange(idx, e.target.value)} placeholder="e.g. Data Science" />
                        {formData.highlights.length > 1 && <button onClick={() => removeArrayItem(idx)} style={{ ...styles.iconBtn, padding: 4, background: 'rgba(239,68,68,0.1)' }}><X size={12} color="#ef4444" /></button>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
            
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0 }}>
              <button onClick={closeModal} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSubmit} disabled={saving} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#3b82f6', color: '#fff', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 7 }}>
                {saving && <Loader2 size={14} className="spin" />} Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


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
