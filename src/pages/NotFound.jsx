import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  IconHome,
  IconBriefcase,
  IconSearch,
  IconSun,
  IconMoon,
  IconCopy,
  IconCheck,
  IconBug,
  IconSparkles,
} from "@tabler/icons-react";

// ----------------------------------------------------------------------------
// [1] CONFIG — edit this block for your own site, nothing else needs to change
// ----------------------------------------------------------------------------

const SITE_URL = "https://sujith-thota.vercel.app"; // Updated to actual site URL
const REDIRECT_SECONDS = 10; // auto-redirect countdown, set to 0 to disable

const ROUTES = [
  { path: "/", label: "Home" },
  { path: "/about", label: "About" },
  { path: "/skills", label: "Skills" },
  { path: "/projects", label: "Projects" },
  { path: "/education", label: "Education" },
  { path: "/experience", label: "Experience" },
  { path: "/certifications", label: "Certifications" },
  { path: "/contact", label: "Contact" },
];

// ----------------------------------------------------------------------------
// [2] FUZZY MATCH — plain Levenshtein distance, no dependency needed
// ----------------------------------------------------------------------------

function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array(n + 1).fill(0).map((_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

/** Returns routes ranked by similarity to `brokenPath`, with a 0-100 score. */
function getSuggestions(brokenPath, routes, max = 3) {
  const clean = brokenPath.toLowerCase().replace(/\/$/, "") || "/";
  return routes
    .map((route) => {
      const dist = levenshtein(clean, route.path.toLowerCase());
      const longest = Math.max(clean.length, route.path.length, 1);
      const score = Math.round((1 - dist / longest) * 100);
      return { ...route, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, max);
}

// ----------------------------------------------------------------------------
// [3] HOOKS
// ----------------------------------------------------------------------------

/** Persisted light/dark theme, defaults to light. */
function useTheme() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "dark" // Changed default to dark to match site
  );
  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  return [theme, () => setTheme((t) => (t === "light" ? "dark" : "light"))];
}

/** Canvas particle field that gently drifts away from the mouse cursor. */
function useParticles(canvasRef, color) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    let mouse = { x: -999, y: -999 };

    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    canvas.addEventListener("mousemove", onMove);

    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.6 + 0.4,
      vy: Math.random() * 0.15 + 0.05,
      o: Math.random() * 0.4 + 0.1,
    }));

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 70) {
          p.x += (dx / dist) * 0.6;
          p.y += (dy / dist) * 0.6;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = p.o;
        ctx.fill();
        ctx.globalAlpha = 1;
        p.y -= p.vy;
        if (p.y < -5) {
          p.y = canvas.height + 5;
          p.x = Math.random() * canvas.width;
        }
      });
      raf = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMove);
    };
  }, [canvasRef, color]);
}

/** Classic Konami code (↑ ↑ ↓ ↓ ← → ← → b a) — fires onUnlock() when matched. */
function useKonamiCode(onUnlock) {
  const sequence = useRef([]);
  const code = useMemo(
    () => [
      "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
      "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
      "b", "a",
    ],
    []
  );
  useEffect(() => {
    const onKey = (e) => {
      sequence.current = [...sequence.current, e.key].slice(-code.length);
      if (sequence.current.join(",") === code.join(",")) {
        onUnlock();
        sequence.current = [];
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [code, onUnlock]);
}

/** Counts today's 404 hits in localStorage, keyed by date so it resets daily. */
function useDailyHitCount() {
  return useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const key = `notfound_hits_${today}`;
    const count = parseInt(localStorage.getItem(key) || "0", 10) + 1;
    localStorage.setItem(key, String(count));
    return count;
  }, []);
}

/** Reads the last visited paths from sessionStorage (see header comment). */
function useVisitedTrail(currentPath) {
  return useMemo(() => {
    const stored = JSON.parse(sessionStorage.getItem("visited_trail") || "[]");
    const trail = stored.length ? stored : ["/"];
    return [...trail, currentPath];
  }, [currentPath]);
}



// ----------------------------------------------------------------------------
// [5] MAIN COMPONENT
// ----------------------------------------------------------------------------

export default function NotFound() {
  const location = useLocation();
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  const [theme, toggleTheme] = useTheme();
  const S = useMemo(() => buildStyles(theme), [theme]);

  const [copied, setCopied] = useState(false);
  const [reported, setReported] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);
  const [easterEggOn, setEasterEggOn] = useState(false);

  const brokenPath = location.pathname || "/unknown";
  const suggestions = useMemo(() => getSuggestions(brokenPath, ROUTES), [brokenPath]);
  const trail = useVisitedTrail(brokenPath);
  const hitCount = useDailyHitCount();
  const errorId = useMemo(
    () => `ERR-404-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
    []
  );

  useParticles(canvasRef, theme === "dark" ? "rgba(255,255,255,0.5)" : "rgba(17,24,39,1)");
  useKonamiCode(useCallback(() => setEasterEggOn(true), []));

  // Auto-redirect countdown
  useEffect(() => {
    if (REDIRECT_SECONDS <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          navigate("/");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [navigate]);

  // Keyboard shortcuts: 1 = home, 2 = projects
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT") return;
      if (e.key === "1") navigate("/");
      if (e.key === "2") {
        navigate("/");
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('navigate-section', { detail: { section: 'projects' } }));
        }, 100);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  const handleCopy = () => {
    navigator.clipboard.writeText(errorId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const handleReport = () => {
    setReported(true);
    setTimeout(() => setReported(false), 1600);
  };

  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
    SITE_URL
  )}`;

  const navigateToSection = (path) => {
    if (path === '/') {
      navigate('/');
    } else {
      const sectionId = path.replace('/', '');
      navigate('/');
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('navigate-section', { detail: { section: sectionId } }));
      }, 100);
    }
  };

  return (
    <div style={S.page}>
      {/* Keyframes injected once */}
      <style>{`
        @keyframes nf-blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
        @keyframes nf-glitch { 0%, 96%, 100% { text-shadow: none; } 97% { text-shadow: 2px 0 #60a5fa, -2px 0 #f87171; } }
      `}</style>

      <canvas ref={canvasRef} style={S.canvas} />

      <motion.div
        style={S.card}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Top bar: status + theme toggle */}
        <div style={S.topBar}>
          <div style={S.statusLine}>
            <span style={S.redDot} />
            <span>route_resolver: 404</span>
            <span style={{ ...S.cursor, animation: "nf-blink 1s step-end infinite" }} />
          </div>
          <button style={S.themeToggle} onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "light" ? <IconMoon size={14} /> : <IconSun size={14} />}
          </button>
        </div>

        {/* 404 heading */}
        <div style={{ textAlign: "center" }}>
          <p style={{ ...S.heading404, animation: "nf-glitch 3.2s infinite" }}>404</p>
          <p style={S.subheading}>Looks like this page went into the void.</p>
          <p style={S.description}>
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Top suggestion, high-confidence auto-redirect style banner */}
        {suggestions[0]?.score >= 60 && (
          <div style={S.smartBanner}>
            <div style={S.smartBannerLeft}>
              <IconSparkles size={14} />
              <span>
                {suggestions[0].score}% sure you meant{" "}
                <b style={S.mono}>{suggestions[0].path}</b>
              </span>
            </div>
            <button style={S.smartBannerBtn} onClick={() => navigateToSection(suggestions[0].path)}>
              Go
            </button>
          </div>
        )}


        {/* Primary actions */}
        <div style={S.actionsRow}>
          <button style={S.primaryBtn} onClick={() => navigate("/")}>
            <IconHome size={14} /> Go back home
            <span style={S.kbdBadgeLight}>1</span>
          </button>
          <button style={S.secondaryBtn} onClick={() => navigateToSection("/projects")}>
            <IconBriefcase size={14} /> View projects
            <span style={S.kbdBadgeDark}>2</span>
          </button>
        </div>

        {/* Footer: trail, countdown, error id, report, QR */}
        <div style={S.footer}>
          <div style={S.footerRow}>
            <p style={S.footerText}>
              Trail: <span style={S.mono}>{trail.slice(-4).join(" → ")}</span>
            </p>
            {REDIRECT_SECONDS > 0 && (
              <p style={S.footerText}>
                Home in <span style={S.monoStrong}>{secondsLeft}</span>s
              </p>
            )}
          </div>

          {REDIRECT_SECONDS > 0 && (
            <div style={S.progressTrack}>
              <div
                style={{
                  ...S.progressFill,
                  width: `${((REDIRECT_SECONDS - secondsLeft) / REDIRECT_SECONDS) * 100}%`,
                }}
              />
            </div>
          )}

          <div style={S.footerRow2}>
            <button style={S.errorIdBtn} onClick={handleCopy}>
              <span style={S.mono}>{errorId}</span>
              {copied ? <IconCheck size={12} /> : <IconCopy size={12} />}
            </button>

            <button style={S.reportBtn} onClick={handleReport}>
              <IconBug size={12} />
              {reported ? "Logged ✓" : "Report issue"}
            </button>
          </div>

          <div style={S.qrRow}>
            <img src={qrSrc} alt="QR code to site home" style={S.qrImg} />
            <div>
              <p style={S.qrTitle}>Continue on mobile</p>
              <p style={S.qrSub}>Scan to open the homepage on your phone</p>
            </div>
          </div>

          <p style={S.hitCount}>
            You're hit <span style={S.mono}>#{hitCount}</span> on a broken link today
          </p>
        </div>
      </motion.div>

      {easterEggOn && (
        <motion.div
          style={S.easterEgg}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          🎉 Konami code unlocked — you found the void's secret door.
          <button style={S.easterEggClose} onClick={() => setEasterEggOn(false)}>
            close
          </button>
        </motion.div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
// [6] STYLES
// ----------------------------------------------------------------------------

function buildStyles(theme) {
  const dark = theme === "dark";
  const MONO = '"SF Mono", "JetBrains Mono", monospace';

  const bg = dark ? "var(--bg-primary, #0b0d12)" : "var(--bg-primary, #fafafa)";
  const cardBg = dark ? "var(--bg-secondary, #12141b)" : "var(--bg-secondary, #ffffff)";
  const border = dark ? "var(--border-color, #242730)" : "var(--border-color, #e5e7eb)";
  const borderSoft = dark ? "var(--border-color, #1b1e26)" : "rgba(0,0,0,0.05)";
  const text = dark ? "var(--text-primary, #f3f4f6)" : "var(--text-primary, #111827)";
  const muted = dark ? "var(--text-secondary, #8b90a0)" : "var(--text-secondary, #6b7280)";
  const mutedSoft = dark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)";
  const surface = dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)";

  return {
    mutedColor: mutedSoft,

    page: {
      position: "fixed",
      inset: 0,
      background: bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem 1rem",
      overflow: "hidden",
      transition: "background 0.2s ease",
      zIndex: 99999,
    },
    canvas: { position: "absolute", inset: 0, width: "100%", height: "100%" },

    card: {
      width: 480,
      maxWidth: "100%",
      background: cardBg,
      borderRadius: 18,
      border: `1px solid ${border}`,
      padding: "36px 36px 32px",
      position: "relative",
      boxShadow: dark
        ? "0 20px 60px rgba(0,0,0,0.5)"
        : "0 20px 60px rgba(0,0,0,0.08)",
      zIndex: 2,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif',
    },

    topBar: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
    statusLine: { display: "flex", alignItems: "center", gap: 6, fontFamily: MONO, fontSize: 11, color: mutedSoft },
    redDot: { width: 6, height: 6, borderRadius: "50%", background: "#ef4444", display: "inline-block" },
    cursor: { width: 6, height: 12, background: text, display: "inline-block" },
    themeToggle: {
      width: 26, height: 26, borderRadius: "50%", border: `1px solid ${border}`,
      background: surface, color: text, display: "flex", alignItems: "center",
      justifyContent: "center", cursor: "pointer",
    },

    heading404: { margin: 0, fontSize: 76, fontWeight: 800, letterSpacing: "-4px", color: text, lineHeight: 1 },
    subheading: { margin: "8px 0 3px", fontSize: 15, fontWeight: 600, color: text },
    description: { margin: 0, fontSize: 12.5, color: muted },

    smartBanner: {
      margin: "16px 0 12px",
      background: dark ? "rgba(22, 163, 74, 0.1)" : "#f0fdf4",
      border: `1px solid ${dark ? "rgba(22, 163, 74, 0.2)" : "#bbf7d0"}`,
      borderRadius: 10,
      padding: "10px 12px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      color: dark ? "#86efac" : "#166534",
      fontSize: 12,
    },
    smartBannerLeft: { display: "flex", alignItems: "center", gap: 8 },
    smartBannerBtn: {
      fontSize: 11, background: "#16a34a", color: "#fff", border: "none",
      borderRadius: 6, padding: "4px 9px", cursor: "pointer",
    },

    searchBox: {
      marginBottom: 8, background: surface, border: `1px solid ${borderSoft}`,
      borderRadius: 10, padding: "10px 12px", display: "flex", alignItems: "center", gap: 8,
    },
    searchInput: { border: "none", background: "transparent", outline: "none", fontSize: 12.5, color: text, flex: 1 },
    kbdHint: {
      fontSize: 9, color: mutedSoft, border: `1px solid ${border}`, borderRadius: 4,
      padding: "1px 5px", display: "flex", alignItems: "center", gap: 2,
    },

    cmdResults: { display: "flex", flexDirection: "column", gap: 4, marginBottom: 14 },
    cmdResultRow: {
      textAlign: "left", padding: "8px 10px", borderRadius: 8, border: `1px solid ${borderSoft}`,
      background: cardBg, cursor: "pointer", display: "flex", alignItems: "center",
      justifyContent: "space-between", color: text,
    },
    cmdResultLabel: { fontSize: 12, fontWeight: 500 },
    cmdResultPath: { fontSize: 11, color: mutedSoft, fontFamily: MONO },
    noResults: { fontSize: 12, color: mutedSoft, marginBottom: 14 },

    sectionLabel: { margin: "0 0 6px", fontSize: 10, color: mutedSoft, letterSpacing: "0.04em", fontWeight: 600 },
    suggestionRow: {
      textAlign: "left", padding: "8px 10px", borderRadius: 8, border: `1px solid ${borderSoft}`,
      background: cardBg, fontSize: 12, color: text, cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "space-between",
    },
    suggestionPath: { fontFamily: MONO },
    suggestionScore: { fontSize: 10, color: mutedSoft },

    actionsRow: { display: "flex", gap: 8, marginBottom: 14 },
    primaryBtn: {
      flex: 1, padding: 10, borderRadius: 10, border: "none",
      background: text, color: bg, fontSize: 13, fontWeight: 500,
      display: "flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer",
    },
    secondaryBtn: {
      flex: 1, padding: 10, borderRadius: 10, border: `1px solid ${border}`,
      background: cardBg, color: text, fontSize: 13, fontWeight: 500,
      display: "flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer",
    },
    kbdBadgeLight: { fontSize: 9, opacity: 0.6, border: "1px solid rgba(255,255,255,0.3)", borderRadius: 4, padding: "0 4px", marginLeft: 2 },
    kbdBadgeDark: { fontSize: 9, opacity: 0.5, border: `1px solid ${border}`, borderRadius: 4, padding: "0 4px", marginLeft: 2 },

    footer: { borderTop: `1px solid ${borderSoft}`, paddingTop: 16, marginTop: 8 },
    footerRow: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
    footerText: { margin: 0, fontSize: 11, color: mutedSoft },
    mono: { fontFamily: MONO, color: muted },
    monoStrong: { fontFamily: MONO, color: text, fontWeight: 600 },

    progressTrack: { height: 2, background: borderSoft, borderRadius: 2, overflow: "hidden", marginBottom: 12 },
    progressFill: { height: "100%", background: text, transition: "width 1s linear" },

    footerRow2: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, gap: 8 },
    errorIdBtn: {
      display: "flex", alignItems: "center", gap: 6, fontSize: 11, background: surface,
      border: `1px solid ${borderSoft}`, borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: text,
    },
    reportBtn: {
      display: "flex", alignItems: "center", gap: 5, fontSize: 10.5, color: mutedSoft,
      background: surface, border: `1px solid ${borderSoft}`, borderRadius: 6, padding: "4px 8px", cursor: "pointer",
    },

    qrRow: { display: "flex", alignItems: "center", gap: 10, background: surface, border: `1px solid ${borderSoft}`, borderRadius: 10, padding: 10, marginBottom: 10 },
    qrImg: { width: 48, height: 48, borderRadius: 6, background: "#fff" },
    qrTitle: { margin: 0, fontSize: 12, fontWeight: 500, color: text },
    qrSub: { margin: 0, fontSize: 10.5, color: mutedSoft },

    hitCount: { margin: 0, textAlign: "center", fontSize: 10, color: mutedSoft },

    easterEgg: {
      position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)",
      background: "var(--text-primary)", color: "var(--bg-primary)", padding: "12px 18px", borderRadius: 12,
      fontSize: 13, display: "flex", alignItems: "center", gap: 12, zIndex: 100000,
      boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
    },
    easterEggClose: { background: "rgba(0,0,0,0.15)", border: "none", color: "var(--bg-primary)", borderRadius: 6, padding: "3px 8px", fontSize: 11, cursor: "pointer" },
  };
}
