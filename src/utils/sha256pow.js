/**
 * useSha256Pow - Lightweight SHA-256 Proof-of-Work Challenge
 * Runs a background PoW challenge using Web Crypto API.
 * Returns a valid nonce only after finding a hash with the required leading zero bits.
 *
 * Usage:
 *   import { computePow } from '../utils/sha256pow';
 *   const nonce = await computePow(challenge, difficulty);
 */

/**
 * sha256(message: string) => Promise<string> (hex)
 */
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * computePow(challenge: string, difficulty: number) => Promise<{ nonce: number, hash: string }>
 * Finds a nonce such that sha256(challenge + nonce) starts with `difficulty` zeros.
 * @param challenge - server/client-side challenge string (timestamp + email typically)
 * @param difficulty - number of leading hex zeros required (default: 2 = fast, 4 = moderate)
 */
export async function computePow(challenge, difficulty = 2) {
  const prefix = '0'.repeat(difficulty);
  let nonce = 0;
  let hash = '';

  while (true) {
    hash = await sha256(challenge + nonce);
    if (hash.startsWith(prefix)) break;
    nonce++;
    // Yield to browser event loop every 200 iterations to avoid UI freeze
    if (nonce % 200 === 0) {
      await new Promise(r => setTimeout(r, 0));
    }
  }

  return { nonce, hash };
}

/**
 * generateChallenge(seed: string) => string
 * Creates a time-bound challenge string seeded with current minute bucket (10-min window).
 */
export function generateChallenge(seed = '') {
  const bucket = Math.floor(Date.now() / (10 * 60 * 1000));
  return `pow_${bucket}_${seed}`;
}

/**
 * verifyPow(challenge: string, nonce: number, difficulty: number) => Promise<boolean>
 * Client-side re-verification (also done server-side via API).
 */
export async function verifyPow(challenge, nonce, difficulty = 2) {
  const hash = await sha256(challenge + nonce);
  return hash.startsWith('0'.repeat(difficulty));
}
