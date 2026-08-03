import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Wrench, TrendingUp, ChevronDown, Check, RefreshCw } from 'lucide-react';
import { useUpdates } from '../../hooks/useUpdates';

const typeStyles = {
  feature:     { bg: "rgba(16,185,129,0.12)", color: "#10b981", border: "rgba(16,185,129,0.25)", label: "Feature" },
  fix:         { bg: "rgba(245,158,11,0.12)", color: "#f59e0b", border: "rgba(245,158,11,0.25)", label: "Fix" },
  improvement: { bg: "rgba(59,130,246,0.12)", color: "#3b82f6", border: "rgba(59,130,246,0.25)", label: "Improvement" },
};

const filters = [
  { key: "all",         label: "All",          icon: null        },
  { key: "feature",     label: "Features",     icon: Sparkles    },
  { key: "fix",         label: "Fixes",        icon: Wrench      },
  { key: "improvement", label: "Improvements", icon: TrendingUp  },
];

const REACTION_CONFIG = [
  { key: "rocket", emoji: "🚀" },
  { key: "party",  emoji: "🎉" },
  { key: "heart",  emoji: "❤️" },
  { key: "thumbs", emoji: "👍" },
];

function formatDate(d) {
  if (!d) return "";
  try { return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
  catch { return d; }
}

function ModalEntryCard({ entry, index, onReaction }) {
  const [open, setOpen] = useState(index < 2);
  const ts = typeStyles[entry.category] || typeStyles.improvement;
  const isMostRecent = index === 0;

  const rxCounts = entry.reactions || { rocket: 0, party: 0, heart: 0, thumbs: 0 };
  
  const activeReactions = REACTION_CONFIG.filter(rx => {
    const count = rxCounts[rx.key] || 0;
    const hasReacted = localStorage.getItem(`reacted_up_${entry.id}_${rx.key}`) === 'true';
    return count > 0 || hasReacted;
  });

  return (
    <motion.div
      style={{ position: "relative", marginBottom: index < 2 ? 14 : 10, width: "100%" }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.22, delay: index * 0.03 }}
    >
      {/* Card container */}
      <div
        onClick={() => setOpen(v => !v)}
        style={{
          background: "var(--bg-primary)",
          border: "1px solid var(--border-color)",
          borderRadius: 14,
          padding: open && index < 2 ? "14px 16px" : "11px 14px",
          cursor: "pointer",
          userSelect: "none",
          width: "100%",
          boxSizing: "border-box",
          transition: "border-color 0.15s ease, box-shadow 0.15s ease",
        }}
      >
        {!open ? (
          /* Collapsed dense view */
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            {entry.version && (
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 6,
                border: "1px solid var(--border-color)", background: "var(--bg-secondary)",
                color: "var(--text-secondary)", fontFamily: "monospace", flexShrink: 0
              }}>
                {entry.version}
              </span>
            )}
            <span style={{
              fontSize: 10.5, fontWeight: 700, padding: "2px 8px", borderRadius: 999,
              background: ts.bg, color: ts.color, border: `1px solid ${ts.border}`, flexShrink: 0
            }}>
              {ts.label}
            </span>
            <p style={{
              margin: 0, fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1, minWidth: 0
            }}>
              {entry.title}
            </p>
            <span style={{ fontSize: 11, color: "var(--text-muted)", flexShrink: 0 }}>
              {formatDate(entry.created_at || entry.date)}
            </span>
            <ChevronDown size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
          </div>
        ) : (
          /* Expanded Card Layout */
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyBetween: "space-between", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", flex: 1, minWidth: 0 }}>
                {entry.version && (
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 6,
                    border: "1px solid var(--border-color)", background: "var(--bg-secondary)",
                    color: "var(--text-secondary)", fontFamily: "monospace"
                  }}>
                    {entry.version}
                  </span>
                )}
                <span style={{
                  fontSize: 10.5, fontWeight: 700, padding: "2px 8px", borderRadius: 999,
                  background: ts.bg, color: ts.color, border: `1px solid ${ts.border}`
                }}>
                  {ts.label}
                </span>
                <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: "auto" }}>
                  {formatDate(entry.created_at || entry.date)}
                </span>
                <ChevronDown size={14} color="var(--text-muted)" style={{ transform: "rotate(180deg)", transition: "transform 0.2s" }} />
              </div>
            </div>

            <h4 style={{ margin: "0 0 6px", fontSize: 14.5, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.4 }}>
              {entry.title}
            </h4>

            {entry.description && (
              <p style={{ margin: 0, fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                {entry.description}
              </p>
            )}

            {Array.isArray(entry.items) && entry.items.length > 0 && (
              <ul style={{ margin: "8px 0 0", paddingLeft: 16, fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                {entry.items.map((item, i) => (
                  <li key={i} style={{ marginBottom: 3 }}>{item}</li>
                ))}
              </ul>
            )}

            {/* Reactions Row */}
            <div 
              style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--border-color)", flexWrap: "wrap" }}
              onClick={e => e.stopPropagation()}
            >
              {REACTION_CONFIG.map(rx => {
                const count = rxCounts[rx.key] || 0;
                const hasReacted = localStorage.getItem(`reacted_up_${entry.id}_${rx.key}`) === 'true';
                
                return (
                  <button
                    key={rx.key}
                    type="button"
                    onClick={() => onReaction(entry.id, rx.key)}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      padding: "3px 9px", borderRadius: 20, fontSize: 11.5,
                      background: hasReacted ? "color-mix(in srgb, var(--primary-blue) 14%, var(--bg-secondary))" : "var(--bg-secondary)",
                      border: `1px solid ${hasReacted ? "var(--primary-blue)" : "var(--border-color)"}`,
                      color: hasReacted ? "var(--primary-blue)" : "var(--text-secondary)",
                      cursor: "pointer", transition: "all 0.15s ease", fontWeight: 600
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
  const { updates, loading, toggleReaction } = useUpdates();
  const [active, setActive] = useState("all");

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  const filtered = active === "all" ? updates : updates.filter(e => e.category === active);

  const counts = {
    all: updates.length,
    feature: updates.filter(e => e.category === "feature").length,
    fix: updates.filter(e => e.category === "fix").length,
    improvement: updates.filter(e => e.category === "improvement").length,
  };

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
              maxWidth: '600px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '20px',
              border: '1px solid var(--border-color)',
              padding: '24px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
              zIndex: 1000000,
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {/* Top Glow Ambient */}
            <div
              style={{
                position: 'absolute',
                top: '-40px',
                left: '-40px',
                width: '160px',
                height: '160px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, color-mix(in srgb, var(--primary-blue) 25%, transparent) 0%, transparent 70%)',
                filter: 'blur(25px)',
                pointerEvents: 'none'
              }}
            />

            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: 'color-mix(in srgb, var(--primary-blue) 14%, var(--bg-primary))', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={20} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 id="updates-modal-title" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
                      System Updates & Changelog
                    </h3>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--primary-blue)', backgroundColor: 'color-mix(in srgb, var(--primary-blue) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--primary-blue) 25%, transparent)', padding: '2px 8px', borderRadius: '999px' }}>
                      v1.3.0
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                    Latest feature releases, improvements, and bug fixes
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

            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {filters.map(f => {
                const Icon = f.icon;
                const isAct = active === f.key;
                return (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setActive(f.key)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: isAct ? 'var(--primary-blue)' : 'var(--border-color)',
                      backgroundColor: isAct ? '#0f172a' : 'var(--bg-primary)',
                      color: isAct ? '#ffffff' : 'var(--text-secondary)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {Icon && <Icon size={12} />}
                    <span>{f.label}</span>
                    <span style={{ fontSize: '10.5px', opacity: 0.85, fontWeight: 700 }}>({counts[f.key]})</span>
                  </button>
                );
              })}
            </div>

            {/* Scrollable Changelog Timeline Feed */}
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px', marginBottom: '12px' }}>
              {loading ? (
                <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  Loading latest updates...
                </div>
              ) : filtered.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  No updates found in this category.
                </div>
              ) : (
                filtered.map((entry, idx) => (
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
            <div style={{ paddingTop: '10px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                Auto-synced with live telemetry & GitHub
              </span>
              <button
                type="button"
                onClick={onClose}
                style={{
                  height: '34px',
                  padding: '0 16px',
                  borderRadius: '8px',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
