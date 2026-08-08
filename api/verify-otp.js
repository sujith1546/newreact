import { otpStore } from "./send-otp.js";

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: "Method not allowed" }));
  }

  const { email, code } = req.body || {};
  const targetEmail = (email || "sujithreddy1546@gmail.com").trim().toLowerCase();

  const record = otpStore.get(targetEmail);
  if (!record) {
    res.statusCode = 400;
    return res.end(JSON.stringify({ error: "No OTP requested or code expired. Please click Send Security OTP Code." }));
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(targetEmail);
    res.statusCode = 400;
    return res.end(JSON.stringify({ error: "Verification code has expired. Please request a new code." }));
  }

  if (record.attempts >= 5) {
    otpStore.delete(targetEmail);
    res.statusCode = 429;
    return res.end(JSON.stringify({ error: "Too many incorrect attempts. Please request a new code." }));
  }

  if (record.code !== String(code).trim()) {
    record.attempts += 1;
    res.statusCode = 400;
    return res.end(JSON.stringify({ error: `Invalid 6-digit security code. (${5 - record.attempts} attempts remaining)` }));
  }

  // OTP is verified and correct!
  otpStore.delete(targetEmail);
  res.statusCode = 200;
  return res.end(JSON.stringify({ success: true, verified: true }));
}
