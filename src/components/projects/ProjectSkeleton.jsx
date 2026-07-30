import React from 'react';

export default function ProjectSkeleton({ count = 6 }) {
  return (
    <div className="projects-skeleton-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="project-skeleton-card">
          <div className="skeleton-image-area" />
          <div className="skeleton-content">
            <div className="skeleton-title" />
            <div className="skeleton-line" />
            <div className="skeleton-line skeleton-line--short" />
            <div className="skeleton-tags">
              <div className="skeleton-tag" />
              <div className="skeleton-tag" />
              <div className="skeleton-tag" />
            </div>
            <div className="skeleton-footer" />
          </div>
        </div>
      ))}
    </div>
  );
}
