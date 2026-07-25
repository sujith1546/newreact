import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Briefcase, Code, BrainCircuit, Activity, Database, Server, Cpu, Star, Zap } from 'lucide-react';

const ICON_MAP = {
  GraduationCap: <GraduationCap size={18} />,
  Briefcase: <Briefcase size={18} />,
  Code: <Code size={18} />,
  BrainCircuit: <BrainCircuit size={18} />,
  Activity: <Activity size={18} />,
  Database: <Database size={18} />,
  Server: <Server size={18} />,
  Cpu: <Cpu size={18} />,
  Star: <Star size={18} />,
  Zap: <Zap size={18} />
};

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];

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

export default function BentoBox({ data = [] }) {
  if (!data || data.length === 0) return null;
  
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
      
      {data.map((item, idx) => {
        const color = COLORS[idx % COLORS.length];
        const icon = ICON_MAP[item.icon] || <Star size={18} />;
        
        return (
          <motion.div key={idx} variants={itemVariants} className="bento-card">
            <div className="bento-glow" style={{ background: color }} />
            <div className="bento-icon-wrapper" style={{ background: `${color}15`, color: color }}>
              {icon}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span className="bento-title">{item.title}</span>
              <span className="bento-value">{item.value}</span>
              <span className="bento-subtitle">{item.subtitle}</span>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
