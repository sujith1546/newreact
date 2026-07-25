import React, { useState } from 'react';
import useRealtimeData from '../../../hooks/useRealtimeData';
import { Loader2, ExternalLink, Star, Code, Layers, ChevronRight } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';

export default function MobileProjectsView() {
  const { data: projectsData, loading } = useRealtimeData('projects', { orderColumn: 'created_at', ascending: true, disableRealtime: true });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <Loader2 className="spin" size={28} color="var(--primary-blue)" />
      </div>
    );
  }

  const projects = projectsData || [];

  return (
    <div className="mobile-projects-view" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ marginBottom: 4 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 2px' }}>
          Featured Projects
        </h2>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
          Applications, full-stack solutions, and ML models
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {projects.map((proj) => (
          <div
            key={proj.id}
            style={{
              background: 'var(--bg-secondary, #ffffff)',
              border: '1px solid var(--border-color, rgba(0,0,0,0.08))',
              borderRadius: 16,
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px', lineHeight: 1.25 }}>
                  {proj.title}
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                  {proj.description}
                </p>
              </div>
              {proj.featured && (
                <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 99, background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Star size={10} fill="#f59e0b" /> Featured
                </span>
              )}
            </div>

            {proj.tech_stack && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {(typeof proj.tech_stack === 'string' ? proj.tech_stack.split(',') : proj.tech_stack).map((t) => (
                  <span
                    key={t}
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: 6,
                      background: 'rgba(59, 130, 246, 0.08)',
                      color: 'var(--primary-blue)',
                    }}
                  >
                    {t.trim()}
                  </span>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 4, borderTop: '1px solid var(--border-color, rgba(0,0,0,0.06))' }}>
              {proj.github_url && (
                <a
                  href={proj.github_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    textDecoration: 'none',
                    padding: '6px 12px',
                    borderRadius: 8,
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <FaGithub size={12} /> Code
                </a>
              )}
              {proj.live_url && (
                <a
                  href={proj.live_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#ffffff',
                    textDecoration: 'none',
                    padding: '6px 12px',
                    borderRadius: 8,
                    background: 'var(--primary-blue)',
                  }}
                >
                  <ExternalLink size={12} /> Live Demo
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
