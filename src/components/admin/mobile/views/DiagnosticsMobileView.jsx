import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertOctagon, AlertTriangle, Info, CheckCircle2, RefreshCw,
  Download, Bug, ShieldCheck, Trash2, ExternalLink,
  ChevronDown, ChevronUp, Terminal, Check
} from 'lucide-react';
import {
  subscribeDiagnostics,
  runComprehensiveDeepScan,
  resolveIssue,
  dismissIssue,
  clearAllIssues,
  simulateTestIssue,
  exportDiagnosticsReport,
  calculateHealthScore
} from '../../../../core/diagnostics/diagnosticsEngine';
import haptic from '../../../../lib/haptics';
import { useNavigate } from 'react-router-dom';

export default function DiagnosticsMobileView() {
  const navigate = useNavigate();
  const [diagState, setDiagState] = useState({
    issues: [],
    isScanning: false,
    scanProgress: 0,
    scanStep: '',
    lastScanTime: null,
  });

  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const unsub = subscribeDiagnostics((state) => {
      setDiagState(state);
    });
    return () => unsub();
  }, []);

  const healthScore = useMemo(() => {
    return calculateHealthScore(diagState.issues);
  }, [diagState.issues]);

  const unresolved = useMemo(() => {
    return diagState.issues.filter((i) => !i.resolved);
  }, [diagState.issues]);

  const counts = useMemo(() => {
    return {
      all: unresolved.length,
      critical: unresolved.filter((i) => i.severity === 'critical' || i.severity === 'error').length,
      warning: unresolved.filter((i) => i.severity === 'warning').length,
      resolved: diagState.issues.filter((i) => i.resolved).length,
    };
  }, [diagState.issues, unresolved]);

  const filteredIssues = useMemo(() => {
    return diagState.issues.filter((issue) => {
      if (activeFilter === 'resolved') return issue.resolved;
      if (issue.resolved) return false;
      if (activeFilter === 'critical') return issue.severity === 'critical' || issue.severity === 'error';
      if (activeFilter === 'warning') return issue.severity === 'warning';
      return true;
    });
  }, [diagState.issues, activeFilter]);

  const handleScan = async () => {
    haptic.medium();
    await runComprehensiveDeepScan();
    haptic.success();
  };

  const handleSimulate = () => {
    haptic.light();
    simulateTestIssue('error');
  };

  const handleResolve = (id, e) => {
    e?.stopPropagation();
    haptic.success();
    resolveIssue(id);
  };

  const handleDismiss = (id, e) => {
    e?.stopPropagation();
    haptic.light();
    dismissIssue(id);
  };

  return (
    <div className="admin-mobile-view" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
      {/* ── Scrollable Feed ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        overscrollBehaviorY: 'bounce',
        padding: '12px 14px 130px',
        gap: 12,
      }}>
        {/* ── Top Health Status Card ── */}
        <div style={{
          padding: '14px 16px',
          borderRadius: 16,
          background: 'var(--bg-secondary, #18191d)',
          border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                System Diagnostics
              </span>
              <span style={{
                fontSize: 9,
                fontWeight: 800,
                color: '#f43f5e',
                background: 'rgba(244,63,94,0.12)',
                border: '1px solid rgba(244,63,94,0.25)',
                padding: '1px 6px',
                borderRadius: 8,
              }}>
                LIVE
              </span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {unresolved.length === 0 ? 'Zero active bugs detected' : `${unresolved.length} active issue(s) flagged`}
            </div>
          </div>

          {/* Health Gauge Pill */}
          <div style={{
            padding: '6px 12px',
            borderRadius: 12,
            background: healthScore >= 85 ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
            border: `1px solid ${healthScore >= 85 ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: healthScore >= 85 ? '#10b981' : '#f59e0b' }}>
              {healthScore}%
            </div>
            <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-muted)' }}>
              HEALTH
            </div>
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div style={{ display: 'flex', gap: 8 }}>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleScan}
            disabled={diagState.isScanning}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 12,
              background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
              border: 'none',
              color: '#ffffff',
              fontSize: 12.5,
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} className={diagState.isScanning ? 'spin' : ''} />
            <span>{diagState.isScanning ? 'Scanning...' : 'Deep Scan'}</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleSimulate}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 12px',
              borderRadius: 12,
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#ef4444',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Bug size={14} />
            <span>Test</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => { haptic.light(); exportDiagnosticsReport(); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 12px',
              borderRadius: 12,
              background: 'var(--bg-secondary, #18191d)',
              border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
              color: 'var(--text-primary)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Download size={14} />
          </motion.button>
        </div>

        {/* ── Scan Progress Indicator ── */}
        {diagState.isScanning && (
          <div style={{
            padding: '10px 12px',
            borderRadius: 12,
            background: 'var(--bg-secondary, #18191d)',
            border: '1px solid var(--border-color)',
            fontSize: 11,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: 4 }}>
              <span>{diagState.scanStep}</span>
              <span style={{ fontWeight: 700, color: '#3b82f6' }}>{diagState.scanProgress}%</span>
            </div>
            <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
              <div style={{ width: `${diagState.scanProgress}%`, height: '100%', background: '#3b82f6', transition: 'width 0.2s' }} />
            </div>
          </div>
        )}

        {/* ── Filter Pills ── */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
          {[
            { key: 'all', label: `Active (${counts.all})` },
            { key: 'critical', label: `Critical (${counts.critical})`, color: '#ef4444' },
            { key: 'warning', label: `Warnings (${counts.warning})`, color: '#f59e0b' },
            { key: 'resolved', label: `Resolved (${counts.resolved})`, color: '#10b981' },
          ].map((pill) => {
            const isActive = activeFilter === pill.key;
            return (
              <button
                key={pill.key}
                type="button"
                onClick={() => { haptic.light(); setActiveFilter(pill.key); }}
                style={{
                  padding: '5px 12px',
                  borderRadius: 16,
                  fontSize: 11,
                  fontWeight: isActive ? 700 : 500,
                  border: isActive ? `1px solid ${pill.color || 'var(--primary-blue, #3b82f6)'}` : '1px solid var(--border-color)',
                  background: isActive ? (pill.color ? `${pill.color}20` : 'var(--bg-secondary)') : 'transparent',
                  color: isActive ? (pill.color || 'var(--text-primary)') : 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                }}
              >
                {pill.label}
              </button>
            );
          })}
        </div>

        {/* ── Issue Cards Feed ── */}
        {filteredIssues.length === 0 ? (
          <div style={{
            padding: '36px 20px',
            borderRadius: 16,
            background: 'var(--bg-secondary, #18191d)',
            border: '1px dashed var(--border-color)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
          }}>
            <ShieldCheck size={32} color="#10b981" />
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
              No Issues Found
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
              All 5 architectural layers are currently passing health checks.
            </div>
          </div>
        ) : (
          filteredIssues.map((issue) => {
            const isExpanded = expandedId === issue.id;
            const sevColor =
              issue.resolved
                ? '#10b981'
                : issue.severity === 'critical'
                ? '#ef4444'
                : issue.severity === 'error'
                ? '#f43f5e'
                : issue.severity === 'warning'
                ? '#f59e0b'
                : '#06b6d4';

            return (
              <motion.div
                key={issue.id}
                layout
                onClick={() => setExpandedId(isExpanded ? null : issue.id)}
                style={{
                  borderRadius: 14,
                  background: 'var(--bg-secondary, #18191d)',
                  border: `1px solid ${issue.resolved ? 'rgba(16,185,129,0.25)' : 'var(--border-color)'}`,
                  overflow: 'hidden',
                  padding: '12px 14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{
                    width: 26,
                    height: 26,
                    borderRadius: 8,
                    background: `${sevColor}15`,
                    border: `1px solid ${sevColor}30`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: sevColor,
                    flexShrink: 0,
                    marginTop: 1,
                  }}>
                    {issue.resolved ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 2 }}>
                      <span style={{
                        fontSize: 12.5,
                        fontWeight: 700,
                        color: issue.resolved ? 'var(--text-muted)' : 'var(--text-primary)',
                        textDecoration: issue.resolved ? 'line-through' : 'none',
                      }}>
                        {issue.title}
                      </span>
                      {(issue.count || 1) > 1 && (
                        <span style={{
                          fontSize: 9,
                          fontWeight: 800,
                          padding: '1px 5px',
                          borderRadius: 8,
                          background: `${sevColor}20`,
                          color: sevColor,
                        }}>
                          {issue.count}x
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {issue.message}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: 9.5,
                        padding: '1px 6px',
                        borderRadius: 6,
                        background: 'rgba(255,255,255,0.06)',
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        fontWeight: 700,
                      }}>
                        {issue.type}
                      </span>

                      {issue.fixTab && !issue.resolved && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            haptic.light();
                            navigate(`/admin/dashboard/${issue.fixTab}`);
                          }}
                          style={{
                            padding: '3px 8px',
                            borderRadius: 6,
                            background: 'rgba(59, 130, 246, 0.15)',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            color: '#3b82f6',
                            fontSize: 10.5,
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {issue.fixActionLabel || 'Fix'}
                        </button>
                      )}

                      {!issue.resolved && (
                        <button
                          type="button"
                          onClick={(e) => handleResolve(issue.id, e)}
                          style={{
                            padding: '3px 8px',
                            borderRadius: 6,
                            background: 'rgba(16, 185, 129, 0.15)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            color: '#10b981',
                            fontSize: 10.5,
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Resolve
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => handleDismiss(issue.id, e)}
                        style={{
                          marginLeft: 'auto',
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          padding: 4,
                          cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Stack Trace */}
                {isExpanded && issue.stack && (
                  <div style={{
                    marginTop: 10,
                    padding: '8px 10px',
                    borderRadius: 8,
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid var(--border-color)',
                    fontSize: 10,
                    fontFamily: 'monospace',
                    color: '#cbd5e1',
                    maxHeight: 120,
                    overflowY: 'auto',
                  }}>
                    {issue.stack}
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
