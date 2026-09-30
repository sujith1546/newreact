import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck, Database, Globe, CheckCircle2, RefreshCw,
  Trash2, Zap, Activity, Server, ExternalLink, Bug, ChevronRight
} from 'lucide-react';
import SettingsPanel from '../../panels/SettingsPanel';
import AuthSecurityPanel from '../../panels/AuthSecurityPanel';
import DiagnosticsMobileView from './DiagnosticsMobileView';
import { globalDataCache, fetchPromises } from '../../../../hooks/useRealtimeData';
import { subscribeDiagnostics, calculateHealthScore } from '../../../../core/diagnostics/diagnosticsEngine';
import haptic from '../../../../lib/haptics';

// ── Animated circular ring for metric scores ──
function MetricRing({ value, max = 100, color, label, sublabel, size = 64 }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const R = (size / 2) - 5;
  const circ = 2 * Math.PI * R;
  const dash = circ * (1 - pct / 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={R}
          fill="none" stroke="var(--border-color, rgba(255,255,255,0.1))" strokeWidth={4.5}
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2} cy={size / 2} r={R}
          fill="none" stroke={color} strokeWidth={4.5}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: dash }}
          transition={{ duration: 1, ease: 'easeOut' }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text
          x="50%" y="48%" dominantBaseline="middle" textAnchor="middle"
          fill="var(--text-primary)" fontSize={size * 0.22} fontWeight={700}
        >
          {pct}
        </text>
        <text
          x="50%" y="68%" dominantBaseline="middle" textAnchor="middle"
          fill="var(--text-muted)" fontSize={size * 0.12} fontWeight={600}
        >
          %
        </text>
      </svg>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>{label}</div>
        {sublabel && <div style={{ fontSize: 9.5, color: 'var(--text-muted)' }}>{sublabel}</div>}
      </div>
    </div>
  );
}

// ── Live latency badge ──
function LatencyBadge({ ms }) {
  const color = ms < 100 ? '#10b981' : ms < 300 ? '#f59e0b' : '#ef4444';
  const label = ms < 100 ? 'Fast' : ms < 300 ? 'Good' : 'Slow';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 9px', borderRadius: 12,
      background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
      fontSize: 10.5, fontWeight: 600, color: 'var(--text-primary)',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 3, background: color, boxShadow: `0 0 6px ${color}` }} />
      <span>{ms}ms · {label}</span>
    </span>
  );
}

const SYSTEM_SUBTABS = [
  { key: 'settings', label: 'Settings', icon: 'ti-settings' },
  { key: 'diagnostics', label: 'Bug Radar', icon: 'ti-bug' },
  { key: 'auth_security', label: 'Security', icon: 'ti-shield-lock' },
];

export default function SystemView({ activeSubTab = 'settings', onSelectSubTab }) {
  const [latencyMs, setLatencyMs] = useState(18);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [clearFeedback, setClearFeedback] = useState(null);
  const [cacheUsedKb, setCacheUsedKb] = useState(0);
  const [diagnosticsSummary, setDiagnosticsSummary] = useState({ count: 0, healthScore: 100 });

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

  // Listen to diagnostics telemetry
  useEffect(() => {
    return subscribeDiagnostics((state) => {
      const active = state.issues.filter((i) => !i.resolved).length;
      setDiagnosticsSummary({
        count: active,
        healthScore: calculateHealthScore(state.issues),
      });
    });
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

  const uptimePct = 99;
  const maxCacheKb = 512;
  const cacheHealthPct = Math.max(0, Math.min(100, 100 - Math.round((cacheUsedKb / maxCacheKb) * 100)));

  return (
    <div className="admin-mobile-view" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
      {/* ── Segmented Subtabs Control Bar ── */}
      <div style={{
        display: 'flex',
        gap: 6,
        padding: '8px 14px',
        borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.08))',
        background: 'var(--bg-secondary, #18191d)',
        flexShrink: 0,
      }}>
        {SYSTEM_SUBTABS.map((sub) => {
          const isActive = activeSubTab === sub.key;
          return (
            <button
              key={sub.key}
              type="button"
              onClick={() => {
                haptic.light();
                onSelectSubTab?.(sub.key);
              }}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 18,
                border: 'none',
                background: 'transparent',
                color: isActive ? 'var(--primary-blue, #3b82f6)' : 'var(--text-muted, #94a3b8)',
                fontSize: 12,
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'color 0.15s ease',
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="systemSubTabPill"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 18,
                    background: 'var(--primary-blue-subtle, rgba(59, 130, 246, 0.12))',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                  }}
                />
              )}
              <i className={`ti ${sub.icon}`} style={{ fontSize: 13, position: 'relative', zIndex: 1 }} />
              <span style={{ position: 'relative', zIndex: 1 }}>{sub.label}</span>
              {sub.key === 'diagnostics' && diagnosticsSummary.count > 0 && (
                <span style={{
                  position: 'relative',
                  zIndex: 1,
                  background: '#f43f5e',
                  color: '#ffffff',
                  fontSize: 9,
                  fontWeight: 800,
                  padding: '1px 5px',
                  borderRadius: 8,
                }}>
                  {diagnosticsSummary.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Subtab View Content ── */}
      {activeSubTab === 'diagnostics' ? (
        <DiagnosticsMobileView />
      ) : activeSubTab === 'auth_security' ? (
        <div style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding: '12px 14px 130px',
        }}>
          <AuthSecurityPanel isMobileView={true} />
        </div>
      ) : (
        <div className="admin-subtab-content" style={{
          flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0,
          overflowY: 'auto', WebkitOverflowScrolling: 'touch', overscrollBehaviorY: 'bounce',
          padding: '12px 14px 130px', gap: 14,
        }}>
          {/* ── Bug & Issue Radar Banner Card ── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => {
              haptic.light();
              onSelectSubTab?.('diagnostics');
            }}
            style={{
              padding: '13px 15px',
              borderRadius: 16,
              background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)',
              border: '1px solid rgba(244, 63, 94, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(244, 63, 94, 0.15)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f43f5e',
              }}>
                <Bug size={18} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Bug & Issue Radar
                  </span>
                  <span style={{
                    fontSize: 9,
                    fontWeight: 800,
                    padding: '1px 6px',
                    borderRadius: 8,
                    background: diagnosticsSummary.healthScore >= 90 ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                    color: diagnosticsSummary.healthScore >= 90 ? '#10b981' : '#f59e0b',
                  }}>
                    {diagnosticsSummary.healthScore}% HEALTH
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  {diagnosticsSummary.count === 0
                    ? 'Zero errors · Tap to run deep scan'
                    : `${diagnosticsSummary.count} issue(s) flagged · Tap to inspect`}
                </div>
              </div>
            </div>
            <ChevronRight size={16} color="var(--text-muted)" />
          </motion.div>

          {/* ── System Status Card ── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              padding: '13px 15px',
              borderRadius: 16,
              background: 'var(--bg-secondary, #18191d)',
              border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
              display: 'flex', flexDirection: 'column', gap: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck size={16} style={{ color: 'var(--primary-blue, #3b82f6)' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                  System Architecture
                </span>
              </div>
              <span style={{
                fontSize: 9.5, fontWeight: 700, color: '#10b981',
                background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)',
                padding: '1px 7px', borderRadius: 8,
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981' }} />
                ONLINE
              </span>
            </div>

            {/* Status Chips */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[
                { Icon: Database, label: 'Supabase DB' },
                { Icon: Globe, label: 'Edge CDN' },
                { Icon: CheckCircle2, label: 'Auth Ready' },
              ].map(({ Icon, label }) => (
                <div key={label} style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '4px 8px', borderRadius: 8,
                  background: 'var(--bg-primary, rgba(255,255,255,0.04))',
                  border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
                  fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)',
                }}>
                  <Icon size={12} style={{ color: 'var(--primary-blue, #3b82f6)' }} />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Live Metric Rings ── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.25 }}
            style={{
              padding: '14px 16px',
              borderRadius: 16,
              background: 'var(--bg-secondary, #18191d)',
              border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
              <Activity size={12} style={{ color: 'var(--primary-blue, #3b82f6)' }} />
              <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                Live Telemetry
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              <MetricRing value={uptimePct} color="#10b981" label="Uptime" sublabel="30 days" />
              <MetricRing value={cacheHealthPct} color="var(--primary-blue, #3b82f6)" label="Cache" sublabel={`${cacheUsedKb}KB`} />
              <MetricRing value={Math.round(100 - (latencyMs / 100) * 100)} color="#f59e0b" label="Speed" sublabel={`${latencyMs}ms`} />
            </div>
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center' }}>
              <LatencyBadge ms={latencyMs} />
            </div>
          </motion.div>

          {/* ── Quick System Actions ── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.25 }}
            style={{
              padding: '13px 15px',
              borderRadius: 16,
              background: 'var(--bg-secondary, #18191d)',
              border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <Zap size={12} style={{ color: 'var(--primary-blue, #3b82f6)' }} />
              <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                Maintenance
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {/* Clear Cache */}
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleClearCache}
                disabled={isClearingCache}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 12,
                  background: 'var(--bg-primary, rgba(255,255,255,0.04))',
                  border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: clearFeedback === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: clearFeedback === 'success' ? '#10b981' : '#ef4444',
                }}>
                  {clearFeedback === 'success' ? <CheckCircle2 size={15} /> : <Trash2 size={15} />}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {isClearingCache ? 'Clearing...' : clearFeedback === 'success' ? 'Cache Cleared!' : 'Purge Cache & Refresh'}
                  </div>
                  <div style={{ fontSize: 9.5, color: 'var(--text-muted)', marginTop: 1 }}>
                    {cacheUsedKb > 0 ? `${cacheUsedKb}KB in storage + service worker` : 'Purges client-side SWR & cache'}
                  </div>
                </div>
                {isClearingCache && <RefreshCw size={13} color="var(--text-muted)" className="spinning" style={{ marginLeft: 'auto' }} />}
              </motion.button>

              {/* Open Supabase */}
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => { haptic.light(); window.open('https://supabase.com/dashboard', '_blank'); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 12,
                  background: 'var(--bg-primary, rgba(255,255,255,0.04))',
                  border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: 'rgba(59, 130, 246, 0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--primary-blue, #3b82f6)',
                }}>
                  <Server size={15} />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Open Supabase Console</div>
                  <div style={{ fontSize: 9.5, color: 'var(--text-muted)', marginTop: 1 }}>Tables, authentication, and database</div>
                </div>
                <ExternalLink size={12} color="var(--text-muted)" style={{ marginLeft: 'auto', flexShrink: 0 }} />
              </motion.button>
            </div>
          </motion.div>

          {/* ── Settings Panel ── */}
          <SettingsPanel isMobileView={true} />

        </div>
      )}
    </div>
  );
}
