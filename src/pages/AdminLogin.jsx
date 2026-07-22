import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

/**
 * AdminLogin
 * Restyled to match the portfolio's design system with hardcoded dark mode colors.
 * Includes advanced security: Client-side lockout, TOTP challenge, Passkey support, and Telemetry logging.
 */

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60000; // 60 seconds

export default function AdminLogin() {
  const navigate = useNavigate();

  // Primary Auth State
  const [email, setEmail] = useState("");
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

  // Passkey State
  const [passkeySupported, setPasskeySupported] = useState(false);

  useEffect(() => {
    if (window.PublicKeyCredential) {
      setPasskeySupported(true);
    }
    checkLockoutStatus();
    
    // Countdown timer for lockout
    const interval = setInterval(() => {
      checkLockoutStatus();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const checkLockoutStatus = () => {
    const data = JSON.parse(localStorage.getItem(`admin_lockout_${email}`) || '{"count":0,"lockedUntil":0}');
    setAttempts(data.count);
    
    if (data.lockedUntil > Date.now()) {
      setLockoutTimer(Math.ceil((data.lockedUntil - Date.now()) / 1000));
    } else {
      setLockoutTimer(0);
      if (data.lockedUntil !== 0 && data.lockedUntil <= Date.now() && data.count >= MAX_ATTEMPTS) {
        // Reset count after lockout expires
        localStorage.setItem(`admin_lockout_${email}`, JSON.stringify({ count: 0, lockedUntil: 0 }));
        setAttempts(0);
      }
    }
  };

  const registerFailedAttempt = async () => {
    const data = JSON.parse(localStorage.getItem(`admin_lockout_${email}`) || '{"count":0,"lockedUntil":0}');
    const newCount = data.count + 1;
    let lockedUntil = 0;
    
    if (newCount >= MAX_ATTEMPTS) {
      lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
    }
    
    localStorage.setItem(`admin_lockout_${email}`, JSON.stringify({ count: newCount, lockedUntil }));
    checkLockoutStatus();

    // Log failure to telemetry
    await logTelemetry(null, email, false);
  };

  const resetLockout = () => {
    localStorage.removeItem(`admin_lockout_${email}`);
    setAttempts(0);
    setLockoutTimer(0);
  };

  const logTelemetry = async (userId, attemptedEmail, success) => {
    try {
      const userAgent = navigator.userAgent;
      let ip = "unknown";
      try {
        const res = await fetch("https://api.ipify.org?format=json");
        const data = await res.json();
        ip = data.ip;
      } catch (e) { /* ignore */ }

      await supabase.rpc('log_login_attempt', {
        p_user_id: userId,
        p_email: attemptedEmail,
        p_user_agent: userAgent,
        p_ip_address: ip,
        p_success: success
      });
    } catch (err) {
      console.error("Telemetry logging failed", err);
    }
  };

  const handlePostAuthSuccess = async (user) => {
    // Check if MFA is required (AAL2)
    const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    
    if (!aalError && aalData.currentLevel === 'aal1' && aalData.nextLevel === 'aal2') {
      // MFA required! Look up their enrolled factor
      const { data: factorsData } = await supabase.auth.mfa.listFactors();
      const totpFactor = factorsData?.all?.find(f => f.factor_type === 'totp' && f.status === 'verified');
      
      if (totpFactor) {
        setTotpFactorId(totpFactor.id);
        setMfaRequired(true);
        setLoading(false);
        return; // Halt transition, show MFA screen
      }
    }

    // Success and fully authenticated (or no MFA required)
    resetLockout();
    await logTelemetry(user.id, user.email, true);
    navigate("/admin/dashboard");
  };

  async function handlePasswordSubmit(e) {
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
      setError("Invalid email or password.");
      setLoading(false);
      await registerFailedAttempt();
      return;
    }

    await handlePostAuthSuccess(data.user);
  }

  async function handlePasskeySubmit() {
    if (lockoutTimer > 0) return;
    setError("");
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signInWithPasskey();
    
    if (authError) {
      setError("Passkey authentication failed.");
      setLoading(false);
      await registerFailedAttempt();
      return;
    }

    await handlePostAuthSuccess(data.user);
  }

  async function handleTotpSubmit(e) {
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
      setError("Invalid verification code.");
      setLoading(false);
      await registerFailedAttempt();
      return;
    }

    // TOTP verified successfully!
    const { data: { user } } = await supabase.auth.getUser();
    resetLockout();
    await logTelemetry(user.id, user.email, true);
    navigate("/admin/dashboard");
  }

  if (mfaRequired) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.iconBadge}><LockIcon size={20} color="#3b82f6" /></div>
          <h1 style={styles.title}>Two-Factor Auth</h1>
          <p style={styles.subtitle}>Enter the 6-digit code from your authenticator app.</p>
          
          <form onSubmit={handleTotpSubmit} noValidate>
            <label style={styles.label}>Verification Code</label>
            <div style={styles.inputWrap}>
              <input
                type="text"
                autoComplete="one-time-code"
                placeholder="000000"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                style={{ ...styles.input, textAlign: 'center', letterSpacing: '4px', fontSize: 18 }}
              />
            </div>
            {error && <p role="alert" style={styles.errorText}>{error}</p>}
            <button type="submit" disabled={loading || totpCode.length !== 6 || lockoutTimer > 0} style={styles.submitButton}>
              {loading ? "Verifying…" : lockoutTimer > 0 ? `Locked (${lockoutTimer}s)` : "Verify"}
              {!loading && lockoutTimer === 0 && <ArrowRightIcon size={14} />}
            </button>
            <button type="button" onClick={() => { setMfaRequired(false); supabase.auth.signOut(); }} style={styles.textButton}>
              Cancel and go back
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{`
        body { 
          background-color: #111111 !important; 
          margin: 0; 
          padding: 0; 
          zoom: 1 !important;
          min-height: 100vh;
        }
        #root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
      `}</style>
      <div style={styles.card}>
        <div style={styles.iconBadge}>
          <LockIcon size={20} color="#3b82f6" />
        </div>

        <h1 style={styles.title}>Admin Access</h1>
        <p style={styles.subtitle}>Secure login for portfolio management</p>

        {passkeySupported && (
          <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid #3f3f46" }}>
            <button type="button" onClick={handlePasskeySubmit} disabled={loading || lockoutTimer > 0} style={styles.passkeyButton}>
              <FingerprintIcon size={16} /> Sign in with Passkey
            </button>
            <p style={{ textAlign: "center", fontSize: 11, color: "#71717a", margin: "8px 0 0 0" }}>
              Only works if you have previously registered a passkey.
            </p>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} noValidate>
          <label htmlFor="admin-email" style={styles.label}>
            Email Address
          </label>
          <div style={styles.inputWrap}>
            <MailIcon size={15} color="#a1a1aa" />
            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              disabled={lockoutTimer > 0}
            />
          </div>

          <label htmlFor="admin-password" style={{ ...styles.label, marginTop: 16 }}>
            Password
          </label>
          <div style={styles.inputWrap}>
            <LockIcon size={14} color="#a1a1aa" />
            <input
              id="admin-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ ...styles.input, letterSpacing: showPassword ? "normal" : "2px" }}
              disabled={lockoutTimer > 0}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              style={styles.eyeButton}
              disabled={lockoutTimer > 0}
            >
              {showPassword ? <EyeOffIcon size={15} /> : <EyeIcon size={15} />}
            </button>
          </div>

          {attempts > 0 && attempts < MAX_ATTEMPTS && (
            <p style={styles.warningText}>
              {MAX_ATTEMPTS - attempts} attempts remaining before lockout.
            </p>
          )}

          {error && <p role="alert" style={styles.errorText}>{error}</p>}

          <button type="submit" disabled={loading || lockoutTimer > 0} style={{
            ...styles.submitButton,
            background: lockoutTimer > 0 ? '#3f3f46' : '#ffffff',
            color: lockoutTimer > 0 ? '#a1a1aa' : '#000000',
            cursor: lockoutTimer > 0 ? 'not-allowed' : 'pointer'
          }}>
            {loading ? "Signing in…" : lockoutTimer > 0 ? `Locked (${lockoutTimer}s)` : "Sign In"}
            {!loading && lockoutTimer === 0 && <ArrowRightIcon size={14} />}
          </button>
        </form>

        <p style={styles.footerNote}>Restricted access · authorized personnel only</p>
      </div>
    </div>
  );
}

/* ---------- Inline icons ---------- */

function FingerprintIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4" />
      <path d="M5 19.5C5.5 18 6 15 6 11.5a6 6 0 0 1 12 0c0 3.5.5 6.5 1 8.5" />
      <path d="M8.5 15.6a3.5 3.5 0 0 1 7 0" />
      <path d="M10 10.5a2 2 0 1 1 4 0" />
    </svg>
  );
}

function LockIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="5" y="11" width="14" height="9" rx="2" stroke={color} strokeWidth="1.8" />
      <path d="M8 11V7a4 4 0 018 0v4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function MailIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke={color} strokeWidth="1.8" />
      <path d="M3 7l9 6 9-6" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowRightIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M5 12h14M13 6l6 6-6 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EyeIcon({ size = 16, color = "#a1a1aa" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" stroke={color} strokeWidth="1.6" />
      <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.6" />
    </svg>
  );
}

function EyeOffIcon({ size = 16, color = "#a1a1aa" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3 3l18 18" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M10.6 5.1A10.6 10.6 0 0112 5c6.5 0 10 7 10 7a17.9 17.9 0 01-3.2 4.1M6.5 6.6C4 8.3 2 12 2 12s3.5 7 10 7a9.6 9.6 0 004.4-1" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.9 9.9a3 3 0 004.2 4.2" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const styles = {
  page: {
    position: "fixed",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    background: "#ffffff",
    fontFamily: "system-ui, -apple-system, sans-serif",
    zIndex: 9999
  },
  card: {
    width: 380,
    maxWidth: "100%",
    background: "#2a2a2a",
    borderRadius: 20,
    padding: 32,
    border: "1px solid #3f3f46",
    boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: "rgba(59, 130, 246, 0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 18px",
  },
  title: {
    textAlign: "center",
    fontSize: 21,
    fontWeight: 600,
    margin: "0 0 6px",
    color: "#ffffff",
    letterSpacing: -0.2,
  },
  subtitle: {
    textAlign: "center",
    fontSize: 13,
    color: "#a1a1aa",
    margin: "0 0 28px",
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: "#e4e4e7",
    display: "block",
    marginBottom: 6,
  },
  inputWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#1a1a1a",
    border: "1px solid #3f3f46",
    borderRadius: "8px",
    padding: "0 12px",
    height: 42,
  },
  input: {
    flex: 1,
    border: "none",
    background: "transparent",
    outline: "none",
    fontSize: 13,
    color: "#ffffff",
    height: "100%",
  },
  eyeButton: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    display: "flex",
    padding: 2,
    color: "#a1a1aa"
  },
  warningText: {
    fontSize: 12,
    color: "#f59e0b", // text-warning (amber)
    margin: "10px 0 0",
  },
  errorText: {
    fontSize: 12,
    color: "#ef4444",
    margin: "10px 0 0",
  },
  submitButton: {
    width: "100%",
    height: 44,
    borderRadius: "8px",
    border: "none",
    fontSize: 14,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 24,
  },
  passkeyButton: {
    width: "100%",
    height: 42,
    borderRadius: "8px",
    background: "rgba(255,255,255,0.05)",
    color: "#ffffff",
    border: "1px solid #3f3f46",
    fontSize: 14,
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    cursor: "pointer",
  },
  textButton: {
    width: "100%",
    background: "transparent",
    border: "none",
    color: "#a1a1aa",
    fontSize: 13,
    marginTop: 16,
    cursor: "pointer",
  },
  footerNote: {
    textAlign: "center",
    fontSize: 12,
    color: "#71717a",
    margin: "20px 0 0",
  },
};
