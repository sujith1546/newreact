const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');
const getBlock = (startRegex, endRegex) => {
    const start = code.search(startRegex);
    if (start === -1) return null;
    const end = code.substring(start).search(endRegex);
    if (end === -1) return null;
    return code.substring(start, start + end);
}

const aichatsOld = getBlock(/function AiChatsPanel\(\) \{/, /\n\}\n\n\/\* -+ \*\/\n\/\* Site Settings Panel/);
const aichatsNew = `function AiChatsPanel() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    // Fetch sessions
    const { data: sessData, error: sessErr } = await supabase.from('chat_sessions').select('*').order('created_at', { ascending: false });
    // Fetch all messages to calculate counts and get first message
    const { data: msgData } = await supabase.from('chat_messages').select('session_id, content, created_at, role').order('created_at', { ascending: true });
    
    if (!sessErr && sessData) {
      const enriched = sessData.map(s => {
        const sMsgs = msgData?.filter(m => m.session_id === s.id) || [];
        return {
          ...s,
          msgCount: sMsgs.length,
          firstMessage: sMsgs.find(m => m.role === 'user')?.content || 'No user messages',
          duration: sMsgs.length > 1 ? Math.round((new Date(sMsgs[sMsgs.length-1].created_at) - new Date(sMsgs[0].created_at))/1000) : 0
        };
      });
      setSessions(enriched);
    }
    setLoading(false);
  };

  const loadMessages = async (sessionId) => {
    setSelectedSession(sessionId);
    setLoadingMessages(true);
    const { data, error } = await supabase.from('chat_messages').select('*').eq('session_id', sessionId).order('created_at', { ascending: true });
    if (!error && data) setMessages(data);
    setLoadingMessages(false);
  };

  const exportChat = () => {
    if (!messages.length) return;
    const text = messages.map(m => \`[\${new Date(m.created_at).toLocaleString()}] \${m.role.toUpperCase()}: \\n\${m.content}\\n\`).join('\\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = \`chat_export_\${selectedSession}.txt\`;
    a.click(); URL.revokeObjectURL(url);
  };

  const deleteSession = async (id) => {
    if (!window.confirm('Delete session?')) return;
    const { error } = await supabase.from('chat_sessions').delete().eq('id', id);
    if (!error) {
      setSessions(sessions.filter(s => s.id !== id));
      if (selectedSession === id) setSelectedSession(null);
    }
  };

  const filteredSessions = sessions.filter(s => s.id.includes(search) || s.firstMessage.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <PanelCard title="AI Telemetry Logs"><div style={styles.emptyState}><Loader2 className="spin" size={24} color="var(--text-muted)" /></div></PanelCard>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: 'calc(100vh - 120px)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <KPICard label="Total Sessions" value={sessions.length} icon={MessageSquare} color="#3b82f6" />
        <KPICard label="Active Today" value={sessions.filter(s => new Date(s.created_at).toDateString() === new Date().toDateString()).length} icon={Sparkles} color="#10b981" />
        <div style={{ background: 'var(--bg-light)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>Telemetry automatically logs every conversation processed by your Groq AI Integration.</div>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, background: 'var(--bg-light)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        <div style={{ width: '350px', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
            <input type="text" placeholder="Search sessions..." value={search} onChange={e=>setSearch(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredSessions.map(s => (
              <div key={s.id} onClick={() => loadMessages(s.id)} style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', background: selectedSession === s.id ? 'var(--bg-accent)' : 'transparent', transition: 'background 0.2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Visitor</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(s.created_at).toLocaleDateString()}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.firstMessage}</div>
                <div style={{ display: 'flex', gap: 8, fontSize: 10, color: 'var(--text-muted)' }}>
                  <span style={{ background: 'var(--bg-primary)', padding: '2px 6px', borderRadius: 4, border: '1px solid var(--border-color)' }}>{s.msgCount} msgs</span>
                  <span style={{ background: 'var(--bg-primary)', padding: '2px 6px', borderRadius: 4, border: '1px solid var(--border-color)' }}>{s.duration}s</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-light)' }}>
          {selectedSession ? (
            <>
              <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: 15, color: 'var(--text-primary)' }}>Chat Transcript</h4>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: 4 }}>{selectedSession}</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={exportChat} style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Export TXT</button>
                  <button onClick={() => deleteSession(selectedSession)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Delete</button>
                </div>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {loadingMessages ? (
                  <div style={{ display: 'flex', justifyContent: 'center' }}><Loader2 className="spin" size={24} color="var(--primary-blue)" /></div>
                ) : (
                  messages.map(msg => (
                    <div key={msg.id} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '75%', background: msg.role === 'user' ? 'var(--primary-blue)' : 'var(--bg-accent)', color: msg.role === 'user' ? '#fff' : 'var(--text-primary)', padding: '14px 18px', borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6, color: msg.role === 'user' ? 'rgba(255,255,255,0.7)' : 'var(--primary-blue)', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{msg.role === 'user' ? 'Visitor' : 'AI Assistant'}</span>
                        <span>{new Date(msg.created_at).toLocaleTimeString()}</span>
                      </div>
                      <div style={{ fontSize: 14, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <MessageSquare size={48} opacity={0.2} style={{ marginBottom: 16 }} />
              <p style={{ fontSize: 15, fontWeight: 500 }}>Select a session to view transcript</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}`;
if (aichatsOld) code = code.replace(aichatsOld, aichatsNew);

const analyticsOld = getBlock(/function AnalyticsPanel\(\) \{/, /\n\}\n\n\/\* -+ \*\/\n\/\* 2\. AI Content Copilot/);
const analyticsNew = `function AnalyticsPanel() {
  const [analytics, setAnalytics] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const [anaRes, evRes] = await Promise.all([
      supabase.from('page_views').select('*').order('created_at', { ascending: false }).limit(200),
      supabase.from('recruiter_events').select('*').order('created_at', { ascending: false }).limit(50),
    ]);
    if (!anaRes.error && anaRes.data) setAnalytics(anaRes.data);
    if (!evRes.error && evRes.data) setEvents(evRes.data);
    setLoading(false);
  };

  const pageCounts = analytics.reduce((acc, r) => { acc[r.page_path] = (acc[r.page_path] || 0) + 1; return acc; }, {});
  const sortedPages = Object.entries(pageCounts).sort((a,b) => b[1]-a[1]);
  const uniqueVisitors = new Set(analytics.map(a => a.visitor_id || a.ip_address)).size;

  if (loading) return <PanelCard title="Analytics Hub"><div style={{ padding: 60, display: 'flex', justifyContent: 'center' }}><Loader2 className="spin" size={24} color="var(--text-muted)" /></div></PanelCard>;

  return (
    <PanelCard title="Analytics Hub" action={{ label: 'Refresh', icon: 'ti-refresh', onClick: fetchData }}>
      <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <KPICard label="Total Page Views" value={analytics.length} icon={Eye} color="#3b82f6" />
          <KPICard label="Unique Visitors" value={uniqueVisitors} icon={User} color="#10b981" />
          <KPICard label="Recruiter Visits" value={events.length} icon={Briefcase} color="#8b5cf6" />
          <KPICard label="AI Chats" value="12" icon={MessageCircle} color="#ec4899" />
          <KPICard label="Messages Received" value="45" icon={Mail} color="#f59e0b" />
          <KPICard label="Top Section" value={sortedPages[0]?.[0] || '/'} icon={Star} color="#06b6d4" />
        </div>
        
        <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20 }}>
          <h4 style={{ margin: '0 0 16px', color: 'var(--text-primary)' }}>Page Views by Section</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sortedPages.map(([path, count]) => (
              <div key={path}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13, color: 'var(--text-secondary)' }}>
                  <span>{path}</span><span>{count}</span>
                </div>
                <div style={{ width: '100%', height: 8, background: 'var(--bg-secondary)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: \`\${(count/analytics.length)*100}%\`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #10b981)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20 }}>
          <h4 style={{ margin: '0 0 16px', color: 'var(--text-primary)' }}>Recent Activity Feed</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {analytics.slice(0, 10).map((r, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Viewed {r.page_path}</p>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>{r.device_type || 'Unknown'} • {r.referrer || 'Direct'}</p>
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(r.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PanelCard>
  );
}`;
if (analyticsOld) code = code.replace(analyticsOld, analyticsNew);

fs.writeFileSync('src/pages/AdminDashboard.jsx', code);
