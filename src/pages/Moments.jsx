/**
 * Moments.jsx — Editorial Archival Scrapbook and Interactive Moments Showcase
 * Design: warm paper tones, Fraunces serif italic headlines, IBM Plex Mono stamps
 * Features:
 * - Horizontal film strip layout (zero vertical scroll)
 * - Lucide vector icons for search, navigation, clear, and share actions
 * - Smart deduplication and merge between Supabase DB and local defaults
 * - Safe image fallbacks and graceful error handling
 * - Interactive reactions with floating particle physics + LocalStorage persistence
 * - Story viewer modal with auto-advancing progress bars
 */
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ChevronLeft, ChevronRight, Check, Share2 } from 'lucide-react';
import useRealtimeData from '../hooks/useRealtimeData';
import { useTheme } from '../context/ThemeContext';

/* ─── Default Archival Moments — Sujith Thota ─────────────────────────────────── */
const DEFAULT_MOMENTS = [
  {
    id: 'dm1', type: 'milestone', featured: true, icon: '\uD83C\uDF93',
    title: 'Graduated from VIT Vellore',
    description: 'Officially a B.Tech graduate in Computer Science (Data Science). Four years of late nights, incredible people, and projects that actually shipped.',
    date: 'Aug 2026', year: 2026, location: 'VIT Vellore, Tamil Nadu', vibe: 'Viva La Vida',
    image_url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80',
    color: 'rust', tags: ['education', 'achievement', 'vit'],
    baseReactions: { love: 52, fire: 41, rocket: 33, clap: 64 },
  },
  {
    id: 'dm2', type: 'milestone', featured: true, icon: '\uD83D\uDCBC',
    title: 'First Full-Time Offer',
    description: 'Received my first full-time offer after months of prep. The grind was real \u2014 hundreds of DSA problems, mock interviews, and late-night prep sessions. It finally paid off.',
    date: 'Jul 2026', year: 2026, location: 'Bengaluru, India', vibe: 'Higher Ground',
    image_url: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1200&q=80',
    color: 'dusty', tags: ['career', 'achievement'],
    baseReactions: { love: 68, fire: 54, rocket: 72, clap: 85 },
  },
  {
    id: 'dm3', type: 'update', featured: false, icon: '\uD83D\uDE80',
    title: 'Launched this Portfolio',
    description: 'After weeks of building, this portfolio finally went live! Built with React, Vite, Framer Motion, and Supabase. Every component handcrafted \u2014 no templates, no shortcuts.',
    date: 'May 2025', year: 2025, location: 'Vellore, India', vibe: 'Midnight City',
    image_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
    color: 'dusty', tags: ['dev', 'project'],
    baseReactions: { love: 44, fire: 38, rocket: 60, clap: 42 },
  },
  {
    id: 'dm4', type: 'milestone', featured: false, icon: '\uD83C\uDFC6',
    title: 'Won Smart India Hackathon',
    description: '36 hours, three energy drinks, one broken laptop, and a demo that only worked because we refused to sleep. We walked out with the top prize.',
    date: 'Dec 2024', year: 2024, location: 'Hyderabad, India', vibe: 'Stronger',
    image_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    color: 'rust', tags: ['hackathon', 'achievement', 'team'],
    baseReactions: { love: 61, fire: 55, rocket: 40, clap: 48 },
  },
  {
    id: 'dm5', type: 'photo', featured: false, icon: '\uD83C\uDFD4\uFE0F',
    title: 'Ooty before sunrise',
    description: 'Cold enough to see your breath, quiet enough to hear the tea gardens wake up. Taken at 5am on the first day of break after exams.',
    date: 'Dec 2024', year: 2024, location: 'Ooty, Nilgiris', vibe: 'Holocene',
    image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    color: 'moss', tags: ['travel', 'nature'],
    baseReactions: { love: 38, fire: 12, rocket: 5, clap: 20 },
  },
  {
    id: 'dm6', type: 'photo', featured: false, icon: '\uD83C\uDF0A',
    title: 'Goa, off season',
    description: 'The beaches empty out in June. Nobody tells you it is beautiful because of the rain, not despite it. Best trip I never planned.',
    date: 'Jun 2024', year: 2024, location: 'Goa, India', vibe: 'Blue',
    image_url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
    color: 'moss', tags: ['travel'],
    baseReactions: { love: 29, fire: 8, rocket: 2, clap: 14 },
  },
  {
    id: 'dm7', type: 'update', featured: false, icon: '\uD83E\uDDE0',
    title: 'Built my first ML model in production',
    description: 'Deployed a sentiment analysis model that actually runs in the real world. First time seeing something I built used by strangers \u2014 surreal.',
    date: 'Sep 2024', year: 2024, location: 'VIT Vellore, India', vibe: 'Digital Love',
    image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    color: 'dusty', tags: ['ml', 'ai', 'dev'],
    baseReactions: { love: 35, fire: 44, rocket: 58, clap: 29 },
  },
  {
    id: 'dm8', type: 'quote', featured: false, icon: '\uD83D\uDCAD',
    title: 'On starting',
    description: 'You do not have to see the whole staircase, just take the first step. Carried this one through the hardest sprint of the year.',
    date: 'Mar 2025', year: 2025, location: 'Thought Log',
    image_url: null, color: 'plum', tags: ['inspiration'],
    baseReactions: { love: 70, fire: 9, rocket: 4, clap: 31 },
  },
  {
    id: 'dm9', type: 'photo', featured: false, icon: '\uD83C\uDF32',
    title: 'First solo trek, Coorg',
    description: 'Got lost for twenty minutes on the way down. Kept it out of the story I told everyone afterward. Would go again tomorrow.',
    date: 'Oct 2024', year: 2024, location: 'Coorg, Karnataka', vibe: 'Landslide',
    image_url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=1200&q=80',
    color: 'moss', tags: ['travel', 'nature'],
    baseReactions: { love: 41, fire: 10, rocket: 3, clap: 17 },
  },
];

/* ─── Color Palette Normalization ─────────────────────────────────────────────── */
const COLOR_MAP = {
  rust: 'rust', warning: 'rust', accent: 'dusty', dusty: 'dusty',
  success: 'moss', moss: 'moss', purple: 'plum', plum: 'plum', pink: 'plum',
};
function resolveColor(c) { return COLOR_MAP[c] || 'rust'; }

const FALLBACKS = {
  milestone: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80',
  update:    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
  photo:     'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
};

function normalizeTitle(t) {
  return (t || '')
    .toLowerCase()
    .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanTitleString(t) {
  return (t || '')
    .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
    .trim();
}

function resolveMomentImage(m) {
  if (m.image_url) return m.image_url;
  if (m.image) return m.image;
  if (m.type === 'quote') return null;
  const match = DEFAULT_MOMENTS.find(d => normalizeTitle(d.title) === normalizeTitle(m.title));
  if (match && match.image_url) return match.image_url;
  return FALLBACKS[m.type] || FALLBACKS.milestone;
}

/* ─── Reaction Config with Unicode Literals ──────────────────────────────────── */
const REACTIONS = [
  { key: 'love',   glyph: '\u2764\uFE0F', label: 'Love' },
  { key: 'fire',   glyph: '\uD83D\uDD25', label: 'Fire' },
  { key: 'rocket', glyph: '\uD83D\uDE80', label: 'Launch' },
  { key: 'clap',   glyph: '\uD83D\uDC4F', label: 'Clap' },
];

function spawnParticle(btnEl, glyph) {
  if (!btnEl) return;
  const p = document.createElement('span');
  p.className = 'arch-particle';
  p.textContent = glyph;
  p.style.left = (btnEl.offsetWidth / 2) + 'px';
  p.style.top = '0px';
  p.style.setProperty('--dx', (Math.random() * 34 - 17) + 'px');
  btnEl.appendChild(p);
  setTimeout(() => p.remove(), 900);
}

/* ─── Archival Story Modal ───────────────────────────────────────────────────── */
function ArchivalStoryModal({ moments, activeId, onClose, onNavigate }) {
  const index = moments.findIndex(m => m.id === activeId);
  const m = moments[Math.max(0, index)];
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);

  const goNext = useCallback(() => {
    if (index < moments.length - 1) onNavigate(moments[index + 1].id);
    else onClose();
  }, [index, moments, onNavigate, onClose]);

  const goPrev = useCallback(() => {
    if (index > 0) onNavigate(moments[index - 1].id);
  }, [index, moments, onNavigate]);

  useEffect(() => {
    setProgress(0);
    if (paused) return;
    const step = (50 / 5000) * 100;
    const timer = setInterval(() => {
      setProgress(p => {
        if (p + step >= 100) { goNext(); return 0; }
        return p + step;
      });
    }, 50);
    return () => clearInterval(timer);
  }, [m?.id, paused, goNext]);

  useEffect(() => {
    const handleKey = e => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === ' ') { e.preventDefault(); setPaused(p => !p); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, goNext, goPrev]);

  if (!m) return null;
  const img = resolveMomentImage(m);
  const col = resolveColor(m.color);

  return (
    <motion.div
      className="arch-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="story-card"
        initial={{ scale: 0.92, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 15 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        style={img ? {} : { background: `linear-gradient(135deg, var(--${col}), #1B1712)` }}
        onClick={e => e.stopPropagation()}
        onMouseDown={() => setPaused(true)}
        onMouseUp={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
      >
        {img && (
          <div
            className="story-bg-zoom"
            style={{ backgroundImage: `url(${img})` }}
          />
        )}
        <div className="story-scrim" />

        {/* Top Story Progress Bars */}
        <div className="story-bars">
          {moments.map((item, i) => (
            <div
              key={item.id}
              className={'story-bar' + (i < index ? ' done' : i === index ? ' current' : '')}
            >
              <div
                className="story-bar-fill"
                style={{ width: i === index ? `${progress}%` : i < index ? '100%' : '0%' }}
              />
            </div>
          ))}
        </div>

        {/* Top Header */}
        <div className="story-top">
          <div className="story-icon">{m.icon || '\u2728'}</div>
          <div>
            <div className="story-ttl">{m.title}</div>
            <div className="story-loc">{m.location || m.date}</div>
          </div>
          <button className="story-close" onClick={onClose} aria-label="Close story">
            <X size={18} />
          </button>
        </div>

        {/* Tap zones for quick mobile navigation */}
        <div className="story-tap-zone left" onClick={goPrev} />
        <div className="story-tap-zone right" onClick={goNext} />

        {/* Bottom Body */}
        <div className="story-body">
          {m.vibe && <div className="story-vibe">\u266A {m.vibe}</div>}
          <h3>{m.title}</h3>
          <p>{m.description}</p>
          <div className="story-loc" style={{ opacity: 0.75 }}>{m.date} \u2022 {m.location}</div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Metric Counter Hook & Component ────────────────────────────────────────── */
function useCountUp(target, duration = 650) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseInt(target, 10) || 0;
    if (end === 0) { setCount(0); return; }
    const stepTime = 16;
    const totalSteps = Math.max(1, Math.floor(duration / stepTime));
    const increment = end / totalSteps;
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, stepTime);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

function AnimatedMetric({ value, label }) {
  const display = useCountUp(value);
  return (
    <div className="mitem">
      <span className="mnum">{display.toLocaleString()}</span>
      <span className="mlbl">{label}</span>
    </div>
  );
}

/* ─── Main Moments Page — Film Strip ──────────────────────────────────────────── */
export default function Moments() {
  const { theme } = useTheme();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStoryId, setActiveStoryId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const stripRef = useRef(null);
  const CARD_W = 260;
  const CARD_GAP = 18;

  const { data: dbMoments } = useRealtimeData('moments', { orderColumn: 'display_order', ascending: true });

  const rawMoments = useMemo(() => {
    const defaultByNorm = new Map();
    DEFAULT_MOMENTS.forEach(d => {
      defaultByNorm.set(normalizeTitle(d.title), d);
    });

    if (!dbMoments || dbMoments.length === 0) {
      return DEFAULT_MOMENTS.map(m => ({
        ...m,
        color: resolveColor(m.color),
        _resolvedImg: resolveMomentImage(m),
        baseReactions: m.baseReactions || { love: 24, fire: 18, rocket: 15, clap: 30 },
      }));
    }

    const seen = new Set();
    const mergedDb = dbMoments.map(m => {
      const norm = normalizeTitle(m.title);
      seen.add(norm);
      const def = defaultByNorm.get(norm);
      const cleanedTitle = cleanTitleString(m.title) || def?.title || m.title;

      return {
        ...(def || {}),
        ...m,
        title: cleanedTitle,
        color: resolveColor(m.color || def?.color),
        icon: m.icon || def?.icon || '\u2728',
        image_url: m.image_url || def?.image_url,
        location: m.location || def?.location,
        vibe: m.vibe || def?.vibe,
        tags: (m.tags && m.tags.length > 0) ? m.tags : (def?.tags || []),
        baseReactions: m.baseReactions || def?.baseReactions || { love: 28, fire: 22, rocket: 19, clap: 35 },
      };
    });

    // Append any DEFAULT_MOMENTS that are not represented in the database
    const extras = DEFAULT_MOMENTS
      .filter(d => !seen.has(normalizeTitle(d.title)))
      .map(d => ({
        ...d,
        color: resolveColor(d.color),
        baseReactions: d.baseReactions || { love: 20, fire: 15, rocket: 10, clap: 25 },
      }));

    const combined = [...mergedDb, ...extras];
    return combined.map(m => ({
      ...m,
      _resolvedImg: resolveMomentImage(m),
    }));
  }, [dbMoments]);

  const [reactions, setReactions] = useState(() => {
    try {
      const saved = localStorage.getItem('portfolio_moments_reactions');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    const init = {};
    DEFAULT_MOMENTS.forEach(m => {
      init[m.id] = m.baseReactions || { love: 25, fire: 18, rocket: 14, clap: 32 };
    });
    return init;
  });

  const handleReact = useCallback((e, momentId, key, glyph) => {
    e.stopPropagation();
    const btn = e.currentTarget;
    btn.classList.add('popped');
    btn.style.position = 'relative';
    spawnParticle(btn, glyph);
    setTimeout(() => btn.classList.remove('popped'), 300);
    setReactions(prev => {
      const current = prev[momentId] || { love: 20, fire: 15, rocket: 10, clap: 25 };
      const updated = {
        ...prev,
        [momentId]: { ...current, [key]: (current[key] || 0) + 1 }
      };
      try { localStorage.setItem('portfolio_moments_reactions', JSON.stringify(updated)); } catch (_) {}
      return updated;
    });
  }, []);

  const handleCopyLink = (e, momentId) => {
    e.stopPropagation();
    try {
      navigator.clipboard.writeText(`${window.location.origin}/moments#${momentId}`);
      setCopiedId(momentId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (_) {}
  };

  const visible = useMemo(() => {
    return rawMoments.filter(m => {
      const matchTab =
        activeFilter === 'all' ? true :
        activeFilter === 'milestones' ? m.type === 'milestone' :
        activeFilter === 'travel' ? (m.tags?.some(t => ['travel', 'life', 'nature'].includes(t)) || m.type === 'photo') :
        activeFilter === 'inspirations' ? (m.type === 'quote' || m.tags?.includes('inspiration')) :
        activeFilter === 'dev' ? (m.tags?.some(t => ['dev', 'project', 'ml', 'ai', 'vit'].includes(t)) || m.type === 'update') :
        true;

      if (!matchTab) return false;
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      return (
        m.title?.toLowerCase().includes(q) ||
        m.description?.toLowerCase().includes(q) ||
        m.location?.toLowerCase().includes(q) ||
        m.tags?.some(t => t.toLowerCase().includes(q))
      );
    });
  }, [rawMoments, activeFilter, searchTerm]);

  const metrics = useMemo(() => {
    const total = rawMoments.length;
    const milestones = rawMoments.filter(m => m.type === 'milestone').length;
    const photos = rawMoments.filter(m => m.type === 'photo').length;
    const totalReactions = Object.values(reactions).reduce(
      (sum, r) => sum + Object.values(r || {}).reduce((s, n) => s + (Number(n) || 0), 0),
      0
    );
    return { total, milestones, photos, reactions: totalReactions || 1336 };
  }, [rawMoments, reactions]);

  const scrollToCard = useCallback((index) => {
    const strip = stripRef.current;
    if (!strip) return;
    const clamped = Math.max(0, Math.min(index, visible.length - 1));
    strip.scrollTo({ left: clamped * (CARD_W + CARD_GAP), behavior: 'smooth' });
    setActiveIndex(clamped);
  }, [visible.length, CARD_W, CARD_GAP]);

  /* ── Hijack vertical mouse wheel to scroll horizontally ── */
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const onWheel = (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        strip.scrollLeft += e.deltaY;
      }
    };
    strip.addEventListener('wheel', onWheel, { passive: false });
    return () => strip.removeEventListener('wheel', onWheel);
  }, []);

  /* ── Keyboard Navigation (← and →) ── */
  useEffect(() => {
    const onKey = (e) => {
      if (activeStoryId) return;
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (e.key === 'ArrowRight') scrollToCard(activeIndex + 1);
      if (e.key === 'ArrowLeft')  scrollToCard(activeIndex - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeIndex, activeStoryId, scrollToCard]);

  /* ── Track scroll position to update dots ── */
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const onScroll = () => {
      const idx = Math.round(strip.scrollLeft / (CARD_W + CARD_GAP));
      setActiveIndex(Math.max(0, Math.min(idx, visible.length - 1)));
    };
    strip.addEventListener('scroll', onScroll, { passive: true });
    return () => strip.removeEventListener('scroll', onScroll);
  }, [visible.length, CARD_W, CARD_GAP]);

  /* ── Reset scroll on filter change ── */
  useEffect(() => {
    const strip = stripRef.current;
    if (strip) strip.scrollLeft = 0;
    setActiveIndex(0);
  }, [activeFilter, searchTerm]);

  const renderReactions = (m) => {
    const r = reactions[m.id] || m.baseReactions || { love: 20, fire: 15, rocket: 10, clap: 25 };
    return (
      <div className="reactions" onClick={e => e.stopPropagation()}>
        {REACTIONS.map(({ key, glyph, label }) => (
          <button
            key={key}
            className="react-btn"
            onClick={e => handleReact(e, m.id, key, glyph)}
            title={'React ' + label}
            aria-label={'React ' + label}
          >
            <span className="react-glyph">{glyph}</span>
            <span>{r[key] || 0}</span>
          </button>
        ))}
      </div>
    );
  };

  const ROTS = [-0.8, 0.6, -0.5, 0.7, -0.3, 0.9, -0.6, 0.4, -0.7];

  return (
    <>
      <style>{ARCHIVAL_CSS}</style>
      <div className={'fs-page' + (theme === 'light' ? ' arch-light' : '')}>

        {/* ── 1. Compact Hero Header ── */}
        <div className="fs-header">
          <div className="fs-hero-left">
            <div className="hero-stamp-badge arch-anim-a">est. archive &mdash; updated live</div>
            <h1 className="fs-title arch-anim-b">Life in moments</h1>
          </div>
          <div className="fs-metrics arch-anim-c">
            <AnimatedMetric value={metrics.total} label="moments" />
            <AnimatedMetric value={metrics.milestones} label="milestones" />
            <AnimatedMetric value={metrics.photos} label="photos" />
            <AnimatedMetric value={metrics.reactions} label="reactions" />
          </div>
        </div>

        {/* ── 2. Toolbar: search + tabs + arrow nav ── */}
        <div className="fs-toolbar">
          <div className="search-line">
            <Search size={14} className="search-glyph" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="search a tag, place, title..."
            />
            {searchTerm && (
              <button className="clear-btn" onClick={() => setSearchTerm('')} aria-label="Clear search">
                <X size={12} />
              </button>
            )}
          </div>
          <div className="fs-tabs">
            {[
              ['all', 'all'],
              ['milestones', 'milestones'],
              ['travel', 'travel & life'],
              ['inspirations', 'inspirations'],
              ['dev', 'dev & projects'],
            ].map(([k, lbl]) => (
              <button
                key={k}
                className={'arch-tab' + (activeFilter === k ? ' active' : '')}
                onClick={() => setActiveFilter(k)}
              >
                {lbl}
              </button>
            ))}
          </div>
          <div className="fs-nav-ctrl">
            <button
              className="fs-nav-btn"
              onClick={() => scrollToCard(activeIndex - 1)}
              disabled={activeIndex === 0}
              aria-label="Previous card"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="fs-counter">
              {visible.length > 0 ? `${activeIndex + 1} / ${visible.length}` : '\u2014'}
            </span>
            <button
              className="fs-nav-btn"
              onClick={() => scrollToCard(activeIndex + 1)}
              disabled={activeIndex >= visible.length - 1}
              aria-label="Next card"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* ── 3. Horizontal Film Strip ── */}
        <div className="fs-strip" ref={stripRef}>
          {visible.length === 0 ? (
            <div className="fs-empty">
              <p className="empty-title">no moments found</p>
              <p className="empty-desc">Try clearing your search or switching tabs.</p>
              <button
                className="empty-reset"
                onClick={() => { setActiveFilter('all'); setSearchTerm(''); }}
              >
                clear filters
              </button>
            </div>
          ) : (
            <>
              {visible.map((m, i) => {
                const col = m.color;
                const img = m._resolvedImg;
                const rot = ROTS[i % ROTS.length];

                if (m.type === 'quote') {
                  return (
                    <div
                      key={m.id}
                      className="fs-card fs-quote-card"
                      style={{
                        '--accent': `var(--${col})`,
                        '--accent-ink': `var(--${col}-ink)`,
                        '--rot': rot + 'deg',
                      }}
                      onClick={() => setActiveStoryId(m.id)}
                    >
                      <div className="pin" />
                      <div className="fs-card-body">
                        <span className="quote-mark">&ldquo;</span>
                        <p className="fs-quote-text">{m.description}</p>
                        <div className="fs-card-meta">
                          {m.date}{m.location ? ` \u2022 ${m.location}` : ''}
                        </div>
                      </div>
                      <div className="ic-footer">
                        {renderReactions(m)}
                        <button
                          className="share-btn"
                          onClick={e => handleCopyLink(e, m.id)}
                          title={copiedId === m.id ? 'Copied!' : 'Copy link'}
                          aria-label="Copy link"
                        >
                          {copiedId === m.id ? <Check size={13} /> : <Share2 size={13} />}
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={m.id}
                    className={'fs-card' + (m.featured ? ' fs-featured' : '')}
                    style={{
                      '--accent': `var(--${col})`,
                      '--accent-ink': `var(--${col}-ink)`,
                      '--rot': rot + 'deg',
                    }}
                    onClick={() => setActiveStoryId(m.id)}
                  >
                    <div className="pin" />
                    {m.featured && (
                      <>
                        <div className="tape tl" />
                        <div className="tape br" />
                      </>
                    )}
                    <div className="fs-card-img">
                      {img ? (
                        <img
                          src={img}
                          alt={m.title}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80';
                          }}
                        />
                      ) : (
                        <div className="fs-img-placeholder">{m.icon || '\u2728'}</div>
                      )}
                      <div className="ic-icon-badge">{m.icon || '\u2728'}</div>
                      <div className="ic-stamp-date">{m.date}</div>
                    </div>
                    <div className="fs-card-body">
                      <h3 className="ic-title">{m.title}</h3>
                      <p className="fs-card-desc">{m.description}</p>
                      {(m.location || m.vibe) && (
                        <div className="fs-card-meta">
                          {[m.location, m.vibe].filter(Boolean).join(' \u2022 ')}
                        </div>
                      )}
                      {m.tags && m.tags.length > 0 && (
                        <div className="ic-tags">
                          {m.tags.slice(0, 3).map(t => (
                            <span key={t} className="tag">#{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="ic-footer">
                      {renderReactions(m)}
                      <button
                        className="share-btn"
                        onClick={e => handleCopyLink(e, m.id)}
                        title={copiedId === m.id ? 'Copied!' : 'Copy link'}
                        aria-label="Copy link"
                      >
                        {copiedId === m.id ? <Check size={13} /> : <Share2 size={13} />}
                      </button>
                    </div>
                  </div>
                );
              })}
              <div className="fs-strip-end" />
            </>
          )}
        </div>

        {/* ── 4. Progress Footer ── */}
        <div className="fs-footer">
          <div className="fs-dots">
            {visible.map((_, i) => (
              <button
                key={i}
                className={'fs-dot' + (i === activeIndex ? ' active' : '')}
                onClick={() => scrollToCard(i)}
                aria-label={`Go to moment ${i + 1}`}
              />
            ))}
          </div>
          <p className="fs-hint">scroll &bull; drag &bull; &larr; &rarr; to browse &bull; click any card to open full story</p>
        </div>

        {/* ── 5. Story Modal ── */}
        <AnimatePresence>
          {activeStoryId && (
            <ArchivalStoryModal
              key="story"
              moments={visible.length > 0 ? visible : rawMoments}
              activeId={activeStoryId}
              onClose={() => setActiveStoryId(null)}
              onNavigate={setActiveStoryId}
            />
          )}
        </AnimatePresence>

      </div>
    </>
  );
}

/* ─── Archival CSS Design System ──────────────────────────────────────────────── */
const ARCHIVAL_CSS = `
@keyframes fadeRise  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
@keyframes kenburns  { from { transform:scale(1.0) translate(0,0); } to { transform:scale(1.08) translate(-1%,-1%); } }
@keyframes archFloat { 0%{ opacity:1; transform:translate(0,0) scale(1); } 100%{ opacity:0; transform:translate(var(--dx),-46px) scale(1.4); } }
@keyframes dotPop    { 0%{ transform:scale(1); } 50%{ transform:scale(1.45); } 100%{ transform:scale(1.3); } }

.arch-anim-a { animation: fadeRise .5s ease both; }
.arch-anim-b { animation: fadeRise .6s .06s ease both; }
.arch-anim-c { animation: fadeRise .6s .12s ease both; }

/* Page parent overrides to ensure flawless desktop fit */
.main-content:has(#moments) {
  overflow-y: hidden !important;
}
#moments {
  display: flex !important;
  flex-direction: column !important;
  flex: 1 1 0% !important;
  min-height: 0 !important;
  height: 100% !important;
  padding: 0 !important;
  margin: 0 !important;
}

/* Page shell */
.fs-page {
  --ap-bg: #1B1712; --ap-paper: #241F18; --ap-paper-2: #2C261C; --ap-paper-3: #332C20;
  --ap-ink: #ECE4D2; --ap-ink-dim: #B4A891; --ap-ink-faint: #7A7060;
  --ap-line: rgba(236,228,210,0.12); --ap-line-strong: rgba(236,228,210,0.24);
  --ap-scrim: rgba(10,8,5,0.82);
  --rust: #D9744E; --rust-ink: #3A2018;
  --moss: #93B27E; --moss-ink: #20281B;
  --dusty: #69ABAE; --dusty-ink: #17282A;
  --plum: #BD93BD; --plum-ink: #2A1F2A;
  display: flex; flex-direction: column;
  height: 100%; overflow: hidden;
  color: var(--ap-ink); font-family: 'Inter', sans-serif;
  position: relative;
}
.fs-page::before {
  content: ''; position: absolute; inset: 0; z-index: 0; pointer-events: none;
  opacity: .04; mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
.fs-page > * { position: relative; z-index: 1; }
.fs-page.arch-light {
  --ap-bg: #EFE9DA; --ap-paper: #FBF8F0; --ap-paper-2: #F4EEE0; --ap-paper-3: #ECE4D0;
  --ap-ink: #241E14; --ap-ink-dim: #5E5745; --ap-ink-faint: #918970;
  --ap-line: rgba(36,30,20,0.14); --ap-line-strong: rgba(36,30,20,0.30);
  --ap-scrim: rgba(20,15,8,0.70);
  --rust: #AD4E2C; --rust-ink: #FBEDE6;
  --moss: #526F42; --moss-ink: #EBF1E4;
  --dusty: #3D7A7D; --dusty-ink: #E5F2F2;
  --plum: #7A537A; --plum-ink: #F7EDF7;
}

/* Header */
.fs-header {
  display: flex; align-items: flex-end; justify-content: space-between;
  padding: 18px 28px 12px;
  border-bottom: 1px solid var(--ap-line);
  flex-shrink: 0; background: var(--ap-bg);
}
.fs-hero-left { display: flex; flex-direction: column; gap: 4px; }
.hero-stamp-badge {
  display: inline-flex; align-items: center; gap: 6px;
  font-family: 'IBM Plex Mono', monospace; font-size: 10px;
  letter-spacing: .08em; text-transform: uppercase;
  color: var(--rust); background: var(--ap-paper-2);
  border: 1px dashed var(--rust); border-radius: 3px;
  padding: 2px 8px; width: fit-content;
}
.fs-title {
  font-family: 'Fraunces', serif; font-style: italic; font-size: 26px;
  font-weight: 500; margin: 0; color: var(--ap-ink); line-height: 1.15;
}
.fs-metrics { display: flex; gap: 24px; align-items: center; }
.mitem { text-align: right; }
.mnum {
  font-family: 'Fraunces', serif; font-size: 20px; font-weight: 500;
  display: block; color: var(--ap-ink); line-height: 1.1;
}
.mlbl {
  font-family: 'IBM Plex Mono', monospace; font-size: 9px; color: var(--ap-ink-faint);
  margin-top: 3px; letter-spacing: .04em; white-space: nowrap;
}

/* Toolbar */
.fs-toolbar {
  display: flex; align-items: center; gap: 14px;
  padding: 9px 28px;
  border-bottom: 1px solid var(--ap-line);
  flex-shrink: 0; background: var(--ap-bg);
}
.search-line {
  display: flex; align-items: center; gap: 7px;
  padding: 6px 10px; border: 1px solid var(--ap-line); border-radius: 5px;
  width: 200px; flex-shrink: 0; transition: border-color .15s ease;
  background: var(--ap-paper);
}
.search-line:focus-within { border-color: var(--rust); }
.search-glyph { color: var(--ap-ink-faint); flex-shrink: 0; display: flex; align-items: center; }
.search-line input {
  border: none; background: none; outline: none;
  color: var(--ap-ink); font-size: 12.5px; width: 100%; font-family: 'Inter', sans-serif;
}
.search-line input::placeholder { color: var(--ap-ink-faint); }
.clear-btn {
  background: none; border: none; color: var(--ap-ink-faint); cursor: pointer;
  padding: 0; display: flex; align-items: center; justify-content: center;
}
.clear-btn:hover { color: var(--ap-ink); }
.fs-tabs {
  display: flex; align-items: center; gap: 18px; flex: 1;
  overflow-x: auto; scrollbar-width: none;
}
.fs-tabs::-webkit-scrollbar { display: none; }
.arch-tab {
  font-family: 'IBM Plex Mono', monospace; font-size: 11.5px; letter-spacing: .02em;
  border: none; background: none; color: var(--ap-ink-faint); cursor: pointer;
  white-space: nowrap; padding: 2px 0 7px; position: relative;
  transition: color .15s ease;
}
.arch-tab::after {
  content: ''; position: absolute; left: 0; right: 0; bottom: 0; height: 2px;
  background: var(--rust); transform: scaleX(0); transform-origin: left;
  transition: transform .18s ease;
}
.arch-tab:hover { color: var(--ap-ink-dim); }
.arch-tab.active { color: var(--ap-ink); }
.arch-tab.active::after { transform: scaleX(1); }
.fs-nav-ctrl {
  display: flex; align-items: center; gap: 6px; flex-shrink: 0;
}
.fs-nav-btn {
  width: 30px; height: 30px; border-radius: 5px;
  border: 1px solid var(--ap-line); background: var(--ap-paper-2);
  color: var(--ap-ink); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all .15s ease;
}
.fs-nav-btn:hover:not(:disabled) { border-color: var(--rust); color: var(--rust); background: var(--ap-paper-3); }
.fs-nav-btn:disabled { opacity: .28; cursor: not-allowed; }
.fs-counter {
  font-family: 'IBM Plex Mono', monospace; font-size: 10.5px;
  color: var(--ap-ink-faint); min-width: 42px; text-align: center;
}

/* Film Strip Container */
.fs-strip {
  display: flex; gap: 18px;
  overflow-x: auto; overflow-y: hidden;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  padding: 20px 28px;
  flex: 1; align-items: stretch;
  -webkit-overflow-scrolling: touch;
}
.fs-strip::-webkit-scrollbar { display: none; }
.fs-strip-end { flex: 0 0 12px; }

/* Film Card */
.fs-card {
  flex: 0 0 260px;
  scroll-snap-align: start;
  background: var(--ap-paper);
  border: 1px solid var(--ap-line);
  border-radius: 6px; overflow: hidden;
  cursor: pointer; position: relative;
  display: flex; flex-direction: column;
  transform: rotate(var(--rot, 0deg));
  transition: border-color .18s ease, box-shadow .28s ease, transform .28s ease;
  will-change: transform;
}
.fs-card:hover {
  transform: translateY(-6px) rotate(0deg) !important;
  border-color: var(--ap-line-strong);
  box-shadow: 0 18px 40px rgba(0,0,0,.38);
  z-index: 4;
}
.fs-featured {
  box-shadow: 0 0 0 1.5px var(--accent, var(--rust)), 0 8px 24px rgba(0,0,0,.25);
}

/* Card image */
.fs-card-img {
  height: 142px; flex-shrink: 0;
  position: relative; overflow: hidden;
  background: var(--ap-paper-2);
}
.fs-card-img img {
  width: 100%; height: 100%; object-fit: cover;
  transition: transform .5s ease;
}
.fs-card:hover .fs-card-img img { transform: scale(1.06); }
.fs-img-placeholder {
  display: flex; align-items: center; justify-content: center;
  width: 100%; height: 100%; font-size: 32px;
}

/* Card body */
.fs-card-body {
  padding: 13px 15px 8px; flex: 1; overflow: hidden;
  display: flex; flex-direction: column;
}
.ic-title {
  font-family: 'Fraunces', serif; font-size: 15.5px; font-weight: 500;
  margin: 0 0 6px; line-height: 1.25; color: var(--ap-ink);
}
.fs-card-desc {
  font-size: 12px; color: var(--ap-ink-dim); line-height: 1.55;
  margin: 0 0 7px;
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
}
.fs-card-meta {
  font-family: 'IBM Plex Mono', monospace; font-size: 10px;
  color: var(--ap-ink-faint); margin-bottom: 7px; letter-spacing: .01em;
}
.ic-tags { display: flex; gap: 5px; flex-wrap: wrap; margin-top: auto; padding-top: 4px; }
.tag {
  font-family: 'IBM Plex Mono', monospace; font-size: 9.5px;
  padding: 2px 7px; border-radius: 3px;
  background: var(--ap-paper-2); color: var(--ap-ink-faint);
  border: 1px solid var(--ap-line);
}

/* Quote card variant */
.fs-quote-card { background: var(--ap-paper-2); }
.quote-mark {
  font-family: 'Fraunces', serif; font-size: 38px;
  color: var(--accent, var(--rust)); line-height: .75;
  display: block; margin-bottom: 8px; opacity: .8;
}
.fs-quote-text {
  font-family: 'Fraunces', serif; font-style: italic;
  font-size: 14.5px; line-height: 1.55; color: var(--ap-ink);
  margin: 0 0 10px; flex: 1;
}

/* Push pins & Washi tape */
.pin {
  position: absolute; top: 7px; left: 50%; transform: translateX(-50%);
  width: 9px; height: 9px; border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #fff, var(--rust) 60%, #4a1505 100%);
  box-shadow: 0 1px 3px rgba(0,0,0,.5); z-index: 3; pointer-events: none;
}
.tape {
  position: absolute; width: 60px; height: 20px; opacity: .55; z-index: 2;
  background: repeating-linear-gradient(45deg, var(--accent, var(--rust)), var(--accent, var(--rust)) 5px, transparent 5px, transparent 10px);
}
.tape.tl { top: -8px; left: -14px; transform: rotate(-40deg); }
.tape.br { bottom: -8px; right: -14px; transform: rotate(-40deg); }

/* Icon badge + stamp date */
.ic-icon-badge {
  position: absolute; top: 9px; left: 9px;
  width: 28px; height: 28px; border-radius: 50%;
  background: var(--ap-scrim);
  display: flex; align-items: center; justify-content: center; font-size: 13px;
}
.ic-stamp-date {
  position: absolute; top: 9px; right: 9px;
  font-family: 'IBM Plex Mono', monospace; font-size: 10px;
  padding: 3px 8px; border-radius: 3px;
  background: var(--ap-scrim); color: #fff; letter-spacing: .02em;
}

/* Footer reactions row */
.ic-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 14px 12px; flex-shrink: 0;
}
.reactions { display: flex; gap: 3px; }
.react-btn {
  border: 1px solid var(--ap-line); background: var(--ap-paper-2);
  border-radius: 5px; padding: 4px 7px; font-size: 11px;
  color: var(--ap-ink-dim); cursor: pointer;
  display: flex; align-items: center; gap: 4px;
  font-family: 'IBM Plex Mono', monospace;
  transition: all .15s ease; position: relative;
}
.react-glyph { font-size: 11.5px; }
.react-btn:hover { border-color: var(--ap-line-strong); color: var(--ap-ink); }
.react-btn.popped { border-color: var(--accent, var(--rust)); color: var(--accent, var(--rust)); transform: scale(1.12); }
.share-btn {
  border: none; background: none; color: var(--ap-ink-faint); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  padding: 5px; border-radius: 4px; transition: color .15s ease, background .15s ease;
}
.share-btn:hover { color: var(--ap-ink); background: var(--ap-paper-2); }
.arch-particle { position: absolute; pointer-events: none; font-size: 14px; animation: archFloat .9s ease-out forwards; }

/* Empty state */
.fs-empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  flex: 1; gap: 10px; text-align: center; min-width: 300px;
}
.empty-title {
  font-family: 'Fraunces', serif; font-style: italic; font-size: 20px; color: var(--ap-ink); margin: 0;
}
.empty-desc { font-size: 13px; color: var(--ap-ink-dim); margin: 0; }
.empty-reset {
  font-family: 'IBM Plex Mono', monospace; font-size: 11px;
  padding: 7px 16px; background: var(--rust); color: #fff;
  border: none; border-radius: 4px; cursor: pointer;
}

/* Progress Footer */
.fs-footer {
  display: flex; flex-direction: column; align-items: center; gap: 5px;
  padding: 7px 0 10px; flex-shrink: 0;
  border-top: 1px solid var(--ap-line);
}
.fs-dots { display: flex; gap: 5px; align-items: center; }
.fs-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--ap-line-strong); border: none; cursor: pointer;
  padding: 0; transition: all .22s ease;
}
.fs-dot.active {
  background: var(--rust); transform: scale(1.35);
  animation: dotPop .22s ease;
}
.fs-hint {
  font-family: 'IBM Plex Mono', monospace; font-size: 9.5px;
  color: var(--ap-ink-faint); margin: 0; letter-spacing: .025em;
}

/* Story Modal */
.arch-modal-overlay {
  position: fixed; inset: 0; background: rgba(6,4,2,0.92);
  z-index: 10000; display: flex; align-items: center; justify-content: center;
  padding: 16px; backdrop-filter: blur(8px);
}
.story-card {
  width: 380px; max-width: 92vw; height: 640px; max-height: 88vh;
  border-radius: 6px; overflow: hidden; position: relative;
  display: flex; flex-direction: column;
  box-shadow: 0 24px 64px rgba(0,0,0,.85);
}
.story-bg-zoom {
  position: absolute; inset: -4%;
  background-size: cover; background-position: center;
  animation: kenburns 6s ease-out forwards;
}
.story-scrim {
  position: absolute; inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,.65) 0%, transparent 32%, transparent 56%, rgba(0,0,0,.85) 100%);
}
.story-bars { display: flex; gap: 5px; padding: 14px 14px 0; position: relative; z-index: 2; }
.story-bar { flex: 1; height: 2px; background: rgba(255,255,255,.28); overflow: hidden; border-radius: 2px; }
.story-bar-fill { height: 100%; width: 0%; background: #fff; transition: width .05s linear; }
.story-bar.done .story-bar-fill { width: 100% !important; }
.story-top { display: flex; align-items: center; gap: 10px; padding: 12px 16px; position: relative; z-index: 2; }
.story-icon { width: 28px; height: 28px; border-radius: 50%; background: rgba(255,255,255,.18); display: flex; align-items: center; justify-content: center; font-size: 14px; }
.story-ttl { font-size: 13px; font-weight: 500; color: #fff; font-family: 'IBM Plex Mono', monospace; }
.story-loc { font-family: 'IBM Plex Mono', monospace; font-size: 10.5px; color: rgba(255,255,255,.6); }
.story-close {
  margin-left: auto; background: none; border: none; color: #fff;
  cursor: pointer; opacity: .85; display: flex; align-items: center; justify-content: center;
}
.story-close:hover { opacity: 1; }
.story-body { flex: 1; position: relative; z-index: 2; display: flex; flex-direction: column; justify-content: flex-end; padding: 22px; }
.story-body h3 { font-family: 'Fraunces', serif; font-style: italic; font-size: 24px; color: #fff; margin: 0 0 8px; line-height: 1.2; }
.story-body p { font-size: 13.5px; color: rgba(255,255,255,.85); line-height: 1.55; margin: 0 0 10px; }
.story-vibe { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: rgba(255,255,255,.7); margin-bottom: 6px; }
.story-tap-zone { position: absolute; top: 56px; bottom: 0; width: 35%; z-index: 3; cursor: pointer; }
.story-tap-zone.left { left: 0; }
.story-tap-zone.right { right: 0; }
`;
