import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Briefcase, Code, BrainCircuit } from 'lucide-react';

const bentoItems = [
  {
    id: 1,
    title: 'Academics',
    value: '8.7 CGPA',
    subtitle: 'B.Tech @ VIT Vellore',
    icon: <GraduationCap size={18} />,
    color: '#3b82f6', // Blue
  },
  {
    id: 2,
    title: 'Experience',
    value: '4+ Projects',
    subtitle: 'Full-stack & AI',
    icon: <Briefcase size={18} />,
    color: '#8b5cf6', // Purple
  },
  {
    id: 3,
    title: 'Core Stack',
    value: 'Python, React',
    subtitle: 'Modern web & backend',
    icon: <Code size={18} />,
    color: '#10b981', // Green
  },
  {
    id: 4,
    title: 'Specialty',
    value: 'Data & GenAI',
    subtitle: 'RAG, NLP, ML',
    icon: <BrainCircuit size={18} />,
    color: '#f59e0b', // Amber
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export default function BentoBox() {
  return (
    <motion.div
      className="bento-container"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <style>{`
        .bento-container {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-top: 12px;
          margin-bottom: 12px;
          width: 100%;
        }
        .bento-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        [data-theme="light"] .bento-card {
          background: rgba(0, 0, 0, 0.02);
          border-color: rgba(0, 0, 0, 0.05);
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        }
        .bento-icon-wrapper {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;
        }
        .bento-title {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-secondary);
        }
        .bento-value {
          font-size: 15px;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1.2;
        }
        .bento-subtitle {
          font-size: 11px;
          color: var(--text-secondary);
        }
        .bento-glow {
          position: absolute;
          top: -20px;
          right: -20px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          filter: blur(20px);
          opacity: 0.15;
        }
      `}</style>
      
      {bentoItems.map((item) => (
        <motion.div key={item.id} variants={itemVariants} className="bento-card">
          <div className="bento-glow" style={{ background: item.color }} />
          <div className="bento-icon-wrapper" style={{ background: `${item.color}15`, color: item.color }}>
            {item.icon}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span className="bento-title">{item.title}</span>
            <span className="bento-value">{item.value}</span>
            <span className="bento-subtitle">{item.subtitle}</span>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
