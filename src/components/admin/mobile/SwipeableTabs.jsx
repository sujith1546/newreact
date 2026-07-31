import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const CATEGORIES = ['inbox', 'content', 'system'];

export default function SwipeableTabs({ activeCategory, onCategoryChange, childrenMap }) {
  // Track visited categories for persistent DOM caching (lazy mounting)
  const [visited, setVisited] = useState(() => ({ [activeCategory]: true }));

  useEffect(() => {
    if (!visited[activeCategory]) {
      setVisited((prev) => ({ ...prev, [activeCategory]: true }));
    }
  }, [activeCategory, visited]);

  const currentIndex = CATEGORIES.indexOf(activeCategory);

  const handleDragEnd = (event, info) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold && currentIndex < CATEGORIES.length - 1) {
      // Swiped left -> next category
      onCategoryChange(CATEGORIES[currentIndex + 1]);
    } else if (info.offset.x > swipeThreshold && currentIndex > 0) {
      // Swiped right -> prev category
      onCategoryChange(CATEGORIES[currentIndex - 1]);
    }
  };

  return (
    <motion.div
      className="admin-swipeable-container"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.15}
      onDragEnd={handleDragEnd}
      style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
    >
      {CATEGORIES.map((cat) => {
        const isVisited = visited[cat];
        const isActive = activeCategory === cat;

        if (!isVisited) return null;

        return (
          <div
            key={cat}
            className="admin-tab-panel"
            style={{
              display: isActive ? 'flex' : 'none',
              flexDirection: 'column',
              flex: 1,
              overflowY: 'auto',
              height: '100%',
            }}
          >
            {childrenMap[cat]}
          </div>
        );
      })}
    </motion.div>
  );
}
