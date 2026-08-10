import React, { useState, useEffect, useRef, useCallback } from "react";
import { Bell, X, Cloud, ShieldCheck, Mail, CheckCircle2, Zap } from "lucide-react";

const TABS = [
  { key: "all", label: "All", icon: null },
  { key: "sync", label: "Sync", icon: Zap },
  { key: "security", label: "Security", icon: ShieldCheck },
  { key: "leads", label: "Leads", icon: Mail },
];

const CATEGORY_STYLE = {
  sync: { icon: Zap, bg: "rgba(59, 130, 246, 0.12)", fg: "#2563eb" },
  security: { icon: ShieldCheck, bg: "rgba(245, 158, 11, 0.14)", fg: "#b45309" },
  leads: { icon: Mail, bg: "rgba(16, 185, 129, 0.12)", fg: "#059669" },
};

function timeAgo(ts) {
  if (!ts) return "Just now";
  const diffMs = Date.now() - (typeof ts === "number" ? ts : new Date(ts).getTime());
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
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
  notifications = [],
  onMarkAllRead,
  onMarkOneRead,
  onViewAll,
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("all");
  const panelRef = useRef(null);
  const triggerRef = useRef(null);

  // Close on outside click / Escape
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

  const sorted = [...visible].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  const handleRowClick = useCallback(
    (id) => {
      if (onMarkOneRead) onMarkOneRead(id);
    },
    [onMarkOneRead]
  );

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {/* Bell Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        aria-expanded={open}
        className="notif-bell-btn"
        style={{
          position: "relative",
          width: 34,
          height: 34,
          borderRadius: "50%",
          background: "var(--bg-secondary, #ffffff)",
          border: "1px solid var(--border-color, #e2e8f0)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "var(--text-primary, #0f172a)",
          transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
        }}
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: 5,
              right: 6,
              width: 7,
              height: 7,
              borderRadius: "50%",
              backgroundColor: "#ef4444",
              border: "1.5px solid var(--bg-secondary, #ffffff)",
            }}
          />
        )}
      </button>

      {/* Notification Dropdown Panel */}
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
            maxWidth: "92vw",
            backgroundColor: "var(--bg-secondary, #ffffff)",
            border: "1px solid var(--border-color, #e2e8f0)",
            borderRadius: 14,
            boxShadow: "0 16px 36px -8px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.06)",
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
              borderBottom: "1px solid var(--border-color, #f1f5f9)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  backgroundColor: "rgba(59, 130, 246, 0.12)",
                  color: "#2563eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Zap size={13} />
              </div>
              <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary, #0f172a)" }}>
                Operations and sync center
              </span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
                color: "var(--text-muted, #94a3b8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, padding: "8px 10px 4px", borderBottom: "1px solid var(--border-color, #f1f5f9)" }}>
            {TABS.map((t) => {
              const active = tab === t.key;
              const TabIcon = t.icon;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  role="tab"
                  aria-selected={active}
                  style={{
                    cursor: "pointer",
                    fontSize: 12,
                    padding: "5px 9px",
                    borderRadius: 8,
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    fontWeight: active ? 600 : 500,
                    backgroundColor: active ? "rgba(59, 130, 246, 0.12)" : "transparent",
                    color: active ? "#2563eb" : "var(--text-secondary, #64748b)",
                    transition: "all 0.15s ease",
                  }}
                >
                  {TabIcon && <TabIcon size={12} />}
                  <span>{t.label}</span>
                  <span style={{ opacity: 0.7, fontSize: 11 }}>{counts[t.key]}</span>
                </button>
              );
            })}
          </div>

          {/* List */}
          <div style={{ padding: "6px 8px", maxHeight: 270, overflowY: "auto" }}>
            {sorted.length === 0 ? (
              <div style={{ textAlign: "center", padding: "28px 12px" }}>
                <CheckCircle2 size={22} style={{ color: "var(--text-muted, #94a3b8)", margin: "0 auto" }} />
                <p style={{ fontSize: 13, fontWeight: 600, margin: "8px 0 2px", color: "var(--text-primary, #0f172a)" }}>
                  No notifications
                </p>
                <p style={{ fontSize: 12, color: "var(--text-muted, #94a3b8)", margin: 0 }}>
                  All systems operational
                </p>
              </div>
            ) : (
              sorted.map((n) => {
                const style = CATEGORY_STYLE[n.category] || CATEGORY_STYLE.sync;
                const IconComponent = style.icon;
                return (
                  <div
                    key={n.id}
                    onClick={() => handleRowClick(n.id)}
                    style={{
                      display: "flex",
                      gap: 10,
                      padding: "8px 8px",
                      borderRadius: 8,
                      cursor: "pointer",
                      opacity: n.read ? 0.6 : 1,
                      backgroundColor: n.read ? "transparent" : "rgba(128, 128, 128, 0.04)",
                      marginBottom: 3,
                    }}
                  >
                    <div
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 7,
                        backgroundColor: style.bg,
                        color: style.fg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    >
                      <IconComponent size={13} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <p style={{ fontSize: 12.5, margin: 0, fontWeight: n.read ? 450 : 600, color: "var(--text-primary, #0f172a)" }}>
                          {n.title}
                        </p>
                        {!n.read && (
                          <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#3b82f6", flexShrink: 0 }} />
                        )}
                      </div>
                      <p style={{ fontSize: 11.5, color: "var(--text-secondary, #64748b)", margin: "2px 0 0", lineHeight: 1.35 }}>
                        {n.description}
                      </p>
                      <p style={{ fontSize: 10.5, color: "var(--text-muted, #94a3b8)", margin: "3px 0 0" }}>
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
              padding: "8px 14px",
              borderTop: "1px solid var(--border-color, #f1f5f9)",
              backgroundColor: "rgba(128, 128, 128, 0.04)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-secondary, #64748b)" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#10b981" }} />
              Realtime active
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <span
                onClick={onMarkAllRead}
                style={{ fontSize: 11, color: "#2563eb", cursor: "pointer", fontWeight: 500 }}
                role="button"
              >
                Mark all read
              </span>
              {onViewAll && (
                <span
                  onClick={onViewAll}
                  style={{ fontSize: 11, color: "var(--text-secondary, #64748b)", cursor: "pointer" }}
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
