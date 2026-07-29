import { useState, useEffect, useRef, useCallback } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

const SNOOZE_DURATION_MS = 10 * 60 * 1000; // 10 minutes snooze on cancel/dismiss
const IDLE_TIMEOUT_MS = 60 * 1000;         // 60s idle threshold before countdown
const COUNTDOWN_START_SEC = 5;              // 5s visible countdown

/**
 * Custom hook wrapping useRegisterSW for smart PWA updates:
 * 1. Preloads new SW in waiting state before prompting.
 * 2. Idle-aware auto-reload with 5s countdown & 10min snooze logic.
 * 3. Cross-tab synchronization via BroadcastChannel('pwa-update').
 */
export function useSmartUpdate() {
  const [showToast, setShowToast] = useState(false);
  const [countdown, setCountdown] = useState(null); // null or number (5, 4, 3, 2, 1)
  const [isSnoozed, setIsSnoozed] = useState(false);

  const channelRef = useRef(null);
  const idleTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const snoozeTimerRef = useRef(null);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      if (r) {
        // Periodically check for SW updates (every 1 hour)
        setInterval(() => r.update(), 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('SW Registration error:', error);
    },
  });

  // 1. Cross-Tab Synchronization via BroadcastChannel
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;
    const channel = new BroadcastChannel('pwa-update');
    channelRef.current = channel;

    channel.onmessage = (event) => {
      const { type, payload } = event.data || {};
      if (type === 'SHOW_TOAST') {
        setShowToast(true);
      } else if (type === 'START_COUNTDOWN') {
        setCountdown(payload.count);
      } else if (type === 'CANCEL_COUNTDOWN') {
        setCountdown(null);
        setShowToast(false);
      } else if (type === 'RELOAD') {
        updateServiceWorker(true);
      }
    };

    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, [updateServiceWorker]);

  const broadcast = useCallback((type, payload = {}) => {
    if (channelRef.current) {
      channelRef.current.postMessage({ type, payload });
    }
  }, []);

  const reload = useCallback(() => {
    broadcast('RELOAD');
    updateServiceWorker(true);
  }, [broadcast, updateServiceWorker]);

  // 2. Preload & Show Toast when Service Worker is ready
  useEffect(() => {
    if (needRefresh && !isSnoozed) {
      setShowToast(true);
      broadcast('SHOW_TOAST');
    }
  }, [needRefresh, isSnoozed, broadcast]);

  // 3. Countdown Execution Logic
  useEffect(() => {
    if (countdown === null) return;

    if (countdown <= 0) {
      reload();
      return;
    }

    countdownIntervalRef.current = setTimeout(() => {
      const nextCount = countdown - 1;
      setCountdown(nextCount);
      broadcast('START_COUNTDOWN', { count: nextCount });
    }, 1000);

    return () => {
      if (countdownIntervalRef.current) clearTimeout(countdownIntervalRef.current);
    };
  }, [countdown, reload, broadcast]);

  // 4. Idle Detection & Countdown Triggering
  const startCountdown = useCallback(() => {
    if (countdown !== null) return;
    setCountdown(COUNTDOWN_START_SEC);
    broadcast('START_COUNTDOWN', { count: COUNTDOWN_START_SEC });
  }, [countdown, broadcast]);

  const cancelCountdown = useCallback(() => {
    if (countdownIntervalRef.current) clearTimeout(countdownIntervalRef.current);
    setCountdown(null);
    setShowToast(false);
    setNeedRefresh(false);

    // Snooze re-prompting for 10 minutes
    setIsSnoozed(true);
    if (snoozeTimerRef.current) clearTimeout(snoozeTimerRef.current);
    snoozeTimerRef.current = setTimeout(() => {
      setIsSnoozed(false);
    }, SNOOZE_DURATION_MS);

    broadcast('CANCEL_COUNTDOWN');
  }, [broadcast, setNeedRefresh]);

  const dismiss = useCallback(() => {
    cancelCountdown();
  }, [cancelCountdown]);

  // Idle user activity listeners
  useEffect(() => {
    if (!showToast || countdown !== null) return;

    const resetIdleTimer = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        startCountdown();
      }, IDLE_TIMEOUT_MS);
    };

    const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'];
    events.forEach(ev => window.addEventListener(ev, resetIdleTimer));
    resetIdleTimer();

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      events.forEach(ev => window.removeEventListener(ev, resetIdleTimer));
    };
  }, [showToast, countdown, startCountdown]);

  // Live Demo Helpers for testing in browser console or dev environment
  useEffect(() => {
    window.triggerPWAUpdateDemo = () => {
      setShowToast(true);
      broadcast('SHOW_TOAST');
    };
    window.triggerPWACountdownDemo = () => {
      setShowToast(true);
      setCountdown(5);
      broadcast('START_COUNTDOWN', { count: 5 });
    };
  }, [broadcast]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (countdownIntervalRef.current) clearTimeout(countdownIntervalRef.current);
      if (snoozeTimerRef.current) clearTimeout(snoozeTimerRef.current);
    };
  }, []);

  return {
    showToast,
    countdown,
    reload,
    dismiss,
    cancelCountdown,
    needRefresh,
  };
}
