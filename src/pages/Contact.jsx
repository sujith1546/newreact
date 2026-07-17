import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, ArrowRight, Check, Loader2, Send, RotateCcw } from "lucide-react";
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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);

  // Mobile Chat State Machine
  const [chatStep, setChatStep] = useState(0); // 0: Name, 1: Email, 2: Message, 3: Sending, 4: Done
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { sender: 'bot', text: "Hey! Sujith here. What is your name? 👋" }
  ]);

  const chatEndRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-scroll mobile chat feed to bottom
  useEffect(() => {
    if (isMobile && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isMobile]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Normal Desktop Submit
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
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

  // Mobile Chat Form Submit Trigger
  const triggerChatSubmit = async (finalMessage, finalName, finalEmail) => {
    setChatStep(3);
    setStatus("sending");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          name: finalName,
          email: finalEmail,
          message: finalMessage
        })
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setChatHistory(prev => [
          ...prev,
          { sender: 'bot', text: "Perfect! Message sent successfully. I will get back to you within a day. 🚀" }
        ]);
        setChatStep(4);
        setStatus("sent");
      } else {
        throw new Error(result.error || "Failed to submit form");
      }
    } catch (error) {
      console.error("Chat Form Submission Error:", error);
      setChatHistory(prev => [
        ...prev,
        { sender: 'bot', text: `Oops, something went wrong: ${error.message || 'Server error'}. Please tap reset and try again.` }
      ]);
      setChatStep(4);
      setStatus("idle");
    }
  };

  const handleChatSend = () => {
    const text = chatInput.trim();
    if (!text) return;

    setChatInput("");

    if (chatStep === 0) {
      // Save Name
      setForm(prev => ({ ...prev, name: text }));
      setChatHistory(prev => [
        ...prev,
        { sender: 'user', text },
        { sender: 'bot', text: `Nice to meet you, ${text}! What is your email address so I can write back? ✉️` }
      ]);
      setChatStep(1);
    } else if (chatStep === 1) {
      // Save Email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(text)) {
        setChatHistory(prev => [
          ...prev,
          { sender: 'user', text },
          { sender: 'bot', text: "Hmm, that email doesn't look valid. Could you please double check? 🔍" }
        ]);
        return;
      }
      setForm(prev => ({ ...prev, email: text }));
      setChatHistory(prev => [
        ...prev,
        { sender: 'user', text },
        { sender: 'bot', text: "Excellent! What would you like to discuss? Type your message below. 💬" }
      ]);
      setChatStep(2);
    } else if (chatStep === 2) {
      // Save Message & Submit
      setForm(prev => ({ ...prev, message: text }));
      setChatHistory(prev => [
        ...prev,
        { sender: 'user', text },
        { sender: 'bot', text: "Got it! Sending message now..." }
      ]);
      triggerChatSubmit(text, form.name, form.email);
    }
  };

  const handleChatReset = () => {
    setForm({ name: "", email: "", message: "" });
    setChatStep(0);
    setChatInput("");
    setChatHistory([
      { sender: 'bot', text: "Hey! Sujith here. What is your name? 👋" }
    ]);
    setStatus("idle");
  };

  const handleChatKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleChatSend();
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
        .contact-plain-header ul {
          margin: 0 0 32px 20px;
          padding: 0;
        }
        .contact-plain-header li {
          margin: 6px 0;
          font-size: 14px;
          color: var(--text-secondary);
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

        /* Dark Mode overrides */
        [data-theme="dark"] .fc-wrapper { border-color: #374151; }
        [data-theme="dark"] .fc-right-col { background: #252525; }
        [data-theme="dark"] .fc-input { background: #1e1e1e; border-color: #374151; }
        [data-theme="dark"] .fc-input:focus { border-color: var(--primary-blue); }
        [data-theme="dark"] .fc-submit-btn { background: var(--primary-blue); color: #ffffff; }
        [data-theme="dark"] .fc-submit-btn:hover { background: var(--accent-blue); }
        [data-theme="dark"] .fc-success-circle { background: #064e3b; }

        /* ============================================
           MOBILE APP INSTANT MESSENGER UI (<= 900px)
           ============================================ */
        @media (max-width: 900px) {
          .contact-plain-header {
            text-align: left;
            margin-bottom: 16px;
          }

          .mobile-chat-app {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 24px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            height: 480px;
            box-shadow: var(--shadow-md);
            box-sizing: border-box;
            width: 100%;
          }

          /* Chat header */
          .chat-app-header {
            height: 54px;
            background: var(--bg-primary);
            border-bottom: 1px solid var(--border-color);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 16px;
            box-sizing: border-box;
          }

          .chat-header-profile {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .chat-header-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 1.5px solid var(--primary-blue);
            object-fit: cover;
          }

          .chat-header-info {
            text-align: left;
          }

          .chat-header-name {
            font-size: 13.5px;
            font-weight: 700;
            color: var(--text-primary);
            margin: 0;
            line-height: 1.2;
          }

          .chat-header-status {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 10px;
            color: #10b981;
            font-weight: 600;
          }

          .chat-header-dot {
            width: 5px;
            height: 5px;
            border-radius: 50%;
            background: #10b981;
          }

          .chat-reset-btn {
            border: none;
            background: none;
            color: var(--text-secondary);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 6px;
            border-radius: 50%;
            transition: background 0.2s ease;
          }

          .chat-reset-btn:active {
            background: rgba(128, 128, 128, 0.08);
          }

          /* Chat feed area */
          .chat-feed-box {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            background: var(--bg-secondary);
            box-sizing: border-box;
          }

          .chat-bubble-row {
            display: flex;
            width: 100%;
          }

          .chat-bubble-row.bot {
            justify-content: flex-start;
          }

          .chat-bubble-row.user {
            justify-content: flex-end;
          }

          .chat-bubble {
            max-width: 80%;
            padding: 10px 14px;
            font-size: 13px;
            line-height: 1.5;
            text-align: left;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          }

          .chat-bubble.bot {
            background: var(--bg-primary);
            color: var(--text-primary);
            border-radius: 16px 16px 16px 4px;
            border: 1px solid var(--border-color);
          }

          .chat-bubble.user {
            background: var(--primary-blue);
            color: white;
            border-radius: 16px 16px 4px 16px;
          }

          /* Input panel bar */
          .chat-input-panel {
            height: 60px;
            background: var(--bg-primary);
            border-top: 1px solid var(--border-color);
            display: flex;
            align-items: center;
            padding: 8px 12px;
            gap: 8px;
            box-sizing: border-box;
          }

          .chat-input-box {
            flex: 1;
            height: 38px;
            border-radius: 20px;
            border: 1px solid var(--border-color);
            background: var(--bg-secondary);
            color: var(--text-primary);
            padding: 0 14px;
            font-size: 13px;
            outline: none;
            box-sizing: border-box;
          }

          .chat-input-box:focus {
            border-color: var(--primary-blue);
          }

          .chat-send-btn {
            width: 38px;
            height: 38px;
            border-radius: 50%;
            background: var(--primary-blue);
            color: white;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: opacity 0.2s ease;
          }

          .chat-send-btn:disabled {
            opacity: 0.4;
            cursor: not-allowed;
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
        ) : (
          /* Mobile Interactive Messenger App */
          <div className="mobile-chat-app">
            
            {/* Header bar */}
            <div className="chat-app-header">
              <div className="chat-header-profile">
                <img src="/IMG_0322.jpg" alt="Sujith Thota" className="chat-header-avatar" />
                <div className="chat-header-info">
                  <h4 className="chat-header-name">Sujith Thota</h4>
                  <div className="chat-header-status">
                    <div className="chat-header-dot" />
                    <span>Active Now</span>
                  </div>
                </div>
              </div>
              <button onClick={handleChatReset} className="chat-reset-btn" title="Restart conversation" aria-label="Restart conversation">
                <RotateCcw size={16} />
              </button>
            </div>

            {/* Chat message bubbles feed */}
            <div className="chat-feed-box">
              {chatHistory.map((msg, idx) => (
                <motion.div 
                  key={idx} 
                  className={`chat-bubble-row ${msg.sender}`}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className={`chat-bubble ${msg.sender}`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              
              {/* Typing indicator bubble */}
              {status === "sending" && chatStep === 3 && (
                <motion.div className="chat-bubble-row bot" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="chat-bubble bot" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <Loader2 size={12} className="fc-spin" />
                    <span>Sujith is writing...</span>
                  </div>
                </motion.div>
              )}
              
              <div ref={chatEndRef} />
            </div>

            {/* Input bar panels */}
            <div className="chat-input-panel">
              <input 
                type="text"
                className="chat-input-box"
                placeholder={
                  chatStep === 0 ? "Type your name..." :
                  chatStep === 1 ? "Type your email..." :
                  chatStep === 2 ? "Type your message..." :
                  "Conversation complete."
                }
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={handleChatKeyDown}
                disabled={chatStep >= 3}
              />
              <button 
                onClick={handleChatSend}
                className="chat-send-btn"
                disabled={!chatInput.trim() || chatStep >= 3}
                aria-label="Send message"
              >
                <Send size={16} style={{ marginLeft: 1 }} />
              </button>
            </div>

          </div>
        )}
      </div>
    </ScrollReveal>
  );
}
