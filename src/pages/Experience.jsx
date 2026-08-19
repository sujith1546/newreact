import { useState, useEffect } from 'react';
import { ScrollReveal } from '../components';
import { Briefcase, Loader2, Calendar, Send, FileText, Sparkles, CheckCircle2, Zap, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import useRealtimeData from '../hooks/useRealtimeData';

export default function Experience() {
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth <= 900);
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

        /* ========== MOBILE OPPORTUNITY & CAREER HUB ========== */
        @media (max-width: 900px) {
          .exp-page {
            height: 100%;
            overflow-y: auto;
            gap: 12px;
            -ms-overflow-style: none; scrollbar-width: none;
          }
          .exp-page::-webkit-scrollbar { display: none; }
          .exp-header h1 { font-size: 16px; margin-bottom: 2px; }
          .exp-header p { font-size: 10.5px; }

          .exp-mob-hub {
            display: flex; flex-direction: column; gap: 10px;
            width: 100%;
          }

          .exp-mob-hero-card {
            background: linear-gradient(135deg, rgba(59,130,246,0.08), rgba(16,185,129,0.05));
            border: 1px solid rgba(59,130,246,0.25);
            border-radius: 18px;
            padding: 16px;
            position: relative; overflow: hidden;
            display: flex; flex-direction: column; gap: 8px;
          }

          .exp-mob-avail-pill {
            display: inline-flex; align-items: center; gap: 6px;
            background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.3);
            border-radius: 20px; padding: 3px 10px;
            font-size: 9.5px; font-weight: 700; color: #10b981;
            width: fit-content;
          }
          .exp-mob-avail-dot {
            width: 6px; height: 6px; border-radius: 50%; background: #10b981;
            animation: exp-pulse 2s infinite;
          }
          @keyframes exp-pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.6); opacity: 0.5; }
          }

          .exp-mob-title {
            font-size: 16px; font-weight: 800; color: var(--text-primary);
            letter-spacing: -0.02em; margin: 0;
          }
          .exp-mob-desc {
            font-size: 11.5px; color: var(--text-secondary);
            line-height: 1.55; margin: 0;
          }

          .exp-mob-roles-wrap {
            display: flex; flex-direction: column; gap: 6px;
            background: var(--bg-secondary); border: 1px solid var(--border-color);
            border-radius: 14px; padding: 12px;
          }
          .exp-mob-roles-label {
            font-size: 9px; font-weight: 800; text-transform: uppercase;
            letter-spacing: 0.08em; color: var(--text-muted); margin: 0;
            display: flex; align-items: center; gap: 5px;
          }
          .exp-mob-roles-pills {
            display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px;
          }
          .exp-mob-role-pill {
            font-size: 10px; font-weight: 700;
            padding: 3px 9px; border-radius: 20px;
            background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.25);
            color: #6366f1;
          }

          .exp-mob-skills-grid {
            display: grid; grid-template-columns: 1fr 1fr; gap: 7px;
          }
          .exp-mob-skill-card {
            background: var(--bg-secondary); border: 1px solid var(--border-color);
            border-radius: 12px; padding: 10px;
            display: flex; align-items: center; gap: 8px;
          }
          .exp-mob-skill-icon {
            color: #10b981; flex-shrink: 0;
          }
          .exp-mob-skill-text {
            font-size: 10.5px; font-weight: 700; color: var(--text-primary);
          }

          .exp-mob-actions {
            display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 2px;
          }
          .exp-mob-action-btn {
            display: flex; align-items: center; justify-content: center; gap: 6px;
            padding: 10px; border-radius: 12px; font-size: 11.5px; font-weight: 700;
            cursor: pointer; border: 1px solid;
            transition: transform 0.15s;
          }
          .exp-mob-action-btn:active { transform: scale(0.96); }

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
        }
      `}</style>
      
      <div className="exp-page">
        {isMobile && (
          <div className="exp-header">
            <h1>Experience</h1>
            <p>My professional journey & opportunity status</p>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <Loader2 className="spin" size={32} color="var(--primary-blue)" />
          </div>
        ) : (!experiences || experiences.length === 0) ? (
          isMobile ? (
            /* Mobile Opportunity & Career Hub */
            <div className="exp-mob-hub">
              {/* Hero Status Card */}
              <motion.div
                className="exp-mob-hero-card"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
              >
                <div className="exp-mob-avail-pill">
                  <span className="exp-mob-avail-dot" />
                  Actively Seeking Opportunities
                </div>
                <h2 className="exp-mob-title">Ready to Deliver Impact</h2>
                <p className="exp-mob-desc">
                  Final year B.Tech student with strong foundation in AI/ML, Full-Stack Development, and Cloud Databases. Eager to contribute to high-impact production engineering teams.
                </p>
              </motion.div>

              {/* Target Roles */}
              <div className="exp-mob-roles-wrap">
                <p className="exp-mob-roles-label">
                  <Sparkles size={11} style={{ color: '#6366f1' }} />
                  Target Engineering Roles
                </p>
                <div className="exp-mob-roles-pills">
                  {['Full-Stack Engineer', 'AI/ML Developer', 'Python Backend Dev', 'Data Science Intern'].map(role => (
                    <span key={role} className="exp-mob-role-pill">{role}</span>
                  ))}
                </div>
              </div>

              {/* Core Strengths Grid */}
              <div className="exp-mob-skills-grid">
                {[
                  'RAG & LLM Pipelines',
                  'FastAPI & Python',
                  'React & Modern UI',
                  'PostgreSQL & Supabase'
                ].map(s => (
                  <div key={s} className="exp-mob-skill-card">
                    <CheckCircle2 size={14} className="exp-mob-skill-icon" />
                    <span className="exp-mob-skill-text">{s}</span>
                  </div>
                ))}
              </div>

              {/* Response SLA */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, padding: '2px 0' }}>
                <Clock size={11} style={{ color: '#10b981' }} />
                <span>Quick Response SLA · Replies within 24 hours</span>
              </div>

              {/* CTAs */}
              <div className="exp-mob-actions">
                <button
                  className="exp-mob-action-btn"
                  style={{ background: 'rgba(59,130,246,0.12)', borderColor: 'rgba(59,130,246,0.3)', color: '#3b82f6' }}
                  onClick={() => window.location.href = '/contact'}
                >
                  <Send size={13} />
                  Get in Touch
                </button>
                <button
                  className="exp-mob-action-btn"
                  style={{ background: 'rgba(16,185,129,0.12)', borderColor: 'rgba(16,185,129,0.3)', color: '#10b981' }}
                  onClick={() => window.dispatchEvent(new CustomEvent('open-resume'))}
                >
                  <FileText size={13} />
                  View Resume
                </button>
              </div>
            </div>
          ) : (
            <div className="empty-state-card">
              <div className="empty-icon-wrap">
                <Briefcase size={24} />
              </div>
              <h2 className="empty-title">Seeking Opportunities</h2>
              <p className="empty-desc">
                I am currently a fresher, eagerly building my technical foundation through personal projects and continuous learning. I am actively looking for opportunities to apply my skills in a real-world environment.
              </p>
            </div>
          )
        ) : (
          <div className="timeline">
            {experiences.map((exp) => (
              <div key={exp.id} className="timeline-item">
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
                  {(() => {
                    let bullets = [];
                    try {
                      bullets = Array.isArray(exp.description_bullets)
                        ? exp.description_bullets
                        : (typeof exp.description_bullets === 'string' ? JSON.parse(exp.description_bullets) : []);
                    } catch {
                      bullets = [];
                    }
                    return bullets && bullets.length > 0 ? (
                      <ul className="timeline-bullets">
                        {bullets.map((bullet, i) => (
                          <li key={i}>{bullet}</li>
                        ))}
                      </ul>
                    ) : null;
                  })()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ScrollReveal>
  );
}
