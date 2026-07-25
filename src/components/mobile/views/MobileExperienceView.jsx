import React from 'react';
import useRealtimeData from '../../../hooks/useRealtimeData';
import { Loader2, Briefcase, Calendar, MapPin } from 'lucide-react';

export default function MobileExperienceView() {
  const { data: expData, loading } = useRealtimeData('experience', { orderColumn: 'display_order', ascending: true });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <Loader2 className="spin" size={28} color="var(--primary-blue)" />
      </div>
    );
  }

  const items = expData || [];

  return (
    <div className="mobile-experience-view" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ marginBottom: 4 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 2px' }}>
          Professional Experience
        </h2>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
          Internships, engineering roles, and achievements
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              background: 'var(--bg-secondary, #ffffff)',
              border: '1px solid var(--border-color, rgba(0,0,0,0.08))',
              borderRadius: 16,
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-blue)' }}>
                {item.period || item.year}
              </span>
              {item.location && (
                <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={11} /> {item.location}
                </span>
              )}
            </div>

            <div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 2px', lineHeight: 1.25 }}>
                {item.role || item.title}
              </h3>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary-blue)', margin: 0 }}>
                {item.company || item.institution}
              </p>
            </div>

            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              {item.description}
            </p>

            {item.technologies && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingTop: 4 }}>
                {(typeof item.technologies === 'string' ? item.technologies.split(',') : item.technologies).map((t) => (
                  <span
                    key={t}
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: 6,
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {t.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
