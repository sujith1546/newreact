import React from 'react';
import MessagesAdmin from '../../panels/MessagesAdmin';
import AiChatsPanel from '../../panels/AiChatsPanel';

const INBOX_TABS = [
  { key: 'messages', label: 'Messages', icon: 'ti-message-circle' },
  { key: 'chats', label: 'AI Chats', icon: 'ti-messages' },
];

export default function InboxView({ activeSubTab = 'messages', onSelectSubTab, unreadMessagesCount = 0 }) {
  return (
    <div className="admin-mobile-view" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
      {/* Sub-tab Pills Switcher */}
      <div style={{
        display: 'flex',
        gap: 6,
        padding: '10px 14px',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        borderBottom: '1px solid var(--pcms-line-soft)',
        background: 'var(--pcms-bg-2)',
        flexShrink: 0,
      }}>
        {INBOX_TABS.map((tab) => {
          const isActive = activeSubTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onSelectSubTab(tab.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: '7px 13px',
                borderRadius: 20,
                border: isActive ? '1px solid var(--pcms-accent)' : '1px solid var(--pcms-line)',
                background: isActive ? 'var(--pcms-accent-dim)' : 'var(--pcms-panel)',
                color: isActive ? 'var(--pcms-accent)' : 'var(--pcms-muted)',
                fontSize: 12,
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <i className={`ti ${tab.icon}`} style={{ fontSize: 13, opacity: isActive ? 1 : 0.7 }} />
              <span>{tab.label}</span>
              {tab.key === 'messages' && unreadMessagesCount > 0 && (
                <span style={{
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 800,
                  padding: '1px 6px',
                  borderRadius: 10,
                  marginLeft: 2,
                }}>
                  {unreadMessagesCount}
                </span>
              )}
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
        padding: '14px 14px 110px',
      }}>
        {activeSubTab === 'messages' ? <MessagesAdmin /> : <AiChatsPanel />}
      </div>
    </div>
  );
}
