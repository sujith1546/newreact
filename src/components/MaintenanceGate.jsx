import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { supabase, safeRemoveChannel } from '../lib/supabaseClient';
import { Wrench, ArrowRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../styles/maintenance.css';

const BYPASS_KEY = 'maint_bypass_token';
const BYPASS_SECRET = import.meta.env.VITE_MAINTENANCE_BYPASS_SECRET || 'preview123';

// =================================================================
// 1. REALTIME HOOK
// =================================================================
export function useMaintenanceStatus() {
  const getInitialStatus = () => {
    if (typeof window === 'undefined') return { loading: false, enabled: false, enabledAt: null, etaMinutes: 20, message: '' };
    const localEnabled = localStorage.getItem('pcms_maint_enabled') === 'true';
    const localAt = localStorage.getItem('pcms_maint_at') || null;
    const localEta = Number(localStorage.getItem('pcms_maint_eta')) || 20;
    const localMsg = localStorage.getItem('pcms_maint_msg') || '';
    return {
      loading: false,
      enabled: localEnabled,
      enabledAt: localAt,
      etaMinutes: localEta,
      message: localMsg,
    };
  };

  const [status, setStatus] = useState(getInitialStatus);

  useEffect(() => {
    let channel;

    async function loadInitial() {
      const localEnabled = localStorage.getItem('pcms_maint_enabled');
      const localAt = localStorage.getItem('pcms_maint_at');
      const localEta = localStorage.getItem('pcms_maint_eta');
      const localMsg = localStorage.getItem('pcms_maint_msg');

      const { data } = await supabase.from('site_settings').select('*').limit(1).single();

      if (data) {
        const isEnabled = data.maintenance_enabled !== undefined && data.maintenance_enabled !== null 
          ? !!data.maintenance_enabled 
          : (localEnabled === 'true');

        setStatus({
          loading: false,
          enabled: isEnabled,
          enabledAt: data.maintenance_enabled_at || localAt || null,
          etaMinutes: data.maintenance_eta ?? Number(localEta) ?? 20,
          message: data.maintenance_message ?? localMsg ?? '',
        });
      } else {
        setStatus({
          loading: false,
          enabled: localEnabled === 'true',
          enabledAt: localAt || null,
          etaMinutes: Number(localEta) || 20,
          message: localMsg || '',
        });
      }
    }

    loadInitial();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadInitial();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('storage', handleVisibilityChange);

    const channelName = `site_settings_maint_${Math.random().toString(36).substring(7)}`;
    channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'site_settings' },
        (payload) => {
          const row = payload?.new;
          if (row) {
            const isEnabled = !!row.maintenance_enabled;
            const at = row.maintenance_enabled_at || null;
            const eta = row.maintenance_eta || 20;
            const msg = row.maintenance_message || '';

            localStorage.setItem('pcms_maint_enabled', String(isEnabled));
            if (at) localStorage.setItem('pcms_maint_at', String(at));
            localStorage.setItem('pcms_maint_eta', String(eta));
            localStorage.setItem('pcms_maint_msg', String(msg));

            setStatus({
              loading: false,
              enabled: isEnabled,
              enabledAt: at,
              etaMinutes: eta,
              message: msg,
            });
          } else {
            loadInitial();
          }
        }
      )
      .subscribe();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleVisibilityChange);
      safeRemoveChannel(channel);
    };
  }, []);

  return status;
}

import MaintenancePage from './MaintenancePage';

export { MaintenancePage };

// =================================================================
// 2. MAINTENANCE OVERLAY (PORTAL MOUNTED ON DOCUMENT.BODY)
// =================================================================
export function MaintenanceOverlay({ status }) {
  useEffect(() => {
    document.documentElement.classList.add('site-maint-lock-active');
    document.body.classList.add('site-maint-lock-active');

    const handleContextMenu = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['I','i','J','j','C','c'].includes(e.key)) ||
        (e.ctrlKey && ['U','u','S','s'].includes(e.key))
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    const observer = new MutationObserver(() => {
      if (!document.body.classList.contains('site-maint-lock-active')) {
        document.body.classList.add('site-maint-lock-active');
      }
      if (!document.documentElement.classList.contains('site-maint-lock-active')) {
        document.documentElement.classList.add('site-maint-lock-active');
      }
    });

    try {
      observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'style'] });
    } catch (err) {}

    return () => {
      try { observer.disconnect(); } catch (err) {}
      document.documentElement.classList.remove('site-maint-lock-active');
      document.body.classList.remove('site-maint-lock-active');
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const content = (
    <div className="pcms-maint-overlay">
      <style>{`
        html.site-maint-lock-active,
        body.site-maint-lock-active {
          overflow: hidden !important;
          height: 100% !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        .pcms-maint-overlay {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          min-width: 100% !important;
          min-height: 100% !important;
          background-color: #F7F7F5 !important;
          z-index: 2147483647 !important;
          overflow-y: auto !important;
        }

        body.site-maint-lock-active [class*="island"],
        body.site-maint-lock-active [class*="Island"],
        body.site-maint-lock-active [class*="banner"],
        body.site-maint-lock-active [class*="Banner"],
        body.site-maint-lock-active nav,
        body.site-maint-lock-active header,
        body.site-maint-lock-active footer,
        body.site-maint-lock-active .pwa-install-prompt {
          display: none !important;
        }
      `}</style>
      <MaintenancePage status={status} />
    </div>
  );

  return createPortal(content, document.body);
}

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

  const isAdmin = !!session?.user;
  const isAdminRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');

  if (status.loading || session === undefined) return null;

  if (status.enabled && !isAdmin && !hasBypassToken && !isAdminRoute) {
    return <MaintenanceOverlay status={status} />;
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
    const nowAt = nextEnabled && !enabled ? new Date().toISOString() : (!nextEnabled ? null : enabledAt);
    const finalEta = overrides.etaMinutes ?? Number(etaMinutes);
    const finalMsg = overrides.message !== undefined ? overrides.message : message;

    localStorage.setItem('pcms_maint_enabled', String(nextEnabled));
    localStorage.setItem('pcms_maint_at', nowAt || '');
    localStorage.setItem('pcms_maint_eta', String(finalEta));
    localStorage.setItem('pcms_maint_msg', String(finalMsg));
    window.dispatchEvent(new Event('storage'));

    const payload = {
      maintenance_enabled: nextEnabled,
      maintenance_eta: finalEta,
      maintenance_message: finalMsg,
      ...(nextEnabled && !enabled ? { maintenance_enabled_at: nowAt } : {}),
      ...(!nextEnabled ? { maintenance_enabled_at: null } : {}),
    };

    if (rowId) {
      await supabase.from('site_settings').update(payload).eq('id', rowId);
    }
    setTimeout(() => setSaving(false), 500);
    setEnabled(nextEnabled);
    if (nowAt !== undefined) setEnabledAt(nowAt);
  }

  const handleBlur = (field, val) => {
    save(enabled, { [field]: val });
  };

  if (loading) return null;

  return (
    <div className="pcms-maint-card">
      <div className="pcms-maint-row">
        <div>
          <h4 style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 600, color: 'var(--pcms-text, #0F1626)', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Space Grotesk, sans-serif' }}>
            Maintenance Mode
            {saving && <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--pcms-danger, #C4432F)', display: 'flex', alignItems: 'center', gap: 4 }}><div className="maint-spinner" /> Saving...</span>}
          </h4>
          <p className="setting-desc">
            Locks the public site with a "be right back" screen. Admin dashboard stays accessible.
          </p>
          {enabled && enabledAt && (
            <p className="setting-meta">
              Active since{' '}
              {new Date(enabledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
        <button
          type="button"
          className={`pcms-switch ${enabled ? 'on' : ''}`}
          onClick={(e) => { e.preventDefault(); save(!enabled); }}
          disabled={saving}
          aria-pressed={enabled}
        >
          <span className="knob" />
        </button>
      </div>

      {enabled && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--pcms-line, #E7E9EE)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--pcms-muted, #7C8494)', textTransform: 'uppercase' }}>Estimated Time (Minutes)</label>
            <input
              type="number"
              min={1}
              value={etaMinutes}
              onChange={(e) => setEtaMinutes(e.target.value)}
              onBlur={(e) => handleBlur('etaMinutes', e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--pcms-line, #E7E9EE)', background: 'var(--pcms-panel, #FFFFFF)', color: 'var(--pcms-text, #0F1626)', fontSize: 12, outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--pcms-muted, #7C8494)', textTransform: 'uppercase' }}>Custom Message (Optional)</label>
            <textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onBlur={(e) => handleBlur('message', e.target.value)}
              placeholder="e.g. We are upgrading the database..."
              style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--pcms-line, #E7E9EE)', background: 'var(--pcms-panel, #FFFFFF)', color: 'var(--pcms-text, #0F1626)', fontSize: 12, outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>
        </div>
      )}

      <style>{`
        .pcms-maint-card { 
          padding: 12px 14px; 
          background: ${enabled ? 'rgba(196, 67, 47, 0.04)' : 'var(--pcms-panel, #FFFFFF)'}; 
          border-radius: 6px; 
          border: 1px solid ${enabled ? 'rgba(196, 67, 47, 0.3)' : 'var(--pcms-line, #E7E9EE)'};
          position: relative;
          overflow: hidden;
          max-width: 480px;
        }
        .pcms-maint-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
        .setting-desc { font-size: 11px; color: var(--pcms-muted, #7C8494); margin: 2px 0 0; line-height: 1.4; }
        .setting-meta { font-size: 10px; color: var(--pcms-danger, #C4432F); margin: 6px 0 0; font-weight: 500; background: rgba(196, 67, 47, 0.12); padding: 2px 8px; border-radius: 20px; display: inline-block; }

        .pcms-switch { width: 34px; height: 18px; border-radius: 10px; border: none; background: var(--pcms-line, #E7E9EE);
          position: relative; cursor: pointer; flex-shrink: 0; transition: background 0.2s ease; }
        .pcms-switch.on { background: var(--pcms-danger, #C4432F); }
        .pcms-switch .knob { position: absolute; top: 2px; left: 2px; width: 14px; height: 14px; border-radius: 50%;
          background: #fff; transition: left 0.2s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 1px 3px rgba(0,0,0,0.15); }
        .pcms-switch.on .knob { left: 18px; }

        .maint-spinner { width: 12px; height: 12px; border: 2px solid rgba(196, 67, 47, 0.3); border-top-color: var(--pcms-danger, #C4432F); border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>  );
}
