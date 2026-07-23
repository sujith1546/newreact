const fs = require('fs');

let code = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');

const getBlock = (startRegex, endRegex) => {
    const start = code.search(startRegex);
    if (start === -1) return null;
    const end = code.substring(start).search(endRegex);
    if (end === -1) return null;
    return code.substring(start, start + end);
}

// 1. Replace ProjectsPanel
const projectsOld = getBlock(/function ProjectsPanel\(\) \{/, /\n\}\n\nfunction UpdatesPanel\(\) \{/);
const projectsNew = `function ProjectsPanel() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [form, setForm] = useState({});

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: true });
    if (!error && data) setProjects(data);
    setLoading(false);
  };

  const deleteProject = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (!error) setProjects(projects.filter(p => p.id !== id));
  };

  const openForm = (proj = null) => {
    setEditingProject(proj);
    setForm(proj || { title: '', description: '', tags: '', link: '', github: '', image_url: '', featured: false });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, tags: typeof form.tags === 'string' ? form.tags.split(',').map(t=>t.trim()).filter(Boolean) : form.tags };
    if (editingProject) {
      const { data, error } = await supabase.from('projects').update(payload).eq('id', editingProject.id).select().single();
      if (!error && data) setProjects(projects.map(p => p.id === data.id ? data : p));
    } else {
      const { data, error } = await supabase.from('projects').insert([payload]).select().single();
      if (!error && data) setProjects([...projects, data]);
    }
    setShowForm(false);
  };

  if (loading) return <PanelCard title="Projects"><div style={styles.emptyState}><Loader2 className="spin" size={24} color="var(--text-muted)" /></div></PanelCard>;

  return (
    <>
      <PanelCard title="Projects" action={{ label: "Add project", icon: "ti-plus", onClick: () => openForm() }}>
        <div style={{ padding: '0 20px 20px', display: 'flex', gap: 16, marginBottom: 16 }}>
          <KPICard label="Total Projects" value={projects.length} icon={Briefcase} color="#10b981" />
          <KPICard label="Featured" value={projects.filter(p=>p.featured).length} icon={Star} color="#f59e0b" />
        </div>
        {projects.length === 0 ? (
          <EmptyState icon="ti-briefcase" title="No projects yet" description="Add your first project to get it listed on your portfolio." />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, padding: '0 20px 20px' }}>
            {projects.map(proj => (
              <div key={proj.id} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: 120, background: proj.image_url ? \`url(\${proj.image_url}) center/cover\` : 'linear-gradient(45deg, #10b981, #3b82f6)' }} />
                <div style={{ padding: 16, flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ margin: 0, fontSize: 16, color: 'var(--text-primary)' }}>{proj.title}</h4>
                    {proj.featured && <Star size={16} color="#f59e0b" fill="#f59e0b" />}
                  </div>
                  <p style={{ margin: '8px 0', fontSize: 13, color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{proj.description}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                    {proj.tags?.map(t => <span key={t} style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', padding: '2px 8px', borderRadius: 4, fontSize: 11 }}>{t}</span>)}
                  </div>
                </div>
                <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: 8 }}>
                  <button onClick={() => openForm(proj)} style={{ flex: 1, background: 'var(--bg-secondary)', border: 'none', padding: '6px', borderRadius: 6, cursor: 'pointer', color: 'var(--text-primary)' }}>Edit</button>
                  <button onClick={() => deleteProject(proj.id)} style={{ background: '#ef444420', color: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: 6, cursor: 'pointer' }}><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </PanelCard>
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editingProject ? "Edit Project" : "Add Project"}>
        <form onSubmit={handleSubmit}>
          <FormField label="Title" value={form.title || ''} onChange={e => setForm({...form, title: e.target.value})} required />
          <FormField label="Description" value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} multiline />
          <FormField label="Tags (comma separated)" value={form.tags || ''} onChange={e => setForm({...form, tags: e.target.value})} />
          <FormField label="Image URL" value={form.image_url || ''} onChange={e => setForm({...form, image_url: e.target.value})} />
          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <FormField label="Demo Link" value={form.link || ''} onChange={e => setForm({...form, link: e.target.value})} />
            <FormField label="GitHub" value={form.github || ''} onChange={e => setForm({...form, github: e.target.value})} />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 24, fontSize: 14, color: 'var(--text-primary)' }}>
            <input type="checkbox" checked={form.featured || false} onChange={e => setForm({...form, featured: e.target.checked})} />
            Featured Project
          </label>
          <button type="submit" className="admin-action-btn" style={{ width: '100%', justifyContent: 'center' }}>Save Project</button>
        </form>
      </Modal>
    </>
  );
}`;

if (projectsOld) {
  code = code.replace(projectsOld, projectsNew);
} else {
  console.log("Could not find ProjectsPanel");
}

fs.writeFileSync('src/pages/AdminDashboard.jsx', code);
