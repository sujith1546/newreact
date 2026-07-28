import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, RefreshCw, X, Share, Smartphone } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // SW Registration with registerType: 'prompt'
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r);
    },
    onRegisterError(error) {
      console.error('SW Registration error:', error);
    },
  });

  useEffect(() => {
    // Check if dismissed recently (e.g., within 24h)
    const dismissedAt = localStorage.getItem('pwa_prompt_dismissed');
    if (dismissedAt) {
      const hoursSinceDismissed = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60);
      if (hoursSinceDismissed < 24) {
        setIsDismissed(true);
      }
    }

    // Detect iOS Safari
    const ua = window.navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;

    if (isIOSDevice && !isStandalone) {
      setIsIOS(true);
      setShowInstallPrompt(true);
    }

    // Listen for beforeinstallprompt event (Android / Chromium)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    if (needRefresh) {
      setShowUpdatePrompt(true);
    }
  }, [needRefresh]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
  };

  const handleDismissUpdate = () => {
    setShowUpdatePrompt(false);
    setNeedRefresh(false);
  };

  if (isDismissed && !showUpdatePrompt) return null;

  return (
    <AnimatePresence>
      {/* New Version Update Toast */}
      {showUpdatePrompt && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
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
              New version available
            </p>
            <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              Reload to update portfolio app.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => updateServiceWorker(true)}
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
              onClick={handleDismissUpdate}
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
          </div>
        </motion.div>
      )}

      {/* PWA Install Banner (Android / Chromium & iOS Safari) */}
      {showInstallPrompt && !showUpdatePrompt && !isDismissed && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.25 }}
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '24px',
            zIndex: 9998,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '14px 18px',
            maxWidth: '380px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
          }}
        >
          <div style={{ color: 'var(--text-primary)', marginTop: '2px', display: 'flex' }}>
            <Smartphone size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Install App Experience
            </p>
            <p style={{ margin: '3px 0 8px', fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              {isIOS ? (
                <>Tap <Share size={12} style={{ verticalAlign: 'middle', display: 'inline' }} /> <strong>Share</strong>, then select <strong>"Add to Home Screen"</strong> for instant offline access.</>
              ) : (
                'Add this portfolio to your home screen for quick offline access.'
              )}
            </p>
            {!isIOS && deferredPrompt && (
              <button
                onClick={handleInstallClick}
                style={{
                  background: 'var(--text-primary)',
                  color: 'var(--bg-primary)',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Download size={14} /> Install App
              </button>
            )}
          </div>
          <button
            onClick={handleDismiss}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '2px',
            }}
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
