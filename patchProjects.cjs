const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');

const newProjectsPanel = `function ProjectsPanel() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', tags: [], github_url: '', live_url: '', image_url: '', featured: false });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

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

  const toggleFeatured = async (proj) => {
    const { error } = await supabase.from('projects').update({ featured: !proj.featured }).eq('id', proj.id);
    if (!error) {
      setProjects(projects.map(p => p.id === proj.id ? { ...p, featured: !p.featured } : p));
    }
  };

  const openModal = (proj = null) => {
    if (proj) {
      setEditingProject(proj);
      setFormData({ title: proj.title || '', description: proj.description || '', tags: proj.tags || [], github_url: proj.github_url || '', live_url: proj.live_url || '', image_url: proj.image_url || '', featured: proj.featured || false });
    } else {
      setEditingProject(null);
      setFormData({ title: '', description: '', tags: [], github_url: '', live_url: '', image_url: '', featured: false });
    }
    setTagInput('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().replace(/^,|,$/g, '');
      if (val && !formData.tags.includes(val)) {
        setFormData({ ...formData, tags: [...formData.tags, val] });
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tagToRemove) });
  };

  const saveProject = async () => {
    if (!formData.title.trim()) return alert("Title is required");
    
    if (editingProject) {
      const { data, error } = await supabase.from('projects').update(formData).eq('id', editingProject.id).select().single();
      if (!error && data) {
        setProjects(projects.map(p => p.id === data.id ? data : p));
        closeModal();
      }
    } else {
      const { data, error } = await supabase.from('projects').insert([formData]).select().single();
      if (!error && data) {
        setProjects([...projects, data]);
        closeModal();
      }
    }
  };

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.tags && p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  if (loading) return <PanelCard title="Projects"><div style={styles.emptyState}><Loader2 className="spin" size={24} color="var(--text-muted)" /></div></PanelCard>;

  return (
    <>
      <PanelCard title="Projects" action={{ label: "Add project", icon: "ti-plus", onClick: () => openModal() }}>
        
        {projects.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <input 
              type="text" 
              placeholder="Search projects by title or tag..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ ...styles.input, maxWidth: '300px' }}
            />
          </div>
        )}

        {projects.length === 0 ? (
          <EmptyState icon="ti-briefcase" title="No projects yet" description="Add your first project to get it listed on your portfolio." />
        ) : filteredProjects.length === 0 ? (
          <div style={styles.emptyState}>No projects found matching "{searchQuery}"</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Title</th>
                  <th style={styles.th}>Description</th>
                  <th style={styles.th}>Tags</th>
                  <th style={styles.th}>Featured</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map(proj => (
                  <tr key={proj.id} style={{ cursor: 'pointer' }} onDoubleClick={() => openModal(proj)}>
                    <td style={{ ...styles.td, fontWeight: 600 }}>{proj.title}</td>
                    <td style={{ ...styles.td, maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{proj.description || '-'}</td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {proj.tags?.slice(0, 3).map(tag => (
                          <span key={tag} style={{ fontSize: 10, padding: '2px 6px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: 4 }}>{tag}</span>
                        ))}
                        {proj.tags?.length > 3 && <span style={{ fontSize: 10, padding: '2px 4px' }}>+{proj.tags.length - 3}</span>}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <button onClick={(e) => { e.stopPropagation(); toggleFeatured(proj); }} style={{ ...styles.iconBtn, background: proj.featured ? 'rgba(16, 185, 129, 0.1)' : 'transparent' }} title="Toggle Featured">
                        <Star size={16} color={proj.featured ? "var(--success-green, #10b981)" : "var(--text-muted)"} fill={proj.featured ? "var(--success-green, #10b981)" : "none"} />
                      </button>
                    </td>
                    <td style={styles.td}>
                      <button onClick={(e) => { e.stopPropagation(); openModal(proj); }} style={styles.iconBtn} title="Edit"><Edit3 size={16} color="var(--text-secondary)" /></button>
                      <button onClick={(e) => { e.stopPropagation(); deleteProject(proj.id); }} style={{ ...styles.iconBtn, marginLeft: 8 }} title="Delete"><Trash2 size={16} color="#ef4444" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PanelCard>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }} onClick={closeModal}>
          <div style={{ background: 'var(--bg-secondary)', padding: 24, borderRadius: 12, width: '100%', maxWidth: 500, border: '1px solid var(--border-color)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18 }}>{editingProject ? 'Edit Project' : 'Add Project'}</h3>
              <button onClick={closeModal} style={styles.iconBtn}><X size={20} color="var(--text-secondary)" /></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={styles.label}>Project Title</label>
                <input style={styles.input} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. AI Portfolio Generator" />
              </div>
              
              <div>
                <label style={styles.label}>Description</label>
                <textarea style={{ ...styles.input, minHeight: 80, resize: 'vertical' }} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Brief overview of what you built..." />
              </div>

              <div>
                <label style={styles.label}>Tags (Press Enter to add)</label>
                <div style={{ ...styles.input, display: 'flex', flexWrap: 'wrap', gap: 6, padding: '4px 8px', minHeight: 38 }}>
                  {formData.tags.map(tag => (
                    <div key={tag} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '2px 8px', borderRadius: 12, fontSize: 12 }}>
                      {tag}
                      <X size={12} style={{ cursor: 'pointer', opacity: 0.7 }} onClick={() => removeTag(tag)} />
                    </div>
                  ))}
                  <input 
                    style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, minWidth: 60, fontSize: 14, color: 'var(--text-primary)' }}
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder={formData.tags.length === 0 ? "e.g. React, Node.js..." : ""}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>GitHub URL</label>
                  <input style={styles.input} value={formData.github_url} onChange={e => setFormData({...formData, github_url: e.target.value})} placeholder="https://github.com/..." />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Live Demo URL</label>
                  <input style={styles.input} value={formData.live_url} onChange={e => setFormData({...formData, live_url: e.target.value})} placeholder="https://..." />
                </div>
              </div>

              <div>
                <label style={styles.label}>Cover Image URL</label>
                <input style={styles.input} value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} placeholder="https://..." />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <input type="checkbox" id="featured-cb" checked={formData.featured} onChange={e => setFormData({...formData, featured: e.target.checked})} style={{ width: 16, height: 16 }} />
                <label htmlFor="featured-cb" style={{ margin: 0, fontSize: 14, color: 'var(--text-primary)', cursor: 'pointer' }}>Highlight as Featured Project</label>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
              <button onClick={closeModal} style={{ ...styles.btn, background: 'transparent', color: 'var(--text-secondary)' }}>Cancel</button>
              <button onClick={saveProject} style={styles.btnPrimary}>{editingProject ? 'Save Changes' : 'Create Project'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}`;

const oldMatch = code.match(/function ProjectsPanel\(\) \{[\s\S]*?(?=function [A-Z])/);
if (oldMatch) {
  code = code.replace(oldMatch[0], newProjectsPanel + '\n\n');
  fs.writeFileSync('src/pages/AdminDashboard.jsx', code);
  console.log("Successfully replaced ProjectsPanel");
} else {
  console.log("Error finding ProjectsPanel");
}
