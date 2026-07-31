import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { supabase, safeRemoveChannel } from '../lib/supabaseClient';
import { Lock, ShieldAlert, Terminal, AlertTriangle, ArrowRight, Activity, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export function useSiteDisabledStatus() {
  const getInitialStatus = () => {
    if (typeof window === 'undefined') return { loading: false, disabled: false, disabledAt: null, reason: '' };
    const localDisabled = localStorage.getItem('pcms_site_disabled') === 'true';
    const localReason = localStorage.getItem('pcms_site_disabled_reason') || '';
    const localAt = localStorage.getItem('pcms_site_disabled_at') || null;
    return {
      loading: false,
      disabled: localDisabled,
      disabledAt: localAt,
      reason: localReason || 'Access to this website has been disabled by the administrator.',
    };
  };

  const [status, setStatus] = useState(getInitialStatus);

  useEffect(() => {
    let channel;

    async function loadInitial() {
      const localDisabled = localStorage.getItem('pcms_site_disabled');
      const localReason = localStorage.getItem('pcms_site_disabled_reason');
      const localAt = localStorage.getItem('pcms_site_disabled_at');

      const { data } = await supabase.from('site_settings').select('*').limit(1).single();

      const isDisabled = (data && data.site_disabled !== undefined && data.site_disabled !== null) 
        ? !!data.site_disabled 
        : (localDisabled === 'true');

      const reasonMsg = (data && data.site_disabled_reason) 
        ? data.site_disabled_reason 
        : (localReason || 'Access to this website has been disabled by the administrator.');

      const disabledAtTime = (data && data.site_disabled_at) 
        ? data.site_disabled_at 
        : (localAt || null);

      setStatus({
        loading: false,
        disabled: isDisabled,
        disabledAt: disabledAtTime,
        reason: reasonMsg,
      });
    }

    loadInitial();

    const handleSync = () => loadInitial();
    document.addEventListener('visibilitychange', handleSync);
    window.addEventListener('storage', handleSync);
    window.addEventListener('pcms_lock_changed', handleSync);

    const channelName = `site_settings_lock_${Math.random().toString(36).substring(7)}`;
    channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'site_settings' },
        (payload) => {
          const row = payload?.new;
          if (row && row.site_disabled !== undefined) {
            const nextDisabled = !!row.site_disabled;
            const nextReason = row.site_disabled_reason || 'Access to this website has been disabled by the administrator.';
            const nextAt = row.site_disabled_at || null;

            localStorage.setItem('pcms_site_disabled', String(nextDisabled));
            if (nextReason) localStorage.setItem('pcms_site_disabled_reason', String(nextReason));
            if (nextAt) localStorage.setItem('pcms_site_disabled_at', String(nextAt));

            setStatus({
              loading: false,
              disabled: nextDisabled,
              disabledAt: nextAt,
              reason: nextReason,
            });
          } else {
            loadInitial();
          }
        }
      )
      .subscribe();

    return () => {
      document.removeEventListener('visibilitychange', handleSync);
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('pcms_lock_changed', handleSync);
      safeRemoveChannel(channel);
    };
  }, []);

  return status;
}

export function SiteDisabledPage({ reason, disabledAt }) {
  const [ping, setPing] = useState(14);

  useEffect(() => {
    document.documentElement.classList.add('site-disabled-lock-active');
    document.body.classList.add('site-disabled-lock-active');

    // Security Hardening: Block Context Menu (Right Click) and Inspect DevTools shortcuts
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

    // Anti-Tamper MutationObserver: Instantly re-enforces lock classes if someone attempts to modify DOM in DevTools
    const observer = new MutationObserver(() => {
      if (!document.body.classList.contains('site-disabled-lock-active')) {
        document.body.classList.add('site-disabled-lock-active');
      }
      if (!document.documentElement.classList.contains('site-disabled-lock-active')) {
        document.documentElement.classList.add('site-disabled-lock-active');
      }
    });

    try {
      observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'style'] });
    } catch (err) {}

    const interval = setInterval(() => {
      setPing(Math.floor(11 + Math.random() * 8));
    }, 3000);

    return () => {
      try { observer.disconnect(); } catch (err) {}
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
        html.site-disabled-lock-active,
        body.site-disabled-lock-active {
          overflow: hidden !important;
          height: 100% !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        .pcms-site-disabled-overlay {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          min-width: 100% !important;
          min-height: 100% !important;
          background-color: #F8FAFC !important;
          background-image: radial-gradient(#CBD5E1 1.2px, transparent 1.2px) !important;
          background-size: 24px 24px !important;
          background-repeat: repeat !important;
          background-position: 0 0 !important;
          color: #0F1626 !important;
          font-family: 'Inter', sans-serif !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 24px !important;
          box-sizing: border-box !important;
          z-index: 2147483647 !important;
        }

        body.site-disabled-lock-active [class*="island"],
        body.site-disabled-lock-active [class*="Island"],
        body.site-disabled-lock-active [class*="banner"],
        body.site-disabled-lock-active [class*="Banner"],
        body.site-disabled-lock-active nav,
        body.site-disabled-lock-active header,
        body.site-disabled-lock-active footer,
        body.site-disabled-lock-active .pwa-install-prompt {
          display: none !important;
        }
      `}</style>
      <div style={{
        maxWidth: 540,
        width: '100%',
        background: '#FFFFFF',
        border: '1px solid #E7E9EE',
        borderRadius: 12,
        padding: '36px 32px',
        boxShadow: '0 4px 24px rgba(15, 22, 38, 0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: 20
      }}>
        {/* Status Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            borderRadius: 20,
            background: 'rgba(196, 67, 47, 0.08)',
            border: '1px solid rgba(196, 67, 47, 0.2)',
            color: '#C4432F',
            fontSize: 11,
            fontWeight: 600
          }}>
            <Lock size={12} />
            <span>WEBSITE DISABLED BY ADMINISTRATOR</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#7C8494', fontFamily: "'IBM Plex Mono', monospace" }}>
            <Activity size={12} color="#1BA64C" />
            <span>{ping}ms</span>
          </div>
        </div>

        {/* Lock Icon & Title */}
        <div>
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 22,
            fontWeight: 600,
            color: '#0F1626',
            margin: '0 0 8px 0',
            letterSpacing: '-0.3px'
          }}>
            Access Suspended
          </h1>
          <p style={{
            fontSize: 13,
            lineHeight: 1.6,
            color: '#7C8494',
            margin: 0
          }}>
            {reason || 'This portfolio website has been temporarily disabled by the system administrator. Public viewing is currently restricted.'}
          </p>
        </div>

        {/* System Telemetry Box */}
        <div style={{
          background: '#F7F8FA',
          border: '1px solid #E7E9EE',
          borderRadius: 8,
          padding: '14px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          fontSize: 12
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#7C8494' }}>
            <span>Security Mode</span>
            <span style={{ color: '#C4432F', fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace" }}>ENFORCED_LOCK</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#7C8494' }}>
            <span>Lock Timestamp</span>
            <span style={{ color: '#0F1626', fontFamily: "'IBM Plex Mono', monospace" }}>
              {disabledAt ? new Date(disabledAt).toUTCString() : new Date().toUTCString()}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#7C8494' }}>
            <span>Protocol</span>
            <span style={{ color: '#1BA64C', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <ShieldCheck size={12} /> TLS 1.3 Encrypted
            </span>
          </div>
        </div>

        {/* Footer Admin Console Link */}
        <div style={{
          borderTop: '1px solid #F0F1F4',
          paddingTop: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: 11, color: '#AEB4BF' }}>
            Portfolio CMS Security System
          </span>
          <Link
            to="/admin/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              fontWeight: 500,
              color: '#0F1626',
              textDecoration: 'none',
              padding: '6px 12px',
              borderRadius: 6,
              background: '#F7F8FA',
              border: '1px solid #E7E9EE'
            }}
          >
            <span>Admin Sign In</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

export default function SiteDisabledGate({ children }) {
  const { loading, disabled, disabledAt, reason } = useSiteDisabledStatus();

  // Admin console routes (/admin/login, /admin/dashboard, etc) always bypass site lock
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
    return children;
  }

  if (loading) return null;
  if (disabled) return <SiteDisabledPage reason={reason} disabledAt={disabledAt} />;
  return children;
}
