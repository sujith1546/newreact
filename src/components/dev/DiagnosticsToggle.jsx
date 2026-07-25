import { useState } from 'react';
import { Activity } from 'lucide-react';
import SystemDiagnostics from './SystemDiagnostics';

export default function DiagnosticsToggle() {
  const [isHudOpen, setIsHudOpen] = useState(false);

  return (
    <>
      <style>{`
        /* ── wrapper holds the button + ping ring together ── */
        .diag-toggle-wrap {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-right: 14px;
        }

        /* ── expanding ping ring ── */
        .diag-ping-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 1.5px solid rgba(59, 130, 246, 0.55);
          animation: diagPing 2.4s ease-out infinite;
          pointer-events: none;
        }

        @keyframes diagPing {
          0%   { transform: scale(1);    opacity: 0.7; }
          70%  { transform: scale(1.75); opacity: 0;   }
          100% { transform: scale(1.75); opacity: 0;   }
        }

        /* ── icon heartbeat ── */
        @keyframes diagHeartbeat {
          0%   { transform: scale(1);    }
          14%  { transform: scale(1.28); }
          28%  { transform: scale(1);    }
          42%  { transform: scale(1.16); }
          56%  { transform: scale(1);    }
          100% { transform: scale(1);    }
        }

        .diag-icon-beat {
          animation: diagHeartbeat 2.4s ease-in-out infinite;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* ── button base ── */
        .diag-toggle-btn {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: rgba(243, 244, 246, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(0, 0, 0, 0.1);
          box-shadow: 0 4px 15px rgba(0,0,0,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 2000;
          color: var(--text-primary);
          transition: all 0.3s ease;
          padding: 0;
          outline: none;
          position: relative;
        }

        [data-theme="dark"] .diag-toggle-btn {
          background: rgba(30, 30, 30, 0.5);
          border-color: rgba(255,255,255,0.08);
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          color: #e2e8f0;
        }

        .diag-toggle-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(59,130,246,0.22);
          border-color: rgba(59,130,246,0.4);
          color: var(--primary-blue);
        }

        [data-theme="dark"] .diag-toggle-btn:hover {
          box-shadow: 0 8px 25px rgba(59,130,246,0.3);
          border-color: rgba(59,130,246,0.35);
          color: var(--primary-blue);
        }

        /* pause beat animation while modal is open */
        .diag-toggle-btn.active .diag-icon-beat,
        .diag-toggle-btn.active ~ .diag-ping-ring {
          animation-play-state: paused;
        }
      `}</style>

      <div className="diag-toggle-wrap">
        {/* outward ping ring — sits behind the button */}
        <span className="diag-ping-ring" aria-hidden="true" />

        <button
          className={`diag-toggle-btn${isHudOpen ? ' active' : ''}`}
          onClick={() => setIsHudOpen(true)}
          title="System Diagnostics & Stats"
          aria-label="View system status diagnostics"
        >
          <span className="diag-icon-beat">
            <Activity size={16} strokeWidth={2.2} />
          </span>
        </button>
      </div>

      <SystemDiagnostics open={isHudOpen} onClose={() => setIsHudOpen(false)} />
    </>
  );
}
