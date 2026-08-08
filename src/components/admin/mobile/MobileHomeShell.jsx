import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, MessageSquare, Zap, Star, TrendingUp, Clock,
  ArrowRight, ChevronRight, Users, Activity, Eye, Plus, RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDashboardStats } from '../shared/useDashboardStats';
import { supabase } from '../../../lib/supabaseClient';
import haptic from '../../../lib/haptics';

// -- Stat Card Component --
function StatCard({ icon: Icon, label, value, sub, color, route, delay }) {
  const navigate = useNavigate();
  return (
    <motion.button
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 300, damping: 26 }}
      whileTap={{ scale: 0.93 }}
      onClick={() => { haptic.light(); if (route) navigate(route); }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        padding: '14px 14px 12px',
        borderRadius: 18,
        background: 'var(--pcms-panel, rgba(255,255,255,0.04))',
        border: '1px solid var(--pcms-line-soft, rgba(255,255,255,0.09))',
        boxShadow: `0 4px 18px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.06)`,
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient glow blob */}
      <div style={{
        position: 'absolute',
        top: -16, right: -16,
        width: 60, height: 60,
        borderRadius: '50%',
        background: color,
        opacity: 0.12,
        filter: 'blur(14px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        width: 34, height: 34, borderRadius: 11,
        background: `${color}22`,
        border: `1px solid ${color}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color,
        flexShrink: 0,
      }}>
        <Icon size={17} strokeWidth={2.2} />
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--pcms-text, #ffffff)', lineHeight: 1, fontFamily: "'Space Grotesk', sans-serif" }}>
          {value}
        </div>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--pcms-muted, #a1a1aa)', marginTop: 2 }}>{label}</div>
        {sub && (
          <div style={{ fontSize: 10, color, fontWeight: 700, marginTop: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
            <TrendingUp size={9} />
            {sub}
          </div>
        )}
      </div>
      <ChevronRight size={13} color="var(--pcms-muted)" style={{ position: 'absolute', bottom: 12, right: 12 }} />
    </motion.button>
  );
}

// -- Activity Feed Item --
function ActivityItem({ icon, label, time, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, ease: 'easeOut' }}
      style={{ display: 'flex', alignItems: 'center', gap: 11, paddingBottom: 12 }}
    >
      <div style={{
        width: 30, height: 30, borderRadius: '50%',
        background: `${color}18`,
        border: `1px solid ${color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, color,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--pcms-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {label}
        </div>
        <div style={{ fontSize: 10, color: 'var(--pcms-muted)', marginTop: 1 }}>{time}</div>
      </div>
      {/* Timeline line */}
      <div style={{
        position: 'absolute', left: 27, top: 30, width: 1, height: 12,
        background: 'var(--pcms-line-soft, rgba(255,255,255,0.07))',
      }} />
    </motion.div>
  );
}

// -- Main MobileHomeShell Component --
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
          .select('id, name, subject, created_at')
          .eq('is_bot', false)
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
      label: `Message from ${m.name || 'Visitor'}`,
      time: formatRelativeTime(m.created_at),
      color: '#6366f1',
    })),
    ...recentProjects.map((p) => ({
      key: `proj-${p.id}`,
      icon: <Briefcase size={13} />,
      label: `Project: ${p.title}`,
      time: formatRelativeTime(p.created_at),
      color: '#10b981',
    })),
  ].sort((a, b) => 0); // keep order as-is (already sorted by time)

  const STAT_CARDS = [
    {
      icon: Briefcase,
      label: 'Projects',
      value: stats.loading ? '–' : stats.projectCount,
      sub: 'Total showcased',
      color: '#10b981',
      route: '/admin/dashboard/projects',
    },
    {
      icon: MessageSquare,
      label: 'Unread',
      value: stats.loading ? '–' : stats.unreadMessages,
      sub: stats.unreadMessages > 0 ? 'Need reply' : 'All caught up',
      color: '#6366f1',
      route: '/admin/dashboard/messages',
    },
    {
      icon: Zap,
      label: 'Updates',
      value: stats.loading ? '–' : stats.updateCount,
      sub: 'Published',
      color: '#f59e0b',
      route: '/admin/dashboard/updates',
    },
    {
      icon: Star,
      label: 'Skills',
      value: stats.loading ? '–' : stats.skillCount,
      sub: 'In your stack',
      color: '#06b6d4',
      route: '/admin/dashboard/skills',
    },
  ];

  const QUICK_LAUNCH = [
    { label: 'Projects', icon: Briefcase, route: '/admin/dashboard/projects', color: '#10b981' },
    { label: 'Messages', icon: MessageSquare, route: '/admin/dashboard/messages', color: '#6366f1' },
    { label: 'Updates', icon: Zap, route: '/admin/dashboard/updates', color: '#f59e0b' },
    { label: 'Skills', icon: Star, route: '/admin/dashboard/skills', color: '#06b6d4' },
    { label: 'Preview', icon: Eye, route: '/admin/dashboard/preview', color: '#8b5cf6' },
    { label: 'Sessions', icon: Users, route: '/admin/dashboard/home', color: '#ec4899' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 4 }}>

      {/* ── STAT CARD GRID ── */}
      <section>
        <SectionHeader icon={<Activity size={13} color="#10b981" />} title="Live Overview" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {STAT_CARDS.map((card, i) => (
            <StatCard key={card.label} {...card} delay={i * 0.05} />
          ))}
        </div>
      </section>

      {/* ── QUICK LAUNCH GRID ── */}
      <section>
        <SectionHeader icon={<Zap size={13} color="#f59e0b" />} title="Quick Launch" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {QUICK_LAUNCH.map((item, i) => (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.04, type: 'spring', stiffness: 360, damping: 28 }}
              whileTap={{ scale: 0.88 }}
              onClick={() => { haptic.light(); navigate(item.route); }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 7,
                padding: '12px 6px',
                borderRadius: 16,
                background: 'var(--pcms-panel, rgba(255,255,255,0.04))',
                border: '1px solid var(--pcms-line-soft, rgba(255,255,255,0.09))',
                cursor: 'pointer',
                color: 'var(--pcms-text)',
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 12,
                background: `${item.color}1a`,
                border: `1px solid ${item.color}35`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: item.color,
              }}>
                <item.icon size={17} strokeWidth={2.2} />
              </div>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--pcms-text)' }}>{item.label}</span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* ── TODAY'S ACTIVITY FEED ── */}
      <section>
        <SectionHeader
          icon={<Clock size={13} color="#8b5cf6" />}
          title="Recent Activity"
          action={
            <button
              onClick={() => { haptic.light(); navigate('/admin/dashboard/messages'); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 3,
                background: 'transparent', border: 'none',
                fontSize: 10.5, fontWeight: 600, color: '#6366f1', cursor: 'pointer',
              }}
            >
              View all <ArrowRight size={10} />
            </button>
          }
        />
        <div style={{
          padding: '12px 14px 8px',
          borderRadius: 18,
          background: 'var(--pcms-panel, rgba(255,255,255,0.03))',
          border: '1px solid var(--pcms-line-soft, rgba(255,255,255,0.08))',
          position: 'relative',
        }}>
          {loadingFeed ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0' }}>
              <RefreshCw size={16} color="var(--pcms-muted)" className="spinning" />
            </div>
          ) : activityFeed.length === 0 ? (
            <EmptyFeedState />
          ) : (
            activityFeed.map((item, i) => (
              <ActivityItem key={item.key} {...item} delay={0.05 + i * 0.06} />
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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, paddingLeft: 2 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        {icon}
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--pcms-muted)' }}>
          {title}
        </span>
      </div>
      {action}
    </div>
  );
}

function EmptyFeedState() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '14px 0 8px', gap: 6 }}>
      <div style={{ fontSize: 26 }}>📭</div>
      <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--pcms-muted)' }}>No recent activity</span>
      <span style={{ fontSize: 10, color: 'var(--pcms-muted)', opacity: 0.7 }}>Changes will appear here in real time</span>
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
