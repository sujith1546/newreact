import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Loader2, ArrowDown, ChevronLeft, ChevronRight, Clock, Send, FileText, Zap, Code2, Database, Brain, Globe, ExternalLink, Star, TrendingUp, Award, Briefcase } from 'lucide-react';
import useGlitchText from '../../hooks/useGlitchText';
import useRealtimeData from '../../hooks/useRealtimeData';
import { useLocalTime } from '../../hooks/useLocalTime';

/* ── Count-up hook ─────────────────────────────────────────── */
function useCountUp(target, duration = 1100) {
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

const TECH_STACK = [
  { label: 'Python',   color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.3)' },
  { label: 'PyTorch',  color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.3)' },
  { label: 'React',    color: '#06b6d4', bg: 'rgba(6,182,212,0.12)',   border: 'rgba(6,182,212,0.3)' },
  { label: 'FastAPI',  color: '#10b981', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.3)' },
  { label: 'Supabase', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)',  border: 'rgba(139,92,246,0.3)' },
  { label: 'Gemini AI',color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)' },
  { label: 'ChromaDB', color: '#ec4899', bg: 'rgba(236,72,153,0.12)',  border: 'rgba(236,72,153,0.3)' },
  { label: 'LangChain',color: '#6366f1', bg: 'rgba(99,102,241,0.12)',  border: 'rgba(99,102,241,0.3)' },
];

const FEATURED_PROJECT = {
  title: 'SMS Finance Analyzer',
  description: 'Privacy-first RAG pipeline using Gemini 2.5 Flash and ChromaDB to analyze financial SMS data.',
  tags: ['RAG', 'Gemini 2.5', 'ChromaDB', 'Privacy-First'],
  badge: 'Featured',
  accent: '#6366f1',
};

export default function MobileDashboard({ onNavClick }) {
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 5)  return 'Late night 🌙';
    if (h < 12) return 'Good morning ☀️';
    if (h < 17) return 'Good afternoon 🌤️';
    return 'Good evening 🌆';
  };

  const { data: settings, loading } = useRealtimeData('site_settings', {
    single: true,
    filter: { column: 'id', value: 1 }
  });

  const localTime = useLocalTime();
  const cgpa  = useCountUp('8.7');
  const certs = useCountUp('15');
  const projs = useCountUp('5');
  
  const nameText = useGlitchText('Sujith Thota', 100);

  // Pull to refresh logic
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDist, setPullDist]         = useState(0);
  const rootRef = useRef(null);

  const handleTouchStart = (e) => {
    if (rootRef.current && rootRef.current.scrollTop === 0) {
      rootRef.current.startY = e.touches[0].clientY;
    }
  };
  const handleTouchMove = (e) => {
    if (rootRef.current && rootRef.current.startY !== undefined) {
      const y = e.touches[0].clientY;
      const dist = y - rootRef.current.startY;
      if (dist > 0 && rootRef.current.scrollTop === 0) {
        setPullDist(Math.min(dist * 0.4, 80));
      }
    }
  };
  const handleTouchEnd = () => {
    if (pullDist > 60) {
      if (navigator.vibrate) navigator.vibrate(40);
      setIsRefreshing(true);
      setTimeout(() => { setIsRefreshing(false); setPullDist(0); }, 1500);
    } else {
      setPullDist(0);
    }
    if (rootRef.current) rootRef.current.startY = undefined;
  };

  if (loading) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="spin" size={24} color="var(--text-muted)" />
      </div>
    );
  }

  return (
    <>
      <style>{`
        /* ── root scrollable container ── */
        .hd-root {
          display: flex; flex-direction: column;
          width: 100%; height: 100%;
          overflow-y: auto; overflow-x: hidden;
          -ms-overflow-style: none; scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
        }
        .hd-root::-webkit-scrollbar { display: none; }

        /* ── thin divider ── */
        .hd-divider {
          width: 100%; height: 1px;
          background: var(--border-color);
          flex-shrink: 0; opacity: 0.7;
        }

        /* ── section label ── */
        .hd-section-label {
          font-size: 9px; font-weight: 800; letter-spacing: .09em;
          text-transform: uppercase; color: var(--text-muted);
          padding: 14px 16px 6px; margin: 0; flex-shrink: 0;
          display: flex; align-items: center; gap: 6px;
        }

        /* ════════ PROFILE SECTION ════════ */
        .hd-profile {
          display: flex; align-items: center; gap: 14px;
          padding: 18px 18px 14px;
        }
        .hd-avatar-wrap {
          position: relative; flex-shrink: 0;
        }
        .hd-avatar {
          width: 56px; height: 56px; border-radius: 16px;
          object-fit: cover;
          border: 2px solid transparent;
          background: linear-gradient(var(--bg-primary), var(--bg-primary)) padding-box,
                      linear-gradient(135deg, #6366f1, #06b6d4, #10b981) border-box;
        }
        .hd-avatar-ring {
          position: absolute; inset: -3px; border-radius: 18px;
          border: 2px solid transparent;
          background: linear-gradient(135deg, rgba(99,102,241,0.4), rgba(6,182,212,0.4)) border-box;
          pointer-events: none;
        }
        .hd-profile-info { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
        .hd-name {
          font-size: 18px; font-weight: 800; color: var(--text-primary);
          letter-spacing: -.04em; margin: 0; line-height: 1.1;
        }
        .hd-role {
          font-size: 10.5px; color: var(--text-secondary); margin: 0; font-weight: 500;
          display: flex; align-items: center; gap: 5px;
        }
        .hd-location {
          display: flex; align-items: center; gap: 4px;
          font-size: 9.5px; color: var(--text-muted); margin: 0;
        }
        .hd-avail {
          display: inline-flex; align-items: center; gap: 4px;
          background: rgba(16,185,129,.12); border: 1px solid rgba(16,185,129,.3);
          border-radius: 20px; padding: 3px 9px;
          font-size: 9px; font-weight: 700; color: #10b981;
          width: fit-content;
        }
        .hd-avail-dot {
          width: 5px; height: 5px; border-radius: 50%; background: #10b981;
          animation: hd-pulse 2s ease-in-out infinite;
        }
        @keyframes hd-pulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:.4; transform:scale(1.6); }
        }

        /* ════════ BENTO STATS GRID ════════ */
        .hd-bento-stats {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 8px; padding: 8px 14px 12px;
        }
        .hd-bento-card {
          display: flex; flex-direction: column;
          padding: 11px 10px;
          border-radius: 16px;
          border: 1px solid var(--border-color);
          background: var(--bg-secondary);
          position: relative; overflow: hidden;
          gap: 2px;
        }
        .hd-bento-card-glow {
          position: absolute; top: -12px; right: -12px;
          width: 48px; height: 48px; border-radius: 50%;
          opacity: 0.25; filter: blur(14px);
          pointer-events: none;
        }
        .hd-bento-icon {
          font-size: 13px; margin-bottom: 2px;
          display: flex; align-items: center;
        }
        .hd-bento-val {
          font-size: 22px; font-weight: 800;
          letter-spacing: -.04em; line-height: 1;
        }
        .hd-bento-label {
          font-size: 7.5px; font-weight: 700; letter-spacing: .07em;
          text-transform: uppercase; color: var(--text-muted);
          margin-top: 2px;
        }

        /* ════════ TECH STACK CLOUD ════════ */
        .hd-tech-wrap {
          display: flex; flex-wrap: wrap; gap: 6px;
          padding: 4px 14px 14px;
        }
        .hd-tech-chip {
          display: inline-flex; align-items: center; gap: 4px;
          border-radius: 20px;
          padding: 4px 10px;
          font-size: 10px; font-weight: 700;
          white-space: nowrap; border: 1px solid;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .hd-tech-chip:active { transform: scale(0.95); }

        /* ════════ FEATURED PROJECT CARD ════════ */
        .hd-feat-card {
          margin: 0 14px 12px;
          border-radius: 18px;
          border: 1px solid rgba(99,102,241,0.3);
          background: linear-gradient(135deg, rgba(99,102,241,0.07), rgba(6,182,212,0.05));
          padding: 14px;
          position: relative; overflow: hidden;
        }
        .hd-feat-card-bg {
          position: absolute; bottom: -20px; right: -20px;
          width: 90px; height: 90px; border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,0.15), transparent 70%);
          pointer-events: none;
        }
        .hd-feat-badge {
          display: inline-flex; align-items: center; gap: 4px;
          background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.35);
          border-radius: 20px; padding: 2px 8px;
          font-size: 8.5px; font-weight: 800; color: #6366f1;
          letter-spacing: 0.04em; margin-bottom: 8px;
        }
        .hd-feat-title {
          font-size: 14px; font-weight: 800; color: var(--text-primary);
          margin: 0 0 5px; letter-spacing: -0.02em;
        }
        .hd-feat-desc {
          font-size: 10.5px; color: var(--text-secondary);
          line-height: 1.5; margin: 0 0 10px;
        }
        .hd-feat-tags {
          display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 10px;
        }
        .hd-feat-tag {
          font-size: 9px; font-weight: 700; color: #6366f1;
          background: rgba(99,102,241,0.12); border: 1px solid rgba(99,102,241,0.25);
          border-radius: 8px; padding: 2px 7px;
        }
        .hd-feat-action {
          display: flex; align-items: center; gap: 5px;
          font-size: 11px; font-weight: 700; color: #6366f1;
          background: rgba(99,102,241,0.12); border: 1px solid rgba(99,102,241,0.25);
          border-radius: 10px; padding: 6px 12px;
          width: fit-content; cursor: pointer; border: none;
          transition: transform 0.15s;
        }
        .hd-feat-action:active { transform: scale(0.96); }

        /* ════════ QUICK ACTIONS BAR ════════ */
        .hd-actions {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 8px; padding: 0 14px 16px;
        }
        .hd-action-btn {
          display: flex; align-items: center; justify-content: center; gap: 7px;
          border-radius: 14px; padding: 11px;
          font-size: 12px; font-weight: 700;
          cursor: pointer; border: 1px solid;
          transition: transform 0.15s, box-shadow 0.15s;
          -webkit-tap-highlight-color: transparent;
        }
        .hd-action-btn:active { transform: scale(0.96); }

        /* ── BIO ── */
        .hd-bio {
          padding: 6px 16px 14px;
          font-size: 11.5px; color: var(--text-secondary);
          line-height: 1.6; margin: 0;
        }
        
        /* ── SWIPE HINT ── */
        .swipe-hint {
          display: flex; align-items: center; justify-content: center;
          padding: 10px 0 8px; color: var(--text-muted); font-size: 8.5px;
          font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
          gap: 6px; flex-shrink: 0;
        }
        .swipe-hint-icon { display: flex; align-items: center; color: var(--text-secondary); }
      `}</style>

      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <div
          className="hd-root"
          style={{ flex: 1, minHeight: 0 }}
          ref={rootRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <motion.div
            style={{ position: 'relative' }}
            animate={{ y: isRefreshing ? 50 : pullDist }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            {/* Pull to Refresh Indicator */}
            <div style={{ position: 'absolute', top: -40, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)' }}>
              {isRefreshing ? (
                <Loader2 size={20} className="ptr-spinner" />
              ) : (
                <ArrowDown size={20} style={{ opacity: Math.min(pullDist / 60, 1), transform: `rotate(${Math.min(pullDist * 3, 180)}deg)` }} />
              )}
            </div>

            {/* ── Profile ─────────────────────────────────────────────── */}
            <div className="hd-profile">
              <div className="hd-avatar-wrap">
                <img src="/IMG_0322.jpg" alt="Sujith Thota" className="hd-avatar" id="profile-avatar-img" />
              </div>
              <div className="hd-profile-info">
                <h1 className="hd-name">{nameText}</h1>
                <p className="hd-role">
                  <Brain size={11} style={{ color: '#8b5cf6' }} />
                  Data Science · Full Stack Dev
                </p>
                <p className="hd-location"><MapPin size={10} /> VIT University, Vellore</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                  {(settings === null || settings.is_available_for_hire) && (
                    <div className="hd-avail">
                      <div className="hd-avail-dot" />
                      Open to Opportunities
                    </div>
                  )}
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 9, fontWeight: 600, color: 'var(--text-muted)' }}>
                    <Clock size={9} style={{ color: 'var(--primary-blue)' }} />
                    <span>{localTime} IST</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="hd-divider" />

            {/* ── Bento Stats Grid ─────────────────────────────────────── */}
            <p className="hd-section-label">
              <TrendingUp size={11} style={{ color: 'var(--primary-blue)' }} />
              At a Glance
            </p>
            <div className="hd-bento-stats">
              {/* CGPA */}
              <motion.div className="hd-bento-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                <div className="hd-bento-card-glow" style={{ background: '#3b82f6' }} />
                <div className="hd-bento-icon" style={{ color: '#3b82f6' }}>📈</div>
                <span className="hd-bento-val" style={{ color: '#3b82f6' }}>{cgpa}</span>
                <span className="hd-bento-label">VIT CGPA</span>
              </motion.div>
              {/* Certs */}
              <motion.div className="hd-bento-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className="hd-bento-card-glow" style={{ background: '#8b5cf6' }} />
                <div className="hd-bento-icon" style={{ color: '#8b5cf6' }}>🏆</div>
                <span className="hd-bento-val" style={{ color: '#8b5cf6' }}>{certs}+</span>
                <span className="hd-bento-label">Certifications</span>
              </motion.div>
              {/* Projects */}
              <motion.div className="hd-bento-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <div className="hd-bento-card-glow" style={{ background: '#10b981' }} />
                <div className="hd-bento-icon" style={{ color: '#10b981' }}>🚀</div>
                <span className="hd-bento-val" style={{ color: '#10b981' }}>{projs}+</span>
                <span className="hd-bento-label">ML Projects</span>
              </motion.div>
            </div>

            <div className="hd-divider" />

            {/* ── About Me ─────────────────────────────────────────────── */}
            <p className="hd-section-label">
              <Code2 size={11} style={{ color: '#6366f1' }} />
              About Me
            </p>
            <p className="hd-bio" dangerouslySetInnerHTML={{ __html: settings?.hero_headline || 'I build modern web applications and explore machine learning to solve real-world problems.' }} />

            <div className="hd-divider" />

            {/* ── Tech Stack Cloud ─────────────────────────────────────── */}
            <p className="hd-section-label">
              <Zap size={11} style={{ color: '#f59e0b' }} />
              Core Tech Stack
            </p>
            <div className="hd-tech-wrap">
              {TECH_STACK.map((tech, i) => (
                <motion.span
                  key={tech.label}
                  className="hd-tech-chip"
                  style={{ color: tech.color, background: tech.bg, borderColor: tech.border }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 + 0.1 }}
                >
                  {tech.label}
                </motion.span>
              ))}
            </div>

            <div className="hd-divider" />

            {/* ── Featured Project Card ──────────────────────────────── */}
            <p className="hd-section-label">
              <Star size={11} style={{ color: '#f59e0b' }} />
              Featured Project
            </p>
            <motion.div
              className="hd-feat-card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="hd-feat-card-bg" />
              <div className="hd-feat-badge">⚡ {FEATURED_PROJECT.badge}</div>
              <h3 className="hd-feat-title">{FEATURED_PROJECT.title}</h3>
              <p className="hd-feat-desc">{FEATURED_PROJECT.description}</p>
              <div className="hd-feat-tags">
                {FEATURED_PROJECT.tags.map(t => (
                  <span key={t} className="hd-feat-tag">{t}</span>
                ))}
              </div>
              <button
                className="hd-feat-action"
                style={{ background: 'rgba(99,102,241,0.12)', borderColor: 'rgba(99,102,241,0.3)', color: '#6366f1' }}
                onClick={() => onNavClick && onNavClick('projects')}
              >
                <ExternalLink size={12} />
                View Case Study
              </button>
            </motion.div>

            <div className="hd-divider" />

            {/* ── Quick Actions ─────────────────────────────────────── */}
            <p className="hd-section-label">
              <Send size={11} style={{ color: '#06b6d4' }} />
              Quick Actions
            </p>
            <div className="hd-actions">
              <motion.button
                className="hd-action-btn"
                style={{ background: 'rgba(6,182,212,0.1)', borderColor: 'rgba(6,182,212,0.3)', color: '#06b6d4' }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onNavClick && onNavClick('contact')}
              >
                <Send size={14} />
                Say Hello
              </motion.button>
              <motion.button
                className="hd-action-btn"
                style={{ background: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.3)', color: '#10b981' }}
                whileTap={{ scale: 0.96 }}
                onClick={() => window.dispatchEvent(new CustomEvent('open-resume'))}
              >
                <FileText size={14} />
                View Resume
              </motion.button>
            </div>

          </motion.div>
        </div>

        {/* ── Swipe Hint ─────────────────────────────── */}
        <motion.div
          className="swipe-hint"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <div className="swipe-hint-icon">
            <motion.div animate={{ x: [-3, 2, -3] }} transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}>
              <ChevronLeft size={16} />
            </motion.div>
            <motion.div animate={{ x: [3, -2, 3] }} transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}>
              <ChevronRight size={16} />
            </motion.div>
          </div>
          <span>Swipe or use nav to explore</span>
        </motion.div>
      </div>
    </>
  );
}
