import nodemailer from "nodemailer";

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: "Method not allowed" }));
  }

  const { userAgent, ip, timestamp, email } = req.body || {};

  const smtpUser = process.env.SMTP_USER || "sujithreddy1546@gmail.com";
  const smtpPass = process.env.SMTP_PASS || "larxejenpkpuxcgh";

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: smtpUser, pass: smtpPass }
  });

  const loginTime = timestamp ? new Date(timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  const detectedIp = ip || req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "Unknown";
  const browser = userAgent ? userAgent.substring(0, 200) : "Unknown";

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8" /></head>
    <body style="margin:0;padding:0;background:#0a0d10;font-family:'Segoe UI',Arial,sans-serif;">
      <div style="max-width:560px;margin:30px auto;background:#12161b;border:1px solid rgba(239,68,68,0.3);border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,rgba(239,68,68,0.2),rgba(99,102,241,0.1));padding:24px 28px;border-bottom:1px solid rgba(239,68,68,0.2);">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:40px;height:40px;border-radius:10px;background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.3);display:flex;align-items:center;justify-content:center;font-size:20px;">🚨</div>
            <div>
              <h2 style="margin:0;color:#ef4444;font-size:16px;font-weight:700;">New Admin Login Detected</h2>
              <p style="margin:2px 0 0;color:#94a3b8;font-size:12px;">Portfolio Security Shield — Suspicious Activity Alert</p>
            </div>
          </div>
        </div>
        <div style="padding:24px 28px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);color:#94a3b8;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;width:130px;">Time</td>
              <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);color:#e2e8f0;font-size:13px;">${loginTime} IST</td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);color:#94a3b8;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">IP Address</td>
              <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);color:#e2e8f0;font-size:13px;font-family:monospace;">${detectedIp}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);color:#94a3b8;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Admin Email</td>
              <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);color:#e2e8f0;font-size:13px;">${email || smtpUser}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#94a3b8;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">User Agent</td>
              <td style="padding:10px 0;color:#e2e8f0;font-size:11px;font-family:monospace;word-break:break-all;">${browser}</td>
            </tr>
          </table>
          <div style="margin-top:20px;padding:14px 16px;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:10px;">
            <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.5;">
              If this was you, no action needed. If you did not initiate this login, 
              <strong style="color:#ef4444;">immediately revoke all sessions</strong> from the Admin Console → Settings → Security → Active Sessions.
            </p>
          </div>
        </div>
        <div style="padding:14px 28px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
          <p style="margin:0;color:#475569;font-size:11px;">Portfolio Security Shield • sujiththota.dev</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Portfolio Security" <${smtpUser}>`,
      to: smtpUser,
      subject: `🚨 New Admin Login Detected — ${loginTime}`,
      html,
    });
    res.statusCode = 200;
    return res.end(JSON.stringify({ ok: true }));
  } catch (err) {
    console.error("Login alert email failed:", err);
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: "Failed to send alert" }));
  }
}
