import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Code2, Loader2, Star, GitFork, X, Layers } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { createPortal } from 'react-dom';
import useRealtimeData from '../hooks/useRealtimeData';
import { projectsData as fallbackProjects } from '../data/projectsData';

function ProjectModal({ project, onClose }) {
  const tags = Array.isArray(project?.tags) ? project.tags : (project?.tags || '').split(',').map(t => t.trim()).filter(Boolean);
  const pipeline = project?.ml_pipeline_steps || [];
  const githubUrl = project?.github_url || project?.githubUrl;
  const liveUrl = project?.live_url || project?.liveUrl;

  if (!project) return null;
  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          onClick={e => e.stopPropagation()}
          style={{
            background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
            borderRadius: 20, width: '100%', maxWidth: 620,
            maxHeight: '85vh', display: 'flex', flexDirection: 'column',
            boxShadow: '0 32px 64px rgba(0,0,0,0.28)',
            overflow: 'hidden',
          }}
        >
          {/* Modal Header */}
          <div style={{
            padding: '22px 24px 18px',
            borderBottom: '1px solid var(--border-color)',
            background: 'linear-gradient(135deg, color-mix(in srgb, var(--primary-blue) 8%, transparent), transparent)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 11, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  background: 'color-mix(in srgb, var(--primary-blue) 15%, transparent)',
                  color: 'var(--primary-blue)',
                }}>
                  <Code2 size={20} />
                </div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>{project.title}</h3>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {githubUrl && (
                <a href={githubUrl} target="_blank" rel="noreferrer" style={{
                  padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color)',
                  background: 'var(--bg-primary)', color: 'var(--text-primary)',
                  display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, textDecoration: 'none',
                }}>
                  <FaGithub size={13} /> Code
                </a>
              )}
              {liveUrl && (
                <a href={liveUrl} target="_blank" rel="noreferrer" style={{
                  padding: '6px 12px', borderRadius: 8, border: 'none',
                  background: 'var(--primary-blue)', color: '#fff',
                  display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, textDecoration: 'none',
                }}>
                  <ExternalLink size={13} /> Live Demo
                </a>
              )}
              <button onClick={onClose} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>{project.description}</p>

            {pipeline.length > 0 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>Pipeline</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  {pipeline.map((step, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px',
                      borderRadius: 8, background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
                      fontSize: 12, color: 'var(--text-secondary)',
                    }}>
                      <Layers size={13} style={{ color: 'var(--primary-blue)' }} />
                      {step.label}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tags.length > 0 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>Tech Stack</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {tags.map(t => (
                    <span key={t} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '4px 10px', borderRadius: 6,
                      background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
                      fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500,
                    }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

export default function Projects() {
  const { data: projects, loading } = useRealtimeData('projects', { orderColumn: 'created_at', ascending: true });
  const [selectedProject, setSelectedProject] = useState(null);

  const displayProjects = useMemo(() => {
    if (projects && projects.length > 0) return projects;
    return fallbackProjects;
  }, [projects]);

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <style>{`
        /* ── Height propagation chain for desktop fit ── */
        #projects,
        #projects > .text-content.wide-content,
        #projects > .text-content.wide-content > .reveal {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 0;
        }

        .proj-root {
          width: 100%;
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
          box-sizing: border-box;
        }

        .projects-header {
          margin-bottom: 24px;
          flex-shrink: 0;
        }
        .projects-header h1 {
          font-size: 28px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 8px 0;
        }
        .projects-header p {
          font-size: 14px;
          color: var(--text-secondary);
          max-width: 650px;
          line-height: 1.5;
          margin: 0;
        }

        /* Live radar ping badge */
        .live-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 8px 3px 6px;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 12px; font-size: 9.5px; font-weight: 700;
          letter-spacing: .05em; text-transform: uppercase; color: #10b981;
          flex-shrink: 0;
        }
        .live-dot { position: relative; display: flex; width: 6px; height: 6px; }
        .live-dot-core { position: relative; display: inline-flex; border-radius: 50%; height: 6px; width: 6px; background: #10b981; z-index: 2; }
        .live-ping { position: absolute; display: inline-flex; height: 100%; width: 100%; border-radius: 50%; background: #10b981; opacity: .8; animation: radarPing 2s cubic-bezier(0,0,.2,1) infinite; z-index: 1; }
        @keyframes radarPing { 75%, 100% { transform: scale(2.8); opacity: 0; } }

        /* Hologram mesh gradient */
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

        .projects-grid {
          flex: 1;
          min-height: 0;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          overflow-y: auto;
          padding-bottom: 20px;
          align-content: start;
        }

        .project-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          position: relative;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
          box-shadow: 0 4px 20px rgba(0,0,0,0.04);
          cursor: pointer;
          min-height: 320px;
        }

        .project-card::before {
          content: "";
          position: absolute; inset: 0;
          border-radius: inherit;
          background: radial-gradient(400px circle at var(--mouse-x, -500px) var(--mouse-y, -500px), color-mix(in srgb, var(--primary-blue) 12%, transparent), transparent 40%);
          opacity: 0;
          transition: opacity 0.3s;
          pointer-events: none;
          z-index: 0;
        }

        .project-card:hover {
          transform: none !important;
          border-color: color-mix(in srgb, var(--primary-blue) 40%, transparent);
          box-shadow: 0 12px 32px color-mix(in srgb, var(--primary-blue) 12%, transparent);
        }
        .project-card:hover::before { opacity: 1; }

        .project-image-area {
          width: 100%; height: 140px;
          background: linear-gradient(120deg, #dbeafe 0%, #d1fae5 100%);
          position: relative; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
          border-bottom: 1px solid var(--border-color); z-index: 1;
          flex-shrink: 0;
        }
        [data-theme="dark"] .project-image-area {
          background: linear-gradient(120deg, #1e1b4b 0%, #064e3b 100%);
        }

        .project-image-icon { color: rgba(59, 130, 246, 0.45); }
        [data-theme="dark"] .project-image-icon { color: rgba(255, 255, 255, 0.3); }

        .project-content {
          padding: 22px 24px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
          z-index: 1;
        }

        .project-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .project-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
          line-height: 1.35;
        }

        .project-desc {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.55;
          margin: 0 0 16px 0;
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex: 1;
        }

        .project-tags {
          display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 18px;
        }
        .project-tag {
          font-size: 11px; font-weight: 600; padding: 3px 9px;
          background: var(--bg-primary);
          color: var(--text-secondary);
          border-radius: 7px;
          border: 1px solid var(--border-color);
        }

        .project-links {
          display: flex; align-items: center; gap: 16px;
          border-top: 1px solid var(--border-color);
          padding-top: 14px; margin-top: auto;
        }

        .project-link {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 13px; font-weight: 600;
          color: var(--primary-blue); text-decoration: none;
          transition: opacity 0.2s ease;
        }
        .project-link:hover { opacity: 0.8; }

        @media (max-width: 900px) {
          #projects,
          #projects > .text-content.wide-content,
          #projects > .text-content.wide-content > .reveal {
            display: block; flex: none; min-height: unset;
          }
          .proj-root { flex: none; height: auto; padding-bottom: 32px; }
          .projects-grid { flex: none; grid-template-columns: 1fr; gap: 20px; overflow: visible; }
          .project-card { min-height: unset; }
        }
      `}</style>

      <div className="proj-root">


        {/* Projects Grid */}
        {loading && (!projects || projects.length === 0) ? (
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 0' }}>
            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary-blue)' }} />
          </div>
        ) : (
          <div className="projects-grid">
            {displayProjects.map(project => {
              const tags = Array.isArray(project.tags) ? project.tags : (project.tags || '').split(',').map(t => t.trim()).filter(Boolean);
              const githubUrl = project.github_url || project.githubUrl;
              const liveUrl = project.live_url || project.liveUrl;

              return (
                <div
                  key={project.id}
                  className="project-card"
                  onMouseMove={handleMouseMove}
                  onClick={() => setSelectedProject(project)}
                >
                  <div className="project-image-area">
                    <div className="mesh-gradient" />
                    {project.image_url ? (
                      <img src={project.image_url} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Code2 size={40} className="project-image-icon" />
                    )}
                  </div>

                  <div className="project-content">
                    <div className="project-title-row">
                      <h3 className="project-title">{project.title}</h3>
                      {liveUrl && (
                        <div className="live-badge">
                          <span className="live-dot"><span className="live-ping" /><span className="live-dot-core" /></span>
                          <span className="live-text">Live</span>
                        </div>
                      )}
                    </div>

                    <p className="project-desc">{project.description}</p>

                    <div className="project-tags">
                      {tags.slice(0, 3).map(tag => (
                        <span key={tag} className="project-tag">{tag}</span>
                      ))}
                      {tags.length > 3 && <span className="project-tag">+{tags.length - 3}</span>}
                    </div>

                    <div className="project-links" onClick={e => e.stopPropagation()}>
                      {githubUrl && (
                        <a href={githubUrl} target="_blank" rel="noreferrer" className="project-link">
                          <FaGithub size={14} /> Code
                        </a>
                      )}
                      {liveUrl && (
                        <a href={liveUrl} target="_blank" rel="noreferrer" className="project-link">
                          <ExternalLink size={14} /> Live Demo
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedProject && (
        <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
    </div>
  );
}
