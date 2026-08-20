/**
 * Enterprise Session Security & Lifecycle Manager
 * 
 * Provides:
 * 1. Cryptographic PIN hashing & verification using native WebCrypto SHA-256
 * 2. Dynamic Storage Adapter for Supabase (sessionStorage default vs localStorage)
 * 3. Ephemeral Session Nonce & Cold-Boot Detector (prevents tab-restore hijacking)
 * 4. Cross-Tab Multi-Window Broadcast Channel Coordinator
 * 5. WebAuthn Hardware Biometrics (Windows Hello / Touch ID / Face ID) verification
 */

const PIN_STORAGE_KEY = 'pcms_master_pin_hash';
const PIN_SALT = 'pcms_secure_salt_v2';
const DEFAULT_INITIAL_PIN = '1546'; // Seed PIN for first run, user can change in AuthSecurityPanel

const SESSION_NONCE_KEY = '_pcms_session_nonce';
const LAST_ACTIVE_KEY = 'pcms_last_active_epoch';
const SESSION_LOCKED_KEY = 'pcms_session_locked';
const REMEMBER_SESSION_KEY = 'pcms_remember_session';

/* ── 1. WebCrypto SHA-256 Cryptographic PIN Engine ─────────────────── */

export async function hashPin(pin) {
  const encoder = new TextEncoder();
  const data = encoder.encode(PIN_SALT + pin.trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPin(inputPin) {
  if (!inputPin || typeof inputPin !== 'string') return false;
  try {
    const inputHash = await hashPin(inputPin);
    let storedHash = localStorage.getItem(PIN_STORAGE_KEY);

    // Initialize default seed PIN hash if not yet configured
    if (!storedHash) {
      storedHash = await hashPin(DEFAULT_INITIAL_PIN);
      localStorage.setItem(PIN_STORAGE_KEY, storedHash);
    }

    return inputHash === storedHash;
  } catch (err) {
    console.error('[SessionSecurity] PIN verification error:', err);
    return false;
  }
}

export async function setMasterPin(newPin) {
  if (!newPin || newPin.trim().length < 4) {
    throw new Error('Master PIN must be at least 4 digits/characters.');
  }
  const newHash = await hashPin(newPin);
  localStorage.setItem(PIN_STORAGE_KEY, newHash);
  return true;
}

export function isPinConfigured() {
  return Boolean(localStorage.getItem(PIN_STORAGE_KEY));
}

/* ── 2. Dynamic Supabase Auth Storage Adapter ───────────────────────── */

/**
 * Storage adapter that routes auth tokens to sessionStorage (Strict Ephemeral Mode)
 * or localStorage (Remember Workstation Mode) based on user preference.
 */
export const sessionAuthStorage = {
  getItem: (key) => {
    try {
      const isRemember = localStorage.getItem(REMEMBER_SESSION_KEY) === 'true';
      if (isRemember) {
        return localStorage.getItem(key) || sessionStorage.getItem(key);
      }
      return sessionStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      const isRemember = localStorage.getItem(REMEMBER_SESSION_KEY) === 'true';
      if (isRemember) {
        localStorage.setItem(key, value);
      } else {
        sessionStorage.setItem(key, value);
        // Ensure stale tokens are purged from localStorage
        localStorage.removeItem(key);
      }
    } catch {}
  },
  removeItem: (key) => {
    try {
      sessionStorage.removeItem(key);
      localStorage.removeItem(key);
    } catch {}
  },
};

export function setRememberSessionPreference(remember) {
  try {
    localStorage.setItem(REMEMBER_SESSION_KEY, remember ? 'true' : 'false');
  } catch {}
}

export function getRememberSessionPreference() {
  try {
    return localStorage.getItem(REMEMBER_SESSION_KEY) === 'true';
  } catch {
    return false;
  }
}

/* ── 3. Ephemeral Nonce & Cold-Boot / Restore Detection ────────────── */

export function generateSessionNonce() {
  const nonce = crypto.randomUUID ? crypto.randomUUID() : (Math.random().toString(36).slice(2) + Date.now().toString(36));
  try {
    sessionStorage.setItem(SESSION_NONCE_KEY, nonce);
  } catch {}
  return nonce;
}

export function hasActiveSessionNonce() {
  try {
    return Boolean(sessionStorage.getItem(SESSION_NONCE_KEY));
  } catch {
    return false;
  }
}

export function clearSessionNonce() {
  try {
    sessionStorage.removeItem(SESSION_NONCE_KEY);
    sessionStorage.removeItem(SESSION_LOCKED_KEY);
  } catch {}
}

export function touchLastActive() {
  const now = Date.now().toString();
  try {
    localStorage.setItem(LAST_ACTIVE_KEY, now);
  } catch {}
}

export function getLastActive() {
  try {
    const val = localStorage.getItem(LAST_ACTIVE_KEY);
    return val ? parseInt(val, 10) : Date.now();
  } catch {
    return Date.now();
  }
}

export function setSessionLocked(locked) {
  try {
    if (locked) {
      localStorage.setItem(SESSION_LOCKED_KEY, 'true');
    } else {
      localStorage.removeItem(SESSION_LOCKED_KEY);
      touchLastActive();
    }
  } catch {}
}

export function isSessionLocked() {
  try {
    return localStorage.getItem(SESSION_LOCKED_KEY) === 'true';
  } catch {
    return false;
  }
}

/* ── 4. Cross-Tab Multi-Window Broadcast Channel ────────────────────── */

let channelInstance = null;

export function getSecurityBroadcastChannel() {
  if (typeof window === 'undefined' || !window.BroadcastChannel) return null;
  if (!channelInstance) {
    try {
      channelInstance = new BroadcastChannel('pcms_security_channel');
    } catch {
      channelInstance = null;
    }
  }
  return channelInstance;
}

export function broadcastSecurityEvent(type, payload = {}) {
  const ch = getSecurityBroadcastChannel();
  if (ch) {
    try {
      ch.postMessage({ type, payload, timestamp: Date.now() });
    } catch {}
  }
}

/* ── 5. WebAuthn Hardware Biometrics (Touch ID / Face ID / Windows Hello) ── */

export async function isBiometricsAvailable() {
  if (typeof window === 'undefined') return false;
  if (!window.PublicKeyCredential) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

export async function verifyWithBiometrics() {
  if (!(await isBiometricsAvailable())) {
    throw new Error('Biometric hardware authenticator is not available on this device.');
  }

  // Generate a random challenge for biometric verification
  const challenge = new Uint8Array(32);
  crypto.getRandomValues(challenge);

  const credential = await navigator.credentials.get({
    publicKey: {
      challenge,
      timeout: 60000,
      userVerification: 'required',
      rpId: window.location.hostname || 'localhost',
    },
  });

  return Boolean(credential);
}
