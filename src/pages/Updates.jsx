import { useState } from "react";
import { Sparkles, Wrench, TrendingUp } from "lucide-react";
import { useUpdates } from "../hooks/useUpdates";

const typeStyles = {
  feature: {
    dot: "#10b981",
    badgeBg: "rgba(16, 185, 129, 0.12)",
    badgeColor: "#10b981",
    badgeBorder: "rgba(16, 185, 129, 0.25)",
  },
  fix: {
    dot: "#f59e0b",
    badgeBg: "rgba(245, 158, 11, 0.12)",
    badgeColor: "#f59e0b",
    badgeBorder: "rgba(245, 158, 11, 0.25)",
  },
  improvement: {
    dot: "#3b82f6",
    badgeBg: "rgba(59, 130, 246, 0.12)",
    badgeColor: "#3b82f6",
    badgeBorder: "rgba(59, 130, 246, 0.25)",
  },
};

const filters = [
  { key: "all", label: "All", icon: null },
  { key: "feature", label: "Features", icon: Sparkles },
  { key: "fix", label: "Fixes", icon: Wrench },
  { key: "improvement", label: "Improvements", icon: TrendingUp },
];

function formatDate(dateStr) {
  if (!dateStr) return "Jul 28, 2026";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function Updates() {
  const { updates, loading } = useUpdates();
  const [active, setActive] = useState("all");

  const visible =
    active === "all"
      ? updates
      : updates.filter((e) => e.category === active);

  return (
    <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <style>{`
        /* ── Height propagation chain for desktop fit ── */
        #updates,
        #updates > .text-content.wide-content,
        #updates > .text-content.wide-content > .reveal {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 0;
        }

        .up-page-container {
          width: 100%;
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
          box-sizing: border-box;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .up-card {
          width: 100%;
          flex: 1;
          min-height: 0;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 24px 28px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          overflow: hidden;
        }

        .up-filters-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 24px;
          flex-wrap: wrap;
          flex-shrink: 0;
        }
        .up-filter-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          border: 1px solid var(--border-color);
          background: var(--bg-primary);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.18s;
        }
        .up-filter-btn.active {
          background: color-mix(in srgb, var(--primary-blue) 12%, transparent);
          border-color: color-mix(in srgb, var(--primary-blue) 35%, transparent);
          color: var(--primary-blue);
          font-weight: 700;
        }
        .up-filter-btn:hover:not(.active) {
          border-color: var(--text-secondary);
          color: var(--text-primary);
        }

        .up-count-badge {
          font-size: 13px;
          color: var(--text-muted);
          font-weight: 500;
        }

        .up-timeline-wrapper {
          position: relative;
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          padding-left: 32px;
          padding-right: 14px;
          padding-bottom: 28px;
        }
        .up-timeline-wrapper::-webkit-scrollbar { width: 4px; }
        .up-timeline-wrapper::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 4px; }

        .up-timeline-line {
          position: absolute;
          left: 16px;
          top: 8px;
          bottom: 28px;
          width: 2px;
          background: var(--border-color);
        }

        .up-entry {
          position: relative;
          margin-bottom: 28px;
        }
        .up-entry:last-child {
          margin-bottom: 12px;
        }

        .up-entry-dot {
          position: absolute;
          left: -16px;
          top: 6px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          transform: translateX(-50%);
          box-shadow: 0 0 0 3px var(--bg-secondary);
        }

        .up-entry-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
          flex-wrap: wrap;
        }
        .up-entry-date {
          font-size: 13px;
          color: var(--text-muted);
          font-variant-numeric: tabular-nums;
        }
        .up-entry-badge {
          font-size: 11px;
          font-weight: 700;
          text-transform: lowercase;
          padding: 2px 8px;
          border-radius: 999px;
        }
        .up-entry-new-badge {
          font-size: 11px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 999px;
          background: rgba(99, 102, 241, 0.12);
          color: #6366f1;
          border: 1px solid rgba(99, 102, 241, 0.25);
        }

        .up-entry-title {
          font-size: 16.5px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 4px;
          line-height: 1.3;
        }
        .up-entry-desc {
          font-size: 14.5px;
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0;
          max-width: 100%;
        }

        @media (max-width: 900px) {
          #updates,
          #updates > .text-content.wide-content,
          #updates > .text-content.wide-content > .reveal {
            display: block; flex: none; min-height: unset;
          }
          .up-page-container { flex: none; min-height: unset; padding-bottom: 32px; }
          .up-card { padding: 20px 16px; border-radius: 12px; flex: none; height: auto; overflow: visible; }
          .up-timeline-wrapper { overflow: visible; flex: none; }
        }
      `}</style>

      <div className="up-page-container">
        <div className="up-card">
          {/* Filters & Count Row */}
          <div className="up-filters-row" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {filters.map(({ key, label, icon: Icon }) => {
                const isActive = active === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActive(key)}
                    className={`up-filter-btn${isActive ? " active" : ""}`}
                  >
                    {Icon && <Icon size={14} />}
                    {label}
                  </button>
                );
              })}
            </div>

            <span className="up-count-badge">
              {visible.length} {visible.length === 1 ? "entry" : "entries"}
            </span>
          </div>

          {/* Timeline Feed */}
          <div className="up-timeline-wrapper">
            <div className="up-timeline-line" />
            <div>
              {visible.map((entry, i) => {
                const style = typeStyles[entry.category] || typeStyles.improvement;
                const isNew = i === 0;
                return (
                  <div key={entry.id || i} className="up-entry">
                    <span
                      className="up-entry-dot"
                      style={{ background: style.dot }}
                    />
                    <div className="up-entry-meta">
                      <span className="up-entry-date">
                        {formatDate(entry.created_at || entry.date)}
                      </span>
                      <span
                        className="up-entry-badge"
                        style={{
                          background: style.badgeBg,
                          color: style.badgeColor,
                          border: `1px solid ${style.badgeBorder}`,
                        }}
                      >
                        {entry.category || entry.type}
                      </span>
                      {isNew && (
                        <span className="up-entry-new-badge">
                          new
                        </span>
                      )}
                    </div>
                    <h3 className="up-entry-title">{entry.title}</h3>
                    <p className="up-entry-desc">{entry.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
