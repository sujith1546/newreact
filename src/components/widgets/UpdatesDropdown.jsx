import { useState, useRef, useEffect } from 'react';
import { useUpdates } from '../../hooks/useUpdates';
import { useNavigate } from 'react-router-dom';
import { History, ArrowRight, Sparkles } from 'lucide-react';

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (mins < 60) return `${mins <= 1 ? 'Just now' : `${mins}m ago`}`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

const CATEGORY_COLORS = {
  feature: '#10b981',
  fix: '#f59e0b',
  improvement: '#3b82f6',
};

export default function UpdatesDropdown() {
  const { updates, unreadCount, markAllRead } = useUpdates();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e) {
      if (!e.target || (document.body && !document.body.contains(e.target))) return;
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function toggleOpen() {
    const next = !open;
    setOpen(next);
    if (next && unreadCount > 0) markAllRead();
  }

  return (
    <div className="updates-dropdown-wrapper" ref={ref} style={{ position: 'relative' }}>
      <style>{`
        .updates-btn {
          width: 34px; height: 34px; border-radius: 17px;
          background: rgba(243, 244, 246, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(0, 0, 0, 0.1);
          box-shadow: 0 4px 15px rgba(0,0,0,0.08);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; position: relative;
          color: var(--text-secondary);
          transition: all 0.3s ease;
        }
        [data-theme="dark"] .updates-btn {
          background: rgba(30, 30, 30, 0.5);
          border-color: rgba(255,255,255,0.08);
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        .updates-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
          color: var(--primary-blue);
          border-color: var(--primary-blue);
        }

        .updates-dot {
          position: absolute;
          top: 3px;
          right: 3px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #ef4444;
          border: 1.5px solid var(--bg-secondary);
          box-shadow: 0 0 6px rgba(239, 68, 68, 0.6);
        }

        .updates-panel {
          position: absolute;
          top: 42px;
          right: 0;
          width: 280px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 14px;
          padding: 14px;
          z-index: 3000;
          box-shadow: 0 12px 30px rgba(0,0,0,0.25);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .updates-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 8px;
          border-bottom: 1px solid var(--border-color);
        }
        .updates-panel-title {
          font-size: 13px;
          font-weight: 700;
          margin: 0;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .updates-panel-item {
          padding: 8px;
          border-radius: 8px;
          background: rgba(128, 128, 128, 0.05);
          border: 1px solid var(--border-color);
          transition: background 0.15s;
        }
        .updates-panel-item:hover {
          background: rgba(128, 128, 128, 0.1);
        }

        .updates-item-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 4px;
        }
        .updates-item-cat {
          font-size: 9.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .updates-item-time {
          font-size: 10.5px;
          color: var(--text-muted);
        }
        .updates-item-title {
          font-size: 12px;
          font-weight: 600;
          margin: 0;
          color: var(--text-primary);
          line-height: 1.35;
        }

        .updates-view-all {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 12px;
          font-weight: 700;
          color: var(--primary-blue);
          padding: 6px 0 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          border-top: 1px solid var(--border-color);
          transition: opacity 0.15s;
        }
        .updates-view-all:hover { opacity: 0.85; }
      `}</style>

      <button
        className="updates-btn"
        aria-label="Updates Timeline"
        onClick={toggleOpen}
        title="View Latest Updates"
      >
        <History size={16} strokeWidth={2.2} />
        {unreadCount > 0 && <span className="updates-dot" />}
      </button>

      {open && (
        <div className="updates-panel">
          <div className="updates-panel-header">
            <span className="updates-panel-title">
              <Sparkles size={13} style={{ color: 'var(--primary-blue)' }} /> Latest Updates
            </span>
            {unreadCount > 0 && (
              <span style={{ fontSize: 10, fontWeight: 700, background: '#ef4444', color: '#fff', padding: '1px 6px', borderRadius: 999 }}>
                {unreadCount} new
              </span>
            )}
          </div>

          {updates.slice(0, 4).map((u) => (
            <div key={u.id} className="updates-panel-item">
              <div className="updates-item-meta">
                <span
                  className="updates-item-cat"
                  style={{
                    color: CATEGORY_COLORS[u.category] || '#3b82f6',
                    background: `${CATEGORY_COLORS[u.category] || '#3b82f6'}15`,
                    border: `1px solid ${CATEGORY_COLORS[u.category] || '#3b82f6'}30`,
                  }}
                >
                  {u.category}
                </span>
                <span className="updates-item-time">{timeAgo(u.created_at)}</span>
              </div>
              <p className="updates-item-title">{u.title}</p>
            </div>
          ))}

          <button
            className="updates-view-all"
            onClick={() => { setOpen(false); navigate('/updates'); }}
          >
            View all updates <ArrowRight size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
