import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Loader2, ChevronRight, ChevronDown, Star, Edit3, Trash2, Briefcase, Layers, X, Plus } from 'lucide-react';
import { styles, MODAL_STYLES, SKILL_CATEGORIES, SKILL_LEVELS } from '../shared/constants';
import { PanelCard, EmptyState, StatCard } from '../shared/components';

export default function SkillsPanel() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedCats, setCollapsedCats] = useState({});
  const [toast, setToast] = useState(null);

  const EMPTY_FORM = {
    name: '', category: 'languages', icon_class: '', proficiency_level: 80,
    years_experience: 0, project_count: 0, description: '', level_label: 'Intermediate',
    related_tools: [''], projects: [''], is_featured: false, order_index: 0
  };
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => { fetchSkills(); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchSkills = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('skills').select('*').order('order_index', { ascending: true });
    if (!error && data) setSkills(data);
    setLoading(false);
  };

  const openModal = (skill = null) => {
    if (skill) {
      setEditingSkill(skill);
      setFormData({
        ...skill,
        related_tools: Array.isArray(skill.related_tools) && skill.related_tools.length > 0 ? skill.related_tools : [''],
        projects: Array.isArray(skill.projects) && skill.projects.length > 0 ? skill.projects : [''],
      });
    } else {
      setEditingSkill(null);
      setFormData(EMPTY_FORM);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingSkill(null); };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const { error } = await supabase.from('skills').delete().eq('id', id);
    if (!error) {
      setSkills(skills.filter(s => s.id !== id));
      showToast(`"${name}" deleted`, 'error');
    } else showToast('Failed to delete', 'error');
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) { showToast('Name is required', 'error'); return; }
    if (!formData.category) { showToast('Category is required', 'error'); return; }
    
    setSaving(true);
    let clampedProficiency = Math.max(1, Math.min(100, parseInt(formData.proficiency_level) || 80));
    const payload = {
      ...formData,
      proficiency_level: clampedProficiency,
      years_experience: parseInt(formData.years_experience) || 0,
      project_count: parseInt(formData.project_count) || 0,
      order_index: parseInt(formData.order_index) || 0,
      related_tools: formData.related_tools.filter(t => t && t.trim()),
      projects: formData.projects.filter(p => p && p.trim()),
    };

    if (editingSkill) {
      const { data, error } = await supabase.from('skills').update(payload).eq('id', editingSkill.id).select().single();
      if (!error && data) {
        setSkills(skills.map(s => s.id === data.id ? data : s).sort((a, b) => a.order_index - b.order_index));
        showToast(`"${data.name}" updated successfully`);
        closeModal();
      } else showToast('Failed to save', 'error');
    } else {
      const { data, error } = await supabase.from('skills').insert([payload]).select().single();
      if (!error && data) {
        setSkills([...skills, data].sort((a, b) => a.order_index - b.order_index));
        showToast(`"${data.name}" added successfully`);
        closeModal();
      } else showToast('Failed to create', 'error');
    }
    setSaving(false);
  };

  const toggleCategory = (cat) => setCollapsedCats(prev => ({ ...prev, [cat]: prev[cat] === false ? true : false }));

  const barColor = (pct) => {
    if (pct >= 85) return '#10b981';
    if (pct >= 65) return '#3b82f6';
    if (pct >= 45) return '#f59e0b';
    return '#ef4444';
  };

  const allCategories = Array.from(new Set([
    ...SKILL_CATEGORIES,
    ...skills.map(s => s.category).filter(Boolean)
  ]));

  const filteredSkills = skills.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const groupedSkills = allCategories.reduce((acc, cat) => {
    acc[cat] = filteredSkills.filter(s => s.category === cat);
    return acc;
  }, {});

  if (loading) return <PanelCard title="Skills Inventory"><div style={styles.emptyState}><Loader2 className="spin" size={24} color="var(--text-muted)" /></div></PanelCard>;

  const modalOverlay = { position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' };
  const modalBox = { background: 'var(--pcms-panel)', border: '1px solid var(--pcms-line)', borderRadius: '14px', width: '100%', maxWidth: '640px', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column' };
  const labelStyle = { fontSize: 10.5, fontWeight: 700, color: 'var(--pcms-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 5 };
  const inputStyle = { ...styles.input, background: 'var(--pcms-panel)' };

  const handleArrayChange = (field, index, value) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };
  const addArrayItem = (field) => setFormData({ ...formData, [field]: [...formData[field], ''] });
  const removeArrayItem = (field, index) => setFormData({ ...formData, [field]: formData[field].filter((_, i) => i !== index) });

  return (
    <>
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, background: toast.type === 'error' ? '#ef4444' : '#10b981', color: '#fff', padding: '12px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
          {toast.msg}
        </div>
      )}

      <PanelCard 
        title="Skills Inventory" 
        action={{ label: 'Add Skill', icon: 'ti-plus', onClick: () => openModal() }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderBottom: '1px solid var(--pcms-line)' }}>
          {[
            { label: 'Total Skills', val: skills.length, color: '#6366F1' },
            { label: 'Featured Skills', val: skills.filter(s => s.is_featured).length, color: '#F59E0B' },
            { label: 'Avg Proficiency', val: Math.round(skills.reduce((a, b) => a + (b.proficiency_level || 0), 0) / (skills.length || 1)) + '%', color: '#10B981' },
          ].map(s => (
            <div key={s.label} style={{ padding: '14px 18px', borderRight: '1px solid var(--pcms-line)' }}>
              <p style={{ margin: 0, fontSize: 10, color: 'var(--pcms-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
              <p style={{ margin: '3px 0 0', fontSize: 19, fontWeight: 800, color: s.color }}>{s.val}</p>
            </div>
          ))}
        </div>

        <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--pcms-line)', background: 'var(--pcms-panel-2)', display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            type="text"
            className="pcms-search"
            placeholder="Search skills by name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ flex: 1 }}
          />
          <span style={{ fontSize: 11.5, color: 'var(--pcms-muted)', whiteSpace: 'nowrap' }}>{filteredSkills.length} matches</span>
        </div>

        {skills.length === 0 ? (
          <EmptyState icon="ti-star" title="No skills yet" description="Click '+ Add Skill' to build your inventory." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28, padding: '20px 22px' }}>
            {allCategories.map(cat => {
              const catSkills = groupedSkills[cat] || [];
              if (catSkills.length === 0) return null;
              const isCollapsed = collapsedCats[cat] !== false;
              const displayCatName = cat.replace(/_/g, ' ');

              return (
                <div key={cat}>
                  <div onClick={() => toggleCategory(cat)} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none', marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid var(--pcms-line)' }}>
                    {isCollapsed ? <ChevronRight size={15} color="var(--pcms-muted)" /> : <ChevronDown size={15} color="var(--pcms-accent)" />}
                    <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--pcms-text)', textTransform: 'capitalize', letterSpacing: '0.2px' }}>{displayCatName}</h3>
                    <span style={{ padding: '2px 8px', borderRadius: 12, background: 'var(--pcms-panel-2)', border: '1px solid var(--pcms-line)', color: 'var(--pcms-muted)', fontSize: 10, fontWeight: 700 }}>{catSkills.length}</span>
                  </div>

                  {!isCollapsed && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
                      {catSkills.map(skill => {
                        const pct = skill.proficiency_level || 0;
                        const color = barColor(pct);
                        return (
                          <div key={skill.id} style={{ background: 'var(--pcms-panel-2)', border: '1px solid var(--pcms-line)', borderRadius: 10, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12, position: 'relative', transition: 'all 0.2s' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  {skill.icon_class ? <i className={`ti ti-${skill.icon_class}`} style={{ fontSize: 19, color }} /> : <Star size={17} color={color} />}
                                </div>
                                <div>
                                  <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: 'var(--pcms-text)', lineHeight: 1.2 }}>
                                    {skill.name} {skill.is_featured && <Star size={12} color="#F59E0B" style={{ fill: '#F59E0B', marginLeft: 4, verticalAlign: 'text-top' }} />}
                                  </p>
                                  <span style={{ display: 'inline-block', marginTop: 3, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', padding: '2px 7px', borderRadius: 99, background: `${color}18`, color }}>
                                    {skill.level_label || 'Intermediate'}
                                  </span>
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                                <button onClick={() => openModal(skill)} title="Edit" className="pcms-icon-btn edit"><Edit3 size={13} /></button>
                                <button onClick={() => handleDelete(skill.id, skill.name)} title="Delete" className="pcms-icon-btn danger"><Trash2 size={13} /></button>
                              </div>
                            </div>
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 11, fontWeight: 600 }}><span style={{ color: 'var(--pcms-muted)' }}>Proficiency</span><span style={{ color }}>{pct}%</span></div>
                              <div style={{ width: '100%', height: 5, background: 'var(--pcms-line)', borderRadius: 99, overflow: 'hidden' }}><div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99 }} /></div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingTop: 10, borderTop: '1px solid var(--pcms-line)' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--pcms-muted)' }}><Briefcase size={11} /> {skill.years_experience || 0} yrs</span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--pcms-muted)' }}><Layers size={11} /> {skill.project_count || 0} projs</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </PanelCard>

      {isModalOpen && (
        <div style={modalOverlay} onClick={closeModal}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--pcms-line)', background: 'var(--pcms-panel-2)', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--pcms-accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Star size={15} color="var(--pcms-accent)" /></div>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--pcms-text)', fontFamily: "'Space Grotesk', sans-serif" }}>{editingSkill ? 'Edit Skill' : 'New Skill'}</p>
                  <p style={{ fontSize: 11, color: 'var(--pcms-muted)', margin: '2px 0 0' }}>{editingSkill ? `Editing: ${editingSkill.name}` : 'Add to your inventory'}</p>
                </div>
              </div>
              <button onClick={closeModal} className="pcms-icon-btn"><X size={18} /></button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Skill Name <span style={{ color: '#ef4444' }}>*</span></label>
                  <input style={inputStyle} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. React" autoFocus />
                </div>
                <div>
                  <label style={labelStyle}>Category <span style={{ color: '#ef4444' }}>*</span></label>
                  <select style={inputStyle} value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                    {allCategories.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Level Label</label>
                  <select style={inputStyle} value={formData.level_label} onChange={e => setFormData({ ...formData, level_label: e.target.value })}>
                    {SKILL_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={labelStyle}>Proficiency (1-100)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={formData.proficiency_level}
                      onChange={e => {
                        const val = Number(e.target.value);
                        const autoLabel = val >= 90 ? 'Expert' : val >= 75 ? 'Advanced' : val >= 50 ? 'Intermediate' : 'Beginner';
                        setFormData({ ...formData, proficiency_level: val, level_label: autoLabel });
                      }}
                      style={{ flex: 1 }}
                    />
                    <span style={{ fontSize: 13, fontWeight: 700, color: barColor(formData.proficiency_level), width: 40, textAlign: 'right' }}>{formData.proficiency_level}%</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Years Exp</label>
                  <input type="number" min="0" style={inputStyle} value={formData.years_experience} onChange={e => setFormData({ ...formData, years_experience: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Projects</label>
                  <input type="number" min="0" style={inputStyle} value={formData.project_count} onChange={e => setFormData({ ...formData, project_count: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Order</label>
                  <input type="number" style={inputStyle} value={formData.order_index} onChange={e => setFormData({ ...formData, order_index: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 14, alignItems: 'end' }}>
                <div>
                  <label style={labelStyle}>Icon Class (Tabler)</label>
                  <input style={inputStyle} value={formData.icon_class} onChange={e => setFormData({ ...formData, icon_class: e.target.value })} placeholder="e.g. brand-react" />
                </div>
                <div style={{ width: 42, height: 42, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {formData.icon_class ? <i className={`ti ti-${formData.icon_class}`} style={{ fontSize: 24, color: 'var(--text-primary)' }} /> : <Star size={20} color="var(--text-muted)" />}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Description</label>
                <textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Brief description..." />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                <input type="checkbox" id="is_featured" checked={formData.is_featured} onChange={e => setFormData({ ...formData, is_featured: e.target.checked })} style={{ width: 16, height: 16 }} />
                <label htmlFor="is_featured" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer', margin: 0 }}>Mark as Featured Skill</label>
                <Star size={14} color={formData.is_featured ? "#f59e0b" : "var(--text-muted)"} style={{ fill: formData.is_featured ? "#f59e0b" : "transparent" }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {/* Related Tools */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>Related Tools</label>
                    <button onClick={() => addArrayItem('related_tools')} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}><Plus size={12}/> Add</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {formData.related_tools.map((tool, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: 6 }}>
                        <input style={{ ...inputStyle, flex: 1, padding: '6px 10px', fontSize: 13 }} value={tool} onChange={e => handleArrayChange('related_tools', idx, e.target.value)} placeholder="e.g. Next.js" />
                        {formData.related_tools.length > 1 && <button onClick={() => removeArrayItem('related_tools', idx)} style={{ ...styles.iconBtn, padding: 4, background: 'rgba(239,68,68,0.1)' }}><X size={12} color="#ef4444" /></button>}
                      </div>
                    ))}
                  </div>
                </div>
                {/* Projects */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>Featured Projects</label>
                    <button onClick={() => addArrayItem('projects')} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}><Plus size={12}/> Add</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {formData.projects.map((proj, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: 6 }}>
                        <input style={{ ...inputStyle, flex: 1, padding: '6px 10px', fontSize: 13 }} value={proj} onChange={e => handleArrayChange('projects', idx, e.target.value)} placeholder="e.g. E-commerce App" />
                        {formData.projects.length > 1 && <button onClick={() => removeArrayItem('projects', idx)} style={{ ...styles.iconBtn, padding: 4, background: 'rgba(239,68,68,0.1)' }}><X size={12} color="#ef4444" /></button>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
            
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0 }}>
              <button onClick={closeModal} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSubmit} disabled={saving} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#3b82f6', color: '#fff', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 7 }}>
                {saving && <Loader2 size={14} className="spin" />} {editingSkill ? 'Save Changes' : 'Add Skill'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
