import { useState, useEffect, useRef } from 'react';
import ScrollReveal from '../components/ScrollReveal';
import { ExternalLink, Code2, X, ChevronRight } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { projectsData } from '../data/projectsData';
import { motion, AnimatePresence } from 'framer-motion';

function ProjectCard({ project, onCardClick }) {
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
      onClick={() => onCardClick?.(project)}
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
          {project.tags.slice(0, 3).map(tag => (
            <span key={tag} className="project-tag">{tag}</span>
          ))}
          {project.tags.length > 3 && <span className="project-tag">+{project.tags.length - 3}</span>}
        </div>

        <div className="mobile-view-details-btn">
          <span>View Project Details</span>
          <ChevronRight size={14} />
        </div>
      </div>
    </div>
  );
}

export default function Projects() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  const [selectedProject, setSelectedProject] = useState(null);
  const [scrollIndex, setScrollIndex] = useState(0);
  
  const carouselRef = useRef(null);
  const detailsSheetRef = useRef(null);
  const triggerCardRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Track carousel scroll position to update index dots
  const handleScroll = () => {
    if (!carouselRef.current) return;
    const width = carouselRef.current.clientWidth;
    const scrollLeft = carouselRef.current.scrollLeft;
    const index = Math.round(scrollLeft / (width * 0.8));
    setScrollIndex(Math.min(Math.max(index, 0), projectsData.length - 1));
  };

  // Keyboard accessibility & Focus trap inside project drawer sheet
  useEffect(() => {
    if (!selectedProject) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedProject(null);
      }

      if (e.key === 'Tab') {
        const focusable = detailsSheetRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) { // Shift + Tab
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else { // Tab
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    // Auto-focus first focusable element inside the drawer
    setTimeout(() => {
      const firstBtn = detailsSheetRef.current?.querySelector('button');
      firstBtn?.focus();
    }, 100);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedProject]);

  return (
    <ScrollReveal className="wide-content">
      <style>{`
        .projects-header {
          margin-bottom: 32px;
          text-align: left;
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
          cursor: pointer;
        }
        
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

        .mobile-view-details-btn {
          display: none;
        }

        /* ============================================
           MOBILE HORIZONTAL CAROUSEL & SHEET (<= 900px)
           ============================================ */
        @media (max-width: 900px) {
          .mobile-view-details-btn {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 12.5px;
            font-weight: 650;
            color: var(--primary-blue);
            margin-top: 8px;
            padding-top: 12px;
            border-top: 1px solid var(--border-color);
          }

          .mobile-projects-carousel {
            width: 100%;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            display: flex;
            gap: 16px;
            padding: 8px 4px 16px 4px;
            scrollbar-width: none;
            -webkit-overflow-scrolling: touch;
          }
          .mobile-projects-carousel::-webkit-scrollbar {
            display: none;
          }

          .mobile-projects-carousel .project-card {
            flex: 0 0 85%;
            scroll-snap-align: center;
            box-shadow: var(--shadow-sm);
          }

          .carousel-indicators {
            display: flex;
            justify-content: center;
            gap: 8px;
            margin-top: 16px;
          }

          .indicator-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: var(--border-color);
            transition: all 0.2s ease;
          }

          .indicator-dot.active {
            background: var(--primary-blue);
            transform: scale(1.4);
          }

          /* Details Bottom Sheet Overlay */
          .details-sheet-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.4);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            z-index: 100;
          }

          .details-sheet {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            background: var(--bg-secondary);
            border-top: 1px solid var(--border-color);
            border-top-left-radius: 24px;
            border-top-right-radius: 24px;
            padding: 24px 20px calc(24px + env(safe-area-inset-bottom, 16px)) 20px;
            z-index: 101;
            box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.15);
            box-sizing: border-box;
            max-height: 85vh;
            overflow-y: auto;
            text-align: left;
          }

          .details-sheet-handle {
            width: 36px;
            height: 4px;
            background: var(--border-color);
            border-radius: 2px;
            margin: 0 auto 16px auto;
          }

          .details-sheet-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            margin-bottom: 16px;
          }

          .details-sheet-title h3 {
            font-size: 20px;
            font-weight: 800;
            color: var(--text-primary);
            margin: 0 0 6px 0;
            letter-spacing: -0.02em;
          }

          .details-sheet-close-btn {
            border: none;
            background: none;
            color: var(--text-secondary);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 6px;
            border-radius: 50%;
            transition: background 0.2s ease;
          }

          .details-sheet-close-btn:hover {
            background: rgba(128, 128, 128, 0.08);
          }

          .details-sheet-image {
            width: 100%;
            height: 180px;
            border-radius: 16px;
            overflow: hidden;
            background: linear-gradient(120deg, #e0e7ff 0%, #dcfce7 100%);
            margin-bottom: 20px;
            position: relative;
          }
          [data-theme="dark"] .details-sheet-image {
            background: linear-gradient(120deg, #1e1b4b 0%, #064e3b 100%);
          }

          .details-sheet-desc {
            font-size: 14px;
            line-height: 1.6;
            color: var(--text-secondary);
            margin: 0 0 20px 0;
          }

          .details-sheet-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 24px;
          }

          .details-sheet-tag {
            font-size: 11.5px;
            font-weight: 600;
            padding: 4px 10px;
            background: rgba(59, 130, 246, 0.06);
            color: var(--primary-blue);
            border-radius: 6px;
            border: 1px solid rgba(59, 130, 246, 0.12);
          }
          [data-theme="dark"] .details-sheet-tag {
            background: rgba(59, 130, 246, 0.1);
            border-color: rgba(59, 130, 246, 0.25);
          }

          .details-sheet-actions {
            display: flex;
            gap: 12px;
            border-top: 1px solid var(--border-color);
            padding-top: 16px;
          }

          .details-action-pill {
            flex: 1;
            height: 46px;
            border-radius: 12px;
            border: 1px solid var(--border-color);
            background: var(--bg-secondary);
            color: var(--text-primary);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            font-size: 13.5px;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.2s ease;
            outline: none;
          }

          .details-action-pill:hover, .details-action-pill:focus {
            background: var(--bg-primary);
            border-color: var(--primary-blue);
          }
        }
      `}</style>

      {/* Details Sheet Overlay */}
      <AnimatePresence>
        {selectedProject && (
          <>
            <motion.div 
              className="details-sheet-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
            />
            <motion.div 
              ref={detailsSheetRef}
              className="details-sheet"
              role="dialog"
              aria-modal="true"
              aria-label={`Project details for ${selectedProject.title}`}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            >
              <div className="details-sheet-handle" />
              
              <div className="details-sheet-header">
                <div className="details-sheet-title">
                  <h3>{selectedProject.title}</h3>
                  {selectedProject.liveUrl && (
                    <div className="live-badge" style={{ width: 'fit-content' }}>
                      <span className="live-dot">
                        <span className="live-ping"></span>
                        <span className="live-dot-core"></span>
                      </span>
                      <span className="live-text">Live Demo</span>
                    </div>
                  )}
                </div>
                <button 
                  className="details-sheet-close-btn"
                  onClick={() => setSelectedProject(null)}
                  aria-label="Close project sheet"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Cover Image in sheet */}
              <div className="details-sheet-image">
                <div className="mesh-gradient"></div>
                {selectedProject.image ? (
                  <img src={selectedProject.image} alt={selectedProject.title} style={{ width: '100%', height: '100%', objectFit: 'cover', zIndex: 1, position: 'relative' }} />
                ) : (
                  <Code2 size={48} className="project-image-icon" style={{ zIndex: 1, position: 'relative' }} />
                )}
              </div>

              {/* Full Description */}
              <p className="details-sheet-desc">{selectedProject.description}</p>

              {/* Tags list */}
              <div className="details-sheet-tags">
                {selectedProject.tags.map(tag => (
                  <span key={tag} className="details-sheet-tag">{tag}</span>
                ))}
              </div>

              {/* Launch actions */}
              <div className="details-sheet-actions">
                {selectedProject.githubUrl && (
                  <a 
                    href={selectedProject.githubUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="details-action-pill"
                  >
                    <FaGithub size={16} /> Code
                  </a>
                )}
                {selectedProject.liveUrl && (
                  <a 
                    href={selectedProject.liveUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="details-action-pill"
                    style={{ background: 'var(--primary-blue)', color: 'white', borderColor: 'var(--primary-blue)' }}
                  >
                    <ExternalLink size={16} /> Live Demo
                  </a>
                )}
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="projects-header">
        <h1>Featured Projects</h1>
        <p>
          A showcase of my recent work, highlighting my expertise in modern web development, data science, and complex problem-solving.
        </p>
      </div>

      {!isMobile ? (
        /* Desktop grid view */
        <div className="projects-grid">
          {projectsData.map((project) => (
            <ProjectCard key={project.id} project={project} onCardClick={() => {}} />
          ))}
        </div>
      ) : (
        /* Mobile horizontal swiping carousel */
        <div className="mobile-projects-wrapper">
          <div 
            className="mobile-projects-carousel"
            ref={carouselRef}
            onScroll={handleScroll}
          >
            {projectsData.map((project) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                onCardClick={(proj) => setSelectedProject(proj)} 
              />
            ))}
          </div>

          {/* Indicator Dot Navigation */}
          <div className="carousel-indicators">
            {projectsData.map((_, i) => (
              <div 
                key={i} 
                className={`indicator-dot ${scrollIndex === i ? 'active' : ''}`}
              />
            ))}
          </div>
        </div>
      )}
    </ScrollReveal>
  );
}
