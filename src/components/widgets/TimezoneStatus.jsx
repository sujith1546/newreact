import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DarkModeToggle from '../ui/DarkModeToggle';
import SettingsDropdown from '../ui/SettingsDropdown';
import UpdatesDropdown from './UpdatesDropdown';
import { useSupabasePresence } from '../../hooks/useSupabasePresence';

export default function TimezoneStatus() {
  const { visitorCount, isConnected } = useSupabasePresence();
  const [visitorCity, setVisitorCity] = useState('');
  const [visitorTzAbbr, setVisitorTzAbbr] = useState('');
  const [localStart, setLocalStart] = useState('');
  const [localEnd, setLocalEnd] = useState('');
  const [isAwake, setIsAwake] = useState(true);
  const [isIST, setIsIST] = useState(false);

  useEffect(() => {
    try {
      // 1. Get timezone ID (e.g. America/New_York)
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const isInd = tz === 'Asia/Kolkata' || tz === 'Asia/Calcutta';
      setIsIST(isInd);

      // Extract city approximation from timezone ID
      const parts = tz.split('/');
      const rawCity = parts[parts.length - 1].replace(/_/g, ' ');
      setVisitorCity(rawCity);

      // 2. Format current time in user's timezone to get short abbreviation
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZoneName: 'short',
        timeZone: tz,
      });
      const tzPart = formatter.formatToParts(now).find((p) => p.type === 'timeZoneName');
      setVisitorTzAbbr(tzPart ? tzPart.value : '');

      // 3. Calculate visitor's current local time range string (e.g. "2:00 PM - 3:00 PM")
      const hour = now.getHours();

      // Check if visitor is awake (assume awake between 7:00 AM and 11:00 PM)
      setIsAwake(hour >= 7 && hour < 23);

      const formatHour = (h) => {
        const period = h >= 12 ? 'PM' : 'AM';
        const displayH = h % 12 === 0 ? 12 : h % 12;
        return `${displayH}:00 ${period}`;
      };

      setLocalStart(formatHour(hour));
      setLocalEnd(formatHour((hour + 1) % 24));
    } catch {
      setVisitorCity('Your Location');
      setVisitorTzAbbr('Local');
    }
  }, []);

  return (
    <>
      <style>{`
        .tz-status-bar {
          position: fixed;
          top: 18px;
          right: 28px;
          z-index: 1900;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 6px 14px;
          border-radius: 100px;
          background: var(--bg-secondary, rgba(255, 255, 255, 0.7));
          border: 1px solid var(--border-color, rgba(128, 128, 128, 0.15));
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          user-select: none;
        }

        [data-theme="dark"] .tz-status-bar {
          background: rgba(18, 18, 18, 0.65);
          border-color: rgba(255, 255, 255, 0.08);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }

        .tz-status-bar:hover {
          border-color: rgba(139, 92, 246, 0.3);
          box-shadow: 0 6px 24px rgba(139, 92, 246, 0.12);
        }

        /* Online presence pill */
        .online-presence-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 3px 8px;
          border-radius: 100px;
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.25);
          font-size: 11px;
          font-weight: 600;
          color: #16a34a;
        }

        [data-theme="dark"] .online-presence-pill {
          background: rgba(34, 197, 94, 0.12);
          border-color: rgba(34, 197, 94, 0.3);
          color: #4ade80;
        }

        .online-presence-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 8px #22c55e;
          position: relative;
          flex-shrink: 0;
        }

        .online-presence-dot::after {
          content: '';
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          background: rgba(34, 197, 94, 0.4);
          animation: tz-dot-pulse 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        @keyframes tz-dot-pulse {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(2.4); opacity: 0; }
        }

        .online-presence-count {
          font-weight: 700;
          font-variant-numeric: tabular-nums;
        }

        .online-presence-label {
          font-size: 11px;
          opacity: 0.85;
          white-space: nowrap;
        }

        /* Pulsing indicator */
        .tz-indicator-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 8px;
          height: 8px;
          flex-shrink: 0;
        }

        .tz-indicator-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 10px rgba(34, 197, 94, 0.6);
        }

        .tz-indicator-dot.sleeping {
          background: #f59e0b;
          box-shadow: 0 0 10px rgba(245, 158, 11, 0.6);
        }

        .tz-indicator-ping {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: #22c55e;
          opacity: 0.75;
          animation: tz-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        .tz-indicator-dot.sleeping + .tz-indicator-ping {
          background: #f59e0b;
        }

        @keyframes tz-ping {
          75%, 100% {
            transform: scale(2.4);
            opacity: 0;
          }
        }

        /* Text styling */
        .tz-info-group {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          font-weight: 500;
          color: var(--text-secondary, #475569);
          white-space: nowrap;
        }

        [data-theme="dark"] .tz-info-group {
          color: #cbd5e1;
        }

        .tz-city-name {
          font-weight: 600;
          color: var(--text-primary, #0f172a);
        }

        [data-theme="dark"] .tz-city-name {
          color: #f8fafc;
        }

        .tz-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 1px 6px;
          border-radius: 100px;
          background: var(--bg-tertiary, rgba(0, 0, 0, 0.04));
          border: 1px solid var(--border-color, rgba(0, 0, 0, 0.06));
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.02em;
          color: var(--text-secondary, #64748b);
        }

        [data-theme="dark"] .tz-badge {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.08);
          color: #94a3b8;
        }

        .tz-divider {
          width: 1px;
          height: 12px;
          background: var(--border-color, rgba(128, 128, 128, 0.2));
          flex-shrink: 0;
        }

        .cmdk-hint-pill {
          display: flex;
          align-items: center;
          gap: 3px;
          padding: 4px 8px;
          border-radius: 8px;
          background: var(--bg-tertiary, rgba(0, 0, 0, 0.04));
          border: 1px solid var(--border-color, rgba(0, 0, 0, 0.08));
          color: var(--text-muted, #64748b);
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          outline: none;
        }

        [data-theme="dark"] .cmdk-hint-pill {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.08);
          color: #94a3b8;
        }

        .cmdk-hint-pill:hover {
          border-color: rgba(139, 92, 246, 0.4);
          color: #8b5cf6;
          background: rgba(139, 92, 246, 0.06);
          transform: translateY(-1px);
        }

        .cmdk-hint-kbd {
          font-family: inherit;
          font-size: 10px;
          font-weight: 700;
        }

        @media (max-width: 768px) {
          .tz-info-group .tz-time-details,
          .tz-divider {
            display: none;
          }
          .cmdk-hint-pill {
            display: none;
          }
        }
      `}</style>

      <div className="tz-status-bar" role="status" aria-label="Location and time status">
        {/* Status Dot */}
        <div className="tz-indicator-wrapper" title={isAwake ? "Sujith is awake and active" : "Sujith is away / sleeping"}>
          <div className={`tz-indicator-dot ${!isAwake ? 'sleeping' : ''}`} />
          <div className="tz-indicator-ping" />
        </div>

        {/* Location & Time Info */}
        <div className="tz-info-group">
          <span className="tz-city-name">{visitorCity || 'India'}</span>

          {visitorTzAbbr && (
            <span className="tz-badge">
              {visitorTzAbbr}
            </span>
          )}

          {isIST && (
            <span className="tz-badge" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', borderColor: 'rgba(139, 92, 246, 0.2)' }}>
              Same Timezone
            </span>
          )}

          {localStart && localEnd && (
            <span className="tz-time-details" style={{ opacity: 0.8 }}>
              • {localStart} - {localEnd}
            </span>
          )}
        </div>

        <div className="tz-divider" />

        {/* Live Visitor Count Pill */}
        <div className="online-presence-pill" title={`${visitorCount || 1} active live visitor session(s)`}>
          <div className="online-presence-dot" />
          <div style={{ display: 'inline-flex', overflow: 'hidden', height: '16px', alignItems: 'center' }}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={visitorCount || 1}
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -12, opacity: 0 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="online-presence-count"
              >
                {visitorCount && visitorCount > 0 ? visitorCount : 1}
              </motion.span>
            </AnimatePresence>
          </div>
          <span className="online-presence-label">
            {visitorCount === 1 ? 'active session' : 'active sessions'}
          </span>
        </div>

        <button 
          className="cmdk-hint-pill"
          onClick={() => window.dispatchEvent(new CustomEvent("toggle-command-palette"))}
          title="Open Command Palette (Ctrl+K)"
        >
          <span className="cmdk-hint-kbd">Ctrl</span>
          <span className="cmdk-hint-kbd">K</span>
        </button>

        <UpdatesDropdown />

        <DarkModeToggle />
        <SettingsDropdown />
      </div>
    </>
  );
}
