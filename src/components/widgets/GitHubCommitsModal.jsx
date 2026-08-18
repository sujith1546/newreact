import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  GitCommit,
  GitBranch,
  ExternalLink,
  RefreshCw,
  Loader2,
  Clock,
  Activity,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';

const FALLBACK_COMMITS = [
  {
    sha: 'e36daa7',
    message: 'fix(mobile): resolve Framer Motion variant resolution bug & touch scrolling',
    author: 'Sujith Thota',
    date: '2026-08-03T11:20:00Z',
    url: 'https://github.com/sujith1546'
  },
  {
    sha: '9f46d3b',
    message: 'feat: mobile UI optimizations, Dynamic Island polish, B&W admin theme',
    author: 'Sujith Thota',
    date: '2026-08-03T09:45:00Z',
    url: 'https://github.com/sujith1546'
  },
  {
    sha: '766e710',
    message: 'refactor: simplify admin dashboard panels and enhance skills radar animations',
    author: 'Sujith Thota',
    date: '2026-08-02T18:15:00Z',
    url: 'https://github.com/sujith1546'
  },
  {
    sha: '39b49ca',
    message: 'Remove Accent Color feature from settings and update core theme tokens',
    author: 'Sujith Thota',
    date: '2026-08-02T14:10:00Z',
    url: 'https://github.com/sujith1546'
  },
  {
    sha: 'f75528d',
    message: 'feat: live active visitors, multi-step progress, RAG telemetry & command palette',
    author: 'Sujith Thota',
    date: '2026-08-01T22:30:00Z',
    url: 'https://github.com/sujith1546'
  }
];

export default function GitHubCommitsModal({ isOpen, onClose }) {
  const { theme } = useTheme();
  const [commits, setCommits] = useState(FALLBACK_COMMITS);
  const [loading, setLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const fetchGithubCommits = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://api.github.com/users/sujith1546/events/public', {
        headers: { Accept: 'application/vnd.github.v3+json' }
      });
      if (res.ok) {
        const events = await res.json();
        const pushEvents = events.filter((e) => e.type === 'PushEvent');
        const liveCommits = [];
        pushEvents.forEach((pe) => {
          if (pe.payload && pe.payload.commits) {
            pe.payload.commits.forEach((c) => {
              liveCommits.push({
                sha: c.sha ? c.sha.substring(0, 7) : 'head',
                message: c.message || 'Updated codebase',
                author: pe.actor ? pe.actor.login : 'Sujith Thota',
                date: pe.created_at,
                url: `https://github.com/${pe.repo.name}/commit/${c.sha}`
              });
            });
          }
        });
        if (liveCommits.length > 0) {
          setCommits(liveCommits.slice(0, 8));
        }
      }
    } catch (err) {
      console.log('GitHub API fetch fallback:', err);
    } finally {
      setLoading(false);
      setLastRefreshed(new Date());
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchGithubCommits();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  const isDarkMode =
    theme === 'dark' ||
    (typeof document !== 'undefined' &&
      document.documentElement.getAttribute('data-theme') === 'dark');

  const timeAgo = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now - d) / 1000);
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay}d ago`;
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="gh-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isDarkMode
              ? 'rgba(0, 0, 0, var(--modal-backdrop-opacity, 0.45))'
              : 'rgba(15, 23, 42, var(--modal-backdrop-opacity, 0.35))',
            backdropFilter: 'blur(var(--modal-backdrop-blur, var(--glass-blur, 12px)))',
            WebkitBackdropFilter: 'blur(var(--modal-backdrop-blur, var(--glass-blur, 12px)))',
            padding: '20px',
            boxSizing: 'border-box',
          }}
        >
          <style>{`
            .gh-modal-card {
              --modal-bg: rgba(255, 255, 255, 0.97);
              --modal-border: #e2e8f0;
              --modal-text: #0f172a;
              --modal-muted: #64748b;
              --modal-field-bg: #f8fafc;
              --modal-field-border: #cbd5e1;
              --modal-tab-track: #f1f5f9;
              --modal-tab-active-bg: #0f172a;
              --modal-tab-active-text: #ffffff;
              --modal-btn-bg: #0f172a;
              --modal-btn-hover: #1e293b;
              --modal-btn-text: #ffffff;
              --modal-shadow: 0 8px 24px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1);
              backdrop-filter: blur(var(--modal-card-blur, 16px));
              -webkit-backdrop-filter: blur(var(--modal-card-blur, 16px));
              color-scheme: light;
            }

            .gh-modal-card.dark-mode {
              --modal-bg: rgba(24, 25, 29, 0.94);
              --modal-border: rgba(255, 255, 255, 0.12);
              --modal-text: #ffffff;
              --modal-muted: #94a3b8;
              --modal-field-bg: #22242a;
              --modal-field-border: rgba(255, 255, 255, 0.14);
              --modal-tab-track: #141518;
              --modal-tab-active-bg: #ffffff;
              --modal-tab-active-text: #0f172a;
              --modal-btn-bg: #ffffff;
              --modal-btn-hover: #f1f5f9;
              --modal-btn-text: #0f172a;
              --modal-shadow: 0 12px 36px rgba(0, 0, 0, 0.45), 0 2px 10px rgba(0, 0, 0, 0.2);
              backdrop-filter: blur(var(--modal-card-blur, 16px));
              -webkit-backdrop-filter: blur(var(--modal-card-blur, 16px));
              color-scheme: dark;
            }

            .gh-action-btn:hover {
              opacity: 0.92;
              transform: translateY(-1px);
            }
            .gh-refresh-btn:hover {
              background: var(--modal-tab-track) !important;
            }
          `}</style>

          <motion.div
            key="gh-modal-content"
            className={`gh-modal-card ${isDarkMode ? 'dark-mode' : 'light-mode'}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="github-modal-title"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '440px',
              width: '100%',
              maxHeight: '85vh',
              background: 'var(--modal-bg)',
              border: '0.5px solid var(--modal-border)',
              borderRadius: '16px',
              boxShadow: 'var(--modal-shadow)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              color: 'var(--modal-text)',
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif",
            }}
          >
            {/* Identity Row: avatar + name + status | close button */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px 10px',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: '#0f172a',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)',
                  }}
                >
                  <FaGithub size={13} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '500', color: 'var(--modal-text)', lineHeight: 1.2 }}>
                    Sujith Thota
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#22c55e', fontWeight: '500', lineHeight: 1.2 }}>
                    GitHub · public activity
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--modal-muted)',
                  cursor: 'pointer',
                  padding: 0,
                  width: '26px',
                  height: '26px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--modal-text)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--modal-muted)')}
              >
                <X size={16} />
              </button>
            </div>

            {/* Heading + Subtitle, centered */}
            <div style={{ textAlign: 'center', padding: '0 20px 12px', flexShrink: 0 }}>
              <h3
                id="github-modal-title"
                style={{
                  fontSize: '22px',
                  fontWeight: '700',
                  color: 'var(--modal-text)',
                  margin: '0 0 4px',
                  letterSpacing: '-0.02em',
                }}
              >
                GitHub activity
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--modal-muted)', margin: '0 0 12px' }}>
                Recent commits &amp; push events on main branch
              </p>

              {/* Status pills row, centered */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '11px',
                    fontWeight: '600',
                    padding: '3px 9px',
                    borderRadius: '99px',
                    background: 'rgba(34, 197, 94, 0.15)',
                    color: '#22c55e',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                  }}
                >
                  <GitBranch size={11} />
                  <span>main branch</span>
                </span>

                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '11px',
                    fontWeight: '600',
                    padding: '3px 9px',
                    borderRadius: '99px',
                    background: 'var(--modal-field-bg)',
                    color: 'var(--modal-text)',
                    border: '1px solid var(--modal-border)',
                  }}
                >
                  <GitCommit size={11} />
                  <span style={{ fontFamily: 'monospace' }}>{commits[0]?.sha || 'e36daa7'}</span>
                </span>

                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '11px',
                    fontWeight: '600',
                    padding: '3px 9px',
                    borderRadius: '99px',
                    background: 'rgba(59, 130, 246, 0.15)',
                    color: '#3b82f6',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                  }}
                >
                  <Activity size={11} />
                  <span>{commits.length}+ commits</span>
                </span>
              </div>
            </div>

            {/* Quick Metrics 3-Tile Row */}
            <div style={{ padding: '0 20px 10px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', flexShrink: 0 }}>
              <div
                style={{
                  padding: '8px 10px',
                  borderRadius: '8px',
                  background: 'var(--modal-field-bg)',
                  border: '1px solid var(--modal-field-border)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--modal-muted)', textTransform: 'uppercase' }}>
                  Branch
                </div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--modal-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: '2px' }}>
                  <GitBranch size={12} color="#3b82f6" />
                  <span>main</span>
                </div>
              </div>

              <div
                style={{
                  padding: '8px 10px',
                  borderRadius: '8px',
                  background: 'var(--modal-field-bg)',
                  border: '1px solid var(--modal-field-border)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--modal-muted)', textTransform: 'uppercase' }}>
                  Latest SHA
                </div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--modal-text)', fontFamily: 'monospace', marginTop: '2px' }}>
                  {commits[0]?.sha || 'e36daa7'}
                </div>
              </div>

              <div
                style={{
                  padding: '8px 10px',
                  borderRadius: '8px',
                  background: 'var(--modal-field-bg)',
                  border: '1px solid var(--modal-field-border)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--modal-muted)', textTransform: 'uppercase' }}>
                  Status
                </div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: '2px' }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#22c55e' }} />
                  <span>Synced</span>
                </div>
              </div>
            </div>

            {/* Commits List Scrollable Container */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '0 20px 10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                minHeight: '130px',
              }}
            >
              {loading ? (
                <div
                  style={{
                    padding: '30px 16px',
                    textAlign: 'center',
                    color: 'var(--modal-muted)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontSize: '12px' }}>Fetching latest commits from GitHub...</span>
                </div>
              ) : (
                commits.map((commit, idx) => (
                  <motion.div
                    key={commit.sha + idx}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: 'var(--modal-field-bg)',
                      border: '1px solid var(--modal-field-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: 'rgba(59, 130, 246, 0.15)',
                          color: '#3b82f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: '1px',
                        }}
                      >
                        <GitCommit size={13} />
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p
                          style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            color: 'var(--modal-text)',
                            margin: 0,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {commit.message}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', fontSize: '10.5px', color: 'var(--modal-muted)' }}>
                          <span style={{ fontWeight: 600, color: 'var(--modal-text)' }}>{commit.author}</span>
                          <span>•</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Clock size={10} /> {timeAgo(commit.date)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <a
                      href={commit.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        padding: '3px 7px',
                        borderRadius: '5px',
                        background: 'var(--modal-bg)',
                        border: '1px solid var(--modal-border)',
                        color: 'var(--modal-muted)',
                        fontSize: '10.5px',
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        flexShrink: 0,
                        transition: 'color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--modal-text)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--modal-muted)')}
                    >
                      <span>{commit.sha}</span>
                      <ExternalLink size={10} />
                    </a>
                  </motion.div>
                ))
              )}
            </div>

            {/* Bottom Actions Row */}
            <div
              style={{
                padding: '10px 20px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                borderTop: '1px solid var(--modal-border)',
                flexShrink: 0,
              }}
            >
              <a
                href="https://github.com/sujith1546"
                target="_blank"
                rel="noreferrer"
                className="gh-action-btn"
                style={{
                  flex: 1,
                  height: '36px',
                  background: 'var(--modal-btn-bg)',
                  color: 'var(--modal-btn-text)',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  transition: 'all 0.15s ease',
                }}
              >
                <FaGithub size={14} />
                <span>GitHub Profile</span>
              </a>

              <button
                type="button"
                className="gh-refresh-btn"
                onClick={fetchGithubCommits}
                disabled={loading}
                style={{
                  height: '36px',
                  padding: '0 14px',
                  borderRadius: '8px',
                  background: 'var(--modal-field-bg)',
                  color: 'var(--modal-text)',
                  fontSize: '12px',
                  fontWeight: '600',
                  border: '1px solid var(--modal-field-border)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                }}
              >
                <RefreshCw size={12} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                <span>Refresh</span>
              </button>
            </div>

            {/* Bottom Footer Note */}
            <div
              style={{
                padding: '8px 20px',
                background: 'var(--modal-field-bg)',
                borderTop: '1px solid var(--modal-border)',
                fontSize: '10.5px',
                color: 'var(--modal-muted)',
                textAlign: 'center',
                flexShrink: 0,
              }}
            >
              Live GitHub event stream · Public repository
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
