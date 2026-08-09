/**
 * useXssSanitizer - Zero-Trust Anti-XSS DOM Sanitizer
 * Strips dangerous HTML tags, event handlers and javascript: URIs
 * from any dynamic string before rendering it into the DOM.
 */

const ALLOWED_TAGS = new Set([
  'b','i','em','strong','u','s','del','ins','mark','small','sub','sup',
  'code','pre','blockquote','p','br','hr','ul','ol','li','a','span','div',
  'h1','h2','h3','h4','h5','h6'
]);

const ALLOWED_ATTRS = new Set([
  'href','title','target','rel','class','id','aria-label','aria-hidden',
  'data-id','data-key','alt','src','width','height','loading'
]);

const DANGEROUS_HREF = /^(javascript:|data:|vbscript:)/i;

/**
 * sanitize(html: string) => string
 * Whitelist-based sanitizer. Returns clean, safe HTML string.
 */
export function sanitize(html) {
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') return '';
  if (!html || typeof html !== 'string') return '';

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  function cleanNode(node) {
    if (node.nodeType === Node.TEXT_NODE) return node.cloneNode(true);
    if (node.nodeType !== Node.ELEMENT_NODE) return null;

    const tagName = node.tagName.toLowerCase();

    // Strip disallowed tags (but preserve child text)
    if (!ALLOWED_TAGS.has(tagName)) {
      const frag = document.createDocumentFragment();
      node.childNodes.forEach(child => {
        const cleaned = cleanNode(child);
        if (cleaned) frag.appendChild(cleaned);
      });
      return frag;
    }

    const clean = document.createElement(tagName);

    // Copy only allowed attributes
    Array.from(node.attributes).forEach(attr => {
      const name = attr.name.toLowerCase();
      if (!ALLOWED_ATTRS.has(name)) return;
      if ((name === 'href' || name === 'src') && DANGEROUS_HREF.test(attr.value)) return;
      if (name === 'href' || name === 'src') {
        clean.setAttribute(name, attr.value);
        if (name === 'href') {
          clean.setAttribute('rel', 'noopener noreferrer');
          clean.setAttribute('target', '_blank');
        }
      } else {
        clean.setAttribute(name, attr.value);
      }
    });

    // Recursively clean children
    node.childNodes.forEach(child => {
      const cleaned = cleanNode(child);
      if (cleaned) clean.appendChild(cleaned);
    });

    return clean;
  }

  const frag = document.createDocumentFragment();
  doc.body.childNodes.forEach(child => {
    const cleaned = cleanNode(child);
    if (cleaned) frag.appendChild(cleaned);
  });

  const wrapper = document.createElement('div');
  wrapper.appendChild(frag);
  return wrapper.innerHTML;
}

/**
 * sanitizeText(str: string) => string
 * Strip ALL html — return plain text only (no tags at all).
 */
export function sanitizeText(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}
