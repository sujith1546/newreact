import React from 'react';
import { motion } from 'framer-motion';

export function EducationArrowFlow({ stages = [], activeIndex = 0, onSelectStage }) {
  const items = stages.length > 0
    ? stages.map((item, i) => ({
        id: item.id ?? i,
        label: item.shortLabel || item.short_label || item.title || `Stage ${i + 1}`,
        year: item.year
          ? item.year.includes(' – ') ? item.year.split(' – ')[1] : item.year
          : null,
        active: activeIndex === i,
      }))
    : [
        { label: 'Primary',      year: '2014', active: activeIndex === 0 },
        { label: 'Secondary',    year: '2018', active: activeIndex === 1 },
        { label: 'Intermediate', year: '2020', active: activeIndex === 2 },
        { label: 'B.Tech (CSE)', year: '2024', active: activeIndex === 3 },
      ];

  const fillPct = items.length > 1
    ? (activeIndex / (items.length - 1)) * 100
    : 0;

  return (
    <div style={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
    }}>
      {/* Year labels row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${items.length}, 1fr)`,
        marginBottom: 6,
      }}>
        {items.map((s, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'center' }}>
            <span style={{
              fontSize: 10,
              fontWeight: s.active ? 700 : 500,
              color: s.active ? 'var(--primary-blue, #3b82f6)' : 'var(--text-muted)',
              letterSpacing: '0.03em',
              transition: 'color 0.25s',
            }}>
              {s.year}
            </span>
          </div>
        ))}
      </div>

      {/* Track + dots row */}
      <div style={{ position: 'relative', height: 20, display: 'flex', alignItems: 'center' }}>
        {/* grey track */}
        <div style={{
          position: 'absolute',
          left: `calc(100% / ${items.length} / 2)`,
          right: `calc(100% / ${items.length} / 2)`,
          height: 2,
          background: 'var(--border-color, #e5e7eb)',
          borderRadius: 2,
        }} />
        {/* blue fill */}
        <div style={{
          position: 'absolute',
          left: `calc(100% / ${items.length} / 2)`,
          width: `calc((100% - 100% / ${items.length}) * ${fillPct / 100})`,
          height: 2,
          background: 'linear-gradient(90deg, #6366f1, #3b82f6)',
          borderRadius: 2,
          transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
        }} />

        {/* dots grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${items.length}, 1fr)`,
          width: '100%',
          position: 'relative',
          zIndex: 1,
        }}>
          {items.map((s, i) => (
            <div
              key={i}
              onClick={() => onSelectStage?.(i)}
              style={{ display: 'flex', justifyContent: 'center', cursor: 'pointer' }}
            >
              <motion.div
                whileTap={{ scale: 0.85 }}
                style={{
                  width: s.active ? 14 : 10,
                  height: s.active ? 14 : 10,
                  borderRadius: '50%',
                  background: s.active
                    ? 'var(--primary-blue, #3b82f6)'
                    : 'var(--bg-secondary, #fff)',
                  border: `2px solid ${s.active ? 'var(--primary-blue, #3b82f6)' : 'var(--border-color, #d1d5db)'}`,
                  boxShadow: s.active ? '0 0 0 4px rgba(59,130,246,0.15)' : 'none',
                  transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Stage labels row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${items.length}, 1fr)`,
        marginTop: 7,
      }}>
        {items.map((s, i) => (
          <div
            key={i}
            onClick={() => onSelectStage?.(i)}
            style={{ display: 'flex', justifyContent: 'center', cursor: 'pointer' }}
          >
            <span style={{
              fontSize: 11,
              fontWeight: s.active ? 700 : 500,
              color: s.active ? 'var(--text-primary)' : 'var(--text-muted)',
              letterSpacing: '-0.01em',
              transition: 'color 0.25s',
              whiteSpace: 'nowrap',
            }}>
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
