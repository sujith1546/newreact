import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Trophy, Laptop, BookOpen, School, X, ChevronRight, ChevronDown } from 'lucide-react';
import useRealtimeData from '../../../hooks/useRealtimeData';

const iconMap = {
  'School': School,
  'Trophy': Trophy,
  'BookOpen': BookOpen,
  'Laptop': Laptop
};

const accents = ['#3b82f6', '#eab308', '#10b981', '#8b5cf6'];

export default function MobileEducationView() {
  const { data: rawEducation, loading } = useRealtimeData('education', { orderColumn: 'display_order', ascending: true });
  const [selectedItem, setSelectedItem] = useState(null);
  const [sheetScrolled, setSheetScrolled] = useState(false);
  const [sheetScrollable, setSheetScrollable] = useState(false);
  const sheetContentRef = useRef(null);

  const timelineData = (rawEducation || []).map(d => ({
    ...d,
    shortLabel: d.short_label,
    color: d.theme_color || '#3b82f6',
    bg: d.bg_color || 'rgba(59, 130, 246, 0.1)',
    textColor: d.text_color || '#3b82f6',
    backStats: d.back_stats || [],
    highlight: d.highlight_text
  }));

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

  return (
    <div className="mobile-education-view" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <style>{`
        .medu-feed {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
        }

        .medu-card {
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px 14px 12px 16px;
          background: var(--bg-secondary, #ffffff);
          border: 1px solid var(--border-color, rgba(0,0,0,0.08));
          border-radius: 16px;
          width: 100%;
          text-align: left;
          cursor: pointer;
          transition: transform 0.15s ease, background 0.15s ease;
          outline: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
        }
        .medu-card:active {
          transform: scale(0.98);
          background: var(--bg-primary, #f9fafb);
        }

        .medu-stripe {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          border-radius: 16px 0 0 16px;
        }

        .medu-icon-wrap {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: 1px solid;
        }

        .medu-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .medu-title-row {
          display: flex;
          align-items: center;
          gap: 6px;
          justify-content: space-between;
        }
        .medu-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
          line-height: 1.25;
        }
        .medu-year {
          font-size: 10px;
          font-weight: 600;
          color: var(--text-muted);
          background: rgba(0,0,0,0.04);
          padding: 2px 6px;
          border-radius: 6px;
        }
        .medu-inst {
          font-size: 11px;
          font-weight: 600;
          margin: 0;
        }
        .medu-desc {
          font-size: 11px;
          color: var(--text-secondary);
          margin: 2px 0 0;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .medu-chevron {
          color: var(--text-muted);
          flex-shrink: 0;
          margin-top: 4px;
        }

        /* DETAIL SHEET */
        .dsheet-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.65);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 10000;
        }
        .dsheet {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 10001;
          background: var(--bg-secondary, #ffffff);
          border-top-left-radius: 28px;
          border-top-right-radius: 28px;
          box-shadow: 0 -20px 60px rgba(0,0,0,0.25);
          display: flex;
          flex-direction: column;
          max-height: 86vh;
        }
        .dsheet-handle {
          width: 36px;
          height: 4px;
          border-radius: 2px;
          background: var(--border-color, #e5e7eb);
          margin: 12px auto 0;
          flex-shrink: 0;
        }
        .dsheet-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px 12px;
          border-bottom: 1px solid var(--border-color, rgba(0,0,0,0.08));
          flex-shrink: 0;
        }
        .dsheet-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }
        .dsheet-header-icon {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .dsheet-title h3 {
          font-size: 15px;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0 0 2px;
          line-height: 1.2;
        }
        .dsheet-title p {
          font-size: 11px;
          font-weight: 700;
          color: var(--primary-blue);
          margin: 0;
        }
        .dsheet-close {
          width: 28px;
          height: 28px;
          border-radius: 14px;
          background: var(--bg-primary, #f3f4f6);
          border: 1px solid var(--border-color, rgba(0,0,0,0.08));
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          cursor: pointer;
          flex-shrink: 0;
        }
        .dsheet-body {
          flex: 1;
          overflow-y: auto;
          padding: 16px 18px 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .dsheet-section-label {
          font-size: 10px;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 6px;
        }
        .dsheet-desc {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.55;
          margin: 0;
        }
        .edu-detail-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .edu-detail-tag {
          font-size: 11px;
          font-weight: 600;
          padding: 5px 12px;
          border-radius: 999px;
        }
        .ps-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }
        .ps-stat {
          background: var(--bg-primary, #f9fafb);
          border: 1px solid var(--border-color, rgba(0,0,0,0.08));
          border-radius: 12px;
          padding: 10px 8px;
          text-align: center;
        }
        .ps-stat-label {
          font-size: 9px;
          color: var(--text-muted);
          text-transform: uppercase;
          margin: 0;
        }
        .ps-stat-value {
          font-size: 15px;
          font-weight: 800;
          margin: 3px 0 0;
        }

        [data-theme="dark"] .medu-card {
          background: #1f2937;
          border-color: rgba(255,255,255,0.08);
        }
        [data-theme="dark"] .dsheet {
          background: #111827;
        }
        [data-theme="dark"] .ps-stat {
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.08);
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 4 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 2px' }}>
          Education & Academic
        </h2>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
          Milestones, degrees, and academic performance
        </p>
      </div>

      {/* List Feed */}
      <div className="medu-feed">
        {timelineData.map((item, index) => {
          const accent = accents[index % accents.length];
          const Icon = iconMap[item.icon_class] || School;

          return (
            <button
              key={item.id || index}
              className="medu-card"
              onClick={() => setSelectedItem(item)}
            >
              <div className="medu-stripe" style={{ background: accent }} />
              <div className="medu-icon-wrap" style={{ background: accent + '18', color: accent, borderColor: accent + '30' }}>
                <Icon size={18} />
              </div>
              <div className="medu-info">
                <div className="medu-title-row">
                  <h3 className="medu-title">{item.title}</h3>
                  <span className="medu-year">{item.year}</span>
                </div>
                <p className="medu-inst" style={{ color: accent }}>{item.institution}</p>
                <p className="medu-desc">{item.description}</p>
              </div>
              <ChevronRight size={16} className="medu-chevron" />
            </button>
          );
        })}
      </div>

      {/* Detail Sheet */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedItem && (() => {
            const itemIndex = timelineData.indexOf(selectedItem);
            const accent = accents[itemIndex % accents.length];
            const Icon = iconMap[selectedItem.icon_class] || School;

            return (
              <div style={{ position: 'relative', zIndex: 10000 }}>
                <motion.div
                  className="dsheet-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedItem(null)}
                />
                <motion.div
                  className="dsheet"
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 32, stiffness: 350, mass: 0.9 }}
                >
                  <div className="dsheet-handle" />

                  <div className="dsheet-header">
                    <div className="dsheet-header-left">
                      <div className="dsheet-header-icon" style={{ background: accent + '18', color: accent, border: `1px solid ${accent}30` }}>
                        <Icon size={20} />
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

                  <div className="dsheet-body" ref={sheetContentRef}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'var(--bg-primary, #f9fafb)', padding: '12px 14px', borderRadius: 14, border: '1px solid var(--border-color)' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={11} /> {selectedItem.location}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <School size={11} /> {selectedItem.year}
                        </div>
                      </div>
                      {selectedItem.score && (
                        <div style={{ background: accent + '20', color: accent, padding: '6px 12px', borderRadius: 999, fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Trophy size={13} /> {selectedItem.score}
                        </div>
                      )}
                    </div>

                    {selectedItem.backStats && selectedItem.backStats.length > 0 && (
                      <div>
                        <div className="dsheet-section-label">at a glance</div>
                        <div className="ps-stats" style={{ gridTemplateColumns: `repeat(${selectedItem.backStats.length}, 1fr)` }}>
                          {selectedItem.backStats.map(stat => (
                            <div key={stat.label} className="ps-stat">
                              <p className="ps-stat-label">{stat.label}</p>
                              <p className="ps-stat-value" style={{ color: accent }}>{stat.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="dsheet-section-label">about</div>
                      <p className="dsheet-desc">{selectedItem.description}</p>
                    </div>

                    {selectedItem.highlights && selectedItem.highlights.length > 0 && (
                      <div>
                        <div className="dsheet-section-label">highlights</div>
                        <div className="edu-detail-tags">
                          {selectedItem.highlights.map(h => (
                            <span key={h} className="edu-detail-tag" style={{ color: accent, background: accent + '15', border: `1px solid ${accent}30` }}>
                              {h}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            );
          })()}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
