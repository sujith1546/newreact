import React from 'react';
import useRealtimeData from '../../hooks/useRealtimeData';
import MobileExperienceView from '../../components/mobile/views/MobileExperienceView';
import { Loader2 } from 'lucide-react';

export default function MobileExperience() {
  const { data: experiences, loading } = useRealtimeData('experience', { orderColumn: 'display_order', ascending: true });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <Loader2 className="spin" size={28} color="var(--primary-blue)" />
      </div>
    );
  }

  return (
    <div className="mobile-page-experience">
      <MobileExperienceView experiences={experiences} />
    </div>
  );
}
