import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

const BOT_REGEX = /bot|crawler|spider|lighthouse|bytespider|googlebot|bingbot|yandex/i;

function getOrSyncSessionId() {
  if (typeof window === 'undefined') return 'session_ssr';
  let sid = sessionStorage.getItem('x-visitor-session-id');
  if (!sid) {
    sid = `sess_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
    sessionStorage.setItem('x-visitor-session-id', sid);
  }
  return sid;
}

export function useSupabasePresence() {
  const [visitorCount, setVisitorCount] = useState(1);
  const [isConnected, setIsConnected] = useState(false);
  const syncTimeoutRef = useRef(null);

  useEffect(() => {
    // 1. Client Bot Filtering
    if (typeof navigator !== 'undefined' && BOT_REGEX.test(navigator.userAgent || '')) {
      setIsConnected(false);
      setVisitorCount(1);
      return;
    }

    if (!supabase || !supabase.channel) {
      setVisitorCount(1);
      return;
    }

    // 2. Cross-tab session deduplication via sessionStorage + BroadcastChannel
    const sessionId = getOrSyncSessionId();
    let bc;
    try {
      if ('BroadcastChannel' in window) {
        bc = new BroadcastChannel('portfolio_session_sync');
        bc.postMessage({ type: 'PING_SESSION', sessionId });
      }
    } catch { /* BroadcastChannel fallback */ }

    let channel;
    try {
      channel = supabase.channel('portfolio_presence', {
        config: {
          presence: {
            key: sessionId, // Shared key across tabs for same session
          },
        },
      });

      // 3. Debounced Sync & 30s Stale Session Pruning
      channel.on('presence', { event: 'sync' }, () => {
        if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);

        syncTimeoutRef.current = setTimeout(() => {
          try {
            const presenceState = channel.presenceState();
            const now = Date.now();
            const uniqueSessionKeys = new Set();

            Object.entries(presenceState).forEach(([key, presences]) => {
              const latest = presences[presences.length - 1];
              // Prune inactive sessions (>30s stale)
              if (latest && latest.last_seen) {
                const age = now - new Date(latest.last_seen).getTime();
                if (age <= 30000) {
                  uniqueSessionKeys.add(key);
                }
              } else {
                uniqueSessionKeys.add(key);
              }
            });

            const count = uniqueSessionKeys.size;
            setVisitorCount(count > 0 ? count : 1);
            setIsConnected(true);
          } catch (err) {
            console.warn('Presence sync error:', err);
          }
        }, 500); // 500ms debounce
      });

      // 4. Track presence payload with last_seen heartbeat
      channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          try {
            await channel.track({
              last_seen: new Date().toISOString(),
              page: window.location.pathname,
              session_id: sessionId,
            });
          } catch (trackErr) {
            console.warn('Presence track warning:', trackErr);
          }
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setIsConnected(false);
        }
      });
    } catch (err) {
      console.warn('Presence initialization error:', err);
    }

    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      if (bc) bc.close();
      if (channel) {
        try {
          channel.untrack();
          supabase.removeChannel(channel);
        } catch { /* ignore cleanup error */ }
      }
    };
  }, []);

  return { visitorCount, isConnected };
}
