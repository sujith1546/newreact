import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, Moon, Sun, Volume2, VolumeX, Bot, MessageSquareOff, Sliders, Sparkles, RotateCcw, Check, Monitor, Layout, ShieldCheck } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function SettingsPanel({ isOpen, onClose, triggerRef }) {
  const { theme, toggleTheme } = useTheme();
  const panelRef = useRef(null);

  // ── Body scroll lock while open ──────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus management inside panel
    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = origOverflow;
      triggerRef?.current?.focus();
    };
  }, [isOpen, triggerRef]);

  // ── Keyboard Escape listener ─────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // ── Settings LocalState Hooks & Handlers ─────────────────────────────────
  const [soundEnabled, setSoundEnabled] = React.useState(() => {
    try {
      const saved = localStorage.getItem('portfolio_sound_enabled');
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  });

  const [chatbotEnabled, setChatbotEnabled] = React.useState(() => {
    try {
      const saved = localStorage.getItem('portfolio_chatbot_enabled');
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  });

  const [particlesEnabled, setParticlesEnabled] = React.useState(() => {
    try {
      const saved = localStorage.getItem('portfolio_particles_enabled');
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  });

  const toggleSound = () => {
    setSoundEnabled(prev => {
      const next = !prev;
      try { localStorage.setItem('portfolio_sound_enabled', String(next)); } catch {}
      window.dispatchEvent(new CustomEvent('toggle-sound-effects', { detail: { enabled: next } }));
      return next;
    });
  };

  const toggleChatbot = () => {
    setChatbotEnabled(prev => {
      const next = !prev;
      try { localStorage.setItem('portfolio_chatbot_enabled', String(next)); } catch {}
      window.dispatchEvent(new CustomEvent('toggle-chatbot-visibility', { detail: { enabled: next } }));
      return next;
    });
  };

  const toggleParticles = () => {
    setParticlesEnabled(prev => {
      const next = !prev;
      try { localStorage.setItem('portfolio_particles_enabled', String(next)); } catch {}
      window.dispatchEvent(new CustomEvent('toggle-particle-canvas', { detail: { enabled: next } }));
      return next;
    });
  };

  const handleResetDefaults = () => {
    try {
      localStorage.removeItem('portfolio_sound_enabled');
      localStorage.removeItem('portfolio_chatbot_enabled');
      localStorage.removeItem('portfolio_particles_enabled');
      localStorage.removeItem('ai_disclaimer_dismissed');
    } catch {}
    setSoundEnabled(true);
    setChatbotEnabled(true);
    setParticlesEnabled(true);
    window.dispatchEvent(new CustomEvent('toggle-sound-effects', { detail: { enabled: true } }));
    window.dispatchEvent(new CustomEvent('toggle-chatbot-visibility', { detail: { enabled: true } }));
    window.dispatchEvent(new CustomEvent('toggle-particle-canvas', { detail: { enabled: true } }));
  };

  if (typeof window === 'undefined') return null;

  const isDark = theme === 'dark';

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            key="settings-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.48)',
              backdropFilter: 'blur(5px)',
              WebkitBackdropFilter: 'blur(5px)',
              zIndex: 99998,
            }}
          />

          {/* Full Height Settings Slide-in Panel (Desktop Only) */}
          <motion.div
            key="settings-panel-slide"
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="Settings panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              width: 380,
              maxWidth: '92vw',
              height: '100vh',
              background: 'var(--bg-secondary, #f8fafc)',
              borderLeft: '1px solid var(--border-color, rgba(128,128,128,0.2))',
              borderTopLeftRadius: 24,
              borderBottomLeftRadius: 24,
              boxShadow: isDark
                ? '-16px 0 50px rgba(0, 0, 0, 0.65)'
                : '-16px 0 50px rgba(139, 92, 246, 0.12)',
              zIndex: 99999,
              display: 'flex',
              flexDirection: 'column',
              outline: 'none',
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
              overflow: 'hidden',
            }}
          >
            <style>{`
              /* Accent Bar */
              .sp-accent-bar {
                height: 3px;
                width: 100%;
                background: linear-gradient(90deg, #8b5cf6 0%, #3b82f6 50%, #10b981 100%);
              }

              /* Header */
              .sp-header {
                padding: 22px 24px 18px;
                border-bottom: 1px solid var(--border-color, rgba(128, 128, 128, 0.15));
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                background: transparent;
              }
              .sp-title-group {
                display: flex;
                flex-direction: column;
                gap: 4px;
              }
              .sp-title {
                font-size: 17px;
                font-weight: 700;
                color: var(--text-primary, #0f172a);
                display: flex;
                align-items: center;
                gap: 10px;
                margin: 0;
                letter-spacing: -0.01em;
              }
              .sp-title-icon {
                width: 32px;
                height: 32px;
                border-radius: 10px;
                background: linear-gradient(135deg, rgba(139,92,246,0.2), rgba(99,102,241,0.12));
                border: 1px solid rgba(139,92,246,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                color: #8b5cf6;
                box-shadow: 0 4px 12px rgba(139,92,246,0.15);
              }
              .sp-subtitle {
                font-size: 12px;
                color: var(--text-secondary, #64748b);
                margin: 0;
                line-height: 1.4;
                font-weight: 500;
              }
              .sp-close-btn {
                background: var(--bg-primary, rgba(128,128,128,0.08));
                border: 1px solid var(--border-color, rgba(128,128,128,0.15));
                border-radius: 50%;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--text-primary);
                cursor: pointer;
                transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                flex-shrink: 0;
                padding: 0;
              }
              .sp-close-btn:hover {
                background: rgba(239, 68, 68, 0.15);
                color: #ef4444;
                border-color: rgba(239, 68, 68, 0.35);
                transform: scale(1.05);
              }

              /* Scrollable Body */
              .sp-body {
                flex: 1;
                overflow-y: auto;
                padding: 20px 24px;
                display: flex;
                flex-direction: column;
                gap: 24px;
                scrollbar-width: thin;
                scrollbar-color: rgba(139,92,246,0.3) transparent;
              }
              .sp-body::-webkit-scrollbar {
                width: 5px;
              }
              .sp-body::-webkit-scrollbar-thumb {
                background: rgba(139,92,246,0.25);
                border-radius: 10px;
              }
              .sp-body::-webkit-scrollbar-track {
                background: transparent;
              }

              .sp-section {
                display: flex;
                flex-direction: column;
                gap: 10px;
              }
              .sp-section-label {
                font-size: 10.5px;
                font-weight: 800;
                letter-spacing: 0.09em;
                text-transform: uppercase;
                color: #8b5cf6;
                display: flex;
                align-items: center;
                gap: 6px;
              }

              /* Card Rows */
              .sp-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 12px 14px;
                border-radius: 14px;
                background: var(--bg-primary, rgba(255,255,255,0.7));
                border: 1px solid var(--border-color, rgba(128,128,128,0.12));
                box-shadow: 0 2px 8px rgba(0,0,0,0.02);
                transition: all 0.2s ease;
              }
              .sp-row:hover {
                border-color: rgba(139, 92, 246, 0.35);
                box-shadow: 0 4px 16px rgba(139, 92, 246, 0.1);
                transform: translateY(-1px);
              }
              .sp-row-left {
                display: flex;
                align-items: center;
                gap: 12px;
              }
              .sp-row-icon {
                width: 34px;
                height: 34px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(139, 92, 246, 0.09);
                color: #8b5cf6;
                flex-shrink: 0;
              }
              .sp-row-text {
                display: flex;
                flex-direction: column;
                gap: 2px;
              }
              .sp-row-title {
                font-size: 13px;
                font-weight: 700;
                color: var(--text-primary);
              }
              .sp-row-desc {
                font-size: 11px;
                color: var(--text-secondary);
                font-weight: 500;
              }

              /* Toggle Switch */
              .sp-switch {
                width: 42px;
                height: 24px;
                border-radius: 100px;
                background: rgba(128, 128, 128, 0.25);
                border: none;
                padding: 2.5px;
                cursor: pointer;
                display: flex;
                align-items: center;
                transition: background 0.25s ease, box-shadow 0.25s ease;
                position: relative;
                outline: none;
                flex-shrink: 0;
              }
              .sp-switch.on {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                box-shadow: 0 0 12px rgba(16, 185, 129, 0.4);
              }
              .sp-switch-knob {
                width: 19px;
                height: 19px;
                border-radius: 50%;
                background: #ffffff;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.22);
                transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
              }
              .sp-switch.on .sp-switch-knob {
                transform: translateX(18px);
              }

              /* Footer */
              .sp-footer {
                padding: 18px 24px;
                border-top: 1px solid var(--border-color, rgba(128, 128, 128, 0.15));
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                background: var(--bg-secondary, rgba(255,255,255,0.9));
                backdrop-filter: blur(12px);
              }
              .sp-btn-reset {
                background: var(--bg-primary, rgba(128, 128, 128, 0.08));
                border: 1px solid var(--border-color, rgba(128, 128, 128, 0.15));
                color: var(--text-secondary);
                border-radius: 10px;
                padding: 9px 15px;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 6px;
                transition: all 0.18s ease;
              }
              .sp-btn-reset:hover {
                background: rgba(239, 68, 68, 0.12);
                color: #ef4444;
                border-color: rgba(239, 68, 68, 0.3);
              }
              .sp-btn-done {
                background: linear-gradient(135deg, #8b5cf6, #6366f1);
                border: none;
                color: #ffffff;
                border-radius: 10px;
                padding: 9px 22px;
                font-size: 12px;
                font-weight: 700;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 6px;
                box-shadow: 0 4px 16px rgba(139, 92, 246, 0.35);
                transition: all 0.18s ease;
              }
              .sp-btn-done:hover {
                transform: translateY(-1px);
                box-shadow: 0 6px 20px rgba(139, 92, 246, 0.45);
              }
            `}</style>

            {/* Accent Line */}
            <div className="sp-accent-bar" />

            {/* Header */}
            <div className="sp-header">
              <div className="sp-title-group">
                <h3 className="sp-title">
                  <div className="sp-title-icon">
                    <Settings size={17} />
                  </div>
                  <span>Settings</span>
                </h3>
                <p className="sp-subtitle">Manage your portfolio preferences and site controls.</p>
              </div>
              <button
                onClick={onClose}
                className="sp-close-btn"
                aria-label="Close settings panel"
                type="button"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="sp-body">
              {/* SECTION 1: GENERAL PREFERENCES */}
              <div className="sp-section">
                <span className="sp-section-label">
                  <Sliders size={12} />
                  <span>General Preferences</span>
                </span>

                {/* Dark Mode */}
                <div className="sp-row">
                  <div className="sp-row-left">
                    <div className="sp-row-icon">
                      {isDark ? <Moon size={16} /> : <Sun size={16} color="#f59e0b" />}
                    </div>
                    <div className="sp-row-text">
                      <span className="sp-row-title">Dark Mode</span>
                      <span className="sp-row-desc">Toggle light / dark color palette</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isDark}
                    aria-label="Dark mode toggle"
                    className={`sp-switch ${isDark ? 'on' : ''}`}
                    onClick={toggleTheme}
                  >
                    <div className="sp-switch-knob" />
                  </button>
                </div>

                {/* Sound Effects */}
                <div className="sp-row">
                  <div className="sp-row-left">
                    <div className="sp-row-icon" style={{ color: soundEnabled ? '#10b981' : '#94a3b8' }}>
                      {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                    </div>
                    <div className="sp-row-text">
                      <span className="sp-row-title">Sound Effects</span>
                      <span className="sp-row-desc">Audible UI feedback sounds</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={soundEnabled}
                    aria-label="Sound effects toggle"
                    className={`sp-switch ${soundEnabled ? 'on' : ''}`}
                    onClick={toggleSound}
                  >
                    <div className="sp-switch-knob" />
                  </button>
                </div>

                {/* AI Chatbot */}
                <div className="sp-row">
                  <div className="sp-row-left">
                    <div className="sp-row-icon" style={{ color: chatbotEnabled ? '#8b5cf6' : '#94a3b8' }}>
                      {chatbotEnabled ? <Bot size={16} /> : <MessageSquareOff size={16} />}
                    </div>
                    <div className="sp-row-text">
                      <span className="sp-row-title">AI Chatbot</span>
                      <span className="sp-row-desc">Show Ask Sujith AI assistant</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={chatbotEnabled}
                    aria-label="AI Chatbot toggle"
                    className={`sp-switch ${chatbotEnabled ? 'on' : ''}`}
                    onClick={toggleChatbot}
                  >
                    <div className="sp-switch-knob" />
                  </button>
                </div>
              </div>

              {/* SECTION 2: DISPLAY & GRAPHICS */}
              <div className="sp-section">
                <span className="sp-section-label">
                  <Sparkles size={12} />
                  <span>Display & Graphics</span>
                </span>

                {/* Particle Canvas */}
                <div className="sp-row">
                  <div className="sp-row-left">
                    <div className="sp-row-icon" style={{ color: particlesEnabled ? '#3b82f6' : '#94a3b8' }}>
                      <Sparkles size={16} />
                    </div>
                    <div className="sp-row-text">
                      <span className="sp-row-title">Background Particles</span>
                      <span className="sp-row-desc">Interactive canvas particle field</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={particlesEnabled}
                    aria-label="Background particles toggle"
                    className={`sp-switch ${particlesEnabled ? 'on' : ''}`}
                    onClick={toggleParticles}
                  >
                    <div className="sp-switch-knob" />
                  </button>
                </div>
              </div>

              {/* SECTION 3: SHORTCUTS & SYSTEM */}
              <div className="sp-section">
                <span className="sp-section-label">
                  <Layout size={12} />
                  <span>Shortcuts & Navigation</span>
                </span>
                <div className="sp-row" style={{ cursor: 'pointer' }} onClick={() => { onClose(); window.dispatchEvent(new CustomEvent('toggle-command-palette')); }}>
                  <div className="sp-row-left">
                    <div className="sp-row-icon">
                      <Sliders size={16} />
                    </div>
                    <div className="sp-row-text">
                      <span className="sp-row-title">Command Palette</span>
                      <span className="sp-row-desc">Press Ctrl+K anytime</span>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 9px', borderRadius: 8, background: 'rgba(128,128,128,0.12)', color: 'var(--text-primary)' }}>Ctrl+K</span>
                </div>
              </div>
            </div>

            {/* Pinned Footer */}
            <div className="sp-footer">
              <button
                type="button"
                className="sp-btn-reset"
                onClick={handleResetDefaults}
                title="Reset all preferences to defaults"
              >
                <RotateCcw size={13} />
                <span>Reset defaults</span>
              </button>
              <button
                type="button"
                className="sp-btn-done"
                onClick={onClose}
              >
                <Check size={14} />
                <span>Done</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
