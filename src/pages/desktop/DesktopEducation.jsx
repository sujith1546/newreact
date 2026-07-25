import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Trophy, Laptop, BookOpen, School, X, Hand, Loader2 } from 'lucide-react';
import ScrollReveal from '../../components/ScrollReveal';
import { EducationArrowFlow } from '../../components/EducationArrowFlow';
import useRealtimeData from '../../hooks/useRealtimeData';

const iconMap = {
  'School': School,
  'Trophy': Trophy,
  'BookOpen': BookOpen,
  'Laptop': Laptop
};

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
            {item.highlights && item.highlights.map((h) => (
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
            {item.backStats && item.backStats.map(stat => (
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

export default function DesktopEducation() {
  const { data: rawEducation, loading } = useRealtimeData('education', { orderColumn: 'display_order', ascending: true });
  const [timelineData, setTimelineData] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [flippedIndex, setFlippedIndex] = useState(null);

  useEffect(() => {
    if (rawEducation && rawEducation.length > 0) {
      const mapped = rawEducation.map(d => ({
        ...d,
        shortLabel: d.short_label,
        color: d.theme_color,
        bg: d.bg_color,
        textColor: d.text_color,
        backStats: d.back_stats,
        highlight: d.highlight_text
      }));
      setTimelineData(mapped);
    } else if (rawEducation) {
      setTimelineData([]);
    }
  }, [rawEducation]);

  const handleCardClick = (idx) => {
    setActiveIndex(idx);
    if (flippedIndex !== null && flippedIndex !== idx) {
      setFlippedIndex(null);
    }
  };

  const handleFlip = (idx) => {
    setActiveIndex(idx);
    setFlippedIndex(idx);
  };

  const getLineWidth = () => {
    if (timelineData.length <= 1) return '0%';
    const pct = (activeIndex / (timelineData.length - 1)) * 75; // 75% spans from first to last dot
    return `${pct}%`;
  };

  return (
    <ScrollReveal>
      <style>{`
        .edu-page {
          width: 100%;
          height: 100%;
          min-height: calc(100vh - 120px);
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

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
          top: 10px;
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

        .edu-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          flex: 1;
          align-content: flex-start;
          width: 100%;
          min-width: 0;
        }

        .edu-flip-card {
          perspective: 1200px;
          height: 380px;
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

        .tap-hint {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 10.5px;
          color: #9ca3af;
          border-top: 1px dashed rgba(0,0,0,0.08);
          padding-top: 12px;
          margin-top: auto;
        }
        [data-theme="dark"] .tap-hint { border-top-color: rgba(255,255,255,0.08); }

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
      `}</style>

      <div className="edu-page">
        <div className="edu-header">
          <h1>Education Journey</h1>
          <p>Academic milestones, specializations, and achievements</p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <Loader2 className="spin" size={32} color="var(--primary-blue)" />
          </div>
        ) : (
          <>
            {/* Top Interactive Progress Rail */}
            <div className="edu-rail">
              <div className="edu-rail-line-container">
                <div className="edu-rail-line-active" style={{ width: getLineWidth() }} />
              </div>
              <div className="edu-rail-dots">
                {timelineData.map((item, idx) => {
                  const isActive = idx === activeIndex;
                  return (
                    <div key={item.id} className="edu-rail-dot-wrap">
                      <div className="edu-rail-dot-tooltip">
                        <strong>{item.title}</strong><br />
                        <span style={{ fontSize: 10, opacity: 0.8 }}>{item.institution}</span>
                      </div>
                      <button
                        className={`edu-rail-dot ${isActive ? 'active' : ''}`}
                        onClick={() => handleCardClick(idx)}
                        aria-label={`Go to ${item.title}`}
                      />
                      <span
                        className={`edu-rail-dot-label ${isActive ? 'active' : ''}`}
                        onClick={() => handleCardClick(idx)}
                      >
                        {item.year}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4-Card 3D Flip Grid */}
            <motion.div className="edu-grid" variants={containerVariants} initial="hidden" animate="visible">
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

            {/* Closing Summary Arrow Flow */}
            <div className="edu-closing-summary" style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <p className="section-subtitle" style={{ color: '#6b7280', fontSize: '13px', marginBottom: '8px', textAlign: 'center', fontWeight: 'normal' }}>Your journey at a glance</p>
              <EducationArrowFlow activeIndex={activeIndex} />
            </div>
          </>
        )}
      </div>
    </ScrollReveal>
  );
}
