import React from "react";
import "./ProjectCard.css";
import {
  SiPython,
  SiFastapi,
  SiStreamlit,
  SiGooglegemini,
  SiTensorflow,
  SiScikitlearn,
  SiReact,
  SiHuggingface,
} from "react-icons/si";
import { Database, Brain, TrendingUp, Trees, Cpu, Code2 } from "lucide-react";

/**
 * Maps technology names to their authentic brand logos and official brand colors.
 */
export function getTechBadge(tag) {
  const name = (typeof tag === "string" ? tag : tag?.name || "").trim();
  const lower = name.toLowerCase();

  if (lower.includes("python")) {
    return { Icon: SiPython, color: "#3776AB" };
  }
  if (lower.includes("fastapi")) {
    return { Icon: SiFastapi, color: "#009688" };
  }
  if (lower.includes("streamlit")) {
    return { Icon: SiStreamlit, color: "#FF4B4B" };
  }
  if (lower.includes("gemini")) {
    return { Icon: SiGooglegemini, color: "#8E75FF" };
  }
  if (lower.includes("tensorflow")) {
    return { Icon: SiTensorflow, color: "#FF6F00" };
  }
  if (lower.includes("scikit")) {
    return { Icon: SiScikitlearn, color: "#F7931E" };
  }
  if (lower.includes("finbert") || lower.includes("bert") || lower.includes("hugging")) {
    return { Icon: SiHuggingface, color: "#FFD21E" };
  }
  if (lower.includes("react")) {
    return { Icon: SiReact, color: "#61DAFB" };
  }
  if (lower.includes("chroma")) {
    return { Icon: Database, color: "#2563EB" };
  }
  if (lower.includes("rag")) {
    return { Icon: Brain, color: "#6366F1" };
  }
  if (lower.includes("nlp")) {
    return { Icon: Brain, color: "#8B5CF6" };
  }
  if (lower.includes("forest")) {
    return { Icon: Trees, color: "#059669" };
  }
  if (lower.includes("xgboost") || lower.includes("lightgbm")) {
    return { Icon: TrendingUp, color: "#10B981" };
  }
  if (lower.includes("machine learning") || lower.includes("ml")) {
    return { Icon: Cpu, color: "#0284C7" };
  }
  if (lower.includes("db") || lower.includes("database") || lower.includes("sql")) {
    return { Icon: Database, color: "#2563EB" };
  }

  return { Icon: Code2, color: "#64748B" };
}

export default function ProjectCard({
  category,
  title,
  description,
  metric,
  pipeline = [],
  tech = [],
  link = "#",
  github,
  onCardClick,
}) {
  return (
    <article className="pc">
      <header className="pc-top">
        <span className="pc-category">
          <i className="pc-dot" />
          {category}
        </span>
        {metric && <span className="pc-metric">{metric}</span>}
      </header>

      <h3 className="pc-title">{title}</h3>
      <p className="pc-desc">{description}</p>

      {pipeline && pipeline.length > 0 && (
        <div className="pc-flow">
          <div className="pc-flow-header">
            <span className="pc-flow-label">
              <span className="pc-flow-dot" />
              Pipeline Architecture
            </span>
            <span className="pc-flow-count">{pipeline.length} stages</span>
          </div>

          <div className="pc-flow-track">
            {pipeline.map((step, i) => {
              const label = typeof step === "string" ? step : step?.label || step?.name || `Step ${i + 1}`;
              const isLast = i === pipeline.length - 1;
              return (
                <React.Fragment key={label + i}>
                  <div className="pc-flow-node" title={label}>
                    <span className="pc-flow-badge">{i + 1}</span>
                    <span className="pc-flow-text">{label}</span>
                  </div>
                  {!isLast && (
                    <div className="pc-flow-bridge" aria-hidden="true">
                      <span className="pc-flow-bridge-line" />
                      <span className="pc-flow-bridge-arrow">›</span>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {tech && tech.length > 0 && (
        <div className="pc-tech">
          {tech.map((t, i) => {
            const label = typeof t === "string" ? t : t?.name || t;
            const { Icon, color } = getTechBadge(label);
            return (
              <span key={label + i} className="pc-tech-pill">
                <Icon size={13} style={{ color, flexShrink: 0 }} aria-hidden="true" />
                <span>{label}</span>
              </span>
            );
          })}
        </div>
      )}

      <footer className="pc-footer">
        <a
          href={link}
          className="pc-view-btn"
          onClick={(e) => {
            if (onCardClick) {
              e.preventDefault();
              onCardClick();
            }
          }}
        >
          <span className="pc-view-btn-text">View Case Study</span>
          <span className="pc-view-btn-icon" aria-hidden>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </a>
        {github && github !== '#' && (
          <a href={github} target="_blank" rel="noreferrer" className="pc-gh-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.34-3.369-1.34-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.03-2.682-.103-.254-.447-1.27.097-2.646 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.376.202 2.392.1 2.646.64.698 1.028 1.591 1.028 2.682 0 3.841-2.337 4.687-4.565 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
            </svg>
            GitHub
          </a>
        )}
      </footer>
    </article>
  );
}
