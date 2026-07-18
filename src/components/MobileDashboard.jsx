import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Mail, Briefcase, Code, ArrowRight, ChevronRight, ExternalLink, Sparkles, Star, MapPin, Zap } from 'lucide-react';
import { projectsData } from '../data/projectsData';

const STATS = [
  { value: '8.7', label: 'VIT CGPA', color: '#3b82f6' },
  { value: '15+', label: 'Certs', color: '#8b5cf6' },
  { value: '5+', label: 'ML Projects', color: '#10b981' },
  { value: '2+', label: 'Yrs Exp', color: '#f59e0b' },
];

const QUICK_ACTIONS = [
  { id: 'skills', icon: Code, label: 'Skills', desc: 'Tech stack', color: '#3b82f6' },
  { id: 'projects', icon: Briefcase, label: 'Projects', desc: 'Showcase', color: '#8b5cf6' },
  { id: 'resume', icon: FileText, label: 'Resume', desc: 'Download', color: '#10b981' },
  { id: 'contact', icon: Mail, label: 'Contact', desc: 'Connect', color: '#f59e0b' },
];

function useCountUp(target, duration = 1000) {
  const [val, setVal] = useState(0);
  const hasRun = useRef(false);
  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    const numeric = parseFloat(target);
    if (isNaN(numeric)) { setVal(target); return; }
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal((numeric * eased).toFixed(target.includes('.') ? 1 : 0));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, []);
  return val;
}

function StatPill({ value, label, color, delay }) {
  const display = useCountUp(value);
  return (
    <motion.div
      className="hero-stat-pill"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 300, damping: 24 }}
      style={{ '--pill-color': color }}
    >
      <span className="stat-pill-value">{display}{value.includes('+') ? '+' : ''}</span>
      <span className="stat-pill-label">{label}</span>
    </motion.div>
  );
}

function FeaturedCard({ project, index, onNavClick }) {
  const gradient = [
    'linear-gradient(135deg, #1e3a5f 0%, #0f2340 100%)',
    'linear-gradient(135deg, #2d1b69 0%, #1a0f3d 100%)',
    'linear-gradient(135deg, #0f3d2d 0%, #072518 100%)',
  ][index % 3];

  const accent = ['#60a5fa', '#a78bfa', '#34d399'][index % 3];

  return (
    <motion.button
      className="featured-card"
      style={{ background: gradient }}
      onClick={() => onNavClick?.('projects')}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + index * 0.1, type: 'spring', stiffness: 260, damping: 22 }}
      whileTap={{ scale: 0.97 }}
    >
      {/* Glow orb */}
      <div className="fc-glow" style={{ background: accent }} />

      {/* Top badge */}
      <div className="fc-top-row">
        <span className="fc-category-badge" style={{ color: accent, background: `${accent}20`, border: `1px solid ${accent}30` }}>
          <Zap size={10} /> ML Project
        </span>
        {project.liveUrl && project.liveUrl !== '#' && (
          <span className="fc-live-badge">
            <span className="fc-live-dot" />
            Live
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="fc-title">{project.title}</h3>
      <p className="fc-desc">{project.description.substring(0, 80)}...</p>

      {/* Tags */}
      <div className="fc-tags">
        {project.tags.slice(0, 3).map(tag => (
          <span key={tag} className="fc-tag" style={{ color: accent, borderColor: `${accent}30` }}>{tag}</span>
        ))}
      </div>

      {/* Footer */}
      <div className="fc-footer">
        {project.stats?.slice(0, 2).map(s => (
          <div key={s.label} className="fc-stat">
            <span className="fc-stat-val" style={{ color: accent }}>{s.prefix}{s.value}{s.suffix}</span>
            <span className="fc-stat-lbl">{s.label}</span>
          </div>
        ))}
        <div className="fc-arrow" style={{ color: accent }}>
          <ChevronRight size={18} />
        </div>
      </div>
    </motion.button>
  );
}

export default function MobileDashboard({ onNavClick }) {
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 5) return '🌙 Late night';
    if (h < 12) return '☀️ Good morning';
    if (h < 17) return '🌤️ Good afternoon';
    return '🌆 Good evening';
  };

  const triggerResume = () => window.dispatchEvent(new CustomEvent('open-resume'));

  const featured = projectsData.filter(p => p.featured).slice(0, 3);

  return (
    <div className="ios-hero-shell">
      <style>{`
        .ios-hero-shell {
          display: flex; flex-direction: column;
          height: 100%; width: 100%; overflow-y: auto; overflow-x: hidden;
          gap: 0; padding-bottom: 16px; box-sizing: border-box;
          -ms-overflow-style: none; scrollbar-width: none;
        }
        .ios-hero-shell::-webkit-scrollbar { display: none; }

        /* ── Hero Header ── */
        .ios-hero-header {
          position: relative; width: 100%; overflow: hidden;
          border-radius: 28px; margin-bottom: 16px; flex-shrink: 0;
          min-height: 220px;
        }
        .ios-hero-bg {
          position: absolute; inset: 0; z-index: 0;
          background: linear-gradient(160deg, #0f2340 0%, #1a1150 50%, #0f3020 100%);
        }
        .ios-hero-bg-img {
          position: absolute; inset: 0; z-index: 1;
          background-image: url('/IMG_0322.jpg');
          background-size: cover; background-position: center top;
          opacity: 0.18; filter: blur(2px);
        }
        .ios-hero-grain {
          position: absolute; inset: 0; z-index: 2;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E");
          opacity: 0.4; pointer-events: none;
        }
        .ios-hero-content {
          position: relative; z-index: 3; padding: 20px 20px 24px;
        }

        /* Top row */
        .ios-hero-toprow {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 18px;
        }
        .ios-greeting-badge {
          font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.6);
          text-transform: uppercase; letter-spacing: 0.08em;
        }
        .ios-avail-badge {
          display: flex; align-items: center; gap: 5px;
          background: rgba(16,185,129,0.2); border: 1px solid rgba(16,185,129,0.35);
          border-radius: 20px; padding: 4px 10px;
          font-size: 10px; font-weight: 700; color: #34d399;
          letter-spacing: 0.04em;
        }
        .ios-avail-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #34d399;
          animation: ios-pulse 2s ease-in-out infinite;
        }
        @keyframes ios-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.4); }
        }

        /* Name card */
        .ios-hero-namecard {
          display: flex; align-items: center; gap: 14px; margin-bottom: 18px;
        }
        .ios-hero-avatar {
          width: 56px; height: 56px; border-radius: 16px;
          object-fit: cover; border: 2px solid rgba(255,255,255,0.2);
          flex-shrink: 0;
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        }
        .ios-hero-name {
          font-size: 26px; font-weight: 900; color: #fff;
          letter-spacing: -0.03em; line-height: 1.1; margin: 0;
        }
        .ios-hero-role {
          font-size: 12px; color: rgba(255,255,255,0.55); font-weight: 500; margin-top: 3px;
        }
        .ios-hero-location {
          display: flex; align-items: center; gap: 4px;
          font-size: 11px; color: rgba(255,255,255,0.4); font-weight: 500; margin-top: 2px;
        }

        /* Stat pills row */
        .hero-stats-row {
          display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px;
          -ms-overflow-style: none; scrollbar-width: none;
        }
        .hero-stats-row::-webkit-scrollbar { display: none; }
        .hero-stat-pill {
          display: flex; flex-direction: column; align-items: center;
          background: rgba(255,255,255,0.1); backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 14px; padding: 8px 14px; flex-shrink: 0; min-width: 58px;
        }
        .stat-pill-value {
          font-size: 16px; font-weight: 900; color: #fff; line-height: 1.1;
        }
        .stat-pill-label {
          font-size: 9px; font-weight: 700; color: rgba(255,255,255,0.5);
          text-transform: uppercase; letter-spacing: 0.06em; margin-top: 2px;
        }

        /* ── Section Header ── */
        .ios-section-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 4px; margin-bottom: 12px; flex-shrink: 0;
        }
        .ios-section-title {
          font-size: 17px; font-weight: 800; color: var(--text-primary);
          letter-spacing: -0.02em; margin: 0;
        }
        .ios-section-see-all {
          font-size: 13px; font-weight: 600; color: var(--primary-blue);
          background: none; border: none; cursor: pointer; padding: 0;
        }

        /* ── Featured Horizontal Scroll ── */
        .featured-scroll-wrap {
          display: flex; gap: 14px; overflow-x: auto; padding: 4px 0 8px;
          -ms-overflow-style: none; scrollbar-width: none; flex-shrink: 0;
        }
        .featured-scroll-wrap::-webkit-scrollbar { display: none; }
        .featured-card {
          flex-shrink: 0; width: 240px; border-radius: 20px;
          padding: 18px; text-align: left; position: relative; overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08); cursor: pointer;
          display: flex; flex-direction: column; gap: 10px;
        }
        .fc-glow {
          position: absolute; top: -40px; right: -40px; width: 100px; height: 100px;
          border-radius: 50%; opacity: 0.25; filter: blur(30px); pointer-events: none;
        }
        .fc-top-row {
          display: flex; align-items: center; justify-content: space-between; gap: 6px;
        }
        .fc-category-badge {
          display: flex; align-items: center; gap: 4px;
          font-size: 10px; font-weight: 700; border-radius: 8px; padding: 3px 8px;
          letter-spacing: 0.04em;
        }
        .fc-live-badge {
          display: flex; align-items: center; gap: 4px;
          font-size: 10px; font-weight: 700; color: #34d399;
          background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3);
          border-radius: 8px; padding: 3px 7px;
        }
        .fc-live-dot {
          width: 5px; height: 5px; border-radius: 50%; background: #34d399;
          animation: ios-pulse 2s infinite;
        }
        .fc-title {
          font-size: 15px; font-weight: 800; color: #fff;
          letter-spacing: -0.02em; margin: 0; line-height: 1.2;
        }
        .fc-desc {
          font-size: 11px; color: rgba(255,255,255,0.5); line-height: 1.45; margin: 0;
        }
        .fc-tags { display: flex; gap: 5px; flex-wrap: wrap; }
        .fc-tag {
          font-size: 10px; font-weight: 600; border: 1px solid;
          border-radius: 6px; padding: 2px 7px; background: rgba(255,255,255,0.05);
        }
        .fc-footer {
          display: flex; align-items: center; gap: 12px; margin-top: 4px;
          padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.08);
        }
        .fc-stat { display: flex; flex-direction: column; }
        .fc-stat-val { font-size: 14px; font-weight: 800; line-height: 1; }
        .fc-stat-lbl { font-size: 9px; color: rgba(255,255,255,0.45); font-weight: 600; text-transform: uppercase; letter-spacing: .04em; margin-top: 1px; }
        .fc-arrow { margin-left: auto; }

        /* ── Quick Actions 2x2 Grid ── */
        .ios-actions-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 10px; flex-shrink: 0; margin-top: 4px;
        }
        .ios-action-card {
          background: var(--bg-secondary); border: 1px solid var(--border-color);
          border-radius: 18px; padding: 14px 16px; cursor: pointer;
          display: flex; flex-direction: column; gap: 10px; text-align: left;
          transition: border-color 0.15s, transform 0.1s;
          -webkit-tap-highlight-color: transparent;
        }
        .ios-action-card:active { transform: scale(0.96); border-color: var(--primary-blue); }
        .ios-action-icon {
          width: 36px; height: 36px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
        }
        .ios-action-label {
          font-size: 14px; font-weight: 700; color: var(--text-primary); margin: 0;
        }
        .ios-action-desc {
          font-size: 11px; color: var(--text-muted); margin: 0;
        }
      `}</style>

      {/* ── iOS Hero Header ── */}
      <div className="ios-hero-header">
        <div className="ios-hero-bg" />
        <div className="ios-hero-bg-img" />
        <div className="ios-hero-grain" />
        <div className="ios-hero-content">
          {/* Top row */}
          <motion.div
            className="ios-hero-toprow"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="ios-greeting-badge">{getGreeting()}</span>
            <div className="ios-avail-badge">
              <div className="ios-avail-dot" />
              Available
            </div>
          </motion.div>

          {/* Name card */}
          <motion.div
            className="ios-hero-namecard"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <img src="/IMG_0322.jpg" alt="Sujith Thota" className="ios-hero-avatar" id="profile-avatar-img" />
            <div>
              <h1 className="ios-hero-name">Sujith Thota</h1>
              <p className="ios-hero-role">Data Science · Full Stack Dev</p>
              <div className="ios-hero-location">
                <MapPin size={10} />
                VIT University · 8.7 CGPA
              </div>
            </div>
          </motion.div>

          {/* Stat pills */}
          <div className="hero-stats-row">
            {STATS.map((s, i) => (
              <StatPill key={s.label} value={s.value} label={s.label} color={s.color} delay={0.2 + i * 0.06} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Featured Projects ── */}
      <div className="ios-section-header">
        <h2 className="ios-section-title">Featured</h2>
        <button className="ios-section-see-all" onClick={() => onNavClick?.('projects')}>See All</button>
      </div>

      <div className="featured-scroll-wrap">
        {featured.map((project, i) => (
          <FeaturedCard key={project.id} project={project} index={i} onNavClick={onNavClick} />
        ))}
      </div>

      {/* ── Quick Actions ── */}
      <div className="ios-section-header" style={{ marginTop: '16px' }}>
        <h2 className="ios-section-title">Quick Access</h2>
      </div>

      <div className="ios-actions-grid">
        {QUICK_ACTIONS.map(({ id, icon: Icon, label, desc, color }, i) => (
          <motion.button
            key={id}
            className="ios-action-card"
            onClick={id === 'resume' ? triggerResume : () => onNavClick?.(id)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.07, type: 'spring', stiffness: 300, damping: 24 }}
          >
            <div className="ios-action-icon" style={{ background: `${color}1a` }}>
              <Icon size={18} style={{ color }} />
            </div>
            <div>
              <p className="ios-action-label">{label}</p>
              <p className="ios-action-desc">{desc}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
