import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  Mail, Download, CheckCircle, Loader2, Zap, GraduationCap, Calendar,
  Terminal, Layers, Target, Award, Code2, ArrowRight, Copy, Check, Clock,
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

/* ─── Career Timeline ─── */
const TL_NODES = [
  {
    id: 'a',
    label: 'Gudivada',
    sub: 'Schooling',
    done: true,
    active: false,
    period: '2017 – 2019',
    badge: 'Foundation',
    badgeBg: 'rgba(99,102,241,0.12)',
    badgeColor: '#6366f1',
    badgeBorder: 'rgba(99,102,241,0.25)',
    description: 'Academic foundation in Mathematics, Science, and Analytical Problem Solving.',
  },
  {
    id: 'b',
    label: 'Vijayawada',
    sub: 'Intermediate',
    done: true,
    active: false,
    period: '2019 – 2021',
    badge: 'Score: 98%',
    badgeBg: 'rgba(14,165,233,0.12)',
    badgeColor: '#0ea5e9',
    badgeBorder: 'rgba(14,165,233,0.25)',
    description: 'Senior Secondary MPC stream (Mathematics, Physics, Chemistry) achieving a 98% distinction mark.',
  },
  {
    id: 'c',
    label: 'VIT Vellore',
    sub: 'B.Tech CS',
    done: true,
    active: false,
    period: '2021 – 2025',
    badge: 'CGPA: 8.7',
    badgeBg: 'rgba(16,185,129,0.12)',
    badgeColor: '#10b981',
    badgeBorder: 'rgba(16,185,129,0.25)',
    description: 'Computer Science Engineering degree at VIT Vellore covering Data Structures, Algorithms, OS, DBMS & Networks.',
  },
  {
    id: 'd',
    label: 'Data Science',
    sub: 'Specialization',
    done: true,
    active: true,
    period: 'Current Focus',
    badge: 'Active Phase',
    badgeBg: 'rgba(59,130,246,0.15)',
    badgeColor: '#3b82f6',
    badgeBorder: 'rgba(59,130,246,0.3)',
    description: 'Focused on Applied AI, Machine Learning, Deep Learning (TensorFlow/PyTorch), and building scalable REST APIs.',
  },
  {
    id: 'e',
    label: "What's Next?",
    sub: 'Opportunities',
    done: false,
    active: false,
    muted: true,
    period: 'Future Roadmap',
    badge: 'Open to Roles',
    badgeBg: 'rgba(245,158,11,0.12)',
    badgeColor: '#f59e0b',
    badgeBorder: 'rgba(245,158,11,0.25)',
    description: 'Open to full-time Software Engineering, AI, and Data Science roles.',
  },
];

function CareerTimeline() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const [hoveredNode, setHoveredNode] = useState(null);

  return (
    <div ref={ref} style={{ padding: '28px 0 0', position: 'relative', overflow: 'visible' }}>
      <style>{`
        @keyframes railPulseStream {
          0% { left: -10%; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { left: 110%; opacity: 0; }
        }
        @keyframes pulseRing {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        .tl-node-btn {
          background: none; border: none; padding: 0; cursor: pointer;
          display: flex; flex-direction: column; align-items: center; width: 100%;
          outline: none; transition: transform 0.2s;
        }
        .tl-node-btn:hover, .tl-node-btn:focus-visible { transform: translateY(-2px); }
        @media (prefers-reduced-motion: reduce) {
          .tl-node-pulse { animation: none !important; }
          .tl-rail-pulse-beam { animation: none !important; display: none !important; }
        }
      `}</style>

      {/* Line + Dots row */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginBottom: 12, overflow: 'visible' }}>
        {/* Background track */}
        <div style={{
          position: 'absolute', left: '10%', right: '10%', height: 3,
          background: 'var(--border-color)', borderRadius: 3,
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)'
        }} />
        
        {/* Animated Multi-Color Gradient Progress Fill with Neon Backdrop Glow */}
        <motion.div
          style={{
            position: 'absolute', left: '10%', right: '10%', height: 3,
            background: 'linear-gradient(90deg, #6366f1 0%, #0ea5e9 33%, #10b981 66%, #3b82f6 100%)',
            boxShadow: '0 0 10px rgba(59,130,246,0.5), 0 0 20px rgba(16,185,129,0.3)',
            borderRadius: 3, transformOrigin: 'left center',
            overflow: 'hidden'
          }}
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 0.78 } : { scaleX: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        >
          {/* Active Data Flow Light Beam */}
          <div className="tl-rail-pulse-beam" style={{
            position: 'absolute', top: 0, bottom: 0, width: 60,
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.9) 50%, transparent 100%)',
            animation: 'railPulseStream 2.6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            pointerEvents: 'none'
          }} />
        </motion.div>

        {/* Dots */}
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', position: 'relative', zIndex: 2, overflow: 'visible' }}>
          {TL_NODES.map((node, i) => {
            const isHovered = hoveredNode?.id === node.id;
            const delay = 0.25 + i * 0.16;

            // Alignment styles based on node position in timeline
            let popoverStyle = { left: '50%', transform: 'translateX(-50%)' };
            let tailStyle = { left: '50%' };
            if (i === 0) {
              popoverStyle = { left: '-8px', transform: 'translateX(0%)' };
              tailStyle = { left: '18px' };
            } else if (i === TL_NODES.length - 1) {
              popoverStyle = { right: '-8px', left: 'auto', transform: 'translateX(0%)' };
              tailStyle = { right: '18px', left: 'auto' };
            }

            return (
              <div key={node.id} style={{ flex: 1, display: 'flex', justifyContent: 'center', position: 'relative', overflow: 'visible' }}>
                {/* Popover anchored directly above this specific node */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      key={`popover-${node.id}`}
                      initial={{ opacity: 0, y: 6, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.95 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      style={{
                        position: 'absolute',
                        bottom: 'calc(100% + 14px)',
                        zIndex: 100,
                        width: 240,
                        pointerEvents: 'none',
                        ...popoverStyle,
                      }}
                    >
                      <div style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 14,
                        padding: '12px 14px',
                        boxShadow: '0 12px 30px rgba(0,0,0,0.22), 0 0 0 1px color-mix(in srgb, var(--primary-blue) 15%, transparent)',
                        backdropFilter: 'blur(14px) saturate(160%)',
                        WebkitBackdropFilter: 'blur(14px) saturate(160%)',
                        position: 'relative'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
                            background: node.badgeBg, color: node.badgeColor, border: `1px solid ${node.badgeBorder}`
                          }}>
                            {node.active && (
                              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
                            )}
                            {node.badge}
                          </span>
                          <span style={{ fontSize: 10.5, color: 'var(--text-muted)', fontWeight: 600 }}>{node.period}</span>
                        </div>
                        <p style={{ margin: '4px 0 2px', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                          {node.label} <span style={{ color: 'var(--primary-blue)', fontWeight: 600 }}>· {node.sub}</span>
                        </p>
                        <p style={{ margin: 0, fontSize: 11.5, color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                          {node.description}
                        </p>
                        
                        {/* Downward Arrow Tail */}
                        <div style={{
                          position: 'absolute', bottom: -5,
                          transform: 'translateX(-50%) rotate(45deg)',
                          width: 9, height: 9,
                          background: 'var(--bg-secondary)',
                          borderRight: '1px solid var(--border-color)',
                          borderBottom: '1px solid var(--border-color)',
                          ...tailStyle
                        }} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  className="tl-node-btn"
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onFocus={() => setHoveredNode(node)}
                  onBlur={() => setHoveredNode(null)}
                  aria-label={`${node.label} ${node.sub} - ${node.period}`}
                >
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {node.active && (
                      <span className="tl-node-pulse" style={{
                        position: 'absolute', width: 22, height: 22, borderRadius: '50%',
                        background: 'rgba(59,130,246,0.3)', animation: 'pulseRing 1.8s ease-out infinite'
                      }} />
                    )}
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={inView ? { scale: 1, opacity: 1 } : {}}
                      transition={{ delay, type: 'spring', stiffness: 350, damping: 22 }}
                      style={{
                        width: node.active ? 16 : 14,
                        height: node.active ? 16 : 14,
                        borderRadius: '50%',
                        background: node.active
                          ? 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)'
                          : isHovered
                          ? node.badgeColor
                          : 'var(--bg-secondary)',
                        border: node.muted
                          ? '2px solid var(--border-color)'
                          : `2.5px solid ${node.done || node.active ? node.badgeColor : 'var(--border-color)'}`,
                        boxShadow: isHovered
                          ? `0 0 14px ${node.badgeColor}`
                          : node.active
                          ? '0 0 12px rgba(59,130,246,0.6)'
                          : 'none',
                        transition: 'all 0.25s ease'
                      }}
                    />
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Labels & Badges row */}
      <div style={{ display: 'flex' }}>
        {TL_NODES.map((node, i) => {
          const delay = 0.32 + i * 0.14;
          return (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, y: 6 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay, duration: 0.3 }}
              style={{ flex: 1, textAlign: 'center', cursor: 'default', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              onMouseEnter={() => setHoveredNode(node)}
              onMouseLeave={() => setHoveredNode(null)}
              onFocus={() => setHoveredNode(node)}
              onBlur={() => setHoveredNode(null)}
              tabIndex={0}
            >
              <p style={{
                fontSize: 12.5, fontWeight: 700, margin: '0 0 2px',
                color: node.active ? 'var(--primary-blue)' : node.muted ? 'var(--text-muted)' : 'var(--text-primary)',
              }}>
                {node.label}
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '0 0 4px', fontWeight: 500 }}>
                {node.sub}
              </p>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 5 }}>
                {node.period}
              </span>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
                background: node.badgeBg, color: node.badgeColor, border: `1px solid ${node.badgeBorder}`
              }}>
                {node.active && (
                  <span style={{
                    width: 5, height: 5, borderRadius: '50%', background: '#10b981',
                    boxShadow: '0 0 6px #10b981', display: 'inline-block'
                  }} />
                )}
                {node.badge}
              </span>
            </motion.div>
          );
        })}
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
          .ab-row3 { flex-direction: column; align-items: stretch; gap: 14px; padding: 18px 20px; }
          .ab-actions-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
          .ab-btn-primary, .ab-btn-secondary { padding: 10px 14px; font-size: 12.5px; }
        }
      `}</style>

      <div className="ab-page" ref={pageRef}>

        {/* ══════════ Profile Card ══════════ */}
        <motion.div
          className="ab-profile-card"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="ab-card-top">
            <div className="ab-avatar-initials">ST</div>

            <div className="ab-bio-body">
              <div className="ab-bio-header-row">
                <h1 className="ab-bio-name">
                  Hi, I'm Sujith — a B.Tech student at{' '}
                  <span className="ab-blue-highlight">VIT Vellore (8.7 CGPA)</span> specializing in{' '}
                  <span className="ab-blue-highlight">Data Science</span>.
                </h1>
                {daysCoding > 0 && (
                  <div className="ab-days-badge">
                    <Zap size={11} className="ab-zap-pulse" />
                    <span>{daysCoding.toLocaleString()}d</span>
                  </div>
                )}
              </div>

              <div className="ab-bio-desc-row">
                <p className="ab-bio-desc">
                  Bridging complex backend data structures with sleek, responsive interfaces.
                </p>

                {/* Right-aligned Tech Skill Badges */}
                <div className="ab-badges">
                  {BADGES.map(b => (
                    <span
                      key={b.label}
                      className="ab-badge"
                      style={{ background: b.bg, color: b.color, border: `1px solid ${b.color}25` }}
                    >
                      {b.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Unified Stat Bar */}
          <div className="ab-unified-stat-bar">
            <div className="ab-stat-col">
              <span className="ab-stat-num">{useCountUp(3.5, 1000, 1, inView).toFixed(1)}</span>
              <span className="ab-stat-lbl">Years Coding</span>
            </div>
            <div className="ab-stat-col">
              <span className="ab-stat-num">{Math.floor(useCountUp(10, 1000, 0, inView))}</span>
              <span className="ab-stat-lbl">Projects</span>
            </div>
            <div className="ab-stat-col">
              <span className="ab-stat-num">{Math.floor(useCountUp(200, 1000, 0, inView))}</span>
              <span className="ab-stat-lbl">DSA Solved</span>
            </div>
            <div className="ab-stat-col ab-stat-col--last">
              <span className="ab-stat-num">{useCountUp(8.7, 1000, 1, inView).toFixed(1)}</span>
              <span className="ab-stat-lbl">CGPA</span>
            </div>
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
