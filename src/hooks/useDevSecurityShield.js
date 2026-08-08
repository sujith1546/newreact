import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

/**
 * useDevSecurityShield
 * Enterprise Security Suite for Portfolio:
 * 1. Anti-Inspect & Right-Click Shield (F12, Ctrl+Shift+I/J/C, Ctrl+U, Context Menu)
 * 2. Anti-Copy & Text Selection Guard (Prevents copying and image dragging)
 * 3. Anti-Print & PDF Export Blocker (Ctrl+P and Print Media styling)
 * 4. Clickjacking & Frame Guard (Blocks unauthorized iframe embedding)
 * 5. Holographic Watermark Shield
 */
export function useDevSecurityShield() {
  const [securityState, setSecurityState] = useState(() => {
    if (typeof window === 'undefined') {
      return {
        disableInspect: false,
        disableCopy: false,
        disablePrint: false,
        frameGuard: false,
        securityWatermark: false,
      };
    }
    return {
      disableInspect: localStorage.getItem('pcms_disable_inspect') === 'true',
      disableCopy: localStorage.getItem('pcms_disable_copy') === 'true',
      disablePrint: localStorage.getItem('pcms_disable_print') === 'true',
      frameGuard: localStorage.getItem('pcms_frame_guard') === 'true',
      securityWatermark: localStorage.getItem('pcms_security_watermark') === 'true',
    };
  });

  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    // 1. Sync all security settings from Supabase site_settings
    async function fetchSecuritySettings() {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .limit(1)
          .single();
        if (data && !error) {
          const next = {
            disableInspect: typeof data.disable_inspect !== 'undefined' ? !!data.disable_inspect : (localStorage.getItem('pcms_disable_inspect') === 'true'),
            disableCopy: typeof data.disable_copy !== 'undefined' ? !!data.disable_copy : (localStorage.getItem('pcms_disable_copy') === 'true'),
            disablePrint: typeof data.disable_print !== 'undefined' ? !!data.disable_print : (localStorage.getItem('pcms_disable_print') === 'true'),
            frameGuard: typeof data.frame_guard !== 'undefined' ? !!data.frame_guard : (localStorage.getItem('pcms_frame_guard') === 'true'),
            securityWatermark: typeof data.security_watermark !== 'undefined' ? !!data.security_watermark : (localStorage.getItem('pcms_security_watermark') === 'true'),
          };
          localStorage.setItem('pcms_disable_inspect', String(next.disableInspect));
          localStorage.setItem('pcms_disable_copy', String(next.disableCopy));
          localStorage.setItem('pcms_disable_print', String(next.disablePrint));
          localStorage.setItem('pcms_frame_guard', String(next.frameGuard));
          localStorage.setItem('pcms_security_watermark', String(next.securityWatermark));
          setSecurityState(next);
        }
      } catch (_) {}
    }
    fetchSecuritySettings();

    // 2. Realtime listener for site_settings changes
    const channel = supabase
      .channel('security_suite_realtime')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'site_settings' }, (payload) => {
        if (payload?.new) {
          const d = payload.new;
          const next = {
            disableInspect: typeof d.disable_inspect !== 'undefined' ? !!d.disable_inspect : securityState.disableInspect,
            disableCopy: typeof d.disable_copy !== 'undefined' ? !!d.disable_copy : securityState.disableCopy,
            disablePrint: typeof d.disable_print !== 'undefined' ? !!d.disable_print : securityState.disablePrint,
            frameGuard: typeof d.frame_guard !== 'undefined' ? !!d.frame_guard : securityState.frameGuard,
            securityWatermark: typeof d.security_watermark !== 'undefined' ? !!d.security_watermark : securityState.securityWatermark,
          };
          localStorage.setItem('pcms_disable_inspect', String(next.disableInspect));
          localStorage.setItem('pcms_disable_copy', String(next.disableCopy));
          localStorage.setItem('pcms_disable_print', String(next.disablePrint));
          localStorage.setItem('pcms_frame_guard', String(next.frameGuard));
          localStorage.setItem('pcms_security_watermark', String(next.securityWatermark));
          setSecurityState(next);
        }
      })
      .subscribe();

    // 3. Local storage & custom event listener
    const syncLocal = () => {
      setSecurityState({
        disableInspect: localStorage.getItem('pcms_disable_inspect') === 'true',
        disableCopy: localStorage.getItem('pcms_disable_copy') === 'true',
        disablePrint: localStorage.getItem('pcms_disable_print') === 'true',
        frameGuard: localStorage.getItem('pcms_frame_guard') === 'true',
        securityWatermark: localStorage.getItem('pcms_security_watermark') === 'true',
      });
    };
    window.addEventListener('storage', syncLocal);
    window.addEventListener('pcms_security_changed', syncLocal);

    try {
      console.log(
        "%c⛔ STOP: ENTERPRISE SECURITY ACTIVE\n%cThis browser session is protected by Sujith Thota Portfolio Security Shield.\nDo not execute or paste unauthorized scripts into this console.",
        "color: #ef4444; font-size: 18px; font-weight: 800;",
        "color: #94a3b8; font-size: 12px; font-weight: 600; line-height: 1.6;"
      );
    } catch (_) {}

    return () => {
      window.removeEventListener('storage', syncLocal);
      window.removeEventListener('pcms_security_changed', syncLocal);
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    // Check if user is currently inside Admin console (admin retains developer tools)
    const isAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
    if (isAdmin) return;

    let timeoutId = null;
    const showToast = (msg) => {
      if (timeoutId) clearTimeout(timeoutId);
      setToastMessage(msg || "🛡️ Protected by Admin Security.");
      timeoutId = setTimeout(() => setToastMessage(null), 2500);
    };

    // ─── 1. Anti-Clickjacking Frame Guard ───
    if (securityState.frameGuard && typeof window !== 'undefined') {
      try {
        if (window.top !== window.self) {
          window.top.location = window.self.location;
        }
      } catch (_) {}
    }

    // ─── 2. Anti-Copy & Text Selection Guard ───
    let copyStyleTag = null;
    if (securityState.disableCopy) {
      copyStyleTag = document.createElement('style');
      copyStyleTag.id = 'security-anticopy-style';
      copyStyleTag.innerHTML = `
        * {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
        }
        img, svg {
          -webkit-user-drag: none !important;
          user-drag: none !important;
          pointer-events: auto;
        }
      `;
      document.head.appendChild(copyStyleTag);
    }

    const handleCopy = (e) => {
      if (securityState.disableCopy) {
        e.preventDefault();
        showToast("🛡️ Text copying is protected by Admin Security.");
        return false;
      }
    };

    const handleDragStart = (e) => {
      if (securityState.disableCopy && (e.target.nodeName === 'IMG' || e.target.nodeName === 'A')) {
        e.preventDefault();
        return false;
      }
    };

    // ─── 3. Anti-Print & Screenshot Blocker ───
    let printStyleTag = null;
    if (securityState.disablePrint) {
      printStyleTag = document.createElement('style');
      printStyleTag.id = 'security-antiprint-style';
      printStyleTag.innerHTML = `
        @media print {
          body { display: none !important; }
        }
      `;
      document.head.appendChild(printStyleTag);
    }

    // ─── 4. Anti-Inspect & DevTools Shortcuts ───
    const handleContextMenu = (e) => {
      if (securityState.disableInspect) {
        e.preventDefault();
        showToast("🛡️ Right-click is protected by Admin Security.");
        return false;
      }
    };

    const handleKeyDown = (e) => {
      const isMac = typeof navigator !== 'undefined' && navigator.platform?.toUpperCase().indexOf('MAC') >= 0;
      const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

      // Print Blocker: Ctrl + P
      if (securityState.disablePrint && ctrlKey && (e.key === 'P' || e.key === 'p' || e.keyCode === 80)) {
        e.preventDefault();
        e.stopPropagation();
        showToast("🛡️ Page printing is protected by Admin Security.");
        return false;
      }

      if (!securityState.disableInspect) return;

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
    document.addEventListener('copy', handleCopy);
    document.addEventListener('dragstart', handleDragStart);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('dragstart', handleDragStart);
      if (copyStyleTag && copyStyleTag.parentNode) copyStyleTag.parentNode.removeChild(copyStyleTag);
      if (printStyleTag && printStyleTag.parentNode) printStyleTag.parentNode.removeChild(printStyleTag);
    };
  }, [securityState]);

  return {
    ...securityState,
    protectedActive: securityState.disableInspect,
    toastMessage
  };
}
