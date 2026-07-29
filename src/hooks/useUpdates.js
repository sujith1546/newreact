import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const READ_KEY = 'updates_last_seen';

const FALLBACK_UPDATES = [
  {
    id: '1',
    title: 'Added AI financial advisor & portfolio assistant',
    description: 'Interactive AI chat powered by Groq LLM answering questions about projects, data science background, and technical stack.',
    category: 'feature',
    published: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
  },
  {
    id: '2',
    title: 'Fixed mobile viewport & section spacing bug',
    description: 'Standardized global 32px top spacing and fixed calc height formulas across all portfolio pages.',
    category: 'fix',
    published: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), // 1 day ago
  },
  {
    id: '3',
    title: 'Redesigned Contact & Signals cards',
    description: 'Updated 2-column contact cards with live IST clock, response estimate, vCard download, and WhatsApp link.',
    category: 'improvement',
    published: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
  },
  {
    id: '4',
    title: 'PWA offline capability & real-time presence',
    description: 'Integrated vite-plugin-pwa service worker and Supabase Realtime visitor tracking badge.',
    category: 'feature',
    published: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
  },
];

export function useUpdates() {
  const [updates, setUpdates] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let channel;

    function computeUnread(list) {
      const lastSeen = localStorage.getItem(READ_KEY);
      const lastSeenDate = lastSeen ? new Date(lastSeen) : null;
      const count = lastSeenDate
        ? list.filter(u => new Date(u.created_at) > lastSeenDate).length
        : list.length;
      setUnreadCount(count);
    }

    async function load() {
      try {
        const { data, error } = await supabase
          .from('updates')
          .select('*')
          .eq('published', true)
          .order('created_at', { ascending: false })
          .limit(20);

        if (!error && data && data.length > 0) {
          setUpdates(data);
          computeUnread(data);
        } else {
          setUpdates(FALLBACK_UPDATES);
          computeUnread(FALLBACK_UPDATES);
        }
      } catch {
        setUpdates(FALLBACK_UPDATES);
        computeUnread(FALLBACK_UPDATES);
      } finally {
        setLoading(false);
      }
    }

    load();

    try {
      channel = supabase
        .channel('updates-feed')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'updates' },
          (payload) => {
            if (payload.new && payload.new.published) {
              setUpdates(prev => [payload.new, ...prev]);
              setUnreadCount(prev => prev + 1);
            }
          }
        )
        .subscribe();
    } catch { /* ignore realtime subscription error if table absent */ }

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  function markAllRead() {
    localStorage.setItem(READ_KEY, new Date().toISOString());
    setUnreadCount(0);
  }

  return { updates, unreadCount, loading, markAllRead };
}
