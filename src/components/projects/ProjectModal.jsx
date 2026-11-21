import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  X, ExternalLink, Code2, Copy, Check, Sparkles,
  MessageSquare, Database, ShieldCheck, TrendingUp, Newspaper,
  Brain, Eye, Smile, Receipt, Sliders, Layers, ArrowRight,
  Cpu, Terminal, CheckCircle2, ArrowUpRight
} from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { getTechBadge } from './ProjectCard';

const pipelineIconMap = {
  MessageSquare, Database, ShieldCheck, TrendingUp, Newspaper,
  Brain, Eye, Smile, Receipt, Sliders, Layers, Cpu
};

export default function ProjectModal({ project, onClose, isMobile = false }) {
  const [tab, setTab] = useState(0);
  const [copied, setCopied] = useState(false);
  const triggerElementRef = useRef(null);
  const drawerRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  // Focus trap & body lock
  useEffect(() => {
    triggerElementRef.current = document.activeElement;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusable = drawerRef.current?.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    focusable?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      triggerElementRef.current?.focus?.();
    };
  }, [onClose]);

  if (!project) return null;

  // Normalized data matching ProjectCard styles
  const category = (project.category || project.tags?.[0] || 'AI / ML').toUpperCase();
  const tagline = project.tagline || project.description || '';

  // Normalized metrics
  const rawMetrics = project.metrics || (project.stats ? project.stats.map((s) => ({
    label: s.label?.toUpperCase() || 'METRIC',
    value: `${s.prefix || ''}${s.value}${s.suffix || ''}`,
    note: s.note || 'Validated output'
  })) : [
    { label: 'THROUGHPUT', value: '600+', note: 'Req / hour' },
    { label: 'LATENCY', value: '<2s', note: 'End-to-end' },
    { label: 'ACCURACY', value: '0.883', note: 'R2 Score' }
  ]);
  const metrics = rawMetrics.slice(0, 3);
  const topMetric = metrics[0]?.value ? `${metrics[0].value} ${metrics[0].label}` : null;

  // Normalized pipeline
  const rawPipeline = project.pipeline || [
    { label: 'Data Ingestion', iconName: 'MessageSquare', note: 'Raw event stream' },
    { label: 'Model Processing', iconName: 'Database', note: 'Vector retrieval & inference' },
    { label: 'Validation Check', iconName: 'ShieldCheck', note: 'Confidence thresholding' },
    { label: 'Insight Output', iconName: 'TrendingUp', note: 'Structured response' }
  ];

  const pipeline = rawPipeline.map((p, i) => {
    let IconComp = Sparkles;
    if (p.icon && (typeof p.icon === 'function' || typeof p.icon === 'object')) {
      IconComp = p.icon;
    } else if (p.iconName && pipelineIconMap[p.iconName]) {
      IconComp = pipelineIconMap[p.iconName];
    } else if (typeof p.icon === 'string' && pipelineIconMap[p.icon]) {
      IconComp = pipelineIconMap[p.icon];
    }
    return {
      id: p.id || `0${i + 1}`,
      icon: IconComp,
      name: p.name || p.label || `Stage ${i + 1}`,
      note: p.note || 'Pipeline processing'
    };
  });

  const stack = project.stack || project.tags || ['Python', 'FastAPI', 'React', 'Scikit-learn'];

  const architecture = project.architecture ? (
    typeof project.architecture[0] === 'string'
      ? project.architecture.map((stepStr, i) => ({
          code: `L0${i + 1}`,
          title: `Layer 0${i + 1}: ${stepStr}`,
          body: `Decoupled service handling ${stepStr.toLowerCase()} with resilient retry policies and streaming telemetry.`
        }))
      : project.architecture
  ) : null;

  const codeSnippet = typeof project.code === 'string'
    ? { filename: 'pipeline.py', snippet: project.code }
    : project.code || null;

  const sourceUrl = project.links?.source || project.githubUrl;
  const demoUrl = project.links?.demo || project.liveUrl;

  const handleCopyCode = () => {
    const textToCopy = codeSnippet?.snippet || project.code || '';
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const tabs = ['Overview'];
  if (pipeline && pipeline.length > 0) tabs.push('Pipeline');
  if (architecture) tabs.push('Architecture');
  if (codeSnippet) tabs.push('Code');

  const drawerVariants = prefersReducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.15 } }
    : isMobile
    ? {
        initial: { y: '100%' },
        animate: { y: 0 },
        exit: { y: '100%' },
        transition: { type: 'tween', ease: [0.16, 1, 0.3, 1], duration: 0.28 }
      }
    : {
        initial: { x: '100%' },
        animate: { x: 0 },
        exit: { x: '100%' },
        transition: { type: 'spring', damping: 30, stiffness: 320, mass: 0.88 }
      };

  return createPortal(
    <div className="psd-root" role="dialog" aria-modal="true" aria-label={project.title}>
      {/* Dimmed backdrop blur */}
      <motion.div
        className="psd-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        onClick={onClose}
      />

      {/* Slide-over Drawer (slides in from right to left) */}
      <motion.aside
        ref={drawerRef}
        className={`psd-panel ${isMobile ? 'psd-panel--mobile' : ''}`}
        {...drawerVariants}
      >
        {/* Accent strip that matches project card */}
        <div className="psd-accent" />

        {/* ── 1. Top Header (Identical to ProjectCard top row) ── */}
        <header className="psd-header">
          <div className="psd-top-row">
            <span className="psd-category">
              <i className="psd-dot" />
              {category}
            </span>

            {topMetric && <span className="psd-metric">{topMetric}</span>}

            <button
              type="button"
              className="psd-close-btn"
              onClick={onClose}
              aria-label="Close case study"
              title="Press Esc to close"
            >
              <X size={15} />
            </button>
          </div>

          <h2 className="psd-title">{project.title}</h2>
          <p className="psd-desc">{tagline}</p>
        </header>

        {/* ── 2. Metric Boxes Row (Matching --soft card tokens) ── */}
        {metrics.length > 0 && (
          <div className="psd-metrics">
            {metrics.map((m) => (
              <div className="psd-metric-box" key={m.label}>
                <span className="psd-metric-val">{m.value}</span>
                <span className="psd-metric-lbl">{m.label}</span>
                <span className="psd-metric-note">{m.note}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── 3. Segmented Navigation Tabs ── */}
        <div className="psd-tabs-wrap">
          <div className="psd-tabs-nav" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
            {tabs.map((t, i) => (
              <button
                key={t}
                type="button"
                className={`psd-tab-btn ${tab === i ? 'active' : ''}`}
                onClick={() => setTab(i)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* ── 4. Scrollable Body ── */}
        <div className="psd-body">
          <AnimatePresence mode="wait">
            <motion.div
              key={tabs[tab]}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="psd-content"
            >
              {/* TAB: OVERVIEW */}
              {tabs[tab] === 'Overview' && (
                <>
                  <section>
                    <span className="psd-label">About the project</span>
                    <p className="psd-text">{project.description}</p>
                  </section>

                  {/* Connected Pipeline Preview inside Overview */}
                  {pipeline.length > 0 && (
                    <section>
                      <div className="psd-flow">
                        <div className="psd-flow-header">
                          <span className="psd-flow-label">
                            <span className="psd-flow-dot" />
                            Pipeline Architecture
                          </span>
                          <span className="psd-flow-count">{pipeline.length} stages</span>
                        </div>
                        <div className="psd-flow-track">
                          {pipeline.map((step, i) => {
                            const isLast = i === pipeline.length - 1;
                            return (
                              <React.Fragment key={step.id + i}>
                                <div className="psd-flow-node" title={step.name}>
                                  <span className="psd-flow-badge">{i + 1}</span>
                                  <span className="psd-flow-text">{step.name}</span>
                                </div>
                                {!isLast && (
                                  <div className="psd-flow-bridge" aria-hidden="true">
                                    <span className="psd-flow-bridge-line" />
                                    <span className="psd-flow-bridge-arrow">›</span>
                                  </div>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </div>
                    </section>
                  )}

                  <section>
                    <span className="psd-label">Technologies &amp; Frameworks</span>
                    <div className="psd-tech">
                      {stack.map((t, i) => {
                        const label = typeof t === 'string' ? t : t?.name || t;
                        const { Icon, color } = getTechBadge(label);
                        return (
                          <span key={label + i} className="psd-tech-pill">
                            <Icon size={13} style={{ color, flexShrink: 0 }} aria-hidden="true" />
                            <span>{label}</span>
                          </span>
                        );
                      })}
                    </div>
                  </section>

                  <section>
                    <span className="psd-label">Engineering Highlights</span>
                    <div className="psd-features">
                      <div className="psd-feature-item">
                        <CheckCircle2 size={16} className="psd-feat-icon" />
                        <div>
                          <strong>Automated Pipeline Flow</strong>
                          <p>Low latency execution pipeline with automated validation checkpoints.</p>
                        </div>
                      </div>
                      <div className="psd-feature-item">
                        <CheckCircle2 size={16} className="psd-feat-icon" />
                        <div>
                          <strong>Production Ready Architecture</strong>
                          <p>Modularized services for high reliability, security, and scalability.</p>
                        </div>
                      </div>
                    </div>
                  </section>
                </>
              )}

              {/* TAB: PIPELINE */}
              {tabs[tab] === 'Pipeline' && (
                <section>
                  <span className="psd-label">Pipeline Workflow</span>
                  <div className="psd-flow" style={{ marginBottom: 16 }}>
                    <div className="psd-flow-header">
                      <span className="psd-flow-label">
                        <span className="psd-flow-dot" />
                        Connected Stages
                      </span>
                      <span className="psd-flow-count">{pipeline.length} stages</span>
                    </div>
                    <div className="psd-flow-track">
                      {pipeline.map((step, i) => {
                        const isLast = i === pipeline.length - 1;
                        return (
                          <React.Fragment key={step.id + i}>
                            <div className="psd-flow-node" title={step.name}>
                              <span className="psd-flow-badge">{i + 1}</span>
                              <span className="psd-flow-text">{step.name}</span>
                            </div>
                            {!isLast && (
                              <div className="psd-flow-bridge" aria-hidden="true">
                                <span className="psd-flow-bridge-line" />
                                <span className="psd-flow-bridge-arrow">›</span>
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>

                  <div className="psd-stage-details">
                    {pipeline.map((step, idx) => {
                      const Icon = step.icon;
                      return (
                        <div key={step.id + idx} className="psd-stage-card">
                          <span className="psd-stage-num">{idx + 1}</span>
                          <div className="psd-stage-icon">
                            <Icon size={16} />
                          </div>
                          <div className="psd-stage-meta">
                            <h4 className="psd-stage-title">{step.name}</h4>
                            <p className="psd-stage-desc">{step.note}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* TAB: ARCHITECTURE */}
              {tabs[tab] === 'Architecture' && architecture && (
                <section>
                  <span className="psd-label">Architecture Layers</span>
                  <div className="psd-arch-list">
                    {architecture.map((layer, idx) => (
                      <div key={layer.code || idx} className="psd-arch-card">
                        <span className="psd-arch-badge">{layer.code}</span>
                        <div className="psd-arch-content">
                          <h4 className="psd-arch-title">{layer.title}</h4>
                          <p className="psd-arch-body">{layer.body}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* TAB: CODE */}
              {tabs[tab] === 'Code' && codeSnippet && (
                <section>
                  <span className="psd-label">Source Snippet</span>
                  <div className="psd-code-box">
                    <div className="psd-code-header">
                      <div className="psd-code-dots">
                        <span className="dot red" />
                        <span className="dot yellow" />
                        <span className="dot green" />
                      </div>
                      <span className="psd-code-file">{codeSnippet.filename}</span>
                      <button type="button" className="psd-copy-btn" onClick={handleCopyCode}>
                        {copied ? <Check size={12} /> : <Copy size={12} />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre className="psd-code-body">
                      <code>{codeSnippet.snippet}</code>
                    </pre>
                  </div>
                </section>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── 5. Footer Matching ProjectCard Buttons ── */}
        <footer className="psd-footer">
          {sourceUrl ? (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="pc-btn pc-btn-ghost"
              aria-label={`View source code for ${project.title}`}
            >
              <FaGithub size={14} />
              GitHub ↗
            </a>
          ) : <div />}

          {demoUrl ? (
            <a
              href={demoUrl}
              target="_blank"
              rel="noreferrer"
              className="pc-btn"
              aria-label={`Open live demo for ${project.title}`}
            >
              Launch Live Demo <span aria-hidden>→</span>
            </a>
          ) : (
            <span className="psd-internal-label">Internal Project</span>
          )}
        </footer>
      </motion.aside>

      <ProjectDrawerStyles />
    </div>,
    document.body
  );
}

function ProjectDrawerStyles() {
  return (
    <style>{`
      /* Tokens identical to ProjectCard.css: white surface, black buttons, blue accent */
      .psd-panel {
        --accent: #2563eb;
        --ink: #0b0b0f;
        --muted: #5b6270;
        --line: #e6e8ec;
        --soft: #f6f7f9;
      }

      .psd-root {
        position: fixed;
        inset: 0;
        z-index: 99999;
        font-family: var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
        -webkit-font-smoothing: antialiased;
      }

      .psd-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(11, 11, 15, 0.45);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
      }

      /* Slide-over Drawer Panel */
      .psd-panel {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        max-width: 500px;
        background: #fff;
        border-left: 1px solid var(--line);
        box-shadow: -12px 0 40px rgba(15, 23, 42, 0.18);
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        overflow: hidden;
        z-index: 100000;
      }

      .psd-panel--mobile {
        max-width: 100%;
      }

      /* Top accent line */
      .psd-accent {
        height: 3px;
        width: 100%;
        background: var(--accent);
        flex-shrink: 0;
      }

      /* Header */
      .psd-header {
        padding: 20px 22px 16px;
        border-bottom: 1px solid var(--line);
        background: #fff;
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .psd-top-row {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .psd-category {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--muted);
      }

      .psd-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: var(--accent);
      }

      .psd-metric {
        font-size: 11px;
        font-weight: 600;
        padding: 4px 10px;
        border-radius: 999px;
        color: #047857;
        background: #ecfdf5;
        border: 1px solid #c7f0de;
      }

      .psd-close-btn {
        margin-left: auto;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 1px solid var(--line);
        background: #fff;
        color: var(--muted);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        padding: 0;
        transition: all 0.2s ease;
      }

      .psd-close-btn:hover {
        color: var(--ink);
        border-color: var(--ink);
        transform: scale(1.06);
      }

      .psd-title {
        margin: 4px 0 0;
        font-size: 21px;
        line-height: 1.25;
        font-weight: 700;
        color: var(--ink);
      }

      .psd-desc {
        margin: 0;
        font-size: 13.5px;
        line-height: 1.55;
        color: var(--muted);
      }

      /* Metrics Bar */
      .psd-metrics {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
        padding: 12px 22px;
        background: var(--soft);
        border-bottom: 1px solid var(--line);
        flex-shrink: 0;
      }

      .psd-metric-box {
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding: 8px 10px;
        border-radius: 10px;
        background: #fff;
        border: 1px solid var(--line);
      }

      .psd-metric-val {
        font-size: 16px;
        font-weight: 800;
        color: var(--ink);
        letter-spacing: -0.02em;
        line-height: 1.2;
      }

      .psd-metric-lbl {
        font-size: 9.5px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--accent);
      }

      .psd-metric-note {
        font-size: 9.5px;
        color: var(--muted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      /* Tabs */
      .psd-tabs-wrap {
        padding: 10px 22px 8px;
        background: #fff;
        border-bottom: 1px solid var(--line);
        flex-shrink: 0;
      }

      .psd-tabs-nav {
        display: grid;
        gap: 4px;
        background: var(--soft);
        border: 1px solid var(--line);
        border-radius: 10px;
        padding: 3px;
      }

      .psd-tab-btn {
        background: transparent;
        border: none;
        color: var(--muted);
        font-size: 12px;
        font-weight: 600;
        padding: 6px 8px;
        border-radius: 7px;
        cursor: pointer;
        transition: all 0.18s ease;
        text-align: center;
      }

      .psd-tab-btn:hover {
        color: var(--ink);
      }

      .psd-tab-btn.active {
        background: #fff;
        color: var(--accent);
        font-weight: 700;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
      }

      /* Body */
      .psd-body {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        padding: 18px 22px;
        scrollbar-width: thin;
        scrollbar-color: var(--line) transparent;
      }

      .psd-content {
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      .psd-label {
        display: block;
        margin: 0 0 8px;
        font-size: 10.5px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #8a92a0;
      }

      .psd-text {
        margin: 0;
        font-size: 13.5px;
        line-height: 1.6;
        color: var(--muted);
      }

      /* Connected Pipeline Styles (Matching ProjectCard.css) */
      .psd-flow {
        padding: 11px 13px;
        background: var(--soft);
        border: 1px solid var(--line);
        border-radius: 12px;
      }

      .psd-flow-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 9px;
      }

      .psd-flow-label {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--muted);
      }

      .psd-flow-dot {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: var(--accent);
      }

      .psd-flow-count {
        font-size: 9.5px;
        font-weight: 600;
        color: var(--muted);
        background: color-mix(in srgb, var(--ink) 6%, transparent);
        padding: 1px 6px;
        border-radius: 4px;
      }

      .psd-flow-track {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 2px;
        overflow-x: auto;
        scrollbar-width: none;
        -ms-overflow-style: none;
        padding: 2px 0;
      }

      .psd-flow-track::-webkit-scrollbar {
        display: none;
      }

      .psd-flow-node {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 2.5px 7px 2.5px 2.5px;
        background: #fff;
        border: 1px solid var(--line);
        border-radius: 999px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        flex-shrink: 0;
      }

      .psd-flow-badge {
        display: grid;
        place-items: center;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: var(--accent);
        color: #fff;
        font-size: 9px;
        font-weight: 800;
        flex-shrink: 0;
      }

      .psd-flow-text {
        font-size: 11px;
        font-weight: 600;
        color: var(--ink);
        white-space: nowrap;
      }

      .psd-flow-bridge {
        display: flex;
        align-items: center;
        position: relative;
        flex: 1;
        min-width: 8px;
        max-width: 22px;
        margin: 0 1px;
        flex-shrink: 0;
      }

      .psd-flow-bridge-line {
        width: 100%;
        height: 1.5px;
        background: color-mix(in srgb, var(--accent) 30%, var(--line));
        border-radius: 1px;
      }

      .psd-flow-bridge-arrow {
        position: absolute;
        right: -2px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 11px;
        font-weight: 800;
        color: var(--accent);
        line-height: 1;
      }

      /* Detailed Stage List for Pipeline Tab */
      .psd-stage-details {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .psd-stage-card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 14px;
        border-radius: 12px;
        background: var(--soft);
        border: 1px solid var(--line);
      }

      .psd-stage-num {
        display: grid;
        place-items: center;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: var(--accent);
        color: #fff;
        font-size: 11px;
        font-weight: 800;
        flex-shrink: 0;
      }

      .psd-stage-icon {
        color: var(--accent);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .psd-stage-meta {
        flex: 1;
        min-width: 0;
      }

      .psd-stage-title {
        margin: 0 0 2px;
        font-size: 13px;
        font-weight: 700;
        color: var(--ink);
      }

      .psd-stage-desc {
        margin: 0;
        font-size: 11.5px;
        color: var(--muted);
      }

      /* Tech chips (Matching ProjectCard.css) */
      .psd-tech {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .psd-tech-pill {
        display: inline-flex;
        align-items: center;
        gap: 6.5px;
        font-size: 12px;
        font-weight: 550;
        padding: 4.5px 10px;
        color: #374151;
        background: var(--soft);
        border: 1px solid var(--line);
        border-radius: 8px;
        transition: all 0.15s ease;
      }

      .psd-tech-pill:hover {
        background: #ffffff;
        border-color: #cbd5e1;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
      }

      .psd-tech-pill span {
        font-size: 12px;
        font-weight: 550;
        color: inherit;
        line-height: 1;
      }

      :root[data-theme="dark"] .psd-tech-pill,
      .dark .psd-tech-pill {
        color: #cbd2dd;
        background: #161a22;
        border-color: var(--line);
      }
      :root[data-theme="dark"] .psd-tech-pill:hover,
      .dark .psd-tech-pill:hover {
        background: #1c212c;
        border-color: #3b4354;
      }

      /* Features */
      .psd-features {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .psd-feature-item {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 10px 12px;
        border-radius: 10px;
        background: var(--soft);
        border: 1px solid var(--line);
      }

      .psd-feat-icon {
        color: #047857;
        flex-shrink: 0;
        margin-top: 1px;
      }

      .psd-feature-item strong {
        display: block;
        font-size: 12.5px;
        font-weight: 700;
        color: var(--ink);
        margin-bottom: 2px;
      }

      .psd-feature-item p {
        margin: 0;
        font-size: 12px;
        color: var(--muted);
        line-height: 1.45;
      }

      /* Architecture List */
      .psd-arch-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .psd-arch-card {
        display: flex;
        gap: 12px;
        padding: 12px 14px;
        border-radius: 12px;
        background: var(--soft);
        border: 1px solid var(--line);
      }

      .psd-arch-badge {
        font-size: 10.5px;
        font-weight: 800;
        color: var(--accent);
        background: color-mix(in srgb, var(--accent) 12%, transparent);
        padding: 2px 7px;
        border-radius: 6px;
        height: fit-content;
        flex-shrink: 0;
      }

      .psd-arch-content {
        flex: 1;
        min-width: 0;
      }

      .psd-arch-title {
        margin: 0 0 3px;
        font-size: 13px;
        font-weight: 700;
        color: var(--ink);
      }

      .psd-arch-body {
        margin: 0;
        font-size: 12px;
        line-height: 1.45;
        color: var(--muted);
      }

      /* Code Snippet */
      .psd-code-box {
        border-radius: 12px;
        border: 1px solid var(--line);
        background: var(--soft);
        overflow: hidden;
      }

      .psd-code-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border-bottom: 1px solid var(--line);
        background: #fff;
      }

      .psd-code-dots {
        display: flex;
        gap: 5px;
      }

      .psd-code-dots .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }

      .dot.red { background: #ef4444; }
      .dot.yellow { background: #f59e0b; }
      .dot.green { background: #10b981; }

      .psd-code-file {
        font-size: 11px;
        font-weight: 600;
        color: var(--muted);
        margin-left: 4px;
      }

      .psd-copy-btn {
        margin-left: auto;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 3px 8px;
        border-radius: 6px;
        font-size: 10.5px;
        font-weight: 600;
        border: 1px solid var(--line);
        background: var(--soft);
        color: var(--ink);
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .psd-copy-btn:hover {
        background: var(--ink);
        color: #fff;
      }

      .psd-code-body {
        margin: 0;
        padding: 14px;
        font-family: var(--font-mono, monospace);
        font-size: 12px;
        line-height: 1.6;
        color: var(--ink);
        overflow-x: auto;
      }

      /* Footer */
      .psd-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 14px 22px;
        border-top: 1px solid var(--line);
        background: #fff;
        flex-shrink: 0;
      }

      .psd-internal-label {
        font-size: 12px;
        color: var(--muted);
        font-weight: 500;
      }

      /* Dark mode matching ProjectCard.css */
      :root[data-theme="dark"] .psd-panel,
      .dark .psd-panel {
        --ink: #f3f4f6;
        --muted: #a3acba;
        --line: #2a2f3a;
        --soft: #161a22;
        background: #0f1218;
      }

      :root[data-theme="dark"] .psd-header,
      .dark .psd-header,
      :root[data-theme="dark"] .psd-tabs-wrap,
      .dark .psd-tabs-wrap,
      :root[data-theme="dark"] .psd-footer,
      .dark .psd-footer,
      :root[data-theme="dark"] .psd-code-header,
      .dark .psd-code-header {
        background: #0f1218;
      }

      :root[data-theme="dark"] .psd-metric-box,
      .dark .psd-metric-box,
      :root[data-theme="dark"] .psd-close-btn,
      .dark .psd-close-btn,
      :root[data-theme="dark"] .psd-tab-btn.active,
      .dark .psd-tab-btn.active,
      :root[data-theme="dark"] .psd-flow-node,
      .dark .psd-flow-node,
      :root[data-theme="dark"] .psd-tech span,
      .dark .psd-tech span {
        background: #161a22;
        color: #cbd2dd;
      }

      :root[data-theme="dark"] .psd-metric {
        background: rgba(16, 185, 129, 0.15);
        color: #34d399;
        border-color: rgba(16, 185, 129, 0.3);
      }

      :root[data-theme="dark"] .psd-btn-ghost {
        background: #161a22;
        color: var(--ink);
      }
    `}</style>
  );
}
