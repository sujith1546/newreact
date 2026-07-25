import React, { useEffect, useState } from 'react';
import { useMaintenanceStatus } from '../components/MaintenanceMode';
import '../styles/maintenance.css';

export default function Maintenance({ status: propStatus }) {
  const fetchedStatus = useMaintenanceStatus();
  const status = propStatus || fetchedStatus;

  const [now, setNow] = useState(Date.now());
  const [reloadScheduled, setReloadScheduled] = useState(false);

  // Time tracking
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const startedAt = status.enabledAt ? new Date(status.enabledAt).getTime() : Date.now();
  const totalMs = (status.etaMinutes || 20) * 60 * 1000;
  const targetAt = startedAt + totalMs;

  const elapsed = Math.max(0, now - startedAt);
  const remaining = Math.max(0, targetAt - now);
  
  const rawPct = (elapsed / totalMs) * 100;
  const pct = Math.min(100, Math.max(0, rawPct));
  const rounded = Math.round(pct);

  let stage = 0;
  if (pct < 15) stage = 0;
  else if (pct < 55) stage = 1;
  else if (pct < 90) stage = 2;
  else if (pct < 100) stage = 3;
  else stage = 4;

  useEffect(() => {
    if (remaining <= 0 && !reloadScheduled) {
      setReloadScheduled(true);
      setTimeout(() => window.location.reload(), 4000);
    }
  }, [remaining, reloadScheduled]);

  const fmtTime = (ms) => {
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${m < 10 ? '0' : ''}${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const fmtRemaining = (ms) => {
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    if (m <= 0) return sec + 's';
    return `${m} min ${sec < 10 ? '0' : ''}${sec}s`;
  };

  let etaLabel = '—';
  if (startedAt) {
    etaLabel = new Date(targetAt).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  const nodes = [
    { x: 40, label: 'Build' },
    { x: 175, label: 'Deploy' },
    { x: 310, label: 'Cache' },
    { x: 420, label: 'Live' }
  ];
  const y = 60;

  return (
    <div className="maint-body">
      <div className="maint-sidebar">
        <div className="maint-avatar">ST</div>
        <p className="maint-side-name">Sujith Thota</p>
        <p className="maint-side-loc">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>
          Vellore, India
        </p>

        <div className="maint-nav">
          <div className="maint-nav-item">Home</div>
          <div className="maint-nav-item">About</div>
          <div className="maint-nav-item">Skills</div>
          <div className="maint-nav-item">Projects</div>
          <div className="maint-nav-item">Education</div>
          <div className="maint-nav-item">Experience</div>
          <div className="maint-nav-item">Certifications</div>
          <div className="maint-nav-item">Contact</div>
        </div>

        <div className="maint-side-footer">
          <div className="maint-side-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
            Deploy status
          </div>
          <div className="maint-side-note">Last checked just now<br />© 2026 All rights reserved Sujith</div>
        </div>
      </div>

      <div className="maint-main">
        <div className="maint-topbar">
          <div className="maint-top-pill"><span className="maint-dot"></span>Deploying</div>
          <div className="maint-top-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
          </div>
        </div>

        <div className="maint-grid">
          <div>
            <div className={remaining <= 0 ? "maint-badge maint-late" : "maint-badge"}>
              <span className="maint-bdot"></span>
              {remaining <= 0 ? 'Almost there' : 'Scheduled maintenance'}
            </div>

            <p className="maint-eyebrow">One moment</p>
            <h1 className="maint-h1">The site is<br />being updated.</h1>

            <div className="maint-tag">
              <span className="maint-chev">&gt;_</span> <span>Maintenance mode active</span><span className="maint-cursor"></span>
            </div>

            <p className="maint-desc">
              {status.message || "Pushing a new version live — the old one's taken down so nothing loads half-finished."}
              <br />If it's urgent, reach me directly below.
            </p>
            
            {remaining <= 0 ? (
              <p className="maint-countdown-line">Finishing up — <b>should be live now</b></p>
            ) : (
              <p className="maint-countdown-line">Back online in <b>~{fmtRemaining(remaining)}</b> · by <b>{etaLabel}</b></p>
            )}

            <div className="maint-cards">
              <div className="maint-mini-card">
                <div className="maint-mini-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 18l6-6-6-6M8 6l-6 6 6 6" /></svg></div>
                <div className="maint-mini-label">Build</div>
                <div className={stage >= 1 ? "maint-mini-sub maint-done" : "maint-mini-sub"}>{stage >= 1 ? 'complete' : 'in progress'}</div>
              </div>
              <div className="maint-mini-card">
                <div className="maint-mini-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="10" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg></div>
                <div className="maint-mini-label">Deploy</div>
                <div className={stage >= 2 ? "maint-mini-sub maint-done" : (stage === 1 ? "maint-mini-sub maint-active" : "maint-mini-sub")}>{stage >= 2 ? 'complete' : (stage === 1 ? 'in progress' : 'pending')}</div>
              </div>
              <div className="maint-mini-card">
                <div className="maint-mini-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" /></svg></div>
                <div className="maint-mini-label">Contact me</div>
                <div className="maint-mini-sub">sujithreddy1546@gmail.com</div>
              </div>
            </div>

            <div className="maint-footer-row">
              <div>
                <div className="maint-flabel">Need me sooner</div>
                <a href="mailto:sujithreddy1546@gmail.com">sujithreddy1546@gmail.com</a>
              </div>
              <div className="maint-eta-block">
                <div className="maint-flabel">Back online by</div>
                <div className="maint-eta-val">{etaLabel}</div>
              </div>
            </div>
          </div>

          <div className="maint-visual-panel">
            <div className="maint-vp-head">
              <span className="maint-vp-title">Deploy pipeline</span>
              <span className="maint-vp-live"><span className="maint-ld"></span>run #live</span>
            </div>

            <svg className="maint-pipeline" viewBox="0 0 460 150">
              {nodes.slice(0, 3).map((n, i) => {
                const x1 = n.x;
                const x2 = nodes[i + 1].x;
                const activeIdx = Math.min(4, stage + 1);
                const done = i < activeIdx;
                const color = done ? '#22c55e' : '#e6e6e4';
                return <line key={`line-${i}`} x1={x1} y1={y} x2={x2} y2={y} stroke={color} strokeWidth="2" />;
              })}
              
              {nodes.map((n, j) => {
                const activeIdx = Math.min(4, stage + 1);
                const st = j < activeIdx ? 'done' : (j === activeIdx ? 'active' : 'pending');
                const fill = st === 'done' ? '#e9f9ef' : (st === 'active' ? '#eaf1fe' : '#ffffff');
                const stroke = st === 'done' ? '#22c55e' : (st === 'active' ? '#2f6fed' : '#d8d8d5');
                const textColor = st === 'pending' ? '#a3a39e' : '#161616';
                
                return (
                  <g key={`node-${j}`}>
                    <circle cx={n.x} cy={y} r="16" fill={fill} stroke={stroke} strokeWidth="2" />
                    {st === 'done' && (
                      <path d={`M${n.x - 6} ${y} l4 4 l8 -9`} fill="none" stroke="#22c55e" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                    )}
                    {st === 'active' && (
                      <circle cx={n.x} cy={y} r="4.5" fill="#2f6fed">
                        <animate attributeName="opacity" values="1;0.3;1" dur="1.4s" repeatCount="indefinite" />
                      </circle>
                    )}
                    {st === 'pending' && (
                      <circle cx={n.x} cy={y} r="4.5" fill="#d8d8d5" />
                    )}
                    <text x={n.x} y={y + 34} textAnchor="middle" fontFamily="Inter" fontSize="12" fontWeight="500" fill={textColor}>{n.label}</text>
                  </g>
                );
              })}
            </svg>

            <div className="maint-stat-grid">
              <div className="maint-stat-card">
                <div className="maint-stat-label">Progress</div>
                <div className="maint-stat-val maint-blue">{rounded}%</div>
              </div>
              <div className="maint-stat-card">
                <div className="maint-stat-label">Elapsed</div>
                <div className="maint-stat-val">{fmtTime(elapsed)}</div>
              </div>
            </div>

            <div className="maint-region-list">
              <div className="maint-region-row">
                <span className="maint-region-name"><span className="maint-rd maint-green"></span>API — Mumbai</span>
                <span className="maint-region-lat">42ms</span>
              </div>
              <div className="maint-region-row">
                <span className="maint-region-name"><span className="maint-rd maint-green"></span>Database — Supabase</span>
                <span className="maint-region-lat">18ms</span>
              </div>
              <div className="maint-region-row">
                <span className="maint-region-name"><span className={stage >= 3 ? "maint-rd maint-green" : "maint-rd maint-blue"}></span>Edge cache — Singapore</span>
                <span className={stage >= 3 ? "maint-region-lat" : "maint-region-lat maint-blue-text"}>{stage >= 3 ? '9ms' : 'warming'}</span>
              </div>
            </div>
            
            {remaining <= 0 && (
              <div className="maint-reload-note">refreshing automatically in a few seconds...</div>
            )}
            
            {remaining > 0 && (
              <div className="maint-reload-note">this page checks its own status automatically — no need to refresh</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
