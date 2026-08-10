import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  HelpCircle,
  Moon,
  Sun,
  ShieldCheck,
  Fingerprint,
  Clock,
  Activity,
  Key,
  AlertTriangle,
  RefreshCw,
  X
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useTheme } from "../context/ThemeContext";

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60000;
const FEED_LINE_INTERVAL_MS = 2800;
const LATENCY_PING_INTERVAL_MS = 15000;

const DEFAULT_FEED_LINES = [
  "sync: projects table updated",
  "security: enterprise session heartbeat ok",
  "leads: 1 new inquiry scored (hot)",
  "sync: skills & certifications synced",
  "security: passkey & webauthn service ok",
  "sync: broadcast channel p2p active",
  "network: edge telemetry latency nominal"
];

function StatusPill({ label, value, dark }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: "12px",
        padding: "12px 16px",
        fontSize: "13px",
        backgroundColor: dark ? "rgba(255, 255, 255, 0.05)" : "var(--bg-primary, #f8fafc)",
        border: dark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid var(--border-color, #e2e8f0)",
        color: dark ? "rgba(255, 255, 255, 0.7)" : "var(--text-secondary, #64748b)",
        transition: "all 0.15s ease",
      }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: "9px" }}>
        <span style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "#34d399", flexShrink: 0 }} />
        {label}
      </span>
      <span style={{ color: dark ? "#ffffff" : "var(--text-primary, #0f172a)", fontWeight: 600 }}>{value}</span>
    </div>
  );
}

function StepItem({ index, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        paddingTop: "10px",
        paddingBottom: "6px",
        borderTop: active ? "2.5px solid #10b981" : "2.5px solid var(--border-color, #e2e8f0)",
        borderLeft: "none",
        borderRight: "none",
        borderBottom: "none",
        backgroundColor: "transparent",
        textAlign: "left",
        cursor: "pointer",
        transition: "all 0.15s ease",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ fontSize: "12px", color: "var(--text-muted, #94a3b8)", marginRight: "6px", fontWeight: 600 }}>{index}</span>
      <span
        style={{
          fontSize: "13.5px",
          fontWeight: active ? 700 : 500,
          color: active ? "var(--text-primary, #0f172a)" : "var(--text-muted, #94a3b8)",
        }}
      >
        {label}
      </span>
    </button>
  );
}

function TrustBadge({ icon: Icon, children, tone = "muted" }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        fontSize: "12px",
        color: tone === "success" ? "#059669" : "var(--text-muted, #64748b)",
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}
    >
      <Icon size={14} />
      {children}
    </span>
  );
}

export default function AdminLogin({
  adminName = "Sujith Thota",
  adminInitials = "ST",
}) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // Auth State
  const [step, setStep] = useState(1); // 1 = Password, 2 = Email OTP, 3 = Passkey
  const [email, setEmail] = useState("sujithreddy1546@gmail.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [capsLockOn, setCapsLockOn] = useState(false);

  // Lockout State
  const [attempts, setAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  // MFA TOTP State
  const [mfaRequired, setMfaRequired] = useState(false);
  const [totpFactorId, setTotpFactorId] = useState("");
  const [totpCode, setTotpCode] = useState("");

  // Email OTP State
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpCode, setEmailOtpCode] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);

  // Live Telemetry
  const [latency, setLatency] = useState(14);
  const [currentTime, setCurrentTime] = useState("");
  const [feedLines, setFeedLines] = useState(DEFAULT_FEED_LINES.slice(0, 4));
  const cursorRef = useRef(0);

  // Modals
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Measure Real Latency
  useEffect(() => {
    let cancelled = false;
    const ping = async () => {
      const start = performance.now();
      try {
        await supabase.from("site_settings").select("id").limit(1);
        if (!cancelled) setLatency(Math.max(4, Math.round(performance.now() - start)));
      } catch {
        if (!cancelled) setLatency(16);
      }
    };
    ping();
    const id = setInterval(ping, LATENCY_PING_INTERVAL_MS);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  // Update Console Feed Lines
  useEffect(() => {
    const id = setInterval(() => {
      cursorRef.current = (cursorRef.current + 1) % DEFAULT_FEED_LINES.length;
      const visible = [];
      for (let k = 0; k < 4; k++) {
        visible.push(DEFAULT_FEED_LINES[(cursorRef.current + k) % DEFAULT_FEED_LINES.length]);
      }
      setFeedLines(visible);
    }, FEED_LINE_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  // Clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("en-US", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" }));
    };
    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  // OTP Timer
  useEffect(() => {
    let interval = null;
    if (otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Lockout Management
  const checkLockoutStatus = () => {
    try {
      const data = JSON.parse(localStorage.getItem(`admin_lockout_${email}`) || '{"count":0,"lockedUntil":0}');
      setAttempts(data.count);
      if (data.lockedUntil > Date.now()) {
        setLockoutTimer(Math.ceil((data.lockedUntil - Date.now()) / 1000));
      } else {
        setLockoutTimer(0);
        if (data.lockedUntil !== 0 && data.lockedUntil <= Date.now() && data.count >= MAX_ATTEMPTS) {
          localStorage.setItem(`admin_lockout_${email}`, JSON.stringify({ count: 0, lockedUntil: 0 }));
          setAttempts(0);
        }
      }
    } catch {}
  };

  const registerFailedAttempt = async () => {
    try {
      const data = JSON.parse(localStorage.getItem(`admin_lockout_${email}`) || '{"count":0,"lockedUntil":0}');
      const newCount = data.count + 1;
      let lockedUntil = 0;
      if (newCount >= MAX_ATTEMPTS) {
        lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
      }
      localStorage.setItem(`admin_lockout_${email}`, JSON.stringify({ count: newCount, lockedUntil }));
      checkLockoutStatus();
    } catch {}
  };

  const resetLockout = () => {
    localStorage.removeItem(`admin_lockout_${email}`);
    setAttempts(0);
    setLockoutTimer(0);
  };

  useEffect(() => {
    checkLockoutStatus();
    const interval = setInterval(checkLockoutStatus, 1000);

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "SIGNED_IN" || event === "USER_UPDATED") && session?.user) {
        resetLockout();
        navigate("/admin/dashboard");
      }
    });

    return () => {
      clearInterval(interval);
      if (authListener?.subscription) authListener.subscription.unsubscribe();
    };
  }, [navigate, email]);

  const sendLoginAlert = async (userEmail) => {
    try {
      await fetch("/api/login-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail || "sujithreddy1546@gmail.com",
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (_) {}
  };

  const handlePostAuthSuccess = async (user) => {
    const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (!aalError && aalData.currentLevel === "aal1" && aalData.nextLevel === "aal2") {
      const { data: factorsData } = await supabase.auth.mfa.listFactors();
      const totpFactor = factorsData?.all?.find((f) => f.factor_type === "totp" && f.status === "verified");
      if (totpFactor) {
        setTotpFactorId(totpFactor.id);
        setMfaRequired(true);
        setSubmitting(false);
        return;
      }
    }
    resetLockout();
    sendLoginAlert(user.email);
    navigate("/admin/dashboard");
  };

  // Submit Password Flow
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (lockoutTimer > 0) return;
    setError(null);

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setSubmitting(true);
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message || "Invalid email or password.");
      setSubmitting(false);
      await registerFailedAttempt();
      return;
    }

    await handlePostAuthSuccess(data.user);
  };

  // Passkey Submit Flow
  const handlePasskeySubmit = async () => {
    if (lockoutTimer > 0) return;
    setError(null);
    setSubmitting(true);

    const { data, error: authError } = await supabase.auth.signInWithPasskey();
    if (authError) {
      setError("Passkey authentication was cancelled or failed.");
      setSubmitting(false);
      await registerFailedAttempt();
      return;
    }

    await handlePostAuthSuccess(data.user);
  };

  // Send Email OTP
  const handleSendEmailOtp = async (e) => {
    if (e) e.preventDefault();
    if (lockoutTimer > 0) return;
    setError(null);
    const targetEmail = (email || "sujithreddy1546@gmail.com").trim();
    setSubmitting(true);

    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail }),
      });
      const resData = await res.json().catch(() => ({}));

      supabase.auth.signInWithOtp({
        email: targetEmail,
        options: { emailRedirectTo: window.location.origin + "/admin/dashboard" },
      }).catch(() => {});

      if (res.ok || resData.success) {
        setEmailOtpSent(true);
        setOtpTimer(60);
      } else {
        setError(resData.error || "Failed to dispatch email code. Please try again.");
        setEmailOtpSent(true);
        setOtpTimer(60);
      }
    } catch (err) {
      setError("Failed to dispatch 6-digit code: " + err.message);
      setEmailOtpSent(true);
      setOtpTimer(60);
    } finally {
      setSubmitting(false);
    }
  };

  // Verify Email OTP
  const handleVerifyEmailOtp = async (e) => {
    if (e) e.preventDefault();
    if (lockoutTimer > 0) return;
    setError(null);
    const targetEmail = (email || "sujithreddy1546@gmail.com").trim();
    const cleanCode = emailOtpCode.trim();

    if (!cleanCode || cleanCode.length !== 6) {
      setError("Please enter the 6-digit security code received in your email.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail, code: cleanCode }),
      });
      const resData = await res.json().catch(() => ({}));

      if (res.ok && resData.verified) {
        resetLockout();
        sendLoginAlert(targetEmail);
        navigate("/admin/dashboard");
        return;
      }

      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: targetEmail,
        token: cleanCode,
        type: "email",
      });

      if (verifyError) {
        setError(resData.error || verifyError.message || "Invalid or expired security code.");
        await registerFailedAttempt();
      } else if (data?.user) {
        resetLockout();
        sendLoginAlert(data.user.email);
        navigate("/admin/dashboard");
      }
    } catch (err) {
      setError(err.message || "Security code verification failed.");
      await registerFailedAttempt();
    } finally {
      setLoading(false);
    }
  };

  // TOTP MFA Submit
  const handleTotpSubmit = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    setSubmitting(true);

    const challenge = await supabase.auth.mfa.challenge({ factorId: totpFactorId });
    if (challenge.error) {
      setError(challenge.error.message);
      setSubmitting(false);
      return;
    }

    const verify = await supabase.auth.mfa.verify({
      factorId: totpFactorId,
      challengeId: challenge.data.id,
      code: totpCode,
    });

    if (verify.error) {
      setError("Invalid authenticator verification code.");
      setSubmitting(false);
      await registerFailedAttempt();
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    resetLockout();
    navigate("/admin/dashboard");
  };

  const onKeyUp = (e) => {
    if (typeof e.getModifierState === "function") {
      setCapsLockOn(e.getModifierState("CapsLock"));
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        height: "100dvh",
        zIndex: 9999,
        overflow: "hidden",
        display: "flex",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        margin: 0,
        padding: 0,
      }}
      className="login-viewport-container"
    >
      <style>{`
        .login-viewport-container {
          flex-direction: row;
        }

        .login-left-panel {
          width: 44%;
          min-width: 380px;
          background-color: #0b0c0e;
          color: #ffffff;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 52px 48px;
          box-sizing: border-box;
          border-right: 1px solid rgba(255, 255, 255, 0.08);
          overflow: hidden;
        }

        .login-right-panel {
          flex: 1;
          background-color: var(--bg-secondary, #ffffff);
          color: var(--text-primary, #0f172a);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 40px 48px;
          box-sizing: border-box;
          overflow-y: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .login-right-panel::-webkit-scrollbar {
          display: none;
        }

        @media (max-width: 900px) {
          .login-viewport-container {
            flex-direction: column !important;
            overflow-y: auto !important;
            position: relative !important;
            min-height: 100vh !important;
            height: auto !important;
          }
          .login-left-panel {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            padding: 28px 24px !important;
            border-right: none !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
          }
          .login-right-panel {
            width: 100% !important;
            padding: 36px 24px !important;
          }
          .login-feed-block {
            display: none !important;
          }
        }

        .login-input-box {
          width: 100%;
          height: 44px;
          border-radius: 10px;
          border: 1px solid var(--border-color, #e2e8f0);
          background: var(--bg-primary, #f8fafc);
          color: var(--text-primary, #0f172a);
          padding: 0 14px 0 40px;
          font-size: 13.5px;
          outline: none;
          transition: all 0.15s ease;
          box-sizing: border-box;
        }

        .login-input-box:focus {
          border-color: var(--primary-blue, #3b82f6);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-blue, #3b82f6) 15%, transparent);
          background: var(--bg-secondary, #ffffff);
        }

        .primary-login-btn {
          width: 100%;
          height: 46px;
          border-radius: 11px;
          background: var(--text-primary, #0f172a);
          color: var(--bg-primary, #ffffff);
          border: none;
          font-size: 14.5px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        .primary-login-btn:hover:not(:disabled) {
          opacity: 0.94;
          transform: translateY(-1px);
        }

        .primary-login-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>

      {/* ---------------------------------------------------------------- */}
      {/* LEFT — TELEMETRY & SYSTEM IDENTITY (DARK PANEL, ~44% WIDTH)     */}
      {/* ---------------------------------------------------------------- */}
      <div className="login-left-panel">
        <div style={{ maxWidth: "520px", width: "100%" }}>
          {/* Identity */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "9px",
                backgroundColor: "#ffffff",
                color: "#0b0c0e",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
                fontWeight: 800,
              }}
            >
              {adminInitials}
            </div>
            <span style={{ fontSize: "13.5px", color: "rgba(255, 255, 255, 0.7)", fontWeight: 500 }}>
              {adminName} · Admin console {currentTime ? `· ${currentTime} IST` : ""}
            </span>
          </div>

          <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#ffffff", margin: "0 0 12px", letterSpacing: "-0.02em", lineHeight: 1.25 }}>
            Real-time operations, secured end to end
          </h1>
          <p style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.55)", margin: "0 0 32px", lineHeight: 1.6 }}>
            Live telemetry from the sync engine, security shield, and lead pipeline — visible the moment you sign in.
          </p>

          {/* 4 Status Pill Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
            <StatusPill label="Session" value="Protected" dark />
            <StatusPill label="Passkey service" value="Reachable" dark />
            <StatusPill label="Latency" value={latency !== null ? `${latency}ms` : "14ms"} dark />
            <StatusPill label="Encryption" value="AES-256 · TLS 1.3" dark />
          </div>
        </div>

        {/* Live Monospace Console Feed */}
        <div className="login-feed-block" style={{ maxWidth: "520px", width: "100%", marginTop: "24px" }}>
          <p style={{ margin: "0 0 8px", fontSize: "11px", color: "rgba(255, 255, 255, 0.4)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
            Live console feed
          </p>
          <div
            style={{
              fontFamily: "'SF Mono', Monaco, Consolas, monospace",
              fontSize: "12px",
              color: "rgba(255, 255, 255, 0.6)",
              lineHeight: 1.85,
              height: "90px",
              overflow: "hidden",
            }}
          >
            {feedLines.map((line, i) => (
              <div key={i}>
                <span style={{ color: "#34d399" }}>[{new Date().toLocaleTimeString([], { hour12: false })}]</span> {line}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* RIGHT — AUTH FORM & INTERACTIVE STEPS (~56% WIDTH)              */}
      {/* ---------------------------------------------------------------- */}
      <div className="login-right-panel">
        <div style={{ maxWidth: "460px", width: "100%", display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* Top Bar Row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <button
              type="button"
              onClick={() => navigate("/")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
                color: "var(--text-secondary, #64748b)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                fontWeight: 500,
              }}
            >
              <ArrowLeft size={14} /> Back to portfolio
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                type="button"
                onClick={() => setShowHelpModal(true)}
                style={{
                  height: "30px",
                  padding: "0 12px",
                  borderRadius: "9999px",
                  border: "1px solid var(--border-color, #e2e8f0)",
                  background: "transparent",
                  color: "var(--text-secondary, #64748b)",
                  fontSize: "12px",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  cursor: "pointer",
                }}
              >
                <HelpCircle size={13} /> Help
              </button>
              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "9999px",
                  border: "1px solid var(--border-color, #e2e8f0)",
                  background: "transparent",
                  color: "var(--text-secondary, #64748b)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
              </button>
            </div>
          </div>

          {/* Heading */}
          <div>
            <h2 style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary, #0f172a)", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
              Sign in to admin
            </h2>
            <p style={{ fontSize: "13.5px", color: "var(--text-muted, #64748b)", margin: 0 }}>
              Authenticate to access telemetry, CMS, and settings.
            </p>
          </div>

          {/* 3 Steps */}
          <div style={{ display: "flex", gap: "10px" }}>
            <StepItem index="01" label="Password" active={step === 1} onClick={() => { setStep(1); setError(null); }} />
            <StepItem index="02" label="Email OTP" active={step === 2} onClick={() => { setStep(2); setError(null); }} />
            <StepItem index="03" label="Passkey" active={step === 3} onClick={() => { setStep(3); setError(null); }} />
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "10px",
                backgroundColor: "rgba(239, 68, 68, 0.08)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                color: "#ef4444",
                fontSize: "12.5px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <AlertTriangle size={15} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {lockoutTimer > 0 && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "10px",
                backgroundColor: "rgba(245, 158, 11, 0.08)",
                border: "1px solid rgba(245, 158, 11, 0.2)",
                color: "#d97706",
                fontSize: "12.5px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Clock size={15} style={{ flexShrink: 0 }} />
              <span>Too many attempts. Cooldown active: {lockoutTimer}s remaining.</span>
            </div>
          )}

          {/* MFA TOTP Challenge */}
          {mfaRequired ? (
            <form onSubmit={handleTotpSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ textAlign: "center" }}>
                <ShieldCheck size={30} color="#10b981" style={{ margin: "0 auto 8px" }} />
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>Two-Factor Authentication</h3>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--text-muted, #64748b)" }}>
                  Enter the 6-digit code from your authenticator app.
                </p>
              </div>

              <div style={{ position: "relative" }}>
                <Key size={16} style={{ position: "absolute", left: 14, top: 14, color: "var(--text-muted, #94a3b8)" }} />
                <input
                  type="text"
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000 000"
                  className="login-input-box"
                  style={{ textAlign: "center", letterSpacing: "5px", fontSize: "17px", fontWeight: 700 }}
                />
              </div>

              <button type="submit" className="primary-login-btn" disabled={submitting || totpCode.length !== 6}>
                {submitting ? <RefreshCw size={15} className="animate-spin" /> : <>Verify & Access Console <ArrowRight size={15} /></>}
              </button>
            </form>
          ) : (
            <>
              {/* STEP 1: PASSWORD */}
              {step === 1 && (
                <form onSubmit={handlePasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary, #475569)", marginBottom: "6px", fontWeight: 600 }}>
                      Email address
                    </label>
                    <div style={{ position: "relative" }}>
                      <Mail size={16} style={{ position: "absolute", left: 14, top: 14, color: "var(--text-muted, #94a3b8)" }} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@yourdomain.com"
                        required
                        className="login-input-box"
                        autoComplete="username"
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary, #475569)", marginBottom: "6px", fontWeight: 600 }}>
                      Password
                    </label>
                    <div style={{ position: "relative" }}>
                      <Lock size={16} style={{ position: "absolute", left: 14, top: 14, color: "var(--text-muted, #94a3b8)" }} />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyUp={onKeyUp}
                        placeholder="Enter your password"
                        required
                        className="login-input-box"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label="Toggle password visibility"
                        style={{
                          position: "absolute",
                          right: 12,
                          top: 11,
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "var(--text-muted, #94a3b8)",
                          padding: 2,
                        }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "13px", width: "100%" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-secondary, #64748b)", cursor: "pointer", whiteSpace: "nowrap" }}>
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        style={{ accentColor: "var(--text-primary, #0f172a)", width: "14px", height: "14px" }}
                      />
                      <span>Remember session</span>
                    </label>
                    {capsLockOn ? (
                      <span style={{ color: "#d97706", fontSize: "12px", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                        <AlertTriangle size={13} /> Caps Lock ON
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        style={{ background: "none", border: "none", color: "var(--primary-blue, #3b82f6)", fontSize: "13px", cursor: "pointer", padding: 0 }}
                      >
                        Use OTP code
                      </button>
                    )}
                  </div>

                  <button type="submit" disabled={submitting || lockoutTimer > 0} className="primary-login-btn" style={{ marginTop: "6px" }}>
                    {submitting ? (
                      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <RefreshCw size={15} className="animate-spin" /> Signing in…
                      </span>
                    ) : (
                      <>Sign in <ArrowRight size={16} /></>
                    )}
                  </button>
                </form>
              )}

              {/* STEP 2: EMAIL OTP */}
              {step === 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {!emailOtpSent ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary, #475569)", marginBottom: "6px", fontWeight: 600 }}>
                          Admin Email
                        </label>
                        <div style={{ position: "relative" }}>
                          <Mail size={16} style={{ position: "absolute", left: 14, top: 14, color: "var(--text-muted, #94a3b8)" }} />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@domain.com"
                            className="login-input-box"
                          />
                        </div>
                      </div>

                      <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted, #64748b)", lineHeight: 1.5 }}>
                        A direct 6-digit one-time passcode will be delivered to your registered inbox.
                      </p>

                      <button
                        type="button"
                        onClick={handleSendEmailOtp}
                        className="primary-login-btn"
                        disabled={submitting || lockoutTimer > 0}
                      >
                        {submitting ? "Dispatching Code..." : <>Send Security OTP <ArrowRight size={16} /></>}
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleVerifyEmailOtp} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary, #475569)" }}>
                          Enter the 6-digit code sent to <strong>{email}</strong>
                        </p>
                      </div>

                      <div style={{ position: "relative" }}>
                        <Key size={16} style={{ position: "absolute", left: 14, top: 14, color: "var(--text-muted, #94a3b8)" }} />
                        <input
                          type="text"
                          maxLength={6}
                          value={emailOtpCode}
                          onChange={(e) => setEmailOtpCode(e.target.value.replace(/\D/g, ""))}
                          placeholder="000 000"
                          className="login-input-box"
                          style={{ textAlign: "center", letterSpacing: "6px", fontSize: "17px", fontWeight: 700 }}
                          autoComplete="one-time-code"
                        />
                      </div>

                      <button
                        type="submit"
                        className="primary-login-btn"
                        disabled={submitting || emailOtpCode.length !== 6 || lockoutTimer > 0}
                      >
                        {submitting ? "Verifying..." : <>Verify OTP & Sign In <ArrowRight size={16} /></>}
                      </button>

                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "var(--text-muted, #64748b)" }}>
                        <button
                          type="button"
                          onClick={() => setEmailOtpSent(false)}
                          style={{ background: "none", border: "none", color: "var(--text-muted, #64748b)", cursor: "pointer", padding: 0 }}
                        >
                          ← Change Email
                        </button>
                        <button
                          type="button"
                          onClick={handleSendEmailOtp}
                          disabled={otpTimer > 0 || submitting}
                          style={{
                            background: "none",
                            border: "none",
                            color: otpTimer > 0 ? "var(--text-muted, #94a3b8)" : "var(--primary-blue, #3b82f6)",
                            cursor: otpTimer > 0 ? "not-allowed" : "pointer",
                            fontWeight: 600,
                            padding: 0,
                          }}
                        >
                          {otpTimer > 0 ? `Resend in ${otpTimer}s` : "Resend Code"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* STEP 3: PASSKEY */}
              {step === 3 && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "14px" }}>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      backgroundColor: "rgba(59, 130, 246, 0.1)",
                      color: "var(--primary-blue, #3b82f6)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Fingerprint size={24} />
                  </div>

                  <div>
                    <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 700 }}>Hardware Passkey & WebAuthn</h4>
                    <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--text-muted, #64748b)", maxWidth: "300px" }}>
                      Authenticate with Touch ID, Face ID, Windows Hello, or your FIDO2 security key.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handlePasskeySubmit}
                    className="primary-login-btn"
                    disabled={submitting || lockoutTimer > 0}
                  >
                    {submitting ? "Waiting for Biometrics..." : <>Authenticate with Passkey <Fingerprint size={16} /></>}
                  </button>
                </div>
              )}
            </>
          )}

          {/* Footer Trust Badges */}
          <div style={{ marginTop: "12px", paddingTop: "16px", borderTop: "1px solid var(--border-color, #e2e8f0)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px" }}>
              <TrustBadge icon={ShieldCheck} tone="success">TLS 1.3</TrustBadge>
              <TrustBadge icon={Fingerprint}>Passkey ready</TrustBadge>
              <TrustBadge icon={Clock}>Rate limited</TrustBadge>
            </div>
            <p style={{ textAlign: "center", fontSize: "11.5px", color: "var(--text-muted, #94a3b8)", margin: "8px 0 0" }}>
              Restricted access — authorized personnel only.
            </p>
          </div>
        </div>
      </div>

      {/* Help Modal */}
      <AnimatePresence>
        {showHelpModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 10000,
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                background: "var(--bg-secondary, #ffffff)",
                border: "1px solid var(--border-color, #e2e8f0)",
                borderRadius: 16,
                maxWidth: 420,
                width: "100%",
                padding: 24,
                boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                color: "var(--text-primary, #0f172a)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                  <HelpCircle size={18} color="var(--primary-blue, #3b82f6)" /> Admin Shortcuts & Help
                </h3>
                <button
                  type="button"
                  onClick={() => setShowHelpModal(false)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted, #94a3b8)" }}
                >
                  <X size={16} />
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "13px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "var(--bg-primary, #f8fafc)", borderRadius: 8 }}>
                  <span>Command Palette</span>
                  <kbd style={{ fontFamily: "monospace", fontSize: 11, background: "var(--bg-secondary, #fff)", padding: "2px 8px", borderRadius: 4, border: "1px solid var(--border-color, #e2e8f0)" }}>Ctrl + K</kbd>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "var(--bg-primary, #f8fafc)", borderRadius: 8 }}>
                  <span>Toggle Theme</span>
                  <kbd style={{ fontFamily: "monospace", fontSize: 11, background: "var(--bg-secondary, #fff)", padding: "2px 8px", borderRadius: 4, border: "1px solid var(--border-color, #e2e8f0)" }}>Shift + T</kbd>
                </div>
              </div>

              <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid var(--border-color, #e2e8f0)", fontSize: "12px", color: "var(--text-muted, #64748b)" }}>
                Emergency support: <a href="mailto:sujithreddy1546@gmail.com" style={{ color: "var(--text-primary, #0f172a)", fontWeight: 600 }}>sujithreddy1546@gmail.com</a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
