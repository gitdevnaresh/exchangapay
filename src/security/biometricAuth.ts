/**
 * Biometric authentication — security finding H-14.
 *
 * ===========================================================================
 * WHAT WAS WRONG, AND WHAT THIS FILE CAN AND CANNOT FIX
 * ===========================================================================
 * The app asked the OS "did the fingerprint match?" and branched on the boolean
 * that came back. That boolean is a JavaScript value inside a process the
 * attacker controls on a hooked device, so it can be made to say yes. Worse, it
 * did not need to be attacked at all: with no finger enrolled, `available` was
 * false and the code fell through to the Dashboard. Turning biometrics off in
 * device settings walked past the lock.
 *
 * There are two separate defects and only one of them is fixable in this file:
 *
 *   1. FAIL-OPEN LOGIC — "cannot check" was treated as "check passed", and a
 *      failed prompt was swallowed by an empty catch. That is fixed here and at
 *      the call sites: `requireUserPresence` reports one of four outcomes and
 *      never conflates them, and it offers the device passcode before giving up.
 *
 *   2. NOTHING IS PROVED TO THE SERVER — a local prompt is a UX control, not an
 *      authentication one. The fix is a signature the backend verifies against a
 *      registered public key; see SIGNATURE-BASED BIOMETRICS below. That half
 *      needs two endpoints that do not exist yet, so this module exposes the
 *      client side and stays honest about the gap rather than pretending a
 *      boolean is authentication.
 *
 * Be clear-eyed about what presence checks buy: they stop someone holding an
 * unlocked handset, and nothing more. They do not stop a modified app, and they
 * do not stop an attacker who lifted the bearer token out of storage and never
 * runs the app at all — for that the credential itself has to be biometrically
 * bound, which is REFRESH_TOKEN_WRITE_OPTIONS in utils/storage/keychainPolicy.ts.
 *
 * ===========================================================================
 * SIGNATURE-BASED BIOMETRICS — remaining work, cannot be completed from here
 * ===========================================================================
 * `signBiometricChallenge` below is complete and usable the moment the backend
 * offers:
 *
 *   POST /api/v1/Security/BiometricKey   { publicKey }   — one-time enrolment,
 *        stores the public key against the account. Must require an
 *        authenticated session, and must refuse to overwrite an existing key
 *        without step-up, or enrolment becomes the bypass.
 *
 *   GET  /api/v1/Security/BiometricChallenge  -> { challenge }  — a nonce that
 *        is server-issued, single-use and short-lived. A client-generated nonce
 *        proves nothing: it is replayable, which is why this module deliberately
 *        has no nonce generator and `signBiometricChallenge` will not run
 *        without a challenge handed to it.
 *
 * Then the SERVER verifies `signature` over `${challenge}:${userId}` against the
 * registered public key, on the sensitive request itself — not as a separate
 * "am I allowed" call whose answer the client could discard.
 */

import ReactNativeBiometrics, { BiometryType } from "react-native-biometrics";
import { log } from "../utils/logger";

/**
 * Constructed with `allowDeviceCredentials`, which is the whole point of the
 * fail-closed fix: a device with no enrolled finger can still prove owner
 * presence with its passcode. Only a device with no lock at all is unable to
 * answer, and that is the one case where we refuse.
 */
const biometrics = new ReactNativeBiometrics({ allowDeviceCredentials: true });

/** Biometrics only — used where a passcode is not an acceptable substitute. */
const strictBiometrics = new ReactNativeBiometrics({
  allowDeviceCredentials: false,
});

export type BiometricOutcome =
  /** The user proved presence — fingerprint, face, or device passcode. */
  | "confirmed"
  /** The user dismissed the prompt. A decision, not a failure. */
  | "cancelled"
  /** The sensor rejected them, or the prompt errored. */
  | "failed"
  /** The device cannot ask: no biometrics AND no passcode set. */
  | "unavailable";

export type BiometricStatus = {
  /** True when the device can authenticate its owner somehow. */
  canAuthenticate: boolean;
  /** True when a biometric sensor is enrolled and usable. */
  hasEnrolledBiometrics: boolean;
  biometryType?: BiometryType;
};

/**
 * What this device can actually do.
 *
 * Never throws: a probe failure reports "cannot authenticate", which callers
 * treat as a reason to refuse rather than a reason to continue.
 */
export const getBiometricStatus = async (): Promise<BiometricStatus> => {
  const [owner, strict] = await Promise.all([
    biometrics.isSensorAvailable().catch(() => ({ available: false } as any)),
    strictBiometrics
      .isSensorAvailable()
      .catch(() => ({ available: false } as any)),
  ]);

  return {
    canAuthenticate: !!owner.available,
    hasEnrolledBiometrics: !!strict.available,
    biometryType: strict.biometryType ?? owner.biometryType,
  };
};

/** Cancellation wording differs per platform and per failure; match broadly. */
const isCancellation = (value: unknown): boolean =>
  /cancel|dismiss|user.?denied|userfallback/i.test(String(value ?? ""));

/**
 * Ask the user to prove they are present.
 *
 * Returns an outcome, never a bare boolean, because the four cases need
 * different handling: "cancelled" is a user decision worth respecting quietly,
 * "failed" deserves a retry, and "unavailable" means this device cannot be
 * trusted with the operation at all. Collapsing them is how the original code
 * ended up treating "cannot check" as "check passed".
 *
 * Never throws.
 */
export const requireUserPresence = async (
  promptMessage: string,
  options?: { allowDeviceCredentials?: boolean }
): Promise<BiometricOutcome> => {
  const allowPasscode = options?.allowDeviceCredentials ?? true;
  const client = allowPasscode ? biometrics : strictBiometrics;

  try {
    const { available } = await client.isSensorAvailable();
    if (!available) {
      // FAIL CLOSED. The previous code navigated to the Dashboard here.
      return "unavailable";
    }

    const result = await client.simplePrompt({
      promptMessage,
      cancelButtonText: "Cancel",
    });

    if (result.success) return "confirmed";
    // The library resolves rather than rejects on dismissal.
    return isCancellation((result as any)?.error) ? "cancelled" : "failed";
  } catch (error) {
    // The empty catch this replaces meant a failed prompt did nothing at all —
    // the user pressed the button and the app sat there.
    if (isCancellation((error as any)?.message)) return "cancelled";
    log.warn("[biometrics] prompt could not complete");
    return "failed";
  }
};

/**
 * Human-readable reason to show when presence could not be established.
 * `confirmed` returns null so callers can use this directly in an if.
 */
export const describeBiometricOutcome = (
  outcome: BiometricOutcome
): string | null => {
  switch (outcome) {
    case "confirmed":
      return null;
    case "cancelled":
      return "Authentication was cancelled.";
    case "failed":
      return "We could not verify it was you. Please try again.";
    case "unavailable":
      return (
        "This action needs a screen lock. Set up a fingerprint, Face ID or " +
        "passcode in your device settings, then try again."
      );
  }
};

// ---------------------------------------------------------------------------
// Signature-based biometrics. Inert until the endpoints in the header exist.
// ---------------------------------------------------------------------------

/**
 * Whether the backend can verify biometric signatures.
 *
 * Deliberately a constant rather than a probe: a client that discovers its own
 * security requirements can be told there are none. Flip this in the same
 * change that ships the two endpoints, and not before — with it false, callers
 * fall back to `requireUserPresence`, which is weaker but works.
 */
export const isSignatureBiometricsEnabled = (): boolean => false;

/** True when this device already holds a biometric key pair. */
export const hasBiometricKey = async (): Promise<boolean> => {
  try {
    const { keysExist } = await strictBiometrics.biometricKeysExist();
    return keysExist;
  } catch {
    return false;
  }
};

/**
 * Create the device key pair and return the public key to register.
 *
 * The private key lives in the Secure Enclave / StrongBox and is bound to the
 * current biometric enrolment: adding a finger invalidates it, which is the
 * property that makes a later signature meaningful. Returns null on failure —
 * the caller must not treat enrolment as done.
 */
export const createBiometricKey = async (): Promise<string | null> => {
  try {
    const { publicKey } = await strictBiometrics.createKeys();
    return publicKey || null;
  } catch (error) {
    log.warn("[biometrics] key creation failed");
    return null;
  }
};

/**
 * Sign a SERVER-ISSUED challenge.
 *
 * `challenge` must come from the backend. There is no nonce generator in this
 * module on purpose: a value the client chose is replayable, so signing it
 * proves nothing that the boolean this finding is about did not already fail to
 * prove.
 *
 * Returns the signature, or null if the user declined or the key is gone (which
 * is what happens after a biometric enrolment change — that is the mechanism
 * working, and the caller should re-enrol).
 */
export const signBiometricChallenge = async (
  challenge: string,
  userId: string,
  promptMessage: string
): Promise<string | null> => {
  if (!challenge) {
    log.warn("[biometrics] refusing to sign without a server-issued challenge");
    return null;
  }

  try {
    const { success, signature } = await strictBiometrics.createSignature({
      promptMessage,
      payload: `${challenge}:${userId}`,
      cancelButtonText: "Cancel",
    });
    return success && signature ? signature : null;
  } catch (error) {
    log.warn("[biometrics] signing could not complete");
    return null;
  }
};

/**
 * Drop the device key pair. Call on logout: the key is registered against one
 * account, and the next person to sign in must not inherit it.
 */
export const clearBiometricKeys = async (): Promise<void> => {
  try {
    if (await hasBiometricKey()) {
      await strictBiometrics.deleteKeys();
    }
  } catch {
    // Best-effort; a logout must complete regardless.
  }
};
