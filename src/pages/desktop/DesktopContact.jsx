import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, Loader2, Send, Check } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import ScrollReveal from '../../components/ScrollReveal';
import { useIsland } from '../../context/IslandContext';

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

export default function DesktopContact() {
  const email = "sujithreddy1546@gmail.com";
  const phone = "+91 8501889996";
  const { triggerIsland } = useIsland();

  const [form, setForm] = useState({ name: "", email: "", message: "", _catch: "" });
  const [errors, setErrors] = useState({ name: "", email: "", message: "" });
  const [touched, setTouched] = useState({ name: false, email: false, message: false });
  const [status, setStatus] = useState("idle");

  const validateField = (name, value) => {
    let error = "";
    if (!value.trim()) {
      error = `${name.charAt(0).toUpperCase() + name.slice(1)} is required.`;
    } else if (name === "name" && value.length > 60) {
      error = "Name is too long (max 60 chars).";
    } else if (name === "message" && value.length > 2000) {
      error = "Message is too long (max 2000 chars).";
    } else if (name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      error = "Please enter a valid email.";
    } else if (/<script>|<\/script>|<[^>]+>/i.test(value)) {
      error = "Invalid characters detected. HTML is not allowed.";
    }

    setErrors(prev => ({ ...prev, [name]: error }));
    return error;
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
    
    if (form._catch) {
      try {
        await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-portfolio-session': getSessionToken() },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            message: form.message,
            company_website: form._catch
          })
        });
      } catch (e) {
        // Silently fail
      }
      
      setStatus("sent");
      triggerIsland({
        title: 'Security Alert',
        subtitle: 'Bot activity detected and blocked.',
        color: '#ef4444',
        duration: 4000
      });
      setTimeout(() => { setStatus("idle"); setForm({ name: "", email: "", message: "", _catch: "" }); }, 3000);
      return;
    }
    
    let hasErrors = false;
    const newErrors = {};
    Object.keys(form).forEach(key => {
      if (key === "_catch") return;
      const err = validateField(key, form[key]);
      if (err) {
        newErrors[key] = err;
        hasErrors = true;
      }
    });

    setTouched({ name: true, email: true, message: true });
    if (hasErrors) { 
      setErrors(prev => ({ ...prev, ...newErrors })); 
      return; 
    }

    const lastSent = localStorage.getItem("lastContactSent");
    if (lastSent && Date.now() - parseInt(lastSent) < 60000) {
      setErrors(prev => ({ ...prev, message: "Please wait a minute before sending another message. (Anti-spam)" }));
      return;
    }

    setStatus("sending");
    
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-portfolio-session': getSessionToken()
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: form.message,
          company_website: form._catch,
          referrer_path: window.location.pathname
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send message');

      localStorage.setItem("lastContactSent", Date.now().toString());
      setStatus("sent");
      triggerIsland({
        title: 'Message Sent',
        subtitle: "I'll get back to you shortly",
        icon: <Check size={18} strokeWidth={3} />,
        color: '#10b981',
        duration: 4000
      });
      setForm({ name: "", email: "", message: "", _catch: "" });
      setTouched({ name: false, email: false, message: false });
      setTimeout(() => setStatus("idle"), 5000);
      
    } catch (err) {
      console.error(err);
      setStatus("idle");
      setErrors(prev => ({ ...prev, message: "Network error. Please try connecting again or use direct email." }));
    }
  };

  return (
    <ScrollReveal>
      <style>{`
        .contact-page-wrap { width: 100%; max-width: 820px; box-sizing: border-box; }
        .contact-plain-header { margin-bottom: 24px; }
        .contact-plain-header h1 { font-size: 28px; font-weight: 700; color: var(--text-primary); margin: 0 0 6px; }
        .contact-plain-header p { color: var(--text-secondary); margin: 0; font-size: 14.5px; }

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
      `}</style>

      <div className="contact-page-wrap">
        <div className="contact-plain-header">
          <h1>Get in Touch</h1>
          <p>Have a question or want to work together? Drop a message!</p>
        </div>

        <div className="fc-wrapper">
          <div className="fc-info-panel">
            <div className="fc-dotgrid" />
            <div className="fc-glow" />
            <div>
              <div className="fc-badge">
                <span className="fc-badge-dot" /> Open to Opportunities
              </div>
              <h2 className="fc-title">Let's build something together.</h2>
              <p className="fc-subtitle">I'm currently seeking new full-time software engineering roles. Reach out and I'll get back to you promptly.</p>
              
              <a href={`mailto:${email}`} className="fc-info-row">
                <div className="fc-info-icon"><Mail size={16} /></div>
                <span className="fc-info-text">{email}</span>
              </a>
              <a href={`tel:${phone}`} className="fc-info-row">
                <div className="fc-info-icon"><Phone size={16} /></div>
                <span className="fc-info-text">{phone}</span>
              </a>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <a href="https://github.com/sujith1546" target="_blank" rel="noreferrer" className="fc-info-icon">
                <FaGithub size={16} />
              </a>
              <a href="https://linkedin.com/in/thota-sujith-reddy" target="_blank" rel="noreferrer" className="fc-info-icon">
                <FaLinkedin size={16} />
              </a>
            </div>
          </div>

          <div className="fc-right-col">
            {status === "sent" ? (
              <div className="fc-success">
                <div className="fc-success-circle">
                  <Check size={28} color="#10b981" />
                </div>
                <h3 className="fc-success-title">Message Received</h3>
                <p className="fc-success-sub">Thank you for reaching out! I will get back to you shortly.</p>
              </div>
            ) : (
              <form className="fc-form-panel" onSubmit={handleSubmit}>
                <input type="text" name="_catch" value={form._catch} onChange={handleChange} style={{ display: 'none' }} />
                
                <div className="fc-field">
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Your name"
                    value={form.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`fc-input ${errors.name ? 'error' : ''}`}
                  />
                  {errors.name && <p className="fc-error-text">{errors.name}</p>}
                </div>

                <div className="fc-field">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`fc-input ${errors.email ? 'error' : ''}`}
                  />
                  {errors.email && <p className="fc-error-text">{errors.email}</p>}
                </div>

                <div className="fc-field">
                  <label>Message</label>
                  <textarea
                    name="message"
                    rows={4}
                    placeholder="How can I help you?"
                    value={form.message}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`fc-input ${errors.message ? 'error' : ''}`}
                    style={{ resize: 'vertical' }}
                  />
                  {errors.message && <p className="fc-error-text">{errors.message}</p>}
                </div>

                <button type="submit" className="fc-submit-btn" disabled={status === "sending"}>
                  {status === "sending" ? <Loader2 size={18} className="spin" /> : <>Send Message <Send size={14} style={{ marginLeft: 8 }} /></>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}
