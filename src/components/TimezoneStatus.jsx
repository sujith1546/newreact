import React, { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import DiagnosticsToggle from './DiagnosticsToggle';
import DarkModeToggle from './DarkModeToggle';
import SettingsDropdown from './SettingsDropdown';

export default function TimezoneStatus() {
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
      
      // If the user is already in India, we can just say they are in IST
      if (tz === 'Asia/Calcutta' || tz === 'Asia/Kolkata') {
        setIsIST(true);
      }
      
      // Format city name nicely
      const city = tz.split('/').pop().replace(/_/g, ' ');
      setVisitorCity(city);

      // Get abbreviation (e.g. EDT)
      const date = new Date();
      const formatter = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'short' });
      const parts = formatter.formatToParts(date);
      const tzName = parts.find(p => p.type === 'timeZoneName')?.value || '';
      setVisitorTzAbbr(tzName);

      // Convert 9:30 AM to 11:30 PM IST to Local Time
      const getLocalTimeForIST = (hours, minutes) => {
        const now = new Date();
        const options = { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' };
        const istDateString = new Intl.DateTimeFormat('en-US', options).format(now);
        const [month, day, year] = istDateString.split('/');
        
        // Construct ISO string assuming it's in IST (+05:30)
        const isoString = `${year}-${month}-${day}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00+05:30`;
        const dateObj = new Date(isoString);
        
        return new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit', hour12: true }).format(dateObj);
      };

      setLocalStart(getLocalTimeForIST(9, 30)); // 9:30 AM IST
      setLocalEnd(getLocalTimeForIST(23, 30));  // 11:30 PM IST

      // Check if currently awake
      const checkAwake = () => {
        try {
          const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Kolkata',
            hour: 'numeric',
            minute: 'numeric',
            hour12: false
          });
          const parts = formatter.formatToParts(new Date());
          const currentHours = parseInt(parts.find(p => p.type === 'hour').value, 10);
          const currentMinutes = parseInt(parts.find(p => p.type === 'minute').value, 10);
          const timeInMinutes = currentHours * 60 + currentMinutes;
          
          const startMinutes = 9 * 60 + 30; // 570 (9:30 AM)
          const endMinutes = 23 * 60 + 30;  // 1410 (11:30 PM)
          
          setIsAwake(timeInMinutes >= startMinutes && timeInMinutes <= endMinutes);
        } catch (err) {
          console.error("Failed to parse IST time:", err);
          setIsAwake(true); // fallback to true
        }
      };

      checkAwake();
      const interval = setInterval(checkAwake, 60000);
      return () => clearInterval(interval);
    } catch (e) {
      console.error("Timezone logic failed", e);
    }
  }, []);

  return (
    <>
      <style>{`
        .timezone-status-wrapper {
          position: fixed;
          top: 20px;
          right: 28px;
          z-index: 2000;
          display: flex;
          align-items: center;
          gap: 8px;
        }



        .cmdk-hint-pill {
          height: 34px;
          border-radius: 17px;
          background: rgba(243, 244, 246, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(0, 0, 0, 0.1);
          box-shadow: 0 4px 15px rgba(0,0,0,0.08);
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 0 10px;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.3s ease;
        }

        [data-theme="dark"] .cmdk-hint-pill {
          background: rgba(30, 30, 30, 0.5);
          border-color: rgba(255,255,255,0.08);
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }

        .cmdk-hint-pill:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
          border-color: #3b82f6;
        }
        [data-theme="dark"] .cmdk-hint-pill:hover {
          box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        }

        .cmdk-hint-kbd {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 10px;
          font-weight: 700;
          color: var(--text-primary);
          background: rgba(128, 128, 128, 0.12);
          border-radius: 4px;
          min-width: 18px;
          width: auto;
          padding: 0 5px;
          height: 18px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
        }

        .timezone-pill {
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
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary);
          transition: all 0.3s ease;
        }

        [data-theme="dark"] .timezone-pill {
          background: rgba(30, 30, 30, 0.5);
          border-color: rgba(255,255,255,0.08);
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }

        .timezone-pill:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }
        [data-theme="dark"] .timezone-pill:hover {
          box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }
        .status-dot.awake {
          background-color: #16a34a;
          box-shadow: 0 0 8px rgba(22, 163, 74, 0.4);
          animation: dotPulse 2s infinite;
        }

        @keyframes dotPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.5); }
          50% { box-shadow: 0 0 0 4px rgba(22, 163, 74, 0); }
        }

        .tz-globe-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #16a34a;
          transition: color 0.3s ease;
        }
        .tz-globe-icon.sleeping {
          color: #9ca3af;
        }
        .tz-globe-icon.awake {
          animation: globeSpin 6s linear infinite;
        }
        @keyframes globeSpin {
          0%   { transform: rotate(0deg) scale(1);    }
          25%  { transform: rotate(0deg) scale(1.12); }
          50%  { transform: rotate(0deg) scale(1);    }
          75%  { transform: rotate(0deg) scale(1.08); }
          100% { transform: rotate(0deg) scale(1);    }
        }

        .timezone-card {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          width: 340px;
          background: var(--bg-secondary, #ffffff);
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.15);
          border: 1px solid var(--border-color, rgba(128,128,128,0.2));
          opacity: 0;
          visibility: hidden;
          transform: translateY(-10px);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          text-align: left;
        }
        [data-theme="dark"] .timezone-card {
          box-shadow: 0 12px 40px rgba(0,0,0,0.5);
        }

        .timezone-pill-container {
          position: relative;
        }

        .timezone-pill-container:hover .timezone-card {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .tc-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 16px;
          font-size: 16px;
        }
        .tc-header svg {
          color: #16a34a;
        }
        .tc-location {
          font-size: 14.5px;
          color: var(--text-secondary);
          margin-bottom: 6px;
        }
        .tc-location strong {
          color: var(--text-primary);
          font-weight: 600;
        }
        .tc-availability {
          font-size: 14.5px;
          color: var(--text-secondary);
          margin-bottom: 16px;
        }
        .tc-availability strong {
          color: var(--text-primary);
          font-weight: 600;
        }
        .tc-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 500;
        }
        .tc-status.awake { color: #16a34a; }
        .tc-status.sleeping { color: #6b7280; }
        

      `}</style>

      <div className="timezone-status-wrapper">
        <DiagnosticsToggle />
        
        <button 
          className="cmdk-hint-pill"
          onClick={() => window.dispatchEvent(new CustomEvent("toggle-command-palette"))}
          title="Open Command Palette (Ctrl+K)"
        >
          <span className="cmdk-hint-kbd">Ctrl</span>
          <span className="cmdk-hint-kbd">K</span>
        </button>

        <div className="timezone-pill-container">
          <div className="timezone-pill">
            <div className={`status-dot ${isAwake ? 'awake' : 'sleeping'}`}></div>
            <span className={`tz-globe-icon ${isAwake ? 'awake' : 'sleeping'}`}>
              <Globe size={15} strokeWidth={2.5} />
            </span>
            <span>{isAwake ? 'Available' : 'Away'}</span>
          </div>

          <div className="timezone-card">
            <div className="tc-header">
              <Globe size={18} strokeWidth={2.5} />
              <span>Best time to reach me</span>
            </div>
            
            <div className="tc-location">
              You're in <strong>{visitorCity} {visitorTzAbbr ? `(${visitorTzAbbr})` : ''}</strong>
            </div>
            
            <div className="tc-availability">
              {isIST ? (
                <span>I'm usually online <strong>9:30 AM – 11:30 PM</strong> IST</span>
              ) : (
                <span>I'm usually online <strong>{localStart} – {localEnd}</strong> your time</span>
              )}
            </div>
            
            <div className={`tc-status ${isAwake ? 'awake' : 'sleeping'}`}>
              <div className={`status-dot ${isAwake ? 'awake' : 'sleeping'}`}></div>
              <span>{isAwake ? 'Likely awake right now' : 'Might be sleeping right now'}</span>
            </div>
          </div>
        </div>

        <DarkModeToggle />
        <SettingsDropdown />
      </div>
    </>
  );
}
