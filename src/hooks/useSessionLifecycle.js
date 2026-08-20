import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  verifyPin,
  verifyWithBiometrics,
  isBiometricsAvailable,
  hasActiveSessionNonce,
  generateSessionNonce,
  touchLastActive,
  getLastActive,
  setSessionLocked,
  isSessionLocked,
  getSecurityBroadcastChannel,
  broadcastSecurityEvent,
} from '../lib/sessionSecurity';
import { logSecurityEvent, logAuditEvent } from '../lib/auditLogger';

const MAX_PIN_ATTEMPTS = 5;
const PIN_LOCKOUT_MS = 60000;

export default function useSessionLifecycle() {
  const navigate = useNavigate();
  const { user, session, logout } = useAuth();

  // Determine initial lock state:
  // If session is explicitly marked locked in storage, OR if it's a cold boot (no ephemeral nonce yet)
  const [isLocked, setIsLocked] = useState(() => {
    if (typeof window === 'undefined') return false;
    const explicitlyLocked = isSessionLocked();
    const isColdBoot = !hasActiveSessionNonce();
    return explicitlyLocked || isColdBoot;
  });

  const [unlocking, setUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);
  const [biometricSupported, setBiometricSupported] = useState(false);

  const idleTimerRef = useRef(null);

  // Check biometric support
  useEffect(() => {
    isBiometricsAvailable().then(setBiometricSupported).catch(() => setBiometricSupported(false));
  }, []);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutTimer <= 0) return;
    const id = setInterval(() => {
      setLockoutTimer((t) => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [lockoutTimer]);

  // Lock the session
  const lockSession = useCallback((reason = 'manual') => {
    setIsLocked(true);
    setSessionLocked(true);
    setUnlockError('');
    broadcastSecurityEvent('LOCK_SESSION', { reason });
    logSecurityEvent('SESSION_LOCKED', { reason, user: user?.email }, 'low').catch(() => {});
  }, [user]);

  // Unlock the session
  const unlockSessionState = useCallback(() => {
    setIsLocked(false);
    setSessionLocked(false);
    setUnlockError('');
    setFailedAttempts(0);
    generateSessionNonce();
    touchLastActive();
    broadcastSecurityEvent('UNLOCK_SESSION');
  }, []);

  // Lockout handler on failed attempts
  const handleFailedPinAttempt = useCallback(async () => {
    const nextAttempts = failedAttempts + 1;
    setFailedAttempts(nextAttempts);

    if (nextAttempts >= MAX_PIN_ATTEMPTS) {
      setLockoutTimer(60);
      setUnlockError('Too many failed attempts. Console locked for 60 seconds.');
      await logSecurityEvent('LOCK_SCREEN_BRUTE_FORCE', {
        attempts: nextAttempts,
        email: user?.email,
      }, 'critical').catch(() => {});
    } else {
      const remaining = MAX_PIN_ATTEMPTS - nextAttempts;
      setUnlockError(`Incorrect Master PIN. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`);
    }
  }, [failedAttempts, user]);

  // PIN Unlock
  const unlockWithPin = useCallback(async (pin) => {
    if (lockoutTimer > 0) return false;
    setUnlocking(true);
    setUnlockError('');

    try {
      const isValid = await verifyPin(pin);
      if (isValid) {
        unlockSessionState();
        await logAuditEvent('SESSION_UNLOCKED', 'auth', user?.email, { method: 'pin' }).catch(() => {});
        setUnlocking(false);
        return true;
      } else {
        await handleFailedPinAttempt();
        setUnlocking(false);
        return false;
      }
    } catch (err) {
      setUnlockError(err.message || 'Verification failed.');
      setUnlocking(false);
      return false;
    }
  }, [lockoutTimer, unlockSessionState, handleFailedPinAttempt, user]);

  // Biometric Unlock
  const unlockWithBiometrics = useCallback(async () => {
    if (lockoutTimer > 0) return false;
    setUnlocking(true);
    setUnlockError('');

    try {
      const success = await verifyWithBiometrics();
      if (success) {
        unlockSessionState();
        await logAuditEvent('SESSION_UNLOCKED', 'auth', user?.email, { method: 'biometrics' }).catch(() => {});
        setUnlocking(false);
        return true;
      }
      setUnlocking(false);
      return false;
    } catch (err) {
      setUnlockError(err.message || 'Biometric verification failed. Please enter Master PIN.');
      setUnlocking(false);
      return false;
    }
  }, [lockoutTimer, unlockSessionState, user]);

  // Emergency Sign Out
  const handleEmergencySignOut = useCallback(async () => {
    setSessionLocked(false);
    broadcastSecurityEvent('LOGOUT_SESSION');
    await logout();
    navigate('/', { replace: true });
  }, [logout, navigate]);

  // Cross-Tab Broadcast Channel Sync
  useEffect(() => {
    const channel = getSecurityBroadcastChannel();
    if (!channel) return;

    const handleMessage = (e) => {
      const { type } = e.data || {};
      if (type === 'LOCK_SESSION') {
        setIsLocked(true);
      } else if (type === 'UNLOCK_SESSION') {
        setIsLocked(false);
        setSessionLocked(false);
        generateSessionNonce();
      } else if (type === 'LOGOUT_SESSION') {
        logout().catch(() => {});
        navigate('/', { replace: true });
      }
    };

    channel.addEventListener('message', handleMessage);
    return () => channel.removeEventListener('message', handleMessage);
  }, [logout, navigate]);

  // Real-time Inactivity & Tab Lifecycle Tracker
  useEffect(() => {
    if (isLocked) return;

    // Read user configured auto-lock minutes from settings, default to 15 min
    const configuredMin = parseInt(localStorage.getItem('pcms_auto_lock_min') || '15', 10);
    const timeoutMs = (isNaN(configuredMin) ? 15 : configuredMin) * 60 * 1000;

    const checkInactivity = () => {
      const lastActive = getLastActive();
      const elapsed = Date.now() - lastActive;
      if (elapsed >= timeoutMs) {
        lockSession('inactivity');
      }
    };

    const resetIdle = () => {
      touchLastActive();
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        lockSession('inactivity');
      }, timeoutMs);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkInactivity();
      } else {
        touchLastActive();
      }
    };

    const events = ['mousemove', 'keydown', 'touchstart', 'scroll', 'click', 'pointerdown'];
    events.forEach(ev => window.addEventListener(ev, resetIdle, { passive: true }));
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initial check on mount
    checkInactivity();
    resetIdle();

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      events.forEach(ev => window.removeEventListener(ev, resetIdle));
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isLocked, lockSession]);

  return {
    isLocked,
    unlocking,
    unlockError,
    failedAttempts,
    lockoutTimer,
    biometricSupported,
    lockSession,
    unlockWithPin,
    unlockWithBiometrics,
    handleEmergencySignOut,
  };
}
