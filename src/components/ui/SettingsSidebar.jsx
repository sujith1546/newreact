import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Settings2,
  Palette,
  Bot,
  Eye,
  Code2,
  Moon,
  Sun,
  Layers,
  Trash2,
  Sparkles,
  Check,
  ChevronRight,
  Info,
  ExternalLink,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

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
  { id: 'appearance', label: 'Look',   icon: Palette },
  { id: 'ai',         label: 'AI',     icon: Bot     },
  { id: 'access',     label: 'Access', icon: Eye     },
  { id: 'pro',        label: 'System', icon: Code2   },
];

export default function SettingsSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('appearance');
  const [toast, setToast] = useState(null);

  const {
    theme, toggleTheme,
    accentColor, setAccentColor,
    glassIntensity, setGlassIntensity,
    reduceMotion, setReduceMotion,
    highContrast, setHighContrast,
    aiAutoNav, setAiAutoNav,
    aiShowThoughts, setAiShowThoughts,
  } = useTheme();

  const isDark = theme === 'dark';
  const currentAccent = ACCENTS.find(a => a.key === accentColor)?.hex ?? (accentColor?.startsWith('#') ? accentColor : '#3B82F6');

  /* ── Event listeners ── */
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-all-settings', handleOpen);
    return () => window.removeEventListener('open-all-settings', handleOpen);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  /* ── Toast helper ── */
  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  /* ── Actions ── */
  const handleClearChat = () => {
    window.dispatchEvent(new CustomEvent('clear-chat'));
    showToast('Chat memory cleared');
  };

  const handleFactoryReset = () => {
    try {
      localStorage.clear();
    } catch (_) {}
    showToast('Resetting all preferences…', 'warn');
    setTimeout(() => window.location.reload(), 1100);
  };

  /* ─── UI Primitives ─── */
  const ToggleSwitch = ({ checked, onChange, color = currentAccent }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-checked={checked}
      role="switch"
      style={{
        width: '42px',
        height: '24px',
        borderRadius: '9999px',
        backgroundColor: checked ? color : (isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.15)'),
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background-color 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        flexShrink: 0,
        boxShadow: checked ? `0 0 12px ${color}55` : 'none',
      }}
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        style={{
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          position: 'absolute',
          top: '3px',
          left: checked ? '21px' : '3px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.35)',
        }}
      />
    </button>
  );

  const SettingRow = ({ icon: Icon, iconColor = currentAccent, label, sublabel, children, danger }) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 14px',
        borderRadius: '14px',
        backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}`,
        marginBottom: '8px',
        transition: 'all 0.15s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
        <div
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '10px',
            flexShrink: 0,
            backgroundColor: danger ? 'rgba(239,68,68,0.15)' : `${iconColor}20`,
            color: danger ? '#ef4444' : iconColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={16} />
        </div>
        <div>
          <div
            style={{
              fontSize: '13.5px',
              fontWeight: 600,
              color: danger ? '#ef4444' : (isDark ? '#f8fafc' : '#0f172a'),
            }}
          >
            {label}
          </div>
          {sublabel && (
            <div
              style={{
                fontSize: '11.5px',
                color: isDark ? '#94a3b8' : '#64748b',
                marginTop: '1px',
              }}
            >
              {sublabel}
            </div>
          )}
        </div>
      </div>
      <div style={{ flexShrink: 0, marginLeft: '12px' }}>{children}</div>
    </div>
  );

  const SectionHeading = ({ title }) => (
    <div
      style={{
        fontSize: '11px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: isDark ? '#64748b' : '#94a3b8',
        padding: '16px 0 8px',
      }}
    >
      {title}
    </div>
  );

  const ActionRowButton = ({ label, icon: Icon, onClick, danger, sublabel }) => (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 14px',
        borderRadius: '14px',
        border: `1px solid ${danger ? 'rgba(239,68,68,0.25)' : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)')}`,
        cursor: 'pointer',
        backgroundColor: danger ? 'rgba(239,68,68,0.08)' : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)'),
        marginBottom: '8px',
        textAlign: 'left',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = danger
          ? 'rgba(239,68,68,0.16)'
          : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)');
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = danger
          ? 'rgba(239,68,68,0.08)'
          : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)');
      }}
    >
      <div
        style={{
          width: '34px',
          height: '34px',
          borderRadius: '10px',
          backgroundColor: danger ? 'rgba(239,68,68,0.15)' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'),
          color: danger ? '#ef4444' : (isDark ? '#e2e8f0' : '#475569'),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={16} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '13.5px', fontWeight: 600, color: danger ? '#ef4444' : (isDark ? '#f8fafc' : '#0f172a') }}>
          {label}
        </div>
        {sublabel && (
          <div style={{ fontSize: '11.5px', color: isDark ? '#94a3b8' : '#64748b', marginTop: '1px' }}>
            {sublabel}
          </div>
        )}
      </div>
      <ChevronRight size={14} style={{ color: isDark ? '#64748b' : '#94a3b8', flexShrink: 0 }} />
    </button>
  );

  /* ── Tab Content Views ── */
  const renderTabContent = () => {
    if (activeTab === 'appearance') {
      return (
        <div>
          {/* Theme Mode Cards */}
          <SectionHeading title="Interface Theme" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
            {/* Light Mode Card */}
            <button
              type="button"
              onClick={() => {
                if (isDark) toggleTheme();
                showToast('Theme → Light');
              }}
              style={{
                padding: '14px',
                borderRadius: '14px',
                border: !isDark ? `2px solid ${currentAccent}` : `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                backgroundColor: !isDark
                  ? `${currentAccent}0c`
                  : (isDark ? '#131b2e' : '#ffffff'),
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
                  color: '#f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Sun size={20} />
              </div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: isDark ? '#cbd5e1' : '#0f172a' }}>
                Light
              </span>
              {!isDark && (
                <div
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    backgroundColor: currentAccent,
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Check size={11} strokeWidth={3} />
                </div>
              )}
            </button>

            {/* Dark Mode Card */}
            <button
              type="button"
              onClick={() => {
                if (!isDark) toggleTheme();
                showToast('Theme → Dark');
              }}
              style={{
                padding: '14px',
                borderRadius: '14px',
                border: isDark ? `2px solid ${currentAccent}` : `1px solid rgba(0,0,0,0.08)`,
                backgroundColor: isDark
                  ? `${currentAccent}18`
                  : '#f8fafc',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: isDark ? 'rgba(56, 189, 248, 0.15)' : '#1e293b',
                  color: '#38bdf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Moon size={20} />
              </div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: isDark ? '#f8fafc' : '#0f172a' }}>
                Dark
              </span>
              {isDark && (
                <div
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    backgroundColor: currentAccent,
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Check size={11} strokeWidth={3} />
                </div>
              )}
            </button>
          </div>

          {/* Accent Color Palette */}
          <SectionHeading title="Accent Color" />
          <div
            style={{
              padding: '14px',
              borderRadius: '14px',
              backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}`,
              marginBottom: '14px',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
              {ACCENTS.map((acc) => {
                const isSelected = accentColor === acc.key || currentAccent === acc.hex;
                return (
                  <button
                    key={acc.key}
                    type="button"
                    title={acc.label}
                    onClick={() => {
                      setAccentColor(acc.key);
                      showToast(`Accent → ${acc.label}`);
                    }}
                    style={{
                      aspectRatio: '1/1',
                      borderRadius: '50%',
                      backgroundColor: acc.hex,
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      boxShadow: isSelected
                        ? `0 0 0 3px ${isDark ? '#0b0f19' : '#ffffff'}, 0 0 0 5.5px ${acc.hex}, 0 0 14px ${acc.hex}80`
                        : 'none',
                      transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  >
                    {isSelected && <Check size={14} color="#ffffff" strokeWidth={3} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Glassmorphism Blur Control */}
          <SectionHeading title="Glassmorphism Blur" />
          <div
            style={{
              padding: '14px',
              borderRadius: '14px',
              backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}`,
              marginBottom: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Layers size={15} style={{ color: currentAccent }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: isDark ? '#e2e8f0' : '#475569' }}>
                Blur Intensity
              </span>
              <span
                style={{
                  marginLeft: 'auto',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  backgroundColor: `${currentAccent}22`,
                  color: currentAccent,
                  textTransform: 'capitalize',
                }}
              >
                {glassIntensity || 'medium'}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {['light', 'medium', 'heavy'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => {
                    setGlassIntensity(lvl);
                    showToast(`Glass blur → ${lvl}`);
                  }}
                  style={{
                    padding: '8px 4px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    border: 'none',
                    backgroundColor: glassIntensity === lvl
                      ? `${currentAccent}26`
                      : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
                    color: glassIntensity === lvl ? currentAccent : (isDark ? '#cbd5e1' : '#64748b'),
                    fontWeight: 700,
                    fontSize: '12px',
                    textTransform: 'capitalize',
                    boxShadow: glassIntensity === lvl ? `inset 0 0 0 1px ${currentAccent}60` : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'ai') {
      return (
        <div>
          <SectionHeading title="AI Assistant Controls" />
          <SettingRow
            icon={Sparkles}
            iconColor="#10b981"
            label="Screen Director"
            sublabel="AI auto-navigates smoothly to relevant sections"
          >
            <ToggleSwitch
              checked={aiAutoNav}
              onChange={(v) => {
                setAiAutoNav(v);
                showToast(v ? 'Auto-nav enabled' : 'Auto-nav disabled');
              }}
              color="#10b981"
            />
          </SettingRow>

          <SettingRow
            icon={Code2}
            iconColor="#f59e0b"
            label="Show Thought Traces"
            sublabel="Display step-by-step vector search traces in chat"
          >
            <ToggleSwitch
              checked={aiShowThoughts}
              onChange={(v) => {
                setAiShowThoughts(v);
                showToast(v ? 'Thought traces ON' : 'Thought traces OFF');
              }}
              color="#f59e0b"
            />
          </SettingRow>

          <SectionHeading title="Memory & History" />
          <ActionRowButton
            label="Clear Chat Memory"
            sublabel="Clears conversation memory and session state"
            icon={Trash2}
            onClick={handleClearChat}
          />

          <SectionHeading title="Architecture" />
          <div
            style={{
              padding: '14px',
              borderRadius: '14px',
              backgroundColor: isDark ? 'rgba(139,92,246,0.12)' : 'rgba(139,92,246,0.05)',
              border: `1px solid ${isDark ? 'rgba(139,92,246,0.28)' : 'rgba(139,92,246,0.15)'}`,
            }}
          >
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <Info size={16} style={{ color: '#a78bfa', marginTop: '2px', flexShrink: 0 }} />
              <p style={{ margin: 0, fontSize: '12px', lineHeight: 1.6, color: isDark ? '#e2e8f0' : '#475569' }}>
                Powered by <strong style={{ color: isDark ? '#c4b5fd' : '#7c3aed' }}>Groq LLaMA 3.3</strong> with
                local vector similarity embeddings. Grounded on Sujith's project knowledge.
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'access') {
      return (
        <div>
          <SectionHeading title="Accessibility" />
          <SettingRow
            icon={highContrast ? Eye : Eye}
            iconColor="#f97316"
            label="High Contrast"
            sublabel="Boosts text contrast and border definition"
          >
            <ToggleSwitch
              checked={highContrast}
              onChange={(v) => {
                setHighContrast(v);
                showToast(v ? 'High contrast ON' : 'High contrast OFF');
              }}
              color="#f97316"
            />
          </SettingRow>

          <SettingRow
            icon={Zap}
            iconColor="#3b82f6"
            label="Reduce Motion"
            sublabel="Simplifies animated transitions across portfolio"
          >
            <ToggleSwitch
              checked={reduceMotion}
              onChange={(v) => {
                setReduceMotion(v);
                showToast(v ? 'Reduced motion ON' : 'Standard motion');
              }}
              color="#3b82f6"
            />
          </SettingRow>
        </div>
      );
    }

    if (activeTab === 'pro') {
      return (
        <div>
          <SectionHeading title="Repository & Source" />
          <ActionRowButton
            label="GitHub Repository"
            sublabel="Explore portfolio source code on GitHub"
            icon={ExternalLink}
            onClick={() => window.open('https://github.com/sujith1546/newreact', '_blank')}
          />

          <SectionHeading title="Danger Zone" />
          <div
            style={{
              padding: '14px',
              borderRadius: '14px',
              backgroundColor: isDark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.06)',
              border: `1px solid ${isDark ? 'rgba(239,68,68,0.25)' : 'rgba(239,68,68,0.18)'}`,
            }}
          >
            <p style={{ margin: '0 0 12px', fontSize: '12px', color: isDark ? '#fca5a5' : '#b91c1c', lineHeight: 1.5 }}>
              This will restore all default portfolio settings, clear theme caches, and reload the application.
            </p>
            <button
              type="button"
              onClick={handleFactoryReset}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '10px',
                border: `1px solid ${isDark ? 'rgba(239,68,68,0.4)' : 'rgba(239,68,68,0.3)'}`,
                backgroundColor: isDark ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.12)',
                color: '#ef4444',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = isDark ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.22)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = isDark ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.12)')}
            >
              <Trash2 size={15} />
              <span>Factory Reset Preferences</span>
            </button>
          </div>
        </div>
      );
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 2000000,
              backgroundColor: isDark
                ? 'rgba(0,0,0,var(--modal-backdrop-opacity, 0.6))'
                : 'rgba(15,23,42,var(--modal-backdrop-opacity, 0.35))',
              backdropFilter: 'blur(var(--modal-backdrop-blur, var(--glass-blur, 12px)))',
              WebkitBackdropFilter: 'blur(var(--modal-backdrop-blur, var(--glass-blur, 12px)))',
            }}
          />

          {/* Settings Drawer Panel */}
          <motion.div
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              maxWidth: '390px',
              backgroundColor: isDark ? 'rgba(11, 15, 25, 0.94)' : 'rgba(255, 255, 255, 0.96)',
              borderLeft: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
              boxShadow: isDark ? '-24px 0 60px rgba(0,0,0,0.8)' : '-16px 0 40px rgba(0,0,0,0.1)',
              backdropFilter: 'blur(var(--modal-card-blur, 16px))',
              WebkitBackdropFilter: 'blur(var(--modal-card-blur, 16px))',
              zIndex: 2000001,
              display: 'flex',
              flexDirection: 'column',
              fontFamily: 'inherit',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '18px 20px 14px',
                borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '10px',
                    backgroundColor: `${currentAccent}22`,
                    color: currentAccent,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Settings2 size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a' }}>
                    Preferences
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '1px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                    <span style={{ fontSize: '11px', color: isDark ? '#94a3b8' : '#64748b' }}>
                      All settings sync automatically
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close preferences"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                  color: isDark ? '#94a3b8' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)';
                  e.currentTarget.style.color = isDark ? '#ffffff' : '#0f172a';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';
                  e.currentTarget.style.color = isDark ? '#94a3b8' : '#64748b';
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Segmented Sliding Tab Bar */}
            <div
              style={{
                display: 'flex',
                padding: '8px 16px',
                gap: '4px',
                borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}`,
                backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
              }}
            >
              {TABS.map((tab) => {
                const active = activeTab === tab.id;
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                      padding: '7px 4px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: active ? (isDark ? '#1e293b' : '#0f172a') : 'transparent',
                      color: active ? '#ffffff' : (isDark ? '#94a3b8' : '#64748b'),
                      fontWeight: active ? 600 : 500,
                      fontSize: '12px',
                      transition: 'all 0.15s ease',
                      position: 'relative',
                    }}
                  >
                    <TabIcon size={14} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Scrollable Settings Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px 16px 24px' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.16, ease: 'easeOut' }}
                >
                  {renderTabContent()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer Status Bar */}
            <div
              style={{
                padding: '11px 18px',
                borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                backgroundColor: isDark ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.02)',
              }}
            >
              <CheckCircle2 size={13} style={{ color: '#10b981' }} />
              <span style={{ fontSize: '11px', color: isDark ? '#94a3b8' : '#64748b' }}>
                All changes saved to cloud & local storage
              </span>
            </div>
          </motion.div>

          {/* Toast Notification */}
          <AnimatePresence>
            {toast && (
              <motion.div
                key="toast"
                initial={{ opacity: 0, y: 20, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ type: 'spring', damping: 24, stiffness: 350 }}
                style={{
                  position: 'fixed',
                  bottom: '28px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 2000002,
                  backgroundColor: isDark ? 'rgba(15,23,42,0.96)' : 'rgba(15,23,42,0.92)',
                  color: '#ffffff',
                  padding: '9px 16px',
                  borderRadius: '9999px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  border: `1px solid ${toast.type === 'warn' ? 'rgba(239,68,68,0.4)' : `${currentAccent}40`}`,
                  boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  whiteSpace: 'nowrap',
                }}
              >
                {toast.type === 'warn' ? (
                  <Trash2 size={13} style={{ color: '#ef4444' }} />
                ) : (
                  <Check size={13} style={{ color: '#10b981' }} />
                )}
                <span>{toast.msg}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
