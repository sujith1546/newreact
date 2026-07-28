import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GitCommit, Flame, Activity, ExternalLink } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { fetchGithubActivity } from '../../lib/githubActivityEngine';

const GITHUB_USERNAME = 'sujith1546';
const CACHE_KEY = 'gh_activity_cache';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

function getColor(count, isDark) {
  if (count === 0) return isDark ? '#2d2d2d' : '#ebedf0';
  if (count === 1) return isDark ? '#0e4429' : '#9be9a8';
  if (count <= 3) return isDark ? '#006d32' : '#40c463';
  if (count <= 6) return isDark ? '#26a641' : '#30a14e';
  return isDark ? '#39d353' : '#216e39';
}

function useGitHubData() {
  const [data, setData] = useState({ activity: [], commits: [], streak: 0, total: 0, loading: true });

  useEffect(() => {
    async function load() {
      // Check cache
      try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
        if (cached && Date.now() - cached.ts < CACHE_TTL) {
          setData({ ...cached.data, loading: false });
          return;
        }
      } catch {}

      try {
        const activity = await fetchGithubActivity(GITHUB_USERNAME);
        const total = activity.reduce((s, c) => s + c, 0);

        // Streak calculation
        let streak = 0;
        for (let i = activity.length - 1; i >= 0; i--) {
          if (activity[i] > 0) streak++;
          else if (streak > 0) break;
        }

        // Fetch recent commits
        let commits = [];
        try {
          const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=20`);
          if (res.ok) {
            const events = await res.json();
            commits = events
              .filter(e => e.type === 'PushEvent')
              .slice(0, 5)
              .flatMap(e => (e.payload.commits || []).slice(0, 1).map(c => ({
                message: c.message.split('\n')[0].slice(0, 60),
                repo: e.repo.name.split('/')[1],
                date: new Date(e.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              })));
          }
        } catch {}

        const result = { activity, commits, streak, total };
        localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: result }));
        setData({ ...result, loading: false });
      } catch (e) {
        setData(prev => ({ ...prev, loading: false }));
      }
    }
    load();
  }, []);

  return data;
}

export default function GitHubActivity({ isDark = false }) {
  const { activity, commits, streak, total, loading } = useGitHubData();

  // Build 52-week grid (most recent last)
  const weeks = [];
  for (let w = 0; w < 52; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const idx = w * 7 + d;
      week.push(activity[idx] ?? 0);
    }
    weeks.push(week);
  }

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const today = new Date();
  const monthLabels = Array.from({ length: 52 }, (_, w) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (51 - w) * 7);
    return w === 0 || d.getDate() <= 7 ? MONTHS[d.getMonth()] : '';
  });

  if (loading) {
    return (
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 20, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <FaGithub size={18} color="var(--text-muted)" />
          <div style={{ height: 14, width: 180, borderRadius: 7, background: 'var(--border-color)', animation: 'shimmer 1.6s ease infinite', backgroundSize: '400% 100%' }} />
        </div>
        <div style={{ height: 100, background: 'var(--border-color)', borderRadius: 10, animation: 'shimmer 1.6s ease infinite' }} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 20, padding: 24, overflow: 'hidden' }}
    >
      <style>{`
        @keyframes shimmer { 0% { background-position: 100% 0 } 100% { background-position: -100% 0 } }
        .gh-cell {
          width: 12px;
          height: 12px;
          border-radius: 3px;
          cursor: pointer;
          position: relative;
          z-index: 1;
          transition: transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.15s ease;
        }
        .gh-cell:hover {
          transform: scale(1.25);
          z-index: 10;
          box-shadow: 0 0 0 1.5px var(--primary-blue);
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FaGithub size={18} color="var(--text-secondary)" />
          <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>GitHub Activity</span>
          <a href={`https://github.com/${GITHUB_USERNAME}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
            <ExternalLink size={13} />
          </a>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f59e0b', fontWeight: 700, fontSize: 15 }}>
              <Flame size={14} />{streak}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>DAY STREAK</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#10b981', fontWeight: 700, fontSize: 15 }}>
              <Activity size={14} />{total}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>CONTRIBUTIONS</div>
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div style={{ overflowX: 'auto', padding: '6px 4px', margin: '-4px' }}>
        {/* Month labels */}
        <div style={{ display: 'flex', gap: 3, marginBottom: 4, paddingLeft: 16 }}>

          {weeks.map((_, w) => (
            <div key={w} style={{ width: 12, fontSize: 9, color: 'var(--text-muted)', flexShrink: 0, fontWeight: 500 }}>
              {monthLabels[w]}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 3 }}>
          {/* Day labels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginRight: 4 }}>
            {['Mon', '', 'Wed', '', 'Fri', '', ''].map((d, i) => (
              <div key={i} style={{ height: 12, fontSize: 9, color: 'var(--text-muted)', fontWeight: 500, lineHeight: '12px' }}>{d}</div>
            ))}
          </div>
          {/* Grid */}
          {weeks.map((week, w) => (
            <div key={w} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {week.map((count, d) => (
                <div
                  key={d}
                  className="gh-cell"
                  title={`${count} contribution${count !== 1 ? 's' : ''}`}
                  style={{ background: getColor(count, isDark) }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Recent commits */}
      {commits.length > 0 && (
        <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Recent Commits</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {commits.map((commit, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <GitCommit size={13} color="var(--text-muted)" style={{ marginTop: 1, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500 }}>{commit.message}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 6 }}>
                    {commit.repo} · {commit.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
