import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  const [activeTab, setActiveTab] = useState(null); // null means drawer is closed

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activeCategory = skillCategories.find(c => c.id === activeTab) || skillCategories[0];
  const ActiveIcon = categoryIconMap[activeCategory.id] || categoryIconMap.languages;

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

        /* Categories Grid (Desktop) */
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

          /* ============================================
           MOBILE BENTO GRID & DRAWER (<= 900px)
           ============================================ */
        @media (max-width: 900px) {
          .skills-header {
            text-align: left;
          }

          .mobile-bento-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
            width: 100%;
          }

          .bento-card {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 18px;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            cursor: pointer;
            box-shadow: var(--shadow-sm);
            text-align: left;
            transition: transform 0.2s;
            outline: none;
          }

          .bento-card:active {
            transform: scale(0.96);
          }

          .bento-icon-box {
            width: 40px;
            height: 40px;
            border-radius: 12px;
            background: rgba(0, 123, 255, 0.08);
            color: var(--primary-blue);
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .bento-title {
            font-size: 15px;
            font-weight: 700;
            color: var(--text-primary);
            margin: 0;
            line-height: 1.2;
          }

          .bento-pills-preview {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
            margin-top: auto;
          }

          .bento-mini-pill {
            font-size: 9px;
            font-weight: 600;
            background: var(--bg-primary);
            color: var(--text-secondary);
            padding: 2px 6px;
            border-radius: 6px;
            border: 1px solid var(--border-color);
          }

          /* Drawer Styles */
          .skills-drawer-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.6);
            z-index: 1000;
          }

          .skills-drawer-sheet {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: var(--bg-primary);
            border-top-left-radius: 24px;
            border-top-right-radius: 24px;
            z-index: 1001;
            padding: 24px 20px 40px 20px;
            height: 85vh; /* Consistent size for stable y:100% animation */
            height: 85dvh;
            display: flex;
            flex-direction: column;
            box-shadow: 0 -10px 40px rgba(0,0,0,0.1);
          }

          .skills-drawer-handle {
            width: 40px;
            height: 4px;
            background: #d1d5db;
            border-radius: 2px;
            margin: 0 auto 20px auto;
            flex-shrink: 0;
          }

          .skills-drawer-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20px;
            flex-shrink: 0;
          }

          .skills-drawer-title-row {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .skills-drawer-title-row h2 {
            font-size: 20px;
            font-weight: 700;
            color: var(--text-primary);
            margin: 0;
          }

          .skills-drawer-close {
            width: 32px;
            height: 32px;
            border-radius: 16px;
            background: var(--bg-secondary);
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-primary);
            flex-shrink: 0;
          }

          .skills-drawer-content {
            overflow-y: auto;
            flex: 1 1 auto;
            min-height: 0;
            display: flex;
            flex-direction: column;
            gap: 12px;
            padding-bottom: 20px;
          }
          .skills-drawer-content::-webkit-scrollbar {
            display: none;
          }

          .mobile-skill-card {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .mobile-skill-card-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
          }

          .mobile-skill-card-left {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .mobile-skill-name {
            font-size: 14px;
            font-weight: 700;
            color: var(--text-primary);
            margin: 0;
          }

          .mobile-skill-level {
            font-size: 10.5px;
            font-weight: 600;
            color: var(--primary-blue);
            background: rgba(0, 123, 255, 0.08);
            padding: 3px 8px;
            border-radius: 12px;
          }

          .details-progress-bar-wrap {
            display: flex;
            flex-direction: column;
            gap: 4px;
            margin-top: 2px;
          }

          .details-progress-track {
            height: 6px;
            background: var(--bg-secondary);
            border-radius: 3px;
            overflow: hidden;
            width: 100%;
          }

          .details-progress-fill {
            height: 100%;
            background: var(--primary-blue);
            border-radius: 3px;
          }

          .details-description {
            font-size: 12.5px;
            line-height: 1.5;
            color: var(--text-secondary);
            margin: 0;
          }

          .details-tag-row {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
          }

          .details-tool-tag {
            font-size: 10px;
            font-weight: 600;
            background: var(--bg-primary);
            color: var(--text-secondary);
            border: 1px solid var(--border-color);
            padding: 4px 8px;
            border-radius: 6px;
          }
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

        {!isMobile ? (
          /* Desktop categories card grid */
          <motion.div className="skills-grid" variants={containerVariants}>
            {skillCategories.map(category => {
              const Icon = categoryIconMap[category.id] || categoryIconMap.languages;
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
        ) : (
          /* Mobile Bento Grid Category Selector */
          <motion.div className="mobile-bento-grid" variants={containerVariants}>
            {skillCategories.map(category => {
              const CategoryIcon = categoryIconMap[category.id] || categoryIconMap.languages;
              const isFullWidth = category.id === 'exploring';

              return (
                <button 
                  key={category.id} 
                  className="bento-card"
                  style={isFullWidth ? { gridColumn: '1 / -1' } : {}}
                  onClick={() => setActiveTab(category.id)}
                >
                  <div className="bento-icon-box">
                    <CategoryIcon size={20} />
                  </div>
                  <h3 className="bento-title">{category.title}</h3>
                  <div className="bento-pills-preview">
                    {category.skills.slice(0, 4).map(skill => (
                      <span key={skill.id} className="bento-mini-pill">
                        {skill.name}
                      </span>
                    ))}
                    {category.skills.length > 4 && (
                      <span className="bento-mini-pill">+{category.skills.length - 4}</span>
                    )}
                  </div>
                </button>
              );
            })}

            {/* Slide-Up Drawer for Selected Category */}
            {typeof document !== 'undefined' && createPortal(
              <AnimatePresence>
                {activeTab && (
                  <div style={{ position: 'relative', zIndex: 9999 }}>
                    <motion.div
                      className="skills-drawer-overlay"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setActiveTab(null)}
                    />
                    <motion.div
                      className="skills-drawer-sheet"
                      initial={{ y: '100%' }}
                      animate={{ y: 0 }}
                      exit={{ y: '100%' }}
                      transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                    >
                      <div className="skills-drawer-handle" />
                      
                      <div className="skills-drawer-header">
                        <div className="skills-drawer-title-row">
                          <div className="bento-icon-box" style={{ width: 32, height: 32 }}>
                            {(() => {
                              const Icon = categoryIconMap[activeTab] || categoryIconMap.languages;
                              return <Icon size={16} />;
                            })()}
                          </div>
                          <h2>{skillCategories.find(c => c.id === activeTab)?.title}</h2>
                        </div>
                        <button className="skills-drawer-close" onClick={() => setActiveTab(null)}>
                          <X size={18} />
                        </button>
                      </div>

                      <div className="skills-drawer-content">
                        {skillCategories.find(c => c.id === activeTab)?.skills.map(skill => (
                          <div key={skill.id} className="mobile-skill-card">
                            <div className="mobile-skill-card-top">
                              <div className="mobile-skill-card-left">
                                <h4 className="mobile-skill-name">{skill.name}</h4>
                              </div>
                              {skill.level && <span className="mobile-skill-level">{skill.level}</span>}
                            </div>

                            {skill.percent && (
                              <div className="details-progress-bar-wrap">
                                <div className="details-progress-track">
                                  <div 
                                    className="details-progress-fill" 
                                    style={{ width: `${skill.percent}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            {skill.description && (
                              <p className="details-description">{skill.description}</p>
                            )}

                            {skill.relatedTools && skill.relatedTools.length > 0 && (
                              <div className="details-tag-row">
                                {skill.relatedTools.map(tool => (
                                  <span key={tool} className="details-tool-tag">{tool}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>,
              document.body
            )}
          </motion.div>
        )}

      </motion.div>
    </ScrollReveal>
  );
}
