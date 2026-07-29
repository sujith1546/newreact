import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X, Download, Share, Smartphone, Check } from 'lucide-react';
import { useSmartUpdate } from '../../hooks/useSmartUpdate';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const {
    showToast,
    countdown,
    reload,
    dismiss,
    cancelCountdown,
  } = useSmartUpdate();

  useEffect(() => {
    // Check localStorage & Standalone Mode
    const savedInstalled = localStorage.getItem('pwa_installed') === 'true';
    const ua = window.navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    const isStandaloneMode = window.navigator.standalone ||
      window.matchMedia('(display-mode: standalone)').matches ||
      document.referrer.includes('android-app://') ||
      savedInstalled;

    if (isStandaloneMode) {
      setIsInstalled(true);
    } else {
      if (isIOSDevice) {
        setIsIOS(true);
      }
      setShowInstallPrompt(true);
    }

    // Listen for beforeinstallprompt event (Android / Chromium)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      localStorage.setItem('pwa_installed', 'true');
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    localStorage.setItem('pwa_installed', 'true');
    setIsInstalled(true);
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setShowInstallPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismissInstall = () => {
    setIsDismissed(true);
  };

  return (
    <AnimatePresence>
      {/* Smart PWA Update Toast (Top-Right) */}
      {showToast && (
        <motion.div
          initial={{ opacity: 0, x: 50, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 50, scale: 0.95 }}
          transition={{ type: 'spring', damping: 24, stiffness: 300 }}
          style={{
            position: 'fixed',
            top: '94px',
            right: '28px',
            zIndex: 9999,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '14px 18px',
            maxWidth: '360px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div style={{ color: 'var(--primary-blue)', display: 'flex' }}>
            <RefreshCw size={20} className="spin-icon" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {countdown !== null ? `Updating in ${countdown}s…` : 'New version available'}
            </p>
            <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              {countdown !== null ? 'Applying latest updates automatically' : 'Reload to update portfolio app.'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {countdown !== null ? (
              <button
                onClick={cancelCountdown}
                style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            ) : (
              <>
                <button
                  onClick={reload}
                  style={{
                    background: 'var(--text-primary)',
                    color: 'var(--bg-primary)',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Reload
                </button>
                <button
                  onClick={dismiss}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <X size={14} />
                </button>
              </>
            )}
          </div>
        </motion.div>
      )}

      {/* App Installed Success Modal / Card (When App is Installed) */}
      {isInstalled && !isDismissed && !showToast && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          style={{
            position: 'fixed',
            bottom: '18px',
            right: '92px',
            zIndex: 9998,
          }}
        >
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '20px',
            padding: '24px 28px',
            width: '320px',
            boxShadow: '0 12px 36px rgba(0,0,0,0.22)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative',
          }}>
            {/* Close button */}
            <button
              onClick={handleDismissInstall}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={18} />
            </button>

            {/* Green check squircle box */}
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '16px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10b981',
              marginBottom: '16px',
            }}>
              <Check size={30} strokeWidth={3} />
            </div>

            {/* Title */}
            <h3 style={{
              margin: '0 0 8px',
              fontSize: '20px',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
            }}>
              App installed
            </h3>

            {/* Subtitle */}
            <p style={{
              margin: 0,
              fontSize: '13.5px',
              color: 'var(--text-secondary)',
              lineHeight: '1.5',
            }}>
              Sujith's portfolio is now on your home screen.
            </p>
          </div>
        </motion.div>
      )}

      {/* PWA Install Banner — beside Atom AI FAB (When NOT installed) */}
      {!isInstalled && showInstallPrompt && !showToast && !isDismissed && (
        <motion.div
          initial={{ opacity: 0, x: 50, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 50, scale: 0.95 }}
          transition={{ type: 'spring', damping: 24, stiffness: 300, delay: 0.3 }}
          style={{ position: 'fixed', bottom: '18px', right: '92px', zIndex: 9998 }}
        >
          {/* Card */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '14px',
            padding: '14px 16px',
            maxWidth: '300px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            position: 'relative',
          }}>
            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
                background: 'color-mix(in srgb, var(--primary-blue) 10%, transparent)',
                border: '1px solid color-mix(in srgb, var(--primary-blue) 20%, transparent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--primary-blue)',
              }}>
                <Smartphone size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Install App Experience
                </p>
                <p style={{ margin: '3px 0 0', fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  {isIOS ? (
                    <>Tap <Share size={11} style={{ verticalAlign: 'middle', display: 'inline' }} /> Share → <strong>Add to Home Screen</strong></>
                  ) : (
                    'Add this portfolio to your home screen for quick offline access.'
                  )}
                </p>
              </div>
              <button
                onClick={handleDismissInstall}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px', flexShrink: 0 }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Install button */}
            {!isIOS && (
              <button
                onClick={handleInstallClick}
                style={{
                  background: 'var(--text-primary)',
                  color: 'var(--bg-primary)',
                  border: 'none',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  width: '100%',
                }}
              >
                <Download size={13} /> Install App
              </button>
            )}

            {/* Caret arrow pointing right toward Atom AI button */}
            <div style={{
              position: 'absolute',
              right: '-8px',
              bottom: '19px',
              width: 0, height: 0,
              borderTop: '8px solid transparent',
              borderBottom: '8px solid transparent',
              borderLeft: '8px solid var(--border-color)',
            }} />
            <div style={{
              position: 'absolute',
              right: '-7px',
              bottom: '19px',
              width: 0, height: 0,
              borderTop: '8px solid transparent',
              borderBottom: '8px solid transparent',
              borderLeft: '8px solid var(--bg-secondary)',
            }} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

