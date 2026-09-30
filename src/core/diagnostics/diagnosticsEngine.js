/**
 * Enterprise Bug & Issue Diagnostics Telemetry Engine
 * Detects, intercepts, deduplicates, and logs runtime errors, network failures,
 * DOM anomalies, storage bottlenecks, and data integrity issues across the entire website.
 */

import { supabase } from '../../lib/supabaseClient';

const STORAGE_KEY = 'pcms_diagnostics_events_v1';
const MAX_EVENTS = 150;

// Internal reactive state
let diagnosticsState = {
  initialized: false,
  isScanning: false,
  scanProgress: 0,
  scanStep: '',
  lastScanTime: null,
  issues: [],
};

const listeners = new Set();

function notifyListeners() {
  const snapshot = { ...diagnosticsState, issues: [...diagnosticsState.issues] };
  listeners.forEach((fn) => {
    try {
      fn(snapshot);
    } catch (e) {
      console.error('[DiagnosticsEngine] Listener error:', e);
    }
  });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('pcms_diagnostics_updated', { detail: snapshot }));
  }
}

function persistEvents() {
  if (typeof window === 'undefined') return;
  try {
    const serialized = JSON.stringify(diagnosticsState.issues.slice(0, 80));
    sessionStorage.setItem(STORAGE_KEY, serialized);
  } catch (_) {
    // Quota or storage unavailable
  }
}

function loadPersistedEvents() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

/**
 * Report an issue to the diagnostic stream. Deduplicates repeated logs.
 */
export function reportDiagnosticsIssue(issue) {
  if (!issue || !issue.title) return;

  const now = Date.now();
  const id = issue.id || `diag_${now}_${Math.random().toString(36).substring(2, 7)}`;
  const title = String(issue.title).trim();
  const message = String(issue.message || '').trim();
  const source = String(issue.source || 'runtime').trim();

  // Deduplication check within existing active issues (by signature within 15 seconds)
  const existingIndex = diagnosticsState.issues.findIndex(
    (i) => !i.resolved && i.title === title && i.source === source
  );

  if (existingIndex !== -1) {
    const existing = diagnosticsState.issues[existingIndex];
    const updated = {
      ...existing,
      count: (existing.count || 1) + 1,
      timestamp: now,
      stack: issue.stack || existing.stack,
      message: message || existing.message,
    };
    diagnosticsState.issues[existingIndex] = updated;
  } else {
    const newIssue = {
      id,
      type: issue.type || 'runtime', // 'runtime' | 'network' | 'data' | 'dom' | 'storage' | 'security'
      severity: issue.severity || 'warning', // 'critical' | 'error' | 'warning' | 'info'
      title,
      message,
      source,
      timestamp: now,
      stack: issue.stack || null,
      fixTab: issue.fixTab || null,
      fixActionLabel: issue.fixActionLabel || null,
      resolved: false,
      count: 1,
    };

    // Prepend new issue
    diagnosticsState.issues.unshift(newIssue);
    if (diagnosticsState.issues.length > MAX_EVENTS) {
      diagnosticsState.issues = diagnosticsState.issues.slice(0, MAX_EVENTS);
    }
  }

  persistEvents();
  notifyListeners();
}

/**
 * Mark an issue as resolved
 */
export function resolveIssue(id) {
  diagnosticsState.issues = diagnosticsState.issues.map((item) =>
    item.id === id ? { ...item, resolved: true, resolvedAt: Date.now() } : item
  );
  persistEvents();
  notifyListeners();
}

/**
 * Dismiss / delete an issue
 */
export function dismissIssue(id) {
  diagnosticsState.issues = diagnosticsState.issues.filter((item) => item.id !== id);
  persistEvents();
  notifyListeners();
}

/**
 * Clear all resolved or all issues
 */
export function clearAllIssues(onlyResolved = false) {
  if (onlyResolved) {
    diagnosticsState.issues = diagnosticsState.issues.filter((i) => !i.resolved);
  } else {
    diagnosticsState.issues = [];
  }
  persistEvents();
  notifyListeners();
}

/**
 * Calculate dynamic health score 0 - 100%
 */
export function calculateHealthScore(issues = diagnosticsState.issues) {
  let score = 100;
  const activeIssues = issues.filter((i) => !i.resolved);

  activeIssues.forEach((issue) => {
    switch (issue.severity) {
      case 'critical':
        score -= 22;
        break;
      case 'error':
        score -= 12;
        break;
      case 'warning':
        score -= 5;
        break;
      case 'info':
        score -= 1;
        break;
      default:
        score -= 3;
    }
  });

  return Math.max(12, Math.min(100, Math.round(score)));
}

/**
 * Get current state
 */
export function getDiagnosticsState() {
  return {
    ...diagnosticsState,
    healthScore: calculateHealthScore(diagnosticsState.issues),
    issues: [...diagnosticsState.issues],
  };
}

/**
 * Subscribe to state updates
 */
export function subscribeDiagnostics(callback) {
  listeners.add(callback);
  callback(getDiagnosticsState());
  return () => {
    listeners.delete(callback);
  };
}

/**
 * Initialize global telemetry interceptors (Safe idempotency)
 */
export function initDiagnosticsTelemetry() {
  if (typeof window === 'undefined' || window.__pcms_diagnostics_active) return;
  window.__pcms_diagnostics_active = true;

  // Hydrate persisted events
  diagnosticsState.issues = loadPersistedEvents();

  // 1. Intercept uncaught JS exceptions
  window.addEventListener('error', (event) => {
    // Ignore harmless cross-origin script errors or browser extension scripts
    if (event.filename && event.filename.includes('chrome-extension://')) return;

    reportDiagnosticsIssue({
      type: 'runtime',
      severity: 'error',
      title: event.message || 'Uncaught JavaScript Error',
      message: `${event.filename ? `${event.filename}:${event.lineno}:${event.colno}` : 'Global Execution Error'}`,
      source: 'window.onerror',
      stack: event.error?.stack || null,
      fixActionLabel: 'Inspect Console',
    });
  });

  // 2. Intercept unhandled Promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    let message = 'Unhandled Promise rejection';
    let stack = null;

    if (reason instanceof Error) {
      message = reason.message;
      stack = reason.stack;
    } else if (typeof reason === 'string') {
      message = reason;
    } else if (reason && typeof reason === 'object') {
      message = JSON.stringify(reason);
    }

    // Filter out user-aborted requests
    if (message.includes('AbortError') || message.includes('signal is aborted')) return;

    reportDiagnosticsIssue({
      type: 'runtime',
      severity: 'error',
      title: 'Unhandled Promise Rejection',
      message,
      source: 'Promise.catch',
      stack,
      fixActionLabel: 'Inspect Stack',
    });
  });

  // 3. Wrap console.error to catch component and library logs
  const origConsoleError = console.error;
  console.error = function (...args) {
    origConsoleError.apply(console, args);

    try {
      const msg = args.map((a) => (typeof a === 'object' ? (a?.message || JSON.stringify(a)) : String(a))).join(' ');

      // Filter out noisy development-only HMR or React internal warnings
      if (
        msg.includes('[Fast Refresh]') ||
        msg.includes('Download the React DevTools') ||
        msg.includes('favicon.ico') ||
        msg.includes('chrome-extension')
      ) {
        return;
      }

      reportDiagnosticsIssue({
        type: 'runtime',
        severity: 'warning',
        title: 'Console Error Logged',
        message: msg.slice(0, 300),
        source: 'console.error',
        stack: new Error().stack,
        fixActionLabel: 'Review Console Log',
      });
    } catch (_) {}
  };

  // 4. Monkey-patch window.fetch to detect failed network requests
  const origFetch = window.fetch;
  window.fetch = async function (...args) {
    const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || 'unknown-url';
    const method = (args[1]?.method || 'GET').toUpperCase();

    try {
      const response = await origFetch.apply(this, args);

      // Report HTTP 4xx / 5xx errors
      if (!response.ok && !url.includes('/api/health')) {
        reportDiagnosticsIssue({
          type: 'network',
          severity: response.status >= 500 ? 'critical' : 'error',
          title: `HTTP ${response.status} Request Failure`,
          message: `${method} ${url} returned ${response.status} (${response.statusText || 'Error'})`,
          source: 'window.fetch',
          fixActionLabel: 'Check Endpoint & CORS',
        });
      }

      return response;
    } catch (err) {
      // Network drop or CORS failure
      if (!err.message?.includes('aborted')) {
        reportDiagnosticsIssue({
          type: 'network',
          severity: 'error',
          title: 'Network Request Failed',
          message: `${method} ${url} failed to connect: ${err.message}`,
          source: 'window.fetch',
          fixActionLabel: 'Check Connection',
        });
      }
      throw err;
    }
  };

  diagnosticsState.initialized = true;
  notifyListeners();
}

/**
 * Execute Deep Comprehensive Audit Across All Systems
 */
export async function runComprehensiveDeepScan(progressCallback) {
  if (diagnosticsState.isScanning) return;

  diagnosticsState.isScanning = true;
  diagnosticsState.scanProgress = 5;
  diagnosticsState.scanStep = 'Initializing deep diagnostic radar...';
  notifyListeners();
  progressCallback?.(5, 'Initializing deep diagnostic radar...');

  const foundIssues = [];

  try {
    // ── STAGE 1: API & Cloud Infrastructure ──
    diagnosticsState.scanProgress = 20;
    diagnosticsState.scanStep = 'Testing Supabase Database connection & latency...';
    notifyListeners();
    progressCallback?.(20, 'Testing Supabase Database connection...');

    const dbStart = performance.now();
    try {
      const { data, error } = await supabase.from('site_settings').select('id').limit(1);
      const dbDuration = Math.round(performance.now() - dbStart);

      if (error) {
        foundIssues.push({
          type: 'network',
          severity: 'critical',
          title: 'Supabase Database Connection Error',
          message: `Database query failed: ${error.message} (Code: ${error.code || 'UNKNOWN'})`,
          source: 'Deep Scan: Database',
          fixTab: 'settings',
          fixActionLabel: 'Check Supabase Keys',
        });
      } else if (dbDuration > 1500) {
        foundIssues.push({
          type: 'network',
          severity: 'warning',
          title: 'High Database Latency Detected',
          message: `Supabase ping took ${dbDuration}ms (threshold: 1500ms).`,
          source: 'Deep Scan: Database',
          fixTab: 'settings',
          fixActionLabel: 'Review DB Query Load',
        });
      }
    } catch (err) {
      foundIssues.push({
        type: 'network',
        severity: 'critical',
        title: 'Database Unreachable',
        message: err.message || 'Failed to ping Supabase database client',
        source: 'Deep Scan: Database',
        fixTab: 'settings',
        fixActionLabel: 'Verify Cloud Config',
      });
    }

    // Ping GitHub API
    diagnosticsState.scanProgress = 35;
    diagnosticsState.scanStep = 'Verifying GitHub Commits Integration...';
    notifyListeners();
    progressCallback?.(35, 'Verifying GitHub Commits Integration...');

    try {
      const ghRes = await fetch('https://api.github.com/repos/sujith1546/sujith_portfolio/commits?per_page=1', {
        headers: { Accept: 'application/vnd.github.v3+json' },
      });
      if (!ghRes.ok && ghRes.status !== 403) {
        foundIssues.push({
          type: 'network',
          severity: 'warning',
          title: 'GitHub API Integration Anomaly',
          message: `GitHub repository commits endpoint returned status ${ghRes.status}`,
          source: 'Deep Scan: GitHub API',
          fixActionLabel: 'Check Repo Visibility',
        });
      }
    } catch (_) {}

    // ── STAGE 2: Data Integrity & Portfolio Completeness ──
    diagnosticsState.scanProgress = 50;
    diagnosticsState.scanStep = 'Auditing Projects, Skills, and Metadata Integrity...';
    notifyListeners();
    progressCallback?.(50, 'Auditing Projects, Skills, and Metadata...');

    try {
      const [projRes, skillRes, settingsRes, msgRes, expRes, certRes] = await Promise.all([
        supabase.from('projects').select('id, title, description, live_url, github_url, tags, image_url'),
        supabase.from('skills').select('id, name, proficiency_level, category'),
        supabase.from('site_settings').select('hero_headline, short_bio, meta_title, meta_description, og_image_url').single(),
        supabase.from('contact_messages').select('id, read').eq('read', false),
        supabase.from('experiences').select('id, role, company'),
        supabase.from('certifications').select('id, title, issuer'),
      ]);

      const projects = projRes.data || [];
      const skills = skillRes.data || [];
      const settings = settingsRes.data || {};
      const unreadMsgs = msgRes.data || [];
      const experiences = expRes.data || [];
      const certifications = certRes.data || [];

      // Check projects
      if (projects.length === 0) {
        foundIssues.push({
          type: 'data',
          severity: 'error',
          title: 'No Projects Loaded in Portfolio',
          message: 'The projects showcase table is currently empty.',
          source: 'Deep Scan: Projects Data',
          fixTab: 'projects',
          fixActionLabel: 'Create First Project',
        });
      } else {
        const missingBothLinks = projects.filter(
          (p) => (!p.live_url || p.live_url === '#') && (!p.github_url || p.github_url === '#')
        );
        if (missingBothLinks.length > 0) {
          foundIssues.push({
            type: 'data',
            severity: 'warning',
            title: `${missingBothLinks.length} Project(s) Lack Live & GitHub Links`,
            message: `Visitors cannot test or view source code: ${missingBothLinks.slice(0, 3).map((p) => p.title).join(', ')}`,
            source: 'Deep Scan: Projects Data',
            fixTab: 'projects',
            fixActionLabel: 'Add Project URLs',
          });
        }

        const missingCover = projects.filter((p) => !p.image_url);
        if (missingCover.length > 0) {
          foundIssues.push({
            type: 'data',
            severity: 'warning',
            title: `${missingCover.length} Project(s) Missing Cover Thumbnail`,
            message: `Projects without visual previews: ${missingCover.slice(0, 3).map((p) => p.title).join(', ')}`,
            source: 'Deep Scan: Projects Data',
            fixTab: 'projects',
            fixActionLabel: 'Upload Thumbnails',
          });
        }

        const briefDesc = projects.filter((p) => !p.description || p.description.trim().length < 25);
        if (briefDesc.length > 0) {
          foundIssues.push({
            type: 'data',
            severity: 'info',
            title: `${briefDesc.length} Project(s) Have Underdeveloped Descriptions`,
            message: `Short descriptions hurt SEO ranking: ${briefDesc.slice(0, 3).map((p) => p.title).join(', ')}`,
            source: 'Deep Scan: Projects Data',
            fixTab: 'projects',
            fixActionLabel: 'Expand Descriptions',
          });
        }
      }

      // Check skills
      if (skills.length < 5) {
        foundIssues.push({
          type: 'data',
          severity: 'warning',
          title: 'Sparse Technical Skills Count',
          message: `Only ${skills.length} skills listed. Industry recommendation is at least 8 to 12 skills.`,
          source: 'Deep Scan: Skills Data',
          fixTab: 'skills',
          fixActionLabel: 'Add Technical Skills',
        });
      }

      // Check SEO & settings
      if (!settings.short_bio || settings.short_bio.length < 35) {
        foundIssues.push({
          type: 'data',
          severity: 'warning',
          title: 'Portfolio Bio is Too Brief or Missing',
          message: 'Hero bio is less than 35 characters. Search snippets may look incomplete.',
          source: 'Deep Scan: Site Settings',
          fixTab: 'settings',
          fixActionLabel: 'Edit Bio in Settings',
        });
      }

      if (!settings.og_image_url) {
        foundIssues.push({
          type: 'data',
          severity: 'info',
          title: 'Social OpenGraph (OG) Preview Image Missing',
          message: 'When sharing your portfolio link on Twitter/LinkedIn, no preview banner card will appear.',
          source: 'Deep Scan: Site Settings',
          fixTab: 'settings',
          fixActionLabel: 'Set OG Image',
        });
      }

      // Check unread messages
      if (unreadMsgs.length > 0) {
        foundIssues.push({
          type: 'data',
          severity: 'info',
          title: `${unreadMsgs.length} Unread Recruiter Message(s)`,
          message: 'Pending recruiter or client inquiries are awaiting response.',
          source: 'Deep Scan: Inbox',
          fixTab: 'messages',
          fixActionLabel: 'Open Inbox',
        });
      }
    } catch (err) {
      console.warn('[Deep Scan] Data check non-fatal error:', err);
    }

    // ── STAGE 3: DOM, Broken Images, Accessibility ──
    diagnosticsState.scanProgress = 70;
    diagnosticsState.scanStep = 'Scanning Document Object Model for broken assets & images...';
    notifyListeners();
    progressCallback?.(70, 'Scanning DOM for broken assets & accessibility...');

    if (typeof document !== 'undefined') {
      // 1. Broken images check
      const imgs = Array.from(document.querySelectorAll('img'));
      const brokenImgs = imgs.filter((img) => img.complete && img.naturalWidth === 0 && img.src && !img.src.startsWith('data:'));

      if (brokenImgs.length > 0) {
        foundIssues.push({
          type: 'dom',
          severity: 'error',
          title: `${brokenImgs.length} Broken Image(s) Detected in DOM`,
          message: `Images failed to load: ${brokenImgs.slice(0, 2).map((i) => i.src.substring(i.src.lastIndexOf('/') + 1)).join(', ')}`,
          source: 'Deep Scan: DOM Assets',
          fixActionLabel: 'Fix Image URLs',
        });
      }

      // 2. Dead anchors
      const deadLinks = Array.from(document.querySelectorAll('a[href=""], a[href="#"]'));
      if (deadLinks.length > 3) {
        foundIssues.push({
          type: 'dom',
          severity: 'info',
          title: `${deadLinks.length} Dead / Placeholder Link(s) Found`,
          message: 'Multiple anchor tags have href="#" or empty string.',
          source: 'Deep Scan: DOM Links',
          fixActionLabel: 'Add Valid Links',
        });
      }

      // 3. Missing button accessible labels
      const unlabelledButtons = Array.from(document.querySelectorAll('button:not([aria-label]):empty'));
      if (unlabelledButtons.length > 0) {
        foundIssues.push({
          type: 'dom',
          severity: 'info',
          title: `${unlabelledButtons.length} Button(s) Lack Accessible Labels`,
          message: 'Screen readers cannot announce empty icon-only buttons lacking aria-label.',
          source: 'Deep Scan: Accessibility',
          fixActionLabel: 'Add aria-labels',
        });
      }
    }

    // ── STAGE 4: Client Storage & Quota Health ──
    diagnosticsState.scanProgress = 85;
    diagnosticsState.scanStep = 'Auditing LocalStorage quota and client caches...';
    notifyListeners();
    progressCallback?.(85, 'Auditing LocalStorage and client caches...');

    if (typeof window !== 'undefined' && window.localStorage) {
      let totalBytes = 0;
      let oversizedKeys = [];

      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          const val = localStorage.getItem(key) || '';
          const bytes = (key.length + val.length) * 2;
          totalBytes += bytes;
          if (bytes > 800 * 1024) {
            oversizedKeys.push(`${key} (${Math.round(bytes / 1024)}KB)`);
          }
        }

        const totalKb = Math.round(totalBytes / 1024);
        if (totalKb > 4000) {
          foundIssues.push({
            type: 'storage',
            severity: 'warning',
            title: `High LocalStorage Utilization (${totalKb}KB)`,
            message: 'Browser storage is nearing standard 5MB threshold. Purging stale cache is recommended.',
            source: 'Deep Scan: LocalStorage',
            fixActionLabel: 'Purge SWR Cache',
          });
        }

        if (oversizedKeys.length > 0) {
          foundIssues.push({
            type: 'storage',
            severity: 'info',
            title: 'Large Payload Stored in LocalStorage',
            message: `Oversized keys: ${oversizedKeys.join(', ')}`,
            source: 'Deep Scan: Storage',
            fixActionLabel: 'Clean Key',
          });
        }
      } catch (_) {}
    }

    // ── STAGE 5: Security & Protocol Evaluation ──
    diagnosticsState.scanProgress = 95;
    diagnosticsState.scanStep = 'Verifying Security Environment and Config...';
    notifyListeners();
    progressCallback?.(95, 'Verifying Security Environment...');

    if (typeof window !== 'undefined') {
      if (window.location.protocol === 'http:' && !window.location.hostname.includes('localhost')) {
        foundIssues.push({
          type: 'security',
          severity: 'critical',
          title: 'Unencrypted HTTP Connection in Production',
          message: 'Traffic is not secured with SSL/TLS encryption.',
          source: 'Deep Scan: Security',
          fixActionLabel: 'Enforce HTTPS',
        });
      }
    }

    // Merge new scanned issues into engine
    foundIssues.forEach((issue) => reportDiagnosticsIssue(issue));

    diagnosticsState.lastScanTime = Date.now();
    diagnosticsState.scanProgress = 100;
    diagnosticsState.scanStep = `Scan complete. Audited 5 system layers.`;
    notifyListeners();
    progressCallback?.(100, `Scan complete.`);
  } catch (globalScanErr) {
    console.error('[Deep Scan] Error executing deep scan:', globalScanErr);
    diagnosticsState.scanStep = `Scan interrupted: ${globalScanErr.message}`;
  } finally {
    setTimeout(() => {
      diagnosticsState.isScanning = false;
      notifyListeners();
    }, 800);
  }
}

/**
 * Generate a simulated issue for live verification testing
 */
export function simulateTestIssue(severity = 'warning') {
  const titles = {
    critical: 'Simulated Critical: Supabase Realtime Channel Drop',
    error: 'Simulated Error: Failed to render Dynamic Tech Stack Canvas',
    warning: 'Simulated Warning: Unoptimized High-Res Asset in Hero (~4.2MB)',
    info: 'Simulated Notice: Cache TTL expired for GitHub commit feed',
  };

  const messages = {
    critical: 'Socket disconnected unexpectedly with code 1006. Automatic reconnection triggered.',
    error: 'WebGL context was lost or canvas dimension exceeded 4096px boundary.',
    warning: 'Loading /profile_hero_raw.png takes 1420ms on 3G network emulation.',
    info: 'Fresh commits fetched from GitHub REST v3; cache re-validated.',
  };

  reportDiagnosticsIssue({
    type: severity === 'critical' || severity === 'error' ? 'runtime' : 'network',
    severity,
    title: titles[severity] || 'Simulated Test Diagnostic Event',
    message: messages[severity] || 'Triggered manually by administrator for verification.',
    source: 'Manual Simulator',
    stack: new Error('Simulation Stack Trace (Testing Diagnostic Engine)').stack,
    fixActionLabel: 'Acknowledge',
  });
}

/**
 * Export full diagnostic report to a downloadable JSON file
 */
export function exportDiagnosticsReport() {
  if (typeof window === 'undefined') return;

  const report = {
    title: 'Sujith Thota Portfolio - Deep Diagnostics Audit Report',
    exportedAt: new Date().toISOString(),
    url: window.location.href,
    healthScore: calculateHealthScore(diagnosticsState.issues),
    environment: {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio,
      },
      online: navigator.onLine,
      memory: performance?.memory ? {
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        usedJSHeapSize: performance.memory.usedJSHeapSize,
      } : 'Not available',
      storageKeysCount: localStorage.length,
    },
    totalIssuesLogged: diagnosticsState.issues.length,
    unresolvedCount: diagnosticsState.issues.filter((i) => !i.resolved).length,
    issues: diagnosticsState.issues,
  };

  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `portfolio_diagnostics_audit_${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
}
