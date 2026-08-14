import { useState, useEffect, useCallback } from 'react';
import { supabase, safeRemoveChannel } from '../lib/supabaseClient';
import { fetchGitHubCommits } from '../core/utils/autoChangelogEngine';

const READ_KEY = 'updates_last_seen';
const LOCAL_UPDATES_KEY = 'pcms_local_updates';

const FALLBACK_UPDATES = [
  {
    id: '1',
    title: 'v1.3.0 — Enterprise Architecture & Database Operations Center',
    version: 'v1.3.0',
    impact: 'Major',
    label: 'v1.3.0 Release',
    description: 'Upgraded portfolio with domain-driven features, live database Operations & Sync Center with latency metrics, and zero-crash error boundaries.',
    category: 'feature',
    published: true,
    created_at: new Date().toISOString(),
    items: [
      '[Feature] Live Database Operations & Sync Center with latency heartbeat & force re-sync.',
      '[Architecture] Clean modular structure (src/app, src/features, src/core, src/shared).',
      '[Performance] Code-split PDF viewer bundle and 5.0s lightning production build.',
      '[Resilience] Zero-crash React error boundaries wrapping all lazy routes.'
    ],
    reactions: { rocket: 18, party: 12, heart: 28, thumbs: 24 }
  },
  {
    id: '2',
    title: 'v1.2.4 — AI Financial Advisor & Control Center Overhaul',
    version: 'v1.2.4',
    impact: 'Minor',
    label: 'v1.2.4 Feature',
    description: 'Integrated interactive Groq LLM portfolio assistant, 1-Click JSON backup system, and dark SaaS admin design system.',
    category: 'feature',
    published: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    items: [
      '[Feature] Added AI assistant powered by Groq Llama 3 with streaming RAG telemetry.',
      '[Feature] 1-Click full CMS backup & JSON data exporter in admin panel.',
      '[Security] Unified site lockdown and maintenance shield controls.'
    ],
    reactions: { rocket: 14, party: 8, heart: 22, thumbs: 19 }
  },
  {
    id: '3',
    title: 'v1.2.0 — Mobile Viewport & High-Density UI Polish',
    version: 'v1.2.0',
    impact: 'Patch',
    label: 'v1.2.0 Patch',
    description: 'Standardized global responsive spacing and optimized pull-to-refresh animations for mobile devices.',
    category: 'improvement',
    published: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    items: [
      '[Fix] Fixed mobile viewport scrollbar and overflow math.',
      '[Perf] Reduced chunk bundle sizes for faster mobile loading.'
    ],
    reactions: { rocket: 9, party: 5, heart: 12, thumbs: 15 }
  }
];

export function useUpdates() {
  const [updates, setUpdates] = useState([]);
  const [gitCommits, setGitCommits] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const computeUnread = useCallback((list) => {
    const lastSeen = localStorage.getItem(READ_KEY);
    const lastSeenDate = lastSeen ? new Date(lastSeen) : null;
    const count = lastSeenDate
      ? list.filter((u) => new Date(u.created_at || u.date) > lastSeenDate).length
      : list.length;
    setUnreadCount(count);
  }, []);

  const load = useCallback(async () => {
    let localList = [];
    try {
      const raw = localStorage.getItem(LOCAL_UPDATES_KEY);
      localList = raw ? JSON.parse(raw) : [];
    } catch {
      localList = [];
    }

    try {
      // 1. Fetch from Supabase updates table
      const { data, error } = await supabase
        .from('updates')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);

      let combined = [...localList];
      if (!error && data && data.length > 0) {
        data.forEach((d) => {
          if (d.published !== false && !combined.some((c) => String(c.id) === String(d.id))) {
            combined.push(d);
          }
        });
      }

      if (combined.length === 0) {
        combined = FALLBACK_UPDATES;
      }

      combined.sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date));

      setUpdates(combined);
      computeUnread(combined);
    } catch {
      const combined = localList.length > 0 ? localList : FALLBACK_UPDATES;
      setUpdates(combined);
      computeUnread(combined);
    } finally {
      setLoading(false);
    }

    // 2. Fetch live GitHub commits in background
    fetchGitHubCommits(12).then((commits) => {
      if (commits && commits.length > 0) {
        setGitCommits(commits);
      }
    }).catch(() => {});
  }, [computeUnread]);

  useEffect(() => {
    load();

    const handleStorageChange = () => { load(); };
    window.addEventListener('storage', handleStorageChange);

    let channel;
    try {
      channel = supabase
        .channel('updates_realtime_feed')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'updates' },
          (payload) => {
            if (payload.eventType === 'INSERT' && payload.new?.published !== false) {
              setUpdates((prev) => [payload.new, ...prev.filter((p) => String(p.id) !== String(payload.new.id))]);
              setUnreadCount((prev) => prev + 1);
            } else if (payload.eventType === 'UPDATE') {
              setUpdates((prev) => prev.map((p) => (String(p.id) === String(payload.new.id) ? payload.new : p)));
            } else if (payload.eventType === 'DELETE') {
              setUpdates((prev) => prev.filter((p) => String(p.id) !== String(payload.old.id)));
            }
          }
        )
        .subscribe();
    } catch { /* ignore */ }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      safeRemoveChannel(channel);
    };
  }, [load]);

  const markAllRead = useCallback(() => {
    localStorage.setItem(READ_KEY, new Date().toISOString());
    setUnreadCount(0);
  }, []);

  const toggleReaction = useCallback(async (updateId, key) => {
    const userReactKey = `reacted_up_${updateId}_${key}`;
    const hasReacted = localStorage.getItem(userReactKey) === 'true';
    const delta = hasReacted ? -1 : 1;

    setUpdates((prev) => {
      const nextList = prev.map((u) => {
        if (String(u.id) !== String(updateId)) return u;
        const rx = u.reactions || { rocket: 0, party: 0, heart: 0, thumbs: 0 };
        const current = rx[key] || 0;
        const nextVal = Math.max(0, current + delta);
        return {
          ...u,
          reactions: { ...rx, [key]: nextVal },
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
      const target = updates.find((u) => String(u.id) === String(updateId));
      if (target && !isNaN(Number(target.id))) {
        const rx = target.reactions || {};
        const nextVal = Math.max(0, (rx[key] || 0) + delta);
        await supabase.from('updates').update({
          reactions: { ...rx, [key]: nextVal },
        }).eq('id', target.id);
      }
    } catch { /* ignore */ }
  }, [updates]);

  return { updates, gitCommits, unreadCount, loading, markAllRead, toggleReaction, reloadUpdates: load };
}

export default useUpdates;
