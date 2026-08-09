import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const reportData = req.body?.['csp-report'] || req.body || {};
    const blockedUri = reportData['blocked-uri'] || reportData.blockedUri || 'unknown';
    const violatedDirective = reportData['violated-directive'] || reportData.violatedDirective || 'unknown';
    const documentUri = reportData['document-uri'] || reportData.documentUri || 'unknown';

    console.warn(`[CSP Violation] Blocked: ${blockedUri} | Directive: ${violatedDirective}`);

    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      await supabase.from('admin_audit_logs').insert([{
        action: 'CSP_VIOLATION_REPORTED',
        details: JSON.stringify({
          blockedUri,
          violatedDirective,
          documentUri,
          userAgent: req.headers['user-agent'] || 'unknown',
          ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown'
        }),
        ip_address: req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown',
        created_at: new Date().toISOString()
      }]).catch(() => {});
    }

    return res.status(204).end();
  } catch (err) {
    console.error('CSP report processing failed:', err);
    return res.status(200).end();
  }
}
