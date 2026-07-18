import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileText, Mail, Briefcase, Code, GraduationCap, Award, ChevronRight, MapPin, Zap } from 'lucide-react';
import { projectsData } from '../data/projectsData';

/* ── Count-up hook ─────────────────────────────────────────── */
function useCountUp(target, duration = 900) {
  const [val, setVal] = useState('0');
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    const numeric = parseFloat(target);
    if (isNaN(numeric)) { setVal(target); return; }
    const hasDec = String(target).includes('.');
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setVal((numeric * e).toFixed(hasDec ? 1 : 0));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, []);
  return val;
}

const ACCENTS = ['#3b82f6', '#8b5cf6', '#10b981'];

const ACTIONS = [
  { id: 'skills',         Icon: Code,         label: 'Skills',    desc: 'Tech stack' },
  { id: 'projects',       Icon: Briefcase,     label: 'Projects',  desc: 'Showcase' },
  { id: 'education',      Icon: GraduationCap, label: 'Education', desc: 'VIT · 8.7' },
  { id: 'certifications', Icon: Award,         label: 'Certs',     desc: '15+ earned' },
  { id: 'resume',         Icon: FileText,      label: 'Resume',    desc: 'View / DL' },
  { id: 'contact',        Icon: Mail,          label: 'Contact',   desc: 'Say hello' },
];

export default function MobileDashboard({ onNavClick }) {
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 5)  return 'Late night 🌙';
    if (h < 12) return 'Good morning ☀️';
    if (h < 17) return 'Good afternoon 🌤️';
    return 'Good evening 🌆';
  };

  const triggerResume = () => window.dispatchEvent(new CustomEvent('open-resume'));
  const featured = projectsData.filter(p => p.featured).slice(0, 3);

  const cgpa  = useCountUp('8.7');
  const certs = useCountUp('15');
  const projs = useCountUp('5');

  return (
    <>
      <style>{`
        /* ── entire dashboard fills the outer .text-content box ── */
        .hd-root {
          display: flex; flex-direction: column;
          width: 100%; height: 100%;
          overflow-y: auto; overflow-x: hidden;
          -ms-overflow-style: none; scrollbar-width: none;
        }
        .hd-root::-webkit-scrollbar { display: none; }

        /* ── thin divider between sections ── */
        .hd-divider {
          width: 100%; height: 1px;
          background: var(--border-color);
          flex-shrink: 0;
        }

        /* ── section label ── */
        .hd-section-label {
          font-size: 10.5px; font-weight: 800; letter-spacing: .08em;
          text-transform: uppercase; color: var(--text-muted);
          padding: 14px 18px 6px; margin: 0; flex-shrink: 0;
        }

        /* ════════ PROFILE SECTION ════════ */
        .hd-profile {
          display: flex; align-items: center; gap: 14px;
          padding: 18px 18px 16px;
        }
        .hd-avatar {
          width: 60px; height: 60px; border-radius: 16px;
          object-fit: cover; border: 2px solid var(--primary-blue);
          flex-shrink: 0;
        }
        .hd-profile-info { display: flex; flex-direction: column; gap: 3px; flex: 1; min-width: 0; }
        .hd-name {
          font-size: 20px; font-weight: 800; color: var(--text-primary);
          letter-spacing: -.03em; margin: 0; line-height: 1.15;
        }
        .hd-role { font-size: 12px; color: var(--text-secondary); margin: 0; font-weight: 500; }
        .hd-location {
          display: flex; align-items: center; gap: 4px;
          font-size: 11px; color: var(--text-muted); margin: 0;
        }
        .hd-avail {
          display: inline-flex; align-items: center; gap: 5px;
          background: rgba(16,185,129,.1); border: 1px solid rgba(16,185,129,.25);
          border-radius: 20px; padding: 3px 9px;
          font-size: 10px; font-weight: 700; color: #10b981;
          width: fit-content; margin-top: 2px;
        }
        .hd-avail-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #10b981;
          animation: hd-pulse 2s ease-in-out infinite;
        }
        @keyframes hd-pulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:.4; transform:scale(1.5); }
        }

        /* ════════ STATS SECTION ════════ */
        .hd-stats {
          display: grid; grid-template-columns: repeat(3,1fr);
          padding: 6px 0;
        }
        .hd-stat {
          display: flex; flex-direction: column; align-items: center;
          padding: 12px 8px;
          border-right: 1px solid var(--border-color);
        }
        .hd-stat:last-child { border-right: none; }
        .hd-stat-val {
          font-size: 20px; font-weight: 800; margin: 0; line-height: 1;
        }
        .hd-stat-lbl {
          font-size: 9.5px; font-weight: 700; color: var(--text-muted);
          text-transform: uppercase; letter-spacing: .06em; margin: 4px 0 0;
        }

        /* ════════ FEATURED PROJECTS ════════ */
        .hd-feat-row {
          display: flex; align-items: center; gap: 12px;
          padding: 13px 18px; width: 100%; text-align: left;
          background: none; border: none; cursor: pointer;
          border-bottom: 1px solid var(--border-color); outline: none;
          transition: background .12s; position: relative;
          -webkit-tap-highlight-color: transparent;
        }
        .hd-feat-row:last-child { border-bottom: none; }
        .hd-feat-row:active { background: var(--bg-primary); }
        .hd-feat-stripe {
          position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
        }
        .hd-feat-icon {
          width: 36px; height: 36px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .hd-feat-body { flex: 1; min-width: 0; }
        .hd-feat-title {
          font-size: 13px; font-weight: 700; color: var(--text-primary); margin: 0;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .hd-feat-sub {
          font-size: 10.5px; color: var(--text-muted); font-weight: 500; margin: 2px 0 0;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .hd-feat-chip {
          flex-shrink: 0; font-size: 11px; font-weight: 800;
          padding: 3px 8px; border-radius: 8px;
        }
        .hd-feat-chevron { color: var(--text-muted); flex-shrink: 0; }

        /* see-all row */
        .hd-see-all-row {
          display: flex; align-items: center; justify-content: center;
          padding: 11px 18px; gap: 4px;
          font-size: 12.5px; font-weight: 600; color: var(--primary-blue);
          background: none; border: none; cursor: pointer; width: 100%;
          -webkit-tap-highlight-color: transparent;
        }

        /* ════════ QUICK-ACCESS GRID ════════ */
        .hd-actions-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
        }
        .hd-action-btn {
          display: flex; flex-direction: column; align-items: center; gap: 7px;
          padding: 16px 8px; background: none; border: none; cursor: pointer;
          border-right: 1px solid var(--border-color);
          border-bottom: 1px solid var(--border-color);
          outline: none; transition: background .12s;
          -webkit-tap-highlight-color: transparent;
        }
        .hd-action-btn:nth-child(3n)   { border-right: none; }
        .hd-action-btn:nth-child(n+4)  { border-bottom: none; }
        .hd-action-btn:active { background: var(--bg-primary); }
        .hd-action-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: var(--bg-primary); border: 1px solid var(--border-color);
          display: flex; align-items: center; justify-content: center;
          color: var(--primary-blue);
        }
        .hd-action-label {
          font-size: 11.5px; font-weight: 700; color: var(--text-primary); margin: 0;
        }
        .hd-action-desc {
          font-size: 9.5px; color: var(--text-muted); margin: 0; text-align: center;
        }

        /* ════════ BIO ════════ */
        .hd-bio {
          padding: 14px 18px 18px;
          font-size: 12.5px; color: var(--text-secondary);
          line-height: 1.55; margin: 0;
        }
      `}</style>

      <div className="hd-root">

        {/* ── Profile ───────────────────────────────────────────── */}
        <motion.div
          className="hd-profile"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <img src="/IMG_0322.jpg" alt="Sujith Thota" className="hd-avatar" id="profile-avatar-img" />
          <div className="hd-profile-info">
            <h1 className="hd-name">Sujith Thota</h1>
            <p className="hd-role">Data Science · Full Stack Dev</p>
            <p className="hd-location"><MapPin size={10} /> VIT University</p>
            <div className="hd-avail">
              <div className="hd-avail-dot" />
              Available for opportunities
            </div>
          </div>
        </motion.div>

        <div className="hd-divider" />

        {/* ── Stats ─────────────────────────────────────────────── */}
        <p className="hd-section-label">At a Glance</p>
        <motion.div
          className="hd-stats"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.08 }}
        >
          <div className="hd-stat">
            <span className="hd-stat-val" style={{ color: '#3b82f6' }}>{cgpa}</span>
            <span className="hd-stat-lbl">VIT CGPA</span>
          </div>
          <div className="hd-stat">
            <span className="hd-stat-val" style={{ color: '#8b5cf6' }}>{certs}+</span>
            <span className="hd-stat-lbl">Certs</span>
          </div>
          <div className="hd-stat">
            <span className="hd-stat-val" style={{ color: '#10b981' }}>{projs}+</span>
            <span className="hd-stat-lbl">ML Projects</span>
          </div>
        </motion.div>

        <div className="hd-divider" />

        {/* ── Featured Projects ─────────────────────────────────── */}
        <p className="hd-section-label">Featured Projects</p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.14 }}
        >
          {featured.map((project, i) => {
            const accent = ACCENTS[i % 3];
            return (
              <button
                key={project.id}
                className="hd-feat-row"
                onClick={() => onNavClick?.('projects')}
              >
                <div className="hd-feat-stripe" style={{ background: accent }} />
                <div className="hd-feat-icon" style={{ background: `${accent}18`, color: accent, border: `1px solid ${accent}28` }}>
                  <Zap size={15} />
                </div>
                <div className="hd-feat-body">
                  <p className="hd-feat-title">{project.title}</p>
                  <p className="hd-feat-sub">{project.tags.slice(0, 3).join(' · ')}</p>
                </div>
                {project.stats?.[0] && (
                  <div className="hd-feat-chip" style={{ color: accent, background: `${accent}12`, border: `1px solid ${accent}25` }}>
                    {project.stats[0].prefix}{project.stats[0].value}{project.stats[0].suffix}
                  </div>
                )}
                <ChevronRight size={14} className="hd-feat-chevron" />
              </button>
            );
          })}
          <button className="hd-see-all-row" onClick={() => onNavClick?.('projects')}>
            See all projects <ChevronRight size={14} />
          </button>
        </motion.div>

        <div className="hd-divider" />

        {/* ── Quick Access ─────────────────────────────────────── */}
        <p className="hd-section-label">Quick Access</p>
        <motion.div
          className="hd-actions-grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {ACTIONS.map(({ id, Icon, label, desc }) => (
            <button
              key={id}
              className="hd-action-btn"
              onClick={id === 'resume' ? triggerResume : () => onNavClick?.(id)}
            >
              <div className="hd-action-icon"><Icon size={17} /></div>
              <p className="hd-action-label">{label}</p>
              <p className="hd-action-desc">{desc}</p>
            </button>
          ))}
        </motion.div>

        <div className="hd-divider" />

        {/* ── Bio ────────────────────────────────────────────────── */}
        <p className="hd-section-label">About Me</p>
        <motion.p
          className="hd-bio"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          A passionate <strong>B.Tech Graduate from VIT (8.7 CGPA)</strong>, actively exploring the boundaries between predictive machine learning systems and reactive web frameworks. I love building things that are both intelligent and elegant.
        </motion.p>

      </div>
    </>
  );
}
