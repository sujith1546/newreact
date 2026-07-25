import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Loader2 } from 'lucide-react';
import { styles, MODAL_STYLES } from '../shared/constants';
import { PanelCard, EmptyState, StatCard } from '../shared/components';

export default function CopilotPanel() {
  const [jdText,       setJdText]       = useState('');
  const [matchResult,  setMatchResult]  = useState(null);
  const [bulletInput,  setBulletInput]  = useState('');
  const [bulletOutput, setBulletOutput] = useState('');
  const [bulletStyle,  setBulletStyle]  = useState('engineer');
  const [analyzing,    setAnalyzing]    = useState(false);
  const [skills,       setSkills]       = useState([]);
  const [copied,       setCopied]       = useState(false);

  useEffect(() => {
    supabase.from('skills').select('name').then(({ data }) => {
      if (data) setSkills(data.map(s => s.name.toLowerCase()));
    });
  }, []);

  const BULLET_TEMPLATES = {
    engineer: (t) => `• Engineered and deployed ${t}, achieving a 40% improvement in system throughput and a 25% reduction in p99 latency across distributed production workloads.`,
    led:      (t) => `• Led cross-functional initiative involving ${t}, collaborating with 5+ stakeholders to deliver on-time with zero critical defects — improving team velocity by 30%.`,
    built:    (t) => `• Architected and shipped ${t} from scratch, adopted by 200+ users within the first sprint and reducing manual effort by 60% through intelligent automation.`,
    improved: (t) => `• Optimized ${t} pipeline using data-driven profiling, cutting processing time from 8s to 1.2s and saving ~120 compute-hours per month at scale.`,
  };

  const handleRunAtsCheck = async () => {
    if (!jdText.trim()) return alert('Paste a job description first.');
    setAnalyzing(true);
    await new Promise(r => setTimeout(r, 600)); // simulated processing
    const jdWords  = jdText.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    const matched  = skills.filter(s => jdWords.includes(s));
    const missing  = skills.filter(s => !jdWords.includes(s));
    const raw      = matched.length / Math.max(1, skills.length);
    const score    = Math.min(97, Math.max(42, Math.round(raw * 60 + 40)));
    setMatchResult({ score, matched, missing: missing.slice(0, 8) });
    logAuditEvent('RUN_ATS_CHECK', 'copilot', 'ats_matcher', { score });
    setAnalyzing(false);
  };

  const handleEnhanceBullet = () => {
    if (!bulletInput.trim()) return;
    setBulletOutput(BULLET_TEMPLATES[bulletStyle](bulletInput.trim()));
    logAuditEvent('ENHANCE_BULLET', 'copilot', bulletStyle, { original: bulletInput });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(bulletOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scoreColor = matchResult ? (matchResult.score >= 75 ? '#28a745' : matchResult.score >= 55 ? '#ff9800' : '#ef4444') : '#007bff';

  return (
    <PanelCard title="AI Copilot & ATS Resume Builder">
      <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* Resume generator hero */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
          padding: 20, borderRadius: 14, background: 'linear-gradient(135deg, #007bff 0%, #6366f1 100%)', color: '#fff' }}>
          <div>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 800, letterSpacing: -0.4 }}>1-Click PDF Resume Generator</p>
            <p style={{ margin: '4px 0 0', fontSize: 12.5, opacity: 0.88 }}>Pulls live data from Supabase — ATS-optimised, beautifully formatted.</p>
          </div>
          <button onClick={() => window.open('/resume-preview', '_blank')}
            style={{ flexShrink: 0, background: '#fff', color: '#007bff', border: 'none', padding: '10px 20px', borderRadius: 22, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, fontSize: 13 }}>
            <Printer size={15} /> Open Builder
          </button>
        </div>

        {/* ATS Matcher */}
        <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 14, padding: '20px 22px' }}>
          <p style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChart3 size={16} color="#007bff" /> ATS Job Description Matcher
          </p>
          <textarea
            className="admin-input"
            style={{ minHeight: 110, resize: 'vertical', lineHeight: 1.6, marginBottom: 12 }}
            placeholder="Paste the full job description here — e.g. Senior ML Engineer requirements, required frameworks…"
            value={jdText}
            onChange={e => setJdText(e.target.value)}
          />
          <button onClick={handleRunAtsCheck} disabled={analyzing} className="admin-action-btn" style={{ width: '100%', justifyContent: 'center' }}>
            {analyzing ? <Loader2 className="spin" size={14} /> : <Sparkles size={14} />}
            {analyzing ? 'Analyzing…' : 'Run ATS Compatibility Analysis'}
          </button>

          {matchResult && (
            <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Score ring */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '16px 18px', background: 'var(--card-bg)', border: `2px solid ${scoreColor}22`, borderRadius: 12 }}>
                <div style={{ width: 70, height: 70, borderRadius: '50%', border: `5px solid ${scoreColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 22, fontWeight: 900, color: scoreColor }}>{matchResult.score}%</span>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>ATS Match Score</p>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                    {matchResult.score >= 75 ? '✅ Strong match — highlight these skills prominently.'
                      : matchResult.score >= 55 ? '⚠️ Moderate match — add missing keywords to descriptions.'
                      : '❌ Weak match — significantly update your project descriptions.'}
                  </p>
                </div>
              </div>

              {/* Matched skills */}
              {matchResult.matched.length > 0 && (
                <div>
                  <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: '#28a745', textTransform: 'uppercase', letterSpacing: '0.5px' }}>✅ Matched Skills ({matchResult.matched.length})</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {matchResult.matched.map(s => (
                      <span key={s} className="admin-badge" style={{ background: '#28a74518', color: '#28a745', border: '1px solid #28a74530', textTransform: 'capitalize' }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing skills */}
              {matchResult.missing.length > 0 && (
                <div>
                  <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.5px' }}>⚠️ Missing Keywords ({matchResult.missing.length})</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {matchResult.missing.map(s => (
                      <span key={s} className="admin-badge" style={{ background: '#ef444418', color: '#ef4444', border: '1px solid #ef444430', textTransform: 'capitalize' }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bullet Enhancer */}
        <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 14, padding: '20px 22px' }}>
          <p style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Zap size={16} color="#ff9800" /> AI Bullet Point Enhancer
          </p>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            {Object.keys(BULLET_TEMPLATES).map(t => (
              <button key={t} onClick={() => setBulletStyle(t)}
                className={`admin-action-btn${bulletStyle === t ? '' : ' secondary'}`}
                style={{ padding: '5px 14px', fontSize: 12, borderRadius: 20 }}>
                {t.charAt(0).toUpperCase()+t.slice(1)}
              </button>
            ))}
          </div>
          <input
            className="admin-input"
            type="text"
            placeholder="Draft bullet: e.g. 'Built REST API for project management'"
            value={bulletInput}
            onChange={e => setBulletInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleEnhanceBullet()}
            style={{ marginBottom: 10 }}
          />
          <button onClick={handleEnhanceBullet} className="admin-action-btn secondary" style={{ width: '100%', justifyContent: 'center', borderRadius: 20 }}>
            <Sparkles size={13} /> Enhance with AI Template
          </button>
          {bulletOutput && (
            <div style={{ marginTop: 14, padding: '14px 16px', background: '#007bff08', border: '1.5px dashed #007bff60', borderRadius: 10, position: 'relative' }}>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.7, fontStyle: 'italic' }}>{bulletOutput}</p>
              <button onClick={handleCopy}
                style={{ marginTop: 10, background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)', padding: '4px 12px', borderRadius: 20, fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
          )}
        </div>

      </div>
    </PanelCard>
  );
}

/* -------------------------------------------------------------------- */
/* 3. Asset Manager & Image Cloud Storage Browser                       */
/* -------------------------------------------------------------------- */
/* ───────────────────────────────────────────────
   ASSET MANAGER
   ─────────────────────────────────────────────── */
/* -------------------------------------------------------------------- */
/* ───────────────────────────────────────────────
   THEME STUDIO
   ─────────────────────────────────────────────── */
/* -------------------------------------------------------------------- */
/* ───────────────────────────────────────────────
   BACKUP & RESTORE
   ─────────────────────────────────────────────── */
