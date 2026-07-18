import { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollReveal from '../components/ScrollReveal';
import { Award, ExternalLink, ShieldCheck, X, ChevronDown } from 'lucide-react';
import { certificationsData } from '../data/certificationsData';

export default function Certifications() {
  const [isMobile, setIsMobile] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);
  const [sheetScrolled, setSheetScrolled] = useState(false);
  const [sheetScrollable, setSheetScrollable] = useState(false);
  const sheetContentRef = useRef(null);

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
        
        @media (max-width: 900px) {
          .certs-grid { display: none; /* Hide desktop grid */ }
          .mobile-certs-feed {
            display: flex; flex-direction: column; gap: 12px; width: 100%;
          }

          /* Compact horizontal mobile card */
          .mcert-card {
            background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 16px;
            display: flex; align-items: center; padding: 12px; gap: 14px;
            cursor: pointer; transition: background 0.15s; outline: none;
          }
          .mcert-card:active { background: var(--bg-primary); transform: scale(0.98); }
          
          .mcert-icon-wrap {
            width: 48px; height: 48px; border-radius: 12px;
            background: linear-gradient(135deg, #e0e7ff 0%, #fef08a 100%);
            display: flex; align-items: center; justify-content: center;
            flex-shrink: 0; position: relative; overflow: hidden;
            border: 1px solid rgba(0,0,0,0.05);
          }
          [data-theme="dark"] .mcert-icon-wrap { background: linear-gradient(135deg, #1e1b4b 0%, #713f12 100%); border-color: rgba(255,255,255,0.05); }
          .mcert-icon { color: rgba(0,0,0,0.5); z-index: 1; }
          [data-theme="dark"] .mcert-icon { color: rgba(255,255,255,0.8); }

          .mcert-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
          .mcert-title { font-size: 14.5px; font-weight: 700; color: var(--text-primary); margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; letter-spacing: -0.01em; }
          .mcert-issuer { font-size: 11px; font-weight: 700; color: var(--primary-blue); text-transform: uppercase; letter-spacing: 0.05em; margin: 0; }
          
          /* ============ ANIMATED DETAIL SHEET ============ */
          .dsheet-backdrop {
            position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); z-index: 10000;
          }
          [data-theme="dark"] .dsheet-backdrop { background: rgba(0,0,0,0.7); }
          .dsheet {
            position: fixed; left: 0; right: 0; bottom: 0; z-index: 10001;
            background: var(--bg-primary); border-radius: 28px 28px 0 0;
            box-shadow: 0 -10px 40px rgba(0,0,0,0.15); display: flex; flex-direction: column;
            max-height: 85vh; max-height: 85dvh;
          }
          .dsheet-handle {
            width: 40px; height: 4px; border-radius: 2px; background: var(--border-color);
            margin: 14px auto 0 auto; flex-shrink: 0;
          }
          .dsheet-header {
            display: flex; align-items: flex-start; justify-content: space-between;
            padding: 16px 20px 14px; border-bottom: 1px solid var(--border-color); flex-shrink: 0;
          }
          .dsheet-title h3 { font-size: 18px; font-weight: 700; color: var(--text-primary); margin: 0 0 6px 0; line-height: 1.25; letter-spacing: -0.02em; }
          .dsheet-title p { font-size: 11px; font-weight: 700; color: var(--primary-blue); text-transform: uppercase; letter-spacing: 0.06em; margin: 0; }
          .dsheet-close {
            width: 32px; height: 32px; border-radius: 16px; background: var(--bg-secondary);
            border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: center;
            color: var(--text-secondary); cursor: pointer; flex-shrink: 0;
          }
          .dsheet-body {
            flex: 1; overflow-y: auto; padding: 0; display: flex; flex-direction: column; position: relative;
          }
          .dsheet-body::-webkit-scrollbar { display: none; }
          .dsheet-content { padding: 20px; display: flex; flex-direction: column; gap: 20px; }
          
          .dsheet-image {
            width: 100%; height: 160px; border-radius: 16px; overflow: hidden; position: relative;
            background: linear-gradient(135deg, #e0e7ff 0%, #fef08a 100%);
            display: flex; align-items: center; justify-content: center;
            border: 1px solid rgba(0,0,0,0.05);
          }
          [data-theme="dark"] .dsheet-image { background: linear-gradient(135deg, #1e1b4b 0%, #713f12 100%); border-color: rgba(255,255,255,0.05); }
          .dsheet-image-icon { color: rgba(0,0,0,0.4); z-index: 1; }
          [data-theme="dark"] .dsheet-image-icon { color: rgba(255,255,255,0.7); }
          
          .dsheet-desc { font-size: 14.5px; color: var(--text-secondary); line-height: 1.6; margin: 0; }
          
          .dsheet-action {
            width: 100%; height: 50px; border-radius: 14px;
            background: var(--bg-secondary); border: 1px solid var(--border-color);
            display: flex; align-items: center; justify-content: center; gap: 8px;
            font-size: 14px; font-weight: 700; color: var(--text-primary); text-decoration: none;
            transition: background 0.2s, border-color 0.2s;
          }
          .dsheet-action:hover { background: var(--bg-primary); border-color: var(--primary-blue); }

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
        <p>
          Verified credentials that demonstrate my expertise and commitment to mastering cutting-edge technologies in data science and artificial intelligence.
        </p>
      </div>

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
          {certificationsData.map((cert) => (
            <button 
              key={cert.id} 
              className="mcert-card"
              onClick={() => setSelectedCert(cert)}
            >
              <div className="mcert-icon-wrap">
                <div className="mesh-gradient" />
                <Award size={20} className="mcert-icon" />
              </div>
              <div className="mcert-info">
                <h3 className="mcert-title">{cert.title}</h3>
                <p className="mcert-issuer">{cert.issuer}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ── DETAIL SHEET (Mobile) ── */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedCert && (
            <div style={{ position: 'relative', zIndex: 9999 }}>
              <motion.div
                className="dsheet-backdrop"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSelectedCert(null)}
              />
              <motion.div
                className="dsheet"
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: 0.4 }}
                onDragEnd={(_, info) => { if (info.offset.y > 120 || info.velocity.y > 600) setSelectedCert(null); }}
              >
                <div className="dsheet-handle" />

                <div className="dsheet-header">
                  <div className="dsheet-title">
                    <h3>{selectedCert.title}</h3>
                    <p>{selectedCert.issuer}</p>
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
                    <div className="dsheet-image">
                      <div className="mesh-gradient" />
                      <Award size={56} className="dsheet-image-icon" />
                    </div>

                    <p className="dsheet-desc">{selectedCert.description}</p>
                    
                    <a href={selectedCert.credentialUrl} target="_blank" rel="noreferrer" className="dsheet-action">
                      Verify Credential <ExternalLink size={16} />
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
          )}
        </AnimatePresence>,
        document.body
      )}
    </ScrollReveal>
  );
}
