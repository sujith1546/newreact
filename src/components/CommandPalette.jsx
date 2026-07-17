import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const GITHUB_USERNAME = "sujith1546";

const NAV_ITEMS = [
  { id: "home", label: "Go to Home", section: "home", icon: "home" },
  { id: "about", label: "Go to About", section: "about", icon: "user" },
  { id: "skills", label: "Go to Skills", section: "skills", icon: "bolt" },
  { id: "projects", label: "Go to Projects", section: "projects", icon: "folder" },
  { id: "education", label: "Go to Education", section: "education", icon: "book" },
  { id: "experience", label: "Go to Experience", section: "experience", icon: "briefcase" },
  { id: "certifications", label: "Go to Certifications", section: "certifications", icon: "badge" },
  { id: "contact", label: "Go to Contact", section: "contact", icon: "mail" },
].map((i) => ({ ...i, group: "Navigation" }));

const STATIC_PROJECTS = [
  {
    id: "sms-finance",
    label: "SMS Finance Analyzer",
    detail: "Privacy-first RAG pipeline using Gemini 2.5 Flash and ChromaDB to analyze financial SMS patterns.",
    tags: ["Python", "ChromaDB", "Gemini API", "Streamlit", "FastAPI"],
    section: "projects",
    icon: "folder",
  },
  {
    id: "financial-sentiment",
    label: "Financial Sentiment Analysis",
    detail: "Fine-tuned a pre-trained FinBERT model on 20,000+ financial news articles to achieve 87% accuracy.",
    tags: ["Python", "TensorFlow", "FinBERT", "NLP", "Machine Learning"],
    section: "projects",
    icon: "folder",
  },
  {
    id: "retail-spend-prediction",
    label: "Online Retail Spend Prediction",
    detail: "Engineered ML pipeline on 397k+ transactions to predict customer spend, achieving R2 of 0.883.",
    tags: ["Python", "Scikit-learn", "XGBoost", "LightGBM"],
    section: "projects",
    icon: "folder",
  },
].map((i) => ({ ...i, group: "Projects" }));

const ACTIONS = [
  { id: "resume", label: "Download resume", run: "resume", icon: "file", toast: "Opening resume…" },
  { id: "theme", label: "Toggle light / dark theme", run: "theme", icon: "moon", toast: "Theme switched" },
  { id: "email", label: "Copy email address", run: "copy-email", icon: "mail", toast: "Email copied to clipboard" },
  { id: "github", label: "Open GitHub profile", run: "open-github", icon: "code", toast: "Opening GitHub…" },
  { id: "link", label: "Copy link to this section", run: "copy-link", icon: "link", toast: "Link copied" },
].map((i) => ({ ...i, group: "Actions" }));

const AI_PRESETS = [
  { id: "ai-best-project", label: "Ask AI: What's your best project?", query: "What's your best project?", icon: "spark" },
  { id: "ai-contact", label: "Ask AI: How can I contact you?", query: "How can I contact you?", icon: "spark" },
  { id: "ai-internship", label: "Ask AI: Are you open to internships?", query: "Are you open to internships?", icon: "spark" },
].map((i) => ({ ...i, group: "Ask AI" }));

const ICONS = {
  home: "⌂", user: "◇", bolt: "⚡", folder: "▤", book: "▥", briefcase: "▣",
  badge: "◈", mail: "✉", file: "▦", moon: "◐", code: "◆", link: "∞", spark: "✦", repo: "◫",
};

function fuzzyScore(query, target) {
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  let qi = 0, score = 0, lastMatch = -1;
  const matchedIndices = [];
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      score += lastMatch === ti - 1 ? 3 : 1;
      matchedIndices.push(ti);
      lastMatch = ti;
      qi++;
    }
  }
  if (qi < q.length) return null;
  return { score, matchedIndices };
}

function Highlighted({ text, indices }) {
  if (!indices || indices.length === 0) return <>{text}</>;
  const set = new Set(indices);
  return (
    <>
      {text.split("").map((ch, i) =>
        set.has(i) ? (
          <span key={i} className="cmdk-highlight-match">{ch}</span>
        ) : (
          <span key={i}>{ch}</span>
        )
      )}
    </>
  );
}

function logAnalytics(action, detail) {
  window.dispatchEvent(new CustomEvent("cmdk-analytics", { detail: { action, detail, at: Date.now() } }));
}

function askAI(query) {
  window.dispatchEvent(new CustomEvent("trigger-chatbot", { detail: { query } }));
  const history = JSON.parse(localStorage.getItem("cmdk_ai_history") || "[]");
  localStorage.setItem("cmdk_ai_history", JSON.stringify([query, ...history.filter((q) => q !== query)].slice(0, 5)));
}

function getRecents() {
  try { return JSON.parse(localStorage.getItem("cmdk_recents") || "[]"); } catch { return []; }
}
function addRecent(id) {
  const recents = getRecents().filter((r) => r !== id);
  recents.unshift(id);
  localStorage.setItem("cmdk_recents", JSON.stringify(recents.slice(0, 5)));
}

function useDebouncedGithubRepos(term, active) {
  const [repos, setRepos] = useState([]);
  const cache = useRef({});

  useEffect(() => {
    if (!active || !term || term.length < 2) return;
    if (cache.current[term]) { setRepos(cache.current[term]); return; }
    const handle = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.github.com/search/repositories?q=${encodeURIComponent(term)}+user:${GITHUB_USERNAME}&per_page=5`
        );
        if (!res.ok) return;
        const data = await res.json();
        const mapped = (data.items || []).map((r) => ({
          id: `gh-${r.id}`,
          label: r.name,
          detail: r.description || "No description provided.",
          tags: [r.language, `★ ${r.stargazers_count}`].filter(Boolean),
          section: "projects",
          icon: "repo",
          group: "Projects (GitHub)",
          externalUrl: r.html_url,
        }));
        cache.current[term] = mapped;
        setRepos(mapped);
      } catch {
        // Fail silently
      }
    }, 350);
    return () => clearTimeout(handle);
  }, [term, active]);

  return repos;
}

export default function CommandPalette() {
  const { toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMainPage = location.pathname === '/';
  
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const [toast, setToast] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((o) => !o);
      }
      if (e.key === "Escape" && isOpen) setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  useEffect(() => {
    const handleToggle = () => setIsOpen((o) => !o);
    window.addEventListener("toggle-command-palette", handleToggle);
    return () => window.removeEventListener("toggle-command-palette", handleToggle);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelected(0);
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 10);
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const mode = query.startsWith(">") ? "nav"
    : query.startsWith("#") ? "project"
    : query.startsWith("?") ? "ai-raw"
    : query.startsWith("/") ? "help"
    : "all";

  const searchText = mode === "all" ? query : query.slice(1).trimStart();
  const ghRepos = useDebouncedGithubRepos(searchText, mode === "project");

  const results = useMemo(() => {
    if (mode === "ai-raw" || mode === "help") return [];

    const ALL_ITEMS = [...NAV_ITEMS, ...STATIC_PROJECTS, ...ACTIONS, ...AI_PRESETS];

    if (!searchText) {
      const pool = mode === "nav" ? NAV_ITEMS 
        : mode === "project" ? STATIC_PROJECTS 
        : [...NAV_ITEMS, ACTIONS.find(a => a.id === "resume")].filter(Boolean);
      return pool.slice(0, 9).map((r) => ({ ...r, matchedIndices: [] }));
    }

    const pool = mode === "nav" ? NAV_ITEMS
      : mode === "project" ? [...STATIC_PROJECTS, ...ghRepos]
      : ALL_ITEMS;

    return pool
      .map((item) => {
        const m = fuzzyScore(searchText, item.label);
        return m ? { ...item, score: m.score, matchedIndices: m.matchedIndices } : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .slice(0, 9);
  }, [searchText, mode, ghRepos]);

  useEffect(() => setSelected(0), [query]);

  const runAction = (action) => {
    switch (action) {
      case "resume": window.dispatchEvent(new CustomEvent("open-resume")); break;
      case "theme": toggleTheme(); break;
      case "copy-email": navigator.clipboard?.writeText("sujithreddy1546@gmail.com"); break;
      case "open-github": window.open(`https://github.com/${GITHUB_USERNAME}`, "_blank", "noopener"); break;
      case "copy-link": navigator.clipboard?.writeText(window.location.href); break;
      default: break;
    }
  };

  const handleRun = (item) => {
    addRecent(item.id);
    logAnalytics("run", item.label);
    if (item.section) {
      if (isMainPage) {
        window.dispatchEvent(new CustomEvent("navigate-section", { detail: { section: item.section } }));
      } else {
        navigate('/');
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("navigate-section", { detail: { section: item.section } }));
        }, 150);
      }
    }
    if (item.run) runAction(item.run);
    if (item.query) askAI(item.query);
    if (item.externalUrl) window.open(item.externalUrl, "_blank", "noopener");
    if (item.toast) setToast(item.toast);
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (mode === "ai-raw") {
      if (e.key === "Enter" && searchText.trim()) {
        logAnalytics("ask-ai-raw", searchText.trim());
        askAI(searchText.trim());
        setIsOpen(false);
      }
      return;
    }
    if (mode === "help") return;
    if (e.key === "ArrowDown") { e.preventDefault(); setSelected((s) => Math.min(s + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)); }
    else if (e.key === "Enter" && results[selected]) handleRun(results[selected]);
    else if (/^[1-9]$/.test(e.key) && !e.metaKey && !e.ctrlKey) {
      const idx = parseInt(e.key, 10) - 1;
      if (results[idx]) { e.preventDefault(); handleRun(results[idx]); }
    }
  };

  const grouped = Object.entries(
    results.reduce((acc, item) => {
      (acc[item.group] = acc[item.group] || []).push(item);
      return acc;
    }, {})
  );

  const activeItem = results[selected];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="cmdk-overlay"
          >
            <motion.div
              role="dialog" aria-modal="true" aria-label="Command palette"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: -16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -16, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 340, damping: 28 }}
              className="cmdk-card"
              style={{ maxWidth: activeItem?.detail ? 760 : 560 }}
            >
              <div className="cmdk-left">
                <div className="cmdk-header">
                  <span className="cmdk-logo-hint">Ctrl+K</span>
                  <input
                    ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={handleKeyDown}
                    placeholder="Search, or try > # ? / prefixes..."
                    className="cmdk-input"
                  />
                  <kbd className="cmdk-close-kbd">esc</kbd>
                </div>

                <div className="cmdk-list">
                  {mode === "help" ? (
                    <div className="cmdk-info-view help-view">
                      <p><kbd>&gt;</kbd> filter to navigation only</p>
                      <p><kbd>#</kbd> filter to projects, live-searches your GitHub too</p>
                      <p><kbd>?</kbd> ask the AI chatbot anything, live</p>
                      <p><kbd>1-9</kbd> jump straight to that result</p>
                      <p><kbd>↑ ↓</kbd> move selection · <kbd>↵</kbd> run · <kbd>esc</kbd> close</p>
                    </div>
                  ) : mode === "ai-raw" ? (
                    <div className="cmdk-info-view ai-raw-view">
                      Press <kbd>Enter</kbd> to ask: “{searchText || "..."}”
                    </div>
                  ) : results.length === 0 ? (
                    <div className="cmdk-info-view empty-view">No results for "{query}"</div>
                  ) : (
                    grouped.map(([group, items]) => (
                      <div key={group}>
                        <p className="cmdk-group-title">{group}</p>
                        {items.map((item) => {
                          const idx = results.indexOf(item);
                          const isSelected = idx === selected;
                          return (
                            <div
                              key={item.id} 
                              onMouseEnter={() => setSelected(idx)} 
                              onClick={() => handleRun(item)}
                              className={`cmdk-item ${isSelected ? "selected" : ""}`}
                            >
                              <span className="cmdk-item-icon">{ICONS[item.icon] || "•"}</span>
                              <span className="cmdk-item-label">
                                <Highlighted text={item.label} indices={item.matchedIndices} />
                              </span>
                              {idx < 9 && <kbd className="cmdk-item-kbd">{idx + 1}</kbd>}
                            </div>
                          );
                        })}
                      </div>
                    ))
                  )}
                </div>

                <div className="cmdk-footer">
                  <span>↑↓ navigate</span><span>↵ select</span><span>1-9 jump</span>
                  <span>&gt; nav</span><span># projects</span><span>? ask AI</span><span>/ help</span>
                </div>
              </div>

              {activeItem?.detail && (
                <div className="cmdk-preview">
                  <p className="cmdk-preview-title">{activeItem.label}</p>
                  <p className="cmdk-preview-detail">{activeItem.detail}</p>
                  {activeItem.tags && (
                    <div className="cmdk-preview-tags">
                      {activeItem.tags.map((t) => (
                        <span key={t} className="cmdk-preview-tag">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="cmdk-toast"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .cmdk-overlay {
          position: fixed;
          inset: 0;
          z-index: 10000002;
          background: rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 15vh;
          padding-left: 16px;
          padding-right: 16px;
        }

        .cmdk-card {
          width: 100%;
          display: flex;
          background: var(--bg-secondary, #ffffff);
          color: var(--text-primary, #111111);
          border: 1px solid var(--border-color, rgba(128, 128, 128, 0.2));
          border-radius: 16px;
          box-shadow: 0 30px 70px rgba(0, 0, 0, 0.2);
          overflow: hidden;
          transition: max-width 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        [data-theme="dark"] .cmdk-card {
          box-shadow: 0 30px 70px rgba(0, 0, 0, 0.55);
          border-color: rgba(255, 255, 255, 0.1);
        }

        .cmdk-left {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .cmdk-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-color, rgba(128, 128, 128, 0.15));
        }

        .cmdk-logo-hint {
          font-family: monospace;
          font-size: 13px;
          font-weight: 700;
          opacity: 0.6;
          color: var(--text-primary);
        }

        .cmdk-input {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          color: inherit;
          font-size: 15px;
          font-weight: 500;
        }

        .cmdk-close-kbd {
          font-family: monospace;
          font-size: 11px;
          opacity: 0.55;
          border: 1px solid var(--border-color, rgba(128, 128, 128, 0.2));
          border-radius: 4px;
          padding: 2px 6px;
          background: var(--bg-primary);
          color: var(--text-primary);
        }

        .cmdk-list {
          overflow: hidden;
          padding: 8px 4px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .cmdk-group-title {
          font-size: 10.5px;
          font-weight: 700;
          opacity: 0.5;
          margin: 10px 16px 4px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-secondary);
        }

        .cmdk-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 16px;
          font-size: 13.5px;
          font-weight: 500;
          cursor: pointer;
          border-radius: 8px;
          margin: 0 6px;
          color: var(--text-secondary);
          transition: all 0.15s ease;
          border-left: 3px solid transparent;
        }

        .cmdk-item.selected {
          background: var(--bg-primary);
          color: var(--text-primary);
          border-left-color: #3b82f6;
          padding-left: 13px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
        }

        [data-theme="dark"] .cmdk-item.selected {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .cmdk-item-icon {
          opacity: 0.65;
          width: 16px;
          text-align: center;
          font-size: 15px;
        }

        .cmdk-item-label {
          flex: 1;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .cmdk-highlight-match {
          color: #3b82f6;
          font-weight: 700;
        }

        .cmdk-item-kbd {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 10px;
          font-weight: 700;
          color: var(--text-muted);
          border: 1px solid var(--border-color, rgba(128, 128, 128, 0.2));
          border-radius: 4px;
          width: 16px;
          height: 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-secondary);
        }

        .cmdk-footer {
          display: flex;
          gap: 14px;
          padding: 10px 20px;
          border-top: 1px solid var(--border-color, rgba(128, 128, 128, 0.15));
          font-size: 11px;
          color: var(--text-muted);
          opacity: 0.7;
          flex-wrap: wrap;
          background: var(--bg-primary);
        }

        .cmdk-preview {
          width: 240px;
          flex-shrink: 0;
          border-left: 1px solid var(--border-color, rgba(128, 128, 128, 0.15));
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          background: var(--bg-primary);
          animation: fadeIn 0.2s ease-out forwards;
        }

        .cmdk-preview-title {
          font-size: 14.5px;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.3px;
          margin: 0;
        }

        .cmdk-preview-detail {
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0;
        }

        .cmdk-preview-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .cmdk-preview-tag {
          font-size: 10px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 12px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color, rgba(128, 128, 128, 0.2));
          color: var(--text-secondary);
        }

        .cmdk-info-view {
          padding: 20px 24px;
          font-size: 13px;
          color: var(--text-secondary);
        }

        .help-view {
          line-height: 2.1;
        }

        .help-view kbd, .ai-raw-view kbd {
          font-family: monospace;
          font-weight: 600;
          color: var(--text-primary);
          background: var(--border-color, rgba(128, 128, 128, 0.15));
          border-radius: 4px;
          padding: 1px 5px;
        }

        .cmdk-toast {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10000003;
          background: var(--bg-primary, #111111);
          color: var(--text-primary, #ffffff);
          border: 1px solid var(--border-color, rgba(128, 128, 128, 0.3));
          border-radius: 10px;
          padding: 10px 18px;
          font-size: 13px;
          font-weight: 500;
          box-shadow: 0 8px 24px rgba(0,0,0,0.25);
        }

        @media (max-width: 640px) {
          .cmdk-overlay {
            padding-top: 5vh;
          }
          .cmdk-card {
            flex-direction: column;
            min-height: auto;
          }
          .cmdk-preview {
            width: 100%;
            border-left: none;
            border-top: 1px solid var(--border-color, rgba(128, 128, 128, 0.15));
            padding: 16px;
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(5px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
