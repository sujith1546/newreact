import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useTheme } from "../context/ThemeContext";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Shield,
  Clock,
  Fingerprint,
  HelpCircle,
  Activity,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  X,
  MapPin,
  KeyRound,
  RefreshCw,
} from "lucide-react";

const ADMIN_LOGIN_STYLES = `
.admin-login-layout {
  --bg: #f8fafc;
  --sidebar-bg: #ffffff;
  --card-bg: #ffffff;
  --panel-2: #f1f5f9;
  --border: #e2e8f0;
  --border-subtle: #edf2f7;
  --border-strong: #cbd5e1;
  --text-main: #0f172a;
  --text-muted: #64748b;
  --text-dim: #94a3b8;
  --accent-green-bg: #ecfdf5;
  --accent-green-text: #059669;
  --accent-green-border: #a7f3d0;
  --accent-amber-bg: #fffbeb;
  --accent-amber-text: #d97706;
  --accent-amber-border: #fde68a;
  --accent-blue-bg: #eff6ff;
  --accent-blue-text: #2563eb;
  --accent-blue-border: #bfdbfe;
  --btn-primary-bg: #0f172a;
  --btn-primary-hover: #1e293b;
  --btn-primary-text: #ffffff;
  --card-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(15, 23, 42, 0.03);
  --sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --mono: 'IBM Plex Mono', monospace;
}

[data-theme="dark"] .admin-login-layout {
  --bg: #090d16;
  --sidebar-bg: #0e1422;
  --card-bg: #111827;
  --panel-2: #1e293b;
  --border: rgba(255, 255, 255, 0.09);
  --border-subtle: rgba(255, 255, 255, 0.05);
  --border-strong: rgba(255, 255, 255, 0.16);
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --text-dim: #64748b;
  --accent-green-bg: rgba(16, 185, 129, 0.12);
  --accent-green-text: #34d399;
  --accent-green-border: rgba(16, 185, 129, 0.25);
  --accent-amber-bg: rgba(245, 158, 11, 0.12);
  --accent-amber-text: #fbbf24;
  --accent-amber-border: rgba(245, 158, 11, 0.25);
  --accent-blue-bg: rgba(59, 130, 246, 0.12);
  --accent-blue-text: #60a5fa;
  --accent-blue-border: rgba(59, 130, 246, 0.25);
  --btn-primary-bg: #f8fafc;
  --btn-primary-hover: #ffffff;
  --btn-primary-text: #0f172a;
  --card-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05);
}

.admin-login-layout {
  font-family: var(--sans);
  background: var(--bg);
  color: var(--text-main);
  width: 100vw;
  height: 100vh;
  max-height: 100vh;
  display: flex;
  overflow: hidden !important;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  box-sizing: border-box;
  background-image:
    linear-gradient(var(--border-subtle) 1px, transparent 1px),
    linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px);
  background-size: 36px 36px;
  background-position: -1px -1px;
}

/* ─── SIDEBAR ─────────────────────────────────── */
.admin-sidebar {
  width: 220px;
  height: 100%;
  flex-shrink: 0;
  background: var(--sidebar-bg);
  border-right: 1px solid var(--border);
  padding: 16px 16px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.admin-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  overflow: hidden;
  border: 1.5px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--card-shadow);
  margin-bottom: 6px;
  flex-shrink: 0;
  background: var(--panel-2);
}
.admin-avatar img { width: 100%; height: 100%; object-fit: cover; }

.admin-name {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--text-main);
}

.admin-sub {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 1px;
  font-size: 11px;
  color: var(--text-muted);
}

.admin-divider {
  height: 1px;
  background: var(--border);
  margin: 10px 0 8px;
  flex-shrink: 0;
}

.admin-stats-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex-shrink: 0;
}

.admin-stat-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 0;
  font-size: 11px;
  color: var(--text-muted);
}

.pill-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 600;
  padding: 1.5px 7px;
  border-radius: 999px;
  white-space: nowrap;
}

.pill-green {
  background: var(--accent-green-bg);
  color: var(--accent-green-text);
  border: 1px solid var(--accent-green-border);
}

.pill-amber {
  background: var(--accent-amber-bg);
  color: var(--accent-amber-text);
  border: 1px solid var(--accent-amber-border);
}

.pill-neutral {
  background: var(--panel-2);
  color: var(--text-muted);
  border: 1px solid var(--border);
}

.pulse-bars-mini {
  display: flex;
  align-items: flex-end;
  gap: 1.5px;
  height: 9px;
}
.pulse-bar-mini {
  width: 2px;
  background: currentColor;
  border-radius: 1px;
  animation: pulse-height 1.6s ease-in-out infinite;
}
.pulse-bar-mini:nth-child(1) { height: 3px; animation-delay: 0s; }
.pulse-bar-mini:nth-child(2) { height: 8px; animation-delay: 0.15s; }
.pulse-bar-mini:nth-child(3) { height: 5px; animation-delay: 0.3s; }
.pulse-bar-mini:nth-child(4) { height: 9px; animation-delay: 0.45s; }

@keyframes pulse-height {
  0%, 100% { transform: scaleY(0.6); }
  50% { transform: scaleY(1); }
}

.admin-sidebar-actions {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding-top: 0;
  flex-shrink: 0;
}

.admin-ghost-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  color: var(--text-muted);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 5px 10px;
  font-size: 10.5px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}
.admin-ghost-btn:hover {
  background: var(--panel-2);
  color: var(--text-main);
  border-color: var(--border-strong);
}

.admin-sidebar-footer {
  margin-top: 12px;
  padding-top: 8px;
  border-top: 1px solid var(--border);
  font-size: 10px;
  color: var(--text-dim);
  display: flex;
  flex-direction: column;
  gap: 3px;
}

/* ─── MAIN AREA ───────────────────────────────── */
.admin-main-canvas {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden !important;
  min-width: 0;
}

/* ─── TOP BAR ─────────────────────────────────── */
.admin-top-bar {
  height: 38px;
  border-bottom: 1px solid var(--border);
  background: var(--sidebar-bg);
  padding: 0 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.admin-breadcrumb {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11.5px;
  color: var(--text-dim);
}
.admin-breadcrumb strong {
  color: var(--text-main);
  font-weight: 600;
}

.admin-top-pills {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* ─── CENTERED FORM CANVAS ────────────────────── */
.admin-form-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  overflow: hidden;
}

.admin-login-card {
  max-width: 380px;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.admin-title-wrap {
  text-align: center;
  margin-bottom: 10px;
}

.admin-card-title {
  font-size: 21px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text-main);
  margin: 0 0 2px;
}

.admin-card-subtitle {
  font-size: 12.5px;
  color: var(--text-muted);
  margin: 0;
}

/* ─── SEGMENTED PILL TABS ─────────────────────── */
.admin-pill-tabs {
  display: flex;
  padding: 3px;
  background: var(--panel-2);
  border: 1px solid var(--border);
  border-radius: 999px;
  margin-bottom: 10px;
}

.admin-pill-tab {
  flex: 1;
  border: none;
  background: transparent;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.18s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.admin-pill-tab.active {
  background: var(--btn-primary-bg);
  color: var(--btn-primary-text);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

/* ─── FORM CARD BOX ───────────────────────────── */
.admin-form-box {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px 18px;
  box-shadow: var(--card-shadow);
}

.admin-field {
  margin-bottom: 10px;
  text-align: left;
}

.admin-field label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 3px;
}

.admin-input-shell {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--panel-2);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0 10px;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.admin-input-shell:focus-within {
  border-color: var(--border-strong);
  box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.04);
}

[data-theme="dark"] .admin-input-shell:focus-within {
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.06);
}

.admin-input-shell.error {
  border-color: #ef4444;
}

.admin-input-shell input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-main);
  font-family: var(--sans);
  font-size: 13px;
  padding: 7px 0;
}

.admin-input-shell input::placeholder {
  color: var(--text-dim);
}

.admin-input-icon {
  color: var(--text-dim);
  flex-shrink: 0;
}

.admin-vis-toggle {
  background: none;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
  padding: 2px;
  display: flex;
}
.admin-vis-toggle:hover { color: var(--text-muted); }

.admin-form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 6px 0 10px;
}

.admin-remember-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11.5px;
  color: var(--text-muted);
  cursor: pointer;
}

.admin-forgot-link {
  font-size: 11.5px;
  color: var(--text-muted);
  text-decoration: none;
}
.admin-forgot-link:hover {
  color: var(--text-main);
  text-decoration: underline;
}

/* ─── PRIMARY SUBMIT BUTTON ───────────────────── */
.admin-submit-btn {
  width: 100%;
  background: var(--btn-primary-bg);
  color: var(--btn-primary-text);
  font-family: var(--sans);
  font-weight: 600;
  font-size: 12.5px;
  padding: 9px 14px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.15s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.admin-submit-btn:hover:not(:disabled) {
  opacity: 0.92;
  transform: translateY(-1px);
}

.admin-submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.admin-card-footer-note {
  margin-top: 8px;
  font-size: 10px;
  color: var(--text-dim);
  text-align: center;
}

/* ─── RESPONSIVE ──────────────────────────────── */
@media (max-width: 860px) {
  .admin-login-layout {
    flex-direction: column;
    overflow-y: auto !important;
    position: relative;
    height: auto;
    min-height: 100vh;
  }
  .admin-sidebar {
    width: 100%;
    height: auto;
    border-right: none;
    border-bottom: 1px solid var(--border);
    flex-direction: row;
    align-items: center;
    gap: 12px;
    padding: 12px 18px;
  }
  .admin-avatar { width: 36px; height: 36px; margin-bottom: 0; }
  .admin-name { font-size: 13.5px; }
  .admin-sub { display: none; }
  .admin-divider { display: none; }
  .admin-stats-list, .admin-sidebar-actions, .admin-sidebar-footer { display: none; }
  .admin-top-bar { padding: 0 16px; }
  .admin-top-pills { display: none; }
  .admin-form-container { padding: 24px 16px 40px; }
}
`;

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60000;

export default function AdminLogin() {
  const navigate = useNavigate();
  const { theme } = useTheme();

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

  // Telemetry & Modals
  const [pingMs, setPingMs] = useState(18);
  const [currentTime, setCurrentTime] = useState("");
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Mount effect to handle admin-mode zoom immunity
  useEffect(() => {
    document.documentElement.classList.add("admin-mode");
    document.body.classList.add("admin-mode");
    return () => {
      document.documentElement.classList.remove("admin-mode");
      document.body.classList.remove("admin-mode");
    };
  }, []);

  // Clock Update
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Latency ping
  useEffect(() => {
    const measurePing = async () => {
      const start = performance.now();
      try {
        await supabase.from("site_settings").select("id").limit(1);
        setPingMs(Math.round(performance.now() - start));
      } catch {
        setPingMs(24);
      }
    };
    measurePing();
  }, []);

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
        const remainingTime = Math.ceil((parseInt(lockoutExpiry, 10) - Date.now()) / 1000);
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

      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-layout">
      <style>{ADMIN_LOGIN_STYLES}</style>

      {/* ── LEFT SIDEBAR ── */}
      <aside className="admin-sidebar">
        <div className="admin-avatar">
          <img
            src="/profile_photo.png"
            alt="Sujith Thota"
            onError={(e) => { e.target.style.display = "none"; }}
          />
        </div>

        <div className="admin-name">Sujith Thota</div>
        <div className="admin-sub">
          <MapPin size={12} />
          <span>Admin Console · {currentTime}</span>
        </div>

        <div className="admin-divider" />

        <div className="admin-stats-list">
          <div className="admin-stat-row">
            <span>Session</span>
            <span className="pill-badge pill-amber">None</span>
          </div>
          <div className="admin-stat-row">
            <span>Passkey</span>
            <span className="pill-badge pill-green">Reachable</span>
          </div>
          <div className="admin-stat-row">
            <span>Latency</span>
            <span className="pill-badge pill-green">
              <span className="pulse-bars-mini">
                <span className="pulse-bar-mini" />
                <span className="pulse-bar-mini" />
                <span className="pulse-bar-mini" />
                <span className="pulse-bar-mini" />
              </span>
              <span>{pingMs}ms</span>
            </span>
          </div>
          <div className="admin-stat-row">
            <span>Encryption</span>
            <span className="pill-badge pill-green">TLS 1.3</span>
          </div>
        </div>

        <div className="admin-sidebar-actions">
          <button
            className="admin-ghost-btn"
            type="button"
            onClick={() => setShowHelpModal(true)}
          >
            <HelpCircle size={13} />
            <span>Need help?</span>
          </button>
          <button
            className="admin-ghost-btn"
            type="button"
            onClick={() => setShowStatusModal(true)}
          >
            <Activity size={13} />
            <span>Status page</span>
          </button>
        </div>

        <div className="admin-sidebar-footer">
          <span style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--accent-green-text)", fontWeight: 600 }}>
            <Shield size={11} />
            <span>Session secured</span>
          </span>
          <span>© {new Date().getFullYear()} Sujith Thota</span>
        </div>
      </aside>

      {/* ── MAIN CANVAS ── */}
      <main className="admin-main-canvas">
        {/* Top bar */}
        <header className="admin-top-bar">
          <div className="admin-breadcrumb">
            <span>Admin</span>
            <span>/</span>
            <strong>Sign in</strong>
          </div>

          <div className="admin-top-pills">
            <span className="pill-badge pill-green">
              <Lock size={11} />
              <span>TLS 1.3</span>
            </span>
            <span className="pill-badge pill-neutral">
              <Fingerprint size={11} />
              <span>Passkey ready</span>
            </span>
            <span className="pill-badge pill-amber">
              <Clock size={11} />
              <span>Rate limited</span>
            </span>
          </div>
        </header>

        {/* Centered Form */}
        <div className="admin-form-container">
          <div className="admin-login-card">
            <div className="admin-title-wrap">
              <h1 className="admin-card-title">Admin console</h1>
              <p className="admin-card-subtitle">Sign in to manage the site</p>
            </div>

            {/* Segmented Pill Tabs */}
            <div className="admin-pill-tabs">
              <button
                type="button"
                className={`admin-pill-tab ${activeMethod === "password" ? "active" : ""}`}
                onClick={() => { setError(""); setActiveMethod("password"); }}
              >
                <KeyRound size={13} />
                <span>Password</span>
              </button>
              <button
                type="button"
                className={`admin-pill-tab ${activeMethod === "otp" ? "active" : ""}`}
                onClick={() => { setError(""); setActiveMethod("otp"); }}
              >
                <Mail size={13} />
                <span>Email OTP</span>
              </button>
            </div>

            {/* Form Box */}
            <div className="admin-form-box">
              {error && (
                <div style={{
                  padding: "8px 12px",
                  background: "rgba(239,68,68,0.1)",
                  color: "#ef4444",
                  borderRadius: "8px",
                  fontSize: "12px",
                  marginBottom: "12px",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}>
                  <AlertTriangle size={13} />
                  <span>{error}</span>
                </div>
              )}

              {attempts > 0 && attempts < MAX_ATTEMPTS && (
                <div style={{
                  padding: "6px 10px",
                  background: "var(--accent-amber-bg)",
                  color: "var(--accent-amber-text)",
                  borderRadius: "8px",
                  fontSize: "11.5px",
                  marginBottom: "12px",
                  fontWeight: 500,
                }}>
                  {MAX_ATTEMPTS - attempts} attempts remaining before lockout.
                </div>
              )}

              {/* PASSWORD TAB VIEW */}
              {activeMethod === "password" && (
                <form onSubmit={handlePasswordSubmit} noValidate>
                  <div className="admin-field">
                    <label htmlFor="email">Email address</label>
                    <div className={`admin-input-shell ${error ? "error" : ""}`}>
                      <Mail size={14} className="admin-input-icon" />
                      <input
                        id="email"
                        type="email"
                        placeholder="sujithreddy1546@gmail.com"
                        autoComplete="username"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={lockoutTimer > 0}
                      />
                    </div>
                  </div>

                  <div className="admin-field">
                    <label htmlFor="password">Password</label>
                    <div className={`admin-input-shell ${error ? "error" : ""}`}>
                      <Lock size={14} className="admin-input-icon" />
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={lockoutTimer > 0}
                      />
                      <button
                        type="button"
                        className="admin-vis-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div className="admin-form-options">
                    <label className="admin-remember-label" htmlFor="rememberMe">
                      <input id="rememberMe" type="checkbox" style={{ accentColor: "var(--text-main)" }} />
                      <span>Remember me</span>
                    </label>
                    <a className="admin-forgot-link" href="#forgot" onClick={(e) => { e.preventDefault(); setActiveMethod("otp"); }}>
                      Forgot?
                    </a>
                  </div>

                  <button
                    className="admin-submit-btn"
                    type="submit"
                    disabled={loading || lockoutTimer > 0}
                  >
                    <span>{loading ? "Signing in..." : lockoutTimer > 0 ? `Locked (${lockoutTimer}s)` : "Sign in"}</span>
                    <ArrowRight size={14} />
                  </button>
                </form>
              )}

              {/* EMAIL OTP TAB VIEW */}
              {activeMethod === "otp" && (
                <div>
                  {!emailOtpSent ? (
                    <form onSubmit={handleSendEmailOtp} noValidate>
                      <div className="admin-field">
                        <label htmlFor="otpEmail">Registered Admin Email</label>
                        <div className="admin-input-shell">
                          <Mail size={14} className="admin-input-icon" />
                          <input
                            id="otpEmail"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <p style={{ fontSize: "11.5px", color: "var(--text-muted)", margin: "0 0 14px", lineHeight: 1.45 }}>
                        A one-time 6-digit security code will be sent directly to your verified inbox.
                      </p>

                      <button
                        className="admin-submit-btn"
                        type="submit"
                        disabled={loading || lockoutTimer > 0}
                      >
                        <span>{loading ? "Sending Code..." : "Send 6-digit OTP"}</span>
                        <ArrowRight size={14} />
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyEmailOtp} noValidate>
                      <div className="admin-field">
                        <label htmlFor="otpCode">6-digit Security PIN</label>
                        <div className={`admin-input-shell ${error ? "error" : ""}`}>
                          <Shield size={14} className="admin-input-icon" />
                          <input
                            id="otpCode"
                            type="text"
                            maxLength={6}
                            value={emailOtpCode}
                            onChange={(e) => setEmailOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            placeholder="000 000"
                            style={{ textAlign: "center", letterSpacing: "4px", fontWeight: 700, fontSize: "15px" }}
                            autoFocus
                          />
                        </div>
                      </div>

                      <button
                        className="admin-submit-btn"
                        type="submit"
                        style={{ marginTop: "12px" }}
                        disabled={loading || emailOtpCode.length !== 6 || lockoutTimer > 0}
                      >
                        <span>{loading ? "Verifying..." : "Verify & Sign in"}</span>
                        <ArrowRight size={14} />
                      </button>

                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", fontSize: "11.5px" }}>
                        <button
                          type="button"
                          onClick={() => setEmailOtpSent(false)}
                          style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                        >
                          ← Back
                        </button>
                        <button
                          type="button"
                          onClick={handleSendEmailOtp}
                          disabled={otpTimer > 0 || loading}
                          style={{ background: "none", border: "none", color: otpTimer > 0 ? "var(--text-dim)" : "var(--accent-green-text)", fontWeight: 600, cursor: otpTimer > 0 ? "not-allowed" : "pointer" }}
                        >
                          {otpTimer > 0 ? `Resend in ${otpTimer}s` : "Resend code"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>

            <p className="admin-card-footer-note">
              Restricted access · authorized personnel only
            </p>
          </div>
        </div>
      </main>

      {/* ── MFA MODAL ── */}
      {mfaRequired && (
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 10000,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}>
          <div style={{
            background: "var(--card-bg)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            maxWidth: 380,
            width: "100%",
            padding: 24,
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            color: "var(--text-main)",
            textAlign: "center",
          }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "var(--panel-2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
            }}>
              <Lock size={20} />
            </div>
            <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700 }}>Two-Factor Auth</h3>
            <p style={{ margin: "0 0 16px", fontSize: 12.5, color: "var(--text-muted)" }}>
              Enter the 6-digit code from your authenticator app.
            </p>

            <form onSubmit={handleTotpSubmit} noValidate>
              <div className="admin-input-shell" style={{ marginBottom: 12 }}>
                <input
                  type="text"
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000 000"
                  style={{ textAlign: "center", letterSpacing: "5px", fontSize: "16px", fontWeight: 700 }}
                  autoFocus
                />
              </div>

              {error && <p style={{ color: "#ef4444", fontSize: 12, margin: "0 0 10px" }}>{error}</p>}

              <button
                type="submit"
                className="admin-submit-btn"
                disabled={loading || totpCode.length !== 6 || lockoutTimer > 0}
              >
                <span>{loading ? "Verifying..." : "Verify Code"}</span>
                <ArrowRight size={14} />
              </button>

              <button
                type="button"
                onClick={() => { setMfaRequired(false); supabase.auth.signOut(); }}
                style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 12, marginTop: 12, cursor: "pointer" }}
              >
                Cancel and go back
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── HELP MODAL ── */}
      {showHelpModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 10000,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}>
          <div style={{
            background: "var(--card-bg)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            maxWidth: 400,
            width: "100%",
            padding: 24,
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            color: "var(--text-main)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <HelpCircle size={18} color="#3b82f6" />
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Admin Help</h3>
              </div>
              <button onClick={() => setShowHelpModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-dim)" }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12.5 }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "var(--panel-2)", borderRadius: 8 }}>
                <span>Command Palette</span>
                <kbd style={{ fontFamily: "var(--mono)", fontSize: 11, background: "var(--card-bg)", padding: "1px 6px", borderRadius: 4, border: "1px solid var(--border)" }}>Ctrl + K</kbd>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "var(--panel-2)", borderRadius: 8 }}>
                <span>Theme Mode</span>
                <kbd style={{ fontFamily: "var(--mono)", fontSize: 11, background: "var(--card-bg)", padding: "1px 6px", borderRadius: 4, border: "1px solid var(--border)" }}>Shift + T</kbd>
              </div>
            </div>

            <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid var(--border)", fontSize: 11.5, color: "var(--text-muted)" }}>
              Contact <a href="mailto:sujithreddy1546@gmail.com" style={{ color: "var(--text-main)", textDecoration: "underline" }}>sujithreddy1546@gmail.com</a> for emergency access.
            </div>
          </div>
        </div>
      )}

      {/* ── STATUS MODAL ── */}
      {showStatusModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 10000,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}>
          <div style={{
            background: "var(--card-bg)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            maxWidth: 420,
            width: "100%",
            padding: 24,
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            color: "var(--text-main)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Activity size={18} color="#10b981" />
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>System Status</h3>
              </div>
              <button onClick={() => setShowStatusModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-dim)" }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12.5 }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", background: "var(--panel-2)", borderRadius: 8 }}>
                <span>Database Connection</span>
                <span className="pill-badge pill-green">Connected</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", background: "var(--panel-2)", borderRadius: 8 }}>
                <span>Auth Edge Latency</span>
                <span style={{ fontFamily: "var(--mono)", fontWeight: 600 }}>{pingMs}ms</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", background: "var(--panel-2)", borderRadius: 8 }}>
                <span>Hardware Trust</span>
                <span>TPM 2.0 Active</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
