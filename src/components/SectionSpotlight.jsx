import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, X, Download } from 'lucide-react';

const SECTION_LABELS = {
  home:           'Home',
  about:          'About Me',
  skills:         'Skills & Expertise',
  projects:       'Featured Projects',
  education:      'Education',
  experience:     'Experience',
  certifications: 'Certifications',
  contact:        'Contact',
  resume:         'Resume',
};

// ═══════════════════════════════════════════════════════════════
// SECTION SCOPE — Search containers for both Desktop & Mobile
// ═══════════════════════════════════════════════════════════════
const SECTION_SCOPE = {
  home: [
    '.home-grid',            // Desktop hero 2-col
    '.mobile-dashboard',     // Mobile full dashboard
    '.hero-info',
    '.home-content',
  ],
  about: [
    '.about-page',           // Full about container
    '.about-container',
  ],
  skills: [
    '.skills-grid',          // Desktop grid
    '.skills-mobile-grid',   // Mobile category grid
    '.sk-category-grid',
    '.skills-page',
  ],
  projects: [
    '.projects-grid',        // Desktop grid
    '.mpj-list',             // Mobile project list
    '.projects-page',
  ],
  education: [
    '.edu-grid',             // Desktop 3D flip grid
    '.mobile-edu-feed',      // Mobile feed
    '.edu-page',
  ],
  experience: [
    '.exp-page',
    '.experience-page',
  ],
  certifications: [
    '.certs-grid',           // Desktop cert grid
    '.mobile-certs-feed',    // Mobile cert feed
    '.certs-page',
  ],
  contact: [
    '.fc-wrapper',           // Desktop layout
    '.mc-outer-container',   // Mobile layout
    '.contact-page-wrap',
  ],
};

// ═══════════════════════════════════════════════════════════════
// CLASS → BORDER-RADIUS MAP (Desktop + Mobile)
// ═══════════════════════════════════════════════════════════════
const CLASS_RADIUS_MAP = {
  // Home
  'qa-card':               '14px',
  'dashboard-profile-card':'20px',
  'dashboard-bio-card':    '16px',
  'dashboard-link-card':   '14px',
  'stat-card':             '12px',
  // About
  'hobby-card':            '14px',
  'contact-pill':          '100px',
  'micro-timeline':        '12px',
  'cta-btn-primary':       '10px',
  'cta-btn-secondary':     '10px',
  // Skills
  'skill-category-card':   '14px',
  'sk-cat-card':           '14px',
  'sk-skills-card':        '12px',
  'skill-pill':            '20px',
  // Projects
  'project-card':          '16px',
  'mpj-row':               '12px',
  // Education
  'edu-flip-card':         '18px',
  'medu-card':             '14px',
  'edu-closing-summary':   '14px',
  // Certifications
  'cert-card':             '16px',
  'mcert-card':            '14px',
  'cert-hero-card':        '14px',
  // Experience
  'empty-state-card':      '18px',
  // Contact
  'fc-info-panel':         '16px',
  'fc-form-panel':         '16px',
  'mc-contact-card-item':  '12px',
  'swipe-send-container':  '14px',
  'mc-form-container':     '14px',
};

// Recognized card classes for exact element card climbing
const CARD_CLASSES = new Set([
  'skill-category-card', 'sk-cat-card', 'sk-skills-card', 'skill-pill',
  'project-card', 'mpj-row',
  'edu-flip-card', 'medu-card', 'edu-closing-summary',
  'cert-card', 'mcert-card', 'cert-hero-card',
  'hobby-card', 'contact-pill', 'micro-timeline', 'stat-card', 'qa-card',
  'dashboard-profile-card', 'dashboard-bio-card', 'dashboard-link-card',
  'empty-state-card',
  'fc-info-panel', 'fc-form-panel', 'mc-contact-card-item', 'swipe-send-container'
]);

// Minimum element dimensions
const MIN_W = 40;
const MIN_H = 24;

// ═══════════════════════════════════════════════════════════════
// KEYWORD SANITIZER
// Strips noise words so "show Python skills" -> "python"
// ═══════════════════════════════════════════════════════════════
function sanitizeKeyword(rawKw, sectionId) {
  if (!rawKw) return '';
  let kw = rawKw.toLowerCase().trim();

  // Strip leading action phrases
  kw = kw.replace(/^(show|view|find|display|see|go to|take me to|where is|tell me about|what is|get|open)\s+/i, '');
  // Strip possessives / articles
  kw = kw.replace(/^(my|your|the|a|an|sujith's)\s+/i, '');

  const secLow = (sectionId || '').toLowerCase();
  const labLow = (SECTION_LABELS[sectionId] || '').toLowerCase();

  // If keyword ends with section noun (e.g. "python skills" -> "python"), strip section noun if more remains
  const trailingSecRegex = new RegExp(`\\s+(${secLow}|skills|projects|education|certs|certifications|experience|contact)$`, 'i');
  if (trailingSecRegex.test(kw) && kw.replace(trailingSecRegex, '').trim().length > 0) {
    kw = kw.replace(trailingSecRegex, '').trim();
  }

  // Generic check: if what remains is empty or matches section name
  if (!kw || kw === secLow || kw === labLow || kw === 'download' || kw === 'resume') {
    return ''; // empty means generic section highlight
  }

  return kw;
}

function getRadius(el) {
  if (!el) return '14px';
  for (const [cls, radius] of Object.entries(CLASS_RADIUS_MAP)) {
    if (el.classList.contains(cls)) return radius;
  }
  const cs = window.getComputedStyle(el);
  const cr = parseFloat(cs.borderRadius);
  if (cr > 0) return cs.borderRadius;
  return '14px';
}

// ═══════════════════════════════════════════════════════════════
// SCORER — Ranks elements by text match precision & card priority
// ═══════════════════════════════════════════════════════════════
function scoreElement(el, cleanKw) {
  // Must be visible
  const style = window.getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return 0;

  const rect = el.getBoundingClientRect();
  if (rect.width < MIN_W || rect.height < MIN_H) return 0;

  const elText = (el.textContent || '').toLowerCase();
  if (!elText.includes(cleanKw)) return 0;

  // 1. Text Ratio Score (higher if element text is mostly just the keyword)
  const ratio = cleanKw.length / (elText.length + 1);
  const ratioScore = ratio * 400;

  // 2. Inverse Area Score (prefer compact sub-cards over entire page grids)
  const area = rect.width * rect.height;
  const areaScore = 2_000_000 / (area + 1);

  // 3. Card Class Bonus
  let cardBonus = 0;
  for (const cls of el.classList) {
    if (CARD_CLASSES.has(cls)) {
      cardBonus = 300;
      break;
    }
  }

  return ratioScore + areaScore + cardBonus;
}

// ═══════════════════════════════════════════════════════════════
// DOM CRAWLER & CARD CLIMBER
// ═══════════════════════════════════════════════════════════════
function findBestElement(container, cleanKw) {
  if (!container || !cleanKw) return null;

  const allEls = Array.from(container.querySelectorAll('*'));
  let bestEl = null;
  let bestScore = 0;

  for (const el of allEls) {
    const score = scoreElement(el, cleanKw);
    if (score > bestScore) {
      bestScore = score;
      bestEl = el;
    }
  }

  if (!bestEl) return null;

  // ── Climb UP from inner text node to the surrounding card ──────
  let curr = bestEl;
  while (curr && curr !== container && curr !== document.body) {
    // If curr is a recognized card element, pick it immediately!
    const hasCardClass = Array.from(curr.classList || []).some(cls => CARD_CLASSES.has(cls));
    if (hasCardClass) return curr;

    const rect = curr.getBoundingClientRect();
    // Stop if parent gets too large (> 92% screen width or > 750px tall)
    if (rect.width > window.innerWidth * 0.92 || rect.height > 750) {
      break;
    }

    // If parent is a good card-like block
    if (rect.width >= 120 && rect.height >= 40) {
      const parentStyle = window.getComputedStyle(curr);
      if (parentStyle.borderRadius !== '0px' || parentStyle.borderWidth !== '0px' || parentStyle.boxShadow !== 'none') {
        bestEl = curr;
      }
    }

    curr = curr.parentElement;
  }

  return bestEl;
}

// ═══════════════════════════════════════════════════════════════
// MAIN TARGET RESOLVER
// ═══════════════════════════════════════════════════════════════
function resolveTargetElement(sectionId, rawKeyword) {
  const cleanKw = sanitizeKeyword(rawKeyword, sectionId);
  const scopes  = SECTION_SCOPE[sectionId] || [];

  // Find active scope container (desktop or mobile)
  let scopeEl = null;
  for (const sel of scopes) {
    const els = document.querySelectorAll(sel);
    for (const el of Array.from(els)) {
      const st = window.getComputedStyle(el);
      if (st.display !== 'none' && st.visibility !== 'hidden') {
        scopeEl = el;
        break;
      }
    }
    if (scopeEl) break;
  }

  // Fallback scope to page container or body
  if (!scopeEl) {
    scopeEl = document.querySelector('.main-content') || document.querySelector('main') || document.body;
  }

  // If keyword is generic (e.g. user just said "show skills"), highlight scopeEl
  if (!cleanKw) {
    return scopeEl;
  }

  // Intelligent DOM search
  const bestEl = findBestElement(scopeEl, cleanKw);
  if (bestEl) return bestEl;

  // Fallback: search whole document body if scope container search missed it
  const globalBest = findBestElement(document.body, cleanKw);
  if (globalBest) return globalBest;

  return scopeEl;
}

// ═══════════════════════════════════════════════════════════════
// CSS INJECTION
// ═══════════════════════════════════════════════════════════════
const STYLE_ID = 'ai-spotlight-ring-style';
let TARGET_EL  = null;

function buildCSS(uid, radius) {
  return `
    @keyframes ai-spotlight-pulse-${uid} {
      0%   { box-shadow: 0 0 0 0    rgba(139,92,246,0.75), 0 0 36px 10px rgba(139,92,246,0.35); outline-color: rgba(139,92,246,1);    }
      50%  { box-shadow: 0 0 0 14px rgba(139,92,246,0.08), 0 0 64px 26px rgba(139,92,246,0.15); outline-color: rgba(99,102,241,0.70); }
      100% { box-shadow: 0 0 0 0    rgba(139,92,246,0.75), 0 0 36px 10px rgba(139,92,246,0.35); outline-color: rgba(139,92,246,1);    }
    }
    .ai-spotlight-target {
      outline:        3px solid rgba(139,92,246,0.95) !important;
      outline-offset: 6px !important;
      border-radius:  ${radius} !important;
      animation:      ai-spotlight-pulse-${uid} 2.2s ease-in-out infinite !important;
      position:       relative !important;
      z-index:        100 !important;
      scroll-margin-top:    100px;
      scroll-margin-bottom: 50px;
    }
  `;
}

function injectHighlight(sectionId, keyword) {
  removeHighlight();
  if (sectionId === 'resume') return;

  const el = resolveTargetElement(sectionId, keyword);
  if (!el) return;

  TARGET_EL = el;
  const uid = Date.now();
  const radius = getRadius(el);

  const styleEl = document.createElement('style');
  styleEl.id = STYLE_ID;
  styleEl.textContent = buildCSS(uid, radius);
  document.head.appendChild(styleEl);

  el.classList.add('ai-spotlight-target');

  // Scroll into view smoothly on Desktop & Mobile
  setTimeout(() => {
    try {
      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    } catch {
      el.scrollIntoView(true);
    }
  }, 350);
}

function removeHighlight() {
  document.getElementById(STYLE_ID)?.remove();
  if (TARGET_EL) {
    TARGET_EL.classList.remove('ai-spotlight-target');
    TARGET_EL = null;
  }
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function SectionSpotlight({ section, keyword, onDismiss }) {
  const [countdown, setCountdown] = useState(5);
  const isResume = section === 'resume';
  const label    = SECTION_LABELS[section] || section || '';

  useEffect(() => {
    if (section) {
      setCountdown(5);
      // Wait for page transition & DOM layout settling
      const t1 = setTimeout(() => injectHighlight(section, keyword), 450);
      const t2 = setTimeout(() => injectHighlight(section, keyword), 850); // double-check retry for slow mobile renders
      return () => { clearTimeout(t1); clearTimeout(t2); };
    } else {
      removeHighlight();
    }
  }, [section, keyword]);

  useEffect(() => () => removeHighlight(), []);

  useEffect(() => {
    if (!section) return;
    const iv = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(iv); handleDismiss(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [section, keyword]);

  const handleDismiss = () => { removeHighlight(); onDismiss?.(); };

  const cleanKw = sanitizeKeyword(keyword, section);
  const isSpecific = cleanKw.length > 0;
  const badgeLabel = isSpecific ? `${label} › ${cleanKw}` : label;
  const badgeAction = isResume ? 'AI Downloading' : 'AI Highlighting';
  const accentColor = isResume ? '#10b981' : '#8b5cf6';
  const accentGrad  = isResume
    ? 'linear-gradient(135deg,#10b981,#059669)'
    : 'linear-gradient(135deg,#8b5cf6,#6366f1)';

  return (
    <AnimatePresence>
      {section && (
        <motion.div
          key={`spotlight-toast-${section}-${keyword}`}
          initial={{ opacity: 0, y: -56, scale: 0.84 }}
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
            background: 'linear-gradient(135deg, rgba(10,6,24,0.97) 0%, rgba(22,14,44,0.97) 100%)',
            border: `1px solid ${accentColor}55`,
            borderRadius: 100,
            padding: '8px 14px 8px 10px',
            boxShadow: `0 8px 32px rgba(0,0,0,0.55), 0 0 0 1px ${accentColor}18`,
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            userSelect: 'none', maxWidth: '92vw',
          }}>
            {/* Pulsing icon */}
            <motion.div
              animate={{ scale:[1,1.22,1], opacity:[0.82,1,0.82] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
              style={{
                width:32, height:32, borderRadius:'50%',
                background: accentGrad,
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:`0 0 16px ${accentColor}99`, flexShrink:0,
              }}
            >
              {isResume ? <Download size={14} color="#fff" /> : <Eye size={14} color="#fff" />}
            </motion.div>

            {/* Badge label */}
            <div style={{ display:'flex', flexDirection:'column', gap:1, minWidth:0 }}>
              <span style={{
                fontSize:9.5, fontWeight:700, color:`${accentColor}cc`,
                textTransform:'uppercase', letterSpacing:'0.8px', whiteSpace:'nowrap',
              }}>
                {badgeAction}
              </span>
              <span style={{
                fontSize:13, fontWeight:700, color:'#fff',
                whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:220,
                textTransform: 'capitalize',
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
                  stroke={`${accentColor}cc`} strokeWidth="2.5" strokeLinecap="round"
                  strokeDasharray={2*Math.PI*11}
                  initial={{ strokeDashoffset: 0 }}
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
              title="Dismiss"
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
