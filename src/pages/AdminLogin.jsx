import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useTheme } from "../context/ThemeContext";

const ADMIN_LOGIN_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

.login-page-container {
  --bg: #ffffff;
  --sidebar-bg: #fafaf9;
  --card-bg: #ffffff;
  --border: #e7e7e4;
  --border-strong: #d8d8d4;
  --text: #111114;
  --text-muted: #6b7280;
  --text-dim: #9ca3af;
  --green: #16a34a;
  --green-soft: #ecfdf3;
  --amber: #d97706;
  --black: #111111;
  --black-hover: #262626;
  --shadow: 0 1px 2px rgba(0,0,0,0.04), 0 8px 24px -12px rgba(0,0,0,0.08);
  --sans: 'Inter', -apple-system, sans-serif;
  --mono: 'JetBrains Mono', 'SF Mono', Consolas, monospace;
  --radius-lg: 20px;
  --radius-md: 14px;
  --radius-sm: 10px;
}

[data-theme="dark"] .login-page-container {
  --bg: #0b0d10;
  --sidebar-bg: #111316;
  --card-bg: #14171b;
  --border: #23262b;
  --border-strong: #2d3138;
  --text: #f2f2f0;
  --text-muted: #9aa1ab;
  --text-dim: #6b7280;
  --green: #22c55e;
  --green-soft: rgba(34,197,94,0.1);
  --black: #f2f2f0;
  --black-hover: #ffffff;
  --shadow: 0 1px 2px rgba(0,0,0,0.3), 0 8px 24px -12px rgba(0,0,0,0.5);
}

.login-page-container {
  font-family: var(--sans);
  background: var(--bg);
  color: var(--text);
  width: 100vw;
  height: 100vh;
  display: flex;
  transition: background .25s ease, color .25s ease;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
}

@media (min-width: 1025px) {
  .login-page-container {
    width: 133.333333vw;
    height: 133.333333vh;
  }
}

@media (prefers-reduced-motion: reduce){
  .login-page-container *{ animation-duration:0.01ms !important; transition-duration:0.01ms !important; }
}

.login-page-container a { color:inherit; }
.login-page-container button { font-family:inherit; cursor:pointer; }

.login-sidebar{
  width:300px;
  height: 100%;
  flex-shrink:0;
  background:var(--sidebar-bg);
  border-right:1px solid var(--border);
  padding:28px 28px;
  display:flex;
  flex-direction:column;
  overflow:hidden;
  transition:background .25s ease, border-color .25s ease;
}

.login-avatar{
  width:64px; height:64px;
  border-radius:50%;
  background:linear-gradient(135deg,#c7b8e8 0%, #8fa8d8 100%);
  display:flex; align-items:center; justify-content:center;
  box-shadow:var(--shadow);
  margin-bottom:16px;
  flex-shrink:0;
}
.login-avatar svg{ width:24px; height:24px; stroke:#fff; }

.side-name{ font-size:18px; font-weight:700; letter-spacing:-0.01em; }
.side-sub{
  display:flex; align-items:center; gap:6px;
  margin-top:5px;
  font-size:12.5px;
  color:var(--text-muted);
}
.side-sub svg{ width:13px; height:13px; stroke:var(--text-dim); flex-shrink:0; }

.side-divider{ height:1px; background:var(--border); margin:20px 0 14px; flex-shrink:0; }

.status-list{ display:flex; flex-direction:column; gap:2px; flex-shrink:0; }
.status-row{
  display:flex; align-items:center; justify-content:space-between;
  padding:7px 4px;
  font-size:12px;
  font-weight:600;
  letter-spacing:0.02em;
  color:var(--text);
  text-transform:uppercase;
}
.status-tag{
  display:flex; align-items:center; gap:6px;
  font-family:var(--mono);
  font-size:10.5px;
  font-weight:500;
  letter-spacing:0;
  text-transform:none;
  color:var(--green);
}
.status-tag .sdot{ width:6px; height:6px; border-radius:50%; background:var(--green); flex-shrink:0; }
.status-tag.pending{ color:var(--amber); }
.status-tag.pending .sdot{ background:var(--amber); }

.side-actions{ margin-top:auto; display:flex; flex-direction:column; gap:8px; padding-top:16px; flex-shrink:0; }

.btn-black{
  display:flex; align-items:center; justify-content:center; gap:8px;
  background:var(--black); color:var(--bg);
  border:none; border-radius:999px;
  padding:10px 18px;
  font-size:13px; font-weight:600;
  transition:background .15s ease, transform .12s ease;
}
.btn-black:hover{ background:var(--black-hover); }
.btn-black:active{ transform:scale(0.98); }
.btn-black svg{ width:14px; height:14px; }
[data-theme="dark"] .btn-black svg{ stroke:#0b0d10; }
.btn-black svg{ stroke:#fff; }

.btn-outline{
  display:flex; align-items:center; justify-content:center; gap:8px;
  background:transparent; color:var(--text);
  border:1px solid var(--border-strong); border-radius:999px;
  padding:10px 18px;
  font-size:13px; font-weight:600;
  transition:border-color .15s ease, background .15s ease;
}
.btn-outline:hover{ background:var(--card-bg); border-color:var(--text-dim); }
.btn-outline svg{ width:14px; height:14px; stroke:currentColor; }

.side-socials{ display:flex; gap:10px; margin-top:16px; flex-shrink:0; }
.social-btn{
  width:32px; height:32px;
  border:1px solid var(--border); border-radius:9px;
  display:flex; align-items:center; justify-content:center;
  background:var(--card-bg);
  transition:border-color .15s ease;
}
.social-btn:hover{ border-color:var(--text-dim); }
.social-btn svg{ width:14px; height:14px; stroke:var(--text-muted); }

.side-footer{ margin-top:14px; font-size:11px; color:var(--text-dim); line-height:1.5; flex-shrink:0; }

.login-main{
  flex:1;
  height: 100%;
  position:relative;
  padding:24px 56px;
  display:flex;
  flex-direction:column;
  justify-content:center;
  overflow:hidden;
  min-width:0;
}

.utility-bar{
  position:absolute;
  top:24px; right:56px;
  display:flex; align-items:center; gap:10px;
  z-index:2;
}
.u-btn{
  display:flex; align-items:center; gap:6px;
  height:36px; padding:0 12px;
  border:1px solid var(--border); border-radius:999px;
  background:var(--card-bg);
  font-size:12px; color:var(--text-muted);
  font-weight:500;
}
.u-btn kbd{
  font-family:var(--mono);
  font-size:10.5px;
  background:var(--sidebar-bg);
  border:1px solid var(--border);
  border-radius:4px;
  padding:1px 5px;
}
.u-btn.secure{ color:var(--green); font-weight:600; }
.u-btn .sdot{ width:6px; height:6px; border-radius:50%; background:var(--green); }
.icon-btn{
  width:36px; height:36px;
  border:1px solid var(--border); border-radius:999px;
  background:var(--card-bg);
  display:flex; align-items:center; justify-content:center;
}
.icon-btn svg{ width:15px; height:15px; stroke:var(--text-muted); }
.icon-btn:hover svg{ stroke:var(--text); }
.theme-toggle{ display:flex; border:1px solid var(--border); border-radius:999px; overflow:hidden; background:var(--card-bg); }
.theme-toggle button{
  width:34px; height:34px; border:none; background:transparent;
  display:flex; align-items:center; justify-content:center;
}
.theme-toggle button svg{ width:15px; height:15px; stroke:var(--text-dim); }
.theme-toggle button.active{ background:var(--sidebar-bg); }
.theme-toggle button.active svg{ stroke:var(--text); }

.login-content{
  max-width:520px;
  margin:0 auto;
  width:100%;
}

.eyebrow{
  font-size:12px; font-weight:600; letter-spacing:0.1em;
  color:var(--text-dim); text-transform:uppercase;
}

.headline{
  margin-top:8px;
  font-size:36px; font-weight:800; letter-spacing:-0.02em;
  line-height:1.08;
}

.term-pill{
  display:inline-flex; align-items:center; gap:9px;
  margin-top:14px;
  padding:7px 14px;
  border:1px solid var(--border); border-radius:999px;
  background:var(--card-bg);
  font-family:var(--mono); font-size:12.5px; color:var(--text);
}
.term-pill .prompt{ color:var(--green); font-weight:700; }

.lede{
  margin-top:12px;
  font-size:14px; color:var(--text-muted); line-height:1.5;
}

.method-row{
  display:flex; gap:10px;
  margin-top:20px;
}
.method-card{
  flex:1;
  border:1px solid var(--border); border-radius:var(--radius-md);
  background:var(--card-bg);
  padding:12px 12px;
  display:flex; flex-direction:column; gap:8px;
  transition:border-color .15s ease, transform .12s ease, box-shadow .15s ease;
  text-align:left;
  color:var(--text);
}
.method-card:hover{ border-color:var(--border-strong); transform:translateY(-1px); }
.method-card.active{ border-color:var(--text); box-shadow:var(--shadow); }
.method-icon{
  width:30px; height:30px; border-radius:8px;
  border:1px solid var(--border);
  display:flex; align-items:center; justify-content:center;
  background:var(--sidebar-bg);
}
.method-card.active .method-icon{ background:var(--text); border-color:var(--text); }
.method-card.active .method-icon svg{ stroke:var(--bg); }
.method-icon svg{ width:14px; height:14px; stroke:var(--text-muted); }
.method-label{ font-size:12.5px; font-weight:600; }
.method-sub{ font-size:10.5px; color:var(--text-dim); }

.form-panel{
  margin-top:18px;
  border:1px solid var(--border); border-radius:var(--radius-lg);
  background:var(--card-bg);
  padding:20px 22px;
  box-shadow:var(--shadow);
}

.field{ margin-bottom:12px; }
.field:last-of-type{ margin-bottom:0; }
.field label{
  display:block; font-size:12px; font-weight:600; color:var(--text-muted);
  margin-bottom:6px;
}
.input-shell{
  display:flex; align-items:center; gap:10px;
  background:var(--sidebar-bg);
  border:1px solid var(--border); border-radius:var(--radius-sm);
  padding:0 14px;
  transition:border-color .15s ease, box-shadow .15s ease;
}
.input-shell.error {
  border-color: #ef4444;
}
.input-shell:focus-within{
  border-color:var(--text-dim);
  box-shadow:0 0 0 3px rgba(0,0,0,0.04);
}
.input-shell.error:focus-within {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239,68,68,0.1);
}
[data-theme="dark"] .input-shell:focus-within{ box-shadow:0 0 0 3px rgba(255,255,255,0.06); }
.input-shell svg{ width:15px; height:15px; stroke:var(--text-dim); flex-shrink:0; }
.input-shell input{
  flex:1; background:transparent; border:none; outline:none;
  color:var(--text); font-family:var(--sans); font-size:13.5px; padding:10px 0;
}
.input-shell input::placeholder{ color:var(--text-dim); }
.input-shell input:disabled { color: var(--text-muted); opacity: 0.7; }
.toggle-vis{ background:none; border:none; padding:4px; display:flex; color:var(--text-dim); }
.toggle-vis:hover{ color:var(--text-muted); }
.toggle-vis svg{ width:15px; height:15px; stroke:currentColor; }

.row-between{
  display:flex; align-items:center; justify-content:space-between;
  margin:10px 0 14px;
}
.remember{ display:flex; align-items:center; gap:7px; font-size:12.5px; color:var(--text-muted); }
.remember input{ accent-color:var(--text); width:14px; height:14px; }
.caps-warn{
  display:flex; align-items:center; gap:5px;
  font-size:11.5px; color:var(--amber);
  opacity:0; transition:opacity .15s ease;
}
.caps-warn.show{ opacity:1; }
.caps-warn svg{ width:12px; height:12px; stroke:var(--amber); }
.forgot{ font-size:12.5px; color:var(--text-muted); text-decoration:none; }
.forgot:hover{ color:var(--text); }

.submit-btn{
  width:100%;
  display:flex; align-items:center; justify-content:center; gap:8px;
  background:var(--black); color:var(--bg);
  border:none; border-radius:999px;
  padding:11px 16px;
  font-size:14px; font-weight:700;
  transition:background .15s ease, transform .12s ease;
}
.submit-btn svg{ width:15px; height:15px; stroke:var(--bg); transition:transform .18s ease; }
.submit-btn:hover:not(:disabled){ background:var(--black-hover); }
.submit-btn:hover:not(:disabled) svg{ transform:translateX(3px); }
.submit-btn:active:not(:disabled){ transform:scale(0.99); }
.submit-btn:disabled{ opacity: 0.7; cursor: not-allowed; }

.passkey-panel{ display:flex; flex-direction:column; align-items:center; text-align:center; padding:10px 8px; gap:10px; }
.passkey-panel .pk-icon{
  width:44px; height:44px; border-radius:12px;
  background:var(--sidebar-bg); border:1px solid var(--border);
  display:flex; align-items:center; justify-content:center;
}
.passkey-panel .pk-icon svg{ width:19px; height:19px; stroke:var(--text); }
.passkey-panel h3{ font-size:14.5px; font-weight:700; }
.passkey-panel p{ font-size:12.5px; color:var(--text-muted); max-width:280px; line-height:1.45; }
.passkey-panel + .submit-btn{ margin-top:4px; }

.magic-panel{ text-align:left; }

.footer-trust{
  margin-top:14px;
  display:flex; align-items:center; justify-content:center; gap:16px;
}
.trust-item{
  display:flex; align-items:center; gap:5px;
  font-family:var(--mono); font-size:10px; color:var(--text-dim);
}
.trust-item svg{ width:11px; height:11px; stroke:var(--text-dim); }

.foot-note{
  margin-top:14px;
  font-size:11.5px; color:var(--text-dim); text-align:center;
}

@media (max-width: 900px){
  .login-page-container { height:100dvh; overflow:hidden; flex-direction:column; position: fixed; top: 0; left: 0; right: 0; bottom: 0; }
  .login-sidebar{ width:100%; height:auto; overflow:visible; border-right:none; border-bottom:1px solid var(--border); flex-direction:row; align-items:center; gap:12px; padding:16px 20px; }
  .login-avatar{ width:40px; height:40px; margin-bottom:0; }
  .side-name{ font-size:14px; margin-top:0; }
  .side-sub{ display:none; }
  .side-divider{ display:none; }
  .status-list, .side-actions, .side-footer{ display:none; }
  .side-socials{ margin-top:0; margin-left:auto; }
  .login-main{ flex: 1; height:auto; overflow-y:auto; padding:20px; justify-content:center; align-items:center; }
  .utility-bar{ display: none; }
  .login-content{ margin-top:0; max-width:400px; width:100%; display:flex; flex-direction:column; }
  .headline{ font-size:26px; margin-top:4px; }
  .lede{ font-size:13px; margin-top:8px; margin-bottom: 12px; }
  .term-pill{ display: none; }
  .method-row{ flex-direction:row; flex-wrap:nowrap; gap:8px; margin-top:12px; }
  .method-card{ padding:10px 8px; gap:4px; align-items:center; text-align:center; }
  .method-icon{ width:26px; height:26px; }
  .method-icon svg{ width:12px; height:12px; }
  .method-label{ font-size: 11px; }
  .method-sub{ display:none; }
  .form-panel{ margin-top:16px; }
  .input-label{ font-size:10px; }
  .input-field{ padding:10px 12px; font-size:14px; }
  .submit-btn{ padding:10px 14px; font-size:13px; margin-top:12px; }
  .footer-trust{ margin-top:20px; flex-wrap:wrap; gap:10px; }
  .foot-note{ margin-top:10px; font-size:10px; }
}

.mfa-container {
  max-width: 400px;
  margin: auto;
  text-align: center;
}
.mfa-icon {
  width: 44px; height: 44px; border-radius: 12px;
  background: var(--sidebar-bg); border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 16px;
}
.mfa-icon svg { stroke: var(--text); }
.mfa-title { font-size: 24px; font-weight: 800; margin-bottom: 8px; }
.mfa-subtitle { font-size: 14px; color: var(--text-muted); margin-bottom: 24px; line-height: 1.5; }
`;

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60000; // 60 seconds

export default function AdminLogin() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

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
  
  // UI State
  const [activeMethod, setActiveMethod] = useState("passkey");
  const [currentTime, setCurrentTime] = useState("");
  const [greeting, setGreeting] = useState("GOOD AFTERNOON");
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  useEffect(() => {
    if (window.PublicKeyCredential) {
      setPasskeySupported(true);
    } else {
      setActiveMethod("password"); // fallback if not supported
    }
    
    checkLockoutStatus();
    const interval = setInterval(() => {
      checkLockoutStatus();
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' }));
      const h = now.getHours();
      setGreeting(h < 12 ? 'GOOD MORNING' : h < 17 ? 'GOOD AFTERNOON' : 'GOOD EVENING');
    };
    updateClock();
    const clockInterval = setInterval(updateClock, 30000);
    return () => clearInterval(clockInterval);
  }, []);

  const checkLockoutStatus = () => {
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
    await logTelemetry(user.id, user.email, true);
    navigate("/admin/dashboard");
  };

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
      setError("Invalid email or password.");
      setLoading(false);
      await registerFailedAttempt();
      return;
    }

    await handlePostAuthSuccess(data.user);
  };

  const handlePasskeySubmit = async () => {
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
  };

  const handleMagicLinkSubmit = async (e) => {
    e.preventDefault();
    if (lockoutTimer > 0) return;
    setError("");
    if (!email) {
      setError("Please enter an email address.");
      return;
    }
    setLoading(true);
    
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin + "/admin/dashboard",
      }
    });

    if (authError) {
      setError("Failed to send magic link.");
      setLoading(false);
      return;
    }
    
    setMagicLinkSent(true);
    setLoading(false);
  };

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
      setError("Invalid verification code.");
      setLoading(false);
      await registerFailedAttempt();
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    resetLockout();
    await logTelemetry(user.id, user.email, true);
    navigate("/admin/dashboard");
  };

  const onKeyUp = (e) => {
    if (typeof e.getModifierState === 'function') {
      setCapsLockOn(e.getModifierState('CapsLock'));
    }
  };

  if (mfaRequired) {
    return (
      <div className="login-page-container">
        <style>{ADMIN_LOGIN_STYLES}</style>
        <div className="login-main" style={{ alignItems: 'center' }}>
          <div className="form-panel mfa-container">
            <div className="mfa-icon">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                <rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>
              </svg>
            </div>
            <h1 className="mfa-title">Two-Factor Auth</h1>
            <p className="mfa-subtitle">Enter the 6-digit code from your authenticator app.</p>
            
            <form onSubmit={handleTotpSubmit} noValidate>
              <div className="field" style={{ textAlign: 'left' }}>
                <label htmlFor="totpCode">Verification Code</label>
                <div className="input-shell" style={{ height: 50 }}>
                  <input
                    id="totpCode"
                    type="text"
                    autoComplete="one-time-code"
                    placeholder="000000"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    style={{ textAlign: 'center', letterSpacing: '8px', fontSize: 20, fontWeight: 700 }}
                  />
                </div>
              </div>
              {error && <p className="caps-warn show" style={{ color: '#ef4444', marginTop: 8 }}>{error}</p>}
              <button type="submit" disabled={loading || totpCode.length !== 6 || lockoutTimer > 0} className="submit-btn" style={{ marginTop: 24 }}>
                {loading ? "Verifying..." : lockoutTimer > 0 ? `Locked (${lockoutTimer}s)` : "Verify Code"}
                {!loading && lockoutTimer === 0 && <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>}
              </button>
              <button type="button" onClick={() => { setMfaRequired(false); supabase.auth.signOut(); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 13, marginTop: 16, cursor: 'pointer' }}>
                Cancel and go back
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page-container">
      <style>{ADMIN_LOGIN_STYLES}</style>
      {/* SIDEBAR */}
      <aside className="login-sidebar">
        <div className="login-avatar">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
        </div>
        <div className="side-name">Sujith Thota</div>
        <div className="side-sub">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          <span>Admin Console · <span>{currentTime}</span></span>
        </div>

        <div className="side-divider"></div>

        <div className="status-list">
          <div className="status-row">Session
            <span className="status-tag pending"><span className="sdot"></span>none</span>
          </div>
          <div className="status-row">Passkey service
            <span className="status-tag"><span className="sdot"></span>reachable</span>
          </div>
          <div className="status-row">Database
            <span className="status-tag"><span className="sdot"></span>connected</span>
          </div>
          <div className="status-row">Encryption
            <span className="status-tag"><span className="sdot"></span>TLS 1.3</span>
          </div>
        </div>

        <div className="side-actions">
          <button className="btn-black" type="button">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 2-3 4M12 17h.01"/></svg>
            Need Help?
          </button>
          <button className="btn-outline" type="button">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5M12 7v5l4 2"/></svg>
            Status Page
          </button>
        </div>

        <div className="side-socials">
          <a className="social-btn" href="#" aria-label="Email"><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/></svg></a>
          <a className="social-btn" href="#" aria-label="LinkedIn"><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6Z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg></a>
          <a className="social-btn" href="#" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg></a>
        </div>

        <div className="side-footer">
          Session secured · July 2026<br/>
          © 2026 All Rights Reserved Sujith
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="login-main">
        <div className="utility-bar">
          <div className="u-btn"><kbd>Ctrl</kbd><kbd>K</kbd></div>
          <div className="u-btn secure"><span className="sdot"></span>Secure</div>
          <div className="theme-toggle">
            <button type="button" className={theme === 'light' ? 'active' : ''} onClick={() => theme !== 'light' && toggleTheme()} aria-label="Light theme">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
            </button>
            <button type="button" className={theme === 'dark' ? 'active' : ''} onClick={() => theme !== 'dark' && toggleTheme()} aria-label="Dark theme">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z"/></svg>
            </button>
          </div>
          <button className="icon-btn" aria-label="Settings" type="button">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 0 1-4 0v-.09A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.55V3a2 2 0 0 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9a1.7 1.7 0 0 0 1.55 1H21a2 2 0 0 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1Z"/></svg>
          </button>
        </div>

        <div className="login-content">
          <div className="eyebrow" id="greeting">{greeting}</div>
          <h1 className="headline">Admin Console</h1>

          <div className="term-pill"><span className="prompt">&gt;_</span> Authentication required</div>

          <p className="lede">Sign in to manage projects, content, and deployments for the portfolio.</p>

          <div className="method-row">
            {passkeySupported && (
              <button className={`method-card ${activeMethod === 'passkey' ? 'active' : ''}`} onClick={() => { setError(""); setActiveMethod("passkey"); }} type="button">
                <div className="method-icon"><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a5 5 0 0 0-5 5c0 2.5 1 3.5 1 6v2"/><path d="M12 2a5 5 0 0 1 5 5c0 2.5-.5 4-1 5"/><path d="M8 15v3a3 3 0 0 0 3 3"/><path d="M16 13v5a3 3 0 0 1-3 3"/><circle cx="12" cy="9" r="1.5"/></svg></div>
                <div className="method-label">Passkey</div>
                <div className="method-sub">Fastest · hardware-backed</div>
              </button>
            )}
            <button className={`method-card ${activeMethod === 'password' ? 'active' : ''}`} onClick={() => { setError(""); setActiveMethod("password"); }} type="button">
              <div className="method-icon"><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg></div>
              <div className="method-label">Password</div>
              <div className="method-sub">Email & password</div>
            </button>
            <button className={`method-card ${activeMethod === 'magic' ? 'active' : ''}`} onClick={() => { setError(""); setActiveMethod("magic"); }} type="button">
              <div className="method-icon"><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/></svg></div>
              <div className="method-label">Magic Link</div>
              <div className="method-sub">One-time email link</div>
            </button>
          </div>

          <div className="form-panel">
            {error && (
              <div style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: 8, fontSize: 13, marginBottom: 16, fontWeight: 500 }}>
                {error}
              </div>
            )}
            {attempts > 0 && attempts < MAX_ATTEMPTS && (
              <div style={{ padding: '8px 12px', background: 'rgba(217,119,6,0.1)', color: '#d97706', borderRadius: 8, fontSize: 13, marginBottom: 16, fontWeight: 500 }}>
                {MAX_ATTEMPTS - attempts} attempts remaining before lockout.
              </div>
            )}

            {/* PASSKEY VIEW */}
            {activeMethod === 'passkey' && passkeySupported && (
              <div className="method-view" id="view-passkey">
                <div className="passkey-panel">
                  <div className="pk-icon"><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a5 5 0 0 0-5 5c0 2.5 1 3.5 1 6v2"/><path d="M12 2a5 5 0 0 1 5 5c0 2.5-.5 4-1 5"/><path d="M8 15v3a3 3 0 0 0 3 3"/><path d="M16 13v5a3 3 0 0 1-3 3"/><circle cx="12" cy="9" r="1.5"/></svg></div>
                  <h3>Sign in with your passkey</h3>
                  <p>Use Touch ID, Windows Hello, or a security key registered on this device.</p>
                </div>
                <button className="submit-btn" type="button" onClick={handlePasskeySubmit} disabled={loading || lockoutTimer > 0}>
                  {loading ? "Verifying..." : lockoutTimer > 0 ? `Locked (${lockoutTimer}s)` : "Continue with passkey"}
                  {!loading && lockoutTimer === 0 && <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>}
                </button>
              </div>
            )}

            {/* PASSWORD VIEW */}
            {activeMethod === 'password' && (
              <div className="method-view" id="view-password">
                <form onSubmit={handlePasswordSubmit} noValidate>
                  <div className="field">
                    <label htmlFor="email">Email address</label>
                    <div className={`input-shell ${error ? 'error' : ''}`}>
                      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/></svg>
                      <input id="email" type="email" placeholder="admin@example.com" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={lockoutTimer > 0} />
                    </div>
                  </div>
                  <div className="field">
                    <label htmlFor="password">Password</label>
                    <div className={`input-shell ${error ? 'error' : ''}`}>
                      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>
                      <input id="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} onKeyUp={onKeyUp} onBlur={() => setCapsLockOn(false)} disabled={lockoutTimer > 0} style={{ letterSpacing: showPassword || !password ? 'normal' : '2px' }} />
                      <button type="button" className="toggle-vis" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)}>
                        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          {showPassword ? (
                            <>
                              <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.6 21.6 0 0 1 5.06-5.94M9.9 4.24A10.6 10.6 0 0 1 12 4c7 0 11 7 11 7a21.5 21.5 0 0 1-2.61 3.66M14.12 14.12a3 3 0 1 1-4.24-4.24"/><path d="M1 1l22 22"/>
                            </>
                          ) : (
                            <>
                              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>
                            </>
                          )}
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="row-between">
                    <label className="remember" htmlFor="rememberMe"><input id="rememberMe" type="checkbox" /> Remember me</label>
                    <span className={`caps-warn ${capsLockOn ? 'show' : ''}`}>
                      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v4M12 17h.01M10.3 3.86 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.86a2 2 0 0 0-3.4 0Z"/></svg>
                      Caps Lock on
                    </span>
                    <a className="forgot" href="#">Forgot?</a>
                  </div>
                  <button className="submit-btn" type="submit" disabled={loading || lockoutTimer > 0}>
                    {loading ? "Signing in..." : lockoutTimer > 0 ? `Locked (${lockoutTimer}s)` : "Sign in"}
                    {!loading && lockoutTimer === 0 && <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>}
                  </button>
                </form>
              </div>
            )}

            {/* MAGIC LINK VIEW */}
            {activeMethod === 'magic' && (
              <div className="method-view magic-panel" id="view-magic">
                <form onSubmit={handleMagicLinkSubmit} noValidate>
                  <div className="field">
                    <label htmlFor="magicEmail">Email address</label>
                    <div className={`input-shell ${error ? 'error' : ''}`}>
                      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/></svg>
                      <input id="magicEmail" type="email" placeholder="admin@example.com" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={lockoutTimer > 0 || magicLinkSent} />
                    </div>
                  </div>
                  <button className="submit-btn" type="submit" style={{ marginTop: 16 }} disabled={loading || lockoutTimer > 0 || magicLinkSent}>
                    {loading ? "Sending link..." : magicLinkSent ? "Link sent — check your inbox" : lockoutTimer > 0 ? `Locked (${lockoutTimer}s)` : "Send magic link"}
                    {!loading && !magicLinkSent && lockoutTimer === 0 && <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>}
                  </button>
                </form>
              </div>
            )}

          </div>

          <div className="footer-trust">
            <span className="trust-item"><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>TLS 1.3</span>
            <span className="trust-item"><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg>Passkey ready</span>
            <span className="trust-item"><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>Rate limited</span>
          </div>

          <p className="foot-note">Restricted access · authorized personnel only</p>
        </div>
      </main>
    </div>
  );
}
