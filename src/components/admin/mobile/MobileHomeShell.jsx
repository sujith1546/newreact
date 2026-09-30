import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase, MessageSquare, Zap, Star,
  ArrowRight, ChevronRight, Users, Activity, Eye, RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDashboardStats } from '../shared/useDashboardStats';
import { supabase } from '../../../lib/supabaseClient';
import haptic from '../../../lib/haptics';

// ── Executive Stat Card Component ──
function StatCard({ icon: Icon, label, value, sub, route, delay }) {
  const navigate = useNavigate();
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      whileTap={{ scale: 0.96 }}
      onClick={() => { haptic.light(); if (route) navigate(route); }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 12,
        padding: '13px 13px 11px',
        borderRadius: 16,
        background: 'var(--bg-secondary, #18191d)',
        border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        boxSizing: 'border-box',
        position: 'relative',
        transition: 'border-color 0.15s ease',
      }}
    >
      {/* Top Row: Icon & Chevron */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <div style={{
          width: 30,
          height: 30,
          borderRadius: 9,
          background: 'var(--primary-blue-subtle, rgba(59, 130, 246, 0.12))',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--primary-blue, #3b82f6)',
          flexShrink: 0,
        }}>
          <Icon size={15} />
        </div>
        <ChevronRight size={13} style={{ color: 'var(--text-muted, #64748b)', opacity: 0.6 }} />
      </div>

      {/* Value & Label */}
      <div>
        <div style={{
          fontSize: 22,
          fontWeight: 700,
          color: 'var(--text-primary, #ffffff)',
          lineHeight: 1.1,
          letterSpacing: '-0.03em',
        }}>
          {value}
        </div>
        <div style={{
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--text-muted, #94a3b8)',
          marginTop: 3,
        }}>
          {label}
        </div>
        {sub && (
          <div style={{
            fontSize: 9.5,
            color: 'var(--text-secondary, #cbd5e1)',
            fontWeight: 500,
            marginTop: 4,
          }}>
            {sub}
          </div>
        )}
      </div>
    </motion.button>
  );
}

// ── Activity Feed Item ──
function ActivityItem({ icon, label, time, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.2 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 0',
        borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.06))',
      }}
    >
      <div style={{
        width: 28,
        height: 28,
        borderRadius: 8,
        background: 'var(--bg-primary, rgba(255,255,255,0.04))',
        border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        color: 'var(--primary-blue, #3b82f6)',
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--text-primary, #ffffff)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {label}
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted, #64748b)', marginTop: 1 }}>{time}</div>
      </div>
    </motion.div>
  );
}

// ── Main MobileHomeShell Component ──
export default function MobileHomeShell() {
  const navigate = useNavigate();
  const stats = useDashboardStats();
  const [recentMessages, setRecentMessages] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(true);

  const fetchFeedData = useCallback(async () => {
    setLoadingFeed(true);
    try {
      const [msgs, projs] = await Promise.all([
        supabase
          .from('contact_messages')
          .select('id, name, email, message, created_at')
          .order('created_at', { ascending: false })
          .limit(3),
        supabase
          .from('projects')
          .select('id, title, created_at')
          .order('created_at', { ascending: false })
          .limit(2),
      ]);
      setRecentMessages(msgs.data || []);
      setRecentProjects(projs.data || []);
    } catch (_) {}
    setLoadingFeed(false);
  }, []);

  useEffect(() => {
    fetchFeedData();
    window.addEventListener('pcms_force_refresh', fetchFeedData);
    window.addEventListener('pcms_data_updated', fetchFeedData);
    return () => {
      window.removeEventListener('pcms_force_refresh', fetchFeedData);
      window.removeEventListener('pcms_data_updated', fetchFeedData);
    };
  }, [fetchFeedData]);

  // Build activity feed from recent data
  const activityFeed = [
    ...recentMessages.map((m) => ({
      key: `msg-${m.id}`,
      icon: <MessageSquare size={13} />,
      label: `Message from ${m.name || m.email || 'Visitor'}`,
      time: formatRelativeTime(m.created_at),
    })),
    ...recentProjects.map((p) => ({
      key: `proj-${p.id}`,
      icon: <Briefcase size={13} />,
      label: `Project: ${p.title}`,
      time: formatRelativeTime(p.created_at),
    })),
  ];

  const STAT_CARDS = [
    {
      icon: Briefcase,
      label: 'Projects',
      value: stats.loading ? '–' : stats.projectCount,
      sub: 'Showcased apps',
      route: '/admin/dashboard/projects',
    },
    {
      icon: MessageSquare,
      label: 'Unread',
      value: stats.loading ? '–' : stats.unreadMessages,
      sub: stats.unreadMessages > 0 ? 'Pending reply' : 'All caught up',
      route: '/admin/dashboard/messages',
    },
    {
      icon: Zap,
      label: 'Updates',
      value: stats.loading ? '–' : stats.updateCount,
      sub: 'Published posts',
      route: '/admin/dashboard/updates',
    },
    {
      icon: Star,
      label: 'Skills',
      value: stats.loading ? '–' : stats.skillCount,
      sub: 'Core tech stack',
      route: '/admin/dashboard/skills',
    },
  ];

  const QUICK_LAUNCH = [
    { label: 'Projects', icon: Briefcase, route: '/admin/dashboard/projects' },
    { label: 'Messages', icon: MessageSquare, route: '/admin/dashboard/messages' },
    { label: 'Updates', icon: Zap, route: '/admin/dashboard/updates' },
    { label: 'Skills', icon: Star, route: '/admin/dashboard/skills' },
    { label: 'Preview', icon: Eye, route: '/admin/dashboard/preview' },
    { label: 'Sessions', icon: Users, route: '/admin/dashboard/home' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, width: '100%', boxSizing: 'border-box' }}>

      {/* ── STAT CARD GRID ── */}
      <section>
        <SectionHeader icon={<Activity size={12} style={{ color: 'var(--primary-blue, #3b82f6)' }} />} title="Overview" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
          {STAT_CARDS.map((card, i) => (
            <StatCard key={card.label} {...card} delay={i * 0.03} />
          ))}
        </div>
      </section>

      {/* ── QUICK LAUNCH GRID ── */}
      <section>
        <SectionHeader icon={<Zap size={12} style={{ color: 'var(--primary-blue, #3b82f6)' }} />} title="Quick Launch" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {QUICK_LAUNCH.map((item, i) => (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.08 + i * 0.02, duration: 0.2 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => { haptic.light(); navigate(item.route); }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                padding: '11px 6px',
                borderRadius: 14,
                background: 'var(--bg-secondary, #18191d)',
                border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                boxSizing: 'border-box',
              }}
            >
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                background: 'var(--bg-primary, rgba(255,255,255,0.04))',
                border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary-blue, #3b82f6)',
              }}>
                <item.icon size={15} />
              </div>
              <span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* ── RECENT ACTIVITY FEED ── */}
      <section>
        <SectionHeader
          icon={<Activity size={12} style={{ color: 'var(--primary-blue, #3b82f6)' }} />}
          title="Recent Activity"
          action={
            <button
              type="button"
              onClick={() => { haptic.light(); navigate('/admin/dashboard/messages'); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 3,
                background: 'transparent', border: 'none',
                fontSize: 10.5, fontWeight: 600, color: 'var(--primary-blue, #3b82f6)', cursor: 'pointer',
              }}
            >
              View all <ArrowRight size={10} />
            </button>
          }
        />
        <div style={{
          padding: '8px 14px',
          borderRadius: 16,
          background: 'var(--bg-secondary, #18191d)',
          border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
          boxSizing: 'border-box',
        }}>
          {loadingFeed ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
              <RefreshCw size={15} color="var(--text-muted)" className="spinning" />
            </div>
          ) : activityFeed.length === 0 ? (
            <EmptyFeedState />
          ) : (
            activityFeed.map(({ key, ...itemProps }, i) => (
              <ActivityItem key={key} {...itemProps} delay={i * 0.04} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}

// ── Helpers ──
function SectionHeader({ icon, title, action }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
      padding: '0 2px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        {icon}
        <span style={{
          fontSize: 10.5,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--text-muted, #94a3b8)',
        }}>
          {title}
        </span>
      </div>
      {action}
    </div>
  );
}

function EmptyFeedState() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0 10px', gap: 4 }}>
      <div style={{ fontSize: 24 }}>📭</div>
      <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)' }}>No recent activity</span>
      <span style={{ fontSize: 10, color: 'var(--text-muted)', opacity: 0.8 }}>Events synchronize in real time</span>
    </div>
  );
}

function formatRelativeTime(isoString) {
  if (!isoString) return 'Recently';
  const seconds = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
