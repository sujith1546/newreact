import React, { useRef } from 'react';
import {
  ExternalLink, Code2, Cpu, Sliders, Layout, Database, Sparkles, Trees, Brain,
  ArrowRight, ShieldCheck, TrendingUp, Newspaper, Eye, Smile, Receipt, Layers, GitMerge
} from 'lucide-react';
import { FaGithub, FaPython, FaReact } from 'react-icons/fa';

const pipelineIconMap = {
  Database, Brain, TrendingUp, ShieldCheck, Newspaper, Eye, Smile, Receipt, Sliders, Layers
};

const tagIconMap = {
  "Python": FaPython,
  "TensorFlow": Cpu,
  "Scikit-learn": Sliders,
  "React": FaReact,
  "FastAPI": Cpu,
  "Streamlit": Layout,
  "ChromaDB": Database,
  "Gemini API": Sparkles,
  "RAG": Database,
  "NLP": Brain,
  "Machine Learning": Brain,
  "LightGBM": Sliders,
  "XGBoost": Sliders,
  "Random Forest": Trees
};

export default function ProjectCard({ project, onCardClick }) {
  const cardRef = useRef(null);
  const rafRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const clientX = e.clientX;
    const clientY = e.clientY;
    
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    
    rafRef.current = requestAnimationFrame(() => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      cardRef.current.style.setProperty('--mouse-x', `${clientX - rect.left}px`);
      cardRef.current.style.setProperty('--mouse-y', `${clientY - rect.top}px`);
    });
  };

  // Extract primary key metric stat if available
  const topStat = project.stats && project.stats[0];

  // Pipeline mini steps fallback
  const miniPipeline = project.pipeline || [
    { label: 'Data Ingest', iconName: 'Database' },
    { label: 'AI Processing', iconName: 'Brain' },
    { label: 'Live Output', iconName: 'TrendingUp' }
  ];

  return (
    <div
      className="project-card"
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onClick={() => onCardClick?.(project)}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${project.title}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onCardClick?.(project);
        }
      }}
    >
      {/* Top Accent Gradient Border */}
      <div className="pc-top-accent-line" />

      {/* Image & Visual Header Area */}
      <div className="project-image-area">
        <div className="mesh-gradient" />
        
        {/* Category Pill Overlay */}
        <div className="pc-category-tag">
          <GitMerge size={11} />
          <span>{project.tags?.[0] || 'Engineering'}</span>
        </div>

        {project.image ? (
          <img
            src={project.image}
            alt={project.title}
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', zIndex: 1, position: 'relative' }}
          />
        ) : (
          <Code2 size={44} className="project-image-icon" />
        )}
      </div>

      {/* Card Content Body */}
      <div className="project-content">
        <div className="project-title-row">
          <h3 className="project-title">
            {project.title} <span className="pc-title-arrow">↗</span>
          </h3>
          {project.liveUrl && (
            <div className="live-badge">
              <span className="live-dot">
                <span className="live-ping" />
                <span className="live-dot-core" />
              </span>
              <span className="live-text">Live</span>
            </div>
          )}
        </div>

        <p className="project-desc">{project.description}</p>

        {/* Mini Pipeline Flow Sequence */}
        <div className="pc-mini-pipeline">
          <div className="pc-pipeline-header">
            <span className="pc-pipeline-title">Pipeline Workflow</span>
            {topStat && (
              <span className="pc-stat-inline">
                {topStat.prefix}{topStat.value}{topStat.suffix} {topStat.label}
              </span>
            )}
          </div>
          <div className="pc-pipeline-steps">
            <div className="pc-pipeline-steps-inner">
              {miniPipeline.slice(0, 3).map((step, i) => {
                const StepIcon = pipelineIconMap[step.iconName] || Cpu;
                return (
                  <React.Fragment key={step.label + i}>
                    <div className="pc-pipeline-step-chip" title={step.label}>
                      <StepIcon size={12} className="pc-step-icon" />
                      <span className="pc-step-text">{step.label}</span>
                    </div>
                    {i < Math.min(miniPipeline.length, 3) - 1 && (
                      <span className="pc-step-arrow">
                        <span className="pc-pulse-dot" style={{ animationDelay: `${i * 0.35}s` }} />
                        &rarr;
                      </span>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tech Stack Tags */}
        <div className="project-tags">
          {project.tags.slice(0, 4).map((tag) => {
            const Icon = tagIconMap[tag];
            return (
              <span key={tag} className="project-tag">
                {Icon && <Icon size={11} style={{ marginRight: 4, display: 'inline' }} />}
                {tag}
              </span>
            );
          })}
          {project.tags.length > 4 && (
            <span className="project-tag">+{project.tags.length - 4}</span>
          )}
        </div>

        {/* Footer Action Links */}
        <div className="project-links" onClick={(e) => e.stopPropagation()}>
          <button
            className="project-link project-link--details"
            onClick={() => onCardClick?.(project)}
            aria-label={`View case study for ${project.title}`}
          >
            Case Study <ArrowRight size={13} />
          </button>
          <div className="project-links-right">
            {(project.githubUrl || project.github_url || true) && (
              <a
                href={project.githubUrl || project.github_url || 'https://github.com/sujith1546'}
                target="_blank"
                rel="noreferrer"
                className="project-link"
                aria-label={`View code for ${project.title}`}
              >
                <FaGithub size={13} /> Code
              </a>
            )}
            {(project.liveUrl || project.live_url) && (
              <a
                href={project.liveUrl || project.live_url}
                target="_blank"
                rel="noreferrer"
                className="project-link project-link--live"
                aria-label={`View live demo for ${project.title}`}
              >
                <ExternalLink size={13} /> Live Demo
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
