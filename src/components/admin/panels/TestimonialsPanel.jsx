import React, { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import useRealtimeData from '../../../hooks/useRealtimeData';
import { logAuditEvent } from '../../../lib/auditLogger';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, GripVertical, Loader2, Users, X, Save, Eye, EyeOff } from 'lucide-react';

const BLANK = { name: '', role: '', company: '', avatar_url: '', message: '', display_order: 0, is_visible: true };

function Avatar({ name, url, size = 40 }) {
  const initials = name?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
  const hue = (name?.charCodeAt(0) || 0) * 37 % 360;
  if (url) return <img src={url} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-color)', flexShrink: 0 }} />;
  return <div style={{ width: size, height: size, borderRadius: '50%', background: `hsl(${hue},60%,55%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: size * 0.35, fontWeight: 700, flexShrink: 0 }}>{initials}</div>;
}

export default function TestimonialsPanel() {
  const { data: testimonials, loading } = useRealtimeData('testimonials');
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const sorted = (testimonials || []).sort((a, b) => a.display_order - b.display_order);

  const labelStyle = { fontSize: 10.5, fontWeight: 700, color: 'var(--pcms-muted)', marginBottom: 5, display: 'block', letterSpacing: '0.05em', textTransform: 'uppercase' };
  const inputStyle = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--pcms-line)', background: 'var(--pcms-panel)', color: 'var(--pcms-text)', fontSize: 13, outline: 'none', boxSizing: 'border-box' };

  const handleSave = async (form) => {
    setSaving(true);
    const { name, role, company, avatar_url, message, display_order, is_visible } = form;
    const payload = { name, role, company: company || null, avatar_url: avatar_url || null, message, display_order: Number(display_order) || 0, is_visible };
    let error;
    if (form.id) {
      ({ error } = await supabase.from('testimonials').update(payload).eq('id', form.id));
    } else {
      ({ error } = await supabase.from('testimonials').insert(payload));
    }
    setSaving(false);
    if (error) { alert('Error: ' + error.message); return; }
    logAuditEvent(form.id ? 'UPDATE_TESTIMONIAL' : 'ADD_TESTIMONIAL', 'testimonials', name);
    setEditing(null);
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete testimonial from "${name}"?`)) return;
    setDeleting(id);
    await supabase.from('testimonials').delete().eq('id', id);
    logAuditEvent('DELETE_TESTIMONIAL', 'testimonials', name);
    setDeleting(null);
  };

  const handleVisibility = async (t) => {
    await supabase.from('testimonials').update({ is_visible: !t.is_visible }).eq('id', t.id);
    logAuditEvent('TOGGLE_TESTIMONIAL_VISIBILITY', 'testimonials', t.name);
  };

  const copyRequestLink = () => {
    const link = `${window.location.origin}/contact?type=testimonial`;
    navigator.clipboard.writeText(link);
    alert(`Public testimonial request link copied to clipboard!\n${link}`);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Users size={22} color="#8b5cf6" /> Testimonials
          </h2>
          <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: 14 }}>{(testimonials || []).length} endorsements · {(testimonials || []).filter(t => t.is_visible).length} visible</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={copyRequestLink} className="pcms-btn-secondary" style={{ padding: '8px 14px', fontSize: 13 }}>
            🔗 Request Link
          </button>
          <button onClick={() => setEditing({ ...BLANK })} disabled={editing !== null} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 14,
            boxShadow: '0 4px 16px rgba(139,92,246,0.35)',
          }}>
            <Plus size={16} /> Add Testimonial
          </button>
        </div>
      </div>

      {/* Editor Form */}
      <AnimatePresence>
        {editing && (
          <motion.div
            key="editor"
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ marginBottom: 24, background: 'var(--bg-secondary)', borderRadius: 20, border: '1px solid var(--border-color)', padding: 28, overflow: 'hidden' }}
          >
            <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              {editing.id ? '✏️ Edit Testimonial' : '➕ Add New Testimonial'}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              {[
                ['name', 'Name *', 'Jane Doe'],
                ['role', 'Role / Title', 'Senior Engineer'],
                ['company', 'Company (optional)', 'TechCorp'],
                ['avatar_url', 'Avatar URL (optional)', 'https://...'],
              ].map(([key, label, ph]) => (
                <div key={key}>
                  <label style={labelStyle}>{label}</label>
                  <input style={inputStyle} value={editing[key] || ''} onChange={e => setEditing(p => ({ ...p, [key]: e.target.value }))} placeholder={ph} />
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Message *</label>
              <textarea style={{ ...inputStyle, minHeight: 100, resize: 'vertical', lineHeight: 1.6 }} value={editing.message || ''} onChange={e => setEditing(p => ({ ...p, message: e.target.value }))} placeholder="Write a genuine endorsement..." />
            </div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <div style={{ flex: '0 0 120px' }}>
                <label style={labelStyle}>Display Order</label>
                <input style={inputStyle} type="number" value={editing.display_order ?? 0} onChange={e => setEditing(p => ({ ...p, display_order: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 2 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: 'var(--text-primary)' }}>
                  <input type="checkbox" checked={editing.is_visible} onChange={e => setEditing(p => ({ ...p, is_visible: e.target.checked }))} />
                  Visible to visitors
                </label>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 12, borderTop: '1px solid var(--pcms-line)' }}>
              <button onClick={() => setEditing(null)} className="pcms-btn-secondary">Cancel</button>
              <button onClick={() => handleSave(editing)} disabled={saving || !editing.name || !editing.message} className="pcms-btn-dark" style={{ opacity: saving ? 0.7 : 1 }}>
                {saving ? <Loader2 size={15} className="spin" /> : <Save size={15} />}
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      {loading ? (
        <div style={{ padding: 60, display: 'flex', justifyContent: 'center' }}><Loader2 className="spin" size={28} color="#8b5cf6" /></div>
      ) : sorted.length === 0 ? (
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
          <Users size={40} style={{ opacity: 0.2, marginBottom: 12 }} />
          <p style={{ fontSize: 15, fontWeight: 600 }}>No testimonials yet</p>
          <p style={{ fontSize: 13 }}>Add endorsements from colleagues, professors, or mentors.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sorted.map(t => (
            <motion.div key={t.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: 'var(--pcms-panel-2)', border: '1px solid var(--pcms-line)', borderRadius: 10, padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'flex-start', opacity: deleting === t.id ? 0.5 : 1 }}
            >
              <Avatar name={t.name} url={t.avatar_url} size={40} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--pcms-text)' }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--pcms-muted)' }}>{t.role}{t.company ? ` · ${t.company}` : ''}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button onClick={() => handleVisibility(t)} title={t.is_visible ? 'Hide' : 'Show'} className="pcms-icon-btn" style={{ color: t.is_visible ? 'var(--pcms-green)' : 'var(--pcms-muted)' }}>
                      {t.is_visible ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    <button onClick={() => setEditing({ ...t })} className="pcms-icon-btn edit">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(t.id, t.name)} className="pcms-icon-btn danger">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p style={{ margin: '8px 0 0', fontSize: 12.5, color: 'var(--pcms-text)', lineHeight: 1.5, opacity: 0.9 }}>"{t.message}"</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

