import React, { useMemo, useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Bug, Zap, X, ChevronDown, Loader2 } from "lucide-react";
import { supabase } from '../lib/supabaseClient';

const TABS = [
  { key: "all", label: "All" },
  { key: "feature", label: "Features" },
  { key: "fix", label: "Fixes" },
  { key: "perf", label: "Performance" },
];

const TYPE_META = {
  feature: {
    label: "Feature",
    Icon: Sparkles,
    colorClass: "wn-feat-color",
  },
  fix: {
    label: "Fix",
    Icon: Bug,
    colorClass: "wn-fix-color",
  },
  perf: {
    label: "Performance",
    Icon: Zap,
    colorClass: "wn-perf-color",
  },
};

export default function WhatsNewPanel({ open, onClose }) {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [visibleCount, setVisibleCount] = useState(2);
  const [readVersion, setReadVersion] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('lastReadUpdate') || '';
    return '';
  });

  const [sheetScrolled, setSheetScrolled] = useState(false);
  const [sheetScrollable, setSheetScrollable] = useState(false);
  const sheetContentRef = useRef(null);

  useEffect(() => {
    async function fetchUpdates() {
      if (open && updates.length === 0) {
        setLoading(true);
        const { data, error } = await supabase.from('updates').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          setUpdates(data);
          if (data.length > 0) {
            localStorage.setItem('lastReadUpdate', data[0].version);
            setReadVersion(data[0].version);
          }
        }
        setLoading(false);
      }
    }
    fetchUpdates();
  }, [open, updates.length]);

  useEffect(() => {
    if (open) {
      setSheetScrolled(false);
      setSheetScrollable(false);
      setTimeout(() => {
        if (sheetContentRef.current) {
          const { scrollHeight, clientHeight } = sheetContentRef.current;
          setSheetScrollable(scrollHeight > clientHeight + 5);
        }
      }, 200);
    }
  }, [open, activeTab, visibleCount]);

  const filteredReleases = useMemo(() => {
    if (activeTab === "all") return updates;
    return updates
      .map((rel) => ({
        ...rel,
        items: rel.items.filter((item) => item.type === activeTab || (activeTab === 'perf' && item.type === 'improvement')),
      }))
      .filter((rel) => rel.items.length > 0);
  }, [updates, activeTab]);

  const visibleReleases = useMemo(() => {
    return filteredReleases.slice(0, visibleCount).map((release) => {
      const isUnread = !readVersion || release.version > readVersion;
      return {
        ...release,
        unread: isUnread,
      }
    });
  }, [filteredReleases, visibleCount, readVersion]);

  const hasMore = visibleCount < filteredReleases.length;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="wn-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            layout
            className="wn-sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: 'spring', damping: 32, stiffness: 350, mass: 0.9 }}
          >
            {/* Drag handle */}
            <div className="wn-handle-wrap">
              <div className="wn-handle" />
            </div>

            {/* Header */}
            <div className="wn-header">
              <h2 className="wn-title">What's new</h2>
              <button onClick={onClose} aria-label="Close" className="wn-close-btn">
                <X size={16} />
              </button>
            </div>

            {/* Tab bar */}
            <div role="tablist" aria-label="Filter updates by type" className="wn-tabs">
              {TABS.map((tab) => {
                const isActive = tab.key === activeTab;
                return (
                  <button
                    key={tab.key}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveTab(tab.key)}
                    className={`wn-tab ${isActive ? "wn-tab-active" : ""}`}
                  >
                    {tab.label}
                    {isActive && (
                      <motion.div
                        layoutId="whats-new-tab-underline"
                        className="wn-tab-underline"
                        transition={{ type: "spring", stiffness: 500, damping: 40 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Body */}
            <div 
              className="wn-body"
              ref={sheetContentRef}
              onScroll={(e) => { if (e.target.scrollTop > 10 && !sheetScrolled) setSheetScrolled(true); }}
            >
              {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#71717a', display: 'flex', justifyContent: 'center' }}>
                  <Loader2 size={24} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                </div>
              ) : filteredReleases.length === 0 ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="wn-empty"
                >
                  No {activeTab === "all" ? "" : TYPE_META[activeTab]?.label.toLowerCase()} updates in this range yet.
                </motion.p>
              ) : (
                <AnimatePresence mode="popLayout">
                  {visibleReleases.map((release, i) => {
                    if (release.items.length === 0) return null;
                    const isLast = i === visibleReleases.length - 1;
                    return (
                      <motion.div 
                        key={release.version} 
                        layout 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                      className="wn-release-row"
                    >
                      {/* Timeline rail */}
                      <div className="wn-rail">
                        <span className={`wn-rail-dot ${release.unread ? "wn-rail-dot-unread" : ""}`} />
                        {!isLast && <span className="wn-rail-line" />}
                      </div>

                      {/* Release content */}
                      <div className="wn-release-content">
                        <div className="wn-release-header">
                          <span className="wn-release-version">{release.version}</span>
                          <span className="wn-release-label">{release.label}</span>
                        </div>
                        <div className="wn-release-date">{release.date}</div>

                        <div className="wn-items-list">
                          {release.items.map((item, idx) => {
                            const meta = TYPE_META[item.type];
                            const ItemIcon = meta.Icon;
                            return (
                              <div key={idx} className={`wn-item-card ${meta.colorClass}`}>
                                <div className="wn-item-title-row">
                                  <ItemIcon size={14} />
                                  <span>{item.title}</span>
                                </div>
                                <p className="wn-item-body">{item.body}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              )}
              {hasMore && (
                <button
                  onClick={() => setVisibleCount(updates.length)}
                  className="wn-show-more"
                >
                  Show earlier releases
                </button>
              )}
            </div>
            
            <AnimatePresence>
              {sheetScrollable && !sheetScrolled && (
                <motion.div className="wn-scroll-hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                  <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: '2px' }}>Scroll</span>
                    <ChevronDown size={16} />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <style>{`
              .wn-backdrop {
                position: fixed; inset: 0; background: rgba(0,0,0,0.6);
                backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); z-index: 10000;
              }
              .wn-sheet {
                position: fixed; bottom: 0; left: 0; right: 0; z-index: 10001;
                background: var(--bg-secondary); border-radius: 28px 28px 0 0;
                will-change: transform; transform: translateZ(0); backface-visibility: hidden;
                box-shadow: 0 -10px 50px rgba(0,0,0,0.15); display: flex; flex-direction: column;
                max-height: 86vh; max-height: 86dvh;
              }
              .wn-handle-wrap { padding-top: 14px; padding-bottom: 8px; display: flex; justify-content: center; flex-shrink: 0; }
              .wn-handle { width: 40px; height: 4px; border-radius: 2px; background: var(--border-color); }
              .wn-header {
                padding: 12px 20px 10px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;
              }
              .wn-title { font-size: 18px; font-weight: 800; color: var(--text-primary); margin: 0; letter-spacing: -0.02em; }
              .wn-close-btn {
                width: 30px; height: 30px; border-radius: 15px; background: var(--bg-primary);
                border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: center;
                color: var(--text-secondary); cursor: pointer;
              }
              .wn-tabs {
                display: flex; border-bottom: 1px solid var(--border-color); padding: 0 10px; flex-shrink: 0;
              }
              .wn-tab {
                position: relative; flex: 1; padding: 12px 0; font-size: 13px; font-weight: 600;
                color: var(--text-secondary); background: none; border: none; outline: none; cursor: pointer; transition: color 0.2s;
              }
              .wn-tab-active { color: var(--text-primary); }
              .wn-tab-underline {
                position: absolute; bottom: -1px; left: 10px; right: 10px; height: 2px;
                background: var(--primary-blue); border-radius: 2px;
              }
              .wn-body {
                flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column;
              }
              .wn-body::-webkit-scrollbar { display: none; }
              .wn-empty { font-size: 13px; color: var(--text-muted); text-align: center; padding: 30px 0; margin: 0; }
              
              .wn-release-row { display: flex; gap: 14px; }
              .wn-rail { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; }
              .wn-rail-dot { width: 10px; height: 10px; border-radius: 5px; background: var(--border-color); margin-top: 6px; }
              .wn-rail-dot-unread { background: var(--primary-blue); box-shadow: 0 0 0 4px rgba(59,130,246,0.15); }
              .wn-rail-line { width: 2px; flex: 1; background: var(--border-color); margin-top: 8px; opacity: 0.5; }
              
              .wn-release-content { flex: 1; min-width: 0; padding-bottom: 28px; }
              .wn-release-header { display: flex; align-items: baseline; gap: 8px; }
              .wn-release-version { font-size: 14.5px; font-weight: 800; color: var(--text-primary); }
              .wn-release-label { font-size: 13px; color: var(--text-secondary); font-weight: 500; }
              .wn-release-date { font-size: 11px; color: var(--text-muted); margin-bottom: 14px; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
              
              .wn-items-list { display: flex; flex-direction: column; gap: 10px; }
              .wn-item-card {
                background: var(--bg-primary); border: 1px solid var(--border-color);
                border-radius: 12px; padding: 14px;
              }
              .wn-item-title-row { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; font-size: 12.5px; font-weight: 700; }
              .wn-item-body { font-size: 13px; color: var(--text-secondary); line-height: 1.5; margin: 0; }
              
              .wn-feat-color .wn-item-title-row { color: #8b5cf6; }
              .wn-fix-color .wn-item-title-row { color: #f59e0b; }
              .wn-perf-color .wn-item-title-row { color: #10b981; }

              .wn-show-more {
                width: 100%; padding: 12px; font-size: 13px; font-weight: 600;
                color: var(--text-secondary); background: var(--bg-primary);
                border: 1px solid var(--border-color); border-radius: 14px;
                margin-top: 10px; margin-bottom: 20px; cursor: pointer;
              }

              .wn-scroll-hint {
                position: absolute; bottom: 0; left: 0; right: 0; height: 70px;
                background: linear-gradient(to top, var(--bg-secondary) 30%, transparent);
                display: flex; justify-content: center; align-items: flex-end; padding-bottom: 12px;
                pointer-events: none; color: var(--text-secondary); z-index: 100;
                border-bottom-left-radius: 0; border-bottom-right-radius: 0;
              }

              /* ========== MOBILE ULTRA-COMPACT ========== */
              @media (max-width: 900px) {
                .wn-header { padding: 10px 14px 8px; }
                .wn-title { font-size: 14px; }
                .wn-close-btn { width: 24px; height: 24px; border-radius: 12px; }
                
                .wn-tab { padding: 8px 0; font-size: 11px; }
                .wn-body { padding: 12px; }
                
                .wn-release-row { gap: 10px; }
                .wn-rail-dot { width: 8px; height: 8px; margin-top: 4px; }
                
                .wn-release-content { padding-bottom: 20px; }
                .wn-release-version { font-size: 13px; }
                .wn-release-label { font-size: 11px; }
                .wn-release-date { font-size: 9px; margin-bottom: 10px; }
                
                .wn-item-card { padding: 10px; border-radius: 10px; }
                .wn-item-title-row { font-size: 11px; margin-bottom: 4px; }
                .wn-item-body { font-size: 10px; line-height: 1.4; }
                
                .wn-show-more { padding: 8px; font-size: 11px; }
              }
            `}</style>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
