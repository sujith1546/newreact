import { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, ExternalLink, ShieldCheck, Loader2 } from 'lucide-react';
import useRealtimeData from '../hooks/useRealtimeData';

export default function Certifications() {
  const { data: certificationsData, loading } = useRealtimeData('certifications', { orderColumn: 'display_order', ascending: true });

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <style>{`
        /* ── Height propagation chain for desktop fit ── */
        #certifications,
        #certifications > .text-content.wide-content,
        #certifications > .text-content.wide-content > .reveal {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 0;
        }

        .certs-root {
          width: 100%;
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
          box-sizing: border-box;
        }

        .certs-header {
          margin-bottom: 24px;
          flex-shrink: 0;
        }
        .certs-header h1 {
          font-size: 28px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 8px 0;
        }
        .certs-header p {
          font-size: 14px;
          color: var(--text-secondary);
          max-width: 650px;
          line-height: 1.5;
          margin: 0;
        }

        .certs-grid {
          flex: 1;
          min-height: 0;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          align-content: start;
          overflow-y: auto;
          padding-bottom: 16px;
        }

        .cert-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          position: relative;
          transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
          min-height: 140px;
        }

        .cert-card::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: radial-gradient(400px circle at var(--mouse-x, -500px) var(--mouse-y, -500px), color-mix(in srgb, var(--primary-blue) 12%, transparent), transparent 40%);
          opacity: 0;
          transition: opacity 0.3s;
          pointer-events: none;
          z-index: 0;
        }

        .cert-card:hover {
          transform: none !important;
          border-color: color-mix(in srgb, var(--primary-blue) 45%, transparent);
          box-shadow: 0 8px 24px color-mix(in srgb, var(--primary-blue) 14%, transparent);
        }
        .cert-card:hover::before {
          opacity: 1;
        }

        .cert-hologram-area {
          width: 110px;
          min-width: 110px;
          background: linear-gradient(135deg, #e0e7ff 0%, #fef08a 100%);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          border-right: 1px solid var(--border-color);
          flex-shrink: 0;
        }
        [data-theme="dark"] .cert-hologram-area {
          background: linear-gradient(135deg, #1e1b4b 0%, #713f12 100%);
        }

        .mesh-gradient {
          position: absolute;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.2), transparent 60%), radial-gradient(circle at 80% 20%, rgba(234, 179, 8, 0.2), transparent 50%);
          animation: meshFlow 8s ease infinite alternate;
        }
        @keyframes meshFlow {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(-20%, -20%) scale(1.1); }
        }

        .cert-icon-cluster {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(0, 0, 0, 0.45);
          z-index: 1;
        }
        [data-theme="dark"] .cert-icon-cluster {
          color: rgba(255, 255, 255, 0.7);
        }

        .cert-badge-icon {
          position: absolute;
          bottom: -3px;
          right: -6px;
          color: #10b981;
          background: #ffffff;
          border-radius: 50%;
          padding: 1px;
        }
        [data-theme="dark"] .cert-badge-icon {
          background: #1e1b4b;
        }

        .cert-content {
          padding: 16px 18px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
          z-index: 1;
          min-width: 0;
        }

        .cert-header {
          display: flex;
          flex-direction: column;
          margin-bottom: 8px;
        }

        .cert-title {
          font-size: 14.5px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 3px 0;
          line-height: 1.35;
        }

        .cert-issuer {
          font-size: 10.5px;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .cert-desc {
          font-size: 12.5px;
          color: var(--text-secondary);
          line-height: 1.5;
          margin: 0 0 10px 0;
          flex-grow: 1;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .cert-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid var(--border-color);
          padding-top: 10px;
          margin-top: auto;
        }

        .cert-link {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          font-weight: 600;
          color: var(--primary-blue);
          text-decoration: none;
          transition: color 0.2s;
        }
        .cert-link:hover {
          color: var(--accent-blue);
        }

        @media (max-width: 900px) {
          #certifications,
          #certifications > .text-content.wide-content,
          #certifications > .text-content.wide-content > .reveal {
            display: block;
            flex: none;
            min-height: unset;
          }
          .certs-root { flex: none; height: auto; padding-bottom: 32px; }
          .certs-grid { flex: none; grid-template-columns: 1fr; gap: 16px; overflow: visible; }
          .cert-hologram-area { width: 110px; min-width: 110px; }
          .cert-content { padding: 16px; }
        }
      `}</style>

      <div className="certs-root">


        {loading ? (
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 0' }}>
            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary-blue)' }} />
          </div>
        ) : certificationsData?.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            No certifications found.
          </div>
        ) : (
          <div className="certs-grid">
            {certificationsData.map((cert) => (
              <motion.div
                key={cert.id}
                className="cert-card"
                onMouseMove={handleMouseMove}
              >
                <div className="cert-hologram-area">
                  <div className="mesh-gradient" />
                  <div className="cert-icon-cluster">
                    <Award size={36} className="cert-main-icon" />
                    <ShieldCheck size={16} className="cert-badge-icon" />
                  </div>
                </div>

                <div className="cert-content">
                  <div className="cert-header">
                    <h3 className="cert-title">{cert.title}</h3>
                    <span className="cert-issuer">{cert.issuer}</span>
                  </div>
                  {cert.description && <p className="cert-desc">{cert.description}</p>}

                  <div className="cert-footer">
                    <a
                      href={cert.credential_url || cert.credentialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="cert-link"
                    >
                      Verify Credential <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
