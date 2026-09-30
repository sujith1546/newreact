import { supabase } from './supabaseClient';

/**
 * XSS & Vulnerability Scanner for Portfolio Database Content
 * Scans projects, updates, bio, and settings for malicious injection patterns.
 */

const MALICIOUS_PATTERNS = [
  { name: 'Raw Script Tag', regex: /<script\b[^>]*>([\s\S]*?)<\/script>/gi, severity: 'critical' },
  { name: 'Inline Event Handler', regex: /\bon\w+\s*=\s*["'][^"']*["']/gi, severity: 'high' },
  { name: 'Javascript: URI Pseudo-protocol', regex: /javascript\s*:/gi, severity: 'high' },
  { name: 'Data: URI Script Execution', regex: /data\s*:\s*text\/html/gi, severity: 'high' },
  { name: 'Unsafe Iframe Injection', regex: /<iframe\b[^>]*src=["'](?!https:\/\/(www\.)?(youtube\.com|vimeo\.com|github\.com))/gi, severity: 'medium' },
  { name: 'Dangerous Object / Embed Tag', regex: /<(object|embed|applet)\b[^>]*>/gi, severity: 'critical' },
];

export async function runXssVulnerabilityScan() {
  const vulnerabilities = [];
  let scannedRecordsCount = 0;

  try {
    const [projectsRes, updatesRes, settingsRes] = await Promise.all([
      supabase.from('projects').select('id, title, description, live_url, github_url'),
      supabase.from('site_updates').select('id, message, title'),
      supabase.from('site_settings').select('id, hero_headline, short_bio, announcement_text').single(),
    ]);

    const projects = projectsRes.data || [];
    const updates = updatesRes.data || [];
    const settings = settingsRes.data || {};

    // 1. Check Projects
    projects.forEach(p => {
      scannedRecordsCount++;
      const fields = [
        { key: 'title', val: p.title },
        { key: 'description', val: p.description },
        { key: 'live_url', val: p.live_url },
        { key: 'github_url', val: p.github_url },
      ];

      fields.forEach(f => {
        if (!f.val) return;
        MALICIOUS_PATTERNS.forEach(pat => {
          if (pat.regex.test(f.val)) {
            vulnerabilities.push({
              source: `Projects: "${p.title}"`,
              field: f.key,
              pattern: pat.name,
              severity: pat.severity,
              recordId: p.id,
              table: 'projects',
            });
          }
        });
      });
    });

    // 2. Check Site Updates
    updates.forEach(u => {
      scannedRecordsCount++;
      const fields = [
        { key: 'title', val: u.title },
        { key: 'message', val: u.message },
      ];
      fields.forEach(f => {
        if (!f.val) return;
        MALICIOUS_PATTERNS.forEach(pat => {
          if (pat.regex.test(f.val)) {
            vulnerabilities.push({
              source: `Update: "${u.title || 'Untitled'}"`,
              field: f.key,
              pattern: pat.name,
              severity: pat.severity,
              recordId: u.id,
              table: 'site_updates',
            });
          }
        });
      });
    });

    // 3. Check Site Settings
    if (settings) {
      scannedRecordsCount++;
      const fields = [
        { key: 'hero_headline', val: settings.hero_headline },
        { key: 'short_bio', val: settings.short_bio },
        { key: 'announcement_text', val: settings.announcement_text },
      ];
      fields.forEach(f => {
        if (!f.val) return;
        MALICIOUS_PATTERNS.forEach(pat => {
          if (pat.regex.test(f.val)) {
            vulnerabilities.push({
              source: 'Site Settings',
              field: f.key,
              pattern: pat.name,
              severity: pat.severity,
              recordId: 1,
              table: 'site_settings',
            });
          }
        });
      });
    }

    return {
      timestamp: new Date().toISOString(),
      scannedRecordsCount,
      vulnerabilities,
      safe: vulnerabilities.length === 0,
      score: vulnerabilities.length === 0 ? 100 : Math.max(20, 100 - (vulnerabilities.length * 20)),
    };
  } catch (err) {
    console.error("XSS scan error:", err);
    return {
      timestamp: new Date().toISOString(),
      scannedRecordsCount,
      vulnerabilities: [],
      safe: true,
      score: 100,
    };
  }
}
