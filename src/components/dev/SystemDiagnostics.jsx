import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, X, Wifi, Gauge, Layers, SlidersHorizontal } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const BUILD_VERSION = "v1.4.2";

const CORE_STACK = [
  { name: "React", version: "18.2" },
  { name: "Vite", version: "6.0" },
  { name: "Tailwind", version: "3.4" },
  { name: "Framer", version: "Motion" },
];

export default function SystemDiagnostics({ open, onClose }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [fps, setFps] = useState(60);
  const [memory, setMemory] = useState(null);
  const [uptime, setUptime] = useState(0);
  const [latency, setLatency] = useState(null);
  const [requestCount, setRequestCount] = useState(0);

  const frameCountRef = useRef(0);
  const lastFrameTimeRef = useRef(performance.now());
  const startTimeRef = useRef(performance.now());
  const rafIdRef = useRef(null);

  // Keyboard shortcut: Ctrl+D or Cmd+D to toggle, Escape to close
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
        e.preventDefault();
        if (onClose && open) {
          onClose();
        }
      }
      if (e.key === "Escape" && open && onClose) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // FPS counter
  useEffect(() => {
    if (!open) return;

    function tick(now) {
      frameCountRef.current += 1;
      const elapsed = now - lastFrameTimeRef.current;
      if (elapsed >= 1000) {
        setFps(Math.min(60, Math.round((frameCountRef.current * 1000) / elapsed)));
        frameCountRef.current = 0;
        lastFrameTimeRef.current = now;
      }
      rafIdRef.current = requestAnimationFrame(tick);
    }
    rafIdRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafIdRef.current);
  }, [open]);

  // JS heap memory
  useEffect(() => {
    if (!open) return;
    function readMemory() {
      if (performance.memory) {
        setMemory(performance.memory.usedJSHeapSize / (1024 * 1024));
      }
    }
    readMemory();
    const id = setInterval(readMemory, 2000);
    return () => clearInterval(id);
  }, [open]);

  // Session uptime
  useEffect(() => {
    if (!open) return;
    startTimeRef.current = performance.now();
    const uptimeInterval = setInterval(() => {
      setUptime(Math.floor(performance.now() / 1000));
    }, 1000);
    return () => clearInterval(uptimeInterval);
  }, [open]);

  // Latency ping
  const pingLatency = useCallback(async () => {
    try {
      const start = performance.now();
      await fetch(`/favicon.svg?_ping=${Date.now()}`, {
        method: "HEAD",
        cache: "no-store",
      });
      setLatency(Math.round(performance.now() - start));
    } catch {
      setLatency(null);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    pingLatency();
    const id = setInterval(pingLatency, 2500);
    return () => clearInterval(id);
  }, [open, pingLatency]);

  // Resource request count
  useEffect(() => {
    if (!open) return;
    function updateCount() {
      if (typeof performance !== "undefined" && performance.getEntriesByType) {
        setRequestCount(performance.getEntriesByType("resource").length);
      }
    }
    updateCount();
    const id = setInterval(updateCount, 2000);
    return () => clearInterval(id);
  }, [open]);

  if (typeof window === "undefined") return null;

  const latencyPercent = latency == null ? 0 : Math.min(100, (latency / 300) * 100);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="sd-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <style>{`
            .sd-backdrop {
              position: fixed;
              inset: 0;
              z-index: 9999999;
              display: flex;
              align-items: center;
              justify-content: center;
              background: rgba(0, 0, 0, 0.45);
              backdrop-filter: blur(8px);
              -webkit-backdrop-filter: blur(8px);
              padding: 16px;
            }

            .sd-modal-card {
              width: 100%;
              max-width: 480px;
              border-radius: 16px;
              border: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));
              background: var(--bg-secondary, #ffffff);
              padding: 24px;
              font-family: var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
              color: var(--text-primary, #0f172a);
              box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25), 0 0 0 1px var(--border-color, rgba(0, 0, 0, 0.1));
            }

            [data-theme="dark"] .sd-modal-card {
              background: #171717;
              border-color: rgba(255, 255, 255, 0.1);
              color: #f5f5f5;
            }

            .sd-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 20px;
            }

            .sd-header-info {
              display: flex;
              align-items: center;
              gap: 10px;
            }

            .sd-icon-box {
              width: 32px;
              height: 32px;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              background: var(--bg-primary, #f3f4f6);
              color: var(--text-primary, #171717);
            }

            [data-theme="dark"] .sd-icon-box {
              background: #262626;
              color: #e5e5e5;
            }

            .sd-title {
              font-size: 14px;
              font-weight: 600;
              margin: 0;
              color: var(--text-primary, #0f172a);
            }

            [data-theme="dark"] .sd-title {
              color: #f5f5f5;
            }

            .sd-status-sub {
              display: flex;
              align-items: center;
              gap: 6px;
              font-size: 12px;
              color: var(--text-muted, #737373);
              margin-top: 1px;
            }

            .sd-green-dot {
              display: inline-block;
              width: 6px;
              height: 6px;
              border-radius: 50%;
              background: #10b981;
            }

            .sd-header-actions {
              display: flex;
              align-items: center;
              gap: 10px;
            }

            .sd-kbd-badge {
              border-radius: 6px;
              border: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));
              padding: 2px 6px;
              font-family: var(--font-mono, monospace);
              font-size: 11px;
              color: var(--text-muted, #a3a3a3);
            }

            [data-theme="dark"] .sd-kbd-badge {
              border-color: rgba(255, 255, 255, 0.1);
              color: #737373;
            }

            .sd-close-button {
              background: transparent;
              border: none;
              color: var(--text-muted, #a3a3a3);
              cursor: pointer;
              padding: 2px;
              display: flex;
              align-items: center;
              justify-content: center;
              transition: color 0.15s ease;
            }

            .sd-close-button:hover {
              color: var(--text-primary, #171717);
            }

            [data-theme="dark"] .sd-close-button:hover {
              color: #f5f5f5;
            }

            .sd-tiles-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 8px;
              margin-bottom: 8px;
            }

            .sd-tile {
              border-radius: 8px;
              background: var(--bg-primary, #f5f5f5);
              padding: 10px;
            }

            [data-theme="dark"] .sd-tile {
              background: #262626;
            }

            .sd-tile-label {
              font-size: 11px;
              color: var(--text-muted, #737373);
              margin: 0 0 4px 0;
            }

            .sd-tile-value {
              font-family: var(--font-mono, monospace);
              font-size: 15px;
              font-weight: 600;
              margin: 0;
              color: var(--text-primary, #0f172a);
            }

            [data-theme="dark"] .sd-tile-value {
              color: #f5f5f5;
            }

            .sd-two-col-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 8px;
              margin-bottom: 8px;
            }

            .sd-pass-badge {
              border-radius: 6px;
              background: #dcfce7;
              padding: 2px 8px;
              font-size: 10px;
              font-weight: 700;
              color: #15803d;
            }

            [data-theme="dark"] .sd-pass-badge {
              background: rgba(16, 185, 129, 0.15);
              color: #34d399;
            }

            .sd-section-card {
              border-radius: 8px;
              background: var(--bg-primary, #f5f5f5);
              padding: 12px;
              margin-bottom: 8px;
            }

            [data-theme="dark"] .sd-section-card {
              background: #262626;
            }

            .sd-section-label {
              display: flex;
              align-items: center;
              gap: 6px;
              font-size: 11px;
              color: var(--text-muted, #737373);
              margin: 0 0 10px 0;
            }

            .sd-stack-chips {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
              align-items: center;
            }

            .sd-live-chip {
              display: flex;
              align-items: center;
              gap: 6px;
              border-radius: 6px;
              background: #171717;
              padding: 4px 10px;
              font-size: 11px;
              color: #ffffff;
              font-weight: 600;
            }

            [data-theme="dark"] .sd-live-chip {
              background: #f5f5f5;
              color: #171717;
            }

            .sd-tech-chip {
              border-radius: 6px;
              border: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));
              padding: 4px 10px;
              font-size: 12px;
              color: var(--text-primary, #262626);
            }

            [data-theme="dark"] .sd-tech-chip {
              border-color: rgba(255, 255, 255, 0.1);
              color: #e5e5e5;
            }

            .sd-tech-ver {
              font-family: var(--font-mono, monospace);
              font-size: 11px;
              color: var(--text-muted, #a3a3a3);
            }

            .sd-github-btn {
              margin-top: 12px;
              display: flex;
              width: 100%;
              align-items: center;
              justify-content: center;
              gap: 6px;
              border-radius: 8px;
              border: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));
              padding: 8px 16px;
              font-size: 12px;
              font-weight: 600;
              color: var(--text-secondary, #525252);
              text-decoration: none;
              transition: background 0.15s ease;
            }

            .sd-github-btn:hover {
              background: var(--bg-primary, #f5f5f5);
            }

            [data-theme="dark"] .sd-github-btn {
              border-color: rgba(255, 255, 255, 0.1);
              color: #d4d4d4;
            }

            [data-theme="dark"] .sd-github-btn:hover {
              background: #262626;
            }
          `}</style>

          <motion.div
            className="sd-modal-card"
            initial={{ scale: 0.95, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sd-header">
              <div className="sd-header-info">
                <div className="sd-icon-box">
                  <Terminal size={16} />
                </div>
                <div>
                  <p className="sd-title">System diagnostics</p>
                  <p className="sd-status-sub">
                    <span className="sd-green-dot" />
                    All systems nominal
                  </p>
                </div>
              </div>
              <div className="sd-header-actions">
                <span className="sd-kbd-badge">Ctrl+D</span>
                <button
                  onClick={onClose}
                  aria-label="Close diagnostics"
                  className="sd-close-button"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Metric tiles (4 equal-width tiles in 1 row) */}
            <div className="sd-tiles-grid">
              <div className="sd-tile">
                <p className="sd-tile-label">Uptime</p>
                <p className="sd-tile-value">{uptime}s</p>
              </div>
              <div className="sd-tile">
                <p className="sd-tile-label">FPS</p>
                <p className="sd-tile-value">{fps}</p>
              </div>
              <div className="sd-tile">
                <p className="sd-tile-label">Memory</p>
                <p className="sd-tile-value">{memory != null ? `${memory.toFixed(1)}mb` : "—"}</p>
              </div>
              <div className="sd-tile">
                <p className="sd-tile-label">Requests</p>
                <p className="sd-tile-value">{requestCount}</p>
              </div>
            </div>

            {/* Latency + Build (Side-by-side 2-column) */}
            <div className="sd-two-col-grid">
              <div className="sd-tile" style={{ padding: '12px' }}>
                <p className="sd-section-label" style={{ marginBottom: '8px' }}>
                  <Wifi size={13} /> Latency
                </p>
                <p className="sd-tile-value" style={{ fontSize: '16px', marginBottom: '6px' }}>
                  {latency != null ? `${latency}ms` : "—"}
                </p>
                <div style={{ height: '3px', width: '100%', borderRadius: '999px', background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      borderRadius: '999px',
                      background: '#10b981',
                      width: `${latencyPercent}%`,
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>
              <div className="sd-tile" style={{ padding: '12px' }}>
                <p className="sd-section-label" style={{ marginBottom: '8px' }}>
                  <Gauge size={13} /> Build
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <p className="sd-tile-value" style={{ fontSize: '16px' }}>
                    {BUILD_VERSION}
                  </p>
                  <span className="sd-pass-badge">pass</span>
                </div>
              </div>
            </div>

            {/* Core stack (Flex-wrap to eliminate any overlap) */}
            <div className="sd-section-card">
              <p className="sd-section-label">
                <Layers size={13} /> Core stack
              </p>
              <div className="sd-stack-chips">
                <span className="sd-live-chip">
                  <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', animation: 'pulse 2s infinite' }} />
                  live
                </span>
                {CORE_STACK.map((tech) => (
                  <span key={tech.name} className="sd-tech-chip">
                    {tech.name}{" "}
                    <span className="sd-tech-ver">{tech.version}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Environment */}
            <div className="sd-section-card" style={{ marginBottom: '0' }}>
              <p className="sd-section-label" style={{ marginBottom: '6px' }}>
                <SlidersHorizontal size={13} /> Environment
              </p>
              <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: varTextColor(isDark) }}>
                Theme:{" "}
                <span style={{ color: isDark ? '#38bdf8' : '#0284c7', fontWeight: 600 }}>
                  {theme === "dark" ? "dark mode" : "light mode"}
                </span>
              </p>
              <p style={{ margin: 0, fontFamily: 'var(--font-mono, monospace)', fontSize: '12px', color: 'var(--text-muted, #737373)' }}>
                fps {fps} · {memory != null ? `${memory.toFixed(1)}mb` : "—"} heap · {uptime}s session
              </p>
            </div>


          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

function varTextColor(isDark) {
  return isDark ? '#f5f5f5' : '#0f172a';
}
