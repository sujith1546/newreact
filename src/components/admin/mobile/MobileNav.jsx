import React from 'react';

const NAV_TABS = [
  { key: 'home', label: 'Home', icon: 'ti-home', color: '#6366f1' },
  { key: 'inbox', label: 'Inbox', icon: 'ti-message-circle', color: '#3b82f6' },
  { key: 'content', label: 'Content', icon: 'ti-briefcase', color: '#10b981' },
  { key: 'system', label: 'System', icon: 'ti-settings', color: '#ec4899' },
];

export default function MobileNav({ activeCategory, onSelectCategory, unreadMessagesCount = 0 }) {
  return (
    <nav className="admin-mobile-nav">
      <div className="admin-mobile-nav-inner">
        {NAV_TABS.map((tab) => {
          const isActive = activeCategory === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onSelectCategory(tab.key)}
              className={`admin-mobile-nav-item ${isActive ? 'active' : ''}`}
              style={{ '--tab-color': tab.color }}
              aria-label={tab.label}
            >
              <div className="admin-mobile-nav-icon-wrap">
                <i className={`ti ${tab.icon}`} style={{ fontSize: 20 }} />
                {tab.key === 'inbox' && unreadMessagesCount > 0 && (
                  <span className="admin-mobile-nav-badge">
                    {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                  </span>
                )}
              </div>
              <span className="admin-mobile-nav-label">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
