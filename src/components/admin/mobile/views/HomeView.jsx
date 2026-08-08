import React from 'react';
import MobileHomeShell from '../MobileHomeShell';

export default function HomeView() {
  return (
    <div className="admin-mobile-view" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
      <div className="admin-subtab-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch', overscrollBehaviorY: 'bounce', padding: '16px 14px 120px' }}>
        <MobileHomeShell />
      </div>
    </div>
  );
}

