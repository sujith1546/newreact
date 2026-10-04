import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { ScrollReveal } from '../components';
import { 
  Loader2, Award, ChevronLeft, ChevronRight, 
  ShieldCheck, Copy, Check, ExternalLink, X, 
  Calendar, CheckCircle2 
} from 'lucide-react';
import useRealtimeData from '../hooks/useRealtimeData';
import MultiStateVerificationBadge from '../components/ui/MultiStateVerificationBadge';

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
  const { id, issuer, title, description, skills, issuedDate, credentialId, verifyUrl, icon, color } = cert;
  const c = COLORS[color] || COLORS.accent;

  return (
    <div
      className={`cert-card-container${isMobile ? ' cert-card-mobile' : ''}`}
      onClick={() => {
        if (isMobile && onVerifyClick) {
          onVerifyClick(cert);
        }
      }}
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
      style={{
        cursor: isMobile ? 'pointer' : 'default',
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
          verifyUrl={verifyUrl}
          theme={c}
          isMobile={isMobile}
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
                fontFamily: 'var(--font-mono, "JetBrains Mono", "SF Mono", monospace)',
                lineHeight: '1.4',
              }}>ID  {credentialId}</p>
            )}
          </div>

          {isMobile ? (
            <button
              type="button"
              className="cert-mobile-verify-btn"
              onClick={(e) => {
                e.stopPropagation();
                if (onVerifyClick) onVerifyClick(cert);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                fontWeight: '600',
                color: c.verifyColor,
                background: 'none',
                border: 'none',
                padding: '4px 6px',
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <span>Verify</span>
              <ChevronRight size={13} />
            </button>
          ) : verifyUrl ? (
            <a
              href={verifyUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '13.5px',
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
              <i className="ti ti-external-link" style={{ fontSize: '14px' }} aria-hidden="true" />
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function Certifications() {
  const { data: dbData, loading } = useRealtimeData('certifications', { orderColumn: 'display_order', ascending: true });
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth <= 900);
  const [activeIdx, setActiveIdx] = useState(0);
  const [selectedCert, setSelectedCert] = useState(null);
  const [copiedId, setCopiedId] = useState(false);
  const trackRef = useRef(null);
  const dragControls = useDragControls();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 900;
      setIsMobile(mobile);
      if (!mobile) setSelectedCert(null);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Lock body scroll and listen for Escape key when mobile verification sheet is open
  useEffect(() => {
    if (isMobile && selectedCert) {
      const origOverflow = document.body.style.overflow;
      const origTouchAction = document.body.style.touchAction;
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') setSelectedCert(null);
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = origOverflow;
        document.body.style.touchAction = origTouchAction;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isMobile, selectedCert]);

  const handleCopyId = (id) => {
    if (!id) return;
    navigator.clipboard.writeText(id).then(() => {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }).catch(() => {});
  };

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

        /* ── MOBILE SLIDE-UP VERIFICATION SHEET ── */
        .dsheet-backdrop {
          position: fixed; inset: 0; background: rgba(0,0,0,0.55);
          backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
          z-index: 10000;
        }
        .dsheet {
          position: fixed; bottom: 0; left: 0; right: 0;
          max-height: min(78dvh, 680px);
          min-height: 48dvh;
          height: auto;
          background: var(--bg-secondary, #FFFFFF);
          border-top: 1px solid var(--border-color, #CBD5E1);
          border-top-left-radius: 24px; border-top-right-radius: 24px;
          box-shadow: 0 -10px 40px rgba(0,0,0,0.18);
          z-index: 10001;
          display: flex; flex-direction: column;
          overflow: hidden;
          box-sizing: border-box;
        }
        [data-theme="dark"] .dsheet {
          background: var(--bg-secondary, #161B22);
          border-top-color: rgba(255,255,255,0.12);
          box-shadow: 0 -10px 40px rgba(0,0,0,0.5);
        }
        .dsheet-handle-bar {
          width: 100%; padding: 12px 0 6px;
          display: flex; align-items: center; justify-content: center;
          cursor: grab; flex-shrink: 0;
          touch-action: none; user-select: none; -webkit-user-select: none;
        }
        .dsheet-handle-bar:active { cursor: grabbing; }
        .dsheet-handle {
          width: 38px; height: 4.5px; border-radius: 999px;
          background: var(--border-color, #cbd5e1);
          transition: background 0.2s ease, transform 0.2s ease;
        }
        .dsheet-handle-bar:active .dsheet-handle {
          transform: scaleX(1.15);
          background: var(--primary-blue, #3b82f6);
        }
        [data-theme="dark"] .dsheet-handle {
          background: rgba(255,255,255,0.25);
        }
        .dsheet-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 4px 16px 12px; border-bottom: 1px solid var(--border-color);
          flex-shrink: 0;
          cursor: grab; touch-action: none; user-select: none; -webkit-user-select: none;
        }
        .dsheet-header:active { cursor: grabbing; }
        .dsheet-header-left { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
        .dsheet-header-icon {
          width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .dsheet-title h3 {
          font-size: 13.5px; font-weight: 800; color: var(--text-primary); margin: 0;
          letter-spacing: -.015em; line-height: 1.25;
        }
        .dsheet-title p {
          font-size: 9.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; margin: 2px 0 0;
          display: flex; align-items: center;
        }
        .dsheet-close {
          width: 30px; height: 30px; border-radius: 50%; background: var(--bg-primary);
          border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: center;
          color: var(--text-secondary); cursor: pointer; flex-shrink: 0; margin-left: 8px;
          transition: transform 0.15s ease, background 0.15s ease, color 0.15s ease;
          -webkit-tap-highlight-color: transparent;
        }
        .dsheet-close:active {
          transform: scale(0.9);
          color: var(--text-primary);
        }
        .dsheet-body {
          flex: 1; overflow-y: auto; padding: 0; display: flex; flex-direction: column; position: relative;
          overscroll-behavior: contain; -webkit-overflow-scrolling: touch;
        }
        .dsheet-body::-webkit-scrollbar { display: none; }
        .dsheet-content {
          padding: 12px 16px max(24px, env(safe-area-inset-bottom, 24px));
          display: flex; flex-direction: column; gap: 12px;
        }
        .dsheet-section-label {
          font-size: 8.5px; font-weight: 800; color: var(--text-muted);
          text-transform: uppercase; letter-spacing: .08em; margin: 0 0 5px;
        }
        .dsheet-desc {
          font-size: 11.5px; line-height: 1.55; color: var(--text-secondary); margin: 0;
        }

        /* Hero Verification Card inside Sheet */
        .cert-sheet-hero {
          background: var(--bg-primary, #F9FAFB);
          border: 1px solid var(--border-color, #E5E7EB);
          border-radius: 14px;
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        [data-theme="dark"] .cert-sheet-hero {
          background: #0D1117;
          border-color: rgba(255, 255, 255, 0.12);
        }
        .cert-sheet-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 9.5px;
          font-weight: 700;
          color: #16a34a;
          letter-spacing: 0.04em;
        }
        .cert-sheet-hero-rows {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          padding-top: 6px;
          border-top: 1px dashed var(--border-color, #E5E7EB);
        }
        [data-theme="dark"] .cert-sheet-hero-rows {
          border-top-color: rgba(255, 255, 255, 0.1);
        }
        .cert-sheet-hero-meta {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .cert-sheet-meta-label {
          font-size: 8.5px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .cert-sheet-id-wrap {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .cert-sheet-id {
          font-family: "JetBrains Mono", "SF Mono", monospace;
          font-size: 10px;
          font-weight: 700;
          color: var(--text-primary);
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          padding: 1px 5px;
          border-radius: 4px;
        }
        .cert-sheet-copy-btn {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          padding: 1px 5px;
          font-size: 8.5px;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
          transition: background 0.15s ease;
          -webkit-tap-highlight-color: transparent;
        }
        .cert-sheet-copy-btn:active {
          transform: scale(0.95);
        }
        .cert-sheet-meta-val {
          font-size: 10.5px;
          font-weight: 600;
          color: var(--text-primary);
        }

        /* Skills tags in sheet */
        .cert-sheet-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }
        .cert-sheet-tag {
          display: inline-flex;
          align-items: center;
          font-size: 9px;
          font-weight: 600;
          padding: 2.5px 8px;
          border-radius: 6px;
          border: 1px solid;
          line-height: 1.3;
        }

        /* Official Action CTA Button */
        .cert-sheet-cta-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          box-sizing: border-box;
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 11.5px;
          font-weight: 700;
          color: #ffffff !important;
          text-decoration: none;
          cursor: pointer;
          border: none;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transition: transform 0.15s ease, opacity 0.15s ease;
          -webkit-tap-highlight-color: transparent;
        }
        .cert-sheet-cta-btn:active {
          transform: scale(0.98);
          opacity: 0.9;
        }
      `}</style>

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
              <div key={cert.id || cert.credentialId || idx} className="cert-mobile-card-slot">
                <CertCard cert={cert} isMobile={true} onVerifyClick={setSelectedCert} />
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

      {/* ── MOBILE VERIFICATION SLIDE-UP SHEET ── */}
      {isMobile && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isMobile && selectedCert && (() => {
            const c = COLORS[selectedCert.color] || COLORS.accent;
            return (
              <div style={{ position: 'relative', zIndex: 10000 }}>
                <motion.div
                  className="dsheet-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  onClick={() => setSelectedCert(null)}
                />
                <motion.div
                  className="dsheet"
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%', transition: { duration: 0.22, ease: [0.32, 0.72, 0, 1] } }}
                  transition={{ type: 'spring', damping: 30, stiffness: 320, mass: 0.85 }}
                  drag="y"
                  dragControls={dragControls}
                  dragListener={false}
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={{ top: 0, bottom: 0.5 }}
                  onDragEnd={(_, info) => { if (info.offset.y > 100 || info.velocity.y > 500) setSelectedCert(null); }}
                >
                  {/* Dedicated Touch Handle Bar */}
                  <div
                    className="dsheet-handle-bar"
                    onPointerDown={(e) => dragControls.start(e)}
                  >
                    <div className="dsheet-handle" />
                  </div>

                  {/* Header with accent icon (also draggable) */}
                  <div
                    className="dsheet-header"
                    onPointerDown={(e) => {
                      if (!e.target.closest('.dsheet-close')) {
                        dragControls.start(e);
                      }
                    }}
                  >
                    <div className="dsheet-header-left">
                      <div
                        className="dsheet-header-icon"
                        style={{
                          background: c.headerBg,
                          border: `1.5px solid ${c.badgeBorder}`,
                          color: c.badgeIcon,
                        }}
                      >
                        <i className={`ti ${selectedCert.icon || 'ti-award'}`} style={{ fontSize: '18px' }} />
                      </div>
                      <div className="dsheet-title">
                        <h3>{selectedCert.title}</h3>
                        <p style={{ color: c.issuerColor }}>
                          <ShieldCheck size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: '-1px' }} />
                          {selectedCert.issuer} · Verified Credential
                        </p>
                      </div>
                    </div>
                    <button
                      className="dsheet-close"
                      onClick={() => setSelectedCert(null)}
                      aria-label="Close verification drawer"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="dsheet-body">
                    <div className="dsheet-content">
                      {/* Hero Verification Card */}
                      <div className="cert-sheet-hero">
                        <div className="cert-sheet-hero-badge">
                          <ShieldCheck size={15} style={{ color: '#16a34a' }} />
                          <span>AUTHENTIC VERIFIED CREDENTIAL</span>
                        </div>
                        <div className="cert-sheet-hero-rows">
                          <div className="cert-sheet-hero-meta">
                            <span className="cert-sheet-meta-label">Credential ID</span>
                            <div className="cert-sheet-id-wrap">
                              <code className="cert-sheet-id">{selectedCert.credentialId}</code>
                              <button
                                className="cert-sheet-copy-btn"
                                onClick={() => handleCopyId(selectedCert.credentialId)}
                                title="Copy Credential ID"
                              >
                                {copiedId ? (
                                  <>
                                    <Check size={10} style={{ color: '#16a34a' }} />
                                    <span style={{ color: '#16a34a' }}>Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy size={10} />
                                    <span>Copy ID</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="cert-sheet-hero-meta">
                            <span className="cert-sheet-meta-label">Issued Date</span>
                            <span className="cert-sheet-meta-val">
                              <Calendar size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: '-1px', color: 'var(--text-muted)' }} />
                              {selectedCert.issuedDate}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Overview */}
                      <div>
                        <p className="dsheet-section-label">Credential Overview</p>
                        <p className="dsheet-desc">{selectedCert.description}</p>
                      </div>

                      {/* Skills */}
                      {selectedCert.skills && selectedCert.skills.length > 0 && (
                        <div>
                          <p className="dsheet-section-label">Verified Competencies</p>
                          <div className="cert-sheet-tags">
                            {selectedCert.skills.map((skill) => (
                              <span
                                key={skill}
                                className="cert-sheet-tag"
                                style={{
                                  borderColor: c.pillBorder,
                                  color: c.pillColor,
                                  background: c.headerBg,
                                }}
                              >
                                <CheckCircle2 size={10} style={{ marginRight: 3, verticalAlign: '-1px' }} />
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Official Registry Action Button */}
                      <div>
                        <p className="dsheet-section-label">Official Authentication Registry</p>
                        {selectedCert.verifyUrl ? (
                          <a
                            href={selectedCert.verifyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cert-sheet-cta-btn"
                            style={{
                              background: c.badgeBorder,
                            }}
                          >
                            <ShieldCheck size={15} />
                            <span>Verify on {selectedCert.issuer} Registry</span>
                            <ExternalLink size={13} style={{ marginLeft: 'auto' }} />
                          </a>
                        ) : (
                          <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
                            Accredited credential on file.
                          </p>
                        )}
                        <p style={{ fontSize: '9.5px', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.4 }}>
                          Direct lookup on the issuer's verification authority (e.g., Coursera, Oracle, Credential.net).
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })()}
        </AnimatePresence>,
        document.body
      )}
    </ScrollReveal>
  );
}
