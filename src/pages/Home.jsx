import { useState, useEffect } from 'react';
import ScrollReveal from '../components/ScrollReveal';
import { Code, Briefcase, Mail, FileText, Sparkles, Trophy } from 'lucide-react';

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
      timer = setTimeout(() => {
        setText(currentRole.substring(0, text.length - 1));
        if (text.length === 0) {
          setIsDeleting(false);
          setRoleIndex((roleIndex + 1) % ROLES.length);
        }
      }, 30);
    } else {
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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const triggerResume = () => {
    window.dispatchEvent(new CustomEvent('open-resume'));
  };

  return (
    <ScrollReveal className="home-content">
      <style>{`
        /* Desktop styles (Default) */
        .home-content .home-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 60px;
          align-items: center;
          width: 100%;
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

        .home-content .fc-badge::before {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.6), transparent);
          transform: skewX(-20deg);
          animation: shine 5s infinite;
          pointer-events: none;
        }
        [data-theme="dark"] .home-content .fc-badge::before {
          background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.1), transparent);
        }

        @keyframes shine {
          0% { left: -100%; }
          15% { left: 200%; }
          100% { left: 200%; }
        }
        
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

        .home-content .home-quick-actions {
          display: flex;
          gap: 12px;
          margin-top: 32px;
          flex-wrap: wrap;
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

        /* ============================================
           MOBILE DASHBOARD APP UI (<= 900px)
           ============================================ */
        @media (max-width: 900px) {
          .home-content {
            padding: 8px 4px 16px 4px !important;
          }

          .mobile-dashboard {
            display: flex;
            flex-direction: column;
            gap: 16px;
            width: 100%;
          }

          .dashboard-profile-card {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 20px;
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 14px;
            box-shadow: var(--shadow-sm);
            text-align: left;
          }

          .dashboard-avatar {
            width: 68px;
            height: 68px;
            border-radius: 50%;
            border: 1.5px solid var(--primary-blue);
            object-fit: cover;
          }

          .dashboard-welcome h3 {
            font-size: 12px;
            font-weight: 550;
            color: var(--text-secondary);
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          .dashboard-welcome h2 {
            font-size: 20px;
            font-weight: 800;
            color: var(--text-primary);
            margin: 2px 0 6px 0;
            letter-spacing: -0.02em;
          }

          .dashboard-status {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: rgba(16, 185, 129, 0.08);
            color: #10b981;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 10.5px;
            font-weight: 600;
          }

          .status-dot {
            width: 6px;
            height: 6px;
            background: #10b981;
            border-radius: 50%;
            animation: status-pulse 2s infinite;
          }

          @keyframes status-pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.5); opacity: 0.3; }
            100% { transform: scale(1); opacity: 1; }
          }

          .dashboard-stats-row {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
          }

          .stat-card {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 14px;
            padding: 12px 6px;
            text-align: center;
            box-shadow: var(--shadow-sm);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }

          .stat-card h4 {
            font-size: 16px;
            font-weight: 800;
            color: var(--primary-blue);
            margin: 0 0 2px 0;
          }

          .stat-card p {
            font-size: 9px;
            font-weight: 600;
            color: var(--text-muted);
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 0.02em;
          }

          .dashboard-bio-card {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 18px;
            padding: 14px 16px;
            box-shadow: var(--shadow-sm);
            text-align: left;
          }

          .dashboard-bio-card p {
            font-size: 13px;
            color: var(--text-secondary);
            line-height: 1.5;
            margin: 0;
          }

          .dashboard-links-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }

          .dashboard-link-card {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 14px 12px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            text-align: left;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: var(--shadow-sm);
            outline: none;
          }

          .dashboard-link-card:active {
            transform: scale(0.97);
            border-color: var(--primary-blue);
          }

          .card-icon-box {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            background: rgba(0, 123, 255, 0.08);
            color: var(--primary-blue);
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .dashboard-link-card h4 {
            font-size: 13px;
            font-weight: 700;
            color: var(--text-primary);
            margin: 0;
          }

          .dashboard-link-card p {
            font-size: 10px;
            color: var(--text-muted);
            margin: 0;
            line-height: 1.3;
          }
        }
      `}</style>

      {!isMobile ? (
        /* Desktop grid view */
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
      ) : (
        /* Mobile dashboard app view */
        <div className="mobile-dashboard">
          
          {/* Avatar Welcome Banner Card */}
          <div className="dashboard-profile-card">
            <img src="/IMG_0322.jpg" alt="Sujith Thota" className="dashboard-avatar" />
            <div className="dashboard-welcome">
              <h3>{getGreeting()}</h3>
              <h2>Sujith Thota</h2>
              <div className="dashboard-status">
                <div className="status-dot" />
                <span>Available for Opportunities</span>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="dashboard-stats-row">
            <div className="stat-card">
              <h4>8.7</h4>
              <p>VIT CGPA</p>
            </div>
            <div className="stat-card">
              <h4>15+</h4>
              <p>Certifications</p>
            </div>
            <div className="stat-card">
              <h4>5+</h4>
              <p>ML Projects</p>
            </div>
          </div>

          {/* Intro Bio Card */}
          <div className="dashboard-bio-card">
            <p>
              VIT University Data Science graduate exploring the boundary between predictive machine learning intelligence and reactive web experiences.
            </p>
          </div>

          {/* Typewriter text line */}
          <div className="hero-typewriter-container" style={{ margin: '0 auto', background: 'var(--bg-secondary)' }}>
            <Typewriter />
          </div>

          {/* Dashboard Action cards */}
          <div className="dashboard-links-grid">
            <button className="dashboard-link-card" onClick={() => onNavClick?.('skills')}>
              <div className="card-icon-box"><Code size={18} /></div>
              <h4>Core Stack</h4>
              <p>Languages, ML models & web tech frameworks.</p>
            </button>

            <button className="dashboard-link-card" onClick={() => onNavClick?.('projects')}>
              <div className="card-icon-box"><Briefcase size={18} /></div>
              <h4>Projects</h4>
              <p>Swipe through code showcase & demo apps.</p>
            </button>

            <button className="dashboard-link-card" onClick={triggerResume}>
              <div className="card-icon-box"><FileText size={18} /></div>
              <h4>Resume</h4>
              <p>Open interactive PDF & download offline copy.</p>
            </button>

            <button className="dashboard-link-card" onClick={() => onNavClick?.('contact')}>
              <div className="card-icon-box"><Mail size={18} /></div>
              <h4>Connect</h4>
              <p>Send a direct message & collaborate.</p>
            </button>
          </div>

        </div>
      )}
    </ScrollReveal>
  );
}
