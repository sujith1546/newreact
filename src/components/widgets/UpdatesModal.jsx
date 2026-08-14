import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  Wrench,
  TrendingUp,
  ChevronDown,
  Check,
  RefreshCw,
  GitCommit,
  ExternalLink,
  Search,
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';
import { useUpdates } from '../../hooks/useUpdates';

const typeStyles = {
  feature:     { bg: "rgba(16,185,129,0.12)", color: "#10b981", border: "rgba(16,185,129,0.25)", label: "Feature" },
  fix:         { bg: "rgba(245,158,11,0.12)", color: "#f59e0b", border: "rgba(245,158,11,0.25)", label: "Fix" },
  improvement: { bg: "rgba(59,130,246,0.12)", color: "#3b82f6", border: "rgba(59,130,246,0.25)", label: "Improvement" },
};

const FILTERS = [
  { key: "all",         label: "All",          icon: null        },
  { key: "feature",     label: "Features",     icon: Sparkles    },
  { key: "improvement", label: "Improvements", icon: TrendingUp  },
  { key: "fix",         label: "Fixes",        icon: Wrench      },
  { key: "git",         label: "Git Commits",  icon: GitCommit   },
];

const REACTION_CONFIG = [
  { key: "rocket", emoji: "🚀" },
  { key: "party",  emoji: "🎉" },
  { key: "heart",  emoji: "❤️" },
  { key: "thumbs", emoji: "👍" },
];

function formatDate(d) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
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
      style={{ position: "relative", marginBottom: index < 2 ? 12 : 8, width: "100%" }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.2) }}
    >
      <div
        onClick={() => setOpen((v) => !v)}
        style={{
          background: "var(--bg-primary, rgba(0,0,0,0.15))",
          border: "1px solid var(--border-color, rgba(255,255,255,0.12))",
          borderRadius: 14,
          padding: open && index < 2 ? "14px 16px" : "11px 14px",
          cursor: "pointer",
          userSelect: "none",
          width: "100%",
          boxSizing: "border-box",
          transition: "all 0.15s ease",
        }}
      >
        {!open ? (
          /* Collapsed dense view */
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            {entry.version && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "2px 7px",
                  borderRadius: 6,
                  border: "1px solid var(--border-color, rgba(255,255,255,0.12))",
                  background: "var(--bg-secondary, rgba(255,255,255,0.06))",
                  color: "var(--text-secondary, #94a3b8)",
                  fontFamily: "monospace",
                  flexShrink: 0,
                }}
              >
                {entry.version}
              </span>
            )}

            <span
              style={{
                fontSize: 10.5,
                fontWeight: 700,
                padding: "2px 8px",
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
                fontSize: 13,
                fontWeight: 600,
                color: "var(--text-primary, #ffffff)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                flex: 1,
                minWidth: 0,
              }}
            >
              {entry.title}
            </p>

            <span style={{ fontSize: 11, color: "var(--text-muted, #94a3b8)", flexShrink: 0 }}>
              {formatDate(entry.created_at || entry.date)}
            </span>

            <ChevronDown size={14} color="var(--text-muted, #94a3b8)" style={{ flexShrink: 0 }} />
          </div>
        ) : (
          /* Expanded Card Layout */
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", flex: 1, minWidth: 0 }}>
                {entry.version && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "2px 7px",
                      borderRadius: 6,
                      border: "1px solid var(--border-color, rgba(255,255,255,0.12))",
                      background: "var(--bg-secondary, rgba(255,255,255,0.06))",
                      color: "var(--text-secondary, #94a3b8)",
                      fontFamily: "monospace",
                    }}
                  >
                    {entry.version}
                  </span>
                )}
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: ts.bg,
                    color: ts.color,
                    border: `1px solid ${ts.border}`,
                  }}
                >
                  {entry.isGitCommit ? 'Git Commit' : ts.label}
                </span>
                <span style={{ fontSize: 11, color: "var(--text-muted, #94a3b8)", marginLeft: "auto" }}>
                  {formatDate(entry.created_at || entry.date)}
                </span>
                <ChevronDown size={14} color="var(--text-muted, #94a3b8)" style={{ transform: "rotate(180deg)", transition: "transform 0.2s" }} />
              </div>
            </div>

            <h4 style={{ margin: "0 0 6px", fontSize: 14.5, fontWeight: 700, color: "var(--text-primary, #ffffff)", lineHeight: 1.4 }}>
              {entry.title}
            </h4>

            {entry.description && (
              <p style={{ margin: 0, fontSize: 12.5, color: "var(--text-secondary, #94a3b8)", lineHeight: 1.5 }}>
                {entry.description}
              </p>
            )}

            {Array.isArray(entry.items) && entry.items.length > 0 && (
              <ul style={{ margin: "8px 0 0", paddingLeft: 16, fontSize: 12, color: "var(--text-secondary, #94a3b8)", lineHeight: 1.55 }}>
                {entry.items.map((item, i) => (
                  <li key={i} style={{ marginBottom: 3 }}>{item}</li>
                ))}
              </ul>
            )}

            {entry.url && (
              <div style={{ marginTop: 10 }}>
                <a
                  href={entry.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: "var(--primary-blue, #3b82f6)",
                    textDecoration: "none",
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
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginTop: 12,
                paddingTop: 10,
                borderTop: "1px solid var(--border-color, rgba(255,255,255,0.08))",
                flexWrap: "wrap",
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
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "3px 9px",
                      borderRadius: 20,
                      fontSize: 11.5,
                      background: hasReacted ? "color-mix(in srgb, var(--primary-blue) 16%, var(--bg-secondary))" : "var(--bg-secondary, rgba(255,255,255,0.06))",
                      border: `1px solid ${hasReacted ? "var(--primary-blue, #3b82f6)" : "var(--border-color, rgba(255,255,255,0.12))"}`,
                      color: hasReacted ? "var(--primary-blue, #3b82f6)" : "var(--text-secondary, #94a3b8)",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      fontWeight: 600,
                    }}
                  >
                    <span style={{ fontSize: 12, lineHeight: 1 }}>{rx.emoji}</span>
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
  const { updates, gitCommits, loading, markAllRead, toggleReaction } = useUpdates();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

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
    if (activeTab === "git") {
      return gitCommits || [];
    }

    let list = updates || [];
    if (activeTab !== "all") {
      list = list.filter((e) => e.category === activeTab);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((e) =>
        (e.title || "").toLowerCase().includes(q) ||
        (e.description || "").toLowerCase().includes(q) ||
        (e.version || "").toLowerCase().includes(q)
      );
    }

    return list;
  }, [activeTab, updates, gitCommits, searchQuery]);

  const counts = {
    all: (updates || []).length,
    feature: (updates || []).filter((e) => e.category === "feature").length,
    improvement: (updates || []).filter((e) => e.category === "improvement").length,
    fix: (updates || []).filter((e) => e.category === "fix").length,
    git: (gitCommits || []).length,
  };

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="updates-modal-title"
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
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
            }}
          />

          {/* Modal Container */}
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 15 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '620px',
              backgroundColor: 'var(--bg-secondary, #18191d)',
              borderRadius: '20px',
              border: '1px solid var(--border-color, rgba(255,255,255,0.12))',
              padding: '24px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.45)',
              zIndex: 1000000,
              maxHeight: '88vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header Banner */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(16, 185, 129, 0.2))',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    color: '#3b82f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Sparkles size={20} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 id="updates-modal-title" style={{ fontSize: 17, fontWeight: 800, margin: 0, color: 'var(--text-primary, #ffffff)', letterSpacing: '-0.02em' }}>
                      System Updates & Changelog
                    </h3>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 999,
                        background: 'rgba(59, 130, 246, 0.15)',
                        color: '#3b82f6',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        fontFamily: 'monospace',
                      }}
                    >
                      v1.3.0
                    </span>
                  </div>
                  <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--text-muted, #94a3b8)' }}>
                    Latest feature releases, improvements, and bug fixes
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  border: '1px solid var(--border-color, rgba(255,255,255,0.12))',
                  background: 'var(--bg-primary, rgba(255,255,255,0.06))',
                  color: 'var(--text-muted, #94a3b8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Search & Filter Bar */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '7px 12px',
                  borderRadius: 10,
                  background: 'var(--bg-primary, rgba(0,0,0,0.15))',
                  border: '1px solid var(--border-color, rgba(255,255,255,0.12))',
                }}
              >
                <Search size={14} color="var(--text-muted, #94a3b8)" />
                <input
                  type="text"
                  placeholder="Search release notes or commits..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--text-primary, #ffffff)',
                    fontSize: 12.5,
                    outline: 'none',
                    width: '100%',
                  }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Tabs */}
            <div
              style={{
                display: 'flex',
                gap: 5,
                paddingBottom: 12,
                borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.08))',
                marginBottom: 14,
                overflowX: 'auto',
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
                      cursor: 'pointer',
                      fontSize: 12,
                      padding: '5px 11px',
                      borderRadius: 8,
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      fontWeight: active ? 700 : 500,
                      backgroundColor: active ? 'rgba(59, 130, 246, 0.16)' : 'transparent',
                      color: active ? '#3b82f6' : 'var(--text-secondary, #94a3b8)',
                      transition: 'all 0.15s ease',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {TabIcon && <TabIcon size={12} />}
                    <span>{t.label}</span>
                    <span style={{ opacity: 0.7, fontSize: 10.5 }}>{counts[t.key]}</span>
                  </button>
                );
              })}
            </div>

            {/* Releases List */}
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
              {allEntries.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 16px' }}>
                  <CheckCircle2 size={26} color="#10b981" style={{ margin: '0 auto 8px' }} />
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary, #ffffff)' }}>
                    No updates found
                  </h4>
                  <p style={{ fontSize: 12, color: 'var(--text-muted, #94a3b8)', margin: 0 }}>
                    {searchQuery ? `No release notes matching "${searchQuery}"` : 'All systems are current and up-to-date.'}
                  </p>
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

            {/* Footer */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: 14,
                marginTop: 10,
                borderTop: '1px solid var(--border-color, rgba(255,255,255,0.08))',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'var(--text-muted, #94a3b8)' }}>
                <Layers size={13} color="#10b981" />
                <span>Automated release synchronization active</span>
              </div>

              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '6px 16px',
                  borderRadius: 8,
                  background: 'var(--primary-blue, #3b82f6)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                }}
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
