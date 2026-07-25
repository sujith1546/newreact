import React, { useState, useEffect } from 'react';
import useRealtimeData from '../../hooks/useRealtimeData';
import SkillCategoryGrid from '../../components/portfolio/skills/SkillCategoryGrid';
import { Loader2 } from 'lucide-react';

export default function MobileSkills() {
  const { data: rawSkills, loading } = useRealtimeData('skills', { orderColumn: 'order_index', ascending: true });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <Loader2 className="spin" size={28} color="var(--primary-blue)" />
      </div>
    );
  }

  return (
    <div className="mobile-page-skills">
      <SkillCategoryGrid rawSkills={rawSkills} />
    </div>
  );
}
