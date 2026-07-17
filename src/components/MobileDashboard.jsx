import React from 'react';
import { FileText, Mail, Briefcase, Code } from 'lucide-react';
import StatCard from './StatCard';
import FAB from './FAB';
// Optional WeatherWidget placeholder
// import WeatherWidget from './WeatherWidget';

export default function MobileDashboard({ onNavClick }) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const triggerResume = () => {
    window.dispatchEvent(new CustomEvent('open-resume'));
  };

  return (
    <div className="mobile-dashboard glass-panel">
      {/* Greeting Card */}
      <div className="dashboard-profile-card glass-panel">
        <img src="/IMG_0322.jpg" alt="Sujith Thota" className="dashboard-avatar" />
        <div className="dashboard-welcome">
          <h3>{getGreeting()}, Sujith here 👋</h3>
          <h2>Sujith Thota</h2>
          <div className="dashboard-status">
            <span className="status-dot" />
            <span>Available for opportunities</span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="dashboard-stats-row">
        <StatCard value="8.7" label="VIT CGPA" />
        <StatCard value="15+" label="Certifications" />
        <StatCard value="5+" label="ML Projects" />
      </div>

      {/* Bio Card */}
      <div className="dashboard-bio-card glass-panel">
        <p>
          I am a VIT University Data Science graduate exploring the intersection of predictive machine learning systems and reactive web frameworks.
        </p>
      </div>

      {/* Action Cards Grid */}
      <div className="dashboard-links-grid">
        <button className="dashboard-link-card" onClick={() => onNavClick?.('skills')}>
          <div className="card-icon-box"><Code size={16} /></div>
          <h4>Core stack</h4>
          <p>Languages, ML and web frameworks.</p>
        </button>
        <button className="dashboard-link-card" onClick={() => onNavClick?.('projects')}>
          <div className="card-icon-box"><Briefcase size={16} /></div>
          <h4>Projects</h4>
          <p>Code showcase and demo apps.</p>
        </button>
        <button className="dashboard-link-card" onClick={triggerResume}>
          <div className="card-icon-box"><FileText size={16} /></div>
          <h4>Resume</h4>
          <p>Open PDF or download a copy.</p>
        </button>
        <button className="dashboard-link-card" onClick={() => onNavClick?.('contact')}>
          <div className="card-icon-box"><Mail size={16} /></div>
          <h4>Connect</h4>
          <p>Send a message and collaborate.</p>
        </button>
      </div>

      {/* Floating Action Button */}
      <FAB onNavClick={onNavClick} triggerResume={triggerResume} />

      {/* Optional Weather Widget - uncomment when API ready */}
      {/* <WeatherWidget /> */}
    </div>
  );
}
