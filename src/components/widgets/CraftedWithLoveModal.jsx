import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Heart, Sparkles, Layers, ShieldCheck, Mail,
  Code2, Zap, Terminal, Smartphone, Calendar, Database,
  Activity, Gauge, Cpu, CheckCircle2, ArrowRight
} from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'stack'

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  const isDarkMode =
    theme === 'dark' ||
    (typeof document !== 'undefined' &&
      document.documentElement.getAttribute('data-theme') === 'dark');

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="cwl-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            background: isDarkMode
              ? 'rgba(0, 0, 0, 0.55)'
              : 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            boxSizing: 'border-box',
          }}
        >
          <style>{`
            .cwl-modal-card {
              --modal-bg: rgba(255, 255, 255, 0.98);
              --modal-border: #e2e8f0;
              --modal-text: #0f172a;
              --modal-muted: #64748b;
              --modal-field-bg: #f8fafc;
              --modal-field-border: #cbd5e1;
              --modal-tab-track: #f1f5f9;
              --modal-tab-active-bg: #0f172a;
              --modal-tab-active-text: #ffffff;
              --modal-btn-bg: #0f172a;
              --modal-btn-hover: #1e293b;
              --modal-btn-text: #ffffff;
              --modal-shadow: 0 20px 50px -12px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05);
              backdrop-filter: blur(20px);
              -webkit-backdrop-filter: blur(20px);
              color-scheme: light;
            }

            .cwl-modal-card.dark-mode {
              --modal-bg: rgba(20, 22, 28, 0.96);
              --modal-border: rgba(255, 255, 255, 0.12);
              --modal-text: #ffffff;
              --modal-muted: #94a3b8;
              --modal-field-bg: #22242a;
              --modal-field-border: rgba(255, 255, 255, 0.14);
              --modal-tab-track: #141518;
              --modal-tab-active-bg: #ffffff;
              --modal-tab-active-text: #0f172a;
              --modal-btn-bg: #ffffff;
              --modal-btn-hover: #f1f5f9;
              --modal-btn-text: #0f172a;
              --modal-shadow: 0 24px 60px -12px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(20px);
              -webkit-backdrop-filter: blur(20px);
              color-scheme: dark;
            }

            .cwl-action-btn:hover {
              opacity: 0.92;
              transform: translateY(-1px);
            }
            .cwl-secondary-btn:hover {
              background: var(--modal-tab-track) !important;
              color: var(--modal-text) !important;
            }
          `}</style>

          {/* Ambient Glow Aura */}
          <div
            style={{
              position: 'absolute',
              width: '380px',
              height: '380px',
              borderRadius: '50%',
              background: isDarkMode
                ? 'radial-gradient(circle, rgba(239, 68, 68, 0.18) 0%, rgba(99, 102, 241, 0.1) 45%, transparent 70%)'
                : 'radial-gradient(circle, rgba(239, 68, 68, 0.12) 0%, rgba(99, 102, 241, 0.08) 45%, transparent 70%)',
              filter: 'blur(40px)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />

          <motion.div
            key="cwl-modal-content"
            className={`cwl-modal-card ${isDarkMode ? 'dark-mode' : 'light-mode'}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="crafted-modal-title"
            initial={{ opacity: 0, scale: 0.88, y: 28, filter: 'blur(6px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.94, y: 16, filter: 'blur(4px)', transition: { duration: 0.16, ease: [0.32, 0, 0.67, 0] } }}
            transition={{ type: 'spring', damping: 25, stiffness: 350, mass: 0.85 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '400px',
              width: '100%',
              background: 'var(--modal-bg)',
              border: '0.5px solid var(--modal-border)',
              borderRadius: '20px',
              boxShadow: 'var(--modal-shadow)',
              overflow: 'hidden',
              color: 'var(--modal-text)',
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif",
              zIndex: 1,
            }}
          >
            {/* Identity Row: avatar + name + status | close button */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '18px 20px 10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #ef4444 0%, #f43f5e 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)'
                  }}
                >
                  <Heart size={14} fill="#ffffff" color="#ffffff" />
                </div>
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--modal-text)', lineHeight: 1.2 }}>
                    Sujith Thota
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#22c55e', fontWeight: '600', lineHeight: 1.2 }}>
                    Crafted · engineered
                  </div>
                </div>
              </div>

              <motion.button
                type="button"
                onClick={onClose}
                aria-label="Close"
                whileHover={{ scale: 1.15, rotate: 90 }}
                whileTap={{ scale: 0.88 }}
                transition={{ type: 'spring', damping: 20, stiffness: 400 }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--modal-muted)',
                  cursor: 'pointer',
                  padding: 0,
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                }}
              >
                <X size={17} />
              </motion.button>
            </div>

            {/* Heading + Subtitle, centered */}
            <div style={{ textAlign: 'center', padding: '0 20px 14px' }}>
              <h3
                id="crafted-modal-title"
                style={{
                  fontSize: '22px',
                  fontWeight: '700',
                  color: 'var(--modal-text)',
                  margin: '0 0 4px',
                  letterSpacing: '-0.02em',
                }}
              >
                Crafted with love
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--modal-muted)', margin: '0 0 14px' }}>
                High-performance portfolio architecture & design
              </p>

              {/* Status pills row, centered */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '11px',
                    fontWeight: '600',
                    padding: '3px 9px',
                    borderRadius: '99px',
                    background: 'rgba(34, 197, 94, 0.15)',
                    color: '#22c55e',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                  }}
                >
                  <Zap size={11} />
                  <span>React 18</span>
                </span>

                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '11px',
                    fontWeight: '600',
                    padding: '3px 9px',
                    borderRadius: '99px',
                    background: 'var(--modal-field-bg)',
                    color: 'var(--modal-text)',
                    border: '1px solid var(--modal-border)',
                  }}
                >
                  <Gauge size={11} />
                  <span>60 FPS</span>
                </span>

                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '11px',
                    fontWeight: '600',
                    padding: '3px 9px',
                    borderRadius: '99px',
                    background: 'rgba(245, 158, 11, 0.15)',
                    color: '#f59e0b',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                  }}
                >
                  <ShieldCheck size={11} />
                  <span>PWA Ready</span>
                </span>
              </div>
            </div>

            {/* Pill tabs */}
            <div
              style={{
                display: 'flex',
                padding: '3px',
                background: 'var(--modal-tab-track)',
                border: '1px solid var(--modal-border)',
                borderRadius: '99px',
                margin: '0 20px 14px',
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                style={{
                  flex: 1,
                  border: 'none',
                  background: activeTab === 'overview' ? 'var(--modal-tab-active-bg)' : 'transparent',
                  color: activeTab === 'overview' ? 'var(--modal-tab-active-text)' : 'var(--modal-muted)',
                  padding: '7px 12px',
                  borderRadius: '99px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: activeTab === 'overview' ? '0 1px 3px rgba(0,0,0,0.15)' : 'none',
                }}
              >
                <Sparkles size={13} />
                <span>Overview</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('stack')}
                style={{
                  flex: 1,
                  border: 'none',
                  background: activeTab === 'stack' ? 'var(--modal-tab-active-bg)' : 'transparent',
                  color: activeTab === 'stack' ? 'var(--modal-tab-active-text)' : 'var(--modal-muted)',
                  padding: '7px 12px',
                  borderRadius: '99px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: activeTab === 'stack' ? '0 1px 3px rgba(0,0,0,0.15)' : 'none',
                }}
              >
                <Code2 size={13} />
                <span>Tech Stack</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div style={{ padding: '0 20px 16px' }}>
              {activeTab === 'overview' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Quote / Highlight Card */}
                  <div
                    style={{
                      padding: '12px 14px',
                      background: 'var(--modal-field-bg)',
                      border: '1px solid var(--modal-field-border)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      lineHeight: 1.5,
                      color: 'var(--modal-text)',
                    }}
                  >
                    <div style={{ fontWeight: '600', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span>✨</span>
                      <span>Passion, precision, & modern web engineering</span>
                    </div>
                    <div style={{ color: 'var(--modal-muted)', fontSize: '11.5px' }}>
                      Ultra-fast responsive portfolio engineered with React 18, Vite 6, dynamic glassmorphism, and seamless PWA offline performance.
                    </div>
                  </div>

                  {/* Architecture & Features Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div
                      style={{
                        padding: '10px 12px',
                        background: 'var(--modal-field-bg)',
                        border: '1px solid var(--modal-field-border)',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: '600', color: 'var(--modal-text)' }}>
                        <Code2 size={13} color="#3b82f6" />
                        <span>Frontend Core</span>
                      </div>
                      <span style={{ fontSize: '10.5px', color: 'var(--modal-muted)' }}>
                        React 18 · Vite 6 · Motion
                      </span>
                    </div>

                    <div
                      style={{
                        padding: '10px 12px',
                        background: 'var(--modal-field-bg)',
                        border: '1px solid var(--modal-field-border)',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: '600', color: 'var(--modal-text)' }}>
                        <Gauge size={13} color="#10b981" />
                        <span>Performance</span>
                      </div>
                      <span style={{ fontSize: '10.5px', color: 'var(--modal-muted)' }}>
                        Glass · 60 FPS · PWA v1.3
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '10.5px', fontWeight: '700', color: 'var(--modal-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    ARCHITECTURE & FEATURES MARQUEE
                  </div>
                  <InfiniteMarqueeTrack items={MARQUEE_ROW_1} direction="left" duration={22} />
                  <InfiniteMarqueeTrack items={MARQUEE_ROW_2} direction="right" duration={26} />
                </div>
              )}
            </div>

            {/* Bottom Actions Row */}
            <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                className="cwl-action-btn"
                onClick={() => {
                  onClose();
                  window.dispatchEvent(new CustomEvent('open-email'));
                }}
                style={{
                  width: '100%',
                  height: '36px',
                  background: 'var(--modal-btn-bg)',
                  color: 'var(--modal-btn-text)',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}
              >
                <span>Get in touch</span>
                <ArrowRight size={14} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--modal-muted)' }}>
                <span>Handcrafted by Sujith</span>
                <a
                  href="https://github.com/sujith1546/newreact"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#3b82f6',
                    textDecoration: 'underline',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontWeight: 500,
                  }}
                >
                  <FaGithub size={12} />
                  <span>GitHub Repository</span>
                </a>
              </div>
            </div>

            {/* Subtle bottom note matching admin console */}
            <div
              style={{
                padding: '10px 20px',
                background: 'var(--modal-field-bg)',
                borderTop: '1px solid var(--modal-border)',
                fontSize: '10.5px',
                color: 'var(--modal-muted)',
                textAlign: 'center',
              }}
            >
              Open source · Optimized for all devices &amp; offline mode
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

function InfiniteMarqueeTrack({ items, direction = 'left', duration = 24 }) {
  const quadItems = [...items, ...items, ...items, ...items];
  const animName = direction === 'left' ? 'marqueeScrollLeft' : 'marqueeScrollRight';

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '32px',
        borderRadius: '8px',
        backgroundColor: 'var(--modal-field-bg)',
        border: '1px solid var(--modal-field-border)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
      }}
    >
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
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: '24px',
          background: 'linear-gradient(to right, var(--modal-field-bg) 20%, transparent)',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: '24px',
          background: 'linear-gradient(to left, var(--modal-field-bg) 20%, transparent)',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />

      {/* Continuous Animated Track */}
      <div
        className="crafted-marquee-track"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          width: 'max-content',
          animation: `${animName} ${duration}s linear infinite`,
        }}
      >
        {quadItems.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '2px 7px',
              borderRadius: '6px',
              backgroundColor: 'var(--modal-bg)',
              border: '1px solid var(--modal-border)',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--modal-text)',
              whiteSpace: 'nowrap',
            }}
          >
            {item.icon}
            <span>{item.name}</span>
            <span
              style={{
                fontSize: '9px',
                fontWeight: 700,
                padding: '1px 4px',
                borderRadius: '4px',
                backgroundColor: 'rgba(59, 130, 246, 0.12)',
                color: '#3b82f6',
              }}
            >
              {item.tag}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
