import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, Terminal, Layers, Target, Award, Download, ArrowRight, 
  BarChart2, Loader2, CheckCircle, GraduationCap, Calendar
} from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { ScrollReveal } from '../components';
import Testimonials from '../components/portfolio/Testimonials';


const TIMELINE_NODES = [
  { id: 'gudivada', label: 'Gudivada', sub: 'Schooling', tooltip: 'Early Schooling & Foundations' },
  { id: 'vijayawada', label: 'Vijayawada', sub: 'Intermediate', tooltip: 'Intermediate Education (PCM)' },
  { id: 'vit', label: 'VIT Vellore', sub: 'B.Tech CS (8.7 CGPA)', tooltip: 'B.Tech Computer Science (8.7 CGPA)' },
  { id: 'ds', label: 'Data Science', sub: 'Specialization', tooltip: 'Specialization: ML, Neural Networks & Big Data', highlight: true },
  { id: 'next', label: "What's Next?", sub: 'Opportunities', tooltip: 'Seeking exciting engineering opportunities!', next: true }
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

export default function About() {
  const [toastStatus, setToastStatus] = useState(null); // null, 'packaging', 'ready'

  const handleDownloadClick = (e) => {
    e.preventDefault();
    if (toastStatus) return; // prevent spam clicking

    setToastStatus('packaging');
    
    setTimeout(() => {
      setToastStatus('ready');
      
      const link = document.createElement('a');
      link.href = '/resume.pdf';
      link.download = 'resume.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => setToastStatus(null), 3000);
    }, 1800);
  };

  const handleGetInTouch = (e) => {
    e.preventDefault();
    const event = new CustomEvent('trigger-chatbot', { 
      detail: { query: 'How can I contact you?' } 
    });
    window.dispatchEvent(event);
  };

  return (
    <ScrollReveal>
      <style>{`
        .about-page {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        /* Header */
        .about-header {
          margin-bottom: 0px;
        }
        .about-header h1 {
          font-size: 24px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 2px;
        }
        .about-header p {
          font-size: 12.5px;
          color: var(--text-secondary);
          margin: 0;
        }

        /* Unified Bio Card */
        .about-bio-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 14px;
          padding: 14px 18px;
          display: flex;
          align-items: flex-start;
          gap: 16px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
        }
        .about-bio-avatar {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--border-color);
          box-shadow: 0 0 12px color-mix(in srgb, var(--primary-blue) 25%, transparent);
          flex-shrink: 0;
          margin-top: 2px;
        }
        .about-bio-content {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
        }
        .about-bio-title {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
          line-height: 1.3;
          letter-spacing: -0.2px;
        }
        .about-bio-title span {
          color: var(--text-secondary);
          font-weight: 500;
        }
        .about-bio-text {
          font-size: 12.5px;
          line-height: 1.45;
          color: var(--text-secondary);
          margin: 0;
        }

        /* Unified Contact Links inside card */
        .contact-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 4px;
        }
        .contact-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          padding: 5px 12px;
          border-radius: 10px;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .contact-chip:hover {
          background: var(--bg-secondary);
          color: var(--primary-blue);
          border-color: var(--primary-blue);
          transform: translateY(-1px);
        }

        /* Horizontal Career Path Timeline */
        .career-path-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 14px;
          padding: 12px 18px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.02);
        }
        .career-path-header {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }
        .timeline-track-container {
          position: relative;
          padding: 4px 0 2px;
        }
        .timeline-line {
          position: absolute;
          top: 12px;
          left: 30px;
          right: 30px;
          height: 2px;
          background: var(--border-color);
          z-index: 1;
        }
        .timeline-line-progress {
          position: absolute;
          top: 0;
          left: 0;
          width: 75%;
          height: 100%;
          background: linear-gradient(90deg, var(--primary-blue), #10b981);
          border-radius: 2px;
        }
        .timeline-nodes-row {
          position: relative;
          z-index: 2;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .timeline-node-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          cursor: help;
          flex: 1;
        }
        
        .timeline-dot {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: var(--bg-secondary);
          border: 2.5px solid var(--primary-blue);
          box-shadow: 0 0 0 2px var(--bg-secondary);
          transition: all 0.25s ease;
          margin-bottom: 6px;
        }
        .timeline-node-item:hover .timeline-dot {
          transform: scale(1.25);
        }
        .timeline-dot.active {
          width: 16px;
          height: 16px;
          background: var(--primary-blue);
          border: 2px solid #ffffff;
          box-shadow: 0 0 0 2.5px var(--primary-blue);
          margin-top: -1px;
          margin-bottom: 5px;
        }
        .timeline-dot.pending {
          width: 15px;
          height: 15px;
          background: transparent;
          border: 2px dashed #10b981;
          margin-top: -0.5px;
          margin-bottom: 5.5px;
          animation: timelinePulse 2s ease-in-out infinite;
        }
        @keyframes timelinePulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.6; }
        }

        .timeline-node-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-primary);
          text-align: center;
          margin: 0;
          transition: color 0.2s ease;
        }
        .timeline-node-label.active {
          color: var(--primary-blue);
          font-weight: 700;
        }
        .timeline-node-label.pending {
          color: var(--text-muted);
          font-style: italic;
        }
        .timeline-node-sub {
          font-size: 10.5px;
          color: var(--text-muted);
          text-align: center;
          margin: 1px 0 0 0;
        }


        /* Tooltip */
        .timeline-tooltip {
          position: absolute;
          bottom: calc(100% + 10px);
          left: 50%;
          transform: translateX(-50%) translateY(8px);
          opacity: 0;
          pointer-events: none;
          background: rgba(17, 24, 39, 0.95);
          backdrop-filter: blur(8px);
          color: #fff;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 11.5px;
          font-weight: 500;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          transition: all 0.25s ease;
          z-index: 10;
        }
        .timeline-node-item:hover .timeline-tooltip {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }

        /* Section Titles */
        .about-section-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .title-icon-badge {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          background: color-mix(in srgb, var(--primary-blue) 12%, transparent);
          color: var(--primary-blue);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }
        .stat-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 14px;
          padding: 10px 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 3px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 14px rgba(0,0,0,0.03);
        }
        .stat-value {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }
        .stat-label {
          font-size: 11px;
          font-weight: 500;
          color: var(--text-secondary);
          margin: 0;
        }

        /* Redesigned CTA Section */
        .cta-section {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 14px;
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 0px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
        }

        .cta-top-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .cta-header-group h3 {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 4px 0;
        }

        .cta-header-group p {
          font-size: 12.5px;
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.45;
        }

        .cta-availability-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 999px;
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.25);
          color: #10b981;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
          flex-shrink: 0;
        }
        [data-theme="dark"] .cta-availability-badge {
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
          border-color: rgba(52, 211, 153, 0.3);
        }

        .cta-green-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 8px #10b981;
          animation: pulseDot 2s infinite ease-in-out;
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }

        .cta-response-time {
          font-family: var(--font-mono, monospace);
          font-size: 11.5px;
          color: var(--text-muted);
          margin: 4px 0 0 0;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .cta-interest-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 2px;
        }

        .cta-tag-chip {
          border: 1px solid var(--border-color);
          background: var(--bg-primary);
          color: var(--text-secondary);
          padding: 3px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 500;
        }

        /* 4-Column Action Grid */
        .cta-action-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin-top: 4px;
        }

        .cta-action-tile {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 10px 8px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          text-decoration: none;
          color: var(--text-primary);
          transition: all 0.2s ease;
        }

        .cta-action-tile:hover {
          background: var(--bg-secondary);
          border-color: var(--primary-blue);
          color: var(--primary-blue);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px color-mix(in srgb, var(--primary-blue) 20%, transparent);
        }

        .cta-tile-icon {
          color: var(--primary-blue);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease;
        }

        .cta-action-tile:hover .cta-tile-icon {
          transform: scale(1.1);
        }

        .cta-tile-label {
          font-size: 12px;
          font-weight: 600;
          text-align: center;
        }

        @media (max-width: 768px) {
          .cta-action-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .cta-top-row {
            flex-direction: column-reverse;
          }
        }


        .cta-btn-secondary:hover {
          border-color: var(--primary-blue);
          color: var(--primary-blue);
          transform: translateY(-2px);
        }

        /* Responsive */
        @media (max-width: 900px) {
          .hobbies-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .cta-section { flex-direction: column; text-align: center; gap: 16px; padding: 20px; }
          .cta-text p { max-width: 100%; }
          .about-bio-card { flex-direction: column; text-align: center; align-items: center; }
          .timeline-nodes-row { overflow-x: auto; padding-bottom: 8px; }
          .timeline-line { display: none; }
        }

        @media (max-width: 600px) {
          .hobbies-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <motion.div 
        className="about-page"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div className="about-header" variants={itemVariants}>
          <h1>About Me</h1>
          <p>Passionate developer crafting intelligent digital experiences</p>
        </motion.div>

        {/* Intro / Bio Card with Integrated Contact Chips */}
        <motion.div className="about-bio-card" variants={itemVariants}>
          <img src="/profile_photo.png" alt="Thota Sujith Reddy" className="about-bio-avatar" />
          <div className="about-bio-content">
            <h2 className="about-bio-title">
              Hi, I'm Sujith — <span>a B.Tech student at VIT Vellore (8.7 CGPA) specializing in Data Science.</span>
            </h2>
            <p className="about-bio-text">
              Currently pursuing Computer Science &amp; Engineering with a specialization in Data Science. 
              I bridge complex backend data structures with sleek, responsive interfaces — building applications that are as intelligent as they are beautiful.
            </p>
            <div className="contact-row">
              <a href="mailto:sujithreddy1546@gmail.com" className="contact-chip">
                <Mail size={14} /> Email
              </a>
              <a href="https://linkedin.com/in/thota-sujith-reddy" target="_blank" rel="noreferrer" className="contact-chip">
                <FaLinkedin size={14} /> LinkedIn
              </a>
              <a href="https://github.com/sujith1546" target="_blank" rel="noreferrer" className="contact-chip">
                <FaGithub size={14} /> GitHub
              </a>
            </div>
          </div>
        </motion.div>


        {/* Horizontal Career Path Timeline */}
        <motion.div className="career-path-card" variants={itemVariants}>
          <div className="career-path-header">
            <GraduationCap size={18} color="var(--primary-blue)" />
            <span>Career Path &amp; Milestones</span>
          </div>

          <div className="timeline-track-container">
            <div className="timeline-line">
              <div className="timeline-line-progress" />
            </div>

            <div className="timeline-nodes-row">
              {TIMELINE_NODES.map((node) => (
                <div key={node.id} className="timeline-node-item">
                  <div className={`timeline-dot ${node.highlight ? 'active' : ''} ${node.next ? 'pending' : ''}`} />
                  <p className={`timeline-node-label ${node.highlight ? 'active' : ''} ${node.next ? 'pending' : ''}`}>
                    {node.label}
                  </p>
                  <p className="timeline-node-sub">{node.sub}</p>
                  <div className="timeline-tooltip">{node.tooltip}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>



        {/* Stats Title */}
        <motion.h2 className="about-section-title" variants={itemVariants}>
          <div className="title-icon-badge">
            <BarChart2 size={16} />
          </div>
          By the Numbers
        </motion.h2>

        {/* Quick Stats Grid */}
        <motion.div className="stats-grid" variants={containerVariants}>
          <motion.div className="stat-card" variants={itemVariants}>
            <Terminal size={24} color="#3b82f6" />
            <p className="stat-value">3.5+</p>
            <p className="stat-label">Years Coding</p>
          </motion.div>
          <motion.div className="stat-card" variants={itemVariants}>
            <Layers size={24} color="#10b981" />
            <p className="stat-value">10+</p>
            <p className="stat-label">Projects Shipped</p>
          </motion.div>
          <motion.div className="stat-card" variants={itemVariants}>
            <Target size={24} color="#f59e0b" />
            <p className="stat-value">200+</p>
            <p className="stat-label">DSA Solved</p>
          </motion.div>
          <motion.div className="stat-card" variants={itemVariants}>
            <Award size={24} color="#8b5cf6" />
            <p className="stat-value">8.7</p>
            <p className="stat-label">CGPA</p>
          </motion.div>
        </motion.div>

        {/* Redesigned Call to Action Banner */}
        <motion.div className="cta-section" variants={itemVariants}>
          <div className="cta-top-row">
            <div className="cta-header-group">
              <h3>Let's build something great.</h3>
              <p>I'm always open to discussing Data Science, Machine Learning architecture, or exciting new engineering opportunities.</p>
              <p className="cta-response-time">
                <span style={{ color: 'var(--primary-blue)', fontWeight: 700 }}>&gt;_</span> usually responds within 24h
              </p>
            </div>
            <div className="cta-availability-badge">
              <span className="cta-green-dot" />
              Available for opportunities
            </div>
          </div>

          <div className="cta-interest-tags">
            <span className="cta-tag-chip">Data science</span>
            <span className="cta-tag-chip">Machine learning</span>
            <span className="cta-tag-chip">Full-stack</span>
            <span className="cta-tag-chip">Internships</span>
          </div>

          <div className="cta-action-grid">
            <a href="mailto:sujithreddy1546@gmail.com" className="cta-action-tile">
              <div className="cta-tile-icon"><Mail size={16} /></div>
              <span className="cta-tile-label">Email</span>
            </a>
            <a href="mailto:sujithreddy1546@gmail.com?subject=Schedule%20a%20Call" onClick={handleGetInTouch} className="cta-action-tile">
              <div className="cta-tile-icon"><Calendar size={16} /></div>
              <span className="cta-tile-label">Schedule call</span>
            </a>
            <a href="/resume.pdf" onClick={handleDownloadClick} className="cta-action-tile">
              <div className="cta-tile-icon"><Download size={16} /></div>
              <span className="cta-tile-label">Resume</span>
            </a>
            <a href="https://github.com/sujith1546" target="_blank" rel="noreferrer" className="cta-action-tile">
              <div className="cta-tile-icon"><FaGithub size={16} /></div>
              <span className="cta-tile-label">GitHub</span>
            </a>
          </div>
        </motion.div>


        {/* Glassmorphism Download Toast */}
        {createPortal(
          <AnimatePresence>
            {toastStatus && (
              <motion.div
                initial={{ opacity: 0, x: 20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.95 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 200, damping: 20 }}
                style={{
                  position: 'fixed',
                  top: '80px',
                  right: '32px',
                  zIndex: 99999,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: toastStatus === 'packaging' ? 'rgba(17, 24, 39, 0.92)' : 'rgba(16, 185, 129, 0.92)',
                  backdropFilter: 'blur(var(--glass-blur, 12px))',
                  WebkitbackdropFilter: 'blur(var(--glass-blur, 12px))',
                  color: '#fff',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.15), inset 0 1px 1px rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {toastStatus === 'packaging' ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                    <Loader2 size={18} />
                  </motion.div>
                ) : (
                  <CheckCircle size={18} />
                )}
                <span style={{ fontSize: '13.5px', fontWeight: 500, letterSpacing: '0.2px' }}>
                  {toastStatus === 'packaging' ? 'Packaging Artifacts...' : 'Download Complete'}
                </span>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

        {/* Testimonials Section */}
        <div style={{ marginTop: 8 }}>
          <Testimonials />
        </div>

      </motion.div>
    </ScrollReveal>
  );
}
