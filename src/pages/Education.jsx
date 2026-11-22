import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { 
  MapPin, Trophy, Laptop, BookOpen, School, X, Hand, ChevronRight, 
  ChevronLeft, ChevronDown, Loader2, GraduationCap, Award, Calendar, 
  RotateCcw, Sparkles, Check 
} from 'lucide-react';
import { ScrollReveal, RollingText } from '../components';
import useRealtimeData from '../hooks/useRealtimeData';

const iconMap = {
  'School': School,
  'Trophy': Trophy,
  'BookOpen': BookOpen,
  'Laptop': Laptop,
  'GraduationCap': GraduationCap
};

const DEFAULT_EDUCATION = [
  {
    id: "primary",
    short_label: "Primary",
    shortLabel: "Primary",
    year: "2009 – 2015",
    title: "Primary Education",
    institution: "Aditya Birla Public School",
    location: "Thummalapenta",
    description: "Built foundational skills in reading, writing, and mathematics from KG through 5th grade. Developed early academic curiosity and enthusiasm for learning and school activities.",
    score: "CBSE Foundation",
    progress: 100,
    icon_class: "School",
    theme_color: "#0284c7",
    color: "#0284c7",
    bg_color: "#e0f2fe",
    text_color: "#0369a1",
    highlights: ["Foundation Skills", "Early Learning", "School Activities"],
    back_stats: [
      { label: "Grade", value: "5th" },
      { label: "Board", value: "CBSE" },
      { label: "Grades", value: "A+" }
    ],
    backStats: [
      { label: "Grade", value: "5th" },
      { label: "Board", value: "CBSE" },
      { label: "Grades", value: "A+" }
    ],
    highlight_text: "Built foundational skills and early academic curiosity.",
    highlight: "Built foundational skills and early academic curiosity.",
    display_order: 1,
  },
  {
    id: "secondary",
    short_label: "Secondary",
    shortLabel: "Secondary",
    year: "2015 – 2019",
    title: "Secondary Education",
    institution: "Viswabharathi High School",
    location: "Gudivada",
    description: "Achieved a perfect GPA in board examinations. Built a strong foundation in Mathematics, Science, and English while actively participating in school extracurricular activities.",
    score: "10/10 GPA — 100%",
    progress: 100,
    icon_class: "Trophy",
    theme_color: "#d97706",
    color: "#d97706",
    bg_color: "#fef3c7",
    text_color: "#b45309",
    highlights: ["Perfect GPA", "Math & Science", "Extracurriculars"],
    back_stats: [
      { label: "GPA", value: "10/10" },
      { label: "Board", value: "State" },
      { label: "Class", value: "1st" }
    ],
    backStats: [
      { label: "GPA", value: "10/10" },
      { label: "Board", value: "State" },
      { label: "Class", value: "1st" }
    ],
    highlight_text: "Achieved a perfect GPA in 10th grade board examinations.",
    highlight: "Achieved a perfect GPA in 10th grade board examinations.",
    display_order: 2,
  },
  {
    id: "intermediate",
    short_label: "Intermediate",
    shortLabel: "Intermediate",
    year: "2019 – 2022",
    title: "Intermediate (11th & 12th)",
    institution: "Narayana Junior College",
    location: "Vijayawada",
    description: "Completed MPC stream with focus on engineering entrance preparation. Maintained excellent academics while preparing for JEE and EAMCET competitive exams.",
    score: "92.7% — 927/1000",
    progress: 93,
    icon_class: "BookOpen",
    theme_color: "#059669",
    color: "#059669",
    bg_color: "#d1fae5",
    text_color: "#047857",
    highlights: ["MPC Stream", "JEE / EAMCET", "Math & Physics"],
    back_stats: [
      { label: "Marks", value: "92.7%" },
      { label: "Stream", value: "MPC" },
      { label: "Board", value: "State" }
    ],
    backStats: [
      { label: "Marks", value: "92.7%" },
      { label: "Stream", value: "MPC" },
      { label: "Board", value: "State" }
    ],
    highlight_text: "Maintained excellent academics while preparing for JEE and EAMCET.",
    highlight: "Maintained excellent academics while preparing for JEE and EAMCET.",
    display_order: 3,
  },
  {
    id: "btech",
    short_label: "B.Tech",
    shortLabel: "B.Tech",
    year: "2022 – 2026",
    title: "Bachelor of Technology",
    institution: "VIT University",
    location: "Katpadi, Vellore",
    description: "Pursuing B.Tech in Computer Science & Engineering. Gaining deep expertise in DSA, software development, and emerging technologies. Actively involved in coding competitions and technical projects.",
    score: "CGPA: 8.7 / 10",
    progress: 87,
    icon_class: "Laptop",
    theme_color: "#2563eb",
    color: "#2563eb",
    bg_color: "#eff6ff",
    text_color: "#1d4ed8",
    highlights: ["CS & Engineering", "DSA & Dev", "AI & ML"],
    back_stats: [
      { label: "CGPA", value: "8.7" },
      { label: "Projects", value: "3" },
      { label: "Hackathons", value: "2" }
    ],
    backStats: [
      { label: "CGPA", value: "8.7" },
      { label: "Projects", value: "3" },
      { label: "Hackathons", value: "2" }
    ],
    highlight_text: "Actively involved in coding competitions and technical projects.",
    highlight: "Actively involved in coding competitions and technical projects.",
    display_order: 4,
  }
];

const RING_RADIUS = 27;
const RING_CIRC = 2 * Math.PI * RING_RADIUS;

function ScoreRing({ percent, color, size = 46 }) {
  const offset = RING_CIRC - (percent / 100) * RING_CIRC;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox="0 0 64 64">
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
        <span style={{ fontSize: size <= 50 ? 11.5 : 14, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}>{percent}%</span>
        <span style={{ fontSize: size <= 50 ? 7.5 : 9, color: "var(--text-muted)", fontWeight: 600 }}>score</span>
      </div>
    </div>
  );
}

function TimelineStrip({ stages, activeId }) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginTop: 5 }}>
      {stages.map((s, i) => (
        <div key={s.id} style={{ display: "flex", alignItems: "center", flex: i === stages.length - 1 ? "none" : 1 }}>
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{
              width: s.id === activeId ? 8 : 6,
              height: s.id === activeId ? 8 : 6,
              borderRadius: "50%",
              background: s.id === activeId ? s.color : "var(--border-color)",
              marginBottom: 3,
              transition: "all 0.3s ease"
            }} />
            <div style={{
              fontSize: 8.5,
              fontWeight: s.id === activeId ? 700 : 500,
              color: s.id === activeId ? "var(--text-primary)" : "var(--text-muted)",
              letterSpacing: "-0.01em"
            }}>{s.shortLabel}</div>
          </div>
          {i < stages.length - 1 && (
            <div style={{ flex: 1, height: 1.5, background: "var(--border-color)", margin: "0 6px", alignSelf: "flex-start", marginTop: 3 }} />
          )}
        </div>
      ))}
    </div>
  );
}

function SectionLabel({ children }) {
  return <div className="dsheet-section-label" style={{ marginBottom: 3, marginTop: 7 }}>{children}</div>;
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
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
    onCardClick(index);
  };

  const handleFlip = (e) => {
    e.stopPropagation();
    onFlip(index);
  };

  const handleClose = (e) => {
    e.stopPropagation();
    onClose();
  };

  const isCurrent = item.id === 'btech' || (item.year && item.year.includes('2026'));
  const themeColor = item.color || item.theme_color || '#2563eb';
  const stats = item.backStats || item.back_stats || [];
  const highlights = Array.isArray(item.highlights) 
    ? item.highlights 
    : typeof item.highlights === 'string' 
    ? item.highlights.split(',').map(h => h.trim()) 
    : [];

  return (
    <motion.div className="edu-flip-card" variants={cardVariants}>
      <div className={`edu-flip-card-inner ${isFlipped ? "flipped" : ""}`}>

        {/* FRONT FACE */}
        <div
          className={`edu-flip-card-front edu-card ${isActive ? 'active-card' : ''}`}
          onClick={handleCardClick}
          ref={cardRef}
          onMouseMove={handleMouseMove}
          style={{
            '--card-accent': themeColor,
          }}
        >
          {/* Subtle top indicator bar */}
          <div className="edu-card-top-bar" />

          {/* Top Row: Graphic Icon Badge + Status Pill / Year */}
          <div className="edu-card-top">
            <div className={`edu-icon-box ${isActive ? 'active' : ''}`}>
              <Icon size={20} />
            </div>
            <div className="edu-card-badges">
              {isCurrent ? (
                <span className="edu-live-badge">
                  <span className="edu-live-dot" />
                  Pursuing
                </span>
              ) : (
                <span className="edu-done-badge">
                  <Check size={10} />
                  Completed
                </span>
              )}
              <span className={`edu-year-pill ${isActive ? 'active' : ''}`}>
                <Calendar size={10} />
                {item.year}
              </span>
            </div>
          </div>

          {/* Title & Institution with Location */}
          <div className="edu-title-group">
            <h3 className="edu-card-title">{item.title}</h3>
            <p className="edu-card-inst">{item.institution}</p>
            <p className="edu-card-loc">
              <MapPin size={11} />
              <span>{item.location}</span>
            </p>
          </div>

          <hr className="edu-sep" />

          {/* Description */}
          <p className="edu-card-desc">{item.description}</p>

          {/* Score & Progress Graphic Banner */}
          {item.score && (
            <div className="edu-score-card">
              <div className="edu-score-left">
                <div className="edu-score-icon-wrap">
                  <Award size={14} />
                </div>
                <div className="edu-score-info">
                  <span className="edu-score-label">ACADEMIC PERFORMANCE</span>
                  <span className="edu-score-value">{item.score}</span>
                </div>
              </div>
              {item.progress && (
                <div className="edu-score-gauge">
                  <span className="edu-gauge-num">{item.progress}%</span>
                </div>
              )}
            </div>
          )}

          {/* Coursework / Highlights Tags */}
          {highlights.length > 0 && (
            <div className="edu-tags">
              {highlights.slice(0, 3).map((h) => (
                <span key={h} className="edu-tag">
                  {h}
                </span>
              ))}
            </div>
          )}

          {/* Bottom Flip Trigger Action */}
          <div className="edu-flip-trigger" onClick={handleFlip}>
            <span>Academic Stats</span>
            <RotateCcw size={12} className="edu-flip-icon" />
          </div>
        </div>

        {/* BACK FACE */}
        <div 
          className="edu-flip-card-back" 
          onClick={handleClose}
          style={{
            '--card-accent': themeColor,
          }}
        >
          <div className="back-header">
            <div>
              <span className="back-degree-type">{item.shortLabel || item.short_label || 'Milestone'}</span>
              <h4 className="back-title">{item.title}</h4>
              <p className="back-inst">{item.institution}</p>
            </div>
            <button className="back-close-btn" onClick={handleClose} aria-label="Close card">
              <X size={14} />
            </button>
          </div>

          {/* 3 Bento Stats Grid */}
          {stats.length > 0 && (
            <div className="back-stats-grid">
              {stats.map((stat) => (
                <div key={stat.label} className="back-stat-cell">
                  <p className="back-stat-val">{stat.value}</p>
                  <p className="back-stat-lbl">{stat.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Highlight Quote Block */}
          {(item.highlight || item.highlight_text) && (
            <div className="back-highlight-box">
              <Sparkles size={14} className="back-highlight-icon" />
              <p className="back-highlight-text">{item.highlight || item.highlight_text}</p>
            </div>
          )}

          {/* Flip Return Action */}
          <div className="back-flip-return" onClick={handleClose}>
            <RotateCcw size={12} />
            <span>Return to Overview</span>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

export default function Education() {
  const { data: rawEducation, loading } = useRealtimeData('education', { orderColumn: 'display_order', ascending: true });
  const [timelineData, setTimelineData] = useState(DEFAULT_EDUCATION);
  const [activeIndex, setActiveIndex] = useState(0);
  const [flippedIndex, setFlippedIndex] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [sheetScrolled, setSheetScrolled] = useState(false);
  const [sheetScrollable, setSheetScrollable] = useState(false);
  const sheetContentRef = useRef(null);
  const [mobileActiveIdx, setMobileActiveIdx] = useState(0);
  const mobileTrackRef = useRef(null);
  const dragControls = useDragControls();

  const handleMobileScroll = () => {
    const track = mobileTrackRef.current;
    if (!track) return;
    const { scrollLeft, offsetWidth } = track;
    const card = track.querySelector('.medu-snap-card');
    const cardWidth = card ? card.offsetWidth + 12 : offsetWidth * 0.85;
    const idx = Math.round(scrollLeft / cardWidth);
    setMobileActiveIdx(Math.min(Math.max(0, idx), timelineData.length - 1));
  };

  const scrollToMobileStage = (idx) => {
    const track = mobileTrackRef.current;
    if (!track) return;
    const cards = track.querySelectorAll('.medu-snap-card');
    if (cards[idx]) {
      cards[idx].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
      setMobileActiveIdx(idx);
    }
  };

  useEffect(() => {
    if (rawEducation && rawEducation.length > 0) {
      const mapped = rawEducation.map(d => ({
        ...d,
        shortLabel: d.short_label || d.shortLabel,
        color: d.theme_color || d.color,
        bg: d.bg_color || d.bg,
        textColor: d.text_color || d.textColor,
        backStats: d.back_stats || d.backStats || [],
        highlight: d.highlight_text || d.highlight
      }));
      setTimelineData(mapped);
    }
  }, [rawEducation]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 900;
      setIsMobile(mobile);
      if (!mobile) {
        setSelectedItem(null);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Lock body scroll and listen for Escape key when mobile detail sheet is open
  useEffect(() => {
    if (isMobile && selectedItem) {
      const originalOverflow = document.body.style.overflow;
      const originalTouchAction = document.body.style.touchAction;
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') setSelectedItem(null);
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.touchAction = originalTouchAction;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isMobile, selectedItem]);

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
          min-height: 100%;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding-bottom: 24px;
        }

        /* Header */
        .edu-header {
          flex-shrink: 0;
          margin-bottom: 4px;
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
          margin: 6px 0 16px;
          height: 56px;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          width: 100%;
          flex-shrink: 0;
        }
        .edu-rail-line-container {
          position: absolute;
          top: 13px; /* aligns with center of 28px nodes */
          left: 12.5%;
          right: 12.5%;
          height: 3px;
          background: var(--border-color, #e6e8ec);
          border-radius: 999px;
          z-index: 1;
        }
        .edu-rail-line-active {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background: linear-gradient(90deg, #2563eb, #7c3aed);
          box-shadow: 0 0 10px rgba(37, 99, 235, 0.4);
          transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          border-radius: 999px;
        }
        .edu-rail-dots {
          position: relative;
          z-index: 2;
          display: grid;
          width: 100%;
        }
        .edu-rail-dot-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }
        .edu-rail-dot {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: var(--bg-secondary, #ffffff);
          border: 2px solid var(--border-color, #cbd5e1);
          cursor: pointer;
          padding: 0;
          outline: none;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(0,0,0,0.06);
          font-size: 11px;
          font-weight: 700;
          color: var(--text-muted, #5b6270);
        }
        .edu-rail-dot:hover {
          border-color: #2563eb;
          color: #2563eb;
          transform: scale(1.12);
          box-shadow: 0 0 12px rgba(37, 99, 235, 0.25);
        }
        .edu-rail-dot.active {
          background: #2563eb;
          border-color: #2563eb;
          color: #ffffff;
          box-shadow: 0 0 0 5px rgba(37, 99, 235, 0.2);
          transform: scale(1.1);
        }
        
        /* Glow Pulse Ring */
        .edu-rail-dot.active::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 1px solid #2563eb;
          animation: dotPulse 2s infinite ease-out;
        }
        @keyframes dotPulse {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }

        /* Year Labels Underneath */
        .edu-rail-dot-label {
          margin-top: 7px;
          font-size: 11px;
          font-weight: 500;
          color: var(--text-muted, #5b6270);
          transition: all 0.25s ease;
          cursor: pointer;
          user-select: none;
        }
        .edu-rail-dot-label.active {
          color: #2563eb;
          font-weight: 700;
        }

        /* Hover Tooltip */
        .edu-rail-dot-tooltip {
          position: absolute;
          bottom: 100%;
          margin-bottom: 8px;
          background: rgba(11, 11, 15, 0.95);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          color: #ffffff;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 11px;
          text-align: center;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          border: 1px solid rgba(255,255,255,0.1);
          opacity: 0;
          pointer-events: none;
          transform: translateY(6px);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 20;
          white-space: nowrap;
        }
        .edu-rail-dot-tooltip::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border-width: 4px;
          border-style: solid;
          border-color: rgba(11, 11, 15, 0.95) transparent transparent transparent;
        }
        .edu-rail-dot-wrap:hover .edu-rail-dot-tooltip {
          opacity: 1;
          transform: translateY(0);
        }

        /* Grid */
        .edu-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          flex: 1;
          width: 100%;
          min-width: 0;
          align-items: stretch;
        }
        @media (max-width: 1200px) and (min-width: 901px) {
          .edu-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 16px;
          }
        }

        /* 3D Flip Card Container */
        .edu-flip-card {
          perspective: 1200px;
          min-height: 440px;
          height: 100%;
          width: 100%;
        }
        
        .edu-flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
          transform-style: preserve-3d;
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
          border-radius: 18px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
        }

        /* Front Cards (.edu-card) */
        .edu-card {
          background: var(--bg-secondary, #ffffff);
          border: 1px solid var(--border-color, #e6e8ec);
          padding: 20px 18px 18px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
          position: relative;
          cursor: pointer;
        }
        
        .edu-card:hover {
          transform: translateY(-4px);
          border-color: var(--card-accent, #2563eb);
          box-shadow: 0 14px 30px -8px rgba(15, 23, 42, 0.12), 0 4px 8px -2px rgba(15, 23, 42, 0.04);
        }

        .edu-card.active-card {
          border-color: var(--card-accent, #2563eb);
          box-shadow: 0 12px 28px -6px rgba(37, 99, 235, 0.16), 0 0 0 1px var(--card-accent, #2563eb);
        }

        /* Top indicator bar */
        .edu-card-top-bar {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3.5px;
          background: var(--card-accent, #2563eb);
          opacity: 0.85;
          border-radius: 18px 18px 0 0;
          transition: opacity 0.25s, height 0.25s;
        }

        .edu-card:hover .edu-card-top-bar {
          opacity: 1;
          height: 4.5px;
        }

        /* Top Row: Graphic Icon Badge + Badges */
        .edu-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 14px;
        }

        .edu-icon-box {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: color-mix(in srgb, var(--card-accent, #2563eb) 12%, transparent);
          color: var(--card-accent, #2563eb);
          border: 1px solid color-mix(in srgb, var(--card-accent, #2563eb) 22%, transparent);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          flex-shrink: 0;
        }

        .edu-card:hover .edu-icon-box {
          transform: scale(1.06) rotate(-2deg);
          background: var(--card-accent, #2563eb);
          color: #ffffff;
        }

        .edu-card-badges {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .edu-live-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 10px;
          font-weight: 700;
          color: #16a34a;
          background: rgba(22, 163, 74, 0.1);
          border: 1px solid rgba(22, 163, 74, 0.25);
          border-radius: 999px;
          padding: 3px 8px;
          letter-spacing: 0.02em;
        }

        .edu-live-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #16a34a;
          animation: livePulse 1.8s infinite;
        }

        @keyframes livePulse {
          0% { box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.6); }
          70% { box-shadow: 0 0 0 5px rgba(22, 163, 74, 0); }
          100% { box-shadow: 0 0 0 0 rgba(22, 163, 74, 0); }
        }

        .edu-done-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          font-weight: 600;
          color: var(--text-muted, #5b6270);
          background: var(--bg-primary, #f6f7f9);
          border: 1px solid var(--border-color, #e6e8ec);
          border-radius: 999px;
          padding: 3px 8px;
        }

        .edu-year-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          font-weight: 600;
          color: var(--text-secondary, #475569);
          background: var(--bg-primary, #f6f7f9);
          border: 1px solid var(--border-color, #e6e8ec);
          border-radius: 999px;
          padding: 3px 8px;
          white-space: nowrap;
        }

        /* Titles */
        .edu-title-group {
          margin-bottom: 12px;
        }

        .edu-card-title {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary, #0b0b0f);
          margin: 0 0 4px;
          line-height: 1.3;
          letter-spacing: -0.015em;
        }

        .edu-card-inst {
          font-size: 12.5px;
          font-weight: 600;
          color: var(--card-accent, #2563eb);
          margin: 0 0 4px;
          line-height: 1.35;
        }

        .edu-card-loc {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: var(--text-muted, #5b6270);
          margin: 0;
        }

        .edu-sep {
          border: none;
          border-top: 1px solid var(--border-color, #e6e8ec);
          margin: 0 0 12px;
        }

        .edu-card-desc {
          font-size: 11.5px;
          color: var(--text-secondary, #475569);
          line-height: 1.55;
          margin: 0 0 12px;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Score Performance Graphic Banner */
        .edu-score-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 8px 10px;
          background: var(--bg-primary, #f6f7f9);
          border: 1px solid var(--border-color, #e6e8ec);
          border-radius: 10px;
          margin-bottom: 12px;
        }

        .edu-score-left {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }

        .edu-score-icon-wrap {
          width: 26px;
          height: 26px;
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: color-mix(in srgb, var(--card-accent, #2563eb) 12%, transparent);
          color: var(--card-accent, #2563eb);
          flex-shrink: 0;
        }

        .edu-score-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .edu-score-label {
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: var(--text-muted, #8a909c);
          text-transform: uppercase;
        }

        .edu-score-value {
          font-size: 11.5px;
          font-weight: 700;
          color: var(--text-primary, #0b0b0f);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .edu-score-gauge {
          background: var(--bg-secondary, #ffffff);
          border: 1px solid var(--border-color, #e6e8ec);
          padding: 2px 7px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 700;
          color: var(--card-accent, #2563eb);
          font-variant-numeric: tabular-nums;
        }

        /* Tags */
        .edu-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin-bottom: 14px;
        }

        .edu-tag {
          font-size: 10px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 999px;
          background: color-mix(in srgb, var(--card-accent, #2563eb) 8%, transparent);
          color: var(--card-accent, #2563eb);
          border: 1px solid color-mix(in srgb, var(--card-accent, #2563eb) 18%, transparent);
          white-space: nowrap;
        }

        /* Flip Trigger Action */
        .edu-flip-trigger {
          margin-top: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 10px;
          background: var(--bg-primary, #f6f7f9);
          border: 1px solid var(--border-color, #e6e8ec);
          color: var(--text-primary, #0b0b0f);
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          user-select: none;
        }

        .edu-flip-trigger:hover {
          background: var(--card-accent, #2563eb);
          color: #ffffff;
          border-color: var(--card-accent, #2563eb);
        }

        .edu-flip-icon {
          transition: transform 0.3s ease;
        }

        .edu-flip-trigger:hover .edu-flip-icon {
          transform: rotate(-180deg);
        }

        /* BACK FACE */
        .edu-flip-card-back {
          background: var(--bg-secondary, #ffffff);
          border: 1px solid var(--border-color, #e6e8ec);
          padding: 20px 18px 18px;
          transform: rotateY(180deg);
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.05);
        }

        .back-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 14px;
          padding-bottom: 10px;
          border-bottom: 1px solid var(--border-color, #e6e8ec);
        }

        .back-degree-type {
          font-size: 9.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--card-accent, #2563eb);
          display: block;
          margin-bottom: 2px;
        }

        .back-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary, #0b0b0f);
          margin: 0 0 2px;
          line-height: 1.3;
        }

        .back-inst {
          font-size: 11px;
          color: var(--text-muted, #5b6270);
          margin: 0;
        }

        .back-close-btn {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 1px solid var(--border-color, #e6e8ec);
          background: var(--bg-primary, #f6f7f9);
          color: var(--text-secondary, #475569);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
          flex-shrink: 0;
        }

        .back-close-btn:hover {
          background: var(--border-color, #e6e8ec);
          color: var(--text-primary, #0b0b0f);
        }

        /* Bento Stats */
        .back-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
          margin-bottom: 14px;
        }

        .back-stat-cell {
          background: var(--bg-primary, #f6f7f9);
          border: 1px solid var(--border-color, #e6e8ec);
          border-radius: 10px;
          padding: 8px 4px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .back-stat-val {
          font-size: 14px;
          font-weight: 800;
          color: var(--card-accent, #2563eb);
          margin: 0 0 2px;
          line-height: 1.2;
        }

        .back-stat-lbl {
          font-size: 8.5px;
          font-weight: 600;
          color: var(--text-muted, #5b6270);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin: 0;
        }

        /* Highlight Box */
        .back-highlight-box {
          background: color-mix(in srgb, var(--card-accent, #2563eb) 6%, transparent);
          border: 1px dashed color-mix(in srgb, var(--card-accent, #2563eb) 25%, transparent);
          border-radius: 10px;
          padding: 10px 12px;
          display: flex;
          align-items: flex-start;
          gap: 8px;
          margin-bottom: 14px;
        }

        .back-highlight-icon {
          color: var(--card-accent, #2563eb);
          flex-shrink: 0;
          margin-top: 2px;
        }

        .back-highlight-text {
          font-size: 11px;
          line-height: 1.5;
          color: var(--text-secondary, #475569);
          margin: 0;
          font-style: italic;
        }

        /* Flip Back Action */
        .back-flip-return {
          margin-top: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 10px;
          background: var(--bg-primary, #f6f7f9);
          border: 1px solid var(--border-color, #e6e8ec);
          color: var(--text-secondary, #475569);
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          user-select: none;
        }

        .back-flip-return:hover {
          background: var(--border-color, #e6e8ec);
          color: var(--text-primary, #0b0b0f);
        }

        /* Dark mode overrides */
        [data-theme="dark"] .edu-card,
        [data-theme="dark"] .edu-flip-card-back {
          background: var(--bg-secondary, #12141a);
          border-color: rgba(255, 255, 255, 0.08);
        }

        [data-theme="dark"] .edu-card:hover,
        [data-theme="dark"] .edu-card.active-card {
          border-color: var(--card-accent, #2563eb);
          box-shadow: 0 14px 34px -8px rgba(0, 0, 0, 0.5), 0 0 0 1px var(--card-accent, #2563eb);
        }

        [data-theme="dark"] .edu-score-card,
        [data-theme="dark"] .back-stat-cell,
        [data-theme="dark"] .edu-flip-trigger,
        [data-theme="dark"] .back-flip-return,
        [data-theme="dark"] .back-close-btn,
        [data-theme="dark"] .edu-year-pill,
        [data-theme="dark"] .edu-done-badge {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.08);
        }

        [data-theme="dark"] .edu-score-gauge {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.12);
        }

        [data-theme="dark"] .back-title,
        [data-theme="dark"] .edu-card-title,
        [data-theme="dark"] .edu-score-value {
          color: #f1f5f9;
        }

        [data-theme="dark"] .edu-card-desc,
        [data-theme="dark"] .back-highlight-text {
          color: #94a3b8;
        }

        [data-theme="dark"] .edu-sep,
        [data-theme="dark"] .back-header {
          border-color: rgba(255, 255, 255, 0.08);
        }

        [data-theme="dark"] .edu-rail-line-container {
          background: rgba(255, 255, 255, 0.1);
        }
        [data-theme="dark"] .edu-rail-dot {
          background: #181d26;
          border-color: rgba(255, 255, 255, 0.16);
          color: #94a3b8;
        }
        [data-theme="dark"] .edu-rail-dot.active {
          background: #2563eb;
          border-color: #2563eb;
          color: #ffffff;
        }
        /* ============ MOBILE LAYOUT ============ */
        .edu-mobile-wrap { display: none; }
        @media (max-width: 900px) {
          .edu-page {
            min-height: auto !important;
            height: auto !important;
            overflow: visible !important;
          }
          .edu-header h1 { font-size: 16px; margin-bottom: 4px; }
          .edu-header p { font-size: 10px; line-height: 1.4; }
          .edu-rail, .edu-grid, .education-arrow-flow, .section-subtitle, .edu-closing-summary, .mobile-edu-feed { display: none !important; }

          .edu-mobile-wrap {
            display: flex;
            flex-direction: column;
            width: 100%;
            box-sizing: border-box;
            padding: 4px 0 20px;
          }

          .edu-mobile-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 2px 2px 14px;
            gap: 8px;
          }

          .edu-mobile-title-wrap {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .edu-mobile-icon-box {
            width: 28px;
            height: 28px;
            border-radius: 8px;
            background: rgba(59, 130, 246, 0.12);
            border: 1.2px solid rgba(59, 130, 246, 0.25);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            color: var(--primary-blue, #3B82F6);
          }

          .edu-mobile-heading {
            font-size: 14px;
            font-weight: 700;
            color: var(--text-primary);
            margin: 0;
            line-height: 1.2;
            letter-spacing: -0.01em;
          }

          .edu-mobile-sub {
            font-size: 10px;
            color: var(--text-muted);
            margin: 1px 0 0;
            line-height: 1.2;
          }

          .edu-mobile-controls {
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .edu-mobile-counter {
            font-size: 10px;
            font-weight: 700;
            color: var(--text-muted);
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            padding: 2px 8px;
            border-radius: 20px;
            letter-spacing: 0.03em;
          }

          .edu-nav-btn {
            width: 28px;
            height: 28px;
            border-radius: 8px;
            border: 1px solid var(--border-color);
            background: var(--bg-secondary);
            color: var(--text-primary);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: transform 0.15s ease, background 0.15s ease;
            padding: 0;
            -webkit-tap-highlight-color: transparent;
          }

          .edu-nav-btn:active:not(:disabled) {
            transform: scale(0.92);
          }

          .edu-nav-btn:disabled {
            opacity: 0.35;
            cursor: not-allowed;
          }

          /* ── Snap Track ── */
          .edu-mobile-track {
            display: flex;
            gap: 12px;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            scroll-padding-left: 2px;
            margin: 0;
            padding: 4px 2px 14px;
            -webkit-overflow-scrolling: touch;
            -ms-overflow-style: none;
            scrollbar-width: none;
          }

          .edu-mobile-track::-webkit-scrollbar {
            display: none;
          }

          .edu-mobile-track::after {
            content: '';
            flex: 0 0 4px;
          }

          /* ── Snap Card ── */
          .medu-snap-card {
            flex: 0 0 85%;
            min-width: 85%;
            max-width: 85%;
            scroll-snap-align: start;
            box-sizing: border-box;
            background: var(--bg-secondary, #FFFFFF);
            border: 1.5px solid var(--border-color, #CBD5E1);
            border-radius: 16px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
            padding: 14px 15px;
            display: flex;
            flex-direction: column;
            cursor: pointer;
            transition: transform 0.15s ease, border-color 0.15s ease;
            -webkit-tap-highlight-color: transparent;
          }

          .medu-snap-card:active {
            transform: scale(0.985);
          }

          [data-theme="dark"] .medu-snap-card {
            background: var(--bg-secondary, #161B22);
            border-color: rgba(255, 255, 255, 0.14);
            box-shadow: 0 4px 18px rgba(0, 0, 0, 0.28);
          }

          .medu-snap-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 8px;
            gap: 6px;
          }

          .medu-snap-badge {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            border-radius: 12px;
            padding: 2.5px 8px;
            border: 1.2px solid;
            font-size: 9.5px;
            font-weight: 600;
            letter-spacing: 0.02em;
            white-space: nowrap;
          }

          .medu-badge-dot {
            width: 4.5px;
            height: 4.5px;
            border-radius: 50%;
            background: currentColor;
          }

          .medu-snap-badge--blue {
            background: rgba(59, 130, 246, 0.08);
            border-color: rgba(59, 130, 246, 0.25);
            color: #2563EB;
          }
          [data-theme="dark"] .medu-snap-badge--blue {
            background: rgba(59, 130, 246, 0.15);
            border-color: rgba(59, 130, 246, 0.32);
            color: #60A5FA;
          }

          .medu-snap-badge--purple {
            background: rgba(99, 102, 241, 0.08);
            border-color: rgba(99, 102, 241, 0.25);
            color: #6366F1;
          }
          [data-theme="dark"] .medu-snap-badge--purple {
            background: rgba(99, 102, 241, 0.15);
            border-color: rgba(99, 102, 241, 0.32);
            color: #818CF8;
          }

          .medu-snap-badge--green {
            background: rgba(16, 185, 129, 0.08);
            border-color: rgba(16, 185, 129, 0.25);
            color: #059669;
          }
          [data-theme="dark"] .medu-snap-badge--green {
            background: rgba(16, 185, 129, 0.15);
            border-color: rgba(16, 185, 129, 0.32);
            color: #34D399;
          }

          .medu-snap-score {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            background: rgba(245, 158, 11, 0.1);
            border: 1.2px solid rgba(245, 158, 11, 0.3);
            color: #D97706;
            font-size: 9.5px;
            font-weight: 700;
            padding: 2px 7px;
            border-radius: 12px;
            white-space: nowrap;
          }

          [data-theme="dark"] .medu-snap-score {
            background: rgba(245, 158, 11, 0.16);
            border-color: rgba(245, 158, 11, 0.35);
            color: #FBBF24;
          }

          .medu-snap-title {
            font-size: 14.5px;
            font-weight: 700;
            color: var(--text-primary);
            margin: 0 0 4px;
            letter-spacing: -0.015em;
            line-height: 1.25;
          }

          .medu-snap-inst {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 10.5px;
            font-weight: 600;
            color: var(--primary-blue, #3B82F6);
            margin: 0 0 8px;
            line-height: 1.3;
          }

          .medu-snap-desc {
            font-size: 11px;
            color: var(--text-secondary);
            line-height: 1.5;
            margin: 0 0 10px;
            flex: 1;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .medu-snap-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            margin-bottom: 12px;
          }

          .medu-snap-tag {
            font-size: 9px;
            font-weight: 500;
            border-radius: 5px;
            padding: 2px 7px;
            border: 1px solid var(--border-color, #CBD5E1);
            background: var(--bg-primary, #F9FAFB);
            color: var(--text-muted, #6B7280);
            line-height: 1.25;
          }

          [data-theme="dark"] .medu-snap-tag {
            background: var(--bg-primary, #0D1117);
            border-color: rgba(255, 255, 255, 0.12);
            color: var(--text-muted, #9CA3AF);
          }

          .medu-snap-actions {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            margin-top: auto;
            padding-top: 4px;
          }

          .medu-snap-action-btn {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            font-size: 10.5px;
            font-weight: 600;
            color: var(--primary-blue, #3B82F6);
            background: none;
            border: none;
            padding: 0;
            cursor: pointer;
            transition: opacity 0.15s;
          }
          .medu-snap-action-btn:active {
            opacity: 0.7;
          }

          /* ── Dots pagination ── */
          .edu-mobile-dots {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
            margin-top: 6px;
            margin-bottom: 14px;
          }

          .edu-mobile-dot {
            width: 5px;
            height: 5px;
            border-radius: 50%;
            background: var(--border-color, #E5E7EB);
            border: none;
            padding: 0;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          }

          .edu-mobile-dot.active {
            background: var(--primary-blue, #3B82F6);
            width: 14px;
            border-radius: 3px;
          }

          /* ── Academic Specialization Bento Hub ── */
          .edu-bento-hub {
            background: var(--bg-secondary);
            border: 1.5px solid var(--border-color);
            border-radius: 16px;
            padding: 12px 14px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
          }

          [data-theme="dark"] .edu-bento-hub {
            background: var(--bg-secondary, #161B22);
            border-color: rgba(255, 255, 255, 0.14);
            box-shadow: 0 4px 18px rgba(0, 0, 0, 0.25);
          }

          .edu-bento-hub-header {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: var(--text-muted);
            margin: 0;
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .edu-bento-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }

          .edu-bento-item {
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: 10px;
            padding: 8px 10px;
            display: flex;
            flex-direction: column;
            gap: 2px;
          }

          [data-theme="dark"] .edu-bento-item {
            background: #0D1117;
            border-color: rgba(255, 255, 255, 0.12);
          }

          .edu-bento-val {
            font-size: 12.5px;
            font-weight: 800;
            color: var(--text-primary);
            letter-spacing: -0.01em;
          }

          .edu-bento-label {
            font-size: 9px;
            color: var(--text-muted);
            font-weight: 500;
            line-height: 1.3;
          }
          .medu-overview-title {
            font-size: 9.5px; font-weight: 800; text-transform: uppercase;
            letter-spacing: 0.08em; color: var(--text-muted); margin: 0;
            display: flex; align-items: center; gap: 5px;
          }
          .medu-overview-desc {
            font-size: 11px; color: var(--text-secondary); line-height: 1.5; margin: 0;
          }

          /* PREMIUM ANIMATED DETAIL SHEET */
          .dsheet-backdrop {
            position: fixed; inset: 0;
            background: rgba(0,0,0,.65);
            backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
            will-change: opacity, backdrop-filter; transform: translateZ(0);
            z-index: 10000;
          }
          .dsheet {
            position: fixed; bottom: 0; left: 0; right: 0; z-index: 10001;
            background: var(--bg-secondary, #ffffff);
            border-top-left-radius: 26px; border-top-right-radius: 26px;
            border-top: 1px solid var(--border-color, rgba(0,0,0,0.1));
            will-change: transform; transform: translateZ(0); backface-visibility: hidden;
            box-shadow: 0 -16px 48px rgba(0,0,0,.28), 0 -1px 0 rgba(255,255,255,.08);
            display: flex; flex-direction: column;
            max-height: min(78dvh, 680px);
            min-height: 48dvh;
            height: auto;
            touch-action: pan-y;
          }
          [data-theme="dark"] .dsheet {
            background: #161B22;
            border-top-color: rgba(255,255,255,0.14);
            box-shadow: 0 -18px 50px rgba(0,0,0,.55), 0 -1px 0 rgba(255,255,255,.1);
          }
          .dsheet-handle-bar {
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 10px 0 6px;
            cursor: grab;
            touch-action: none;
            user-select: none;
            -webkit-user-select: none;
          }
          .dsheet-handle-bar:active {
            cursor: grabbing;
          }
          .dsheet-handle {
            width: 38px; height: 4.5px; border-radius: 999px;
            background: var(--border-color, #cbd5e1);
            transition: background 0.2s ease, transform 0.2s ease;
          }
          .dsheet-handle-bar:active .dsheet-handle {
            transform: scaleX(1.15);
            background: var(--primary-blue, #3b82f6);
          }
          [data-theme="dark"] .dsheet-handle {
            background: rgba(255,255,255,0.25);
          }
          .dsheet-header {
            display: flex; align-items: center; justify-content: space-between;
            padding: 4px 16px 12px; border-bottom: 1px solid var(--border-color);
            flex-shrink: 0;
            cursor: grab;
            touch-action: none;
            user-select: none;
            -webkit-user-select: none;
          }
          .dsheet-header:active {
            cursor: grabbing;
          }
          .dsheet-header-left { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
          .dsheet-header-icon {
            width: 30px; height: 30px; border-radius: 9px; flex-shrink: 0;
            display: flex; align-items: center; justify-content: center;
          }
          .dsheet-title h3 { font-size: 13.5px; font-weight: 800; color: var(--text-primary); margin: 0; letter-spacing: -.015em; line-height: 1.25; }
          .dsheet-title p { font-size: 9px; font-weight: 700; color: var(--primary-blue); text-transform: uppercase; letter-spacing: .05em; margin: 1px 0 0; }
          .dsheet-close {
            width: 30px; height: 30px; border-radius: 50%; background: var(--bg-primary);
            border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: center;
            color: var(--text-secondary); cursor: pointer; flex-shrink: 0; margin-left: 8px;
            transition: transform 0.15s ease, background 0.15s ease, color 0.15s ease;
            -webkit-tap-highlight-color: transparent;
          }
          .dsheet-close:active {
            transform: scale(0.9);
            color: var(--text-primary);
          }
          .dsheet-body {
            flex: 1; overflow-y: auto; padding: 0; display: flex; flex-direction: column; position: relative;
            overscroll-behavior: contain;
            -webkit-overflow-scrolling: touch;
          }
          .dsheet-body::-webkit-scrollbar { display: none; }
          .dsheet-content {
            padding: 12px 16px max(24px, env(safe-area-inset-bottom, 24px));
            display: flex; flex-direction: column; gap: 12px;
          }
          
          .dsheet-section-label {
            font-size: 8.5px; font-weight: 800; color: var(--text-muted);
            text-transform: uppercase; letter-spacing: .08em; margin: 0 0 4px;
          }

          /* Hero stat card */
          .edu-hero-card {
            display: flex; align-items: center; gap: 10px; padding: 10px;
            background: var(--bg-primary); border: 1px solid var(--border-color);
            border-radius: 12px;
          }
          .edu-hero-icon-wrap {
            width: 40px; height: 40px; border-radius: 10px; flex-shrink: 0;
            display: flex; align-items: center; justify-content: center;
            position: relative; overflow: hidden;
          }
          .edu-hero-icon-bg { position: absolute; inset: 0; }
          .edu-hero-icon-wrap svg { position: relative; z-index: 1; }
          .edu-hero-meta { flex: 1; display: flex; flex-direction: column; gap: 6px; }
          .edu-hero-meta-row { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--text-secondary); }
          .edu-hero-meta-row svg { color: var(--text-muted); flex-shrink: 0; }
          .edu-hero-meta-row strong { color: var(--text-primary); font-weight: 700; }

          /* Progress bar in sheet */
          .edu-sheet-prog-wrap { display: flex; flex-direction: column; gap: 4px; }
          .edu-sheet-prog-label {
            display: flex; justify-content: space-between;
            font-size: 10px; font-weight: 700; color: var(--text-secondary);
          }
          .edu-sheet-prog-track {
            height: 5px; background: var(--border-color); border-radius: 3px; overflow: hidden;
          }
          .edu-sheet-prog-fill {
            height: 100%; border-radius: 3px;
          }

          .dsheet-desc { font-size: 11px; line-height: 1.5; color: var(--text-secondary); margin: 0; }

          .edu-detail-tags { display: flex; flex-wrap: wrap; gap: 5px; }
          .edu-detail-tag {
            font-size: 9.5px; font-weight: 600; padding: 3px 9px; border-radius: 14px;
            background: var(--bg-primary); border: 1px solid var(--border-color);
            color: var(--text-secondary);
          }

          .ps-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
          .ps-stat {
            background: var(--bg-primary); border: 1px solid var(--border-color);
            border-radius: 10px; padding: 7px 6px;
            display: flex; flex-direction: column; align-items: center; gap: 1px;
          }
          .ps-stat-label { font-size: 8px; color: var(--text-muted); margin: 0; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; }
          .ps-stat-value { font-size: 13.5px; font-weight: 900; color: var(--text-primary); margin: 0; line-height: 1.1; }

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
      <style>{`
        /* ── RollingText styles (Education) ── */
        .rolling-text-root {
          display: inline-block;
          max-width: 100%;
          text-align: left;
          font-size: clamp(20px, 3vw, 32px);
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 1;
          text-transform: uppercase;
          --rolling-accent: var(--primary-blue, #007bff);
        }
      `}</style>

      <div className="edu-page">
        {/* Desktop-only RollingText section title */}
        {!isMobile && (
          <div className="edu-header">
            <RollingText text="EDUCATION" speed={0.06} duration={3} />
            <p style={{ marginTop: '8px' }}>Academic background &amp; lifelong learning journey</p>
          </div>
        )}

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
                >
                  {index + 1}
                </button>

                    {/* Year Label */}
                    <span
                      className={`edu-rail-dot-label ${index === activeIndex ? 'active' : ''}`}
                      onClick={() => handleCardClick(index)}
                    >
                      {item?.year ? (item.year.includes(' – ') ? item.year.split(' – ')[1] : item.year) : ''}
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

            {/* ── MOBILE SNAP CAROUSEL VIEW ── */}
            {isMobile && (
              <div className="edu-mobile-wrap">
                {/* Mobile Hero Header */}
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <p style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.22em', textTransform: 'uppercase', margin: '0 0 6px' }}>
                    ACADEMIC FOUNDATION
                  </p>
                  <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px', letterSpacing: '-0.025em', lineHeight: 1.2 }}>
                    Degrees, Honors &amp; Studies
                  </h1>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 auto', lineHeight: 1.55 }}>
                    Swipe to explore academic milestones, university coursework, and honors.
                  </p>
                </div>

                {/* Header with Title & Controls */}
                <div className="edu-mobile-header">
                  <div className="edu-mobile-title-wrap">
                    <div className="edu-mobile-icon-box">
                      <GraduationCap size={15} />
                    </div>
                    <div>
                      <h2 className="edu-mobile-heading">Academic Journey</h2>
                      <p className="edu-mobile-sub">Degrees, milestones &amp; academic honors</p>
                    </div>
                  </div>
                  <div className="edu-mobile-controls">
                    <span className="edu-mobile-counter">
                      {mobileActiveIdx + 1} / {timelineData.length}
                    </span>
                    <button
                      className="edu-nav-btn"
                      onClick={() => scrollToMobileStage(Math.max(0, mobileActiveIdx - 1))}
                      disabled={mobileActiveIdx === 0}
                      aria-label="Previous education milestone"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      className="edu-nav-btn"
                      onClick={() => scrollToMobileStage(Math.min(timelineData.length - 1, mobileActiveIdx + 1))}
                      disabled={mobileActiveIdx === timelineData.length - 1}
                      aria-label="Next education milestone"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Horizontal Snap Track */}
                <div className="edu-mobile-track" ref={mobileTrackRef} onScroll={handleMobileScroll}>
                  {timelineData.map((item, index) => {
                    const Icon = iconMap[item.icon_class] || School;
                    const isBTech = (item.title || '').toLowerCase().includes('b.tech') || (item.title || '').toLowerCase().includes('computer');
                    const badgeTheme = isBTech ? 'blue' : index === 1 ? 'purple' : 'green';
                    const highlights = Array.isArray(item.highlights)
                      ? item.highlights.slice(0, 4)
                      : typeof item.highlights === 'string'
                        ? item.highlights.split(',').slice(0, 4).map(h => h.trim())
                        : [];

                    return (
                      <div
                        key={item.id || index}
                        className="medu-snap-card"
                        onClick={() => setSelectedItem(item)}
                      >
                        {/* Top Row: Year/Stage Badge + Score Badge */}
                        <div className="medu-snap-top">
                          <div className={`medu-snap-badge medu-snap-badge--${badgeTheme}`}>
                            <span className="medu-badge-dot" />
                            {item.year || item.shortLabel || 'Milestone'}
                          </div>
                          {item.score && (
                            <div className="medu-snap-score">
                              <Trophy size={10} style={{ color: '#F59E0B' }} />
                              <span>{item.score}</span>
                            </div>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="medu-snap-title">{item.title}</h3>

                        {/* Institution & Location */}
                        <p className="medu-snap-inst">
                          <MapPin size={10} style={{ flexShrink: 0 }} />
                          <span>{item.institution}{item.location ? ` · ${item.location}` : ''}</span>
                        </p>

                        {/* Description */}
                        <p className="medu-snap-desc">{item.description}</p>

                        {/* Highlights / Coursework Tags */}
                        {highlights.length > 0 && (
                          <div className="medu-snap-tags">
                            {highlights.map(h => (
                              <span key={h} className="medu-snap-tag">
                                {h}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Action Row */}
                        <div className="medu-snap-actions" onClick={(e) => e.stopPropagation()}>
                          <button
                            className="medu-snap-action-btn"
                            onClick={() => setSelectedItem(item)}
                          >
                            <span>View Breakdown</span>
                            <ChevronRight size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination Dots */}
                <div className="edu-mobile-dots">
                  {timelineData.map((_, i) => (
                    <button
                      key={i}
                      className={`edu-mobile-dot ${i === mobileActiveIdx ? 'active' : ''}`}
                      onClick={() => scrollToMobileStage(i)}
                      aria-label={`Go to stage ${i + 1}`}
                    />
                  ))}
                </div>

                {/* Academic Specialization Bento Hub */}
                <div className="edu-bento-hub">
                  <div className="edu-bento-hub-header">
                    <Trophy size={12} style={{ color: '#F59E0B' }} />
                    <span>Academic Honors &amp; Specialization</span>
                  </div>
                  <div className="edu-bento-grid">
                    <div className="edu-bento-item">
                      <span className="edu-bento-val">8.7 CGPA</span>
                      <span className="edu-bento-label">Top 5% · Convocation Honors</span>
                    </div>
                    <div className="edu-bento-item">
                      <span className="edu-bento-val">Data Science</span>
                      <span className="edu-bento-label">AI, ML &amp; Deep Learning Focus</span>
                    </div>
                  </div>
                </div>
              </div>
            )}


          </>
        )}
      </div>

      {/* ── DETAIL SHEET (Strictly Mobile Only) ── */}
      {isMobile && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isMobile && selectedItem && (() => {
            const itemIndex = timelineData.indexOf(selectedItem);
            const accents = ['#3b82f6', '#eab308', '#10b981', '#8b5cf6'];
            const accent = accents[itemIndex % accents.length];
            const Icon = iconMap[selectedItem.icon_class] || School;
            return (
              <div style={{ position: 'relative', zIndex: 9999 }}>
                <motion.div
                  className="dsheet-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  onClick={() => setSelectedItem(null)}
                />
                <motion.div
                  className="dsheet"
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%', transition: { duration: 0.22, ease: [0.32, 0.72, 0, 1] } }}
                  transition={{ type: 'spring', damping: 30, stiffness: 320, mass: 0.85 }}
                  drag="y"
                  dragControls={dragControls}
                  dragListener={false}
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={{ top: 0, bottom: 0.5 }}
                  onDragEnd={(_, info) => { if (info.offset.y > 100 || info.velocity.y > 500) setSelectedItem(null); }}
                >
                  {/* Dedicated Touch Handle Bar */}
                  <div
                    className="dsheet-handle-bar"
                    onPointerDown={(e) => dragControls.start(e)}
                  >
                    <div className="dsheet-handle" />
                  </div>

                  {/* Header with accent icon (also draggable) */}
                  <div
                    className="dsheet-header"
                    onPointerDown={(e) => {
                      if (!e.target.closest('.dsheet-close')) {
                        dragControls.start(e);
                      }
                    }}
                  >
                    <div className="dsheet-header-left">
                      <div className="dsheet-header-icon" style={{ background: accent + '18', color: accent, border: `1px solid ${accent}30` }}>
                        <Icon size={16} />
                      </div>
                      <div className="dsheet-title">
                        <h3>{selectedItem.title}</h3>
                        <p>{selectedItem.institution}</p>
                      </div>
                    </div>
                    <button
                      className="dsheet-close"
                      onClick={() => setSelectedItem(null)}
                      aria-label="Close details"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  <div
                    className="dsheet-body"
                    ref={sheetContentRef}
                    onScroll={(e) => { if (e.target.scrollTop > 10 && !sheetScrolled) setSheetScrolled(true); }}
                  >
                    <div className="dsheet-content">

                      {/* Ring + Meta Box */}
                      <div style={{ background: "var(--bg-primary)", border: "1px solid var(--border-color)", borderRadius: 14, padding: "10px 12px", display: "flex", gap: 12, alignItems: "center", marginBottom: 2 }}>
                        {selectedItem.progress != null ? (
                          <ScoreRing percent={selectedItem.progress} color={selectedItem.color} size={46} />
                        ) : (
                          <div style={{ width: 46, height: 46, borderRadius: 12, background: selectedItem.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1px solid ${selectedItem.color}30` }}>
                            <Icon size={22} style={{ color: selectedItem.color }} />
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.25 }}>{selectedItem.institution}</div>
                          <div style={{ fontSize: 10, color: "var(--text-secondary)", marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <MapPin size={10} /> {selectedItem.location}
                          </div>
                          <div style={{ fontSize: 10, color: "var(--text-secondary)", marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <School size={10} /> {selectedItem.year}
                          </div>
                        </div>
                      </div>

                      {/* Stats grid */}
                      <div>
                        <SectionLabel>at a glance</SectionLabel>
                        <div className="ps-stats" style={{ gridTemplateColumns: `repeat(${selectedItem.backStats.length}, 1fr)`, gap: 6 }}>
                          {selectedItem.backStats.map(stat => (
                            <div key={stat.label} className="ps-stat" style={{ padding: '7px 6px', alignItems: 'center' }}>
                              <p className="ps-stat-label" style={{ fontSize: 8, textTransform: 'lowercase' }}>{stat.label}</p>
                              <p className="ps-stat-value" style={{ color: selectedItem.color, fontSize: 13.5, marginTop: 1 }}>{stat.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <SectionLabel>about</SectionLabel>
                        <p className="dsheet-desc" style={{ fontSize: 11 }}>{selectedItem.description}</p>
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
