import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function SwipeHint() {
  return (
    <>
      <style>{`
        .global-swipe-hint {
          position: fixed;
          bottom: 95px; /* Above the bottom nav capsule */
          left: 0;
          right: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 14px 0 12px;
          color: var(--text-muted);
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          gap: 8px;
          background: linear-gradient(to top, var(--bg-secondary) 10%, transparent);
          pointer-events: none;
          z-index: 10;
        }
        .global-swipe-hint-icon {
          display: flex;
          align-items: center;
          color: var(--text-secondary);
        }
      `}</style>
      <motion.div
        className="global-swipe-hint"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <div className="global-swipe-hint-icon">
          <motion.div animate={{ x: [-3, 2, -3] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}>
            <ChevronLeft size={16} />
          </motion.div>
          <motion.div animate={{ x: [3, -2, 3] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}>
            <ChevronRight size={16} />
          </motion.div>
        </div>
        <span>Swipe or use nav to explore</span>
      </motion.div>
    </>
  );
}
