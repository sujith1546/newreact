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
            background: "rgba(0, 0, 0, 0.72)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
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
            initial={{ opacity: 0, scale: 0.94, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 14 }}
            transition={{ type: "spring", damping: 28, stiffness: 340 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              maxWidth: "410px",
              width: "100%",
              background: "#18191d",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "18px",
              boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05)",
              overflow: "hidden",
              color: "#ffffff",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif",
            }}
          >
            {/* Header User Profile & Close */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px 10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "50%",
                    background: "#1d4ed8",
                    color: "#ffffff",
                    fontWeight: "800",
                    fontSize: "12.5px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  ST
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "#ffffff", lineHeight: 1.2 }}>
                    Sujith Thota
                  </div>
                  <div style={{ fontSize: "11px", color: "#22c55e", fontWeight: "600", lineHeight: 1.2 }}>
                    Secure · reachable
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                style={{
                  background: "none",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  borderRadius: "50%",
                  transition: "color 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
              >
                <X size={18} />
              </button>
            </div>

            {/* Title & Centered Status Pills */}
            <div style={{ textAlign: "center", padding: "0 20px 14px" }}>
              <h2
                style={{
                  fontSize: "23px",
                  fontWeight: "800",
                  color: "#ffffff",
                  margin: "0 0 4px",
                  letterSpacing: "-0.02em",
                }}
              >
                Admin console
              </h2>
              <p style={{ fontSize: "12.5px", color: "#94a3b8", margin: "0 0 14px" }}>
                Sign in to manage the portfolio
              </p>

              {/* Status Badges Row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    fontSize: "11px",
                    fontWeight: "700",
                    padding: "3px 10px",
                    borderRadius: "999px",
                    background: "rgba(34, 197, 94, 0.15)",
                    color: "#22c55e",
                    border: "1px solid rgba(34, 197, 94, 0.3)",
                  }}
                >
                  <Lock size={11} />
                  <span>TLS 1.3</span>
                </span>

                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    fontSize: "11px",
                    fontWeight: "700",
                    padding: "3px 10px",
                    borderRadius: "999px",
                    background: "#262830",
                    color: "#e2e8f0",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                  }}
                >
                  <Fingerprint size={11} />
                  <span>Passkey ready</span>
                </span>

                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    fontSize: "11px",
                    fontWeight: "700",
                    padding: "3px 10px",
                    borderRadius: "999px",
                    background: "rgba(245, 158, 11, 0.15)",
                    color: "#f59e0b",
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                  }}
                >
                  <Clock size={11} />
                  <span>Rate limited</span>
                </span>
              </div>
            </div>

            {/* Segmented Pill Tabs */}
            <div
              style={{
                display: "flex",
                padding: "3px",
                background: "#22242a",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "999px",
                margin: "0 20px 16px",
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
                  background: activeMethod === "password" ? "#ffffff" : "transparent",
                  color: activeMethod === "password" ? "#0f172a" : "#94a3b8",
                  padding: "7px 12px",
                  borderRadius: "999px",
                  fontSize: "12px",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "all 0.18s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
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
                  background: activeMethod === "otp" ? "#ffffff" : "transparent",
                  color: activeMethod === "otp" ? "#0f172a" : "#94a3b8",
                  padding: "7px 12px",
                  borderRadius: "999px",
                  fontSize: "12px",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "all 0.18s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
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
                  margin: "0 20px 12px",
                  padding: "8px 12px",
                  background: "rgba(239,68,68,0.15)",
                  color: "#ef4444",
                  borderRadius: "8px",
                  fontSize: "12px",
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
                  margin: "0 20px 12px",
                  padding: "6px 10px",
                  background: "rgba(245, 158, 11, 0.15)",
                  color: "#f59e0b",
                  borderRadius: "8px",
                  fontSize: "11.5px",
                  fontWeight: 500,
                }}
              >
                {MAX_ATTEMPTS - attempts} attempts remaining before lockout.
              </div>
            )}

            {/* Form Content */}
            <div style={{ padding: "0 20px 20px" }}>
              {/* PASSWORD TAB VIEW */}
              {activeMethod === "password" && (
                <form onSubmit={handlePasswordSubmit} noValidate>
                  <div style={{ marginBottom: "14px", textAlign: "left" }}>
                    <label
                      htmlFor="modal-email"
                      style={{
                        display: "block",
                        fontSize: "12px",
                        fontWeight: "700",
                        color: "#ffffff",
                        marginBottom: "5px",
                      }}
                    >
                      Email address
                    </label>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        background: "#22242a",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        borderRadius: "9px",
                        padding: "0 12px",
                        height: "42px",
                      }}
                    >
                      <Mail size={15} color="#64748b" />
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
                          color: "#ffffff",
                          fontSize: "13.5px",
                          fontWeight: "600",
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: "14px", textAlign: "left" }}>
                    <label
                      htmlFor="modal-password"
                      style={{
                        display: "block",
                        fontSize: "12px",
                        fontWeight: "700",
                        color: "#ffffff",
                        marginBottom: "5px",
                      }}
                    >
                      Password
                    </label>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        background: "#22242a",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        borderRadius: "9px",
                        padding: "0 12px",
                        height: "42px",
                      }}
                    >
                      <Lock size={15} color="#64748b" />
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
                          color: "#ffffff",
                          fontSize: "13.5px",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#64748b",
                          cursor: "pointer",
                          padding: "2px",
                          display: "flex",
                        }}
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "16px",
                    }}
                  >
                    <label
                      htmlFor="modal-rememberMe"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "12px",
                        color: "#cbd5e1",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        id="modal-rememberMe"
                        type="checkbox"
                        style={{ accentColor: "#ffffff" }}
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
                        fontSize: "12px",
                        color: "#38bdf8",
                        textDecoration: "underline",
                        fontWeight: "600",
                      }}
                    >
                      Forgot?
                    </a>
                  </div>

                  {/* Primary Bright White Action Button */}
                  <button
                    type="submit"
                    disabled={loading || lockoutTimer > 0}
                    style={{
                      width: "100%",
                      height: "42px",
                      background: "#ffffff",
                      color: "#0f172a",
                      fontWeight: "700",
                      fontSize: "13.5px",
                      border: "none",
                      borderRadius: "10px",
                      cursor: loading || lockoutTimer > 0 ? "not-allowed" : "pointer",
                      opacity: loading || lockoutTimer > 0 ? 0.6 : 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                      transition: "transform 0.15s ease, opacity 0.15s ease",
                    }}
                  >
                    <span>
                      {loading
                        ? "Signing in..."
                        : lockoutTimer > 0
                        ? `Locked (${lockoutTimer}s)`
                        : "Sign in"}
                    </span>
                    <ArrowRight size={15} />
                  </button>
                </form>
              )}

              {/* EMAIL OTP TAB VIEW */}
              {activeMethod === "otp" && (
                <div>
                  {!emailOtpSent ? (
                    <form onSubmit={handleSendEmailOtp} noValidate>
                      <div style={{ marginBottom: "14px", textAlign: "left" }}>
                        <label
                          htmlFor="modal-otpEmail"
                          style={{
                            display: "block",
                            fontSize: "12px",
                            fontWeight: "700",
                            color: "#ffffff",
                            marginBottom: "5px",
                          }}
                        >
                          Registered Admin Email
                        </label>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            background: "#22242a",
                            border: "1px solid rgba(255, 255, 255, 0.12)",
                            borderRadius: "9px",
                            padding: "0 12px",
                            height: "42px",
                          }}
                        >
                          <Mail size={15} color="#64748b" />
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
                              color: "#ffffff",
                              fontSize: "13.5px",
                              fontWeight: "600",
                            }}
                          />
                        </div>
                      </div>

                      <p
                        style={{
                          fontSize: "12px",
                          color: "#94a3b8",
                          margin: "0 0 14px",
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
                          height: "42px",
                          background: "#ffffff",
                          color: "#0f172a",
                          fontWeight: "700",
                          fontSize: "13.5px",
                          border: "none",
                          borderRadius: "10px",
                          cursor: loading || lockoutTimer > 0 ? "not-allowed" : "pointer",
                          opacity: loading || lockoutTimer > 0 ? 0.6 : 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                          boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                        }}
                      >
                        <span>{loading ? "Sending Code..." : "Send 6-digit OTP"}</span>
                        <ArrowRight size={15} />
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyEmailOtp} noValidate>
                      <div style={{ marginBottom: "14px", textAlign: "left" }}>
                        <label
                          htmlFor="modal-otpCode"
                          style={{
                            display: "block",
                            fontSize: "12px",
                            fontWeight: "700",
                            color: "#ffffff",
                            marginBottom: "5px",
                          }}
                        >
                          6-digit Security PIN
                        </label>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            background: "#22242a",
                            border: "1px solid rgba(255, 255, 255, 0.12)",
                            borderRadius: "9px",
                            padding: "0 12px",
                            height: "42px",
                          }}
                        >
                          <Shield size={15} color="#64748b" />
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
                              color: "#ffffff",
                              textAlign: "center",
                              letterSpacing: "4px",
                              fontWeight: 700,
                              fontSize: "15px",
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
                          height: "42px",
                          background: "#ffffff",
                          color: "#0f172a",
                          fontWeight: "700",
                          fontSize: "13.5px",
                          border: "none",
                          borderRadius: "10px",
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
                          boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                        }}
                      >
                        <span>{loading ? "Verifying..." : "Verify & Sign in"}</span>
                        <ArrowRight size={15} />
                      </button>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginTop: "12px",
                          fontSize: "12px",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setEmailOtpSent(false)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#94a3b8",
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
                            color: otpTimer > 0 ? "#64748b" : "#22c55e",
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

              {/* Footer Note */}
              <p
                style={{
                  margin: "14px 0 0",
                  fontSize: "11px",
                  color: "#64748b",
                  textAlign: "center",
                }}
              >
                Restricted access · authorized personnel only.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
