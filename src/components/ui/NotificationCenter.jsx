import React, { useState, useEffect, useRef, useCallback } from "react";

const TABS = [
  { key: "all", label: "All", icon: null },
  { key: "sync", label: "Sync", icon: "ti-bolt" },
  { key: "security", label: "Security", icon: "ti-shield-check" },
  { key: "leads", label: "Leads", icon: "ti-users" },
];

const CATEGORY_STYLE = {
  sync: { icon: "ti-cloud-check", bg: "#E1F5EE", fg: "#0F6E56" },
  security: { icon: "ti-shield-check", bg: "#FAEEDA", fg: "#854F0B" },
  leads: { icon: "ti-mail", bg: "#E6F1FB", fg: "#185FA5" },
};

function timeAgo(ts) {
  const diffMs = Date.now() - ts;
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const days = Math.floor(hr / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

/**
 * @param {{
 *   notifications: Array<{id: string, category: 'sync'|'security'|'leads', title: string, description: string, timestamp: number, read: boolean}>,
 *   onMarkAllRead: () => void,
 *   onMarkOneRead: (id: string) => void,
 *   onViewAll?: () => void,
 * }} props
 */
export default function NotificationCenter({
  notifications,
  onMarkAllRead,
  onMarkOneRead,
  onViewAll,
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("all");
  const panelRef = useRef(null);
  const triggerRef = useRef(null);

  // Close on outside click / Escape — guards against the "stuck open" bug
  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    function handleKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const counts = {
    all: notifications.length,
    sync: notifications.filter((n) => n.category === "sync").length,
    security: notifications.filter((n) => n.category === "security").length,
    leads: notifications.filter((n) => n.category === "leads").length,
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const visible =
    tab === "all" ? notifications : notifications.filter((n) => n.category === tab);

  // newest first, defensively sorted so upstream ordering bugs don't leak in
  const sorted = [...visible].sort((a, b) => b.timestamp - a.timestamp);

  const handleRowClick = useCallback(
    (id) => {
      onMarkOneRead(id);
    },
    [onMarkOneRead]
  );

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        ref={triggerRef}
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        aria-expanded={open}
        style={{
          position: "relative",
          width: 34,
          height: 34,
          borderRadius: "50%",
          background: "var(--surface-1, #f5f5f4)",
          border: "0.5px solid var(--border, #e5e5e0)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <i className="ti ti-bell" style={{ fontSize: 17, color: "var(--text-secondary, #6b6b66)" }} aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: 5,
              right: 6,
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#378ADD",
              border: "1.5px solid var(--surface-1, #f5f5f4)",
            }}
          />
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Operations and sync center"
          style={{
            position: "absolute",
            top: 44,
            right: 0,
            width: 340,
            maxWidth: "90vw",
            background: "var(--surface-2, #fff)",
            border: "0.5px solid var(--border, #e5e5e0)",
            borderRadius: 12,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.08)",
            overflow: "hidden",
            zIndex: 5000,
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 14px",
              borderBottom: "0.5px solid var(--border, #e5e5e0)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <i className="ti ti-topology-star-3" style={{ fontSize: 16, color: "#185FA5" }} aria-hidden="true" />
              <span style={{ fontSize: 14, fontWeight: 500 }}>Operations and sync center</span>
            </div>
            <i
              className="ti ti-x"
              style={{ fontSize: 14, color: "var(--text-muted, #999)", cursor: "pointer" }}
              onClick={() => setOpen(false)}
              aria-label="Close"
              role="button"
            />
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, padding: "8px 10px 0" }}>
            {TABS.map((t) => {
              const active = tab === t.key;
              return (
                <div
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  role="tab"
                  aria-selected={active}
                  style={{
                    cursor: "pointer",
                    fontSize: 12,
                    padding: "5px 10px",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    background: active ? "#E6F1FB" : "transparent",
                    color: active ? "#185FA5" : "var(--text-secondary, #6b6b66)",
                  }}
                >
                  {t.icon && <i className={`ti ${t.icon}`} style={{ fontSize: 13 }} aria-hidden="true" />}
                  {t.label}
                  <span style={{ opacity: 0.7 }}>{counts[t.key]}</span>
                </div>
              );
            })}
          </div>

          {/* List */}
          <div style={{ padding: "8px 6px", maxHeight: 280, overflowY: "auto" }}>
            {sorted.length === 0 ? (
              <div style={{ textAlign: "center", padding: "28px 12px" }}>
                <i className="ti ti-checks" style={{ fontSize: 22, color: "var(--text-muted, #999)" }} aria-hidden="true" />
                <p style={{ fontSize: 13, fontWeight: 500, margin: "8px 0 2px" }}>No notifications</p>
                <p style={{ fontSize: 12, color: "var(--text-muted, #999)", margin: 0 }}>
                  All systems operational
                </p>
              </div>
            ) : (
              sorted.map((n) => {
                const style = CATEGORY_STYLE[n.category] || CATEGORY_STYLE.sync;
                return (
                  <div
                    key={n.id}
                    onClick={() => handleRowClick(n.id)}
                    style={{
                      display: "flex",
                      gap: 10,
                      padding: "9px 8px",
                      borderRadius: 8,
                      cursor: "pointer",
                      opacity: n.read ? 0.6 : 1,
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        background: style.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <i className={`ti ${style.icon}`} style={{ fontSize: 14, color: style.fg }} aria-hidden="true" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <p style={{ fontSize: 13, margin: 0, fontWeight: n.read ? 400 : 500 }}>{n.title}</p>
                        {!n.read && (
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#378ADD", flexShrink: 0 }} />
                        )}
                      </div>
                      <p style={{ fontSize: 12, color: "var(--text-secondary, #6b6b66)", margin: "2px 0 0" }}>
                        {n.description}
                      </p>
                      <p style={{ fontSize: 11, color: "var(--text-muted, #999)", margin: "4px 0 0" }}>
                        {timeAgo(n.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "9px 14px",
              borderTop: "0.5px solid var(--border, #e5e5e0)",
              background: "var(--surface-1, #f5f5f4)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-secondary, #6b6b66)" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#639922" }} />
              Realtime active
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <span
                onClick={onMarkAllRead}
                style={{ fontSize: 11, color: "#185FA5", cursor: "pointer" }}
                role="button"
              >
                Mark all read
              </span>
              {onViewAll && (
                <span
                  onClick={onViewAll}
                  style={{ fontSize: 11, color: "var(--text-secondary, #6b6b66)", cursor: "pointer" }}
                  role="button"
                >
                  View all
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
