import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Coffee, BookOpen, Dumbbell, Compass, Gamepad2, Mail, Terminal, Layers, Target, Award, Download, ArrowRight, BarChart2, Loader2, CheckCircle } from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import ScrollReveal from '../components/ScrollReveal';

const HOBBIES = [
  { label: 'Strategic Thinking', value: 'Chess Enthusiast', icon: Gamepad2 },
  { label: 'Continuous Learning', value: 'Avid Reader', icon: BookOpen },
  { label: 'Physical Health', value: 'Fitness & Sports', icon: Dumbbell },
  { label: 'Exploration', value: 'Traveling', icon: Compass }
];

const TIMELINE_NODES = [
  { id: 'gudivada', label: 'Gudivada', tooltip: 'Early Schooling & Foundations' },
  { id: 'vijayawada', label: 'Vijayawada', tooltip: 'Intermediate Education (PCM)' },
  { id: 'vit', label: 'VIT Vellore', tooltip: 'B.Tech Computer Science (8.7 CGPA)' },
  { id: 'ds', label: 'Data Science', tooltip: 'Specialization: ML, Neural Networks & Big Data', highlight: true },
  { id: 'next', label: "What's Next?", tooltip: 'Seeking exciting engineering opportunities!', next: true }
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
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
          height: 100%;
          min-height: calc(100vh - 90px); /* Stretches container to push CTA further down */
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        /* Header & Bio */
        .about-header {
          margin-bottom: 8px;
        }
        .about-header h1 {
          font-size: 28px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 5px;
        }
        .about-header p {
          font-size: 13.5px;
          color: var(--text-secondary);
          margin: 0;
        }
        .about-bio {
          font-size: 13.5px;
          line-height: 1.6;
          color: var(--text-secondary);
          background: var(--bg-secondary);
          border: 1px solid #e5e7eb;
          padding: 14px 20px;
          border-radius: 12px;
          margin: 0;
          box-shadow: 0 2px 10px rgba(0,0,0,0.02);
        }
        .about-bio strong {
          color: #111827;
          font-weight: 600;
        }

        /* Contact Row */
        .contact-row {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .contact-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
          background: var(--bg-secondary);
          border: 1px solid #e5e7eb;
          padding: 6px 14px;
          border-radius: 999px;
          text-decoration: none;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        .contact-pill:hover {
          background: #111827;
          color: #fff !important;
          border-color: #111827;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
        }
        
        a.contact-pill.pill-gmail {
          color: #ea4335; /* Official Gmail Red */
        }
        a.contact-pill.pill-linkedin {
          color: #0a66c2;
        }
        a.contact-pill.pill-github {
          color: #111827;
        }

        /* Micro-Timeline */
        .micro-timeline {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 10px;
          padding: 14px 0; /* More breathing room */
          border-top: 1px dashed #e5e7eb;
          border-bottom: 1px dashed #e5e7eb;
          margin: 12px 0; /* Explicit spacing above and below */
        }
        .mt-node-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .mt-node-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          cursor: help;
        }
        .mt-tooltip {
          position: absolute;
          bottom: calc(100% + 12px);
          left: 50%;
          transform: translateX(-50%) translateY(10px);
          opacity: 0;
          pointer-events: none;
          background: rgba(17, 24, 39, 0.95);
          backdrop-filter: blur(8px);
          color: #fff;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 11.5px;
          font-weight: 500;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          border: 1px solid rgba(255,255,255,0.1);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 10;
        }
        /* Tooltip Arrow */
        .mt-tooltip::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border-width: 5px;
          border-style: solid;
          border-color: rgba(17, 24, 39, 0.95) transparent transparent transparent;
        }
        .mt-node-wrapper:hover .mt-tooltip {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
        .mt-node {
          font-size: 13.5px;
          font-weight: 500;
          color: var(--text-secondary);
          transition: color 0.2s;
        }
        .mt-node-wrapper:hover .mt-node {
          color: #3b82f6; /* Glow on hover */
        }
        .mt-node.highlight {
          color: #111827;
          font-weight: 700;
        }
        .mt-node.next {
          color: #111827;
          font-style: italic;
          font-weight: 600;
        }
        .mt-arrow {
          color: #d1d5db;
          animation: dataFlow 2s infinite ease-in-out;
        }
        @keyframes dataFlow {
          0%, 100% { opacity: 0.4; transform: translateX(0); color: #d1d5db; }
          50% { opacity: 1; transform: translateX(3px); color: #3b82f6; filter: drop-shadow(0 0 4px rgba(59,130,246,0.4)); }
        }

        /* Hobbies Section */
        .about-section-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .hobbies-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        .hobby-card {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--bg-secondary);
          border: 1px solid #e5e7eb;
          padding: 14px 18px; /* Expanded padding for a larger box */
          border-radius: 12px;
          transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
        }
        .hobby-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          border-color: #d1d5db;
        }
        .hobby-icon {
          width: 36px; /* Slightly larger icon wrapper */
          height: 36px;
          border-radius: 8px;
          background: #f3f4f6;
          color: #4b5563;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background 0.2s, color 0.2s;
        }
        .hobby-card:hover .hobby-icon {
          background: #111827;
          color: #fff;
        }
        .hobby-info {
          display: flex;
          flex-direction: column;
        }
        .hobby-value {
          font-size: 13.5px;
          font-weight: 600;
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
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 10px 14px; /* Decreased height by reducing padding */
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 4px; /* Shrunk spacing internally */
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }
        .stat-value {
          font-size: 20px; /* Adjusted font size for compact height */
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
          background: linear-gradient(145deg, rgba(37, 99, 235, 0.05), rgba(79, 70, 229, 0.03));
          border: 1px solid rgba(79, 70, 229, 0.15);
          border-radius: 12px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 32px; /* Set a clean margin to keep good spacing between stats and CTA */
        }
        .cta-text h3 {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 4px 0;
        }
        .cta-text p {
          font-size: 12.5px;
          color: var(--text-secondary);
          margin: 0;
          max-width: 400px;
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
          background: #111827;
          color: #fff;
          font-size: 12.5px;
          font-weight: 600;
          padding: 8px 16px;
          border-radius: 6px;
          text-decoration: none;
          transition: all 0.2s;
        }
        .cta-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          color: #fff;
        }
        .cta-btn-secondary {
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-size: 12.5px;
          font-weight: 600;
          padding: 8px 16px;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
          text-decoration: none;
          transition: all 0.2s;
        }
        .cta-btn-secondary:hover {
          border-color: #d1d5db;
          transform: translateY(-2px);
        }

        /* Dark Mode Overrides */
        [data-theme="dark"] .about-bio { border-color: #374151; }
        [data-theme="dark"] .about-bio strong { color: #f3f4f6; }
        
        [data-theme="dark"] .contact-pill { border-color: #374151; }
        [data-theme="dark"] .contact-pill:hover { 
          background: #f3f4f6; 
          color: #111827 !important; 
          border-color: #f3f4f6; 
        }
        [data-theme="dark"] a.contact-pill.pill-gmail {
          color: #ef4444; /* Brighter red/coral for dark mode readability */
        }
        [data-theme="dark"] a.contact-pill.pill-linkedin {
          color: #3b82f6; /* Brighter blue for dark mode readability */
        }
        [data-theme="dark"] a.contact-pill.pill-github {
          color: #f3f4f6; /* White for dark mode readability */
        }
        
        [data-theme="dark"] .micro-timeline { border-color: #374151; }
        [data-theme="dark"] .mt-node.highlight, [data-theme="dark"] .mt-node.next { color: #f3f4f6; }
        [data-theme="dark"] .mt-node-wrapper:hover .mt-node { color: #60a5fa; }
        
        [data-theme="dark"] .mt-tooltip {
          background: rgba(243, 244, 246, 0.95);
          color: #111827;
          border-color: rgba(0,0,0,0.1);
        }
        [data-theme="dark"] .mt-tooltip::after {
          border-color: rgba(243, 244, 246, 0.95) transparent transparent transparent;
        }
        [data-theme="dark"] .mt-arrow {
          animation-name: dataFlowDark;
        }
        @keyframes dataFlowDark {
          0%, 100% { opacity: 0.4; transform: translateX(0); color: #4b5563; }
          50% { opacity: 1; transform: translateX(3px); color: #60a5fa; filter: drop-shadow(0 0 4px rgba(96,165,250,0.5)); }
        }
        
        [data-theme="dark"] .hobby-card { border-color: #374151; }
        [data-theme="dark"] .hobby-card:hover { border-color: #4b5563; }
        [data-theme="dark"] .hobby-icon { background: #374151; color: #e5e7eb; }
        [data-theme="dark"] .hobby-card:hover .hobby-icon { background: #f3f4f6; color: #111827; }

        [data-theme="dark"] .stat-card { border-color: #374151; }
        [data-theme="dark"] .cta-section { 
          background: linear-gradient(145deg, rgba(37, 99, 235, 0.1), rgba(79, 70, 229, 0.05));
          border-color: rgba(255,255,255,0.08); 
        }
        [data-theme="dark"] .cta-btn-primary { background: #f3f4f6; color: #111827; }
        [data-theme="dark"] .cta-btn-primary:hover { color: #111827; }
        [data-theme="dark"] .cta-btn-secondary { border-color: #374151; }
        [data-theme="dark"] .cta-btn-secondary:hover { border-color: #4b5563; background: rgba(255,255,255,0.03); }

        /* Responsive */
        @media (max-width: 900px) {
          .hobbies-grid { grid-template-columns: repeat(2, 1fr); }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .cta-section { flex-direction: column; text-align: center; gap: 24px; }
          .cta-text p { max-width: 100%; }
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
          <p>Passionate developer crafting digital experiences</p>
        </motion.div>

        {/* Bio */}
        <motion.p className="about-bio" variants={itemVariants}>
          Hello! I'm <strong>Thota Sujith Reddy</strong>, a dedicated B.Tech student at <strong>VIT University, Vellore</strong>. 
          Currently pursuing Computer Science and Engineering with a specialization in <strong>Data Science</strong>. 
          I bridge the gap between complex backend data structures and sleek, responsive frontend user interfaces, 
          striving to build applications that are as intelligent as they are beautiful.
        </motion.p>

        {/* Contact Links */}
        <motion.div className="contact-row" variants={itemVariants}>
          <a href="mailto:sujithreddy1546@gmail.com" className="contact-pill pill-gmail">
            <Mail size={16} /> sujithreddy1546@gmail.com
          </a>
          <a href="https://linkedin.com/in/thota-sujith-reddy" target="_blank" rel="noreferrer" className="contact-pill pill-linkedin">
            <FaLinkedin size={16} /> LinkedIn
          </a>
          <a href="https://github.com/sujith1546" target="_blank" rel="noreferrer" className="contact-pill pill-github">
            <FaGithub size={16} /> GitHub
          </a>
        </motion.div>

        {/* Micro-Timeline */}
        <motion.div className="micro-timeline" variants={itemVariants}>
          {TIMELINE_NODES.map((node, i) => (
            <div key={node.id} className="mt-node-group">
              <div className="mt-node-wrapper">
                <span className={`mt-node ${node.highlight ? 'highlight' : ''} ${node.next ? 'next' : ''}`}>
                  {node.label}
                </span>
                <div className="mt-tooltip">{node.tooltip}</div>
              </div>
              {i < TIMELINE_NODES.length - 1 && (
                <ChevronRight size={14} className="mt-arrow" style={{ animationDelay: `${i * 0.3}s` }} />
              )}
            </div>
          ))}
        </motion.div>

        {/* Section Title */}
        <motion.h2 className="about-section-title" variants={itemVariants}>
          <Coffee size={18} color="#111827" className="title-icon" style={{ fill: 'currentColor', opacity: 0.8 }} />
          Beyond the Code
        </motion.h2>

        {/* Hobbies Grid */}
        <motion.div className="hobbies-grid" variants={containerVariants}>
          {HOBBIES.map(hobby => {
            const Icon = hobby.icon;
            return (
              <motion.div key={hobby.label} className="hobby-card" variants={itemVariants}>
                <div className="hobby-icon">
                  <Icon size={18} strokeWidth={2} />
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
        <motion.h2 className="about-section-title" variants={itemVariants} style={{ marginTop: '8px' }}>
          <BarChart2 size={18} color="#111827" className="title-icon" style={{ fill: 'currentColor', opacity: 0.8 }} />
          By the Numbers
        </motion.h2>

        {/* Quick Stats */}
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

        {/* Call to Action */}
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

        {/* Glassmorphism Download Toast for About Page */}
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
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
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

      </motion.div>
    </ScrollReveal>
  );
}
