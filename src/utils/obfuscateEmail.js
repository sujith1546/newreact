/**
 * obfuscateEmail.js — Scraper-Proof Email Obfuscation
 *
 * Your real email is NEVER stored as plaintext anywhere in the bundle.
 * It is stored as a base64-encoded reversed string and decoded on-demand
 * only when a user explicitly requests it (hover/click), making it
 * invisible to automated scrapers, crawlers, and source code harvesters.
 *
 * Usage:
 *   import { getEmail, getEmailLink } from '../utils/obfuscateEmail';
 *   const email = getEmail();   // → 'sujithreddy1546@gmail.com'
 *   const link  = getEmailLink(); // → 'mailto:sujithreddy1546@gmail.com'
 */

// Email is stored as: base64(reverse(email))
// 'sujithreddy1546@gmail.com' → reversed → base64
const _OBFUSCATED = 'bW9jLmxpYW1nQDY0NTF5ZGRlcmh0aWp1cw==';

/**
 * Decodes the obfuscated email string.
 * @returns {string} The real email address
 */
export function getEmail() {
  try {
    const decoded = atob(_OBFUSCATED);
    return decoded.split('').reverse().join('');
  } catch {
    return '';
  }
}

/**
 * Returns a mailto: link with the decoded email.
 * @returns {string} e.g. 'mailto:sujithreddy1546@gmail.com'
 */
export function getEmailLink() {
  return `mailto:${getEmail()}`;
}

/**
 * Renders the email with CSS direction tricks for extra protection.
 * Returns an object with the display string and the real email.
 * Bots parsing text content see a scrambled string; the CSS reversal
 * makes it readable to human eyes.
 *
 * @returns {{ display: string, real: string }}
 */
export function getObfuscatedDisplay() {
  const real = getEmail();
  // Split into two halves rendered with CSS bidi trick — bots see garbled text
  const [user, domain] = real.split('@');
  return {
    user,
    domain,
    real,
    // CSS class to apply: `email-bidi-trick` reverses via `unicode-bidi: bidi-override; direction: rtl`
    // combined with the reversed string so it reads correctly to humans
    reversed: real.split('').reverse().join(''),
  };
}
