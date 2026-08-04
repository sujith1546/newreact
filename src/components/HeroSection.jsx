import { useState, useEffect } from "react";
import { Mail, Download, Code2, Clock, Database } from "lucide-react";
import HeroPhotoCaption from "./HeroPhotoCaption";
import {
  SiPython,
  SiTensorflow,
  SiReact,
  SiFastapi,
  SiDocker,
  SiGit,
  SiPandas
} from "react-icons/si";
import StatsRow from "./ui/StatsRow";

const TAGLINES = [
  "Building Modern Web Apps",
  "Solving DSA Problems",
  "Training ML Models",
  "Shipping Data Pipelines",
];

const STATS = [
  { label: "Years coding", value: "3.5" },
  { label: "Projects", value: "10" },
  { label: "DSA solved", value: "200" },
  { label: "CGPA", value: "8.7" },
];

const TECH_STACK = [
  { name: "Python", Icon: SiPython },
  { name: "TensorFlow", Icon: SiTensorflow },
  { name: "React", Icon: SiReact },
  { name: "FastAPI", Icon: SiFastapi },
  { name: "SQL", Icon: Database },
  { name: "Docker", Icon: SiDocker },
  { name: "Git", Icon: SiGit },
  { name: "Pandas", Icon: SiPandas },
];

function AnimatedStatValue({ targetValue, duration = 1200 }) {
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    const match = String(targetValue).match(/^([\d.]+)(.*)$/);
    if (!match) {
      setDisplayValue(targetValue);
      return;
    }

    const numeric = parseFloat(match[1]);
    const suffix = match[2] || "";
    const hasDecimals = match[1].includes(".");
    const decimalPlaces = hasDecimals ? (match[1].split(".")[1] || "").length : 0;

    let start = null;
    let animationFrame;

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = numeric * easeOut;

      setDisplayValue(current.toFixed(decimalPlaces) + suffix);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      }
    };

    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [targetValue, duration]);

  return <>{displayValue}</>;
}

function useTypewriter(words, typingSpeed = 55, deletingSpeed = 30, pause = 1400) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[index % words.length];
    let timeout;

    if (!deleting && text === current) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && text === "") {
      setDeleting(false);
      setIndex((i) => i + 1);
    } else {
      timeout = setTimeout(
        () => {
          setText((t) =>
            deleting ? current.slice(0, t.length - 1) : current.slice(0, t.length + 1)
          );
        },
        deleting ? deletingSpeed : typingSpeed
      );
    }
    return () => clearTimeout(timeout);
  }, [text, deleting, index, words, typingSpeed, deletingSpeed, pause]);

  return text;
}

export default function HeroSection({ name = "Sujith Thota", photoUrl = "/IMG_0322.jpg", onNavClick, settings }) {
  const tagline = useTypewriter(TAGLINES);
  const [time, setTime] = useState(getLocalTime());

  useEffect(() => {
    const id = setInterval(() => setTime(getLocalTime()), 1000);
    return () => clearInterval(id);
  }, []);

  function getLocalTime() {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    }).format(new Date());
  }

  const triggerResume = (e) => {
    if (e) e.preventDefault();
    window.dispatchEvent(new CustomEvent('open-resume'));
  };

  const getGreeting = () => {
    try {
      const now = new Date();
      const options = { timeZone: 'Asia/Kolkata', hour: 'numeric', hour12: false };
      const istHour = parseInt(new Intl.DateTimeFormat('en-US', options).format(now), 10);
      if (istHour < 12) return 'Good morning';
      if (istHour < 17) return 'Good afternoon';
      return 'Good evening';
    } catch {
      return 'Good day';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>
      <style>{`
        .hero-layout-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 40px;
          align-items: center;
          width: 100%;
        }
        @media (max-width: 900px) {
          .hero-layout-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
        }
        @keyframes scroll-left {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .ticker-wrap {
          position: relative;
          overflow: hidden;
          width: 100%;
          white-space: nowrap;
          border-top: 1px solid var(--border-color);
          border-bottom: 1px solid var(--border-color);
          padding: 12px 0;
        }
        .ticker-wrap:hover .animate-marquee-track {
          animation-play-state: paused;
        }
        .animate-marquee-track {
          display: inline-flex;
          width: max-content;
          gap: 40px;
          animation: scroll-left 25s linear infinite;
        }
        .hero-img-wrap {
          position: relative;
          width: 100%;
          max-width: 340px;
          margin: 0 auto;
          aspect-ratio: 1;
          border-radius: 24px;
          overflow: hidden;
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow-md, 0 10px 30px rgba(0,0,0,0.1));
          transition: transform 0.3s ease;
        }
        .hero-img-wrap:hover {
          transform: scale(1.02);
        }
        .fc-badge {
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
        .fc-badge:hover {
          border-color: rgba(16,185,129,0.5);
          box-shadow: 0 4px 20px rgba(16,185,129,0.15), 0 0 0 1px rgba(16,185,129,0.1);
          transform: translateY(-1px);
        }
        .fc-badge::before {
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
        [data-theme="dark"] .fc-badge::before {
          background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.1), transparent);
        }
        @keyframes shine {
          0% { left: -100%; }
          15% { left: 200%; }
          100% { left: 200%; }
        }
        .fc-badge-dot-wrap {
          position: relative;
          width: 12px;
          height: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .fc-badge-dot {
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
        .fc-badge-dot-wrap::before {
          content: '';
          position: absolute;
          width: 100%; height: 100%;
          border-radius: 50%;
          border: 1.5px solid rgba(16,185,129,0.7);
          animation: sonarRing 2.4s cubic-bezier(0,0,0.2,1) infinite;
          z-index: 2;
        }
        .fc-badge-dot-wrap::after {
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
        .time-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          height: 34px;
          box-sizing: border-box;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 0 14px;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--text-secondary);
          margin: 0;
          position: relative;
          overflow: hidden;
          transition: all 0.35s cubic-bezier(0.16,1,0.3,1);
          box-shadow: 0 2px 10px rgba(0,0,0,0.02);
          cursor: default;
        }
        .time-badge:hover {
          border-color: rgba(59, 130, 246, 0.5);
          color: var(--text-primary);
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.15), 0 0 0 1px rgba(59, 130, 246, 0.1);
        }
        .time-badge::before {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(to right, transparent, rgba(59, 130, 246, 0.3), transparent);
          transform: skewX(-20deg);
          animation: shine 5s infinite 2.5s;
          pointer-events: none;
        }
        [data-theme="dark"] .time-badge::before {
          background: linear-gradient(to right, transparent, rgba(59, 130, 246, 0.15), transparent);
        }
        .time-badge-clock {
          color: var(--primary-blue);
          flex-shrink: 0;
          animation: clockPulse 2.8s ease-in-out infinite;
        }
        @keyframes clockPulse {
          0%, 100% {
            filter: drop-shadow(0 0 2px rgba(59, 130, 246, 0.4));
            transform: scale(1);
          }
          50% {
            filter: drop-shadow(0 0 7px rgba(59, 130, 246, 0.85));
            transform: scale(1.15);
          }
        }
        .stat-card-item {
          border-radius: 12px;
          border: 1px solid var(--border-color);
          background: var(--bg-secondary);
          padding: 10px 8px;
          text-align: center;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: default;
        }
        .stat-card-item:hover {
          border-color: var(--primary-blue);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 123, 255, 0.08);
        }
      `}</style>

      {/* Main Grid */}
      <div className="hero-layout-grid">
        {/* Left Column: Text & Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '18px' }}>
            {(settings === null || settings?.is_available_for_hire) && (
              <div className="fc-badge">
                <div className="fc-badge-dot-wrap">
                  <div className="fc-badge-dot" />
                </div>
                Available for Opportunities
              </div>
            )}
            <div className="time-badge">
              <Clock size={13} className="time-badge-clock" />
              <span>{time} IST local time</span>
            </div>
          </div>

          {/* Title */}
          <div>
            <p style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', margin: '0 0 4px 0' }}>
              {getGreeting()}
            </p>
            <h1 style={{ fontSize: '48px', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)', margin: 0, lineHeight: 1.1 }}>
              {name}
            </h1>
          </div>

          {/* Typewriter pill */}
          <div style={{
            display: 'inline-flex',
            width: 'fit-content',
            alignItems: 'center',
            gap: '8px',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-secondary)',
            padding: '8px 16px',
            fontFamily: 'monospace',
            fontSize: '14px',
            color: 'var(--text-primary)'
          }}>
            <span style={{ color: 'var(--primary-blue)', fontWeight: 700 }}>&gt;_</span>
            <span>{tagline}</span>
            <span style={{ color: 'var(--text-muted)', animation: 'blink 1s step-end infinite' }}>|</span>
          </div>

          {/* Subtitle */}
          <div
            style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '480px' }}
            dangerouslySetInnerHTML={{ __html: settings?.hero_headline || "I build modern web applications, blending data science with clean, responsive engineering." }}
          />

          {/* Continuous Merged Stats Strip */}
          <StatsRow />

          {/* CTA Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', paddingTop: '4px' }}>
            <button
              className="hero-primary-btn"
              onClick={() => onNavClick?.('contact')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '10px',
                background: 'var(--primary-blue)',
                color: '#ffffff',
                padding: '10px 22px',
                fontSize: '14px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 4px 14px color-mix(in srgb, var(--primary-blue) 35%, transparent)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px color-mix(in srgb, var(--primary-blue) 50%, transparent)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px color-mix(in srgb, var(--primary-blue) 35%, transparent)';
              }}
            >
              <Mail size={16} />
              Get in touch
            </button>
            <button
              className="hero-secondary-btn"
              onClick={triggerResume}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                padding: '10px 22px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = 'var(--primary-blue)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            >
              <Download size={16} style={{ color: 'var(--primary-blue)' }} />
              View resume
            </button>
          </div>
        </div>

        {/* Right Column: Photo with Ambient Glow & Animated Caption */}
        {photoUrl && (
          <div style={{ position: 'relative', width: '100%', maxWidth: '340px', margin: '0 auto' }}>
            <div
              style={{
                position: 'absolute',
                inset: '-10px',
                borderRadius: '32px',
                background: 'radial-gradient(circle, color-mix(in srgb, var(--primary-blue) 25%, transparent) 0%, transparent 70%)',
                filter: 'blur(28px)',
                pointerEvents: 'none',
                zIndex: 0
              }}
            />

            <div className="hero-photo-frame" style={{ zIndex: 1 }}>
              <img src={photoUrl} alt={name} />
              <HeroPhotoCaption
                label="Education"
                title="B.Tech CSE, VIT Vellore"
                subtitle="8.7 CGPA"
              />
            </div>
          </div>
        )}
      </div>

      {/* Tech Stack Marquee */}
      <div className="ticker-wrap">
        {/* Fade gradients on edges */}
        <div style={{
          pointerEvents: 'none',
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          width: '64px',
          background: 'linear-gradient(to right, var(--bg-primary), transparent)',
          zIndex: 2
        }} />
        <div style={{
          pointerEvents: 'none',
          position: 'absolute',
          top: 0,
          bottom: 0,
          right: 0,
          width: '64px',
          background: 'linear-gradient(to left, var(--bg-primary), transparent)',
          zIndex: 2
        }} />

        <div className="animate-marquee-track">
          {[...TECH_STACK, ...TECH_STACK, ...TECH_STACK, ...TECH_STACK].map((item, i) => {
            const IconComp = item.Icon;
            return (
              <span
                key={i}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  whiteSpace: 'nowrap',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  color: 'var(--text-secondary)'
                }}
              >
                <IconComp size={16} style={{ color: 'var(--text-primary)', opacity: 0.85 }} />
                <span>{item.name}</span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
