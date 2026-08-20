import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { X } from 'lucide-react';

export default function BottomSheet({ isOpen, onClose, title, children }) {
  const sheetRef = useRef(null);
  const previousFocusRef = useRef(null);
  const dragControls = useDragControls();

  // Focus management & Browser Back button interception
  useEffect(() => {
    if (!isOpen) return;

    // 1. Capture previous focus
    previousFocusRef.current = document.activeElement;

    // 2. Move focus into bottom sheet
    setTimeout(() => {
      if (sheetRef.current) {
        const focusable = sheetRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length > 0) {
          focusable[0].focus();
        } else {
          sheetRef.current.focus();
        }
      }
    }, 50);

    // 3. Browser back button interception
    const handlePopState = () => {
      onClose();
    };
    window.history.pushState({ sheetOpen: true }, '');
    window.addEventListener('popstate', handlePopState);

    // 4. Trap focus & handle Escape key
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab' && sheetRef.current) {
        const focusable = sheetRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
      
      // Clean up history if closed programmatically
      if (window.history.state && window.history.state.sheetOpen) {
        window.history.back();
      }

      // Restore focus
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="admin-sheet-backdrop"
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              zIndex: 10000,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Sheet Container */}
          <motion.div
            ref={sheetRef}
            className="admin-bottom-sheet"
            drag="y"
            dragListener={false}
            dragControls={dragControls}
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0, bottom: 0.35 }}
            onDragEnd={(e, { offset, velocity }) => {
              if (offset.y > 160 || (velocity.y > 500 && offset.y > 40)) {
                onClose();
              }
            }}
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 10001,
              background: 'var(--pcms-panel, #121215)',
              borderTop: '1px solid var(--pcms-line, rgba(255, 255, 255, 0.15))',
              borderRadius: '24px 24px 0 0',
              maxHeight: '88vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 -12px 40px rgba(0, 0, 0, 0.6)',
              overflow: 'hidden',
              paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 16px))',
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "sheet-title" : undefined}
            tabIndex={-1}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
          >
            {/* Handle Bar */}
            <div
              className="admin-sheet-handle-bar"
              onPointerDown={(e) => dragControls.start(e)}
              style={{
                padding: '12px 0 6px',
                display: 'flex',
                justifyContent: 'center',
                cursor: 'grab',
                touchAction: 'none',
                flexShrink: 0
              }}
            >
              <div className="admin-sheet-handle" style={{ width: 38, height: 5, borderRadius: 3, background: 'rgba(255, 255, 255, 0.25)' }} />
            </div>

            {/* Header */}
            <div className="admin-sheet-header" style={{ padding: '8px 20px 14px', borderBottom: '1px solid var(--pcms-line-soft, rgba(255, 255, 255, 0.08))', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              {title ? (
                <h3 id="sheet-title" className="admin-sheet-title" style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--pcms-text, #ffffff)', fontFamily: "'Space Grotesk', sans-serif" }}>{title}</h3>
              ) : <div />}
              <button
                className="admin-sheet-close-btn"
                onClick={onClose}
                aria-label="Close dialog"
                style={{ background: 'rgba(255, 255, 255, 0.08)', border: 'none', borderRadius: '50%', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--pcms-muted, #a1a1aa)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="admin-sheet-content" style={{ padding: '16px 20px 36px', overflowY: 'auto', WebkitOverflowScrolling: 'touch', flex: 1 }}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
