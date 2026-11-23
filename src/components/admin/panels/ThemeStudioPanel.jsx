import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Palette, Type, Layout, RotateCcw, Save, CheckCircle2, Sparkles } from 'lucide-react';

const THEME_KEY = 'pcms_theme_overrides';

const COLOR_VARS = [
  { key: '--primary-blue', label: 'Primary Accent', default: '#3b82f6' },
  { key: '--accent', label: 'Secondary Accent', default: '#6366f1' },
  { key: '--bg-primary', label: 'Canvas Background', default: '#0f1117' },
  { key: '--card-bg', label: 'Card Background', default: '#1a1f2e' },
  { key: '--text-primary', label: 'Text Primary', default: '#e2e8f0' },
  { key: '--border-color', label: 'Subtle Borders', default: '#2a2f3e' },
];

const FONTS = ['Inter', 'Space Grotesk', 'DM Sans', 'Poppins', 'JetBrains Mono'];

const PRESETS = [
  {
    name: 'Dark Pro',
    emoji: '🌑',
    description: 'Current signature dark navy theme',
    vars: { '--primary-blue': '#3b82f6', '--accent': '#6366f1', '--bg-primary': '#0f1117', '--card-bg': '#1a1f2e', '--text-primary': '#e2e8f0', '--border-color': '#2a2f3e' },
  },
  {
    name: 'Minimal Obsidian',
    emoji: '⬛',
    description: 'High-contrast monochrome',
    vars: { '--primary-blue': '#ffffff', '--accent': '#888888', '--bg-primary': '#050505', '--card-bg': '#121212', '--text-primary': '#f5f5f5', '--border-color': '#242424' },
  },
  {
    name: 'Cyberpunk Violet',
    emoji: '🔮',
    description: 'Futuristic purple & magenta accents',
    vars: { '--primary-blue': '#a855f7', '--accent': '#ec4899', '--bg-primary': '#0b0614', '--card-bg': '#180e2a', '--text-primary': '#f0e6ff', '--border-color': '#3b1c68' },
  },
  {
    name: 'Nordic Clean',
    emoji: '❄️',
    description: 'Crisp light slate palette',
    vars: { '--primary-blue': '#2563eb', '--accent': '#4f46e5', '--bg-primary': '#f8fafc', '--card-bg': '#ffffff', '--text-primary': '#0f172a', '--border-color': '#e2e8f0' },
  },
];

function applyVars(vars) {
  if (typeof document === 'undefined') return;
  Object.entries(vars).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
}

export default function ThemeStudioPanel() {
  const [colors, setColors] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(THEME_KEY) || '{}');
      return Object.fromEntries(COLOR_VARS.map(c => [c.key, saved[c.key] || c.default]));
    } catch {
      return Object.fromEntries(COLOR_VARS.map(c => [c.key, c.default]));
    }
  });
  const [font, setFont] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('pcms_theme_font') : '') || 'Inter');
  const [headingWeight, setHeadingWeight] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('pcms_heading_weight') : '') || '700');
  const [borderRadius, setBorderRadius] = useState(() => parseInt((typeof window !== 'undefined' ? localStorage.getItem('pcms_border_radius') : '') || '12'));
  const [saved, setSaved] = useState(false);
  const [activePreset, setActivePreset] = useState('Dark Pro');

  useEffect(() => {
    try {
      const savedOverrides = JSON.parse(localStorage.getItem(THEME_KEY) || '{}');
      if (Object.keys(savedOverrides).length > 0) applyVars(savedOverrides);
    } catch (_) {}
  }, []);

  const handleColorChange = (key, value) => {
    setColors(prev => ({ ...prev, [key]: value }));
    document.documentElement.style.setProperty(key, value);
    setActivePreset(null);
  };

  const handlePreset = (preset) => {
    setColors(preset.vars);
    applyVars(preset.vars);
    setActivePreset(preset.name);
  };

  const handleReset = (key, defaultVal) => {
    setColors(prev => ({ ...prev, [key]: defaultVal }));
    document.documentElement.style.setProperty(key, defaultVal);
  };

  const handleSave = () => {
    localStorage.setItem(THEME_KEY, JSON.stringify(colors));
    localStorage.setItem('pcms_theme_font', font);
    localStorage.setItem('pcms_heading_weight', headingWeight);
    localStorage.setItem('pcms_border_radius', String(borderRadius));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleResetAll = () => {
    localStorage.removeItem(THEME_KEY);
    localStorage.removeItem('pcms_theme_font');
    localStorage.removeItem('pcms_heading_weight');
    localStorage.removeItem('pcms_border_radius');
    const defaults = Object.fromEntries(COLOR_VARS.map(c => [c.key, c.default]));
    setColors(defaults);
    applyVars(defaults);
    COLOR_VARS.forEach(c => document.documentElement.style.removeProperty(c.key));
    setFont('Inter');
    setHeadingWeight('700');
    setBorderRadius(12);
    setActivePreset('Dark Pro');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #EC4899, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Palette size={18} color="#fff" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--pcms-text)', fontFamily: "'Space Grotesk', sans-serif" }}>Live Theme & Styling Studio</h2>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--pcms-muted)' }}>CSS variable engine — changes preview live across your portfolio</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={handleResetAll}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid var(--pcms-line)', background: 'var(--pcms-panel-2)', color: 'var(--pcms-muted)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
          >
            <RotateCcw size={13} /> Reset All
          </button>
          <button
            type="button"
            onClick={handleSave}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 8, background: saved ? '#10B981' : 'linear-gradient(135deg, #EC4899, #8B5CF6)', color: '#fff', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
          >
            {saved ? <><CheckCircle2 size={13} /> Theme Saved</> : <><Save size={13} /> Save Palette</>}
          </button>
        </div>
      </div>

      {/* Preset Cards */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="pcms-panel-card">
        <div className="pcms-panel-header">
          <div className="pcms-panel-title-row">
            <div className="pcms-panel-icon" style={{ background: 'rgba(236,72,153,0.12)', color: '#EC4899' }}><Sparkles size={15} /></div>
            <div>
              <div className="pcms-panel-title">Curated Color Themes</div>
              <div className="pcms-panel-subtitle">One-click instant application</div>
            </div>
          </div>
        </div>
        <div className="pcms-panel-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 }}>
            {PRESETS.map(p => (
              <motion.button
                key={p.name}
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePreset(p)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  padding: '12px 14px',
                  borderRadius: 10,
                  background: activePreset === p.name ? 'rgba(99,102,241,0.08)' : 'var(--pcms-panel-2)',
                  border: `1.5px solid ${activePreset === p.name ? '#6366F1' : 'var(--pcms-line)'}`,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s'
                }}
              >
                <div style={{ display: 'flex', gap: 4 }}>
                  {Object.values(p.vars).slice(0, 4).map((c, i) => (
                    <div key={i} style={{ width: 16, height: 16, borderRadius: 4, background: c, border: '1px solid rgba(0,0,0,0.2)' }} />
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--pcms-text)' }}>{p.emoji} {p.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--pcms-muted)', marginTop: 2 }}>{p.description}</div>
                </div>
                {activePreset === p.name && <span style={{ fontSize: 10, color: '#6366F1', fontWeight: 700 }}>✓ Applied</span>}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Individual Color Tokens */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="pcms-panel-card">
        <div className="pcms-panel-header">
          <div className="pcms-panel-title-row">
            <div className="pcms-panel-icon" style={{ background: 'rgba(99,102,241,0.12)', color: '#6366F1' }}><Palette size={15} /></div>
            <div>
              <div className="pcms-panel-title">Token Overrides</div>
              <div className="pcms-panel-subtitle">Fine-tune individual CSS color variables</div>
            </div>
          </div>
        </div>
        <div className="pcms-panel-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 12 }}>
            {COLOR_VARS.map(cv => (
              <div key={cv.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 8, background: 'var(--pcms-panel-2)', border: '1px solid var(--pcms-line)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ position: 'relative', width: 30, height: 30 }}>
                    <div
                      style={{ width: 30, height: 30, borderRadius: 8, background: colors[cv.key], border: '2px solid var(--pcms-line)', cursor: 'pointer' }}
                      onClick={() => document.getElementById(`color-${cv.key.replace('--', '')}`).click()}
                    />
                    <input
                      id={`color-${cv.key.replace('--', '')}`}
                      type="color"
                      value={colors[cv.key]}
                      onChange={e => handleColorChange(cv.key, e.target.value)}
                      style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer', border: 'none' }}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--pcms-text)' }}>{cv.label}</div>
                    <div style={{ fontSize: 10, color: 'var(--pcms-muted)', fontFamily: 'monospace' }}>{colors[cv.key]}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleReset(cv.key, cv.default)}
                  title="Reset token"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--pcms-muted)', display: 'flex', alignItems: 'center', padding: 4 }}
                >
                  <RotateCcw size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Typography & Layout Tokens */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="pcms-panel-card">
          <div className="pcms-panel-header">
            <div className="pcms-panel-title-row">
              <div className="pcms-panel-icon" style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981' }}><Type size={15} /></div>
              <div><div className="pcms-panel-title">Typography & Font Hierarchy</div></div>
            </div>
          </div>
          <div className="pcms-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--pcms-muted)', display: 'block', marginBottom: 6 }}>Font Family</label>
              <select
                value={font}
                onChange={e => setFont(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--pcms-line)', background: 'var(--pcms-panel-2)', color: 'var(--pcms-text)', fontSize: 13, cursor: 'pointer' }}
              >
                {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--pcms-muted)', display: 'block', marginBottom: 6 }}>Heading Font Weight</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {['600', '700', '800'].map(w => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setHeadingWeight(w)}
                    style={{ flex: 1, padding: '7px', borderRadius: 8, border: `1px solid ${headingWeight === w ? '#6366F1' : 'var(--pcms-line)'}`, background: headingWeight === w ? 'rgba(99,102,241,0.1)' : 'var(--pcms-panel-2)', color: headingWeight === w ? '#6366F1' : 'var(--pcms-muted)', fontSize: 13, fontWeight: parseInt(w), cursor: 'pointer' }}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="pcms-panel-card">
          <div className="pcms-panel-header">
            <div className="pcms-panel-title-row">
              <div className="pcms-panel-icon" style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B' }}><Layout size={15} /></div>
              <div><div className="pcms-panel-title">Layout & Radius Tokens</div></div>
            </div>
          </div>
          <div className="pcms-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--pcms-muted)', display: 'block', marginBottom: 6 }}>
                Card Border Radius: {borderRadius}px
              </label>
              <input
                type="range"
                min={4}
                max={24}
                value={borderRadius}
                onChange={e => {
                  const v = parseInt(e.target.value);
                  setBorderRadius(v);
                  document.documentElement.style.setProperty('--radius-card', `${v}px`);
                }}
                style={{ width: '100%', accentColor: '#6366F1' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--pcms-muted)', marginTop: 2 }}>
                <span>4px (Sharp)</span>
                <span>24px (Pill)</span>
              </div>
            </div>

            {/* Live Card Specimen */}
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--pcms-muted)', display: 'block', marginBottom: 6 }}>Live Preview Specimen</label>
              <div style={{ padding: 12, borderRadius: borderRadius, background: colors['--card-bg'] || '#1a1f2e', border: `1px solid ${colors['--border-color'] || '#2a2f3e'}` }}>
                <div style={{ fontSize: 13, fontWeight: parseInt(headingWeight), color: colors['--text-primary'] || '#e2e8f0', fontFamily: font, marginBottom: 3 }}>
                  SMS Finance Analyzer
                </div>
                <div style={{ fontSize: 11, color: colors['--primary-blue'] || '#3b82f6', marginBottom: 8 }}>
                  AI / ML · RAG Architecture
                </div>
                <div style={{ display: 'inline-flex', padding: '4px 10px', borderRadius: Math.max(4, borderRadius / 2), background: colors['--primary-blue'] || '#3b82f6', color: '#fff', fontSize: 11, fontWeight: 600 }}>
                  View Project →
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
