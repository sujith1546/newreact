import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Loader2 } from 'lucide-react';
import { styles, MODAL_STYLES } from '../shared/constants';
import { PanelCard, EmptyState, StatCard } from '../shared/components';

export default function ThemeStudioPanel() {
  const [ts, setTs] = useState({ primary_color: '#007bff', accent_color: '#6366f1', font_family: 'Inter', enable_particles: true, glass_intensity: 'medium' });
  const [saving, setSaving]   = useState(false);
  const [saved,  setSaved]    = useState(false);

  useEffect(() => {
    supabase.from('site_settings').select('*').eq('id', 1).single().then(({ data }) => {
      if (data) setTs(prev => ({ ...prev, ...data }));
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from('site_settings').update(ts).eq('id', 1);
    setSaving(false);
    if (!error) {
      document.documentElement.style.setProperty('--primary-blue', ts.primary_color);
      document.documentElement.style.setProperty('--accent-blue', ts.accent_color);
      const glassMap = { low: '6px', medium: '14px', high: '28px' };
      document.documentElement.style.setProperty('--glass-blur', glassMap[ts.glass_intensity] || '14px');
      logAuditEvent('UPDATE_THEME_STUDIO', 'site_settings', '1', ts);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else alert('Save failed — check site_settings table.');
  };

  const FONTS    = ['Inter','Roboto','Outfit','DM Sans','Poppins','Fira Code'];
  const PRESETS  = [
    { name: 'Ocean',  primary: '#007bff', accent: '#06b6d4' },
    { name: 'Forest', primary: '#28a745', accent: '#10b981' },
    { name: 'Royal',  primary: '#6366f1', accent: '#8b5cf6' },
    { name: 'Sunset', primary: '#f97316', accent: '#ec4899' },
    { name: 'Slate',  primary: '#475569', accent: '#64748b' },
  ];

  return (
    <PanelCard
      title="Theme Studio & Brand Customizer"
      action={{ label: saving ? 'Saving…' : saved ? '✓ Saved!' : 'Apply Live', icon: 'ti-palette', onClick: handleSave }}
    >
      <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Live preview strip */}
        <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
          <div style={{ background: ts.primary_color, padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ margin: 0, fontFamily: ts.font_family+', sans-serif', fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: -0.4 }}>Live Preview — Portfolio Header</p>
            <button style={{ background: 'rgba(255,255,255,0.22)', border: 'none', color: '#fff', padding: '7px 18px', borderRadius: 20, fontWeight: 700, cursor: 'default', fontFamily: ts.font_family+', sans-serif', fontSize: 13 }}>Contact Me</button>
          </div>
          <div style={{ padding: '16px 22px', background: 'var(--card-bg)', display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: ts.primary_color, opacity: 0.15 }} />
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: ts.primary_color, fontFamily: ts.font_family+', sans-serif' }}>Sujith Thota</p>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>Full Stack & ML Engineer</p>
            </div>
          </div>
        </div>

        {/* Presets */}
        <div>
          <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', color: 'var(--text-muted)' }}>Quick Presets</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {PRESETS.map(p => (
              <button key={p.name} onClick={() => setTs(prev => ({ ...prev, primary_color: p.primary, accent_color: p.accent }))}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, border: `2px solid ${ts.primary_color === p.primary ? p.primary : 'var(--border-color)'}`, background: 'var(--bg-primary)', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: p.primary }} />
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Colour pickers */}
        <div className="admin-settings-grid">
          <div className="admin-field">
            <label>Primary Brand Color</label>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input type="color" value={ts.primary_color} onChange={e => setTs(p => ({...p, primary_color: e.target.value}))}
                style={{ width: 44, height: 40, padding: 2, border: '1px solid var(--border-color)', borderRadius: 8, cursor: 'pointer' }} />
              <input className="admin-input" type="text" value={ts.primary_color} onChange={e => setTs(p => ({...p, primary_color: e.target.value}))} />
            </div>
          </div>
          <div className="admin-field">
            <label>Accent / Link Color</label>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input type="color" value={ts.accent_color} onChange={e => setTs(p => ({...p, accent_color: e.target.value}))}
                style={{ width: 44, height: 40, padding: 2, border: '1px solid var(--border-color)', borderRadius: 8, cursor: 'pointer' }} />
              <input className="admin-input" type="text" value={ts.accent_color} onChange={e => setTs(p => ({...p, accent_color: e.target.value}))} />
            </div>
          </div>
          <div className="admin-field">
            <label>Font Family</label>
            <select className="admin-input" value={ts.font_family} onChange={e => setTs(p => ({...p, font_family: e.target.value}))}>
              {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="admin-field">
            <label>Glassmorphism Blur</label>
            <select className="admin-input" value={ts.glass_intensity} onChange={e => setTs(p => ({...p, glass_intensity: e.target.value}))}>
              <option value="low">Subtle (6px)</option>
              <option value="medium">Medium — Recommended (14px)</option>
              <option value="high">Deep Glass (28px)</option>
            </select>
          </div>
        </div>

        {/* Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 10 }}>
          <input type="checkbox" id="ptoggle" checked={!!ts.enable_particles} onChange={e => setTs(p => ({...p, enable_particles: e.target.checked}))}
            style={{ width: 18, height: 18, cursor: 'pointer', accentColor: ts.primary_color }} />
          <label htmlFor="ptoggle" style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>Enable Interactive Particle Background</label>
        </div>

        {saved && <p style={{ margin: 0, fontSize: 13, color: '#28a745', fontWeight: 600, textAlign: 'center' }}>✓ Theme applied live to the portfolio!</p>}
      </div>
    </PanelCard>
  );
}

/* -------------------------------------------------------------------- */
/* 5. 1-Click Database Backup & Restore Utility                         */
