import React from 'react';
import { motion } from 'framer-motion';

const NAV_TABS = [
  { key: 'home', label: 'Home', icon: 'ti-home', color: '#6366f1' },
  { key: 'inbox', label: 'Inbox', icon: 'ti-message-circle', color: '#3b82f6' },
  { key: 'content', label: 'Content', icon: 'ti-briefcase', color: '#10b981' },
  { key: 'system', label: 'System', icon: 'ti-settings', color: '#ec4899' },
];

export default function MobileNav({ activeCategory, onSelectCategory, unreadMessagesCount = 0 }) {
  return (
    <nav style={{
      position: 'fixed',
      bottom: 12,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9000,
      width: 'calc(100% - 24px)',
      maxWidth: 440,
    }}>
      <div style={{
        background: 'rgba(18, 18, 22, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.14)',
        borderRadius: 24,
        padding: '6px 8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45)',
      }}>
        {NAV_TABS.map((tab) => {
          const isActive = activeCategory === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onSelectCategory(tab.key)}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px 14px',
                borderRadius: 16,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: isActive ? tab.color : 'rgba(255, 255, 255, 0.55)',
                transition: 'color 0.2s ease',
                flex: 1,
              }}
              aria-label={tab.label}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabPill"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 16,
                    background: `${tab.color}18`,
                    border: `1px solid ${tab.color}33`,
                  }}
                />
              )}
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                  <i className={`ti ${tab.icon}`} style={{ fontSize: 19, color: isActive ? tab.color : 'inherit' }} />
                  {tab.key === 'inbox' && unreadMessagesCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: -4,
                      right: -8,
                      background: '#ef4444',
                      color: '#fff',
                      fontSize: 9,
                      fontWeight: 800,
                      padding: '1px 5px',
                      borderRadius: 10,
                      lineHeight: 1,
                    }}>
                      {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 10.5, fontWeight: isActive ? 700 : 500, marginTop: 3 }}>
                  {tab.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
