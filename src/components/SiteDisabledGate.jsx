import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { supabase, safeRemoveChannel } from '../lib/supabaseClient';
import { Lock, ArrowRight, Activity, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import MaintenancePage from './MaintenancePage';
import '../styles/maintenance.css';

const BYPASS_KEY    = 'maint_bypass_token';
const BYPASS_SECRET = import.meta.env.VITE_MAINTENANCE_BYPASS_SECRET || 'preview123';

// ─────────────────────────────────────────────────────────────────────────────
// ONE unified hook — reads site_settings ONCE for both modes.
// Both maintenance_enabled and site_disabled come from the same Supabase row,
// so there is no double-fetch and no nesting dependency.
// ─────────────────────────────────────────────────────────────────────────────
export function useSiteStatus() {
  const [status, setStatus] = useState(() => {
    if (typeof window === 'undefined') {
      return {
        loading: false,
        siteDisabled: false, disabledReason: '', disabledAt: null,
        maintenance: false,  maintAt: null, maintEta: 20, maintMsg: '',
      };
    }
    return {
      loading:       false,
      siteDisabled:  localStorage.getItem('pcms_site_disabled')  === 'true',
      disabledReason:localStorage.getItem('pcms_site_disabled_reason') || 'Access to this website has been disabled by the administrator.',
      disabledAt:    localStorage.getItem('pcms_site_disabled_at')     || null,
      maintenance:   localStorage.getItem('pcms_maint_enabled')  === 'true',
      maintAt:       localStorage.getItem('pcms_maint_at')        || null,
      maintEta:      Number(localStorage.getItem('pcms_maint_eta'))    || 20,
      maintMsg:      localStorage.getItem('pcms_maint_msg')       || '',
    };
  });

  useEffect(() => {
    // Fast sync — reads localStorage synchronously, no Supabase round-trip.
    // Used for same-browser storage/pcms_lock_changed events.
    const syncLocal = () => setStatus({
      loading:        false,
      siteDisabled:   localStorage.getItem('pcms_site_disabled')  === 'true',
      disabledReason: localStorage.getItem('pcms_site_disabled_reason') || 'Access to this website has been disabled by the administrator.',
      disabledAt:     localStorage.getItem('pcms_site_disabled_at')     || null,
      maintenance:    localStorage.getItem('pcms_maint_enabled')  === 'true',
      maintAt:        localStorage.getItem('pcms_maint_at')        || null,
      maintEta:       Number(localStorage.getItem('pcms_maint_eta'))    || 20,
      maintMsg:       localStorage.getItem('pcms_maint_msg')       || '',
    });

    // Full DB load — authoritative. Writes to localStorage then calls syncLocal.
    async function loadDB() {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('site_disabled, site_disabled_reason, site_disabled_at, maintenance_enabled, maintenance_enabled_at, maintenance_eta, maintenance_message')
          .limit(1).single();
        if (!data) return;
        localStorage.setItem('pcms_site_disabled',        String(!!data.site_disabled));
        localStorage.setItem('pcms_site_disabled_reason', data.site_disabled_reason  || '');
        localStorage.setItem('pcms_site_disabled_at',     data.site_disabled_at      || '');
        localStorage.setItem('pcms_maint_enabled',        String(!!data.maintenance_enabled));
        localStorage.setItem('pcms_maint_at',             data.maintenance_enabled_at || '');
        localStorage.setItem('pcms_maint_eta',            String(data.maintenance_eta ?? 20));
        localStorage.setItem('pcms_maint_msg',            data.maintenance_message   || '');
        syncLocal();
      } catch (_) { /* leave cached localStorage value */ }
    }

    loadDB();

    // Same-browser events
    window.addEventListener('storage',            syncLocal);
    window.addEventListener('pcms_lock_changed',  syncLocal);
    document.addEventListener('visibilitychange', loadDB);

    // Supabase Realtime — cross-browser / Vercel production.
    // Unique channel name per visitor so everyone gets the event independently.
    const channelName = `site_status_${Math.random().toString(36).slice(2, 10)}`;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'site_settings' }, (payload) => {
        const row = payload?.new;
        if (!row) return;
        localStorage.setItem('pcms_site_disabled',        String(!!row.site_disabled));
        localStorage.setItem('pcms_site_disabled_reason', row.site_disabled_reason   || '');
        localStorage.setItem('pcms_site_disabled_at',     row.site_disabled_at       || '');
        localStorage.setItem('pcms_maint_enabled',        String(!!row.maintenance_enabled));
        localStorage.setItem('pcms_maint_at',             row.maintenance_enabled_at  || '');
        localStorage.setItem('pcms_maint_eta',            String(row.maintenance_eta ?? 20));
        localStorage.setItem('pcms_maint_msg',            row.maintenance_message     || '');
        // Direct setStatus — works cross-browser without relying on localStorage read latency
        setStatus({
          loading:        false,
          siteDisabled:   !!row.site_disabled,
          disabledReason: row.site_disabled_reason || 'Access to this website has been disabled by the administrator.',
          disabledAt:     row.site_disabled_at     || null,
          maintenance:    !!row.maintenance_enabled,
          maintAt:        row.maintenance_enabled_at || null,
          maintEta:       row.maintenance_eta ?? 20,
          maintMsg:       row.maintenance_message || '',
        });
      })
      .subscribe();

    // Polling fallback — safety net if Supabase Realtime is not enabled on site_settings table.
    const poll = setInterval(loadDB, 10_000);

    return () => {
      window.removeEventListener('storage',            syncLocal);
      window.removeEventListener('pcms_lock_changed',  syncLocal);
      document.removeEventListener('visibilitychange', loadDB);
      clearInterval(poll);
      safeRemoveChannel(channel);
    };
  }, []);

  return status;
}

// ─────────────────────────────────────────────────────────────────────────────
// FULL LOCK overlay (SiteDisabled)
// ─────────────────────────────────────────────────────────────────────────────
function SiteDisabledOverlay({ reason, disabledAt }) {
  const [ping, setPing] = useState(14);

  useEffect(() => {
    document.documentElement.classList.add('site-disabled-lock-active');
    document.body.classList.add('site-disabled-lock-active');
    const handleContextMenu = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['I','i','J','j','C','c'].includes(e.key)) || (e.ctrlKey && ['U','u','S','s'].includes(e.key))) {
        e.preventDefault(); e.stopPropagation();
      }
    };
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    const observer = new MutationObserver(() => {
      if (!document.body.classList.contains('site-disabled-lock-active')) document.body.classList.add('site-disabled-lock-active');
      if (!document.documentElement.classList.contains('site-disabled-lock-active')) document.documentElement.classList.add('site-disabled-lock-active');
    });
    try { observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'style'] }); } catch (_) {}
    const interval = setInterval(() => setPing(Math.floor(11 + Math.random() * 8)), 3000);
    return () => {
      try { observer.disconnect(); } catch (_) {}
      document.documentElement.classList.remove('site-disabled-lock-active');
      document.body.classList.remove('site-disabled-lock-active');
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(interval);
    };
  }, []);

  const content = (
    <div className="pcms-site-disabled-overlay">
      <style>{`
        html.site-disabled-lock-active, body.site-disabled-lock-active {
          overflow: hidden !important; height: 100% !important; width: 100% !important;
          margin: 0 !important; padding: 0 !important; position: relative !important;
        }
        .pcms-site-disabled-overlay {
          position: fixed !important;
          top: 0 !important; left: 0 !important;
          right: 0 !important; bottom: 0 !important;
          width: 100% !important; height: 100% !important;
          min-width: 100vw !important; min-height: 100vh !important;
          background-color: #F8FAFC !important;
          background-image: radial-gradient(#CBD5E1 1.2px, transparent 1.2px) !important;
          background-size: 24px 24px !important;
          color: #0F1626 !important; font-family: 'Inter', sans-serif !important;
          display: flex !important; align-items: center !important; justify-content: center !important;
          padding: 24px !important; box-sizing: border-box !important; z-index: 2147483647 !important;
        }
        body.site-disabled-lock-active > *:not(.pcms-site-disabled-overlay) { display: none !important; }
      `}</style>
      <div style={{ maxWidth: 540, width: '100%', background: '#FFF', border: '1px solid #E7E9EE', borderRadius: 12, padding: '36px 32px', boxShadow: '0 4px 24px rgba(15,22,38,0.06)', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, background: 'rgba(196,67,47,0.08)', border: '1px solid rgba(196,67,47,0.2)', color: '#C4432F', fontSize: 11, fontWeight: 600 }}>
            <Lock size={12} /><span>WEBSITE DISABLED BY ADMINISTRATOR</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#7C8494', fontFamily: "'IBM Plex Mono', monospace" }}>
            <Activity size={12} color="#1BA64C" /><span>{ping}ms</span>
          </div>
        </div>
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 600, color: '#0F1626', margin: '0 0 8px', letterSpacing: '-0.3px' }}>Access Suspended</h1>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: '#7C8494', margin: 0 }}>{reason || 'This portfolio website has been temporarily disabled by the system administrator.'}</p>
        </div>
        <div style={{ background: '#F7F8FA', border: '1px solid #E7E9EE', borderRadius: 8, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
          {[['Security Mode', 'ENFORCED_LOCK', '#C4432F'], ['Lock Timestamp', disabledAt ? new Date(disabledAt).toUTCString() : new Date().toUTCString(), '#0F1626'], ['Protocol', 'TLS 1.3 Encrypted', '#1BA64C']].map(([k, v, c]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', color: '#7C8494' }}>
              <span>{k}</span><span style={{ color: c, fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace" }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid #F0F1F4', paddingTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, color: '#AEB4BF' }}>Portfolio CMS Security System</span>
          <button onClick={() => window.dispatchEvent(new CustomEvent('open-admin-login'))} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500, color: '#0F1626', textDecoration: 'none', padding: '6px 12px', borderRadius: 6, background: '#F7F8FA', border: '1px solid #E7E9EE', cursor: 'pointer' }}>
            <span>Admin Sign In</span><ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
  return createPortal(content, document.body);
}

// ─────────────────────────────────────────────────────────────────────────────
// MAINTENANCE overlay
// ─────────────────────────────────────────────────────────────────────────────
function MaintenanceOverlay({ status }) {
  useEffect(() => {
    document.documentElement.classList.add('site-maint-lock-active');
    document.body.classList.add('site-maint-lock-active');
    const handleContextMenu = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['I','i','J','j','C','c'].includes(e.key)) || (e.ctrlKey && ['U','u','S','s'].includes(e.key))) {
        e.preventDefault(); e.stopPropagation();
      }
    };
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    const observer = new MutationObserver(() => {
      if (!document.body.classList.contains('site-maint-lock-active')) document.body.classList.add('site-maint-lock-active');
      if (!document.documentElement.classList.contains('site-maint-lock-active')) document.documentElement.classList.add('site-maint-lock-active');
    });
    try { observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'style'] }); } catch (_) {}
    return () => {
      try { observer.disconnect(); } catch (_) {}
      document.documentElement.classList.remove('site-maint-lock-active');
      document.body.classList.remove('site-maint-lock-active');
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const content = (
    <div className="pcms-maint-overlay">
      <style>{`
        html.site-maint-lock-active, body.site-maint-lock-active {
          overflow: hidden !important; height: 100% !important; width: 100% !important;
          margin: 0 !important; padding: 0 !important; position: relative !important;
        }
        .pcms-maint-overlay {
          position: fixed !important;
          top: 0 !important; left: 0 !important;
          right: 0 !important; bottom: 0 !important;
          width: 100% !important; height: 100% !important;
          min-width: 100vw !important; min-height: 100vh !important;
          background-color: #F7F7F5 !important; z-index: 2147483647 !important; overflow-y: auto !important;
        }
        body.site-maint-lock-active > *:not(.pcms-maint-overlay) { display: none !important; }
      `}</style>
      <MaintenancePage status={{ enabled: status.maintenance, enabledAt: status.maintAt, etaMinutes: status.maintEta, message: status.maintMsg }} />
    </div>
  );
  return createPortal(content, document.body);
}

// ─────────────────────────────────────────────────────────────────────────────
// UNIFIED GATE  — replaces both <SiteDisabledGate> and <MaintenanceGate>
// Mount this ONCE in App.jsx wrapping everything.
//
// IMPORTANT DESIGN DECISION:
// When maintenance or site-lock is active, ALL public visitors see the lock
// screen — including logged-in admins. There is NO admin bypass on the public
// URL. Admins who need to view the portfolio while lock is active must use the
// "Portfolio Preview" tab inside /admin/dashboard.
//
// Bypass hierarchy:
//   1. isAdminRoute       — /admin/* routes are never blocked (dashboard works)
//   2. hasBypassToken     — ?preview=<secret> URL token (emergency access)
//   3. hasAdminPreview    — sessionStorage token injected by PortfolioPreviewPanel
//                           (iframe bypass — only works when loaded inside admin)
// ─────────────────────────────────────────────────────────────────────────────
const ADMIN_PREVIEW_SS_KEY = 'pcms_admin_preview_bypass';

function checkAdminPreviewToken() {
  if (typeof window === 'undefined') return false;
  // Only activate when the ?admin_preview=1 param is present (set by PortfolioPreviewPanel iframe src)
  if (!new URLSearchParams(window.location.search).has('admin_preview')) return false;
  try {
    const raw = sessionStorage.getItem(ADMIN_PREVIEW_SS_KEY);
    if (!raw) return false;
    const { expires } = JSON.parse(raw);
    // Token must not be expired
    if (typeof expires === 'number' && Date.now() < expires) return true;
  } catch (_) {}
  return false;
}

export function SiteStatusGate({ children }) {
  const status = useSiteStatus();
  const checkedBypass   = useRef(false);
  const [adminPreview, setAdminPreview] = useState(() => checkAdminPreviewToken());

  // Listen for postMessage from the admin dashboard parent (secondary verification)
  useEffect(() => {
    const handle = (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== 'PCMS_ADMIN_PREVIEW') return;
      const { expires } = event.data;
      if (typeof expires === 'number' && Date.now() < expires) {
        setAdminPreview(true);
      }
    };
    window.addEventListener('message', handle);
    return () => window.removeEventListener('message', handle);
  }, []);

  if (!checkedBypass.current && typeof window !== 'undefined') {
    const token = new URLSearchParams(window.location.search).get('preview');
    if (token && BYPASS_SECRET && token === BYPASS_SECRET) localStorage.setItem(BYPASS_KEY, token);
    checkedBypass.current = true;
  }

  const hasBypassToken = typeof window !== 'undefined' && localStorage.getItem(BYPASS_KEY) === BYPASS_SECRET && !!BYPASS_SECRET;
  const isAdminRoute   = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
  const siteIsLocked   = status.siteDisabled || status.maintenance;

  // Admin dashboard routes are always accessible — the lock never blocks /admin/*.
  // This is necessary so the admin can still log in and manage the site.
  if (isAdminRoute) return children;

  // URL bypass token — for emergency preview access (no admin session required).
  if (hasBypassToken) return children;

  // Admin preview bypass — only active when ?admin_preview=1 is in the URL AND
  // a valid (non-expired) token exists in sessionStorage (set by PortfolioPreviewPanel).
  if (adminPreview) return children;

  // Site is open — render immediately with no delay.
  if (!siteIsLocked) return children;

  // Site is locked — show appropriate overlay to ALL visitors (including admins).
  // Admins must use the Portfolio Preview tab inside /admin/dashboard instead.
  if (status.siteDisabled) return <SiteDisabledOverlay reason={status.disabledReason} disabledAt={status.disabledAt} />;
  if (status.maintenance)  return <MaintenanceOverlay status={status} />;

  return children;
}


// ─────────────────────────────────────────────────────────────────────────────
// Backward-compat re-exports so existing imports don't break
// ─────────────────────────────────────────────────────────────────────────────
export function MaintenanceGate({ children }) { return <SiteStatusGate>{children}</SiteStatusGate>; }
export default function SiteDisabledGate({ children }) { return <SiteStatusGate>{children}</SiteStatusGate>; }
export { MaintenancePage };
export function MaintenanceOverlayExport(props) { return <MaintenanceOverlay {...props} />; }
export function useMaintenanceStatus() {
  const s = useSiteStatus();
  return { loading: false, enabled: s.maintenance, enabledAt: s.maintAt, etaMinutes: s.maintEta, message: s.maintMsg };
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN PREVIEW BYPASS TOKEN
// Used exclusively by PortfolioPreviewPanel inside the admin dashboard.
// The panel sets this key in localStorage before rendering the iframe so the
// iframe's gate allows the preview through without the admin bypass being on.
// ─────────────────────────────────────────────────────────────────────────────
export const ADMIN_PREVIEW_KEY = 'pcms_admin_preview_bypass';
