import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Moon, Sun, Volume2, VolumeX, Bot, MessageSquareOff } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function SettingsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const dropdownRef = useRef(null);

  // ── 1. Sound Effects Preference Persistence ────────────────────────────────
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('portfolio_sound_enabled');
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  });

  const toggleSound = () => {
    setSoundEnabled(prev => {
      const next = !prev;
      try {
        localStorage.setItem('portfolio_sound_enabled', String(next));
      } catch (err) {
        console.error('Failed to save sound preference', err);
      }
      window.dispatchEvent(new CustomEvent('toggle-sound-effects', { detail: { enabled: next } }));
      return next;
    });
  };

  // ── 2. AI Chatbot Preference Persistence ──────────────────────────────────
  const [chatbotEnabled, setChatbotEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('portfolio_chatbot_enabled');
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  });

  const toggleChatbot = () => {
    setChatbotEnabled(prev => {
      const next = !prev;
      try {
        localStorage.setItem('portfolio_chatbot_enabled', String(next));
      } catch (err) {
        console.error('Failed to save chatbot preference', err);
      }
      window.dispatchEvent(new CustomEvent('toggle-chatbot-visibility', { detail: { enabled: next } }));
      return next;
    });
  };

  // ── 3. Close on Outside Click & Escape key ────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const isDark = theme === 'dark';

  return (
    <div className="settings-dropdown-container" ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <style>{`
        .settings-trigger-btn {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border-color, rgba(128,128,128,0.2));
          background: var(--bg-secondary, rgba(255,255,255,0.8));
          color: var(--text-primary, #0f172a);
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          outline: none;
        }
        .settings-trigger-btn:hover {
          border-color: rgba(139, 92, 246, 0.4);
          box-shadow: 0 4px 14px rgba(139, 92, 246, 0.15);
          transform: translateY(-1px);
          color: #8b5cf6;
        }
        .settings-trigger-btn:active {
          transform: translateY(0);
        }
        .settings-trigger-btn.active {
          background: rgba(139, 92, 246, 0.12);
          border-color: rgba(139, 92, 246, 0.5);
          color: #8b5cf6;
        }

        .settings-panel {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 260px;
          background: var(--bg-secondary, rgba(255, 255, 255, 0.95));
          border: 1px solid var(--border-color, rgba(128, 128, 128, 0.18));
          border-radius: 14px;
          padding: 12px;
          box-shadow: 0 16px 38px rgba(0, 0, 0, 0.16), 0 0 0 1px rgba(139, 92, 246, 0.08);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          z-index: 99999;
          font-family: inherit;
        }
        [data-theme="dark"] .settings-panel {
          background: rgba(18, 12, 38, 0.95);
          border-color: rgba(139, 92, 246, 0.22);
          box-shadow: 0 20px 48px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(139, 92, 246, 0.15);
        }

        .settings-panel-header {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 2px 4px 10px;
          border-bottom: 1px solid rgba(128, 128, 128, 0.12);
          margin-bottom: 6px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-secondary, #64748b);
        }

        .settings-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 9px 6px;
          border-radius: 9px;
          transition: background 0.15s ease;
          user-select: none;
        }
        .settings-row:hover {
          background: rgba(139, 92, 246, 0.06);
        }

        .settings-row-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .settings-row-icon {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(139, 92, 246, 0.08);
          color: #8b5cf6;
          flex-shrink: 0;
        }
        .settings-row-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary, #0f172a);
        }

        /* Toggle switch */
        .toggle-switch-btn {
          width: 38px;
          height: 22px;
          border-radius: 100px;
          background: rgba(128, 128, 128, 0.25);
          border: none;
          padding: 2px;
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: background 0.25s ease, box-shadow 0.25s ease;
          position: relative;
          outline: none;
        }
        .toggle-switch-btn.on {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.35);
        }
        .toggle-switch-knob {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .toggle-switch-btn.on .toggle-switch-knob {
          transform: translateX(16px);
        }
      `}</style>

      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(o => !o)}
        className={`settings-trigger-btn ${isOpen ? 'active' : ''}`}
        aria-label="Settings"
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Preferences & Settings"
      >
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Settings size={18} />
        </motion.div>
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="settings-panel"
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="settings-panel-header">
              <Settings size={12} />
              <span>Preferences</span>
            </div>

            {/* 1. Dark Mode Toggle */}
            <div className="settings-row">
              <div className="settings-row-left">
                <div className="settings-row-icon">
                  {isDark ? <Moon size={15} /> : <Sun size={15} color="#f59e0b" />}
                </div>
                <span className="settings-row-label">Dark Mode</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isDark}
                aria-label="Dark mode toggle"
                className={`toggle-switch-btn ${isDark ? 'on' : ''}`}
                onClick={toggleTheme}
              >
                <div className="toggle-switch-knob" />
              </button>
            </div>

            {/* 2. Sound Effects Toggle */}
            <div className="settings-row">
              <div className="settings-row-left">
                <div className="settings-row-icon" style={{ color: soundEnabled ? '#10b981' : '#94a3b8' }}>
                  {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
                </div>
                <span className="settings-row-label">Sound Effects</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={soundEnabled}
                aria-label="Sound effects toggle"
                className={`toggle-switch-btn ${soundEnabled ? 'on' : ''}`}
                onClick={toggleSound}
              >
                <div className="toggle-switch-knob" />
              </button>
            </div>

            {/* 3. AI Chatbot Toggle */}
            <div className="settings-row">
              <div className="settings-row-left">
                <div className="settings-row-icon" style={{ color: chatbotEnabled ? '#8b5cf6' : '#94a3b8' }}>
                  {chatbotEnabled ? <Bot size={15} /> : <MessageSquareOff size={15} />}
                </div>
                <span className="settings-row-label">AI Chatbot</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={chatbotEnabled}
                aria-label="AI Chatbot toggle"
                className={`toggle-switch-btn ${chatbotEnabled ? 'on' : ''}`}
                onClick={toggleChatbot}
              >
                <div className="toggle-switch-knob" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
