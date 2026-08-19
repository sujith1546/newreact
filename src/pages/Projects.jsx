import React, { useState, useEffect } from 'react';
import { ScrollReveal } from '../components';
import { ChevronRight, ExternalLink, Zap, Brain, Code2, Database, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import useRealtimeData from '../hooks/useRealtimeData';

// Modular Sub-Components
import ProjectSkeleton from '../components/projects/ProjectSkeleton';
import ProjectCard from '../components/projects/ProjectCard';
import ProjectModal from '../components/projects/ProjectModal';
import { useLongPress } from '../hooks/useLongPress';

const projectAccents = [
  { color: '#6366f1', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.3)', glow: '#6366f1' },
  { color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.3)', glow: '#8b5cf6' },
  { color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', glow: '#10b981' },
];

/* Mobile Project Bento Card */
function MobileProjectRow({ project, index, onTap, onLongPress }) {
  const title = project?.title || 'Project';
  const initials = title.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const accentObj = projectAccents[index % projectAccents.length];
  const accent = accentObj.color;

  // Extract tech tags from tags array or tech_stack
  const techTags = Array.isArray(project.tags) ? project.tags.slice(0, 3) :
    typeof project.tags === 'string' ? project.tags.split(',').slice(0, 3).map(t => t.trim()) : [];

  // Check for notable metric in title or description
  const metricMatch = (project.description || '').match(/(\d+[%+k]+[^.\s]{0,15})/i);
  const metric = metricMatch ? metricMatch[1] : null;

  const longPressProps = useLongPress({
    onLongPress: () => onLongPress(project),
    onClick: () => onTap(project)
  });

  return (
    <motion.button
      className="mpj-bento"
      {...longPressProps}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      whileTap={{ scale: 0.975 }}
    >
      {/* Top accent bar */}
      <div className="mpj-top-bar" style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />
      {/* Glow blob */}
      <div className="mpj-glow" style={{ background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)` }} />

      {/* Header row */}
      <div className="mpj-bento-header">
        <div className="mpj-bento-icon" style={{ background: accentObj.bg, color: accent, borderColor: accentObj.border }}>
          {initials}
        </div>
        <div className="mpj-bento-title-wrap">
          <h3 className="mpj-bento-title">{project.title}</h3>
          <div className="mpj-bento-badges">
            {project.liveUrl && (
              <div className="live-badge">
                <span className="live-dot"><span className="live-ping" /><span className="live-dot-core" /></span>
                <span className="live-text">Live</span>
              </div>
            )}
            {metric && (
              <span className="mpj-metric-badge" style={{ color: accent, background: accentObj.bg, borderColor: accentObj.border }}>
                {metric}
              </span>
            )}
          </div>
        </div>
        <ChevronRight size={14} className="mpj-chevron" />
      </div>

      {/* Description */}
      <p className="mpj-bento-desc">{(project.description || '').slice(0, 100)}{project.description?.length > 100 ? '…' : ''}</p>

      {/* Tech stack tags */}
      {techTags.length > 0 && (
        <div className="mpj-bento-tags">
          {techTags.map(tag => (
            <span key={tag} className="mpj-bento-tag" style={{ color: accent, borderColor: accentObj.border, background: accentObj.bg }}>
              {tag}
            </span>
          ))}
        </div>
      )}
    </motion.button>
  );
}

export default function Projects() {
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth <= 900);
  const { data: projectsData, loading } = useRealtimeData('projects', { orderColumn: 'created_at', ascending: true, disableRealtime: true });
  
  const [selectedProject, setSelectedProject] = useState(null);
  const [contextMenuProject, setContextMenuProject] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);



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

        /* ========== MOBILE SPECIFIC BENTO CARDS ========== */
        @media (max-width: 900px) {
          .mpj-list { display: flex; flex-direction: column; gap: 10px; }

          /* Filter chips header (mobile-only) */
          .mpj-filter-row {
            display: flex; gap: 7px; overflow-x: auto; padding-bottom: 2px;
            -ms-overflow-style: none; scrollbar-width: none; margin-bottom: 4px;
          }
          .mpj-filter-row::-webkit-scrollbar { display: none; }
          .mpj-filter-chip {
            flex-shrink: 0;
            padding: 5px 13px; border-radius: 20px;
            font-size: 11px; font-weight: 700;
            border: 1px solid var(--border-color);
            background: var(--bg-secondary); color: var(--text-secondary);
            cursor: pointer; white-space: nowrap;
            transition: all 0.15s;
          }
          .mpj-filter-chip--active {
            background: var(--primary-blue); border-color: var(--primary-blue);
            color: #fff;
          }

          /* Bento card */
          .mpj-bento {
            position: relative; overflow: hidden;
            display: flex; flex-direction: column; gap: 8px;
            padding: 14px 14px 12px;
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 18px;
            width: 100%; text-align: left; cursor: pointer;
            transition: border-color 0.2s;
          }
          .mpj-bento:active { border-color: rgba(99,102,241,0.4); }

          /* Top gradient bar */
          .mpj-top-bar {
            position: absolute; top: 0; left: 0; right: 0; height: 2px;
            border-radius: 18px 18px 0 0;
          }

          /* Glow blob */
          .mpj-glow {
            position: absolute; top: -20px; right: -20px;
            width: 80px; height: 80px; border-radius: 50%;
            pointer-events: none;
          }

          /* Header row */
          .mpj-bento-header { display: flex; align-items: flex-start; gap: 10px; }
          .mpj-bento-icon {
            width: 38px; height: 38px; border-radius: 12px;
            border: 1px solid; display: flex; align-items: center; justify-content: center;
            font-size: 11px; font-weight: 800; flex-shrink: 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          }
          .mpj-bento-title-wrap { flex: 1; min-width: 0; }
          .mpj-bento-title {
            font-size: 14px; font-weight: 800; color: var(--text-primary);
            margin: 0 0 4px; letter-spacing: -0.02em; line-height: 1.2;
          }
          .mpj-bento-badges { display: flex; align-items: center; gap: 5px; flex-wrap: wrap; }
          .mpj-metric-badge {
            font-size: 9px; font-weight: 800; border-radius: 8px;
            padding: 2px 7px; border: 1px solid;
            letter-spacing: 0.02em;
          }
          .mpj-chevron { color: var(--text-muted); flex-shrink: 0; margin-top: 2px; }

          /* Description */
          .mpj-bento-desc {
            font-size: 11px; color: var(--text-secondary);
            line-height: 1.55; margin: 0;
            display: -webkit-box; -webkit-line-clamp: 2;
            -webkit-box-orient: vertical; overflow: hidden;
          }

          /* Tech tags */
          .mpj-bento-tags { display: flex; flex-wrap: wrap; gap: 5px; }
          .mpj-bento-tag {
            font-size: 9.5px; font-weight: 700;
            border-radius: 8px; padding: 2.5px 8px;
            border: 1px solid;
          }

          /* Title row */
          .mpj-title-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
        }
      `}</style>

      {/* Content Rendering based on Loading State */}
      {loading ? (
        <ProjectSkeleton count={6} />
      ) : isMobile ? (
        /* Mobile Bento Cards View */
        <div>
          {/* Filter chips — mobile only */}
          <div className="mpj-filter-row">
            {['All', 'AI & ML', 'Full Stack', 'Data Science'].map(cat => (
              <span key={cat} className={`mpj-filter-chip${cat === 'All' ? ' mpj-filter-chip--active' : ''}`}>
                {cat}
              </span>
            ))}
          </div>
          <div className="mpj-list">
            {(projectsData || []).map((project, i) => (
              <MobileProjectRow
                key={project.id || project.title}
                project={project}
                index={i}
                onTap={setSelectedProject}
                onLongPress={setContextMenuProject}
              />
            ))}
          </div>
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
