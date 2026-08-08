import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, ArrowDown } from 'lucide-react';
import haptic from '../../../lib/haptics';

const CATEGORIES = ['home', 'inbox', 'content', 'system'];

export default function SwipeableTabs({ activeCategory, onCategoryChange, childrenMap, onPullRefresh, isSyncing }) {
  const [visited, setVisited] = useState(() => ({ [activeCategory]: true }));
  const [pullDist, setPullDist] = useState(0);
  const touchStartRef = useRef(0);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!visited[activeCategory]) {
      setVisited((prev) => ({ ...prev, [activeCategory]: true }));
    }
  }, [activeCategory, visited]);

  // Pull-to-refresh touch handlers
  const handleTouchStart = (e) => {
    if (containerRef.current && containerRef.current.scrollTop <= 2) {
      touchStartRef.current = e.touches[0].clientY;
    } else {
      touchStartRef.current = 0;
    }
  };

  const handleTouchMove = (e) => {
    if (!touchStartRef.current) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartRef.current;
    if (diff > 0) {
      // Apply elastic damping curve
      const damped = Math.min(80, diff * 0.42);
      setPullDist(damped);
    }
  };

  const handleTouchEnd = () => {
    if (pullDist >= 55) {
      haptic.medium();
      if (onPullRefresh) onPullRefresh();
    }
    setPullDist(0);
    touchStartRef.current = 0;
  };

  const progress = Math.min(100, Math.round((pullDist / 55) * 100));
  const isReady = pullDist >= 55;

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="admin-swipeable-container"
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '100%',
        touchAction: 'pan-y',
        position: 'relative',
      }}
    >
      {/* Liquid Pull-To-Refresh Indicator */}
      <AnimatePresence>
        {(pullDist > 5 || isSyncing) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: isSyncing ? 48 : pullDist }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 14px',
                borderRadius: 20,
                background: isReady ? 'rgba(16,185,129,0.18)' : 'var(--pcms-panel, #18181c)',
                border: isReady ? '1px solid rgba(16,185,129,0.45)' : '1px solid var(--pcms-line, rgba(255,255,255,0.12))',
                boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
                color: isReady ? '#10b981' : 'var(--pcms-text, #ffffff)',
                fontSize: 11.5,
                fontWeight: 700,
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isSyncing ? (
                  <RefreshCw size={14} className="spinning" color="#10b981" />
                ) : (
                  <ArrowDown
                    size={14}
                    style={{
                      transform: isReady ? 'rotate(180deg)' : `rotate(${progress * 1.8}deg)`,
                      transition: 'transform 0.2s ease',
                    }}
                  />
                )}
              </div>
              <span>{isSyncing ? 'Refreshing...' : isReady ? 'Release to Sync' : `Pull to Refresh (${progress}%)`}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {CATEGORIES.map((cat) => {
        const isVisited = visited[cat];
        const isActive = activeCategory === cat;

        if (!isVisited) return null;

        return (
          <motion.div
            key={cat}
            className="admin-tab-panel"
            initial={false}
            animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{
              display: isActive ? 'flex' : 'none',
              flexDirection: 'column',
              flex: 1,
              overflow: 'hidden',
              height: '100%',
              width: '100%',
              maxWidth: '100%',
            }}
          >
            {childrenMap[cat]}
          </motion.div>
        );
      })}
    </div>
  );
}
