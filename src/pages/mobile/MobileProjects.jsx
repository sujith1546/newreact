import React from 'react';
import useRealtimeData from '../../hooks/useRealtimeData';
import MobileProjectsView from '../../components/mobile/views/MobileProjectsView';
import { Loader2 } from 'lucide-react';

export default function MobileProjects() {
  const { data: projectsData, loading } = useRealtimeData('projects', { orderColumn: 'created_at', ascending: true, disableRealtime: true });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <Loader2 className="spin" size={28} color="var(--primary-blue)" />
      </div>
    );
  }

  return (
    <div className="mobile-page-projects">
      <MobileProjectsView projectsData={projectsData} />
    </div>
  );
}
