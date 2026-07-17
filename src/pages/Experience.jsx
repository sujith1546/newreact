import ScrollReveal from '../components/ScrollReveal';
import { Briefcase } from 'lucide-react';

export default function Experience() {
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
      `}</style>
      
      <div className="exp-page">
        <div className="exp-header">
          <h1>Experience</h1>
          <p>My professional journey so far</p>
        </div>

        <div className="empty-state-card">
          <div className="empty-icon-wrap">
            <Briefcase size={24} />
          </div>
          <h2 className="empty-title">Seeking Opportunities</h2>
          <p className="empty-desc">
            I am currently a fresher, eagerly building my technical foundation through personal projects and continuous learning. I am actively looking for opportunities to apply my skills in a real-world environment.
          </p>
        </div>
      </div>
    </ScrollReveal>
  );
}
