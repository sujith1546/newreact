import { supabase } from '../../lib/supabaseClient';

const GITHUB_REPO = 'sujith1546/newreact';
const GITHUB_CACHE_KEY = 'pcms_github_commits_cache_v1';
const AUTO_CHANGELOG_ENABLED_KEY = 'pcms_auto_changelog_enabled';

/**
 * Fetch latest commits from the GitHub repository
 */
export async function fetchGitHubCommits(limit = 12) {
  try {
    // Check local session cache first
    const cached = sessionStorage.getItem(GITHUB_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < 1000 * 60 * 10) {
        return parsed.data;
      }
    }

    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/commits?per_page=${limit}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
    const commits = await res.json();

    const formatted = (commits || []).map((c) => {
      const msg = c.commit?.message || 'Update';
      const firstLine = msg.split('\n')[0];
      const category = firstLine.toLowerCase().startsWith('feat')
        ? 'feature'
        : firstLine.toLowerCase().startsWith('fix')
        ? 'fix'
        : 'improvement';

      return {
        id: `git_${c.sha.slice(0, 7)}`,
        sha: c.sha.slice(0, 7),
        fullSha: c.sha,
        title: firstLine,
        description: msg.split('\n').slice(1).filter(Boolean).join(' ') || `Commit ${c.sha.slice(0, 7)} to branch main.`,
        version: `git-${c.sha.slice(0, 7)}`,
        category,
        author: c.commit?.author?.name || 'Sujith Thota',
        created_at: c.commit?.author?.date || new Date().toISOString(),
        url: c.html_url,
        isGitCommit: true,
        reactions: { rocket: 2, party: 1, heart: 4, thumbs: 3 },
      };
    });

    try {
      sessionStorage.setItem(GITHUB_CACHE_KEY, JSON.stringify({ data: formatted, timestamp: Date.now() }));
    } catch {}

    return formatted;
  } catch (err) {
    console.warn('[AutoChangelog] GitHub commits fetch failed, using fallback:', err);
    return [];
  }
}

/**
 * Automatically synthesizes and records a changelog entry when an admin mutation occurs.
 */
export async function recordAutoChangelogEntry(table, actionType, payload = {}) {
  try {
    const isAutoEnabled = localStorage.getItem(AUTO_CHANGELOG_ENABLED_KEY) !== 'false';
    if (!isAutoEnabled) return null;

    const entityName = payload?.title || payload?.name || payload?.label || payload?.role || payload?.key || table;
    const actionVerb = actionType === 'INSERT' ? 'Added' : actionType === 'DELETE' ? 'Removed' : 'Updated';
    const category = actionType === 'INSERT' ? 'feature' : 'improvement';

    let title = `${actionVerb} ${table.replace(/_/g, ' ')}: "${entityName}"`;
    let description = `Automated changelog record: ${actionVerb} in database table ${table}.`;

    if (table === 'projects') {
      title = `${actionVerb} Project: ${entityName}`;
      description = payload?.description
        ? payload.description.slice(0, 140) + '...'
        : `Portfolio project ${entityName} ${actionVerb.toLowerCase()} with live repository details.`;
    } else if (table === 'skills') {
      title = `${actionVerb} Technical Skill: ${entityName}`;
      description = `Proficiency and tools for ${entityName} synchronized with live portfolio.`;
    } else if (table === 'site_settings') {
      title = `Updated Portfolio Configuration & Settings`;
      description = `Theme parameters, hero bio, and feature flags synchronized with cloud.`;
    }

    const now = new Date();
    const versionStr = `v2.${now.getMonth() + 1}.${now.getDate() % 30}`;

    const newEntry = {
      id: `auto_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title,
      version: versionStr,
      impact: actionType === 'INSERT' ? 'Minor' : 'Patch',
      label: `${versionStr} ${actionType === 'INSERT' ? 'Feature' : 'Update'}`,
      description,
      category,
      published: true,
      created_at: now.toISOString(),
      items: [
        `[${category === 'feature' ? 'Feature' : 'Improvement'}] ${title}`,
        `[Sync] Automated cloud persistence to Supabase database.`,
      ],
      reactions: { rocket: 1, party: 1, heart: 2, thumbs: 1 },
    };

    // Save to Supabase updates table
    await supabase.from('updates').insert([{
      title: newEntry.title,
      version: newEntry.version,
      impact: newEntry.impact,
      description: newEntry.description,
      category: newEntry.category,
      published: true,
      items: newEntry.items,
      reactions: newEntry.reactions,
      created_at: newEntry.created_at,
    }]).catch(() => {});

    // Save to local storage cache for instant 0ms access
    try {
      const raw = localStorage.getItem('pcms_local_updates');
      const list = raw ? JSON.parse(raw) : [];
      localStorage.setItem('pcms_local_updates', JSON.stringify([newEntry, ...list.slice(0, 25)]));
      window.dispatchEvent(new Event('storage'));
    } catch {}

    return newEntry;
  } catch (err) {
    console.warn('[AutoChangelog] Failed to record auto changelog:', err);
    return null;
  }
}
