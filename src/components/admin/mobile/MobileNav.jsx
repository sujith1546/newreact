import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, MessageSquare, Plus, Briefcase, Settings } from 'lucide-react';
import haptic from '../../../lib/haptics';

const NAV_TABS = [
  { key: 'home',    Icon: Home,          label: 'Home' },
  { key: 'inbox',   Icon: MessageSquare, label: 'Inbox' },
  { key: 'content', Icon: Briefcase,     label: 'Content' },
  { key: 'system',  Icon: Settings,      label: 'System' },
];

export default function MobileNav({
  activeCategory,
  onSelectCategory,
  unreadMessagesCount = 0,
  isSpeedDialOpen = false,
  onToggleSpeedDial,
  hasPendingUpdate = false,
}) {
  const handleTabClick = useCallback((key) => {
    haptic.light();
    onSelectCategory(key);
  }, [onSelectCategory]);

  return (
    <nav className="mobile-nav-capsule" role="navigation" aria-label="Admin mobile navigation">
      {/* 1. Left Tabs: Home & Inbox */}
      {NAV_TABS.slice(0, 2).map(({ key, Icon, label }) => {
        const isActive = activeCategory === key && !isSpeedDialOpen;
        const showUnread = key === 'inbox' && unreadMessagesCount > 0;

        return (
          <div key={key} style={{ flex: 1, position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <motion.button
              onClick={() => handleTabClick(key)}
              className={`nav-capsule-tab admin-nav-tab${isActive ? ' nav-capsule-tab-active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
              aria-label={label}
              whileTap={{ scale: 0.88 }}
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                padding: '6px 2px',
                color: isActive ? 'var(--primary-blue, #3b82f6)' : 'var(--text-muted, #94a3b8)',
              }}
            >
              {/* Active Tab Sliding Pill */}
              {isActive && (
                <motion.div
                  layoutId="adminMobileActiveTabPill"
                  className="nav-capsule-active-pill admin-active-pill"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 14,
                    background: 'var(--primary-blue-subtle, rgba(59, 130, 246, 0.12))',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    zIndex: 0,
                  }}
                />
              )}

              {/* Icon Container */}
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={18} />
                {showUnread && (
                  <span style={{
                    position: 'absolute',
                    top: -4,
                    right: -8,
                    background: '#ef4444',
                    color: '#ffffff',
                    fontSize: 8.5,
                    fontWeight: 800,
                    minWidth: 15,
                    height: 15,
                    padding: '0 3px',
                    borderRadius: 8,
                    border: '1.5px solid var(--bg-primary, #0f1115)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1,
                  }}>
                    {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                  </span>
                )}
              </div>

              {/* Label */}
              <span style={{
                fontSize: 9.5,
                fontWeight: isActive ? 700 : 500,
                position: 'relative',
                zIndex: 1,
                lineHeight: 1.1,
              }}>
                {label}
              </span>
            </motion.button>
          </div>
        );
      })}

      {/* 2. Center '+' Elevated Action Button */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <motion.button
          onClick={() => {
            haptic.medium();
            onToggleSpeedDial();
          }}
          aria-label="Quick Actions"
          whileTap={{ scale: 0.9 }}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            padding: '0 4px',
            position: 'relative',
          }}
        >
          {/* Main Action Disc */}
          <motion.div
            animate={{
              rotate: isSpeedDialOpen ? 45 : 0,
              scale: isSpeedDialOpen ? 1.05 : 1,
            }}
            transition={{ type: 'spring', stiffness: 420, damping: 24 }}
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: isSpeedDialOpen
                ? '#ef4444'
                : 'linear-gradient(135deg, var(--primary-blue, #3b82f6), #2563eb)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: isSpeedDialOpen
                ? '0 4px 16px rgba(239, 68, 68, 0.4)'
                : '0 4px 16px rgba(59, 130, 246, 0.4)',
              border: '1.5px solid rgba(255, 255, 255, 0.25)',
              transform: 'translateY(-6px)',
              position: 'relative',
            }}
          >
            <Plus size={19} strokeWidth={2.4} />

            {/* Pending Update Beacon */}
            {hasPendingUpdate && !isSpeedDialOpen && (
              <span style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 9,
                height: 9,
                borderRadius: '50%',
                background: '#10b981',
                border: '2px solid #ffffff',
                boxShadow: '0 0 6px #10b981',
              }} />
            )}
          </motion.div>

          <span style={{
            fontSize: 9,
            fontWeight: 700,
            marginTop: -4,
            color: isSpeedDialOpen
              ? '#ef4444'
              : hasPendingUpdate
              ? '#10b981'
              : 'var(--text-muted, #94a3b8)',
          }}>
            {isSpeedDialOpen ? 'Close' : 'Create'}
          </span>
        </motion.button>
      </div>

      {/* 3. Right Tabs: Content & System */}
      {NAV_TABS.slice(2).map(({ key, Icon, label }) => {
        const isActive = activeCategory === key && !isSpeedDialOpen;

        return (
          <div key={key} style={{ flex: 1, position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <motion.button
              onClick={() => handleTabClick(key)}
              className={`nav-capsule-tab admin-nav-tab${isActive ? ' nav-capsule-tab-active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
              aria-label={label}
              whileTap={{ scale: 0.88 }}
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                padding: '6px 2px',
                color: isActive ? 'var(--primary-blue, #3b82f6)' : 'var(--text-muted, #94a3b8)',
              }}
            >
              {/* Active Tab Sliding Pill */}
              {isActive && (
                <motion.div
                  layoutId="adminMobileActiveTabPill"
                  className="nav-capsule-active-pill admin-active-pill"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 14,
                    background: 'var(--primary-blue-subtle, rgba(59, 130, 246, 0.12))',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    zIndex: 0,
                  }}
                />
              )}

              {/* Icon Container */}
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={18} />
              </div>

              {/* Label */}
              <span style={{
                fontSize: 9.5,
                fontWeight: isActive ? 700 : 500,
                position: 'relative',
                zIndex: 1,
                lineHeight: 1.1,
              }}>
                {label}
              </span>
            </motion.button>
          </div>
        );
      })}
    </nav>
  );
}
