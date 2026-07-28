import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Coffee, BookOpen, Dumbbell, Compass, Gamepad2, Mail, 
  Terminal, Layers, Target, Award, Download, ArrowRight, 
  BarChart2, Loader2, CheckCircle, MapPin, GraduationCap, Briefcase
} from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { ScrollReveal } from '../components';
import Testimonials from '../components/portfolio/Testimonials';

const HOBBIES = [
  { label: 'Strategic Thinking', value: 'Chess Enthusiast', icon: Gamepad2 },
  { label: 'Continuous Learning', value: 'Avid Reader', icon: BookOpen },
  { label: 'Physical Health', value: 'Fitness & Sports', icon: Dumbbell },
  { label: 'Exploration', value: 'Traveling', icon: Compass }
];

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
          gap: 24px;
        }

        /* Header */
        .about-header {
          margin-bottom: 4px;
        }
        .about-header h1 {
          font-size: 28px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 4px;
        }
        .about-header p {
          font-size: 13.5px;
          color: var(--text-secondary);
          margin: 0;
        }

        /* Redesigned Bio Card */
        .about-bio-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 20px 24px;
          display: flex;
          align-items: center;
          gap: 20px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
        }
        .about-bio-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--primary-blue);
          box-shadow: 0 0 12px color-mix(in srgb, var(--primary-blue) 30%, transparent);
          flex-shrink: 0;
        }
        .about-bio-content {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .about-bio-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
          line-height: 1.3;
        }
        .about-bio-title span {
          color: var(--primary-blue);
          font-weight: 600;
        }
        .about-bio-text {
          font-size: 13.5px;
          line-height: 1.6;
          color: var(--text-secondary);
          margin: 0;
        }

        /* Unified Contact Links */
        .contact-row {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .contact-chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          padding: 8px 16px;
          border-radius: 999px;
          text-decoration: none;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
        }
        .contact-chip:hover {
          background: var(--bg-primary);
          color: var(--primary-blue);
          border-color: var(--primary-blue);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px color-mix(in srgb, var(--primary-blue) 20%, transparent);
        }

        /* Horizontal Career Path Timeline */
        .career-path-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.02);
        }
        .career-path-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }
        .timeline-track-container {
          position: relative;
          padding: 10px 0 6px;
        }
        .timeline-line {
          position: absolute;
          top: 17px;
          left: 40px;
          right: 40px;
          height: 3px;
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
          border-radius: 3px;
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
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--bg-secondary);
          border: 3px solid var(--primary-blue);
          box-shadow: 0 0 0 2px var(--bg-secondary);
          transition: all 0.25s ease;
          margin-bottom: 10px;
        }
        .timeline-node-item:hover .timeline-dot {
          transform: scale(1.3);
          box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary-blue) 30%, transparent);
        }
        .timeline-dot.active {
          width: 20px;
          height: 20px;
          background: var(--primary-blue);
          border: 3px solid #ffffff;
          box-shadow: 0 0 0 3px var(--primary-blue), 0 0 14px color-mix(in srgb, var(--primary-blue) 50%, transparent);
          margin-top: -2px;
          margin-bottom: 8px;
        }
        .timeline-dot.pending {
          width: 18px;
          height: 18px;
          background: transparent;
          border: 2px dashed #10b981;
          margin-top: -1px;
          margin-bottom: 9px;
          animation: timelinePulse 2s ease-in-out infinite;
        }
        @keyframes timelinePulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.18); opacity: 0.6; }
        }

        .timeline-node-label {
          font-size: 13px;
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
          font-size: 11px;
          color: var(--text-muted);
          text-align: center;
          margin: 2px 0 0 0;
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
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .title-icon-badge {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: color-mix(in srgb, var(--primary-blue) 12%, transparent);
          color: var(--primary-blue);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Hobbies Grid */
        .hobbies-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        .hobby-card {
          display: flex;
          align-items: center;
          gap: 14px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          padding: 18px 20px;
          border-radius: 16px;
          transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
        }
        .hobby-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.04);
          border-color: color-mix(in srgb, var(--primary-blue) 40%, var(--border-color));
        }
        .hobby-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: color-mix(in srgb, var(--primary-blue) 12%, transparent);
          color: var(--primary-blue);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }
        .hobby-card:hover .hobby-icon {
          background: var(--primary-blue);
          color: #ffffff;
        }
        .hobby-info {
          display: flex;
          flex-direction: column;
        }
        .hobby-value {
          font-size: 13.5px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 2px 0;
        }
        .hobby-label {
          font-size: 11.5px;
          color: var(--text-secondary);
          margin: 0;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        .stat-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 6px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.04);
        }
        .stat-value {
          font-size: 22px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }
        .stat-label {
          font-size: 11.5px;
          font-weight: 500;
          color: var(--text-secondary);
          margin: 0;
        }

        /* CTA Section */
        .cta-section {
          background: linear-gradient(145deg, color-mix(in srgb, var(--primary-blue) 8%, var(--bg-secondary)), var(--bg-secondary));
          border: 1px solid color-mix(in srgb, var(--primary-blue) 25%, var(--border-color));
          border-radius: 16px;
          padding: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 8px;
        }
        .cta-text h3 {
          font-size: 17px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 4px 0;
        }
        .cta-text p {
          font-size: 13px;
          color: var(--text-secondary);
          margin: 0;
          max-width: 440px;
          line-height: 1.5;
        }
        .cta-buttons {
          display: flex;
          gap: 10px;
        }
        .cta-btn-primary {
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--primary-blue);
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          padding: 10px 18px;
          border-radius: 10px;
          text-decoration: none;
          transition: all 0.2s;
          box-shadow: 0 4px 14px color-mix(in srgb, var(--primary-blue) 30%, transparent);
        }
        .cta-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px color-mix(in srgb, var(--primary-blue) 40%, transparent);
          color: #fff;
        }
        .cta-btn-secondary {
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-size: 13px;
          font-weight: 600;
          padding: 10px 18px;
          border-radius: 10px;
          border: 1px solid var(--border-color);
          text-decoration: none;
          transition: all 0.2s;
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

        {/* Intro / Bio Card */}
        <motion.div className="about-bio-card" variants={itemVariants}>
          <img src="/profile_photo.png" alt="Thota Sujith Reddy" className="about-bio-avatar" />
          <div className="about-bio-content">
            <h2 className="about-bio-title">
              Thota Sujith Reddy — <span>B.Tech Computer Science at VIT Vellore (8.7 CGPA)</span>
            </h2>
            <p className="about-bio-text">
              Currently pursuing Computer Science &amp; Engineering with a specialization in <strong>Data Science</strong>. 
              I bridge the gap between complex backend data structures and sleek, responsive frontend user interfaces, 
              striving to build applications that are as intelligent as they are beautiful.
            </p>
          </div>
        </motion.div>

        {/* Contact Links (Unified Chips) */}
        <motion.div className="contact-row" variants={itemVariants}>
          <a href="mailto:sujithreddy1546@gmail.com" className="contact-chip">
            <Mail size={15} /> sujithreddy1546@gmail.com
          </a>
          <a href="https://linkedin.com/in/thota-sujith-reddy" target="_blank" rel="noreferrer" className="contact-chip">
            <FaLinkedin size={15} /> LinkedIn
          </a>
          <a href="https://github.com/sujith1546" target="_blank" rel="noreferrer" className="contact-chip">
            <FaGithub size={15} /> GitHub
          </a>
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

        {/* Hobbies Section Title */}
        <motion.h2 className="about-section-title" variants={itemVariants}>
          <div className="title-icon-badge">
            <Coffee size={16} />
          </div>
          Beyond the Code
        </motion.h2>

        {/* Hobbies Grid */}
        <motion.div className="hobbies-grid" variants={containerVariants}>
          {HOBBIES.map(hobby => {
            const Icon = hobby.icon;
            return (
              <motion.div key={hobby.label} className="hobby-card" variants={itemVariants}>
                <div className="hobby-icon">
                  <Icon size={19} strokeWidth={2} />
                </div>
                <div className="hobby-info">
                  <p className="hobby-value">{hobby.value}</p>
                  <p className="hobby-label">{hobby.label}</p>
                </div>
              </motion.div>
            );
          })}
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

        {/* Call to Action Banner */}
        <motion.div className="cta-section" variants={itemVariants}>
          <div className="cta-text">
            <h3>Let's build something great.</h3>
            <p>I'm always open to discussing Data Science, Machine Learning architecture, or exciting new engineering opportunities.</p>
          </div>
          <div className="cta-buttons">
            <a href="#contact" onClick={handleGetInTouch} className="cta-btn-primary">
              Get in Touch <ArrowRight size={16} />
            </a>
            <a href="/resume.pdf" className="cta-btn-secondary" onClick={handleDownloadClick}>
              <Download size={16} /> Resume
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
