/**
 * Where secrets are allowed to live (security finding H-07).
 *
 * ===========================================================================
 * THE SANCTIONED PATHS — there are three, and there are only three
 * ===========================================================================
 *
 *   Access token         Keychain, service "authTokenService"
 *                        write/read: src/utils/storage/authTokens.ts
 *
 *   Refresh token        Keychain, service "refreshTokenService", under a
 *                        stricter accessibility class than the access token
 *                        (H-11). Never in the same entry — see authTokens.ts.
 *
 *   Member record        Keychain, service "userInfoService"
 *   (incl. `sk`)         written on login in useMemberLogin, cleared on logout
 *
 *   Persisted app state  Keychain, service "persist:root", AES-GCM encrypted
 *                        under a dedicated device key, secrets stripped first
 *                        (src/utils/crypto/, H-05)
 *
 *   Everything else      AsyncStorage — and ONLY things that are not sensitive:
 *                        theme, unread counters, crash-reporting consent.
 *
 * Every one of those Keychain entries is written through
 * src/utils/storage/keychainPolicy.ts, which owns the options and the full
 * service inventory that logout clears. Importing react-native-keychain
 * anywhere else fails __tests__/keychainPolicy.test.ts (H-11).
 *
 * ===========================================================================
 * WHY THIS FILE EXISTS
 * ===========================================================================
 * The app used to carry a second, parallel token store: src/utils/auth.tsx
 * wrote the access token, the refresh token and `keySK` — the key that decrypts
 * all of the user's personal data — into AsyncStorage, which is a plain
 * unencrypted file. It had no callers by the time it was found, which is the
 * only reason it was not an active breach. It was still exported, still
 * importable, and still looked like the obvious helper to reach for.
 *
 * That is the failure this file is designed to prevent: not the old code, but
 * the next person who writes it again. SENSITIVE_KEY_PATTERN below is enforced
 * by __tests__/storagePolicy.test.ts on every `npm test`.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Keys that must never be written to AsyncStorage.
 *
 * Deliberately broad. A false positive costs one reviewed line in
 * ALLOWED_ASYNC_STORAGE_KEYS; a false negative costs a credential leak. If this
 * pattern flags something legitimate, that is the check working — add the key
 * below with a reason, so the exception shows up in a diff instead of a habit.
 */
export const SENSITIVE_KEY_PATTERN =
  /token|secret|key|sk|password|pin|credential|auth|session|jwt|bearer/i;
// `auth|session|jwt|bearer` are beyond the pattern the audit suggested. They
// were added because the original one let `@auth:memberId` through — a key the
// deleted module actually wrote. Naming the namespace rather than the value is
// a common way to smuggle a credential past a name-based check.

/**
 * Reviewed exceptions: names that trip the pattern but hold nothing sensitive.
 * Adding to this list is a security decision. Justify it in the comment.
 */
export const ALLOWED_ASYNC_STORAGE_KEYS: ReadonlyArray<string> = [
  // Matches on "KEY" in the identifier. Value is "telemetryConsent" — a boolean
  // opt-in flag recording whether the user agreed to diagnostics (H-08). No user
  // data, and it must be readable before any telemetry decision, so the Keychain
  // would be the wrong home for it.
  "TELEMETRY_CONSENT_KEY",
];

/**
 * The AsyncStorage keys the deleted module wrote to.
 *
 * Deleting the code does not delete what it already wrote. Any device that ran
 * a build where these were populated still has the tokens and the encryption
 * key sitting in a plain file, and they will stay there until something removes
 * them — an uninstall is not guaranteed, and a restored backup brings them back.
 */
export const LEGACY_INSECURE_KEYS: ReadonlyArray<string> = [
  "@auth:accessToken",
  "@auth:refreshToken",
  "@auth:accessTokenExpirationDate",
  "@auth:memberId",
  "@auth:keySK",
];

/**
 * One-time cleanup of the legacy plaintext store.
 *
 * Safe to call on every launch — multiRemove on absent keys is a no-op, so this
 * needs no "has it run yet" flag that could itself fail. Cheap enough not to
 * warrant one.
 *
 * REMOVE THIS after two release cycles, once the install base has turned over.
 * Target: delete on or after 2027-02-01, along with LEGACY_INSECURE_KEYS.
 *
 * Never throws: a storage error at startup must not stop the app from booting.
 */
export const cleanupLegacyTokenStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([...LEGACY_INSECURE_KEYS]);
  } catch {
    // Best-effort. Retried on the next launch.
  }
};
