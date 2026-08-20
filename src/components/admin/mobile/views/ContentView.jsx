import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, Filter } from 'lucide-react';
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
  const [filterMode, setFilterMode] = useState('all');

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
        // Swipe Left -> Next Tab
        haptic.light();
        onSelectSubTab(CONTENT_TABS[currentIndex + 1].key);
      } else if (diffX > 0 && currentIndex > 0) {
        // Swipe Right -> Previous Tab
        haptic.light();
        onSelectSubTab(CONTENT_TABS[currentIndex - 1].key);
      }
    }
    touchStartXRef.current = 0;
    touchStartYRef.current = 0;
  };

  return (
    <div className="admin-mobile-view" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
      {/* Horizontal Carousel Sub-tab Bar with Animated Pill */}
      <div style={{
        display: 'flex',
        gap: 6,
        padding: '10px 14px',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        borderBottom: '1px solid var(--pcms-line-soft)',
        background: 'var(--pcms-bg-2)',
        flexShrink: 0,
      }}>
        {CONTENT_TABS.map((tab) => {
          const isActive = activeSubTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                haptic.light();
                onSelectSubTab(tab.key);
              }}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: '7px 13px',
                borderRadius: 20,
                border: 'none',
                background: 'transparent',
                color: isActive ? 'var(--pcms-accent)' : 'var(--pcms-muted)',
                fontSize: 12,
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
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 20,
                    background: 'var(--pcms-accent-dim)',
                    border: '1px solid var(--pcms-accent)',
                  }}
                />
              ) : (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 20,
                    background: 'var(--pcms-panel)',
                    border: '1px solid var(--pcms-line)',
                  }}
                />
              )}
              <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 7 }}>
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
          padding: '14px 14px 110px',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSubTab}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
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
