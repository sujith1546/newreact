import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Loader2, ArrowDown, ChevronLeft, ChevronRight, Clock, Send, FileText, Zap, Code2, Database, Brain, Globe, ExternalLink, Star, TrendingUp, Award, Briefcase, GraduationCap, Sparkles, ArrowUpRight } from 'lucide-react';
import useGlitchText from '../../hooks/useGlitchText';
import useRealtimeData from '../../hooks/useRealtimeData';
import { useLocalTime } from '../../hooks/useLocalTime';

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
  { label: 'Python' },
  { label: 'PyTorch' },
  { label: 'React 19' },
  { label: 'FastAPI' },
  { label: 'Supabase' },
  { label: 'Gemini AI' },
  { label: 'ChromaDB' },
  { label: 'LangChain' },
  { label: 'PostgreSQL' },
  { label: 'TypeScript' },
  { label: 'Docker' },
  { label: 'TailwindCSS' },
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
    id: 'hackathon',
    icon: Award,
    badge: "SIH Winner",
    heading: "Smart India Hackathon winner",
    desc: "Spearheaded architecture for an AI disaster coordination platform in a 36-hour sprint, winning SIH.",
    tags: ["Team Lead", "36h Sprint", "Disaster AI"],
    linkLabel: "Moments",
    targetPage: "moments",
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
    const cardWidth = card ? card.offsetWidth + 12 : 1;
    const index = Math.round(track.scrollLeft / cardWidth);
    setActiveMilestone(Math.max(0, Math.min(index, milestones.length - 1)));
  };

  const scrollToMilestone = (idx) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector('.milestone-card');
    const cardWidth = card ? card.offsetWidth + 12 : 1;
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

        /* ════════ PROFILE SECTION ════════ */
        .hd-profile {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 6px 14px 6px;
        }
        .hd-profile-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }
        .hd-avatar-wrap {
          position: relative;
          flex-shrink: 0;
        }
        .hd-avatar {
          width: 66px;
          height: 66px;
          border-radius: 18px;
          object-fit: cover;
          border: 2px solid var(--border-color, #CBD5E1);
          background: var(--bg-secondary);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          display: block;
        }
        .hd-profile-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
          min-width: 0;
        }
        .hd-name {
          font-size: 19px;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -.04em;
          margin: 0;
          line-height: 1.15;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .hd-role {
          font-size: 10.5px;
          color: var(--text-secondary);
          margin: 0;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 5px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .hd-location {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 9.5px;
          color: var(--text-muted);
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .hd-profile-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 5px;
          flex-shrink: 0;
        }
        .hd-avail {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: rgba(16,185,129,.12);
          border: 1px solid rgba(16,185,129,.3);
          border-radius: 20px;
          padding: 3px 8px;
          font-size: 8.5px;
          font-weight: 700;
          color: #10b981;
          white-space: nowrap;
        }
        .hd-avail-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #10b981;
          animation: hd-pulse 2s ease-in-out infinite;
        }
        .hd-time-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 8.5px;
          font-weight: 600;
          color: var(--text-muted);
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 2px 7px;
          white-space: nowrap;
        }
        @keyframes hd-pulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:.4; transform:scale(1.6); }
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

        .hd-bio {
          padding: 2px 14px 12px;
          font-size: 11.5px;
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0;
        }

        .hd-bento-strip {
          display: flex;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          gap: 10px;
          padding: 2px 14px 8px;
          margin-bottom: 2px;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .hd-bento-strip::-webkit-scrollbar {
          display: none;
        }
        .hd-bento-card {
          flex: 0 0 132px;
          scroll-snap-align: start;
          display: flex;
          flex-direction: column;
          padding: 8px 10px;
          border-radius: 12px;
          border: 1.5px solid var(--border-color, #CBD5E1);
          background: var(--bg-secondary, #FFFFFF);
          position: relative;
          overflow: hidden;
          gap: 1px;
          cursor: pointer;
          outline: none;
          text-align: left;
          font-family: inherit;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
          transition: transform 0.15s ease, border-color 0.15s ease;
          -webkit-tap-highlight-color: transparent;
        }
        .hd-bento-card:active {
          transform: scale(0.97);
        }
        [data-theme="dark"] .hd-bento-card {
          background: var(--bg-secondary, #161B22);
          border: 1.5px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
        }
        .hd-bento-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 3px;
        }
        .hd-bento-icon-wrap {
          width: 22px;
          height: 22px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .hd-bento-jump {
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted, #9CA3AF);
          opacity: 0.7;
          transition: opacity 0.15s ease, transform 0.15s ease;
        }
        .hd-bento-card:hover .hd-bento-jump,
        .hd-bento-card:active .hd-bento-jump {
          opacity: 1;
          transform: translate(1px, -1px);
        }

        /* ── Semantic Card Variants ── */
        /* Blue (Education) */
        .hd-bento-card--blue .hd-bento-icon-wrap {
          background: rgba(59, 130, 246, 0.10);
          border: 1.2px solid rgba(59, 130, 246, 0.28);
          color: #2563EB;
        }
        [data-theme="dark"] .hd-bento-card--blue .hd-bento-icon-wrap {
          background: rgba(59, 130, 246, 0.18);
          border-color: rgba(59, 130, 246, 0.35);
          color: #60A5FA;
        }
        .hd-bento-card--blue:hover .hd-bento-jump { color: #3B82F6; }
        .hd-bento-card--blue .hd-bento-dot { background: #3B82F6; }

        /* Amber (Certifications) */
        .hd-bento-card--amber .hd-bento-icon-wrap {
          background: rgba(245, 158, 11, 0.10);
          border: 1.2px solid rgba(245, 158, 11, 0.28);
          color: #D97706;
        }
        [data-theme="dark"] .hd-bento-card--amber .hd-bento-icon-wrap {
          background: rgba(245, 158, 11, 0.18);
          border-color: rgba(245, 158, 11, 0.35);
          color: #FBBF24;
        }
        .hd-bento-card--amber:hover .hd-bento-jump { color: #F59E0B; }
        .hd-bento-card--amber .hd-bento-dot { background: #F59E0B; }

        /* Purple (Shipped Apps) */
        .hd-bento-card--purple .hd-bento-icon-wrap {
          background: rgba(139, 92, 246, 0.10);
          border: 1.2px solid rgba(139, 92, 246, 0.28);
          color: #7C3AED;
        }
        [data-theme="dark"] .hd-bento-card--purple .hd-bento-icon-wrap {
          background: rgba(139, 92, 246, 0.18);
          border-color: rgba(139, 92, 246, 0.35);
          color: #A78BFA;
        }
        .hd-bento-card--purple:hover .hd-bento-jump { color: #8B5CF6; }
        .hd-bento-card--purple .hd-bento-dot { background: #8B5CF6; }

        /* Green (Availability) */
        .hd-bento-card--green .hd-bento-icon-wrap {
          background: rgba(16, 185, 129, 0.10);
          border: 1.2px solid rgba(16, 185, 129, 0.28);
          color: #059669;
        }
        [data-theme="dark"] .hd-bento-card--green .hd-bento-icon-wrap {
          background: rgba(16, 185, 129, 0.18);
          border-color: rgba(16, 185, 129, 0.35);
          color: #34D399;
        }
        .hd-bento-card--green:hover .hd-bento-jump { color: #10B981; }
        .hd-bento-card--green .hd-bento-dot { background: #10B981; }

        .hd-bento-val {
          font-size: 17px;
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.15;
          color: var(--text-primary, #111827);
          font-feature-settings: "tnum";
        }
        [data-theme="dark"] .hd-bento-val {
          color: #F9FAFB;
        }
        .hd-bento-label {
          font-size: 9.5px;
          font-weight: 600;
          letter-spacing: 0.02em;
          color: var(--text-muted, #6B7280);
          margin-top: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        [data-theme="dark"] .hd-bento-label {
          color: #9CA3AF;
        }
        .hd-bento-badge {
          display: inline-flex;
          align-items: center;
          gap: 3.5px;
          font-size: 8px;
          font-weight: 500;
          letter-spacing: 0.01em;
          padding: 1.5px 5px;
          border-radius: 5px;
          margin-top: 3px;
          width: fit-content;
          background: var(--bg-primary, #F9FAFB);
          border: 1px solid var(--border-color, #CBD5E1);
          color: var(--text-secondary, #4B5563);
          white-space: nowrap;
        }
        [data-theme="dark"] .hd-bento-badge {
          background: var(--bg-primary, #0D1117);
          border-color: rgba(255, 255, 255, 0.12);
          color: #9CA3AF;
        }
        .hd-bento-dot {
          width: 3.5px;
          height: 3.5px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .hd-bento-dot.active {
          animation: hd-pulse 2s ease-in-out infinite;
        }

        /* ════════ SINGLE-LINE INFINITE TECH MARQUEE ════════ */
        .hd-marquee-container {
          position: relative;
          width: 100%;
          overflow: hidden;
          padding: 4px 0 10px;
          mask-image: linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%);
          -webkit-mask-image: linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%);
        }
        .hd-marquee-track {
          display: flex;
          width: max-content;
          gap: 8px;
          animation: marqueeLoop 24s linear infinite;
        }
        .hd-marquee-container:hover .hd-marquee-track,
        .hd-marquee-container:active .hd-marquee-track {
          animation-play-state: paused;
        }
        @keyframes marqueeLoop {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .hd-tech-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 10.5px;
          font-weight: 500;
          white-space: nowrap;
          background: var(--bg-secondary, #FFFFFF);
          border: 1.5px solid var(--border-color, #CBD5E1);
          color: var(--text-secondary, #374151);
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.02);
        }
        [data-theme="dark"] .hd-tech-chip {
          background: var(--bg-secondary, #161B22);
          border: 1.5px solid rgba(255, 255, 255, 0.14);
          color: #E5E7EB;
        }
        .hd-tech-chip:active { transform: scale(0.95); }

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
          -webkit-overflow-scrolling: touch;
          gap: 10px; padding: 4px 14px 6px;
          -ms-overflow-style: none; scrollbar-width: none;
        }
        .hd-feat-track::-webkit-scrollbar { display: none; }

        .hd-feat-slide {
          min-width: 86%; max-width: 86%;
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
        /* ── BIO ── */
        .hd-bio {
          padding: 4px 16px 12px;
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

            {/* ── Profile ─────────────────────────────────────────────── */}
            <div className="hd-profile">
              <div className="hd-profile-left">
                <div className="hd-avatar-wrap">
                  <img src="/IMG_0322.jpg" alt="Sujith Thota" className="hd-avatar" id="profile-avatar-img" />
                </div>
                <div className="hd-profile-info">
                  <h1 className="hd-name">{nameText}</h1>
                  <p className="hd-role">
                    <Brain size={11} style={{ color: '#8b5cf6', flexShrink: 0 }} />
                    <span>Data Science · Dev</span>
                  </p>
                  <p className="hd-location">
                    <MapPin size={10} style={{ flexShrink: 0 }} />
                    <span>VIT University, Vellore</span>
                  </p>
                </div>
              </div>

              {/* Top-Right Badges: Open to Opportunities & Time */}
              <div className="hd-profile-right">
                {(settings === null || settings.is_available_for_hire) && (
                  <div className="hd-avail">
                    <div className="hd-avail-dot" />
                    Open to Hire
                  </div>
                )}
                <div className="hd-time-badge">
                  <Clock size={9} style={{ color: 'var(--primary-blue)' }} />
                  <span>{localTime} IST</span>
                </div>
              </div>
            </div>

            <div className="hd-divider" />

            {/* ── At a Glance Metrics Strip ── */}
            <div className="hd-section-bar">
              <span className="hd-section-title">
                <TrendingUp size={11} style={{ color: 'var(--primary-blue, #3B82F6)' }} />
                At a Glance
              </span>
              <span className="hd-section-badge">4 metrics</span>
            </div>

            <div className="hd-bento-strip">
              {/* 1. CGPA */}
              <motion.button
                className="hd-bento-card hd-bento-card--blue"
                whileTap={{ scale: 0.96 }}
                onClick={() => onNavClick && onNavClick('education')}
                aria-label="View Education details"
              >
                <div className="hd-bento-card-header">
                  <div className="hd-bento-icon-wrap">
                    <GraduationCap size={12} />
                  </div>
                  <span className="hd-bento-jump"><ArrowUpRight size={11} /></span>
                </div>
                <span className="hd-bento-val">{cgpa}</span>
                <span className="hd-bento-label">VIT CGPA</span>
                <span className="hd-bento-badge">
                  <span className="hd-bento-dot" />
                  Top 5% · B.Tech
                </span>
              </motion.button>

              {/* 2. Certifications */}
              <motion.button
                className="hd-bento-card hd-bento-card--amber"
                whileTap={{ scale: 0.96 }}
                onClick={() => onNavClick && onNavClick('certifications')}
                aria-label="View Certifications"
              >
                <div className="hd-bento-card-header">
                  <div className="hd-bento-icon-wrap">
                    <Award size={12} />
                  </div>
                  <span className="hd-bento-jump"><ArrowUpRight size={11} /></span>
                </div>
                <span className="hd-bento-val">{certs}+</span>
                <span className="hd-bento-label">Certifications</span>
                <span className="hd-bento-badge">
                  <span className="hd-bento-dot" />
                  AWS &amp; AI Spec
                </span>
              </motion.button>

              {/* 3. Projects */}
              <motion.button
                className="hd-bento-card hd-bento-card--purple"
                whileTap={{ scale: 0.96 }}
                onClick={() => onNavClick && onNavClick('projects')}
                aria-label="View ML Projects"
              >
                <div className="hd-bento-card-header">
                  <div className="hd-bento-icon-wrap">
                    <Code2 size={12} />
                  </div>
                  <span className="hd-bento-jump"><ArrowUpRight size={11} /></span>
                </div>
                <span className="hd-bento-val">{projs}+</span>
                <span className="hd-bento-label">Shipped Apps</span>
                <span className="hd-bento-badge">
                  <span className="hd-bento-dot" />
                  Full-stack &amp; AI
                </span>
              </motion.button>

              {/* 4. Live Availability / Status */}
              <motion.button
                className="hd-bento-card hd-bento-card--green"
                whileTap={{ scale: 0.96 }}
                onClick={() => onNavClick && onNavClick('contact')}
                aria-label="Contact / Hire"
              >
                <div className="hd-bento-card-header">
                  <div className="hd-bento-icon-wrap">
                    <Zap size={12} />
                  </div>
                  <span className="hd-bento-jump"><ArrowUpRight size={11} /></span>
                </div>
                <span className="hd-bento-val">100%</span>
                <span className="hd-bento-label">Availability</span>
                <span className="hd-bento-badge">
                  <span className="hd-bento-dot active" />
                  Open for Roles
                </span>
              </motion.button>
            </div>

            <div className="hd-divider" />

            {/* ── About Me ─────────────────────────────────────────────── */}
            <div className="hd-section-bar">
              <span className="hd-section-title">
                <Code2 size={11} style={{ color: '#6366f1' }} />
                About Me
              </span>
            </div>
            <p className="hd-bio" dangerouslySetInnerHTML={{ __html: settings?.hero_headline || 'I build modern web applications and explore machine learning to solve real-world problems.' }} />

            <div className="hd-divider" />

            {/* ── Core Tech Stack Single-Line Infinite Marquee ───── */}
            <div className="hd-section-bar">
              <span className="hd-section-title">
                <Zap size={11} style={{ color: '#f59e0b' }} />
                Core Tech Stack
              </span>
            </div>
            <div className="hd-marquee-container">
              <div className="hd-marquee-track">
                {/* 1st copy */}
                {TECH_STACK.map((tech, i) => (
                  <span
                    key={`tech-1-${i}`}
                    className="hd-tech-chip"
                  >
                    {tech.label}
                  </span>
                ))}
                {/* 2nd copy for seamless infinite loop */}
                {TECH_STACK.map((tech, i) => (
                  <span
                    key={`tech-2-${i}`}
                    className="hd-tech-chip"
                  >
                    {tech.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="hd-divider" />

            {/* ── Milestones carousel — compact snap-scroll version ──────── */}
            <section className="milestones-wrap">
              <div className="hd-section-bar">
                <span className="hd-section-title">
                  <Sparkles size={11} style={{ color: '#8b5cf6' }} />
                  Key Milestones
                </span>
                <span className="hd-section-badge">{activeMilestone + 1} / {milestones.length}</span>
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
            padding: 4px 0;
            border-radius: 0;
            background: transparent;
            margin-top: 4px;
            margin-bottom: 4px;
            box-sizing: border-box;
          }

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

          .milestones-track {
            display: flex;
            gap: 10px;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            padding-bottom: 4px;
            -webkit-overflow-scrolling: touch;
            -ms-overflow-style: none;
            scrollbar-width: none;
          }

          .milestones-track::-webkit-scrollbar {
            display: none;
          }

          .milestone-card {
            flex: 0 0 84%;
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
