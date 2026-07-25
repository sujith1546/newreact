import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Loader2, Edit3, Trash2, Zap, X, Plus } from 'lucide-react';
import { styles, MODAL_STYLES } from '../shared/constants';
import { PanelCard, EmptyState, StatCard } from '../shared/components';

export default function UpdatesPanel() {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);
  const EMPTY_FORM = { version: '', label: '', date: new Date().toISOString().split('T')[0], items: [''] };
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => { fetchUpdates(); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUpdates = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('updates').select('*').order('created_at', { ascending: false });
    if (!error && data) setUpdates(data);
    setLoading(false);
  };

  const deleteUpdate = async (id, label) => {
    if (!window.confirm(`Delete "${label}"? This cannot be undone.`)) return;
    const { error } = await supabase.from('updates').delete().eq('id', id);
    if (!error) {
      setUpdates(prev => prev.filter(u => u.id !== id));
      showToast(`"${label}" deleted`, 'error');
    } else showToast('Failed to delete', 'error');
  };

  const openModal = (update = null) => {
    if (update) {
      setEditingUpdate(update);
      setFormData({
        version: update.version || '',
        label: update.label || '',
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
    if (!formData.version.trim()) { showToast('Version is required', 'error'); return; }
    if (!formData.label.trim()) { showToast('Label is required', 'error'); return; }
    setSaving(true);
    const payload = {
      ...formData,
      items: formData.items.filter(i => i.trim()),
    };
    if (editingUpdate) {
      const { data, error } = await supabase.from('updates').update(payload).eq('id', editingUpdate.id).select().single();
      if (!error && data) {
        setUpdates(prev => prev.map(u => u.id === data.id ? data : u));
        showToast(`"${data.label}" updated successfully`);
        closeModal();
      } else showToast('Failed to save', 'error');
    } else {
      const { data, error } = await supabase.from('updates').insert([payload]).select().single();
      if (!error && data) {
        setUpdates(prev => [data, ...prev]);
        showToast(`"${data.label}" created successfully`);
        closeModal();
      } else showToast('Failed to create', 'error');
    }
    setSaving(false);
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    const diff = Date.now() - d.getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'Just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return h === 1 ? 'An hour ago' : `${h}h ago`;
    const days = Math.floor(h / 24);
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
    return !q || u.version?.toLowerCase().includes(q) || u.label?.toLowerCase().includes(q) || u.items?.some(i => i.toLowerCase().includes(q));
  });

  if (loading) return <PanelCard title="Changelog"><div style={styles.emptyState}><Loader2 className="spin" size={24} color="var(--text-muted)" /></div></PanelCard>;

  const modalOverlay = { position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' };
  const modalBox = { background: 'var(--sidebar-bg, #1a1a2e)', border: '1px solid var(--border-color)', borderRadius: '16px', width: '100%', maxWidth: '540px', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 32px 64px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column' };
  const labelStyle = { fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 };
  const inputStyle = { ...styles.input, background: 'var(--bg-primary)' };

  return (
    <>
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, background: toast.type === 'error' ? '#ef4444' : '#10b981', color: '#fff', padding: '12px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
          {toast.msg}
        </div>
      )}

      <PanelCard title="Changelog" action={{ label: 'Add update', icon: 'ti-plus', onClick: () => openModal() }}>
        {/* Stats bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderBottom: '1px solid var(--border-color)' }}>
          {[
            { label: 'Total Releases', val: updates.length, color: '#3b82f6' },
            { label: 'Total Changes', val: updates.reduce((a, u) => a + (u.items?.length || 0), 0), color: '#10b981' },
            { label: 'Latest Version', val: updates[0]?.version || '—', color: '#8b5cf6' },
          ].map(s => (
            <div key={s.label} style={{ padding: '14px 20px', borderRight: '1px solid var(--border-color)' }}>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</p>
              <p style={{ margin: '4px 0 0', fontSize: 20, fontWeight: 800, color: s.color }}>{s.val}</p>
            </div>
          ))}
        </div>

        {/* Search toolbar */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)', display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input type="text" placeholder="Search by version, label or change item..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ ...inputStyle, paddingLeft: 32, paddingTop: 7, paddingBottom: 7, fontSize: 13 }} />
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{filteredUpdates.length} / {updates.length} entries</span>
        </div>

        {/* Table */}
        {updates.length === 0 ? (
          <EmptyState icon="ti-bolt" title="No changelog entries yet" description="Click '+ Add update' to log a new release." />
        ) : filteredUpdates.length === 0 ? (
          <div style={{ ...styles.emptyState, padding: '40px' }}><p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No entries match your search.</p></div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={{ ...styles.th, width: '12%' }}>Version</th>
                  <th style={{ ...styles.th, width: '28%' }}>Label</th>
                  <th style={{ ...styles.th, width: '18%' }}>Date</th>
                  <th style={{ ...styles.th, width: '32%' }}>Changes</th>
                  <th style={{ ...styles.th, width: '10%', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUpdates.map((update, i) => {
                  const vc = versionColor(update.version);
                  const isExpanded = expandedId === update.id;
                  return (
                    <React.Fragment key={update.id}>
                      <tr
                        style={{ cursor: 'pointer', background: i % 2 === 0 ? 'transparent' : 'rgba(128,128,128,0.025)', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.04)'}
                        onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(128,128,128,0.025)'}
                        onClick={() => setExpandedId(isExpanded ? null : update.id)}
                      >
                        <td style={styles.td}>
                          <span style={{ padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: vc.bg, color: vc.color, letterSpacing: '0.3px' }}>
                            {update.version || '—'}
                          </span>
                        </td>
                        <td style={{ ...styles.td, fontWeight: 600, fontSize: 13 }}>{update.label}</td>
                        <td style={{ ...styles.td, color: 'var(--text-muted)', fontSize: 12 }}>
                          <span title={update.date}>{timeAgo(update.date)}</span>
                        </td>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                              {update.items?.filter(Boolean).length || 0} change{(update.items?.filter(Boolean).length || 0) !== 1 ? 's' : ''}
                            </span>
                            {(update.items?.filter(Boolean).length || 0) > 0 && (
                              <span style={{ fontSize: 11, color: '#3b82f6', cursor: 'pointer' }}>{isExpanded ? '▲ Hide' : '▼ View'}</span>
                            )}
                          </div>
                        </td>
                        <td style={{ ...styles.td, textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }} onClick={e => e.stopPropagation()}>
                            <button onClick={() => openModal(update)} title="Edit" style={{ ...styles.iconBtn, padding: 6, borderRadius: 7, background: 'rgba(59,130,246,0.08)' }}>
                              <Edit3 size={14} color="#3b82f6" />
                            </button>
                            <button onClick={() => deleteUpdate(update.id, update.label)} title="Delete" style={{ ...styles.iconBtn, padding: 6, borderRadius: 7, background: 'rgba(239,68,68,0.08)' }}>
                              <Trash2 size={14} color="#ef4444" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && update.items?.filter(Boolean).length > 0 && (
                        <tr style={{ background: 'rgba(59,130,246,0.03)' }}>
                          <td colSpan={5} style={{ padding: '0 20px 16px 20px', borderBottom: '1px solid var(--border-color)' }}>
                            <ul style={{ margin: '12px 0 0 0', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
                              {update.items.filter(Boolean).map((item, idx) => (
                                <li key={idx} style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                                  {item}
                                </li>
                              ))}
                            </ul>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Zap size={15} color="#f59e0b" />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{editingUpdate ? 'Edit Changelog Entry' : 'New Changelog Entry'}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>{editingUpdate ? `Editing: ${editingUpdate.label}` : 'Log a new release or update'}</p>
                </div>
              </div>
              <button onClick={closeModal} style={{ ...styles.iconBtn, padding: 6 }}><X size={18} color="var(--text-muted)" /></button>
            </div>

            {/* Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Version + Date row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Version <span style={{ color: '#ef4444' }}>*</span></label>
                  <input style={inputStyle} value={formData.version} onChange={e => setFormData(p => ({ ...p, version: e.target.value }))} placeholder="e.g. v2.0, v1.3.1" autoFocus />
                </div>
                <div>
                  <label style={labelStyle}>Release Date <span style={{ color: '#ef4444' }}>*</span></label>
                  <input type="date" style={inputStyle} value={formData.date} onChange={e => setFormData(p => ({ ...p, date: e.target.value }))} />
                </div>
              </div>

              {/* Label */}
              <div>
                <label style={labelStyle}>Release Label <span style={{ color: '#ef4444' }}>*</span></label>
                <input style={inputStyle} value={formData.label} onChange={e => setFormData(p => ({ ...p, label: e.target.value }))} placeholder="e.g. Skills Refinement, Major Redesign..." />
              </div>

              {/* Change Items */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>Change Items</label>
                  <button onClick={addItem} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#3b82f6', background: 'rgba(59,130,246,0.1)', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontWeight: 600 }}>
                    <Plus size={12} /> Add item
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {formData.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)', width: 20, textAlign: 'right', flexShrink: 0 }}>{idx + 1}.</span>
                      <input
                        style={{ ...inputStyle, flex: 1 }}
                        value={item}
                        onChange={e => updateItem(idx, e.target.value)}
                        placeholder={`Change description #${idx + 1}...`}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addItem(); } }}
                      />
                      {formData.items.length > 1 && (
                        <button onClick={() => removeItem(idx)} style={{ ...styles.iconBtn, padding: 5, borderRadius: 6, background: 'rgba(239,68,68,0.08)', flexShrink: 0 }}>
                          <X size={13} color="#ef4444" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '6px 0 0' }}>Press Enter in any field to add another item.</p>
              </div>

              {/* Preview */}
              {formData.version && formData.label && (
                <div style={{ padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>
                  <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Preview</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700, ...(() => { const vc = versionColor(formData.version); return { background: vc.bg, color: vc.color }; })() }}>{formData.version}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{formData.label}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>{formData.items.filter(Boolean).length} change{formData.items.filter(Boolean).length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0 }}>
              <button onClick={closeModal} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
              <button onClick={saveUpdate} disabled={saving} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#f59e0b', color: '#fff', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 7 }}>
                {saving && <Loader2 size={14} className="spin" />}
                {editingUpdate ? 'Save Changes' : 'Create Entry'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

