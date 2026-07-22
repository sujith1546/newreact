// src/pages/Skills.jsx
// Mobile: 2-level drill-down — compact category grid (no scroll) → skill-list sheet → skill-detail sheet
// Desktop: unchanged 2-col card grid

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronDown, Star, Layers, Clock, Briefcase, ChevronLeft, Loader2 } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';
import { supabase } from '../lib/supabaseClient';
import { categoryIconMap } from '../components/skillIcons';
import SkillTooltip from '../components/SkillTooltip';

const categoryMeta = {
  languages: { id: "languages", title: "Languages", icon: "code" },
  database:  { id: "database",  title: "Database & Tools", icon: "database" },
  ml:        { id: "ml",        title: "ML & Data Science", icon: "ml" },
  soft:      { id: "soft",      title: "Soft Skills", icon: "users" },
  exploring: { id: "exploring", title: "Currently Exploring & Learning", icon: "rocket" },
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

const levelColor = {
  Advanced:     { bg: 'rgba(22, 163, 74, 0.1)',  text: '#16a34a', ring: '#16a34a' },
  Intermediate: { bg: 'rgba(234, 179, 8, 0.1)',  text: '#ca8a04', ring: '#eab308' },
  Learning:     { bg: 'rgba(99, 102, 241, 0.1)', text: '#6366f1', ring: '#6366f1' },
};

const levelDot = { Advanced: '#16a34a', Intermediate: '#eab308', Learning: '#6366f1' };

function ProgressRing({ percent, color, size = 80 }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border-color)" strokeWidth={7} />
      <motion.circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={7} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={circ}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      />
    </svg>
  );
}

export default function Skills() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  const [activeCategory, setActiveCategory] = useState(null);  // category object
  const [activeSkill,    setActiveSkill]    = useState(null);  // skill object
  const [hasCatScrolled,  setHasCatScrolled]  = useState(false);
  const [isCatScrollable, setIsCatScrollable] = useState(false);
  const [hasSkillScrolled,  setHasSkillScrolled]  = useState(false);
  const [isSkillScrollable, setIsSkillScrollable] = useState(false);
  const catSheetRef   = useRef(null);
  const skillSheetRef = useRef(null);

  const [skillCategories, setSkillCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSkills() {
      const { data, error } = await supabase.from('skills').select('*').order('order_index', { ascending: true });
      if (!error && data) {
        // Group skills by category
        const grouped = {};
        data.forEach(dbSkill => {
          const cat = dbSkill.category;
          if (!grouped[cat]) grouped[cat] = [];
          
          // Map DB snake_case fields to camelCase format expected by the UI
          grouped[cat].push({
            id: dbSkill.id,
            name: dbSkill.name,
            icon: dbSkill.icon_class,
            level: dbSkill.level_label,
            percent: dbSkill.proficiency_level,
            years: dbSkill.years_experience,
            projectCount: dbSkill.project_count,
            description: dbSkill.description,
            relatedTools: dbSkill.related_tools || [],
            projects: dbSkill.projects || [],
          });
        });

        // Convert to array matching the old format
        const finalCategories = Object.keys(grouped).map(catKey => {
          const meta = categoryMeta[catKey] || { id: catKey, title: catKey.charAt(0).toUpperCase() + catKey.slice(1), icon: 'code' };
          return {
            id: meta.id,
            title: meta.title,
            icon: meta.icon,
            skills: grouped[catKey]
          };
        });

        // Ensure stable order of categories (languages, database, ml, soft, exploring)
        const orderMap = { languages: 1, database: 2, ml: 3, soft: 4, exploring: 5 };
        finalCategories.sort((a, b) => (orderMap[a.id] || 99) - (orderMap[b.id] || 99));

        setSkillCategories(finalCategories);
      }
      setLoading(false);
    }
    fetchSkills();
  }, []);

  // Detect scrollability for category sheet
  useEffect(() => {
    if (activeCategory) {
      setHasCatScrolled(false);
      setIsCatScrollable(false);
      setTimeout(() => {
        if (catSheetRef.current) {
          const { scrollHeight, clientHeight } = catSheetRef.current;
          setIsCatScrollable(scrollHeight > clientHeight + 5);
        }
      }, 200);
    }
  }, [activeCategory]);

  // Detect scrollability for skill detail sheet
  useEffect(() => {
    if (activeSkill) {
      setHasSkillScrolled(false);
      setIsSkillScrollable(false);
      setTimeout(() => {
        if (skillSheetRef.current) {
          const { scrollHeight, clientHeight } = skillSheetRef.current;
          setIsSkillScrollable(scrollHeight > clientHeight + 5);
        }
      }, 200);
    }
  }, [activeSkill]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <ScrollReveal>
      <style>{`
        /* ============ SHARED PAGE SHELL ============ */
        .skills-page {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .skills-header { margin-bottom: 4px; }
        .skills-header h1 {
          font-size: 28px; font-weight: 700;
          color: var(--text-primary); margin: 0 0 5px;
        }
        .skills-header p {
          font-size: 13.5px; color: var(--text-secondary); margin: 0;
        }

        /* ============ DESKTOP GRID (unchanged) ============ */
        .skills-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }
        .skill-category-card {
          background: var(--bg-secondary);
          border: 1px solid #e5e7eb;
          border-radius: 16px; padding: 24px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.02);
          transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease;
          display: flex; flex-direction: column;
        }
        .skill-category-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.06);
          border-color: #d1d5db;
        }
        .skill-category-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .skill-category-icon {
          width: 44px; height: 44px; border-radius: 12px;
          background: #f3f4f6; color: #111827;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .skill-category-title { font-size: 16px; font-weight: 700; color: var(--text-primary); margin: 0; }
        .skill-pills { display: flex; flex-wrap: wrap; gap: 10px; }
        .skill-pill {
          display: inline-block; font-size: 12px; font-weight: 600;
          background: #f9fafb; color: #4b5563;
          border: 1px solid #e5e7eb; padding: 6px 14px;
          border-radius: 999px; transition: all .2s ease; cursor: crosshair;
        }
        .skill-pill:hover { background: #111827; color: #fff; border-color: #111827; }
        [data-theme="dark"] .skill-category-card { border-color: #374151; }
        [data-theme="dark"] .skill-category-card:hover { border-color: #4b5563; }
        [data-theme="dark"] .skill-category-icon { background: #374151; color: #f3f4f6; }
        [data-theme="dark"] .skill-pill { background: rgba(255,255,255,.03); color: #d1d5db; border-color: #374151; }
        [data-theme="dark"] .skill-pill:hover { background: #f3f4f6; color: #111827; border-color: #f3f4f6; }

        /* ============ MOBILE — category card grid ============ */
        @media (max-width: 900px) {

          /* No-scroll host — fills the box the .text-content gives us */
          .skills-mobile-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 11px;
            width: 100%;
          }

          /* Each category card */
          .sk-cat-card {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 18px;
            padding: 16px 14px 14px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            cursor: pointer;
            text-align: left;
            outline: none;
            transition: background .15s;
            position: relative;
            overflow: hidden;
          }
          .sk-cat-card:active { background: var(--bg-primary); transform: scale(0.97); }

          /* accent stripe at top */
          .sk-cat-stripe {
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 3px;
            border-radius: 18px 18px 0 0;
          }

          .sk-cat-icon-box {
            width: 38px; height: 38px; border-radius: 12px;
            display: flex; align-items: center; justify-content: center;
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            color: var(--primary-blue);
            flex-shrink: 0;
          }

          .sk-cat-name {
            font-size: 13.5px; font-weight: 700;
            color: var(--text-primary);
            margin: 0; line-height: 1.25;
          }

          .sk-cat-meta {
            display: flex; align-items: center;
            justify-content: space-between;
          }

          .sk-cat-count {
            font-size: 11px; font-weight: 600;
            color: var(--text-secondary);
          }

          /* Level dots */
          .sk-cat-dots {
            display: flex; gap: 4px; align-items: center;
          }
          .sk-cat-dot {
            width: 6px; height: 6px; border-radius: 50%;
          }

          /* "Currently Exploring" spans full width */
          .sk-cat-card--full {
            grid-column: 1 / -1;
            flex-direction: row;
            align-items: center;
            gap: 14px;
          }
          .sk-cat-card--full .sk-cat-icon-box { flex-shrink: 0; }
          .sk-cat-card--full .sk-cat-name { font-size: 14px; }

          /* ============ SHARED SHEET CHROME ============ */
          .sk-sheet-overlay {
            position: fixed; inset: 0;
            background: rgba(0,0,0,.55);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            will-change: opacity, backdrop-filter; transform: translateZ(0);
            z-index: 1000;
          }
          @media (max-width: 900px) {
            .sk-sheet-overlay {
              backdrop-filter: none !important;
              -webkit-backdrop-filter: none !important;
              background: rgba(0,0,0,.7) !important;
            }
          }
          .sk-sheet {
            position: fixed; bottom: 0; left: 0; right: 0;
            background: var(--bg-secondary);
            border-top-left-radius: 28px;
            border-top-right-radius: 28px;
            z-index: 1001;
            display: flex; flex-direction: column;
            will-change: transform; transform: translateZ(0); backface-visibility: hidden;
            box-shadow: 0 -10px 50px rgba(0,0,0,.15);
          }
          .sk-sheet--cat   { height: 72vh; height: 72dvh; }
          .sk-sheet--skill { height: 80vh; height: 80dvh; }

          .sk-sheet-handle {
            width: 40px; height: 4px;
            background: var(--border-color);
            border-radius: 2px;
            margin: 14px auto 0 auto; flex-shrink: 0;
          }
          .sk-sheet-header {
            display: flex; align-items: center; justify-content: space-between;
            padding: 14px 18px 12px;
            border-bottom: 1px solid var(--border-color);
            flex-shrink: 0;
          }
          .sk-sheet-header-left {
            display: flex; align-items: center; gap: 10px;
          }
          .sk-sheet-header-left h2 {
            font-size: 17px; font-weight: 700;
            color: var(--text-primary); margin: 0;
          }
          .sk-sheet-close {
            width: 30px; height: 30px; border-radius: 15px;
            background: var(--bg-primary); border: 1px solid var(--border-color);
            display: flex; align-items: center; justify-content: center;
            color: var(--text-secondary); cursor: pointer; flex-shrink: 0;
          }
          .sk-sheet-body {
            flex: 1; overflow-y: auto; padding: 0;
            display: flex; flex-direction: column;
          }
          .sk-sheet-body::-webkit-scrollbar { display: none; }

          /* ============ CATEGORY SHEET — skill rows ============ */
          .sk-skill-group-label {
            font-size: 11px; font-weight: 700;
            color: var(--text-secondary);
            text-transform: uppercase; letter-spacing: .06em;
            padding: 16px 18px 8px; flex-shrink: 0;
          }
          .sk-skills-card {
            margin: 0 14px 14px;
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: 16px; overflow: hidden;
          }
          .sk-skill-row {
            display: flex; align-items: center;
            justify-content: space-between;
            padding: 13px 16px;
            border-bottom: 1px solid var(--border-color);
            background: transparent;
            border-left: none; border-right: none; border-top: none;
            width: 100%; text-align: left; cursor: pointer;
            gap: 12px; transition: background .15s;
          }
          .sk-skill-row:last-child { border-bottom: none; }
          .sk-skill-row:active { background: var(--bg-secondary); }
          .sk-skill-row-left { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0; }
          .sk-skill-row-icon {
            width: 32px; height: 32px; border-radius: 9px;
            display: flex; align-items: center; justify-content: center;
            flex-shrink: 0;
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            font-size: 10px; font-weight: 800; letter-spacing: -.5px;
            color: var(--text-secondary); font-family: inherit;
          }
          .sk-skill-row-text { flex: 1; min-width: 0; }
          .sk-skill-row-text h4 {
            font-size: 14px; font-weight: 600;
            color: var(--text-primary); margin: 0 0 2px;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          }
          .sk-skill-row-text p {
            font-size: 11px; color: var(--text-secondary); margin: 0;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          }
          .sk-skill-row-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
          .sk-level-badge {
            font-size: 10px; font-weight: 700;
            padding: 3px 8px; border-radius: 20px; white-space: nowrap;
          }
          .sk-bar-mini {
            width: 44px; height: 4px;
            background: var(--border-color); border-radius: 2px; overflow: hidden;
          }
          .sk-bar-mini-fill { height: 100%; border-radius: 2px; }

          /* ============ SKILL DETAIL SHEET ============ */
          .sk-detail-body {
            flex: 1; overflow-y: auto;
            padding: 18px; display: flex; flex-direction: column; gap: 18px;
          }
          .sk-detail-body::-webkit-scrollbar { display: none; }

          .sk-detail-hero {
            display: flex; align-items: center; gap: 18px;
            padding: 16px;
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: 16px;
          }
          .sk-ring-wrap { position: relative; flex-shrink: 0; }
          .sk-ring-label {
            position: absolute; inset: 0;
            display: flex; flex-direction: column;
            align-items: center; justify-content: center; pointer-events: none;
          }
          .sk-ring-pct  { font-size: 16px; font-weight: 800; color: var(--text-primary); line-height: 1; }
          .sk-ring-sub  { font-size: 8px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: .04em; }
          .sk-meta-list { flex: 1; display: flex; flex-direction: column; gap: 9px; }
          .sk-meta-row  { display: flex; align-items: center; gap: 7px; font-size: 12px; color: var(--text-secondary); }
          .sk-meta-row svg  { color: var(--text-muted); flex-shrink: 0; }
          .sk-meta-row strong { color: var(--text-primary); font-weight: 700; }

          .sk-section-label {
            font-size: 11px; font-weight: 700;
            color: var(--text-secondary); text-transform: uppercase;
            letter-spacing: .06em; margin: 0 0 8px;
          }
          .sk-desc-card {
            font-size: 13.5px; line-height: 1.6;
            color: var(--text-secondary);
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: 14px; padding: 14px 16px; margin: 0;
          }
          .sk-tags { display: flex; flex-wrap: wrap; gap: 7px; }
          .sk-tag {
            font-size: 11px; font-weight: 600;
            padding: 5px 11px; border-radius: 20px;
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            color: var(--text-secondary);
          }
          .sk-project-row {
            display: flex; align-items: center; gap: 8px;
            padding: 11px 14px;
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            font-size: 12.5px; font-weight: 600;
            color: var(--text-primary);
          }
          .sk-project-row svg { color: var(--text-muted); flex-shrink: 0; }

          /* shared scroll indicator */
          .sk-scroll-hint {
            position: absolute; bottom: 0; left: 0; right: 0;
            height: 70px;
            background: linear-gradient(to top, var(--bg-secondary) 30%, transparent);
            display: flex; justify-content: center;
            align-items: flex-end; padding-bottom: 12px;
            pointer-events: none; color: var(--text-secondary); z-index: 100;
          }
        }
      `}</style>

      <motion.div className="skills-page" variants={!isMobile ? containerVariants : undefined} initial={!isMobile ? "hidden" : undefined} animate={!isMobile ? "visible" : undefined}>
        <motion.div className="skills-header" variants={!isMobile ? itemVariants : undefined}>
          <h1>Skills &amp; Expertise</h1>
          <p>Tap any category to explore</p>
        </motion.div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <Loader2 className="spin" size={32} color="var(--primary-blue)" />
          </div>
        ) : skillCategories.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p>No skills found in the database. Please add them in the Admin Dashboard.</p>
          </div>
        ) : !isMobile ? (
          /* ── DESKTOP unchanged ── */
          <motion.div className="skills-grid" variants={containerVariants}>
            {skillCategories.map(category => {
              const Icon = categoryIconMap[category.id] || categoryIconMap.languages;
              const isFullWidth = category.id === 'exploring';
              return (
                <motion.div
                  key={category.id}
                  className="skill-category-card"
                  style={isFullWidth ? { gridColumn: '1 / -1', marginTop: '-4px' } : {}}
                  variants={itemVariants}
                >
                  <div className="skill-category-header">
                    <div className="skill-category-icon">
                      <Icon size={22} style={{ strokeWidth: 1.5 }} />
                    </div>
                    <h2 className="skill-category-title">{category.title}</h2>
                  </div>
                  <div className="skill-pills">
                    {category.skills.map(skill => (
                      <SkillTooltip key={skill.id} skill={skill}>
                        <span className="skill-pill">{skill.name}</span>
                      </SkillTooltip>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          /* ── MOBILE: compact category grid — NO page scroll ── */
          <div className="skills-mobile-grid">
            {skillCategories.map((category, idx) => {
              const Icon = categoryIconMap[category.id] || categoryIconMap.languages;
              const isFull = category.id === 'exploring';
              // pick a stripe colour per category
              const stripes = ['#007bff','#8b5cf6','#16a34a','#f59e0b','#6366f1'];
              const stripe = stripes[idx % stripes.length];
              return (
                <button
                  key={category.id}
                  className={`sk-cat-card${isFull ? ' sk-cat-card--full' : ''}`}
                  style={isFull ? { gridColumn: '1 / -1' } : {}}
                  onClick={() => setActiveCategory(category)}
                >
                  <div className="sk-cat-stripe" style={{ background: stripe }} />
                  <div className="sk-cat-icon-box" style={{ color: stripe }}>
                    <Icon size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p className="sk-cat-name">{category.title}</p>
                    <div className="sk-cat-meta" style={{ marginTop: 6 }}>
                      <span className="sk-cat-count">{category.skills.length} skill{category.skills.length !== 1 ? 's' : ''}</span>
                      <div className="sk-cat-dots">
                        {category.skills.map(sk => (
                          <div
                            key={sk.id}
                            className="sk-cat-dot"
                            style={{ background: levelDot[sk.level] || '#9ca3af' }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  {!isFull && (
                    <ChevronRight size={14} style={{ color: 'var(--text-muted)', position: 'absolute', top: 14, right: 12 }} />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Swipe Hint */}
        {isMobile && (
          <motion.div
            className="swipe-hint"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <div className="swipe-hint-icon">
              <motion.div animate={{ x: [-3, 2, -3] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}>
                <ChevronLeft size={16} />
              </motion.div>
              <motion.div animate={{ x: [3, -2, 3] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}>
                <ChevronRight size={16} />
              </motion.div>
            </div>
            <span>Swipe or use nav to explore</span>
          </motion.div>
        )}
      </motion.div>

      {/* ── Portalled sheets (mobile only) ── */}
      {typeof document !== 'undefined' && isMobile && createPortal(
        <>
          {/* ══ LEVEL 1: Category Sheet ══ */}
          <AnimatePresence>
            {activeCategory && !activeSkill && (
              <div style={{ position: 'relative', zIndex: 9998 }}>
                <motion.div
                  className="sk-sheet-overlay"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => setActiveCategory(null)}
                />
                <motion.div
                  className="sk-sheet sk-sheet--cat"
                  initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                  transition={isMobile ? { type: 'tween', ease: [0.16, 1, 0.3, 1], duration: 0.38 } : { type: 'spring', damping: 32, stiffness: 350, mass: 0.9 }}
                >
                  <div className="sk-sheet-handle" />
                  <div className="sk-sheet-header">
                    <div className="sk-sheet-header-left">
                      <h2>{activeCategory.title}</h2>
                    </div>
                    <button className="sk-sheet-close" onClick={() => setActiveCategory(null)}>
                      <X size={16} />
                    </button>
                  </div>

                  <div className="sk-sheet-body" ref={catSheetRef} onScroll={e => { if(e.target.scrollTop > 10 && !hasCatScrolled) setHasCatScrolled(true); }}>
                    <div className="sk-skill-group-label">{activeCategory.skills.length} skills in this category</div>
                    <div className="sk-skills-card">
                      {activeCategory.skills.map(skill => {
                        const lc = levelColor[skill.level] || levelColor.Intermediate;
                        return (
                          <button key={skill.id} className="sk-skill-row" onClick={() => setActiveSkill(skill)}>
                            <div className="sk-skill-row-left">
                              <div className="sk-skill-row-icon">{skill.name.slice(0,2).toUpperCase()}</div>
                              <div className="sk-skill-row-text">
                                <h4>{skill.name}</h4>
                                <p>{skill.description ? skill.description.slice(0, 48) + '...' : ''}</p>
                              </div>
                            </div>
                            <div className="sk-skill-row-right">
                              <span className="sk-level-badge" style={{ background: lc.bg, color: lc.text }}>{skill.level}</span>
                              <div className="sk-bar-mini">
                                <div className="sk-bar-mini-fill" style={{ width: skill.percent + '%', background: lc.ring }} />
                              </div>
                              <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <AnimatePresence>
                    {isCatScrollable && !hasCatScrolled && (
                      <motion.div className="sk-scroll-hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                        <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: '2px' }}>Scroll</span>
                          <ChevronDown size={16} />
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* ══ LEVEL 2: Skill Detail Sheet ══ */}
          <AnimatePresence>
            {activeSkill && (
              <div style={{ position: 'relative', zIndex: 9999 }}>
                <motion.div
                  className="sk-sheet-overlay"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => setActiveSkill(null)}
                />
                <motion.div
                  className="sk-sheet sk-sheet--skill"
                  initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                  transition={isMobile ? { type: 'tween', ease: [0.16, 1, 0.3, 1], duration: 0.38 } : { type: 'spring', damping: 32, stiffness: 350, mass: 0.9 }}
                >
                  <div className="sk-sheet-handle" />
                  <div className="sk-sheet-header">
                    <div className="sk-sheet-header-left">
                      <button
                        onClick={() => setActiveSkill(null)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 600, fontSize: 13, padding: 0 }}
                      >
                        <ChevronLeft size={16} />
                        Back
                      </button>
                      <h2 style={{ marginLeft: 4 }}>{activeSkill.name}</h2>
                    </div>
                    <button className="sk-sheet-close" onClick={() => { setActiveSkill(null); }}>
                      <X size={16} />
                    </button>
                  </div>

                  <div className="sk-detail-body" ref={skillSheetRef} onScroll={e => { if(e.target.scrollTop > 10 && !hasSkillScrolled) setHasSkillScrolled(true); }}>
                    {/* Hero ring */}
                    <div className="sk-detail-hero">
                      <div className="sk-ring-wrap">
                        <ProgressRing
                          percent={activeSkill.percent}
                          color={(levelColor[activeSkill.level] || levelColor.Intermediate).ring}
                          size={82}
                        />
                        <div className="sk-ring-label">
                          <span className="sk-ring-pct">{activeSkill.percent}%</span>
                          <span className="sk-ring-sub">mastery</span>
                        </div>
                      </div>
                      <div className="sk-meta-list">
                        <div className="sk-meta-row">
                          <Clock size={13} />
                          <span><strong>{activeSkill.years}y</strong> experience</span>
                        </div>
                        <div className="sk-meta-row">
                          <Briefcase size={13} />
                          <span><strong>{activeSkill.projectCount}+</strong> projects</span>
                        </div>
                        <div className="sk-meta-row">
                          <Star size={13} />
                          <span>
                            <strong style={{ color: (levelColor[activeSkill.level] || levelColor.Intermediate).text }}>
                              {activeSkill.level}
                            </strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    {activeSkill.description && (
                      <div>
                        <p className="sk-section-label">About</p>
                        <p className="sk-desc-card">{activeSkill.description}</p>
                      </div>
                    )}

                    {activeSkill.relatedTools && activeSkill.relatedTools.length > 0 && (
                      <div>
                        <p className="sk-section-label">Ecosystem</p>
                        <div className="sk-tags">
                          {activeSkill.relatedTools.map(t => <span key={t} className="sk-tag">{t}</span>)}
                        </div>
                      </div>
                    )}

                    {activeSkill.projects && activeSkill.projects.length > 0 && (
                      <div>
                        <p className="sk-section-label">Used in</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {activeSkill.projects.map(p => (
                            <div key={p} className="sk-project-row">
                              <Layers size={14} />{p}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <AnimatePresence>
                    {isSkillScrollable && !hasSkillScrolled && (
                      <motion.div className="sk-scroll-hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                        <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: '2px' }}>Scroll</span>
                          <ChevronDown size={16} />
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </>,
        document.body
      )}
    </ScrollReveal>
  );
}
