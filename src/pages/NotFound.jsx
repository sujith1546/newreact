import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  IconHome,
  IconBriefcase,
  IconSun,
  IconMoon,
  IconSparkles,
} from "@tabler/icons-react";

const ROUTES = [
  { path: "/", label: "Home" },
  { path: "/about", label: "About" },
  { path: "/skills", label: "Skills" },
  { path: "/projects", label: "Projects" },
  { path: "/education", label: "Education" },
  { path: "/experience", label: "Experience" },
  { path: "/certifications", label: "Certifications" },
  { path: "/contact", label: "Contact" },
  { path: "/updates", label: "Updates" },
];

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array(n + 1).fill(0).map((_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function getSuggestions(brokenPath, routes) {
  const clean = brokenPath.toLowerCase().replace(/\/$/, "") || "/";
  return routes
    .map((route) => {
      const dist = levenshtein(clean, route.path.toLowerCase());
      const longest = Math.max(clean.length, route.path.length, 1);
      const score = Math.round((1 - dist / longest) * 100);
      return { ...route, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);
}

export default function NotFound() {
  const navigate = useNavigate();
  const brokenPath = window.location.pathname;
  const suggestions = getSuggestions(brokenPath, ROUTES);

  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => (t === "light" ? "dark" : "light"));

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
    <div className="nf-viewport">
      <style>{`
        .nf-viewport {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          background: var(--bg-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          box-sizing: border-box;
          z-index: 99999;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .nf-theme-toggle {
          position: absolute;
          top: 24px;
          right: 28px;
          width: 36px;
          height: 36px;
          border-radius: 18px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .nf-theme-toggle:hover {
          transform: translateY(-1px);
          border-color: var(--primary-blue);
          color: var(--primary-blue);
        }

        .nf-card {
          width: 100%;
          max-width: 580px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 48px 40px;
          text-align: center;
          box-sizing: border-box;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12);
        }

        .nf-badge {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 14px;
          letter-spacing: 0.02em;
        }

        .nf-title {
          font-size: 32px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 12px;
          letter-spacing: -0.02em;
          line-height: 1.2;
        }

        .nf-desc {
          font-size: 15px;
          color: var(--text-secondary);
          line-height: 1.5;
          margin: 0 auto 32px;
          max-width: 440px;
        }

        .nf-smart-banner {
          margin: -12px auto 24px;
          padding: 10px 14px;
          border-radius: 10px;
          background: color-mix(in srgb, var(--primary-blue) 12%, transparent);
          border: 1px solid color-mix(in srgb, var(--primary-blue) 25%, transparent);
          color: var(--primary-blue);
          font-size: 12.5px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 440px;
        }

        .nf-banner-btn {
          background: var(--primary-blue);
          color: #ffffff;
          border: none;
          border-radius: 6px;
          padding: 4px 10px;
          font-size: 11.5px;
          font-weight: 700;
          cursor: pointer;
        }

        .nf-actions-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .nf-btn-primary {
          background: var(--text-primary);
          color: var(--bg-primary);
          border: 1px solid var(--text-primary);
          border-radius: 12px;
          padding: 12px 22px;
          font-size: 14px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: opacity 0.18s, transform 0.1s;
          text-decoration: none;
        }
        .nf-btn-primary:hover {
          opacity: 0.9;
        }
        .nf-btn-primary:active {
          transform: scale(0.98);
        }

        .nf-btn-secondary {
          background: transparent;
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 12px 22px;
          font-size: 14px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.18s;
          text-decoration: none;
        }
        .nf-btn-secondary:hover {
          border-color: var(--text-primary);
          background: rgba(128, 128, 128, 0.05);
        }
        .nf-btn-secondary:active {
          transform: scale(0.98);
        }
      `}</style>

      {/* Theme Toggle in top right */}
      <button className="nf-theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
        {theme === "light" ? <IconMoon size={16} /> : <IconSun size={16} />}
      </button>

      {/* Main Centered 404 Card */}
      <motion.div
        className="nf-card"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="nf-badge">404</div>
        <h1 className="nf-title">Page not found</h1>
        <p className="nf-desc">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Smart suggestion banner if user typed a close path */}
        {suggestions[0]?.score >= 60 && (
          <div className="nf-smart-banner">
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <IconSparkles size={14} /> Did you mean <b>{suggestions[0].path}</b>?
            </span>
            <button className="nf-banner-btn" onClick={() => navigateToSection(suggestions[0].path)}>
              Go →
            </button>
          </div>
        )}

        {/* Action Buttons Row */}
        <div className="nf-actions-row">
          <button className="nf-btn-primary" onClick={() => navigate("/")}>
            <IconHome size={16} /> Go back home
          </button>
          <button className="nf-btn-secondary" onClick={() => navigateToSection("/projects")}>
            <IconBriefcase size={16} /> View projects
          </button>
        </div>
      </motion.div>
    </div>
  );
}
