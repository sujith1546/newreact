import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  Mail, Download, CheckCircle, Loader2, Zap, GraduationCap, Calendar,
  Terminal, Layers, Target, Award, Code2, ArrowRight, Copy, Check,
} from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { ScrollReveal } from '../components';
import GitHubActivity from '../components/widgets/GitHubActivity';

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
  { label: 'Python',       color: '#3b82f6',  bg: '#eff6ff' },
  { label: 'TensorFlow',   color: '#374151',  bg: '#f3f4f6' },
  { label: 'React',        color: '#0ea5e9',  bg: '#f0f9ff' },
  { label: 'FastAPI',      color: '#059669',  bg: '#f0fdf4' },
  { label: 'SQL',          color: '#d97706',  bg: '#fffbeb' },
];

/* ─── Stats ─── */
function StatCard({ target, suffix = '', label, decimals = 0, trigger, delay = 0 }) {
  const val = useCountUp(target, 1000, decimals, trigger);
  const display = decimals > 0 ? val.toFixed(decimals) : Math.floor(val);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={trigger ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.35, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: 4, textAlign: 'center',
        padding: '14px 10px',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 14,
      }}
    >
      <span style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
        {display}{suffix}
      </span>
      <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
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
    badgeBg: 'rgba(16,185,129,0.12)',
    badgeColor: '#10b981',
    description: 'Completed secondary schooling with strong academic foundation in Mathematics, Science, and Analytical Problem Solving.',
    highlights: ['Top academic ranker in Science & Mathematics', 'Formed core interest in computers & logic', 'Participated in regional math olympiads']
  },
  {
    id: 'b',
    label: 'Vijayawada',
    sub: 'Intermediate',
    done: true,
    active: false,
    period: '2019 – 2021',
    badge: 'Score: 98%',
    badgeBg: 'rgba(59,130,246,0.12)',
    badgeColor: '#3b82f6',
    description: 'Senior Secondary Education focusing on Physics, Chemistry, and Higher Mathematics (MPC stream).',
    highlights: ['Achieved 98% distinction mark', 'Mastered advanced calculus & linear algebra', 'Prepared for competitive engineering exams']
  },
  {
    id: 'c',
    label: 'VIT Vellore',
    sub: 'B.Tech CS',
    done: true,
    active: false,
    period: '2021 – 2025',
    badge: 'CGPA: 8.7',
    badgeBg: 'rgba(139,92,246,0.12)',
    badgeColor: '#8b5cf6',
    description: 'B.Tech Computer Science Engineering at VIT Vellore. Building deep understanding in software engineering and algorithms.',
    highlights: ['8.7 Cumulative Grade Point Average', 'Core CS: Operating Systems, DBMS, DSA, Networks', 'Built multiple full-stack & AI projects']
  },
  {
    id: 'd',
    label: 'Data Science',
    sub: 'Specialization',
    done: true,
    active: true,
    period: 'Current Focus',
    badge: 'Active Phase',
    badgeBg: 'rgba(59,130,246,0.2)',
    badgeColor: '#3b82f6',
    description: 'Specialization in Machine Learning, Deep Learning, Statistical Data Mining, and Applied AI Systems.',
    highlights: ['Proficient in TensorFlow, PyTorch & Python ML stack', 'Worked on computer vision & NLP models', 'Deploying scalable ML models & REST APIs']
  },
  {
    id: 'e',
    label: "What's next?",
    sub: 'Opportunities',
    done: false,
    active: false,
    muted: true,
    period: 'Future Roadmap',
    badge: 'Open to Roles',
    badgeBg: 'rgba(245,158,11,0.12)',
    highlights: ['Available for full-time software engineering roles', 'Targeting high-impact Data Science & AI teams', 'Eager to build production-grade AI solutions']
  },
];

function CareerTimeline() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [hoveredNode, setHoveredNode] = useState(null);

  const hoveredIndex = hoveredNode ? TL_NODES.findIndex(n => n.id === hoveredNode.id) : 0;
  const leftPercent = (hoveredIndex / (TL_NODES.length - 1)) * 90 + 5;

  return (
    <div ref={ref} style={{ padding: '24px 0 0', position: 'relative' }}>
      <style>{`
        @keyframes pulseRing {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        .tl-node-btn {
          background: none; border: none; padding: 0; cursor: pointer;
          display: flex; flex-direction: column; align-items: center; width: 100%;
          outline: none; transition: transform 0.2s;
        }
        .tl-node-btn:hover { transform: translateY(-2px); }
      `}</style>

      {/* Hover Tooltip Popover */}
      <AnimatePresence>
        {hoveredNode && (
          <motion.div
            key={`hover-${hoveredNode.id}`}
            initial={{ opacity: 0, y: 8, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.94 }}
            transition={{ type: 'spring', damping: 24, stiffness: 350 }}
            style={{
              position: 'absolute',
              top: -110,
              left: `${leftPercent}%`,
              transform: 'translateX(-50%)',
              zIndex: 50,
              width: 240,
              pointerEvents: 'none',
            }}
          >
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 14,
              padding: '12px 14px',
              boxShadow: '0 12px 30px rgba(0,0,0,0.25), 0 0 0 1px color-mix(in srgb, var(--primary-blue) 20%, transparent)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999, background: hoveredNode.badgeBg, color: hoveredNode.badgeColor }}>
                  {hoveredNode.badge}
                </span>
                <span style={{ fontSize: 10.5, color: 'var(--text-muted)', fontWeight: 600 }}>{hoveredNode.period}</span>
              </div>
              <p style={{ margin: '4px 0 2px', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                {hoveredNode.label} <span style={{ color: 'var(--primary-blue)', fontWeight: 600 }}>· {hoveredNode.sub}</span>
              </p>
              <p style={{ margin: 0, fontSize: 11.5, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {hoveredNode.description}
              </p>
              
              {/* Downward Arrow indicator */}
              <div style={{
                position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%) rotate(45deg)',
                width: 9, height: 9, background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)'
              }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Line + Dots row */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        {/* Background track */}
        <div style={{
          position: 'absolute', left: '5%', right: '5%', height: 2,
          background: 'var(--border-color)', borderRadius: 2,
        }} />
        {/* Animated progress fill — scaleX draw-on */}
        <motion.div
          style={{
            position: 'absolute', left: '5%', right: '5%', height: 2,
            background: 'var(--primary-blue)',
            borderRadius: 2, transformOrigin: 'left center',
          }}
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 0.78 } : { scaleX: 0 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        />
        {/* Dots */}
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', position: 'relative', zIndex: 2 }}>
          {TL_NODES.map((node, i) => {
            const delay = 0.25 + i * 0.16;
            return (
              <div key={node.id} style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <button
                  className="tl-node-btn"
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                  title={`${node.label} - ${node.sub}`}
                >
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {node.active && (
                      <span style={{
                        position: 'absolute', width: 22, height: 22, borderRadius: '50%',
                        background: 'rgba(59,130,246,0.3)', animation: 'pulseRing 1.8s ease-out infinite'
                      }} />
                    )}
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={inView ? { scale: 1, opacity: 1 } : {}}
                      transition={{ delay, type: 'spring', stiffness: 350, damping: 22 }}
                      style={{
                        width: node.active ? 15 : 13,
                        height: node.active ? 15 : 13,
                        borderRadius: '50%',
                        background: node.active
                          ? 'var(--primary-blue)'
                          : 'var(--bg-secondary)',
                        border: node.muted
                          ? '2px solid var(--border-color)'
                          : `2.5px solid ${node.done || node.active ? 'var(--primary-blue)' : 'var(--border-color)'}`,
                        boxShadow: node.active ? '0 0 12px rgba(59,130,246,0.6)' : 'none',
                      }}
                    />
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Labels row */}
      <div style={{ display: 'flex' }}>
        {TL_NODES.map((node, i) => {
          const delay = 0.32 + i * 0.14;
          return (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, y: 6 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay, duration: 0.3 }}
              style={{ flex: 1, textAlign: 'center', cursor: 'default' }}
              onMouseEnter={() => setHoveredNode(node)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <p style={{
                fontSize: 12.5, fontWeight: 700, margin: '0 0 2px',
                color: node.active ? 'var(--primary-blue)' : node.muted ? 'var(--text-muted)' : 'var(--text-primary)',
              }}>
                {node.label}
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
                {node.sub}
              </p>
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
  const [toast, setToast] = useState(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = () => {
    try {
      navigator.clipboard.writeText('sujithreddy1546@gmail.com');
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
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
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
        #about,
        #about > .text-content.wide-content,
        #about > .text-content.wide-content > .reveal {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 0;
          height: 100%;
        }

        @media (min-width: 901px) {
          #about {
            height: calc(100vh - 80px);
            max-height: calc(100vh - 80px);
            overflow: hidden;
          }
          .ab-page {
            height: 100%;
            max-height: 100%;
            overflow: hidden;
            justify-content: space-between;
            gap: 4px;
          }
          .ab-bio-card { padding: 10px 14px; }
          .ab-row2 { padding: 8px 14px; }
          .ab-row3 { padding: 12px 20px; }
          .ab-github-wrapper { flex: 1; min-height: 0; overflow: hidden; }
        }

        /* ── Page shell ── */
        .ab-page {
          width: 100%;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 6px;
          box-sizing: border-box;
          padding-bottom: 0px;
          min-height: 0;
          height: 100%;
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

        /* ── ROW 1: Bio card + Stats ── */
        .ab-row1 {
          display: grid;
          grid-template-columns: 1fr 240px;
          gap: 8px;
          flex-shrink: 0;
        }

        /* Bio card */
        .ab-bio-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 12px 16px;
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }
        .ab-avatar {
          width: 52px; height: 52px; border-radius: 50%;
          object-fit: cover; flex-shrink: 0;
          border: 2px solid var(--border-color);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-blue) 12%, transparent);
        }
        .ab-bio-body { flex: 1; display: flex; flex-direction: column; gap: 8px; }
        .ab-bio-name {
          font-size: 14.5px; font-weight: 700;
          color: var(--text-primary); margin: 0; line-height: 1.4;
        }
        .ab-bio-desc {
          font-size: 12.5px; line-height: 1.5;
          color: var(--text-secondary); margin: 0;
        }
        .ab-badges { display: flex; gap: 6px; flex-wrap: wrap; }
        .ab-badge {
          display: inline-flex; padding: 3px 10px; border-radius: 999px;
          font-size: 11.5px; font-weight: 600; cursor: default;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .ab-badge:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .ab-chips { display: flex; gap: 7px; flex-wrap: wrap; }
        .ab-chip {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 5px 12px; border-radius: 10px;
          border: 1px solid var(--border-color); background: var(--bg-primary);
          font-size: 12px; font-weight: 600; color: var(--text-secondary);
          text-decoration: none; transition: all 0.18s;
        }
        .ab-chip:hover {
          border-color: var(--primary-blue); color: var(--primary-blue);
          background: color-mix(in srgb, var(--primary-blue) 5%, transparent);
        }

        /* Stats 2x2 grid */
        .ab-stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: 1fr 1fr;
          gap: 8px;
        }

        /* ── ROW 2: Timeline ── */
        .ab-row2 {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 10px 16px;
          flex-shrink: 0;
        }
        .ab-section-label {
          font-size: 13px; font-weight: 700;
          color: var(--text-secondary); margin: 0 0 12px;
          display: flex; align-items: center; gap: 6px;
        }

        /* ── ROW 3: CTA + Actions (Exact Reference Design) ── */
        .ab-row3 {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          background: color-mix(in srgb, var(--primary-blue) 4%, var(--bg-secondary));
          border: 1px solid color-mix(in srgb, var(--primary-blue) 15%, var(--border-color));
          border-radius: 16px;
          padding: 20px 28px;
          flex-shrink: 0;
          box-sizing: border-box;
        }
        .ab-cta-left { display: flex; flex-direction: column; gap: 4px; max-width: 540px; }
        .ab-cta-title {
          font-size: 16.5px; font-weight: 800;
          color: var(--text-primary); margin: 0;
          letter-spacing: -0.01em;
        }
        .ab-cta-sub {
          font-size: 13px; color: var(--text-secondary); margin: 0; line-height: 1.5;
        }
        .ab-actions-grid {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .ab-btn-primary {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          padding: 10px 20px; border-radius: 8px;
          background: var(--text-primary); color: var(--bg-primary);
          border: none; font-size: 13px; font-weight: 700; cursor: pointer;
          transition: all 0.2s ease; text-decoration: none; white-space: nowrap;
        }
        .ab-btn-primary:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        .ab-btn-secondary {
          display: inline-flex; align-items: center; justify-content: center; gap: 6px;
          padding: 10px 18px; border-radius: 8px;
          background: var(--bg-primary); color: var(--text-primary);
          border: 1px solid var(--border-color); font-size: 13px; font-weight: 600;
          cursor: pointer; transition: all 0.2s ease; text-decoration: none; white-space: nowrap;
        }
        .ab-btn-secondary:hover {
          border-color: var(--primary-blue);
          background: color-mix(in srgb, var(--primary-blue) 6%, transparent);
          transform: translateY(-1px);
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

        {/* ══════════ ROW 1: Bio + Stats ══════════ */}
        <div className="ab-row1">
          {/* Bio card */}
          <motion.div
            className="ab-bio-card"
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <img
              src="/profile_photo.png"
              alt="Sujith"
              className="ab-avatar"
              onError={e => { e.target.style.display = 'none'; }}
            />
            <div className="ab-bio-body">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                <h1 className="ab-bio-name">
                  Hi, I'm Sujith — a B.Tech student at VIT Vellore (8.7 CGPA) specializing in Data Science.
                </h1>
                {daysCoding > 0 && (
                  <div className="ab-days-badge" style={{ flexShrink: 0 }}>
                    <Zap size={10} /> {daysCoding.toLocaleString()}d
                  </div>
                )}
              </div>
              <p className="ab-bio-desc">
                Bridging complex backend data structures with sleek, responsive interfaces.
              </p>

              {/* Skill badges */}
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
          </motion.div>

          {/* Stats 2×2 */}
          <div className="ab-stats-grid">
            <StatCard target={3.5} suffix=""  label="Years coding" decimals={1} trigger={inView} delay={0.05} />
            <StatCard target={10}  suffix=""  label="Projects"     trigger={inView} delay={0.12} />
            <StatCard target={200} suffix=""  label="DSA solved"   trigger={inView} delay={0.18} />
            <StatCard target={8.7} suffix=""  label="CGPA"         decimals={1} trigger={inView} delay={0.24} />
          </div>
        </div>

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

        {/* ══════════ GitHub Activity Heatmap ══════════ */}
        <motion.div
          className="ab-github-wrapper"
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
        >
          <GitHubActivity hideCommits={true} />
        </motion.div>

        {/* ══════════ ROW 3: Advanced CTA + Action Buttons ══════════ */}
        <motion.div
          className="ab-row3"
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Left: CTA text + Live status pill */}
          <div className="ab-cta-left">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700,
                color: '#10b981', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)',
                padding: '3px 10px', borderRadius: 999, letterSpacing: '0.02em'
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
                Open for Full-Time Roles &amp; AI Projects
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>⚡ Avg response &lt; 2 hrs</span>
            </div>
            <h2 className="ab-cta-title">Let's build something great.</h2>
            <p className="ab-cta-sub">
              I'm always open to discussing Data Science, Machine Learning architecture, or exciting new engineering opportunities.
            </p>
          </div>

          {/* Right: Get in Touch + Resume + Copy Email buttons */}
          <div className="ab-actions-grid">
            <button
              className="ab-btn-primary"
              onClick={() => onNavClick ? onNavClick('contact') : (window.location.href = 'mailto:sujithreddy1546@gmail.com')}
            >
              Get in Touch <ArrowRight size={14} />
            </button>
            <a href="/resume.pdf" className="ab-btn-secondary" onClick={handleDownload}>
              <Download size={14} style={{ color: 'var(--primary-blue)' }} /> Resume
            </a>
            <button className="ab-btn-secondary" onClick={handleCopyEmail} title="Copy email address">
              {copiedEmail ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} style={{ color: 'var(--text-muted)' }} />}
              {copiedEmail ? 'Copied!' : 'Copy Email'}
            </button>
          </div>
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
