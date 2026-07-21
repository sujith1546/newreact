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

// Inject + remove a dynamic stylesheet for the highlight ring on .ai-highlighted
const STYLE_ID = 'ai-spotlight-ring-style';

function injectHighlightStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = `
    @keyframes ai-spotlight-pulse {
      0%   { box-shadow: 0 0 0 0   rgba(139,92,246,0.55), 0 0 30px 6px  rgba(139,92,246,0.22); border-color: rgba(139,92,246,0.9); }
      50%  { box-shadow: 0 0 0 8px rgba(139,92,246,0.12), 0 0 55px 18px rgba(139,92,246,0.14); border-color: rgba(99,102,241,0.75); }
      100% { box-shadow: 0 0 0 0   rgba(139,92,246,0.55), 0 0 30px 6px  rgba(139,92,246,0.22); border-color: rgba(139,92,246,0.9); }
    }
    .ai-highlighted {
      border: 2px solid rgba(139,92,246,0.9) !important;
      border-radius: 18px !important;
      animation: ai-spotlight-pulse 2s ease-in-out infinite !important;
      outline: none !important;
      position: relative !important;
      z-index: 1 !important;
    }
  `;
  document.head.appendChild(el);
}

function removeHighlightStyle() {
  document.getElementById(STYLE_ID)?.remove();
}

export default function SectionSpotlight({ section, onDismiss }) {
  const [countdown, setCountdown] = useState(5);
  const label = SECTION_LABELS[section] || section;

  // Inject CSS highlight ring when section is active
  useEffect(() => {
    if (section) {
      injectHighlightStyle();
      setCountdown(5);
    } else {
      removeHighlightStyle();
    }
    return () => { /* keep style until explicit dismiss */ };
  }, [section]);

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

  // Cleanup on unmount
  useEffect(() => () => removeHighlightStyle(), []);

  return (
    <AnimatePresence>
      {section && (
        /* ── Floating dismissal toast — pinned top-center ─────────────── */
        <motion.div
          key="spotlight-toast"
          initial={{ opacity: 0, y: -48, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -36, scale: 0.92 }}
          transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
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
            background: 'linear-gradient(135deg, rgba(15,10,30,0.96) 0%, rgba(30,18,55,0.96) 100%)',
            border: '1px solid rgba(139,92,246,0.45)',
            borderRadius: 100,
            padding: '8px 14px 8px 10px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px rgba(139,92,246,0.15)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            userSelect: 'none',
            minWidth: 0,
            maxWidth: '90vw',
          }}>

            {/* Pulsing eye icon */}
            <motion.div
              animate={{ scale: [1, 1.18, 1], opacity: [0.85, 1, 0.85] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 14px rgba(139,92,246,0.55)',
                flexShrink: 0,
              }}
            >
              <Eye size={13} color="#fff" />
            </motion.div>

            {/* Label */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(139,92,246,0.85)', textTransform: 'uppercase', letterSpacing: '0.6px', whiteSpace: 'nowrap' }}>
                AI Highlight
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160 }}>
                {label}
              </span>
            </div>

            {/* Countdown ring */}
            <div style={{ position: 'relative', width: 28, height: 28, flexShrink: 0 }}>
              <svg width="28" height="28" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
                <circle cx="14" cy="14" r="11" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2.5" />
                <motion.circle
                  cx="14" cy="14" r="11"
                  fill="none"
                  stroke="rgba(139,92,246,0.8)"
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
              onClick={onDismiss}
              title="Remove highlight"
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '50%',
                width: 26,
                height: 26,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255,255,255,0.55)',
                flexShrink: 0,
                transition: 'all 0.18s',
                padding: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            >
              <X size={12} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
