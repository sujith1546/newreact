import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, Tablet, Monitor, RotateCw, Lock, ExternalLink, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react';

const DEVICES = [
  { id: 'iphone', name: 'iPhone 16 Pro', width: 393, height: 852, type: 'phone' },
  { id: 'pixel', name: 'Pixel 9 Pro', width: 412, height: 915, type: 'phone' },
  { id: 'ipad', name: 'iPad Air', width: 768, height: 1024, type: 'tablet' }
];

export default function MobilePreviewModal({ isOpen, onClose }) {
  const [selectedDevice, setSelectedDevice] = useState('iphone');
  const [isLandscape, setIsLandscape] = useState(false);
  const [scale, setScale] = useState(0.85);

  const device = DEVICES.find((d) => d.id === selectedDevice) || DEVICES[0];
  const frameWidth = isLandscape ? device.height : device.width;
  const frameHeight = isLandscape ? device.width : device.height;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-preview-title"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
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

          {/* Modal Container */}
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 12 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '920px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '24px',
              border: '1px solid var(--border-color)',
              padding: '20px 24px',
              boxShadow: '0 30px 80px rgba(0, 0, 0, 0.5)',
              zIndex: 1000000,
              height: '90vh',
              maxHeight: '900px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {/* Top Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  backgroundColor: 'color-mix(in srgb, var(--primary-blue) 12%, var(--bg-primary))',
                  border: '1px solid var(--border-color)',
                  color: 'var(--primary-blue)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Smartphone size={20} />
                </div>
                <div>
                  <h3 id="mobile-preview-title" style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Mobile View & Device Simulator
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                    Live responsive viewport & frame inspector
                  </p>
                </div>
              </div>

              {/* Device Selector Chips */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--bg-primary)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                {DEVICES.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedDevice(d.id)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '11.5px',
                      fontWeight: selectedDevice === d.id ? 700 : 500,
                      backgroundColor: selectedDevice === d.id ? 'var(--primary-blue)' : 'transparent',
                      color: selectedDevice === d.id ? '#ffffff' : 'var(--text-secondary)',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {d.type === 'tablet' ? <Tablet size={13} /> : <Smartphone size={13} />}
                    {d.name}
                  </button>
                ))}
              </div>

              {/* Orientation & Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsLandscape(!isLandscape)}
                  title="Rotate Device Orientation"
                  style={{
                    padding: '8px 12px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <RotateCw size={14} />
                  {isLandscape ? 'Landscape' : 'Portrait'}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    padding: '6px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Address Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '10px',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              marginBottom: '16px',
              fontSize: '11.5px',
              color: 'var(--text-secondary)',
              fontFamily: 'monospace'
            }}>
              <Lock size={12} color="#10b981" />
              <span>https://sujiththota.dev/</span>
              <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                ({frameWidth} × {frameHeight} px)
              </span>
            </div>

            {/* Device Viewport Stage */}
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'auto',
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderRadius: '16px',
              border: '1px solid var(--border-color)',
              padding: '24px'
            }}>
              {/* Phone Mockup Frame */}
              <div
                style={{
                  position: 'relative',
                  width: `${frameWidth * scale}px`,
                  height: `${frameHeight * scale}px`,
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  borderRadius: selectedDevice === 'ipad' ? '28px' : '44px',
                  backgroundColor: '#111',
                  padding: '12px',
                  boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 0 2px rgba(255,255,255,0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden'
                }}
              >
                {/* iPhone Dynamic Island Notch */}
                {selectedDevice === 'iphone' && !isLandscape && (
                  <div style={{
                    position: 'absolute',
                    top: '18px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '90px',
                    height: '24px',
                    backgroundColor: '#000',
                    borderRadius: '20px',
                    zIndex: 100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingRight: '8px'
                  }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0f2b1d', border: '1px solid #10b981' }} />
                  </div>
                )}

                {/* Viewport Frame */}
                <div style={{
                  flex: 1,
                  width: '100%',
                  height: '100%',
                  borderRadius: selectedDevice === 'ipad' ? '18px' : '34px',
                  overflow: 'hidden',
                  backgroundColor: 'var(--bg-secondary)'
                }}>
                  <iframe
                    src={window.location.href}
                    title="Mobile View Preview"
                    style={{
                      width: `${frameWidth}px`,
                      height: `${frameHeight}px`,
                      border: 'none',
                      transform: `scale(${scale})`,
                      transformOrigin: '0 0'
                    }}
                  />
                </div>

                {/* Home Indicator Bar */}
                {!isLandscape && (
                  <div style={{
                    width: '120px',
                    height: '4px',
                    backgroundColor: 'rgba(255,255,255,0.4)',
                    borderRadius: '999px',
                    margin: '8px auto 0'
                  }} />
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
