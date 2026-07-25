import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Loader2 } from 'lucide-react';
import { styles, MODAL_STYLES } from '../shared/constants';
import { PanelCard, EmptyState, StatCard } from '../shared/components';

export default function CertificationsPanel() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState(null);
  const [toast, setToast] = useState(null);

  const EMPTY_FORM = { id: '', title: '', issuer: '', date: '', description: '', icon_class: '', credential_url: '', display_order: 0 };
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => { fetchCerts(); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchCerts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('certifications').select('*').order('display_order', { ascending: true });
    if (!error && data) setCerts(data);
    setLoading(false);
  };

  const openModal = (cert = null) => {
    if (cert) {
      setEditingCert(cert);
      setFormData(cert);
    } else {
      setEditingCert(null);
      setFormData(EMPTY_FORM);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingCert(null); };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    const { error } = await supabase.from('certifications').delete().eq('id', id);
    if (!error) {
      setCerts(certs.filter(c => c.id !== id));
      showToast(`"${title}" deleted`, 'error');
    } else showToast('Failed to delete', 'error');
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.issuer.trim()) { showToast('Title and Issuer are required', 'error'); return; }

    setSaving(true);
    const payload = {
      ...formData,
      id: formData.id || formData.title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      display_order: parseInt(formData.display_order) || 0,
    };

    const isUpdate = certs.some(c => c.id === payload.id);

    if (isUpdate) {
      const { data, error } = await supabase.from('certifications').update(payload).eq('id', payload.id).select().single();
      if (!error && data) {
        setCerts(certs.map(c => c.id === data.id ? data : c).sort((a,b) => a.display_order - b.display_order));
        showToast('Certification updated');
        closeModal();
      } else showToast('Failed to update', 'error');
    } else {
      const { data, error } = await supabase.from('certifications').insert([payload]).select().single();
      if (!error && data) {
        setCerts([...certs, data].sort((a,b) => a.display_order - b.display_order));
        showToast('Certification added');
        closeModal();
      } else showToast('Failed to add', 'error');
    }
    setSaving(false);
  };

  if (loading) return <PanelCard title="Certifications"><div style={styles.emptyState}><Loader2 className="spin" size={24} color="var(--text-muted)" /></div></PanelCard>;

  const modalOverlay = { position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' };
  const modalBox = { background: 'var(--sidebar-bg, #1a1a2e)', border: '1px solid var(--border-color)', borderRadius: '16px', width: '100%', maxWidth: '560px', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 32px 64px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column' };
  const labelStyle = { fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 };
  const inputStyle = { ...styles.input, background: 'var(--bg-primary)' };

  return (
    <>
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, background: toast.type === 'error' ? '#ef4444' : '#10b981', color: '#fff', padding: '12px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
          {toast.msg}
        </div>
      )}

      <PanelCard title="Certifications" action={{ label: "Add", icon: "ti-plus", onClick: () => openModal() }}>
        {certs.length === 0 ? (
          <EmptyState icon="ti-certificate" title="No certifications" description="Add your first certification to showcase your credentials." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead><tr><th style={styles.th}>Badge</th><th style={styles.th}>Title</th><th style={styles.th}>Issuer</th><th style={styles.th}>Date</th><th style={{ ...styles.th, textAlign: 'right' }}>Actions</th></tr></thead>
              <tbody>
                {certs.map((cert, i) => (
                  <tr key={cert.id} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(128,128,128,0.025)' }}>
                    <td style={styles.td}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {cert.icon_class ? <i className={`ti ti-${cert.icon_class}`} style={{ fontSize: 20, color: '#8b5cf6' }} /> : <Award size={20} color="#8b5cf6" />}
                      </div>
                    </td>
                    <td style={{ ...styles.td, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {cert.credential_url ? <a href={cert.credential_url} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }} className="hover-underline">{cert.title} <ExternalLink size={12} style={{ marginLeft: 4, color: 'var(--text-muted)' }}/></a> : cert.title}
                    </td>
                    <td style={{ ...styles.td, color: 'var(--text-secondary)' }}>{cert.issuer}</td>
                    <td style={{ ...styles.td, color: 'var(--text-muted)' }}>{cert.date}</td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                        <button onClick={() => openModal(cert)} style={{ ...styles.iconBtn, padding: 6, borderRadius: 7, background: 'rgba(59,130,246,0.08)' }}><Edit3 size={14} color="#3b82f6" /></button>
                        <button onClick={() => handleDelete(cert.id, cert.title)} style={{ ...styles.iconBtn, padding: 6, borderRadius: 7, background: 'rgba(239,68,68,0.08)' }}><Trash2 size={14} color="#ef4444" /></button>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Award size={15} color="#8b5cf6" /></div>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{editingCert ? 'Edit Certification' : 'New Certification'}</p>
                </div>
              </div>
              <button onClick={closeModal} style={{ ...styles.iconBtn, padding: 6 }}><X size={18} color="var(--text-muted)" /></button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={labelStyle}>Title <span style={{ color: '#ef4444' }}>*</span></label>
                <input style={inputStyle} value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. AWS Solutions Architect" autoFocus />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Issuer <span style={{ color: '#ef4444' }}>*</span></label>
                  <input style={inputStyle} value={formData.issuer} onChange={e => setFormData({ ...formData, issuer: e.target.value })} placeholder="e.g. Amazon Web Services" />
                </div>
                <div>
                  <label style={labelStyle}>Date / Year</label>
                  <input style={inputStyle} value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} placeholder="e.g. 2024" />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Credential URL</label>
                <input style={inputStyle} value={formData.credential_url} onChange={e => setFormData({ ...formData, credential_url: e.target.value })} placeholder="https://..." />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Icon Class (Tabler)</label>
                  <input style={inputStyle} value={formData.icon_class} onChange={e => setFormData({ ...formData, icon_class: e.target.value })} placeholder="e.g. brand-aws" />
                </div>
                <div>
                  <label style={labelStyle}>Display Order</label>
                  <input type="number" style={inputStyle} value={formData.display_order} onChange={e => setFormData({ ...formData, display_order: e.target.value })} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="What did you learn?" />
              </div>
            </div>
            
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0 }}>
              <button onClick={closeModal} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSubmit} disabled={saving} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#8b5cf6', color: '#fff', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 7 }}>
                {saving && <Loader2 size={14} className="spin" />} Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

