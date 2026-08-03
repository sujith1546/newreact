import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, GitCommit, GitBranch, ExternalLink, RefreshCw, Loader2, Check, Sparkles, Clock, User } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';

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
  const [commits, setCommits] = useState(FALLBACK_COMMITS);
  const [loading, setLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const fetchGithubCommits = async () => {
    setLoading(true);
    try {
      // Attempt to fetch live commits from GitHub API
      const res = await fetch('https://api.github.com/users/sujith1546/events/public', {
        headers: { 'Accept': 'application/vnd.github.v3+json' }
      });
      if (res.ok) {
        const events = await res.json();
        const pushEvents = events.filter(e => e.type === 'PushEvent');
        const liveCommits = [];
        pushEvents.forEach(pe => {
          if (pe.payload && pe.payload.commits) {
            pe.payload.commits.forEach(c => {
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
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="github-modal-title"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          />

          {/* Modal Container */}
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.88, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 15 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '520px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '20px',
              border: '1px solid var(--border-color)',
              padding: '24px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.3)',
              zIndex: 1000000,
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {/* Ambient Top Glow */}
            <div
              style={{
                position: 'absolute',
                top: '-40px',
                right: '-40px',
                width: '160px',
                height: '160px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, color-mix(in srgb, var(--primary-blue) 25%, transparent) 0%, transparent 70%)',
                filter: 'blur(25px)',
                pointerEvents: 'none'
              }}
            />

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#0f172a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FaGithub size={20} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 id="github-modal-title" style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
                      GitHub Activity & Commits
                    </h3>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '2px 8px', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#10b981' }} /> Live
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                    repository: sujith1546 / portfolio
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  padding: '4px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '16px' }}>
              <div style={{ padding: '8px 12px', borderRadius: '10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Branch</div>
                <div style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <GitBranch size={13} color="var(--primary-blue)" /> main
                </div>
              </div>

              <div style={{ padding: '8px 12px', borderRadius: '10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Latest SHA</div>
                <div style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'monospace', marginTop: '2px' }}>
                  {commits[0]?.sha || 'e36daa7'}
                </div>
              </div>

              <div style={{ padding: '8px 12px', borderRadius: '10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Commits</div>
                <div style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {commits.length}+ logged
                </div>
              </div>
            </div>

            {/* Commit List Container */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px', marginBottom: '16px' }}>
              {loading ? (
                <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <Loader2 size={22} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontSize: '12.5px' }}>Fetching latest commits from GitHub...</span>
                </div>
              ) : (
                commits.map((commit, idx) => (
                  <motion.div
                    key={commit.sha + idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '10px',
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      transition: 'border-color 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', minWidth: 0 }}>
                      <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: 'color-mix(in srgb, var(--primary-blue) 15%, var(--bg-secondary))', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                        <GitCommit size={14} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {commit.message}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px', fontSize: '11px', color: 'var(--text-muted)' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{commit.author}</span>
                          <span>•</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Clock size={10} /> {timeAgo(commit.date)}</span>
                        </div>
                      </div>
                    </div>

                    <a
                      href={commit.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-secondary)',
                        fontSize: '11px',
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        flexShrink: 0
                      }}
                    >
                      {commit.sha} <ExternalLink size={11} />
                    </a>
                  </motion.div>
                ))
              )}
            </div>

            {/* Modal Footer Actions */}
            <div style={{ display: 'flex', gap: '10px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
              <a
                href="https://github.com/sujith1546"
                target="_blank"
                rel="noreferrer"
                style={{
                  flex: 1,
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 3px 10px rgba(15, 23, 42, 0.2)'
                }}
              >
                <FaGithub size={15} /> Open GitHub Profile
              </a>

              <button
                type="button"
                onClick={fetchGithubCommits}
                disabled={loading}
                style={{
                  height: '38px',
                  padding: '0 14px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <RefreshCw size={13} className={loading ? 'spin' : ''} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                Refresh
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
