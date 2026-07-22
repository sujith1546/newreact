import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Activity, LayoutTemplate, Cpu, AlertTriangle } from 'lucide-react';

export default function PerformanceHUD() {
  const { devMode } = useTheme();
  
  const [fps, setFps] = useState(0);
  const [domNodes, setDomNodes] = useState(0);
  const [memory, setMemory] = useState(null); // in MB
  
  const requestRef = useRef();
  const lastTimeRef = useRef(performance.now());
  const framesRef = useRef(0);

  useEffect(() => {
    if (!devMode) return;

    // --- FPS Tracker ---
    const updateFPS = () => {
      const now = performance.now();
      framesRef.current++;
      
      if (now - lastTimeRef.current >= 1000) {
        setFps(framesRef.current);
        framesRef.current = 0;
        lastTimeRef.current = now;
      }
      requestRef.current = requestAnimationFrame(updateFPS);
    };
    
    requestRef.current = requestAnimationFrame(updateFPS);

    // --- DOM & Memory Poller ---
    const interval = setInterval(() => {
      // DOM Node count
      setDomNodes(document.getElementsByTagName('*').length);
      
      // Memory Leak Detector (Chrome/Edge only)
      if (performance && performance.memory) {
        setMemory((performance.memory.usedJSHeapSize / (1024 * 1024)).toFixed(1));
      }
    }, 1000);

    return () => {
      cancelAnimationFrame(requestRef.current);
      clearInterval(interval);
    };
  }, [devMode]);

  if (!devMode) return null;

  // Thresholds for warning colors
  const fpsColor = fps >= 50 ? '#10b981' : (fps >= 30 ? '#f59e0b' : '#ef4444');
  const domColor = domNodes < 1500 ? '#10b981' : (domNodes < 3000 ? '#f59e0b' : '#ef4444');
  
  // If memory is > 150MB, it might indicate a leak for a simple portfolio app
  const memColor = memory && memory < 100 ? '#10b981' : (memory && memory < 200 ? '#f59e0b' : '#ef4444');

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        padding: '10px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 999998,
        pointerEvents: 'none', // Allow clicking through the HUD
        fontFamily: "'Fira Code', 'SFMono-Regular', Consolas, monospace",
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
        <Activity size={14} color="#a1a1aa" />
        <span style={{ fontSize: '10px', fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Diagnostics HUD
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* FPS */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '9px', color: '#71717a' }}>FRAME RATE</span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: fpsColor }}>
            {fps} <span style={{ fontSize: '10px', fontWeight: 400 }}>FPS</span>
          </span>
        </div>

        {/* DOM Nodes */}
        <div style={{ display: 'flex', flexDirection: 'column', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '12px' }}>
          <span style={{ fontSize: '9px', color: '#71717a', display: 'flex', alignItems: 'center', gap: '4px' }}>
            DOM NODES {domNodes > 3000 && <AlertTriangle size={10} color="#ef4444" />}
          </span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: domColor }}>
            {domNodes}
          </span>
        </div>

        {/* Memory */}
        {memory && (
          <div style={{ display: 'flex', flexDirection: 'column', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '12px' }}>
            <span style={{ fontSize: '9px', color: '#71717a', display: 'flex', alignItems: 'center', gap: '4px' }}>
              JS HEAP {memory > 200 && <AlertTriangle size={10} color="#ef4444" />}
            </span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: memColor }}>
              {memory} <span style={{ fontSize: '10px', fontWeight: 400 }}>MB</span>
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
