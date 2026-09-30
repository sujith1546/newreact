import React from 'react';
import { motion } from 'framer-motion';
import MessagesAdmin from '../../panels/MessagesAdmin';
import AiChatsPanel from '../../panels/AiChatsPanel';
import haptic from '../../../../lib/haptics';

const INBOX_TABS = [
  { key: 'messages', label: 'Messages', icon: 'ti-message-circle' },
  { key: 'chats', label: 'AI Chats', icon: 'ti-messages' },
];

export default function InboxView({ activeSubTab = 'messages', onSelectSubTab, unreadMessagesCount = 0 }) {
  return (
    <div className="admin-mobile-view" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
      {/* Segmented Control Bar */}
      <div style={{
        display: 'flex',
        gap: 6,
        padding: '8px 14px',
        borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.08))',
        background: 'var(--bg-secondary, #18191d)',
        flexShrink: 0,
      }}>
        {INBOX_TABS.map((tab) => {
          const isActive = activeSubTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                haptic.light();
                onSelectSubTab(tab.key);
              }}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 18,
                border: 'none',
                background: 'transparent',
                color: isActive ? 'var(--primary-blue, #3b82f6)' : 'var(--text-muted, #94a3b8)',
                fontSize: 12,
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'color 0.15s ease',
              }}
            >
              {isActive ? (
                <motion.div
                  layoutId="inboxSubTabPill"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 18,
                    background: 'var(--primary-blue-subtle, rgba(59, 130, 246, 0.12))',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    zIndex: 0,
                  }}
                />
              ) : (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 18,
                    background: 'var(--bg-primary, rgba(255,255,255,0.04))',
                    border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
                    zIndex: 0,
                  }}
                />
              )}
              <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                <i className={`ti ${tab.icon}`} style={{ fontSize: 13, opacity: isActive ? 1 : 0.7 }} />
                <span>{tab.label}</span>
                {tab.key === 'messages' && unreadMessagesCount > 0 && (
                  <span style={{
                    background: '#ef4444',
                    color: '#ffffff',
                    fontSize: 9.5,
                    fontWeight: 800,
                    padding: '1px 5px',
                    borderRadius: 8,
                    marginLeft: 2,
                  }}>
                    {unreadMessagesCount}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* View Content */}
      <div className="admin-subtab-content" style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        padding: '12px 14px 130px',
      }}>
        {activeSubTab === 'messages' ? <MessagesAdmin /> : <AiChatsPanel />}
      </div>
    </div>
  );
}
