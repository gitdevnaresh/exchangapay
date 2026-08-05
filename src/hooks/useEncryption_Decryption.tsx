import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { decryptAny, encryptCBC, encryptGCM } from '../utils/crypto/aes';
import { BACKEND_SUPPORTS_AEAD } from '../utils/crypto/policy';

/**
 * Encrypt/decrypt for backend traffic, keyed off the session `sk`.
 *
 * The scheme lives in `src/utils/crypto/aes.ts`. This file used to hold its own
 * copy of it (H-06: two implementations of the same routine, with different
 * failure behaviour, guaranteed to drift). What is left here is the three things
 * that are actually specific to React callers:
 *
 *   1. the key comes from Redux,
 *   2. a failure returns '' instead of throwing, because ~400 call sites render
 *      the result straight into a <Text> and an exception there blanks a screen,
 *   3. the decrypt memoization cache.
 *
 * Writes are authenticated AES-GCM (format 0x02) — the H-06 fix. Every outbound
 * field carries a tag, so a request modified in transit is rejected by the
 * server instead of decrypting to something the attacker chose. The CBC branch
 * is retained only so that reverting BACKEND_SUPPORTS_AEAD is a one-constant
 * change if the backend rollout has to be unwound; see utils/crypto/policy.ts.
 *
 * Reads accept every format the app has ever emitted, which is what lets the two
 * sides migrate independently.
 */

// ---------------------------------------------------------------------------
// Decryption memoization cache (VAPT P-1)
// ---------------------------------------------------------------------------
// Decryption is DETERMINISTIC: an identical (secretKey, cipherText) pair always
// yields the identical plaintext. So caching the result is behaviour-preserving.
// This collapses the "same field re-decrypted on every render across 400+ call
// sites" cost (e.g. KYC decrypts ~20 fields per render): the FIRST decrypt does
// the native AES work; every subsequent render returns the cached plaintext.
//
// The cache key includes the resolved secret key, so a key change (new login /
// different `sk`) can never return another user's plaintext.
//
// Only successful decrypts are cached. For GCM that matters: the authentication
// tag has already been verified for anything in here, and a blob that failed
// verification is never stored, so a tampered value cannot be cached past its
// rejection.
//
// NOTE: encryption is deliberately NOT cached — it uses a fresh random IV/nonce
// per call, and caching it would emit identical ciphertext for identical
// plaintext, which is the exact weakness being fixed elsewhere in this change.
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

  const encryptAES = useCallback((plainText: string): string => {
    try {
      const sk = getKey();
      if (!sk) return '';
      return BACKEND_SUPPORTS_AEAD
        ? encryptGCM(plainText, sk)
        : encryptCBC(plainText, sk);
    } catch {
      return '';
    }
  }, [getKey]);

  const decryptAES = useCallback((cipherText: string): string => {
    if (!cipherText) return '';
    const sk = getKey();
    if (!sk) return '';

    const cacheKey = `${sk}::${cipherText}`;
    const cached = decryptCache.get(cacheKey);
    if (cached !== undefined) {
      // LRU touch: mark as most-recently-used.
      decryptCache.delete(cacheKey);
      decryptCache.set(cacheKey, cached);
      return cached;
    }

    try {
      // "network": everything keyed off `sk` came from, or is going to, the
      // backend. That tag is what makes a decrypt failure here legible as a
      // possible integrity event rather than a stale local record.
      const result = decryptAny(cipherText, sk, 'network');

      decryptCache.set(cacheKey, result);
      if (decryptCache.size > DECRYPT_CACHE_MAX) {
        const oldestKey = decryptCache.keys().next().value;
        if (oldestKey !== undefined) decryptCache.delete(oldestKey);
      }

      return result;
    } catch {
      // Do NOT cache failures — a transient error must be retryable, and a
      // rejected (tampered) blob must be re-rejected rather than remembered.
      return '';
    }
  }, [getKey]);

  return { encryptAES, decryptAES };
};

export default useEncryptDecrypt;
