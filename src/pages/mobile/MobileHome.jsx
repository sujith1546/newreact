import React from 'react';
import MobileDashboard from '../../components/MobileDashboard';

export default function MobileHome({ onNavClick }) {
  return (
    <div className="home-content home-pane" style={{ height: '100%', width: '100%' }}>
      <MobileDashboard onNavClick={onNavClick} />
    </div>
  );
}
