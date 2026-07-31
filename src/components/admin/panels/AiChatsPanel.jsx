import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Loader2, MessageSquare, Sparkles, Trash2 } from 'lucide-react';
import { styles, MODAL_STYLES } from '../shared/constants';
import { PanelCard, EmptyState, StatCard } from '../shared/components';

export default function AiChatsPanel() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    fetchSessions();
    
    // Subscribe to new sessions
    const sessionSub = supabase.channel(`realtime-sessions_${Math.random().toString(36).substring(7)}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_sessions' }, (payload) => {
        setSessions(prev => [payload.new, ...prev]);
      })
      .subscribe();
      
    // Subscribe to new messages
    const messageSub = supabase.channel(`realtime-messages_${Math.random().toString(36).substring(7)}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload) => {
        setMessages(prev => {
          // Only append if it belongs to the currently viewed session
          if (payload.new.session_id === selectedSession) {
            return [...prev, payload.new];
          }
          return prev;
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(sessionSub);
      supabase.removeChannel(messageSub);
    };
  }, [selectedSession]);

  const fetchSessions = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('chat_sessions').select('*').order('created_at', { ascending: false });
    if (!error && data) setSessions(data);
    setLoading(false);
  };

  const deleteSession = async (id) => {
    if (!window.confirm('Delete this chat session and all its messages?')) return;
    const { error } = await supabase.from('chat_sessions').delete().eq('id', id);
    if (!error) {
      setSessions(sessions.filter(s => s.id !== id));
      if (selectedSession === id) setSelectedSession(null);
    } else {
      alert("Failed to delete session. This is likely blocked by Row-Level Security (RLS) in your database. You need to enable DELETE permissions on the 'chat_sessions' table.");
    }
  };

  const loadMessages = async (sessionId) => {
    setSelectedSession(sessionId);
    setLoadingMessages(true);
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
    if (!error && data) setMessages(data);
    setLoadingMessages(false);
  };

  if (loading) return <PanelCard title="AI Telemetry Logs"><div style={styles.emptyState}><Loader2 className="spin" size={24} color="var(--text-muted)" /></div></PanelCard>;

  // Analytics Metrics
  const activeToday = sessions.filter(s => new Date(s.created_at).toDateString() === new Date().toDateString()).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: 'calc(100vh - 120px)' }}>
      {/* KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <div style={{ background: 'var(--pcms-panel-2)', padding: '16px 20px', borderRadius: 12, border: '1px solid var(--pcms-line)', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#8B5CF6' }}><MessageSquare size={16} /><span style={{ fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--pcms-muted)' }}>Total Chats</span></div>
          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--pcms-text)' }}>{sessions.length}</div>
        </div>
        <div style={{ background: 'var(--pcms-panel-2)', padding: '16px 20px', borderRadius: 12, border: '1px solid var(--pcms-line)', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#10B981' }}><Sparkles size={16} /><span style={{ fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--pcms-muted)' }}>Active Today</span></div>
          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--pcms-text)' }}>{activeToday}</div>
        </div>
        <div style={{ background: 'var(--pcms-panel-2)', padding: '16px 20px', borderRadius: 12, border: '1px solid var(--pcms-line)', display: 'flex', flexDirection: 'column', gap: 6, justifyContent: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--pcms-muted)', lineHeight: 1.5 }}>Telemetry automatically logs every conversation processed by your Groq AI Integration.</div>
        </div>
      </div>

      {/* Split Pane Inbox */}
      <div style={{ display: 'flex', flex: 1, background: 'var(--pcms-panel-2)', borderRadius: 12, border: '1px solid var(--pcms-line)', overflow: 'hidden', minHeight: 400 }}>
        
        {/* Left: Session List */}
        <div style={{ width: '300px', borderRight: '1px solid var(--pcms-line)', display: 'flex', flexDirection: 'column', background: 'var(--pcms-panel-2)' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--pcms-line)', fontWeight: 700, color: 'var(--pcms-text)', fontSize: 13, fontFamily: "'Space Grotesk', sans-serif" }}>
            Recent Sessions
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {sessions.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--pcms-muted)', fontSize: 12.5 }}>No sessions yet.</div>
            ) : sessions.map(session => (
              <div 
                key={session.id} 
                onClick={() => loadMessages(session.id)}
                style={{ 
                  padding: '14px 18px', 
                  borderBottom: '1px solid var(--pcms-line)', 
                  cursor: 'pointer',
                  background: selectedSession === session.id ? 'var(--pcms-accent-dim)' : 'transparent',
                  transition: 'background 0.15s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: selectedSession === session.id ? 'var(--pcms-accent)' : 'var(--pcms-text)' }}>Visitor Session</span>
                  <span style={{ fontSize: 11, color: 'var(--pcms-muted)' }}>{new Date(session.created_at).toLocaleDateString()}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--pcms-muted)', fontFamily: "'IBM Plex Mono', monospace", textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  ID: {session.id.split('-')[0]}...
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Chat Transcript */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--pcms-panel)' }}>
          {selectedSession ? (
            <>
              <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: 15, color: 'var(--text-primary)' }}>Chat Transcript</h4>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: 4 }}>{selectedSession}</p>
                </div>
                <button onClick={() => deleteSession(selectedSession)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600 }}>
                  <Trash2 size={14} /> Delete
                </button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {loadingMessages ? (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Loader2 className="spin" size={24} color="var(--primary-blue)" /></div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', margin: 'auto' }}>Session opened, but no messages were sent.</div>
                ) : (
                  messages.map(msg => (
                    <div key={msg.id} style={{
                      alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '75%',
                      background: msg.role === 'user' ? 'var(--primary-blue)' : 'var(--bg-accent)',
                      color: msg.role === 'user' ? '#fff' : 'var(--text-primary)',
                      padding: '14px 18px',
                      borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6, color: msg.role === 'user' ? 'rgba(255,255,255,0.7)' : 'var(--primary-blue)' }}>
                        {msg.role === 'user' ? 'Visitor' : 'AI Assistant'}
                      </div>
                      <div style={{ fontSize: 14, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                        {msg.content}
                      </div>
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
}

/* -------------------------------------------------------------------- */
/* Site Settings Panel                                                  */
