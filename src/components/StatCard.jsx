import React from 'react';
import './StatCard.css'; // ensure styles are imported if using CSS modules or global

export default function StatCard({ value, label }) {
  return (
    <div className="stat-card glass-panel">
      <h4 className="stat-number">{value}</h4>
      <p className="stat-label">{label}</p>
    </div>
  );
}
