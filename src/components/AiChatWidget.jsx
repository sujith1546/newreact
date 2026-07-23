import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { generateChatResponse } from '../lib/groqClient';
import { X, Send, Sparkles, Minimize2, Cpu, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// FIXED: Proper UUID generator - no infinite recursion
function generateUUID() {
  try {
    return crypto.randomUUID();
  } catch (e) {
    // Fallback for non-secure contexts
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

const SUGGESTED_QUESTIONS = [
  "What is your tech stack?",
  "What was your role at your last job?",
  "Can I see some of your projects?"
];

export default function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  // Use a ref so handleSend always reads the latest sessionId without stale closures
  const sessionIdRef = useRef(null);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

  // On mount: restore existing session from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ai_session_id');
    if (!saved) return;

    supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', saved)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          sessionIdRef.current = saved;
          setSessionId(saved);
          setMessages(data.map(m => ({ role: m.role, content: m.content })));
        } else {
          // Stale session - clear it
          localStorage.removeItem('ai_session_id');
        }
      });
  }, []);

  // Creates a brand new session in Supabase and returns its ID
  const createNewSession = async () => {
    const newId = generateUUID();
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert([{ id: newId }])
      .select()
      .single();

    if (error || !data) {
      console.error('[AiChatWidget] Failed to create session:', error?.message);
      return null;
    }

    const id = data.id;
    sessionIdRef.current = id;
    setSessionId(id);
    localStorage.setItem('ai_session_id', id);

    // Save and show greeting
    const greeting = "Hello! I'm an AI assistant trained on this portfolio. How can I help you today?";
    await supabase.from('chat_messages').insert([
      { id: generateUUID(), session_id: id, role: 'assistant', content: greeting }
    ]);
    setMessages([{ role: 'assistant', content: greeting }]);

    return id;
  };

  const toggleOpen = async () => {
    const willOpen = !isOpen;
    setIsOpen(willOpen);
    // Create session lazily on first open
    if (willOpen && !sessionIdRef.current) {
      await createNewSession();
    }
  };

  const handleSend = async (e, textOverride) => {
    if (e && e.preventDefault) e.preventDefault();

    const text = typeof textOverride === 'string' ? textOverride : input.trim();
    if (!text || isTyping) return;

    // Guarantee a session exists before saving
    let sid = sessionIdRef.current;
    if (!sid) {
      sid = await createNewSession();
      if (!sid) {
        console.error('[AiChatWidget] Could not obtain session. Message dropped.');
        return;
      }
    }

    setInput('');
    const userMsg = { role: 'user', content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsTyping(true);

    // Persist user message immediately
    const { error: userInsertErr } = await supabase.from('chat_messages').insert([
      { id: generateUUID(), session_id: sid, role: 'user', content: text }
    ]);
    if (userInsertErr) console.error('[AiChatWidget] User msg insert error:', userInsertErr.message);

    // Get AI reply
    const replyText = await generateChatResponse(updatedMessages);
    const assistantMsg = { role: 'assistant', content: replyText };
    setMessages([...updatedMessages, assistantMsg]);
    setIsTyping(false);

    // Persist AI reply
    const { error: aiInsertErr } = await supabase.from('chat_messages').insert([
      { id: generateUUID(), session_id: sid, role: 'assistant', content: replyText }
    ]);
    if (aiInsertErr) console.error('[AiChatWidget] AI msg insert error:', aiInsertErr.message);
  };

  return (
    <div style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 20 }}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(5px)', pointerEvents: 'none' }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            style={{
              width: 380, height: 600, maxHeight: '80vh',
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(24px) saturate(150%)',
              borderRadius: 24,
              boxShadow: '0 0 0 1px rgba(255,255,255,0.1), 0 24px 48px rgba(0,0,0,0.4)',
              overflow: 'hidden', display: 'flex', flexDirection: 'column', color: '#fff'
            }}
          >
            {/* Header */}
            <div style={{
              padding: '20px',
              background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(147,51,234,0.2))',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              position: 'relative', overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: -50, left: -50, width: 150, height: 150, background: 'rgba(59,130,246,0.3)', filter: 'blur(40px)', borderRadius: '50%' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
                <div style={{ width: 38, height: 38, borderRadius: 12, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(59,130,246,0.4)' }}>
                  <Cpu size={20} color="#fff" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, letterSpacing: '-0.3px' }}>AI Companion</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>Online &amp; Ready</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer', padding: 6, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
                <Minimize2 size={16} />
              </button>
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, padding: '20px 20px 10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3, type: 'spring' }}
                  style={{
                    alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    background: m.role === 'user' ? 'linear-gradient(135deg, #2563eb, #3b82f6)' : 'rgba(255,255,255,0.08)',
                    color: '#fff',
                    padding: '14px 18px',
                    borderRadius: m.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                    boxShadow: m.role === 'user' ? '0 8px 24px rgba(37,99,235,0.25)' : 'none',
                    border: m.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.08)',
                    fontSize: 14, lineHeight: 1.6,
                    backdropFilter: m.role === 'user' ? 'none' : 'blur(10px)'
                  }}
                >
                  <ReactMarkdown
                    components={{
                      p: ({node, ...props}) => <p style={{ margin: 0 }} {...props} />,
                      a: ({node, ...props}) => <a style={{ color: '#60a5fa', textDecoration: 'underline' }} {...props} />,
                      strong: ({node, ...props}) => <strong style={{ color: '#93c5fd' }} {...props} />,
                      code: ({node, inline, ...props}) => inline
                        ? <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: 4, fontSize: '0.9em', color: '#a78bfa' }} {...props} />
                        : <pre style={{ background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 8, overflowX: 'auto', marginTop: 8 }}><code style={{ color: '#a78bfa' }} {...props} /></pre>
                    }}
                  >
                    {m.content}
                  </ReactMarkdown>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ alignSelf: 'flex-start', padding: '14px 18px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px 20px 20px 4px', display: 'flex', gap: 8, alignItems: 'center' }}>
                  <motion.div animate={{ scale: [1,1.3,1], opacity: [0.5,1,0.5] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0 }} style={{ width: 7, height: 7, background: '#3b82f6', borderRadius: '50%' }} />
                  <motion.div animate={{ scale: [1,1.3,1], opacity: [0.5,1,0.5] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }} style={{ width: 7, height: 7, background: '#8b5cf6', borderRadius: '50%' }} />
                  <motion.div animate={{ scale: [1,1.3,1], opacity: [0.5,1,0.5] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }} style={{ width: 7, height: 7, background: '#ec4899', borderRadius: '50%' }} />
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Chips — show after greeting only */}
            {messages.length === 1 && !isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} style={{ padding: '0 20px 10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: '0 0 4px 4px', textTransform: 'uppercase', fontWeight: 600 }}>Suggested</p>
                {SUGGESTED_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(null, q)}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.9)', padding: '10px 14px', borderRadius: 12, fontSize: 13, textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                  >
                    {q}<ChevronRight size={14} color="#60a5fa" />
                  </button>
                ))}
              </motion.div>
            )}

            {/* Input Area */}
            <form onSubmit={handleSend} style={{ padding: '16px 20px', background: 'rgba(0,0,0,0.25)', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 12, alignItems: 'center' }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message AI..."
                disabled={isTyping}
                style={{ flex: 1, padding: '14px 18px', borderRadius: 100, border: '1px solid rgba(255,255,255,0.1)', outline: 'none', fontSize: 14, background: 'rgba(255,255,255,0.05)', color: '#fff', transition: 'all 0.3s' }}
                onFocus={(e) => { e.target.style.borderColor = 'rgba(59,130,246,0.5)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                style={{ width: 48, height: 48, borderRadius: '50%', background: (input.trim() && !isTyping) ? 'linear-gradient(135deg, #2563eb, #3b82f6)' : 'rgba(255,255,255,0.05)', border: 'none', color: (input.trim() && !isTyping) ? '#fff' : 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: (input.trim() && !isTyping) ? 'pointer' : 'not-allowed', transition: 'all 0.3s', boxShadow: (input.trim() && !isTyping) ? '0 4px 12px rgba(37,99,235,0.3)' : 'none' }}
              >
                <Send size={18} style={{ marginLeft: 2 }} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Orb Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleOpen}
        animate={!isOpen ? { boxShadow: ['0 0 0px rgba(59,130,246,0)', '0 0 24px rgba(59,130,246,0.7)', '0 0 0px rgba(59,130,246,0)'] } : {}}
        transition={{ repeat: Infinity, duration: 2.5 }}
        style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'linear-gradient(135deg, #1e3a8a, #3b82f6, #8b5cf6)',
          color: '#fff', border: '2px solid rgba(255,255,255,0.15)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden'
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.3), transparent)' }} />
        {isOpen ? <X size={28} style={{ position: 'relative', zIndex: 1 }} /> : <Sparkles size={28} style={{ position: 'relative', zIndex: 1 }} />}
      </motion.button>
    </div>
  );
}
