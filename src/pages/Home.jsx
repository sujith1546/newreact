import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ScrollReveal, MobileDashboard } from '../components';
import { Code, Briefcase, Mail, FileText, Sparkles, ArrowRight, Zap, Calendar } from 'lucide-react';
import useGlitchText from '../hooks/useGlitchText';
import useRealtimeData from '../hooks/useRealtimeData';
import HeroSection from '../components/HeroSection';

export default function Home({ onNavClick }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  const { data: settings } = useRealtimeData('site_settings', { single: true, filter: { column: 'id', value: 1 } });
  const nameText = useGlitchText(settings?.owner_name || "Sujith Thota", 100);

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

      if (!isDeleting && text === currentRole) {
        timer = setTimeout(() => setIsDeleting(true), 2500);
      } else if (isDeleting && text === '') {
        setIsDeleting(false);
        setRoleIndex((prev) => (prev + 1) % roles.length);
      } else {
        const speed = isDeleting ? 25 : Math.random() * 40 + 50;
        timer = setTimeout(() => {
          const nextText = isDeleting
            ? currentRole.substring(0, text.length - 1)
            : currentRole.substring(0, text.length + 1);
          setText(nextText);
        }, speed);
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

  if (isMobile) {
    return (
      <div className="home-content home-pane" style={{ height: '100%', width: '100%' }}>
        <MobileDashboard onNavClick={onNavClick} />
      </div>
    );
  }

  return (
    <div className="home-content home-pane active-reveal" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '24px', boxSizing: 'border-box' }}>
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
          height: 34px;
          box-sizing: border-box;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 0 14px;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--text-primary);
          width: fit-content;
          margin: 0;
          position: relative;
          overflow: hidden;
          transition: all 0.35s cubic-bezier(0.16,1,0.3,1);
          box-shadow: 0 2px 10px rgba(0,0,0,0.02);
          cursor: default;
        }
        .home-content .fc-badge:hover {
          border-color: rgba(16,185,129,0.5);
          box-shadow: 0 4px 20px rgba(16,185,129,0.15), 0 0 0 1px rgba(16,185,129,0.1);
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
          width: 12px;
          height: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        /* Glowing core dot */
        .home-content .fc-badge-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 6px 2px rgba(16,185,129,0.6), 0 0 12px 4px rgba(16,185,129,0.25);
          position: relative;
          z-index: 3;
          animation: dotGlow 2.4s ease-in-out infinite;
        }
        @keyframes dotGlow {
          0%, 100% { box-shadow: 0 0 6px 2px rgba(16,185,129,0.6), 0 0 12px 4px rgba(16,185,129,0.25); }
          50%       { box-shadow: 0 0 8px 3px rgba(16,185,129,0.9), 0 0 20px 6px rgba(16,185,129,0.4); }
        }

        /* Ring 1 — fastest */
        .home-content .fc-badge-dot-wrap::before {
          content: '';
          position: absolute;
          width: 100%; height: 100%;
          border-radius: 50%;
          border: 1.5px solid rgba(16,185,129,0.7);
          animation: sonarRing 2.4s cubic-bezier(0,0,0.2,1) infinite;
          z-index: 2;
        }
        /* Ring 2 — slower, delayed */
        .home-content .fc-badge-dot-wrap::after {
          content: '';
          position: absolute;
          width: 100%; height: 100%;
          border-radius: 50%;
          border: 1px solid rgba(16,185,129,0.45);
          animation: sonarRing 2.4s cubic-bezier(0,0,0.2,1) 0.8s infinite;
          z-index: 1;
        }
        @keyframes sonarRing {
          0%   { transform: scale(1);   opacity: 0.85; }
          70%  { transform: scale(3.8); opacity: 0; }
          100% { transform: scale(3.8); opacity: 0; }
        }

        .home-content .home-quick-actions {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          margin-top: 0;
          width: 100%;
        }

        .home-content .qa-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 14px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
          text-align: left;
        }
        .home-content .qa-card:hover {
          border-color: var(--primary-blue);
          transform: translateY(-3px);
          box-shadow: 0 12px 24px -8px color-mix(in srgb, var(--primary-blue) 20%, transparent);
        }
        
        .home-content .qa-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }

        .home-content .qa-icon-wrap {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary-blue);
          transition: all 0.2s ease;
        }
        .home-content .qa-card:hover .qa-icon-wrap {
          background: var(--primary-blue);
          border-color: var(--primary-blue);
          color: #ffffff;
        }

        .home-content .qa-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 2px 0;
        }
        
        .home-content .qa-subtext {
          font-size: 11px;
          font-weight: 500;
          color: var(--text-muted);
          margin: 0;
        }

        .home-content .qa-arrow {
          opacity: 0.4;
          transform: translateX(-3px);
          transition: all 0.2s ease;
          color: var(--text-muted);
        }
        .home-content .qa-card:hover .qa-arrow {
          opacity: 1;
          transform: translateX(0);
          color: var(--primary-blue);
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

      {/* Desktop grid view */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>
        <HeroSection name={nameText} photoUrl="/IMG_0322.jpg" onNavClick={onNavClick} settings={settings} />

        <div className="home-quick-actions" style={{ marginTop: 0, width: '100%', maxWidth: '640px' }}>
          <button className="qa-card" onClick={() => onNavClick?.('skills')}>
            <div className="qa-card-header">
              <div className="qa-icon-wrap"><Code size={16} /></div>
              <ArrowRight size={14} className="qa-arrow" />
            </div>
            <div>
              <div className="qa-title">Core Skills</div>
              <div className="qa-subtext">12+ Tech &amp; Data Stack</div>
            </div>
          </button>
          <button className="qa-card" onClick={() => onNavClick?.('projects')}>
            <div className="qa-card-header">
              <div className="qa-icon-wrap"><Briefcase size={16} /></div>
              <ArrowRight size={14} className="qa-arrow" />
            </div>
            <div>
              <div className="qa-title">Projects</div>
              <div className="qa-subtext">10+ Shipped Apps</div>
            </div>
          </button>
          <button className="qa-card" onClick={() => onNavClick?.('contact')}>
            <div className="qa-card-header">
              <div className="qa-icon-wrap"><Mail size={16} /></div>
              <ArrowRight size={14} className="qa-arrow" />
            </div>
            <div>
              <div className="qa-title">Contact Me</div>
              <div className="qa-subtext">Email &amp; Instant Call</div>
            </div>
          </button>
        </div>

        {/* Currently Working On Widget — only shown on desktop when set */}
        {!isMobile && settings?.current_project && (
          <div style={{
            padding: '16px 20px', borderRadius: 18,
            background: 'linear-gradient(135deg, color-mix(in srgb, #f59e0b 8%, var(--bg-secondary)), var(--bg-secondary))',
            border: '1px solid color-mix(in srgb, #f59e0b 25%, var(--border-color))',
            display: 'flex', alignItems: 'center', gap: 16, maxWidth: 700,
          }}>
            <div style={{ padding: 10, background: 'color-mix(in srgb, #f59e0b 15%, transparent)', borderRadius: 12, color: '#f59e0b', flexShrink: 0 }}>
              <Zap size={20} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>Currently Building</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{settings.current_project}</div>
              <div style={{ marginTop: 8, height: 4, background: 'var(--border-color)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${settings.current_project_pct ?? 0}%`, background: 'linear-gradient(90deg, #f59e0b, #ef4444)', borderRadius: 4, transition: 'width 0.6s ease' }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{settings.current_project_status} · {settings.current_project_pct ?? 0}% complete</div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
