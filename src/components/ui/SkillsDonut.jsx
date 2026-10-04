// src/components/ui/SkillsDonut.jsx
// Screen 1: One continuous SVG donut chart (full 360°, clockwise, from -90°).
// Precision radial wedge gaps, luxury instrument badge callouts, soft glow,
// dynamic responsive center info, and accessible category list.

import { useState, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { CAT_COLORS, categoryAvg, largestRemainder } from '../../utils/skillsUtils';
import { categoryIconMap, fallbackIcon } from './skillIcons';

/** Generate SVG arc path on a circle of radius r centered at (cx, cy) */
function describeArc(cx, cy, r, startAngle, endAngle) {
  const diff = endAngle - startAngle;
  // If a single slice covers nearly all 360 degrees
  if (diff >= 2 * Math.PI - 0.001) {
    return `M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy} A ${r} ${r} 0 1 1 ${cx - r} ${cy}`;
  }
  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy + r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy + r * Math.sin(endAngle);
  const largeArcFlag = diff > Math.PI ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
}

function SkillsDonut({
  categories = [],
  onSelectCategory,
  selectedCategoryId = null,
  prefersReducedMotion = false,
}) {
  const [hoveredCategoryId, setHoveredCategoryId] = useState(null);

  // SVG Geometry constants - proportioned for mobile viewports
  const SIZE = 290;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const RADIUS = 82;
  const STROKE_WIDTH = 22;
  const R_IN = RADIUS - STROKE_WIDTH / 2; // 71px
  const R_OUT = RADIUS + STROKE_WIDTH / 2; // 93px
  const R_BADGE = 114; // 21px clearance from R_OUT to badge center

  // Gap angle for 2.5px radial wedge separation between slices
  const GAP_RAD = 2.5 / RADIUS; // ~0.0305 rad (1.75 degrees)
  const HALF_GAP = GAP_RAD / 2;

  // Compute category averages, shares, and angle layout
  const { slices, totalSkills, overallAvg } = useMemo(() => {
    if (!categories.length) {
      return { slices: [], totalSkills: 0, overallAvg: 0 };
    }

    const avgs = categories.map((cat) => Math.max(categoryAvg(cat.skills), 1));
    const shares = largestRemainder(avgs);

    let runningAngle = -Math.PI / 2; // -90 deg (top, 12 o'clock)
    let totalSkillCount = 0;
    let totalProficiencySum = 0;

    const sliceData = categories.map((cat, idx) => {
      const share = shares[idx] || 0;
      const avg = categoryAvg(cat.skills);
      const angleSpan = (share / 100) * 2 * Math.PI;
      const nominalStart = runningAngle;
      const nominalEnd = runningAngle + angleSpan;
      const midAngle = nominalStart + angleSpan / 2;
      runningAngle = nominalEnd;

      const skillCount = cat.skills?.length || 0;
      totalSkillCount += skillCount;
      totalProficiencySum += cat.skills.reduce((sum, s) => sum + (Number(s.percent) || 0), 0);

      const color = CAT_COLORS[cat.id] || '#3b82f6';

      // Trim slice start and end by HALF_GAP so the radial separator is a clean 2.5px wedge
      const arcStart = angleSpan > GAP_RAD ? nominalStart + HALF_GAP : nominalStart;
      const arcEnd = angleSpan > GAP_RAD ? nominalEnd - HALF_GAP : nominalEnd;
      const pathD = describeArc(CX, CY, RADIUS, arcStart, arcEnd);
      const arcLength = RADIUS * (arcEnd - arcStart);

      // Icon badge position outside slice mid-angle
      const badgeX = CX + R_BADGE * Math.cos(midAngle);
      const badgeY = CY + R_BADGE * Math.sin(midAngle);

      // Subtle connector tick from slice outer edge to badge
      const tickX1 = CX + (R_OUT + 1) * Math.cos(midAngle);
      const tickY1 = CY + (R_OUT + 1) * Math.sin(midAngle);
      const tickX2 = CX + (R_BADGE - 13) * Math.cos(midAngle);
      const tickY2 = CY + (R_BADGE - 13) * Math.sin(midAngle);

      // Push-out vector for active/hovered state (5px along midAngle)
      const pushX = Math.cos(midAngle) * 5;
      const pushY = Math.sin(midAngle) * 5;

      return {
        ...cat,
        idx,
        avg,
        share,
        color,
        midAngle,
        pathD,
        arcLength,
        tick: { x1: tickX1, y1: tickY1, x2: tickX2, y2: tickY2 },
        badge: { x: badgeX, y: badgeY },
        push: { x: pushX, y: pushY },
      };
    });

    const overall = totalSkillCount > 0 ? Math.round(totalProficiencySum / totalSkillCount) : 0;
    return { slices: sliceData, totalSkills: totalSkillCount, overallAvg: overall };
  }, [categories, CX, CY, RADIUS, R_OUT, R_BADGE, GAP_RAD, HALF_GAP]);

  // Active slice currently highlighted (hovered takes precedence, then selected)
  const activeSlice = useMemo(() => {
    if (hoveredCategoryId) {
      return slices.find((s) => s.id === hoveredCategoryId) || null;
    }
    if (selectedCategoryId) {
      return slices.find((s) => s.id === selectedCategoryId) || null;
    }
    return null;
  }, [hoveredCategoryId, selectedCategoryId, slices]);

  const handleSliceClick = (slice) => {
    onSelectCategory?.(slice);
  };

  const handleKeyDownSlice = (e, slice) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelectCategory?.(slice);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: '430px',
        margin: '0 auto',
        padding: '0 4px',
        boxSizing: 'border-box',
      }}
    >
      {/* ── Screen 1 Donut Card ── */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '12px 0 16px',
          borderRadius: '24px',
          background: 'var(--bg-secondary, #ffffff)',
          border: '1px solid var(--border-color, rgba(0,0,0,0.08))',
          boxShadow: 'var(--card-shadow, 0 4px 20px rgba(0,0,0,0.05))',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ position: 'relative', width: SIZE, height: SIZE }}>
          {/* SVG Donut */}
          <svg
            width={SIZE}
            height={SIZE}
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            style={{ overflow: 'visible', display: 'block' }}
            role="region"
            aria-label="Skills proficiency distribution donut chart"
          >
            {/* Slices group */}
            {slices.map((slice) => {
              const isSelected = selectedCategoryId === slice.id;
              const isHovered = hoveredCategoryId === slice.id;
              const isPushed = isSelected || isHovered;

              return (
                <motion.g
                  key={slice.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`${slice.title}, ${slice.share} percent of total`}
                  onClick={() => handleSliceClick(slice)}
                  onKeyDown={(e) => handleKeyDownSlice(e, slice)}
                  onMouseEnter={() => setHoveredCategoryId(slice.id)}
                  onMouseLeave={() => setHoveredCategoryId(null)}
                  onFocus={() => setHoveredCategoryId(slice.id)}
                  onBlur={() => setHoveredCategoryId(null)}
                  animate={{
                    x: isPushed ? slice.push.x : 0,
                    y: isPushed ? slice.push.y : 0,
                  }}
                  transition={{
                    type: prefersReducedMotion ? false : 'spring',
                    stiffness: 400,
                    damping: 28,
                  }}
                  style={{ cursor: 'pointer', outline: 'none' }}
                >
                  {/* Slice Arc Path */}
                  <motion.path
                    d={slice.pathD}
                    fill="none"
                    stroke={slice.color}
                    strokeWidth={STROKE_WIDTH}
                    strokeLinecap="butt"
                    strokeDasharray={`${slice.arcLength} ${Math.PI * 2 * RADIUS}`}
                    initial={{
                      strokeDashoffset: prefersReducedMotion ? 0 : slice.arcLength,
                    }}
                    animate={{ strokeDashoffset: 0 }}
                    transition={{
                      duration: prefersReducedMotion ? 0 : 1.1,
                      delay: prefersReducedMotion ? 0 : slice.idx * 0.15,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    style={{
                      filter: isPushed
                        ? `drop-shadow(0 0 10px ${slice.color}90)`
                        : `drop-shadow(0 1px 4px ${slice.color}40)`,
                      opacity: activeSlice && activeSlice.id !== slice.id ? 0.6 : 1,
                      transition: 'opacity 0.25s ease, filter 0.25s ease',
                    }}
                  />

                  {/* Subtle connector tick from slice outer rim towards badge */}
                  <line
                    x1={slice.tick.x1}
                    y1={slice.tick.y1}
                    x2={slice.tick.x2}
                    y2={slice.tick.y2}
                    stroke={slice.color}
                    strokeWidth={1.5}
                    strokeDasharray="2 2"
                    strokeLinecap="round"
                    style={{
                      opacity: isPushed ? 0.9 : 0.45,
                      transition: 'opacity 0.2s ease',
                    }}
                  />
                </motion.g>
              );
            })}
          </svg>

          {/* Category Icon Badges outside each slice at mid-angle */}
          {slices.map((slice) => {
            const Icon = categoryIconMap[slice.id] || fallbackIcon;
            const isPushed = selectedCategoryId === slice.id || hoveredCategoryId === slice.id;
            const posX = slice.badge.x + (isPushed ? slice.push.x : 0);
            const posY = slice.badge.y + (isPushed ? slice.push.y : 0);

            return (
              <motion.div
                key={`badge-${slice.id}`}
                onClick={() => handleSliceClick(slice)}
                onMouseEnter={() => setHoveredCategoryId(slice.id)}
                onMouseLeave={() => setHoveredCategoryId(null)}
                animate={{
                  scale: isPushed ? 1.15 : 1,
                  boxShadow: isPushed
                    ? `0 0 10px ${slice.color}70`
                    : `0 2px 6px rgba(0,0,0,0.12)`,
                }}
                transition={{ duration: 0.18 }}
                style={{
                  position: 'absolute',
                  left: posX,
                  top: posY,
                  transform: 'translate(-50%, -50%)',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-secondary, #ffffff)',
                  border: `2px solid ${slice.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: slice.color,
                  cursor: 'pointer',
                  zIndex: 10,
                  boxSizing: 'border-box',
                }}
                title={slice.title}
              >
                <Icon size={12} strokeWidth={2.4} />
              </motion.div>
            );
          })}

          {/* Donut Center Display */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '130px',
              height: '130px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              pointerEvents: 'none',
              userSelect: 'none',
              padding: '4px',
              boxSizing: 'border-box',
            }}
          >
            {activeSlice ? (
              <motion.div
                key={activeSlice.id}
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.16 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                }}
              >
                <span
                  style={{
                    fontSize: '10.5px',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: activeSlice.color,
                    background: `${activeSlice.color}15`,
                    padding: '2px 8px',
                    borderRadius: '999px',
                    maxWidth: '120px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {activeSlice.title}
                </span>
                <span
                  style={{
                    fontSize: '32px',
                    fontWeight: 800,
                    color: 'var(--text-primary, #ffffff)',
                    letterSpacing: '-0.03em',
                    lineHeight: 1,
                  }}
                >
                  {activeSlice.share}%
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--text-muted, #71717a)',
                    marginTop: '2px',
                    lineHeight: 1.1,
                  }}
                >
                  {activeSlice.skills?.length || 0} skills • avg {Math.round(activeSlice.avg)}%
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="overall"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.16 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <span
                  style={{
                    fontSize: '34px',
                    fontWeight: 800,
                    color: 'var(--text-primary, #ffffff)',
                    letterSpacing: '-0.03em',
                    lineHeight: 1,
                  }}
                >
                  100%
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--primary-blue, #3b82f6)',
                    background: 'color-mix(in srgb, var(--primary-blue, #3b82f6) 12%, transparent)',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    lineHeight: 1.1,
                  }}
                >
                  Overall
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--text-muted, #71717a)',
                    marginTop: '2px',
                    lineHeight: 1.1,
                  }}
                >
                  {totalSkills} skills • avg {overallAvg}%
                </span>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* ── Tappable List of 5 Categories ── */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          marginTop: '14px',
        }}
        role="list"
        aria-label="Skills categories"
      >
        {slices.map((slice) => {
          const Icon = categoryIconMap[slice.id] || fallbackIcon;
          const isSelected = selectedCategoryId === slice.id;
          const isHovered = hoveredCategoryId === slice.id;

          return (
            <motion.div
              key={slice.id}
              role="button"
              tabIndex={0}
              aria-label={`${slice.title}, ${slice.share} percent of total, ${slice.skills.length} skills, average proficiency ${Math.round(slice.avg)}%`}
              onClick={() => handleSliceClick(slice)}
              onKeyDown={(e) => handleKeyDownSlice(e, slice)}
              onMouseEnter={() => setHoveredCategoryId(slice.id)}
              onMouseLeave={() => setHoveredCategoryId(null)}
              onFocus={() => setHoveredCategoryId(slice.id)}
              onBlur={() => setHoveredCategoryId(null)}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: '16px',
                backgroundColor: isSelected || isHovered
                  ? 'color-mix(in srgb, var(--bg-secondary, #ffffff) 92%, ' + slice.color + ' 8%)'
                  : 'var(--bg-secondary, #ffffff)',
                border: `1px solid ${
                  isSelected || isHovered ? slice.color : 'var(--border-color, rgba(0,0,0,0.08))'
                }`,
                boxShadow: isSelected || isHovered
                  ? `0 4px 12px ${slice.color}20`
                  : 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.04))',
                cursor: 'pointer',
                outline: 'none',
                transition: 'background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
              }}
            >
              {/* Left: Icon & Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                {/* Category Icon Badge */}
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '10px',
                    backgroundColor: `${slice.color}15`,
                    border: `1px solid ${slice.color}35`,
                    color: slice.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={16} strokeWidth={2.2} />
                </div>

                {/* Name & Count */}
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: 'var(--text-primary, #0f172a)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {slice.title}
                  </span>
                  <span
                    style={{
                      fontSize: '11.5px',
                      fontWeight: 600,
                      color: 'var(--text-muted, #64748b)',
                    }}
                  >
                    {slice.skills.length} skills • avg {Math.round(slice.avg)}%
                  </span>
                </div>
              </div>

              {/* Right: Share Badge & Chevron */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: '999px',
                    color: slice.color,
                    backgroundColor: `${slice.color}15`,
                    border: `1px solid ${slice.color}40`,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {slice.share}%
                </span>
                <ChevronRight size={16} style={{ color: 'var(--text-muted, #94a3b8)' }} />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(SkillsDonut);
