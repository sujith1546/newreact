import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './CertificationPanel.css';

const ShieldIcon = () => (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const CloseIcon = () => (
  <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

const CopyIcon = () => (
  <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15V5a2 2 0 0 1 2-2h10" />
  </svg>
);

const ZoomIcon = () => (
  <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3M11 8v6M8 11h6" />
  </svg>
);

const DocIcon = () => (
  <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5" />
  </svg>
);

const ExternalIcon = () => (
  <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 17L17 7M8 7h9v9" />
  </svg>
);

/**
 * Props:
 *  cert    - one certification object (see data file), or null when closed
 *  onClose - called when the panel should close
 */
export default function CertificationPanel({ cert, onClose }) {
  const panelRef = useRef(null);
  const returnFocusRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const open = Boolean(cert);

  // Scroll lock and focus restoration for panel open/close
  useEffect(() => {
    if (!open) return;
    returnFocusRef.current = document.activeElement;
    panelRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = prevOverflow;
      returnFocusRef.current?.focus?.();
    };
  }, [open]);

  // Keyboard listener: Esc to close zoom or panel, Tab to cycle focus
  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (zoomed) {
          setZoomed(false);
        } else {
          onClose();
        }
      }
      if (e.key === 'Tab' && panelRef.current && !zoomed) {
        const focusable = panelRef.current.querySelectorAll(
          'button, a[href], [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose, zoomed]);

  if (!open) return null;

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(cert.credentialId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked: ignore */
    }
  };

  return createPortal(
    <div
      className="cv-root"
      style={{
        '--cv-accent': cert.accent || 'var(--primary-blue, #3b82f6)',
        '--cv-accent-soft': cert.accentSoft || 'rgba(59, 130, 246, 0.12)',
      }}
    >
      <div className="cv-backdrop" onClick={onClose} />

      <aside
        ref={panelRef}
        className="cv-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cv-title"
        tabIndex={-1}
      >
        <header className="cv-header">
          <div className="cv-header-left">
            <div className="cv-chip">
              <ShieldIcon />
            </div>
            <div className="cv-header-text">
              <h2 id="cv-title" className="cv-title">Certification Verification</h2>
              <p className="cv-subtitle">{cert.issuer} credential</p>
            </div>
          </div>
          <button
            type="button"
            className="cv-close"
            aria-label="Close panel"
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        </header>

        <div className="cv-body">
          {/* 1. Certificate preview */}
          {cert.image && (
            <section
              className="cv-card cv-card--soft cv-card--preview"
              onContextMenu={(e) => { e.preventDefault(); return false; }}
              onDragStart={(e) => { e.preventDefault(); return false; }}
            >
              <div className="cv-card-row">
                <span className="cv-eyebrow">
                  <DocIcon /> OFFICIAL DOCUMENT
                </span>
                <button type="button" className="cv-pill" onClick={() => setZoomed(true)}>
                  <ZoomIcon /> Zoom in
                </button>
              </div>
              <div
                className="cv-preview"
                onContextMenu={(e) => { e.preventDefault(); return false; }}
                onDragStart={(e) => { e.preventDefault(); return false; }}
              >
                <img
                  src={cert.image}
                  alt={`${cert.title} certificate`}
                  draggable={false}
                  onContextMenu={(e) => { e.preventDefault(); return false; }}
                  onDragStart={(e) => { e.preventDefault(); return false; }}
                />
                <div
                  className="cv-preview-glass"
                  onClick={() => setZoomed(true)}
                  onContextMenu={(e) => { e.preventDefault(); return false; }}
                  onDragStart={(e) => { e.preventDefault(); return false; }}
                  title="Click to zoom in"
                />
              </div>
            </section>
          )}

          {/* 2. Authenticity */}
          <section className="cv-card">
            <div className="cv-card-row">
              <span className="cv-auth">
                <i className="cv-dot" /> Authenticity confirmed
              </span>
              <span className="cv-badge">Active</span>
            </div>
            <dl className="cv-grid">
              <div>
                <dt>RECIPIENT</dt>
                <dd>{cert.recipient}</dd>
                {cert.rollNo && <dd className="cv-muted">{cert.rollNo}</dd>}
              </div>
              <div>
                <dt>CREDENTIAL ID</dt>
                <dd className="cv-id-row">
                  <code className="cv-code">{cert.credentialId}</code>
                  <button
                    type="button"
                    className="cv-icon-btn"
                    aria-label="Copy credential ID"
                    onClick={copyId}
                    title="Copy ID"
                  >
                    <CopyIcon />
                  </button>
                  {copied && <span className="cv-copied" role="status">Copied</span>}
                </dd>
              </div>
              <div>
                <dt>ISSUED BY</dt>
                <dd>{cert.issuer}</dd>
              </div>
              <div>
                <dt>ISSUED DATE</dt>
                <dd>{cert.issuedDate}</dd>
              </div>
            </dl>
          </section>

          {/* 3. Overview */}
          <section className="cv-card cv-card--soft">
            <h3 className="cv-card-title">Credential overview</h3>
            <p className="cv-text">{cert.overview}</p>
          </section>
        </div>

        {/* Footer */}
        <footer className="cv-footer">
          <div className="cv-verify">
            <div>
              <p className="cv-verify-title">Verify this credential</p>
              <p className="cv-verify-sub">Direct lookup on the official issuing platform.</p>
            </div>
            <a
              className="cv-btn"
              href={cert.verifyUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Verify on registry <ExternalIcon />
            </a>
          </div>
        </footer>
      </aside>

      {zoomed && (
        <div
          className="cv-zoom"
          role="dialog"
          aria-label="Certificate enlarged"
          onClick={() => setZoomed(false)}
          onContextMenu={(e) => { e.preventDefault(); return false; }}
          onDragStart={(e) => { e.preventDefault(); return false; }}
        >
          <div
            className="cv-zoom-inner"
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => { e.preventDefault(); return false; }}
            onDragStart={(e) => { e.preventDefault(); return false; }}
          >
            <img
              src={cert.image}
              alt={`${cert.title} certificate, enlarged`}
              draggable={false}
              onContextMenu={(e) => { e.preventDefault(); return false; }}
              onDragStart={(e) => { e.preventDefault(); return false; }}
            />
          </div>
          <button
            type="button"
            className="cv-zoom-close"
            aria-label="Close zoom"
            onClick={() => setZoomed(false)}
          >
            <CloseIcon />
          </button>
        </div>
      )}
    </div>,
    document.body
  );
}
