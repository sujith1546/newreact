// src/pages/Skills.jsx — FULL REDESIGN
// Mobile: Settings-style grouped rows + skill detail slide-up sheet
// Desktop: Unchanged 2-col card grid

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronDown, Star, Layers, Clock, Briefcase } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';
import { skillCategories } from '../data/skillsData';
import { categoryIconMap } from '../components/skillIcons';
import SkillTooltip from '../components/SkillTooltip';

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
  Intermediate: { bg: 'rgba(234, 179,  8, 0.1)', text: '#ca8a04', ring: '#eab308' },
  Learning:     { bg: 'rgba(99, 102, 241, 0.1)', text: '#6366f1', ring: '#6366f1' },
};

function ProgressRing({ percent, color, size = 80 }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border-color)" strokeWidth={7} />
      <motion.circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={7}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      />
    </svg>
  );
}

export default function Skills() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  const [activeSkill, setActiveSkill] = useState(null);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isScrollable, setIsScrollable] = useState(false);
  const sheetContentRef = useRef(null);

  useEffect(() => {
    if (activeSkill) {
      setHasScrolled(false);
      setIsScrollable(false);
      setTimeout(() => {
        if (sheetContentRef.current) {
          const { scrollHeight, clientHeight } = sheetContentRef.current;
          setIsScrollable(scrollHeight > clientHeight + 5);
        }
      }, 180);
    }
  }, [activeSkill]);

  const handleScroll = (e) => {
    if (e.target.scrollTop > 10 && !hasScrolled) setHasScrolled(true);
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <ScrollReveal>
      <style>{`
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
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
          display: flex; flex-direction: column;
        }
        .skill-category-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.06);
          border-color: #d1d5db;
        }
        .skill-category-header {
          display: flex; align-items: center; gap: 12px; margin-bottom: 20px;
        }
        .skill-category-icon {
          width: 44px; height: 44px; border-radius: 12px;
          background: #f3f4f6; color: #111827;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .skill-category-title {
          font-size: 16px; font-weight: 700; color: var(--text-primary); margin: 0;
        }
        .skill-pills { display: flex; flex-wrap: wrap; gap: 10px; }
        .skill-pill {
          display: inline-block; font-size: 12px; font-weight: 600;
          background: #f9fafb; color: #4b5563;
          border: 1px solid #e5e7eb; padding: 6px 14px;
          border-radius: 999px; transition: all 0.2s ease; cursor: crosshair;
        }
        .skill-pill:hover { background: #111827; color: #fff; border-color: #111827; }
        [data-theme="dark"] .skill-category-card { border-color: #374151; }
        [data-theme="dark"] .skill-category-card:hover { border-color: #4b5563; }
        [data-theme="dark"] .skill-category-icon { background: #374151; color: #f3f4f6; }
        [data-theme="dark"] .skill-pill { background: rgba(255,255,255,0.03); color: #d1d5db; border-color: #374151; }
        [data-theme="dark"] .skill-pill:hover { background: #f3f4f6; color: #111827; border-color: #f3f4f6; }

        @media (max-width: 900px) {
          .skills-mobile-list {
            display: flex;
            flex-direction: column;
            gap: 28px;
          }
          .skills-group {
            display: flex;
            flex-direction: column;
          }
          .skills-group-label {
            font-size: 11.5px;
            font-weight: 700;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.06em;
            margin-bottom: 10px;
            padding-left: 4px;
          }
          .skills-group-card {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            overflow: hidden;
          }
          .skill-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 13px 16px;
            border-bottom: 1px solid var(--border-color);
            background: transparent;
            border-left: none; border-right: none; border-top: none;
            width: 100%; text-align: left;
            cursor: pointer;
            transition: background 0.15s;
            gap: 12px;
          }
          .skill-row:last-child { border-bottom: none; }
          .skill-row:active { background: var(--bg-primary); }
          .skill-row-left {
            display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0;
          }
          .skill-row-icon {
            width: 34px; height: 34px; border-radius: 10px;
            display: flex; align-items: center; justify-content: center;
            flex-shrink: 0;
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            color: var(--text-secondary);
            font-size: 11px; font-weight: 800; letter-spacing: -0.5px;
            font-family: inherit;
          }
          .skill-row-text { flex: 1; min-width: 0; }
          .skill-row-text h4 {
            font-size: 14px; font-weight: 600;
            color: var(--text-primary); margin: 0 0 2px;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          }
          .skill-row-text p {
            font-size: 11px; color: var(--text-secondary); margin: 0;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          }
          .skill-row-right {
            display: flex; align-items: center; gap: 8px; flex-shrink: 0;
          }
          .skill-progress-mini {
            width: 48px; height: 4px;
            background: var(--border-color);
            border-radius: 2px; overflow: hidden;
            flex-shrink: 0;
          }
          .skill-progress-mini-fill {
            height: 100%; border-radius: 2px;
          }
          .skill-sheet-overlay {
            position: fixed; inset: 0;
            background: rgba(0,0,0,0.6);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            z-index: 1000;
          }
          .skill-sheet {
            position: fixed; bottom: 0; left: 0; right: 0;
            background: var(--bg-secondary);
            border-top-left-radius: 28px;
            border-top-right-radius: 28px;
            z-index: 1001;
            height: 80vh; height: 80dvh;
            display: flex; flex-direction: column;
            box-shadow: 0 -10px 50px rgba(0,0,0,0.15);
          }
          .skill-sheet-handle {
            width: 40px; height: 4px;
            background: var(--border-color);
            border-radius: 2px;
            margin: 14px auto 0 auto; flex-shrink: 0;
          }
          .skill-sheet-header {
            display: flex; align-items: center; justify-content: space-between;
            padding: 16px 20px 12px;
            border-bottom: 1px solid var(--border-color);
            flex-shrink: 0;
          }
          .skill-sheet-title {
            display: flex; align-items: center; gap: 10px;
          }
          .skill-sheet-title h2 {
            font-size: 18px; font-weight: 700;
            color: var(--text-primary); margin: 0;
          }
          .skill-level-badge {
            font-size: 10px; font-weight: 700; padding: 3px 8px;
            border-radius: 20px; white-space: nowrap;
          }
          .skill-sheet-close {
            width: 30px; height: 30px; border-radius: 15px;
            background: var(--bg-primary); border: 1px solid var(--border-color);
            display: flex; align-items: center; justify-content: center;
            color: var(--text-secondary); cursor: pointer;
          }
          .skill-sheet-body {
            flex: 1; overflow-y: auto; padding: 20px;
            display: flex; flex-direction: column; gap: 20px;
          }
          .skill-sheet-body::-webkit-scrollbar { display: none; }
          .skill-sheet-hero {
            display: flex; align-items: center; gap: 20px;
            padding: 16px;
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: 16px;
          }
          .skill-ring-wrap { position: relative; flex-shrink: 0; }
          .skill-ring-label {
            position: absolute; inset: 0;
            display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            pointer-events: none;
          }
          .skill-ring-pct {
            font-size: 16px; font-weight: 800;
            color: var(--text-primary); line-height: 1;
          }
          .skill-ring-sub {
            font-size: 8px; font-weight: 600;
            color: var(--text-muted);
            text-transform: uppercase; letter-spacing: 0.04em;
          }
          .skill-sheet-meta { flex: 1; display: flex; flex-direction: column; gap: 8px; }
          .skill-meta-row {
            display: flex; align-items: center; gap: 7px;
            font-size: 12px; color: var(--text-secondary);
          }
          .skill-meta-row svg { color: var(--text-muted); flex-shrink: 0; }
          .skill-meta-row strong { color: var(--text-primary); font-weight: 700; }
          .skill-sheet-section-label {
            font-size: 11px; font-weight: 700;
            color: var(--text-secondary); text-transform: uppercase;
            letter-spacing: 0.06em; margin: 0 0 8px;
          }
          .skill-sheet-desc {
            font-size: 13.5px; line-height: 1.6;
            color: var(--text-secondary); margin: 0;
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: 14px; padding: 14px 16px;
          }
          .skill-tags {
            display: flex; flex-wrap: wrap; gap: 7px;
          }
          .skill-tag {
            font-size: 11px; font-weight: 600;
            padding: 5px 11px; border-radius: 20px;
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            color: var(--text-secondary);
          }
          .skill-project-pill {
            display: flex; align-items: center; gap: 8px;
            padding: 11px 14px;
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            font-size: 12.5px; font-weight: 600;
            color: var(--text-primary);
          }
          .skill-project-pill svg { color: var(--text-muted); flex-shrink: 0; }
          .skill-sheet-scroll-indicator {
            position: absolute;
            bottom: 0; left: 0; right: 0;
            height: 70px;
            background: linear-gradient(to top, var(--bg-secondary) 30%, transparent);
            display: flex; justify-content: center;
            align-items: flex-end; padding-bottom: 12px;
            pointer-events: none;
            color: var(--text-secondary); z-index: 100;
          }
        }
      `}</style>

      <motion.div
        className="skills-page"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="skills-header" variants={itemVariants}>
          <h1>Skills &amp; Expertise</h1>
          <p>A look at the technologies and tools I work with</p>
        </motion.div>

        {!isMobile ? (
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
          <motion.div className="skills-mobile-list" variants={containerVariants}>
            {skillCategories.map(category => (
              <motion.div key={category.id} className="skills-group" variants={itemVariants}>
                <div className="skills-group-label">{category.title}</div>
                <div className="skills-group-card">
                  {category.skills.map(skill => {
                    const lc = levelColor[skill.level] || levelColor.Intermediate;
                    const abbr = skill.name.slice(0, 2).toUpperCase();
                    return (
                      <button
                        key={skill.id}
                        className="skill-row"
                        onClick={() => setActiveSkill(skill)}
                      >
                        <div className="skill-row-left">
                          <div className="skill-row-icon">{abbr}</div>
                          <div className="skill-row-text">
                            <h4>{skill.name}</h4>
                            <p>{skill.description ? skill.description.slice(0, 46) + '...' : ''}</p>
                          </div>
                        </div>
                        <div className="skill-row-right">
                          <div className="skill-progress-mini">
                            <div
                              className="skill-progress-mini-fill"
                              style={{ width: skill.percent + '%', background: lc.ring }}
                            />
                          </div>
                          <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            ))}

            {typeof document !== 'undefined' && createPortal(
              <AnimatePresence>
                {activeSkill && (
                  <div style={{ position: 'relative', zIndex: 9999 }}>
                    <motion.div
                      className="skill-sheet-overlay"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setActiveSkill(null)}
                    />
                    <motion.div
                      className="skill-sheet"
                      initial={{ y: '100%' }}
                      animate={{ y: 0 }}
                      exit={{ y: '100%' }}
                      transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                    >
                      <div className="skill-sheet-handle" />
                      <div className="skill-sheet-header">
                        <div className="skill-sheet-title">
                          <span
                            className="skill-level-badge"
                            style={{
                              background: (levelColor[activeSkill.level] || levelColor.Intermediate).bg,
                              color: (levelColor[activeSkill.level] || levelColor.Intermediate).text
                            }}
                          >
                            {activeSkill.level}
                          </span>
                          <h2>{activeSkill.name}</h2>
                        </div>
                        <button className="skill-sheet-close" onClick={() => setActiveSkill(null)}>
                          <X size={16} />
                        </button>
                      </div>
                      <div className="skill-sheet-body" ref={sheetContentRef} onScroll={handleScroll}>
                        <div className="skill-sheet-hero">
                          <div className="skill-ring-wrap">
                            <ProgressRing
                              percent={activeSkill.percent}
                              color={(levelColor[activeSkill.level] || levelColor.Intermediate).ring}
                              size={80}
                            />
                            <div className="skill-ring-label">
                              <span className="skill-ring-pct">{activeSkill.percent}%</span>
                              <span className="skill-ring-sub">mastery</span>
                            </div>
                          </div>
                          <div className="skill-sheet-meta">
                            <div className="skill-meta-row">
                              <Clock size={13} />
                              <span><strong>{activeSkill.years}y</strong> experience</span>
                            </div>
                            <div className="skill-meta-row">
                              <Briefcase size={13} />
                              <span><strong>{activeSkill.projectCount}+</strong> projects</span>
                            </div>
                            <div className="skill-meta-row">
                              <Star size={13} />
                              <span><strong>{activeSkill.level}</strong> proficiency</span>
                            </div>
                          </div>
                        </div>

                        {activeSkill.description && (
                          <div>
                            <p className="skill-sheet-section-label">About</p>
                            <p className="skill-sheet-desc">{activeSkill.description}</p>
                          </div>
                        )}

                        {activeSkill.relatedTools && activeSkill.relatedTools.length > 0 && (
                          <div>
                            <p className="skill-sheet-section-label">Ecosystem</p>
                            <div className="skill-tags">
                              {activeSkill.relatedTools.map(t => (
                                <span key={t} className="skill-tag">{t}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {activeSkill.projects && activeSkill.projects.length > 0 && (
                          <div>
                            <p className="skill-sheet-section-label">Used in</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {activeSkill.projects.map(p => (
                                <div key={p} className="skill-project-pill">
                                  <Layers size={14} />
                                  {p}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <AnimatePresence>
                        {isScrollable && !hasScrolled && (
                          <motion.div
                            className="skill-sheet-scroll-indicator"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <motion.div
                              animate={{ y: [0, 6, 0] }}
                              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                            >
                              <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '2px' }}>Scroll</span>
                              <ChevronDown size={16} />
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>,
              document.body
            )}
          </motion.div>
        )}
      </motion.div>
    </ScrollReveal>
  );
}
