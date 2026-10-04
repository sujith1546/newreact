// src/utils/skillsUtils.js
// Pure helpers for the mobile Skills donut redesign.

/** Category accent colors — match the site's primary-blue + complementary palette */
export const CAT_COLORS = {
  languages: '#3b82f6',
  database:  '#06b6d4',
  ml:        '#8b5cf6',
  soft:      '#10b981',
  exploring: '#f59e0b',
};

/** Mean proficiency of all skills in a category (0-100). Skills with no percent count as 0. */
export function categoryAvg(skills = []) {
  if (!skills.length) return 0;
  const sum = skills.reduce((acc, s) => acc + (Number(s.percent) || 0), 0);
  return sum / skills.length;
}

/**
 * Largest-remainder (Hamilton) method.
 * Converts an array of raw values into integer percentages that sum to exactly 100.
 * @param {number[]} values – raw numeric values (need not sum to 100)
 * @returns {number[]} integer shares summing to exactly 100
 */
export function largestRemainder(values) {
  const total = values.reduce((a, b) => a + b, 0);
  if (total === 0) return values.map(() => Math.floor(100 / values.length));

  const exact  = values.map(v => (v / total) * 100);
  const floors = exact.map(Math.floor);
  const rem    = 100 - floors.reduce((a, b) => a + b, 0);

  // Sort indices by descending fractional part
  const order = exact
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac);

  for (let k = 0; k < rem; k++) {
    floors[order[k].i]++;
  }
  return floors;
}

/**
 * Level label from a raw percent value.
 * 85+ = Expert · 70-84 = Advanced · 50-69 = Intermediate · <50 = Learning
 */
export function levelFromPercent(pct) {
  const p = Number(pct) || 0;
  if (p >= 85) return 'Expert';
  if (p >= 70) return 'Advanced';
  if (p >= 50) return 'Intermediate';
  return 'Learning';
}

/** Color per level label */
export const LEVEL_COLORS = {
  Expert:       { text: '#3b82f6', bg: 'rgba(59,130,246,0.10)',  border: 'rgba(59,130,246,0.25)' },
  Advanced:     { text: '#3b82f6', bg: 'rgba(59,130,246,0.10)',  border: 'rgba(59,130,246,0.25)' },
  Intermediate: { text: '#ca8a04', bg: 'rgba(234,179,8,0.10)',   border: 'rgba(234,179,8,0.28)'  },
  Learning:     { text: '#6366f1', bg: 'rgba(99,102,241,0.10)',  border: 'rgba(99,102,241,0.28)' },
};
