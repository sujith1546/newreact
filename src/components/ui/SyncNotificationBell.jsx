import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Bell, RefreshCw, Check, Sparkles, X, CheckCheck, Shield, MessageSquare, Layers, Trash2, ArrowUpRight, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import { subscribeToRealtimeSync } from '../../lib/broadcastSyncEngine';

const STORAGE_KEY = 'pcms_notifications_v2';
const UNREAD_KEY = 'pcms_unread_count_v2';

function timeAgo(date) {
  if (!date) return 'Just now';
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (isNaN(seconds) || seconds < 10) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function SyncNotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'sync' | 'security' | 'messages'
  const [copiedId, setCopiedId] = useState(null);

  // 1. Persistent Storage State Initialization
  const [notifications, setNotifications] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (_) {}
    return [
      {
        id: 'init_sync',
        title: 'Cloud Sync Engine Connected',
        detail: 'Realtime database & P2P channels operational',
        time: new Date().toISOString(),
        category: 'sync',
        count: 1,
      }
    ];
  });

  const [unreadCount, setUnreadCount] = useState(() => {
    try {
      const raw = localStorage.getItem(UNREAD_KEY);
      return raw ? parseInt(raw, 10) : 1;
    } catch (_) {
      return 1;
    }
  });

  const dropdownRef = useRef(null);
  const rollupTimerRef = useRef(null);
  const lastSyncBatchRef = useRef({ items: [], timer: null });

  // Save to localStorage when state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.slice(0, 30)));
    } catch (_) {}
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem(UNREAD_KEY, String(unreadCount));
    } catch (_) {}
  }, [unreadCount]);

  // 2. Rollup & Event Add Engine (10-second sliding window for rapid syncs)
  const addNotification = (notifData) => {
    const now = Date.now();
    const category = notifData.category || 'sync';

    if (category === 'sync') {
      const batch = lastSyncBatchRef.current;
      batch.items.push(notifData.title);

      if (batch.timer) clearTimeout(batch.timer);

      batch.timer = setTimeout(() => {
        const items = [...batch.items];
        batch.items = [];
        batch.timer = null;

        if (items.length === 1) {
          const newNotif = {
            id: now + Math.random(),
            title: items[0],
            detail: notifData.detail || 'PostgreSQL mutation synchronized',
            time: new Date().toISOString(),
            category: 'sync',
            count: 1,
            actionType: 'refresh',
          };
          setNotifications((prev) => [newNotif, ...prev.slice(0, 29)]);
        } else if (items.length > 1) {
          const uniqueItems = [...new Set(items)];
          const newNotif = {
            id: now + Math.random(),
            title: `🧠 ${items.length} Live Syncs Buffered`,
            detail: `Updated: ${uniqueItems.slice(0, 3).join(', ')}${uniqueItems.length > 3 ? ` +${uniqueItems.length - 3} more` : ''}`,
            time: new Date().toISOString(),
            category: 'sync',
            count: items.length,
            actionType: 'refresh',
          };
          setNotifications((prev) => [newNotif, ...prev.slice(0, 29)]);
        }
        setUnreadCount((c) => c + 1);
      }, 1000); // 1s rollup buffer window
      return;
    }

    // Direct addition for security & messages
    const newNotif = {
      id: now + Math.random(),
      title: notifData.title,
      detail: notifData.detail,
      time: new Date().toISOString(),
      category: category,
      count: 1,
      actionType: notifData.actionType,
      payload: notifData.payload,
    };
    setNotifications((prev) => [newNotif, ...prev.slice(0, 29)]);
    setUnreadCount((c) => c + 1);
  };

  // 3. Realtime Listeners
  useEffect(() => {
    // Supabase Realtime DB changes
    const channel = supabase
      .channel('bell_portfolio_realtime_v2')
      .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
        const table = payload.table || 'Site Settings';
        const label = table.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
        addNotification({
          title: `${label} updated`,
          detail: 'Database change synced via WebSocket',
          category: 'sync',
        });
      })
      .subscribe();

    // Inter-tab P2P Broadcast
    const unsubscribeBroadcast = subscribeToRealtimeSync((syncMsg) => {
      const table = syncMsg.table || 'site_settings';
      const label = table.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
      addNotification({
        title: `${label} synced`,
        detail: `P2P broadcast event (~${syncMsg.pingMs || 1}ms)`,
        category: 'sync',
      });
    });

    // Custom Security Alert Listener
    const onSecurityAlert = (e) => {
      addNotification({
        title: e.detail?.title || '🛡️ Security Event Detected',
        detail: e.detail?.message || 'DevTools trap or authentication attempt',
        category: 'security',
        actionType: 'security_audit',
      });
    };

    // Custom Message Listener
    const onNewMessage = (e) => {
      addNotification({
        title: `💬 New Message from ${e.detail?.name || 'Visitor'}`,
        detail: (e.detail?.message || 'New contact inquiry received').slice(0, 60) + '…',
        category: 'messages',
        actionType: 'copy_email',
        payload: e.detail?.email || 'sujithreddy1546@gmail.com',
      });
    };

    // Custom Sync Event Fallback
    const onCustomSync = (e) => {
      addNotification({
        title: `${e.detail?.label || 'Site Settings'} updated`,
        detail: e.detail?.message || 'Realtime update received',
        category: 'sync',
      });
    };

    window.addEventListener('pcms_security_alert', onSecurityAlert);
    window.addEventListener('pcms_new_message', onNewMessage);
    window.addEventListener('pcms_sync_event', onCustomSync);

    return () => {
      supabase.removeChannel(channel);
      if (typeof unsubscribeBroadcast === 'function') unsubscribeBroadcast();
      window.removeEventListener('pcms_security_alert', onSecurityAlert);
      window.removeEventListener('pcms_new_message', onNewMessage);
      window.removeEventListener('pcms_sync_event', onCustomSync);
    };
  }, []);

  // 4. Click Outside Listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // 5. Open & Mark Read
  const handleToggle = () => {
    if (!isOpen) {
      setUnreadCount(0);
    }
    setIsOpen((prev) => !prev);
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  // Filtered Notifications based on activeTab
  const filteredNotifications = useMemo(() => {
    if (activeTab === 'all') return notifications;
    return notifications.filter((n) => n.category === activeTab);
  }, [notifications, activeTab]);

  // Counts per channel
  const counts = useMemo(() => {
    return {
      all: notifications.length,
      sync: notifications.filter((n) => n.category === 'sync').length,
      security: notifications.filter((n) => n.category === 'security').length,
      messages: notifications.filter((n) => n.category === 'messages').length,
    };
  }, [notifications]);

  // Execute 1-Click Action
  const handleAction = (item) => {
    if (item.actionType === 'refresh' || item.category === 'sync') {
      window.dispatchEvent(new CustomEvent('pcms_force_refresh'));
      alert('🔄 Caches purged & site re-synced!');
    } else if (item.actionType === 'copy_email' || item.payload) {
      navigator.clipboard.writeText(item.payload || 'sujithreddy1546@gmail.com');
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    } else if (item.actionType === 'security_audit' || item.category === 'security') {
      window.location.href = '/admin/dashboard';
    }
  };

  return (
    <div className="sync-bell-wrapper" ref={dropdownRef} style={{ position: 'relative', display: 'inline-block', flexShrink: 0 }}>
      <style>{`
        .sync-bell-wrapper {
          position: relative;
          display: inline-block;
          flex-shrink: 0;
        }

        .sync-bell-btn {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border-color, rgba(128,128,128,0.2));
          background: var(--bg-secondary, rgba(255,255,255,0.85));
          color: var(--text-primary, #0f172a);
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.08);
          outline: none;
          position: relative;
        }

        [data-theme="dark"] .sync-bell-btn {
          background: rgba(30, 30, 30, 0.5);
          border-color: rgba(255,255,255,0.08);
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }

        .sync-bell-btn:hover {
          border-color: rgba(99, 102, 241, 0.4);
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.25);
          transform: translateY(-1px);
          color: #6366f1;
        }

        .sync-bell-btn:active {
          transform: translateY(0);
        }

        .sync-bell-badge {
          position: absolute;
          top: 2px;
          right: 2px;
          min-width: 14px;
          height: 14px;
          border-radius: 10px;
          background: #6366f1;
          color: #fff;
          font-size: 9px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 3px;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.6);
          border: 1.5px solid var(--bg-secondary, #0b0d10);
        }

        .sync-bell-dropdown {
          position: absolute;
          top: 44px;
          right: 0;
          width: 320px;
          border-radius: 16px;
          background: var(--bg-secondary, rgba(18, 18, 22, 0.95));
          border: 1px solid var(--border-color, rgba(255,255,255,0.12));
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 18px 45px -8px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(99, 102, 241, 0.15);
          z-index: 3000;
          overflow: hidden;
        }

        .sync-bell-tab {
          padding: 5px 9px;
          border-radius: 6px;
          font-size: 10.5px;
          font-weight: 600;
          border: none;
          background: transparent;
          color: var(--text-muted, #94a3b8);
          cursor: pointer;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .sync-bell-tab.active {
          background: rgba(99, 102, 241, 0.15);
          color: #6366f1;
          font-weight: 700;
        }
      `}</style>

      {/* Bell Trigger Button with Persistent Unread Counter */}
      <button
        type="button"
        onClick={handleToggle}
        className="sync-bell-btn"
        aria-label="Notifications & Operations Center"
        title="Live Operations & Sync Bell"
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <motion.span
            className="sync-bell-badge"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown Operations Console */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="sync-bell-dropdown"
            initial={{ opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
          >
            {/* ── 1. Header ── */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 14px 8px', borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.08))',
              background: 'rgba(99, 102, 241, 0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={14} color="#6366f1" />
                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary, #fff)', fontFamily: "'Space Grotesk', sans-serif" }}>
                  Operations & Sync Center
                </span>
              </div>
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  style={{
                    background: 'none', border: 'none',
                    fontSize: 10.5, fontWeight: 600,
                    color: 'var(--text-muted, #94a3b8)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 4
                  }}
                >
                  <Trash2 size={11} /> Clear
                </button>
              )}
            </div>

            {/* ── 2. Multi-Channel Categorization Tabs ── */}
            <div style={{ display: 'flex', gap: 2, padding: '6px 8px', borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.06))', background: 'rgba(0,0,0,0.1)' }}>
              {[
                ['all', `All (${counts.all})`],
                ['sync', `⚡ Sync (${counts.sync})`],
                ['security', `🛡️ Security (${counts.security})`],
                ['messages', `💬 Leads (${counts.messages})`],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={`sync-bell-tab ${activeTab === key ? 'active' : ''}`}
                  onClick={() => setActiveTab(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* ── 3. Notification List with 1-Click Actions ── */}
            <div style={{ maxHeight: 300, overflowY: 'auto', padding: '4px 0' }}>
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((item) => {
                  const isSync = item.category === 'sync';
                  const isSec = item.category === 'security';
                  const isMsg = item.category === 'messages';
                  const color = isSec ? '#EF4444' : isMsg ? '#10B981' : '#6366F1';
                  const Icon = isSec ? Shield : isMsg ? MessageSquare : RefreshCw;

                  return (
                    <div
                      key={item.id}
                      style={{
                        padding: '10px 14px',
                        borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.04))',
                        transition: 'background 0.15s',
                      }}
                    >
                      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <div style={{
                          width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                          background: `${color}18`, border: `1px solid ${color}35`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: color, marginTop: 1
                        }}>
                          <Icon size={12} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary, #fff)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {item.title}
                            </span>
                            <span style={{ fontSize: 9.5, color: 'var(--text-muted, #94a3b8)', flexShrink: 0, marginLeft: 6 }}>
                              {timeAgo(item.time)}
                            </span>
                          </div>
                          <p style={{ margin: '2px 0 6px', fontSize: 11, color: 'var(--text-muted, #94a3b8)', lineHeight: 1.35 }}>
                            {item.detail}
                          </p>

                          {/* 1-Click Quick Action Buttons */}
                          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                            {isSync && (
                              <button
                                type="button"
                                onClick={() => handleAction(item)}
                                style={{
                                  background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.25)',
                                  borderRadius: 5, color: '#6366F1', fontSize: 10, fontWeight: 700,
                                  padding: '3px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
                                }}
                              >
                                <RefreshCw size={10} /> Purge Cache
                              </button>
                            )}
                            {isSec && (
                              <button
                                type="button"
                                onClick={() => handleAction(item)}
                                style={{
                                  background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.25)',
                                  borderRadius: 5, color: '#EF4444', fontSize: 10, fontWeight: 700,
                                  padding: '3px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
                                }}
                              >
                                <Shield size={10} /> Security Audit <ArrowUpRight size={9} />
                              </button>
                            )}
                            {isMsg && (
                              <button
                                type="button"
                                onClick={() => handleAction(item)}
                                style={{
                                  background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)',
                                  borderRadius: 5, color: '#10B981', fontSize: 10, fontWeight: 700,
                                  padding: '3px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
                                }}
                              >
                                <Copy size={10} /> {copiedId === item.id ? 'Copied!' : 'Copy Email'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: '28px 14px', textAlign: 'center', color: 'var(--text-muted, #94a3b8)' }}>
                  <CheckCheck size={24} style={{ opacity: 0.3, marginBottom: 6 }} />
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary, #fff)' }}>No {activeTab} notifications</div>
                  <div style={{ fontSize: 10.5, marginTop: 2 }}>All systems operational</div>
                </div>
              )}
            </div>

            {/* ── 4. Footer ── */}
            <div style={{
              padding: '8px 14px',
              borderTop: '1px solid var(--border-color, rgba(255,255,255,0.08))',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              fontSize: 10, color: 'var(--text-muted, #94a3b8)',
              background: 'var(--bg-primary, rgba(0,0,0,0.2))'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 5px #10b981' }} />
                Realtime Operations Active
              </span>
              <span>Saved to Storage</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
