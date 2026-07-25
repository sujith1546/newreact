import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Loader2, Folder, Trash2 } from 'lucide-react';
import { styles, MODAL_STYLES } from '../shared/constants';
import { PanelCard, EmptyState, StatCard } from '../shared/components';

export default function AssetsPanel() {
  const [files,      setFiles]      = useState([]);
  const [uploading,  setUploading]  = useState(false);
  const [copiedUrl,  setCopiedUrl]  = useState('');
  const [deleting,   setDeleting]   = useState(null);
  const [loadingFiles, setLoadingFiles] = useState(true);

  const BUCKET = 'portfolio-assets';

  useEffect(() => { listFiles(); }, []);

  const listFiles = async () => {
    setLoadingFiles(true);
    const { data, error } = await supabase.storage.from(BUCKET).list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });
    if (!error && data) setFiles(data.filter(f => f.name !== '.emptyFolderPlaceholder'));
    setLoadingFiles(false);
  };

  const getPublicUrl = (name) => supabase.storage.from(BUCKET).getPublicUrl(name).data.publicUrl;

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const safeName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const { error } = await supabase.storage.from(BUCKET).upload(safeName, file, { upsert: true });
    if (!error) { await listFiles(); logAuditEvent('UPLOAD_ASSET', 'storage', safeName); }
    else alert(`Upload failed: ${error.message}. Make sure the '${BUCKET}' storage bucket exists in Supabase.`);
    setUploading(false);
    e.target.value = '';
  };

  const handleDelete = async (name) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    setDeleting(name);
    const { error } = await supabase.storage.from(BUCKET).remove([name]);
    if (!error) { setFiles(f => f.filter(x => x.name !== name)); logAuditEvent('DELETE_ASSET', 'storage', name); }
    setDeleting(null);
  };

  const handleCopy = (name) => {
    const url = getPublicUrl(name);
    navigator.clipboard.writeText(url);
    setCopiedUrl(name);
    setTimeout(() => setCopiedUrl(''), 2000);
  };

  const fileIcon = (name) => {
    const ext = name.split('.').pop().toLowerCase();
    if (['png','jpg','jpeg','webp','gif','svg'].includes(ext)) return 'ti-photo';
    if (ext === 'pdf') return 'ti-file-type-pdf';
    return 'ti-file';
  };
  const fileColor = (name) => {
    const ext = name.split('.').pop().toLowerCase();
    if (['png','jpg','jpeg','webp','gif','svg'].includes(ext)) return '#007bff';
    if (ext === 'pdf') return '#ef4444';
    return '#6366f1';
  };
  const fmtSize = (bytes) => bytes < 1024 ? `${bytes} B` : bytes < 1048576 ? `${(bytes/1024).toFixed(1)} KB` : `${(bytes/1048576).toFixed(1)} MB`;

  return (
    <PanelCard title="Asset Storage Manager"
      action={{ label: uploading ? 'Uploading…' : 'Upload File', icon: 'ti-upload', onClick: () => document.getElementById('asset-upload-input').click() }}
    >
      <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <input id="asset-upload-input" type="file" style={{ display: 'none' }} accept="image/*,.pdf,.zip" onChange={handleUpload} />

        {/* Drop zone */}
        <div
          onClick={() => document.getElementById('asset-upload-input').click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); const f=e.dataTransfer.files[0]; if(f){ const inp=document.getElementById('asset-upload-input'); const dt=new DataTransfer(); dt.items.add(f); inp.files=dt.files; handleUpload({target:inp}); } }}
          style={{ border: '2px dashed var(--border-color)', borderRadius: 14, padding: 32, textAlign: 'center', cursor: 'pointer', background: 'var(--bg-primary)', transition: 'border-color 0.2s' }}
        >
          {uploading ? <Loader2 className="spin" size={28} color="#007bff" /> : <Folder size={28} color="#007bff" />}
          <p style={{ margin: '10px 0 4px', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
            {uploading ? 'Uploading to Supabase Storage…' : 'Click or drag & drop files here'}
          </p>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>PNG, JPG, WEBP, PDF, ZIP — up to 50MB</p>
        </div>

        {/* File grid */}
        {loadingFiles ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 30 }}><Loader2 className="spin" size={20} color="var(--text-muted)" /></div>
        ) : files.length === 0 ? (
          <EmptyState icon="ti-folder-open" title="No assets yet" description="Upload images or PDFs above to get started." />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
            {files.map(f => {
              const color = fileColor(f.name);
              return (
                <div key={f.name} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  {/* Preview */}
                  {['png','jpg','jpeg','webp','gif'].includes(f.name.split('.').pop().toLowerCase()) ? (
                    <img src={getPublicUrl(f.name)} alt={f.name} style={{ width: '100%', height: 110, objectFit: 'cover', display: 'block' }} />
                  ) : (
                    <div style={{ height: 80, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className={`ti ${fileIcon(f.name)}`} style={{ fontSize: 32, color }} />
                    </div>
                  )}
                  <div style={{ padding: '10px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={f.name}>{f.name}</p>
                    {f.metadata?.size && <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>{fmtSize(f.metadata.size)}</p>}
                    <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                      <button onClick={() => handleCopy(f.name)} className="admin-action-btn secondary" style={{ flex: 1, justifyContent: 'center', fontSize: 11, padding: '5px 8px', borderRadius: 8 }}>
                        {copiedUrl === f.name ? '✓ Copied' : 'Copy URL'}
                      </button>
                      <button onClick={() => handleDelete(f.name)} disabled={deleting === f.name}
                        style={{ background: '#ef444415', border: '1px solid #ef444430', color: '#ef4444', padding: '5px 8px', borderRadius: 8, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>
                        {deleting === f.name ? '…' : <Trash2 size={12} />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PanelCard>
  );
}

/* -------------------------------------------------------------------- */
/* 4. Live Portfolio Theme & Brand Customizer                            */
