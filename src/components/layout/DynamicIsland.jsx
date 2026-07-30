import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsland } from '../../context/IslandContext';
import { Sparkles, Command } from 'lucide-react';

export default function DynamicIsland() {
  const { islandState, triggerIsland } = useIsland();
  const [isHovered, setIsHovered] = useState(false);

  const isExpanded = islandState.isOpen;

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
        justifyContent: 'center'
      }}
    >
      <motion.div
        layout
        transition={{ type: 'spring', damping: 25, stiffness: 360, mass: 0.6 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => {
          if (!isExpanded) {
            triggerIsland({
              title: "Sujith Thota",
              subtitle: "Data Science & AI Engineer · Vellore",
              icon: <Sparkles size={16} />,
              color: '#3b82f6',
              duration: 3500
            });
          }
        }}
        style={{
          background: '#07090e',
          borderRadius: '999px',
          boxShadow: isExpanded 
            ? '0 14px 44px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.14)'
            : '0 6px 20px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          padding: isExpanded ? '10px 22px' : isHovered ? '8px 18px' : '0 10px',
          height: isExpanded ? '46px' : '32px',
          minWidth: isExpanded ? '280px' : isHovered ? '190px' : '32px',
          boxSizing: 'border-box'
        }}
      >
        <AnimatePresence mode="wait">
          {/* Active Notification State */}
          {isExpanded ? (
            <motion.div
              key="notification-state"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}
            >
              {islandState.icon && (
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', delay: 0.06 }}
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
            </motion.div>
          ) : isHovered ? (
            /* Hovered Idle State */
            <motion.div
              key="hover-state"
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 4 }}
              transition={{ duration: 0.12 }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
              <span style={{ color: '#ffffff', fontSize: '11.5px', fontWeight: 700, letterSpacing: '0.02em' }}>
                Available for Roles
              </span>
            </motion.div>
          ) : (
            /* Compact Camera Notch Dot Idle State */
            <motion.div
              key="notch-state"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.12 }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
            >
              {/* Camera Lens Circle Reflection */}
              <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#1e293b', border: '1.5px solid #334155' }} />
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 4px #10b981' }} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
