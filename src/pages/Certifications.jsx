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

const COLORS = {
  accent: {
    headerBg: '#dbeafe',
    badgeBorder: '#1d4ed8',
    badgeIcon: '#1d4ed8',
    pillBorder: '#93c5fd',
    pillColor: '#1d4ed8',
    issuerColor: '#1d4ed8',
    verifyColor: '#1d4ed8',
  },
  danger: {
    headerBg: '#fee2e2',
    badgeBorder: '#dc2626',
    badgeIcon: '#dc2626',
    pillBorder: '#fca5a5',
    pillColor: '#dc2626',
    issuerColor: '#dc2626',
    verifyColor: '#1d4ed8',
  },
  success: {
    headerBg: '#dcfce7',
    badgeBorder: '#16a34a',
    badgeIcon: '#16a34a',
    pillBorder: '#86efac',
    pillColor: '#15803d',
    issuerColor: '#15803d',
    verifyColor: '#1d4ed8',
  },
  warning: {
    headerBg: '#fef9c3',
    badgeBorder: '#ca8a04',
    badgeIcon: '#ca8a04',
    pillBorder: '#fde047',
    pillColor: '#854d0e',
    issuerColor: '#854d0e',
    verifyColor: '#1d4ed8',
  },
};

function CertCard({ cert }) {
  const { id, issuer, title, description, skills, issuedDate, credentialId, verifyUrl, icon, color } = cert;
  const c = COLORS[color] || COLORS.accent;

  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.22s ease, box-shadow 0.22s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 14px 32px rgba(0,0,0,0.09)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ background: c.headerBg, padding: '20px 22px', position: 'relative' }}>
        <span style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          background: '#ffffff',
          border: `1px solid ${c.pillBorder}`,
          borderRadius: '999px',
          padding: '4px 11px',
          fontSize: '11px',
          fontWeight: '600',
          color: c.pillColor,
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          lineHeight: '1',
        }}>
          <i className="ti ti-shield-check" style={{ fontSize: '13px' }} aria-hidden="true" />
          Verified
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: '#ffffff',
            boxShadow: `0 0 0 2px ${c.badgeBorder}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: '0',
          }}>
            <i className={`ti ${icon}`} style={{ fontSize: '26px', color: c.badgeIcon }} aria-hidden="true" />
          </div>
          <div>
            <p style={{
              margin: '0 0 3px',
              fontSize: '10.5px',
              fontWeight: '700',
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              color: c.issuerColor,
              lineHeight: '1',
            }}>{issuer}</p>
            <p style={{
              margin: '0',
              fontSize: '17px',
              fontWeight: '700',
              color: 'var(--text-primary)',
              lineHeight: '1.3',
            }}>{title}</p>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 22px 18px', display: 'flex', flexDirection: 'column', flexGrow: '1' }}>
        <p style={{
          margin: '0 0 14px',
          fontSize: '13.5px',
          color: 'var(--text-secondary)',
          lineHeight: '1.6',
          flexGrow: '1',
        }}>{description}</p>

        {skills && skills.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', marginBottom: '18px' }}>
            {skills.map(skill => (
              <span key={skill} style={{
                fontSize: '11.5px',
                fontWeight: '500',
                color: 'var(--text-secondary)',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '999px',
                padding: '4px 13px',
                lineHeight: '1.4',
              }}>{skill}</span>
            ))}
          </div>
        )}

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '13px',
          marginTop: 'auto',
        }}>
          <div>
            {issuedDate && (
              <p style={{
                margin: '0',
                fontSize: '11px',
                color: 'var(--text-muted)',
                fontWeight: '500',
                lineHeight: '1.4',
              }}>Issued {issuedDate}</p>
            )}
            {credentialId && (
              <p style={{
                margin: '2px 0 0',
                fontSize: '10.5px',
                color: 'var(--text-muted)',
                fontWeight: '600',
                fontFamily: '"JetBrains Mono", "SF Mono", monospace',
                lineHeight: '1.4',
              }}>ID  {credentialId}</p>
            )}
          </div>

          {verifyUrl && (
            <a
              href={verifyUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '13.5px',
                fontWeight: '600',
                color: c.verifyColor,
                textDecoration: 'none',
                padding: '4px 8px',
                borderRadius: '6px',
                transition: 'background 0.18s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(29,78,216,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              Verify
              <i className="ti ti-external-link" style={{ fontSize: '14px' }} aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Certifications() {
  const { data: dbData, loading } = useRealtimeData('certifications', { orderColumn: 'display_order', ascending: true });

  const certifications = (dbData && dbData.length > 0)
    ? dbData.map((item, idx) => {
        let derivedSkills = item.skills || item.tags;
        if (!derivedSkills || derivedSkills.length === 0) {
          const t = (item.title || '').toLowerCase();
          if (t.includes('tensorflow') || t.includes('deep learning')) {
            derivedSkills = ['Deep learning', 'Computer vision', 'NLP'];
          } else if (t.includes('generative ai') || t.includes('oracle') || t.includes('llm')) {
            derivedSkills = ['Generative AI', 'LLMs', 'OCI'];
          } else if (t.includes('front-end') || t.includes('react') || t.includes('meta')) {
            derivedSkills = ['React 18', 'Full-Stack Web', 'UX Systems'];
          } else {
            derivedSkills = ['Data science', 'Python', 'Predictive analytics'];
          }
        }
        return {
          id: item.id || `cert-${idx}`,
          issuer: item.issuer || item.organization || 'Global Issuer',
          title: item.title || item.name || 'Professional Certificate',
          description: item.description || 'Verified technical credential.',
          skills: derivedSkills,
          issuedDate: item.issuedDate || item.date || '2025',
          credentialId: item.credentialId || item.credential_id || `ID-${idx + 100}`,
          verifyUrl: item.verifyUrl || item.credentialUrl || item.url || '#',
          icon: item.icon || (item.issuer?.toLowerCase().includes('oracle') ? 'ti-cloud' : 'ti-brand-google'),
          color: item.color || (idx % 2 === 0 ? 'accent' : 'danger'),
        };
      })
    : DEFAULT_CERTIFICATIONS;

  return (
    <ScrollReveal className="wide-content">
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
          <Loader2 className="spin" size={32} color="var(--primary-blue)" />
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '20px',
          maxWidth: '920px',
          margin: '0',
        }}>
          {certifications.map(cert => (
            <CertCard key={cert.id || cert.credentialId} cert={cert} />
          ))}
        </div>
      )}
    </ScrollReveal>
  );
}
