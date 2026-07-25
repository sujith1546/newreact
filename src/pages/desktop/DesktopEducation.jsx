import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Trophy, Laptop, BookOpen, School, X, Hand, Loader2 } from 'lucide-react';
import ScrollReveal from '../../components/ScrollReveal';
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

  return (
    <motion.div className="edu-flip-card" variants={cardVariants}>
      <div className={`edu-flip-card-inner ${isFlipped ? "flipped" : ""}`}>
        <div 
          className={`edu-flip-card-front edu-card ${isActive ? 'active-card' : ''}`} 
          onClick={() => onCardClick(index)}
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
            onClick={(e) => { e.stopPropagation(); onFlip(index); }} 
            style={{ cursor: 'pointer' }}
          >
            <Hand size={12} /> Tap for details
          </div>
        </div>

        <div className="edu-flip-card-back" onClick={(e) => { e.stopPropagation(); onClose(); }} style={{ cursor: 'pointer' }}>
          <div className="back-header">
            <p>{item.title}</p>
            <X size={16} onClick={(e) => { e.stopPropagation(); onClose(); }} style={{ cursor: 'pointer' }} />
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

        .edu-card.active-card {
          border-color: var(--primary-blue);
          box-shadow: 0 12px 30px -10px rgba(0,0,0,0.08);
          transform: translateY(-4px);
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
          margin: 0;
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
        )}
      </div>
    </ScrollReveal>
  );
}
