import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Mail, School, Check, Copy, FileText, Briefcase, Award } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { useTheme } from '../context/ThemeContext';
import useGlitchText from '../hooks/useGlitchText';

// 1. Terminal Banner Component
function TerminalBanner() {
  const [text, setText] = useState('');
  const fullText = "> initializing env... OK\\n> loading brain.exe...\\n> ready to build.";
  
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(timer);
    }, 40);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="profile-terminal-banner">
      <div className="terminal-dots">
        <span style={{background: '#ff5f56'}} />
        <span style={{background: '#ffbd2e'}} />
        <span style={{background: '#27c93f'}} />
      </div>
      <pre>
        <code>{text}<span className="terminal-cursor">_</span></code>
      </pre>
    </div>
  );
}

// 3. Activity Heatmap
function ActivityHeatmap() {
  
  // Generate random heatmap data to look like GitHub contributions
  const [data] = useState(() => {
    const grid = [];
    for (let col = 0; col < 18; col++) {
      const column = [];
      for (let row = 0; row < 5; row++) {
        const intensity = Math.random() > 0.4 ? Math.floor(Math.random() * 4) + 1 : 0;
        column.push(intensity);
      }
      grid.push(column);
    }
    return grid;
  });

  const getColor = (intensity) => {
    if (intensity === 0) return 'var(--border-color)';
    return `var(--primary-blue)`; 
  };

  return (
    <div className="heatmap-container">
      <p className="section-label" style={{ marginBottom: '12px', paddingLeft: 0 }}>Recent Activity</p>
      <div className="heatmap-grid" style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '4px' }}>
        {data.map((col, cIdx) => (
          <div key={cIdx} className="heatmap-col" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {col.map((intensity, rIdx) => (
              <div 
                key={rIdx} 
                className="heatmap-cell"
                style={{
                  width: '10px', height: '10px', borderRadius: '2px',
                  backgroundColor: getColor(intensity),
                  opacity: intensity === 0 ? 0.3 : (intensity * 0.25) + 0.25
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// 5. Skill Radar
function SkillRadar() {
  const data = [
    { subject: 'Frontend', A: 90, fullMark: 100 },
    { subject: 'Backend', A: 85, fullMark: 100 },
    { subject: 'ML/AI', A: 95, fullMark: 100 },
    { subject: 'Data Sci', A: 88, fullMark: 100 },
    { subject: 'DevOps', A: 75, fullMark: 100 },
  ];

  return (
    <div className="radar-container" style={{ height: '220px', width: '100%', marginTop: '16px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="var(--border-color)" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 600 }} 
          />
          <Radar 
            name="Skills" 
            dataKey="A" 
            stroke="var(--primary-blue)" 
            fill="var(--primary-blue)" 
            fillOpacity={0.4} 
            animationDuration={1500}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Main AdvancedProfile component
export default function AdvancedProfile({ isOpen, onClose, playSound, triggerEvent, handleExploreClick }) {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = () => {
    playSound();
    navigator.clipboard.writeText('sujithreddy1546@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const nameText = useGlitchText("Sujith Thota", 200);
  const titleText = useGlitchText("Data Science & Full Stack", 400);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="more-overlay-backdrop"
            style={{ zIndex: 102 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="profile-overlay-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="profileTitle"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} // Springier easing
          >
            <div className="profile-header">
              <h3 id="profileTitle">My Profile</h3>
              <button 
                className="drawer-close-btn" 
                onClick={onClose}
                aria-label="Close profile"
                style={{ position: 'static', transform: 'none' }}
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
            
            <div className="drawer-scroll-area" style={{ padding: '0', display: 'flex', flexDirection: 'column' }}>
              
              <TerminalBanner />
              
              {/* Holographic ID Card Area */}
              <div style={{ perspective: '1000px', padding: '0 20px', marginTop: '-30px' }}>
                <div 
                  className="profile-identity holographic-card"
                  style={{
                    position: 'relative',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '24px',
                    padding: '24px',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.1)',
                    overflow: 'hidden'
                  }}
                >
                  <div className="avatar-row" style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px' }}>
                    <div className="profile-avatar-square" style={{ width: '84px', height: '84px', borderRadius: '24px', overflow: 'hidden', border: '2px solid var(--primary-blue)', flexShrink: 0 }}>
                      <img id="profile-avatar-img" src="/profile_photo.png" alt="Sujith Thota" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  </div>

                  <p className="profile-name" style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>{nameText}</p>
                  <p className="profile-title" style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 20px 0' }}>{titleText}</p>

                  <div className="stats-row" style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                    <div className="stat-tile" style={{ textAlign: 'center' }}>
                      <p className="value" style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>8.7</p>
                      <p className="label" style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: '4px' }}>VIT CGPA</p>
                    </div>
                    <div className="stat-tile" style={{ textAlign: 'center' }}>
                      <p className="value" style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>15+</p>
                      <p className="label" style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: '4px' }}>Certs</p>
                    </div>
                    <div className="stat-tile" style={{ textAlign: 'center' }}>
                      <p className="value" style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>5+</p>
                      <p className="label" style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: '4px' }}>ML Projs</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Visualization Section */}
              <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '32px' }}>
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
                  <ActivityHeatmap />
                </div>
                
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
                  <p className="section-label" style={{ paddingLeft: 0, marginBottom: '0' }}>Technical Proficiency</p>
                  <SkillRadar />
                </div>
              </div>

              {/* Details & Contacts */}
              <div className="profile-identity" style={{ marginTop: '32px', transform: 'none', background: 'transparent', borderTop: '1px solid var(--border-color)', borderRadius: 0, paddingTop: '24px', paddingBottom: '32px', paddingLeft: '20px', paddingRight: '20px' }}>
                <p className="section-label" style={{ padding: '0', marginBottom: '16px' }}>Details</p>
                
                <div className="detail-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="detail-row" style={{ display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '13.5px' }}>
                    <School size={16} aria-hidden="true" />
                    <span>B.Tech CSE, VIT University, Vellore</span>
                  </div>
                  <div className="detail-row" style={{ display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '13.5px' }}>
                    <MapPin size={16} aria-hidden="true" />
                    <span>Vellore, India</span>
                  </div>
                  <div className="detail-row" style={{ display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '13.5px' }}>
                    <Mail size={16} aria-hidden="true" />
                    <span className="email-link" style={{ color: 'var(--primary-blue)', fontWeight: 600 }}>sujithreddy1546@gmail.com</span>
                    {copiedEmail ? (
                      <Check size={14} className="copy-icon" style={{ color: '#10b981', marginLeft: 'auto' }} />
                    ) : (
                      <Copy size={14} className="copy-icon" onClick={handleCopyEmail} aria-label="Copy email" style={{ cursor: 'pointer', marginLeft: 'auto' }} />
                    )}
                  </div>
                </div>

                <div className="explore-section" style={{ marginTop: '32px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
                  <p className="section-label" style={{ padding: 0, marginBottom: '16px' }}>Explore</p>
                  <div className="drawer-explore-row" style={{ padding: 0 }}>
                    <button className="drawer-explore-item" onClick={() => handleExploreClick('experience')}>
                      <div className="drawer-item-box"><Briefcase size={20} /></div>
                      <span>Experience</span>
                    </button>
                    <button className="drawer-explore-item" onClick={() => handleExploreClick('certifications')}>
                      <div className="drawer-item-box"><Award size={20} /></div>
                      <span>Certs</span>
                    </button>
                    <button className="drawer-explore-item" onClick={() => handleExploreClick('github')}>
                      <div className="drawer-item-box"><FaGithub size={20} /></div>
                      <span>GitHub</span>
                    </button>
                    <button className="drawer-explore-item" onClick={() => { playSound(); onClose(); triggerEvent('open-resume'); }}>
                      <div className="drawer-item-box"><FileText size={20} /></div>
                      <span>Resume</span>
                    </button>
                  </div>
                </div>
              </div>
              
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
