import React from 'react';
import {
  ThemeStudioPanel,
  SettingsPanel,
  BackupRestorePanel,
  AuditHealthPanel,
} from '../../../../pages/AdminDashboard';

const SYSTEM_TABS = [
  { key: 'theme', label: 'Theme Studio', icon: 'ti-palette' },
  { key: 'settings', label: 'Settings', icon: 'ti-settings' },
  { key: 'backup', label: 'Backup & Restore', icon: 'ti-database' },
  { key: 'audit', label: 'Audit & Health', icon: 'ti-activity' },
];

export default function SystemView({ activeSubTab = 'theme', onSelectSubTab }) {
  return (
    <div className="admin-mobile-view">
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
      <div className="admin-subtab-content">
        {activeSubTab === 'theme' && <ThemeStudioPanel />}
        {activeSubTab === 'settings' && <SettingsPanel />}
        {activeSubTab === 'backup' && <BackupRestorePanel />}
        {activeSubTab === 'audit' && <AuditHealthPanel />}
      </div>
    </div>
  );
}
