import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, Users, CreditCard, MessageSquare, ArrowLeft, Send, Check, Loader2
} from 'lucide-react';
import { ScrollReveal } from '../components';
import EmailDomainSuggest from '../components/ui/EmailDomainSuggest';
import CharacterCounter from '../components/ui/CharacterCounter';

const DESKS = [
  {
    id: 'rec',
    tag: 'REC',
    title: 'Hiring / Recruiting',
    desc: "You've got a role and want to know if I'm a fit.",
    icon: Briefcase,
    color: 'rgba(59, 130, 246, 0.1)',
    iconColor: '#3b82f6',
    placeholder: 'Tell me about the role, team, location, or tech stack...'
  },
  {
    id: 'col',
    tag: 'COL',
    title: 'Collaboration',
    desc: 'You want to build or ship something together.',
    icon: Users,
    color: 'rgba(16, 185, 129, 0.1)',
    iconColor: '#10b981',
    placeholder: 'What are we building? Share your ideas, repo, or vision...'
  },
  {
    id: 'frl',
    tag: 'FRL',
    title: 'Freelance / Client work',
    desc: 'You have a project and a budget to talk through.',
    icon: CreditCard,
    color: 'rgba(139, 92, 246, 0.1)',
    iconColor: '#8b5cf6',
    placeholder: 'Describe your project, desired timeline, and scope...'
  },
  {
    id: 'gen',
    tag: 'GEN',
    title: 'Just saying hi',
    desc: 'Question, feedback, or something else entirely.',
    icon: MessageSquare,
    color: 'rgba(6, 182, 212, 0.1)',
    iconColor: '#06b6d4',
    placeholder: 'Say hello or ask anything!'
  }
];

function getSessionToken() {
  let token = sessionStorage.getItem('x-portfolio-session');
  if (!token || token.length < 16) {
    token = 'sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    sessionStorage.setItem('x-portfolio-session', token);
  }
  return token;
}

export default function Contact() {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 900);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 900);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [selectedDesk, setSelectedDesk] = useState(null);
  const [activeMobileDesk, setActiveMobileDesk] = useState('gen');
  const [committed, setCommitted] = useState(false); // false | true | "closing"
  const [form, setForm] = useState({
    name: '',
    email: '',
    message: '',
    company: '',
    _catch: ''
  });
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [submitError, setSubmitError] = useState('');

  const cardRefs = useRef({});
  const panelRef = useRef(null);
  const rectRef = useRef(null);

  const activeDeskKey = isMobile ? activeMobileDesk : selectedDesk;
  const activeDeskObj = DESKS.find(d => d.id === activeDeskKey) || DESKS[3];

  // ── FLIP morph: card → panel (Desktop Only) ──
  const playMorphIn = useCallback(() => {
    if (isMobile) return;
    const panel = panelRef.current;
    if (!panel || !rectRef.current) return;
    const end = panel.getBoundingClientRect();
    const start = rectRef.current;
    const dx = start.left - end.left;
    const dy = start.top - end.top;
    const sx = start.width / end.width;
    const sy = Math.max(start.height / end.height, 0.15);
    panel.style.transformOrigin = 'top left';
    panel.style.transition = 'none';
    panel.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
    void panel.offsetHeight; // force reflow
    requestAnimationFrame(() => {
      panel.style.transition = 'transform 0.48s cubic-bezier(0.22, 1, 0.36, 1)';
      panel.style.transform = 'translate(0px, 0px) scale(1, 1)';
    });
  }, [isMobile]);

  const playMorphOut = useCallback((onDone) => {
    if (isMobile) { onDone(); return; }
    const panel = panelRef.current;
    if (!panel || !rectRef.current) { onDone(); return; }
    const end = panel.getBoundingClientRect();
    const start = rectRef.current;
    const dx = start.left - end.left;
    const dy = start.top - end.top;
    const sx = start.width / end.width;
    const sy = Math.max(start.height / end.height, 0.15);
    panel.style.transformOrigin = 'top left';
    panel.style.transition = 'transform 0.38s cubic-bezier(0.4, 0, 0.2, 1)';
    panel.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
    setTimeout(onDone, 380);
  }, [isMobile]);

  useLayoutEffect(() => {
    if (!isMobile && committed === true) playMorphIn();
  }, [committed, selectedDesk, playMorphIn, isMobile]);

  const chooseDesk = (id) => {
    const el = cardRefs.current[id];
    if (el) rectRef.current = el.getBoundingClientRect();
    setSelectedDesk(id);
    setForm({ name: '', email: '', message: '', company: '', _catch: '' });
    setTouched({});
    setErrors({});
    setSubmitError('');
    setStatus('idle');
    setCommitted(true);
  };

  const goBack = () => {
    setCommitted('closing');
    playMorphOut(() => {
      setCommitted(false);
      setSelectedDesk(null);
      setStatus('idle');
    });
  };

  const validateField = (name, value) => {
    let err = '';
    if (name === 'name' && !value.trim()) err = 'Full name is required';
    if (name === 'email') {
      if (!value.trim()) err = 'Email address is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) err = 'Please enter a valid email address';
    }
    if (name === 'message') {
      if (!value.trim()) err = 'Message is required';
      else if (value.trim().length < 10) err = 'Message must be at least 10 characters';
    }
    return err;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (form._catch) {
      setStatus('sent');
      return;
    }
    const errName = validateField('name', form.name);
    const errEmail = validateField('email', form.email);
    const errMessage = validateField('message', form.message);
    setTouched({ name: true, email: true, message: true });
    setErrors({ name: errName, email: errEmail, message: errMessage });
    if (errName || errEmail || errMessage) return;
    setStatus('sending');
    setSubmitError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-portfolio-session': getSessionToken()
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          message: form.message.trim(),
          inquiry_type: activeDeskObj.title,
          company: form.company.trim()
        })
      });
      if (!res.ok) throw new Error('Failed to deliver message. Please try again.');
      setStatus('sent');
    } catch (err) {
      console.error('Submission error:', err);
      setSubmitError(err.message || 'Network error occurred');
      setStatus('idle');
    }
  };

  const renderContactFormFields = () => (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
      <input type="text" name="_catch" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', opacity: 0, pointerEvents: 'none' }} value={form._catch} onChange={handleChange} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Your name *</label>
        <input name="name" value={form.name} onChange={handleChange} onBlur={handleBlur} placeholder="Thota Sujith Reddy" style={{ backgroundColor: 'var(--bg-primary)', border: touched.name && errors.name ? '1px solid #ef4444' : '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', color: 'var(--text-primary)', outline: 'none' }} />
        {touched.name && errors.name && <span style={{ fontSize: '11px', color: '#ef4444' }}>{errors.name}</span>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Your email *</label>
        <EmailDomainSuggest name="email" value={form.email} onChange={handleChange} onBlur={handleBlur} placeholder="sujithreddy1546@gmail.com" className={touched.email && errors.email ? 'has-error' : ''} style={{ backgroundColor: 'var(--bg-primary)', border: touched.email && errors.email ? '1px solid #ef4444' : '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', color: 'var(--text-primary)', outline: 'none', width: '100%', boxSizing: 'border-box' }} />
        {touched.email && errors.email && <span style={{ fontSize: '11px', color: '#ef4444' }}>{errors.email}</span>}
      </div>
      {(activeDeskObj.id === 'rec' || activeDeskObj.id === 'frl') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Company / Organization (Optional)</label>
          <input name="company" value={form.company} onChange={handleChange} placeholder="e.g. Acme Corp" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', color: 'var(--text-primary)', outline: 'none' }} />
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Message *</label>
          <CharacterCounter currentLength={form.message.length} maxLength={500} />
        </div>
        <textarea name="message" rows={4} maxLength={500} value={form.message} onChange={handleChange} onBlur={handleBlur} placeholder={activeDeskObj.placeholder} style={{ backgroundColor: 'var(--bg-primary)', border: touched.message && errors.message ? '1px solid #ef4444' : '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', color: 'var(--text-primary)', outline: 'none', resize: 'none' }} />
        {touched.message && errors.message && <span style={{ fontSize: '11px', color: '#ef4444' }}>{errors.message}</span>}
      </div>
      {submitError && (
        <div style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#ef4444', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>{submitError}</span>
          <button type="button" onClick={handleSubmit} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>Retry</button>
        </div>
      )}
      <button type="submit" disabled={status === 'sending'} style={{ height: '42px', borderRadius: '10px', backgroundColor: '#0f172a', color: '#ffffff', fontSize: '13.5px', fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '4px', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.25)' }}>
        {status === 'sending' ? (<><Loader2 size={16} className="spin" style={{ animation: 'spin 1s linear infinite' }} /> Sending...</>) : (<><Send size={15} /> Send message</>)}
      </button>
    </form>
  );

  return (
    <ScrollReveal>
      <div style={{ maxWidth: '780px', margin: '0 auto', padding: isMobile ? '12px 12px 100px' : '8px 16px 32px', minHeight: '75vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', marginBottom: isMobile ? '18px' : '26px' }}>
          <p style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.22em', textTransform: 'uppercase', margin: '0 0 6px' }}>GET IN TOUCH</p>
          <h1 style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px', letterSpacing: '-0.025em', lineHeight: 1.2 }}>Let's route this to the right desk.</h1>
          <p style={{ fontSize: isMobile ? '12px' : '13px', color: 'var(--text-secondary)', margin: '0 auto', maxWidth: '500px', lineHeight: 1.55 }}>Pick what best describes why you're reaching out to send a message directly.</p>
        </div>

        {isMobile ? (
          <div style={{ maxWidth: '480px', margin: '0 auto', width: '100%' }}>
            {selectedDesk === null ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {DESKS.map((desk) => {
                  const IconComp = desk.icon;
                  return (
                    <motion.div
                      key={desk.id}
                      onClick={() => chooseDesk(desk.id)}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '14px',
                        padding: '16px 14px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        minHeight: '95px',
                        boxShadow: '0 3px 12px rgba(0, 0, 0, 0.025)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: desk.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: desk.iconColor }}>
                          <IconComp size={15} />
                        </div>
                        <span style={{ fontSize: '9.5px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>{desk.tag}</span>
                      </div>
                      <div>
                        <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 3px', letterSpacing: '-0.01em' }}>{desk.title}</h3>
                        <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>{desk.desc}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div>
                <button
                  type="button"
                  onClick={goBack}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', marginBottom: '12px', padding: '4px 6px', marginLeft: '-4px', borderRadius: '6px' }}
                >
                  <ArrowLeft size={14} /> Choose different option
                </button>
                <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '18px', padding: '18px 16px', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: activeDeskObj.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: activeDeskObj.iconColor }}>
                      {React.createElement(activeDeskObj.icon, { size: 15 })}
                    </div>
                    <div>
                      <span style={{ fontSize: '9.5px', fontWeight: 800, color: activeDeskObj.iconColor, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{activeDeskObj.tag}</span>
                      <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{activeDeskObj.title}</h2>
                    </div>
                  </div>
                  {status === 'sent' ? (
                    <div style={{ textAlign: 'center', padding: '20px 8px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}><Check size={26} strokeWidth={2.5} /></div>
                      <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>Message delivered!</h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 16px', lineHeight: 1.5 }}>Thank you for reaching out regarding <strong>{activeDeskObj.title}</strong>. I'll get back to you within 24 hours.</p>
                      <button type="button" onClick={() => { setForm({ name: '', email: '', message: '', company: '', _catch: '' }); setStatus('idle'); setTouched({}); setErrors({}); }} style={{ padding: '8px 18px', borderRadius: '999px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Send another message</button>
                    </div>
                  ) : renderContactFormFields()}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            <div style={{ opacity: committed === true ? 0 : 1, pointerEvents: committed === true ? 'none' : 'auto', transition: 'opacity 0.22s ease' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px', maxWidth: '720px', margin: '0 auto' }}>
                {DESKS.map((desk) => {
                  const IconComp = desk.icon;
                  return (
                    <motion.div key={desk.id} ref={(el) => (cardRefs.current[desk.id] = el)} onClick={() => chooseDesk(desk.id)} whileHover={{ scale: 1.015, y: -2 }} whileTap={{ scale: 0.985 }} style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '18px 16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '105px', position: 'relative', transition: 'border-color 0.2s ease, box-shadow 0.2s ease', boxShadow: '0 3px 12px rgba(0, 0, 0, 0.025)' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary-blue)'; e.currentTarget.style.boxShadow = '0 6px 20px color-mix(in srgb, var(--primary-blue) 12%, transparent)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.boxShadow = '0 3px 12px rgba(0, 0, 0, 0.025)'; }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: desk.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: desk.iconColor }}><IconComp size={16} /></div>
                        <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>{desk.tag}</span>
                      </div>
                      <div>
                        <h3 style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 3px', letterSpacing: '-0.01em' }}>{desk.title}</h3>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>{desk.desc}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
            {selectedDesk !== null && (
              <div ref={panelRef} style={{ position: 'absolute', top: 0, left: '50%', marginLeft: '-270px', width: '100%', maxWidth: '540px', zIndex: 10, willChange: 'transform' }}>
                <div style={{ opacity: committed === true ? 1 : 0, transition: 'opacity 0.28s ease 0.18s' }}>
                  <button type="button" onClick={goBack} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', marginBottom: '16px', padding: '4px 8px', marginLeft: '-8px', borderRadius: '6px' }}><ArrowLeft size={15} /> Choose different option</button>
                  <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '22px 20px', boxShadow: '0 12px 36px rgba(0, 0, 0, 0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid var(--border-color)' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: activeDeskObj.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: activeDeskObj.iconColor }}>{React.createElement(activeDeskObj.icon, { size: 16 })}</div>
                      <div>
                        <span style={{ fontSize: '10px', fontWeight: 800, color: activeDeskObj.iconColor, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{activeDeskObj.tag}</span>
                        <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{activeDeskObj.title}</h2>
                      </div>
                    </div>
                    {status === 'sent' ? (
                      <div style={{ textAlign: 'center', padding: '24px 12px' }}>
                        <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}><Check size={28} strokeWidth={2.5} /></div>
                        <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>Message delivered!</h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 16px', lineHeight: 1.5 }}>Thank you for reaching out regarding <strong>{activeDeskObj.title}</strong>. I'll get back to you within 24 hours.</p>
                        <button type="button" onClick={() => { setForm({ name: '', email: '', message: '', company: '', _catch: '' }); setStatus('idle'); setTouched({}); setErrors({}); }} style={{ padding: '8px 18px', borderRadius: '999px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Send another message</button>
                      </div>
                    ) : renderContactFormFields()}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ScrollReveal>
  );
}
