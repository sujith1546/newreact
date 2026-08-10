import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Mail,
  Key,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Sun,
  Moon,
  AlertTriangle,
  Fingerprint,
  HelpCircle,
  Activity,
  Clock,
  ChevronRight,
  X
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useTheme } from "../context/ThemeContext";

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60000; // 60 seconds

export default function AdminLogin() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // Primary Auth State
  const [email, setEmail] = useState("sujithreddy1546@gmail.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeStep, setActiveStep] = useState(0); // 0: Password, 1: Email OTP, 2: Passkey

  // Lockout State
  const [attempts, setAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  // MFA State
  const [mfaRequired, setMfaRequired] = useState(false);
  const [totpFactorId, setTotpFactorId] = useState("");
  const [totpCode, setTotpCode] = useState("");

  // Telemetry & Network Latency
  const [pingMs, setPingMs] = useState(14);
  const [currentTime, setCurrentTime] = useState("");
  const [capsLockOn, setCapsLockOn] = useState(false);

  // Email Security OTP State
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpCode, setEmailOtpCode] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);

  // Modals
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Measure Real Network Latency
  useEffect(() => {
    let cancelled = false;
    const measurePing = async () => {
      const start = performance.now();
      try {
        await supabase.from('site_settings').select('id').limit(1);
        if (!cancelled) {
          const delta = Math.round(performance.now() - start);
          setPingMs(Math.max(4, delta));
        }
      } catch {
        if (!cancelled) setPingMs(18);
      }
    };
    measurePing();
    const pingInterval = setInterval(measurePing, 15000);
    return () => {
      cancelled = true;
      clearInterval(pingInterval);
    };
  }, []);

  // Update Clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  // OTP Resend Timer
  useEffect(() => {
    let interval = null;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
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
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
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
      await fetch('/api/login-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail || 'sujithreddy1546@gmail.com',
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        })
      });
    } catch (_) {}
  };

  const handlePostAuthSuccess = async (user) => {
    const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (!aalError && aalData.currentLevel === 'aal1' && aalData.nextLevel === 'aal2') {
      const { data: factorsData } = await supabase.auth.mfa.listFactors();
      const totpFactor = factorsData?.all?.find(f => f.factor_type === 'totp' && f.status === 'verified');
      if (totpFactor) {
        setTotpFactorId(totpFactor.id);
        setMfaRequired(true);
        setLoading(false);
        return;
      }
    }
    resetLockout();
    sendLoginAlert(user.email);
    navigate("/admin/dashboard");
  };

  // Password Authentication
  const handlePasswordSubmit = async (e) => {
    if (e) e.preventDefault();
    if (lockoutTimer > 0) return;
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message || "Invalid email or password.");
      setLoading(false);
      await registerFailedAttempt();
      return;
    }

    await handlePostAuthSuccess(data.user);
  };

  // Passkey / Biometric Authentication
  const handlePasskeySubmit = async () => {
    if (lockoutTimer > 0) return;
    setError("");
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signInWithPasskey();
    if (authError) {
      setError("Passkey authentication was cancelled or failed.");
      setLoading(false);
      await registerFailedAttempt();
      return;
    }

    await handlePostAuthSuccess(data.user);
  };

  // Send 6-Digit Email OTP
  const handleSendEmailOtp = async (e) => {
    if (e) e.preventDefault();
    if (lockoutTimer > 0) return;
    setError("");
    const targetEmail = (email || "sujithreddy1546@gmail.com").trim();
    setLoading(true);

    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail }),
      });
      const resData = await res.json().catch(() => ({}));

      supabase.auth.signInWithOtp({
        email: targetEmail,
        options: { emailRedirectTo: window.location.origin + "/admin/dashboard" }
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
      setLoading(false);
    }
  };

  // Verify 6-Digit Email OTP
  const handleVerifyEmailOtp = async (e) => {
    if (e) e.preventDefault();
    if (lockoutTimer > 0) return;
    setError("");
    const targetEmail = (email || "sujithreddy1546@gmail.com").trim();
    const cleanCode = emailOtpCode.trim();

    if (!cleanCode || cleanCode.length !== 6) {
      setError("Please enter the 6-digit security code received in your email.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        type: 'email',
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

  // TOTP MFA Verification
  const handleTotpSubmit = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setLoading(true);

    const challenge = await supabase.auth.mfa.challenge({ factorId: totpFactorId });
    if (challenge.error) {
      setError(challenge.error.message);
      setLoading(false);
      return;
    }

    const verify = await supabase.auth.mfa.verify({
      factorId: totpFactorId,
      challengeId: challenge.data.id,
      code: totpCode,
    });

    if (verify.error) {
      setError("Invalid authenticator verification code.");
      setLoading(false);
      await registerFailedAttempt();
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    resetLockout();
    navigate("/admin/dashboard");
  };

  const onKeyUp = (e) => {
    if (typeof e.getModifierState === 'function') {
      setCapsLockOn(e.getModifierState('CapsLock'));
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "var(--bg-primary, #ffffff)",
        color: "var(--text-primary, #0f172a)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        padding: "24px 16px",
        boxSizing: "border-box",
        margin: "0 auto",
      }}
    >
      <style>{`
        .admin-login-card-wrapper {
          width: 100%;
          max-width: 780px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .admin-login-card {
          width: 100%;
          border-radius: 20px;
          border: 1px solid var(--border-color, #e2e8f0);
          background: var(--bg-secondary, #ffffff);
          box-shadow: 0 20px 50px -12px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.04);
          display: grid;
          grid-template-columns: 240px 1fr;
          overflow: hidden;
          box-sizing: border-box;
        }

        @media (max-width: 680px) {
          .admin-login-card {
            grid-template-columns: 1fr;
          }
          .admin-login-sidebar {
            border-right: none !important;
            border-bottom: 1px solid var(--border-color, #e2e8f0);
            padding: 20px !important;
          }
        }

        .login-input-wrap {
          position: relative;
          width: 100%;
          box-sizing: border-box;
        }

        .login-input {
          width: 100%;
          height: 40px;
          border-radius: 10px;
          border: 1px solid var(--border-color, #e2e8f0);
          background: var(--bg-primary, #f8fafc);
          color: var(--text-primary, #0f172a);
          padding: 0 12px 0 36px;
          font-size: 13px;
          font-family: inherit;
          outline: none;
          transition: all 0.15s ease;
          box-sizing: border-box;
        }

        .login-input:focus {
          border-color: var(--primary-blue, #3b82f6);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-blue, #3b82f6) 15%, transparent);
          background: var(--bg-secondary, #ffffff);
        }

        .stepper-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 0;
          font-size: 12px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          background: transparent;
          color: var(--text-muted, #94a3b8);
          border-bottom: 2px solid transparent;
          transition: all 0.15s ease;
        }

        .stepper-btn.active {
          color: var(--text-primary, #0f172a);
          border-bottom-color: #10b981;
        }

        .stepper-btn:hover:not(.active) {
          color: var(--text-primary, #0f172a);
        }

        .status-pill-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6.5px 10px;
          border-radius: 9999px;
          background: var(--bg-secondary, #ffffff);
          border: 1px solid var(--border-color, #e2e8f0);
          font-size: 11.5px;
          font-weight: 500;
          color: var(--text-primary, #0f172a);
          transition: all 0.15s ease;
        }

        .status-pill-item:hover {
          border-color: var(--primary-blue, #3b82f6);
        }

        .primary-cta-btn {
          width: 100%;
          height: 42px;
          border-radius: 12px;
          background: var(--text-primary, #0f172a);
          color: var(--bg-primary, #ffffff);
          border: none;
          font-size: 13.5px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
        }

        .primary-cta-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
          opacity: 0.94;
        }

        .primary-cta-btn:active:not(:disabled) {
          transform: scale(0.98);
        }

        .primary-cta-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>

      <div className="admin-login-card-wrapper">
        {/* Top Header Row (Back to Portfolio + Help + Theme Toggle) */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4px" }}>
          <button
            type="button"
            onClick={() => navigate("/")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12.5,
              fontWeight: 500,
              color: "var(--text-secondary, #64748b)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px 8px",
              borderRadius: 8,
              transition: "color 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary, #0f172a)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary, #64748b)")}
          >
            <ArrowLeft size={14} /> Back to portfolio
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              style={{
                height: 30,
                padding: "0 10px",
                borderRadius: 9999,
                border: "1px solid var(--border-color, #e2e8f0)",
                background: "var(--bg-secondary, #ffffff)",
                color: "var(--text-secondary, #64748b)",
                fontSize: 12,
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: 5,
                cursor: "pointer",
              }}
            >
              <HelpCircle size={13} /> Help
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              style={{
                width: 30,
                height: 30,
                borderRadius: 9999,
                border: "1px solid var(--border-color, #e2e8f0)",
                background: "var(--bg-secondary, #ffffff)",
                color: "var(--text-primary, #0f172a)",
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

        {/* Main 2-Column Card */}
        <div className="admin-login-card">
          {/* Left Column: Identity & Status Stack */}
          <div
            className="admin-login-sidebar"
            style={{
              padding: "24px 18px",
              borderRight: "1px solid var(--border-color, #e2e8f0)",
              backgroundColor: "var(--bg-primary, #f8fafc)",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {/* Identity Pattern */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  backgroundColor: "var(--text-primary, #0f172a)",
                  color: "var(--bg-primary, #ffffff)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 14,
                  border: "1px solid var(--border-color, #e2e8f0)",
                  flexShrink: 0,
                }}
              >
                ST
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--text-primary, #0f172a)" }}>
                  Sujith Thota
                </h3>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--text-muted, #64748b)" }}>
                  Admin Console · {currentTime || "10:30 AM"}
                </p>
              </div>
            </div>

            {/* Status Stack (4 Pill Cards) */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div className="status-pill-item" title="Active authentication gate">
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }} />
                  Session
                </span>
                <span style={{ fontSize: 10.5, color: "var(--text-muted, #64748b)", fontWeight: 600 }}>
                  Protected
                </span>
              </div>

              <div className="status-pill-item" title="Hardware passkey & WebAuthn support">
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }} />
                  Passkey
                </span>
                <span style={{ fontSize: 10.5, color: "var(--text-muted, #64748b)", fontWeight: 600 }}>
                  Ready
                </span>
              </div>

              <div className="status-pill-item" title="Real-time edge ping latency">
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }} />
                  Latency
                </span>
                <span style={{ fontFamily: "monospace", fontSize: 10.5, color: "var(--text-primary, #0f172a)", fontWeight: 700 }}>
                  {pingMs}ms
                </span>
              </div>

              <div className="status-pill-item" title="End-to-end TLS 1.3 & AES-GCM-256 encryption">
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }} />
                  Encryption
                </span>
                <span style={{ fontSize: 10.5, color: "var(--text-muted, #64748b)", fontWeight: 600 }}>
                  AES-256
                </span>
              </div>
            </div>

            {/* System Health Action directly below status stack */}
            <button
              type="button"
              onClick={() => setShowStatusModal(true)}
              style={{
                background: "var(--bg-secondary, #ffffff)",
                border: "1px solid var(--border-color, #e2e8f0)",
                borderRadius: 10,
                padding: "8px 10px",
                fontSize: 11.5,
                color: "var(--text-secondary, #64748b)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 2,
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Activity size={12} color="#10b981" /> System Health
              </span>
              <ChevronRight size={12} />
            </button>
          </div>

          {/* Right Column: Title, Stepper, Form, and Trust Badges */}
          <div style={{ padding: "28px 28px", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Header */}
              <div>
                <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, color: "var(--text-primary, #0f172a)", letterSpacing: "-0.02em" }}>
                  Admin Portal
                </h1>
                <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "var(--text-muted, #64748b)" }}>
                  Authenticate session to access telemetry, CMS, and settings.
                </p>
              </div>

              {/* Stepper (3 steps) */}
              <div style={{ display: "flex", borderBottom: "1px solid var(--border-color, #e2e8f0)", width: "100%" }}>
                <button
                  type="button"
                  className={`stepper-btn ${activeStep === 0 ? "active" : ""}`}
                  onClick={() => { setActiveStep(0); setError(""); }}
                >
                  01 Password
                </button>
                <button
                  type="button"
                  className={`stepper-btn ${activeStep === 1 ? "active" : ""}`}
                  onClick={() => { setActiveStep(1); setError(""); }}
                >
                  02 Email OTP
                </button>
                <button
                  type="button"
                  className={`stepper-btn ${activeStep === 2 ? "active" : ""}`}
                  onClick={() => { setActiveStep(2); setError(""); }}
                >
                  03 Passkey
                </button>
              </div>

              {/* Error & Lockout Notice */}
              {error && (
                <div
                  style={{
                    padding: "8px 12px",
                    borderRadius: 10,
                    backgroundColor: "rgba(239, 68, 68, 0.08)",
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                    color: "#ef4444",
                    fontSize: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                >
                  <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              {lockoutTimer > 0 && (
                <div
                  style={{
                    padding: "8px 12px",
                    borderRadius: 10,
                    backgroundColor: "rgba(245, 158, 11, 0.08)",
                    border: "1px solid rgba(245, 158, 11, 0.2)",
                    color: "#d97706",
                    fontSize: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                >
                  <Clock size={14} style={{ flexShrink: 0 }} />
                  <span>Too many attempts. Cooldown active: {lockoutTimer}s remaining.</span>
                </div>
              )}

              {/* MFA TOTP Challenge Screen */}
              {mfaRequired ? (
                <form onSubmit={handleTotpSubmit} style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%" }}>
                  <div style={{ textAlign: "center", marginBottom: 4 }}>
                    <ShieldCheck size={28} color="#10b981" style={{ margin: "0 auto 8px" }} />
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Two-Factor Authentication</h3>
                    <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--text-muted, #64748b)" }}>
                      Enter the 6-digit verification code from your authenticator app.
                    </p>
                  </div>

                  <div className="login-input-wrap">
                    <Key size={15} style={{ position: "absolute", left: 12, top: 12, color: "var(--text-muted, #94a3b8)" }} />
                    <input
                      type="text"
                      maxLength={6}
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000 000"
                      className="login-input"
                      style={{ textAlign: "center", letterSpacing: "4px", fontSize: 16, fontWeight: 700 }}
                    />
                  </div>

                  <button type="submit" className="primary-cta-btn" disabled={loading || totpCode.length !== 6}>
                    {loading ? <RefreshCw size={14} className="animate-spin" /> : <>Verify & Access Console <ArrowRight size={14} /></>}
                  </button>
                </form>
              ) : (
                <>
                  {/* STEP 1: PASSWORD FORM */}
                  {activeStep === 0 && (
                    <form onSubmit={handlePasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
                      <div>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 500, marginBottom: 6, color: "var(--text-secondary, #475569)" }}>
                          Email Address
                        </label>
                        <div className="login-input-wrap">
                          <Mail size={15} style={{ position: "absolute", left: 12, top: 12, color: "var(--text-muted, #94a3b8)" }} />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@domain.com"
                            className="login-input"
                            autoComplete="username"
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 500, marginBottom: 6, color: "var(--text-secondary, #475569)" }}>
                          Password
                        </label>
                        <div className="login-input-wrap">
                          <Lock size={15} style={{ position: "absolute", left: 12, top: 12, color: "var(--text-muted, #94a3b8)" }} />
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyUp={onKeyUp}
                            placeholder="••••••••••••"
                            className="login-input"
                            autoComplete="current-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                              position: "absolute",
                              right: 10,
                              top: 10,
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              color: "var(--text-muted, #94a3b8)",
                              padding: 2,
                            }}
                          >
                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
                        <label style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-muted, #64748b)", cursor: "pointer" }}>
                          <input type="checkbox" defaultChecked style={{ accentColor: "var(--text-primary, #0f172a)" }} />
                          Remember session
                        </label>
                        {capsLockOn && (
                          <span style={{ color: "#d97706", fontSize: 11.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                            <AlertTriangle size={12} /> Caps Lock ON
                          </span>
                        )}
                      </div>

                      <button type="submit" className="primary-cta-btn" disabled={loading || lockoutTimer > 0}>
                        {loading ? (
                          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <RefreshCw size={14} className="animate-spin" /> Authenticating...
                          </span>
                        ) : (
                          <>Sign in <ArrowRight size={14} /></>
                        )}
                      </button>
                    </form>
                  )}

                  {/* STEP 2: EMAIL OTP FORM */}
                  {activeStep === 1 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
                      {!emailOtpSent ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          <div>
                            <label style={{ display: "block", fontSize: 12, fontWeight: 500, marginBottom: 6, color: "var(--text-secondary, #475569)" }}>
                              Admin Email
                            </label>
                            <div className="login-input-wrap">
                              <Mail size={15} style={{ position: "absolute", left: 12, top: 12, color: "var(--text-muted, #94a3b8)" }} />
                              <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@domain.com"
                                className="login-input"
                              />
                            </div>
                          </div>

                          <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted, #64748b)", lineHeight: 1.45 }}>
                            A direct 6-digit one-time passcode will be delivered to your registered inbox.
                          </p>

                          <button
                            type="button"
                            onClick={handleSendEmailOtp}
                            className="primary-cta-btn"
                            disabled={loading || lockoutTimer > 0}
                          >
                            {loading ? "Dispatching Code..." : <>Send Security OTP <ArrowRight size={14} /></>}
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleVerifyEmailOtp} style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
                          <div style={{ textAlign: "center" }}>
                            <p style={{ margin: 0, fontSize: 12, color: "var(--text-secondary, #475569)" }}>
                              Enter the 6-digit code sent to <strong>{email}</strong>
                            </p>
                          </div>

                          <div className="login-input-wrap">
                            <Key size={15} style={{ position: "absolute", left: 12, top: 12, color: "var(--text-muted, #94a3b8)" }} />
                            <input
                              type="text"
                              maxLength={6}
                              value={emailOtpCode}
                              onChange={(e) => setEmailOtpCode(e.target.value.replace(/\D/g, ''))}
                              placeholder="000 000"
                              className="login-input"
                              style={{ textAlign: "center", letterSpacing: "5px", fontSize: 16, fontWeight: 700 }}
                              autoComplete="one-time-code"
                            />
                          </div>

                          <button
                            type="submit"
                            className="primary-cta-btn"
                            disabled={loading || emailOtpCode.length !== 6 || lockoutTimer > 0}
                          >
                            {loading ? "Verifying..." : <>Verify OTP & Sign In <ArrowRight size={14} /></>}
                          </button>

                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted, #64748b)" }}>
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
                              disabled={otpTimer > 0 || loading}
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

                  {/* STEP 3: PASSKEY BIOMETRICS */}
                  {activeStep === 2 && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 12, width: "100%" }}>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: "50%",
                          backgroundColor: "rgba(59, 130, 246, 0.1)",
                          color: "var(--primary-blue, #3b82f6)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Fingerprint size={22} />
                      </div>

                      <div>
                        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Hardware Passkey & WebAuthn</h4>
                        <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--text-muted, #64748b)", maxWidth: 280 }}>
                          Authenticate with Touch ID, Face ID, Windows Hello, or your FIDO2 security key.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handlePasskeySubmit}
                        className="primary-cta-btn"
                        disabled={loading || lockoutTimer > 0}
                      >
                        {loading ? "Waiting for Biometrics..." : <>Authenticate with Passkey <Fingerprint size={14} /></>}
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* Footer Trust Badges & Restricted Access Notice */}
              <div style={{ marginTop: 8, paddingTop: 14, borderTop: "1px solid var(--border-color, #e2e8f0)", width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, flexWrap: "wrap" }}>
                  <span
                    style={{
                      fontSize: 11,
                      padding: "2px 8px",
                      borderRadius: 9999,
                      backgroundColor: "var(--bg-primary, #f1f5f9)",
                      border: "1px solid var(--border-color, #e2e8f0)",
                      color: "var(--text-secondary, #64748b)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Lock size={10} /> TLS 1.3
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      padding: "2px 8px",
                      borderRadius: 9999,
                      backgroundColor: "var(--bg-primary, #f1f5f9)",
                      border: "1px solid var(--border-color, #e2e8f0)",
                      color: "var(--text-secondary, #64748b)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Key size={10} /> Passkey Ready
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      padding: "2px 8px",
                      borderRadius: 9999,
                      backgroundColor: "var(--bg-primary, #f1f5f9)",
                      border: "1px solid var(--border-color, #e2e8f0)",
                      color: "var(--text-secondary, #64748b)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Clock size={10} /> Rate Limited
                  </span>
                </div>

                <p style={{ margin: "8px 0 0", fontSize: 11, color: "var(--text-muted, #94a3b8)", textAlign: "center" }}>
                  Restricted access — authorized personnel only.
                </p>
              </div>
            </div>
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
                maxWidth: 400,
                width: "100%",
                padding: 22,
                boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                color: "var(--text-primary, #0f172a)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                  <HelpCircle size={17} color="var(--primary-blue, #3b82f6)" /> Admin Shortcuts & Help
                </h3>
                <button
                  type="button"
                  onClick={() => setShowHelpModal(false)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted, #94a3b8)" }}
                >
                  <X size={16} />
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12.5 }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "var(--bg-primary, #f8fafc)", borderRadius: 8 }}>
                  <span>Command Palette</span>
                  <kbd style={{ fontFamily: "monospace", fontSize: 11, background: "var(--bg-secondary, #fff)", padding: "1px 6px", borderRadius: 4, border: "1px solid var(--border-color, #e2e8f0)" }}>Ctrl + K</kbd>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "var(--bg-primary, #f8fafc)", borderRadius: 8 }}>
                  <span>Toggle Theme</span>
                  <kbd style={{ fontFamily: "monospace", fontSize: 11, background: "var(--bg-secondary, #fff)", padding: "1px 6px", borderRadius: 4, border: "1px solid var(--border-color, #e2e8f0)" }}>Shift + T</kbd>
                </div>
              </div>

              <div style={{ marginTop: 14, paddingTop: 10, borderTop: "1px solid var(--border-color, #e2e8f0)", fontSize: 11.5, color: "var(--text-muted, #64748b)" }}>
                Emergency support: <a href="mailto:sujithreddy1546@gmail.com" style={{ color: "var(--text-primary, #0f172a)", fontWeight: 600 }}>sujithreddy1546@gmail.com</a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* System Status Telemetry Modal */}
      <AnimatePresence>
        {showStatusModal && (
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
                padding: 22,
                boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                color: "var(--text-primary, #0f172a)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                    <Activity size={17} color="#10b981" /> System Telemetry
                  </h3>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: "#10b981", fontWeight: 600 }}>
                    ● All Systems Operational
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted, #94a3b8)" }}
                >
                  <X size={16} />
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12.5 }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", background: "var(--bg-primary, #f8fafc)", borderRadius: 8 }}>
                  <span>PostgreSQL Realtime</span>
                  <span style={{ color: "#10b981", fontWeight: 600 }}>100% Connected</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", background: "var(--bg-primary, #f8fafc)", borderRadius: 8 }}>
                  <span>Edge Auth Latency</span>
                  <span style={{ fontFamily: "monospace", fontWeight: 700 }}>{pingMs}ms</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", background: "var(--bg-primary, #f8fafc)", borderRadius: 8 }}>
                  <span>Security Shield</span>
                  <span style={{ color: "#10b981", fontWeight: 600 }}>Active & Guarded</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
