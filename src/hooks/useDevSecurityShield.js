import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

/**
 * useDevSecurityShield
 * Protects portfolio source code, blocks right-click context menu,
 * and intercepts developer tools keyboard shortcuts when enabled by admin.
 */
export function useDevSecurityShield() {
  const [protectedActive, setProtectedActive] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('pcms_disable_inspect') === 'true';
  });

  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    // 1. Sync from Supabase site_settings
    async function fetchSecuritySetting() {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('disable_inspect')
          .limit(1)
          .single();
        if (data && typeof data.disable_inspect !== 'undefined') {
          const isActive = !!data.disable_inspect;
          localStorage.setItem('pcms_disable_inspect', String(isActive));
          setProtectedActive(isActive);
        }
      } catch (_) {}
    }
    fetchSecuritySetting();

    // 2. Realtime listener for site_settings changes
    const channel = supabase
      .channel('security_shield_realtime')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'site_settings' }, (payload) => {
        if (payload?.new && typeof payload.new.disable_inspect !== 'undefined') {
          const isActive = !!payload.new.disable_inspect;
          localStorage.setItem('pcms_disable_inspect', String(isActive));
          setProtectedActive(isActive);
        }
      })
      .subscribe();

    // 3. Local storage & custom event listener
    const syncLocal = () => {
      setProtectedActive(localStorage.getItem('pcms_disable_inspect') === 'true');
    };
    window.addEventListener('storage', syncLocal);
    window.addEventListener('pcms_security_changed', syncLocal);

    return () => {
      window.removeEventListener('storage', syncLocal);
      window.removeEventListener('pcms_security_changed', syncLocal);
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!protectedActive) return;

    // Check if user is currently inside Admin console (admin retains developer tools)
    const isAdmin = window.location.pathname.startsWith('/admin');
    if (isAdmin) return;

    let timeoutId = null;
    const showToast = (msg) => {
      if (timeoutId) clearTimeout(timeoutId);
      setToastMessage(msg || "🛡️ Right-click & Developer Tools are protected by Admin Security.");
      timeoutId = setTimeout(() => setToastMessage(null), 2500);
    };

    // 1. Block Context Menu (Right Click)
    const handleContextMenu = (e) => {
      e.preventDefault();
      showToast("🛡️ Right-click is protected by Admin Security.");
      return false;
    };

    // 2. Block Inspect & DevTools Shortcuts
    const handleKeyDown = (e) => {
      const isMac = typeof navigator !== 'undefined' && navigator.platform?.toUpperCase().indexOf('MAC') >= 0;
      const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

      // F12 (DevTools)
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        showToast("🛡️ DevTools (F12) is protected by Admin Security.");
        return false;
      }

      // Ctrl + Shift + I (Inspect)
      if (ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.keyCode === 73)) {
        e.preventDefault();
        e.stopPropagation();
        showToast("🛡️ Inspect Element is protected by Admin Security.");
        return false;
      }

      // Ctrl + Shift + J (Console)
      if (ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j' || e.keyCode === 74)) {
        e.preventDefault();
        e.stopPropagation();
        showToast("🛡️ Console access is protected by Admin Security.");
        return false;
      }

      // Ctrl + Shift + C (Element Selector)
      if (ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c' || e.keyCode === 67)) {
        e.preventDefault();
        e.stopPropagation();
        showToast("🛡️ Element Inspector is protected by Admin Security.");
        return false;
      }

      // Ctrl + U (View Source)
      if (ctrlKey && (e.key === 'U' || e.key === 'u' || e.keyCode === 85)) {
        e.preventDefault();
        e.stopPropagation();
        showToast("🛡️ Source Code inspection is protected by Admin Security.");
        return false;
      }

      // Ctrl + S (Save Page)
      if (ctrlKey && (e.key === 'S' || e.key === 's' || e.keyCode === 83)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [protectedActive]);

  return { protectedActive, toastMessage };
}
