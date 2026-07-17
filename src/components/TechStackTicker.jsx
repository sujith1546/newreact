import React from 'react';
import { Code2, Database, Terminal, Cpu, Layout, Layers, Activity } from 'lucide-react';

export default function TechStackTicker() {
  const techItems = [
    { icon: <Code2 size={13} strokeWidth={2.5} />, name: "React", version: "v18.2" },
    { icon: <Cpu size={13} strokeWidth={2.5} />, name: "Vite", version: "v6.0" },
    { icon: <Database size={13} strokeWidth={2.5} />, name: "Python", version: "v3.11" },
    { icon: <Terminal size={13} strokeWidth={2.5} />, name: "Node.js", version: "v20 LTS" },
    { icon: <Layers size={13} strokeWidth={2.5} />, name: "Framer", version: "Motion" },
    { icon: <Layout size={13} strokeWidth={2.5} />, name: "Tailwind", version: "v3.4" },
  ];

  return (
    <>
      <style>{`
        .tech-ticker-container {
          width: 100%; /* Fill the modal card */
          height: 38px;
          border-radius: 8px;
          background: rgba(128, 128, 128, 0.04);
          border: 1px solid rgba(128, 128, 128, 0.08);
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
          overflow: hidden;
          position: relative;
          display: flex;
          align-items: center;
          margin-top: 8px;
          transition: all 0.3s ease;
        }

        [data-theme="dark"] .tech-ticker-container {
          background: rgba(255, 255, 255, 0.02);
          border-color: rgba(255, 255, 255, 0.04);
          box-shadow: inset 0 1px 1px rgba(0,0,0,0.2);
        }

        .tech-ticker-container:hover {
          background: rgba(128, 128, 128, 0.08);
          border-color: rgba(59, 130, 246, 0.2);
        }

        [data-theme="dark"] .tech-ticker-container:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(59, 130, 246, 0.3);
        }

        /* Deep fade edge on the right */
        .tech-ticker-container::after {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          width: 40px;
          z-index: 2;
          pointer-events: none;
        }

        .tech-ticker-container::after {
          right: 0;
          background: linear-gradient(to left, var(--bg-primary) 10%, transparent);
        }

        [data-theme="dark"] .tech-ticker-container::after {
          background: linear-gradient(to left, var(--bg-primary) 10%, transparent);
        }

        .tech-ticker-track {
          display: flex;
          align-items: center;
          gap: 24px;
          width: max-content;
        }

        .tech-ticker-container:hover .tech-ticker-track {
          animation-play-state: paused;
        }

        /* LTR scrolling */
        .tech-ticker-track.ltr {
          animation: tickerScrollLtr 32s linear infinite;
        }
        
        @keyframes tickerScrollLtr {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }

        .tech-ticker-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 4px 10px;
          border-radius: 6px;
          transition: all 0.25s ease;
          cursor: default;
        }
        
        .tech-ticker-item svg {
          color: var(--primary-blue);
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        /* Hover interactions: Dim others, glow hovered */
        .tech-ticker-track:hover .tech-ticker-item {
          opacity: 0.4;
          filter: grayscale(100%);
        }
        .tech-ticker-track .tech-ticker-item:hover {
          opacity: 1;
          filter: grayscale(0%);
          background: rgba(59, 130, 246, 0.1);
          color: var(--text-primary);
          transform: translateY(-1px);
        }
        .tech-ticker-track .tech-ticker-item:hover svg {
          transform: scale(1.2) rotate(-5deg);
        }

        .tech-version {
          font-family: "SF Mono", "JetBrains Mono", monospace;
          font-size: 9px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 4px;
          background: rgba(128,128,128,0.15);
          color: var(--text-secondary);
          margin-left: 2px;
        }

        .tech-live-badge {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          color: #10b981;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          background: #000000;
          padding: 0 12px;
          border-right: 1px solid rgba(255, 255, 255, 0.15);
        }
        .tech-live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 8px #10b981;
          animation: livePulse 1.5s ease-in-out infinite;
        }
        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }


      `}</style>

      <div className="tech-ticker-container" title="Interactive Tech Stack">
        
        {/* Fixed left badge */}
        <div className="tech-live-badge">
          <div className="tech-live-dot" /> LIVE
        </div>

        <div className="tech-ticker-track ltr">
          {/* Render list twice for seamless endless scroll */}
          {techItems.map((item, i) => (
            <div key={`first-${i}`} className="tech-ticker-item">
              {item.icon} {item.name}
              <span className="tech-version">{item.version}</span>
            </div>
          ))}
          {techItems.map((item, i) => (
            <div key={`second-${i}`} className="tech-ticker-item">
              {item.icon} {item.name}
              <span className="tech-version">{item.version}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

