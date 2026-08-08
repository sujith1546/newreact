import nodemailer from "nodemailer";

// In-memory global OTP store (keyed by lowercase email)
export const otpStore = globalThis._otpStore || new Map();
globalThis._otpStore = otpStore;

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: "Method not allowed" }));
  }

  const { email } = req.body || {};
  const targetEmail = (email || "sujithreddy1546@gmail.com").trim();

  // Generate real 6-digit numeric OTP code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  otpStore.set(targetEmail.toLowerCase(), {
    code,
    expiresAt,
    attempts: 0
  });

  const smtpUser = process.env.SMTP_USER || "sujithreddy1546@gmail.com";
  const smtpPass = process.env.SMTP_PASS || "larxejenpkpuxcgh";

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: smtpUser,
      pass: smtpPass,
    }
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { background: #0a0d10; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; margin: 0; }
        .card { background: #12161b; border: 1px solid #232a31; border-radius: 16px; max-width: 480px; margin: 0 auto; padding: 32px 24px; text-align: center; }
        .badge { display: inline-block; background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.2); color: #38bdf8; padding: 6px 14px; border-radius: 999px; font-size: 12px; font-weight: 600; margin-bottom: 20px; }
        h1 { font-size: 20px; font-weight: 700; margin: 0 0 8px; color: #ffffff; }
        p { color: #94a3b8; font-size: 13px; margin: 0 0 24px; line-height: 1.5; }
        .otp-box { background: #080b0e; border: 2px solid #3b82f6; border-radius: 12px; padding: 18px; margin: 20px 0; }
        .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #38bdf8; font-family: monospace; }
        .footer { font-size: 11px; color: #64748b; margin-top: 24px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="badge">🔒 Admin Security Hub</div>
        <h1>Your 6-Digit Verification Code</h1>
        <p>Use the 6-digit one-time code below to log in to your Portfolio Admin Console:</p>
        <div class="otp-box">
          <div class="otp-code">${code}</div>
        </div>
        <p style="color: #64748b; font-size: 12px; margin-bottom: 0;">
          This code expires in <strong>10 minutes</strong>. Do not share this code with anyone.
        </p>
        <div class="footer">
          © ${new Date().getFullYear()} Sujith Thota Portfolio Security · TLS 1.3
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Sujith Portfolio Admin" <${smtpUser}>`,
      to: targetEmail,
      subject: `🔑 ${code} is your Admin Login Security Code`,
      html,
    });

    res.statusCode = 200;
    return res.end(JSON.stringify({ success: true, message: "OTP code sent to email successfully" }));
  } catch (err) {
    console.error("Failed to send OTP via SMTP:", err);
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: "Failed to send OTP email: " + err.message }));
  }
}
