import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

const data = [
  { subject: 'React/UI', A: 95, fullMark: 100 },
  { subject: 'Backend', A: 85, fullMark: 100 },
  { subject: 'AI/ML', A: 90, fullMark: 100 },
  { subject: 'DevOps', A: 75, fullMark: 100 },
  { subject: 'System Design', A: 80, fullMark: 100 },
  { subject: 'Databases', A: 85, fullMark: 100 },
];

export default function SkillChart() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: 'spring' }}
      className="genui-skill-chart"
    >
      <div className="genui-header">
        <div className="genui-dot" style={{ background: '#10b981' }}></div>
        <span>Interactive Skill Matrix</span>
      </div>
      <div style={{ width: '100%', height: 250 }}>
        <ResponsiveContainer>
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="var(--border-color)" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
            <Tooltip 
              contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '12px' }}
              itemStyle={{ color: '#10b981' }}
            />
            <Radar name="Proficiency" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      
      <style>{`
        .genui-skill-chart {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          margin: 16px 0;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
        }
        [data-theme="dark"] .genui-skill-chart {
          background: rgba(20,20,20,0.5);
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .genui-header {
          display: flex;
          align-items: center;
          gap: 8px;
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
          box-shadow: 0 0 10px #10b981;
        }
      `}</style>
    </motion.div>
  );
}
