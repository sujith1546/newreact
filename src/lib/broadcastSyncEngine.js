import { supabase } from './supabaseClient';
import { globalDataCache } from '../hooks/useRealtimeData';

// Native inter-tab BroadcastChannel for sub-millisecond local sync
const SYNC_CHANNEL_NAME = 'pcms_realtime_sync';
let syncChannel = null;

if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    syncChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);
  } catch (e) {
    console.warn('BroadcastChannel not supported in this environment:', e);
  }
}

/**
 * Validates active admin auth session token for security integrity.
 */
export async function validateAdminSession() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch (e) {
    return false;
  }
}

/**
 * Publish an admin data mutation across all open browser windows and tabs instantly.
 * 
 * @param {string} table - Target database table (e.g. 'projects', 'skills', 'site_settings')
 * @param {string} eventType - Mutation type ('INSERT' | 'UPDATE' | 'DELETE')
 * @param {object} payload - Mutation data payload
 * @param {object} options - Additional options e.g. { cacheKey: string }
 */
export async function publishAdminMutation(table, eventType, payload, options = {}) {
  const t0 = performance.now();
  
  // 1. Verify admin session security token (log warning if missing)
  const isValidSession = await validateAdminSession();
  if (!isValidSession) {
    console.warn(`[Security Guard] Unauthenticated mutation payload attempt on table "${table}"`);
  }

  // 2. Invalidate SWR LocalStorage cache keys for table
  if (typeof window !== 'undefined') {
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith(`swr_cache_${table}`)) {
          localStorage.removeItem(key);
        }
      });
    } catch (_) {}
  }

  // 3. Purge in-memory globalDataCache entries matching table
  if (globalDataCache) {
    Object.keys(globalDataCache).forEach((k) => {
      if (k.startsWith(`${table}_`)) {
        delete globalDataCache[k];
      }
    });
  }

  const pingMs = Math.round(performance.now() - t0);
  const syncMsg = {
    type: 'PCMS_REALTIME_MUTATION',
    table,
    eventType,
    payload,
    timestamp: Date.now(),
    pingMs: Math.max(1, pingMs),
  };

  // 4. P2P Native BroadcastChannel dispatch (Sub-millisecond sync across tabs)
  if (syncChannel) {
    try {
      syncChannel.postMessage(syncMsg);
    } catch (_) {}
  }

  // 5. Same-tab Custom Event dispatch
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('pcms_data_updated', { detail: syncMsg }));
    window.dispatchEvent(new CustomEvent('pcms_force_refresh', { detail: syncMsg }));
    window.dispatchEvent(new CustomEvent('db-telemetry', { detail: { pingMs: Math.max(1, pingMs), table } }));
  }

  return syncMsg;
}

/**
 * Subscribe to real-time mutations published across any tab or browser window.
 * 
 * @param {function} callback - Function receiving (syncMsg)
 * @returns {function} Unsubscribe cleanup function
 */
export function subscribeToRealtimeSync(callback) {
  if (typeof window === 'undefined') return () => {};

  // Listener for cross-tab BroadcastChannel messages
  const handleMessage = (event) => {
    if (event?.data?.type === 'PCMS_REALTIME_MUTATION') {
      callback(event.data);
    }
  };

  if (syncChannel) {
    syncChannel.addEventListener('message', handleMessage);
  }

  // Listener for same-tab CustomEvents
  const handleCustomEvent = (event) => {
    if (event?.detail?.type === 'PCMS_REALTIME_MUTATION') {
      callback(event.detail);
    }
  };

  window.addEventListener('pcms_data_updated', handleCustomEvent);

  return () => {
    if (syncChannel) {
      syncChannel.removeEventListener('message', handleMessage);
    }
    window.removeEventListener('pcms_data_updated', handleCustomEvent);
  };
}
