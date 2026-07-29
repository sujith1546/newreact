import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Calendar, ChevronLeft, ChevronRight, Loader2, Clock, MapPin, Tag, ExternalLink, TrendingUp } from 'lucide-react';
import useRealtimeData from '../hooks/useRealtimeData';

function calcDuration(start, end) {
  if (!start) return '';
  const s = new Date(start);
  const e = end ? new Date(end) : new Date();
  const months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
  if (months < 1) return '< 1 mo';
  if (months < 12) return `${months} mo`;
  const yrs = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0 ? `${yrs}y ${rem}mo` : `${yrs}y`;
}

function formatDateRange(start, end) {
  if (!start) return '';
  const fmt = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  return `${fmt(start)} — ${end ? fmt(end) : 'Present'}`;
}

function CompanyAvatar({ name, logoUrl, size = 44 }) {
  const [imgError, setImgError] = useState(false);
  const initials = name ? name.split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase() : '?';
  const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];
  const color = colors[name?.charCodeAt(0) % colors.length || 0];

  if (logoUrl && !imgError) {
    return (
      <img
        src={logoUrl}
        alt={name}
        onError={() => setImgError(true)}
        style={{ width: size, height: size, borderRadius: 10, objectFit: 'contain', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', flexShrink: 0 }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: 10, flexShrink: 0,
      background: `linear-gradient(135deg, ${color}22, ${color}44)`,
      border: `1px solid ${color}44`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 800, fontSize: size * 0.32, color,
    }}>
      {initials}
    </div>
  );
}

function DotIndicator({ total, active }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: i === active ? 20 : 6, height: 6,
          borderRadius: 999,
          background: i === active ? 'var(--primary-blue)' : 'var(--border-color)',
          transition: 'all 0.3s ease',
        }} />
      ))}
    </div>
  );
}

function EmptyExperience() {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 16, padding: '40px 20px', textAlign: 'center',
      background: 'var(--bg-secondary)', border: '1px dashed var(--border-color)',
      borderRadius: 20,
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: 'color-mix(in srgb, var(--primary-blue) 10%, transparent)',
        border: '1px solid color-mix(in srgb, var(--primary-blue) 20%, transparent)',
      }}>
        <TrendingUp size={28} color="var(--primary-blue)" />
      </div>
      <div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>
          Building Experience
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 420, margin: 0 }}>
          Currently a fresher actively building my technical foundation through projects, open-source contributions, and continuous learning. Eagerly seeking opportunities to apply skills in a real-world environment.
        </p>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        {['Machine Learning', 'React', 'Python', 'Data Science', 'FastAPI'].map(tag => (
          <span key={tag} style={{
            padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600,
            background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)',
          }}>{tag}</span>
        ))}
      </div>
    </div>
  );
}

export default function Experience() {
  const { data: experiences, loading } = useRealtimeData('experience', { orderColumn: 'display_order', ascending: true });
  const [activeIdx, setActiveIdx] = useState(0);
  const [direction, setDirection] = useState(0);
  const touchRef = useRef(null);

  const total = experiences?.length || 0;
  const exp = experiences?.[activeIdx];

  const navigate = (dir) => {
    const next = activeIdx + dir;
    if (next < 0 || next >= total) return;
    setDirection(dir);
    setActiveIdx(next);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIdx, total]);

  const tags = exp?.tags || (exp?.stack ? exp.stack.split(',').map(s => s.trim()) : []);
  const bullets = exp?.description_bullets || [];

  const cardVariants = {
    enter: (d) => ({ opacity: 0, x: d > 0 ? 60 : -60 }),
    center: { opacity: 1, x: 0 },
    exit: (d) => ({ opacity: 0, x: d > 0 ? -60 : 60 }),
  };

  return (
    <div style={{ width: '100%', height: 'calc(100vh - 138px)', display: 'flex', flexDirection: 'column', gap: 0, overflow: 'hidden' }}>
      <style>{`
        .exp-root {
          width: 100%;
          height: calc(100vh - 138px);
          display: flex;
          flex-direction: column;
          gap: 14px;
          overflow: hidden;
        }
        .exp-header-row {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          flex-shrink: 0;
        }
        .exp-header-row h1 {
          font-size: 24px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }
        .exp-header-row p {
          font-size: 13px;
          color: var(--text-secondary);
          margin: 4px 0 0;
        }
        .exp-panel {
          flex: 1;
          min-height: 0;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          overflow: hidden;
          position: relative;
          display: flex;
          flex-direction: column;
        }
        .exp-panel-inner {
          flex: 1;
          min-height: 0;
          padding: 24px 28px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          overflow: hidden;
        }
        .exp-company-row {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-shrink: 0;
        }
        .exp-company-info h2 {
          font-size: 19px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 2px;
        }
        .exp-company-info p {
          font-size: 13px;
          color: var(--text-secondary);
          margin: 0;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .exp-meta-chips {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          flex-shrink: 0;
        }
        .exp-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 11.5px;
          font-weight: 600;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
        }
        .exp-chip--blue {
          background: color-mix(in srgb, var(--primary-blue) 10%, transparent);
          border-color: color-mix(in srgb, var(--primary-blue) 25%, transparent);
          color: var(--primary-blue);
        }
        .exp-divider {
          height: 1px;
          background: var(--border-color);
          flex-shrink: 0;
        }
        .exp-bullets {
          flex: 1;
          min-height: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .exp-bullet-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 4px;
        }
        .exp-bullet-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 7px;
          overflow: hidden;
        }
        .exp-bullet-item {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          font-size: 13px;
          line-height: 1.5;
          color: var(--text-secondary);
        }
        .exp-bullet-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--primary-blue);
          margin-top: 6px;
          flex-shrink: 0;
        }
        .exp-tags-row {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          flex-shrink: 0;
          overflow: hidden;
        }
        .exp-tag {
          padding: 3px 9px;
          border-radius: 6px;
          font-size: 10.5px;
          font-weight: 600;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          color: var(--text-muted);
        }
        .exp-nav-footer {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 28px;
          border-top: 1px solid var(--border-color);
          background: var(--bg-secondary);
        }
        .exp-nav-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 10px;
          border: 1px solid var(--border-color);
          background: var(--bg-primary);
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .exp-nav-btn:disabled {
          opacity: 0.35;
          cursor: default;
        }
        .exp-nav-btn:not(:disabled):hover {
          border-color: var(--primary-blue);
          color: var(--primary-blue);
          background: color-mix(in srgb, var(--primary-blue) 6%, transparent);
        }
        @media (max-width: 900px) {
          .exp-header-row h1 { font-size: 18px; }
          .exp-panel-inner { padding: 16px; gap: 12px; }
          .exp-company-info h2 { font-size: 15px; }
          .exp-nav-footer { padding: 10px 16px; }
        }
      `}</style>

      <div className="exp-root">
        {/* Header */}
        <div className="exp-header-row" style={{ justifyContent: 'flex-end' }}>
          {!loading && total > 0 && (
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>
              {activeIdx + 1} / {total}
            </span>
          )}
        </div>

        {loading ? (
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary-blue)' }} />
          </div>
        ) : total === 0 ? (
          <EmptyExperience />
        ) : (
          <div className="exp-panel">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={activeIdx}
                className="exp-panel-inner"
                custom={direction}
                variants={cardVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Company row */}
                <div className="exp-company-row">
                  <CompanyAvatar name={exp.company} logoUrl={exp.company_logo_url} />
                  <div className="exp-company-info">
                    <h2>{exp.role}</h2>
                    <p>
                      <MapPin size={12} /> {exp.company}
                      {exp.is_education && <span style={{ marginLeft: 6, padding: '1px 6px', borderRadius: 4, fontSize: 10, background: 'color-mix(in srgb, var(--primary-blue) 12%, transparent)', color: 'var(--primary-blue)', fontWeight: 700 }}>Education</span>}
                    </p>
                  </div>
                </div>

                {/* Meta chips */}
                <div className="exp-meta-chips">
                  <span className="exp-chip exp-chip--blue">
                    <Calendar size={12} /> {formatDateRange(exp.start_date, exp.end_date)}
                  </span>
                  <span className="exp-chip">
                    <Clock size={12} /> {calcDuration(exp.start_date, exp.end_date)}
                  </span>
                  {exp.location && <span className="exp-chip"><MapPin size={12} /> {exp.location}</span>}
                </div>

                <div className="exp-divider" />

                {/* Bullets */}
                {bullets.length > 0 && (
                  <div className="exp-bullets">
                    <div className="exp-bullet-label">Key Responsibilities</div>
                    <motion.ul className="exp-bullet-list">
                      {bullets.slice(0, 5).map((b, i) => (
                        <motion.li
                          key={i}
                          className="exp-bullet-item"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06, duration: 0.3 }}
                        >
                          <span className="exp-bullet-dot" />
                          <span>{b}</span>
                        </motion.li>
                      ))}
                    </motion.ul>
                  </div>
                )}

                {/* Tech tags */}
                {tags.length > 0 && (
                  <div>
                    <div className="exp-bullet-label" style={{ marginBottom: 6 }}>Tech Stack</div>
                    <div className="exp-tags-row">
                      {tags.slice(0, 10).map(tag => (
                        <span key={tag} className="exp-tag"><Tag size={10} style={{ display: 'inline', marginRight: 3 }} />{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Footer */}
            <div className="exp-nav-footer">
              <button className="exp-nav-btn" onClick={() => navigate(-1)} disabled={activeIdx === 0}>
                <ChevronLeft size={16} /> Prev
              </button>
              <DotIndicator total={total} active={activeIdx} />
              <button className="exp-nav-btn" onClick={() => navigate(1)} disabled={activeIdx === total - 1}>
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
