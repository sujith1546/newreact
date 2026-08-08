import React from 'react';
import { motion } from 'framer-motion';
import { Home, MessageSquare, Plus, Briefcase, Settings } from 'lucide-react';

export default function MobileNav({
  activeCategory,
  onSelectCategory,
  unreadMessagesCount = 0,
  isSpeedDialOpen = false,
  onToggleSpeedDial,
  hasPendingUpdate = false,
}) {
  return (
    <nav className="mobile-nav-capsule" role="navigation" aria-label="Admin mobile navigation">
      {/* 1. Home */}
      <motion.button
        onClick={() => onSelectCategory('home')}
        className={`nav-capsule-tab${activeCategory === 'home' && !isSpeedDialOpen ? ' nav-capsule-tab-active' : ''}`}
        aria-current={activeCategory === 'home' && !isSpeedDialOpen ? 'page' : undefined}
        aria-label="Home"
        whileTap={{ scale: 0.85 }}
        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
      >
        {activeCategory === 'home' && !isSpeedDialOpen && (
          <motion.div
            layoutId="adminMobileActiveTabPill"
            className="nav-capsule-active-pill"
            transition={{ type: 'spring', stiffness: 450, damping: 32 }}
          />
        )}
        <motion.div
          animate={{ scale: activeCategory === 'home' && !isSpeedDialOpen ? 1.16 : 1, y: activeCategory === 'home' && !isSpeedDialOpen ? -1 : 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Home size={18} aria-hidden="true" />
        </motion.div>
        <span>Home</span>
      </motion.button>

      {/* 2. Inbox */}
      <motion.button
        onClick={() => onSelectCategory('inbox')}
        className={`nav-capsule-tab${activeCategory === 'inbox' && !isSpeedDialOpen ? ' nav-capsule-tab-active' : ''}`}
        aria-current={activeCategory === 'inbox' && !isSpeedDialOpen ? 'page' : undefined}
        aria-label="Inbox"
        whileTap={{ scale: 0.85 }}
        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
      >
        {activeCategory === 'inbox' && !isSpeedDialOpen && (
          <motion.div
            layoutId="adminMobileActiveTabPill"
            className="nav-capsule-active-pill"
            transition={{ type: 'spring', stiffness: 450, damping: 32 }}
          />
        )}
        <motion.div
          animate={{ scale: activeCategory === 'inbox' && !isSpeedDialOpen ? 1.16 : 1, y: activeCategory === 'inbox' && !isSpeedDialOpen ? -1 : 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
        >
          <MessageSquare size={18} aria-hidden="true" />
          {unreadMessagesCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: -4,
                right: -9,
                background: '#ef4444',
                color: '#ffffff',
                fontSize: 9,
                fontWeight: 800,
                padding: '1px 5px',
                borderRadius: 10,
                lineHeight: 1,
                zIndex: 3,
                boxShadow: '0 2px 5px rgba(239,68,68,0.5)',
              }}
            >
              {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
            </span>
          )}
        </motion.div>
        <span>Inbox</span>
      </motion.button>

      {/* 3. Center '+' Quick Actions Button */}
      <motion.button
        onClick={onToggleSpeedDial}
        className="nav-capsule-tab"
        aria-label="Quick Actions"
        whileTap={{ scale: 0.88 }}
        style={{ position: 'relative', zIndex: 5 }}
      >
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <motion.div
            animate={{
              rotate: isSpeedDialOpen ? 45 : 0,
              scale: isSpeedDialOpen ? 1.08 : 1,
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              background: isSpeedDialOpen
                ? 'linear-gradient(135deg, #ef4444, #f97316)'
                : hasPendingUpdate
                ? 'linear-gradient(135deg, #10b981, #06b6d4)'
                : 'linear-gradient(135deg, var(--primary-blue, #6366f1), #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: isSpeedDialOpen
                ? '0 4px 14px rgba(239,68,68,0.45)'
                : hasPendingUpdate
                ? '0 4px 16px rgba(16,185,129,0.55)'
                : '0 4px 14px rgba(99,102,241,0.4)',
              border: '1px solid rgba(255,255,255,0.25)',
              transition: 'background 0.3s ease, box-shadow 0.3s ease',
            }}
          >
            <Plus size={19} strokeWidth={2.6} />
          </motion.div>
          {hasPendingUpdate && !isSpeedDialOpen && (
            <motion.span
              animate={{ scale: [1, 1.35, 1], opacity: [1, 0.7, 1] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                top: -2,
                right: -2,
                width: 10,
                height: 10,
                borderRadius: 5,
                background: '#10b981',
                border: '2px solid #ffffff',
                boxShadow: '0 0 8px #10b981',
                zIndex: 4,
              }}
            />
          )}
        </div>
        <span style={{
          fontSize: 9,
          fontWeight: 600,
          marginTop: 2,
          color: isSpeedDialOpen ? '#ef4444' : hasPendingUpdate ? '#10b981' : 'var(--text-muted, #8a8a86)',
        }}>
          {isSpeedDialOpen ? 'Close' : hasPendingUpdate ? 'Sync' : 'Create'}
        </span>
      </motion.button>

      {/* 4. Content */}
      <motion.button
        onClick={() => onSelectCategory('content')}
        className={`nav-capsule-tab${activeCategory === 'content' && !isSpeedDialOpen ? ' nav-capsule-tab-active' : ''}`}
        aria-current={activeCategory === 'content' && !isSpeedDialOpen ? 'page' : undefined}
        aria-label="Content"
        whileTap={{ scale: 0.85 }}
        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
      >
        {activeCategory === 'content' && !isSpeedDialOpen && (
          <motion.div
            layoutId="adminMobileActiveTabPill"
            className="nav-capsule-active-pill"
            transition={{ type: 'spring', stiffness: 450, damping: 32 }}
          />
        )}
        <motion.div
          animate={{ scale: activeCategory === 'content' && !isSpeedDialOpen ? 1.16 : 1, y: activeCategory === 'content' && !isSpeedDialOpen ? -1 : 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Briefcase size={18} aria-hidden="true" />
        </motion.div>
        <span>Content</span>
      </motion.button>

      {/* 5. System */}
      <motion.button
        onClick={() => onSelectCategory('system')}
        className={`nav-capsule-tab${activeCategory === 'system' && !isSpeedDialOpen ? ' nav-capsule-tab-active' : ''}`}
        aria-current={activeCategory === 'system' && !isSpeedDialOpen ? 'page' : undefined}
        aria-label="System"
        whileTap={{ scale: 0.85 }}
        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
      >
        {activeCategory === 'system' && !isSpeedDialOpen && (
          <motion.div
            layoutId="adminMobileActiveTabPill"
            className="nav-capsule-active-pill"
            transition={{ type: 'spring', stiffness: 450, damping: 32 }}
          />
        )}
        <motion.div
          animate={{ scale: activeCategory === 'system' && !isSpeedDialOpen ? 1.16 : 1, y: activeCategory === 'system' && !isSpeedDialOpen ? -1 : 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Settings size={18} aria-hidden="true" />
        </motion.div>
        <span>System</span>
      </motion.button>
    </nav>
  );
}
