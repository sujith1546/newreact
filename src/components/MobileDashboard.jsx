import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Mail, Briefcase, Code, GraduationCap, Award, ChevronRight, MapPin, Zap } from 'lucide-react';
import { projectsData } from '../data/projectsData';

/* ── Tiny count-up hook ─────────────────────────────────────── */
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

/* ── Stat card (matches existing .stat-card in Home.jsx CSS) ── */
function StatCell({ value, label, color }) {
  const display = useCountUp(value);
  const suffix = String(value).includes('+') ? '+' : '';
  return (
    <div className="home-stat-cell">
      <h4 className="home-stat-val" style={{ color }}>{display}{suffix}</h4>
      <p className="home-stat-lbl">{label}</p>
    </div>
  );
}

/* ── Featured project row card ─────────────────────────────── */
const ACCENTS = ['#3b82f6', '#8b5cf6', '#10b981'];

function FeaturedRow({ project, index, onNavClick }) {
  const accent = ACCENTS[index % 3];
  return (
    <motion.button
      className="home-feat-row"
      onClick={() => onNavClick?.('projects')}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 * index, type: 'spring', stiffness: 280, damping: 24 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* left accent stripe */}
      <div className="home-feat-stripe" style={{ background: accent }} />

      {/* icon */}
      <div className="home-feat-icon" style={{ background: `${accent}18`, color: accent, border: `1px solid ${accent}28` }}>
        <Zap size={16} />
      </div>

      {/* text */}
      <div className="home-feat-body">
        <p className="home-feat-title">{project.title}</p>
        <p className="home-feat-sub">
          {project.tags.slice(0, 3).join(' · ')}
        </p>
      </div>

      {/* stat chip */}
      {project.stats?.[0] && (
        <div className="home-feat-chip" style={{ color: accent, background: `${accent}12`, border: `1px solid ${accent}25` }}>
          {project.stats[0].prefix}{project.stats[0].value}{project.stats[0].suffix}
        </div>
      )}

      <ChevronRight size={15} className="home-feat-chevron" />
    </motion.button>
  );
}

/* ── Quick‑action pill button ──────────────────────────────── */
const ACTIONS = [
  { id: 'skills',          Icon: Code,          label: 'Skills',        desc: 'Tech stack & languages' },
  { id: 'projects',        Icon: Briefcase,      label: 'Projects',      desc: 'ML & web showcase' },
  { id: 'education',       Icon: GraduationCap,  label: 'Education',     desc: 'VIT · 8.7 CGPA' },
  { id: 'certifications',  Icon: Award,          label: 'Certs',         desc: '15+ certificates' },
  { id: 'resume',          Icon: FileText,       label: 'Resume',        desc: 'View or download' },
  { id: 'contact',         Icon: Mail,           label: 'Contact',       desc: 'Send a message' },
];

function ActionCard({ id, Icon, label, desc, index, onNavClick, triggerResume }) {
  const handleClick = id === 'resume' ? triggerResume : () => onNavClick?.(id);
  return (
    <motion.button
      className="home-action-card"
      onClick={handleClick}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.06 * index, type: 'spring', stiffness: 300, damping: 26 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="home-action-icon-wrap">
        <Icon size={17} />
      </div>
      <p className="home-action-label">{label}</p>
      <p className="home-action-desc">{desc}</p>
    </motion.button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MobileDashboard — matches the Skills/Projects "big box" system
   ═══════════════════════════════════════════════════════════════ */
export default function MobileDashboard({ onNavClick }) {
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 5)  return 'Late night';
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };
  const triggerResume = () => window.dispatchEvent(new CustomEvent('open-resume'));
  const featured = projectsData.filter(p => p.featured).slice(0, 3);

  return (
    <>
      <style>{`
        /* ── outer scrollable feed (same as other pages' text-content padding) ── */
        .home-mob-feed {
          display: flex; flex-direction: column; gap: 16px;
          width: 100%; overflow-y: auto; padding-bottom: 16px;
          -ms-overflow-style: none; scrollbar-width: none;
        }
        .home-mob-feed::-webkit-scrollbar { display: none; }

        /* ── shared "big box" card — identical border radius / border to sk-cat-card ── */
        .home-mob-box {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          overflow: hidden;
          flex-shrink: 0;
        }

        /* ── box header bar ── */
        .home-box-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 18px 12px;
          border-bottom: 1px solid var(--border-color);
        }
        .home-box-header-left {
          display: flex; align-items: center; gap: 8px;
        }
        .home-box-title {
          font-size: 13px; font-weight: 700; color: var(--text-primary);
          text-transform: uppercase; letter-spacing: 0.06em; margin: 0;
        }
        .home-box-see-all {
          font-size: 12px; font-weight: 600; color: var(--primary-blue);
          background: none; border: none; cursor: pointer; padding: 0;
        }

        /* ── Profile card inside box ── */
        .home-profile-inner {
          display: flex; align-items: center; gap: 14px; padding: 16px 18px 18px;
        }
        .home-profile-avatar {
          width: 58px; height: 58px; border-radius: 16px; object-fit: cover;
          border: 1.5px solid var(--primary-blue); flex-shrink: 0;
        }
        .home-profile-text { display: flex; flex-direction: column; gap: 3px; }
        .home-profile-name {
          font-size: 19px; font-weight: 800; color: var(--text-primary);
          letter-spacing: -0.02em; margin: 0; line-height: 1.15;
        }
        .home-profile-role {
          font-size: 12px; font-weight: 500; color: var(--text-secondary); margin: 0;
        }
        .home-profile-location {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 11px; color: var(--text-muted); margin: 0;
        }
        .home-avail-badge {
          display: inline-flex; align-items: center; gap: 5px;
          background: rgba(16,185,129,.1); border: 1px solid rgba(16,185,129,.25);
          border-radius: 20px; padding: 4px 10px;
          font-size: 10.5px; font-weight: 700; color: #10b981;
          margin-top: 4px; width: fit-content;
        }
        .home-avail-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #10b981;
          animation: avail-pulse 2s ease-in-out infinite;
        }
        @keyframes avail-pulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:.4; transform:scale(1.5); }
        }

        /* ── Stats 3-col grid inside box ── */
        .home-stats-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 0;
        }
        .home-stat-cell {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 14px 6px; border-right: 1px solid var(--border-color);
        }
        .home-stat-cell:last-child { border-right: none; }
        .home-stat-val {
          font-size: 18px; font-weight: 800; margin: 0; line-height: 1.1;
        }
        .home-stat-lbl {
          font-size: 9px; font-weight: 700; color: var(--text-muted);
          text-transform: uppercase; letter-spacing: .06em; margin: 3px 0 0;
        }

        /* ── Featured project rows inside box ── */
        .home-feat-row {
          display: flex; align-items: center; gap: 12px;
          padding: 13px 16px; width: 100%; text-align: left;
          background: none; border: none; cursor: pointer; position: relative;
          border-bottom: 1px solid var(--border-color); outline: none;
          transition: background .12s;
          -webkit-tap-highlight-color: transparent;
        }
        .home-feat-row:last-child { border-bottom: none; }
        .home-feat-row:active { background: var(--bg-primary); }
        .home-feat-stripe {
          position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
          border-radius: 0;
        }
        .home-feat-icon {
          width: 36px; height: 36px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .home-feat-body { flex: 1; min-width: 0; }
        .home-feat-title {
          font-size: 13px; font-weight: 700; color: var(--text-primary);
          margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .home-feat-sub {
          font-size: 10.5px; color: var(--text-muted); font-weight: 500;
          margin: 2px 0 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .home-feat-chip {
          flex-shrink: 0; font-size: 11px; font-weight: 800;
          padding: 3px 8px; border-radius: 8px;
        }
        .home-feat-chevron { color: var(--text-muted); flex-shrink: 0; }

        /* ── Quick-access 3×2 grid inside box ── */
        .home-actions-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 0;
        }
        .home-action-card {
          display: flex; flex-direction: column; align-items: center; gap: 7px;
          padding: 16px 10px; background: none; border: none; cursor: pointer;
          border-right: 1px solid var(--border-color);
          border-bottom: 1px solid var(--border-color);
          outline: none; transition: background .12s;
          -webkit-tap-highlight-color: transparent;
        }
        .home-action-card:nth-child(3n) { border-right: none; }
        .home-action-card:nth-child(n+4) { border-bottom: none; }
        .home-action-card:active { background: var(--bg-primary); }
        .home-action-icon-wrap {
          width: 36px; height: 36px; border-radius: 10px;
          background: var(--bg-primary); border: 1px solid var(--border-color);
          display: flex; align-items: center; justify-content: center;
          color: var(--primary-blue);
        }
        .home-action-label {
          font-size: 12px; font-weight: 700; color: var(--text-primary); margin: 0;
        }
        .home-action-desc {
          font-size: 9.5px; color: var(--text-muted); margin: 0;
          text-align: center; line-height: 1.3;
          display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden;
        }

        /* ── Bio box ── */
        .home-bio-inner {
          padding: 16px 18px;
          font-size: 13px; color: var(--text-secondary); line-height: 1.55; margin: 0;
        }
      `}</style>

      <div className="home-mob-feed">

        {/* ── Box 1: Profile ─────────────────────────────────────── */}
        <motion.div
          className="home-mob-box"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="home-box-header">
            <p className="home-box-title">{getGreeting()} 👋</p>
            <div className="home-avail-badge">
              <div className="home-avail-dot" />
              Available
            </div>
          </div>
          <div className="home-profile-inner">
            <img src="/IMG_0322.jpg" alt="Sujith Thota" className="home-profile-avatar" id="profile-avatar-img" />
            <div className="home-profile-text">
              <h1 className="home-profile-name">Sujith Thota</h1>
              <p className="home-profile-role">Data Science · Full Stack Dev</p>
              <p className="home-profile-location">
                <MapPin size={10} /> VIT University · 8.7 CGPA
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Box 2: Stats ───────────────────────────────────────── */}
        <motion.div
          className="home-mob-box"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.07, duration: 0.35 }}
        >
          <div className="home-box-header">
            <p className="home-box-title">At a Glance</p>
          </div>
          <div className="home-stats-grid">
            <StatCell value="8.7"  label="VIT CGPA"    color="#3b82f6" />
            <StatCell value="15+"  label="Certs"        color="#8b5cf6" />
            <StatCell value="5+"   label="ML Projects"  color="#10b981" />
          </div>
        </motion.div>

        {/* ── Box 3: Featured Projects ────────────────────────────── */}
        <motion.div
          className="home-mob-box"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14, duration: 0.35 }}
        >
          <div className="home-box-header">
            <p className="home-box-title">Featured Projects</p>
            <button className="home-box-see-all" onClick={() => onNavClick?.('projects')}>See All</button>
          </div>
          {featured.map((project, i) => (
            <FeaturedRow key={project.id} project={project} index={i} onNavClick={onNavClick} />
          ))}
        </motion.div>

        {/* ── Box 4: Quick Access ─────────────────────────────────── */}
        <motion.div
          className="home-mob-box"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.21, duration: 0.35 }}
        >
          <div className="home-box-header">
            <p className="home-box-title">Quick Access</p>
          </div>
          <div className="home-actions-grid">
            {ACTIONS.map(({ id, Icon, label, desc }, i) => (
              <ActionCard
                key={id} id={id} Icon={Icon} label={label} desc={desc} index={i}
                onNavClick={onNavClick} triggerResume={triggerResume}
              />
            ))}
          </div>
        </motion.div>

        {/* ── Box 5: Bio ─────────────────────────────────────────── */}
        <motion.div
          className="home-mob-box"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.35 }}
        >
          <div className="home-box-header">
            <p className="home-box-title">About Me</p>
          </div>
          <p className="home-bio-inner">
            A passionate <strong>B.Tech Graduate from VIT (8.7 CGPA)</strong> actively exploring the intersection of predictive machine learning systems and reactive web frameworks. I love building things that are both intelligent and elegant.
          </p>
        </motion.div>

      </div>
    </>
  );
}
