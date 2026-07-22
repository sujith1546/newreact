import { supabase } from './supabaseClient';

/**
 * Log an administrative action to the audit trail
 * @param {string} action - Action name e.g. 'CREATE_SKILL', 'UPDATE_PROJECT', 'DELETE_EXPERIENCE'
 * @param {string} entityType - Entity type e.g. 'skills', 'projects', 'experience'
 * @param {string} entityId - Entity ID or name
 * @param {object} details - Additional metadata payload
 */
export async function logAuditEvent(action, entityType, entityId = '', details = {}) {
  try {
    const { error } = await supabase.from('admin_audit_logs').insert([{
      action,
      entity_type: entityType,
      entity_id: String(entityId),
      details,
      created_at: new Date().toISOString()
    }]);

    if (error) {
      console.warn('Audit log write warning:', error.message);
    }
  } catch (err) {
    console.error('Failed to log audit event:', err);
  }
}
