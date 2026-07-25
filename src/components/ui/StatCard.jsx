import React from 'react';

const STAT_CARD_STYLES = `
.stat-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 10px 4px;
  text-align: center;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
}
.stat-number {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--primary-blue);
  margin-bottom: 4px;
}
.stat-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.glass-panel {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  backdrop-filter: blur(12px);
}
`;

export default function StatCard({ value, label }) {
  return (
    <div className="stat-card glass-panel">
      <style>{STAT_CARD_STYLES}</style>
      <h4 className="stat-number">{value}</h4>
      <p className="stat-label">{label}</p>
    </div>
  );
}
