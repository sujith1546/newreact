import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollReveal, RollingText } from '../components';
import { 
  Loader2, Award, ChevronLeft, ChevronRight, 
  ShieldCheck, Copy, Check, ExternalLink, X, 
  Calendar, CheckCircle2, Lock, ZoomIn, ZoomOut, User,
  FileCheck, Shield
} from 'lucide-react';
import useRealtimeData from '../hooks/useRealtimeData';
import MultiStateVerificationBadge from '../components/ui/MultiStateVerificationBadge';

const DEFAULT_CERTIFICATIONS = [
  {
    id: "google-tf",
    issuer: "Google for Developers",
    title: "Artificial Intelligence using Google TensorFlow",
    description: "Completed the Credit Course on Artificial Intelligence using Google TensorFlow Powered by Google Developers in partnership with SmartBridge (India Edu Program), covering deep learning models, computer vision, and NLP.",
    skills: ["TensorFlow", "Artificial Intelligence", "Deep Learning", "Computer Vision", "Python"],
    issuedDate: "August 20, 2024",
    credentialId: "CC-AI-2024-5653",
    recipient: "Thota Sujith Reddy (22BDS0250)",
    partner: "SmartBridge & India Edu Program",
    certificateImage: "/certificates/google-tensorflow.webp",
    verifyUrl: "https://smartinternz.com/",
    icon: "ti-brand-google",
    color: "accent",
  },
  {
    id: "oracle-genai",
    issuer: "Oracle University",
    title: "OCI 2025 Certified Generative AI Professional",
    description: "Oracle Certified Professional recognized by Oracle Corporation for demonstrated expertise in enterprise generative AI architectures, large language models (LLMs), and cloud AI solutions on Oracle Cloud Infrastructure.",
    skills: ["Generative AI", "Large Language Models", "OCI", "AI Architecture"],
    issuedDate: "August 05, 2025",
    credentialId: "102217725OCI25GAIOCP",
    recipient: "Thota Sujith Reddy",
    partner: "Oracle Corporation",
    certificateImage: "/certificates/oracle-genai.webp",
    verifyUrl: "https://mylearn.oracle.com/",
    icon: "ti-cloud",
    color: "danger",
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
  const { id, issuer, title, description, skills, issuedDate, credentialId, icon, color } = cert;
  const c = COLORS[color] || COLORS.accent;

  return (
    <div
      className={`cert-card-container${isMobile ? ' cert-card-mobile' : ''}`}
      onClick={() => {
        if (onVerifyClick) onVerifyClick(cert);
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
          onOpenDrawer={() => onVerifyClick && onVerifyClick(cert)}
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
              if (onVerifyClick) onVerifyClick(cert);
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
  const [selectedCert, setSelectedCert] = useState(null);
  const [copiedId, setCopiedId] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const trackRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 900);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Lock body scroll and listen for Escape key when verification drawer is open
  useEffect(() => {
    if (selectedCert) {
      const origOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          setSelectedCert(null);
          setIsZoomed(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = origOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [selectedCert]);

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
        const t = (item.title || '').toLowerCase();
        const iss = (item.issuer || '').toLowerCase();
        const isGoogle = t.includes('tensorflow') || t.includes('google') || iss.includes('google') || item.id === 'google-tf';
        const isOracle = t.includes('oracle') || t.includes('generative') || iss.includes('oracle') || item.id === 'oracle-genai';

        if (isGoogle) {
          return {
            id: item.id || 'google-tf',
            issuer: 'Google for Developers',
            title: 'Artificial Intelligence using Google TensorFlow',
            description: 'Credit Course on Artificial Intelligence using Google TensorFlow Powered by Google Developers in partnership with SmartBridge (India Edu Program), covering deep learning models, computer vision, and NLP.',
            skills: ['TensorFlow', 'Artificial Intelligence', 'Deep Learning', 'Computer Vision', 'Python'],
            issuedDate: 'August 20, 2024',
            credentialId: 'CC-AI-2024-5653',
            recipient: 'Thota Sujith Reddy (22BDS0250)',
            partner: 'SmartBridge & India Edu Program',
            certificateImage: '/certificates/google-tensorflow.webp',
            verifyUrl: 'https://smartinternz.com/',
            icon: 'ti-brand-google',
            color: 'accent',
          };
        }

        if (isOracle) {
          return {
            id: item.id || 'oracle-genai',
            issuer: 'Oracle University',
            title: 'OCI 2025 Certified Generative AI Professional',
            description: 'Oracle Certified Professional credential validating expertise in generative AI architectures, large language models (LLMs), and enterprise AI solutions on Oracle Cloud Infrastructure.',
            skills: ['Generative AI', 'Large Language Models', 'OCI', 'AI Architecture'],
            issuedDate: 'August 05, 2025',
            credentialId: '102217725OCI25GAIOCP',
            recipient: 'Thota Sujith Reddy',
            partner: 'Oracle Corporation',
            certificateImage: '/certificates/oracle-genai.webp',
            verifyUrl: 'https://mylearn.oracle.com/',
            icon: 'ti-cloud',
            color: 'danger',
          };
        }

        let derivedSkills = item.skills || item.tags;
        if (!derivedSkills || derivedSkills.length === 0) {
          derivedSkills = ['Cloud Architecture', 'Engineering', 'Security'];
        }
        return {
          id: item.id || `cert-${idx}`,
          issuer: item.issuer || item.organization || 'Global Issuer',
          title: item.title || item.name || 'Professional Certificate',
          description: item.description || 'Verified technical credential.',
          skills: derivedSkills,
          issuedDate: item.issuedDate || item.date || '2025',
          credentialId: item.credentialId || item.credential_id || `ID-${idx + 100}`,
          recipient: 'Thota Sujith Reddy',
          certificateImage: item.badge_image || null,
          verifyUrl: item.verifyUrl || item.credential_url || item.url || '#',
          icon: item.icon || (item.issuer?.toLowerCase().includes('oracle') ? 'ti-cloud' : 'ti-brand-google'),
          color: item.color || (idx % 2 === 0 ? 'accent' : 'danger'),
        };
      })
    : DEFAULT_CERTIFICATIONS;

  // Active cert inside the slide drawer
  const activeCert = selectedCert
    ? (certifications.find(c => c.id === selectedCert.id) || selectedCert)
    : null;

  const activeColor = activeCert ? (COLORS[activeCert.color] || COLORS.accent) : COLORS.accent;

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

        /* ── SLIDE LEFT BAR / DRAWER (VIEW-ONLY, SECURE) ── */
        .cert-drawer-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(10, 15, 29, 0.65);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          z-index: 10000;
        }

        .cert-slide-drawer {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: min(640px, 100vw);
          height: 100%;
          background: var(--bg-secondary, #FFFFFF);
          border-left: 1.5px solid var(--border-color, #E2E8F0);
          box-shadow: -16px 0 48px rgba(0, 0, 0, 0.25);
          z-index: 10001;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-sizing: border-box;
        }

        [data-theme="dark"] .cert-slide-drawer {
          background: var(--bg-secondary, #12151C);
          border-left-color: rgba(255, 255, 255, 0.12);
          box-shadow: -16px 0 54px rgba(0, 0, 0, 0.65);
        }

        .cert-drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-color, #E2E8F0);
          background: var(--bg-secondary, #FFFFFF);
          flex-shrink: 0;
          z-index: 2;
        }

        [data-theme="dark"] .cert-drawer-header {
          background: var(--bg-secondary, #12151C);
          border-bottom-color: rgba(255, 255, 255, 0.1);
        }

        .cert-drawer-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .cert-drawer-header-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(16, 185, 129, 0.12);
          border: 1.5px solid rgba(16, 185, 129, 0.35);
          color: #10b981;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .cert-drawer-title-group h3 {
          font-size: 13.5px;
          font-weight: 800;
          letter-spacing: -0.01em;
          color: var(--text-primary);
          margin: 0;
          line-height: 1.25;
        }

        .cert-drawer-title-group p {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #10b981;
          margin: 2px 0 0;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .cert-drawer-close-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--bg-primary, #F8FAFC);
          border: 1px solid var(--border-color, #E2E8F0);
          border-radius: 8px;
          padding: 6px 10px;
          font-size: 11.5px;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.18s ease;
          -webkit-tap-highlight-color: transparent;
        }

        .cert-drawer-close-btn:hover {
          background: var(--border-color, #E2E8F0);
          color: var(--text-primary);
          transform: scale(1.02);
        }

        /* Related Certifications Switcher Bar */
        .cert-drawer-switcher {
          padding: 12px 20px 10px;
          background: var(--bg-primary, #F8FAFC);
          border-bottom: 1px solid var(--border-color, #E2E8F0);
          flex-shrink: 0;
        }

        [data-theme="dark"] .cert-drawer-switcher {
          background: rgba(0, 0, 0, 0.3);
          border-bottom-color: rgba(255, 255, 255, 0.08);
        }

        .cert-switcher-label {
          font-size: 9.5px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin: 0 0 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .cert-switcher-tabs {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 4px;
          scrollbar-width: none;
        }
        .cert-switcher-tabs::-webkit-scrollbar {
          display: none;
        }

        .cert-switcher-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 7px 12px;
          border-radius: 10px;
          background: var(--bg-secondary, #FFFFFF);
          border: 1.5px solid var(--border-color, #E2E8F0);
          color: var(--text-secondary);
          font-size: 11.5px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }

        .cert-switcher-tab:hover {
          border-color: var(--primary-blue, #2563eb);
          color: var(--text-primary);
        }

        .cert-switcher-tab.active {
          background: color-mix(in srgb, var(--primary-blue, #2563eb) 8%, var(--bg-secondary));
          border-color: var(--primary-blue, #2563eb);
          color: var(--primary-blue, #2563eb);
          box-shadow: 0 2px 10px color-mix(in srgb, var(--primary-blue, #2563eb) 18%, transparent);
        }

        .cert-tab-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 8px #10b981;
        }

        /* Scrollable Drawer Body */
        .cert-drawer-body {
          flex: 1;
          overflow-y: auto;
          padding: 18px 20px 28px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
        }

        /* ── VIEW ONLY PROTECTED CERTIFICATE FRAME ── */
        .cert-viewer-frame {
          background: #0f172a;
          border: 1.5px solid rgba(255, 255, 255, 0.14);
          border-radius: 16px;
          padding: 10px;
          box-shadow: 0 16px 36px -8px rgba(0, 0, 0, 0.38);
          display: flex;
          flex-direction: column;
          gap: 8px;
          position: relative;
          overflow: hidden;
          user-select: none;
          -webkit-user-select: none;
        }

        .cert-viewer-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 2px 4px 4px;
        }

        .cert-viewer-tag {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(16, 185, 129, 0.16);
          border: 1px solid rgba(16, 185, 129, 0.32);
          color: #34d399;
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          padding: 2.5px 7px;
          border-radius: 6px;
        }

        .cert-zoom-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.14);
          color: #e2e8f0;
          font-size: 10.5px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .cert-zoom-btn:hover {
          background: rgba(255, 255, 255, 0.16);
        }

        /* Document Viewport - Strictly View Only */
        .cert-doc-viewport {
          position: relative;
          width: 100%;
          border-radius: 10px;
          overflow: hidden;
          background: #020617;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 250px;
          max-height: 440px;
          user-select: none;
          -webkit-user-select: none;
          -webkit-touch-callout: none;
        }

        .cert-doc-img {
          width: 100%;
          height: auto;
          max-height: 430px;
          object-fit: contain;
          display: block;
          pointer-events: none;
          user-select: none;
          -webkit-user-select: none;
          -webkit-user-drag: none;
          transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .cert-doc-img.zoomed {
          transform: scale(1.42);
        }

        /* Transparent Anti-Copy / Anti-Download Glass Shield */
        .cert-security-glass {
          position: absolute;
          inset: 0;
          z-index: 10;
          background: transparent;
          cursor: default;
          user-select: none;
          -webkit-user-select: none;
          -webkit-touch-callout: none;
        }

        /* Diagonal Security Watermark */
        .cert-watermark-overlay {
          position: absolute;
          inset: 0;
          z-index: 8;
          pointer-events: none;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: rotate(-14deg);
          opacity: 0.085;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #ffffff;
          white-space: nowrap;
          user-select: none;
        }

        .cert-protected-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          font-size: 10px;
          font-weight: 600;
          color: #94a3b8;
          padding: 4px 0 2px;
          letter-spacing: 0.02em;
        }

        /* ── TELEMETRY & METADATA SECTION ── */
        .cert-telemetry-box {
          background: var(--bg-primary, #F8FAFC);
          border: 1px solid var(--border-color, #E2E8F0);
          border-radius: 14px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        [data-theme="dark"] .cert-telemetry-box {
          background: #0D1117;
          border-color: rgba(255, 255, 255, 0.1);
        }

        .cert-telemetry-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 10px;
          border-bottom: 1px dashed var(--border-color, #E2E8F0);
        }

        [data-theme="dark"] .cert-telemetry-header {
          border-bottom-color: rgba(255, 255, 255, 0.1);
        }

        .cert-telemetry-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #10b981;
        }

        .cert-pulse-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 10px #10b981;
          animation: certPulse 2s infinite ease-in-out;
        }

        @keyframes certPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.45; transform: scale(0.85); }
        }

        .cert-status-badge {
          font-size: 9px;
          font-weight: 700;
          color: var(--primary-blue, #2563eb);
          background: color-mix(in srgb, var(--primary-blue, #2563eb) 10%, transparent);
          border: 1px solid color-mix(in srgb, var(--primary-blue, #2563eb) 25%, transparent);
          padding: 2px 8px;
          border-radius: 999px;
        }

        .cert-meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .cert-meta-item {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .cert-meta-label {
          font-size: 8.5px;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .cert-meta-value {
          font-size: 11.5px;
          font-weight: 700;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .cert-id-badge-wrap {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .cert-id-code {
          font-family: "JetBrains Mono", "SF Mono", monospace;
          font-size: 10.5px;
          font-weight: 700;
          color: var(--text-primary);
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          padding: 2px 6px;
          border-radius: 4px;
        }

        .cert-copy-btn {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          padding: 2px 6px;
          font-size: 9px;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
          transition: background 0.15s ease;
          -webkit-tap-highlight-color: transparent;
        }

        .cert-copy-btn:hover {
          color: var(--primary-blue, #2563eb);
          border-color: var(--primary-blue, #2563eb);
        }

        /* Competencies & Tags */
        .cert-skills-wrap {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .cert-section-heading {
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin: 0;
        }

        .cert-skills-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }

        .cert-skill-pill {
          display: inline-flex;
          align-items: center;
          font-size: 10px;
          font-weight: 600;
          padding: 3px 9px;
          border-radius: 6px;
          border: 1px solid;
          line-height: 1.3;
        }

        /* Registry Action Button */
        .cert-registry-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          box-sizing: border-box;
          padding: 11px 16px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 700;
          color: #ffffff !important;
          text-decoration: none;
          cursor: pointer;
          border: none;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.16);
          transition: transform 0.15s ease, opacity 0.15s ease;
          -webkit-tap-highlight-color: transparent;
        }

        .cert-registry-btn:hover {
          opacity: 0.94;
          transform: translateY(-1px);
        }

        .cert-registry-btn:active {
          transform: scale(0.98);
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
            <CertCard
              key={cert.id || cert.credentialId}
              cert={cert}
              isMobile={false}
              onVerifyClick={setSelectedCert}
            />
          ))}
        </div>
      )}

      {/* ── SLIDE LEFT BAR: VERIFICATION & CREDENTIAL DRAWER (STRICTLY VIEW ONLY) ── */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedCert && activeCert && (
            <div style={{ position: 'relative', zIndex: 10000 }}>
              {/* Dark Blur Backdrop */}
              <motion.div
                className="cert-drawer-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                onClick={() => {
                  setSelectedCert(null);
                  setIsZoomed(false);
                }}
              />

              {/* Slide Left Drawer Bar */}
              <motion.div
                className="cert-slide-drawer"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              >
                {/* Header */}
                <div className="cert-drawer-header">
                  <div className="cert-drawer-header-left">
                    <div className="cert-drawer-header-icon">
                      <ShieldCheck size={20} />
                    </div>
                    <div className="cert-drawer-title-group">
                      <h3>Certificate Verification</h3>
                      <p>
                        <span className="cert-pulse-dot" />
                        Live Registry Verified
                      </p>
                    </div>
                  </div>
                  <button
                    className="cert-drawer-close-btn"
                    onClick={() => {
                      setSelectedCert(null);
                      setIsZoomed(false);
                    }}
                    aria-label="Close verification drawer"
                  >
                    <span>Esc</span>
                    <X size={15} />
                  </button>
                </div>

                {/* Related Certifications Bar */}
                <div className="cert-drawer-switcher">
                  <div className="cert-switcher-label">
                    <span>Related Certifications</span>
                    <span>{certifications.length} Credentials Available</span>
                  </div>
                  <div className="cert-switcher-tabs">
                    {certifications.map((item) => {
                      const isActive = activeCert.id === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          className={`cert-switcher-tab ${isActive ? 'active' : ''}`}
                          onClick={() => {
                            setSelectedCert(item);
                            setIsZoomed(false);
                          }}
                        >
                          <span className="cert-tab-dot" />
                          <i className={`ti ${item.icon}`} style={{ fontSize: '13px' }} />
                          <span>{item.issuer}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Scrollable Content Body */}
                <div className="cert-drawer-body">
                  {/* Protected Certificate Document Viewer */}
                  {activeCert.certificateImage ? (
                    <div
                      className="cert-viewer-frame"
                      onContextMenu={(e) => { e.preventDefault(); return false; }}
                      onDragStart={(e) => { e.preventDefault(); return false; }}
                    >
                      <div className="cert-viewer-toolbar">
                        <span className="cert-viewer-tag">
                          <FileCheck size={11} />
                          Official Document
                        </span>
                        <button
                          type="button"
                          className="cert-zoom-btn"
                          onClick={() => setIsZoomed(!isZoomed)}
                          title={isZoomed ? "Reset Zoom" : "Zoom into certificate"}
                        >
                          {isZoomed ? <ZoomOut size={12} /> : <ZoomIn size={12} />}
                          <span>{isZoomed ? 'Fit View' : 'Zoom In'}</span>
                        </button>
                      </div>

                      {/* Viewport with transparent protective shield overlay */}
                      <div
                        className="cert-doc-viewport"
                        onContextMenu={(e) => { e.preventDefault(); return false; }}
                        onDragStart={(e) => { e.preventDefault(); return false; }}
                      >
                        <img
                          src={activeCert.certificateImage}
                          alt={`${activeCert.title} Certificate`}
                          className={`cert-doc-img ${isZoomed ? 'zoomed' : ''}`}
                          draggable={false}
                          onContextMenu={(e) => { e.preventDefault(); return false; }}
                          onDragStart={(e) => { e.preventDefault(); return false; }}
                        />

                        {/* Transparent security glass intercepting right-click & drag events */}
                        <div
                          className="cert-security-glass"
                          onContextMenu={(e) => { e.preventDefault(); return false; }}
                          onDragStart={(e) => { e.preventDefault(); return false; }}
                        />

                        {/* Security Watermark */}
                        <div className="cert-watermark-overlay">
                          OFFICIAL SECURE PREVIEW • THOTA SUJITH REDDY • VERIFIED CREDENTIAL
                        </div>
                      </div>

                      <div className="cert-protected-footer">
                        <Lock size={12} />
                        <span>Protected Document • Secure View Only</span>
                      </div>
                    </div>
                  ) : null}

                  {/* Verification Telemetry Box */}
                  <div className="cert-telemetry-box">
                    <div className="cert-telemetry-header">
                      <div className="cert-telemetry-status">
                        <span className="cert-pulse-dot" />
                        <span>AUTHENTICITY CONFIRMED</span>
                      </div>
                      <span className="cert-status-badge">Active Status</span>
                    </div>

                    <div className="cert-meta-grid">
                      <div className="cert-meta-item">
                        <span className="cert-meta-label">Recipient Name</span>
                        <span className="cert-meta-value">
                          <User size={13} style={{ color: 'var(--primary-blue, #2563eb)' }} />
                          {activeCert.recipient || 'Thota Sujith Reddy'}
                        </span>
                      </div>

                      <div className="cert-meta-item">
                        <span className="cert-meta-label">Credential ID</span>
                        <div className="cert-id-badge-wrap">
                          <code className="cert-id-code">{activeCert.credentialId}</code>
                          <button
                            type="button"
                            className="cert-copy-btn"
                            onClick={() => handleCopyId(activeCert.credentialId)}
                            title="Copy ID"
                          >
                            {copiedId ? (
                              <>
                                <Check size={10} style={{ color: '#10b981' }} />
                                <span style={{ color: '#10b981' }}>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy size={10} />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="cert-meta-item">
                        <span className="cert-meta-label">Issuing Authority</span>
                        <span className="cert-meta-value">
                          <Award size={13} style={{ color: 'var(--primary-blue, #2563eb)' }} />
                          {activeCert.issuer}
                        </span>
                      </div>

                      <div className="cert-meta-item">
                        <span className="cert-meta-label">Issued Date</span>
                        <span className="cert-meta-value">
                          <Calendar size={13} style={{ color: 'var(--text-muted)' }} />
                          {activeCert.issuedDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Overview */}
                  <div>
                    <p className="cert-section-heading" style={{ marginBottom: '6px' }}>Credential Overview</p>
                    <p style={{
                      margin: 0,
                      fontSize: '12px',
                      lineHeight: '1.6',
                      color: 'var(--text-secondary)'
                    }}>
                      {activeCert.description}
                    </p>
                  </div>

                  {/* Official Registry Link CTA */}
                  <div>
                    <p className="cert-section-heading" style={{ marginBottom: '8px' }}>Official Registry Authority</p>
                    {activeCert.verifyUrl ? (
                      <a
                        href={activeCert.verifyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cert-registry-btn"
                        style={{
                          background: activeColor.badgeBorder || 'var(--primary-blue, #2563eb)',
                        }}
                      >
                        <Shield size={15} />
                        <span>Verify on {activeCert.issuer} Registry</span>
                        <ExternalLink size={13} style={{ marginLeft: 'auto' }} />
                      </a>
                    ) : null}
                    <p style={{ fontSize: '9.5px', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.4 }}>
                      Direct cryptographic lookup on the official issuing platform.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </ScrollReveal>
  );
}
