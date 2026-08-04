import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  Mail, Download, CheckCircle, Loader2, Zap, GraduationCap, Rocket, Calendar,
  Terminal, Layers, Target, Award, Code2, ArrowRight, Copy, Check, Clock,
  MoreHorizontal, Folder, FileText,
} from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { ScrollReveal } from '../components';
import { useLocalTime } from '../hooks/useLocalTime';
/* ─── Count-up hook using rAF ─── */
function useCountUp(target, duration = 1000, decimals = 0, trigger = true) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const v = target * (1 - Math.pow(1 - t, 3));
      setVal(parseFloat(v.toFixed(decimals)));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setVal(target);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, decimals, trigger]);
  return val;
}

/* ─── Live days-coding ─── */
function useDaysCoding(start = '2021-06-01') {
  const [d, setD] = useState(0);
  useEffect(() => {
    const s = new Date(start);
    const upd = () => setD(Math.floor((Date.now() - s) / 86400000));
    upd();
    const t = setInterval(upd, 60000);
    return () => clearInterval(t);
  }, [start]);
  return d;
}

/* ─── Skill Badges ─── */
const BADGES = [
  { label: 'Python',     color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)' },
  { label: 'TensorFlow', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)' },
  { label: 'React',      color: '#0ea5e9', bg: 'rgba(14, 165, 233, 0.12)' },
  { label: 'FastAPI',    color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' },
  { label: 'SQL',        color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' },
];

/* ─── Stats ─── */
function StatCard({ target, suffix = '', label, decimals = 0, trigger, delay = 0, icon: Icon, color = 'var(--primary-blue)' }) {
  const val = useCountUp(target, 1000, decimals, trigger);
  const display = decimals > 0 ? val.toFixed(decimals) : Math.floor(val);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={trigger ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.35, delay, ease: [0.16, 1, 0.3, 1] }}
      className="ab-stat-card"
    >
      <div className="ab-stat-top">
        {Icon && (
          <div className="ab-stat-icon-box" style={{ background: `${color}14`, color: color, borderColor: `${color}28` }}>
            <Icon size={14} />
          </div>
        )}
        <span className="ab-stat-value">
          {display}{suffix}
        </span>
      </div>
      <span className="ab-stat-label">{label}</span>
    </motion.div>
  );
}

/* ─── Career Timeline (Redesigned & Interactive Hover) ─── */
const milestones = [
  { id: 'a', title: "Gudivada", subtitle: "Schooling", meta: "2017 – 2019", badge: "Foundation", status: "done", description: "Academic foundation in Mathematics, Science, and Analytical Problem Solving." },
  { id: 'b', title: "Vijayawada", subtitle: "Intermediate", meta: "2019 – 2021", badge: "Score: 98%", status: "done", description: "Senior Secondary MPC stream (Mathematics, Physics, Chemistry) achieving a 98% distinction mark." },
  { id: 'c', title: "VIT Vellore", subtitle: "B.Tech CS", meta: "2021 – 2025", badge: "CGPA: 8.7", status: "done", description: "Computer Science Engineering degree at VIT Vellore covering Data Structures, Algorithms, OS, DBMS & Networks." },
  { id: 'd', title: "Data science", subtitle: "Specialization", meta: "Current focus", badge: "Active phase", status: "current", description: "Focused on Applied AI, Machine Learning, Deep Learning (TensorFlow/PyTorch), and building scalable REST APIs." },
  { id: 'e', title: "What's next?", subtitle: "Opportunities", meta: "Future roadmap", badge: "Open to roles", status: "future", description: "Open to full-time Software Engineering, AI, and Data Science roles." },
];

function CareerTimeline() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const [hoveredNode, setHoveredNode] = useState(null);

  const currentIndex = milestones.findIndex((m) => m.status === "current");
  const validIndex = currentIndex >= 0 ? currentIndex : milestones.length - 1;
  const progressPercent = (validIndex / (milestones.length - 1)) * 100;
  const hoveredIndex = hoveredNode ? milestones.findIndex(m => m.id === hoveredNode.id) : -1;

  return (
    <div className="tl-container-clean" ref={ref}>
      <style>{`
        .tl-container-clean {
          position: relative;
          padding-top: 10px;
          width: 100%;
        }

        /* Top Row: Track & Dots */
        .tl-track-row {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          margin-bottom: 14px;
        }

        .tl-line-base {
          position: absolute;
          left: 10%;
          right: 10%;
          top: 50%;
          transform: translateY(-50%);
          height: 2px;
          background: var(--border-color);
          z-index: 1;
          border-radius: 2px;
        }

        .tl-line-progress {
          position: absolute;
          left: 10%;
          top: 50%;
          transform: translateY(-50%);
          height: 2px;
          background: var(--primary-blue);
          z-index: 1;
          border-radius: 2px;
          transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .tl-dots-wrap {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          position: relative;
          z-index: 2;
        }

        .tl-dot-node {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
        }

        .tl-dot-shape {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          box-sizing: border-box;
          transition: all 0.25s ease;
        }

        .tl-dot-node:hover .tl-dot-shape,
        .tl-text-col:hover ~ .tl-track-row .tl-dot-shape {
          transform: scale(1.25);
        }

        .tl-dot-shape--done {
          background: var(--bg-secondary);
          border: 2px solid var(--text-muted);
        }

        .tl-dot-shape--current {
          background: var(--primary-blue);
          border: 2px solid var(--primary-blue);
          box-shadow: 0 0 12px color-mix(in srgb, var(--primary-blue) 60%, transparent);
        }

        .tl-dot-shape--future {
          background: var(--bg-secondary);
          border: 2px dashed var(--text-muted);
        }

        /* Bottom Row: Text Columns */
        .tl-text-grid {
          display: flex;
          justify-content: space-between;
          width: 100%;
        }

        .tl-text-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 0 4px;
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .tl-text-col:hover {
          transform: translateY(-2px);
        }

        .tl-text-title {
          font-size: 13px;
          font-weight: 700;
          margin: 0 0 2px;
          color: var(--text-primary);
          line-height: 1.25;
        }

        .tl-text-title--current {
          color: var(--primary-blue);
        }

        .tl-text-title--future {
          color: var(--text-muted);
        }

        .tl-text-sub {
          font-size: 11px;
          font-weight: 500;
          color: var(--text-secondary);
          margin: 0 0 2px;
          line-height: 1.2;
        }

        .tl-text-meta {
          font-size: 10.5px;
          font-weight: 600;
          color: var(--text-muted);
          margin: 0 0 6px;
        }

        .tl-text-badge {
          font-size: 10px;
          font-weight: 700;
          border-radius: 999px;
          padding: 3px 9px;
          display: inline-block;
          white-space: nowrap;
        }

        .tl-text-badge--done,
        .tl-text-badge--future {
          color: var(--text-secondary);
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
        }

        .tl-text-badge--current {
          color: var(--primary-blue);
          background: color-mix(in srgb, var(--primary-blue) 12%, transparent);
          border: 1px solid color-mix(in srgb, var(--primary-blue) 30%, transparent);
        }

        @media (max-width: 640px) {
          .tl-track-row { display: none; }
          .tl-text-grid { flex-direction: column; gap: 16px; }
        }
      `}</style>

      {/* Popover Card anchored directly above hovered milestone node */}
      <AnimatePresence>
        {hoveredNode && hoveredIndex >= 0 && (() => {
          let popoverPosStyle = {
            left: `${(hoveredIndex / (milestones.length - 1)) * 80 + 10}%`,
            transform: 'translateX(-50%)'
          };
          if (hoveredIndex === 0) {
            popoverPosStyle = { left: '0px', transform: 'translateX(0%)' };
          } else if (hoveredIndex === milestones.length - 1) {
            popoverPosStyle = { right: '0px', left: 'auto', transform: 'translateX(0%)' };
          }

          return (
            <motion.div
              key={`hover-popover-${hoveredNode.id}`}
              initial={{ opacity: 0, y: 6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.95 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                bottom: 'calc(100% - 4px)',
                zIndex: 100,
                width: 220,
                pointerEvents: 'none',
                ...popoverPosStyle
              }}
            >
              <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 14,
                padding: '10px 12px',
                boxShadow: '0 10px 28px rgba(0,0,0,0.18), 0 0 0 1px color-mix(in srgb, var(--primary-blue) 15%, transparent)',
                backdropFilter: 'blur(12px)',
                position: 'relative'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span className={`tl-text-badge tl-text-badge--${hoveredNode.status}`}>
                    {hoveredNode.badge}
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>{hoveredNode.meta}</span>
                </div>
                <p style={{ margin: '3px 0 2px', fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {hoveredNode.title} <span style={{ color: 'var(--primary-blue)', fontWeight: 600 }}>· {hoveredNode.subtitle}</span>
                </p>
                <p style={{ margin: 0, fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  {hoveredNode.description}
                </p>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Top Track Row (Line + Dots) */}
      <div className="tl-track-row">
        <div className="tl-line-base" />
        <motion.div
          className="tl-line-progress"
          initial={{ width: '0%' }}
          animate={inView ? { width: `calc(${progressPercent * 0.8}% )` } : { width: '0%' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        />

        <div className="tl-dots-wrap">
          {milestones.map((m, i) => (
            <div
              key={m.title + '-dot'}
              className="tl-dot-node"
              onMouseEnter={() => setHoveredNode(m)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <motion.div
                className={`tl-dot-shape tl-dot-shape--${m.status}`}
                initial={{ scale: 0 }}
                animate={inView ? { scale: 1 } : { scale: 0 }}
                transition={{ delay: 0.15 + i * 0.08, type: 'spring', stiffness: 350, damping: 20 }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Text Columns */}
      <div className="tl-text-grid">
        {milestones.map((m, i) => (
          <motion.div
            key={m.title + '-text'}
            className="tl-text-col"
            onMouseEnter={() => setHoveredNode(m)}
            onMouseLeave={() => setHoveredNode(null)}
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 + i * 0.08, duration: 0.35 }}
          >
            <p className={`tl-text-title tl-text-title--${m.status}`}>
              {m.title}
            </p>
            <p className="tl-text-sub">{m.subtitle}</p>
            <p className="tl-text-meta">{m.meta}</p>
            <span className={`tl-text-badge tl-text-badge--${m.status}`}>
              {m.badge}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}


/* ═══════════════════════════ MAIN ═══════════════════════════ */
export default function About({ onNavClick }) {
  const pageRef = useRef(null);
  const inView = useInView(pageRef, { once: true, amount: 0.1 });
  const daysCoding = useDaysCoding('2021-06-01');
  const localTime = useLocalTime();
  const [toast, setToast] = useState(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText('sujithreddy1546@gmail.com').catch(() => {});
      }
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2200);
    } catch { /* fallback */ }
  };

  const handleDownload = (e) => {
    e.preventDefault();
    if (toast) return;
    setToast('packaging');
    setTimeout(() => {
      setToast('done');
      const a = Object.assign(document.createElement('a'), { href: '/resume.pdf', download: 'Sujith_Resume.pdf' });
      document.body.appendChild(a); a.click(); if (a.parentNode) a.parentNode.removeChild(a);
      setTimeout(() => setToast(null), 3000);
    }, 1600);
  };

  return (
    <ScrollReveal>
      <style>{`
        /* ── Height propagation chain for non-scrollable desktop fit ──
           Layout chain: .text-content.wide-content > div.reveal > .ab-page
           Each must be display:flex + flex:1 so that .ab-page flex:1 reaches
           the actual viewport height set by .main-content / scroll-container.
        */
        #about {
          display: flex;
          flex-direction: column;
          flex: 1 1 0%;
          min-height: 0;
        }

        @media (min-width: 901px) {
          #about {
            height: auto !important;
            flex: 1 1 0% !important;
            overflow: visible;
          }
          .ab-page {
            display: flex;
            flex-direction: column;
            gap: 20px;
            overflow: visible;
          }
          .ab-row2 { padding: 18px 22px 20px; }
          .ab-row3 { padding: 18px 24px; }
        }

        .ab-bento-card:hover {
          transform: translateY(-2px);
          border-color: var(--primary-blue) !important;
          box-shadow: 0 10px 24px -8px color-mix(in srgb, var(--primary-blue) 20%, transparent);
        }

        @media (max-width: 900px) {
          .ab-bento-grid {
            grid-template-columns: 1fr !important;
          }
        }

        /* ── Page shell ── */
        .ab-page {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 20px;
          box-sizing: border-box;
          padding-bottom: 24px;
        }

        .ab-header-row {
          display: flex; align-items: center; justify-content: space-between;
          flex-shrink: 0; margin-bottom: 2px;
        }
        .ab-header-row h1 {
          font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0;
        }
        .ab-header-row p {
          font-size: 12.5px; color: var(--text-secondary); margin: 2px 0 0;
        }

        /* ── Profile Card ── */
        .ab-profile-card {
          position: relative;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          overflow: hidden;
          width: 100%;
          flex-shrink: 0;
        }

        .ab-card-top {
          display: flex;
          align-items: flex-start;
          gap: 18px;
          width: 100%;
        }

        .ab-avatar-initials {
          width: 58px; height: 58px; border-radius: 50%;
          background: var(--primary-blue, #3b82f6);
          color: #ffffff; font-size: 20px; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 14px rgba(59,130,246,0.3);
          letter-spacing: 0.5px;
        }

        .ab-bio-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 8px; }
        .ab-bio-header-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }

        .ab-bio-name {
          font-size: 15.5px; font-weight: 700;
          color: var(--text-primary); margin: 0; line-height: 1.45; letter-spacing: -0.01em;
        }
        .ab-blue-highlight { color: var(--primary-blue); font-weight: 700; }

        .ab-bio-desc-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-top: 2px;
        }
        .ab-bio-desc {
          font-size: 13.5px; line-height: 1.5;
          color: var(--text-secondary); margin: 0; flex: 1;
        }

        .ab-days-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 700;
          background: color-mix(in srgb, var(--primary-blue) 10%, transparent);
          border: 1px solid color-mix(in srgb, var(--primary-blue) 25%, transparent);
          color: var(--primary-blue); flex-shrink: 0;
        }
        .ab-zap-pulse { color: #f59e0b; }

        .ab-badges {
          display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end;
          align-items: center; flex-shrink: 0; margin-left: auto;
        }
        .ab-badge {
          display: inline-flex; padding: 4px 10px; border-radius: 6px;
          font-size: 11.5px; font-weight: 700; cursor: default;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .ab-badge:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }

        /* Unified Stat Bar */
        .ab-unified-stat-bar {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 14px;
          padding: 16px 0;
          width: 100%;
        }

        .ab-stat-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          border-right: 1px solid var(--border-color);
          padding: 0 12px;
          text-align: center;
        }

        .ab-stat-col--last {
          border-right: none;
        }

        .ab-stat-num {
          font-size: 24px;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1;
          letter-spacing: -0.02em;
        }

        .ab-stat-lbl {
          font-size: 10.5px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        @media (max-width: 640px) {
          .ab-card-top { gap: 12px; }
          .ab-avatar-initials { width: 48px; height: 48px; font-size: 17px; }
          .ab-unified-stat-bar {
            grid-template-columns: repeat(2, 1fr);
            row-gap: 14px;
            padding: 16px 0;
          }
          .ab-stat-col {
            border-right: 1px solid var(--border-color);
          }
          .ab-stat-col:nth-child(2n) {
            border-right: none;
          }
          .ab-stat-col:nth-child(1), .ab-stat-col:nth-child(2) {
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 14px;
          }
        }

        /* ── ROW 2: Timeline ── */
        .ab-row2 {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 14px 20px 16px;
          flex-shrink: 0;
          overflow: visible;
          position: relative;
          z-index: 10;
        }
        .ab-section-label {
          font-size: 13px; font-weight: 700;
          color: var(--text-secondary); margin: 0 0 12px;
          display: flex; align-items: center; gap: 6px;
        }

        /* ── ROW 3: Advanced CTA + Action Buttons ── */
        .ab-row3 {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          background: color-mix(in srgb, var(--primary-blue) 4%, var(--bg-secondary));
          border: 1px solid color-mix(in srgb, var(--primary-blue) 18%, var(--border-color));
          border-radius: 20px;
          padding: 24px 30px;
          flex-shrink: 0;
          box-sizing: border-box;
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(0,0,0,0.03);
          transition: border-color 0.25s ease, box-shadow 0.25s ease;
        }
        .ab-row3:hover {
          border-color: color-mix(in srgb, var(--primary-blue) 35%, var(--border-color));
          box-shadow: 0 10px 32px rgba(0,0,0,0.06);
        }
        .ab-cta-left { display: flex; flex-direction: column; gap: 6px; max-width: 560px; }
        
        .ab-cta-badges-row {
          display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 2px;
        }
        .ab-cta-status-pill {
          display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700;
          color: #10b981; background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.25);
          padding: 4px 11px; border-radius: 8px; letter-spacing: 0.02em;
        }
        .ab-cta-time-pill {
          display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 700;
          color: var(--primary-blue); background: color-mix(in srgb, var(--primary-blue) 10%, transparent);
          border: 1px solid color-mix(in srgb, var(--primary-blue) 25%, transparent);
          padding: 4px 11px; border-radius: 8px;
        }
        .ab-cta-resp-pill {
          display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 600;
          color: var(--text-muted);
        }

        .ab-cta-title {
          font-size: 18px; font-weight: 800;
          color: var(--text-primary); margin: 0;
          letter-spacing: -0.015em;
        }
        .ab-cta-sub {
          font-size: 13.5px; color: var(--text-secondary); margin: 0; line-height: 1.5;
        }

        .ab-actions-grid {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }
        .ab-social-icons-group {
          display: flex; align-items: center; gap: 6px; margin-left: 4px;
        }
        .ab-social-icon-btn {
          width: 36px; height: 36px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          background: var(--bg-primary); color: var(--text-secondary);
          border: 1px solid var(--border-color); text-decoration: none;
          transition: all 0.2s ease;
        }
        .ab-social-icon-btn:hover {
          color: var(--primary-blue); border-color: var(--primary-blue);
          transform: translateY(-2px);
          background: color-mix(in srgb, var(--primary-blue) 8%, transparent);
        }
        .ab-btn-primary {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          padding: 10.5px 22px; border-radius: 10px;
          background: var(--text-primary); color: var(--bg-primary);
          border: none; font-size: 13.5px; font-weight: 700; cursor: pointer;
          transition: all 0.2s ease; text-decoration: none; white-space: nowrap;
          box-shadow: 0 4px 14px rgba(0,0,0,0.1);
        }
        .ab-btn-primary:hover {
          opacity: 0.92; transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.15);
        }
        .ab-btn-arrow { transition: transform 0.2s ease; }
        .ab-btn-primary:hover .ab-btn-arrow { transform: translateX(3px); }

        .ab-btn-secondary {
          display: inline-flex; align-items: center; justify-content: center; gap: 7px;
          padding: 10.5px 18px; border-radius: 10px;
          background: var(--bg-primary); color: var(--text-primary);
          border: 1px solid var(--border-color); font-size: 13px; font-weight: 600;
          cursor: pointer; transition: all 0.2s ease; text-decoration: none; white-space: nowrap;
        }
        .ab-btn-secondary:hover {
          border-color: var(--primary-blue);
          color: var(--primary-blue);
          background: color-mix(in srgb, var(--primary-blue) 6%, transparent);
          transform: translateY(-2px);
        }

        /* Days badge */
        .ab-days-badge {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 2px 9px; border-radius: 999px; font-size: 10.5px; font-weight: 600;
          background: color-mix(in srgb, var(--primary-blue) 8%, transparent);
          border: 1px solid color-mix(in srgb, var(--primary-blue) 20%, transparent);
          color: var(--primary-blue);
        }

        /* ── GitHub activity: fill remaining space ── */
        .ab-github-wrapper {
          flex: 1;
          min-height: 0;
          overflow: hidden;
        }
        .ab-github-wrapper > * {
          height: 100%;
        }

        /* ── Dark theme overrides ── */
        [data-theme="dark"] .ab-badge {
          filter: brightness(0.85) saturate(0.8);
        }

        /* ── Mobile: allow natural scroll ── */
        @media (max-width: 900px) {
          #about,
          #about > .text-content.wide-content,
          #about > .text-content.wide-content > .reveal {
            display: block;
            flex: none;
            min-height: unset;
          }
          .ab-page {
            flex: none;
            min-height: unset;
            padding-bottom: 32px;
          }
          .ab-github-wrapper { flex: none; overflow: visible; }
          .ab-github-wrapper > * { height: auto; }
          .ab-row1 { grid-template-columns: 1fr; }
          .ab-stats-grid { grid-template-columns: repeat(4, 1fr); }
          .ab-actions-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
          .ab-btn-primary, .ab-btn-secondary { padding: 10px 14px; font-size: 12.5px; }
        }
      `}</style>

      <div className="ab-page" ref={pageRef}>

        {/* ══════════ Profile Card (Compact & Sleek) ══════════ */}
        <motion.div
          className="ab-profile-card"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '16px 20px 0',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            overflow: 'hidden'
          }}
        >
          {/* Header Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'color-mix(in srgb, var(--primary-blue) 15%, transparent)',
                color: 'var(--primary-blue)',
                fontSize: '14px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                ST
              </div>
              <div>
                <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, lineHeight: 1.2 }}>
                  Sujith Thota
                </h2>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '1px 0 0', fontWeight: 500 }}>
                  B.Tech CSE, VIT Vellore
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                border: '1px solid var(--border-color)',
                borderRadius: '999px',
                padding: '3px 10px',
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                background: 'var(--bg-primary)'
              }}>
                5+ yrs coding
              </div>
              <button
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <MoreHorizontal size={16} />
              </button>
            </div>
          </div>

          {/* Main Headline */}
          <h1 style={{
            fontSize: '20px',
            fontWeight: 700,
            lineHeight: 1.35,
            color: 'var(--text-primary)',
            margin: '0 0 6px',
            letterSpacing: '-0.015em',
            maxWidth: '780px'
          }}>
            Data science specialist bridging complex backend systems with sleek, responsive interfaces.
          </h1>

          {/* Subheading */}
          <p style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            margin: '0 0 12px',
            fontWeight: 400
          }}>
            Applied ML pipelines, full-stack web apps, and 200+ solved DSA problems.
          </p>

          {/* Tech Badges Row */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
            {['Python', 'TensorFlow', 'React', 'FastAPI', 'SQL'].map((tag) => (
              <span
                key={tag}
                style={{
                  padding: '3.5px 11px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)'
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Stat Grid Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            borderTop: '1px solid var(--border-color)',
            marginLeft: '-20px',
            marginRight: '-20px',
            background: 'var(--bg-secondary)'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px 8px',
              borderRight: '1px solid var(--border-color)',
              textAlign: 'center',
              gap: '2px'
            }}>
              <Code2 size={14} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                {useCountUp(3.5, 1000, 1, inView).toFixed(1)}
              </span>
              <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: 500 }}>
                years coding
              </span>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px 8px',
              borderRight: '1px solid var(--border-color)',
              textAlign: 'center',
              gap: '2px'
            }}>
              <Folder size={14} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                {Math.floor(useCountUp(10, 1000, 0, inView))}
              </span>
              <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: 500 }}>
                projects
              </span>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px 8px',
              borderRight: '1px solid var(--border-color)',
              textAlign: 'center',
              gap: '2px'
            }}>
              <FileText size={14} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                {Math.floor(useCountUp(200, 1000, 0, inView))}
              </span>
              <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: 500 }}>
                DSA solved
              </span>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px 8px',
              textAlign: 'center',
              gap: '2px'
            }}>
              <GraduationCap size={14} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                {useCountUp(8.7, 1000, 1, inView).toFixed(1)}
              </span>
              <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: 500 }}>
                CGPA
              </span>
            </div>
          </div>
        </motion.div>

        {/* Bento Grid: Personal Profile & Achievements */}
        <motion.div
          className="ab-bento-grid"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '14px',
            width: '100%'
          }}
        >
          <div className="ab-bento-card" style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '20px 22px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'color-mix(in srgb, #185fa5 15%, transparent)',
              color: '#185fa5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16
            }}>
              <GraduationCap size={18} />
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px' }}>
              Academic excellence
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              B.Tech CS student at VIT Vellore (8.7 CGPA) with a 98% distinction mark in senior secondary (MPC).
            </p>
          </div>

          <div className="ab-bento-card" style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '20px 22px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'color-mix(in srgb, #d93025 15%, transparent)',
              color: '#d93025',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16
            }}>
              <Zap size={18} />
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px' }}>
              Passion and work ethic
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Dedicated developer with 1,000+ continuous days of coding experience and 10+ shipped web and AI apps.
            </p>
          </div>

          <div className="ab-bento-card" style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '20px 22px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'color-mix(in srgb, #137333 15%, transparent)',
              color: '#137333',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16
            }}>
              <Rocket size={18} />
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px' }}>
              Career goal and roles
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Actively seeking full-time software engineering, data science, and AI roles to build high-impact software.
            </p>
          </div>
        </motion.div>

        {/* ══════════ ROW 2: Career Timeline ══════════ */}
        <motion.div
          className="ab-row2"
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="ab-section-label">
            <span>Career path and milestones</span>
          </p>
          <CareerTimeline />
        </motion.div>





      </div>

      {/* Toast */}
      {createPortal(
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 240, damping: 22 }}
              style={{
                position: 'fixed', top: 80, right: 32, zIndex: 99999,
                display: 'flex', alignItems: 'center', gap: 10,
                background: toast === 'packaging' ? 'rgba(17,24,39,.95)' : 'rgba(16,185,129,.95)',
                backdropFilter: 'blur(12px)', color: '#fff',
                padding: '11px 18px', borderRadius: 12,
                boxShadow: '0 8px 32px rgba(0,0,0,.2)',
              }}
            >
              {toast === 'packaging'
                ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}><Loader2 size={16} /></motion.div>
                : <CheckCircle size={16} />}
              <span style={{ fontSize: 13, fontWeight: 600 }}>
                {toast === 'packaging' ? 'Preparing resume...' : 'Downloaded!'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </ScrollReveal>
  );
}
