import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

const BOT_REGEX = /bot|crawler|spider|lighthouse|bytespider|googlebot|bingbot|yandex/i;

function getVisitorSessionId() {
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
  const heartbeatRef = useRef(null);
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

    const sessionId = getVisitorSessionId();
    let channel;

    const updateCountFromState = (presenceState) => {
      try {
        const now = Date.now();
        const activeKeys = new Set();

        Object.entries(presenceState).forEach(([key, presences]) => {
          if (!presences || presences.length === 0) return;
          const latest = presences[presences.length - 1];

          // If last_seen is present, prune if inactive for >60s
          if (latest && latest.last_seen) {
            const age = now - new Date(latest.last_seen).getTime();
            if (age <= 60000) {
              activeKeys.add(key);
            }
          } else {
            activeKeys.add(key);
          }
        });

        const totalActive = Math.max(1, activeKeys.size);
        setVisitorCount(totalActive);
        setIsConnected(true);
      } catch (err) {
        console.warn('Error updating presence count:', err);
      }
    };

    try {
      channel = supabase.channel('portfolio_presence', {
        config: {
          presence: {
            key: sessionId,
          },
        },
      });

      // Handle presence state syncs, joins, and leaves
      const handlePresenceChange = () => {
        if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = setTimeout(() => {
          const state = channel.presenceState();
          updateCountFromState(state);
        }, 300);
      };

      channel
        .on('presence', { event: 'sync' }, handlePresenceChange)
        .on('presence', { event: 'join' }, handlePresenceChange)
        .on('presence', { event: 'leave' }, handlePresenceChange);

      // Subscribe and start 15s Heartbeat
      channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          const sendHeartbeat = async () => {
            try {
              await channel.track({
                last_seen: new Date().toISOString(),
                page: window.location.pathname,
                session_id: sessionId,
              });
            } catch (e) {
              /* ignore transient heartbeat error */
            }
          };

          // Initial track
          await sendHeartbeat();

          // Continuous 15-second heartbeat so active users are never falsely pruned
          heartbeatRef.current = setInterval(sendHeartbeat, 15000);
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setIsConnected(false);
        }
      });
    } catch (err) {
      console.warn('Presence initialization error:', err);
    }

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
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
