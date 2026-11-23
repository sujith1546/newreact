import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Mail, X, Loader2, RefreshCw, Copy, Check } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';

const COLUMNS = [
  { key: 'new', label: 'New', color: '#6366F1', bg: 'rgba(99,102,241,0.08)' },
  { key: 'reviewed', label: 'Reviewed', color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
  { key: 'contacted', label: 'Contacted', color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
  { key: 'closed', label: 'Closed', color: '#8896B3', bg: 'rgba(136,150,179,0.08)' },
];

const EMAIL_TEMPLATES = [
  {
    label: 'Initial Response',
    color: '#6366F1',
    subject: 'Re: Connecting regarding technical opportunities',
    body: `Hi [Name],\n\nThank you so much for reaching out! I appreciate you taking the time to review my portfolio.\n\nI'd be glad to discuss how my background in machine learning and full-stack engineering aligns with your team's initiatives. Would you be open to a brief 20-minute discussion this week?\n\nBest regards,\nSujith Thota`
  },
  {
    label: 'Interview Availability',
    color: '#10B981',
    subject: 'Re: Interview Scheduling - Sujith Thota',
    body: `Hi [Name],\n\nThank you for considering me for this position. I am very interested in learning more about the engineering challenges your team is solving.\n\nI am available for an interview on weekdays between 10:00 AM and 6:00 PM IST. Please feel free to send a calendar invite or link.\n\nLooking forward to speaking!\n\nBest,\nSujith Thota`
  },
  {
    label: 'Polite Decline',
    color: '#EC4899',
    subject: 'Re: Opportunity Discussion',
    body: `Hi [Name],\n\nThank you very much for getting in touch and thinking of me for this role.\n\nAt this moment, I am focused on specialized AI/ML systems roles that closely match my current focus. I would love to stay in touch for future possibilities.\n\nWarm regards,\nSujith Thota`
  },
];

function getPriorityScore(message) {
  const text = (message || '').toLowerCase();
  if (/senior|lead|principal|director|cto|vp|founder/.test(text)) return 5;
  if (/full.?time|permanent|offer|salary|package/.test(text)) return 4;
  if (/interview|opportunity|role|position|opening/.test(text)) return 3;
  if (/freelance|contract|part.?time|intern/.test(text)) return 2;
  return 1;
}

function getPriorityColor(score) {
  return { 5: '#10B981', 4: '#6366F1', 3: '#F59E0B', 2: '#F97316', 1: '#8896B3' }[score] || '#8896B3';
}

function timeAgo(ts) {
  if (!ts) return '';
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function MessageCard({ msg, onSelect, onMove, isSelected }) {
  const score = getPriorityScore(msg.message);
  const scoreColor = getPriorityColor(score);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      onClick={() => onSelect(msg)}
      style={{
        padding: '10px 12px',
        borderRadius: 10,
        background: isSelected ? 'rgba(99,102,241,0.08)' : 'var(--pcms-panel)',
        border: `1px solid ${isSelected ? 'rgba(99,102,241,0.35)' : 'var(--pcms-line)'}`,
        cursor: 'pointer',
        marginBottom: 8,
        transition: 'all 0.15s'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 5 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: scoreColor, flexShrink: 0 }} title={`Priority: ${score}/5`} />
          <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--pcms-text)' }}>{msg.name || 'Anonymous Recruiter'}</span>
        </div>
        <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--pcms-muted)', background: 'var(--pcms-panel-2)', padding: '2px 6px', borderRadius: 6, flexShrink: 0 }}>{timeAgo(msg.created_at)}</span>
      </div>
      <p style={{ margin: '0 0 6px', fontSize: 11, color: 'var(--pcms-muted)', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.email}</p>
      <p style={{ margin: '0 0 8px', fontSize: 12, color: 'var(--pcms-text)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{msg.message}</p>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {COLUMNS.filter(c => c.key !== (msg.status || 'new')).map(c => (
          <button
            key={c.key}
            type="button"
            onClick={e => { e.stopPropagation(); onMove(msg.id, c.key); }}
            style={{ fontSize: 10, padding: '2px 7px', borderRadius: 5, border: `1px solid ${c.color}40`, background: `${c.color}10`, color: c.color, cursor: 'pointer', fontWeight: 600 }}
          >
            → {c.label}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

export default function RecruiterCRMPanel() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [copiedTemplate, setCopiedTemplate] = useState(null);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
      setMessages(data || []);
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => { loadMessages(); }, []);

  const handleMove = async (id, newStatus) => {
    try {
      await supabase.from('messages').update({ status: newStatus }).eq('id', id);
    } catch (_) {}
    setMessages(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m));
    if (selected?.id === id) setSelected(prev => ({ ...prev, status: newStatus }));
  };

  const handleMarkRead = async (id) => {
    try {
      await supabase.from('messages').update({ read: true }).eq('id', id);
    } catch (_) {}
    setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
    if (selected?.id === id) setSelected(prev => ({ ...prev, read: true }));
  };

  const handleCopyTemplate = (template) => {
    const text = `Subject: ${template.subject}\n\n${template.body.replace('[Name]', selected?.name || 'there')}`;
    navigator.clipboard.writeText(text);
    setCopiedTemplate(template.label);
    setTimeout(() => setCopiedTemplate(null), 2000);
  };

  const columnMessages = (key) => messages.filter(m => (m.status || 'new') === key);
  const totalNew = columnMessages('new').length;
  const totalContacted = columnMessages('contacted').length;

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Loader2 size={24} className="spin" style={{ color: 'var(--pcms-accent)' }} /></div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={18} color="#fff" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--pcms-text)', fontFamily: "'Space Grotesk', sans-serif" }}>Recruiter CRM</h2>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--pcms-muted)' }}>Interactive candidate pipeline & lead management</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { label: 'Total Inbound', value: messages.length, color: '#6366F1' },
              { label: 'Unreviewed', value: totalNew, color: '#EC4899' },
              { label: 'Contacted', value: totalContacted, color: '#10B981' }
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center', padding: '6px 12px', borderRadius: 8, background: 'var(--pcms-panel-2)', border: '1px solid var(--pcms-line)' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 10, color: 'var(--pcms-muted)', fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <button type="button" onClick={loadMessages} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--pcms-line)', background: 'var(--pcms-panel-2)', color: 'var(--pcms-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Kanban Layout */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 10, flex: 1, minWidth: 0 }}>
          {COLUMNS.map(col => {
            const colMsgs = columnMessages(col.key);
            return (
              <div key={col.key} style={{ background: col.bg, border: `1px solid ${col.color}30`, borderRadius: 12, padding: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: col.color }}>{col.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: col.color, background: `${col.color}18`, width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {colMsgs.length}
                  </span>
                </div>
                <div style={{ maxHeight: 440, overflowY: 'auto', scrollbarWidth: 'thin' }}>
                  <AnimatePresence>
                    {colMsgs.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--pcms-muted)', fontSize: 11 }}>No items</div>
                    ) : (
                      colMsgs.map(msg => (
                        <MessageCard key={msg.id} msg={msg} onSelect={setSelected} onMove={handleMove} isSelected={selected?.id === msg.id} />
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Drawer / Detail */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              style={{
                width: 290,
                flexShrink: 0,
                background: 'var(--pcms-panel)',
                border: '1px solid var(--pcms-line)',
                borderRadius: 12,
                overflow: 'hidden'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: '1px solid var(--pcms-line)', background: 'var(--pcms-panel-2)' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--pcms-text)' }}>Lead Details</span>
                <button type="button" onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--pcms-muted)', display: 'flex', alignItems: 'center' }}><X size={15} /></button>
              </div>
              <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--pcms-text)', marginBottom: 2 }}>{selected.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--pcms-muted)' }}>{selected.email}</div>
                  <div style={{ fontSize: 10, color: 'var(--pcms-muted)', marginTop: 4 }}>Received: {timeAgo(selected.created_at)}</div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {(() => {
                    const s = getPriorityScore(selected.message);
                    return <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: `${getPriorityColor(s)}18`, color: getPriorityColor(s), border: `1px solid ${getPriorityColor(s)}40` }}>Priority {s}/5</span>;
                  })()}
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: selected.read ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: selected.read ? '#10B981' : '#EF4444', border: `1px solid ${selected.read ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
                    {selected.read ? 'Read' : 'Unread'}
                  </span>
                </div>
                <div style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--pcms-panel-2)', border: '1px solid var(--pcms-line)', fontSize: 12, color: 'var(--pcms-text)', lineHeight: 1.6, maxHeight: 150, overflowY: 'auto' }}>
                  {selected.message}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <a
                    href={`mailto:${selected.email}?subject=Re: Inbound from portfolio`}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px', borderRadius: 8, background: '#6366F1', color: '#fff', textDecoration: 'none', fontSize: 12, fontWeight: 700 }}
                  >
                    <Mail size={13} /> Open Mail Client
                  </a>
                  {!selected.read && (
                    <button
                      type="button"
                      onClick={() => handleMarkRead(selected.id)}
                      style={{ padding: '8px', borderRadius: 8, border: '1px solid var(--pcms-line)', background: 'var(--pcms-panel-2)', color: 'var(--pcms-text)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--pcms-muted)', marginBottom: 6 }}>Update Pipeline Stage</div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {COLUMNS.filter(c => c.key !== (selected.status || 'new')).map(c => (
                      <button
                        key={c.key}
                        type="button"
                        onClick={() => handleMove(selected.id, c.key)}
                        style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, border: `1px solid ${c.color}40`, background: `${c.color}10`, color: c.color, cursor: 'pointer', fontWeight: 600 }}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Response Templates */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="pcms-panel-card">
        <div className="pcms-panel-header">
          <div className="pcms-panel-title-row">
            <div className="pcms-panel-icon" style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981' }}><Mail size={15} /></div>
            <div>
              <div className="pcms-panel-title">Recruiter Email Templates</div>
              <div className="pcms-panel-subtitle">Instant clipboard templates pre-formatted for outreach</div>
            </div>
          </div>
        </div>
        <div className="pcms-panel-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {EMAIL_TEMPLATES.map(t => (
              <div key={t.label} style={{ padding: '14px', borderRadius: 10, background: 'var(--pcms-panel-2)', border: `1px solid ${t.color}30` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: t.color }}>{t.label}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyTemplate(t)}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, border: '1px solid var(--pcms-line)', background: 'var(--pcms-panel)', color: copiedTemplate === t.label ? '#10B981' : 'var(--pcms-muted)', fontSize: 11, cursor: 'pointer' }}
                  >
                    {copiedTemplate === t.label ? <Check size={11} /> : <Copy size={11} />}
                    {copiedTemplate === t.label ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <p style={{ margin: 0, fontSize: 11, color: 'var(--pcms-muted)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {t.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
