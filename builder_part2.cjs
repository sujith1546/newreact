const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');
const getBlock = (startRegex, endRegex) => {
    const start = code.search(startRegex);
    if (start === -1) return null;
    const end = code.substring(start).search(endRegex);
    if (end === -1) return null;
    return code.substring(start, start + end);
}

const expOld = getBlock(/function ExperiencePanel\(\) \{/, /\n\}\n\n\/\* -+ \*\/\n\/\* Utility/);
const expNew = `function ExperiencePanel() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExp, setEditingExp] = useState(null);
  const [form, setForm] = useState({});

  useEffect(() => { fetchExperience(); }, []);

  const fetchExperience = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('experience').select('*').order('display_order', { ascending: true });
    if (!error && data) setExperiences(data);
    setLoading(false);
  };

  const deleteExp = async (id) => {
    if (!window.confirm('Delete this experience?')) return;
    const { error } = await supabase.from('experience').delete().eq('id', id);
    if (!error) setExperiences(experiences.filter(e => e.id !== id));
  };

  const openForm = (exp = null) => {
    setEditingExp(exp);
    setForm(exp ? { ...exp, description_bullets: exp.description_bullets?.join('\\n') || '' } : { role: '', company: '', start_date: '', end_date: '', location: '', description_bullets: '', display_order: 0 });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, description_bullets: typeof form.description_bullets === 'string' ? form.description_bullets.split('\\n').map(s=>s.trim()).filter(Boolean) : form.description_bullets, display_order: parseInt(form.display_order)||0 };
    if (editingExp) {
      const { data, error } = await supabase.from('experience').update(payload).eq('id', editingExp.id).select().single();
      if (!error && data) setExperiences(experiences.map(exp => exp.id === data.id ? data : exp).sort((a,b)=>a.display_order - b.display_order));
    } else {
      const { data, error } = await supabase.from('experience').insert([payload]).select().single();
      if (!error && data) setExperiences([...experiences, data].sort((a,b)=>a.display_order - b.display_order));
    }
    setShowForm(false);
  };

  if (loading) return <PanelCard title="Experience Timeline"><div style={styles.emptyState}><Loader2 className="spin" size={24} color="var(--text-muted)" /></div></PanelCard>;

  return (
    <>
      <PanelCard title="Experience Timeline" action={{ label: "Add Experience", icon: "ti-plus", onClick: () => openForm() }}>
        {experiences.length === 0 ? (
          <EmptyState icon="ti-id-badge" title="No experience entries" description="Add your first experience." />
        ) : (
          <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ position: 'relative', paddingLeft: 16, borderLeft: '2px solid var(--border-color)' }}>
              {experiences.map(exp => (
                <div key={exp.id} style={{ position: 'relative', marginBottom: 24, padding: 16, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12 }}>
                  <div style={{ position: 'absolute', left: -25, top: 20, width: 14, height: 14, borderRadius: '50%', background: 'var(--primary-blue)', border: '3px solid var(--bg-primary)' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: 16, color: 'var(--text-primary)' }}>{exp.role}</h4>
                      <p style={{ margin: '4px 0 0', fontSize: 14, fontWeight: 600, color: 'var(--primary-blue)' }}>{exp.company}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => openForm(exp)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><Edit3 size={14} /></button>
                      <button onClick={() => deleteExp(exp.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><i className="ti ti-calendar" /> {exp.start_date} – {exp.end_date || 'Present'}</span>
                    {exp.location && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><i className="ti ti-map-pin" /> {exp.location}</span>}
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 20, color: 'var(--text-secondary)', fontSize: 13, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {exp.description_bullets?.map((b, i) => <li key={i}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </PanelCard>
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editingExp ? "Edit Experience" : "Add Experience"}>
        <form onSubmit={handleSubmit}>
          <FormField label="Role" value={form.role || ''} onChange={e => setForm({...form, role: e.target.value})} required />
          <FormField label="Company" value={form.company || ''} onChange={e => setForm({...form, company: e.target.value})} required />
          <div style={{ display: 'flex', gap: 16 }}>
            <FormField label="Start Date" value={form.start_date || ''} onChange={e => setForm({...form, start_date: e.target.value})} required />
            <FormField label="End Date" value={form.end_date || ''} onChange={e => setForm({...form, end_date: e.target.value})} />
          </div>
          <FormField label="Location" value={form.location || ''} onChange={e => setForm({...form, location: e.target.value})} />
          <FormField label="Description Bullets (one per line)" value={form.description_bullets || ''} onChange={e => setForm({...form, description_bullets: e.target.value})} multiline />
          <FormField label="Display Order" type="number" value={form.display_order || 0} onChange={e => setForm({...form, display_order: e.target.value})} />
          <button type="submit" className="admin-action-btn" style={{ width: '100%', justifyContent: 'center' }}>Save Experience</button>
        </form>
      </Modal>
    </>
  );
}`;
if (expOld) code = code.replace(expOld, expNew);


const eduOld = getBlock(/function EducationPanel\(\) \{/, /\n\}\n\n\/\* -+ \*\/\n\/\* 1\. Real-Time Visitor Analytics/);
const eduNew = `function EducationPanel() {
  const [edu, setEdu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEdu, setEditingEdu] = useState(null);
  const [form, setForm] = useState({});

  useEffect(() => { fetchEdu(); }, []);

  const fetchEdu = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('education').select('*').order('display_order', { ascending: true });
    if (!error && data) setEdu(data);
    setLoading(false);
  };

  const deleteEdu = async (id) => {
    if (!window.confirm('Delete this education entry?')) return;
    const { error } = await supabase.from('education').delete().eq('id', id);
    if (!error) setEdu(edu.filter(c => c.id !== id));
  };

  const openForm = (item = null) => {
    setEditingEdu(item);
    setForm(item || { institution: '', degree: '', field: '', start_year: '', end_year: '', gpa: '', location: '', display_order: 0 });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, display_order: parseInt(form.display_order)||0 };
    if (editingEdu) {
      const { data, error } = await supabase.from('education').update(payload).eq('id', editingEdu.id).select().single();
      if (!error && data) setEdu(edu.map(c => c.id === data.id ? data : c).sort((a,b)=>a.display_order - b.display_order));
    } else {
      const { data, error } = await supabase.from('education').insert([payload]).select().single();
      if (!error && data) setEdu([...edu, data].sort((a,b)=>a.display_order - b.display_order));
    }
    setShowForm(false);
  };

  if (loading) return <PanelCard title="Education"><div style={styles.emptyState}><Loader2 className="spin" size={24} color="var(--text-muted)" /></div></PanelCard>;

  return (
    <>
      <PanelCard title="Education" action={{ label: "Add Education", icon: "ti-plus", onClick: () => openForm() }}>
        {edu.length === 0 ? (
          <EmptyState icon="ti-book" title="No education" description="Add your educational history." />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, padding: '0 20px 20px' }}>
            {edu.map(item => (
              <div key={item.id} style={{ padding: 20, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 16, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: 'var(--primary-blue)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 16, color: 'var(--text-primary)' }}>{item.institution}</h4>
                    <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--text-secondary)' }}>{item.degree} in {item.field}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => openForm(item)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><Edit3 size={14} /></button>
                    <button onClick={() => deleteEdu(item.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={14} /></button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 12, color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><i className="ti ti-calendar" /> {item.start_year} - {item.end_year}</span>
                  {item.gpa && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><i className="ti ti-award" /> GPA: {item.gpa}</span>}
                  {item.location && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><i className="ti ti-map-pin" /> {item.location}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </PanelCard>
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editingEdu ? "Edit Education" : "Add Education"}>
        <form onSubmit={handleSubmit}>
          <FormField label="Institution" value={form.institution || ''} onChange={e => setForm({...form, institution: e.target.value})} required />
          <div style={{ display: 'flex', gap: 16 }}>
            <FormField label="Degree" value={form.degree || ''} onChange={e => setForm({...form, degree: e.target.value})} required />
            <FormField label="Field" value={form.field || ''} onChange={e => setForm({...form, field: e.target.value})} required />
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <FormField label="Start Year" value={form.start_year || ''} onChange={e => setForm({...form, start_year: e.target.value})} />
            <FormField label="End Year" value={form.end_year || ''} onChange={e => setForm({...form, end_year: e.target.value})} />
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <FormField label="GPA" value={form.gpa || ''} onChange={e => setForm({...form, gpa: e.target.value})} />
            <FormField label="Location" value={form.location || ''} onChange={e => setForm({...form, location: e.target.value})} />
          </div>
          <FormField label="Display Order" type="number" value={form.display_order || 0} onChange={e => setForm({...form, display_order: e.target.value})} />
          <button type="submit" className="admin-action-btn" style={{ width: '100%', justifyContent: 'center' }}>Save Education</button>
        </form>
      </Modal>
    </>
  );
}`;
if (eduOld) code = code.replace(eduOld, eduNew);

const certOld = getBlock(/function CertificationsPanel\(\) \{/, /\n\}\n\n\/\* -+ \*\/\n\/\* Education Panel/);
const certNew = `function CertificationsPanel() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCert, setEditingCert] = useState(null);
  const [form, setForm] = useState({});

  useEffect(() => { fetchCerts(); }, []);

  const fetchCerts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('certifications').select('*').order('display_order', { ascending: true });
    if (!error && data) setCerts(data);
    setLoading(false);
  };

  const deleteCert = async (id) => {
    if (!window.confirm('Delete this certification?')) return;
    const { error } = await supabase.from('certifications').delete().eq('id', id);
    if (!error) setCerts(certs.filter(c => c.id !== id));
  };

  const openForm = (cert = null) => {
    setEditingCert(cert);
    setForm(cert || { name: '', issuer: '', date: '', credential_url: '', image_url: '', display_order: 0 });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, display_order: parseInt(form.display_order)||0 };
    if (editingCert) {
      const { data, error } = await supabase.from('certifications').update(payload).eq('id', editingCert.id).select().single();
      if (!error && data) setCerts(certs.map(c => c.id === data.id ? data : c).sort((a,b)=>a.display_order - b.display_order));
    } else {
      const { data, error } = await supabase.from('certifications').insert([payload]).select().single();
      if (!error && data) setCerts([...certs, data].sort((a,b)=>a.display_order - b.display_order));
    }
    setShowForm(false);
  };

  if (loading) return <PanelCard title="Certifications"><div style={styles.emptyState}><Loader2 className="spin" size={24} color="var(--text-muted)" /></div></PanelCard>;

  return (
    <>
      <PanelCard title="Certifications" action={{ label: "Add", icon: "ti-plus", onClick: () => openForm() }}>
        {certs.length === 0 ? (
          <EmptyState icon="ti-certificate" title="No certifications" description="Add your first certification." />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16, padding: '0 20px 20px' }}>
            {certs.map(cert => (
              <div key={cert.id} style={{ display: 'flex', flexDirection: 'column', padding: 16, background: 'linear-gradient(145deg, var(--bg-primary), var(--bg-secondary))', border: '1px solid var(--border-color)', borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {cert.image_url ? <img src={cert.image_url} alt={cert.issuer} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <Award size={24} color="var(--primary-blue)" />}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => openForm(cert)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><Edit3 size={14} /></button>
                    <button onClick={() => deleteCert(cert.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={14} /></button>
                  </div>
                </div>
                <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{cert.name}</h4>
                <p style={{ margin: '4px 0 12px', fontSize: 13, color: 'var(--text-secondary)' }}>{cert.issuer}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{cert.date}</span>
                  {cert.credential_url && <a href={cert.credential_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--primary-blue)', textDecoration: 'none', fontWeight: 600 }}>Verify</a>}
                </div>
              </div>
            ))}
          </div>
        )}
      </PanelCard>
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editingCert ? "Edit Certification" : "Add Certification"}>
        <form onSubmit={handleSubmit}>
          <FormField label="Name" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} required />
          <FormField label="Issuer" value={form.issuer || ''} onChange={e => setForm({...form, issuer: e.target.value})} required />
          <FormField label="Date" value={form.date || ''} onChange={e => setForm({...form, date: e.target.value})} />
          <FormField label="Credential URL" value={form.credential_url || ''} onChange={e => setForm({...form, credential_url: e.target.value})} />
          <FormField label="Image/Logo URL" value={form.image_url || ''} onChange={e => setForm({...form, image_url: e.target.value})} />
          <FormField label="Display Order" type="number" value={form.display_order || 0} onChange={e => setForm({...form, display_order: e.target.value})} />
          <button type="submit" className="admin-action-btn" style={{ width: '100%', justifyContent: 'center' }}>Save Certification</button>
        </form>
      </Modal>
    </>
  );
}`;
if (certOld) code = code.replace(certOld, certNew);
fs.writeFileSync('src/pages/AdminDashboard.jsx', code);
