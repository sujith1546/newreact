import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Smartphone } from 'lucide-react';

/**
 * Ultra-Clean Apple Dynamic Island HUD for mode transitions
 * Perfectly centered, sleek, and matches the portfolio design system.
 */
export default function AdminModeTransitionHUD({ targetMode, isVisible }) {
  const isMobile = targetMode === 'mobile';
  const Icon = isMobile ? Smartphone : Monitor;
  const label = isMobile ? 'Mobile Shell' : 'Desktop Workspace';
  const dimension = isMobile ? '390px' : '1440px';

  return (
    <AnimatePresence>
      {isVisible && (
        <div
          style={{
            position: 'fixed',
            top: 16,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 999999,
            pointerEvents: 'none',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: -18, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.94 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 9,
              padding: '6px 14px 6px 10px',
              borderRadius: 30,
              background: 'var(--bg-glass, rgba(16, 18, 22, 0.92))',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid var(--border-color, rgba(255, 255, 255, 0.14))',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.06)',
            }}
          >
            {/* Device Icon Capsule */}
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: 7,
                background: isMobile ? 'rgba(59, 130, 246, 0.16)' : 'rgba(16, 185, 129, 0.16)',
                color: isMobile ? 'var(--primary-blue, #3b82f6)' : '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon size={13} strokeWidth={2.2} />
            </div>

            {/* Label and Details */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'var(--text-primary, #ffffff)',
                  fontFamily: 'var(--font-sans)',
                  letterSpacing: '-0.01em',
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: 'var(--text-muted, #94a3b8)',
                  fontFamily: 'var(--font-sans)',
                  whiteSpace: 'nowrap',
                }}
              >
                • {dimension}
              </span>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#10b981',
                  boxShadow: '0 0 6px #10b981',
                  marginLeft: 2,
                }}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
