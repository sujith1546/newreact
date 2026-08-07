import React from 'react';
import HomePanel from '../../panels/HomePanel';

export default function HomeView() {
  return (
    <div className="admin-mobile-view">
      <div className="admin-subtab-content" style={{ padding: '16px 12px' }}>
        <HomePanel />
      </div>
    </div>
  );
}
