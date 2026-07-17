import { motion } from 'framer-motion';
import ScrollReveal from '../components/ScrollReveal';
import { skillCategories } from '../data/skillsData';
import { categoryIconMap } from '../components/skillIcons';
import SkillTooltip from '../components/SkillTooltip';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

export default function Skills() {
  return (
    <ScrollReveal>
      <style>{`
        .skills-page {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* Header */
        .skills-header {
          margin-bottom: 8px;
        }
        .skills-header h1 {
          font-size: 28px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 5px;
        }
        .skills-header p {
          font-size: 13.5px;
          color: var(--text-secondary);
          margin: 0;
        }

        /* Categories Grid */
        .skills-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }
        
        .skill-category-card {
          background: var(--bg-secondary);
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.02);
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
          display: flex;
          flex-direction: column;
        }
        
        .skill-category-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.06);
          border-color: #d1d5db;
        }
        
        .skill-category-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }
        
        .skill-category-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: #f3f4f6;
          color: #111827;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        
        .skill-category-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }
        
        .skill-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        
        .skill-pill {
          display: inline-block;
          font-size: 12px;
          font-weight: 600;
          background: #f9fafb;
          color: #4b5563;
          border: 1px solid #e5e7eb;
          padding: 6px 14px;
          border-radius: 999px;
          transition: all 0.2s ease;
          cursor: crosshair;
        }
        
        .skill-pill:hover {
          background: #111827;
          color: #fff;
          border-color: #111827;
        }

        /* Dark Mode Overrides */
        [data-theme="dark"] .skill-category-card { border-color: #374151; }
        [data-theme="dark"] .skill-category-card:hover { border-color: #4b5563; }
        [data-theme="dark"] .skill-category-icon { background: #374151; color: #f3f4f6; }
        [data-theme="dark"] .skill-pill { 
          background: rgba(255, 255, 255, 0.03); 
          color: #d1d5db; 
          border-color: #374151; 
        }
        [data-theme="dark"] .skill-pill:hover { 
          background: #f3f4f6; 
          color: #111827; 
          border-color: #f3f4f6; 
        }

        /* Responsive */
        @media (max-width: 768px) {
          .skills-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <motion.div 
        className="skills-page"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="skills-header" variants={itemVariants}>
          <h1>Skills & Expertise</h1>
          <p>A look at the technologies and tools I work with</p>
        </motion.div>

        <motion.div className="skills-grid" variants={containerVariants}>
          {skillCategories.map(category => {
            const Icon = categoryIconMap[category.id] || categoryIconMap.languages;
            
            // The last category "exploring" is rendered a bit differently if we want it full width, 
            // but for simplicity and consistency with the provided data, we can just render it as a card.
            // We'll give it a full row span if it's the 5th item.
            const isFullWidth = category.id === 'exploring';
            
            return (
              <motion.div 
                key={category.id} 
                className="skill-category-card" 
                style={isFullWidth ? { gridColumn: '1 / -1', marginTop: '-4px' } : {}}
                variants={itemVariants}
              >
                <div className="skill-category-header">
                  <div className="skill-category-icon">
                    <Icon size={22} style={{ strokeWidth: 1.5 }} />
                  </div>
                  <h2 className="skill-category-title">{category.title}</h2>
                </div>
                
                <div className="skill-pills">
                  {category.skills.map(skill => (
                    <SkillTooltip key={skill.id} skill={skill}>
                      <span className="skill-pill">
                        {skill.name}
                      </span>
                    </SkillTooltip>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

      </motion.div>
    </ScrollReveal>
  );
}
