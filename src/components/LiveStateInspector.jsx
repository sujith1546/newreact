import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Terminal, X, Maximize2, Minimize2 } from 'lucide-react';

export default function LiveStateInspector() {
  const { showStateInspector, setShowStateInspector, ...themeState } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!showStateInspector) return null;

  // Filter out functions from the state object to only show pure data
  const dataState = Object.fromEntries(
    Object.entries(themeState).filter(([_, value]) => typeof value !== 'function')
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      drag
      dragConstraints={{ left: 0, right: window.innerWidth - 300, top: 0, bottom: window.innerHeight - 300 }}
      dragMomentum={false}
      style={{
        position: 'fixed',
        bottom: '80px',
        left: '20px',
        width: isExpanded ? '400px' : '300px',
        height: isExpanded ? '500px' : '250px',
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(20, 184, 166, 0.3)',
        borderRadius: '12px',
        color: '#14b8a6',
        fontFamily: "'Fira Code', 'SFMono-Regular', Consolas, monospace",
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(20, 184, 166, 0.05)',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div 
        className="state-inspector-header"
        style={{
          padding: '10px 14px',
          background: 'rgba(0,0,0,0.2)',
          borderBottom: '1px solid rgba(20, 184, 166, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'grab'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal size={14} color="#14b8a6" />
          <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Live State Inspector
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            style={{ background: 'none', border: 'none', color: '#14b8a6', cursor: 'pointer', padding: 0 }}
          >
            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button 
            onClick={() => setShowStateInspector(false)}
            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* JSON Body */}
      <div 
        style={{
          padding: '12px',
          overflowY: 'auto',
          flex: 1,
          fontSize: '11px',
          lineHeight: '1.5',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          color: '#5eead4' // Lighter teal for the JSON body
        }}
      >
        {JSON.stringify(dataState, null, 2)}
      </div>
    </motion.div>
  );
}
