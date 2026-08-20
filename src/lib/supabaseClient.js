import { createClient } from '@supabase/supabase-js';
import { sessionAuthStorage } from './sessionSecurity';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
    timeout: 30000,
  },
  auth: {
    storage: sessionAuthStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Safely removes a Supabase realtime channel without throwing
 * "WebSocket is closed before the connection is established"
 * when unmounting while socket connection is still joining/connecting.
 */
export const safeRemoveChannel = (channel) => {
  if (!channel) return;
  try {
    const state = channel.state;
    if (state === 'joining' || state === 'leaving' || state === 'closed') {
      setTimeout(() => {
        try {
          if (channel) {
            channel.unsubscribe();
            supabase.removeChannel(channel);
          }
        } catch (e) {}
      }, 400);
    } else {
      channel.unsubscribe();
      supabase.removeChannel(channel);
    }
  } catch (err) {}
};
