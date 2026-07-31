import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Loader2, Briefcase, Edit3, Trash2, X, ImageIcon, Plus } from 'lucide-react';
import { styles, MODAL_STYLES } from '../shared/constants';
import { PanelCard, EmptyState, StatCard } from '../shared/components';

export default function ExperiencePanel() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExp, setEditingExp] = useState(null);
  const [toast, setToast] = useState(null);

  const EMPTY_FORM = {
    role: '', company: '', start_date: '', end_date: '', 
    description_bullets: [''], logo_url: '', is_education: false, display_order: 0,
    is_current: false
  };
  const [formData, setFormData] = useState(EMPTY_FORM);

  function calculateTenure(start, end, isCurrent) {
    if (!start) return '';
    const d1 = new Date(start);
    const d2 = isCurrent || !end ? new Date() : new Date(end);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return '';
    const months = Math.max(1, (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth()));
    const yrs = Math.floor(months / 12);
    const mos = months % 12;
    let str = '';
    if (yrs > 0) str += `${yrs} yr${yrs > 1 ? 's' : ''} `;
    if (mos > 0 || yrs === 0) str += `${mos} mo${mos > 1 ? 's' : ''}`;
    return str.trim();
  }

  useEffect(() => { fetchExperience(); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchExperience = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('experience').select('*').order('display_order', { ascending: true });
    if (!error && data) setExperiences(data);
    setLoading(false);
  };

  const openModal = (exp = null) => {
    if (exp) {
      setEditingExp(exp);
      setFormData({
        ...exp,
        is_current: !exp.end_date,
        end_date: exp.end_date || '',
        description_bullets: Array.isArray(exp.description_bullets) && exp.description_bullets.length > 0 ? exp.description_bullets : [''],
      });
    } else {
      setEditingExp(null);
      setFormData(EMPTY_FORM);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingExp(null); };

  const handleDelete = async (id, role) => {
    if (!window.confirm(`Delete "${role}"? This cannot be undone.`)) return;
    const { error } = await supabase.from('experience').delete().eq('id', id);
    if (!error) {
      setExperiences(experiences.filter(e => e.id !== id));
      showToast(`"${role}" deleted`, 'error');
    } else showToast('Failed to delete', 'error');
  };

  const handleSubmit = async () => {
    if (!formData.role.trim() || !formData.company.trim() || !formData.start_date.trim()) { 
      showToast('Role, Company, and Start Date are required', 'error'); return; 
    }
    
    if (!formData.is_current && formData.end_date) {
      const d1 = new Date(formData.start_date);
      const d2 = new Date(formData.end_date);
      if (!isNaN(d1) && !isNaN(d2) && d2 < d1) {
         showToast("End date cannot be before start date", 'error'); return;
      }
    }

    setSaving(true);
    const payload = {
      ...formData,
      end_date: formData.is_current ? null : formData.end_date,
      display_order: parseInt(formData.display_order) || 0,
      description_bullets: formData.description_bullets.filter(b => b.trim()),
    };
    delete payload.is_current; 

    if (editingExp) {
      const { data, error } = await supabase.from('experience').update(payload).eq('id', editingExp.id).select().single();
      if (!error && data) {
        setExperiences(experiences.map(e => e.id === data.id ? data : e).sort((a, b) => a.display_order - b.display_order));
        showToast('Experience updated successfully');
        closeModal();
      } else showToast('Failed to save', 'error');
    } else {
      const { data, error } = await supabase.from('experience').insert([payload]).select().single();
      if (!error && data) {
        setExperiences([...experiences, data].sort((a, b) => a.display_order - b.display_order));
        showToast('Experience added successfully');
        closeModal();
      } else showToast('Failed to create', 'error');
    }
    setSaving(false);
  };

  const handleArrayChange = (index, value) => {
    const newArray = [...formData.description_bullets];
    newArray[index] = value;
    setFormData({ ...formData, description_bullets: newArray });
  };
  const addArrayItem = () => setFormData({ ...formData, description_bullets: [...formData.description_bullets, ''] });
  const removeArrayItem = (index) => setFormData({ ...formData, description_bullets: formData.description_bullets.filter((_, i) => i !== index) });

  if (loading) return <PanelCard title="Experience Timeline"><div style={styles.emptyState}><Loader2 className="spin" size={24} color="var(--text-muted)" /></div></PanelCard>;

  const modalOverlay = { position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' };
  const modalBox = { background: 'var(--pcms-panel)', border: '1px solid var(--pcms-line)', borderRadius: '14px', width: '100%', maxWidth: '640px', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column' };
  const labelStyle = { fontSize: 10.5, fontWeight: 700, color: 'var(--pcms-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 5 };
  const inputStyle = { ...styles.input, background: 'var(--pcms-panel)' };

  return (
    <>
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, background: toast.type === 'error' ? '#ef4444' : '#10b981', color: '#fff', padding: '12px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
          {toast.msg}
        </div>
      )}

      <PanelCard title="Experience Timeline" action={{ label: "Add Experience", icon: "ti-plus", onClick: () => openModal() }}>
        {experiences.length === 0 ? (
          <EmptyState icon="ti-id-badge" title="No experience entries" description="Click '+ Add Experience' to log your work history." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={{ ...styles.th, width: '60px' }}>Logo</th>
                  <th style={styles.th}>Role & Company</th>
                  <th style={styles.th}>Dates</th>
                  <th style={styles.th}>Order</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {experiences.map((exp, i) => (
                  <tr key={exp.id} style={{ background: i % 2 === 0 ? 'transparent' : 'var(--pcms-panel-2)' }}>
                    <td style={styles.td}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--pcms-panel-2)', border: '1px solid var(--pcms-line)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {exp.logo_url ? <img src={exp.logo_url} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e) => { e.target.style.display='none'; e.target.parentElement.innerHTML = '<i class="ti ti-briefcase" style="color:var(--pcms-muted); font-size: 18px;"></i>'; }} /> : <Briefcase size={18} color="var(--pcms-muted)" />}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--pcms-text)' }}>{exp.role}</div>
                      <div style={{ fontSize: 12, color: 'var(--pcms-muted)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                        {exp.company}
                        {exp.is_education && <span style={{ padding: '2px 6px', borderRadius: 4, background: 'var(--pcms-accent-dim)', color: 'var(--pcms-accent)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>Edu</span>}
                      </div>
                    </td>
                    <td style={{ ...styles.td, color: 'var(--pcms-muted)', fontSize: 12 }}>
                      <div>{exp.start_date} <span style={{ color: 'var(--pcms-muted)' }}>→</span> {exp.end_date ? exp.end_date : <span style={{ color: '#10B981', fontWeight: 600 }}>Present</span>}</div>
                      {calculateTenure(exp.start_date, exp.end_date, !exp.end_date) && (
                        <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--pcms-accent)', background: 'var(--pcms-accent-dim)', padding: '1px 6px', borderRadius: 4, display: 'inline-block', marginTop: 3 }}>
                          ⏱️ {calculateTenure(exp.start_date, exp.end_date, !exp.end_date)}
                        </span>
                      )}
                    </td>
                    <td style={{ ...styles.td, color: 'var(--pcms-muted)' }}>{exp.display_order}</td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                        <button onClick={() => openModal(exp)} className="pcms-icon-btn edit" title="Edit"><Edit3 size={14} /></button>
                        <button onClick={() => handleDelete(exp.id, exp.role)} className="pcms-icon-btn danger" title="Delete"><Trash2 size={14} /></button>
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
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Briefcase size={15} color="#10B981" /></div>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--pcms-text)', fontFamily: "'Space Grotesk', sans-serif" }}>{editingExp ? 'Edit Experience' : 'New Experience'}</p>
                  <p style={{ fontSize: 11, color: 'var(--pcms-muted)', margin: '2px 0 0' }}>Log a new role or position</p>
                </div>
              </div>
              <button onClick={closeModal} className="pcms-icon-btn"><X size={18} /></button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Role / Title <span style={{ color: '#ef4444' }}>*</span></label>
                  <input style={inputStyle} value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} placeholder="e.g. Senior Developer" autoFocus />
                </div>
                <div>
                  <label style={labelStyle}>Company <span style={{ color: '#ef4444' }}>*</span></label>
                  <input style={inputStyle} value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} placeholder="e.g. Acme Corp" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignItems: 'start' }}>
                <div>
                  <label style={labelStyle}>Start Date <span style={{ color: '#ef4444' }}>*</span></label>
                  <input style={inputStyle} value={formData.start_date} onChange={e => setFormData({ ...formData, start_date: e.target.value })} placeholder="e.g. Jan 2022" />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>End Date</label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                      <input type="checkbox" checked={formData.is_current} onChange={e => setFormData({ ...formData, is_current: e.target.checked })} style={{ margin: 0 }} />
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>Present</span>
                    </label>
                  </div>
                  <input style={{ ...inputStyle, opacity: formData.is_current ? 0.5 : 1 }} value={formData.is_current ? 'Present' : formData.end_date} onChange={e => setFormData({ ...formData, end_date: e.target.value })} disabled={formData.is_current} placeholder="e.g. Dec 2023" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Logo URL</label>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: '#fff', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                      {formData.logo_url ? <img src={formData.logo_url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e) => { e.target.style.display='none'; }} /> : <ImageIcon size={18} color="#9ca3af" />}
                    </div>
                    <input style={{ ...inputStyle, flex: 1 }} value={formData.logo_url} onChange={e => setFormData({ ...formData, logo_url: e.target.value })} placeholder="https://..." />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Display Order</label>
                    <input type="number" style={inputStyle} value={formData.display_order} onChange={e => setFormData({ ...formData, display_order: e.target.value })} />
                  </div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>Description Bullets</label>
                  <button onClick={addArrayItem} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#10b981', background: 'rgba(16,185,129,0.1)', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontWeight: 600 }}><Plus size={12} /> Add bullet</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {formData.description_bullets.map((bullet, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 18, color: 'var(--text-muted)', lineHeight: '42px', paddingLeft: 4 }}>•</span>
                      <textarea
                        style={{ ...inputStyle, flex: 1, minHeight: 42, resize: 'vertical', paddingTop: 10 }}
                        value={bullet}
                        onChange={e => handleArrayChange(idx, e.target.value)}
                        placeholder="Led development of..."
                      />
                      {formData.description_bullets.length > 1 && (
                        <button onClick={() => removeArrayItem(idx)} style={{ ...styles.iconBtn, padding: 6, borderRadius: 6, background: 'rgba(239,68,68,0.08)', marginTop: 4, flexShrink: 0 }}>
                          <X size={14} color="#ef4444" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
            
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0 }}>
              <button onClick={closeModal} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSubmit} disabled={saving} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#10b981', color: '#fff', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 7 }}>
                {saving && <Loader2 size={14} className="spin" />} {editingExp ? 'Save Changes' : 'Add Experience'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


