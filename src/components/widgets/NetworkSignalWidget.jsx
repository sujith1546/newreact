import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Activity, RefreshCw, Zap, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function NetworkSignalWidget() {
  const { theme } = useTheme();
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [latency, setLatency] = useState(null); // in ms
  const [pingQuality, setPingQuality] = useState('good'); // 'good' | 'fair' | 'poor' | 'offline'
  const [connectionInfo, setConnectionInfo] = useState({ effectiveType: '4g', downlink: null, rtt: null });
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isPinging, setIsPinging] = useState(false);

  // Measure Ping Latency
  const checkPing = async () => {
    if (!navigator.onLine) {
      setIsOnline(false);
      setPingQuality('offline');
      setLatency(null);
      return;
    }

    setIsPinging(true);
    const start = performance.now();
    try {
      // Fetch tiny asset with cache busting to measure actual round-trip time
      await fetch(`/manifest.webmanifest?t=${Date.now()}`, {
        method: 'HEAD',
        cache: 'no-store',
      });
      const end = performance.now();
      const rtt = Math.round(end - start);
      setLatency(rtt);
      setIsOnline(true);

      if (rtt < 120) {
        setPingQuality('good');
      } else if (rtt < 300) {
        setPingQuality('fair');
      } else {
        setPingQuality('poor');
      }
    } catch (err) {
      // If fetch fails but navigator is online, try fallback check
      console.warn('Network ping check error:', err);
      setIsOnline(navigator.onLine);
      setPingQuality(navigator.onLine ? 'fair' : 'offline');
    } finally {
      setIsPinging(false);
    }
  };

  // Listen to Network State and API
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      checkPing();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setPingQuality('offline');
      setLatency(null);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial ping
    checkPing();

    // Periodic ping every 12 seconds
    const interval = setInterval(checkPing, 12000);

    // Network Information API if supported
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn) {
      const updateConnInfo = () => {
        setConnectionInfo({
          effectiveType: conn.effectiveType || '4g',
          downlink: conn.downlink || null,
          rtt: conn.rtt || null,
        });
      };
      updateConnInfo();
      conn.addEventListener('change', updateConnInfo);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        clearInterval(interval);
        conn.removeEventListener('change', updateConnInfo);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  // Determine indicator colors
  const getQualityColor = () => {
    if (!isOnline || pingQuality === 'offline') return '#ef4444'; // Red
    if (pingQuality === 'poor') return '#f59e0b'; // Amber
    if (pingQuality === 'fair') return '#3b82f6'; // Blue
    return '#10b981'; // Green
  };

  const statusColor = getQualityColor();

  return (
    <div 
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
      onMouseLeave={() => setIsPopoverOpen(false)}
    >
      <style>{`
        .net-signal-pill {
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
          padding: 0 10px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-primary);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          user-select: none;
        }

        [data-theme="dark"] .net-signal-pill {
          background: rgba(30, 30, 30, 0.5);
          border-color: rgba(255,255,255,0.08);
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }

        .net-signal-pill:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.12);
        }

        .net-pulse-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
          transition: background-color 0.3s ease;
        }
      `}</style>

      {/* Top Bar Signal Pill */}
      <motion.button
        type="button"
        className="net-signal-pill"
        onClick={() => {
          setIsPopoverOpen((prev) => !prev);
          checkPing();
        }}
        onMouseEnter={() => setIsPopoverOpen(true)}
        whileTap={{ scale: 0.96 }}
        title={`Network Status: ${isOnline ? 'Online' : 'Offline'}${latency ? ` (${latency}ms)` : ''}`}
        aria-label="Network connection status"
        style={{
          borderColor: isPopoverOpen ? statusColor : undefined,
        }}
      >
        {!isOnline ? (
          <WifiOff size={14} color="#ef4444" style={{ animation: 'bounce 1.5s infinite' }} />
        ) : (
          <Wifi size={14} color={statusColor} />
        )}

        <span className="net-pulse-dot" style={{ backgroundColor: statusColor, boxShadow: `0 0 8px ${statusColor}` }} />

        <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>
          {!isOnline ? (
            <span style={{ color: '#ef4444' }}>Offline</span>
          ) : latency !== null ? (
            `${latency}ms`
          ) : (
            'Online'
          )}
        </span>
      </motion.button>

      {/* Interactive Diagnostics Popover */}
      <AnimatePresence>
        {isPopoverOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'absolute',
              top: '42px',
              right: 0,
              width: '230px',
              background: 'var(--bg-secondary, rgba(20, 20, 20, 0.95))',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid var(--border-color, rgba(255,255,255,0.12))',
              borderRadius: '14px',
              padding: '14px',
              boxShadow: '0 16px 36px rgba(0,0,0,0.25), inset 0 1px 1px rgba(255,255,255,0.1)',
              zIndex: 9999,
              color: 'var(--text-primary)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid rgba(128,128,128,0.15)', paddingBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700 }}>
                <Activity size={15} color={statusColor} />
                <span>Network Signal</span>
              </div>

              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  checkPing();
                }}
                whileTap={{ rotate: 180 }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="Refresh network ping"
              >
                <RefreshCw size={13} className={isPinging ? 'spin' : ''} />
              </motion.button>
            </div>

            {/* Metrics List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
                <span style={{ fontWeight: 700, color: statusColor, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {isOnline ? <ShieldCheck size={13} /> : <AlertTriangle size={13} />}
                  {isOnline ? 'Connected' : 'Disconnected'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Latency:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {latency !== null ? `${latency} ms` : 'N/A'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Network:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                  {connectionInfo.effectiveType || 'Broadband'}
                </span>
              </div>

              {connectionInfo.downlink && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Speed (Est.):</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {connectionInfo.downlink} Mbps
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Quality:</span>
                <span style={{ 
                  fontWeight: 600, 
                  fontSize: '11px',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: `${statusColor}20`,
                  color: statusColor,
                  textTransform: 'capitalize'
                }}>
                  {pingQuality}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
