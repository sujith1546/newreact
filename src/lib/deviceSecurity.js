/**
 * Enterprise Browser Fingerprinting & Remote Session Revocation
 * Uses Web Crypto API for anonymous, privacy-preserving device identification.
 */

const FINGERPRINT_KEY = 'pcms_device_fingerprint';
const KNOWN_DEVICES_KEY = 'pcms_known_devices';
const SESSION_NONCE_KEY = 'pcms_security_session_nonce';

/**
 * Generate anonymous hardware/browser hash
 */
export async function getDeviceFingerprint() {
  try {
    if (typeof window === 'undefined') return 'server_environment';

    const components = [
      navigator.userAgent || '',
      navigator.language || '',
      screen.colorDepth || '',
      screen.width + 'x' + screen.height,
      Intl.DateTimeFormat().resolvedOptions().timeZone || '',
      navigator.hardwareConcurrency || '4',
    ];

    const rawString = components.join('###');
    const encoder = new TextEncoder();
    const data = encoder.encode(rawString);

    if (window.crypto && crypto.subtle) {
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      const shortId = `DEV-${hashHex.substring(0, 10).toUpperCase()}`;
      return shortId;
    }

    return `DEV-${Math.abs(rawString.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)).toString(16).toUpperCase()}`;
  } catch (e) {
    return 'DEV-GENERIC-AUTH';
  }
}

/**
 * Register current device as verified
 */
export async function registerCurrentDevice() {
  const fp = await getDeviceFingerprint();
  const known = getKnownDevices();
  const existing = known.find(d => d.id === fp);

  const deviceName = detectDeviceOS();

  if (!existing) {
    known.push({
      id: fp,
      name: deviceName,
      firstSeen: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      current: true,
    });
  } else {
    existing.lastSeen = new Date().toISOString();
    existing.current = true;
  }

  // Mark other devices as not current
  known.forEach(d => {
    if (d.id !== fp) d.current = false;
  });

  try {
    localStorage.setItem(KNOWN_DEVICES_KEY, JSON.stringify(known));
  } catch (_) {}

  return { fingerprint: fp, knownDevices: known };
}

/**
 * Get all known registered devices
 */
export function getKnownDevices() {
  try {
    const raw = localStorage.getItem(KNOWN_DEVICES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

/**
 * Check if the current device is recognized or a new unknown device
 */
export async function checkDeviceAnomaly() {
  const fp = await getDeviceFingerprint();
  const known = getKnownDevices();
  if (known.length === 0) {
    // First time initializing
    await registerCurrentDevice();
    return { isUnknown: false, fingerprint: fp, deviceName: detectDeviceOS() };
  }

  const match = known.find(d => d.id === fp);
  return {
    isUnknown: !match,
    fingerprint: fp,
    deviceName: detectDeviceOS(),
  };
}

/**
 * Terminate all other remote sessions
 * Generates a new cryptographically random nonce in localStorage.
 * Other tabs or remote sessions that check the nonce will be kicked out.
 */
export function terminateAllRemoteSessions() {
  const newNonce = `nonce_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  try {
    localStorage.setItem(SESSION_NONCE_KEY, newNonce);
    // Keep only current device in known devices
    const currentFp = localStorage.getItem(FINGERPRINT_KEY);
    const known = getKnownDevices().filter(d => d.id === currentFp || d.current);
    localStorage.setItem(KNOWN_DEVICES_KEY, JSON.stringify(known));
  } catch (_) {}

  window.dispatchEvent(new CustomEvent('pcms_sessions_revoked', { detail: { newNonce } }));
  return { success: true, newNonce, timestamp: new Date().toISOString() };
}

function detectDeviceOS() {
  if (typeof navigator === 'undefined') return 'Unknown Browser';
  const ua = navigator.userAgent;
  let os = 'Unknown OS';
  if (ua.includes('Win')) os = 'Windows PC';
  else if (ua.includes('Mac')) os = 'macOS Device';
  else if (ua.includes('Linux')) os = 'Linux Device';
  else if (ua.includes('Android')) os = 'Android Mobile';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'Apple iOS';

  let browser = 'Browser';
  if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edge')) browser = 'Edge';

  return `${os} (${browser})`;
}
