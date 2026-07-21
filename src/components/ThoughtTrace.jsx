import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Route, Database, Eye, Zap, CheckCircle2, Info, Activity } from 'lucide-react';

export default function ThoughtTrace({ steps = [] }) {
  const totalMs = useMemo(() => steps.reduce((acc, step) => acc + (step.ms || 0), 0), [steps]);

  // Determine flow type based on steps
  const isVisionFlow = steps.some(s => s.node === 'vision');

  const nodes = isVisionFlow
    ? [
        { id: 'input', label: 'Image', icon: <Eye size={12} /> },
        { id: 'vision', label: 'Vision', icon: <Eye size={12} /> },
        { id: 'gen', label: 'Groq', icon: <Zap size={12} /> }
      ]
    : [
        { id: 'input', label: 'Query', icon: <Info size={12} /> },
        { id: 'router', label: 'Router', icon: <Route size={12} /> },
        { id: 'rag', label: 'RAG', icon: <Database size={12} /> },
        { id: 'gen', label: 'Groq', icon: <Zap size={12} /> }
      ];

  // Helper to determine node state: 'pending', 'active', 'done'
  const getNodeState = (nodeId) => {
    if (nodeId === 'input') return 'done';
    const nodeSteps = steps.filter(s => s.node === nodeId);
    if (nodeSteps.length === 0) return 'pending';
    if (nodeSteps.some(s => s.status === 'done')) return 'done';
    return 'active';
  };

  const getIconForNode = (node) => {
    switch (node) {
      case 'router': return <Route size={12} />;
      case 'rag': return <Database size={12} />;
      case 'vision': return <Eye size={12} />;
      case 'gen': return <Zap size={12} />;
      default: return <Activity size={12} />;
    }
  };

  return (
    <div className="thought-trace-body">
      <div className="trace-header-info">
        <span className="trace-status-text">
          <Activity size={12} style={{ marginRight: 6 }} className={steps.length && !steps[steps.length - 1].status?.includes('done') ? 'spinning' : ''} />
          Multi-Agent Orchestration
        </span>
        <span className="trace-latency">
          {totalMs > 0 ? `${totalMs}ms` : 'calculating...'}
        </span>
      </div>

      <div className="trace-pipeline-svg">
        <svg viewBox="0 0 400 60" style={{ width: '100%', height: '60px' }}>
          {nodes.map((n, i) => {
            const x = 50 + (i * (300 / (nodes.length - 1)));
            const y = 30;
            const state = getNodeState(n.id);
            const color = state === 'done' ? '#10b981' : state === 'active' ? '#3b82f6' : '#64748b';
            
            return (
              <g key={n.id}>
                {i < nodes.length - 1 && (
                  <line 
                    x1={x + 20} y1={y} 
                    x2={50 + ((i + 1) * (300 / (nodes.length - 1))) - 20} y2={y}
                    stroke={getNodeState(nodes[i+1].id) !== 'pending' ? '#3b82f6' : '#334155'}
                    strokeWidth="2"
                    strokeDasharray={getNodeState(nodes[i+1].id) === 'active' ? "4 4" : "none"}
                  >
                    {getNodeState(nodes[i+1].id) === 'active' && (
                      <animate attributeName="stroke-dashoffset" values="8;0" dur="0.5s" repeatCount="indefinite" />
                    )}
                  </line>
                )}
                
                <circle 
                  cx={x} cy={y} r="14" 
                  fill={state === 'pending' ? 'transparent' : `${color}20`}
                  stroke={color} strokeWidth="2"
                />
                
                {state === 'active' && (
                  <circle cx={x} cy={y} r="18" fill="none" stroke={color} strokeWidth="1" opacity="0.5">
                    <animate attributeName="r" values="14; 22" dur="1s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8; 0" dur="1s" repeatCount="indefinite" />
                  </circle>
                )}
                
                <text x={x} y={y + 4} fontSize="10" textAnchor="middle" fill={color} fontFamily="monospace">
                  {n.id.substring(0,2).toUpperCase()}
                </text>
                <text x={x} y={y + 24} fontSize="9" textAnchor="middle" fill="var(--text-secondary)" fontWeight="600">
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

      <style>{`
        .thought-trace-body {
          padding: 12px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          margin-top: 8px;
          border: 1px solid var(--border-color);
        }
        .trace-header-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-secondary);
        }
        .trace-status-text {
          display: flex;
          align-items: center;
        }
        .spinning {
          animation: spin 2s linear infinite;
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .trace-latency {
          color: #10b981;
          font-family: monospace;
          background: rgba(16, 185, 129, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
        }
        .trace-pipeline-svg {
          margin-bottom: 16px;
          background: var(--bg-primary);
          border-radius: 6px;
          padding: 8px;
          border: 1px solid var(--border-color);
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
