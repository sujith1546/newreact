import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Terminal,
  X,
  Wifi,
  Gauge,
  Layers,
  SlidersHorizontal,
  Activity,
  Cpu,
  Zap,
  CheckCircle2,
  ArrowRight,
  HardDrive,
  Clock
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const BUILD_VERSION = 'v1.4.2';

const CORE_STACK = [
  { name: 'React', version: '18.2' },
  { name: 'Vite', version: '6.0' },
  { name: 'Tailwind', version: '3.4' },
  { name: 'Framer', version: 'Motion' },
];

export default function SystemDiagnostics({ open, onClose }) {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('metrics'); // 'metrics' | 'env'

  const [fps, setFps] = useState(60);
  const [memory, setMemory] = useState(null);
  const [uptime, setUptime] = useState(0);
  const [latency, setLatency] = useState(null);
  const [requestCount, setRequestCount] = useState(0);

  const frameCountRef = useRef(0);
  const lastFrameTimeRef = useRef(performance.now());
  const startTimeRef = useRef(performance.now());
  const rafIdRef = useRef(null);

  // Keyboard shortcut: Ctrl+D or Cmd+D to toggle, Escape to close
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (onClose && open) {
          onClose();
        }
      }
      if (e.key === 'Escape' && open && onClose) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // FPS counter
  useEffect(() => {
    if (!open) return;

    function tick(now) {
      frameCountRef.current += 1;
      const elapsed = now - lastFrameTimeRef.current;
      if (elapsed >= 1000) {
        setFps(Math.min(60, Math.round((frameCountRef.current * 1000) / elapsed)));
        frameCountRef.current = 0;
        lastFrameTimeRef.current = now;
      }
      rafIdRef.current = requestAnimationFrame(tick);
    }
    rafIdRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafIdRef.current);
  }, [open]);

  // JS heap memory
  useEffect(() => {
    if (!open) return;
    function readMemory() {
      if (performance.memory) {
        setMemory(performance.memory.usedJSHeapSize / (1024 * 1024));
      }
    }
    readMemory();
    const id = setInterval(readMemory, 2000);
    return () => clearInterval(id);
  }, [open]);

  // Session uptime
  useEffect(() => {
    if (!open) return;
    startTimeRef.current = performance.now();
    const uptimeInterval = setInterval(() => {
      setUptime(Math.floor(performance.now() / 1000));
    }, 1000);
    return () => clearInterval(uptimeInterval);
  }, [open]);

  // Latency ping
  const pingLatency = useCallback(async () => {
    try {
      const start = performance.now();
      await fetch(`/favicon.svg?_ping=${Date.now()}`, {
        method: 'HEAD',
        cache: 'no-store',
      });
      setLatency(Math.round(performance.now() - start));
    } catch {
      setLatency(null);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    pingLatency();
    const id = setInterval(pingLatency, 2500);
    return () => clearInterval(id);
  }, [open, pingLatency]);

  // Resource request count
  useEffect(() => {
    if (!open) return;
    function updateCount() {
      if (typeof performance !== 'undefined' && performance.getEntriesByType) {
        setRequestCount(performance.getEntriesByType('resource').length);
      }
    }
    updateCount();
    const id = setInterval(updateCount, 2000);
    return () => clearInterval(id);
  }, [open]);

  if (!open || typeof window === 'undefined') return null;

  const isDarkMode =
    theme === 'dark' ||
    (typeof document !== 'undefined' &&
      document.documentElement.getAttribute('data-theme') === 'dark');

  const latencyPercent = latency == null ? 15 : Math.min(100, Math.max(10, (latency / 250) * 100));

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="sd-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isDarkMode
              ? 'rgba(0, 0, 0, 0.55)'
              : 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            padding: '20px',
            boxSizing: 'border-box',
          }}
        >
          <style>{`
            .sd-modal-card {
              --modal-bg: rgba(255, 255, 255, 0.98);
              --modal-border: #e2e8f0;
              --modal-text: #0f172a;
              --modal-muted: #64748b;
              --modal-field-bg: #f8fafc;
              --modal-field-border: #cbd5e1;
              --modal-tab-track: #f1f5f9;
              --modal-tab-active-bg: #0f172a;
              --modal-tab-active-text: #ffffff;
              --modal-btn-bg: #0f172a;
              --modal-btn-hover: #1e293b;
              --modal-btn-text: #ffffff;
              --modal-shadow: 0 20px 50px -12px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05);
              backdrop-filter: blur(20px);
              -webkit-backdrop-filter: blur(20px);
              color-scheme: light;
            }

            .sd-modal-card.dark-mode {
              --modal-bg: rgba(20, 22, 28, 0.96);
              --modal-border: rgba(255, 255, 255, 0.12);
              --modal-text: #ffffff;
              --modal-muted: #94a3b8;
              --modal-field-bg: #22242a;
              --modal-field-border: rgba(255, 255, 255, 0.14);
              --modal-tab-track: #141518;
              --modal-tab-active-bg: #ffffff;
              --modal-tab-active-text: #0f172a;
              --modal-btn-bg: #ffffff;
              --modal-btn-hover: #f1f5f9;
              --modal-btn-text: #0f172a;
              --modal-shadow: 0 24px 60px -12px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(20px);
              -webkit-backdrop-filter: blur(20px);
              color-scheme: dark;
            }

            .sd-action-btn:hover {
              opacity: 0.92;
              transform: translateY(-1px);
            }
          `}</style>

          {/* Ambient Glow Aura */}
          <div
            style={{
              position: 'absolute',
              width: '420px',
              height: '420px',
              borderRadius: '50%',
              background: isDarkMode
                ? 'radial-gradient(circle, rgba(16, 185, 129, 0.18) 0%, rgba(6, 182, 212, 0.08) 45%, transparent 70%)'
                : 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, rgba(6, 182, 212, 0.06) 45%, transparent 70%)',
              filter: 'blur(40px)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />

          <motion.div
            key="sd-modal-content"
            className={`sd-modal-card ${isDarkMode ? 'dark-mode' : 'light-mode'}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="sd-modal-title"
            initial={{ opacity: 0, scale: 0.88, y: 28, filter: 'blur(6px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.94, y: 16, filter: 'blur(4px)', transition: { duration: 0.16, ease: [0.32, 0, 0.67, 0] } }}
            transition={{ type: 'spring', damping: 25, stiffness: 350, mass: 0.85 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '420px',
              width: '100%',
              background: 'var(--modal-bg)',
              border: '0.5px solid var(--modal-border)',
              borderRadius: '20px',
              boxShadow: 'var(--modal-shadow)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              color: 'var(--modal-text)',
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif",
              zIndex: 1,
            }}
          >
            {/* Identity Row: avatar + name + status | shortcut & close button */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '18px 20px 10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)',
                  }}
                >
                  <Cpu size={14} />
                </div>
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--modal-text)', lineHeight: 1.2 }}>
                    Sujith Thota
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#22c55e', fontWeight: '600', lineHeight: 1.2 }}>
                    Diagnostics · nominal
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '10px',
                    fontFamily: 'monospace',
                    fontWeight: '600',
                    padding: '2px 6px',
                    borderRadius: '5px',
                    background: 'var(--modal-field-bg)',
                    border: '1px solid var(--modal-field-border)',
                    color: 'var(--modal-muted)',
                  }}
                >
                  Ctrl+D
                </span>
                <motion.button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  whileHover={{ scale: 1.15, rotate: 90 }}
                  whileTap={{ scale: 0.88 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 400 }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--modal-muted)',
                    cursor: 'pointer',
                    padding: 0,
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                  }}
                >
                  <X size={17} />
                </motion.button>
              </div>
            </div>

            {/* Heading + Subtitle, centered */}
            <div style={{ textAlign: 'center', padding: '0 20px 14px' }}>
              <h3
                id="sd-modal-title"
                style={{
                  fontSize: '22px',
                  fontWeight: '700',
                  color: 'var(--modal-text)',
                  margin: '0 0 4px',
                  letterSpacing: '-0.02em',
                }}
              >
                System diagnostics
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--modal-muted)', margin: '0 0 14px' }}>
                Realtime client runtime, memory &amp; telemetry
              </p>

              {/* Status pills row, centered */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '11px',
                    fontWeight: '600',
                    padding: '3px 9px',
                    borderRadius: '99px',
                    background: 'rgba(34, 197, 94, 0.15)',
                    color: '#22c55e',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                  }}
                >
                  <Zap size={11} />
                  <span>{fps} FPS live</span>
                </span>

                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '11px',
                    fontWeight: '600',
                    padding: '3px 9px',
                    borderRadius: '99px',
                    background: 'var(--modal-field-bg)',
                    color: 'var(--modal-text)',
                    border: '1px solid var(--modal-border)',
                  }}
                >
                  <Wifi size={11} />
                  <span>{latency != null ? `${latency}ms ping` : 'Optimal'}</span>
                </span>

                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '11px',
                    fontWeight: '600',
                    padding: '3px 9px',
                    borderRadius: '99px',
                    background: 'rgba(59, 130, 246, 0.15)',
                    color: '#3b82f6',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                  }}
                >
                  <Gauge size={11} />
                  <span>{BUILD_VERSION} pass</span>
                </span>
              </div>
            </div>

            {/* Pill tabs switcher */}
            <div
              style={{
                display: 'flex',
                padding: '3px',
                background: 'var(--modal-tab-track)',
                border: '1px solid var(--modal-border)',
                borderRadius: '99px',
                margin: '0 20px 14px',
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTab('metrics')}
                style={{
                  flex: 1,
                  border: 'none',
                  background: activeTab === 'metrics' ? 'var(--modal-tab-active-bg)' : 'transparent',
                  color: activeTab === 'metrics' ? 'var(--modal-tab-active-text)' : 'var(--modal-muted)',
                  padding: '7px 12px',
                  borderRadius: '99px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: activeTab === 'metrics' ? '0 1px 3px rgba(0,0,0,0.15)' : 'none',
                }}
              >
                <Gauge size={13} />
                <span>Live Metrics</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('env')}
                style={{
                  flex: 1,
                  border: 'none',
                  background: activeTab === 'env' ? 'var(--modal-tab-active-bg)' : 'transparent',
                  color: activeTab === 'env' ? 'var(--modal-tab-active-text)' : 'var(--modal-muted)',
                  padding: '7px 12px',
                  borderRadius: '99px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: activeTab === 'env' ? '0 1px 3px rgba(0,0,0,0.15)' : 'none',
                }}
              >
                <SlidersHorizontal size={13} />
                <span>Environment</span>
              </button>
            </div>

            {/* Main Content Area */}
            <div style={{ padding: '0 20px 16px' }}>
              {activeTab === 'metrics' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* 4 Metric Tiles Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    <div
                      style={{
                        padding: '10px 8px',
                        background: 'var(--modal-field-bg)',
                        border: '1px solid var(--modal-field-border)',
                        borderRadius: '8px',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '10.5px', color: 'var(--modal-muted)', marginBottom: '3px' }}>
                        Uptime
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: '700', fontFamily: 'monospace', color: 'var(--modal-text)' }}>
                        {uptime}s
                      </div>
                    </div>

                    <div
                      style={{
                        padding: '10px 8px',
                        background: 'var(--modal-field-bg)',
                        border: '1px solid var(--modal-field-border)',
                        borderRadius: '8px',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '10.5px', color: 'var(--modal-muted)', marginBottom: '3px' }}>
                        FPS
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: '700', fontFamily: 'monospace', color: fps >= 55 ? '#22c55e' : '#f59e0b' }}>
                        {fps}
                      </div>
                    </div>

                    <div
                      style={{
                        padding: '10px 8px',
                        background: 'var(--modal-field-bg)',
                        border: '1px solid var(--modal-field-border)',
                        borderRadius: '8px',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '10.5px', color: 'var(--modal-muted)', marginBottom: '3px' }}>
                        Memory
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: '700', fontFamily: 'monospace', color: 'var(--modal-text)' }}>
                        {memory != null ? `${memory.toFixed(1)}M` : '—'}
                      </div>
                    </div>

                    <div
                      style={{
                        padding: '10px 8px',
                        background: 'var(--modal-field-bg)',
                        border: '1px solid var(--modal-field-border)',
                        borderRadius: '8px',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '10.5px', color: 'var(--modal-muted)', marginBottom: '3px' }}>
                        Requests
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: '700', fontFamily: 'monospace', color: 'var(--modal-text)' }}>
                        {requestCount}
                      </div>
                    </div>
                  </div>

                  {/* Latency + Build 2-column card */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div
                      style={{
                        padding: '10px 12px',
                        background: 'var(--modal-field-bg)',
                        border: '1px solid var(--modal-field-border)',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--modal-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Wifi size={12} /> Latency
                        </span>
                        <span style={{ fontSize: '12px', fontWeight: '700', fontFamily: 'monospace', color: '#22c55e' }}>
                          {latency != null ? `${latency}ms` : '—'}
                        </span>
                      </div>
                      <div style={{ height: '4px', width: '100%', borderRadius: '99px', background: 'var(--modal-tab-track)', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            borderRadius: '99px',
                            background: '#22c55e',
                            width: `${latencyPercent}%`,
                            transition: 'width 0.3s ease',
                          }}
                        />
                      </div>
                    </div>

                    <div
                      style={{
                        padding: '10px 12px',
                        background: 'var(--modal-field-bg)',
                        border: '1px solid var(--modal-field-border)',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--modal-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Gauge size={12} /> Engine
                        </span>
                        <span
                          style={{
                            fontSize: '9.5px',
                            fontWeight: '700',
                            padding: '1px 5px',
                            borderRadius: '4px',
                            background: 'rgba(34, 197, 94, 0.15)',
                            color: '#22c55e',
                          }}
                        >
                          PASS
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: '700', fontFamily: 'monospace', color: 'var(--modal-text)' }}>
                        {BUILD_VERSION}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Core Stack List */}
                  <div
                    style={{
                      padding: '12px 14px',
                      background: 'var(--modal-field-bg)',
                      border: '1px solid var(--modal-field-border)',
                      borderRadius: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--modal-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        Core Framework Stack
                      </span>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '10px',
                          fontWeight: '700',
                          padding: '2px 7px',
                          borderRadius: '99px',
                          background: 'rgba(34, 197, 94, 0.15)',
                          border: '1px solid rgba(34, 197, 94, 0.3)',
                          color: '#22c55e',
                        }}
                      >
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#22c55e' }} />
                        Live
                      </span>
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '6px',
                      width: '100%',
                    }}>
                      {CORE_STACK.map((tech) => (
                        <div
                          key={tech.name}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            padding: '5px 4px',
                            borderRadius: '6px',
                            background: 'var(--modal-bg)',
                            border: '1px solid var(--modal-border)',
                            fontSize: '10.5px',
                            fontWeight: '600',
                            color: 'var(--modal-text)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <span>{tech.name}</span>
                          <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--modal-muted)' }}>
                            {tech.version}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Runtime Details */}
                  <div
                    style={{
                      padding: '12px 14px',
                      background: 'var(--modal-field-bg)',
                      border: '1px solid var(--modal-field-border)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--modal-muted)' }}>Theme Mode:</span>
                      <span style={{ fontWeight: '600', color: 'var(--modal-text)' }}>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--modal-muted)' }}>Runtime JS Heap:</span>
                      <span style={{ fontFamily: 'monospace', fontWeight: '600', color: 'var(--modal-text)' }}>{memory != null ? `${memory.toFixed(2)} MB` : 'Dynamic'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--modal-muted)' }}>Render Thread:</span>
                      <span style={{ fontWeight: '600', color: '#22c55e' }}>60 FPS Hardware-Accelerated</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div style={{ padding: '0 20px 20px' }}>
              <button
                type="button"
                className="sd-action-btn"
                onClick={onClose}
                style={{
                  width: '100%',
                  height: '36px',
                  background: 'var(--modal-btn-bg)',
                  color: 'var(--modal-btn-text)',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}
              >
                <span>Dismiss diagnostics</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Bottom Footer Note */}
            <div
              style={{
                padding: '9px 20px',
                background: 'var(--modal-field-bg)',
                borderTop: '1px solid var(--modal-border)',
                fontSize: '10.5px',
                color: 'var(--modal-muted)',
                textAlign: 'center',
              }}
            >
              Realtime client telemetry · Active session monitor
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
