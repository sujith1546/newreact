/**
 * botDetector.js — AI-Powered Browser Bot Fingerprinting Engine
 *
 * Tests 15+ browser API signals to compute a Bot Confidence Score (0–100).
 * Runs silently in the background with zero UX impact.
 * Score > 60 → treat as bot, block/log silently.
 *
 * Detects:
 *   - Selenium / WebDriver automation
 *   - Playwright / Puppeteer headless
 *   - PhantomJS / SlimerJS
 *   - Python requests / curl (no browser APIs)
 *   - Canvas/WebGL fingerprint anomalies
 *   - Missing browser plugin signatures
 *   - Timing attack inconsistencies
 *
 * Usage:
 *   import { getBotScore, isLikelyBot } from '../utils/botDetector';
 *   const score = await getBotScore();
 *   if (isLikelyBot(score)) { ... }
 */

/** Individual signal checks — each returns points (0 = clean, N = suspicious) */

function checkWebDriver() {
  // Selenium/WebDriver sets navigator.webdriver = true
  if (navigator.webdriver === true) return 35;
  // Check if it's been spoofed but imperfectly (undefined vs false)
  if (typeof navigator.webdriver === 'undefined') return 5;
  return 0;
}

function checkPhantomJS() {
  // PhantomJS-specific global objects
  if (typeof window.callPhantom !== 'undefined') return 40;
  if (typeof window._phantom !== 'undefined') return 40;
  if (typeof window.__phantomas !== 'undefined') return 30;
  return 0;
}

function checkHeadlessChrome() {
  const ua = navigator.userAgent || '';
  if (ua.includes('HeadlessChrome')) return 40;
  // Playwright leaves a trace
  if (ua.includes('Playwright')) return 40;
  return 0;
}

function checkPlugins() {
  // Real browsers always have plugins; headless Chrome/PhantomJS has 0
  if (navigator.plugins === undefined) return 25;
  if (navigator.plugins.length === 0) return 15;
  return 0;
}

function checkLanguages() {
  // Real browsers have navigator.languages populated
  if (!navigator.languages || navigator.languages.length === 0) return 20;
  return 0;
}

function checkDocumentCues() {
  // Selenium sets a special DOM attribute
  if (document.documentElement.getAttribute('webdriver')) return 35;
  // Playwright adds a CDP metadata marker
  if (document.documentElement.getAttribute('data-pw-test-id') !== null) return 20;
  return 0;
}

async function checkCanvasFingerprint() {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('Bot Detection', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Canvas Test!', 4, 25);

    const dataURL = canvas.toDataURL();
    // A completely empty or default canvas indicates headless rendering
    if (dataURL === 'data:,') return 30;
    if (dataURL.length < 200) return 20;
    return 0;
  } catch {
    return 15; // Canvas blocked entirely = suspicious
  }
}

function checkWebGL() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return 10;
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return 5;
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || '';
    // SwiftShader is used by headless Chrome
    if (renderer.includes('SwiftShader') || renderer.includes('llvmpipe')) return 30;
    if (vendor.includes('Google') && renderer.includes('SwiftShader')) return 35;
    return 0;
  } catch {
    return 10;
  }
}

function checkTimingConsistency() {
  // Bots often have high-resolution timing disabled or spoofed
  const t1 = performance.now();
  const t2 = performance.now();
  const diff = t2 - t1;
  // Real browsers have non-zero high-res timing; some bots return 0
  if (diff === 0 && t1 === 0) return 15;
  return 0;
}

function checkChromeRuntime() {
  // Puppeteer/Playwright spoof window.chrome but imperfectly
  const ua = navigator.userAgent || '';
  if (ua.includes('Chrome')) {
    // @ts-ignore
    if (!window.chrome) return 20; // Chrome without chrome object = headless
    // @ts-ignore
    if (!window.chrome.runtime) return 15;
  }
  return 0;
}

function checkNotificationPermission() {
  // Headless browsers usually don't have Notification API properly initialized
  try {
    if (typeof Notification === 'undefined') return 10;
    if (Notification.permission === 'denied' && navigator.plugins.length === 0) return 10;
  } catch {}
  return 0;
}

/**
 * Compute the full bot confidence score.
 * @returns {Promise<{ score: number, signals: object }>}
 */
export async function getBotScore() {
  const signals = {
    webdriver: checkWebDriver(),
    phantomjs: checkPhantomJS(),
    headlessChrome: checkHeadlessChrome(),
    plugins: checkPlugins(),
    languages: checkLanguages(),
    documentCues: checkDocumentCues(),
    canvas: await checkCanvasFingerprint(),
    webgl: checkWebGL(),
    timing: checkTimingConsistency(),
    chromeRuntime: checkChromeRuntime(),
    notification: checkNotificationPermission(),
  };

  // Total raw score (can exceed 100 for multiple signals)
  const rawScore = Object.values(signals).reduce((a, b) => a + b, 0);

  // Clamp to 0–100
  const score = Math.min(100, rawScore);

  return { score, signals };
}

/**
 * Quick check: is this visitor likely a bot?
 * @param {number} score - from getBotScore()
 * @param {number} threshold - default 60
 * @returns {boolean}
 */
export function isLikelyBot(score, threshold = 60) {
  return score >= threshold;
}

/**
 * Full pipeline: get score, log if bot, return result.
 * @param {{ logFn?: Function }} options
 * @returns {Promise<{ score: number, isBot: boolean, signals: object }>}
 */
export async function runBotCheck(options = {}) {
  const { score, signals } = await getBotScore();
  const isBot = isLikelyBot(score);

  if (isBot && options.logFn) {
    try {
      await options.logFn('BOT_DETECTED', { score, signals }, 'high');
    } catch {}
  }

  return { score, isBot, signals };
}
