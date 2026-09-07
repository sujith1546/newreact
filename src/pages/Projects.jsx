import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ScrollReveal } from '../components';
import { ChevronLeft, ChevronRight, ExternalLink, Zap, Brain, Code2, Database, Sparkles, Search, X, Star } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { motion } from 'framer-motion';
import useRealtimeData from '../hooks/useRealtimeData';

// Modular Sub-Components
import ProjectSkeleton from '../components/projects/ProjectSkeleton';
import ProjectCard from '../components/projects/ProjectCard';
import ProjectModal from '../components/projects/ProjectModal';

function getProjectCategory(project) {
  if (project?.category) return project.category;
  const tagsStr = (project?.tags || []).join(" ").toLowerCase();
  const titleStr = (project?.title || "").toLowerCase();
  if (tagsStr.includes("rag") || tagsStr.includes("gemini") || tagsStr.includes("llm") || titleStr.includes("rag") || titleStr.includes("sms")) return "AI & ML";
  if (tagsStr.includes("nlp") || tagsStr.includes("finbert") || tagsStr.includes("sentiment") || titleStr.includes("sentiment")) return "AI & ML";
  if (tagsStr.includes("xgboost") || tagsStr.includes("lightgbm") || tagsStr.includes("scikit") || tagsStr.includes("machine learning") || titleStr.includes("defect") || titleStr.includes("vision")) return "AI & ML";
  if (tagsStr.includes("react") || tagsStr.includes("fastapi") || tagsStr.includes("supabase") || tagsStr.includes("portfolio")) return "Full Stack";
  return "Data Science";
}

function getBadgeTheme(category = '') {
  const c = category.toLowerCase();
  if (c.includes('ai') || c.includes('ml') || c.includes('nlp')) return 'purple';
  if (c.includes('full') || c.includes('stack') || c.includes('web')) return 'blue';
  return 'green';
}

/* ─── Mobile Featured-Projects Carousel (Education snap-card mirror) ─── */
function MobileCarousel({ projects, onOpen }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const trackRef = useRef(null);

  const handleScroll = () => {
    if (!trackRef.current) return;
    const { scrollLeft, offsetWidth } = trackRef.current;
    const card = trackRef.current.querySelector('.mpj-feat-slide');
    const cardWidth = card ? card.offsetWidth + 12 : offsetWidth * 0.85;
    const idx = Math.round(scrollLeft / cardWidth);
    setActiveIdx(Math.min(Math.max(0, idx), projects.length - 1));
  };

  const scrollTo = (idx) => {
    if (!trackRef.current) return;
    const cards = trackRef.current.querySelectorAll('.mpj-feat-slide');
    if (cards[idx]) {
      cards[idx].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
      setActiveIdx(idx);
    }
  };

  if (projects.length === 0) return null;

  return (
    <div>
      {/* Header with Title & Controls matching Education */}
      <div className="mpj-mobile-header">
        <div className="mpj-mobile-title-wrap">
          <div className="mpj-mobile-icon-box">
            <Sparkles size={15} />
          </div>
          <div>
            <h2 className="mpj-mobile-heading">Featured Projects</h2>
            <p className="mpj-mobile-sub">Production apps &amp; intelligent systems</p>
          </div>
        </div>
        <div className="mpj-mobile-controls">
          <span className="mpj-mobile-counter">
            {activeIdx + 1} / {projects.length}
          </span>
          <button
            className="mpj-nav-btn"
            onClick={() => scrollTo(Math.max(0, activeIdx - 1))}
            disabled={activeIdx === 0}
            aria-label="Previous project"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            className="mpj-nav-btn"
            onClick={() => scrollTo(Math.min(projects.length - 1, activeIdx + 1))}
            disabled={activeIdx === projects.length - 1}
            aria-label="Next project"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Horizontal snap-scroll track */}
      <div className="mpj-feat-track" ref={trackRef} onScroll={handleScroll}>
        {projects.map((project, i) => {
          const category = getProjectCategory(project);
          const badgeTheme = getBadgeTheme(category);

          const techTags = Array.isArray(project.tags)
            ? project.tags.slice(0, 4)
            : typeof project.tags === 'string'
            ? project.tags.split(',').slice(0, 4).map(t => t.trim())
            : [];

          // Category icon
          const CategoryIcon = category === 'AI & ML' ? Brain : category === 'Full Stack' ? Code2 : Database;

          // Metric or score badge
          const metricMatch = (project.description || '').match(/(\d+[%.+k]+)/i);
          const metric = project.stats?.[0]?.value || (metricMatch ? metricMatch[1] : null);
          const hasScore = Boolean(metric || project.liveUrl);
          const scoreText = metric ? metric : (project.liveUrl ? 'Live' : null);

          // Subtitle / Architecture summary
          const subText = project.subtitle || (techTags.length >= 2 ? `${techTags[0]} · ${techTags[1]}` : category);

          return (
            <div
              key={project.id || project.title || i}
              className="mpj-feat-slide"
              onClick={() => onOpen(project)}
            >
              {/* Top Row: Category Badge + Score/Metric Badge */}
              <div className="mpj-feat-top-row">
                <div className={`mpj-feat-badge mpj-feat-badge--${badgeTheme}`}>
                  <span className="mpj-badge-dot" />
                  {category}
                </div>
                {hasScore && (
                  <div className="mpj-feat-score">
                    <Star size={10} style={{ color: '#F59E0B' }} />
                    <span>{scoreText}</span>
                  </div>
                )}
              </div>

              {/* Title */}
              <h3 className="mpj-feat-title">{project.title}</h3>

              {/* Subtitle / Tech Spec */}
              <p className="mpj-feat-sub">
                <CategoryIcon size={10} style={{ flexShrink: 0 }} />
                <span>{subText}</span>
              </p>

              {/* Description (3 lines clamped) */}
              <p className="mpj-feat-desc">{project.description || ''}</p>

              {/* Tech Tags */}
              {techTags.length > 0 && (
                <div className="mpj-feat-tags">
                  {techTags.map(t => (
                    <span key={t} className="mpj-feat-tag">
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions Row */}
              <div className="mpj-feat-actions" onClick={(e) => e.stopPropagation()}>
                <div className="mpj-feat-links">
                  {project.githubUrl && (
                    <button
                      className="mpj-feat-icon-btn"
                      onClick={(e) => { e.stopPropagation(); window.open(project.githubUrl, '_blank', 'noopener,noreferrer'); }}
                      aria-label="GitHub Repository"
                      title="GitHub"
                    >
                      <FaGithub size={12} />
                    </button>
                  )}
                  {project.liveUrl && (
                    <button
                      className="mpj-feat-icon-btn"
                      onClick={(e) => { e.stopPropagation(); window.open(project.liveUrl, '_blank', 'noopener,noreferrer'); }}
                      aria-label="Live Demo"
                      title="Live Demo"
                    >
                      <ExternalLink size={12} />
                    </button>
                  )}
                </div>

                <button
                  className="mpj-feat-action-btn"
                  onClick={() => onOpen(project)}
                >
                  <span>View Case Study</span>
                  <ChevronRight size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination dots */}
      <div className="mpj-feat-dots">
        {projects.map((p, idx) => (
          <button
            key={p.id || p.title || idx}
            className={`mpj-feat-dot ${idx === activeIdx ? 'active' : ''}`}
            onClick={() => scrollTo(idx)}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function Projects() {
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth <= 900);
  const { data: projectsData, loading } = useRealtimeData('projects', { orderColumn: 'created_at', ascending: true, disableRealtime: true });
  
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const categories = ['All', 'AI & ML', 'Full Stack', 'Data Science'];

  const filteredProjects = useMemo(() => {
    return (projectsData || []).filter(project => {
      const cat = getProjectCategory(project);
      const matchesCategory =
        activeCategory === 'All' ||
        cat.toLowerCase() === activeCategory.toLowerCase() ||
        (project.tags && project.tags.some(t => t.toLowerCase().includes(activeCategory.toLowerCase())));

      if (!searchQuery.trim()) return matchesCategory;

      const q = searchQuery.toLowerCase();
      const matchesQuery =
        (project.title && project.title.toLowerCase().includes(q)) ||
        (project.description && project.description.toLowerCase().includes(q)) ||
        (project.tags && project.tags.some(t => t.toLowerCase().includes(q))) ||
        cat.toLowerCase().includes(q);

      return matchesCategory && matchesQuery;
    });
  }, [projectsData, activeCategory, searchQuery]);



  return (
    <ScrollReveal className="wide-content">
      <style>{`
        /* ========== LIVE BADGE ========== */
        .live-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3.5px 8px 3.5px 6px;
          background: rgba(16,185,129,.1);
          border: 1px solid rgba(16,185,129,.15);
          border-radius: 12px; font-size: 9px; font-weight: 800;
          letter-spacing: .06em; text-transform: uppercase; color: #10b981;
          box-shadow: 0 2px 6px rgba(16,185,129,.05);
          flex-shrink: 0;
        }
        [data-theme="dark"] .live-badge { background: rgba(16,185,129,.15); border-color: rgba(16,185,129,.2); }
        .live-dot { position: relative; display: flex; width: 6px; height: 6px; }
        .live-dot-core { position: relative; display: inline-flex; border-radius: 50%; height: 6px; width: 6px; background: #10b981; z-index: 2; box-shadow: 0 0 4px rgba(16,185,129,.6); }
        .live-ping { position: absolute; display: inline-flex; height: 100%; width: 100%; border-radius: 50%; background: #10b981; opacity: .8; animation: radarPing 2s cubic-bezier(0,0,.2,1) infinite; z-index: 1; }
        @keyframes radarPing { 75%, 100% { transform: scale(2.8); opacity: 0; } }

        /* ========== METRICS BANNER ========== */
        .pm-metrics-banner {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px;
          margin-bottom: 24px;
        }
        .pm-metric-card {
          background: var(--bg-secondary); border: 1px solid var(--border-color);
          border-radius: 16px; padding: 14px 16px; display: flex; align-items: center; gap: 14px;
          box-shadow: 0 2px 10px rgba(0,0,0,.02); transition: transform .2s ease, border-color .2s ease;
        }
        .pm-metric-card:hover { transform: translateY(-2px); border-color: var(--primary-blue); }
        .pm-metric-icon-wrap {
          width: 42px; height: 42px; border-radius: 12px; border: 1px solid;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .pm-metric-info { display: flex; flex-direction: column; gap: 2px; }
        .pm-metric-val-row { display: flex; align-items: center; gap: 8px; }
        .pm-metric-value { font-size: 22px; font-weight: 800; color: var(--text-primary); line-height: 1; }
        .pm-metric-badge { font-size: 9px; font-weight: 800; text-transform: uppercase; padding: 2px 6px; border-radius: 10px; border: 1px solid; }
        .pm-metric-label { font-size: 11.5px; font-weight: 600; color: var(--text-secondary); }

        /* ========== SEARCH & FILTERS BAR ========== */
        .pf-container { margin-bottom: 28px; display: flex; flex-direction: column; gap: 14px; }
        .pf-search-row { display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; }
        .pf-search-input-wrap {
          position: relative; flex: 1; min-width: 260px; display: flex; align-items: center;
        }
        .pf-search-icon { position: absolute; left: 14px; color: var(--text-muted); pointer-events: none; }
        .pf-search-input {
          width: 100%; height: 44px; padding: 0 38px 0 40px; border-radius: 12px;
          background: var(--bg-secondary); border: 1px solid var(--border-color);
          color: var(--text-primary); font-size: 13.5px; font-weight: 500; outline: none;
          transition: border-color .2s, box-shadow .2s;
        }
        .pf-search-input:focus { border-color: var(--primary-blue); box-shadow: 0 0 0 3px rgba(59,130,246,.12); }
        .pf-search-clear { position: absolute; right: 12px; background: none; border: none; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; }

        .pf-view-toggle { display: flex; align-items: center; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 12px; padding: 3px; gap: 3px; }
        .pf-view-btn {
          display: flex; align-items: center; gap: 6px; padding: 7px 12px; border-radius: 9px;
          border: none; background: transparent; color: var(--text-secondary); font-size: 12px; font-weight: 600;
          cursor: pointer; transition: all .2s ease;
        }
        .pf-view-btn--active { background: var(--bg-primary); color: var(--text-primary); box-shadow: 0 2px 6px rgba(0,0,0,.06); font-weight: 700; }

        .pf-categories-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
        .pf-categories-list { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .pf-cat-pill {
          padding: 6px 14px; border-radius: 20px; border: 1px solid var(--border-color);
          background: var(--bg-secondary); color: var(--text-secondary); font-size: 12px; font-weight: 600;
          cursor: pointer; transition: all .2s;
        }
        .pf-cat-pill:hover { border-color: var(--primary-blue); color: var(--primary-blue); }
        .pf-cat-pill--active { background: var(--primary-blue); border-color: var(--primary-blue); color: #ffffff !important; font-weight: 700; box-shadow: 0 4px 12px rgba(59,130,246,.25); }
        .pf-results-count { font-size: 12px; color: var(--text-secondary); }

        /* ========== SKELETON LOADER ========== */
        .projects-skeleton-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
        .project-skeleton-card { background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 20px; height: 320px; overflow: hidden; display: flex; flex-direction: column; }
        .skeleton-image-area { height: 140px; background: linear-gradient(90deg, rgba(255,255,255,.05) 25%, rgba(255,255,255,.12) 50%, rgba(255,255,255,.05) 75%); background-size: 200% 100%; animation: skeletonShimmer 1.8s infinite; }
        .skeleton-content { padding: 18px; display: flex; flex-direction: column; gap: 12px; flex: 1; }
        .skeleton-title { width: 60%; height: 18px; border-radius: 6px; background: var(--border-color); }
        .skeleton-line { width: 100%; height: 12px; border-radius: 4px; background: var(--border-color); opacity: 0.6; }
        .skeleton-line--short { width: 80%; }
        .skeleton-tags { display: flex; gap: 6px; margin-top: auto; }
        .skeleton-tag { width: 50px; height: 20px; border-radius: 4px; background: var(--border-color); }
        @keyframes skeletonShimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        /* ========== DESKTOP GRID & CARDS ========== */
        .projects-header { margin-bottom: 24px; text-align: left; }
        .projects-header h1 { font-size: 28px; font-weight: 800; color: var(--text-primary); margin: 0 0 6px; letter-spacing: -.02em; }
        .projects-header p { font-size: 14.5px; color: var(--text-secondary); max-width: 620px; line-height: 1.5; margin: 0; }
        
        .projects-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(290px, 1fr)); gap: 22px; }
        /* ========== DESKTOP GRID & CARDS ========== */
        .projects-header { margin-bottom: 24px; text-align: left; }
        .projects-header h1 { font-size: 28px; font-weight: 800; color: var(--text-primary); margin: 0 0 6px; letter-spacing: -.02em; }
        .projects-header p { font-size: 14.5px; color: var(--text-secondary); max-width: 620px; line-height: 1.5; margin: 0; }
        
        .projects-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(310px, 1fr)); gap: 24px; }
        .project-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 18px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          position: relative;
          transition: transform .25s ease, border-color .25s ease, box-shadow .25s ease;
          box-shadow: 0 4px 16px rgba(0,0,0,.03);
          cursor: pointer;
          outline: none;
        }
        .project-card:focus-visible { border-color: var(--primary-blue); box-shadow: 0 0 0 3px rgba(59,130,246,.25); }
        .project-card:hover {
          transform: translateY(-4px);
          border-color: color-mix(in srgb, var(--primary-blue) 40%, var(--border-color));
          box-shadow: 0 14px 32px rgba(0,0,0,.08);
        }
        [data-theme="dark"] .project-card:hover {
          box-shadow: 0 14px 32px rgba(0,0,0,.35);
        }

        .pc-top-accent-line { position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, var(--primary-blue), #10b981); z-index: 2; opacity: 0.7; transition: opacity .3s; }
        .project-card:hover .pc-top-accent-line { opacity: 1; }
        
        .pc-category-tag {
          position: absolute; top: 12px; left: 12px; z-index: 5;
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 10px; border-radius: 8px;
          font-size: 11px; font-weight: 700;
          background: var(--bg-secondary);
          color: var(--primary-blue);
          border: 1px solid color-mix(in srgb, var(--primary-blue) 25%, transparent);
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          backdrop-filter: blur(8px);
        }
        
        .pc-title-arrow { display: inline-block; font-size: 14px; color: var(--primary-blue); opacity: 0.7; transition: transform .25s ease, opacity .25s ease; }
        .project-card:hover .pc-title-arrow { transform: translate(3px, -3px); opacity: 1; }

        .project-link--details {
          border: none; background: none; padding: 0; font-family: inherit; cursor: pointer;
          color: var(--primary-blue); font-weight: 700; display: inline-flex; align-items: center; gap: 4px;
        }
        .project-link--details:hover { opacity: 0.85; }

        .pc-mini-pipeline {
          background: color-mix(in srgb, var(--primary-blue) 4%, var(--bg-primary));
          border: 1px solid color-mix(in srgb, var(--primary-blue) 12%, var(--border-color));
          border-radius: 12px;
          padding: 10px 14px;
          margin-bottom: 14px;
        }
        .pc-pipeline-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
        .pc-pipeline-title { font-size: 9.5px; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: .06em; }
        .pc-stat-inline { font-size: 10px; font-weight: 700; color: #10b981; background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2); padding: 1.5px 6px; border-radius: 6px; }
        .pc-pipeline-steps {
          position: relative;
          width: 100%;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .pc-pipeline-steps::-webkit-scrollbar { display: none; }
        .pc-pipeline-steps-inner {
          display: flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
          width: max-content;
        }
        .pc-pipeline-step-chip { display: inline-flex; align-items: center; gap: 4px; font-size: 10.5px; font-weight: 700; color: var(--text-primary); background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 3px 9px; border-radius: 6px; white-space: nowrap; }
        .pc-step-icon { color: var(--primary-blue); }
        .pc-step-arrow { position: relative; display: inline-flex; align-items: center; justify-content: center; font-size: 10px; color: var(--text-muted); opacity: 0.6; padding: 0 4px; min-width: 14px; }
        .pc-pulse-dot {
          position: absolute; top: 50%; left: 0; width: 4px; height: 4px; margin-top: -2px; border-radius: 50%;
          background: var(--primary-blue); box-shadow: 0 0 6px var(--primary-blue);
          opacity: 0; pointer-events: none;
          animation: dataFlowPulse 2.2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          animation-play-state: paused;
        }
        .project-card:hover .pc-pulse-dot { animation-play-state: running; }

        @keyframes dataFlowPulse {
          0% { left: 0%; opacity: 0; transform: scale(0.6); }
          25% { opacity: 1; transform: scale(1.2); }
          75% { opacity: 1; transform: scale(1.2); }
          100% { left: 100%; opacity: 0; transform: scale(0.6); }
        }

        @media (prefers-reduced-motion: reduce) {
          .pc-pulse-dot { display: none !important; animation: none !important; }
        }

        .project-image-area {
          width: 100%; height: 160px;
          background: linear-gradient(120deg, #e0e7ff 0%, #dcfce7 100%);
          position: relative; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
          border-bottom: 1px solid var(--border-color); z-index: 1;
        }
        .project-image-area img {
          transition: transform 0.4s ease;
        }
        .project-card:hover .project-image-area img {
          transform: scale(1.04);
        }
        [data-theme="dark"] .project-image-area { background: linear-gradient(120deg,#1e1b4b 0%,#064e3b 100%); }
        .project-image-icon { color: rgba(0,0,0,.15); }
        [data-theme="dark"] .project-image-icon { color: rgba(255,255,255,.08); }
        
        .project-content { padding: 22px 22px 18px; display: flex; flex-direction: column; flex-grow: 1; z-index: 1; }
        .project-title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .project-title { font-size: 17.5px; font-weight: 800; color: var(--text-primary); margin: 0; letter-spacing: -.015em; }
        .project-desc {
          font-size: 13.5px; color: var(--text-secondary); line-height: 1.55; margin: 0 0 14px;
          display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; min-height: 62px;
        }
        .project-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: auto; margin-bottom: 16px; }
        .project-tag { font-size: 11px; font-weight: 600; padding: 3.5px 9.5px; background: color-mix(in srgb, var(--primary-blue) 8%, transparent); color: var(--primary-blue); border-radius: 6px; border: 1px solid color-mix(in srgb, var(--primary-blue) 20%, transparent); display: inline-flex; align-items: center; }
        
        .project-links {
          display: flex; align-items: center; justify-content: space-between;
          border-top: 1px solid var(--border-color); padding-top: 14px; margin-top: auto;
        }
        .pc-cta-pill {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 600;
          border: 1px solid var(--border-color); background: var(--bg-primary);
          color: var(--text-primary); cursor: pointer; transition: all 0.2s ease;
        }
        .pc-cta-pill:hover {
          background: var(--primary-blue); color: #ffffff;
          border-color: var(--primary-blue);
          box-shadow: 0 4px 12px rgba(59,130,246,0.25);
        }
        .project-links-right { display: flex; align-items: center; gap: 14px; }
        .project-link {
          display: flex; align-items: center; gap: 5px; font-size: 12.5px; font-weight: 600;
          color: var(--text-secondary); text-decoration: none; transition: color .2s ease;
        }
        .project-link:hover { color: var(--primary-blue); }
        .project-link--live { color: var(--primary-blue); }

        /* ========== PIPELINE VIEW STYLES ========== */
        .pp-pipeline-grid { display: flex; flex-direction: column; gap: 18px; }
        .pp-pipeline-card {
          background: var(--bg-secondary); border: 1px solid var(--border-color);
          border-radius: 20px; padding: 20px; cursor: pointer; transition: transform .2s, border-color .2s;
          display: flex; flex-direction: column; gap: 14px;
        }
        .pp-pipeline-card:hover { border-color: var(--primary-blue); transform: translateY(-2px); }
        .pp-card-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
        .pp-card-title { font-size: 17px; font-weight: 800; color: var(--text-primary); margin: 0 0 4px; }
        .pp-card-subtitle { font-size: 13px; color: var(--text-secondary); margin: 0; line-height: 1.4; }
        .pp-nodes-container { background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 14px; padding: 14px 16px; }
        .pp-nodes-label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; color: var(--text-muted); display: block; margin-bottom: 10px; }
        .pp-nodes-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .pp-node-pill { display: flex; align-items: center; gap: 8px; background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 6px 12px; border-radius: 10px; font-size: 12px; font-weight: 700; color: var(--text-primary); }
        .pp-node-number { width: 18px; height: 18px; border-radius: 50%; background: var(--primary-blue); color: #fff; font-size: 10px; font-weight: 800; display: flex; align-items: center; justify-content: center; }
        .pp-node-arrow { color: var(--text-muted); opacity: 0.6; }
        .pp-card-footer { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; pt: 6px; }
        .pp-tags { display: flex; gap: 6px; flex-wrap: wrap; }
        .pp-links { display: flex; gap: 14px; }

        /* ========== COMPACT TABLE VIEW STYLES ========== */
        .pt-table-wrap { background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 18px; overflow-x: auto; }
        .pt-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 13px; }
        .pt-table th { padding: 14px 18px; background: var(--bg-primary); border-bottom: 1px solid var(--border-color); font-size: 11px; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: .06em; }
        .pt-table td { padding: 14px 18px; border-bottom: 1px solid var(--border-color); color: var(--text-primary); vertical-align: middle; }
        .pt-table tr:last-child td { border-bottom: none; }
        .pt-table tr { cursor: pointer; transition: background .15s; }
        .pt-table tr:hover { background: var(--bg-primary); }

        /* ========== ZERO RESULTS STATE ========== */
        .pf-empty-state { text-align: center; padding: 48px 20px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 20px; display: flex; flex-direction: column; align-items: center; gap: 12px; margin-top: 10px; }
        .pf-empty-icon { width: 52px; height: 52px; border-radius: 16px; background: rgba(239,68,68,.1); color: #ef4444; display: flex; align-items: center; justify-content: center; margin-bottom: 4px; }
        .pf-empty-title { font-size: 17px; font-weight: 800; color: var(--text-primary); margin: 0; }
        .pf-empty-desc { font-size: 13.5px; color: var(--text-secondary); margin: 0; max-width: 400px; }
        .pf-empty-reset { padding: 8px 18px; border-radius: 12px; border: none; background: var(--primary-blue); color: #fff; font-size: 13px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(59,130,246,.3); margin-top: 6px; }

        /* ========== MODAL STYLES ========== */
        .pm-modal-wrapper { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; padding: 20px; z-index: 10000; pointer-events: none; }
        .pm-modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.75); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }
        .pm-modal-box {
          pointer-events: auto; position: relative;
          background: var(--bg-secondary); border: 1px solid var(--border-color);
          box-shadow: 0 28px 70px rgba(0,0,0,.45); display: flex; flex-direction: column;
          overflow: hidden; max-height: 88vh;
        }
        .pm-modal-top-accent {
          position: absolute; top: 0; left: 0; right: 0; height: 3.5px;
          background: linear-gradient(90deg, #3b82f6 0%, #10b981 50%, #8b5cf6 100%);
          z-index: 10;
        }
        .pm-modal-box--desktop { width: 100%; max-width: 700px; border-radius: 22px; }
        .pm-modal-box--mobile { position: fixed; bottom: 0; left: 0; right: 0; border-radius: 28px 28px 0 0; max-height: 88vh; }
        
        .pm-modal-cover-banner { position: relative; width: 100%; height: 165px; overflow: hidden; background: linear-gradient(135deg, #1e1b4b 0%, #064e3b 100%); flex-shrink: 0; }
        .pm-modal-cover-img { width: 100%; height: 100%; object-fit: cover; }
        .pm-modal-cover-gradient { position: absolute; inset: 0; background: linear-gradient(to top, var(--bg-secondary) 0%, transparent 80%); }

        .pm-modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 16px; border-bottom: 1px solid var(--border-color); flex-shrink: 0; position: relative; z-index: 2; }
        .pm-modal-header-left { display: flex; align-items: center; gap: 14px; }
        .pm-modal-icon { width: 44px; height: 44px; border-radius: 12px; background: rgba(59,130,246,.12); color: var(--primary-blue); border: 1px solid rgba(59,130,246,.25); font-weight: 800; display: flex; align-items: center; justify-content: center; font-size: 15px; }
        .pm-modal-category-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 10.5px; font-weight: 700; color: var(--primary-blue); background: color-mix(in srgb, var(--primary-blue) 10%, transparent); border: 1px solid color-mix(in srgb, var(--primary-blue) 25%, transparent); padding: 2px 8px; border-radius: 6px; }
        .pm-modal-title { font-size: 19px; font-weight: 800; color: var(--text-primary); margin: 0; letter-spacing: -.015em; }
        .pm-modal-close-btn { width: 34px; height: 34px; border-radius: 50%; border: 1px solid var(--border-color); background: var(--bg-primary); color: var(--text-secondary); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all .2s ease; }
        .pm-modal-close-btn:hover { color: var(--text-primary); border-color: var(--primary-blue); transform: rotate(90deg); }
        
        /* Stat cards grid */
        .ps-stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px; padding: 14px 24px 4px; }
        .ps-stat-card { background: color-mix(in srgb, var(--primary-blue) 4%, var(--bg-primary)); border: 1px solid color-mix(in srgb, var(--primary-blue) 15%, var(--border-color)); border-radius: 12px; padding: 10px 12px; display: flex; flex-direction: column; align-items: center; text-align: center; }
        .ps-stat-val { font-size: 18px; font-weight: 800; color: var(--primary-blue); letter-spacing: -.02em; }
        .ps-stat-lbl { font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: .04em; margin-top: 2px; }

        .pm-modal-tabs { display: flex; border-bottom: 1px solid var(--border-color); background: var(--bg-primary); padding: 8px 24px; gap: 6px; }
        .pm-modal-tab { border: 1px solid transparent; background: transparent; padding: 8px 14px; border-radius: 10px; font-size: 12.5px; font-weight: 600; color: var(--text-secondary); cursor: pointer; transition: all .2s; }
        .pm-modal-tab:hover { color: var(--text-primary); background: color-mix(in srgb, var(--primary-blue) 6%, transparent); }
        .pm-modal-tab--active { color: var(--primary-blue); background: var(--bg-secondary); border-color: color-mix(in srgb, var(--primary-blue) 25%, var(--border-color)); box-shadow: 0 2px 8px rgba(0,0,0,.04); font-weight: 700; }
        
        .pm-modal-body { padding: 22px 24px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 18px; }
        .pm-modal-desc { font-size: 14px; line-height: 1.6; color: var(--text-secondary); margin: 0; }
        
        /* Pipeline flow visualizer */
        .ps-pipeline { display: flex; align-items: center; gap: 8px; overflow-x: auto; padding: 12px 14px; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 14px; }
        .ps-pipeline-step { display: flex; align-items: center; gap: 8px; background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 8px 12px; border-radius: 10px; white-space: nowrap; }
        .ps-pipeline-num { font-size: 10px; font-weight: 800; color: var(--primary-blue); background: color-mix(in srgb, var(--primary-blue) 12%, transparent); padding: 2px 6px; border-radius: 6px; }
        .ps-pipeline-label { font-size: 12px; font-weight: 700; color: var(--text-primary); }
        .ps-pipeline-arrow { color: var(--primary-blue); font-size: 13px; opacity: .7; }

        /* Technology stack tags */
        .ps-tags { display: flex; flex-wrap: wrap; gap: 6px; }
        .ps-tag { font-size: 11.5px; font-weight: 600; padding: 4px 11px; background: color-mix(in srgb, var(--primary-blue) 8%, transparent); color: var(--primary-blue); border-radius: 8px; border: 1px solid color-mix(in srgb, var(--primary-blue) 20%, transparent); }

        /* Terminal code window */
        .ps-code-window { background: #0f172a; border-radius: 14px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,.3); }
        .ps-code-topbar { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: #1e293b; border-bottom: 1px solid #334155; }
        .ps-code-dots { display: flex; gap: 6px; }
        .ps-code-dot { width: 10px; height: 10px; border-radius: 50%; }
        .ps-code-dot--red { background: #ef4444; }
        .ps-code-dot--yellow { background: #f59e0b; }
        .ps-code-dot--green { background: #10b981; }
        .ps-code-title { font-size: 11px; font-weight: 700; color: #94a3b8; font-family: monospace; }
        .ps-copy-btn { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 700; background: #334155; color: #f8fafc; border: none; padding: 4px 10px; border-radius: 6px; cursor: pointer; transition: background .15s; }
        .ps-copy-btn:hover { background: #475569; }
        .ps-code-block pre { margin: 0; padding: 16px; font-family: 'Fira Code', monospace; font-size: 12.5px; color: #e2e8f0; line-height: 1.6; overflow-x: auto; }

        .pm-modal-footer { padding: 16px 24px; border-top: 1px solid var(--border-color); display: flex; gap: 12px; background: var(--bg-primary); flex-shrink: 0; }
        .dsheet-action-pill { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 11px 22px; border-radius: 12px; font-size: 13.5px; font-weight: 700; text-decoration: none; cursor: pointer; transition: all .2s ease; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); }
        .dsheet-action-pill:hover { border-color: var(--primary-blue); color: var(--primary-blue); transform: translateY(-2px); }
        .dsheet-action-pill--primary { background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%); color: #ffffff !important; border: none; box-shadow: 0 4px 16px rgba(59,130,246,.3); }
        .dsheet-action-pill--primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(59,130,246,.45); }

        /* ========== MOBILE CAROUSEL (mirrors Home hd-feat-* styles) ========== */
        @media (max-width: 900px) {

          /* Section label */
          .mpj-section-label {
            font-size: 9px; font-weight: 800; letter-spacing: .09em;
            text-transform: uppercase; color: var(--text-muted);
            margin: 0; display: flex; align-items: center; gap: 6px;
          }

          /* Filter chips row */
          .mpj-filter-row {
            display: flex; gap: 6px; overflow-x: auto; padding: 2px 2px 8px;
            scroll-padding-left: 2px;
            -ms-overflow-style: none; scrollbar-width: none; margin-bottom: 8px;
          }
          .mpj-filter-row::-webkit-scrollbar { display: none; }
          .mpj-filter-row::after { content: ''; flex: 0 0 4px; }
          .mpj-filter-chip {
            flex-shrink: 0;
            display: inline-flex; align-items: center; gap: 6px;
            padding: 6px 12px; border-radius: 20px;
            font-size: 11px; font-weight: 700;
            border: 1px solid var(--border-color);
            background: var(--bg-secondary); color: var(--text-secondary);
            cursor: pointer; white-space: nowrap;
            transition: all 0.15s ease;
            -webkit-tap-highlight-color: transparent;
          }
          .mpj-filter-chip:active { transform: scale(0.96); }
          .mpj-filter-chip--active {
            background: var(--primary-blue); border-color: var(--primary-blue);
            color: #ffffff !important; box-shadow: 0 2px 8px rgba(59,130,246,0.25);
          }
          .mpj-filter-count {
            font-size: 9.5px; opacity: 0.85; padding: 1px 5px; border-radius: 8px;
            background: rgba(0,0,0,0.08);
          }
          [data-theme="dark"] .mpj-filter-count { background: rgba(255,255,255,0.12); }
          .mpj-filter-chip--active .mpj-filter-count { background: rgba(255,255,255,0.25); color: #fff; }

          /* ── Mobile Carousel Header ── */
          .mpj-mobile-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 0 2px;
          }
          .mpj-mobile-title-wrap {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .mpj-mobile-icon-box {
            width: 28px;
            height: 28px;
            border-radius: 8px;
            background: rgba(59, 130, 246, 0.1);
            color: var(--primary-blue, #3B82F6);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          [data-theme="dark"] .mpj-mobile-icon-box {
            background: rgba(59, 130, 246, 0.2);
            color: #60A5FA;
          }
          .mpj-mobile-heading {
            font-size: 14px;
            font-weight: 800;
            color: var(--text-primary);
            margin: 0;
            line-height: 1.2;
            letter-spacing: -0.01em;
          }
          .mpj-mobile-sub {
            font-size: 10px;
            color: var(--text-muted);
            margin: 1px 0 0;
            line-height: 1.2;
          }
          .mpj-mobile-controls {
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .mpj-mobile-counter {
            font-size: 10px;
            font-weight: 700;
            color: var(--text-muted);
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            padding: 2px 8px;
            border-radius: 20px;
            letter-spacing: 0.03em;
          }
          .mpj-nav-btn {
            width: 28px;
            height: 28px;
            border-radius: 8px;
            border: 1px solid var(--border-color);
            background: var(--bg-secondary);
            color: var(--text-primary);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: transform 0.15s ease, background 0.15s ease;
            padding: 0;
            -webkit-tap-highlight-color: transparent;
          }
          .mpj-nav-btn:active:not(:disabled) {
            transform: scale(0.92);
          }
          .mpj-nav-btn:disabled {
            opacity: 0.35;
            cursor: not-allowed;
          }

          /* ── Snap Track ── */
          .mpj-feat-track {
            display: flex;
            gap: 12px;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            scroll-padding-left: 2px;
            margin: 0;
            padding: 4px 2px 14px;
            -webkit-overflow-scrolling: touch;
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .mpj-feat-track::-webkit-scrollbar {
            display: none;
          }
          .mpj-feat-track::after {
            content: '';
            flex: 0 0 4px;
          }

          /* ── Individual snap card (mirrors .medu-snap-card) ── */
          .mpj-feat-slide {
            flex: 0 0 85%;
            min-width: 85%;
            max-width: 85%;
            scroll-snap-align: start;
            box-sizing: border-box;
            background: var(--bg-secondary, #FFFFFF);
            border: 1.5px solid var(--border-color, #CBD5E1);
            border-radius: 16px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
            padding: 14px 15px;
            display: flex;
            flex-direction: column;
            cursor: pointer;
            transition: transform 0.15s ease, border-color 0.15s ease;
            -webkit-tap-highlight-color: transparent;
            position: relative;
            overflow: hidden;
          }
          .mpj-feat-slide:active {
            transform: scale(0.985);
          }
          [data-theme="dark"] .mpj-feat-slide {
            background: var(--bg-secondary, #161B22);
            border-color: rgba(255, 255, 255, 0.14);
            box-shadow: 0 4px 18px rgba(0, 0, 0, 0.28);
          }

          .mpj-feat-top-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 8px;
            gap: 6px;
          }

          .mpj-feat-badge {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            border-radius: 12px;
            padding: 2.5px 8px;
            border: 1.2px solid;
            font-size: 9.5px;
            font-weight: 600;
            letter-spacing: 0.02em;
            white-space: nowrap;
          }
          .mpj-badge-dot {
            width: 4.5px;
            height: 4.5px;
            border-radius: 50%;
            background: currentColor;
          }

          .mpj-feat-badge--blue {
            background: rgba(59, 130, 246, 0.08);
            border-color: rgba(59, 130, 246, 0.25);
            color: #2563EB;
          }
          [data-theme="dark"] .mpj-feat-badge--blue {
            background: rgba(59, 130, 246, 0.15);
            border-color: rgba(59, 130, 246, 0.32);
            color: #60A5FA;
          }

          .mpj-feat-badge--purple {
            background: rgba(99, 102, 241, 0.08);
            border-color: rgba(99, 102, 241, 0.25);
            color: #6366F1;
          }
          [data-theme="dark"] .mpj-feat-badge--purple {
            background: rgba(99, 102, 241, 0.15);
            border-color: rgba(99, 102, 241, 0.32);
            color: #818CF8;
          }

          .mpj-feat-badge--green {
            background: rgba(16, 185, 129, 0.08);
            border-color: rgba(16, 185, 129, 0.25);
            color: #059669;
          }
          [data-theme="dark"] .mpj-feat-badge--green {
            background: rgba(16, 185, 129, 0.15);
            border-color: rgba(16, 185, 129, 0.32);
            color: #34D399;
          }

          .mpj-feat-score {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            background: rgba(245, 158, 11, 0.1);
            border: 1.2px solid rgba(245, 158, 11, 0.3);
            color: #D97706;
            font-size: 9.5px;
            font-weight: 700;
            padding: 2px 7px;
            border-radius: 12px;
            white-space: nowrap;
          }
          [data-theme="dark"] .mpj-feat-score {
            background: rgba(245, 158, 11, 0.16);
            border-color: rgba(245, 158, 11, 0.35);
            color: #FBBF24;
          }

          .mpj-feat-title {
            font-size: 14.5px;
            font-weight: 700;
            color: var(--text-primary);
            margin: 0 0 4px;
            letter-spacing: -0.015em;
            line-height: 1.25;
          }

          .mpj-feat-sub {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 10.5px;
            font-weight: 600;
            color: var(--primary-blue, #3B82F6);
            margin: 0 0 8px;
            line-height: 1.3;
          }

          .mpj-feat-desc {
            font-size: 11px;
            color: var(--text-secondary);
            line-height: 1.5;
            margin: 0 0 10px;
            flex: 1;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .mpj-feat-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            margin-bottom: 12px;
          }

          .mpj-feat-tag {
            font-size: 9px;
            font-weight: 500;
            border-radius: 5px;
            padding: 2px 7px;
            border: 1px solid var(--border-color, #CBD5E1);
            background: var(--bg-primary, #F9FAFB);
            color: var(--text-muted, #6B7280);
            line-height: 1.25;
          }
          [data-theme="dark"] .mpj-feat-tag {
            background: var(--bg-primary, #0D1117);
            border-color: rgba(255, 255, 255, 0.12);
            color: var(--text-muted, #9CA3AF);
          }

          .mpj-feat-actions {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: auto;
            padding-top: 4px;
          }

          .mpj-feat-links {
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .mpj-feat-icon-btn {
            width: 26px;
            height: 26px;
            border-radius: 7px;
            border: 1px solid var(--border-color);
            background: var(--bg-primary);
            color: var(--text-secondary);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.15s ease;
            padding: 0;
            -webkit-tap-highlight-color: transparent;
          }
          .mpj-feat-icon-btn:active {
            color: var(--primary-blue);
            border-color: var(--primary-blue);
            transform: scale(0.92);
          }

          .mpj-feat-action-btn {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            font-size: 10.5px;
            font-weight: 600;
            color: var(--primary-blue, #3B82F6);
            background: none;
            border: none;
            padding: 0;
            cursor: pointer;
            transition: opacity 0.15s;
            -webkit-tap-highlight-color: transparent;
          }
          .mpj-feat-action-btn:active {
            opacity: 0.7;
          }

          /* ── Dots pagination ── */
          .mpj-feat-dots {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
            margin-top: 6px;
            margin-bottom: 14px;
          }
          .mpj-feat-dot {
            width: 5px;
            height: 5px;
            border-radius: 50%;
            background: var(--border-color, #E5E7EB);
            border: none;
            padding: 0;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .mpj-feat-dot.active {
            background: var(--primary-blue, #3B82F6);
            width: 14px;
            border-radius: 3px;
          }
        }
      `}</style>

      {/* Content Rendering based on Loading State */}
      {loading ? (
        <ProjectSkeleton count={6} />
      ) : isMobile ? (
        /* ── Mobile Carousel View ─────────────────────────────────────────────── */
        <div style={{ width: '100%', padding: '4px 0 60px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <p style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.22em', textTransform: 'uppercase', margin: '0 0 6px' }}>
              ENGINEERED SYSTEMS
            </p>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px', letterSpacing: '-0.025em', lineHeight: 1.2 }}>
              Production Apps &amp; ML Models
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 auto', lineHeight: 1.55 }}>
              Swipe to explore all intelligent applications, ML pipelines, and full-stack solutions.
            </p>
          </div>

          {/* Search bar */}
          <div style={{ position: 'relative', width: '100%', marginBottom: '10px' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects, technologies..."
              style={{
                width: '100%', height: '38px',
                padding: '0 32px 0 34px',
                borderRadius: '12px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontSize: '12px', fontWeight: 500,
                outline: 'none', boxSizing: 'border-box',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                style={{
                  position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', padding: 0,
                  color: 'var(--text-muted)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category filter chips */}
          <div className="mpj-filter-row">
            {categories.map(cat => {
              const count = cat === 'All'
                ? (projectsData || []).length
                : (projectsData || []).filter(p =>
                    getProjectCategory(p).toLowerCase() === cat.toLowerCase() ||
                    (p.tags && p.tags.some(t => t.toLowerCase().includes(cat.toLowerCase())))
                  ).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`mpj-filter-chip${activeCategory === cat ? ' mpj-filter-chip--active' : ''}`}
                >
                  <span>{cat}</span>
                  <span className="mpj-filter-count">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Carousel or Empty State */}
          {filteredProjects.length > 0 ? (
            <MobileCarousel projects={filteredProjects} onOpen={setSelectedProject} />
          ) : (
            <div style={{
              textAlign: 'center', padding: '36px 16px',
              background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
              borderRadius: '16px', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '8px', marginTop: '8px'
            }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' }}>
                <Search size={18} />
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>No projects found</h3>
              <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: 0 }}>Try a different keyword or reset filters.</p>
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
                style={{ marginTop: '8px', padding: '6px 16px', borderRadius: '20px', border: 'none', background: 'var(--primary-blue)', color: '#fff', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer' }}
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Desktop Grid View - Upgraded Cards */
        <div className="projects-grid">
          {(projectsData || []).map((project) => (
            <ProjectCard
              key={project.id || project.title}
              project={project}
              onCardClick={setSelectedProject}
            />
          ))}
        </div>
      )}

      {/* Accessible Desktop Detail Modal & Mobile Bottom Sheet */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          isMobile={isMobile}
        />
      )}
    </ScrollReveal>
  );
}
