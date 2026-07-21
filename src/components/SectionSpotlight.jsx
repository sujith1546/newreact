import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, X } from 'lucide-react';

const SECTION_LABELS = {
  home:           'Home',
  about:          'About Me',
  skills:         'Skills & Expertise',
  projects:       'Featured Projects',
  education:      'Education',
  experience:     'Experience',
  certifications: 'Certifications',
  contact:        'Contact',
};

// ── Per-section precision selector waterfall ──────────────────────────────────
// Desktop selectors first, mobile fallbacks second.
// resolveSelector() walks the list and returns the FIRST one found in real DOM.
const SECTION_SELECTORS = {
  // Home → highlight the 2-col hero grid (desktop) or the mobile dashboard profile card
  home: [
    '.home-grid',
    '.dashboard-profile-card',
    '.hero-info',
    '.home-content',
  ],

  // About → highlight the micro-timeline (career journey) + bio block
  about: [
    '.micro-timeline',
    '.about-page',
    '.about-header',
  ],

  // Skills → highlight the interactive 2-col card grid (desktop) or mobile grid
  skills: [
    '.skills-grid',
    '.skills-mobile-grid',
    '.skill-category-card',
    '.skills-page',
  ],

  // Projects → highlight the auto-fit projects grid (desktop) or mobile list
  projects: [
    '.projects-grid',
    '.mpj-list',
    '.project-card',
  ],

  // Education → highlight the 4-col flip-card grid (desktop) or mobile feed
  education: [
    '.edu-grid',
    '.mobile-edu-feed',
    '.edu-flip-card',
    '.edu-page',
  ],

  // Experience → highlight the experience page / empty state
  experience: [
    '.empty-state-card',
    '.exp-page',
    '.exp-header',
  ],

  // Certifications → highlight the cert cards grid (desktop) or mobile feed
  certifications: [
    '.certs-grid',
    '.mobile-certs-feed',
    '.cert-card',
    '.cert-hero-card',
  ],

  // Contact → highlight the contact info panel (desktop) or cards grid (mobile)
  contact: [
    '.fc-info-panel',
    '.mc-cards-grid',
    '.contact-page-wrap',
    '.cc-hero',
    '.swipe-send-container',
  ],
};

// ── Per-section border-radius for the glow ring ───────────────────────────────
const SECTION_RADIUS = {
  home:           '20px',
  about:          '14px',
  skills:         '14px',
  projects:       '16px',
  education:      '16px',
  experience:     '16px',
  certifications: '16px',
  contact:        '18px',
};

const STYLE_ID = 'ai-spotlight-ring-style';

function buildCSS(selector, radius) {
  // Escape any : characters in selectors for use in CSS body selectors
  const escaped = selector.replace(/:/g, '\\:');
  return `
    @keyframes ai-spotlight-pulse {
      0%   {
        box-shadow:   0 0 0 0   rgba(139,92,246,0.65),
                      0 0 30px 8px  rgba(139,92,246,0.30);
        outline-color: rgba(139,92,246,1);
      }
      50%  {
        box-shadow:   0 0 0 12px rgba(139,92,246,0.07),
                      0 0 60px 22px rgba(139,92,246,0.13);
        outline-color: rgba(99,102,241,0.65);
      }
      100% {
        box-shadow:   0 0 0 0   rgba(139,92,246,0.65),
                      0 0 30px 8px  rgba(139,92,246,0.30);
        outline-color: rgba(139,92,246,1);
      }
    }

    /* ── Precise glow ring on target element ── */
    ${selector} {
      outline: 2.5px solid rgba(139,92,246,0.92) !important;
      outline-offset: 8px !important;
      border-radius: ${radius} !important;
      animation: ai-spotlight-pulse 2.2s ease-in-out infinite !important;
      position: relative;
      z-index: 2;
      scroll-margin-top: 80px;
      scroll-margin-bottom: 40px;
    }
  `;
}

function resolveSelector(sectionId) {
  const candidates = SECTION_SELECTORS[sectionId] || [];
  for (const sel of candidates) {
    try {
      if (document.querySelector(sel)) return sel;
    } catch (_) {}
  }
  return null;
}

function injectHighlight(sectionId) {
  removeHighlight();
  const sel = resolveSelector(sectionId);
  if (!sel) return;

  const radius = SECTION_RADIUS[sectionId] || '14px';
  const styleEl = document.createElement('style');
  styleEl.id = STYLE_ID;
  styleEl.textContent = buildCSS(sel, radius);
  document.head.appendChild(styleEl);

  // Smoothly scroll the highlighted element into the center of the viewport
  const target = document.querySelector(sel);
  if (target) {
    setTimeout(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 350);
  }
}

function removeHighlight() {
  document.getElementById(STYLE_ID)?.remove();
}

// ─────────────────────────────────────────────────────────────────────────────

export default function SectionSpotlight({ section, onDismiss }) {
  const [countdown, setCountdown] = useState(5);
  const label = SECTION_LABELS[section] || section;

  // Inject targeted highlight ring after page transition finishes
  useEffect(() => {
    if (section) {
      setCountdown(5);
      // Delay until the page slide animation completes (~400ms)
      const t = setTimeout(() => injectHighlight(section), 480);
      return () => clearTimeout(t);
    } else {
      removeHighlight();
    }
  }, [section]);

  // Cleanup on unmount
  useEffect(() => () => removeHighlight(), []);

  // Countdown auto-dismiss
  useEffect(() => {
    if (!section) return;
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [section]);

  const handleDismiss = () => {
    removeHighlight();
    onDismiss?.();
  };

  return (
    <AnimatePresence>
      {section && (
        <motion.div
          key={`spotlight-toast-${section}`}
          initial={{ opacity: 0, y: -54, scale: 0.84 }}
          animate={{ opacity: 1, y: 0,   scale: 1    }}
          exit={{    opacity: 0, y: -44,  scale: 0.9  }}
          transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'fixed',
            top: 14,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9500,
            pointerEvents: 'auto',
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'linear-gradient(135deg, rgba(10,6,24,0.97) 0%, rgba(26,14,50,0.97) 100%)',
            border: '1px solid rgba(139,92,246,0.4)',
            borderRadius: 100,
            padding: '8px 14px 8px 10px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.55), 0 0 0 1px rgba(139,92,246,0.08)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            userSelect: 'none',
            maxWidth: '92vw',
          }}>

            {/* Pulsing AI eye */}
            <motion.div
              animate={{ scale: [1, 1.22, 1], opacity: [0.82, 1, 0.82] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
              style={{
                width: 30, height: 30, borderRadius: '50%',
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 16px rgba(139,92,246,0.65)',
                flexShrink: 0,
              }}
            >
              <Eye size={14} color="#fff" />
            </motion.div>

            {/* Label */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
              <span style={{
                fontSize: 9.5, fontWeight: 700,
                color: 'rgba(139,92,246,0.82)',
                textTransform: 'uppercase', letterSpacing: '0.8px',
                whiteSpace: 'nowrap',
              }}>
                AI Highlighting
              </span>
              <span style={{
                fontSize: 13, fontWeight: 700, color: '#fff',
                whiteSpace: 'nowrap', overflow: 'hidden',
                textOverflow: 'ellipsis', maxWidth: 180,
              }}>
                {label}
              </span>
            </div>

            {/* SVG countdown ring */}
            <div style={{ position: 'relative', width: 28, height: 28, flexShrink: 0 }}>
              <svg width="28" height="28" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
                <circle cx="14" cy="14" r="11" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="2.5" />
                <motion.circle
                  cx="14" cy="14" r="11"
                  fill="none"
                  stroke="rgba(139,92,246,0.85)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 11}
                  initial={{ strokeDashoffset: 0 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 11 }}
                  transition={{ duration: 5, ease: 'linear' }}
                />
              </svg>
              <span style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.7)',
              }}>
                {countdown}
              </span>
            </div>

            {/* Dismiss X */}
            <button
              onClick={handleDismiss}
              title="Remove highlight"
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '50%',
                width: 26, height: 26,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'rgba(255,255,255,0.5)',
                flexShrink: 0,
                transition: 'all 0.18s ease',
                padding: 0,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(239,68,68,0.22)';
                e.currentTarget.style.color = '#f87171';
                e.currentTarget.style.borderColor = 'rgba(239,68,68,0.35)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
              }}
            >
              <X size={12} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
