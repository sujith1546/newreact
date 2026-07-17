import { useRef } from 'react';
import ScrollReveal from '../components/ScrollReveal';
import { ExternalLink, Code2 } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { projectsData } from '../data/projectsData';

function ProjectCard({ project }) {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <div 
      className="project-card" 
      ref={cardRef} 
      onMouseMove={handleMouseMove}
    >
      <div className="project-image-area">
        <div className="mesh-gradient"></div>
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
            <div className="live-badge" title="Live Project">
              <span className="live-dot">
                <span className="live-ping"></span>
                <span className="live-dot-core"></span>
              </span>
              <span className="live-text">Live</span>
            </div>
          )}
        </div>
        <p className="project-desc">{project.description}</p>
        
        <div className="project-tags">
          {project.tags.map(tag => (
            <span key={tag} className="project-tag">{tag}</span>
          ))}
        </div>

        <div className="project-links">
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noreferrer" className="project-link">
              <FaGithub size={15} /> Code
            </a>
          )}
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noreferrer" className="project-link">
              <ExternalLink size={15} /> Live Demo
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Projects() {
  return (
    <ScrollReveal className="wide-content">
      <style>{`
        .projects-header {
          margin-bottom: 32px;
        }
        .projects-header h1 {
          font-size: 28px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 8px 0;
        }
        .projects-header p {
          font-size: 14.5px;
          color: var(--text-secondary);
          max-width: 600px;
          line-height: 1.5;
          margin: 0;
        }

        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }

        .project-card {
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(0,0,0,0.06);
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          position: relative;
          transition: transform 0.3s ease, border-color 0.3s ease;
          box-shadow: 0 4px 15px rgba(0,0,0,0.02);
        }
        
        /* Advanced Spotlight Hover Effect */
        .project-card::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          border-radius: inherit;
          background: radial-gradient(
            400px circle at var(--mouse-x, -500px) var(--mouse-y, -500px),
            rgba(255, 255, 255, 0.8),
            transparent 40%
          );
          opacity: 0;
          transition: opacity 0.3s;
          pointer-events: none;
          z-index: 0;
        }
        
        [data-theme="dark"] .project-card {
          background: rgba(30, 30, 30, 0.4);
          border-color: rgba(255,255,255,0.08);
        }
        [data-theme="dark"] .project-card::before {
          background: radial-gradient(
            400px circle at var(--mouse-x, -500px) var(--mouse-y, -500px),
            rgba(255, 255, 255, 0.08),
            transparent 40%
          );
        }

        .project-card:hover {
          transform: translateY(-2px);
          border-color: rgba(0,0,0,0.15);
          box-shadow: 0 12px 30px -10px rgba(0,0,0,0.08);
        }
        [data-theme="dark"] .project-card:hover {
          border-color: rgba(255,255,255,0.2);
          box-shadow: 0 12px 30px -10px rgba(0,0,0,0.3);
        }
        .project-card:hover::before {
          opacity: 1;
        }

        .project-image-area {
          width: 100%;
          height: 140px;
          background: linear-gradient(120deg, #e0e7ff 0%, #dcfce7 100%);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          border-bottom: 1px solid rgba(0,0,0,0.03);
          z-index: 1;
        }
        [data-theme="dark"] .project-image-area {
          background: linear-gradient(120deg, #1e1b4b 0%, #064e3b 100%);
          border-bottom-color: rgba(255,255,255,0.05);
        }
        
        .mesh-gradient {
          position: absolute;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.15), transparent 60%),
                      radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.15), transparent 50%);
          animation: meshFlow 10s ease infinite alternate;
        }
        @keyframes meshFlow {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(-20%, -20%) scale(1.1); }
        }

        .project-image-icon {
          color: rgba(0,0,0,0.15);
        }
        [data-theme="dark"] .project-image-icon {
          color: rgba(255,255,255,0.08);
        }

        .project-content {
          padding: 20px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
          z-index: 1;
        }

        .project-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .project-title {
          font-size: 17px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
          letter-spacing: -0.01em;
        }
        
        .live-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 8px;
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 20px;
          font-size: 9.5px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #10b981;
        }
        [data-theme="dark"] .live-badge {
          background: rgba(16, 185, 129, 0.15);
        }

        .live-dot {
          position: relative;
          display: flex;
          width: 5px;
          height: 5px;
        }
        
        .live-dot-core {
          position: relative;
          display: inline-flex;
          border-radius: 50%;
          height: 5px;
          width: 5px;
          background-color: #10b981;
          z-index: 2;
        }

        .live-ping {
          position: absolute;
          display: inline-flex;
          height: 100%;
          width: 100%;
          border-radius: 50%;
          background-color: #10b981;
          opacity: 0.8;
          animation: radarPing 2s cubic-bezier(0, 0, 0.2, 1) infinite;
          z-index: 1;
        }

        @keyframes radarPing {
          75%, 100% {
            transform: scale(2.8);
            opacity: 0;
          }
        }

        .project-desc {
          font-size: 13.5px;
          color: var(--text-secondary);
          line-height: 1.5;
          margin: 0 0 16px 0;
          flex-grow: 1;
        }

        .project-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 20px;
        }
        
        .project-tag {
          font-size: 11px;
          font-weight: 600;
          padding: 3px 8px;
          background: rgba(59, 130, 246, 0.06);
          color: var(--primary-blue);
          border-radius: 4px;
          border: 1px solid rgba(59, 130, 246, 0.12);
        }
        [data-theme="dark"] .project-tag {
          background: rgba(59, 130, 246, 0.1);
          border-color: rgba(59, 130, 246, 0.25);
        }

        .project-links {
          display: flex;
          gap: 16px;
          border-top: 1px solid rgba(0,0,0,0.06);
          padding-top: 14px;
        }
        [data-theme="dark"] .project-links {
          border-top-color: rgba(255,255,255,0.08);
        }

        .project-link {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--text-secondary);
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .project-link:hover {
          color: var(--primary-blue);
        }
      `}</style>

      <div className="projects-header">
        <h1>Featured Projects</h1>
        <p>
          A showcase of my recent work, highlighting my expertise in modern web development, data science, and complex problem-solving.
        </p>
      </div>

      <div className="projects-grid">
        {projectsData.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </ScrollReveal>
  );
}
