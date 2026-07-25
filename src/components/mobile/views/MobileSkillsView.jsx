import React from 'react';
import useRealtimeData from '../../../hooks/useRealtimeData';
import SkillCategoryGrid from '../../portfolio/skills/SkillCategoryGrid';
import { Loader2 } from 'lucide-react';

export default function MobileSkillsView() {
  const { data: rawSkills, loading } = useRealtimeData('skills', { orderColumn: 'order_index', ascending: true });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <Loader2 className="spin" size={28} color="var(--primary-blue)" />
      </div>
    );
  }

  return (
    <div className="mobile-skills-view">
      <SkillCategoryGrid rawSkills={rawSkills || []} />
    </div>
  );
}
