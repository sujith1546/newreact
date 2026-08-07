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

/* ── Quick Action Button ── */
function QuickAction({ icon: Icon, label, color, onClick }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      whileHover={{ y: -1 }}
      transition={{ duration: 0.12 }}
      className="pcms-quick-action-btn"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: '10px 12px',
        borderRadius: 10,
        background: 'var(--pcms-panel-2)',
        border: '1px solid var(--pcms-line)',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        transition: 'all 0.15s ease',
      }}
    >
      <div style={{
        width: 30,
        height: 30,
        borderRadius: 8,
        background: `${color}18`,
        color: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={15} strokeWidth={2} />
      </div>
      <span style={{
        fontSize: 12,
        fontWeight: 600,
        color: 'var(--pcms-text)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        {label}
      </span>
    </motion.button>
  );
}

/* ── Activity Item ── */
function ActivityItem({ actionTitle, resourceName, time, color, icon: Icon = Activity }) {
  return (
    <motion.div
      whileHover={{ y: -1 }}
      transition={{ duration: 0.12 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '10px 12px',
        borderRadius: 10,
        background: 'var(--pcms-panel-2)',
        border: '1px solid var(--pcms-line-soft)',
        marginBottom: 6,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
        <div style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          background: `${color}18`,
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={15} strokeWidth={2} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--pcms-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {actionTitle}
          </div>
          {resourceName && (
            <div style={{ fontSize: 11, color: 'var(--pcms-muted)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {resourceName}
            </div>
          )}
        </div>
      </div>
      <span style={{
        fontSize: 10,
        fontWeight: 600,
        color: 'var(--pcms-muted)',
        background: 'var(--pcms-panel-3)',
        padding: '3px 8px',
        borderRadius: 6,
        flexShrink: 0,
        whiteSpace: 'nowrap',
      }}>
        {time}
      </span>
    </motion.div>
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
        const { data, error } = await supabase
          .from('admin_audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(6);
        if (data && !error) setRecentActivity(data);
      } catch (_) {
        setRecentActivity([]);
      }
      setActivityLoading(false);
    }

    async function loadSettings() {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('site_disabled, maintenance_enabled, feature_experience, feature_blog')
          .eq('id', 1)
          .single();
        if (data && !error) setSiteSettings(data);
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
    { icon: MessageSquare, label: 'View Messages', sub: `${stats.unreadMessages} unread`, color: '#6366F1', tab: 'messages' },
    { icon: Zap, label: 'Post an Update', sub: 'Announce something new', color: '#F59E0B', tab: 'updates' },
    { icon: Award, label: 'Add Certification', sub: 'Update credentials', color: '#F97316', tab: 'certifications' },
    { icon: Shield, label: 'Site Settings', sub: 'Configure & maintain', color: '#8B5CF6', tab: 'settings' },
    { icon: Shield, label: 'Admin Login', sub: 'Switch account or re-auth', color: '#EC4899', route: '/admin/login' },
  ];

  function fmtActivityAction(action) {
    const map = {
      CREATE_PROJECT: { text: 'New project added', color: '#10B981', icon: Briefcase },
      UPDATE_PROJECT: { text: 'Project updated', color: '#6366F1', icon: Briefcase },
      DELETE_PROJECT: { text: 'Project deleted', color: '#EF4444', icon: Activity },
      UPDATE_SETTINGS: { text: 'Site settings changed', color: '#8B5CF6', icon: Shield },
      CREATE_UPDATE: { text: 'Update feed posted', color: '#F59E0B', icon: Zap },
      CREATE_SKILL: { text: 'Skill added', color: '#EC4899', icon: Star },
      PURGE_MESSAGES: { text: 'Messages purged', color: '#EF4444', icon: MessageSquare },
    };
    return map[action] || { text: action?.replace(/_/g, ' ').toLowerCase(), color: '#3B82F6', icon: Activity };
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
        className="pcms-welcome-header"
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
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
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
      <div className="pcms-stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', marginBottom: 24 }}>
        {statCards.map((card, i) => {
          const { key, ...cardProps } = card;
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
            >
              <StatCard {...cardProps} loading={stats.loading} />
            </motion.div>
          );
        })}
      </div>

      {/* Bottom Grid */}
      <div className="pcms-home-bottom-grid">

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.3 }}
          className="pcms-panel-card"
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
          <div className="pcms-panel-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: 8 }}>
            {quickActions.map((qa) => (
              <QuickAction
                key={qa.label}
                {...qa}
                onClick={() => navigate(qa.route || `/admin/dashboard/${qa.tab}`)}
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
                    actionTitle={info.text}
                    resourceName={a.resource_name || a.entity_type}
                    time={timeAgo(a.created_at)}
                    color={info.color}
                    icon={info.icon}
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
              { label: 'Maintenance', val: siteSettings?.maintenance_enabled ? 'On' : 'Off', color: siteSettings?.maintenance_enabled ? '#F59E0B' : '#8896B3' },
              { label: 'Projects Visible', val: siteSettings?.feature_experience !== false ? 'Yes' : 'No', color: siteSettings?.feature_experience !== false ? '#10B981' : '#EF4444' },
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
