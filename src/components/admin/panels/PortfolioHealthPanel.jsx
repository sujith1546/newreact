import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Heart, AlertCircle, AlertTriangle, Info, CheckCircle2, ArrowRight, Loader2, RefreshCw, TrendingUp } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

const HISTORY_KEY = 'pcms_health_history';

function getGrade(score) {
  if (score >= 90) return { letter: 'A', color: '#10B981' };
  if (score >= 75) return { letter: 'B', color: '#3B82F6' };
  if (score >= 60) return { letter: 'C', color: '#F59E0B' };
  if (score >= 40) return { letter: 'D', color: '#F97316' };
  return { letter: 'F', color: '#EF4444' };
}

function ScoreGauge({ score, loading }) {
  const { letter, color } = getGrade(score);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ position: 'relative', width: 140, height: 140 }}>
        <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="70" cy="70" r={radius} fill="none" stroke="var(--pcms-line)" strokeWidth={10} />
          {!loading && (
            <motion.circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={10}
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          )}
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          {loading ? (
            <Loader2 size={24} className="spin" style={{ color: 'var(--pcms-accent)' }} />
          ) : (
            <>
              <span style={{ fontSize: 32, fontWeight: 800, color, fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1 }}>{score}</span>
              <span style={{ fontSize: 11, color: 'var(--pcms-muted)', fontWeight: 600 }}>/ 100</span>
            </>
          )}
        </div>
      </div>
      {!loading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ fontSize: 26, fontWeight: 800, color, fontFamily: "'Space Grotesk', sans-serif" }}>Grade {letter}</div>
          <div style={{ fontSize: 12, color: 'var(--pcms-muted)' }}>
            {score >= 90 ? 'Executive Quality' : score >= 75 ? 'Strong Portfolio' : score >= 60 ? 'Needs Attention' : score >= 40 ? 'Incomplete' : 'Critical Deficits'}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PortfolioHealthPanel() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(null);
  const [issues, setIssues] = useState([]);
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); }
    catch { return []; }
  });

  const runAudit = useCallback(async () => {
    setLoading(true);
    const foundIssues = [];

    try {
      const { data: projects } = await supabase.from('projects').select('*');
      if (projects) {
        const noDesc = projects.filter(p => !p.description || p.description.trim().length < 15);
        if (noDesc.length > 0) {
          foundIssues.push({ id: 'no-desc', severity: 'high', title: `${noDesc.length} project(s) missing full descriptions`, detail: `${noDesc.map(p => p.title).slice(0, 3).join(', ')}`, fixTab: 'projects' });
        }
        const noLinks = projects.filter(p => (!p.github_url || p.github_url === '#') && (!p.live_url || p.live_url === '#'));
        if (noLinks.length > 0) {
          foundIssues.push({ id: 'no-links', severity: 'medium', title: `${noLinks.length} project(s) without live link or repo`, detail: 'Recruiters cannot verify working implementations', fixTab: 'projects' });
        }
        const noStack = projects.filter(p => !p.tags || (Array.isArray(p.tags) && p.tags.length === 0));
        if (noStack.length > 0) {
          foundIssues.push({ id: 'no-stack', severity: 'low', title: `${noStack.length} project(s) missing tech stack tags`, detail: 'Keywords help technical recruiter search ranking', fixTab: 'projects' });
        }
      }

      const { count: skillCount } = await supabase.from('skills').select('id', { count: 'exact', head: true });
      if ((skillCount || 0) < 8) {
        foundIssues.push({ id: 'few-skills', severity: 'medium', title: `Only ${skillCount || 0} skills listed`, detail: 'Aim for 10-15 core competencies across languages & frameworks', fixTab: 'skills' });
      }

      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { count: oldUnread } = await supabase.from('contact_messages').select('id', { count: 'exact', head: true }).eq('is_read', false).lt('created_at', sevenDaysAgo);
      if ((oldUnread || 0) > 0) {
        foundIssues.push({ id: 'old-unread', severity: 'high', title: `${oldUnread} unread recruiter message(s) older than 7 days`, detail: 'Prompt response time directly impacts interview conversion', fixTab: 'messages' });
      }

      const { count: certCount } = await supabase.from('certifications').select('id', { count: 'exact', head: true });
      if ((certCount || 0) < 2) {
        foundIssues.push({ id: 'few-certs', severity: 'low', title: `Only ${certCount || 0} certification credential(s)`, detail: 'Cloud and deep learning credentials increase recruiter trust', fixTab: 'certifications' });
      }

      const { data: settings } = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle();
      const resumeUrl = settings?.resume_url || '/resume.pdf';
      if (!resumeUrl) {
        foundIssues.push({ id: 'no-resume', severity: 'high', title: 'Resume PDF URL is unconfigured', detail: 'Primary recruiter call-to-action is non-functional', fixTab: 'settings' });
      }
    } catch (_) {}

    const deductions = foundIssues.reduce((acc, i) => acc + ({ high: 15, medium: 8, low: 3 }[i.severity] || 0), 0);
    const finalScore = Math.max(0, 100 - deductions);

    setScore(finalScore);
    setIssues(foundIssues);

    const newEntry = { score: finalScore, date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), issueCount: foundIssues.length };
    setHistory(prev => {
      const updated = [newEntry, ...prev.filter(p => p.date !== newEntry.date)].slice(0, 5);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });

    setLoading(false);
  }, []);

  useEffect(() => { runAudit(); }, []);

  const highIssues = issues.filter(i => i.severity === 'high');
  const medIssues = issues.filter(i => i.severity === 'medium');
  const lowIssues = issues.filter(i => i.severity === 'low');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #10B981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Heart size={18} color="#fff" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--pcms-text)', fontFamily: "'Space Grotesk', sans-serif" }}>Portfolio Health & Audit</h2>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--pcms-muted)' }}>Automated quality audit engine with direct resolution shortcuts</p>
          </div>
        </div>
        <button
          type="button"
          onClick={runAudit}
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: loading ? 'var(--pcms-line)' : '#10B981', color: '#fff', border: 'none', fontSize: 12, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? <><Loader2 size={13} className="spin" /> Auditing...</> : <><RefreshCw size={13} /> Re-run Full Audit</>}
        </button>
      </div>

      {/* Hero row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="pcms-panel-card"
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 22, gap: 12 }}>
          <ScoreGauge score={score ?? 100} loading={loading} />
          {!loading && score !== null && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: 'var(--pcms-muted)' }}>
                {issues.length === 0 ? '✅ All checks passed! Exceptional portfolio completeness.' : `${issues.length} audit item${issues.length > 1 ? 's' : ''} detected — ${highIssues.length} high priority`}
              </div>
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="pcms-panel-card">
          <div className="pcms-panel-header">
            <div className="pcms-panel-title-row">
              <div className="pcms-panel-icon" style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B' }}><AlertTriangle size={15} /></div>
              <div><div className="pcms-panel-title">Audit Breakdown</div></div>
            </div>
          </div>
          <div className="pcms-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {[
              { label: 'Critical / High Priority', count: highIssues.length, color: '#EF4444', icon: AlertCircle },
              { label: 'Medium Priority Recommendations', count: medIssues.length, color: '#F59E0B', icon: AlertTriangle },
              { label: 'Low Severity Enhancements', count: lowIssues.length, color: '#8896B3', icon: Info },
              { label: 'Optimal Verified Criteria', count: Math.max(0, 6 - issues.length), color: '#10B981', icon: CheckCircle2 },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 8, background: 'var(--pcms-panel-2)', border: '1px solid var(--pcms-line-soft)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <s.icon size={14} color={s.color} />
                  <span style={{ fontSize: 12, color: 'var(--pcms-text)', fontWeight: 500 }}>{s.label}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 800, color: s.color }}>{loading ? '—' : s.count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Issues list */}
      {!loading && issues.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="pcms-panel-card">
          <div className="pcms-panel-header">
            <div className="pcms-panel-title-row">
              <div className="pcms-panel-icon" style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444' }}><AlertCircle size={15} /></div>
              <div>
                <div className="pcms-panel-title">Actionable Findings</div>
                <div className="pcms-panel-subtitle">Click resolve to navigate directly to the editor</div>
              </div>
            </div>
          </div>
          <div className="pcms-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...highIssues, ...medIssues, ...lowIssues].map(issue => {
              const { color } = { high: { color: '#EF4444' }, medium: { color: '#F59E0B' }, low: { color: '#8896B3' } }[issue.severity];
              const IssueIcon = issue.severity === 'high' ? AlertCircle : issue.severity === 'medium' ? AlertTriangle : Info;
              return (
                <div key={issue.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 10, background: `${color}08`, border: `1px solid ${color}25`, gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, minWidth: 0 }}>
                    <IssueIcon size={15} color={color} style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--pcms-text)' }}>{issue.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--pcms-muted)', marginTop: 2 }}>{issue.detail}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/admin/dashboard/${issue.fixTab}`)}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 7, background: color, color: '#fff', border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}
                  >
                    Resolve <ArrowRight size={11} />
                  </button>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* History */}
      {history.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="pcms-panel-card">
          <div className="pcms-panel-header">
            <div className="pcms-panel-title-row">
              <div className="pcms-panel-icon" style={{ background: 'rgba(99,102,241,0.12)', color: '#6366F1' }}><TrendingUp size={15} /></div>
              <div>
                <div className="pcms-panel-title">Audit Score History</div>
                <div className="pcms-panel-subtitle">Score trajectory across recent audits</div>
              </div>
            </div>
          </div>
          <div className="pcms-panel-body">
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 65 }}>
              {history.slice().reverse().map((h, i) => {
                const { color } = getGrade(h.score);
                const heightPct = (h.score / 100) * 100;
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color }}>{h.score}</span>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPct}%` }}
                      transition={{ duration: 0.6, delay: i * 0.1 }}
                      style={{ width: '100%', background: `linear-gradient(180deg, ${color}, ${color}80)`, borderRadius: '4px 4px 0 0', minHeight: 4 }}
                    />
                    <span style={{ fontSize: 9, color: 'var(--pcms-muted)', textAlign: 'center' }}>{h.date}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
