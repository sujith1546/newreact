import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Loader2, Edit3, Trash2, Zap, X, Plus, Eye, EyeOff } from 'lucide-react';
import { styles } from '../shared/constants';
import { PanelCard, EmptyState } from '../shared/components';

const LOCAL_UPDATES_KEY = 'pcms_local_updates';

const getLocalUpdates = () => {
  try {
    const raw = localStorage.getItem(LOCAL_UPDATES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const setLocalUpdates = (list) => {
  try {
    localStorage.setItem(LOCAL_UPDATES_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.error(e);
  }
};

export default function UpdatesPanel() {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);

  const EMPTY_FORM = {
    version: 'v2.4.0',
    title: '',
    category: 'feature',
    impact: 'Minor',
    published: true,
    description: '',
    date: new Date().toISOString().split('T')[0],
    items: ['']
  };

  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => { fetchUpdates(); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUpdates = async () => {
    setLoading(true);
    const localItems = getLocalUpdates();
    let remoteList = [];
    try {
      const { data, error } = await supabase.from('updates').select('*').order('created_at', { ascending: false });
      if (!error && data) remoteList = data;
    } catch {}

    const combined = [...localItems];
    remoteList.forEach(r => {
      if (!combined.some(c => String(c.id) === String(r.id))) {
        combined.push(r);
      }
    });

    setUpdates(combined);
    setLoading(false);
  };

  const deleteUpdate = async (id, title) => {
    if (!window.confirm(`Delete "${title || 'Release'}"? This cannot be undone.`)) return;

    try {
      await supabase.from('updates').delete().eq('id', id);
    } catch {}

    const nextList = updates.filter(u => String(u.id) !== String(id));
    setUpdates(nextList);
    setLocalUpdates(nextList);
    showToast(`Deleted successfully`, 'error');
  };

  const togglePublished = async (update) => {
    const nextVal = !update.published;
    const nextList = updates.map(u => String(u.id) === String(update.id) ? { ...u, published: nextVal } : u);
    setUpdates(nextList);
    setLocalUpdates(nextList);

    try {
      await supabase.from('updates').update({ published: nextVal }).eq('id', update.id);
    } catch {}

    showToast(nextVal ? 'Release published live' : 'Release saved to draft mode');
  };

  const openModal = (update = null) => {
    if (update) {
      setEditingUpdate(update);
      setFormData({
        version: update.version || 'v1.0.0',
        title: update.title || update.label || '',
        category: update.category || 'feature',
        impact: update.impact || 'Minor',
        published: update.published !== undefined ? update.published : true,
        description: update.description || '',
        date: update.date || new Date().toISOString().split('T')[0],
        items: Array.isArray(update.items) && update.items.length > 0 ? update.items : [''],
      });
    } else {
      setEditingUpdate(null);
      setFormData(EMPTY_FORM);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingUpdate(null); };

  const addItem = () => setFormData(p => ({ ...p, items: [...p.items, ''] }));
  const removeItem = (i) => setFormData(p => ({ ...p, items: p.items.filter((_, idx) => idx !== i) }));
  const updateItem = (i, val) => setFormData(p => ({ ...p, items: p.items.map((it, idx) => idx === i ? val : it) }));

  const saveUpdate = async () => {
    if (!formData.title.trim()) { showToast('Release title is required', 'error'); return; }
    setSaving(true);

    const payload = {
      id: editingUpdate ? editingUpdate.id : 'up_' + Date.now(),
      version: formData.version || 'v1.0.0',
      label: formData.title.trim(),
      title: formData.title.trim(),
      category: formData.category || 'feature',
      impact: formData.impact || 'Minor',
      published: formData.published,
      description: formData.description || '',
      date: formData.date || new Date().toISOString().split('T')[0],
      items: formData.items.filter(i => i.trim()),
      created_at: editingUpdate?.created_at || new Date().toISOString()
    };

    // Try Supabase sync
    try {
      if (editingUpdate) {
        const { data, error } = await supabase.from('updates').update(payload).eq('id', editingUpdate.id).select().single();
        if (!error && data) payload.id = data.id;
      } else {
        const { data, error } = await supabase.from('updates').insert([{
          version: payload.version,
          label: payload.label,
          title: payload.title,
          category: payload.category,
          impact: payload.impact,
          published: payload.published,
          description: payload.description,
          date: payload.date,
          items: payload.items
        }]).select().single();
        if (!error && data) payload.id = data.id;
      }
    } catch {}

    let nextList;
    if (editingUpdate) {
      nextList = updates.map(u => String(u.id) === String(editingUpdate.id) ? payload : u);
    } else {
      nextList = [payload, ...updates];
    }

    setUpdates(nextList);
    setLocalUpdates(nextList);
    showToast(editingUpdate ? 'Release updated successfully' : 'Release published successfully');
    closeModal();
    setSaving(false);
  };

  const versionColor = (ver) => {
    if (!ver) return { bg: 'rgba(107,114,128,0.12)', color: '#9ca3af' };
    const v = ver.toLowerCase();
    if (v.startsWith('v3') || v.includes('major')) return { bg: 'rgba(139,92,246,0.12)', color: '#a78bfa' };
    if (v.startsWith('v2')) return { bg: 'rgba(59,130,246,0.12)', color: '#60a5fa' };
    if (v.startsWith('v1')) return { bg: 'rgba(16,185,129,0.12)', color: '#34d399' };
    return { bg: 'rgba(249,115,22,0.12)', color: '#fb923c' };
  };

  const filteredUpdates = updates.filter(u => {
    const q = searchQuery.toLowerCase();
    return !q || u.version?.toLowerCase().includes(q) || u.title?.toLowerCase().includes(q) || u.label?.toLowerCase().includes(q) || u.items?.some(i => i.toLowerCase().includes(q));
  });

  const totalReactionsCount = updates.reduce((sum, u) => {
    const rx = u.reactions || {};
    return sum + (rx.rocket || 0) + (rx.party || 0) + (rx.heart || 0) + (rx.thumbs || 0);
  }, 0);

  if (loading) return <PanelCard title="Changelog"><div style={styles.emptyState}><Loader2 className="spin" size={24} color="var(--pcms-accent)" /></div></PanelCard>;

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid var(--pcms-line)',
    background: 'var(--pcms-panel)',
    color: 'var(--pcms-text)',
    fontSize: 12.5,
    fontFamily: 'Inter, sans-serif',
    outline: 'none',
    boxSizing: 'border-box'
  };

  const modalOverlay = { position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' };
  const modalBox = { background: 'var(--pcms-panel)', border: '1px solid var(--pcms-line)', borderRadius: '14px', width: '100%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column' };
  const labelStyle = { fontSize: 10.5, fontWeight: 700, color: 'var(--pcms-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 5 };

  return (
    <>
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, background: toast.type === 'error' ? '#ef4444' : '#10b981', color: '#fff', padding: '12px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
          {toast.msg}
        </div>
      )}

      <PanelCard title="Release Changelog" action={{ label: 'New Release', icon: 'ti-plus', onClick: () => openModal() }}>
        {/* Stats bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '1px solid var(--pcms-line)' }}>
          {[
            { label: 'Total Releases', val: updates.length, color: '#6366F1' },
            { label: 'Published', val: updates.filter(u => u.published !== false).length, color: '#10B981' },
            { label: 'Total Changes', val: updates.reduce((a, u) => a + (u.items?.length || 0), 0), color: '#3B82F6' },
            { label: 'User Reactions', val: totalReactionsCount, color: '#EC4899' },
          ].map(s => (
            <div key={s.label} style={{ padding: '14px 18px', borderRight: '1px solid var(--pcms-line)' }}>
              <p style={{ margin: 0, fontSize: 10, color: 'var(--pcms-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
              <p style={{ margin: '3px 0 0', fontSize: 19, fontWeight: 800, color: s.color }}>{s.val}</p>
            </div>
          ))}
        </div>

        {/* Search toolbar */}
        <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--pcms-line)', background: 'var(--pcms-panel-2)', display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            type="text"
            style={inputStyle}
            placeholder="Search by version, title, or change bullet..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <span style={{ fontSize: 11.5, color: 'var(--pcms-muted)', whiteSpace: 'nowrap' }}>{filteredUpdates.length} / {updates.length} entries</span>
        </div>

        {/* Table */}
        {updates.length === 0 ? (
          <EmptyState icon="ti-bolt" title="No changelog entries yet" description="Click '+ New Release' to log a version release." />
        ) : filteredUpdates.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--pcms-muted)' }}>No releases match your search query.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={{ ...styles.th, width: '12%' }}>Version</th>
                  <th style={{ ...styles.th, width: '12%' }}>Impact</th>
                  <th style={{ ...styles.th, width: '32%' }}>Title</th>
                  <th style={{ ...styles.th, width: '12%' }}>Status</th>
                  <th style={{ ...styles.th, width: '14%' }}>Date</th>
                  <th style={{ ...styles.th, width: '18%', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUpdates.map((update, i) => {
                  const vc = versionColor(update.version);
                  const isExpanded = expandedId === update.id;
                  const isPublished = update.published !== false;

                  return (
                    <React.Fragment key={update.id}>
                      <tr
                        style={{ cursor: 'pointer', transition: 'background 0.15s' }}
                        onClick={() => setExpandedId(isExpanded ? null : update.id)}
                      >
                        <td style={styles.td}>
                          <span style={{ padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: vc.bg, color: vc.color }}>
                            {update.version || 'v1.0'}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span className="pcms-badge pcms-badge-blue">
                            {update.impact || 'Minor'}
                          </span>
                        </td>
                        <td style={{ ...styles.td, fontWeight: 600, fontSize: 13 }}>
                          {update.title || update.label}
                        </td>
                        <td style={styles.td}>
                          <span className={`pcms-badge ${isPublished ? 'pcms-badge-green' : 'pcms-badge-muted'}`}>
                            {isPublished ? 'Live' : 'Draft'}
                          </span>
                        </td>
                        <td style={{ ...styles.td, color: 'var(--pcms-muted)', fontSize: 11.5 }}>
                          {update.created_at ? new Date(update.created_at).toLocaleDateString() : update.date}
                        </td>
                        <td style={{ ...styles.td, textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }} onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => togglePublished(update)}
                              title={isPublished ? 'Unpublish' : 'Publish Live'}
                              className="pcms-icon-btn"
                            >
                              {isPublished ? <EyeOff size={14} color="var(--pcms-amber)" /> : <Eye size={14} color="var(--pcms-green)" />}
                            </button>
                            <button onClick={() => openModal(update)} title="Edit" className="pcms-icon-btn edit">
                              <Edit3 size={14} />
                            </button>
                            <button onClick={() => deleteUpdate(update.id, update.title || update.label)} title="Delete" className="pcms-icon-btn danger">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr style={{ background: 'var(--pcms-panel-2)' }}>
                          <td colSpan={6} style={{ padding: '14px 20px', borderBottom: '1px solid var(--pcms-line)' }}>
                            {update.description && (
                              <p style={{ margin: '0 0 8px', fontSize: 12.5, color: 'var(--pcms-text)', lineHeight: 1.5 }}>{update.description}</p>
                            )}
                            {Array.isArray(update.items) && update.items.filter(Boolean).length > 0 && (
                              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: 'var(--pcms-muted)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {update.items.filter(Boolean).map((item, idx) => (
                                  <li key={idx}>{item}</li>
                                ))}
                              </ul>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </PanelCard>

      {/* Modal */}
      {isModalOpen && (
        <div style={modalOverlay} onClick={closeModal}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', borderBottom: '1px solid var(--pcms-line)', background: 'var(--pcms-panel-2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--pcms-accent-dim)', color: 'var(--pcms-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Zap size={16} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--pcms-text)', fontFamily: "'Space Grotesk', sans-serif" }}>{editingUpdate ? 'Edit Release Log' : 'Create New Release'}</p>
                  <p style={{ fontSize: 11, color: 'var(--pcms-muted)', margin: '2px 0 0' }}>Configure SemVer version, impact badge, and change items</p>
                </div>
              </div>
              <button onClick={closeModal} className="pcms-icon-btn"><X size={16} /></button>
            </div>

            {/* Body */}
            <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Version + Impact row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Version Tag</label>
                  <input style={inputStyle} value={formData.version} onChange={e => setFormData(p => ({ ...p, version: e.target.value }))} placeholder="e.g. v2.4.0" />
                  <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                    <button
                      type="button"
                      onClick={() => {
                        const parts = (formData.version || 'v2.4.0').replace('v', '').split('.').map(Number);
                        const next = `v${parts[0] || 1}.${parts[1] || 0}.${(parts[2] || 0) + 1}`;
                        setFormData(p => ({ ...p, version: next, impact: 'Patch', category: 'fix' }));
                      }}
                      style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, border: '1px solid var(--pcms-line)', background: 'transparent', color: 'var(--pcms-muted)', cursor: 'pointer' }}
                    >
                      +Patch
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const parts = (formData.version || 'v2.4.0').replace('v', '').split('.').map(Number);
                        const next = `v${parts[0] || 1}.${(parts[1] || 0) + 1}.0`;
                        setFormData(p => ({ ...p, version: next, impact: 'Minor', category: 'feature' }));
                      }}
                      style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, border: '1px solid var(--pcms-line)', background: 'transparent', color: 'var(--pcms-muted)', cursor: 'pointer' }}
                    >
                      +Minor
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const parts = (formData.version || 'v2.4.0').replace('v', '').split('.').map(Number);
                        const next = `v${(parts[0] || 1) + 1}.0.0`;
                        setFormData(p => ({ ...p, version: next, impact: 'Major', category: 'feature' }));
                      }}
                      style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, border: '1px solid var(--pcms-line)', background: 'transparent', color: 'var(--pcms-muted)', cursor: 'pointer' }}
                    >
                      +Major
                    </button>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Impact Rating</label>
                  <select
                    style={inputStyle}
                    value={formData.impact || 'Minor'}
                    onChange={e => setFormData(p => ({ ...p, impact: e.target.value }))}
                  >
                    {['Major', 'Minor', 'Patch', 'Security'].map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Category</label>
                  <select
                    style={inputStyle}
                    value={formData.category || 'feature'}
                    onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}
                  >
                    {['feature', 'fix', 'improvement'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label style={labelStyle}>Release Title <span style={{ color: 'var(--pcms-red)' }}>*</span></label>
                <input style={inputStyle} value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} placeholder="e.g. AI Portfolio Advisor & Dark SaaS Admin" />
              </div>

              {/* Description */}
              <div>
                <label style={labelStyle}>Short Overview Description</label>
                <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={2} value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="Brief summary of what this release brings..." />
              </div>

              {/* Change Items */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>Itemized Change Bullets</label>
                  <button onClick={addItem} type="button" className="pcms-btn-secondary" style={{ padding: '3px 9px', fontSize: 11 }}>
                    <Plus size={12} /> Add bullet
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {formData.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input
                        style={{ ...inputStyle, flex: 1 }}
                        value={item}
                        onChange={e => updateItem(idx, e.target.value)}
                        placeholder={`[Feature] Added new...`}
                      />
                      {formData.items.length > 1 && (
                        <button onClick={() => removeItem(idx)} type="button" className="pcms-icon-btn danger">
                          <X size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, background: 'var(--pcms-panel-2)', borderRadius: 8, border: '1px solid var(--pcms-line)' }}>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--pcms-text)' }}>Publish Immediately</span>
                  <p style={{ margin: 0, fontSize: 11, color: 'var(--pcms-muted)' }}>If disabled, release will be saved as a private Draft.</p>
                </div>
                <input
                  type="checkbox"
                  className="pcms-chk"
                  checked={formData.published}
                  onChange={e => setFormData(p => ({ ...p, published: e.target.checked }))}
                />
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '14px 22px', borderTop: '1px solid var(--pcms-line)', display: 'flex', justifyContent: 'flex-end', gap: 8, background: 'var(--pcms-panel-2)' }}>
              <button onClick={closeModal} className="pcms-btn-secondary">Cancel</button>
              <button onClick={saveUpdate} disabled={saving} className="pcms-btn-dark">
                {saving && <Loader2 size={13} className="spin" />}
                {editingUpdate ? 'Save Changes' : 'Publish Release'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
