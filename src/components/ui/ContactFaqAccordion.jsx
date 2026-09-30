import React, { useState } from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, ArrowUpRight, Sparkles } from 'lucide-react';

const FAQ_ITEMS = [
  {
    id: 'roles',
    question: 'What roles or opportunities are you looking for?',
    answer:
      "I'm actively seeking full-time Software Engineer, Full-Stack Developer, and Applied AI/ML roles. I have strong foundations in building responsive, micro-animated web applications (React, Vite, Node, FastAPI) and training/deploying machine learning and vector search systems.",
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
    id: 'response-time',
    question: 'How fast can I expect a response?',
    answer:
      'I monitor messages daily and aim to reply within 24 hours. For direct inquiries, submitting a note via any of the desks above routes directly to my primary inbox.',
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

export default function ContactFaqAccordion({ onSelectDesk }) {
  const [openItem, setOpenItem] = useState('roles');

  return (
    <div
      style={{
        marginTop: '32px',
        width: '100%',
        maxWidth: '720px',
        margin: '32px auto 0',
      }}
    >
      {/* Subtle Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
          padding: '0 4px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              backgroundColor: 'color-mix(in srgb, var(--primary-blue) 12%, transparent)',
              color: 'var(--primary-blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <HelpCircle size={14} />
          </div>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: 'var(--text-muted)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            Frequently Asked Questions
          </span>
        </div>
        <span
          style={{
            fontSize: '11px',
            color: 'var(--text-muted)',
            fontWeight: 600,
          }}
        >
          Quick answers
        </span>
      </div>

      {/* Radix Accordion Root */}
      <Accordion.Root
        type="single"
        collapsible
        value={openItem}
        onValueChange={(val) => setOpenItem(val)}
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
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
                transition: 'background-color 0.2s ease',
              }}
            >
              <Accordion.Header style={{ margin: 0 }}>
                <Accordion.Trigger
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: isOpen ? 'var(--text-primary)' : 'var(--text-secondary)',
                    transition: 'color 0.2s ease, background-color 0.2s ease',
                    outline: 'none',
                    userSelect: 'none',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isOpen) e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  <span
                    style={{
                      fontSize: '14.5px',
                      fontWeight: 700,
                      letterSpacing: '-0.01em',
                      paddingRight: '16px',
                      color: isOpen ? 'var(--text-primary)' : 'var(--text-secondary)',
                      transition: 'color 0.15s ease',
                    }}
                  >
                    {item.question}
                  </span>

                  {/* Smooth Rotating Chevron with Motion */}
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      backgroundColor: isOpen
                        ? 'color-mix(in srgb, var(--primary-blue) 10%, transparent)'
                        : 'transparent',
                      color: isOpen ? 'var(--primary-blue)' : 'var(--text-muted)',
                      flexShrink: 0,
                    }}
                  >
                    <ChevronDown size={16} strokeWidth={2.5} />
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
                        opacity: { duration: 0.22, ease: 'easeInOut' },
                      }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div
                        style={{
                          padding: '0 20px 18px',
                          fontSize: '13px',
                          lineHeight: 1.6,
                          color: 'var(--text-secondary)',
                        }}
                      >
                        <p style={{ margin: '0 0 10px' }}>{item.answer}</p>

                        {/* Interactive Quick-Action Chip */}
                        {item.actionLabel && onSelectDesk && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.96 }}
                            type="button"
                            onClick={() => onSelectDesk(item.deskId)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '5px 12px',
                              borderRadius: '999px',
                              border: '1px solid color-mix(in srgb, var(--primary-blue) 30%, transparent)',
                              backgroundColor: 'color-mix(in srgb, var(--primary-blue) 8%, transparent)',
                              color: 'var(--primary-blue)',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              marginTop: '4px',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <span>{item.actionLabel}</span>
                            <ArrowUpRight size={13} />
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
    </div>
  );
}
