/**
 * H-04 — device attestation (Tier 1: the only real enforcement).
 *
 * Everything in deviceIntegrity.ts runs inside the process an attacker controls
 * and can therefore be patched out. Attestation cannot: the verdict is produced
 * by the platform (Google Play services / Apple's DeviceCheck) and signed with a
 * key the app never sees, so only your *backend* can meaningfully check it.
 *
 * This module is the client half. It obtains a token and hands it to the API
 * layer, which attaches it as X-Device-Attestation. It is intentionally inert
 * until both halves below are done.
 *
 * ─── REMAINING WORK (cannot be completed from this repo) ────────────────────
 *
 * 1. NATIVE MODULE — this file talks to a native module through the adapter
 *    below and no-ops while one is absent. Provide either:
 *      Android  `PlayIntegrityModule.requestToken(nonce, cloudProjectNumber)`
 *               using com.google.android.play:integrity. Needs the Play Integrity
 *               API enabled for the app in Play Console and the Google Cloud
 *               project number wired into Environment.js (see CLOUD_PROJECT key).
 *      iOS      `AppAttestModule.attest(nonce)` using DCAppAttestService. Needs
 *               the com.apple.developer.devicecheck.appattest-environment
 *               entitlement, which must be enabled on the provisioning profile
 *               FIRST — adding the entitlement without it breaks code signing.
 *
 * 2. BACKEND VERIFICATION — the part that actually enforces anything:
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
  requestToken?: (nonce: string, cloudProjectNumber?: string) => Promise<string>;
  attest?: (nonce: string) => Promise<string>;
}

/** Tokens are short-lived by design; re-request rather than hold one for long. */
const TOKEN_TTL_MS = 60_000;
const REQUEST_TIMEOUT_MS = 5000;

let cachedToken: string | null = null;
let cachedAt = 0;
let inFlight: Promise<string | null> | null = null;

const getNativeModule = (): AttestationNativeModule | null => {
  const mod =
    Platform.OS === "android"
      ? (NativeModules as any).PlayIntegrityModule
      : (NativeModules as any).AppAttestModule;
  return mod ?? null;
};

/** True once the native module is present — lets callers skip the work entirely. */
export const isAttestationAvailable = (): boolean => getNativeModule() !== null;

const getCloudProjectNumber = (): string | undefined => {
  try {
    return (getAllEnvData() as any)?.oAuthConfig?.playIntegrityCloudProject;
  } catch {
    return undefined;
  }
};

/**
 * Placeholder nonce. Replace with a server-issued, single-use value as soon as
 * the backend endpoint exists — a client-generated nonce does not prevent replay.
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
 * Returns a fresh-enough attestation token, or null when attestation is
 * unavailable, unconfigured or failing. Never throws, never rejects.
 *
 * Concurrent callers share one in-flight request — the API interceptor runs on
 * every request and Play Integrity is rate-limited, so fanning out would get the
 * app throttled.
 */
export const getAttestationToken = async (
  nonce?: string
): Promise<string | null> => {
  if (!isAttestationAvailable()) return null;

  const now = Date.now();
  if (cachedToken && now - cachedAt < TOKEN_TTL_MS) return cachedToken;
  if (inFlight) return inFlight;

  inFlight = requestToken(nonce ?? generateNonce())
    .then((token) => {
      if (token) {
        cachedToken = token;
        cachedAt = Date.now();
      }
      return token;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
};

/** Call on logout — the token is bound to a device/session, not to the next user. */
export const clearAttestationToken = (): void => {
  cachedToken = null;
  cachedAt = 0;
};
