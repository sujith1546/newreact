import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, MapPin, Mail, School, Check, Copy, FileText,
  Briefcase, Award, Brain, Code2, Star, Zap, ChevronRight, ChevronDown
} from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

/* ── Animated skill bar ──────────────────────────────────────────────────── */
function SkillBar({ label, pct, color, active, delay = 0 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{
        fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)',
        width: 64, flexShrink: 0, letterSpacing: '-0.01em'
      }}>{label}</span>
      <div style={{
        flex: 1, height: 5, borderRadius: 99,
        background: 'var(--border-color)', overflow: 'hidden'
      }}>
        <motion.div
          style={{ height: '100%', borderRadius: 99, background: color }}
          initial={{ width: 0 }}
          animate={{ width: active ? `${pct}%` : 0 }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay }}
        />
      </div>
      <span style={{
        fontSize: 11, fontWeight: 800, color: 'var(--text-primary)',
        width: 28, textAlign: 'right'
      }}>{pct}<span style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-muted)' }}>%</span></span>
    </div>
  );
}

/* ── Stat chip ───────────────────────────────────────────────────────────── */
function Stat({ value, label, color }) {
  return (
    <div style={{ textAlign: 'center', flex: 1 }}>
      <p style={{
        margin: 0, fontSize: 17, fontWeight: 900, color,
        letterSpacing: '-0.03em', lineHeight: 1
      }}>{value}</p>
      <p style={{
        margin: '3px 0 0', fontSize: 9.5, fontWeight: 700,
        color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em'
      }}>{label}</p>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────────── */
export default function AdvancedProfile({ isOpen, onClose, playSound, triggerEvent, handleExploreClick }) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [skillsActive, setSkillsActive] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isScrollable, setIsScrollable] = useState(false);
  const scrollAreaRef = React.useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (isOpen) {
      setHasScrolled(false);
      setIsScrollable(false);
      const t = setTimeout(() => {
        setSkillsActive(true);
        if (scrollAreaRef.current) {
          const { scrollHeight, clientHeight } = scrollAreaRef.current;
          setIsScrollable(scrollHeight > clientHeight + 5);
        }
      }, 500);
      return () => clearTimeout(t);
    } else {
      setSkillsActive(false);
    }
  }, [isOpen]);

  const handleScroll = (e) => {
    if (e.target.scrollTop > 10 && !hasScrolled) {
      setHasScrolled(true);
    }
  };

  const handleCopyEmail = () => {
    if (playSound) playSound();
    navigator.clipboard.writeText('sujithreddy1546@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const skills = [
    { label: 'ML / AI',   pct: 92, color: '#8b5cf6', delay: 0.05 },
    { label: 'Python',    pct: 90, color: '#3b82f6', delay: 0.12 },
    { label: 'Data Sci',  pct: 88, color: '#10b981', delay: 0.19 },
    { label: 'React',     pct: 85, color: '#06b6d4', delay: 0.26 },
    { label: 'FastAPI',   pct: 80, color: '#f59e0b', delay: 0.33 },
  ];

  const explores = [
    { label: 'Experience',    Icon: Briefcase, action: () => handleExploreClick('experience')      },
    { label: 'Certs',         Icon: Award,     action: () => handleExploreClick('certifications')  },
    { label: 'GitHub',        Icon: FaGithub,  action: () => handleExploreClick('github')          },
    { label: 'Resume',        Icon: FileText,  action: () => { if (playSound) playSound(); onClose(); triggerEvent('open-resume'); } },
  ];

  const content = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop ─────────────────────────────────────────────────── */}
          <motion.div
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
              zIndex: 10002
            }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* ── Left drawer panel ─────────────────────────────────────────── */}
          <motion.aside
            role="dialog" aria-modal="true" aria-label="Profile"
            style={{
              position: 'fixed',
              top: 0, left: 0, bottom: 0,
              width: '82vw', maxWidth: 300,
              zIndex: 10003,
              display: 'flex', flexDirection: 'column',
              background: 'var(--bg-secondary)',
              boxShadow: '12px 0 60px rgba(0,0,0,0.18), 1px 0 0 var(--border-color)',
              overflowY: 'auto',
            }}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320, mass: 0.85 }}
          >

            {/* ── Top gradient hero ───────────────────────────────────────── */}
            <div style={{
              position: 'relative',
              background: theme === 'dark'
                ? 'linear-gradient(160deg, rgba(59,130,246,0.2) 0%, rgba(124,58,237,0.14) 60%, transparent 100%)'
                : 'linear-gradient(160deg, rgba(59,130,246,0.12) 0%, rgba(124,58,237,0.08) 60%, transparent 100%)',
              padding: '52px 20px 24px',
              flexShrink: 0,
            }}>
              {/* Ambient glow orbs */}
              <div style={{
                position: 'absolute', top: -30, right: -20, width: 120, height: 120,
                borderRadius: '50%', background: 'rgba(59,130,246,0.18)',
                filter: 'blur(40px)', pointerEvents: 'none'
              }} />
              <div style={{
                position: 'absolute', bottom: 0, left: 10, width: 80, height: 80,
                borderRadius: '50%', background: 'rgba(124,58,237,0.12)',
                filter: 'blur(28px)', pointerEvents: 'none'
              }} />

              {/* Close button */}
              <button onClick={onClose} style={{
                position: 'absolute', top: 16, right: 16,
                width: 30, height: 30, borderRadius: '50%',
                background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--text-secondary)', zIndex: 2
              }}>
                <X size={14} />
              </button>

              {/* Avatar */}
              <div style={{
                width: 80, height: 80, borderRadius: 22,
                overflow: 'hidden', marginBottom: 14,
                border: '2.5px solid rgba(59,130,246,0.45)',
                boxShadow: '0 8px 32px rgba(59,130,246,0.25), 0 0 0 4px rgba(59,130,246,0.08)',
                position: 'relative', zIndex: 1
              }}>
                <img src="/profile_photo.png" alt="Sujith Thota"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              {/* Name + role */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <p style={{
                  margin: 0, fontSize: 20, fontWeight: 900,
                  color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1
                }}>Sujith Thota</p>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', background: '#22c55e',
                  boxShadow: '0 0 8px rgba(34,197,94,0.7)', flexShrink: 0
                }} />
              </div>
              <p style={{
                margin: '0 0 14px', fontSize: 12.5, color: 'var(--text-secondary)', fontWeight: 500
              }}>Data Science · Full Stack Dev</p>

              {/* Tags */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['Open to work', 'VIT · 8.7 CGPA'].map(tag => (
                  <span key={tag} style={{
                    fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 99,
                    background: 'rgba(59,130,246,0.1)', color: '#3b82f6',
                    border: '1px solid rgba(59,130,246,0.22)', letterSpacing: '0.03em'
                  }}>{tag}</span>
                ))}
              </div>
            </div>

            {/* ── Stats strip ─────────────────────────────────────────────── */}
            <div style={{
              display: 'flex', alignItems: 'center',
              padding: '16px 20px',
              borderTop: '1px solid var(--border-color)',
              borderBottom: '1px solid var(--border-color)',
              gap: 4, background: 'var(--bg-primary)',
              flexShrink: 0
            }}>
              <Stat value="8.7"  label="CGPA"    color="#f59e0b" />
              <div style={{ width: 1, height: 28, background: 'var(--border-color)' }} />
              <Stat value="15+"  label="Certs"   color="#8b5cf6" />
              <div style={{ width: 1, height: 28, background: 'var(--border-color)' }} />
              <Stat value="5+"   label="Projects" color="#3b82f6" />
              <div style={{ width: 1, height: 28, background: 'var(--border-color)' }} />
              <Stat value="200+" label="Commits"  color="#10b981" />
            </div>

            {/* ── Scrollable body ──────────────────────────────────────────── */}
            <div 
              ref={scrollAreaRef}
              onScroll={handleScroll}
              style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0 }}
            >

              {/* Skills */}
              <div style={{ padding: '20px 20px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                  <Zap size={13} color="var(--primary-blue)" />
                  <p style={{
                    margin: 0, fontSize: 10.5, fontWeight: 800,
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                    color: 'var(--text-secondary)'
                  }}>Technical Skills</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                  {skills.map(s => (
                    <SkillBar key={s.label} {...s} active={skillsActive} />
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: 'var(--border-color)', margin: '20px 0 0' }} />

              {/* Details */}
              <div style={{ padding: '16px 20px 0' }}>
                <p style={{
                  margin: '0 0 12px', fontSize: 10.5, fontWeight: 800,
                  textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)'
                }}>Details</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { Icon: School,  text: 'B.Tech CSE (Data Science), VIT' },
                    { Icon: MapPin,  text: 'Vellore, India · Open to remote' },
                  ].map(({ Icon, text }) => (
                    <div key={text} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 8,
                        background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1
                      }}>
                        <Icon size={13} color="var(--text-muted)" />
                      </div>
                      <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', fontWeight: 500, lineHeight: 1.45 }}>
                        {text}
                      </span>
                    </div>
                  ))}

                  {/* Email row */}
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      <Mail size={13} color="var(--text-muted)" />
                    </div>
                    <span style={{
                      fontSize: 12, color: 'var(--primary-blue)', fontWeight: 600,
                      flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>sujithreddy1546@gmail.com</span>
                    <button onClick={handleCopyEmail} style={{
                      width: 26, height: 26, borderRadius: 7, cursor: 'pointer',
                      background: copiedEmail ? 'rgba(16,185,129,0.1)' : 'var(--bg-primary)',
                      border: `1px solid ${copiedEmail ? 'rgba(16,185,129,0.3)' : 'var(--border-color)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, transition: 'all 0.2s'
                    }}>
                      {copiedEmail
                        ? <Check size={11} color="#10b981" />
                        : <Copy size={11} color="var(--text-secondary)" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: 'var(--border-color)', margin: '20px 0 0' }} />

              {/* Social */}
              <div style={{ padding: '16px 20px 0' }}>
                <p style={{
                  margin: '0 0 10px', fontSize: 10.5, fontWeight: 800,
                  textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)'
                }}>Connect</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { href: 'https://github.com/sujith1546',                        Icon: FaGithub,  label: 'GitHub',   sub: '@sujith1546', color: 'var(--text-primary)' },
                    { href: 'https://www.linkedin.com/in/sujith-reddy-thota/',      Icon: FaLinkedin,label: 'LinkedIn',  sub: 'Sujith Reddy Thota', color: '#0a66c2' },
                  ].map(({ href, Icon, label, sub, color }) => (
                    <a key={label} href={href} target="_blank" rel="noreferrer" style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                      background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
                      borderRadius: 13, textDecoration: 'none'
                    }}>
                      <Icon size={18} style={{ color, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{label}</p>
                        <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub}</p>
                      </div>
                      <ChevronRight size={14} color="var(--text-muted)" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: 'var(--border-color)', margin: '20px 0 0' }} />

              {/* Explore */}
              <div style={{ padding: '16px 20px 0' }}>
                <p style={{
                  margin: '0 0 10px', fontSize: 10.5, fontWeight: 800,
                  textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)'
                }}>Explore</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {explores.map(({ label, Icon, action }) => (
                    <button key={label} onClick={action} style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12, padding: '16px 14px',
                      background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
                      borderRadius: 16, cursor: 'pointer', outline: 'none', textAlign: 'left',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.02)', transition: 'transform 0.1s ease-in-out'
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 12,
                        background: theme === 'dark' ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.1)', 
                        border: theme === 'dark' ? '1px solid rgba(59,130,246,0.2)' : 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <Icon size={18} color="#3b82f6" />
                      </div>
                      <span style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bottom CTAs */}
              <div style={{ padding: '16px 20px 36px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button
                  onClick={() => { if (playSound) playSound(); onClose(); triggerEvent('open-resume'); }}
                  style={{
                    height: 46, borderRadius: 13, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: 6, fontSize: 13, fontWeight: 700,
                    cursor: 'pointer', outline: 'none', letterSpacing: '-0.01em',
                    background: 'var(--bg-primary)', color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)'
                  }}>
                  <FileText size={14} /> Resume
                </button>
                <button
                  onClick={() => {
                    if (playSound) playSound();
                    onClose();
                    window.dispatchEvent(new CustomEvent('navigate-section', { detail: { section: 'contact' } }));
                  }}
                  style={{
                    height: 46, borderRadius: 13, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: 6, fontSize: 13, fontWeight: 700,
                    cursor: 'pointer', outline: 'none', letterSpacing: '-0.01em',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: '#fff', border: 'none',
                    boxShadow: '0 4px 16px rgba(37,99,235,0.35)'
                  }}>
                  <Mail size={14} /> Hire Me
                </button>
              </div>

            </div>

            {/* Scroll Hint */}
            <AnimatePresence>
              {isScrollable && !hasScrolled && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    height: '80px',
                    background: 'linear-gradient(to top, var(--bg-secondary) 30%, transparent)',
                    display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
                    paddingBottom: '16px', pointerEvents: 'none', zIndex: 10
                  }}
                >
                  <motion.div
                    animate={{ y: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-secondary)' }}
                  >
                    <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '2px' }}>Scroll</span>
                    <ChevronDown size={14} />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : null;
}
