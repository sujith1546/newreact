import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { QRCodeSVG } from "qrcode.react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Shield, Trash2, Key, Loader2, CheckCircle2 } from "lucide-react";

export default function AdminMfaSetup() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [factors, setFactors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // TOTP State
  const [totpFactorId, setTotpFactorId] = useState("");
  const [qrCodeData, setQrCodeData] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [totpError, setTotpError] = useState("");
  const [totpSetupMode, setTotpSetupMode] = useState(false);

  // Disable MFA State
  const [disableMode, setDisableMode] = useState(null); // stores factorId to disable
  const [password, setPassword] = useState("");
  const [disableError, setDisableError] = useState("");
  const [disableLoading, setDisableLoading] = useState(false);

  useEffect(() => {
    loadFactors();
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
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
    });

    if (error) {
      setTotpError(error.message);
      return;
    }

    setTotpFactorId(data.id);
    setQrCodeData(data.totp.qr_code);
  }

  async function verifyTotp() {
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
     Passkey / WebAuthn Setup Flow (Optional / Experimental)
     ------------------------------------------------------------------ */
  async function startWebauthnSetup() {
    // Note: WebAuthn requires browser support and HTTPS.
    if (!window.PublicKeyCredential) {
      alert("Passkeys are not supported on this browser/device.");
      return;
    }

    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "webauthn"
    });

    if (error) {
      alert("Error enrolling passkey: " + error.message + " (Check if your Supabase project tier supports WebAuthn MFA).");
      return;
    }

    const challenge = await supabase.auth.mfa.challenge({ factorId: data.id });
    if (challenge.error) {
      alert("Error generating challenge: " + challenge.error.message);
      return;
    }

    const verify = await supabase.auth.mfa.verify({
      factorId: data.id,
      challengeId: challenge.data.id
    });

    if (verify.error) {
      alert("Error verifying passkey: " + verify.error.message);
      return;
    }

    loadFactors();
  }

  /* ------------------------------------------------------------------
     Disable MFA Flow (Requires Password Re-auth)
     ------------------------------------------------------------------ */
  async function confirmDisable() {
    setDisableError("");
    setDisableLoading(true);

    // 1. Re-authenticate user to prove identity before disabling MFA
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: password
    });

    if (authError) {
      setDisableError("Incorrect password. Re-authentication failed.");
      setDisableLoading(false);
      return;
    }

    // 2. Unenroll factor
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

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
          <button onClick={() => navigate("/admin/dashboard")} style={styles.iconBtn}>
            <ArrowLeft size={18} color="#a1a1aa" />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 12 }}>
            <Shield size={22} color="#3b82f6" />
            <h1 style={styles.title}>Multi-Factor Authentication</h1>
          </div>
        </div>

        <p style={styles.subtitle}>
          Secure your admin account with TOTP (Authenticator App) or Passkeys.
          <br /><br />
          <strong>Note:</strong> You must manually visit this page to configure or disable MFA. Keep it secure!
        </p>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
            <Loader2 className="spin" size={24} color="#a1a1aa" />
          </div>
        ) : (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Enrolled Factors</h3>
            {factors.length === 0 ? (
              <p style={{ color: "#a1a1aa", fontSize: 13, marginBottom: 16 }}>No MFA factors configured.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {factors.map(f => (
                  <div key={f.id} style={styles.factorItem}>
                    <div>
                      <p style={styles.factorType}>
                        {f.factor_type === 'totp' ? 'Authenticator App (TOTP)' : 'Passkey (WebAuthn)'}
                        {f.status === 'verified' && <CheckCircle2 size={14} color="#10b981" style={{ marginLeft: 6, verticalAlign: 'middle' }} />}
                      </p>
                      <p style={styles.factorId}>ID: {f.id.split('-')[0]}...</p>
                    </div>
                    {f.status === 'verified' && (
                      <button onClick={() => setDisableMode(f.id)} style={styles.dangerBtn}>
                        <Trash2 size={14} /> Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {disableMode && (
              <div style={styles.authGate}>
                <p style={{ fontSize: 13, color: '#ef4444', marginBottom: 12, fontWeight: 500 }}>
                  Re-enter your password to disable this MFA factor:
                </p>
                <div style={styles.inputWrap}>
                  <Key size={14} color="#a1a1aa" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Admin Password"
                    style={styles.input}
                  />
                </div>
                {disableError && <p style={styles.error}>{disableError}</p>}
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button onClick={confirmDisable} disabled={disableLoading} style={styles.dangerBtnFill}>
                    {disableLoading ? 'Verifying...' : 'Confirm Disable'}
                  </button>
                  <button onClick={() => setDisableMode(null)} style={styles.cancelBtn}>Cancel</button>
                </div>
              </div>
            )}

            {!disableMode && (
              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                {!totpSetupMode && (
                  <button onClick={startTotpSetup} style={styles.primaryBtn}>
                    Setup TOTP App
                  </button>
                )}
                {window.PublicKeyCredential && (
                  <button onClick={startWebauthnSetup} style={styles.secondaryBtn}>
                    Register Passkey
                  </button>
                )}
              </div>
            )}

            {totpSetupMode && (
              <div style={styles.setupBox}>
                <h4 style={{ margin: '0 0 12px', fontSize: 14, color: '#fff' }}>1. Scan QR Code</h4>
                <div style={{ background: '#fff', padding: 16, borderRadius: 8, display: 'inline-block', marginBottom: 16 }}>
                  {qrCodeData ? <QRCodeSVG value={qrCodeData} size={150} /> : <Loader2 className="spin" size={24} color="#000" />}
                </div>

                <h4 style={{ margin: '0 0 12px', fontSize: 14, color: '#fff' }}>2. Enter Verification Code</h4>
                <div style={styles.inputWrap}>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={e => setVerificationCode(e.target.value)}
                    placeholder="123456"
                    style={styles.input}
                  />
                </div>
                {totpError && <p style={styles.error}>{totpError}</p>}
                
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <button onClick={verifyTotp} style={styles.primaryBtn}>Verify & Enable</button>
                  <button onClick={() => setTotpSetupMode(false)} style={styles.cancelBtn}>Cancel</button>
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
    minHeight: "100vh",
    background: "#1e1e1e",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    fontFamily: "system-ui, -apple-system, sans-serif"
  },
  card: {
    background: "#2a2a2a",
    border: "1px solid #3f3f46",
    borderRadius: 16,
    padding: 32,
    width: 500,
    maxWidth: "100%",
    boxShadow: "0 10px 40px rgba(0,0,0,0.5)"
  },
  iconBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 8,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  title: {
    fontSize: 20,
    fontWeight: 600,
    color: "#ffffff",
    margin: 0
  },
  subtitle: {
    fontSize: 13,
    color: "#a1a1aa",
    margin: "0 0 24px 0",
    lineHeight: 1.5
  },
  section: {
    background: "#222222",
    border: "1px solid #3f3f46",
    borderRadius: 12,
    padding: 20
  },
  sectionTitle: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#a1a1aa",
    margin: "0 0 16px 0",
    fontWeight: 600
  },
  factorItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#1a1a1a",
    padding: "12px 16px",
    borderRadius: 8,
    border: "1px solid #3f3f46"
  },
  factorType: {
    margin: 0,
    fontSize: 14,
    color: "#ffffff",
    fontWeight: 500
  },
  factorId: {
    margin: "4px 0 0 0",
    fontSize: 12,
    color: "#71717a",
    fontFamily: "monospace"
  },
  primaryBtn: {
    background: "#ffffff",
    color: "#000000",
    border: "none",
    padding: "8px 16px",
    borderRadius: 6,
    fontWeight: 500,
    cursor: "pointer",
    fontSize: 13
  },
  secondaryBtn: {
    background: "transparent",
    color: "#ffffff",
    border: "1px solid #52525b",
    padding: "8px 16px",
    borderRadius: 6,
    fontWeight: 500,
    cursor: "pointer",
    fontSize: 13
  },
  dangerBtn: {
    background: "rgba(239, 68, 68, 0.1)",
    color: "#ef4444",
    border: "1px solid rgba(239, 68, 68, 0.2)",
    padding: "6px 12px",
    borderRadius: 6,
    fontWeight: 500,
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
    padding: "8px 16px",
    borderRadius: 6,
    fontWeight: 500,
    cursor: "pointer",
    fontSize: 13
  },
  cancelBtn: {
    background: "transparent",
    color: "#a1a1aa",
    border: "none",
    padding: "8px 16px",
    borderRadius: 6,
    fontWeight: 500,
    cursor: "pointer",
    fontSize: 13
  },
  setupBox: {
    marginTop: 24,
    borderTop: "1px solid #3f3f46",
    paddingTop: 24
  },
  inputWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#1a1a1a",
    border: "1px solid #3f3f46",
    borderRadius: "8px",
    padding: "0 12px",
    height: 40,
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
    marginTop: 8
  },
  authGate: {
    marginTop: 16,
    padding: 16,
    background: "rgba(239, 68, 68, 0.05)",
    border: "1px solid rgba(239, 68, 68, 0.2)",
    borderRadius: 8
  }
};
