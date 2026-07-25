import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

export default function EducationTimelineCard({ item, index, isExpanded, onToggle }) {
  return (
    <motion.div
      className={`edu-card ${isExpanded ? 'expanded' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <div className="edu-card-header" onClick={onToggle} style={{ cursor: 'pointer' }}>
        <div className="edu-icon-badge" style={{ background: item.bg_color || 'rgba(59,130,246,0.1)', color: item.theme_color || '#3b82f6' }}>
          <i className={`ti ti-${item.icon_class || 'book'}`} style={{ fontSize: 18 }} />
        </div>

        <div className="edu-header-main" style={{ flex: 1 }}>
          <div className="edu-title-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <h3 className="edu-title" style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{item.title}</h3>
            <span className="edu-year-tag" style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>{item.year}</span>
          </div>
          <p className="edu-institution" style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>{item.institution} • {item.location}</p>
        </div>

        <ChevronRight size={18} className={`edu-chevron ${isExpanded ? 'rotated' : ''}`} style={{ transition: 'transform 0.3s ease', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }} />
      </div>

      {isExpanded && (
        <motion.div
          className="edu-card-details"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          style={{ paddingTop: 16, marginTop: 16, borderTop: '1px solid var(--border-color)' }}
        >
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 12px' }}>{item.description}</p>
          {Array.isArray(item.highlights) && item.highlights.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {item.highlights.map((h, i) => (
                <span key={i} style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 6, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>{h}</span>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
