import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useLongPress } from '../../../hooks/useLongPress';

const projectAccents = ['#007bff', '#8b5cf6', '#16a34a'];

export default function MobileProjectRow({ project, index, onTap, onLongPress }) {
  const accent = projectAccents[index % projectAccents.length];
  const initials = project.title.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  
  const longPressProps = useLongPress({
    onLongPress: () => onLongPress(project),
    onClick: () => onTap(project)
  });

  return (
    <motion.button
      className="mpj-row"
      {...longPressProps}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
      whileTap={{ scale: 0.97 }}
    >
      <div className="mpj-stripe" style={{ background: accent }} />
      <div className="mpj-icon" style={{ background: accent + '18', color: accent, borderColor: accent + '30' }}>
        {initials}
      </div>
      <div className="mpj-body">
        <div className="mpj-title-row">
          <h3 className="mpj-title">{project.title}</h3>
          {project.liveUrl && (
            <div className="live-badge">
              <span className="live-dot"><span className="live-ping" /><span className="live-dot-core" /></span>
              <span className="live-text">Live</span>
            </div>
          )}
        </div>
        <p className="mpj-desc">{project.description?.slice(0, 88)}…</p>
        <div className="mpj-tags">
          {project.tags.slice(0, 3).map(t => (
            <span key={t} className="mpj-tag" style={{ color: accent, borderColor: accent + '28', background: accent + '10' }}>{t}</span>
          ))}
          {project.tags.length > 3 && (
            <span className="mpj-tag" style={{ color: accent, borderColor: accent + '28', background: accent + '10' }}>+{project.tags.length - 3}</span>
          )}
        </div>
      </div>
      <ChevronRight size={15} className="mpj-chevron" />
    </motion.button>
  );
}
