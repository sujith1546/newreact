import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsland } from '../../context/IslandContext';
import { Sparkles, Command, FileText, Sun, Moon, ShieldCheck, Zap, X, Users, Volume2 } from 'lucide-react';

const SPRING_TRANSITION = {
  type: 'spring',
  stiffness: 360,
  damping: 25,
  mass: 0.6,
};

const WaveformBars = () => {
  const bars = [
    { height: 6, delay: 0 },
    { height: 10, delay: 0.15 },
    { height: 14, delay: 0.3 },
    { height: 8, delay: 0.45 },
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px', height: '14px' }}>
      {bars.map((bar, i) => (
        <motion.span
          key={i}
          animate={{ scaleY: [0.5, 1, 0.5] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            repeatType: 'mirror',
            ease: 'easeInOut',
            delay: bar.delay,
          }}
          style={{
            width: '2px',
            height: `${bar.height}px`,
            backgroundColor: '#e8e8ec',
            borderRadius: '1px',
            display: 'inline-block',
            transformOrigin: 'center',
          }}
        />
      ))}
    </div>
  );
};

export default function DynamicIsland() {
  const {
    islandState,
    triggerIsland,
    isHudOpen,
    toggleHud,
    closeHud,
    visitorCount,
    isEqualizerActive
  } = useIsland();

  const [isHovered, setIsHovered] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const hudRef = useRef(null);

  const isNotificationActive = islandState.isOpen;

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    return () => observer.disconnect();
  }, []);

  // Close HUD when clicking outside
  useEffect(() => {
    if (!isHudOpen) return;
    const handleClickOutside = (e) => {
      if (hudRef.current && !hudRef.current.contains(e.target)) {
        closeHud();
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [isHudOpen, closeHud]);

  const handleToggleTheme = (e) => {
    e.stopPropagation();
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('portfolio_theme', nextTheme);
    triggerIsland({
      title: `Switched to ${nextTheme === 'dark' ? 'Dark' : 'Light'} Mode`,
      subtitle: 'System theme updated',
      icon: nextTheme === 'dark' ? <Moon size={15} /> : <Sun size={15} />,
      color: '#3b82f6',
      duration: 2500
    });
  };

  const handleOpenCommandSearch = (e) => {
    e.stopPropagation();
    closeHud();
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true }));
  };

  const handleDownloadCV = (e) => {
    e.stopPropagation();
    closeHud();
    triggerIsland({
      title: 'Downloading Resume...',
      subtitle: 'Sujith_Thota_Resume.pdf',
      icon: <FileText size={15} />,
      color: '#10b981',
      duration: 3000
    });
    const link = document.createElement('a');
    link.href = '/resume.pdf';
    link.download = 'Sujith_Thota_Resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: '12px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 999999,
        pointerEvents: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <motion.div
        ref={hudRef}
        layout
        transition={SPRING_TRANSITION}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => {
          if (!isNotificationActive) {
            toggleHud();
          }
        }}
        style={{
          background: '#07090e',
          borderRadius: isHudOpen ? '22px' : '999px',
          border: '1px solid #2a2c33',
          boxShadow: isHudOpen || isNotificationActive
            ? '0 20px 50px rgba(0,0,0,0.65)'
            : '0 6px 22px rgba(0,0,0,0.4)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          padding: isHudOpen ? '16px 20px' : isNotificationActive ? '10px 20px' : isHovered ? '8px 18px' : '0 10px',
          height: isHudOpen ? 'auto' : isNotificationActive ? '48px' : '32px',
          width: isHudOpen ? '320px' : 'auto',
          minWidth: isHudOpen ? '320px' : isNotificationActive ? '270px' : isHovered ? '190px' : '32px',
          boxSizing: 'border-box',
          position: 'relative'
        }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {/* Stage 3: Full Interactive Telemetry HUD Mode */}
          {isHudOpen ? (
            <motion.div
              key="hud-mode"
              layout
              initial={{ opacity: 0, scale: 0.92, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -4 }}
              transition={SPRING_TRANSITION}
              style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', whiteSpace: 'normal' }}
            >
              {/* HUD Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <WaveformBars />
                  <span style={{ color: '#ffffff', fontSize: '13px', fontWeight: 700, letterSpacing: '0.02em' }}>
                    Sujith Thota · System HUD
                  </span>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); closeHud(); }}
                  style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <X size={13} />
                </button>
              </div>

              {/* Telemetry Status Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.04)', padding: '8px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={13} style={{ color: '#10b981' }} /> Active Viewers
                  </span>
                  <span style={{ color: '#10b981', fontSize: '11px', fontWeight: 700 }}>🟢 {visitorCount} viewing live</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.04)', padding: '8px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Zap size={13} style={{ color: '#3b82f6' }} /> RAG / AI Pipeline
                  </span>
                  <span style={{ color: '#3b82f6', fontSize: '11px', fontWeight: 700 }}>Sub-2s Latency</span>
                </div>
              </div>

              {/* Quick Action Control Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', paddingTop: '2px' }}>
                <button
                  onClick={handleOpenCommandSearch}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '10px',
                    padding: '8px 6px',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 600,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                >
                  <Command size={14} style={{ color: '#8b5cf6' }} />
                  <span>Command</span>
                </button>

                <button
                  onClick={handleDownloadCV}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '10px',
                    padding: '8px 6px',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 600,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                >
                  <FileText size={14} style={{ color: '#10b981' }} />
                  <span>Resume</span>
                </button>

                <button
                  onClick={handleToggleTheme}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '10px',
                    padding: '8px 6px',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 600,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                >
                  {isDark ? <Sun size={14} style={{ color: '#f59e0b' }} /> : <Moon size={14} style={{ color: '#3b82f6' }} />}
                  <span>Theme</span>
                </button>
              </div>
            </motion.div>
          ) : isNotificationActive ? (
            /* Stage 2: Active System Notification Event Mode */
            <motion.div
              key="notification-state"
              layout
              initial={{ opacity: 0, scale: 0.9, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -4 }}
              transition={SPRING_TRANSITION}
              style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '4px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                {islandState.icon && (
                  <motion.div
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={SPRING_TRANSITION}
                    style={{
                      color: islandState.color || '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {islandState.icon}
                  </motion.div>
                )}
                
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <span style={{ 
                    color: '#ffffff', 
                    fontSize: '13.5px', 
                    fontWeight: 700, 
                    lineHeight: 1.2,
                    letterSpacing: '-0.01em'
                  }}>
                    {islandState.title}
                  </span>
                  {islandState.subtitle && (
                    <span style={{ 
                      color: 'rgba(255,255,255,0.75)', 
                      fontSize: '11px', 
                      fontWeight: 500,
                      marginTop: '2px',
                      lineHeight: 1.2
                    }}>
                      {islandState.subtitle}
                    </span>
                  )}
                </div>
              </div>

              {/* Filling progress bar if present */}
              {typeof islandState.progress === 'number' && (
                <div style={{ width: '100%', height: '3px', background: 'rgba(255,255,255,0.15)', borderRadius: '99px', overflow: 'hidden', marginTop: '2px' }}>
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: `${islandState.progress}%` }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                    style={{ height: '100%', background: islandState.color || '#10b981', borderRadius: '99px' }}
                  />
                </div>
              )}
            </motion.div>
          ) : isHovered ? (
            /* Hovered Idle State */
            <motion.div
              key="hover-state"
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.14 }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <WaveformBars />
              <span style={{ color: '#ffffff', fontSize: '11.5px', fontWeight: 700, letterSpacing: '0.02em' }}>
                Available for roles
              </span>
            </motion.div>
          ) : (
            /* Stage 1: Compact Waveform Icon Idle State */
            <motion.div
              key="notch-state"
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.14 }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <WaveformBars />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
