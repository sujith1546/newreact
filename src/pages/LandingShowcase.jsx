import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/landingShowcase.css';

const MARQUEE_ROW1 = [
  { name: 'PyTorch', tag: 'Deep Learning', dot: '#ee4c2c' },
  { name: 'Groq LLaMA 3', tag: '70B Tokens/s', dot: '#00d09c' },
  { name: 'LangChain', tag: 'RAG Pipeline', dot: '#6366f1' },
  { name: 'ChromaDB', tag: 'Vector Store', dot: '#8b5cf6' },
  { name: 'ResNet-50', tag: '98.2% MRI Vision', dot: '#059669' },
  { name: 'FastAPI', tag: 'Async Inference', dot: '#0284c7' },
  { name: 'Python', tag: 'Data Science Core', dot: '#2563eb' },
  { name: 'HuggingFace', tag: 'NLP Transformers', dot: '#d97706' },
];

const MARQUEE_ROW2 = [
  { name: 'React 18', tag: 'Concurrent UI', dot: '#06b6d4' },
  { name: 'TypeScript', tag: 'Type-Safe Architecture', dot: '#3b82f6' },
  { name: 'Supabase', tag: 'Postgres CDC Streams', dot: '#10b981' },
  { name: 'Docker', tag: 'Containerized Edge', dot: '#0ea5e9' },
  { name: 'Redis', tag: 'Sub-ms Memory Cache', dot: '#ef4444' },
  { name: 'PostgreSQL', tag: 'Relational Schemas', dot: '#475569' },
  { name: 'Tailwind CSS', tag: 'Design Tokens', dot: '#38bdf8' },
  { name: 'BroadcastChannel', tag: '<1ms P2P Sync', dot: '#8b5cf6' },
];

const CAROUSEL_CARDS = [
  { tag: '01 • GenAI',      title: 'NewsTrader AI',    desc: 'Groq Llama 3 • ChromaDB Vector RAG',    tone: 'te' },
  { tag: '02 • Vision',     title: 'Brain Tumor CNN',  desc: 'ResNet50 MRI • 98.2% Accuracy',         tone: 'ti' },
  { tag: '03 • Realtime',   title: 'P2P Sync Hub',     desc: 'BroadcastChannel • <1ms Replication',   tone: 'ta' },
  { tag: '04 • Academia',   title: 'VIT Research',     desc: '8.7 CGPA • Data Science Honors',        tone: 'tc' },
  { tag: '05 • Inference',  title: 'Groq LLM Core',    desc: '70B Tokens/s • Live Streaming RAG',     tone: 'tr' },
  { tag: '06 • Database',   title: 'Supabase Stream',  desc: 'PostgreSQL CDC • Live Change Stream',   tone: 'te' },
  { tag: '07 • Security',   title: 'Admin CMS & MFA',  desc: 'TOTP 2FA • Immutable Audit Trails',     tone: 'ti' },
  { tag: '08 • Embeddings', title: 'Vector Memory',    desc: 'ChromaDB + LangChain Pipeline',         tone: 'ta' },
  { tag: '09 • Cloud',      title: 'Edge & Container', desc: 'Docker, Redis • Zero-Lag Pipelines',    tone: 'tc' },
  { tag: '10 • Telemetry',  title: 'Telemetry Hub',    desc: '24ms Database Heartbeat Monitor',       tone: 'tr' },
];



// ─── Carousel Radius Hook ────────────────────────────────────────────────────
// Mirrors the reference HTML's JS: radius = (cardWidth/2) / tan(PI/n) + 40
// Sets --ls-r3d on the wrapper and injects rotateY + translateZ per card.
function useCarousel(wrapperRef, n) {
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const isMobile = window.innerWidth <= 640;
    const cardW = isMobile ? 140 : 190;
    const radius = Math.round((cardW / 2) / Math.tan(Math.PI / n)) + 40;
    const step = 360 / n;
    wrapper.style.setProperty('--ls-r3d', radius + 'px');
    const cards = wrapper.querySelectorAll('.ls-cyl-card');
    cards.forEach((card, i) => {
      card.style.transform = `rotateY(${i * step}deg) translateZ(${radius}px)`;
    });
  }, [wrapperRef, n]);
}

// ─── Neural Canvas Hook ───────────────────────────────────────────────────────
function useNeuralCanvas(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let W, H, nodes = [];
    const N = 60, DIST = 135;

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class Node {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * W;
        this.y = Math.random() * H;
        this.vx = (Math.random() - .5) * .32;
        this.vy = (Math.random() - .5) * .32;
        this.r = Math.random() * 2 + 1.2;
        this.hue = Math.random() < .6 ? 161 : 237;
        this.a = Math.random() * .5 + .2;
      }
      update() {
        this.x += this.vx; this.y += this.vy;
        if (this.x < -10 || this.x > W + 10 || this.y < -10 || this.y > H + 10) this.reset();
      }
    }
    for (let i = 0; i < N; i++) nodes.push(new Node());

    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < DIST) {
            ctx.strokeStyle = `rgba(0,208,156,${(1 - d / DIST) * .16})`;
            ctx.lineWidth = .7;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }
      nodes.forEach(n => {
        ctx.fillStyle = n.hue === 161
          ? `rgba(0,208,156,${n.a})`
          : `rgba(99,102,241,${n.a})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
        n.update();
      });
      animId = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, [canvasRef]);
}



// ─── Scroll Reveal Hook ───────────────────────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add('ls-in');
          obs.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.ls-reveal, .ls-reveal-l, .ls-reveal-r, .ls-reveal-s').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

// ─── 3D Tilt Hook ─────────────────────────────────────────────────────────────
function useTilt(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      el.style.transform = `perspective(900px) rotateY(${x * 14}deg) rotateX(${-y * 10}deg) scale(1.02)`;
    };
    const onLeave = () => { el.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg) scale(1)'; };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave); };
  }, [ref]);
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function TiltCard({ className, onClick, children }) {
  const ref = useRef(null);
  useTilt(ref);
  return <div ref={ref} className={className} onClick={onClick}>{children}</div>;
}

function MagneticBtn({ className, onClick, href, children, style }) {
  const ref = useRef(null);
  const onMove = useCallback((e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) * .28;
    const y = (e.clientY - r.top - r.height / 2) * .28;
    el.style.transform = `translate(${x}px,${y}px)`;
  }, []);
  const onLeave = useCallback(() => { if (ref.current) ref.current.style.transform = ''; }, []);
  const props = { ref, className, onMouseMove: onMove, onMouseLeave: onLeave, style };
  if (href) return <a href={href} {...props}>{children}</a>;
  return <button onClick={onClick} {...props}>{children}</button>;
}

// ─── Carousel Section Component ──────────────────────────────────────────────
// Isolated so useCarousel fires after this subtree mounts (cards already in DOM).
function CarouselSection({ navigate }) {
  const wrapperRef = useRef(null);
  useCarousel(wrapperRef, CAROUSEL_CARDS.length);

  return (
    <div className="ls-carousel-section ls-reveal" id="showcase">
      <div className="ls-section-header">
        <div className="ls-eyebrow">Interactive 3D Pillar Showcase</div>
        <h2>Engineering simplified, across every dimension</h2>
        <p>10 domains · one revolving cylinder · hover to pause</p>
        <div className="ls-live-pill" onClick={() => navigate('/')}>
          <span className="ls-live-dot" />
          Explore Interactive Portfolio
        </div>
      </div>
      <div className="ls-carousel-wrapper" ref={wrapperRef}>
        <div className="ls-carousel-track">
          {CAROUSEL_CARDS.map((c, i) => (
            <div
              key={i}
              className={`ls-cyl-card ls-${c.tone}`}
              onClick={() => navigate('/')}
              // transform will be overwritten by useCarousel after mount
            >
              <span className="ls-cc-glyph" />
              <span className="ls-cc-tag">{c.tag}</span>
              <span className="ls-cc-title">{c.title}</span>
              <span className="ls-cc-desc">{c.desc}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="ls-carousel-hint">{CAROUSEL_CARDS.length} pillars · pure CSS transform</p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LandingShowcase() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const isoRef = useRef(null);
  const statsRef = useRef(null);

  const [scrollPct, setScrollPct] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isoTilt, setIsoTilt] = useState({ x: 0, y: 0 });
  const [tooltip, setTooltip] = useState({ active: false, text: '', x: 0, y: 0 });
  const [stats, setStats] = useState({ p: 0, c: '0', y: 0, f: 0 });

  // Neural canvas
  useNeuralCanvas(canvasRef);
  // Scroll reveals
  useScrollReveal();

  // Scroll + mouse
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      setScrollPct((h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100);
      setIsScrolled(h.scrollTop > 50);
    };
    const onMouse = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('scroll', onScroll);
    window.addEventListener('mousemove', onMouse);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('mousemove', onMouse); };
  }, []);

  // Stats counter
  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      let start = null;
      const dur = 1800;
      function tick(ts) {
        if (!start) start = ts;
        const p = Math.min((ts - start) / dur, 1);
        const e = 1 - Math.pow(1 - p, 4);
        setStats({
          p: Math.floor(15 * e),
          c: (8.7 * e).toFixed(1),
          y: Math.floor(3 * e),
          f: Math.floor(10 * e),
        });
        if (p < 1) requestAnimationFrame(tick);
        else setStats({ p: 15, c: '8.7', y: 3, f: 10 });
      }
      requestAnimationFrame(tick);
      obs.disconnect();
    }, { threshold: 0.15 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  // Iso tilt handlers
  const onIsoMove = (e) => {
    if (!isoRef.current) return;
    const r = isoRef.current.getBoundingClientRect();
    setIsoTilt({ x: (e.clientX - r.left) / r.width - .5, y: (e.clientY - r.top) / r.height - .5 });
    if (tooltip.active) setTooltip(t => ({ ...t, x: e.clientX - r.left, y: e.clientY - r.top }));
  };
  const onIsoLeave = () => { setIsoTilt({ x: 0, y: 0 }); setTooltip({ active: false, text: '', x: 0, y: 0 }); };
  const showTip = (text, e) => {
    if (!isoRef.current) return;
    const r = isoRef.current.getBoundingClientRect();
    setTooltip({ active: true, text, x: e.clientX - r.left, y: e.clientY - r.top });
  };
  const hideTip = () => setTooltip(t => ({ ...t, active: false }));

  return (
    <div className="ls-wrap">
      {/* Neural canvas */}
      <canvas ref={canvasRef} className="ls-canvas" />

      {/* Progress */}
      <div className="ls-progress" style={{ width: `${scrollPct}%` }} />

      {/* ─── NAV ─── */}
      <nav className={`ls-nav${isScrolled ? ' ls-nav-scrolled' : ''}`}>
        <Link to="/" className="ls-logo">
          <span className="ls-logo-dot" />
          sujith.dev
        </Link>
        <div className="ls-nav-links">
          <a href="#showcase">Pillars</a>
          <a href="#ecosystem">Ecosystem</a>
          <a href="#about">About</a>
          <a href="#skills">Skills</a>
          <a href="#projects">Projects</a>
          <a href="#contact">Contact</a>
        </div>
        <MagneticBtn className="ls-nav-cta" onClick={() => navigate('/')}>
          Launch Full App →
        </MagneticBtn>
      </nav>

      {/* ─── HERO ─── */}
      <section className="ls-hero">
        <div className="ls-hero-aurora" />
        <div className="ls-hero-grid" />



        <div className="ls-hero-content">
          <div className="ls-status-badge">
            <span className="ls-status-dot" />
            Open to ML &amp; Full-Stack Opportunities
          </div>

          <h1 className="ls-hero-h1">
            <span className="ls-word">Engineering</span>{' '}
            <span className="ls-word">intelligent</span>
            <br />
            <span className="ls-word">systems</span>{' '}
            <span className="ls-word">with</span>{' '}
            <span className="ls-word ls-grad-text">precision.</span>
          </h1>

          <p className="ls-hero-sub">
            I'm <strong>Sujith Thota</strong> — a Data Science graduate from VIT University (8.7 CGPA).
            I architect scalable neural pipelines, interactive RAG models, and sub-millisecond real-time web applications.
          </p>

          <div className="ls-hero-ctas">
            <MagneticBtn className="ls-btn-primary" onClick={() => navigate('/')}>
              Launch Interactive Portfolio →
            </MagneticBtn>
            <MagneticBtn className="ls-btn-secondary" href="mailto:sujithreddy1546@gmail.com">
              Email me ↗
            </MagneticBtn>
          </div>

          {/* Isometric City */}
          <div className="ls-iso-wrapper">
            <div
              className="ls-iso-container"
              ref={isoRef}
              onMouseMove={onIsoMove}
              onMouseLeave={onIsoLeave}
            >
              <div
                className={`ls-iso-tooltip${tooltip.active ? ' ls-active' : ''}`}
                style={{ left: tooltip.x, top: tooltip.y }}
              >
                {tooltip.text}
              </div>
              <svg
                className="ls-iso-svg"
                viewBox="0 0 1000 640"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ transform: `rotateX(${isoTilt.y * -6}deg) rotateY(${isoTilt.x * 6}deg)` }}
              >
                <defs>
                  <linearGradient id="lsRoad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" /><stop offset="100%" stopColor="#f1f5f9" />
                  </linearGradient>
                  <linearGradient id="lsTower" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" /><stop offset="50%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#00d09c" />
                  </linearGradient>
                  <linearGradient id="lsDome" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00d09c" /><stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                  <linearGradient id="lsVit" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#e0e7ff" /><stop offset="100%" stopColor="#c7d2fe" />
                  </linearGradient>
                </defs>
                <polygon points="500,80 940,300 500,520 60,300" fill="url(#lsRoad)" stroke="#cbd5e1" strokeWidth="2" />
                <polygon points="500,520 940,300 940,330 500,550" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1.5" />
                <polygon points="500,520 60,300 60,330 500,550" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.5" />
                <path d="M500,120 L860,300 L500,480 L140,300 Z" fill="none" stroke="#e2e8f0" strokeWidth="32" strokeLinejoin="round" />
                <path d="M500,120 L860,300 L500,480 L140,300 Z" fill="none" stroke="rgba(0,208,156,0.6)" strokeWidth="2" strokeDasharray="8 12" />
                <line x1="320" y1="210" x2="680" y2="390" stroke="#e2e8f0" strokeWidth="24" />
                <line x1="320" y1="210" x2="680" y2="390" stroke="rgba(99,102,241,0.4)" strokeWidth="2" strokeDasharray="6 8" />
                <g className="iso-car-1"><circle cx="0" cy="0" r="5.5" fill="#00d09c" filter="drop-shadow(0 0 8px #00d09c)" /></g>
                <g className="iso-car-2"><circle cx="0" cy="0" r="5.5" fill="#6366f1" filter="drop-shadow(0 0 8px #6366f1)" /></g>
                <g className="iso-car-3"><circle cx="0" cy="0" r="4" fill="#f59e0b" filter="drop-shadow(0 0 6px #f59e0b)" /></g>
                {/* Neural Compute Tower */}
                <g className="iso-building" onMouseEnter={(e) => showTip('⚡ Neural Compute Core • Groq Llama 3 (70B Tokens/s)', e)} onMouseLeave={hideTip} onClick={() => navigate('/')}>
                  <path d="M360,260 L420,230 L420,100 L360,130 Z" fill="#312e81" stroke="#4338ca" strokeWidth="1.5" />
                  <path d="M420,230 L480,260 L480,130 L420,100 Z" fill="#3730a3" stroke="#4338ca" strokeWidth="1.5" />
                  <polygon points="420,100 480,130 420,160 360,130" fill="url(#lsTower)" stroke="#6366f1" strokeWidth="2" />
                  <line x1="375" y1="150" x2="405" y2="135" stroke="#00d09c" strokeWidth="2.5" opacity=".9" />
                  <line x1="375" y1="180" x2="405" y2="165" stroke="#00d09c" strokeWidth="2.5" opacity=".9" />
                  <line x1="375" y1="210" x2="405" y2="195" stroke="#00d09c" strokeWidth="2.5" opacity=".9" />
                  <line x1="435" y1="165" x2="465" y2="180" stroke="#a5b4fc" strokeWidth="2.5" opacity=".9" />
                  <line x1="435" y1="195" x2="465" y2="210" stroke="#a5b4fc" strokeWidth="2.5" opacity=".9" />
                  <line x1="435" y1="225" x2="465" y2="240" stroke="#a5b4fc" strokeWidth="2.5" opacity=".9" />
                  <line x1="420" y1="130" x2="420" y2="55" stroke="#00d09c" strokeWidth="2" className="iso-laser" />
                  <circle cx="420" cy="55" r="5" fill="#00d09c" filter="drop-shadow(0 0 12px #00d09c)" />
                </g>
                {/* VIT Hub */}
                <g className="iso-building" onMouseEnter={(e) => showTip('🎓 Academic Center • VIT University (8.7 CGPA Honors)', e)} onMouseLeave={hideTip} onClick={() => navigate('/')}>
                  <polygon points="460,330 580,270 580,350 460,410" fill="url(#lsVit)" stroke="#818cf8" strokeWidth="1.5" />
                  <polygon points="580,270 660,310 660,390 580,350" fill="#c7d2fe" stroke="#818cf8" strokeWidth="1.5" />
                  <polygon points="460,330 580,270 660,310 540,370" fill="#a5b4fc" stroke="#6366f1" strokeWidth="2" />
                  <line x1="480" y1="345" x2="480" y2="400" stroke="#312e81" strokeWidth="3" />
                  <line x1="510" y1="330" x2="510" y2="385" stroke="#312e81" strokeWidth="3" />
                  <line x1="540" y1="315" x2="540" y2="370" stroke="#312e81" strokeWidth="3" />
                  <line x1="570" y1="300" x2="570" y2="355" stroke="#312e81" strokeWidth="3" />
                  <polygon points="580,245 610,260 580,275 550,260" fill="#f59e0b" filter="drop-shadow(0 0 8px rgba(245,158,11,0.6))" />
                </g>
                {/* Dome */}
                <g className="iso-building" onMouseEnter={(e) => showTip('🧠 Medical AI Dome • ResNet50 MRI Vision (98.2% Accuracy)', e)} onMouseLeave={hideTip} onClick={() => navigate('/')}>
                  <ellipse cx="680" cy="270" rx="60" ry="35" fill="url(#lsDome)" opacity=".9" stroke="#00d09c" strokeWidth="2" />
                  <path d="M620,270 C620,220 740,220 740,270 Z" fill="rgba(0,208,156,0.3)" stroke="#00d09c" strokeWidth="1.5" />
                  <ellipse cx="680" cy="245" rx="35" ry="20" fill="none" stroke="#ffffff" strokeWidth="1" strokeDasharray="4 4" />
                  <circle cx="680" cy="235" r="5.5" fill="#ffffff" filter="drop-shadow(0 0 12px #00d09c)" />
                </g>
                {/* Telemetry */}
                <g className="iso-building" onMouseEnter={(e) => showTip('⏱️ Telemetry Monolith • 🟢 24ms Live Database Heartbeat', e)} onMouseLeave={hideTip} onClick={() => navigate('/')}>
                  <polygon points="260,330 290,315 290,410 260,425" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
                  <polygon points="290,315 320,330 320,425 290,410" fill="#334155" stroke="#475569" strokeWidth="1.5" />
                  <polygon points="260,330 290,315 320,330 290,345" fill="#3b82f6" stroke="#60a5fa" strokeWidth="1.5" />
                  <circle cx="275" cy="358" r="6.5" fill="#00d09c" filter="drop-shadow(0 0 6px #00d09c)" />
                  <circle cx="305" cy="358" r="6.5" fill="#00d09c" filter="drop-shadow(0 0 6px #00d09c)" />
                </g>
                {/* Trees */}
                <polygon points="340,370 380,350 420,370 380,390" fill="#059669" stroke="#10b981" strokeWidth="1" />
                <circle cx="380" cy="355" r="8" fill="#34d399" />
                <polygon points="680,410 720,390 760,410 720,430" fill="#059669" stroke="#10b981" strokeWidth="1" />
                <circle cx="720" cy="395" r="8" fill="#34d399" />
                {/* P2P */}
                <g className="iso-building" onMouseEnter={(e) => showTip('📢 Operations Center • P2P Sync & WebSocket Broadcast', e)} onMouseLeave={hideTip} onClick={() => navigate('/')}>
                  <polygon points="760,230 820,200 820,240 760,270" fill="#059669" stroke="#10b981" strokeWidth="1.5" />
                  <line x1="770" y1="265" x2="770" y2="308" stroke="#94a3b8" strokeWidth="3" />
                  <line x1="810" y1="245" x2="810" y2="288" stroke="#94a3b8" strokeWidth="3" />
                  <text x="770" y="240" fill="#ffffff" fontFamily="'Space Grotesk',sans-serif" fontSize="10" fontWeight="700">P2P SYNC</text>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS BAND ─── */}
      <div className="ls-stats-band ls-reveal" ref={statsRef}>
        {[
          { val: `${stats.p}+`, lbl: 'Projects shipped' },
          { val: stats.c,       lbl: 'CGPA (VIT University)' },
          { val: `${stats.y}+`, lbl: 'Years building ML & Web' },
          { val: `${stats.f}+`, lbl: 'Core frameworks mastered' },
        ].map((s, i) => (
          <div key={i} className="ls-stat-item">
            <div className="ls-stat-num">{s.val}</div>
            <div className="ls-stat-lbl">{s.lbl}</div>
            <div className="ls-stat-accent" />
          </div>
        ))}
      </div>

      {/* ─── 3D CAROUSEL ─── */}
      <CarouselSection navigate={navigate} />

      {/* ─── ENGINEERING FAMILY CARDS ─── */}
      <div className="ls-family-section ls-reveal" id="ecosystem">
        <h2 className="ls-family-title">More from the engineering family</h2>
        <div className="ls-family-grid">
          <div className="ls-fam-card ls-reveal-s ls-rd1" onClick={() => navigate('/')}>
            <div className="ls-fam-content"><span className="ls-fam-logo ls-teal">98.2</span></div>
            <div className="ls-fam-footer">Neural Vision Accuracy</div>
          </div>
          <div className="ls-fam-card ls-reveal-s ls-rd2" onClick={() => navigate('/')}>
            <div className="ls-fam-content"><span className="ls-fam-logo ls-gold">VIT</span></div>
            <div className="ls-fam-footer">8.7 CGPA Data Science</div>
          </div>
          <div className="ls-fam-card ls-reveal-s ls-rd3" onClick={() => navigate('/')}>
            <div className="ls-fam-content">
              <div className="ls-fam-credit">
                <div className="ls-fam-icon" />
                <span className="ls-fam-credit-text">Sync</span>
              </div>
            </div>
            <div className="ls-fam-footer">P2P Broadcast Engine</div>
          </div>
        </div>
      </div>

      {/* ─── ABOUT ─── */}
      <section className="ls-section" id="about">
        <div className="ls-about-grid">
          <TiltCard className="ls-about-visual ls-reveal-l">
            <div className="ls-orbit-code">
              <span className="ls-k">const</span> engineer = {'{'}<br />
              &nbsp;&nbsp;<span className="ls-c">name:</span> <span className="ls-s">'Sujith Thota'</span>,<br />
              &nbsp;&nbsp;<span className="ls-c">degree:</span> <span className="ls-s">'B.Tech CSE (Data Science)'</span>,<br />
              &nbsp;&nbsp;<span className="ls-c">institution:</span> <span className="ls-s">'VIT University'</span>,<br />
              &nbsp;&nbsp;<span className="ls-c">focus:</span> <span className="ls-s">'Deep Learning + RAG + Realtime Web'</span>,<br />
              &nbsp;&nbsp;<span className="ls-c">status:</span> <span className="ls-s">'shipping production code'</span><br />
              {'}'};
            </div>
          </TiltCard>
          <div className="ls-about-text ls-reveal-r">
            <div className="ls-eyebrow">Background</div>
            <h2 className="ls-about-h2">Data science rigor meets<br />full-stack craftsmanship.</h2>
            <p>I specialize in bridging the gap between <strong>Machine Learning research</strong> and <strong>high-performance production software</strong>. Whether training deep convolutional neural networks or tuning sub-millisecond database caching layers, I build systems designed for reliability and zero latency.</p>
            <p>My work combines mathematical foundations in <strong>Linear Algebra, Statistics, and Deep Learning</strong> with modern web engineering across React 18, Node.js, and Supabase PostgreSQL.</p>
            <div className="ls-about-tags">
              {['Python', 'PyTorch', 'React 18', 'TypeScript', 'LangChain', 'PostgreSQL', 'Docker', 'Groq LLM'].map(t => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── SKILLS ─── */}
      <section className="ls-section" id="skills" style={{ paddingTop: 0 }}>
        <div className="ls-sec-head ls-reveal">
          <div className="ls-eyebrow">Technical Arsenal</div>
          <h2>Core competencies &amp; depth</h2>
          <p>Comprehensive skills across machine learning model development, backend APIs, and reactive frontend architectures.</p>
        </div>
        <div className="ls-skills-grid ls-reveal ls-rd1">
          {[
            { pct: 94, name: 'Machine Learning & PyTorch' },
            { pct: 92, name: 'Frontend (React & TypeScript)' },
            { pct: 88, name: 'PostgreSQL & Supabase Realtime' },
            { pct: 85, name: 'RAG, LangChain & Vector DBs' },
          ].map((s) => (
            <div key={s.name} className="ls-skill-card">
              <div className="ls-skill-pct">{s.pct}%</div>
              <div className="ls-skill-name">{s.name}</div>
              <div className="ls-bar"><div className="ls-bar-fill" style={{ '--w': s.pct + '%' }} /></div>
            </div>
          ))}
        </div>
        {/* Advanced Bi-Directional Dual Marquee */}
        <div className="ls-marquee-container ls-reveal">
          {/* Row 1: AI, Models & Inference (Slides Left) */}
          <div className="ls-marquee-row ls-mq-left">
            <div className="ls-marquee-track">
              {[...MARQUEE_ROW1, ...MARQUEE_ROW1, ...MARQUEE_ROW1].map((item, i) => (
                <div key={i} className="ls-mq-pill">
                  <span className="ls-mq-status-dot" style={{ background: item.dot, boxShadow: `0 0 8px ${item.dot}70` }} />
                  <span className="ls-mq-name">{item.name}</span>
                  <span className="ls-mq-sep">/</span>
                  <span className="ls-mq-tag">{item.tag}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Row 2: Full-Stack, Realtime & Cloud Infrastructure (Slides Right) */}
          <div className="ls-marquee-row ls-mq-right">
            <div className="ls-marquee-track ls-mq-reverse">
              {[...MARQUEE_ROW2, ...MARQUEE_ROW2, ...MARQUEE_ROW2].map((item, i) => (
                <div key={i} className="ls-mq-pill">
                  <span className="ls-mq-status-dot" style={{ background: item.dot, boxShadow: `0 0 8px ${item.dot}70` }} />
                  <span className="ls-mq-name">{item.name}</span>
                  <span className="ls-mq-sep">/</span>
                  <span className="ls-mq-tag">{item.tag}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── PROJECTS ─── */}
      <section className="ls-section" id="projects" style={{ paddingTop: 0 }}>
        <div className="ls-sec-head ls-reveal">
          <div className="ls-eyebrow">Selected Engineering Projects</div>
          <h2>Production work &amp; machine learning architectures</h2>
          <p>Featured projects highlighting deep learning, real-time synchronization, and LLM-powered RAG systems.</p>
        </div>
        <div className="ls-projects-grid">
          {[
            { glyph: 'AI', tag: 'GenAI & Financial Tech', title: 'AI Financial Advisor & RAG', desc: 'Interactive portfolio assistant with streaming Groq Llama 3 inference, ChromaDB vector retrieval, and 1-click CMS data backup.', link: 'Explore in app' },
            { glyph: 'DL', tag: 'Deep Learning & Vision', title: 'Brain Tumor MRI Classification', desc: 'Deep CNN utilizing transfer learning (ResNet50) for high-confidence multi-class MRI tumor classification at 98.2% accuracy.', link: 'View architecture specs' },
            { glyph: 'P2P', tag: 'Distributed Systems', title: 'Realtime Operations & Sync Hub', desc: 'P2P BroadcastChannel state replication with Supabase Postgres change streams, live latency telemetry, and zero-crash boundaries.', link: 'Launch live demo' },
          ].map((proj, i) => (
            <TiltCard key={i} className={`ls-proj-card ls-reveal ls-rd${i + 1}`} onClick={() => navigate('/')}>
              <div className="ls-proj-media">
                <div className="ls-proj-media-bg" />
                <div className="ls-proj-glyph">{proj.glyph}</div>
              </div>
              <div className="ls-proj-body">
                <div className="ls-proj-tag">{proj.tag}</div>
                <h3>{proj.title}</h3>
                <p>{proj.desc}</p>
                <span className="ls-proj-link">
                  {proj.link}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7M17 7H8M17 7V16" /></svg>
                </span>
              </div>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* ─── PROCESS ─── */}
      <section className="ls-section" id="process" style={{ paddingTop: 0 }}>
        <div className="ls-sec-head ls-reveal">
          <div className="ls-eyebrow">Engineering Methodology</div>
          <h2>How I architect &amp; deliver</h2>
        </div>
        <div className="ls-process-list">
          {[
            { n: '01', h: 'Data & Problem Formulation', p: 'Frame the problem mathematically, clean training datasets, and identify baseline benchmarks before touching architectures.' },
            { n: '02', h: 'Model & Pipeline Prototyping', p: 'Rapidly experiment with PyTorch architectures, loss convergence, and vector chunking strategies to validate efficacy.' },
            { n: '03', h: 'Production Hardening & Optimization', p: 'Wrap models with async APIs, implement caching, token rate limiters, and code-split frontend bundles for zero-lag rendering.' },
            { n: '04', h: 'Continuous Telemetry & Refinement', p: 'Monitor live inference latency, track knowledge base gaps, and iteratively fine-tune pipelines based on real interactions.' },
          ].map((item, i) => (
            <div key={i} className={`ls-process-item ls-reveal ls-rd${i}`}>
              <div className="ls-process-num">{item.n}</div>
              <div><h3>{item.h}</h3><p>{item.p}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section style={{ padding: '0 6vw 40px' }}>
        <div className="ls-cta ls-reveal">
          <div className="ls-cta-glow" />
          <div className="ls-cta-grid" />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div className="ls-eyebrow" style={{ background: 'rgba(0,208,156,0.1)', borderColor: 'rgba(0,208,156,0.4)', color: '#34d399', marginBottom: 24 }}>Let's Connect</div>
            <h2 className="ls-cta-h2">Let's build something remarkable.</h2>
            <p className="ls-cta-p">Interested in collaborating on Machine Learning, Data Science research, or Full-Stack software engineering? Let's connect.</p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <MagneticBtn className="ls-btn-primary" href="mailto:sujithreddy1546@gmail.com">
                sujithreddy1546@gmail.com →
              </MagneticBtn>
              <MagneticBtn className="ls-btn-secondary ls-btn-dark" onClick={() => navigate('/')}>
                Open Full React App ⚡
              </MagneticBtn>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="ls-footer" id="contact">
        <Link to="/" className="ls-logo">
          <span className="ls-logo-dot" />
          sujith.dev
        </Link>
        <div className="ls-footer-links">
          <a href="https://github.com/sujith1546" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://linkedin.com/in/sujiththota" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href="mailto:sujithreddy1546@gmail.com">Email</a>
          <Link to="/">Interactive App</Link>
        </div>
        <div className="ls-copy">© {new Date().getFullYear()} Sujith Thota. Built with intent.</div>
      </footer>
    </div>
  );
}
