import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, MessageSquare, Plus, Briefcase, Settings } from 'lucide-react';
import haptic from '../../../lib/haptics';

// Tab definitions with admin-specific tooltips
const NAV_TABS = [
  { key: 'home',    Icon: Home,         label: 'Home',    tip: 'Dashboard Overview' },
  { key: 'inbox',   Icon: MessageSquare, label: 'Inbox',  tip: 'Messages & AI Chats' },
  { key: 'content', Icon: Briefcase,    label: 'Content', tip: 'Projects, Skills & More' },
  { key: 'system',  Icon: Settings,     label: 'System',  tip: 'Settings & Analytics' },
];

// Long press threshold in ms
const LONG_PRESS_MS = 320;

export default function MobileNav({
  activeCategory,
  onSelectCategory,
  unreadMessagesCount = 0,
  isSpeedDialOpen = false,
  onToggleSpeedDial,
  hasPendingUpdate = false,
  isSyncing = false,
}) {
  const [tooltip, setTooltip] = useState(null); // key of tab showing tooltip
  const longPressTimers = useRef({});

  // Long-press handlers
  const startLongPress = useCallback((key) => {
    longPressTimers.current[key] = setTimeout(() => {
      haptic.light();
      setTooltip(key);
      // Auto-dismiss after 2s
      setTimeout(() => setTooltip(null), 2000);
    }, LONG_PRESS_MS);
  }, []);

  const cancelLongPress = useCallback((key) => {
    if (longPressTimers.current[key]) {
      clearTimeout(longPressTimers.current[key]);
      delete longPressTimers.current[key];
    }
  }, []);

  const handleTabClick = useCallback((key) => {
    cancelLongPress(key);
    haptic.light();
    onSelectCategory(key);
  }, [cancelLongPress, onSelectCategory]);

  return (
    <nav className="mobile-nav-capsule" role="navigation" aria-label="Admin mobile navigation">

      {/* Regular Tabs (Home, Inbox, -, Content, System) */}
      {NAV_TABS.slice(0, 2).map(({ key, Icon, label, tip }) => {
        const isActive = activeCategory === key && !isSpeedDialOpen;
        const showUnread = key === 'inbox' && unreadMessagesCount > 0;

        return (
          <div key={key} style={{ flex: 1, position: 'relative' }}>
            {/* Long-Press Glassmorphic Tooltip */}
            <AnimatePresence>
              {tooltip === key && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    marginBottom: 8,
                    whiteSpace: 'nowrap',
                    padding: '5px 10px',
                    borderRadius: 10,
                    background: 'var(--pcms-panel, rgba(18,18,22,0.92))',
                    border: '1px solid var(--pcms-line, rgba(255,255,255,0.12))',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                    color: 'var(--pcms-text, #ffffff)',
                    fontSize: 11,
                    fontWeight: 600,
                    zIndex: 9999,
                    pointerEvents: 'none',
                  }}
                >
                  {tip}
                  {/* Downward caret */}
                  <span style={{
                    position: 'absolute',
                    bottom: -5,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 8,
                    height: 8,
                    background: 'var(--pcms-panel, rgba(18,18,22,0.92))',
                    border: '1px solid var(--pcms-line, rgba(255,255,255,0.12))',
                    borderTop: 'none',
                    borderLeft: 'none',
                    rotate: '45deg',
                    display: 'block',
                  }} />
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              onClick={() => handleTabClick(key)}
              onTouchStart={() => startLongPress(key)}
              onTouchEnd={() => cancelLongPress(key)}
              onTouchCancel={() => cancelLongPress(key)}
              className={`nav-capsule-tab admin-nav-tab${isActive ? ' nav-capsule-tab-active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
              aria-label={label}
              whileTap={{ scale: 0.84 }}
              transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              style={{ width: '100%' }}
            >
              {/* Active shimmer pill */}
              {isActive && (
                <motion.div
                  layoutId="adminMobileActiveTabPill"
                  className="nav-capsule-active-pill admin-active-pill"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}

              {/* Icon wrapper */}
              <motion.div
                animate={{
                  scale: isActive ? 1.16 : 1,
                  y: isActive ? -1 : 0,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
              >
                {/* Active glow ring */}
                {isActive && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    style={{
                      position: 'absolute',
                      inset: -5,
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)',
                      pointerEvents: 'none',
                    }}
                  />
                )}
                <Icon size={18} aria-hidden="true" />
                {/* Pulsing unread badge ring */}
                {showUnread && (
                  <span className="admin-badge-ring">
                    <span className="admin-badge-count">
                      {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                    </span>
                  </span>
                )}
              </motion.div>

              {/* Animated slide-up label */}
              <AnimatePresence>
                {isActive && (
                  <motion.span
                    key="label"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.16, ease: 'easeOut' }}
                    style={{
                      fontSize: '9.5px',
                      fontWeight: 700,
                      position: 'relative',
                      zIndex: 2,
                      color: 'var(--primary-blue, #6366f1)',
                      display: 'block',
                    }}
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        );
      })}

      {/* Center '+' Elevated Premium FAB */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        {/* Long-press tooltip for center button */}
        <AnimatePresence>
          {tooltip === 'create' && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'absolute',
                bottom: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                marginBottom: 12,
                whiteSpace: 'nowrap',
                padding: '5px 10px',
                borderRadius: 10,
                background: 'var(--pcms-panel, rgba(18,18,22,0.92))',
                border: '1px solid var(--pcms-line, rgba(255,255,255,0.12))',
                backdropFilter: 'blur(12px)',
                color: 'var(--pcms-text, #ffffff)',
                fontSize: 11,
                fontWeight: 600,
                zIndex: 9999,
                pointerEvents: 'none',
              }}
            >
              Quick Actions
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => {
            cancelLongPress('create');
            haptic.medium();
            onToggleSpeedDial();
          }}
          onTouchStart={() => startLongPress('create')}
          onTouchEnd={() => cancelLongPress('create')}
          onTouchCancel={() => cancelLongPress('create')}
          aria-label="Quick Actions"
          whileTap={{ scale: 0.88 }}
          style={{
            position: 'relative',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            padding: '0 4px',
          }}
        >
          {/* Live sync spinning ring */}
          {isSyncing && (
            <span
              style={{
                position: 'absolute',
                top: -12,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 52,
                height: 52,
                borderRadius: '50%',
                border: '2px solid transparent',
                borderTop: '2px solid #10b981',
                borderRight: '2px solid rgba(16,185,129,0.3)',
                animation: 'spin 1s linear infinite',
                pointerEvents: 'none',
                zIndex: 2,
              }}
            />
          )}

          {/* Pending update outer pulse ring */}
          {hasPendingUpdate && !isSpeedDialOpen && !isSyncing && (
            <motion.span
              animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                top: -12,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 52,
                height: 52,
                borderRadius: '50%',
                border: '2px solid #10b981',
                pointerEvents: 'none',
                zIndex: 1,
              }}
            />
          )}

          {/* Main disc — elevated translateY(-8px) */}
          <motion.div
            animate={{
              rotate: isSpeedDialOpen ? 45 : 0,
              scale: isSpeedDialOpen ? 1.06 : 1,
            }}
            transition={{ type: 'spring', stiffness: 420, damping: 24 }}
            style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              background: isSpeedDialOpen
                ? 'linear-gradient(135deg, #ef4444, #f97316)'
                : hasPendingUpdate
                ? 'linear-gradient(135deg, #10b981, #06b6d4)'
                : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: isSpeedDialOpen
                ? '0 6px 20px rgba(239,68,68,0.5), 0 2px 8px rgba(0,0,0,0.3)'
                : hasPendingUpdate
                ? '0 6px 20px rgba(16,185,129,0.55), 0 2px 8px rgba(0,0,0,0.3)'
                : '0 6px 20px rgba(99,102,241,0.5), 0 2px 8px rgba(0,0,0,0.3)',
              border: '1.5px solid rgba(255,255,255,0.25)',
              transform: 'translateY(-8px)',
              transition: 'background 0.25s ease, box-shadow 0.25s ease',
              position: 'relative',
            }}
          >
            <Plus size={20} strokeWidth={2.5} />
            {/* Pending update badge dot */}
            {hasPendingUpdate && !isSpeedDialOpen && (
              <motion.span
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: 11,
                  height: 11,
                  borderRadius: '50%',
                  background: '#10b981',
                  border: '2px solid white',
                  boxShadow: '0 0 8px #10b981',
                }}
              />
            )}
          </motion.div>

          <span style={{
            fontSize: 9,
            fontWeight: 700,
            marginTop: -5,
            color: isSpeedDialOpen
              ? '#ef4444'
              : hasPendingUpdate
              ? '#10b981'
              : 'var(--text-muted, #8a8a86)',
          }}>
            {isSpeedDialOpen ? 'Close' : hasPendingUpdate ? 'Sync' : 'Create'}
          </span>
        </motion.button>
      </div>

      {/* Content + System tabs */}
      {NAV_TABS.slice(2).map(({ key, Icon, label, tip }) => {
        const isActive = activeCategory === key && !isSpeedDialOpen;

        return (
          <div key={key} style={{ flex: 1, position: 'relative' }}>
            {/* Long-Press Tooltip */}
            <AnimatePresence>
              {tooltip === key && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    marginBottom: 8,
                    whiteSpace: 'nowrap',
                    padding: '5px 10px',
                    borderRadius: 10,
                    background: 'var(--pcms-panel, rgba(18,18,22,0.92))',
                    border: '1px solid var(--pcms-line, rgba(255,255,255,0.12))',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                    color: 'var(--pcms-text, #ffffff)',
                    fontSize: 11,
                    fontWeight: 600,
                    zIndex: 9999,
                    pointerEvents: 'none',
                  }}
                >
                  {tip}
                  <span style={{
                    position: 'absolute',
                    bottom: -5,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 8,
                    height: 8,
                    background: 'var(--pcms-panel, rgba(18,18,22,0.92))',
                    border: '1px solid var(--pcms-line, rgba(255,255,255,0.12))',
                    borderTop: 'none',
                    borderLeft: 'none',
                    rotate: '45deg',
                    display: 'block',
                  }} />
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              onClick={() => handleTabClick(key)}
              onTouchStart={() => startLongPress(key)}
              onTouchEnd={() => cancelLongPress(key)}
              onTouchCancel={() => cancelLongPress(key)}
              className={`nav-capsule-tab admin-nav-tab${isActive ? ' nav-capsule-tab-active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
              aria-label={label}
              whileTap={{ scale: 0.84 }}
              transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              style={{ width: '100%' }}
            >
              {isActive && (
                <motion.div
                  layoutId="adminMobileActiveTabPill"
                  className="nav-capsule-active-pill admin-active-pill"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}

              <motion.div
                animate={{ scale: isActive ? 1.16 : 1, y: isActive ? -1 : 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
              >
                {isActive && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{
                      position: 'absolute',
                      inset: -5,
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)',
                      pointerEvents: 'none',
                    }}
                  />
                )}
                <Icon size={18} aria-hidden="true" />
              </motion.div>

              {/* Animated slide-up label */}
              <AnimatePresence>
                {isActive && (
                  <motion.span
                    key="label"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.16, ease: 'easeOut' }}
                    style={{
                      fontSize: '9.5px',
                      fontWeight: 700,
                      position: 'relative',
                      zIndex: 2,
                      color: 'var(--primary-blue, #6366f1)',
                      display: 'block',
                    }}
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        );
      })}
    </nav>
  );
}
