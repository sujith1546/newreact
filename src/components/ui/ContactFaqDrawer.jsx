import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import * as Accordion from '@radix-ui/react-accordion';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, X, ArrowUpRight, Sparkles, MessageSquare } from 'lucide-react';

const FAQ_ITEMS = [
  {
    id: 'roles',
    question: 'What roles or opportunities are you looking for?',
    answer:
      "I'm actively seeking full-time Software Engineer, Frontend / Full-Stack Developer, and Applied AI/ML roles. I have strong experience building responsive, micro-animated web applications (React, Vite, Node, FastAPI) and training/deploying machine learning and vector search systems.",
    actionLabel: 'Open Hiring Desk',
    deskId: 'rec',
  },
  {
    id: 'relocation',
    question: 'Are you open to relocation or remote positions?',
    answer:
      "Yes, absolutely. I'm open to relocating across India (Bengaluru, Hyderabad, Pune, Mumbai, Delhi NCR) as well as global remote opportunities. I'm comfortable collaborating across international time zones with strong async communication.",
    actionLabel: null,
    deskId: null,
  },
  {
    id: 'freelance',
    question: 'What is your turnaround for freelance / client projects?',
    answer:
      'Turnaround depends on scope, but typical production-ready web apps, custom landing pages, or AI integrations ship within 1 to 4 weeks. Every project is delivered with clean architecture, mobile-first responsiveness, and deployment support.',
    actionLabel: 'Discuss a Project',
    deskId: 'frl',
  },
  {
    id: 'rates',
    question: 'How do your rates and pricing work?',
    answer:
      'For full-time roles, I am open to standard competitive compensation packages based on role scope. For client projects, I offer milestone-based fixed pricing or weekly retainers with clear deliverables agreed upfront.',
    actionLabel: 'Discuss a budget',
    deskId: 'frl',
  },
  {
    id: 'response-time',
    question: 'How fast can I expect a response?',
    answer:
      'I monitor messages daily and aim to reply within 24 hours. For direct inquiries, submitting a note via any of the desks routes directly to my primary inbox.',
    actionLabel: 'Say hello',
    deskId: 'gen',
  },
  {
    id: 'collaboration',
    question: 'Are you interested in open-source or hackathon collabs?',
    answer:
      "Always! If you're building an exciting AI tool, open-source repository, or preparing for high-impact hackathons, I love teaming up with passionate builders.",
    actionLabel: 'Collaborate together',
    deskId: 'col',
  },
];

export default function ContactFaqDrawer({ isOpen, onClose, onSelectDesk }) {
  const [openItem, setOpenItem] = useState('roles');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999 }}>
          {/* Glassmorphism Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.55)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
            }}
          />

          {/* Slide-over Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320, mass: 0.9 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              maxWidth: '460px',
              backgroundColor: 'var(--bg-secondary)',
              borderLeft: '1px solid var(--border-color)',
              boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.22)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 100000,
              boxSizing: 'border-box',
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 22px 16px',
                borderBottom: '1px solid var(--border-color)',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: 'color-mix(in srgb, var(--primary-blue) 12%, transparent)',
                    color: 'var(--primary-blue)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <HelpCircle size={18} />
                </div>
                <div>
                  <h2
                    style={{
                      fontSize: '16px',
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      margin: 0,
                      letterSpacing: '-0.015em',
                    }}
                  >
                    Frequently Asked Questions
                  </h2>
                  <p
                    style={{
                      fontSize: '11.5px',
                      color: 'var(--text-secondary)',
                      margin: '2px 0 0',
                    }}
                  >
                    Quick answers before reaching out
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                type="button"
                onClick={onClose}
                aria-label="Close FAQ drawer"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'color 0.15s ease, background-color 0.15s ease',
                }}
              >
                <X size={16} />
              </motion.button>
            </div>

            {/* Drawer Body (Scrollable inside drawer without affecting main page) */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px 20px 30px',
                overscrollBehavior: 'contain',
              }}
            >
              {/* Radix UI Accordion with Framer Motion height animation */}
              <Accordion.Root
                type="single"
                collapsible
                value={openItem}
                onValueChange={(val) => setOpenItem(val)}
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                }}
              >
                {FAQ_ITEMS.map((item, index) => {
                  const isOpen = openItem === item.id;
                  const isFirst = index === 0;

                  return (
                    <Accordion.Item
                      key={item.id}
                      value={item.id}
                      style={{
                        borderTop: isFirst ? 'none' : '1px solid var(--border-color)',
                      }}
                    >
                      <Accordion.Header style={{ margin: 0 }}>
                        <Accordion.Trigger
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '15px 18px',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            textAlign: 'left',
                            color: isOpen ? 'var(--text-primary)' : 'var(--text-secondary)',
                            transition: 'color 0.15s ease',
                            outline: 'none',
                            userSelect: 'none',
                            WebkitTapHighlightColor: 'transparent',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '13.5px',
                              fontWeight: 700,
                              letterSpacing: '-0.01em',
                              paddingRight: '12px',
                              color: isOpen ? 'var(--text-primary)' : 'var(--text-secondary)',
                              lineHeight: 1.4,
                            }}
                          >
                            {item.question}
                          </span>

                          {/* Smooth Rotating Chevron */}
                          <motion.div
                            animate={{ rotate: isOpen ? 180 : 0 }}
                            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '26px',
                              height: '26px',
                              borderRadius: '6px',
                              backgroundColor: isOpen
                                ? 'color-mix(in srgb, var(--primary-blue) 12%, transparent)'
                                : 'transparent',
                              color: isOpen ? 'var(--primary-blue)' : 'var(--text-muted)',
                              flexShrink: 0,
                            }}
                          >
                            <ChevronDown size={15} strokeWidth={2.5} />
                          </motion.div>
                        </Accordion.Trigger>
                      </Accordion.Header>

                      {/* Smooth Animated Height Content with Framer Motion */}
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <Accordion.Content forceMount asChild>
                            <motion.div
                              key={`content-${item.id}`}
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{
                                height: { type: 'spring', stiffness: 340, damping: 32 },
                                opacity: { duration: 0.2, ease: 'easeInOut' },
                              }}
                              style={{ overflow: 'hidden' }}
                            >
                              <div
                                style={{
                                  padding: '0 18px 16px',
                                  fontSize: '12.5px',
                                  lineHeight: 1.6,
                                  color: 'var(--text-secondary)',
                                }}
                              >
                                <p style={{ margin: '0 0 10px' }}>{item.answer}</p>

                                {/* Interactive Quick Action Chip */}
                                {item.actionLabel && onSelectDesk && (
                                  <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.96 }}
                                    type="button"
                                    onClick={() => {
                                      onClose();
                                      onSelectDesk(item.deskId);
                                    }}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '5px',
                                      padding: '5px 12px',
                                      borderRadius: '999px',
                                      border: '1px solid color-mix(in srgb, var(--primary-blue) 30%, transparent)',
                                      backgroundColor: 'color-mix(in srgb, var(--primary-blue) 8%, transparent)',
                                      color: 'var(--primary-blue)',
                                      fontSize: '11px',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      marginTop: '2px',
                                      transition: 'all 0.15s ease',
                                    }}
                                  >
                                    <span>{item.actionLabel}</span>
                                    <ArrowUpRight size={12} />
                                  </motion.button>
                                )}
                              </div>
                            </motion.div>
                          </Accordion.Content>
                        )}
                      </AnimatePresence>
                    </Accordion.Item>
                  );
                })}
              </Accordion.Root>

              {/* Bottom Quick Help Card */}
              <div
                style={{
                  marginTop: '20px',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  backgroundColor: 'color-mix(in srgb, var(--primary-blue) 4%, var(--bg-primary))',
                  border: '1px solid color-mix(in srgb, var(--primary-blue) 18%, var(--border-color))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div>
                  <h4 style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    Have another question?
                  </h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                    Send a note directly via the contact form.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSelectDesk('gen');
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: 'var(--primary-blue)',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  Write message
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
