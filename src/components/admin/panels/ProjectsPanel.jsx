import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Loader2, Star, Edit3, Trash2, Plus, X } from 'lucide-react';
import { styles, MODAL_STYLES } from '../shared/constants';
import { PanelCard, EmptyState, StatCard } from '../shared/components';

export default function ProjectsPanel() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFeatured, setFilterFeatured] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [toast, setToast] = useState(null);
  const EMPTY_FORM = { title: '', description: '', tags: [], github_url: '', live_url: '', image_url: '', featured: false };
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [tagInput, setTagInput] = useState('');
  const [checkingUrls, setCheckingUrls] = useState(false);
  const [urlStatuses, setUrlStatuses] = useState({});

  const PRESET_TECH_STACK = ['React', 'TypeScript', 'Node.js', 'Python', 'Supabase', 'PyTorch', 'TailwindCSS', 'PostgreSQL', 'Docker', 'Next.js', 'FastAPI'];

  const checkProjectUrls = async () => {
    setCheckingUrls(true);
    const statuses = {};
    for (const proj of projects) {
      if (proj.live_url && proj.live_url !== '#') {
        try {
          const res = await fetch(proj.live_url, { method: 'HEAD', mode: 'no-cors' });
          statuses[proj.id] = { live: 'online' };
        } catch {
          statuses[proj.id] = { live: 'unknown' };
        }
      }
    }
    setUrlStatuses(statuses);
    setCheckingUrls(false);
    showToast('Project links checked');
  };

  useEffect(() => { fetchProjects(); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: true });
    if (!error && data) setProjects(data);
    setLoading(false);
  };

  const deleteProject = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (!error) {
      setProjects(prev => prev.filter(p => p.id !== id));
      showToast(`"${title}" deleted successfully`, 'error');
    } else {
      showToast('Failed to delete project', 'error');
    }
  };

  const toggleFeatured = async (proj) => {
    const newVal = !proj.featured;
    const { error } = await supabase.from('projects').update({ featured: newVal }).eq('id', proj.id);
    if (!error) {
      setProjects(prev => prev.map(p => p.id === proj.id ? { ...p, featured: newVal } : p));
      showToast(newVal ? `"${proj.title}" is now featured` : `"${proj.title}" unfeatured`);
    }
  };

  const openModal = (proj = null) => {
    if (proj) {
      setEditingProject(proj);
      setFormData({
        title: proj.title || '',
        description: proj.description || '',
        tags: Array.isArray(proj.tags) ? proj.tags : [],
        github_url: (proj.github_url && proj.github_url !== '#') ? proj.github_url : '',
        live_url: (proj.live_url && proj.live_url !== '#') ? proj.live_url : '',
        image_url: proj.image_url || '',
        featured: proj.featured || false,
      });
    } else {
      setEditingProject(null);
      setFormData(EMPTY_FORM);
    }
    setTagInput('');
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingProject(null); };

  const handleTagKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const val = tagInput.trim().replace(/,/g, '');
      if (val && !formData.tags.includes(val)) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, val] }));
      }
      setTagInput('');
    }
    if (e.key === 'Backspace' && !tagInput && formData.tags.length > 0) {
      setFormData(prev => ({ ...prev, tags: prev.tags.slice(0, -1) }));
    }
  };

  const removeTag = (tag) => setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));

  const saveProject = async () => {
    if (!formData.title.trim()) { showToast('Project title is required', 'error'); return; }
    setSaving(true);
    const payload = {
      ...formData,
      github_url: formData.github_url.trim() || null,
      live_url: formData.live_url.trim() || null,
      image_url: formData.image_url.trim() || null,
    };
    if (editingProject) {
      const { data, error } = await supabase.from('projects').update(payload).eq('id', editingProject.id).select().single();
      if (!error && data) {
        setProjects(prev => prev.map(p => p.id === data.id ? data : p));
        showToast(`"${data.title}" updated successfully`);
        closeModal();
      } else { showToast('Failed to save changes', 'error'); }
    } else {
      const { data, error } = await supabase.from('projects').insert([payload]).select().single();
      if (!error && data) {
        setProjects(prev => [...prev, data]);
        showToast(`"${data.title}" created successfully`);
        closeModal();
      } else { showToast('Failed to create project', 'error'); }
    }
    setSaving(false);
  };

  const filteredProjects = projects
    .filter(p => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || p.title?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || p.tags?.some(t => t.toLowerCase().includes(q));
      const matchesFeatured = filterFeatured === 'all' || (filterFeatured === 'featured' ? p.featured : !p.featured);
      return matchesSearch && matchesFeatured;
    })
    .sort((a, b) => {
      if (sortBy === 'title') return a.title?.localeCompare(b.title);
      if (sortBy === 'featured') return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      return new Date(b.created_at) - new Date(a.created_at);
    });

  if (loading) return <PanelCard title="Projects"><div style={styles.emptyState}><Loader2 className="spin" size={24} color="var(--text-muted)" /></div></PanelCard>;

  const modalOverlay = {
    position: 'fixed', inset: 0, zIndex: 2000,
    background: 'rgba(0,0,0,0.65)',
    backdropFilter: 'blur(6px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '24px',
  };
  const modalBox = {
    background: 'var(--pcms-panel, #111827)',
    border: '1px solid var(--pcms-line)',
    borderRadius: '14px',
    width: '100%', maxWidth: '580px',
    maxHeight: '85vh',
    boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
  };
  const modalHeader = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px 20px', borderBottom: '1px solid var(--pcms-line)',
    background: 'var(--pcms-panel-2)',
    flexShrink: 0,
    position: 'sticky', top: 0, zIndex: 10,
  };
  const modalBody = {
    padding: '20px', display: 'flex', flexDirection: 'column', gap: 16,
    overflowY: 'auto', flex: 1, minHeight: 0,
  };
  const modalFooter = {
    padding: '14px 20px', borderTop: '1px solid var(--pcms-line)',
    display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0,
    background: 'var(--pcms-panel-2)',
    position: 'sticky', bottom: 0, zIndex: 10,
  };
  const labelStyle = { fontSize: 10.5, fontWeight: 700, color: 'var(--pcms-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 5 };
  const inputStyle = { ...styles.input, background: 'var(--pcms-panel)' };
  const sectionLabel = { fontSize: 13, fontWeight: 600, color: 'var(--pcms-text)', margin: 0 };

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          background: toast.type === 'error' ? '#ef4444' : '#10b981',
          color: '#fff', padding: '12px 20px', borderRadius: 10,
          fontSize: 13, fontWeight: 600,
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          animation: 'fadeIn 0.2s ease',
        }}>
          {toast.msg}
        </div>
      )}

      <PanelCard title="Projects" action={{ label: 'Add project', icon: 'ti-plus', onClick: () => openModal() }}>
        {/* Toolbar */}
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--pcms-line)', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <input
            type="text"
            className="pcms-search"
            placeholder="Search by title, description or tag..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ flex: '1 1 220px', minWidth: 180 }}
          />
          <select className="pcms-select" value={filterFeatured} onChange={e => setFilterFeatured(e.target.value)}>
            <option value="all">All Projects</option>
            <option value="featured">Featured Only</option>
            <option value="notfeatured">Not Featured</option>
          </select>
          <select className="pcms-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="created_at">Sort: Newest</option>
            <option value="title">Sort: A–Z</option>
            <option value="featured">Sort: Featured</option>
          </select>
          <span style={{ fontSize: 11.5, color: 'var(--pcms-muted)', whiteSpace: 'nowrap', marginLeft: 'auto' }}>
            {filteredProjects.length} / {projects.length} projects
          </span>
        </div>

        {/* Table */}
        {projects.length === 0 ? (
          <EmptyState icon="ti-briefcase" title="No projects yet" description="Click '+ Add project' to add your first project." />
        ) : filteredProjects.length === 0 ? (
          <div style={{ ...styles.emptyState, padding: '40px 20px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No projects match your search or filter.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={{ ...styles.th, width: '22%' }}>Title</th>
                  <th style={{ ...styles.th, width: '30%' }}>Description</th>
                  <th style={{ ...styles.th, width: '25%' }}>Tags</th>
                  <th style={{ ...styles.th, width: '10%', textAlign: 'center' }}>Featured</th>
                  <th style={{ ...styles.th, width: '13%', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((proj, i) => (
                  <tr
                    key={proj.id}
                    onDoubleClick={() => openModal(proj)}
                    style={{ cursor: 'pointer', background: i % 2 === 0 ? 'transparent' : 'rgba(128,128,128,0.025)', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(128,128,128,0.025)'}
                  >
                    <td style={{ ...styles.td, fontWeight: 600, fontSize: 13 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span>{proj.title}</span>
                        {proj.live_url && proj.live_url !== '#' && (
                          <a href={proj.live_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ fontSize: 11, color: 'var(--pcms-accent)', textDecoration: 'none' }}>↗ Live</a>
                        )}
                      </div>
                    </td>
                    <td style={{ ...styles.td, color: 'var(--text-muted)', fontSize: 12, maxWidth: 240 }}>
                      <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {proj.description || '—'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {(proj.tags || []).slice(0, 4).map(tag => (
                          <span key={tag} style={{ fontSize: 10, padding: '2px 7px', background: 'var(--pcms-accent-dim)', color: 'var(--pcms-accent)', borderRadius: 20, fontWeight: 600, letterSpacing: '0.2px' }}>{tag}</span>
                        ))}
                        {(proj.tags || []).length > 4 && (
                          <span style={{ fontSize: 10, padding: '2px 5px', color: 'var(--text-muted)' }}>+{proj.tags.length - 4}</span>
                        )}
                      </div>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <button
                        onClick={e => { e.stopPropagation(); toggleFeatured(proj); }}
                        title={proj.featured ? 'Click to unfeature' : 'Click to feature'}
                        style={{ ...styles.iconBtn, margin: '0 auto', padding: 6, borderRadius: 8, background: proj.featured ? 'rgba(16,185,129,0.1)' : 'transparent' }}
                      >
                        <Star size={15} color={proj.featured ? '#10b981' : 'var(--text-muted)'} fill={proj.featured ? '#10b981' : 'none'} />
                      </button>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                        <button
                          onClick={e => { e.stopPropagation(); openModal(proj); }}
                          title="Edit project"
                          style={{ ...styles.iconBtn, padding: 6, borderRadius: 7, background: 'rgba(59,130,246,0.08)' }}
                        >
                          <Edit3 size={14} color="#3b82f6" />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); deleteProject(proj.id, proj.title); }}
                          title="Delete project"
                          style={{ ...styles.iconBtn, padding: 6, borderRadius: 7, background: 'rgba(239,68,68,0.08)' }}
                        >
                          <Trash2 size={14} color="#ef4444" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PanelCard>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div style={modalOverlay} onClick={closeModal}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--pcms-accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {editingProject ? <Edit3 size={15} color="var(--pcms-accent)" /> : <Plus size={15} color="var(--pcms-accent)" />}
                </div>
                <div>
                  <p style={{ ...sectionLabel, margin: 0 }}>{editingProject ? 'Edit Project' : 'New Project'}</p>
                  <p style={{ fontSize: 11, color: 'var(--pcms-muted)', margin: '2px 0 0' }}>{editingProject ? `Editing: ${editingProject.title}` : 'Add a new project to your portfolio'}</p>
                </div>
              </div>
              <button onClick={closeModal} className="pcms-icon-btn">
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={modalBody}>
              {/* Title */}
              <div>
                <label style={labelStyle}>Project Title <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  style={inputStyle}
                  value={formData.title}
                  onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. AI Portfolio Generator"
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label style={labelStyle}>Description</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 85, resize: 'vertical', lineHeight: 1.6 }}
                  value={formData.description}
                  onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                  placeholder="Brief overview of what you built, technologies used, and impact..."
                />
              </div>

              {/* Tags */}
              <div>
                <label style={labelStyle}>Tags</label>
                <div style={{
                  display: 'flex', flexWrap: 'wrap', gap: 6, padding: '8px 12px',
                  borderRadius: 8, border: '1px solid var(--pcms-line)',
                  background: 'var(--pcms-panel)', minHeight: 42, alignItems: 'center',
                  cursor: 'text',
                }} onClick={e => e.currentTarget.querySelector('input')?.focus()}>
                  {formData.tags.map(tag => (
                    <span key={tag} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      background: 'var(--pcms-accent-dim)', color: 'var(--pcms-accent)',
                      padding: '3px 8px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                    }}>
                      {tag}
                      <button onClick={() => removeTag(tag)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--pcms-accent)', padding: 0, lineHeight: 1, opacity: 0.7 }}>×</button>
                    </span>
                  ))}
                  <input
                    style={{ border: 'none', background: 'transparent', outline: 'none', flex: '1 1 80px', minWidth: 60, fontSize: 13, color: 'var(--pcms-text)' }}
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder={formData.tags.length === 0 ? 'Type a tag and press Enter...' : ''}
                  />
                </div>
                <p style={{ fontSize: 11, color: 'var(--pcms-muted)', margin: '5px 0 0' }}>Press Enter or comma to add a tag. Backspace to remove last tag.</p>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 8 }}>
                  <span style={{ fontSize: 10, color: 'var(--pcms-muted)', fontWeight: 700, textTransform: 'uppercase', alignSelf: 'center' }}>Quick add:</span>
                  {PRESET_TECH_STACK.map(tech => {
                    const isSelected = formData.tags.includes(tech);
                    return (
                      <button
                        key={tech}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tech) }));
                          } else {
                            setFormData(prev => ({ ...prev, tags: [...prev.tags, tech] }));
                          }
                        }}
                        style={{
                          fontSize: 10.5, padding: '2px 8px', borderRadius: 12,
                          border: `1px solid ${isSelected ? 'var(--pcms-accent)' : 'var(--pcms-line)'}`,
                          background: isSelected ? 'var(--pcms-accent-dim)' : 'transparent',
                          color: isSelected ? 'var(--pcms-accent)' : 'var(--pcms-muted)',
                          cursor: 'pointer', fontWeight: 600, transition: 'all 0.15s'
                        }}
                      >
                        {isSelected ? '✓ ' : '+ '}{tech}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* URLs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>GitHub URL</label>
                  <input
                    style={inputStyle}
                    value={formData.github_url}
                    onChange={e => setFormData(p => ({ ...p, github_url: e.target.value }))}
                    placeholder="https://github.com/username/repo"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Live Demo URL</label>
                  <input
                    style={inputStyle}
                    value={formData.live_url}
                    onChange={e => setFormData(p => ({ ...p, live_url: e.target.value }))}
                    placeholder="https://myproject.vercel.app"
                  />
                </div>
              </div>

              {/* Cover Image */}
              <div>
                <label style={labelStyle}>Cover Image URL</label>
                <input
                  style={inputStyle}
                  value={formData.image_url}
                  onChange={e => setFormData(p => ({ ...p, image_url: e.target.value }))}
                  placeholder="https://i.imgur.com/example.png"
                />
              </div>

              {/* Featured toggle */}
              <label style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px', borderRadius: 10,
                border: `1px solid ${formData.featured ? 'rgba(16,185,129,0.35)' : 'var(--border-color)'}`,
                background: formData.featured ? 'rgba(16,185,129,0.06)' : 'var(--bg-primary)',
                cursor: 'pointer', transition: 'all 0.2s',
              }}>
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={e => setFormData(p => ({ ...p, featured: e.target.checked }))}
                  style={{ width: 16, height: 16, accentColor: '#10b981', cursor: 'pointer' }}
                />
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: formData.featured ? '#10b981' : 'var(--text-primary)' }}>
                    <Star size={12} style={{ marginRight: 5, verticalAlign: 'middle' }} />
                    Mark as Featured
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>Featured projects are highlighted on your portfolio homepage</p>
                </div>
              </label>
            </div>

            {/* Modal Footer */}
            <div style={modalFooter}>
              <button
                onClick={closeModal}
                className="pcms-btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={saveProject}
                disabled={saving}
                className="pcms-btn-dark"
                style={{ opacity: saving ? 0.7 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}
              >
                {saving && <Loader2 size={14} className="spin" />}
                {editingProject ? 'Save Changes' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

