import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Megaphone,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  X,
  ExternalLink
} from 'lucide-react';
import useRealtimeData from '../../hooks/useRealtimeData';

const TYPE_CONFIG = {
  info: {
    gradient: 'linear-gradient(90deg, #1e3a8a 0%, #2563eb 50%, #4f46e5 100%)',
    borderTop: '1px solid rgba(147, 197, 253, 0.4)',
    glow: '0 -4px 20px rgba(37, 99, 235, 0.25)',
    badgeBg: 'rgba(255, 255, 255, 0.18)',
    badgeText: '#ffffff',
    badgeLabel: 'NOTICE',
    Icon: Megaphone,
  },
  success: {
    gradient: 'linear-gradient(90deg, #064e3b 0%, #059669 50%, #10b981 100%)',
    borderTop: '1px solid rgba(110, 231, 183, 0.45)',
    glow: '0 -4px 20px rgba(16, 185, 129, 0.25)',
    badgeBg: 'rgba(255, 255, 255, 0.2)',
    badgeText: '#ffffff',
    badgeLabel: 'UPDATE',
    Icon: CheckCircle2,
  },
  warning: {
    gradient: 'linear-gradient(90deg, #78350f 0%, #d97706 50%, #f59e0b 100%)',
    borderTop: '1px solid rgba(253, 230, 138, 0.45)',
    glow: '0 -4px 20px rgba(245, 158, 11, 0.25)',
    badgeBg: 'rgba(0, 0, 0, 0.2)',
    badgeText: '#ffffff',
    badgeLabel: 'ALERT',
    Icon: AlertTriangle,
  },
  error: {
    gradient: 'linear-gradient(90deg, #881337 0%, #dc2626 50%, #f43f5e 100%)',
    borderTop: '1px solid rgba(254, 205, 211, 0.45)',
    glow: '0 -4px 20px rgba(220, 38, 38, 0.25)',
    badgeBg: 'rgba(255, 255, 255, 0.2)',
    badgeText: '#ffffff',
    badgeLabel: 'CRITICAL',
    Icon: AlertCircle,
  },
  promo: {
    gradient: 'linear-gradient(90deg, #4c1d95 0%, #7c3aed 50%, #ec4899 100%)',
    borderTop: '1px solid rgba(244, 114, 182, 0.45)',
    glow: '0 -4px 20px rgba(236, 72, 153, 0.25)',
    badgeBg: 'rgba(255, 255, 255, 0.22)',
    badgeText: '#ffffff',
    badgeLabel: 'SPECIAL',
    Icon: Sparkles,
  },
};

export default function AnnouncementBanner() {
  const location = useLocation();
  const { data: dbSettings } = useRealtimeData('site_settings', { single: true, filter: { column: 'id', value: 1 } });
  const [isDismissed, setIsDismissed] = useState(false);

  const announcementEnabled = dbSettings?.announcement_enabled ?? false;
  const announcementText = dbSettings?.announcement_text?.trim() || '';
  const announcementType = (dbSettings?.announcement_type || 'info').toLowerCase();
  const announcementUrl = dbSettings?.announcement_url?.trim() || '';

  // Generate storage key based on current announcement content
  const storageKey = `announcement_dismissed_${announcementText}`;

  useEffect(() => {
    if (typeof window !== 'undefined' && announcementText) {
      const dismissed = sessionStorage.getItem(storageKey) === 'true';
      setIsDismissed(dismissed);
    }
  }, [storageKey, announcementText]);

  const handleDismiss = (e) => {
    e.stopPropagation();
    setIsDismissed(true);
    try {
      sessionStorage.setItem(storageKey, 'true');
    } catch (_) {}
  };

  // Hide in Admin Dashboard or if not enabled / no text / dismissed
  const isAdminRoute = location.pathname.startsWith('/admin');
  if (isAdminRoute || !announcementEnabled || !announcementText || isDismissed) {
    return null;
  }

  const config = TYPE_CONFIG[announcementType] || TYPE_CONFIG.info;
  const { Icon } = config;

  return (
    <AnimatePresence>
      <motion.aside
        role="region"
        aria-label="Site announcement"
        className="site-announcement-strip"
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', stiffness: 360, damping: 32 }}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          width: '100%',
          zIndex: 1500,
          background: config.gradient,
          borderTop: config.borderTop,
          boxShadow: config.glow,
          color: '#ffffff',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <style>{`
          .site-announcement-strip {
            padding: 8px 16px;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .site-announcement-inner {
            max-width: 1200px;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
          }
          .site-announcement-content {
            display: flex;
            align-items: center;
            gap: 10px;
            flex: 1;
            min-width: 0;
            justify-content: center;
          }
          .site-announcement-badge {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            padding: 2.5px 8px;
            border-radius: 999px;
            font-size: 10.5px;
            font-weight: 700;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            flex-shrink: 0;
            white-space: nowrap;
          }
          .site-announcement-pulse-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #ffffff;
            animation: announcementPulse 1.8s infinite ease-in-out;
          }
          @keyframes announcementPulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.4; transform: scale(0.75); }
          }
          .site-announcement-text {
            font-size: 13px;
            font-weight: 500;
            line-height: 1.4;
            color: #ffffff;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .site-announcement-link {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            font-size: 12px;
            font-weight: 600;
            color: #ffffff;
            background: rgba(255, 255, 255, 0.22);
            padding: 3px 10px;
            border-radius: 999px;
            text-decoration: none;
            flex-shrink: 0;
            transition: all 0.18s ease;
            border: 1px solid rgba(255, 255, 255, 0.25);
          }
          .site-announcement-link:hover {
            background: rgba(255, 255, 255, 0.32);
            transform: translateY(-1px);
          }
          .site-announcement-dismiss {
            background: transparent;
            border: none;
            color: rgba(255, 255, 255, 0.8);
            cursor: pointer;
            padding: 4px;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            transition: all 0.15s ease;
          }
          .site-announcement-dismiss:hover {
            color: #ffffff;
            background: rgba(255, 255, 255, 0.2);
            transform: scale(1.1);
          }

          @media (max-width: 768px) {
            .site-announcement-strip {
              bottom: calc(68px + env(safe-area-inset-bottom, 0px)) !important;
              left: 12px !important;
              right: 12px !important;
              width: calc(100% - 24px) !important;
              border-radius: 14px !important;
              padding: 7px 12px !important;
              border: 1px solid rgba(255, 255, 255, 0.25) !important;
              margin: 0 auto !important;
              max-width: 480px !important;
            }
            .site-announcement-text {
              font-size: 12px !important;
            }
            .site-announcement-badge {
              display: none !important;
            }
          }
        `}</style>

        <div className="site-announcement-inner">
          <div className="site-announcement-content">
            <span
              className="site-announcement-badge"
              style={{
                background: config.badgeBg,
                color: config.badgeText,
              }}
            >
              <span className="site-announcement-pulse-dot" />
              <span>{config.badgeLabel}</span>
            </span>

            <Icon size={15} style={{ flexShrink: 0, opacity: 0.95 }} />

            <span className="site-announcement-text">
              {announcementText}
            </span>

            {announcementUrl && (
              <a
                href={announcementUrl}
                target={announcementUrl.startsWith('http') ? '_blank' : '_self'}
                rel={announcementUrl.startsWith('http') ? 'noopener noreferrer' : ''}
                className="site-announcement-link"
              >
                <span>Learn more</span>
                {announcementUrl.startsWith('http') ? <ExternalLink size={11} /> : <ArrowRight size={11} />}
              </a>
            )}
          </div>

          <button
            type="button"
            className="site-announcement-dismiss"
            onClick={handleDismiss}
            aria-label="Dismiss announcement"
            title="Dismiss announcement"
          >
            <X size={14} />
          </button>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
