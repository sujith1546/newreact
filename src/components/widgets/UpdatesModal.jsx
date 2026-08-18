import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  Wrench,
  TrendingUp,
  ChevronDown,
  RefreshCw,
  GitCommit,
  ExternalLink,
  Search,
  CheckCircle2,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Tag
} from 'lucide-react';
import { useUpdates } from '../../hooks/useUpdates';
import { useTheme } from '../../context/ThemeContext';

const typeStyles = {
  feature:     { bg: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: 'rgba(16, 185, 129, 0.25)', label: 'Feature' },
  fix:         { bg: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.25)', label: 'Fix' },
  improvement: { bg: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', border: 'rgba(59, 130, 246, 0.25)', label: 'Improvement' },
};

const FILTERS = [
  { key: 'all',         label: 'All',          icon: null },
  { key: 'feature',     label: 'Features',     icon: Sparkles },
  { key: 'improvement', label: 'Improvements', icon: TrendingUp },
  { key: 'fix',         label: 'Fixes',        icon: Wrench },
  { key: 'git',         label: 'Git',          icon: GitCommit },
];

const REACTION_CONFIG = [
  { key: 'rocket', emoji: '🚀' },
  { key: 'party',  emoji: '🎉' },
  { key: 'heart',  emoji: '❤️' },
  { key: 'thumbs', emoji: '👍' },
];

function formatDate(d) {
  if (!d) return '';
  try {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return d;
  }
}

function ModalEntryCard({ entry, index, onReaction }) {
  const [open, setOpen] = useState(index < 2);
  const ts = typeStyles[entry.category] || typeStyles.improvement;
  const rxCounts = entry.reactions || { rocket: 0, party: 0, heart: 0, thumbs: 0 };

  return (
    <motion.div
      style={{ position: 'relative', marginBottom: index < 2 ? 10 : 6, width: '100%' }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.18, delay: Math.min(index * 0.02, 0.15) }}
    >
      <div
        onClick={() => setOpen((v) => !v)}
        style={{
          background: 'var(--modal-field-bg)',
          border: '1px solid var(--modal-field-border)',
          borderRadius: '10px',
          padding: open && index < 2 ? '12px 14px' : '10px 12px',
          cursor: 'pointer',
          userSelect: 'none',
          width: '100%',
          boxSizing: 'border-box',
          transition: 'all 0.15s ease',
        }}
      >
        {!open ? (
          /* Collapsed dense row */
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            {entry.version && (
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: 5,
                  border: '1px solid var(--modal-border)',
                  background: 'var(--modal-bg)',
                  color: 'var(--modal-muted)',
                  fontFamily: 'monospace',
                  flexShrink: 0,
                }}
              >
                {entry.version}
              </span>
            )}

            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: 999,
                background: ts.bg,
                color: ts.color,
                border: `1px solid ${ts.border}`,
                flexShrink: 0,
              }}
            >
              {entry.isGitCommit ? 'Git Commit' : ts.label}
            </span>

            <p
              style={{
                margin: 0,
                fontSize: 12.5,
                fontWeight: 600,
                color: 'var(--modal-text)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                flex: 1,
                minWidth: 0,
              }}
            >
              {entry.title}
            </p>

            <span style={{ fontSize: 10.5, color: 'var(--modal-muted)', flexShrink: 0 }}>
              {formatDate(entry.created_at || entry.date)}
            </span>

            <ChevronDown size={13} color="var(--modal-muted)" style={{ flexShrink: 0 }} />
          </div>
        ) : (
          /* Expanded Card Layout */
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
                {entry.version && (
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: 5,
                      border: '1px solid var(--modal-border)',
                      background: 'var(--modal-bg)',
                      color: 'var(--modal-muted)',
                      fontFamily: 'monospace',
                    }}
                  >
                    {entry.version}
                  </span>
                )}
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: 999,
                    background: ts.bg,
                    color: ts.color,
                    border: `1px solid ${ts.border}`,
                  }}
                >
                  {entry.isGitCommit ? 'Git Commit' : ts.label}
                </span>
                <span style={{ fontSize: 10.5, color: 'var(--modal-muted)', marginLeft: 'auto' }}>
                  {formatDate(entry.created_at || entry.date)}
                </span>
                <ChevronDown size={13} color="var(--modal-muted)" style={{ transform: 'rotate(180deg)', transition: 'transform 0.2s' }} />
              </div>
            </div>

            <h4 style={{ margin: '0 0 5px', fontSize: 13.5, fontWeight: 700, color: 'var(--modal-text)', lineHeight: 1.35 }}>
              {entry.title}
            </h4>

            {entry.description && (
              <p style={{ margin: 0, fontSize: 12, color: 'var(--modal-muted)', lineHeight: 1.5 }}>
                {entry.description}
              </p>
            )}

            {Array.isArray(entry.items) && entry.items.length > 0 && (
              <ul style={{ margin: '6px 0 0', paddingLeft: 16, fontSize: 11.5, color: 'var(--modal-muted)', lineHeight: 1.5 }}>
                {entry.items.map((item, i) => (
                  <li key={i} style={{ marginBottom: 2 }}>{item}</li>
                ))}
              </ul>
            )}

            {entry.url && (
              <div style={{ marginTop: 8 }}>
                <a
                  href={entry.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#3b82f6',
                    textDecoration: 'none',
                  }}
                >
                  <span>View commit on GitHub</span>
                  <ExternalLink size={11} />
                </a>
              </div>
            )}

            {/* Reactions Row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                marginTop: 10,
                paddingTop: 8,
                borderTop: '1px solid var(--modal-border)',
                flexWrap: 'wrap',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {REACTION_CONFIG.map((rx) => {
                const count = rxCounts[rx.key] || 0;
                const hasReacted = typeof localStorage !== 'undefined' && localStorage.getItem(`reacted_up_${entry.id}_${rx.key}`) === 'true';

                return (
                  <button
                    key={rx.key}
                    type="button"
                    onClick={() => onReaction(entry.id, rx.key)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '2px 8px',
                      borderRadius: 99,
                      fontSize: 11,
                      background: hasReacted ? 'rgba(59, 130, 246, 0.15)' : 'var(--modal-bg)',
                      border: `1px solid ${hasReacted ? '#3b82f6' : 'var(--modal-border)'}`,
                      color: hasReacted ? '#3b82f6' : 'var(--modal-muted)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      fontWeight: 600,
                    }}
                  >
                    <span style={{ fontSize: 11, lineHeight: 1 }}>{rx.emoji}</span>
                    <span>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function UpdatesModal({ isOpen, onClose }) {
  const { theme } = useTheme();
  const { updates, gitCommits, loading, markAllRead, toggleReaction } = useUpdates();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      markAllRead();
    }
  }, [isOpen, markAllRead]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const allEntries = useMemo(() => {
    if (activeTab === 'git') {
      return gitCommits || [];
    }

    let list = updates || [];
    if (activeTab !== 'all') {
      list = list.filter((e) => e.category === activeTab);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((e) =>
        (e.title || '').toLowerCase().includes(q) ||
        (e.description || '').toLowerCase().includes(q) ||
        (e.version || '').toLowerCase().includes(q)
      );
    }

    return list;
  }, [activeTab, updates, gitCommits, searchQuery]);

  const counts = {
    all: (updates || []).length,
    feature: (updates || []).filter((e) => e.category === 'feature').length,
    improvement: (updates || []).filter((e) => e.category === 'improvement').length,
    fix: (updates || []).filter((e) => e.category === 'fix').length,
    git: (gitCommits || []).length,
  };

  if (!isOpen || typeof document === 'undefined') return null;

  const isDarkMode =
    theme === 'dark' ||
    (typeof document !== 'undefined' &&
      document.documentElement.getAttribute('data-theme') === 'dark');

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="updates-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            background: isDarkMode
              ? 'rgba(0, 0, 0, var(--modal-backdrop-opacity, 0.45))'
              : 'rgba(15, 23, 42, var(--modal-backdrop-opacity, 0.35))',
            backdropFilter: 'blur(var(--modal-backdrop-blur, var(--glass-blur, 12px)))',
            WebkitBackdropFilter: 'blur(var(--modal-backdrop-blur, var(--glass-blur, 12px)))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            boxSizing: 'border-box',
          }}
        >
          <style>{`
            .updates-modal-card {
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

            .updates-modal-card.dark-mode {
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

            .updates-action-btn:hover {
              opacity: 0.92;
              transform: translateY(-1px);
            }
          `}</style>

          <motion.div
            key="updates-modal-content"
            className={`updates-modal-card ${isDarkMode ? 'dark-mode' : 'light-mode'}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="updates-modal-title"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '460px',
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
                    background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 2px 6px rgba(59, 130, 246, 0.35)',
                  }}
                >
                  <Sparkles size={13} fill="#ffffff" color="#ffffff" />
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '500', color: 'var(--modal-text)', lineHeight: 1.2 }}>
                    Sujith Thota
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#22c55e', fontWeight: '500', lineHeight: 1.2 }}>
                    Live updates · synced
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
                id="updates-modal-title"
                style={{
                  fontSize: '22px',
                  fontWeight: '700',
                  color: 'var(--modal-text)',
                  margin: '0 0 4px',
                  letterSpacing: '-0.02em',
                }}
              >
                System updates
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--modal-muted)', margin: '0 0 12px' }}>
                Release notes, improvements &amp; git changelog
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
                  <Tag size={11} />
                  <span>v1.3.0 latest</span>
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
                  <RefreshCw size={11} />
                  <span>Auto-synced</span>
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
                    background: 'rgba(245, 158, 11, 0.15)',
                    color: '#f59e0b',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                  }}
                >
                  <GitCommit size={11} />
                  <span>CI/CD Active</span>
                </span>
              </div>
            </div>

            {/* Filter Tabs Track */}
            <div
              style={{
                display: 'flex',
                padding: '3px',
                background: 'var(--modal-tab-track)',
                border: '1px solid var(--modal-border)',
                borderRadius: '99px',
                margin: '0 20px 10px',
                flexShrink: 0,
              }}
            >
              {FILTERS.map((t) => {
                const active = activeTab === t.key;
                const TabIcon = t.icon;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setActiveTab(t.key)}
                    style={{
                      flex: 1,
                      border: 'none',
                      background: active ? 'var(--modal-tab-active-bg)' : 'transparent',
                      color: active ? 'var(--modal-tab-active-text)' : 'var(--modal-muted)',
                      padding: '6px 8px',
                      borderRadius: '99px',
                      fontSize: '11.5px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      boxShadow: active ? '0 1px 3px rgba(0,0,0,0.15)' : 'none',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {TabIcon && <TabIcon size={12} />}
                    <span>{t.label}</span>
                    <span style={{ opacity: 0.65, fontSize: '10px' }}>({counts[t.key]})</span>
                  </button>
                );
              })}
            </div>

            {/* Compact Search Bar */}
            <div style={{ padding: '0 20px 10px', flexShrink: 0 }}>
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  background: 'var(--modal-field-bg)',
                  border: '1px solid var(--modal-field-border)',
                  borderRadius: '8px',
                  height: '34px',
                }}
              >
                <Search
                  size={14}
                  color="var(--modal-muted)"
                  style={{ position: 'absolute', left: '10px', pointerEvents: 'none' }}
                />
                <input
                  type="text"
                  placeholder="Search release notes or commits..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    height: '100%',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'var(--modal-text)',
                    fontSize: '12px',
                    paddingLeft: '30px',
                    paddingRight: searchQuery ? '30px' : '10px',
                    boxSizing: 'border-box',
                  }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--modal-muted)',
                      cursor: 'pointer',
                      padding: '2px',
                      display: 'flex',
                    }}
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* Entries Scrollable Area */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '0 20px 10px',
                minHeight: '120px',
              }}
            >
              {allEntries.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 16px' }}>
                  <CheckCircle2 size={24} color="#10b981" style={{ margin: '0 auto 6px' }} />
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--modal-text)' }}>
                    No updates found
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--modal-muted)', marginTop: '2px' }}>
                    {searchQuery ? `No notes matching "${searchQuery}"` : 'All systems are current and up-to-date.'}
                  </div>
                </div>
              ) : (
                allEntries.map((entry, idx) => (
                  <ModalEntryCard
                    key={entry.id || idx}
                    entry={entry}
                    index={idx}
                    onReaction={toggleReaction}
                  />
                ))
              )}
            </div>

            {/* Bottom Actions & Dismiss Row */}
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
                href="https://github.com/sujith1546/newreact/commits/main"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1,
                  height: '34px',
                  background: 'var(--modal-field-bg)',
                  border: '1px solid var(--modal-field-border)',
                  color: 'var(--modal-text)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <GitCommit size={13} />
                <span>Full GitHub History</span>
              </a>

              <button
                type="button"
                className="updates-action-btn"
                onClick={onClose}
                style={{
                  flex: 1,
                  height: '34px',
                  background: 'var(--modal-btn-bg)',
                  color: 'var(--modal-btn-text)',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}
              >
                <span>Dismiss</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {/* Subtle bottom footer note */}
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
              Automated release synchronization active · v1.3.0
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
