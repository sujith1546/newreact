import React, { useRef } from "react";
import {
  ExternalLink, Cpu, Sliders, Layout, Database, Sparkles, Trees, Brain,
  ArrowRight, ShieldCheck, TrendingUp, Newspaper, Eye, Smile, Receipt, Layers, GitMerge
} from "lucide-react";
import { FaGithub, FaPython, FaReact } from "react-icons/fa";

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
  "Random Forest": Trees,
};

function stringToHue(str = "") {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

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
      cardRef.current.style.setProperty("--mouse-x", `${clientX - rect.left}px`);
      cardRef.current.style.setProperty("--mouse-y", `${clientY - rect.top}px`);
    });
  };

  const topStat = project.stats && project.stats[0];
  const miniPipeline = project.pipeline || [
    { label: "Data Ingest", iconName: "Database" },
    { label: "AI Processing", iconName: "Brain" },
    { label: "Live Output", iconName: "TrendingUp" },
  ];

  const hue = stringToHue(project.title);
  const hue2 = (hue + 65) % 360;
  const hue3 = (hue + 150) % 360;
  const initials = project.title.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

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
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onCardClick?.(project);
        }
      }}
    >
      {/* Mouse-tracking spotlight glow */}
      <div className="pc-spotlight" aria-hidden="true" />

      {/* Top Accent Gradient Line */}
      <div className="pc-top-accent-line" />

      {/* Image / Visual Header */}
      <div className="project-image-area">
        <div className="pc-category-tag">
          <GitMerge size={11} />
          <span>{project.tags?.[0] || "Engineering"}</span>
        </div>

        {project.image ? (
          <img
            src={project.image}
            alt={project.title}
            loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover", zIndex: 1, position: "relative" }}
          />
        ) : (
          <div
            className="pc-monogram-art"
            style={{
              background: `radial-gradient(ellipse at 28% 38%, hsl(${hue},72%,58%) 0%, hsl(${hue2},62%,44%) 52%, hsl(${hue3},58%,32%) 100%)`,
            }}
          >
            <div className="pc-monogram-grid" aria-hidden="true">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="pc-monogram-dot" />
              ))}
            </div>
            <div className="pc-monogram-rings" aria-hidden="true">
              <div className="pc-monogram-ring" />
              <div className="pc-monogram-ring pc-monogram-ring--2" />
            </div>
            <span className="pc-monogram-letter">{initials}</span>
          </div>
        )}
      </div>

      {/* Card Body */}
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

        {/* Mini Pipeline Flow */}
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

        {/* Tech Tags */}
        <div className="project-tags">
          {project.tags.slice(0, 4).map((tag) => {
            const Icon = tagIconMap[tag];
            return (
              <span key={tag} className="project-tag">
                {Icon && <Icon size={11} style={{ marginRight: 4, display: "inline" }} />}
                {tag}
              </span>
            );
          })}
          {project.tags.length > 4 && (
            <span className="project-tag">+{project.tags.length - 4}</span>
          )}
        </div>

        {/* Redesigned Footer */}
        <div className="project-links" onClick={(e) => e.stopPropagation()}>
          <button
            className="pc-cta-pill"
            onClick={() => onCardClick?.(project)}
            aria-label={`View case study for ${project.title}`}
          >
            View Case Study <ArrowRight size={13} />
          </button>
          <div className="project-links-right">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="pc-icon-btn"
                aria-label={`GitHub repository for ${project.title}`}
                title="Source code"
              >
                <FaGithub size={15} />
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="pc-icon-btn pc-icon-btn--live"
                aria-label={`Live demo for ${project.title}`}
                title="Live demo"
              >
                <ExternalLink size={15} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
