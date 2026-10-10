import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ScrollReveal, RollingText } from '../components';
import { 
  Briefcase, Loader2, Calendar, Send, FileText, 
  Clock, ArrowRight, Building2, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useRealtimeData from '../hooks/useRealtimeData';

export default function Experience() {
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth <= 900);
  const { data: experiences, loading } = useRealtimeData('experience', { orderColumn: 'display_order', ascending: true });
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeExpIdx, setActiveExpIdx] = useState(0);
  const trackRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleExpScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const { scrollLeft, offsetWidth } = track;
    const card = track.querySelector('.mexp-snap-card');
    const step = card ? card.offsetWidth + 12 : offsetWidth * 0.85;
    const idx = Math.round(scrollLeft / step);
    setActiveExpIdx(Math.min(Math.max(0, idx), (experiences?.length || 1) - 1));
  };

  const scrollToExp = (idx) => {
    const track = trackRef.current;
    if (!track) return;
    const cards = track.querySelectorAll('.mexp-snap-card');
    if (cards[idx]) {
      cards[idx].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
      setActiveExpIdx(idx);
    }
  };

  return (
    <ScrollReveal>
      <style>{`
        .exp-page {
          width: 100%;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .exp-header h1 {
          font-size: 28px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 5px;
        }
        .exp-header p {
          font-size: 13.5px;
          color: var(--text-secondary);
          margin: 0;
        }
        
        /* Desktop Empty State */
        .empty-state-card {
          width: 100%;
          box-sizing: border-box;
          background: var(--bg-secondary);
          border: 1px dashed #d1d5db;
          border-radius: 16px;
          padding: 60px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 16px;
        }
        
        .empty-icon-wrap {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #f3f4f6;
          color: #9ca3af;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .empty-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }
        
        .empty-desc {
          font-size: 14px;
          color: var(--text-secondary);
          max-width: 550px;
          line-height: 1.6;
          margin: 0;
        }

        [data-theme="dark"] .empty-state-card {
          border-color: #374151;
        }
        [data-theme="dark"] .empty-icon-wrap {
          background: #374151;
          color: #6b7280;
        }

        /* Timeline Styles (Desktop Default) */
        .timeline {
          position: relative;
          padding-left: 24px;
          margin-top: 10px;
        }
        .timeline::before {
          content: '';
          position: absolute;
          top: 0; left: 6px; bottom: 0;
          width: 2px;
          background: var(--border-color);
          border-radius: 2px;
        }
        .timeline-item {
          position: relative;
          margin-bottom: 32px;
        }
        .timeline-item:last-child {
          margin-bottom: 0;
        }
        .timeline-dot {
          position: absolute;
          top: 4px; left: -23px;
          width: 10px; height: 10px;
          border-radius: 50%;
          background: var(--primary-blue);
          border: 2px solid var(--bg-primary);
          box-sizing: content-box;
        }
        .timeline-content {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 20px;
        }
        .timeline-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
          flex-wrap: wrap;
          gap: 8px;
        }
        .timeline-title h3 {
          margin: 0 0 4px;
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
        }
        .timeline-title p {
          margin: 0;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-secondary);
        }
        .timeline-date {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
          background: var(--bg-primary);
          padding: 4px 10px;
          border-radius: 20px;
          border: 1px solid var(--border-color);
        }
        .timeline-bullets {
          margin: 0; padding-left: 18px;
          color: var(--text-secondary);
          font-size: 14px;
          line-height: 1.6;
        }
        .timeline-bullets li {
          margin-bottom: 6px;
        }
        .timeline-bullets li:last-child {
          margin-bottom: 0;
        }

        /* ========================================================
           ========== MOBILE REDESIGNED SEEKING CARD & TRACK ======
           ======================================================== */
        @media (max-width: 900px) {
          .exp-page {
            height: 100%;
            overflow-y: auto;
            gap: 10px;
            box-sizing: border-box;
            padding: 4px 0 20px;
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .exp-page::-webkit-scrollbar { display: none; }
          .exp-header { display: none !important; }

          /* ── Modern Mobile Header ── */
          .exp-mobile-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 2px 2px 10px;
            gap: 8px;
          }

          .exp-mobile-title-wrap {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .exp-mobile-icon-box {
            width: 28px;
            height: 28px;
            border-radius: 8px;
            background: rgba(59, 130, 246, 0.12);
            border: 1.2px solid rgba(59, 130, 246, 0.25);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            color: var(--primary-blue, #3B82F6);
          }

          .exp-mobile-heading {
            font-size: 14px;
            font-weight: 700;
            color: var(--text-primary);
            margin: 0;
            line-height: 1.2;
            letter-spacing: -0.01em;
          }

          .exp-mobile-sub {
            font-size: 10px;
            color: var(--text-muted);
            margin: 1px 0 0;
            line-height: 1.2;
          }

          .exp-mobile-status-pill {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            background: rgba(16, 185, 129, 0.1);
            border: 1.2px solid rgba(16, 185, 129, 0.3);
            color: #10b981;
            font-size: 9.5px;
            font-weight: 700;
            padding: 3px 9px;
            border-radius: 20px;
            letter-spacing: 0.02em;
            white-space: nowrap;
          }

          .exp-status-dot {
            width: 5px;
            height: 5px;
            border-radius: 50%;
            background: #10b981;
            box-shadow: 0 0 8px #10b981;
            animation: expPulse 2s infinite ease-in-out;
          }

          @keyframes expPulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.5); opacity: 0.45; }
          }

          /* ── Dedicated Mobile Seeking Opportunities Card ── */
          .exp-mob-seeking-wrap {
            display: flex;
            flex-direction: column;
            width: 100%;
            padding: 6px 0;
            box-sizing: border-box;
          }

          .exp-mob-seeking-card {
            background: var(--bg-secondary, #FFFFFF);
            border: 1.5px solid var(--border-color, #CBD5E1);
            border-radius: 20px;
            padding: 26px 18px 22px;
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 12px;
            box-shadow: 0 4px 18px rgba(0, 0, 0, 0.03);
            box-sizing: border-box;
          }

          [data-theme="dark"] .exp-mob-seeking-card {
            background: var(--bg-secondary, #161B22);
            border-color: rgba(255, 255, 255, 0.14);
            box-shadow: 0 6px 24px rgba(0, 0, 0, 0.32);
          }

          .exp-seeking-glow {
            position: absolute;
            top: -40px;
            left: 50%;
            transform: translateX(-50%);
            width: 180px;
            height: 180px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(59, 130, 246, 0.12), transparent 70%);
            pointer-events: none;
          }

          .exp-seeking-icon-wrap {
            width: 52px;
            height: 52px;
            border-radius: 16px;
            background: rgba(59, 130, 246, 0.1);
            border: 1.5px solid rgba(59, 130, 246, 0.25);
            color: var(--primary-blue, #3B82F6);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            z-index: 1;
          }

          .exp-seeking-badge {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            background: rgba(16, 185, 129, 0.09);
            border: 1.2px solid rgba(16, 185, 129, 0.28);
            border-radius: 16px;
            padding: 3px 10px;
            font-size: 9.5px;
            font-weight: 700;
            color: #10b981;
            letter-spacing: 0.02em;
          }

          .exp-seeking-title {
            font-size: 17px;
            font-weight: 800;
            color: var(--text-primary);
            letter-spacing: -0.02em;
            margin: 0;
            line-height: 1.25;
          }

          .exp-seeking-desc {
            font-size: 11.5px;
            color: var(--text-secondary);
            line-height: 1.6;
            margin: 0;
            max-width: 320px;
          }

          .exp-sla-bar {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            font-size: 9.5px;
            color: var(--text-muted);
            font-weight: 600;
            padding-top: 2px;
          }

          .exp-mob-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            width: 100%;
            margin-top: 4px;
          }

          .exp-mob-action-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            padding: 10px 12px;
            border-radius: 12px;
            font-size: 11.5px;
            font-weight: 700;
            cursor: pointer;
            border: 1px solid;
            transition: transform 0.15s ease;
            -webkit-tap-highlight-color: transparent;
          }

          .exp-mob-action-btn:active {
            transform: scale(0.96);
          }

          .exp-mob-action-btn--primary {
            background: rgba(59, 130, 246, 0.12);
            border-color: rgba(59, 130, 246, 0.3);
            color: var(--primary-blue, #3B82F6);
          }

          .exp-mob-action-btn--secondary {
            background: rgba(16, 185, 129, 0.12);
            border-color: rgba(16, 185, 129, 0.3);
            color: #10b981;
          }

          /* ── Experience Snap Track (When Records Exist) ── */
          .exp-mobile-carousel-section {
            display: flex;
            flex-direction: column;
            width: 100%;
            gap: 8px;
          }

          .exp-mobile-track-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 2px;
          }

          .exp-mobile-counter {
            font-size: 10px;
            font-weight: 700;
            color: var(--text-muted);
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            padding: 2px 8px;
            border-radius: 20px;
          }

          .exp-mobile-nav-btns {
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .exp-nav-btn {
            width: 28px;
            height: 28px;
            border-radius: 8px;
            border: 1px solid var(--border-color);
            background: var(--bg-secondary);
            color: var(--text-primary);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            padding: 0;
            transition: transform 0.15s ease;
          }

          .exp-nav-btn:active:not(:disabled) {
            transform: scale(0.92);
          }

          .exp-nav-btn:disabled {
            opacity: 0.35;
            cursor: not-allowed;
          }

          .exp-mobile-track {
            display: flex;
            gap: 12px;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            scroll-padding-left: 2px;
            margin: 0;
            padding: 4px 2px 14px;
            -webkit-overflow-scrolling: touch;
            -ms-overflow-style: none;
            scrollbar-width: none;
          }

          .exp-mobile-track::-webkit-scrollbar { display: none; }
          .exp-mobile-track::after { content: ''; flex: 0 0 4px; }

          .mexp-snap-card {
            flex: 0 0 85%;
            min-width: 85%;
            max-width: 85%;
            scroll-snap-align: start;
            box-sizing: border-box;
            background: var(--bg-secondary, #FFFFFF);
            border: 1.5px solid var(--border-color, #CBD5E1);
            border-radius: 16px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
            padding: 14px 15px;
            display: flex;
            flex-direction: column;
            cursor: pointer;
            transition: transform 0.15s ease;
            -webkit-tap-highlight-color: transparent;
          }

          .mexp-snap-card:active {
            transform: scale(0.985);
          }

          [data-theme="dark"] .mexp-snap-card {
            background: var(--bg-secondary, #161B22);
            border-color: rgba(255, 255, 255, 0.14);
            box-shadow: 0 4px 18px rgba(0, 0, 0, 0.28);
          }

          .mexp-snap-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 8px;
            gap: 6px;
          }

          .mexp-company-badge {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            border-radius: 12px;
            padding: 2.5px 8px;
            background: rgba(59, 130, 246, 0.08);
            border: 1.2px solid rgba(59, 130, 246, 0.25);
            color: var(--primary-blue, #3B82F6);
            font-size: 9.5px;
            font-weight: 700;
          }

          .mexp-tenure-pill {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            font-size: 9.5px;
            color: var(--text-muted);
            font-weight: 600;
          }

          .mexp-snap-role {
            font-size: 14.5px;
            font-weight: 700;
            color: var(--text-primary);
            margin: 0 0 4px;
            line-height: 1.25;
            letter-spacing: -0.015em;
          }

          .mexp-snap-company {
            font-size: 10.5px;
            font-weight: 600;
            color: var(--text-secondary);
            margin: 0 0 8px;
          }

          .mexp-snap-bullets {
            margin: 0 0 10px;
            padding-left: 14px;
            font-size: 10px;
            color: var(--text-secondary);
            line-height: 1.45;
          }

          .mexp-snap-footer {
            margin-top: auto;
            padding-top: 8px;
            border-top: 1px solid var(--border-color);
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .mexp-view-link {
            font-size: 10.5px;
            font-weight: 700;
            color: var(--primary-blue, #3B82F6);
            display: inline-flex;
            align-items: center;
            gap: 4px;
          }

          /* ── Bottom Sheet Drawer ── */
          .dsheet-backdrop {
            position: fixed; inset: 0;
            background: rgba(0, 0, 0, 0.55);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            z-index: 9998;
          }

          .dsheet {
            position: fixed; bottom: 0; left: 0; right: 0;
            background: var(--bg-primary);
            border-top-left-radius: 20px;
            border-top-right-radius: 20px;
            border-top: 1.5px solid var(--border-color);
            max-height: 85vh;
            display: flex; flex-direction: column;
            z-index: 9999;
            box-shadow: 0 -8px 32px rgba(0,0,0,0.3);
            overflow: hidden;
          }

          [data-theme="dark"] .dsheet {
            background: #11151c;
            border-color: rgba(255,255,255,0.12);
          }

          .dsheet-handle {
            width: 36px; height: 4px;
            border-radius: 2px;
            background: var(--border-color);
            margin: 8px auto 4px;
            flex-shrink: 0;
          }

          .dsheet-header {
            display: flex; align-items: flex-start; justify-content: space-between;
            padding: 10px 16px 12px;
            border-bottom: 1px solid var(--border-color);
            gap: 10px;
          }

          .dsheet-title h3 {
            font-size: 15px; font-weight: 800; color: var(--text-primary);
            margin: 0 0 2px; line-height: 1.25;
          }

          .dsheet-title p {
            font-size: 11px; color: var(--text-secondary); margin: 0;
          }

          .dsheet-close {
            width: 28px; height: 28px; border-radius: 8px;
            border: 1px solid var(--border-color); background: var(--bg-secondary);
            color: var(--text-secondary); display: flex; align-items: center; justify-content: center;
            cursor: pointer; padding: 0; flex-shrink: 0;
          }

          .dsheet-body {
            padding: 14px 16px 24px;
            overflow-y: auto;
            display: flex; flex-direction: column; gap: 12px;
          }

          .dsheet-section-title {
            font-size: 10px; font-weight: 800; text-transform: uppercase;
            letter-spacing: 0.06em; color: var(--text-muted); margin: 0 0 6px;
          }

          .dsheet-bullets {
            margin: 0; padding-left: 16px;
            font-size: 11px; color: var(--text-secondary); line-height: 1.6;
          }

          .dsheet-bullets li {
            margin-bottom: 6px;
          }
        }
      `}</style>
      <style>{`
        /* ── RollingText styles (Experience) ── */
        .rolling-text-root {
          display: inline-block;
          max-width: 100%;
          text-align: left;
          font-size: clamp(20px, 3vw, 32px);
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 1;
          text-transform: uppercase;
          --rolling-accent: var(--primary-blue, #007bff);
        }
      `}</style>
      
      <div className="exp-page">
        {/* Desktop Header */}
        {!isMobile && (
          <div className="exp-header" style={{ marginBottom: '8px' }}>
            <RollingText text="EXPERIENCE" speed={0.06} duration={3} />
            <p style={{ marginTop: '8px' }}>My professional journey &amp; career timeline</p>
          </div>
        )}

        {/* Mobile Hero Header */}
        {isMobile && (
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <p style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.22em', textTransform: 'uppercase', margin: '0 0 6px' }}>
              CAREER TRAJECTORY
            </p>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px', letterSpacing: '-0.025em', lineHeight: 1.2 }}>
              Professional Journey &amp; Roles
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 auto', lineHeight: 1.55 }}>
              Explore career milestones, engineering impact, and current availability status.
            </p>
          </div>
        )}

        {/* Mobile Modern Section Header */}
        {isMobile && (
          <div className="exp-mobile-header">
            <div className="exp-mobile-title-wrap">
              <div className="exp-mobile-icon-box">
                <Briefcase size={15} />
              </div>
              <div>
                <h2 className="exp-mobile-heading">Work &amp; Experience</h2>
                <p className="exp-mobile-sub">Engineering roles &amp; opportunity status</p>
              </div>
            </div>
            <div className="exp-mobile-status-pill">
              <span className="exp-status-dot" />
              <span>Available</span>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <Loader2 className="spin" size={32} color="var(--primary-blue)" />
          </div>
        ) : (!experiences || experiences.length === 0) ? (
          isMobile ? (
            /* ── MOBILE SEEKING OPPORTUNITIES CARD (Clean, Focused, Direct) ── */
            <div className="exp-mob-seeking-wrap">
              <motion.div
                className="exp-mob-seeking-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="exp-seeking-glow" />
                
                {/* Elevated Briefcase Icon */}
                <div className="exp-seeking-icon-wrap">
                  <Briefcase size={26} />
                </div>

                {/* Candidate Badge */}
                <div className="exp-seeking-badge">
                  <span className="exp-status-dot" />
                  <span>Fresher · Open to Roles</span>
                </div>

                {/* Exact Requested Title */}
                <h2 className="exp-seeking-title">Seeking Opportunities</h2>

                {/* Exact Requested Content */}
                <p className="exp-seeking-desc">
                  I am currently a fresher, eagerly building my technical foundation through personal projects and continuous learning. I am actively looking for opportunities to apply my skills in a real-world environment.
                </p>

                {/* Response SLA */}
                <div className="exp-sla-bar">
                  <Clock size={11} style={{ color: '#10b981' }} />
                  <span>Quick Response SLA · Replies within 24 hours</span>
                </div>

                {/* Action CTAs */}
                <div className="exp-mob-actions">
                  <button
                    className="exp-mob-action-btn exp-mob-action-btn--primary"
                    onClick={() => window.location.href = '/contact'}
                  >
                    <Send size={13} />
                    Get in Touch
                  </button>
                  <button
                    className="exp-mob-action-btn exp-mob-action-btn--secondary"
                    onClick={() => window.dispatchEvent(new CustomEvent('open-resume'))}
                  >
                    <FileText size={13} />
                    View Resume
                  </button>
                </div>
              </motion.div>
            </div>
          ) : (
            /* Desktop Empty State */
            <div className="empty-state-card">
              <div className="empty-icon-wrap">
                <Briefcase size={24} />
              </div>
              <h2 className="empty-title">Seeking Opportunities</h2>
              <p className="empty-desc">
                I am currently a fresher, eagerly building my technical foundation through personal projects and continuous learning. I am actively looking for opportunities to apply my skills in a real-world environment.
              </p>
            </div>
          )
        ) : (
          isMobile ? (
            /* ── MOBILE HORIZONTAL SNAP CAROUSEL (When records exist) ── */
            <div className="exp-mobile-carousel-section">
              <div className="exp-mobile-track-header">
                <span className="exp-mobile-counter">
                  {activeExpIdx + 1} / {experiences.length}
                </span>
                <div className="exp-mobile-nav-btns">
                  <button
                    className="exp-nav-btn"
                    onClick={() => scrollToExp(Math.max(0, activeExpIdx - 1))}
                    disabled={activeExpIdx === 0}
                    aria-label="Previous experience"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    className="exp-nav-btn"
                    onClick={() => scrollToExp(Math.min(experiences.length - 1, activeExpIdx + 1))}
                    disabled={activeExpIdx === experiences.length - 1}
                    aria-label="Next experience"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              <div className="exp-mobile-track" ref={trackRef} onScroll={handleExpScroll}>
                {experiences.map((exp, idx) => {
                  let bullets = [];
                  try {
                    bullets = Array.isArray(exp.description_bullets)
                      ? exp.description_bullets
                      : (typeof exp.description_bullets === 'string' ? JSON.parse(exp.description_bullets) : []);
                  } catch {
                    bullets = [];
                  }

                  return (
                    <div
                      key={exp.id || idx}
                      className="mexp-snap-card"
                      onClick={() => setSelectedItem(exp)}
                    >
                      <div className="mexp-snap-top">
                        <div className="mexp-company-badge">
                          <Building2 size={11} />
                          <span>{exp.company}</span>
                        </div>
                        <div className="mexp-tenure-pill">
                          <Calendar size={10} />
                          <span>{exp.start_date} – {exp.end_date || 'Present'}</span>
                        </div>
                      </div>

                      <h3 className="mexp-snap-role">{exp.role}</h3>
                      <p className="mexp-snap-company">{exp.company} {exp.is_education ? '(Education)' : ''}</p>

                      {bullets && bullets.length > 0 && (
                        <ul className="mexp-snap-bullets">
                          {bullets.slice(0, 2).map((bullet, bIdx) => (
                            <li key={bIdx}>{bullet}</li>
                          ))}
                        </ul>
                      )}

                      <div className="mexp-snap-footer">
                        <span className="mexp-view-link">
                          View Deliverables &amp; Tech <ArrowRight size={12} />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Desktop Timeline */
            <div className="timeline">
              {experiences.map((exp) => (
                <div key={exp.id} className="timeline-item">
                  <div className="timeline-dot" />
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <div className="timeline-title">
                        <h3>{exp.role}</h3>
                        <p>{exp.company} {exp.is_education ? '(Education)' : ''}</p>
                      </div>
                      <div className="timeline-date">
                        <Calendar size={14} />
                        {exp.start_date} — {exp.end_date || 'Present'}
                      </div>
                    </div>
                    {(() => {
                      let bullets = [];
                      try {
                        bullets = Array.isArray(exp.description_bullets)
                          ? exp.description_bullets
                          : (typeof exp.description_bullets === 'string' ? JSON.parse(exp.description_bullets) : []);
                      } catch {
                        bullets = [];
                      }
                      return bullets && bullets.length > 0 ? (
                        <ul className="timeline-bullets">
                          {bullets.map((bullet, i) => (
                            <li key={i}>{bullet}</li>
                          ))}
                        </ul>
                      ) : null;
                    })()}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* ── DETAIL BOTTOM SHEET (Mobile, When records exist) ── */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedItem && (
            <div style={{ position: 'relative', zIndex: 9999 }}>
              <motion.div
                className="dsheet-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedItem(null)}
              />
              <motion.div
                className="dsheet"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 32, stiffness: 350, mass: 0.9 }}
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: 0.4 }}
                onDragEnd={(_, info) => {
                  if (info.offset.y > 120 || info.velocity.y > 600) setSelectedItem(null);
                }}
              >
                <div className="dsheet-handle" />

                <div className="dsheet-header">
                  <div className="dsheet-title">
                    <h3>{selectedItem.role || selectedItem.title}</h3>
                    <p>{selectedItem.company || 'Experience Record'}</p>
                  </div>
                  <button className="dsheet-close" onClick={() => setSelectedItem(null)} aria-label="Close details">
                    <X size={15} />
                  </button>
                </div>

                <div className="dsheet-body">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--text-muted)' }}>
                    <Calendar size={12} />
                    <span>{selectedItem.start_date} – {selectedItem.end_date || 'Present'}</span>
                    {selectedItem.is_education && <span style={{ color: 'var(--primary-blue)' }}>(Academic Role)</span>}
                  </div>

                  <div>
                    <h4 className="dsheet-section-title">Deliverables &amp; Achievements</h4>
                    {(() => {
                      let bullets = [];
                      try {
                        bullets = Array.isArray(selectedItem.description_bullets)
                          ? selectedItem.description_bullets
                          : (typeof selectedItem.description_bullets === 'string' ? JSON.parse(selectedItem.description_bullets) : []);
                      } catch {
                        bullets = [];
                      }
                      return bullets && bullets.length > 0 ? (
                        <ul className="dsheet-bullets">
                          {bullets.map((b, i) => (
                            <li key={i}>{b}</li>
                          ))}
                        </ul>
                      ) : (
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                          Verified technical experience entry.
                        </p>
                      );
                    })()}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </ScrollReveal>
  );
}
