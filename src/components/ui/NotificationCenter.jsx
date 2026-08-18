import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  Activity,
  Server,
  Database,
  Radio,
} from "lucide-react";
import { useOperationsSyncCenter } from "../../core/hooks/useOperationsSyncCenter";
import { useTheme } from "../../context/ThemeContext";

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
  const { theme } = useTheme();
  const isDark =
    theme === "dark" ||
    (typeof document !== "undefined" &&
      document.documentElement.getAttribute("data-theme") === "dark");

  const hookState = useOperationsSyncCenter();
  
  // Use hook data or prop override
  const notifications = propNotifications || hookState.notifications;
  const onMarkAllRead = propMarkAllRead || hookState.markAllRead;
  const onMarkOneRead = propMarkOneRead || hookState.markOneRead;
  const { isSyncing, latencyMs, connStatus, forceCloudReSync, clearAll, exportAuditJson } = hookState;

  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("all");

  // Close on Escape & lock body scroll
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    function handleKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
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
        type="button"
        onClick={() => setOpen(true)}
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

      {/* Linear / Vercel Slide-Over Drawer */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && (
              <>
                {/* Frosted Glass Backdrop */}
                <motion.div
                  key="ops-drawer-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  onClick={() => setOpen(false)}
                  style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 2000000,
                    backgroundColor: isDark
                      ? "rgba(0, 0, 0, 0.55)"
                      : "rgba(15, 23, 42, 0.35)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                  }}
                />

                {/* Right Slide-Over Panel */}
                <motion.div
                  key="ops-drawer-panel"
                  role="dialog"
                  aria-modal="true"
                  aria-label="Operations and sync center"
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 30, stiffness: 320, mass: 0.85 }}
                  style={{
                    position: "fixed",
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: "100%",
                    maxWidth: "420px",
                    backgroundColor: isDark
                      ? "rgba(14, 18, 28, 0.96)"
                      : "rgba(255, 255, 255, 0.98)",
                    borderLeft: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`,
                    boxShadow: isDark
                      ? "-24px 0 60px rgba(0,0,0,0.8)"
                      : "-16px 0 40px rgba(0,0,0,0.15)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    zIndex: 2000001,
                    display: "flex",
                    flexDirection: "column",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif",
                    color: isDark ? "#ffffff" : "#0f172a",
                  }}
                >
                  {/* Top Bar Header */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "18px 20px 14px",
                      borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"}`,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 10,
                          backgroundColor: "rgba(59, 130, 246, 0.15)",
                          color: "#3b82f6",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          boxShadow: "0 2px 8px rgba(59, 130, 246, 0.3)",
                        }}
                      >
                        <Zap size={16} />
                      </div>
                      <div>
                        <div style={{ fontSize: "15px", fontWeight: 700, lineHeight: 1.2 }}>
                          Operations &amp; Sync
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: "2px" }}>
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              backgroundColor: connStatus === "online" ? "#10b981" : "#f59e0b",
                              boxShadow: connStatus === "online" ? "0 0 6px #10b981" : "none",
                            }}
                          />
                          <span style={{ fontSize: "11px", color: isDark ? "#94a3b8" : "#64748b", fontWeight: 500 }}>
                            {connStatus === "online" ? `${latencyMs || 24}ms • Realtime Connected` : "Syncing engine"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions: Re-Sync & Close */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <button
                        type="button"
                        onClick={forceCloudReSync}
                        disabled={isSyncing}
                        title="Force Cloud Re-Sync"
                        aria-label="Force Cloud Re-Sync"
                        style={{
                          background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                          border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`,
                          borderRadius: 8,
                          cursor: isSyncing ? "default" : "pointer",
                          padding: "6px 8px",
                          color: isSyncing ? "#3b82f6" : (isDark ? "#cbd5e1" : "#475569"),
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 11.5,
                          fontWeight: 600,
                          transition: "all 0.15s ease",
                        }}
                      >
                        <RefreshCw size={12} className={isSyncing ? "spinning" : ""} />
                        <span>{isSyncing ? "Syncing…" : "Re-sync"}</span>
                      </button>

                      <motion.button
                        type="button"
                        onClick={() => setOpen(false)}
                        aria-label="Close"
                        whileHover={{ scale: 1.15, rotate: 90 }}
                        whileTap={{ scale: 0.88 }}
                        transition={{ type: "spring", damping: 20, stiffness: 400 }}
                        style={{
                          background: "none",
                          border: "none",
                          color: isDark ? "#94a3b8" : "#64748b",
                          cursor: "pointer",
                          padding: 0,
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <X size={18} />
                      </motion.button>
                    </div>
                  </div>

                  {/* 3-Tile Live Metric HUD */}
                  <div style={{ padding: "14px 18px 8px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", flexShrink: 0 }}>
                    <div
                      style={{
                        padding: "10px",
                        borderRadius: "10px",
                        background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
                        border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"}`,
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontSize: "10px", fontWeight: 700, color: isDark ? "#94a3b8" : "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        Ping
                      </div>
                      <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", marginTop: "3px" }}>
                        <Radio size={12} />
                        <span>{latencyMs ? `${latencyMs}ms` : "24ms"}</span>
                      </div>
                    </div>

                    <div
                      style={{
                        padding: "10px",
                        borderRadius: "10px",
                        background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
                        border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"}`,
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontSize: "10px", fontWeight: 700, color: isDark ? "#94a3b8" : "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        Cloud State
                      </div>
                      <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", marginTop: "3px" }}>
                        <Database size={12} />
                        <span>Active</span>
                      </div>
                    </div>

                    <div
                      style={{
                        padding: "10px",
                        borderRadius: "10px",
                        background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
                        border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"}`,
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontSize: "10px", fontWeight: 700, color: isDark ? "#94a3b8" : "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        Audit Logs
                      </div>
                      <div style={{ fontSize: "13.5px", fontWeight: 700, color: isDark ? "#f8fafc" : "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", marginTop: "3px" }}>
                        <Server size={12} color="#a855f7" />
                        <span>{notifications.length}</span>
                      </div>
                    </div>
                  </div>

                  {/* Segmented Filter Tabs Track - Curved Rectangle */}
                  <div style={{ padding: "8px 18px 6px", flexShrink: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "3px",
                        borderRadius: "10px",
                        backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                        border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`,
                        gap: "3px",
                      }}
                    >
                      <div style={{ display: "flex", gap: "3px", flex: 1 }}>
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
                                flex: 1,
                                cursor: "pointer",
                                fontSize: 11.5,
                                padding: "6px 8px",
                                borderRadius: "7px",
                                border: "none",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 4,
                                fontWeight: active ? 700 : 500,
                                backgroundColor: active
                                  ? (isDark ? "#1e293b" : "#ffffff")
                                  : "transparent",
                                color: active
                                  ? (isDark ? "#ffffff" : "#0f172a")
                                  : (isDark ? "#94a3b8" : "#64748b"),
                                boxShadow: active ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
                                transition: "all 0.15s ease",
                              }}
                            >
                              {TabIcon && <TabIcon size={12} />}
                              <span>{t.label}</span>
                              <span style={{ opacity: 0.65, fontSize: 10 }}>({counts[t.key]})</span>
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
                            color: "#3b82f6",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 3,
                            padding: "4px 8px",
                            borderRadius: "6px",
                            flexShrink: 0,
                          }}
                        >
                          <Check size={11} />
                          <span>All read</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Scrollable Activity Stream List */}
                  <div style={{ flex: 1, overflowY: "auto", padding: "10px 18px 18px" }}>
                    {sorted.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "60px 18px" }}>
                        <div
                          style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "50%",
                            backgroundColor: "rgba(16, 185, 129, 0.12)",
                            color: "#10b981",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 12px",
                          }}
                        >
                          <CheckCircle2 size={24} />
                        </div>
                        <p style={{ fontSize: 14, fontWeight: 700, margin: "0 0 4px", color: isDark ? "#ffffff" : "#0f172a" }}>
                          All Systems Synchronized
                        </p>
                        <p style={{ fontSize: 12, color: isDark ? "#94a3b8" : "#64748b", margin: 0, lineHeight: 1.5 }}>
                          Realtime telemetry engine active • Zero errors detected
                        </p>
                      </div>
                    ) : (
                      sorted.map((item) => {
                        const catStyle = CATEGORY_STYLE[item.category] || CATEGORY_STYLE.sync;
                        const IconComp = catStyle.icon;
                        return (
                          <div
                            key={item.id}
                            onClick={() => handleRowClick(item.id)}
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 12,
                              padding: "12px 14px",
                              borderRadius: "12px",
                              marginBottom: 8,
                              backgroundColor: item.read
                                ? (isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)")
                                : (isDark ? "rgba(59, 130, 246, 0.12)" : "rgba(59, 130, 246, 0.08)"),
                              border: `1px solid ${
                                item.read
                                  ? (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)")
                                  : "rgba(59, 130, 246, 0.28)"
                              }`,
                              cursor: "pointer",
                              transition: "all 0.18s ease",
                            }}
                          >
                            {/* Category Icon */}
                            <div
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 10,
                                backgroundColor: catStyle.bg,
                                color: catStyle.fg,
                                border: `1px solid ${catStyle.border}`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                                marginTop: 1,
                              }}
                            >
                              <IconComp size={15} />
                            </div>

                            {/* Content Details */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                                <span
                                  style={{
                                    fontSize: 13,
                                    fontWeight: item.read ? 600 : 700,
                                    color: item.read ? (isDark ? "#f8fafc" : "#0f172a") : "#3b82f6",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    paddingRight: 6,
                                  }}
                                >
                                  {item.title}
                                </span>
                                <span style={{ fontSize: 11, color: isDark ? "#94a3b8" : "#64748b", flexShrink: 0 }}>
                                  {timeAgo(item.timestamp)}
                                </span>
                              </div>

                              <p
                                style={{
                                  fontSize: 12,
                                  color: isDark ? "#94a3b8" : "#64748b",
                                  margin: 0,
                                  lineHeight: 1.45,
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
                                  width: 7,
                                  height: 7,
                                  borderRadius: "50%",
                                  backgroundColor: "#3b82f6",
                                  boxShadow: "0 0 6px #3b82f6",
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

                  {/* Drawer Bottom Telemetry Footer */}
                  <div
                    style={{
                      padding: "12px 18px",
                      borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"}`,
                      background: isDark ? "rgba(0,0,0,0.25)" : "rgba(0,0,0,0.02)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: 11.5,
                      color: isDark ? "#94a3b8" : "#64748b",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Activity size={13} color="#10b981" />
                      <span style={{ fontWeight: 600 }}>Realtime Engine Active</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <button
                        type="button"
                        onClick={exportAuditJson}
                        title="Download JSON Audit Log"
                        style={{
                          background: "none",
                          border: "none",
                          color: isDark ? "#cbd5e1" : "#475569",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 11.5,
                          fontWeight: 600,
                          padding: 0,
                        }}
                      >
                        <Download size={12} />
                        <span>Export</span>
                      </button>

                      <button
                        type="button"
                        onClick={clearAll}
                        title="Clear local operations history"
                        style={{
                          background: "none",
                          border: "none",
                          color: "#ef4444",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 11.5,
                          fontWeight: 600,
                          padding: 0,
                        }}
                      >
                        <Trash2 size={12} />
                        <span>Clear</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
