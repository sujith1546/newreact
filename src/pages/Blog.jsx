import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Tag, ArrowRight, BookOpen, Search, ChevronLeft, X, Calendar } from 'lucide-react';
import { ScrollReveal } from '../components';
import useRealtimeData from '../hooks/useRealtimeData';
import ReactMarkdown from 'react-markdown';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

function readingTime(content = '') {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function formatDate(str) {
  if (!str) return '';
  return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function SkeletonCard() {
  return (
    <div style={{
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      borderRadius: 20,
      padding: '28px 28px 24px',
      display: 'flex', flexDirection: 'column', gap: 14,
    }}>
      {[90, 60, 100, 40].map((w, i) => (
        <div key={i} className="skeleton-line" style={{ width: `${w}%`, height: i === 0 ? 22 : 14, borderRadius: 8 }} />
      ))}
    </div>
  );
}

function ArticleModal({ post, onClose }) {
  return (
    <AnimatePresence>
      {post && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px',
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{
              background: 'var(--bg-secondary)',
              borderRadius: 24,
              width: '100%', maxWidth: 780,
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
              boxShadow: '0 40px 80px rgba(0,0,0,0.4)',
              border: '1px solid var(--border-color)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '28px 32px 24px',
              borderBottom: '1px solid var(--border-color)',
              background: 'linear-gradient(135deg, color-mix(in srgb, var(--primary-blue) 8%, transparent), transparent)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                    {(post.tags || []).map(tag => (
                      <span key={tag} style={{
                        padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                        background: 'color-mix(in srgb, var(--primary-blue) 12%, transparent)',
                        color: 'var(--primary-blue)', border: '1px solid color-mix(in srgb, var(--primary-blue) 25%, transparent)'
                      }}>{tag}</span>
                    ))}
                  </div>
                  <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.25 }}>{post.title}</h2>
                  <div style={{ display: 'flex', gap: 16, marginTop: 12, color: 'var(--text-muted)', fontSize: 13 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Calendar size={13} />{formatDate(post.created_at)}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Clock size={13} />{readingTime(post.content)} min read</span>
                  </div>
                </div>
                <button onClick={onClose} style={{
                  background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
                  borderRadius: 12, padding: 8, cursor: 'pointer', color: 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <X size={18} />
                </button>
              </div>
            </div>
            {/* Modal Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }} className="blog-modal-body">
              <ReactMarkdown>{post.content || '*No content yet.*'}</ReactMarkdown>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Blog() {
  const { data: posts, loading } = useRealtimeData('blog_posts');
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  const published = useMemo(() => (posts || []).filter(p => p.published), [posts]);

  const allTags = useMemo(() => {
    const tagSet = new Set();
    published.forEach(p => (p.tags || []).forEach(t => tagSet.add(t)));
    return [...tagSet].sort();
  }, [published]);

  const filtered = useMemo(() => {
    return published.filter(p => {
      const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.content?.toLowerCase().includes(search.toLowerCase());
      const matchTag = !activeTag || (p.tags || []).includes(activeTag);
      return matchSearch && matchTag;
    });
  }, [published, search, activeTag]);

  return (
    <ScrollReveal>
      <style>{`
        .blog-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 24px; }
        .blog-card { cursor: pointer; border-radius: 20px; overflow: hidden; transition: all 0.25s ease; position: relative; }
        .blog-card:hover { transform: translateY(-4px); box-shadow: 0 20px 60px rgba(0,0,0,0.12) !important; }
        .blog-card:hover .blog-read-more { opacity: 1; transform: translateX(0); }
        .blog-read-more { opacity: 0; transform: translateX(-6px); transition: all 0.2s ease; }
        .blog-tag { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; cursor: pointer; transition: all 0.15s ease; }
        .blog-tag:hover { filter: brightness(1.15); }
        .blog-tag--active { background: var(--primary-blue) !important; color: #fff !important; border-color: var(--primary-blue) !important; }
        .skeleton-line { background: linear-gradient(90deg, var(--border-color) 25%, color-mix(in srgb, var(--border-color) 60%, transparent) 50%, var(--border-color) 75%); background-size: 400% 100%; animation: shimmer 1.6s ease infinite; }
        @keyframes shimmer { 0% { background-position: 100% 0 } 100% { background-position: -100% 0 } }
        .blog-search-input { width: 100%; padding: 10px 16px 10px 40px; border-radius: 14px; border: 1px solid var(--border-color); background: var(--bg-secondary); color: var(--text-primary); font-size: 14px; outline: none; transition: border-color 0.2s ease; }
        .blog-search-input:focus { border-color: var(--primary-blue); }
        .blog-modal-body p { color: var(--text-secondary); line-height: 1.8; margin-bottom: 16px; }
        .blog-modal-body h1,.blog-modal-body h2,.blog-modal-body h3 { color: var(--text-primary); margin: 24px 0 12px; font-weight: 700; }
        .blog-modal-body h2 { font-size: 20px; }
        .blog-modal-body h3 { font-size: 17px; }
        .blog-modal-body code { background: var(--bg-primary); padding: 2px 6px; border-radius: 5px; font-size: 13px; font-family: 'Fira Code', monospace; color: var(--primary-blue); }
        .blog-modal-body pre { background: var(--bg-primary); padding: 16px; border-radius: 12px; overflow-x: auto; margin-bottom: 16px; border: 1px solid var(--border-color); }
        .blog-modal-body pre code { background: none; padding: 0; color: var(--text-secondary); }
        .blog-modal-body ul, .blog-modal-body ol { padding-left: 20px; color: var(--text-secondary); line-height: 1.8; margin-bottom: 16px; }
        .blog-modal-body blockquote { border-left: 3px solid var(--primary-blue); padding-left: 16px; color: var(--text-muted); font-style: italic; margin: 16px 0; }
        @media (max-width: 900px) { .blog-grid { grid-template-columns: 1fr; } }
      `}</style>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ padding: '8px 0 40px' }}
      >
        {/* Header */}
        <motion.div variants={itemVariants} style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
            <div style={{
              padding: 10, background: 'color-mix(in srgb, var(--primary-blue) 12%, transparent)',
              borderRadius: 14, color: 'var(--primary-blue)',
            }}>
              <BookOpen size={22} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: -0.5 }}>Blog &amp; Articles</h1>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 14 }}>Thoughts on technology, learning, and building things.</p>
            </div>
          </div>
        </motion.div>

        {/* Search + Filter row */}
        <motion.div variants={itemVariants} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 200 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              className="blog-search-input"
              placeholder="Search articles..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`blog-tag ${activeTag === tag ? 'blog-tag--active' : ''}`}
                style={{
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                {tag}
              </button>
            ))}
            {activeTag && (
              <button onClick={() => setActiveTag(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                <X size={14} /> Clear
              </button>
            )}
          </div>
        </motion.div>

        {/* Grid */}
        {loading ? (
          <div className="blog-grid">
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div variants={itemVariants} style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
            <BookOpen size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
            <p style={{ fontSize: 16, fontWeight: 600 }}>No articles found</p>
            <p style={{ fontSize: 14, marginTop: 4 }}>
              {published.length === 0 ? 'Check back soon — articles are coming!' : 'Try a different search term or tag.'}
            </p>
          </motion.div>
        ) : (
          <motion.div className="blog-grid" variants={containerVariants} initial="hidden" animate="visible">
            {filtered.map(post => (
              <motion.div
                key={post.id}
                variants={itemVariants}
                className="blog-card"
                onClick={() => setSelectedPost(post)}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                }}
              >
                {post.cover_image && (
                  <img
                    src={post.cover_image}
                    alt={post.title}
                    style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }}
                    loading="lazy"
                  />
                )}
                <div style={{ padding: '24px 24px 20px' }}>
                  {/* Tags */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                    {(post.tags || []).slice(0, 3).map(tag => (
                      <span key={tag} className="blog-tag" style={{
                        border: '1px solid color-mix(in srgb, var(--primary-blue) 25%, transparent)',
                        background: 'color-mix(in srgb, var(--primary-blue) 10%, transparent)',
                        color: 'var(--primary-blue)',
                      }} onClick={e => { e.stopPropagation(); setActiveTag(tag); }}>
                        <Tag size={10} style={{ display: 'inline', marginRight: 3 }} />{tag}
                      </span>
                    ))}
                  </div>
                  <h2 style={{ margin: '0 0 10px', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                    {post.title}
                  </h2>
                  <p style={{ margin: '0 0 16px', fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {post.content?.replace(/[#*`>_]/g, '').slice(0, 200) || 'Click to read...'}
                  </p>
                  {/* Footer */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', gap: 12, color: 'var(--text-muted)', fontSize: 12 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={12} />{formatDate(post.created_at)}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} />{readingTime(post.content)} min</span>
                    </div>
                    <div className="blog-read-more" style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--primary-blue)', fontSize: 13, fontWeight: 600 }}>
                      Read <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>

      <ArticleModal post={selectedPost} onClose={() => setSelectedPost(null)} />
    </ScrollReveal>
  );
}
