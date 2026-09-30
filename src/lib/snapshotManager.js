import { supabase } from './supabaseClient';

/**
 * Enterprise Snapshot & Backup Engine
 * Exports complete portfolio dataset into a single JSON snapshot file.
 * Allows importing and restoring snapshot data with safety checks.
 */

const TABLES_TO_SNAPSHOT = [
  'projects',
  'skills',
  'experience',
  'education',
  'certifications',
  'site_updates',
  'site_settings',
];

/**
 * Export complete portfolio dataset into a JSON download
 */
export async function exportPortfolioSnapshot() {
  const snapshot = {
    metadata: {
      exportedAt: new Date().toISOString(),
      schemaVersion: '2.0.0',
      system: 'Portfolio CMS Enterprise',
      creator: 'Sujith Thota',
    },
    tables: {},
  };

  for (const table of TABLES_TO_SNAPSHOT) {
    try {
      const { data, error } = await supabase.from(table).select('*');
      if (!error && data) {
        snapshot.tables[table] = data;
      } else {
        snapshot.tables[table] = [];
      }
    } catch (e) {
      snapshot.tables[table] = [];
    }
  }

  // Generate file download
  const jsonString = JSON.stringify(snapshot, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `portfolio_backup_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return {
    success: true,
    totalTables: Object.keys(snapshot.tables).length,
    timestamp: snapshot.metadata.exportedAt,
  };
}

/**
 * Validate imported snapshot JSON structure
 */
export function validateSnapshotFile(jsonData) {
  if (!jsonData || typeof jsonData !== 'object') {
    throw new Error('Invalid file format: JSON object expected.');
  }

  if (!jsonData.tables || typeof jsonData.tables !== 'object') {
    throw new Error('Invalid snapshot structure: missing "tables" root key.');
  }

  const recognizedTables = Object.keys(jsonData.tables).filter(t => TABLES_TO_SNAPSHOT.includes(t));
  if (recognizedTables.length === 0) {
    throw new Error('Snapshot does not contain recognizable portfolio tables.');
  }

  let totalRecords = 0;
  recognizedTables.forEach(t => {
    if (Array.isArray(jsonData.tables[t])) {
      totalRecords += jsonData.tables[t].length;
    }
  });

  return {
    isValid: true,
    schemaVersion: jsonData.metadata?.schemaVersion || '1.0',
    exportedAt: jsonData.metadata?.exportedAt || 'Unknown date',
    recognizedTables,
    totalRecords,
  };
}

/**
 * Restore records for selected table from snapshot data
 */
export async function restoreTableFromSnapshot(tableName, records) {
  if (!TABLES_TO_SNAPSHOT.includes(tableName) || !Array.isArray(records)) {
    throw new Error(`Invalid table restoration target: ${tableName}`);
  }

  if (records.length === 0) return { count: 0 };

  // For site_settings, update single record
  if (tableName === 'site_settings' && records[0]) {
    const { id, created_at, ...cleanData } = records[0];
    await supabase.from('site_settings').update(cleanData).eq('id', 1);
    return { count: 1 };
  }

  // Upsert records
  const { error } = await supabase.from(tableName).upsert(records, { onConflict: 'id' });
  if (error) throw error;

  return { count: records.length };
}
