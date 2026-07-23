import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { generateChatResponse } from '../lib/groqClient';
import { MessageSquare, X, Send, Sparkles, Loader2, Minimize2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

  // Initialize Session
  const initSession = async () => {
    if (sessionId) return;
    const newId = crypto.randomUUID();
    const { data, error } = await supabase.from('chat_sessions').insert([{
      id: newId,
      // visitor_name removed because column doesn't exist
    }]).select().single();
    
    if (data) {
      setSessionId(data.id);
      const greeting = "Hi! I'm an AI assistant trained on this portfolio. What would you like to know about my skills, experience, or projects?";
      setMessages([{ role: 'assistant', content: greeting }]);
      supabase.from('chat_messages').insert([{ id: crypto.randomUUID(), session_id: data.id, role: 'assistant', content: greeting }]).then();
    } else {
      console.error("Failed to init chat session", error);
    }
  };

  const toggleOpen = () => {
    if (!isOpen && !sessionId) initSession();
    setIsOpen(!isOpen);
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || !sessionId || isTyping) return;

    const userText = input.trim();
    setInput('');
    
    const newMessages = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);
    setIsTyping(true);

    // Save to DB asynchronously
    supabase.from('chat_messages').insert([{ id: crypto.randomUUID(), session_id: sessionId, role: 'user', content: userText }]).then();

    // Call Groq API
    const replyText = await generateChatResponse(newMessages);
    
    const finalMessages = [...newMessages, { role: 'assistant', content: replyText }];
    setMessages(finalMessages);
    setIsTyping(false);

    // Save AI reply to DB
    supabase.from('chat_messages').insert([{ id: crypto.randomUUID(), session_id: sessionId, role: 'assistant', content: replyText }]).then();
    supabase.from('chat_sessions').update({ last_message_at: new Date().toISOString() }).eq('id', sessionId).then();
  };

  return (
    <div style={{ position: 'fixed', bottom: 30, right: 30, zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 16 }}>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95, pointerEvents: 'none' }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            style={{
              width: 360,
              height: 500,
              background: '#ffffff',
              borderRadius: 24,
              boxShadow: '0 12px 40px rgba(0,0,0,0.12), 0 2px 10px rgba(0,0,0,0.04)',
              border: '1px solid #e5e7eb',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Header */}
            <div style={{ padding: '16px 20px', background: 'linear-gradient(to right, #007bff, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={16} color="#fff" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>AI Assistant</h3>
                  <p style={{ margin: 0, fontSize: 12, opacity: 0.9 }}>Ask me anything</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: 4, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Minimize2 size={18} />
              </button>
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, padding: '20px 20px 10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, background: '#f9fafb' }}>
              {messages.map((m, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                  key={i} 
                  style={{
                    alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    background: m.role === 'user' ? '#007bff' : '#ffffff',
                    color: m.role === 'user' ? '#fff' : '#1f2937',
                    padding: '12px 16px',
                    borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    boxShadow: m.role === 'user' ? '0 4px 12px rgba(0,123,255,0.2)' : '0 2px 8px rgba(0,0,0,0.05)',
                    border: m.role === 'user' ? 'none' : '1px solid #e5e7eb',
                    fontSize: 14,
                    lineHeight: 1.5
                  }}
                >
                  <ReactMarkdown 
                    components={{
                      p: ({node, ...props}) => <p style={{margin: 0}} {...props} />,
                      a: ({node, ...props}) => <a style={{color: m.role==='user'?'#fff':'#007bff', textDecoration:'underline'}} {...props} />
                    }}
                  >
                    {m.content}
                  </ReactMarkdown>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ alignSelf: 'flex-start', padding: '12px 16px', background: '#ffffff', borderRadius: '18px 18px 18px 4px', border: '1px solid #e5e7eb', display: 'flex', gap: 6, alignItems: 'center' }}>
                  <Loader2 size={16} className="spin" color="#9ca3af" />
                  <span style={{ fontSize: 13, color: '#6b7280' }}>AI is thinking...</span>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} style={{ padding: 14, background: '#fff', borderTop: '1px solid #e5e7eb', display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about my experience..."
                disabled={isTyping}
                style={{ flex: 1, padding: '10px 14px', borderRadius: 100, border: '1px solid #e5e7eb', outline: 'none', fontSize: 14, background: '#f3f4f6' }}
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isTyping}
                style={{ width: 40, height: 40, borderRadius: '50%', background: input.trim() && !isTyping ? '#007bff' : '#d1d5db', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() && !isTyping ? 'pointer' : 'not-allowed', transition: 'background 0.2s' }}
              >
                <Send size={16} style={{ marginLeft: 2 }} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleOpen}
        style={{
          width: 60, height: 60, borderRadius: '50%', background: '#007bff', color: '#fff', border: 'none',
          boxShadow: '0 8px 24px rgba(0,123,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
      >
        {isOpen ? <X size={26} /> : <MessageSquare size={26} />}
      </motion.button>
    </div>
  );
}
