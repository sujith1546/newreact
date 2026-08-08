import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { QRCodeSVG } from "qrcode.react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Shield, Trash2, Key, Loader2, CheckCircle2, QrCode, Lock, RefreshCw, Copy, Check } from "lucide-react";

export default function AdminMfaSetup() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [factors, setFactors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // TOTP State
  const [totpFactorId, setTotpFactorId] = useState("");
  const [qrCodeData, setQrCodeData] = useState("");
  const [secretCode, setSecretCode] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [totpError, setTotpError] = useState("");
  const [totpSetupMode, setTotpSetupMode] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  // Disable MFA State
  const [disableMode, setDisableMode] = useState(null); // stores factorId to disable
  const [password, setPassword] = useState("");
  const [disableError, setDisableError] = useState("");
  const [disableLoading, setDisableLoading] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add('admin-mode');
    document.body.classList.add('admin-mode');
    const originalBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = '#0a0d10';
    loadFactors();

    return () => {
      document.documentElement.classList.remove('admin-mode');
      document.body.classList.remove('admin-mode');
      document.body.style.backgroundColor = originalBg;
    };
  }, []);

  async function loadFactors() {
    setLoading(true);
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) {
      console.error("Error loading factors:", error);
    } else {
      setFactors(data?.all || []);
    }
    setLoading(false);
  }

  /* ------------------------------------------------------------------
     TOTP Setup Flow
     ------------------------------------------------------------------ */
  async function startTotpSetup() {
    setTotpSetupMode(true);
    setTotpError("");
    setVerificationCode("");
    setCopiedSecret(false);
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
    });

    if (error) {
      setTotpError(error.message);
      return;
    }

    setTotpFactorId(data.id);
    setQrCodeData(data.totp.qr_code);
    setSecretCode(data.totp.secret || "");
  }

  async function verifyTotp() {
    if (!verificationCode || verificationCode.length !== 6) {
      setTotpError("Please enter a valid 6-digit verification code.");
      return;
    }
    setTotpError("");
    const challenge = await supabase.auth.mfa.challenge({ factorId: totpFactorId });
    if (challenge.error) {
      setTotpError(challenge.error.message);
      return;
    }

    const verify = await supabase.auth.mfa.verify({
      factorId: totpFactorId,
      challengeId: challenge.data.id,
      code: verificationCode,
    });

    if (verify.error) {
      setTotpError(verify.error.message);
      return;
    }

    // Success!
    setTotpSetupMode(false);
    loadFactors();
  }

  /* ------------------------------------------------------------------
     Disable MFA Flow (Requires Password Re-auth)
     ------------------------------------------------------------------ */
  async function confirmDisable() {
    if (!password) {
      setDisableError("Password is required to disable 2FA.");
      return;
    }
    setDisableError("");
    setDisableLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: user?.email || "",
      password: password
    });

    if (authError) {
      setDisableError("Incorrect password. Re-authentication failed.");
      setDisableLoading(false);
      return;
    }

    const { error: unenrollError } = await supabase.auth.mfa.unenroll({
      factorId: disableMode
    });

    if (unenrollError) {
      setDisableError(unenrollError.message);
    } else {
      setDisableMode(null);
      setPassword("");
      loadFactors();
    }
    setDisableLoading(false);
  }

  const copySecret = () => {
    if (secretCode) {
      navigator.clipboard.writeText(secretCode);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  return (
    <div style={styles.page}>
      <style>{`
        html, body, #root {
          background-color: #0a0d10 !important;
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          height: 100% !important;
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
      
      <div style={styles.card}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <button onClick={() => navigate("/admin/dashboard")} style={styles.backBtn} type="button">
            <ArrowLeft size={16} color="#94a3b8" />
            <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>Back to Admin Console</span>
          </button>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '4px 12px', borderRadius: 999, fontWeight: 600 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
            <span>2FA Security Hub</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={22} color="#3b82f6" />
          </div>
          <div>
            <h1 style={styles.title}>Two-Factor Authentication (2FA)</h1>
            <p style={styles.subtitle}>Protect your admin account with Google Authenticator, Authy, or 1Password.</p>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0', gap: 12 }}>
            <Loader2 className="spin" size={28} color="#3b82f6" />
            <span style={{ fontSize: 13, color: '#94a3b8' }}>Checking MFA security factors...</span>
          </div>
        ) : (
          <div style={styles.section}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={styles.sectionTitle}>ENROLLED 2FA FACTORS</h3>
              <button onClick={loadFactors} style={styles.refreshBtn} type="button" title="Refresh factors">
                <RefreshCw size={13} color="#94a3b8" />
              </button>
            </div>

            {factors.length === 0 ? (
              <div style={{ padding: '20px 16px', background: '#0f172a', borderRadius: 10, border: '1px solid #1e293b', textAlign: 'center', marginBottom: 20 }}>
                <Lock size={24} color="#64748b" style={{ margin: '0 auto 8px', display: 'block' }} />
                <p style={{ color: "#94a3b8", fontSize: 13, margin: '0 0 4px', fontWeight: 500 }}>No 2FA factor configured yet.</p>
                <p style={{ color: "#64748b", fontSize: 12, margin: 0 }}>Pair Google Authenticator to enable 6-digit TOTP security code login.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                {factors.map(f => (
                  <div key={f.id} style={styles.factorItem}>
                    <div>
                      <p style={styles.factorType}>
                        Authenticator App (TOTP)
                        {f.status === 'verified' && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginLeft: 8, fontSize: 11, color: '#10b981', fontWeight: 600 }}>
                            <CheckCircle2 size={13} color="#10b981" /> Verified &amp; Active
                          </span>
                        )}
                      </p>
                      <p style={styles.factorId}>Factor ID: {f.id}</p>
                    </div>
                    {f.status === 'verified' && (
                      <button onClick={() => setDisableMode(f.id)} style={styles.dangerBtn} type="button">
                        <Trash2 size={13} /> Disable
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Disable MFA confirmation box */}
            {disableMode && (
              <div style={styles.authGate}>
                <label htmlFor="disablePassword" style={{ fontSize: 13, color: '#ef4444', marginBottom: 8, fontWeight: 600, display: 'block' }}>
                  Re-enter password to disable 2FA factor:
                </label>
                <div style={styles.inputWrap}>
                  <Key size={15} color="#64748b" />
                  <input
                    id="disablePassword"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Admin Password"
                    style={styles.input}
                  />
                </div>
                {disableError && <p style={styles.error}>{disableError}</p>}
                <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                  <button onClick={confirmDisable} disabled={disableLoading} style={styles.dangerBtnFill} type="button">
                    {disableLoading ? 'Verifying...' : 'Confirm & Disable'}
                  </button>
                  <button onClick={() => setDisableMode(null)} style={styles.cancelBtn} type="button">Cancel</button>
                </div>
              </div>
            )}

            {/* Enable TOTP button */}
            {!disableMode && !totpSetupMode && (
              <div style={{ marginTop: 16 }}>
                <button onClick={startTotpSetup} style={styles.primaryBtn} type="button">
                  <QrCode size={16} />
                  <span>Setup Google Authenticator (TOTP) →</span>
                </button>
              </div>
            )}

            {/* TOTP Setup Wizard */}
            {totpSetupMode && (
              <div style={styles.setupBox}>
                <h4 style={{ margin: '0 0 12px', fontSize: 14, color: '#f8fafc', fontWeight: 700 }}>1. Scan QR Code in Google Authenticator or Authy</h4>
                <div style={{ background: '#ffffff', padding: 14, borderRadius: 12, display: 'inline-block', marginBottom: 14, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
                  {qrCodeData ? <QRCodeSVG value={qrCodeData} size={160} /> : <Loader2 className="spin" size={28} color="#000" />}
                </div>

                {secretCode && (
                  <div style={{ marginBottom: 16, textAlign: 'left' }}>
                    <span style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Or manually enter Secret Key:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#0f172a', padding: '8px 12px', borderRadius: 8, border: '1px solid #1e293b' }}>
                      <code style={{ fontFamily: 'monospace', fontSize: 13, color: '#38bdf8', flex: 1, letterSpacing: '1px' }}>{secretCode}</code>
                      <button onClick={copySecret} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 2 }} type="button" title="Copy secret">
                        {copiedSecret ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                )}

                <label htmlFor="setupTotp" style={{ margin: '0 0 8px', fontSize: 13.5, color: '#f8fafc', display: 'block', fontWeight: 600 }}>
                  2. Enter 6-Digit Verification Code
                </label>
                <div style={styles.inputWrap}>
                  <input
                    id="setupTotp"
                    type="text"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={verificationCode}
                    onChange={e => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    style={{ ...styles.input, textAlign: 'center', letterSpacing: '6px', fontSize: 18, fontWeight: 700 }}
                  />
                </div>
                {totpError && <p style={styles.error}>{totpError}</p>}
                
                <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                  <button onClick={verifyTotp} style={styles.primaryBtn} type="button">Verify &amp; Activate 2FA</button>
                  <button onClick={() => setTotpSetupMode(false)} style={styles.cancelBtn} type="button">Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100vw",
    height: "100vh",
    minWidth: "100vw",
    minHeight: "100vh",
    zIndex: 999999,
    background: "#0a0d10",
    backgroundImage: `
      radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.15) 0%, transparent 60%),
      linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
    `,
    backgroundSize: "100% 100%, 48px 48px, 48px 48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    overflowY: "auto",
    fontFamily: "'Inter', -apple-system, sans-serif"
  },
  card: {
    background: "#12161b",
    border: "1px solid #232a31",
    borderRadius: 20,
    padding: "32px",
    width: 520,
    maxWidth: "96%",
    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05)",
    color: "#e8ecef"
  },
  backBtn: {
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    padding: "6px 12px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 8,
    transition: "all 0.15s ease"
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    color: "#ffffff",
    margin: 0,
    letterSpacing: "-0.01em"
  },
  subtitle: {
    fontSize: 12.5,
    color: "#94a3b8",
    margin: "4px 0 0 0",
    lineHeight: 1.45
  },
  section: {
    background: "#161b21",
    border: "1px solid #232a31",
    borderRadius: 14,
    padding: 24,
    marginTop: 16
  },
  sectionTitle: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "#64748b",
    margin: 0,
    fontWeight: 700
  },
  refreshBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 4,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  factorItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#0f172a",
    padding: "14px 16px",
    borderRadius: 10,
    border: "1px solid #1e293b"
  },
  factorType: {
    margin: 0,
    fontSize: 13.5,
    color: "#ffffff",
    fontWeight: 600
  },
  factorId: {
    margin: "4px 0 0 0",
    fontSize: 11,
    color: "#64748b",
    fontFamily: "monospace"
  },
  primaryBtn: {
    width: "100%",
    background: "#3b82f6",
    color: "#ffffff",
    border: "none",
    padding: "12px 18px",
    borderRadius: 10,
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 13.5,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    boxShadow: "0 4px 14px rgba(59, 130, 246, 0.3)"
  },
  dangerBtn: {
    background: "rgba(239, 68, 68, 0.1)",
    color: "#ef4444",
    border: "1px solid rgba(239, 68, 68, 0.2)",
    padding: "6px 12px",
    borderRadius: 8,
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 6
  },
  dangerBtnFill: {
    background: "#ef4444",
    color: "#ffffff",
    border: "none",
    padding: "10px 16px",
    borderRadius: 8,
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 13
  },
  cancelBtn: {
    background: "rgba(255, 255, 255, 0.05)",
    color: "#94a3b8",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    padding: "10px 16px",
    borderRadius: 8,
    fontWeight: 500,
    cursor: "pointer",
    fontSize: 13
  },
  setupBox: {
    marginTop: 20,
    borderTop: "1px solid #232a31",
    paddingTop: 20,
    textAlign: "center"
  },
  inputWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#0f172a",
    border: "1px solid #334155",
    borderRadius: 10,
    padding: "0 14px",
    height: 44,
  },
  input: {
    flex: 1,
    border: "none",
    background: "transparent",
    outline: "none",
    fontSize: 14,
    color: "#ffffff",
    height: "100%",
  },
  error: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 8,
    textAlign: "left"
  },
  authGate: {
    marginTop: 16,
    padding: 16,
    background: "rgba(239, 68, 68, 0.05)",
    border: "1px solid rgba(239, 68, 68, 0.2)",
    borderRadius: 10
  }
};
