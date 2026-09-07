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
        <div className="hero-stats-section-label">
          <p className="hero-stats-label">
            <i className="ti ti-chart-bar" aria-hidden="true" />
            At a glance
          </p>
          <p className="hero-stats-label-muted">4 metrics</p>
        </div>

        {/* ── Single-Row 4-Column Glance Dock ── */}
        <div className="hero-glance-dock">
          {/* 1. CGPA */}
          <div
            className={`hero-glance-tile ${onNavClick ? 'hero-stats-clickable' : ''}`}
            onClick={() => onNavClick && onNavClick('education')}
            role={onNavClick ? 'button' : undefined}
            tabIndex={onNavClick ? 0 : undefined}
            aria-label="View Education details"
          >
            <div className="hero-glance-val-row">
              <i className="ti ti-school hero-icon-cgpa" aria-hidden="true" />
              <span className="hero-glance-val">{cgpa}</span>
            </div>
            <span className="hero-glance-label">CGPA</span>
          </div>

          {/* 2. Certifications */}
          <div
            className={`hero-glance-tile ${onNavClick ? 'hero-stats-clickable' : ''}`}
            onClick={() => onNavClick && onNavClick('certifications')}
            role={onNavClick ? 'button' : undefined}
            tabIndex={onNavClick ? 0 : undefined}
            aria-label="View Certifications"
          >
            <div className="hero-glance-val-row">
              <i className="ti ti-medal hero-icon-certs" aria-hidden="true" />
              <span className="hero-glance-val">{certifications}</span>
            </div>
            <span className="hero-glance-label">Certs</span>
          </div>

          {/* 3. Apps */}
          <div
            className={`hero-glance-tile ${onNavClick ? 'hero-stats-clickable' : ''}`}
            onClick={() => onNavClick && onNavClick('projects')}
            role={onNavClick ? 'button' : undefined}
            tabIndex={onNavClick ? 0 : undefined}
            aria-label="View Projects"
          >
            <div className="hero-glance-val-row">
              <i className="ti ti-rocket hero-icon-apps" aria-hidden="true" />
              <span className="hero-glance-val">{apps}</span>
            </div>
            <span className="hero-glance-label">Apps</span>
          </div>

          {/* 4. Status */}
          <div
            className={`hero-glance-tile ${onNavClick ? 'hero-stats-clickable' : ''}`}
            onClick={() => onNavClick && onNavClick('contact')}
            role={onNavClick ? 'button' : undefined}
            tabIndex={onNavClick ? 0 : undefined}
            aria-label="Contact / Status"
          >
            <div className="hero-glance-val-row">
              <span className="hero-glance-status-dot" />
              <span className="hero-glance-val">{status}</span>
            </div>
            <span className="hero-glance-label">Status</span>
          </div>
        </div>
      </div>
    </div>
  );
}
