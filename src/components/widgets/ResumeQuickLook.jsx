import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Printer, Download, X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, FileText, 
  Sparkles, CheckCircle2, ShieldCheck, Share2, Copy, Check, Eye, Maximize2, Minimize2, Briefcase, Award, GraduationCap, Cpu
} from 'lucide-react';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function WhatsappIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

const STORAGE_KEY = 'resumeViewerPrefs';
const MIN_SCALE = 0.5;
const MAX_SCALE = 2.5;
const ZOOM_STEP = 0.15;

function loadPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function savePrefs(prefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // fail silently
  }
}

export default function ResumeQuickLook({ fileUrl, fileName = 'Sujith_Thota_Resume.pdf', onClose, onShare, onDownload }) {
  const [activeTab, setActiveTab] = useState('pdf'); // 'pdf' | 'ats' | 'highlights'
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(() => loadPrefs().pageNumber || 1);
  const [scale, setScale] = useState(() => loadPrefs().scale || 1);
  const [hasManualZoom, setHasManualZoom] = useState(() => Boolean(loadPrefs().scale));
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const mainViewRef = useRef(null);
  const pageWidthRef = useRef(null);

  useEffect(() => {
    savePrefs({ pageNumber, ...(hasManualZoom ? { scale } : {}) });
  }, [pageNumber, scale, hasManualZoom]);

  // Auto fit-width
  useEffect(() => {
    const el = mainViewRef.current;
    if (!el) return;

    const applyFitWidth = () => {
      if (!hasManualZoom && pageWidthRef.current) {
        const fit = (el.clientWidth - 48) / pageWidthRef.current;
        setScale(Math.min(MAX_SCALE, Math.max(MIN_SCALE, fit)));
      }
    };

    applyFitWidth();
    const observer = new ResizeObserver(applyFitWidth);
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasManualZoom]);

  const handlePageLoadSuccess = useCallback((page) => {
    if (!pageWidthRef.current) {
      pageWidthRef.current = page.originalWidth;
      if (!hasManualZoom && mainViewRef.current) {
        const fit = (mainViewRef.current.clientWidth - 48) / page.originalWidth;
        setScale(Math.min(MAX_SCALE, Math.max(MIN_SCALE, fit)));
      }
    }
  }, [hasManualZoom]);

  const goToPage = useCallback((next) => {
    setPageNumber((p) => Math.min(Math.max(1, next(p)), numPages || 1));
  }, [numPages]);

  const zoomBy = useCallback((delta) => {
    setHasManualZoom(true);
    setScale((s) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, +(s + delta).toFixed(2))));
  }, []);

  const resetToFitWidth = useCallback(() => {
    setHasManualZoom(false);
  }, []);

  const handleCopyLink = () => {
    const url = window.location.origin + '/resume-preview';
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
      if (e.key === 'ArrowLeft') goToPage((p) => p - 1);
      if (e.key === 'ArrowRight') goToPage((p) => p + 1);
      if (e.key === '+' || e.key === '=') zoomBy(ZOOM_STEP);
      if (e.key === '-' || e.key === '_') zoomBy(-ZOOM_STEP);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPage, zoomBy, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Preview of ${fileName}`}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 999999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isFullscreen ? '0' : '1.25rem',
        }}
      >
        {/* Backdrop Blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        />

        {/* Modal Window */}
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 15 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'relative',
            width: isFullscreen ? '100vw' : '100%',
            maxWidth: isFullscreen ? '100vw' : '1100px',
            height: isFullscreen ? '100vh' : '90vh',
            maxHeight: isFullscreen ? '100vh' : '900px',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: isFullscreen ? '0' : '20px',
            border: isFullscreen ? 'none' : '1px solid var(--border-color)',
            boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
            zIndex: 1000000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Ambient Top Glow */}
          <div style={{
            position: 'absolute',
            top: '-60px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '400px',
            height: '140px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, color-mix(in srgb, var(--primary-blue) 30%, transparent) 0%, transparent 70%)',
            filter: 'blur(40px)',
            pointerEvents: 'none'
          }} />

          {/* Top Bar Header */}
          <div style={{
            padding: '14px 20px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            backgroundColor: 'var(--bg-secondary)',
            zIndex: 2
          }}>
            {/* Title & Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'color-mix(in srgb, var(--primary-blue) 14%, var(--bg-primary))',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary-blue)'
              }}>
                <FileText size={18} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                    {fileName}
                  </span>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    color: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <CheckCircle2 size={11} /> Verified ATS 96%
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Sujith Thota — Full-Stack & Data Science Specialist
                </div>
              </div>
            </div>

            {/* View Mode Switcher Tabs */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px',
              backgroundColor: 'var(--bg-primary)',
              borderRadius: '10px',
              border: '1px solid var(--border-color)'
            }}>
              <button
                type="button"
                onClick={() => setActiveTab('pdf')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '7px',
                  fontSize: '12px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: activeTab === 'pdf' ? 'var(--primary-blue)' : 'transparent',
                  color: activeTab === 'pdf' ? '#ffffff' : 'var(--text-secondary)',
                  transition: 'all 0.15s ease'
                }}
              >
                PDF View
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ats')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '7px',
                  fontSize: '12px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: activeTab === 'ats' ? 'var(--primary-blue)' : 'transparent',
                  color: activeTab === 'ats' ? '#ffffff' : 'var(--text-secondary)',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <Sparkles size={13} color={activeTab === 'ats' ? '#ffffff' : '#f59e0b'} /> ATS Audit
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('highlights')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '7px',
                  fontSize: '12px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: activeTab === 'highlights' ? 'var(--primary-blue)' : 'transparent',
                  color: activeTab === 'highlights' ? '#ffffff' : 'var(--text-secondary)',
                  transition: 'all 0.15s ease'
                }}
              >
                Key Summary
              </button>
            </div>

            {/* Top Toolbar Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                onClick={() => window.print()}
                title="Print Resume"
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <Printer size={15} />
              </button>

              <button
                type="button"
                onClick={onShare}
                title="Share on WhatsApp"
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(37, 211, 102, 0.12)',
                  border: '1px solid rgba(37, 211, 102, 0.25)',
                  color: '#25D366',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <WhatsappIcon size={16} />
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                title="Copy Share Link"
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  color: copied ? '#10b981' : 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
              </button>

              <button
                type="button"
                onClick={toggleFullscreen}
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen View'}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>

              <motion.button
                type="button"
                onClick={onDownload}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  height: '34px',
                  padding: '0 14px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, var(--primary-blue) 0%, #1d4ed8 100%)',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px color-mix(in srgb, var(--primary-blue) 35%, transparent)'
                }}
              >
                <Download size={14} />
                <span>Download PDF</span>
              </motion.button>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  marginLeft: '4px'
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Main Body View */}
          <div style={{ flex: 1, display: 'flex', minHeight: 0, backgroundColor: 'var(--bg-primary)', overflow: 'hidden' }}>
            {/* Sidebar Thumbnails (PDF Mode only) */}
            {activeTab === 'pdf' && (
              <div style={{
                width: '100px',
                borderRight: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-secondary)',
                padding: '12px 8px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                alignItems: 'center'
              }}>
                <Document file={fileUrl}>
                  {Array.from({ length: numPages || 0 }, (_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPageNumber(i + 1)}
                      style={{
                        padding: '3px',
                        borderRadius: '6px',
                        backgroundColor: pageNumber === i + 1 ? 'color-mix(in srgb, var(--primary-blue) 15%, transparent)' : 'transparent',
                        border: pageNumber === i + 1 ? '2px solid var(--primary-blue)' : '1px solid var(--border-color)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Page pageNumber={i + 1} width={74} renderTextLayer={false} renderAnnotationLayer={false} />
                      <span style={{ fontSize: '10px', fontWeight: 700, color: pageNumber === i + 1 ? 'var(--primary-blue)' : 'var(--text-muted)' }}>
                        Page {i + 1}
                      </span>
                    </button>
                  ))}
                </Document>
              </div>
            )}

            {/* Center Canvas View */}
            <div ref={mainViewRef} style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', justifyContent: 'center' }}>
              {activeTab === 'pdf' && (
                <Document
                  file={fileUrl}
                  onLoadSuccess={({ numPages: total }) => setNumPages(total)}
                  loading={
                    <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: 'var(--text-muted)' }}>
                      <div className="spinner" />
                      <span style={{ fontSize: '13px' }}>Rendering Resume Document...</span>
                    </div>
                  }
                  error={
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      <p style={{ fontWeight: 700 }}>Unable to render PDF preview directly.</p>
                      <button
                        type="button"
                        onClick={onDownload}
                        style={{
                          marginTop: '12px',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          backgroundColor: 'var(--primary-blue)',
                          color: '#fff',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: 700
                        }}
                      >
                        Download PDF File Instead
                      </button>
                    </div>
                  }
                >
                  <Page
                    pageNumber={pageNumber}
                    scale={scale}
                    onLoadSuccess={handlePageLoadSuccess}
                  />
                </Document>
              )}

              {/* ATS Audit View Tab */}
              {activeTab === 'ats' && (
                <div style={{ width: '100%', maxWidth: '750px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ padding: '20px', borderRadius: '16px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary-blue)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        ATS Compatibility Matrix
                      </div>
                      <h4 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)', margin: '4px 0 0' }}>
                        96 / 100 — High Recruiter Match
                      </h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                        Parser test passed against Greenhouse, Lever, Workday, and BambooHR standards.
                      </p>
                    </div>

                    <div style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, color-mix(in srgb, #10b981 20%, transparent) 0%, transparent 70%)',
                      border: '3px solid #10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      fontWeight: 900,
                      color: '#10b981'
                    }}>
                      96%
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={15} color="#10b981" /> Keyword Density
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {['React.js', 'Python', 'FastAPI', 'Data Science', 'PostgreSQL', 'Groq LPU', 'RAG'].map((kw) => (
                          <span key={kw} style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ShieldCheck size={15} color="var(--primary-blue)" /> Structure & Format
                      </div>
                      <ul style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <li>Standard Single-Column Layout</li>
                        <li>Clean Text Layer Extraction</li>
                        <li>Quantified Impact Metrics</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Key Summary View Tab */}
              {activeTab === 'highlights' && (
                <div style={{ width: '100%', maxWidth: '750px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Briefcase size={15} color="var(--primary-blue)" /> Core Experience Highlights
                    </div>
                    <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                      Specializing in full-stack web applications, AI vector RAG systems, and data analytics pipelines. Developed high-throughput ML backends using FastAPI, Groq SDK, and Supabase.
                    </p>
                  </div>

                  <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <GraduationCap size={15} color="#8b5cf6" /> Academic & Certification Credentials
                    </div>
                    <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                      CGPA: <strong>8.7 / 10</strong> in Computer Science & Data Science. Certified in Machine Learning, Algorithmic Problem Solving (200+ Solved), and Cloud Architecture.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Floating Control Bar (PDF Mode) */}
          {activeTab === 'pdf' && (
            <div style={{
              padding: '10px 20px',
              backgroundColor: 'var(--bg-secondary)',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '14px',
              zIndex: 2
            }}>
              <button
                type="button"
                onClick={() => goToPage((p) => p - 1)}
                disabled={pageNumber <= 1}
                aria-label="Previous Page"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: pageNumber <= 1 ? 'not-allowed' : 'pointer',
                  opacity: pageNumber <= 1 ? 0.5 : 1
                }}
              >
                <ChevronLeft size={16} />
              </button>

              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                Page {pageNumber} of {numPages || '—'}
              </span>

              <button
                type="button"
                onClick={() => goToPage((p) => p + 1)}
                disabled={pageNumber >= (numPages || 1)}
                aria-label="Next Page"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: pageNumber >= (numPages || 1) ? 'not-allowed' : 'pointer',
                  opacity: pageNumber >= (numPages || 1) ? 0.5 : 1
                }}
              >
                <ChevronRight size={16} />
              </button>

              <div style={{ width: '1px', height: '18px', backgroundColor: 'var(--border-color)' }} />

              <button
                type="button"
                onClick={() => zoomBy(-ZOOM_STEP)}
                disabled={scale <= MIN_SCALE}
                title="Zoom Out"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <ZoomOut size={15} />
              </button>

              <button
                type="button"
                onClick={resetToFitWidth}
                title="Reset to Fit Width"
                style={{
                  padding: '0 10px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--primary-blue)',
                  fontSize: '12px',
                  fontWeight: 800,
                  fontFamily: 'monospace',
                  cursor: 'pointer'
                }}
              >
                {Math.round(scale * 100)}%
              </button>

              <button
                type="button"
                onClick={() => zoomBy(ZOOM_STEP)}
                disabled={scale >= MAX_SCALE}
                title="Zoom In"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <ZoomIn size={15} />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
