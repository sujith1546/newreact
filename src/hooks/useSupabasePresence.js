import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

const BOT_REGEX = /bot|crawler|spider|lighthouse|bytespider|googlebot|bingbot|yandex/i;

// Use localStorage so all tabs in the same browser share ONE unique device session ID
function getDeviceSessionId() {
  if (typeof window === 'undefined') return 'device_ssr';
  let did = localStorage.getItem('x-visitor-device-id');
  if (!did) {
    did = `dev_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
    localStorage.setItem('x-visitor-device-id', did);
  }
  return did;
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

    const deviceId = getDeviceSessionId();
    let channel;

    // Ultra-fast 50ms evaluation for instant UI updates when peers join or leave
    const updateCountFromPresence = () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = setTimeout(() => {
        try {
          if (!channel) return;
          const state = channel.presenceState();
          const uniqueDevices = Object.keys(state);
          const count = Math.max(1, uniqueDevices.length);
          setVisitorCount(count);
          setIsConnected(true);
        } catch (err) {
          console.warn('Error reading presence state:', err);
        }
      }, 50); // 50ms ultra-fast response
    };

    try {
      // Clear any pre-existing channel for this topic
      const existing = supabase.getChannels().find(
        (c) => c.topic === 'realtime:portfolio_presence' || c.topic === 'portfolio_presence'
      );
      if (existing) {
        supabase.removeChannel(existing);
      }

      channel = supabase.channel('portfolio_presence', {
        config: {
          presence: {
            key: deviceId, // Shared across all tabs on the same device
          },
        },
      });

      // Register presence listeners before subscribe
      channel
        .on('presence', { event: 'sync' }, updateCountFromPresence)
        .on('presence', { event: 'join' }, updateCountFromPresence)
        .on('presence', { event: 'leave' }, updateCountFromPresence);

      channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          try {
            await channel.track({
              online_at: new Date().toISOString(),
              device_id: deviceId,
              page: window.location.pathname,
            });
          } catch (trackErr) {
            console.warn('Presence track warning:', trackErr);
          }
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setIsConnected(false);
        }
      });

      // Untrack immediately when tab/window is closing for instant leave signal
      const handleBeforeUnload = () => {
        if (channel) {
          try { channel.untrack(); } catch { /* ignore */ }
        }
      };
      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
        if (channel) {
          try {
            channel.untrack();
            supabase.removeChannel(channel);
          } catch {
            /* ignore cleanup error */
          }
        }
      };
    } catch (err) {
      console.warn('Presence initialization error:', err);
    }
  }, []);

  return { visitorCount, isConnected };
}
