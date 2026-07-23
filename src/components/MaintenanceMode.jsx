import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

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
    message: null,
  });

  useEffect(() => {
    let channel;

    async function loadInitial() {
      const { data, error } = await supabase
        .from('site_settings')
        .select('maintenance_enabled, maintenance_enabled_at, maintenance_eta, maintenance_message')
        .limit(1)
        .single();

      if (!error && data) {
        setStatus({
          loading: false,
          enabled: data.maintenance_enabled,
          enabledAt: data.maintenance_enabled_at,
          etaMinutes: data.maintenance_eta,
          message: data.maintenance_message,
        });
      } else {
        setStatus((s) => ({ ...s, loading: false }));
      }
    }

    loadInitial();

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

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const startedAt = status.enabledAt ? new Date(status.enabledAt).getTime() : null;
  const totalMs = status.etaMinutes * 60 * 1000;

  let pct = 4;
  let remainingLabel = 'in progress';
  let etaLabel = '—';

  if (startedAt) {
    const elapsed = now - startedAt;
    pct = Math.min(100, Math.max(4, (elapsed / totalMs) * 100));
    const remainingMs = Math.max(0, startedAt + totalMs - now);
    remainingLabel = remainingMs > 0 ? `~${Math.ceil(remainingMs / 60000)} min remaining` : 'wrapping up';
    etaLabel = new Date(startedAt + totalMs).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.mark}>
          <div style={styles.markBadge}>ST</div>
          <div>
            <div style={styles.markName}>Sujith Thota</div>
            <div style={styles.markRole}>Data &amp; ML Portfolio</div>
          </div>
        </div>

        <div style={styles.statusTag}>
          <span style={styles.pulse} />
          Scheduled maintenance
        </div>

        <h1 style={styles.h1}>The site is being updated.</h1>
        <p style={styles.sub}>
          {status.message ||
            "I'm making improvements behind the scenes. Everything will be back shortly, exactly as you left it."}
        </p>

        <div style={{ marginBottom: 30 }}>
          <div style={styles.progressLabels}>
            <span>Update in progress</span>
            <b style={{ color: '#1C1E22' }}>{remainingLabel}</b>
          </div>
          <div style={styles.track}>
            <div style={{ ...styles.fill, width: `${pct}%` }} />
          </div>
        </div>

        <div style={styles.divider} />

        <div style={styles.row}>
          <div>
            <div style={styles.smallLabel}>Need to reach me</div>
            <a href="mailto:sujithreddy1546@gmail.com" style={styles.link}>
              sujithreddy1546@gmail.com
            </a>
          </div>
          <div>
            <div style={{ ...styles.smallLabel, textAlign: 'right' }}>Expected back</div>
            <div style={{ fontWeight: 600, textAlign: 'right' }}>{etaLabel}</div>
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
          <strong style={{ color: '#1C1E22' }}>Maintenance Mode</strong>
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

      <div className={`setting-subpanel ${enabled ? 'open' : ''}`}>
        <div className="setting-subrow">
          <label style={{ color: '#5B6069' }}>
            Estimated time (minutes)
            <input
              type="number"
              min={1}
              value={etaMinutes}
              onChange={(e) => setEtaMinutes(e.target.value)}
              onBlur={() => enabled && save(true, { etaMinutes: Number(etaMinutes) })}
            />
          </label>
          <label style={{ color: '#5B6069' }}>
            Custom message (optional)
            <input
              type="text"
              placeholder="I'm making improvements behind the scenes…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onBlur={() => enabled && save(true, { message })}
            />
          </label>
        </div>
      </div>

      <style>{`
        .setting-card { padding: 16px 0; border-bottom: 1px dashed #ef444460; margin-top: 16px; border-top: 1px solid var(--border-color); }
        .setting-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; }
        .setting-desc { font-size: 13px; color: #5B6069; margin: 4px 0 0; max-width: 46ch; }
        .setting-meta { font-size: 12px; color: #1F3A5F; margin: 6px 0 0; font-weight: 500; }

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
