import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ScrollReveal, MobileDashboard } from '../components';
import { Code, Briefcase, Mail, ArrowRight, Zap, Send, Atom, Smartphone, Download, RefreshCw, X, Loader2 } from 'lucide-react';
import useGlitchText from '../hooks/useGlitchText';
import useRealtimeData from '../hooks/useRealtimeData';
import { useSmartUpdate } from '../hooks/useSmartUpdate';

export default function Home({ onNavClick }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  const { data: settings } = useRealtimeData('site_settings', { single: true, filter: { column: 'id', value: 1 } });
  const nameText = useGlitchText("Sujith Thota", 100);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const triggerResume = () => {
    window.dispatchEvent(new CustomEvent('open-resume'));
  };

  // Typing typewriter component ONLY for desktop
  function DesktopTypewriter() {
    const [text, setText] = useState('');
    const [roleIndex, setRoleIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const roles = ["Building Modern Web Apps", "Exploring Data Science", "Solving Complex Problems"];

    useEffect(() => {
      const currentRole = roles[roleIndex];
      let timer;

      if (!isDeleting && text === currentRole) {
        timer = setTimeout(() => setIsDeleting(true), 2500);
      } else if (isDeleting && text === '') {
        setIsDeleting(false);
        setRoleIndex((prev) => (prev + 1) % roles.length);
      } else {
        const speed = isDeleting ? 25 : Math.random() * 40 + 50;
        timer = setTimeout(() => {
          const nextText = isDeleting
            ? currentRole.substring(0, text.length - 1)
            : currentRole.substring(0, text.length + 1);
          setText(nextText);
        }, speed);
      }

      return () => clearTimeout(timer);
    }, [text, isDeleting, roleIndex]);

    return (
      <div style={{ display: 'flex', alignItems: 'center', whiteSpace: 'pre' }}>
        <span style={{ color: 'var(--primary-blue)', fontWeight: 700, marginRight: '10px', letterSpacing: '-1px' }}>{'>_'}</span>
        <span style={{ color: 'var(--text-primary)' }}>
          {text}<span className="typing-cursor"></span>
        </span>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="home-content home-pane" style={{ height: '100%', width: '100%' }}>
        <MobileDashboard onNavClick={onNavClick} />
      </div>
    );
  }

  // ── Right Panel: embedded chat state ─────────────────────────────────────
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: "Hi! 👋 I'm Sujith's AI assistant. Ask me anything about his skills, projects, or availability!" }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);
  const { showToast, countdown, reload, dismiss, cancelCountdown, needRefresh } = useSmartUpdate();
  const [showInstall, setShowInstall] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  const sendPanelChat = async () => {
    const text = chatInput.trim();
    if (!text || chatLoading) return;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: text }]);
    setChatLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: chatMessages.slice(-6).map(m => ({ role: m.role, content: m.content })) })
      });
      if (!res.ok || !res.body) throw new Error('API error');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = '';
      setChatMessages(prev => [...prev, { role: 'assistant', content: '' }]);
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        chunk.split('\n').forEach(line => {
          if (line.startsWith('data: ')) {
            try { const d = JSON.parse(line.slice(6)); if (d.delta) full += d.delta; } catch {}
          }
        });
        setChatMessages(prev => prev.map((m, i) => i === prev.length - 1 ? { ...m, content: full } : m));
      }
    } catch {
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again!' }]);
    }
    setChatLoading(false);
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      setShowInstall(false);
    }
  };

  return (
    <ScrollReveal className="home-content home-pane" style={{ height: 'calc(100vh - 138px)', overflow: 'hidden', display: 'flex', alignItems: 'stretch', boxSizing: 'border-box', gap: 0 }}>
      <style>{`
        /* Desktop styles (Default) */
        .home-content .home-outer {
          display: flex;
          width: 100%;
          height: 100%;
          gap: 20px;
          align-items: stretch;
        }
        .home-content .home-left {
          flex: 0 0 65%;
          display: flex;
          align-items: center;
        }
        .home-content .home-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 40px;
          align-items: center;
          width: 100%;
        }
        /* Right AI Panel */
        .home-content .home-right-panel {
          flex: 0 0 35%;
          display: flex;
          flex-direction: column;
          gap: 10px;
          height: 100%;
          padding: 6px 0;
          box-sizing: border-box;
          overflow: hidden;
        }
        .home-content .hrp-notifications {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex-shrink: 0;
        }
        .home-content .hrp-notif-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 12px 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .home-content .hrp-notif-card.update {
          border-color: color-mix(in srgb, var(--primary-blue) 30%, var(--border-color));
          background: color-mix(in srgb, var(--primary-blue) 5%, var(--bg-secondary));
        }
        .home-content .hrp-notif-card.install {
          border-color: color-mix(in srgb, #10b981 30%, var(--border-color));
          background: color-mix(in srgb, #10b981 5%, var(--bg-secondary));
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .home-content .hrp-notif-icon {
          width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .home-content .hrp-notif-icon.blue { background: color-mix(in srgb, var(--primary-blue) 12%, transparent); color: var(--primary-blue); }
        .home-content .hrp-notif-icon.green { background: color-mix(in srgb, #10b981 12%, transparent); color: #10b981; }
        .home-content .hrp-notif-info { flex: 1; min-width: 0; }
        .home-content .hrp-notif-title { font-size: 12.5px; font-weight: 700; color: var(--text-primary); margin: 0; }
        .home-content .hrp-notif-sub { font-size: 11px; color: var(--text-secondary); margin: 2px 0 0; }
        .home-content .hrp-notif-actions { display: flex; gap: 6px; flex-shrink: 0; }
        .home-content .hrp-notif-btn {
          padding: 5px 10px; border-radius: 6px;
          font-size: 11.5px; font-weight: 700; cursor: pointer;
          border: none; transition: all 0.15s ease;
        }
        .home-content .hrp-notif-btn.primary { background: var(--text-primary); color: var(--bg-primary); }
        .home-content .hrp-notif-btn.primary:hover { opacity: 0.85; }
        .home-content .hrp-notif-btn.ghost {
          background: transparent; color: var(--text-secondary);
          border: 1px solid var(--border-color); width: 28px; height: 28px;
          padding: 0; display: flex; align-items: center; justify-content: center; border-radius: 6px;
        }
        /* Embedded Chat Panel */
        .home-content .hrp-chat {
          flex: 1;
          min-height: 0;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
        }
        [data-theme="dark"] .home-content .hrp-chat { box-shadow: 0 4px 20px rgba(0,0,0,0.25); }
        .home-content .hrp-chat-header {
          padding: 12px 16px;
          background: var(--text-primary);
          display: flex; align-items: center; gap: 10px; flex-shrink: 0;
          border-radius: 16px 16px 0 0;
        }
        .home-content .hrp-chat-header-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: var(--bg-secondary); display: flex; align-items: center;
          justify-content: center; color: var(--text-primary); flex-shrink: 0;
        }
        .home-content .hrp-chat-title { font-size: 13px; font-weight: 700; color: var(--bg-primary); margin: 0; }
        .home-content .hrp-chat-status {
          font-size: 10.5px; color: var(--bg-primary); opacity: 0.7;
          display: flex; align-items: center; gap: 4px; margin-top: 2px;
        }
        .home-content .hrp-chat-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #4ade80;
          animation: statusPulse 2s infinite;
        }
        @keyframes statusPulse {
          0%, 100% { opacity: 1; } 50% { opacity: 0.4; }
        }
        .home-content .hrp-messages {
          flex: 1; overflow-y: auto; padding: 12px 14px;
          display: flex; flex-direction: column; gap: 10px;
          scroll-behavior: smooth;
        }
        .home-content .hrp-messages::-webkit-scrollbar { width: 3px; }
        .home-content .hrp-messages::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.25); border-radius: 2px; }
        .home-content .hrp-msg { display: flex; gap: 7px; align-items: flex-end; }
        .home-content .hrp-msg.user { flex-direction: row-reverse; }
        .home-content .hrp-msg-avatar {
          width: 24px; height: 24px; border-radius: 50%;
          background: var(--text-primary); color: var(--bg-primary);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          font-size: 10px;
        }
        .home-content .hrp-msg-avatar.user { background: color-mix(in srgb, var(--primary-blue) 15%, var(--bg-primary)); color: var(--primary-blue); }
        .home-content .hrp-bubble {
          max-width: 78%; padding: 9px 12px; border-radius: 14px 14px 14px 2px;
          font-size: 12px; line-height: 1.5; color: var(--text-primary);
          background: var(--bg-primary); border: 1px solid var(--border-color);
        }
        .home-content .hrp-msg.user .hrp-bubble {
          background: var(--text-primary); color: var(--bg-primary);
          border-color: transparent; border-radius: 14px 14px 2px 14px;
        }
        .home-content .hrp-typing {
          display: flex; gap: 4px; align-items: center;
          padding: 9px 12px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 14px 14px 14px 2px;
          width: fit-content;
        }
        .home-content .hrp-typing span {
          width: 5px; height: 5px; border-radius: 50%;
          background: var(--text-secondary); animation: typingBounce 1.2s infinite;
        }
        .home-content .hrp-typing span:nth-child(2) { animation-delay: 0.2s; }
        .home-content .hrp-typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
        .home-content .hrp-input-row {
          padding: 10px 12px;
          border-top: 1px solid var(--border-color);
          display: flex; gap: 8px; align-items: center; flex-shrink: 0;
        }
        .home-content .hrp-input {
          flex: 1; border: 1px solid var(--border-color);
          border-radius: 10px; padding: 8px 12px;
          font-size: 12px; background: var(--bg-primary);
          color: var(--text-primary); outline: none;
          transition: border-color 0.2s;
        }
        .home-content .hrp-input:focus { border-color: var(--primary-blue); }
        .home-content .hrp-input::placeholder { color: var(--text-muted); }
        .home-content .hrp-send {
          width: 34px; height: 34px; border-radius: 10px;
          background: var(--text-primary); border: none;
          color: var(--bg-primary); cursor: pointer; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          transition: opacity 0.2s;
        }
        .home-content .hrp-send:disabled { opacity: 0.45; cursor: default; }
        .home-content .hrp-send:not(:disabled):hover { opacity: 0.85; }
        
        .home-content .hero-info {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .home-content .hero-greeting {
          font-size: 13.5px;
          font-weight: 600;
          color: var(--text-secondary);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        .home-content h1.hero-title-main {
          font-size: 56px;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1.1;
          margin: 0;
          letter-spacing: -0.02em;
        }
        
        .home-content .hero-typewriter-container {
          height: 36px;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 12px;
          color: var(--text-secondary);
          font-size: 16px;
          font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          padding: 8px 16px;
          border-radius: 8px;
          width: fit-content;
        }

        .home-content .typing-cursor {
          display: inline-block;
          width: 8px;
          height: 16px;
          background: var(--primary-blue);
          margin-left: 4px;
          vertical-align: middle;
          animation: blink 1s step-end infinite;
        }
        
        .home-content p.hero-subtitle-text {
          font-size: 16px;
          color: var(--text-secondary);
          line-height: 1.6;
          max-width: 480px;
          margin: 16px 0 0;
        }

        .home-content .fc-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 6px 14px;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--text-primary);
          width: fit-content;
          margin-bottom: 12px;
          position: relative;
          overflow: hidden;
          transition: all 0.35s cubic-bezier(0.16,1,0.3,1);
          box-shadow: 0 2px 10px rgba(0,0,0,0.02);
          cursor: default;
        }
        .home-content .fc-badge:hover {
          border-color: rgba(16,185,129,0.5);
          box-shadow: 0 4px 20px rgba(16,185,129,0.15), 0 0 0 1px rgba(16,185,129,0.1);
          transform: translateY(-1px);
        }

        .home-content .fc-badge::before {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.6), transparent);
          transform: skewX(-20deg);
          animation: shine 5s infinite;
          pointer-events: none;
        }
        [data-theme="dark"] .home-content .fc-badge::before {
          background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.1), transparent);
        }

        @keyframes shine {
          0% { left: -100%; }
          15% { left: 200%; }
          100% { left: 200%; }
        }
        
        .home-content .fc-badge-dot-wrap {
          position: relative;
          width: 12px;
          height: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        /* Glowing core dot */
        .home-content .fc-badge-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 6px 2px rgba(16,185,129,0.6), 0 0 12px 4px rgba(16,185,129,0.25);
          position: relative;
          z-index: 3;
          animation: dotGlow 2.4s ease-in-out infinite;
        }
        @keyframes dotGlow {
          0%, 100% { box-shadow: 0 0 6px 2px rgba(16,185,129,0.6), 0 0 12px 4px rgba(16,185,129,0.25); }
          50%       { box-shadow: 0 0 8px 3px rgba(16,185,129,0.9), 0 0 20px 6px rgba(16,185,129,0.4); }
        }

        /* Ring 1 — fastest */
        .home-content .fc-badge-dot-wrap::before {
          content: '';
          position: absolute;
          width: 100%; height: 100%;
          border-radius: 50%;
          border: 1.5px solid rgba(16,185,129,0.7);
          animation: sonarRing 2.4s cubic-bezier(0,0,0.2,1) infinite;
          z-index: 2;
        }
        /* Ring 2 — slower, delayed */
        .home-content .fc-badge-dot-wrap::after {
          content: '';
          position: absolute;
          width: 100%; height: 100%;
          border-radius: 50%;
          border: 1px solid rgba(16,185,129,0.45);
          animation: sonarRing 2.4s cubic-bezier(0,0,0.2,1) 0.8s infinite;
          z-index: 1;
        }
        @keyframes sonarRing {
          0%   { transform: scale(1);   opacity: 0.85; }
          70%  { transform: scale(3.8); opacity: 0; }
          100% { transform: scale(3.8); opacity: 0; }
        }

        .home-content .home-quick-actions {
          display: flex;
          gap: 12px;
          margin-top: 32px;
          flex-wrap: wrap;
        }

        .home-content .qa-card {
          flex: 1;
          min-width: 130px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
          text-align: left;
        }
        .home-content .qa-card:hover {
          border-color: var(--primary-blue);
          transform: translateY(-2px);
          box-shadow: 0 10px 20px -10px rgba(0,0,0,0.1);
        }
        [data-theme="dark"] .home-content .qa-card:hover {
          box-shadow: 0 10px 20px -10px rgba(0,0,0,0.5);
        }
        
        .home-content .qa-icon-wrap {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-primary);
          transition: all 0.2s ease;
        }
        .home-content .qa-card:hover .qa-icon-wrap {
          background: var(--primary-blue);
          border-color: var(--primary-blue);
          color: white;
        }

        .home-content .qa-title {
          font-size: 13.5px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .home-content .qa-arrow {
          opacity: 0;
          transform: translateX(-5px);
          transition: all 0.2s ease;
          color: var(--primary-blue);
        }
        .home-content .qa-card:hover .qa-arrow {
          opacity: 1;
          transform: translateX(0);
        }

        .home-content .home-image-side {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .home-content .hero-img-new {
          width: 100%;
          max-width: 380px;
          aspect-ratio: 1;
          border-radius: 24px;
          object-fit: cover;
          border: 1px solid var(--border-color);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        [data-theme="dark"] .home-content .hero-img-new {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .home-content .hero-img-new:hover {
          transform: scale(1.02);
        }

        /* ============================================
           MOBILE DASHBOARD APP UI (<= 900px)
           ============================================ */
        @media (max-width: 900px) {
          .home-content.home-pane {
            height: 100%;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            box-sizing: border-box;
            width: 100%;
            padding: 0;
            gap: 16px;
          }

          .mobile-dashboard {
            display: flex;
            flex-direction: column;
            gap: 16px;
            width: 100%;
            height: 100%;
            justify-content: flex-start;
            overflow: hidden;
          }

          .dashboard-profile-card {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 20px;
            padding: 20px 24px;
            display: flex;
            align-items: center;
            gap: 16px;
            box-shadow: var(--shadow-sm);
            text-align: left;
            flex-shrink: 0;
          }

          .dashboard-avatar {
            width: 64px;
            height: 64px;
            border-radius: 16px;
            border: 1.5px solid var(--primary-blue);
            object-fit: cover;
            flex-shrink: 0;
          }

          .dashboard-welcome {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }

          .dashboard-welcome h3 {
            font-size: 11px;
            font-weight: 600;
            color: var(--text-secondary);
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          .dashboard-welcome h2 {
            font-size: 18px;
            font-weight: 800;
            color: var(--text-primary);
            margin: 0;
            letter-spacing: -0.02em;
            line-height: 1.2;
          }

          .dashboard-status {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            color: #10b981;
            font-size: 10.5px;
            font-weight: 700;
            margin-top: 2px;
          }

          .status-dot {
            width: 6px;
            height: 6px;
            background: #10b981;
            border-radius: 50%;
            display: inline-block;
            animation: status-pulse 2s infinite;
          }

          @keyframes status-pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.5); opacity: 0.3; }
            100% { transform: scale(1); opacity: 1; }
          }

          .dashboard-stats-row {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
            flex-shrink: 0;
          }

          .stat-card {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 14px;
            padding: 10px 4px;
            text-align: center;
            box-shadow: var(--shadow-sm);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }

          .stat-card h4 {
            font-size: 16px;
            font-weight: 800;
            color: var(--primary-blue);
            margin: 0 0 2px 0;
            line-height: 1.1;
          }

          .stat-card p {
            font-size: 8.5px;
            font-weight: 650;
            color: var(--text-muted);
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 0.02em;
          }

          .dashboard-bio-card {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 20px;
            padding: 16px 20px;
            box-shadow: var(--shadow-sm);
            text-align: left;
            flex-shrink: 0;
            display: flex;
            align-items: center;
          }

          .dashboard-bio-card p {
            font-size: 12.5px;
            color: var(--text-secondary);
            line-height: 1.5;
            margin: 0;
          }

          /* Action links grid: expands to utilize available vertical space intelligently */
          .dashboard-links-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: repeat(2, 1fr);
            gap: 12px;
            flex-grow: 1;
            min-height: 160px;
          }

          .dashboard-link-card {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 10px 12px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 4px;
            box-shadow: var(--shadow-sm);
            text-align: left;
            cursor: pointer;
            box-sizing: border-box;
            outline: none;
            overflow: hidden;
            transition: border-color 0.15s ease, background 0.15s ease;
          }

          .dashboard-link-card:active {
            border-color: var(--primary-blue);
            background: rgba(0,123,255,0.04);
          }

          .card-icon-box {
            width: 28px;
            height: 28px;
            border-radius: 8px;
            background: rgba(0,123,255,0.1);
            color: var(--primary-blue);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 4px;
            flex-shrink: 0;
          }

          .dashboard-link-card h4 {
            font-size: 12px;
            font-weight: 700;
            color: var(--text-primary);
            margin: 0;
            line-height: 1.2;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .dashboard-link-card p {
            font-size: 9px;
            color: var(--text-muted);
            margin: 0;
            line-height: 1.3;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        }
      `}</style>

      {/* Desktop: outer split wrapper */}
      <div className="home-outer">

        {/* LEFT 65% — hero content */}
        <div className="home-left">
        <div className="home-grid">
          <div className="hero-info">
            {(settings === null || settings.is_available_for_hire) && (
              <div className="fc-badge">
                <div className="fc-badge-dot-wrap">
                  <div className="fc-badge-dot" />
                </div>
                Available for Opportunities
              </div>
            )}

            <div>
              <div className="hero-greeting">{getGreeting()}</div>
              <h1 className="hero-title-main">{nameText}</h1>
              
              <div className="hero-typewriter-container">
                <DesktopTypewriter />
              </div>
              
              <p className="hero-subtitle-text" dangerouslySetInnerHTML={{ __html: settings?.hero_headline || "A passionate <strong>B.Tech Graduate from VIT (8.7 CGPA)</strong>, actively exploring the boundaries between complex data logic and seamless web experiences." }} />
            </div>

            <div className="home-quick-actions">
              <button className="qa-card" onClick={() => onNavClick?.('skills')}>
                <div className="qa-icon-wrap"><Code size={16} /></div>
                <div className="qa-title">
                  Core Skills <ArrowRight size={14} className="qa-arrow" />
                </div>
              </button>
              <button className="qa-card" onClick={() => onNavClick?.('projects')}>
                <div className="qa-icon-wrap"><Briefcase size={16} /></div>
                <div className="qa-title">
                  Projects <ArrowRight size={14} className="qa-arrow" />
                </div>
              </button>
              <button className="qa-card" onClick={() => onNavClick?.('contact')}>
                <div className="qa-icon-wrap"><Mail size={16} /></div>
                <div className="qa-title">
                  Contact Me <ArrowRight size={14} className="qa-arrow" />
                </div>
              </button>
            </div>
            </div>
          
          <div className="home-image-side">
            <img src="/IMG_0322.jpg" alt="Sujith Thota" className="hero-img-new" />
          </div>
        </div>
        </div>{/* end home-left */}

        {/* RIGHT 35% — AI Panel */}
        <div className="home-right-panel">

          {/* ── Notifications ─────────────────────────── */}
          <div className="hrp-notifications">
            {/* Update available */}
            {(showToast) && (
              <div className="hrp-notif-card update">
                <div className="hrp-notif-icon blue"><RefreshCw size={15} /></div>
                <div className="hrp-notif-info">
                  <p className="hrp-notif-title">
                    {countdown !== null ? `Updating in ${countdown}s…` : 'New version available'}
                  </p>
                  <p className="hrp-notif-sub">Reload to apply latest updates</p>
                </div>
                <div className="hrp-notif-actions">
                  {countdown !== null ? (
                    <button className="hrp-notif-btn primary" onClick={cancelCountdown}>Cancel</button>
                  ) : (
                    <>
                      <button className="hrp-notif-btn primary" onClick={reload}>Reload</button>
                      <button className="hrp-notif-btn ghost" onClick={dismiss}><X size={12} /></button>
                    </>
                  )}
                </div>
              </div>
            )}
            {/* Install App */}
            {showInstall && (
              <div className="hrp-notif-card install">
                <div className="hrp-notif-icon green"><Smartphone size={15} /></div>
                <div className="hrp-notif-info">
                  <p className="hrp-notif-title">Install App Experience</p>
                  <p className="hrp-notif-sub">Add to home screen for offline access</p>
                </div>
                <div className="hrp-notif-actions">
                  <button className="hrp-notif-btn primary" style={{ background: '#10b981', color: '#fff' }} onClick={handleInstallClick}>
                    <Download size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />Install
                  </button>
                  <button className="hrp-notif-btn ghost" onClick={() => setShowInstall(false)}><X size={12} /></button>
                </div>
              </div>
            )}
          </div>

          {/* ── Embedded Atom AI Chat ─────────────────── */}
          <div className="hrp-chat">
            {/* Header */}
            <div className="hrp-chat-header">
              <div className="hrp-chat-header-avatar"><Atom size={16} /></div>
              <div>
                <p className="hrp-chat-title">Atom AI</p>
                <div className="hrp-chat-status">
                  <span className="hrp-chat-dot" />
                  <span>Ask me anything about Sujith</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="hrp-messages">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`hrp-msg ${msg.role}`}>
                  <div className={`hrp-msg-avatar ${msg.role === 'user' ? 'user' : ''}`}>
                    {msg.role === 'user' ? 'U' : <Atom size={12} />}
                  </div>
                  <div className="hrp-bubble">{msg.content}</div>
                </div>
              ))}
              {chatLoading && (
                <div className="hrp-msg assistant">
                  <div className="hrp-msg-avatar"><Atom size={12} /></div>
                  <div className="hrp-typing">
                    <span /><span /><span />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="hrp-input-row">
              <input
                className="hrp-input"
                placeholder="Ask about skills, projects…"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendPanelChat()}
              />
              <button className="hrp-send" onClick={sendPanelChat} disabled={!chatInput.trim() || chatLoading}>
                {chatLoading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={14} />}
              </button>
            </div>
          </div>

        </div>{/* end home-right-panel */}
      </div>{/* end home-outer */}


    </ScrollReveal>
  );
}
