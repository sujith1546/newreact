import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ScrollReveal, RollingText } from '../components';
import { 
  Award, ChevronLeft, ChevronRight, 
  ShieldCheck
} from 'lucide-react';
import useRealtimeData from '../hooks/useRealtimeData';
import MultiStateVerificationBadge from '../components/ui/MultiStateVerificationBadge';
import CertificationPanel from '../components/CertificationPanel';
import { certifications as CERTIFICATIONS_DATA } from '../data/certifications';

const COLORS = {
  accent: {
    headerBg: '#dbeafe',
    badgeBorder: '#1d4ed8',
    badgeIcon: '#1d4ed8',
    pillBorder: '#93c5fd',
    pillColor: '#1d4ed8',
    issuerColor: 'var(--primary-blue, #3b82f6)',
    verifyColor: 'var(--primary-blue, #3b82f6)',
  },
  danger: {
    headerBg: '#fee2e2',
    badgeBorder: '#dc2626',
    badgeIcon: '#dc2626',
    pillBorder: '#fca5a5',
    pillColor: '#dc2626',
    issuerColor: 'var(--primary-blue, #3b82f6)',
    verifyColor: 'var(--primary-blue, #3b82f6)',
  },
  success: {
    headerBg: '#dcfce7',
    badgeBorder: '#16a34a',
    badgeIcon: '#16a34a',
    pillBorder: '#86efac',
    pillColor: '#15803d',
    issuerColor: 'var(--primary-blue, #3b82f6)',
    verifyColor: 'var(--primary-blue, #3b82f6)',
  },
  warning: {
    headerBg: '#fef9c3',
    badgeBorder: '#ca8a04',
    badgeIcon: '#ca8a04',
    pillBorder: '#fde047',
    pillColor: '#854d0e',
    issuerColor: 'var(--primary-blue, #3b82f6)',
    verifyColor: 'var(--primary-blue, #3b82f6)',
  },
};

function CertCard({ cert, isMobile = false, onVerifyClick }) {
  const { id, issuer, title, description, issuedDate, credentialId, icon, color } = cert;
  const c = COLORS[color] || COLORS.accent;

  return (
    <div
      className={`cert-card-container${isMobile ? ' cert-card-mobile' : ''}`}
      onClick={() => {
        if (onVerifyClick) onVerifyClick(id);
      }}
      onMouseEnter={e => {
        if (!isMobile) {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 14px 32px rgba(0,0,0,0.09)';
          e.currentTarget.style.borderColor = 'var(--primary-blue, #2563eb)';
        }
      }}
      onMouseLeave={e => {
        if (!isMobile) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.borderColor = 'var(--border-color, #CBD5E1)';
        }
      }}
      style={{
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <div
        className={`cert-card-header cert-card-header--${color || 'accent'}`}
        style={{
          padding: isMobile ? '16px 18px 14px' : '20px 22px',
          position: 'relative',
        }}
      >
        <MultiStateVerificationBadge
          issuer={issuer}
          credentialId={credentialId}
          verifyUrl={cert.verifyUrl}
          theme={c}
          isMobile={isMobile}
          onOpenDrawer={() => onVerifyClick && onVerifyClick(id)}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '16px' }}>
          <div
            className="cert-badge-circle"
            style={{
              width: isMobile ? '46px' : '56px',
              height: isMobile ? '46px' : '56px',
              boxShadow: `0 0 0 2px ${c.badgeBorder}`,
            }}
          >
            <i className={`ti ${icon}`} style={{ fontSize: isMobile ? '22px' : '26px', color: c.badgeIcon }} aria-hidden="true" />
          </div>
          <div style={{ minWidth: 0, flex: 1, paddingRight: isMobile ? '76px' : '90px' }}>
            <p style={{
              margin: '0 0 3px',
              fontSize: isMobile ? '9.5px' : '10.5px',
              fontWeight: '700',
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              color: c.issuerColor,
              lineHeight: '1',
            }}>{issuer}</p>
            <p style={{
              margin: '0',
              fontSize: isMobile ? '14.5px' : '17px',
              fontWeight: '700',
              color: 'var(--text-primary)',
              lineHeight: '1.3',
            }}>{title}</p>
          </div>
        </div>
      </div>

      <div style={{
        padding: isMobile ? '14px 16px 14px' : '20px 22px 18px',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1
      }}>
        <p style={{
          margin: '0 0 16px',
          fontSize: isMobile ? '12px' : '13.5px',
          color: 'var(--text-secondary)',
          lineHeight: '1.55',
          flexGrow: 1,
        }}>{description}</p>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--border-color)',
          paddingTop: isMobile ? '10px' : '13px',
          marginTop: 'auto',
        }}>
          <div>
            {issuedDate && (
              <p style={{
                margin: '0',
                fontSize: isMobile ? '10px' : '11px',
                color: 'var(--text-muted)',
                fontWeight: '500',
                lineHeight: '1.4',
              }}>Issued {issuedDate}</p>
            )}
            {credentialId && (
              <p style={{
                margin: '2px 0 0',
                fontSize: isMobile ? '9.5px' : '10.5px',
                color: 'var(--text-muted)',
                fontWeight: '600',
                fontFamily: 'var(--font-mono, "JetBrains Mono", "SF Mono", monospace)',
                lineHeight: '1.4',
              }}>ID {credentialId}</p>
            )}
          </div>

          <button
            type="button"
            className="cert-verify-trigger-btn"
            onClick={(e) => {
              e.stopPropagation();
              if (onVerifyClick) onVerifyClick(id);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: isMobile ? '11px' : '12.5px',
              fontWeight: '700',
              color: c.verifyColor,
              background: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.22)',
              borderRadius: '8px',
              padding: isMobile ? '5px 10px' : '6px 14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              WebkitTapHighlightColor: 'transparent',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--primary-blue, #2563eb)';
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.borderColor = 'var(--primary-blue, #2563eb)';
              e.currentTarget.style.boxShadow = '0 4px 14px color-mix(in srgb, var(--primary-blue, #2563eb) 30%, transparent)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(59, 130, 246, 0.08)';
              e.currentTarget.style.color = c.verifyColor;
              e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.22)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <ShieldCheck size={isMobile ? 12 : 14} />
            <span>Verify</span>
            <ChevronRight size={isMobile ? 11 : 13} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Certifications() {
  const { data: dbData } = useRealtimeData('certifications', { orderColumn: 'display_order', ascending: true });
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth <= 900);
  const [activeIdx, setActiveIdx] = useState(0);
  const [activeCertId, setActiveCertId] = useState(null);
  const trackRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 900);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleClose = useCallback(() => {
    setActiveCertId(null);
  }, []);

  const handleVerify = useCallback((id) => {
    setActiveCertId(id);
  }, []);

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const { scrollLeft, offsetWidth } = track;
    const card = track.querySelector('.cert-mobile-card-slot');
    const step = card ? card.offsetWidth + 12 : offsetWidth * 0.85;
    const idx = Math.round(scrollLeft / step);
    setActiveIdx(Math.min(Math.max(0, idx), certifications.length - 1));
  };

  const scrollTo = (idx) => {
    const track = trackRef.current;
    if (!track) return;
    const cards = track.querySelectorAll('.cert-mobile-card-slot');
    if (cards[idx]) {
      cards[idx].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
      setActiveIdx(idx);
    }
  };

  const certifications = (dbData && dbData.length > 0)
    ? dbData.map((item, idx) => {
        const t = (item.title || '').toLowerCase();
        const iss = (item.issuer || '').toLowerCase();
        const isGoogle = t.includes('tensorflow') || t.includes('google') || iss.includes('google') || item.id === 'google-tf';
        const isOracle = t.includes('oracle') || t.includes('generative') || iss.includes('oracle') || item.id === 'oracle-genai';

        const base = isGoogle
          ? CERTIFICATIONS_DATA[0]
          : isOracle
          ? CERTIFICATIONS_DATA[1]
          : null;

        if (base) {
          return {
            ...base,
            id: isGoogle ? 'google-tensorflow' : 'oracle-genai',
            description: item.description || base.overview,
            color: isGoogle ? 'accent' : 'danger',
            icon: isGoogle ? 'ti-brand-google' : 'ti-cloud',
          };
        }

        return {
          id: item.id || `cert-${idx}`,
          issuer: item.issuer || 'Global Issuer',
          title: item.title || 'Professional Certificate',
          recipient: 'Thota Sujith Reddy',
          rollNo: '22BDS0250',
          credentialId: item.credentialId || `ID-${idx + 100}`,
          issuedDate: item.date || '2025',
          overview: item.description || 'Verified technical credential.',
          description: item.description || 'Verified technical credential.',
          image: item.badge_image || null,
          verifyUrl: item.credential_url || item.url || '#',
          accent: idx % 2 === 0 ? '#2f6df6' : '#c74634',
          accentSoft: idx % 2 === 0 ? '#eaf1ff' : '#fdeeea',
          icon: item.icon_class || 'ti-award',
          color: idx % 2 === 0 ? 'accent' : 'danger',
        };
      })
    : CERTIFICATIONS_DATA.map((c, idx) => ({
        ...c,
        description: c.overview,
        color: idx % 2 === 0 ? 'accent' : 'danger',
        icon: idx === 0 ? 'ti-brand-google' : 'ti-cloud',
      }));

  // Selected certification for the slide panel
  const activeCert = certifications.find((c) => c.id === activeCertId) ?? null;

  return (
    <ScrollReveal className="wide-content">
      <style>{`
        /* Scoped styles for Certifications */
        .cert-desktop-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          max-width: 920px;
          margin: 0;
        }

        .cert-card-container {
          background: var(--bg-secondary, #ffffff);
          border: 1.5px solid var(--border-color, #CBD5E1);
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          height: 100%;
          width: 100%;
          box-sizing: border-box;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
          transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.2s ease;
        }

        .cert-card-container.cert-card-mobile:active {
          transform: scale(0.985);
        }

        [data-theme="dark"] .cert-card-container {
          background: var(--bg-secondary, #161B22);
          border-color: rgba(255, 255, 255, 0.14);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.28);
        }

        .cert-card-header {
          position: relative;
          transition: background 0.2s ease;
        }

        .cert-card-header--accent { background: rgba(59, 130, 246, 0.06); }
        .cert-card-header--danger { background: rgba(239, 68, 68, 0.06); }
        .cert-card-header--success { background: rgba(16, 185, 129, 0.06); }
        .cert-card-header--warning { background: rgba(245, 158, 11, 0.06); }

        [data-theme="dark"] .cert-card-header--accent { background: rgba(59, 130, 246, 0.07) !important; }
        [data-theme="dark"] .cert-card-header--danger { background: rgba(239, 68, 68, 0.07) !important; }
        [data-theme="dark"] .cert-card-header--success { background: rgba(16, 185, 129, 0.07) !important; }
        [data-theme="dark"] .cert-card-header--warning { background: rgba(245, 158, 11, 0.07) !important; }

        .cert-badge-circle {
          border-radius: 50%;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background 0.2s ease;
        }

        [data-theme="dark"] .cert-badge-circle {
          background: #161B22 !important;
        }

        /* ── Mobile Carousel Styles ── */
        .cert-mobile-wrap {
          width: 100%;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          padding: 4px 0 20px;
        }

        .cert-mobile-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 2px 2px 14px;
          gap: 8px;
        }

        .cert-mobile-title-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .cert-mobile-icon-box {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: rgba(59, 130, 246, 0.12);
          border: 1.2px solid rgba(59, 130, 246, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: var(--primary-blue, #3B82F6);
        }

        .cert-mobile-heading {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
          line-height: 1.2;
          letter-spacing: -0.01em;
        }

        .cert-mobile-sub {
          font-size: 10px;
          color: var(--text-muted);
          margin: 1px 0 0;
          line-height: 1.2;
        }

        .cert-mobile-controls {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .cert-mobile-counter {
          font-size: 10px;
          font-weight: 700;
          color: var(--text-muted);
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          padding: 2px 8px;
          border-radius: 20px;
          letter-spacing: 0.03em;
        }

        .cert-nav-btn {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          border: 1px solid var(--border-color);
          background: var(--bg-secondary);
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.15s ease, background 0.15s ease;
          padding: 0;
          -webkit-tap-highlight-color: transparent;
        }

        .cert-nav-btn:active:not(:disabled) {
          transform: scale(0.92);
        }

        .cert-nav-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .cert-mobile-track {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          scroll-padding-left: 2px;
          margin: 0;
          padding: 4px 2px 14px;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }

        .cert-mobile-track::-webkit-scrollbar {
          display: none;
        }

        .cert-mobile-card-slot {
          flex: 0 0 85%;
          min-width: 85%;
          max-width: 85%;
          scroll-snap-align: start;
          box-sizing: border-box;
          display: flex;
        }

        .cert-mobile-dots {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 4px;
        }

        .cert-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--border-color, #CBD5E1);
          border: none;
          padding: 0;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cert-dot.active {
          background: var(--primary-blue, #3B82F6);
          width: 14px;
          border-radius: 3px;
        }
      `}</style>
      <style>{`
        /* ── RollingText styles (Certifications) ── */
        .rolling-text-root {
          display: inline-block;
          max-width: 100%;
          text-align: left;
          font-size: clamp(20px, 3vw, 32px);
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 1;
          text-transform: uppercase;
          --rolling-accent: var(--primary-blue, #007bff);
        }
      `}</style>

      {/* Desktop-only RollingText section title */}
      {!isMobile && (
        <div className="cert-header" style={{ marginBottom: '16px' }}>
          <RollingText text="CERTIFICATIONS" speed={0.05} duration={3} />
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', margin: '8px 0 0' }}>
            Verified technical credentials &amp; professional accreditations
          </p>
        </div>
      )}

      {isMobile ? (
        <div className="cert-mobile-wrap">
          {/* Mobile Hero Header */}
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <p style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.22em', textTransform: 'uppercase', margin: '0 0 6px' }}>
              VERIFIED CREDENTIALS
            </p>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px', letterSpacing: '-0.025em', lineHeight: 1.2 }}>
              Licensures &amp; Certifications
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 auto', lineHeight: 1.55 }}>
              Swipe to explore and verify technical accreditations, cloud badges, and honors.
            </p>
          </div>

          {/* Header with Title & Controls */}
          <div className="cert-mobile-header">
            <div className="cert-mobile-title-wrap">
              <div className="cert-mobile-icon-box">
                <Award size={15} />
              </div>
              <div>
                <h2 className="cert-mobile-heading">Certifications</h2>
                <p className="cert-mobile-sub">Verified credentials &amp; honors</p>
              </div>
            </div>
            <div className="cert-mobile-controls">
              <span className="cert-mobile-counter">
                {activeIdx + 1} / {certifications.length}
              </span>
              <button
                className="cert-nav-btn"
                onClick={() => scrollTo(Math.max(0, activeIdx - 1))}
                disabled={activeIdx === 0}
                aria-label="Previous certification"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                className="cert-nav-btn"
                onClick={() => scrollTo(Math.min(certifications.length - 1, activeIdx + 1))}
                disabled={activeIdx === certifications.length - 1}
                aria-label="Next certification"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Swipeable Snap Track */}
          <div className="cert-mobile-track" ref={trackRef} onScroll={handleScroll}>
            {certifications.map((cert, idx) => (
              <div key={cert.id || idx} className="cert-mobile-card-slot">
                <CertCard cert={cert} isMobile={true} onVerifyClick={handleVerify} />
              </div>
            ))}
          </div>

          {/* Pagination Dots */}
          <div className="cert-mobile-dots">
            {certifications.map((_, i) => (
              <button
                key={i}
                className={`cert-dot ${i === activeIdx ? 'active' : ''}`}
                onClick={() => scrollTo(i)}
                aria-label={`Go to certification ${i + 1}`}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="cert-desktop-grid">
          {certifications.map(cert => (
            <CertCard
              key={cert.id}
              cert={cert}
              isMobile={false}
              onVerifyClick={handleVerify}
            />
          ))}
        </div>
      )}

      {/* ── CERTIFICATION VERIFICATION PANEL (MATCHING CONTACT FAQ DRAWER) ── */}
      <CertificationPanel cert={activeCert} onClose={handleClose} />
    </ScrollReveal>
  );
}
