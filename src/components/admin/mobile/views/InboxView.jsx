import React from 'react';
import MessagesAdmin from '../../panels/MessagesAdmin';
import AiChatsPanel from '../../panels/AiChatsPanel';

const INBOX_TABS = [
  { key: 'messages', label: 'Messages', icon: 'ti-message-circle' },
  { key: 'chats', label: 'AI Chats', icon: 'ti-messages' },
];

export default function InboxView({ activeSubTab = 'messages', onSelectSubTab, unreadMessagesCount = 0 }) {
  return (
    <div className="admin-mobile-view">
      {/* Sub-tab pills switcher */}
      <div className="admin-subtab-bar">
        {INBOX_TABS.map((tab) => {
          const isActive = activeSubTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onSelectSubTab(tab.key)}
              className={`admin-subtab-pill ${isActive ? 'active' : ''}`}
            >
              <i className={`ti ${tab.icon}`} />
              <span>{tab.label}</span>
              {tab.key === 'messages' && unreadMessagesCount > 0 && (
                <span className="admin-subtab-badge">{unreadMessagesCount}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* View Content */}
      <div className="admin-subtab-content">
        {activeSubTab === 'messages' ? <MessagesAdmin /> : <AiChatsPanel />}
      </div>
    </div>
  );
}
