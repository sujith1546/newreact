import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function BottomSheet({ isOpen, onClose, title, children }) {
  const sheetRef = useRef(null);
  const previousFocusRef = useRef(null);

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
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "sheet-title" : undefined}
            tabIndex={-1}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Handle Bar */}
            <div className="admin-sheet-handle-bar" onClick={onClose}>
              <div className="admin-sheet-handle" />
            </div>

            {/* Header */}
            <div className="admin-sheet-header">
              {title ? (
                <h3 id="sheet-title" className="admin-sheet-title">{title}</h3>
              ) : <div />}
              <button
                className="admin-sheet-close-btn"
                onClick={onClose}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="admin-sheet-content">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
