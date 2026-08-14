import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/landingShowcase.css';

const TECHS = [
  'Python', 'PyTorch', 'React 18', 'TypeScript', 'LangChain',
  'PostgreSQL', 'Supabase', 'Groq LLM', 'ChromaDB', 'Docker',
  'FastAPI', 'Git'
];

export default function LandingShowcase() {
  const navigate = useNavigate();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [arcRotation, setArcRotation] = useState(0);
  const [isoTooltip, setIsoTooltip] = useState({ active: false, text: '', x: 0, y: 0 });
  const [isoTilt, setIsoTilt] = useState({ x: 0, y: 0 });
  const [stats, setStats] = useState({ projects: 0, cgpa: 0, years: 0, frameworks: 0 });

  const arcStageRef = useRef(null);
  const isoContainerRef = useRef(null);
  const statsSectionRef = useRef(null);

  // 1. Mouse glow tracking + Scroll progress
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleScroll = () => {
      const h = document.documentElement;
      const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
      setScrollProgress(scrolled);
      setIsScrolled(h.scrollTop > 40);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 2. Animated Stats Counters with IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        let p = 0, c = 0, y = 0, f = 0;
        const interval = setInterval(() => {
          p = Math.min(15, p + 1);
          c = Math.min(8.7, Number((c + 0.5).toFixed(1)));
          y = Math.min(3, y + 1);
          f = Math.min(10, f + 1);

          setStats({ projects: p, cgpa: c, years: y, frameworks: f });

          if (p === 15 && c >= 8.7 && y === 3 && f === 10) {
            clearInterval(interval);
          }
        }, 60);
        observer.disconnect();
      }
    }, { threshold: 0.2 });

    if (statsSectionRef.current) {
      observer.observe(statsSectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // 3. 3D Arc Mouse Parallax
  const handleArcMouseMove = (e) => {
    if (!arcStageRef.current) return;
    const rect = arcStageRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    setArcRotation(x * 14);
  };

  const handleArcMouseLeave = () => {
    setArcRotation(0);
  };

  // 4. Isometric City Parallax & Tooltip Handlers
  const handleIsoMouseMove = (e) => {
    if (!isoContainerRef.current) return;
    const rect = isoContainerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setIsoTilt({ x: x * 6, y: y * -6 });

    if (isoTooltip.active) {
      setIsoTooltip((prev) => ({
        ...prev,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }));
    }
  };

  const handleIsoMouseLeave = () => {
    setIsoTilt({ x: 0, y: 0 });
    setIsoTooltip({ active: false, text: '', x: 0, y: 0 });
  };

  const showBuildingTooltip = (text, e) => {
    if (!isoContainerRef.current) return;
    const rect = isoContainerRef.current.getBoundingClientRect();
    setIsoTooltip({
      active: true,
      text,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const hideBuildingTooltip = () => {
    setIsoTooltip((prev) => ({ ...prev, active: false }));
  };

  return (
    <div className="landing-page-wrapper">
      {/* Ambient cursor glow */}
      <div
        className="landing-glow"
        style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }}
      />

      {/* Scroll Progress Bar */}
      <div
        className="landing-progress-bar"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Navigation */}
      <nav className={`landing-nav ${isScrolled ? 'scrolled' : ''}`}>
        <Link to="/" className="landing-logo">
          <span className="landing-logo-dot" />
          sujith.dev
        </Link>
        <div className="landing-nav-links">
          <a href="#showcase">Pillars</a>
          <a href="#ecosystem">Ecosystem</a>
          <a href="#about">About</a>
          <a href="#skills">Skills</a>
          <a href="#projects">Projects</a>
          <a href="#contact">Contact</a>
        </div>
        <button
          onClick={() => navigate('/')}
          className="landing-nav-cta"
        >
          Launch Full App →
        </button>
      </nav>

      {/* HERO SECTION */}
      <section className="landing-hero">
        <div className="landing-hero-grid" />
        <div className="landing-hero-blob" />

        <div className="landing-hero-content">
          <div className="landing-eyebrow">
            <span className="landing-logo-dot" /> Open to ML & Full-Stack Opportunities
          </div>
          <h1>
            <span className="line"><span>Engineering intelligent</span></span>
            <span className="line">
              <span>systems with <span className="landing-grad-text homeHero_animatedWord">precision.</span></span>
            </span>
          </h1>
          <p className="sub">
            I'm <strong>Sujith Thota</strong> — a Data Science graduate from VIT University (8.7 CGPA). I architect scalable neural pipelines, interactive RAG models, and sub-millisecond real-time web applications.
          </p>

          <div className="landing-hero-ctas">
            <button
              onClick={() => navigate('/')}
              className="landing-btn-primary"
            >
              Launch Interactive Portfolio →
            </button>
            <a
              href="mailto:sujithreddy1546@gmail.com"
              className="landing-btn-secondary"
            >
              Email me
            </a>
          </div>

          {/* ===== ISOMETRIC AI CITY METROPOLIS WITH HERO FADE & SLIDE ===== */}
          <div className="homeHero_imageAnimationWrapper">
            <div
              className="isometric-city-container"
              ref={isoContainerRef}
              onMouseMove={handleIsoMouseMove}
              onMouseLeave={handleIsoMouseLeave}
            >
            <div
              className={`iso-tooltip ${isoTooltip.active ? 'active' : ''}`}
              style={{ left: `${isoTooltip.x}px`, top: `${isoTooltip.y}px` }}
            >
              {isoTooltip.text}
            </div>

            <svg
              className="iso-svg"
              viewBox="0 0 1000 640"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                transform: `rotateX(${isoTilt.y}deg) rotateY(${isoTilt.x}deg)`,
              }}
            >
              <defs>
                <linearGradient id="roadGradReact" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#f1f5f9" />
                </linearGradient>
                <linearGradient id="towerGradReact" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#00d09c" />
                </linearGradient>
                <linearGradient id="domeGradReact" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00d09c" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="vitGradReact" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#e0e7ff" />
                  <stop offset="100%" stopColor="#c7d2fe" />
                </linearGradient>
              </defs>

              {/* Isometric Base Grid Island */}
              <polygon points="500,80 940,300 500,520 60,300" fill="url(#roadGradReact)" stroke="#cbd5e1" strokeWidth="2" />
              <polygon points="500,520 940,300 940,330 500,550" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1.5" />
              <polygon points="500,520 60,300 60,330 500,550" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.5" />

              {/* Isometric Road Network */}
              <path d="M500,120 L860,300 L500,480 L140,300 Z" fill="none" stroke="#e2e8f0" strokeWidth="32" strokeLinejoin="round" />
              <path d="M500,120 L860,300 L500,480 L140,300 Z" fill="none" stroke="rgba(0,208,156,0.6)" strokeWidth="2" strokeDasharray="8 12" />

              {/* Cross Connectors */}
              <line x1="320" y1="210" x2="680" y2="390" stroke="#e2e8f0" strokeWidth="24" />
              <line x1="320" y1="210" x2="680" y2="390" stroke="rgba(99,102,241,0.4)" strokeWidth="2" strokeDasharray="6 8" />

              {/* Animated Data Vehicles / Packets on Roads */}
              <g className="iso-car-1">
                <circle cx="0" cy="0" r="5" fill="#00e6a8" filter="drop-shadow(0 0 8px #00e6a8)" />
              </g>
              <g className="iso-car-2">
                <circle cx="0" cy="0" r="5" fill="#a855f7" filter="drop-shadow(0 0 8px #a855f7)" />
              </g>

              {/* 1. NEURAL COMPUTE TOWER (GPU & GROQ CORE) */}
              <g
                className="iso-building"
                onMouseEnter={(e) => showBuildingTooltip('⚡ Neural Compute Core • Groq Llama 3 (70B Tokens/s)', e)}
                onMouseLeave={hideBuildingTooltip}
                onClick={() => navigate('/')}
              >
                <path d="M360,260 L420,230 L420,100 L360,130 Z" fill="#201b44" stroke="#483d8b" strokeWidth="1.5" />
                <path d="M420,230 L480,260 L480,130 L420,100 Z" fill="#2f2863" stroke="#483d8b" strokeWidth="1.5" />
                <polygon points="420,100 480,130 420,160 360,130" fill="url(#towerGradReact)" stroke="#6a1bff" strokeWidth="2" />

                <line x1="375" y1="150" x2="405" y2="135" stroke="#00e6a8" strokeWidth="2.5" opacity="0.85" />
                <line x1="375" y1="180" x2="405" y2="165" stroke="#00e6a8" strokeWidth="2.5" opacity="0.85" />
                <line x1="375" y1="210" x2="405" y2="195" stroke="#00e6a8" strokeWidth="2.5" opacity="0.85" />

                <line x1="435" y1="165" x2="465" y2="180" stroke="#a855f7" strokeWidth="2.5" opacity="0.85" />
                <line x1="435" y1="195" x2="465" y2="210" stroke="#a855f7" strokeWidth="2.5" opacity="0.85" />
                <line x1="435" y1="225" x2="465" y2="240" stroke="#a855f7" strokeWidth="2.5" opacity="0.85" />

                <line x1="420" y1="130" x2="420" y2="60" stroke="#00e6a8" strokeWidth="2" className="iso-laser" />
                <circle cx="420" cy="60" r="4" fill="#00e6a8" filter="drop-shadow(0 0 10px #00e6a8)" />
              </g>

              {/* 2. ACADEMIC & DATA SCIENCE HUB (VIT VELLORE CAMPUS) */}
              <g
                className="iso-building"
                onMouseEnter={(e) => showBuildingTooltip('🎓 Academic Center • VIT University (8.7 CGPA Honors)', e)}
                onMouseLeave={hideBuildingTooltip}
                onClick={() => navigate('/')}
              >
                <polygon points="460,330 580,270 580,350 460,410" fill="url(#vitGradReact)" stroke="#3f3875" strokeWidth="1.5" />
                <polygon points="580,270 660,310 660,390 580,350" fill="#1d1a38" stroke="#3f3875" strokeWidth="1.5" />
                <polygon points="460,330 580,270 660,310 540,370" fill="#38326a" stroke="#524a8f" strokeWidth="2" />

                <line x1="480" y1="345" x2="480" y2="395" stroke="#a5b4fc" strokeWidth="3" />
                <line x1="510" y1="330" x2="510" y2="380" stroke="#a5b4fc" strokeWidth="3" />
                <line x1="540" y1="315" x2="540" y2="365" stroke="#a5b4fc" strokeWidth="3" />
                <line x1="570" y1="300" x2="570" y2="350" stroke="#a5b4fc" strokeWidth="3" />

                <polygon points="580,245 610,260 580,275 550,260" fill="#eab308" filter="drop-shadow(0 0 8px rgba(234,179,8,0.6))" />
              </g>

              {/* 3. DEEP LEARNING VISION DOME */}
              <g
                className="iso-building"
                onMouseEnter={(e) => showBuildingTooltip('🧠 Medical AI Dome • ResNet50 MRI Vision (98.2% Accuracy)', e)}
                onMouseLeave={hideBuildingTooltip}
                onClick={() => navigate('/')}
              >
                <ellipse cx="680" cy="270" rx="60" ry="35" fill="url(#domeGradReact)" opacity="0.85" stroke="#00e6a8" strokeWidth="2" />
                <path d="M620,270 C620,220 740,220 740,270 Z" fill="rgba(0,230,168,0.25)" stroke="#00e6a8" strokeWidth="1.5" />
                <ellipse cx="680" cy="245" rx="35" ry="20" fill="none" stroke="#ffffff" strokeWidth="1" strokeDasharray="4 4" />
                <circle cx="680" cy="235" r="5" fill="#ffffff" filter="drop-shadow(0 0 10px #00e6a8)" />
              </g>

              {/* 4. CLOCK TOWER & TELEMETRY MONOLITH */}
              <g
                className="iso-building"
                onMouseEnter={(e) => showBuildingTooltip('⏱️ Telemetry Monolith • 🟢 24ms Live Database Heartbeat', e)}
                onMouseLeave={hideBuildingTooltip}
                onClick={() => navigate('/')}
              >
                <polygon points="260,330 290,315 290,410 260,425" fill="#1b1836" stroke="#483d8b" strokeWidth="1.5" />
                <polygon points="290,315 320,330 320,425 290,410" fill="#2a2552" stroke="#483d8b" strokeWidth="1.5" />
                <polygon points="260,330 290,315 320,330 290,345" fill="#3b82f6" stroke="#60a5fa" strokeWidth="1.5" />
                <circle cx="275" cy="355" r="6" fill="#00e6a8" opacity="0.9" />
                <circle cx="305" cy="355" r="6" fill="#00e6a8" opacity="0.9" />
              </g>

              {/* 5. ISOMETRIC CYBER TREES */}
              <g>
                <polygon points="340,370 380,350 420,370 380,390" fill="#064e3b" stroke="#059669" strokeWidth="1" />
                <circle cx="380" cy="355" r="8" fill="#10b981" />
                <polygon points="680,410 720,390 760,410 720,430" fill="#064e3b" stroke="#059669" strokeWidth="1" />
                <circle cx="720" cy="395" r="8" fill="#10b981" />
                <circle cx="745" cy="405" r="6" fill="#34d399" />
              </g>

              {/* 6. BILLBOARD SIGNPOST */}
              <g
                className="iso-building"
                onMouseEnter={(e) => showBuildingTooltip('📢 Operations Center • P2P Sync & WebSocket Broadcast', e)}
                onMouseLeave={hideBuildingTooltip}
                onClick={() => navigate('/')}
              >
                <polygon points="760,230 820,200 820,240 760,270" fill="#059669" stroke="#10b981" strokeWidth="1.5" />
                <line x1="770" y1="265" x2="770" y2="305" stroke="#4b5563" strokeWidth="3" />
                <line x1="810" y1="245" x2="810" y2="285" stroke="#4b5563" strokeWidth="3" />
                <text x="770" y="240" fill="#ffffff" fontFamily="'Space Grotesk',sans-serif" fontSize="10" fontWeight="700">P2P SYNC</text>
              </g>
            </svg>
          </div>
        </div>

          {/* Signature Live Telemetry Terminal */}
          <div className="landing-ticker">
            <div className="landing-ticker-head">
              <span className="landing-ticker-dot" style={{ background: '#ff5f56' }} />
              <span className="landing-ticker-dot" style={{ background: '#ffbd2e' }} />
              <span className="landing-ticker-dot" style={{ background: '#27c93f' }} />
              <span>sujith_telemetry.log — live</span>
            </div>
            <div className="landing-ticker-body">
              <div><span className="landing-ticker-prompt">$ </span>checking telemetry status...</div>
              <div><span className="landing-ticker-prompt">&gt; </span>training: Brain Tumor CNN (ResNet50)</div>
              <div><span className="landing-ticker-prompt">&gt; </span>loss convergence: optimal ✓</div>
              <div><span className="landing-ticker-prompt">&gt; </span>deployed: Groq Llama 3 RAG Assistant</div>
              <div>
                <span className="landing-ticker-prompt">$ </span>status: open to ML & Full-Stack roles
                <span className="landing-ticker-cursor" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <div className="landing-stats-bar" ref={statsSectionRef}>
        <div className="landing-stat">
          <div className="landing-stat-num">{stats.projects}+</div>
          <div className="landing-stat-lbl">Projects shipped</div>
        </div>
        <div className="landing-stat">
          <div className="landing-stat-num">{stats.cgpa || '8.7'}</div>
          <div className="landing-stat-lbl">CGPA (VIT University)</div>
        </div>
        <div className="landing-stat">
          <div className="landing-stat-num">{stats.years}+</div>
          <div className="landing-stat-lbl">Years building ML & Web</div>
        </div>
        <div className="landing-stat">
          <div className="landing-stat-num">{stats.frameworks}+</div>
          <div className="landing-stat-lbl">Core frameworks mastered</div>
        </div>
      </div>

      {/* ===== 3D GROWW PERSPECTIVE CARD ARC ===== */}
      <div className="curve-showcase-section" id="showcase">
        <div className="curve-header">
          <div className="landing-eyebrow">Interactive 3D Perspective Arc</div>
          <h2>Engineering simplified, across every dimension</h2>
          <div className="curve-pill" onClick={() => navigate('/')}>
            <span className="curve-pill-icon">
              <svg width="8" height="8" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z" /></svg>
            </span>
            <span>Explore Interactive Portfolio</span>
          </div>
        </div>

        {/* 3D Rotating Carousel Ring Stage (Merry-Go-Round) */}
        <div className="carousel-ring-stage">
          <div className="carousel-ring-inner">
            {/* Card 1 */}
            <div className="carousel-card-item c-gold" onClick={() => navigate('/')}>
              <div>
                <div className="card-top-tag">Deep Learning & Vision</div>
                <div className="card-sub">ResNet50 MRI Tumor Classification</div>
              </div>
              <div className="card-art">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#78350f" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 3v18M3 12h18M7 7l10 10M17 7L7 17" />
                </svg>
              </div>
            </div>

            {/* Card 2 */}
            <div className="carousel-card-item c-noir" onClick={() => navigate('/')}>
              <div>
                <div className="card-top-tag">Campus & Research</div>
                <div className="card-sub">VIT University • 8.7 CGPA Honors</div>
              </div>
              <div className="card-art">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.8">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c0 3 6 3 6 3s6 0 6-3v-5" />
                </svg>
              </div>
            </div>

            {/* Card 3 */}
            <div className="carousel-card-item c-olive" onClick={() => navigate('/')}>
              <div>
                <div className="card-top-tag">Generative AI & LLMs</div>
                <div className="card-sub">Groq Llama 3 • ChromaDB Vector RAG</div>
              </div>
              <div className="card-art">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#14532d" strokeWidth="1.8">
                  <path d="M12 2a8 8 0 0 0-8 8c0 3.4 2.1 6.3 5.1 7.4L9 22l4-2 4 2-.1-4.6c3-1.1 5.1-4 5.1-7.4a8 8 0 0 0-8-8z" />
                </svg>
              </div>
            </div>

            {/* Card 4 */}
            <div className="carousel-card-item c-darkgreen" onClick={() => navigate('/')}>
              <div>
                <div className="card-top-tag">Realtime Systems</div>
                <div className="card-sub">P2P Broadcast & Supabase Telemetry</div>
              </div>
              <div className="card-art">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#00d09c" strokeWidth="1.8">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
            </div>

            {/* Card 5 */}
            <div className="carousel-card-item c-rose" onClick={() => navigate('/')}>
              <div>
                <div className="card-top-tag">Reactive UI Craft</div>
                <div className="card-sub">React 18 • TypeScript • Zero-Crash</div>
              </div>
              <div className="card-art">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#881337" strokeWidth="1.8">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              </div>
            </div>

            {/* Card 6 */}
            <div className="carousel-card-item c-cyan" onClick={() => navigate('/')}>
              <div>
                <div className="card-top-tag">Cloud & Edge</div>
                <div className="card-sub">Docker • Redis • CI/CD Pipelines</div>
              </div>
              <div className="card-art">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#0e7490" strokeWidth="1.8">
                  <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== DARK LUXURY ECOSYSTEM CARDS ===== */}
      <div className="eco-section" id="ecosystem">
        <div className="eco-header">
          <div className="landing-eyebrow">Core Ecosystem & Labs</div>
          <h2>More from the engineering family</h2>
        </div>

        <div className="eco-grid">
          <div
            className="eco-card eco-1 stocksSection_cardContainer stagger-card-entry"
            style={{ '--index': 0 }}
            onClick={() => navigate('/')}
          >
            <div className="eco-bg-pattern" />
            <div className="eco-hero-text">98.2</div>
            <div className="eco-sub-label">Neural Vision Accuracy</div>
          </div>

          <div
            className="eco-card eco-2 stocksSection_cardContainer stagger-card-entry"
            style={{ '--index': 1 }}
            onClick={() => navigate('/')}
          >
            <div className="eco-bg-pattern" />
            <div className="eco-hero-text">VIT</div>
            <div className="eco-sub-label">8.7 CGPA Data Science</div>
          </div>

          <div
            className="eco-card eco-3 stocksSection_cardContainer stagger-card-entry"
            style={{ '--index': 2 }}
            onClick={() => navigate('/')}
          >
            <div className="eco-bg-pattern" />
            <div className="eco-hero-text">
              <div className="eco-circle-emblem" />
              <div className="eco-brand-title">Sync</div>
            </div>
            <div className="eco-sub-label">P2P Broadcast Engine</div>
          </div>
        </div>
      </div>

      {/* ABOUT SECTION */}
      <section className="landing-section" id="about">
        <div className="landing-about-grid">
          <div className="landing-about-visual">
            <div className="landing-orbit-code">
              <span style={{ color: '#c792ea' }}>const</span> engineer = {'{'}<br />
              &nbsp;&nbsp;<span style={{ color: '#5f5a80' }}>name:</span> <span style={{ color: '#89ddff' }}>'Sujith Thota'</span>,<br />
              &nbsp;&nbsp;<span style={{ color: '#5f5a80' }}>degree:</span> <span style={{ color: '#89ddff' }}>'B.Tech CSE (Data Science)'</span>,<br />
              &nbsp;&nbsp;<span style={{ color: '#5f5a80' }}>institution:</span> <span style={{ color: '#89ddff' }}>'VIT University'</span>,<br />
              &nbsp;&nbsp;<span style={{ color: '#5f5a80' }}>focus:</span> <span style={{ color: '#89ddff' }}>'Deep Learning + RAG + Realtime Web'</span>,<br />
              &nbsp;&nbsp;<span style={{ color: '#5f5a80' }}>status:</span> <span style={{ color: '#89ddff' }}>'shipping production code'</span><br />
              {'}'};
            </div>
          </div>
          <div>
            <div className="landing-eyebrow">Background</div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.4vw, 2.6rem)', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '22px' }}>
              Data science rigor meets full-stack craftsmanship.
            </h2>
            <p style={{ color: '#948fb3', fontSize: '1.05rem', lineHeight: 1.75, marginBottom: '20px' }}>
              I specialize in bridging the gap between <strong>Machine Learning research</strong> and <strong>high-performance production software</strong>. Whether training deep convolutional neural networks or tuning sub-millisecond database caching layers, I build systems designed for reliability and zero latency.
            </p>
            <p style={{ color: '#948fb3', fontSize: '1.05rem', lineHeight: 1.75 }}>
              My work combines mathematical foundations in <strong>Linear Algebra, Statistics, and Deep Learning</strong> with modern web engineering across React 18, Node.js, and Supabase PostgreSQL.
            </p>
            <div className="landing-about-tags">
              {['Python', 'PyTorch', 'React 18', 'TypeScript', 'LangChain', 'PostgreSQL', 'Docker', 'Groq LLM'].map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SKILLS SECTION */}
      <section className="landing-section" id="skills" style={{ paddingTop: 0 }}>
        <div style={{ maxWidth: 660, marginBottom: 70 }}>
          <div className="landing-eyebrow">Technical Arsenal</div>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 600, letterSpacing: '-0.02em' }}>Core competencies & depth</h2>
          <p style={{ color: '#948fb3', marginTop: 16, fontSize: '1.05rem', lineHeight: 1.6 }}>Comprehensive skills across machine learning model development, backend APIs, and reactive frontend architectures.</p>
        </div>

        <div className="landing-skills-grid">
          <div className="landing-skill-card">
            <div className="landing-skill-pct">94%</div>
            <div style={{ color: '#948fb3', fontSize: '0.92rem', marginBottom: 18 }}>Machine Learning & PyTorch</div>
            <div className="landing-skill-bar"><div className="landing-skill-bar-fill" style={{ width: '94%' }} /></div>
          </div>
          <div className="landing-skill-card">
            <div className="landing-skill-pct">92%</div>
            <div style={{ color: '#948fb3', fontSize: '0.92rem', marginBottom: 18 }}>Frontend (React & TypeScript)</div>
            <div className="landing-skill-bar"><div className="landing-skill-bar-fill" style={{ width: '92%' }} /></div>
          </div>
          <div className="landing-skill-card">
            <div className="landing-skill-pct">88%</div>
            <div style={{ color: '#948fb3', fontSize: '0.92rem', marginBottom: 18 }}>PostgreSQL & Supabase Realtime</div>
            <div className="landing-skill-bar"><div className="landing-skill-bar-fill" style={{ width: '88%' }} /></div>
          </div>
          <div className="landing-skill-card">
            <div className="landing-skill-pct">85%</div>
            <div style={{ color: '#948fb3', fontSize: '0.92rem', marginBottom: 18 }}>RAG, LangChain & Vector DBs</div>
            <div className="landing-skill-bar"><div className="landing-skill-bar-fill" style={{ width: '85%' }} /></div>
          </div>
        </div>

        <div className="landing-marquee-wrap">
          <div className="landing-marquee">
            {[...TECHS, ...TECHS].map((t, idx) => (
              <span key={idx}><b>{t}</b> ✦</span>
            ))}
          </div>
        </div>
      </section>

      {/* SELECTED PROJECTS */}
      <section className="landing-section" id="projects" style={{ paddingTop: 0 }}>
        <div style={{ maxWidth: 660, marginBottom: 70 }}>
          <div className="landing-eyebrow">Selected Engineering Projects</div>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 600, letterSpacing: '-0.02em' }}>Production work & machine learning architectures</h2>
        </div>

        <div className="landing-projects-grid">
          <div className="landing-proj-card" onClick={() => navigate('/')}>
            <div className="landing-proj-media"><div className="glyph">AI</div></div>
            <div className="landing-proj-body">
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: '#00e6a8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>GenAI & Financial Tech</div>
              <h3 style={{ fontSize: '1.25rem', margin: '10px 0', fontWeight: 600 }}>AI Financial Advisor & RAG Assistant</h3>
              <p style={{ color: '#948fb3', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: 18 }}>Interactive portfolio assistant with streaming Groq Llama 3 inference, ChromaDB vector retrieval, and 1-click CMS data backup.</p>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', fontWeight: 600, color: '#f3f1fb' }}>Explore in interactive app →</span>
            </div>
          </div>

          <div className="landing-proj-card" onClick={() => navigate('/')}>
            <div className="landing-proj-media"><div className="glyph">DL</div></div>
            <div className="landing-proj-body">
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: '#00e6a8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Deep Learning & Vision</div>
              <h3 style={{ fontSize: '1.25rem', margin: '10px 0', fontWeight: 600 }}>Brain Tumor MRI Classification</h3>
              <p style={{ color: '#948fb3', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: 18 }}>Deep Convolutional Neural Network utilizing transfer learning (ResNet50) for high-confidence multi-class MRI tumor classification.</p>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', fontWeight: 600, color: '#f3f1fb' }}>View architecture specs →</span>
            </div>
          </div>

          <div className="landing-proj-card" onClick={() => navigate('/')}>
            <div className="landing-proj-media"><div className="glyph">P2P</div></div>
            <div className="landing-proj-body">
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: '#00e6a8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Distributed Systems</div>
              <h3 style={{ fontSize: '1.25rem', margin: '10px 0', fontWeight: 600 }}>Realtime Operations & Sync Hub</h3>
              <p style={{ color: '#948fb3', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: 18 }}>P2P BroadcastChannel state replication with Supabase Postgres change streams, live latency telemetry, and zero-crash boundaries.</p>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', fontWeight: 600, color: '#f3f1fb' }}>Launch live demo →</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section style={{ padding: '0 6vw 80px' }}>
        <div className="landing-cta-section">
          <div className="landing-cta-glow" />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h2 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 20 }}>Let's build something remarkable.</h2>
            <p style={{ color: '#948fb3', maxWidth: 520, margin: '0 auto 40px', fontSize: '1.05rem', lineHeight: 1.65 }}>Interested in collaborating on Machine Learning, Data Science research, or Full-Stack software engineering? Let's connect.</p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="mailto:sujithreddy1546@gmail.com" className="landing-btn-primary">sujithreddy1546@gmail.com →</a>
              <button onClick={() => navigate('/')} className="landing-btn-secondary">Open Full React App ⚡</button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer" id="contact">
        <Link to="/" className="landing-logo">
          <span className="landing-logo-dot" />
          sujith.dev
        </Link>
        <div className="landing-footer-links">
          <a href="https://github.com/sujith1546" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://linkedin.com/in/sujiththota" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href="mailto:sujithreddy1546@gmail.com">Email</a>
          <Link to="/">Interactive App</Link>
        </div>
        <div style={{ color: '#5f5a80', fontSize: '0.82rem' }}>
          © {new Date().getFullYear()} Sujith Thota. Built with intent.
        </div>
      </footer>
    </div>
  );
}
