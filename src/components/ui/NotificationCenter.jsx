import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Bell,
  X,
  ShieldCheck,
  Mail,
  CheckCircle2,
  Zap,
  RefreshCw,
  Download,
  Trash2,
  Check,
  Wifi,
  WifiOff,
  Activity
} from "lucide-react";
import { useOperationsSyncCenter } from "../../core/hooks/useOperationsSyncCenter";

const TABS = [
  { key: "all", label: "All", icon: null },
  { key: "sync", label: "Sync", icon: Zap },
  { key: "security", label: "Security", icon: ShieldCheck },
  { key: "leads", label: "Leads", icon: Mail },
];

const CATEGORY_STYLE = {
  sync: { icon: Zap, bg: "rgba(59, 130, 246, 0.14)", fg: "#3b82f6", border: "rgba(59, 130, 246, 0.25)" },
  security: { icon: ShieldCheck, bg: "rgba(245, 158, 11, 0.15)", fg: "#f59e0b", border: "rgba(245, 158, 11, 0.25)" },
  leads: { icon: Mail, bg: "rgba(16, 185, 129, 0.14)", fg: "#10b981", border: "rgba(16, 185, 129, 0.25)" },
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

export default function NotificationCenter({
  notifications: propNotifications,
  onMarkAllRead: propMarkAllRead,
  onMarkOneRead: propMarkOneRead,
}) {
  const hookState = useOperationsSyncCenter();
  
  // Use hook data or prop override
  const notifications = propNotifications || hookState.notifications;
  const onMarkAllRead = propMarkAllRead || hookState.markAllRead;
  const onMarkOneRead = propMarkOneRead || hookState.markOneRead;
  const { isSyncing, latencyMs, connStatus, forceCloudReSync, clearAll, exportAuditJson } = hookState;

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
        aria-label="Operations and sync center"
        aria-expanded={open}
        className="notif-bell-btn"
        title={`Operations & Sync Center • ${unreadCount} unread`}
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
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: 5,
              right: 6,
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: "#ef4444",
              border: "1.5px solid var(--bg-secondary, #ffffff)",
              boxShadow: "0 0 6px rgba(239, 68, 68, 0.6)",
              animation: "pulseGlow 2s infinite",
            }}
          />
        )}
      </button>

      {/* Advanced Operations Dropdown Panel */}
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Operations and sync center"
          style={{
            position: "absolute",
            top: 44,
            right: 0,
            width: 380,
            maxWidth: "94vw",
            backgroundColor: "var(--bg-card, var(--bg-secondary, #18191d))",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid var(--border-color, rgba(255,255,255,0.12))",
            borderRadius: 16,
            boxShadow: "0 20px 48px -10px rgba(0,0,0,0.35), 0 4px 16px rgba(0,0,0,0.1)",
            overflow: "hidden",
            zIndex: 5000,
            animation: "floatSlow 0.2s ease-out",
          }}
        >
          {/* Top Bar Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              borderBottom: "1px solid var(--border-color, rgba(255,255,255,0.08))",
              background: "var(--bg-primary, rgba(0,0,0,0.2))",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  backgroundColor: "rgba(59, 130, 246, 0.15)",
                  color: "#3b82f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Zap size={14} />
              </div>
              <div>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-primary, #ffffff)", letterSpacing: "-0.01em", display: "block" }}>
                  Operations & Sync Center
                </span>
              </div>
            </div>

            {/* Actions (Re-Sync & Close) */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {/* Live Latency Badge */}
              <div
                title="Live Supabase Database Connection & Latency"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "3px 8px",
                  borderRadius: 999,
                  background: connStatus === 'online' ? "rgba(16, 185, 129, 0.12)" : "rgba(245, 158, 11, 0.12)",
                  border: `1px solid ${connStatus === 'online' ? "rgba(16, 185, 129, 0.25)" : "rgba(245, 158, 11, 0.25)"}`,
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: connStatus === 'online' ? "#10b981" : "#f59e0b",
                }}
              >
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    backgroundColor: connStatus === 'online' ? "#10b981" : "#f59e0b",
                    boxShadow: connStatus === 'online' ? "0 0 4px #10b981" : "none",
                  }}
                />
                <span>{latencyMs ? `${latencyMs}ms` : connStatus === 'syncing' ? 'Sync' : 'Live'}</span>
              </div>

              {/* Force Cloud Re-Sync Button */}
              <button
                type="button"
                onClick={forceCloudReSync}
                disabled={isSyncing}
                title="Force Cloud Re-Sync"
                aria-label="Force Cloud Re-Sync"
                style={{
                  background: "var(--bg-secondary, rgba(255,255,255,0.06))",
                  border: "1px solid var(--border-color, rgba(255,255,255,0.12))",
                  borderRadius: 6,
                  cursor: isSyncing ? "default" : "pointer",
                  padding: 5,
                  color: isSyncing ? "#3b82f6" : "var(--text-secondary, #94a3b8)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s ease",
                }}
              >
                <RefreshCw size={13} className={isSyncing ? "spinning" : ""} />
              </button>

              {/* Close Button */}
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
          </div>

          {/* Categorized Filter Tabs */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "8px 12px 6px",
              borderBottom: "1px solid var(--border-color, rgba(255,255,255,0.08))",
              background: "var(--bg-primary, rgba(0,0,0,0.1))",
            }}
          >
            <div style={{ display: "flex", gap: 4 }}>
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
                      fontSize: 11.5,
                      padding: "4px 8px",
                      borderRadius: 6,
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      fontWeight: active ? 700 : 500,
                      backgroundColor: active ? "rgba(59, 130, 246, 0.16)" : "transparent",
                      color: active ? "#3b82f6" : "var(--text-secondary, #94a3b8)",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {TabIcon && <TabIcon size={11} />}
                    <span>{t.label}</span>
                    <span style={{ opacity: 0.7, fontSize: 10.5 }}>{counts[t.key]}</span>
                  </button>
                );
              })}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllRead}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--text-accent, #3b82f6)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  padding: "2px 4px",
                }}
              >
                <Check size={11} />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Activity Stream List */}
          <div style={{ padding: "6px 8px", maxHeight: 310, overflowY: "auto" }}>
            {sorted.length === 0 ? (
              <div style={{ textAlign: "center", padding: "36px 12px" }}>
                <CheckCircle2 size={24} style={{ color: "#10b981", margin: "0 auto 8px" }} />
                <p style={{ fontSize: 13, fontWeight: 700, margin: "0 0 2px", color: "var(--text-primary, #ffffff)" }}>
                  All Systems Synchronized
                </p>
                <p style={{ fontSize: 11.5, color: "var(--text-muted, #94a3b8)", margin: 0 }}>
                  Realtime telemetry active • 0 errors detected
                </p>
              </div>
            ) : (
              sorted.map((item) => {
                const style = CATEGORY_STYLE[item.category] || CATEGORY_STYLE.sync;
                const IconComp = style.icon;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleRowClick(item.id)}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      padding: "9px 10px",
                      borderRadius: 10,
                      marginBottom: 4,
                      backgroundColor: item.read ? "transparent" : "color-mix(in srgb, var(--primary-blue) 6%, transparent)",
                      border: `1px solid ${item.read ? "transparent" : "color-mix(in srgb, var(--primary-blue) 18%, transparent)"}`,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {/* Category Icon */}
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        backgroundColor: style.bg,
                        color: style.fg,
                        border: `1px solid ${style.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    >
                      <IconComp size={13} />
                    </div>

                    {/* Content Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                        <span
                          style={{
                            fontSize: 12.5,
                            fontWeight: item.read ? 600 : 700,
                            color: item.read ? "var(--text-primary, #ffffff)" : "var(--text-accent, #3b82f6)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            paddingRight: 6,
                          }}
                        >
                          {item.title}
                        </span>
                        <span style={{ fontSize: 10.5, color: "var(--text-muted, #94a3b8)", flexShrink: 0 }}>
                          {timeAgo(item.timestamp)}
                        </span>
                      </div>

                      <p
                        style={{
                          fontSize: 11.5,
                          color: "var(--text-secondary, #94a3b8)",
                          margin: 0,
                          lineHeight: 1.4,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {item.description}
                      </p>
                    </div>

                    {/* Unread Indicator Dot */}
                    {!item.read && (
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          backgroundColor: "#3b82f6",
                          flexShrink: 0,
                          marginTop: 6,
                        }}
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Telemetry Footer */}
          <div
            style={{
              padding: "8px 14px",
              borderTop: "1px solid var(--border-color, rgba(255,255,255,0.08))",
              background: "var(--bg-primary, rgba(0,0,0,0.2))",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: 11,
              color: "var(--text-muted, #94a3b8)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Activity size={11} color="#10b981" />
              <span>Realtime Engine Active</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                type="button"
                onClick={exportAuditJson}
                title="Download JSON Audit Log"
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-muted, #94a3b8)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  fontSize: 11,
                  padding: 0,
                }}
              >
                <Download size={11} />
                <span>Export</span>
              </button>

              <button
                type="button"
                onClick={clearAll}
                title="Clear local operations history"
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-muted, #94a3b8)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  fontSize: 11,
                  padding: 0,
                }}
              >
                <Trash2 size={11} />
                <span>Clear</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
