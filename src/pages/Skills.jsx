// src/pages/Skills.jsx
// Mobile: 2-level drill-down — compact category grid (no scroll) → skill-list sheet → skill-detail sheet
// Desktop: unchanged 2-col card grid

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronDown, Star, Layers, Clock, Briefcase, ChevronLeft, Loader2, LayoutGrid, PieChart, Search } from 'lucide-react';
import { ScrollReveal, SkillTooltip } from '../components';
import { categoryIconMap } from '../components/ui/skillIcons';
import useRealtimeData from '../hooks/useRealtimeData';

const categoryMeta = {
  languages: { id: "languages", title: "Languages", icon: "code" },
  database:  { id: "database",  title: "Database & Tools", icon: "database" },
  ml:        { id: "ml",        title: "ML & Data Science", icon: "ml" },
  soft:      { id: "soft",      title: "Soft Skills", icon: "users" },
  exploring: { id: "exploring", title: "Currently Exploring & Learning", icon: "rocket" },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.06
    }
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 25, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  },
};

const levelColor = {
  Advanced:     { bg: 'rgba(22, 163, 74, 0.1)',  text: '#16a34a', ring: '#16a34a' },
  Intermediate: { bg: 'rgba(234, 179, 8, 0.1)',  text: '#ca8a04', ring: '#eab308' },
  Learning:     { bg: 'rgba(99, 102, 241, 0.1)', text: '#6366f1', ring: '#6366f1' },
};

const levelDot = { Advanced: '#16a34a', Intermediate: '#eab308', Learning: '#6366f1' };

function ProgressRing({ percent, color, size = 80 }) {
  const validPercent = Math.min(Math.max(Number(percent) || 0, 0), 100);
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (validPercent / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border-color)" strokeWidth={7} />
      <motion.circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={7} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={circ}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      />
    </svg>
  );
}

function SkillsRadarChart({ categories }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const SIZE = 480;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const R = 155;
  const LEVELS = 5;
  const n = categories.length;
  if (n < 3) return null;

  const angleStep = (2 * Math.PI) / n;
  const getPoint = (angle, r) => ({
    x: CX + r * Math.cos(angle - Math.PI / 2),
    y: CY + r * Math.sin(angle - Math.PI / 2),
  });

  // Average proficiency per category (0-100)
  const values = categories.map(cat => {
    const pcts = cat.skills.map(s => s.percent ?? 0).filter(p => p > 0);
    return pcts.length ? pcts.reduce((a, b) => a + b, 0) / pcts.length : 0;
  });

  // Data polygon points
  const dataPoints = categories.map((_, i) => {
    const angle = i * angleStep;
    const r = (values[i] / 100) * R;
    return getPoint(angle, r);
  });
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z';

  // Initial zero-radius data points for dynamic path expansion animation
  const zeroDataPoints = categories.map((_, i) => getPoint(i * angleStep, 0));
  const zeroDataPath = zeroDataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z';

  const CATEGORY_COLORS = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444'];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      exit={{ opacity: 0, scale: 0.92, rotate: 2 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
    >
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--primary-blue)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--primary-blue)" stopOpacity="0.04" />
          </radialGradient>
          <filter id="shadowGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Concentric level polygons with staggered scale animation */}
        {Array.from({ length: LEVELS }, (_, lvl) => {
          const r = (R * (lvl + 1)) / LEVELS;
          const pts = Array.from({ length: n }, (_, i) => {
            const p = getPoint(i * angleStep, r);
            return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
          }).join(' ');
          return (
            <motion.polygon
              key={lvl}
              points={pts}
              fill="none"
              stroke="var(--border-color)"
              strokeWidth={1}
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: lvl === LEVELS - 1 ? 0.8 : 0.4, scale: 1 }}
              transition={{ duration: 0.6, delay: lvl * 0.08, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: `${CX}px ${CY}px` }}
            />
          );
        })}

        {/* Axis radial lines shooting outward from center */}
        {categories.map((_, i) => {
          const outer = getPoint(i * angleStep, R);
          const isHovered = hoveredIndex === i;
          const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
          return (
            <motion.line
              key={i}
              x1={CX}
              y1={CY}
              x2={CX}
              y2={CY}
              animate={{ x2: outer.x, y2: outer.y }}
              transition={{ duration: 0.65, delay: 0.2 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              stroke={isHovered ? color : "var(--border-color)"}
              strokeWidth={isHovered ? 2 : 1}
              opacity={isHovered ? 1 : 0.6}
            />
          );
        })}

        {/* Data polygon expanding from center */}
        <motion.path
          d={zeroDataPath}
          animate={{ d: dataPath }}
          transition={{ duration: 0.95, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          fill="url(#radarGlow)"
          stroke="var(--primary-blue)"
          strokeWidth={2.5}
          strokeLinejoin="round"
          filter="url(#shadowGlow)"
        />

        {/* Interactive Data points */}
        {dataPoints.map((p, i) => {
          const isHovered = hoveredIndex === i;
          const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
          return (
            <g
              key={i}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {isHovered && (
                <motion.circle
                  cx={p.x} cy={p.y} r={14}
                  fill={color}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.1, 0.4] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
              )}
              <motion.circle
                cx={p.x}
                cy={p.y}
                r={isHovered ? 7 : 5}
                fill={color}
                stroke="#ffffff"
                strokeWidth={2}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 380, damping: 18, delay: 0.55 + i * 0.08 }}
                style={{ transformOrigin: `${p.x}px ${p.y}px` }}
              />
            </g>
          );
        })}

        {/* Category labels & average percentage text */}
        {categories.map((cat, i) => {
          const angle = i * angleStep;
          const labelR = R + 34;
          const p = getPoint(angle, labelR);
          const isLeft = p.x < CX - 10;
          const isRight = p.x > CX + 10;
          const isHovered = hoveredIndex === i;
          const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length];

          return (
            <motion.g
              key={i}
              initial={{ opacity: 0, y: 12, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 + i * 0.07 }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ cursor: 'pointer', transformOrigin: `${p.x}px ${p.y}px` }}
            >
              <text
                x={p.x} y={p.y}
                textAnchor={isLeft ? 'end' : isRight ? 'start' : 'middle'}
                dominantBaseline="middle"
                fontSize={isHovered ? 13 : 12}
                fontWeight={700}
                fill={isHovered ? color : "var(--text-primary)"}
                style={{ transition: 'fill 0.2s, font-size 0.2s' }}
              >
                {cat.title}
              </text>
              <text
                x={p.x} y={p.y + 15}
                textAnchor={isLeft ? 'end' : isRight ? 'start' : 'middle'}
                dominantBaseline="middle"
                fontSize={isHovered ? 11 : 10}
                fontWeight={600}
                fill={isHovered ? color : "var(--text-muted)"}
                style={{ transition: 'fill 0.2s' }}
              >
                {Math.round(values[i])}% Avg
              </text>
            </motion.g>
          );
        })}

        {/* Level labels along vertical axis */}
        {Array.from({ length: LEVELS }, (_, lvl) => {
          const r = (R * (lvl + 1)) / LEVELS;
          const p = getPoint(0, r);
          return (
            <motion.text
              key={lvl}
              x={p.x + 6}
              y={p.y}
              fontSize={9}
              fontWeight={600}
              fill="var(--text-muted)"
              dominantBaseline="middle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 0.4 + lvl * 0.05 }}
            >
              {Math.round(((lvl + 1) / LEVELS) * 100)}%
            </motion.text>
          );
        })}
      </svg>

      {/* Legend with interactive hover highlighting */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginTop: 16 }}
      >
        {categories.map((cat, i) => {
          const isHovered = hoveredIndex === i;
          const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
          return (
            <motion.div
              key={i}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              whileHover={{ scale: 1.05 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                fontSize: 12,
                fontWeight: isHovered ? 700 : 500,
                color: isHovered ? color : 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '4px 10px',
                borderRadius: '20px',
                background: isHovered ? `${color}15` : 'transparent',
                border: isHovered ? `1px solid ${color}40` : '1px solid transparent',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
              {cat.title} ({cat.skills.length})
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}

const profAccents = [
  { color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.25)', border: 'rgba(59, 130, 246, 0.35)' },
  { color: '#10b981', glow: 'rgba(16, 185, 129, 0.25)', border: 'rgba(16, 185, 129, 0.35)' },
  { color: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.25)', border: 'rgba(139, 92, 246, 0.35)' },
  { color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.25)', border: 'rgba(245, 158, 11, 0.35)' },
  { color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.25)', border: 'rgba(6, 182, 212, 0.35)' },
  { color: '#ec4899', glow: 'rgba(236, 72, 153, 0.25)', border: 'rgba(236, 72, 153, 0.35)' },
];

function MobileProficiencyCarousel({ topSkills, onOpenSkill }) {
  const trackRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);

  if (!topSkills || topSkills.length === 0) return null;

  const handleScroll = () => {
    if (!trackRef.current) return;
    const el = trackRef.current;
    const slide = el.querySelector('.sk-prof-feat-slide');
    if (!slide) return;
    const cardWidth = slide.offsetWidth + 10;
    const idx = Math.round(el.scrollLeft / cardWidth);
    setActiveIdx(Math.max(0, Math.min(idx, topSkills.length - 1)));
  };

  const scrollTo = (idx) => {
    if (!trackRef.current) return;
    const el = trackRef.current;
    const slide = el.querySelector('.sk-prof-feat-slide');
    if (!slide) return;
    const cardWidth = slide.offsetWidth + 10;
    el.scrollTo({ left: idx * cardWidth, behavior: 'smooth' });
    setActiveIdx(idx);
  };

  return (
    <div className="sk-prof-feat-wrapper">
      {/* Header with counter and arrow controls */}
      <div className="sk-prof-feat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Star size={13} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
          <span className="sk-prof-feat-title-text">Top Technical Proficiencies</span>
        </div>
        <div className="sk-prof-feat-controls">
          <span className="sk-prof-feat-counter">
            {activeIdx + 1} / {topSkills.length}
          </span>
          <button
            className="sk-prof-feat-arrow"
            onClick={() => scrollTo(Math.max(0, activeIdx - 1))}
            disabled={activeIdx === 0}
            aria-label="Previous skill"
          >
            <ChevronLeft size={13} />
          </button>
          <button
            className="sk-prof-feat-arrow"
            onClick={() => scrollTo(Math.min(topSkills.length - 1, activeIdx + 1))}
            disabled={activeIdx === topSkills.length - 1}
            aria-label="Next skill"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* Snap-scroll horizontal track */}
      <div className="sk-prof-feat-track" ref={trackRef} onScroll={handleScroll}>
        {topSkills.map((skill, i) => {
          const accentObj = profAccents[i % profAccents.length];
          const accent = accentObj.color;
          const lc = levelColor[skill.level] || levelColor.Intermediate;
          const tools = Array.isArray(skill.relatedTools) ? skill.relatedTools.slice(0, 3) : [];

          return (
            <div
              key={skill.id || skill.name}
              className="sk-prof-feat-slide"
              style={{
                background: `linear-gradient(135deg, ${accent}14, ${accentObj.glow}08), var(--bg-secondary)`,
                borderColor: accentObj.border,
              }}
            >
              {/* Glow blob bottom-right */}
              <div
                className="sk-prof-feat-bg"
                style={{ background: `radial-gradient(circle, ${accentObj.glow}35, transparent 70%)` }}
              />

              {/* Top metadata pill row */}
              <div className="sk-prof-feat-top-row">
                <span
                  className="sk-prof-feat-badge"
                  style={{ color: lc.text, background: lc.bg, borderColor: `${lc.ring}45` }}
                >
                  ⚡ {skill.level}
                </span>
                <span
                  className="sk-prof-feat-pct"
                  style={{ color: accent, background: `${accent}18`, borderColor: `${accent}35` }}
                >
                  {skill.percent}% Mastery
                </span>
              </div>

              {/* Skill identity header */}
              <div className="sk-prof-feat-identity">
                <div
                  className="sk-prof-feat-icon"
                  style={{ background: `${accent}18`, color: accent, borderColor: `${accent}35` }}
                >
                  {skill.name.slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 className="sk-prof-feat-name">{skill.name}</h3>
                  <div className="sk-prof-feat-meta">
                    <span>
                      <Clock size={11} style={{ display: 'inline', marginRight: 3, verticalAlign: '-1px' }} />
                      {String(skill.years || '1').replace(/(\s*yrs?)+$/i, '')} yrs exp
                    </span>
                    <span>•</span>
                    <span>
                      <Briefcase size={11} style={{ display: 'inline', marginRight: 3, verticalAlign: '-1px' }} />
                      {skill.projectCount || 1}+ projects
                    </span>
                  </div>
                </div>
              </div>

              {/* Animated Progress Bar */}
              <div className="sk-prof-feat-bar-wrap">
                <div className="sk-prof-feat-bar">
                  <motion.div
                    className="sk-prof-feat-fill"
                    style={{ background: `linear-gradient(90deg, ${accent}, #10b981)` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.percent}%` }}
                    transition={{ duration: 0.8, delay: 0.1 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </div>

              {/* Description summary */}
              <p className="sk-prof-feat-desc">
                {skill.description || `Core competency and specialized implementation in real-world production systems.`}
              </p>

              {/* Ecosystem Tags + Action CTA */}
              <div className="sk-prof-feat-bottom">
                <div className="sk-prof-feat-tags">
                  {tools.map((t, tidx) => (
                    <span
                      key={`${t}-${tidx}`}
                      className="sk-prof-feat-tag"
                      style={{ color: accent, background: `${accent}12`, borderColor: `${accent}25` }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <button
                  className="sk-prof-feat-action"
                  style={{ background: `${accent}18`, borderColor: `${accent}35`, color: accent }}
                  onClick={() => onOpenSkill(skill)}
                >
                  Inspect
                  <ChevronRight size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dots pagination */}
      <div className="sk-prof-feat-dots">
        {topSkills.map((p, idx) => (
          <button
            key={p.id || p.name}
            className="sk-prof-feat-dot"
            style={{
              background: idx === activeIdx ? profAccents[idx % profAccents.length].color : undefined,
              width: idx === activeIdx ? '18px' : '6px',
            }}
            onClick={() => scrollTo(idx)}
            aria-label={`Go to skill ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function Skills() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  const [activeCategory, setActiveCategory] = useState(null);  // category object
  const [activeSkill,    setActiveSkill]    = useState(null);  // skill object
  const [desktopView, setDesktopView] = useState('grid'); // 'grid' | 'radar'
  const [searchQuery, setSearchQuery] = useState('');
  const [hasCatScrolled,  setHasCatScrolled]  = useState(false);
  const [isCatScrollable, setIsCatScrollable] = useState(false);
  const [hasSkillScrolled,  setHasSkillScrolled]  = useState(false);
  const [isSkillScrollable, setIsSkillScrollable] = useState(false);
  const catSheetRef   = useRef(null);
  const skillSheetRef = useRef(null);

  const { data: rawSkills, loading } = useRealtimeData('skills', { orderColumn: 'order_index', ascending: true });
  const [skillCategories, setSkillCategories] = useState([]);

  useEffect(() => {
    if (rawSkills && rawSkills.length > 0) {
      const data = rawSkills;
        // Group skills by category
        const grouped = {};
        data.forEach(dbSkill => {
          const cat = dbSkill.category;
          if (!grouped[cat]) grouped[cat] = [];
          
          // Map DB snake_case fields to camelCase format expected by the UI
          grouped[cat].push({
            id: dbSkill.id,
            name: dbSkill.name,
            icon: dbSkill.icon_class,
            level: dbSkill.level_label,
            percent: dbSkill.proficiency_level,
            years: dbSkill.years_experience,
            projectCount: dbSkill.project_count,
            description: dbSkill.description,
            relatedTools: dbSkill.related_tools || [],
            projects: dbSkill.projects || [],
          });
        });

        // Ensure 'exploring' category is always present with upcoming technologies
        if (!grouped['exploring'] || grouped['exploring'].length === 0) {
          grouped['exploring'] = [
            { id: 'exp-1', name: 'Rust & WASM', icon: 'code', level: 'Learning', percent: 45, years: '0.5 yrs', projectCount: 2, description: 'High-performance systems programming and WebAssembly for browser performance.' },
            { id: 'exp-2', name: 'LLM Agents & AutoGen', icon: 'rocket', level: 'Learning', percent: 60, years: '0.8 yrs', projectCount: 3, description: 'Multi-agent orchestration, tool use, and structured outputs with Groq & LangChain.' },
            { id: 'exp-3', name: 'Vector DBs (Pinecone/Qdrant)', icon: 'database', level: 'Learning', percent: 55, years: '0.6 yrs', projectCount: 2, description: 'High-dimensional vector embeddings, similarity search, and RAG architectures.' },
            { id: 'exp-4', name: 'MLOps & Kubeflow', icon: 'ml', level: 'Learning', percent: 40, years: '0.4 yrs', projectCount: 1, description: 'Automated model deployment, tracking, and continuous monitoring pipelines.' },
          ];
        }

        // Convert to array matching the format
        const finalCategories = Object.keys(grouped).map(catKey => {
          const meta = categoryMeta[catKey] || { id: catKey, title: catKey.charAt(0).toUpperCase() + catKey.slice(1), icon: 'code' };
          return {
            id: meta.id,
            title: meta.title,
            icon: meta.icon,
            skills: grouped[catKey]
          };
        });

        // Ensure stable order of categories (languages, database, ml, soft, exploring)
        const orderMap = { languages: 1, database: 2, ml: 3, soft: 4, exploring: 5 };
        finalCategories.sort((a, b) => (orderMap[a.id] || 99) - (orderMap[b.id] || 99));

        setSkillCategories(finalCategories);
    }
  }, [rawSkills]);

  // Detect scrollability for category sheet
  useEffect(() => {
    if (activeCategory) {
      setHasCatScrolled(false);
      setIsCatScrollable(false);
      setTimeout(() => {
        if (catSheetRef.current) {
          const { scrollHeight, clientHeight } = catSheetRef.current;
          setIsCatScrollable(scrollHeight > clientHeight + 5);
        }
      }, 200);
    }
  }, [activeCategory]);

  // Detect scrollability for skill detail sheet
  useEffect(() => {
    if (activeSkill) {
      setHasSkillScrolled(false);
      setIsSkillScrollable(false);
      setTimeout(() => {
        if (skillSheetRef.current) {
          const { scrollHeight, clientHeight } = skillSheetRef.current;
          setIsSkillScrollable(scrollHeight > clientHeight + 5);
        }
      }, 200);
    }
  }, [activeSkill]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <ScrollReveal>
      <style>{`
        /* ============ SHARED PAGE SHELL ============ */
        .skills-page {
          width: 100%;
          height: 100%;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          gap: 14px;
          box-sizing: border-box;
        }

        /* ============ DESKTOP GRID ============ */
        .skills-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          grid-template-rows: 1fr 1fr 1fr;
          gap: 16px;
          flex: 1;
          min-height: 0;
        }
        .skill-category-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 16px; padding: 16px 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.02);
          transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease;
          display: flex; flex-direction: column;
          justify-content: center;
          min-height: 0;
        }
        .skill-category-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.06);
          border-color: var(--primary-blue);
        }
        .skill-category-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
        .skill-category-icon {
          width: 38px; height: 38px; border-radius: 10px;
          background: rgba(128,128,128,0.08); color: var(--text-primary);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .skill-category-title { font-size: 15px; font-weight: 700; color: var(--text-primary); margin: 0; }
        .skill-pills { display: flex; flex-wrap: wrap; gap: 8px; }
        .skill-pill {
          display: inline-block; font-size: 12px; font-weight: 600;
          background: var(--bg-primary); color: var(--text-secondary);
          border: 1px solid var(--border-color); padding: 5px 12px;
          border-radius: 999px; transition: all .2s ease; cursor: pointer;
        }
        .skill-pill:hover { background: var(--text-primary); color: var(--bg-primary); border-color: var(--text-primary); }
        [data-theme="dark"] .skill-category-card { border-color: var(--border-color); }
        [data-theme="dark"] .skill-category-card:hover { border-color: var(--primary-blue); }
        [data-theme="dark"] .skill-category-icon { background: rgba(255,255,255,0.06); color: var(--text-primary); }
        [data-theme="dark"] .skill-pill { background: var(--bg-primary); color: var(--text-secondary); border-color: var(--border-color); }
        [data-theme="dark"] .skill-pill:hover { background: var(--text-primary); color: var(--bg-primary); border-color: var(--text-primary); }

        /* ============ MOBILE — redesigned ============ */
        @media (max-width: 900px) {

          /* Hero header */
          .sk-mob-header {
            text-align: center;
            margin-bottom: 14px;
          }
          .sk-mob-eyebrow {
            font-size: 10px; font-weight: 800; letter-spacing: .22em;
            text-transform: uppercase; color: var(--text-muted);
            margin: 0 0 6px;
          }
          .sk-mob-title {
            font-size: 22px; font-weight: 800; color: var(--text-primary);
            margin: 0 0 8px; letter-spacing: -0.025em; line-height: 1.2;
          }
          .sk-mob-subtitle {
            font-size: 12px; color: var(--text-secondary);
            margin: 0; line-height: 1.55;
          }

          /* Quick stats pill row */
          .sk-stats-bar {
            display: flex; gap: 6px; margin-bottom: 14px;
          }
          .sk-stat-pill {
            flex: 1; display: flex; flex-direction: column; align-items: center;
            justify-content: center; gap: 1px;
            padding: 8px 4px; border-radius: 12px;
            background: var(--bg-secondary); border: 1px solid var(--border-color);
          }
          .sk-stat-val {
            font-size: 17px; font-weight: 800; line-height: 1;
          }
          .sk-stat-lbl {
            font-size: 9px; font-weight: 700; color: var(--text-muted);
            text-transform: uppercase; letter-spacing: .06em;
          }

          /* Category cards 2-col bento grid */
          .skills-mobile-list {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
            margin-bottom: 14px;
          }

          /* Base category card */
          .sk-cat-card {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 14px;
            padding: 12px 10px 10px;
            display: flex; flex-direction: column;
            gap: 8px;
            cursor: pointer;
            text-align: left;
            outline: none;
            position: relative;
            overflow: hidden;
            min-height: 148px;
            -webkit-tap-highlight-color: transparent;
            transition: border-color 0.2s;
          }
          .sk-cat-card:active { transform: scale(0.972); }

          /* Full-width card (Exploring) */
          .sk-cat-card--full {
            grid-column: 1 / -1;
            flex-direction: row;
            align-items: flex-start;
            min-height: auto;
            padding: 12px;
            gap: 12px;
          }
          .sk-cat-card--full .sk-cat-icon-box { flex-shrink: 0; }
          .sk-cat-card--full .sk-cat-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 7px; }


          .sk-cat-stripe {
            position: absolute; top: 0; left: 0; right: 0;
            height: 2.5px; border-radius: 16px 16px 0 0;
          }
          .sk-cat-glow {
            position: absolute; bottom: -20px; right: -20px;
            width: 80px; height: 80px; border-radius: 50%;
            pointer-events: none;
          }

          .sk-cat-header-row {
            display: flex; align-items: center; gap: 8px;
          }
          .sk-cat-icon-box {
            width: 30px; height: 30px; border-radius: 8px;
            display: flex; align-items: center; justify-content: center;
            border: 1px solid; flex-shrink: 0;
            box-shadow: 0 2px 6px rgba(0,0,0,0.06);
          }
          .sk-cat-title-group { flex: 1; min-width: 0; }
          .sk-cat-main { display: flex; flex-direction: column; gap: 8px; }
          .sk-cat-name {
            font-size: 12px; font-weight: 800;
            color: var(--text-primary);
            margin: 0; line-height: 1.2; letter-spacing: -0.01em;
          }
          .sk-cat-count-badge {
            font-size: 8.5px; font-weight: 700;
            padding: 1px 6px; border-radius: 20px;
            border: 1px solid; margin-top: 3px;
            width: fit-content; display: inline-block;
          }
          .sk-cat-chevron {
            color: var(--text-muted); flex-shrink: 0; margin-left: auto;
          }

          /* Level distribution bar */
          .sk-cat-level-row {
            display: flex; align-items: center; gap: 6px;
          }
          .sk-cat-level-bar {
            flex: 1; height: 4px; border-radius: 2px;
            background: var(--border-color); overflow: hidden;
            display: flex;
          }
          .sk-cat-level-seg { height: 100%; }
          .sk-cat-level-legend {
            display: flex; gap: 8px;
          }
          .sk-cat-legend-item {
            display: flex; align-items: center; gap: 3px;
            font-size: 8.5px; font-weight: 600; color: var(--text-muted);
          }
          .sk-cat-legend-dot {
            width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;
          }

          /* Mini skill tags preview */
          .sk-cat-preview-tags {
            display: flex; gap: 4px; flex-wrap: wrap;
          }
          .sk-cat-preview-tag {
            font-size: 8.5px; font-weight: 700;
            padding: 2px 6px; border-radius: 5px;
            background: var(--bg-primary); border: 1px solid var(--border-color);
            color: var(--text-secondary); white-space: nowrap;
          }

          /* ============ TOP TECHNICAL PROFICIENCIES CAROUSEL ============ */
          .sk-prof-feat-wrapper {
            margin-top: 4px;
            margin-bottom: 14px;
          }
          .sk-prof-feat-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 2px 8px;
          }
          .sk-prof-feat-title-text {
            font-size: 10.5px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: .08em;
            color: var(--text-primary);
          }
          .sk-prof-feat-controls {
            display: flex;
            align-items: center;
            gap: 5px;
          }
          .sk-prof-feat-counter {
            font-size: 9.5px;
            font-weight: 700;
            color: var(--text-muted);
            padding: 2px 7px;
            border-radius: 6px;
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
          }
          .sk-prof-feat-arrow {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            color: var(--text-secondary);
            cursor: pointer;
            padding: 0;
            transition: background 0.15s, opacity 0.15s;
          }
          .sk-prof-feat-arrow:active { background: var(--bg-primary); }
          .sk-prof-feat-arrow:disabled { opacity: 0.3; cursor: default; }

          /* Horizontal snap track */
          .sk-prof-feat-track {
            display: flex;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            scroll-padding-left: 2px;
            -webkit-overflow-scrolling: touch;
            gap: 10px;
            padding: 4px 2px 6px;
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .sk-prof-feat-track::-webkit-scrollbar { display: none; }
          .sk-prof-feat-track::after { content: ''; flex: 0 0 4px; }

          /* Individual skill card slide */
          .sk-prof-feat-slide {
            min-width: 85%;
            max-width: 85%;
            scroll-snap-align: start;
            border-radius: 18px;
            border: 1px solid;
            padding: 14px;
            position: relative;
            overflow: hidden;
            flex-shrink: 0;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            gap: 9px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.04);
          }
          .sk-prof-feat-bg {
            position: absolute;
            bottom: -24px;
            right: -24px;
            width: 110px;
            height: 110px;
            border-radius: 50%;
            pointer-events: none;
          }
          .sk-prof-feat-top-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
          }
          .sk-prof-feat-badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            border-radius: 20px;
            padding: 2px 8px;
            border: 1px solid;
            font-size: 8.5px;
            font-weight: 800;
            letter-spacing: 0.04em;
          }
          .sk-prof-feat-pct {
            display: inline-flex;
            align-items: center;
            border-radius: 20px;
            padding: 2px 8px;
            border: 1px solid;
            font-size: 9.5px;
            font-weight: 800;
            letter-spacing: 0.02em;
          }
          .sk-prof-feat-identity {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .sk-prof-feat-icon {
            width: 34px;
            height: 34px;
            border-radius: 9px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: 800;
            border: 1px solid;
            flex-shrink: 0;
          }
          .sk-prof-feat-name {
            font-size: 15px;
            font-weight: 800;
            color: var(--text-primary);
            margin: 0 0 2px;
            letter-spacing: -0.015em;
          }
          .sk-prof-feat-meta {
            font-size: 10px;
            color: var(--text-secondary);
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .sk-prof-feat-bar-wrap {
            margin: 2px 0;
          }
          .sk-prof-feat-bar {
            height: 5px;
            border-radius: 3px;
            background: var(--border-color);
            overflow: hidden;
          }
          .sk-prof-feat-fill {
            height: 100%;
            border-radius: 3px;
          }
          .sk-prof-feat-desc {
            font-size: 11px;
            color: var(--text-secondary);
            line-height: 1.45;
            margin: 0;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .sk-prof-feat-bottom {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            margin-top: 2px;
          }
          .sk-prof-feat-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
            flex: 1;
            min-width: 0;
          }
          .sk-prof-feat-tag {
            font-size: 8.5px;
            font-weight: 700;
            border-radius: 6px;
            padding: 2px 6px;
            border: 1px solid;
            white-space: nowrap;
          }
          .sk-prof-feat-action {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 10.5px;
            font-weight: 700;
            border-radius: 8px;
            padding: 5px 10px;
            border: 1px solid;
            cursor: pointer;
            transition: transform 0.15s;
            -webkit-tap-highlight-color: transparent;
            flex-shrink: 0;
          }
          .sk-prof-feat-action:active { transform: scale(0.95); }

          /* Dots pagination */
          .sk-prof-feat-dots {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
            margin-top: 6px;
            margin-bottom: 2px;
          }
          .sk-prof-feat-dot {
            height: 6px;
            border-radius: 3px;
            background: var(--border-color);
            border: none;
            padding: 0;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          /* ============ SHARED SHEET CHROME ============ */
          .sk-sheet-overlay {
            position: fixed; inset: 0;
            background: rgba(0,0,0,.65);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            will-change: opacity; transform: translateZ(0);
            z-index: 1000;
          }
          .sk-sheet {
            position: fixed; bottom: 0; left: 0; right: 0;
            background: var(--bg-secondary);
            border-top-left-radius: 28px;
            border-top-right-radius: 28px;
            z-index: 1001;
            display: flex; flex-direction: column;
            will-change: transform; transform: translateZ(0);
            box-shadow: 0 -16px 60px rgba(0,0,0,.18);
            overflow: hidden;
          }
          .sk-sheet--cat   { height: 75vh; height: 75dvh; }
          .sk-sheet--skill { height: 82vh; height: 82dvh; }

          /* Sheet top accent bar */
          .sk-sheet-accent { height: 3px; width: 100%; flex-shrink: 0; }

          .sk-sheet-handle {
            width: 36px; height: 4px;
            background: var(--border-color);
            border-radius: 2px;
            margin: 10px auto 0; flex-shrink: 0;
          }
          .sk-sheet-header {
            display: flex; align-items: center; justify-content: space-between;
            padding: 12px 14px 10px;
            border-bottom: 1px solid var(--border-color);
            flex-shrink: 0;
          }
          .sk-sheet-header-left { display: flex; align-items: center; gap: 10px; }
          .sk-sheet-header-left h2 {
            font-size: 15px; font-weight: 800;
            color: var(--text-primary); margin: 0; letter-spacing: -0.01em;
          }
          .sk-sheet-subtitle {
            font-size: 10px; color: var(--text-muted); font-weight: 600;
            margin-top: 1px;
          }
          .sk-sheet-close {
            width: 26px; height: 26px; border-radius: 13px;
            background: var(--bg-primary); border: 1px solid var(--border-color);
            display: flex; align-items: center; justify-content: center;
            color: var(--text-secondary); cursor: pointer; flex-shrink: 0;
          }
          .sk-sheet-body {
            flex: 1; overflow-y: auto; padding: 0;
            display: flex; flex-direction: column;
          }
          .sk-sheet-body::-webkit-scrollbar { display: none; }

          /* ============ CATEGORY SHEET — upgraded skill rows ============ */
          .sk-skill-group-label {
            font-size: 10px; font-weight: 800;
            color: var(--text-muted); text-transform: uppercase; letter-spacing: .08em;
            padding: 14px 14px 6px; flex-shrink: 0;
          }
          .sk-skills-card {
            margin: 0 12px 14px;
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: 14px; overflow: hidden;
          }
          .sk-skill-row {
            display: flex; align-items: center;
            justify-content: space-between;
            padding: 10px 12px;
            border-bottom: 1px solid var(--border-color);
            background: transparent;
            border-left: none; border-right: none; border-top: none;
            width: 100%; text-align: left; cursor: pointer;
            gap: 8px; transition: background .12s;
            -webkit-tap-highlight-color: transparent;
          }
          .sk-skill-row:last-child { border-bottom: none; }
          .sk-skill-row:active { background: var(--bg-secondary); }
          .sk-skill-row-left { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
          .sk-skill-row-icon {
            width: 32px; height: 32px; border-radius: 8px;
            display: flex; align-items: center; justify-content: center;
            flex-shrink: 0;
            font-size: 10px; font-weight: 800; letter-spacing: -.5px;
            font-family: inherit; border: 1px solid;
          }
          .sk-skill-row-text { flex: 1; min-width: 0; }
          .sk-skill-row-text h4 {
            font-size: 12.5px; font-weight: 700;
            color: var(--text-primary); margin: 0 0 2px;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          }
          .sk-skill-row-text p {
            font-size: 10px; color: var(--text-secondary); margin: 0;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          }
          .sk-skill-row-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
          .sk-level-badge {
            font-size: 8.5px; font-weight: 800;
            padding: 2.5px 7px; border-radius: 20px; white-space: nowrap;
            border: 1px solid;
          }
          .sk-bar-mini {
            width: 46px; height: 4px;
            background: var(--border-color); border-radius: 2px; overflow: hidden;
          }
          .sk-bar-mini-fill { height: 100%; border-radius: 2px; }

          /* ============ SKILL DETAIL SHEET ============ */
          .sk-detail-body {
            flex: 1; overflow-y: auto;
            padding: 12px; display: flex; flex-direction: column; gap: 10px;
          }
          .sk-detail-body::-webkit-scrollbar { display: none; }

          .sk-detail-hero {
            display: flex; align-items: center; gap: 12px;
            padding: 14px;
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: 14px;
          }
          .sk-ring-wrap { position: relative; flex-shrink: 0; }
          .sk-ring-label {
            position: absolute; inset: 0;
            display: flex; flex-direction: column;
            align-items: center; justify-content: center; pointer-events: none;
          }
          .sk-ring-pct  { font-size: 16px; font-weight: 800; color: var(--text-primary); line-height: 1; }
          .sk-ring-sub  { font-size: 8px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: .05em; }
          .sk-meta-list { flex: 1; display: flex; flex-direction: column; gap: 10px; }
          .sk-meta-row  { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text-secondary); }
          .sk-meta-row svg  { color: var(--text-muted); flex-shrink: 0; }
          .sk-meta-row strong { color: var(--text-primary); font-weight: 700; }

          .sk-section-label {
            font-size: 10px; font-weight: 800;
            color: var(--text-muted); text-transform: uppercase;
            letter-spacing: .08em; margin: 0 0 8px;
          }
          .sk-desc-card {
            font-size: 12px; line-height: 1.65;
            color: var(--text-secondary);
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: 12px; padding: 12px 14px; margin: 0;
          }
          /* Ecosystem chips — colored */
          .sk-tags { display: flex; flex-wrap: wrap; gap: 6px; }
          .sk-tag {
            font-size: 9.5px; font-weight: 700;
            padding: 3.5px 9px; border-radius: 20px;
            border: 1px solid;
          }
          .sk-project-row {
            display: flex; align-items: center; gap: 10px;
            padding: 11px 14px;
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            font-size: 12.5px; font-weight: 600;
            color: var(--text-primary);
          }
          .sk-project-row svg { color: var(--text-muted); flex-shrink: 0; }

          /* shared scroll indicator */
          .sk-scroll-hint {
            position: absolute; bottom: 0; left: 0; right: 0;
            height: 70px;
            background: linear-gradient(to top, var(--bg-secondary) 30%, transparent);
            display: flex; justify-content: center;
            align-items: flex-end; padding-bottom: 12px;
            pointer-events: none; color: var(--text-secondary); z-index: 100;
          }
        }
      `}</style>

      <motion.div className="skills-page" style={{ height: !isMobile ? '100%' : 'auto', overflow: !isMobile ? 'hidden' : 'visible' }} variants={!isMobile ? containerVariants : undefined} initial={!isMobile ? "hidden" : undefined} animate={!isMobile ? "visible" : undefined}>

        {!isMobile && skillCategories.length > 0 && (
          <motion.div 
            variants={!isMobile ? itemVariants : undefined}
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginTop: '0px', 
              marginBottom: '10px',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary-blue)', display: 'inline-block' }} />
              <span>{skillCategories.reduce((acc, cat) => acc + (cat.skills?.length || 0), 0)} Total Skills Categorized</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Search Bar */}
              <div style={{ position: 'relative', width: '210px' }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search skills (e.g. Python)..."
                  style={{
                    width: '100%',
                    height: '34px',
                    paddingLeft: '32px',
                    paddingRight: '28px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    fontWeight: 500,
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s ease'
                  }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    style={{
                      position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 2, display: 'flex'
                    }}
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              <div style={{
                display: 'inline-flex',
                gap: '4px',
                padding: '4px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
              }}>
                <button 
                  onClick={() => setDesktopView('grid')}
                  style={{
                    padding: '7px 16px',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: desktopView === 'grid' ? 'var(--primary-blue)' : 'transparent',
                    color: desktopView === 'grid' ? '#ffffff' : 'var(--text-secondary)',
                    transition: 'all 0.2s ease',
                    boxShadow: desktopView === 'grid' ? '0 2px 8px color-mix(in srgb, var(--primary-blue) 35%, transparent)' : 'none'
                  }}
                >
                  <LayoutGrid size={14} /> Grid
                </button>

                <button 
                  onClick={() => setDesktopView('radar')}
                  style={{
                    padding: '7px 16px',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: desktopView === 'radar' ? 'var(--primary-blue)' : 'transparent',
                    color: desktopView === 'radar' ? '#ffffff' : 'var(--text-secondary)',
                    transition: 'all 0.2s ease',
                    boxShadow: desktopView === 'radar' ? '0 2px 8px color-mix(in srgb, var(--primary-blue) 35%, transparent)' : 'none'
                  }}
                >
                  <PieChart size={14} /> Radar
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <Loader2 className="spin" size={32} color="var(--primary-blue)" />
          </div>
        ) : skillCategories.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p>No skills found in the database. Please add them in the Admin Dashboard.</p>
          </div>
        ) : !isMobile ? (
          <AnimatePresence mode="wait">
            {desktopView === 'radar' ? (
              /* ── RADAR CHART VIEW ── */
              <motion.div
                key="radar"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 30px', width: '100%' }}
              >
                <SkillsRadarChart categories={skillCategories} />
              </motion.div>
            ) : (
              /* ── GRID VIEW ── */
              <motion.div
                key="grid"
                className="skills-grid"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                {skillCategories.map((category, catIdx) => {
                  const Icon = categoryIconMap[category.id] || categoryIconMap.languages;
                  const isFullWidth = category.id === 'exploring';
                  return (
                    <motion.div
                      key={category.id}
                      className="skill-category-card"
                      style={isFullWidth ? { gridColumn: '1 / -1', marginTop: '-4px' } : {}}
                      variants={itemVariants}
                      whileHover={{ translateY: -4, boxShadow: '0 12px 30px rgba(59,130,246,0.12)' }}
                    >
                      <div className="skill-category-header">
                        <motion.div 
                          className="skill-category-icon"
                          whileHover={{ rotate: 10, scale: 1.1 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                        >
                          <Icon size={22} style={{ strokeWidth: 1.5 }} />
                        </motion.div>
                        <h2 className="skill-category-title">{category.title}</h2>
                      </div>
                      <div className="skill-pills">
                        {category.skills.map((skill, skillIdx) => {
                          const isMatch = searchQuery && skill.name.toLowerCase().includes(searchQuery.toLowerCase());
                          return (
                            <motion.div
                              key={skill.id}
                              initial={{ opacity: 0, scale: 0.8, y: 12 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              transition={{
                                duration: 0.35,
                                delay: 0.15 + catIdx * 0.08 + skillIdx * 0.03,
                                ease: [0.16, 1, 0.3, 1]
                              }}
                              whileHover={{ scale: 1.06, y: -2 }}
                              whileTap={{ scale: 0.95 }}
                              style={{ display: 'inline-block' }}
                            >
                              <SkillTooltip skill={skill}>
                                <span
                                  className="skill-pill"
                                  style={isMatch ? {
                                    backgroundColor: 'var(--primary-blue)',
                                    color: '#ffffff',
                                    borderColor: 'var(--primary-blue)',
                                    boxShadow: '0 0 12px color-mix(in srgb, var(--primary-blue) 60%, transparent)',
                                    fontWeight: 700
                                  } : {}}
                                >
                                  {skill.name}
                                </span>
                              </SkillTooltip>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        ) : (
          <div style={{ padding: '4px 0 60px' }}>

            {/* ── Hero Header ── */}
            <div className="sk-mob-header">
              <p className="sk-mob-eyebrow">Skills &amp; Expertise</p>
              <h1 className="sk-mob-title">Tech Stack &amp; Proficiencies</h1>
              <p className="sk-mob-subtitle">
                {skillCategories.reduce((a, c) => a + (c.skills?.length || 0), 0)} skills across {skillCategories.length} categories — from ML to full-stack.
              </p>
            </div>

            {/* ── Quick Stats Pills ── */}
            {(() => {
              const total = skillCategories.reduce((a, c) => a + (c.skills?.length || 0), 0);
              const advanced = skillCategories.flatMap(c => c.skills).filter(s => s.level === 'Advanced').length;
              return (
                <div className="sk-stats-bar">
                  <div className="sk-stat-pill">
                    <span className="sk-stat-val" style={{ color: '#3b82f6' }}>{total}</span>
                    <span className="sk-stat-lbl">Skills</span>
                  </div>
                  <div className="sk-stat-pill">
                    <span className="sk-stat-val" style={{ color: '#10b981' }}>{advanced}</span>
                    <span className="sk-stat-lbl">Advanced</span>
                  </div>
                  <div className="sk-stat-pill">
                    <span className="sk-stat-val" style={{ color: '#8b5cf6' }}>{skillCategories.length}</span>
                    <span className="sk-stat-lbl">Categories</span>
                  </div>
                </div>
              );
            })()}

            {/* ── Mobile Search Bar ── */}
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search skills (e.g. Python, SQL, React)..."
                style={{
                  width: '100%', height: 38,
                  paddingLeft: 34, paddingRight: 30,
                  borderRadius: 12,
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: 12, fontWeight: 500, outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex'
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* ── 2-column Category Card Grid ── */}
            <div className="skills-mobile-list">
              {skillCategories.map((category, idx) => {
                const Icon = categoryIconMap[category.id] || categoryIconMap.languages;
                const accentColors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#6366f1'];
                const accent = accentColors[idx % accentColors.length];
                const isFull = category.id === 'exploring';
                // Regular cards show 2 chips; full-width shows 3
                const topSkills = category.skills.slice(0, isFull ? 3 : 2);
                const advCount = category.skills.filter(s => s.level === 'Advanced').length;
                const intCount = category.skills.filter(s => s.level === 'Intermediate').length;
                const lrnCount = category.skills.filter(s => s.level === 'Learning').length;
                const total = category.skills.length || 1;

                return (
                  <motion.button
                    key={category.id}
                    className={`sk-cat-card${isFull ? ' sk-cat-card--full' : ''}`}
                    onClick={() => setActiveCategory(category)}
                    whileTap={{ scale: 0.972 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05, type: 'spring', stiffness: 400, damping: 28 }}
                  >
                    <div className="sk-cat-stripe" style={{ background: accent }} />
                    <div className="sk-cat-glow" style={{ background: `radial-gradient(circle, ${accent}20, transparent 70%)` }} />

                    {/* Icon box — always visible */}
                    <div className="sk-cat-icon-box" style={{ background: `${accent}15`, borderColor: `${accent}30`, color: accent }}>
                      <Icon size={16} />
                    </div>

                    {/* Main content area (flex column for normal, flex child for full-width) */}
                    <div className="sk-cat-main">
                      {/* Title + count badge */}
                      <div>
                        <p className="sk-cat-name">{category.title}</p>
                        <span
                          className="sk-cat-count-badge"
                          style={{ color: accent, background: `${accent}12`, borderColor: `${accent}25` }}
                        >
                          {category.skills.length} skills
                        </span>
                      </div>

                      {/* Level distribution bar */}
                      <div className="sk-cat-level-row">
                        <div className="sk-cat-level-bar">
                          <div className="sk-cat-level-seg" style={{ width: `${(advCount / total) * 100}%`, background: '#16a34a' }} />
                          <div className="sk-cat-level-seg" style={{ width: `${(intCount / total) * 100}%`, background: '#eab308' }} />
                          <div className="sk-cat-level-seg" style={{ width: `${(lrnCount / total) * 100}%`, background: '#6366f1' }} />
                        </div>
                        <div className="sk-cat-level-legend">
                          {advCount > 0 && <span className="sk-cat-legend-item"><span className="sk-cat-legend-dot" style={{ background: '#16a34a' }} />{advCount}</span>}
                          {intCount > 0 && <span className="sk-cat-legend-item"><span className="sk-cat-legend-dot" style={{ background: '#eab308' }} />{intCount}</span>}
                        </div>
                      </div>

                      {/* Preview chips */}
                      <div className="sk-cat-preview-tags">
                        {topSkills.map(s => (
                          <span
                            key={s.id || s.name}
                            className="sk-cat-preview-tag"
                            style={
                              searchQuery && s.name.toLowerCase().includes(searchQuery.toLowerCase())
                                ? { background: accent, color: '#fff', borderColor: accent }
                                : {}
                            }
                          >
                            {s.name}
                          </span>
                        ))}
                        {category.skills.length > (isFull ? 3 : 2) && (
                          <span className="sk-cat-preview-tag" style={{ color: accent, fontWeight: 800 }}>+{category.skills.length - (isFull ? 3 : 2)}</span>
                        )}
                      </div>
                    </div>

                    {/* Chevron — only on non-full cards, bottom-right aligned */}
                    {!isFull && (
                      <ChevronRight size={13} className="sk-cat-chevron" style={{ position: 'absolute', bottom: 10, right: 10 }} />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* ── Live Top Proficiencies Snap-Scroll Carousel ── */}
            {(() => {
              const allSkills = skillCategories.flatMap(c => c.skills);
              const topSkills = [...allSkills]
                .filter(s => s.percent > 0)
                .sort((a, b) => (b.percent || 0) - (a.percent || 0))
                .slice(0, 6);
              if (topSkills.length === 0) return null;
              return (
                <MobileProficiencyCarousel
                  topSkills={topSkills}
                  onOpenSkill={setActiveSkill}
                />
              );
            })()}
          </div>
        )}

        {/* Swipe Hint */}
        {isMobile && (
          <motion.div
            className="swipe-hint"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <div className="swipe-hint-icon">
              <motion.div animate={{ x: [-3, 2, -3] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}>
                <ChevronLeft size={16} />
              </motion.div>
              <motion.div animate={{ x: [3, -2, 3] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}>
                <ChevronRight size={16} />
              </motion.div>
            </div>
            <span>Swipe or use nav to explore</span>
          </motion.div>
        )}
      </motion.div>

      {/* ── Portalled sheets (mobile only) ── */}
      {typeof document !== 'undefined' && isMobile && createPortal(
        <>
          {/* ══ LEVEL 1: Category Sheet ══ */}
          <AnimatePresence>
            {activeCategory && !activeSkill && (
              <div style={{ position: 'relative', zIndex: 9998 }}>
                <motion.div
                  className="sk-sheet-overlay"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => setActiveCategory(null)}
                />
                <motion.div
                  className="sk-sheet sk-sheet--cat"
                  initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                  transition={{ type: 'tween', ease: [0.16, 1, 0.3, 1], duration: 0.38 }}
                >
                  {/* Colored accent top bar */}
                  {(() => {
                    const catAccents = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#6366f1'];
                    const catIdx = skillCategories.findIndex(c => c.id === activeCategory.id);
                    const accent = catAccents[catIdx % catAccents.length];
                    return <div className="sk-sheet-accent" style={{ background: `linear-gradient(90deg, ${accent}, ${accent}60)` }} />;
                  })()}
                  <div className="sk-sheet-handle" />
                  <div className="sk-sheet-header">
                    <div className="sk-sheet-header-left">
                      <div>
                        <h2>{activeCategory.title}</h2>
                        <div className="sk-sheet-subtitle">{activeCategory.skills.length} skills in this category</div>
                      </div>
                    </div>
                    <button className="sk-sheet-close" onClick={() => setActiveCategory(null)}>
                      <X size={15} />
                    </button>
                  </div>

                  <div className="sk-sheet-body" ref={catSheetRef} onScroll={e => { if(e.target.scrollTop > 10 && !hasCatScrolled) setHasCatScrolled(true); }}>
                    <div className="sk-skill-group-label">All {activeCategory.skills.length} skills</div>
                    <div className="sk-skills-card">
                      {activeCategory.skills.map((skill, si) => {
                        const lc = levelColor[skill.level] || levelColor.Intermediate;
                        return (
                          <button key={skill.id} className="sk-skill-row" onClick={() => setActiveSkill(skill)}>
                            <div className="sk-skill-row-left">
                              <div className="sk-skill-row-icon" style={{ background: lc.bg, color: lc.text, borderColor: lc.ring + '40' }}>
                                {skill.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div className="sk-skill-row-text">
                                <h4>{skill.name}</h4>
                                <p>{skill.description ? skill.description.slice(0, 52) + (skill.description.length > 52 ? '…' : '') : `${skill.years || '—'} • ${skill.projectCount || 0}+ projects`}</p>
                              </div>
                            </div>
                            <div className="sk-skill-row-right">
                              <span className="sk-level-badge" style={{ background: lc.bg, color: lc.text, borderColor: lc.ring + '50' }}>{skill.level}</span>
                              <div className="sk-bar-mini">
                                <motion.div
                                  className="sk-bar-mini-fill"
                                  style={{ background: lc.ring }}
                                  initial={{ width: 0 }}
                                  animate={{ width: skill.percent + '%' }}
                                  transition={{ duration: 0.7, delay: si * 0.04, ease: [0.16, 1, 0.3, 1] }}
                                />
                              </div>
                              <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <AnimatePresence>
                    {isCatScrollable && !hasCatScrolled && (
                      <motion.div className="sk-scroll-hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                        <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: '2px' }}>Scroll</span>
                          <ChevronDown size={16} />
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* ══ LEVEL 2: Skill Detail Sheet ══ */}
          <AnimatePresence>
            {activeSkill && (
              <div style={{ position: 'relative', zIndex: 9999 }}>
                <motion.div
                  className="sk-sheet-overlay"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => setActiveSkill(null)}
                />
                <motion.div
                  className="sk-sheet sk-sheet--skill"
                  initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                  transition={{ type: 'tween', ease: [0.16, 1, 0.3, 1], duration: 0.38 }}
                >
                  {/* Level-colored accent top bar */}
                  <div
                    className="sk-sheet-accent"
                    style={{ background: `linear-gradient(90deg, ${(levelColor[activeSkill.level] || levelColor.Intermediate).ring}, ${(levelColor[activeSkill.level] || levelColor.Intermediate).ring}60)` }}
                  />
                  <div className="sk-sheet-handle" />
                  <div className="sk-sheet-header">
                    <div className="sk-sheet-header-left">
                      <button
                        onClick={() => setActiveSkill(null)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 700, fontSize: 13, padding: 0 }}
                      >
                        <ChevronLeft size={16} />
                        Back
                      </button>
                      <div>
                        <h2 style={{ marginLeft: 4 }}>{activeSkill.name}</h2>
                      </div>
                    </div>
                    <button className="sk-sheet-close" onClick={() => { setActiveSkill(null); }}>
                      <X size={15} />
                    </button>
                  </div>

                  <div className="sk-detail-body" ref={skillSheetRef} onScroll={e => { if(e.target.scrollTop > 10 && !hasSkillScrolled) setHasSkillScrolled(true); }}>
                    {/* Hero ring */}
                    <div className="sk-detail-hero">
                      <div className="sk-ring-wrap">
                        <ProgressRing
                          percent={activeSkill.percent}
                          color={(levelColor[activeSkill.level] || levelColor.Intermediate).ring}
                          size={90}
                        />
                        <div className="sk-ring-label">
                          <span className="sk-ring-pct">{activeSkill.percent}%</span>
                          <span className="sk-ring-sub">mastery</span>
                        </div>
                      </div>
                      <div className="sk-meta-list">
                        <div className="sk-meta-row">
                          <Clock size={14} />
                          <span><strong>{String(activeSkill.years || '0').replace(/(\s*yrs?)+$/i, '')} yrs</strong> experience</span>
                        </div>
                        <div className="sk-meta-row">
                          <Briefcase size={14} />
                          <span><strong>{activeSkill.projectCount}+</strong> projects</span>
                        </div>
                        <div className="sk-meta-row">
                          <Star size={14} />
                          <span
                            style={{
                              fontWeight: 800, fontSize: 12,
                              color: (levelColor[activeSkill.level] || levelColor.Intermediate).text,
                              background: (levelColor[activeSkill.level] || levelColor.Intermediate).bg,
                              padding: '2px 8px', borderRadius: 20,
                              border: `1px solid ${(levelColor[activeSkill.level] || levelColor.Intermediate).ring}40`
                            }}
                          >
                            {activeSkill.level}
                          </span>
                        </div>
                      </div>
                    </div>

                    {activeSkill.description && (
                      <div>
                        <p className="sk-section-label">About</p>
                        <p className="sk-desc-card">{activeSkill.description}</p>
                      </div>
                    )}

                    {activeSkill.relatedTools && activeSkill.relatedTools.length > 0 && (
                      <div>
                        <p className="sk-section-label">Ecosystem</p>
                        <div className="sk-tags">
                          {activeSkill.relatedTools.map((t, idx) => {
                            const toolColors = ['#3b82f6','#10b981','#8b5cf6','#f59e0b','#06b6d4','#ef4444','#ec4899'];
                            const col = toolColors[idx % toolColors.length];
                            return (
                              <span
                                key={`${t}-${idx}`}
                                className="sk-tag"
                                style={{ color: col, background: `${col}12`, borderColor: `${col}30` }}
                              >
                                {t}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {activeSkill.projects && activeSkill.projects.length > 0 && (
                      <div>
                        <p className="sk-section-label">Used in</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {activeSkill.projects.map((p, idx) => (
                            <div key={`${p}-${idx}`} className="sk-project-row">
                              <Layers size={14} />{p}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <AnimatePresence>
                    {isSkillScrollable && !hasSkillScrolled && (
                      <motion.div className="sk-scroll-hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                        <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: '2px' }}>Scroll</span>
                          <ChevronDown size={16} />
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </>,
        document.body
      )}
    </ScrollReveal>
  );
}
