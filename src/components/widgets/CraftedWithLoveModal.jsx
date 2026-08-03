import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Sparkles, Cpu, Layers, ShieldCheck, Mail, ExternalLink, Code2 } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';

export default function CraftedWithLoveModal({ isOpen, onClose }) {
  const { theme } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="crafted-modal-title"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
            }}
          />

          {/* Modal Container */}
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 12 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '520px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '20px',
              border: '1px solid var(--border-color)',
              padding: '28px',
              boxShadow: '0 30px 70px rgba(0, 0, 0, 0.4)',
              color: 'var(--text-primary)',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              zIndex: 1000000,
              overflow: 'hidden',
              userSelect: 'none'
            }}
          >
            {/* Ambient Background Glow */}
            <div
              style={{
                position: 'absolute',
                top: '-40px',
                right: '-40px',
                width: '180px',
                height: '180px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(239, 68, 68, 0.25) 0%, transparent 70%)',
                filter: 'blur(30px)',
                pointerEvents: 'none'
              }}
            />

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(239, 68, 68, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ef4444'
                }}>
                  <Heart size={20} fill="#ef4444" />
                </div>
                <div>
                  <h3 id="crafted-modal-title" style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                    Crafted with Love
                  </h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    Designed & Engineered by Sujith Thota
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  padding: '4px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Hero Quote Card */}
            <div style={{
              padding: '16px 18px',
              borderRadius: '14px',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              marginBottom: '20px',
              fontSize: '13px',
              color: 'var(--text-secondary)',
              lineHeight: 1.6
            }}>
              <p style={{ margin: '0 0 8px', fontWeight: 600, color: 'var(--text-primary)' }}>
                ✨ "Crafted with passion, precision, and state-of-the-art Web & AI engineering."
              </p>
              <span>
                Built to deliver an ultra-fast, responsive portfolio powered by Groq LPU inference, Voyage vector RAG, dynamic glassmorphism, and instant scheduling telemetry.
              </span>
            </div>

            {/* Technology Stack Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '22px' }}>
              <TechStackCard
                icon={<Code2 size={16} color="var(--primary-blue)" />}
                title="Frontend Architecture"
                desc="React 18 · Vite · Framer Motion · PWA"
              />
              <TechStackCard
                icon={<Cpu size={16} color="#10b981" />}
                title="AI Telemetry & LLM"
                desc="Groq LPU (llama-3.3-70b) · Voyage AI"
              />
              <TechStackCard
                icon={<Layers size={16} color="#8b5cf6" />}
                title="Vector Database"
                desc="Supabase pgvector RAG Embeddings"
              />
              <TechStackCard
                icon={<ShieldCheck size={16} color="#f59e0b" />}
                title="Design System"
                desc="Adaptive Glassmorphism · CSS Tokens"
              />
            </div>

            {/* Footer Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <a
                href="https://github.com/sujith1546/newreact"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1,
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  fontSize: '13px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <FaGithub size={15} /> Star on GitHub
              </a>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  window.dispatchEvent(new CustomEvent('open-email-modal'));
                }}
                style={{
                  flex: 1,
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--primary-blue)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px color-mix(in srgb, var(--primary-blue) 35%, transparent)'
                }}
              >
                <Mail size={15} /> Get in Touch
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

function TechStackCard({ icon, title, desc }) {
  return (
    <div style={{
      padding: '12px 14px',
      borderRadius: '12px',
      backgroundColor: 'var(--bg-primary)',
      border: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {icon}
        <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</span>
      </div>
      <span style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>{desc}</span>
    </div>
  );
}
