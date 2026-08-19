import { supabase } from './supabaseClient';

/**
 * Enhanced Tamper-Proof Audit Logger
 *
 * Logs every administrative action to an append-only audit trail with:
 * - before/after data snapshots (full diffs)
 * - session ID, approximate IP hint, user agent
 * - entity context for forensic reconstruction
 *
 * The `admin_audit_logs` Supabase table should have:
 *   - RLS: INSERT for authenticated users only, NO UPDATE or DELETE allowed
 *   - This makes the log append-only and tamper-proof at the DB level
 */

/** Get or create a stable session ID for this browser session */
function getSessionId() {
  try {
    let sid = sessionStorage.getItem('_audit_sid');
    if (!sid) {
      sid = `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
      sessionStorage.setItem('_audit_sid', sid);
    }
    return sid;
  } catch {
    return 'unknown';
  }
}

/** Get approximate client hint (not a real IP — first-party approximation) */
function getClientHint() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown';
    const lang = navigator.language || 'unknown';
    const screen = `${window.screen.width}x${window.screen.height}`;
    return `tz:${tz}|lang:${lang}|res:${screen}`;
  } catch {
    return 'unknown';
  }
}

/**
 * Log an administrative action to the audit trail.
 *
 * @param {string} action      - Action name e.g. 'CREATE_SKILL', 'UPDATE_PROJECT', 'DELETE_EXPERIENCE'
 * @param {string} entityType  - Entity type e.g. 'skills', 'projects', 'experience'
 * @param {string} entityId    - Entity ID or name
 * @param {object} details     - Additional metadata payload
 * @param {object} before      - Snapshot of data BEFORE the change (for diff view)
 * @param {object} after       - Snapshot of data AFTER the change (for diff view)
 */
export async function logAuditEvent(
  action,
  entityType,
  entityId = '',
  details = {},
  before = null,
  after = null
) {
  try {
    const payload = {
      action,
      entity_type: entityType,
      entity_id: String(entityId),
      details,
      before_snapshot: before,
      after_snapshot: after,
      session_id: getSessionId(),
      client_hint: getClientHint(),
      user_agent: navigator.userAgent?.substring(0, 300) || 'unknown',
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('admin_audit_logs')
      .insert([payload]);

    if (error) {
      // Silent warn only — never throw, audit failure must not block UX
      console.warn('[AuditLogger] write warning:', error.message);
    }
  } catch (err) {
    console.warn('[AuditLogger] failed to log:', err.message);
  }
}

/**
 * Convenience: log a security-specific event (login anomaly, threat detected, etc.)
 *
 * @param {string} eventType   - e.g. 'BRUTE_FORCE_DETECTED', 'SESSION_ANOMALY', 'BOT_DETECTED'
 * @param {object} context     - Any additional context object
 * @param {'low'|'medium'|'high'|'critical'} severity
 */
export async function logSecurityEvent(eventType, context = {}, severity = 'medium') {
  try {
    const payload = {
      event_type: eventType,
      severity,
      context,
      session_id: getSessionId(),
      client_hint: getClientHint(),
      user_agent: navigator.userAgent?.substring(0, 300) || 'unknown',
      created_at: new Date().toISOString(),
    };

    await supabase
      .from('threat_events')
      .insert([payload])
      .catch(() => {}); // Fully silent — security logging must never disrupt UX
  } catch {
    // Intentionally silent
  }
}
