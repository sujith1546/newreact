import { useState, useEffect } from 'react';
import { supabase, safeRemoveChannel } from '../lib/supabaseClient';

const READ_KEY = 'updates_last_seen';
const LOCAL_UPDATES_KEY = 'pcms_local_updates';

const FALLBACK_UPDATES = [
  {
    id: '1',
    title: 'v2.4.0 — AI Financial Advisor & Control Center Overhaul',
    version: 'v2.4.0',
    impact: 'Major',
    label: 'v2.4.0 Release',
    description: 'Integrated interactive Groq LLM portfolio assistant, 1-Click JSON backup system, and dark SaaS admin design system.',
    category: 'feature',
    published: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    items: [
      '[Feature] Added AI assistant powered by Groq Llama 3.',
      '[Feature] 1-Click full CMS backup & JSON data exporter.',
      '[Improvement] Dark SaaS Admin Console with 60% high-density scaling.',
      '[Security] Unified site lockdown and maintenance controls.'
    ],
    reactions: { rocket: 14, party: 8, heart: 22, thumbs: 19 }
  },
  {
    id: '2',
    title: 'v2.3.1 — Mobile Viewport & High-Density UI Polish',
    version: 'v2.3.1',
    impact: 'Patch',
    label: 'v2.3.1 Patch',
    description: 'Standardized global 32px top spacing and fixed calc height formulas across all portfolio pages.',
    category: 'fix',
    published: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    items: [
      '[Fix] Fixed mobile viewport scrollbar and overflow math.',
      '[Perf] Reduced chunk bundle sizes for faster mobile loading.'
    ],
    reactions: { rocket: 5, party: 3, heart: 9, thumbs: 12 }
  },
  {
    id: '3',
    title: 'v2.2.0 — Redesigned Contact & Live Signals Cards',
    version: 'v2.2.0',
    impact: 'Minor',
    label: 'v2.2.0 Feature',
    description: 'Updated 2-column contact cards with live IST clock, response estimate, vCard download, and WhatsApp link.',
    category: 'improvement',
    published: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    items: [
      '[Feature] Added live IST clock and active response time tracker.',
      '[Feature] Added 1-Click vCard download for direct phone contacts.'
    ],
    reactions: { rocket: 9, party: 6, heart: 15, thumbs: 11 }
  }
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
      let localList = [];
      try {
        const raw = localStorage.getItem(LOCAL_UPDATES_KEY);
        localList = raw ? JSON.parse(raw) : [];
      } catch {
        localList = [];
      }

      try {
        const { data, error } = await supabase
          .from('updates')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(30);

        let combined = [...localList];
        if (!error && data && data.length > 0) {
          data.forEach(d => {
            if (d.published !== false && !combined.some(c => String(c.id) === String(d.id))) {
              combined.push(d);
            }
          });
        }

        if (combined.length === 0) {
          combined = FALLBACK_UPDATES;
        }

        setUpdates(combined);
        computeUnread(combined);
      } catch {
        const combined = localList.length > 0 ? localList : FALLBACK_UPDATES;
        setUpdates(combined);
        computeUnread(combined);
      } finally {
        setLoading(false);
      }
    }

    load();

    const handleStorageChange = () => { load(); };
    window.addEventListener('storage', handleStorageChange);

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
    } catch { /* ignore subscription fallback */ }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      safeRemoveChannel(channel);
    };
  }, []);

  function markAllRead() {
    localStorage.setItem(READ_KEY, new Date().toISOString());
    setUnreadCount(0);
  }

  const toggleReaction = async (updateId, key) => {
    const userReactKey = `reacted_up_${updateId}_${key}`;
    const hasReacted = localStorage.getItem(userReactKey) === 'true';
    const delta = hasReacted ? -1 : 1;

    setUpdates(prev => {
      const nextList = prev.map(u => {
        if (String(u.id) !== String(updateId)) return u;
        const rx = u.reactions || { rocket: 0, party: 0, heart: 0, thumbs: 0 };
        const current = rx[key] || 0;
        const nextVal = Math.max(0, current + delta);
        return {
          ...u,
          reactions: { ...rx, [key]: nextVal }
        };
      });

      try {
        localStorage.setItem(LOCAL_UPDATES_KEY, JSON.stringify(nextList));
      } catch {}

      return nextList;
    });

    if (hasReacted) {
      localStorage.removeItem(userReactKey);
    } else {
      localStorage.setItem(userReactKey, 'true');
    }

    try {
      const target = updates.find(u => String(u.id) === String(updateId));
      if (target && typeof target.id === 'string' && !isNaN(Number(target.id))) {
        const rx = target.reactions || {};
        const nextVal = Math.max(0, (rx[key] || 0) + delta);
        await supabase.from('updates').update({
          reactions: { ...rx, [key]: nextVal }
        }).eq('id', target.id);
      }
    } catch { /* ignore if column missing */ }
  };

  return { updates, unreadCount, loading, markAllRead, toggleReaction };
}
