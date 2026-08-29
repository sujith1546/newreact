/**
 * Moments.jsx — v3 Premium life-moments feed
 * Uses Supabase realtime via useRealtimeData (falls back to DEFAULT_MOMENTS)
 */
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollReveal } from '../components';
import useRealtimeData from '../hooks/useRealtimeData';

/* ─── Fallback data ──────────────────────────────────────────────────────── */
const DEFAULT_MOMENTS = [
  {
    id: 'moment-conv-2026', type: 'milestone', featured: true, icon: '🎓',
    title: 'Graduated from VIT Vellore',
    description: 'Four incredible years of sleepless nights, deadlines, and friendships that outlasted every all-nighter. Proudest moment of my life so far.',
    date: 'Aug 2026', year: '2026', tags: ['education', 'achievement'],
  },
  {
    id: 'moment-first-offer', type: 'milestone', featured: false, icon: '💼',
    title: 'First Full-Time Offer',
    description: 'Signed my offer letter — hundreds of DSA problems, mock interviews, and late-night prep sessions. It finally paid off.',
    date: 'Jul 2026', year: '2026', tags: ['career', 'achievement'],
  },
  {
    id: 'moment-quote-1', type: 'quote',
    description: '"The best way to predict the future is to invent it." — Alan Kay',
    date: 'Jun 2026', year: '2026', tags: ['inspiration'],
  },
  {
    id: 'moment-hackathon', type: 'milestone', featured: true, icon: '🏆',
    title: 'Won Smart India Hackathon',
    description: 'Our team of 6 built an AI-powered disaster response coordination platform in 36 hours. Won the national-level SIH 2025 finale.',
    date: 'Dec 2025', year: '2025', tags: ['achievement', 'ai'],
  },
  {
    id: 'moment-ooty', type: 'update', icon: '🏔️',
    title: 'Ooty Trip with the Squad ❤️',
    description: 'Took a much-needed break with college friends before placements kicked in. The Nilgiris fog, chai at every stop, and zero laptops for 3 days.',
    date: 'Oct 2025', year: '2025', tags: ['travel', 'life'],
  },
  {
    id: 'moment-quote-2', type: 'quote',
    description: '"It does not matter how slowly you go as long as you do not stop." — Confucius',
    date: 'Sep 2025', year: '2025', tags: ['inspiration'],
  },
  {
    id: 'moment-internship', type: 'milestone', featured: false, icon: '✅',
    title: 'Internship at Cognizant',
    description: 'Completed my 3-month internship working on ML-based document intelligence pipelines. Learned more in 3 months than in a year.',
    date: 'Aug 2025', year: '2025', tags: ['career', 'experience'],
  },
  {
    id: 'moment-portfolio', type: 'update', icon: '🚀',
    title: 'Launched this Portfolio',
    description: 'After weeks of building, this portfolio finally went live! Built with React, Vite, Framer Motion, and Supabase. Every component handcrafted.',
    date: 'May 2025', year: '2025', tags: ['project', 'dev'],
  },
];

/* ─── useCountUp ─────────────────────────────────────────────────────────── */
function useCountUp(target, durationMs = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    let raf;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return value;
}

/* ─── ParticleCanvas ─────────────────────────────────────────────────────── */
function ParticleCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let points = [];

    function resize() {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const N = 50;
      points = Array.from({ length: N }, () => ({
        x:  Math.random() * canvas.width,
        y:  Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
      }));
    }
    resize();
    window.addEventListener('resize', resize);

    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      points.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height)  p.vy *= -1;
      });
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const dx = points[i].x - points[j].x;
          const dy = points[i].y - points[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < 115) {
            ctx.strokeStyle = `rgba(180,170,255,${(1 - d / 115) * 0.22})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(points[j].x, points[j].y);
            ctx.stroke();
          }
        }
      }
      points.forEach(p => {
        ctx.fillStyle = 'rgba(220,215,255,0.75)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      });
      raf = requestAnimationFrame(tick);
    }
    tick();

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} className="mv3-canvas" />;
}

/* ─── Hero ───────────────────────────────────────────────────────────────── */
function Hero({ counts }) {
  const total      = useCountUp(counts.all);
  const milestones = useCountUp(counts.milestone);
  const quotes     = useCountUp(counts.quote);
  const photos     = useCountUp(counts.photo + counts.update);

  return (
    <section className="mv3-hero">
      <div className="mv3-orb mv3-orb1" />
      <div className="mv3-orb mv3-orb2" />
      <div className="mv3-orb mv3-orb3" />
      <ParticleCanvas />

      <div className="mv3-hero-inner">
        <motion.div className="mv3-kicker"
          initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8 }}>
          A life, in frames
        </motion.div>

        <motion.h1 className="mv3-h1"
          initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, delay: 0.15 }}>
          Moments
        </motion.h1>

        <motion.p className="mv3-sub"
          initial={{ opacity: 0, y: 14, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, delay: 0.28 }}>
          Convocations, milestones, travels &amp; everything in between
        </motion.p>

        <motion.div className="mv3-stats"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.44 }}>
          {[
            { num: total,      label: 'Moments'    },
            { num: milestones, label: 'Milestones' },
            { num: quotes,     label: 'Quotes'     },
            { num: photos,     label: 'Updates'    },
          ].map(s => (
            <div key={s.label} className="mv3-stat">
              <div className="mv3-stat-num">{s.num}</div>
              <div className="mv3-stat-label">{s.label}</div>
            </div>
          ))}
        </motion.div>

        <motion.div className="mv3-ruler"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.9, delay: 0.62, ease: [0.16,1,0.3,1] }}>
          <span className="mv3-ruler-start">May 2025</span>
          <span className="mv3-ruler-end">Aug 2026</span>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Filter Bar ─────────────────────────────────────────────────────────── */
const FILTERS = [
  { key: 'all',       label: 'All'        },
  { key: 'milestone', label: 'Milestones' },
  { key: 'quote',     label: 'Quotes'     },
  { key: 'photo',     label: 'Photos'     },
  { key: 'update',    label: 'Updates'    },
];

function FilterBar({ active, onChange }) {
  return (
    <div className="mv3-filters">
      {FILTERS.map(f => (
        <motion.button key={f.key}
          className={`mv3-chip${active === f.key ? ' mv3-chip--active' : ''}`}
          onClick={() => onChange(f.key)}
          whileTap={{ scale: 0.93 }}>
          {f.label}
        </motion.button>
      ))}
    </div>
  );
}

/* ─── Cards ──────────────────────────────────────────────────────────────── */
function MilestoneCard({ moment, onClick }) {
  return (
    <div className={`mv3-card${moment.featured ? ' mv3-card--featured' : ''}`}
      onClick={onClick} role="button" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}>
      {moment.featured && <span className="mv3-badge">★ Featured</span>}
      {moment.icon && <span className="mv3-icon">{moment.icon}</span>}
      <h3 className="mv3-card-title">{moment.title}</h3>
      <p className="mv3-card-desc">{moment.description}</p>
      <div className="mv3-card-meta">
        <span>📅 {moment.date}</span>
        {(moment.tags || []).map(t => <span key={t}>🏷 {t}</span>)}
      </div>
    </div>
  );
}

function QuoteCard({ moment, onClick }) {
  return (
    <div className="mv3-card mv3-card--quote"
      onClick={onClick} role="button" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}>
      <span className="mv3-qmark">&ldquo;</span>
      <p className="mv3-quote-text">{moment.description}</p>
      <div className="mv3-quote-who">— saved {moment.date}</div>
    </div>
  );
}

function PhotoCard({ moment, onClick }) {
  return (
    <div className="mv3-card mv3-card--photo"
      onClick={onClick} role="button" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}>
      <div className="mv3-photo-wrap">
        <span className="mv3-photo-pill">📷 Photo</span>
        {moment.image_url || moment.imageUrl
          ? <img src={moment.image_url || moment.imageUrl} alt={moment.title} loading="lazy" className="mv3-photo-img" />
          : <div className="mv3-photo-placeholder">📷 Photo coming soon</div>
        }
      </div>
      <div className="mv3-photo-body">
        <h3 className="mv3-card-title">{moment.title}</h3>
        <p className="mv3-card-desc">{moment.description}</p>
        <div className="mv3-card-meta">
          <span>📅 {moment.date}</span>
          {(moment.tags || []).map(t => <span key={t}>🏷 {t}</span>)}
        </div>
      </div>
    </div>
  );
}

function UpdateCard({ moment, onClick }) {
  return (
    <div className="mv3-card mv3-card--update"
      onClick={onClick} role="button" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}>
      {moment.icon && <span className="mv3-icon">{moment.icon}</span>}
      <h3 className="mv3-card-title">{moment.title}</h3>
      <p className="mv3-card-desc">{moment.description}</p>
      <div className="mv3-card-meta">
        <span>📅 {moment.date}</span>
        {(moment.tags || []).map(t => <span key={t}>🏷 {t}</span>)}
      </div>
    </div>
  );
}

function MomentCard({ moment, onClick }) {
  switch (moment.type) {
    case 'milestone': return <MilestoneCard moment={moment} onClick={onClick} />;
    case 'quote':     return <QuoteCard     moment={moment} onClick={onClick} />;
    case 'photo':     return <PhotoCard     moment={moment} onClick={onClick} />;
    case 'update':    return <UpdateCard    moment={moment} onClick={onClick} />;
    default:          return <MilestoneCard moment={moment} onClick={onClick} />;
  }
}

/* ─── Timeline ───────────────────────────────────────────────────────────── */
function Timeline({ moments, onOpen }) {
  const grouped = useMemo(() => {
    const out = [];
    let lastYear = null;
    moments.forEach((m, i) => {
      const yr = m.year ? String(m.year) : 'Other';
      if (yr !== lastYear) {
        out.push({ divider: true, year: yr, key: `divider-${yr}` });
        lastYear = yr;
      }
      out.push({ divider: false, moment: m, side: i % 2 === 0 ? 'left' : 'right', key: m.id });
    });
    return out;
  }, [moments]);

  return (
    <div className="mv3-timeline">
      <div className="mv3-spine" />
      {grouped.map(item =>
        item.divider ? (
          <div className="mv3-yr-divider" key={item.key}>{item.year}</div>
        ) : (
          <motion.div
            className={`mv3-row mv3-row--${item.side}`}
            key={item.key}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.52, ease: [0.16, 1, 0.3, 1] }}>
            <div className="mv3-card-slot">
              <MomentCard moment={item.moment} onClick={() => onOpen(item.moment)} />
            </div>
            <div className="mv3-dot-wrap">
              <div className="mv3-dot" />
            </div>
            <div className="mv3-spacer" />
          </motion.div>
        )
      )}
    </div>
  );
}

/* ─── Story Viewer ───────────────────────────────────────────────────────── */
function StoryViewer({ moments, activeId, onClose, onNavigate }) {
  const index   = moments.findIndex(m => m.id === activeId);
  const moment  = moments[index];

  const goNext = useCallback(() => { if (index < moments.length - 1) onNavigate(moments[index + 1].id); }, [index, moments, onNavigate]);
  const goPrev = useCallback(() => { if (index > 0) onNavigate(moments[index - 1].id); }, [index, moments, onNavigate]);

  // Touch swipe
  const touchX = useRef(null);
  const onTouchStart = e => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd   = e => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (dx > 50) goPrev();
    else if (dx < -50) goNext();
    touchX.current = null;
  };

  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape')     onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft')  goPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, goNext, goPrev]);

  if (!moment) return null;
  const imgSrc = moment.image_url || moment.imageUrl;

  return (
    <motion.div className="mv3-overlay"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <motion.div className="mv3-panel"
        initial={{ scale: 0.88, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.88, opacity: 0, y: 30 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="mv3-sv-head">
          <button className="mv3-sv-close" onClick={onClose} aria-label="Close">✕</button>
          <div className="mv3-sv-progress">
            <div className="mv3-sv-fill" style={{ width: `${((index + 1) / moments.length) * 100}%` }} />
          </div>
          <span className="mv3-sv-counter">{index + 1} / {moments.length}</span>
        </div>

        {/* Body */}
        <AnimatePresence mode="wait">
          <motion.div key={moment.id} className="mv3-sv-body"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.22 }}>
            {imgSrc && <img src={imgSrc} alt={moment.title} className="mv3-sv-photo" />}
            {moment.icon && <span className="mv3-sv-icon">{moment.icon}</span>}
            {moment.title && <h2 className="mv3-sv-title">{moment.title}</h2>}
            <p className="mv3-sv-desc">{moment.description}</p>
            <div className="mv3-sv-meta">
              <span>📅 {moment.date}</span>
              {(moment.tags || []).map(t => <span key={t}>🏷 {t}</span>)}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Nav */}
        <div className="mv3-sv-nav">
          <button className="mv3-sv-btn" onClick={goPrev} disabled={index === 0}>← Previous</button>
          <div className="mv3-sv-dots">
            {moments.map((_, i) => (
              <button key={i} className={`mv3-sv-dot${i === index ? ' mv3-sv-dot--on' : ''}`}
                onClick={() => onNavigate(moments[i].id)} aria-label={`Go to ${i + 1}`} />
            ))}
          </div>
          <button className="mv3-sv-btn" onClick={goNext} disabled={index === moments.length - 1}>Next →</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export default function Moments() {
  const [filter,   setFilter]   = useState('all');
  const [activeId, setActiveId] = useState(null);

  const { data: dbMoments } = useRealtimeData('moments', {
    orderColumn: 'display_order', ascending: true,
  });

  const raw = (dbMoments && dbMoments.length > 0) ? dbMoments : DEFAULT_MOMENTS;

  const filtered = useMemo(
    () => filter === 'all' ? raw : raw.filter(m => m.type === filter),
    [raw, filter]
  );

  const counts = useMemo(() => ({
    all:       raw.length,
    milestone: raw.filter(m => m.type === 'milestone').length,
    quote:     raw.filter(m => m.type === 'quote').length,
    photo:     raw.filter(m => m.type === 'photo').length,
    update:    raw.filter(m => m.type === 'update').length,
  }), [raw]);

  return (
    <>
      <style>{CSS}</style>
      <ScrollReveal>
        <div className="mv3-page">
          <Hero counts={counts} />
          <FilterBar active={filter} onChange={setFilter} />

          <AnimatePresence mode="wait">
            {filtered.length === 0 ? (
              <motion.div key="empty" className="mv3-empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <span style={{ fontSize: 36 }}>✨</span>
                <p>Nothing here yet — try a different filter.</p>
              </motion.div>
            ) : (
              <motion.div key={filter}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}>
                <Timeline moments={filtered} onOpen={m => setActiveId(m.id)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollReveal>

      <AnimatePresence>
        {activeId && (
          <StoryViewer
            key="story"
            moments={filtered}
            activeId={activeId}
            onClose={() => setActiveId(null)}
            onNavigate={setActiveId}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ─── CSS ────────────────────────────────────────────────────────────────── */
const CSS = `
/* Page shell */
.mv3-page { width: 100%; overflow-x: hidden; }
.mv3-page * { box-sizing: border-box; }

/* ── Hero — always dark, self-contained ────────────────────────────────────── */
.mv3-hero {
  position: relative;
  min-height: 480px;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  text-align: center; padding: 64px 24px 56px;
  overflow: hidden; border-radius: 22px; margin-bottom: 4px;
  background:
    radial-gradient(ellipse at 20% 20%, rgba(139,127,240,0.28), transparent 50%),
    radial-gradient(ellipse at 80% 30%, rgba(93,220,192,0.18), transparent 50%),
    radial-gradient(ellipse at 50% 90%, rgba(240,128,93,0.14), transparent 55%),
    #09090f;
}
.mv3-canvas { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
.mv3-orb {
  position: absolute; border-radius: 50%;
  filter: blur(52px); opacity: 0.45;
  animation: mv3-float 14s ease-in-out infinite;
  pointer-events: none;
}
.mv3-orb1 { width: 260px; height: 260px; background: #8b7ff0; top: -50px; left: 6%; }
.mv3-orb2 { width: 220px; height: 220px; background: #5ddcc0; bottom: -60px; right: 8%; animation-delay: 3s; }
.mv3-orb3 { width: 180px; height: 180px; background: #f0805d; top: 38%; left: 62%; animation-delay: 6s; }
@keyframes mv3-float {
  0%,100% { transform: translate(0,0) scale(1); }
  50%      { transform: translate(28px,-28px) scale(1.12); }
}
.mv3-hero-inner { position: relative; z-index: 2; }
.mv3-kicker { font-size: 12.5px; letter-spacing: 3.5px; color: rgba(255,255,255,0.45); text-transform: uppercase; margin-bottom: 12px; }
.mv3-h1 {
  font-size: clamp(48px, 8vw, 78px); font-weight: 800; margin: 0 0 10px;
  letter-spacing: -3px; line-height: 1;
  background: linear-gradient(120deg, #fff 10%, #b0aaff 55%, #5ddcc0 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.mv3-sub { color: rgba(255,255,255,0.45); font-size: 16px; font-style: italic; margin: 0; }

/* Hero stats */
.mv3-stats { display: flex; gap: 12px; margin-top: 36px; flex-wrap: wrap; justify-content: center; }
.mv3-stat {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  backdrop-filter: blur(12px);
  border-radius: 14px; padding: 16px 24px; min-width: 100px; text-align: center;
  transition: transform 0.22s ease, border-color 0.22s ease;
}
.mv3-stat:hover { transform: translateY(-4px); border-color: rgba(139,127,240,0.6); }
.mv3-stat-num   { font-size: 28px; font-weight: 800; color: #fff; line-height: 1; }
.mv3-stat-label { font-size: 11.5px; color: rgba(255,255,255,0.4); margin-top: 3px; letter-spacing: 0.3px; }

/* Hero ruler */
.mv3-ruler {
  margin: 36px auto 0; width: min(520px, 80%); height: 2px;
  background: linear-gradient(90deg, #8b7ff0, #5ddcc0);
  border-radius: 2px; position: relative; transform-origin: left center;
}
.mv3-ruler::before, .mv3-ruler::after {
  content: ''; position: absolute; width: 10px; height: 10px;
  border-radius: 50%; top: 50%; transform: translateY(-50%);
}
.mv3-ruler::before { left: -5px; background: #8b7ff0; box-shadow: 0 0 14px 3px rgba(139,127,240,0.7); }
.mv3-ruler::after  { right: -5px; background: #5ddcc0; box-shadow: 0 0 14px 3px rgba(93,220,192,0.7); }
.mv3-ruler-start, .mv3-ruler-end { position: absolute; top: 12px; font-size: 11px; color: rgba(255,255,255,0.35); white-space: nowrap; }
.mv3-ruler-start { left: 0; }
.mv3-ruler-end   { right: 0; }

/* ── Filters — theme-aware ─────────────────────────────────────────────────── */
.mv3-filters { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; margin: 32px 0 0; padding: 0 16px; }
.mv3-chip {
  border: 1px solid var(--border-color);
  background: var(--card-bg);
  color: var(--text-secondary);
  padding: 8px 18px; border-radius: 20px;
  font-size: 13px; font-weight: 600; cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: all 0.18s ease;
}
.mv3-chip:hover { color: #8b7ff0; border-color: rgba(139,127,240,0.5); }
.mv3-chip--active {
  color: #ffffff !important;
  border-color: transparent !important;
  background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
  box-shadow: 0 4px 14px rgba(99,102,241,0.35);
}

/* ── Timeline ──────────────────────────────────────────────────────────────── */
.mv3-timeline { max-width: 900px; margin: 48px auto 60px; padding: 0 20px; position: relative; }
.mv3-spine {
  position: absolute; left: 50%; top: 0; bottom: 0; width: 2px;
  transform: translateX(-50%);
  background: linear-gradient(180deg, #8b7ff0, #5ddcc0, #f0805d);
  box-shadow: 0 0 12px 2px rgba(139,127,240,0.22);
  pointer-events: none;
}

/* Year chapter dividers */
.mv3-yr-divider {
  text-align: center;
  font-size: clamp(52px, 9vw, 82px);
  font-weight: 900;
  letter-spacing: 6px; margin: 36px 0 6px;
  position: relative; z-index: 1;
  user-select: none;
  color: var(--text-muted);
  opacity: 0.18;
}

/* Timeline rows */
.mv3-row { display: grid; grid-template-columns: 1fr 40px 1fr; align-items: start; margin: 32px 0; position: relative; z-index: 1; }
.mv3-row--left  .mv3-card-slot { grid-column: 1; padding-right: 20px; }
.mv3-row--left  .mv3-dot-wrap  { grid-column: 2; }
.mv3-row--left  .mv3-spacer    { grid-column: 3; }
.mv3-row--right .mv3-card-slot { grid-column: 3; padding-left: 20px; }
.mv3-row--right .mv3-dot-wrap  { grid-column: 2; }
.mv3-row--right .mv3-spacer    { grid-column: 1; }
.mv3-dot-wrap { display: flex; align-items: flex-start; justify-content: center; padding-top: 22px; }
.mv3-dot {
  width: 14px; height: 14px; border-radius: 50%;
  background: #8b7ff0;
  border: 3px solid var(--bg-primary);
  box-shadow: 0 0 0 2px #8b7ff0, 0 0 16px 4px rgba(139,127,240,0.5);
  flex-shrink: 0;
  animation: mv3-dot-pulse 2.5s ease-in-out infinite;
}
@keyframes mv3-dot-pulse {
  0%,100% { box-shadow: 0 0 0 2px #8b7ff0, 0 0 10px 3px rgba(139,127,240,0.35); }
  50%     { box-shadow: 0 0 0 3px #8b7ff0, 0 0 22px 6px rgba(139,127,240,0.65); }
}

/* ── Cards — theme-aware ───────────────────────────────────────────────────── */
.mv3-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px; padding: 20px 22px;
  cursor: pointer; position: relative; overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease;
}
.mv3-card:hover {
  transform: translateY(-4px);
  border-color: rgba(139,127,240,0.5);
  box-shadow: 0 14px 36px -10px rgba(139,127,240,0.25), var(--shadow-md);
}

/* Featured shimmer border */
.mv3-card--featured {
  border: 2px solid transparent !important;
  background-origin: border-box !important;
  background-clip: padding-box, border-box !important;
  background-image:
    linear-gradient(var(--card-bg), var(--card-bg)),
    linear-gradient(var(--mv3-angle, 0deg), #8b7ff0, #f0c674, #5ddcc0, #f0805d, #8b7ff0) !important;
  animation: mv3-shimmer-rotate 5s linear infinite;
}
@property --mv3-angle { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
@keyframes mv3-shimmer-rotate { to { --mv3-angle: 360deg; } }

.mv3-badge { display: inline-block; font-size: 11px; padding: 3px 10px; border-radius: 20px; background: rgba(245,158,11,0.15); color: #d97706; margin-bottom: 8px; letter-spacing: 0.4px; font-weight: 700; }
.mv3-icon       { font-size: 24px; margin-bottom: 6px; display: block; }
.mv3-card-title { margin: 4px 0 6px; font-size: 17px; font-weight: 700; color: var(--text-primary); line-height: 1.3; }
.mv3-card-desc  { margin: 0; color: var(--text-secondary); font-size: 13.5px; line-height: 1.6; }
.mv3-card-meta  { margin-top: 12px; font-size: 11.5px; color: var(--text-muted); display: flex; gap: 10px; flex-wrap: wrap; }

/* Quote */
.mv3-card--quote { text-align: center; background: var(--card-bg) !important; }
.mv3-qmark      { font-size: 48px; line-height: 0.8; color: #8b7ff0; opacity: 0.7; display: block; margin-bottom: 10px; }
.mv3-quote-text { font-style: italic; font-size: 16px; color: var(--text-primary); line-height: 1.65; margin: 0; font-weight: 500; }
.mv3-quote-who  { margin-top: 12px; font-size: 12px; color: var(--text-muted); }

/* Photo */
.mv3-card--photo { padding: 0; }
.mv3-photo-wrap { position: relative; width: 100%; height: 190px; overflow: hidden; border-radius: 16px 16px 0 0; background: var(--bg-primary); }
.mv3-photo-img  { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 5s ease; }
.mv3-card--photo:hover .mv3-photo-img { transform: scale(1.12); }
.mv3-photo-wrap::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, transparent 45%, rgba(0,0,0,0.45) 100%); }
.mv3-photo-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: var(--text-muted); font-size: 14px; gap: 8px; }
.mv3-photo-pill { position: absolute; top: 10px; left: 10px; z-index: 2; background: rgba(0,0,0,0.55); backdrop-filter: blur(6px); padding: 4px 10px; border-radius: 20px; font-size: 11px; color: #ffffff; font-weight: 600; }
.mv3-photo-body { padding: 14px 18px 18px; }

/* Update */
.mv3-card--update {
  border-left: 4px solid #10b981 !important;
  border-radius: 4px 16px 16px 4px !important;
}

/* ── Story Viewer — theme-aware ────────────────────────────────────────────── */
.mv3-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,0.65); backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.mv3-panel {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 22px; width: min(560px, 100%);
  max-height: 90vh; overflow-y: auto;
  padding: 0; display: flex; flex-direction: column;
  box-shadow: 0 32px 80px rgba(0,0,0,0.35), 0 0 40px rgba(139,127,240,0.15);
}
.mv3-sv-head {
  display: flex; align-items: center; gap: 12px;
  padding: 16px 20px 10px; flex-shrink: 0;
}
.mv3-sv-close {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  color: var(--text-secondary); font-size: 15px;
  width: 32px; height: 32px; border-radius: 50%;
  cursor: pointer; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.mv3-sv-close:hover { background: rgba(239,68,68,0.1); color: #ef4444; border-color: rgba(239,68,68,0.35); }
.mv3-sv-progress {
  flex: 1; height: 4px; background: var(--border-color);
  border-radius: 3px; overflow: hidden;
}
.mv3-sv-fill {
  height: 100%; background: linear-gradient(90deg, #8b7ff0, #5ddcc0);
  border-radius: 3px; transition: width 0.3s ease;
}
.mv3-sv-counter { font-size: 12px; color: var(--text-muted); font-weight: 600; white-space: nowrap; }
.mv3-sv-body {
  padding: 8px 28px 20px; text-align: center; flex: 1;
}
.mv3-sv-photo  { width: 100%; border-radius: 12px; margin-bottom: 16px; max-height: 260px; object-fit: cover; }
.mv3-sv-icon   { font-size: 42px; display: block; margin-bottom: 12px; }
.mv3-sv-title  { font-size: 22px; font-weight: 800; color: var(--text-primary); margin: 0 0 10px; line-height: 1.25; }
.mv3-sv-desc   { color: var(--text-secondary); line-height: 1.7; font-size: 14px; margin: 0; }
.mv3-sv-meta   { margin-top: 16px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; font-size: 12px; color: var(--text-muted); }
.mv3-sv-nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 20px 18px;
  border-top: 1px solid var(--border-color); flex-shrink: 0;
}
.mv3-sv-btn {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 8px 18px; border-radius: 10px;
  cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.16s;
}
.mv3-sv-btn:hover:not(:disabled) { border-color: rgba(139,127,240,0.6); color: #8b7ff0; }
.mv3-sv-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.mv3-sv-dots { display: flex; gap: 5px; align-items: center; }
.mv3-sv-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--border-color); border: none; padding: 0;
  cursor: pointer; transition: all 0.15s;
}
.mv3-sv-dot--on { width: 20px; border-radius: 4px; background: #8b7ff0; }

/* ── Empty ───────────────────────────────────────────────────────────────── */
.mv3-empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 12px; padding: 80px 20px; text-align: center;
  color: var(--text-muted); font-size: 14px;
  border: 1px dashed var(--border-color); border-radius: 18px;
  background: var(--card-bg);
}

/* ── Responsive ──────────────────────────────────────────────────────────── */
@media (max-width: 700px) {
  .mv3-spine { left: 20px; }
  .mv3-timeline { padding: 0 12px; }
  .mv3-row {
    grid-template-columns: 36px 1fr !important;
  }
  .mv3-row--left  .mv3-card-slot,
  .mv3-row--right .mv3-card-slot { grid-column: 2; padding: 0 0 0 12px; }
  .mv3-row--left  .mv3-dot-wrap,
  .mv3-row--right .mv3-dot-wrap  { grid-column: 1; }
  .mv3-row--left  .mv3-spacer,
  .mv3-row--right .mv3-spacer    { display: none; }
}
`;
