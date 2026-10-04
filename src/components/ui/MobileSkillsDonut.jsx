// src/components/ui/MobileSkillsDonut.jsx
// Mobile-only Skills section redesign (React + Vite portfolio).
// Screen 1: One continuous SVG donut chart + accessible tappable category list
// Screen 2: Slide-up CategorySheet (70-75% height) with horizontal skill rings
// Drill-down: Tapping a skill opens the existing SkillDetailDrawer component directly.

import { useState, useEffect, useCallback, useMemo } from 'react';
import SkillsDonut from './SkillsDonut';
import CategorySheet from './CategorySheet';
import SkillDetailDrawer from './SkillDetailDrawer';

export default function MobileSkillsDonut({ categories = [] }) {
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSkill, setActiveSkill] = useState(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check user prefers-reduced-motion setting
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener?.('change', handler);
    return () => mediaQuery.removeEventListener?.('change', handler);
  }, []);

  // When a category is tapped on Screen 1 (donut slice or category list row)
  const handleSelectCategory = useCallback((cat) => {
    setActiveCategory(cat);
  }, []);

  // When sheet is closed, return to Screen 1
  const handleCloseCategorySheet = useCallback(() => {
    setActiveCategory(null);
  }, []);

  // When a skill ring is tapped on Screen 2, open the existing SkillDetailDrawer
  const handleSelectSkill = useCallback((skill) => {
    setActiveSkill(skill);
  }, []);

  // Close skill detail drawer
  const handleCloseSkillDrawer = useCallback(() => {
    setActiveSkill(null);
  }, []);

  // Resolve the category that contains the active skill (for next/prev navigation in drawer)
  const skillCategory = useMemo(() => {
    if (!activeSkill) return null;
    if (activeCategory && activeCategory.skills.some((s) => s.id === activeSkill.id)) {
      return activeCategory;
    }
    return categories.find((c) => c.skills.some((s) => s.id === activeSkill.id)) || activeCategory;
  }, [activeSkill, activeCategory, categories]);

  // Overall quick stats
  const totalSkills = useMemo(
    () => categories.reduce((sum, c) => sum + (c.skills?.length || 0), 0),
    [categories]
  );

  return (
    <div
      className="mobile-skills-section"
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '12px 14px 40px',
        boxSizing: 'border-box',
      }}
    >
      {/* ── Mobile Hero Header ── */}
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          textAlign: 'center',
          marginBottom: '16px',
        }}
      >
        <p
          style={{
            fontSize: '11px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: 'var(--primary-blue, #3b82f6)',
            marginBottom: '4px',
          }}
        >
          Interactive Overview
        </p>
        <h2
          style={{
            margin: '0 0 6px',
            fontSize: '22px',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary, #ffffff)',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Tech Stack &amp; Proficiencies
        </h2>
        <p
          style={{
            margin: 0,
            fontSize: '12.5px',
            color: 'var(--text-muted, #94a3b8)',
            lineHeight: 1.45,
          }}
        >
          {totalSkills} skills across {categories.length} categories. Tap any slice or category to explore details.
        </p>
      </div>

      {/* ── Screen 1: One Continuous Donut Chart + Category List ── */}
      <SkillsDonut
        categories={categories}
        selectedCategoryId={activeCategory?.id || null}
        onSelectCategory={handleSelectCategory}
        prefersReducedMotion={prefersReducedMotion}
      />

      {/* ── Screen 2: Slide-up CategorySheet ── */}
      <CategorySheet
        category={activeCategory}
        isOpen={Boolean(activeCategory && !activeSkill)}
        onClose={handleCloseCategorySheet}
        onSelectSkill={handleSelectSkill}
        prefersReducedMotion={prefersReducedMotion}
      />

      {/* ── Drill-down: Reuse existing SkillDetailDrawer ── */}
      {activeSkill && (
        <SkillDetailDrawer
          skill={activeSkill}
          category={skillCategory}
          onClose={handleCloseSkillDrawer}
          onNavigate={(nextSkill) => setActiveSkill(nextSkill)}
        />
      )}
    </div>
  );
}
