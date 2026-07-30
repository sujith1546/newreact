import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  X, ExternalLink, Code2, Copy, Check, Sparkles,
  MessageSquare, Database, ShieldCheck, TrendingUp, Newspaper,
  Brain, Eye, Smile, Receipt, Sliders, Layers, GitMerge, Circle, ArrowUpRight
} from 'lucide-react';
import { FaGithub } from 'react-icons/fa';

const pipelineIconMap = {
  MessageSquare, Database, ShieldCheck, TrendingUp, Newspaper,
  Brain, Eye, Smile, Receipt, Sliders, Layers
};

export default function ProjectModal({ project, onClose, isMobile = false }) {
  const [tab, setTab] = useState(0);
  const [copied, setCopied] = useState(false);
  const triggerElementRef = useRef(null);
  const modalRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  // Save active element for focus restoration & body lock
  useEffect(() => {
    triggerElementRef.current = document.activeElement;
    
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusable = modalRef.current?.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    focusable?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      triggerElementRef.current?.focus?.();
    };
  }, [onClose]);

  if (!project) return null;

  // Data normalization logic
  const refCode = project.ref || `SF-${String(project.id || 4).padStart(2, '0')}`;
  const category = (project.category || project.tags?.[0] || 'DATA SCIENCE').toUpperCase();
  const status = project.status || (project.liveUrl ? 'LIVE' : 'FEATURED');
  const tagline = project.tagline || project.description || '';

  // Metrics / Stats normalization (up to 3 items)
  const rawMetrics = project.metrics || (project.stats ? project.stats.map(s => ({
    label: s.label?.toUpperCase() || 'METRIC',
    value: `${s.prefix || ''}${s.value}${s.suffix || ''}`,
    note: s.note || 'measured throughput'
  })) : [
    { label: 'THROUGHPUT', value: '600+', note: 'sustained req/hr' },
    { label: 'P95 LATENCY', value: '<2s', note: 'end to end' },
    { label: 'ACCURACY', value: '0.883', note: 'validated R2 score' }
  ]);
  const metrics = rawMetrics.slice(0, 3);

  // Pipeline steps normalization
  const rawPipeline = project.pipeline || [
    { id: '01', iconName: 'MessageSquare', label: 'Data Ingestion', note: 'raw input stream' },
    { id: '02', iconName: 'Database', label: 'RAG & Vector Search', note: 'ChromaDB retrieval' },
    { id: '03', iconName: 'ShieldCheck', label: 'Fraud Detection', note: 'multi-factor scan' },
    { id: '04', iconName: 'TrendingUp', label: 'Insight Output', note: 'PII redacted' }
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
      name: p.name || p.label || `Step 0${i + 1}`,
      note: p.note || 'processed step'
    };
  });

  // Stack normalization
  const stack = project.stack || project.tags || ['Python', 'FastAPI', 'React', 'Scikit-learn'];

  // Architecture normalization
  const architecture = project.architecture ? (
    typeof project.architecture[0] === 'string'
      ? project.architecture.map((stepStr, i) => ({
          code: `A0${i + 1}`,
          title: `Layer 0${i + 1}`,
          body: stepStr
        }))
      : project.architecture
  ) : null;

  // Code snippet normalization
  const codeSnippet = typeof project.code === 'string'
    ? { filename: 'pipeline_model.py', lang: 'python', snippet: project.code }
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

  // Build available tabs dynamically
  const tabs = ['OVERVIEW'];
  if (architecture) tabs.push('ARCHITECTURE');
  if (codeSnippet) tabs.push('CODE');

  const animationProps = prefersReducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.15 } }
    : isMobile
    ? { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' }, transition: { type: 'tween', ease: [0.16, 1, 0.3, 1], duration: 0.3 } }
    : { initial: { scale: 0.96, opacity: 0, y: 12 }, animate: { scale: 1, opacity: 1, y: 0 }, exit: { scale: 0.96, opacity: 0, y: 12 }, transition: { type: 'spring', damping: 28, stiffness: 340 } };

  return createPortal(
    <AnimatePresence>
      <div className="pm-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
        <motion.div
          ref={modalRef}
          className={`pm-panel ${isMobile ? 'pm-panel--mobile' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-label={project.title}
          {...animationProps}
        >
          {/* Engineering Spec-Sheet Crop Marks */}
          <span className="pm-crop pm-crop-tl" />
          <span className="pm-crop pm-crop-tr" />
          <span className="pm-crop pm-crop-bl" />
          <span className="pm-crop pm-crop-br" />

          {/* Spec Header */}
          <div className="pm-head">
            <div className="pm-head-top">
              <div className="pm-ref">
                CASE // <span>{refCode}</span>
              </div>
              <div className="pm-status">
                <span className="pm-status-dot" />
                {status}
              </div>
              <button className="pm-close" onClick={onClose} aria-label="Close modal">
                <X size={15} />
              </button>
            </div>

            <div className="pm-cat">{category}</div>
            <h1 className="pm-title">{project.title}</h1>
            <p className="pm-tagline">{tagline}</p>
          </div>

          {/* Metric Readouts */}
          {metrics.length > 0 && (
            <div className="pm-metrics" style={{ gridTemplateColumns: `repeat(${metrics.length}, 1fr)` }}>
              {metrics.map((m) => (
                <div className="pm-metric" key={m.label}>
                  <div className="pm-metric-ticks">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <span key={i} />
                    ))}
                  </div>
                  <div className="pm-metric-value">{m.value}</div>
                  <div className="pm-metric-label">{m.label}</div>
                  <div className="pm-metric-note">{m.note}</div>
                </div>
              ))}
            </div>
          )}

          {/* Segmented Tab Control with Sliding Underline */}
          <div className="pm-tabs" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
            <div
              className="pm-tabs-indicator"
              style={{
                width: `${100 / tabs.length}%`,
                transform: `translateX(${tab * 100}%)`
              }}
            />
            {tabs.map((t, i) => (
              <button
                key={t}
                className={`pm-tab ${tab === i ? 'pm-tab-active' : ''}`}
                onClick={() => setTab(i)}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Body Content */}
          <div className="pm-body">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.16 }}
              >
                {tab === 0 && (
                  <div className="pm-fade">
                    <div className="pm-section-label">System Signal Path</div>
                    <div className="pm-pipe">
                      {pipeline.map((s, i) => {
                        const Icon = s.icon;
                        return (
                          <React.Fragment key={s.id + i}>
                            <div className="pm-node">
                              <div className="pm-node-id">{s.id}</div>
                              <div className="pm-node-icon">
                                <Icon size={16} />
                              </div>
                              <div className="pm-node-name">{s.name}</div>
                              <div className="pm-node-note">{s.note}</div>
                            </div>
                            {i < pipeline.length - 1 && (
                              <div className="pm-conn">
                                <span className="pm-conn-line" />
                                <span className="pm-conn-pulse" style={{ animationDelay: `${i * 0.5}s` }} />
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>

                    <div className="pm-section-label pm-mt">Technology Stack</div>
                    <div className="pm-chips">
                      {stack.map((s) => (
                        <span className="pm-chip" key={s}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {tab === 1 && architecture && (
                  <div className="pm-fade pm-arch">
                    {architecture.map((a) => (
                      <div className="pm-arch-row" key={a.code || a.title}>
                        <div className="pm-arch-code">{a.code}</div>
                        <div>
                          <div className="pm-arch-title">{a.title}</div>
                          <p className="pm-arch-body">{a.body}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {tab === 2 && codeSnippet && (
                  <div className="pm-fade">
                    <div className="pm-term">
                      <div className="pm-term-bar">
                        <div className="pm-term-dots">
                          <span style={{ background: '#ef4444' }} />
                          <span style={{ background: '#f59e0b' }} />
                          <span style={{ background: '#10b981' }} />
                        </div>
                        <div className="pm-term-file">{codeSnippet.filename}</div>
                        <button className="pm-term-copy" onClick={handleCopyCode}>
                          {copied ? <Check size={12} /> : <Copy size={12} />}
                          {copied ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <pre className="pm-term-body">
                        <code>{codeSnippet.snippet}</code>
                      </pre>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer Actions */}
          <div className="pm-foot">
            {sourceUrl && (
              <a className="pm-btn pm-btn-ghost" href={sourceUrl} target="_blank" rel="noreferrer">
                <FaGithub size={14} />
                Source Code
              </a>
            )}
            {demoUrl && (
              <a className="pm-btn pm-btn-solid" href={demoUrl} target="_blank" rel="noreferrer">
                Launch Live Demo
                <ArrowUpRight size={14} />
              </a>
            )}
          </div>
        </motion.div>

        <ModalStyles />
      </div>
    </AnimatePresence>,
    document.body
  );
}

/* Theme-Adaptive Engineering Spec-Sheet Styles */
function ModalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');

      :root {
        --pm-bg-panel: var(--bg-secondary);
        --pm-bg-raise: var(--bg-primary);
        --pm-line: var(--border-color);
        --pm-line-soft: color-mix(in srgb, var(--primary-blue) 6%, transparent);
        --pm-cyan: var(--primary-blue);
        --pm-cyan-dim: color-mix(in srgb, var(--primary-blue) 25%, transparent);
        --pm-amber: #10b981;
        --pm-text: var(--text-primary);
        --pm-text-mute: var(--text-secondary);
        --pm-mono: 'JetBrains Mono', 'Fira Code', monospace;
        --pm-sans: 'Inter', system-ui, sans-serif;
      }

      .pm-overlay {
        position: fixed; inset: 0; z-index: 10000;
        background: rgba(15, 23, 42, 0.65);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        display: flex; align-items: center; justify-content: center;
        padding: 20px;
      }

      .pm-panel {
        position: relative;
        width: 100%; max-width: 680px;
        height: min(700px, 92vh);
        max-height: 92vh;
        background:
          repeating-linear-gradient(0deg, var(--pm-line-soft) 0 1px, transparent 1px 28px),
          repeating-linear-gradient(90deg, var(--pm-line-soft) 0 1px, transparent 1px 28px),
          var(--pm-bg-panel);
        border: 1px solid var(--pm-line);
        box-shadow: 0 24px 70px -12px rgba(0, 0, 0, 0.45);
        display: flex; flex-direction: column;
        color: var(--pm-text);
        border-radius: 14px;
        overflow: hidden;
        font-family: var(--pm-sans);
      }

      .pm-crop { position: absolute; width: 14px; height: 14px; border: 1.5px solid var(--pm-cyan); opacity: .85; z-index: 10; pointer-events: none; }
      .pm-crop-tl { top: -1px; left: -1px; border-right: none; border-bottom: none; }
      .pm-crop-tr { top: -1px; right: -1px; border-left: none; border-bottom: none; }
      .pm-crop-bl { bottom: -1px; left: -1px; border-right: none; border-top: none; }
      .pm-crop-br { bottom: -1px; right: -1px; border-left: none; border-top: none; }

      .pm-head { padding: 16px 22px 12px; border-bottom: 1px solid var(--pm-line); flex-shrink: 0; }
      .pm-head-top { display:flex; align-items:center; gap:12px; margin-bottom: 6px; }
      .pm-ref { font-family: var(--pm-mono); font-size: 11px; color: var(--pm-text-mute); letter-spacing:.05em; }
      .pm-ref span { color: var(--pm-cyan); font-weight: 700; }
      .pm-status {
        margin-left: auto;
        display:flex; align-items:center; gap:6px;
        font-family: var(--pm-mono); font-size: 10px; letter-spacing:.1em;
        color: var(--pm-amber); border: 1px solid color-mix(in srgb, #10b981 30%, transparent);
        background: color-mix(in srgb, #10b981 10%, transparent);
        padding: 2px 8px; border-radius: 4px; font-weight: 700;
      }
      .pm-status-dot { width:6px; height:6px; border-radius:50%; background: var(--pm-amber); animation: pm-blink 1.6s infinite; }
      @keyframes pm-blink { 0%,100%{opacity:1} 50%{opacity:.25} }

      .pm-close {
        background: transparent; border: 1px solid var(--pm-line); color: var(--pm-text-mute);
        width: 26px; height: 26px; border-radius: 6px; display:flex; align-items:center; justify-content:center;
        cursor: pointer; transition: all .15s ease; flex-shrink:0;
      }
      .pm-close:hover { color: var(--pm-text); border-color: var(--pm-cyan); transform: rotate(90deg); }

      .pm-cat { font-family: var(--pm-mono); font-size: 10.5px; letter-spacing: .12em; color: var(--pm-cyan); margin-bottom: 3px; font-weight: 700; }
      .pm-title { font-family: var(--pm-mono); font-weight: 800; font-size: 21px; letter-spacing: -0.015em; margin: 0 0 4px; color: var(--pm-text); }
      .pm-tagline { font-size: 12.5px; line-height: 1.45; color: var(--pm-text-mute); margin: 0; max-width: 60ch; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

      .pm-metrics { display:grid; border-bottom: 1px solid var(--pm-line); flex-shrink: 0; }
      .pm-metric {
        position: relative; padding: 8px 16px 8px; border-right: 1px solid var(--pm-line);
      }
      .pm-metric:last-child { border-right: none; }
      .pm-metric-ticks { display:flex; justify-content:space-between; margin-bottom: 4px; }
      .pm-metric-ticks span { width:1px; height:4px; background: var(--pm-line); }
      .pm-metric-value { font-family: var(--pm-mono); font-size: 17px; font-weight: 800; color: var(--pm-text); letter-spacing: -0.02em; }
      .pm-metric-label { font-family: var(--pm-mono); font-size: 9px; letter-spacing: .08em; color: var(--pm-cyan); margin-top: 1px; font-weight: 700; }
      .pm-metric-note { font-size: 9.5px; color: var(--pm-text-mute); margin-top: 1px; }

      .pm-tabs { display:grid; position: relative; border-bottom: 1px solid var(--pm-line); background: var(--pm-bg-raise); flex-shrink: 0; }
      .pm-tabs-indicator {
        position:absolute; bottom:-1px; left:0; height:2px;
        background: var(--pm-cyan); transition: transform .25s cubic-bezier(.2,.8,.2,1);
      }
      .pm-tab {
        background: transparent; border: none; color: var(--pm-text-mute);
        font-family: var(--pm-mono); font-size: 11px; letter-spacing: .08em;
        padding: 9px 8px; cursor: pointer; transition: color .15s ease; font-weight: 600;
      }
      .pm-tab-active { color: var(--pm-text); font-weight: 700; }

      .pm-body { padding: 20px 22px; overflow-y: auto; flex: 1 1 auto; min-height: 280px; }
      .pm-fade { animation: pm-fade .2s ease; }
      @keyframes pm-fade { from { opacity:0; transform: translateY(4px);} to { opacity:1; transform:none; } }

      .pm-section-label { font-family: var(--pm-mono); font-size: 10px; letter-spacing:.14em; color: var(--pm-text-mute); margin-bottom: 10px; font-weight: 700; text-transform: uppercase; }
      .pm-mt { margin-top: 20px; }

      .pm-pipe { display:flex; align-items: stretch; gap: 0; overflow-x: auto; padding-bottom: 6px; }
      .pm-node {
        flex: 0 0 118px; border: 1px solid var(--pm-line); padding: 10px 12px;
        background: var(--pm-bg-raise); position: relative; border-radius: 6px;
      }
      .pm-node-id { position:absolute; top:6px; right:8px; font-family: var(--pm-mono); font-size: 9px; color: var(--pm-cyan); font-weight: 700; }
      .pm-node-icon { color: var(--pm-cyan); margin-bottom: 14px; }
      .pm-node-name { font-size: 12px; font-weight: 700; margin-bottom: 2px; color: var(--pm-text); }
      .pm-node-note { font-size: 10.5px; color: var(--pm-text-mute); }

      .pm-conn { flex: 0 0 32px; position: relative; display:flex; align-items:center; }
      .pm-conn-line { position:absolute; left:0; right:0; top:50%; height:1px; background: var(--pm-line); }
      .pm-conn-pulse {
        position:absolute; top:50%; width:5px; height:5px; margin-top:-2.5px; border-radius:50%;
        background: var(--pm-cyan); box-shadow: 0 0 6px 1px var(--pm-cyan-dim);
        animation: pm-travel 2.2s linear infinite;
      }
      @keyframes pm-travel { 0% { left:-2px; opacity:0; } 10%{opacity:1;} 90%{opacity:1;} 100% { left: 100%; opacity:0; } }

      .pm-chips { display:flex; flex-wrap:wrap; gap:8px; }
      .pm-chip {
        font-family: var(--pm-mono); font-size: 11px; color: var(--pm-cyan);
        border: 1px solid color-mix(in srgb, var(--pm-cyan) 25%, var(--pm-line));
        background: color-mix(in srgb, var(--pm-cyan) 6%, transparent);
        padding: 5px 10px; border-radius: 6px; font-weight: 600;
      }

      .pm-arch { display:flex; flex-direction:column; gap: 14px; }
      .pm-arch-row { display:grid; grid-template-columns: 40px 1fr; gap: 14px; padding: 14px 16px; background: var(--pm-bg-raise); border: 1px solid var(--pm-line); border-radius: 8px; }
      .pm-arch-code { font-family: var(--pm-mono); font-size: 11px; color: var(--pm-cyan); font-weight: 700; padding-top: 2px; }
      .pm-arch-title { font-size: 14px; font-weight: 700; margin-bottom: 4px; color: var(--pm-text); }
      .pm-arch-body { font-size: 12.5px; line-height: 1.55; color: var(--pm-text-mute); margin: 0; }

      .pm-term { border: 1px solid #1e293b; background: #0b1120; border-radius: 8px; overflow: hidden; }
      .pm-term-bar { display:flex; align-items:center; gap: 10px; padding: 10px 14px; background: #1e293b; border-bottom: 1px solid #334155; }
      .pm-term-dots { display:flex; gap: 6px; }
      .pm-term-dots span { width: 9px; height: 9px; border-radius: 50%; }
      .pm-term-file { font-family: var(--pm-mono); font-size: 11px; color: #94a3b8; margin-left: 4px; font-weight: 600; }
      .pm-term-copy {
        margin-left: auto; display:flex; align-items:center; gap: 5px;
        background: #334155; border: none; color: #f8fafc;
        font-family: var(--pm-mono); font-size: 10.5px; padding: 4px 10px; border-radius: 4px; cursor: pointer;
        transition: all .15s ease; font-weight: 700;
      }
      .pm-term-copy:hover { background: #475569; }
      .pm-term-body { margin: 0; padding: 16px; font-family: var(--pm-mono); font-size: 12px; line-height: 1.65; color: #e2e8f0; overflow-x: auto; }

      .pm-foot { display:flex; gap: 10px; padding: 12px 22px; border-top: 1px solid var(--pm-line); background: var(--pm-bg-raise); flex-shrink: 0; position: relative; z-index: 10; }
      .pm-btn {
        display:flex; align-items:center; gap: 7px; justify-content:center;
        font-family: var(--pm-mono); font-size: 11.5px; letter-spacing:.05em;
        padding: 8px 16px; text-decoration:none; cursor: pointer; transition: all .15s ease; border: 1px solid var(--pm-line);
        border-radius: 6px;
      }
      .pm-btn-ghost { color: var(--pm-text-mute); background: var(--pm-bg-panel); font-weight: 600; }
      .pm-btn-ghost:hover { color: var(--pm-text); border-color: var(--pm-cyan); transform: translateY(-1px); }
      .pm-btn-solid { color: #ffffff !important; background: var(--pm-cyan); border-color: var(--pm-cyan); margin-left: auto; font-weight: 700; box-shadow: 0 4px 12px color-mix(in srgb, var(--pm-cyan) 30%, transparent); }
      .pm-btn-solid:hover { opacity: 0.92; transform: translateY(-1px); box-shadow: 0 6px 16px color-mix(in srgb, var(--pm-cyan) 45%, transparent); }

      @media (max-width: 560px) {
        .pm-overlay { padding: 0; align-items: flex-end; }
        .pm-panel { max-width: 100%; height: 90vh; max-height: 90vh; border-radius: 20px 20px 0 0; }
        .pm-metrics { grid-template-columns: repeat(3, 1fr); }
        .pm-title { font-size: 19px; }
      }

      .pm-close:focus-visible, .pm-tab:focus-visible, .pm-btn:focus-visible, .pm-term-copy:focus-visible {
        outline: 1px solid var(--pm-cyan); outline-offset: 2px;
      }
    `}</style>
  );
}
