import { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollReveal from '../components/ScrollReveal';
import { Award, ExternalLink, ShieldCheck, X, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import useRealtimeData from '../hooks/useRealtimeData';
export default function Certifications() {
  const [isMobile, setIsMobile] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);
  const [sheetScrolled, setSheetScrolled] = useState(false);
  const [sheetScrollable, setSheetScrollable] = useState(false);
  const sheetContentRef = useRef(null);
  const { data: certificationsData, loading } = useRealtimeData('certifications', { orderColumn: 'display_order', ascending: true });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    handleResize(); // Init on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Recalculate if sheet is scrollable when opened
  useEffect(() => {
    if (selectedCert) {
      setSheetScrolled(false);
      setSheetScrollable(false);
      setTimeout(() => {
        if (sheetContentRef.current) {
          const { scrollHeight, clientHeight } = sheetContentRef.current;
          setSheetScrollable(scrollHeight > clientHeight + 5);
        }
      }, 200);
    }
  }, [selectedCert]);

  // Desktop hover effect handler
  const handleMouseMove = (e, cardElement) => {
    if (!cardElement || isMobile) return;
    const rect = cardElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardElement.style.setProperty('--mouse-x', `${x}px`);
    cardElement.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <ScrollReveal className="wide-content">
      <style>{`
        /* ============ DESKTOP GRID (from original) ============ */
        .certs-header { margin-bottom: 32px; }
        .certs-header h1 { font-size: 28px; font-weight: 700; color: var(--text-primary); margin: 0 0 8px 0; }
        .certs-header p { font-size: 14.5px; color: var(--text-secondary); max-width: 600px; line-height: 1.5; margin: 0; }
        
        .certs-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
        
        .cert-card {
          background: rgba(255, 255, 255, 0.6); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(0,0,0,0.06); border-radius: 16px; overflow: hidden;
          display: flex; position: relative; transition: transform 0.3s ease, border-color 0.3s ease;
          box-shadow: 0 4px 15px rgba(0,0,0,0.02); cursor: pointer;
        }
        
        .cert-card::before {
          content: ""; position: absolute; top: 0; left: 0; right: 0; bottom: 0; border-radius: inherit;
          background: radial-gradient(400px circle at var(--mouse-x, -500px) var(--mouse-y, -500px), rgba(255, 255, 255, 0.8), transparent 40%);
          opacity: 0; transition: opacity 0.3s; pointer-events: none; z-index: 0;
        }
        
        [data-theme="dark"] .cert-card { background: rgba(30, 30, 30, 0.4); border-color: rgba(255,255,255,0.08); }
        [data-theme="dark"] .cert-card::before {
          background: radial-gradient(400px circle at var(--mouse-x, -500px) var(--mouse-y, -500px), rgba(255, 255, 255, 0.08), transparent 40%);
        }

        .cert-card:hover { transform: translateY(-2px); border-color: rgba(0,0,0,0.15); box-shadow: 0 12px 30px -10px rgba(0,0,0,0.08); }
        [data-theme="dark"] .cert-card:hover { border-color: rgba(255,255,255,0.2); box-shadow: 0 12px 30px -10px rgba(0,0,0,0.3); }
        .cert-card:hover::before { opacity: 1; }

        .cert-hologram-area {
          min-width: 130px; background: linear-gradient(135deg, #e0e7ff 0%, #fef08a 100%);
          position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center;
          border-right: 1px solid rgba(0,0,0,0.03); z-index: 1;
        }
        [data-theme="dark"] .cert-hologram-area { background: linear-gradient(135deg, #1e1b4b 0%, #713f12 100%); border-right-color: rgba(255,255,255,0.05); }
        
        .mesh-gradient {
          position: absolute; width: 200%; height: 200%;
          background: radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.15), transparent 60%), radial-gradient(circle at 80% 20%, rgba(234, 179, 8, 0.15), transparent 50%);
          animation: meshFlow 8s ease infinite alternate;
        }
        @keyframes meshFlow { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(-20%, -20%) scale(1.1); } }

        .cert-icon-cluster { position: relative; color: rgba(0,0,0,0.4); filter: drop-shadow(0 4px 6px rgba(0,0,0,0.05)); }
        [data-theme="dark"] .cert-icon-cluster { color: rgba(255,255,255,0.7); filter: drop-shadow(0 4px 6px rgba(0,0,0,0.5)); }
        
        .cert-badge-icon { position: absolute; bottom: -4px; right: -8px; color: #10b981; background: white; border-radius: 50%; padding: 1px; }
        [data-theme="dark"] .cert-badge-icon { background: #1e1b4b; }

        .cert-content { padding: 20px; display: flex; flex-direction: column; flex-grow: 1; z-index: 1; }
        .cert-header { display: flex; flex-direction: column; margin-bottom: 8px; }
        .cert-title { font-size: 16px; font-weight: 700; color: var(--text-primary); margin: 0 0 4px 0; letter-spacing: -0.01em; line-height: 1.3; }
        .cert-issuer { font-size: 11.5px; font-weight: 700; color: var(--primary-blue); text-transform: uppercase; letter-spacing: 0.05em; }
        .cert-desc { font-size: 13.5px; color: var(--text-secondary); line-height: 1.5; margin: 0 0 16px; flex-grow: 1; }
        
        .cert-footer { display: flex; align-items: center; justify-content: space-between; border-top: 1px solid rgba(0,0,0,0.06); padding-top: 16px; }
        [data-theme="dark"] .cert-footer { border-top-color: rgba(255,255,255,0.08); }
        .cert-link { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 600; color: var(--text-primary); text-decoration: none; transition: color 0.2s; padding: 4px 8px; margin: -4px -8px; border-radius: 6px; }
        .cert-link:hover { color: var(--primary-blue); background: rgba(0,123,255,0.05); }

        /* ============ MOBILE GRID ============ */
        .mobile-certs-feed { display: none; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
        
        @media (max-width: 900px) {
          .certs-grid { display: none; /* Hide desktop grid */ }
          .mobile-certs-feed {
            display: flex; flex-direction: column; gap: 12px; width: 100%;
          }

          /* Compact horizontal mobile card - matched to projects */
          .mcert-card {
            position: relative; overflow: hidden;
            display: flex; align-items: flex-start; gap: 13px;
            padding: 14px 14px 14px 18px;
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 18px;
            width: 100%; text-align: left; cursor: pointer;
            transition: background 0.15s; outline: none;
          }
          .mcert-card:active { background: var(--bg-primary); }
          
          .mcert-stripe {
            position: absolute; left: 0; top: 0; bottom: 0;
            width: 3px; border-radius: 18px 0 0 18px;
          }

          .mcert-icon-wrap {
            width: 42px; height: 42px; border-radius: 12px;
            display: flex; align-items: center; justify-content: center;
            flex-shrink: 0; position: relative; overflow: hidden;
            border: 1px solid;
          }
          .mcert-icon { z-index: 1; }

          .mcert-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
          .mcert-title-row { display: flex; align-items: center; gap: 8px; margin-bottom: 5px; flex-wrap: wrap; }
          .mcert-title { font-size: 14.5px; font-weight: 700; color: var(--text-primary); margin: 0; line-height: 1.2; }
          .mcert-issuer { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin: 0; }
          
          .mcert-chevron { color: var(--text-muted); flex-shrink: 0; margin-top: 2px; }
          
          /* ============ PREMIUM DETAIL SHEET ============ */
          .dsheet-backdrop {
            position: fixed; inset: 0;
            background: rgba(0,0,0,.65);
            backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
            will-change: opacity, backdrop-filter; transform: translateZ(0);
            z-index: 10000;
          }
          .dsheet {
            position: fixed; left: 0; right: 0; bottom: 0; z-index: 10001;
            background: var(--bg-secondary); border-radius: 28px 28px 0 0;
            will-change: transform; transform: translateZ(0); backface-visibility: hidden;
            box-shadow: 0 -20px 60px rgba(0,0,0,.25), 0 -1px 0 rgba(255,255,255,.06);
            display: flex; flex-direction: column;
            max-height: 86vh; max-height: 86dvh;
          }
          .dsheet-handle {
            width: 36px; height: 4px; border-radius: 2px; background: var(--border-color);
            margin: 12px auto 0 auto; flex-shrink: 0;
          }
          .dsheet-header {
            display: flex; align-items: center; justify-content: space-between;
            padding: 16px 18px 14px; border-bottom: 1px solid var(--border-color); flex-shrink: 0;
          }
          .dsheet-header-left { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0; }
          .dsheet-header-icon {
            width: 44px; height: 44px; border-radius: 14px; flex-shrink: 0;
            display: flex; align-items: center; justify-content: center;
          }
          .dsheet-title h3 { font-size: 16px; font-weight: 800; color: var(--text-primary); margin: 0 0 2px; letter-spacing: -.02em; line-height: 1.25; }
          .dsheet-title p { font-size: 11px; font-weight: 700; color: var(--primary-blue); text-transform: uppercase; letter-spacing: .06em; margin: 0; }
          .dsheet-close {
            width: 30px; height: 30px; border-radius: 15px; background: var(--bg-primary);
            border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: center;
            color: var(--text-secondary); cursor: pointer; flex-shrink: 0;
          }
          .dsheet-body {
            flex: 1; overflow-y: auto; padding: 0; display: flex; flex-direction: column; position: relative;
          }
          .dsheet-body::-webkit-scrollbar { display: none; }
          .dsheet-content { padding: 18px; display: flex; flex-direction: column; gap: 16px; padding-bottom: 32px; }
          
          .dsheet-section-label {
            font-size: 10px; font-weight: 800; color: var(--text-muted);
            text-transform: uppercase; letter-spacing: .1em; margin: 0 0 8px;
          }

          /* Hero credential card — 3-col stats like Skill Detail */
          .cert-hero-card {
            display: flex; align-items: center; gap: 16px; padding: 16px;
            background: var(--bg-primary); border: 1px solid var(--border-color);
            border-radius: 16px;
          }
          .cert-hero-badge {
            width: 72px; height: 72px; border-radius: 20px; flex-shrink: 0;
            display: flex; align-items: center; justify-content: center;
            position: relative; overflow: hidden;
          }
          .cert-hero-badge-bg {
            position: absolute; inset: 0;
            background: linear-gradient(135deg, rgba(59,130,246,.15), rgba(234,179,8,.1));
          }
          .cert-hero-badge svg { position: relative; z-index: 1; }
          .cert-hero-meta { flex: 1; display: flex; flex-direction: column; gap: 8px; }
          .cert-hero-meta-row { display: flex; align-items: center; gap: 7px; font-size: 12px; color: var(--text-secondary); }
          .cert-hero-meta-row svg { color: var(--text-muted); flex-shrink: 0; }
          .cert-hero-meta-row strong { color: var(--text-primary); font-weight: 700; }

          .dsheet-image {
            width: 100%; height: 140px; border-radius: 16px; overflow: hidden; position: relative;
            background: linear-gradient(135deg, #1e1b4b 0%, #713f12 100%);
            display: flex; align-items: center; justify-content: center;
            border: 1px solid rgba(255,255,255,.06);
          }
          [data-theme=\"light\"] .dsheet-image { background: linear-gradient(135deg, #e0e7ff 0%, #fef08a 100%); border-color: rgba(0,0,0,.04); }
          .dsheet-image-icon { color: rgba(255,255,255,0.5); z-index: 1; }
          [data-theme=\"light\"] .dsheet-image-icon { color: rgba(0,0,0,0.3); }
          
          .dsheet-desc { font-size: 13.5px; color: var(--text-secondary); line-height: 1.65; margin: 0; }
          
          .cert-tags { display: flex; flex-wrap: wrap; gap: 6px; }
          .cert-detail-tag {
            font-size: 11px; font-weight: 700; padding: 5px 11px; border-radius: 20px;
            background: var(--bg-primary); border: 1px solid var(--border-color);
            color: var(--text-secondary);
          }

          .dsheet-action {
            width: 100%; height: 50px; border-radius: 16px;
            background: linear-gradient(135deg, var(--primary-blue) 0%, #0056b3 100%);
            color: #fff; border: none;
            display: flex; align-items: center; justify-content: center; gap: 8px;
            font-size: 14px; font-weight: 700; text-decoration: none;
            box-shadow: 0 4px 15px rgba(0,123,255,.25);
            transition: opacity 0.2s;
          }
          .dsheet-action:hover { opacity: 0.9; }

          .dsheet-scroll-hint {
            position: absolute; bottom: 0; left: 0; right: 0; height: 70px;
            background: linear-gradient(to top, var(--bg-secondary) 30%, transparent);
            display: flex; justify-content: center; align-items: flex-end; padding-bottom: 12px;
            pointer-events: none; color: var(--text-secondary); z-index: 100;
          }
        }

      `}</style>

      <div className="certs-header">
        <h1>Global Certifications</h1>
        <p className="cert-header-desc">
          Professional credentials and specialized training in emerging technologies.
        </p>
      </div>
          
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
               <Loader2 className="spin" size={32} color="var(--primary-blue)" />
            </div>
          ) : certificationsData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              No certifications found.
            </div>
          ) : (
            <>
              {/* ── DESKTOP GRID ── */}
              {!isMobile && (
                <div className="certs-grid">
                  {certificationsData.map((cert) => (
                    <div 
                      key={cert.id}
                      className="cert-card" 
                      onMouseMove={(e) => handleMouseMove(e, e.currentTarget)}
                    >
                      <div className="cert-hologram-area">
                        <div className="mesh-gradient"></div>
                        <div className="cert-icon-cluster">
                          <Award size={42} className="cert-main-icon" />
                          <ShieldCheck size={20} className="cert-badge-icon" />
                        </div>
                      </div>

                      <div className="cert-content">
                        <div className="cert-header">
                          <h3 className="cert-title">{cert.title}</h3>
                          <span className="cert-issuer">{cert.issuer}</span>
                        </div>
                        <p className="cert-desc">{cert.description}</p>
                        
                        <div className="cert-footer">
                          <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="cert-link">
                            Verify Credential <ExternalLink size={14} />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

      {/* ── MOBILE VERTICAL FEED ── */}
      {isMobile && (
        <div className="mobile-certs-feed">
          {certificationsData.map((cert, index) => {
            const accents = ['#3b82f6', '#eab308', '#10b981', '#8b5cf6'];
            const accent = accents[index % accents.length];
            return (
              <button 
                key={cert.id} 
                className="mcert-card"
                onClick={() => setSelectedCert(cert)}
              >
                <div className="mcert-stripe" style={{ background: accent }} />
                <div className="mcert-icon-wrap" style={{ background: accent + '18', color: accent, borderColor: accent + '30' }}>
                  <Award size={20} className="mcert-icon" style={{ color: accent }} />
                </div>
                <div className="mcert-info">
                  <div className="mcert-title-row">
                    <h3 className="mcert-title">{cert.title}</h3>
                  </div>
                  <p className="mcert-issuer" style={{ color: accent }}>{cert.issuer}</p>
                </div>
                <ChevronRight size={15} className="mcert-chevron" />
              </button>
            );
          })}
        </div>
      )}

      {/* ── DETAIL SHEET (Mobile) ── */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedCert && (() => {
            const certIndex = certificationsData.indexOf(selectedCert);
            const accents = ['#3b82f6', '#eab308', '#10b981', '#8b5cf6'];
            const accent = accents[certIndex % accents.length];
            return (
            <div style={{ position: 'relative', zIndex: 9999 }}>
              <motion.div
                className="dsheet-backdrop"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSelectedCert(null)}
              />
              <motion.div
                className="dsheet"
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 32, stiffness: 350, mass: 0.9 }}
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: 0.4 }}
                onDragEnd={(_, info) => { if (info.offset.y > 120 || info.velocity.y > 600) setSelectedCert(null); }}
              >
                <div className="dsheet-handle" />

                {/* Header with accent icon */}
                <div className="dsheet-header">
                  <div className="dsheet-header-left">
                    <div className="dsheet-header-icon" style={{ background: accent + '18', color: accent, border: `1px solid ${accent}30` }}>
                      <Award size={22} />
                    </div>
                    <div className="dsheet-title">
                      <h3>{selectedCert.title}</h3>
                      <p>{selectedCert.issuer}</p>
                    </div>
                  </div>
                  <button className="dsheet-close" onClick={() => setSelectedCert(null)}>
                    <X size={16} />
                  </button>
                </div>

                <div 
                  className="dsheet-body" 
                  ref={sheetContentRef}
                  onScroll={(e) => { if (e.target.scrollTop > 10 && !sheetScrolled) setSheetScrolled(true); }}
                >
                  <div className="dsheet-content">

                    {/* Hero Credential Card */}
                    <div className="cert-hero-card">
                      <div className="cert-hero-badge" style={{ border: `1px solid ${accent}30` }}>
                        <div className="cert-hero-badge-bg" style={{ background: `linear-gradient(135deg, ${accent}20, ${accent}08)` }} />
                        <Award size={36} style={{ color: accent, position: 'relative', zIndex: 1 }} />
                      </div>
                      <div className="cert-hero-meta">
                        <div className="cert-hero-meta-row">
                          <ShieldCheck size={13} />
                          <span>Issued by <strong>{selectedCert.issuer}</strong></span>
                        </div>
                        <div className="cert-hero-meta-row">
                          <Award size={13} />
                          <span>Year <strong>{selectedCert.date}</strong></span>
                        </div>
                        <div className="cert-hero-meta-row">
                          <ExternalLink size={13} />
                          <span>Verified <strong style={{ color: '#10b981' }}>Credential</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <p className="dsheet-section-label">About</p>
                      <p className="dsheet-desc">{selectedCert.description}</p>
                    </div>

                    {/* Domain tags */}
                    <div>
                      <p className="dsheet-section-label">Domain</p>
                      <div className="cert-tags">
                        {['Machine Learning', 'Deep Learning', 'AI'].map(tag => (
                          <span key={tag} className="cert-detail-tag" style={{ color: accent, borderColor: accent + '30', background: accent + '10' }}>{tag}</span>
                        ))}
                      </div>
                    </div>

                    {/* Verify button */}
                    <a href={selectedCert.credentialUrl} target="_blank" rel="noreferrer" className="dsheet-action" style={{ background: `linear-gradient(135deg, ${accent} 0%, ${accent}cc 100%)` }}>
                      <ShieldCheck size={18} /> Verify Credential
                    </a>
                  </div>

                  <AnimatePresence>
                    {sheetScrollable && !sheetScrolled && (
                      <motion.div className="dsheet-scroll-hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                        <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: '2px' }}>Scroll</span>
                          <ChevronDown size={16} />
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
            );
          })()}
        </AnimatePresence>,
        document.body
      )}
      </>
      )}
    </ScrollReveal>
  );
}
