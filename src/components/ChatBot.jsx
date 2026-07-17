import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, Bot, User, Atom, RotateCcw, Trash2, Copy, Check, ChevronDown, ChevronUp, Info } from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  "What projects have you built?",
  "What's your CGPA?",
  "Are you open to hiring?",
  "What's your strongest skill?",
  "How can I contact you?",
  "Tell me about your ML experience"
];

const WELCOME_MESSAGE = {
  role: 'assistant',
  content: "Hi! 👋 I'm Sujith's AI assistant. I can answer anything about my background, projects, skills, and availability. What would you like to know?"
};

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [hasError, setHasError] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);



  const [copiedIndex, setCopiedIndex] = useState(null);

  const toggleThinking = (index) => {
    setMessages(prev => prev.map((m, idx) => idx === index ? { ...m, isThinkingExpanded: !m.isThinkingExpanded } : m));
  };

  const handleCopy = (content, index) => {
    navigator.clipboard?.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || isLoading) return;

    setInput('');
    setShowSuggestions(false);
    setHasError(false);
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setIsLoading(true);

    try {
      // Build multi-turn message history
      const history = messages
        .filter(m => m.content !== WELCOME_MESSAGE.content)
        .slice(-8)
        .map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content
        }));

      // Add placeholder message for the assistant with RAG tracing steps
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '', 
        sources: [], 
        steps: [
          '🔍 Contextualizing user query...',
          '🧠 Querying vector database for similarity matches...'
        ],
        isThinkingExpanded: true
      }]);

      // Call our secure backend API
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, history })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Request failed');
      }

      if (!res.body) throw new Error('Response body is null');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep partial line in buffer

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6);
          if (payload === '[DONE]') continue;

          try {
            const data = JSON.parse(payload);
            if (data.type === 'sources') {
              setMessages(prev => {
                const updated = [...prev];
                const lastIdx = updated.length - 1;
                if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
                  updated[lastIdx] = {
                    ...updated[lastIdx],
                    sources: data.sources,
                    steps: [
                      '✓ Contextualized query successfully',
                      `✓ Retrieved vector matches: [${data.sources.map(s => s.source).join(', ') || 'none'}]`,
                      '✨ Generating response with Llama-3.3-70B...'
                    ]
                  };
                }
                return updated;
              });
            } else if (data.type === 'token') {
              setMessages(prev => {
                const updated = [...prev];
                const lastIdx = updated.length - 1;
                if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
                  updated[lastIdx] = {
                    ...updated[lastIdx],
                    content: updated[lastIdx].content + data.token
                  };
                }
                return updated;
              });
            }
          } catch (e) {
            // Ignore malformed JSON chunks
          }
        }
      }

      // Finish generation step
      setMessages(prev => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
          updated[lastIdx] = {
            ...updated[lastIdx],
            steps: [
              ...updated[lastIdx].steps.slice(0, 2),
              '✓ Generated complete reply using Llama-3.3-70B'
            ],
            isThinkingExpanded: false
          };
        }
        return updated;
      });

    } catch (err) {
      console.error('Chat error:', err);
      setHasError(true);
      setMessages(prev => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
          updated[lastIdx] = {
            ...updated[lastIdx],
            content: "Sorry, I ran into an issue retrieving information. Please try again! 🙏",
            isError: true,
            steps: ['✗ Connection failed'],
            isThinkingExpanded: false
          };
        } else {
          updated.push({
            role: 'assistant',
            content: "Sorry, I ran into an issue. Please try again! 🙏",
            isError: true,
            steps: ['✗ Connection failed'],
            isThinkingExpanded: false
          });
        }
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessageRef = useRef(sendMessage);
  useEffect(() => {
    sendMessageRef.current = sendMessage;
  });

  useEffect(() => {
    const handleTrigger = (e) => {
      const query = e.detail?.query || 'How can I contact you?';
      setIsOpen(true);
      setTimeout(() => {
        sendMessageRef.current?.(query);
      }, 400); // Wait 400ms for slide open transition
    };

    window.addEventListener('trigger-chatbot', handleTrigger);
    return () => window.removeEventListener('trigger-chatbot', handleTrigger);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resetChat = () => {
    setMessages([WELCOME_MESSAGE]);
    setShowSuggestions(true);
    setHasError(false);
    setInput('');
  };

  if (isMobile) return null;

  return createPortal(
    <>
      <style>{`
        /* ============== CHATBOT STYLES ============== */
        .chatbot-fab {
          position: fixed;
          bottom: 28px;
          right: 28px;
          z-index: 9999;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: var(--text-primary);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          color: var(--bg-primary);
        }
        .chatbot-fab:hover {
          transform: scale(1.1) translateY(-2px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
        }
        [data-theme="dark"] .chatbot-fab {
          box-shadow: 0 4px 20px rgba(255, 255, 255, 0.15);
        }
        [data-theme="dark"] .chatbot-fab:hover {
          box-shadow: 0 8px 30px rgba(255, 255, 255, 0.25);
        }
        .chatbot-fab-ping {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #22c55e;
          border: 2px solid #fff;
          animation: fabPing 2s infinite;
        }
        @keyframes fabPing {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.7; }
        }

        .chatbot-panel {
          position: fixed;
          bottom: 96px;
          right: 28px;
          z-index: 9999;
          width: 380px;
          max-height: 580px;
          background: var(--bg-secondary, #fff);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.15);
          border: 1px solid rgba(128,128,128,0.2);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        [data-theme="dark"] .chatbot-panel {
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
          border-color: rgba(255,255,255,0.08);
        }

        /* Header */
        .chatbot-header {
          padding: 16px 18px;
          background: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }
        .chatbot-header-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: var(--bg-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: var(--text-primary);
        }
        .chatbot-header-info { flex: 1; min-width: 0; }
        .chatbot-header-name {
          font-size: 14px;
          font-weight: 700;
          color: var(--bg-primary);
          margin: 0;
        }
        .chatbot-header-status {
          font-size: 11px;
          color: var(--bg-primary);
          opacity: 0.7;
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 3px;
          line-height: 1;
        }
        .chatbot-header-status span {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .chatbot-online-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #4ade80;
          animation: fabPing 2s infinite;
          flex-shrink: 0;
        }
        .chatbot-header-actions {
          display: flex;
          gap: 6px;
        }
        .chatbot-header-btn {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: transparent;
          border: none;
          color: var(--bg-primary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
          font-size: 11px;
          font-weight: 600;
        }
        .chatbot-header-btn:hover { background: rgba(128,128,128,0.25); }

        .chatbot-clear-btn {
          padding: 5px 10px;
          border-radius: 12px;
          background: rgba(128,128,128,0.15);
          border: 1px solid rgba(128,128,128,0.1);
          color: var(--bg-primary);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 600;
          transition: all 0.2s;
        }
        .chatbot-clear-btn:hover { 
          background: rgba(128,128,128,0.25); 
          transform: translateY(-1px);
        }

        /* Messages */
        .chatbot-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          scroll-behavior: smooth;
        }
        .chatbot-messages::-webkit-scrollbar { width: 4px; }
        .chatbot-messages::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.3); border-radius: 2px; }

        .chat-message-row {
          display: flex;
          gap: 8px;
          align-items: flex-end;
        }
        .chat-message-row.user { flex-direction: row-reverse; }

        .chat-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 13px;
        }
        .chat-avatar.bot {
          background: var(--text-primary);
          color: var(--bg-primary);
        }
        .chat-avatar.user {
          background: #f3f4f6;
          color: #374151;
        }
        [data-theme="dark"] .chat-avatar.user {
          background: #374151;
          color: #e5e7eb;
        }

        .chat-bubble {
          max-width: 78%;
          padding: 10px 14px;
          border-radius: 16px;
          font-size: 13.5px;
          line-height: 1.55;
          word-break: break-word;
        }
        .chat-bubble.bot {
          background: var(--bg-primary, #f3f4f6);
          color: var(--text-primary);
          border-bottom-left-radius: 4px;
          border: 1px solid rgba(128,128,128,0.1);
        }
        [data-theme="dark"] .chat-bubble.bot {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.08);
        }
        .chat-bubble.user {
          background: var(--text-primary);
          color: var(--bg-primary);
          border-bottom-right-radius: 4px;
        }
        .chat-bubble.error {
          background: #fef2f2;
          color: #991b1b;
          border-color: #fecaca;
        }
        [data-theme="dark"] .chat-bubble.error {
          background: rgba(220,38,38,0.1);
          color: #fca5a5;
        }

        /* Typing indicator */
        .typing-indicator {
          display: flex;
          gap: 4px;
          align-items: center;
          padding: 12px 14px;
        }
        .typing-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #9ca3af;
          animation: typingBounce 1.2s infinite;
        }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }

        /* Suggestions */
        .chatbot-suggestions {
          padding: 0 16px 12px;
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .suggestion-chip {
          padding: 5px 11px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          border: 1px solid var(--text-primary);
          background: transparent;
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        [data-theme="dark"] .suggestion-chip {
          border-color: var(--text-primary);
          color: var(--text-primary);
          background: transparent;
        }
        .suggestion-chip:hover {
          background: var(--text-primary);
          color: var(--bg-primary);
          transform: translateY(-1px);
        }

        /* Input bar */
        .chatbot-input-bar {
          padding: 12px 16px;
          border-top: 1px solid rgba(128,128,128,0.1);
          background: transparent;
        }
        
        .chatbot-input-wrapper {
          display: flex;
          align-items: center;
          background: var(--bg-primary, #f9fafb);
          border: 1px solid rgba(128,128,128,0.2);
          border-radius: 24px;
          padding: 4px 4px 4px 16px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .chatbot-input-wrapper:focus-within {
          border-color: var(--text-primary);
        }
        [data-theme="dark"] .chatbot-input-wrapper {
          background: rgba(255,255,255,0.03);
          border-color: rgba(255,255,255,0.1);
        }
        
        .chatbot-input {
          flex: 1;
          border: none;
          background: transparent;
          color: var(--text-primary);
          outline: none !important;
          box-shadow: none !important;
          font-size: 13.5px;
          font-family: inherit;
          padding: 8px 8px 8px 0;
        }
        .chatbot-input:focus {
          outline: none !important;
          box-shadow: none !important;
          border: none !important;
        }
        
        .chatbot-send-btn {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: var(--text-primary);
          border: none;
          color: var(--bg-primary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s;
        }
        .chatbot-send-btn:hover:not(:disabled) {
          transform: scale(1.05);
        }
        .chatbot-send-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
          background: rgba(128,128,128,0.3);
          color: var(--text-primary);
        }

        /* Powered by */
        .chatbot-footer {
          text-align: center;
          font-size: 11px;
          color: var(--text-secondary);
          padding: 6px 12px 10px;
          opacity: 0.6;
        }

        /* Mobile */
        @media (max-width: 480px) {
          .chatbot-panel {
            right: 12px;
            left: 12px;
            width: auto;
            bottom: 88px;
          }
          .chatbot-fab {
            bottom: 20px;
            right: 20px;
          }
        }
      `}</style>

      {/* FAB Button */}
      <motion.button
        className="chatbot-fab"
        drag={isMobile && !isOpen}
        dragMomentum={false}
        animate={isOpen ? { x: 0, y: 0 } : undefined}
        onClick={() => setIsOpen(o => !o)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open AI Chat"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <X size={22} />
            </motion.span>
          ) : (
            <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <Atom size={22} />
            </motion.span>
          )}
        </AnimatePresence>
        {!isOpen && <div className="chatbot-fab-ping" />}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="chatbot-panel"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="chatbot-header">
              <div className="chatbot-header-avatar">
                <Atom size={18} />
              </div>
              <div className="chatbot-header-info">
                <p className="chatbot-header-name">Ask Sujith AI</p>
                <div className="chatbot-header-status">
                  <div className="chatbot-online-dot" />
                  <span>Powered by Groq • Portfolio Expert</span>
                </div>
              </div>
              <div className="chatbot-header-actions">
                <button onClick={resetChat} className="chatbot-clear-btn" aria-label="Reset Chat">
                  <RotateCcw size={12} />
                  <span>Clear</span>
                </button>
                <button onClick={() => setIsOpen(false)} className="chatbot-header-btn" aria-label="Close Chat">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="chatbot-messages">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  className={`chat-message-row ${msg.role === 'user' ? 'user' : ''}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className={`chat-avatar ${msg.role === 'user' ? 'user' : 'bot'}`}>
                    {msg.role === 'user' ? <User size={14} /> : <Atom size={14} />}
                  </div>
                  <div className={`chat-bubble ${msg.role === 'user' ? 'user' : 'bot'} ${msg.isError ? 'error' : ''}`}>
                    {msg.steps && msg.steps.length > 0 && (
                      <div className="thought-trace-container">
                        <button 
                          className="thought-trace-header"
                          onClick={() => toggleThinking(i)}
                          type="button"
                        >
                          <span className="thought-header-title">
                            <Info size={11} style={{ marginRight: 4, display: 'inline-block', verticalAlign: 'middle' }} />
                            {msg.isThinkingExpanded ? 'Collapsing Trace' : '✦ Thought Process Trace'}
                          </span>
                          {msg.isThinkingExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                        </button>
                        
                        <AnimatePresence>
                          {msg.isThinkingExpanded && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="thought-trace-steps"
                            >
                              {msg.steps.map((step, sIdx) => (
                                <div key={sIdx} className="thought-step-row">
                                  {step}
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                    
                    <div className="chat-bubble-text">{msg.content}</div>

                    {msg.role === 'assistant' && msg.content && (
                      <div className="chat-bubble-actions">
                        <span className="actions-model-tag">Llama 3.3 (RAG)</span>
                        <button 
                          className="action-btn copy-btn"
                          onClick={() => handleCopy(msg.content, i)}
                          title="Copy reply"
                          type="button"
                        >
                          {copiedIndex === i ? <Check size={11} className="copied-check" /> : <Copy size={11} />}
                        </button>
                      </div>
                    )}

                    {msg.sources && msg.sources.length > 0 && (
                      <div className="chat-sources-row">
                        <span className="sources-label">Sources:</span>
                        {msg.sources.map((s, idx) => (
                          <span key={idx} className="source-chip" title={`Section: ${s.section}`}>
                            {s.source}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isLoading && (!messages.length || messages[messages.length - 1]?.role !== 'assistant' || !messages[messages.length - 1]?.content) && (
                <motion.div className="chat-message-row" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="chat-avatar bot"><Atom size={14} /></div>
                  <div className="chat-bubble bot">
                    <div className="typing-indicator">
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            <AnimatePresence>
              {showSuggestions && !isLoading && (
                <motion.div
                  className="chatbot-suggestions"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {SUGGESTED_QUESTIONS.map(q => (
                    <button key={q} className="suggestion-chip" onClick={() => sendMessage(q)}>
                      {q}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input bar */}
            <div className="chatbot-input-bar">
              <div className="chatbot-input-wrapper">
                <input
                  type="text"
                  ref={inputRef}
                  className="chatbot-input"
                  placeholder="Ask anything about Sujith..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button
                  className="chatbot-send-btn"
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isLoading}
                  aria-label="Send message"
                >
                  {isLoading ? <Loader2 size={16} className="spin" style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={14} style={{ marginLeft: '1px' }} />}
                </button>
              </div>
            </div>

            <div className="chatbot-footer">✨ Powered by Groq AI · RAG Technology</div>
          </motion.div>
        )}
      </AnimatePresence>
    </>,
    document.body
  );
}
