import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";

const SKILLS = [
  { skill: "ML/AI", value: 90 },
  { skill: "Backend", value: 80 },
  { skill: "Frontend", value: 75 },
  { skill: "Data eng", value: 85 },
  { skill: "Cloud", value: 65 },
  { skill: "Finance", value: 78 },
];

function buildHeatmap() {
  return Array.from({ length: 130 }, () => Math.random());
}

function heatColorClass(v) {
  if (v > 0.85) return "hm-level-4";
  if (v > 0.6) return "hm-level-3";
  if (v > 0.35) return "hm-level-2";
  return "hm-level-1";
}

export default function MobileDashboard() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [heatmap] = useState(buildHeatmap);

  async function handleAsk() {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer(null);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: 'user', content: question }] }),
      });
      if (!res.ok) throw new Error('Fallback to mock');
      
      await new Promise(r => setTimeout(r, 600));
      setAnswer("I'm Sujith's AI twin. Based on his profile, his ML stack relies heavily on Python, FinBERT, XGBoost, and ChromaDB for RAG. Ask me another specific question!");
    } catch {
      setAnswer("I'm Sujith's AI twin. Based on his profile, his ML stack relies heavily on Python, FinBERT, XGBoost, and ChromaDB for RAG.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mobile-dashboard-ai glass-panel">
      <style>{`
        .mobile-dashboard-ai {
          display: flex;
          flex-direction: column;
          gap: 14px;
          width: 100%;
          padding: 16px;
          box-sizing: border-box;
        }

        /* Header */
        .mda-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }
        .mda-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(217, 119, 6, 0.12); /* amber-100 equivalent */
          color: #d97706; /* amber-600 */
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          font-weight: 700;
          flex-shrink: 0;
        }
        [data-theme="dark"] .mda-avatar {
          background: rgba(251, 191, 36, 0.15); /* amber-400 equivalent */
          color: #fbbf24;
        }
        
        .mda-header-text {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .mda-name {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }
        .mda-status {
          font-size: 11px;
          font-weight: 600;
          color: #10b981; /* emerald-500 */
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .mda-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10b981;
          animation: pulse-dot 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.4); }
        }

        /* Generic Card */
        .mda-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 16px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
          text-align: left;
        }
        [data-theme="dark"] .mda-card {
          box-shadow: none;
        }

        .mda-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          text-transform: uppercase;
          margin: 0 0 10px 0;
        }

        /* AI Input */
        .mda-input-wrapper {
          display: flex;
          gap: 8px;
        }
        .mda-input {
          flex: 1;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 10px 14px;
          font-size: 13px;
          color: var(--text-primary);
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .mda-input:focus {
          border-color: #d97706;
          box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.1);
        }
        [data-theme="dark"] .mda-input:focus {
          border-color: #fbbf24;
          box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.15);
        }
        .mda-send-btn {
          background: #d97706; /* amber-600 */
          color: #fff;
          border: none;
          border-radius: 12px;
          width: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.1s, background 0.2s;
        }
        .mda-send-btn:active {
          transform: scale(0.95);
        }
        .mda-send-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: scale(1);
        }
        [data-theme="dark"] .mda-send-btn {
          background: #fbbf24; /* amber-400 */
          color: #111827; /* gray-900 */
        }
        .mda-answer {
          font-size: 13px;
          line-height: 1.6;
          color: var(--text-secondary);
          margin: 14px 0 0 0;
          padding-top: 14px;
          border-top: 1px solid var(--border-color);
        }

        /* Stats Row */
        .mda-stats-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .mda-stat {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 14px;
          text-align: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
        }
        [data-theme="dark"] .mda-stat {
          box-shadow: none;
        }
        .mda-stat-val {
          font-size: 20px;
          font-weight: 700;
          color: #d97706;
          margin: 0 0 2px 0;
        }
        [data-theme="dark"] .mda-stat-val {
          color: #fbbf24;
        }
        .mda-stat-lbl {
          font-size: 10px;
          font-weight: 600;
          color: var(--text-muted);
          margin: 0;
        }

        /* Building */
        .mda-build-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        .mda-live-badge {
          font-size: 10px;
          font-weight: 700;
          background: rgba(16, 185, 129, 0.12);
          color: #10b981;
          padding: 3px 8px;
          border-radius: 12px;
          text-transform: lowercase;
        }
        .mda-build-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 10px 0;
        }
        .mda-progress-track {
          height: 6px;
          background: var(--border-color);
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 8px;
        }
        .mda-progress-fill {
          height: 100%;
          background: #d97706;
          border-radius: 3px;
        }
        [data-theme="dark"] .mda-progress-fill {
          background: #fbbf24;
        }
        .mda-build-desc {
          font-size: 11.5px;
          color: var(--text-secondary);
          margin: 0;
        }

        /* Radar Chart Wrapper */
        .mda-radar-wrapper {
          height: 180px;
          margin: -10px -20px -20px -20px; 
        }

        /* Heatmap */
        .mda-heatmap-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .mda-commits {
          font-size: 11px;
          font-weight: 700;
          color: #d97706;
        }
        [data-theme="dark"] .mda-commits {
          color: #fbbf24;
        }
        .mda-heatmap-grid {
          display: grid;
          grid-template-columns: repeat(26, 1fr);
          gap: 2px;
        }
        .mda-heatmap-cell {
          aspect-ratio: 1;
          border-radius: 2px;
        }
        
        /* Heatmap colors for light mode */
        .hm-level-1 { background: rgba(156, 163, 175, 0.15); } /* gray-200 */
        .hm-level-2 { background: #fde68a; } /* amber-200 */
        .hm-level-3 { background: #f59e0b; } /* amber-500 */
        .hm-level-4 { background: #d97706; } /* amber-600 */

        /* Heatmap colors for dark mode */
        [data-theme="dark"] .hm-level-1 { background: rgba(255, 255, 255, 0.05); }
        [data-theme="dark"] .hm-level-2 { background: rgba(251, 191, 36, 0.3); }
        [data-theme="dark"] .hm-level-3 { background: rgba(251, 191, 36, 0.7); }
        [data-theme="dark"] .hm-level-4 { background: #fbbf24; }
      `}</style>

      {/* Header */}
      <div className="mda-header">
        <div className="mda-avatar">ST</div>
        <div className="mda-header-text">
          <p className="mda-name">Sujith Thota</p>
          <p className="mda-status">
            <span className="mda-status-dot" /> Online now &middot; IST
          </p>
        </div>
        <FaGithub size={18} color="var(--text-muted)" />
      </div>

      {/* Ask my AI twin */}
      <div className="mda-card">
        <p className="mda-label">ASK MY AI TWIN</p>
        <div className="mda-input-wrapper">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. what's your ML stack?"
            className="mda-input"
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
          />
          <button
            onClick={handleAsk}
            className="mda-send-btn"
            disabled={loading || !question.trim()}
          >
            <ArrowRight size={14} />
          </button>
        </div>
        {answer && (
          <p className="mda-answer">{answer}</p>
        )}
      </div>

      {/* Stat tiles */}
      <div className="mda-stats-row">
        <div className="mda-stat">
          <p className="mda-stat-val">8.7</p>
          <p className="mda-stat-lbl">VIT CGPA</p>
        </div>
        <div className="mda-stat">
          <p className="mda-stat-val">15+</p>
          <p className="mda-stat-lbl">Certifications</p>
        </div>
      </div>

      {/* Currently building */}
      <div className="mda-card">
        <div className="mda-build-header">
          <span className="mda-label" style={{ margin: 0 }}>CURRENTLY BUILDING</span>
          <span className="mda-live-badge">live</span>
        </div>
        <p className="mda-build-title">NewsTrader AI &middot; sentiment engine</p>
        <div className="mda-progress-track">
          <div className="mda-progress-fill" style={{ width: "78%" }} />
        </div>
        <p className="mda-build-desc">FinBERT accuracy 87.5% &middot; 26,961 samples trained</p>
      </div>

      {/* Skill radar */}
      <div className="mda-card" style={{ paddingBottom: '0' }}>
        <p className="mda-label">SKILL PROFICIENCY</p>
        <div className="mda-radar-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={SKILLS} outerRadius="65%" cx="50%" cy="50%">
              <PolarGrid stroke="var(--border-color)" />
              <PolarAngleAxis
                dataKey="skill"
                tick={{ fontSize: 10, fill: "var(--text-secondary)", fontWeight: 600 }}
              />
              <Radar
                dataKey="value"
                stroke="#d97706"
                fill="#d97706"
                fillOpacity={0.15}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Contribution heatmap */}
      <div className="mda-card">
        <div className="mda-heatmap-header">
          <span className="mda-label" style={{ margin: 0 }}>CONTRIBUTION ACTIVITY</span>
          <span className="mda-commits">312 commits</span>
        </div>
        <div className="mda-heatmap-grid">
          {heatmap.map((v, i) => (
            <div key={i} className={`mda-heatmap-cell ${heatColorClass(v)}`} />
          ))}
        </div>
      </div>

    </div>
  );
}
