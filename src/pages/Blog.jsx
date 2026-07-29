import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Tag, BookOpen, Search, X, Calendar, Eye } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import useRealtimeData from '../hooks/useRealtimeData';
import { supabase } from '../lib/supabaseClient';

function readingTime(content = '') {
  return Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 200));
}
function formatDate(str) {
  if (!str) return '';
  return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

async function incrementViewCount(postId) {
  try {
    await supabase.rpc('increment_blog_views', { post_id: postId });
  } catch (e) {}
}

export default function Blog() {
  const { data: posts, loading } = useRealtimeData('blog_posts', { orderColumn: 'published_at', ascending: false });
  const [selectedPost, setSelectedPost] = useState(null);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState(null);

  const allTags = useMemo(() => {
    if (!posts) return [];
    const tagSet = new Set();
    posts.forEach(p => (p.tags || []).forEach(t => tagSet.add(t)));
    return [...tagSet].slice(0, 6);
  }, [posts]);

  const filtered = useMemo(() => {
    if (!posts) return [];
    let list = posts;
    if (activeTag) list = list.filter(p => (p.tags || []).includes(activeTag));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.title?.toLowerCase().includes(q) || (p.tags || []).some(t => t.toLowerCase().includes(q)));
    }
    return list;
  }, [posts, activeTag, search]);

  const openPost = (post) => {
    setSelectedPost(post);
    incrementViewCount(post.id);
  };

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div style={{ width: '100%', height: 'calc(100vh - 138px)', display: 'flex', flexDirection: 'column', gap: 14, overflow: 'hidden' }}>
      <style>{`
        .blog-root {
          width: 100%;
          height: calc(100vh - 138px);
          display: flex;
          flex-direction: column;
          gap: 12px;
          overflow: hidden;
        }
        .blog-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-shrink: 0;
        }
        .blog-header-row h1 { font-size: 24px; font-weight: 700; color: var(--text-primary); margin: 0; }
        .blog-header-row p { font-size: 13px; color: var(--text-secondary); margin: 4px 0 0; }
        .blog-search-box {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          border: 1px solid var(--border-color);
          border-radius: 12px;
          background: var(--bg-secondary);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          width: 240px;
        }
        .blog-search-box:focus-within {
          border-color: var(--primary-blue);
          box-shadow: 0 4px 16px color-mix(in srgb, var(--primary-blue) 16%, transparent);
        }
        .blog-search-box input {
          border: none;
          background: transparent;
          outline: none;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary);
          width: 100%;
        }
        .blog-search-box input::placeholder {
          color: var(--text-muted);
          font-weight: 400;
        }
        .blog-search-icon {
          color: var(--text-muted);
          transition: color 0.2s;
          flex-shrink: 0;
        }
        .blog-search-box:focus-within .blog-search-icon {
          color: var(--primary-blue);
        }
        .blog-search-clear {
          cursor: pointer;
          color: var(--text-muted);
          transition: color 0.15s, transform 0.15s;
          flex-shrink: 0;
          border: none;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2px;
          border-radius: 50%;
        }
        .blog-search-clear:hover {
          color: var(--text-primary);
          background: color-mix(in srgb, var(--text-primary) 10%, transparent);
        }
        .blog-filter-row {
          display: flex; gap: 6px; flex-wrap: wrap; flex-shrink: 0; align-items: center;
        }
        .blog-tag-pill {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 4px 10px; border-radius: 999px; font-size: 11.5px; font-weight: 600;
          border: 1px solid var(--border-color); background: var(--bg-secondary);
          color: var(--text-secondary); cursor: pointer; transition: all 0.18s;
        }
        .blog-tag-pill.active {
          background: color-mix(in srgb, var(--primary-blue) 12%, transparent);
          border-color: color-mix(in srgb, var(--primary-blue) 30%, transparent);
          color: var(--primary-blue);
        }
        .blog-two-col {
          flex: 1;
          min-height: 0;
          display: grid;
          grid-template-columns: 1fr 1.7fr;
          gap: 12px;
          overflow: hidden;
        }
        .blog-list-panel {
          display: flex;
          flex-direction: column;
          gap: 0;
          overflow-y: auto;
          border: 1px solid var(--border-color);
          border-radius: 16px;
          background: var(--bg-secondary);
        }
        .blog-list-panel::-webkit-scrollbar { width: 4px; }
        .blog-list-panel::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 4px; }
        .blog-post-row {
          padding: 14px 16px;
          border-bottom: 1px solid var(--border-color);
          cursor: pointer;
          transition: background 0.15s;
          position: relative;
        }
        .blog-post-row:last-child { border-bottom: none; }
        .blog-post-row:hover { background: var(--bg-primary); }
        .blog-post-row.active { background: color-mix(in srgb, var(--primary-blue) 6%, transparent); }
        .blog-post-row.active::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
          border-radius: 0 3px 3px 0;
          background: var(--primary-blue);
        }
        .blog-featured-badge {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 2px 7px; border-radius: 5px; font-size: 10px; font-weight: 700;
          background: color-mix(in srgb, var(--primary-blue) 12%, transparent);
          color: var(--primary-blue); margin-bottom: 5px;
          text-transform: uppercase; letter-spacing: 0.05em;
        }
        .blog-post-title { font-size: 13px; font-weight: 600; color: var(--text-primary); margin: 0 0 5px; line-height: 1.35; }
        .blog-post-meta {
          display: flex; gap: 8px; align-items: center; font-size: 11px; color: var(--text-muted); flex-wrap: wrap;
        }
        .blog-post-tags { display: flex; gap: 4px; flex-wrap: wrap; margin-top: 6px; }
        .blog-post-tag {
          padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 500;
          background: var(--bg-primary); border: 1px solid var(--border-color); color: var(--text-muted);
        }
        .blog-preview-panel {
          border: 1px solid var(--border-color);
          border-radius: 16px;
          background: var(--bg-secondary);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .blog-preview-header {
          padding: 20px 24px 16px;
          border-bottom: 1px solid var(--border-color);
          flex-shrink: 0;
          background: linear-gradient(135deg, color-mix(in srgb, var(--primary-blue) 5%, transparent), transparent);
        }
        .blog-preview-title { font-size: 18px; font-weight: 700; color: var(--text-primary); margin: 0 0 8px; line-height: 1.3; }
        .blog-preview-body {
          flex: 1; min-height: 0; overflow-y: auto;
          padding: 20px 24px;
          font-size: 13.5px; color: var(--text-secondary);
          line-height: 1.7;
        }
        .blog-preview-body::-webkit-scrollbar { width: 4px; }
        .blog-preview-body::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 4px; }
        .blog-preview-body h1,.blog-preview-body h2,.blog-preview-body h3 {
          color: var(--text-primary); margin-top: 16px; margin-bottom: 8px;
        }
        .blog-preview-body code {
          background: var(--bg-primary); border: 1px solid var(--border-color);
          border-radius: 4px; padding: 1px 5px; font-size: 12.5px;
        }
        .blog-preview-body pre {
          background: var(--bg-primary); border: 1px solid var(--border-color);
          border-radius: 8px; padding: 14px; overflow-x: auto; font-size: 12px;
        }
        .blog-empty-state {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 12px;
          color: var(--text-muted);
        }
        @media (max-width: 900px) {
          .blog-two-col { grid-template-columns: 1fr; }
          .blog-preview-panel { display: none; }
        }
      `}</style>

      <div className="blog-root">
        {/* Header Controls */}
        <div className="blog-header-row" style={{ justifyContent: 'flex-end' }}>
          <div className="blog-search-box">
            <Search size={14} className="blog-search-icon" />
            <input placeholder="Search articles..." value={search} onChange={e => setSearch(e.target.value)} />
            {search && (
              <button className="blog-search-clear" onClick={() => setSearch('')} title="Clear search" aria-label="Clear search">
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Tag Filters */}
        {allTags.length > 0 && (
          <div className="blog-filter-row">
            <button className={`blog-tag-pill${!activeTag ? ' active' : ''}`} onClick={() => setActiveTag(null)}>All</button>
            {allTags.map(tag => (
              <button key={tag} className={`blog-tag-pill${activeTag === tag ? ' active' : ''}`} onClick={() => setActiveTag(prev => prev === tag ? null : tag)}>
                <Tag size={10} /> {tag}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="spinner" />
          </div>
        ) : (
          <div className="blog-two-col">
            {/* Post List Panel */}
            <div className="blog-list-panel">
              {filtered.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  No posts found
                </div>
              ) : (
                filtered.map((post, i) => {
                  const isFirst = i === 0;
                  return (
                    <motion.div
                      key={post.id}
                      className={`blog-post-row${selectedPost?.id === post.id ? ' active' : ''}`}
                      onClick={() => openPost(post)}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      {isFirst && !activeTag && !search && (
                        <div className="blog-featured-badge"><BookOpen size={9} /> Featured</div>
                      )}
                      <p className="blog-post-title">{post.title}</p>
                      <div className="blog-post-meta">
                        <span><Calendar size={10} /> {formatDate(post.published_at)}</span>
                        <span><Clock size={10} /> {readingTime(post.content)} min read</span>
                        {post.view_count > 0 && <span><Eye size={10} /> {post.view_count} views</span>}
                      </div>
                      {post.tags?.length > 0 && (
                        <div className="blog-post-tags">
                          {post.tags.slice(0, 3).map(t => <span key={t} className="blog-post-tag">{t}</span>)}
                        </div>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Preview Panel */}
            <div className="blog-preview-panel">
              {selectedPost ? (
                <>
                  <div className="blog-preview-header">
                    <p className="blog-post-meta" style={{ marginBottom: 8 }}>
                      <span><Calendar size={11} /> {formatDate(selectedPost.published_at)}</span>
                      <span><Clock size={11} /> {readingTime(selectedPost.content)} min read</span>
                      {selectedPost.view_count > 0 && <span><Eye size={11} /> {selectedPost.view_count} views</span>}
                    </p>
                    <h2 className="blog-preview-title">{selectedPost.title}</h2>
                    {selectedPost.tags?.length > 0 && (
                      <div className="blog-post-tags">
                        {selectedPost.tags.map(t => <span key={t} className="blog-post-tag">{t}</span>)}
                      </div>
                    )}
                  </div>
                  <div className="blog-preview-body">
                    <ReactMarkdown>{selectedPost.content || selectedPost.excerpt || '*No content available.*'}</ReactMarkdown>
                  </div>
                </>
              ) : (
                <div className="blog-empty-state">
                  <BookOpen size={36} style={{ opacity: 0.3 }} />
                  <p style={{ fontSize: 13, margin: 0 }}>Select an article to preview</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
