import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, Bot, User, Atom, RotateCcw, Trash2, Copy, Check, ChevronDown, ChevronUp, Info, Mic, Cpu, Layers, Code, Zap, Paperclip, Volume2, VolumeX } from 'lucide-react';
import { useIsland } from '../context/IslandContext';
import ThoughtTrace from './ThoughtTrace';
import SkillChart from './GenerativeUI/SkillChart';
import ProjectCarousel from './GenerativeUI/ProjectCarousel';
import BentoBox from './GenerativeUI/BentoBox';
import ReactMarkdown from 'react-markdown';

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

// Generate crypto-random session token for API protection
const getSessionToken = () => {
  if (typeof window === 'undefined') return '';
  let token = sessionStorage.getItem('x-portfolio-session');
  if (!token) {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    sessionStorage.setItem('x-portfolio-session', token);
  }
  return token;
};

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  const [messages, setMessages] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('atom-ai-memory');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { console.error('Failed to parse AI memory'); }
      }
    }
    return [WELCOME_MESSAGE];
  });
  
  useEffect(() => {
    // Only save complete, non-error messages to prevent corrupted state
    const toSave = messages.filter(m => !m.isError && (m.role === 'user' || (m.role === 'assistant' && m.content)));
    localStorage.setItem('atom-ai-memory', JSON.stringify(toSave));
  }, [messages]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [attachment, setAttachment] = useState(null); // { file, base64 }
  const fileInputRef = useRef(null);
  const { triggerIsland } = useIsland();

  const speakText = (text) => {
    if (!isVoiceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    
    // Clean markdown and GenUI tags
    const cleanText = text
      .replace(/\[RENDER_SKILLS\]|\[RENDER_PROJECTS\]|\[RENDER_BENTO\]/g, '')
      .replace(/\*\*/g, '')
      .replace(/#/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    // Attempt to pick a good voice if available
    const voices = window.speechSynthesis.getVoices();
    const premiumVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Premium') || v.name.includes('Samantha'));
    if (premiumVoice) utterance.voice = premiumVoice;
    
    window.speechSynthesis.speak(utterance);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      triggerIsland({ title: 'File too large', subtitle: 'Please use an image under 4MB', color: '#ef4444', duration: 3000 });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setAttachment({ file, base64: e.target.result });
    reader.readAsDataURL(file);
  };

  // Web Speech API
  const recognitionRef = useRef(null);
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        sendMessage(transcript);
        setIsRecording(false);
      };

      recognitionRef.current.onerror = () => setIsRecording(false);
      recognitionRef.current.onend = () => setIsRecording(false);
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
      triggerIsland({
        title: 'Listening...',
        subtitle: 'Speak your question for Atom AI',
        icon: <Mic size={18} strokeWidth={2.5} />,
        color: '#ef4444',
        duration: 4000
      });
    }
  };

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

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-chatbot', handleOpen);
    return () => window.removeEventListener('open-chatbot', handleOpen);
  }, []);

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
    if ((!userText && !attachment) || isLoading) return;

    setInput('');
    const currentAttachment = attachment;
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    setHasError(false);
    setMessages(prev => [...prev, { role: 'user', content: userText, image: currentAttachment?.base64 }]);
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
        steps: [],
        isThinkingExpanded: false
      }]);

      // Call our secure backend API
      const sessionToken = getSessionToken();
      const currentContext = window.location.hash || window.location.pathname || 'homepage';
      
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-portfolio-session': sessionToken 
        },
        body: JSON.stringify({ message: userText, image: currentAttachment?.base64, history, contextPath: currentContext })
      });

      if (!res.ok) {
        if (res.status === 429) {
          triggerIsland({
            title: 'Security Alert',
            subtitle: 'Rate limit exceeded. Too many requests.',
            color: '#ef4444',
            duration: 4000
          });
        } else if (res.status === 403) {
          triggerIsland({
            title: 'Unauthorized',
            subtitle: 'Invalid session. Please refresh.',
            color: '#ef4444',
            duration: 4000
          });
        }

        // Fallback removed: Always strictly use the real Groq + Voyage API
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Request failed');
      }

      if (!res.body) throw new Error('Response body is null');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let isFirstChunk = true;
      let finalText = '';
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Keep partial line in buffer
        
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          
          const dataStr = line.slice(6).trim();
          if (dataStr === '[DONE]') continue;
          
          try {
            const data = JSON.parse(dataStr);
            if (data.type === 'step') {
              if (isFirstChunk) {
                setIsLoading(false);
                isFirstChunk = false;
              }
              setMessages(prev => {
                const updated = [...prev];
                const lastIdx = updated.length - 1;
                if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
                  updated[lastIdx] = {
                    ...updated[lastIdx],
                    steps: [...(updated[lastIdx].steps || []), data.step]
                  };
                }
                return updated;
              });
            } else if (data.type === 'agent') {
              setMessages(prev => {
                const updated = [...prev];
                const lastIdx = updated.length - 1;
                if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
                  updated[lastIdx] = {
                    ...updated[lastIdx],
                    agentName: data.name
                  };
                }
                return updated;
              });
            } else if (data.type === 'sources') {
              setMessages(prev => {
                const updated = [...prev];
                const lastIdx = updated.length - 1;
                if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
                  updated[lastIdx] = {
                    ...updated[lastIdx],
                    sources: data.sources
                  };
                }
                return updated;
              });
            } else if (data.type === 'token') {
              finalText += data.token;
              
              if (isFirstChunk) {
                setIsLoading(false);
                isFirstChunk = false;
              }
              
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
      speakText(finalText);
      setMessages(prev => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        // Keep it expanded so the user sees the trace for every message
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
            steps: ['✗ Connection failed']
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
    setHasError(false);
    setInput('');
    localStorage.removeItem('atom-ai-memory');
  };

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
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-primary);
          flex-shrink: 0;
          position: relative;
        }
        .chat-avatar.bot {
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
          max-width: 82%;
          padding: 12px 16px;
          border-radius: 18px;
          font-size: 14px;
          line-height: 1.6;
          word-break: break-word;
          position: relative;
        }
        .chat-bubble.bot {
          background: rgba(243, 244, 246, 0.8);
          color: var(--text-primary);
          border-bottom-left-radius: 6px;
          border: 1px solid rgba(0,0,0,0.05);
          box-shadow: 0 4px 15px rgba(0,0,0,0.03);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        [data-theme="dark"] .chat-bubble.bot {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
        .chat-bubble.user {
          background: var(--text-primary);
          color: var(--bg-primary);
          border-bottom-right-radius: 6px;
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

        /* Markdown Styling */
        .markdown-body p { margin-bottom: 0.75em; }
        .markdown-body p:last-child { margin-bottom: 0; }
        .markdown-body ul, .markdown-body ol { margin-bottom: 0.75em; padding-left: 1.5em; }
        .markdown-body li { margin-bottom: 0.25em; }
        .markdown-body strong { font-weight: 700; color: #3b82f6; }
        [data-theme="dark"] .markdown-body strong { color: #60a5fa; }
        .inline-code {
          background: rgba(128,128,128,0.15);
          padding: 0.15em 0.3em;
          border-radius: 4px;
          font-family: monospace;
          font-size: 0.9em;
          color: #e83e8c;
        }
        [data-theme="dark"] .inline-code { color: #f472b6; }
        
        .code-block-wrapper {
          margin: 12px 0;
          border-radius: 8px;
          overflow: hidden;
          background: #1e1e1e;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .code-block-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #2d2d2d;
          padding: 4px 12px;
          font-size: 11px;
          color: #a0a0a0;
          font-family: monospace;
          text-transform: uppercase;
        }
        .code-copy-btn {
          background: transparent;
          border: none;
          color: #a0a0a0;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: 0.2s;
        }
        .code-copy-btn:hover {
          background: rgba(255,255,255,0.1);
          color: #fff;
        }
        
        .native-code-pre {
          margin: 0;
          padding: 12px;
          overflow-x: auto;
          background: #1e1e1e;
        }
        
        .native-code {
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 12.5px;
          color: #e5e7eb;
          white-space: pre;
        }

        /* Sentient Indicator */
        .sentient-indicator {
          position: relative;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 4px;
        }
        .sentient-core {
          width: 12px;
          height: 12px;
          background: var(--primary-blue, #3b82f6);
          border-radius: 50%;
          box-shadow: 0 0 15px rgba(59,130,246,0.8);
          z-index: 2;
        }
        .sentient-ring {
          position: absolute;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 1px solid rgba(59,130,246,0.4);
          border-top-color: transparent;
          border-bottom-color: transparent;
          z-index: 1;
        }
        .sentient-ring-2 {
          width: 32px;
          height: 32px;
          border: 1px solid rgba(16,185,129,0.3);
          border-left-color: transparent;
          border-right-color: transparent;
        }

        /* Suggestions */
        .chatbot-suggestions {
          padding: 0 16px 12px;
          display: flex;
          flex-wrap: nowrap;
          overflow-x: auto;
          gap: 8px;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none; /* Firefox */
        }
        .chatbot-suggestions::-webkit-scrollbar {
          display: none; /* Chrome, Safari */
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

        /* Mobile Slide-Up Bar */
        @media (max-width: 900px) {
          .chatbot-panel {
            right: 0;
            left: 0;
            bottom: 0;
            width: 100%;
            height: 88dvh;
            max-height: 88dvh;
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;
            border-top-left-radius: 28px;
            border-top-right-radius: 28px;
            z-index: 999999;
            box-shadow: 0 -10px 40px rgba(0,0,0,0.3);
            border-bottom: none;
            border-left: none;
            border-right: none;
          }
          .chatbot-fab {
            bottom: 20px;
            right: 20px;
          }
        }
        /* GenUI */
        .genui-card {
          margin-top: 10px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 12px;
          overflow: hidden;
          position: relative;
        }
        .genui-glow {
          position: absolute; top: -20px; right: -20px; width: 60px; height: 60px;
          background: rgba(59,130,246,0.15); filter: blur(20px); border-radius: 50%;
        }
        
        .mic-btn {
          width: 32px; height: 32px; border-radius: 50%;
          background: transparent; border: none; color: var(--text-secondary);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s; margin-right: 4px;
        }
        .mic-btn:hover { color: var(--text-primary); background: rgba(128,128,128,0.1); }
        .mic-btn.recording { color: #ef4444; background: rgba(239,68,68,0.1); animation: pulseRecord 1.5s infinite; }
        @keyframes pulseRecord { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
        
        .voice-visualizer {
          flex: 1; display: flex; align-items: center; gap: 12px; padding: 0 8px;
        }
        .voice-waves {
          display: flex; align-items: center; gap: 3px; height: 28px;
        }
        .voice-bar {
          width: 4px; background: #ef4444; border-radius: 4px;
        }
        .voice-text {
          font-size: 13px; font-weight: 500; color: #ef4444; animation: fadePulse 1.5s infinite;
        }
        @keyframes fadePulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
        
        .attachment-preview {
          position: relative; height: 36px; padding: 2px; border-radius: 6px; border: 1px solid var(--border-color);
          display: flex; align-items: center; justify-content: center; background: var(--bg-primary); margin-right: 8px;
        }
        .attachment-img {
          height: 100%; border-radius: 4px; object-fit: cover;
        }
        .attachment-remove {
          position: absolute; top: -6px; right: -6px; width: 16px; height: 16px; border-radius: 50%;
          background: #ef4444; color: #fff; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
        }
      `}</style>

      {/* Generative UI Inline Components */}
      {(() => {
        const GenUISkills = () => (
          <div className="genui-card">
            <div className="genui-glow" style={{ background: 'rgba(16,185,129,0.15)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(16,185,129,0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Cpu size={14} /></div>
              <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>Interactive Skills</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {['Python (92%)', 'TensorFlow', 'Pandas', 'React', 'FastAPI'].map(s => (
                <span key={s} style={{ fontSize: '11px', fontWeight: 600, padding: '4px 8px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>{s}</span>
              ))}
            </div>
          </div>
        );

        const GenUIProjects = () => (
          <div className="genui-card">
            <div className="genui-glow" style={{ background: 'rgba(59,130,246,0.15)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Layers size={14} /></div>
              <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>Top Projects</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', fontSize: '11px', color: 'var(--text-primary)' }}>
                <strong>SMS Finance Analyzer</strong> • RAG Pipeline & Fraud Detection
              </div>
              <div style={{ padding: '8px', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', fontSize: '11px', color: 'var(--text-primary)' }}>
                <strong>Financial Sentiment</strong> • FinBERT LLM Fine-Tuning
              </div>
            </div>
          </div>
        );

        // ... we assign these to the main component scope automatically via lexical scope
        return null;
      })()}
      {!isMobile && (
        <motion.button
          className="chatbot-fab"
          drag={false}
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
      )}

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile Backdrop */}
            {isMobile && (
              <motion.div
                className="chatbot-mobile-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                style={{
                  position: 'fixed', inset: 0,
                  background: 'rgba(0,0,0,0.4)',
                  backdropFilter: 'blur(4px)',
                  zIndex: 999998
                }}
              />
            )}
            <motion.div
              className="chatbot-panel"
              initial={isMobile ? { opacity: 0, y: '100%' } : { opacity: 0, y: 20, scale: 0.95 }}
              animate={isMobile ? { opacity: 1, y: 0 } : { opacity: 1, y: 0, scale: 1 }}
              exit={isMobile ? { opacity: 0, y: '100%' } : { opacity: 0, y: 20, scale: 0.95 }}
              transition={
                isMobile 
                  ? { type: 'spring', damping: 30, stiffness: 350 }
                  : { type: 'spring', damping: 25, stiffness: 300 }
              }
            >
              {isMobile && (
                <div style={{ width: '100%', display: 'flex', justifyContent: 'center', paddingTop: '12px', paddingBottom: '4px', background: 'var(--text-primary)' }}>
                  <div style={{ width: '40px', height: '5px', borderRadius: '4px', background: 'var(--bg-primary)', opacity: 0.4 }} />
                </div>
              )}
              {/* Header */}
            <div className="chatbot-header">
              <div className="chatbot-header-info">
                <p className="chatbot-header-name">Ask Sujith AI</p>
                <div className="chatbot-header-status">
                  <div className="chatbot-online-dot" />
                  <span>Powered by Groq • Portfolio Expert</span>
                </div>
              </div>
              <div className="chatbot-header-actions">
                <button 
                  onClick={() => setIsVoiceEnabled(!isVoiceEnabled)} 
                  className={`chatbot-header-btn ${isVoiceEnabled ? 'active' : ''}`} 
                  title={isVoiceEnabled ? "Mute Voice" : "Enable Voice"}
                >
                  {isVoiceEnabled ? <Volume2 size={16} color="#10b981" /> : <VolumeX size={16} />}
                </button>
                <button onClick={() => { setMessages([WELCOME_MESSAGE]); setHasError(false); }} className="chatbot-header-btn" title="Clear Chat">
                  <RotateCcw size={16} />
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
                    {msg.role === 'assistant' && isSpeaking && i === messages.length - 1 && (
                      <div className="speaking-wave">
                        <span style={{ animationDelay: '0s' }}></span>
                        <span style={{ animationDelay: '0.2s' }}></span>
                        <span style={{ animationDelay: '0.4s' }}></span>
                      </div>
                    )}
                  </div>
                  <div className={`chat-bubble ${msg.role === 'user' ? 'user' : 'bot'} ${msg.isError ? 'error' : ''}`}>
                    {msg.steps && msg.steps.length > 0 && (
                      <ThoughtTrace steps={msg.steps} />
                    )}
                    
                    {msg.image && (
                      <div style={{ marginBottom: '8px' }}>
                        <img src={msg.image} alt="User attachment" style={{ maxWidth: '100%', borderRadius: '8px' }} />
                      </div>
                    )}
                    
                    {msg.role === 'assistant' && !msg.content && i === messages.length - 1 && isLoading ? (
                      <div className="sentient-indicator">
                        <motion.div 
                          className="sentient-core"
                          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360], filter: ['blur(2px)', 'blur(4px)', 'blur(2px)'] }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        />
                        <motion.div 
                          className="sentient-ring"
                          animate={{ rotate: [360, 0] }}
                          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                        />
                        <motion.div 
                          className="sentient-ring sentient-ring-2"
                          animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                        />
                      </div>
                    ) : (
                      <div className="chat-bubble-text markdown-body">
                        {msg.role === 'assistant' ? (
                          <>
                            <ReactMarkdown
                              components={{
                                code({node, inline, className, children, ...props}) {
                                  const match = /language-(\w+)/.exec(className || '')
                                  return !inline ? (
                                    <div className="code-block-wrapper">
                                      <div className="code-block-header">
                                        <span className="code-lang">{match ? match[1] : 'code'}</span>
                                        <button className="code-copy-btn" onClick={() => navigator.clipboard.writeText(String(children))} title="Copy Code">
                                          <Copy size={12} />
                                        </button>
                                      </div>
                                      <pre className="native-code-pre">
                                        <code className="native-code" {...props}>
                                          {String(children).replace(/\n$/, '')}
                                        </code>
                                      </pre>
                                    </div>
                                  ) : (
                                    <code className="inline-code" {...props}>
                                      {children}
                                    </code>
                                  )
                                }
                              }}
                            >
                              {msg.content.replace(/\[RENDER_SKILLS\]|\[RENDER_PROJECTS\]|\[RENDER_BENTO\]/g, '').trim()}
                            </ReactMarkdown>
                            
                            {/* Generative UI Components */}
                            {msg.content.includes('[RENDER_SKILLS]') && <SkillChart />}
                            {msg.content.includes('[RENDER_PROJECTS]') && <ProjectCarousel />}
                            {msg.content.includes('[RENDER_BENTO]') && <BentoBox />}
                          </>
                        ) : (
                          msg.content
                        )}
                      </div>
                    )}

                    {/* Generative UI Rendering */}
                    {msg.content.includes('[RENDER_SKILLS]') && (
                      <div className="genui-card">
                        <div className="genui-glow" style={{ background: 'rgba(16,185,129,0.15)' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(16,185,129,0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Cpu size={14} /></div>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>My Top Skills</span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {['Python', 'TensorFlow', 'Scikit-learn', 'React', 'FastAPI', 'Pandas'].map(s => (
                            <span key={s} style={{ fontSize: '11px', fontWeight: 600, padding: '4px 8px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>{s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {msg.content.includes('[RENDER_PROJECTS]') && (
                      <div className="genui-card">
                        <div className="genui-glow" style={{ background: 'rgba(59,130,246,0.15)' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Layers size={14} /></div>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>Featured Projects</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ padding: '8px', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', fontSize: '11px', color: 'var(--text-primary)' }}>
                            <strong>SMS Finance Analyzer</strong> • Privacy-first RAG Pipeline
                          </div>
                          <div style={{ padding: '8px', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', fontSize: '11px', color: 'var(--text-primary)' }}>
                            <strong>Financial Sentiment</strong> • FinBERT Model Fine-Tuning
                          </div>
                        </div>
                      </div>
                    )}

                    {msg.role === 'assistant' && (
                      <div className="chat-bubble-actions">
                        <span className="actions-model-tag">{msg.agentName || 'Llama 3.3 (RAG)'}</span>
                        {msg.content && (
                          <button 
                            className="action-btn copy-btn"
                            onClick={() => handleCopy(msg.content, i)}
                            title="Copy reply"
                            type="button"
                          >
                            {copiedIndex === i ? <Check size={11} className="copied-check" /> : <Copy size={11} />}
                          </button>
                        )}
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


              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions - Always visible now */}
            <div className="chatbot-suggestions">
              {SUGGESTED_QUESTIONS.map(q => (
                <button key={q} className="suggestion-chip" onClick={() => sendMessage(q)} disabled={isLoading}>
                  {q}
                </button>
              ))}
            </div>

            {/* Input bar */}
            <div className="chatbot-input-bar">
              <div className="chatbot-input-wrapper">
                <button
                  className={`mic-btn ${isRecording ? 'recording' : ''}`}
                  onClick={toggleRecording}
                  title="Voice command (Siri mode)"
                  type="button"
                >
                  <Mic size={16} />
                </button>
                {isRecording ? (
                  <div className="voice-visualizer">
                    <div className="voice-waves">
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="voice-bar"
                          animate={{ height: ['4px', `${12 + Math.random() * 16}px`, '4px'] }}
                          transition={{ duration: 0.5 + Math.random() * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.1 }}
                        />
                      ))}
                    </div>
                    <span className="voice-text">Listening...</span>
                  </div>
                ) : (
                  <>
                    <button
                      className="mic-btn"
                      onClick={() => fileInputRef.current?.click()}
                      title="Attach image for Vision AI"
                      type="button"
                    >
                      <Paperclip size={16} />
                    </button>
                    <input 
                      type="file" 
                      accept="image/*" 
                      ref={fileInputRef} 
                      style={{ display: 'none' }} 
                      onChange={handleFileChange} 
                    />
                    
                    {attachment && (
                      <div className="attachment-preview">
                        <img src={attachment.base64} alt="Attachment" className="attachment-img" />
                        <button className="attachment-remove" onClick={() => setAttachment(null)}><X size={12} /></button>
                      </div>
                    )}
                    <input
                      type="text"
                      ref={inputRef}
                      className="chatbot-input"
                      placeholder="Ask anything about Sujith..."
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={isRecording}
                    />
                  </>
                )}
                <button
                  className="chatbot-send-btn"
                  onClick={() => sendMessage()}
                  disabled={(!input.trim() && !attachment) || isLoading}
                  aria-label="Send message"
                >
                  {isLoading ? <Loader2 size={16} className="spin" style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={14} style={{ marginLeft: '1px' }} />}
                </button>
              </div>
            </div>

            <div className="chatbot-footer">✨ Powered by Groq AI · RAG Technology</div>
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </>,
    document.body
  );
}
