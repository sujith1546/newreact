import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Sparkles, Cpu, Layers, ShieldCheck, Mail, Code2, Zap, Terminal, Smartphone, Calendar, Database, Activity, Gauge } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';

const MARQUEE_ROW_1 = [
  { icon: <Code2 size={13} color="#3b82f6" />, name: "React 18", tag: "UI Core" },
  { icon: <Zap size={13} color="#ec4899" />, name: "Vite 6", tag: "Fast Build" },
  { icon: <Layers size={13} color="#f59e0b" />, name: "Supabase", tag: "Database" },
  { icon: <Activity size={13} color="#06b6d4" />, name: "Framer Motion", tag: "60 FPS" },
  { icon: <Code2 size={13} color="#10b981" />, name: "TypeScript", tag: "Strict Types" },
];

const MARQUEE_ROW_2 = [
  { icon: <Sparkles size={13} color="#a855f7" />, name: "Dynamic Island", tag: "HUD Notify" },
  { icon: <Terminal size={13} color="#3b82f6" />, name: "Cmd Palette", tag: "Ctrl+K" },
  { icon: <Smartphone size={13} color="#10b981" />, name: "Mobile View", tag: "Simulator" },
  { icon: <Calendar size={13} color="#f59e0b" />, name: "Instant Booking", tag: "Calendar" },
  { icon: <ShieldCheck size={13} color="#06b6d4" />, name: "PWA v1.3.0", tag: "Offline Mode" },
];

export default function CraftedWithLoveModal({ isOpen, onClose }) {
  const { theme } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="crafted-modal-title"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
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
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
            }}
          />

          {/* Modal Container */}
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 12 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '540px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '20px',
              border: '1px solid var(--border-color)',
              padding: '24px 26px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
              color: 'var(--text-primary)',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              zIndex: 1000000,
              overflow: 'hidden',
              userSelect: 'none'
            }}
          >
            {/* Ambient Background Glow */}
            <div
              style={{
                position: 'absolute',
                top: '-60px',
                right: '-60px',
                width: '220px',
                height: '220px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(239, 68, 68, 0.18) 0%, transparent 70%)',
                filter: 'blur(40px)',
                pointerEvents: 'none'
              }}
            />

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ef4444'
                }}>
                  <Heart size={20} fill="#ef4444" />
                </div>
                <div>
                  <h3 id="crafted-modal-title" style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                    Crafted with Love
                  </h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
                    Designed & Engineered by Sujith Thota
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  width: '30px',
                  height: '30px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.borderColor = 'var(--text-muted)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-muted)';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Hero Quote Card */}
            <div style={{
              padding: '14px 16px',
              borderRadius: '14px',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              marginBottom: '16px',
              fontSize: '12.5px',
              color: 'var(--text-secondary)',
              lineHeight: 1.55
            }}>
              <p style={{ margin: '0 0 4px', fontWeight: 700, color: 'var(--text-primary)' }}>
                ✨ "Crafted with passion, precision, and modern web engineering."
              </p>
              <span>
                Ultra-fast responsive portfolio engineered with React 18, Vite 6, dynamic glassmorphism, and seamless PWA offline performance.
              </span>
            </div>

            {/* Dual Infinite Scroll Marquee Stack */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
              <span style={{ fontSize: '10.5px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                ARCHITECTURE & FEATURES MARQUEE
              </span>

              <InfiniteMarqueeTrack items={MARQUEE_ROW_1} direction="left" duration={22} />
              <InfiniteMarqueeTrack items={MARQUEE_ROW_2} direction="right" duration={26} />
            </div>

            {/* Technology Stack Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              <TechStackCard
                icon={<Code2 size={15} color="var(--primary-blue)" />}
                title="Frontend Core"
                desc="React 18 · Vite 6 · Framer Motion"
              />
              <TechStackCard
                icon={<Gauge size={15} color="#10b981" />}
                title="Performance & Design"
                desc="Glassmorphism · 60 FPS · PWA v1.3"
              />
            </div>

            {/* Footer Action Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <a
                href="https://github.com/sujith1546/newreact"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1,
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  fontSize: '13px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <FaGithub size={15} /> Star on GitHub
              </a>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  window.dispatchEvent(new CustomEvent('open-email'));
                }}
                style={{
                  flex: 1,
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--primary-blue)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px color-mix(in srgb, var(--primary-blue) 35%, transparent)'
                }}
              >
                <Mail size={15} /> Get in Touch
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

function InfiniteMarqueeTrack({ items, direction = 'left', duration = 24 }) {
  const quadItems = [...items, ...items, ...items, ...items];
  const animName = direction === 'left' ? 'marqueeScrollLeft' : 'marqueeScrollRight';

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '34px',
      borderRadius: '10px',
      backgroundColor: 'var(--bg-primary)',
      border: '1px solid var(--border-color)',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center'
    }}>
      <style>{`
        @keyframes marqueeScrollLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marqueeScrollRight {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .crafted-marquee-track:hover {
          animation-play-state: paused !important;
        }
      `}</style>

      {/* Gradient Fade Masks */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: '28px',
        background: 'linear-gradient(to right, var(--bg-primary) 20%, transparent)',
        zIndex: 2,
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: '28px',
        background: 'linear-gradient(to left, var(--bg-primary) 20%, transparent)',
        zIndex: 2,
        pointerEvents: 'none'
      }} />

      {/* Continuous Animated Track */}
      <div
        className="crafted-marquee-track"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          width: 'max-content',
          animation: `${animName} ${duration}s linear infinite`
        }}
      >
        {quadItems.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 8px',
              borderRadius: '6px',
              backgroundColor: 'color-mix(in srgb, var(--text-primary) 5%, var(--bg-primary))',
              border: '1px solid var(--border-color)',
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap'
            }}
          >
            {item.icon}
            <span>{item.name}</span>
            <span style={{
              fontSize: '9px',
              fontWeight: 800,
              padding: '1px 4px',
              borderRadius: '4px',
              backgroundColor: 'color-mix(in srgb, var(--primary-blue) 14%, transparent)',
              color: 'var(--primary-blue)'
            }}>
              {item.tag}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TechStackCard({ icon, title, desc }) {
  return (
    <div style={{
      padding: '10px 12px',
      borderRadius: '10px',
      backgroundColor: 'var(--bg-primary)',
      border: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      gap: '3px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {icon}
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</span>
      </div>
      <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>{desc}</span>
    </div>
  );
}

