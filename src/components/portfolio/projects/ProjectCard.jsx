import React, { useRef } from 'react';
import { ExternalLink, Code2 } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';

export default function ProjectCard({ project, onCardClick }) {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    cardRef.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    cardRef.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  return (
    <div className="project-card" ref={cardRef} onMouseMove={handleMouseMove} onClick={() => onCardClick?.(project)}>
      <div className="project-image-area">
        <div className="mesh-gradient" />
        {project.image ? (
          <img src={project.image} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover', zIndex: 1, position: 'relative' }} />
        ) : (
          <Code2 size={40} className="project-image-icon" />
        )}
      </div>
      <div className="project-content">
        <div className="project-title-row">
          <h3 className="project-title">{project.title}</h3>
          {project.liveUrl && (
            <div className="live-badge">
              <span className="live-dot"><span className="live-ping" /><span className="live-dot-core" /></span>
              <span className="live-text">Live</span>
            </div>
          )}
        </div>
        <p className="project-desc">{project.description}</p>
        <div className="project-tags">
          {project.tags.slice(0, 3).map(tag => <span key={tag} className="project-tag">{tag}</span>)}
          {project.tags.length > 3 && <span className="project-tag">+{project.tags.length - 3}</span>}
        </div>
        <div className="project-links" onClick={e => e.stopPropagation()}>
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noreferrer" className="project-link">
              <FaGithub size={14} /> Code
            </a>
          )}
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noreferrer" className="project-link project-link--live">
              <ExternalLink size={14} /> Live Demo
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
