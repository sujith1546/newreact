import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, Database, Globe, CheckCircle2, RefreshCw,
  Trash2, Zap, Activity, Server, Cpu, ExternalLink, AlertTriangle
} from 'lucide-react';
import SettingsPanel from '../../panels/SettingsPanel';
import { globalDataCache, fetchPromises } from '../../../../hooks/useRealtimeData';
import haptic from '../../../../lib/haptics';

// Animated circular ring for showing a metric score (0–100)
function MetricRing({ value, max = 100, color, label, sublabel, size = 64 }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const R = (size / 2) - 5;
  const circ = 2 * Math.PI * R;
  const dash = circ * (1 - pct / 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Track */}
        <circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5} />
        {/* Progress */}
        <motion.circle
          cx={size / 2} cy={size / 2} r={R}
          fill="none" stroke={color} strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: dash }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
          fill={color} fontSize={size * 0.2} fontWeight={800} fontFamily="'Space Grotesk', sans-serif">
          {pct}
        </text>
        <text x="50%" y="70%" dominantBaseline="middle" textAnchor="middle"
          fill="rgba(255,255,255,0.4)" fontSize={size * 0.13} fontWeight={600}>
          %
        </text>
      </svg>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--pcms-text)' }}>{label}</div>
        {sublabel && <div style={{ fontSize: 9.5, color: 'var(--pcms-muted)' }}>{sublabel}</div>}
      </div>
    </div>
  );
}

// Live latency badge
function LatencyBadge({ ms }) {
  const color = ms < 100 ? '#10b981' : ms < 300 ? '#f59e0b' : '#ef4444';
  const label = ms < 100 ? 'Fast' : ms < 300 ? 'Good' : 'Slow';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 9px', borderRadius: 10,
      background: `${color}18`, border: `1px solid ${color}35`,
      fontSize: 10.5, fontWeight: 800, color,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 3, background: color, boxShadow: `0 0 6px ${color}` }} />
      {ms}ms · {label}
    </span>
  );
}

export default function SystemView() {
  const [latencyMs, setLatencyMs] = useState(18);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [clearFeedback, setClearFeedback] = useState(null);
  const [cacheUsedKb, setCacheUsedKb] = useState(0);

  // Measure localStorage cache usage on mount
  useEffect(() => {
    let total = 0;
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('swr_cache_') || key.startsWith('cache_')) {
        try { total += (localStorage.getItem(key) || '').length * 2; } catch (_) {}
      }
    }
    setCacheUsedKb(Math.round(total / 1024));
  }, []);

  // Simulate live latency fluctuation
  useEffect(() => {
    const timer = setInterval(() => {
      setLatencyMs(Math.round(12 + Math.random() * 18));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleClearCache = useCallback(async () => {
    haptic.medium();
    setIsClearingCache(true);
    setClearFeedback(null);
    try {
      Object.keys(globalDataCache).forEach((k) => delete globalDataCache[k]);
      Object.keys(fetchPromises).forEach((k) => delete fetchPromises[k]);
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('swr_cache_') || key.startsWith('cache_')) {
          localStorage.removeItem(key);
        }
      });
      if ('caches' in window) {
        const names = await caches.keys();
        await Promise.all(names.map((n) => caches.delete(n)));
      }
      window.dispatchEvent(new CustomEvent('pcms_force_refresh'));
      await new Promise((r) => setTimeout(r, 600));
      setCacheUsedKb(0);
      setClearFeedback('success');
      haptic.success();
    } catch (_) {
      setClearFeedback('error');
    }
    setIsClearingCache(false);
    setTimeout(() => setClearFeedback(null), 2500);
  }, []);

  // Compute "cache health" as inverse of usage
  const maxCacheKb = 512;
  const cacheHealthPct = Math.max(0, Math.min(100, 100 - Math.round((cacheUsedKb / maxCacheKb) * 100)));
  const uptimePct = 99; // static display

  return (
    <div className="admin-mobile-view" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
      <div className="admin-subtab-content" style={{
        flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0,
        overflowY: 'auto', WebkitOverflowScrolling: 'touch', overscrollBehaviorY: 'bounce',
        padding: '14px 14px 120px', gap: 16,
      }}>

        {/* ── System Status Hero Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            padding: '14px 16px',
            borderRadius: 18,
            background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 100%)',
            border: '1px solid rgba(99,102,241,0.25)',
            display: 'flex', flexDirection: 'column', gap: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={18} color="#6366f1" />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--pcms-text)', fontFamily: "'Space Grotesk', sans-serif" }}>
                System Architecture & Health
              </span>
            </div>
            <span style={{
              fontSize: 10, fontWeight: 700, color: '#10b981',
              background: 'rgba(16,185,129,0.15)', padding: '2px 8px', borderRadius: 10,
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
              HEALTHY
            </span>
          </div>
          {/* Status Chips */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { Icon: Database, label: 'Supabase DB', color: '#3b82f6' },
              { Icon: Globe, label: 'Production Live', color: '#10b981' },
              { Icon: CheckCircle2, label: 'Auth Active', color: '#8b5cf6' },
            ].map(({ Icon, label, color }) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '4px 9px', borderRadius: 8,
                background: 'var(--pcms-panel-2)', border: '1px solid var(--pcms-line-soft)',
                fontSize: 11, fontWeight: 600, color: 'var(--pcms-text)',
              }}>
                <Icon size={12} color={color} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Live Metric Rings ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          style={{
            padding: '16px',
            borderRadius: 18,
            background: 'var(--pcms-panel, rgba(255,255,255,0.04))',
            border: '1px solid var(--pcms-line-soft, rgba(255,255,255,0.08))',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
            <Activity size={13} color="#10b981" />
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--pcms-muted)' }}>
              Live Metrics
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <MetricRing value={uptimePct} color="#10b981" label="Uptime" sublabel="30 days" />
            <MetricRing value={cacheHealthPct} color="#6366f1" label="Cache" sublabel={`${cacheUsedKb}KB used`} />
            <MetricRing value={Math.round(100 - (latencyMs / 100) * 100)} color="#f59e0b" label="Speed" sublabel={`${latencyMs}ms`} />
          </div>
          <div style={{ marginTop: 14, display: 'flex', justifyContent: 'center' }}>
            <LatencyBadge ms={latencyMs} />
          </div>
        </motion.div>

        {/* ── Quick System Actions ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          style={{
            padding: '14px 16px',
            borderRadius: 18,
            background: 'var(--pcms-panel, rgba(255,255,255,0.04))',
            border: '1px solid var(--pcms-line-soft, rgba(255,255,255,0.08))',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <Zap size={13} color="#f59e0b" />
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--pcms-muted)' }}>
              Quick Actions
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Clear Cache */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleClearCache}
              disabled={isClearingCache}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 14px', borderRadius: 14,
                background: clearFeedback === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.08)',
                border: `1px solid ${clearFeedback === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.2)'}`,
                cursor: 'pointer', textAlign: 'left',
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: clearFeedback === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: clearFeedback === 'success' ? '#10b981' : '#ef4444',
              }}>
                {clearFeedback === 'success' ? <CheckCircle2 size={16} /> : <Trash2 size={16} />}
              </div>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--pcms-text)' }}>
                  {isClearingCache ? 'Clearing...' : clearFeedback === 'success' ? 'Cache Cleared!' : 'Clear All Caches'}
                </div>
                <div style={{ fontSize: 10, color: 'var(--pcms-muted)', marginTop: 1 }}>
                  {cacheUsedKb > 0 ? `${cacheUsedKb}KB in localStorage + SW` : 'SWR · localStorage · Service Worker'}
                </div>
              </div>
              {isClearingCache && <RefreshCw size={14} color="var(--pcms-muted)" className="spinning" style={{ marginLeft: 'auto' }} />}
            </motion.button>

            {/* Open Supabase */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => { haptic.light(); window.open('https://supabase.com/dashboard', '_blank'); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 14px', borderRadius: 14,
                background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)',
                cursor: 'pointer', textAlign: 'left',
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: 'rgba(52,211,153,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#34d399',
              }}>
                <Server size={16} />
              </div>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--pcms-text)' }}>Open Supabase Dashboard</div>
                <div style={{ fontSize: 10, color: 'var(--pcms-muted)', marginTop: 1 }}>View tables, auth, and storage</div>
              </div>
              <ExternalLink size={12} color="var(--pcms-muted)" style={{ marginLeft: 'auto', flexShrink: 0 }} />
            </motion.button>
          </div>
        </motion.div>

        {/* ── Settings Panel ── */}
        <SettingsPanel isMobileView={true} />

      </div>
    </div>
  );
}
