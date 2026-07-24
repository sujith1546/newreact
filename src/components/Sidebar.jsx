import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { QrCode, Download, MapPin, Loader2, CheckCircle, FileText, Eye, X, Cpu, Layers, Wifi, RefreshCw, ExternalLink, ShieldCheck, FileDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ResumeQuickLook from './ResumeQuickLook';
import { useLocalTime } from '../hooks/useLocalTime';
import QRModal from './QRModal';
import { useTheme } from '../context/ThemeContext';
import { usePersona } from '../context/PersonaContext';
import useRealtimeData from '../hooks/useRealtimeData';
import { useIsland } from '../context/IslandContext';

function GmailIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M3 5h18v14H3z" />
      <path d="M3 5l9 8 9-8" />
    </svg>
  );
}

function LinkedinIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
    </svg>
  );
}

function WhatsappIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

function InstagramIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

const NAV_ITEMS_DEF = [
  { label: 'HOME', id: 'home' },
  { label: 'ABOUT', id: 'about' },
  { label: 'SKILLS', id: 'skills' },
  { label: 'PROJECTS', id: 'projects' },
  { label: 'EDUCATION', id: 'education' },
  { label: 'EXPERIENCE', id: 'experience' },
  { label: 'CERTIFICATIONS', id: 'certifications' },
  { label: 'CONTACT', id: 'contact' },
];

export default function Sidebar({ activeSection, onNavClick }) {
  const { data: dbSettings } = useRealtimeData('site_settings', { single: true, filter: { column: 'id', value: 1 } });
  const { getSectionOrder } = usePersona();
  
  const baseItems = NAV_ITEMS_DEF.filter(item => {
    if (item.id === 'experience' && dbSettings?.feature_experience === false) return false;
    if (item.id === 'certifications' && dbSettings?.feature_certifications === false) return false;
    return true;
  });
  
  const NAV_ITEMS = getSectionOrder(baseItems);

  const localTime = useLocalTime();
  const { theme } = useTheme();
  const [qrOpen, setQrOpen] = useState(false);
  const [toastStatus, setToastStatus] = useState(null); // null, 'packaging', 'ready'
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isMainPage = location.pathname === '/';

  // Secret 5-click admin login trigger
  const [clickCount, setClickCount] = useState(0);
  const clickTimerRef = useRef(null);

  const handleSecretAdminClick = () => {
    setClickCount((prev) => {
      const newCount = prev + 1;
      if (newCount === 5) {
        navigate('/admin/login');
        return 0; // Reset
      }
      return newCount;
    });

    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }
    clickTimerRef.current = setTimeout(() => {
      setClickCount(0); // Reset after 1.5 seconds of inactivity
    }, 1500);
  };

  useEffect(() => {
    const handleOpenResume = () => setIsPreviewOpen(true);
    const handleOpenQr = () => setQrOpen(true);
    window.addEventListener('open-resume', handleOpenResume);
    window.addEventListener('open-qr', handleOpenQr);
    return () => {
      window.removeEventListener('open-resume', handleOpenResume);
      window.removeEventListener('open-qr', handleOpenQr);
    };
  }, []);

  const { triggerIsland } = useIsland();

  const handleDownloadClick = (e) => {
    if (e) e.preventDefault();
    setIsActionModalOpen(false);

    // Initial Island state: Downloading
    triggerIsland({
      title: 'Downloading Resume',
      subtitle: 'Packaging latest version...',
      icon: <FileDown size={18} strokeWidth={2.5} />,
      color: '#3b82f6',
      duration: 0 // Keep open until finished
    });
    
    // Simulate complex packaging process
    setTimeout(() => {
      // Trigger actual file download
      const link = document.createElement('a');
      link.href = '/resume.pdf';
      link.download = 'resume.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Final Island state: Success
      triggerIsland({
        title: 'Download Complete',
        subtitle: 'Resume saved successfully',
        icon: <Check size={18} strokeWidth={3} />,
        color: '#10b981',
        duration: 3500
      });
    }, 1800);
  };

  const handleWhatsAppShare = async () => {
    try {
      // 1. Advanced: Attempt to attach the actual PDF file natively (Works on Mobile/Supported Desktop)
      const response = await fetch('/resume.pdf');
      const blob = await response.blob();
      const file = new File([blob], 'Sujith_Thota_Resume.pdf', { type: 'application/pdf' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Sujith Thota - Resume',
          text: "Hi! Here's my resume."
        });
        setIsActionModalOpen(false);
        return; // Success! File was sent.
      }
    } catch (error) {
      console.log('Native file sharing not supported or failed.', error);
    }

    // 2. Fallback: If on Desktop/Unsupported, use wa.me text link.
    // Intelligently prevent sharing "localhost" links which don't work for others.
    const origin = window.location.origin.includes('localhost')
      ? 'https://sujith-portfolio.com' // NOTE: Replace this with your actual live domain later!
      : window.location.origin;

    const resumeUrl = `${origin}/resume.pdf`;
    const message = `Hi! Here's my resume: ${resumeUrl}`;
    const encodedMessage = encodeURIComponent(message);
    
    // wa.me works on both mobile (opens app) and desktop (opens WhatsApp Web)
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
    setIsActionModalOpen(false);
  };

  return (
    <aside className="sidebar">
      <div 
        className="sidebar-avatar-container" 
        onClick={handleSecretAdminClick}
        onDoubleClick={() => setIsProfileModalOpen(true)}
      >
        <img src="/profile_photo.png" alt="Sujith Thota" />
        <div className="sidebar-avatar-overlay">
          <Eye size={18} />
          <span>Double-Click</span>
        </div>
      </div>
      <h2>Sujith Thota</h2>
      <p className="sidebar-title" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
        <MapPin size={13} />
        Vellore, India · {localTime}
      </p>

      <ul>
        {NAV_ITEMS.map(({ label, id }) => (
          <li key={id}>
            {isMainPage ? (
              <a
                href={`#${id}`}
                className={activeSection === id ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); onNavClick(id); }}
              >
                {label}
              </a>
            ) : (
              <Link to="/" onClick={() => setTimeout(() => onNavClick?.(id), 100)}>
                {label}
              </Link>
            )}
          </li>
        ))}
      </ul>

      {/* --- divider between nav and actions --- */}
      <div className="sidebar-divider"></div>

      <button
        onClick={() => setQrOpen(true)}
        style={{
          background: "#111111",
          color: "#ffffff",
          border: "none",
          borderRadius: "10px",
          padding: "11px 20px",
          fontSize: "14px",
          fontWeight: 500,
          width: "100%",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          cursor: "pointer",
          transition: "transform 0.15s ease, background 0.15s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#222222")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "#111111")}
      >
        <QrCode size={16} />
        Share Portfolio
      </button>

      {/* --- Advanced Resume Action Trigger --- */}
      <div style={{ position: 'relative', width: '100%' }}>
        <button 
          className="resume-btn" 
          onClick={() => setIsActionModalOpen(true)}
        >
          <FileText size={16} />
          Resume
        </button>
      </div>

      {/* Glassmorphism Download Toast */}
      {createPortal(
        <AnimatePresence>
          {toastStatus && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 200, damping: 20 }}
              style={{
                position: 'fixed',
                top: '80px',
                right: '32px',
                zIndex: 99999,
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: toastStatus === 'packaging' ? 'rgba(17, 24, 39, 0.92)' : 'rgba(16, 185, 129, 0.92)',
                backdropFilter: 'blur(var(--glass-blur, 12px))',
                WebkitbackdropFilter: 'blur(var(--glass-blur, 12px))',
                color: '#fff',
                padding: '12px 20px',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.15), inset 0 1px 1px rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {toastStatus === 'packaging' ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                  <Loader2 size={18} />
                </motion.div>
              ) : (
                <CheckCircle size={18} />
              )}
              <span style={{ fontSize: '13.5px', fontWeight: 500, letterSpacing: '0.2px' }}>
                {toastStatus === 'packaging' ? 'Packaging Artifacts...' : 'Download Complete'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Graphical Action Modal */}
      {createPortal(
        <AnimatePresence>
          {isActionModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 999999,
                background: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(var(--glass-blur, 12px))',
                WebkitbackdropFilter: 'blur(var(--glass-blur, 12px))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
              }}
              onClick={() => setIsActionModalOpen(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: 'relative',
                  background: 'var(--bg-secondary)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '24px',
                  maxWidth: '420px',
                  width: '90%',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                  textAlign: 'left'
                }}
              >
                {/* Close Button */}
                <button
                  onClick={() => setIsActionModalOpen(false)}
                  style={{
                    position: 'absolute',
                    top: '14px',
                    right: '14px',
                    background: 'rgba(128,128,128,0.05)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--text-secondary)',
                    transition: 'background 0.2s, color 0.2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(128,128,128,0.15)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(128,128,128,0.05)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  <X size={16} />
                </button>

                <h3 style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: 600, margin: '0 0 4px 0' }}>Resume Options</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '0 0 20px 0' }}>How would you like to proceed?</p>
                
                <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                  
                  {/* PREVIEW BUTTON */}
                  <motion.button
                    whileHover={{ backgroundColor: 'rgba(128,128,128,0.1)', borderColor: '#9ca3af' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setIsActionModalOpen(false); setIsPreviewOpen(true); }}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '8px 12px',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                      background: 'var(--bg-secondary)',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      outline: 'none',
                      transition: 'background-color 0.2s, border-color 0.2s'
                    }}
                  >
                    <Eye size={16} />
                    Quick look
                  </motion.button>

                  {/* DOWNLOAD BUTTON */}
                  <motion.button
                    whileHover={{ backgroundColor: 'rgba(128,128,128,0.1)', borderColor: '#9ca3af' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setIsActionModalOpen(false); handleDownloadClick(); }}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '8px 12px',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                      background: 'var(--bg-secondary)',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      outline: 'none',
                      transition: 'background-color 0.2s, border-color 0.2s'
                    }}
                  >
                    <Download size={16} />
                    Download
                  </motion.button>
                </div>

                {/* WHATSAPP SHARE BUTTON */}
                <motion.button
                  whileHover={{ backgroundColor: 'rgba(34, 197, 94, 0.2)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleWhatsAppShare}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#15803d', // Tailwind green-700
                    background: 'rgba(34, 197, 94, 0.1)', // Tailwind green-50 approximation
                    border: '1px solid rgba(34, 197, 94, 0.4)', // Tailwind green-300 approximation
                    borderRadius: '6px',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'all 0.2s',
                    marginTop: '8px'
                  }}
                >
                  <WhatsappIcon size={16} />
                  Share via WhatsApp
                </motion.button>

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Glassmorphism Resume Preview Modal */}
      {isPreviewOpen && (
        <ResumeQuickLook
          fileUrl="/resume.pdf"
          fileName="Thota_Sujith_Resume.pdf"
          onClose={() => setIsPreviewOpen(false)}
          onShare={handleWhatsAppShare}
          onDownload={handleDownloadClick}
        />
      )}

      <div className="social-icons-row">
        <a className="social-icon-box" href="mailto:sujithreddy1546@gmail.com" target="_blank" rel="noopener noreferrer" title="Gmail">
          <GmailIcon size={20} />
        </a>
        <a className="social-icon-box" href="https://www.linkedin.com/in/thota-sujith-reddy-88a650275/" target="_blank" rel="noopener noreferrer" title="LinkedIn">
          <LinkedinIcon size={20} />
        </a>
        <a className="social-icon-box" href="https://www.instagram.com/sujith_1546/" target="_blank" rel="noopener noreferrer" title="Instagram">
          <InstagramIcon size={20} />
        </a>
      </div>

      {/* Build Tag Footer */}
      <div className="sidebar-build-tag">
        <div className="sidebar-build-updated">
          Last updated: {new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}
        </div>
      </div>

      <p className="sidebar-copyright">
        &copy; {new Date().getFullYear()} All Rights Reserved Sujith
      </p>

      <QRModal 
        isOpen={qrOpen} 
        onClose={() => setQrOpen(false)} 
        shareUrl={window.location.href}
        title="Share your portfolio"
        contactName="Sujith Thota"
        contactRole="Data Science Enthusiast · VIT"
        contactEmail="sujithreddy1546@gmail.com"
        contactPhone="+918501889996"
      />

      {/* Profile Photo Modal */}
      {createPortal(
        <AnimatePresence>
          {isProfileModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="avatar-modal-overlay"
              onClick={() => setIsProfileModalOpen(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="avatar-modal-container"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button 
                  className="avatar-modal-close"
                  onClick={() => setIsProfileModalOpen(false)}
                  aria-label="Close Preview"
                >
                  <X size={18} />
                </button>
                
                {/* Large Profile Image */}
                <img src="/profile_photo.png" alt="Sujith Thota Large" className="avatar-modal-img" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </aside>
  );
}
