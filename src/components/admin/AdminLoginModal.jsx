import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabaseClient";
import { useTheme } from "../../context/ThemeContext";
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
  const { theme } = useTheme();
  const emailInputRef = useRef(null);

  // Auth State
  const [email, setEmail] = useState("sujithreddy1546@gmail.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isShaking, setIsShaking] = useState(false);

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
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
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

  const isDarkMode = theme === "dark" || (typeof document !== "undefined" && document.documentElement.getAttribute("data-theme") === "dark");

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="admin-modal-backdrop"
          className="admin-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.22, ease: 'easeOut' }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999999,
            background: isDarkMode ? "rgba(0, 0, 0, 0.55)" : "rgba(15, 23, 42, 0.4)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            boxSizing: "border-box",
          }}
          onClick={onClose}
        >
          <style>{`
            .admin-modal-card {
              --modal-bg: rgba(255, 255, 255, 0.98);
              --modal-border: #e2e8f0;
              --modal-text: #0f172a;
              --modal-muted: #64748b;
              --modal-field-bg: #f8fafc;
              --modal-field-border: #cbd5e1;
              --modal-tab-track: #f1f5f9;
              --modal-tab-active-bg: #0f172a;
              --modal-tab-active-text: #ffffff;
              --modal-btn-bg: #0f172a;
              --modal-btn-hover: #1e293b;
              --modal-btn-text: #ffffff;
              --modal-shadow: 0 20px 50px -12px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05);
              backdrop-filter: blur(20px);
              -webkit-backdrop-filter: blur(20px);
              color-scheme: light;
            }

            .admin-modal-card.dark-mode {
              --modal-bg: rgba(20, 22, 28, 0.96);
              --modal-border: rgba(255, 255, 255, 0.12);
              --modal-text: #ffffff;
              --modal-muted: #94a3b8;
              --modal-field-bg: #22242a;
              --modal-field-border: rgba(255, 255, 255, 0.14);
              --modal-tab-track: #141518;
              --modal-tab-active-bg: #ffffff;
              --modal-tab-active-text: #0f172a;
              --modal-btn-bg: #ffffff;
              --modal-btn-hover: #f1f5f9;
              --modal-btn-text: #0f172a;
              --modal-shadow: 0 24px 60px -12px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(20px);
              -webkit-backdrop-filter: blur(20px);
              color-scheme: dark;
            }

            .admin-modal-card input:-webkit-autofill,
            .admin-modal-card input:-webkit-autofill:hover,
            .admin-modal-card input:-webkit-autofill:focus {
              -webkit-text-fill-color: var(--modal-text) !important;
              -webkit-box-shadow: 0 0 0px 1000px var(--modal-field-bg) inset !important;
              transition: background-color 5000s ease-in-out 0s;
            }
          `}</style>

          {/* Ambient Glow Aura */}
          <div
            style={{
              position: "absolute",
              width: "400px",
              height: "400px",
              borderRadius: "50%",
              background: isDarkMode
                ? "radial-gradient(circle, rgba(59, 130, 246, 0.18) 0%, rgba(99, 102, 241, 0.1) 45%, transparent 70%)"
                : "radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, rgba(99, 102, 241, 0.08) 45%, transparent 70%)",
              filter: "blur(40px)",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />

          <motion.div
            key="admin-modal-content"
            className={`modal admin-modal-card ${isDarkMode ? "dark-mode" : "light-mode"}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-modal-title"
            initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.88, y: prefersReducedMotion ? 0 : 28, filter: "blur(6px)" }}
            animate={
              isShaking
                ? { x: [-12, 12, -8, 8, -4, 4, 0], opacity: 1, scale: 1, y: 0, transition: { duration: 0.45 } }
                : { opacity: 1, scale: 1, y: 0, x: 0, filter: "blur(0px)" }
            }
            exit={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.94, y: prefersReducedMotion ? 0 : 16, filter: "blur(4px)", transition: { duration: 0.16, ease: [0.32, 0, 0.67, 0] } }}
            transition={{ type: "spring", damping: 25, stiffness: 350, mass: 0.85 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              maxWidth: "400px",
              width: "100%",
              background: "var(--modal-bg)",
              border: "0.5px solid var(--modal-border)",
              borderRadius: "20px",
              boxShadow: "var(--modal-shadow)",
              overflow: "hidden",
              color: "var(--modal-text)",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif",
              zIndex: 1,
            }}
          >
            {/* Identity Row: avatar + name + status | close button */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "18px 20px 10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "#1d4ed8",
                    color: "#ffffff",
                    fontWeight: "700",
                    fontSize: "11px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: "0 2px 8px rgba(29, 78, 216, 0.4)",
                  }}
                >
                  ST
                </div>
                <div>
                  <div style={{ fontSize: "12.5px", fontWeight: "600", color: "var(--modal-text)", lineHeight: 1.2 }}>
                    Sujith Thota
                  </div>
                  <div style={{ fontSize: "10.5px", color: "#22c55e", fontWeight: "600", lineHeight: 1.2 }}>
                    Secure · reachable
                  </div>
                </div>
              </div>

              <motion.button
                type="button"
                onClick={onClose}
                aria-label="Close"
                whileHover={{ scale: 1.15, rotate: 90 }}
                whileTap={{ scale: 0.88 }}
                transition={{ type: "spring", damping: 20, stiffness: 400 }}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--modal-muted)",
                  cursor: "pointer",
                  padding: 0,
                  width: "28px",
                  height: "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                }}
              >
                <X size={17} />
              </motion.button>
            </div>

            {/* Admin console heading + subtitle, centered */}
            <div style={{ textAlign: "center", padding: "0 20px 14px" }}>
              <h3
                id="admin-modal-title"
                style={{
                  fontSize: "22px",
                  fontWeight: "700",
                  color: "var(--modal-text)",
                  margin: "0 0 4px",
                  letterSpacing: "-0.02em",
                }}
              >
                Admin console
              </h3>
              <p style={{ fontSize: "12px", color: "var(--modal-muted)", margin: "0 0 14px" }}>
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
                    padding: "3px 8px",
                    borderRadius: "7px",
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
                    padding: "3px 8px",
                    borderRadius: "7px",
                    background: "var(--modal-field-bg)",
                    color: "var(--modal-text)",
                    border: "1px solid var(--modal-border)",
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
                    padding: "3px 8px",
                    borderRadius: "7px",
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

            {/* Password / Email OTP Segmented tabs - curved rectangle */}
            <div
              style={{
                display: "flex",
                padding: "3px",
                background: "var(--modal-tab-track)",
                border: "1px solid var(--modal-border)",
                borderRadius: "10px",
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
                  background: activeMethod === "password" ? "var(--modal-tab-active-bg)" : "transparent",
                  color: activeMethod === "password" ? "var(--modal-tab-active-text)" : "var(--modal-muted)",
                  padding: "7px 12px",
                  borderRadius: "7px",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.18s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  boxShadow: activeMethod === "password" ? "0 1px 3px rgba(0,0,0,0.15)" : "none",
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
                  background: activeMethod === "otp" ? "var(--modal-tab-active-bg)" : "transparent",
                  color: activeMethod === "otp" ? "var(--modal-tab-active-text)" : "var(--modal-muted)",
                  padding: "7px 12px",
                  borderRadius: "7px",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.18s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  boxShadow: activeMethod === "otp" ? "0 1px 3px rgba(0,0,0,0.15)" : "none",
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
                        color: "var(--modal-text)",
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
                        background: "var(--modal-field-bg)",
                        border: "1px solid var(--modal-field-border)",
                        borderRadius: "8px",
                        height: "36px",
                      }}
                    >
                      <Mail
                        size={15}
                        color="var(--modal-muted)"
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
                          color: "var(--modal-text)",
                          fontSize: "13px",
                          fontWeight: "400",
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
                        color: "var(--modal-text)",
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
                        background: "var(--modal-field-bg)",
                        border: "1px solid var(--modal-field-border)",
                        borderRadius: "8px",
                        height: "36px",
                      }}
                    >
                      <Lock
                        size={15}
                        color="var(--modal-muted)"
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
                          color: "var(--modal-text)",
                          fontSize: "13px",
                          fontWeight: "400",
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
                          color: "var(--modal-muted)",
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
                        color: "var(--modal-muted)",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <input
                        id="modal-rememberMe"
                        type="checkbox"
                        style={{ accentColor: "var(--modal-btn-bg)" }}
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
                        color: "#3b82f6",
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
                      background: "var(--modal-btn-bg)",
                      color: "var(--modal-btn-text)",
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
                      boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!loading && lockoutTimer <= 0) {
                        e.currentTarget.style.background = "var(--modal-btn-hover)";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loading && lockoutTimer <= 0) {
                        e.currentTarget.style.background = "var(--modal-btn-bg)";
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
                            color: "var(--modal-text)",
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
                            background: "var(--modal-field-bg)",
                            border: "1px solid var(--modal-field-border)",
                            borderRadius: "8px",
                            height: "36px",
                          }}
                        >
                          <Mail
                            size={15}
                            color="var(--modal-muted)"
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
                              color: "var(--modal-text)",
                              fontSize: "13px",
                              fontWeight: "400",
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
                          color: "var(--modal-muted)",
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
                          background: "var(--modal-btn-bg)",
                          color: "var(--modal-btn-text)",
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
                            color: "var(--modal-text)",
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
                            background: "var(--modal-field-bg)",
                            border: "1px solid var(--modal-field-border)",
                            borderRadius: "8px",
                            height: "36px",
                          }}
                        >
                          <Shield
                            size={15}
                            color="var(--modal-muted)"
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
                              color: "var(--modal-text)",
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
                          background: "var(--modal-btn-bg)",
                          color: "var(--modal-btn-text)",
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
                            color: "var(--modal-muted)",
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
                            color: otpTimer > 0 ? "var(--modal-muted)" : "#22c55e",
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
                  color: "var(--modal-muted)",
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
