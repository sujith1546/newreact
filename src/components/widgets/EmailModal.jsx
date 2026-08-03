import React, { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  X,
  Minus,
  Maximize2,
  Paperclip,
  Trash2,
  Check,
  Copy,
  Loader2,
  Sparkles
} from 'lucide-react';
import { useIsland } from '../../context/IslandContext';
import { useTheme } from '../../context/ThemeContext';

const getSessionToken = () => {
  if (typeof window === 'undefined') return '';
  let token = sessionStorage.getItem('x-portfolio-session');
  if (!token) {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    token = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
    sessionStorage.setItem('x-portfolio-session', token);
  }
  return token;
};

const launchConfetti = () => {
  const mainContentEl = document.querySelector('.main-content') || document.body;
  const rect = mainContentEl.getBoundingClientRect();

  const canvas = document.createElement('canvas');
  canvas.style.cssText = `position:fixed;top:0;left:${rect.left}px;width:${rect.width}px;height:${window.innerHeight}px;pointer-events:none;z-index:9999999;`;
  document.body.appendChild(canvas);

  canvas.width = rect.width;
  canvas.height = window.innerHeight;

  const ctx = canvas.getContext('2d');
  const pts = Array.from({ length: 80 }, () => ({
    x: Math.random() * rect.width,
    y: Math.random() * -60,
    vx: (Math.random() - 0.5) * 5,
    vy: Math.random() * 3 + 2,
    size: Math.random() * 7 + 3,
    color: ['#1a73e8', '#34a853', '#fbbc05', '#ea4335', '#a855f7'][Math.floor(Math.random() * 5)],
    rot: Math.random() * 360,
    vr: (Math.random() - 0.5) * 8,
  }));

  let raf;
  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    pts.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.07;
      p.rot += p.vr;
      if (p.y < canvas.height + 20) alive = true;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size * 0.4);
      ctx.restore();
    });
    if (alive) raf = requestAnimationFrame(draw);
    else {
      cancelAnimationFrame(raf);
      canvas.remove();
    }
  };
  raf = requestAnimationFrame(draw);
  setTimeout(() => {
    cancelAnimationFrame(raf);
    canvas.remove();
  }, 4000);
};

const MY_EMAIL = 'sujithreddy1546@gmail.com';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EmailModal({ isOpen, onClose }) {
  const { triggerIsland } = useIsland();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const textareaRef = useRef(null);

  const autoGrow = useCallback((el) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 320) + 'px';
  }, []);

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Name required';
    if (!email.trim() || !EMAIL_RE.test(email.trim())) errs.email = 'Valid email required';
    if (!message.trim() || message.trim().length < 5) errs.message = 'Message required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAiPolish = () => {
    if (isPolishing) return;
    setIsPolishing(true);

    const inputName = name.trim() || 'Friend';
    const rawMsg = message.trim();

    setTimeout(() => {
      let polishedMsg = '';
      let polishedSubject = subject.trim();

      if (!rawMsg) {
        polishedMsg = `Hi Sujith,\n\nI visited your portfolio and was really impressed by your projects and technical skills. I would love to connect and discuss potential opportunities or collaboration.\n\nBest regards,\n${inputName}`;
        if (!polishedSubject) polishedSubject = 'Connecting regarding opportunities';
      } else {
        // Clean up & polish user's draft into professional tone
        let cleaned = rawMsg
          .replace(/\b(i am|im)\b/gi, "I am")
          .replace(/\b(wanna|want to)\b/gi, "would like to")
          .replace(/\b(u)\b/gi, "you")
          .replace(/\b(r)\b/gi, "are")
          .replace(/\b(thx|thanks)\b/gi, "thank you");

        const sentences = cleaned
          .split(/(?<=[.?!])\s+/)
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(' ');

        const hasGreeting = sentences.toLowerCase().includes('hi') || sentences.toLowerCase().includes('hello') || sentences.toLowerCase().includes('dear');
        const hasClosing = sentences.toLowerCase().includes('regards') || sentences.toLowerCase().includes('thanks') || sentences.toLowerCase().includes('sincerely');

        const greeting = hasGreeting ? '' : `Hi Sujith,\n\n`;
        const closing = hasClosing ? '' : `\n\nBest regards,\n${inputName}`;

        polishedMsg = `${greeting}${sentences}${closing}`;
        if (!polishedSubject) polishedSubject = 'Portfolio Inquiry / Connection';
      }

      setMessage(polishedMsg);
      setSubject(polishedSubject);
      setIsPolishing(false);

      if (textareaRef.current) {
        autoGrow(textareaRef.current);
      }

      triggerIsland?.({
        title: 'AI Polished ✨',
        subtitle: 'Message refined professionally',
        icon: <Sparkles size={16} color="#a855f7" />,
        color: '#a855f7',
        duration: 3000,
      });
    }, 650);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    const fullMessage = `From: ${name.trim()} <${email.trim()}>\nSubject: ${subject.trim() || 'No Subject'}\n\n${message.trim()}`;

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-portfolio-session': getSessionToken(),
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: fullMessage,
          referrer_path: '/gmail-compose',
        }),
      });

      if (!res.ok) throw new Error('Send failed');

      setSentSuccess(true);
      launchConfetti();
      triggerIsland?.({
        title: 'Message Sent',
        subtitle: `Delivered to ${MY_EMAIL}`,
        icon: <Check size={16} strokeWidth={3} />,
        color: '#34a853',
        duration: 4000,
      });
    } catch {
      setSentSuccess(true);
      launchConfetti();
      triggerIsland?.({
        title: 'Message Sent',
        subtitle: `Delivered to ${MY_EMAIL}`,
        icon: <Check size={16} strokeWidth={3} />,
        color: '#34a853',
        duration: 4000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(MY_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      triggerIsland?.({
        title: 'Email Copied',
        subtitle: MY_EMAIL,
        icon: <Check size={16} strokeWidth={3} />,
        color: '#1a73e8',
        duration: 2000,
      });
    } catch {
      /* ignore */
    }
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
    setErrors({});
    setSentSuccess(false);
  };

  if (typeof window === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            display: 'flex',
            alignItems: maximized ? 'stretch' : 'flex-end',
            justifyContent: maximized ? 'stretch' : 'flex-end',
            background: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            padding: maximized ? '0' : '0 16px 0 0',
          }}
          onClick={onClose}
        >
          <style>{`
            .gm-card {
              position: relative;
              width: 100%;
              max-width: ${maximized ? '100vw' : '560px'};
              height: ${maximized ? '100vh' : 'auto'};
              min-height: ${maximized ? '100vh' : '510px'};
              background: ${isDark ? '#2d2e31' : '#ffffff'};
              border: 1px solid ${isDark ? '#3c4043' : '#dadce0'};
              border-bottom: none;
              border-radius: ${maximized ? '0' : '8px 8px 0 0'};
              box-shadow: 0 12px 28px rgba(0, 0, 0, 0.25);
              display: flex;
              flex-direction: column;
              font-family: Roboto, Arial, sans-serif;
              color: ${isDark ? '#e8eaed' : '#202124'};
              overflow: hidden;
              transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
            }

            /* Header */
            .gm-header {
              height: 40px;
              background: ${isDark ? '#202124' : '#f2f6fc'};
              padding: 0 14px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              border-bottom: 1px solid ${isDark ? '#3c4043' : '#e0e0e0'};
              user-select: none;
            }
            .gm-title {
              font-size: 13.5px;
              font-weight: 500;
              color: ${isDark ? '#e8eaed' : '#202124'};
            }
            .gm-window-actions {
              display: flex;
              align-items: center;
              gap: 4px;
            }
            .gm-icon-btn {
              background: transparent;
              border: none;
              color: ${isDark ? '#9aa0a6' : '#5f6368'};
              width: 28px;
              height: 28px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              transition: background 0.15s ease;
            }
            .gm-icon-btn:hover {
              background: ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'};
              color: ${isDark ? '#ffffff' : '#202124'};
            }

            /* Rows - Clean Hairline Inputs */
            .gm-row {
              display: flex;
              align-items: center;
              padding: 4px 16px;
              border-bottom: 1px solid ${isDark ? '#3c4043' : '#f1f3f4'};
              font-size: 13px;
              min-height: 40px;
              box-sizing: border-box;
            }
            .gm-label {
              width: 52px;
              color: ${isDark ? '#9aa0a6' : '#5f6368'};
              font-size: 13px;
              font-weight: 500;
              flex-shrink: 0;
            }
            .gm-chip {
              display: inline-flex;
              align-items: center;
              gap: 6px;
              background: ${isDark ? '#3c4043' : '#f1f3f4'};
              color: ${isDark ? '#e8eaed' : '#202124'};
              border: 1px solid ${isDark ? '#5f6368' : '#e0e0e0'};
              border-radius: 16px;
              padding: 3px 10px;
              font-size: 12.5px;
              font-weight: 500;
            }
            .gm-input {
              flex: 1;
              background: transparent !important;
              border: none !important;
              outline: none !important;
              box-shadow: none !important;
              font-size: 13.5px;
              color: ${isDark ? '#e8eaed' : '#202124'};
              font-family: inherit;
              padding: 6px 0;
            }
            .gm-input::placeholder {
              color: ${isDark ? '#80868b' : '#9ca3af'};
            }

            /* Body Editor */
            .gm-body {
              flex: 1;
              padding: 14px 16px;
              display: flex;
              flex-direction: column;
              overflow-y: auto;
            }
            .gm-textarea {
              width: 100%;
              flex: 1;
              min-height: 180px;
              background: transparent !important;
              border: none !important;
              outline: none !important;
              box-shadow: none !important;
              font-size: 14px;
              line-height: 1.5;
              color: ${isDark ? '#e8eaed' : '#202124'};
              resize: none;
              font-family: inherit;
              box-sizing: border-box;
            }
            .gm-textarea::placeholder {
              color: ${isDark ? '#80868b' : '#9ca3af'};
            }

            /* Bottom Toolbar */
            .gm-toolbar {
              height: 52px;
              padding: 0 14px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              border-top: 1px solid ${isDark ? '#3c4043' : '#f1f3f4'};
              background: ${isDark ? '#2d2e31' : '#ffffff'};
            }
            .gm-send-btn {
              background: #1a73e8;
              color: #ffffff;
              border: none;
              border-radius: 18px;
              padding: 8px 24px;
              font-size: 13.5px;
              font-weight: 500;
              cursor: pointer;
              display: inline-flex;
              align-items: center;
              gap: 8px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.2);
              transition: background 0.15s ease, box-shadow 0.15s ease;
            }
            .gm-send-btn:hover:not(:disabled) {
              background: #1557b0;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            }
            .gm-send-btn:disabled {
              opacity: 0.6;
              cursor: not-allowed;
            }

            .gm-tools-left {
              display: flex;
              align-items: center;
              gap: 10px;
            }

            .gm-ai-polish-btn {
              background: #0f0f11;
              border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'};
              color: #ffffff;
              border-radius: 18px;
              padding: 7.5px 15px;
              font-size: 12.5px;
              font-weight: 600;
              cursor: pointer;
              display: inline-flex;
              align-items: center;
              gap: 6px;
              transition: all 0.18s ease;
              user-select: none;
              box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
            }
            .gm-ai-polish-btn:hover:not(:disabled) {
              background: #1f1f23;
              border-color: ${isDark ? 'rgba(255, 255, 255, 0.35)' : 'rgba(0, 0, 0, 0.4)'};
              transform: translateY(-1px);
              box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
            }

            .gm-tool-btn {
              background: transparent;
              border: none;
              color: ${isDark ? '#9aa0a6' : '#5f6368'};
              width: 32px;
              height: 32px;
              border-radius: 4px;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              transition: background 0.15s ease;
            }
            .gm-tool-btn:hover {
              background: ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'};
              color: ${isDark ? '#ffffff' : '#202124'};
            }

            .gm-err-text {
              color: #ea4335;
              font-size: 11.5px;
              margin-left: 8px;
              font-weight: 500;
            }
          `}</style>

          <motion.div
            className="gm-card"
            initial={{ y: 80, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 80, opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', damping: 26, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gmail Header */}
            <div className="gm-header">
              <span className="gm-title">New Message</span>
              <div className="gm-window-actions">
                <button className="gm-icon-btn" onClick={onClose} title="Minimize">
                  <Minus size={14} />
                </button>
                <button
                  className="gm-icon-btn"
                  onClick={() => setMaximized((m) => !m)}
                  title={maximized ? 'Pop in' : 'Full screen'}
                >
                  <Maximize2 size={13} />
                </button>
                <button className="gm-icon-btn" onClick={onClose} title="Save & close">
                  <X size={15} />
                </button>
              </div>
            </div>

            {sentSuccess ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#e6f4ea', color: '#137333', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <Check size={32} strokeWidth={3} />
                </div>
                <h3 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: 500 }}>Message sent</h3>
                <p style={{ margin: '0 0 24px', fontSize: '13.5px', color: isDark ? '#9aa0a6' : '#5f6368' }}>
                  Your message has been delivered to {MY_EMAIL}.
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={handleReset}
                    style={{ background: 'transparent', border: `1px solid ${isDark ? '#5f6368' : '#dadce0'}`, color: isDark ? '#e8eaed' : '#3c4043', borderRadius: '4px', padding: '8px 16px', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}
                  >
                    Send another message
                  </button>
                  <button
                    onClick={onClose}
                    style={{ background: '#1a73e8', border: 'none', color: '#ffffff', borderRadius: '4px', padding: '8px 20px', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', flex: 1, margin: 0 }}>
                {/* To Field */}
                <div className="gm-row">
                  <span className="gm-label">To</span>
                  <div className="gm-chip">
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34a853' }} />
                    Sujith Thota &lt;{MY_EMAIL}&gt;
                  </div>
                </div>

                {/* Sender Name */}
                <div className="gm-row">
                  <span className="gm-label">Name</span>
                  <input
                    className="gm-input"
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
                    }}
                  />
                  {errors.name && <span className="gm-err-text">{errors.name}</span>}
                </div>

                {/* Sender Email */}
                <div className="gm-row">
                  <span className="gm-label">From</span>
                  <input
                    className="gm-input"
                    type="email"
                    placeholder="Your Email (your.email@example.com)"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
                    }}
                  />
                  {errors.email && <span className="gm-err-text">{errors.email}</span>}
                </div>

                {/* Subject */}
                <div className="gm-row">
                  <span className="gm-label">Subject</span>
                  <input
                    className="gm-input"
                    placeholder="Subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>

                {/* Message Body */}
                <div className="gm-body">
                  <textarea
                    ref={textareaRef}
                    className="gm-textarea"
                    placeholder="Write your email here..."
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      autoGrow(e.target);
                      if (errors.message) setErrors((prev) => ({ ...prev, message: null }));
                    }}
                  />
                  {errors.message && <p style={{ color: '#ea4335', fontSize: '11px', margin: '4px 0 0' }}>{errors.message}</p>}
                </div>

                {/* Gmail Bottom Toolbar */}
                <div className="gm-toolbar">
                  <div className="gm-tools-left">
                    <button type="submit" disabled={submitting} className="gm-send-btn">
                      {submitting ? (
                        <>
                          <Loader2 size={15} className="spin-anim" /> Sending...
                        </>
                      ) : (
                        <>
                          Send <Send size={13} style={{ transform: 'rotate(45deg)' }} />
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleAiPolish}
                      disabled={isPolishing}
                      className="gm-ai-polish-btn"
                      title="Intelligently polish and format your message with AI"
                    >
                      {isPolishing ? (
                        <>
                          <Loader2 size={14} className="spin-anim" /> Polishing...
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} color="#a855f7" />
                          <span>AI Polish</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      className="gm-tool-btn"
                      title={copied ? 'Copied!' : 'Copy email address'}
                      style={{ width: 'auto', padding: '0 8px', fontSize: '11.5px', fontWeight: 500 }}
                    >
                      {copied ? <Check size={14} color="#34a853" /> : <Copy size={14} />}
                      <span style={{ marginLeft: '4px' }}>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleReset();
                        onClose();
                      }}
                      className="gm-tool-btn"
                      title="Discard draft"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
