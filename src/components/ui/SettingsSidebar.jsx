import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Settings2, Palette, Bot, Volume2, VolumeX, Eye, EyeOff,
  Zap, ZapOff, MonitorPlay, Code2, Paintbrush, Activity,
  Moon, Sun, Layers, Trash2, RotateCcw, Sparkles, Check,
  ChevronRight, Info, Shield, ExternalLink, Layout, User
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { usePersona } from '../../context/PersonaContext';

/* ─── Accent palette ─────────────────────────────────────── */
const ACCENTS = [
  { key: 'blue',    hex: '#3B82F6', label: 'Blue'    },
  { key: 'indigo',  hex: '#6366F1', label: 'Indigo'  },
  { key: 'emerald', hex: '#10B981', label: 'Emerald' },
  { key: 'cyan',    hex: '#06B6D4', label: 'Cyan'    },
  { key: 'rose',    hex: '#EC4899', label: 'Rose'    },
  { key: 'amber',   hex: '#F59E0B', label: 'Amber'   },
  { key: 'purple',  hex: '#8B5CF6', label: 'Purple'  },
  { key: 'orange',  hex: '#F97316', label: 'Orange'  },
  { key: 'teal',    hex: '#14B8A6', label: 'Teal'    },
];

/* ─── Tabs config ────────────────────────────────────────── */
const TABS = [
  { id: 'appearance', label: 'Look',        icon: Palette    },
  { id: 'ai',         label: 'AI',          icon: Bot        },
  { id: 'access',     label: 'Access',      icon: Eye        },
  { id: 'pro',        label: 'Pro',         icon: Code2      },
];

export default function SettingsSidebar() {
  const [isOpen,   setIsOpen]   = useState(false);
  const [activeTab, setActiveTab] = useState('appearance');
  const [toast, setToast]       = useState(null); // { msg, type }

  const {
    theme, toggleTheme,
    accentColor, setAccentColor,
    fontFamily, setFontFamily,
    layoutDensity, setLayoutDensity,
    glassIntensity, setGlassIntensity,
    reduceMotion, setReduceMotion,
    highContrast, setHighContrast,
    aiVoice, setAiVoice,
    aiAutoNav, setAiAutoNav,
    aiResponseStyle, setAiResponseStyle,
    aiShowThoughts, setAiShowThoughts,
    aiContextRange, setAiContextRange,
    aiReasoningDepth, setAiReasoningDepth,
    aiPersona, setAiPersona,
    aiTerminalMode, setAiTerminalMode,
    keyboardHud, setKeyboardHud,
    uiAudio, setUiAudio,
    devMode, setDevMode,
    showStateInspector, setShowStateInspector,
  } = useTheme();

  const { persona, setPersona } = usePersona();

  const isDark = theme === 'dark';
  const accent = ACCENTS.find(a => a.key === accentColor)?.hex ?? (accentColor?.startsWith('#') ? accentColor : '#6366F1');

  /* ── Event listeners ── */
  useEffect(() => {
    const open = () => { setIsOpen(true); };
    window.addEventListener('open-all-settings', open);
    return () => window.removeEventListener('open-all-settings', open);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const esc = (e) => { if (e.key === 'Escape') setIsOpen(false); };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  /* ── Toast helper ── */
  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  }, []);

  /* ── Actions ── */
  const handleClearChat = () => {
    window.dispatchEvent(new CustomEvent('clear-chat'));
    showToast('Chat memory cleared');
  };

  const handleRestoreDisclaimer = () => {
    localStorage.removeItem('ai_disclaimer_dismissed');
    window.dispatchEvent(new CustomEvent('clear-chat'));
    showToast('AI disclaimer restored');
  };

  const handleFactoryReset = () => {
    localStorage.clear();
    showToast('Resetting…', 'warn');
    setTimeout(() => window.location.reload(), 1200);
  };

  /* ──────────────────────────────────────────────────────────
     Sub-components (defined inside so they close over theme)
  ────────────────────────────────────────────────────────── */

  /* Animated iOS-style toggle */
  const Toggle = ({ checked, onChange, accent: toggleAccent = accent }) => (
    <button
      onClick={() => onChange(!checked)}
      aria-checked={checked}
      role="switch"
      style={{
        width: '44px', height: '26px', borderRadius: '100px',
        background: checked ? toggleAccent : (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)'),
        border: 'none', cursor: 'pointer', position: 'relative',
        transition: 'background 0.3s cubic-bezier(0.16,1,0.3,1)', flexShrink: 0,
        boxShadow: checked ? `0 0 12px ${toggleAccent}55` : 'none',
      }}
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{
          width: '20px', height: '20px', borderRadius: '50%',
          background: '#fff', position: 'absolute', top: '3px',
          left: checked ? '21px' : '3px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
        }}
      />
    </button>
  );

  /* Row wrapper */
  const Row = ({ icon: Icon, iconColor = accent, label, sublabel, children, danger }) => (
    <div className="settings-sidebar-row" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '11px 14px', borderRadius: '12px',
      background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}`,
      marginBottom: '8px',
      transition: 'background 0.2s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
        <div className="settings-sidebar-icon" style={{
          width: '32px', height: '32px', borderRadius: '10px', flexShrink: 0,
          background: danger ? 'rgba(239,68,68,0.1)' : `${iconColor}18`,
          color: danger ? '#ef4444' : iconColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={15} />
        </div>
        <div>
          <div className="settings-sidebar-title" style={{ fontSize: '13px', fontWeight: 600, color: danger ? '#ef4444' : (isDark ? '#f1f5f9' : '#0f172a') }}>
            {label}
          </div>
          {sublabel && (
            <div className="settings-sidebar-sub" style={{ fontSize: '11px', color: isDark ? '#64748b' : '#94a3b8', marginTop: '2px' }}>
              {sublabel}
            </div>
          )}
        </div>
      </div>
      <div style={{ flexShrink: 0, marginLeft: '12px' }}>{children}</div>
    </div>
  );

  /* Section label */
  const Section = ({ title }) => (
    <div className="settings-sidebar-section" style={{
      fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
      color: isDark ? '#475569' : '#94a3b8', padding: '18px 0 8px',
    }}>
      {title}
    </div>
  );

  /* Action button */
  const ActionBtn = ({ label, icon: Icon, onClick, danger, sublabel }) => (
    <button
      onClick={onClick}
      className="settings-sidebar-action-btn"
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
        padding: '11px 14px', borderRadius: '12px', border: 'none', cursor: 'pointer',
        background: danger ? 'rgba(239,68,68,0.08)' : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'),
        marginBottom: '8px', textAlign: 'left', transition: 'background 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = danger ? 'rgba(239,68,68,0.15)' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)')}
      onMouseLeave={e => e.currentTarget.style.background = danger ? 'rgba(239,68,68,0.08)' : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)')}
    >
      <div className="settings-sidebar-icon" style={{
        width: '30px', height: '30px', borderRadius: '8px',
        background: danger ? 'transparent' : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
        color: danger ? '#ef4444' : (isDark ? '#e2e8f0' : '#475569'),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={14} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: danger ? '#ef4444' : (isDark ? '#f1f5f9' : '#0f172a') }}>
          {label}
        </div>
        {sublabel && <div style={{ fontSize: '11px', color: isDark ? '#64748b' : '#94a3b8', marginTop: '1px' }}>{sublabel}</div>}
      </div>
      <ChevronRight size={14} style={{ color: isDark ? '#475569' : '#94a3b8', flexShrink: 0 }} />
    </button>
  );

  /* ── Tab content ── */
  const renderTab = () => {
    if (activeTab === 'appearance') return (
      <div>
        <Section title="Glassmorphism" />
        <div style={{
          padding: '14px', borderRadius: '14px',
          background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}`,
          marginBottom: '8px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Layers size={13} style={{ color: accent }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: isDark ? '#94a3b8' : '#64748b' }}>
              Glass Blur Intensity
            </span>
            <span style={{
              marginLeft: 'auto', fontSize: '11px', fontWeight: 700, padding: '2px 8px',
              borderRadius: '100px', background: `${accent}20`, color: accent, textTransform: 'capitalize',
            }}>
              {glassIntensity}
            </span>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '6px',
          }}>
            {['light', 'medium', 'heavy'].map(lvl => (
              <button
                key={lvl}
                onClick={() => { setGlassIntensity(lvl); showToast(`Glass → ${lvl}`); }}
                style={{
                  padding: '8px 4px', borderRadius: '8px', cursor: 'pointer', border: 'none',
                  background: glassIntensity === lvl
                    ? `${accent}22`
                    : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
                  color: glassIntensity === lvl ? accent : (isDark ? '#94a3b8' : '#64748b'),
                  fontWeight: 700, fontSize: '12px', textTransform: 'capitalize',
                  boxShadow: glassIntensity === lvl ? `inset 0 0 0 1px ${accent}55` : 'none',
                  transition: 'all 0.2s',
                }}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>
    );

    if (activeTab === 'ai') return (
      <div>
        <Section title="AI Behavior" />
        <Row icon={Sparkles} iconColor="#10b981" label="Screen Director" sublabel="AI auto-navigates to relevant sections">
          <Toggle checked={aiAutoNav} onChange={v => { setAiAutoNav(v); showToast(v ? 'Auto-nav ON' : 'Auto-nav OFF'); }} />
        </Row>
        
        <Section title="Interface & Logs" />
        <Row icon={Code2} iconColor="#f59e0b" label="Show Thought Traces" sublabel="Display internal RAG steps">
          <Toggle checked={aiShowThoughts} onChange={v => { setAiShowThoughts(v); showToast(v ? 'Thoughts visible' : 'Thoughts hidden'); }} accent="#f59e0b" />
        </Row>

        <Section title="Memory & History" />
        <ActionBtn
          label="Clear Chat Memory"
          sublabel="Wipes chat history, keeps settings"
          icon={Trash2}
          onClick={handleClearChat}
        />

        <Section title="About Atom AI" />
        <div style={{
          padding: '14px', borderRadius: '14px',
          background: isDark ? 'rgba(139,92,246,0.06)' : 'rgba(139,92,246,0.04)',
          border: `1px solid ${isDark ? 'rgba(139,92,246,0.18)' : 'rgba(139,92,246,0.12)'}`,
        }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <Info size={14} style={{ color: '#8b5cf6', marginTop: '1px', flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: '12px', lineHeight: 1.6, color: isDark ? '#94a3b8' : '#64748b' }}>
              Powered by <strong style={{ color: isDark ? '#c4b5fd' : '#7c3aed' }}>Groq LLaMA 3.3</strong> with
              RAG technology. Responses are based on Sujith's portfolio data. Always verify important info.
            </p>
          </div>
        </div>
      </div>
    );

    if (activeTab === 'access') return (
      <div>
        <Section title="Visual" />
        <Row icon={highContrast ? Eye : EyeOff} iconColor="#f97316" label="High Contrast" sublabel="Boosts text and border visibility">
          <Toggle checked={highContrast} onChange={v => { setHighContrast(v); showToast(v ? 'High contrast ON' : 'High contrast OFF'); }} accent="#f97316" />
        </Row>
      </div>
    );

    if (activeTab === 'pro') return (
      <div>
        <Section title="Portfolio" />
        <ActionBtn
          label="View Source Code"
          sublabel="Open GitHub repository"
          icon={ExternalLink}
          onClick={() => window.open('https://github.com/sujith1546/newreact', '_blank')}
        />

        <Section title="Danger Zone" />
        <div style={{
          padding: '14px', borderRadius: '14px',
          background: 'rgba(239,68,68,0.06)',
          border: '1px solid rgba(239,68,68,0.15)',
        }}>
          <p style={{ margin: '0 0 12px', fontSize: '12px', color: isDark ? '#fca5a5' : '#b91c1c', lineHeight: 1.5 }}>
            This will clear <strong>all preferences</strong>, chat history, and reload the page. Cannot be undone.
          </p>
          <button
            onClick={handleFactoryReset}
            style={{
              width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.3)',
              background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontWeight: 700, fontSize: '13px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
          >
            <Trash2 size={15} />
            Factory Reset
          </button>
        </div>
      </div>
    );
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 2000000,
              backgroundColor: isDark ? 'rgba(0,0,0,0.55)' : 'rgba(15,23,42,0.25)',
              backdropFilter: 'blur(var(--glass-blur, 12px))', WebkitbackdropFilter: 'blur(var(--glass-blur, 12px))',
            }}
          />

          {/* ── Sidebar panel ── */}
          <motion.div
            key="sidebar"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0,
              width: '100%', maxWidth: '400px',
              background: isDark
                ? 'linear-gradient(160deg, rgba(18,12,38,0.98) 0%, rgba(10,6,24,0.98) 100%)'
                : 'linear-gradient(160deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)',
              borderLeft: `1px solid ${isDark ? 'rgba(139,92,246,0.18)' : 'rgba(0,0,0,0.08)'}`,
              boxShadow: isDark ? '-24px 0 64px rgba(0,0,0,0.7)' : '-16px 0 48px rgba(0,0,0,0.12)',
              backdropFilter: 'blur(var(--glass-blur, 12px))', WebkitbackdropFilter: 'blur(var(--glass-blur, 12px))',
              zIndex: 2000001, display: 'flex', flexDirection: 'column', fontFamily: 'inherit',
            }}
          >
            {/* Header */}
            <div className="settings-sidebar-header" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 20px 16px',
              borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="settings-sidebar-icon" style={{
                  width: '34px', height: '34px', borderRadius: '10px',
                  background: `${accent}20`, color: accent,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 0 16px ${accent}30`,
                }}>
                  <Settings2 size={18} />
                </div>
                <div>
                  <div className="settings-sidebar-header-title" style={{ fontSize: '15px', fontWeight: 700, color: isDark ? '#fff' : '#0f172a' }}>
                    Preferences
                  </div>
                  <div className="settings-sidebar-header-sub" style={{ fontSize: '11px', color: isDark ? '#64748b' : '#94a3b8', marginTop: '1px' }}>
                    All settings sync automatically
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                  border: 'none', cursor: 'pointer', width: '32px', height: '32px',
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: isDark ? '#94a3b8' : '#64748b', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'; e.currentTarget.style.color = isDark ? '#fff' : '#000'; }}
                onMouseLeave={e => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'; e.currentTarget.style.color = isDark ? '#94a3b8' : '#64748b'; }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Tab bar */}
            <div style={{
              display: 'flex', padding: '10px 16px', gap: '4px',
              borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
              background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
            }}>
              {TABS.map(tab => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    className="settings-sidebar-tab"
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
                      padding: '8px 4px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                      background: active ? `${accent}18` : 'transparent',
                      color: active ? accent : (isDark ? '#64748b' : '#94a3b8'),
                      transition: 'all 0.2s',
                      boxShadow: active ? `inset 0 0 0 1px ${accent}30` : 'none',
                    }}
                  >
                    <tab.icon className="settings-sidebar-tab-icon" size={15} />
                    <span className="settings-sidebar-tab-text" style={{ fontSize: '10px', fontWeight: active ? 700 : 500 }}>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Scrollable body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 32px', scrollbarWidth: 'none' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                >
                  {renderTab()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div style={{
              padding: '12px 20px',
              borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
              <span style={{ fontSize: '11px', color: isDark ? '#475569' : '#94a3b8' }}>
                All changes saved automatically
              </span>
            </div>
          </motion.div>

          {/* ── Toast notification ── */}
          <AnimatePresence>
            {toast && (
              <motion.div
                key="toast"
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ type: 'spring', damping: 22, stiffness: 300 }}
                style={{
                  position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
                  zIndex: 2000002,
                  background: isDark ? 'rgba(30,16,60,0.95)' : 'rgba(15,23,42,0.9)',
                  color: '#fff', padding: '10px 18px', borderRadius: '100px',
                  fontSize: '13px', fontWeight: 600,
                  border: `1px solid ${toast.type === 'warn' ? 'rgba(239,68,68,0.4)' : `${accent}40`}`,
                  boxShadow: `0 8px 24px rgba(0,0,0,0.4), 0 0 0 1px ${toast.type === 'warn' ? 'rgba(239,68,68,0.2)' : `${accent}20`}`,
                  display: 'flex', alignItems: 'center', gap: '8px',
                  backdropFilter: 'blur(var(--glass-blur, 12px))', WebkitbackdropFilter: 'blur(var(--glass-blur, 12px))',
                  whiteSpace: 'nowrap',
                }}
              >
                {toast.type === 'warn'
                  ? <Trash2 size={13} style={{ color: '#ef4444' }} />
                  : <Check size={13} style={{ color: '#22c55e' }} />
                }
                {toast.msg}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
