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
          className="pc-btn pc-btn-primary"
          onClick={(e) => {
            if (onCardClick) {
              e.preventDefault();
              onCardClick();
            }
          }}
        >
          <span className="pc-btn-label">View Case Study</span>
          <span className="pc-btn-arrow" aria-hidden>→</span>
        </a>
        {github && github !== '#' && (
          <a href={github} target="_blank" rel="noreferrer" className="pc-btn pc-btn-ghost">
            GitHub ↗
          </a>
        )}
      </footer>
    </article>
  );
}
