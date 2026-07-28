import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

/**
 * RLS & Security Policy Note:
 * The Supabase anon key used in this hook is restricted to public presence channel scoping 
 * ('portfolio_presence') and does NOT grant elevated read/write access to restricted tables.
 * Presence tracking relies on transient WebSockets rather than persistent database table writes.
 */

export function useSupabasePresence() {
  const [visitorCount, setVisitorCount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Check if Supabase client is configured
    if (!supabase || !supabase.channel) {
      setVisitorCount(null);
      return;
    }

    // Generate unique session ID for this visitor tab
    const sessionId = `user_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
    let channel;

    try {
      channel = supabase.channel('portfolio_presence', {
        config: {
          presence: {
            key: sessionId,
          },
        },
      });

      // Handle presence sync event
      channel.on('presence', { event: 'sync' }, () => {
        try {
          const presenceState = channel.presenceState();
          const count = Object.keys(presenceState).length;
          setVisitorCount(count > 0 ? count : 1);
          setIsConnected(true);
        } catch (err) {
          console.warn('Supabase presence state error:', err);
          setVisitorCount(null);
        }
      });

      // Handle connection status changes
      channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          try {
            await channel.track({
              online_at: new Date().toISOString(),
              page: window.location.pathname,
            });
          } catch (trackErr) {
            console.warn('Presence track warning:', trackErr);
          }
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          setIsConnected(false);
          setVisitorCount(null);
        }
      });
    } catch (error) {
      console.warn('Failed to initialize Supabase presence WebSocket:', error);
      setIsConnected(false);
      setVisitorCount(null);
    }

    // Cleanup: Unsubscribe on unmount to prevent websocket connection leaks
    return () => {
      if (channel) {
        try {
          channel.untrack();
          supabase.removeChannel(channel);
        } catch (cleanupErr) {
          console.warn('Presence cleanup error:', cleanupErr);
        }
      }
    };
  }, []);

  return { visitorCount, isConnected };
}
