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

// ── Intelligent selector map ──────────────────────────────────────────────────
// Each value is an ordered list of CSS selectors to try (most specific → fallback).
// The first one found in the DOM wins.
const SECTION_SELECTORS = {
  home:           ['.home-grid', '.hero-info', '.home-content'],
  about:          ['.about-page', '.about-header'],
  skills:         ['.skills-grid', '.skills-page'],
  projects:       ['.project-card:first-child', '.projects-list', '.project-card'],
  education:      ['.edu-flip-card:first-child', '.edu-flip-card'],
  experience:     ['.exp-page', '.empty-state-card'],
  certifications: ['.certs-grid', '.cert-card:first-child'],
  contact:        ['.swipe-send-container'],
};

const STYLE_ID = 'ai-spotlight-ring-style';

function buildCSS(selector) {
  return `
    @keyframes ai-spotlight-pulse {
      0%   { box-shadow: 0 0 0 0   rgba(139,92,246,0.6),  0 0 32px 8px  rgba(139,92,246,0.25); outline-color: rgba(139,92,246,1); }
      50%  { box-shadow: 0 0 0 10px rgba(139,92,246,0.1), 0 0 60px 20px rgba(139,92,246,0.12); outline-color: rgba(99,102,241,0.7); }
      100% { box-shadow: 0 0 0 0   rgba(139,92,246,0.6),  0 0 32px 8px  rgba(139,92,246,0.25); outline-color: rgba(139,92,246,1); }
    }
    ${selector} {
      outline: 2.5px solid rgba(139,92,246,0.9) !important;
      outline-offset: 6px !important;
      border-radius: 14px !important;
      animation: ai-spotlight-pulse 2s ease-in-out infinite !important;
      scroll-margin-top: 80px;
    }
  `;
}

function resolveSelector(sectionId) {
  const candidates = SECTION_SELECTORS[sectionId] || [];
  for (const sel of candidates) {
    if (document.querySelector(sel)) return sel;
  }
  return null;
}

function injectHighlight(sectionId) {
  removeHighlight();
  const sel = resolveSelector(sectionId);
  if (!sel) return;

  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = buildCSS(sel);
  document.head.appendChild(el);

  // Scroll the highlighted element into view smoothly
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

  // Inject targeted CSS highlight ring when section activates
  useEffect(() => {
    if (section) {
      // Small delay so the page transition finishes before we inject
      const t = setTimeout(() => injectHighlight(section), 450);
      setCountdown(5);
      return () => clearTimeout(t);
    } else {
      removeHighlight();
    }
  }, [section]);

  // Cleanup on component unmount
  useEffect(() => () => removeHighlight(), []);

  // Countdown timer
  useEffect(() => {
    if (!section) return;
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onDismiss?.();
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
          key="spotlight-toast"
          initial={{ opacity: 0, y: -50, scale: 0.88 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.92 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
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
            background: 'linear-gradient(135deg, rgba(12,8,28,0.97) 0%, rgba(28,16,52,0.97) 100%)',
            border: '1px solid rgba(139,92,246,0.45)',
            borderRadius: 100,
            padding: '8px 14px 8px 10px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(139,92,246,0.12)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            userSelect: 'none',
            maxWidth: '90vw',
          }}>

            {/* Pulsing AI eye */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.85, 1, 0.85] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
              style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 14px rgba(139,92,246,0.6)',
                flexShrink: 0,
              }}
            >
              <Eye size={13} color="#fff" />
            </motion.div>

            {/* Labels */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(139,92,246,0.85)', textTransform: 'uppercase', letterSpacing: '0.7px', whiteSpace: 'nowrap' }}>
                AI Highlighting
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 170 }}>
                {label}
              </span>
            </div>

            {/* SVG countdown ring */}
            <div style={{ position: 'relative', width: 28, height: 28, flexShrink: 0 }}>
              <svg width="28" height="28" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
                <circle cx="14" cy="14" r="11" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2.5" />
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

            {/* Dismiss */}
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
                color: 'rgba(255,255,255,0.55)',
                flexShrink: 0,
                transition: 'all 0.18s',
                padding: 0,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(239,68,68,0.2)';
                e.currentTarget.style.color = '#f87171';
                e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.55)';
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
