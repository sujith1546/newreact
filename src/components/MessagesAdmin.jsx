import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient'; 

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

    channel = supabase
      .channel('messages_admin')
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

    channel = supabase
      .channel('messages_unread_badge')
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
  badge: { background: '#E85D4E', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 100, marginLeft: 8 },
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

  return (
    <div style={{ ...rowStyles.wrap, background: msg.is_read ? '#fff' : '#F5F8FC' }}>
      <div style={rowStyles.main}>
        <input 
          type="checkbox" 
          checked={selected} 
          onChange={() => onToggleSelect(msg.id)} 
          style={{ width: 'auto', margin: 0, cursor: 'pointer', flexShrink: 0 }}
        />

        <button
          onClick={() => actions.update(msg.id, { is_starred: !msg.is_starred })}
          style={rowStyles.starBtn}
          title={msg.is_starred ? 'Unstar' : 'Star'}
        >
          {msg.is_starred ? '★' : '☆'}
        </button>

        <div style={rowStyles.clickArea} onClick={openAndMarkRead}>
          <div style={rowStyles.topLine}>
            <span style={{ fontWeight: msg.is_read ? 500 : 700 }}>{msg.name}</span>
            <span style={rowStyles.email}>{msg.email}</span>
            {msg.is_spam && <span style={rowStyles.spamTag}>possible spam</span>}
            <StatusPill status={msg.status} />
          </div>
          <div style={rowStyles.preview}>{msg.message}</div>
        </div>

        <div style={rowStyles.meta}>
          <div>{new Date(msg.created_at).toLocaleDateString('en-IN')}</div>
          {msg.location && <div style={rowStyles.locationText}>{msg.location}</div>}
        </div>

        <button onClick={() => actions.update(msg.id, { is_archived: !msg.is_archived })} style={rowStyles.iconBtn}>
          {msg.is_archived ? '↩︎' : '🗄'}
        </button>
        <button onClick={() => actions.remove(msg.id)} style={rowStyles.iconBtnDanger}>
          🗑
        </button>
      </div>

      {expanded && (
        <div style={rowStyles.expanded}>
          <p style={rowStyles.fullMessage}>{msg.message}</p>

          <div style={rowStyles.expandedMeta}>
            {msg.ip_address && <span>IP: {msg.ip_address}</span>}
            {msg.referrer_path && <span>From page: {msg.referrer_path}</span>}
            <span>Spam score: {msg.spam_score}/100</span>
          </div>

          <div style={rowStyles.actionRow}>
            <a
              href={`mailto:${msg.email}?subject=Re: your message&body=Hi ${msg.name},%0D%0A%0D%0A`}
              onClick={markReplied}
              style={rowStyles.replyBtn}
            >
              Reply by email
            </a>
            <select
              value={msg.status}
              onChange={(e) => actions.update(msg.id, { status: e.target.value })}
              style={rowStyles.statusSelect}
            >
              <option value="new">New</option>
              <option value="replied">Replied</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <textarea
            placeholder="Private notes (only you see this)…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => actions.update(msg.id, { notes })}
            style={rowStyles.notesArea}
          />
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }) {
  const colors = {
    new: { bg: '#EAF0F7', text: '#1F3A5F' },
    replied: { bg: '#E8F5EC', text: '#1E7A3D' },
    closed: { bg: '#F0F0EE', text: '#6B6F76' },
  };
  const c = colors[status] || colors.new;
  return <span style={{ ...rowStyles.statusPill, background: c.bg, color: c.text }}>{status}</span>;
}

const rowStyles = {
  wrap: { borderBottom: '1px solid #E4E4E0', color: '#1C1E22' },
  main: { display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px' },
  starBtn: { border: 'none', background: 'none', fontSize: 18, color: '#E8A33D', cursor: 'pointer' },
  clickArea: { flex: 1, cursor: 'pointer', minWidth: 0 },
  topLine: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3 },
  email: { fontSize: 12.5, color: '#5B6069' },
  spamTag: { fontSize: 11, fontWeight: 600, color: '#B23B2E', background: '#FBEAE7', padding: '2px 8px', borderRadius: 100 },
  statusPill: { fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 100, textTransform: 'capitalize' },
  preview: { fontSize: 13.5, color: '#5B6069', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 480 },
  meta: { fontSize: 12, color: '#5B6069', textAlign: 'right', width: 110, flexShrink: 0 },
  locationText: { marginTop: 2 },
  iconBtn: { border: 'none', background: 'none', fontSize: 15, cursor: 'pointer', opacity: 0.7 },
  iconBtnDanger: { border: 'none', background: 'none', fontSize: 15, cursor: 'pointer', color: '#B23B2E' },
  expanded: { padding: '0 16px 18px 46px', background: '#FAFAF9' },
  fullMessage: { fontSize: 14, lineHeight: 1.6, color: '#1C1E22', margin: '0 0 12px' },
  expandedMeta: { display: 'flex', gap: 16, fontSize: 12, color: '#5B6069', marginBottom: 12 },
  actionRow: { display: 'flex', gap: 10, marginBottom: 12 },
  replyBtn: { background: '#1F3A5F', color: '#fff', fontSize: 13, fontWeight: 600, padding: '8px 14px', borderRadius: 7, textDecoration: 'none' },
  statusSelect: { fontSize: 13, padding: '8px 10px', borderRadius: 7, border: '1px solid #E4E4E0', color: '#1C1E22' },
  notesArea: { width: '100%', minHeight: 60, fontSize: 13, padding: 10, borderRadius: 7, border: '1px solid #E4E4E0', fontFamily: 'inherit', resize: 'vertical', color: '#1C1E22' },
};

// ---- 3e. Toolbar: search, filter, sort, bulk actions ----
function Toolbar({ query, setQuery, filter, setFilter, sort, setSort, selectedIds, onBulk, onExport }) {
  return (
    <div style={toolbarStyles.wrap}>
      <input
        placeholder="Search name, email, or message…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={toolbarStyles.search}
      />

      <select value={filter} onChange={(e) => setFilter(e.target.value)} style={toolbarStyles.select}>
        <option value="inbox">Inbox</option>
        <option value="unread">Unread</option>
        <option value="starred">Starred</option>
        <option value="archived">Archived</option>
        <option value="spam">Spam</option>
      </select>

      <select value={sort} onChange={(e) => setSort(e.target.value)} style={toolbarStyles.select}>
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
      </select>

      <button onClick={onExport} style={toolbarStyles.exportBtn}>Export CSV</button>

      {selectedIds.length > 0 && (
        <div style={toolbarStyles.bulkBar}>
          <span>{selectedIds.length} selected</span>
          <button onClick={() => onBulk({ is_read: true })} style={toolbarStyles.bulkBtn}>Mark read</button>
          <button onClick={() => onBulk({ is_archived: true })} style={toolbarStyles.bulkBtn}>Archive</button>
          <button onClick={() => onBulk(null, 'delete')} style={{ ...toolbarStyles.bulkBtn, color: '#B23B2E' }}>Delete</button>
        </div>
      )}
    </div>
  );
}

const toolbarStyles = {
  wrap: { display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', flexWrap: 'wrap' },
  search: { flex: 1, minWidth: 220, fontSize: 13.5, padding: '9px 12px', borderRadius: 7, border: '1px solid #E4E4E0', color: '#1C1E22' },
  select: { fontSize: 13.5, padding: '9px 12px', borderRadius: 7, border: '1px solid #E4E4E0', color: '#1C1E22' },
  exportBtn: { fontSize: 13, fontWeight: 600, padding: '9px 14px', borderRadius: 7, border: '1px solid #E4E4E0', background: '#fff', cursor: 'pointer', color: '#1C1E22' },
  bulkBar: { display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, marginLeft: 'auto', color: '#1C1E22' },
  bulkBtn: { fontSize: 13, fontWeight: 600, padding: '9px 14px', borderRadius: 7, border: '1px solid #E4E4E0', background: '#fff', cursor: 'pointer', color: '#1C1E22' },
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
    <div style={pageStyles.wrap}>
      <Toolbar
        query={query} setQuery={setQuery}
        filter={filter} setFilter={setFilter}
        sort={sort} setSort={setSort}
        selectedIds={selectedIds} onBulk={handleBulk} onExport={exportCsv}
      />

      <div style={pageStyles.list}>
        {loading && <div style={pageStyles.empty}>Loading…</div>}
        {!loading && filtered.length === 0 && <div style={pageStyles.empty}>No messages here.</div>}
        {filtered.map((msg) => (
          <MessageRow key={msg.id} msg={msg} selected={selectedIds.includes(msg.id)} onToggleSelect={toggleSelect} actions={actions} />
        ))}
      </div>
    </div>
  );
}

const pageStyles = {
  wrap: { background: '#fff', border: '1px solid #E4E4E0', borderRadius: 12, overflow: 'hidden' },
  list: { maxHeight: '70vh', overflowY: 'auto' },
  empty: { padding: 40, textAlign: 'center', color: '#5B6069', fontSize: 14 },
};
