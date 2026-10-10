// src/pages/Skills.jsx
// Mobile: SkillsMobile — continuous donut + category pills (no scroll) → slide-up category sheet → SkillDetailDrawer
// Desktop: unchanged 2-col card grid

import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronDown, Star, Layers, Clock, Briefcase, ChevronLeft, Loader2, LayoutGrid, PieChart, Search } from 'lucide-react';
import { ScrollReveal, SkillTooltip, RollingText } from '../components';
import { categoryIconMap } from '../components/ui/skillIcons';
import SkillDetailDrawer from '../components/ui/SkillDetailDrawer';
import CategorySheet from './CategorySheet';
import SkillsMobile, { toMobileCategories } from './SkillsMobile';
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
          <Star size={13} style={{ color: 'var(--primary-blue)', fill: 'var(--primary-blue)' }} />
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
          const tools = Array.isArray(skill.relatedTools) ? skill.relatedTools.slice(0, 3) : [];

          return (
            <div
              key={skill.id || skill.name}
              className="sk-prof-feat-slide"
            >
              {/* Top metadata pill row */}
              <div className="sk-prof-feat-top-row">
                <span className="sk-prof-feat-badge">
                  ⚡ {skill.level}
                </span>
                <span className="sk-prof-feat-pct">
                  {skill.percent}% Mastery
                </span>
              </div>

              {/* Skill identity header */}
              <div className="sk-prof-feat-identity">
                <div className="sk-prof-feat-icon">
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
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <button
                  className="sk-prof-feat-action"
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
            className={`sk-prof-feat-dot ${idx === activeIdx ? 'active' : ''}`}
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
  const [activeTab, setActiveTab] = useState('categories'); // 'categories' | 'skills'
  const [activeCategory, setActiveCategory] = useState(null);  // category object
  const [activeSkill,    setActiveSkill]    = useState(null);  // skill object
  const [desktopView, setDesktopView] = useState('grid'); // 'grid' | 'radar'
  const [desktopDrawer, setDesktopDrawer] = useState(null); // { skill, categoryId } — desktop slide-over
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

  const mobileCategories = useMemo(() => toMobileCategories(skillCategories), [skillCategories]);

  // Per-skill slide-over drawer (shared by desktop and mobile)
  const drawerCatIdx = desktopDrawer ? skillCategories.findIndex(c => c.id === desktopDrawer.categoryId) : -1;
  const drawerCat = drawerCatIdx >= 0 ? skillCategories[drawerCatIdx] : null;
  // Re-resolve the skill from live data so realtime updates are reflected
  const drawerSkill = drawerCat ? (drawerCat.skills.find(s => s.id === desktopDrawer.skill.id) || desktopDrawer.skill) : null;
  const skillDrawer = (
    <SkillDetailDrawer
      skill={drawerSkill}
      category={drawerCat}
      onClose={() => setDesktopDrawer(null)}
      onNavigate={(s) => setDesktopDrawer(d => (d ? { ...d, skill: s } : d))}
    />
  );

  const [mobileCatIdx, setMobileCatIdx] = useState(null);
  const isSheetOpen = mobileCatIdx !== null;
  const nCats = mobileCategories.length;

  // ── Mobile: donut + pills + slide-up category sheet ──
  if (isMobile) {
    return (
      <>
        <SkillsMobile
          categories={mobileCategories}
          selectedKey={isSheetOpen ? mobileCategories[mobileCatIdx]?.key : null}
          onSelectCategory={(cat, i) => setMobileCatIdx(i)}
        />
        <CategorySheet
          category={isSheetOpen ? mobileCategories[mobileCatIdx] : null}
          open={isSheetOpen}
          onClose={() => setMobileCatIdx(null)}
          onPrev={() => setMobileCatIdx((i) => (i + nCats - 1) % nCats)}
          onNext={() => setMobileCatIdx((i) => (i + 1) % nCats)}
          onSelectSkill={(skill, cat) => {
            const resolvedSkill = skill.raw || skill;
            const categoryId = cat?.source?.id || cat?.key;
            setDesktopDrawer({ skill: resolvedSkill, categoryId });
          }}
        />
        {skillDrawer}
      </>
    );
  }

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

          /* Mobile Container — fixed full height */
          .sk-mob-container {
            display: flex;
            flex-direction: column;
            height: 100%;
            overflow: hidden;
            box-sizing: border-box;
            padding-bottom: 2px;
          }

          /* Hero header */
          .sk-mob-header {
            text-align: center;
            margin-bottom: 8px;
            flex-shrink: 0;
          }
          .sk-mob-eyebrow {
            font-size: 9.5px; font-weight: 800; letter-spacing: .22em;
            text-transform: uppercase; color: var(--text-muted);
            margin: 0 0 3px;
          }
          .sk-mob-title {
            font-size: 20px; font-weight: 800; color: var(--text-primary);
            margin: 0 0 3px; letter-spacing: -0.025em; line-height: 1.2;
          }
          .sk-mob-subtitle {
            font-size: 11.5px; color: var(--text-secondary);
            margin: 0; line-height: 1.4;
          }

          /* Quick stats divider row */
          .sk-stats-divider-row {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            margin-bottom: 8px;
            padding: 4px 0;
            flex-shrink: 0;
          }
          .sk-stat-col {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 2px;
            padding: 2px 4px;
          }
          .sk-stat-col:not(:last-child) {
            border-right: 1px solid var(--border-color);
          }
          .sk-stat-num {
            font-size: 16px;
            font-weight: 800;
            line-height: 1.1;
          }
          .sk-stat-lbl {
            font-size: 9px;
            font-weight: 700;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: .06em;
          }

          /* View Tab Toggle */
          /* Centered toggle wrapper */
          .sk-tab-toggle-wrap {
            display: flex;
            justify-content: center;
            margin-bottom: 8px;
            flex-shrink: 0;
            width: 100%;
          }

          /* Compact capsule track */
          .sk-tab-toggle {
            display: inline-flex;
            align-items: center;
            position: relative;
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 999px;
            padding: 3px;
            gap: 2px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
          }

          [data-theme="dark"] .sk-tab-toggle {
            background: rgba(255, 255, 255, 0.04);
            border-color: rgba(255, 255, 255, 0.08);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          }

          /* Individual tab button */
          .sk-tab-btn {
            position: relative;
            border: none;
            cursor: pointer;
            background: transparent;
            border-radius: 999px;
            padding: 5px 14px;
            font-size: 11.5px;
            font-weight: 500;
            color: var(--text-muted);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            transition: color 0.2s ease;
            -webkit-tap-highlight-color: transparent;
            outline: none;
            z-index: 1;
          }

          .sk-tab-btn-content {
            position: relative;
            z-index: 2;
            display: inline-flex;
            align-items: center;
            gap: 6px;
          }

          .sk-tab-btn--active {
            color: var(--text-primary);
            font-weight: 600;
          }

          .sk-tab-btn--active .sk-tab-icon {
            color: var(--primary-blue);
          }

          /* Floating elevated pill background */
          .sk-tab-pill-bg {
            position: absolute;
            inset: 0;
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: 999px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04);
            z-index: 1;
          }

          [data-theme="dark"] .sk-tab-pill-bg {
            background: rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 255, 255, 0.12);
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
          }

          /* Tab content area */
          .sk-tab-content {
            flex: 1;
            min-height: 0;
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }

          /* Category cards 2-col bento grid */
          .skills-mobile-list {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
            flex: 1;
            min-height: 0;
            align-content: stretch;
          }

          /* Base category card */
          .sk-cat-card {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 14px;
            padding: 10px 10px 8px;
            display: flex; flex-direction: column;
            gap: 6px;
            cursor: pointer;
            text-align: left;
            outline: none;
            position: relative;
            overflow: hidden;
            min-height: 0;
            -webkit-tap-highlight-color: transparent;
            transition: border-color 0.2s;
          }
          .sk-cat-card:active { transform: scale(0.972); }

          /* Full-width card (Exploring) */
          .sk-cat-card--full {
            grid-column: 1 / -1;
            flex-direction: row;
            align-items: center;
            min-height: 0;
            padding: 8px 12px;
            gap: 10px;
          }
          .sk-cat-card--full .sk-cat-icon-box { flex-shrink: 0; }
          .sk-cat-card--full .sk-cat-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }


          .sk-cat-icon-box {
            width: 28px; height: 28px; border-radius: 8px;
            display: flex; align-items: center; justify-content: center;
            border: 1px solid var(--border-color);
            background: var(--bg-primary);
            color: var(--primary-blue);
            flex-shrink: 0;
            transition: all 0.2s ease;
          }
          [data-theme="dark"] .sk-cat-icon-box {
            background: rgba(255, 255, 255, 0.05);
            border-color: rgba(255, 255, 255, 0.1);
            color: var(--primary-blue);
          }
          .sk-cat-card:hover .sk-cat-icon-box,
          .sk-cat-card:active .sk-cat-icon-box {
            background: rgba(59, 130, 246, 0.1);
            border-color: rgba(59, 130, 246, 0.25);
          }
          .sk-cat-main { display: flex; flex-direction: column; gap: 6px; }
          .sk-cat-name {
            font-size: 12.5px; font-weight: 600;
            color: var(--text-primary);
            margin: 0; line-height: 1.25; letter-spacing: -0.01em;
          }
          .sk-cat-count-badge {
            font-size: 8.5px; font-weight: 500;
            padding: 1.5px 6px; border-radius: 6px;
            border: 1px solid var(--border-color);
            background: var(--bg-primary);
            color: var(--text-muted);
            margin-top: 2px;
            width: fit-content; display: inline-block;
          }
          .sk-cat-chevron {
            color: var(--text-muted); opacity: 0.5; flex-shrink: 0; margin-left: auto;
          }

          /* Clean single-track level bar */
          .sk-cat-level-row {
            display: flex; align-items: center; gap: 6px;
          }
          .sk-cat-level-bar {
            flex: 1; height: 3px; border-radius: 2px;
            background: var(--border-color); overflow: hidden;
          }
          .sk-cat-level-fill {
            height: 100%; border-radius: 2px;
            background: linear-gradient(90deg, var(--primary-blue), #10b981);
          }
          .sk-cat-level-text {
            font-size: 8.5px; font-weight: 500; color: var(--text-muted);
            white-space: nowrap;
          }

          /* Mini skill tags preview */
          .sk-cat-preview-tags {
            display: flex; gap: 4px; flex-wrap: wrap;
          }
          .sk-cat-preview-tag {
            font-size: 8.5px; font-weight: 500;
            padding: 1.5px 5.5px; border-radius: 5px;
            background: var(--bg-primary); border: 1px solid var(--border-color);
            color: var(--text-secondary); white-space: nowrap;
          }
          .sk-cat-preview-tag--more {
            color: var(--text-muted); font-weight: 600;
          }

          /* ============ TOP TECHNICAL PROFICIENCIES CAROUSEL ============ */
          .sk-mob-carousel-container {
            flex: 1;
            min-height: 0;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          .sk-prof-feat-wrapper {
            margin-top: 0;
            margin-bottom: 0;
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
            border: 1px solid var(--border-color);
            background: var(--bg-secondary);
            padding: 14px;
            position: relative;
            overflow: hidden;
            flex-shrink: 0;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            gap: 9px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.03);
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
            padding: 2.5px 8px;
            border: 1px solid rgba(16, 185, 129, 0.25);
            font-size: 8.5px;
            font-weight: 700;
            color: #10b981;
            background: rgba(16, 185, 129, 0.08);
          }
          .sk-prof-feat-pct {
            display: inline-flex;
            align-items: center;
            border-radius: 20px;
            padding: 2.5px 8px;
            border: 1px solid rgba(59, 130, 246, 0.25);
            font-size: 9px;
            font-weight: 700;
            color: var(--primary-blue);
            background: rgba(59, 130, 246, 0.08);
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
            border: 1px solid rgba(59, 130, 246, 0.25);
            background: rgba(59, 130, 246, 0.08);
            color: var(--primary-blue);
            flex-shrink: 0;
          }
          .sk-prof-feat-name {
            font-size: 15px;
            font-weight: 700;
            color: var(--text-primary);
            margin: 0 0 2px;
            letter-spacing: -0.015em;
          }
          .sk-prof-feat-meta {
            font-size: 10px;
            color: var(--text-muted);
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .sk-prof-feat-bar-wrap {
            margin: 2px 0;
          }
          .sk-prof-feat-bar {
            height: 4px;
            border-radius: 2px;
            background: var(--border-color);
            overflow: hidden;
          }
          .sk-prof-feat-fill {
            height: 100%;
            border-radius: 2px;
            background: linear-gradient(90deg, var(--primary-blue), #10b981);
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
            font-weight: 500;
            border-radius: 6px;
            padding: 2.5px 7px;
            border: 1px solid var(--border-color);
            background: var(--bg-primary);
            color: var(--text-secondary);
            white-space: nowrap;
          }
          .sk-prof-feat-action {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 10.5px;
            font-weight: 600;
            border-radius: 8px;
            padding: 5px 10px;
            border: 1px solid rgba(59, 130, 246, 0.25);
            background: rgba(59, 130, 246, 0.08);
            color: var(--primary-blue);
            cursor: pointer;
            transition: transform 0.15s, background 0.15s;
            -webkit-tap-highlight-color: transparent;
            flex-shrink: 0;
          }
          .sk-prof-feat-action:active {
            transform: scale(0.95);
            background: rgba(59, 130, 246, 0.15);
          }

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
            width: 5px;
            height: 5px;
            border-radius: 3px;
            background: var(--border-color);
            border: none;
            padding: 0;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .sk-prof-feat-dot.active {
            background: var(--primary-blue);
            width: 14px;
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
      <style>{`
        /* ── RollingText global styles ── */
        .rolling-text-root {
          display: inline-block;
          max-width: 100%;
          text-align: left;
          font-size: clamp(20px, 3vw, 32px);
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 1;
          text-transform: uppercase;
          --rolling-accent: var(--primary-blue, #007bff);
        }
      `}</style>

      <motion.div className="skills-page" style={{ height: '100%', overflow: isMobile ? 'auto' : 'hidden' }} variants={!isMobile ? containerVariants : undefined} initial={!isMobile ? "hidden" : undefined} animate={!isMobile ? "visible" : undefined}>

        {/* ── Rolling text section title (desktop only) ── */}
        {!isMobile && (
          <motion.div
            variants={!isMobile ? itemVariants : undefined}
            style={{ marginBottom: '-4px' }}
          >
            <RollingText
              text="MY SKILLS"
              speed={0.06}
              duration={3}
            />
          </motion.div>
        )}

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
                                  role="button"
                                  tabIndex={0}
                                  aria-haspopup="dialog"
                                  onClick={() => setDesktopDrawer({ skill, categoryId: category.id })}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      setDesktopDrawer({ skill, categoryId: category.id });
                                    }
                                  }}
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
        ) : null}
      </motion.div>

      {/* ── Desktop: per-skill slide-over drawer ── */}
      {skillDrawer}

          </ScrollReveal>
  );
}
