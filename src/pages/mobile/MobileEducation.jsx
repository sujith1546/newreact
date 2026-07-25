import React from 'react';
import useRealtimeData from '../../hooks/useRealtimeData';
import MobileEducationView from '../../components/mobile/views/MobileEducationView';
import { Loader2 } from 'lucide-react';

export default function MobileEducation() {
  const { data: rawEducation, loading } = useRealtimeData('education', { orderColumn: 'display_order', ascending: true });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <Loader2 className="spin" size={28} color="var(--primary-blue)" />
      </div>
    );
  }

  const timelineData = (rawEducation || []).map(d => ({
    ...d,
    shortLabel: d.short_label,
    color: d.theme_color,
    bg: d.bg_color,
    textColor: d.text_color,
    backStats: d.back_stats,
    highlight: d.highlight_text
  }));

  return (
    <div className="mobile-page-education">
      <MobileEducationView timelineData={timelineData} />
    </div>
  );
}
