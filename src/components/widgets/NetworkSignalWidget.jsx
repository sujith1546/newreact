import React, { useState, useEffect, useRef, useCallback } from 'react';
import { WifiOff } from 'lucide-react';

const CHECK_INTERVAL_MS = 45000; // 45s
const HISTORY_LENGTH = 6;
const FLICKER_DEBOUNCE_MS = 2000;

function classifyLatency(ms) {
  if (ms == null) return "unknown";
  if (ms < 100) return "fast";
  if (ms <= 250) return "moderate";
  return "slow";
}

function SignalBars({ filled, color, size = 12 }) {
  const heights = [size * 0.35, size * 0.58, size * 0.8, size];
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "1.5px", height: `${size}px` }}>
      {heights.map((h, i) => (
        <div
          key={i}
          style={{
            width: "3px",
            height: `${h}px`,
            background: i < filled ? color : "var(--border-color, rgba(128,128,128,0.25))",
            borderRadius: "1px",
            transition: "background 0.25s ease",
          }}
        />
      ))}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ color: "var(--text-secondary, #888)" }}>{label}</span>
      <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{value}</span>
    </div>
  );
}

export default function NetworkSignalWidget() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [latency, setLatency] = useState(null);
  const [connType, setConnType] = useState(null);
  const [downlink, setDownlink] = useState(null);
  const [history, setHistory] = useState([]);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const flickerTimeout = useRef(null);
  const intervalRef = useRef(null);
  const popoverRef = useRef(null);

  // Debounced online/offline listener
  useEffect(() => {
    const handleChange = (nextOnline) => {
      clearTimeout(flickerTimeout.current);
      flickerTimeout.current = setTimeout(() => {
        setIsOnline(nextOnline);
      }, FLICKER_DEBOUNCE_MS);
    };
    const onOnline = () => handleChange(true);
    const onOffline = () => handleChange(false);

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      clearTimeout(flickerTimeout.current);
    };
  }, []);

  const checkConnection = useCallback(async () => {
    if (!navigator.onLine) return;

    // Prefer Network Information API when available
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn) {
      setConnType(conn.effectiveType || null);
      setDownlink(conn.downlink ?? null);
      if (typeof conn.rtt === "number" && conn.rtt > 0) {
        setLatency(conn.rtt);
        setHistory((h) => [...h.slice(-(HISTORY_LENGTH - 1)), conn.rtt]);
        return;
      }
    }

    // Fallback: manual lightweight ping
    try {
      const start = performance.now();
      await fetch("/manifest.webmanifest", { method: "HEAD", cache: "no-store" });
      const rtt = Math.round(performance.now() - start);
      setLatency(rtt);
      setHistory((h) => [...h.slice(-(HISTORY_LENGTH - 1)), rtt]);
    } catch {
      setLatency(null);
    }
  }, []);

  // Poll periodically, pausing when tab is hidden
  useEffect(() => {
    const startPolling = () => {
      checkConnection();
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(checkConnection, CHECK_INTERVAL_MS);
    };
    const stopPolling = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        startPolling();
      }
    };

    if (!document.hidden) startPolling();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [checkConnection]);

  // Close popover on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setPopoverOpen(false);
      }
    };
    const onKey = (e) => e.key === "Escape" && setPopoverOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const quality = isOnline ? classifyLatency(latency) : "offline";
  const barColor =
    quality === "fast"
      ? "#10b981" // Green
      : quality === "moderate"
      ? "#f59e0b" // Amber
      : "#ef4444"; // Red

  const filledBars = quality === "fast" ? 4 : quality === "moderate" ? 2 : quality === "slow" ? 1 : 0;

  return (
    <div ref={popoverRef} style={{ position: "relative" }} aria-live="polite">
      <style>{`
        .net-signal-pill-btn {
          height: 34px;
          border-radius: 17px;
          background: rgba(243, 244, 246, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(0, 0, 0, 0.1);
          box-shadow: 0 4px 15px rgba(0,0,0,0.08);
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0 12px;
          cursor: pointer;
          font-size: 11.5px;
          font-weight: 600;
          color: var(--text-primary);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          user-select: none;
        }

        [data-theme="dark"] .net-signal-pill-btn {
          background: rgba(30, 30, 30, 0.5);
          border-color: rgba(255,255,255,0.08);
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }

        .net-signal-pill-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.12);
        }
      `}</style>

      <button
        type="button"
        className="net-signal-pill-btn"
        onClick={() => setPopoverOpen((o) => !o)}
        aria-label={isOnline ? `Connection ${quality}, ${latency ?? "?"} ms` : "Connection offline"}
      >
        {!isOnline ? (
          <>
            <WifiOff size={14} color="#ef4444" />
            <span style={{ fontSize: "11px", color: "#ef4444", fontWeight: 700 }}>Offline</span>
          </>
        ) : (
          <>
            <SignalBars filled={filledBars} color={barColor} size={12} />
            <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
              {latency != null ? `${latency}ms` : "—"}
            </span>
          </>
        )}
      </button>

      {popoverOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: "250px",
            background: "var(--bg-secondary, #1e1e1e)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid var(--border-color, rgba(255,255,255,0.12))",
            borderRadius: "14px",
            padding: "14px",
            boxShadow: "0 16px 36px rgba(0,0,0,0.25), inset 0 1px 1px rgba(255,255,255,0.1)",
            zIndex: 9999,
            color: "var(--text-primary)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            {isOnline ? (
              <SignalBars filled={filledBars} color={barColor} size={16} />
            ) : (
              <WifiOff size={16} color="#ef4444" />
            )}
            <span style={{ fontSize: "13px", fontWeight: 600 }}>
              {!isOnline
                ? "You're offline"
                : quality === "fast"
                ? "Connection is fast"
                : quality === "moderate"
                ? "Connection is moderate"
                : "Connection is slow"}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px" }}>
            <Row label="Latency" value={latency != null ? `${latency} ms` : "—"} />
            <Row label="Type" value={connType ? connType.toUpperCase() : "Broadband"} />
            <Row label="Downlink" value={downlink != null ? `${downlink.toFixed(1)} Mbps` : "—"} />
          </div>

          {history.length > 1 && (
            <>
              <div
                style={{
                  marginTop: "12px",
                  paddingTop: "10px",
                  borderTop: "1px solid var(--border-color, rgba(128,128,128,0.15))",
                  display: "flex",
                  alignItems: "flex-end",
                  gap: "3px",
                  height: "28px",
                }}
              >
                {history.map((val, i) => {
                  const max = Math.max(...history, 1);
                  const heightPct = Math.max(15, (val / max) * 100);
                  return (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: `${heightPct}%`,
                        background: barColor,
                        opacity: 0.85,
                        borderRadius: "2px 2px 0 0",
                        transition: "height 0.3s ease",
                      }}
                      title={`${val} ms`}
                    />
                  );
                })}
              </div>
              <p style={{ fontSize: "10.5px", color: "var(--text-secondary)", margin: "4px 0 0", textAlign: "right" }}>
                Last {history.length} checks
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
