import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Safely removes a Supabase realtime channel without throwing
 * "WebSocket is closed before the connection is established"
 * when unmounting while socket connection is still joining/connecting.
 */
export const safeRemoveChannel = (channel) => {
  if (!channel) return;
  try {
    if (channel.state === 'joining' || channel.state === 'closed' || channel.state === 'leaving') {
      setTimeout(() => {
        try {
          if (channel) supabase.removeChannel(channel);
        } catch (e) {}
      }, 500);
    } else {
      supabase.removeChannel(channel);
    }
  } catch (err) {}
};
