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

export default function SectionSpotlight({ section, onDismiss }) {
  const [countdown, setCountdown] = useState(4);
  const label = SECTION_LABELS[section] || section;

  // Auto-dismiss countdown
  useEffect(() => {
    if (!section) return;
    setCountdown(4);
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

  return (
    <AnimatePresence>
      {section && (
        <>
          {/* ── Full-screen dim overlay ──────────────────────────────────── */}
          <motion.div
            key="spotlight-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.45)',
              backdropFilter: 'blur(2px)',
              WebkitBackdropFilter: 'blur(2px)',
              zIndex: 8999,
              pointerEvents: 'none',
            }}
          />

          {/* ── Floating AI badge ────────────────────────────────────────── */}
          <motion.div
            key="spotlight-badge"
            initial={{ opacity: 0, y: -30, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 9000,
              pointerEvents: 'auto',
            }}
          >
            <div style={{
              background: 'linear-gradient(135deg, rgba(20,20,35,0.98) 0%, rgba(30,20,50,0.98) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.5)',
              borderRadius: '20px',
              padding: '20px 28px',
              boxShadow: '0 0 40px rgba(139, 92, 246, 0.3), 0 20px 60px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '14px',
              maxWidth: '340px',
              width: '90vw',
            }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
                {/* Pulsing AI eye icon */}
                <motion.div
                  animate={{ scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }}
                  transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 16px rgba(139,92,246,0.6)',
                    flexShrink: 0,
                  }}
                >
                  <Eye size={18} color="#fff" />
                </motion.div>

                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '11px', color: 'rgba(139,92,246,0.9)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                    AI Screen Director
                  </p>
                  <p style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#fff', lineHeight: 1.3 }}>
                    {label}
                  </p>
                </div>

                {/* Dismiss button */}
                <button
                  onClick={onDismiss}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(255,255,255,0.5)',
                    flexShrink: 0,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                >
                  <X size={14} />
                </button>
              </div>

              {/* Description */}
              <p style={{
                margin: 0,
                fontSize: '13px',
                color: 'rgba(255,255,255,0.6)',
                textAlign: 'center',
                lineHeight: 1.6,
              }}>
                I've navigated you to the <strong style={{ color: 'rgba(139,92,246,0.9)' }}>{label}</strong> section. Explore it below!
              </p>

              {/* Progress bar countdown */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{
                  width: '100%',
                  height: '3px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '2px',
                  overflow: 'hidden',
                }}>
                  <motion.div
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: 4, ease: 'linear' }}
                    style={{
                      height: '100%',
                      background: 'linear-gradient(90deg, #8b5cf6, #3b82f6)',
                      borderRadius: '2px',
                    }}
                  />
                </div>
                <p style={{
                  margin: 0,
                  fontSize: '11px',
                  color: 'rgba(255,255,255,0.3)',
                  textAlign: 'center',
                }}>
                  Dismissing in {countdown}s
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
