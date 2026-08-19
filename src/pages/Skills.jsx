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

        /* ============ MOBILE — category card grid ============ */
        @media (max-width: 900px) {

          /* No-scroll host — fills the box the .text-content gives us */
          .skills-mobile-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
            width: 100%;
          }

          /* Each category card */
          .sk-cat-card {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 10px 8px 8px;
            display: flex;
            flex-direction: column;
            gap: 6px;
            cursor: pointer;
            text-align: left;
            outline: none;
            transition: background .15s;
            position: relative;
            overflow: hidden;
          }
          .sk-cat-card:active { background: var(--bg-primary); transform: scale(0.97); }

          /* accent stripe at top */
          .sk-cat-stripe {
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 3px;
            border-radius: 18px 18px 0 0;
          }

          .sk-cat-icon-box {
            width: 24px; height: 24px; border-radius: 6px;
            display: flex; align-items: center; justify-content: center;
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            color: var(--primary-blue);
            flex-shrink: 0;
          }

          .sk-cat-name {
            font-size: 10px; font-weight: 700;
            color: var(--text-primary);
            margin: 0; line-height: 1.25;
          }

          .sk-cat-meta {
            display: flex; align-items: center;
            justify-content: space-between;
          }

          .sk-cat-count {
            font-size: 11px; font-weight: 600;
            color: var(--text-secondary);
          }

          /* Mini skill tags preview */
          .sk-cat-preview-tags {
            display: flex; gap: 4px; flex-wrap: wrap; margin-top: 5px;
          }
          .sk-cat-preview-tag {
            font-size: 8.5px; font-weight: 700;
            padding: 1.5px 6px; border-radius: 6px;
            background: var(--bg-primary); border: 1px solid var(--border-color);
            color: var(--text-secondary); white-space: nowrap;
          }

          /* "Currently Exploring" spans full width */
          .sk-cat-card--full {
            grid-column: 1 / -1;
            flex-direction: row;
            align-items: center;
            gap: 14px;
          }
          .sk-cat-card--full .sk-cat-icon-box { flex-shrink: 0; }
          .sk-cat-card--full .sk-cat-name { font-size: 13px; }

          /* Mobile Top Mastery Highlights */
          .sk-mob-mastery-wrap {
            margin-top: 14px;
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 18px;
            padding: 14px;
          }
          .sk-mob-mastery-title {
            font-size: 10px; font-weight: 800; text-transform: uppercase;
            letter-spacing: .08em; color: var(--text-muted);
            margin: 0 0 10px; display: flex; align-items: center; gap: 6px;
          }
          .sk-mob-mastery-grid {
            display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
          }
          .sk-mob-mastery-item {
            background: var(--bg-primary); border: 1px solid var(--border-color);
            border-radius: 12px; padding: 8px 10px;
            display: flex; flex-direction: column; gap: 4px;
          }
          .sk-mob-mastery-header {
            display: flex; justify-content: space-between; align-items: center;
          }
          .sk-mob-mastery-name {
            font-size: 11px; font-weight: 700; color: var(--text-primary);
          }
          .sk-mob-mastery-pct {
            font-size: 10px; font-weight: 800; color: var(--primary-blue);
          }
          .sk-mob-mastery-bar {
            height: 3.5px; border-radius: 2px;
            background: var(--border-color); overflow: hidden;
          }
          .sk-mob-mastery-fill {
            height: 100%; border-radius: 2px;
            background: linear-gradient(90deg, var(--primary-blue), #10b981);
          }

          /* ============ SHARED SHEET CHROME ============ */
          .sk-sheet-overlay {
            position: fixed; inset: 0;
            background: rgba(0,0,0,.55);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            will-change: opacity, backdrop-filter; transform: translateZ(0);
            z-index: 1000;
          }
          @media (max-width: 900px) {
            .sk-sheet-overlay {
              backdrop-filter: none !important;
              -webkit-backdrop-filter: none !important;
              background: rgba(0,0,0,.7) !important;
            }
          }
          .sk-sheet {
            position: fixed; bottom: 0; left: 0; right: 0;
            background: var(--bg-secondary);
            border-top-left-radius: 28px;
            border-top-right-radius: 28px;
            z-index: 1001;
            display: flex; flex-direction: column;
            will-change: transform; transform: translateZ(0); backface-visibility: hidden;
            box-shadow: 0 -10px 50px rgba(0,0,0,.15);
          }
          .sk-sheet--cat   { height: 72vh; height: 72dvh; }
          .sk-sheet--skill { height: 80vh; height: 80dvh; }

          .sk-sheet-handle {
            width: 36px; height: 4px;
            background: var(--border-color);
            border-radius: 2px;
            margin: 12px auto 0 auto; flex-shrink: 0;
          }
          .sk-sheet-header {
            display: flex; align-items: center; justify-content: space-between;
            padding: 10px 12px 8px;
            border-bottom: 1px solid var(--border-color);
            flex-shrink: 0;
          }
          .sk-sheet-header-left {
            display: flex; align-items: center; gap: 8px;
          }
          .sk-sheet-header-left h2 {
            font-size: 14px; font-weight: 700;
            color: var(--text-primary); margin: 0;
          }
          .sk-sheet-close {
            width: 22px; height: 22px; border-radius: 11px;
            background: var(--bg-primary); border: 1px solid var(--border-color);
            display: flex; align-items: center; justify-content: center;
            color: var(--text-secondary); cursor: pointer; flex-shrink: 0;
          }
          .sk-sheet-body {
            flex: 1; overflow-y: auto; padding: 0;
            display: flex; flex-direction: column;
          }
          .sk-sheet-body::-webkit-scrollbar { display: none; }

          /* ============ CATEGORY SHEET — skill rows ============ */
          .sk-skill-group-label {
            font-size: 11px; font-weight: 700;
            color: var(--text-secondary);
            text-transform: uppercase; letter-spacing: .06em;
            padding: 12px 14px 6px; flex-shrink: 0;
          }
          .sk-skills-card {
            margin: 0 14px 14px;
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: 14px; overflow: hidden;
          }
          .sk-skill-row {
            display: flex; align-items: center;
            justify-content: space-between;
            padding: 6px 8px;
            border-bottom: 1px solid var(--border-color);
            background: transparent;
            border-left: none; border-right: none; border-top: none;
            width: 100%; text-align: left; cursor: pointer;
            gap: 6px; transition: background .15s;
          }
          .sk-skill-row:last-child { border-bottom: none; }
          .sk-skill-row:active { background: var(--bg-secondary); }
          .sk-skill-row-left { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
          .sk-skill-row-icon {
            width: 24px; height: 24px; border-radius: 6px;
            display: flex; align-items: center; justify-content: center;
            flex-shrink: 0;
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            font-size: 8px; font-weight: 800; letter-spacing: -.5px;
            color: var(--text-secondary); font-family: inherit;
          }
          .sk-skill-row-text { flex: 1; min-width: 0; }
          .sk-skill-row-text h4 {
            font-size: 11px; font-weight: 600;
            color: var(--text-primary); margin: 0 0 2px;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          }
          .sk-skill-row-text p {
            font-size: 9px; color: var(--text-secondary); margin: 0;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          }
          .sk-skill-row-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
          .sk-level-badge {
            font-size: 9px; font-weight: 700;
            padding: 2px 6px; border-radius: 20px; white-space: nowrap;
          }
          .sk-bar-mini {
            width: 44px; height: 4px;
            background: var(--border-color); border-radius: 2px; overflow: hidden;
          }
          .sk-bar-mini-fill { height: 100%; border-radius: 2px; }

          /* ============ SKILL DETAIL SHEET ============ */
          .sk-detail-body {
            flex: 1; overflow-y: auto;
            padding: 10px; display: flex; flex-direction: column; gap: 10px;
          }
          .sk-detail-body::-webkit-scrollbar { display: none; }

          .sk-detail-hero {
            display: flex; align-items: center; gap: 10px;
            padding: 10px;
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: 12px;
          }
          .sk-ring-wrap { position: relative; flex-shrink: 0; }
          .sk-ring-label {
            position: absolute; inset: 0;
            display: flex; flex-direction: column;
            align-items: center; justify-content: center; pointer-events: none;
          }
          .sk-ring-pct  { font-size: 14px; font-weight: 800; color: var(--text-primary); line-height: 1; }
          .sk-ring-sub  { font-size: 8px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: .04em; }
          .sk-meta-list { flex: 1; display: flex; flex-direction: column; gap: 9px; }
          .sk-meta-row  { display: flex; align-items: center; gap: 7px; font-size: 11px; color: var(--text-secondary); }
          .sk-meta-row svg  { color: var(--text-muted); flex-shrink: 0; }
          .sk-meta-row strong { color: var(--text-primary); font-weight: 700; }

          .sk-section-label {
            font-size: 11px; font-weight: 700;
            color: var(--text-secondary); text-transform: uppercase;
            letter-spacing: .06em; margin: 0 0 8px;
          }
          .sk-desc-card {
            font-size: 11.5px; line-height: 1.6;
            color: var(--text-secondary);
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: 12px; padding: 10px 12px; margin: 0;
          }
          .sk-tags { display: flex; flex-wrap: wrap; gap: 7px; }
          .sk-tag {
            font-size: 9px; font-weight: 600;
            padding: 4px 8px; border-radius: 20px;
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            color: var(--text-secondary);
          }
          .sk-project-row {
            display: flex; align-items: center; gap: 8px;
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
          <div>
            {/* Mobile Skills Search Bar */}
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Quick search skills (e.g. Python, SQL)..."
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

            {/* Mobile Category Grid */}
            <div className="skills-mobile-grid">
              {skillCategories.map((category, idx) => {
                const Icon = categoryIconMap[category.id] || categoryIconMap.languages;
                const isFull = category.id === 'exploring';
                const stripes = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#6366f1'];
                const stripe = stripes[idx % stripes.length];
                const topSkillNames = category.skills.slice(0, 3).map(s => s.name);

                return (
                  <button
                    key={category.id}
                    className={`sk-cat-card${isFull ? ' sk-cat-card--full' : ''}`}
                    style={isFull ? { gridColumn: '1 / -1' } : {}}
                    onClick={() => setActiveCategory(category)}
                  >
                    <div className="sk-cat-stripe" style={{ background: stripe }} />
                    <div className="sk-cat-icon-box" style={{ color: stripe }}>
                      <Icon size={18} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="sk-cat-name">{category.title}</p>
                      <div className="sk-cat-preview-tags">
                        {topSkillNames.map(name => (
                          <span key={name} className="sk-cat-preview-tag">{name}</span>
                        ))}
                        {category.skills.length > 3 && (
                          <span className="sk-cat-preview-tag" style={{ color: stripe, fontWeight: 800 }}>+{category.skills.length - 3}</span>
                        )}
                      </div>
                    </div>
                    {!isFull && (
                      <ChevronRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Mobile Top Mastery Highlights Bento */}
            <div className="sk-mob-mastery-wrap">
              <p className="sk-mob-mastery-title">
                <Star size={11} style={{ color: '#f59e0b' }} />
                Top Technical Proficiencies
              </p>
              <div className="sk-mob-mastery-grid">
                {[
                  { name: 'Python', pct: 90, col: '#3b82f6' },
                  { name: 'React', pct: 88, col: '#06b6d4' },
                  { name: 'PyTorch / ML', pct: 85, col: '#8b5cf6' },
                  { name: 'PostgreSQL / SQL', pct: 82, col: '#10b981' }
                ].map(item => (
                  <div key={item.name} className="sk-mob-mastery-item">
                    <div className="sk-mob-mastery-header">
                      <span className="sk-mob-mastery-name">{item.name}</span>
                      <span className="sk-mob-mastery-pct" style={{ color: item.col }}>{item.pct}%</span>
                    </div>
                    <div className="sk-mob-mastery-bar">
                      <div className="sk-mob-mastery-fill" style={{ width: `${item.pct}%`, background: item.col }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
                  transition={isMobile ? { type: 'tween', ease: [0.16, 1, 0.3, 1], duration: 0.38 } : { type: 'spring', damping: 32, stiffness: 350, mass: 0.9 }}
                >
                  <div className="sk-sheet-handle" />
                  <div className="sk-sheet-header">
                    <div className="sk-sheet-header-left">
                      <h2>{activeCategory.title}</h2>
                    </div>
                    <button className="sk-sheet-close" onClick={() => setActiveCategory(null)}>
                      <X size={16} />
                    </button>
                  </div>

                  <div className="sk-sheet-body" ref={catSheetRef} onScroll={e => { if(e.target.scrollTop > 10 && !hasCatScrolled) setHasCatScrolled(true); }}>
                    <div className="sk-skill-group-label">{activeCategory.skills.length} skills in this category</div>
                    <div className="sk-skills-card">
                      {activeCategory.skills.map(skill => {
                        const lc = levelColor[skill.level] || levelColor.Intermediate;
                        return (
                          <button key={skill.id} className="sk-skill-row" onClick={() => setActiveSkill(skill)}>
                            <div className="sk-skill-row-left">
                              <div className="sk-skill-row-icon">{skill.name.slice(0,2).toUpperCase()}</div>
                              <div className="sk-skill-row-text">
                                <h4>{skill.name}</h4>
                                <p>{skill.description ? (skill.description.length > 48 ? skill.description.slice(0, 48) + '...' : skill.description) : ''}</p>
                              </div>
                            </div>
                            <div className="sk-skill-row-right">
                              <span className="sk-level-badge" style={{ background: lc.bg, color: lc.text }}>{skill.level}</span>
                              <div className="sk-bar-mini">
                                <div className="sk-bar-mini-fill" style={{ width: skill.percent + '%', background: lc.ring }} />
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
                  transition={isMobile ? { type: 'tween', ease: [0.16, 1, 0.3, 1], duration: 0.38 } : { type: 'spring', damping: 32, stiffness: 350, mass: 0.9 }}
                >
                  <div className="sk-sheet-handle" />
                  <div className="sk-sheet-header">
                    <div className="sk-sheet-header-left">
                      <button
                        onClick={() => setActiveSkill(null)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 600, fontSize: 13, padding: 0 }}
                      >
                        <ChevronLeft size={16} />
                        Back
                      </button>
                      <h2 style={{ marginLeft: 4 }}>{activeSkill.name}</h2>
                    </div>
                    <button className="sk-sheet-close" onClick={() => { setActiveSkill(null); }}>
                      <X size={16} />
                    </button>
                  </div>

                  <div className="sk-detail-body" ref={skillSheetRef} onScroll={e => { if(e.target.scrollTop > 10 && !hasSkillScrolled) setHasSkillScrolled(true); }}>
                    {/* Hero ring */}
                    <div className="sk-detail-hero">
                      <div className="sk-ring-wrap">
                        <ProgressRing
                          percent={activeSkill.percent}
                          color={(levelColor[activeSkill.level] || levelColor.Intermediate).ring}
                          size={82}
                        />
                        <div className="sk-ring-label">
                          <span className="sk-ring-pct">{activeSkill.percent}%</span>
                          <span className="sk-ring-sub">mastery</span>
                        </div>
                      </div>
                      <div className="sk-meta-list">
                        <div className="sk-meta-row">
                          <Clock size={13} />
                          <span><strong>{String(activeSkill.years || '0').replace(/(\s*yrs?)+$/i, '')} yrs</strong> experience</span>
                        </div>
                        <div className="sk-meta-row">
                          <Briefcase size={13} />
                          <span><strong>{activeSkill.projectCount}+</strong> projects</span>
                        </div>
                        <div className="sk-meta-row">
                          <Star size={13} />
                          <span>
                            <strong style={{ color: (levelColor[activeSkill.level] || levelColor.Intermediate).text }}>
                              {activeSkill.level}
                            </strong>
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
                          {activeSkill.relatedTools.map((t, idx) => <span key={`${t}-${idx}`} className="sk-tag">{t}</span>)}
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
