import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Settings2, Palette, Sparkles, Bot, 
  Volume2, Eye, ShieldAlert, RotateCcw, 
  MonitorPlay, Code, Paintbrush, Activity,
  Moon, Sun, Layout, Box, Trash2
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function SettingsSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    theme, toggleTheme, 
    accentColor, setAccentColor,
    pageTransition, setPageTransition,
    glassIntensity, setGlassIntensity,
    reduceMotion, setReduceMotion,
    highContrast, setHighContrast,
    aiVoice, setAiVoice,
    aiAutoNav, setAiAutoNav,
    uiAudio, setUiAudio,
    devMode, setDevMode
  } = useTheme();

  const isDark = theme === 'dark';

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
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleFactoryReset = () => {
    if (window.confirm("Are you sure you want to reset all preferences? This will clear your chat history and restore defaults.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleClearChat = () => {
    if (window.confirm("Clear AI chat history?")) {
      window.dispatchEvent(new CustomEvent('clear-chat'));
      alert('Chat history cleared.');
    }
  };

  const handleResetDisclaimer = () => {
    localStorage.removeItem('ai_disclaimer_dismissed');
    window.dispatchEvent(new CustomEvent('clear-chat')); // Trigger re-render to show disclaimer
    alert('AI Disclaimer restored in chat.');
  };

  // Reusable Switch Component
  const Switch = ({ checked, onChange, label, icon: Icon, color = '#8b5cf6' }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ 
          width: '28px', height: '28px', borderRadius: '8px', 
          background: checked ? `${color}25` : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'), 
          color: checked ? color : (isDark ? '#94a3b8' : '#64748b'),
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Icon size={14} />
        </div>
        <span style={{ fontSize: '13px', fontWeight: 600, color: isDark ? '#f1f5f9' : '#0f172a' }}>{label}</span>
      </div>
      <button
        onClick={() => onChange(!checked)}
        style={{
          width: '36px', height: '20px', borderRadius: '100px',
          background: checked ? color : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'),
          border: 'none', cursor: 'pointer', position: 'relative',
          transition: 'all 0.25s ease'
        }}
      >
        <div style={{
          width: '16px', height: '16px', borderRadius: '50%', background: '#fff',
          position: 'absolute', top: '2px', left: checked ? '18px' : '2px',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }} />
      </button>
    </div>
  );

  const SectionTitle = ({ title, icon: Icon }) => (
    <div style={{ 
      display: 'flex', alignItems: 'center', gap: '6px', 
      marginBottom: '12px', marginTop: '24px',
      color: isDark ? '#64748b' : '#94a3b8', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em'
    }}>
      <Icon size={12} />
      {title}
    </div>
  );

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed', inset: 0,
              backgroundColor: isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.3)',
              backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
              zIndex: 2000000,
            }}
          />

          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0,
              width: '100%', maxWidth: '380px',
              backgroundColor: isDark ? 'rgba(18, 12, 38, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              borderLeft: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.22)' : 'rgba(128, 128, 128, 0.18)'}`,
              boxShadow: isDark ? '-20px 0 48px rgba(0, 0, 0, 0.6)' : '-16px 0 38px rgba(0, 0, 0, 0.16)',
              backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              zIndex: 2000001, display: 'flex', flexDirection: 'column', fontFamily: 'inherit',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 24px', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '10px',
                  background: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6'
                }}>
                  <Settings2 size={18} />
                </div>
                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: isDark ? '#fff' : '#0f172a' }}>Preferences</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: isDark ? '#94a3b8' : '#64748b', transition: 'all 0.2s'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px' }}>
              
              <SectionTitle title="Appearance" icon={Palette} />
              
              <Switch label="Dark Mode" icon={isDark ? Moon : Sun} checked={isDark} onChange={toggleTheme} color={isDark ? '#8b5cf6' : '#f59e0b'} />
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', color: isDark ? '#94a3b8' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Paintbrush size={14} /></div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: isDark ? '#f1f5f9' : '#0f172a' }}>Accent Color</span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {['blue', 'purple', 'emerald', 'rose'].map(color => (
                    <button
                      key={color}
                      onClick={() => setAccentColor(color)}
                      style={{
                        width: '20px', height: '20px', borderRadius: '50%', cursor: 'pointer',
                        background: color === 'blue' ? '#3b82f6' : color === 'purple' ? '#8b5cf6' : color === 'emerald' ? '#10b981' : '#f43f5e',
                        border: accentColor === color ? '2px solid #fff' : '2px solid transparent',
                        boxShadow: accentColor === color ? '0 0 0 1px rgba(139,92,246,0.5)' : 'none'
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', color: isDark ? '#94a3b8' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Box size={14} /></div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: isDark ? '#f1f5f9' : '#0f172a' }}>Glass Intensity</span>
                </div>
                <div style={{ display: 'flex', gap: '4px', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', padding: '3px', borderRadius: '6px' }}>
                  {['light', 'medium', 'heavy'].map(level => (
                    <button
                      key={level} onClick={() => setGlassIntensity(level)}
                      style={{
                        background: glassIntensity === level ? (isDark ? '#334155' : '#fff') : 'transparent',
                        color: glassIntensity === level ? (isDark ? '#fff' : '#000') : (isDark ? '#94a3b8' : '#64748b'),
                        border: 'none', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize'
                      }}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <SectionTitle title="AI & Screen Director" icon={Bot} />
              
              <Switch label="AI Voice Responses" icon={Volume2} checked={aiVoice} onChange={setAiVoice} color="#8b5cf6" />
              <Switch label="Auto-Navigate Pages" icon={Sparkles} checked={aiAutoNav} onChange={setAiAutoNav} color="#10b981" />
              
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button onClick={handleResetDisclaimer} style={{ flex: 1, padding: '8px', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', border: 'none', borderRadius: '8px', color: isDark ? '#cbd5e1' : '#475569', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                  Restore Disclaimer
                </button>
                <button onClick={handleClearChat} style={{ flex: 1, padding: '8px', background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: '8px', color: '#ef4444', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                  Clear Memory
                </button>
              </div>

              <SectionTitle title="Accessibility & UX" icon={Eye} />
              <Switch label="UI Sound Effects" icon={Volume2} checked={uiAudio} onChange={setUiAudio} color="#3b82f6" />
              <Switch label="Reduce Motion" icon={Activity} checked={reduceMotion} onChange={setReduceMotion} color="#eab308" />
              <Switch label="High Contrast" icon={Eye} checked={highContrast} onChange={setHighContrast} color="#f97316" />

              <SectionTitle title="Pro Tools" icon={Code} />
              <Switch label="Performance HUD" icon={MonitorPlay} checked={devMode} onChange={setDevMode} color="#14b8a6" />
              
              <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}` }}>
                <button 
                  onClick={handleFactoryReset}
                  style={{
                    width: '100%', padding: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: '8px', color: '#ef4444', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                >
                  <Trash2 size={16} />
                  Factory Reset Settings
                </button>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
