import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Route, Database, Eye, Zap, CheckCircle2, Info, Activity, ChevronDown, ChevronUp, ShieldCheck, Cpu } from 'lucide-react';

export default function ThoughtTrace({ steps = [], isFirstTurn = false }) {
  const [isExpanded, setIsExpanded] = useState(isFirstTurn);
  const totalMs = useMemo(() => steps.reduce((acc, step) => acc + (step.ms || 0), 0), [steps]);

  // Determine flow type based on steps
  const isVisionFlow = steps.some(s => s.node === 'vision');

  const getNodeMs = (nodeId) => {
    const nodeSteps = steps.filter(s => s.node === nodeId);
    return nodeSteps.reduce((acc, s) => acc + (s.ms || 0), 0);
  };

  const nodes = isVisionFlow
    ? [
        { id: 'input', label: 'Image', icon: <Eye size={12} /> },
        { id: 'vision', label: 'Vision', icon: <Eye size={12} /> },
        { id: 'critic', label: 'Critic', icon: <ShieldCheck size={12} /> },
        { id: 'gen', label: 'Groq LPU', icon: <Zap size={12} /> }
      ]
    : [
        { id: 'input', label: 'Query', icon: <Info size={12} /> },
        { id: 'router', label: 'Router', icon: <Route size={12} /> },
        { id: 'rag', label: 'Vector RAG', icon: <Database size={12} /> },
        { id: 'critic', label: 'Critic', icon: <ShieldCheck size={12} /> },
        { id: 'gen', label: 'Groq LPU', icon: <Zap size={12} /> }
      ];

  // Helper to determine node state: 'pending', 'active', 'done'
  const getNodeState = (nodeId) => {
    if (nodeId === 'input') return 'done';
    if (nodeId === 'critic') {
      const ragDone = steps.some(s => s.node === 'rag' && s.status === 'done');
      if (ragDone) return 'done';
      const ragActive = steps.some(s => s.node === 'rag' && s.status === 'active');
      if (ragActive) return 'active';
      return 'pending';
    }
    const nodeSteps = steps.filter(s => s.node === nodeId);
    if (nodeSteps.length === 0) return 'pending';
    if (nodeSteps.some(s => s.status === 'done')) return 'done';
    return 'active';
  };

  const getIconForNode = (node) => {
    switch (node) {
      case 'router': return <Route size={12} />;
      case 'rag': return <Database size={12} />;
      case 'critic': return <ShieldCheck size={12} />;
      case 'vision': return <Eye size={12} />;
      case 'gen': return <Zap size={12} />;
      default: return <Activity size={12} />;
    }
  };

  return (
    <div className="thought-trace-body">
      <button 
        className={`trace-header-info ${isExpanded ? 'expanded' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
        type="button"
      >
        <span className="trace-status-text">
          <Cpu size={13} color="#3b82f6" className={steps.length && !steps[steps.length - 1].status?.includes('done') ? 'spinning' : ''} />
          <span>Agentic AI Workflow Graph</span>
        </span>
        <span className="trace-header-right">
          <span className="trace-latency">
            {totalMs > 0 ? `${totalMs}ms` : 'sub-second'}
          </span>
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="trace-pipeline-svg">
              <svg viewBox="0 0 340 80" style={{ width: '100%', height: 'auto', minHeight: '80px', overflow: 'visible' }}>
                {nodes.map((n, i) => {
                  const x = 28 + (i * (284 / (nodes.length - 1)));
                  const y = 35;
                  const state = getNodeState(n.id);
                  const color = state === 'done' ? '#10b981' : state === 'active' ? '#3b82f6' : '#64748b';
                  
                  return (
                    <g key={n.id}>
                      {i < nodes.length - 1 && (
                        <line 
                          x1={x + 20} y1={y} 
                          x2={28 + ((i + 1) * (284 / (nodes.length - 1))) - 20} y2={y}
                          stroke={getNodeState(nodes[i+1].id) !== 'pending' ? '#3b82f6' : '#334155'}
                          strokeWidth="3"
                          strokeDasharray={getNodeState(nodes[i+1].id) === 'active' ? "6 6" : "none"}
                        >
                          {getNodeState(nodes[i+1].id) === 'active' && (
                            <animate attributeName="stroke-dashoffset" values="12;0" dur="0.5s" repeatCount="indefinite" />
                          )}
                        </line>
                      )}
                      
                      <circle 
                        cx={x} cy={y} r="16" 
                        fill={state === 'pending' ? 'transparent' : `${color}20`}
                        stroke={color} strokeWidth="2"
                      />
                      
                      {state === 'active' && (
                        <circle cx={x} cy={y} r="22" fill="none" stroke={color} strokeWidth="1.5" opacity="0.6">
                          <animate attributeName="r" values="16; 26" dur="1.2s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.8; 0" dur="1.2s" repeatCount="indefinite" />
                        </circle>
                      )}
                      
                      <text x={x} y={y + 4} fontSize="11" textAnchor="middle" fill={color} fontFamily="monospace" fontWeight="800">
                        {n.id === 'critic' ? 'CT' : n.id.substring(0,2).toUpperCase()}
                      </text>
                      <text x={x} y={y + 30} fontSize="10" textAnchor="middle" fill="var(--text-secondary)" fontWeight="600">
                        {n.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="trace-log-container">
              <AnimatePresence>
                {steps.map((step, idx) => (
                  <motion.div 
                    key={idx}
                    className={`trace-log-row ${step.status === 'done' ? 'done' : 'active'}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="log-icon">{step.status === 'done' ? <CheckCircle2 size={11} color="#10b981" /> : getIconForNode(step.node)}</span>
                    <span className="log-text">{step.text}</span>
                    {step.ms > 0 && <span className="log-ms">{step.ms}ms</span>}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .thought-trace-body {
          padding: 0;
          background: var(--bg-secondary);
          border-radius: 12px;
          margin-top: 8px;
          border: 1px solid var(--border-color);
          overflow: hidden;
        }
        .trace-header-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 12px;
          width: 100%;
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-secondary);
          transition: background 0.2s;
        }
        .trace-header-info:hover {
          background: rgba(0,0,0,0.05);
        }
        .trace-header-info.expanded {
          border-bottom: 1px solid var(--border-color);
          background: rgba(0,0,0,0.02);
        }
        .trace-status-text {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .trace-header-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .spinning {
          animation: spin 2s linear infinite;
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .trace-latency {
          color: #10b981;
          font-family: monospace;
          background: rgba(16, 185, 129, 0.1);
          padding: 2px 8px;
          border-radius: 6px;
          display: flex;
          align-items: center;
        }
        .trace-expanded-content {
          padding: 16px;
        }
        .trace-pipeline-svg {
          margin-bottom: 20px;
          background: var(--bg-primary);
          border-radius: 8px;
          padding: 12px 8px;
          border: 1px solid var(--border-color);
          overflow: visible;
        }
        .trace-log-container {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
        }
        .trace-log-row {
          display: flex;
          align-items: flex-start;
          font-size: 11px;
          color: var(--text-secondary);
          line-height: 1.4;
        }
        .trace-log-row.active {
          color: #3b82f6;
        }
        .trace-log-row.done {
          color: var(--text-primary);
        }
        .log-icon {
          margin-right: 8px;
          margin-top: 2px;
          flex-shrink: 0;
        }
        .log-text {
          flex-grow: 1;
          word-break: break-word;
        }
        .log-ms {
          margin-left: 12px;
          color: #10b981;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}
