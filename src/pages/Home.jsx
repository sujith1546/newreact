import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ScrollReveal, MobileDashboard } from '../components';
import { Code, Briefcase, Mail, ArrowRight, Zap, Smartphone, Download, RefreshCw, X, MapPin, GraduationCap, Star, ExternalLink } from 'lucide-react';
import useGlitchText from '../hooks/useGlitchText';
import useRealtimeData from '../hooks/useRealtimeData';
import { useSmartUpdate } from '../hooks/useSmartUpdate';

export default function Home({ onNavClick }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  const { data: settings } = useRealtimeData('site_settings', { single: true, filter: { column: 'id', value: 1 } });
  const nameText = useGlitchText("Sujith Thota", 100);

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

  // ── Right Panel state ────────────────────────────────────────────────────
  const { showToast, countdown, reload, dismiss, cancelCountdown } = useSmartUpdate();
  const [showInstall, setShowInstall] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      setShowInstall(false);
    }
  };

  return (
    <ScrollReveal className="home-content home-pane" style={{ height: 'calc(100vh - 138px)', overflow: 'hidden', display: 'flex', alignItems: 'stretch', boxSizing: 'border-box', gap: 0 }}>
      <style>{`
        /* Desktop styles (Default) */
        .home-content .home-outer {
          display: flex;
          width: 100%;
          height: 100%;
          gap: 20px;
          align-items: stretch;
        }
        .home-content .home-left {
          flex: 0 0 62%;
          display: flex;
          align-items: center;
          padding-right: 24px;
        }
        /* Vertical divider */
        .home-content .home-divider {
          width: 1px;
          align-self: stretch;
          background: var(--border-color);
          flex-shrink: 0;
          margin: 12px 0;
        }
        .home-content .home-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          align-items: center;
          width: 100%;
        }
        /* Right Info Panel */
        .home-content .home-right-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
          height: 100%;
          padding: 12px 0 12px 24px;
          box-sizing: border-box;
          overflow-y: auto;
          overflow-x: hidden;
        }
        .home-content .home-right-panel::-webkit-scrollbar { width: 3px; }
        .home-content .home-right-panel::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.2); border-radius: 2px; }
        .home-content .hrp-notifications {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex-shrink: 0;
        }
        .home-content .hrp-notif-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 12px 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .home-content .hrp-notif-card.update {
          border-color: color-mix(in srgb, var(--primary-blue) 30%, var(--border-color));
          background: color-mix(in srgb, var(--primary-blue) 5%, var(--bg-secondary));
        }
        .home-content .hrp-notif-card.install {
          border-color: color-mix(in srgb, #10b981 30%, var(--border-color));
          background: color-mix(in srgb, #10b981 5%, var(--bg-secondary));
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .home-content .hrp-notif-icon {
          width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .home-content .hrp-notif-icon.blue { background: color-mix(in srgb, var(--primary-blue) 12%, transparent); color: var(--primary-blue); }
        .home-content .hrp-notif-icon.green { background: color-mix(in srgb, #10b981 12%, transparent); color: #10b981; }
        .home-content .hrp-notif-info { flex: 1; min-width: 0; }
        .home-content .hrp-notif-title { font-size: 12.5px; font-weight: 700; color: var(--text-primary); margin: 0; }
        .home-content .hrp-notif-sub { font-size: 11px; color: var(--text-secondary); margin: 2px 0 0; }
        .home-content .hrp-notif-actions { display: flex; gap: 6px; flex-shrink: 0; }
        .home-content .hrp-notif-btn {
          padding: 5px 10px; border-radius: 6px;
          font-size: 11.5px; font-weight: 700; cursor: pointer;
          border: none; transition: all 0.15s ease;
        }
        .home-content .hrp-notif-btn.primary { background: var(--text-primary); color: var(--bg-primary); }
        .home-content .hrp-notif-btn.primary:hover { opacity: 0.85; }
        .home-content .hrp-notif-btn.ghost {
          background: transparent; color: var(--text-secondary);
          border: 1px solid var(--border-color); width: 28px; height: 28px;
          padding: 0; display: flex; align-items: center; justify-content: center; border-radius: 6px;
        }
        /* Embedded Chat Panel */
        .home-content .hrp-chat {
          flex: 1;
          min-height: 0;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
        }
        [data-theme="dark"] .home-content .hrp-chat { box-shadow: 0 4px 20px rgba(0,0,0,0.25); }
        .home-content .hrp-chat-header {
          padding: 12px 16px;
          background: var(--text-primary);
          display: flex; align-items: center; gap: 10px; flex-shrink: 0;
          border-radius: 16px 16px 0 0;
        }
        .home-content .hrp-chat-header-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: var(--bg-secondary); display: flex; align-items: center;
          justify-content: center; color: var(--text-primary); flex-shrink: 0;
        }
        .home-content .hrp-chat-title { font-size: 13px; font-weight: 700; color: var(--bg-primary); margin: 0; }
        .home-content .hrp-chat-status {
          font-size: 10.5px; color: var(--bg-primary); opacity: 0.7;
          display: flex; align-items: center; gap: 4px; margin-top: 2px;
        }
        .home-content .hrp-chat-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #4ade80;
          animation: statusPulse 2s infinite;
        }
        @keyframes statusPulse {
          0%, 100% { opacity: 1; } 50% { opacity: 0.4; }
        }
        .home-content .hrp-messages {
          flex: 1; overflow-y: auto; padding: 12px 14px;
          display: flex; flex-direction: column; gap: 10px;
          scroll-behavior: smooth;
        }
        .home-content .hrp-messages::-webkit-scrollbar { width: 3px; }
        .home-content .hrp-messages::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.25); border-radius: 2px; }
        .home-content .hrp-msg { display: flex; gap: 7px; align-items: flex-end; }
        .home-content .hrp-msg.user { flex-direction: row-reverse; }
        .home-content .hrp-msg-avatar {
          width: 24px; height: 24px; border-radius: 50%;
          background: var(--text-primary); color: var(--bg-primary);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          font-size: 10px;
        }
        .home-content .hrp-msg-avatar.user { background: color-mix(in srgb, var(--primary-blue) 15%, var(--bg-primary)); color: var(--primary-blue); }
        .home-content .hrp-bubble {
          max-width: 78%; padding: 9px 12px; border-radius: 14px 14px 14px 2px;
          font-size: 12px; line-height: 1.5; color: var(--text-primary);
          background: var(--bg-primary); border: 1px solid var(--border-color);
        }
        .home-content .hrp-msg.user .hrp-bubble {
          background: var(--text-primary); color: var(--bg-primary);
          border-color: transparent; border-radius: 14px 14px 2px 14px;
        }
        .home-content .hrp-typing {
          display: flex; gap: 4px; align-items: center;
          padding: 9px 12px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 14px 14px 14px 2px;
          width: fit-content;
        }
        .home-content .hrp-typing span {
          width: 5px; height: 5px; border-radius: 50%;
          background: var(--text-secondary); animation: typingBounce 1.2s infinite;
        }
        .home-content .hrp-typing span:nth-child(2) { animation-delay: 0.2s; }
        .home-content .hrp-typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
        .home-content .hrp-input-row {
          padding: 10px 12px;
          border-top: 1px solid var(--border-color);
          display: flex; gap: 8px; align-items: center; flex-shrink: 0;
        }
        .home-content .hrp-input {
          flex: 1; border: 1px solid var(--border-color);
          border-radius: 10px; padding: 8px 12px;
          font-size: 12px; background: var(--bg-primary);
          color: var(--text-primary); outline: none;
          transition: border-color 0.2s;
        }
        .home-content .hrp-input:focus { border-color: var(--primary-blue); }
        .home-content .hrp-input::placeholder { color: var(--text-muted); }
        .home-content .hrp-send {
          width: 34px; height: 34px; border-radius: 10px;
          background: var(--text-primary); border: none;
          color: var(--bg-primary); cursor: pointer; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          transition: opacity 0.2s;
        }
        .home-content .hrp-send:disabled { opacity: 0.45; cursor: default; }
        .home-content .hrp-send:not(:disabled):hover { opacity: 0.85; }
        
        /* ── Hero Redesign ────────────────────────────── */
        .home-content .hero-wrap {
          display: flex;
          flex-direction: column;
          width: 100%;
          gap: 0;
        }

        /* Top row: avatar + identity */
        .home-content .hero-top {
          display: flex;
          align-items: center;
          gap: 28px;
          margin-bottom: 24px;
        }

        /* Avatar with glowing ring */
        .home-content .hero-avatar-wrap {
          position: relative;
          flex-shrink: 0;
        }
        .home-content .hero-avatar {
          width: 96px;
          height: 96px;
          border-radius: 24px;
          object-fit: cover;
          border: 2px solid var(--border-color);
          display: block;
        }
        .home-content .hero-avatar-online {
          position: absolute;
          bottom: -4px;
          right: -4px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #10b981;
          border: 2.5px solid var(--bg-primary);
          animation: onlinePulse 2.4s ease-in-out infinite;
        }
        @keyframes onlinePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.5); }
          50% { box-shadow: 0 0 0 5px rgba(16,185,129,0); }
        }
        .home-content .hero-identity {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .home-content .hero-greeting {
          font-size: 12px;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .home-content .hero-name-row {
          display: flex;
          align-items: baseline;
          gap: 0;
          flex-wrap: wrap;
        }
        .home-content h1.hero-title-main {
          font-size: 38px;
          font-weight: 900;
          line-height: 1.05;
          margin: 0;
          letter-spacing: -0.03em;
          background: linear-gradient(135deg, var(--text-primary) 40%, color-mix(in srgb, var(--primary-blue) 60%, var(--text-primary)));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .home-content .hero-role-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: color-mix(in srgb, var(--primary-blue) 10%, var(--bg-secondary));
          border: 1px solid color-mix(in srgb, var(--primary-blue) 20%, var(--border-color));
          color: var(--primary-blue);
          border-radius: 20px;
          padding: 3px 10px;
          font-size: 11px;
          font-weight: 700;
          margin-top: 4px;
          width: fit-content;
        }

        /* Typewriter */
        .home-content .hero-typewriter-container {
          height: 34px;
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--text-secondary);
          font-size: 13.5px;
          font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          padding: 6px 14px;
          border-radius: 8px;
          width: fit-content;
          margin-bottom: 4px;
        }
        .home-content .typing-cursor {
          display: inline-block;
          width: 7px;
          height: 14px;
          background: var(--primary-blue);
          margin-left: 2px;
          vertical-align: middle;
          animation: blink 1s step-end infinite;
        }

        /* Bio text */
        .home-content p.hero-subtitle-text {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.65;
          margin: 10px 0 0;
          max-width: 100%;
        }

        /* CTA pill row */
        .home-content .hero-cta-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 22px;
        }
        .home-content .hero-cta {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 9px 18px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          border: none;
          transition: all 0.18s cubic-bezier(0.16,1,0.3,1);
          text-decoration: none;
        }
        .home-content .hero-cta.primary {
          background: var(--text-primary);
          color: var(--bg-primary);
        }
        .home-content .hero-cta.primary:hover {
          opacity: 0.88;
          transform: translateY(-1px);
        }
        .home-content .hero-cta.outline {
          background: transparent;
          color: var(--text-primary);
          border: 1px solid var(--border-color);
        }
        .home-content .hero-cta.outline:hover {
          border-color: var(--primary-blue);
          color: var(--primary-blue);
          transform: translateY(-1px);
        }

        /* Stats strip */
        .home-content .hero-stats {
          display: flex;
          align-items: center;
          gap: 0;
          margin-top: 28px;
          padding: 14px 18px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 14px;
        }
        .home-content .hero-stat-item {
          flex: 1;
          text-align: center;
        }
        .home-content .hero-stat-item:not(:last-child) {
          border-right: 1px solid var(--border-color);
        }
        .home-content .hero-stat-val {
          font-size: 22px;
          font-weight: 900;
          color: var(--primary-blue);
          line-height: 1.1;
          letter-spacing: -0.02em;
        }
        .home-content .hero-stat-lbl {
          font-size: 10px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-top: 2px;
        }

        /* Available badge (keep for compat) */
        .home-content .fc-badge {
          display: none; /* replaced by avatar-online dot + role-badge */
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

      {/* Desktop: outer split wrapper */}
      <div className="home-outer">

        {/* LEFT 62% — redesigned hero */}
        <div className="home-left">
          <div className="hero-wrap">

            {/* Top: avatar + identity */}
            <div className="hero-top">
              <div className="hero-avatar-wrap">
                <img src="/IMG_0322.jpg" alt="Sujith Thota" className="hero-avatar" />
                {(settings === null || settings?.is_available_for_hire) && (
                  <span className="hero-avatar-online" title="Available for opportunities" />
                )}
              </div>
              <div className="hero-identity">
                <div className="hero-greeting">{getGreeting()} 👋</div>
                <h1 className="hero-title-main">{nameText}</h1>
                <div className="hero-role-badge">
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block', opacity: 0.7 }} />
                  Data Science &amp; Full-Stack Developer
                </div>
              </div>
            </div>

            {/* Typewriter */}
            <div className="hero-typewriter-container">
              <DesktopTypewriter />
            </div>

            {/* Bio */}
            <p className="hero-subtitle-text"
              dangerouslySetInnerHTML={{ __html: settings?.hero_headline ||
                "A passionate <strong>B.Tech Graduate from VIT (8.7 CGPA)</strong>, actively exploring the boundaries between complex data logic and seamless web experiences."
              }}
            />

            {/* CTA pill row */}
            <div className="hero-cta-row">
              <button className="hero-cta primary" onClick={() => onNavClick?.('skills')}>
                <Code size={14} /> Core Skills
              </button>
              <button className="hero-cta outline" onClick={() => onNavClick?.('projects')}>
                <Briefcase size={14} /> Projects
              </button>
              <button className="hero-cta outline" onClick={() => onNavClick?.('contact')}>
                <Mail size={14} /> Contact
              </button>
              <button className="hero-cta outline" onClick={triggerResume}>
                <ArrowRight size={14} /> Resume
              </button>
            </div>

            {/* Stats strip */}
            <div className="hero-stats">
              {[{ val: '8.7', lbl: 'CGPA' }, { val: '10+', lbl: 'Projects' }, { val: '1+', lbl: 'Years Exp.' }, { val: '15+', lbl: 'Technologies' }].map(s => (
                <div key={s.lbl} className="hero-stat-item">
                  <div className="hero-stat-val">{s.val}</div>
                  <div className="hero-stat-lbl">{s.lbl}</div>
                </div>
              ))}
            </div>

          </div>
        </div>{/* end home-left */}

        {/* Vertical divider */}
        <div className="home-divider" />

        {/* RIGHT 35% — AI Panel */}
        <div className="home-right-panel">

          {/* ── Notifications ─────────────────────────── */}
          <div className="hrp-notifications">
            {/* Update available */}
            {(showToast) && (
              <div className="hrp-notif-card update">
                <div className="hrp-notif-icon blue"><RefreshCw size={15} /></div>
                <div className="hrp-notif-info">
                  <p className="hrp-notif-title">
                    {countdown !== null ? `Updating in ${countdown}s…` : 'New version available'}
                  </p>
                  <p className="hrp-notif-sub">Reload to apply latest updates</p>
                </div>
                <div className="hrp-notif-actions">
                  {countdown !== null ? (
                    <button className="hrp-notif-btn primary" onClick={cancelCountdown}>Cancel</button>
                  ) : (
                    <>
                      <button className="hrp-notif-btn primary" onClick={reload}>Reload</button>
                      <button className="hrp-notif-btn ghost" onClick={dismiss}><X size={12} /></button>
                    </>
                  )}
                </div>
              </div>
            )}
            {/* Install App */}
            {showInstall && (
              <div className="hrp-notif-card install">
                <div className="hrp-notif-icon green"><Smartphone size={15} /></div>
                <div className="hrp-notif-info">
                  <p className="hrp-notif-title">Install App Experience</p>
                  <p className="hrp-notif-sub">Add to home screen for offline access</p>
                </div>
                <div className="hrp-notif-actions">
                  <button className="hrp-notif-btn primary" style={{ background: '#10b981', color: '#fff' }} onClick={handleInstallClick}>
                    <Download size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />Install
                  </button>
                  <button className="hrp-notif-btn ghost" onClick={() => setShowInstall(false)}><X size={12} /></button>
                </div>
              </div>
            )}
          </div>

          {/* ── Info Cards ─────────────────────────── */}

          {/* Profile Quick Info */}
          <div style={{
            background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
            borderRadius: 14, padding: '16px', display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <img src="/IMG_0322.jpg" alt="Sujith Thota" style={{ width: 44, height: 44, borderRadius: 12, objectFit: 'cover', border: '1px solid var(--border-color)', flexShrink: 0 }} />
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>Sujith Thota</p>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={10} /> Vellore, India
                </p>
              </div>
              {(settings === null || settings?.is_available_for_hire) && (
                <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5, background: 'color-mix(in srgb, #10b981 12%, transparent)', color: '#10b981', border: '1px solid color-mix(in srgb, #10b981 25%, transparent)', borderRadius: 20, padding: '3px 9px', fontSize: 10.5, fontWeight: 700, flexShrink: 0 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} /> Open
                </span>
              )}
            </div>
            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {[{ label: 'CGPA', value: '8.7' }, { label: 'Projects', value: '10+' }, { label: 'Tech', value: '15+' }].map(s => (
                <div key={s.label} style={{ textAlign: 'center', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 10, padding: '8px 4px' }}>
                  <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--primary-blue)', lineHeight: 1.1 }}>{s.value}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</p>
                </div>
              ))}
            </div>
            {/* Education */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'var(--bg-primary)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
              <GraduationCap size={14} style={{ color: 'var(--primary-blue)', flexShrink: 0 }} />
              <div>
                <p style={{ margin: 0, fontSize: 11.5, fontWeight: 700, color: 'var(--text-primary)' }}>B.Tech CSE · VIT Vellore</p>
                <p style={{ margin: 0, fontSize: 10, color: 'var(--text-muted)' }}>2021 – 2025 · CGPA 8.7</p>
              </div>
            </div>
          </div>

          {/* Tech Highlights */}
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 14, padding: '14px 16px' }}>
            <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tech Stack</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {['React', 'Python', 'FastAPI', 'Supabase', 'TensorFlow', 'Node.js', 'SQL', 'Groq AI'].map(tech => (
                <span key={tech} style={{ padding: '4px 10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 20, fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>{tech}</span>
              ))}
            </div>
          </div>

          {/* Currently Building */}
          {settings?.current_project && (
            <div style={{ background: 'linear-gradient(135deg, color-mix(in srgb, #f59e0b 8%, var(--bg-secondary)), var(--bg-secondary))', border: '1px solid color-mix(in srgb, #f59e0b 25%, var(--border-color))', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ padding: 8, background: 'color-mix(in srgb, #f59e0b 15%, transparent)', borderRadius: 10, color: '#f59e0b', flexShrink: 0 }}><Zap size={14} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: '0 0 2px', fontSize: 10, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: 0.5 }}>Currently Building</p>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{settings.current_project}</p>
                <div style={{ marginTop: 8, height: 3, background: 'var(--border-color)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${settings.current_project_pct ?? 0}%`, background: 'linear-gradient(90deg, #f59e0b, #ef4444)', borderRadius: 4, transition: 'width 0.6s ease' }} />
                </div>
                <p style={{ margin: '4px 0 0', fontSize: 10, color: 'var(--text-muted)' }}>{settings.current_project_status} · {settings.current_project_pct ?? 0}% complete</p>
              </div>
            </div>
          )}

          {/* Quick Links */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { label: 'GitHub', href: 'https://github.com/sujith1546', color: 'var(--text-primary)' },
              { label: 'LinkedIn', href: 'https://linkedin.com/in/sujith-thota', color: '#0a66c2' },
              { label: 'Projects', nav: 'projects', color: 'var(--primary-blue)' },
              { label: 'Contact', nav: 'contact', color: '#10b981' },
            ].map(link => (
              <button key={link.label}
                onClick={() => link.nav ? onNavClick?.(link.nav) : window.open(link.href, '_blank')}
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 10, padding: '9px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'all 0.15s', fontSize: 12, fontWeight: 700, color: link.color }}
              >
                {link.label} <ExternalLink size={11} style={{ opacity: 0.5 }} />
              </button>
            ))}
          </div>

        </div>{/* end home-right-panel */}
      </div>{/* end home-outer */}


    </ScrollReveal>
  );
}
