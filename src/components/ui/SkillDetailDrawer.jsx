// src/components/ui/SkillDetailDrawer.jsx
// Desktop slide-over panel that opens when a skill pill is clicked.
// Each skill renders its own detail view; prev/next (buttons or ← →) moves
// through the skills of the same category without closing the drawer.

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Clock, Briefcase, Gauge, Layers, Sparkles, ArrowRight } from 'lucide-react';
import { skillIconMap, fallbackIcon, categoryIconMap } from './skillIcons';

const LEVEL_STYLES = {
  Advanced:     { color: '#3b82f6', soft: 'rgba(59, 130, 246, 0.10)',  border: 'rgba(59, 130, 246, 0.28)' },
  Intermediate: { color: '#ca8a04', soft: 'rgba(234, 179, 8, 0.10)',  border: 'rgba(234, 179, 8, 0.30)' },
  Learning:     { color: '#6366f1', soft: 'rgba(99, 102, 241, 0.10)', border: 'rgba(99, 102, 241, 0.28)' },
};
const TOOL_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4', '#ef4444', '#ec4899'];

function resolveIcon(skill, categoryId) {
  const name = String(skill?.name || '').toLowerCase();
  const candidates = [
    skill?.id,
    skill?.icon,
    name.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    name.replace(/[^a-z0-9]/g, ''),
  ];
  for (const key of candidates) {
    if (key && skillIconMap[key]) return skillIconMap[key];
  }
  return categoryIconMap[categoryId] || fallbackIcon;
}

function formatYears(years) {
  const raw = String(years ?? '').replace(/(\s*yrs?)+$/i, '').trim();
  return raw || '—';
}

function MasteryRing({ percent, color, size = 76 }) {
  const pct = Math.min(Math.max(Number(percent) || 0, 0), 100);
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div className="sdd-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border-color)" strokeWidth={6} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={6} strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (pct / 100) * circ }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        />
      </svg>
      <div className="sdd-ring-label">
        <span className="sdd-ring-pct">{pct}%</span>
        <span className="sdd-ring-sub">mastery</span>
      </div>
    </div>
  );
}

const contentVariants = {
  enter: (dir) => ({ opacity: 0, x: dir >= 0 ? 28 : -28 }),
  center: { opacity: 1, x: 0 },
  exit: (dir) => ({ opacity: 0, x: dir >= 0 ? -28 : 28 }),
};

export default function SkillDetailDrawer({ skill, category, onClose, onNavigate }) {
  const [direction, setDirection] = useState(0);
  const isOpen = Boolean(skill && category);

  const skills = category?.skills || [];
  const index = isOpen ? Math.max(0, skills.findIndex((s) => s.id === skill.id)) : 0;
  const hasPrev = index > 0;
  const hasNext = index < skills.length - 1;

  const go = (step) => {
    const target = skills[index + step];
    if (!target) return;
    setDirection(step);
    onNavigate(target);
  };

  const jumpTo = (target) => {
    const targetIdx = skills.findIndex((s) => s.id === target.id);
    setDirection(targetIdx >= index ? 1 : -1);
    onNavigate(target);
  };

  // Keyboard: Esc closes, ← / → move between skills in the category
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, index, skills, onClose]);

  if (typeof document === 'undefined') return null;

  const level = LEVEL_STYLES[skill?.level] || LEVEL_STYLES.Intermediate;
  const Icon = isOpen ? resolveIcon(skill, category.id) : fallbackIcon;
  const CategoryIcon = isOpen ? (categoryIconMap[category.id] || fallbackIcon) : fallbackIcon;
  const tools = Array.isArray(skill?.relatedTools) ? skill.relatedTools : [];
  const projects = Array.isArray(skill?.projects) ? skill.projects : [];
  const siblings = skills.filter((s) => s.id !== skill?.id);
  const pct = Math.min(Math.max(Number(skill?.percent) || 0, 0), 100);

  // Caps keep the panel a fixed, non-scrolling height; overflow shows as "+N"
  const MAX_TOOLS = 6;
  const MAX_PROJECTS = 4;
  const MAX_SIBLINGS = 6;
  const shownTools = tools.slice(0, MAX_TOOLS);
  const shownProjects = projects.slice(0, MAX_PROJECTS);
  const shownSiblings = siblings.slice(0, MAX_SIBLINGS);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="sdd-root" key="skill-drawer">
          <style>{SDD_CSS}</style>

          <motion.div
            className="sdd-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={onClose}
          />

          <motion.aside
            className="sdd-panel"
            role="dialog"
            aria-modal="true"
            aria-label={`${skill.name} details`}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320, mass: 0.9 }}
            style={{ '--sdd-level': level.color, '--sdd-level-soft': level.soft, '--sdd-level-border': level.border }}
          >
            <div className="sdd-accent" />

            {/* Header */}
            <header className="sdd-header">
              <div className="sdd-crumb">
                <span className="sdd-crumb-icon"><CategoryIcon size={15} /></span>
                <div className="sdd-crumb-text">
                  <span className="sdd-crumb-title">{category.title}</span>
                  <span className="sdd-crumb-sub">Skill {index + 1} of {skills.length}</span>
                </div>
              </div>
              <motion.button
                type="button"
                className="sdd-icon-btn"
                onClick={onClose}
                aria-label="Close skill details"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
              >
                <X size={16} />
              </motion.button>
            </header>

            {/* Body — content swaps per skill with a directional slide */}
            <div className="sdd-body">
              <AnimatePresence mode="wait" custom={direction} initial={false}>
                <motion.div
                  key={skill.id}
                  custom={direction}
                  variants={contentVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                  className="sdd-content"
                >
                  {/* Hero */}
                  <section className="sdd-hero">
                    <div className="sdd-hero-icon"><Icon /></div>
                    <div className="sdd-hero-text">
                      <h2 className="sdd-name">{skill.name}</h2>
                      <span className="sdd-level-badge">
                        <Sparkles size={11} /> {skill.level || 'Intermediate'}
                      </span>
                    </div>
                    <MasteryRing percent={pct} color={level.color} />
                  </section>

                  {/* Stats */}
                  <section className="sdd-stats">
                    <div className="sdd-stat">
                      <Clock size={14} />
                      <span className="sdd-stat-num">{formatYears(skill.years)}</span>
                      <span className="sdd-stat-lbl">Years exp.</span>
                    </div>
                    <div className="sdd-stat">
                      <Briefcase size={14} />
                      <span className="sdd-stat-num">{skill.projectCount ? `${skill.projectCount}+` : '—'}</span>
                      <span className="sdd-stat-lbl">Projects</span>
                    </div>
                    <div className="sdd-stat">
                      <Gauge size={14} />
                      <span className="sdd-stat-num">{tools.length || '—'}</span>
                      <span className="sdd-stat-lbl">Tools</span>
                    </div>
                  </section>

                  {skill.description && (
                    <section>
                      <p className="sdd-label">About</p>
                      <p className="sdd-desc" title={skill.description}>{skill.description}</p>
                    </section>
                  )}

                  {tools.length > 0 && (
                    <section>
                      <p className="sdd-label">Ecosystem</p>
                      <div className="sdd-tags">
                        {shownTools.map((t, i) => {
                          const c = TOOL_COLORS[i % TOOL_COLORS.length];
                          return (
                            <span key={`${t}-${i}`} className="sdd-tag" style={{ color: c, background: `${c}14`, borderColor: `${c}33` }}>
                              {t}
                            </span>
                          );
                        })}
                        {tools.length > MAX_TOOLS && (
                          <span className="sdd-more" title={tools.slice(MAX_TOOLS).join(', ')}>+{tools.length - MAX_TOOLS}</span>
                        )}
                      </div>
                    </section>
                  )}

                  {projects.length > 0 && (
                    <section className="sdd-sec-projects">
                      <p className="sdd-label">Used in</p>
                      <div className="sdd-projects">
                        {shownProjects.map((p, i) => (
                          <span key={`${p}-${i}`} className="sdd-project" title={p}>
                            <Layers size={12} />
                            <span className="sdd-project-name">{p}</span>
                          </span>
                        ))}
                        {projects.length > MAX_PROJECTS && (
                          <span className="sdd-more" title={projects.slice(MAX_PROJECTS).join(', ')}>+{projects.length - MAX_PROJECTS} more</span>
                        )}
                      </div>
                    </section>
                  )}

                  {siblings.length > 0 && (
                    <section className="sdd-sec-siblings">
                      <p className="sdd-label">More in {category.title}</p>
                      <div className="sdd-siblings">
                        {shownSiblings.map((s) => (
                          <button key={s.id} type="button" className="sdd-sibling" onClick={() => jumpTo(s)}>
                            {s.name}
                            <ArrowRight size={11} />
                          </button>
                        ))}
                        {siblings.length > MAX_SIBLINGS && (
                          <span className="sdd-more">+{siblings.length - MAX_SIBLINGS}</span>
                        )}
                      </div>
                    </section>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer navigation */}
            <footer className="sdd-footer">
              <button type="button" className="sdd-nav-btn" onClick={() => go(-1)} disabled={!hasPrev}>
                <ChevronLeft size={15} />
                <span className="sdd-nav-text">
                  <span className="sdd-nav-hint">Previous</span>
                  <span className="sdd-nav-name">{hasPrev ? skills[index - 1].name : '—'}</span>
                </span>
              </button>
              <div className="sdd-dots" aria-hidden="true">
                {skills.map((s, i) => (
                  <span key={s.id} className={`sdd-dot${i === index ? ' active' : ''}`} />
                ))}
              </div>
              <button type="button" className="sdd-nav-btn sdd-nav-btn--next" onClick={() => go(1)} disabled={!hasNext}>
                <span className="sdd-nav-text">
                  <span className="sdd-nav-hint">Next</span>
                  <span className="sdd-nav-name">{hasNext ? skills[index + 1].name : '—'}</span>
                </span>
                <ChevronRight size={15} />
              </button>
            </footer>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

const SDD_CSS = `
.sdd-root {
  position: fixed; inset: 0; z-index: 99999;
  /* Same font stack as <body> (typography.css) so the drawer matches every page */
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.sdd-root *, .sdd-root button { font-family: inherit; }
.sdd-backdrop {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
}
.sdd-panel {
  position: fixed; top: 0; right: 0; bottom: 0;
  width: 100%; max-width: 460px;
  background: var(--bg-secondary);
  border-left: 1px solid var(--border-color);
  box-shadow: -10px 0 40px rgba(0, 0, 0, 0.22);
  display: flex; flex-direction: column;
  box-sizing: border-box; overflow: hidden;
  z-index: 100000;
}
.sdd-accent {
  height: 3px; flex-shrink: 0;
  background: linear-gradient(90deg, var(--sdd-level), color-mix(in srgb, var(--sdd-level) 30%, transparent));
}

/* Header */
.sdd-header {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 16px 20px 14px;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}
.sdd-crumb { display: flex; align-items: center; gap: 10px; min-width: 0; }
.sdd-crumb-icon {
  width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: color-mix(in srgb, var(--primary-blue) 12%, transparent);
  color: var(--primary-blue);
}
.sdd-crumb-text { display: flex; flex-direction: column; min-width: 0; }
.sdd-crumb-title {
  font-size: 13.5px; font-weight: 800; color: var(--text-primary);
  letter-spacing: -0.01em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.sdd-crumb-sub { font-size: 11px; color: var(--text-muted); margin-top: 1px; }
.sdd-icon-btn {
  width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
  border: 1px solid var(--border-color);
  background: var(--bg-primary); color: var(--text-secondary);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; padding: 0;
  transition: color .15s ease, background-color .15s ease;
}
.sdd-icon-btn:hover { color: var(--text-primary); }

/* Body — fixed height, never scrolls; content is sized/capped to fit */
.sdd-body { flex: 1; min-height: 0; overflow: hidden; }
.sdd-content { display: flex; flex-direction: column; gap: 16px; padding: 18px 20px 18px; height: 100%; box-sizing: border-box; overflow: hidden; }

.sdd-hero { display: flex; align-items: center; gap: 14px; }
.sdd-hero-icon {
  width: 52px; height: 52px; border-radius: 14px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: var(--text-primary); color: var(--bg-secondary);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
}
.sdd-hero-icon svg { width: 26px; height: 26px; }
.sdd-hero-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
.sdd-name {
  margin: 0; font-size: 21px; font-weight: 800; line-height: 1.2;
  letter-spacing: -0.02em; color: var(--text-primary);
}
.sdd-level-badge {
  display: inline-flex; align-items: center; gap: 4px; width: fit-content;
  font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 999px;
  color: var(--sdd-level); background: var(--sdd-level-soft); border: 1px solid var(--sdd-level-border);
}
.sdd-ring { position: relative; flex-shrink: 0; }
.sdd-ring-label {
  position: absolute; inset: 0; display: flex; flex-direction: column;
  align-items: center; justify-content: center; line-height: 1.1;
}
.sdd-ring-pct { font-size: 16px; font-weight: 800; color: var(--text-primary); }
.sdd-ring-sub { font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; color: var(--text-muted); }

.sdd-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.sdd-stat {
  display: flex; flex-direction: column; gap: 3px;
  padding: 11px 12px; border-radius: 12px;
  background: var(--bg-primary); border: 1px solid var(--border-color);
  color: var(--text-muted);
  transition: border-color .2s ease, transform .2s ease;
}
.sdd-stat:hover { border-color: color-mix(in srgb, var(--primary-blue) 40%, var(--border-color)); transform: translateY(-1px); }
.sdd-stat-num { font-size: 17px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.02em; margin-top: 2px; }
.sdd-stat-lbl { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; }

.sdd-label {
  margin: 0 0 8px; font-size: 10.5px; font-weight: 800;
  text-transform: uppercase; letter-spacing: .08em; color: var(--text-muted);
}
.sdd-desc {
  margin: 0; font-size: 13.5px; line-height: 1.6; color: var(--text-secondary);
  display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden;
}

.sdd-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.sdd-tag { font-size: 11.5px; font-weight: 600; padding: 4px 10px; border-radius: 999px; border: 1px solid; }
.sdd-more {
  display: inline-flex; align-items: center;
  font-size: 11.5px; font-weight: 700; padding: 4px 10px; border-radius: 999px;
  color: var(--text-muted); background: var(--bg-primary);
  border: 1px dashed var(--border-color); cursor: default;
}

.sdd-projects { display: flex; flex-wrap: wrap; gap: 6px; }
.sdd-project {
  display: inline-flex; align-items: center; gap: 6px; max-width: 100%;
  padding: 5px 11px; border-radius: 999px;
  background: var(--bg-primary); border: 1px solid var(--border-color);
  font-size: 12px; font-weight: 600; color: var(--text-primary);
}
.sdd-project svg { color: var(--primary-blue); flex-shrink: 0; }
.sdd-project-name { min-width: 0; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.sdd-siblings { display: flex; flex-wrap: wrap; gap: 6px; }
.sdd-sibling {
  display: inline-flex; align-items: center; gap: 5px;
  font-family: inherit; font-size: 12px; font-weight: 600;
  padding: 5px 11px; border-radius: 999px; cursor: pointer;
  background: var(--bg-primary); color: var(--text-secondary);
  border: 1px solid var(--border-color);
  transition: all .15s ease;
}
.sdd-sibling svg { opacity: 0; width: 0; transition: opacity .15s ease, width .15s ease; }
.sdd-sibling:hover {
  color: var(--primary-blue);
  border-color: color-mix(in srgb, var(--primary-blue) 35%, transparent);
  background: color-mix(in srgb, var(--primary-blue) 8%, transparent);
}
.sdd-sibling:hover svg { opacity: 1; width: 11px; }

/* Footer */
.sdd-footer {
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  padding: 12px 16px; border-top: 1px solid var(--border-color);
  background: var(--bg-secondary); flex-shrink: 0;
}
.sdd-nav-btn {
  display: inline-flex; align-items: center; gap: 8px;
  max-width: 42%; min-width: 0;
  padding: 7px 12px; border-radius: 10px; cursor: pointer;
  font-family: inherit; text-align: left;
  background: var(--bg-primary); color: var(--text-primary);
  border: 1px solid var(--border-color);
  transition: border-color .15s ease, color .15s ease, background .15s ease;
}
.sdd-nav-btn--next { text-align: right; }
.sdd-nav-btn:hover:not(:disabled) {
  border-color: color-mix(in srgb, var(--primary-blue) 40%, transparent);
  color: var(--primary-blue);
}
.sdd-nav-btn:disabled { opacity: .4; cursor: not-allowed; }
.sdd-nav-text { display: flex; flex-direction: column; min-width: 0; }
.sdd-nav-hint { font-size: 9.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--text-muted); }
.sdd-nav-name { font-size: 12px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sdd-dots { display: flex; align-items: center; justify-content: center; gap: 4px; flex: 1; min-width: 0; flex-wrap: wrap; }
.sdd-dot { width: 5px; height: 5px; border-radius: 999px; background: var(--border-color); transition: all .2s ease; }
.sdd-dot.active { width: 14px; background: var(--primary-blue); }

/* Short screens: drop lower-priority sections rather than scroll.
   Above 1024px the site applies html { zoom: 0.72 }, so the panel has
   ~1.39x more layout room than the raw viewport height suggests. */
@media (min-width: 1025px) and (max-height: 520px) {
  .sdd-sec-siblings { display: none; }
  .sdd-desc { -webkit-line-clamp: 3; }
}
@media (min-width: 1025px) and (max-height: 430px) {
  .sdd-sec-projects { display: none; }
  .sdd-desc { -webkit-line-clamp: 2; }
}
@media (max-width: 1024px) and (max-height: 720px) {
  .sdd-sec-siblings { display: none; }
  .sdd-desc { -webkit-line-clamp: 3; }
}
@media (max-width: 1024px) and (max-height: 600px) {
  .sdd-sec-projects { display: none; }
  .sdd-desc { -webkit-line-clamp: 2; }
}
`;
