import React, { useState, useEffect, useRef } from 'react';
import { Bell, RefreshCw, Check, Sparkles, X, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import { subscribeToRealtimeSync } from '../../lib/broadcastSyncEngine';

function timeAgo(date) {
  if (!date) return 'Just now';
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 10) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function SyncNotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 'init_sync',
      title: 'Cloud Sync Connected',
      detail: 'Realtime database & P2P channels active',
      time: new Date(),
      type: 'info'
    }
  ]);
  const dropdownRef = useRef(null);

  // 1. Realtime Listeners for Sync Events
  useEffect(() => {
    const handleAddEvent = (table, msg) => {
      const label = table.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
      const newNotif = {
        id: Date.now() + Math.random(),
        title: `${label} synced`,
        detail: msg || 'Site content updated live from cloud',
        time: new Date(),
        type: 'sync'
      };

      setNotifications((prev) => [newNotif, ...prev.slice(0, 19)]);
      setHasUnread(true);
    };

    // Supabase Realtime DB changes
    const channel = supabase
      .channel('bell_portfolio_realtime')
      .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
        const table = payload.table || 'Site Settings';
        handleAddEvent(table, 'PostgreSQL database mutation synchronized');
      })
      .subscribe();

    // Inter-tab P2P Broadcast channel
    const unsubscribeBroadcast = subscribeToRealtimeSync((syncMsg) => {
      const table = syncMsg.table || 'site_settings';
      handleAddEvent(table, `P2P sync event (~${syncMsg.pingMs || 1}ms)`);
    });

    // Global custom event fallback listener
    const onCustomSync = (e) => {
      const label = e.detail?.label || 'Site Settings';
      handleAddEvent(label, e.detail?.message || 'Realtime update received');
    };
    window.addEventListener('pcms_sync_event', onCustomSync);

    return () => {
      supabase.removeChannel(channel);
      if (typeof unsubscribeBroadcast === 'function') unsubscribeBroadcast();
      window.removeEventListener('pcms_sync_event', onCustomSync);
    };
  }, []);

  // 2. Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // 3. Toggle dropdown & clear badge dot
  const handleToggle = () => {
    if (!isOpen) {
      setHasUnread(false);
    }
    setIsOpen((prev) => !prev);
  };

  const clearAll = () => {
    setNotifications([]);
    setHasUnread(false);
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
          top: 3px;
          right: 3px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #6366f1;
          box-shadow: 0 0 8px #6366f1;
          border: 1.5px solid var(--bg-secondary, #0b0d10);
        }

        .sync-bell-dropdown {
          position: absolute;
          top: 44px;
          right: 0;
          width: 300px;
          border-radius: 14px;
          background: var(--bg-secondary, rgba(18, 18, 22, 0.95));
          border: 1px solid var(--border-color, rgba(255,255,255,0.12));
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 16px 40px -6px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(99, 102, 241, 0.15);
          z-index: 3000;
          overflow: hidden;
        }
      `}</style>

      {/* Bell Circular Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        className="sync-bell-btn"
        aria-label="Notifications & Sync activity"
        title="Live Sync Notifications"
      >
        <Bell size={17} />
        {hasUnread && (
          <motion.span
            className="sync-bell-badge"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          />
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="sync-bell-dropdown"
            initial={{ opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 14px', borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.08))',
              background: 'rgba(99, 102, 241, 0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={14} color="#6366f1" />
                <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary, #fff)' }}>
                  Cloud Sync Activity
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
                  Clear
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div style={{ maxHeight: 280, overflowY: 'auto', padding: '6px 0' }}>
              {notifications.length > 0 ? (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex', gap: 10, alignItems: 'flex-start',
                      padding: '10px 14px',
                      borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.04))',
                      transition: 'background 0.15s',
                    }}
                  >
                    <div style={{
                      width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                      background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.25)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#6366f1', marginTop: 1
                    }}>
                      <RefreshCw size={12} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary, #fff)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.title}
                        </span>
                        <span style={{ fontSize: 10, color: 'var(--text-muted, #94a3b8)', flexShrink: 0, marginLeft: 6 }}>
                          {timeAgo(item.time)}
                        </span>
                      </div>
                      <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-muted, #94a3b8)', lineHeight: 1.3 }}>
                        {item.detail}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '24px 14px', textAlign: 'center', color: 'var(--text-muted, #94a3b8)' }}>
                  <CheckCheck size={24} style={{ opacity: 0.4, marginBottom: 6 }} />
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary, #fff)' }}>All synced & up to date</div>
                  <div style={{ fontSize: 10.5, marginTop: 2 }}>No recent sync activity</div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{
              padding: '8px 14px',
              borderTop: '1px solid var(--border-color, rgba(255,255,255,0.08))',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              fontSize: 10.5, color: 'var(--text-muted, #94a3b8)',
              background: 'var(--bg-primary, rgba(0,0,0,0.2))'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 5px #10b981' }} />
                Realtime WebSockets
              </span>
              <span>Purges cache automatically</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
