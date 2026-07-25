import React, { useState, useRef } from 'react';
import ScrollReveal from '../../components/ScrollReveal';
import { ExternalLink, Code2, Loader2 } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import useRealtimeData from '../../hooks/useRealtimeData';

function ProjectCard({ project, onCardClick }) {
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
        {project.image
          ? <img src={project.image} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover', zIndex: 1, position: 'relative' }} />
          : <Code2 size={40} className="project-image-icon" />}
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

export default function DesktopProjects() {
  const { data: projectsData, loading } = useRealtimeData('projects', { orderColumn: 'created_at', ascending: true, disableRealtime: true });

  return (
    <ScrollReveal className="wide-content">
      <style>{`
        .live-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3.5px 8px 3.5px 6px;
          background: rgba(16,185,129,.1);
          border: 1px solid rgba(16,185,129,.15);
          border-radius: 12px; font-size: 9px; font-weight: 800;
          letter-spacing: .06em; text-transform: uppercase; color: #10b981;
          box-shadow: 0 2px 6px rgba(16,185,129,.05);
          flex-shrink: 0;
        }
        .live-dot { position: relative; display: flex; width: 6px; height: 6px; }
        .live-dot-core { position: relative; display: inline-flex; border-radius: 50%; height: 6px; width: 6px; background: #10b981; z-index: 2; box-shadow: 0 0 4px rgba(16,185,129,.6); }
        .live-ping { position: absolute; display: inline-flex; height: 100%; width: 100%; border-radius: 50%; background: #10b981; opacity: .8; animation: radarPing 2s cubic-bezier(0,0,.2,1) infinite; z-index: 1; }
        @keyframes radarPing { 75%, 100% { transform: scale(2.8); opacity: 0; } }

        .mesh-gradient {
          position: absolute; width: 200%; height: 200%;
          background: radial-gradient(circle at 50% 50%, rgba(59,130,246,.15), transparent 60%),
                      radial-gradient(circle at 80% 20%, rgba(16,185,129,.15), transparent 50%);
          animation: meshFlow 10s ease infinite alternate;
        }
        @keyframes meshFlow {
          0% { transform: translate(0,0) scale(1); }
          100% { transform: translate(-20%,-20%) scale(1.1); }
        }

        .projects-header { margin-bottom: 32px; text-align: left; }
        .projects-header h1 { font-size: 28px; font-weight: 700; color: var(--text-primary); margin: 0 0 8px; }
        .projects-header p { font-size: 14.5px; color: var(--text-secondary); max-width: 600px; line-height: 1.5; margin: 0; }
        .projects-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
        .project-card {
          background: rgba(255,255,255,.6); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(0,0,0,.06); border-radius: 20px; overflow: hidden;
          display: flex; flex-direction: column; position: relative;
          transition: transform .3s ease, border-color .3s ease;
          box-shadow: 0 4px 15px rgba(0,0,0,.02); cursor: pointer;
        }
        .project-card::before {
          content: ""; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
          border-radius: inherit;
          background: radial-gradient(400px circle at var(--mouse-x,-500px) var(--mouse-y,-500px), rgba(255,255,255,.8), transparent 40%);
          opacity: 0; transition: opacity .3s; pointer-events: none; z-index: 0;
        }
        [data-theme="dark"] .project-card { background: rgba(30,30,30,.4); border-color: rgba(255,255,255,.08); }
        [data-theme="dark"] .project-card::before { background: radial-gradient(400px circle at var(--mouse-x,-500px) var(--mouse-y,-500px), rgba(255,255,255,.08), transparent 40%); }
        .project-card:hover { transform: translateY(-2px); border-color: rgba(0,0,0,.15); box-shadow: 0 12px 30px -10px rgba(0,0,0,.08); }
        [data-theme="dark"] .project-card:hover { border-color: rgba(255,255,255,.2); box-shadow: 0 12px 30px -10px rgba(0,0,0,.3); }
        .project-card:hover::before { opacity: 1; }
        .project-image-area {
          width: 100%; height: 140px;
          background: linear-gradient(120deg, #e0e7ff 0%, #dcfce7 100%);
          position: relative; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
          border-bottom: 1px solid rgba(0,0,0,.03); z-index: 1;
        }
        [data-theme="dark"] .project-image-area { background: linear-gradient(120deg,#1e1b4b 0%,#064e3b 100%); border-bottom-color: rgba(255,255,255,.05); }
        .project-image-icon { color: rgba(0,0,0,.15); }
        [data-theme="dark"] .project-image-icon { color: rgba(255,255,255,.08); }
        .project-content { padding: 20px; display: flex; flex-direction: column; flex-grow: 1; z-index: 1; }
        .project-title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .project-title { font-size: 17px; font-weight: 700; color: var(--text-primary); margin: 0; letter-spacing: -.01em; }
        .project-desc { font-size: 13.5px; color: var(--text-secondary); line-height: 1.5; margin: 0 0 16px; flex-grow: 1; }
        .project-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 20px; }
        .project-tag { font-size: 11px; font-weight: 600; padding: 3px 8px; background: rgba(59,130,246,.06); color: var(--primary-blue); border-radius: 4px; border: 1px solid rgba(59,130,246,.12); }
        [data-theme="dark"] .project-tag { background: rgba(59,130,246,.1); border-color: rgba(59,130,246,.25); }
        .project-links {
          display: flex; gap: 16px;
          border-top: 1px solid rgba(0,0,0,.06);
          padding-top: 14px; margin-top: auto;
        }
        [data-theme="dark"] .project-links { border-top-color: rgba(255,255,255,.08); }
        .project-link {
          display: flex; align-items: center; gap: 6px;
          font-size: 12.5px; font-weight: 600;
          color: var(--text-secondary); text-decoration: none;
          transition: color .2s ease;
        }
        .project-link:hover { color: var(--primary-blue); }
        .project-link--live { color: var(--primary-blue); }
        .project-link--live:hover { opacity: 0.8; }
      `}</style>

      <div className="projects-header">
        <h1>Featured Projects</h1>
        <p>A selection of products, open-source work, and machine learning models I've built.</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <Loader2 className="spin" size={32} color="var(--primary-blue)" />
        </div>
      ) : projectsData.length === 0 ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <p>No projects found in the database. Please add them in the Admin Dashboard.</p>
        </div>
      ) : (
        <div className="projects-grid">
          {projectsData.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </ScrollReveal>
  );
}
