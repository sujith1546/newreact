import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, Tablet, RotateCw, RefreshCw, Apple, Smartphone as AndroidIcon, Globe } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const DEVICES = {
  "iphone-16-pro": { id: "iphone-16-pro", label: "iPhone 16 Pro", icon: "apple", portrait: { w: 393, h: 852 } },
  "pixel-9-pro": { id: "pixel-9-pro", label: "Pixel 9 Pro", icon: "android", portrait: { w: 412, h: 892 } },
  "ipad-air": { id: "ipad-air", label: "iPad Air", icon: "tablet", portrait: { w: 820, h: 1180 } },
};

export default function MobilePreviewModal({ isOpen, onClose }) {
  const { theme } = useTheme();
  const [deviceKey, setDeviceKey] = useState("iphone-16-pro");
  const [orientation, setOrientation] = useState("portrait");
  const [reloadKey, setReloadKey] = useState(0);

  const device = DEVICES[deviceKey] || DEVICES["iphone-16-pro"];
  const dims = useMemo(() => {
    const base = device.portrait;
    return orientation === "portrait" ? base : { w: base.h, h: base.w };
  }, [device, orientation]);

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://sujiththota.dev';
  const siteDomain = typeof window !== 'undefined' ? window.location.host : 'sujiththota.dev';

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Device preview simulator"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999999,
            backgroundColor: "var(--bg-primary)",
            color: "var(--text-primary)",
            display: "flex",
            flexDirection: "column",
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            overflow: "hidden",
            userSelect: "none"
          }}
        >
          {/* Header Bar */}
          <div
            style={{
              height: "54px",
              padding: "0 1.5rem",
              borderBottom: "1px solid var(--border-color)",
              backgroundColor: "var(--bg-secondary)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexShrink: 0
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  backgroundColor: "color-mix(in srgb, var(--primary-blue) 14%, var(--bg-primary))",
                  color: "var(--primary-blue)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid var(--border-color)"
                }}
              >
                <Smartphone size={17} />
              </div>
              <span style={{ fontSize: "14.5px", fontWeight: 700, color: "var(--text-primary)" }}>
                Device Preview Simulator
              </span>
              <div style={{ width: "1px", height: "14px", backgroundColor: "var(--border-color)", margin: "0 4px" }} />
              <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>
                <Globe size={13} color="var(--primary-blue)" />
                <span>{siteDomain}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close device preview"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-muted)",
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s ease"
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Main Content Stage */}
          <div
            className="device-simulator-body"
            style={{
              display: "grid",
              gridTemplateColumns: "240px 1fr",
              flex: 1,
              minHeight: 0,
              overflow: "hidden"
            }}
          >
            {/* Sidebar Controls */}
            <DeviceSimulatorSidebar
              deviceKey={deviceKey}
              setDeviceKey={setDeviceKey}
              orientation={orientation}
              setOrientation={setOrientation}
              dims={dims}
              onReload={() => setReloadKey((k) => k + 1)}
            />

            {/* Device Stage Preview */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "color-mix(in srgb, var(--text-primary) 3%, var(--bg-primary))",
                padding: "1.5rem",
                overflow: "auto",
                position: "relative"
              }}
            >
              <DeviceFrame dims={dims}>
                <iframe
                  key={reloadKey}
                  src={siteUrl}
                  title="Live portfolio mobile preview"
                  width={dims.w}
                  height={dims.h}
                  style={{
                    width: `${dims.w}px`,
                    height: `${dims.h}px`,
                    border: "none",
                    backgroundColor: "#ffffff",
                    display: "block"
                  }}
                />
              </DeviceFrame>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

function DeviceSimulatorSidebar({ deviceKey, setDeviceKey, orientation, setOrientation, dims, onReload }) {
  const iconFor = (iconType) => {
    if (iconType === "apple") return <Apple size={15} />;
    if (iconType === "android") return <AndroidIcon size={15} />;
    return <Tablet size={15} />;
  };

  const sectionLabelStyle = {
    fontSize: "11px",
    fontWeight: 800,
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    margin: "0 0 10px"
  };

  return (
    <div
      style={{
        borderRight: "1px solid var(--border-color)",
        backgroundColor: "var(--bg-secondary)",
        padding: "1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        overflowY: "auto"
      }}
    >
      {/* Device Picker Section */}
      <div>
        <p style={sectionLabelStyle}>Device Target</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {Object.entries(DEVICES).map(([key, d]) => {
            const active = key === deviceKey;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setDeviceKey(key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "9px 12px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: active ? 700 : 500,
                  cursor: "pointer",
                  border: active ? "1px solid var(--primary-blue)" : "1px solid transparent",
                  backgroundColor: active ? "color-mix(in srgb, var(--primary-blue) 14%, var(--bg-primary))" : "transparent",
                  color: active ? "var(--primary-blue)" : "var(--text-primary)",
                  textAlign: "left",
                  transition: "all 0.15s ease"
                }}
              >
                {iconFor(d.icon)}
                <span>{d.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orientation Switcher */}
      <div>
        <p style={sectionLabelStyle}>Orientation</p>
        <div
          style={{
            display: "flex",
            gap: "4px",
            backgroundColor: "var(--bg-primary)",
            padding: "4px",
            borderRadius: "10px",
            border: "1px solid var(--border-color)"
          }}
        >
          {["portrait", "landscape"].map((o) => {
            const active = orientation === o;
            return (
              <button
                key={o}
                type="button"
                onClick={() => setOrientation(o)}
                style={{
                  flex: 1,
                  textAlign: "center",
                  padding: "7px 0",
                  fontSize: "12px",
                  fontWeight: active ? 700 : 500,
                  borderRadius: "7px",
                  cursor: "pointer",
                  textTransform: "capitalize",
                  border: "none",
                  backgroundColor: active ? "var(--bg-secondary)" : "transparent",
                  boxShadow: active ? "0 2px 6px rgba(0, 0, 0, 0.12)" : "none",
                  color: active ? "var(--primary-blue)" : "var(--text-secondary)",
                  transition: "all 0.15s ease"
                }}
              >
                {o}
              </button>
            );
          })}
        </div>
      </div>

      {/* Viewport Info Box */}
      <div>
        <p style={sectionLabelStyle}>Viewport Resolution</p>
        <div
          style={{
            padding: "10px 12px",
            borderRadius: "9px",
            backgroundColor: "var(--bg-primary)",
            border: "1px solid var(--border-color)",
            fontSize: "12.5px",
            fontWeight: 700,
            color: "var(--text-primary)",
            fontFamily: 'monospace',
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <span>{dims.w} × {dims.h}</span>
          <span style={{ fontSize: "10.5px", color: "var(--text-muted)" }}>PX</span>
        </div>
      </div>

      {/* Reload Action Button */}
      <div style={{ marginTop: "auto", paddingTop: "12px" }}>
        <button
          type="button"
          onClick={onReload}
          style={{
            width: "100%",
            height: "38px",
            borderRadius: "10px",
            fontSize: "12.5px",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            cursor: "pointer",
            border: "1px solid var(--border-color)",
            backgroundColor: "var(--bg-primary)",
            color: "var(--text-primary)",
            transition: "all 0.15s ease"
          }}
        >
          <RefreshCw size={14} /> Refresh Frame
        </button>
      </div>
    </div>
  );
}

function DeviceFrame({ dims, children }) {
  // Real dimensions of device casing shell
  const frameUnscaledW = dims.w + 24; // 12px padding on each side
  const frameUnscaledH = dims.h + 24;

  const maxAvailableH = typeof window !== 'undefined' ? window.innerHeight - 130 : 700;
  const maxAvailableW = typeof window !== 'undefined' ? window.innerWidth - 280 : 800;

  // Scale factor to scale the outer shell visually as a single unit
  const scale = Math.min(1, maxAvailableH / frameUnscaledH, maxAvailableW / frameUnscaledW);

  return (
    <div
      style={{
        width: `${frameUnscaledW * scale}px`,
        height: `${frameUnscaledH * scale}px`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative"
      }}
    >
      {/* Outer Scaled Device Casing */}
      <div
        style={{
          width: `${frameUnscaledW}px`,
          height: `${frameUnscaledH}px`,
          backgroundColor: "#111111",
          borderRadius: "46px",
          padding: "12px",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.4)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          boxSizing: "border-box",
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          position: "relative",
          transition: "transform 0.2s ease"
        }}
      >
        {/* Dynamic Island / Top Notch Capsule */}
        <div
          style={{
            position: "absolute",
            top: "14px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "96px",
            height: "22px",
            backgroundColor: "#000000",
            borderRadius: "14px",
            zIndex: 10,
            border: "1px solid rgba(255, 255, 255, 0.08)"
          }}
        />

        {/* Screen Frame Area (Matches Exact Target Resolution) */}
        <div
          style={{
            width: `${dims.w}px`,
            height: `${dims.h}px`,
            backgroundColor: "#ffffff",
            borderRadius: "34px",
            overflow: "hidden",
            position: "relative"
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
