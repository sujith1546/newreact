import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, ArrowRight, Check, Loader2, Send } from "lucide-react";
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

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Validate form on input change or blur
  const validateField = (name, value) => {
    let error = "";
    if (!value.trim()) {
      error = `${name.charAt(0).toUpperCase() + name.slice(1)} is required.`;
    } else if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        error = "Please enter a valid email address.";
      }
    }
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    // Validate all fields before submitting
    const newErrors = {};
    let hasErrors = false;
    Object.keys(form).forEach(key => {
      validateField(key, form[key]);
      if (!form[key].trim()) {
        newErrors[key] = `${key.charAt(0).toUpperCase() + key.slice(1)} is required.`;
        hasErrors = true;
      } else if (key === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form[key])) {
          newErrors[key] = "Please enter a valid email address.";
          hasErrors = true;
        }
      }
    });

    setTouched({ name: true, email: true, message: true });
    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    setStatus("sending");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: form.message
        })
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setStatus("sent");
        setForm({ name: "", email: "", message: "" });
        setTouched({ name: false, email: false, message: false });
        setTimeout(() => setStatus("idle"), 5000);
      } else {
        throw new Error(result.error || "Failed to submit form");
      }
    } catch (error) {
      console.error("Contact Form Submission Error:", error);
      alert(`Oops! Something went wrong: ${error.message || 'Please try again later.'}`);
      setStatus("idle");
    }
  };

  return (
    <ScrollReveal>
      <style>{`
        .contact-page-wrap {
          width: 100%;
          max-width: 820px;
          box-sizing: border-box;
        }

        .contact-plain-header h1 {
          font-size: 28px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 8px;
        }
        .contact-plain-header p {
          color: var(--text-secondary);
          margin: 0 0 6px;
          font-size: 14.5px;
        }

        .fc-wrapper {
          border-radius: 20px;
          overflow: hidden;
          display: grid;
          grid-template-columns: 320px 1fr;
          border: 1px solid #ececec;
          width: 100%;
          box-sizing: border-box;
          min-height: 380px;
        }
        
        .fc-right-col {
          display: flex;
          flex-direction: column;
          min-width: 0;
          background: #fcfcfb;
        }
        .fc-info-panel {
          background: linear-gradient(135deg, #0d0d0d, #1a1a1a);
          padding: 2rem 1.75rem;
          color: #ffffff;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }
        .fc-dotgrid {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.13) 1.2px, transparent 1.2px);
          background-size: 20px 20px;
          pointer-events: none;
        }
        .fc-glow {
          position: absolute;
          top: -60px;
          right: -60px;
          width: 220px;
          height: 220px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,0.10), transparent 70%);
          pointer-events: none;
        }
        .fc-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 999px;
          padding: 5px 12px;
          font-size: 11.5px;
          color: #cccccc;
          margin-bottom: 20px;
          position: relative;
          width: fit-content;
        }
        .fc-badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #4ade80;
          flex-shrink: 0;
        }
        .fc-title {
          font-size: 26px;
          font-weight: 700;
          line-height: 1.25;
          margin: 0 0 12px;
          position: relative;
          color: #ffffff;
          transition: color 0.2s ease;
          cursor: default;
        }
        .fc-title:hover { color: #f0f0f0; text-shadow: 0 0 18px rgba(255,255,255,0.25); }

        .fc-subtitle {
          font-size: 13px;
          color: #aaaaaa;
          line-height: 1.65;
          margin: 0 0 28px;
          position: relative;
          transition: color 0.2s ease;
          cursor: default;
        }
        .fc-subtitle:hover { color: #e0e0e0; }

        .fc-info-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 14px;
          position: relative;
          border-radius: 8px;
          padding: 6px 8px;
          margin-left: -8px;
          transition: background 0.2s ease;
          cursor: default;
        }
        .fc-info-row:hover { background: rgba(255,255,255,0.06); }
        .fc-info-row:hover .fc-info-text { color: #ffffff; }
        
        .fc-info-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }
        .fc-info-text {
          font-size: 13px;
          color: #cccccc;
          transition: color 0.2s ease;
        }

        .fc-form-panel {
          padding: 2rem 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 20px;
          flex-grow: 1;
        }

        .fc-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          text-align: left;
        }
        .fc-field label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .fc-input {
          background: #ffffff;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 13.5px;
          color: var(--text-primary);
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .fc-input:focus {
          border-color: var(--primary-blue);
          box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.08);
        }
        
        .fc-submit-btn {
          height: 44px;
          border-radius: 8px;
          background: #111827;
          color: #ffffff;
          font-size: 13.5px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s ease, transform 0.1s ease;
        }
        .fc-submit-btn:hover { background: #1f2937; }
        .fc-submit-btn:active { transform: scale(0.98); }
        .fc-submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .fc-success {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex-grow: 1;
          padding: 2rem;
          text-align: center;
        }
        .fc-success-circle {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #d1fae5;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }
        .fc-success-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 4px;
        }
        .fc-success-sub {
          font-size: 13px;
          color: var(--text-secondary);
          margin: 0;
        }

        /* Error Styles */
        .fc-error-text {
          font-size: 11.5px;
          color: #ef4444;
          margin: 0;
          text-align: left;
        }

        .fc-input.error {
          border-color: #ef4444 !important;
        }

        /* Dark Mode overrides */
        [data-theme="dark"] .fc-wrapper { border-color: #374151; }
        [data-theme="dark"] .fc-right-col { background: #252525; }
        [data-theme="dark"] .fc-input { background: #1e1e1e; border-color: #374151; }
        [data-theme="dark"] .fc-input:focus { border-color: var(--primary-blue); }
        [data-theme="dark"] .fc-submit-btn { background: var(--primary-blue); color: #ffffff; }
        [data-theme="dark"] .fc-submit-btn:hover { background: var(--accent-blue); }
        [data-theme="dark"] .fc-success-circle { background: #064e3b; }

        /* ============================================
           MOBILE ACCESSIBLE CHAT + FORM UI (<= 900px)
           ============================================ */
        @media (max-width: 900px) {
          .contact-plain-header {
            text-align: left;
            margin-bottom: 16px;
          }

          .mobile-contact-container {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 24px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            box-shadow: var(--shadow-md);
            box-sizing: border-box;
            width: 100%;
            padding: 16px;
            gap: 16px;
          }

          /* Chat bubble greeting */
          .chat-greeting-bubble {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            margin-bottom: 4px;
            text-align: left;
          }

          .chat-avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            border: 1.5px solid var(--primary-blue);
            object-fit: cover;
            flex-shrink: 0;
          }

          .chat-bubble-content {
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: 6px 20px 20px 20px;
            padding: 10px 14px;
            font-size: 13px;
            line-height: 1.5;
            color: var(--text-primary);
            box-shadow: var(--shadow-sm);
          }

          /* Form inside Mobile container */
          .mobile-form {
            display: flex;
            flex-direction: column;
            gap: 18px;
            width: 100%;
          }

          .mobile-form .fc-field {
            position: relative;
            display: flex;
            flex-direction: column;
          }

          .mobile-form .fc-field label {
            position: absolute;
            left: 12px;
            top: 12px;
            font-size: 13px;
            color: var(--text-secondary);
            transition: all 0.2s ease;
            pointer-events: none;
            padding: 0 4px;
            background: transparent;
          }

          .mobile-form .fc-input:focus ~ label,
          .mobile-form .fc-input:not(:placeholder-shown) ~ label {
            top: -8px;
            left: 10px;
            font-size: 11px;
            font-weight: 700;
            color: var(--primary-blue);
            background: var(--bg-secondary);
            border-radius: 4px;
          }

          .mobile-form .fc-input {
            padding: 12px 14px;
            font-size: 13.5px;
            border-radius: 14px;
          }
          
          .mobile-form .fc-input:focus {
            box-shadow: 0 0 0 2px var(--primary-blue);
          }

          .mobile-form .fc-submit-btn {
            border-radius: 14px;
            margin-top: 4px;
            overflow: hidden;
            position: relative;
          }

          .char-counter {
            font-size: 10px;
            color: var(--text-muted);
            align-self: flex-end;
            margin-top: 4px;
            font-weight: 600;
          }
          .char-counter.limit {
            color: #ef4444;
          }
        }
      `}</style>

      <div className="contact-page-wrap">
        <div className="contact-plain-header">
          <h1>Get in Touch</h1>
          <p>Have a question or want to work together? Drop a message!</p>
        </div>

        {!isMobile ? (
          /* Desktop Card Layout */
          <div className="fc-wrapper">
            <div className="fc-info-panel">
              <div className="fc-dotgrid" />
              <div className="fc-glow" />
              
              <div>
                <div className="fc-badge">
                  <span className="fc-badge-dot" /> Available
                </div>
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
                  <motion.div
                    key="success"
                    className="fc-success"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <motion.div
                      className="fc-success-circle"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <Check size={30} color="#16a34a" strokeWidth={2.5} />
                    </motion.div>
                    <p className="fc-success-title">Message sent!</p>
                    <p className="fc-success-sub">I'll get back to you within a day.</p>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    className="fc-form-panel"
                    onSubmit={handleSubmit}
                    variants={panelVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0 }}
                  >
                    <motion.div variants={itemVariants} className="fc-field">
                      <label htmlFor="fc-name">Your name</label>
                      <input
                        id="fc-name"
                        name="name"
                        className={`fc-input ${touched.name && errors.name ? 'error' : ''}`}
                        placeholder="Thota Sujith Reddy"
                        value={form.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                      />
                      {touched.name && errors.name && (
                        <span className="fc-error-text">{errors.name}</span>
                      )}
                    </motion.div>

                    <motion.div variants={itemVariants} className="fc-field">
                      <label htmlFor="fc-email">Your email</label>
                      <input
                        id="fc-email"
                        name="email"
                        type="email"
                        className={`fc-input ${touched.email && errors.email ? 'error' : ''}`}
                        placeholder="sujithreddy1546@gmail.com"
                        value={form.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                      />
                      {touched.email && errors.email && (
                        <span className="fc-error-text">{errors.email}</span>
                      )}
                    </motion.div>

                    <motion.div variants={itemVariants} className="fc-field">
                      <label htmlFor="fc-message">Message</label>
                      <textarea
                        id="fc-message"
                        name="message"
                        className={`fc-input ${touched.message && errors.message ? 'error' : ''}`}
                        rows={4}
                        placeholder="Tell me a bit about what you'd like to discuss..."
                        value={form.message}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                      />
                      {touched.message && errors.message && (
                        <span className="fc-error-text">{errors.message}</span>
                      )}
                    </motion.div>

                    <motion.button
                      variants={itemVariants}
                      type="submit"
                      className="fc-submit-btn"
                      disabled={status === "sending"}
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        {status === "sending" ? (
                          <motion.span key="loading"
                            initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }}
                            style={{ display: "flex", alignItems: "center", gap: 8 }}
                          >
                            <Loader2 size={16} className="fc-spin" /> Sending...
                          </motion.span>
                        ) : (
                          <motion.span key="idle"
                            initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }}
                            style={{ display: "flex", alignItems: "center", gap: 8 }}
                          >
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
          /* Mobile Chat Greeting + Accessible Form Layout */
          <div className="mobile-contact-container">
            {/* Friendly Chat Bubble Greeting at the Top */}
            <div className="chat-greeting-bubble">
              <img src="/IMG_0322.jpg" alt="Sujith Thota" className="chat-avatar" />
              <div className="chat-bubble-content">
                Hi! Sujith here. Drop a line below with your name, email, and message, and I'll get back to you within a day! 🚀
              </div>
            </div>

            {/* Standard Accessible Labeled Form Fields */}
            <AnimatePresence mode="wait" initial={false}>
              {status === "sent" ? (
                <motion.div
                  key="success-mobile"
                  className="fc-success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  style={{ padding: '24px 0' }}
                >
                  <div className="fc-success-circle">
                    <Check size={28} color="#16a34a" strokeWidth={2.5} />
                  </div>
                  <p className="fc-success-title">Message sent!</p>
                  <p className="fc-success-sub">Thank you, I'll write back to you soon.</p>
                </motion.div>
              ) : (
                <form className="mobile-form" onSubmit={handleSubmit}>
                  <motion.div className="fc-field" animate={touched.name && errors.name ? "shake" : "idle"} variants={shakeVariants}>
                    <input
                      id="m-fc-name"
                      name="name"
                      className={`fc-input ${touched.name && errors.name ? 'error' : ''}`}
                      placeholder=" "
                      value={form.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    />
                    <label htmlFor="m-fc-name">Your name</label>
                    {touched.name && errors.name && (
                      <span className="fc-error-text">{errors.name}</span>
                    )}
                  </motion.div>

                  <motion.div className="fc-field" animate={touched.email && errors.email ? "shake" : "idle"} variants={shakeVariants}>
                    <input
                      id="m-fc-email"
                      name="email"
                      type="email"
                      className={`fc-input ${touched.email && errors.email ? 'error' : ''}`}
                      placeholder=" "
                      value={form.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    />
                    <label htmlFor="m-fc-email">Your email</label>
                    {touched.email && errors.email && (
                      <span className="fc-error-text">{errors.email}</span>
                    )}
                  </motion.div>

                  <motion.div className="fc-field" animate={touched.message && errors.message ? "shake" : "idle"} variants={shakeVariants}>
                    <textarea
                      id="m-fc-message"
                      name="message"
                      className={`fc-input ${touched.message && errors.message ? 'error' : ''}`}
                      rows={4}
                      placeholder=" "
                      value={form.message}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      maxLength={500}
                      required
                    />
                    <label htmlFor="m-fc-message">Message</label>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      {touched.message && errors.message ? (
                        <span className="fc-error-text">{errors.message}</span>
                      ) : <span />}
                      <span className={`char-counter ${form.message.length >= 480 ? 'limit' : ''}`}>
                        {form.message.length} / 500
                      </span>
                    </div>
                  </motion.div>

                  <button
                    type="submit"
                    className="fc-submit-btn"
                    disabled={status === "sending"}
                  >
                    <AnimatePresence mode="wait">
                      {status === "sending" ? (
                        <motion.span 
                          key="sending"
                          initial={{ opacity: 0, x: -20, y: 20 }}
                          animate={{ opacity: 1, x: 100, y: -100 }}
                          transition={{ duration: 0.8, ease: "easeIn" }}
                          style={{ display: "flex", alignItems: "center", position: "absolute" }}
                        >
                          <Send size={20} />
                        </motion.span>
                      ) : (
                        <motion.span 
                          key="idle"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          style={{ display: "flex", alignItems: "center", gap: 8 }}
                        >
                          Send message <ArrowRight size={15} />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                </form>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </ScrollReveal>
  );
}
