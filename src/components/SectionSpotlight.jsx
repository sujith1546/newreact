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
// SECTION SCOPE — search containers per page (waterfall: first found wins)
// ═══════════════════════════════════════════════════════════════
const SECTION_SCOPE = {
  home: [
    '.home-grid',            // desktop 2-col hero
    '.mobile-dashboard',     // mobile full dashboard
    '.hero-info',            // desktop hero text column
    '.home-content',
  ],
  about: [
    '.about-page',           // full about container
  ],
  skills: [
    '.skills-grid',          // desktop 2-col card grid
    '.skills-mobile-grid',   // mobile category grid
    '.skills-page',
  ],
  projects: [
    '.projects-grid',        // desktop auto-fit grid
    '.mpj-list',             // mobile project list
  ],
  education: [
    '.edu-grid',             // desktop 4-col flip grid
    '.mobile-edu-feed',      // mobile feed
    '.edu-page',
  ],
  experience: [
    '.exp-page',
  ],
  certifications: [
    '.certs-grid',           // desktop cert cards
    '.mobile-certs-feed',    // mobile cert feed
  ],
  contact: [
    '.fc-wrapper',           // desktop 2-col layout
    '.mc-outer-container',   // mobile layout
    '.contact-page-wrap',
  ],
};

// ═══════════════════════════════════════════════════════════════
// FALLBACK — when keyword search yields nothing, highlight this
// ═══════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════
// MINIMUM ELEMENT SIZE — avoid highlighting tiny labels / spans
// ═══════════════════════════════════════════════════════════════
const MIN_W = 60;
const MIN_H = 36;

// ═══════════════════════════════════════════════════════════════
// CLASS → BORDER-RADIUS MAP (covers every known card on every page)
// ═══════════════════════════════════════════════════════════════
const CLASS_RADIUS_MAP = {
  // ── Home ──────────────────────────────────────────────────────
  'qa-card':               '14px',  // Quick action cards
  'dashboard-profile-card':'20px',  // Mobile profile card
  'dashboard-bio-card':    '16px',  // Mobile bio card
  'dashboard-link-card':   '14px',  // Mobile nav link cards
  'stat-card':             '12px',  // Stats cards (home + about)
  // ── About ─────────────────────────────────────────────────────
  'hobby-card':            '14px',  // Hobby cards
  'contact-pill':          '100px', // Contact pills (gmail/linkedin/github)
  'micro-timeline':        '12px',  // Career timeline strip
  'cta-btn-primary':       '10px',  // CTA primary button
  'cta-btn-secondary':     '10px',  // CTA secondary button
  // ── Skills ────────────────────────────────────────────────────
  'skill-category-card':   '14px',  // Desktop skill category cards
  'sk-cat-card':           '14px',  // Mobile skill category cards
  'sk-skills-card':        '12px',  // Mobile skill group card
  // ── Projects ──────────────────────────────────────────────────
  'project-card':          '16px',  // Desktop project cards
  'mpj-row':               '12px',  // Mobile project rows
  // ── Education ─────────────────────────────────────────────────
  'edu-flip-card':         '18px',  // Desktop 3D flip cards
  'medu-card':             '14px',  // Mobile education cards
  'edu-closing-summary':   '14px',  // Education closing summary
  // ── Certifications ────────────────────────────────────────────
  'cert-card':             '16px',  // Desktop cert cards
  'mcert-card':            '14px',  // Mobile cert rows
  'cert-hero-card':        '14px',  // Detail hero credential card
  // ── Experience ────────────────────────────────────────────────
  'empty-state-card':      '18px',  // Opportunity card
  // ── Contact ───────────────────────────────────────────────────
  'fc-info-panel':         '16px',  // Desktop left dark panel
  'fc-form-panel':         '16px',  // Desktop right form panel
  'mc-contact-card-item':  '12px',  // Mobile contact card items
  'swipe-send-container':  '14px',  // Mobile swipe-to-send
  'mc-form-container':     '14px',  // Mobile form
};

// ═══════════════════════════════════════════════════════════════
// HIGH-PRIORITY CARD CLASSES (get +200 bonus over generic divs)
// The full exhaustive list from every page's DOM inventory
// ═══════════════════════════════════════════════════════════════
const PRIORITY_CARD_CLASSES = new Set([
  // Home
  'qa-card', 'dashboard-profile-card', 'dashboard-bio-card',
  'dashboard-link-card', 'stat-card',
  // About
  'hobby-card', 'contact-pill', 'micro-timeline',
  'cta-btn-primary', 'cta-btn-secondary', 'about-bio', 'about-header',
  // Skills
  'skill-category-card', 'sk-cat-card', 'sk-skills-card', 'skill-pill',
  // Projects
  'project-card', 'mpj-row',
  // Education
  'edu-flip-card', 'medu-card', 'edu-closing-summary', 'edu-rail',
  // Certifications
  'cert-card', 'mcert-card', 'cert-hero-card',
  // Experience
  'empty-state-card',
  // Contact
  'fc-info-panel', 'fc-form-panel', 'mc-contact-card-item',
  'swipe-send-container', 'mc-form-container',
]);

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
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
// INTELLIGENT ELEMENT SCORER
// 3 Factors: text-ratio, inverse-area, card-class bonus
// ═══════════════════════════════════════════════════════════════
function scoreElement(el, kw) {
  const elText = (el.textContent || '').toLowerCase();
  if (!elText.includes(kw)) return 0;

  const rect = el.getBoundingClientRect();
  if (rect.width < MIN_W || rect.height < MIN_H) return 0;
  // Off-screen? skip
  if (rect.bottom < 0 || rect.top > window.innerHeight + 2000) return 0;

  const area      = rect.width * rect.height;
  const areaScore = 1_500_000 / (area + 1);              // smaller = higher score

  const ratio      = kw.length / (elText.length + 1);
  const ratioScore = ratio * 300;                         // tighter text match = better

  const cardBonus = PRIORITY_CARD_CLASSES.has([...el.classList].find(c => PRIORITY_CARD_CLASSES.has(c)) || '') ? 200 : 0;

  return areaScore + ratioScore + cardBonus;
}

// ═══════════════════════════════════════════════════════════════
// DOM WALKER — find the single best-matching element inside a container
// ═══════════════════════════════════════════════════════════════
function findBestElement(container, keyword) {
  if (!container || !keyword) return null;
  const kw = keyword.toLowerCase();

  const allEls = Array.from(container.querySelectorAll('*'));
  let bestEl = null, bestScore = 0;

  for (const el of allEls) {
    const score = scoreElement(el, kw);
    if (score > bestScore) { bestScore = score; bestEl = el; }
  }

  // If winner is still very wide (> 85% viewport), try to walk up to a better parent
  if (bestEl) {
    let node = bestEl;
    while (node && node !== container) {
      if (node.getBoundingClientRect().width > window.innerWidth * 0.85) {
        node = node.parentElement;
        continue;
      }
      break;
    }
    if (node && node !== container) bestEl = node;
  }

  return bestEl || null;
}

// ═══════════════════════════════════════════════════════════════
// MAIN RESOLVER
// ═══════════════════════════════════════════════════════════════
function resolveTargetElement(sectionId, keyword) {
  const scopes   = SECTION_SCOPE[sectionId] || [];
  const fallback = SECTION_FALLBACK[sectionId];

  const kwLow  = (keyword || '').toLowerCase().trim();
  const secLow = (sectionId || '').toLowerCase();
  const labLow = (SECTION_LABELS[sectionId] || '').toLowerCase();

  // "generic" keyword = just navigating to the whole section
  const isGeneric = !kwLow || kwLow === secLow || kwLow === labLow
    || kwLow === 'download' || kwLow === 'show' || kwLow === 'resume';

  // 1. Find scope container (first one actually in DOM)
  let scopeEl = null;
  for (const sel of scopes) {
    const el = document.querySelector(sel);
    if (el) { scopeEl = el; break; }
  }

  // 2. Generic → just highlight the whole section
  if (isGeneric) {
    return scopeEl || (fallback ? document.querySelector(fallback) : null);
  }

  // 3. Keyword search inside scope
  if (scopeEl) {
    const best = findBestElement(scopeEl, kwLow);
    if (best) return best;
  }

  // 4. Fallback: scope container or known selector
  return scopeEl || (fallback ? document.querySelector(fallback) : null);
}

// ═══════════════════════════════════════════════════════════════
// CSS INJECTION
// ═══════════════════════════════════════════════════════════════
const STYLE_ID = 'ai-spotlight-ring-style';
let   TARGET_EL = null;

function buildCSS(uid, radius) {
  return `
    @keyframes ai-spotlight-pulse-${uid} {
      0%   { box-shadow: 0 0 0 0    rgba(139,92,246,0.70), 0 0 32px 8px rgba(139,92,246,0.30); outline-color: rgba(139,92,246,1);    }
      50%  { box-shadow: 0 0 0 12px rgba(139,92,246,0.07), 0 0 60px 24px rgba(139,92,246,0.12); outline-color: rgba(99,102,241,0.65); }
      100% { box-shadow: 0 0 0 0    rgba(139,92,246,0.70), 0 0 32px 8px rgba(139,92,246,0.30); outline-color: rgba(139,92,246,1);    }
    }
    .ai-spotlight-target {
      outline:        2.5px solid rgba(139,92,246,0.92) !important;
      outline-offset: 8px !important;
      border-radius:  ${radius} !important;
      animation:      ai-spotlight-pulse-${uid} 2.2s ease-in-out infinite !important;
      position:       relative !important;
      z-index:        10 !important;
      scroll-margin-top:    90px;
      scroll-margin-bottom: 30px;
    }
  `;
}

function injectHighlight(sectionId, keyword) {
  removeHighlight();
  // Resume is handled by event dispatch — no DOM highlight needed
  if (sectionId === 'resume') return;

  const uid = Date.now();
  const el  = resolveTargetElement(sectionId, keyword);
  if (!el) return;

  TARGET_EL = el;
  const styleEl       = document.createElement('style');
  styleEl.id          = STYLE_ID;
  styleEl.textContent = buildCSS(uid, getRadius(el));
  document.head.appendChild(styleEl);
  el.classList.add('ai-spotlight-target');

  setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 350);
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

  // Inject on section/keyword change
  useEffect(() => {
    if (section) {
      setCountdown(5);
      const t = setTimeout(() => injectHighlight(section, keyword), 480);
      return () => clearTimeout(t);
    } else {
      removeHighlight();
    }
  }, [section, keyword]);

  useEffect(() => () => removeHighlight(), []);

  // Auto-dismiss countdown
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

  // Badge label: breadcrumb when keyword is specific
  const kwLow  = (keyword || '').toLowerCase().trim();
  const secLow = (section || '').toLowerCase();
  const labLow = label.toLowerCase();
  const isSpecific = keyword && kwLow !== secLow && kwLow !== labLow
    && kwLow !== 'download' && kwLow !== 'show' && kwLow !== 'resume';

  const badgeLabel  = isSpecific ? `${label} › ${keyword}` : label;
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
                whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:230,
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
