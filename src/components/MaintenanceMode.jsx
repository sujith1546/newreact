import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import '../styles/maintenance.css';

const BYPASS_KEY = 'maint_bypass_token';
const BYPASS_SECRET = import.meta.env.VITE_MAINTENANCE_BYPASS_SECRET || 'preview123';

// =================================================================
// 1. REALTIME HOOK
// =================================================================
export function useMaintenanceStatus() {
  const [status, setStatus] = useState({
    loading: true,
    enabled: false,
    enabledAt: null,
    etaMinutes: 20,
    message: '',
  });

  useEffect(() => {
    let channel;

    async function loadInitial() {
      const { data } = await supabase.from('site_settings').select('*').limit(1).single();

      if (data) {
        setStatus({
          loading: false,
          enabled: data.maintenance_enabled,
          enabledAt: data.maintenance_enabled_at,
          etaMinutes: data.maintenance_eta ?? 20,
          message: data.maintenance_message ?? '',
        });
      } else {
        setStatus((s) => ({ ...s, loading: false }));
      }
    }

    loadInitial();

    // Catch up on missed events if tab was suspended by browser
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadInitial();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    channel = supabase
      .channel('site_settings_maintenance')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'site_settings' },
        (payload) => {
          const row = payload.new;
          setStatus({
            loading: false,
            enabled: row.maintenance_enabled,
            enabledAt: row.maintenance_enabled_at,
            etaMinutes: row.maintenance_eta,
            message: row.maintenance_message,
          });
        }
      )
      .subscribe();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  return status;
}

// =================================================================
// 2. PUBLIC MAINTENANCE PAGE
// =================================================================
export function MaintenancePage({ status }) {
  const [now, setNow] = useState(Date.now());
  const [reloadScheduled, setReloadScheduled] = useState(false);

  // Time tracking
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const startedAt = status.enabledAt ? new Date(status.enabledAt).getTime() : Date.now();
  const totalMs = status.etaMinutes * 60 * 1000;
  const targetAt = startedAt + totalMs;

  const elapsed = Math.max(0, now - startedAt);
  const remaining = Math.max(0, targetAt - now);
  
  const rawPct = (elapsed / totalMs) * 100;
  const pct = Math.min(100, Math.max(0, rawPct));
  const rounded = Math.round(pct);

  let stage = 0;
  if (pct < 15) stage = 0;
  else if (pct < 55) stage = 1;
  else if (pct < 90) stage = 2;
  else if (pct < 100) stage = 3;
  else stage = 4;

  useEffect(() => {
    if (remaining <= 0 && !reloadScheduled) {
      setReloadScheduled(true);
      setTimeout(() => window.location.reload(), 4000);
    }
  }, [remaining, reloadScheduled]);

  const fmtTime = (ms) => {
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${m < 10 ? '0' : ''}${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const fmtRemaining = (ms) => {
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    if (m <= 0) return sec + 's';
    return `${m} min ${sec < 10 ? '0' : ''}${sec}s`;
  };

  let etaLabel = '—';
  if (startedAt) {
    etaLabel = new Date(targetAt).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  const nodes = [
    { x: 40, label: 'Build' },
    { x: 175, label: 'Deploy' },
    { x: 310, label: 'Cache' },
    { x: 420, label: 'Live' }
  ];
  const y = 60;

  return (
    <div className="maint-body">
      <div className="maint-sidebar">
        <div className="maint-avatar">ST</div>
        <p className="maint-side-name">Sujith Thota</p>
        <p className="maint-side-loc">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>
          Vellore, India
        </p>

        <div className="maint-nav">
          <div className="maint-nav-item">Home</div>
          <div className="maint-nav-item">About</div>
          <div className="maint-nav-item">Skills</div>
          <div className="maint-nav-item">Projects</div>
          <div className="maint-nav-item">Education</div>
          <div className="maint-nav-item">Experience</div>
          <div className="maint-nav-item">Certifications</div>
          <div className="maint-nav-item">Contact</div>
        </div>

        <div className="maint-side-footer">
          <div className="maint-side-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
            Deploy status
          </div>
          <div className="maint-side-note">Last checked just now<br />© 2026 All rights reserved Sujith</div>
        </div>
      </div>

      <div className="maint-main">
        <div className="maint-topbar">
          <div className="maint-top-pill"><span className="maint-dot"></span>Deploying</div>
          <div className="maint-top-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
          </div>
        </div>

        <div className="maint-grid">
          <div>
            <div className={remaining <= 0 ? "maint-badge maint-late" : "maint-badge"}>
              <span className="maint-bdot"></span>
              {remaining <= 0 ? 'Almost there' : 'Scheduled maintenance'}
            </div>

            <p className="maint-eyebrow">One moment</p>
            <h1 className="maint-h1">The site is<br />being updated.</h1>

            <div className="maint-tag">
              <span className="maint-chev">&gt;_</span> <span>Maintenance mode active</span><span className="maint-cursor"></span>
            </div>

            <p className="maint-desc">
              {status.message || "Pushing a new version live — the old one's taken down so nothing loads half-finished."}
              <br />If it's urgent, reach me directly below.
            </p>
            
            {remaining <= 0 ? (
              <p className="maint-countdown-line">Finishing up — <b>should be live now</b></p>
            ) : (
              <p className="maint-countdown-line">Back online in <b>~{fmtRemaining(remaining)}</b> · by <b>{etaLabel}</b></p>
            )}

            <div className="maint-cards">
              <div className="maint-mini-card">
                <div className="maint-mini-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 18l6-6-6-6M8 6l-6 6 6 6" /></svg></div>
                <div className="maint-mini-label">Build</div>
                <div className={stage >= 1 ? "maint-mini-sub maint-done" : "maint-mini-sub"}>{stage >= 1 ? 'complete' : 'in progress'}</div>
              </div>
              <div className="maint-mini-card">
                <div className="maint-mini-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="10" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg></div>
                <div className="maint-mini-label">Deploy</div>
                <div className={stage >= 2 ? "maint-mini-sub maint-done" : (stage === 1 ? "maint-mini-sub maint-active" : "maint-mini-sub")}>{stage >= 2 ? 'complete' : (stage === 1 ? 'in progress' : 'pending')}</div>
              </div>
              <div className="maint-mini-card">
                <div className="maint-mini-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" /></svg></div>
                <div className="maint-mini-label">Contact me</div>
                <div className="maint-mini-sub">sujithreddy1546@gmail.com</div>
              </div>
            </div>

            <div className="maint-footer-row">
              <div>
                <div className="maint-flabel">Need me sooner</div>
                <a href="mailto:sujithreddy1546@gmail.com">sujithreddy1546@gmail.com</a>
              </div>
              <div className="maint-eta-block">
                <div className="maint-flabel">Back online by</div>
                <div className="maint-eta-val">{etaLabel}</div>
              </div>
            </div>
          </div>

          <div className="maint-visual-panel">
            <div className="maint-vp-head">
              <span className="maint-vp-title">Deploy pipeline</span>
              <span className="maint-vp-live"><span className="maint-ld"></span>run #live</span>
            </div>

            <svg className="maint-pipeline" viewBox="0 0 460 150">
              {nodes.slice(0, 3).map((n, i) => {
                const x1 = n.x;
                const x2 = nodes[i + 1].x;
                const activeIdx = Math.min(4, stage + 1);
                const done = i < activeIdx;
                const color = done ? '#22c55e' : '#e6e6e4';
                return <line key={`line-${i}`} x1={x1} y1={y} x2={x2} y2={y} stroke={color} strokeWidth="2" />;
              })}
              
              {nodes.map((n, j) => {
                const activeIdx = Math.min(4, stage + 1);
                const st = j < activeIdx ? 'done' : (j === activeIdx ? 'active' : 'pending');
                const fill = st === 'done' ? '#e9f9ef' : (st === 'active' ? '#eaf1fe' : '#ffffff');
                const stroke = st === 'done' ? '#22c55e' : (st === 'active' ? '#2f6fed' : '#d8d8d5');
                const textColor = st === 'pending' ? '#a3a39e' : '#161616';
                
                return (
                  <g key={`node-${j}`}>
                    <circle cx={n.x} cy={y} r="16" fill={fill} stroke={stroke} strokeWidth="2" />
                    {st === 'done' && (
                      <path d={`M${n.x - 6} ${y} l4 4 l8 -9`} fill="none" stroke="#22c55e" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                    )}
                    {st === 'active' && (
                      <circle cx={n.x} cy={y} r="4.5" fill="#2f6fed">
                        <animate attributeName="opacity" values="1;0.3;1" dur="1.4s" repeatCount="indefinite" />
                      </circle>
                    )}
                    {st === 'pending' && (
                      <circle cx={n.x} cy={y} r="4.5" fill="#d8d8d5" />
                    )}
                    <text x={n.x} y={y + 34} textAnchor="middle" fontFamily="Inter" fontSize="12" fontWeight="500" fill={textColor}>{n.label}</text>
                  </g>
                );
              })}
            </svg>

            <div className="maint-stat-grid">
              <div className="maint-stat-card">
                <div className="maint-stat-label">Progress</div>
                <div className="maint-stat-val maint-blue">{rounded}%</div>
              </div>
              <div className="maint-stat-card">
                <div className="maint-stat-label">Elapsed</div>
                <div className="maint-stat-val">{fmtTime(elapsed)}</div>
              </div>
            </div>

            <div className="maint-region-list">
              <div className="maint-region-row">
                <span className="maint-region-name"><span className="maint-rd maint-green"></span>API — Mumbai</span>
                <span className="maint-region-lat">42ms</span>
              </div>
              <div className="maint-region-row">
                <span className="maint-region-name"><span className="maint-rd maint-green"></span>Database — Supabase</span>
                <span className="maint-region-lat">18ms</span>
              </div>
              <div className="maint-region-row">
                <span className="maint-region-name"><span className={stage >= 3 ? "maint-rd maint-green" : "maint-rd maint-blue"}></span>Edge cache — Singapore</span>
                <span className={stage >= 3 ? "maint-region-lat" : "maint-region-lat maint-blue-text"}>{stage >= 3 ? '9ms' : 'warming'}</span>
              </div>
            </div>
            
            {remaining <= 0 && (
              <div className="maint-reload-note">refreshing automatically in a few seconds...</div>
            )}
            
            {remaining > 0 && (
              <div className="maint-reload-note">this page checks its own status automatically — no need to refresh</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    fontFamily: 'Inter, sans-serif',
    background: '#F7F7F5',
    color: '#1C1E22',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: 32,
  },
  card: {
    width: '100%',
    maxWidth: 560,
    background: '#FFFFFF',
    border: '1px solid #E4E4E0',
    borderRadius: 14,
    padding: '52px 48px 40px',
    boxShadow: '0 1px 2px rgba(20,20,20,0.03), 0 20px 44px -28px rgba(20,20,20,0.18)',
  },
  mark: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 34 },
  markBadge: {
    width: 34,
    height: 34,
    borderRadius: 9,
    background: '#1F3A5F',
    color: '#fff',
    fontFamily: "'Source Serif 4', serif",
    fontWeight: 600,
    fontSize: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markName: { fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em' },
  markRole: { fontSize: 12, color: '#5B6069' },
  statusTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7,
    fontSize: 12.5,
    fontWeight: 600,
    color: '#1F3A5F',
    background: '#EAF0F7',
    padding: '6px 12px 6px 10px',
    borderRadius: 100,
    marginBottom: 22,
  },
  input: { width: '100%', padding: '10px 12px', fontSize: 14, borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' },
  updateBtn: { marginTop: 4, padding: '10px 16px', background: '#ef4444', color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', borderRadius: 8, cursor: 'pointer', transition: '0.2s', width: 'fit-content', alignSelf: 'flex-start' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' },
  pulse: { width: 7, height: 7, borderRadius: '50%', background: '#1F3A5F', animation: 'pulse 2s ease-out infinite' },
  h1: {
    fontFamily: "'Source Serif 4', serif",
    fontWeight: 600,
    fontSize: 30,
    lineHeight: 1.25,
    letterSpacing: '-0.01em',
    margin: '0 0 14px',
  },
  sub: { fontSize: 15.5, lineHeight: 1.65, color: '#5B6069', margin: '0 0 30px', maxWidth: '46ch' },
  progressLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 12.5,
    color: '#5B6069',
    marginBottom: 8,
  },
  track: { height: 6, background: '#EAF0F7', borderRadius: 100, overflow: 'hidden' },
  fill: { height: '100%', background: '#1F3A5F', borderRadius: 100, transition: 'width 0.6s ease' },
  divider: { height: 1, background: '#E4E4E0', margin: '0 0 26px' },
  row: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20 },
  smallLabel: { fontSize: 12.5, color: '#5B6069', marginBottom: 4 },
  link: { color: '#1F3A5F', fontSize: 14.5, fontWeight: 600, textDecoration: 'none' },
};

// =================================================================
// 3. MAINTENANCE GATE
// =================================================================
export function MaintenanceGate({ children }) {
  const status = useMaintenanceStatus();
  const [session, setSession] = useState(undefined); // undefined = still checking
  const checkedBypass = useRef(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!checkedBypass.current && typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('preview');
    if (token && BYPASS_SECRET && token === BYPASS_SECRET) {
      localStorage.setItem(BYPASS_KEY, token);
    }
    checkedBypass.current = true;
  }
  const hasBypassToken =
    typeof window !== 'undefined' && localStorage.getItem(BYPASS_KEY) === BYPASS_SECRET && !!BYPASS_SECRET;

  // For this portfolio, anyone authenticated is an admin.
  const isAdmin = !!session?.user;

  // IMPORTANT: Always allow access to admin routes so the login page isn't blocked!
  const isAdminRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');

  if (status.loading || session === undefined) return null; // avoid a flash of the wrong screen

  if (status.enabled && !isAdmin && !hasBypassToken && !isAdminRoute) {
    return <MaintenancePage status={status} />;
  }

  return children;
}

// =================================================================
// 4. ADMIN SETTINGS PANEL
// =================================================================
export function MaintenanceSettingsPanel() {
  const [enabled, setEnabled] = useState(false);
  const [etaMinutes, setEtaMinutes] = useState(20);
  const [message, setMessage] = useState('');
  const [enabledAt, setEnabledAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rowId, setRowId] = useState(null);

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('id, maintenance_enabled, maintenance_eta, maintenance_message, maintenance_enabled_at')
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) {
          setRowId(data.id);
          setEnabled(data.maintenance_enabled);
          setEtaMinutes(data.maintenance_eta ?? 20);
          setMessage(data.maintenance_message ?? '');
          setEnabledAt(data.maintenance_enabled_at);
        }
        setLoading(false);
      });
  }, []);

  async function save(nextEnabled, overrides = {}) {
    setSaving(true);
    const payload = {
      maintenance_enabled: nextEnabled,
      maintenance_eta: overrides.etaMinutes ?? Number(etaMinutes),
      maintenance_message: overrides.message ?? message ?? null,
      ...(nextEnabled && !enabled ? { maintenance_enabled_at: new Date().toISOString() } : {}),
      ...(!nextEnabled ? { maintenance_enabled_at: null } : {}),
    };

    if (!rowId) {
       console.error("No row ID found for site_settings");
       setSaving(false);
       return;
    }

    const { error } = await supabase.from('site_settings').update(payload).eq('id', rowId);

    if (!error) {
      setEnabled(nextEnabled);
      if (payload.maintenance_enabled_at !== undefined) setEnabledAt(payload.maintenance_enabled_at);
    }
    setSaving(false);
  }

  if (loading) return null;

  return (
    <div className="setting-card">
      <div className="setting-row">
        <div>
          <h4 style={{ margin: '0 0 4px', fontSize: 15, color: 'var(--text-primary)' }}>Maintenance Mode</h4>
          <p className="setting-desc">
            Locks the public site with a "be right back" screen. Admin dashboard stays accessible.
          </p>
          {enabled && enabledAt && (
            <p className="setting-meta">
              Turned on at{' '}
              {new Date(enabledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
        <button
          type="button"
          className={`switch ${enabled ? 'on' : ''}`}
          onClick={(e) => { e.preventDefault(); save(!enabled); }}
          disabled={saving}
          aria-pressed={enabled}
        >
          <span className="knob" />
        </button>
      </div>

      {enabled && (
        <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Estimated Time (Minutes)</label>
            <input
              type="number"
              min={1}
              value={etaMinutes}
              onChange={(e) => setEtaMinutes(e.target.value)}
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Custom Message (Optional)</label>
            <textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. We are upgrading the database..."
              style={{ ...styles.input, resize: 'vertical' }}
            />
          </div>
          <button 
            type="button" 
            onClick={(e) => { e.preventDefault(); save(true); }} 
            disabled={saving} 
            style={styles.updateBtn}
          >
            Update Settings
          </button>
        </div>
      )}

      <style>{`
        .setting-card { 
          padding: 20px; 
          background: var(--bg-primary); 
          border-radius: 12px; 
          border: 1px solid var(--border-color);
          position: relative;
          overflow: hidden;
        }
        .setting-card::before {
          content: "";
          position: absolute;
          top: 0; left: 0; bottom: 0; width: 4px;
          background: ${enabled ? '#ef4444' : 'transparent'};
          transition: 0.3s;
        }
        .setting-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; }
        .setting-desc { font-size: 13px; color: var(--text-muted); margin: 4px 0 0; max-width: 50ch; line-height: 1.5; }
        .setting-meta { font-size: 12px; color: #ef4444; margin: 8px 0 0; font-weight: 600; background: #ef444415; padding: 4px 10px; border-radius: 100px; display: inline-block; }

        .switch { width: 42px; height: 24px; border-radius: 100px; border: none; background: #D8DCE3;
          position: relative; cursor: pointer; flex-shrink: 0; transition: background 0.2s ease; }
        .switch.on { background: #ef4444; }
        .switch .knob { position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%;
          background: #fff; transition: transform 0.2s ease; box-shadow: 0 1px 2px rgba(0,0,0,0.15); }
        .switch.on .knob { transform: translateX(18px); }

        .setting-subpanel { max-height: 0; overflow: hidden; transition: max-height 0.3s ease, margin-top 0.3s ease; }
        .setting-subpanel.open { max-height: 200px; margin-top: 16px; }
        .setting-subrow { display: flex; gap: 16px; padding: 14px; background: #ef444415; border-radius: 10px; border: 1px dashed #ef444430; }
        .setting-subrow label { flex: 1; font-size: 12.5px; color: #5B6069; font-weight: 500;
          display: flex; flex-direction: column; gap: 6px; }
        .setting-subrow input { font-family: inherit; font-size: 13.5px; color: #1C1E22;
          padding: 8px 10px; border: 1px solid #E4E4E0; border-radius: 6px; background: #fff; }
      `}</style>
    </div>
  );
}
