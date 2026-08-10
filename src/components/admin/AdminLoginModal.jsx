import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabaseClient";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Shield,
  Clock,
  Fingerprint,
  ArrowRight,
  AlertTriangle,
  X,
  KeyRound,
} from "lucide-react";

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60000;

export default function AdminLoginModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  // Auth State
  const [email, setEmail] = useState("sujithreddy1546@gmail.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Lockout State
  const [attempts, setAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  // MFA State
  const [mfaRequired, setMfaRequired] = useState(false);
  const [totpFactorId, setTotpFactorId] = useState("");
  const [totpCode, setTotpCode] = useState("");

  // Email Security OTP State
  const [activeMethod, setActiveMethod] = useState("password");
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpCode, setEmailOtpCode] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // OTP Timer countdown
  useEffect(() => {
    let interval = null;
    if (otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Lockout check
  const checkLockoutStatus = () => {
    try {
      const lockoutExpiry = localStorage.getItem("admin_login_lockout");
      if (lockoutExpiry) {
        const remainingTime = Math.ceil(
          (parseInt(lockoutExpiry, 10) - Date.now()) / 1000
        );
        if (remainingTime > 0) {
          setLockoutTimer(remainingTime);
          setError(`Too many failed attempts. Locked out for ${remainingTime}s.`);
        } else {
          localStorage.removeItem("admin_login_lockout");
          localStorage.removeItem("admin_login_attempts");
          setLockoutTimer(0);
          setAttempts(0);
          setError("");
        }
      }
    } catch (_) {}
  };

  useEffect(() => {
    checkLockoutStatus();
    const interval = setInterval(checkLockoutStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleFailedAttempt = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    try {
      localStorage.setItem("admin_login_attempts", newAttempts.toString());
      if (newAttempts >= MAX_ATTEMPTS) {
        const expiry = Date.now() + LOCKOUT_DURATION_MS;
        localStorage.setItem("admin_login_lockout", expiry.toString());
        setLockoutTimer(60);
        setError("Too many failed attempts. Locked out for 60 seconds.");
      }
    } catch (_) {}
  };

  // Password Submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (lockoutTimer > 0) return;
    setLoading(true);
    setError("");

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        handleFailedAttempt();
        setError(authError.message || "Invalid email or password.");
        setLoading(false);
        return;
      }

      const { data: factors } = await supabase.auth.mfa.listFactors();
      const verifiedTotp = factors?.totp?.find((f) => f.status === "verified");

      if (verifiedTotp) {
        setTotpFactorId(verifiedTotp.id);
        setMfaRequired(true);
        setLoading(false);
        return;
      }

      try {
        localStorage.removeItem("admin_login_attempts");
        localStorage.removeItem("admin_login_lockout");
      } catch (_) {}

      onClose();
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Email OTP Flow
  const handleSendEmailOtp = async (e) => {
    e.preventDefault();
    if (lockoutTimer > 0) return;
    setLoading(true);
    setError("");

    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { shouldCreateUser: false },
      });

      if (otpError) {
        setError(otpError.message);
        setLoading(false);
        return;
      }

      setEmailOtpSent(true);
      setOtpTimer(60);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmailOtp = async (e) => {
    e.preventDefault();
    if (lockoutTimer > 0 || emailOtpCode.length !== 6) return;
    setLoading(true);
    setError("");

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: emailOtpCode.trim(),
        type: "email",
      });

      if (verifyError) {
        handleFailedAttempt();
        setError(verifyError.message || "Invalid 6-digit OTP code.");
        setLoading(false);
        return;
      }

      onClose();
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // MFA TOTP Submission
  const handleTotpSubmit = async (e) => {
    e.preventDefault();
    if (lockoutTimer > 0 || totpCode.length !== 6) return;
    setLoading(true);
    setError("");

    try {
      const { data: challengeData, error: challengeErr } =
        await supabase.auth.mfa.challenge({ factorId: totpFactorId });
      if (challengeErr) throw challengeErr;

      const { error: verifyErr } = await supabase.auth.mfa.verify({
        factorId: totpFactorId,
        challengeId: challengeData.id,
        code: totpCode.trim(),
      });

      if (verifyErr) {
        handleFailedAttempt();
        setError(verifyErr.message || "Invalid 6-digit authenticator code.");
        setLoading(false);
        return;
      }

      onClose();
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="admin-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999999,
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            boxSizing: "border-box",
          }}
          onClick={onClose}
        >
          <motion.div
            key="admin-modal-content"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              maxWidth: "400px",
              width: "100%",
              background: "var(--bg-secondary, #ffffff)",
              border: "1px solid var(--border-color, #e2e8f0)",
              borderRadius: "16px",
              boxShadow: "0 20px 45px -10px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255,255,255,0.08)",
              overflow: "hidden",
              color: "var(--text-primary, #0f172a)",
              fontFamily: "var(--font-sans, 'Inter', sans-serif)",
            }}
          >
            {/* Modal Header Bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                borderBottom: "1px solid var(--border-color, #e2e8f0)",
                background: "color-mix(in srgb, var(--bg-primary, #f8fafc) 60%, transparent)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "10px",
                    fontWeight: 600,
                    padding: "2px 7px",
                    borderRadius: "999px",
                    background: "rgba(16, 185, 129, 0.12)",
                    color: "#10b981",
                    border: "1px solid rgba(16, 185, 129, 0.25)",
                  }}
                >
                  <Lock size={10} />
                  <span>TLS 1.3</span>
                </span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "10px",
                    fontWeight: 600,
                    padding: "2px 7px",
                    borderRadius: "999px",
                    background: "var(--bg-primary, #f1f5f9)",
                    color: "var(--text-secondary, #64748b)",
                    border: "1px solid var(--border-color, #e2e8f0)",
                  }}
                >
                  <Fingerprint size={10} />
                  <span>Passkey ready</span>
                </span>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                style={{
                  background: "transparent",
                  border: "none",
                  borderRadius: "50%",
                  width: "28px",
                  height: "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "var(--text-secondary, #64748b)",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(128,128,128,0.12)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "18px 20px 20px" }}>
              {/* Title */}
              <div style={{ textAlign: "center", marginBottom: "14px" }}>
                <h2
                  style={{
                    margin: "0 0 2px",
                    fontSize: "20px",
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    color: "var(--text-primary, #0f172a)",
                  }}
                >
                  Admin console
                </h2>
                <p
                  style={{
                    margin: 0,
                    fontSize: "12.5px",
                    color: "var(--text-secondary, #64748b)",
                  }}
                >
                  Sign in to manage the portfolio
                </p>
              </div>

              {/* Segmented Pill Tabs */}
              <div
                style={{
                  display: "flex",
                  padding: "3px",
                  background: "var(--bg-primary, #f1f5f9)",
                  border: "1px solid var(--border-color, #e2e8f0)",
                  borderRadius: "999px",
                  marginBottom: "12px",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setActiveMethod("password");
                  }}
                  style={{
                    flex: 1,
                    border: "none",
                    background: activeMethod === "password" ? "var(--text-primary, #0f172a)" : "transparent",
                    color: activeMethod === "password" ? "var(--bg-secondary, #ffffff)" : "var(--text-secondary, #64748b)",
                    padding: "6px 10px",
                    borderRadius: "999px",
                    fontSize: "11.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.18s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "5px",
                    boxShadow: activeMethod === "password" ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
                  }}
                >
                  <KeyRound size={13} />
                  <span>Password</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setActiveMethod("otp");
                  }}
                  style={{
                    flex: 1,
                    border: "none",
                    background: activeMethod === "otp" ? "var(--text-primary, #0f172a)" : "transparent",
                    color: activeMethod === "otp" ? "var(--bg-secondary, #ffffff)" : "var(--text-secondary, #64748b)",
                    padding: "6px 10px",
                    borderRadius: "999px",
                    fontSize: "11.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.18s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "5px",
                    boxShadow: activeMethod === "otp" ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
                  }}
                >
                  <Mail size={13} />
                  <span>Email OTP</span>
                </button>
              </div>

              {/* Error Notice */}
              {error && (
                <div
                  style={{
                    padding: "8px 12px",
                    background: "rgba(239,68,68,0.1)",
                    color: "#ef4444",
                    borderRadius: "8px",
                    fontSize: "12px",
                    marginBottom: "12px",
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <AlertTriangle size={13} />
                  <span>{error}</span>
                </div>
              )}

              {/* Attempts Notice */}
              {attempts > 0 && attempts < MAX_ATTEMPTS && (
                <div
                  style={{
                    padding: "6px 10px",
                    background: "rgba(245, 158, 11, 0.12)",
                    color: "#d97706",
                    borderRadius: "8px",
                    fontSize: "11.5px",
                    marginBottom: "12px",
                    fontWeight: 500,
                  }}
                >
                  {MAX_ATTEMPTS - attempts} attempts remaining before lockout.
                </div>
              )}

              {/* PASSWORD TAB VIEW */}
              {activeMethod === "password" && (
                <form onSubmit={handlePasswordSubmit} noValidate>
                  <div style={{ marginBottom: "10px", textAlign: "left" }}>
                    <label
                      htmlFor="modal-email"
                      style={{
                        display: "block",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "var(--text-secondary, #64748b)",
                        marginBottom: "3px",
                      }}
                    >
                      Email address
                    </label>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        background: "var(--bg-primary, #f1f5f9)",
                        border: "1px solid var(--border-color, #e2e8f0)",
                        borderRadius: "8px",
                        padding: "0 10px",
                      }}
                    >
                      <Mail size={14} color="var(--text-secondary, #94a3b8)" />
                      <input
                        id="modal-email"
                        type="email"
                        placeholder="sujithreddy1546@gmail.com"
                        autoComplete="username"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={lockoutTimer > 0}
                        style={{
                          flex: 1,
                          background: "transparent",
                          border: "none",
                          outline: "none",
                          color: "var(--text-primary, #0f172a)",
                          fontSize: "13px",
                          padding: "7px 0",
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: "10px", textAlign: "left" }}>
                    <label
                      htmlFor="modal-password"
                      style={{
                        display: "block",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "var(--text-secondary, #64748b)",
                        marginBottom: "3px",
                      }}
                    >
                      Password
                    </label>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        background: "var(--bg-primary, #f1f5f9)",
                        border: "1px solid var(--border-color, #e2e8f0)",
                        borderRadius: "8px",
                        padding: "0 10px",
                      }}
                    >
                      <Lock size={14} color="var(--text-secondary, #94a3b8)" />
                      <input
                        id="modal-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={lockoutTimer > 0}
                        style={{
                          flex: 1,
                          background: "transparent",
                          border: "none",
                          outline: "none",
                          color: "var(--text-primary, #0f172a)",
                          fontSize: "13px",
                          padding: "7px 0",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--text-secondary, #94a3b8)",
                          cursor: "pointer",
                          padding: "2px",
                          display: "flex",
                        }}
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      margin: "6px 0 12px",
                    }}
                  >
                    <label
                      htmlFor="modal-rememberMe"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        fontSize: "11.5px",
                        color: "var(--text-secondary, #64748b)",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        id="modal-rememberMe"
                        type="checkbox"
                        style={{ accentColor: "var(--text-primary, #0f172a)" }}
                      />
                      <span>Remember me</span>
                    </label>
                    <a
                      href="#forgot"
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveMethod("otp");
                      }}
                      style={{
                        fontSize: "11.5px",
                        color: "var(--text-secondary, #64748b)",
                        textDecoration: "none",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                      onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                    >
                      Forgot?
                    </a>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || lockoutTimer > 0}
                    style={{
                      width: "100%",
                      background: "var(--text-primary, #0f172a)",
                      color: "var(--bg-secondary, #ffffff)",
                      fontWeight: 600,
                      fontSize: "12.5px",
                      padding: "9px 14px",
                      border: "none",
                      borderRadius: "8px",
                      cursor: loading || lockoutTimer > 0 ? "not-allowed" : "pointer",
                      opacity: loading || lockoutTimer > 0 ? 0.6 : 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      transition: "all 0.15s ease",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    }}
                  >
                    <span>
                      {loading
                        ? "Signing in..."
                        : lockoutTimer > 0
                        ? `Locked (${lockoutTimer}s)`
                        : "Sign in"}
                    </span>
                    <ArrowRight size={14} />
                  </button>
                </form>
              )}

              {/* EMAIL OTP TAB VIEW */}
              {activeMethod === "otp" && (
                <div>
                  {!emailOtpSent ? (
                    <form onSubmit={handleSendEmailOtp} noValidate>
                      <div style={{ marginBottom: "10px", textAlign: "left" }}>
                        <label
                          htmlFor="modal-otpEmail"
                          style={{
                            display: "block",
                            fontSize: "11px",
                            fontWeight: 600,
                            color: "var(--text-secondary, #64748b)",
                            marginBottom: "3px",
                          }}
                        >
                          Registered Admin Email
                        </label>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            background: "var(--bg-primary, #f1f5f9)",
                            border: "1px solid var(--border-color, #e2e8f0)",
                            borderRadius: "8px",
                            padding: "0 10px",
                          }}
                        >
                          <Mail size={14} color="var(--text-secondary, #94a3b8)" />
                          <input
                            id="modal-otpEmail"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                              flex: 1,
                              background: "transparent",
                              border: "none",
                              outline: "none",
                              color: "var(--text-primary, #0f172a)",
                              fontSize: "13px",
                              padding: "7px 0",
                            }}
                          />
                        </div>
                      </div>

                      <p
                        style={{
                          fontSize: "11.5px",
                          color: "var(--text-secondary, #64748b)",
                          margin: "0 0 12px",
                          lineHeight: 1.45,
                        }}
                      >
                        A one-time 6-digit security code will be sent directly to your inbox.
                      </p>

                      <button
                        type="submit"
                        disabled={loading || lockoutTimer > 0}
                        style={{
                          width: "100%",
                          background: "var(--text-primary, #0f172a)",
                          color: "var(--bg-secondary, #ffffff)",
                          fontWeight: 600,
                          fontSize: "12.5px",
                          padding: "9px 14px",
                          border: "none",
                          borderRadius: "8px",
                          cursor: loading || lockoutTimer > 0 ? "not-allowed" : "pointer",
                          opacity: loading || lockoutTimer > 0 ? 0.6 : 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <span>{loading ? "Sending Code..." : "Send 6-digit OTP"}</span>
                        <ArrowRight size={14} />
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyEmailOtp} noValidate>
                      <div style={{ marginBottom: "10px", textAlign: "left" }}>
                        <label
                          htmlFor="modal-otpCode"
                          style={{
                            display: "block",
                            fontSize: "11px",
                            fontWeight: 600,
                            color: "var(--text-secondary, #64748b)",
                            marginBottom: "3px",
                          }}
                        >
                          6-digit Security PIN
                        </label>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            background: "var(--bg-primary, #f1f5f9)",
                            border: "1px solid var(--border-color, #e2e8f0)",
                            borderRadius: "8px",
                            padding: "0 10px",
                          }}
                        >
                          <Shield size={14} color="var(--text-secondary, #94a3b8)" />
                          <input
                            id="modal-otpCode"
                            type="text"
                            maxLength={6}
                            value={emailOtpCode}
                            onChange={(e) =>
                              setEmailOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                            }
                            placeholder="000 000"
                            style={{
                              flex: 1,
                              background: "transparent",
                              border: "none",
                              outline: "none",
                              color: "var(--text-primary, #0f172a)",
                              textAlign: "center",
                              letterSpacing: "4px",
                              fontWeight: 700,
                              fontSize: "14px",
                              padding: "7px 0",
                            }}
                            autoFocus
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading || emailOtpCode.length !== 6 || lockoutTimer > 0}
                        style={{
                          width: "100%",
                          background: "var(--text-primary, #0f172a)",
                          color: "var(--bg-secondary, #ffffff)",
                          fontWeight: 600,
                          fontSize: "12.5px",
                          padding: "9px 14px",
                          border: "none",
                          borderRadius: "8px",
                          marginTop: "8px",
                          cursor:
                            loading || emailOtpCode.length !== 6 || lockoutTimer > 0
                              ? "not-allowed"
                              : "pointer",
                          opacity:
                            loading || emailOtpCode.length !== 6 || lockoutTimer > 0 ? 0.6 : 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                        }}
                      >
                        <span>{loading ? "Verifying..." : "Verify & Sign in"}</span>
                        <ArrowRight size={14} />
                      </button>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginTop: "10px",
                          fontSize: "11.5px",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setEmailOtpSent(false)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "var(--text-secondary, #64748b)",
                            cursor: "pointer",
                          }}
                        >
                          ← Back
                        </button>
                        <button
                          type="button"
                          onClick={handleSendEmailOtp}
                          disabled={otpTimer > 0 || loading}
                          style={{
                            background: "none",
                            border: "none",
                            color: otpTimer > 0 ? "var(--text-secondary, #94a3b8)" : "#10b981",
                            fontWeight: 600,
                            cursor: otpTimer > 0 ? "not-allowed" : "pointer",
                          }}
                        >
                          {otpTimer > 0 ? `Resend in ${otpTimer}s` : "Resend code"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Footer Notice */}
              <p
                style={{
                  marginTop: "12px",
                  marginBottom: 0,
                  fontSize: "10px",
                  color: "var(--text-secondary, #94a3b8)",
                  textAlign: "center",
                }}
              >
                Restricted access · authorized personnel only
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
