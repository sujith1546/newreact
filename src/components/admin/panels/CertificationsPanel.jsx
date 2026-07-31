import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Loader2, Award, ExternalLink, Edit3, Trash2, X } from 'lucide-react';
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

  const modalOverlay = { position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' };
  const modalBox = { background: 'var(--pcms-panel)', border: '1px solid var(--pcms-line)', borderRadius: '14px', width: '100%', maxWidth: '580px', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column' };
  const labelStyle = { fontSize: 10.5, fontWeight: 700, color: 'var(--pcms-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 5 };
  const inputStyle = { ...styles.input, background: 'var(--pcms-panel)' };

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
                  <tr key={cert.id} style={{ background: i % 2 === 0 ? 'transparent' : 'var(--pcms-panel-2)' }}>
                    <td style={styles.td}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(249,115,22,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {cert.icon_class ? <i className={`ti ti-${cert.icon_class}`} style={{ fontSize: 19, color: '#F97316' }} /> : <Award size={18} color="#F97316" />}
                      </div>
                    </td>
                    <td style={{ ...styles.td, fontWeight: 600, color: 'var(--pcms-text)' }}>
                      {cert.credential_url ? (
                        <a href={cert.credential_url} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          {cert.title} <ExternalLink size={12} style={{ color: 'var(--pcms-accent)' }}/>
                        </a>
                      ) : cert.title}
                    </td>
                    <td style={{ ...styles.td, color: 'var(--pcms-muted)' }}>{cert.issuer}</td>
                    <td style={{ ...styles.td, color: 'var(--pcms-muted)' }}>
                      <span className="pcms-badge pcms-badge-green" style={{ fontSize: 10 }}>Active</span> {cert.date}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                        <button onClick={() => openModal(cert)} className="pcms-icon-btn edit"><Edit3 size={14} /></button>
                        <button onClick={() => handleDelete(cert.id, cert.title)} className="pcms-icon-btn danger"><Trash2 size={14} /></button>
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
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(249,115,22,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Award size={15} color="#F97316" /></div>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--pcms-text)', fontFamily: "'Space Grotesk', sans-serif" }}>{editingCert ? 'Edit Certification' : 'New Certification'}</p>
                </div>
              </div>
              <button onClick={closeModal} className="pcms-icon-btn"><X size={18} /></button>
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

