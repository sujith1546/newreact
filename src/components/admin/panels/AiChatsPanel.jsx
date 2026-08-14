import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Loader2, MessageSquare, Sparkles, Trash2, Cpu, UserCheck, ShieldAlert, ArrowUpRight, Zap, CheckCircle2, ArrowLeft } from 'lucide-react';
import { styles } from '../shared/constants';
import { PanelCard } from '../shared/components';

export default function AiChatsPanel() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [kbGaps, setKbGaps] = useState([]);
  const [activeTab, setActiveTab] = useState('sessions'); // 'sessions' | 'gaps'
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth <= 768 : false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchSessions();
    fetchKbGaps();
    
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

  const fetchKbGaps = async () => {
    try {
      const { data, error } = await supabase.from('kb_gaps').select('*').order('created_at', { ascending: false }).limit(20);
      if (!error && data) setKbGaps(data);
    } catch {
      // safe fallback if table does not exist
    }
  };

  const deleteSession = async (id) => {
    if (!window.confirm('Delete this chat session and all its messages?')) return;
    const { error } = await supabase.from('chat_sessions').delete().eq('id', id);
    if (!error) {
      setSessions(sessions.filter(s => s.id !== id));
      if (selectedSession === id) setSelectedSession(null);
    } else {
      alert("Failed to delete session. Verify RLS permissions on chat_sessions.");
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

  if (loading) return <PanelCard title="AI Telemetry & Analytics"><div style={styles.emptyState}><Loader2 className="spin" size={24} color="var(--text-muted)" /></div></PanelCard>;

  const activeToday = sessions.filter(s => new Date(s.created_at).toDateString() === new Date().toDateString()).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: 0, height: isMobile ? 'auto' : 'calc(100vh - 120px)' }}>
      {/* KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 12 }}>
        <div style={{ background: 'var(--pcms-panel-2)', padding: '12px 14px', borderRadius: 12, border: '1px solid var(--pcms-line)', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#8B5CF6' }}><MessageSquare size={14} /><span style={{ fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--pcms-muted)' }}>Total Sessions</span></div>
          <div style={{ fontSize: isMobile ? 20 : 26, fontWeight: 800, color: 'var(--pcms-text)' }}>{sessions.length}</div>
        </div>
        <div style={{ background: 'var(--pcms-panel-2)', padding: '12px 14px', borderRadius: 12, border: '1px solid var(--pcms-line)', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10B981' }}><Sparkles size={14} /><span style={{ fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--pcms-muted)' }}>Active Today</span></div>
          <div style={{ fontSize: isMobile ? 20 : 26, fontWeight: 800, color: 'var(--pcms-text)' }}>{activeToday}</div>
        </div>
        <div style={{ background: 'var(--pcms-panel-2)', padding: '12px 14px', borderRadius: 12, border: '1px solid var(--pcms-line)', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#3B82F6' }}><UserCheck size={14} /><span style={{ fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--pcms-muted)' }}>Persona Logging</span></div>
          <div style={{ fontSize: isMobile ? 11 : 13, fontWeight: 700, color: '#10b981', marginTop: 2 }}>Recruiter & Dev</div>
        </div>
        <div style={{ background: 'var(--pcms-panel-2)', padding: '12px 14px', borderRadius: 12, border: '1px solid var(--pcms-line)', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#F59E0B' }}><ShieldAlert size={14} /><span style={{ fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--pcms-muted)' }}>KB Gaps Flagged</span></div>
          <div style={{ fontSize: isMobile ? 20 : 26, fontWeight: 800, color: 'var(--pcms-text)' }}>{kbGaps.length}</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid var(--pcms-line)', paddingBottom: 10 }}>
        <button
          onClick={() => setActiveTab('sessions')}
          style={{
            background: activeTab === 'sessions' ? 'var(--pcms-accent)' : 'transparent',
            color: activeTab === 'sessions' ? '#fff' : 'var(--pcms-text)',
            border: 'none',
            padding: '7px 14px',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 12.5,
            cursor: 'pointer'
          }}
        >
          Session Transcripts ({sessions.length})
        </button>
        <button
          onClick={() => setActiveTab('gaps')}
          style={{
            background: activeTab === 'gaps' ? 'var(--pcms-accent)' : 'transparent',
            color: activeTab === 'gaps' ? '#fff' : 'var(--pcms-text)',
            border: 'none',
            padding: '7px 14px',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 12.5,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          KB Gaps Reviewer {kbGaps.length > 0 && <span style={{ background: '#ef4444', color: '#fff', fontSize: 10, borderRadius: 10, padding: '2px 6px', fontWeight: 800 }}>{kbGaps.length}</span>}
        </button>
      </div>

      {activeTab === 'sessions' ? (
        /* Split / Responsive Inbox */
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          flex: 1,
          background: 'var(--pcms-panel-2)',
          borderRadius: 12,
          border: '1px solid var(--pcms-line)',
          overflow: 'hidden',
          minHeight: isMobile ? 450 : 400
        }}>
          
          {/* Left / Full List View */}
          {(!isMobile || !selectedSession) && (
            <div style={{
              width: isMobile ? '100%' : '320px',
              borderRight: isMobile ? 'none' : '1px solid var(--pcms-line)',
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--pcms-panel-2)',
              flexShrink: 0
            }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--pcms-line)', fontWeight: 700, color: 'var(--pcms-text)', fontSize: 13, fontFamily: "'Space Grotesk', sans-serif" }}>
                Recent Visitor Sessions
              </div>
              <div style={{ flex: 1, overflowY: 'auto', maxHeight: isMobile ? 420 : 'none' }}>
                {sessions.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--pcms-muted)', fontSize: 12.5 }}>No sessions yet.</div>
                ) : sessions.map(session => (
                  <div 
                    key={session.id} 
                    onClick={() => loadMessages(session.id)}
                    style={{ 
                      padding: '12px 16px', 
                      borderBottom: '1px solid var(--pcms-line-soft)', 
                      cursor: 'pointer',
                      background: selectedSession === session.id ? 'var(--pcms-accent-dim)' : 'transparent',
                      transition: 'background 0.15s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: selectedSession === session.id ? 'var(--pcms-accent)' : 'var(--pcms-text)' }}>Visitor Session</span>
                      <span style={{ fontSize: 10.5, color: 'var(--pcms-muted)' }}>{new Date(session.created_at).toLocaleDateString()}</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--pcms-muted)', fontFamily: "'IBM Plex Mono', monospace", textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      ID: {String(session?.id || 'session').split('-')[0]}...
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Right / Transcript View */}
          {(!isMobile || selectedSession) && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--pcms-panel)', minWidth: 0 }}>
              {selectedSession ? (
                <>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--pcms-line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                      {isMobile && (
                        <button
                          type="button"
                          onClick={() => setSelectedSession(null)}
                          style={{
                            background: 'var(--pcms-accent-dim)',
                            color: 'var(--pcms-accent)',
                            border: '1px solid var(--pcms-line)',
                            padding: '6px 10px',
                            borderRadius: 8,
                            fontSize: 11.5,
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            cursor: 'pointer',
                            flexShrink: 0
                          }}
                        >
                          <ArrowLeft size={13} />
                          <span>Back</span>
                        </button>
                      )}
                      <div style={{ minWidth: 0 }}>
                        <h4 style={{ margin: 0, fontSize: 13.5, color: 'var(--pcms-text)', fontWeight: 700 }}>Chat Transcript Replay</h4>
                        <p style={{ margin: 0, fontSize: 10.5, color: 'var(--pcms-muted)', fontFamily: 'monospace', marginTop: 2, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{selectedSession}</p>
                      </div>
                    </div>
                    <button onClick={() => deleteSession(selectedSession)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '6px 10px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 600, flexShrink: 0 }}>
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px 12px' : '20px', display: 'flex', flexDirection: 'column', gap: 14, maxHeight: isMobile ? 420 : 'none' }}>
                    {loadingMessages ? (
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 160 }}><Loader2 className="spin" size={24} color="var(--pcms-accent)" /></div>
                    ) : messages.length === 0 ? (
                      <div style={{ textAlign: 'center', color: 'var(--pcms-muted)', margin: 'auto', fontSize: 12.5 }}>Session opened, but no messages were sent.</div>
                    ) : (
                      messages.map(msg => (
                        <div key={msg.id} style={{
                          alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                          maxWidth: isMobile ? '90%' : '78%',
                          background: msg.role === 'user' ? 'var(--pcms-accent, #6366f1)' : 'var(--pcms-panel-2)',
                          color: msg.role === 'user' ? '#fff' : 'var(--pcms-text)',
                          padding: '10px 14px',
                          borderRadius: msg.role === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                          border: msg.role === 'user' ? 'none' : '1px solid var(--pcms-line)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: msg.role === 'user' ? 'rgba(255,255,255,0.85)' : 'var(--pcms-accent)' }}>
                              {msg.role === 'user' ? 'Visitor' : 'AI Assistant'}
                            </span>
                          </div>
                          <div style={{ fontSize: 12.5, lineHeight: 1.45, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                            {msg.content}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--pcms-muted)', padding: 40 }}>
                  <MessageSquare size={36} opacity={0.2} style={{ marginBottom: 12 }} />
                  <p style={{ fontSize: 13.5, fontWeight: 500, margin: 0, textAlign: 'center' }}>Select a session to view full audit transcript</p>
                </div>
              )}
            </div>
          )}

        </div>
      ) : (
        /* KB Gaps Reviewer Tab */
        <div style={{ flex: 1, background: 'var(--pcms-panel-2)', borderRadius: 12, border: '1px solid var(--pcms-line)', padding: '18px', overflowY: 'auto' }}>
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--pcms-text)' }}>Knowledge Base Gaps (Low Confidence Queries)</h3>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--pcms-muted)' }}>These questions scored below confidence threshold, highlighting topics recruiters asked about that need coverage in your embeddings.</p>
          </div>

          {kbGaps.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--pcms-muted)' }}>
              <CheckCircle2 size={36} color="#10b981" style={{ marginBottom: 10 }} />
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>No Knowledge Base Gaps Detected!</p>
              <p style={{ margin: '4px 0 0', fontSize: 12 }}>All visitor queries match your Voyage AI embeddings with high confidence.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {kbGaps.map(gap => (
                <div key={gap.id} style={{ background: 'var(--pcms-panel)', border: '1px solid var(--pcms-line)', borderRadius: 10, padding: '14px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: 8 }}>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--pcms-text)' }}>"{gap.query}"</span>
                    <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: 10.5, color: 'var(--pcms-muted)' }}>
                      <span>Top Score: <strong style={{ color: '#ef4444' }}>{(gap.top_score * 100).toFixed(0)}%</strong></span>
                      <span>Date: {new Date(gap.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                  <span style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '3px 8px', borderRadius: 6, fontSize: 10.5, fontWeight: 700 }}>
                    Needs KB Expansion
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
