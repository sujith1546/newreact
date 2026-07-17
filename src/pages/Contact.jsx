import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, ArrowRight, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import ScrollReveal from '../components/ScrollReveal';

const panelVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

export default function Contact() {
  const email = "sujithreddy1546@gmail.com";
  const phone = "+91 8501889996";

  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | sent

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        setTimeout(() => setStatus("idle"), 3000);
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
        /* ── Contact page overrides ── */
        .contact-page-wrap {
          width: 100%;
          max-width: 820px;
          box-sizing: border-box;
        }

        /* ── Existing plain info (top) ── */
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
        .contact-plain-header ul {
          margin: 0 0 32px 20px;
          padding: 0;
        }
        .contact-plain-header li {
          margin: 6px 0;
          font-size: 14px;
          color: var(--text-secondary);
        }

        /* ── Card ── */
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
        @media (max-width: 680px) {
          .fc-wrapper { grid-template-columns: 1fr; }
        }
        /* Right column stretcher — keeps the card height fixed */
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
        .fc-info-row:hover .fc-info-icon {
          background: rgba(255,255,255,0.16);
          border-color: rgba(255,255,255,0.25);
        }

        .fc-info-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(255,255,255,0.10);
          border: 1px solid rgba(255,255,255,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: #ffffff;
          transition: background 0.2s ease, border-color 0.2s ease;
        }
        .fc-info-text {
          font-size: 13px;
          color: #e0e0e0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: color 0.2s ease;
        }

        .fc-footnote {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 10px;
          letter-spacing: 0.08em;
          color: #888888;
          margin: 0;
          position: relative;
          transition: color 0.2s ease;
          cursor: default;
        }
        .fc-footnote:hover { color: #bbbbbb; }
        .fc-footnote-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #4ade80;
          flex-shrink: 0;
        }
        .fc-form-panel {
          background: #fcfcfb;
          padding: 2rem 2rem;
          display: flex;
          flex-direction: column;
          gap: 16px;
          min-width: 0;
          flex: 1;
        }
        .fc-field label {
          display: block;
          font-size: 12px;
          color: #888888;
          margin-bottom: 5px;
        }
        .fc-input {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #e5e5e3;
          border-radius: 10px;
          padding: 11px 13px;
          font-size: 13.5px;
          color: #111111;
          background: #ffffff;
          font-family: inherit;
          resize: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .fc-input:focus {
          outline: none;
          border-color: #111111;
          box-shadow: 0 0 0 3px rgba(17, 17, 17, 0.06);
        }
        .fc-submit-btn {
          width: 100%;
          background: #111111;
          color: #ffffff;
          border: none;
          border-radius: 10px;
          padding: 12px;
          font-size: 14px;
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          margin-top: 2px;
          transition: background 0.15s ease;
        }
        .fc-submit-btn span,
        .fc-submit-btn * { color: #ffffff !important; }
        .fc-submit-btn:hover:not(:disabled) {
          background: #222222;
        }
        .fc-submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .fc-submit-btn.sent {
          background: #1e8e3e;
        }
        .fc-spin {
          animation: fc-spin 0.7s linear infinite;
        }
        @keyframes fc-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        /* ── Success state ── */
        .fc-success {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          flex: 1;
          padding: 2.5rem;
          text-align: center;
          background: #fcfcfb;
        }
        .fc-success-circle {
          width: 68px;
          height: 68px;
          border-radius: 50%;
          background: #dcfce7;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .fc-success-title {
          font-size: 17px;
          font-weight: 700;
          color: #111111;
          margin: 0;
        }
        .fc-success-sub {
          font-size: 13.5px;
          color: #888888;
          margin: 0;
        }
      `}</style>

      <div className="contact-page-wrap">
        {/* ── Original plain contact info (kept at top) ── */}
        <div className="contact-plain-header">
          <h1>Contact Me</h1>
          <p>Feel free to reach out to me via email or phone:</p>
          <ul>
            <li>Email: sujithreddy1546@gmail.com</li>
            <li>Phone: +91 8501889996</li>
          </ul>
        </div>

        {/* ── New animated contact card ── */}
        <div className="fc-wrapper">
          <motion.div
            className="fc-info-panel"
            variants={panelVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="fc-dotgrid" />
            <div className="fc-glow" />
            <div>
              <motion.div variants={itemVariants} className="fc-badge">
                <span className="fc-badge-dot" />
                Open to opportunities
              </motion.div>
              <motion.p variants={itemVariants} className="fc-title">
                Let's build<br />something great
              </motion.p>
              <motion.p variants={itemVariants} className="fc-subtitle">
                Have a project, opportunity, or just want to connect? Drop me a message.
              </motion.p>

              <motion.div variants={itemVariants} className="fc-info-row">
                <div className="fc-info-icon"><Mail size={15} /></div>
                <span className="fc-info-text">{email}</span>
              </motion.div>

              <motion.div variants={itemVariants} className="fc-info-row">
                <div className="fc-info-icon"><Phone size={15} /></div>
                <span className="fc-info-text">{phone}</span>
              </motion.div>
            </div>

            <motion.p variants={itemVariants} className="fc-footnote">
              <span className="fc-footnote-dot" />
              USUALLY REPLIES WITHIN A DAY
            </motion.p>
          </motion.div>

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
                    className="fc-input"
                    placeholder="Thota Sujith Reddy"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="fc-field">
                  <label htmlFor="fc-email">Your email</label>
                  <input
                    id="fc-email"
                    name="email"
                    type="email"
                    className="fc-input"
                    placeholder="sujithreddy1546@gmail.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="fc-field">
                  <label htmlFor="fc-message">Message</label>
                  <textarea
                    id="fc-message"
                    name="message"
                    className="fc-input"
                    rows={4}
                    placeholder="Tell me a bit about what you'd like to discuss..."
                    value={form.message}
                    onChange={handleChange}
                    required
                  />
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
      </div>
    </ScrollReveal>
  );
}
