import 'react-native-get-random-values';

/**
 * Generate cryptographically secure random bytes
 * @param length Number of bytes to generate
 * @returns Uint8Array of random bytes
 */
export const getSecureRandomBytes = (length: number): Uint8Array => {
  if (length <= 0 || length > 65536) {
    throw new Error('Invalid random bytes length');
  }

  const randomBytes = new Uint8Array(length);
  global.crypto.getRandomValues(randomBytes);

  // Basic validation
  const allZeros = randomBytes.every(byte => byte === 0);
  const allSame = randomBytes.every(byte => byte === randomBytes[0]);

  if (allZeros || allSame) {
    throw new Error('Random bytes generation failed - insufficient randomness');
  }

  return randomBytes;
};

/**
 * Generate secure random string (for IDs, tokens, etc.)
 */
export const generateSecureToken = (length: number = 32): string => {
  const bytes = getSecureRandomBytes(length);
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Generate secure random number within range
 */
export const getSecureRandomInt = (min: number, max: number): number => {
  const range = max - min + 1;
  const bytes = getSecureRandomBytes(4);
  const randomValue = new DataView(bytes.buffer).getUint32(0, true);
  return min + (randomValue % range);
};