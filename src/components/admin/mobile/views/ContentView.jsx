import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProjectsPanel from '../../panels/ProjectsPanel';
import UpdatesPanel from '../../panels/UpdatesPanel';
import SkillsPanel from '../../panels/SkillsPanel';
import ExperiencePanel from '../../panels/ExperiencePanel';
import EducationPanel from '../../panels/EducationPanel';
import CertificationsPanel from '../../panels/CertificationsPanel';
import PortfolioPreviewPanel from '../../panels/PortfolioPreviewPanel';
import haptic from '../../../../lib/haptics';

const CONTENT_TABS = [
  { key: 'projects', label: 'Projects', icon: 'ti-briefcase' },
  { key: 'updates', label: 'Updates', icon: 'ti-bolt' },
  { key: 'skills', label: 'Skills', icon: 'ti-star' },
  { key: 'experience', label: 'Experience', icon: 'ti-id-badge' },
  { key: 'education', label: 'Education', icon: 'ti-book' },
  { key: 'certifications', label: 'Certifications', icon: 'ti-certificate' },
  { key: 'preview', label: 'Preview', icon: 'ti-eye' },
];

export default function ContentView({ activeSubTab = 'projects', onSelectSubTab }) {
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);

  const currentIndex = CONTENT_TABS.findIndex((t) => t.key === activeSubTab);

  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (!touchStartXRef.current) return;
    const diffX = e.changedTouches[0].clientX - touchStartXRef.current;
    const diffY = e.changedTouches[0].clientY - touchStartYRef.current;

    // Only trigger if horizontal swipe is dominant
    if (Math.abs(diffX) > 60 && Math.abs(diffX) > Math.abs(diffY) * 1.5) {
      if (diffX < 0 && currentIndex < CONTENT_TABS.length - 1) {
        haptic.light();
        onSelectSubTab(CONTENT_TABS[currentIndex + 1].key);
      } else if (diffX > 0 && currentIndex > 0) {
        haptic.light();
        onSelectSubTab(CONTENT_TABS[currentIndex - 1].key);
      }
    }
    touchStartXRef.current = 0;
    touchStartYRef.current = 0;
  };

  return (
    <div className="admin-mobile-view" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
      {/* Horizontal Apple-Style Sub-tab Bar */}
      <div style={{
        display: 'flex',
        gap: 6,
        padding: '8px 12px',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.08))',
        background: 'var(--bg-secondary, #18191d)',
        flexShrink: 0,
      }}>
        {CONTENT_TABS.map((tab) => {
          const isActive = activeSubTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                haptic.light();
                onSelectSubTab(tab.key);
              }}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 18,
                border: 'none',
                background: 'transparent',
                color: isActive ? 'var(--primary-blue, #3b82f6)' : 'var(--text-muted, #94a3b8)',
                fontSize: 11.5,
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'color 0.15s ease',
                flexShrink: 0,
              }}
            >
              {isActive ? (
                <motion.div
                  layoutId="contentSubTabPill"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 18,
                    background: 'var(--primary-blue-subtle, rgba(59, 130, 246, 0.12))',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    zIndex: 0,
                  }}
                />
              ) : (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 18,
                    background: 'var(--bg-primary, rgba(255,255,255,0.04))',
                    border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
                    zIndex: 0,
                  }}
                />
              )}
              <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                <i className={`ti ${tab.icon}`} style={{ fontSize: 13, opacity: isActive ? 1 : 0.7 }} />
                <span>{tab.label}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Swipeable View Content with Touch Left/Right Gestures */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="admin-subtab-content"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding: '12px 14px 130px',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSubTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{ width: '100%' }}
          >
            {activeSubTab === 'projects' && <ProjectsPanel />}
            {activeSubTab === 'updates' && <UpdatesPanel />}
            {activeSubTab === 'skills' && <SkillsPanel />}
            {activeSubTab === 'experience' && <ExperiencePanel />}
            {activeSubTab === 'education' && <EducationPanel />}
            {activeSubTab === 'certifications' && <CertificationsPanel />}
            {activeSubTab === 'preview' && <PortfolioPreviewPanel />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
