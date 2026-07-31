import { useState, useRef } from "react";
import { Sparkles, Wrench, TrendingUp, ChevronDown } from "lucide-react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useUpdates } from "../hooks/useUpdates";

const typeStyles = {
  feature:     { bg: "rgba(16,185,129,0.12)", color: "#10b981", border: "rgba(16,185,129,0.25)", label: "Feature" },
  fix:         { bg: "rgba(245,158,11,0.12)", color: "#f59e0b", border: "rgba(245,158,11,0.25)", label: "Fix" },
  improvement: { bg: "rgba(59,130,246,0.12)", color: "#3b82f6", border: "rgba(59,130,246,0.25)", label: "Improvement" },
};

const filters = [
  { key: "all",         label: "All",          icon: null        },
  { key: "feature",     label: "Features",     icon: Sparkles    },
  { key: "fix",         label: "Fixes",        icon: Wrench      },
  { key: "improvement", label: "Improvements", icon: TrendingUp  },
];

const REACTION_CONFIG = [
  { key: "rocket", emoji: "🚀" },
  { key: "party",  emoji: "🎉" },
  { key: "heart",  emoji: "❤️" },
  { key: "thumbs", emoji: "👍" },
];

function formatDate(d) {
  if (!d) return "";
  try { return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
  catch { return d; }
}

function EntryCard({ entry, index, onReaction }) {
  // First 2 entries start open as full cards; index >= 2 starts collapsed
  const [open, setOpen] = useState(index < 2);
  const ts = typeStyles[entry.category] || typeStyles.improvement;
  const isMostRecent = index === 0;

  const rxCounts = entry.reactions || { rocket: 0, party: 0, heart: 0, thumbs: 0 };
  
  // Calculate reactions to display (only show if count > 0 or user reacted)
  const activeReactions = REACTION_CONFIG.filter(rx => {
    const count = rxCounts[rx.key] || 0;
    const hasReacted = localStorage.getItem(`reacted_up_${entry.id}_${rx.key}`) === 'true';
    return count > 0 || hasReacted;
  });

  return (
    <motion.div
      style={{ position: "relative", marginBottom: index < 2 ? 16 : 10, width: "100%" }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
    >
      {/* Timeline dot */}
      <div
        style={{
          position: "absolute",
          left: -13,
          top: open && index < 2 ? 20 : 14,
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: isMostRecent ? "var(--text-primary)" : "var(--bg-primary)",
          border: isMostRecent ? "none" : "2px solid var(--border-color)",
          boxShadow: "0 0 0 3px var(--bg-secondary)",
          zIndex: 2,
          transform: "translateX(-50%)",
        }}
      />

      {/* Card container */}
      <div
        onClick={() => setOpen(v => !v)}
        style={{
          background: "var(--bg-primary)",
          border: "0.5px solid var(--border-color)",
          borderRadius: 12,
          padding: open && index < 2 ? "14px 16px" : "10px 14px",
          cursor: "pointer",
          userSelect: "none",
          width: "100%",
          boxSizing: "border-box",
          boxShadow: "none",
          transition: "border-color 0.15s",
        }}
      >
        {/* Dense Single-Line Collapsed View vs Expanded Card Header */}
        {!open ? (
          /* Single-line dense row for collapsed entries */
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            {entry.version && (
              <span style={{
                fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 6,
                border: "1px solid var(--border-color)", background: "transparent",
                color: "var(--text-secondary)", fontFamily: "'Fira Code', monospace", flexShrink: 0
              }}>
                {entry.version}
              </span>
            )}
            <span style={{
              fontSize: 10.5, fontWeight: 600, padding: "2px 8px", borderRadius: 999,
              background: ts.bg, color: ts.color, border: `1px solid ${ts.border}`, flexShrink: 0
            }}>
              {ts.label}
            </span>
            <p style={{
              margin: 0, fontSize: 14, fontWeight: 500, color: "var(--text-primary)",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1, minWidth: 0
            }}>
              {entry.title}
            </p>
            <span style={{ fontSize: 11.5, color: "var(--text-muted)", flexShrink: 0 }}>
              {formatDate(entry.created_at || entry.date)}
            </span>
            <ChevronDown size={15} color="var(--text-muted)" style={{ flexShrink: 0 }} />
          </div>
        ) : (
          /* Full expanded card layout */
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyBetween: "space-between", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", flex: 1, minWidth: 0 }}>
                {entry.version && (
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 6,
                    border: "1px solid var(--border-color)", background: "transparent",
                    color: "var(--text-secondary)", fontFamily: "'Fira Code', monospace"
                  }}>
                    {entry.version}
                  </span>
                )}
                <span style={{
                  fontSize: 10.5, fontWeight: 600, padding: "2px 8px", borderRadius: 999,
                  background: ts.bg, color: ts.color, border: `1px solid ${ts.border}`
                }}>
                  {ts.label}
                </span>
                <span style={{ fontSize: 11.5, color: "var(--text-muted)", marginLeft: "auto" }}>
                  {formatDate(entry.created_at || entry.date)}
                </span>
                <ChevronDown size={15} color="var(--text-muted)" style={{ transform: "rotate(180deg)", transition: "transform 0.2s" }} />
              </div>
            </div>

            {/* Title */}
            <h4 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 500, color: "var(--text-primary)", lineHeight: 1.4 }}>
              {entry.title}
            </h4>

            {/* Description (max 1-2 lines) */}
            {entry.description && (
              <p style={{
                margin: 0, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5,
                display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden"
              }}>
                {entry.description}
              </p>
            )}

            {/* Change items bullet list if available */}
            {Array.isArray(entry.items) && entry.items.length > 0 && (
              <ul style={{ margin: "8px 0 0", paddingLeft: 16, fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                {entry.items.map((item, i) => (
                  <li key={i} style={{ marginBottom: 2 }}>{item}</li>
                ))}
              </ul>
            )}

            {/* Compact Reactions Pill Row */}
            <div 
              style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12, paddingTop: 10, borderTop: "0.5px solid var(--border-color)", flexWrap: "wrap" }}
              onClick={e => e.stopPropagation()}
            >
              {REACTION_CONFIG.map(rx => {
                const count = rxCounts[rx.key] || 0;
                const hasReacted = localStorage.getItem(`reacted_up_${entry.id}_${rx.key}`) === 'true';
                
                // Show pill if count > 0 or user reacted or card has 0 reactions total (show default compact pills)
                const showPill = count > 0 || hasReacted || activeReactions.length === 0;
                if (!showPill) return null;

                return (
                  <button
                    key={rx.key}
                    type="button"
                    onClick={() => onReaction(entry.id, rx.key)}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      padding: "3px 8px", borderRadius: 20, fontSize: 12,
                      background: hasReacted ? "var(--primary-blue-dim, rgba(99,102,241,0.12))" : "var(--bg-secondary)",
                      border: `0.5px solid ${hasReacted ? "var(--primary-blue)" : "var(--border-color)"}`,
                      color: hasReacted ? "var(--primary-blue)" : "var(--text-secondary)",
                      cursor: "pointer", transition: "all 0.15s ease", fontWeight: 500
                    }}
                  >
                    <span style={{ fontSize: 13, lineHeight: 1 }}>{rx.emoji}</span>
                    <span style={{ fontSize: 11, fontWeight: 600 }}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function Updates() {
  const { updates, loading, toggleReaction } = useUpdates();
  const [active, setActive] = useState("all");
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.05 });

  const filtered = active === "all" ? updates : updates.filter(e => e.category === active);

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
        @media (min-width: 901px) {
          #updates.text-content.wide-content {
            display: flex !important;
            flex-direction: column !important;
            flex: 1 !important;
            min-height: 0 !important;
            height: calc(100vh - 120px) !important;
            max-height: calc(100vh - 120px) !important;
            overflow: hidden !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .up-page-container {
            width: 100% !important;
            height: 100% !important;
            flex: 1 !important;
            display: flex !important;
            flex-direction: column !important;
            min-height: 0 !important;
            overflow: hidden !important;
            box-sizing: border-box;
          }
          .up-card {
            width: 100% !important;
            height: 100% !important;
            flex: 1 !important;
            display: flex !important;
            flex-direction: column !important;
            min-height: 0 !important;
            background: var(--bg-secondary);
            border: 0.5px solid var(--border-color);
            border-radius: 16px;
            padding: 20px 22px;
            box-sizing: border-box;
            overflow: hidden !important;
            box-shadow: none;
          }
          .up-timeline-wrapper {
            position: relative;
            flex: 1 !important;
            min-height: 0 !important;
            max-height: 100% !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
            padding-left: 24px;
            padding-right: 8px;
            padding-bottom: 20px;
            scroll-behavior: smooth;
          }
        }

        .up-timeline-wrapper::-webkit-scrollbar { width: 4px; }
        .up-timeline-wrapper::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 4px; }

        @media (max-width: 900px) {
          #updates.text-content.wide-content {
            display: block !important; flex: none !important; min-height: unset !important; overflow: visible !important; height: auto !important;
          }
          .up-page-container { flex: none !important; min-height: unset !important; overflow: visible !important; height: auto !important; }
          .up-card { padding: 16px 14px; border-radius: 14px; flex: none !important; overflow: visible !important; height: auto !important; }
          .up-timeline-wrapper { overflow: visible !important; flex: none !important; }
        }
      `}</style>

      <div className="up-page-container">
        <div className="up-card">

          {/* ── 1. Header row ── */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexShrink: 0, flexWrap: "wrap", gap: 12 }}>
            {/* Title + Subtitle left-aligned */}
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em", fontFamily: "'Space Grotesk', sans-serif" }}>
                Portfolio release changelog
              </h2>
              <p style={{ margin: "2px 0 0", fontSize: 11.5, color: "var(--text-muted)" }}>
                Latest releases, improvements, and system patches
              </p>
            </div>

            {/* Filter tabs on the right */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {filters.map(({ key, label, icon: Icon }) => {
                const isActive = active === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActive(key)}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      padding: "6px 12px", borderRadius: 8,
                      fontSize: 12, fontWeight: isActive ? 600 : 400,
                      border: isActive ? "none" : "1px solid var(--border-color)",
                      background: isActive ? "var(--text-primary)" : "transparent",
                      color: isActive ? "var(--bg-primary)" : "var(--text-secondary)",
                      cursor: "pointer", transition: "all 0.15s ease",
                    }}
                  >
                    {Icon && <Icon size={13} style={{ opacity: isActive ? 1 : 0.7 }} />}
                    <span>{label}</span>
                    <span style={{ fontSize: 11, opacity: 0.65, marginLeft: 2 }}>
                      {counts[key]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── 2. Timeline rail + Cards ── */}
          <div className="up-timeline-wrapper">
            {/* 1px rail line */}
            <div style={{
              position: "absolute", left: 14, top: 8, bottom: 20,
              width: 1,
              background: "var(--border-color)",
              borderRadius: 1,
            }} />

            {loading ? (
              [0, 1].map(i => (
                <div key={i} style={{ position: "relative", marginBottom: 14, width: "100%" }}>
                  <div style={{ background: "var(--bg-primary)", border: "0.5px solid var(--border-color)", borderRadius: 12, padding: 14 }}>
                    <div style={{ height: 12, width: "35%", background: "var(--border-color)", borderRadius: 4, marginBottom: 8 }} />
                    <div style={{ height: 15, width: "75%", background: "var(--border-color)", borderRadius: 4 }} />
                  </div>
                </div>
              ))
            ) : (
              <AnimatePresence mode="popLayout">
                {filtered.map((entry, i) => (
                  <EntryCard
                    key={entry.id || i}
                    entry={entry}
                    index={i}
                    onReaction={toggleReaction}
                  />
                ))}
                {filtered.length === 0 && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)", fontSize: 13 }}
                  >
                    No matching release entries.
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
