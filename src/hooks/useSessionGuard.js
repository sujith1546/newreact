import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { logSecurityEvent } from '../lib/auditLogger';

/**
 * useSessionGuard — Admin Session Anomaly Detector
 *
 * On every admin page mount, fingerprints the current browser environment
 * and compares it against the fingerprint captured at login time.
 *
 * If 2+ signals mismatch (different device, browser, timezone, etc.)
 * mid-session → automatically signs out and fires an alert.
 *
 * Signals tracked:
 *   - User-Agent string
 *   - Screen resolution
 *   - Timezone
 *   - Browser language
 *   - Color depth
 *   - Pixel ratio
 *   - Touch capability
 *
 * Usage:
 *   const { anomalyDetected, anomalyReasons, clearAnomaly } = useSessionGuard();
 */

const FINGERPRINT_KEY = '_sfp'; // sessionStorage key

function captureFingerprint() {
  try {
    return {
      ua: navigator.userAgent?.substring(0, 200) || '',
      screen: `${window.screen.width}x${window.screen.height}`,
      colorDepth: window.screen.colorDepth,
      pixelRatio: window.devicePixelRatio,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
      language: navigator.language || '',
      touchPoints: navigator.maxTouchPoints ?? 0,
    };
  } catch {
    return null;
  }
}

function compareFingerprints(stored, current) {
  if (!stored || !current) return { mismatches: 0, reasons: [] };

  const checks = [
    { key: 'ua',         label: 'User-Agent changed',      weight: 2 },
    { key: 'screen',     label: 'Screen resolution changed', weight: 1 },
    { key: 'colorDepth', label: 'Color depth changed',      weight: 1 },
    { key: 'timezone',   label: 'Timezone changed',         weight: 2 },
    { key: 'language',   label: 'Browser language changed', weight: 1 },
    { key: 'touchPoints',label: 'Touch capability changed', weight: 1 },
  ];

  const reasons = [];
  let mismatches = 0;

  for (const check of checks) {
    if (String(stored[check.key]) !== String(current[check.key])) {
      reasons.push(check.label);
      mismatches += check.weight;
    }
  }

  return { mismatches, reasons };
}

export default function useSessionGuard({ enabled = true, threshold = 2 } = {}) {
  const [anomalyDetected, setAnomalyDetected] = useState(false);
  const [anomalyReasons, setAnomalyReasons] = useState([]);
  const hasChecked = useRef(false);

  const storeFingerprint = useCallback(() => {
    try {
      const fp = captureFingerprint();
      if (fp) sessionStorage.setItem(FINGERPRINT_KEY, JSON.stringify(fp));
    } catch {}
  }, []);

  const clearAnomaly = useCallback(() => {
    setAnomalyDetected(false);
    setAnomalyReasons([]);
  }, []);

  useEffect(() => {
    if (!enabled || hasChecked.current) return;
    hasChecked.current = true;

    try {
      const storedRaw = sessionStorage.getItem(FINGERPRINT_KEY);

      if (!storedRaw) {
        // First visit — store fingerprint as baseline
        storeFingerprint();
        return;
      }

      const stored = JSON.parse(storedRaw);
      const current = captureFingerprint();
      const { mismatches, reasons } = compareFingerprints(stored, current);

      if (mismatches >= threshold) {
        // Anomaly detected — log and trigger sign-out
        setAnomalyDetected(true);
        setAnomalyReasons(reasons);

        logSecurityEvent('SESSION_ANOMALY_DETECTED', {
          mismatches,
          reasons,
          stored,
          current,
        }, 'high').catch(() => {});

        // Auto sign out after brief delay to allow UI to render the alert
        setTimeout(async () => {
          try {
            await supabase.auth.signOut();
          } catch {}
        }, 2000);
      } else {
        // Refresh fingerprint with latest values
        storeFingerprint();
      }
    } catch {
      // Silently ignore — fingerprinting must never block the admin
    }
  }, [enabled, threshold, storeFingerprint]);

  return { anomalyDetected, anomalyReasons, clearAnomaly, storeFingerprint };
}
