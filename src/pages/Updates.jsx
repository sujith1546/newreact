import { useState, useRef } from "react";
import { Sparkles, Wrench, TrendingUp, Zap, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useUpdates } from "../hooks/useUpdates";

/* ─── Type colour tokens ─── */
const typeStyles = {
  feature: {
    dot: "#10b981",
    glow: "rgba(16,185,129,0.35)",
    badgeBg: "rgba(16,185,129,0.10)",
    badgeColor: "#10b981",
    badgeBorder: "rgba(16,185,129,0.25)",
    icon: Sparkles,
  },
  fix: {
    dot: "#f59e0b",
    glow: "rgba(245,158,11,0.35)",
    badgeBg: "rgba(245,158,11,0.10)",
    badgeColor: "#f59e0b",
    badgeBorder: "rgba(245,158,11,0.25)",
    icon: Wrench,
  },
  improvement: {
    dot: "#3b82f6",
    glow: "rgba(59,130,246,0.35)",
    badgeBg: "rgba(59,130,246,0.10)",
    badgeColor: "#3b82f6",
    badgeBorder: "rgba(59,130,246,0.25)",
    icon: TrendingUp,
  },
};

const filters = [
  { key: "all",         label: "All",          icon: null },
  { key: "feature",     label: "Features",     icon: Sparkles },
  { key: "fix",         label: "Fixes",        icon: Wrench },
  { key: "improvement", label: "Improvements", icon: TrendingUp },
];

function formatDate(dateStr) {
  if (!dateStr) return "Jul 28, 2026";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  } catch { return dateStr; }
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(h / 24);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  if (d < 30) return `${d}d ago`;
  return "";
}

/* ─── Single entry card with expand/collapse ─── */
function EntryCard({ entry, index, isNew }) {
  const [expanded, setExpanded] = useState(isNew);
  const style = typeStyles[entry.category] || typeStyles.improvement;
  const TypeIcon = style.icon;

  return (
    <motion.div
      className="up-entry"
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.35, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Glowing dot on timeline */}
      <motion.span
        className="up-entry-dot"
        style={{ background: style.dot, boxShadow: `0 0 0 3px var(--bg-secondary), 0 0 8px ${style.glow}` }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: index * 0.07 + 0.1, type: "spring", stiffness: 400, damping: 20 }}
      >
        {/* Pulse ring on newest */}
        {isNew && (
          <motion.span
            style={{
              position: "absolute", inset: -5, borderRadius: "50%",
              border: `2px solid ${style.dot}`,
            }}
            animate={{ opacity: [0.8, 0], scale: [1, 1.9] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
          />
        )}
      </motion.span>

      {/* Card */}
      <motion.div
        className="up-entry-card"
        whileHover={{ y: -2, boxShadow: `0 8px 28px rgba(0,0,0,0.10), 0 0 0 1px ${style.badgeBorder}` }}
        transition={{ duration: 0.2 }}
        onClick={() => setExpanded(v => !v)}
        style={{ cursor: "pointer" }}
      >
        {/* Top row */}
        <div className="up-entry-top">
          {/* Category icon box */}
          <div className="up-entry-icon-box" style={{
            background: style.badgeBg,
            border: `1px solid ${style.badgeBorder}`,
            color: style.badgeColor,
          }}>
            <TypeIcon size={14} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="up-entry-meta">
              <span className="up-entry-badge" style={{
                background: style.badgeBg,
                color: style.badgeColor,
                border: `1px solid ${style.badgeBorder}`,
              }}>
                {entry.category || entry.type}
              </span>
              {isNew && (
                <motion.span
                  className="up-entry-new-badge"
                  animate={{ opacity: [1, 0.6, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ✦ new
                </motion.span>
              )}
              <span className="up-entry-date">{formatDate(entry.created_at || entry.date)}</span>
              {timeAgo(entry.created_at) && (
                <span className="up-entry-ago">{timeAgo(entry.created_at)}</span>
              )}
            </div>
            <h3 className="up-entry-title">{entry.title}</h3>
          </div>

          {/* Expand chevron */}
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            style={{ color: "var(--text-muted)", flexShrink: 0 }}
          >
            <ChevronDown size={16} />
          </motion.div>
        </div>

        {/* Expandable description */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="desc"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              style={{ overflow: "hidden" }}
            >
              <p className="up-entry-desc">{entry.description}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

/* ─── Main page ─── */
export default function Updates() {
  const { updates, loading, unreadCount, markAllRead } = useUpdates();
  const [active, setActive] = useState("all");
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.05 });

  const visible =
    active === "all" ? updates : updates.filter(e => e.category === active);

  const counts = {
    all: updates.length,
    feature: updates.filter(e => e.category === "feature").length,
    fix: updates.filter(e => e.category === "fix").length,
    improvement: updates.filter(e => e.category === "improvement").length,
  };

  return (
    <div ref={ref} style={{ width: "100%", flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      <style>{`
        /* ── Height chain ── */
        #updates,
        #updates > .text-content.wide-content,
        #updates > .text-content.wide-content > .reveal {
          display: flex; flex-direction: column; flex: 1; min-height: 0;
        }

        .up-page-container {
          width: 100%; flex: 1; display: flex; flex-direction: column;
          min-height: 0; box-sizing: border-box;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .up-card {
          width: 100%; flex: 1; min-height: 0;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 18px;
          padding: 24px 28px;
          box-sizing: border-box;
          display: flex; flex-direction: column;
          box-shadow: 0 4px 24px rgba(0,0,0,0.07);
          overflow: hidden;
        }

        /* ── Header ── */
        .up-header-row {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 20px; flex-shrink: 0; gap: 12px;
        }
        .up-header-left { display: flex; align-items: center; gap: 10px; }
        .up-header-icon {
          width: 34px; height: 34px; border-radius: 10px;
          background: color-mix(in srgb, var(--primary-blue) 10%, transparent);
          border: 1px solid color-mix(in srgb, var(--primary-blue) 20%, transparent);
          display: flex; align-items: center; justify-content: center;
          color: var(--primary-blue);
        }
        .up-header-title {
          font-size: 16px; font-weight: 800;
          color: var(--text-primary); margin: 0; letter-spacing: -0.01em;
        }
        .up-header-sub {
          font-size: 11.5px; color: var(--text-secondary);
          margin: 2px 0 0;
        }
        .up-mark-read-btn {
          font-size: 12px; font-weight: 600; color: var(--primary-blue);
          background: color-mix(in srgb, var(--primary-blue) 8%, transparent);
          border: 1px solid color-mix(in srgb, var(--primary-blue) 20%, transparent);
          padding: 5px 12px; border-radius: 8px; cursor: pointer;
          transition: all 0.18s;
        }
        .up-mark-read-btn:hover {
          background: color-mix(in srgb, var(--primary-blue) 15%, transparent);
        }

        /* ── Filters ── */
        .up-filters-row {
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 20px; flex-wrap: wrap; flex-shrink: 0;
          justify-content: space-between;
        }
        .up-filter-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 14px; border-radius: 10px;
          font-size: 12.5px; font-weight: 600;
          border: 1px solid var(--border-color);
          background: var(--bg-primary); color: var(--text-secondary);
          cursor: pointer; transition: all 0.18s; position: relative;
        }
        .up-filter-btn .up-filter-count {
          font-size: 10.5px; font-weight: 700;
          background: var(--border-color);
          padding: 1px 5px; border-radius: 999px;
          color: var(--text-muted);
          transition: all 0.18s;
        }
        .up-filter-btn.active {
          background: color-mix(in srgb, var(--primary-blue) 12%, transparent);
          border-color: color-mix(in srgb, var(--primary-blue) 35%, transparent);
          color: var(--primary-blue); font-weight: 700;
        }
        .up-filter-btn.active .up-filter-count {
          background: color-mix(in srgb, var(--primary-blue) 20%, transparent);
          color: var(--primary-blue);
        }
        .up-filter-btn:hover:not(.active) {
          border-color: var(--text-secondary); color: var(--text-primary);
        }
        .up-count-badge {
          font-size: 12.5px; color: var(--text-muted); font-weight: 500;
        }

        /* ── Timeline ── */
        .up-timeline-wrapper {
          position: relative; flex: 1; min-height: 0;
          overflow-y: auto;
          padding-left: 32px; padding-right: 8px; padding-bottom: 28px;
        }
        .up-timeline-wrapper::-webkit-scrollbar { width: 4px; }
        .up-timeline-wrapper::-webkit-scrollbar-thumb {
          background: var(--border-color); border-radius: 4px;
        }

        .up-timeline-line {
          position: absolute; left: 16px; top: 8px; bottom: 28px;
          width: 2px;
          background: linear-gradient(
            to bottom,
            var(--primary-blue),
            var(--border-color) 40%,
            transparent
          );
          opacity: 0.5;
        }

        .up-entry {
          position: relative; margin-bottom: 18px;
        }
        .up-entry:last-child { margin-bottom: 8px; }

        .up-entry-dot {
          position: absolute; left: -16px; top: 14px;
          width: 10px; height: 10px; border-radius: 50%;
          transform: translateX(-50%);
          z-index: 1;
        }

        /* ── Entry Card ── */
        .up-entry-card {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 14px;
          padding: 14px 16px;
          transition: border-color 0.18s, box-shadow 0.18s;
          user-select: none;
        }
        .up-entry-card:hover { border-color: color-mix(in srgb, var(--primary-blue) 25%, transparent); }

        .up-entry-top {
          display: flex; align-items: flex-start; gap: 12px;
        }
        .up-entry-icon-box {
          width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          margin-top: 2px;
        }

        .up-entry-meta {
          display: flex; align-items: center; gap: 7px;
          flex-wrap: wrap; margin-bottom: 5px;
        }
        .up-entry-badge {
          font-size: 10.5px; font-weight: 700; text-transform: capitalize;
          padding: 2px 8px; border-radius: 999px;
        }
        .up-entry-new-badge {
          font-size: 10.5px; font-weight: 700;
          padding: 2px 8px; border-radius: 999px;
          background: rgba(99,102,241,0.12); color: #6366f1;
          border: 1px solid rgba(99,102,241,0.25);
        }
        .up-entry-date {
          font-size: 12px; color: var(--text-muted);
          font-variant-numeric: tabular-nums;
        }
        .up-entry-ago {
          font-size: 11px; color: var(--text-muted);
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          padding: 1px 7px; border-radius: 999px;
        }
        .up-entry-title {
          font-size: 14.5px; font-weight: 700;
          color: var(--text-primary); margin: 0; line-height: 1.4;
        }
        .up-entry-desc {
          font-size: 13.5px; color: var(--text-secondary);
          line-height: 1.6; margin: 12px 0 0;
          padding-top: 12px;
          border-top: 1px solid var(--border-color);
        }

        /* ── Loading skeleton ── */
        .up-skeleton {
          background: linear-gradient(90deg,
            var(--border-color) 25%,
            color-mix(in srgb, var(--border-color) 60%, transparent) 50%,
            var(--border-color) 75%
          );
          background-size: 200% 100%;
          animation: up-shimmer 1.4s infinite;
          border-radius: 8px;
        }
        @keyframes up-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @media (max-width: 900px) {
          #updates,
          #updates > .text-content.wide-content,
          #updates > .text-content.wide-content > .reveal {
            display: block; flex: none; min-height: unset;
          }
          .up-page-container { flex: none; min-height: unset; padding-bottom: 32px; }
          .up-card { padding: 18px 14px; border-radius: 14px; flex: none; height: auto; overflow: visible; }
          .up-timeline-wrapper { overflow: visible; flex: none; }
        }
      `}</style>

      <div className="up-page-container">
        <div className="up-card">

          {/* ── Header ── */}
          <motion.div
            className="up-header-row"
            initial={{ opacity: 0, y: -10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="up-header-left">
              <div className="up-header-icon">
                <Zap size={16} />
              </div>
              <div>
                <p className="up-header-title">Portfolio Changelog</p>
                <p className="up-header-sub">Live updates, fixes &amp; new features</p>
              </div>
            </div>
            {unreadCount > 0 && (
              <motion.button
                className="up-mark-read-btn"
                onClick={markAllRead}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                ✓ Mark {unreadCount} as read
              </motion.button>
            )}
          </motion.div>

          {/* ── Filters ── */}
          <motion.div
            className="up-filters-row"
            initial={{ opacity: 0, y: -8 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.35, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
          >
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {filters.map(({ key, label, icon: Icon }) => {
                const isActive = active === key;
                return (
                  <motion.button
                    key={key}
                    onClick={() => setActive(key)}
                    className={`up-filter-btn${isActive ? " active" : ""}`}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                  >
                    {Icon && <Icon size={13} />}
                    {label}
                    <span className="up-filter-count">{counts[key]}</span>
                  </motion.button>
                );
              })}
            </div>
            <span className="up-count-badge">
              {visible.length} {visible.length === 1 ? "entry" : "entries"}
            </span>
          </motion.div>

          {/* ── Timeline Feed ── */}
          <div className="up-timeline-wrapper">
            <div className="up-timeline-line" />

            {loading ? (
              /* Skeleton loader */
              [0, 1, 2].map(i => (
                <div key={i} className="up-entry" style={{ marginBottom: 18 }}>
                  <span className="up-entry-dot" style={{ background: "var(--border-color)" }} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 10,
                    background: "var(--bg-primary)", border: "1px solid var(--border-color)",
                    borderRadius: 14, padding: "14px 16px" }}>
                    <div className="up-skeleton" style={{ height: 12, width: "30%", opacity: 0.6 - i * 0.1 }} />
                    <div className="up-skeleton" style={{ height: 16, width: "70%", opacity: 0.6 - i * 0.1 }} />
                    <div className="up-skeleton" style={{ height: 12, width: "90%", opacity: 0.6 - i * 0.1 }} />
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
                    style={{
                      textAlign: "center", padding: "48px 0",
                      color: "var(--text-muted)", fontSize: 13,
                    }}
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
