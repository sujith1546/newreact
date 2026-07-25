import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Loader2, Download, Upload } from 'lucide-react';
import { styles, MODAL_STYLES } from '../shared/constants';
import { PanelCard, EmptyState, StatCard } from '../shared/components';

export default function BackupRestorePanel() {
  const [exporting,  setExporting]  = useState(false);
  const [importing,  setImporting]  = useState(false);
  const [importInfo, setImportInfo] = useState(null);
  const [importErr,  setImportErr]  = useState(null);
  const [history,    setHistory]    = useState(() => {
    try { return JSON.parse(localStorage.getItem('backup_history') || '[]'); } catch { return []; }
  });

  const TABLES = ['site_settings','experience','skills','education','certifications','projects','updates'];

  const handleExport = async () => {
    setExporting(true);
    const results = await Promise.all(TABLES.map(t => supabase.from(t).select('*').then(r => [t, r.data || []])));
    const data = Object.fromEntries(results);
    const payload = { version: '2.0', exported_at: new Date().toISOString(), tables: TABLES, data };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `portfolio_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click(); URL.revokeObjectURL(url);
    const entry = { date: new Date().toISOString(), tables: TABLES.length, size: `${(blob.size/1024).toFixed(1)} KB` };
    const newHistory = [entry, ...history].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem('backup_history', JSON.stringify(newHistory));
    logAuditEvent('EXPORT_DATABASE_BACKUP', 'system', 'all');
    setExporting(false);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    setImportErr(null); setImportInfo(null);
    if (!file) return;
    setImporting(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target.result);
        if (!json.version || !json.data) throw new Error('Invalid backup format.');
        const tableCount = Object.keys(json.data).length;
        const rowCount   = Object.values(json.data).reduce((s, rows) => s + (rows?.length || 0), 0);
        setImportInfo({ version: json.version, exported_at: json.exported_at, tableCount, rowCount, ready: true });
      } catch (err) { setImportErr(err.message); }
      setImporting(false);
    };
    reader.readAsText(file);
  };

  return (
    <PanelCard title="Backup & Restore Utility">
      <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 22 }}>

        {/* Export */}
        <div style={{ padding: '20px 22px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Export Full Database Backup</p>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>Downloads a JSON snapshot of all {TABLES.length} tables — skills, projects, education, experience, settings.</p>
          </div>
          <button onClick={handleExport} disabled={exporting} className="admin-action-btn" style={{ flexShrink: 0 }}>
            {exporting ? <Loader2 className="spin" size={14} /> : <Download size={14} />}
            {exporting ? 'Exporting…' : 'Download .JSON'}
          </button>
        </div>

        {/* Backup history */}
        {history.length > 0 && (
          <div>
            <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', color: 'var(--text-muted)' }}>Recent Backups (local)</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {history.map((h, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 9, fontSize: 12 }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{new Date(h.date).toLocaleDateString()} {new Date(h.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{h.tables} tables · {h.size}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Import / Restore */}
        <div style={{ padding: '20px 22px', background: 'var(--bg-primary)', border: '1.5px dashed var(--border-color)', borderRadius: 14 }}>
          <p style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Validate & Restore Backup</p>
          <p style={{ margin: '0 0 14px', fontSize: 12, color: 'var(--text-muted)' }}>Upload a backup JSON — it will be validated and you can preview contents before restoring.</p>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 7, cursor: 'pointer' }}>
            <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
            <span className="admin-action-btn secondary" style={{ pointerEvents: 'none' }}>
              {importing ? <Loader2 className="spin" size={13} /> : <Upload size={13} />}
              {importing ? 'Reading file…' : 'Choose backup.json'}
            </span>
          </label>

          {importErr && <p style={{ marginTop: 12, fontSize: 12, color: '#ef4444', fontWeight: 600 }}>❌ {importErr}</p>}

          {importInfo && (
            <div style={{ marginTop: 14, padding: '14px 16px', background: '#28a74510', border: '1.5px solid #28a74540', borderRadius: 10 }}>
              <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: '#28a745' }}>✅ Valid Backup — v{importInfo.version}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {[['Exported', new Date(importInfo.exported_at).toLocaleDateString()],
                  ['Tables', importInfo.tableCount],
                  ['Total Rows', importInfo.rowCount]
                ].map(([k,v]) => (
                  <div key={k}>
                    <p style={{ margin: 0, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>{k}</p>
                    <p style={{ margin: '3px 0 0', fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>{v}</p>
                  </div>
                ))}
              </div>
              <p style={{ margin: '12px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>⚠️ To restore, use the Supabase dashboard SQL editor and paste the relevant table data.</p>
            </div>
          )}
        </div>

      </div>
    </PanelCard>
  );
}

/* -------------------------------------------------------------------- */
/* 6. Security Audit Trail & System Health Monitor                       */
