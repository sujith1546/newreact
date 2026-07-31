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
              background: rgba(0, 0, 0, 0.4);
              backdrop-filter: blur(8px);
              -webkit-backdrop-filter: blur(8px);
              padding: 16px;
            }

            .sd-modal-card {
              width: 100%;
              max-width: 480px;
              border-radius: 14px;
              border: 1px solid #e2e2e0;
              background: #ffffff;
              padding: 16px;
              font-family: var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
              color: #1a1a19;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
              box-sizing: border-box;
            }

            [data-theme="dark"] .sd-modal-card {
              background: #171717;
              border-color: rgba(255, 255, 255, 0.1);
              color: #f5f5f5;
              box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
              border-radius: 16px;
              padding: 24px;
            }

            .sd-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding-bottom: 12px;
              margin-bottom: 12px;
              border-bottom: 1px solid #ececea;
              background: #ffffff;
            }

            [data-theme="dark"] .sd-header {
              border-bottom: none;
              padding-bottom: 0;
              margin-bottom: 20px;
              background: transparent;
            }

            .sd-header-info {
              display: flex;
              align-items: center;
              gap: 10px;
            }

            .sd-icon-box {
              width: 28px;
              height: 28px;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #f5f5f3;
              color: #1a1a19;
            }

            [data-theme="dark"] .sd-icon-box {
              width: 32px;
              height: 32px;
              background: #262626;
              color: #e5e5e5;
            }

            .sd-title {
              font-size: 13px;
              font-weight: 500;
              margin: 0;
              color: #1a1a19;
            }

            [data-theme="dark"] .sd-title {
              font-size: 14px;
              font-weight: 600;
              color: #f5f5f5;
            }

            .sd-status-sub {
              display: flex;
              align-items: center;
              gap: 6px;
              font-size: 11px;
              color: #8a8a86;
              margin-top: 1px;
            }

            [data-theme="dark"] .sd-status-sub {
              font-size: 12px;
              color: #737373;
            }

            .sd-green-dot {
              display: inline-block;
              width: 6px;
              height: 6px;
              border-radius: 50%;
              background: #34c759;
            }

            [data-theme="dark"] .sd-green-dot {
              background: #10b981;
            }

            .sd-header-actions {
              display: flex;
              align-items: center;
              gap: 10px;
            }

            .sd-kbd-badge {
              border-radius: 4px;
              border: 1px solid #e2e2e0;
              padding: 2px 6px;
              font-family: var(--font-mono, monospace);
              font-size: 10px;
              color: #9a9a96;
            }

            [data-theme="dark"] .sd-kbd-badge {
              border-radius: 6px;
              border-color: rgba(255, 255, 255, 0.1);
              font-size: 11px;
              color: #737373;
            }

            .sd-close-button {
              background: transparent;
              border: none;
              color: #9a9a96;
              cursor: pointer;
              padding: 2px;
              display: flex;
              align-items: center;
              justify-content: center;
              transition: color 0.15s ease;
            }

            .sd-close-button:hover {
              color: #1a1a19;
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
              border-radius: 10px;
              background: #fafaf9;
              border: 1px solid #ececea;
              padding: 10px;
              box-sizing: border-box;
            }

            [data-theme="dark"] .sd-tile {
              border-radius: 8px;
              background: #262626;
              border: none;
            }

            .sd-tile-label {
              font-size: 10px;
              color: #9a9a96;
              margin: 0 0 4px 0;
            }

            [data-theme="dark"] .sd-tile-label {
              font-size: 11px;
              color: #737373;
            }

            .sd-tile-value {
              font-family: var(--font-mono, monospace);
              font-size: 15px;
              font-weight: 500;
              margin: 0;
              color: #1a1a19;
            }

            [data-theme="dark"] .sd-tile-value {
              font-size: 15px;
              font-weight: 600;
              color: #f5f5f5;
            }

            .sd-two-col-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 8px;
              margin-bottom: 8px;
            }

            .sd-pass-badge {
              border-radius: 5px;
              background: #e9f7ee;
              padding: 2px 8px;
              font-size: 10px;
              font-weight: 600;
              color: #1a7a3d;
            }

            [data-theme="dark"] .sd-pass-badge {
              border-radius: 6px;
              background: rgba(16, 185, 129, 0.15);
              font-weight: 700;
              color: #34d399;
            }

            .sd-section-card {
              border-radius: 10px;
              background: #fafaf9;
              border: 1px solid #ececea;
              padding: 12px;
              margin-bottom: 8px;
              box-sizing: border-box;
            }

            [data-theme="dark"] .sd-section-card {
              border-radius: 8px;
              background: #262626;
              border: none;
            }

            .sd-section-label {
              display: flex;
              align-items: center;
              gap: 6px;
              font-size: 10px;
              color: #9a9a96;
              margin: 0 0 10px 0;
            }

            [data-theme="dark"] .sd-section-label {
              font-size: 11px;
              color: #737373;
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
              background: #ffffff;
              border: 1px solid #dcdcda;
              padding: 4px 10px;
              font-size: 11px;
              color: #1a1a19;
              font-weight: 500;
            }

            [data-theme="dark"] .sd-live-chip {
              background: #f5f5f5;
              border: none;
              color: #171717;
              font-weight: 600;
            }

            .sd-tech-chip {
              border-radius: 6px;
              background: #ffffff;
              border: 1px solid #ececea;
              padding: 4px 10px;
              font-size: 11px;
              color: #1a1a19;
            }

            [data-theme="dark"] .sd-tech-chip {
              background: transparent;
              border-color: rgba(255, 255, 255, 0.1);
              font-size: 12px;
              color: #e5e5e5;
            }

            .sd-tech-ver {
              font-family: var(--font-mono, monospace);
              font-size: 11px;
              color: #b0b0ac;
            }

            [data-theme="dark"] .sd-tech-ver {
              color: #a3a3a3;
            }

            .sd-env-theme-line {
              margin: 0 0 4px 0;
              font-size: 13px;
              color: #1a1a19;
            }

            [data-theme="dark"] .sd-env-theme-line {
              font-size: 14px;
              color: #f5f5f5;
            }

            .sd-env-theme-val {
              color: #1a1a19;
              font-weight: 500;
            }

            [data-theme="dark"] .sd-env-theme-val {
              color: #38bdf8;
              font-weight: 600;
            }

            .sd-env-meta-line {
              margin: 0;
              font-family: var(--font-mono, monospace);
              font-size: 11px;
              color: #9a9a96;
            }

            [data-theme="dark"] .sd-env-meta-line {
              font-size: 12px;
              color: #737373;
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
              <div className="sd-tile" style={{ padding: '10px 12px' }}>
                <p className="sd-section-label" style={{ marginBottom: '6px' }}>
                  <Wifi size={13} /> Latency
                </p>
                <p className="sd-tile-value" style={{ fontSize: '15px', marginBottom: '6px' }}>
                  {latency != null ? `${latency}ms` : "—"}
                </p>
                <div style={{ height: '3px', width: '100%', borderRadius: '999px', background: isDark ? 'rgba(255,255,255,0.1)' : '#ececea', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      borderRadius: '999px',
                      background: isDark ? '#10b981' : '#1a1a19',
                      width: `${latencyPercent}%`,
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>
              <div className="sd-tile" style={{ padding: '10px 12px' }}>
                <p className="sd-section-label" style={{ marginBottom: '6px' }}>
                  <Gauge size={13} /> Build
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <p className="sd-tile-value" style={{ fontSize: '15px' }}>
                    {BUILD_VERSION}
                  </p>
                  <span className="sd-pass-badge">pass</span>
                </div>
              </div>
            </div>

            {/* Core stack */}
            <div className="sd-section-card">
              <p className="sd-section-label">
                <Layers size={13} /> Core stack
              </p>
              <div className="sd-stack-chips">
                <span className="sd-live-chip">
                  <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: isDark ? '#34d399' : '#34c759', animation: 'pulse 2s infinite' }} />
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
              <p className="sd-env-theme-line">
                Theme:{" "}
                <span className="sd-env-theme-val">
                  {theme === "dark" ? "dark mode" : "light mode"}
                </span>
              </p>
              <p className="sd-env-meta-line">
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
