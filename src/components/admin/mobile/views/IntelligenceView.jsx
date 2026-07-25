import React from 'react';
import {
  AnalyticsPanel,
  CopilotPanel,
  AssetsPanel,
} from '../../../../pages/AdminDashboard';

const INTELLIGENCE_TABS = [
  { key: 'analytics', label: 'Analytics Hub', icon: 'ti-chart-bar' },
  { key: 'copilot', label: 'AI Copilot & ATS', icon: 'ti-sparkles' },
  { key: 'assets', label: 'Asset Storage', icon: 'ti-folder' },
];

export default function IntelligenceView({ activeSubTab = 'analytics', onSelectSubTab }) {
  return (
    <div className="admin-mobile-view">
      {/* Sub-tab pills switcher */}
      <div className="admin-subtab-bar">
        {INTELLIGENCE_TABS.map((tab) => {
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
        {activeSubTab === 'analytics' && <AnalyticsPanel />}
        {activeSubTab === 'copilot' && <CopilotPanel />}
        {activeSubTab === 'assets' && <AssetsPanel />}
      </div>
    </div>
  );
}
