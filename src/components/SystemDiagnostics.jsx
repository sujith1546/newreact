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
import TechStackTicker from "./TechStackTicker";
import { useTheme } from "../context/ThemeContext";

// ----------------------------------------------------------------------------
// 1. CONFIG
// ----------------------------------------------------------------------------

const REPO_URL = "https://github.com/sujith1546/reactportfolio-main";
const PING_INTERVAL_MS = 2500; // how often to re-ping for latency
const STATS_INTERVAL_MS = 1000; // how often to refresh fps / memory / uptime / requests

const BUILD_INFO = {
  buildVersion: "v1.4.2",
  coreStack: "React 18 + Vite 6 + Framer Motion",
};

// ----------------------------------------------------------------------------
// 2. HELPERS
// ----------------------------------------------------------------------------

/** Format milliseconds → "1m 23s" or "45s" */
function fmtUptime(ms) {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

/** Read JS heap usage from the browser (Chrome/Edge only). Returns null on unsupported. */
function readMemoryMB() {
  try {
    const mem = performance.memory;
    if (!mem) return null;
    return `${(mem.usedJSHeapSize / 1048576).toFixed(1)}MB`;
  } catch {
    return null;
  }
}

/** Count resource entries loaded since page start */
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

  // ── FPS via requestAnimationFrame ──────────────────────────────────────────
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

  // ── Memory, Uptime, Requests — every second ────────────────────────────────
  useEffect(() => {
    if (!open) return;

    const tick = () => {
      // Uptime = time since page was first navigated to
      const uptimeMs = performance.now(); // ms since page load
      setUptimeStr(fmtUptime(uptimeMs));

      // Memory
      const mem = readMemoryMB();
      if (mem) setMemoryStr(mem);

      // Resource request count
      const rc = readRequestCount();
      if (rc !== null) setRequests(rc);
    };

    tick(); // immediate
    const id = setInterval(tick, STATS_INTERVAL_MS);
    return () => clearInterval(id);
  }, [open]);

  // ── Connection latency — real fetch ping ───────────────────────────────────
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
// 3. ANIMATION VARIANTS — Framer Motion timing lives here
// ----------------------------------------------------------------------------

const backdropAnim = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalAnim = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
  },
  exit: { opacity: 0, scale: 0.97, y: 6, transition: { duration: 0.15 } },
};

const staggerGroup = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const cardAnim = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
};

// ----------------------------------------------------------------------------
// 4. SMALL PRESENTATIONAL PIECES
// ----------------------------------------------------------------------------

function StatChip({ label, value }) {
  return (
    <div style={S.stat}>
      <span style={S.statLabel}>{label}</span>
      <span style={S.statValue}>{value}</span>
    </div>
  );
}

function InfoCard({ icon, iconBg, label, wide, children }) {
  return (
    <motion.div
      variants={cardAnim}
      style={{ ...S.card, ...(wide ? S.cardWide : {}) }}
    >
      <div style={S.cardHead}>
        <span style={{ ...S.cardIcon, background: iconBg }}>{icon}</span>
        <span style={S.cardLabel}>{label}</span>
      </div>
      {children}
    </motion.div>
  );
}

// ----------------------------------------------------------------------------
// 5. MAIN COMPONENT
// ----------------------------------------------------------------------------

export default function SystemDiagnostics({ open, onClose }) {
  const { theme } = useTheme();
  const { latencyMs, fps, memoryStr, uptimeStr, requests, pulsing } = useLiveStats(open);
  const latencyBarPct = latencyMs !== null ? Math.min(100, Math.round((latencyMs / 120) * 100)) : 0;

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && createPortal(
        <motion.div
          style={S.backdrop}
          variants={backdropAnim}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
        >
          <style>{`
            .sd-dot-pulse {
              animation: sdPulse 1.8s ease-in-out infinite;
            }
            @keyframes sdPulse {
              0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.5); }
              50% { box-shadow: 0 0 0 4px rgba(34, 197, 94, 0); }
            }
            .sd-close-btn:hover {
              background: rgba(128, 128, 128, 0.12) !important;
              color: var(--text-primary) !important;
            }
            .sd-cta-btn:hover {
              opacity: 0.88;
              transform: translateY(-1px);
              box-shadow: 0 8px 24px rgba(59, 130, 246, 0.45) !important;
            }
            .sd-cta-btn:active {
              transform: translateY(0);
            }
          `}</style>
          <motion.div
            style={S.modal}
            variants={modalAnim}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sd-title"
            onClick={(e) => e.stopPropagation()} // don't close when clicking inside
          >
            {/* ---------- Header ---------- */}
            <div style={S.header}>
              <div style={S.headerLeft}>
                <div style={{ ...S.iconBadge, background: "rgba(79, 70, 229, 0.08)" }}>
                  <IconCpu2 size={18} stroke={1.75} color="#4f46e5" />
                </div>
                <div>
                  <p id="sd-title" style={S.title}>
                    System diagnostics
                  </p>
                  <div style={S.statusRow}>
                    <span
                      className="sd-dot-pulse"
                      style={S.dot}
                    />
                    <span style={S.statusText}>All systems nominal</span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close diagnostics"
                className="sd-close-btn"
                style={S.closeBtn}
              >
                <IconX size={15} stroke={1.75} />
              </button>
            </div>

            <motion.div variants={staggerGroup} initial="hidden" animate="visible" exit="exit">
              {/* ---------- Status bar ---------- */}
              <motion.div variants={cardAnim} style={S.statusBar}>
                <StatChip label="Uptime" value={uptimeStr} />
                <StatChip label="FPS" value={fps !== null ? fps : "…"} />
                <StatChip label="Memory" value={memoryStr ?? "—"} />
                <StatChip label="Requests" value={requests} />
              </motion.div>

              {/* ---------- Body ---------- */}
              <div style={S.body}>
                <div style={S.grid}>
                  <InfoCard
                    icon={<IconWifi size={12} stroke={2} color="#2563eb" />}
                    iconBg="rgba(37, 99, 235, 0.08)"
                    label="CONNECTION"
                  >
                    <p style={S.valueMono}>{latencyMs !== null ? `${latencyMs}ms` : "pinging…"}</p>
                    <div style={S.barTrack}>
                      <motion.div
                        style={S.barFill}
                        animate={{ width: `${latencyBarPct}%` }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                      />
                    </div>
                  </InfoCard>

                  <InfoCard
                    icon={<IconShieldCheck size={12} stroke={2} color="#16a34a" />}
                    iconBg="rgba(22, 163, 74, 0.08)"
                    label="BUILD VERSION"
                  >
                    <div style={S.valueRow}>
                      <p style={S.valueMono}>{BUILD_INFO.buildVersion}</p>
                      <span style={S.badgePass}>PASS</span>
                    </div>
                  </InfoCard>

                  <InfoCard
                    icon={<IconStack2 size={12} stroke={2} color="#7c3aed" />}
                    iconBg="rgba(124, 58, 237, 0.08)"
                    label="CORE STACK"
                    wide
                  >
                    <TechStackTicker />
                  </InfoCard>

                  <InfoCard
                    icon={<IconAdjustments size={12} stroke={2} color="#ea580c" />}
                    iconBg="rgba(234, 88, 12, 0.08)"
                    label="ENVIRONMENT"
                    wide
                  >
                    <p style={S.valueMonoSm}>
                      Theme: <span style={{ color: theme === 'dark' ? '#818cf8' : '#f59e0b', fontWeight: 700 }}>{theme === 'dark' ? '🌙 Dark' : '☀️ Light'}</span>
                    </p>
                    <p style={{ ...S.valueMonoSm, marginTop: 4, color: 'var(--text-secondary)', fontSize: 11 }}>
                      FPS {fps !== null ? fps : '…'} · {memoryStr ?? '—'} heap · {uptimeStr} session
                    </p>
                  </InfoCard>
                </div>

                <motion.button
                  variants={cardAnim}
                  className="sd-cta-btn"
                  style={S.cta}
                  onClick={() => window.open(REPO_URL, "_blank")}
                >
                  Inspect source code
                  <IconArrowRight size={14} stroke={2} />
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      , document.body)}
    </AnimatePresence>
  );
}

// ----------------------------------------------------------------------------
// 6. STYLES — theme-aware values pulling from index.css tokens
// ----------------------------------------------------------------------------

const MONO = '"SF Mono", "JetBrains Mono", monospace';

const S = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0, 0, 0, 0.65)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999999,
    padding: "1rem",
  },
  modal: {
    width: 430,
    maxWidth: "100%",
    background: "var(--bg-secondary)",
    borderRadius: 16,
    border: "1px solid var(--border-color)",
    overflow: "hidden",
    boxShadow: "0 0 0 1px rgba(59,130,246,0.06), 0 24px 64px rgba(0,0,0,0.2)",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif',
  },

  header: {
    padding: "16px 18px 14px",
    borderBottom: "1px solid var(--border-color)",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  headerLeft: { display: "flex", gap: 10, alignItems: "flex-start" },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  title: { margin: 0, color: "var(--text-primary)", fontSize: 15, fontWeight: 700, letterSpacing: "-0.2px" },
  statusRow: { display: "flex", alignItems: "center", gap: 5, marginTop: 3 },
  dot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#10b981",
    display: "inline-block",
    flexShrink: 0,
  },
  statusText: { margin: 0, color: "var(--text-secondary)", fontSize: 11.5 },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: "rgba(128,128,128,0.07)",
    border: "none",
    color: "var(--text-secondary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "background 0.18s ease, color 0.18s ease",
    flexShrink: 0,
  },

  statusBar: {
    padding: "10px 18px",
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 6,
    background: "var(--bg-primary)",
    borderBottom: "1px solid var(--border-color)",
  },
  stat: { textAlign: "center", display: "flex", flexDirection: "column", gap: 3 },
  statLabel: { fontSize: 9, color: "var(--text-secondary)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" },
  statValue: { fontSize: 13, color: "var(--text-primary)", fontFamily: MONO, fontWeight: 600 },

  body: { padding: "14px 18px 16px" },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
    marginBottom: 10,
  },

  card: {
    border: "1px solid var(--border-color)",
    borderRadius: 11,
    padding: 12,
    background: "var(--bg-primary)",
  },
  cardWide: { gridColumn: "1 / -1" },
  cardHead: { display: "flex", alignItems: "center", gap: 6, marginBottom: 8 },
  cardIcon: {
    width: 22,
    height: 22,
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cardLabel: {
    fontSize: 10,
    color: "var(--text-secondary)",
    letterSpacing: "0.05em",
    fontWeight: 600,
    textTransform: "uppercase",
  },

  valueMono: { margin: 0, fontFamily: MONO, fontSize: 17, color: "var(--text-primary)", fontWeight: 600 },
  valueMonoSm: { margin: 0, fontFamily: MONO, fontSize: 13, color: "var(--text-primary)", lineHeight: 1.5 },
  valueRow: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  badgePass: {
    fontSize: 10,
    color: "#10b981",
    background: "rgba(16, 185, 129, 0.1)",
    border: "1px solid rgba(16, 185, 129, 0.2)",
    padding: "2px 8px",
    borderRadius: 20,
    fontWeight: 600,
    letterSpacing: "0.03em",
  },

  barTrack: {
    height: 3,
    background: "var(--border-color)",
    borderRadius: 3,
    marginTop: 8,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    background: "linear-gradient(90deg, #3b82f6, #10b981)",
    borderRadius: 3,
  },

  cta: {
    width: "100%",
    padding: "11px 16px",
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(135deg, var(--primary-blue) 0%, #60a5fa 100%)",
    color: "#ffffff",
    fontSize: 13.5,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    cursor: "pointer",
    transition: "opacity 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease",
    boxShadow: "0 4px 16px rgba(59, 130, 246, 0.3)",
    letterSpacing: "-0.1px",
  },
};
