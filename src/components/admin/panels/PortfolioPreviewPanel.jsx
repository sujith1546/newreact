import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useSiteStatus } from '../../SiteDisabledGate';
import { Monitor, Tablet, Smartphone, RefreshCw, ExternalLink, Eye, Lock, Wrench, ShieldAlert } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// PORTFOLIO PREVIEW PANEL
//
// Purpose: Lets the admin see the portfolio via an iframe inside the admin
// dashboard — even when maintenance or site-lock is active. This is the ONLY
// place the admin can preview the live portfolio when the public URL is locked.
//
// How bypass works:
//   1. Before rendering the iframe, we write a time-limited token into
//      sessionStorage under the key 'pcms_admin_preview_bypass'.
//   2. The iframe loads /?admin_preview=1
//   3. SiteDisabledGate checks sessionStorage for this key on load. If the
//      token is present and not expired, the gate bypasses the lock overlay.
//   4. The token auto-expires after 5 minutes; refreshing renews it.
//
// NOTE: This only bypasses the CLIENT-SIDE lock overlay. Supabase data remains
// public — this just removes the maintenance/disabled UI screen inside iframe.
// ─────────────────────────────────────────────────────────────────────────────

const PREVIEW_TOKEN_KEY = 'pcms_admin_preview_bypass';
const TOKEN_TTL_MS      = 5 * 60 * 1000; // 5 minutes

function injectPreviewToken() {
  const token   = `preview_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  const expires = Date.now() + TOKEN_TTL_MS;
  sessionStorage.setItem(PREVIEW_TOKEN_KEY, JSON.stringify({ token, expires }));
  return token;
}

const VIEWPORTS = [
  { id: 'desktop',  label: 'Desktop',  Icon: Monitor,    width: '100%',  height: '100%'  },
  { id: 'tablet',   label: 'Tablet',   Icon: Tablet,     width: '768px', height: '1024px' },
  { id: 'mobile',   label: 'Mobile',   Icon: Smartphone, width: '390px', height: '844px'  },
];

export default function PortfolioPreviewPanel() {
  const status       = useSiteStatus();
  const iframeRef    = useRef(null);
  const [viewport,   setViewport]   = useState('desktop');
  const [loading,    setLoading]    = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [previewUrl, setPreviewUrl] = useState('');

  const isLocked = status.siteDisabled || status.maintenance;
  const lockType = status.siteDisabled ? 'disabled' : status.maintenance ? 'maintenance' : null;

  const buildPreviewUrl = useCallback(() => {
    injectPreviewToken();
    return `${window.location.origin}/?admin_preview=1&_t=${Date.now()}`;
  }, []);

  useEffect(() => {
    setLoading(true);
    setPreviewUrl(buildPreviewUrl());
  }, [refreshKey, buildPreviewUrl]);

  const handleIframeLoad = () => {
    setLoading(false);
    // Also send postMessage so the inner gate can verify via message event
    try {
      const stored = JSON.parse(sessionStorage.getItem(PREVIEW_TOKEN_KEY) || '{}');
      iframeRef.current?.contentWindow?.postMessage(
        { type: 'PCMS_ADMIN_PREVIEW', token: stored.token, expires: stored.expires },
        window.location.origin
      );
    } catch (_) {}
  };

  const handleRefresh = () => {
    setLoading(true);
    setRefreshKey(k => k + 1);
  };

  const handleOpenExternal = () => {
    injectPreviewToken();
    window.open('/?admin_preview=1', '_blank', 'noopener');
  };

  const vp = VIEWPORTS.find(v => v.id === viewport) || VIEWPORTS[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 0, overflow: 'hidden', padding: '0 0 0 0' }}>

      {/* ── Lock Status Banner ── */}
      {isLocked ? (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 16px', marginBottom: 12,
          background: lockType === 'disabled' ? 'rgba(196,67,47,0.06)' : 'rgba(245,158,11,0.06)',
          border: `1px solid ${lockType === 'disabled' ? 'rgba(196,67,47,0.2)' : 'rgba(245,158,11,0.2)'}`,
          borderRadius: 8, fontSize: 12, fontWeight: 500, flexShrink: 0,
          color: lockType === 'disabled' ? '#92400E' : '#92400E',
        }}>
          {lockType === 'disabled'
            ? <ShieldAlert size={14} color="#C4432F" />
            : <Wrench size={14} color="#B45309" />}
          <span style={{ color: lockType === 'disabled' ? '#C4432F' : '#B45309' }}>
            <strong>{lockType === 'disabled' ? 'Site Disabled' : 'Maintenance Active'}</strong>
            {' '}— Public visitors see the lock screen. You are viewing via admin preview access.
          </span>
        </div>
      ) : (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 16px', marginBottom: 12,
          background: 'rgba(16,185,129,0.05)',
          border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: 8, fontSize: 12, fontWeight: 500, flexShrink: 0,
        }}>
          <Eye size={14} color="#10B981" />
          <span style={{ color: '#065F46' }}>
            <strong>Site is live</strong> — visitors can see your portfolio normally.
          </span>
        </div>
      )}

      {/* ── Browser Toolbar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 12px',
        background: 'var(--pcms-panel, #FFFFFF)',
        border: '1px solid var(--pcms-line, #E7E9EE)',
        borderRadius: '8px 8px 0 0',
        flexShrink: 0, gap: 12,
      }}>
        {/* Viewport switcher */}
        <div style={{
          display: 'flex', gap: 2,
          background: 'var(--pcms-panel-2, #F7F8FA)',
          padding: 3, borderRadius: 7,
          border: '1px solid var(--pcms-line, #E7E9EE)',
        }}>
          {VIEWPORTS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setViewport(id)}
              title={label}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '5px 10px', borderRadius: 5, border: 'none', cursor: 'pointer',
                fontSize: 11, fontWeight: 500,
                background: viewport === id ? 'var(--pcms-panel, #FFFFFF)' : 'transparent',
                color: viewport === id ? 'var(--pcms-text, #0F1626)' : 'var(--pcms-muted, #7C8494)',
                boxShadow: viewport === id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={13} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* URL bar */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--pcms-panel-2, #F7F8FA)',
          border: '1px solid var(--pcms-line, #E7E9EE)',
          borderRadius: 6, padding: '6px 10px',
          fontSize: 11, color: 'var(--pcms-muted, #7C8494)', fontFamily: 'monospace',
          minWidth: 0, overflow: 'hidden',
        }}>
          {isLocked
            ? <Lock size={11} color="#C4432F" />
            : <Eye size={11} color="#10B981" />}
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
            {window.location.origin}/
            {isLocked && <span style={{ color: '#C4432F', marginLeft: 4 }}>[admin preview]</span>}
          </span>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button
            onClick={handleRefresh}
            title="Refresh preview"
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '6px 10px', borderRadius: 6,
              border: '1px solid var(--pcms-line, #E7E9EE)',
              background: 'var(--pcms-panel, #FFFFFF)',
              color: 'var(--pcms-text, #0F1626)',
              cursor: 'pointer', fontSize: 11, fontWeight: 500,
            }}
          >
            <RefreshCw
              size={12}
              style={{ animation: loading ? 'preview-spin 0.9s linear infinite' : 'none' }}
            />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleOpenExternal}
            title="Open in new browser tab with bypass active"
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '6px 10px', borderRadius: 6,
              border: 'none',
              background: '#8B5CF6',
              color: '#fff',
              cursor: 'pointer', fontSize: 11, fontWeight: 500,
            }}
          >
            <ExternalLink size={12} />
            <span>Open Tab</span>
          </button>
        </div>
      </div>

      {/* ── Iframe Viewport ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: viewport === 'desktop' ? 'stretch' : 'flex-start',
        justifyContent: 'center',
        background: viewport === 'desktop' ? 'transparent' : 'var(--pcms-panel-2, #EBEBEB)',
        border: '1px solid var(--pcms-line, #E7E9EE)',
        borderTop: 'none',
        borderRadius: '0 0 8px 8px',
        overflow: viewport === 'desktop' ? 'hidden' : 'auto',
        position: 'relative',
        padding: viewport === 'desktop' ? 0 : '24px',
        minHeight: 0,
      }}>
        {loading && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            background: 'var(--pcms-panel, #FFFFFF)',
            flexDirection: 'column', gap: 12, zIndex: 2,
          }}>
            <div style={{
              width: 28, height: 28,
              border: '3px solid var(--pcms-line, #E7E9EE)',
              borderTopColor: '#8B5CF6',
              borderRadius: '50%',
              animation: 'preview-spin 0.8s linear infinite',
            }} />
            <span style={{ fontSize: 12, color: 'var(--pcms-muted, #7C8494)' }}>
              Loading portfolio preview…
            </span>
          </div>
        )}

        <div style={{
          width:      vp.width,
          height:     viewport === 'desktop' ? '100%' : 'auto',
          minHeight:  viewport !== 'desktop' ? vp.height : 'unset',
          flexShrink: 0,
          display:    'flex',
          flexDirection: 'column',
          boxShadow:  viewport !== 'desktop' ? '0 8px 48px rgba(0,0,0,0.22)' : 'none',
          borderRadius: viewport !== 'desktop' ? 14 : 0,
          overflow:   'hidden',
          background: '#fff',
          transition: 'width 0.3s ease',
        }}>
          {previewUrl && (
            <iframe
              key={refreshKey}
              ref={iframeRef}
              src={previewUrl}
              onLoad={handleIframeLoad}
              title="Portfolio Preview"
              style={{
                flex: 1,
                width: '100%',
                height: viewport === 'desktop' ? '100%' : vp.height,
                minHeight: viewport === 'desktop' ? 0 : vp.height,
                border: 'none',
                display: 'block',
              }}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
            />
          )}
        </div>
      </div>

      <style>{`
        @keyframes preview-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
