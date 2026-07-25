import React from 'react';
import MobileDashboard from '../../MobileDashboard';

export default function MobileHomeView({ onNavClick }) {
  return (
    <div className="mobile-home-view">
      <MobileDashboard onNavClick={onNavClick} />
    </div>
  );
}
