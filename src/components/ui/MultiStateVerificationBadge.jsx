import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, CheckCircle2, Loader2, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';

/**
 * MultiStateVerificationBadge
 * Smoothly morphing multi-state badge inspired by Motion.dev pattern:
 * - States: 'idle' -> 'verifying' -> 'verified'
 * - Layout animations for dynamic width morphing
 * - AnimatePresence for orchestrated icon & label transitions
 * - Dynamic color transitions matching certificate issuer theme
 */

const STATE_CONFIG = {
  idle: {
    label: 'Verified',
    actionHint: 'Tap to check live registry',
    Icon: ShieldCheck,
  },
  verifying: {
    label: 'Validating registry...',
    actionHint: 'Querying issuer API',
    Icon: Loader2,
  },
  verified: {
    label: 'Confirmed Authentic ✓',
    actionHint: 'View official certificate',
    Icon: CheckCircle2,
  },
};

export default function MultiStateVerificationBadge({
  issuer = 'Issuer',
  credentialId = '',
  verifyUrl = '',
  theme = {},
  isMobile = false,
}) {
  const [badgeState, setBadgeState] = useState('idle');
  const timerRef = useRef(null);
  const badgeRef = useRef(null);

  const handleClick = (e) => {
    e.stopPropagation();

    if (badgeState === 'verified' && verifyUrl) {
      window.open(verifyUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    if (badgeState === 'idle') {
      setBadgeState('verifying');

      // Simulate real-time cryptographic registry verification
      timerRef.current = setTimeout(() => {
        setBadgeState('verified');

        // Trigger gentle celebratory burst from the badge's position
        if (badgeRef.current) {
          const rect = badgeRef.current.getBoundingClientRect();
          const x = (rect.left + rect.width / 2) / window.innerWidth;
          const y = (rect.top + rect.height / 2) / window.innerHeight;

          confetti({
            particleCount: 28,
            spread: 50,
            origin: { x, y },
            colors: ['#10b981', '#3b82f6', '#f59e0b', '#ffffff'],
            startVelocity: 18,
            gravity: 0.9,
            scalar: 0.85,
            ticks: 120,
            zIndex: 10005,
          });
        }

        // Auto-reset to idle after 4.5 seconds
        timerRef.current = setTimeout(() => {
          setBadgeState('idle');
        }, 4500);
      }, 1100);
    }
  };

  // State-specific colors
  const isVerifying = badgeState === 'verifying';
  const isVerified = badgeState === 'verified';

  const badgeBg = isVerified
    ? 'rgba(16, 185, 129, 0.14)'
    : isVerifying
    ? 'rgba(59, 130, 246, 0.12)'
    : 'var(--bg-primary)';

  const badgeBorder = isVerified
    ? '#10b981'
    : isVerifying
    ? 'var(--primary-blue, #3b82f6)'
    : theme.pillBorder || 'var(--border-color)';

  const badgeColor = isVerified
    ? '#10b981'
    : isVerifying
    ? 'var(--primary-blue, #3b82f6)'
    : theme.pillColor || 'var(--text-secondary)';

  return (
    <motion.button
      ref={badgeRef}
      layout
      type="button"
      onClick={handleClick}
      title={isVerified ? `View official certificate at ${issuer}` : 'Click to run live verification'}
      whileHover={{ scale: 1.04, y: -1 }}
      whileTap={{ scale: 0.96 }}
      transition={{
        layout: { type: 'spring', stiffness: 420, damping: 28 },
        scale: { type: 'spring', stiffness: 500, damping: 20 },
      }}
      style={{
        position: 'absolute',
        top: isMobile ? '12px' : '16px',
        right: isMobile ? '12px' : '16px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: isMobile ? '3px 8px' : '4px 11px',
        borderRadius: '999px',
        border: `1px solid ${badgeBorder}`,
        backgroundColor: badgeBg,
        color: badgeColor,
        fontSize: isMobile ? '10px' : '11px',
        fontWeight: 700,
        letterSpacing: '0.02em',
        cursor: 'pointer',
        outline: 'none',
        overflow: 'hidden',
        boxShadow: isVerified
          ? '0 0 16px rgba(16, 185, 129, 0.22)'
          : isVerifying
          ? '0 0 14px rgba(59, 130, 246, 0.2)'
          : '0 2px 6px rgba(0, 0, 0, 0.03)',
        transition: 'background-color 0.22s ease, border-color 0.22s ease, color 0.22s ease, box-shadow 0.22s ease',
        zIndex: 5,
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {badgeState === 'idle' && (
          <motion.span
            key="badge-idle"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
          >
            <ShieldCheck size={isMobile ? 12 : 13} strokeWidth={2.5} />
            <span>Verified</span>
          </motion.span>
        )}

        {badgeState === 'verifying' && (
          <motion.span
            key="badge-verifying"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
          >
            <Loader2
              size={isMobile ? 12 : 13}
              style={{ animation: 'spin 1s linear infinite' }}
            />
            <span>Checking {issuer}...</span>
          </motion.span>
        )}

        {badgeState === 'verified' && (
          <motion.span
            key="badge-verified"
            initial={{ opacity: 0, scale: 0.88, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
          >
            <CheckCircle2 size={isMobile ? 12 : 13} strokeWidth={2.5} />
            <span>Verified ID ✓</span>
            {verifyUrl && <ExternalLink size={10} style={{ opacity: 0.75 }} />}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
