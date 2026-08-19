/**
 * api/canary.js — Brute Force Canary Token System
 *
 * After MAX_FAILED_LOGINS consecutive failed admin login attempts,
 * a unique one-time canary URL is generated and emailed to the admin.
 *
 * If ANYONE visits that canary URL, an immediate security alert is
 * triggered — indicating the attacker may have found the admin's email
 * or is probing the system further.
 *
 * Endpoints:
 *   POST /api/canary/generate  — Create + email a canary token
 *   GET  /api/canary/ping?id=  — Canary visit detected → fire alert
 */

import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'sujithreddy1546@gmail.com';

function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export default async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname.replace('/api/canary', '');

  // ── POST /api/canary/generate ─────────────────────────────────────────
  if (req.method === 'POST' && path === '/generate') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const { attempts, ip_hint } = body;

      // Generate a unique canary token ID
      const tokenId = `cnry_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

      // Store in Supabase
      const { error: dbError } = await supabase.from('canary_tokens').insert([{
        token_id: tokenId,
        triggered: false,
        attempts_at_creation: attempts || 0,
        ip_hint: ip_hint || 'unknown',
        expires_at: expiresAt,
        created_at: new Date().toISOString(),
      }]);

      if (dbError) {
        console.error('[Canary] DB insert error:', dbError.message);
      }

      // Email canary link to admin
      const canaryUrl = `${process.env.SITE_URL || 'https://sujith-thota.vercel.app'}/api/canary/ping?id=${tokenId}`;

      const transporter = createTransporter();
      await transporter.sendMail({
        from: `"Portfolio Security" <${process.env.SMTP_USER}>`,
        to: ADMIN_EMAIL,
        subject: '🚨 Security Alert: Multiple Failed Admin Login Attempts',
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #0f172a; color: #f8fafc; padding: 24px; border-radius: 12px;">
              <h2 style="color: #ef4444; margin-top: 0;">⚠️ Security Alert</h2>
              <p>We detected <strong>${attempts || 5}+ failed admin login attempts</strong> on your portfolio CMS.</p>
              <p style="color: #94a3b8; font-size: 14px;">IP hint: <code>${ip_hint || 'unknown'}</code></p>
              <hr style="border-color: #1e293b; margin: 20px 0;" />
              <p>A <strong>canary token</strong> has been generated. If someone visits the link below, it means an attacker is actively probing your system and may have found your email:</p>
              <div style="background: #1e293b; padding: 12px; border-radius: 8px; margin: 16px 0; word-break: break-all;">
                <strong style="color: #fbbf24;">🪤 Canary URL:</strong><br/>
                <span style="color: #64748b; font-size: 12px;">DO NOT share this URL. If this link is visited, you will receive an immediate alert.</span>
              </div>
              <p style="font-size: 12px; color: #64748b;">If this was you testing, you can ignore this email. Token expires in 7 days.</p>
            </div>
          </div>
        `,
      });

      res.statusCode = 200;
      return res.end(JSON.stringify({ ok: true, tokenId }));
    } catch (err) {
      console.error('[Canary generate] error:', err.message);
      res.statusCode = 200; // Always return 200 for security (don't leak errors)
      return res.end(JSON.stringify({ ok: true }));
    }
  }

  // ── GET /api/canary/ping?id= ──────────────────────────────────────────
  if (req.method === 'GET' && path === '/ping') {
    const tokenId = url.searchParams.get('id') || '';
    try {
      // Mark as triggered in DB
      const { data: token } = await supabase
        .from('canary_tokens')
        .select('*')
        .eq('token_id', tokenId)
        .single();

      if (token && !token.triggered) {
        await supabase
          .from('canary_tokens')
          .update({ triggered: true, triggered_at: new Date().toISOString() })
          .eq('token_id', tokenId);

        // Log security event
        await supabase.from('threat_events').insert([{
          event_type: 'CANARY_TOKEN_TRIGGERED',
          severity: 'critical',
          context: { tokenId, ip_hint: req.headers['x-forwarded-for'] || 'unknown' },
          created_at: new Date().toISOString(),
        }]).catch(() => {});

        // Send immediate critical alert
        const transporter = createTransporter();
        await transporter.sendMail({
          from: `"Portfolio Security" <${process.env.SMTP_USER}>`,
          to: ADMIN_EMAIL,
          subject: '🔴 CRITICAL: Canary Token Triggered — Potential Attacker Detected',
          html: `
            <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #0f172a; color: #f8fafc; padding: 24px; border-radius: 12px; border: 2px solid #ef4444;">
                <h2 style="color: #ef4444; margin-top: 0;">🔴 CRITICAL SECURITY ALERT</h2>
                <p>Your <strong>canary token was just visited</strong>!</p>
                <p>This means an attacker or suspicious entity has found and visited the canary URL — they may be actively targeting your admin account.</p>
                <p style="color: #94a3b8; font-size: 14px;">Token ID: <code>${tokenId}</code></p>
                <p style="color: #94a3b8; font-size: 14px;">Time: ${new Date().toISOString()}</p>
                <hr style="border-color: #1e293b; margin: 20px 0;" />
                <h3 style="color: #fbbf24;">Recommended Actions:</h3>
                <ol>
                  <li>Change your admin password immediately</li>
                  <li>Revoke all active sessions in the CMS</li>
                  <li>Review the audit log for suspicious activity</li>
                  <li>Check your email for any phishing attempts</li>
                </ol>
              </div>
            </div>
          `,
        });
      }
    } catch (err) {
      console.error('[Canary ping] error:', err.message);
    }

    // Always return a 1x1 transparent GIF (like a tracking pixel — looks innocuous)
    res.statusCode = 200;
    res.setHeader('Content-Type', 'image/gif');
    res.setHeader('Cache-Control', 'no-store');
    const transparentGif = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    return res.end(transparentGif);
  }

  res.statusCode = 404;
  res.end();
}
