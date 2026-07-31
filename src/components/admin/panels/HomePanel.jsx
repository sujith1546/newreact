import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabaseClient';
import { useDashboardStats } from '../shared/useDashboardStats';
import { useAuth } from '../../../context/AuthContext';
import { motion } from 'framer-motion';
import {
  MessageSquare, Briefcase, FileText, Zap, Brain, Star,
  Award, ArrowRight, TrendingUp, Globe, Shield, Activity,
  Plus, ChevronRight, Loader2
} from 'lucide-react';

/* ── Animated counter hook ── */
function useCounter(end, duration = 1200, loading = false) {
  const [value, setValue] = useState(0);
  const startRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (loading || end === 0) { setValue(end); return; }
    startRef.current = performance.now();
    const step = (now) => {
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * end));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [end, loading, duration]);

  return value;
}

/* ── Stat Card ── */
function StatCard({ label, value, icon: Icon, gradient, delta, loading, onClick }) {
  const animated = useCounter(value, 1000, loading);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="pcms-stat-card"
      style={{ '--card-gradient': gradient, cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
    >
      <div className="pcms-stat-top">
        <p className="pcms-stat-label">{label}</p>
        <div
          className="pcms-stat-icon"
          style={{
            background: gradient.replace('linear-gradient(135deg,', 'linear-gradient(135deg,').replace('100%)', '100%)').replace('0%', '0%'),
            backgroundImage: gradient,
            opacity: 0.85
          }}
        >
          <Icon size={17} color="#fff" strokeWidth={2} />
        </div>
      </div>
      <p className="pcms-stat-value">
        {loading ? <Loader2 size={22} className="spin" style={{ color: 'var(--pcms-accent)' }} /> : animated}
      </p>
      {delta && <p className="pcms-stat-delta">{delta}</p>}
    </motion.div>
  );
}

/* ── Quick Action Card ── */
function QuickAction({ icon: Icon, label, sub, color, onClick }) {
  return (
    <motion.div
      whileHover={{ x: 4 }}
      transition={{ duration: 0.15 }}
      className="pcms-quick-action"
      onClick={onClick}
    >
      <div className="pcms-quick-action-icon" style={{ background: `${color}22`, color }}>
        <Icon size={16} strokeWidth={2} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="pcms-quick-action-label">{label}</div>
        {sub && <div className="pcms-quick-action-sub">{sub}</div>}
      </div>
      <ChevronRight size={14} style={{ color: 'var(--pcms-muted-2)', flexShrink: 0 }} />
    </motion.div>
  );
}

/* ── Activity Item ── */
function ActivityItem({ text, time, color }) {
  return (
    <div className="pcms-activity-item">
      <div className="pcms-activity-dot" style={{ background: color }} />
      <div style={{ flex: 1 }}>
        <div className="pcms-activity-text">{text}</div>
        <div className="pcms-activity-time">{time}</div>
      </div>
    </div>
  );
}

/* ── Main HomePanel ── */
export default function HomePanel() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const stats = useDashboardStats();
  const [recentActivity, setRecentActivity] = useState([]);
  const [siteSettings, setSiteSettings] = useState(null);
  const [activityLoading, setActivityLoading] = useState(true);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.email?.split('@')[0]?.split('.')?.[0] || 'Admin';

  /* Load recent audit activity */
  useEffect(() => {
    async function loadActivity() {
      setActivityLoading(true);
      try {
        const { data } = await supabase
          .from('audit_log')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(6);
        if (data) setRecentActivity(data);
      } catch (_) {
        // audit_log might not exist
        setRecentActivity([]);
      }
      setActivityLoading(false);
    }

    async function loadSettings() {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('site_disabled, maintenance_mode, show_projects, show_blog')
          .eq('id', 1)
          .single();
        if (data) setSiteSettings(data);
      } catch (_) {}
    }

    loadActivity();
    loadSettings();
  }, []);

  const statCards = [
    {
      key: 'messages',
      label: 'Unread Messages',
      value: stats.unreadMessages,
      icon: MessageSquare,
      gradient: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
      delta: `${stats.totalMessages} total messages`,
      onClick: () => navigate('/admin/dashboard/messages'),
    },
    {
      key: 'projects',
      label: 'Projects',
      value: stats.projectCount,
      icon: Briefcase,
      gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      delta: 'Live on portfolio',
      onClick: () => navigate('/admin/dashboard/projects'),
    },
    {
      key: 'blog',
      label: 'Blog Posts',
      value: stats.blogCount,
      icon: FileText,
      gradient: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
      delta: 'Articles published',
      onClick: () => navigate('/admin/dashboard/blog'),
    },
    {
      key: 'updates',
      label: 'Updates',
      value: stats.updateCount,
      icon: Zap,
      gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      delta: 'Site updates',
      onClick: () => navigate('/admin/dashboard/updates'),
    },
    {
      key: 'ai',
      label: 'AI Sessions',
      value: stats.sessionCount,
      icon: Brain,
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
      delta: 'Visitor AI chats',
      onClick: () => navigate('/admin/dashboard/chats'),
    },
    {
      key: 'skills',
      label: 'Skills',
      value: stats.skillCount,
      icon: Star,
      gradient: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
      delta: `${stats.certCount} certifications`,
      onClick: () => navigate('/admin/dashboard/skills'),
    },
  ];

  const quickActions = [
    { icon: Plus, label: 'Add New Project', sub: 'Showcase your latest work', color: '#10B981', tab: 'projects' },
    { icon: FileText, label: 'Write a Blog Post', sub: 'Share your knowledge', color: '#06B6D4', tab: 'blog' },
    { icon: MessageSquare, label: 'View Messages', sub: `${stats.unreadMessages} unread`, color: '#6366F1', tab: 'messages' },
    { icon: Zap, label: 'Post an Update', sub: 'Announce something new', color: '#F59E0B', tab: 'updates' },
    { icon: Award, label: 'Add Certification', sub: 'Update credentials', color: '#F97316', tab: 'certifications' },
    { icon: Shield, label: 'Site Settings', sub: 'Configure & maintain', color: '#8B5CF6', tab: 'settings' },
  ];

  function fmtActivityAction(action) {
    const map = {
      CREATE_PROJECT: { text: 'New project added', color: '#10B981' },
      UPDATE_PROJECT: { text: 'Project updated', color: '#6366F1' },
      DELETE_PROJECT: { text: 'Project deleted', color: '#EF4444' },
      CREATE_BLOG_POST: { text: 'New blog post published', color: '#06B6D4' },
      UPDATE_BLOG_POST: { text: 'Blog post updated', color: '#6366F1' },
      UPDATE_SETTINGS: { text: 'Site settings changed', color: '#8B5CF6' },
      TOGGLE_BLOG_PUBLISH: { text: 'Blog post toggled', color: '#F59E0B' },
      DELETE_BLOG_POST: { text: 'Blog post deleted', color: '#EF4444' },
    };
    return map[action] || { text: action?.replace(/_/g, ' ').toLowerCase(), color: '#8896B3' };
  }

  function timeAgo(ts) {
    if (!ts) return '';
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  return (
    <div>
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.06) 100%)',
          border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: 12,
          padding: '20px 24px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--pcms-accent)', marginBottom: 4 }}>
            PORTFOLIO CMS
          </div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--pcms-text)', fontFamily: "'Space Grotesk', sans-serif" }}>
            {greeting}, {firstName.charAt(0).toUpperCase() + firstName.slice(1)} 👋
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--pcms-muted)' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {siteSettings && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 8,
              background: siteSettings.site_disabled ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)',
              border: `1px solid ${siteSettings.site_disabled ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.25)'}`,
            }}>
              <div style={{
                width: 7, height: 7, borderRadius: '50%',
                background: siteSettings.site_disabled ? '#EF4444' : '#10B981',
                boxShadow: `0 0 6px ${siteSettings.site_disabled ? '#EF4444' : '#10B981'}`,
              }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: siteSettings.site_disabled ? '#EF4444' : '#10B981' }}>
                {siteSettings.site_disabled ? 'Site Locked' : 'Site Live'}
              </span>
            </div>
          )}
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 8,
              background: 'var(--pcms-panel)',
              border: '1px solid var(--pcms-line)',
              fontSize: 12, fontWeight: 500, color: 'var(--pcms-muted)',
              textDecoration: 'none',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--pcms-accent)'; e.currentTarget.style.color = 'var(--pcms-text)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--pcms-line)'; e.currentTarget.style.color = 'var(--pcms-muted)'; }}
          >
            <Globe size={13} />
            View Portfolio
          </a>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="pcms-stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: 24 }}>
        {statCards.map((card, i) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.06 }}
          >
            <StatCard {...card} loading={stats.loading} />
          </motion.div>
        ))}
      </div>

      {/* Bottom Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.3 }}
          className="pcms-panel-card"
          style={{ gridColumn: '1 / 2' }}
        >
          <div className="pcms-panel-header">
            <div className="pcms-panel-title-row">
              <div className="pcms-panel-icon"><TrendingUp size={15} /></div>
              <div>
                <div className="pcms-panel-title">Quick Actions</div>
                <div className="pcms-panel-subtitle">Jump to common tasks</div>
              </div>
            </div>
          </div>
          <div className="pcms-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {quickActions.map((qa) => (
              <QuickAction
                key={qa.tab}
                {...qa}
                onClick={() => navigate(`/admin/dashboard/${qa.tab}`)}
              />
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.35 }}
          className="pcms-panel-card"
          style={{ gridColumn: '2 / 3' }}
        >
          <div className="pcms-panel-header">
            <div className="pcms-panel-title-row">
              <div className="pcms-panel-icon" style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981' }}><Activity size={15} /></div>
              <div>
                <div className="pcms-panel-title">Recent Activity</div>
                <div className="pcms-panel-subtitle">Latest admin actions</div>
              </div>
            </div>
          </div>
          <div className="pcms-panel-body">
            {activityLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
                <Loader2 size={20} className="spin" style={{ color: 'var(--pcms-accent)' }} />
              </div>
            ) : recentActivity.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--pcms-muted)', fontSize: 12 }}>
                No activity yet. Start managing your content!
              </div>
            ) : (
              recentActivity.map((a, i) => {
                const info = fmtActivityAction(a.action);
                return (
                  <ActivityItem
                    key={i}
                    text={`${info.text}${a.resource_name ? `: ${a.resource_name}` : ''}`}
                    time={timeAgo(a.created_at)}
                    color={info.color}
                  />
                );
              })
            )}
          </div>
        </motion.div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.4 }}
          className="pcms-panel-card"
          style={{ gridColumn: '3 / 4' }}
        >
          <div className="pcms-panel-header">
            <div className="pcms-panel-title-row">
              <div className="pcms-panel-icon" style={{ background: 'rgba(139,92,246,0.12)', color: '#8B5CF6' }}><Shield size={15} /></div>
              <div>
                <div className="pcms-panel-title">System Status</div>
                <div className="pcms-panel-subtitle">Platform health overview</div>
              </div>
            </div>
          </div>
          <div className="pcms-panel-body">
            {[
              { label: 'Supabase DB', val: 'Connected', color: '#10B981' },
              { label: 'Realtime', val: 'Active', color: '#10B981' },
              { label: 'Site Status', val: siteSettings?.site_disabled ? 'Locked 🔒' : 'Live ✓', color: siteSettings?.site_disabled ? '#EF4444' : '#10B981' },
              { label: 'Maintenance', val: siteSettings?.maintenance_mode ? 'On' : 'Off', color: siteSettings?.maintenance_mode ? '#F59E0B' : '#8896B3' },
              { label: 'Projects Visible', val: siteSettings?.show_projects !== false ? 'Yes' : 'No', color: siteSettings?.show_projects !== false ? '#10B981' : '#EF4444' },
              { label: 'Blog Visible', val: siteSettings?.show_blog !== false ? 'Yes' : 'No', color: siteSettings?.show_blog !== false ? '#10B981' : '#EF4444' },
            ].map((row) => (
              <div key={row.label} className="pcms-status-row">
                <span className="pcms-status-label">{row.label}</span>
                <span className="pcms-status-val" style={{ color: row.color }}>{row.val}</span>
              </div>
            ))}
            <div style={{ marginTop: 16 }}>
              <button
                onClick={() => navigate('/admin/dashboard/settings')}
                className="pcms-btn-dark"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <Shield size={13} />
                Manage Settings
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
