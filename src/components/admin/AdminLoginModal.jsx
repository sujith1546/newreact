import React, { useState, useEffect, useRef } from "react";
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
  const emailInputRef = useRef(null);

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

  // Reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(mediaQuery.matches);
    }
  }, []);

  // Store active element, focus initial input, & lock body scroll on open
  useEffect(() => {
    if (!isOpen) return;

    const previousActiveElement = document.activeElement;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Auto-focus email field
    setTimeout(() => {
      if (emailInputRef.current) {
        emailInputRef.current.focus();
      }
    }, 100);

    return () => {
      document.body.style.overflow = originalOverflow;
      if (previousActiveElement && typeof previousActiveElement.focus === "function") {
        previousActiveElement.focus();
      }
    };
  }, [isOpen]);

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
          className="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.15 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999999,
            background: "rgba(0, 0, 0, 0.35)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
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
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-modal-title"
            initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.96 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.18, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              maxWidth: "400px",
              width: "100%",
              background: "var(--bg-secondary, #18191d)",
              border: "0.5px solid var(--border-color, rgba(255, 255, 255, 0.12))",
              borderRadius: "16px",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1)",
              overflow: "hidden",
              color: "var(--text-primary, #ffffff)",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif",
            }}
          >
            {/* Identity Row: avatar + name + status | close button */}
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
                    width: "26px",
                    height: "26px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    background: "#1d4ed8",
                    color: "#ffffff",
                    fontWeight: "700",
                    fontSize: "11px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <img
                    src="/profile_photo.png"
                    alt="Sujith Thota"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                  <span>ST</span>
                </div>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: "500", color: "var(--text-primary, #ffffff)", lineHeight: 1.2 }}>
                    Sujith Thota
                  </div>
                  <div style={{ fontSize: "10.5px", color: "#22c55e", fontWeight: "500", lineHeight: 1.2 }}>
                    Secure · reachable
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-muted, #94a3b8)",
                  cursor: "pointer",
                  padding: 0,
                  width: "26px",
                  height: "26px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  transition: "color 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary, #ffffff)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted, #94a3b8)")}
              >
                <X size={16} />
              </button>
            </div>

            {/* Admin console heading + subtitle, centered */}
            <div style={{ textAlign: "center", padding: "0 20px 14px" }}>
              <h3
                id="admin-modal-title"
                style={{
                  fontSize: "22px",
                  fontWeight: "700",
                  color: "var(--text-primary, #ffffff)",
                  margin: "0 0 4px",
                  letterSpacing: "-0.02em",
                }}
              >
                Admin console
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-muted, #94a3b8)", margin: "0 0 14px" }}>
                Sign in to manage the portfolio
              </p>

              {/* Status pills row, centered */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    fontSize: "11px",
                    fontWeight: "600",
                    padding: "3px 9px",
                    borderRadius: "99px",
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
                    fontWeight: "600",
                    padding: "3px 9px",
                    borderRadius: "99px",
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
                    fontWeight: "600",
                    padding: "3px 9px",
                    borderRadius: "99px",
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

            {/* Password / Email OTP pill tabs */}
            <div
              style={{
                display: "flex",
                padding: "3px",
                background: "#22242a",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "99px",
                margin: "0 20px 14px",
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
                  background: activeMethod === "password" ? "var(--btn-primary-bg, #ffffff)" : "transparent",
                  color: activeMethod === "password" ? "var(--btn-primary-text, #0f172a)" : "var(--text-secondary, #94a3b8)",
                  padding: "7px 12px",
                  borderRadius: "99px",
                  fontSize: "12px",
                  fontWeight: "600",
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
                  background: activeMethod === "otp" ? "var(--btn-primary-bg, #ffffff)" : "transparent",
                  color: activeMethod === "otp" ? "var(--btn-primary-text, #0f172a)" : "var(--text-secondary, #94a3b8)",
                  padding: "7px 12px",
                  borderRadius: "99px",
                  fontSize: "12px",
                  fontWeight: "600",
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
                        fontWeight: "500",
                        color: "var(--text-primary, #ffffff)",
                        marginBottom: "5px",
                      }}
                    >
                      Email address
                    </label>
                    <div
                      style={{
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        background: "#22242a",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        borderRadius: "8px",
                        height: "36px",
                      }}
                    >
                      <Mail
                        size={15}
                        color="#64748b"
                        style={{
                          position: "absolute",
                          left: "11px",
                          pointerEvents: "none",
                        }}
                      />
                      <input
                        ref={emailInputRef}
                        id="modal-email"
                        type="email"
                        placeholder="sujithreddy1546@gmail.com"
                        autoComplete="username"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={lockoutTimer > 0}
                        style={{
                          width: "100%",
                          height: "100%",
                          background: "transparent",
                          border: "none",
                          outline: "none",
                          color: "#ffffff",
                          fontSize: "13px",
                          paddingLeft: "32px",
                          paddingRight: "12px",
                          boxSizing: "border-box",
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
                        fontWeight: "500",
                        color: "var(--text-primary, #ffffff)",
                        marginBottom: "5px",
                      }}
                    >
                      Password
                    </label>
                    <div
                      style={{
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        background: "#22242a",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        borderRadius: "8px",
                        height: "36px",
                      }}
                    >
                      <Lock
                        size={15}
                        color="#64748b"
                        style={{
                          position: "absolute",
                          left: "11px",
                          pointerEvents: "none",
                        }}
                      />
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
                          width: "100%",
                          height: "100%",
                          background: "transparent",
                          border: "none",
                          outline: "none",
                          color: "#ffffff",
                          fontSize: "13px",
                          paddingLeft: "32px",
                          paddingRight: "32px",
                          boxSizing: "border-box",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        style={{
                          position: "absolute",
                          right: "8px",
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

                  {/* Remember me | Forgot? row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "16px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <label
                      htmlFor="modal-rememberMe"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "12px",
                        color: "#cbd5e1",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <input
                        id="modal-rememberMe"
                        type="checkbox"
                        style={{ accentColor: "#ffffff" }}
                      />
                      <span style={{ whiteSpace: "nowrap" }}>Remember me</span>
                    </label>
                    <a
                      href="#forgot"
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveMethod("otp");
                      }}
                      style={{
                        fontSize: "12px",
                        color: "var(--text-accent, #38bdf8)",
                        textDecoration: "underline",
                        fontWeight: "500",
                      }}
                    >
                      Forgot?
                    </a>
                  </div>

                  {/* Sign in button */}
                  <button
                    type="submit"
                    disabled={loading || lockoutTimer > 0}
                    style={{
                      width: "100%",
                      height: "38px",
                      background: "var(--btn-primary-bg, #ffffff)",
                      color: "var(--btn-primary-text, #0f172a)",
                      fontWeight: "600",
                      fontSize: "13px",
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
                    onMouseEnter={(e) => {
                      if (!loading && lockoutTimer <= 0) {
                        e.currentTarget.style.opacity = "0.92";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loading && lockoutTimer <= 0) {
                        e.currentTarget.style.opacity = "1";
                        e.currentTarget.style.transform = "translateY(0)";
                      }
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
                            fontWeight: "500",
                            color: "var(--text-primary, #ffffff)",
                            marginBottom: "5px",
                          }}
                        >
                          Registered Admin Email
                        </label>
                        <div
                          style={{
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                            background: "#22242a",
                            border: "1px solid rgba(255, 255, 255, 0.12)",
                            borderRadius: "8px",
                            height: "36px",
                          }}
                        >
                          <Mail
                            size={15}
                            color="#64748b"
                            style={{ position: "absolute", left: "11px", pointerEvents: "none" }}
                          />
                          <input
                            id="modal-otpEmail"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                              width: "100%",
                              height: "100%",
                              background: "transparent",
                              border: "none",
                              outline: "none",
                              color: "#ffffff",
                              fontSize: "13px",
                              paddingLeft: "32px",
                              paddingRight: "12px",
                              boxSizing: "border-box",
                            }}
                          />
                        </div>
                      </div>

                      <p
                        style={{
                          fontSize: "12px",
                          color: "var(--text-muted, #94a3b8)",
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
                          height: "38px",
                          background: "var(--btn-primary-bg, #ffffff)",
                          color: "var(--btn-primary-text, #0f172a)",
                          fontWeight: "600",
                          fontSize: "13px",
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
                            fontWeight: "500",
                            color: "var(--text-primary, #ffffff)",
                            marginBottom: "5px",
                          }}
                        >
                          6-digit Security PIN
                        </label>
                        <div
                          style={{
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                            background: "#22242a",
                            border: "1px solid rgba(255, 255, 255, 0.12)",
                            borderRadius: "8px",
                            height: "36px",
                          }}
                        >
                          <Shield
                            size={15}
                            color="#64748b"
                            style={{ position: "absolute", left: "11px", pointerEvents: "none" }}
                          />
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
                              width: "100%",
                              height: "100%",
                              background: "transparent",
                              border: "none",
                              outline: "none",
                              color: "#ffffff",
                              textAlign: "center",
                              letterSpacing: "4px",
                              fontWeight: 700,
                              fontSize: "14px",
                              paddingLeft: "32px",
                              paddingRight: "12px",
                              boxSizing: "border-box",
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
                          height: "38px",
                          background: "var(--btn-primary-bg, #ffffff)",
                          color: "var(--btn-primary-text, #0f172a)",
                          fontWeight: "600",
                          fontSize: "13px",
                          border: "none",
                          borderRadius: "8px",
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
                          transition: "all 0.15s ease",
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
                            color: "var(--text-muted, #94a3b8)",
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
                  color: "var(--text-muted, #94a3b8)",
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
