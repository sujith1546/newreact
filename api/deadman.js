/**
 * api/deadman.js — Dead Man's Switch Alert
 *
 * Checks if the admin has logged into the CMS recently.
 * If no login for N days (configurable), sends a security alert email.
 *
 * Deploy as a Vercel Cron Job (vercel.json):
 *   { "crons": [{ "path": "/api/deadman", "schedule": "0 9 * * *" }] }
 * This runs daily at 09:00 UTC.
 *
 * The last_admin_login timestamp is stored in the `site_settings` table
 * and updated automatically on each successful admin login (via auditLogger).
 */

import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'sujithreddy1546@gmail.com';
const DEFAULT_THRESHOLD_DAYS = 30;

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
  // Verify cron secret to prevent unauthorized triggering
  const authHeader = req.headers['authorization'] || '';
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    res.statusCode = 401;
    return res.end(JSON.stringify({ error: 'Unauthorized' }));
  }

  try {
    // Fetch settings from Supabase
    const { data: settings } = await supabase
      .from('site_settings')
      .select('last_admin_login, deadman_threshold_days')
      .eq('id', 1)
      .single();

    if (!settings) {
      res.statusCode = 200;
      return res.end(JSON.stringify({ ok: true, message: 'No settings found, skipping' }));
    }

    const thresholdDays = settings.deadman_threshold_days || DEFAULT_THRESHOLD_DAYS;
    const lastLogin = settings.last_admin_login
      ? new Date(settings.last_admin_login)
      : null;

    if (!lastLogin) {
      res.statusCode = 200;
      return res.end(JSON.stringify({ ok: true, message: 'No login recorded yet' }));
    }

    const daysSinceLogin = Math.floor((Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceLogin >= thresholdDays) {
      // Send dead man's switch alert
      const transporter = createTransporter();
      await transporter.sendMail({
        from: `"Portfolio Security" <${process.env.SMTP_USER}>`,
        to: ADMIN_EMAIL,
        subject: `🔔 CMS Alert: No admin login in ${daysSinceLogin} days`,
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #0f172a; color: #f8fafc; padding: 24px; border-radius: 12px; border: 1px solid #334155;">
              <h2 style="color: #fbbf24; margin-top: 0;">🔔 Portfolio CMS — Inactivity Alert</h2>
              <p>Your portfolio CMS has not been accessed in <strong>${daysSinceLogin} days</strong>.</p>
              <p style="color: #94a3b8;">Last login: <strong>${lastLogin.toLocaleDateString('en-IN', { 
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
              })}</strong></p>
              <hr style="border-color: #1e293b; margin: 20px 0;" />
              <p>This is an automated reminder. If everything is fine, you can log in to reset this counter.</p>
              <p style="font-size: 12px; color: #64748b;">
                You configured this alert to fire after ${thresholdDays} days of inactivity.<br/>
                Adjust the threshold in CMS Settings → Security.
              </p>
            </div>
          </div>
        `,
      });

      // Log the alert
      await supabase.from('threat_events').insert([{
        event_type: 'DEADMAN_SWITCH_TRIGGERED',
        severity: 'medium',
        context: { daysSinceLogin, thresholdDays, lastLogin: lastLogin.toISOString() },
        created_at: new Date().toISOString(),
      }]).catch(() => {});

      res.statusCode = 200;
      return res.end(JSON.stringify({ ok: true, alerted: true, daysSinceLogin }));
    }

    res.statusCode = 200;
    return res.end(JSON.stringify({ ok: true, alerted: false, daysSinceLogin }));
  } catch (err) {
    console.error('[DeadMan] error:', err.message);
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: err.message }));
  }
}
