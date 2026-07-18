import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, ArrowRight, Check, Loader2, Send, Copy } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import ScrollReveal from '../components/ScrollReveal';

const shakeVariants = {
  shake: { x: [-4, 4, -4, 4, 0], transition: { duration: 0.35 } },
  idle: { x: 0 }
};

export default function Contact() {
  const email = "sujithreddy1546@gmail.com";
  const phone = "+91 8501889996";

  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState({ name: "", email: "", message: "" });
  const [touched, setTouched] = useState({ name: false, email: false, message: false });
  const [status, setStatus] = useState("idle");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  const [emailCopied, setEmailCopied] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const validateField = (name, value) => {
    let error = "";
    if (!value.trim()) {
      error = `${name.charAt(0).toUpperCase() + name.slice(1)} is required.`;
    } else if (name === "email") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = "Please enter a valid email.";
    }
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (touched[name]) validateField(name, value);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const newErrors = {};
    let hasErrors = false;
    Object.keys(form).forEach(key => {
      if (!form[key].trim()) { newErrors[key] = `${key.charAt(0).toUpperCase() + key.slice(1)} is required.`; hasErrors = true; }
      else if (key === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form[key])) { newErrors[key] = "Please enter a valid email."; hasErrors = true; }
    });
    setTouched({ name: true, email: true, message: true });
    if (hasErrors) { setErrors(prev => ({ ...prev, ...newErrors })); return; }
    setStatus("sending");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(form)
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setStatus("sent");
        setForm({ name: "", email: "", message: "" });
        setTouched({ name: false, email: false, message: false });
        setTimeout(() => setStatus("idle"), 5000);
      } else throw new Error(result.error || "Failed");
    } catch (err) {
      alert(`Oops! ${err.message || 'Please try again.'}`);
      setStatus("idle");
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };

  return (
    <ScrollReveal>
      <style>{`
        /* ===== SHARED ===== */
        .contact-page-wrap { width: 100%; max-width: 820px; box-sizing: border-box; }
        .contact-plain-header { margin-bottom: 8px; }
        .contact-plain-header h1 { font-size: 28px; font-weight: 700; color: var(--text-primary); margin: 0 0 6px; }
        .contact-plain-header p { color: var(--text-secondary); margin: 0; font-size: 14.5px; }

        /* ===== DESKTOP ===== */
        .fc-wrapper {
          border-radius: 20px; overflow: hidden;
          display: grid; grid-template-columns: 320px 1fr;
          border: 1px solid #ececec; width: 100%;
          box-sizing: border-box; min-height: 380px;
        }
        .fc-right-col { display: flex; flex-direction: column; min-width: 0; background: #fcfcfb; }
        .fc-info-panel {
          background: linear-gradient(135deg, #0d0d0d, #1a1a1a);
          padding: 2rem 1.75rem; color: #fff;
          display: flex; flex-direction: column; justify-content: space-between;
          position: relative; overflow: hidden;
        }
        .fc-dotgrid { position: absolute; inset: 0; background-image: radial-gradient(rgba(255,255,255,0.13) 1.2px, transparent 1.2px); background-size: 20px 20px; pointer-events: none; }
        .fc-glow { position: absolute; top: -60px; right: -60px; width: 220px; height: 220px; border-radius: 50%; background: radial-gradient(circle, rgba(255,255,255,0.10), transparent 70%); pointer-events: none; }
        .fc-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); border-radius: 999px; padding: 5px 12px; font-size: 11.5px; color: #ccc; margin-bottom: 20px; width: fit-content; }
        .fc-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #4ade80; flex-shrink: 0; }
        .fc-title { font-size: 26px; font-weight: 700; line-height: 1.25; margin: 0 0 12px; color: #fff; }
        .fc-subtitle { font-size: 13px; color: #aaa; line-height: 1.65; margin: 0 0 28px; }
        .fc-info-row { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; border-radius: 8px; padding: 6px 8px; margin-left: -8px; transition: background 0.2s; text-decoration: none; }
        .fc-info-row:hover { background: rgba(255,255,255,0.06); }
        .fc-info-row:hover .fc-info-text { color: #fff; }
        .fc-info-icon { width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; color: #fff; flex-shrink: 0; }
        .fc-info-text { font-size: 13px; color: #ccc; }
        .fc-form-panel { padding: 2rem 1.75rem; display: flex; flex-direction: column; gap: 20px; flex-grow: 1; }
        .fc-field { display: flex; flex-direction: column; gap: 6px; }
        .fc-field label { font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }
        .fc-input { background: #fff; border: 1px solid var(--border-color); border-radius: 8px; padding: 10px 14px; font-size: 13.5px; color: var(--text-primary); outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
        .fc-input:focus { border-color: var(--primary-blue); box-shadow: 0 0 0 3px rgba(0,123,255,0.08); }
        .fc-input.error { border-color: #ef4444 !important; }
        .fc-submit-btn { height: 44px; border-radius: 8px; background: #111827; color: #fff; font-size: 13.5px; font-weight: 600; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s, transform 0.1s; }
        .fc-submit-btn:hover { background: #1f2937; }
        .fc-submit-btn:active { transform: scale(0.98); }
        .fc-submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .fc-success { display: flex; flex-direction: column; align-items: center; justify-content: center; flex-grow: 1; padding: 2rem; text-align: center; }
        .fc-success-circle { width: 60px; height: 60px; border-radius: 50%; background: #d1fae5; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
        .fc-success-title { font-size: 18px; font-weight: 700; color: var(--text-primary); margin: 0 0 4px; }
        .fc-success-sub { font-size: 13px; color: var(--text-secondary); margin: 0; }
        .fc-error-text { font-size: 11.5px; color: #ef4444; margin: 0; }
        [data-theme="dark"] .fc-wrapper { border-color: #374151; }
        [data-theme="dark"] .fc-right-col { background: #252525; }
        [data-theme="dark"] .fc-input { background: #1e1e1e; border-color: #374151; }
        [data-theme="dark"] .fc-input:focus { border-color: var(--primary-blue); }
        [data-theme="dark"] .fc-submit-btn { background: var(--primary-blue); }
        [data-theme="dark"] .fc-submit-btn:hover { opacity: 0.9; background: var(--primary-blue); }
        [data-theme="dark"] .fc-success-circle { background: #064e3b; }

        /* ===== MOBILE ===== */
        @media (max-width: 900px) {
          .contact-plain-header { margin-bottom: 20px; }

          /* Info strip — availability + direct links */
          .mc-info-strip {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-bottom: 4px;
          }

          /* Availability pill */
          .mc-avail-pill {
            display: inline-flex; align-items: center; gap: 7px;
            background: rgba(22,163,74,0.08);
            border: 1px solid rgba(22,163,74,0.2);
            border-radius: 20px; padding: 6px 14px;
            width: fit-content;
          }
          .mc-avail-dot {
            width: 7px; height: 7px; border-radius: 50%; background: #22c55e;
            flex-shrink: 0;
            box-shadow: 0 0 0 0 rgba(34,197,94,0.5);
            animation: rippleDot 2s ease-in-out infinite;
          }
          @keyframes rippleDot {
            0%   { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
            70%  { box-shadow: 0 0 0 7px rgba(34,197,94,0); }
            100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
          }
          .mc-avail-text { font-size: 12px; font-weight: 700; color: #16a34a; }
          
          .mc-contact-card {
            display: flex; flex-direction: column; gap: 12px;
          }
          .mc-contact-row {
            display: flex; align-items: center; justify-content: space-between;
            padding: 14px 16px;
            border: 1px solid var(--border-color);
            border-radius: 14px;
            background: var(--bg-primary);
            cursor: pointer;
            text-align: left; font-family: inherit;
            color: var(--text-primary);
            transition: background 0.15s, transform 0.1s, border-color 0.15s;
          }
          .mc-contact-row:active { background: var(--bg-secondary); transform: scale(0.98); }
          .mc-contact-row-left { display: flex; align-items: center; gap: 12px; }
          .mc-contact-icon {
            width: 34px; height: 34px; border-radius: 10px;
            display: flex; align-items: center; justify-content: center;
            flex-shrink: 0;
          }
          .mc-contact-icon--mail { background: rgba(59,130,246,0.1); color: #3b82f6; }
          .mc-contact-icon--phone { background: rgba(34,197,94,0.1); color: #16a34a; }
          .mc-contact-text h4 { font-size: 13.5px; font-weight: 600; color: var(--text-primary); margin: 0 0 2px; }
          .mc-contact-text p { font-size: 11px; color: var(--text-secondary); margin: 0; letter-spacing: -0.01em; }
          .mc-contact-action {
            display: flex; align-items: center; gap: 4px;
            font-size: 11px; font-weight: 700;
            color: var(--primary-blue); flex-shrink: 0;
            background: rgba(0,123,255,0.07); border-radius: 20px;
            padding: 3px 10px; border: 1px solid rgba(0,123,255,0.15);
            transition: background 0.15s;
          }
          .mc-contact-action--success {
            color: #16a34a !important;
            background: rgba(22,163,74,0.08) !important;
            border-color: rgba(22,163,74,0.2) !important;
          }

          /* ── outer container — fills the text-content box ── */
          .mc-outer-container {
            display: flex; flex-direction: column;
            width: 100%; overflow-y: auto;
            -ms-overflow-style: none; scrollbar-width: none;
          }
          .mc-outer-container::-webkit-scrollbar { display: none; }

          /* ── section divider ── */
          .mc-divider {
            width: 100%; height: 1px;
            background: var(--border-color); flex-shrink: 0;
          }

          /* ── section label ── */
          .mc-section-label {
            font-size: 10.5px; font-weight: 800; letter-spacing: .08em;
            text-transform: uppercase; color: var(--text-muted);
            padding: 14px 18px 6px; margin: 0; flex-shrink: 0;
          }

          /* ── availability pill row ── */
          .mc-avail-row {
            display: flex; align-items: center; justify-content: space-between;
            padding: 16px 18px;
          }
          .mc-avail-pill {
            display: inline-flex; align-items: center; gap: 7px;
            background: rgba(22,163,74,0.08); border: 1px solid rgba(22,163,74,0.2);
            border-radius: 20px; padding: 6px 14px; width: fit-content;
          }
          .mc-avail-dot {
            width: 7px; height: 7px; border-radius: 50%; background: #22c55e;
            flex-shrink: 0; box-shadow: 0 0 0 0 rgba(34,197,94,0.5);
            animation: rippleDot 2s ease-in-out infinite;
          }
          @keyframes rippleDot {
            0%   { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
            70%  { box-shadow: 0 0 0 7px rgba(34,197,94,0); }
            100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
          }
          .mc-avail-text { font-size: 12px; font-weight: 700; color: #16a34a; }
          .mc-page-title { font-size: 19px; font-weight: 800; color: var(--text-primary); margin: 0; letter-spacing: -.02em; }
          .mc-page-sub { font-size: 12px; color: var(--text-secondary); margin: 3px 0 0; }

          /* ── form fields ── */
          .mc-form-card { display: flex; flex-direction: column; gap: 0; }
          .mc-form-row {
            display: flex; flex-direction: column;
            border-bottom: 1px solid var(--border-color);
            transition: background 0.15s;
          }
          .mc-form-row:last-child { border-bottom: none; }
          .mc-form-row:focus-within { background: var(--bg-primary); }
          .mc-form-row.has-error { border-color: #ef4444; }
          .mc-form-row-label {
            font-size: 10px; font-weight: 700;
            color: var(--text-muted); text-transform: uppercase;
            letter-spacing: 0.07em; padding: 12px 18px 0;
            pointer-events: none;
          }
          .mc-form-input {
            background: transparent; border: none; outline: none;
            padding: 5px 18px 12px; font-size: 14.5px;
            color: var(--text-primary); width: 100%;
            box-sizing: border-box; font-family: inherit; resize: none;
          }
          .mc-form-input::placeholder { color: var(--text-muted); opacity: 0.7; }
          .mc-form-error { font-size: 10.5px; color: #ef4444; padding: 0 18px 8px; margin: 0; }
          .mc-char-hint {
            font-size: 10px; font-weight: 600;
            color: var(--text-muted); text-align: right;
            padding: 0 18px 8px;
          }
          .mc-char-hint.over { color: #ef4444; }

          /* ── send button ── */
          .mc-send-wrap { padding: 16px 18px 20px; }
          .mc-send-btn {
            position: relative; overflow: hidden;
            width: 100%; height: 56px; border-radius: 16px;
            background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%);
            color: #fff; font-size: 16px; font-weight: 700; letter-spacing: -0.01em;
            border: none; cursor: pointer; font-family: inherit;
            display: flex; align-items: center; justify-content: center; gap: 10px;
            box-shadow: 0 4px 24px rgba(37,99,235,0.35), 0 1px 0 rgba(255,255,255,0.15) inset;
            transition: transform 0.15s, box-shadow 0.15s;
          }
          .mc-send-btn::after {
            content: ''; position: absolute; inset: 0;
            background: linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 60%);
            pointer-events: none;
          }
          .mc-send-btn:active { transform: scale(0.97); box-shadow: 0 2px 12px rgba(37,99,235,0.3); }
          .mc-send-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
          [data-theme="dark"] .mc-send-btn {
            background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%);
          }
          .mc-send-icon-wrap {
            width: 28px; height: 28px; border-radius: 8px;
            background: rgba(255,255,255,0.18);
            display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          }

          /* ── success state ── */
          .mc-success-wrap {
            display: flex; flex-direction: column; align-items: center;
            gap: 16px; padding: 48px 20px; text-align: center;
          }
          .mc-success-icon {
            width: 76px; height: 76px; border-radius: 38px;
            background: linear-gradient(135deg, #d1fae5, #a7f3d0);
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 0 0 8px rgba(22,163,74,0.08);
          }
          [data-theme="dark"] .mc-success-icon {
            background: linear-gradient(135deg, #064e3b, #065f46);
          }
          .mc-success-title { font-size: 21px; font-weight: 800; color: var(--text-primary); margin: 0; letter-spacing: -0.02em; }
          .mc-success-sub { font-size: 14px; color: var(--text-secondary); margin: 0; line-height: 1.55; max-width: 260px; }
        }
      `}</style>

      <div className="contact-page-wrap">
        {!isMobile ? (
          <>
            <div className="contact-plain-header">
              <h1>Get in Touch</h1>
              <p>Have a question or want to work together?</p>
            </div>
            /* ── DESKTOP unchanged ── */
            <div className="fc-wrapper">
              <div className="fc-info-panel">
                <div className="fc-dotgrid" />
                <div className="fc-glow" />
                <div>
                  <div className="fc-badge"><span className="fc-badge-dot" /> Available</div>
                  <h2 className="fc-title">Let's Connect</h2>
                  <p className="fc-subtitle">I'm currently seeking new graduate developer roles and project collaborations.</p>
                </div>
                <div>
                  <a href={`mailto:${email}`} className="fc-info-row" style={{ textDecoration: 'none' }}>
                    <div className="fc-info-icon"><Mail size={16} /></div>
                    <span className="fc-info-text">{email}</span>
                  </a>
                  <a href={`tel:${phone}`} className="fc-info-row" style={{ textDecoration: 'none' }}>
                    <div className="fc-info-icon"><Phone size={16} /></div>
                    <span className="fc-info-text">{phone}</span>
                  </a>
                </div>
              </div>
              <div className="fc-right-col">
                <AnimatePresence mode="wait" initial={false}>
                  {status === "sent" ? (
                    <motion.div key="success" className="fc-success"
                      initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <motion.div className="fc-success-circle"
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        transition={{ delay: 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <Check size={30} color="#16a34a" strokeWidth={2.5} />
                      </motion.div>
                      <p className="fc-success-title">Message sent!</p>
                      <p className="fc-success-sub">I'll get back to you within a day.</p>
                    </motion.div>
                  ) : (
                    <motion.form key="form" className="fc-form-panel" onSubmit={handleSubmit}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    >
                      <div className="fc-field">
                        <label htmlFor="fc-name">Your name</label>
                        <input id="fc-name" name="name" className={`fc-input${touched.name && errors.name ? ' error' : ''}`}
                          placeholder="Thota Sujith Reddy" value={form.name} onChange={handleChange} onBlur={handleBlur} />
                        {touched.name && errors.name && <span className="fc-error-text">{errors.name}</span>}
                      </div>
                      <div className="fc-field">
                        <label htmlFor="fc-email">Your email</label>
                        <input id="fc-email" name="email" type="email" className={`fc-input${touched.email && errors.email ? ' error' : ''}`}
                          placeholder="sujithreddy1546@gmail.com" value={form.email} onChange={handleChange} onBlur={handleBlur} />
                        {touched.email && errors.email && <span className="fc-error-text">{errors.email}</span>}
                      </div>
                      <div className="fc-field">
                        <label htmlFor="fc-message">Message</label>
                        <textarea id="fc-message" name="message" className={`fc-input${touched.message && errors.message ? ' error' : ''}`}
                          rows={4} placeholder="Tell me what you'd like to discuss..."
                          value={form.message} onChange={handleChange} onBlur={handleBlur} />
                        {touched.message && errors.message && <span className="fc-error-text">{errors.message}</span>}
                      </div>
                      <button type="submit" className="fc-submit-btn" disabled={status === "sending"}>
                        <AnimatePresence mode="wait" initial={false}>
                          {status === "sending"
                            ? <motion.span key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Loader2 size={16} /> Sending...</motion.span>
                            : <motion.span key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>Send message <ArrowRight size={15} /></motion.span>}
                        </AnimatePresence>
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </>
        ) : (
          /* ── MOBILE — content sits neatly inside the outer .text-content box ── */
          <motion.div className="mc-outer-container"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header row */}
            <div className="mc-avail-row">
              <div>
                <p className="mc-page-title">Get in Touch</p>
                <p className="mc-page-sub">Have a question or want to work together?</p>
              </div>
              <div className="mc-avail-pill">
                <span className="mc-avail-dot" />
                <span className="mc-avail-text">Open</span>
              </div>
            </div>

            <div className="mc-divider" />

            {/* Form / success */}
            <AnimatePresence mode="wait" initial={false}>
              {status === "sent" ? (
                <motion.div key="success"
                  className="mc-success-wrap"
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  <motion.div className="mc-success-icon"
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <Check size={32} color="#16a34a" strokeWidth={2.5} />
                  </motion.div>
                  <p className="mc-success-title">Message sent!</p>
                  <p className="mc-success-sub">Thanks! I'll get back to you within a day.</p>
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

                  {/* Your details */}
                  <p className="mc-section-label">Your details</p>
                  <div className="mc-form-card">
                    <motion.div
                      className={`mc-form-row${touched.name && errors.name ? ' has-error' : ''}`}
                      animate={touched.name && errors.name ? 'shake' : 'idle'}
                      variants={shakeVariants}
                    >
                      <span className="mc-form-row-label">Name</span>
                      <input name="name" className="mc-form-input"
                        placeholder="Thota Sujith Reddy"
                        value={form.name} onChange={handleChange} onBlur={handleBlur} />
                      {touched.name && errors.name && <p className="mc-form-error">{errors.name}</p>}
                    </motion.div>
                    <motion.div
                      className={`mc-form-row${touched.email && errors.email ? ' has-error' : ''}`}
                      animate={touched.email && errors.email ? 'shake' : 'idle'}
                      variants={shakeVariants}
                    >
                      <span className="mc-form-row-label">Email</span>
                      <input name="email" type="email" className="mc-form-input"
                        placeholder="you@example.com"
                        value={form.email} onChange={handleChange} onBlur={handleBlur} />
                      {touched.email && errors.email && <p className="mc-form-error">{errors.email}</p>}
                    </motion.div>
                  </div>

                  <div className="mc-divider" />

                  {/* Message */}
                  <p className="mc-section-label">Message</p>
                  <div className="mc-form-card">
                    <motion.div
                      className={`mc-form-row${touched.message && errors.message ? ' has-error' : ''}`}
                      animate={touched.message && errors.message ? 'shake' : 'idle'}
                      variants={shakeVariants}
                    >
                      <span className="mc-form-row-label">Your message</span>
                      <textarea name="message" className="mc-form-input"
                        rows={5} placeholder="Tell me what you'd like to discuss..."
                        value={form.message} onChange={handleChange} onBlur={handleBlur}
                        maxLength={500} />
                      {touched.message && errors.message && <p className="mc-form-error">{errors.message}</p>}
                      <p className={`mc-char-hint${form.message.length >= 480 ? ' over' : ''}`}>
                        {form.message.length} / 500
                      </p>
                    </motion.div>
                  </div>

                  <div className="mc-divider" />

                  {/* Send button */}
                  <div className="mc-send-wrap">
                    <motion.button
                      className="mc-send-btn"
                      onClick={handleSubmit}
                      disabled={status === "sending"}
                      whileTap={{ scale: 0.97 }}
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        {status === "sending" ? (
                          <motion.span key="s"
                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                            style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                          >
                            <span className="mc-send-icon-wrap">
                              <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                            </span>
                            Sending…
                          </motion.span>
                        ) : (
                          <motion.span key="i"
                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                            style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                          >
                            <span className="mc-send-icon-wrap"><Send size={15} /></span>
                            Send Message
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          </>
        )}
      </div>
    </ScrollReveal>
  );
}
