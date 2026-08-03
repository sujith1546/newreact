import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, Tablet, RotateCw, RefreshCw, Apple, Smartphone as AndroidIcon, Globe, Wifi, Battery, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
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
  const [zoomScale, setZoomScale] = useState("auto"); // "auto" | 0.85 | 1.0 | 1.15 | 1.25
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
              height: "50px",
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
                  width: "30px",
                  height: "30px",
                  borderRadius: "8px",
                  backgroundColor: "color-mix(in srgb, var(--primary-blue) 14%, var(--bg-primary))",
                  color: "var(--primary-blue)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid var(--border-color)"
                }}
              >
                <Smartphone size={16} />
              </div>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
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
              zoomScale={zoomScale}
              setZoomScale={setZoomScale}
              dims={dims}
              onReload={() => setReloadKey((k) => k + 1)}
            />

            {/* Device Stage Preview */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
                backgroundColor: "color-mix(in srgb, var(--text-primary) 3%, var(--bg-primary))",
                padding: "1.25rem 1rem 1rem",
                overflow: "hidden",
                position: "relative"
              }}
            >
              <DeviceFrame dims={dims} isPortrait={orientation === "portrait"} zoomScale={zoomScale}>
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

function DeviceSimulatorSidebar({ deviceKey, setDeviceKey, orientation, setOrientation, zoomScale, setZoomScale, dims, onReload }) {
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
        gap: "22px",
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

      {/* Frame Zoom Scale Selector */}
      <div>
        <p style={sectionLabelStyle}>Frame Size Zoom</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
          {[
            { id: "auto", label: "Auto (Max Stage)" },
            { id: 0.85, label: "85%" },
            { id: 1.0, label: "100% (1:1)" },
            { id: 1.15, label: "115% (Large)" }
          ].map((z) => {
            const active = zoomScale === z.id;
            return (
              <button
                key={String(z.id)}
                type="button"
                onClick={() => setZoomScale(z.id)}
                style={{
                  padding: "7px 6px",
                  borderRadius: "8px",
                  fontSize: "11.5px",
                  fontWeight: active ? 700 : 500,
                  cursor: "pointer",
                  border: active ? "1px solid var(--primary-blue)" : "1px solid var(--border-color)",
                  backgroundColor: active ? "color-mix(in srgb, var(--primary-blue) 14%, var(--bg-primary))" : "var(--bg-primary)",
                  color: active ? "var(--primary-blue)" : "var(--text-primary)",
                  textAlign: "center",
                  transition: "all 0.15s ease"
                }}
              >
                {z.label}
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

function DeviceFrame({ dims, isPortrait = true, zoomScale = "auto", children }) {
  const containerRef = React.useRef(null);
  const [stageSize, setStageSize] = useState({ w: 1000, h: 900 });

  useEffect(() => {
    if (!containerRef.current) return;

    const updateSize = () => {
      if (containerRef.current && containerRef.current.parentElement) {
        const parent = containerRef.current.parentElement;
        const rect = parent.getBoundingClientRect();
        setStageSize({
          w: rect.width || parent.clientWidth || 1000,
          h: rect.height || parent.clientHeight || 900
        });
      }
    };

    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);
    if (containerRef.current.parentElement) {
      resizeObserver.observe(containerRef.current.parentElement);
    }

    return () => resizeObserver.disconnect();
  }, []);

  // Real dimensions of device casing shell
  const frameUnscaledW = dims.w + 24; // 12px padding on each side
  const frameUnscaledH = dims.h + 24;

  // Available stage area directly measured from parent panel's clientHeight / clientWidth
  const availableStageH = stageSize.h > 0 ? stageSize.h : 900;
  const availableStageW = stageSize.w > 0 ? stageSize.w : 1000;

  let scale = 1.0;

  if (zoomScale === "auto") {
    // Force a prominent scale floor of 0.88 minimum (~367px wide x 771px tall)
    // so the phone frame NEVER renders tiny or squeezed, while keeping outer stage non-scrollable (overflow: hidden)
    const computedHScale = (availableStageH * 0.96) / frameUnscaledH;
    scale = Math.max(0.88, Math.min(1.15, computedHScale));
  } else if (typeof zoomScale === "number") {
    scale = zoomScale;
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: `${frameUnscaledW * scale}px`,
        height: `${frameUnscaledH * scale}px`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        margin: "auto"
      }}
    >
      {/* Outer Scaled Device Casing with Metallic Finish */}
      <div
        style={{
          width: `${frameUnscaledW}px`,
          height: `${frameUnscaledH}px`,
          background: "linear-gradient(145deg, #2d2e33 0%, #151518 50%, #0c0d10 100%)",
          borderRadius: "48px",
          padding: "12px",
          boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.25), inset 0 -1px 2px rgba(0, 0, 0, 0.9), 0 30px 70px rgba(0, 0, 0, 0.45)",
          border: "1px solid rgba(255, 255, 255, 0.14)",
          boxSizing: "border-box",
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          position: "relative",
          transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      >
        {/* Left Side Hardware Buttons (Action Switch + Volume Rockers) */}
        {isPortrait && (
          <>
            <div
              style={{
                position: "absolute",
                left: "-4px",
                top: "85px",
                width: "4px",
                height: "26px",
                borderRadius: "3px 0 0 3px",
                background: "linear-gradient(to right, #444448, #222225)",
                boxShadow: "-1px 0 3px rgba(0,0,0,0.4)"
              }}
            />
            <div
              style={{
                position: "absolute",
                left: "-4px",
                top: "125px",
                width: "4px",
                height: "48px",
                borderRadius: "3px 0 0 3px",
                background: "linear-gradient(to right, #444448, #222225)",
                boxShadow: "-1px 0 3px rgba(0,0,0,0.4)"
              }}
            />
            <div
              style={{
                position: "absolute",
                left: "-4px",
                top: "185px",
                width: "4px",
                height: "48px",
                borderRadius: "3px 0 0 3px",
                background: "linear-gradient(to right, #444448, #222225)",
                boxShadow: "-1px 0 3px rgba(0,0,0,0.4)"
              }}
            />

            {/* Right Side Hardware Power/Lock Button */}
            <div
              style={{
                position: "absolute",
                right: "-4px",
                top: "140px",
                width: "4px",
                height: "65px",
                borderRadius: "0 3px 3px 0",
                background: "linear-gradient(to left, #444448, #222225)",
                boxShadow: "1px 0 3px rgba(0,0,0,0.4)"
              }}
            />
          </>
        )}

        {/* Screen Frame Area (Matches Exact Target Resolution) */}
        <div
          style={{
            width: `${dims.w}px`,
            height: `${dims.h}px`,
            backgroundColor: "#ffffff",
            borderRadius: "36px",
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
