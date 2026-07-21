import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ExternalLink, Github } from 'lucide-react';

const projects = [
  {
    id: 1,
    title: 'Financial Sentiment Analysis',
    desc: 'Advanced NLP pipeline analyzing stock market sentiment using FinBERT and real-time Twitter data.',
    tags: ['Python', 'Transformers', 'React'],
    color: '#3b82f6'
  },
  {
    id: 2,
    title: 'Atom AI Workspace',
    desc: 'Autonomous multi-agent desktop environment featuring local RAG and GenUI capabilities.',
    tags: ['React', 'Electron', 'Node.js'],
    color: '#10b981'
  },
  {
    id: 3,
    title: 'Nexus Data Platform',
    desc: 'High-throughput real-time data streaming and analytics pipeline built for enterprise scale.',
    tags: ['Go', 'Kafka', 'PostgreSQL'],
    color: '#8b5cf6'
  }
];

export default function ProjectCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => setCurrentIndex((prev) => (prev + 1) % projects.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="genui-project-carousel"
    >
      <div className="carousel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="genui-dot" style={{ background: projects[currentIndex].color }}></div>
          <span>Featured Projects</span>
        </div>
        <div className="carousel-controls">
          <button onClick={prev}><ChevronLeft size={16} /></button>
          <button onClick={next}><ChevronRight size={16} /></button>
        </div>
      </div>
      
      <div className="carousel-body">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="carousel-card"
          >
            <h3>{projects[currentIndex].title}</h3>
            <p>{projects[currentIndex].desc}</p>
            <div className="carousel-tags">
              {projects[currentIndex].tags.map(t => (
                <span key={t}>{t}</span>
              ))}
            </div>
            <div className="carousel-actions">
              <button><Github size={14} /> Source</button>
              <button><ExternalLink size={14} /> Live Demo</button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <style>{`
        .genui-project-carousel {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          margin: 16px 0;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
        }
        [data-theme="dark"] .genui-project-carousel {
          background: rgba(20,20,20,0.5);
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .carousel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 14px;
          border-bottom: 1px solid var(--border-color);
          background: rgba(128,128,128,0.05);
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-secondary);
        }
        .genui-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          transition: background 0.3s;
        }
        .carousel-controls button {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 2px;
          border-radius: 4px;
        }
        .carousel-controls button:hover {
          background: rgba(128,128,128,0.2);
        }
        .carousel-body {
          padding: 20px;
          min-height: 160px;
        }
        .carousel-card h3 {
          margin: 0 0 8px 0;
          font-size: 16px;
          color: var(--text-primary);
        }
        .carousel-card p {
          margin: 0 0 16px 0;
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.5;
        }
        .carousel-tags {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
        }
        .carousel-tags span {
          font-size: 10px;
          padding: 4px 8px;
          background: rgba(128,128,128,0.1);
          border-radius: 12px;
          color: var(--text-secondary);
          font-weight: 600;
        }
        .carousel-actions {
          display: flex;
          gap: 12px;
        }
        .carousel-actions button {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 6px;
          border: 1px solid var(--border-color);
          background: var(--bg-secondary);
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.2s;
        }
        .carousel-actions button:hover {
          background: var(--text-primary);
          color: var(--bg-primary);
        }
      `}</style>
    </motion.div>
  );
}
