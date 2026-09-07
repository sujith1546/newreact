import React from 'react';
import './HeroStats.css';

export default function HeroStats({
  name = 'Sujith Thota',
  role = 'Data science & dev',
  location = 'VIT University, Vellore',
  available = true,
  avatarUrl = '/IMG_0322.jpg',
  cgpa = '8.7',
  cgpaMax = 10,
  cgpaPercentile = 'Top 5%',
  certifications = '15+',
  apps = '5+',
  status = 'Open',
  onNavClick,
}) {
  const numericCgpa = parseFloat(cgpa) || 8.7;
  const cgpaPct = Math.round((numericCgpa / cgpaMax) * 100);

  return (
    <div className="hero-stats-card">
      {/* ── Top Section: Identity ── */}
      <div className="hero-stats-top">
        <div className="hero-stats-identity">
          <div className="hero-stats-avatar-wrap">
            {avatarUrl ? (
              <img
                className="hero-stats-avatar"
                src={avatarUrl}
                alt={name}
                id="hero-stats-avatar-img"
              />
            ) : (
              <div className="hero-stats-avatar hero-stats-avatar-placeholder" />
            )}
            {available && <span className="hero-stats-live-dot" />}
          </div>
          <div className="hero-stats-info">
            <p className="hero-stats-name">{name}</p>
            <p className="hero-stats-meta">
              <i className="ti ti-cpu" aria-hidden="true" />
              <span>{role}</span>
            </p>
            <p className="hero-stats-meta hero-stats-meta-muted">
              <i className="ti ti-map-pin" aria-hidden="true" />
              <span>{location}</span>
            </p>
          </div>
        </div>

        {available && (
          <span className="hero-stats-badge">
            <span className="hero-stats-badge-dot" />
            Open to hire
          </span>
        )}
      </div>

      {/* ── Full-Width Section Divider ── */}
      <div className="hero-stats-divider" />

      {/* ── Bottom Section: At a Glance ── */}
      <div className="hero-stats-bottom">
        <div className="glance-header">
          <span className="glance-title">
            <i className="ti ti-chart-bar" aria-hidden="true" /> At a glance
          </span>
          <span className="glance-count">4 metrics</span>
        </div>

        <div className="glance-row">
          <div
            className={`glance-item ${onNavClick ? 'hero-stats-clickable' : ''}`}
            onClick={() => onNavClick && onNavClick('education')}
            role={onNavClick ? 'button' : undefined}
            tabIndex={onNavClick ? 0 : undefined}
            aria-label="View Education details"
          >
            <p className="glance-value">{cgpa}</p>
            <p className="glance-label">CGPA</p>
          </div>

          <div
            className={`glance-item ${onNavClick ? 'hero-stats-clickable' : ''}`}
            onClick={() => onNavClick && onNavClick('certifications')}
            role={onNavClick ? 'button' : undefined}
            tabIndex={onNavClick ? 0 : undefined}
            aria-label="View Certifications"
          >
            <p className="glance-value">{certifications}</p>
            <p className="glance-label">Certs</p>
          </div>

          <div
            className={`glance-item ${onNavClick ? 'hero-stats-clickable' : ''}`}
            onClick={() => onNavClick && onNavClick('projects')}
            role={onNavClick ? 'button' : undefined}
            tabIndex={onNavClick ? 0 : undefined}
            aria-label="View Projects"
          >
            <p className="glance-value">{apps}</p>
            <p className="glance-label">Apps</p>
          </div>

          <div
            className={`glance-item glance-item--last ${onNavClick ? 'hero-stats-clickable' : ''}`}
            onClick={() => onNavClick && onNavClick('contact')}
            role={onNavClick ? 'button' : undefined}
            tabIndex={onNavClick ? 0 : undefined}
            aria-label="Contact / Status"
          >
            <p className="glance-value glance-value--status">
              <span className="status-dot" /> {status}
            </p>
            <p className="glance-label">Status</p>
          </div>
        </div>
      </div>
    </div>
  );
}
