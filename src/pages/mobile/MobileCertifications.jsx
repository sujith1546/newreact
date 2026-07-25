import React from 'react';
import useRealtimeData from '../../hooks/useRealtimeData';
import MobileCertificationsView from '../../components/mobile/views/MobileCertificationsView';
import { Loader2 } from 'lucide-react';

export default function MobileCertifications() {
  const { data: certificationsData, loading } = useRealtimeData('certifications', { orderColumn: 'display_order', ascending: true });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <Loader2 className="spin" size={28} color="var(--primary-blue)" />
      </div>
    );
  }

  return (
    <div className="mobile-page-certifications">
      <MobileCertificationsView certificationsData={certificationsData} />
    </div>
  );
}
