import nodemailer from "nodemailer";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>"']/g, (m) => {
    switch (m) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#039;';
      default: return m;
    }
  });
}

// Setup in-memory fallback rate limiter for contact form
const contactLimitMap = new Map();
const LIMIT_WINDOW = 5 * 60 * 1000; // 5 minutes
const MAX_CONTACT_REQUESTS = 3; // Max 3 messages per 5 mins per IP

function checkContactRateLimit(ip) {
  const now = Date.now();
  const record = contactLimitMap.get(ip);
  if (!record) {
    contactLimitMap.set(ip, { count: 1, firstRequest: now });
    return true;
  }
  if (now - record.firstRequest > LIMIT_WINDOW) {
    contactLimitMap.set(ip, { count: 1, firstRequest: now });
    return true;
  }
  if (record.count >= MAX_CONTACT_REQUESTS) return false;
  record.count += 1;
  return true;
}

// Clean up memory
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of contactLimitMap.entries()) {
    if (now - record.firstRequest > LIMIT_WINDOW) contactLimitMap.delete(ip);
  }
}, LIMIT_WINDOW).unref?.();

// Setup durable Upstash rate limiter
let ratelimit = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(3, "300 s"), // 3 messages per 5 minutes
    });
  } catch (err) {
    console.warn("Could not construct Upstash Redis rate-limiter for contact, using memory fallback:", err);
  }
}

export default async function handler(req, res) {
  // Security 1: CORS Whitelist Constraints
  const allowedOrigins = ["https://sujiththota.vercel.app", "http://localhost:5173", "http://localhost:3000", "http://localhost:3001"];
  const origin = req.headers.origin;
  const isAllowed = origin && (
    allowedOrigins.includes(origin) || 
    (origin.endsWith(".vercel.app") && origin.includes("sujith"))
  );
  
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", isAllowed ? origin : "https://sujiththota.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-portfolio-session"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Security 1.5: Rate Limiting check (Upstash or In-memory fallback)
  const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  if (ratelimit) {
    const { success } = await ratelimit.limit(clientIp);
    if (!success) {
      return res.status(429).json({ error: "Too many requests. Please wait a few minutes." });
    }
  } else {
    if (!checkContactRateLimit(clientIp)) {
      return res.status(429).json({ error: "Too many contact attempts. Please wait a few minutes." });
    }
  }

  // Security 2: Session Leasing Check (Note: client-side session tokens are bypassable by custom scripts)
  const sessionToken = req.headers['x-portfolio-session'];
  if (!sessionToken || sessionToken.length < 16) {
    return res.status(403).json({ error: "Invalid or missing session token. Unauthorized." });
  }

  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing required fields (name, email, message)" });
  }

  // Security 3: Message length checks (Anti-abuse)
  if (message.length > 2000) {
    return res.status(400).json({ error: "Message too long. Keep it under 2000 characters." });
  }

  // Security 4: Validate Email Format Regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email address format" });
  }

  // Check if SMTP credentials exist
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    console.error("Missing SMTP credentials (SMTP_USER / SMTP_PASS) in environment variables!");
    return res.status(500).json({
      error: "SMTP credentials not configured. Please define SMTP_USER and SMTP_PASS in your environment."
    });
  }

  try {
    // 1. Calculate dynamic fields
    const initials = name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "S";

    const wordCount = message.trim().split(/\s+/).filter(Boolean).length;

    // Date & Time in IST
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "short",
      year: "numeric"
    });
    const timeStr = now.toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    }) + " IST";

    // 2. Configure Nodemailer Transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    // Escape HTML inputs for injection prevention
    const safeName = escapeHTML(name);
    const safeEmail = escapeHTML(email);
    const safeMessage = escapeHTML(message).replace(/\n/g, "<br/>");

    // 3. Formulate the email body exactly like the user's template design
    const mailOptions = {
      from: `"Sujith Portfolio" <${smtpUser}>`,
      to: smtpUser, // Send to your own inbox
      replyTo: email, // Directly reply to the recruiter
      subject: `Portfolio Contact Form: ${name}`,
      text: `Sujith Thota Portfolio contact form:\n\nName: ${name}\nEmail: ${email}\nDate: ${dateStr} ${timeStr}\n\nSubject: ${name} sent a message from your portfolio\nMessage (${wordCount} words):\n${message}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>New Message</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; padding: 20px 8px;">
            <tr>
              <td align="center">
                
                <!-- Main Card -->
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.03); border-collapse: separate;">
                  
                  <!-- Card Header -->
                  <tr>
                    <td style="padding: 16px 12px; border-bottom: 1px solid #f3f4f6;">
                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <!-- Logo + Title -->
                          <td align="left" style="vertical-align: middle;">
                            <table border="0" cellspacing="0" cellpadding="0">
                              <tr>
                                <td style="background-color: #0f172a; color: #ffffff; font-weight: bold; font-size: 15px; text-align: center; width: 30px; height: 30px; line-height: 30px; border-radius: 6px; font-family: inherit;">S</td>
                                <td style="font-weight: 700; font-size: 13.5px; color: #0f172a; padding-left: 8px; letter-spacing: -0.01em;">Portfolio contact form</td>
                              </tr>
                            </table>
                          </td>
                          <!-- Badge -->
                          <td align="right" style="vertical-align: middle;">
                            <span style="background-color: #dcfce7; color: #16a34a; font-size: 10.5px; font-weight: 700; padding: 3px 8px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.05em;">• New</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Card Body -->
                  <tr>
                    <td style="padding: 18px 12px;">
                      
                      <!-- Sender Info Row -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
                        <tr>
                          <!-- Avatar -->
                          <td width="36" style="vertical-align: top;">
                            <div style="background-color: #eef2ff; color: #4f46e5; font-weight: 700; font-size: 14px; text-align: center; width: 36px; height: 36px; line-height: 36px; border-radius: 50%;">${initials}</div>
                          </td>
                          <!-- Name / Email -->
                          <td style="padding-left: 10px; vertical-align: middle; text-align: left;">
                            <div style="font-weight: 700; font-size: 14.5px; color: #0f172a; line-height: 1.2;">${safeName}</div>
                            <div style="font-size: 12.5px; color: #4f46e5; margin-top: 3px; word-break: break-all; -webkit-hyphens: auto; -ms-hyphens: auto; hyphens: auto;">
                              <a href="mailto:${safeEmail}" style="color: #4f46e5; text-decoration: none; word-break: break-all;">${safeEmail}</a>
                            </div>
                          </td>
                          <!-- Date/Time (IST) -->
                          <td align="right" style="vertical-align: middle; font-size: 10.5px; color: #6b7280; line-height: 1.35; white-space: nowrap; padding-left: 10px;">
                            <div>${dateStr}</div>
                            <div style="margin-top: 1px;">${timeStr}</div>
                          </td>
                        </tr>
                      </table>

                      <!-- Subject Chip Box -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; border-radius: 10px; margin-bottom: 18px;">
                        <tr>
                          <td style="padding: 10px 14px; text-align: left;">
                            <div style="font-size: 9px; font-weight: bold; color: #9ca3af; letter-spacing: 0.08em; text-transform: uppercase;">Subject</div>
                            <div style="font-size: 13.5px; font-weight: 700; color: #0f172a; margin-top: 3px;">${safeName} sent a message from your portfolio</div>
                          </td>
                        </tr>
                      </table>

                      <!-- Message Area -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
                        <tr>
                          <td>
                            <!-- Header / Word Count -->
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 5px;">
                              <tr>
                                <td align="left" style="font-size: 9px; font-weight: bold; color: #9ca3af; letter-spacing: 0.08em; text-transform: uppercase;">Message</td>
                                <td align="right" style="font-size: 10.5px; color: #9ca3af; font-family: monospace;">${wordCount} words</td>
                              </tr>
                            </table>
                            <!-- Text content box -->
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border: 1px solid #f3f4f6; border-radius: 12px; border-collapse: separate;">
                              <tr>
                                <td style="padding: 14px 16px; font-size: 13px; line-height: 1.6; color: #374151; text-align: left;">
                                  ${safeMessage}
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <!-- Action Buttons -->
                      <table border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 4px;">
                        <tr>
                          <td style="background-color: #0f172a; border-radius: 8px;">
                            <a href="mailto:${safeEmail}?subject=Re:%20Portfolio%20contact" target="_blank" style="display: inline-block; padding: 10px 14px; color: #ffffff; font-size: 12.5px; font-weight: 600; text-decoration: none; font-family: inherit;">Reply to ${safeName.split(" ")[0]}</a>
                          </td>
                          <td style="padding-left: 10px;">
                            <a href="mailto:${safeEmail}" style="display: inline-block; padding: 9px 14px; background-color: #ffffff; border: 1px solid #e5e7eb; color: #0f172a; font-size: 12.5px; font-weight: 600; text-decoration: none; border-radius: 8px; font-family: inherit;">Contact Direct</a>
                          </td>
                        </tr>
                      </table>

                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 16px 12px; border-top: 1px solid #f3f4f6; background-color: #fafafa;">
                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td align="left" style="font-size: 11px; color: #9ca3af;">Sent via your portfolio contact form</td>
                          <td align="right" style="font-size: 11px; color: #9ca3af; font-weight: 600;">sujiththota.dev</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- Bottom Automated Disclaimer -->
                <div style="text-align: center; font-size: 10px; color: #9ca3af; margin-top: 16px; letter-spacing: 0.02em;">
                  This is an automated notification - do not reply to this email address directly
                </div>

              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    };

    // 4. Send Email
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Nodemailer service failed to deliver message:", error);
    return res.status(500).json({
      error: error.message || "Something went wrong while sending the email."
    });
  }
}
