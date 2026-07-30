import { useState, useRef } from "react";
import { Sparkles, Wrench, TrendingUp, Zap, ChevronDown } from "lucide-react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useUpdates } from "../hooks/useUpdates";

const typeStyles = {
  feature:     { dot: "#10b981", glow: "rgba(16,185,129,0.4)",  badgeBg: "rgba(16,185,129,0.10)",  badgeColor: "#10b981", badgeBorder: "rgba(16,185,129,0.3)",  icon: Sparkles    },
  fix:         { dot: "#f59e0b", glow: "rgba(245,158,11,0.4)", badgeBg: "rgba(245,158,11,0.10)", badgeColor: "#f59e0b", badgeBorder: "rgba(245,158,11,0.3)", icon: Wrench      },
  improvement: { dot: "#3b82f6", glow: "rgba(59,130,246,0.4)",  badgeBg: "rgba(59,130,246,0.10)",  badgeColor: "#3b82f6", badgeBorder: "rgba(59,130,246,0.3)",  icon: TrendingUp  },
};

const filters = [
  { key: "all",         label: "All",          icon: null        },
  { key: "feature",     label: "Features",     icon: Sparkles    },
  { key: "fix",         label: "Fixes",        icon: Wrench      },
  { key: "improvement", label: "Improvements", icon: TrendingUp  },
];

function formatDate(d) {
  if (!d) return "Jul 28, 2026";
  try { return new Date(d).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" }); }
  catch { return d; }
}

function timeAgo(d) {
  if (!d) return "";
  const ms = Date.now() - new Date(d).getTime();
  const h = Math.floor(ms / 3600000), dy = Math.floor(h / 24);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  if (dy < 30) return `${dy}d ago`;
  return "";
}

function EntryCard({ entry, index, isNew }) {
  const [open, setOpen] = useState(isNew);
  const ts = typeStyles[entry.category] || typeStyles.improvement;
  const Icon = ts.icon;

  return (
    <motion.div
      style={{ position: "relative", marginBottom: 16, width: "100%" }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.32, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Timeline dot */}
      <motion.div
        style={{
          position: "absolute",
          left: -13,
          top: 20,
          width: 12,
          height: 12,
          borderRadius: "50%",
          background: ts.dot,
          boxShadow: `0 0 0 3px var(--bg-secondary), 0 0 12px ${ts.glow}`,
          zIndex: 2,
          transform: "translateX(-50%)",
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: index * 0.06 + 0.1, type: "spring", stiffness: 380, damping: 22 }}
      >
        {isNew && (
          <motion.div
            style={{
              position: "absolute", inset: -5, borderRadius: "50%",
              border: `2px solid ${ts.dot}`, pointerEvents: "none",
            }}
            animate={{ scale: [1, 1.8], opacity: [0.7, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
          />
        )}
      </motion.div>

      {/* Card */}
      <motion.div
        onClick={() => setOpen(v => !v)}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.18 }}
        style={{
          background: "var(--bg-primary)",
          border: `1px solid var(--border-color)`,
          borderRadius: 13,
          padding: "13px 15px",
          cursor: "pointer",
          userSelect: "none",
          width: "100%",
          boxSizing: "border-box",
          transition: "border-color 0.18s, box-shadow 0.18s",
        }}
      >
        {/* Header row */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          {/* Icon box */}
          <div style={{
            width: 30, height: 30, borderRadius: 8, flexShrink: 0,
            background: ts.badgeBg,
            border: `1px solid ${ts.badgeBorder}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: ts.badgeColor, marginTop: 2,
          }}>
            <Icon size={14} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Badges + date row */}
            <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginBottom: 5 }}>
              <span style={{
                fontSize: 10.5, fontWeight: 700, textTransform: "capitalize",
                padding: "2px 8px", borderRadius: 999,
                background: ts.badgeBg, color: ts.badgeColor,
                border: `1px solid ${ts.badgeBorder}`,
              }}>
                {entry.category || entry.type}
              </span>
              {isNew && (
                <motion.span
                  style={{
                    fontSize: 10.5, fontWeight: 700, padding: "2px 8px", borderRadius: 999,
                    background: "rgba(99,102,241,0.12)", color: "#6366f1",
                    border: "1px solid rgba(99,102,241,0.28)",
                  }}
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ✦ new
                </motion.span>
              )}
              <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>
                {formatDate(entry.created_at || entry.date)}
              </span>
              {timeAgo(entry.created_at) && (
                <span style={{
                  fontSize: 11, color: "var(--text-muted)",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-color)",
                  padding: "1px 7px", borderRadius: 999,
                }}>
                  {timeAgo(entry.created_at)}
                </span>
              )}
            </div>

            {/* Title */}
            <p style={{
              margin: 0, fontSize: 14, fontWeight: 700,
              color: "var(--text-primary)", lineHeight: 1.4,
            }}>
              {entry.title}
            </p>
          </div>

          {/* Chevron */}
          <motion.div
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            style={{ color: "var(--text-muted)", flexShrink: 0, marginTop: 6 }}
          >
            <ChevronDown size={15} />
          </motion.div>
        </div>

        {/* Expandable description */}
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="desc"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              style={{ overflow: "hidden" }}
            >
              <p style={{
                margin: "12px 0 0", fontSize: 13.5,
                color: "var(--text-secondary)", lineHeight: 1.6,
                paddingTop: 12,
                borderTop: "1px solid var(--border-color)",
              }}>
                {entry.description}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

export default function Updates() {
  const { updates, loading, unreadCount, markAllRead } = useUpdates();
  const [active, setActive] = useState("all");
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.05 });

  const visible = active === "all" ? updates : updates.filter(e => e.category === active);
  const counts = {
    all: updates.length,
    feature: updates.filter(e => e.category === "feature").length,
    fix: updates.filter(e => e.category === "fix").length,
    improvement: updates.filter(e => e.category === "improvement").length,
  };

  return (
    <div
      ref={ref}
      style={{ width: "100%", flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}
    >
      <style>{`
        #updates,
        #updates > .text-content.wide-content,
        #updates > .text-content.wide-content > .reveal {
          display: flex; flex-direction: column; flex: 1; min-height: 0;
        }
        .up-page-container {
          width: 100%; flex: 1; display: flex;
          flex-direction: column; min-height: 0; box-sizing: border-box;
        }
        .up-card {
          width: 100%; flex: 1; min-height: 0;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 18px; padding: 22px 24px;
          box-sizing: border-box; display: flex; flex-direction: column;
          box-shadow: 0 4px 24px rgba(0,0,0,0.07); overflow: hidden;
        }
        .up-timeline-wrapper {
          position: relative; flex: 1; min-height: 0;
          overflow-y: auto; overflow-x: visible;
          padding-left: 28px; padding-right: 6px; padding-bottom: 24px;
        }
        .up-timeline-wrapper::-webkit-scrollbar { width: 4px; }
        .up-timeline-wrapper::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 4px; }

        .up-shimmer {
          background: linear-gradient(90deg, var(--border-color) 25%,
            color-mix(in srgb, var(--border-color) 50%, transparent) 50%, var(--border-color) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 8px;
        }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

        @media (max-width: 900px) {
          #updates,
          #updates > .text-content.wide-content,
          #updates > .text-content.wide-content > .reveal {
            display: block; flex: none; min-height: unset;
          }
          .up-page-container { flex: none; min-height: unset; }
          .up-card { padding: 18px 14px; border-radius: 14px; flex: none; overflow: visible; }
          .up-timeline-wrapper { overflow: visible; flex: none; }
        }
      `}</style>

      <div className="up-page-container">
        <div className="up-card">

          {/* ── Header ── */}
          <motion.div
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexShrink: 0 }}
            initial={{ opacity: 0, y: -8 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.3 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                background: "color-mix(in srgb, var(--primary-blue) 10%, transparent)",
                border: "1px solid color-mix(in srgb, var(--primary-blue) 20%, transparent)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--primary-blue)",
              }}>
                <Zap size={16} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
                  Portfolio Changelog
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 11.5, color: "var(--text-secondary)" }}>
                  Live updates, fixes &amp; new features
                </p>
              </div>
            </div>
            {unreadCount > 0 && (
              <motion.button
                onClick={markAllRead}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                style={{
                  fontSize: 12, fontWeight: 600, color: "var(--primary-blue)",
                  background: "color-mix(in srgb, var(--primary-blue) 8%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--primary-blue) 20%, transparent)",
                  padding: "5px 12px", borderRadius: 8, cursor: "pointer",
                }}
              >
                ✓ Mark {unreadCount} read
              </motion.button>
            )}
          </motion.div>

          {/* ── Filter pills ── */}
          <motion.div
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexShrink: 0, flexWrap: "wrap", gap: 8 }}
            initial={{ opacity: 0, y: -6 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.3, delay: 0.07 }}
          >
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {filters.map(({ key, label, icon: Icon }) => {
                const isActive = active === key;
                return (
                  <motion.button
                    key={key}
                    onClick={() => setActive(key)}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      padding: "6px 13px", borderRadius: 10,
                      fontSize: 12.5, fontWeight: isActive ? 700 : 600,
                      border: isActive
                        ? "1px solid color-mix(in srgb, var(--primary-blue) 35%, transparent)"
                        : "1px solid var(--border-color)",
                      background: isActive
                        ? "color-mix(in srgb, var(--primary-blue) 12%, transparent)"
                        : "var(--bg-primary)",
                      color: isActive ? "var(--primary-blue)" : "var(--text-secondary)",
                      cursor: "pointer", transition: "all 0.18s",
                    }}
                  >
                    {Icon && <Icon size={13} />}
                    {label}
                    <span style={{
                      fontSize: 10.5, fontWeight: 700,
                      padding: "1px 5px", borderRadius: 999,
                      background: isActive
                        ? "color-mix(in srgb, var(--primary-blue) 18%, transparent)"
                        : "var(--border-color)",
                      color: isActive ? "var(--primary-blue)" : "var(--text-muted)",
                    }}>
                      {counts[key]}
                    </span>
                  </motion.button>
                );
              })}
            </div>
            <span style={{ fontSize: 12.5, color: "var(--text-muted)", fontWeight: 500 }}>
              {visible.length} {visible.length === 1 ? "entry" : "entries"}
            </span>
          </motion.div>

          {/* ── Timeline ── */}
          <div className="up-timeline-wrapper">
            {/* Vertical line */}
            <div style={{
              position: "absolute", left: 14, top: 8, bottom: 24,
              width: 2,
              background: "linear-gradient(180deg, var(--primary-blue) 0%, color-mix(in srgb, var(--primary-blue) 45%, var(--border-color)) 60%, var(--border-color) 100%)",
              boxShadow: "0 0 8px color-mix(in srgb, var(--primary-blue) 20%, transparent)",
              borderRadius: 2,
            }} />

            {loading ? (
              [0, 1, 2].map(i => (
                <div key={i} style={{ position: "relative", marginBottom: 16, width: "100%" }}>
                  <div style={{
                    position: "absolute", left: -13, top: 18, width: 12, height: 12,
                    borderRadius: "50%", background: "var(--border-color)",
                    transform: "translateX(-50%)",
                  }} />
                  <div style={{
                    background: "var(--bg-primary)", border: "1px solid var(--border-color)",
                    borderRadius: 13, padding: "13px 15px",
                    display: "flex", flexDirection: "column", gap: 10,
                  }}>
                    <div className="up-shimmer" style={{ height: 11, width: `${40 - i * 5}%`, opacity: 0.7 }} />
                    <div className="up-shimmer" style={{ height: 15, width: `${75 - i * 8}%`, opacity: 0.6 }} />
                    <div className="up-shimmer" style={{ height: 11, width: "90%", opacity: 0.4 }} />
                  </div>
                </div>
              ))
            ) : (
              <AnimatePresence mode="popLayout">
                {visible.map((entry, i) => (
                  <EntryCard
                    key={entry.id || i}
                    entry={entry}
                    index={i}
                    isNew={i === 0 && active === "all"}
                  />
                ))}
                {visible.length === 0 && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ textAlign: "center", padding: "48px 0", color: "var(--text-muted)", fontSize: 13 }}
                  >
                    No {active} entries yet.
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
