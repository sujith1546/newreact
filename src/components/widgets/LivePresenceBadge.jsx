import React from 'react';
import { useSupabasePresence } from '../../hooks/useSupabasePresence';

export default function LivePresenceBadge() {
  const { visitorCount, isConnected } = useSupabasePresence();

  // Hide badge if offline, uninitialized, or fallback
  if (!isConnected || visitorCount === null || visitorCount === undefined) {
    return null;
  }

  return (
    <div
      className="live-presence-badge"
      title="Live count of active visitors/tabs currently connected to this portfolio (Supabase Realtime WebSockets)."
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '3px 9px',
        borderRadius: '999px',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        fontSize: '11px',
        fontWeight: 600,
        color: 'var(--text-secondary)',
        cursor: 'help',
        userSelect: 'none',
        transition: 'all 0.2s ease',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: '#10b981',
          boxShadow: '0 0 6px rgba(16, 185, 129, 0.6)',
          display: 'inline-block',
        }}
      />
      <span>{visitorCount} {visitorCount === 1 ? 'viewer online' : 'viewers online'}</span>
    </div>
  );
}
