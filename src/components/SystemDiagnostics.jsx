import { useState, useEffect } from "react";
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

function StatChip({ label, value, styles }) {
  return (
    <div style={styles.stat}>
      <span style={styles.statLabel}>{label}</span>
      <span style={styles.statValue}>{value}</span>
    </div>
  );
}

function InfoCard({ icon, iconBg, label, wide, children, styles }) {
  return (
    <motion.div
      variants={cardAnim}
      style={{ ...styles.card, ...(wide ? styles.cardWide : {}) }}
    >
      <div style={styles.cardHead}>
        <span style={{ ...styles.cardIcon, background: iconBg }}>{icon}</span>
        <span style={styles.cardLabel}>{label}</span>
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
  const isDark = theme === "dark";
  const styles = getStyles(isDark);
  const { latencyMs, fps, memoryStr, uptimeStr, requests } = useLiveStats(open);
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
      {open && (
        <motion.div
          style={styles.backdrop}
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
              0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.55); }
              50%       { box-shadow: 0 0 0 5px rgba(16, 185, 129, 0); }
            }
            .sd-close-btn:hover {
              background: ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'} !important;
              color: ${isDark ? '#f1f0f5' : '#0f172a'} !important;
            }
            .sd-cta-btn:hover {
              opacity: 0.92;
              transform: translateY(-1px);
              box-shadow: ${isDark ? '0 10px 28px rgba(139,92,246,0.5)' : '0 10px 28px rgba(59,130,246,0.4)'} !important;
            }
            .sd-cta-btn:active { transform: translateY(0); }
          `}</style>
          <motion.div
            style={styles.modal}
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
            <div style={styles.header}>
              <div style={styles.headerLeft}>
                <div style={styles.iconBadge}>
                  <IconCpu2 size={18} stroke={1.75} color={isDark ? "#a78bfa" : "#4f46e5"} />
                </div>
                <div>
                  <p id="sd-title" style={styles.title}>
                    System diagnostics
                  </p>
                  <div style={styles.statusRow}>
                    <span
                      className="sd-dot-pulse"
                      style={styles.dot}
                    />
                    <span style={styles.statusText}>All systems nominal</span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close diagnostics"
                className="sd-close-btn"
                style={styles.closeBtn}
              >
                <IconX size={15} stroke={1.75} />
              </button>
            </div>

            <motion.div variants={staggerGroup} initial="hidden" animate="visible" exit="exit">
              {/* ---------- Status bar ---------- */}
              <motion.div variants={cardAnim} style={styles.statusBar}>
                <StatChip label="Uptime" value={uptimeStr} styles={styles} />
                <StatChip label="FPS" value={fps !== null ? fps : "…"} styles={styles} />
                <StatChip label="Memory" value={memoryStr ?? "—"} styles={styles} />
                <StatChip label="Requests" value={requests} styles={styles} />
              </motion.div>

              {/* ---------- Body ---------- */}
              <div style={styles.body}>
                <div style={styles.grid}>
                  <InfoCard
                    icon={<IconWifi size={12} stroke={2} color={isDark ? "#60a5fa" : "#2563eb"} />}
                    iconBg={isDark ? "rgba(59, 130, 246, 0.15)" : "rgba(37, 99, 235, 0.08)"}
                    label="CONNECTION"
                    styles={styles}
                  >
                    <p style={styles.valueMono}>{latencyMs !== null ? `${latencyMs}ms` : "pinging…"}</p>
                    <div style={styles.barTrack}>
                      <motion.div
                        style={styles.barFill}
                        animate={{ width: `${latencyBarPct}%` }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                      />
                    </div>
                  </InfoCard>

                  <InfoCard
                    icon={<IconShieldCheck size={12} stroke={2} color={isDark ? "#34d399" : "#16a34a"} />}
                    iconBg={isDark ? "rgba(16, 185, 129, 0.15)" : "rgba(22, 163, 74, 0.08)"}
                    label="BUILD VERSION"
                    styles={styles}
                  >
                    <div style={styles.valueRow}>
                      <p style={styles.valueMono}>{BUILD_INFO.buildVersion}</p>
                      <span style={styles.badgePass}>PASS</span>
                    </div>
                  </InfoCard>

                  <InfoCard
                    icon={<IconStack2 size={12} stroke={2} color={isDark ? "#c084fc" : "#7c3aed"} />}
                    iconBg={isDark ? "rgba(139, 92, 246, 0.15)" : "rgba(124, 58, 237, 0.08)"}
                    label="CORE STACK"
                    wide
                    styles={styles}
                  >
                    <TechStackTicker />
                  </InfoCard>

                  <InfoCard
                    icon={<IconAdjustments size={12} stroke={2} color={isDark ? "#fb923c" : "#ea580c"} />}
                    iconBg={isDark ? "rgba(249, 115, 22, 0.15)" : "rgba(234, 88, 12, 0.08)"}
                    label="ENVIRONMENT"
                    wide
                    styles={styles}
                  >
                    <p style={styles.valueMonoSm}>
                      Theme: <span style={{ color: isDark ? '#a78bfa' : '#4f46e5', fontWeight: 700 }}>{isDark ? '🌙 Dark Mode' : '☀️ Light Mode'}</span>
                    </p>
                    <p style={{ ...styles.valueMonoSm, marginTop: 4, color: styles.statLabel.color, fontSize: 11 }}>
                      FPS {fps !== null ? fps : '…'} · {memoryStr ?? '—'} heap · {uptimeStr} session
                    </p>
                  </InfoCard>
                </div>

                <motion.button
                  variants={cardAnim}
                  className="sd-cta-btn"
                  style={styles.cta}
                  onClick={() => window.open(REPO_URL, "_blank")}
                >
                  Inspect source code
                  <IconArrowRight size={14} stroke={2} />
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ----------------------------------------------------------------------------
// 6. STYLES — Dynamic Theme-Aware Glassmorphic Styles
// ----------------------------------------------------------------------------

const MONO = '"SF Mono", "JetBrains Mono", "Fira Code", monospace';

function getStyles(isDark) {
  const PALETTE = isDark ? {
    bg:          'rgba(10, 6, 24, 0.96)',
    backdrop:    'rgba(0, 0, 0, 0.7)',
    bgCard:      'rgba(18, 12, 38, 0.85)',
    border:      'rgba(139, 92, 246, 0.22)',
    borderSub:   'rgba(255, 255, 255, 0.07)',
    textPri:     '#f1f0f5',
    textSec:     'rgba(200, 190, 230, 0.6)',
    shadow:      '0 0 0 1px rgba(139,92,246,0.15), 0 32px 80px rgba(0,0,0,0.8), 0 0 60px rgba(139,92,246,0.1)',
    ctaBg:       'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
    ctaShadow:   '0 4px 20px rgba(139,92,246,0.4)',
    headerBg:    'rgba(139,92,246,0.06)',
    statusBarBg: 'rgba(0,0,0,0.3)',
    badgeBg:     'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(99,102,241,0.12))',
    badgeBorder: 'rgba(139,92,246,0.25)',
  } : {
    bg:          'rgba(255, 255, 255, 0.88)',
    backdrop:    'rgba(15, 23, 42, 0.35)',
    bgCard:      'rgba(248, 250, 252, 0.85)',
    border:      'rgba(99, 102, 241, 0.2)',
    borderSub:   'rgba(0, 0, 0, 0.06)',
    textPri:     '#0f172a',
    textSec:     '#64748b',
    shadow:      '0 0 0 1px rgba(99,102,241,0.12), 0 24px 64px rgba(15,23,42,0.15), 0 8px 24px rgba(0,0,0,0.06)',
    ctaBg:       'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    ctaShadow:   '0 4px 20px rgba(37,99,235,0.35)',
    headerBg:    'rgba(99,102,241,0.03)',
    statusBarBg: 'rgba(241,245,249,0.7)',
    badgeBg:     'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(59,130,246,0.08))',
    badgeBorder: 'rgba(99,102,241,0.18)',
  };

  return {
    backdrop: {
      position: 'fixed',
      inset: 0,
      background: PALETTE.backdrop,
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999999,
      padding: '1rem',
    },
    modal: {
      width: 440,
      maxWidth: '96vw',
      background: PALETTE.bg,
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderRadius: 20,
      border: `1px solid ${PALETTE.border}`,
      overflow: 'hidden',
      boxShadow: PALETTE.shadow,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif',
    },

    header: {
      padding: '16px 18px 14px',
      borderBottom: `1px solid ${PALETTE.borderSub}`,
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      background: PALETTE.headerBg,
    },
    headerLeft: { display: 'flex', gap: 10, alignItems: 'flex-start' },
    iconBadge: {
      width: 38,
      height: 38,
      borderRadius: 11,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      background: PALETTE.badgeBg,
      border: `1px solid ${PALETTE.badgeBorder}`,
    },
    title: { margin: 0, color: PALETTE.textPri, fontSize: 15, fontWeight: 700, letterSpacing: '-0.2px' },
    statusRow: { display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 },
    dot: {
      width: 7,
      height: 7,
      borderRadius: '50%',
      background: '#10b981',
      display: 'inline-block',
      flexShrink: 0,
    },
    statusText: { margin: 0, color: PALETTE.textSec, fontSize: 11.5 },
    closeBtn: {
      width: 28,
      height: 28,
      borderRadius: '50%',
      background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
      border: `1px solid ${PALETTE.borderSub}`,
      color: PALETTE.textSec,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.18s ease',
      flexShrink: 0,
    },

    statusBar: {
      padding: '10px 18px',
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 6,
      background: PALETTE.statusBarBg,
      borderBottom: `1px solid ${PALETTE.borderSub}`,
    },
    stat: { textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 3 },
    statLabel: { fontSize: 9, color: PALETTE.textSec, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' },
    statValue: { fontSize: 13, color: PALETTE.textPri, fontFamily: MONO, fontWeight: 700 },

    body: { padding: '14px 18px 16px' },
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 8,
      marginBottom: 10,
    },

    card: {
      border: `1px solid ${PALETTE.borderSub}`,
      borderRadius: 13,
      padding: 12,
      background: PALETTE.bgCard,
      backdropFilter: 'blur(10px)',
      boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.02)',
      transition: 'border-color 0.2s',
    },
    cardWide: { gridColumn: '1 / -1' },
    cardHead: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 },
    cardIcon: {
      width: 22,
      height: 22,
      borderRadius: 6,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    cardLabel: {
      fontSize: 10,
      color: PALETTE.textSec,
      letterSpacing: '0.06em',
      fontWeight: 700,
      textTransform: 'uppercase',
    },

    valueMono: { margin: 0, fontFamily: MONO, fontSize: 18, color: PALETTE.textPri, fontWeight: 700 },
    valueMonoSm: { margin: 0, fontFamily: MONO, fontSize: 13, color: PALETTE.textPri, lineHeight: 1.5 },
    valueRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    badgePass: {
      fontSize: 10,
      color: '#10b981',
      background: 'rgba(16,185,129,0.12)',
      border: '1px solid rgba(16,185,129,0.25)',
      padding: '2px 8px',
      borderRadius: 20,
      fontWeight: 700,
      letterSpacing: '0.04em',
    },

    barTrack: {
      height: 3,
      background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)',
      borderRadius: 3,
      marginTop: 8,
      overflow: 'hidden',
    },
    barFill: {
      height: '100%',
      background: isDark ? 'linear-gradient(90deg, #8b5cf6, #3b82f6)' : 'linear-gradient(90deg, #3b82f6, #10b981)',
      borderRadius: 3,
    },

    cta: {
      width: '100%',
      padding: '11px 16px',
      borderRadius: 12,
      border: 'none',
      background: PALETTE.ctaBg,
      color: '#ffffff',
      fontSize: 13.5,
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      cursor: 'pointer',
      transition: 'opacity 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
      boxShadow: PALETTE.ctaShadow,
      letterSpacing: '-0.1px',
    },
  };
}


