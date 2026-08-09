import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, FileText, Code, Briefcase, Award, Mail, ExternalLink, Moon, Sun, ArrowRight, X, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const SEARCH_ITEMS = [
  { id: 'p-home', category: 'Navigation', title: 'Home Overview', desc: 'Main portfolio landing page', icon: Sparkles, action: '/home' },
  { id: 'p-skills', category: 'Navigation', title: 'Tech Stack & Skills', desc: '12+ languages, frameworks & AI tools', icon: Code, action: '/skills' },
  { id: 'p-projects', category: 'Navigation', title: 'Projects & Work', desc: '10+ shipped apps & case studies', icon: Briefcase, action: '/projects' },
  { id: 'p-exp', category: 'Navigation', title: 'Career Experience', desc: 'Work history & engineering roles', icon: Briefcase, action: '/experience' },
  { id: 'p-edu', category: 'Navigation', title: 'Education & Academics', desc: 'VIT University B.Tech CSE (8.7 CGPA)', icon: Award, action: '/education' },
  { id: 'p-cert', category: 'Navigation', title: 'Certifications', desc: 'Credentials from Google, Meta & Oracle', icon: Award, action: '/certifications' },
  { id: 'p-contact', category: 'Navigation', title: 'Contact & Hire', desc: 'Send an email or message', icon: Mail, action: '/contact' },
  
  // High-Intent Quick Actions
  { id: 'a-resume', category: 'Actions', title: 'View Resume PDF', desc: 'Open Sujith Thota official resume', icon: FileText, type: 'resume' },
  { id: 'a-email', category: 'Actions', title: 'Copy Email Address', desc: 'sujithreddy1546@gmail.com', icon: Mail, type: 'copy_email' },
  { id: 'a-admin', category: 'Actions', title: 'Admin Control Center', desc: 'Access CMS dashboard & settings', icon: ExternalLink, action: '/admin/login' },

  // Projects
  { id: 'proj-1', category: 'Projects', title: 'SMS Finance Analyzer', desc: 'Privacy-first RAG pipeline using Gemini 2.5 Flash', icon: Code, action: '/projects' },
  { id: 'proj-2', category: 'Projects', title: 'Autonomous GenUI Agent', desc: 'Local AI agent desktop environment', icon: Code, action: '/projects' },
  { id: 'proj-3', category: 'Projects', title: 'Enterprise Security Suite', desc: 'Zero-trust defense & auth hardening engine', icon: Code, action: '/projects' },
];

export default function CommandPaletteModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Global custom event trigger
  useEffect(() => {
    const handleOpenCmdK = () => setIsOpen(true);
    window.addEventListener('open-cmdk', handleOpenCmdK);
    return () => window.removeEventListener('open-cmdk', handleOpenCmdK);
  }, []);

  // Filter items based on search query
  const filteredItems = SEARCH_ITEMS.filter((item) => {
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.desc.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  // Handle item execution
  const executeItem = (item) => {
    if (!item) return;
    setIsOpen(false);
    setQuery('');

    if (item.type === 'resume') {
      window.dispatchEvent(new CustomEvent('open-resume'));
    } else if (item.type === 'copy_email') {
      navigator.clipboard.writeText('sujithreddy1546@gmail.com');
      alert('✉️ Email copied: sujithreddy1546@gmail.com');
    } else if (item.action) {
      if (item.action.startsWith('/')) {
        navigate(item.action);
      } else {
        window.open(item.action, '_blank');
      }
    }
  };

  // Keyboard Navigation inside Modal
  const handleInputKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        executeItem(filteredItems[selectedIndex]);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '10vh', paddingLeft: 16, paddingRight: 16 }}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 580,
              borderRadius: 16,
              background: 'var(--bg-secondary, rgba(18, 18, 22, 0.96))',
              border: '1px solid var(--border-color, rgba(99, 102, 241, 0.35))',
              boxShadow: '0 24px 60px -10px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(99, 102, 241, 0.2)',
              overflow: 'hidden',
              zIndex: 10000,
            }}
          >
            {/* Search Input Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', borderBottom: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))' }}>
              <Search size={18} color="#6366f1" />
              <input
                ref={inputRef}
                autoFocus
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                onKeyDown={handleInputKeyDown}
                placeholder="Type a command or search… (e.g. Projects, Skills, Resume)"
                style={{
                  width: '100%', background: 'none', border: 'none', outline: 'none',
                  fontSize: 14, fontWeight: 500, color: 'var(--text-primary, #fff)',
                  fontFamily: 'inherit'
                }}
              />
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted, #94a3b8)', cursor: 'pointer', padding: 2 }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Items List */}
            <div style={{ maxHeight: 340, overflowY: 'auto', padding: '8px 10px' }}>
              {filteredItems.length > 0 ? (
                filteredItems.map((item, idx) => {
                  const Icon = item.icon;
                  const isSelected = idx === selectedIndex;

                  return (
                    <div
                      key={item.id}
                      onClick={() => executeItem(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                        background: isSelected ? 'rgba(99, 102, 241, 0.14)' : 'transparent',
                        border: isSelected ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                        transition: 'all 0.1s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                        <div style={{
                          width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                          background: isSelected ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                          color: isSelected ? '#6366f1' : 'var(--text-muted, #94a3b8)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <Icon size={15} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary, #fff)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.title}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted, #94a3b8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1 }}>
                            {item.desc}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        <span style={{ fontSize: 9.5, fontWeight: 700, padding: '2px 7px', borderRadius: 5, background: 'rgba(255, 255, 255, 0.06)', color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {item.category}
                        </span>
                        {isSelected && <ArrowRight size={14} color="#6366f1" />}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: '32px 14px', textAlign: 'center', color: 'var(--text-muted, #94a3b8)', fontSize: 13 }}>
                  No matching commands found for "<span style={{ color: 'var(--text-primary, #fff)' }}>{query}</span>"
                </div>
              )}
            </div>

            {/* Footer Navigation Bar */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 18px', borderTop: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
              background: 'rgba(0, 0, 0, 0.2)', fontSize: 11, color: 'var(--text-muted, #94a3b8)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 5px', borderRadius: 4, fontSize: 10 }}>↑</kbd>
                  <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 5px', borderRadius: 4, fontSize: 10 }}>↓</kbd>
                  Navigate
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 5px', borderRadius: 4, fontSize: 10 }}>↵</kbd>
                  Select
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Command size={11} /> + K
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
