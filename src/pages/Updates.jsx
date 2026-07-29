import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Wrench, TrendingUp, Search, X, ChevronDown,
  Clock, Zap, Bell, BellOff, Calendar, BarChart2, Filter
} from "lucide-react";
import { useUpdates } from "../hooks/useUpdates";

/* ─── Type config ─────────────────────────────────────────── */
const typeStyles = {
  feature:     { dot: "#10b981", bg: "rgba(16,185,129,.12)", color: "#10b981", border: "rgba(16,185,129,.25)", icon: Sparkles },
  fix:         { dot: "#f59e0b", bg: "rgba(245,158,11,.12)",  color: "#f59e0b", border: "rgba(245,158,11,.25)", icon: Wrench },
  improvement: { dot: "#3b82f6", bg: "rgba(59,130,246,.12)",  color: "#3b82f6", border: "rgba(59,130,246,.25)", icon: TrendingUp },
};

const filters = [
  { key: "all",         label: "All",          icon: null },
  { key: "feature",     label: "Features",     icon: Sparkles },
  { key: "fix",         label: "Fixes",        icon: Wrench },
  { key: "improvement", label: "Improvements", icon: TrendingUp },
];

/* ─── Helpers ─────────────────────────────────────────────── */
function relativeTime(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 2)   return "just now";
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7)   return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtDate(dateStr) {
  if (!dateStr) return "Jul 28, 2026";
  try { return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
  catch { return dateStr; }
}

/* Stats summary */
function useSummaryStats(updates) {
  return useMemo(() => {
    const byType = { feature: 0, fix: 0, improvement: 0 };
    updates.forEach(u => { if (byType[u.category] !== undefined) byType[u.category]++; });
    const newest = updates[0];
    return { total: updates.length, byType, newest };
  }, [updates]);
}

/* ─── Sub-components ──────────────────────────────────────── */
function StatPill({ label, value, color }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "10px 18px", borderRadius: 12,
      background: `color-mix(in srgb, ${color} 8%, var(--bg-primary))`,
      border: `1px solid color-mix(in srgb, ${color} 22%, transparent)`,
      minWidth: 72, gap: 2,
    }}>
      <span style={{ fontSize: 20, fontWeight: 800, color, lineHeight: 1 }}>{value}</span>
      <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>{label}</span>
    </div>
  );
}

function TimelineEntry({ entry, index, isNew, readIds, markOneRead }) {
  const [expanded, setExpanded] = useState(false);
  const style = typeStyles[entry.category] || typeStyles.improvement;
  const Icon = style.icon;
  const isUnread = !readIds.has(entry.id);

  return (
    <motion.div
      className="up-entry"
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.28, delay: Math.min(index * 0.04, 0.3), ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Dot */}
      <span
        className="up-entry-dot"
        style={{
          background: style.dot,
          boxShadow: isUnread ? `0 0 0 4px color-mix(in srgb, ${style.dot} 18%, transparent), 0 0 0 2px var(--bg-secondary)` : "0 0 0 3px var(--bg-secondary)",
        }}
      />

      {/* Card */}
      <div
        className={`up-entry-card${isUnread ? " unread" : ""}`}
        onClick={() => {
          setExpanded(e => !e);
          if (isUnread) markOneRead(entry.id);
        }}
      >
        {/* Meta row */}
        <div className="up-entry-meta">
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700,
            background: style.bg, color: style.color, border: `1px solid ${style.border}`,
          }}>
            <Icon size={10} />{entry.category}
          </span>

          {isNew && (
            <span style={{
              fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 999,
              background: "rgba(99,102,241,0.14)", color: "#6366f1",
              border: "1px solid rgba(99,102,241,0.3)", textTransform: "uppercase", letterSpacing: "0.04em",
            }}>
              NEW
            </span>
          )}

          {isUnread && !isNew && (
            <span style={{
              width: 7, height: 7, borderRadius: "50%",
              background: style.dot, display: "inline-block", flexShrink: 0,
            }} />
          )}

          <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4, fontSize: 11.5, color: "var(--text-muted)" }}>
            <Clock size={11} />
            {relativeTime(entry.created_at || entry.date)}
          </span>
        </div>

        {/* Title + expand toggle */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <h3 className="up-entry-title" style={{ flex: 1 }}>{entry.title}</h3>
          <ChevronDown
            size={16}
            style={{
              color: "var(--text-muted)", flexShrink: 0, marginTop: 3,
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.22s ease",
            }}
          />
        </div>

        {/* Expandable description */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.p
              className="up-entry-desc"
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 8 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              style={{ overflow: "hidden" }}
            >
              {entry.description}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Footer date */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8 }}>
          <Calendar size={11} style={{ color: "var(--text-muted)" }} />
          <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{fmtDate(entry.created_at || entry.date)}</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Main Component ──────────────────────────────────────── */
export default function Updates() {
  const { updates, loading, markAllRead, unreadCount } = useUpdates();
  const [active, setActive]   = useState("all");
  const [search, setSearch]   = useState("");
  const [readIds, setReadIds] = useState(new Set());
  const [showStats, setShowStats] = useState(true);
  const searchRef = useRef(null);
  const stats = useSummaryStats(updates);

  // Mark individual entry as read
  function markOneRead(id) {
    setReadIds(prev => new Set([...prev, String(id)]));
  }

  function handleMarkAllRead() {
    markAllRead();
    setReadIds(new Set(updates.map(u => String(u.id))));
  }

  // Filtered + searched
  const visible = useMemo(() => {
    let list = active === "all" ? updates : updates.filter(e => e.category === active);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(e =>
        e.title?.toLowerCase().includes(q) || e.description?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [updates, active, search]);

  // Keyboard shortcut: / to focus search
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const effectiveUnread = unreadCount - readIds.size;

  return (
    <div style={{ width: "100%", flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      <style>{`
        #updates,
        #updates > .text-content.wide-content,
        #updates > .text-content.wide-content > .reveal {
          display: flex; flex-direction: column; flex: 1; min-height: 0;
        }
        .up-page-container {
          width: 100%; flex: 1; display: flex; flex-direction: column; min-height: 0;
          box-sizing: border-box;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        .up-card {
          width: 100%; flex: 1; min-height: 0;
          background: var(--bg-secondary); border: 1px solid var(--border-color);
          border-radius: 16px; padding: 20px 24px;
          box-sizing: border-box; display: flex; flex-direction: column;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06); overflow: hidden;
        }

        /* ── Header ── */
        .up-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; flex-shrink: 0; gap: 10px; flex-wrap: wrap; }
        .up-title-row { display: flex; align-items: center; gap: 10px; }
        .up-title { font-size: 18px; font-weight: 800; color: var(--text-primary); margin: 0; }
        .up-unread-badge {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 2px 9px; border-radius: 999px; font-size: 11px; font-weight: 700;
          background: rgba(99,102,241,0.14); color: #6366f1;
          border: 1px solid rgba(99,102,241,0.28);
        }
        .up-header-actions { display: flex; align-items: center; gap: 8px; }
        .up-icon-btn {
          width: 32px; height: 32px; border-radius: 8px;
          border: 1px solid var(--border-color); background: var(--bg-primary);
          color: var(--text-secondary); cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.16s;
        }
        .up-icon-btn:hover { border-color: var(--primary-blue); color: var(--primary-blue); }
        .up-mark-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 5px 12px; border-radius: 8px;
          border: 1px solid var(--border-color); background: var(--bg-primary);
          font-size: 12px; font-weight: 600; color: var(--text-secondary); cursor: pointer;
          transition: all 0.16s; white-space: nowrap;
        }
        .up-mark-btn:hover { border-color: var(--primary-blue); color: var(--primary-blue); }

        /* ── Stats pills ── */
        .up-stats-row { display: flex; gap: 8px; margin-bottom: 14px; flex-shrink: 0; flex-wrap: wrap; }

        /* ── Search ── */
        .up-search-wrapper {
          position: relative; margin-bottom: 14px; flex-shrink: 0;
        }
        .up-search-input {
          width: 100%; box-sizing: border-box;
          padding: 9px 36px 9px 36px; border-radius: 10px;
          border: 1px solid var(--border-color); background: var(--bg-primary);
          font-size: 13px; color: var(--text-primary); outline: none;
          transition: border-color 0.18s;
        }
        .up-search-input:focus { border-color: var(--primary-blue); }
        .up-search-input::placeholder { color: var(--text-muted); }
        .up-search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; }
        .up-search-clear { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 2px; display: flex; align-items: center; }
        .up-search-kbd {
          position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
          font-size: 10px; color: var(--text-muted);
          border: 1px solid var(--border-color); border-radius: 4px; padding: 1px 5px;
          background: var(--bg-secondary);
        }

        /* ── Filters ── */
        .up-filters-row { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; flex-shrink: 0; }
        .up-filter-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 14px; border-radius: 10px; font-size: 12.5px; font-weight: 600;
          border: 1px solid var(--border-color); background: var(--bg-primary);
          color: var(--text-secondary); cursor: pointer; transition: all 0.18s;
        }
        .up-filter-btn.active {
          background: color-mix(in srgb, var(--primary-blue) 12%, transparent);
          border-color: color-mix(in srgb, var(--primary-blue) 35%, transparent);
          color: var(--primary-blue); font-weight: 700;
        }
        .up-filter-btn:hover:not(.active) { border-color: var(--text-secondary); color: var(--text-primary); }
        .up-count-badge { font-size: 12.5px; color: var(--text-muted); font-weight: 500; margin-left: auto; }

        /* ── Timeline ── */
        .up-timeline-wrapper {
          position: relative; flex: 1; min-height: 0; overflow-y: auto;
          padding-left: 32px; padding-right: 10px; padding-bottom: 24px;
        }
        .up-timeline-wrapper::-webkit-scrollbar { width: 4px; }
        .up-timeline-wrapper::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 4px; }
        .up-timeline-line {
          position: absolute; left: 16px; top: 8px; bottom: 24px;
          width: 2px; background: var(--border-color);
        }
        .up-entry { position: relative; margin-bottom: 12px; }
        .up-entry:last-child { margin-bottom: 0; }
        .up-entry-dot {
          position: absolute; left: -16px; top: 18px;
          width: 10px; height: 10px; border-radius: 50%;
          transform: translateX(-50%); z-index: 1;
          transition: box-shadow 0.2s;
        }
        .up-entry-card {
          background: var(--bg-primary); border: 1px solid var(--border-color);
          border-radius: 12px; padding: 12px 14px; cursor: pointer;
          transition: all 0.18s; position: relative;
        }
        .up-entry-card:hover { border-color: var(--primary-blue); box-shadow: 0 4px 16px rgba(0,0,0,0.08); transform: translateX(2px); }
        .up-entry-card.unread { border-left: 3px solid var(--primary-blue); }
        .up-entry-meta { display: flex; align-items: center; gap: 7px; margin-bottom: 7px; flex-wrap: wrap; }
        .up-entry-title { font-size: 14.5px; font-weight: 700; color: var(--text-primary); margin: 0; line-height: 1.35; }
        .up-entry-desc { font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin: 0; }

        /* ── Empty state ── */
        .up-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; gap: 10px; color: var(--text-muted); padding: 40px; text-align: center; }
        .up-empty-icon { font-size: 32px; opacity: 0.4; }

        /* ── Loading skeleton ── */
        .up-skeleton { border-radius: 10px; background: var(--border-color); animation: up-shimmer 1.5s ease-in-out infinite; }
        @keyframes up-shimmer { 0%,100% { opacity: 0.4; } 50% { opacity: 0.9; } }

        @media (max-width: 900px) {
          #updates, #updates > .text-content.wide-content, #updates > .text-content.wide-content > .reveal { display: block; flex: none; min-height: unset; }
          .up-page-container { flex: none; min-height: unset; padding-bottom: 32px; }
          .up-card { padding: 16px 14px; border-radius: 12px; flex: none; height: auto; overflow: visible; }
          .up-timeline-wrapper { overflow: visible; flex: none; }
          .up-stats-row { display: none; }
        }
      `}</style>

      <div className="up-page-container">
        <div className="up-card">

          {/* ── Header ── */}
          <div className="up-header">
            <div className="up-title-row">
              <h1 className="up-title">Changelog</h1>
              {effectiveUnread > 0 && (
                <span className="up-unread-badge">
                  <Zap size={10} /> {effectiveUnread} new
                </span>
              )}
            </div>
            <div className="up-header-actions">
              {effectiveUnread > 0 && (
                <button className="up-mark-btn" onClick={handleMarkAllRead}>
                  <BellOff size={13} /> Mark all read
                </button>
              )}
              <button
                className="up-icon-btn"
                title="Toggle stats"
                onClick={() => setShowStats(s => !s)}
              >
                <BarChart2 size={14} />
              </button>
            </div>
          </div>

          {/* ── Stats pills ── */}
          <AnimatePresence>
            {showStats && !loading && (
              <motion.div
                className="up-stats-row"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22 }}
                style={{ overflow: "hidden" }}
              >
                <StatPill label="Total" value={stats.total} color="var(--primary-blue)" />
                <StatPill label="Features" value={stats.byType.feature} color="#10b981" />
                <StatPill label="Fixes" value={stats.byType.fix} color="#f59e0b" />
                <StatPill label="Improvements" value={stats.byType.improvement} color="#3b82f6" />
                {stats.newest && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 6, marginLeft: "auto",
                    fontSize: 12, color: "var(--text-muted)", flexShrink: 0,
                  }}>
                    <Clock size={12} />
                    Last update {relativeTime(stats.newest.created_at || stats.newest.date)}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Search ── */}
          <div className="up-search-wrapper">
            <Search size={14} className="up-search-icon" />
            <input
              ref={searchRef}
              className="up-search-input"
              placeholder="Search updates…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search ? (
              <button className="up-search-clear" onClick={() => setSearch("")}>
                <X size={13} />
              </button>
            ) : (
              <span className="up-search-kbd">/</span>
            )}
          </div>

          {/* ── Filter tabs ── */}
          <div className="up-filters-row">
            <Filter size={13} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
            {filters.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActive(key)}
                className={`up-filter-btn${active === key ? " active" : ""}`}
              >
                {Icon && <Icon size={13} />}
                {label}
                {key !== "all" && (
                  <span style={{
                    fontSize: 10, fontWeight: 700,
                    background: active === key ? "transparent" : "var(--border-color)",
                    borderRadius: 999, padding: "1px 5px",
                    color: active === key ? "inherit" : "var(--text-muted)",
                  }}>
                    {(key === "all" ? updates : updates.filter(u => u.category === key)).length}
                  </span>
                )}
              </button>
            ))}
            <span className="up-count-badge">
              {visible.length} {visible.length === 1 ? "entry" : "entries"}
              {search && ` for "${search}"`}
            </span>
          </div>

          {/* ── Timeline feed ── */}
          <div className="up-timeline-wrapper">
            <div className="up-timeline-line" />

            {loading ? (
              // Loading skeleton
              <div style={{ paddingTop: 4 }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ marginBottom: 14 }}>
                    <div className="up-skeleton" style={{ height: 90, borderRadius: 12, marginBottom: 2 }} />
                  </div>
                ))}
              </div>
            ) : visible.length === 0 ? (
              <div className="up-empty">
                <div className="up-empty-icon">🔍</div>
                <p style={{ margin: 0, fontWeight: 600, color: "var(--text-secondary)" }}>No updates found</p>
                <p style={{ margin: 0, fontSize: 13 }}>
                  {search ? `No results for "${search}"` : "Nothing here yet"}
                </p>
                {search && (
                  <button className="up-filter-btn" style={{ marginTop: 8 }} onClick={() => setSearch("")}>
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {visible.map((entry, i) => (
                  <TimelineEntry
                    key={entry.id || i}
                    entry={entry}
                    index={i}
                    isNew={i === 0 && active === "all" && !search}
                    readIds={readIds}
                    markOneRead={markOneRead}
                  />
                ))}
              </AnimatePresence>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
