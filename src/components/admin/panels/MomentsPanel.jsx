import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { notifyDataMutation } from '../../../lib/syncDispatcher';
import {
  Loader2, Sparkles, Trophy, Quote, FileText, Camera, Play,
  Plus, Edit3, Trash2, X, Star, Check, ChevronUp, ChevronDown,
  Eye, EyeOff, Tag, Calendar, Image
} from 'lucide-react';
import { styles, MODAL_STYLES } from '../shared/constants';
import { PanelCard, EmptyState, StatCard } from '../shared/components';

/* ─── Constants ──────────────────────────────────────────────────────────── */
const TYPES = [
  { value: 'milestone', label: 'Milestone', Icon: Trophy,   color: '#f59e0b' },
  { value: 'quote',     label: 'Quote',     Icon: Quote,    color: '#8b5cf6' },
  { value: 'update',    label: 'Update',    Icon: FileText, color: '#10b981' },
  { value: 'photo',     label: 'Photo',     Icon: Camera,   color: '#3b82f6' },
  { value: 'video',     label: 'Video',     Icon: Play,     color: '#ec4899' },
];

const COLORS = [
  { value: 'accent',  label: 'Indigo',  hex: '#6366f1' },
  { value: 'success', label: 'Green',   hex: '#10b981' },
  { value: 'warning', label: 'Amber',   hex: '#f59e0b' },
  { value: 'purple',  label: 'Purple',  hex: '#8b5cf6' },
  { value: 'pink',    label: 'Pink',    hex: '#ec4899' },
];

const EMPTY_FORM = {
  id: '', type: 'milestone', title: '', description: '', date: '',
  year: new Date().getFullYear(), icon: '', image_url: '', color: 'accent',
  featured: false, tags: '', display_order: 0,
};

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const slugify = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const typeConf = (type) => TYPES.find(t => t.value === type) || TYPES[2];

/* ─── Sub-components ─────────────────────────────────────────────────────── */
function TypeBadge({ type }) {
  const conf = typeConf(type);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 7px', borderRadius: 20, fontSize: 10, fontWeight: 600,
      background: `${conf.color}18`, color: conf.color,
      border: `1px solid ${conf.color}30`,
    }}>
      <conf.Icon size={10} />
      {conf.label}
    </span>
  );
}

function FeaturedBadge() {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      padding: '2px 6px', borderRadius: 20, fontSize: 10, fontWeight: 600,
      background: 'rgba(245,158,11,0.12)', color: '#d97706',
      border: '1px solid rgba(245,158,11,0.28)',
    }}>
      <Star size={9} fill="currentColor" />
      Featured
    </span>
  );
}

/* ─── Main Panel ─────────────────────────────────────────────────────────── */
export default function MomentsPanel() {
  const [moments, setMoments]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [isModalOpen, setIsModal]   = useState(false);
  const [editingId, setEditingId]   = useState(null);
  const [formData, setFormData]     = useState(EMPTY_FORM);
  const [toast, setToast]           = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch]         = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { id, title }

  /* ── Toast ────────────────────────────────────────────────────────────── */
  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  /* ── Fetch ────────────────────────────────────────────────────────────── */
  const fetchMoments = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('moments')
      .select('*')
      .order('display_order', { ascending: true });
    if (!error && data) setMoments(data);
    else if (error) showToast('Failed to load moments', 'error');
    setLoading(false);
  }, [showToast]);

  useEffect(() => { fetchMoments(); }, [fetchMoments]);

  /* ── Modal ────────────────────────────────────────────────────────────── */
  const openAdd = () => {
    setEditingId(null);
    setFormData({ ...EMPTY_FORM, display_order: (moments.length + 1) * 10 });
    setIsModal(true);
  };

  const openEdit = (moment) => {
    setEditingId(moment.id);
    setFormData({
      ...moment,
      tags: Array.isArray(moment.tags) ? moment.tags.join(', ') : (moment.tags || ''),
    });
    setIsModal(true);
  };

  const closeModal = () => { setIsModal(false); setEditingId(null); setFormData(EMPTY_FORM); };

  const setField = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

  /* ── Save ─────────────────────────────────────────────────────────────── */
  const handleSubmit = async () => {
    if (!formData.title.trim()) { showToast('Title is required', 'error'); return; }
    if (!formData.type)         { showToast('Type is required',  'error'); return; }

    setSaving(true);
    const tagsArray = formData.tags
      ? formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      : [];

    const payload = {
      id:            editingId || slugify(formData.title) + '-' + Date.now(),
      type:          formData.type,
      title:         formData.title.trim(),
      description:   formData.description?.trim() || null,
      date:          formData.date?.trim() || null,
      year:          parseInt(formData.year) || new Date().getFullYear(),
      icon:          formData.icon?.trim() || null,
      image_url:     formData.image_url?.trim() || null,
      color:         formData.color || 'accent',
      featured:      Boolean(formData.featured),
      tags:          tagsArray,
      display_order: parseInt(formData.display_order) || 0,
    };

    if (editingId) {
      const { data, error } = await supabase
        .from('moments').update(payload).eq('id', editingId).select().single();
      if (!error && data) {
        setMoments(prev => prev.map(m => m.id === data.id ? data : m)
          .sort((a, b) => a.display_order - b.display_order));
        notifyDataMutation('moments', 'UPDATE', data);
        showToast('Moment updated ✓');
        closeModal();
      } else { showToast(error?.message || 'Failed to update', 'error'); }
    } else {
      const { data, error } = await supabase
        .from('moments').insert([payload]).select().single();
      if (!error && data) {
        setMoments(prev => [...prev, data].sort((a, b) => a.display_order - b.display_order));
        notifyDataMutation('moments', 'INSERT', data);
        showToast('Moment added ✓');
        closeModal();
      } else { showToast(error?.message || 'Failed to add', 'error'); }
    }
    setSaving(false);
  };

  /* ── Delete ───────────────────────────────────────────────────────────── */
  const confirmDelete = (moment) => setDeleteConfirm({ id: moment.id, title: moment.title });

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    const { id, title } = deleteConfirm;
    const { error } = await supabase.from('moments').delete().eq('id', id);
    if (!error) {
      setMoments(prev => prev.filter(m => m.id !== id));
      notifyDataMutation('moments', 'DELETE', { id });
      showToast(`"${title}" deleted`, 'error');
    } else { showToast('Failed to delete', 'error'); }
    setDeleteConfirm(null);
  };

  /* ── Reorder ──────────────────────────────────────────────────────────── */
  const reorder = async (moment, dir) => {
    const sorted = [...moments].sort((a, b) => a.display_order - b.display_order);
    const idx = sorted.findIndex(m => m.id === moment.id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const a = sorted[idx];
    const b = sorted[swapIdx];
    const tmpOrder = a.display_order;

    const newA = { ...a, display_order: b.display_order };
    const newB = { ...b, display_order: tmpOrder };

    await Promise.all([
      supabase.from('moments').update({ display_order: newA.display_order }).eq('id', newA.id),
      supabase.from('moments').update({ display_order: newB.display_order }).eq('id', newB.id),
    ]);
    setMoments(prev => prev.map(m => {
      if (m.id === newA.id) return newA;
      if (m.id === newB.id) return newB;
      return m;
    }).sort((a, b) => a.display_order - b.display_order));
  };

  /* ── Toggle Featured ──────────────────────────────────────────────────── */
  const toggleFeatured = async (moment) => {
    const { data, error } = await supabase
      .from('moments').update({ featured: !moment.featured }).eq('id', moment.id).select().single();
    if (!error && data) {
      setMoments(prev => prev.map(m => m.id === data.id ? data : m));
      notifyDataMutation('moments', 'UPDATE', data);
    }
  };

  /* ── Filtered List ────────────────────────────────────────────────────── */
  const filtered = moments
    .filter(m => filterType === 'all' || m.type === filterType)
    .filter(m => !search || m.title.toLowerCase().includes(search.toLowerCase()) ||
                            m.description?.toLowerCase().includes(search.toLowerCase()));

  /* ── Stats ────────────────────────────────────────────────────────────── */
  const stats = {
    total:      moments.length,
    featured:   moments.filter(m => m.featured).length,
    milestones: moments.filter(m => m.type === 'milestone').length,
    photos:     moments.filter(m => m.type === 'photo').length,
  };

  /* ── Render ───────────────────────────────────────────────────────────── */
  const S = styles;
  const M = MODAL_STYLES;

  const inputStyle = { ...S.input, fontFamily: 'inherit' };
  const labelStyle = M.label;
  const groupStyle = { display: 'flex', flexDirection: 'column', gap: 4 };

  if (loading) {
    return (
      <PanelCard title="Moments">
        <div style={S.emptyState}><Loader2 className="spin" size={24} color="var(--text-muted)" /></div>
      </PanelCard>
    );
  }

  return (
    <>
      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          background: toast.type === 'error' ? '#ef4444' : '#10b981',
          color: '#fff', padding: '12px 20px', borderRadius: 10,
          fontSize: 13, fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          {toast.type === 'error' ? <X size={14} /> : <Check size={14} />}
          {toast.msg}
        </div>
      )}

      {/* ── Delete Confirm ─────────────────────────────────────────────────── */}
      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'var(--pcms-panel)', borderRadius: 14, padding: 24, width: '100%', maxWidth: 380, border: '1px solid var(--pcms-line)', boxShadow: '0 24px 60px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', flexShrink: 0 }}>
                <Trash2 size={18} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--pcms-text)' }}>Delete Moment?</p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--pcms-muted)' }}>"{deleteConfirm.title}" will be permanently removed.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button style={{ ...S.btn }} onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button style={{ ...S.btnPrimary, background: '#ef4444' }} onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <div style={S.statsRow}>
        <StatCard label="Total Moments"  value={stats.total}      icon={<Sparkles size={14} />} />
        <StatCard label="Featured"       value={stats.featured}   icon={<Star size={14} />} />
        <StatCard label="Milestones"     value={stats.milestones} icon={<Trophy size={14} />} />
        <StatCard label="Photos"         value={stats.photos}     icon={<Camera size={14} />} />
      </div>

      {/* ── Main Panel ────────────────────────────────────────────────────── */}
      <div style={S.panelCard}>
        {/* Panel Header */}
        <div style={S.panelHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ ...S.panelTitle }}>Moments</span>
            <span style={{ fontSize: 11, color: 'var(--pcms-muted)', background: 'var(--pcms-panel-2)', border: '1px solid var(--pcms-line)', borderRadius: 20, padding: '2px 8px' }}>
              {filtered.length} of {moments.length}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search */}
            <input
              style={{ ...inputStyle, width: 160, padding: '5px 10px' }}
              placeholder="Search moments…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {/* Type filter */}
            <select
              style={{ ...inputStyle, width: 130, padding: '5px 8px' }}
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
            >
              <option value="all">All types</option>
              {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <button style={S.panelAction} onClick={openAdd}>
              <Plus size={13} /> Add Moment
            </button>
          </div>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Sparkles size={24} />}
            title="No moments yet"
            description={search || filterType !== 'all' ? 'No moments match your filter.' : 'Click "Add Moment" to post your first one.'}
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>Order</th>
                  <th style={S.th}>Title</th>
                  <th style={S.th}>Type</th>
                  <th style={S.th}>Date</th>
                  <th style={S.th}>Color</th>
                  <th style={S.th}>Featured</th>
                  <th style={S.th}>Tags</th>
                  <th style={S.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((moment, idx) => {
                  const colDef = COLORS.find(c => c.value === moment.color) || COLORS[0];
                  return (
                    <tr key={moment.id} style={{ transition: 'background 0.12s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--pcms-panel-2)'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <td style={{ ...S.td, width: 70 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <span style={{ fontSize: 11, color: 'var(--pcms-muted)', minWidth: 24 }}>{moment.display_order}</span>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <button style={{ ...S.iconBtn, padding: 2 }} onClick={() => reorder(moment, -1)} disabled={idx === 0} title="Move up"><ChevronUp size={12} /></button>
                            <button style={{ ...S.iconBtn, padding: 2 }} onClick={() => reorder(moment, 1)} disabled={idx === filtered.length - 1} title="Move down"><ChevronDown size={12} /></button>
                          </div>
                        </div>
                      </td>
                      <td style={S.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {moment.icon && <span style={{ fontSize: 16 }}>{moment.icon}</span>}
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--pcms-text)', maxWidth: 200 }} className="text-truncate">{moment.title}</div>
                            {moment.description && (
                              <div style={{ fontSize: 11, color: 'var(--pcms-muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {moment.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={S.td}><TypeBadge type={moment.type} /></td>
                      <td style={{ ...S.td, whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: 11, color: 'var(--pcms-muted)' }}>{moment.date || '—'}</span>
                      </td>
                      <td style={S.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <div style={{ width: 10, height: 10, borderRadius: '50%', background: colDef.hex, flexShrink: 0 }} />
                          <span style={{ fontSize: 11 }}>{colDef.label}</span>
                        </div>
                      </td>
                      <td style={{ ...S.td, textAlign: 'center' }}>
                        <button style={{ ...S.iconBtn }} onClick={() => toggleFeatured(moment)} title={moment.featured ? 'Unfeature' : 'Mark featured'}>
                          {moment.featured
                            ? <Star size={14} fill="#f59e0b" color="#f59e0b" />
                            : <Star size={14} color="var(--pcms-muted-2)" />
                          }
                        </button>
                      </td>
                      <td style={S.td}>
                        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                          {(moment.tags || []).slice(0, 3).map(tag => (
                            <span key={tag} style={{ fontSize: 10, padding: '1px 6px', borderRadius: 6, background: 'var(--pcms-panel-2)', border: '1px solid var(--pcms-line)', color: 'var(--pcms-muted)' }}>
                              #{tag}
                            </span>
                          ))}
                          {(moment.tags || []).length > 3 && (
                            <span style={{ fontSize: 10, color: 'var(--pcms-muted)' }}>+{moment.tags.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td style={S.td}>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button style={S.iconBtn} onClick={() => openEdit(moment)} title="Edit"><Edit3 size={14} /></button>
                          <button style={{ ...S.iconBtn, color: '#ef4444' }} onClick={() => confirmDelete(moment)} title="Delete"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ─────────────────────────────────────────────── */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: 'var(--pcms-panel)', borderRadius: 16, width: '100%', maxWidth: 620, maxHeight: '92vh', display: 'flex', flexDirection: 'column', border: '1px solid var(--pcms-line)', boxShadow: '0 24px 64px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
            {/* Modal header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--pcms-line)', background: 'var(--pcms-panel-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--pcms-text)', fontFamily: 'Space Grotesk, sans-serif' }}>
                  {editingId ? 'Edit Moment' : 'New Moment'}
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--pcms-muted)' }}>
                  {editingId ? "Update this moment's details" : 'Add a new life moment to your page'}
                </p>
              </div>
              <button style={{ ...S.iconBtn, width: 30, height: 30, borderRadius: 8, border: '1px solid var(--pcms-line)' }} onClick={closeModal}>
                <X size={16} />
              </button>
            </div>

            {/* Modal body */}
            <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', flex: 1 }}>

              {/* Type selector */}
              <div style={groupStyle}>
                <label style={labelStyle}>Type *</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {TYPES.map(t => (
                    <button key={t.value}
                      onClick={() => setField('type', t.value)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                        border: `1px solid ${formData.type === t.value ? t.color : 'var(--pcms-line)'}`,
                        background: formData.type === t.value ? `${t.color}14` : 'var(--pcms-panel)',
                        color: formData.type === t.value ? t.color : 'var(--pcms-muted)',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}>
                      <t.Icon size={12} />{t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div style={groupStyle}>
                <label style={labelStyle}>Title *</label>
                <input style={inputStyle} placeholder="e.g. Graduated from VIT Vellore 🎓" value={formData.title} onChange={e => setField('title', e.target.value)} />
              </div>

              {/* Description */}
              <div style={groupStyle}>
                <label style={labelStyle}>Description</label>
                <textarea style={{ ...inputStyle, height: 90, resize: 'vertical', lineHeight: 1.6 }}
                  placeholder="Tell the story of this moment…"
                  value={formData.description || ''}
                  onChange={e => setField('description', e.target.value)} />
              </div>

              {/* Date + Year */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={groupStyle}>
                  <label style={labelStyle}>Date (display)</label>
                  <input style={inputStyle} placeholder="e.g. Aug 2026" value={formData.date || ''} onChange={e => setField('date', e.target.value)} />
                </div>
                <div style={groupStyle}>
                  <label style={labelStyle}>Year (numeric)</label>
                  <input style={inputStyle} type="number" min={2000} max={2100} placeholder="2026" value={formData.year || ''} onChange={e => setField('year', e.target.value)} />
                </div>
              </div>

              {/* Icon + Color */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={groupStyle}>
                  <label style={labelStyle}>Emoji Icon</label>
                  <input style={inputStyle} placeholder="🎓  💼  🏆  🚀  🏔️" value={formData.icon || ''} onChange={e => setField('icon', e.target.value)} />
                </div>
                <div style={groupStyle}>
                  <label style={labelStyle}>Color Theme</label>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 2 }}>
                    {COLORS.map(c => (
                      <button key={c.value} title={c.label}
                        onClick={() => setField('color', c.value)}
                        style={{
                          width: 24, height: 24, borderRadius: '50%', background: c.hex,
                          border: formData.color === c.value ? `3px solid var(--pcms-text)` : '2px solid transparent',
                          cursor: 'pointer', outline: formData.color === c.value ? `2px solid ${c.hex}` : 'none',
                          outlineOffset: 2, transition: 'all 0.15s',
                        }} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Image URL (for photo type) */}
              {(formData.type === 'photo' || formData.type === 'video') && (
                <div style={groupStyle}>
                  <label style={labelStyle}>Image URL</label>
                  <input style={inputStyle} placeholder="https://… or /public/moments/…"
                    value={formData.image_url || ''}
                    onChange={e => setField('image_url', e.target.value)} />
                  <span style={{ fontSize: 10, color: 'var(--pcms-muted)', marginTop: 2 }}>
                    Paste a Supabase Storage URL or any public image URL
                  </span>
                </div>
              )}

              {/* Tags + Order */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 12 }}>
                <div style={groupStyle}>
                  <label style={labelStyle}>Tags (comma-separated)</label>
                  <input style={inputStyle} placeholder="education, achievement, career"
                    value={formData.tags || ''} onChange={e => setField('tags', e.target.value)} />
                </div>
                <div style={groupStyle}>
                  <label style={labelStyle}>Display Order</label>
                  <input style={inputStyle} type="number" value={formData.display_order || 0}
                    onChange={e => setField('display_order', e.target.value)} />
                </div>
              </div>

              {/* Featured toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--pcms-line)', background: 'var(--pcms-panel-2)' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--pcms-text)' }}>Featured Moment</div>
                  <div style={{ fontSize: 11, color: 'var(--pcms-muted)', marginTop: 1 }}>Shows with a glowing shimmer card and star badge</div>
                </div>
                <button
                  onClick={() => setField('featured', !formData.featured)}
                  style={{
                    width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer',
                    background: formData.featured ? '#10b981' : 'var(--pcms-line)',
                    position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                  }}>
                  <span style={{
                    position: 'absolute', top: 2, left: formData.featured ? 20 : 2,
                    width: 18, height: 18, borderRadius: '50%', background: '#fff',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                    transition: 'left 0.2s',
                  }} />
                </button>
              </div>
            </div>

            {/* Modal footer */}
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--pcms-line)', display: 'flex', justifyContent: 'flex-end', gap: 8, flexShrink: 0, background: 'var(--pcms-panel-2)' }}>
              <button style={S.btn} onClick={closeModal}>Cancel</button>
              <button style={{ ...S.btnPrimary, display: 'flex', alignItems: 'center', gap: 6, opacity: saving ? 0.7 : 1 }} onClick={handleSubmit} disabled={saving}>
                {saving ? <Loader2 size={13} className="spin" /> : <Check size={13} />}
                {saving ? 'Saving…' : (editingId ? 'Update Moment' : 'Add Moment')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
