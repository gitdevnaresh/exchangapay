import 'react-native-get-random-values';

/**
 * Generates cryptographically secure random bytes
 * @param length Number of bytes to generate
 * @returns Uint8Array of random bytes
 */
export const getSecureRandomBytes = (length: number): Uint8Array => {
  if (length <= 0) throw new Error('Length must be positive');
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return array;
};

/**
 * Generates a cryptographically secure random string
 * @param length Length of the string
 * @returns Hex string
 */
export const getSecureRandomString = (length: number = 32): string => {
  const bytes = getSecureRandomBytes(length);
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Validates that crypto.getRandomValues is available
 */
export const validateSecureRandom = (): boolean => {
  if (typeof crypto === 'undefined' || typeof crypto.getRandomValues !== 'function') {
    throw new Error('Secure random generation not available');
  }
  return true;
};
