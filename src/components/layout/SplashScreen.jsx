import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SplashScreen({ isReady }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let timer;
    if (!isReady) {
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.floor(Math.random() * 8) + 4;
        });
      }, 50);
    } else {
      setProgress(100);
    }

    return () => clearInterval(timer);
  }, [isReady]);

  const getStageText = (val) => {
    if (val < 35) return "Loading RAG Knowledge Vectors...";
    if (val < 70) return "Initializing Telemetry & AI Engines...";
    if (val < 100) return "Optimizing Responsive Spatial Grid...";
    return "System Ready";
  };

  return (
    <AnimatePresence>
      {!isReady && (
        <motion.div
          key="splash-screen"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0, 
            y: -30,
            scale: 0.92,
            filter: 'blur(8px)',
            transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } 
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            backgroundColor: '#07090e',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            userSelect: 'none',
            overflow: 'hidden'
          }}
        >
          {/* Subtle Ambient Radial Background Glow */}
          <div 
            style={{
              position: 'absolute',
              width: '400px',
              height: '400px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.08) 50%, transparent 70%)',
              filter: 'blur(40px)',
              pointerEvents: 'none'
            }}
          />

          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: '20px',
              zIndex: 2
            }}
          >
            {/* Dual Orbital Neural Ring Container */}
            <div style={{ position: 'relative', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Outer Counter-Rotating Ring */}
              <motion.svg
                animate={{ rotate: 360 }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
                width="80"
                height="80"
                viewBox="0 0 80 80"
                style={{ position: 'absolute', inset: 0 }}
              >
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="rgba(59, 130, 246, 0.2)"
                  strokeWidth="2"
                  fill="none"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="url(#blue-purple-grad)"
                  strokeWidth="2.5"
                  strokeDasharray="60 160"
                  strokeLinecap="round"
                  fill="none"
                />
                <defs>
                  <linearGradient id="blue-purple-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </motion.svg>

              {/* Inner Clockwise Ring */}
              <motion.svg
                animate={{ rotate: -360 }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
                width="60"
                height="60"
                viewBox="0 0 60 60"
                style={{ position: 'absolute' }}
              >
                <circle
                  cx="30"
                  cy="30"
                  r="26"
                  stroke="url(#cyan-grad)"
                  strokeWidth="2"
                  strokeDasharray="40 120"
                  strokeLinecap="round"
                  fill="none"
                />
                <defs>
                  <linearGradient id="cyan-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </motion.svg>

              {/* Core Badge */}
              <motion.div
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  boxShadow: '0 0 25px rgba(139, 92, 246, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 3
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.div>
            </div>

            {/* Typographic Monospace Header */}
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <motion.h1
                initial={{ letterSpacing: '0.1em', opacity: 0 }}
                animate={{ letterSpacing: '0.22em', opacity: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{
                  margin: 0,
                  fontSize: '15px',
                  fontWeight: 800,
                  color: '#ffffff',
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  textTransform: 'uppercase'
                }}
              >
                SUJITH THOTA
              </motion.h1>

              <span 
                style={{
                  fontSize: '10.5px',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  opacity: 0.8
                }}
              >
                DATA SCIENCE & APPLIED ML
              </span>
            </div>

            {/* Progress Percentage Badge */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <span 
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#06b6d4',
                  letterSpacing: '0.05em'
                }}
              >
                {Math.min(progress, 100)}%
              </span>

              {/* Progress Bar Track */}
              <div 
                style={{
                  width: '160px',
                  height: '3px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '99px',
                  overflow: 'hidden',
                  position: 'relative',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}
              >
                <motion.div
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #3b82f6, #06b6d4, #10b981)',
                    borderRadius: '99px',
                    boxShadow: '0 0 10px rgba(6, 182, 212, 0.6)'
                  }}
                />
              </div>

              {/* Dynamic Loading Stage Subtitle */}
              <motion.span
                key={getStageText(progress)}
                initial={{ opacity: 0, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                style={{
                  fontSize: '10.5px',
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontFamily: "'JetBrains Mono', monospace",
                  marginTop: '4px'
                }}
              >
                {getStageText(progress)}
              </motion.span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
