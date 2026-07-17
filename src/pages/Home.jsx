import { useState, useEffect } from 'react';
import ScrollReveal from '../components/ScrollReveal';
import { Code, Briefcase, Mail, FileText, Sparkles, ArrowRight } from 'lucide-react';
import MobileDashboard from '../components/MobileDashboard';

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

  // Typing typewriter component ONLY for desktop
  function DesktopTypewriter() {
    const [text, setText] = useState('');
    const [roleIndex, setRoleIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const roles = ["Building Modern Web Apps", "Exploring Data Science", "Solving Complex Problems"];

    useEffect(() => {
      const currentRole = roles[roleIndex];
      let timer;
      if (isDeleting) {
        timer = setTimeout(() => {
          setText(currentRole.substring(0, text.length - 1));
          if (text.length === 0) {
            setIsDeleting(false);
            setRoleIndex((roleIndex + 1) % roles.length);
          }
        }, 30);
      } else {
        const humanize = Math.random() * 70 + 40;
        timer = setTimeout(() => {
          setText(currentRole.substring(0, currentRole.length + 1)); // Fix: use currentRole length
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

  return (
    <ScrollReveal className="home-content home-pane">
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
          .home-content.home-pane {
            height: 100%;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            box-sizing: border-box;
            width: 100%;
            padding: 0;
            gap: 16px;
          }

          .mobile-dashboard {
            display: flex;
            flex-direction: column;
            gap: 16px;
            width: 100%;
            height: 100%;
            justify-content: flex-start;
            overflow: hidden;
          }

          .dashboard-profile-card {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 20px;
            padding: 20px 24px;
            display: flex;
            align-items: center;
            gap: 16px;
            box-shadow: var(--shadow-sm);
            text-align: left;
            flex-shrink: 0;
          }

          .dashboard-avatar {
            width: 64px;
            height: 64px;
            border-radius: 16px;
            border: 1.5px solid var(--primary-blue);
            object-fit: cover;
            flex-shrink: 0;
          }

          .dashboard-welcome {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }

          .dashboard-welcome h3 {
            font-size: 11px;
            font-weight: 600;
            color: var(--text-secondary);
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          .dashboard-welcome h2 {
            font-size: 18px;
            font-weight: 800;
            color: var(--text-primary);
            margin: 0;
            letter-spacing: -0.02em;
            line-height: 1.2;
          }

          .dashboard-status {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            color: #10b981;
            font-size: 10.5px;
            font-weight: 700;
            margin-top: 2px;
          }

          .status-dot {
            width: 6px;
            height: 6px;
            background: #10b981;
            border-radius: 50%;
            display: inline-block;
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
            flex-shrink: 0;
          }

          .stat-card {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 14px;
            padding: 10px 4px;
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
            line-height: 1.1;
          }

          .stat-card p {
            font-size: 8.5px;
            font-weight: 650;
            color: var(--text-muted);
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 0.02em;
          }

          .dashboard-bio-card {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 20px;
            padding: 16px 20px;
            box-shadow: var(--shadow-sm);
            text-align: left;
            flex-shrink: 0;
            display: flex;
            align-items: center;
          }

          .dashboard-bio-card p {
            font-size: 12.5px;
            color: var(--text-secondary);
            line-height: 1.5;
            margin: 0;
          }

          /* Action links grid: expands to utilize available vertical space intelligently */
          .dashboard-links-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: repeat(2, 1fr);
            gap: 12px;
            flex-grow: 1;
            min-height: 160px;
          }

          .dashboard-link-card {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 10px 12px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 4px;
            box-shadow: var(--shadow-sm);
            text-align: left;
            cursor: pointer;
            box-sizing: border-box;
            outline: none;
            overflow: hidden;
            transition: border-color 0.15s ease, background 0.15s ease;
          }

          .dashboard-link-card:active {
            border-color: var(--primary-blue);
            background: rgba(0,123,255,0.04);
          }

          .card-icon-box {
            width: 28px;
            height: 28px;
            border-radius: 8px;
            background: rgba(0,123,255,0.1);
            color: var(--primary-blue);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 4px;
            flex-shrink: 0;
          }

          .dashboard-link-card h4 {
            font-size: 12px;
            font-weight: 700;
            color: var(--text-primary);
            margin: 0;
            line-height: 1.2;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .dashboard-link-card p {
            font-size: 9px;
            color: var(--text-muted);
            margin: 0;
            line-height: 1.3;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
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
                <DesktopTypewriter />
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
        /* Mobile dashboard app view: perfectly fits viewport without scroll */
        <MobileDashboard onNavClick={onNavClick} />
      )}
    </ScrollReveal>
  );
}
