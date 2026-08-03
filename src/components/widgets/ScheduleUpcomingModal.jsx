import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Calendar, Clock, Video, Mail, Bell, Check } from 'lucide-react';

export default function ScheduleUpcomingModal({ isOpen, onClose }) {
  const [notified, setNotified] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleNotifyMe = () => {
    setNotified(true);
    setTimeout(() => setNotified(false), 3000);
  };

  const handleEmailDirect = () => {
    window.location.href = "mailto:sujithreddy1546@gmail.com?subject=Schedule%2015-min%20Call";
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="scheduling-modal-title"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.55)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          />

          {/* Modal Card */}
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.88, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 15 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '460px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '16px',
              border: '1px solid var(--border-color)',
              padding: '1.75rem',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
              zIndex: 100000,
              overflow: 'hidden',
              userSelect: 'none'
            }}
          >
            {/* Ambient Accent Glow */}
            <div
              style={{
                position: 'absolute',
                top: '-40px',
                right: '-40px',
                width: '160px',
                height: '160px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, color-mix(in srgb, var(--primary-blue) 20%, transparent) 0%, transparent 70%)',
                filter: 'blur(25px)',
                pointerEvents: 'none'
              }}
            />

            {/* Header with Pill Badge and Close Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--primary-blue)',
                  backgroundColor: 'color-mix(in srgb, var(--primary-blue) 12%, var(--bg-primary))',
                  border: '1px solid color-mix(in srgb, var(--primary-blue) 25%, transparent)',
                  padding: '4px 10px',
                  borderRadius: '999px',
                }}
              >
                <Sparkles size={14} /> Coming soon
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  padding: '4px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.15s ease'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Title & Subtitle */}
            <h3 id="scheduling-modal-title" style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              Instant scheduling
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', margin: '0 0 1.5rem', lineHeight: 1.6 }}>
              Book time on my calendar directly — no back-and-forth emails.
            </p>

            {/* Feature Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.5rem' }}>
              <FeatureRow
                icon={<Calendar size={17} color="var(--primary-blue)" />}
                bg="color-mix(in srgb, var(--primary-blue) 12%, var(--bg-primary))"
                title="Live availability"
                desc="Pick a 15 or 30 min slot that works for you"
              />
              <FeatureRow
                icon={<Clock size={17} color="#10b981" />}
                bg="rgba(16, 185, 129, 0.12)"
                title="Auto timezone match"
                desc="Times shown adjust to your location"
              />
              <FeatureRow
                icon={<Video size={17} color="#8b5cf6" />}
                bg="rgba(139, 92, 246, 0.12)"
                title="Video link included"
                desc="Meet link generated automatically on booking"
              />
            </div>

            {/* Equal-width Actions */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={handleEmailDirect}
                style={{
                  flex: 1,
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(15, 23, 42, 0.25)',
                  transition: 'transform 0.1s ease, opacity 0.15s ease'
                }}
              >
                <Mail size={15} /> Email me instead
              </button>
              <button
                type="button"
                onClick={handleNotifyMe}
                style={{
                  flex: 1,
                  backgroundColor: notified ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-primary)',
                  color: notified ? '#10b981' : 'var(--text-primary)',
                  border: notified ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {notified ? <Check size={15} /> : <Bell size={15} />}
                {notified ? 'Notified!' : 'Notify me'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function FeatureRow({ icon, bg, title, desc }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px',
        border: '1px solid var(--border-color)',
        borderRadius: '10px',
        backgroundColor: 'var(--bg-primary)',
        transition: 'border-color 0.15s ease'
      }}
    >
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          backgroundColor: bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <p style={{ fontSize: '13.5px', fontWeight: 700, margin: '0 0 2px', color: 'var(--text-primary)' }}>{title}</p>
        <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>{desc}</p>
      </div>
    </div>
  );
}
