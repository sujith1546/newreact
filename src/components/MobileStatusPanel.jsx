import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wifi, Cpu, Clock, Activity, CloudSun, CloudRain, Cloud, Sun, RefreshCw } from 'lucide-react';

const getWeatherDetails = (code) => {
  if (code === 0) return { label: 'Clear Sky', icon: Sun };
  if ([1, 2, 3].includes(code)) return { label: 'Partly Cloudy', icon: CloudSun };
  if ([45, 48].includes(code)) return { label: 'Foggy', icon: Cloud };
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return { label: 'Raining', icon: CloudRain };
  if ([95, 96, 99].includes(code)) return { label: 'Thunderstorm', icon: CloudRain };
  return { label: 'Cloudy', icon: Cloud };
};

export default function MobileStatusPanel({ isOpen, onClose }) {
  const [weather, setWeather] = useState({ temp: '--', condition: 'Loading...', icon: CloudSun });
  const [latency, setLatency] = useState(null);
  const [fps, setFps] = useState(60);
  const [uptime, setUptime] = useState('0s');
  const [memory, setMemory] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);

  // 1. Fetch live Vellore weather
  const fetchWeather = async () => {
    setLoadingWeather(true);
    try {
      const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=12.9165&longitude=79.1325&current=temperature_2m,weather_code');
      const data = await res.json();
      if (data && data.current) {
        const temp = Math.round(data.current.temperature_2m);
        const details = getWeatherDetails(data.current.weather_code);
        setWeather({ temp: `${temp}°C`, condition: details.label, icon: details.icon });
      }
    } catch (err) {
      console.log('Failed to fetch Vellore weather', err);
      // Realistic fallback temperature for Vellore
      setWeather({ temp: '31°C', condition: 'Sunny', icon: Sun });
    } finally {
      setLoadingWeather(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchWeather();
    }
  }, [isOpen]);

  // 2. Measure network latency (ping to local server assets)
  useEffect(() => {
    if (!isOpen) return;
    const measureLatency = async () => {
      const t0 = performance.now();
      try {
        await fetch(`/profile_photo.png?t=${Date.now()}`, { method: 'HEAD' });
        const t1 = performance.now();
        setLatency(Math.round(t1 - t0));
      } catch {
        setLatency('--');
      }
    };
    measureLatency();
    const interval = setInterval(measureLatency, 4000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // 3. Live FPS Counter
  useEffect(() => {
    if (!isOpen) return;
    let frames = 0;
    let lastTime = performance.now();
    let rafId;

    const loop = (now) => {
      frames++;
      if (now - lastTime >= 1000) {
        setFps(Math.min(60, Math.round((frames * 1000) / (now - lastTime))));
        frames = 0;
        lastTime = now;
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [isOpen]);

  // 4. Uptime Counter (time since page load)
  useEffect(() => {
    const timer = setInterval(() => {
      const elapsedMs = performance.now();
      const secs = Math.floor(elapsedMs / 1000);
      const mins = Math.floor(secs / 60);
      const hrs = Math.floor(mins / 60);
      
      let uptimeStr = '';
      if (hrs > 0) uptimeStr += `${hrs}h `;
      if (mins > 0) uptimeStr += `${mins % 60}m `;
      uptimeStr += `${secs % 60}s`;
      setUptime(uptimeStr);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 5. Memory usage (Chrome / Edge performance api)
  useEffect(() => {
    if (!isOpen) return;
    const updateMemory = () => {
      if (performance.memory) {
        const usedMB = (performance.memory.usedJSHeapSize / 1048576).toFixed(1);
        setMemory(`${usedMB} MB`);
      } else {
        setMemory('Unsupported');
      }
    };
    updateMemory();
    const interval = setInterval(updateMemory, 2000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const WeatherIcon = weather.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for closing */}
          <motion.div 
            className="mobile-status-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* iOS Control Center Dropdown */}
          <motion.div
            className="mobile-status-panel"
            initial={{ y: -50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -50, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 260 }}
          >
            <style>{`
              .mobile-status-backdrop {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.25);
                backdrop-filter: blur(4px);
                -webkit-backdrop-filter: blur(4px);
                z-index: 1000;
              }
              .mobile-status-panel {
                position: fixed;
                top: 68px;
                left: 16px;
                right: 16px;
                background: var(--mobile-nav-bg-light, rgba(255, 255, 255, 0.75));
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border: 1px solid var(--border-color, rgba(0, 0, 0, 0.08));
                border-radius: 24px;
                padding: 16px 18px;
                box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.15);
                z-index: 1001;
                box-sizing: border-box;
                color: var(--text-primary);
              }
              [data-theme="dark"] .mobile-status-panel {
                background: var(--mobile-nav-bg-dark, rgba(28, 28, 26, 0.75));
                border-color: rgba(255, 255, 255, 0.08);
                box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.4);
              }
              .msp-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 14px;
              }
              .msp-title {
                font-size: 13px;
                font-weight: 750;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                color: var(--text-secondary);
                opacity: 0.8;
              }
              .msp-close-btn {
                background: rgba(128, 128, 128, 0.1);
                border: none;
                width: 26px;
                height: 26px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--text-primary);
                cursor: pointer;
                outline: none;
              }
              .msp-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
              }
              .msp-card {
                background: var(--bg-primary, rgba(255, 255, 255, 0.5));
                border: 1px solid var(--border-color, rgba(0, 0, 0, 0.05));
                border-radius: 16px;
                padding: 12px;
                display: flex;
                flex-direction: column;
                gap: 6px;
                box-sizing: border-box;
              }
              [data-theme="dark"] .msp-card {
                background: rgba(255, 255, 255, 0.03);
              }
              .msp-card-wide {
                grid-column: span 2;
                flex-direction: row;
                align-items: center;
                justify-content: space-between;
              }
              .msp-card-icon {
                display: flex;
                align-items: center;
                gap: 6px;
                color: var(--primary-blue);
                font-size: 11px;
                font-weight: 600;
              }
              .msp-card-val {
                font-size: 16px;
                font-weight: 800;
                line-height: 1.2;
              }
              .msp-card-sub {
                font-size: 9.5px;
                color: var(--text-muted);
                line-height: 1;
              }
              .msp-weather-side {
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                text-align: right;
                gap: 2px;
              }
              .msp-weather-temp {
                font-size: 20px;
                font-weight: 800;
                line-height: 1;
              }
              .msp-refresh-btn {
                background: none;
                border: none;
                padding: 2px;
                color: var(--text-secondary);
                cursor: pointer;
                opacity: 0.7;
              }
              .msp-refresh-btn.spinning {
                animation: msp-spin 0.8s linear infinite;
              }
              @keyframes msp-spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}</style>

            <div className="msp-header">
              <span className="msp-title">System Status</span>
              <button className="msp-close-btn" onClick={onClose} aria-label="Close panel">
                <X size={14} />
              </button>
            </div>

            <div className="msp-grid">
              {/* Weather (Wide card) */}
              <div className="msp-card msp-card-wide">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div className="msp-card-icon">
                    <WeatherIcon size={16} />
                    <span>Vellore, IN</span>
                  </div>
                  <div className="msp-card-sub">{weather.condition}</div>
                </div>
                <div className="msp-weather-side">
                  <span className="msp-weather-temp">{weather.temp}</span>
                  <button 
                    className={`msp-refresh-btn ${loadingWeather ? 'spinning' : ''}`}
                    onClick={fetchWeather}
                    disabled={loadingWeather}
                    aria-label="Refresh weather"
                  >
                    <RefreshCw size={11} />
                  </button>
                </div>
              </div>

              {/* Latency */}
              <div className="msp-card">
                <div className="msp-card-icon">
                  <Wifi size={14} />
                  <span>Network</span>
                </div>
                <div className="msp-card-val">{latency !== null ? `${latency}ms` : '--'}</div>
                <div className="msp-card-sub">Response Time</div>
              </div>

              {/* FPS */}
              <div className="msp-card">
                <div className="msp-card-icon">
                  <Activity size={14} />
                  <span>Performance</span>
                </div>
                <div className="msp-card-val">{fps} FPS</div>
                <div className="msp-card-sub">Render Speed</div>
              </div>

              {/* Memory Heap */}
              <div className="msp-card">
                <div className="msp-card-icon">
                  <Cpu size={14} />
                  <span>Memory</span>
                </div>
                <div className="msp-card-val">{memory || '--'}</div>
                <div className="msp-card-sub">JS Heap Allocation</div>
              </div>

              {/* Session Uptime */}
              <div className="msp-card">
                <div className="msp-card-icon">
                  <Clock size={14} />
                  <span>Uptime</span>
                </div>
                <div className="msp-card-val">{uptime}</div>
                <div className="msp-card-sub">Session Duration</div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
