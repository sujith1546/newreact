import React from 'react';
import useRealtimeData from '../../../hooks/useRealtimeData';
import { Loader2, Award, ExternalLink, ShieldCheck } from 'lucide-react';

export default function MobileCertificationsView() {
  const { data: certsData, loading } = useRealtimeData('certifications', { orderColumn: 'created_at', ascending: true });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <Loader2 className="spin" size={28} color="var(--primary-blue)" />
      </div>
    );
  }

  const items = certsData || [];

  return (
    <div className="mobile-certifications-view" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ marginBottom: 4 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 2px' }}>
          Certifications & Credentials
        </h2>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
          Verified industry achievements and technical badges
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map((cert) => (
          <div
            key={cert.id}
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
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Award size={20} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 2px', lineHeight: 1.25 }}>
                  {cert.title || cert.name}
                </h3>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', margin: 0 }}>
                  {cert.issuer || cert.organization}
                </p>
              </div>
              {cert.issue_date && (
                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', background: 'var(--bg-primary)', padding: '2px 8px', borderRadius: 6, border: '1px solid var(--border-color)' }}>
                  {cert.issue_date}
                </span>
              )}
            </div>

            {cert.credential_url && (
              <a
                href={cert.credential_url}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--primary-blue)',
                  textDecoration: 'none',
                  marginTop: 2,
                }}
              >
                <ShieldCheck size={14} /> Verify Credential <ExternalLink size={11} />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
