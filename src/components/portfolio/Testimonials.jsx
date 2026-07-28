import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, Star, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import useRealtimeData from '../../hooks/useRealtimeData';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

function StarRating({ count = 5 }) {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={13} fill={i < count ? '#f59e0b' : 'none'} color={i < count ? '#f59e0b' : 'var(--border-color)'} />
      ))}
    </div>
  );
}

function Avatar({ name, url, size = 48 }) {
  const initials = name?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
  if (url) {
    return <img src={url} alt={name} loading="lazy" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-color)', flexShrink: 0 }} />;
  }
  const hue = (name?.charCodeAt(0) || 0) * 37 % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `hsl(${hue}, 60%, 55%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontSize: size * 0.33, fontWeight: 700,
    }}>{initials}</div>
  );
}

function SkeletonCard() {
  return (
    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 20, padding: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
      {[80, 100, 60].map((w, i) => (
        <div key={i} className="skeleton-line" style={{ width: `${w}%`, height: i === 0 ? 14 : 12, borderRadius: 7 }} />
      ))}
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <div className="skeleton-line" style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="skeleton-line" style={{ width: '50%', height: 13, borderRadius: 7 }} />
          <div className="skeleton-line" style={{ width: '35%', height: 11, borderRadius: 7 }} />
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const { data: raw, loading } = useRealtimeData('testimonials');
  const testimonials = (raw || []).filter(t => t.is_visible).sort((a, b) => a.display_order - b.display_order);

  const [active, setActive] = useState(0);
  const [view, setView] = useState('grid'); // 'grid' | 'carousel'

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
        {[1, 2].map(i => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (testimonials.length === 0) return null;

  const next = () => setActive(a => (a + 1) % testimonials.length);
  const prev = () => setActive(a => (a - 1 + testimonials.length) % testimonials.length);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <style>{`
        .skeleton-line { background: linear-gradient(90deg, var(--border-color) 25%, color-mix(in srgb, var(--border-color) 60%, transparent) 50%, var(--border-color) 75%); background-size: 400% 100%; animation: shimmer 1.6s ease infinite; }
        @keyframes shimmer { 0% { background-position: 100% 0 } 100% { background-position: -100% 0 } }
        .testimonial-card { background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 20px; padding: 26px 24px; position: relative; overflow: hidden; transition: all 0.25s ease; }
        .testimonial-card:hover { transform: translateY(-3px); box-shadow: 0 16px 40px rgba(0,0,0,0.1); }
        .testimonial-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, var(--primary-blue), #8b5cf6); opacity: 0; transition: opacity 0.25s; }
        .testimonial-card:hover::before { opacity: 1; }
      `}</style>

      {/* Section header */}
      <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ padding: 8, background: 'color-mix(in srgb, #8b5cf6 12%, transparent)', borderRadius: 12, color: '#8b5cf6' }}>
            <Users size={18} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>What People Say</h2>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>{testimonials.length} endorsement{testimonials.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        {testimonials.length > 1 && (
          <div style={{ display: 'flex', gap: 4 }}>
            {['grid', 'carousel'].map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: '5px 12px', borderRadius: 8, border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: 12, fontWeight: 600, textTransform: 'capitalize',
                background: view === v ? 'var(--primary-blue)' : 'var(--bg-secondary)',
                color: view === v ? '#fff' : 'var(--text-muted)',
              }}>{v}</button>
            ))}
          </div>
        )}
      </motion.div>

      {view === 'grid' ? (
        <motion.div
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {testimonials.map((t, i) => (
            <motion.div key={t.id} variants={itemVariants} className="testimonial-card">
              {/* Quote icon */}
              <div style={{ position: 'absolute', top: 18, right: 18, opacity: 0.07 }}>
                <Quote size={48} color="var(--primary-blue)" />
              </div>
              <StarRating count={5} />
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, margin: '14px 0 18px', fontStyle: 'italic' }}>
                "{t.message}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 14, borderTop: '1px solid var(--border-color)' }}>
                <Avatar name={t.name} url={t.avatar_url} size={42} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.role}{t.company ? ` · ${t.company}` : ''}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        /* Carousel mode */
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: 'relative' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="testimonial-card"
              style={{ maxWidth: 620, margin: '0 auto', padding: '36px 40px' }}
            >
              <div style={{ position: 'absolute', top: 24, right: 24, opacity: 0.08 }}>
                <Quote size={72} color="var(--primary-blue)" />
              </div>
              <StarRating count={5} />
              <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.8, margin: '18px 0 24px', fontStyle: 'italic' }}>
                "{testimonials[active].message}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <Avatar name={testimonials[active].name} url={testimonials[active].avatar_url} size={52} />
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{testimonials[active].name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{testimonials[active].role}{testimonials[active].company ? ` · ${testimonials[active].company}` : ''}</div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 20, alignItems: 'center' }}>
            <button onClick={prev} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 10, padding: 8, cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
              <ChevronLeft size={18} />
            </button>
            <div style={{ display: 'flex', gap: 6 }}>
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setActive(i)} style={{ width: i === active ? 20 : 8, height: 8, borderRadius: 4, border: 'none', cursor: 'pointer', background: i === active ? 'var(--primary-blue)' : 'var(--border-color)', transition: 'all 0.2s' }} />
              ))}
            </div>
            <button onClick={next} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 10, padding: 8, cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
              <ChevronRight size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
