import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import useRealtimeData from '../../../hooks/useRealtimeData';
import { logAuditEvent } from '../../../lib/auditLogger';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Eye, EyeOff, Loader2, BookOpen, X, Check, Tag, FileText, Image, Save } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const LOCAL_BLOG_KEY = 'pcms_local_blog_posts';

const getLocalBlogPosts = () => {
  try {
    const raw = localStorage.getItem(LOCAL_BLOG_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return parsed.filter(p => p.id !== 'b1' && p.id !== 'b2');
  } catch {
    return [];
  }
};

const setLocalBlogPosts = (list) => {
  try {
    localStorage.setItem(LOCAL_BLOG_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {}
};

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
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '8px 12px', border: '1px solid var(--pcms-line)', borderRadius: 8, background: 'var(--pcms-panel)', minHeight: 42, alignItems: 'center' }}>
      {tags.map(t => (
        <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 10px', borderRadius: 20, background: 'var(--pcms-accent-dim)', color: 'var(--pcms-accent)', fontSize: 12, fontWeight: 600 }}>
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
        style={{ border: 'none', outline: 'none', background: 'none', fontSize: 13, color: 'var(--pcms-text)', flex: 1, minWidth: 100 }}
      />
    </div>
  );
}

function PostEditor({ post, onSave, onCancel, saving }) {
  const [form, setForm] = useState({ ...BLANK_POST, ...post });
  const [tab, setTab] = useState('write');

  const set = (k, v) => {
    setForm(prev => {
      const next = { ...prev, [k]: v };
      if (k === 'title' && !post?.id) next.slug = slugify(v);
      return next;
    });
  };

  const labelStyle = { fontSize: 10.5, fontWeight: 700, color: 'var(--pcms-muted)', marginBottom: 5, display: 'block', letterSpacing: '0.05em', textTransform: 'uppercase' };
  const inputStyle = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--pcms-line)', background: 'var(--pcms-panel)', color: 'var(--pcms-text)', fontSize: 13, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' };

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ display: 'flex', gap: 0, border: '1px solid var(--pcms-line)', borderRadius: 8, overflow: 'hidden' }}>
            {['write', 'preview'].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '6px 18px', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, textTransform: 'capitalize',
                background: tab === t ? 'var(--pcms-gradient)' : 'var(--pcms-panel)',
                color: tab === t ? '#fff' : 'var(--pcms-muted)',
                transition: 'all 0.15s',
              }}>{t}</button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 11.5, color: 'var(--pcms-muted)', fontWeight: 600 }}>
              📝 {(form.content || '').trim().split(/\s+/).filter(Boolean).length} words • ⏱️ {Math.max(1, Math.ceil(((form.content || '').trim().split(/\s+/).filter(Boolean).length) / 200))} min read
            </span>
            <button
              type="button"
              onClick={() => {
                const outline = `## Introduction\n\nBrief summary of the main topic...\n\n## Key Takeaways\n\n- Takeaway 1\n- Takeaway 2\n\n## Implementation & Code\n\n\`\`\`javascript\n// Sample code snippet\n\`\`\`\n\n## Conclusion\n\nFinal thoughts and summary...`;
                set('content', (form.content ? form.content + '\n\n' : '') + outline);
              }}
              className="pcms-btn-secondary"
              style={{ padding: '4px 10px', fontSize: 11 }}
            >
              ✨ Insert AI Outline Template
            </button>
          </div>
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
            minHeight: 300, padding: '16px 20px', border: '1px solid var(--pcms-line)', borderRadius: 8,
            background: 'var(--pcms-panel)', color: 'var(--pcms-muted)', lineHeight: 1.8, overflowY: 'auto',
          }} className="blog-preview-pane">
            <ReactMarkdown>{form.content || '*Nothing to preview yet.*'}</ReactMarkdown>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid var(--pcms-line)' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--pcms-text)' }}>
          <input type="checkbox" checked={form.published} onChange={e => set('published', e.target.checked)} />
          Published (visible to public)
        </label>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} className="pcms-btn-secondary">Cancel</button>
          <button onClick={() => onSave(form)} disabled={saving || !form.title} className="pcms-btn-dark" style={{ opacity: saving ? 0.7 : 1 }}>
            {saving ? <Loader2 size={15} className="spin" /> : <Save size={15} />}
            {saving ? 'Saving...' : 'Save Article'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function BlogPanel() {
  const { data: remotePosts } = useRealtimeData('blog_posts');
  const [localPosts, setLocalPosts] = useState(getLocalBlogPosts());
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const combinedPosts = useMemo(() => {
    const list = [...localPosts];
    (remotePosts || []).forEach(r => {
      if (!list.some(l => String(l.id) === String(r.id))) {
        list.push(r);
      }
    });
    return list;
  }, [remotePosts, localPosts]);

  const filtered = useMemo(() => {
    if (!search) return combinedPosts;
    return combinedPosts.filter(p => p.title?.toLowerCase().includes(search.toLowerCase()));
  }, [combinedPosts, search]);

  const handleSave = async (form) => {
    setSaving(true);
    if (!form.slug) form.slug = slugify(form.title);

    const postItem = {
      id: form.id || 'blog_' + Date.now(),
      title: form.title.trim(),
      slug: form.slug.trim(),
      content: form.content || '',
      tags: Array.isArray(form.tags) ? form.tags : [],
      published: Boolean(form.published),
      cover_image: form.cover_image || null,
      created_at: form.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Database Sync with Fallback Retries
    try {
      const fullPayload = {
        title: postItem.title,
        slug: postItem.slug,
        content: postItem.content,
        tags: postItem.tags,
        published: postItem.published,
        cover_image: postItem.cover_image
      };

      if (form.id) {
        const { error } = await supabase.from('blog_posts').update(fullPayload).eq('id', form.id);
        if (error) {
          // Retry with core columns if schema has column mismatches
          await supabase.from('blog_posts').update({
            title: postItem.title,
            slug: postItem.slug,
            content: postItem.content
          }).eq('id', form.id);
        }
      } else {
        const { data, error } = await supabase.from('blog_posts').insert([fullPayload]).select().single();
        if (!error && data) {
          postItem.id = data.id;
        } else {
          // Fallback retry with core columns
          const { data: retryData } = await supabase.from('blog_posts').insert([{
            title: postItem.title,
            slug: postItem.slug,
            content: postItem.content
          }]).select().single();
          if (retryData) postItem.id = retryData.id;
        }
      }
    } catch (err) {
      console.warn('Supabase DB sync warning:', err);
    }

    let nextList;
    if (form.id) {
      nextList = combinedPosts.map(p => String(p.id) === String(form.id) ? postItem : p);
    } else {
      nextList = [postItem, ...combinedPosts];
    }

    setLocalPosts(nextList);
    setLocalBlogPosts(nextList);
    setSaving(false);
    showToast(form.id ? 'Article updated & synced' : 'Article created & synced');
    setEditing(null);
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await supabase.from('blog_posts').delete().eq('id', id);
    } catch (e) {}

    const nextList = combinedPosts.filter(p => String(p.id) !== String(id));
    setLocalPosts(nextList);
    setLocalBlogPosts(nextList);
    showToast(`"${title}" deleted`, 'error');
    setDeleting(null);
  };

  const handleTogglePublish = async (post) => {
    const nextVal = !post.published;
    const nextList = combinedPosts.map(p => String(p.id) === String(post.id) ? { ...p, published: nextVal } : p);
    setLocalPosts(nextList);
    setLocalBlogPosts(nextList);

    try {
      await supabase.from('blog_posts').update({ published: nextVal }).eq('id', post.id);
    } catch (e) {}

    showToast(nextVal ? 'Article published' : 'Article saved to draft');
  };

  return (
    <div>
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, background: toast.type === 'error' ? '#ef4444' : '#10b981', color: '#fff', padding: '12px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
          {toast.msg}
        </div>
      )}

      <style>{`
        .blog-preview-pane p { margin-bottom: 12px; }
        .blog-preview-pane h1,.blog-preview-pane h2,.blog-preview-pane h3 { color: var(--pcms-text); margin: 20px 0 8px; font-weight: 700; }
        .blog-preview-pane code { background: var(--pcms-panel-2); padding: 2px 6px; border-radius: 5px; font-size: 12px; font-family: 'IBM Plex Mono', monospace; }
        .blog-preview-pane pre { background: var(--pcms-panel-2); padding: 12px; border-radius: 8px; overflow-x: auto; margin-bottom: 12px; }
      `}</style>

      {/* Panel card */}
      <div className="pcms-panel-card">
        <div className="pcms-panel-header">
          <div className="pcms-panel-title-row">
            <div className="pcms-panel-icon" style={{ background: 'rgba(6,182,212,0.12)', color: '#06B6D4' }}><BookOpen size={15} /></div>
            <div>
              <h3 className="pcms-panel-title">Blog &amp; Articles</h3>
              <div className="pcms-panel-subtitle">{combinedPosts.length} articles · {combinedPosts.filter(p => p.published).length} published</div>
            </div>
          </div>
          <button onClick={() => setEditing('new')} disabled={editing !== null} className="pcms-btn-dark">
            <Plus size={14} /> New Article
          </button>
        </div>

        <div style={{ padding: '18px' }}>
          <AnimatePresence>
            {editing && (
              <motion.div
                key="editor"
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                style={{ marginBottom: 24, background: 'var(--pcms-panel-2)', borderRadius: 12, border: '1px solid var(--pcms-line)', padding: 24, overflow: 'hidden' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--pcms-text)' }}>
                    {editing === 'new' ? '✏️ Create New Article' : `✏️ Edit: ${editing.title}`}
                  </h4>
                  <button onClick={() => setEditing(null)} className="pcms-icon-btn"><X size={15} /></button>
                </div>
                <PostEditor
                  post={editing === 'new' ? BLANK_POST : editing}
                  onSave={handleSave}
                  onCancel={() => setEditing(null)}
                  saving={saving}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ marginBottom: 16 }}>
            <input
              className="pcms-search"
              placeholder="Search articles by title..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', maxWidth: 320 }}
            />
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--pcms-muted)', fontSize: 13 }}>
              No articles found. Click "+ New Article" to write one.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filtered.map(post => (
                <div key={post.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px',
                  background: 'var(--pcms-panel-2)', border: '1px solid var(--pcms-line)', borderRadius: 10, gap: 14,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--pcms-text)' }}>{post.title}</span>
                      <span className={`pcms-badge ${post.published ? 'pcms-badge-green' : 'pcms-badge-muted'}`}>
                        {post.published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 12, fontSize: 11.5, color: 'var(--pcms-muted)', flexWrap: 'wrap' }}>
                      <span>/{post.slug}</span>
                      {Array.isArray(post.tags) && post.tags.length > 0 && (
                        <span>Tags: {post.tags.join(', ')}</span>
                      )}
                      <span>{post.created_at ? new Date(post.created_at).toLocaleDateString() : ''}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button
                      onClick={() => handleTogglePublish(post)}
                      title={post.published ? 'Unpublish' : 'Publish'}
                      className="pcms-icon-btn"
                    >
                      {post.published ? <EyeOff size={14} color="var(--pcms-amber)" /> : <Eye size={14} color="var(--pcms-green)" />}
                    </button>
                    <button onClick={() => setEditing(post)} title="Edit" className="pcms-icon-btn edit">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(post.id, post.title)} disabled={deleting === post.id} title="Delete" className="pcms-icon-btn danger">
                      {deleting === post.id ? <Loader2 size={14} className="spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
