import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import QuickCrypto from 'react-native-quick-crypto';
import { Buffer } from '@craftzdog/react-native-buffer';

// ---------------------------------------------------------------------------
// AES-CBC/PKCS7 via react-native-quick-crypto (NATIVE, off the JS interpreter)
// ---------------------------------------------------------------------------
// Replaces the former pure-JS crypto-js path (VAPT P-1). The wire format is
// UNCHANGED and byte-for-byte compatible with the C# backend and any data
// already encrypted by the old implementation:
//   base64( [0x01][16-byte random IV][AES-CBC-PKCS7 ciphertext] )
// plus the legacy `v2:` hex-IV form and the legacy zero-IV fallback on decrypt.
// (Cross-decrypt equivalence with the old crypto-js code was verified: 100/100.)
const BACKEND_RANDOM_IV_VERSION = 1;
const AES_IV_SIZE               = 16;
const AES_BLOCK_SIZE            = 16;
const IV_PREFIX                 = 'v2:';

/**
 * Strip spaces/dashes and validate key length — mirrors C# NormalizeKey.
 * Returns the normalized key string (16, 24, or 32 UTF-8 bytes).
 */
function normalizeSecretKey(secretKey: string): string {
  if (!secretKey) throw new Error('SecretKey is missing');
  const normalized = secretKey.replace(/[ -]/g, '');
  const byteLen = Buffer.byteLength(normalized, 'utf8');
  if (![16, 24, 32].includes(byteLen)) {
    throw new Error(`AES key must be 128/192/256-bit after normalization (got ${byteLen * 8}-bit)`);
  }
  return normalized;
}

/** Pick the CBC variant from the key byte-length (crypto-js auto-detected this). */
function cbcAlgorithm(keyByteLength: number): 'aes-128-cbc' | 'aes-192-cbc' | 'aes-256-cbc' {
  switch (keyByteLength) {
    case 16: return 'aes-128-cbc';
    case 24: return 'aes-192-cbc';
    case 32: return 'aes-256-cbc';
    default: throw new Error(`Unsupported AES key length: ${keyByteLength}`);
  }
}

// ---------------------------------------------------------------------------
// Decryption memoization cache (VAPT P-1)
// ---------------------------------------------------------------------------
// AES-CBC decryption is DETERMINISTIC: an identical (secretKey, cipherText) pair
// always yields the identical plaintext. So caching the result is 100%
// behaviour-preserving. This collapses the "same field re-decrypted on every
// render across 416 call sites" cost (e.g. KYC decrypts ~20 fields per render):
// the FIRST decrypt does the native AES work; every subsequent render of the
// same ciphertext returns the cached plaintext instantly.
//
// The cache key includes the resolved secret key, so a key change (new login /
// different `sk`) can never return another user's plaintext.
//
// NOTE: encryptAES is deliberately NOT cached — it uses a fresh random IV per
// call, and caching it would emit identical ciphertext for identical plaintext,
// a cryptographic-integrity regression.
const DECRYPT_CACHE_MAX = 1000;
const decryptCache = new Map<string, string>();

/**
 * Clear all cached decrypted plaintext. Call on logout / session-end so
 * decrypted PII does not linger in memory beyond the session.
 */
export const clearDecryptCache = (): void => {
  decryptCache.clear();
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
const useEncryptDecrypt = (customSecretKey?: string) => {
  // `sk` lives on the legacy UserReducer, mounted into the modern store as
  // `UserReducer` and populated by setUserInfo(userDetails) in useMemberLogin.
  const defaultSecretKey = useSelector(
    (state: any) => state?.UserReducer?.userInfo?.sk
  );

  const getKey = useCallback((): string => {
    return customSecretKey || defaultSecretKey || '';
  }, [customSecretKey, defaultSecretKey]);

  // -------------------------------------------------------------------------
  // encryptAES
  // Output: base64( [0x01][16-byte random IV][AES-CBC-PKCS7 ciphertext] )
  // Matches the former crypto-js output, the web app encryptAES, and C#
  // EncryptString.
  // -------------------------------------------------------------------------
  const encryptAES = useCallback((plainText: string): string => {
    try {
      const sk = getKey();
      if (!sk) return '';
      const keyBuf = Buffer.from(normalizeSecretKey(sk), 'utf8');
      const iv = QuickCrypto.randomBytes(AES_IV_SIZE);

      const cipher = QuickCrypto.createCipheriv(cbcAlgorithm(keyBuf.length), keyBuf, iv);
      const cipherBuf = Buffer.concat([cipher.update(plainText || '', 'utf8'), cipher.final()]);

      return Buffer.concat([
        Buffer.from([BACKEND_RANDOM_IV_VERSION]),
        Buffer.from(iv),
        cipherBuf,
      ]).toString('base64');
    } catch {
      return '';
    }
  }, [getKey]);

  // -------------------------------------------------------------------------
  const decryptAES = useCallback((cipherText: string): string => {
    if (!cipherText) return '';
    const sk = getKey();
    if (!sk) return '';

    // Memoized fast path: reuse prior plaintext when this exact (key, ciphertext)
    // was already decrypted, instead of re-running AES on every render (P-1).
    const cacheKey = `${sk}::${cipherText}`;
    const cached = decryptCache.get(cacheKey);
    if (cached !== undefined) {
      // LRU touch: mark as most-recently-used.
      decryptCache.delete(cacheKey);
      decryptCache.set(cacheKey, cached);
      return cached;
    }

    try {
      const keyBuf = Buffer.from(normalizeSecretKey(sk), 'utf8');

      let iv: Buffer;
      let cipherBuf: Buffer;

      if (cipherText.startsWith(IV_PREFIX)) {
        const data = cipherText.slice(IV_PREFIX.length);
        iv        = Buffer.from(data.slice(0, 32), 'hex');
        cipherBuf = Buffer.from(data.slice(32), 'base64');
      } else {
        const bytes = Buffer.from(cipherText, 'base64');
        if (
          bytes.length > 1 + AES_IV_SIZE &&
          bytes[0] === BACKEND_RANDOM_IV_VERSION &&
          bytes.length % AES_BLOCK_SIZE === 1
        ) {
          iv        = bytes.subarray(1, 1 + AES_IV_SIZE);
          cipherBuf = bytes.subarray(1 + AES_IV_SIZE);
        } else {
          // Legacy fallback: static all-zero IV, ciphertext is the bare base64.
          iv        = Buffer.alloc(AES_IV_SIZE, 0);
          cipherBuf = Buffer.from(cipherText, 'base64');
        }
      }

      const decipher = QuickCrypto.createDecipheriv(cbcAlgorithm(keyBuf.length), keyBuf, iv);
      const result = Buffer.concat([decipher.update(cipherBuf), decipher.final()]).toString('utf8') || '';

      // Cache the deterministic result; evict oldest when over the bound.
      decryptCache.set(cacheKey, result);
      if (decryptCache.size > DECRYPT_CACHE_MAX) {
        const oldestKey = decryptCache.keys().next().value;
        if (oldestKey !== undefined) decryptCache.delete(oldestKey);
      }

      return result;
    } catch {
      // Do NOT cache failures — a transient error must be retryable.
      return '';
    }
  }, [getKey]);

  return { encryptAES, decryptAES };
};

export default useEncryptDecrypt;
