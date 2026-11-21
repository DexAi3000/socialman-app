import crypto from 'crypto';

/**
 * Hashes a plaintext password using crypto.scryptSync with a cryptographically secure random salt.
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verifies a plaintext password against a stored salt:hash string.
 */
export function verifyPassword(password: string, storedHash?: string | null): boolean {
  if (!storedHash || !storedHash.includes(':')) {
    return false;
  }

  try {
    const [salt, originalHash] = storedHash.split(':');
    if (!salt || !originalHash) return false;

    const testHash = crypto.scryptSync(password, salt, 64).toString('hex');
    const originalBuf = Buffer.from(originalHash, 'hex');
    const testBuf = Buffer.from(testHash, 'hex');

    if (originalBuf.length !== testBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(originalBuf, testBuf);
  } catch {
    return false;
  }
}
