import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Loader2, ArrowDown, ChevronLeft, ChevronRight, Clock, Send, FileText, Zap, Code2, Database, Brain, Globe, ExternalLink, Star, TrendingUp, Award, Briefcase, GraduationCap, Sparkles, ArrowUpRight, User, Languages } from 'lucide-react';
import useGlitchText from '../../hooks/useGlitchText';
import useRealtimeData from '../../hooks/useRealtimeData';
import { useLocalTime } from '../../hooks/useLocalTime';
import HeroStats from './HeroStats';

/* ── Robust Count-up hook ─────────────────────────────────── */
function useCountUp(target, duration = 900) {
  const [val, setVal] = useState('0');
  useEffect(() => {
    const numeric = parseFloat(target);
    if (isNaN(numeric)) { setVal(target); return; }
    const hasDec = String(target).includes('.');
    let start = null;
    let animId = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setVal((numeric * e).toFixed(hasDec ? 1 : 0));
      if (p < 1) {
        animId = requestAnimationFrame(step);
      }
    };
    animId = requestAnimationFrame(step);
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [target, duration]);
  return val;
}

const TECH_STACK = [
  { icon: 'ti-brand-react', name: 'React 19' },
  { icon: 'ti-brand-python', name: 'Python' },
  { icon: 'ti-brain', name: 'PyTorch' },
  { icon: 'ti-server-2', name: 'FastAPI' },
  { icon: 'ti-database', name: 'Supabase' },
  { icon: 'ti-sparkles', name: 'Gemini AI' },
  { icon: 'ti-layers-intersect', name: 'ChromaDB' },
  { icon: 'ti-link', name: 'LangChain' },
  { icon: 'ti-database', name: 'PostgreSQL' },
  { icon: 'ti-brand-typescript', name: 'TypeScript' },
  { icon: 'ti-brand-docker', name: 'Docker' },
  { icon: 'ti-brand-tailwind', name: 'Tailwind CSS' },
];

const milestones = [
  {
    id: 'convocation',
    icon: GraduationCap,
    badge: "Convocation · VIT",
    heading: "B.Tech in Computer Science",
    desc: "Graduated with an 8.7 CGPA and convocation honors, with a strong foundation in core algorithms and AI.",
    tags: ["VIT Vellore", "8.7 CGPA", "CSE"],
    linkLabel: "Education",
    targetPage: "education",
  },
  {
    id: 'portfolio',
    icon: Code2,
    badge: "Engineering · Project",
    heading: "Architected reactive portfolio",
    desc: "Built using React 19 with Supabase realtime sync, offline PWA caching, and adaptive design.",
    tags: ["React 19", "Offline-first", "Realtime"],
    linkLabel: "Skills",
    targetPage: "skills",
  },
  {
    id: 'internship',
    icon: Briefcase,
    badge: "Industry · Cognizant",
    heading: "Machine learning internship",
    desc: "Engineered production ML document intelligence pipelines and scalable microservices.",
    tags: ["FastAPI", "PyTorch", "ML Pipeline"],
    linkLabel: "Experience",
    targetPage: "experience",
  },
  {
    id: 'production-ai',
    icon: Sparkles,
    badge: "Open source · Apps",
    heading: "Shipped 5+ production apps",
    desc: "Delivered full-stack AI-driven applications end to end, from design to cloud deployment.",
    tags: ["Full-stack", "Production AI", "LLM Agents"],
    linkLabel: "Projects",
    targetPage: "projects",
  },
];

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

  // Milestones Carousel State
  const [activeMilestone, setActiveMilestone] = useState(0);
  const trackRef = useRef(null);

  const handleMilestonesScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector('.milestone-card');
    const cardWidth = card ? card.offsetWidth + 10 : 1;
    const index = Math.round(track.scrollLeft / cardWidth);
    setActiveMilestone(Math.max(0, Math.min(index, milestones.length - 1)));
  };

  const scrollToMilestone = (idx) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector('.milestone-card');
    const cardWidth = card ? card.offsetWidth + 10 : 1;
    track.scrollTo({ left: idx * cardWidth, behavior: 'smooth' });
    setActiveMilestone(idx);
  };

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
          width: 100%; height: auto;
          overflow: visible;
          box-sizing: border-box;
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



        /* ════════ UNIFIED SECTION HEADINGS SYSTEM ════════ */
        .hd-section-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px 6px;
        }
        .hd-section-title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: var(--text-muted, #6B7280);
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 6px;
          margin: 0;
        }
        [data-theme="dark"] .hd-section-title {
          color: #9CA3AF;
        }
        .hd-section-badge {
          font-size: 10px;
          color: var(--text-muted, #6B7280);
          background: var(--bg-secondary, #F3F4F6);
          border: 1.2px solid var(--border-color, #CBD5E1);
          padding: 1px 7px;
          border-radius: 20px;
          font-weight: 600;
        }
        [data-theme="dark"] .hd-section-badge {
          color: var(--text-muted, #9CA3AF);
          background: var(--bg-secondary, rgba(255, 255, 255, 0.06));
          border-color: rgba(255, 255, 255, 0.14);
        }

        /* ════════ ABOUT ME CLEAN ORGANIC SECTION ════════ */
        .about-clean-wrap {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 2px 14px 12px;
          width: 100%;
          box-sizing: border-box;
        }

        .about-clean-bio {
          font-size: 13px;
          font-weight: 450;
          line-height: 1.6;
          color: var(--text-secondary, #475569);
          margin: 0;
          letter-spacing: -0.01em;
        }

        [data-theme="dark"] .about-clean-bio {
          color: #cbd5e1;
        }

        .about-clean-tags {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .about-tag {
          font-size: 10px;
          font-weight: 600;
          padding: 2.5px 8px;
          border-radius: 999px;
          letter-spacing: 0.01em;
          white-space: nowrap;
        }

        .about-tag--blue {
          background: rgba(59, 130, 246, 0.12);
          color: #2563eb;
          border: 0.5px solid rgba(59, 130, 246, 0.25);
        }

        [data-theme="dark"] .about-tag--blue {
          background: rgba(59, 130, 246, 0.18);
          color: #60a5fa;
          border-color: rgba(59, 130, 246, 0.35);
        }

        .about-tag--purple {
          background: rgba(139, 92, 246, 0.12);
          color: #7c3aed;
          border: 0.5px solid rgba(139, 92, 246, 0.25);
        }

        [data-theme="dark"] .about-tag--purple {
          background: rgba(139, 92, 246, 0.18);
          color: #c084fc;
          border-color: rgba(139, 92, 246, 0.35);
        }

        .about-tag--green {
          background: rgba(16, 185, 129, 0.12);
          color: #059669;
          border: 0.5px solid rgba(16, 185, 129, 0.25);
        }

        [data-theme="dark"] .about-tag--green {
          background: rgba(16, 185, 129, 0.18);
          color: #34d399;
          border-color: rgba(16, 185, 129, 0.35);
        }

        .about-clean-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-top: 2px;
          flex-wrap: wrap;
        }

        .about-meta-item {
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        .about-meta-icon {
          color: var(--text-muted, #64748b);
          flex-shrink: 0;
        }

        [data-theme="dark"] .about-meta-icon {
          color: #94a3b8;
        }

        .about-meta-label {
          font-size: 11px;
          color: var(--text-muted, #64748b);
          margin-right: 2px;
        }

        [data-theme="dark"] .about-meta-label {
          color: #94a3b8;
        }

        .about-meta-value {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-primary, #0f172a);
        }

        [data-theme="dark"] .about-meta-value {
          color: #f1f5f9;
        }

        .about-meta-divider {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: var(--text-muted, #64748b);
          opacity: 0.4;
          flex-shrink: 0;
        }



        /* ════════ UPGRADED TECH MARQUEE ════════ */
        .marquee-wrap {
          position: relative;
          width: 100%;
          overflow: hidden;
          padding: 4px 0 10px;
        }

        .marquee-track {
          display: flex;
          gap: 10px;
          width: max-content;
          animation: marquee-scroll 18s linear infinite;
        }

        .marquee-wrap:hover .marquee-track,
        .marquee-wrap:active .marquee-track {
          animation-play-state: paused;
        }

        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        .tech-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--surface-1, var(--bg-secondary, #f8fafc));
          border: 1px solid var(--border, var(--border-color, #e2e8f0));
          border-radius: 999px;
          padding: 6px 14px;
          font-size: 12px;
          font-weight: 500;
          color: var(--text-primary);
          white-space: nowrap;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
          transition: transform 0.15s ease;
        }

        .tech-pill:active {
          transform: scale(0.96);
        }

        [data-theme="dark"] .tech-pill {
          background: var(--surface-1, #22242a);
          border-color: var(--border, rgba(255, 255, 255, 0.12));
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
        }

        .tech-pill i {
          font-size: 14px;
          color: var(--text-secondary);
        }

        [data-theme="dark"] .tech-pill i {
          color: #94a3b8;
        }

        .marquee-fade {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 28px;
          pointer-events: none;
          z-index: 2;
        }

        .marquee-fade--left {
          left: 0;
          background: linear-gradient(to right, var(--bg-primary, #ffffff), transparent);
        }

        .marquee-fade--right {
          right: 0;
          background: linear-gradient(to left, var(--bg-primary, #ffffff), transparent);
        }

        [data-theme="dark"] .marquee-fade--left {
          background: linear-gradient(to right, var(--bg-primary, #0f1115), transparent);
        }

        [data-theme="dark"] .marquee-fade--right {
          background: linear-gradient(to left, var(--bg-primary, #0f1115), transparent);
        }

        /* ════════ HORIZONTAL FEATURED PROJECTS CAROUSEL ════════ */
        .hd-feat-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 14px 4px;
        }
        .hd-feat-controls {
          display: flex; align-items: center; gap: 5px;
        }
        .hd-feat-counter {
          font-size: 9.5px; font-weight: 700; color: var(--text-muted);
          padding: 2px 7px; border-radius: 6px; background: var(--bg-secondary);
          border: 1px solid var(--border-color);
        }
        .hd-feat-arrow {
          width: 24px; height: 24px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: var(--bg-secondary); border: 1px solid var(--border-color);
          color: var(--text-secondary); cursor: pointer; padding: 0;
          transition: background 0.15s, opacity 0.15s;
        }
        .hd-feat-arrow:active { background: var(--bg-primary); }
        .hd-feat-arrow:disabled { opacity: 0.3; cursor: default; }

        .hd-feat-track {
          display: flex; overflow-x: auto;
          scroll-snap-type: x mandatory;
          scroll-padding-left: 14px;
          -webkit-overflow-scrolling: touch;
          gap: 10px; padding: 4px 14px 6px;
          -ms-overflow-style: none; scrollbar-width: none;
        }
        .hd-feat-track::-webkit-scrollbar { display: none; }
        .hd-feat-track::after {
          content: '';
          flex: 0 0 4px;
        }

        .hd-feat-slide {
          min-width: 85%; max-width: 85%;
          scroll-snap-align: start;
          border-radius: 18px; border: 1px solid;
          padding: 14px; position: relative; overflow: hidden;
          flex-shrink: 0; box-sizing: border-box;
          display: flex; flex-direction: column;
        }
        .hd-feat-card-bg {
          position: absolute; bottom: -20px; right: -20px;
          width: 100px; height: 100px; border-radius: 50%;
          pointer-events: none;
        }
        .hd-feat-badge {
          display: inline-flex; align-items: center; gap: 4px;
          border-radius: 20px; padding: 2px 8px; border: 1px solid;
          font-size: 8.5px; font-weight: 800;
          letter-spacing: 0.04em; margin-bottom: 8px; width: fit-content;
        }
        .hd-feat-title {
          font-size: 14px; font-weight: 800; color: var(--text-primary);
          margin: 0 0 5px; letter-spacing: -0.02em;
        }
        .hd-feat-desc {
          font-size: 10.5px; color: var(--text-secondary);
          line-height: 1.5; margin: 0 0 10px; flex: 1;
        }
        .hd-feat-tags {
          display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 10px;
        }
        .hd-feat-tag {
          font-size: 9px; font-weight: 700;
          border-radius: 8px; padding: 2px 7px; border: 1px solid;
        }
        .hd-feat-action {
          display: flex; align-items: center; gap: 5px;
          font-size: 11px; font-weight: 700;
          border-radius: 10px; padding: 6px 12px; border: 1px solid;
          width: fit-content; cursor: pointer;
          transition: transform 0.15s;
        }
        .hd-feat-action:active { transform: scale(0.96); }

        .hd-feat-dots {
          display: flex; align-items: center; justify-content: center;
          gap: 5px; margin-top: 4px; margin-bottom: 4px;
        }
        .hd-feat-dot {
          width: 6px; height: 6px; border-radius: 3px;
          background: var(--border-color); border: none; padding: 0;
          cursor: pointer; transition: all 0.2s ease;
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

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <div
          className="hd-root"
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

            {/* ── Unified Hero + At a Glance Stats Section ── */}
            <HeroStats
              name={nameText || "Sujith Thota"}
              role="Data science & dev"
              location="VIT University, Vellore"
              available={settings === null || settings.is_available_for_hire}
              avatarUrl="/IMG_0322.jpg"
              cgpa={cgpa}
              cgpaMax={10}
              cgpaPercentile="Top 5%"
              certifications={`${certs}+`}
              apps={`${projs}+`}
              status="Open"
              onNavClick={onNavClick}
            />

            <div className="hd-divider" />

            {/* ── About Me ─────────────────────────────────────────────── */}
            <div className="hd-section-bar">
              <span className="hd-section-title">
                <User size={12} style={{ color: 'var(--primary-blue, #3b82f6)' }} />
                About Me
              </span>
            </div>

            <div className="about-clean-wrap">
              <p className="about-clean-bio">
                {settings?.hero_headline || "I build modern web applications, blending clean engineering with a product mindset — currently exploring where AI meets everyday tools."}
              </p>
              <div className="about-clean-tags">
                <span className="about-tag about-tag--blue">Full-stack</span>
                <span className="about-tag about-tag--purple">AI/ML</span>
                <span className="about-tag about-tag--green">Data science</span>
              </div>
              <div className="about-clean-meta">
                <div className="about-meta-item">
                  <MapPin size={13} className="about-meta-icon" />
                  <span className="about-meta-label">Based in</span>
                  <span className="about-meta-value">Vellore, India</span>
                </div>
                <div className="about-meta-divider" />
                <div className="about-meta-item">
                  <Languages size={13} className="about-meta-icon" />
                  <span className="about-meta-label">Speaks</span>
                  <span className="about-meta-value">English, Telugu</span>
                </div>
              </div>
            </div>

            <div className="hd-divider" />

            {/* ── Core Tech Stack Single-Line Infinite Marquee ───── */}
            <div className="hd-section-bar">
              <span className="hd-section-title">
                <Zap size={11} style={{ color: '#f59e0b' }} />
                Core Tech Stack
              </span>
            </div>
            <div className="marquee-wrap">
              <div className="marquee-track">
                {[...TECH_STACK, ...TECH_STACK].map((tech, i) => (
                  <span key={i} className="tech-pill">
                    <i className={`ti ${tech.icon}`} aria-hidden="true" />
                    {tech.name}
                  </span>
                ))}
              </div>
              <div className="marquee-fade marquee-fade--left" />
              <div className="marquee-fade marquee-fade--right" />
            </div>

            <div className="hd-divider" />

            {/* ── Milestones carousel — compact snap-scroll version ──────── */}
            <section className="milestones-wrap">
              <div className="hd-section-bar">
                <span className="hd-section-title">
                  <Sparkles size={11} style={{ color: '#8b5cf6' }} />
                  Key Milestones
                </span>
                <div className="milestone-scroll-controls">
                  <button
                    type="button"
                    className="milestone-nav-btn"
                    onClick={() => scrollToMilestone(Math.max(0, activeMilestone - 1))}
                    disabled={activeMilestone === 0}
                    aria-label="Previous milestone"
                  >
                    <ChevronLeft size={13} />
                  </button>
                  <span className="milestone-counter-badge">
                    {activeMilestone + 1} / {milestones.length}
                  </span>
                  <button
                    type="button"
                    className="milestone-nav-btn"
                    onClick={() => scrollToMilestone(Math.min(milestones.length - 1, activeMilestone + 1))}
                    disabled={activeMilestone === milestones.length - 1}
                    aria-label="Next milestone"
                  >
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>

              <div className="milestones-track" ref={trackRef} onScroll={handleMilestonesScroll}>
                {milestones.map((m, i) => {
                  const IconComp = m.icon;
                  return (
                    <article
                      className="milestone-card"
                      key={m.id || i}
                      onClick={() => onNavClick && onNavClick(m.targetPage)}
                    >
                      <div className="milestone-card-top">
                        <span className="milestone-badge">
                          {IconComp && <IconComp size={11} style={{ marginRight: 4, flexShrink: 0 }} />}
                          {m.badge}
                        </span>
                        <span className="milestone-link-inline">
                          {m.linkLabel} <ArrowUpRight size={12} />
                        </span>
                      </div>
                      <h3 className="milestone-heading">{m.heading}</h3>
                      <p className="milestone-desc">{m.desc}</p>
                      <div className="milestone-tags">
                        {m.tags.map((t) => (
                          <span className="tag" key={t}>{t}</span>
                        ))}
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="milestones-dots">
                {milestones.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`dot ${i === activeMilestone ? "active" : ""}`}
                    onClick={() => scrollToMilestone(i)}
                    aria-label={`Go to milestone ${i + 1}`}
                  />
                ))}
              </div>
            </section>

          </motion.div>
        </div>

        <style>{`
          .milestones-wrap {
            padding: 2px 0;
            border-radius: 0;
            background: transparent;
            margin-top: 2px;
            margin-bottom: 2px;
            box-sizing: border-box;
          }

          [data-theme="dark"] .milestones-wrap {
            background: transparent;
            border: none;
          }

          .milestone-scroll-controls {
            display: flex;
            align-items: center;
            gap: 5px;
          }

          .milestone-counter-badge {
            font-size: 10px;
            font-weight: 700;
            color: var(--text-muted, #6B7280);
            background: var(--bg-secondary, #F3F4F6);
            border: 1.2px solid var(--border-color, #CBD5E1);
            padding: 2px 8px;
            border-radius: 20px;
            min-width: 32px;
            text-align: center;
            font-feature-settings: "tnum";
            line-height: 1.2;
          }

          [data-theme="dark"] .milestone-counter-badge {
            color: var(--text-muted, #9CA3AF);
            background: var(--bg-secondary, rgba(255, 255, 255, 0.06));
            border-color: rgba(255, 255, 255, 0.14);
          }

          .milestone-nav-btn {
            width: 25px;
            height: 25px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--bg-secondary, #FFFFFF);
            border: 1.2px solid var(--border-color, #CBD5E1);
            color: var(--text-secondary, #4B5563);
            cursor: pointer;
            padding: 0;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
            transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
            -webkit-tap-highlight-color: transparent;
          }

          .milestone-nav-btn:hover:not(:disabled) {
            background: var(--bg-primary, #F9FAFB);
            color: #3b82f6;
            border-color: #3b82f6;
          }

          .milestone-nav-btn:active:not(:disabled) {
            transform: scale(0.92);
            background: var(--bg-primary, #F3F4F6);
          }

          .milestone-nav-btn:disabled {
            opacity: 0.28;
            cursor: not-allowed;
            box-shadow: none;
          }

          [data-theme="dark"] .milestone-nav-btn {
            background: var(--bg-secondary, #161B22);
            border-color: rgba(255, 255, 255, 0.15);
            color: #CBD5E1;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
          }

          [data-theme="dark"] .milestone-nav-btn:hover:not(:disabled) {
            background: rgba(255, 255, 255, 0.08);
            color: #60A5FA;
            border-color: #60A5FA;
          }

          [data-theme="dark"] .milestone-nav-btn:active:not(:disabled) {
            background: rgba(255, 255, 255, 0.04);
          }

          .milestones-track {
            display: flex;
            gap: 10px;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            scroll-padding-left: 14px;
            padding: 4px 14px 6px;
            -webkit-overflow-scrolling: touch;
            -ms-overflow-style: none;
            scrollbar-width: none;
          }

          .milestones-track::-webkit-scrollbar {
            display: none;
          }

          .milestones-track::after {
            content: '';
            flex: 0 0 4px;
          }

          .milestone-card {
            flex: 0 0 85%;
            min-width: 85%;
            max-width: 85%;
            scroll-snap-align: start;
            background: var(--bg-secondary, #FFFFFF);
            border: 1.5px solid var(--border-color, #CBD5E1);
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
            border-radius: 14px;
            padding: 12px 13px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            cursor: pointer;
            transition: transform 0.15s ease, border-color 0.15s ease;
            -webkit-tap-highlight-color: transparent;
          }

          .milestone-card:active {
            transform: scale(0.98);
          }

          [data-theme="dark"] .milestone-card {
            background: var(--bg-secondary, #161B22);
            border: 1.5px solid rgba(255, 255, 255, 0.15);
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.25);
          }

          .milestone-card-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 6px;
            margin-bottom: 7px;
          }

          .milestone-badge {
            display: inline-flex;
            align-items: center;
            background: rgba(59, 130, 246, 0.08);
            border: 1.2px solid rgba(59, 130, 246, 0.25);
            color: #2563EB;
            font-size: 9.5px;
            font-weight: 600;
            padding: 2px 8px;
            border-radius: 12px;
            white-space: nowrap;
          }

          [data-theme="dark"] .milestone-badge {
            color: #60A5FA;
            background: rgba(59, 130, 246, 0.15);
            border-color: rgba(59, 130, 246, 0.32);
          }

          .milestone-link-inline {
            display: inline-flex;
            align-items: center;
            gap: 2px;
            font-size: 10px;
            font-weight: 600;
            color: var(--primary-blue, #3B82F6);
            opacity: 0.85;
            white-space: nowrap;
            transition: opacity 0.15s;
          }

          .milestone-card:hover .milestone-link-inline {
            opacity: 1;
          }

          .milestone-heading {
            font-weight: 700;
            font-size: 13.5px;
            margin: 0 0 4px;
            color: var(--text-primary, #111827);
            letter-spacing: -0.01em;
            line-height: 1.25;
          }

          [data-theme="dark"] .milestone-heading {
            color: #F9FAFB;
          }

          .milestone-desc {
            font-size: 11px;
            color: var(--text-secondary, #4B5563);
            margin: 0 0 8px;
            line-height: 1.45;
          }

          [data-theme="dark"] .milestone-desc {
            color: #9CA3AF;
          }

          .milestone-tags {
            display: flex;
            gap: 5px;
            flex-wrap: wrap;
            margin: 0;
          }

          .tag {
            background: var(--bg-primary, #F9FAFB);
            border: 1px solid var(--border-color, #CBD5E1);
            color: var(--text-muted, #4B5563);
            font-size: 9px;
            font-weight: 500;
            padding: 2px 7px;
            border-radius: 5px;
            line-height: 1.2;
          }

          [data-theme="dark"] .tag {
            background: var(--bg-primary, #0D1117);
            border-color: rgba(255, 255, 255, 0.12);
            color: var(--text-muted, #9CA3AF);
          }

          .milestones-dots {
            display: flex;
            gap: 5px;
            justify-content: center;
            margin-top: 6px;
          }

          .dot {
            width: 5px;
            height: 5px;
            border-radius: 50%;
            background: var(--border-color, #E5E7EB);
            border: none;
            padding: 0;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          [data-theme="dark"] .dot {
            background: var(--border-color, rgba(255, 255, 255, 0.2));
          }

          .dot.active {
            background: #3B82F6;
            width: 14px;
            border-radius: 3px;
          }
        `}</style>
      </div>
    </>
  );
}
