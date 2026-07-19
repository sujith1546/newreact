import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsland } from '../context/IslandContext';

export default function DynamicIsland() {
  const { islandState } = useIsland();

  return (
    <div 
      style={{
        position: 'fixed',
        top: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        pointerEvents: 'none',
        display: 'flex',
        justifyContent: 'center',
        width: '100%'
      }}
    >
      <AnimatePresence>
        {islandState.isOpen && (
          <motion.div
            initial={{ width: 120, height: 32, opacity: 0, scale: 0.8 }}
            animate={{ width: 'auto', height: 48, opacity: 1, scale: 1 }}
            exit={{ width: 120, height: 32, opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300, mass: 0.8 }}
            style={{
              background: '#000',
              borderRadius: '24px',
              display: 'flex',
              alignItems: 'center',
              padding: '0 16px',
              gap: '12px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.05)',
              pointerEvents: 'auto',
              overflow: 'hidden',
              minWidth: '180px'
            }}
          >
            {islandState.icon && (
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', delay: 0.1 }}
                style={{
                  color: islandState.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {islandState.icon}
              </motion.div>
            )}
            
            <motion.div 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
            >
              <span style={{ 
                color: '#fff', 
                fontSize: '13px', 
                fontWeight: 600, 
                lineHeight: 1.1,
                letterSpacing: '-0.01em'
              }}>
                {islandState.title}
              </span>
              {islandState.subtitle && (
                <span style={{ 
                  color: 'rgba(255,255,255,0.6)', 
                  fontSize: '11px', 
                  fontWeight: 500,
                  marginTop: '2px'
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
