import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock, KeyRound, Fingerprint, LogOut, Loader2, AlertTriangle,
  Eye, EyeOff, ShieldCheck, Clock, Sparkles
} from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import haptic from '../../../lib/haptics';

export default function AdminLockScreen({
  userEmail,
  unlocking,
  unlockError,
  lockoutTimer,
  biometricSupported,
  onUnlockPin,
  onUnlockBiometrics,
  onSignOut,
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark' || (typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark');

  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (unlockError) {
      setIsShaking(true);
      haptic.error();
      const timer = setTimeout(() => setIsShaking(false), 500);
      return () => clearTimeout(timer);
    }
  }, [unlockError]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!pin.trim() || unlocking || lockoutTimer > 0) return;
    haptic.medium();
    const success = await onUnlockPin(pin.trim());
    if (!success) {
      setPin('');
      inputRef.current?.focus();
    }
  };

  const handleKeypadPress = (val) => {
    if (lockoutTimer > 0 || unlocking) return;
    haptic.light();
    if (val === 'backspace') {
      setPin((prev) => prev.slice(0, -1));
    } else if (val === 'clear') {
      setPin('');
    } else {
      if (pin.length < 12) {
        setPin((prev) => prev + val);
      }
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999999,
        background: isDark
          ? 'radial-gradient(ellipse at 50% 30%, rgba(30, 41, 59, 0.95), rgba(11, 13, 16, 0.98))'
          : 'radial-gradient(ellipse at 50% 30%, rgba(241, 245, 249, 0.96), rgba(226, 232, 240, 0.98))',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
          x: isShaking ? [-8, 8, -6, 6, -3, 3, 0] : 0,
        }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
        style={{
          width: '100%',
          maxWidth: 420,
          background: isDark ? 'rgba(18, 22, 29, 0.88)' : 'rgba(255, 255, 255, 0.92)',
          border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
          borderRadius: 20,
          boxShadow: isDark
            ? '0 30px 80px -15px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.06)'
            : '0 30px 80px -15px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(0, 0, 0, 0.04)',
          padding: '32px 28px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          boxSizing: 'border-box',
        }}
      >
        {/* Animated Lock Shield Icon */}
        <div
          style={{
            position: 'relative',
            width: 64,
            height: 64,
            borderRadius: 18,
            background: isDark
              ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2))'
              : 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(139, 92, 246, 0.12))',
            border: `1px solid ${isDark ? 'rgba(99, 102, 241, 0.4)' : 'rgba(99, 102, 241, 0.3)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.2)',
          }}
        >
          <Lock size={28} color="#6366f1" />
          <div
            style={{
              position: 'absolute',
              bottom: -2,
              right: -2,
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: '#10b981',
              border: `2px solid ${isDark ? '#12161d' : '#fff'}`,
            }}
          />
        </div>

        {/* Security Title & User Info */}
        <h2
          style={{
            margin: '0 0 4px',
            fontSize: 20,
            fontWeight: 800,
            color: isDark ? '#f8fafc' : '#0f172a',
            letterSpacing: '-0.02em',
          }}
        >
          Portfolio CMS Locked
        </h2>
        <p
          style={{
            margin: '0 0 16px',
            fontSize: 12.5,
            color: isDark ? '#94a3b8' : '#64748b',
          }}
        >
          Session protected · <strong style={{ color: isDark ? '#cbd5e1' : '#334155' }}>{userEmail || 'Administrator'}</strong>
        </p>

        {/* Lockout Warning Banner */}
        {lockoutTimer > 0 && (
          <div
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 10,
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              fontSize: 12,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginBottom: 16,
            }}
          >
            <Clock size={14} />
            <span>Locked out. Retry in {lockoutTimer}s</span>
          </div>
        )}

        {/* PIN Input Form */}
        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc',
              border: `1px solid ${unlockError ? '#ef4444' : isDark ? 'rgba(255, 255, 255, 0.12)' : '#e2e8f0'}`,
              borderRadius: 12,
              height: 48,
              padding: '0 12px',
              transition: 'border-color 0.2s',
            }}
          >
            <KeyRound size={18} color={isDark ? '#64748b' : '#94a3b8'} style={{ marginRight: 10, flexShrink: 0 }} />
            <input
              ref={inputRef}
              type={showPin ? 'text' : 'password'}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              disabled={unlocking || lockoutTimer > 0}
              placeholder="Enter Master PIN or Password"
              autoComplete="current-password"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: isDark ? '#f8fafc' : '#0f172a',
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: showPin ? 'normal' : '0.18em',
              }}
            />
            {pin.length > 0 && (
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: isDark ? '#94a3b8' : '#64748b',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            )}
          </div>

          {/* Error Message */}
          {unlockError && (
            <div
              style={{
                fontSize: 12,
                color: '#ef4444',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <AlertTriangle size={13} />
              <span>{unlockError}</span>
            </div>
          )}

          {/* Unlock Action Button */}
          <button
            type="submit"
            disabled={!pin.trim() || unlocking || lockoutTimer > 0}
            style={{
              width: '100%',
              height: 44,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              border: 'none',
              color: '#ffffff',
              fontSize: 13.5,
              fontWeight: 700,
              cursor: (!pin.trim() || unlocking || lockoutTimer > 0) ? 'not-allowed' : 'pointer',
              opacity: (!pin.trim() || unlocking || lockoutTimer > 0) ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)',
              transition: 'transform 0.15s, opacity 0.15s',
            }}
          >
            {unlocking ? (
              <>
                <Loader2 size={16} className="spin" />
                <span>Verifying Credentials…</span>
              </>
            ) : (
              <>
                <ShieldCheck size={16} />
                <span>Unlock Console</span>
              </>
            )}
          </button>
        </form>

        {/* Biometrics Option */}
        {biometricSupported && (
          <button
            type="button"
            onClick={onUnlockBiometrics}
            disabled={unlocking || lockoutTimer > 0}
            style={{
              marginTop: 12,
              width: '100%',
              height: 40,
              borderRadius: 10,
              background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f1f5f9',
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'}`,
              color: isDark ? '#e2e8f0' : '#1e293b',
              fontSize: 12.5,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: 'pointer',
            }}
          >
            <Fingerprint size={16} color="#6366f1" />
            <span>Unlock with Windows Hello / Touch ID</span>
          </button>
        )}

        {/* Footer Actions: Emergency Sign Out */}
        <div
          style={{
            marginTop: 20,
            paddingTop: 16,
            borderTop: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ fontSize: 11, color: isDark ? '#64748b' : '#94a3b8' }}>
            Zero-Trust Protected
          </div>
          <button
            type="button"
            onClick={onSignOut}
            style={{
              background: 'none',
              border: 'none',
              color: '#ef4444',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '4px 8px',
              borderRadius: 6,
            }}
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
