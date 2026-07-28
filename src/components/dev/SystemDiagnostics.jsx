import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconCpu2,
  IconWifi,
  IconShieldCheck,
  IconStack2,
  IconAdjustments,
  IconX,
  IconArrowRight,
} from "@tabler/icons-react";
import TechStackTicker from "../ui/TechStackTicker";
import { useTheme } from "../../context/ThemeContext";

// ----------------------------------------------------------------------------
// 1. CONFIG
// ----------------------------------------------------------------------------

const REPO_URL = "https://github.com/sujith1546/newreact";
const PING_INTERVAL_MS = 2500; // re-ping for latency
const STATS_INTERVAL_MS = 1000; // refresh fps / memory / uptime / requests

const BUILD_INFO = {
  buildVersion: "v1.4.2",
  coreStack: "React 18 + Vite 6 + Framer Motion",
};

// ----------------------------------------------------------------------------
// 2. HELPERS
// ----------------------------------------------------------------------------

function fmtUptime(ms) {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function readMemoryMB() {
  try {
    const mem = performance.memory;
    if (!mem) return null;
    return `${(mem.usedJSHeapSize / 1048576).toFixed(1)}MB`;
  } catch {
    return null;
  }
}

function readRequestCount() {
  try {
    return performance.getEntriesByType("resource").length;
  } catch {
    return null;
  }
}

// ----------------------------------------------------------------------------
// 3. LIVE DATA HOOK
// ----------------------------------------------------------------------------

function useLiveStats(open) {
  const [latencyMs, setLatencyMs]   = useState(null);
  const [fps, setFps]               = useState(null);
  const [memoryStr, setMemoryStr]   = useState(readMemoryMB());
  const [uptimeStr, setUptimeStr]   = useState("0s");
  const [requests, setRequests]     = useState(readRequestCount() ?? 0);
  const [pulsing, setPulsing]       = useState(false);

  // FPS via requestAnimationFrame
  useEffect(() => {
    if (!open) return;
    let frameCount = 0;
    let lastTime = performance.now();
    let rafId;

    const loop = (now) => {
      frameCount++;
      const elapsed = now - lastTime;
      if (elapsed >= 1000) {
        setFps(Math.min(60, Math.round((frameCount * 1000) / elapsed)));
        frameCount = 0;
        lastTime = now;
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [open]);

  // Memory, Uptime, Requests — every second
  useEffect(() => {
    if (!open) return;

    const tick = () => {
      const uptimeMs = performance.now();
      setUptimeStr(fmtUptime(uptimeMs));

      const mem = readMemoryMB();
      if (mem) setMemoryStr(mem);

      const rc = readRequestCount();
      if (rc !== null) setRequests(rc);
    };

    tick();
    const id = setInterval(tick, STATS_INTERVAL_MS);
    return () => clearInterval(id);
  }, [open]);

  // Connection latency — real fetch ping
  useEffect(() => {
    if (!open) return;

    const ping = () => {
      const start = performance.now();
      fetch(`/favicon.svg?_=${Date.now()}`, { cache: "no-store" })
        .then(() => setLatencyMs(Math.round(performance.now() - start)))
        .catch(() => setLatencyMs(null))
        .finally(() => {
          setPulsing(true);
          setTimeout(() => setPulsing(false), 300);
        });
    };

    ping();
    const id = setInterval(ping, PING_INTERVAL_MS);
    return () => clearInterval(id);
  }, [open]);

  return { latencyMs, fps, memoryStr, uptimeStr, requests, pulsing };
}

// ----------------------------------------------------------------------------
// 4. ANIMATION VARIANTS
// ----------------------------------------------------------------------------

const backdropAnim = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalAnim = {
  hidden: { opacity: 0, scale: 0.94, y: 12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
  },
  exit: { opacity: 0, scale: 0.96, y: 8, transition: { duration: 0.18 } },
};

const staggerGroup = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.04 },
  },
};

const cardAnim = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease: "easeOut" } },
};

// ----------------------------------------------------------------------------
// 5. PRESENTATIONAL COMPONENTS
// ----------------------------------------------------------------------------

function StatChip({ label, value }) {
  return (
    <div className="sd-stat-chip">
      <span className="sd-stat-label">{label}</span>
      <span className="sd-stat-value">{value}</span>
    </div>
  );
}

function InfoCard({ icon, label, wide, children }) {
  return (
    <motion.div
      variants={cardAnim}
      className={`sd-card ${wide ? 'sd-card-wide' : ''}`}
    >
      <div className="sd-card-head">
        <span className="sd-card-icon">{icon}</span>
        <span className="sd-card-label">{label}</span>
      </div>
      {children}
    </motion.div>
  );
}

// ----------------------------------------------------------------------------
// 6. MAIN SYSTEM DIAGNOSTICS COMPONENT
// ----------------------------------------------------------------------------

export default function SystemDiagnostics({ open, onClose }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { latencyMs, fps, memoryStr, uptimeStr, requests } = useLiveStats(open);
  const latencyBarPct = latencyMs !== null ? Math.min(100, Math.round((latencyMs / 120) * 100)) : 0;

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (typeof window === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="sd-backdrop"
          variants={backdropAnim}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
        >
          <style>{`
            .sd-backdrop {
              position: fixed;
              inset: 0;
              background: rgba(0, 0, 0, 0.6);
              backdrop-filter: blur(12px);
              -webkit-backdrop-filter: blur(12px);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 9999999;
              padding: 16px;
            }

            .sd-modal {
              width: 450px;
              max-width: 96vw;
              background: var(--bg-secondary);
              border: 1px solid var(--border-color);
              border-radius: 22px;
              overflow: hidden;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25), 0 0 0 1px var(--border-color);
              font-family: var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
              color: var(--text-primary);
            }

            .sd-header {
              padding: 16px 20px 14px;
              border-bottom: 1px solid var(--border-color);
              display: flex;
              align-items: center;
              justify-content: space-between;
              background: color-mix(in srgb, var(--primary-blue) 4%, var(--bg-secondary));
            }

            .sd-header-left {
              display: flex;
              gap: 12px;
              align-items: center;
            }

            .sd-icon-badge {
              width: 38px;
              height: 38px;
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
              background: color-mix(in srgb, var(--primary-blue) 12%, transparent);
              border: 1px solid color-mix(in srgb, var(--primary-blue) 30%, transparent);
              color: var(--primary-blue);
            }

            .sd-title {
              margin: 0;
              color: var(--text-primary);
              font-size: 15px;
              font-weight: 700;
              letter-spacing: -0.2px;
            }

            .sd-status-row {
              display: flex;
              align-items: center;
              gap: 6px;
              margin-top: 2px;
            }

            .sd-dot-pulse {
              width: 7px;
              height: 7px;
              border-radius: 50%;
              background: #10b981;
              display: inline-block;
              flex-shrink: 0;
              box-shadow: 0 0 6px rgba(16, 185, 129, 0.6);
              animation: sdPulse 1.8s ease-in-out infinite;
            }

            @keyframes sdPulse {
              0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5); }
              50%       { transform: scale(1.2); box-shadow: 0 0 0 4px rgba(16, 185, 129, 0); }
            }

            .sd-status-text {
              margin: 0;
              color: var(--text-muted);
              font-size: 11.5px;
              font-weight: 500;
            }

            .sd-header-right {
              display: flex;
              align-items: center;
              gap: 8px;
            }

            .sd-shortcut-kbd {
              font-size: 10px;
              font-weight: 700;
              font-family: var(--font-mono, monospace);
              color: var(--text-muted);
              background: var(--bg-primary);
              border: 1px solid var(--border-color);
              padding: 3px 7px;
              border-radius: 6px;
              letter-spacing: 0.3px;
            }

            .sd-close-btn {
              width: 30px;
              height: 30px;
              border-radius: 50%;
              background: var(--bg-primary);
              border: 1px solid var(--border-color);
              color: var(--text-muted);
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              transition: all 0.2s ease;
              flex-shrink: 0;
            }

            .sd-close-btn:hover {
              background: color-mix(in srgb, var(--primary-blue) 10%, var(--bg-primary));
              color: var(--text-primary);
              border-color: var(--primary-blue);
              transform: scale(1.05);
            }

            .sd-status-bar {
              padding: 10px 18px;
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 8px;
              background: color-mix(in srgb, var(--bg-primary) 60%, var(--bg-secondary));
              border-bottom: 1px solid var(--border-color);
            }

            .sd-stat-chip {
              text-align: center;
              display: flex;
              flex-direction: column;
              gap: 2px;
              padding: 8px 6px;
              background: var(--bg-primary);
              border: 1px solid var(--border-color);
              border-radius: 12px;
            }

            .sd-stat-label {
              font-size: 9.5px;
              color: var(--text-muted);
              font-weight: 700;
              letter-spacing: 0.05em;
              text-transform: uppercase;
            }

            .sd-stat-value {
              font-size: 13px;
              color: var(--text-primary);
              font-family: var(--font-mono, monospace);
              font-weight: 700;
            }

            .sd-body {
              padding: 16px 18px 18px;
            }

            .sd-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
            }


            .sd-card {
              border: 1px solid var(--border-color);
              border-radius: 14px;
              padding: 12px 14px;
              background: var(--bg-primary);
              transition: all 0.2s ease;
            }

            .sd-card:hover {
              border-color: color-mix(in srgb, var(--primary-blue) 40%, var(--border-color));
              transform: translateY(-1px);
            }

            .sd-card-wide {
              grid-column: 1 / -1;
            }

            .sd-card-head {
              display: flex;
              align-items: center;
              gap: 8px;
              margin-bottom: 8px;
            }

            .sd-card-icon {
              width: 24px;
              height: 24px;
              border-radius: 7px;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
              background: color-mix(in srgb, var(--primary-blue) 12%, transparent);
              color: var(--primary-blue);
            }

            .sd-card-label {
              font-size: 10px;
              color: var(--text-muted);
              letter-spacing: 0.06em;
              font-weight: 700;
              text-transform: uppercase;
            }

            .sd-value-mono {
              margin: 0;
              font-family: var(--font-mono, monospace);
              font-size: 18px;
              color: var(--text-primary);
              font-weight: 700;
            }

            .sd-value-mono-sm {
              margin: 0;
              font-family: var(--font-mono, monospace);
              fontSize: 12.5px;
              color: var(--text-primary);
              line-height: 1.5;
            }

            .sd-value-row {
              display: flex;
              align-items: center;
              justify-content: space-between;
            }

            .sd-badge-pass {
              font-size: 10px;
              color: #10b981;
              background: color-mix(in srgb, #10b981 12%, transparent);
              border: 1px solid color-mix(in srgb, #10b981 30%, transparent);
              padding: 2px 8px;
              border-radius: 999px;
              font-weight: 700;
              letter-spacing: 0.04em;
            }

            .sd-bar-track {
              height: 4px;
              background: var(--border-color);
              border-radius: 4px;
              margin-top: 8px;
              overflow: hidden;
            }

            .sd-bar-fill {
              height: 100%;
              background: linear-gradient(90deg, var(--primary-blue), #10b981);
              border-radius: 4px;
            }

            .sd-cta-btn {
              width: 100%;
              padding: 12px 18px;
              border-radius: 12px;
              border: none;
              background: var(--primary-blue);
              color: #ffffff;
              font-size: 13.5px;
              font-weight: 700;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
              cursor: pointer;
              transition: all 0.2s ease;
              box-shadow: 0 4px 16px color-mix(in srgb, var(--primary-blue) 30%, transparent);
            }

            .sd-cta-btn:hover {
              opacity: 0.94;
              transform: translateY(-1px);
              box-shadow: 0 8px 24px color-mix(in srgb, var(--primary-blue) 40%, transparent);
            }

            .sd-cta-btn:active {
              transform: translateY(0);
            }
          `}</style>

          <motion.div
            className="sd-modal"
            variants={modalAnim}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sd-title"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sd-header">
              <div className="sd-header-left">
                <div className="sd-icon-badge">
                  <IconCpu2 size={20} stroke={2} />
                </div>
                <div>
                  <p id="sd-title" className="sd-title">
                    System Diagnostics
                  </p>
                  <div className="sd-status-row">
                    <span className="sd-dot-pulse" />
                    <span className="sd-status-text">All systems nominal</span>
                  </div>
                </div>
              </div>
              <div className="sd-header-right">
                <span className="sd-shortcut-kbd">Ctrl+D</span>
                <button
                  onClick={onClose}
                  aria-label="Close diagnostics"
                  className="sd-close-btn"
                >
                  <IconX size={16} stroke={2} />
                </button>
              </div>
            </div>

            <motion.div variants={staggerGroup} initial="hidden" animate="visible" exit="exit">
              {/* Status bar */}
              <motion.div variants={cardAnim} className="sd-status-bar">
                <StatChip label="Uptime" value={uptimeStr} />
                <StatChip label="FPS" value={fps !== null ? fps : "…"} />
                <StatChip label="Memory" value={memoryStr ?? "—"} />
                <StatChip label="Requests" value={requests} />
              </motion.div>

              {/* Body */}
              <div className="sd-body">
                <div className="sd-grid">
                  <InfoCard
                    icon={<IconWifi size={14} stroke={2} />}
                    label="CONNECTION"
                  >
                    <p className="sd-value-mono">{latencyMs !== null ? `${latencyMs}ms` : "pinging…"}</p>
                    <div className="sd-bar-track">
                      <motion.div
                        className="sd-bar-fill"
                        animate={{ width: `${latencyBarPct}%` }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                      />
                    </div>
                  </InfoCard>

                  <InfoCard
                    icon={<IconShieldCheck size={14} stroke={2} />}
                    label="BUILD VERSION"
                  >
                    <div className="sd-value-row">
                      <p className="sd-value-mono">{BUILD_INFO.buildVersion}</p>
                      <span className="sd-badge-pass">PASS</span>
                    </div>
                  </InfoCard>

                  <InfoCard
                    icon={<IconStack2 size={14} stroke={2} />}
                    label="CORE STACK"
                    wide
                  >
                    <TechStackTicker />
                  </InfoCard>

                  <InfoCard
                    icon={<IconAdjustments size={14} stroke={2} />}
                    label="ENVIRONMENT"
                    wide
                  >
                    <p className="sd-value-mono-sm">
                      Theme: <span style={{ color: 'var(--primary-blue)', fontWeight: 700 }}>{isDark ? '🌙 Dark Mode' : '☀️ Light Mode'}</span>
                    </p>
                    <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono, monospace)' }}>
                      FPS {fps !== null ? fps : '…'} · {memoryStr ?? '—'} heap · {uptimeStr} session
                    </p>
                  </InfoCard>
                </div>
              </div>

            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
