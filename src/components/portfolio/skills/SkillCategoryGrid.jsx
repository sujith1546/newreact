import React from 'react';

export default function SkillCategoryGrid({ categoryName = '', skills = [], rawSkills }) {
  // If rawSkills is passed, group by category
  if (rawSkills && Array.isArray(rawSkills)) {
    const grouped = rawSkills.reduce((acc, skill) => {
      const cat = skill.category || 'General';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(skill);
      return acc;
    }, {});

    return (
      <div className="skills-mobile-grid" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {Object.entries(grouped).map(([catName, catSkills]) => (
          <SkillCategoryGrid key={catName} categoryName={catName} skills={catSkills} />
        ))}
      </div>
    );
  }

  const safeCatName = categoryName || 'Skills';
  const displayCatName = safeCatName.replace(/_/g, ' ');

  const barColor = (pct) => {
    if (pct >= 85) return '#10b981';
    if (pct >= 65) return '#3b82f6';
    if (pct >= 45) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="skill-category-group" style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
          {displayCatName}
        </h3>
        <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
          {skills.length}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
        {skills.map((skill) => {
          const pct = skill.proficiency_level || skill.percentage || 80;
          const color = barColor(pct);
          return (
            <div
              key={skill.id || skill.name}
              style={{
                background: 'var(--bg-secondary, rgba(255, 255, 255, 0.04))',
                border: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
                borderRadius: 14,
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className={`ti ti-${skill.icon_class || 'star'}`} style={{ fontSize: 16, color }} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{skill.name}</h4>
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{skill.level_label || 'Intermediate'}</span>
                  </div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 800, color }}>{pct}%</span>
              </div>

              <div style={{ width: '100%', height: 5, background: 'var(--border-color, rgba(0,0,0,0.06))', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 0.8s ease' }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
