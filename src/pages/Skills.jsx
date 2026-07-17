import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollReveal from '../components/ScrollReveal';
import { skillCategories } from '../data/skillsData';
import { categoryIconMap } from '../components/skillIcons';
import SkillTooltip from '../components/SkillTooltip';
import { ChevronDown, ChevronUp, Calendar, Briefcase, Award } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState('languages');
  const [expandedSkill, setExpandedSkill] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activeCategory = skillCategories.find(c => c.id === activeTab) || skillCategories[0];
  const ActiveIcon = categoryIconMap[activeCategory.id] || categoryIconMap.languages;

  const toggleSkill = (skillId) => {
    if (expandedSkill === skillId) {
      setExpandedSkill(null);
    } else {
      setExpandedSkill(skillId);
    }
  };

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
           MOBILE SEGMENTED CONTROLS & CARDS (<= 900px)
           ============================================ */
        @media (max-width: 900px) {
          .skills-header {
            text-align: left;
          }

          .mobile-tabs-container {
            width: 100%;
            overflow-x: auto;
            padding-bottom: 6px;
            margin-bottom: 12px;
            display: flex;
            gap: 8px;
            scrollbar-width: none; /* Hide scrollbar for Firefox */
            -webkit-overflow-scrolling: touch;
          }
          .mobile-tabs-container::-webkit-scrollbar {
            display: none; /* Hide scrollbar for Chrome/Safari */
          }

          .mobile-tab-btn {
            white-space: nowrap;
            border: 1px solid var(--border-color);
            background: var(--bg-secondary);
            color: var(--text-secondary);
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12.5px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            outline: none;
          }

          .mobile-tab-btn.active {
            background: var(--primary-blue);
            color: white;
            border-color: var(--primary-blue);
            box-shadow: 0 4px 12px rgba(0, 123, 255, 0.2);
          }

          .mobile-skills-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
            width: 100%;
          }

          .mobile-skill-card {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 16px;
            box-shadow: var(--shadow-sm);
            text-align: left;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            cursor: pointer;
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
            gap: 12px;
          }

          .mobile-skill-avatar {
            width: 36px;
            height: 36px;
            border-radius: 10px;
            background: rgba(0, 123, 255, 0.05);
            color: var(--primary-blue);
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .mobile-skill-name {
            font-size: 14.5px;
            font-weight: 700;
            color: var(--text-primary);
            margin: 0;
          }

          .mobile-skill-level {
            font-size: 11px;
            font-weight: 600;
            color: var(--primary-blue);
            background: rgba(0, 123, 255, 0.08);
            padding: 2px 8px;
            border-radius: 12px;
          }

          .mobile-skill-card-arrow {
            color: var(--text-secondary);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s ease;
          }

          .mobile-skill-card-arrow.expanded {
            transform: rotate(180deg);
          }

          .mobile-skill-details-panel {
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid var(--border-color);
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .details-metric-row {
            display: flex;
            gap: 16px;
          }

          .details-metric {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 11.5px;
            color: var(--text-secondary);
            font-weight: 550;
          }

          .details-metric svg {
            color: var(--primary-blue);
          }

          .details-progress-bar-wrap {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }

          .details-progress-bar-header {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            font-weight: 600;
            color: var(--text-secondary);
          }

          .details-progress-track {
            height: 6px;
            background: var(--bg-primary);
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
            margin: 4px 0 0 0;
          }

          .details-tag-row {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 4px;
          }

          .details-tool-tag {
            font-size: 10px;
            font-weight: 600;
            background: var(--bg-primary);
            color: var(--text-secondary);
            border: 1px solid var(--border-color);
            padding: 3px 8px;
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
          /* Mobile app tab interface */
          <motion.div className="mobile-skills-section" variants={containerVariants}>
            
            {/* Horizontal Tabs Bar */}
            <div className="mobile-tabs-container">
              {skillCategories.map(category => (
                <button
                  key={category.id}
                  onClick={() => {
                    setActiveTab(category.id);
                    setExpandedSkill(null);
                  }}
                  className={`mobile-tab-btn ${activeTab === category.id ? 'active' : ''}`}
                >
                  {category.title}
                </button>
              ))}
            </div>

            {/* Selected category skills feed */}
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeTab}
                className="mobile-skills-list"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeCategory.skills.map(skill => {
                  const isExpanded = expandedSkill === skill.id;
                  
                  return (
                    <div 
                      key={skill.id} 
                      className="mobile-skill-card"
                      onClick={() => toggleSkill(skill.id)}
                    >
                      <div className="mobile-skill-card-top">
                        <div className="mobile-skill-card-left">
                          <div className="mobile-skill-avatar">
                            <ActiveIcon size={18} />
                          </div>
                          <h4 className="mobile-skill-name">{skill.name}</h4>
                          {skill.level && <span className="mobile-skill-level">{skill.level}</span>}
                        </div>
                        <div className={`mobile-skill-card-arrow ${isExpanded ? 'expanded' : ''}`}>
                          <ChevronDown size={18} />
                        </div>
                      </div>

                      {/* Expandable Info block */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div 
                            className="mobile-skill-details-panel"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                          >
                            <div className="details-metric-row">
                              {skill.years > 0 && (
                                <div className="details-metric">
                                  <Calendar size={14} />
                                  <span>{skill.years} {skill.years === 1 ? 'Year' : 'Years'} Exp</span>
                                </div>
                              )}
                              {skill.projectCount > 0 && (
                                <div className="details-metric">
                                  <Briefcase size={14} />
                                  <span>{skill.projectCount} {skill.projectCount === 1 ? 'Project' : 'Projects'}</span>
                                </div>
                              )}
                            </div>

                            {skill.percent && (
                              <div className="details-progress-bar-wrap">
                                <div className="details-progress-bar-header">
                                  <span>Proficiency</span>
                                  <span>{skill.percent}%</span>
                                </div>
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
                          </motion.div>
                        )}
                      </AnimatePresence>

                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>

          </motion.div>
        )}

      </motion.div>
    </ScrollReveal>
  );
}
