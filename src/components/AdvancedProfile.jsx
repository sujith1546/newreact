import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, MapPin, Mail, School, Check, Copy, FileText,
  Briefcase, Award, ChevronDown, Zap, Star, Code2, Brain
} from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

// ── Skill bar component ───────────────────────────────────────────────────────
function SkillBar({ label, pct, color, active }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', width: 68, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 6, borderRadius: 99, background: 'var(--border-color)', overflow: 'hidden' }}>
        <motion.div
          style={{ height: '100%', borderRadius: 99, background: color || 'var(--primary-blue)' }}
          initial={{ width: 0 }}
          animate={{ width: active ? `${pct}%` : 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', width: 30, textAlign: 'right' }}>{pct}%</span>
    </div>
  );
}

// ── Stat tile ─────────────────────────────────────────────────────────────────
function StatTile({ value, label, icon: Icon, accent }) {
  return (
    <div style={{
      flex: 1, background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
      borderRadius: 16, padding: '14px 10px', textAlign: 'center', display: 'flex',
      flexDirection: 'column', alignItems: 'center', gap: 6
    }}>
      <div style={{ width: 32, height: 32, borderRadius: 10, background: `${accent}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={16} color={accent} />
      </div>
      <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</p>
      <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AdvancedProfile({ isOpen, onClose, playSound, triggerEvent, handleExploreClick }) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [skillsVisible, setSkillsVisible] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    if (isOpen) {
      // Trigger skill bar animations after sheet settles
      const t = setTimeout(() => setSkillsVisible(true), 400);
      return () => clearTimeout(t);
    } else {
      setSkillsVisible(false);
    }
  }, [isOpen]);

  const handleCopyEmail = () => {
    if (playSound) playSound();
    navigator.clipboard.writeText('sujithreddy1546@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const skills = [
    { label: 'ML / AI',    pct: 92, color: '#8b5cf6' },
    { label: 'Python',     pct: 90, color: '#3b82f6' },
    { label: 'React',      pct: 85, color: '#06b6d4' },
    { label: 'Data Sci',   pct: 88, color: '#10b981' },
    { label: 'FastAPI',    pct: 80, color: '#f59e0b' },
  ];

  const content = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', zIndex: 10002 }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            role="dialog" aria-modal="true" aria-label="Profile"
            style={{
              position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 10003,
              background: 'var(--bg-secondary)',
              borderRadius: '28px 28px 0 0',
              boxShadow: '0 -24px 80px rgba(0,0,0,0.2), 0 -1px 0 rgba(255,255,255,0.06)',
              display: 'flex', flexDirection: 'column',
              maxHeight: '92vh', maxHeight: '92dvh',
              willChange: 'transform',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 350, mass: 0.9 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.35 }}
            onDragEnd={(_, info) => { if (info.offset.y > 100 || info.velocity.y > 500) onClose(); }}
          >
            {/* Handle */}
            <div style={{ width: 36, height: 4, background: 'var(--border-color)',
              borderRadius: 2, margin: '12px auto 0', flexShrink: 0 }} />

            {/* Scroll area */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}
              className="profile-scroll-body">

              {/* ── Hero banner ──────────────────────────────────────────── */}
              <div style={{
                margin: '18px 18px 0',
                borderRadius: 22,
                background: theme === 'dark'
                  ? 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(124,58,237,0.1) 100%)'
                  : 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(124,58,237,0.06) 100%)',
                border: '1px solid var(--border-color)',
                padding: '20px',
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* Glow orbs */}
                <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100,
                  borderRadius: '50%', background: 'rgba(59,130,246,0.12)', filter: 'blur(30px)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: -20, left: 40, width: 80, height: 80,
                  borderRadius: '50%', background: 'rgba(124,58,237,0.1)', filter: 'blur(24px)', pointerEvents: 'none' }} />

                {/* Close btn */}
                <button onClick={onClose} style={{
                  position: 'absolute', top: 16, right: 16,
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'var(--text-secondary)', zIndex: 2
                }}>
                  <X size={13} />
                </button>

                {/* Avatar + name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: 20, overflow: 'hidden',
                    border: '2.5px solid rgba(59,130,246,0.5)',
                    boxShadow: '0 8px 24px rgba(59,130,246,0.25)',
                    flexShrink: 0, position: 'relative'
                  }}>
                    <img src="/profile_photo.png" alt="Sujith Thota"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                        Sujith Thota
                      </p>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e',
                        boxShadow: '0 0 8px rgba(34,197,94,0.6)', flexShrink: 0 }} />
                    </div>
                    <p style={{ margin: '0 0 10px', fontSize: 12.5, color: 'var(--text-secondary)', fontWeight: 500 }}>
                      Data Science · Full Stack Dev
                    </p>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {['Open to work', 'VIT University'].map(tag => (
                        <span key={tag} style={{
                          fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 99,
                          background: 'rgba(59,130,246,0.1)', color: '#3b82f6',
                          border: '1px solid rgba(59,130,246,0.2)', textTransform: 'uppercase', letterSpacing: '0.04em'
                        }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Stats row ──────────────────────────────────────────────── */}
              <div style={{ display: 'flex', gap: 10, padding: '14px 18px 0' }}>
                <StatTile value="8.7"  label="CGPA"     icon={Star}     accent="#f59e0b" />
                <StatTile value="15+"  label="Certs"    icon={Award}    accent="#8b5cf6" />
                <StatTile value="5+"   label="ML Projs" icon={Brain}    accent="#3b82f6" />
                <StatTile value="200+" label="Commits"  icon={Code2}    accent="#10b981" />
              </div>

              {/* ── Skills ─────────────────────────────────────────────────── */}
              <div style={{ margin: '16px 18px 0', background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)', borderRadius: 18, padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                  <Zap size={14} color="var(--primary-blue)" />
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 800, textTransform: 'uppercase',
                    letterSpacing: '0.07em', color: 'var(--text-secondary)' }}>Technical Skills</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {skills.map(s => (
                    <SkillBar key={s.label} {...s} active={skillsVisible} />
                  ))}
                </div>
              </div>

              {/* ── Details ────────────────────────────────────────────────── */}
              <div style={{ margin: '14px 18px 0', background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)', borderRadius: 18, padding: '14px' }}>
                <p style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
                  letterSpacing: '0.07em', color: 'var(--text-muted)' }}>Details</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { icon: School, text: 'B.Tech CSE (Data Science), VIT University' },
                    { icon: MapPin, text: 'Vellore, India · Open to remote' },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <div style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={14} color="var(--text-secondary)" />
                      </div>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500,
                        lineHeight: 1.4, marginTop: 7 }}>{text}</span>
                    </div>
                  ))}
                  {/* Email row with copy */}
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', flexShrink: 0 }}>
                      <Mail size={14} color="var(--text-secondary)" />
                    </div>
                    <span style={{ fontSize: 13, color: 'var(--primary-blue)', fontWeight: 600, flex: 1, overflow: 'hidden',
                      textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>sujithreddy1546@gmail.com</span>
                    <button onClick={handleCopyEmail} style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: copiedEmail ? 'rgba(16,185,129,0.1)' : 'var(--bg-secondary)',
                      border: `1px solid ${copiedEmail ? 'rgba(16,185,129,0.3)' : 'var(--border-color)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s'
                    }}>
                      {copiedEmail ? <Check size={12} color="#10b981" /> : <Copy size={12} color="var(--text-secondary)" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Social links ───────────────────────────────────────────── */}
              <div style={{ display: 'flex', gap: 10, padding: '14px 18px 0' }}>
                <a href="https://github.com/sujith1546" target="_blank" rel="noreferrer"
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                    padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
                    borderRadius: 14, fontSize: 13, fontWeight: 700, color: 'var(--text-primary)',
                    textDecoration: 'none' }}>
                  <FaGithub size={16} /> GitHub
                </a>
                <a href="https://www.linkedin.com/in/sujith-reddy-thota/" target="_blank" rel="noreferrer"
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                    padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
                    borderRadius: 14, fontSize: 13, fontWeight: 700, color: 'var(--text-primary)',
                    textDecoration: 'none' }}>
                  <FaLinkedin size={16} style={{ color: '#0a66c2' }} /> LinkedIn
                </a>
              </div>

              {/* ── Explore row ────────────────────────────────────────────── */}
              <div style={{ margin: '14px 18px 0', background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)', borderRadius: 18, padding: '14px' }}>
                <p style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
                  letterSpacing: '0.07em', color: 'var(--text-muted)' }}>Explore</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {[
                    { label: 'Experience', icon: Briefcase, action: () => handleExploreClick('experience') },
                    { label: 'Certs',      icon: Award,    action: () => handleExploreClick('certifications') },
                    { label: 'GitHub',     icon: FaGithub, action: () => handleExploreClick('github') },
                    { label: 'Resume',     icon: FileText,
                      action: () => { if (playSound) playSound(); onClose(); triggerEvent('open-resume'); } },
                  ].map(({ label, icon: Icon, action }) => (
                    <button key={label} onClick={action} style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
                      padding: '12px 6px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                      borderRadius: 14, cursor: 'pointer', outline: 'none',
                      color: 'var(--text-primary)', transition: 'all 0.15s'
                    }}>
                      <div style={{ width: 36, height: 36, borderRadius: 11,
                        background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={18} color="var(--text-secondary)" />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Bottom CTA ─────────────────────────────────────────────── */}
              <div style={{ padding: '14px 18px 36px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button onClick={() => { if (playSound) playSound(); onClose(); triggerEvent('open-resume'); }}
                  style={{
                    height: 48, borderRadius: 14, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: 7, fontSize: 13.5, fontWeight: 700,
                    cursor: 'pointer', outline: 'none',
                    background: 'var(--bg-primary)', color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)', letterSpacing: '-0.01em'
                  }}>
                  <FileText size={15} /> Resume
                </button>
                <button onClick={() => { if (playSound) playSound(); onClose();
                    window.dispatchEvent(new CustomEvent('navigate-section', { detail: { section: 'contact' } })); }}
                  style={{
                    height: 48, borderRadius: 14, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: 7, fontSize: 13.5, fontWeight: 700,
                    cursor: 'pointer', outline: 'none',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: '#fff', border: 'none',
                    boxShadow: '0 4px 16px rgba(37,99,235,0.35)', letterSpacing: '-0.01em'
                  }}>
                  <Mail size={15} /> Hire Me
                </button>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : null;
}
