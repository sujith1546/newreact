import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Loader2, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';
import useGlitchText from '../hooks/useGlitchText';

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

export default function MobileDashboard({ onNavClick }) {
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 5)  return 'Late night 🌙';
    if (h < 12) return 'Good morning ☀️';
    if (h < 17) return 'Good afternoon 🌤️';
    return 'Good evening 🌆';
  };

  const cgpa  = useCountUp('8.7');
  const certs = useCountUp('15');
  const projs = useCountUp('5');
  
  const nameText = useGlitchText("Sujith Thota", 100);

  // Pull to refresh logic
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDist, setPullDist] = useState(0);
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
        setPullDist(Math.min(dist * 0.4, 80)); // Resistance
      }
    }
  };
  const handleTouchEnd = () => {
    if (pullDist > 60) {
      if (navigator.vibrate) navigator.vibrate(40);
      setIsRefreshing(true);
      setTimeout(() => {
        setIsRefreshing(false);
        setPullDist(0);
      }, 1500);
    } else {
      setPullDist(0);
    }
    if (rootRef.current) rootRef.current.startY = undefined;
  };

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

        /* ════════ BIO ════════ */
        .hd-bio {
          padding: 14px 18px 18px;
          font-size: 12.5px; color: var(--text-secondary);
          line-height: 1.55; margin: 0;
        }
        
        /* ════════ SWIPE HINT ════════ */
        .swipe-hint {
          display: flex; align-items: center; justify-content: center;
          padding: 14px 0 12px; color: var(--text-muted); font-size: 10px;
          font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
          gap: 8px; flex-shrink: 0;
          background: transparent;
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

        {/* ── Profile ───────────────────────────────────────────── */}
        <motion.div
          className="hd-profile"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <img src="/IMG_0322.jpg" alt="Sujith Thota" className="hd-avatar" id="profile-avatar-img" />
          <div className="hd-profile-info">
            <h1 className="hd-name">{nameText}</h1>
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

        {/* ── About Me ───────────────────────────────────────────── */}
        <p className="hd-section-label">About Me</p>
        <motion.p
          className="hd-bio"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.14 }}
        >
          A passionate <strong>B.Tech Graduate from VIT (8.7 CGPA)</strong>, actively exploring the boundaries between predictive machine learning systems and reactive web frameworks. I love building things that are both intelligent and elegant.
        </motion.p>
        
        </motion.div>
      </div>

      {/* ── Swipe Hint Fixed at Bottom Middle ─────────────────────────────── */}
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
    </div>
  </>
);
}
