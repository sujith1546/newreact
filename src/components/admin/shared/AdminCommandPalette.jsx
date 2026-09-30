import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Briefcase, Zap, Star, MessageSquare, Shield,
  Lock, Sun, Moon, Download, ExternalLink, Activity,
  ArrowRight, CornerDownLeft, Sparkles, AlertTriangle,
  Brain, FileText, CheckCircle2, X, Monitor, Smartphone, Bug
} from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { useTheme } from '../../../context/ThemeContext';
import { exportPortfolioSnapshot } from '../../../lib/snapshotManager';
import { ALL_NAV_ITEMS } from './constants';

export default function AdminCommandPalette({ isOpen, onClose, onLockSession }) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dbItems, setDbItems] = useState({ projects: [], skills: [] });
  const [loadingDb, setLoadingDb] = useState(false);
  const [actionFeedback, setActionFeedback] = useState(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Fetch quick database items for instant search
  useEffect(() => {
    let mounted = true;
    async function fetchSearchIndex() {
      setLoadingDb(true);
      try {
        const [projRes, skillsRes] = await Promise.all([
          supabase.from('projects').select('id, title, description, tags').limit(25),
          supabase.from('skills').select('id, name, category, proficiency_level').limit(30),
        ]);
        if (mounted) {
          setDbItems({
            projects: projRes.data || [],
            skills: skillsRes.data || [],
          });
        }
      } catch (_) {}
      if (mounted) setLoadingDb(false);
    }

    if (isOpen) {
      fetchSearchIndex();
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }

    return () => { mounted = false; };
  }, [isOpen]);

  // Static Action Items
  const ACTION_ITEMS = useMemo(() => [
    {
      id: 'action-project',
      category: 'Actions',
      label: 'Create New Project',
      sub: 'Open project creator modal',
      icon: Briefcase,
      color: '#10B981',
      run: () => {
        navigate('/admin/dashboard/projects');
        window.dispatchEvent(new CustomEvent('pcms_open_new_project'));
        onClose();
      },
    },
    {
      id: 'action-update',
      category: 'Actions',
      label: 'Broadcast Site Update',
      sub: 'Announce milestone or new feature',
      icon: Zap,
      color: '#F59E0B',
      run: () => {
        navigate('/admin/dashboard/updates');
        window.dispatchEvent(new CustomEvent('pcms_open_new_update'));
        onClose();
      },
    },
    {
      id: 'action-diagnostics',
      category: 'Diagnostics',
      label: 'Run Bug & Issue Diagnostics Radar',
      sub: 'Scan website for runtime bugs, broken DOM & network issues',
      icon: Bug,
      color: '#F43F5E',
      run: () => {
        navigate('/admin/dashboard/diagnostics');
        onClose();
      },
    },
    {
      id: 'action-export',
      category: 'Data & Backup',
      label: 'Export Complete JSON Backup',
      sub: 'Download all tables into timestamped JSON',
      icon: Download,
      color: '#6366F1',
      run: async () => {
        setActionFeedback('Exporting backup...');
        await exportPortfolioSnapshot();
        setActionFeedback('Backup downloaded successfully!');
        setTimeout(() => { setActionFeedback(null); onClose(); }, 1200);
      },
    },
    {
      id: 'action-stealth',
      category: 'Security',
      label: 'Toggle Site Maintenance (Stealth Mode)',
      sub: 'Lock live public site into maintenance',
      icon: AlertTriangle,
      color: '#EF4444',
      run: async () => {
        try {
          const { data } = await supabase.from('site_settings').select('site_disabled').eq('id', 1).single();
          const nextState = !data?.site_disabled;
          await supabase.from('site_settings').update({ site_disabled: nextState }).eq('id', 1);
          setActionFeedback(nextState ? 'Site is now LOCKED (Stealth)' : 'Site is now LIVE');
          window.dispatchEvent(new CustomEvent('pcms_data_updated', { detail: { table: 'site_settings' } }));
          setTimeout(() => { setActionFeedback(null); onClose(); }, 1200);
        } catch (_) {
          onClose();
        }
      },
    },
    {
      id: 'action-theme',
      category: 'Settings',
      label: `Switch Theme to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
      sub: `Currently using ${theme} theme`,
      icon: theme === 'dark' ? Sun : Moon,
      color: '#EC4899',
      run: () => {
        toggleTheme();
        onClose();
      },
    },
    {
      id: 'action-lock',
      category: 'Security',
      label: 'Lock Admin Session Screen',
      sub: 'Require Master PIN or Biometrics to resume',
      icon: Lock,
      color: '#8B5CF6',
      run: () => {
        onClose();
        if (onLockSession) onLockSession('manual');
      },
    },
    {
      id: 'action-live',
      category: 'Navigation',
      label: 'Open Live Portfolio Website',
      sub: 'Open public website in a new tab',
      icon: ExternalLink,
      color: '#06B6D4',
      run: () => {
        window.open('/', '_blank');
        onClose();
      },
    },
    {
      id: 'action-mode-mobile',
      category: 'Viewport Mode',
      label: 'Switch to Mobile View',
      sub: 'Switch to compact mobile executive dashboard',
      icon: Smartphone,
      color: '#3B82F6',
      run: () => {
        window.dispatchEvent(new CustomEvent('pcms_set_device_mode', { detail: { mode: 'mobile' } }));
        onClose();
      },
    },
    {
      id: 'action-mode-desktop',
      category: 'Viewport Mode',
      label: 'Switch to Desktop View',
      sub: 'Switch to full desktop command center',
      icon: Monitor,
      color: '#10B981',
      run: () => {
        window.dispatchEvent(new CustomEvent('pcms_set_device_mode', { detail: { mode: 'desktop' } }));
        onClose();
      },
    },
    {
      id: 'action-mode-auto',
      category: 'Viewport Mode',
      label: 'Switch to Auto Responsive View',
      sub: 'Follow browser window dimensions automatically',
      icon: Monitor,
      color: '#8B5CF6',
      run: () => {
        window.dispatchEvent(new CustomEvent('pcms_set_device_mode', { detail: { mode: 'auto' } }));
        onClose();
      },
    },
  ], [navigate, onClose, onLockSession, theme, toggleTheme]);

  // Combined Results Filtered by Query
  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();

    // 1. Navigation items
    const navs = ALL_NAV_ITEMS.map(n => ({
      id: `nav-${n.key}`,
      category: 'Navigation',
      label: `Go to ${n.label}`,
      sub: `Open ${n.label} panel`,
      icon: Briefcase,
      color: n.color || 'var(--primary-blue)',
      run: () => {
        navigate(`/admin/dashboard/${n.key}`);
        onClose();
      },
    }));

    // 2. Database projects
    const projs = dbItems.projects.map(p => ({
      id: `proj-${p.id}`,
      category: 'Projects',
      label: p.title,
      sub: p.tags?.join(' • ') || p.description?.substring(0, 45) || 'Portfolio Project',
      icon: Briefcase,
      color: '#10B981',
      run: () => {
        navigate('/admin/dashboard/projects');
        onClose();
      },
    }));

    // 3. Database skills
    const skills = dbItems.skills.map(s => ({
      id: `skill-${s.id}`,
      category: 'Skills',
      label: s.name,
      sub: `${s.category?.replace(/_/g, ' ')} • ${s.proficiency_level}`,
      icon: Star,
      color: '#06B6D4',
      run: () => {
        navigate('/admin/dashboard/skills');
        onClose();
      },
    }));

    const pool = [...ACTION_ITEMS, ...navs, ...projs, ...skills];

    if (!q) {
      // Default initial view: prioritized actions + core navigation
      return pool.filter(item => item.category === 'Actions' || item.category === 'Security' || item.category === 'Data & Backup').slice(0, 8);
    }

    return pool.filter(item => {
      const matchLabel = item.label.toLowerCase().includes(q);
      const matchSub = item.sub?.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      return matchLabel || matchSub || matchCat;
    }).slice(0, 15);
  }, [query, dbItems, ACTION_ITEMS, navigate, onClose]);

  // Handle Keyboard Navigation
  useEffect(() => {
    function handleKeyDown(e) {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (filteredResults.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredResults.length) % (filteredResults.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredResults[selectedIndex]) {
          filteredResults[selectedIndex].run();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredResults, selectedIndex, onClose]);

  // Ensure active element in list is scrolled into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector('[data-selected="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: 'min(14vh, 120px)',
        paddingLeft: 16,
        paddingRight: 16,
      }}>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
        />

        {/* Command Palette Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -12 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: 620,
            borderRadius: 16,
            background: 'var(--bg-secondary, #14161b)',
            border: '1px solid var(--border-color, rgba(255, 255, 255, 0.14))',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.08)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Action Feedback Banner */}
          {actionFeedback && (
            <div style={{
              background: '#10b981',
              color: '#ffffff',
              padding: '8px 16px',
              fontSize: 12,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              justifyContent: 'center',
            }}>
              <CheckCircle2 size={14} />
              <span>{actionFeedback}</span>
            </div>
          )}

          {/* Search Header Input */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '14px 18px',
            borderBottom: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
          }}>
            <Search size={18} style={{ color: 'var(--text-muted, #94a3b8)', flexShrink: 0 }} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Search projects, actions, settings, or jump to panel... (Esc to close)"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: 15,
                fontWeight: 500,
                color: 'var(--text-primary, #ffffff)',
                fontFamily: 'var(--font-sans)',
              }}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 2,
                }}
              >
                <X size={15} />
              </button>
            )}
            <kbd style={{
              fontSize: 11,
              fontWeight: 600,
              padding: '2px 6px',
              borderRadius: 6,
              background: 'var(--bg-primary, rgba(255, 255, 255, 0.06))',
              border: '1px solid var(--border-color, rgba(255, 255, 255, 0.12))',
              color: 'var(--text-muted, #94a3b8)',
            }}>
              ESC
            </kbd>
          </div>

          {/* Results List */}
          <div
            ref={listRef}
            style={{
              maxHeight: 380,
              overflowY: 'auto',
              padding: '8px 10px',
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
            }}
          >
            {filteredResults.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '36px 16px',
                color: 'var(--text-muted, #94a3b8)',
                fontSize: 13,
              }}>
                No matches found for "{query}". Try searching for "project", "backup", "lock", or "theme".
              </div>
            ) : (
              filteredResults.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                const Icon = item.icon;

                return (
                  <div
                    key={item.id}
                    data-selected={isSelected}
                    onClick={() => item.run()}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                      padding: '9px 12px',
                      borderRadius: 10,
                      cursor: 'pointer',
                      background: isSelected ? 'var(--primary-blue, #3b82f6)' : 'transparent',
                      color: isSelected ? '#ffffff' : 'var(--text-primary, #ffffff)',
                      transition: 'background 0.1s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
                      <div style={{
                        width: 28,
                        height: 28,
                        borderRadius: 7,
                        background: isSelected ? 'rgba(255,255,255,0.2)' : `${item.color || '#6366F1'}18`,
                        color: isSelected ? '#ffffff' : item.color || '#6366F1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <Icon size={14} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{
                          fontSize: 13,
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {item.label}
                        </div>
                        {item.sub && (
                          <div style={{
                            fontSize: 11,
                            color: isSelected ? 'rgba(255,255,255,0.8)' : 'var(--text-muted, #94a3b8)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}>
                            {item.sub}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      <span style={{
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        padding: '2px 6px',
                        borderRadius: 5,
                        background: isSelected ? 'rgba(255,255,255,0.2)' : 'var(--bg-primary, rgba(255,255,255,0.06))',
                        color: isSelected ? '#ffffff' : 'var(--text-muted, #94a3b8)',
                      }}>
                        {item.category}
                      </span>
                      {isSelected && <CornerDownLeft size={13} style={{ opacity: 0.8 }} />}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 16px',
            borderTop: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
            fontSize: 11,
            color: 'var(--text-muted, #94a3b8)',
            background: 'var(--bg-primary, rgba(0, 0, 0, 0.2))',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span><kbd style={{ padding: '1px 4px', borderRadius: 4, background: 'rgba(255,255,255,0.08)' }}>↑</kbd> <kbd style={{ padding: '1px 4px', borderRadius: 4, background: 'rgba(255,255,255,0.08)' }}>↓</kbd> Navigate</span>
              <span><kbd style={{ padding: '1px 4px', borderRadius: 4, background: 'rgba(255,255,255,0.08)' }}>↵</kbd> Select</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={12} color="var(--primary-blue, #3b82f6)" />
              <span>Universal Command Center</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
