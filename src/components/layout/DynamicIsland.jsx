import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsland } from '../../context/IslandContext';

export default function DynamicIsland() {
  const { islandState } = useIsland();

  return (
    <div 
      style={{
        position: 'fixed',
        top: '18px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 99999,
        pointerEvents: 'none',
        display: 'flex',
        justifyContent: 'center',
        width: 'auto'
      }}
    >
      <AnimatePresence>
        {islandState.isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -12 }}
            transition={{ type: 'spring', damping: 22, stiffness: 350, mass: 0.7 }}
            style={{
              background: '#090a0f',
              borderRadius: '999px',
              display: 'flex',
              alignItems: 'center',
              padding: '10px 22px',
              gap: '12px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.12)',
              pointerEvents: 'auto',
              whiteSpace: 'nowrap',
              minHeight: '46px',
              boxSizing: 'border-box'
            }}
          >
            {islandState.icon && (
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', delay: 0.08 }}
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
            
            <motion.div 
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
            >
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
                  color: 'rgba(255,255,255,0.72)', 
                  fontSize: '11.5px', 
                  fontWeight: 500,
                  marginTop: '1px',
                  lineHeight: 1.2
                }}>
                  {islandState.subtitle}
                </span>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
