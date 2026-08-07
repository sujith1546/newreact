import React from 'react';
import HomePanel from '../../panels/HomePanel';

export default function HomeView() {
  return (
    <div className="admin-mobile-view" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
      <div className="admin-subtab-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch', overscrollBehaviorY: 'bounce', padding: '14px 14px 120px' }}>
        <HomePanel isMobile={true} />
      </div>
    </div>
  );
}
