import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  X, ExternalLink, Code2, Copy, Check, Sparkles,
  MessageSquare, Database, ShieldCheck, TrendingUp, Newspaper,
  Brain, Eye, Smile, Receipt, Sliders, Layers,
  Cpu, Terminal, CheckCircle2, ArrowUpRight, Zap, Globe
} from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { getTechBadge } from './ProjectCard';

const pipelineIconMap = {
  MessageSquare, Database, ShieldCheck, TrendingUp, Newspaper,
  Brain, Eye, Smile, Receipt, Sliders, Layers, Cpu, Zap, Terminal
};

export default function ProjectModal({ project, onClose, isMobile = false }) {
  const [tab, setTab] = useState(0);
  const [copied, setCopied] = useState(false);
  const triggerElementRef = useRef(null);
  const drawerRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    triggerElementRef.current = document.activeElement;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusable = drawerRef.current?.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    focusable?.focus();
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      triggerElementRef.current?.focus?.();
    };
  }, [onClose]);

  if (!project) return null;

  const category = (project.category || project.tags?.[0] || 'AI / ML');
  const tagline = project.tagline || project.description || '';

  const rawMetrics = project.metrics || (project.stats ? project.stats.map((s) => ({
    label: s.label || 'METRIC',
    value: `${s.prefix || ''}${s.value}${s.suffix || ''}`,
    note: s.note || 'Validated'
  })) : []);
  const metrics = rawMetrics.slice(0, 3);

  const rawPipeline = project.pipeline || [];
  const pipeline = rawPipeline.map((p, i) => {
    let IconComp = Sparkles;
    if (p.icon && (typeof p.icon === 'function' || typeof p.icon === 'object')) {
      IconComp = p.icon;
    } else if (p.iconName && pipelineIconMap[p.iconName]) {
      IconComp = pipelineIconMap[p.iconName];
    }
    return {
      id: p.id || `s${i}`,
      icon: IconComp,
      name: p.name || p.label || `Stage ${i + 1}`,
      note: p.note || 'Pipeline processing'
    };
  });

  const stack = project.stack || project.tags || [];

  const architecture = project.architecture
    ? (typeof project.architecture[0] === 'string'
        ? project.architecture.map((s, i) => ({
            code: `L0${i + 1}`,
            title: `Layer ${i + 1}: ${s}`,
            body: `Decoupled service handling ${s.toLowerCase()} with resilient retry policies and streaming telemetry.`
          }))
        : project.architecture)
    : null;

  const codeSnippet = typeof project.code === 'string'
    ? { filename: 'pipeline.py', snippet: project.code }
    : project.code || null;

  const sourceUrl = project.links?.source || project.githubUrl;
  const demoUrl = project.links?.demo || project.liveUrl;

  const handleCopyCode = () => {
    const text = codeSnippet?.snippet || '';
    if (!text) return;
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const tabs = ['Overview'];
  if (pipeline.length > 0) tabs.push('Pipeline');
  if (architecture) tabs.push('Architecture');
  if (codeSnippet) tabs.push('Code');

  const drawerVariants = prefersReducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.15 } }
    : isMobile
    ? { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' }, transition: { type: 'tween', ease: [0.16, 1, 0.3, 1], duration: 0.3 } }
    : { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%' }, transition: { type: 'spring', damping: 32, stiffness: 340, mass: 0.85 } };

  return createPortal(
    <div className="psd-root" role="dialog" aria-modal="true" aria-label={project.title}>
      {/* Backdrop */}
      <motion.div
        className="psd-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        onClick={onClose}
      />

      {/* Drawer */}
      <motion.aside ref={drawerRef} className={`psd-panel${isMobile ? ' psd-panel--mobile' : ''}`} {...drawerVariants}>

        {/* Top accent gradient bar */}
        <div className="psd-accent-bar" />

        {/* ── HEADER ── */}
        <header className="psd-header">
          <div className="psd-header-top">
            <span className="psd-category-badge">
              <span className="psd-cat-dot" />
              {category}
            </span>
            <button type="button" className="psd-close" onClick={onClose} aria-label="Close">
              <X size={14} strokeWidth={2.5} />
            </button>
          </div>

          <h2 className="psd-title">{project.title}</h2>
          <p className="psd-tagline">{tagline}</p>

          {/* Metric pills row */}
          {metrics.length > 0 && (
            <div className="psd-metric-row">
              {metrics.map((m) => (
                <div className="psd-metric-chip" key={m.label}>
                  <span className="psd-metric-chip-val">{m.value}</span>
                  <span className="psd-metric-chip-lbl">{m.label}</span>
                </div>
              ))}
            </div>
          )}
        </header>

        {/* ── TABS ── */}
        <div className="psd-tabs-bar">
          <div className="psd-tabs-track" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
            {tabs.map((t, i) => (
              <button
                key={t}
                type="button"
                className={`psd-tab${tab === i ? ' psd-tab--active' : ''}`}
                onClick={() => setTab(i)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="psd-body">
          <AnimatePresence mode="wait">
            <motion.div
              key={tabs[tab]}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
              className="psd-content"
            >

              {/* TAB: OVERVIEW */}
              {tabs[tab] === 'Overview' && (
                <>
                  {/* About */}
                  <section className="psd-section">
                    <span className="psd-section-label">About</span>
                    <p className="psd-about-text">{project.description}</p>
                  </section>

                  {/* Pipeline mini-map */}
                  {pipeline.length > 0 && (
                    <section className="psd-section">
                      <span className="psd-section-label">Pipeline</span>
                      <div className="psd-flow-box">
                        <div className="psd-flow-track">
                          {pipeline.map((step, i) => {
                            const isLast = i === pipeline.length - 1;
                            const Icon = step.icon;
                            return (
                              <React.Fragment key={step.id + i}>
                                <div className="psd-flow-node" title={step.name}>
                                  <span className="psd-flow-icon"><Icon size={11} /></span>
                                  <span className="psd-flow-num">{i + 1}</span>
                                  <span className="psd-flow-text">{step.name}</span>
                                </div>
                                {!isLast && (
                                  <div className="psd-flow-bridge" aria-hidden="true">
                                    <span className="psd-flow-line" />
                                    <span className="psd-flow-arrow">›</span>
                                  </div>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Tech stack */}
                  {stack.length > 0 && (
                    <section className="psd-section">
                      <span className="psd-section-label">Tech Stack</span>
                      <div className="psd-tech-grid">
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
                  )}

                  {/* Key highlights */}
                  <section className="psd-section">
                    <span className="psd-section-label">Highlights</span>
                    <div className="psd-highlights">
                      <div className="psd-hl-item">
                        <span className="psd-hl-icon"><CheckCircle2 size={14} /></span>
                        <div>
                          <strong>End-to-end ML Pipeline</strong>
                          <p>Fully automated data ingestion, transformation, and inference with sub-second SLA.</p>
                        </div>
                      </div>
                      <div className="psd-hl-item">
                        <span className="psd-hl-icon"><CheckCircle2 size={14} /></span>
                        <div>
                          <strong>Production-Grade Architecture</strong>
                          <p>Modular, horizontally scalable services with rate limiting, PII masking, and retry logic.</p>
                        </div>
                      </div>
                    </div>
                  </section>
                </>
              )}

              {/* TAB: PIPELINE */}
              {tabs[tab] === 'Pipeline' && (
                <section className="psd-section">
                  <span className="psd-section-label">Pipeline Stages</span>
                  {/* Visual flow */}
                  <div className="psd-flow-box" style={{ marginBottom: 14 }}>
                    <div className="psd-flow-track">
                      {pipeline.map((step, i) => {
                        const isLast = i === pipeline.length - 1;
                        const Icon = step.icon;
                        return (
                          <React.Fragment key={step.id + i}>
                            <div className="psd-flow-node" title={step.name}>
                              <span className="psd-flow-icon"><Icon size={11} /></span>
                              <span className="psd-flow-num">{i + 1}</span>
                              <span className="psd-flow-text">{step.name}</span>
                            </div>
                            {!isLast && (
                              <div className="psd-flow-bridge" aria-hidden="true">
                                <span className="psd-flow-line" />
                                <span className="psd-flow-arrow">›</span>
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>

                  {/* Stage detail cards */}
                  <div className="psd-stage-list">
                    {pipeline.map((step, idx) => {
                      const Icon = step.icon;
                      return (
                        <div key={step.id + idx} className="psd-stage-card">
                          <div className="psd-stage-num-wrap">
                            <span className="psd-stage-num">{idx + 1}</span>
                          </div>
                          <div className="psd-stage-icon-wrap">
                            <Icon size={15} />
                          </div>
                          <div className="psd-stage-meta">
                            <h4 className="psd-stage-title">{step.name}</h4>
                            <p className="psd-stage-note">{step.note}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* TAB: ARCHITECTURE */}
              {tabs[tab] === 'Architecture' && architecture && (
                <section className="psd-section">
                  <span className="psd-section-label">System Architecture</span>
                  <div className="psd-arch-list">
                    {architecture.map((layer, idx) => (
                      <div key={layer.code || idx} className="psd-arch-card">
                        <span className="psd-arch-badge">{layer.code}</span>
                        <div className="psd-arch-body">
                          <h4 className="psd-arch-title">{layer.title}</h4>
                          <p className="psd-arch-text">{layer.body}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* TAB: CODE */}
              {tabs[tab] === 'Code' && codeSnippet && (
                <section className="psd-section">
                  <span className="psd-section-label">Code Snippet</span>
                  <div className="psd-code-box">
                    <div className="psd-code-header">
                      <div className="psd-code-dots">
                        <span className="psd-dot-red" />
                        <span className="psd-dot-yellow" />
                        <span className="psd-dot-green" />
                      </div>
                      <span className="psd-code-filename">{codeSnippet.filename}</span>
                      <button type="button" className="psd-copy-btn" onClick={handleCopyCode}>
                        {copied ? <Check size={11} /> : <Copy size={11} />}
                        <span>{copied ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre className="psd-code-body"><code>{codeSnippet.snippet}</code></pre>
                  </div>
                </section>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── FOOTER ── */}
        <footer className="psd-footer">
          {sourceUrl && sourceUrl !== '#' ? (
            <a href={sourceUrl} target="_blank" rel="noreferrer" className="psd-btn psd-btn-ghost">
              <FaGithub size={14} />
              GitHub
            </a>
          ) : <div />}

          {demoUrl && demoUrl !== '#' ? (
            <a href={demoUrl} target="_blank" rel="noreferrer" className="psd-btn psd-btn-primary">
              <Globe size={13} />
              Live Demo <span aria-hidden>→</span>
            </a>
          ) : (
            <span className="psd-internal-tag">Internal Project</span>
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
      /* ── Design tokens (match ProjectCard.css exactly) ── */
      .psd-panel {
        --accent: #2563eb;
        --accent-lite: rgba(37,99,235,0.1);
        --ink: #0b0b0f;
        --muted: #5b6270;
        --line: #e6e8ec;
        --soft: #f6f7f9;
        --green: #047857;
        --green-bg: #ecfdf5;
        --green-border: #c7f0de;
      }

      /* ── Root overlay ── */
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
        background: rgba(11, 11, 15, 0.42);
        backdrop-filter: blur(5px);
        -webkit-backdrop-filter: blur(5px);
      }

      /* ── Panel ── */
      .psd-panel {
        position: fixed;
        top: 0; right: 0; bottom: 0;
        width: 100%;
        max-width: 580px;
        background: #fff;
        border-left: 1px solid var(--line);
        box-shadow: -16px 0 48px -4px rgba(15,23,42,0.16);
        display: flex;
        flex-direction: column;
        z-index: 100000;
        overflow: hidden;
        box-sizing: border-box;
      }

      .psd-panel--mobile {
        max-width: 100%;
        top: auto;
        border-left: none;
        border-top: 1px solid var(--line);
        border-radius: 20px 20px 0 0;
        height: 92dvh;
      }

      /* Accent gradient bar at top */
      .psd-accent-bar {
        height: 3px;
        flex-shrink: 0;
        background: linear-gradient(90deg, var(--accent) 0%, #7c3aed 60%, #06b6d4 100%);
      }

      /* ── HEADER ── */
      .psd-header {
        padding: 12px 20px 10px;
        border-bottom: 1px solid var(--line);
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        gap: 7px;
        background: #fff;
      }

      .psd-header-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .psd-category-badge {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.07em;
        text-transform: uppercase;
        color: var(--muted);
      }

      .psd-cat-dot {
        display: inline-block;
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: var(--accent);
        flex-shrink: 0;
      }

      .psd-close {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 1px solid var(--line);
        background: var(--soft);
        color: var(--muted);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        padding: 0;
        flex-shrink: 0;
        transition: background 0.18s ease, color 0.18s ease, transform 0.18s ease;
      }

      .psd-close:hover {
        background: var(--ink);
        color: #fff;
        border-color: var(--ink);
        transform: rotate(90deg) scale(1.05);
      }

      .psd-title {
        margin: 0;
        font-size: 19px;
        font-weight: 800;
        line-height: 1.2;
        color: var(--ink);
        letter-spacing: -0.02em;
      }

      .psd-tagline {
        margin: 0;
        font-size: 12.5px;
        line-height: 1.55;
        color: var(--muted);
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      /* Metric pills row */
      .psd-metric-row {
        display: flex;
        gap: 7px;
        flex-wrap: wrap;
      }

      .psd-metric-chip {
        display: inline-flex;
        align-items: baseline;
        gap: 5px;
        padding: 4px 9px;
        border-radius: 999px;
        background: var(--soft);
        border: 1px solid var(--line);
      }

      .psd-metric-chip-val {
        font-size: 13px;
        font-weight: 800;
        color: var(--ink);
        letter-spacing: -0.02em;
        line-height: 1;
      }

      .psd-metric-chip-lbl {
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--accent);
      }

      /* ── TABS ── */
      .psd-tabs-bar {
        padding: 7px 20px 6px;
        border-bottom: 1px solid var(--line);
        flex-shrink: 0;
        background: #fff;
      }

      .psd-tabs-track {
        display: grid;
        gap: 3px;
        background: var(--soft);
        border: 1px solid var(--line);
        border-radius: 10px;
        padding: 3px;
      }

      .psd-tab {
        background: transparent;
        border: none;
        font-size: 12px;
        font-weight: 600;
        color: var(--muted);
        padding: 6px 8px;
        border-radius: 7px;
        cursor: pointer;
        transition: all 0.16s ease;
        text-align: center;
        letter-spacing: 0.01em;
      }

      .psd-tab:hover { color: var(--ink); }

      .psd-tab--active {
        background: #fff;
        color: var(--accent);
        font-weight: 700;
        box-shadow: 0 1px 4px rgba(0,0,0,0.09);
      }

      /* ── BODY ── */
      .psd-body {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        padding: 13px 20px;
        scrollbar-width: thin;
        scrollbar-color: var(--line) transparent;
      }

      .psd-body::-webkit-scrollbar { width: 4px; }
      .psd-body::-webkit-scrollbar-thumb { background: var(--line); border-radius: 4px; }

      .psd-content {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      /* ── Sections ── */
      .psd-section {
        display: flex;
        flex-direction: column;
      }

      .psd-section-label {
        display: block;
        margin-bottom: 6px;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: #9aa2b4;
      }

      .psd-about-text {
        margin: 0;
        font-size: 13px;
        line-height: 1.6;
        color: var(--muted);
      }

      /* ── Pipeline flow box ── */
      .psd-flow-box {
        padding: 9px 12px;
        background: var(--soft);
        border: 1px solid var(--line);
        border-radius: 12px;
      }

      .psd-flow-track {
        display: flex;
        align-items: center;
        gap: 2px;
        overflow-x: auto;
        scrollbar-width: none;
        padding: 2px 0;
      }

      .psd-flow-track::-webkit-scrollbar { display: none; }

      .psd-flow-node {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 3px 9px 3px 4px;
        background: #fff;
        border: 1px solid var(--line);
        border-radius: 999px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        flex-shrink: 0;
        transition: border-color 0.15s ease, transform 0.15s ease;
        cursor: default;
      }

      .psd-flow-node:hover {
        border-color: var(--accent);
        transform: translateY(-1px);
      }

      .psd-flow-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: color-mix(in srgb, var(--ink) 10%, transparent);
        color: var(--ink);
        flex-shrink: 0;
      }

      .psd-flow-num {
        display: none;
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
        min-width: 10px;
        max-width: 24px;
        flex-shrink: 0;
      }

      .psd-flow-line {
        width: 100%;
        height: 1.5px;
        background: color-mix(in srgb, var(--ink) 20%, var(--line));
        border-radius: 1px;
        display: block;
      }

      .psd-flow-arrow {
        position: absolute;
        right: -2px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 11px;
        font-weight: 900;
        color: var(--ink);
        line-height: 1;
      }

      /* ── Tech pills ── */
      .psd-tech-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .psd-tech-pill {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 11.5px;
        font-weight: 500;
        padding: 3px 9px;
        color: #374151;
        background: var(--soft);
        border: 1px solid var(--line);
        border-radius: 8px;
        transition: all 0.15s ease;
      }

      .psd-tech-pill:hover {
        background: #fff;
        border-color: #cbd5e1;
        box-shadow: 0 2px 6px rgba(0,0,0,0.05);
      }

      .psd-tech-pill span {
        font-size: 11.5px;
        font-weight: 500;
        color: inherit;
        line-height: 1;
      }

      /* ── Highlights ── */
      .psd-highlights {
        display: flex;
        flex-direction: column;
        gap: 7px;
      }

      .psd-hl-item {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 9px 11px;
        background: var(--soft);
        border: 1px solid var(--line);
        border-radius: 11px;
      }

      .psd-hl-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 22px;
        height: 22px;
        border-radius: 7px;
        background: var(--green-bg);
        border: 1px solid var(--green-border);
        color: var(--green);
        flex-shrink: 0;
      }

      .psd-hl-item strong {
        display: block;
        font-size: 12px;
        font-weight: 700;
        color: var(--ink);
        margin-bottom: 2px;
      }

      .psd-hl-item p {
        margin: 0;
        font-size: 11.5px;
        color: var(--muted);
        line-height: 1.45;
      }

      /* ── Pipeline tab: stage cards ── */
      .psd-stage-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .psd-stage-card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 11px 14px;
        background: var(--soft);
        border: 1px solid var(--line);
        border-radius: 12px;
        transition: border-color 0.15s ease;
      }

      .psd-stage-card:hover { border-color: var(--accent); }

      .psd-stage-num-wrap {
        flex-shrink: 0;
      }

      .psd-stage-num {
        display: grid;
        place-items: center;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: #0b0b0f;
        color: #ffffff !important;
        font-size: 11px;
        font-weight: 800;
      }

      .psd-stage-icon-wrap {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        border-radius: 9px;
        background: var(--accent-lite);
        color: var(--accent);
        flex-shrink: 0;
      }

      .psd-stage-meta { flex: 1; min-width: 0; }

      .psd-stage-title {
        margin: 0 0 2px;
        font-size: 13px;
        font-weight: 700;
        color: var(--ink);
      }

      .psd-stage-note {
        margin: 0;
        font-size: 11.5px;
        color: var(--muted);
        line-height: 1.4;
      }

      /* ── Architecture ── */
      .psd-arch-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .psd-arch-card {
        display: flex;
        gap: 13px;
        padding: 13px 14px;
        background: var(--soft);
        border: 1px solid var(--line);
        border-radius: 12px;
      }

      .psd-arch-badge {
        font-size: 10px;
        font-weight: 800;
        color: var(--accent);
        background: var(--accent-lite);
        padding: 3px 8px;
        border-radius: 6px;
        height: fit-content;
        flex-shrink: 0;
        letter-spacing: 0.04em;
      }

      .psd-arch-body { flex: 1; min-width: 0; }

      .psd-arch-title {
        margin: 0 0 4px;
        font-size: 13px;
        font-weight: 700;
        color: var(--ink);
      }

      .psd-arch-text {
        margin: 0;
        font-size: 12px;
        color: var(--muted);
        line-height: 1.5;
      }

      /* ── Code ── */
      .psd-code-box {
        border-radius: 12px;
        border: 1px solid var(--line);
        overflow: hidden;
        background: var(--soft);
      }

      .psd-code-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border-bottom: 1px solid var(--line);
        background: #fff;
      }

      .psd-code-dots { display: flex; gap: 5px; }
      .psd-dot-red   { width: 9px; height: 9px; border-radius: 50%; background: #ef4444; }
      .psd-dot-yellow{ width: 9px; height: 9px; border-radius: 50%; background: #f59e0b; }
      .psd-dot-green { width: 9px; height: 9px; border-radius: 50%; background: #10b981; }

      .psd-code-filename {
        font-size: 11px;
        font-weight: 600;
        color: var(--muted);
        margin-left: 4px;
        flex: 1;
      }

      .psd-copy-btn {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 3px 9px;
        border-radius: 6px;
        font-size: 10.5px;
        font-weight: 600;
        border: 1px solid var(--line);
        background: var(--soft);
        color: var(--ink);
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .psd-copy-btn:hover { background: var(--ink); color: #fff; border-color: var(--ink); }

      .psd-code-body {
        margin: 0;
        padding: 14px;
        font-family: var(--font-mono, 'Fira Code', 'Cascadia Code', monospace);
        font-size: 12px;
        line-height: 1.65;
        color: var(--ink);
        overflow-x: auto;
        white-space: pre;
      }

      /* ── FOOTER ── */
      .psd-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 10px 20px 13px;
        border-top: 1px solid var(--line);
        background: #fff;
        flex-shrink: 0;
      }

      /* Buttons - identical to .pc-btn in ProjectCard.css */
      .psd-btn {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 9px 16px;
        font-size: 13px;
        font-weight: 600;
        border-radius: 10px;
        text-decoration: none;
        transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
        cursor: pointer;
        border: none;
      }

      .psd-btn span {
        transition: transform 0.2s ease;
        display: inline-block;
      }

      .psd-btn-primary {
        background: var(--ink);
        color: #fff;
      }

      .psd-btn-primary:hover {
        background: var(--accent);
      }

      .psd-btn-primary:hover span {
        transform: translateX(3px);
      }

      .psd-btn-ghost {
        background: #fff;
        color: var(--ink);
        border: 1px solid var(--line);
      }

      .psd-btn-ghost:hover {
        background: var(--ink);
        color: #fff;
        border-color: var(--ink);
      }

      .psd-internal-tag {
        font-size: 12px;
        color: var(--muted);
        font-weight: 500;
        font-style: italic;
      }

      /* ── DARK MODE ── */
      :root[data-theme="dark"] .psd-panel,
      .dark .psd-panel {
        --ink: #f1f3f7;
        --muted: #a3acba;
        --line: #252c3a;
        --soft: #141820;
        --accent-lite: rgba(37,99,235,0.15);
        background: #0d1017;
      }

      :root[data-theme="dark"] .psd-header,
      .dark .psd-header,
      :root[data-theme="dark"] .psd-tabs-bar,
      .dark .psd-tabs-bar,
      :root[data-theme="dark"] .psd-footer,
      .dark .psd-footer,
      :root[data-theme="dark"] .psd-code-header,
      .dark .psd-code-header {
        background: #0d1017;
        border-color: var(--line);
      }

      :root[data-theme="dark"] .psd-flow-node,
      .dark .psd-flow-node {
        background: #141820;
        border-color: var(--line);
      }

      :root[data-theme="dark"] .psd-metric-chip,
      .dark .psd-metric-chip {
        background: #141820;
        border-color: var(--line);
      }

      :root[data-theme="dark"] .psd-metric-chip-val,
      .dark .psd-metric-chip-val {
        color: var(--ink);
      }

      :root[data-theme="dark"] .psd-tech-pill,
      .dark .psd-tech-pill {
        color: #c5cdd9;
        background: #141820;
        border-color: var(--line);
      }

      :root[data-theme="dark"] .psd-tech-pill:hover,
      .dark .psd-tech-pill:hover {
        background: #1a2030;
        border-color: #3a4255;
      }

      :root[data-theme="dark"] .psd-btn-ghost,
      .dark .psd-btn-ghost {
        background: #141820;
        color: var(--ink);
        border-color: var(--line);
      }

      :root[data-theme="dark"] .psd-btn-ghost:hover,
      .dark .psd-btn-ghost:hover {
        background: var(--ink);
        color: #0d1017;
        border-color: var(--ink);
      }

      :root[data-theme="dark"] .psd-btn-primary,
      .dark .psd-btn-primary {
        background: #f1f3f7;
        color: #0d1017;
      }

      :root[data-theme="dark"] .psd-btn-primary:hover,
      .dark .psd-btn-primary:hover {
        background: var(--accent);
        color: #fff;
      }

      :root[data-theme="dark"] .psd-close,
      .dark .psd-close {
        background: #141820;
        border-color: var(--line);
      }

      :root[data-theme="dark"] .psd-tab--active,
      .dark .psd-tab--active {
        background: #1a2030;
      }

      :root[data-theme="dark"] .psd-code-body,
      .dark .psd-code-body {
        color: #d1d9e8;
      }

      :root[data-theme="dark"] .psd-hl-item,
      .dark .psd-hl-item,
      :root[data-theme="dark"] .psd-stage-card,
      .dark .psd-stage-card,
      :root[data-theme="dark"] .psd-arch-card,
      .dark .psd-arch-card {
        background: #141820;
        border-color: var(--line);
      }
    `}</style>
  );
}
