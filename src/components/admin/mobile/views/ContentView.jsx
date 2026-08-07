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
    <div className="admin-mobile-view">
      {/* Sub-tab pills switcher */}
      <div className="admin-subtab-bar">
        {CONTENT_TABS.map((tab) => {
          const isActive = activeSubTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onSelectSubTab(tab.key)}
              className={`admin-subtab-pill ${isActive ? 'active' : ''}`}
            >
              <i className={`ti ${tab.icon}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* View Content */}
      <div className="admin-subtab-content">
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
