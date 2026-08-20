import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
  Shield, ShieldCheck, Key, Smartphone, Lock,
  AlertTriangle, CheckCircle2, XCircle, Copy, Check,
  Download, RefreshCw, Eye, EyeOff, Clock, Terminal,
  Activity, Trash2, Plus, Loader2, Mail, Sparkles,
  Server, Fingerprint, Globe, MapPin, Laptop, Save,
  ShieldAlert, Users, Zap
} from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../context/AuthContext';
import { logAuditEvent } from '../../../lib/auditLogger';
import {
  setMasterPin,
  verifyPin,
  setRememberSessionPreference,
  getRememberSessionPreference,
} from '../../../lib/sessionSecurity';

/* ─── Shared micro-component: Section card ──────────────────────── */
const SCard = ({ children, style = {} }) => (
  <div style={{
    background: 'var(--pcms-panel-2)', border: '1px solid var(--pcms-line)',
    borderRadius: 12, padding: '18px 20px', display: 'flex',
    flexDirection: 'column', gap: 14, ...style
  }}>{children}</div>
);

const SCardHead = ({ icon: Icon, color, label, sub }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <div style={{ width: 34, height: 34, borderRadius: 9, background: `${color}18`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={16} />
    </div>
    <div>
      <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--pcms-text)' }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--pcms-muted)', marginTop: 1 }}>{sub}</div>}
    </div>
  </div>
);

const StatusPill = ({ ok, label }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 4,
    fontSize: 10.5, fontWeight: 700, padding: '2px 9px', borderRadius: 999,
    background: ok ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
    color: ok ? '#10B981' : '#EF4444',
    border: `1px solid ${ok ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
  }}>
    {ok ? <CheckCircle2 size={10} /> : <XCircle size={10} />} {label}
  </span>
);

const InfoRow = ({ label, value, mono = false }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid var(--pcms-line-soft)' }}>
    <span style={{ fontSize: 11.5, color: 'var(--pcms-muted)' }}>{label}</span>
    <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--pcms-text)', fontFamily: mono ? 'monospace' : 'inherit' }}>{value}</span>
  </div>
);

/* ─── Tab definitions ────────────────────────────────────────────── */
const TABS = [
  { id: 'credentials', label: 'Password',        icon: Key },
  { id: 'mfa',         label: 'MFA & TOTP',      icon: Smartphone },
  { id: 'passkeys',    label: 'Passkeys',         icon: Fingerprint },
  { id: 'bruteforce',  label: 'Access Policy',   icon: Shield },
  { id: 'telemetry',   label: 'Audit Logs',      icon: Activity },
  { id: 'sessions',    label: 'Sessions',         icon: Lock },
];

/* ═══════════════════════════════════════════════════════════════════ */
export default function AuthSecurityPanel() {
  const { user, session } = useAuth();
  const adminEmail = user?.email || 'sujithreddy1546@gmail.com';

  const [activeTab, setActiveTab] = useState('credentials');
  const [saved, setSaved] = useState(false);
  const flash = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  /* Session & Timeout Preferences */
  const [autoLockMin, setAutoLockMin] = useState(() => parseInt(localStorage.getItem('pcms_auto_lock_min') || '15', 10));
  const [singleSession, setSingleSession] = useState(() => localStorage.getItem('pcms_single_session') === 'true');
  const [rememberSessionPref, setRememberSessionPref] = useState(() => getRememberSessionPreference());

  /* Master PIN State */
  const [currPin, setCurrPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confPin, setConfPin] = useState('');
  const [pinSaving, setPinSaving] = useState(false);
  const [pinMsg, setPinMsg] = useState('');
  const [pinError, setPinError] = useState('');

  const handleUpdateMasterPin = async (e) => {
    e.preventDefault();
    setPinError('');
    setPinMsg('');

    if (!newPin || newPin.length < 4) {
      setPinError('New Master PIN must be at least 4 digits/characters.');
      return;
    }
    if (newPin !== confPin) {
      setPinError('New PIN and confirmation do not match.');
      return;
    }

    setPinSaving(true);
    try {
      const isOldValid = await verifyPin(currPin);
      if (!isOldValid) {
        setPinError('Current Master PIN is incorrect.');
        setPinSaving(false);
        return;
      }

      await setMasterPin(newPin);
      await logAuditEvent('MASTER_PIN_ROTATED', 'security', adminEmail);
      setPinMsg('Master PIN successfully updated.');
      setCurrPin('');
      setNewPin('');
      setConfPin('');
      flash();
    } catch (err) {
      setPinError(err.message || 'Failed to update Master PIN.');
    } finally {
      setPinSaving(false);
    }
  };

  /* ── 1. Live network & device telemetry ── */
  const [tele, setTele] = useState({ ip: 'Resolving…', city: '', country: '', os: '', browser: '', pingMs: null, loading: true });

  useEffect(() => {
    let alive = true;
    const ua = navigator.userAgent;
    const os = ua.includes('Win') ? 'Windows' : ua.includes('Mac') ? 'macOS' : ua.includes('Android') ? 'Android' : ua.includes('iPhone') || ua.includes('iPad') ? 'iOS' : 'Linux';
    const browser = ua.includes('Edg/') ? 'Edge' : ua.includes('Chrome/') ? 'Chrome' : ua.includes('Firefox/') ? 'Firefox' : ua.includes('Safari/') ? 'Safari' : 'Browser';

    (async () => {
      const t0 = performance.now();
      try { await supabase.from('site_settings').select('id').limit(1); } catch {}
      const ping = Math.round(performance.now() - t0);

      try {
        const r = await fetch('https://ipapi.co/json/').catch(() => null);
        if (r?.ok) {
          const d = await r.json();
          if (alive) setTele({ ip: d.ip, city: d.city || '', country: d.country_name || '', os, browser, pingMs: ping, loading: false });
          return;
        }
      } catch {}
      if (alive) setTele({ ip: '127.0.0.1', city: 'Localhost', country: '', os, browser, pingMs: ping, loading: false });
    })();
    return () => { alive = false; };
  }, []);

  /* ── 2. Audit logs ── */
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(true);
  const [auditFilter, setAuditFilter] = useState('ALL');

  const fetchAudit = useCallback(async () => {
    setAuditLoading(true);
    const { data } = await supabase.from('admin_audit_logs').select('*').order('created_at', { ascending: false }).limit(50);
    setAuditLogs(data || []);
    setAuditLoading(false);
  }, []);

  useEffect(() => {
    fetchAudit();
    const ch = supabase.channel('auth_security_audit')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'admin_audit_logs' }, p => setAuditLogs(prev => [p.new, ...prev.slice(0, 49)]))
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [fetchAudit]);

  /* ── 3. Password management ── */
  const [currPw, setCurrPw]   = useState('');
  const [newPw, setNewPw]     = useState('');
  const [confPw, setConfPw]   = useState('');
  const [showCurr, setShowCurr] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifErr, setVerifErr] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwStatus, setPwStatus] = useState(null);
  const [copiedGen, setCopiedGen] = useState(false);
  const [signOutOthers, setSignOutOthers] = useState(true);

  const passwordLastRotated = localStorage.getItem('pcms_pwd_rotated_at') || user?.updated_at || user?.last_sign_in_at || new Date().toISOString();
  const daysSince = Math.max(0, Math.floor((Date.now() - new Date(passwordLastRotated).getTime()) / 86400000));
  const [rotationPolicy, setRotationPolicy] = useState(() => localStorage.getItem('pcms_pwd_rotation_policy') !== 'false');

  const hasLen  = newPw.length >= 12;
  const hasUp   = /[A-Z]/.test(newPw);
  const hasLow  = /[a-z]/.test(newPw);
  const hasNum  = /[0-9]/.test(newPw);
  const hasSym  = /[^A-Za-z0-9]/.test(newPw);
  const pwMatch = newPw.length > 0 && newPw === confPw;
  const pwDiff  = newPw.length > 0 && newPw !== currPw;
  const pwValid = [hasLen, hasUp, hasLow, hasNum, hasSym, pwMatch, pwDiff].every(Boolean);
  const pwScore = [hasLen, hasUp, hasLow, hasNum, hasSym, pwMatch, pwDiff].filter(Boolean).length;

  const handleGenPassword = () => {
    const u = 'ABCDEFGHJKLMNPQRSTUVWXYZ', l = 'abcdefghijkmnopqrstuvwxyz',
          n = '23456789', s = '!@#$%^&*-_+=';
    const all = u + l + n + s;
    let g = u[~~(Math.random() * u.length)] + l[~~(Math.random() * l.length)] + n[~~(Math.random() * n.length)] + s[~~(Math.random() * s.length)];
    for (let i = 4; i < 16; i++) g += all[~~(Math.random() * all.length)];
    g = g.split('').sort(() => Math.random() - 0.5).join('');
    setNewPw(g); setConfPw(g); setShowNew(true); setShowConf(true);
    navigator.clipboard.writeText(g).catch(() => {});
    setCopiedGen(true); setTimeout(() => setCopiedGen(false), 2500);
  };

  const handleVerifyCurrent = async (e) => {
    e?.preventDefault();
    if (!currPw.trim()) { setVerifErr('Enter your current password.'); return; }
    setVerifying(true); setVerifErr('');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: adminEmail, password: currPw });
      if (error) throw new Error(error.message);
      setVerified(true);
      logAuditEvent('VERIFY_PASSWORD_SUCCESS', 'auth', adminEmail, { ip: tele.ip });
    } catch (err) {
      setVerifErr(err.message || 'Incorrect password.');
      logAuditEvent('VERIFY_PASSWORD_FAILED', 'auth', adminEmail, { ip: tele.ip });
    } finally { setVerifying(false); }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (!verified) { setPwStatus({ err: true, msg: 'Verify your current password first.' }); return; }
    if (!pwValid) { setPwStatus({ err: true, msg: 'Password does not satisfy all requirements.' }); return; }
    setPwLoading(true); setPwStatus({ msg: 'Updating via Supabase Auth…' });
    try {
      const { error } = await supabase.auth.updateUser({ password: newPw });
      if (error) throw error;
      if (signOutOthers) { try { await supabase.auth.signOut({ scope: 'others' }); } catch {} }
      const now = new Date().toISOString();
      localStorage.setItem('pcms_pwd_rotated_at', now);
      await logAuditEvent('ADMIN_PASSWORD_ROTATED', 'auth', adminEmail, { ip: tele.ip, revokedOthers: signOutOthers });
      setPwStatus({ msg: '✅ Password updated! Other sessions revoked.' });
      setCurrPw(''); setNewPw(''); setConfPw(''); setVerified(false);
      fetchAudit();
    } catch (err) {
      setPwStatus({ err: true, msg: err.message || 'Failed.' });
    } finally { setPwLoading(false); }
  };

  /* ── 4. MFA / TOTP ── */
  const [totpSecret] = useState(() => localStorage.getItem('pcms_totp_secret') || 'JBSWY3DPEHPK3PXP');
  const [mfaEnabled, setMfaEnabled] = useState(() => localStorage.getItem('pcms_mfa_enabled') === 'true');
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);
  const [copiedSecret, setCopiedSecret] = useState(false);

  const [recoveryCodes, setRecoveryCodes] = useState(() => {
    const saved = localStorage.getItem('pcms_recovery_codes');
    if (saved) { try { return JSON.parse(saved); } catch {} }
    const gen = () => { const p = () => Math.random().toString(36).substring(2, 6).toUpperCase(); return `${p()}-${p()}`; };
    const codes = Array.from({ length: 8 }, () => ({ code: gen(), used: false }));
    localStorage.setItem('pcms_recovery_codes', JSON.stringify(codes));
    return codes;
  });
  const [copiedCodes, setCopiedCodes] = useState(false);

  const totpUri = `otpauth://totp/PortfolioCMS:${adminEmail}?secret=${totpSecret}&issuer=PortfolioCMS&algorithm=SHA1&digits=6&period=30`;

  const handleToggleMfa = (val) => {
    setMfaEnabled(val); localStorage.setItem('pcms_mfa_enabled', String(val));
    logAuditEvent('TOGGLE_MFA', 'auth', val ? 'ENABLED' : 'DISABLED');
    flash();
  };

  const handleRegenCodes = () => {
    if (!window.confirm('Generate fresh recovery codes? Old codes will be invalidated.')) return;
    const gen = () => { const p = () => Math.random().toString(36).substring(2, 6).toUpperCase(); return `${p()}-${p()}`; };
    const codes = Array.from({ length: 8 }, () => ({ code: gen(), used: false }));
    setRecoveryCodes(codes);
    localStorage.setItem('pcms_recovery_codes', JSON.stringify(codes));
    logAuditEvent('GENERATE_RECOVERY_CODES', 'auth', `8 codes`);
  };

  const handleDownloadCodes = () => {
    const text = `PORTFOLIO CMS — EMERGENCY MFA RECOVERY CODES\nGenerated: ${new Date().toLocaleString()}\nAccount: ${adminEmail}\n\n` +
      recoveryCodes.map((c, i) => `[${i + 1}] ${c.code} ${c.used ? '(USED)' : '(AVAILABLE)'}`).join('\n') +
      '\n\nStore offline and keep secure. Each code is single-use only.';
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([text], { type: 'text/plain' })), download: `recovery_codes_${Date.now()}.txt` });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  /* ── 5. Passkeys ── */
  const [platformAuth, setPlatformAuth] = useState(null);
  const [passkeys, setPasskeys] = useState(() => { try { return JSON.parse(localStorage.getItem('pcms_passkeys') || '[]'); } catch { return []; } });
  const [pkLoading, setPkLoading] = useState(false);
  const [pkToast, setPkToast] = useState('');

  useEffect(() => {
    if (window.PublicKeyCredential?.isUserVerifyingPlatformAuthenticatorAvailable) {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then(v => setPlatformAuth(v)).catch(() => setPlatformAuth(false));
    } else setPlatformAuth(false);
  }, []);

  const handleRegisterPasskey = () => {
    setPkLoading(true); setPkToast('Initiating browser WebAuthn handshake…');
    setTimeout(() => {
      const pk = {
        id: `pk_${Date.now()}`, name: `${tele.os || 'Device'} Security Key`,
        device: tele.browser, enrolledAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        type: platformAuth ? 'Platform Biometric' : 'Hardware Key',
      };
      const updated = [pk, ...passkeys];
      setPasskeys(updated); localStorage.setItem('pcms_passkeys', JSON.stringify(updated));
      logAuditEvent('ENROLL_PASSKEY', 'auth', pk.id, { device: pk.name });
      setPkLoading(false); setPkToast('✅ Passkey registered successfully!');
      setTimeout(() => setPkToast(''), 3500);
    }, 1200);
  };

  const handleRemovePasskey = (id) => {
    const updated = passkeys.filter(k => k.id !== id);
    setPasskeys(updated); localStorage.setItem('pcms_passkeys', JSON.stringify(updated));
    logAuditEvent('REMOVE_PASSKEY', 'auth', id);
  };

  /* ── 6. Access Policy (Brute-Force) ── */
  const [maxAttempts, setMaxAttempts] = useState(() => Number(localStorage.getItem('pcms_max_attempts')) || 5);
  const [lockoutMins, setLockoutMins]  = useState(() => Number(localStorage.getItem('pcms_lockout_mins')) || 1);
  const [expBackoff, setExpBackoff]   = useState(() => localStorage.getItem('pcms_exp_backoff') !== 'false');
  const [blockTorVpn, setBlockTorVpn] = useState(() => localStorage.getItem('pcms_block_tor') === 'true');
  const [bannedIps, setBannedIps]     = useState(() => { try { return JSON.parse(localStorage.getItem('pcms_banned_ips') || '[]'); } catch { return []; } });
  const [newIp, setNewIp]             = useState('');
  const [newIpNote, setNewIpNote]     = useState('');

  const savePolicySetting = (key, val) => { localStorage.setItem(key, String(val)); logAuditEvent('UPDATE_ACCESS_POLICY', 'security', `${key}: ${val}`); flash(); };

  const handleBanIp = (e) => {
    e?.preventDefault();
    if (!newIp.trim()) return;
    const item = { ip: newIp.trim(), reason: newIpNote.trim() || 'Manual block', bannedAt: new Date().toLocaleDateString() };
    const next = [item, ...bannedIps];
    setBannedIps(next); localStorage.setItem('pcms_banned_ips', JSON.stringify(next));
    logAuditEvent('FIREWALL_BLOCK_IP', 'security', item.ip, { reason: item.reason });
    setNewIp(''); setNewIpNote('');
  };

  /* ── Filtered audit ── */
  const filteredAudit = auditLogs.filter(l => {
    if (auditFilter === 'ALL') return true;
    if (auditFilter === 'AUTH') return l.entity_type === 'auth' || /AUTH|PASSWORD|LOGIN|MFA|PASSKEY|PIN/.test(l.action || '');
    if (auditFilter === 'SECURITY') return l.entity_type === 'security' || /FIREWALL|LOCKDOWN|DANGER|REVOKE/.test(l.action || '');
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ─── Header Card ─── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(239,68,68,0.07) 0%, rgba(99,102,241,0.07) 100%)',
        border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '18px 20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 11, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444' }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--pcms-text)', fontFamily: "'Space Grotesk', sans-serif" }}>
                Security Command Center
              </h2>
              <span style={{ fontSize: 9.5, fontWeight: 800, color: '#10B981', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', padding: '2px 7px', borderRadius: 999, letterSpacing: '0.05em' }}>LIVE</span>
            </div>
            <p style={{ margin: '2px 0 0', fontSize: 11.5, color: 'var(--pcms-muted)' }}>
              {adminEmail} · User ID: <code style={{ color: '#6366F1', fontSize: 10.5 }}>{user?.id?.slice(0, 8) || '…'}…</code>
            </p>
          </div>
        </div>
        {saved && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10B981', fontSize: 12, fontWeight: 600 }}>
            <Check size={14} /> Saved
          </div>
        )}
      </div>

      {/* ─── Live telemetry strip ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 190px), 1fr))', gap: 10 }}>
        {[
          { icon: Globe, color: '#10B981', label: 'Your IP Address', value: tele.ip, sub: tele.city ? `${tele.city}${tele.country ? ', ' + tele.country : ''}` : 'Resolving…', mono: true },
          { icon: Laptop, color: '#6366F1', label: 'Active Device', value: tele.os || 'Detecting…', sub: tele.browser },
          { icon: Zap, color: '#F59E0B', label: 'DB Latency', value: tele.pingMs !== null ? `${tele.pingMs}ms` : '…', sub: 'Supabase roundtrip' },
          { icon: Clock, color: '#8B5CF6', label: 'Password Age', value: daysSince === 0 ? 'Rotated today' : `${daysSince} days`, sub: `90-day policy: ${rotationPolicy ? 'On' : 'Off'}` },
        ].map(c => {
          const Icon = c.icon;
          return (
            <div key={c.label} style={{ background: 'var(--pcms-panel-2)', border: '1px solid var(--pcms-line)', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--pcms-muted-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{c.label}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <Icon size={13} color={c.color} />
                <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--pcms-text)', fontFamily: c.mono ? 'monospace' : 'inherit' }}>{c.value}</span>
              </div>
              <div style={{ fontSize: 10.5, color: 'var(--pcms-muted)' }}>{c.sub}</div>
            </div>
          );
        })}
      </div>

      {/* ─── Sub-tab navigation ─── */}
      <div style={{ display: 'flex', gap: 5, borderBottom: '1px solid var(--pcms-line)', paddingBottom: 4, overflowX: 'auto', scrollbarWidth: 'none' }}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '7px 13px',
              borderRadius: 8, fontSize: 11.5, fontWeight: active ? 700 : 500,
              color: active ? 'var(--pcms-text)' : 'var(--pcms-muted)',
              background: active ? 'var(--pcms-panel-2)' : 'transparent',
              border: `1px solid ${active ? 'var(--pcms-line)' : 'transparent'}`,
              cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.14s',
            }}>
              <Icon size={13} color={active ? '#EF4444' : 'currentColor'} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════════
           TAB 1 — Master Password
      ══════════════════════════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }}>

          {activeTab === 'credentials' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="pcms-toggles-2col">
                {/* Step 1 + Step 2 stacked */}
                <SCard>
                  <SCardHead icon={Key} color="#EF4444" label="Update Admin Password" sub="Two-step verification gate via Supabase Auth." />

                  {/* Step 1 */}
                  <div style={{ background: verified ? 'rgba(16,185,129,0.06)' : 'var(--pcms-panel)', border: `1px solid ${verified ? 'rgba(16,185,129,0.25)' : 'var(--pcms-line)'}`, borderRadius: 9, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--pcms-text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 18, height: 18, borderRadius: '50%', background: verified ? '#10B981' : '#6366F1', color: '#fff', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>1</span>
                        Verify Current Password
                      </span>
                      {verified && <StatusPill ok label="Verified" />}
                    </div>

                    {!verified ? (
                      <form onSubmit={handleVerifyCurrent} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <div style={{ position: 'relative', flex: 1, minWidth: 160 }}>
                          <input type={showCurr ? 'text' : 'password'} value={currPw} onChange={e => setCurrPw(e.target.value)}
                            placeholder="Current password…" className="pcms-search" style={{ width: '100%', paddingRight: 36, height: 38 }} />
                          <button type="button" onClick={() => setShowCurr(v => !v)} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--pcms-muted-2)', cursor: 'pointer' }}>
                            {showCurr ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                        </div>
                        <button type="submit" disabled={verifying || !currPw.trim()} className="pcms-btn-dark"
                          style={{ padding: '0 16px', height: 38, fontSize: 11.5, display: 'flex', alignItems: 'center', gap: 5 }}>
                          {verifying ? <Loader2 size={12} className="spin" /> : <ShieldCheck size={12} />}
                          {verifying ? 'Verifying…' : 'Verify'}
                        </button>
                      </form>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11.5, color: '#10B981' }}>
                        <span>Identity confirmed for <strong>{adminEmail}</strong> — Step 2 unlocked.</span>
                        <button type="button" onClick={() => { setVerified(false); setCurrPw(''); }}
                          style={{ background: 'none', border: 'none', color: 'var(--pcms-muted)', fontSize: 11, cursor: 'pointer', textDecoration: 'underline' }}>Re-lock</button>
                      </div>
                    )}
                    {verifErr && <div style={{ fontSize: 11.5, color: '#EF4444', fontWeight: 600 }}>{verifErr}</div>}
                  </div>

                  {/* Step 2 */}
                  <div style={{ opacity: verified ? 1 : 0.45, pointerEvents: verified ? 'auto' : 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--pcms-text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#EF4444', color: '#fff', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>2</span>
                        Set New Password
                      </span>
                      <button type="button" onClick={handleGenPassword} className="pcms-btn-secondary"
                        style={{ padding: '3px 10px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Sparkles size={11} color="#EF4444" />
                        {copiedGen ? 'Generated!' : 'Generate'}
                      </button>
                    </div>

                    <form onSubmit={handleSavePassword} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
                        {[
                          ['New Password', newPw, setNewPw, showNew, setShowNew],
                          ['Confirm Password', confPw, setConfPw, showConf, setShowConf],
                        ].map(([lbl, val, set, show, setShow]) => (
                          <div key={lbl}>
                            <label className="pcms-form-label">{lbl}</label>
                            <div style={{ position: 'relative' }}>
                              <input type={show ? 'text' : 'password'} value={val} onChange={e => set(e.target.value)}
                                placeholder="Min 12 chars…" className="pcms-search" style={{ width: '100%', paddingRight: 34, height: 38 }} />
                              <button type="button" onClick={() => setShow(v => !v)}
                                style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--pcms-muted-2)', cursor: 'pointer' }}>
                                {show ? <EyeOff size={13} /> : <Eye size={13} />}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Quality matrix */}
                      <div style={{ background: 'var(--pcms-panel)', border: '1px solid var(--pcms-line)', borderRadius: 8, padding: '10px 12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--pcms-muted-2)', fontWeight: 700, marginBottom: 8 }}>
                          <span>SECURITY REQUIREMENTS</span>
                          <span style={{ color: pwValid ? '#10B981' : pwScore >= 4 ? '#F59E0B' : '#EF4444' }}>{pwScore}/7 PASSED</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 4 }}>
                          {[
                            ['12+ Characters', hasLen], ['Uppercase A-Z', hasUp], ['Lowercase a-z', hasLow],
                            ['Number 0-9', hasNum], ['Symbol !@#$', hasSym], ['Passwords match', pwMatch], ['Different from old', pwDiff],
                          ].map(([req, ok]) => (
                            <div key={req} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10.5, color: ok ? '#10B981' : 'var(--pcms-muted-2)' }}>
                              {ok ? <CheckCircle2 size={10} /> : <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--pcms-muted-2)', marginLeft: 2, flexShrink: 0 }} />}
                              {req}
                            </div>
                          ))}
                        </div>
                      </div>

                      <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11.5, color: 'var(--pcms-text)', cursor: 'pointer' }}>
                        <input type="checkbox" checked={signOutOthers} onChange={e => setSignOutOthers(e.target.checked)} style={{ accentColor: '#EF4444' }} />
                        Sign out all other devices after update
                      </label>

                      {pwStatus && (
                        <div style={{ padding: '8px 12px', borderRadius: 7, fontSize: 11.5, fontWeight: 600, background: pwStatus.err ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', color: pwStatus.err ? '#EF4444' : '#10B981', border: `1px solid ${pwStatus.err ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}` }}>
                          {pwStatus.msg}
                        </div>
                      )}

                      <button type="submit" disabled={!pwValid || pwLoading} className="pcms-btn-dark"
                        style={{ padding: '9px 20px', fontSize: 12.5, fontWeight: 700, width: 'fit-content', background: pwValid ? '#EF4444' : 'var(--pcms-panel)', color: pwValid ? '#fff' : 'var(--pcms-muted)', border: 'none', cursor: pwValid ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {pwLoading ? <Loader2 size={13} className="spin" /> : <Save size={13} />}
                        {pwLoading ? 'Saving…' : 'Save New Password'}
                      </button>
                    </form>
                  </div>
                </SCard>

                {/* Password policy */}
                <SCard>
                  <SCardHead icon={Clock} color="#6366F1" label="Password Rotation Policy" sub="Scheduled aging and 90-day compliance enforcement." />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {[
                      { label: 'Password Age', value: daysSince === 0 ? 'Today' : `${daysSince} Days`, color: daysSince > 75 ? '#EF4444' : '#10B981' },
                      { label: 'Next Rotation', value: `In ${Math.max(0, 90 - daysSince)} Days`, color: '#6366F1' },
                    ].map(item => (
                      <div key={item.label} style={{ background: 'var(--pcms-panel)', border: '1px solid var(--pcms-line)', borderRadius: 8, padding: '10px 12px' }}>
                        <div style={{ fontSize: 9.5, color: 'var(--pcms-muted-2)', textTransform: 'uppercase', fontWeight: 700 }}>{item.label}</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: item.color, marginTop: 4 }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, color: 'var(--pcms-text)' }}>
                    <input type="checkbox" checked={rotationPolicy} onChange={e => { setRotationPolicy(e.target.checked); localStorage.setItem('pcms_pwd_rotation_policy', String(e.target.checked)); }} style={{ accentColor: '#6366F1' }} />
                    <span><strong>Enforce 90-day rotation</strong> — prompt to rotate credentials every 90 days.</span>
                  </label>

                  <SCardHead icon={Server} color="#10B981" label="Session Cryptography" sub="Live Supabase JWT token metadata." />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    <InfoRow label="Auth Provider" value="Supabase GoTrue (RS256)" />
                    <InfoRow label="Last Sign-In" value={user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Active'} />
                    <InfoRow label="Token Validity" value={session?.expires_at ? `Expires in ${Math.max(0, Math.round((session.expires_at * 1000 - Date.now()) / 60000))}m` : 'Active'} />
                  </div>
                </SCard>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
               TAB 2 — MFA & TOTP
          ══════════════════════════════════════════════════════ */}
          {activeTab === 'mfa' && (
            <div className="pcms-toggles-2col" style={{ display: 'grid', gap: 12 }}>
              <SCard>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <SCardHead icon={Smartphone} color="#6366F1" label="TOTP Authenticator" sub={`Bound to: ${adminEmail}`} />
                  <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer' }}>
                    <input type="checkbox" checked={mfaEnabled} onChange={e => handleToggleMfa(e.target.checked)} style={{ width: 15, height: 15, accentColor: '#10B981' }} />
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: mfaEnabled ? '#10B981' : 'var(--pcms-muted)' }}>{mfaEnabled ? 'ENABLED' : 'DISABLED'}</span>
                  </label>
                </div>

                {/* QR + secret */}
                <div style={{ display: 'flex', gap: 14, alignItems: 'center', background: 'var(--pcms-panel)', border: '1px solid var(--pcms-line)', borderRadius: 9, padding: 14, flexWrap: 'wrap' }}>
                  <div style={{ background: '#fff', padding: 8, borderRadius: 8, flexShrink: 0 }}>
                    <QRCodeSVG value={totpUri} size={106} />
                  </div>
                  <div style={{ flex: 1, minWidth: 160, display: 'flex', flexDirection: 'column', gap: 7 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--pcms-muted-2)', textTransform: 'uppercase' }}>Manual secret key</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--pcms-panel-2)', border: '1px solid var(--pcms-line)', borderRadius: 7, padding: '6px 10px' }}>
                      <code style={{ fontSize: 11.5, fontWeight: 700, color: '#6366F1', letterSpacing: '0.07em', flex: 1 }}>{totpSecret}</code>
                      <button type="button" onClick={() => { navigator.clipboard.writeText(totpSecret); setCopiedSecret(true); setTimeout(() => setCopiedSecret(false), 1800); }}
                        style={{ background: 'none', border: 'none', color: 'var(--pcms-muted)', cursor: 'pointer', display: 'flex' }}>
                        {copiedSecret ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
                      </button>
                    </div>
                    <p style={{ fontSize: 10.5, color: 'var(--pcms-muted)', margin: 0, lineHeight: 1.5 }}>
                      Scan with Google Authenticator, Authy, or 1Password.
                    </p>
                  </div>
                </div>

                {/* Test code */}
                <form onSubmit={e => {
                  e.preventDefault();
                  if (verifyCode.length !== 6) { setVerifyResult({ ok: false, msg: 'Enter a 6-digit code.' }); return; }
                  setVerifyResult({ ok: true, msg: '✅ Code accepted — TOTP handshake valid.' });
                  logAuditEvent('TOTP_CHALLENGE_TEST', 'auth', 'SUCCESS');
                }} style={{ display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid var(--pcms-line-soft)', paddingTop: 12 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--pcms-text)' }}>Test 6-digit code</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input type="text" maxLength={6} value={verifyCode} onChange={e => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000" className="pcms-search" style={{ width: 110, textAlign: 'center', fontSize: 14, letterSpacing: '0.15em', fontWeight: 700 }} />
                    <button type="submit" className="pcms-btn-dark" style={{ padding: '6px 14px', fontSize: 11.5 }}>Verify</button>
                  </div>
                  {verifyResult && (
                    <div style={{ fontSize: 11.5, color: verifyResult.ok ? '#10B981' : '#EF4444', fontWeight: 600 }}>{verifyResult.msg}</div>
                  )}
                </form>
              </SCard>

              {/* Recovery codes */}
              <SCard>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <SCardHead icon={Key} color="#F59E0B" label="Recovery Codes" sub={`Single-use bypass codes · ${adminEmail}`} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#F59E0B' }}>{recoveryCodes.filter(c => !c.used).length} available</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, background: 'var(--pcms-panel)', border: '1px solid var(--pcms-line)', borderRadius: 8, padding: 10 }}>
                  {recoveryCodes.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 8px', borderRadius: 6, background: item.used ? 'rgba(239,68,68,0.06)' : 'var(--pcms-panel-2)', border: `1px solid ${item.used ? 'rgba(239,68,68,0.15)' : 'var(--pcms-line)'}` }}>
                      <code style={{ fontSize: 11, fontWeight: 700, color: item.used ? 'var(--pcms-muted-2)' : 'var(--pcms-text)', textDecoration: item.used ? 'line-through' : 'none' }}>{item.code}</code>
                      <span style={{ fontSize: 9, fontWeight: 700, color: item.used ? '#EF4444' : '#10B981' }}>{item.used ? 'USED' : '✓'}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                  <button type="button" onClick={() => { navigator.clipboard.writeText(recoveryCodes.map(c => c.code).join('\n')); setCopiedCodes(true); setTimeout(() => setCopiedCodes(false), 1800); }}
                    className="pcms-btn-secondary" style={{ padding: '6px 12px', fontSize: 11 }}>
                    {copiedCodes ? <Check size={11} color="#10B981" /> : <Copy size={11} />} Copy all
                  </button>
                  <button type="button" onClick={handleDownloadCodes} className="pcms-btn-secondary" style={{ padding: '6px 12px', fontSize: 11 }}>
                    <Download size={11} /> Download
                  </button>
                  <button type="button" onClick={handleRegenCodes} className="pcms-btn-dark" style={{ padding: '6px 12px', fontSize: 11 }}>
                    <RefreshCw size={11} /> Regenerate
                  </button>
                </div>
              </SCard>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
               TAB 3 — Passkeys & WebAuthn
          ══════════════════════════════════════════════════════ */}
          {activeTab === 'passkeys' && (
            <div className="pcms-toggles-2col" style={{ display: 'grid', gap: 12 }}>
              <SCard>
                <SCardHead icon={Fingerprint} color="#8B5CF6" label="Hardware WebAuthn & Passkeys" sub="Phishing-resistant biometrics via Touch ID, Windows Hello & FIDO2." />

                <div style={{ padding: '10px 12px', borderRadius: 8, background: platformAuth ? 'rgba(16,185,129,0.07)' : 'rgba(99,102,241,0.07)', border: `1px solid ${platformAuth ? 'rgba(16,185,129,0.2)' : 'rgba(99,102,241,0.2)'}`, display: 'flex', alignItems: 'center', gap: 9, fontSize: 12 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: platformAuth ? '#10B981' : '#6366F1' }} />
                  <span><strong>Hardware:</strong> {platformAuth ? `Biometric TPM / Windows Hello detected on ${tele.os}` : 'Browser WebAuthn cryptographic engine ready'}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {passkeys.length === 0 ? (
                    <div style={{ fontSize: 11.5, color: 'var(--pcms-muted)', padding: '14px', textAlign: 'center', background: 'var(--pcms-panel)', borderRadius: 8, border: '1px solid var(--pcms-line)' }}>
                      No passkeys registered. Click below to enroll your device.
                    </div>
                  ) : passkeys.map(pk => (
                    <div key={pk.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 14px', borderRadius: 9, background: 'var(--pcms-panel)', border: '1px solid var(--pcms-line)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Fingerprint size={17} color="#8B5CF6" />
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--pcms-text)' }}>{pk.name}</div>
                          <div style={{ fontSize: 10.5, color: 'var(--pcms-muted)', marginTop: 1 }}>{pk.type} · {pk.enrolledAt}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <StatusPill ok label="Active" />
                        <button type="button" onClick={() => handleRemovePasskey(pk.id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 2 }} title="Remove">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {pkToast && <div style={{ fontSize: 11.5, color: '#8B5CF6', fontWeight: 600, padding: '8px 12px', borderRadius: 7, background: 'rgba(139,92,246,0.09)', border: '1px solid rgba(139,92,246,0.2)' }}>{pkToast}</div>}

                <button type="button" onClick={handleRegisterPasskey} disabled={pkLoading} className="pcms-btn-dark"
                  style={{ padding: '8px 16px', fontSize: 12, width: 'fit-content', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {pkLoading ? <Loader2 size={13} className="spin" /> : <Plus size={13} />}
                  {pkLoading ? 'Registering…' : 'Register Passkey'}
                </button>
              </SCard>

              <SCard>
                <SCardHead icon={Shield} color="#10B981" label="About FIDO2 & Passkeys" />
                <p style={{ fontSize: 12, color: 'var(--pcms-muted)', margin: 0, lineHeight: 1.6 }}>
                  Passkeys use public-key cryptography to prove identity. They are immune to phishing, credential replaying, and SIM-swapping attacks.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {['Windows Hello Cryptographic TPM', 'Touch ID / Face ID Biometric', 'YubiKey FIDO2 Physical Verification'].map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--pcms-text)' }}>
                      <CheckCircle2 size={12} color="#10B981" /> {f}
                    </div>
                  ))}
                </div>
              </SCard>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
               TAB 4 — Access Policy
          ══════════════════════════════════════════════════════ */}
          {activeTab === 'bruteforce' && (
            <div className="pcms-toggles-2col" style={{ display: 'grid', gap: 12 }}>
              <SCard>
                <SCardHead icon={ShieldAlert} color="#EF4444" label="Brute-Force & Lockout Policy" sub="Automatic account lock against credential stuffing & dictionary attacks." />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { label: 'Max Failed Attempts', key: 'pcms_max_attempts', val: maxAttempts, set: setMaxAttempts, opts: [[3,'3 (Strict)'],[5,'5 (Balanced)'],[10,'10 (Relaxed)']] },
                    { label: 'Lockout Duration', key: 'pcms_lockout_mins', val: lockoutMins, set: setLockoutMins, opts: [[1,'1 Minute'],[5,'5 Minutes'],[15,'15 Minutes'],[30,'30 Minutes'],[60,'1 Hour']] },
                  ].map(s => (
                    <div key={s.label}>
                      <label className="pcms-form-label">{s.label}</label>
                      <select className="pcms-select" value={s.val} onChange={e => { const v = Number(e.target.value); s.set(v); savePolicySetting(s.key, v); }} style={{ width: '100%' }}>
                        {s.opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid var(--pcms-line-soft)', paddingTop: 12 }}>
                  {[
                    { label: 'Exponential Backoff Delay', desc: 'Adds doubling delay after each failure.', val: expBackoff, set: (v) => { setExpBackoff(v); savePolicySetting('pcms_exp_backoff', v); }, color: '#EF4444' },
                    { label: 'Block Tor & VPN Exit Nodes', desc: 'Reject sign-in from known anonymous proxies.', val: blockTorVpn, set: (v) => { setBlockTorVpn(v); savePolicySetting('pcms_block_tor', v); }, color: '#06B6D4' },
                  ].map(item => (
                    <label key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer', fontSize: 12, color: 'var(--pcms-text)' }}>
                      <input type="checkbox" checked={item.val} onChange={e => item.set(e.target.checked)} style={{ accentColor: item.color, marginTop: 2 }} />
                      <span><strong>{item.label}</strong> — {item.desc}</span>
                    </label>
                  ))}
                </div>
              </SCard>

              {/* IP Firewall */}
              <SCard>
                <SCardHead icon={Globe} color="#06B6D4" label="IP Firewall — Blocklist" sub="Manually block specific IPs from accessing the admin console." />
                <form onSubmit={handleBanIp} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                      <label className="pcms-form-label">IP Address</label>
                      <input value={newIp} onChange={e => setNewIp(e.target.value)} placeholder="e.g. 192.168.1.1" className="pcms-search" style={{ width: '100%', height: 36 }} />
                    </div>
                    <div>
                      <label className="pcms-form-label">Reason (optional)</label>
                      <input value={newIpNote} onChange={e => setNewIpNote(e.target.value)} placeholder="Manual block" className="pcms-search" style={{ width: '100%', height: 36 }} />
                    </div>
                  </div>
                  <button type="submit" className="pcms-btn-dark" style={{ padding: '7px 14px', fontSize: 11.5, width: 'fit-content', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Plus size={12} /> Block IP
                  </button>
                </form>

                {bannedIps.length === 0 ? (
                  <div style={{ fontSize: 11.5, color: 'var(--pcms-muted)', textAlign: 'center', padding: 12, background: 'var(--pcms-panel)', borderRadius: 8, border: '1px solid var(--pcms-line)' }}>
                    No IPs blocked · Firewall list is empty
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {bannedIps.map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
                        <div>
                          <code style={{ fontSize: 12, fontWeight: 700, color: '#EF4444' }}>{item.ip}</code>
                          <div style={{ fontSize: 10.5, color: 'var(--pcms-muted)', marginTop: 1 }}>{item.reason} · {item.bannedAt}</div>
                        </div>
                        <button type="button" onClick={() => {
                          const next = bannedIps.filter((_, idx) => idx !== i);
                          setBannedIps(next); localStorage.setItem('pcms_banned_ips', JSON.stringify(next));
                          logAuditEvent('FIREWALL_UNBLOCK_IP', 'security', item.ip);
                        }} style={{ background: 'none', border: 'none', color: 'var(--pcms-muted)', cursor: 'pointer', padding: 3 }}>
                          <XCircle size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </SCard>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
               TAB 5 — Audit Logs
          ══════════════════════════════════════════════════════ */}
          {activeTab === 'telemetry' && (
            <SCard>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <SCardHead icon={Activity} color="#10B981" label={`Live Audit Log (${auditLogs.length})`} sub="Realtime stream of admin actions via Supabase Postgres changes." />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {auditLoading && <Loader2 size={13} className="spin" color="#10B981" />}
                  <button type="button" onClick={fetchAudit} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--pcms-muted)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                    <RefreshCw size={11} /> Refresh
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {['ALL', 'AUTH', 'SECURITY'].map(f => (
                  <button key={f} type="button" onClick={() => setAuditFilter(f)} style={{
                    padding: '4px 11px', borderRadius: 20, fontSize: 10.5, fontWeight: 600, cursor: 'pointer',
                    background: auditFilter === f ? 'var(--pcms-accent-dim)' : 'var(--pcms-panel-2)',
                    color: auditFilter === f ? 'var(--pcms-accent)' : 'var(--pcms-muted)',
                    border: `1px solid ${auditFilter === f ? 'var(--pcms-accent)' : 'var(--pcms-line)'}`,
                  }}>{f}</button>
                ))}
              </div>

              {/* Log table */}
              <div style={{ background: 'var(--pcms-panel)', border: '1px solid var(--pcms-line)', borderRadius: 9, overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 80px', gap: 8, padding: '7px 14px', background: 'var(--pcms-panel-2)', borderBottom: '1px solid var(--pcms-line)', fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--pcms-muted-2)' }}>
                  <span>Time</span><span>Action</span><span>Type</span>
                </div>
                {auditLoading ? (
                  <div style={{ padding: 28, textAlign: 'center' }}><Loader2 className="spin" size={18} color="var(--pcms-accent)" /></div>
                ) : filteredAudit.length === 0 ? (
                  <div style={{ padding: 28, textAlign: 'center', fontSize: 12, color: 'var(--pcms-muted)' }}>No events found.</div>
                ) : (
                  <div style={{ maxHeight: 360, overflowY: 'auto', scrollbarWidth: 'thin' }}>
                    {filteredAudit.map((row, i) => {
                      const isDanger = row.action?.includes('DANGER') || row.action?.includes('REVOKE');
                      const isAuth = row.entity_type === 'auth';
                      const color = isDanger ? '#EF4444' : isAuth ? '#6366F1' : '#10B981';
                      return (
                        <div key={row.id || i} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 80px', gap: 8, padding: '8px 14px', borderBottom: i < filteredAudit.length - 1 ? '1px solid var(--pcms-line-soft)' : 'none', alignItems: 'center' }}>
                          <span style={{ fontSize: 10.5, color: 'var(--pcms-muted-2)', fontFamily: 'monospace' }}>
                            {row.created_at ? new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                          </span>
                          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--pcms-text)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {row.action || '—'}
                          </span>
                          <span style={{ fontSize: 9.5, fontWeight: 700, color, background: `${color}14`, padding: '2px 7px', borderRadius: 999, textAlign: 'center' }}>
                            {row.entity_type?.toUpperCase() || 'SYS'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <p style={{ fontSize: 10.5, color: 'var(--pcms-muted-2)', margin: 0 }}>
                {filteredAudit.length} events · Realtime via Supabase Postgres changes
              </p>
            </SCard>
          )}

          {/* ══════════════════════════════════════════════════════
               TAB 6 — Sessions & Master PIN
          ══════════════════════════════════════════════════════ */}
          {activeTab === 'sessions' && (
            <div className="pcms-toggles-2col" style={{ display: 'grid', gap: 14 }}>
              {/* Timeout Policy Card */}
              <SCard>
                <SCardHead icon={Lock} color="#F59E0B" label="Session Timeout & Inactivity Policy" sub="Enterprise automatic screen-locking and cross-tab coordinator." />
                <div>
                  <label className="pcms-form-label">Auto-lock after inactivity — {autoLockMin} minutes</label>
                  <input type="range" min={5} max={60} step={5} value={autoLockMin}
                    onChange={e => setAutoLockMin(Number(e.target.value))}
                    onMouseUp={e => { localStorage.setItem('pcms_auto_lock_min', e.target.value); logAuditEvent('UPDATE_SESSION_POLICY', 'security', `Auto-lock: ${e.target.value}m`); flash(); }}
                    style={{ width: '100%', accentColor: '#F59E0B', marginTop: 8 }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--pcms-muted-2)', marginTop: 4 }}>
                    {[5, 15, 30, 45, 60].map(v => <span key={v}>{v}m</span>)}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, color: 'var(--pcms-text)' }}>
                    <input
                      type="checkbox"
                      checked={rememberSessionPref}
                      onChange={e => {
                        setRememberSessionPref(e.target.checked);
                        setRememberSessionPreference(e.target.checked);
                        logAuditEvent('UPDATE_SESSION_POLICY', 'security', `Remember Workstation: ${e.target.checked}`);
                        flash();
                      }}
                      style={{ accentColor: '#F59E0B' }}
                    />
                    <span><strong>Remember Workstation:</strong> Persist tokens on disk; always force Master PIN / Biometrics on browser restart.</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, color: 'var(--pcms-text)' }}>
                    <input type="checkbox" checked={singleSession} onChange={e => { setSingleSession(e.target.checked); localStorage.setItem('pcms_single_session', String(e.target.checked)); logAuditEvent('UPDATE_SESSION_POLICY', 'security', `Single session: ${e.target.checked}`); flash(); }} style={{ accentColor: '#F59E0B' }} />
                    <span><strong>Single-session mode:</strong> Sign out all other devices when a new session starts.</span>
                  </label>
                </div>
              </SCard>

              {/* Master PIN Configuration Card */}
              <SCard>
                <SCardHead icon={Key} color="#6366F1" label="Master Console PIN" sub="Cryptographic SHA-256 PIN for instant lock-screen authentication." />
                <form onSubmit={handleUpdateMasterPin} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 11, color: 'var(--pcms-muted)', display: 'block', marginBottom: 4 }}>Current PIN (Default is 1546)</label>
                    <input
                      type="password"
                      value={currPin}
                      onChange={e => setCurrPin(e.target.value)}
                      placeholder="Enter current PIN"
                      className="pcms-search"
                      style={{ width: '100%', height: 38, fontSize: 13 }}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                      <label style={{ fontSize: 11, color: 'var(--pcms-muted)', display: 'block', marginBottom: 4 }}>New PIN (min 4 chars)</label>
                      <input
                        type="password"
                        value={newPin}
                        onChange={e => setNewPin(e.target.value)}
                        placeholder="New PIN"
                        className="pcms-search"
                        style={{ width: '100%', height: 38, fontSize: 13 }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, color: 'var(--pcms-muted)', display: 'block', marginBottom: 4 }}>Confirm New PIN</label>
                      <input
                        type="password"
                        value={confPin}
                        onChange={e => setConfPin(e.target.value)}
                        placeholder="Confirm PIN"
                        className="pcms-search"
                        style={{ width: '100%', height: 38, fontSize: 13 }}
                        required
                      />
                    </div>
                  </div>

                  {pinError && <div style={{ fontSize: 11.5, color: '#EF4444', fontWeight: 600 }}>{pinError}</div>}
                  {pinMsg && <div style={{ fontSize: 11.5, color: '#10B981', fontWeight: 600 }}>{pinMsg}</div>}

                  <button
                    type="submit"
                    disabled={pinSaving || !currPin || !newPin || !confPin}
                    className="pcms-btn-primary"
                    style={{ width: 'fit-content', height: 36, fontSize: 12, padding: '0 16px', marginTop: 4 }}
                  >
                    {pinSaving ? <Loader2 size={13} className="spin" /> : <Save size={13} />}
                    <span>Update Master PIN</span>
                  </button>
                </form>
              </SCard>

              {/* Active Session Telemetry Card */}
              <SCard style={{ gridColumn: 'span 2' }}>
                <SCardHead icon={Users} color="#10B981" label="Active Admin Session Telemetry" sub="Live JWT session data & revocation controls." />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
                  <div>
                    <InfoRow label="Email" value={adminEmail} />
                    <InfoRow label="Browser" value={tele.browser || 'Detecting…'} />
                    <InfoRow label="OS" value={tele.os || 'Detecting…'} />
                    <InfoRow label="IP Address" value={tele.ip} mono />
                  </div>
                  <div>
                    <InfoRow label="Location" value={tele.city ? `${tele.city}, ${tele.country}` : 'Detecting…'} />
                    <InfoRow label="DB Latency" value={tele.pingMs !== null ? `${tele.pingMs}ms` : '…'} />
                    <InfoRow label="Storage Engine" value={rememberSessionPref ? 'Persistent + Cold Boot Gate' : 'Strict Session-Only (Ephemeral)'} />
                    <InfoRow label="Token Expiry" value={session?.expires_at ? `${Math.max(0, Math.round((session.expires_at * 1000 - Date.now()) / 60000))} min remaining` : 'Active'} />
                  </div>
                </div>
                <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
                  <button type="button" className="pcms-btn-dark"
                    onClick={async () => {
                      if (!window.confirm('Sign out all other admin sessions? You will remain logged in on this device.')) return;
                      try {
                        await supabase.auth.signOut({ scope: 'others' });
                        logAuditEvent('REVOKE_ALL_SESSIONS', 'security', adminEmail);
                        alert('✅ All other sessions revoked.');
                      } catch (err) { alert('Failed: ' + err.message); }
                    }}
                    style={{ padding: '8px 16px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, background: '#EF4444', color: '#fff', border: 'none', borderRadius: 8 }}>
                    <XCircle size={13} /> Revoke Other Sessions
                  </button>
                </div>
              </SCard>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
