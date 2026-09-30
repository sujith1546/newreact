import confetti from 'canvas-confetti';

/**
 * Intelligent and Robust Confetti Engine for Portfolio
 * - Dedicated top-level viewport canvas at z-index 999999
 * - Direct main-thread rendering (useWorker: false) to prevent Web Worker / OffscreenCanvas sandbox issues
 * - Multi-stage orchestrated choreography (impact burst -> stadium side cannons -> floating stardust)
 * - Dynamic color palettes adapting to active desk accent
 * - Safe haptics & graceful animation scaling
 */

let activeConfettiInstance = null;

function getConfettiEngine() {
  if (typeof window === 'undefined') {
    return () => Promise.resolve();
  }

  if (activeConfettiInstance) {
    return activeConfettiInstance;
  }

  try {
    let canvas = document.getElementById('portfolio-confetti-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'portfolio-confetti-canvas';
      canvas.style.position = 'fixed';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '999999';
      document.body.appendChild(canvas);
    }

    activeConfettiInstance = confetti.create(canvas, {
      resize: true,
      useWorker: false, // Ensures 100% reliable execution in all browser environments
    });
  } catch (err) {
    console.warn('Canvas creation fallback:', err);
    activeConfettiInstance = confetti;
  }

  return activeConfettiInstance;
}

// Gentle mobile haptic feedback
function triggerHaptic() {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate([25, 35, 30]);
    } catch {
      // Ignore vibration error if not supported
    }
  }
}

// Check for reduced motion preference
function isReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Harmonious celebration color palette generator
 */
function getCelebrationPalette(primaryAccent) {
  const accent = primaryAccent || '#3b82f6';
  return [
    accent,
    '#10b981', // emerald
    '#f59e0b', // gold
    '#38bdf8', // sky
    '#8b5cf6', // violet
    '#ffffff', // diamond sparkle
  ];
}

/**
 * Fire the multi-stage celebration for Contact form delivery
 *
 * @param {Object} options
 * @param {string} [options.deskColor] - Active desk theme color
 * @param {{ x: number, y: number }} [options.origin] - Normalized origin {x, y}
 */
export function fireContactSuccessConfetti({ deskColor, origin = { x: 0.5, y: 0.45 } } = {}) {
  const fire = getConfettiEngine();
  const colors = getCelebrationPalette(deskColor);
  const reduced = isReducedMotion();

  // Clamp origin within screen bounds
  const safeOrigin = {
    x: Math.max(0.1, Math.min(0.9, origin?.x ?? 0.5)),
    y: Math.max(0.1, Math.min(0.85, origin?.y ?? 0.45)),
  };

  triggerHaptic();

  // If user explicitly has reduced motion, fire a soft, gentle particle release
  if (reduced) {
    fire({
      particleCount: 25,
      spread: 60,
      origin: safeOrigin,
      colors,
      startVelocity: 18,
      gravity: 0.8,
      ticks: 120,
    });
    return;
  }

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 900;
  const particleMultiplier = isMobile ? 0.8 : 1.0;

  // ── Wave 1: Immediate Origin Pop (Center / Badge) ──
  fire({
    particleCount: Math.round(55 * particleMultiplier),
    spread: 75,
    origin: safeOrigin,
    colors,
    startVelocity: isMobile ? 26 : 32,
    gravity: 1.1,
    scalar: isMobile ? 0.9 : 1.05,
    ticks: 200,
    shapes: ['circle', 'square'],
  });

  // ── Wave 2: Left & Right Stadium Side Cannons (160ms delay) ──
  setTimeout(() => {
    // Left Cannon
    fire({
      particleCount: Math.round(40 * particleMultiplier),
      angle: 60,
      spread: 55,
      origin: { x: 0.05, y: 0.82 },
      colors,
      startVelocity: isMobile ? 38 : 48,
      gravity: 0.9,
      scalar: 1.0,
      ticks: 220,
      shapes: ['circle', 'square'],
    });

    // Right Cannon
    fire({
      particleCount: Math.round(40 * particleMultiplier),
      angle: 120,
      spread: 55,
      origin: { x: 0.95, y: 0.82 },
      colors,
      startVelocity: isMobile ? 38 : 48,
      gravity: 0.9,
      scalar: 1.0,
      ticks: 220,
      shapes: ['circle', 'square'],
    });
  }, 160);

  // ── Wave 3: Golden Sparkle & Stardust Rain (350ms delay) ──
  setTimeout(() => {
    fire({
      particleCount: Math.round(30 * particleMultiplier),
      spread: 110,
      origin: { x: safeOrigin.x, y: Math.max(0.12, safeOrigin.y - 0.22) },
      colors: [deskColor || '#3b82f6', '#f59e0b', '#fbbf24', '#ffffff'],
      startVelocity: 16,
      gravity: 0.55,
      drift: 0.25,
      scalar: 1.15,
      ticks: 280,
      shapes: ['circle', 'square'],
    });
  }, 350);
}

/**
 * Reusable helper for firing milestone achievements
 */
export function fireMilestoneConfetti() {
  const fire = getConfettiEngine();
  triggerHaptic();

  fire({
    particleCount: 80,
    spread: 90,
    origin: { x: 0.5, y: 0.5 },
    colors: ['#eab308', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6'],
    startVelocity: 35,
    scalar: 1.1,
  });
}
