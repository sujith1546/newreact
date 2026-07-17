import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Printer, Download, X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, FileText } from 'lucide-react';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function WhatsappIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

const STORAGE_KEY = 'resumeViewerPrefs';
const MIN_SCALE = 0.5;
const MAX_SCALE = 2.5;
const ZOOM_STEP = 0.1;

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
    // storage unavailable, fail silently
  }
}

export default function ResumeQuickLook({ fileUrl, fileName = 'Resume.pdf', onClose, onShare, onDownload }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(() => loadPrefs().pageNumber || 1);
  const [scale, setScale] = useState(() => loadPrefs().scale || 1);
  const [hasManualZoom, setHasManualZoom] = useState(() => Boolean(loadPrefs().scale));
  const [containerWidth, setContainerWidth] = useState(600);

  const mainViewRef = useRef(null);
  const pageWidthRef = useRef(null); // natural page width at scale 1, set on first render

  // Persist page + zoom choices
  useEffect(() => {
    const prefs = { pageNumber };
    if (hasManualZoom) {
      prefs.scale = scale;
    }
    savePrefs(prefs);
  }, [pageNumber, scale, hasManualZoom]);

  // Recalculate fit-width on container resize, unless the user has manually zoomed
  useEffect(() => {
    const el = mainViewRef.current;
    if (!el) return;

    const applyFitWidth = () => {
      setContainerWidth(el.clientWidth);
      if (!hasManualZoom && pageWidthRef.current) {
        const fit = (el.clientWidth - 32) / pageWidthRef.current;
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
      // Trigger fit-width if we haven't manually zoomed
      if (!hasManualZoom && mainViewRef.current) {
         const fit = (mainViewRef.current.clientWidth - 32) / page.originalWidth;
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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
        return;
      }
      if (e.key === 'ArrowLeft') {
        goToPage((p) => p - 1);
        return;
      }
      if (e.key === 'ArrowRight') {
        goToPage((p) => p + 1);
        return;
      }
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        zoomBy(ZOOM_STEP);
        return;
      }
      if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        zoomBy(-ZOOM_STEP);
        return;
      }
      // Let browser handle native search
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPage, zoomBy, onClose]);

  return createPortal(
    <div className="resume-viewer-overlay" role="dialog" aria-modal="true" aria-label={`Preview of ${fileName}`} onClick={onClose}>
      <div className="resume-viewer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="viewer-toolbar">
          <div className="viewer-file-info">
            <FileText size={18} color="var(--primary-blue)" />
            <span className="viewer-file-name">{fileName}</span>
          </div>
          <div className="viewer-actions">
            <button onClick={() => window.print()} aria-label="Print">
              <Printer size={16} />
            </button>
            <button onClick={onShare} aria-label="Share on WhatsApp">
              <WhatsappIcon size={16} />
            </button>
            <button className="viewer-download-btn" onClick={onDownload} aria-label="Download">
              <Download size={16} />
              <span>Download</span>
            </button>
            <button onClick={onClose} aria-label="Close preview">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="viewer-body">
          <div className="viewer-thumbnails">
            <Document file={fileUrl}>
              {Array.from({ length: numPages || 0 }, (_, i) => (
                <button
                  key={i}
                  className={`viewer-thumb-btn ${pageNumber === i + 1 ? 'active' : ''}`}
                  onClick={() => setPageNumber(i + 1)}
                  aria-label={`Go to page ${i + 1}`}
                  aria-current={pageNumber === i + 1}
                >
                  <Page pageNumber={i + 1} width={64} renderTextLayer={false} renderAnnotationLayer={false} />
                  <span className="viewer-thumb-label">{i + 1}</span>
                </button>
              ))}
            </Document>
          </div>

          <div className="viewer-main" ref={mainViewRef}>
            <Document
              file={fileUrl}
              onLoadSuccess={({ numPages: total }) => setNumPages(total)}
              loading={<div className="viewer-loading">Loading resume…</div>}
              error={<div className="viewer-error">Couldn't load the PDF. Try downloading instead.</div>}
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                onLoadSuccess={handlePageLoadSuccess}
              />
            </Document>
          </div>
        </div>

        <div className="viewer-controls">
          <button onClick={() => goToPage((p) => p - 1)} disabled={pageNumber <= 1} aria-label="Previous page">
            <ChevronLeft size={16} />
          </button>
          <span className="viewer-page-indicator">
            Page {pageNumber} of {numPages || '—'}
          </span>
          <button onClick={() => goToPage((p) => p + 1)} disabled={pageNumber >= (numPages || 1)} aria-label="Next page">
            <ChevronRight size={16} />
          </button>

          <div className="viewer-controls-divider" />

          <button onClick={() => zoomBy(-ZOOM_STEP)} disabled={scale <= MIN_SCALE} aria-label="Zoom out">
            <ZoomOut size={16} />
          </button>
          <button className="viewer-zoom-readout" onClick={resetToFitWidth} title="Reset to fit width">
            {Math.round(scale * 100)}%
          </button>
          <button onClick={() => zoomBy(ZOOM_STEP)} disabled={scale >= MAX_SCALE} aria-label="Zoom in">
            <ZoomIn size={16} />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
