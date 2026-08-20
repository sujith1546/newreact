import React from 'react';
import { motion } from 'framer-motion';
import { Lock, ShieldAlert, Home, Mail, ArrowLeft, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import haptic from '../../lib/haptics';

export default function DisabledModuleGate({
  moduleId = 'section',
  moduleTitle = 'Section',
  moduleDescription = 'This module is temporarily unavailable.',
  onNavClick = null,
}) {
  const navigate = useNavigate();

  const handleGoHome = () => {
    try {
      haptic.medium();
    } catch (_) {}
    if (typeof onNavClick === 'function') {
      onNavClick('home');
    } else {
      navigate('/home');
    }
  };

  const handleGoContact = () => {
    try {
      haptic.light();
    } catch (_) {}
    if (typeof onNavClick === 'function') {
      onNavClick('contact');
    } else {
      navigate('/contact');
    }
  };

  return (
    <div
      style={{
        width: '100%',
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px 16px',
        boxSizing: 'border-box',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: '100%',
          maxWidth: '540px',
          background: 'var(--bg-secondary, rgba(15, 23, 42, 0.75))',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
          borderRadius: '24px',
          padding: '40px 28px',
          textAlign: 'center',
          boxShadow:
            '0 20px 50px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(239, 68, 68, 0.15)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle Ambient Radial Glow */}
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '240px',
            height: '140px',
            background:
              'radial-gradient(ellipse at center, rgba(239, 68, 68, 0.22) 0%, rgba(239, 68, 68, 0) 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Lock Icon Emblem */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '72px',
            height: '72px',
            borderRadius: '20px',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            marginBottom: '20px',
            boxShadow: '0 8px 24px rgba(239, 68, 68, 0.2)',
          }}
        >
          <Lock size={32} color="#EF4444" strokeWidth={2.2} />
        </div>

        {/* Status Pill */}
        <div>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '999px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#F87171',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '14px',
            }}
          >
            <ShieldAlert size={12} />
            Disabled by Admin
          </span>
        </div>

        {/* Title */}
        <h2
          style={{
            margin: '0 0 10px',
            fontSize: '24px',
            fontWeight: 800,
            color: 'var(--text-primary, #F8FAFC)',
            letterSpacing: '-0.02em',
          }}
        >
          {moduleTitle}
        </h2>

        {/* Description */}
        <p
          style={{
            margin: '0 auto 28px',
            fontSize: '14px',
            lineHeight: 1.6,
            color: 'var(--text-secondary, #94A3B8)',
            maxWidth: '420px',
          }}
        >
          This section is currently disabled by the portfolio administrator.
          Content is hidden until the administrator re-enables access.
        </p>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
          }}
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleGoHome}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '11px 22px',
              borderRadius: '12px',
              background: 'var(--primary-blue, #3B82F6)',
              color: '#FFFFFF',
              fontSize: '13.5px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.35)',
              outline: 'none',
            }}
          >
            <Home size={16} />
            Return to Home
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleGoContact}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '11px 20px',
              borderRadius: '12px',
              background: 'var(--bg-primary, rgba(255, 255, 255, 0.06))',
              color: 'var(--text-primary, #F8FAFC)',
              fontSize: '13.5px',
              fontWeight: 600,
              border: '1px solid var(--border-color, rgba(255, 255, 255, 0.15))',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <Mail size={16} />
            Get in Touch
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
