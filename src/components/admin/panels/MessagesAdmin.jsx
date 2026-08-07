import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient'; 
import { Archive, ArchiveRestore, Trash2, Star } from 'lucide-react';

// ---- 3a. Realtime data hook ----
export function useMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let channel;

    async function load() {
      const { data } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
      setMessages(data || []);
      setLoading(false);
    }

    load();

    const channelName = `messages_admin_${Math.random().toString(36).substring(7)}`;
    channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_messages' }, (payload) => {
        setMessages((prev) => {
          if (payload.eventType === 'INSERT') return [payload.new, ...prev];
          if (payload.eventType === 'UPDATE') return prev.map((m) => (m.id === payload.new.id ? payload.new : m));
          if (payload.eventType === 'DELETE') return prev.filter((m) => m.id !== payload.old.id);
          return prev;
        });
      })
      .subscribe();

    return () => channel && supabase.removeChannel(channel);
  }, []);

  return { messages, loading };
}

// ---- 3b. Live unread badge (drop <UnreadBadge/> in your sidebar) ----
export function useUnreadCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let channel;

    async function load() {
      const { count: c } = await supabase
        .from('contact_messages')
        .select('id', { count: 'exact', head: true })
        .eq('is_read', false)
        .eq('is_archived', false)
        .eq('is_spam', false);
      setCount(c || 0);
    }

    load();

    const channelName = `messages_unread_badge_${Math.random().toString(36).substring(7)}`;
    channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_messages' }, load)
      .subscribe();

    return () => channel && supabase.removeChannel(channel);
  }, []);

  return count;
}

export function UnreadBadge() {
  const count = useUnreadCount();
  if (!count) return null;
  return <span style={badgeStyles.badge}>{count > 99 ? '99+' : count}</span>;
}

const badgeStyles = {
  badge: { background: 'var(--pcms-red, #EF4444)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 100, marginLeft: 8 },
};

// ---- 3c. Actions ----
export function useMessageActions() {
  async function update(id, patch) {
    await supabase.from('contact_messages').update(patch).eq('id', id);
  }
  async function bulkUpdate(ids, patch) {
    await supabase.from('contact_messages').update(patch).in('id', ids);
  }
  async function remove(id) {
    await supabase.from('contact_messages').delete().eq('id', id);
  }
  async function bulkRemove(ids) {
    await supabase.from('contact_messages').delete().in('id', ids);
  }
  return { update, bulkUpdate, remove, bulkRemove };
}

// ---- 3d. One row, expands inline instead of a separate detail page ----
function MessageRow({ msg, selected, onToggleSelect, actions }) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(msg.notes || '');

  function openAndMarkRead() {
    setExpanded((e) => !e);
    if (!msg.is_read) actions.update(msg.id, { is_read: true });
  }

  function markReplied() {
    actions.update(msg.id, { status: 'replied', replied_at: new Date().toISOString() });
  }

  const initial = msg.name ? msg.name.charAt(0).toUpperCase() : '?';

  return (
    <div className={`pcms-msg-card-wrap ${msg.is_read ? 'read' : 'unread'}`} style={{ borderBottom: '1px solid var(--pcms-line-soft, #F0F1F4)' }}>
      <div className="pcms-msg-card-main" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Top Header Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input 
            type="checkbox" 
            className="pcms-chk"
            checked={selected} 
            onChange={() => onToggleSelect(msg.id)} 
          />

          <div 
            style={{
              width: 34, height: 34, borderRadius: '50%',
              background: msg.is_read ? 'var(--pcms-panel-2, #F7F8FA)' : 'rgba(99,102,241,0.15)',
              color: msg.is_read ? 'var(--pcms-muted)' : '#6366F1',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 13, flexShrink: 0,
            }}
          >
            {initial}
          </div>

          <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={openAndMarkRead}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
              <span className="pcms-msg-name" style={{ fontWeight: msg.is_read ? 500 : 700, fontSize: 13.5, color: 'var(--pcms-text)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {msg.name}
              </span>
              <span className="pcms-msg-date" style={{ fontSize: 11, color: 'var(--pcms-muted)', flexShrink: 0 }}>
                {new Date(msg.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--pcms-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {msg.email}
            </div>
          </div>
        </div>

        {/* Snippet & Badges Row */}
        <div style={{ cursor: 'pointer', paddingLeft: 44 }} onClick={openAndMarkRead}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
            {msg.is_spam && <span className="pcms-badge" style={{ background: 'rgba(196, 67, 47, 0.12)', color: '#C4432F', fontSize: 10, padding: '1px 6px', borderRadius: 4 }}>Spam</span>}
            <span className={`pcms-badge ${msg.status === 'replied' ? 'pcms-replied' : 'pcms-closed'}`} style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4 }}>
              {msg.status === 'replied' ? 'Replied' : msg.status === 'closed' ? 'Closed' : 'New'}
            </span>
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--pcms-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4 }}>
            {msg.message}
          </div>
        </div>

        {/* Card Actions Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 44, paddingTop: 4 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <svg
              className="pcms-star"
              width="16" height="16" viewBox="0 0 24 24" fill={msg.is_starred ? '#B7791B' : 'none'} stroke="currentColor" strokeWidth="1.6"
              onClick={() => actions.update(msg.id, { is_starred: !msg.is_starred })}
              style={{ cursor: 'pointer', color: msg.is_starred ? '#B7791B' : 'var(--pcms-muted-2)' }}
            >
              <path d="m12 2 3 6 6.5 1-4.7 4.5 1.1 6.5L12 17l-5.9 3 1.1-6.5L2.5 9l6.5-1z"/>
            </svg>

            <span onClick={openAndMarkRead} style={{ fontSize: 11.5, fontWeight: 600, color: '#6366F1', cursor: 'pointer' }}>
              {expanded ? 'Hide details' : 'View message'}
            </span>
          </div>

          <div className="pcms-msg-actions" style={{ display: 'flex', gap: 12, color: 'var(--pcms-muted-2)' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" onClick={() => actions.update(msg.id, { is_archived: !msg.is_archived })} title={msg.is_archived ? 'Unarchive' : 'Archive'}>
              <rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8M10 12h4"/>
            </svg>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" onClick={() => actions.remove(msg.id)} title="Delete">
              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            </svg>
          </div>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: '14px 16px', background: 'var(--pcms-panel-2)', borderTop: '1px solid var(--pcms-line-soft)' }}>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--pcms-text)', margin: '0 0 12px', whiteSpace: 'pre-wrap' }}>{msg.message}</p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 11, color: 'var(--pcms-muted)', marginBottom: 12 }}>
            {msg.ip_address && <span>IP: {msg.ip_address}</span>}
            {msg.referrer_path && <span>From: {msg.referrer_path}</span>}
            <span>Spam score: {msg.spam_score ?? 0}/100</span>
          </div>

          <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
            <a
              href={`mailto:${msg.email}?subject=Re: your message&body=Hi ${msg.name},%0D%0A%0D%0A`}
              onClick={markReplied}
              className="pcms-btn-dark"
              style={{ textDecoration: 'none', padding: '6px 12px', fontSize: 12 }}
            >
              Reply by email
            </a>
            <select
              value={msg.status}
              onChange={(e) => actions.update(msg.id, { status: e.target.value })}
              className="pcms-select"
              style={{ padding: '6px 10px', fontSize: 12 }}
            >
              <option value="new">New</option>
              <option value="replied">Replied</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <textarea
            placeholder="Private notes (only you see this)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => actions.update(msg.id, { notes })}
            style={{ width: '100%', minHeight: 60, fontSize: 12, padding: 10, borderRadius: 8, border: '1px solid var(--pcms-line)', background: 'var(--pcms-panel)', fontFamily: 'inherit', resize: 'vertical', color: 'var(--pcms-text)' }}
          />
        </div>
      )}
    </div>
  );
}

function Toolbar({ query, setQuery, filter, setFilter, sort, setSort, selectedIds, onBulk, onExport }) {
  const FILTER_OPTIONS = [
    { key: 'inbox', label: 'Inbox' },
    { key: 'unread', label: 'Unread' },
    { key: 'starred', label: 'Starred' },
    { key: 'archived', label: 'Archived' },
    { key: 'spam', label: 'Spam' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Search Bar */}
      <div style={{ position: 'relative', width: '100%' }}>
        <input
          className="pcms-search"
          placeholder="Search name, email, or message..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ width: '100%', paddingLeft: 34 }}
        />
        <i className="ti ti-search" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--pcms-muted)', fontSize: 14 }} />
      </div>

      {/* Filter Chips Bar */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 2 }}>
        {FILTER_OPTIONS.map((f) => {
          const isActive = filter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                padding: '5px 12px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: isActive ? 600 : 500,
                border: `1px solid ${isActive ? '#6366F1' : 'var(--pcms-line)'}`,
                background: isActive ? 'rgba(99,102,241,0.12)' : 'var(--pcms-panel)',
                color: isActive ? '#6366F1' : 'var(--pcms-muted)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Action Sub-row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select className="pcms-select" value={sort} onChange={(e) => setSort(e.target.value)} style={{ fontSize: 12, padding: '5px 10px' }}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
          <button className="pcms-btn-secondary" onClick={onExport} style={{ padding: '5px 10px', fontSize: 12 }}>
            Export CSV
          </button>
        </div>

        {selectedIds.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--pcms-text)', flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--pcms-muted)', fontSize: 11 }}>{selectedIds.length} selected:</span>
            <button onClick={() => onBulk({ is_read: true })} className="pcms-btn-secondary" style={{ padding: '4px 8px', fontSize: 11 }}>Mark read</button>
            <button onClick={() => onBulk({ is_archived: true })} className="pcms-btn-secondary" style={{ padding: '4px 8px', fontSize: 11 }}>Archive</button>
            <button onClick={() => onBulk(null, 'delete')} className="pcms-btn-secondary" style={{ padding: '4px 8px', fontSize: 11, color: 'var(--pcms-red)', borderColor: 'rgba(239,68,68,0.3)' }}>Delete</button>
          </div>
        )}
      </div>
    </div>
  );
}

const toolbarStyles = {
  wrap: { display: 'flex', alignItems: 'center', gap: 10, padding: '20px 28px 16px', flexWrap: 'wrap', background: 'transparent' },
  search: { flex: 1, minWidth: 220, fontSize: 13, padding: '10px 14px', borderRadius: 6, border: '1px solid var(--line, #E7E9EE)', background: 'var(--panel, #FFFFFF)', color: 'var(--text, #0F1626)' },
  select: { fontSize: 12, padding: '10px 12px', borderRadius: 6, border: '1px solid var(--line, #E7E9EE)', background: 'var(--panel, #FFFFFF)', color: 'var(--text, #0F1626)', fontFamily: 'Inter, sans-serif', cursor: 'pointer' },
  exportBtn: { fontSize: 12, fontWeight: 500, padding: '10px 16px', borderRadius: 6, border: 'none', background: 'var(--text, #0F1626)', cursor: 'pointer', color: '#FFFFFF' },
  bulkBar: { display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, marginLeft: 'auto', color: 'var(--text, #0F1626)' },
  bulkBtn: { fontSize: 12, fontWeight: 500, padding: '8px 12px', borderRadius: 6, border: '1px solid var(--line, #E7E9EE)', background: 'var(--panel, #FFFFFF)', cursor: 'pointer', color: 'var(--text, #0F1626)' },
};

// ---- 3f. The page itself ----
export default function MessagesAdmin() {
  const { messages, loading } = useMessages();
  const actions = useMessageActions();

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('inbox');
  const [sort, setSort] = useState('newest');
  const [selectedIds, setSelectedIds] = useState([]);

  const filtered = useMemo(() => {
    let list = messages;

    if (filter === 'inbox') list = list.filter((m) => !m.is_archived && !m.is_spam);
    if (filter === 'unread') list = list.filter((m) => !m.is_read && !m.is_archived && !m.is_spam);
    if (filter === 'starred') list = list.filter((m) => m.is_starred);
    if (filter === 'archived') list = list.filter((m) => m.is_archived);
    if (filter === 'spam') list = list.filter((m) => m.is_spam);

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.message.toLowerCase().includes(q)
      );
    }

    list = [...list].sort((a, b) =>
      sort === 'newest' ? new Date(b.created_at) - new Date(a.created_at) : new Date(a.created_at) - new Date(b.created_at)
    );

    return list;
  }, [messages, filter, query, sort]);

  function toggleSelect(id) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function handleBulk(patch, mode) {
    if (mode === 'delete') {
      await actions.bulkRemove(selectedIds);
    } else {
      await actions.bulkUpdate(selectedIds, patch);
    }
    setSelectedIds([]);
  }

  function exportCsv() {
    const rows = [
      ['Date', 'Name', 'Email', 'Message', 'Status', 'Starred', 'Location'],
      ...filtered.map((m) => [
        new Date(m.created_at).toLocaleDateString('en-IN'),
        m.name,
        m.email,
        `"${(m.message || '').replace(/"/g, '""')}"`,
        m.status,
        m.is_starred ? 'yes' : 'no',
        m.location || '',
      ]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `messages-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      {/* Panel header */}
      <div className="pcms-panel-card" style={{ marginBottom: 0 }}>
        <div className="pcms-panel-header">
          <div className="pcms-panel-title-row">
            <div className="pcms-panel-icon"><i className="ti ti-message-circle" style={{ fontSize: 15 }} /></div>
            <div>
              <h3 className="pcms-panel-title">Messages</h3>
              <div className="pcms-panel-subtitle">{filtered.length} message{filtered.length !== 1 ? 's' : ''} in view</div>
            </div>
          </div>
        </div>

        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--pcms-line)' }}>
          <Toolbar
            query={query} setQuery={setQuery}
            filter={filter} setFilter={setFilter}
            sort={sort} setSort={setSort}
            selectedIds={selectedIds} onBulk={handleBulk} onExport={exportCsv}
          />
        </div>

        <div className="pcms-msg-table" style={{ border: 'none', borderRadius: 0 }}>
          {loading && <div style={{ padding: 40, textAlign: 'center', color: 'var(--pcms-muted)', fontSize: 13 }}>Loading messages...</div>}
          {!loading && filtered.length === 0 && (
            <div className="pcms-empty">
              <div className="pcms-empty-icon"><i className="ti ti-inbox" style={{ fontSize: 24 }} /></div>
              <h4 className="pcms-empty-title">No messages here</h4>
              <p className="pcms-empty-desc">When visitors send you messages, they'll appear here.</p>
            </div>
          )}
          {filtered.map((msg) => (
            <MessageRow key={msg.id} msg={msg} selected={selectedIds.includes(msg.id)} onToggleSelect={toggleSelect} actions={actions} />
          ))}
        </div>
      </div>
    </div>
  );
}
