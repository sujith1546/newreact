import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import {
  MapPin, Trophy, Laptop, BookOpen, School, X, ChevronRight,
  ChevronLeft, ChevronDown, Loader2, GraduationCap, Award, Calendar,
  RotateCcw, Sparkles, Check, Star, TrendingUp, Zap
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
    score: "10/10 GPA",
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
    score: "92.7% · 927/1000",
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
    score: "8.7 / 10 CGPA",
    progress: 87,
    icon_class: "Laptop",
    theme_color: "#6366f1",
    color: "#6366f1",
    bg_color: "#eff6ff",
    text_color: "#4f46e5",
    highlights: ["CS & Engineering", "DSA & Dev", "AI & ML"],
    back_stats: [
      { label: "CGPA", value: "8.7" },
      { label: "Projects", value: "3+" },
      { label: "Hackathons", value: "2+" }
    ],
    backStats: [
      { label: "CGPA", value: "8.7" },
      { label: "Projects", value: "3+" },
      { label: "Hackathons", value: "2+" }
    ],
    highlight_text: "Actively involved in coding competitions and technical projects.",
    highlight: "Actively involved in coding competitions and technical projects.",
    display_order: 4,
  }
];

// Vertical timeline card component
function TimelineCard({ item, index, isLast, isActive, onSelect }) {
  const Icon = iconMap[item.icon_class] || School;
  const isCurrent = item.id === 'btech' || (item.year && item.year.includes('2026'));
  const themeColor = item.color || item.theme_color || '#6366f1';
  const stats = item.backStats || item.back_stats || [];
  const highlights = Array.isArray(item.highlights)
    ? item.highlights
    : typeof item.highlights === 'string'
      ? item.highlights.split(',').map(h => h.trim())
      : [];

  return (
    <motion.div
      className="edu-timeline-row"
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Left: connector line + dot */}
      <div className="edu-timeline-spine">
        <div
          className={`edu-spine-dot ${isActive ? 'active' : ''}`}
          style={{ '--dot-color': themeColor }}
        >
          <Icon size={14} />
        </div>
        {!isLast && <div className="edu-spine-line" />}
      </div>

      {/* Right: card */}
      <motion.div
        className={`edu-timeline-card ${isActive ? 'active' : ''}`}
        style={{ '--card-accent': themeColor }}
        onClick={() => onSelect(index)}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
      >
        {/* Card header */}
        <div className="edu-tc-header">
          <div className="edu-tc-meta">
            {isCurrent ? (
              <span className="edu-badge-live">
                <span className="edu-live-pulse" />
                Pursuing
              </span>
            ) : (
              <span className="edu-badge-done">
                <Check size={9} />
                Completed
              </span>
            )}
            <span className="edu-badge-year">
              <Calendar size={9} />
              {item.year}
            </span>
          </div>
          <div
            className="edu-tc-icon"
            style={{ background: `${themeColor}18`, borderColor: `${themeColor}30`, color: themeColor }}
          >
            <Icon size={18} />
          </div>
        </div>

        {/* Title */}
        <div className="edu-tc-titles">
          <h3 className="edu-tc-degree">{item.title}</h3>
          <p className="edu-tc-institution">{item.institution}</p>
          <p className="edu-tc-location">
            <MapPin size={10} />
            <span>{item.location}</span>
          </p>
        </div>

        {/* Score banner */}
        {item.score && (
          <div className="edu-tc-score" style={{ '--score-color': themeColor }}>
            <div className="edu-score-left">
              <div className="edu-score-icon" style={{ color: themeColor }}>
                <Award size={13} />
              </div>
              <div>
                <div className="edu-score-label-sm">Academic Performance</div>
                <div className="edu-score-val">{item.score}</div>
              </div>
            </div>
            {item.progress && (
              <div className="edu-progress-pill" style={{ color: themeColor, borderColor: `${themeColor}30`, background: `${themeColor}12` }}>
                <TrendingUp size={10} />
                <span>{item.progress}%</span>
              </div>
            )}
          </div>
        )}

        {/* Description */}
        <p className="edu-tc-desc">{item.description}</p>

        {/* Stats chips */}
        {stats.length > 0 && (
          <div className="edu-tc-stats">
            {stats.map(s => (
              <div key={s.label} className="edu-stat-chip">
                <span className="edu-stat-val">{s.value}</span>
                <span className="edu-stat-lbl">{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Highlight tags */}
        {highlights.length > 0 && (
          <div className="edu-tc-tags">
            {highlights.slice(0, 4).map(h => (
              <span key={h} className="edu-tc-tag">{h}</span>
            ))}
          </div>
        )}

        {/* Hover CTA */}
        <div className="edu-tc-cta">
          <span>View Details</span>
          <ChevronRight size={12} />
        </div>
      </motion.div>
    </motion.div>
  );
}

// Summary header stats
function SummaryBar({ data }) {
  const current = data.find(d => d.id === 'btech');
  return (
    <div className="edu-summary-bar">
      <div className="edu-summary-item">
        <span className="edu-summary-val">{data.length}</span>
        <span className="edu-summary-lbl">Milestones</span>
      </div>
      <div className="edu-summary-divider" />
      <div className="edu-summary-item">
        <span className="edu-summary-val">8.7</span>
        <span className="edu-summary-lbl">Current CGPA</span>
      </div>
      <div className="edu-summary-divider" />
      <div className="edu-summary-item">
        <span className="edu-summary-val">10/10</span>
        <span className="edu-summary-lbl">10th GPA</span>
      </div>
      <div className="edu-summary-divider" />
      <div className="edu-summary-item">
        <span className="edu-summary-val">16+</span>
        <span className="edu-summary-lbl">Years Learning</span>
      </div>
    </div>
  );
}

// Detail sheet for selected item (desktop)
function DetailPanel({ item, onClose }) {
  const Icon = iconMap[item.icon_class] || School;
  const themeColor = item.color || item.theme_color || '#6366f1';
  const stats = item.backStats || item.back_stats || [];
  const highlights = Array.isArray(item.highlights)
    ? item.highlights
    : typeof item.highlights === 'string'
      ? item.highlights.split(',').map(h => h.trim())
      : [];

  return (
    <motion.div
      className="edu-detail-panel"
      initial={{ opacity: 0, x: 24, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 24, scale: 0.98 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      style={{ '--panel-accent': themeColor }}
    >
      {/* Panel header */}
      <div className="edp-header">
        <div className="edp-header-icon" style={{ background: `${themeColor}18`, borderColor: `${themeColor}30`, color: themeColor }}>
          <Icon size={22} />
        </div>
        <div className="edp-header-text">
          <h2 className="edp-title">{item.title}</h2>
          <p className="edp-inst">{item.institution}</p>
        </div>
        <button className="edp-close" onClick={onClose} aria-label="Close">
          <X size={15} />
        </button>
      </div>

      {/* Accent line */}
      <div className="edp-accent-line" style={{ background: `linear-gradient(90deg, ${themeColor}, transparent)` }} />

      {/* Meta row */}
      <div className="edp-meta-row">
        <div className="edp-meta-item">
          <Calendar size={12} />
          <span>{item.year}</span>
        </div>
        <div className="edp-meta-item">
          <MapPin size={12} />
          <span>{item.location}</span>
        </div>
        {item.score && (
          <div className="edp-meta-item" style={{ color: themeColor }}>
            <Award size={12} />
            <span>{item.score}</span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {item.progress && (
        <div className="edp-prog-wrap">
          <div className="edp-prog-label">
            <span>Academic Performance</span>
            <span style={{ color: themeColor, fontWeight: 700 }}>{item.progress}%</span>
          </div>
          <div className="edp-prog-track">
            <motion.div
              className="edp-prog-fill"
              style={{ background: themeColor }}
              initial={{ width: 0 }}
              animate={{ width: `${item.progress}%` }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>
      )}

      {/* Stats */}
      {stats.length > 0 && (
        <div className="edp-section">
          <div className="edp-section-label">At a Glance</div>
          <div className="edp-stats-grid">
            {stats.map(s => (
              <div key={s.label} className="edp-stat-cell" style={{ '--stat-color': themeColor }}>
                <span className="edp-stat-val">{s.value}</span>
                <span className="edp-stat-lbl">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      <div className="edp-section">
        <div className="edp-section-label">About</div>
        <p className="edp-desc">{item.description}</p>
      </div>

      {/* Highlights */}
      {highlights.length > 0 && (
        <div className="edp-section">
          <div className="edp-section-label">Highlights</div>
          <div className="edp-highlights">
            {highlights.map(h => (
              <div key={h} className="edp-highlight-item" style={{ borderColor: `${themeColor}25`, color: themeColor }}>
                <Zap size={10} />
                <span>{h}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key achievement */}
      {(item.highlight || item.highlight_text) && (
        <div className="edp-quote" style={{ borderColor: `${themeColor}30`, background: `${themeColor}08` }}>
          <Sparkles size={13} style={{ color: themeColor, flexShrink: 0 }} />
          <p>{item.highlight || item.highlight_text}</p>
        </div>
      )}
    </motion.div>
  );
}

// Mobile bottom sheet for selected item
function MobileDetailSheet({ item, onClose, dragControls }) {
  const Icon = iconMap[item.icon_class] || School;
  const themeColor = item.color || item.theme_color || '#6366f1';
  const stats = item.backStats || item.back_stats || [];
  const highlights = Array.isArray(item.highlights)
    ? item.highlights
    : typeof item.highlights === 'string'
      ? item.highlights.split(',').map(h => h.trim())
      : [];

  return (
    <>
      <motion.div
        className="edu-sheet-backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        onClick={onClose}
      />
      <motion.div
        className="edu-sheet"
        initial={{ y: '100%' }} animate={{ y: 0 }}
        exit={{ y: '100%', transition: { duration: 0.22, ease: [0.32, 0.72, 0, 1] } }}
        transition={{ type: 'spring', damping: 30, stiffness: 320, mass: 0.85 }}
        drag="y" dragControls={dragControls} dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.5 }}
        onDragEnd={(_, info) => { if (info.offset.y > 100 || info.velocity.y > 500) onClose(); }}
      >
        <div className="edu-sheet-handle-bar" onPointerDown={e => dragControls.start(e)}>
          <div className="edu-sheet-handle" />
        </div>

        <div className="edu-sheet-header" onPointerDown={e => { if (!e.target.closest('.edu-sheet-close')) dragControls.start(e); }}>
          <div className="edu-sheet-header-left">
            <div className="edu-sheet-icon" style={{ background: `${themeColor}18`, borderColor: `${themeColor}30`, color: themeColor }}>
              <Icon size={16} />
            </div>
            <div>
              <h3 className="edu-sheet-title">{item.title}</h3>
              <p className="edu-sheet-inst">{item.institution}</p>
            </div>
          </div>
          <button className="edu-sheet-close" onClick={onClose}><X size={15} /></button>
        </div>

        <div className="edu-sheet-body">
          <div className="edu-sheet-content">

            {/* Meta */}
            <div className="edu-sheet-meta">
              <span className="edu-sheet-meta-item"><Calendar size={11} />{item.year}</span>
              <span className="edu-sheet-meta-item"><MapPin size={11} />{item.location}</span>
            </div>

            {/* Progress */}
            {item.progress && (
              <div className="edu-sheet-prog">
                <div className="edu-sheet-prog-label">
                  <span>Academic Performance</span>
                  <span style={{ color: themeColor }}>{item.progress}%</span>
                </div>
                <div className="edu-sheet-prog-track">
                  <motion.div
                    style={{ height: '100%', background: themeColor, borderRadius: 3 }}
                    initial={{ width: 0 }} animate={{ width: `${item.progress}%` }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                  />
                </div>
              </div>
            )}

            {/* Stats */}
            {stats.length > 0 && (
              <div className="edu-sheet-stats">
                {stats.map(s => (
                  <div key={s.label} className="edu-sheet-stat">
                    <span className="edu-sheet-stat-val" style={{ color: themeColor }}>{s.value}</span>
                    <span className="edu-sheet-stat-lbl">{s.label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Description */}
            <p className="edu-sheet-desc">{item.description}</p>

            {/* Highlights */}
            {highlights.length > 0 && (
              <div className="edu-sheet-tags">
                {highlights.map(h => (
                  <span key={h} className="edu-sheet-tag" style={{ borderColor: `${themeColor}25`, color: themeColor, background: `${themeColor}10` }}>{h}</span>
                ))}
              </div>
            )}

          </div>
        </div>
      </motion.div>
    </>
  );
}

export default function Education() {
  const { data: rawEducation, loading } = useRealtimeData('education', { orderColumn: 'display_order', ascending: true });
  const [timelineData, setTimelineData] = useState(DEFAULT_EDUCATION);
  const [activeIndex, setActiveIndex] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [mobileActiveIdx, setMobileActiveIdx] = useState(0);
  const mobileTrackRef = useRef(null);
  const dragControls = useDragControls();

  useEffect(() => {
    if (rawEducation && rawEducation.length > 0) {
      const mapped = rawEducation.map(d => ({
        ...d,
        shortLabel: d.short_label || d.shortLabel,
        color: d.theme_color || d.color,
        bg: d.bg_color || d.bg,
        textColor: d.text_color || d.textColor,
        backStats: Array.isArray(d.back_stats) ? d.back_stats : (d.backStats || []),
        highlight: d.highlight_text || d.highlight
      }));
      setTimelineData(mapped);
    }
  }, [rawEducation]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 900;
      setIsMobile(mobile);
      if (!mobile) setSelectedItem(null);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile && selectedItem) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const onKey = e => { if (e.key === 'Escape') setSelectedItem(null); };
      window.addEventListener('keydown', onKey);
      return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
    }
  }, [isMobile, selectedItem]);

  const handleMobileScroll = () => {
    const track = mobileTrackRef.current;
    if (!track) return;
    const card = track.querySelector('.medu-card');
    const cardWidth = card ? card.offsetWidth + 12 : track.offsetWidth * 0.85;
    setMobileActiveIdx(Math.min(Math.max(0, Math.round(track.scrollLeft / cardWidth)), timelineData.length - 1));
  };

  const scrollToMobile = idx => {
    const track = mobileTrackRef.current;
    if (!track) return;
    const cards = track.querySelectorAll('.medu-card');
    if (cards[idx]) {
      cards[idx].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
      setMobileActiveIdx(idx);
    }
  };

  const handleCardSelect = idx => {
    setActiveIndex(prev => prev === idx ? null : idx);
    setSelectedItem(timelineData[idx]);
  };

  return (
    <ScrollReveal>
      <style>{`
        /* ═══════════════════════════════════════════
           EDUCATION PAGE — Premium Dark Design
           ═══════════════════════════════════════════ */

        .edu-page {
          width: 100%;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding-bottom: 0;
        }

        /* ── Page header ── */
        .edu-page-header {
          flex-shrink: 0;
        }
        .edu-page-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--primary-blue, #6366f1);
          margin-bottom: 8px;
          padding: 4px 10px;
          border-radius: 999px;
          border: 1px solid rgba(99, 102, 241, 0.25);
          background: rgba(99, 102, 241, 0.08);
        }
        .edu-page-title {
          font-size: clamp(24px, 3.5vw, 36px);
          font-weight: 800;
          color: var(--text-primary);
          margin: 0 0 6px;
          letter-spacing: -0.03em;
          line-height: 1.1;
          font-family: 'Space Grotesk', 'Inter', sans-serif;
        }
        .edu-page-sub {
          font-size: 14px;
          color: var(--text-secondary, #94a3b8);
          margin: 0;
          line-height: 1.6;
        }

        /* ── Summary stats bar ── */
        .edu-summary-bar {
          display: flex;
          align-items: center;
          gap: 0;
          background: var(--card-bg, #1a1f2e);
          border: 1px solid var(--border-color, #2a2f3e);
          border-radius: 14px;
          padding: 14px 20px;
          flex-shrink: 0;
        }
        [data-theme="dark"] .edu-summary-bar {
          background: rgba(255,255,255,0.03);
          border-color: rgba(255,255,255,0.08);
        }
        .edu-summary-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }
        .edu-summary-val {
          font-size: 20px;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.03em;
          font-family: 'Space Grotesk', 'Inter', sans-serif;
        }
        .edu-summary-lbl {
          font-size: 10px;
          font-weight: 600;
          color: var(--text-muted, #64748b);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          white-space: nowrap;
        }
        .edu-summary-divider {
          width: 1px;
          height: 32px;
          background: var(--border-color, #2a2f3e);
          flex-shrink: 0;
          margin: 0 4px;
        }
        [data-theme="dark"] .edu-summary-divider {
          background: rgba(255,255,255,0.08);
        }

        /* ── Main layout: timeline + detail panel ── */
        .edu-main-layout {
          display: flex;
          gap: 20px;
          align-items: flex-start;
        }

        /* ── Vertical timeline ── */
        .edu-timeline-wrap {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .edu-timeline-row {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }

        /* Spine */
        .edu-timeline-spine {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex-shrink: 0;
          width: 36px;
          padding-top: 20px;
        }

        .edu-spine-dot {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid rgba(255,255,255,0.1);
          background: var(--card-bg, #1a1f2e);
          color: var(--text-muted);
          flex-shrink: 0;
          transition: all 0.3s ease;
          position: relative;
          z-index: 1;
        }
        [data-theme="dark"] .edu-spine-dot {
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.09);
        }
        .edu-spine-dot.active {
          background: var(--dot-color);
          border-color: var(--dot-color);
          color: #fff;
          box-shadow: 0 0 0 4px color-mix(in srgb, var(--dot-color) 20%, transparent),
                      0 4px 16px color-mix(in srgb, var(--dot-color) 35%, transparent);
        }

        .edu-spine-line {
          width: 2px;
          flex: 1;
          min-height: 24px;
          background: linear-gradient(to bottom, var(--border-color, #2a2f3e), transparent);
          margin: 6px 0;
        }
        [data-theme="dark"] .edu-spine-line {
          background: linear-gradient(to bottom, rgba(255,255,255,0.09), transparent);
        }

        /* ── Timeline card ── */
        .edu-timeline-card {
          flex: 1;
          min-width: 0;
          background: var(--card-bg, #ffffff);
          border: 1px solid var(--border-color, #e0e0e0);
          border-radius: 16px;
          padding: 18px 20px;
          margin-bottom: 16px;
          cursor: pointer;
          transition: border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
          position: relative;
          overflow: hidden;
        }
        [data-theme="dark"] .edu-timeline-card {
          background: rgba(255,255,255,0.03);
          border-color: rgba(255,255,255,0.08);
        }
        .edu-timeline-card::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
          background: var(--card-accent, #6366f1);
          border-radius: 3px 0 0 3px;
          opacity: 0;
          transition: opacity 0.25s ease;
        }
        .edu-timeline-card:hover,
        .edu-timeline-card.active {
          border-color: var(--card-accent, #6366f1);
          box-shadow: 0 8px 32px color-mix(in srgb, var(--card-accent, #6366f1) 12%, transparent),
                      inset 0 0 0 1px color-mix(in srgb, var(--card-accent, #6366f1) 10%, transparent);
        }
        .edu-timeline-card:hover::before,
        .edu-timeline-card.active::before {
          opacity: 1;
        }

        /* Card header */
        .edu-tc-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
          gap: 10px;
        }
        .edu-tc-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }
        .edu-tc-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: 1px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform 0.2s ease;
        }
        .edu-timeline-card:hover .edu-tc-icon {
          transform: scale(1.08) rotate(-3deg);
        }

        /* Badges */
        .edu-badge-live {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 9.5px;
          font-weight: 700;
          color: #16a34a;
          background: rgba(22,163,74,0.1);
          border: 1px solid rgba(22,163,74,0.25);
          border-radius: 999px;
          padding: 2.5px 8px;
          letter-spacing: 0.03em;
        }
        .edu-live-pulse {
          width: 5px; height: 5px; border-radius: 50%;
          background: #16a34a;
          animation: livePulse 1.8s infinite;
        }
        @keyframes livePulse {
          0% { box-shadow: 0 0 0 0 rgba(22,163,74,0.6); }
          70% { box-shadow: 0 0 0 5px rgba(22,163,74,0); }
          100% { box-shadow: 0 0 0 0 rgba(22,163,74,0); }
        }
        .edu-badge-done {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 9.5px;
          font-weight: 600;
          color: var(--text-muted);
          background: var(--border-color, rgba(0,0,0,0.05));
          border: 1px solid var(--border-color);
          border-radius: 999px;
          padding: 2.5px 8px;
        }
        [data-theme="dark"] .edu-badge-done {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.1);
        }
        .edu-badge-year {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 9.5px;
          font-weight: 600;
          color: var(--text-secondary);
          background: var(--border-color, rgba(0,0,0,0.05));
          border: 1px solid var(--border-color);
          border-radius: 999px;
          padding: 2.5px 8px;
        }
        [data-theme="dark"] .edu-badge-year {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.1);
        }

        /* Titles */
        .edu-tc-titles { margin-bottom: 12px; }
        .edu-tc-degree {
          font-size: 15.5px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 4px;
          letter-spacing: -0.02em;
          line-height: 1.3;
          font-family: 'Space Grotesk', 'Inter', sans-serif;
        }
        .edu-tc-institution {
          font-size: 12.5px;
          font-weight: 600;
          color: var(--text-secondary);
          margin: 0 0 4px;
        }
        .edu-tc-location {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: var(--text-muted);
          margin: 0;
        }

        /* Score */
        .edu-tc-score {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 8px 11px;
          background: color-mix(in srgb, var(--score-color, #6366f1) 5%, var(--border-color, #f0f0f0));
          border: 1px solid color-mix(in srgb, var(--score-color, #6366f1) 15%, var(--border-color, #e0e0e0));
          border-radius: 10px;
          margin-bottom: 10px;
        }
        [data-theme="dark"] .edu-tc-score {
          background: color-mix(in srgb, var(--score-color, #6366f1) 10%, rgba(255,255,255,0.03));
          border-color: color-mix(in srgb, var(--score-color, #6366f1) 20%, rgba(255,255,255,0.08));
        }
        .edu-score-left {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }
        .edu-score-icon {
          width: 26px; height: 26px; border-radius: 7px;
          display: flex; align-items: center; justify-content: center;
          background: color-mix(in srgb, currentColor 12%, transparent);
          flex-shrink: 0;
        }
        .edu-score-label-sm {
          font-size: 8.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: var(--text-muted);
          line-height: 1.1;
        }
        .edu-score-val {
          font-size: 12px;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.25;
          letter-spacing: -0.01em;
        }
        .edu-progress-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 10.5px;
          font-weight: 700;
          border: 1px solid;
          border-radius: 999px;
          padding: 3px 8px;
          white-space: nowrap;
          flex-shrink: 0;
        }

        /* Description */
        .edu-tc-desc {
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0 0 12px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Stats */
        .edu-tc-stats {
          display: flex;
          gap: 8px;
          margin-bottom: 10px;
          flex-wrap: wrap;
        }
        .edu-stat-chip {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 6px 10px;
          background: var(--border-color, rgba(0,0,0,0.04));
          border: 1px solid var(--border-color);
          border-radius: 9px;
          min-width: 44px;
        }
        [data-theme="dark"] .edu-stat-chip {
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.08);
        }
        .edu-stat-val {
          font-size: 13px;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.02em;
          line-height: 1.1;
        }
        .edu-stat-lbl {
          font-size: 8.5px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        /* Tags */
        .edu-tc-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin-bottom: 12px;
        }
        .edu-tc-tag {
          font-size: 10px;
          font-weight: 600;
          padding: 3px 9px;
          border-radius: 999px;
          background: var(--border-color, rgba(0,0,0,0.04));
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          white-space: nowrap;
        }
        [data-theme="dark"] .edu-tc-tag {
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.1);
          color: var(--text-muted);
        }

        /* CTA row */
        .edu-tc-cta {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 4px;
          font-size: 11px;
          font-weight: 600;
          color: var(--card-accent, #6366f1);
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .edu-timeline-card:hover .edu-tc-cta {
          opacity: 1;
        }

        /* ── Detail panel (desktop) ── */
        .edu-detail-panel {
          width: 320px;
          flex-shrink: 0;
          background: var(--card-bg, #ffffff);
          border: 1px solid var(--border-color);
          border-radius: 18px;
          padding: 20px;
          position: sticky;
          top: 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          overflow: hidden;
        }
        [data-theme="dark"] .edu-detail-panel {
          background: rgba(255,255,255,0.03);
          border-color: rgba(255,255,255,0.08);
        }

        .edp-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        .edp-header-icon {
          width: 44px; height: 44px; border-radius: 12px;
          border: 1px solid;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .edp-header-text { flex: 1; min-width: 0; }
        .edp-title {
          font-size: 15px; font-weight: 800;
          color: var(--text-primary);
          margin: 0 0 3px;
          letter-spacing: -0.02em;
          line-height: 1.25;
          font-family: 'Space Grotesk', 'Inter', sans-serif;
        }
        .edp-inst {
          font-size: 11.5px;
          color: var(--text-secondary);
          margin: 0;
        }
        .edp-close {
          width: 28px; height: 28px; border-radius: 50%;
          border: 1px solid var(--border-color);
          background: var(--border-color, rgba(0,0,0,0.05));
          color: var(--text-secondary);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
          flex-shrink: 0;
        }
        [data-theme="dark"] .edp-close {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.1);
        }
        .edp-close:hover {
          background: var(--text-primary);
          color: var(--bg-primary);
          border-color: var(--text-primary);
        }

        .edp-accent-line {
          height: 2px;
          border-radius: 2px;
          margin: -6px 0;
        }

        .edp-meta-row {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .edp-meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          color: var(--text-secondary);
        }
        .edp-meta-item svg { color: var(--text-muted); flex-shrink: 0; }

        .edp-prog-wrap {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .edp-prog-label {
          display: flex;
          justify-content: space-between;
          font-size: 10.5px;
          font-weight: 600;
          color: var(--text-secondary);
        }
        .edp-prog-track {
          height: 5px;
          background: var(--border-color);
          border-radius: 3px;
          overflow: hidden;
        }
        [data-theme="dark"] .edp-prog-track {
          background: rgba(255,255,255,0.08);
        }
        .edp-prog-fill { height: 100%; border-radius: 3px; }

        .edp-section { display: flex; flex-direction: column; gap: 7px; }
        .edp-section-label {
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-muted);
        }
        .edp-desc {
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0;
        }

        .edp-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
        }
        .edp-stat-cell {
          background: var(--border-color, rgba(0,0,0,0.04));
          border: 1px solid var(--border-color);
          border-radius: 10px;
          padding: 8px 6px;
          text-align: center;
          display: flex; flex-direction: column; align-items: center; gap: 2px;
        }
        [data-theme="dark"] .edp-stat-cell {
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.08);
        }
        .edp-stat-val {
          font-size: 15px; font-weight: 800;
          color: var(--stat-color, var(--text-primary));
          letter-spacing: -0.02em;
          line-height: 1.1;
        }
        .edp-stat-lbl {
          font-size: 8px; font-weight: 600;
          color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;
        }

        .edp-highlights { display: flex; flex-direction: column; gap: 5px; }
        .edp-highlight-item {
          display: flex; align-items: center; gap: 7px;
          font-size: 11.5px; font-weight: 600;
          padding: 6px 10px;
          border: 1px solid;
          border-radius: 8px;
          background: color-mix(in srgb, currentColor 6%, transparent);
        }

        .edp-quote {
          display: flex; align-items: flex-start; gap: 8px;
          padding: 10px 12px;
          border: 1px solid;
          border-radius: 10px;
        }
        .edp-quote p {
          font-size: 11.5px;
          font-style: italic;
          color: var(--text-secondary);
          line-height: 1.55;
          margin: 0;
        }

        /* ── Loading / empty ── */
        .edu-loading {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 60px 0;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .edu-loading svg { animation: spin 1s linear infinite; }

        /* ═══════════════════════════════════════════
           MOBILE LAYOUT
           ═══════════════════════════════════════════ */
        @media (max-width: 900px) {
          .edu-main-layout { flex-direction: column; gap: 0; }
          .edu-detail-panel { display: none !important; }
          .edu-summary-bar { padding: 10px 14px; gap: 0; border-radius: 12px; }
          .edu-summary-val { font-size: 16px; }
          .edu-summary-lbl { font-size: 8.5px; letter-spacing: 0.04em; }

          /* Snap carousel */
          .medu-track {
            display: flex;
            gap: 12px;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
            -ms-overflow-style: none;
            scrollbar-width: none;
            padding: 4px 2px 10px;
          }
          .medu-track::-webkit-scrollbar { display: none; }
          .medu-track::after { content: ''; flex: 0 0 4px; }

          .medu-card {
            flex: 0 0 85%;
            min-width: 85%;
            scroll-snap-align: start;
            background: var(--card-bg, #ffffff);
            border: 1.5px solid var(--border-color);
            border-radius: 16px;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            cursor: pointer;
            -webkit-tap-highlight-color: transparent;
            transition: transform 0.15s ease;
          }
          [data-theme="dark"] .medu-card {
            background: rgba(255,255,255,0.03);
            border-color: rgba(255,255,255,0.09);
          }
          .medu-card:active { transform: scale(0.985); }

          .medu-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
          .medu-badges { display: flex; gap: 5px; align-items: center; }
          .medu-year-badge {
            font-size: 9px; font-weight: 700; border-radius: 999px;
            padding: 2px 8px; border: 1.5px solid;
          }
          .medu-score-tag {
            display: inline-flex; align-items: center; gap: 3px;
            font-size: 9px; font-weight: 700;
            background: rgba(234,179,8,0.1); border: 1px solid rgba(234,179,8,0.3);
            color: #ca8a04; border-radius: 999px; padding: 2px 7px;
          }
          [data-theme="dark"] .medu-score-tag { color: #fbbf24; background: rgba(234,179,8,0.15); }

          .medu-icon-box {
            width: 32px; height: 32px; border-radius: 9px; border: 1px solid;
            display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          }
          .medu-degree { font-size: 14px; font-weight: 700; color: var(--text-primary); margin: 0; letter-spacing: -0.015em; }
          .medu-inst { font-size: 11px; color: var(--text-secondary); display: flex; align-items: center; gap: 4px; margin: 0; }
          .medu-desc {
            font-size: 11.5px; color: var(--text-secondary); line-height: 1.5; margin: 0;
            display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
          }
          .medu-tags { display: flex; flex-wrap: wrap; gap: 5px; }
          .medu-tag {
            font-size: 9.5px; font-weight: 500; padding: 2px 8px; border-radius: 999px;
            border: 1px solid var(--border-color); background: var(--border-color, rgba(0,0,0,0.05));
            color: var(--text-muted);
          }
          [data-theme="dark"] .medu-tag { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1); }
          .medu-cta {
            display: flex; align-items: center; justify-content: flex-end;
            gap: 4px; font-size: 10.5px; font-weight: 600; margin-top: auto;
          }

          /* Dots */
          .medu-dots {
            display: flex; align-items: center; justify-content: center;
            gap: 5px; margin: 4px 0 12px;
          }
          .medu-dot {
            width: 5px; height: 5px; border-radius: 50%;
            background: var(--border-color); border: none; padding: 0; cursor: pointer;
            transition: all 0.2s ease;
          }
          .medu-dot.active {
            background: var(--primary-blue, #6366f1);
            width: 14px; border-radius: 3px;
          }

          /* Mobile nav controls */
          .medu-controls {
            display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;
          }
          .medu-heading { font-size: 13px; font-weight: 700; color: var(--text-primary); margin: 0; }
          .medu-nav-row { display: flex; align-items: center; gap: 6px; }
          .medu-counter {
            font-size: 10px; font-weight: 700; color: var(--text-muted);
            background: var(--border-color, rgba(0,0,0,0.05)); border: 1px solid var(--border-color);
            padding: 2px 8px; border-radius: 20px; letter-spacing: 0.03em;
          }
          [data-theme="dark"] .medu-counter { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1); }
          .medu-nav-btn {
            width: 28px; height: 28px; border-radius: 8px;
            border: 1px solid var(--border-color); background: var(--card-bg, #fff);
            color: var(--text-primary); display: flex; align-items: center; justify-content: center;
            cursor: pointer; padding: 0; transition: transform 0.15s;
            -webkit-tap-highlight-color: transparent;
          }
          [data-theme="dark"] .medu-nav-btn { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1); }
          .medu-nav-btn:active { transform: scale(0.9); }
          .medu-nav-btn:disabled { opacity: 0.35; cursor: not-allowed; }

          /* Mobile bottom sheet */
          .edu-sheet-backdrop {
            position: fixed; inset: 0;
            background: rgba(0,0,0,0.6);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            z-index: 10000;
          }
          .edu-sheet {
            position: fixed; bottom: 0; left: 0; right: 0;
            z-index: 10001;
            background: var(--bg-secondary, #ffffff);
            border-top-left-radius: 24px; border-top-right-radius: 24px;
            border-top: 1px solid var(--border-color);
            box-shadow: 0 -16px 48px rgba(0,0,0,0.3);
            display: flex; flex-direction: column;
            max-height: 75dvh;
            touch-action: pan-y;
          }
          [data-theme="dark"] .edu-sheet {
            background: #161b22;
            border-top-color: rgba(255,255,255,0.12);
          }
          .edu-sheet-handle-bar {
            display: flex; justify-content: center; align-items: center;
            padding: 10px 0 6px; cursor: grab; touch-action: none; user-select: none;
          }
          .edu-sheet-handle {
            width: 36px; height: 4px; border-radius: 999px;
            background: var(--border-color); transition: background 0.2s;
          }
          [data-theme="dark"] .edu-sheet-handle { background: rgba(255,255,255,0.2); }
          .edu-sheet-header {
            display: flex; align-items: center; justify-content: space-between;
            padding: 4px 16px 12px;
            border-bottom: 1px solid var(--border-color);
            flex-shrink: 0; cursor: grab; touch-action: none; user-select: none;
          }
          [data-theme="dark"] .edu-sheet-header { border-bottom-color: rgba(255,255,255,0.1); }
          .edu-sheet-header-left { display: flex; align-items: center; gap: 10px; }
          .edu-sheet-icon {
            width: 32px; height: 32px; border-radius: 9px; border: 1px solid;
            display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          }
          .edu-sheet-title { font-size: 13.5px; font-weight: 800; color: var(--text-primary); margin: 0; letter-spacing: -0.015em; }
          .edu-sheet-inst { font-size: 10px; color: var(--text-secondary); margin: 1px 0 0; }
          .edu-sheet-close {
            width: 28px; height: 28px; border-radius: 50%;
            background: var(--border-color, rgba(0,0,0,0.05)); border: 1px solid var(--border-color);
            color: var(--text-secondary);
            display: flex; align-items: center; justify-content: center; cursor: pointer;
          }
          [data-theme="dark"] .edu-sheet-close { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.12); }
          .edu-sheet-body { flex: 1; overflow-y: auto; overscroll-behavior: contain; }
          .edu-sheet-body::-webkit-scrollbar { display: none; }
          .edu-sheet-content { padding: 14px 16px max(24px, env(safe-area-inset-bottom, 24px)); display: flex; flex-direction: column; gap: 12px; }
          .edu-sheet-meta { display: flex; gap: 8px; flex-wrap: wrap; }
          .edu-sheet-meta-item {
            display: inline-flex; align-items: center; gap: 4px;
            font-size: 11px; color: var(--text-secondary);
            background: var(--border-color, rgba(0,0,0,0.05)); border: 1px solid var(--border-color);
            padding: 3px 9px; border-radius: 999px;
          }
          [data-theme="dark"] .edu-sheet-meta-item { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1); }
          .edu-sheet-prog { display: flex; flex-direction: column; gap: 5px; }
          .edu-sheet-prog-label { display: flex; justify-content: space-between; font-size: 10.5px; font-weight: 600; color: var(--text-secondary); }
          .edu-sheet-prog-track { height: 5px; background: var(--border-color); border-radius: 3px; overflow: hidden; }
          [data-theme="dark"] .edu-sheet-prog-track { background: rgba(255,255,255,0.08); }
          .edu-sheet-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
          .edu-sheet-stat {
            background: var(--border-color, rgba(0,0,0,0.04)); border: 1px solid var(--border-color);
            border-radius: 10px; padding: 8px 4px; text-align: center;
            display: flex; flex-direction: column; align-items: center; gap: 2px;
          }
          [data-theme="dark"] .edu-sheet-stat { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.08); }
          .edu-sheet-stat-val { font-size: 14px; font-weight: 800; letter-spacing: -0.02em; }
          .edu-sheet-stat-lbl { font-size: 8.5px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; }
          .edu-sheet-desc { font-size: 11.5px; color: var(--text-secondary); line-height: 1.55; margin: 0; }
          .edu-sheet-tags { display: flex; flex-wrap: wrap; gap: 5px; }
          .edu-sheet-tag { font-size: 10px; font-weight: 600; padding: 3px 10px; border-radius: 999px; border: 1px solid; }
        }

        @media (min-width: 901px) {
          .edu-mobile-only { display: none !important; }
        }
        @media (max-width: 900px) {
          .edu-desktop-only { display: none !important; }
          .edu-timeline-wrap { display: none !important; }
          .edu-summary-bar { margin-bottom: 16px; }
        }
      `}</style>

      <div className="edu-page">

        {/* Page header — desktop only */}
        <div className="edu-page-header edu-desktop-only">
          <RollingText text="EDUCATION" speed={0.06} duration={3} />
          <p className="edu-page-sub" style={{ marginTop: 8 }}>Academic background & lifelong learning journey</p>
        </div>

        {/* Mobile header */}
        <div className="edu-mobile-only" style={{ marginBottom: 4 }}>
          <div className="edu-page-eyebrow">
            <GraduationCap size={11} />
            Academic Journey
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0 6px', letterSpacing: '-0.025em' }}>
            Education & Milestones
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
            Swipe to explore degrees, honors & academic highlights.
          </p>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="edu-loading">
            <Loader2 size={32} color="var(--primary-blue)" />
          </div>
        ) : timelineData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            No education entries found.
          </div>
        ) : (
          <>
            {/* Summary Stats Bar */}
            <SummaryBar data={timelineData} />

            {/* ── DESKTOP: timeline + detail panel ── */}
            <div className="edu-main-layout edu-desktop-only">
              {/* Left: vertical timeline */}
              <div className="edu-timeline-wrap">
                {timelineData.map((item, index) => (
                  <TimelineCard
                    key={item.id || index}
                    item={item}
                    index={index}
                    isLast={index === timelineData.length - 1}
                    isActive={activeIndex === index}
                    onSelect={idx => {
                      setActiveIndex(prev => prev === idx ? null : idx);
                      setSelectedItem(prev => prev?.id === item.id ? null : item);
                    }}
                  />
                ))}
              </div>

              {/* Right: sticky detail panel */}
              <AnimatePresence mode="wait">
                {selectedItem && (
                  <DetailPanel
                    key={selectedItem.id}
                    item={selectedItem}
                    onClose={() => { setSelectedItem(null); setActiveIndex(null); }}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* ── MOBILE: horizontal snap carousel ── */}
            <div className="edu-mobile-only">
              <div className="medu-controls">
                <h2 className="medu-heading">Academic Timeline</h2>
                <div className="medu-nav-row">
                  <span className="medu-counter">{mobileActiveIdx + 1} / {timelineData.length}</span>
                  <button className="medu-nav-btn" onClick={() => scrollToMobile(Math.max(0, mobileActiveIdx - 1))} disabled={mobileActiveIdx === 0} aria-label="Previous">
                    <ChevronLeft size={14} />
                  </button>
                  <button className="medu-nav-btn" onClick={() => scrollToMobile(Math.min(timelineData.length - 1, mobileActiveIdx + 1))} disabled={mobileActiveIdx === timelineData.length - 1} aria-label="Next">
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              <div className="medu-track" ref={mobileTrackRef} onScroll={handleMobileScroll}>
                {timelineData.map((item, index) => {
                  const Icon = iconMap[item.icon_class] || School;
                  const themeColor = item.color || item.theme_color || '#6366f1';
                  const isCurrent = item.id === 'btech' || (item.year && item.year.includes('2026'));
                  const highlights = Array.isArray(item.highlights)
                    ? item.highlights.slice(0, 4)
                    : typeof item.highlights === 'string'
                      ? item.highlights.split(',').slice(0, 4).map(h => h.trim())
                      : [];

                  return (
                    <div key={item.id || index} className="medu-card" onClick={() => setSelectedItem(item)}>
                      <div className="medu-top">
                        <div className="medu-badges">
                          {isCurrent ? (
                            <span className="edu-badge-live"><span className="edu-live-pulse" />Pursuing</span>
                          ) : (
                            <span className="edu-badge-done"><Check size={9} />Done</span>
                          )}
                          {item.score && (
                            <span className="medu-score-tag">
                              <Trophy size={9} style={{ color: '#f59e0b' }} />
                              {item.score}
                            </span>
                          )}
                        </div>
                        <div className="medu-icon-box" style={{ background: `${themeColor}15`, borderColor: `${themeColor}30`, color: themeColor }}>
                          <Icon size={16} />
                        </div>
                      </div>
                      <h3 className="medu-degree">{item.title}</h3>
                      <p className="medu-inst">
                        <MapPin size={10} style={{ flexShrink: 0 }} />
                        {item.institution}{item.location ? ` · ${item.location}` : ''}
                      </p>
                      <p className="medu-desc">{item.description}</p>
                      {highlights.length > 0 && (
                        <div className="medu-tags">
                          {highlights.map(h => <span key={h} className="medu-tag">{h}</span>)}
                        </div>
                      )}
                      <div className="medu-cta" style={{ color: themeColor }}>
                        <span>View Details</span>
                        <ChevronRight size={11} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="medu-dots">
                {timelineData.map((_, i) => (
                  <button key={i} className={`medu-dot ${i === mobileActiveIdx ? 'active' : ''}`} onClick={() => scrollToMobile(i)} aria-label={`Go to ${i + 1}`} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Mobile Bottom Sheet ── */}
      {isMobile && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isMobile && selectedItem && (
            <MobileDetailSheet
              key={selectedItem.id}
              item={selectedItem}
              onClose={() => setSelectedItem(null)}
              dragControls={dragControls}
            />
          )}
        </AnimatePresence>,
        document.body
      )}
    </ScrollReveal>
  );
}
