import { useState, useEffect } from 'react';
import ScrollReveal from '../components/ScrollReveal';
import { Terminal, Code, Briefcase, Mail, ArrowRight } from 'lucide-react';

const ROLES = [
  "Building Modern Web Apps",
  "Exploring Data Science",
  "Solving Complex Problems"
];

function Typewriter() {
  const [text, setText] = useState('');
  const [roleIndex, setRoleIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentRole = ROLES[roleIndex];
    let timer;
    if (isDeleting) {
      // Fast, mechanical delete speed
      timer = setTimeout(() => {
        setText(currentRole.substring(0, text.length - 1));
        if (text.length === 0) {
          setIsDeleting(false);
          setRoleIndex((roleIndex + 1) % ROLES.length);
        }
      }, 30);
    } else {
      // Variable typing speed simulating a human (between 40ms and 110ms)
      const humanize = Math.random() * 70 + 40;
      timer = setTimeout(() => {
        setText(currentRole.substring(0, text.length + 1));
        if (text.length === currentRole.length) {
          timer = setTimeout(() => setIsDeleting(true), 3000);
        }
      }, humanize);
    }
    return () => clearTimeout(timer);
  }, [text, isDeleting, roleIndex]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', whiteSpace: 'pre' }}>
      <span style={{ color: 'var(--primary-blue)', fontWeight: 700, marginRight: '10px', letterSpacing: '-1px' }}>{'>_'}</span>
      <span style={{ color: 'var(--text-primary)' }}>
        {text}<span className="typing-cursor"></span>
      </span>
    </div>
  );
}

export default function Home({ onNavClick }) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <ScrollReveal className="home-content">
      <style>{`
        .home-content .home-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 60px;
          align-items: center;
          width: 100%;
        }
        @media (max-width: 900px) {
          .home-content .home-grid { grid-template-columns: 1fr; gap: 40px; text-align: center; }
        }
        
        .home-content .hero-info {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .home-content .hero-greeting {
          font-size: 13.5px;
          font-weight: 600;
          color: var(--text-secondary);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        .home-content h1.hero-title-main {
          font-size: 56px;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1.1;
          margin: 0;
          letter-spacing: -0.02em;
        }
        
        .home-content .hero-typewriter-container {
          height: 36px;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 12px;
          color: var(--text-secondary);
          font-size: 16px;
          font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          padding: 8px 16px;
          border-radius: 8px;
          width: fit-content;
        }
        
        @media (max-width: 900px) {
          .home-content .hero-typewriter-container { margin: 12px auto 0; }
        }

        .home-content .typing-cursor {
          display: inline-block;
          width: 8px;
          height: 16px;
          background: var(--primary-blue);
          margin-left: 4px;
          vertical-align: middle;
          animation: blink 1s step-end infinite;
        }
        
        .home-content p.hero-subtitle-text {
          font-size: 16px;
          color: var(--text-secondary);
          line-height: 1.6;
          max-width: 480px;
          margin: 16px 0 0;
        }
        @media (max-width: 900px) {
          .home-content p.hero-subtitle-text { margin: 16px auto 0; }
        }

        .home-content .fc-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 6px 14px;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--text-primary);
          width: fit-content;
          margin-bottom: 12px;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          box-shadow: 0 2px 10px rgba(0,0,0,0.02);
          cursor: default;
        }
        .home-content .fc-badge:hover {
          border-color: #10b981;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.12);
          transform: translateY(-1px);
        }
        @media (max-width: 900px) {
          .home-content .fc-badge { margin: 0 auto 12px; }
        }
        
        /* Premium Shine Sweep Effect */
        .home-content .fc-badge::before {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(
            to right,
            transparent,
            rgba(255, 255, 255, 0.6),
            transparent
          );
          transform: skewX(-20deg);
          animation: shine 5s infinite;
          pointer-events: none;
        }
        [data-theme="dark"] .home-content .fc-badge::before {
          background: linear-gradient(
            to right,
            transparent,
            rgba(255, 255, 255, 0.1),
            transparent
          );
        }
        @keyframes shine {
          0% { left: -100%; }
          15% { left: 200%; }
          100% { left: 200%; }
        }
        
        /* Advanced Radar Ripple */
        .home-content .fc-badge-dot-wrap {
          position: relative;
          width: 8px;
          height: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .home-content .fc-badge-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981; 
          z-index: 2;
        }
        .home-content .fc-badge-dot-wrap::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: #10b981;
          animation: ripple 2s infinite cubic-bezier(0.19, 1, 0.22, 1);
          z-index: 1;
        }
        @keyframes ripple {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(3.5); opacity: 0; }
        }

        /* Quick Actions Grid */
        .home-content .home-quick-actions {
          display: flex;
          gap: 12px;
          margin-top: 32px;
          flex-wrap: wrap;
        }
        @media (max-width: 900px) {
          .home-content .home-quick-actions { justify-content: center; }
        }

        .home-content .qa-card {
          flex: 1;
          min-width: 130px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
          text-align: left;
        }
        .home-content .qa-card:hover {
          border-color: var(--primary-blue);
          transform: translateY(-2px);
          box-shadow: 0 10px 20px -10px rgba(0,0,0,0.1);
        }
        [data-theme="dark"] .home-content .qa-card:hover {
          box-shadow: 0 10px 20px -10px rgba(0,0,0,0.5);
        }
        
        .home-content .qa-icon-wrap {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-primary);
          transition: all 0.2s ease;
        }
        .home-content .qa-card:hover .qa-icon-wrap {
          background: var(--primary-blue);
          border-color: var(--primary-blue);
          color: white;
        }

        .home-content .qa-title {
          font-size: 13.5px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .home-content .qa-arrow {
          opacity: 0;
          transform: translateX(-5px);
          transition: all 0.2s ease;
          color: var(--primary-blue);
        }
        .home-content .qa-card:hover .qa-arrow {
          opacity: 1;
          transform: translateX(0);
        }

        /* Image Side */
        .home-content .home-image-side {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .home-content .hero-img-new {
          width: 100%;
          max-width: 380px;
          aspect-ratio: 1;
          border-radius: 24px;
          object-fit: cover;
          border: 1px solid var(--border-color);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        [data-theme="dark"] .home-content .hero-img-new {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .home-content .hero-img-new:hover {
          transform: scale(1.02);
        }
      `}</style>
      
      <div className="home-grid">
        <div className="hero-info">
          
          <div className="fc-badge">
            <div className="fc-badge-dot-wrap">
              <div className="fc-badge-dot" />
            </div>
            Available for Opportunities
          </div>

          <div>
            <div className="hero-greeting">{getGreeting()}</div>
            <h1 className="hero-title-main">Sujith Thota</h1>
            
            <div className="hero-typewriter-container">
              <Typewriter />
            </div>
            
            <p className="hero-subtitle-text">
              A passionate <strong>B.Tech Graduate from VIT (8.7 CGPA)</strong>, actively exploring the boundaries between complex data logic and seamless web experiences.
            </p>
          </div>

          <div className="home-quick-actions">
            <button className="qa-card" onClick={() => onNavClick?.('skills')}>
              <div className="qa-icon-wrap"><Code size={16} /></div>
              <div className="qa-title">
                Core Skills <ArrowRight size={14} className="qa-arrow" />
              </div>
            </button>
            <button className="qa-card" onClick={() => onNavClick?.('projects')}>
              <div className="qa-icon-wrap"><Briefcase size={16} /></div>
              <div className="qa-title">
                Projects <ArrowRight size={14} className="qa-arrow" />
              </div>
            </button>
            <button className="qa-card" onClick={() => onNavClick?.('contact')}>
              <div className="qa-icon-wrap"><Mail size={16} /></div>
              <div className="qa-title">
                Contact Me <ArrowRight size={14} className="qa-arrow" />
              </div>
            </button>
          </div>
          
        </div>
        
        <div className="home-image-side">
          <img src="/IMG_0322.jpg" alt="Sujith Thota" className="hero-img-new" />
        </div>
      </div>
    </ScrollReveal>
  );
}
