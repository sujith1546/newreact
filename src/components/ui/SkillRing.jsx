// src/components/ui/SkillRing.jsx
// Circular progress ring for an individual skill in the mobile category sheet.
// Displays mastery percentage, animated stroke, skill name, and level badge.

import { memo } from 'react';
import { motion } from 'framer-motion';
import { levelFromPercent, LEVEL_COLORS } from '../../utils/skillsUtils';

function SkillRing({
  skill,
  color = '#3b82f6',
  size = 76,
  strokeWidth = 6,
  onClick,
  prefersReducedMotion = false,
}) {
  if (!skill) return null;

  const pct = Math.min(Math.max(Number(skill.percent) || 0, 0), 100);
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  const levelName = levelFromPercent(pct);
  const levelStyle = LEVEL_COLORS[levelName] || LEVEL_COLORS.Intermediate;

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(skill);
    }
  };

  return (
    <motion.div
      role="button"
      tabIndex={0}
      aria-label={`${skill.name}, ${pct}% proficiency, level ${levelName}`}
      onClick={() => onClick?.(skill)}
      onKeyDown={handleKeyDown}
      whileHover={{ y: -3, scale: 1.03 }}
      whileTap={{ scale: 0.95 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        cursor: 'pointer',
        userSelect: 'none',
        outline: 'none',
        padding: '12px 10px',
        borderRadius: '18px',
        backgroundColor: 'var(--bg-secondary, #18181b)',
        border: '1px solid var(--border-color, #27272a)',
        minWidth: '108px',
        maxWidth: '118px',
        boxSizing: 'border-box',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        flexShrink: 0,
      }}
    >
      {/* Circular Progress Ring */}
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: 'rotate(-90deg)', display: 'block' }}
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--border-color, rgba(255,255,255,0.1))"
            strokeWidth={strokeWidth}
          />
          {/* Animated fill */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: prefersReducedMotion ? strokeDashoffset : circumference }}
            animate={{ strokeDashoffset }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.9,
              ease: [0.16, 1, 0.3, 1],
              delay: prefersReducedMotion ? 0 : 0.15,
            }}
            style={{
              filter: `drop-shadow(0 0 4px ${color}80)`,
            }}
          />
        </svg>

        {/* Center Percentage */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              fontSize: '15px',
              fontWeight: 800,
              color: 'var(--text-primary, #ffffff)',
              lineHeight: 1,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {pct}%
          </span>
        </div>
      </div>

      {/* Skill Name */}
      <span
        title={skill.name}
        style={{
          marginTop: '10px',
          fontSize: '12.5px',
          fontWeight: 700,
          color: 'var(--text-primary, #ffffff)',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          width: '100%',
          display: 'block',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {skill.name}
      </span>

      {/* Proficiency Level Badge */}
      <span
        style={{
          marginTop: '6px',
          fontSize: '10.5px',
          fontWeight: 700,
          padding: '2px 8px',
          borderRadius: '999px',
          color: levelStyle.text,
          backgroundColor: levelStyle.bg,
          border: `1px solid ${levelStyle.border}`,
          whiteSpace: 'nowrap',
          fontFamily: "'Inter', sans-serif",
          letterSpacing: '0.02em',
        }}
      >
        {levelName}
      </span>
    </motion.div>
  );
}

export default memo(SkillRing);
