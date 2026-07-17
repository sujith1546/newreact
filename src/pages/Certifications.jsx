import { useRef } from 'react';
import ScrollReveal from '../components/ScrollReveal';
import { Award, ExternalLink, ShieldCheck } from 'lucide-react';
import { certificationsData } from '../data/certificationsData';

function CertificationCard({ cert }) {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <div 
      className="cert-card" 
      ref={cardRef} 
      onMouseMove={handleMouseMove}
    >
      <div className="cert-hologram-area">
        <div className="mesh-gradient"></div>
        <div className="cert-icon-cluster">
          <Award size={42} className="cert-main-icon" />
          <ShieldCheck size={20} className="cert-badge-icon" />
        </div>
      </div>

      <div className="cert-content">
        <div className="cert-header">
          <h3 className="cert-title">{cert.title}</h3>
          <span className="cert-issuer">{cert.issuer}</span>
        </div>
        <p className="cert-desc">{cert.description}</p>
        
        <div className="cert-footer">
          <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="cert-link">
            Verify Credential <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function Certifications() {
  return (
    <ScrollReveal className="wide-content">
      <style>{`
        .certs-header {
          margin-bottom: 32px;
        }
        .certs-header h1 {
          font-size: 28px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 8px 0;
        }
        .certs-header p {
          font-size: 14.5px;
          color: var(--text-secondary);
          max-width: 600px;
          line-height: 1.5;
          margin: 0;
        }

        .certs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }

        .cert-card {
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(0,0,0,0.06);
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          position: relative;
          transition: transform 0.3s ease, border-color 0.3s ease;
          box-shadow: 0 4px 15px rgba(0,0,0,0.02);
        }
        
        /* Advanced Spotlight Hover Effect */
        .cert-card::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          border-radius: inherit;
          background: radial-gradient(
            400px circle at var(--mouse-x, -500px) var(--mouse-y, -500px),
            rgba(255, 255, 255, 0.8),
            transparent 40%
          );
          opacity: 0;
          transition: opacity 0.3s;
          pointer-events: none;
          z-index: 0;
        }
        
        [data-theme="dark"] .cert-card {
          background: rgba(30, 30, 30, 0.4);
          border-color: rgba(255,255,255,0.08);
        }
        [data-theme="dark"] .cert-card::before {
          background: radial-gradient(
            400px circle at var(--mouse-x, -500px) var(--mouse-y, -500px),
            rgba(255, 255, 255, 0.08),
            transparent 40%
          );
        }

        .cert-card:hover {
          transform: translateY(-2px);
          border-color: rgba(0,0,0,0.15);
          box-shadow: 0 12px 30px -10px rgba(0,0,0,0.08);
        }
        [data-theme="dark"] .cert-card:hover {
          border-color: rgba(255,255,255,0.2);
          box-shadow: 0 12px 30px -10px rgba(0,0,0,0.3);
        }
        .cert-card:hover::before {
          opacity: 1;
        }

        .cert-hologram-area {
          min-width: 130px;
          background: linear-gradient(135deg, #e0e7ff 0%, #fef08a 100%);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          border-right: 1px solid rgba(0,0,0,0.03);
          z-index: 1;
        }
        [data-theme="dark"] .cert-hologram-area {
          background: linear-gradient(135deg, #1e1b4b 0%, #713f12 100%);
          border-right-color: rgba(255,255,255,0.05);
        }
        
        .mesh-gradient {
          position: absolute;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.15), transparent 60%),
                      radial-gradient(circle at 80% 20%, rgba(234, 179, 8, 0.15), transparent 50%);
          animation: meshFlow 8s ease infinite alternate;
        }
        @keyframes meshFlow {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(-20%, -20%) scale(1.1); }
        }

        .cert-icon-cluster {
          position: relative;
          color: rgba(0,0,0,0.4);
          filter: drop-shadow(0 4px 6px rgba(0,0,0,0.05));
        }
        [data-theme="dark"] .cert-icon-cluster {
          color: rgba(255,255,255,0.7);
          filter: drop-shadow(0 4px 6px rgba(0,0,0,0.5));
        }
        
        .cert-badge-icon {
          position: absolute;
          bottom: -4px;
          right: -8px;
          color: #10b981;
          background: white;
          border-radius: 50%;
          padding: 1px;
        }
        [data-theme="dark"] .cert-badge-icon {
          background: #1e1b4b;
        }

        .cert-content {
          padding: 20px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
          z-index: 1;
        }

        .cert-header {
          display: flex;
          flex-direction: column;
          margin-bottom: 8px;
        }

        .cert-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 4px 0;
          letter-spacing: -0.01em;
          line-height: 1.3;
        }
        
        .cert-issuer {
          font-size: 11.5px;
          font-weight: 700;
          color: var(--primary-blue);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .cert-desc {
          font-size: 13.5px;
          color: var(--text-secondary);
          line-height: 1.5;
          margin: 0 0 16px 0;
          flex-grow: 1;
        }

        .cert-footer {
          border-top: 1px solid rgba(0,0,0,0.06);
          padding-top: 14px;
          margin-top: auto;
        }
        [data-theme="dark"] .cert-footer {
          border-top-color: rgba(255,255,255,0.08);
        }

        .cert-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--text-secondary);
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .cert-link:hover {
          color: #10b981;
        }
        
        @media (max-width: 600px) {
          .cert-card {
            flex-direction: column;
          }
          .cert-hologram-area {
            height: 100px;
            border-right: none;
            border-bottom: 1px solid rgba(0,0,0,0.03);
          }
          [data-theme="dark"] .cert-hologram-area {
            border-bottom-color: rgba(255,255,255,0.05);
          }
        }
      `}</style>

      <div className="certs-header">
        <h1>Global Certifications</h1>
        <p>
          Verified credentials that demonstrate my expertise and commitment to mastering cutting-edge technologies in data science and artificial intelligence.
        </p>
      </div>

      <div className="certs-grid">
        {certificationsData.map((cert) => (
          <CertificationCard key={cert.id} cert={cert} />
        ))}
      </div>
    </ScrollReveal>
  );
}
