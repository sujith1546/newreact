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

import MaintenancePage from '../pages/Maintenance';

export { MaintenancePage };

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
      maintenance_message: overrides.message !== undefined ? overrides.message : message,
      ...(nextEnabled && !enabled ? { maintenance_enabled_at: new Date().toISOString() } : {}),
      ...(!nextEnabled ? { maintenance_enabled_at: null } : {}),
    };

    if (!rowId) {
       console.error("No row ID found for site_settings");
       setSaving(false);
       return;
    }

    const { error } = await supabase.from('site_settings').update(payload).eq('id', rowId);

    setTimeout(() => setSaving(false), 600);
    
    if (!error) {
      setEnabled(nextEnabled);
      if (payload.maintenance_enabled_at !== undefined) setEnabledAt(payload.maintenance_enabled_at);
    }
  }

  const handleBlur = (field, val) => {
    save(enabled, { [field]: val });
  };

  if (loading) return null;

  return (
    <div className="setting-card">
      <div className="setting-row">
        <div>
          <h4 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
            Maintenance Mode
            {saving && <span style={{ fontSize: 12, fontWeight: 500, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 4 }}><div className="maint-spinner" /> Saving...</span>}
          </h4>
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
              onBlur={(e) => handleBlur('etaMinutes', e.target.value)}
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Custom Message (Optional)</label>
            <textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onBlur={(e) => handleBlur('message', e.target.value)}
              placeholder="e.g. We are upgrading the database..."
              style={{ ...styles.input, resize: 'vertical' }}
            />
          </div>
        </div>
      )}

      <style>{`
        .setting-card { 
          padding: 24px; 
          background: var(--bg-primary); 
          border-radius: 20px; 
          border: 1px solid var(--border-color);
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 30px rgba(0,0,0,0.04);
        }
        .setting-card::before {
          content: "";
          position: absolute;
          top: 0; left: 0; bottom: 0; width: 6px;
          background: ${enabled ? '#ef4444' : 'transparent'};
          transition: 0.3s;
        }
        .setting-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; }
        .setting-desc { font-size: 14px; color: var(--text-muted); margin: 4px 0 0; max-width: 50ch; line-height: 1.5; }
        .setting-meta { font-size: 13px; color: #ef4444; margin: 12px 0 0; font-weight: 600; background: #ef444415; padding: 6px 12px; border-radius: 100px; display: inline-block; }

        .switch { width: 52px; height: 28px; border-radius: 100px; border: none; background: #D8DCE3;
          position: relative; cursor: pointer; flex-shrink: 0; transition: background 0.2s ease; }
        .switch.on { background: #ef4444; box-shadow: 0 4px 12px color-mix(in srgb, #ef4444 40%, transparent); }
        .switch .knob { position: absolute; top: 3px; left: 3px; width: 22px; height: 22px; border-radius: 50%;
          background: #fff; transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 1px 2px rgba(0,0,0,0.15); }
        .switch.on .knob { transform: translateX(24px); }

        .maint-spinner { width: 14px; height: 14px; border: 2px solid #ef444430; border-top-color: #ef4444; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>  );
}
