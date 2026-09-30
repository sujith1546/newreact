import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertOctagon, AlertTriangle, Info, CheckCircle2, RefreshCw,
  Download, Bug, ShieldCheck, Database, Search, Filter,
  Trash2, ExternalLink, Activity, Terminal, ChevronDown, ChevronUp,
  Zap, Play, Check, X, ShieldAlert, Cpu
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
} from '../../../core/diagnostics/diagnosticsEngine';
import { useNavigate } from 'react-router-dom';

export default function DiagnosticsPanel() {
  const navigate = useNavigate();
  const [diagState, setDiagState] = useState({
    issues: [],
    isScanning: false,
    scanProgress: 0,
    scanStep: '',
    lastScanTime: null,
  });

  const [activeSeverity, setActiveSeverity] = useState('all');
  const [activeType, setActiveType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIssues, setExpandedIssues] = useState({});
  const [toastMessage, setToastMessage] = useState(null);

  // Subscribe to live telemetry
  useEffect(() => {
    const unsub = subscribeDiagnostics((state) => {
      setDiagState(state);
    });
    return () => unsub();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleStartScan = async () => {
    showToast('Starting multi-layer deep scan...');
    await runComprehensiveDeepScan();
    showToast('Deep scan completed!');
  };

  const handleToggleExpand = (id) => {
    setExpandedIssues((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSimulate = (severity) => {
    simulateTestIssue(severity);
    showToast(`Injected simulated ${severity} diagnostic event`);
  };

  const healthScore = useMemo(() => {
    return calculateHealthScore(diagState.issues);
  }, [diagState.issues]);

  // Counts
  const counts = useMemo(() => {
    const unresolved = diagState.issues.filter((i) => !i.resolved);
    return {
      total: diagState.issues.length,
      unresolved: unresolved.length,
      critical: unresolved.filter((i) => i.severity === 'critical').length,
      error: unresolved.filter((i) => i.severity === 'error').length,
      warning: unresolved.filter((i) => i.severity === 'warning').length,
      info: unresolved.filter((i) => i.severity === 'info').length,
      resolved: diagState.issues.filter((i) => i.resolved).length,
    };
  }, [diagState.issues]);

  // Filtered issues
  const filteredIssues = useMemo(() => {
    return diagState.issues.filter((issue) => {
      // Severity filter
      if (activeSeverity === 'resolved') {
        if (!issue.resolved) return false;
      } else if (activeSeverity !== 'all') {
        if (issue.resolved || issue.severity !== activeSeverity) return false;
      } else if (activeSeverity === 'all') {
        // In "all", show unresolved first, but keep resolved visible
      }

      // Type filter
      if (activeType !== 'all' && issue.type !== activeType) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = issue.title.toLowerCase().includes(q);
        const matchesMsg = (issue.message || '').toLowerCase().includes(q);
        const matchesSource = (issue.source || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesMsg && !matchesSource) return false;
      }

      return true;
    });
  }, [diagState.issues, activeSeverity, activeType, searchQuery]);

  const getHealthMeta = (score) => {
    if (score >= 90) return { label: 'Optimal Health', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
    if (score >= 70) return { label: 'Good · Minor Warnings', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' };
    if (score >= 50) return { label: 'Degraded · Action Needed', color: '#f97316', bg: 'rgba(249, 115, 22, 0.1)' };
    return { label: 'Critical Attention Required', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' };
  };

  const healthMeta = getHealthMeta(healthScore);

  return (
    <div className="pcms-panel-container" style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1400, margin: '0 auto' }}>
      {/* ── Toast Notification ── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            style={{
              position: 'fixed',
              top: 24,
              right: 24,
              zIndex: 9999,
              background: 'var(--pcms-panel)',
              border: '1px solid var(--primary-blue, #3b82f6)',
              boxShadow: '0 10px 25px rgba(0,0,0,0.35)',
              padding: '10px 18px',
              borderRadius: 12,
              color: 'var(--pcms-text)',
              fontSize: 13,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <Zap size={16} color="var(--primary-blue, #3b82f6)" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header Bar ── */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{
              fontSize: 24,
              fontWeight: 800,
              fontFamily: "'Space Grotesk', sans-serif",
              color: 'var(--pcms-text)',
              letterSpacing: '-0.02em',
              margin: 0,
            }}>
              Bug & Issue Diagnostics Radar
            </h1>
            <span style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              padding: '3px 8px',
              borderRadius: 20,
              background: 'rgba(244, 63, 94, 0.12)',
              color: '#f43f5e',
              border: '1px solid rgba(244, 63, 94, 0.28)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f43f5e', boxShadow: '0 0 6px #f43f5e' }} />
              Live Telemetry
            </span>
          </div>
          <p style={{
            margin: 0,
            fontSize: 13,
            color: 'var(--pcms-muted)',
            lineHeight: 1.5,
          }}>
            Real-time radar intercepting runtime errors, console exceptions, broken network calls, DOM flaws, and data completeness.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Deep Scan Trigger */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={handleStartScan}
            disabled={diagState.isScanning}
            className="pcms-pill-btn"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '7px 15px',
              fontWeight: 700,
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.28)',
            }}
          >
            <RefreshCw size={14} className={diagState.isScanning ? 'spin' : ''} />
            <span>{diagState.isScanning ? 'Running Scan...' : 'Deep System Scan'}</span>
          </motion.button>

          {/* Test Simulator dropdown */}
          <div style={{ position: 'relative', display: 'inline-flex' }}>
            <button
              type="button"
              onClick={() => handleSimulate('error')}
              className="pcms-pill-btn"
              title="Inject simulated error to test detection"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#ef4444',
                fontSize: 12,
              }}
            >
              <Bug size={13} />
              <span>Simulate Error</span>
            </button>
          </div>

          {/* Export JSON Report */}
          <button
            type="button"
            onClick={exportDiagnosticsReport}
            className="pcms-pill-btn"
            title="Download full system diagnostic JSON report"
            style={{
              background: 'var(--pcms-panel-2)',
              border: '1px solid var(--pcms-line)',
              color: 'var(--pcms-text)',
              fontSize: 12,
            }}
          >
            <Download size={13} />
            <span>Export Report (.json)</span>
          </button>

          {/* Clear Resolved */}
          {counts.resolved > 0 && (
            <button
              type="button"
              onClick={() => clearAllIssues(true)}
              className="pcms-pill-btn"
              title="Purge resolved issues from history"
              style={{
                background: 'var(--pcms-panel-2)',
                border: '1px solid var(--pcms-line)',
                color: 'var(--pcms-muted)',
                fontSize: 12,
              }}
            >
              <Trash2 size={13} />
              <span>Clear Resolved ({counts.resolved})</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Active Scanning Progress Bar ── */}
      {diagState.isScanning && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '14px 18px',
            borderRadius: 14,
            background: 'var(--pcms-panel)',
            border: '1px solid var(--pcms-line)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: 'var(--pcms-text)' }}>
              <RefreshCw size={14} className="spin" color="#3b82f6" />
              <span>{diagState.scanStep || 'Executing Diagnostic Audit...'}</span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--primary-blue, #3b82f6)' }}>
              {diagState.scanProgress}%
            </span>
          </div>
          <div style={{
            height: 6,
            borderRadius: 6,
            background: 'var(--pcms-line)',
            overflow: 'hidden',
          }}>
            <motion.div
              style={{
                height: '100%',
                borderRadius: 6,
                background: 'linear-gradient(90deg, #6366f1, #3b82f6, #06b6d4)',
              }}
              animate={{ width: `${diagState.scanProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>
      )}

      {/* ── Metric Cards & Health Gauge Row ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 14,
      }}>
        {/* Health Score Card */}
        <div style={{
          padding: '16px 18px',
          borderRadius: 16,
          background: 'var(--pcms-panel)',
          border: '1px solid var(--pcms-line)',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}>
          {/* Radial Ring */}
          <div style={{ position: 'relative', width: 64, height: 64, flexShrink: 0 }}>
            <svg width="64" height="64" viewBox="0 0 64 64">
              <circle
                cx="32" cy="32" r="26"
                fill="none"
                stroke="var(--pcms-line)"
                strokeWidth="5"
              />
              <motion.circle
                cx="32" cy="32" r="26"
                fill="none"
                stroke={healthMeta.color}
                strokeWidth="5"
                strokeDasharray={2 * Math.PI * 26}
                strokeDashoffset={2 * Math.PI * 26 * (1 - healthScore / 100)}
                strokeLinecap="round"
                transform="rotate(-90 32 32)"
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
              <text
                x="32" y="34"
                textAnchor="middle" dominantBaseline="middle"
                fill="var(--pcms-text)"
                fontSize="15" fontWeight="800"
              >
                {healthScore}%
              </text>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--pcms-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              System Health
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: healthMeta.color, marginTop: 2 }}>
              {healthMeta.label}
            </div>
            <div style={{ fontSize: 11, color: 'var(--pcms-muted)', marginTop: 2 }}>
              {counts.unresolved === 0 ? 'All 5 layers green' : `${counts.unresolved} active issue(s)`}
            </div>
          </div>
        </div>

        {/* Critical & Errors */}
        <div style={{
          padding: '16px 18px',
          borderRadius: 16,
          background: 'var(--pcms-panel)',
          border: '1px solid var(--pcms-line)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--pcms-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Critical & Errors
            </span>
            <AlertOctagon size={16} color="#ef4444" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 10 }}>
            <span style={{ fontSize: 26, fontWeight: 800, color: counts.critical + counts.error > 0 ? '#ef4444' : 'var(--pcms-text)' }}>
              {counts.critical + counts.error}
            </span>
            <span style={{ fontSize: 11, color: 'var(--pcms-muted)' }}>
              {counts.critical} critical · {counts.error} errors
            </span>
          </div>
        </div>

        {/* Warnings & Heuristics */}
        <div style={{
          padding: '16px 18px',
          borderRadius: 16,
          background: 'var(--pcms-panel)',
          border: '1px solid var(--pcms-line)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--pcms-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Warnings & Flags
            </span>
            <AlertTriangle size={16} color="#f59e0b" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 10 }}>
            <span style={{ fontSize: 26, fontWeight: 800, color: counts.warning > 0 ? '#f59e0b' : 'var(--pcms-text)' }}>
              {counts.warning}
            </span>
            <span style={{ fontSize: 11, color: 'var(--pcms-muted)' }}>
              SEO & data integrity warnings
            </span>
          </div>
        </div>

        {/* Info & Resolved */}
        <div style={{
          padding: '16px 18px',
          borderRadius: 16,
          background: 'var(--pcms-panel)',
          border: '1px solid var(--pcms-line)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--pcms-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Resolved Issues
            </span>
            <CheckCircle2 size={16} color="#10b981" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 10 }}>
            <span style={{ fontSize: 26, fontWeight: 800, color: '#10b981' }}>
              {counts.resolved}
            </span>
            <span style={{ fontSize: 11, color: 'var(--pcms-muted)' }}>
              of {counts.total} total logged events
            </span>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Toolbars ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        flexWrap: 'wrap',
        background: 'var(--pcms-panel)',
        padding: '12px 16px',
        borderRadius: 14,
        border: '1px solid var(--pcms-line)',
      }}>
        {/* Severity Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: `All Active (${counts.unresolved})` },
            { key: 'critical', label: `Critical (${counts.critical})`, color: '#ef4444' },
            { key: 'error', label: `Errors (${counts.error})`, color: '#f43f5e' },
            { key: 'warning', label: `Warnings (${counts.warning})`, color: '#f59e0b' },
            { key: 'info', label: `Info (${counts.info})`, color: '#06b6d4' },
            { key: 'resolved', label: `Resolved (${counts.resolved})`, color: '#10b981' },
          ].map((pill) => {
            const isActive = activeSeverity === pill.key;
            return (
              <button
                key={pill.key}
                type="button"
                onClick={() => setActiveSeverity(pill.key)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 20,
                  fontSize: 11.5,
                  fontWeight: isActive ? 700 : 500,
                  border: isActive ? `1px solid ${pill.color || 'var(--primary-blue, #3b82f6)'}` : '1px solid var(--pcms-line)',
                  background: isActive ? (pill.color ? `${pill.color}18` : 'var(--pcms-panel-2)') : 'transparent',
                  color: isActive ? (pill.color || 'var(--pcms-text)') : 'var(--pcms-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {pill.label}
              </button>
            );
          })}
        </div>

        {/* Search Input & Category Select */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 260, justifyContent: 'flex-end' }}>
          {/* Category Dropdown */}
          <select
            value={activeType}
            onChange={(e) => setActiveType(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: 8,
              border: '1px solid var(--pcms-line)',
              background: 'var(--pcms-panel-2)',
              color: 'var(--pcms-text)',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="all">All Architectural Types</option>
            <option value="runtime">Runtime (JS / React)</option>
            <option value="network">Network & APIs</option>
            <option value="data">Data Integrity</option>
            <option value="dom">DOM & Assets</option>
            <option value="storage">Storage & Cache</option>
            <option value="security">Security & Config</option>
          </select>

          {/* Search Box */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 10px',
            borderRadius: 8,
            border: '1px solid var(--pcms-line)',
            background: 'var(--pcms-panel-2)',
            minWidth: 180,
          }}>
            <Search size={13} color="var(--pcms-muted)" />
            <input
              type="text"
              placeholder="Filter issues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                color: 'var(--pcms-text)',
                fontSize: 12,
                outline: 'none',
                width: '100%',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
              >
                <X size={12} color="var(--pcms-muted)" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Issues Feed / List ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filteredIssues.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              padding: '48px 24px',
              borderRadius: 16,
              background: 'var(--pcms-panel)',
              border: '1px dashed var(--pcms-line)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10b981',
            }}>
              <ShieldCheck size={26} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: 'var(--pcms-text)' }}>
                {activeSeverity === 'resolved'
                  ? 'No Resolved Issues Yet'
                  : 'Zero Diagnostics Anomalies Found'}
              </h3>
              <p style={{ margin: 0, fontSize: 12.5, color: 'var(--pcms-muted)', maxWidth: 440 }}>
                {activeSeverity === 'resolved'
                  ? 'Resolved issues will appear here when marked.'
                  : 'Your portfolio infrastructure, DOM assets, database connections, and data integrity are currently running clean.'}
              </p>
            </div>
            {activeSeverity !== 'resolved' && (
              <button
                type="button"
                onClick={handleStartScan}
                className="pcms-pill-btn"
                style={{
                  marginTop: 6,
                  background: 'var(--primary-blue, #3b82f6)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '6px 16px',
                  fontWeight: 600,
                }}
              >
                <RefreshCw size={13} />
                <span>Run Deep Scan Now</span>
              </button>
            )}
          </motion.div>
        ) : (
          filteredIssues.map((issue) => {
            const isExpanded = !!expandedIssues[issue.id];
            const severityColor =
              issue.resolved
                ? '#10b981'
                : issue.severity === 'critical'
                ? '#ef4444'
                : issue.severity === 'error'
                ? '#f43f5e'
                : issue.severity === 'warning'
                ? '#f59e0b'
                : '#06b6d4';

            const severityIcon =
              issue.resolved ? (
                <CheckCircle2 size={15} />
              ) : issue.severity === 'critical' ? (
                <AlertOctagon size={15} />
              ) : issue.severity === 'error' ? (
                <ShieldAlert size={15} />
              ) : issue.severity === 'warning' ? (
                <AlertTriangle size={15} />
              ) : (
                <Info size={15} />
              );

            return (
              <motion.div
                key={issue.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  borderRadius: 14,
                  background: 'var(--pcms-panel)',
                  border: `1px solid ${issue.resolved ? 'rgba(16, 185, 129, 0.25)' : 'var(--pcms-line)'}`,
                  overflow: 'hidden',
                  transition: 'border-color 0.15s ease',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                }}
              >
                {/* Main Card Row */}
                <div style={{
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 14,
                  cursor: 'pointer',
                }}
                onClick={() => handleToggleExpand(issue.id)}
                >
                  {/* Left: Icon & Meta */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, minWidth: 0, flex: 1 }}>
                    {/* Severity Badge Icon */}
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      background: `${severityColor}15`,
                      border: `1px solid ${severityColor}30`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: severityColor,
                      flexShrink: 0,
                      marginTop: 2,
                    }}>
                      {severityIcon}
                    </div>

                    {/* Content Block */}
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                        <span style={{
                          fontSize: 13.5,
                          fontWeight: 700,
                          color: issue.resolved ? 'var(--pcms-muted)' : 'var(--pcms-text)',
                          textDecoration: issue.resolved ? 'line-through' : 'none',
                        }}>
                          {issue.title}
                        </span>

                        {/* Repeat counter badge */}
                        {(issue.count || 1) > 1 && (
                          <span style={{
                            fontSize: 10,
                            fontWeight: 800,
                            padding: '1px 6px',
                            borderRadius: 10,
                            background: `${severityColor}20`,
                            color: severityColor,
                            border: `1px solid ${severityColor}40`,
                          }}>
                            {issue.count}x
                          </span>
                        )}

                        {/* Architectural Type */}
                        <span style={{
                          fontSize: 10,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          padding: '1px 7px',
                          borderRadius: 6,
                          background: 'var(--pcms-panel-2)',
                          color: 'var(--pcms-muted)',
                          border: '1px solid var(--pcms-line)',
                        }}>
                          {issue.type}
                        </span>

                        {/* Source origin */}
                        <span style={{ fontSize: 11, color: 'var(--pcms-muted)' }}>
                          via {issue.source}
                        </span>

                        {/* Relative Timestamp */}
                        <span style={{ fontSize: 11, color: 'var(--pcms-muted)', marginLeft: 'auto' }}>
                          {new Date(issue.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>

                      {/* Description Message */}
                      <div style={{
                        fontSize: 12.5,
                        color: issue.resolved ? 'var(--pcms-muted)' : 'var(--pcms-text)',
                        lineHeight: 1.5,
                        wordBreak: 'break-word',
                      }}>
                        {issue.message}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions Block */}
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* 1-Click Fix Navigation Button */}
                    {issue.fixTab && !issue.resolved && (
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/dashboard/${issue.fixTab}`)}
                        className="pcms-pill-btn"
                        title={`Navigate to ${issue.fixTab} panel to resolve`}
                        style={{
                          background: 'rgba(59, 130, 246, 0.1)',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          color: 'var(--primary-blue, #3b82f6)',
                          padding: '4px 10px',
                          fontSize: 11.5,
                          fontWeight: 700,
                        }}
                      >
                        <span>{issue.fixActionLabel || 'Fix Issue'}</span>
                        <ExternalLink size={12} />
                      </button>
                    )}

                    {/* Mark Resolved / Reopen */}
                    {!issue.resolved ? (
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => resolveIssue(issue.id)}
                        className="pcms-pill-btn"
                        title="Mark issue as resolved"
                        style={{
                          background: 'rgba(16, 185, 129, 0.1)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          color: '#10b981',
                          padding: '4px 8px',
                        }}
                      >
                        <Check size={13} />
                        <span style={{ fontSize: 11.5 }}>Resolve</span>
                      </motion.button>
                    ) : (
                      <span style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#10b981',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '4px 8px',
                      }}>
                        <CheckCircle2 size={13} />
                        <span>Resolved</span>
                      </span>
                    )}

                    {/* Dismiss Button */}
                    <button
                      type="button"
                      onClick={() => dismissIssue(issue.id)}
                      title="Dismiss from log"
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--pcms-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Trash2 size={13} />
                    </button>

                    {/* Accordion Chevron */}
                    <button
                      type="button"
                      onClick={() => handleToggleExpand(issue.id)}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--pcms-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details / Stack Trace */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{
                        borderTop: '1px solid var(--pcms-line)',
                        background: 'var(--pcms-panel-2)',
                        padding: '14px 18px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        <Terminal size={13} color="var(--pcms-muted)" />
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--pcms-muted)', textTransform: 'uppercase' }}>
                          Diagnostic Stack & Environment Context
                        </span>
                      </div>

                      {issue.stack ? (
                        <pre style={{
                          margin: 0,
                          padding: '10px 14px',
                          borderRadius: 8,
                          background: 'rgba(0,0,0,0.3)',
                          border: '1px solid var(--pcms-line)',
                          color: '#e2e8f0',
                          fontFamily: 'Consolas, Monaco, monospace',
                          fontSize: 11,
                          lineHeight: 1.5,
                          overflowX: 'auto',
                          maxHeight: 180,
                        }}>
                          {issue.stack}
                        </pre>
                      ) : (
                        <div style={{ fontSize: 12, color: 'var(--pcms-muted)', fontStyle: 'italic' }}>
                          No execution stack trace was generated for this heuristic diagnostic event.
                        </div>
                      )}

                      <div style={{
                        marginTop: 10,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        fontSize: 11,
                        color: 'var(--pcms-muted)',
                      }}>
                        <span>ID: <code>{issue.id}</code></span>
                        <span>Logged: {new Date(issue.timestamp).toISOString()}</span>
                        {issue.fixTab && <span>Remediation Target: <code>/admin/dashboard/{issue.fixTab}</code></span>}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
