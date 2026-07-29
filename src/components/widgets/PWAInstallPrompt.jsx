import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X, Download, Share, Smartphone } from 'lucide-react';
import { useSmartUpdate } from '../../hooks/useSmartUpdate';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const {
    showToast,
    countdown,
    reload,
    dismiss,
    cancelCountdown,
  } = useSmartUpdate();

  useEffect(() => {
    // Detect iOS Safari
    const ua = window.navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;

    if (isIOSDevice && !isStandalone) {
      setIsIOS(true);
      setShowInstallPrompt(true);
    } else {
      setShowInstallPrompt(true);
    }

    // Listen for beforeinstallprompt event (Android / Chromium)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setShowInstallPrompt(false);
      setDeferredPrompt(null);
    } else {
      alert("To install Sujith's Portfolio:\nClick the Install icon in your browser's address bar (top right) or open your browser menu and select 'Install Sujith Portfolio'.");
    }
  };

  const handleDismissInstall = () => {
    setIsDismissed(true);
  };

  return (
    <AnimatePresence>
      {/* Smart PWA Update Toast (Top-Right: top: 94px; right: 28px, slide-in from x: 50) */}
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

      {/* PWA Install Banner — bottom-left of main content, after sidebar */}
      {showInstallPrompt && !showToast && !isDismissed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280, delay: 0.6 }}
          style={{ position: 'fixed', bottom: '24px', left: '300px', zIndex: 9998 }}
        >
          {/* Card */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '14px',
            padding: '14px 16px',
            maxWidth: '320px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
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
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
