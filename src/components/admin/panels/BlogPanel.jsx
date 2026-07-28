import React, { useState, useMemo } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import useRealtimeData from '../../../hooks/useRealtimeData';
import { logAuditEvent } from '../../../lib/auditLogger';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Eye, EyeOff, Loader2, BookOpen, X, Check, Tag, FileText, Image, Save } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const BLANK_POST = { title: '', slug: '', content: '', tags: [], published: false, cover_image: '' };

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function TagInput({ tags, onChange }) {
  const [input, setInput] = useState('');
  const add = () => {
    const t = input.trim();
    if (t && !tags.includes(t)) { onChange([...tags, t]); }
    setInput('');
  };
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 10, background: 'var(--bg-primary)', minHeight: 42, alignItems: 'center' }}>
      {tags.map(t => (
        <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 10px', borderRadius: 20, background: 'color-mix(in srgb, var(--primary-blue) 14%, transparent)', color: 'var(--primary-blue)', fontSize: 12, fontWeight: 600 }}>
          {t}
          <button onClick={() => onChange(tags.filter(x => x !== t))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, lineHeight: 1, display: 'flex' }}>
            <X size={11} />
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } }}
        onBlur={add}
        placeholder="Add tag, press Enter"
        style={{ border: 'none', outline: 'none', background: 'none', fontSize: 13, color: 'var(--text-primary)', flex: 1, minWidth: 100 }}
      />
    </div>
  );
}

function PostEditor({ post, onSave, onCancel, saving }) {
  const [form, setForm] = useState({ ...BLANK_POST, ...post });
  const [tab, setTab] = useState('write'); // 'write' | 'preview'

  const set = (k, v) => {
    setForm(prev => {
      const next = { ...prev, [k]: v };
      if (k === 'title' && !post?.id) next.slug = slugify(v);
      return next;
    });
  };

  const labelStyle = { fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, display: 'block', letterSpacing: 0.3, textTransform: 'uppercase' };
  const inputStyle = { width: '100%', padding: '9px 14px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
      style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label style={labelStyle}>Title *</label>
          <input style={inputStyle} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Article title..." />
        </div>
        <div>
          <label style={labelStyle}>Slug</label>
          <input style={inputStyle} value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="my-article-slug" />
        </div>
      </div>

      <div>
        <label style={labelStyle}><Image size={12} style={{ display: 'inline', marginRight: 4 }} />Cover Image URL (optional)</label>
        <input style={inputStyle} value={form.cover_image || ''} onChange={e => set('cover_image', e.target.value)} placeholder="https://..." />
      </div>

      <div>
        <label style={labelStyle}><Tag size={12} style={{ display: 'inline', marginRight: 4 }} />Tags</label>
        <TagInput tags={form.tags || []} onChange={v => set('tags', v)} />
      </div>

      <div>
        <div style={{ display: 'flex', gap: 0, marginBottom: 8, border: '1px solid var(--border-color)', borderRadius: 10, overflow: 'hidden', width: 'fit-content' }}>
          {['write', 'preview'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '6px 18px', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, textTransform: 'capitalize',
              background: tab === t ? 'var(--primary-blue)' : 'var(--bg-primary)',
              color: tab === t ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.15s',
            }}>{t}</button>
          ))}
        </div>
        {tab === 'write' ? (
          <textarea
            style={{ ...inputStyle, minHeight: 300, resize: 'vertical', fontFamily: "'Fira Code', monospace", fontSize: 13, lineHeight: 1.6 }}
            value={form.content || ''}
            onChange={e => set('content', e.target.value)}
            placeholder="Write your article in **Markdown**..."
          />
        ) : (
          <div style={{
            minHeight: 300, padding: '16px 20px', border: '1px solid var(--border-color)', borderRadius: 10,
            background: 'var(--bg-primary)', color: 'var(--text-secondary)', lineHeight: 1.8, overflowY: 'auto',
          }} className="blog-preview-pane">
            <ReactMarkdown>{form.content || '*Nothing to preview yet.*'}</ReactMarkdown>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid var(--border-color)' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: 'var(--text-primary)' }}>
          <input type="checkbox" checked={form.published} onChange={e => set('published', e.target.checked)} />
          Published (visible to public)
        </label>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{ padding: '9px 20px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
            Cancel
          </button>
          <button onClick={() => onSave(form)} disabled={saving || !form.title} style={{
            padding: '9px 24px', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg, var(--primary-blue), #6366f1)',
            color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 14,
            display: 'flex', alignItems: 'center', gap: 8, opacity: saving ? 0.7 : 1,
          }}>
            {saving ? <Loader2 size={15} className="spin" /> : <Save size={15} />}
            {saving ? 'Saving...' : 'Save Article'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function BlogPanel() {
  const { data: posts, loading } = useRealtimeData('blog_posts');
  const [editing, setEditing] = useState(null); // null | 'new' | {post}
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const all = posts || [];
    if (!search) return all;
    return all.filter(p => p.title?.toLowerCase().includes(search.toLowerCase()));
  }, [posts, search]);

  const handleSave = async (form) => {
    setSaving(true);
    if (!form.slug) form.slug = slugify(form.title);
    const payload = { title: form.title, slug: form.slug, content: form.content, tags: form.tags, published: form.published, cover_image: form.cover_image || null };
    let error;
    if (form.id) {
      ({ error } = await supabase.from('blog_posts').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', form.id));
    } else {
      ({ error } = await supabase.from('blog_posts').insert(payload));
    }
    setSaving(false);
    if (error) { alert('Error: ' + error.message); return; }
    logAuditEvent(form.id ? 'UPDATE_BLOG_POST' : 'CREATE_BLOG_POST', 'blog_posts', form.title);
    setEditing(null);
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    await supabase.from('blog_posts').delete().eq('id', id);
    logAuditEvent('DELETE_BLOG_POST', 'blog_posts', title);
    setDeleting(null);
  };

  const handleTogglePublish = async (post) => {
    await supabase.from('blog_posts').update({ published: !post.published }).eq('id', post.id);
    logAuditEvent('TOGGLE_BLOG_PUBLISH', 'blog_posts', post.title);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '0 0 40px' }}>
      <style>{`
        .blog-preview-pane p { margin-bottom: 12px; }
        .blog-preview-pane h1,.blog-preview-pane h2,.blog-preview-pane h3 { color: var(--text-primary); margin: 20px 0 8px; font-weight: 700; }
        .blog-preview-pane code { background: var(--bg-secondary); padding: 2px 6px; border-radius: 5px; font-size: 12px; font-family: 'Fira Code', monospace; }
        .blog-preview-pane pre { background: var(--bg-secondary); padding: 12px; border-radius: 8px; overflow-x: auto; margin-bottom: 12px; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <BookOpen size={22} color="var(--primary-blue)" /> Blog &amp; Articles
          </h2>
          <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: 14 }}>{(posts || []).length} articles total · {(posts || []).filter(p => p.published).length} published</p>
        </div>
        <button onClick={() => setEditing('new')} disabled={editing !== null} style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, border: 'none',
          background: 'linear-gradient(135deg, var(--primary-blue), #6366f1)', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 14,
          boxShadow: '0 4px 16px rgba(59,130,246,0.3)',
        }}>
          <Plus size={16} /> New Article
        </button>
      </div>

      <AnimatePresence>
        {editing && (
          <motion.div
            key="editor"
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ marginBottom: 28, background: 'var(--bg-secondary)', borderRadius: 20, border: '1px solid var(--border-color)', padding: 28, overflow: 'hidden' }}
          >
            <h3 style={{ margin: '0 0 20px', fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>
              {editing === 'new' ? '✍️ New Article' : `✏️ Editing: ${editing.title}`}
            </h3>
            <PostEditor
              post={editing === 'new' ? BLANK_POST : editing}
              onSave={handleSave}
              onCancel={() => setEditing(null)}
              saving={saving}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <FileText size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search articles..."
          style={{ width: '100%', padding: '9px 12px 9px 36px', border: '1px solid var(--border-color)', borderRadius: 10, background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      {/* List */}
      {loading ? (
        <div style={{ padding: 60, display: 'flex', justifyContent: 'center' }}><Loader2 className="spin" size={28} color="var(--primary-blue)" /></div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
          <BookOpen size={40} style={{ opacity: 0.2, marginBottom: 12 }} />
          <p style={{ fontSize: 15, fontWeight: 600 }}>No articles yet</p>
          <p style={{ fontSize: 13 }}>Click "New Article" to write your first post.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(post => (
            <motion.div
              key={post.id}
              layout
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                borderRadius: 16, padding: '18px 20px',
                display: 'flex', alignItems: 'center', gap: 16,
                opacity: deleting === post.id ? 0.5 : 1, transition: 'opacity 0.2s',
              }}
            >
              {/* Status dot */}
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: post.published ? '#10b981' : '#f59e0b', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{post.title}</div>
                <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-muted)' }}>
                  <span>{post.published ? '🟢 Published' : '🟡 Draft'}</span>
                  <span>{(post.tags || []).join(', ') || 'No tags'}</span>
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => handleTogglePublish(post)} title={post.published ? 'Unpublish' : 'Publish'} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 9, padding: '7px 10px', cursor: 'pointer', color: post.published ? '#10b981' : 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                  {post.published ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
                <button onClick={() => setEditing(post)} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 9, padding: '7px 10px', cursor: 'pointer', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center' }}>
                  <Edit2 size={15} />
                </button>
                <button onClick={() => handleDelete(post.id, post.title)} disabled={deleting === post.id} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 9, padding: '7px 10px', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center' }}>
                  {deleting === post.id ? <Loader2 size={15} className="spin" /> : <Trash2 size={15} />}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
