/**
 * Moments.jsx — Editorial Archival Scrapbook & Motion Carousel with Lightbox
 * Design: Motion Carousel with floating thumbnail scrubber dock & shared layout lightbox
 * Features:
 * - Centered active stage carousel with peek adjacent slides & spring physics
 * - Smooth drag / swipe gestures + keyboard arrow navigation
 * - Floating glassmorphism thumbnail scrubber dock with active indicator ring
 * - Seamless shared-element Lightbox overlay with full-res imagery, story narratives, and vibe tags
 * - Interactive reactions with floating particle physics + LocalStorage persistence
 * - Realtime sync with Supabase and smart deduplication with local defaults
 * - Light / Dark mode responsive archival styling
 */
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  Share2,
  Maximize2,
  MapPin,
  Music,
  Calendar,
  Sparkles,
} from 'lucide-react';
import useRealtimeData from '../hooks/useRealtimeData';
import { useTheme } from '../context/ThemeContext';

/* ─── Default Archival Moments — Sujith Thota ─────────────────────────────────── */
const DEFAULT_MOMENTS = [
  {
    id: 'dm1', type: 'milestone', featured: true, icon: '🎓',
    title: 'Graduated from VIT Vellore',
    description: 'Officially a B.Tech graduate in Computer Science (Data Science). Four years of late nights, incredible people, and projects that actually shipped.',
    date: 'Aug 2026', year: 2026, location: 'VIT Vellore, Tamil Nadu', vibe: 'Viva La Vida',
    image_url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1400&q=85',
    color: 'rust', tags: ['education', 'achievement', 'vit'],
    baseReactions: { love: 52, fire: 41, rocket: 33, clap: 64 },
  },
  {
    id: 'dm2', type: 'milestone', featured: true, icon: '💼',
    title: 'First Full-Time Offer',
    description: 'Received my first full-time offer after months of prep. The grind was real — hundreds of DSA problems, mock interviews, and late-night prep sessions. It finally paid off.',
    date: 'Jul 2026', year: 2026, location: 'Bengaluru, India', vibe: 'Higher Ground',
    image_url: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1400&q=85',
    color: 'dusty', tags: ['career', 'achievement'],
    baseReactions: { love: 68, fire: 54, rocket: 72, clap: 85 },
  },
  {
    id: 'dm3', type: 'update', featured: false, icon: '🚀',
    title: 'Launched this Portfolio',
    description: 'After weeks of building, this portfolio finally went live! Built with React, Vite, Framer Motion, and Supabase. Every component handcrafted — no templates, no shortcuts.',
    date: 'May 2025', year: 2025, location: 'Vellore, India', vibe: 'Midnight City',
    image_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=85',
    color: 'dusty', tags: ['dev', 'project'],
    baseReactions: { love: 44, fire: 38, rocket: 60, clap: 42 },
  },
  {
    id: 'dm4', type: 'milestone', featured: false, icon: '🏆',
    title: 'Won Smart India Hackathon',
    description: '36 hours, three energy drinks, one broken laptop, and a demo that only worked because we refused to sleep. We walked out with the top prize.',
    date: 'Dec 2024', year: 2024, location: 'Hyderabad, India', vibe: 'Stronger',
    image_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1400&q=85',
    color: 'rust', tags: ['hackathon', 'achievement', 'team'],
    baseReactions: { love: 61, fire: 55, rocket: 40, clap: 48 },
  },
  {
    id: 'dm5', type: 'photo', featured: false, icon: '🏔️',
    title: 'Ooty before sunrise',
    description: 'Cold enough to see your breath, quiet enough to hear the tea gardens wake up. Taken at 5am on the first day of break after exams.',
    date: 'Dec 2024', year: 2024, location: 'Ooty, Nilgiris', vibe: 'Holocene',
    image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1400&q=85',
    color: 'moss', tags: ['travel', 'nature'],
    baseReactions: { love: 38, fire: 12, rocket: 5, clap: 20 },
  },
  {
    id: 'dm6', type: 'photo', featured: false, icon: '🌊',
    title: 'Goa, off season',
    description: 'The beaches empty out in June. Nobody tells you it is beautiful because of the rain, not despite it. Best trip I never planned.',
    date: 'Jun 2024', year: 2024, location: 'Goa, India', vibe: 'Blue',
    image_url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1400&q=85',
    color: 'moss', tags: ['travel'],
    baseReactions: { love: 29, fire: 8, rocket: 2, clap: 14 },
  },
  {
    id: 'dm7', type: 'update', featured: false, icon: '🧠',
    title: 'Built my first ML model in production',
    description: 'Deployed a sentiment analysis model that actually runs in the real world. First time seeing something I built used by strangers — surreal.',
    date: 'Sep 2024', year: 2024, location: 'VIT Vellore, India', vibe: 'Digital Love',
    image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=85',
    color: 'dusty', tags: ['ml', 'ai', 'dev'],
    baseReactions: { love: 35, fire: 44, rocket: 58, clap: 29 },
  },
  {
    id: 'dm8', type: 'quote', featured: false, icon: '💭',
    title: 'On starting',
    description: 'You do not have to see the whole staircase, just take the first step. Carried this one through the hardest sprint of the year.',
    date: 'Mar 2025', year: 2025, location: 'Thought Log', vibe: 'Midnight Calm',
    image_url: null, color: 'plum', tags: ['inspiration'],
    baseReactions: { love: 70, fire: 9, rocket: 4, clap: 31 },
  },
  {
    id: 'dm9', type: 'photo', featured: false, icon: '🌲',
    title: 'First solo trek, Coorg',
    description: 'Got lost for twenty minutes on the way down. Kept it out of the story I told everyone afterward. Would go again tomorrow.',
    date: 'Oct 2024', year: 2024, location: 'Coorg, Karnataka', vibe: 'Landslide',
    image_url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=1400&q=85',
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
  milestone: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1400&q=85',
  update:    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=85',
  photo:     'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1400&q=85',
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
  { key: 'love',   glyph: '❤️', label: 'Love' },
  { key: 'fire',   glyph: '🔥', label: 'Fire' },
  { key: 'rocket', glyph: '🚀', label: 'Launch' },
  { key: 'clap',   glyph: '👏', label: 'Clap' },
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

/* ─── Motion Lightbox Overlay Component ───────────────────────────────────────── */
function MotionLightbox({
  moment,
  allMoments,
  currentIndex,
  onClose,
  onNavigate,
  reactions,
  onReact,
  onCopyLink,
  copiedId,
}) {
  const img = moment ? resolveMomentImage(moment) : null;
  const col = moment ? resolveColor(moment.color) : 'rust';
  const total = allMoments.length;

  const goNext = useCallback(() => {
    if (currentIndex < total - 1) onNavigate(currentIndex + 1);
    else onNavigate(0);
  }, [currentIndex, total, onNavigate]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) onNavigate(currentIndex - 1);
    else onNavigate(total - 1);
  }, [currentIndex, total, onNavigate]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, goNext, goPrev]);

  if (!moment) return null;

  const currentReactions = reactions[moment.id] || moment.baseReactions || { love: 20, fire: 15, rocket: 10, clap: 25 };

  return (
    <motion.div
      className="lb-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      onClick={onClose}
    >
      {/* Top Bar Navigation */}
      <div className="lb-topbar" onClick={(e) => e.stopPropagation()}>
        <div className="lb-top-left">
          <span className="lb-counter">
            {String(currentIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
          <span className="lb-title-badge">{moment.title}</span>
        </div>
        <div className="lb-top-actions">
          <button
            className="lb-action-btn"
            onClick={(e) => onCopyLink(e, moment.id)}
            title="Share Moment"
          >
            {copiedId === moment.id ? <Check size={15} /> : <Share2 size={15} />}
            <span className="lb-btn-text">{copiedId === moment.id ? 'Copied' : 'Share'}</span>
          </button>
          <button
            className="lb-close-btn"
            onClick={onClose}
            aria-label="Close Lightbox"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Content Stage */}
      <div className="lb-stage" onClick={(e) => e.stopPropagation()}>
        {/* Left Arrow */}
        <button
          className="lb-arrow lb-arrow-prev"
          onClick={goPrev}
          aria-label="Previous Moment"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Central Display Card */}
        <motion.div
          layoutId={`moment-frame-${moment.id}`}
          className="lb-card"
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        >
          {img ? (
            <div className="lb-media-wrap">
              <img
                src={img}
                alt={moment.title}
                className="lb-main-image"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = FALLBACKS[moment.type] || FALLBACKS.milestone;
                }}
              />
              <div className="lb-media-scrim" />
            </div>
          ) : (
            <div
              className="lb-quote-canvas"
              style={{
                background: `radial-gradient(circle at 50% 20%, rgba(189,147,189,0.2) 0%, rgba(27,23,18,0.95) 75%)`,
              }}
            >
              <span className="lb-quote-mark">&ldquo;</span>
              <p className="lb-quote-text">{moment.description}</p>
            </div>
          )}

          {/* Details Overlay Drawer */}
          <div className="lb-details-sheet">
            <div className="lb-meta-strip">
              <div className="lb-meta-pill">
                <Calendar size={12} />
                <span>{moment.date}</span>
              </div>
              {moment.location && (
                <div className="lb-meta-pill">
                  <MapPin size={12} />
                  <span>{moment.location}</span>
                </div>
              )}
              {moment.vibe && (
                <div className="lb-meta-pill vibe">
                  <Music size={12} />
                  <span>{moment.vibe}</span>
                </div>
              )}
            </div>

            <h2 className="lb-headline">{moment.title}</h2>
            {/* Always show description — for quote cards the quote canvas above already shows it,
                but the details sheet should show it anyway for navigation context */}
            <p className="lb-caption">{moment.description}</p>

            {moment.tags && moment.tags.length > 0 && (
              <div className="lb-tag-row">
                {moment.tags.map((tag) => (
                  <span key={tag} className="lb-tag-badge">#{tag}</span>
                ))}
              </div>
            )}

            {/* Reactions bar inside Lightbox */}
            <div className="lb-reactions-row">
              <div className="lb-reactions-track">
                {REACTIONS.map(({ key, glyph, label }) => (
                  <button
                    key={key}
                    className="react-btn lb-react-btn"
                    onClick={(e) => onReact(e, moment.id, key, glyph)}
                    title={`React with ${label}`}
                  >
                    <span className="react-glyph">{glyph}</span>
                    <span>{currentReactions[key] || 0}</span>
                  </button>
                ))}
              </div>
              <div className="lb-esc-hint">Press Esc to exit</div>
            </div>
          </div>
        </motion.div>

        {/* Right Arrow */}
        <button
          className="lb-arrow lb-arrow-next"
          onClick={goNext}
          aria-label="Next Moment"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Bottom Mini Lightbox Scrubber */}
      <div className="lb-bottom-dock" onClick={(e) => e.stopPropagation()}>
        <div className="lb-dock-track">
          {allMoments.map((item, idx) => {
            const isSelected = idx === currentIndex;
            const thumbImg = resolveMomentImage(item);
            return (
              <button
                key={item.id}
                className={`lb-dock-thumb ${isSelected ? 'active' : ''}`}
                onClick={() => onNavigate(idx)}
                aria-label={`View ${item.title}`}
              >
                {thumbImg ? (
                  <img src={thumbImg} alt={item.title} />
                ) : (
                  <div className="lb-dock-placeholder">{item.icon || '💬'}</div>
                )}
                {isSelected && (
                  <motion.div
                    layoutId="lb-dock-ring"
                    className="lb-dock-ring"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Main Moments Page — Motion Carousel + Lightbox ───────────────────────────── */
export default function Moments() {
  const { theme } = useTheme();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeLightboxId, setActiveLightboxId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const containerRef = useRef(null);
  const thumbDockRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(1100);

  // Sync real-time DB moments with fallback defaults
  const { data: dbMoments } = useRealtimeData('moments', { orderColumn: 'display_order', ascending: true });

  const rawMoments = useMemo(() => {
    const defaultByNorm = new Map();
    DEFAULT_MOMENTS.forEach((d) => {
      defaultByNorm.set(normalizeTitle(d.title), d);
    });

    if (!dbMoments || dbMoments.length === 0) {
      return DEFAULT_MOMENTS.map((m) => ({
        ...m,
        color: resolveColor(m.color),
        _resolvedImg: resolveMomentImage(m),
        baseReactions: m.baseReactions || { love: 24, fire: 18, rocket: 15, clap: 30 },
      }));
    }

    const seen = new Set();
    const mergedDb = dbMoments.map((m) => {
      const norm = normalizeTitle(m.title);
      seen.add(norm);
      const def = defaultByNorm.get(norm);
      const cleanedTitle = cleanTitleString(m.title) || def?.title || m.title;

      return {
        ...(def || {}),
        ...m,
        title: cleanedTitle,
        color: resolveColor(m.color || def?.color),
        icon: m.icon || def?.icon || '✨',
        image_url: m.image_url || def?.image_url,
        location: m.location || def?.location,
        vibe: m.vibe || def?.vibe,
        tags: m.tags && m.tags.length > 0 ? m.tags : def?.tags || [],
        baseReactions: m.baseReactions || def?.baseReactions || { love: 28, fire: 22, rocket: 19, clap: 35 },
      };
    });

    const extras = DEFAULT_MOMENTS
      .filter((d) => !seen.has(normalizeTitle(d.title)))
      .map((d) => ({
        ...d,
        color: resolveColor(d.color),
        baseReactions: d.baseReactions || { love: 20, fire: 15, rocket: 10, clap: 25 },
      }));

    return [...mergedDb, ...extras].map((m) => ({
      ...m,
      _resolvedImg: resolveMomentImage(m),
    }));
  }, [dbMoments]);

  // Persistent reactions state
  const [reactions, setReactions] = useState(() => {
    try {
      const saved = localStorage.getItem('portfolio_moments_reactions');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    const init = {};
    DEFAULT_MOMENTS.forEach((m) => {
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
    setReactions((prev) => {
      const current = prev[momentId] || { love: 20, fire: 15, rocket: 10, clap: 25 };
      const updated = {
        ...prev,
        [momentId]: { ...current, [key]: (current[key] || 0) + 1 },
      };
      try {
        localStorage.setItem('portfolio_moments_reactions', JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
  }, []);

  const handleCopyLink = useCallback((e, momentId) => {
    e.stopPropagation();
    try {
      navigator.clipboard.writeText(`${window.location.origin}/moments#${momentId}`);
      setCopiedId(momentId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (_) {}
  }, []);

  // Filtered moments list
  const visible = useMemo(() => {
    return rawMoments.filter((m) => {
      const matchTab =
        activeFilter === 'all'
          ? true
          : activeFilter === 'milestones'
          ? m.type === 'milestone'
          : activeFilter === 'travel'
          ? m.tags?.some((t) => ['travel', 'life', 'nature'].includes(t)) || m.type === 'photo'
          : activeFilter === 'inspirations'
          ? m.type === 'quote' || m.tags?.includes('inspiration')
          : activeFilter === 'dev'
          ? m.tags?.some((t) => ['dev', 'project', 'ml', 'ai', 'vit'].includes(t)) || m.type === 'update'
          : true;

      if (!matchTab) return false;
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      return (
        m.title?.toLowerCase().includes(q) ||
        m.description?.toLowerCase().includes(q) ||
        m.location?.toLowerCase().includes(q) ||
        m.tags?.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [rawMoments, activeFilter, searchTerm]);

  // Overall metric counters
  const metrics = useMemo(() => {
    const total = rawMoments.length;
    const milestones = rawMoments.filter((m) => m.type === 'milestone').length;
    const photos = rawMoments.filter((m) => m.type === 'photo').length;
    const totalReactions = Object.values(reactions).reduce(
      (sum, r) => sum + Object.values(r || {}).reduce((s, n) => s + (Number(n) || 0), 0),
      0
    );
    return { total, milestones, photos, reactions: totalReactions || 1336 };
  }, [rawMoments, reactions]);

  // Responsive stage width monitoring
  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Clamp active index on list changes
  useEffect(() => {
    if (visible.length === 0) {
      setActiveIndex(0);
    } else if (activeIndex >= visible.length) {
      setActiveIndex(Math.max(0, visible.length - 1));
    }
  }, [visible.length, activeIndex]);

  // Reset index when filter or search changes
  useEffect(() => {
    setActiveIndex(0);
  }, [activeFilter, searchTerm]);

  // Scroll active thumbnail smoothly into view in bottom dock
  useEffect(() => {
    if (!thumbDockRef.current) return;
    const activeThumb = thumbDockRef.current.querySelector('.thumb-item.active');
    if (activeThumb) {
      activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeIndex]);

  // Carousel track sizing calculations
  const isMobile = containerWidth < 680;
  const slideWidth = isMobile
    ? Math.max(260, Math.min(containerWidth - 60, 360))
    : Math.min(620, Math.max(340, containerWidth * 0.52));
  const slideGap = isMobile ? 14 : 24;
  const centerOffset = (containerWidth - slideWidth) / 2;
  const trackX = centerOffset - activeIndex * (slideWidth + slideGap);

  // Keyboard navigation when Lightbox is closed
  useEffect(() => {
    const handleKey = (e) => {
      if (activeLightboxId) return;
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (e.key === 'ArrowRight' && activeIndex < visible.length - 1) {
        setActiveIndex((i) => i + 1);
      } else if (e.key === 'ArrowLeft' && activeIndex > 0) {
        setActiveIndex((i) => i - 1);
      } else if (e.key === 'Enter' && visible[activeIndex]) {
        setActiveLightboxId(visible[activeIndex].id);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeIndex, visible, activeLightboxId]);

  // Handle URL hash navigation on mount — run only once when moments are loaded
  const hashHandledRef = useRef(false);
  useEffect(() => {
    if (hashHandledRef.current) return;
    if (visible.length === 0) return;
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      const idx = visible.findIndex((m) => m.id === hash);
      if (idx !== -1) {
        hashHandledRef.current = true;
        setActiveIndex(idx);
        setActiveLightboxId(hash);
      }
    } else {
      hashHandledRef.current = true;
    }
  }, [visible]);

  // Active moment for lightbox
  const lightboxIndex = useMemo(() => {
    if (!activeLightboxId) return -1;
    return visible.findIndex((m) => m.id === activeLightboxId);
  }, [activeLightboxId, visible]);

  const activeMoment = lightboxIndex !== -1 ? visible[lightboxIndex] : null;

  return (
    <>
      <style>{CAROUSEL_LIGHTBOX_CSS}</style>
      <div className={'mc-page' + (theme === 'light' ? ' mc-light' : '')}>

        {/* ── 1. Header with Title & Metrics ── */}
        <header className="mc-header">
          <div className="mc-hero-left">
            <div className="hero-stamp-badge">est. archive &mdash; updated live</div>
            <h1 className="mc-title">Life in moments</h1>
          </div>
          <div className="mc-metrics">
            <AnimatedMetric value={metrics.total} label="moments" />
            <AnimatedMetric value={metrics.milestones} label="milestones" />
            <AnimatedMetric value={metrics.photos} label="photos" />
            <AnimatedMetric value={metrics.reactions} label="reactions" />
          </div>
        </header>

        {/* ── 2. Toolbar: Search + Category Tabs + Navigation Arrows ── */}
        <nav className="mc-toolbar">
          <div className="search-line">
            <Search size={14} className="search-glyph" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="search tag, place, keyword..."
            />
            {searchTerm && (
              <button
                className="clear-btn"
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <div className="mc-tabs">
            {[
              ['all', 'all'],
              ['milestones', 'milestones'],
              ['travel', 'travel & life'],
              ['inspirations', 'inspirations'],
              ['dev', 'dev & projects'],
            ].map(([k, lbl]) => (
              <button
                key={k}
                className={'mc-tab' + (activeFilter === k ? ' active' : '')}
                onClick={() => setActiveFilter(k)}
              >
                {lbl}
              </button>
            ))}
          </div>

          <div className="mc-nav-ctrl">
            <button
              className="mc-nav-btn"
              onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
              disabled={activeIndex === 0}
              aria-label="Previous Moment"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="mc-counter">
              {visible.length > 0 ? `${activeIndex + 1} / ${visible.length}` : '—'}
            </span>
            <button
              className="mc-nav-btn"
              onClick={() => setActiveIndex((i) => Math.min(visible.length - 1, i + 1))}
              disabled={activeIndex >= visible.length - 1}
              aria-label="Next Moment"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </nav>

        {/* ── 3. Main Stage: Motion Carousel Track ── */}
        <main className="mc-stage" ref={containerRef}>
          {visible.length === 0 ? (
            <div className="mc-empty-state">
              <p className="empty-title">no moments found</p>
              <p className="empty-desc">Try clearing your search or switching categories.</p>
              <button
                className="empty-reset"
                onClick={() => { setActiveFilter('all'); setSearchTerm(''); }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="mc-track-wrapper">
              <motion.div
                className="mc-track"
                drag="x"
                dragConstraints={{
                  left: centerOffset - (visible.length - 1) * (slideWidth + slideGap),
                  right: centerOffset,
                }}
                dragElastic={0.16}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipeThreshold = 40;
                  const velocityThreshold = 250;
                  if ((offset.x < -swipeThreshold || velocity.x < -velocityThreshold) && activeIndex < visible.length - 1) {
                    setActiveIndex((i) => i + 1);
                  } else if ((offset.x > swipeThreshold || velocity.x > velocityThreshold) && activeIndex > 0) {
                    setActiveIndex((i) => i - 1);
                  }
                }}
                animate={{ x: trackX }}
                transition={{ type: 'spring', stiffness: 280, damping: 30, mass: 0.9 }}
              >
                {visible.map((m, i) => {
                  const isActive = i === activeIndex;
                  const dist = Math.abs(i - activeIndex);
                  const img = m._resolvedImg;
                  const col = m.color;

                  return (
                    <motion.div
                      key={m.id}
                      layoutId={`moment-frame-${m.id}`}
                      className={`mc-slide ${isActive ? 'is-active' : 'is-inactive'} ${m.featured ? 'is-featured' : ''}`}
                      style={{
                        width: slideWidth,
                        '--accent': `var(--${col})`,
                      }}
                      animate={{
                        scale: isActive ? 1 : 0.88,
                        opacity: isActive ? 1 : dist === 1 ? 0.45 : 0.18,
                        filter: isActive
                          ? 'brightness(1) contrast(1)'
                          : 'brightness(0.55) contrast(0.95)',
                      }}
                      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                      onClick={() => {
                        if (!isActive) {
                          setActiveIndex(i);
                        } else {
                          setActiveLightboxId(m.id);
                        }
                      }}
                    >
                      {/* Media container */}
                      <div className="mc-media-holder">
                        {img ? (
                          <>
                            <img
                              src={img}
                              alt={m.title}
                              className="mc-slide-img"
                              loading={dist < 3 ? 'eager' : 'lazy'}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = FALLBACKS[m.type] || FALLBACKS.milestone;
                              }}
                            />

                            <div className="mc-media-scrim" />

                            {/* Top Badges — only for image slides */}
                            <div className="mc-top-tags">
                              <span className="mc-stamp-date">{m.date}</span>
                              {m.type === 'milestone' && (
                                <span className="mc-type-badge">
                                  <Sparkles size={11} /> Milestone
                                </span>
                              )}
                            </div>

                            {/* Expand Hover Cue — only for image slides */}
                            {isActive && (
                              <div className="mc-expand-cue">
                                <Maximize2 size={13} />
                                <span>Click to expand</span>
                              </div>
                            )}

                            {/* Bottom Slide Info — only for image slides */}
                            <div className="mc-slide-info">
                              <div className="mc-info-primary">
                                <h3 className="mc-slide-title">{m.title}</h3>
                                <p className="mc-slide-desc">{m.description}</p>
                              </div>

                              <div className="mc-slide-footer">
                                <div className="mc-footer-left">
                                  {m.location && (
                                    <span className="mc-loc">
                                      <MapPin size={11} /> {m.location}
                                    </span>
                                  )}
                                  {m.vibe && (
                                    <span className="mc-vibe">
                                      <Music size={11} /> {m.vibe}
                                    </span>
                                  )}
                                </div>

                                {/* Reactions on active image slide */}
                                {isActive && (
                                  <div
                                    className="mc-reactions-cluster"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {REACTIONS.map(({ key, glyph, label }) => {
                                      const r = reactions[m.id] || m.baseReactions || { love: 20, fire: 15, rocket: 10, clap: 25 };
                                      return (
                                        <button
                                          key={key}
                                          className="react-btn mc-react-btn"
                                          onClick={(e) => handleReact(e, m.id, key, glyph)}
                                          title={'React ' + label}
                                        >
                                          <span className="react-glyph">{glyph}</span>
                                          <span>{r[key] || 0}</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                          </>
                        ) : (
                          /* Quote card — no image, separate layout */
                          <div className="mc-quote-holder">
                            <div className="mc-quote-top-row">
                              <span className="mc-stamp-date mc-stamp-date-dark">{m.date}</span>
                              {isActive && (
                                <div className="mc-expand-cue mc-expand-cue-dark">
                                  <Maximize2 size={13} />
                                  <span>Click to expand</span>
                                </div>
                              )}
                            </div>
                            <div className="mc-quote-body">
                              <span className="quote-mark">&ldquo;</span>
                              <p className="mc-quote-summary">{m.description}</p>
                            </div>
                            <div className="mc-quote-footer">
                              <div className="mc-footer-left mc-footer-left-dark">
                                {m.location && (
                                  <span className="mc-loc mc-loc-dark">
                                    <MapPin size={11} /> {m.location}
                                  </span>
                                )}
                                {m.vibe && (
                                  <span className="mc-vibe mc-vibe-dark">
                                    <Music size={11} /> {m.vibe}
                                  </span>
                                )}
                              </div>
                              {isActive && (
                                <div
                                  className="mc-reactions-cluster"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {REACTIONS.map(({ key, glyph, label }) => {
                                    const r = reactions[m.id] || m.baseReactions || { love: 20, fire: 15, rocket: 10, clap: 25 };
                                    return (
                                      <button
                                        key={key}
                                        className="react-btn mc-react-btn mc-react-btn-dark"
                                        onClick={(e) => handleReact(e, m.id, key, glyph)}
                                        title={'React ' + label}
                                      >
                                        <span className="react-glyph">{glyph}</span>
                                        <span>{r[key] || 0}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          )}

          {/* ── 4. Floating Thumbnail Scrubber Dock ── */}
          {visible.length > 1 && (
            <div className="mc-thumb-dock" ref={thumbDockRef}>
              <div className="mc-thumb-track">
                {visible.map((m, i) => {
                  const isCurrent = i === activeIndex;
                  const thumbImg = m._resolvedImg;
                  return (
                    <button
                      key={m.id}
                      className={`thumb-item ${isCurrent ? 'active' : ''}`}
                      onClick={() => setActiveIndex(i)}
                      aria-label={`Go to slide ${i + 1}: ${m.title}`}
                      title={m.title}
                    >
                      {thumbImg ? (
                        <img src={thumbImg} alt={m.title} />
                      ) : (
                        <div className="thumb-quote-box">{m.icon || '💬'}</div>
                      )}
                      {isCurrent && (
                        <motion.div
                          layoutId="active-thumb-glow"
                          className="thumb-active-glow"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </main>

        {/* ── 5. Motion Lightbox Overlay Modal ── */}
        <AnimatePresence>
          {activeLightboxId && activeMoment && (
            <MotionLightbox
              moment={activeMoment}
              allMoments={visible}
              currentIndex={lightboxIndex}
              onClose={() => setActiveLightboxId(null)}
              onNavigate={(idx) => {
                if (visible[idx]) {
                  setActiveIndex(idx);
                  setActiveLightboxId(visible[idx].id);
                }
              }}
              reactions={reactions}
              onReact={handleReact}
              onCopyLink={handleCopyLink}
              copiedId={copiedId}
            />
          )}
        </AnimatePresence>

      </div>
    </>
  );
}

/* ─── Archival Motion Carousel + Lightbox CSS ─────────────────────────────────── */
const CAROUSEL_LIGHTBOX_CSS = `
@keyframes fadeRise  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
@keyframes archFloat { 0%{ opacity:1; transform:translate(0,0) scale(1); } 100%{ opacity:0; transform:translate(var(--dx),-46px) scale(1.4); } }
@keyframes pulseGlow { 0%, 100% { opacity: 0.85; } 50% { opacity: 1; } }

/* Main layout overrides to preserve full screen single-view experience */
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

/* Root Page Container */
.mc-page {
  --ap-bg: #120F0C;
  --ap-paper: #1B1713;
  --ap-paper-2: #241F1A;
  --ap-paper-3: #2E2721;
  --ap-ink: #ECE4D2;
  --ap-ink-dim: #B4A891;
  --ap-ink-faint: #7A7060;
  --ap-line: rgba(236,228,210,0.12);
  --ap-line-strong: rgba(236,228,210,0.26);
  --ap-scrim: rgba(10,8,6,0.85);
  --rust: #E07A5F;
  --moss: #81B29A;
  --dusty: #69ABAE;
  --plum: #BD93BD;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: var(--ap-bg);
  color: var(--ap-ink);
  font-family: 'Inter', -apple-system, sans-serif;
  position: relative;
  user-select: none;
}

.mc-page.mc-light {
  --ap-bg: #F4EFE6;
  --ap-paper: #FAF6EF;
  --ap-paper-2: #EDE5D7;
  --ap-paper-3: #E2D8C7;
  --ap-ink: #201A15;
  --ap-ink-dim: #5D5447;
  --ap-ink-faint: #928876;
  --ap-line: rgba(32,26,21,0.12);
  --ap-line-strong: rgba(32,26,21,0.28);
  --ap-scrim: rgba(20,15,10,0.75);
  --rust: #C45538;
  --moss: #588B74;
  --dusty: #3D7B7E;
  --plum: #8C5C8C;
}

/* 1. Header */
.mc-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 16px 28px 12px;
  border-bottom: 1px solid var(--ap-line);
  flex-shrink: 0;
  background: var(--ap-bg);
  z-index: 10;
}
.mc-hero-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.hero-stamp-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--rust);
  background: var(--ap-paper-2);
  border: 1px dashed var(--rust);
  border-radius: 4px;
  padding: 2px 8px;
  width: fit-content;
}
.mc-title {
  font-family: 'Fraunces', serif;
  font-style: italic;
  font-size: 26px;
  font-weight: 500;
  margin: 0;
  color: var(--ap-ink);
  line-height: 1.15;
}
.mc-metrics {
  display: flex;
  gap: 22px;
  align-items: center;
}
.mitem {
  text-align: right;
}
.mnum {
  font-family: 'Fraunces', serif;
  font-size: 19px;
  font-weight: 500;
  display: block;
  color: var(--ap-ink);
  line-height: 1.1;
}
.mlbl {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 9px;
  color: var(--ap-ink-faint);
  margin-top: 2px;
  letter-spacing: .04em;
  white-space: nowrap;
}

/* 2. Toolbar */
.mc-toolbar {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 8px 28px;
  border-bottom: 1px solid var(--ap-line);
  flex-shrink: 0;
  background: var(--ap-bg);
  z-index: 10;
}
.search-line {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 6px 10px;
  border: 1px solid var(--ap-line);
  border-radius: 6px;
  width: 210px;
  flex-shrink: 0;
  transition: border-color .15s ease, background .15s ease;
  background: var(--ap-paper);
}
.search-line:focus-within {
  border-color: var(--rust);
}
.search-glyph {
  color: var(--ap-ink-faint);
  flex-shrink: 0;
}
.search-line input {
  border: none;
  background: none;
  outline: none;
  color: var(--ap-ink);
  font-size: 12px;
  width: 100%;
  font-family: 'Inter', sans-serif;
}
.search-line input::placeholder {
  color: var(--ap-ink-faint);
}
.clear-btn {
  background: none;
  border: none;
  color: var(--ap-ink-faint);
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.clear-btn:hover {
  color: var(--ap-ink);
}

.mc-tabs {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  overflow-x: auto;
  scrollbar-width: none;
}
.mc-tabs::-webkit-scrollbar {
  display: none;
}
.mc-tab {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11.5px;
  letter-spacing: .02em;
  border: none;
  background: none;
  color: var(--ap-ink-faint);
  cursor: pointer;
  white-space: nowrap;
  padding: 4px 0 6px;
  position: relative;
  transition: color .15s ease;
}
.mc-tab::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2px;
  background: var(--rust);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform .18s ease;
}
.mc-tab:hover {
  color: var(--ap-ink-dim);
}
.mc-tab.active {
  color: var(--ap-ink);
}
.mc-tab.active::after {
  transform: scaleX(1);
}

.mc-nav-ctrl {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}
.mc-nav-btn {
  width: 28px;
  height: 28px;
  border-radius: 5px;
  border: 1px solid var(--ap-line);
  background: var(--ap-paper-2);
  color: var(--ap-ink);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all .15s ease;
}
.mc-nav-btn:hover:not(:disabled) {
  border-color: var(--rust);
  color: var(--rust);
  background: var(--ap-paper-3);
}
.mc-nav-btn:disabled {
  opacity: .25;
  cursor: not-allowed;
}
.mc-counter {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10.5px;
  color: var(--ap-ink-faint);
  min-width: 44px;
  text-align: center;
}

/* 3. Main Stage & Carousel Track */
.mc-stage {
  flex: 1;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding-bottom: 74px; /* Space for floating dock */
  /* Always keep a dark cinematic stage background regardless of page theme */
  background: #100D0A;
}
.mc-track-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  position: relative;
  cursor: grab;
}
.mc-track-wrapper:active {
  cursor: grabbing;
}
.mc-track {
  display: flex;
  align-items: center;
  gap: 24px;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  will-change: transform;
}

/* Slide Cards — always dark media cards */
.mc-slide {
  height: calc(100% - 28px);
  max-height: 520px;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  background: #1A1612; /* Always dark, regardless of page theme */
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 12px 36px rgba(0,0,0,0.5);
  cursor: pointer;
  flex-shrink: 0;
  user-select: none;
  transition: border-color .2s ease, box-shadow .2s ease;
}
.mc-slide.is-active {
  box-shadow: 0 20px 50px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.18);
  z-index: 5;
}
.mc-slide.is-featured.is-active {
  box-shadow: 0 20px 50px rgba(0,0,0,0.7), 0 0 0 1.5px var(--accent, var(--rust));
}

.mc-media-holder {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.mc-slide-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform .6s cubic-bezier(0.16, 1, 0.3, 1);
}
.mc-slide.is-active:hover .mc-slide-img {
  transform: scale(1.03);
}

/* Quote card — full flex layout with top/body/footer sections */
.mc-quote-holder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #1E1915 0%, #100C09 100%);
}
.mc-quote-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px 0;
  flex-shrink: 0;
}
.mc-quote-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 24px 32px;
}
.mc-quote-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px 14px;
  border-top: 1px solid rgba(255,255,255,0.08);
  flex-shrink: 0;
  flex-wrap: wrap;
  gap: 8px;
}
.quote-mark {
  font-family: 'Fraunces', serif;
  font-size: 52px;
  color: var(--rust);
  line-height: .6;
  opacity: .75;
  margin-bottom: 12px;
}
.mc-quote-summary {
  font-family: 'Fraunces', serif;
  font-style: italic;
  font-size: 19px;
  line-height: 1.55;
  color: #ECE4D2;
  margin: 0;
}
/* Dark-context variants for quote card meta */
.mc-stamp-date-dark {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10.5px;
  padding: 3px 8px;
  border-radius: 4px;
  background: rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.7);
  border: 1px solid rgba(255,255,255,0.1);
  letter-spacing: .02em;
}
.mc-expand-cue-dark {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px;
  color: rgba(255,255,255,0.6);
  background: rgba(255,255,255,0.07);
  backdrop-filter: blur(8px);
  padding: 3px 9px;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.12);
  opacity: 0;
  transform: translateY(-4px);
  transition: all .2s ease;
}
.mc-slide.is-active:hover .mc-expand-cue-dark {
  opacity: 1;
  transform: translateY(0);
}
.mc-footer-left-dark {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px;
  color: rgba(255,255,255,0.6);
}
.mc-loc-dark,
.mc-vibe-dark {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.mc-react-btn-dark {
  background: rgba(255,255,255,0.07);
  border-color: rgba(255,255,255,0.14);
  color: rgba(255,255,255,0.85);
}

.mc-media-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(10,8,6,0.55) 0%,
    transparent 28%,
    rgba(10,8,6,0.3) 50%,
    rgba(10,8,6,0.92) 100%
  );
  pointer-events: none;
}

/* Badges on slide top */
.mc-top-tags {
  position: absolute;
  top: 14px;
  left: 16px;
  right: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 3;
}
.mc-stamp-date {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10.5px;
  padding: 3px 8px;
  border-radius: 4px;
  background: rgba(0,0,0,0.65);
  color: #fff;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.1);
  letter-spacing: .02em;
}
.mc-type-badge {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px;
  padding: 3px 8px;
  border-radius: 4px;
  background: var(--rust);
  color: #fff;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
  letter-spacing: .02em;
}

/* Expand Cue */
.mc-expand-cue {
  position: absolute;
  top: 14px;
  right: 16px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px;
  color: #fff;
  background: rgba(0,0,0,0.65);
  backdrop-filter: blur(8px);
  padding: 3px 9px;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.15);
  opacity: 0;
  transform: translateY(-4px);
  transition: all .2s ease;
  z-index: 3;
}
.mc-slide.is-active:hover .mc-expand-cue {
  opacity: 1;
  transform: translateY(0);
}

/* Slide Bottom Info */
.mc-slide-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px 22px 18px;
  z-index: 4;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.mc-slide-title {
  font-family: 'Fraunces', serif;
  font-size: 21px;
  font-weight: 500;
  line-height: 1.25;
  color: #fff;
  margin: 0;
  text-shadow: 0 2px 8px rgba(0,0,0,0.6);
}
.mc-slide-desc {
  font-size: 12.5px;
  color: rgba(255,255,255,0.85);
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-shadow: 0 1px 4px rgba(0,0,0,0.6);
}
.mc-slide-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 4px;
  padding-top: 8px;
  border-top: 1px solid rgba(255,255,255,0.12);
}
.mc-footer-left {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px;
  color: rgba(255,255,255,0.7);
}
.mc-loc, .mc-vibe {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

/* Reactions Buttons */
.mc-reactions-cluster {
  display: flex;
  gap: 4px;
}
.react-btn {
  border: 1px solid rgba(255,255,255,0.18);
  background: rgba(0,0,0,0.55);
  backdrop-filter: blur(8px);
  border-radius: 6px;
  padding: 4px 7px;
  font-size: 11px;
  color: rgba(255,255,255,0.9);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: 'IBM Plex Mono', monospace;
  transition: all .15s ease;
}
.react-btn:hover {
  border-color: rgba(255,255,255,0.45);
  background: rgba(0,0,0,0.75);
  color: #fff;
  transform: translateY(-1px);
}
.react-btn.popped {
  border-color: var(--rust);
  color: var(--rust);
  transform: scale(1.15);
}
.arch-particle {
  position: absolute;
  pointer-events: none;
  font-size: 14px;
  animation: archFloat .9s ease-out forwards;
}

/* 4. Floating Thumbnail Scrubber Dock */
.mc-thumb-dock {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(14, 11, 8, 0.78);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  border-radius: 12px;
  padding: 5px 6px;
  max-width: min(calc(100vw - 32px), 720px);
  z-index: 20;
}
.mc-thumb-track {
  display: flex;
  gap: 7px;
  align-items: center;
  overflow-x: auto;
  scrollbar-width: none;
  padding: 1px 2px;
}
.mc-thumb-track::-webkit-scrollbar {
  display: none;
}
.thumb-item {
  width: 54px;
  height: 36px;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  border: none;
  background: var(--ap-paper-2);
  padding: 0;
  flex-shrink: 0;
  opacity: 0.55;
  transition: opacity .2s ease, transform .2s ease;
}
.thumb-item:hover {
  opacity: 0.9;
  transform: scale(1.05);
}
.thumb-item.active {
  opacity: 1;
}
.thumb-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.thumb-quote-box {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  background: var(--ap-paper-3);
  color: var(--ap-ink);
}
.thumb-active-glow {
  position: absolute;
  inset: 0;
  border: 2px solid #ffffff;
  border-radius: 6px;
  box-shadow: 0 0 10px rgba(255,255,255,0.4);
  pointer-events: none;
}

/* 5. Motion Lightbox Overlay Modal */
.lb-backdrop {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: rgba(8, 6, 4, 0.94);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 16px 24px;
  user-select: none;
}
.lb-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  flex-shrink: 0;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  padding-bottom: 8px;
}
.lb-top-left {
  display: flex;
  align-items: center;
  gap: 14px;
}
.lb-counter {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12px;
  color: rgba(255,255,255,0.6);
  letter-spacing: .08em;
}
.lb-title-badge {
  font-family: 'Fraunces', serif;
  font-style: italic;
  font-size: 15px;
  color: #fff;
}
.lb-top-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.lb-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
  color: #fff;
  border-radius: 6px;
  padding: 6px 12px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  cursor: pointer;
  transition: all .15s ease;
}
.lb-action-btn:hover {
  background: rgba(255,255,255,0.15);
  border-color: rgba(255,255,255,0.25);
}
.lb-btn-text {
  font-size: 11px;
}
.lb-close-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all .15s ease;
}
.lb-close-btn:hover {
  background: rgba(255,255,255,0.2);
  transform: rotate(90deg);
}

/* Lightbox Stage */
.lb-stage {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  min-height: 0;
  padding: 12px 0;
}
.lb-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.14);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all .2s ease;
  z-index: 10;
}
.lb-arrow:hover {
  background: rgba(255,255,255,0.2);
  transform: translateY(-50%) scale(1.08);
}
.lb-arrow-prev { left: 16px; }
.lb-arrow-next { right: 16px; }

/* Lightbox Display Card */
.lb-card {
  max-width: 860px;
  width: 100%;
  max-height: 80vh;
  background: #181410;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 30px 80px rgba(0,0,0,0.8);
  display: flex;
  flex-direction: column;
  position: relative;
}
.lb-media-wrap {
  width: 100%;
  max-height: 54vh;
  position: relative;
  overflow: hidden;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.lb-main-image {
  max-width: 100%;
  max-height: 54vh;
  width: 100%;
  object-fit: cover;
  display: block;
}
.lb-media-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 60%, rgba(24,20,16,0.95) 100%);
}

.lb-quote-canvas {
  padding: 48px 36px;
  min-height: 260px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.lb-quote-mark {
  font-family: 'Fraunces', serif;
  font-size: 60px;
  color: var(--rust);
  line-height: .6;
  opacity: .8;
  margin-bottom: 14px;
}
.lb-quote-text {
  font-family: 'Fraunces', serif;
  font-style: italic;
  font-size: 21px;
  line-height: 1.6;
  color: #fff;
  margin: 0;
}

/* Lightbox Details Sheet */
.lb-details-sheet {
  padding: 18px 24px 20px;
  background: #181410;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.lb-meta-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.lb-meta-pill {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10.5px;
  color: rgba(255,255,255,0.7);
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  padding: 3px 8px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.lb-meta-pill.vibe {
  color: var(--dusty);
  border-color: rgba(105,171,174,0.3);
}
.lb-headline {
  font-family: 'Fraunces', serif;
  font-style: italic;
  font-size: 24px;
  font-weight: 500;
  color: #fff;
  margin: 0;
  line-height: 1.2;
}
.lb-caption {
  font-size: 13.5px;
  color: rgba(255,255,255,0.85);
  line-height: 1.55;
  margin: 0;
}
.lb-tag-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.lb-tag-badge {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px;
  color: rgba(255,255,255,0.5);
  background: rgba(255,255,255,0.04);
  padding: 2px 7px;
  border-radius: 3px;
  border: 1px solid rgba(255,255,255,0.08);
}
.lb-reactions-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
  padding-top: 10px;
  border-top: 1px solid rgba(255,255,255,0.08);
}
.lb-reactions-track {
  display: flex;
  gap: 6px;
}
.lb-react-btn {
  background: rgba(255,255,255,0.06);
  border-color: rgba(255,255,255,0.14);
}
.lb-esc-hint {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px;
  color: rgba(255,255,255,0.4);
}

/* Lightbox Bottom Scrubber Dock */
.lb-bottom-dock {
  height: 52px;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}
.lb-dock-track {
  display: flex;
  gap: 8px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.09);
  padding: 4px 8px;
  border-radius: 10px;
  max-width: 90vw;
  overflow-x: auto;
  scrollbar-width: none;
}
.lb-dock-track::-webkit-scrollbar {
  display: none;
}
.lb-dock-thumb {
  width: 48px;
  height: 32px;
  border-radius: 5px;
  overflow: hidden;
  position: relative;
  border: none;
  background: #25201b;
  padding: 0;
  cursor: pointer;
  flex-shrink: 0;
  opacity: 0.5;
  transition: opacity .2s ease, transform .2s ease;
}
.lb-dock-thumb:hover {
  opacity: 0.85;
}
.lb-dock-thumb.active {
  opacity: 1;
}
.lb-dock-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.lb-dock-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: #fff;
}
.lb-dock-ring {
  position: absolute;
  inset: 0;
  border: 2px solid #fff;
  border-radius: 5px;
  box-shadow: 0 0 8px rgba(255,255,255,0.5);
  pointer-events: none;
}

/* Empty State */
.mc-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-align: center;
  padding: 40px 20px;
}
.empty-title {
  font-family: 'Fraunces', serif;
  font-style: italic;
  font-size: 22px;
  color: var(--ap-ink);
  margin: 0;
}
.empty-desc {
  font-size: 13px;
  color: var(--ap-ink-dim);
  margin: 0;
}
.empty-reset {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  padding: 7px 16px;
  background: var(--rust);
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 6px;
}

/* Responsive tweaks */
@media (max-width: 768px) {
  .mc-header {
    padding: 12px 16px 8px;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  .mc-metrics {
    gap: 14px;
  }
  .mc-toolbar {
    padding: 6px 14px;
  }
  .search-line {
    width: 140px;
  }
  .mc-slide-title {
    font-size: 17px;
  }
  .mc-slide-desc {
    display: none;
  }
  .lb-card {
    max-height: 86vh;
  }
  .lb-arrow {
    display: none;
  }
}
`;
