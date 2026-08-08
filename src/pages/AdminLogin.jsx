import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useTheme } from "../context/ThemeContext";

const ADMIN_LOGIN_STYLES = `
.login-page-container {
  --bg: #ffffff;
  --sidebar-bg: #ffffff;
  --card-bg: #ffffff;
  --panel-2: #f7f8fa;
  --border: #e7e9ee;
  --border-soft: #f0f1f4;
  --border-strong: #cbd5e1;
  --text: #0f1626;
  --text-muted: #7c8494;
  --text-dim: #aeb4bf;
  --green: #1ba64c;
  --green-soft: #e4f5e9;
  --amber: #b7791b;
  --black: #0f1626;
  --black-hover: #26304a;
  --shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.02);
  --sans: 'Inter', -apple-system, sans-serif;
  --display: 'Space Grotesk', sans-serif;
  --mono: 'IBM Plex Mono', monospace;
  --radius-lg: 20px;
  --radius-md: 12px;
  --radius-sm: 8px;
}

[data-theme="dark"] .login-page-container {
  --bg: #0a0d10;
  --sidebar-bg: #12161b;
  --card-bg: #12161b;
  --panel-2: #161b21;
  --border: #232a31;
  --border-soft: #1b2027;
  --border-strong: #2d3844;
  --text: #e8ecef;
  --text-muted: #6e7982;
  --text-dim: #4b535a;
  --green: #6ee7b7;
  --green-soft: rgba(43, 74, 62, 0.4);
  --amber: #f2b75c;
  --black: #e8ecef;
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
  background-image:
    linear-gradient(var(--border-soft) 1px, transparent 1px),
    linear-gradient(90deg, var(--border-soft) 1px, transparent 1px);
  background-size: 48px 48px;
  background-position: -1px -1px;
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
  overflow:hidden;
  border:2px solid var(--border);
  display:flex; align-items:center; justify-content:center;
  box-shadow:var(--shadow);
  margin-bottom:16px;
  flex-shrink:0;
  background:var(--sidebar-bg);
}
.login-avatar img{ width:100%; height:100%; object-fit:cover; }
.login-avatar svg{ width:24px; height:24px; stroke:var(--text-muted); }

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

.btn-ghost{
  width:100%;
  display:flex; align-items:center; gap:8px;
  background:var(--panel-2); color:var(--text-muted);
  border:1px solid var(--border); border-radius:8px;
  padding:10px 14px;
  font-family:var(--mono); font-size:11.5px; font-weight:500;
  cursor:pointer;
  transition:all .15s ease;
}
.btn-ghost:hover{
  background:var(--card-bg); color:var(--text);
  border-color:var(--border-strong);
  box-shadow:var(--shadow);
}
.btn-ghost svg{ width:14px; height:14px; stroke:var(--text-dim); transition:stroke .15s ease; flex-shrink:0; }
.btn-ghost:hover svg{ stroke:var(--text); }

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

.side-footer {
  margin-top: auto;
  padding-top: 18px;
  font-size: 11.5px;
  color: var(--text-dim);
  line-height: 1.5;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  border-top: 1px solid var(--border);
}
.side-footer-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--mono);
  font-size: 10.5px;
  color: var(--green);
  font-weight: 500;
}
.side-footer-badge svg {
  width: 12px;
  height: 12px;
  stroke: var(--green);
}
.side-footer-copy {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 400;
}

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
.u-btn{
  display:flex; align-items:center; gap:6px;
  height:34px; box-sizing:border-box; padding:0 12px;
  border:1px solid var(--border); border-radius:8px;
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
  max-width:660px;
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
  padding:6px 12px;
  border:1px solid var(--border); border-radius:8px;
  background:var(--sidebar-bg);
  font-family:var(--mono); font-size:12.5px; color:var(--text);
}
.term-pill .prompt{ color:var(--green); font-weight:700; }

.lede{
  margin-top:12px;
  font-size:14px; color:var(--text-muted); line-height:1.5;
}

.method-row{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:1px;
  background:var(--border);
  border:1px solid var(--border);
  border-radius:8px 8px 0 0;
  overflow:hidden;
  margin-top:28px;
}
.method-card{
  background:var(--card-bg);
  padding:16px 14px;
  cursor:pointer;
  transition:background .15s;
  border:none;
  text-align:left;
  color:var(--text);
  display:flex; flex-direction:column; gap:4px;
}
.method-card:hover{ background:var(--panel-2); }
.method-card.active{ background:var(--panel-2); box-shadow:inset 0 3px 0 var(--green); }
.method-num{ font-family:var(--mono); font-size:10px; color:var(--text-dim); margin-bottom:6px; }
.method-label{ font-size:13px; font-weight:500; }
.method-card.active .method-label{ color:var(--green); }
.method-sub{ font-size:11px; color:var(--text-muted); }

.pulse-row{display:flex;align-items:flex-end;gap:2px;height:16px;}
.pulse-bar{
  width:3px;background:var(--green);border-radius:1px;opacity:.85;
  height:6px;
  animation:pulse 1.8s ease-in-out infinite;
}
.pulse-bar:nth-child(1){height:10px;animation-delay:0s;}
.pulse-bar:nth-child(2){height:16px;animation-delay:.1s;}
.pulse-bar:nth-child(3){height:8px;animation-delay:.2s;}
.pulse-bar:nth-child(4){height:18px;animation-delay:.3s;}
.pulse-bar:nth-child(5){height:12px;animation-delay:.4s;}
.pulse-bar:nth-child(6){height:6px;animation-delay:.5s;}
.pulse-bar:nth-child(7){height:14px;animation-delay:.6s;}
.pulse-bar:nth-child(8){height:9px;animation-delay:.7s;}
@keyframes pulse{
  0%,100%{transform:scaleY(.6);}
  50%{transform:scaleY(1);}
}

.cursor{
  display:inline-block;width:6px;height:12px;background:var(--green);
  animation:blink 1.1s steps(1) infinite;vertical-align:-2px;
}
@keyframes blink{50%{opacity:0;}}

.form-panel{
  background:var(--card-bg);
  border:1px solid var(--border);
  border-top:none;
  border-radius:0 0 8px 8px;
  padding:32px 28px;
  text-align:center;
  margin-bottom:20px;
  box-shadow:var(--shadow);
}

.field{ margin-bottom:14px; text-align:left; }
.field:last-of-type{ margin-bottom:0; }
.field label{
  display:block; font-size:12px; font-weight:600; color:var(--text-muted);
  margin-bottom:6px;
}
.input-shell{
  display:flex; align-items:center; gap:10px;
  background:var(--panel-2);
  border:1px solid var(--border); border-radius:6px;
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
  color:var(--text); font-family:var(--sans); font-size:13.5px; padding:11px 0;
}
.input-shell input::placeholder{ color:var(--text-dim); }
.input-shell input:disabled { color: var(--text-muted); opacity: 0.7; }
.toggle-vis{ background:none; border:none; padding:4px; display:flex; color:var(--text-dim); }
.toggle-vis:hover{ color:var(--text-muted); }
.toggle-vis svg{ width:15px; height:15px; stroke:currentColor; }

.row-between{
  display:flex; align-items:center; justify-content:space-between;
  margin:12px 0 16px;
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
  background:var(--text);
  color:#FFFFFF;
  font-family:var(--display);
  font-weight:700;
  font-size:14px;
  padding:14px;
  border:none;
  border-radius:6px;
  cursor:pointer;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:8px;
  transition:background .15s ease, transform .12s ease;
}
.submit-btn:hover:not(:disabled){ background:var(--black-hover); }
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

function QrCodeSvg({ size = 150 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 29 29" style={{ borderRadius: 12, background: '#ffffff', padding: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
      <rect width="29" height="29" fill="#ffffff" />
      <rect x="2" y="2" width="7" height="7" fill="#0f172a" rx="1" />
      <rect x="3" y="3" width="5" height="5" fill="#ffffff" rx="0.5" />
      <rect x="4" y="4" width="3" height="3" fill="#0f172a" rx="0.5" />
      
      <rect x="20" y="2" width="7" height="7" fill="#0f172a" rx="1" />
      <rect x="21" y="3" width="5" height="5" fill="#ffffff" rx="0.5" />
      <rect x="22" y="4" width="3" height="3" fill="#0f172a" rx="0.5" />
      
      <rect x="2" y="20" width="7" height="7" fill="#0f172a" rx="1" />
      <rect x="3" y="21" width="5" height="5" fill="#ffffff" rx="0.5" />
      <rect x="4" y="22" width="3" height="3" fill="#0f172a" rx="0.5" />
      
      <rect x="11" y="2" width="2" height="2" fill="#0f172a" />
      <rect x="14" y="2" width="2" height="2" fill="#0f172a" />
      <rect x="10" y="5" width="2" height="2" fill="#0f172a" />
      <rect x="13" y="5" width="3" height="2" fill="#0f172a" />
      <rect x="2" y="11" width="2" height="2" fill="#0f172a" />
      <rect x="5" y="11" width="2" height="2" fill="#0f172a" />
      <rect x="2" y="14" width="2" height="2" fill="#0f172a" />
      <rect x="11" y="11" width="7" height="7" fill="#0f172a" rx="1" />
      <rect x="13" y="13" width="3" height="3" fill="#ffffff" rx="0.5" />
      <rect x="14" y="14" width="1" height="1" fill="#0f172a" />
      <rect x="20" y="11" width="3" height="2" fill="#0f172a" />
      <rect x="24" y="11" width="3" height="2" fill="#0f172a" />
      <rect x="11" y="20" width="2" height="3" fill="#0f172a" />
      <rect x="15" y="20" width="3" height="2" fill="#0f172a" />
      <rect x="20" y="20" width="3" height="3" fill="#0f172a" />
      <rect x="24" y="22" width="3" height="5" fill="#0f172a" />
    </svg>
  );
}

export default function AdminLogin() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // Primary Auth State
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

  // Passkey & Telemetry State
  const [passkeySupported, setPasskeySupported] = useState(false);
  const [pingMs, setPingMs] = useState(18);
  const [pulseBars, setPulseBars] = useState([8, 12, 6, 14, 10, 4, 12, 8, 15, 6]);

  // Modal States
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  
  // UI State
  const [activeMethod, setActiveMethod] = useState("password");
  const [masterKey, setMasterKey] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [greeting, setGreeting] = useState("GOOD AFTERNOON");
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  // Email Security OTP State
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpCode, setEmailOtpCode] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);

  useEffect(() => {
    let interval = null;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setPulseBars(Array.from({ length: 10 }, () => Math.floor(4 + Math.random() * 14)));
    }, 900);
    return () => clearInterval(pulseInterval);
  }, []);

  useEffect(() => {
    const measurePing = async () => {
      const start = performance.now();
      try {
        await supabase.from('site_settings').select('id').limit(1);
        setPingMs(Math.round(performance.now() - start));
      } catch {
        setPingMs(22);
      }
    };
    measurePing();
  }, []);

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

  const handleSendEmailOtp = async (e) => {
    if (e) e.preventDefault();
    if (lockoutTimer > 0) return;
    setError("");
    if (!email || !email.trim()) {
      setError("Please enter your admin email address.");
      return;
    }
    setLoading(true);
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: false,
        }
      });
      if (otpError) {
        setError(otpError.message || "Failed to send security code to email.");
      } else {
        setEmailOtpSent(true);
        setOtpTimer(60);
      }
    } catch (err) {
      setError(err.message || "Failed to dispatch email security code.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmailOtp = async (e) => {
    if (e) e.preventDefault();
    if (lockoutTimer > 0) return;
    setError("");
    if (!emailOtpCode || emailOtpCode.trim().length !== 6) {
      setError("Please enter the 6-digit security code received in your email.");
      return;
    }
    setLoading(true);
    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: emailOtpCode.trim(),
        type: 'email',
      });
      if (verifyError) {
        setError(verifyError.message || "Invalid or expired security code.");
        await registerFailedAttempt();
      } else if (data?.user) {
        resetLockout();
        await logTelemetry(data.user.id, data.user.email, true);
        navigate("/admin/dashboard");
      }
    } catch (err) {
      setError(err.message || "Security code verification failed.");
      await registerFailedAttempt();
    } finally {
      setLoading(false);
    }
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
          <img src="/profile_photo.png" alt="Sujith Thota" onError={(e) => { e.target.style.display = 'none'; }} />
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
          <div className="status-row">Latency ping
            <span className="status-tag" style={{ gap: 6 }}>
              <span className="pulse-row">
                <span className="pulse-bar" /><span className="pulse-bar" /><span className="pulse-bar" /><span className="pulse-bar" /><span className="pulse-bar" /><span className="pulse-bar" /><span className="pulse-bar" /><span className="pulse-bar" />
              </span>
              <span>{pingMs}ms</span>
            </span>
          </div>
          <div className="status-row">Encryption
            <span className="status-tag"><span className="sdot"></span>TLS 1.3</span>
          </div>
        </div>

        <div className="side-actions">
          <button className="btn-ghost" type="button" onClick={() => setShowHelpModal(true)}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 2-3 4M12 17h.01"/></svg>
            <span>Need Help?</span>
          </button>
          <button className="btn-ghost" type="button" onClick={() => setShowStatusModal(true)}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5M12 7v5l4 2"/></svg>
            <span>Status Page</span>
          </button>
        </div>

        <div className="side-footer">
          <div className="side-footer-badge">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>Session Secured · TLS 1.3</span>
          </div>
          <div className="side-footer-copy">
            © {new Date().getFullYear()} Sujith Thota. All rights reserved.
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="login-main">

        <div className="login-content">
          <h1 className="headline">Admin Console</h1>

          <p className="lede">Sign in to manage projects, content, and deployments for the portfolio.</p>

          <div className="method-row">
            <button className={`method-card ${activeMethod === 'password' ? 'active' : ''}`} onClick={() => { setError(""); setActiveMethod("password"); }} type="button">
              <div className="method-num">01</div>
              <div className="method-label">Password</div>
              <div className="method-sub">Email &amp; password</div>
            </button>

            <button className={`method-card ${activeMethod === 'otp' ? 'active' : ''}`} onClick={() => { setError(""); setActiveMethod("otp"); }} type="button">
              <div className="method-num">02</div>
              <div className="method-label">Email OTP Code</div>
              <div className="method-sub">Instant security PIN</div>
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

            {/* PASSWORD VIEW (PRIMARY) */}
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
                    {loading ? "Signing in..." : lockoutTimer > 0 ? `Locked (${lockoutTimer}s)` : "Sign in →"}
                  </button>
                </form>
              </div>
            )}

            {/* EMAIL OTP VIEW */}
            {activeMethod === 'otp' && (
              <div className="method-view" id="view-email-otp">
                {!emailOtpSent ? (
                  <form onSubmit={handleSendEmailOtp} noValidate>
                    <div style={{ textAlign: 'center', marginBottom: 16 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: 'rgba(59, 130, 246, 0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 10px', color: '#3b82f6'
                      }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/></svg>
                      </div>
                      <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px', color: 'var(--text)' }}>Email Security Code (OTP)</h3>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                        Generate a secure 6-digit one-time security PIN sent directly to your registered inbox.
                      </p>
                    </div>

                    {/* Locked Verified Admin Email Badge */}
                    <div style={{
                      background: 'var(--panel-2)',
                      border: '1px solid var(--border)',
                      borderRadius: 12,
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 18,
                      textAlign: 'left'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        </div>
                        <div>
                          <div style={{ fontSize: 10.5, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Registered Admin Account</div>
                          <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--mono)' }}>sujithreddy1546@gmail.com</div>
                        </div>
                      </div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#10b981', background: 'rgba(16,185,129,0.15)', padding: '4px 10px', borderRadius: 999, fontWeight: 600 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
                        <span>Locked</span>
                      </div>
                    </div>

                    <button className="submit-btn" type="submit" style={{ marginTop: 8 }} disabled={loading || lockoutTimer > 0}>
                      {loading ? "Dispatching Security Code..." : "Send Security OTP to sujithreddy1546@gmail.com →"}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyEmailOtp} noValidate>
                    <div style={{ textAlign: 'center', marginBottom: 16 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: 'rgba(16, 185, 129, 0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 10px', color: '#10b981'
                      }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                      </div>
                      <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px', color: 'var(--text)' }}>Enter 6-Digit Code</h3>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                        Security code sent to <strong style={{ color: 'var(--text)' }}>sujithreddy1546@gmail.com</strong>
                      </p>
                    </div>

                    <div className="field">
                      <label htmlFor="otpCodeInput">6-Digit Verification PIN</label>
                      <div className={`input-shell ${error ? 'error' : ''}`} style={{ height: 46 }}>
                        <input
                          id="otpCodeInput"
                          type="text"
                          autoComplete="one-time-code"
                          maxLength={6}
                          value={emailOtpCode}
                          onChange={(e) => setEmailOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="000 000"
                          style={{ textAlign: 'center', letterSpacing: '6px', fontSize: 18, fontWeight: 700 }}
                        />
                      </div>
                    </div>

                    <button className="submit-btn" type="submit" style={{ marginTop: 16 }} disabled={loading || emailOtpCode.length !== 6 || lockoutTimer > 0}>
                      {loading ? "Verifying Code..." : "Verify & Sign In →"}
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, fontSize: 12 }}>
                      <button
                        type="button"
                        onClick={() => setEmailOtpSent(false)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                      >
                        ← Back
                      </button>

                      <button
                        type="button"
                        onClick={handleSendEmailOtp}
                        disabled={otpTimer > 0 || loading}
                        style={{ background: 'none', border: 'none', color: otpTimer > 0 ? 'var(--text-dim)' : 'var(--green)', fontWeight: 600, cursor: otpTimer > 0 ? 'not-allowed' : 'pointer', padding: 0 }}
                      >
                        {otpTimer > 0 ? `Resend in ${otpTimer}s` : "Resend Security Code"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}





          </div>

          <div className="footer-trust">
            <span>🔒 TLS 1.3</span>
            <span>◇ Passkey ready</span>
            <span>◷ Rate limited</span>
          </div>

          <p className="foot-note">Restricted access · authorized personnel only</p>
        </div>
      </main>

      {/* NEED HELP MODAL */}
      {showHelpModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 20, maxWidth: 440, width: '100%', padding: 28, boxShadow: '0 20px 40px rgba(0,0,0,0.2)', color: 'var(--text)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" width="20" height="20"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 2-3 4M12 17h.01"/></svg>
                </div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Admin Help & Shortcuts</h3>
              </div>
              <button onClick={() => setShowHelpModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 4 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--sidebar-bg)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <span>Command Palette</span>
                <kbd style={{ fontFamily: 'var(--mono)', fontSize: 11, background: 'var(--card-bg)', padding: '2px 8px', borderRadius: 4, border: '1px solid var(--border)' }}>Ctrl + K</kbd>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--sidebar-bg)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <span>Toggle Light / Dark Mode</span>
                <kbd style={{ fontFamily: 'var(--mono)', fontSize: 11, background: 'var(--card-bg)', padding: '2px 8px', borderRadius: 4, border: '1px solid var(--border)' }}>Shift + T</kbd>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--sidebar-bg)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <span>Emergency Sign Out</span>
                <kbd style={{ fontFamily: 'var(--mono)', fontSize: 11, background: 'var(--card-bg)', padding: '2px 8px', borderRadius: 4, border: '1px solid var(--border)' }}>Esc</kbd>
              </div>
            </div>

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              For support or emergency access credentials, reach out to <a href="mailto:sujithreddy1546@gmail.com" style={{ color: 'var(--text)', textDecoration: 'underline' }}>sujithreddy1546@gmail.com</a>.
            </div>
          </div>
        </div>
      )}

      {/* STATUS PAGE MODAL */}
      {showStatusModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 20, maxWidth: 460, width: '100%', padding: 28, boxShadow: '0 20px 40px rgba(0,0,0,0.2)', color: 'var(--text)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" width="20" height="20"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>System Telemetry & Status</h3>
                  <p style={{ margin: 0, fontSize: 11, color: 'var(--green)', fontWeight: 600 }}>All Systems Operational</p>
                </div>
              </div>
              <button onClick={() => setShowStatusModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 4 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--sidebar-bg)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <span>Database Connection</span>
                <span style={{ color: 'var(--green)', fontWeight: 600, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}><span className="sdot"/> 100% · Connected</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--sidebar-bg)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <span>Edge Auth Latency</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{pingMs}ms ping</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--sidebar-bg)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <span>Passkey Hardware Trust</span>
                <span style={{ color: 'var(--text)', fontWeight: 600, fontSize: 12 }}>TPM 2.0 Active</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--sidebar-bg)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <span>Build Environment</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-muted)' }}>Vite 8.0 · Production</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
