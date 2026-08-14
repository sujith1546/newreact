import { publishAdminMutation } from './broadcastSyncEngine';
import { logAuditEvent } from './auditLogger';

/**
 * notifyDataMutation
 * Standardized realtime dispatcher called whenever an admin panel creates, updates, or deletes data.
 * 
 * @param {string} table - Database table name ('site_settings', 'projects', 'skills', 'experience', 'education', 'certifications', 'testimonials', 'updates')
 * @param {'INSERT'|'UPDATE'|'DELETE'} actionType - Mutation action
 * @param {object} payload - Mutation data or object with { key, value }
 */
export function notifyDataMutation(table, actionType = 'UPDATE', payload = {}) {
  try {
    // 1. Dispatch same-browser local event for instant <16ms React state update
    window.dispatchEvent(new CustomEvent('pcms_data_updated', {
      detail: {
        table,
        eventType: actionType,
        payload,
        key: payload?.key,
        value: payload?.value,
        id: payload?.id,
      }
    }));

    // 2. Broadcast P2P inter-tab synchronization
    publishAdminMutation(table, actionType, payload);

    // 3. Log audit event
    const entityName = payload?.title || payload?.name || payload?.label || payload?.id || payload?.key || '';
    logAuditEvent(`ADMIN_${actionType}_${table.toUpperCase()}`, table, String(entityName));

    // 4. Record automated changelog release entry (for non-update tables)
    if (table !== 'updates' && typeof window !== 'undefined') {
      import('../core/utils/autoChangelogEngine').then(({ recordAutoChangelogEntry }) => {
        recordAutoChangelogEntry(table, actionType, payload);
      }).catch(() => {});
    }
  } catch (err) {
    console.warn(`[SyncDispatcher] Dispatch failed for ${table}:`, err);
  }
}
