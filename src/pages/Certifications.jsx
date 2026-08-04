import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollReveal } from '../components';
import { Loader2 } from 'lucide-react';
import useRealtimeData from '../hooks/useRealtimeData';

const DEFAULT_CERTIFICATIONS = [
  {
    id: "gc-8834x",
    issuer: "Google",
    title: "TensorFlow certificate",
    description: "Proficiency in building and training deep learning models, covering computer vision, NLP, and time series forecasting.",
    skills: ["Deep learning", "Computer vision", "NLP"],
    issuedDate: "Mar 2025",
    credentialId: "GC-8834X",
    verifyUrl: "https://www.credential.net/",
    icon: "ti-brand-google",
    color: "accent",
  },
  {
    id: "or-2291k",
    issuer: "Oracle",
    title: "Generative AI certificate",
    description: "Expertise in generative AI architectures, LLMs, and enterprise-grade AI solutions on Oracle Cloud Infrastructure.",
    skills: ["Generative AI", "LLMs", "OCI"],
    issuedDate: "Jun 2025",
    credentialId: "OR-2291K",
    verifyUrl: "https://mylearn.oracle.com/",
    icon: "ti-cloud",
    color: "danger",
  },
  {
    id: "meta-9921b",
    issuer: "Meta",
    title: "Front-End Developer certificate",
    description: "Advanced web engineering, React 18 component design systems, state management, and modern performance optimization.",
    skills: ["React 18", "Full-Stack Web", "UX Systems"],
    issuedDate: "Jan 2025",
    credentialId: "META-9921B",
    verifyUrl: "https://coursera.org/verify/",
    icon: "ti-brand-meta",
    color: "accent",
  },
  {
    id: "ibm-5541z",
    issuer: "IBM",
    title: "Data Science Professional certificate",
    description: "Applied machine learning pipelines, predictive analytics, data visualization, SQL databases, and statistical modeling.",
    skills: ["Data science", "Python", "Predictive analytics"],
    issuedDate: "Nov 2024",
    credentialId: "IBM-5541Z",
    verifyUrl: "https://coursera.org/verify/",
    icon: "ti-cpu",
    color: "success",
  }
];

export default function Certifications() {
  const { data: dbData, loading } = useRealtimeData('certifications', { orderColumn: 'display_order', ascending: true });

  const certifications = (dbData && dbData.length > 0)
    ? dbData.map((item, idx) => ({
        id: item.id || `cert-${idx}`,
        issuer: item.issuer || item.organization || "Global Issuer",
        title: item.title || item.name || "Professional Certificate",
        description: item.description || "Verified technical credential.",
        skills: item.skills || (item.tags ? item.tags : ["Engineering", "Technology"]),
        issuedDate: item.issuedDate || item.date || "2025",
        credentialId: item.credentialId || item.credential_id || `ID-${idx + 100}`,
        verifyUrl: item.verifyUrl || item.credentialUrl || item.url || "#",
        icon: item.icon || (item.issuer?.toLowerCase().includes("oracle") ? "ti-cloud" : "ti-brand-google"),
        color: item.color || (idx % 2 === 0 ? "accent" : "danger")
      }))
    : DEFAULT_CERTIFICATIONS;

  return (
    <ScrollReveal className="wide-content">
      <style>{`
        .certs-header { margin-bottom: 28px; }
        .certs-header h1 { font-size: 26px; font-weight: 700; color: var(--text-primary); margin: 0 0 6px 0; }
        .certs-header p { font-size: 14px; color: var(--text-secondary); max-width: 620px; line-height: 1.5; margin: 0; }

        /* ── DESKTOP CERTIFICATIONS GRID ── */
        .cert-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .cert-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          overflow: hidden;
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
          display: flex;
          flex-direction: column;
        }

        .cert-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 28px rgba(0,0,0,0.08);
        }

        .cert-card-header {
          padding: 22px 24px;
          position: relative;
        }

        .cert-card-header--accent {
          background: #d3e3fd;
        }

        .cert-card-header--danger {
          background: #fce8e6;
        }

        .cert-card-header--success {
          background: #e6f4ea;
        }

        .cert-card-header--warning {
          background: #fef7e0;
        }

        [data-theme="dark"] .cert-card-header--accent { background: #1a335a; }
        [data-theme="dark"] .cert-card-header--danger { background: #4a1c1d; }
        [data-theme="dark"] .cert-card-header--success { background: #133e22; }
        [data-theme="dark"] .cert-card-header--warning { background: #4a3800; }

        .cert-verified-pill {
          position: absolute;
          top: 18px;
          right: 18px;
          font-size: 11px;
          font-weight: 600;
          background: #ffffff;
          border-radius: 999px;
          padding: 3.5px 11px;
          display: flex;
          align-items: center;
          gap: 5px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.06);
        }

        .cert-verified-pill i {
          font-size: 13px;
        }

        .cert-verified-pill--accent {
          color: #0b57d0;
          border: 1px solid #a8c7fa;
        }

        .cert-verified-pill--danger {
          color: #b31412;
          border: 1px solid #f8b4b4;
        }

        .cert-verified-pill--success {
          color: #137333;
          border: 1px solid #a8dab5;
        }

        .cert-verified-pill--warning {
          color: #b06000;
          border: 1px solid #fde293;
        }

        .cert-header-content {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .cert-badge {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #ffffff;
          border: 3px solid #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .cert-badge i {
          font-size: 26px;
        }

        .cert-badge--accent {
          box-shadow: 0 0 0 2px #0b57d0;
        }
        .cert-badge--accent i { color: #0b57d0; }

        .cert-badge--danger {
          box-shadow: 0 0 0 2px #b31412;
        }
        .cert-badge--danger i { color: #b31412; }

        .cert-badge--success {
          box-shadow: 0 0 0 2px #137333;
        }
        .cert-badge--success i { color: #137333; }

        .cert-badge--warning {
          box-shadow: 0 0 0 2px #b06000;
        }
        .cert-badge--warning i { color: #b06000; }

        .cert-issuer {
          font-size: 11px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          font-weight: 700;
          margin: 0 0 3px;
        }

        .cert-issuer--accent { color: #0b57d0; }
        .cert-issuer--danger { color: #b31412; }
        .cert-issuer--success { color: #137333; }
        .cert-issuer--warning { color: #b06000; }

        [data-theme="dark"] .cert-issuer--accent { color: #a8c7fa; }
        [data-theme="dark"] .cert-issuer--danger { color: #f8b4b4; }
        [data-theme="dark"] .cert-issuer--success { color: #a8dab5; }
        [data-theme="dark"] .cert-issuer--warning { color: #fde293; }

        .cert-title {
          font-size: 17px;
          font-weight: 700;
          margin: 0;
          color: #1f1f1f;
          line-height: 1.3;
        }
        [data-theme="dark"] .cert-title { color: #f1efe8; }

        .cert-card-body {
          padding: 22px 24px 20px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        .cert-description {
          font-size: 13.5px;
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0 0 16px;
          flex-grow: 1;
        }

        .cert-skills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 20px;
        }

        .cert-skill-chip {
          font-size: 11.5px;
          font-weight: 500;
          color: var(--text-secondary);
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 999px;
          padding: 4px 12px;
        }

        .cert-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid var(--border-color);
          padding-top: 14px;
        }

        .cert-meta {
          font-size: 11px;
          color: var(--text-muted);
          margin: 0;
          font-weight: 500;
        }

        .cert-meta--mono {
          font-family: "SF Mono", "JetBrains Mono", "Roboto Mono", monospace;
          margin-top: 2px;
          font-size: 10.5px;
          font-weight: 600;
        }

        .cert-verify-link {
          font-size: 13.5px;
          font-weight: 600;
          color: #0b57d0;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          text-decoration: none;
          padding: 4px 8px;
          border-radius: 6px;
          transition: background 0.2s, color 0.2s;
        }
        [data-theme="dark"] .cert-verify-link { color: #85b7eb; }

        .cert-verify-link:hover {
          background: color-mix(in srgb, var(--primary-blue) 10%, transparent);
        }

        .cert-verify-link i {
          font-size: 14px;
        }

        @media (max-width: 720px) {
          .cert-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>



      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
          <Loader2 className="spin" size={32} color="var(--primary-blue)" />
        </div>
      ) : (
        <div className="cert-grid">
          {certifications.map((cert) => {
            const { id, issuer, title, description, skills, issuedDate, credentialId, verifyUrl, icon, color } = cert;
            return (
              <div key={id || credentialId} className="cert-card">
                <div className={`cert-card-header cert-card-header--${color}`}>
                  <span className={`cert-verified-pill cert-verified-pill--${color}`}>
                    <i className="ti ti-shield-check" aria-hidden="true" />
                    Verified
                  </span>
                  <div className="cert-header-content">
                    <div className={`cert-badge cert-badge--${color}`}>
                      <i className={`ti ${icon}`} aria-hidden="true" />
                    </div>
                    <div>
                      <p className={`cert-issuer cert-issuer--${color}`}>{issuer}</p>
                      <p className="cert-title">{title}</p>
                    </div>
                  </div>
                </div>

                <div className="cert-card-body">
                  <p className="cert-description">{description}</p>

                  {skills && skills.length > 0 && (
                    <div className="cert-skills">
                      {skills.map((skill) => (
                        <span key={skill} className="cert-skill-chip">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="cert-footer">
                    {(issuedDate || credentialId) && (
                      <div>
                        {issuedDate && <p className="cert-meta">Issued {issuedDate}</p>}
                        {credentialId && <p className="cert-meta cert-meta--mono">ID {credentialId}</p>}
                      </div>
                    )}
                    {verifyUrl && (
                      <a href={verifyUrl} className="cert-verify-link" target="_blank" rel="noreferrer">
                        Verify
                        <i className="ti ti-external-link" aria-hidden="true" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ScrollReveal>
  );
}
