const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');
const getBlock = (startRegex, endRegex) => {
    const start = code.search(startRegex);
    if (start === -1) return null;
    const end = code.substring(start).search(endRegex);
    if (end === -1) return null;
    return code.substring(start, start + end);
}

const updatesOld = getBlock(/function UpdatesPanel\(\) \{/, /\n\}\n\nfunction AiChatsPanel\(\) \{/);
const updatesNew = `function UpdatesPanel() {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState(null);
  const [form, setForm] = useState({});

  useEffect(() => { fetchUpdates(); }, []);

  const fetchUpdates = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('updates').select('*').order('created_at', { ascending: false });
    if (!error && data) setUpdates(data);
    setLoading(false);
  };

  const deleteUpdate = async (id) => {
    if (!window.confirm('Delete this update?')) return;
    const { error } = await supabase.from('updates').delete().eq('id', id);
    if (!error) setUpdates(updates.filter(u => u.id !== id));
  };

  const openForm = (update = null) => {
    setEditingUpdate(update);
    setForm(update ? { ...update, items: update.items?.join('\\n') || '' } : { version: '', label: 'new', date: new Date().toISOString().split('T')[0], items: '' });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, items: typeof form.items === 'string' ? form.items.split('\\n').map(i=>i.trim()).filter(Boolean) : form.items };
    if (editingUpdate) {
      const { data, error } = await supabase.from('updates').update(payload).eq('id', editingUpdate.id).select().single();
      if (!error && data) setUpdates(updates.map(u => u.id === data.id ? data : u));
    } else {
      const { data, error } = await supabase.from('updates').insert([payload]).select().single();
      if (!error && data) setUpdates([data, ...updates]);
    }
    setShowForm(false);
  };

  const getLabelColor = (lbl) => {
    switch (lbl) {
      case 'new': return '#10b981';
      case 'fix': return '#ef4444';
      case 'improvement': return '#3b82f6';
      case 'breaking': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  if (loading) return <PanelCard title="Changelog updates"><div style={styles.emptyState}><Loader2 className="spin" size={24} color="var(--text-muted)" /></div></PanelCard>;

  return (
    <>
      <PanelCard title="Changelog updates" action={{ label: "Add update", icon: "ti-plus", onClick: () => openForm() }}>
        {updates.length === 0 ? (
          <EmptyState icon="ti-bolt" title="No changelog entries yet" description="Log a new update whenever you ship a feature or fix." />
        ) : (
          <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {updates.map(update => (
              <div key={update.id} style={{ display: 'flex', gap: 16, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 16 }}>
                <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: getLabelColor(update.label) }} />
                  <div style={{ flex: 1, width: 2, background: 'var(--border-color)', marginTop: 8 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <h4 style={{ margin: 0, fontSize: 16, color: 'var(--text-primary)' }}>{update.version}</h4>
                        <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: \`\${getLabelColor(update.label)}20\`, color: getLabelColor(update.label), textTransform: 'uppercase' }}>{update.label}</span>
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>{update.date}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => openForm(update)} style={{ background: 'var(--bg-secondary)', border: 'none', padding: '6px', borderRadius: 6, cursor: 'pointer', color: 'var(--text-primary)' }}>Edit</button>
                      <button onClick={() => deleteUpdate(update.id)} style={{ background: '#ef444420', color: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: 6, cursor: 'pointer' }}><Trash2 size={16} /></button>
                    </div>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 20, color: 'var(--text-secondary)', fontSize: 14 }}>
                    {update.items?.map((item, i) => <li key={i} style={{ marginBottom: 4 }}>{item}</li>)}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </PanelCard>
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editingUpdate ? "Edit Update" : "Add Update"}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <FormField label="Version" value={form.version || ''} onChange={e => setForm({...form, version: e.target.value})} required />
            <FormField label="Date" type="date" value={form.date || ''} onChange={e => setForm({...form, date: e.target.value})} required />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Label</label>
            <select value={form.label || 'new'} onChange={e => setForm({...form, label: e.target.value})} style={{ padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}>
              <option value="new">New</option>
              <option value="fix">Fix</option>
              <option value="improvement">Improvement</option>
              <option value="breaking">Breaking</option>
            </select>
          </div>
          <FormField label="Items (one per line)" value={form.items || ''} onChange={e => setForm({...form, items: e.target.value})} multiline required />
          <button type="submit" className="admin-action-btn" style={{ width: '100%', justifyContent: 'center' }}>Save Update</button>
        </form>
      </Modal>
    </>
  );
}`;
if (updatesOld) code = code.replace(updatesOld, updatesNew);

const skillsOld = getBlock(/function SkillsPanel\(\) \{/, /\n\}\n\n\/\* -+ \*\/\n\/\* Experience Panel/);
const skillsNew = `function SkillsPanel() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [form, setForm] = useState({});

  useEffect(() => { fetchSkills(); }, []);

  const fetchSkills = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('skills').select('*').order('created_at', { ascending: true });
    if (!error && data) setSkills(data);
    setLoading(false);
  };

  const deleteSkill = async (id) => {
    if (!window.confirm('Delete this skill?')) return;
    const { error } = await supabase.from('skills').delete().eq('id', id);
    if (!error) setSkills(skills.filter(s => s.id !== id));
  };

  const openForm = (skill = null) => {
    setEditingSkill(skill);
    setForm(skill || { name: '', level: 50, category: 'Frontend' });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingSkill) {
      const { data, error } = await supabase.from('skills').update(form).eq('id', editingSkill.id).select().single();
      if (!error && data) setSkills(skills.map(s => s.id === data.id ? data : s));
    } else {
      const { data, error } = await supabase.from('skills').insert([form]).select().single();
      if (!error && data) setSkills([...skills, data]);
    }
    setShowForm(false);
  };

  const categories = ['Frontend', 'Backend', 'AI/ML', 'Tools'];
  
  if (loading) return <PanelCard title="Skills Inventory"><div style={styles.emptyState}><Loader2 className="spin" size={24} color="var(--text-muted)" /></div></PanelCard>;

  return (
    <>
      <PanelCard title="Skills Inventory" action={{ label: "Add Skill", icon: "ti-plus", onClick: () => openForm() }}>
        <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {categories.map(cat => {
            const catSkills = skills.filter(s => s.category === cat);
            if (catSkills.length === 0) return null;
            return (
              <div key={cat}>
                <h3 style={{ margin: '0 0 16px', fontSize: 16, color: 'var(--text-primary)' }}>{cat}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                  {catSkills.map(skill => (
                    <div key={skill.id} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <h4 style={{ margin: 0, fontSize: 15, color: 'var(--text-primary)' }}>{skill.name}</h4>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => openForm(skill)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><Edit3 size={14} /></button>
                          <button onClick={() => deleteSkill(skill.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={14} /></button>
                        </div>
                      </div>
                      <div style={{ width: '100%', height: 8, background: 'var(--bg-secondary)', borderRadius: 4, overflow: 'hidden' }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: \`\${skill.level}%\` }} transition={{ duration: 1 }} style={{ height: '100%', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' }} />
                      </div>
                      <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--text-muted)', textAlign: 'right' }}>{skill.level}%</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </PanelCard>
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editingSkill ? "Edit Skill" : "Add Skill"}>
        <form onSubmit={handleSubmit}>
          <FormField label="Name" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} required />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Category</label>
            <select value={form.category || 'Frontend'} onChange={e => setForm({...form, category: e.target.value})} style={{ padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <FormField label="Level (0-100)" type="number" value={form.level || 50} onChange={e => setForm({...form, level: parseInt(e.target.value)})} required />
          <button type="submit" className="admin-action-btn" style={{ width: '100%', justifyContent: 'center' }}>Save Skill</button>
        </form>
      </Modal>
    </>
  );
}`;
if (skillsOld) code = code.replace(skillsOld, skillsNew);
fs.writeFileSync('src/pages/AdminDashboard.jsx', code);
