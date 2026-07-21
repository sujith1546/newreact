import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, X } from 'lucide-react';

const SECTION_LABELS = {
  home:           'Home',
  about:          'About Me',
  skills:         'Skills & Expertise',
  projects:       'Featured Projects',
  education:      'Education',
  experience:     'Experience',
  certifications: 'Certifications',
  contact:        'Contact',
};

// ── Per-section: the container elements to SEARCH WITHIN ─────────────────────
// These are the "search scope" containers. We will do a keyword text search
// inside them to find the most precise element to highlight.
const SECTION_SCOPE = {
  home:           ['.home-grid', '.mobile-dashboard', '.hero-info'],
  about:          ['.about-page'],
  skills:         ['.skills-grid', '.skills-mobile-grid', '.skills-page'],
  projects:       ['.projects-grid', '.mpj-list'],
  education:      ['.edu-grid', '.mobile-edu-feed', '.edu-page'],
  experience:     ['.exp-page'],
  certifications: ['.certs-grid', '.mobile-certs-feed'],
  contact:        ['.fc-wrapper', '.mc-outer-container', '.contact-page-wrap'],
};

// ── Per-section fallback selectors (used when keyword search fails) ────────
const SECTION_FALLBACK = {
  home:           '.home-grid',
  about:          '.about-page',
  skills:         '.skills-grid',
  projects:       '.projects-grid',
  education:      '.edu-grid',
  experience:     '.exp-page',
  certifications: '.certs-grid',
  contact:        '.fc-info-panel',
};

// ── Minimum element sizes to avoid highlighting tiny spans/labels ─────────
const MIN_HIGHLIGHT_WIDTH  = 60;
const MIN_HIGHLIGHT_HEIGHT = 40;

// ── CSS class-to-border-radius map for beautiful rounded rings ───────────
const CLASS_RADIUS_MAP = {
  'skill-category-card': '14px',
  'project-card':        '16px',
  'edu-flip-card':       '18px',
  'cert-card':           '16px',
  'medu-card':           '14px',
  'mcert-card':          '14px',
  'mpj-row':             '12px',
  'hobby-card':          '14px',
  'stat-card':           '12px',
  'qa-card':             '14px',
  'empty-state-card':    '18px',
  'fc-info-panel':       '16px',
  'fc-form-panel':       '16px',
  'mc-contact-card-item':'12px',
  'dashboard-profile-card':'20px',
};

function getRadius(el) {
  if (!el) return '14px';
  for (const [cls, radius] of Object.entries(CLASS_RADIUS_MAP)) {
    if (el.classList.contains(cls)) return radius;
  }
  return '14px';
}

// ── Intelligent element scorer ────────────────────────────────────────────
// Given a keyword, walk the DOM within the scope container and score each
// candidate element. The one with the highest score wins.
function scoreElement(el, keyword) {
  const text = el.textContent || '';
  const kw   = keyword.toLowerCase();
  const elText = text.toLowerCase();

  if (!elText.includes(kw)) return 0;

  const rect = el.getBoundingClientRect();
  if (rect.width < MIN_HIGHLIGHT_WIDTH || rect.height < MIN_HIGHLIGHT_HEIGHT) return 0;

  // Prefer smaller, more precise elements (inversely proportional to area)
  const area = rect.width * rect.height;
  const areaScore = 1_000_000 / (area + 1);

  // Prefer elements whose text ratio is closer to keyword (precise match)
  const ratio = kw.length / (elText.length + 1);
  const ratioScore = ratio * 200;

  // Bonus for known "card" class names
  const cardClasses = ['skill-category-card','project-card','edu-flip-card','cert-card',
    'medu-card','mcert-card','mpj-row','hobby-card','stat-card','qa-card',
    'empty-state-card','dashboard-profile-card','fc-info-panel','fc-form-panel',
    'mc-contact-card-item','about-header','micro-timeline'];
  let cardBonus = 0;
  for (const cls of cardClasses) {
    if (el.classList.contains(cls)) { cardBonus = 150; break; }
  }

  return areaScore + ratioScore + cardBonus;
}

// ── Walk all descendants of a container to find the best keyword match ────
function findBestElement(container, keyword) {
  if (!container || !keyword) return null;
  const kw = keyword.toLowerCase();

  // Get all descendant elements (not text nodes)
  const allEls = Array.from(container.querySelectorAll('*'));

  let bestEl    = null;
  let bestScore = 0;

  for (const el of allEls) {
    const score = scoreElement(el, kw);
    if (score > bestScore) {
      bestScore = score;
      bestEl    = el;
    }
  }

  // If the best element found is very large (the whole container essentially),
  // climb up to a better card-level parent
  if (bestEl) {
    let node = bestEl;
    while (node && node !== container) {
      const rect = node.getBoundingClientRect();
      if (rect.width > window.innerWidth * 0.85) {
        // Too wide — go to parent
        node = node.parentElement;
        continue;
      }
      break;
    }
    if (node && node !== container) bestEl = node;
  }

  return bestEl || null;
}

// ── Main resolver: find scope container, then keyword-search inside it ────
function resolveTargetElement(sectionId, keyword) {
  const scopeSelectors = SECTION_SCOPE[sectionId] || [];
  const fallback       = SECTION_FALLBACK[sectionId];
  const isGenericKw    = !keyword || keyword.toLowerCase() === sectionId.toLowerCase()
    || keyword.toLowerCase() === (SECTION_LABELS[sectionId] || '').toLowerCase();

  // 1. Find the scope container
  let scopeEl = null;
  for (const sel of scopeSelectors) {
    const el = document.querySelector(sel);
    if (el) { scopeEl = el; break; }
  }

  // 2. If keyword is generic (user asked for the whole section), just return scope
  if (isGenericKw) {
    return scopeEl || (fallback ? document.querySelector(fallback) : null);
  }

  // 3. Do intelligent keyword search inside scope
  if (scopeEl && keyword) {
    const bestEl = findBestElement(scopeEl, keyword);
    if (bestEl) return bestEl;
  }

  // 4. Fallback to scope container itself
  return scopeEl || (fallback ? document.querySelector(fallback) : null);
}

// ── Unique ID for injected <style> ────────────────────────────────────────
const STYLE_ID  = 'ai-spotlight-ring-style';
let   TARGET_EL = null; // keep ref so we can remove inline styles

function buildCSS(uid, radius) {
  return `
    @keyframes ai-spotlight-pulse-${uid} {
      0%   { box-shadow: 0 0 0 0   rgba(139,92,246,0.65), 0 0 28px 7px rgba(139,92,246,0.28); outline-color: rgba(139,92,246,1);    }
      50%  { box-shadow: 0 0 0 11px rgba(139,92,246,0.07), 0 0 55px 22px rgba(139,92,246,0.13); outline-color: rgba(99,102,241,0.65); }
      100% { box-shadow: 0 0 0 0   rgba(139,92,246,0.65), 0 0 28px 7px rgba(139,92,246,0.28); outline-color: rgba(139,92,246,1);    }
    }
    .ai-spotlight-target {
      outline:        2.5px solid rgba(139,92,246,0.92) !important;
      outline-offset: 7px !important;
      border-radius:  ${radius} !important;
      animation:      ai-spotlight-pulse-${uid} 2.2s ease-in-out infinite !important;
      position:       relative !important;
      z-index:        10 !important;
      scroll-margin-top:    80px;
      scroll-margin-bottom: 30px;
    }
  `;
}

function injectHighlight(sectionId, keyword) {
  removeHighlight();

  const uid = Date.now();
  const el  = resolveTargetElement(sectionId, keyword);
  if (!el) return;

  TARGET_EL = el;
  const radius = getRadius(el);

  const styleEl   = document.createElement('style');
  styleEl.id      = STYLE_ID;
  styleEl.textContent = buildCSS(uid, radius);
  document.head.appendChild(styleEl);

  el.classList.add('ai-spotlight-target');

  // Smoothly scroll into center
  setTimeout(() => {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 350);
}

function removeHighlight() {
  document.getElementById(STYLE_ID)?.remove();
  if (TARGET_EL) {
    TARGET_EL.classList.remove('ai-spotlight-target');
    TARGET_EL = null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────

export default function SectionSpotlight({ section, keyword, onDismiss }) {
  const [countdown, setCountdown] = useState(5);
  const label = SECTION_LABELS[section] || section;

  useEffect(() => {
    if (section) {
      setCountdown(5);
      // Wait for page slide transition to finish
      const t = setTimeout(() => injectHighlight(section, keyword), 500);
      return () => clearTimeout(t);
    } else {
      removeHighlight();
    }
  }, [section, keyword]);

  useEffect(() => () => removeHighlight(), []);

  useEffect(() => {
    if (!section) return;
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(interval); handleDismiss(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [section, keyword]);

  const handleDismiss = () => { removeHighlight(); onDismiss?.(); };

  // What to show in the badge: if keyword is specific, show it alongside section
  const isSpecific = keyword && keyword.toLowerCase() !== (section || '') &&
    keyword.toLowerCase() !== (SECTION_LABELS[section] || '').toLowerCase();
  const badgeLabel = isSpecific
    ? `${label} › ${keyword}`
    : label;

  return (
    <AnimatePresence>
      {section && (
        <motion.div
          key={`spotlight-toast-${section}-${keyword}`}
          initial={{ opacity: 0, y: -55, scale: 0.84 }}
          animate={{ opacity: 1,  y: 0,   scale: 1    }}
          exit={{    opacity: 0,  y: -44,  scale: 0.9  }}
          transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'fixed', top: 14, left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9500, pointerEvents: 'auto',
          }}
        >
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'linear-gradient(135deg, rgba(10,6,24,0.97) 0%, rgba(26,14,50,0.97) 100%)',
            border: '1px solid rgba(139,92,246,0.4)', borderRadius: 100,
            padding: '8px 14px 8px 10px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.55), 0 0 0 1px rgba(139,92,246,0.08)',
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            userSelect: 'none', maxWidth: '92vw',
          }}>
            {/* Pulsing AI eye */}
            <motion.div
              animate={{ scale:[1,1.22,1], opacity:[0.82,1,0.82] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
              style={{
                width:32, height:32, borderRadius:'50%',
                background:'linear-gradient(135deg,#8b5cf6,#6366f1)',
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:'0 0 16px rgba(139,92,246,0.65)', flexShrink:0,
              }}
            >
              <Eye size={14} color="#fff" />
            </motion.div>

            {/* Label */}
            <div style={{ display:'flex', flexDirection:'column', gap:1, minWidth:0 }}>
              <span style={{
                fontSize:9.5, fontWeight:700, color:'rgba(139,92,246,0.82)',
                textTransform:'uppercase', letterSpacing:'0.8px', whiteSpace:'nowrap',
              }}>
                AI Highlighting
              </span>
              <span style={{
                fontSize:13, fontWeight:700, color:'#fff',
                whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:220,
              }}>
                {badgeLabel}
              </span>
            </div>

            {/* SVG countdown ring */}
            <div style={{ position:'relative', width:28, height:28, flexShrink:0 }}>
              <svg width="28" height="28" style={{ position:'absolute', top:0, left:0, transform:'rotate(-90deg)' }}>
                <circle cx="14" cy="14" r="11" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="2.5"/>
                <motion.circle
                  cx="14" cy="14" r="11" fill="none"
                  stroke="rgba(139,92,246,0.85)" strokeWidth="2.5" strokeLinecap="round"
                  strokeDasharray={2*Math.PI*11}
                  initial={{ strokeDashoffset:0 }}
                  animate={{ strokeDashoffset: 2*Math.PI*11 }}
                  transition={{ duration:5, ease:'linear' }}
                />
              </svg>
              <span style={{
                position:'absolute', inset:0,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:10, fontWeight:800, color:'rgba(255,255,255,0.7)',
              }}>{countdown}</span>
            </div>

            {/* Dismiss */}
            <button
              onClick={handleDismiss}
              title="Remove highlight"
              style={{
                background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)',
                borderRadius:'50%', width:26, height:26, cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center',
                color:'rgba(255,255,255,0.5)', flexShrink:0,
                transition:'all 0.18s ease', padding:0,
              }}
              onMouseEnter={e=>{
                e.currentTarget.style.background='rgba(239,68,68,0.22)';
                e.currentTarget.style.color='#f87171';
                e.currentTarget.style.borderColor='rgba(239,68,68,0.35)';
              }}
              onMouseLeave={e=>{
                e.currentTarget.style.background='rgba(255,255,255,0.07)';
                e.currentTarget.style.color='rgba(255,255,255,0.5)';
                e.currentTarget.style.borderColor='rgba(255,255,255,0.1)';
              }}
            >
              <X size={12}/>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
