import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { notifyDataMutation } from '../../../lib/syncDispatcher';
import { Loader2, Edit3, Trash2, BookOpen, X, Plus } from 'lucide-react';
import { styles, MODAL_STYLES } from '../shared/constants';
import { PanelCard, EmptyState, StatCard } from '../shared/components';

export default function EducationPanel() {
  const [edu, setEdu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [toast, setToast] = useState(null);

  const EMPTY_FORM = { 
    id: '', short_label: '', year: '', title: '', institution: '', location: '', description: '', 
    score: '', progress: 100, icon_class: 'BookOpen', theme_color: '#3b82f6', bg_color: '#eff6ff', text_color: '#1e3a8a',
    highlights: [''], back_stats: '', highlight_text: '', display_order: 0 
  };
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => { fetchEdu(); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchEdu = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('education').select('*').order('display_order', { ascending: true });
    if (!error && data) setEdu(data);
    setLoading(false);
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        ...item,
        highlights: Array.isArray(item.highlights) && item.highlights.length > 0 ? item.highlights : [''],
        back_stats: item.back_stats ? JSON.stringify(item.back_stats, null, 2) : '[\n  {\n    "label": "GPA",\n    "value": "4.0"\n  }\n]',
      });
    } else {
      setEditingItem(null);
      setFormData(EMPTY_FORM);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingItem(null); };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    const { error } = await supabase.from('education').delete().eq('id', id);
    if (!error) {
      setEdu(edu.filter(c => c.id !== id));
      notifyDataMutation('education', 'DELETE', { id, title });
      showToast(`"${title}" deleted`, 'error');
    } else showToast('Failed to delete', 'error');
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.institution.trim()) { showToast('Title and Institution are required', 'error'); return; }

    let parsedStats = [];
    if (formData.back_stats && formData.back_stats.trim()) {
      try {
        parsedStats = JSON.parse(formData.back_stats);
        if (!Array.isArray(parsedStats)) throw new Error('Must be an array');
      } catch (e) {
        showToast('Back stats must be valid JSON array', 'error'); return;
      }
    }

    setSaving(true);
    const payload = {
      ...formData,
      id: formData.id || formData.title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      progress: parseInt(formData.progress) || 100,
      display_order: parseInt(formData.display_order) || 0,
      highlights: formData.highlights.filter(h => h.trim()),
      back_stats: parsedStats
    };

    const isUpdate = edu.some(c => c.id === payload.id);

    if (isUpdate) {
      const { data, error } = await supabase.from('education').update(payload).eq('id', payload.id).select().single();
      if (!error && data) {
        setEdu(edu.map(c => c.id === data.id ? data : c).sort((a,b) => a.display_order - b.display_order));
        notifyDataMutation('education', 'UPDATE', data);
        showToast('Education updated');
        closeModal();
      } else showToast('Failed to update', 'error');
    } else {
      const { data, error } = await supabase.from('education').insert([payload]).select().single();
      if (!error && data) {
        setEdu([...edu, data].sort((a,b) => a.display_order - b.display_order));
        notifyDataMutation('education', 'INSERT', data);
        showToast('Education added');
        closeModal();
      } else showToast('Failed to add', 'error');
    }
    setSaving(false);
  };

  const handleArrayChange = (index, value) => {
    const newArray = [...formData.highlights];
    newArray[index] = value;
    setFormData({ ...formData, highlights: newArray });
  };
  const addArrayItem = () => setFormData({ ...formData, highlights: [...formData.highlights, ''] });
  const removeArrayItem = (index) => setFormData({ ...formData, highlights: formData.highlights.filter((_, i) => i !== index) });

  if (loading) return <PanelCard title="Education"><div style={styles.emptyState}><Loader2 className="spin" size={24} color="var(--text-muted)" /></div></PanelCard>;

  const modalOverlay = { position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' };
  const modalBox = { background: 'var(--pcms-panel)', border: '1px solid var(--pcms-line)', borderRadius: '14px', width: '100%', maxWidth: '680px', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column' };
  const labelStyle = { fontSize: 10.5, fontWeight: 700, color: 'var(--pcms-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 5 };
  const inputStyle = { ...styles.input, background: 'var(--pcms-panel)' };

  return (
    <>
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, background: toast.type === 'error' ? '#ef4444' : '#10b981', color: '#fff', padding: '12px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
          {toast.msg}
        </div>
      )}

      <PanelCard title="Education" action={{ label: "Add", icon: "ti-plus", onClick: () => openModal() }}>
        {edu.length === 0 ? (
          <EmptyState icon="ti-book" title="No education" description="Add your educational history." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead><tr><th style={styles.th}>Degree / Title</th><th style={styles.th}>Institution</th><th style={styles.th}>Year</th><th style={{ ...styles.th, textAlign: 'right' }}>Actions</th></tr></thead>
              <tbody>
                {edu.map((item, i) => (
                  <tr key={item.id} style={{ background: i % 2 === 0 ? 'transparent' : 'var(--pcms-panel-2)' }}>
                    <td style={{ ...styles.td, fontWeight: 600, color: 'var(--pcms-text)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.theme_color || '#EC4899' }} />
                        <span>{item.title}</span>
                        {item.score && (
                          <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: 'rgba(236,72,153,0.12)', color: '#ec4899', border: '1px solid rgba(236,72,153,0.25)' }}>
                            🎓 {item.score}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ ...styles.td, color: 'var(--pcms-muted)' }}>{item.institution}</td>
                    <td style={{ ...styles.td, color: 'var(--pcms-muted)' }}>{item.year}</td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                        <button onClick={() => openModal(item)} className="pcms-icon-btn edit"><Edit3 size={14} /></button>
                        <button onClick={() => handleDelete(item.id, item.title)} className="pcms-icon-btn danger"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PanelCard>

      {isModalOpen && (
        <div style={modalOverlay} onClick={closeModal}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--pcms-line)', background: 'var(--pcms-panel-2)', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(236,72,153,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BookOpen size={15} color="#EC4899" /></div>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--pcms-text)', fontFamily: "'Space Grotesk', sans-serif" }}>{editingItem ? 'Edit Education' : 'New Education'}</p>
                </div>
              </div>
              <button onClick={closeModal} className="pcms-icon-btn"><X size={18} /></button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Title <span style={{ color: '#ef4444' }}>*</span></label>
                  <input style={inputStyle} value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="B.Tech Computer Science" autoFocus />
                </div>
                <div>
                  <label style={labelStyle}>Institution <span style={{ color: '#ef4444' }}>*</span></label>
                  <input style={inputStyle} value={formData.institution} onChange={e => setFormData({ ...formData, institution: e.target.value })} placeholder="University Name" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Short Label</label>
                  <input style={inputStyle} value={formData.short_label} onChange={e => setFormData({ ...formData, short_label: e.target.value })} placeholder="e.g. B.Tech" />
                </div>
                <div>
                  <label style={labelStyle}>Year</label>
                  <input style={inputStyle} value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })} placeholder="2020 - 2024" />
                </div>
                <div>
                  <label style={labelStyle}>Location</label>
                  <input style={inputStyle} value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="City, State" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Score String</label>
                  <input style={inputStyle} value={formData.score} onChange={e => setFormData({ ...formData, score: e.target.value })} placeholder="CGPA: 8.7" />
                </div>
                <div>
                  <label style={labelStyle}>Progress % (0-100)</label>
                  <input type="number" min="0" max="100" style={inputStyle} value={formData.progress} onChange={e => setFormData({ ...formData, progress: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Icon Class (Lucide)</label>
                  <input style={inputStyle} value={formData.icon_class} onChange={e => setFormData({ ...formData, icon_class: e.target.value })} placeholder="BookOpen" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Theme Color</label>
                  <input type="color" style={{ ...inputStyle, padding: 4, height: 42 }} value={formData.theme_color} onChange={e => setFormData({ ...formData, theme_color: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>BG Color</label>
                  <input type="color" style={{ ...inputStyle, padding: 4, height: 42 }} value={formData.bg_color} onChange={e => setFormData({ ...formData, bg_color: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Text Color</label>
                  <input type="color" style={{ ...inputStyle, padding: 4, height: 42 }} value={formData.text_color} onChange={e => setFormData({ ...formData, text_color: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Display Order</label>
                  <input type="number" style={inputStyle} value={formData.display_order} onChange={e => setFormData({ ...formData, display_order: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Description</label>
                  <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Back Stats (JSON)</label>
                  <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical', fontFamily: 'monospace', fontSize: 12, lineHeight: 1.4 }} value={formData.back_stats} onChange={e => setFormData({ ...formData, back_stats: e.target.value })} placeholder='[
  {
    "label": "GPA",
    "value": "4.0"
  }
]' />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Highlight Text (Footer)</label>
                  <input style={inputStyle} value={formData.highlight_text} onChange={e => setFormData({ ...formData, highlight_text: e.target.value })} placeholder="e.g. Top 5% of class" />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>Highlights List</label>
                    <button onClick={addArrayItem} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}><Plus size={12}/> Add</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {formData.highlights.map((h, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: 6 }}>
                        <input style={{ ...inputStyle, flex: 1, padding: '6px 10px', fontSize: 13 }} value={h} onChange={e => handleArrayChange(idx, e.target.value)} placeholder="e.g. Data Science" />
                        {formData.highlights.length > 1 && <button onClick={() => removeArrayItem(idx)} style={{ ...styles.iconBtn, padding: 4, background: 'rgba(239,68,68,0.1)' }}><X size={12} color="#ef4444" /></button>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
            
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0 }}>
              <button onClick={closeModal} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSubmit} disabled={saving} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#3b82f6', color: '#fff', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 7 }}>
                {saving && <Loader2 size={14} className="spin" />} Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


