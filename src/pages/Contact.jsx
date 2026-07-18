import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, ArrowRight, Check, Loader2, Send, Copy, ExternalLink } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import ScrollReveal from '../components/ScrollReveal';

const panelVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};
const shakeVariants = {
  shake: { x: [-5, 5, -5, 5, 0], transition: { duration: 0.4 } },
  idle: { x: 0 }
};

export default function Contact() {
  const email = "sujithreddy1546@gmail.com";
  const phone = "+91 8501889996";

  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState({ name: "", email: "", message: "" });
  const [touched, setTouched] = useState({ name: false, email: false, message: false });
  const [status, setStatus] = useState("idle"); // idle | sending | sent
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
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) error = "Please enter a valid email address.";
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
      validateField(key, form[key]);
      if (!form[key].trim()) {
        newErrors[key] = `${key.charAt(0).toUpperCase() + key.slice(1)} is required.`;
        hasErrors = true;
      } else if (key === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form[key])) { newErrors[key] = "Please enter a valid email address."; hasErrors = true; }
      }
    });
    setTouched({ name: true, email: true, message: true });
    if (hasErrors) { setErrors(newErrors); return; }
    setStatus("sending");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, message: form.message })
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setStatus("sent");
        setForm({ name: "", email: "", message: "" });
        setTouched({ name: false, email: false, message: false });
        setTimeout(() => setStatus("idle"), 5000);
      } else throw new Error(result.error || "Failed to submit form");
    } catch (error) {
      console.error("Contact Form Submission Error:", error);
      alert(`Oops! Something went wrong: ${error.message || 'Please try again later.'}`);
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
        /* ======== SHARED ACROSS DESKTOP + MOBILE ======== */
        .contact-page-wrap { width: 100%; max-width: 820px; box-sizing: border-box; }
        .contact-plain-header h1 { font-size: 28px; font-weight: 700; color: var(--text-primary); margin: 0 0 8px; }
        .contact-plain-header p { color: var(--text-secondary); margin: 0 0 6px; font-size: 14.5px; }

        /* ======== DESKTOP LAYOUT (unchanged) ======== */
        .fc-wrapper {
          border-radius: 20px; overflow: hidden;
          display: grid; grid-template-columns: 320px 1fr;
          border: 1px solid #ececec; width: 100%;
          box-sizing: border-box; min-height: 380px;
        }
        .fc-right-col { display: flex; flex-direction: column; min-width: 0; background: #fcfcfb; }
        .fc-info-panel {
          background: linear-gradient(135deg, #0d0d0d, #1a1a1a);
          padding: 2rem 1.75rem; color: #ffffff;
          display: flex; flex-direction: column; justify-content: space-between;
          position: relative; overflow: hidden;
        }
        .fc-dotgrid {
          position: absolute; inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.13) 1.2px, transparent 1.2px);
          background-size: 20px 20px; pointer-events: none;
        }
        .fc-glow {
          position: absolute; top: -60px; right: -60px;
          width: 220px; height: 220px; border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,0.10), transparent 70%);
          pointer-events: none;
        }
        .fc-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12);
          border-radius: 999px; padding: 5px 12px; font-size: 11.5px; color: #cccccc;
          margin-bottom: 20px; position: relative; width: fit-content;
        }
        .fc-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #4ade80; flex-shrink: 0; }
        .fc-title { font-size: 26px; font-weight: 700; line-height: 1.25; margin: 0 0 12px; position: relative; color: #ffffff; }
        .fc-subtitle { font-size: 13px; color: #aaaaaa; line-height: 1.65; margin: 0 0 28px; position: relative; }
        .fc-info-row {
          display: flex; align-items: center; gap: 12px; margin-bottom: 14px;
          position: relative; border-radius: 8px; padding: 6px 8px; margin-left: -8px;
          transition: background 0.2s ease; cursor: default; text-decoration: none;
        }
        .fc-info-row:hover { background: rgba(255,255,255,0.06); }
        .fc-info-row:hover .fc-info-text { color: #ffffff; }
        .fc-info-icon {
          width: 32px; height: 32px; border-radius: 50%;
          background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15);
          display: flex; align-items: center; justify-content: center; color: #ffffff; flex-shrink: 0;
        }
        .fc-info-text { font-size: 13px; color: #cccccc; }
        .fc-form-panel { padding: 2rem 1.75rem; display: flex; flex-direction: column; gap: 20px; flex-grow: 1; }
        .fc-field { display: flex; flex-direction: column; gap: 6px; text-align: left; }
        .fc-field label { font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }
        .fc-input {
          background: #ffffff; border: 1px solid var(--border-color);
          border-radius: 8px; padding: 10px 14px; font-size: 13.5px;
          color: var(--text-primary); outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .fc-input:focus { border-color: var(--primary-blue); box-shadow: 0 0 0 3px rgba(0,123,255,0.08); }
        .fc-submit-btn {
          height: 44px; border-radius: 8px; background: #111827; color: #ffffff;
          font-size: 13.5px; font-weight: 600; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s ease, transform 0.1s ease;
        }
        .fc-submit-btn:hover { background: #1f2937; }
        .fc-submit-btn:active { transform: scale(0.98); }
        .fc-submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .fc-success {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          flex-grow: 1; padding: 2rem; text-align: center;
        }
        .fc-success-circle {
          width: 60px; height: 60px; border-radius: 50%; background: #d1fae5;
          display: flex; align-items: center; justify-content: center; margin-bottom: 16px;
        }
        .fc-success-title { font-size: 18px; font-weight: 700; color: var(--text-primary); margin: 0 0 4px; }
        .fc-success-sub { font-size: 13px; color: var(--text-secondary); margin: 0; }
        .fc-error-text { font-size: 11.5px; color: #ef4444; margin: 0; text-align: left; }
        .fc-input.error { border-color: #ef4444 !important; }
        [data-theme="dark"] .fc-wrapper { border-color: #374151; }
        [data-theme="dark"] .fc-right-col { background: #252525; }
        [data-theme="dark"] .fc-input { background: #1e1e1e; border-color: #374151; }
        [data-theme="dark"] .fc-input:focus { border-color: var(--primary-blue); }
        [data-theme="dark"] .fc-submit-btn { background: var(--primary-blue); color: #ffffff; }
        [data-theme="dark"] .fc-submit-btn:hover { background: var(--accent-blue); }
        [data-theme="dark"] .fc-success-circle { background: #064e3b; }

        /* ======================================================
           MOBILE REDESIGN — premium, settings-style layout
           ====================================================== */
        @media (max-width: 900px) {
          .contact-plain-header { text-align: left; margin-bottom: 16px; }

          /* ── Hero dark card ── */
          .mc-hero {
            background: linear-gradient(135deg, #0d0d0d 0%, #1c1c1e 100%);
            border-radius: 22px;
            padding: 20px 18px 18px;
            position: relative;
            overflow: hidden;
            margin-bottom: 4px;
          }
          .mc-hero-dotgrid {
            position: absolute; inset: 0;
            background-image: radial-gradient(rgba(255,255,255,0.09) 1px, transparent 1px);
            background-size: 18px 18px; pointer-events: none;
          }
          .mc-hero-glow {
            position: absolute; top: -40px; right: -40px;
            width: 180px; height: 180px; border-radius: 50%;
            background: radial-gradient(circle, rgba(34,197,94,0.18), transparent 70%);
            pointer-events: none;
          }
          .mc-hero-top {
            display: flex; align-items: center; gap: 12px;
            position: relative; margin-bottom: 14px;
          }
          .mc-hero-avatar {
            width: 48px; height: 48px; border-radius: 50%;
            object-fit: cover;
            border: 2px solid rgba(255,255,255,0.15);
            flex-shrink: 0;
          }
          .mc-hero-info { flex: 1; }
          .mc-hero-name { font-size: 16px; font-weight: 700; color: #ffffff; margin: 0 0 3px; }
          .mc-hero-badge {
            display: inline-flex; align-items: center; gap: 5px;
            background: rgba(34,197,94,0.15); border: 1px solid rgba(34,197,94,0.3);
            border-radius: 20px; padding: 3px 9px;
            font-size: 10.5px; font-weight: 700; color: #4ade80;
          }
          .mc-hero-badge-dot {
            width: 5px; height: 5px; border-radius: 50%; background: #4ade80;
            animation: beaconPulse 2.4s ease-in-out infinite;
          }
          .mc-hero-tagline {
            font-size: 12.5px; color: #9ca3af; line-height: 1.5;
            position: relative; margin-bottom: 16px;
          }

          /* Quick-action row inside hero */
          .mc-quick-actions {
            display: flex; gap: 8px; position: relative;
          }
          .mc-quick-btn {
            flex: 1; height: 36px; border-radius: 10px;
            border: 1px solid rgba(255,255,255,0.12);
            background: rgba(255,255,255,0.07);
            color: #e5e7eb; font-size: 11.5px; font-weight: 700;
            display: flex; align-items: center; justify-content: center; gap: 6px;
            cursor: pointer; transition: background 0.15s;
            font-family: inherit;
          }
          .mc-quick-btn:active { background: rgba(255,255,255,0.14); }
          .mc-quick-btn--copy-success {
            background: rgba(34,197,94,0.15) !important;
            border-color: rgba(34,197,94,0.3) !important;
            color: #4ade80 !important;
          }

          /* Social icon links */
          .mc-socials {
            display: flex; gap: 8px; position: relative; margin-top: 10px;
          }
          .mc-social-btn {
            width: 36px; height: 36px; border-radius: 10px;
            border: 1px solid rgba(255,255,255,0.12);
            background: rgba(255,255,255,0.07);
            color: #e5e7eb; display: flex; align-items: center; justify-content: center;
            text-decoration: none; transition: background 0.15s;
          }
          .mc-social-btn:active { background: rgba(255,255,255,0.14); }

          /* ── Form section ── */
          .mc-form-section { display: flex; flex-direction: column; gap: 8px; }
          .mc-group-label {
            font-size: 11px; font-weight: 700; color: var(--text-secondary);
            text-transform: uppercase; letter-spacing: 0.06em;
            padding-left: 4px; margin-bottom: 2px;
          }
          .mc-fields-card {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 16px; overflow: hidden;
          }
          /* Each form row inside the settings-style card */
          .mc-field-row {
            display: flex; flex-direction: column;
            padding: 0;
            border-bottom: 1px solid var(--border-color);
          }
          .mc-field-row:last-child { border-bottom: none; }
          .mc-field-label {
            font-size: 10px; font-weight: 700;
            color: var(--text-muted); text-transform: uppercase;
            letter-spacing: 0.07em; padding: 10px 16px 0;
          }
          .mc-field-input {
            background: transparent; border: none; outline: none;
            padding: 6px 16px 12px;
            font-size: 14px; color: var(--text-primary);
            width: 100%; box-sizing: border-box;
            font-family: inherit; resize: none;
          }
          .mc-field-input::placeholder { color: var(--text-muted); }
          .mc-field-input:focus { background: rgba(0,123,255,0.03); }
          .mc-field-row.has-error { border-left: 3px solid #ef4444; }
          .mc-error-text {
            font-size: 10.5px; color: #ef4444;
            padding: 0 16px 8px; margin: 0;
          }
          /* char counter row */
          .mc-char-row {
            display: flex; justify-content: flex-end;
            padding: 0 16px 8px; font-size: 10px; font-weight: 600;
            color: var(--text-muted);
          }
          .mc-char-row.limit { color: #ef4444; }

          /* ── Submit button ── */
          .mc-submit {
            width: 100%; height: 50px;
            border-radius: 16px;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: #ffffff; font-size: 15px; font-weight: 700;
            border: none; cursor: pointer;
            display: flex; align-items: center; justify-content: center; gap: 10px;
            font-family: inherit;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            transition: opacity 0.2s, transform 0.1s;
            margin-top: 4px;
          }
          .mc-submit:active { transform: scale(0.98); }
          .mc-submit:disabled { opacity: 0.6; cursor: not-allowed; }
          [data-theme="dark"] .mc-submit {
            background: var(--primary-blue);
            box-shadow: 0 4px 20px rgba(0,123,255,0.25);
          }

          /* ── Success state ── */
          .mc-success {
            display: flex; flex-direction: column; align-items: center;
            padding: 32px 20px; text-align: center; gap: 12px;
          }
          .mc-success-ring {
            width: 72px; height: 72px; border-radius: 50%;
            background: linear-gradient(135deg, #d1fae5, #a7f3d0);
            display: flex; align-items: center; justify-content: center;
          }
          [data-theme="dark"] .mc-success-ring { background: linear-gradient(135deg, #064e3b, #065f46); }
          .mc-success-title { font-size: 20px; font-weight: 800; color: var(--text-primary); margin: 0; }
          .mc-success-sub { font-size: 13px; color: var(--text-secondary); margin: 0; line-height: 1.5; }
        }
      `}</style>

      <div className="contact-page-wrap">
        <div className="contact-plain-header">
          <h1>Get in Touch</h1>
          <p>Have a question or want to work together? Drop a message!</p>
        </div>

        {!isMobile ? (
          /* ── DESKTOP (unchanged) ── */
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
                    initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }}
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
                    variants={panelVariants} initial="hidden" animate="visible" exit={{ opacity: 0 }}
                  >
                    <motion.div variants={itemVariants} className="fc-field">
                      <label htmlFor="fc-name">Your name</label>
                      <input id="fc-name" name="name" className={`fc-input ${touched.name && errors.name ? 'error' : ''}`}
                        placeholder="Thota Sujith Reddy" value={form.name} onChange={handleChange} onBlur={handleBlur} required />
                      {touched.name && errors.name && <span className="fc-error-text">{errors.name}</span>}
                    </motion.div>
                    <motion.div variants={itemVariants} className="fc-field">
                      <label htmlFor="fc-email">Your email</label>
                      <input id="fc-email" name="email" type="email" className={`fc-input ${touched.email && errors.email ? 'error' : ''}`}
                        placeholder="sujithreddy1546@gmail.com" value={form.email} onChange={handleChange} onBlur={handleBlur} required />
                      {touched.email && errors.email && <span className="fc-error-text">{errors.email}</span>}
                    </motion.div>
                    <motion.div variants={itemVariants} className="fc-field">
                      <label htmlFor="fc-message">Message</label>
                      <textarea id="fc-message" name="message" className={`fc-input ${touched.message && errors.message ? 'error' : ''}`}
                        rows={4} placeholder="Tell me a bit about what you'd like to discuss..."
                        value={form.message} onChange={handleChange} onBlur={handleBlur} required />
                      {touched.message && errors.message && <span className="fc-error-text">{errors.message}</span>}
                    </motion.div>
                    <motion.button variants={itemVariants} type="submit" className="fc-submit-btn" disabled={status === "sending"}>
                      <AnimatePresence mode="wait" initial={false}>
                        {status === "sending" ? (
                          <motion.span key="loading" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }}
                            style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <Loader2 size={16} /> Sending...
                          </motion.span>
                        ) : (
                          <motion.span key="idle" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }}
                            style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            Send message <ArrowRight size={15} />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          /* ── MOBILE — premium redesign ── */
          <motion.div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            variants={panelVariants} initial="hidden" animate="visible"
          >
            {/* Hero dark card */}
            <motion.div className="mc-hero" variants={itemVariants}>
              <div className="mc-hero-dotgrid" />
              <div className="mc-hero-glow" />

              <div className="mc-hero-top">
                <img src="/profile_photo.png" alt="Sujith Thota" className="mc-hero-avatar" />
                <div className="mc-hero-info">
                  <p className="mc-hero-name">Sujith Thota</p>
                  <div className="mc-hero-badge">
                    <span className="mc-hero-badge-dot" />
                    Available for work
                  </div>
                </div>
              </div>

              <p className="mc-hero-tagline">
                Seeking graduate developer roles &amp; project collaborations. Let's build something great together!
              </p>

              <div className="mc-quick-actions">
                <motion.button
                  className={`mc-quick-btn ${emailCopied ? 'mc-quick-btn--copy-success' : ''}`}
                  onClick={handleCopyEmail}
                  whileTap={{ scale: 0.95 }}
                >
                  {emailCopied ? <Check size={13} /> : <Copy size={13} />}
                  {emailCopied ? 'Copied!' : 'Copy Email'}
                </motion.button>
                <motion.a
                  href={`mailto:${email}`}
                  className="mc-quick-btn"
                  style={{ textDecoration: 'none' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Mail size={13} /> Email Me
                </motion.a>
                <motion.a
                  href={`tel:${phone}`}
                  className="mc-quick-btn"
                  style={{ textDecoration: 'none' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Phone size={13} /> Call
                </motion.a>
              </div>

              <div className="mc-socials">
                <motion.a href="https://github.com/sujith1546" target="_blank" rel="noreferrer"
                  className="mc-social-btn" whileTap={{ scale: 0.9 }}>
                  <FaGithub size={16} />
                </motion.a>
                <motion.a href="https://linkedin.com" target="_blank" rel="noreferrer"
                  className="mc-social-btn" whileTap={{ scale: 0.9 }}>
                  <FaLinkedin size={16} />
                </motion.a>
              </div>
            </motion.div>

            {/* Form */}
            <AnimatePresence mode="wait" initial={false}>
              {status === "sent" ? (
                <motion.div key="success-mobile" className="mc-success"
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  <motion.div className="mc-success-ring"
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Check size={34} color="#16a34a" strokeWidth={2.5} />
                  </motion.div>
                  <p className="mc-success-title">Message sent! 🎉</p>
                  <p className="mc-success-sub">Thank you! I'll write back to you within a day.</p>
                </motion.div>
              ) : (
                <motion.div key="form-section" className="mc-form-section"
                  variants={panelVariants} initial="hidden" animate="visible"
                >
                  <motion.div variants={itemVariants}>
                    <p className="mc-group-label">Your details</p>
                    <div className="mc-fields-card">
                      {/* Name field */}
                      <motion.div
                        className={`mc-field-row ${touched.name && errors.name ? 'has-error' : ''}`}
                        animate={touched.name && errors.name ? "shake" : "idle"}
                        variants={shakeVariants}
                      >
                        <span className="mc-field-label">Name</span>
                        <input
                          id="m-name" name="name" className="mc-field-input"
                          placeholder="Thota Sujith Reddy"
                          value={form.name} onChange={handleChange} onBlur={handleBlur}
                        />
                        {touched.name && errors.name && <p className="mc-error-text">{errors.name}</p>}
                      </motion.div>

                      {/* Email field */}
                      <motion.div
                        className={`mc-field-row ${touched.email && errors.email ? 'has-error' : ''}`}
                        animate={touched.email && errors.email ? "shake" : "idle"}
                        variants={shakeVariants}
                      >
                        <span className="mc-field-label">Email</span>
                        <input
                          id="m-email" name="email" type="email" className="mc-field-input"
                          placeholder="you@example.com"
                          value={form.email} onChange={handleChange} onBlur={handleBlur}
                        />
                        {touched.email && errors.email && <p className="mc-error-text">{errors.email}</p>}
                      </motion.div>
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <p className="mc-group-label">Message</p>
                    <div className="mc-fields-card">
                      <motion.div
                        className={`mc-field-row ${touched.message && errors.message ? 'has-error' : ''}`}
                        animate={touched.message && errors.message ? "shake" : "idle"}
                        variants={shakeVariants}
                      >
                        <span className="mc-field-label">Your message</span>
                        <textarea
                          id="m-message" name="message" className="mc-field-input"
                          rows={5} placeholder="Tell me about what you'd like to discuss..."
                          value={form.message} onChange={handleChange} onBlur={handleBlur}
                          maxLength={500}
                        />
                        {touched.message && errors.message && <p className="mc-error-text">{errors.message}</p>}
                        <div className={`mc-char-row ${form.message.length >= 480 ? 'limit' : ''}`}>
                          {form.message.length} / 500
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>

                  <motion.button
                    variants={itemVariants}
                    className="mc-submit"
                    onClick={handleSubmit}
                    disabled={status === "sending"}
                    whileTap={{ scale: 0.97 }}
                  >
                    <AnimatePresence mode="wait">
                      {status === "sending" ? (
                        <motion.span key="sending"
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                        >
                          <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                          Sending…
                        </motion.span>
                      ) : (
                        <motion.span key="idle"
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                        >
                          <Send size={16} /> Send Message
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </ScrollReveal>
  );
}
