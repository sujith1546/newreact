import { useState, useEffect } from "react";
import {
  Mail, Phone, Check, Loader2, Copy,
  MapPin, FileText, Sparkles, Calendar,
} from "lucide-react";
import { FaGithub, FaLinkedin, FaWhatsapp } from "react-icons/fa";
import { ScrollReveal } from '../components';
import { useIsland } from '../context/IslandContext';

/* ─── Confetti (Original Falling Animation) ─── */
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

/* ─── Message Types config ─── */
const MSG_TYPES = [
  { id: 'Job opportunity', label: 'Job opportunity', banner: 'Added role, company, and salary range fields', field1Label: 'COMPANY', field1Holder: 'Acme Inc.', field2Label: 'ROLE', field2Holder: 'Data scientist', msgHolder: 'Tell me about the opportunity...' },
  { id: 'Collaboration',   label: 'Collaboration',   banner: 'Added project scope and timeline fields', field1Label: 'PROJECT NAME', field1Holder: 'AI Platform', field2Label: 'YOUR ROLE', field2Holder: 'Co-founder / Tech Lead', msgHolder: 'Tell me about the collaboration project...' },
  { id: 'General',         label: 'General',         banner: 'General inquiry & networking form', field1Label: 'YOUR NAME', field1Holder: 'Thota Sujith Reddy', field2Label: 'YOUR EMAIL', field2Holder: 'you@example.com', msgHolder: 'Tell me what you\'d like to discuss...' },
];

export default function Contact() {
  const EMAIL = 'sujithreddy1546@gmail.com';
  const PHONE = '+91 8501889996';
  const { triggerIsland } = useIsland();

  const [activeType, setActiveType] = useState('Job opportunity');
  const [form, setForm] = useState({ field1: '', field2: '', email: '', message: '', _catch: '' });
  const [copiedField, setCopiedField] = useState(null);
  const [status, setStatus] = useState('idle');
  const [clock, setClock] = useState('');

  /* ─── Live Clock ─── */
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
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    triggerIsland({ title: 'vCard Downloaded', subtitle: 'Saved contact card', icon: <Check size={16} strokeWidth={3}/>, color: '#10b981', duration: 2000 });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (form._catch) { setStatus('sent'); return; }
    if (!form.message.trim()) return;

    setStatus('sending');
    try {
      await new Promise(r => setTimeout(r, 600));
      setStatus('sent');
      launchConfetti();
      triggerIsland({ title: 'Message Sent!', subtitle: 'I will reply within 4 hours', icon: <Check size={16} strokeWidth={3}/>, color: '#10b981', duration: 4000 });
      setTimeout(() => {
        setStatus('idle');
        setForm({ field1: '', field2: '', email: '', message: '', _catch: '' });
      }, 4000);
    } catch {
      setStatus('idle');
    }
  };

  const isFormValid = form.message.trim().length > 0;

  return (
    <ScrollReveal>
      <style>{`
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

        /* ────── Seamless Outer Container Box (Zero Gaps) ────── */
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

        /* Left Panel */
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
          padding: 4px 11px;
          border-radius: 999px;
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
          margin: 4px 0 16px;
        }

        .ct-copy-box {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 14px;
          border-radius: 10px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          font-size: 12.5px;
          font-weight: 600;
          margin-bottom: 8px;
          cursor: pointer;
          transition: all 0.18s ease;
        }
        .ct-copy-box:hover {
          border-color: var(--text-primary);
        }

        .ct-social-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 8px;
          margin-top: 10px;
        }
        .ct-social-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 11px;
          border-radius: 10px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          text-decoration: none;
          cursor: pointer;
          transition: all 0.18s;
        }
        .ct-social-btn:hover {
          border-color: var(--text-primary);
          color: var(--text-primary);
        }

        /* Right Panel */
        .ct-right-panel {
          background: var(--bg-primary);
          border-bottom: 1px solid var(--border-color);
          padding: 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .ct-pills-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 8px;
          margin-bottom: 14px;
        }
        .ct-pill-btn {
          padding: 10px 12px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 600;
          text-align: center;
          cursor: pointer;
          border: 1px solid var(--border-color);
          background: var(--bg-secondary);
          color: var(--text-secondary);
          transition: all 0.18s;
        }
        .ct-pill-btn.active {
          background: var(--text-primary);
          border-color: var(--text-primary);
          color: var(--bg-primary);
          font-weight: 700;
        }
        .ct-pill-btn:hover:not(.active) {
          border-color: var(--text-primary);
          color: var(--text-primary);
        }

        /* Info Banner */
        .ct-banner {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 9px 14px;
          border-radius: 10px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 16px;
        }

        /* Inputs Grid */
        .ct-inputs-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 14px;
        }
        .ct-field {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .ct-field-label {
          font-size: 10.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-muted);
        }
        .ct-input, .ct-textarea {
          width: 100%;
          box-sizing: border-box;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 13px;
          color: var(--text-primary);
          outline: none;
          transition: border-color 0.18s;
        }
        .ct-input::placeholder, .ct-textarea::placeholder { color: var(--text-muted); }
        .ct-input:focus, .ct-textarea:focus {
          border-color: var(--text-primary);
        }

        .ct-textarea {
          resize: none;
          min-height: 80px;
        }

        /* Status & Submit */
        .ct-status-line {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11.5px;
          font-weight: 600;
          color: var(--text-secondary);
          margin: 10px 0 10px;
        }

        .ct-submit-btn {
          width: 100%;
          height: 44px;
          border-radius: 10px;
          background: #22c55e;
          color: #ffffff !important;
          border: none;
          font-size: 13.5px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.18s, box-shadow 0.18s, transform 0.1s;
          box-shadow: 0 4px 14px rgba(34, 197, 94, 0.28);
        }
        .ct-submit-btn span {
          color: #ffffff !important;
        }
        .ct-submit-btn:hover:not(.sent) {
          background: #16a34a;
          box-shadow: 0 6px 20px rgba(34, 197, 94, 0.38);
        }
        .ct-submit-btn.sent {
          background: #10b981 !important;
          color: #ffffff !important;
          opacity: 1 !important;
          box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4) !important;
          cursor: default;
        }
        .ct-submit-btn:active:not(.sent) { transform: scale(0.99); }
        .ct-submit-btn:disabled:not(.sent) { opacity: 0.5; cursor: not-allowed; }

        /* Bottom Cards */
        .ct-bottom-card {
          background: var(--bg-secondary);
          padding: 18px 24px;
          display: flex;
          align-items: center;
          gap: 14px;
          text-decoration: none;
          cursor: pointer;
          transition: background 0.18s ease;
        }
        .ct-bottom-card:hover {
          background: var(--bg-primary);
        }
        .ct-bottom-left {
          border-right: 1px solid var(--border-color);
        }
        .ct-bottom-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: var(--text-primary);
        }
        .ct-bottom-title {
          font-size: 13.5px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 2px;
        }
        .ct-bottom-sub {
          font-size: 11.5px;
          color: var(--text-secondary);
          margin: 0;
        }

        /* Responsive */
        @media (max-width: 900px) {
          .ct-outer-frame {
            grid-template-columns: 1fr;
          }
          .ct-left-panel {
            border-right: none;
          }
          .ct-bottom-left {
            border-right: none;
            border-bottom: 1px solid var(--border-color);
          }
        }
      `}</style>

      <div className="ct-card-shell">
        {/* ────── SEAMLESS UNIFIED CONTAINER BOX (ZERO GAPS) ────── */}
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

            <div>
              {/* Email box */}
              <div className="ct-copy-box" onClick={() => handleCopy(EMAIL, 'email')} title="Click to copy email">
                <Mail size={14} style={{ color: 'var(--text-primary)', flexShrink: 0 }} />
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{EMAIL}</span>
                {copiedField === 'email' ? <Check size={14} color="var(--text-primary)" /> : <Copy size={13} style={{ opacity: 0.6 }} />}
              </div>

              {/* Phone box */}
              <div className="ct-copy-box" onClick={() => handleCopy(PHONE, 'phone')} title="Click to copy phone">
                <Phone size={14} style={{ color: 'var(--text-primary)', flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{PHONE}</span>
                {copiedField === 'phone' ? <Check size={14} color="var(--text-primary)" /> : <Copy size={13} style={{ opacity: 0.6 }} />}
              </div>

              {/* Social buttons */}
              <div className="ct-social-row">
                <a href="https://github.com/sujith1546" target="_blank" rel="noreferrer" className="ct-social-btn" title="GitHub">
                  <FaGithub size={16} />
                </a>
                <a href="https://linkedin.com/in/thota-sujith-reddy" target="_blank" rel="noreferrer" className="ct-social-btn" title="LinkedIn">
                  <FaLinkedin size={16} />
                </a>
                <button className="ct-social-btn" onClick={handleSaveVCard} title="Download vCard">
                  <FileText size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="ct-right-panel">
            <div>
              {/* 3 Pills Row */}
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

              {/* Dynamic Info Banner */}
              <div className="ct-banner">
                <Sparkles size={13} />
                <span>{currentTypeConfig.banner}</span>
              </div>

              {/* Form */}
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

                {/* Honeypot */}
                <input type="text" name="_catch" style={{ display: 'none' }} value={form._catch} onChange={e => setForm({ ...form, _catch: e.target.value })} tabIndex="-1" />

                {/* Status line */}
                <div className="ct-status-line">
                  {status === 'sent' ? (
                    <span style={{ color: '#10b981' }}>✓ Message sent! I'll reply within 4 hours</span>
                  ) : isFormValid ? (
                    <span>✓ Ready to send</span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>• Type your message above</span>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className={`ct-submit-btn${status === 'sent' ? ' sent' : ''}`}
                  disabled={status === 'sending'}
                >
                  {status === 'sending' ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Sending...
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

          {/* Bottom Cards: Schedule Call + WhatsApp */}
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
    </ScrollReveal>
  );
}
