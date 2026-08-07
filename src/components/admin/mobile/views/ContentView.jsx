import React from 'react';
import ProjectsPanel from '../../panels/ProjectsPanel';
import UpdatesPanel from '../../panels/UpdatesPanel';
import SkillsPanel from '../../panels/SkillsPanel';
import ExperiencePanel from '../../panels/ExperiencePanel';
import EducationPanel from '../../panels/EducationPanel';
import CertificationsPanel from '../../panels/CertificationsPanel';
import TestimonialsPanel from '../../panels/TestimonialsPanel';
import PortfolioPreviewPanel from '../../panels/PortfolioPreviewPanel';

const CONTENT_TABS = [
  { key: 'projects', label: 'Projects', icon: 'ti-briefcase' },
  { key: 'testimonials', label: 'Testimonials', icon: 'ti-quote' },
  { key: 'updates', label: 'Updates', icon: 'ti-bolt' },
  { key: 'skills', label: 'Skills', icon: 'ti-star' },
  { key: 'experience', label: 'Experience', icon: 'ti-id-badge' },
  { key: 'education', label: 'Education', icon: 'ti-book' },
  { key: 'certifications', label: 'Certifications', icon: 'ti-certificate' },
  { key: 'preview', label: 'Preview', icon: 'ti-eye' },
];

export default function ContentView({ activeSubTab = 'projects', onSelectSubTab }) {
  return (
    <div className="admin-mobile-view" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
      {/* Horizontal Carousel Sub-tab Bar */}
      <div style={{
        display: 'flex',
        gap: 6,
        padding: '10px 14px',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        borderBottom: '1px solid var(--pcms-line-soft)',
        background: 'var(--pcms-bg-2)',
        flexShrink: 0,
      }}>
        {CONTENT_TABS.map((tab) => {
          const isActive = activeSubTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onSelectSubTab(tab.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: '7px 13px',
                borderRadius: 20,
                border: isActive ? '1px solid var(--pcms-accent)' : '1px solid var(--pcms-line)',
                background: isActive ? 'var(--pcms-accent-dim)' : 'var(--pcms-panel)',
                color: isActive ? 'var(--pcms-accent)' : 'var(--pcms-muted)',
                fontSize: 12,
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                flexShrink: 0,
              }}
            >
              <i className={`ti ${tab.icon}`} style={{ fontSize: 13, opacity: isActive ? 1 : 0.7 }} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* View Content */}
      <div className="admin-subtab-content" style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        padding: '14px 14px 110px',
      }}>
        {activeSubTab === 'projects' && <ProjectsPanel />}
        {activeSubTab === 'testimonials' && <TestimonialsPanel />}
        {activeSubTab === 'updates' && <UpdatesPanel />}
        {activeSubTab === 'skills' && <SkillsPanel />}
        {activeSubTab === 'experience' && <ExperiencePanel />}
        {activeSubTab === 'education' && <EducationPanel />}
        {activeSubTab === 'certifications' && <CertificationsPanel />}
        {activeSubTab === 'preview' && <PortfolioPreviewPanel />}
      </div>
    </div>
  );
}
