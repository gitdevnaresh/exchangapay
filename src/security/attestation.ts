/**
 * H-04 — device attestation (Tier 1: the only real enforcement).
 *
 * Everything in deviceIntegrity.ts runs inside the process an attacker controls
 * and can therefore be patched out. Attestation cannot: the verdict is produced
 * by the platform (Google Play services / Apple's DeviceCheck) and signed with a
 * key the app never sees, so only your *backend* can meaningfully check it.
 *
 * This module is the client half. It obtains a token and hands it to the API
 * layer, which attaches it as X-Device-Attestation on the requests listed in
 * attestationPolicy.ts.
 *
 * ─── STATE OF PLAY ──────────────────────────────────────────────────────────
 *
 * 1. NATIVE MODULES — DONE, but dormant until each platform is provisioned:
 *      Android  android/app/src/main/java/com/exchangapay/app/PlayIntegrityModule.kt
 *               Needs the Play Integrity API enabled for the app in Play Console.
 *               For builds not installed from Play, also set the Google Cloud
 *               project number (environments/*.js → attestation
 *               .playIntegrityCloudProject). Without either, the request fails
 *               and this module reports no token.
 *      iOS      ios/AppAttest/AppAttestModule.m
 *               Needs the com.apple.developer.devicecheck.appattest-environment
 *               entitlement, which must be enabled on the provisioning profile
 *               FIRST — adding the entitlement without it breaks code signing.
 *               Until then DCAppAttestService reports unsupported and this module
 *               reports no token. The iOS token is a JSON envelope, not an opaque
 *               string; its shape is documented in AppAttestModule.m.
 *
 * 2. BACKEND VERIFICATION — STILL OUTSTANDING, and the part that actually
 *    enforces anything. Everything above is a courier service until this exists:
 *      - Android: decode the integrity verdict server-side. Reject unless
 *        deviceIntegrity contains MEETS_DEVICE_INTEGRITY (rejects rooted and
 *        emulated devices) and appIntegrity is PLAY_RECOGNIZED (rejects
 *        repackaged builds — this is what neutralises finding C-03).
 *      - iOS: verify the attestation object against Apple's root, pin the
 *        resulting public key to the account, and verify the assertion signature
 *        on each sensitive request.
 *      - Enforce at the API layer. A failed attestation must make the BACKEND
 *        reject the request. An app that merely hides a button is not a control.
 *      - The nonce must be server-issued and single-use, or the token is
 *        replayable from a clean device.
 *
 * Until step 2 exists, the header is advisory only and this module fails open —
 * a missing token must never stop a legitimate user transacting.
 */

import { NativeModules, Platform } from "react-native";
import { getAllEnvData } from "../../Environment";

interface AttestationNativeModule {
  requestToken?: (
    nonce: string,
    cloudProjectNumber?: string
  ) => Promise<string>;
  attest?: (nonce: string) => Promise<string>;
}

const REQUEST_TIMEOUT_MS = 5000;

// An attestation is tied to one server-issued nonce. Caching it, even briefly,
// would allow the same assertion to be attached to two sensitive operations and
// defeats the server's single-use/replay check.
const inFlightByNonce = new Map<string, Promise<string | null>>();

const getNativeModule = (): AttestationNativeModule | null => {
  const mod =
    Platform.OS === "android"
      ? (NativeModules as any).PlayIntegrityModule
      : (NativeModules as any).AppAttestModule;
  return mod ?? null;
};

/** True once the native module is present — lets callers skip the work entirely. */
export const isAttestationAvailable = (): boolean => getNativeModule() !== null;

/**
 * Optional for builds installed from Google Play — Play links those to the right
 * Cloud project by itself. Required for anything sideloaded or distributed
 * outside Play, which includes most internal QA builds.
 */
const getCloudProjectNumber = (): string | undefined => {
  try {
    const env = getAllEnvData() as any;
    const configured =
      env?.attestation?.playIntegrityCloudProject ??
      // Original location. Kept as a fallback so an environment file that has
      // not been migrated still works rather than silently losing the setting.
      env?.oAuthConfig?.playIntegrityCloudProject;
    return configured ? String(configured) : undefined;
  } catch {
    return undefined;
  }
};

/**
 * Advisory-only fallback for deployments that have not enabled the server
 * challenge contract yet. It must never be used by an enforcing backend: a
 * client-generated value cannot make an attestation replay-resistant.
 */
const generateNonce = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;

const requestToken = async (nonce: string): Promise<string | null> => {
  const mod = getNativeModule();
  if (!mod) return null;

  const call =
    Platform.OS === "android"
      ? mod.requestToken?.(nonce, getCloudProjectNumber())
      : mod.attest?.(nonce);

  if (!call) return null;

  return new Promise<string | null>((resolve) => {
    let done = false;
    const finish = (value: string | null) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      resolve(value);
    };
    const timer = setTimeout(() => finish(null), REQUEST_TIMEOUT_MS);
    call.then((token) => finish(token || null)).catch(() => finish(null));
  });
};

/**
 * Returns an attestation bound to `nonce`, or null when attestation is
 * unavailable, unconfigured or failing. Never throws, never rejects.
 *
 * Only concurrent callers for the *same* nonce share work. A distinct
 * high-risk operation must obtain a fresh assertion, even when it happens less
 * than a minute after the previous one.
 */
export const getAttestationToken = async (
  nonce?: string
): Promise<string | null> => {
  if (!isAttestationAvailable()) return null;

  const requestNonce = nonce ?? generateNonce();
  const existing = inFlightByNonce.get(requestNonce);
  if (existing) return existing;

  const inFlight = requestToken(requestNonce).finally(() => {
    inFlightByNonce.delete(requestNonce);
  });
  inFlightByNonce.set(requestNonce, inFlight);
  return inFlight;
};

/** Call on logout — discard pending work tied to the previous user/session. */
export const clearAttestationToken = (): void => {
  inFlightByNonce.clear();
};
