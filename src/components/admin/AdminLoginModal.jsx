import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabaseClient";
import { useTheme } from "../../context/ThemeContext";
import { logSecurityEvent, logAuditEvent } from "../../lib/auditLogger";
import {
  generateSessionNonce,
  touchLastActive,
  setSessionLocked,
  setRememberSessionPreference,
  getRememberSessionPreference,
} from "../../lib/sessionSecurity";
import {
  Lock, Mail, Eye, EyeOff, Shield, ShieldCheck, Clock, ArrowRight,
  AlertTriangle, X, KeyRound, Loader2, Fingerprint, CheckCircle2,
} from "lucide-react";

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60000;

function computeLoginRiskScore(failedAttempts = 0) {
  let score = 0;
  const reasons = [];
  const istHour = Math.floor((new Date().getUTCHours() + 5.5) % 24);
  if (istHour >= 22 || istHour < 6) {
    score += 20;
    reasons.push(`Off-hours access (${istHour}:00 IST)`);
  }
  if (failedAttempts > 0) {
    const pts = failedAttempts * 15;
    score += pts;
    reasons.push(`${failedAttempts} failed attempt(s)`);
  }
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    const lastTz = localStorage.getItem("_admin_tz") || "";
    if (lastTz && lastTz !== tz) { score += 30; reasons.push(`Timezone changed`); }
  } catch {}
  return { score: Math.min(100, score), reasons };
}

export default function AdminLoginModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const emailInputRef = useRef(null);
  const isDark = theme === "dark" || (typeof document !== "undefined" && document.documentElement.getAttribute("data-theme") === "dark");

  // Auth State
  const [email, setEmail] = useState("sujithreddy1546@gmail.com");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const [activeMethod, setActiveMethod] = useState("password"); // "password" | "otp"
  const [rememberDevice, setRememberDevice] = useState(() => getRememberSessionPreference());

  // Lockout
  const [attempts, setAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  // MFA TOTP
  const [mfaRequired, setMfaRequired] = useState(false);
  const [totpFactorId, setTotpFactorId] = useState("");
  const [totpCode, setTotpCode] = useState("");

  // Email OTP
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpCode, setEmailOtpCode] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);

  // Hardware biometrics availability
  const [biometricAvailable, setBiometricAvailable] = useState(null);

  useEffect(() => {
    if (window.PublicKeyCredential && typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === "function") {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then(v => setBiometricAvailable(v))
        .catch(() => setBiometricAvailable(false));
    } else {
      setBiometricAvailable(false);
    }
  }, []);

  // Focus trap & scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setTimeout(() => emailInputRef.current?.focus(), 100);
    return () => {
      document.body.style.overflow = overflow;
      prev?.focus?.();
    };
  }, [isOpen]);

  // Escape to close
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape" && isOpen) onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [isOpen, onClose]);

  // OTP countdown
  useEffect(() => {
    if (otpTimer <= 0) return;
    const id = setInterval(() => setOtpTimer(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [otpTimer]);

  // Lockout check
  useEffect(() => {
    const check = () => {
      try {
        const exp = localStorage.getItem("admin_login_lockout");
        if (exp) {
          const rem = Math.ceil((parseInt(exp, 10) - Date.now()) / 1000);
          if (rem > 0) { setLockoutTimer(rem); setError(`Too many failed attempts. Locked out for ${rem}s.`); }
          else { localStorage.removeItem("admin_login_lockout"); localStorage.removeItem("admin_login_attempts"); setLockoutTimer(0); setAttempts(0); setError(""); }
        }
      } catch {}
    };
    check();
    const id = setInterval(check, 1000);
    return () => clearInterval(id);
  }, []);

  const shake = () => { setIsShaking(true); setTimeout(() => setIsShaking(false), 500); };

  const handleFailedAttempt = useCallback((extraAttempts = 0) => {
    const n = attempts + 1 + extraAttempts;
    setAttempts(n);
    shake();
    try {
      localStorage.setItem("admin_login_attempts", n.toString());
      if (n >= MAX_ATTEMPTS) {
        const exp = Date.now() + LOCKOUT_DURATION_MS;
        localStorage.setItem("admin_login_lockout", exp.toString());
        setLockoutTimer(60);
        setError("Too many failed attempts. Locked out for 60 seconds.");
        logSecurityEvent("BRUTE_FORCE_DETECTED", { attempts: n }, "critical").catch(() => {});
      }
    } catch {}
  }, [attempts]);

  // Password sign-in
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (lockoutTimer > 0) return;
    setLoading(true); setError("");
    const { score, reasons } = computeLoginRiskScore(attempts);
    logSecurityEvent("ADMIN_LOGIN_ATTEMPT", { riskScore: score, reasons }, score >= 50 ? "high" : "low").catch(() => {});
    try {
      setRememberSessionPreference(rememberDevice);
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (authError) { handleFailedAttempt(); setError(authError.message || "Invalid email or password."); return; }

      const { data: factors } = await supabase.auth.mfa.listFactors();
      const verifiedTotp = factors?.totp?.find(f => f.status === "verified");
      if (verifiedTotp) { setTotpFactorId(verifiedTotp.id); setMfaRequired(true); return; }

      try {
        localStorage.removeItem("admin_login_attempts");
        localStorage.removeItem("admin_login_lockout");
        localStorage.setItem("_admin_tz", Intl.DateTimeFormat().resolvedOptions().timeZone || "");
        generateSessionNonce();
        touchLastActive();
        setSessionLocked(false);
      } catch {}
      logAuditEvent("ADMIN_LOGIN_SUCCESS", "auth", email, { riskScore: score }).catch(() => {});
      onClose(); navigate("/admin/dashboard");
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally { setLoading(false); }
  };

  // Email OTP send
  const handleSendEmailOtp = async (e) => {
    e?.preventDefault();
    if (lockoutTimer > 0) return;
    setLoading(true); setError("");
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: false } });
      if (otpError) { setError(otpError.message); return; }
      setEmailOtpSent(true); setOtpTimer(60);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  // Email OTP verify
  const handleVerifyEmailOtp = async (e) => {
    e.preventDefault();
    if (lockoutTimer > 0 || emailOtpCode.length !== 6) return;
    setLoading(true); setError("");
    try {
      setRememberSessionPreference(rememberDevice);
      const { error: verifyError } = await supabase.auth.verifyOtp({ email: email.trim(), token: emailOtpCode.trim(), type: "email" });
      if (verifyError) { handleFailedAttempt(); setError(verifyError.message || "Invalid code."); return; }
      generateSessionNonce();
      touchLastActive();
      setSessionLocked(false);
      onClose(); navigate("/admin/dashboard");
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  // TOTP MFA verify
  const handleTotpSubmit = async (e) => {
    e.preventDefault();
    if (lockoutTimer > 0 || totpCode.length !== 6) return;
    setLoading(true); setError("");
    try {
      const { data: ch, error: chErr } = await supabase.auth.mfa.challenge({ factorId: totpFactorId });
      if (chErr) throw chErr;
      const { error: verifyErr } = await supabase.auth.mfa.verify({ factorId: totpFactorId, challengeId: ch.id, code: totpCode.trim() });
      if (verifyErr) { handleFailedAttempt(); setError(verifyErr.message || "Invalid authenticator code."); return; }
      generateSessionNonce();
      touchLastActive();
      setSessionLocked(false);
      onClose(); navigate("/admin/dashboard");
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  if (typeof document === "undefined") return null;

  const css = `
    .alm-card {
      --alm-bg: rgba(255,255,255,0.98);
      --alm-border: rgba(0,0,0,0.08);
      --alm-text: #0f172a;
      --alm-muted: #64748b;
      --alm-sub: #94a3b8;
      --alm-field-bg: #f8fafc;
      --alm-field-border: #e2e8f0;
      --alm-tab-track: #f1f5f9;
      --alm-tab-active: #0f172a;
      --alm-tab-active-text: #fff;
      --alm-btn: #0f172a;
      --alm-btn-text: #fff;
      --alm-shadow: 0 24px 64px -12px rgba(15,23,42,0.22), 0 0 0 1px rgba(0,0,0,0.04);
    }
    .alm-card.dark {
      --alm-bg: rgba(18,20,27,0.97);
      --alm-border: rgba(255,255,255,0.1);
      --alm-text: #f8fafc;
      --alm-muted: #94a3b8;
      --alm-sub: #64748b;
      --alm-field-bg: rgba(255,255,255,0.05);
      --alm-field-border: rgba(255,255,255,0.1);
      --alm-tab-track: rgba(255,255,255,0.04);
      --alm-tab-active: #fff;
      --alm-tab-active-text: #0f172a;
      --alm-btn: #fff;
      --alm-btn-text: #0f172a;
      --alm-shadow: 0 24px 64px -12px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08);
    }
    .alm-field {
      position: relative; display: flex; align-items: center;
      background: var(--alm-field-bg); border: 1px solid var(--alm-field-border);
      border-radius: 10px; height: 42px; transition: border-color 0.15s;
    }
    .alm-field:focus-within { border-color: #3b82f6; }
    .alm-input {
      width: 100%; height: 100%; background: transparent; border: none;
      outline: none; color: var(--alm-text); font-size: 13.5px;
      padding-left: 38px; padding-right: 12px; box-sizing: border-box;
    }
    .alm-input:-webkit-autofill {
      -webkit-text-fill-color: var(--alm-text) !important;
      -webkit-box-shadow: 0 0 0 1000px var(--alm-field-bg) inset !important;
    }
    .alm-btn-primary {
      width: 100%; height: 42px; background: var(--alm-btn); color: var(--alm-btn-text);
      font-weight: 700; font-size: 13.5px; border: none; border-radius: 10px;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      gap: 7px; transition: all 0.15s; box-shadow: 0 2px 8px rgba(0,0,0,0.12);
    }
    .alm-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .alm-btn-primary:not(:disabled):hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(0,0,0,0.18); }
    .alm-tab-btn {
      flex: 1; border: none; background: transparent; padding: 7px 12px;
      border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 6px;
      transition: all 0.18s; color: var(--alm-muted);
    }
    .alm-tab-btn.active { background: var(--alm-tab-active); color: var(--alm-tab-active-text); box-shadow: 0 1px 4px rgba(0,0,0,0.15); }
    .alm-pill {
      display: inline-flex; align-items: center; gap: 5px;
      font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 8px;
    }
    .alm-label {
      display: block; font-size: 11.5px; font-weight: 600;
      color: var(--alm-muted); margin-bottom: 6px;
    }
  `;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="alm-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          style={{
            position: "fixed", inset: 0, zIndex: 2147483648,
            background: isDark ? "rgba(0,0,0,0.65)" : "rgba(15,23,42,0.45)",
            backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
          }}
        >
          <style>{css}</style>

          {/* Ambient glow */}
          <div style={{
            position: "absolute", width: 480, height: 480, borderRadius: "50%", pointerEvents: "none",
            background: "radial-gradient(circle, rgba(59,130,246,0.14) 0%, rgba(99,102,241,0.07) 50%, transparent 70%)",
            filter: "blur(50px)",
          }} />

          <motion.div
            key="alm-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="alm-title"
            className={`alm-card${isDark ? " dark" : ""}`}
            initial={{ opacity: 0, scale: 0.9, y: 24, filter: "blur(8px)" }}
            animate={
              isShaking
                ? { x: [-10, 10, -7, 7, -3, 3, 0], opacity: 1, scale: 1, y: 0, transition: { duration: 0.45 } }
                : { opacity: 1, scale: 1, y: 0, x: 0, filter: "blur(0px)" }
            }
            exit={{ opacity: 0, scale: 0.95, y: 12, filter: "blur(4px)", transition: { duration: 0.15 } }}
            transition={{ type: "spring", damping: 26, stiffness: 380, mass: 0.8 }}
            onClick={e => e.stopPropagation()}
            style={{
              position: "relative", maxWidth: 400, width: "100%",
              background: "var(--alm-bg)", border: "0.5px solid var(--alm-border)",
              borderRadius: 22, boxShadow: "var(--alm-shadow)", overflow: "hidden",
              color: "var(--alm-text)",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif",
            }}
          >
            {/* Top strip */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "16px 18px 10px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: "50%",
                  background: "linear-gradient(135deg, #1d4ed8, #4f46e5)",
                  color: "#fff", fontWeight: 800, fontSize: 11.5,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 2px 10px rgba(79,70,229,0.45)", flexShrink: 0,
                }}>ST</div>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--alm-text)", lineHeight: 1.2 }}>Sujith Thota</div>
                  <div style={{ fontSize: 10.5, color: "#22c55e", fontWeight: 600, lineHeight: 1.2 }}>Portfolio Admin</div>
                </div>
              </div>
              <motion.button
                type="button" onClick={onClose} aria-label="Close"
                whileHover={{ scale: 1.12, rotate: 90 }} whileTap={{ scale: 0.88 }}
                transition={{ type: "spring", damping: 22, stiffness: 400 }}
                style={{
                  background: "none", border: "none", color: "var(--alm-muted)", cursor: "pointer",
                  width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
                  borderRadius: "50%",
                }}
              ><X size={17} /></motion.button>
            </div>

            {/* Heading */}
            <div style={{ textAlign: "center", padding: "2px 20px 16px" }}>
              <div style={{
                width: 44, height: 44, borderRadius: 14, margin: "0 auto 10px",
                background: isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.05)",
                border: "1px solid var(--alm-border)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <ShieldCheck size={22} color={isDark ? "#60a5fa" : "#1d4ed8"} />
              </div>
              <h3 id="alm-title" style={{
                fontSize: 21, fontWeight: 800, color: "var(--alm-text)",
                margin: "0 0 3px", letterSpacing: "-0.03em",
              }}>Admin Console</h3>
              <p style={{ fontSize: 12, color: "var(--alm-muted)", margin: "0 0 14px" }}>
                Sign in to manage your portfolio
              </p>

              {/* Status pills */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, flexWrap: "wrap" }}>
                <span className="alm-pill" style={{ background: "rgba(34,197,94,0.12)", color: "#16a34a", border: "1px solid rgba(34,197,94,0.25)" }}>
                  <Lock size={10} /> TLS 1.3
                </span>
                {biometricAvailable === true && (
                  <span className="alm-pill" style={{ background: "rgba(99,102,241,0.12)", color: "#6366f1", border: "1px solid rgba(99,102,241,0.25)" }}>
                    <Fingerprint size={10} /> Biometrics
                  </span>
                )}
                <span className="alm-pill" style={{ background: "rgba(245,158,11,0.12)", color: "#d97706", border: "1px solid rgba(245,158,11,0.25)" }}>
                  <Clock size={10} /> Rate limited
                </span>
                {attempts > 0 && (
                  <span className="alm-pill" style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)" }}>
                    <AlertTriangle size={10} /> {MAX_ATTEMPTS - attempts} attempts left
                  </span>
                )}
              </div>
            </div>

            {/* ── MFA banner ── */}
            {mfaRequired && (
              <div style={{
                margin: "0 18px 14px", padding: "9px 14px",
                background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)",
                borderRadius: 10, display: "flex", alignItems: "center", gap: 9,
                fontSize: 12, color: "#3b82f6", fontWeight: 600,
              }}>
                <Shield size={14} /> Two-Factor Authentication Required
              </div>
            )}

            {/* ── Method tabs (only when not in MFA mode) ── */}
            {!mfaRequired && (
              <div style={{
                display: "flex", padding: "3px",
                background: "var(--alm-tab-track)", border: "1px solid var(--alm-border)",
                borderRadius: 10, margin: "0 18px 14px",
              }}>
                <button className={`alm-tab-btn${activeMethod === "password" ? " active" : ""}`} type="button"
                  onClick={() => { setError(""); setActiveMethod("password"); }}>
                  <KeyRound size={13} /> Password
                </button>
                <button className={`alm-tab-btn${activeMethod === "otp" ? " active" : ""}`} type="button"
                  onClick={() => { setError(""); setActiveMethod("otp"); }}>
                  <Mail size={13} /> Email OTP
                </button>
              </div>
            )}

            {/* ── Error / Lockout notice ── */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{
                    margin: "0 18px 12px", padding: "9px 13px",
                    background: "rgba(239,68,68,0.12)", color: "#ef4444",
                    borderRadius: 9, fontSize: 12, fontWeight: 500,
                    display: "flex", alignItems: "center", gap: 7, border: "1px solid rgba(239,68,68,0.2)",
                  }}
                >
                  <AlertTriangle size={13} /> <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Form area ── */}
            <div style={{ padding: "0 18px 20px" }}>

              {/* MFA TOTP */}
              {mfaRequired && (
                <form onSubmit={handleTotpSubmit} noValidate>
                  <label className="alm-label">6-digit Authenticator Code</label>
                  <div className="alm-field" style={{ marginBottom: 14 }}>
                    <Shield size={15} color="var(--alm-muted)" style={{ position: "absolute", left: 12, pointerEvents: "none" }} />
                    <input
                      type="text" maxLength={6} autoFocus
                      value={totpCode}
                      onChange={e => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="000 000"
                      className="alm-input"
                      style={{ textAlign: "center", letterSpacing: "6px", fontWeight: 800, fontSize: 16 }}
                    />
                  </div>
                  <p style={{ fontSize: 11.5, color: "var(--alm-muted)", margin: "0 0 14px", lineHeight: 1.5 }}>
                    Open your Authenticator app and enter the current 6-digit code.
                  </p>
                  <button type="submit" className="alm-btn-primary" disabled={loading || totpCode.length !== 6 || lockoutTimer > 0}>
                    {loading ? <Loader2 size={15} className="spin" /> : <CheckCircle2 size={15} />}
                    {loading ? "Verifying…" : "Verify & Sign in"}
                  </button>
                  <button type="button" onClick={() => { setMfaRequired(false); setTotpCode(""); setError(""); }}
                    style={{ background: "none", border: "none", color: "var(--alm-muted)", cursor: "pointer", fontSize: 12, marginTop: 10, padding: 0, display: "flex", alignItems: "center", gap: 4 }}>
                    ← Back to password
                  </button>
                </form>
              )}

              {/* Password form */}
              {!mfaRequired && activeMethod === "password" && (
                <form onSubmit={handlePasswordSubmit} noValidate>
                  <div style={{ marginBottom: 12 }}>
                    <label className="alm-label">Email address</label>
                    <div className="alm-field">
                      <Mail size={15} color="var(--alm-muted)" style={{ position: "absolute", left: 12, pointerEvents: "none" }} />
                      <input
                        ref={emailInputRef} id="alm-email" type="email" required
                        autoComplete="username" placeholder="sujithreddy1546@gmail.com"
                        value={email} onChange={e => setEmail(e.target.value)}
                        disabled={lockoutTimer > 0} className="alm-input"
                      />
                    </div>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label className="alm-label">Password</label>
                    <div className="alm-field">
                      <Lock size={15} color="var(--alm-muted)" style={{ position: "absolute", left: 12, pointerEvents: "none" }} />
                      <input
                        id="alm-password" type={showPw ? "text" : "password"} required
                        autoComplete="current-password" placeholder="Enter your password"
                        value={password} onChange={e => setPassword(e.target.value)}
                        disabled={lockoutTimer > 0} className="alm-input" style={{ paddingRight: 38 }}
                      />
                      <button type="button" onClick={() => setShowPw(v => !v)} aria-label="Toggle password"
                        style={{ position: "absolute", right: 10, background: "none", border: "none", color: "var(--alm-muted)", cursor: "pointer", padding: 2, display: "flex" }}>
                        {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, fontSize: 12 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--alm-muted)", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        id="alm-remember"
                        checked={rememberDevice}
                        onChange={e => setRememberDevice(e.target.checked)}
                        style={{ accentColor: "var(--alm-btn)" }}
                      />
                      Remember workstation
                    </label>
                    <button type="button" onClick={() => { setError(""); setActiveMethod("otp"); }}
                      style={{ background: "none", border: "none", color: "#3b82f6", cursor: "pointer", fontSize: 12, fontWeight: 600, padding: 0 }}>
                      Forgot password?
                    </button>
                  </div>

                  <button type="submit" className="alm-btn-primary" disabled={loading || lockoutTimer > 0}>
                    {loading ? <Loader2 size={15} className="spin" /> : null}
                    {loading ? "Signing in…" : lockoutTimer > 0 ? `Locked (${lockoutTimer}s)` : "Sign in"}
                    {!loading && lockoutTimer <= 0 && <ArrowRight size={15} />}
                  </button>
                </form>
              )}

              {/* Email OTP form */}
              {!mfaRequired && activeMethod === "otp" && (
                <div>
                  {!emailOtpSent ? (
                    <form onSubmit={handleSendEmailOtp} noValidate>
                      <label className="alm-label">Admin email address</label>
                      <div className="alm-field" style={{ marginBottom: 12 }}>
                        <Mail size={15} color="var(--alm-muted)" style={{ position: "absolute", left: 12, pointerEvents: "none" }} />
                        <input
                          type="email" required autoComplete="email"
                          value={email} onChange={e => setEmail(e.target.value)}
                          className="alm-input"
                        />
                      </div>
                      <p style={{ fontSize: 12, color: "var(--alm-muted)", margin: "0 0 14px", lineHeight: 1.5 }}>
                        A one-time 6-digit code will be sent to your inbox.
                      </p>
                      <button type="submit" className="alm-btn-primary" disabled={loading || lockoutTimer > 0}>
                        {loading ? <Loader2 size={15} className="spin" /> : <Mail size={15} />}
                        {loading ? "Sending…" : "Send OTP Code"}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyEmailOtp} noValidate>
                      <div style={{
                        padding: "10px 14px", borderRadius: 9, marginBottom: 14,
                        background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)",
                        fontSize: 11.5, color: "#16a34a", fontWeight: 600,
                        display: "flex", alignItems: "center", gap: 6,
                      }}>
                        <CheckCircle2 size={13} /> Code sent to {email}
                      </div>
                      <label className="alm-label">6-digit security code</label>
                      <div className="alm-field" style={{ marginBottom: 14 }}>
                        <Shield size={15} color="var(--alm-muted)" style={{ position: "absolute", left: 12, pointerEvents: "none" }} />
                        <input
                          type="text" maxLength={6} autoFocus
                          value={emailOtpCode}
                          onChange={e => setEmailOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          placeholder="000 000"
                          className="alm-input"
                          style={{ textAlign: "center", letterSpacing: "6px", fontWeight: 800, fontSize: 16 }}
                        />
                      </div>
                      <button type="submit" className="alm-btn-primary" disabled={loading || emailOtpCode.length !== 6 || lockoutTimer > 0}>
                        {loading ? <Loader2 size={15} className="spin" /> : <CheckCircle2 size={15} />}
                        {loading ? "Verifying…" : "Verify & Sign in"}
                      </button>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: 12 }}>
                        <button type="button" onClick={() => setEmailOtpSent(false)}
                          style={{ background: "none", border: "none", color: "var(--alm-muted)", cursor: "pointer", padding: 0 }}>
                          ← Back
                        </button>
                        <button type="button" onClick={() => handleSendEmailOtp(null)} disabled={otpTimer > 0 || loading}
                          style={{ background: "none", border: "none", color: otpTimer > 0 ? "var(--alm-muted)" : "#22c55e", fontWeight: 600, cursor: otpTimer > 0 ? "not-allowed" : "pointer", padding: 0 }}>
                          {otpTimer > 0 ? `Resend in ${otpTimer}s` : "Resend code"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Footer */}
              <p style={{ margin: "16px 0 0", fontSize: 11, color: "var(--alm-sub)", textAlign: "center", lineHeight: 1.5 }}>
                Restricted access · Authorized personnel only · All actions are logged
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
