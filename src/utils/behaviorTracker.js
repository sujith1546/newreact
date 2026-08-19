/**
 * behaviorTracker.js — Behavioral Anomaly Detection Engine
 *
 * Passively monitors human interaction signals in the background.
 * Computes a "Human Score" (0–100). Score < 30 indicates bot-like behavior.
 *
 * Tracks:
 *   - Mouse movement count and velocity
 *   - Scroll depth and direction changes
 *   - Keyboard typing speed (chars/sec)
 *   - Time elapsed since page load
 *   - Click patterns (position randomness)
 *
 * All listeners are passive — zero performance impact.
 *
 * Usage:
 *   import { BehaviorTracker } from '../utils/behaviorTracker';
 *   const tracker = new BehaviorTracker();
 *   tracker.start();
 *   // ... later, before form submit:
 *   const { humanScore, isHuman, reasons } = tracker.evaluate();
 *   tracker.stop();
 */

export class BehaviorTracker {
  constructor() {
    this._mouseMoves = 0;
    this._mouseDistances = [];
    this._scrollEvents = 0;
    this._scrollDirectionChanges = 0;
    this._lastScrollY = 0;
    this._lastScrollDir = null;
    this._keystrokes = [];
    this._clicks = [];
    this._startTime = null;
    this._active = false;

    // Bound handlers for cleanup
    this._onMouseMove = this._handleMouseMove.bind(this);
    this._onScroll = this._handleScroll.bind(this);
    this._onKeyDown = this._handleKeyDown.bind(this);
    this._onClick = this._handleClick.bind(this);

    this._lastMouseX = 0;
    this._lastMouseY = 0;
  }

  /** Start passive event listeners */
  start() {
    if (this._active) return;
    this._active = true;
    this._startTime = Date.now();
    window.addEventListener('mousemove', this._onMouseMove, { passive: true });
    window.addEventListener('scroll', this._onScroll, { passive: true });
    window.addEventListener('keydown', this._onKeyDown, { passive: true });
    window.addEventListener('click', this._onClick, { passive: true });
  }

  /** Stop and clean up all listeners */
  stop() {
    this._active = false;
    window.removeEventListener('mousemove', this._onMouseMove);
    window.removeEventListener('scroll', this._onScroll);
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('click', this._onClick);
  }

  _handleMouseMove(e) {
    this._mouseMoves++;
    const dx = e.clientX - this._lastMouseX;
    const dy = e.clientY - this._lastMouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    this._mouseDistances.push(dist);
    this._lastMouseX = e.clientX;
    this._lastMouseY = e.clientY;
  }

  _handleScroll() {
    const currentY = window.scrollY;
    const dir = currentY > this._lastScrollY ? 'down' : 'up';
    if (this._lastScrollDir && dir !== this._lastScrollDir) {
      this._scrollDirectionChanges++;
    }
    this._lastScrollDir = dir;
    this._lastScrollY = currentY;
    this._scrollEvents++;
  }

  _handleKeyDown(e) {
    this._keystrokes.push({ key: e.key, time: Date.now() });
  }

  _handleClick(e) {
    this._clicks.push({ x: e.clientX, y: e.clientY, time: Date.now() });
  }

  /**
   * Evaluate collected signals and return a human score.
   * @returns {{ humanScore: number, isHuman: boolean, reasons: string[], rawSignals: object }}
   */
  evaluate() {
    const elapsed = this._startTime ? (Date.now() - this._startTime) / 1000 : 0;
    const reasons = [];
    let score = 100; // Start at 100%, deduct for anomalies

    // ── Signal 1: Time on page before submit
    if (elapsed < 2) {
      score -= 50;
      reasons.push('Submitted in < 2 seconds (bot speed)');
    } else if (elapsed < 5) {
      score -= 20;
      reasons.push('Very fast submission < 5 seconds');
    }

    // ── Signal 2: Mouse movement
    if (this._mouseMoves === 0) {
      score -= 30;
      reasons.push('Zero mouse movement detected');
    } else if (this._mouseMoves < 3) {
      score -= 15;
      reasons.push('Very few mouse movements');
    }

    // ── Signal 3: Mouse velocity anomaly (perfectly linear = robotic)
    if (this._mouseDistances.length > 5) {
      const avg = this._mouseDistances.reduce((a, b) => a + b, 0) / this._mouseDistances.length;
      const variance = this._mouseDistances.reduce((a, d) => a + Math.pow(d - avg, 2), 0) / this._mouseDistances.length;
      if (variance < 0.1) {
        score -= 20;
        reasons.push('Mouse movement is perfectly linear (robotic pattern)');
      }
    }

    // ── Signal 4: Scroll behaviour
    if (this._scrollEvents === 0 && elapsed > 5) {
      score -= 15;
      reasons.push('No scroll events despite extended time on page');
    }

    // ── Signal 5: Typing speed
    if (this._keystrokes.length > 3) {
      const times = this._keystrokes.map(k => k.time);
      const intervals = [];
      for (let i = 1; i < times.length; i++) intervals.push(times[i] - times[i - 1]);
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const charsPerSec = avgInterval > 0 ? 1000 / avgInterval : 0;
      if (charsPerSec > 200) {
        score -= 25;
        reasons.push(`Superhuman typing speed: ${charsPerSec.toFixed(0)} chars/sec`);
      }
    }

    // ── Signal 6: Click position randomness (bots click exact centres)
    if (this._clicks.length >= 2) {
      const xs = this._clicks.map(c => c.x);
      const ys = this._clicks.map(c => c.y);
      const xVariance = xs.reduce((a, x) => a + Math.pow(x - xs[0], 2), 0);
      const yVariance = ys.reduce((a, y) => a + Math.pow(y - ys[0], 2), 0);
      if (xVariance === 0 && yVariance === 0) {
        score -= 20;
        reasons.push('Clicks landed on identical pixel coordinates');
      }
    }

    const humanScore = Math.max(0, Math.min(100, score));

    return {
      humanScore,
      isHuman: humanScore >= 40,
      reasons,
      rawSignals: {
        elapsedSeconds: elapsed.toFixed(1),
        mouseMoves: this._mouseMoves,
        scrollEvents: this._scrollEvents,
        scrollDirectionChanges: this._scrollDirectionChanges,
        keystrokes: this._keystrokes.length,
        clicks: this._clicks.length,
      },
    };
  }

  /** Reset all counters (e.g., for a new form session) */
  reset() {
    this._mouseMoves = 0;
    this._mouseDistances = [];
    this._scrollEvents = 0;
    this._scrollDirectionChanges = 0;
    this._keystrokes = [];
    this._clicks = [];
    this._startTime = Date.now();
  }
}

/** Singleton for app-wide use */
let _globalTracker = null;

export function getGlobalTracker() {
  if (!_globalTracker) {
    _globalTracker = new BehaviorTracker();
    _globalTracker.start();
  }
  return _globalTracker;
}
