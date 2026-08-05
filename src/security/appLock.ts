/**
 * Whether the user has switched on the app-open biometric lock.
 *
 * ===========================================================================
 * WHY THIS MODULE EXISTS
 * ===========================================================================
 * `useCheckBio` used to gate the lock on `userInfo.isFaceRecognition`. No such
 * field is produced anywhere: the flag is `isFaceResgEnabled`, and it comes from
 * GET api/v1/Security/SecurityInformation — not from the member record that
 * populates `userInfo`. So the gate read `undefined` on every launch, took the
 * "user has not switched the lock on" branch, and went straight to the
 * Dashboard. The prompt could not appear for anyone, whatever they had toggled.
 *
 * That is the same fail-open shape as H-14 itself, one level up: the H-14 fix
 * made every branch below the gate fail closed, but the gate was never reached.
 *
 * ===========================================================================
 * WHY THE VALUE IS CACHED
 * ===========================================================================
 * Reading the flag over the network makes a transient API failure equivalent to
 * "the lock is off" — which would reintroduce the bypass, just with a smaller
 * window. The last known value is therefore mirrored to disk and used whenever
 * the fetch cannot answer.
 *
 * An absent cache means this install has never seen the flag enabled, so there
 * is nothing to enforce and the user is let through. This is deliberate: the
 * switch is thrown in-app (Security.tsx writes the cache on toggle), so the only
 * way to reach an enabled-but-uncached state is enabling it on another device
 * and never once completing this call here. Holding every user at a lock screen
 * on an API blip is the worse failure.
 *
 * The value is not a secret — it says nothing an attacker with the handset
 * cannot learn by opening the app — so AsyncStorage is the right home for it.
 * Treating it as authoritative is what would be wrong, and nothing here does.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import ProfileService from "../services/profile";
import { log } from "../utils/logger";

const APP_LOCK_CACHE = "biometricAppLockEnabled";

/** The one field of GET api/v1/Security/SecurityInformation this module needs. */
type SecurityInformation = { isFaceResgEnabled?: boolean };

/**
 * This lookup sits between the splash screen and the Dashboard, and
 * ApiService sets no timeout on anything (audit finding M-03, still open). A
 * hung endpoint would therefore strand the user on the splash screen with no
 * way out but force-quitting. Cap it here rather than wait for M-03: the cached
 * value is a perfectly good answer, and a slow security check must not become
 * an unopenable app.
 */
const LOOKUP_TIMEOUT_MS = 8000;

const withTimeout = async <T>(work: Promise<T>): Promise<T | null> => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      work,
      new Promise<null>((resolve) => {
        timer = setTimeout(() => resolve(null), LOOKUP_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
};

/** Last known value. Never throws: an unreadable cache means "not enabled". */
export const readCachedAppLock = async (): Promise<boolean> => {
  try {
    return (await AsyncStorage.getItem(APP_LOCK_CACHE)) === "true";
  } catch {
    return false;
  }
};

/**
 * Mirror the flag to disk. Call this wherever the switch is thrown, so the lock
 * survives a launch where the security endpoint is unreachable.
 */
export const cacheAppLock = async (enabled: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(APP_LOCK_CACHE, enabled ? "true" : "false");
  } catch {
    // Best-effort. The fetch is the primary source; this only covers its outage.
  }
};

/** Drop the cache on logout — the next account has its own setting. */
export const clearCachedAppLock = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(APP_LOCK_CACHE);
  } catch {
    // A logout must complete regardless.
  }
};

/**
 * Is the app-open lock on for this user?
 *
 * Authoritative when the call succeeds, last-known-value when it does not.
 */
export const isAppLockEnabled = async (): Promise<boolean> => {
  try {
    const response = await withTimeout(ProfileService.getSeccurityInfo());
    if (response === null) {
      log.warn("[biometrics] security settings timed out, using cached lock");
      return readCachedAppLock();
    }
    if (response?.status === 200) {
      const enabled = !!(response.data as SecurityInformation)
        ?.isFaceResgEnabled;
      await cacheAppLock(enabled);
      return enabled;
    }
    log.warn("[biometrics] security settings unavailable, using cached lock", {
      status: response?.status,
    });
  } catch {
    log.warn("[biometrics] security settings unreachable, using cached lock");
  }

  return readCachedAppLock();
};
