import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CopyButton({ textToCopy, label = 'Copy to clipboard' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? 'Copied!' : label}
      title={copied ? 'Copied!' : label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '28px',
        height: '28px',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        backgroundColor: copied ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.06)',
        color: copied ? '#10b981' : 'var(--text-secondary)',
        cursor: 'pointer',
        outline: 'none',
        transition: 'all 0.15s ease',
        flexShrink: 0,
        position: 'relative'
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="check"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <Check size={14} strokeWidth={2.5} />
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <Copy size={13} strokeWidth={2} />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
