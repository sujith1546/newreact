/**
 * rateLimiter.js — Client-Side Sliding Window Rate Limiter
 *
 * Provides configurable per-action rate limiting using sessionStorage.
 * Prevents automated form submission floods, API abuse, and brute-force
 * patterns from client-side code.
 *
 * Usage:
 *   import { RateLimiter } from '../utils/rateLimiter';
 *
 *   const limiter = new RateLimiter('contact_form', { maxRequests: 3, windowMs: 60000 });
 *   const { allowed, retryAfter, remaining } = limiter.check();
 *   if (!allowed) {
 *     alert(`Too many requests. Try again in ${retryAfter}s.`);
 *     return;
 *   }
 *   limiter.consume(); // Record this request
 */

export class RateLimiter {
  /**
   * @param {string} key - Unique identifier for this rate limit bucket
   * @param {object} options
   * @param {number} options.maxRequests  - Maximum requests allowed in window (default: 5)
   * @param {number} options.windowMs     - Time window in milliseconds (default: 60000 = 1 min)
   * @param {boolean} options.persistent  - Use localStorage (survives tab close) vs sessionStorage
   */
  constructor(key, options = {}) {
    this.key = `rl_${key}`;
    this.maxRequests = options.maxRequests ?? 5;
    this.windowMs = options.windowMs ?? 60000;
    this.storage = options.persistent ? localStorage : sessionStorage;
  }

  _getState() {
    try {
      const raw = this.storage.getItem(this.key);
      if (!raw) return { timestamps: [] };
      return JSON.parse(raw);
    } catch {
      return { timestamps: [] };
    }
  }

  _setState(state) {
    try {
      this.storage.setItem(this.key, JSON.stringify(state));
    } catch {}
  }

  /**
   * Check if a new request is allowed without consuming a slot.
   * @returns {{ allowed: boolean, retryAfter: number, remaining: number }}
   */
  check() {
    const now = Date.now();
    const state = this._getState();
    // Prune expired timestamps
    const active = state.timestamps.filter(ts => now - ts < this.windowMs);

    if (active.length < this.maxRequests) {
      return {
        allowed: true,
        retryAfter: 0,
        remaining: this.maxRequests - active.length,
      };
    }

    // Find when the oldest request expires
    const oldest = Math.min(...active);
    const retryAfterMs = this.windowMs - (now - oldest);
    return {
      allowed: false,
      retryAfter: Math.ceil(retryAfterMs / 1000),
      remaining: 0,
    };
  }

  /**
   * Record a new request (consume one slot).
   */
  consume() {
    const now = Date.now();
    const state = this._getState();
    const active = state.timestamps.filter(ts => now - ts < this.windowMs);
    active.push(now);
    this._setState({ timestamps: active });
  }

  /**
   * Convenience: check AND consume in one call.
   * @returns {{ allowed: boolean, retryAfter: number, remaining: number }}
   */
  tryConsume() {
    const result = this.check();
    if (result.allowed) this.consume();
    return result;
  }

  /**
   * Reset this rate limiter bucket.
   */
  reset() {
    try {
      this.storage.removeItem(this.key);
    } catch {}
  }
}

// ── Pre-configured limiters for common actions ─────────────────────────────

/** Contact form: 3 submissions per 15 minutes */
export const contactFormLimiter = new RateLimiter('contact_form', {
  maxRequests: 3,
  windowMs: 15 * 60 * 1000,
  persistent: true,
});

/** AI chat: 15 messages per minute */
export const aiChatLimiter = new RateLimiter('ai_chat', {
  maxRequests: 15,
  windowMs: 60 * 1000,
  persistent: false,
});

/** Admin login attempts: 5 per 10 minutes (supplements server-side check) */
export const loginLimiter = new RateLimiter('admin_login', {
  maxRequests: 5,
  windowMs: 10 * 60 * 1000,
  persistent: true,
});
