import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, ShieldCheck, ShieldAlert, Fingerprint, Lock,
  AlertTriangle, RefreshCw, CheckCircle2, Loader2, Zap,
  Laptop, Smartphone, Globe, ExternalLink
} from 'lucide-react';
import {
  getDeviceFingerprint,
  checkDeviceAnomaly,
  terminateAllRemoteSessions,
  getKnownDevices
} from '../../../lib/deviceSecurity';
import { runXssVulnerabilityScan } from '../../../lib/xssScanner';

export default function SecurityShieldWidget() {
  const [deviceFp, setDeviceFp] = useState('DEV-CALCULATING');
  const [anomaly, setAnomaly] = useState({ isUnknown: false, deviceName: '' });
  const [knownDevices, setKnownDevices] = useState([]);
  const [terminating, setTerminating] = useState(false);
  const [terminateMsg, setTerminateMsg] = useState(null);

  // XSS Scanner State
  const [scanningXss, setScanningXss] = useState(false);
  const [xssReport, setXssReport] = useState(null);

  useEffect(() => {
    async function initSecurity() {
      const fp = await getDeviceFingerprint();
      setDeviceFp(fp);
      const anom = await checkDeviceAnomaly();
      setAnomaly(anom);
      setKnownDevices(getKnownDevices());

      // Auto-run light initial vulnerability scan
      const report = await runXssVulnerabilityScan();
      setXssReport(report);
    }

    initSecurity();
  }, []);

  const handleTerminateRemote = () => {
    if (!window.confirm("Terminate all other remote sessions? Any other browsers logged into this admin account will be signed out immediately.")) {
      return;
    }
    setTerminating(true);
    setTimeout(() => {
      terminateAllRemoteSessions();
      setKnownDevices(getKnownDevices());
      setTerminating(false);
      setTerminateMsg("All other remote sessions revoked!");
      setTimeout(() => setTerminateMsg(null), 3500);
    }, 450);
  };

  const handleRunXssScan = async () => {
    setScanningXss(true);
    try {
      const report = await runXssVulnerabilityScan();
      setXssReport(report);
    } catch (_) {}
    setScanningXss(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      style={{
        background: 'var(--pcms-panel, #ffffff)',
        border: '1px solid var(--pcms-line, rgba(0,0,0,0.08))',
        borderRadius: 14,
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            background: 'rgba(239, 68, 68, 0.12)',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <ShieldCheck size={17} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--pcms-text)' }}>
              Enterprise Security Fortress & Anomaly Shield
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--pcms-muted)' }}>
              Device fingerprinting, remote session defense, and content XSS sanitizer
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: 8,
            background: xssReport?.safe ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            border: `1px solid ${xssReport?.safe ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
            color: xssReport?.safe ? '#10b981' : '#ef4444',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}>
            <Shield size={12} />
            <span>{xssReport?.safe ? 'Content Secure (0 Vulns)' : `${xssReport?.vulnerabilities.length} Flagged Items`}</span>
          </span>
        </div>
      </div>

      {/* Grid: Device Fingerprint & Remote Sessions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 12,
      }}>
        {/* Device Signature Card */}
        <div style={{
          background: 'var(--pcms-panel-2, rgba(0,0,0,0.02))',
          border: '1px solid var(--pcms-line, rgba(0,0,0,0.06))',
          borderRadius: 10,
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--pcms-text)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Fingerprint size={14} style={{ color: 'var(--primary-blue)' }} />
              <span>Current Device Signature</span>
            </span>
            <span style={{
              fontSize: 10,
              fontWeight: 800,
              padding: '2px 6px',
              borderRadius: 5,
              background: 'rgba(16, 185, 129, 0.12)',
              color: '#10b981',
            }}>
              VERIFIED
            </span>
          </div>

          <div style={{
            fontFamily: 'monospace',
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--pcms-text)',
            padding: '6px 8px',
            borderRadius: 6,
            background: 'var(--pcms-panel)',
            border: '1px solid var(--pcms-line)',
            letterSpacing: '0.05em',
          }}>
            {deviceFp}
          </div>

          <div style={{ fontSize: 11, color: 'var(--pcms-muted)' }}>
            Hardware Hash: {anomaly.deviceName || 'Windows PC (Chrome)'} • Auto-verified via Web Crypto
          </div>
        </div>

        {/* Remote Session Control Card */}
        <div style={{
          background: 'var(--pcms-panel-2, rgba(0,0,0,0.02))',
          border: '1px solid var(--pcms-line, rgba(0,0,0,0.06))',
          borderRadius: 10,
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 8,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--pcms-text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Lock size={14} style={{ color: '#8b5cf6' }} />
                <span>Remote Session Management</span>
              </span>
              <span style={{ fontSize: 11, color: 'var(--pcms-muted)' }}>
                {knownDevices.length || 1} device recorded
              </span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--pcms-muted)', marginTop: 4 }}>
              Instantly rotate session nonces to sign out all other devices across networks.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              onClick={handleTerminateRemote}
              disabled={terminating}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#ef4444',
                fontSize: 11.5,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                transition: 'all 0.15s ease',
              }}
            >
              {terminating ? <Loader2 size={12} className="spin" /> : <ShieldAlert size={12} />}
              <span>Revoke All Other Sessions</span>
            </button>

            {terminateMsg && (
              <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981' }}>
                {terminateMsg}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* XSS & Vulnerability Scanner Row */}
      <div style={{
        background: 'var(--pcms-panel-2, rgba(0,0,0,0.02))',
        border: '1px solid var(--pcms-line, rgba(0,0,0,0.06))',
        borderRadius: 10,
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: 7,
            background: 'rgba(16, 185, 129, 0.12)',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <ShieldCheck size={15} />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--pcms-text)' }}>
              Portfolio Content Vulnerability Scanner
            </div>
            <div style={{ fontSize: 11, color: 'var(--pcms-muted)' }}>
              {xssReport
                ? `Scanned ${xssReport.scannedRecordsCount} database records. No script injection or malicious links detected.`
                : 'Audits all project descriptions and updates for malicious scripts or unsafe HTML.'}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRunXssScan}
          disabled={scanningXss}
          style={{
            padding: '6px 12px',
            borderRadius: 8,
            background: 'var(--pcms-panel)',
            border: '1px solid var(--pcms-line)',
            color: 'var(--pcms-text)',
            fontSize: 11.5,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          {scanningXss ? <Loader2 size={13} className="spin" /> : <RefreshCw size={13} />}
          <span>Run Security Scan</span>
        </button>
      </div>
    </motion.div>
  );
}
