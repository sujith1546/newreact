import React, { useState, useEffect, useRef } from 'react';
import { ScrollReveal } from '../components';
import { Loader2, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import useRealtimeData from '../hooks/useRealtimeData';

const DEFAULT_CERTIFICATIONS = [
  {
    id: "gc-8834x",
    issuer: "Google",
    title: "TensorFlow certificate",
    description: "Proficiency in building and training deep learning models, covering computer vision, NLP, and time series forecasting.",
    skills: ["Deep learning", "Computer vision", "NLP"],
    issuedDate: "Mar 2025",
    credentialId: "GC-8834X",
    verifyUrl: "https://www.credential.net/",
    icon: "ti-brand-google",
    color: "accent",
  },
  {
    id: "or-2291k",
    issuer: "Oracle",
    title: "Generative AI certificate",
    description: "Expertise in generative AI architectures, LLMs, and enterprise-grade AI solutions on Oracle Cloud Infrastructure.",
    skills: ["Generative AI", "LLMs", "OCI"],
    issuedDate: "Jun 2025",
    credentialId: "OR-2291K",
    verifyUrl: "https://mylearn.oracle.com/",
    icon: "ti-cloud",
    color: "danger",
  },
  {
    id: "meta-9921b",
    issuer: "Meta",
    title: "Front-End Developer certificate",
    description: "Advanced web engineering, React 18 component design systems, state management, and modern performance optimization.",
    skills: ["React 18", "Full-Stack Web", "UX Systems"],
    issuedDate: "Jan 2025",
    credentialId: "META-9921B",
    verifyUrl: "https://coursera.org/verify/",
    icon: "ti-brand-meta",
    color: "accent",
  },
  {
    id: "ibm-5541z",
    issuer: "IBM",
    title: "Data Science Professional certificate",
    description: "Applied machine learning pipelines, predictive analytics, data visualization, SQL databases, and statistical modeling.",
    skills: ["Data science", "Python", "Predictive analytics"],
    issuedDate: "Nov 2024",
    credentialId: "IBM-5541Z",
    verifyUrl: "https://coursera.org/verify/",
    icon: "ti-cpu",
    color: "success",
  }
];

const COLORS = {
  accent: {
    headerBg: '#dbeafe',
    badgeBorder: '#1d4ed8',
    badgeIcon: '#1d4ed8',
    pillBorder: '#93c5fd',
    pillColor: '#1d4ed8',
    issuerColor: '#1d4ed8',
    verifyColor: '#1d4ed8',
  },
  danger: {
    headerBg: '#fee2e2',
    badgeBorder: '#dc2626',
    badgeIcon: '#dc2626',
    pillBorder: '#fca5a5',
    pillColor: '#dc2626',
    issuerColor: '#dc2626',
    verifyColor: '#1d4ed8',
  },
  success: {
    headerBg: '#dcfce7',
    badgeBorder: '#16a34a',
    badgeIcon: '#16a34a',
    pillBorder: '#86efac',
    pillColor: '#15803d',
    issuerColor: '#15803d',
    verifyColor: '#1d4ed8',
  },
  warning: {
    headerBg: '#fef9c3',
    badgeBorder: '#ca8a04',
    badgeIcon: '#ca8a04',
    pillBorder: '#fde047',
    pillColor: '#854d0e',
    issuerColor: '#854d0e',
    verifyColor: '#1d4ed8',
  },
};

function CertCard({ cert, isMobile = false }) {
  const { id, issuer, title, description, skills, issuedDate, credentialId, verifyUrl, icon, color } = cert;
  const c = COLORS[color] || COLORS.accent;

  return (
    <div
      className="cert-card-container"
      onMouseEnter={e => {
        if (!isMobile) {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 14px 32px rgba(0,0,0,0.09)';
        }
      }}
      onMouseLeave={e => {
        if (!isMobile) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      <div
        className={`cert-card-header cert-card-header--${color || 'accent'}`}
        style={{
          padding: isMobile ? '16px 18px 14px' : '20px 22px',
          position: 'relative',
        }}
      >
        <span
          className="cert-verified-badge"
          style={{
            position: 'absolute',
            top: isMobile ? '14px' : '16px',
            right: isMobile ? '14px' : '16px',
            border: `1px solid ${c.pillBorder}`,
            padding: isMobile ? '3px 9px' : '4px 11px',
            fontSize: isMobile ? '10px' : '11px',
            color: c.pillColor,
          }}
        >
          <i className="ti ti-shield-check" style={{ fontSize: isMobile ? '12px' : '13px' }} aria-hidden="true" />
          Verified
        </span>

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
          <div style={{ minWidth: 0, flex: 1, paddingRight: isMobile ? '68px' : '0' }}>
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
          margin: '0 0 12px',
          fontSize: isMobile ? '12px' : '13.5px',
          color: 'var(--text-secondary)',
          lineHeight: '1.55',
          flexGrow: 1,
        }}>{description}</p>

        {skills && skills.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: isMobile ? '14px' : '18px' }}>
            {skills.map(skill => (
              <span key={skill} style={{
                fontSize: isMobile ? '10px' : '11.5px',
                fontWeight: '500',
                color: 'var(--text-secondary)',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '999px',
                padding: isMobile ? '3px 10px' : '4px 13px',
                lineHeight: '1.3',
              }}>{skill}</span>
            ))}
          </div>
        )}

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
                fontFamily: '"JetBrains Mono", "SF Mono", monospace',
                lineHeight: '1.4',
              }}>ID  {credentialId}</p>
            )}
          </div>

          {verifyUrl && (
            <a
              href={verifyUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: isMobile ? '12px' : '13.5px',
                fontWeight: '600',
                color: c.verifyColor,
                textDecoration: 'none',
                padding: '4px 8px',
                borderRadius: '6px',
                transition: 'background 0.18s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(29,78,216,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              Verify
              <i className="ti ti-external-link" style={{ fontSize: isMobile ? '12px' : '14px' }} aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Certifications() {
  const { data: dbData, loading } = useRealtimeData('certifications', { orderColumn: 'display_order', ascending: true });
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth <= 900);
  const [activeIdx, setActiveIdx] = useState(0);
  const trackRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
        let derivedSkills = item.skills || item.tags;
        if (!derivedSkills || derivedSkills.length === 0) {
          const t = (item.title || '').toLowerCase();
          if (t.includes('tensorflow') || t.includes('deep learning')) {
            derivedSkills = ['Deep learning', 'Computer vision', 'NLP'];
          } else if (t.includes('generative ai') || t.includes('oracle') || t.includes('llm')) {
            derivedSkills = ['Generative AI', 'LLMs', 'OCI'];
          } else if (t.includes('front-end') || t.includes('react') || t.includes('meta')) {
            derivedSkills = ['React 18', 'Full-Stack Web', 'UX Systems'];
          } else {
            derivedSkills = ['Data science', 'Python', 'Predictive analytics'];
          }
        }
        return {
          id: item.id || `cert-${idx}`,
          issuer: item.issuer || item.organization || 'Global Issuer',
          title: item.title || item.name || 'Professional Certificate',
          description: item.description || 'Verified technical credential.',
          skills: derivedSkills,
          issuedDate: item.issuedDate || item.date || '2025',
          credentialId: item.credentialId || item.credential_id || `ID-${idx + 100}`,
          verifyUrl: item.verifyUrl || item.credentialUrl || item.url || '#',
          icon: item.icon || (item.issuer?.toLowerCase().includes('oracle') ? 'ti-cloud' : 'ti-brand-google'),
          color: item.color || (idx % 2 === 0 ? 'accent' : 'danger'),
        };
      })
    : DEFAULT_CERTIFICATIONS;

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
          transition: transform 0.22s ease, box-shadow 0.22s ease;
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

        .cert-card-header--accent { background: #dbeafe; }
        .cert-card-header--danger { background: #fee2e2; }
        .cert-card-header--success { background: #dcfce7; }
        .cert-card-header--warning { background: #fef9c3; }

        [data-theme="dark"] .cert-card-header--accent { background: rgba(59, 130, 246, 0.16) !important; }
        [data-theme="dark"] .cert-card-header--danger { background: rgba(239, 68, 68, 0.16) !important; }
        [data-theme="dark"] .cert-card-header--success { background: rgba(16, 185, 129, 0.16) !important; }
        [data-theme="dark"] .cert-card-header--warning { background: rgba(245, 158, 11, 0.16) !important; }

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

        .cert-verified-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #ffffff;
          border-radius: 999px;
          font-weight: 600;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
          line-height: 1;
        }

        [data-theme="dark"] .cert-verified-badge {
          background: #161B22 !important;
          box-shadow: 0 1px 6px rgba(0,0,0,0.3) !important;
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
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .cert-mobile-track::-webkit-scrollbar {
          display: none;
        }

        .cert-mobile-track::after {
          content: '';
          flex: 0 0 4px;
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

      {isMobile ? (
        <div className="cert-mobile-wrap">
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
              <div key={cert.id || cert.credentialId || idx} className="cert-mobile-card-slot">
                <CertCard cert={cert} isMobile={true} />
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
            <CertCard key={cert.id || cert.credentialId} cert={cert} isMobile={false} />
          ))}
        </div>
      )}
    </ScrollReveal>
  );
}
