import React from 'react';
import { Settings } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function SettingsDropdown() {
  const { theme } = useTheme();

  return (
    <div className="settings-trigger-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
      <style>{`
        .settings-trigger-wrapper {
          position: relative;
          display: inline-block;
          flex-shrink: 0;
        }

        .settings-trigger-btn {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border-color, rgba(128,128,128,0.2));
          background: var(--bg-secondary, rgba(255,255,255,0.85));
          color: var(--text-primary, #0f172a);
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.08);
          outline: none;
        }
        [data-theme="dark"] .settings-trigger-btn {
          background: rgba(30, 30, 30, 0.5);
          border-color: rgba(255,255,255,0.08);
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        .settings-trigger-btn:hover {
          border-color: rgba(139, 92, 246, 0.4);
          box-shadow: 0 6px 20px rgba(139, 92, 246, 0.2);
          transform: translateY(-1px);
          color: #8b5cf6;
        }
        .settings-trigger-btn:hover svg {
          transform: rotate(90deg);
        }
        .settings-trigger-btn svg {
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .settings-trigger-btn:active {
          transform: translateY(0);
        }
      `}</style>

      <button
        onClick={() => window.dispatchEvent(new CustomEvent('open-all-settings'))}
        className="settings-trigger-btn"
        aria-label="Preferences & Settings"
        title="Preferences & Settings"
      >
        <Settings size={18} />
      </button>
    </div>
  );
}
