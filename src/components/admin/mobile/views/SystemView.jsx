import React from 'react';
import SettingsPanel from '../../panels/SettingsPanel';

const SYSTEM_TABS = [
  { key: 'settings', label: 'Settings', icon: 'ti-settings' },
];

export default function SystemView({ activeSubTab = 'settings', onSelectSubTab }) {
  return (
    <div className="admin-mobile-view" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
      {/* Sub-tab pills switcher */}
      <div className="admin-subtab-bar">
        {SYSTEM_TABS.map((tab) => {
          const isActive = activeSubTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onSelectSubTab(tab.key)}
              className={`admin-subtab-pill ${isActive ? 'active' : ''}`}
            >
              <i className={`ti ${tab.icon}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* View Content */}
      <div className="admin-subtab-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '12px 14px 100px' }}>
        {activeSubTab === 'settings' && <SettingsPanel />}
      </div>
    </div>
  );
}
