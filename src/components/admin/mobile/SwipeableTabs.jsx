import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const CATEGORIES = ['home', 'inbox', 'content', 'system'];

export default function SwipeableTabs({ activeCategory, onCategoryChange, childrenMap }) {
  // Track visited categories for persistent DOM caching (lazy mounting)
  const [visited, setVisited] = useState(() => ({ [activeCategory]: true }));

  useEffect(() => {
    if (!visited[activeCategory]) {
      setVisited((prev) => ({ ...prev, [activeCategory]: true }));
    }
  }, [activeCategory, visited]);

  return (
    <div
      className="admin-swipeable-container"
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '100%',
        touchAction: 'pan-y',
      }}
    >
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
