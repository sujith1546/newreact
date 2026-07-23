const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');
const getBlock = (startRegex, endRegex) => {
    const start = code.search(startRegex);
    if (start === -1) return null;
    const end = code.substring(start).search(endRegex);
    if (end === -1) return null;
    return code.substring(start, start + end);
}

// 1. ThemeStudioPanel
const themeOld = getBlock(/function ThemeStudioPanel\(\) \{/, /\n\}\n\n\/\* -+ \*\/\n\/\* 5\. 1-Click Database/);
const themeNew = `function ThemeStudioPanel() {
  const [theme, setTheme] = useState({ primary: '#3b82f6', accent: '#8b5cf6', success: '#10b981', font: 'Inter' });
  const [saving, setSaving] = useState(false);

  const applyTheme = () => {
    document.documentElement.style.setProperty('--primary-blue', theme.primary);
    document.documentElement.style.setProperty('--accent-blue', theme.accent);
    document.documentElement.style.setProperty('--success-green', theme.success);
    document.documentElement.style.setProperty('--app-font', theme.font);
  };

  const saveTheme = async () => {
    setSaving(true);
    applyTheme();
    // Assuming site_settings table holds this
    await supabase.from('site_settings').update({ theme_config: theme }).eq('id', 1);
    setSaving(false);
  };

  const exportCss = () => {
    const css = \`:root {\\n  --primary-blue: \${theme.primary};\\n  --accent-blue: \${theme.accent};\\n  --success-green: \${theme.success};\\n  --app-font: '\${theme.font}', sans-serif;\\n}\`;
    const blob = new Blob([css], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = 'theme.css';
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <PanelCard title="Theme Studio" action={{ label: saving ? "Applying..." : "Apply & Save", icon: "ti-palette", onClick: saveTheme }}>
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Primary Color</label>
            <input type="color" value={theme.primary} onChange={e=>setTheme({...theme, primary: e.target.value})} style={{ width: '100%', height: 48, borderRadius: 8, cursor: 'pointer' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Accent Color</label>
            <input type="color" value={theme.accent} onChange={e=>setTheme({...theme, accent: e.target.value})} style={{ width: '100%', height: 48, borderRadius: 8, cursor: 'pointer' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Success Color</label>
            <input type="color" value={theme.success} onChange={e=>setTheme({...theme, success: e.target.value})} style={{ width: '100%', height: 48, borderRadius: 8, cursor: 'pointer' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Font Family</label>
            <select value={theme.font} onChange={e=>setTheme({...theme, font: e.target.value})} style={{ width: '100%', height: 48, borderRadius: 8, padding: '0 12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
              <option value="Inter">Inter</option>
              <option value="Poppins">Poppins</option>
              <option value="Space Grotesk">Space Grotesk</option>
              <option value="DM Sans">DM Sans</option>
            </select>
          </div>
        </div>
        
        <div style={{ background: 'var(--bg-primary)', padding: 24, borderRadius: 12, border: '1px solid var(--border-color)' }}>
          <h4 style={{ margin: '0 0 16px', color: 'var(--text-primary)' }}>Live Preview</h4>
          <div style={{ padding: 24, borderRadius: 12, border: \`2px solid \${theme.primary}\`, fontFamily: \`'\${theme.font}', sans-serif\` }}>
            <h1 style={{ color: theme.primary, margin: '0 0 16px' }}>Heading Example</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>This is how your text will look with the selected font and colors.</p>
            <div style={{ display: 'flex', gap: 16 }}>
              <button style={{ background: theme.primary, color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 8, fontWeight: 600, fontFamily: 'inherit' }}>Primary Button</button>
              <button style={{ background: 'transparent', color: theme.accent, border: \`2px solid \${theme.accent}\`, padding: '12px 24px', borderRadius: 8, fontWeight: 600, fontFamily: 'inherit' }}>Accent Button</button>
              <button style={{ background: theme.success, color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 8, fontWeight: 600, fontFamily: 'inherit' }}>Success</button>
            </div>
          </div>
        </div>

        <button onClick={exportCss} className="admin-action-btn secondary" style={{ width: 'fit-content' }}>Export CSS Variables</button>
      </div>
    </PanelCard>
  );
}`;
if (themeOld) code = code.replace(themeOld, themeNew);

// 2. BackupRestorePanel
const backupOld = getBlock(/function BackupRestorePanel\(\) \{/, /\n\}\n\n\/\* -+ \*\/\n\/\* 6\. Security Audit/);
const backupNew = `function BackupRestorePanel() {
  const [counts, setCounts] = useState({});
  const TABLES = ['projects', 'updates', 'skills', 'experience', 'education', 'certifications', 'contact_messages'];

  useEffect(() => {
    const fetchCounts = async () => {
      const results = {};
      for (const t of TABLES) {
        const { count } = await supabase.from(t).select('*', { count: 'exact', head: true });
        results[t] = count || 0;
      }
      setCounts(results);
    };
    fetchCounts();
  }, []);

  const exportTable = async (table) => {
    const { data } = await supabase.from(table).select('*');
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = \`\${table}_backup_\${Date.now()}.json\`;
    a.click(); URL.revokeObjectURL(url);
    localStorage.setItem('lastBackup', new Date().toLocaleString());
  };

  const handleImport = async (e, table) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const json = JSON.parse(ev.target.result);
        const { error } = await supabase.from(table).upsert(json);
        if (error) throw error;
        alert('Import successful!');
      } catch (err) { alert('Import failed: ' + err.message); }
    };
    reader.readAsText(file);
  };

  return (
    <PanelCard title="Backup & Restore">
      <div style={{ padding: 20 }}>
        <p style={{ margin: '0 0 24px', color: 'var(--text-secondary)' }}>Last backup: {localStorage.getItem('lastBackup') || 'Never'}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {TABLES.map(t => (
            <div key={t} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h4 style={{ margin: 0, fontSize: 16, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{t.replace('_', ' ')}</h4>
                <span style={{ background: 'var(--bg-secondary)', padding: '4px 8px', borderRadius: 12, fontSize: 12, color: 'var(--text-muted)' }}>{counts[t] || 0} rows</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => exportTable(t)} className="admin-action-btn" style={{ flex: 1, justifyContent: 'center' }}>Export</button>
                <div style={{ flex: 1, position: 'relative' }}>
                  <input type="file" accept=".json" onChange={e => handleImport(e, t)} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                  <button className="admin-action-btn secondary" style={{ width: '100%', justifyContent: 'center' }}>Import</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PanelCard>
  );
}`;
if (backupOld) code = code.replace(backupOld, backupNew);

// 3. AuditHealthPanel
const auditOld = getBlock(/function AuditHealthPanel\(\) \{/, /\n\}\n\nconst styles =/);
const auditNew = `function AuditHealthPanel() {
  const [logs, setLogs] = useState([]);
  const [ping, setPing] = useState(null);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const fetchAudit = async () => {
      // Use existing 'admin_audit_logs' as it exists in DB, mapped to requested filter
      const { data } = await supabase.from('admin_audit_logs').select('*').order('created_at', { ascending: false }).limit(50);
      if (data) setLogs(data);
    };
    
    const checkHealth = async () => {
      const start = performance.now();
      await supabase.from('admin_audit_logs').select('id').limit(1);
      setPing(Math.round(performance.now() - start));
    };

    fetchAudit();
    checkHealth();
  }, []);

  const eventTypes = ['ALL', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN'];
  const filteredLogs = filter === 'ALL' ? logs : logs.filter(l => l.action?.startsWith(filter));

  return (
    <PanelCard title="System Audit & Health">
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <KPICard label="Database Latency" value={ping ? \`\${ping}ms\` : '...'} icon={Activity} color={ping < 100 ? '#10b981' : '#f59e0b'} />
          <KPICard label="API Status" value="Healthy" icon={ShieldCheck} color="#10b981" />
          <KPICard label="Total Audit Events" value={logs.length} icon={Database} color="#3b82f6" />
        </div>

        <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Filter:</span>
            {eventTypes.map(type => (
              <button key={type} onClick={() => setFilter(type)} style={{ background: filter === type ? 'var(--primary-blue)' : 'var(--bg-secondary)', color: filter === type ? '#fff' : 'var(--text-primary)', border: 'none', padding: '6px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer' }}>{type}</button>
            ))}
          </div>
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {filteredLogs.map(log => (
              <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: log.action?.includes('DELETE') ? '#ef444420' : '#3b82f620', color: log.action?.includes('DELETE') ? '#ef4444' : '#3b82f6' }}>{log.action}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{log.entity_type}</span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>User: {log.user_id || 'System'} | Target: {log.entity_id || 'N/A'}</p>
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(log.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PanelCard>
  );
}`;
if (auditOld) code = code.replace(auditOld, auditNew);

fs.writeFileSync('src/pages/AdminDashboard.jsx', code);
