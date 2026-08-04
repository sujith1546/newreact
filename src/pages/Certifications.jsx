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
          border-radius: 14px;
          overflow: hidden;
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
          display: flex;
          flex-direction: column;
        }

        .cert-card:hover {
          transform: translateY(-3px);
          border-color: color-mix(in srgb, var(--primary-blue) 35%, transparent);
          box-shadow: 0 12px 28px rgba(0,0,0,0.08);
        }

        .cert-card-header {
          padding: 20px 22px;
          position: relative;
        }

        .cert-card-header--accent {
          background: color-mix(in srgb, var(--primary-blue) 12%, transparent);
        }

        .cert-card-header--danger {
          background: color-mix(in srgb, #d93025 12%, transparent);
        }

        .cert-card-header--success {
          background: color-mix(in srgb, #137333 12%, transparent);
        }

        .cert-card-header--warning {
          background: color-mix(in srgb, #f59e0b 12%, transparent);
        }

        .cert-verified-pill {
          position: absolute;
          top: 16px;
          right: 16px;
          font-size: 10.5px;
          font-weight: 700;
          background: var(--bg-secondary);
          border-radius: 999px;
          padding: 3px 10px;
          display: flex;
          align-items: center;
          gap: 5px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.04);
        }

        .cert-verified-pill i {
          font-size: 13px;
          color: #10b981;
        }

        .cert-verified-pill--accent {
          color: var(--primary-blue);
          border: 1px solid color-mix(in srgb, var(--primary-blue) 30%, transparent);
        }

        .cert-verified-pill--danger {
          color: #d93025;
          border: 1px solid color-mix(in srgb, #d93025 30%, transparent);
        }

        .cert-verified-pill--success {
          color: #137333;
          border: 1px solid color-mix(in srgb, #137333 30%, transparent);
        }

        .cert-verified-pill--warning {
          color: #f59e0b;
          border: 1px solid color-mix(in srgb, #f59e0b 30%, transparent);
        }

        .cert-header-content {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .cert-badge {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          background: var(--bg-secondary);
          border: 3px solid var(--bg-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .cert-badge i {
          font-size: 26px;
        }

        .cert-badge--accent {
          box-shadow: 0 0 0 2px var(--primary-blue);
        }

        .cert-badge--accent i {
          color: var(--primary-blue);
        }

        .cert-badge--danger {
          box-shadow: 0 0 0 2px #d93025;
        }

        .cert-badge--danger i {
          color: #d93025;
        }

        .cert-badge--success {
          box-shadow: 0 0 0 2px #137333;
        }

        .cert-badge--success i {
          color: #137333;
        }

        .cert-badge--warning {
          box-shadow: 0 0 0 2px #f59e0b;
        }

        .cert-badge--warning i {
          color: #f59e0b;
        }

        .cert-issuer {
          font-size: 11px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          font-weight: 700;
          margin: 0 0 3px;
        }

        .cert-issuer--accent { color: var(--primary-blue); }
        .cert-issuer--danger { color: #d93025; }
        .cert-issuer--success { color: #137333; }
        .cert-issuer--warning { color: #f59e0b; }

        .cert-title {
          font-size: 16.5px;
          font-weight: 700;
          margin: 0;
          color: var(--text-primary);
          line-height: 1.3;
        }

        .cert-card-body {
          padding: 18px 20px 20px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        .cert-description {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0 0 14px;
          flex-grow: 1;
        }

        .cert-skills {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 16px;
        }

        .cert-skill-chip {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-secondary);
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 999px;
          padding: 3px 10px;
        }

        .cert-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid var(--border-color);
          padding-top: 14px;
        }

        .cert-meta {
          font-size: 10.5px;
          color: var(--text-muted);
          margin: 0;
          font-weight: 500;
        }

        .cert-meta--mono {
          font-family: "SF Mono", "JetBrains Mono", "Roboto Mono", monospace;
          margin-top: 2px;
          font-size: 10px;
          font-weight: 600;
        }

        .cert-verify-link {
          font-size: 12.5px;
          font-weight: 700;
          color: var(--primary-blue);
          display: inline-flex;
          align-items: center;
          gap: 5px;
          text-decoration: none;
          padding: 4px 8px;
          border-radius: 6px;
          transition: background 0.2s, color 0.2s;
        }

        .cert-verify-link:hover {
          background: color-mix(in srgb, var(--primary-blue) 10%, transparent);
        }

        .cert-verify-link i {
          font-size: 13px;
        }

        @media (max-width: 720px) {
          .cert-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="certs-header">
        <h1>Global Certifications</h1>
        <p>
          Verified digital credentials and specialized technical certifications in Applied AI, Machine Learning, and Cloud Infrastructure.
        </p>
      </div>

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
