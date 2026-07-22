import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Trophy, Laptop, BookOpen, School, X, Hand, ChevronRight, ChevronDown, Loader2 } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';
import { EducationArrowFlow } from '../components/EducationArrowFlow';
import { supabase } from '../lib/supabaseClient';

const iconMap = {
  'School': School,
  'Trophy': Trophy,
  'BookOpen': BookOpen,
  'Laptop': Laptop
};

const RING_RADIUS = 27;
const RING_CIRC = 2 * Math.PI * RING_RADIUS;

function ScoreRing({ percent, color }) {
  const offset = RING_CIRC - (percent / 100) * RING_CIRC;
  return (
    <div style={{ position: "relative", width: 64, height: 64, flexShrink: 0 }}>
      <svg width="64" height="64" viewBox="0 0 64 64">
        <circle
          cx="32" cy="32" r={RING_RADIUS}
          fill="none" stroke="var(--border-color, #e5e5e5)" strokeWidth="6"
        />
        <circle
          cx="32" cy="32" r={RING_RADIUS}
          fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={RING_CIRC}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 32 32)"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex",
        flexDirection: "column", alignItems: "center", justifyContent: "center"
      }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{percent}%</span>
        <span style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 600 }}>score</span>
      </div>
    </div>
  );
}

function TimelineStrip({ stages, activeId }) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginTop: 10 }}>
      {stages.map((s, i) => (
        <div key={s.id} style={{ display: "flex", alignItems: "center", flex: i === stages.length - 1 ? "none" : 1 }}>
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{
              width: s.id === activeId ? 10 : 8,
              height: s.id === activeId ? 10 : 8,
              borderRadius: "50%",
              background: s.id === activeId ? s.color : "var(--border-color)",
              marginBottom: 6,
              transition: "all 0.3s ease"
            }} />
            <div style={{
              fontSize: 10,
              fontWeight: s.id === activeId ? 700 : 500,
              color: s.id === activeId ? "var(--text-primary)" : "var(--text-muted)",
              letterSpacing: "-0.01em"
            }}>{s.shortLabel}</div>
          </div>
          {i < stages.length - 1 && (
            <div style={{ flex: 1, height: 2, background: "var(--border-color)", margin: "0 8px", alignSelf: "flex-start", marginTop: 4 }} />
          )}
        </div>
      ))}
    </div>
  );
}

function SectionLabel({ children }) {
  return <div className="dsheet-section-label" style={{ marginBottom: 8, marginTop: 12 }}>{children}</div>;
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

function EducationCard({ item, index, activeIndex, flippedIndex, onCardClick, onFlip, onClose }) {
  const isActive = index === activeIndex;
  const isFlipped = index === flippedIndex;
  const Icon = iconMap[item.icon_class] || School;
  
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  const handleCardClick = () => {
    onCardClick(index); // Sets active and unflips others
  };

  const handleFlip = (e) => {
    e.stopPropagation();
    onFlip(index); // Sets active and flips this one
  };

  const handleClose = (e) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <motion.div className="edu-flip-card" variants={cardVariants}>
      <div className={`edu-flip-card-inner ${isFlipped ? "flipped" : ""}`}>
        
        {/* FRONT FACE */}
        <div 
          className={`edu-flip-card-front edu-card ${isActive ? 'active-card' : ''}`} 
          onClick={handleCardClick}
          ref={cardRef}
          onMouseMove={handleMouseMove}
        >
          <div className="edu-card-top">
            <div className={`edu-icon-box ${isActive ? 'active' : ''}`}>
              <Icon size={18} />
            </div>
            <span className={`edu-year-pill ${isActive ? 'active' : ''}`}>
              {item.year}
            </span>
          </div>

          <p className="edu-card-title">{item.title}</p>
          <p className="edu-card-inst">{item.institution}</p>
          <p className="edu-card-loc"><MapPin size={10} />{item.location}</p>

          <hr className="edu-sep" />

          <p className="edu-card-desc">{item.description}</p>

          {item.score && (
            <div className={`edu-score ${isActive ? 'active' : ''}`}>
              <Trophy size={11} />
              {item.score}
            </div>
          )}

          {item.progress && (
            <div className="edu-progress-wrap">
              <p className="edu-progress-label">PERFORMANCE</p>
              <div className="edu-progress-track">
                <motion.div
                  className="edu-progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${item.progress}%` }}
                  transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                />
              </div>
            </div>
          )}

          <div className="edu-tags">
            {item.highlights.map((h) => (
              <span key={h} className="edu-tag">
                {h}
              </span>
            ))}
          </div>

          <div 
            className="tap-hint" 
            onClick={handleFlip} 
            style={{ cursor: 'pointer' }}
          >
            <Hand size={12} /> Tap for details
          </div>
        </div>

        {/* BACK FACE */}
        <div className="edu-flip-card-back" onClick={handleClose} style={{ cursor: 'pointer' }}>
          <div className="back-header">
            <p>{item.title}</p>
            <X size={16} onClick={handleClose} style={{ cursor: 'pointer' }} />
          </div>
          <div className="back-stats">
            {item.backStats.map(stat => (
              <div key={stat.label} className="back-stat">
                <p className="back-stat-value">{stat.value}</p>
                <p className="back-stat-label">{stat.label}</p>
              </div>
            ))}
          </div>
          <p className="back-highlight">{item.highlight}</p>
        </div>

      </div>
    </motion.div>
  );
}

export default function Education() {
  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [flippedIndex, setFlippedIndex] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [sheetScrolled, setSheetScrolled] = useState(false);
  const [sheetScrollable, setSheetScrollable] = useState(false);
  const sheetContentRef = useRef(null);

  useEffect(() => {
    fetchEducation();
  }, []);

  const fetchEducation = async () => {
    const { data, error } = await supabase.from('education').select('*').order('display_order', { ascending: true });
    if (!error && data) {
      // Map database fields to the exact prop names the UI expects
      const mapped = data.map(d => ({
        ...d,
        shortLabel: d.short_label,
        color: d.theme_color,
        bg: d.bg_color,
        textColor: d.text_color,
        backStats: d.back_stats,
        highlight: d.highlight_text
      }));
      setTimelineData(mapped);
      if (mapped.length > 0) setActiveIndex(mapped.length - 1);
    }
    setLoading(false);
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (selectedItem) {
      setSheetScrolled(false);
      setSheetScrollable(false);
      setTimeout(() => {
        if (sheetContentRef.current) {
          const { scrollHeight, clientHeight } = sheetContentRef.current;
          setSheetScrollable(scrollHeight > clientHeight + 5);
        }
      }, 200);
    }
  }, [selectedItem]);

  const handleCardClick = (idx) => {
    setActiveIndex(idx);
    if (flippedIndex !== null && flippedIndex !== idx) {
      setFlippedIndex(null); // Unflip previously flipped card
    }
  };

  const handleFlip = (idx) => {
    setActiveIndex(idx);
    setFlippedIndex(idx);
  };

  return (
    <ScrollReveal>
      <style>{`
        /* Page */
        .edu-page {
          width: 100%;
          height: 100%;
          min-height: calc(100vh - 120px);
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        /* Header */
        .edu-header {
          flex-shrink: 0;
          margin-bottom: 12px;
        }
        .edu-header h1 {
          font-size: 28px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 5px;
        }
        .edu-header p {
          font-size: 13.5px;
          color: var(--text-secondary);
          margin: 0;
        }

        /* Progress Rail */
        .edu-rail {
          position: relative;
          margin: 16px 0 24px;
          height: 60px;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          width: 100%;
        }
        .edu-rail-line-container {
          position: absolute;
          top: 10px; /* aligns with center of 20px dots */
          left: 12.5%;
          right: 12.5%;
          height: 4px;
          background: #e5e7eb;
          border-radius: 2px;
          z-index: 1;
        }
        .edu-rail-line-active {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background: linear-gradient(90deg, var(--primary-blue), #60a5fa);
          box-shadow: 0 0 8px rgba(59, 130, 246, 0.4);
          transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 2px;
        }
        .edu-rail-dots {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          width: 100%;
        }
        .edu-rail-dot-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }
        .edu-rail-dot {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ffffff;
          border: 3px solid #d1d5db;
          cursor: pointer;
          padding: 0;
          outline: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .edu-rail-dot:hover {
          border-color: var(--primary-blue);
          transform: scale(1.15);
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.25);
        }
        .edu-rail-dot.active {
          background: var(--primary-blue);
          border-color: var(--primary-blue);
          box-shadow: 0 0 0 5px rgba(59, 130, 246, 0.2);
          transform: scale(1.1);
        }
        
        /* Glow Pulse Ring */
        .edu-rail-dot.active::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 1px solid var(--primary-blue);
          animation: dotPulse 2s infinite ease-out;
        }
        @keyframes dotPulse {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(2.2); opacity: 0; }
        }

        /* Year Labels Underneath */
        .edu-rail-dot-label {
          margin-top: 8px;
          font-size: 11px;
          font-weight: 500;
          color: var(--text-secondary);
          transition: all 0.3s ease;
          cursor: pointer;
          user-select: none;
        }
        .edu-rail-dot-label.active {
          color: var(--primary-blue);
          font-weight: 700;
        }

        /* Hover Tooltip */
        .edu-rail-dot-tooltip {
          position: absolute;
          bottom: 100%;
          margin-bottom: 10px;
          background: rgba(17, 24, 39, 0.95);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          color: #ffffff;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 11px;
          text-align: center;
          box-shadow: 0 4px 15px rgba(0,0,0,0.15);
          border: 1px solid rgba(255,255,255,0.08);
          opacity: 0;
          pointer-events: none;
          transform: translateY(8px);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 20;
          white-space: nowrap;
        }
        .edu-rail-dot-tooltip::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border-width: 5px;
          border-style: solid;
          border-color: rgba(17, 24, 39, 0.95) transparent transparent transparent;
        }
        .edu-rail-dot-wrap:hover .edu-rail-dot-tooltip {
          opacity: 1;
          transform: translateY(0);
        }

        /* Grid */
        .edu-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          flex: 1;
          align-content: flex-start;
          width: 100%;
          min-width: 0;
        }

        /* 3D Flip Card Container */
        .edu-flip-card {
          perspective: 1200px;
          height: 380px; /* Reduced to fit screen */
          width: 100%;
        }
        
        .edu-flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
          cursor: pointer;
        }
        
        .edu-flip-card-inner.flipped {
          transform: rotateY(180deg);
        }
        
        .edu-flip-card-front,
        .edu-flip-card-back {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          border-radius: 16px;
          box-sizing: border-box;
        }

        /* Premium Front Cards (.edu-card) */
        .edu-card {
          background: rgba(255, 255, 255, 0.98);
          border: 1px solid rgba(0,0,0,0.06);
          padding: 16px 14px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.02);
          transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
          display: flex;
          flex-direction: column;
          gap: 0;
          overflow: hidden;
          position: relative;
        }
        
        .edu-card > * {
          position: relative;
          z-index: 1;
        }

        /* Advanced Spotlight Hover Effect */
        .edu-card::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          border-radius: inherit;
          background: radial-gradient(
            400px circle at var(--mouse-x, -500px) var(--mouse-y, -500px),
            rgba(255, 255, 255, 0.8),
            transparent 40%
          );
          opacity: 0;
          transition: opacity 0.3s;
          pointer-events: none;
          z-index: 0;
        }

        .edu-card.active-card {
          border-color: var(--primary-blue);
          box-shadow: 0 12px 30px -10px rgba(0,0,0,0.08);
          transform: translateY(-4px);
        }
        
        .edu-flip-card-inner:hover .edu-card {
          border-color: rgba(0,0,0,0.15);
        }
        .edu-flip-card-inner:hover .edu-card::before {
          opacity: 1;
        }

        /* Tap Hint */
        .tap-hint {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 10.5px;
          color: #9ca3af;
          border-top: 1px dashed rgba(0,0,0,0.08);
          padding-top: 12px;
          margin-top: auto; /* Push to bottom */
        }
        [data-theme="dark"] .tap-hint { border-top-color: rgba(255,255,255,0.08); }

        /* Back Face */
        .edu-flip-card-back {
          background: #111827 !important;
          color: #ffffff !important;
          transform: rotateY(180deg);
          display: flex;
          flex-direction: column;
          padding: 20px 16px;
          border: 1px solid rgba(255,255,255,0.15) !important;
          box-sizing: border-box;
        }
        .back-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }
        .back-header p {
          font-size: 14px;
          font-weight: 700;
          line-height: 1.4;
          margin: 0;
          padding-right: 12px;
          color: #ffffff !important;
        }
        .back-header svg {
          color: #9ca3af !important;
          flex-shrink: 0;
          transition: color 0.2s;
        }
        .back-header svg:hover {
          color: #ffffff !important;
        }
        .back-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 20px;
        }
        .back-stat {
          background: rgba(255,255,255,0.08) !important;
          border-radius: 8px;
          padding: 10px 4px;
          text-align: center;
        }
        .back-stat-value {
          font-size: 15px;
          font-weight: 700;
          margin: 0 0 4px 0;
          color: var(--primary-blue, #007bff) !important;
        }
        .back-stat-label {
          font-size: 9px;
          color: #9ca3af !important;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .back-highlight {
          font-size: 12px;
          color: #e5e7eb !important;
          line-height: 1.6;
          margin: 0;
        }

        /* Front elements styling */
        .edu-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
          margin-bottom: 16px;
        }
        .edu-icon-box {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          background: rgba(0,0,0,0.03);
          color: #4b5563;
          transition: all 0.3s ease;
        }
        .edu-icon-box.active {
          background: var(--primary-blue);
          color: #fff;
        }
        .edu-year-pill {
          font-size: 9.5px;
          font-weight: 600;
          letter-spacing: 0.03em;
          border-radius: 999px;
          padding: 4px 10px;
          white-space: nowrap;
          background: rgba(0,0,0,0.03);
          color: #374151;
          transition: all 0.3s ease;
        }
        .edu-year-pill.active {
          background: var(--primary-blue);
          color: #fff;
        }
        .edu-card-title {
          font-size: 13.5px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 3px;
          line-height: 1.3;
        }
        .edu-card-inst {
          font-size: 11.5px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 4px;
        }
        .edu-card-loc {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 10.5px;
          color: var(--text-muted);
          margin-bottom: 14px;
        }
        .edu-sep {
          border: none;
          border-top: 1px solid rgba(0,0,0,0.06);
          margin: 0 0 14px;
        }
        .edu-card-desc {
          font-size: 11.5px;
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0 0 12px;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
        }
        .edu-score {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 10.5px;
          font-weight: 700;
          border-radius: 999px;
          padding: 4px 11px;
          width: fit-content;
          margin-bottom: 14px;
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          transition: all 0.3s ease;
        }
        .edu-score.active {
          background: #10b981;
          color: #fff;
        }
        .edu-progress-wrap { margin-bottom: 16px; }
        .edu-progress-label {
          font-size: 8.5px;
          letter-spacing: 0.08em;
          color: var(--text-muted);
          margin-bottom: 6px;
          font-weight: 600;
        }
        .edu-progress-track {
          height: 4px;
          background: rgba(0,0,0,0.05);
          border-radius: 999px;
          overflow: hidden;
        }
        .edu-progress-fill {
          height: 100%;
          border-radius: 999px;
          background: var(--primary-blue);
        }
        .edu-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 6px;
        }
        .edu-tag {
          font-size: 10px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 999px;
          white-space: nowrap;
          width: fit-content;
          background: rgba(59, 130, 246, 0.08);
          color: var(--primary-blue);
        }

        /* Arrow Flow Component */
        .education-arrow-flow {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(0,0,0,0.06);
          border-radius: 12px;
          padding: 16px 24px;
        }
        .arrow-flow-item-wrapper {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .arrow-flow-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }
        .arrow-flow-item svg {
          color: var(--text-secondary);
        }
        .arrow-flow-item span {
          font-size: 11px;
          color: var(--text-secondary);
        }
        .arrow-flow-item.active svg,
        .arrow-flow-item.active span {
          color: var(--primary-blue);
        }
        .arrow-flow-item.active span {
          font-weight: 600;
        }
        .arrow-flow-connector {
          color: var(--border-color);
        }

        /* Dark mode overrides */
        [data-theme="dark"] .edu-card { 
          background: #1f2937;
          border-color: rgba(255,255,255,0.08); 
        }
        [data-theme="dark"] .edu-card::before {
          background: radial-gradient(
            400px circle at var(--mouse-x, -500px) var(--mouse-y, -500px),
            rgba(255, 255, 255, 0.08),
            transparent 40%
          );
        }
        [data-theme="dark"] .edu-card.active-card { 
          border-color: rgba(255,255,255,0.2); 
          box-shadow: 0 12px 30px -10px rgba(0,0,0,0.3);
        }
        [data-theme="dark"] .edu-flip-card-inner:hover .edu-card {
          border-color: rgba(255,255,255,0.2);
        }
        
        [data-theme="dark"] .edu-sep, [data-theme="dark"] .tap-hint { border-color: rgba(255,255,255,0.08); }
        [data-theme="dark"] .edu-rail-line-container { background: rgba(255,255,255,0.1); }
        [data-theme="dark"] .edu-rail-line-active { background: linear-gradient(90deg, var(--primary-blue), #60a5fa); }
        [data-theme="dark"] .edu-rail-dot { border-color: #4b5563; background: #1f2937; }
        [data-theme="dark"] .edu-rail-dot.active { background: var(--primary-blue); border-color: var(--primary-blue); }
        [data-theme="dark"] .edu-rail-dot-tooltip {
          background: rgba(243, 244, 246, 0.98);
          color: #111827;
          border-color: rgba(0,0,0,0.08);
        }
        [data-theme="dark"] .edu-rail-dot-tooltip::after {
          border-color: rgba(243, 244, 246, 0.98) transparent transparent transparent;
        }
        
        [data-theme="dark"] .edu-icon-box,
        [data-theme="dark"] .edu-year-pill {
          background: rgba(255,255,255,0.05);
          color: var(--text-secondary);
        }
        [data-theme="dark"] .edu-icon-box.active, 
        [data-theme="dark"] .edu-year-pill.active {
          background: var(--primary-blue);
          color: #fff;
        }
        
        [data-theme="dark"] .edu-score {
          background: rgba(16, 185, 129, 0.15);
        }
        [data-theme="dark"] .edu-score.active {
          background: #10b981;
          color: #fff;
        }

        [data-theme="dark"] .edu-tag {
          background: rgba(59, 130, 246, 0.15);
        }
        
        [data-theme="dark"] .edu-progress-track { background: rgba(255,255,255,0.05); }
        [data-theme="dark"] .education-arrow-flow { 
          background: rgba(30,30,30,0.4);
          border-color: rgba(255,255,255,0.08); 
        }
        /* ============ MOBILE LAYOUT ============ */
        .mobile-edu-feed { display: none; }
        @media (max-width: 900px) {
          .edu-page {
            min-height: auto !important;
            height: 100% !important;
            overflow: hidden !important;
          }
          .edu-rail, .edu-grid, .education-arrow-flow, .section-subtitle, .edu-closing-summary { display: none !important; }
          .mobile-edu-feed {
            display: flex; flex-direction: column; gap: 12px; width: 100%;
          }

          .medu-card {
            position: relative; overflow: hidden;
            display: flex; align-items: flex-start; gap: 13px;
            padding: 14px 14px 14px 18px;
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 18px;
            width: 100%; text-align: left; cursor: pointer;
            transition: background 0.15s; outline: none;
          }
          .medu-card:active { background: var(--bg-primary); }
          
          .medu-stripe {
            position: absolute; left: 0; top: 0; bottom: 0;
            width: 3px; border-radius: 18px 0 0 18px;
          }

          .medu-icon-wrap {
            width: 42px; height: 42px; border-radius: 12px;
            display: flex; align-items: center; justify-content: center;
            flex-shrink: 0; position: relative; overflow: hidden;
            border: 1px solid;
          }

          .medu-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
          .medu-title-row { display: flex; align-items: center; gap: 8px; margin-bottom: 5px; flex-wrap: wrap; }
          .medu-title { font-size: 14.5px; font-weight: 700; color: var(--text-primary); margin: 0; line-height: 1.2; }
          .medu-inst { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin: 0; }
          
          .medu-chevron { color: var(--text-muted); flex-shrink: 0; margin-top: 2px; }

          /* PREMIUM ANIMATED DETAIL SHEET */
          .dsheet-backdrop {
            position: fixed; inset: 0;
            background: rgba(0,0,0,.65);
            backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
            will-change: opacity, backdrop-filter; transform: translateZ(0);
            z-index: 10000;
          }
          .dsheet {
            position: fixed; bottom: 0; left: 0; right: 0; z-index: 10001;
            background: var(--bg-secondary); border-top-left-radius: 28px; border-top-right-radius: 28px;
            will-change: transform; transform: translateZ(0); backface-visibility: hidden;
            box-shadow: 0 -20px 60px rgba(0,0,0,.25), 0 -1px 0 rgba(255,255,255,.06);
            display: flex; flex-direction: column;
            height: 86vh; height: 86dvh;
          }
          .dsheet-handle {
            width: 36px; height: 4px; border-radius: 2px; background: var(--border-color);
            margin: 12px auto 0; flex-shrink: 0;
          }
          .dsheet-header {
            display: flex; align-items: center; justify-content: space-between;
            padding: 16px 18px 14px; border-bottom: 1px solid var(--border-color); flex-shrink: 0;
          }
          .dsheet-header-left { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0; }
          .dsheet-header-icon {
            width: 44px; height: 44px; border-radius: 14px; flex-shrink: 0;
            display: flex; align-items: center; justify-content: center;
          }
          .dsheet-title h3 { font-size: 16px; font-weight: 800; color: var(--text-primary); margin: 0 0 2px; letter-spacing: -.02em; line-height: 1.25; }
          .dsheet-title p { font-size: 11px; font-weight: 700; color: var(--primary-blue); text-transform: uppercase; letter-spacing: .06em; margin: 0; }
          .dsheet-close {
            width: 30px; height: 30px; border-radius: 15px; background: var(--bg-primary);
            border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: center;
            color: var(--text-secondary); cursor: pointer; flex-shrink: 0; margin-left: 10px;
          }
          .dsheet-body {
            flex: 1; overflow-y: auto; padding: 0; display: flex; flex-direction: column; position: relative;
          }
          .dsheet-body::-webkit-scrollbar { display: none; }
          .dsheet-content { padding: 18px; display: flex; flex-direction: column; gap: 16px; padding-bottom: 32px; }
          
          .dsheet-section-label {
            font-size: 10px; font-weight: 800; color: var(--text-muted);
            text-transform: uppercase; letter-spacing: .1em; margin: 0 0 8px;
          }

          /* Hero stat card */
          .edu-hero-card {
            display: flex; align-items: center; gap: 16px; padding: 16px;
            background: var(--bg-primary); border: 1px solid var(--border-color);
            border-radius: 16px;
          }
          .edu-hero-icon-wrap {
            width: 68px; height: 68px; border-radius: 18px; flex-shrink: 0;
            display: flex; align-items: center; justify-content: center;
            position: relative; overflow: hidden;
          }
          .edu-hero-icon-bg { position: absolute; inset: 0; }
          .edu-hero-icon-wrap svg { position: relative; z-index: 1; }
          .edu-hero-meta { flex: 1; display: flex; flex-direction: column; gap: 9px; }
          .edu-hero-meta-row { display: flex; align-items: center; gap: 7px; font-size: 12px; color: var(--text-secondary); }
          .edu-hero-meta-row svg { color: var(--text-muted); flex-shrink: 0; }
          .edu-hero-meta-row strong { color: var(--text-primary); font-weight: 700; }

          /* Progress bar in sheet */
          .edu-sheet-prog-wrap { display: flex; flex-direction: column; gap: 6px; }
          .edu-sheet-prog-label {
            display: flex; justify-content: space-between;
            font-size: 11px; font-weight: 700; color: var(--text-secondary);
          }
          .edu-sheet-prog-track {
            height: 6px; background: var(--border-color); border-radius: 3px; overflow: hidden;
          }
          .edu-sheet-prog-fill {
            height: 100%; border-radius: 3px;
          }

          .dsheet-desc { font-size: 13.5px; line-height: 1.65; color: var(--text-secondary); margin: 0; }

          .edu-detail-tags { display: flex; flex-wrap: wrap; gap: 6px; }
          .edu-detail-tag {
            font-size: 11px; font-weight: 700; padding: 5px 11px; border-radius: 20px;
            background: var(--bg-primary); border: 1px solid var(--border-color);
            color: var(--text-secondary);
          }

          .ps-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
          .ps-stat {
            background: var(--bg-primary); border: 1px solid var(--border-color);
            border-radius: 12px; padding: 11px 10px;
            display: flex; flex-direction: column; align-items: center; gap: 2px;
          }
          .ps-stat-label { font-size: 9.5px; color: var(--text-muted); margin: 0; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; }
          .ps-stat-value { font-size: 18px; font-weight: 900; color: var(--text-primary); margin: 0; line-height: 1.1; }

          .mesh-gradient {
            position: absolute; width: 200%; height: 200%;
            background: radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.15), transparent 60%), radial-gradient(circle at 80% 20%, rgba(234, 179, 8, 0.15), transparent 50%);
            animation: meshFlow 8s ease infinite alternate;
          }
          @keyframes meshFlow { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(-20%, -20%) scale(1.1); } }

          .dsheet-scroll-hint {
            position: absolute; bottom: 0; left: 0; right: 0; height: 70px;
            background: linear-gradient(to top, var(--bg-secondary) 30%, transparent);
            display: flex; justify-content: center; align-items: flex-end; padding-bottom: 12px;
            pointer-events: none; color: var(--text-secondary); z-index: 100;
          }
        }
      `}</style>

      <div className="edu-page">
        {/* Header */}
        <div className="edu-header">
          <h1>Education</h1>
          <p>My academic journey — from foundation to university</p>
        </div>

        {/* Horizontal Progress Rail */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <Loader2 className="spin" size={32} color="var(--primary-blue)" />
          </div>
        ) : timelineData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            No education entries found.
          </div>
        ) : (
          <>
            <div className="edu-rail">
              <div className="edu-rail-line-container">
                <div 
                  className="edu-rail-line-active" 
                  style={{ width: `${(activeIndex / Math.max(1, timelineData.length - 1)) * 100}%` }}
                ></div>
              </div>
              <div className="edu-rail-dots" style={{ gridTemplateColumns: `repeat(${timelineData.length}, 1fr)` }}>
                {timelineData.map((item, index) => (
                  <div key={item.id} className="edu-rail-dot-wrap">
                {/* Floating Preview Tooltip */}
                <div className="edu-rail-dot-tooltip">
                  <div style={{ fontWeight: '700', marginBottom: '2px' }}>{item.title}</div>
                  <div style={{ opacity: 0.8, fontSize: '10px' }}>{item.institution}</div>
                </div>

                {/* Clickable node button */}
                <button 
                  className={`edu-rail-dot ${index === activeIndex ? 'active' : ''}`}
                  onClick={() => handleCardClick(index)}
                  aria-label={`Show ${item.title}`}
                />

                {/* Year Label */}
                <span 
                  className={`edu-rail-dot-label ${index === activeIndex ? 'active' : ''}`}
                  onClick={() => handleCardClick(index)}
                >
                  {item.year.split(' – ')[1] || item.year}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Grid */}
        <motion.div
          className="edu-grid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {timelineData.map((item, index) => (
            <EducationCard 
              key={item.id}
              item={item}
              index={index}
              activeIndex={activeIndex}
              flippedIndex={flippedIndex}
              onCardClick={handleCardClick}
              onFlip={handleFlip}
              onClose={() => setFlippedIndex(null)}
            />
          ))}
        </motion.div>

        {/* ── MOBILE VERTICAL FEED ── */}
        {isMobile && (
          <div className="mobile-edu-feed">
            {timelineData.map((item, index) => {
              const accents = ['#3b82f6', '#eab308', '#10b981', '#8b5cf6'];
              const accent = accents[index % accents.length];
              const Icon = iconMap[item.icon_class] || School;
              return (
                <button 
                  key={item.id} 
                  className="medu-card"
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="medu-stripe" style={{ background: accent }} />
                  <div className="medu-icon-wrap" style={{ background: accent + '18', color: accent, borderColor: accent + '30' }}>
                    <Icon size={20} style={{ color: accent }} />
                  </div>
                  <div className="medu-info">
                    <div className="medu-title-row">
                      <h3 className="medu-title">{item.title}</h3>
                    </div>
                    <p className="medu-inst" style={{ color: accent }}>{item.institution}</p>
                  </div>
                  <ChevronRight size={15} className="medu-chevron" />
                </button>
              );
            })}
          </div>
        )}

        {/* Closing Summary */}
        <div className="edu-closing-summary" style={{ marginTop: 'auto', paddingTop: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <p className="section-subtitle" style={{ color: '#6b7280', fontSize: '13px', marginBottom: '8px', textAlign: 'center', fontWeight: 'normal' }}>Your journey at a glance</p>
          <EducationArrowFlow activeIndex={activeIndex} />
        </div>
        </>
        )}
      </div>

      {/* ── DETAIL SHEET (Mobile) ── */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedItem && (() => {
            const itemIndex = timelineData.indexOf(selectedItem);
            const accents = ['#3b82f6', '#eab308', '#10b981', '#8b5cf6'];
            const accent = accents[itemIndex % accents.length];
            const Icon = iconMap[selectedItem.icon_class] || School;
            return (
            <div style={{ position: 'relative', zIndex: 9999 }}>
              <motion.div
                className="dsheet-backdrop"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSelectedItem(null)}
              />
              <motion.div
                className="dsheet"
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 32, stiffness: 350, mass: 0.9 }}
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: 0.4 }}
                onDragEnd={(_, info) => { if (info.offset.y > 120 || info.velocity.y > 600) setSelectedItem(null); }}
              >
                <div className="dsheet-handle" />

                {/* Header with accent icon */}
                <div className="dsheet-header">
                  <div className="dsheet-header-left">
                    <div className="dsheet-header-icon" style={{ background: accent + '18', color: accent, border: `1px solid ${accent}30` }}>
                      <Icon size={22} />
                    </div>
                    <div className="dsheet-title">
                      <h3>{selectedItem.title}</h3>
                      <p>{selectedItem.institution}</p>
                    </div>
                  </div>
                  <button className="dsheet-close" onClick={() => setSelectedItem(null)}>
                    <X size={16} />
                  </button>
                </div>

                <div 
                  className="dsheet-body" 
                  ref={sheetContentRef}
                  onScroll={(e) => { if (e.target.scrollTop > 10 && !sheetScrolled) setSheetScrolled(true); }}
                >
                  <div className="dsheet-content">

                    {/* Ring + Meta Box */}
                    <div style={{ background: "var(--bg-primary)", border: "1px solid var(--border-color)", borderRadius: 16, padding: 16, display: "flex", gap: 16, alignItems: "center", marginBottom: 6 }}>
                      {selectedItem.progress != null ? (
                        <ScoreRing percent={selectedItem.progress} color={selectedItem.color} />
                      ) : (
                        <div style={{ width: 64, height: 64, borderRadius: 16, background: selectedItem.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1px solid ${selectedItem.color}30` }}>
                          <Icon size={28} style={{ color: selectedItem.color }} />
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.3 }}>{selectedItem.institution}</div>
                        <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={10} /> {selectedItem.location}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <School size={10} /> {selectedItem.year}
                        </div>
                      </div>
                    </div>

                    {/* Stats grid */}
                    <div>
                      <SectionLabel>at a glance</SectionLabel>
                      <div className="ps-stats" style={{ gridTemplateColumns: `repeat(${selectedItem.backStats.length}, 1fr)`, gap: 8 }}>
                        {selectedItem.backStats.map(stat => (
                          <div key={stat.label} className="ps-stat" style={{ padding: '10px 8px', alignItems: 'center' }}>
                            <p className="ps-stat-label" style={{ fontSize: 9, textTransform: 'lowercase' }}>{stat.label}</p>
                            <p className="ps-stat-value" style={{ color: selectedItem.color, fontSize: 16, marginTop: 2 }}>{stat.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <SectionLabel>about</SectionLabel>
                      <p className="dsheet-desc" style={{ fontSize: 12.5 }}>{selectedItem.description}</p>
                    </div>

                    {/* Highlights */}
                    <div>
                      <SectionLabel>highlights</SectionLabel>
                      <div className="edu-detail-tags">
                        {selectedItem.highlights.map(h => (
                          <span key={h} className="edu-detail-tag" style={{ color: selectedItem.textColor, background: selectedItem.bg, border: `1px solid ${selectedItem.color}20`, fontWeight: 600 }}>{h}</span>
                        ))}
                      </div>
                    </div>

                    {/* Timeline Strip */}
                    <div>
                      <SectionLabel>timeline context</SectionLabel>
                      <TimelineStrip stages={timelineData} activeId={selectedItem.id} />
                    </div>

                  </div>

                  <AnimatePresence>
                    {sheetScrollable && !sheetScrolled && (
                      <motion.div className="dsheet-scroll-hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                        <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: '2px' }}>Scroll</span>
                          <ChevronDown size={16} />
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
            );
          })()}
        </AnimatePresence>,
        document.body
      )}
    </ScrollReveal>
  );
}
