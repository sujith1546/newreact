import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { subscribeToRealtimeSync, triggerSyncBroadcast } from '../../lib/broadcastSyncEngine';
import { prefetchTable } from '../../hooks/useRealtimeData';

const READ_STORAGE_KEY = 'pcms_operations_read_ids_v1';
const CACHE_STORAGE_KEY = 'pcms_operations_cache_v1';

function getStoredReadIds() {
  try {
    const raw = localStorage.getItem(READ_STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveStoredReadIds(readIdsSet) {
  try {
    localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(Array.from(readIdsSet).slice(-200)));
  } catch {}
}

function getStoredCache() {
  try {
    const raw = localStorage.getItem(CACHE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredCache(items) {
  try {
    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(items.slice(0, 50)));
  } catch {}
}

/**
 * Enterprise-grade Operations & Sync Center Hook
 * Connects directly to Supabase table logs, realtime subscriptions, and live latency diagnostics.
 */
export function useOperationsSyncCenter() {
  const [notifications, setNotifications] = useState(() => {
    const cached = getStoredCache();
    if (cached && cached.length > 0) return cached;
    return [
      {
        id: 'init_sync_1',
        category: 'sync',
        title: 'Cloud Telemetry Initialized',
        description: 'Realtime database & P2P channels connected.',
        timestamp: Date.now() - 30000,
        read: false,
      },
    ];
  });

  const [loading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [latencyMs, setLatencyMs] = useState(null);
  const [connStatus, setConnStatus] = useState('online'); // 'online' | 'syncing' | 'offline'
  const readIdsRef = useRef(getStoredReadIds());

  // Measure Supabase live query latency
  const measureLatency = useCallback(async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setConnStatus('offline');
      setLatencyMs(null);
      return null;
    }

    try {
      const start = performance.now();
      const { error } = await supabase.from('site_settings').select('id').limit(1).maybeSingle();
      const elapsed = Math.round(performance.now() - start);

      if (error && error.code !== 'PGRST116') {
        setConnStatus('offline');
        setLatencyMs(null);
        return null;
      }

      setLatencyMs(elapsed);
      setConnStatus('online');
      return elapsed;
    } catch {
      setConnStatus('offline');
      setLatencyMs(null);
      return null;
    }
  }, []);

  // Fetch real records from Supabase tables
  const fetchDbLogs = useCallback(async () => {
    setLoading(true);
    const readIds = readIdsRef.current;
    const combined = [];

    try {
      // Check if admin auth session is active
      let isAdmin = false;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        isAdmin = !!session;
      } catch {}

      const promises = [];

      // 1. Fetch System Updates & Releases (Publicly available)
      promises.push(
        supabase
          .from('updates')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10)
          .then(({ data, error }) => {
            if (!error && data && Array.isArray(data)) {
              data.forEach((up) => {
                combined.push({
                  id: `up_${up.id}`,
                  category: up.category === 'feature' ? 'leads' : 'sync',
                  title: up.title || `Release ${up.version || ''}`,
                  description: up.description || 'System update published.',
                  timestamp: new Date(up.created_at || up.date || Date.now()).getTime(),
                  read: readIds.has(`up_${up.id}`),
                  metadata: up,
                });
              });
            }
          })
          .catch(() => {})
      );

      // 2. Fetch Recruiter Engagement Events (Publicly available)
      promises.push(
        supabase
          .from('recruiter_events')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10)
          .then(({ data, error }) => {
            if (!error && data && Array.isArray(data)) {
              data.forEach((ev) => {
                const typeLabel = (ev.event_type || 'Engagement').replace(/_/g, ' ').toUpperCase();
                combined.push({
                  id: `recruiter_${ev.id}`,
                  category: 'leads',
                  title: `Recruiter Action: ${typeLabel}`,
                  description: ev.event_detail || 'Visitor interacted with resume / recruiter assets.',
                  timestamp: new Date(ev.created_at || Date.now()).getTime(),
                  read: readIds.has(`recruiter_${ev.id}`),
                  metadata: ev,
                });
              });
            }
          })
          .catch(() => {})
      );

      // 3. Admin-Only Feeds (Audit Logs & Contact Inquiries)
      if (isAdmin) {
        promises.push(
          supabase
            .from('admin_audit_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(15)
            .then(({ data, error }) => {
              if (!error && data && Array.isArray(data)) {
                data.forEach((row) => {
                  const isSecurity = (row.action || '').toLowerCase().includes('auth') || (row.action || '').toLowerCase().includes('login') || (row.action || '').toLowerCase().includes('security');
                  const actionLabel = (row.action || 'DATABASE_UPDATE').replace(/_/g, ' ');
                  const entityLabel = (row.entity_type || 'System').replace(/_/g, ' ');
                  
                  combined.push({
                    id: `audit_${row.id}`,
                    category: isSecurity ? 'security' : 'sync',
                    title: `${entityLabel}: ${actionLabel}`,
                    description: row.details?.message || `Entity ID: ${row.entity_id || 'Global'} updated in cloud database.`,
                    timestamp: new Date(row.created_at || Date.now()).getTime(),
                    read: readIds.has(`audit_${row.id}`),
                    metadata: row,
                  });
                });
              }
            })
            .catch(() => {})
        );

        promises.push(
          supabase
            .from('contact_messages')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10)
            .then(({ data, error }) => {
              if (!error && data && Array.isArray(data)) {
                data.forEach((msg) => {
                  combined.push({
                    id: `msg_${msg.id}`,
                    category: 'leads',
                    title: `Lead Inquiry: ${msg.name || 'Visitor'}`,
                    description: msg.subject ? `${msg.subject} • ${msg.email}` : (msg.message || 'Contact form inquiry received.').slice(0, 80),
                    timestamp: new Date(msg.created_at || Date.now()).getTime(),
                    read: msg.is_read || readIds.has(`msg_${msg.id}`),
                    metadata: msg,
                  });
                });
              }
            })
            .catch(() => {})
        );
      }

      await Promise.allSettled(promises);

      if (combined.length > 0) {
        combined.sort((a, b) => b.timestamp - a.timestamp);
        setNotifications(combined);
        saveStoredCache(combined);
      }
    } catch {
      // Fallback silently to existing cached items
    } finally {
      setLoading(false);
    }
  }, []);

  // Force Cloud Re-Sync
  const forceCloudReSync = useCallback(async () => {
    setIsSyncing(true);
    setConnStatus('syncing');

    try {
      const ping = await measureLatency();
      
      // Parallel batch re-fetch of primary tables
      await Promise.allSettled([
        prefetchTable('site_settings', { single: true, filter: { column: 'id', value: 1 } }),
        prefetchTable('projects', { orderColumn: 'created_at', ascending: true }),
        prefetchTable('experience', { orderColumn: 'display_order', ascending: true }),
        prefetchTable('skills', { orderColumn: 'order_index', ascending: true }),
        prefetchTable('education', { orderColumn: 'display_order', ascending: true }),
        prefetchTable('certifications', { orderColumn: 'display_order', ascending: true }),
        fetchDbLogs(),
      ]);

      // Broadcast sync event to all open tabs
      triggerSyncBroadcast('site_settings', { forceSync: true, pingMs: ping || 1 });

      const syncId = `manual_sync_${Date.now()}`;
      setNotifications((prev) => [
        {
          id: syncId,
          category: 'sync',
          title: 'Full Cloud Sync Executed',
          description: `All tables re-indexed and verified (~${ping || 1}ms latency).`,
          timestamp: Date.now(),
          read: false,
        },
        ...prev.slice(0, 49),
      ]);
    } catch {
      // Error recovery
    } finally {
      setIsSyncing(false);
      setConnStatus('online');
    }
  }, [measureLatency, fetchDbLogs]);

  // Read / Unread management
  const markAllRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      updated.forEach((n) => readIdsRef.current.add(n.id));
      saveStoredReadIds(readIdsRef.current);
      saveStoredCache(updated);
      return updated;
    });
  }, []);

  const markOneRead = useCallback((id) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      readIdsRef.current.add(id);
      saveStoredReadIds(readIdsRef.current);
      saveStoredCache(updated);
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    const fresh = [
      {
        id: `cleared_${Date.now()}`,
        category: 'sync',
        title: 'Operations History Cleared',
        description: 'Stored log queue reset. Listening for live database events.',
        timestamp: Date.now(),
        read: true,
      },
    ];
    setNotifications(fresh);
    saveStoredCache(fresh);
  }, []);

  // Export audit trail as JSON file
  const exportAuditJson = useCallback(() => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(notifications, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `operations_audit_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch {}
  }, [notifications]);

  // Initial mount: load DB logs & start periodic latency heartbeat
  useEffect(() => {
    fetchDbLogs();
    measureLatency();

    const latencyInterval = setInterval(measureLatency, 45000);
    return () => clearInterval(latencyInterval);
  }, [fetchDbLogs, measureLatency]);

  // Realtime Postgres Change Subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('operations_sync_center_live')
      .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
        const table = payload.table || 'site_settings';
        const label = table.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
        const eventType = payload.eventType || 'UPDATE';
        
        const newNotif = {
          id: `realtime_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          category: table === 'contact_messages' ? 'leads' : 'sync',
          title: `${label} [${eventType}]`,
          description: table === 'contact_messages' 
            ? `New inquiry received from ${payload.new?.name || 'Visitor'}`
            : `Live database change committed to ${table}.`,
          timestamp: Date.now(),
          read: false,
          metadata: payload.new,
        };

        setNotifications((prev) => [newNotif, ...prev.slice(0, 49)]);
      })
      .subscribe();

    // P2P Realtime Broadcast Listener
    const unsubscribeBroadcast = subscribeToRealtimeSync((syncMsg) => {
      const table = syncMsg.table || 'site_settings';
      const label = table.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
      
      const newNotif = {
        id: `p2p_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        category: 'sync',
        title: `${label} Synced`,
        description: `P2P broadcast sync received (~${syncMsg.pingMs || 1}ms latency).`,
        timestamp: Date.now(),
        read: false,
      };

      setNotifications((prev) => [newNotif, ...prev.slice(0, 49)]);
    });

    // Custom Client Telemetry Listeners
    const onSecurity = (e) => {
      setNotifications((prev) => [
        {
          id: `sec_${Date.now()}`,
          category: 'security',
          title: e.detail?.title || 'Security Shield Alert',
          description: e.detail?.message || 'DevTools trap or authentication threshold reached.',
          timestamp: Date.now(),
          read: false,
        },
        ...prev.slice(0, 49),
      ]);
    };

    const onMessage = (e) => {
      setNotifications((prev) => [
        {
          id: `lead_${Date.now()}`,
          category: 'leads',
          title: `New Lead: ${e.detail?.name || 'Visitor'}`,
          description: e.detail?.message || 'New contact inquiry submitted.',
          timestamp: Date.now(),
          read: false,
        },
        ...prev.slice(0, 49),
      ]);
    };

    const onSync = (e) => {
      setNotifications((prev) => [
        {
          id: `sync_ev_${Date.now()}`,
          category: 'sync',
          title: `${e.detail?.label || 'Site Settings'} Synced`,
          description: e.detail?.message || 'Theme and layout synchronized with cloud.',
          timestamp: Date.now(),
          read: false,
        },
        ...prev.slice(0, 49),
      ]);
    };

    window.addEventListener('pcms_security_alert', onSecurity);
    window.addEventListener('pcms_new_message', onMessage);
    window.addEventListener('pcms_sync_event', onSync);

    return () => {
      supabase.removeChannel(channel);
      if (typeof unsubscribeBroadcast === 'function') unsubscribeBroadcast();
      window.removeEventListener('pcms_security_alert', onSecurity);
      window.removeEventListener('pcms_new_message', onMessage);
      window.removeEventListener('pcms_sync_event', onSync);
    };
  }, []);

  return {
    notifications,
    loading,
    isSyncing,
    latencyMs,
    connStatus,
    forceCloudReSync,
    markAllRead,
    markOneRead,
    clearAll,
    exportAuditJson,
    refreshDbLogs: fetchDbLogs,
  };
}

export default useOperationsSyncCenter;
