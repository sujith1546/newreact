/**
 * vaultCrypto - Client-Side AES-256-GCM Secrets Vault Encryption
 * Encrypts sensitive API keys using the Web Crypto API before
 * they are stored in Supabase site_settings.
 *
 * Usage:
 *   import { encryptVault, decryptVault } from '../utils/vaultCrypto';
 *   const { ciphertext, iv } = await encryptVault(apiKey);
 *   const plain = await decryptVault(ciphertext, iv);
 */

const VAULT_KEY_NAME = 'pcms_vault_key_v1';

/**
 * getOrCreateVaultKey() => Promise<CryptoKey>
 * Derives a persistent AES-256-GCM key from a locally stored raw key material.
 */
async function getOrCreateVaultKey() {
  let rawHex = localStorage.getItem(VAULT_KEY_NAME);
  
  if (!rawHex || rawHex.length !== 64) {
    // Generate a new 256-bit random key
    const raw = crypto.getRandomValues(new Uint8Array(32));
    rawHex = Array.from(raw).map(b => b.toString(16).padStart(2, '0')).join('');
    localStorage.setItem(VAULT_KEY_NAME, rawHex);
  }

  const rawBytes = new Uint8Array(rawHex.match(/.{1,2}/g).map(b => parseInt(b, 16)));
  return crypto.subtle.importKey(
    'raw',
    rawBytes,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * encryptVault(plaintext: string) => Promise<{ ciphertext: string, iv: string }>
 * Returns base64-encoded ciphertext and IV.
 */
export async function encryptVault(plaintext) {
  if (!plaintext || typeof plaintext !== 'string') return { ciphertext: '', iv: '' };
  
  try {
    const key = await getOrCreateVaultKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(plaintext);
    
    const ciphertextBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoded
    );

    const ciphertext = btoa(String.fromCharCode(...new Uint8Array(ciphertextBuffer)));
    const ivB64 = btoa(String.fromCharCode(...iv));

    return { ciphertext, iv: ivB64 };
  } catch (err) {
    console.error('[Vault] Encryption failed:', err);
    return { ciphertext: plaintext, iv: '' }; // Fallback: store plain (degraded mode)
  }
}

/**
 * decryptVault(ciphertext: string, iv: string) => Promise<string>
 * Decrypts a previously encrypted value.
 */
export async function decryptVault(ciphertext, iv) {
  if (!ciphertext || !iv) return ciphertext || '';

  try {
    const key = await getOrCreateVaultKey();
    const cipherBytes = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
    const ivBytes = Uint8Array.from(atob(iv), c => c.charCodeAt(0));

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: ivBytes },
      key,
      cipherBytes
    );

    return new TextDecoder().decode(decryptedBuffer);
  } catch (err) {
    console.error('[Vault] Decryption failed:', err);
    return ciphertext; // Fallback: return as-is
  }
}

/**
 * isEncrypted(value: string) => boolean
 * Heuristic check if value looks like vault-encrypted base64 ciphertext.
 */
export function isEncrypted(value) {
  if (!value || typeof value !== 'string') return false;
  return /^[A-Za-z0-9+/=]{20,}$/.test(value) && value.length > 32;
}
