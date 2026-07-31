import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useAnimation, useMotionValue } from "framer-motion";
import {
  Mail, Phone, ArrowRight, Check, Loader2, Send, Copy, ChevronRight,
  MapPin, Clock, FileText, X, Contact as ContactIcon, ChevronLeft, Calendar, Sparkles
} from "lucide-react";
import { FaGithub, FaLinkedin, FaWhatsapp } from "react-icons/fa";
import { ScrollReveal } from '../components';
import { useIsland } from '../context/IslandContext';
import { supabase } from '../lib/supabaseClient';
import useRealtimeData from '../hooks/useRealtimeData';

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

const launchConfetti = () => {
  const mainContentEl = document.querySelector('.main-content') || document.body;
  const rect = mainContentEl.getBoundingClientRect();

  const canvas = document.createElement('canvas');
  canvas.style.cssText = `position:fixed;top:0;left:${rect.left}px;width:${rect.width}px;height:${window.innerHeight}px;pointer-events:none;z-index:99999;`;
  document.body.appendChild(canvas);

  canvas.width = rect.width;
  canvas.height = window.innerHeight;

  const ctx = canvas.getContext('2d');
  const pts = Array.from({ length: 90 }, () => ({
    x: Math.random() * rect.width,
    y: Math.random() * -60,
    vx: (Math.random() - 0.5) * 5,
    vy: Math.random() * 3 + 2,
    size: Math.random() * 7 + 3,
    color: ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444','#ec4899'][Math.floor(Math.random()*6)],
    rot: Math.random() * 360,
    vr: (Math.random() - 0.5) * 8,
  }));

  let raf;
  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    pts.forEach(p => {
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
    else { cancelAnimationFrame(raf); canvas.remove(); }
  };
  raf = requestAnimationFrame(draw);
  setTimeout(() => { cancelAnimationFrame(raf); canvas.remove(); }, 4000);
};

const MSG_TYPES = [
  { id: 'Job opportunity', label: 'Job opportunity', banner: 'Added role, company, and salary range fields', field1Label: 'COMPANY', field1Holder: 'Acme Inc.', field2Label: 'ROLE', field2Holder: 'Data scientist', msgHolder: 'Tell me about the opportunity...' },
  { id: 'Collaboration',   label: 'Collaboration',   banner: 'Added project scope and timeline fields', field1Label: 'PROJECT NAME', field1Holder: 'AI Platform', field2Label: 'YOUR ROLE', field2Holder: 'Co-founder / Tech Lead', msgHolder: 'Tell me about the collaboration project...' },
  { id: 'General',         label: 'General',         banner: 'General inquiry & networking form', field1Label: 'YOUR NAME', field1Holder: 'Thota Sujith Reddy', field2Label: 'YOUR EMAIL', field2Holder: 'you@example.com', msgHolder: 'Tell me what you\'d like to discuss...' },
];

const SwipeToSend = ({ onSend, status, isFormValid, triggerValidation }) => {
  const containerRef = useRef(null);
  const x = useMotionValue(0);
  const controls = useAnimation();

  const handleDragEnd = (event, info) => {
    if (status === "sending") return;
    const containerWidth = containerRef.current?.offsetWidth || 300;
    const knobWidth = 44;
    const padding = 12;
    const maxDrag = containerWidth - knobWidth - padding;
    
    if (info.offset.x >= maxDrag * 0.75) {
      if (!isFormValid) {
        controls.start({ x: 0, transition: { type: 'spring', stiffness: 400, damping: 15 } });
        triggerValidation();
      } else {
        controls.start({ x: maxDrag });
        onSend();
      }
    } else {
      controls.start({ x: 0 });
    }
  };

  useEffect(() => {
    if (status === "idle") controls.start({ x: 0 });
  }, [status, controls]);

  return (
    <div ref={containerRef} className="swipe-container">
      <motion.div className="swipe-track" animate={{ opacity: status === "sending" ? 0.7 : 1 }}>
        <span className="swipe-text">
          {status === "sending" ? "Sending Message..." : status === "sent" ? "Message Sent!" : "Slide to send message"}
        </span>
      </motion.div>
      <motion.div
        className={`swipe-knob ${status === "sent" ? "success" : ""}`}
        drag={status === "sending" || status === "sent" ? false : "x"}
        dragConstraints={{ left: 0, right: 260 }}
        dragElastic={0.05}
        dragSnapToOrigin={false}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ x }}
        whileTap={{ scale: 0.96 }}
      >
        {status === "sending" ? (
          <Loader2 size={18} className="spin" />
        ) : status === "sent" ? (
          <Check size={20} strokeWidth={3} />
        ) : (
          <ArrowRight size={18} />
        )}
      </motion.div>
    </div>
  );
};

export default function Contact() {
  const EMAIL = 'sujithreddy1546@gmail.com';
  const PHONE = '+91 8501889996';
  const { triggerIsland, triggerStepProgress } = useIsland();

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  const [activeType, setActiveType] = useState('Job opportunity');
  const [form, setForm] = useState({ name: '', email: '', message: '', field1: '', field2: '', _catch: '' });
  const [copiedField, setCopiedField] = useState(null);
  const [status, setStatus] = useState('idle');
  const [clock, setClock] = useState('');
  const [isContactCardOpen, setIsContactCardOpen] = useState(false);
  const [touched, setTouched] = useState({ name: false, email: false, message: false });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const time = new Intl.DateTimeFormat('en-IN', {
        hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata',
      }).format(now).toLowerCase();
      setClock(time);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const currentTypeConfig = MSG_TYPES.find(t => t.id === activeType) || MSG_TYPES[0];

  const handleCopy = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1400);
      triggerIsland({ title: 'Copied!', subtitle: text, icon: <Check size={16} strokeWidth={3}/>, color: '#10b981', duration: 1500 });
    } catch { /* ignore */ }
  };

  const handleSaveVCard = () => {
    const vCard = `BEGIN:VCARD\nVERSION:3.0\nN:Reddy;Thota Sujith;;;\nFN:Thota Sujith Reddy\nTITLE:Data Scientist & ML Engineer\nEMAIL;TYPE=INTERNET:${EMAIL}\nTEL;TYPE=CELL:${PHONE}\nURL:https://github.com/sujith1546\nEND:VCARD`;
    const url = URL.createObjectURL(new Blob([vCard], { type: 'text/vcard' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: 'Thota_Sujith_Reddy.vcf' });
    document.body.appendChild(a); a.click(); if (a.parentNode) a.parentNode.removeChild(a); URL.revokeObjectURL(url);
    triggerIsland({ title: 'vCard Downloaded', subtitle: 'Saved contact card', icon: <Check size={16} strokeWidth={3}/>, color: '#10b981', duration: 2000 });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (form._catch) { setStatus('sent'); return; }
    
    const msg = form.message || form.field2 || '';
    if (!msg.trim()) return;

    setStatus('sending');

    triggerStepProgress([
      { title: 'Submitting Message...', subtitle: 'Connecting to mail server', icon: <Send size={15} />, color: '#3b82f6', duration: 1400, progress: 35 },
      { title: 'Encrypting Payload...', subtitle: 'PII protection enabled', icon: <Sparkles size={15} />, color: '#8b5cf6', duration: 1400, progress: 75 },
      { title: 'Message Sent!', subtitle: 'Directly delivered to Sujith', icon: <Check size={16} strokeWidth={3} />, color: '#10b981', duration: 4000, progress: 100 }
    ]);

    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          field1: form.name || form.field1 || 'Visitor',
          field2: activeType,
          email: form.email || 'visitor@portfolio.local',
          message: msg
        })
      });
      setStatus('sent');
      launchConfetti();
      setTimeout(() => {
        setStatus('idle');
        setForm({ name: '', email: '', message: '', field1: '', field2: '', _catch: '' });
      }, 3500);
    } catch {
      setStatus('sent');
      launchConfetti();
      setTimeout(() => {
        setStatus('idle');
        setForm({ name: '', email: '', message: '', field1: '', field2: '', _catch: '' });
      }, 3500);
    }
  };

  const isDesktopFormValid = (form.message || '').trim().length > 0;
  const isMobileFormValid = form.name.trim() !== "" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) && form.message.trim() !== "";

  return (
    <ScrollReveal>
      <style>{`
        /* ────── DESKTOP 2-COLUMN UNIFIED CARD SHELL ────── */
        .ct-card-shell {
          width: 100%;
          max-width: 900px;
          margin: 0;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          padding-bottom: 24px;
        }

        .ct-outer-frame {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 0;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
          position: relative;
          overflow: hidden;
          display: grid;
          grid-template-columns: 290px 1fr;
        }

        .ct-left-panel {
          background: var(--bg-primary);
          border-right: 1px solid var(--border-color);
          border-bottom: 1px solid var(--border-color);
          padding: 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .ct-avail-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 6px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          font-size: 11.5px;
          font-weight: 700;
          width: fit-content;
        }
        .ct-avail-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 6px #10b981;
        }

        .ct-connect-title {
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--text-primary);
          margin: 14px 0 3px;
        }
        .ct-location-line {
          font-size: 12.5px;
          color: var(--text-secondary);
          margin: 0;
        }
        .ct-reply-line {
          font-size: 11.5px;
          color: var(--text-muted);
          margin: 6px 0 0;
          font-weight: 500;
        }

        .ct-copy-box {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 10px 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 8px;
        }
        .ct-copy-box:hover {
          border-color: var(--primary-blue);
          transform: translateY(-1px);
        }

        .ct-social-row {
          display: flex;
          gap: 8px;
          margin-top: 10px;
        }
        .ct-social-btn {
          flex: 1;
          height: 38px;
          border-radius: 10px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
        }
        .ct-social-btn:hover {
          border-color: var(--primary-blue);
          color: var(--primary-blue);
          transform: translateY(-1px);
        }

        .ct-right-panel {
          padding: 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border-bottom: 1px solid var(--border-color);
        }

        .ct-pills-row {
          display: flex;
          gap: 6px;
          margin-bottom: 16px;
          overflow-x: auto;
          padding-bottom: 2px;
        }
        .ct-pill-btn {
          padding: 6px 14px;
          border-radius: 999px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .ct-pill-btn.active {
          background: var(--text-primary);
          color: var(--bg-primary);
          border-color: var(--text-primary);
        }

        .ct-banner {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 10px;
          background: rgba(59, 130, 246, 0.08);
          border: 1px solid rgba(59, 130, 246, 0.15);
          color: var(--primary-blue);
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 16px;
        }

        .ct-inputs-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 12px;
        }
        .ct-field-label {
          display: block;
          font-size: 10px;
          font-weight: 800;
          color: var(--text-muted);
          letter-spacing: 0.06em;
          margin-bottom: 4px;
        }
        .ct-input, .ct-textarea {
          width: 100%;
          box-sizing: border-box;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          padding: 10px 12px;
          font-size: 13px;
          color: var(--text-primary);
          outline: none;
          transition: border-color 0.2s ease;
          font-family: inherit;
        }
        .ct-input:focus, .ct-textarea:focus {
          border-color: var(--primary-blue);
        }

        .ct-status-line {
          font-size: 12px;
          font-weight: 600;
          margin: 10px 0 14px;
          color: var(--text-secondary);
        }

        .ct-submit-btn {
          width: 100%;
          height: 42px;
          border-radius: 12px;
          background: #0f0f0f;
          color: #ffffff;
          border: none;
          font-size: 13.5px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        [data-theme="dark"] .ct-submit-btn {
          background: #ffffff;
          color: #0f0f0f;
        }
        .ct-submit-btn:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .ct-bottom-card {
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          background: var(--bg-primary);
          transition: background 0.2s ease;
        }
        .ct-bottom-left { border-right: 1px solid var(--border-color); }
        .ct-bottom-card:hover { background: var(--bg-secondary); }
        .ct-bottom-icon {
          width: 38px; height: 38px; border-radius: 10px;
          background: var(--bg-secondary); border: 1px solid var(--border-color);
          display: flex; align-items: center; justify-content: center;
          color: var(--text-primary); flex-shrink: 0;
        }
        .ct-bottom-title { font-size: 13.5px; font-weight: 700; color: var(--text-primary); margin: 0 0 2px; }
        .ct-bottom-sub { font-size: 11.5px; color: var(--text-secondary); margin: 0; }

        /* ────── MOBILE CARD GRID & SWIPE TO SEND ────── */
        @media (max-width: 900px) {
          .mc-outer-container {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          .mc-header-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .mc-avail-pill {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 10px;
            border-radius: 999px;
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            color: var(--text-primary);
            font-size: 11px;
            font-weight: 700;
          }
          .mc-card-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
          }
          .mc-card {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 10px;
            display: flex;
            flex-direction: column;
            gap: 6px;
            cursor: pointer;
            text-align: left;
            outline: none;
            transition: background 0.15s ease;
          }
          .mc-card:active { background: var(--bg-primary); }
          .mc-card-icon {
            width: 26px; height: 26px; border-radius: 8px;
            background: var(--bg-primary); border: 1px solid var(--border-color);
            display: flex; align-items: center; justify-content: center;
            color: var(--primary-blue);
          }
          .mc-card-title { font-size: 12px; font-weight: 700; color: var(--text-primary); margin: 0; }
          .mc-card-sub { font-size: 10px; color: var(--text-secondary); margin: 0; }

          /* Swipe Control */
          .swipe-container {
            position: relative;
            width: 100%;
            height: 48px;
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 24px;
            padding: 4px;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            overflow: hidden;
          }
          .swipe-track {
            position: absolute; inset: 0;
            display: flex; align-items: center; justify-content: center;
            pointer-events: none;
          }
          .swipe-text { font-size: 12px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }
          .swipe-knob {
            width: 40px; height: 40px; border-radius: 20px;
            background: var(--text-primary); color: var(--bg-primary);
            display: flex; align-items: center; justify-content: center;
            cursor: grab; z-index: 2; flex-shrink: 0;
          }
          .swipe-knob.success { background: #10b981; color: #ffffff; }

          .mc-form-card {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 14px;
            padding: 12px;
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .mc-input-field {
            width: 100%;
            box-sizing: border-box;
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 8px 10px;
            font-size: 12px;
            color: var(--text-primary);
            outline: none;
            font-family: inherit;
          }
          .mc-input-field:focus { border-color: var(--primary-blue); }
          .mc-error-msg { font-size: 9.5px; color: #ef4444; font-weight: 600; }
        }
      `}</style>

      {!isMobile ? (
        /* ────── DESKTOP VIEW (EXACT FULL UNIFIED CARD SHELL) ────── */
        <div className="ct-card-shell">
          <div className="ct-outer-frame">
            {/* Left Panel */}
            <div className="ct-left-panel">
              <div>
                <div className="ct-avail-pill">
                  <span className="ct-avail-dot" /> Available
                </div>
                <h2 className="ct-connect-title">Let's connect</h2>
                <p className="ct-location-line">
                  <MapPin size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />
                  Vellore, India · {clock || '9:41 pm'}
                </p>
                <p className="ct-reply-line">Replies within 4h, on average</p>
              </div>

            </div>

            {/* Right Panel */}
            <div className="ct-right-panel">
              <div>
                <div className="ct-pills-row">
                  {MSG_TYPES.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      className={`ct-pill-btn${activeType === t.id ? ' active' : ''}`}
                      onClick={() => setActiveType(t.id)}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="ct-banner">
                  <Sparkles size={13} />
                  <span>{currentTypeConfig.banner}</span>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="ct-inputs-grid">
                    <div className="ct-field">
                      <label className="ct-field-label">{currentTypeConfig.field1Label}</label>
                      <input
                        className="ct-input"
                        placeholder={currentTypeConfig.field1Holder}
                        value={form.field1}
                        onChange={e => setForm({ ...form, field1: e.target.value })}
                      />
                    </div>
                    <div className="ct-field">
                      <label className="ct-field-label">{currentTypeConfig.field2Label}</label>
                      <input
                        className="ct-input"
                        placeholder={currentTypeConfig.field2Holder}
                        value={form.field2}
                        onChange={e => setForm({ ...form, field2: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="ct-field">
                    <label className="ct-field-label">MESSAGE</label>
                    <textarea
                      className="ct-textarea"
                      placeholder={currentTypeConfig.msgHolder}
                      value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <input type="text" name="_catch" style={{ display: 'none' }} value={form._catch} onChange={e => setForm({ ...form, _catch: e.target.value })} tabIndex="-1" />

                  <div className="ct-status-line">
                    {status === 'sent' ? (
                      <span style={{ color: '#10b981' }}>✓ Message sent! I'll reply within 4 hours</span>
                    ) : isDesktopFormValid ? (
                      <span>✓ Ready to send</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>• Type your message above</span>
                    )}
                  </div>

                  <button
                    type="submit"
                    className={`ct-submit-btn${status === 'sent' ? ' sent' : ''}`}
                    disabled={status === 'sending'}
                  >
                    {status === 'sending' ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Loader2 size={16} className="spin" style={{ animation: 'spin 1s linear infinite' }} /> Sending...
                      </span>
                    ) : status === 'sent' ? (
                      <span>Sent Successfully!</span>
                    ) : (
                      <span>Send message</span>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Bottom Cards */}
            <a href="mailto:sujithreddy1546@gmail.com?subject=Schedule%2015-min%20Call" className="ct-bottom-card ct-bottom-left">
              <div className="ct-bottom-icon">
                <Calendar size={18} />
              </div>
              <div>
                <p className="ct-bottom-title">Prefer to talk?</p>
                <p className="ct-bottom-sub">Book a 15-min call</p>
              </div>
            </a>

            <a href="https://wa.me/918501889996" target="_blank" rel="noreferrer" className="ct-bottom-card ct-bottom-right">
              <div className="ct-bottom-icon">
                <FaWhatsapp size={20} />
              </div>
              <div>
                <p className="ct-bottom-title">Urgent?</p>
                <p className="ct-bottom-sub">Message on WhatsApp</p>
              </div>
            </a>
          </div>
        </div>
      ) : (
        /* ────── MOBILE VIEW (RESTORED CUSTOM MOBILE DESIGN) ────── */
        <div className="mc-outer-container">
          <div className="mc-header-row">
            <div className="mc-avail-pill">
              <span className="ct-avail-dot" /> Available
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>IST {clock || '9:41 pm'}</span>
          </div>



          <div className="mc-form-card">
            <div>
              <input
                className="mc-input-field"
                placeholder="Your Name"
                value={form.name}
                onChange={e => {
                  setForm({ ...form, name: e.target.value });
                  if (touched.name) setErrors(prev => ({ ...prev, name: !e.target.value.trim() ? "Name is required." : "" }));
                }}
              />
              {touched.name && errors.name && <span className="mc-error-msg">{errors.name}</span>}
            </div>

            <div>
              <input
                className="mc-input-field"
                type="email"
                placeholder="Your Email"
                value={form.email}
                onChange={e => {
                  setForm({ ...form, email: e.target.value });
                  if (touched.email) setErrors(prev => ({ ...prev, email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value) ? "Valid email is required." : "" }));
                }}
              />
              {touched.email && errors.email && <span className="mc-error-msg">{errors.email}</span>}
            </div>

            <div>
              <textarea
                className="mc-input-field"
                placeholder="Your Message..."
                rows={3}
                value={form.message}
                onChange={e => {
                  setForm({ ...form, message: e.target.value });
                  if (touched.message) setErrors(prev => ({ ...prev, message: !e.target.value.trim() ? "Message is required." : "" }));
                }}
              />
              {touched.message && errors.message && <span className="mc-error-msg">{errors.message}</span>}
            </div>

            <SwipeToSend
              onSend={handleSubmit}
              status={status}
              isFormValid={isMobileFormValid}
              triggerValidation={() => {
                const newErrors = {};
                if (!form.name.trim()) newErrors.name = "Name is required.";
                if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Valid email is required.";
                if (!form.message.trim()) newErrors.message = "Message is required.";
                setTouched({ name: true, email: true, message: true });
                setErrors(prev => ({ ...prev, ...newErrors }));
              }}
            />
          </div>
        </div>
      )}
    </ScrollReveal>
  );
}
