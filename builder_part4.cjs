const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');
const getBlock = (startRegex, endRegex) => {
    const start = code.search(startRegex);
    if (start === -1) return null;
    const end = code.substring(start).search(endRegex);
    if (end === -1) return null;
    return code.substring(start, start + end);
}

// 1. Replace CopilotPanel
const copilotOld = getBlock(/function CopilotPanel\(\) \{/, /\n\}\n\n\/\* -+ \*\/\n\/\* 3\. Asset Manager/);
const copilotNew = `function CopilotPanel() {
  const [jdText, setJdText] = useState('');
  const [atsResult, setAtsResult] = useState(null);
  const [loadingAts, setLoadingAts] = useState(false);
  const [topic, setTopic] = useState('');
  const [questions, setQuestions] = useState('');
  const [loadingQ, setLoadingQ] = useState(false);
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [loadingCl, setLoadingCl] = useState(false);

  const askAi = async (promptText) => {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: promptText }] })
      });
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      return data.response || "No response";
    } catch (e) {
      console.error(e);
      return "Error: Could not connect to AI endpoint.";
    }
  };

  const handleRunAtsCheck = async () => {
    if (!jdText) return;
    setLoadingAts(true);
    const prompt = \`Analyze this job description against a standard full-stack developer portfolio. Give me an ATS score (0-100) and list 5 missing keywords. JD: \${jdText}\`;
    const res = await askAi(prompt);
    setAtsResult(res);
    setLoadingAts(false);
  };

  const generateQuestions = async () => {
    if (!topic) return;
    setLoadingQ(true);
    const prompt = \`Generate 5 tough technical interview questions for this topic: \${topic}\`;
    const res = await askAi(prompt);
    setQuestions(res);
    setLoadingQ(false);
  };

  const generateCoverLetter = async () => {
    if (!company || !role) return;
    setLoadingCl(true);
    const prompt = \`Write a professional cover letter for the role of \${role} at \${company} for a full-stack engineer.\`;
    const res = await askAi(prompt);
    setCoverLetter(res);
    setLoadingCl(false);
  };

  return (
    <PanelCard title="AI Copilot">
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ background: 'var(--bg-primary)', padding: 20, borderRadius: 12, border: '1px solid var(--border-color)' }}>
          <h4 style={{ margin: '0 0 16px', color: 'var(--text-primary)' }}>ATS Resume Scanner</h4>
          <FormField label="Job Description" multiline value={jdText} onChange={e=>setJdText(e.target.value)} />
          <button onClick={handleRunAtsCheck} className="admin-action-btn" disabled={loadingAts}>{loadingAts ? 'Scanning...' : 'Analyze'}</button>
          {atsResult && <div style={{ marginTop: 16, padding: 16, background: 'var(--bg-secondary)', borderRadius: 8, whiteSpace: 'pre-wrap', color: 'var(--text-secondary)', fontSize: 14 }}>{atsResult}</div>}
        </div>

        <div style={{ background: 'var(--bg-primary)', padding: 20, borderRadius: 12, border: '1px solid var(--border-color)' }}>
          <h4 style={{ margin: '0 0 16px', color: 'var(--text-primary)' }}>Interview Question Generator</h4>
          <FormField label="Topic (e.g. React hooks, System Design)" value={topic} onChange={e=>setTopic(e.target.value)} />
          <button onClick={generateQuestions} className="admin-action-btn" disabled={loadingQ}>{loadingQ ? 'Generating...' : 'Generate 5 Questions'}</button>
          {questions && <div style={{ marginTop: 16, padding: 16, background: 'var(--bg-secondary)', borderRadius: 8, whiteSpace: 'pre-wrap', color: 'var(--text-secondary)', fontSize: 14 }}>{questions}</div>}
        </div>

        <div style={{ background: 'var(--bg-primary)', padding: 20, borderRadius: 12, border: '1px solid var(--border-color)' }}>
          <h4 style={{ margin: '0 0 16px', color: 'var(--text-primary)' }}>Cover Letter Generator</h4>
          <div style={{ display: 'flex', gap: 16 }}>
            <FormField label="Company" value={company} onChange={e=>setCompany(e.target.value)} />
            <FormField label="Role" value={role} onChange={e=>setRole(e.target.value)} />
          </div>
          <button onClick={generateCoverLetter} className="admin-action-btn" disabled={loadingCl}>{loadingCl ? 'Generating...' : 'Generate Cover Letter'}</button>
          {coverLetter && (
            <div style={{ marginTop: 16, padding: 16, background: 'var(--bg-secondary)', borderRadius: 8 }}>
              <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16 }}>{coverLetter}</div>
              <button onClick={() => navigator.clipboard.writeText(coverLetter)} className="admin-action-btn secondary">Copy</button>
            </div>
          )}
        </div>
      </div>
    </PanelCard>
  );
}`;
if (copilotOld) code = code.replace(copilotOld, copilotNew);

// 2. Replace AssetsPanel
const assetsOld = getBlock(/function AssetsPanel\(\) \{/, /\n\}\n\n\/\* -+ \*\/\n\/\* 4\. Live Portfolio/);
const assetsNew = `function AssetsPanel() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { listFiles(); }, []);

  const listFiles = async () => {
    const { data } = await supabase.storage.from('portfolio-assets').list('', { limit: 100 });
    if (data) setFiles(data.filter(f => f.name !== '.emptyFolderPlaceholder'));
  };

  const getPublicUrl = (name) => supabase.storage.from('portfolio-assets').getPublicUrl(name).data.publicUrl;

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const safeName = \`\${Date.now()}_\${file.name}\`;
    await supabase.storage.from('portfolio-assets').upload(safeName, file);
    await listFiles();
    setUploading(false);
  };

  const handleDelete = async (name) => {
    if (!window.confirm('Delete this file?')) return;
    await supabase.storage.from('portfolio-assets').remove([name]);
    setFiles(f => f.filter(x => x.name !== name));
  };

  return (
    <PanelCard title="Asset Storage" action={{ label: "Upload File", icon: "ti-upload", onClick: () => document.getElementById('file-upload').click() }}>
      <div style={{ padding: 20 }}>
        <input id="file-upload" type="file" style={{ display: 'none' }} onChange={handleUpload} />
        
        <div onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault(); const f=e.dataTransfer.files[0]; if(f){ const i=document.getElementById('file-upload'); const dt=new DataTransfer(); dt.items.add(f); i.files=dt.files; handleUpload({target:i}); }}} style={{ border: '2px dashed var(--border-color)', borderRadius: 12, padding: 40, textAlign: 'center', marginBottom: 24, cursor: 'pointer' }} onClick={() => document.getElementById('file-upload').click()}>
          {uploading ? <Loader2 className="spin" size={32} /> : <Upload size={32} color="var(--primary-blue)" />}
          <p style={{ margin: '16px 0 0', fontWeight: 600, color: 'var(--text-primary)' }}>{uploading ? 'Uploading...' : 'Drag and drop files here or click to upload'}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
          {files.map(f => (
            <div key={f.name} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ height: 120, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {['png','jpg','jpeg','webp','gif'].includes(f.name.split('.').pop()?.toLowerCase()) ? (
                  <img src={getPublicUrl(f.name)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                ) : <FileText size={32} color="var(--text-muted)" />}
              </div>
              <div style={{ padding: 12 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name}</p>
                <p style={{ margin: '4px 0 12px', fontSize: 11, color: 'var(--text-muted)' }}>{(f.metadata?.size / 1024).toFixed(1)} KB</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => navigator.clipboard.writeText(getPublicUrl(f.name))} style={{ flex: 1, background: 'var(--bg-secondary)', border: 'none', padding: '6px', borderRadius: 6, cursor: 'pointer', color: 'var(--text-primary)', fontSize: 12 }}>Copy URL</button>
                  <button onClick={() => handleDelete(f.name)} style={{ background: '#ef444420', color: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: 6, cursor: 'pointer' }}><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PanelCard>
  );
}`;
if (assetsOld) code = code.replace(assetsOld, assetsNew);

fs.writeFileSync('src/pages/AdminDashboard.jsx', code);
