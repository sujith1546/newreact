import { useState, useEffect } from 'react';
import { ScrollReveal } from '../components';
import { Briefcase, Loader2, Calendar } from 'lucide-react';
import useRealtimeData from '../hooks/useRealtimeData';

export default function Experience() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  const [expandedId, setExpandedId] = useState(null);
  const { data: experiences, loading } = useRealtimeData('experience', { orderColumn: 'display_order', ascending: true });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <ScrollReveal>
      <style>{`
        .exp-page {
          width: 100%;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .exp-header h1 {
          font-size: 28px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 5px;
        }
        .exp-header p {
          font-size: 13.5px;
          color: var(--text-secondary);
          margin: 0;
        }
        
        .empty-state-card {
          width: 100%;
          box-sizing: border-box;
          background: var(--bg-secondary);
          border: 1px dashed #d1d5db;
          border-radius: 16px;
          padding: 60px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 16px;
        }
        
        .empty-icon-wrap {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #f3f4f6;
          color: #9ca3af;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .empty-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }
        
        .empty-desc {
          font-size: 14px;
          color: var(--text-secondary);
          max-width: 550px;
          line-height: 1.6;
          margin: 0;
        }

        [data-theme="dark"] .empty-state-card {
          border-color: #374151;
        }
        [data-theme="dark"] .empty-icon-wrap {
          background: #374151;
          color: #6b7280;
        }

        /* Timeline Styles (Desktop Default) */
        .timeline {
          position: relative;
          padding-left: 24px;
          margin-top: 10px;
        }
        .timeline::before {
          content: '';
          position: absolute;
          top: 0; left: 6px; bottom: 0;
          width: 2px;
          background: var(--border-color);
          border-radius: 2px;
        }
        .timeline-item {
          position: relative;
          margin-bottom: 32px;
        }
        .timeline-item:last-child {
          margin-bottom: 0;
        }
        .timeline-dot {
          position: absolute;
          top: 4px; left: -23px;
          width: 10px; height: 10px;
          border-radius: 50%;
          background: var(--primary-blue);
          border: 2px solid var(--bg-primary);
          box-sizing: content-box;
        }
        .timeline-content {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 20px;
        }
        .timeline-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
          flex-wrap: wrap;
          gap: 8px;
        }
        .timeline-title h3 {
          margin: 0 0 4px;
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
        }
        .timeline-title p {
          margin: 0;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-secondary);
        }
        .timeline-date {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
          background: var(--bg-primary);
          padding: 4px 10px;
          border-radius: 20px;
          border: 1px solid var(--border-color);
        }
        .timeline-bullets {
          margin: 0; padding-left: 18px;
          color: var(--text-secondary);
          font-size: 14px;
          line-height: 1.6;
        }
        .timeline-bullets li {
          margin-bottom: 6px;
        }
        .timeline-bullets li:last-child {
          margin-bottom: 0;
        }

        /* ========== MOBILE ULTRA-COMPACT (STRICTLY SCOPED TO MOBILE) ========== */
        @media (max-width: 900px) {
          .exp-page {
            height: 100%;
            max-height: calc(100vh - 120px);
            overflow: hidden;
            gap: 12px;
          }
          .exp-header h1 { font-size: 16px; margin-bottom: 2px; }
          .exp-header p { font-size: 10px; }
          
          .timeline {
            flex: 1;
            overflow-y: auto;
            margin-top: 4px;
            padding-left: 18px;
            padding-right: 4px;
          }
          .timeline::-webkit-scrollbar { display: none; }
          .timeline-item { margin-bottom: 14px; }
          .timeline-dot { width: 8px; height: 8px; left: -16px; top: 8px; }
          .timeline::before { left: -12px; }
          
          .timeline-content { padding: 12px; border-radius: 12px; }
          .timeline-header { margin-bottom: 6px; gap: 4px; }
          .timeline-title h3 { font-size: 13px; margin: 0 0 2px; }
          .timeline-title p { font-size: 10px; }
          .timeline-date { font-size: 9.5px; padding: 2px 7px; }
          
          .timeline-bullets { font-size: 11px; padding-left: 14px; }
          .timeline-bullets li { margin-bottom: 4px; }

          .empty-state-card {
            padding: 28px 16px;
            border-radius: 14px;
            gap: 10px;
          }
          .empty-icon-wrap { width: 44px; height: 44px; }
          .empty-title { font-size: 14px; }
          .empty-desc { font-size: 11.5px; line-height: 1.5; }
        }
      `}</style>
      
      <div className="exp-page">
        {isMobile && (
          <div className="exp-header">
            <h1>Experience</h1>
            <p>My professional journey so far</p>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <Loader2 className="spin" size={32} color="var(--primary-blue)" />
          </div>
        ) : (!experiences || experiences.length === 0) ? (
          <div className="empty-state-card">
            <div className="empty-icon-wrap">
              <Briefcase size={24} />
            </div>
            <h2 className="empty-title">Seeking Opportunities</h2>
            <p className="empty-desc">
              I am currently a fresher, eagerly building my technical foundation through personal projects and continuous learning. I am actively looking for opportunities to apply my skills in a real-world environment.
            </p>
          </div>
        ) : (
          <div className="timeline">
            {experiences.map((exp, index) => {
              const isExpanded = isMobile ? (expandedId === exp.id || (expandedId === null && index === 0)) : true;
              return (
                <div 
                  key={exp.id} 
                  className={`timeline-item${isExpanded ? ' timeline-expanded' : ''}`}
                  onClick={() => isMobile && setExpandedId(expandedId === exp.id ? null : exp.id)}
                  style={{ cursor: isMobile ? 'pointer' : 'default' }}
                >
                  <div className="timeline-dot" />
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <div className="timeline-title">
                        <h3>{exp.role}</h3>
                        <p>{exp.company} {exp.is_education ? '(Education)' : ''}</p>
                      </div>
                      <div className="timeline-date">
                        <Calendar size={14} />
                        {exp.start_date} — {exp.end_date || 'Present'}
                      </div>
                    </div>
                    {isExpanded && exp.description_bullets && exp.description_bullets.length > 0 && (
                      <ul className="timeline-bullets">
                        {exp.description_bullets.map((bullet, i) => (
                          <li key={i}>{bullet}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ScrollReveal>
  );
}
