import React from 'react';
import useRealtimeData from '../hooks/useRealtimeData';

export default function AnnouncementBanner() {
  const { data: dbSettings } = useRealtimeData('site_settings', { single: true, filter: { column: 'id', value: 1 } });
  
  // If settings are loading or announcement is not enabled, return null
  if (!dbSettings || !dbSettings.announcement_enabled || !dbSettings.announcement_text) {
    return null;
  }

  return (
    <div style={{
      width: '100%',
      background: 'linear-gradient(90deg, var(--primary-blue), #8b5cf6)',
      color: '#fff',
      padding: '10px 20px',
      textAlign: 'center',
      fontSize: '14px',
      fontWeight: 500,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '8px',
      zIndex: 9999,
      position: 'relative'
    }}>
      <i className="ti ti-bell-ringing" style={{ fontSize: '16px' }} />
      <span>{dbSettings.announcement_text}</span>
    </div>
  );
}
