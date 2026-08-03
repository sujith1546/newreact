import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';

export function useDashboardStats() {
  const [stats, setStats] = useState({
    unreadMessages: 0,
    totalMessages: 0,
    projectCount: 0,
    updateCount: 0,
    sessionCount: 0,
    skillCount: 0,
    certCount: 0,
    loading: true,
  });

  useEffect(() => {
    async function loadStats() {
      let aiCount = 0;
      try {
        const { count } = await supabase
          .from('chat_sessions')
          .select('*', { count: 'exact', head: true });
        aiCount = count || 0;
      } catch (e) { aiCount = 0; }

      const [messages, unread, projects, updates, skills, certs] = await Promise.all([
        supabase.from('contact_messages').select('id', { count: 'exact', head: true }).eq('is_bot', false),
        supabase.from('contact_messages').select('id', { count: 'exact', head: true }).eq('is_read', false).eq('is_archived', false).eq('is_spam', false),
        supabase.from('projects').select('id', { count: 'exact', head: true }),
        supabase.from('updates').select('id', { count: 'exact', head: true }),
        supabase.from('skills').select('id', { count: 'exact', head: true }),
        supabase.from('certifications').select('id', { count: 'exact', head: true }),
      ]);

      setStats({
        unreadMessages: unread.count ?? 0,
        totalMessages: messages.count ?? 0,
        projectCount: projects.count ?? 0,
        updateCount: updates.count ?? 0,
        sessionCount: aiCount,
        skillCount: skills.count ?? 0,
        certCount: certs.count ?? 0,
        loading: false,
      });
    }
    loadStats();
  }, []);

  return stats;
}

