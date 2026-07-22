import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useAnimation, useMotionValue, useTransform } from "framer-motion";
import { Mail, Phone, ArrowRight, Check, Loader2, Send, Copy, ChevronRight, MapPin, Clock, FileText, X, Contact as ContactIcon, ChevronLeft } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import ScrollReveal from '../components/ScrollReveal';
import { useIsland } from '../context/IslandContext';
import { supabase } from '../lib/supabaseClient';
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

const shakeVariants = {
  shake: { x: [-4, 4, -4, 4, 0], transition: { duration: 0.35 } },
  idle: { x: 0 }
};

const SwipeToSend = ({ onSend, status, isFormValid, triggerValidation }) => {
  const containerRef = useRef(null);
  const x = useMotionValue(0);
  const controls = useAnimation();

  const handleDragEnd = (event, info) => {
    if (status === "sending") return;
    const containerWidth = containerRef.current?.offsetWidth || 300;
    const knobWidth = 44;
    const padding = 12; // 6px each side
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
    if (status === "idle") controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } });
    if (status === "sending") {
      const containerWidth = containerRef.current?.offsetWidth || 300;
      controls.start({ x: containerWidth - 44 - 12 });
    }
  }, [status, controls]);

  const backgroundFill = useTransform(x, [0, 200], ["rgba(37,99,235,0)", "rgba(37,99,235,0.15)"]);
  const textOpacity = useTransform(x, [0, 120], [1, 0]);

  return (
    <div 
      className="swipe-send-container" 
      ref={containerRef}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
    >
      <motion.div className="swipe-send-bg" style={{ background: backgroundFill }} />
      <motion.div className="swipe-send-text" style={{ opacity: textOpacity }}>
        Swipe to send
      </motion.div>
      <motion.div
        className="swipe-send-knob"
        drag={status === "sending" ? false : "x"}
        dragConstraints={containerRef}
        dragElastic={0.05}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ x }}
        whileTap={{ scale: status === "sending" ? 1 : 0.95 }}
      >
        {status === "sending" ? (
          <Loader2 size={18} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
        ) : (
          <ChevronRight size={20} strokeWidth={2.5} style={{ marginLeft: '2px' }} />
        )}
      </motion.div>
    </div>
  );
};

export default function Contact() {
  const email = "sujithreddy1546@gmail.com";
  const phone = "+91 8501889996";
  const { triggerIsland } = useIsland();

  const [form, setForm] = useState({ name: "", email: "", message: "", _catch: "" });
  const [errors, setErrors] = useState({ name: "", email: "", message: "" });
  const [touched, setTouched] = useState({ name: false, email: false, message: false });
  const [status, setStatus] = useState("idle");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  const [emailCopied, setEmailCopied] = useState(false);
  const [isContactCardOpen, setIsContactCardOpen] = useState(false);

  const handleSaveContact = () => {
    const vCard = `BEGIN:VCARD
VERSION:3.0
N:Reddy;Thota Sujith;;;
FN:Thota Sujith Reddy
TITLE:Software Engineer
EMAIL;TYPE=INTERNET:${email}
TEL;TYPE=CELL:${phone}
URL:https://github.com/sujith1546
END:VCARD`;

    const blob = new Blob([vCard], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Thota_Sujith_Reddy.vcf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    triggerIsland({
      title: 'Contact Saved',
      subtitle: 'vCard downloaded successfully',
      icon: <Check size={18} strokeWidth={3} />,
      color: '#10b981',
      duration: 3000
    });
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const validateField = (name, value) => {
    let error = "";
    
    // 1. Basic empty check
    if (!value.trim()) {
      error = `${name.charAt(0).toUpperCase() + name.slice(1)} is required.`;
    } 
    // 2. Length limits (anti-spam)
    else if (name === "name" && value.length > 60) {
      error = "Name is too long (max 60 chars).";
    }
    else if (name === "message" && value.length > 2000) {
      error = "Message is too long (max 2000 chars).";
    }
    // 3. Email validation
    else if (name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      error = "Please enter a valid email.";
    }
    // 4. XSS / Injection protection (deny basic HTML/Script tags)
    else if (/<script>|<\/script>|<[^>]+>/i.test(value)) {
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
    
    // HONEYPOT TRAP
    if (form._catch) {
      // Bot detected! Log it to Supabase so you can audit spam, but abort UI.
      try {
        await supabase.from('contact_messages').insert([{
          name: form.name,
          email: form.email,
          message: form.message,
          is_bot: true
        }]);
      } catch (e) {
        // Silently fail if spam logging fails
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
    
    // Validate all fields using the updated robust validator
    let hasErrors = false;
    const newErrors = {};
    Object.keys(form).forEach(key => {
      if (key === "_catch") return; // Skip validation for honeypot
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

    // Client-side Rate Limiting (prevent spamming API)
    const lastSent = localStorage.getItem("lastContactSent");
    if (lastSent && Date.now() - parseInt(lastSent) < 60000) {
      setErrors(prev => ({ ...prev, message: "Please wait a minute before sending another message. (Anti-spam)" }));
      return;
    }

    setStatus("sending");
    
    try {
      // Insert directly into Supabase (Public Anon Key using Insert RLS Policy)
      const { error } = await supabase.from('contact_messages').insert([{
        name: form.name,
        email: form.email,
        message: form.message,
        is_bot: false
      }]);

      if (error) throw error;

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

        /* ===== MOBILE REDESIGN ===== */
        @media (max-width: 900px) {
          .mc-outer-container {
            display: flex; flex-direction: column;
            width: 100%; overflow-y: auto; overflow-x: hidden;
            -ms-overflow-style: none; scrollbar-width: none;
            padding: 0 4px 20px 4px;
            box-sizing: border-box;
            gap: 20px;
          }
          .mc-outer-container::-webkit-scrollbar { display: none; }
          
          .mc-header-row {
            display: flex; justify-content: space-between; align-items: flex-start;
          }
          .mc-page-title { font-size: 24px; font-weight: 800; color: var(--text-primary); margin: 0 0 4px; letter-spacing: -0.02em; }
          .mc-page-sub { font-size: 13px; color: var(--text-secondary); margin: 0; line-height: 1.4; }
          
          .mc-avail-pill {
            display: inline-flex; align-items: center; gap: 6px;
            background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.2);
            border-radius: 20px; padding: 6px 12px;
          }
          .mc-avail-dot {
            width: 8px; height: 8px; border-radius: 50%; background: #22c55e;
            box-shadow: 0 0 10px rgba(34,197,94,0.5);
            animation: pulseDot 2s infinite;
          }
          @keyframes pulseDot {
            0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
            70% { box-shadow: 0 0 0 8px rgba(34,197,94,0); }
            100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
          }
          .mc-avail-text { font-size: 11px; font-weight: 700; color: #16a34a; text-transform: uppercase; letter-spacing: 0.05em; }
          
          /* Contact Cards */
          .mc-cards-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }
          .mc-contact-card-item {
            background: rgba(255,255,255,0.03);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 16px;
            display: flex; flex-direction: column; gap: 12px;
            text-decoration: none;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            transition: transform 0.1s, background 0.2s;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(0,0,0,0.02);
          }
          [data-theme="dark"] .mc-contact-card-item {
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.08);
          }
          .mc-contact-card-item:active { transform: scale(0.96); }
          .mc-card-icon-wrap {
            width: 38px; height: 38px; border-radius: 12px;
            display: flex; align-items: center; justify-content: center;
          }
          .mc-card-title { font-size: 12px; font-weight: 600; color: var(--text-secondary); margin: 0; }
          .mc-card-value { font-size: 14px; font-weight: 700; color: var(--text-primary); margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          
          /* Form Area */
          .mc-form-container {
            background: var(--bg-primary);
            border-radius: 20px;
            border: 1px solid var(--border-color);
            padding: 16px;
            display: flex; flex-direction: column; gap: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.03);
          }
          [data-theme="dark"] .mc-form-container {
            background: rgba(20,20,20,0.5);
            border-color: rgba(255,255,255,0.06);
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          }
          .mc-form-title { font-size: 15px; font-weight: 700; color: var(--text-primary); margin: 0 0 2px; display: flex; align-items: center; gap: 6px; }
          
          /* Floating Label Inputs */
          .mc-input-group { position: relative; }
          .mc-input {
            width: 100%; box-sizing: border-box;
            background: rgba(128,128,128,0.05);
            border: 1px solid rgba(128,128,128,0.2);
            border-radius: 12px;
            padding: 20px 14px 8px;
            font-size: 13.5px; font-family: inherit; font-weight: 500;
            color: var(--text-primary);
            outline: none; transition: all 0.2s;
            -webkit-appearance: none;
          }
          .mc-input:focus {
            background: transparent;
            border-color: var(--primary-blue);
            box-shadow: 0 0 0 3px rgba(0,123,255,0.1);
          }
          .mc-input.has-error { border-color: #ef4444; }
          .mc-label {
            position: absolute; left: 14px; top: 14px;
            font-size: 13px; font-weight: 500; color: var(--text-secondary);
            pointer-events: none; transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
          }
          .mc-input:focus ~ .mc-label,
          .mc-input:not(:placeholder-shown) ~ .mc-label {
            top: 6px; font-size: 9px; font-weight: 700; color: var(--primary-blue); text-transform: uppercase; letter-spacing: 0.05em;
          }
          .mc-input.has-error ~ .mc-label { color: #ef4444; }
          .mc-error-msg { font-size: 10px; font-weight: 600; color: #ef4444; margin: 3px 0 0 4px; display: block; }
          
          /* Swipe to Send Slider */
          .swipe-send-container {
            position: relative;
            width: 100%;
            height: 56px;
            background: rgba(128,128,128,0.06);
            border: 1px solid rgba(128,128,128,0.15);
            border-radius: 28px;
            margin-top: 4px;
            overflow: hidden;
            display: flex;
            align-items: center;
            box-sizing: border-box;
            padding: 6px;
          }
          [data-theme="dark"] .swipe-send-container {
            background: rgba(0,0,0,0.3);
            border-color: rgba(255,255,255,0.08);
            box-shadow: inset 0 2px 10px rgba(0,0,0,0.2);
          }
          .swipe-send-bg {
            position: absolute;
            top: 0; left: 0; bottom: 0; right: 0;
            pointer-events: none;
            border-radius: 28px;
          }
          .swipe-send-text {
            position: absolute;
            width: 100%;
            text-align: center;
            font-size: 13.5px;
            font-weight: 700;
            color: var(--text-secondary);
            pointer-events: none;
            letter-spacing: -0.01em;
            z-index: 1;
          }
          .swipe-send-knob {
            position: relative;
            width: 44px;
            height: 44px;
            border-radius: 22px;
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 15px rgba(37,99,235,0.35);
            cursor: grab;
            z-index: 2;
            touch-action: none;
            flex-shrink: 0;
          }
          .swipe-send-knob:active {
            cursor: grabbing;
          }
          [data-theme="dark"] .swipe-send-knob {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            box-shadow: 0 4px 15px rgba(0,0,0,0.5);
          }
          
          /* Success */
          .mc-success-view {
            background: linear-gradient(135deg, rgba(34,197,94,0.1), rgba(22,163,74,0.03));
            border: 1px solid rgba(34,197,94,0.2);
            border-radius: 24px; padding: 48px 20px;
            display: flex; flex-direction: column; align-items: center; text-align: center;
          }
          .mc-success-icon {
            width: 72px; height: 72px; border-radius: 36px;
            background: linear-gradient(135deg, #d1fae5, #a7f3d0);
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 0 0 8px rgba(22,163,74,0.08); margin-bottom: 20px;
          }
          [data-theme="dark"] .mc-success-icon {
            background: linear-gradient(135deg, #064e3b, #065f46);
          }
          .mc-success-title { font-size: 22px; font-weight: 800; color: var(--text-primary); margin: 0 0 4px; letter-spacing: -0.02em; }
          .mc-success-sub { font-size: 14px; color: var(--text-secondary); margin: 0; line-height: 1.5; max-width: 260px; }

          /* Contact card button — sharp rectangle, black bg, white text */
          .mc-card-chip {
            display: inline-flex; align-items: center; gap: 6px;
            padding: 8px 14px 8px 11px;
            background: #0f0f0f;
            border: none;
            border-radius: 10px;
            color: #ffffff;
            font-size: 12px; font-weight: 700;
            cursor: pointer; outline: none;
            transition: transform 0.15s ease, box-shadow 0.15s ease;
            box-shadow: 0 2px 8px rgba(0,0,0,0.25);
            letter-spacing: 0.01em;
            white-space: nowrap;
          }
          .mc-card-chip:active { transform: scale(0.94); box-shadow: 0 1px 4px rgba(0,0,0,0.2); }
          [data-theme="dark"] .mc-card-chip { background: #1a1a1a; border: 1px solid rgba(255,255,255,0.12); color: #fff; box-shadow: 0 2px 12px rgba(0,0,0,0.5); }
          [data-theme="dark"] .mc-card-chip:active { background: #111; }


          /* ========== CONTACT CARD SHEET — Premium redesign ========== */
          .dsheet-backdrop {
            position: fixed; inset: 0;
            background: rgba(0,0,0,.55);
            backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
            z-index: 10000;
          }
          .dsheet {
            position: fixed; left: 0; right: 0; bottom: 0; z-index: 10001;
            background: var(--bg-secondary); border-radius: 28px 28px 0 0;
            will-change: transform; transform: translateZ(0); backface-visibility: hidden;
            box-shadow: 0 -24px 80px rgba(0,0,0,.2), 0 -1px 0 rgba(255,255,255,.06);
            display: flex; flex-direction: column;
            max-height: 88vh; max-height: 88dvh;
          }
          .dsheet-handle {
            width: 36px; height: 4px;
            background: var(--border-color);
            border-radius: 2px; margin: 12px auto 0; flex-shrink: 0;
          }
          .dsheet-body { flex: 1; overflow-y: auto; display: flex; flex-direction: column; }
          .dsheet-body::-webkit-scrollbar { display: none; }

          /* Card hero banner at top */
          .cc-hero {
            padding: 20px 18px 0;
            display: flex; align-items: center; gap: 14px;
            position: relative;
          }
          .cc-avatar-wrap { position: relative; flex-shrink: 0; }
          .cc-avatar {
            width: 64px; height: 64px; border-radius: 20px;
            background: linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%);
            display: flex; align-items: center; justify-content: center;
            font-size: 22px; font-weight: 900; color: #fff;
            box-shadow: 0 8px 24px rgba(59,130,246,0.35);
            letter-spacing: -1px;
          }
          .cc-avatar-badge {
            position: absolute; bottom: -2px; right: -2px;
            width: 16px; height: 16px; border-radius: 50%;
            background: #22c55e; border: 2px solid var(--bg-secondary);
            box-shadow: 0 0 8px rgba(34,197,94,0.5);
          }
          .cc-hero-info { flex: 1; min-width: 0; }
          .cc-hero-name { font-size: 18px; font-weight: 800; color: var(--text-primary); margin: 0 0 3px; letter-spacing: -0.02em; line-height: 1.2; }
          .cc-hero-role { font-size: 12px; color: var(--text-secondary); margin: 0 0 8px; font-weight: 500; }
          .cc-hero-tags { display: flex; gap: 6px; flex-wrap: wrap; }
          .cc-tag {
            font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 99px;
            text-transform: uppercase; letter-spacing: 0.04em;
          }
          .cc-tag-blue { background: rgba(59,130,246,0.1); color: #3b82f6; border: 1px solid rgba(59,130,246,0.2); }
          .cc-tag-green { background: rgba(34,197,94,0.1); color: #16a34a; border: 1px solid rgba(34,197,94,0.2); }
          .cc-close-btn {
            position: absolute; top: 20px; right: 18px;
            width: 30px; height: 30px; border-radius: 50%;
            background: var(--bg-primary); border: 1px solid var(--border-color);
            display: flex; align-items: center; justify-content: center;
            color: var(--text-secondary); cursor: pointer;
          }
          .cc-close-btn:active { opacity: 0.7; }

          /* Info rows */
          .cc-section { padding: 16px 18px 0; }
          .cc-section-label {
            font-size: 10px; font-weight: 800; color: var(--text-muted);
            text-transform: uppercase; letter-spacing: .1em; margin: 0 0 10px;
          }
          .cc-info-row {
            display: flex; align-items: center; gap: 12px;
            background: var(--bg-primary); padding: 11px 12px;
            border-radius: 14px; border: 1px solid var(--border-color);
            margin-bottom: 8px;
          }
          .cc-info-icon {
            width: 34px; height: 34px; border-radius: 10px;
            background: rgba(59,130,246,0.1); color: #3b82f6;
            display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          }
          [data-theme="dark"] .cc-info-icon { background: rgba(59,130,246,0.15); }
          .cc-info-content { flex: 1; min-width: 0; }
          .cc-info-label { font-size: 9.5px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: .06em; margin: 0 0 1px; }
          .cc-info-value { font-size: 13.5px; font-weight: 600; color: var(--text-primary); margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          .cc-copy-btn {
            width: 30px; height: 30px; border-radius: 8px;
            background: var(--bg-secondary); border: 1px solid var(--border-color);
            display: flex; align-items: center; justify-content: center;
            color: var(--text-secondary); cursor: pointer; flex-shrink: 0;
            transition: all 0.15s;
          }
          .cc-copy-btn:active { transform: scale(0.9); }

          /* Social links */
          .cc-social-row { display: flex; gap: 10px; }
          .cc-social-btn {
            flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
            padding: 12px 10px; border-radius: 14px;
            background: var(--bg-primary); border: 1px solid var(--border-color);
            font-size: 12.5px; font-weight: 600; color: var(--text-primary);
            text-decoration: none; cursor: pointer; outline: none;
            transition: all 0.15s;
          }
          .cc-social-btn:active { transform: scale(0.96); }
          .cc-social-btn.github:active { background: rgba(255,255,255,0.05); }
          .cc-social-btn.linkedin:active { background: rgba(10,102,194,0.1); }
          .cc-social-btn.resume:active { background: rgba(59,130,246,0.08); }

          /* Bottom action buttons */
          .cc-actions { padding: 14px 18px 32px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
          .cc-btn {
            height: 48px; border-radius: 16px;
            display: flex; align-items: center; justify-content: center;
            gap: 7px; font-size: 13.5px; font-weight: 700;
            outline: none; border: none; cursor: pointer;
            transition: all 0.15s; letter-spacing: -0.01em;
          }
          .cc-btn:active { transform: scale(0.96); }
          .cc-btn-sec {
            background: var(--bg-primary); color: var(--text-primary);
            border: 1px solid var(--border-color);
          }
          .cc-btn-pri {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: #fff;
            box-shadow: 0 4px 16px rgba(37,99,235,0.35);
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
          /* ── MOBILE — Redesigned Premium UI ── */
          <motion.div className="mc-outer-container"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header row — chip sits inline next to the title */}
            <div className="mc-header-row">
              <div>
                <h1 className="mc-page-title">Get in Touch</h1>
                <p className="mc-page-sub">Have a question or want to work together?</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                {/* Compact chip — no longer a full-width button */}
                <button className="mc-card-chip" onClick={() => setIsContactCardOpen(true)}>
                  <ContactIcon size={12} />
                  Contact card
                </button>
              </div>
            </div>

            {/* Form / Success - No Glass Cards to save vertical space */}
            <AnimatePresence mode="wait" initial={false}>
              {status === "sent" ? (
                <motion.div key="success"
                  className="mc-success-view"
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  <motion.div className="mc-success-icon"
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <Check size={32} color="#16a34a" strokeWidth={2.5} />
                  </motion.div>
                  <p className="mc-success-title">Message sent!</p>
                  <p className="mc-success-sub">Thanks for reaching out! I'll get back to you within a day.</p>
                </motion.div>
              ) : (
                <motion.div key="form" className="mc-form-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <h2 className="mc-form-title"><Send size={18} color="var(--primary-blue)" /> Send a Message</h2>
                  
                  {/* Honeypot field - Invisible to humans, bots will fill it */}
                  <input type="text" name="_catch" style={{ display: 'none' }} value={form._catch} onChange={handleChange} tabIndex="-1" autoComplete="off" />

                  <div className="mc-input-group">
                    <input name="name" className={`mc-input ${touched.name && errors.name ? 'has-error' : ''}`} placeholder=" " value={form.name} onChange={handleChange} onBlur={handleBlur} />
                    <label className="mc-label">Full Name</label>
                    {touched.name && errors.name && <span className="mc-error-msg">{errors.name}</span>}
                  </div>

                  <div className="mc-input-group">
                    <input name="email" type="email" className={`mc-input ${touched.email && errors.email ? 'has-error' : ''}`} placeholder=" " value={form.email} onChange={handleChange} onBlur={handleBlur} />
                    <label className="mc-label">Email Address</label>
                    {touched.email && errors.email && <span className="mc-error-msg">{errors.email}</span>}
                  </div>

                  <div className="mc-input-group">
                    <textarea name="message" rows={3} className={`mc-input ${touched.message && errors.message ? 'has-error' : ''}`} placeholder=" " value={form.message} onChange={handleChange} onBlur={handleBlur} style={{ resize: 'none' }} />
                    <label className="mc-label">Your Message</label>
                    {touched.message && errors.message && <span className="mc-error-msg">{errors.message}</span>}
                  </div>

                  <SwipeToSend 
                    onSend={handleSubmit} 
                    status={status} 
                    isFormValid={form.name.trim() !== "" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) && form.message.trim() !== ""} 
                    triggerValidation={() => {
                      const newErrors = {};
                      if (!form.name.trim()) newErrors.name = "Name is required.";
                      if (!form.email.trim()) newErrors.email = "Email is required.";
                      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Please enter a valid email.";
                      if (!form.message.trim()) newErrors.message = "Message is required.";
                      setTouched({ name: true, email: true, message: true });
                      setErrors(prev => ({ ...prev, ...newErrors }));
                    }} 
                  />
                </motion.div>
              )}
            </AnimatePresence>
            {/* Swipe Hint */}
            {isMobile && (
              <motion.div
                className="swipe-hint"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <div className="swipe-hint-icon">
                  <motion.div animate={{ x: [-3, 2, -3] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}>
                    <ChevronLeft size={16} />
                  </motion.div>
                  <motion.div animate={{ x: [3, -2, 3] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}>
                    <ChevronRight size={16} />
                  </motion.div>
                </div>
                <span>Swipe or use nav to explore</span>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      {/* ── CONTACT CARD SHEET ── */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isContactCardOpen && (
            <div style={{ position: 'relative', zIndex: 9999 }}>
              <motion.div
                className="dsheet-backdrop"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsContactCardOpen(false)}
              />
              <motion.div
                className="dsheet"
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 32, stiffness: 350, mass: 0.9 }}
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: 0.4 }}
                onDragEnd={(_, info) => { if (info.offset.y > 120 || info.velocity.y > 600) setIsContactCardOpen(false); }}
              >
                <div className="dsheet-handle" />

                <div className="dsheet-body">

                  {/* ── Hero banner ── */}
                  <div className="cc-hero">
                    <div className="cc-avatar-wrap">
                      <div className="cc-avatar">TS</div>
                      <div className="cc-avatar-badge" />
                    </div>
                    <div className="cc-hero-info">
                      <p className="cc-hero-name">Thota Sujith Reddy</p>
                      <p className="cc-hero-role">Software Engineer</p>
                      <div className="cc-hero-tags">
                        <span className="cc-tag cc-tag-green">Open to work</span>
                        <span className="cc-tag cc-tag-blue">Full Stack</span>
                      </div>
                    </div>
                    <button className="cc-close-btn" onClick={() => setIsContactCardOpen(false)}>
                      <X size={14} />
                    </button>
                  </div>

                  {/* ── Contact Info ── */}
                  <div className="cc-section" style={{ marginTop: 18 }}>
                    <p className="cc-section-label">Contact</p>

                    <div className="cc-info-row">
                      <div className="cc-info-icon"><Mail size={15} /></div>
                      <div className="cc-info-content">
                        <p className="cc-info-label">Email</p>
                        <p className="cc-info-value">{email}</p>
                      </div>
                      <button className="cc-copy-btn" onClick={handleCopyEmail}>
                        {emailCopied ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                      </button>
                    </div>

                    <div className="cc-info-row">
                      <div className="cc-info-icon"><MapPin size={15} /></div>
                      <div className="cc-info-content">
                        <p className="cc-info-label">Location</p>
                        <p className="cc-info-value">India · Open to remote</p>
                      </div>
                    </div>

                    <div className="cc-info-row">
                      <div className="cc-info-icon"><Clock size={15} /></div>
                      <div className="cc-info-content">
                        <p className="cc-info-label">Response time</p>
                        <p className="cc-info-value">Within a day</p>
                      </div>
                    </div>
                  </div>

                  {/* ── Social links ── */}
                  <div className="cc-section" style={{ marginTop: 14 }}>
                    <p className="cc-section-label">Connect</p>
                    <div className="cc-social-row">
                      <a href="https://github.com/sujith1546" target="_blank" rel="noreferrer" className="cc-social-btn github">
                        <FaGithub size={16} />
                        GitHub
                      </a>
                      <a href="https://www.linkedin.com/in/sujith-reddy-thota/" target="_blank" rel="noreferrer" className="cc-social-btn linkedin">
                        <FaLinkedin size={16} style={{ color: '#0a66c2' }} />
                        LinkedIn
                      </a>
                      <button className="cc-social-btn resume" style={{ outline: 'none' }}
                        onClick={() => { setIsContactCardOpen(false); window.dispatchEvent(new CustomEvent('open-resume')); }}>
                        <FileText size={16} style={{ color: '#3b82f6' }} />
                        Resume
                      </button>
                    </div>
                  </div>

                  {/* ── Action buttons ── */}
                  <div className="cc-actions">
                    <button className="cc-btn cc-btn-sec" onClick={handleCopyEmail}>
                      {emailCopied ? <Check size={15} color="#10b981" /> : <Copy size={15} />}
                      {emailCopied ? 'Copied!' : 'Copy email'}
                    </button>
                    <button className="cc-btn cc-btn-pri" onClick={handleSaveContact}>
                      Save contact
                    </button>
                  </div>

                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </ScrollReveal>
  );
}
