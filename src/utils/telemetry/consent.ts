/**
 * One consent decision, governing every telemetry channel (H-08, C-07).
 *
 * There used to be a crash-reporting consent for Crashlytics and nothing at all
 * for Sentry, which meant "the user said no to diagnostics" and "the app stops
 * sending diagnostics" were two different facts. Both channels now read the same
 * switch.
 *
 * DEFAULT IS OFF, and every failure path resolves to off. An unreadable consent
 * record is not permission.
 *
 * Consent is held in a module-level cache as well as on disk because Sentry's
 * `beforeSend` hook is synchronous — it has one chance to drop an event, and it
 * cannot await a read from storage. Same reason as the at-rest key in
 * src/utils/crypto/persistKey.ts.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import crashlytics from "@react-native-firebase/crashlytics";

/**
 * Renamed from "crashReportingConsent": this now governs Sentry as well, and a
 * key that names only one of the channels it controls invites someone to add a
 * second one. Nothing had ever written the old key — the setter had no callers —
 * so there is no stored value to migrate.
 */
const TELEMETRY_CONSENT_KEY = "telemetryConsent";

let cachedConsent = false;

/**
 * Synchronous read, for callers that cannot await — specifically Sentry's
 * beforeSend. Returns false until initializeTelemetry() has run, so events
 * raised before consent is known are dropped rather than sent optimistically.
 */
export const getTelemetryConsentSync = (): boolean => cachedConsent;

/** Async read straight from storage. Use this for UI state. */
export const hasTelemetryConsent = async (): Promise<boolean> => {
  try {
    return (await AsyncStorage.getItem(TELEMETRY_CONSENT_KEY)) === "true";
  } catch {
    return false;
  }
};

/**
 * Record the user's choice and apply it immediately to every channel.
 *
 * Withdrawal takes effect at once: the cache flips before the write, so an event
 * raised during the await is already being dropped.
 */
export const setTelemetryConsent = async (granted: boolean): Promise<void> => {
  cachedConsent = granted;
  try {
    await AsyncStorage.setItem(TELEMETRY_CONSENT_KEY, granted ? "true" : "false");
    await crashlytics().setCrashlyticsCollectionEnabled(granted);
  } catch {
    // A storage failure must not leave collection enabled on a "no".
    cachedConsent = false;
    await crashlytics().setCrashlyticsCollectionEnabled(false);
  }
};

/**
 * Load the stored decision at startup and apply it. Call once, early.
 *
 * NOTE FOR WHOEVER PICKS THIS UP: nothing calls setTelemetryConsent() yet.
 * There is no consent prompt and no settings toggle, so consent is never
 * granted, so NOTHING IS EVER SENT — not to Sentry, not to Crashlytics. That is
 * a safe default, but it means production error visibility is zero (M-12).
 *
 * To get error reporting back, wire setTelemetryConsent(true) to whichever of
 * these you decide on:
 *   - an onboarding consent prompt, or
 *   - a settings toggle, or
 *   - a launch-time default of `true`, if your legal position is that
 *     PII-stripped crash reporting is legitimate interest rather than consent.
 * The scrubbing and the absence of Session Replay hold either way — this switch
 * only controls whether events leave the device at all.
 */
export const initializeTelemetry = async (): Promise<void> => {
  const granted = await hasTelemetryConsent();
  cachedConsent = granted;
  try {
    await crashlytics().setCrashlyticsCollectionEnabled(granted);
  } catch {
    // Firebase unavailable; nothing is being collected either way.
  }
};

/** Test seam. */
export const __setTelemetryConsentCache = (value: boolean): void => {
  cachedConsent = value;
};

export { TELEMETRY_CONSENT_KEY };
