/**
 * One set of Keychain / Keystore options, one accessor, one inventory —
 * security finding H-11.
 *
 * ===========================================================================
 * WHAT WAS WRONG
 * ===========================================================================
 * Using the Keychain was the right call, but every write passed a service name
 * and nothing else. Taking the platform defaults means, on iOS,
 * `kSecAttrAccessibleWhenUnlocked` *without* `ThisDeviceOnly` — so the login
 * token, the refresh token, the personal-data key and the whole member record
 * synced to iCloud and landed in every unencrypted iTunes backup. An extracted
 * backup yielded a working session.
 *
 * ===========================================================================
 * THE OPTIONS, AND WHY EACH ONE IS WHAT IT IS
 * ===========================================================================
 * `_THIS_DEVICE_ONLY` is the flag that closes the finding: it excludes the item
 * from backups and from device-to-device migration. It is on every entry below,
 * without exception.
 *
 * The rest is a judgement about read frequency, because an option that makes a
 * read fail is an option that logs the user out:
 *
 *   AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY  entries read on any code path that can
 *                                        run while the handset is locked — the
 *                                        access token (every API call), the
 *                                        member record, persisted state.
 *   WHEN_UNLOCKED_THIS_DEVICE_ONLY       entries only ever read with the user
 *                                        present — the refresh token.
 *
 * `securityLevel: SECURE_HARDWARE` is deliberately NOT requested.
 * react-native-keychain throws outright on hardware with no TEE rather than
 * degrading, which would take auth down entirely on those devices. The default
 * already prefers hardware backing where it exists, and `reportStorageBacking`
 * below records what was actually achieved so the gap is visible instead of
 * assumed.
 *
 * `STORAGE_TYPE.AES_GCM` and `ACCESS_CONTROL.BIOMETRY_*` both mean "prompt the
 * user on every read". See REFRESH_TOKEN_WRITE_OPTIONS for where that stands.
 */

import { Platform } from "react-native";
import * as Keychain from "react-native-keychain";
import { log } from "../logger";

/**
 * Every Keychain service this app owns.
 *
 * This is the list logout clears. It exists because logout used to reset two
 * services and leave the other five — the member record, the persisted state
 * blob, its encryption key and both chat identifiers all survived sign-out and
 * lived on until the next login happened to overwrite them.
 */
export const KEYCHAIN_SERVICES = {
  /** `{ token, expiryTime }` — read on every API request. */
  AUTH_TOKEN: "authTokenService",
  /** The refresh token, alone. Split out of AUTH_TOKEN by H-11. */
  REFRESH_TOKEN: "refreshTokenService",
  /** The member record, including `sk`. */
  USER_INFO: "userInfoService",
  /** redux-persist blob. The service name is redux-persist's own key. */
  PERSIST_ROOT: "persist:root",
  /** At-rest key for the blob above. Versioned; see crypto/persistKey.ts. */
  PERSIST_KEY: "exchangapay.persistKey.v1",
  /** Support-chat conversation id. Not a secret, but it identifies the user. */
  CHAT_CONVERSATION: "chat_conversation_Id",
  /** Support-chat vendor scope id. */
  CHAT_BOT: "chat_bot",
} as const;

export type KeychainService =
  (typeof KEYCHAIN_SERVICES)[keyof typeof KEYCHAIN_SERVICES];

/** Everything logout must clear. Order does not matter; all are independent. */
export const ALL_KEYCHAIN_SERVICES: ReadonlyArray<string> =
  Object.values(KEYCHAIN_SERVICES);

/**
 * Default write options. Used for everything that can be read while the device
 * is locked — which, in an app that wakes for push messages, is most things.
 */
export const SECURE_WRITE_OPTIONS: Keychain.SetOptions = {
  accessible: Keychain.ACCESSIBLE.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
  storage: Keychain.STORAGE_TYPE.AES_GCM_NO_AUTH,
};

/**
 * Write options for the refresh token.
 *
 * The refresh token is the entry that matters most: it is long-lived and mints
 * access tokens indefinitely, so reading it once buys persistent access that
 * survives a password change unless the backend revokes it. It therefore gets
 * the strictest setting that does not break the app:
 *
 *   WHEN_UNLOCKED_THIS_DEVICE_ONLY — unreadable while the handset is locked,
 *   never in a backup, never migrated to a new device.
 *
 * ---------------------------------------------------------------------------
 * ON THE BIOMETRIC GATE THE AUDIT ASKED FOR
 * ---------------------------------------------------------------------------
 * `ACCESS_CONTROL.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE` (with, on Android,
 * `STORAGE_TYPE.AES_GCM`) is NOT set, and that is a deliberate decision rather
 * than an oversight.
 *
 * Those flags make every *read* prompt. In this app the refresh token is not
 * read by a user action — it is read by a timer in useTokenRefresh, sixty
 * seconds before the access token expires, wherever the app happens to be at
 * that moment. Enabling them would put an unexplained Face ID sheet in front of
 * the user roughly once an hour, and would hard-fail whenever that timer lands
 * while the app is backgrounded, ending the session. That is the same argument
 * the audit itself makes for not gating the access token.
 *
 * If the flow changes so a refresh can be tied to a user action, switch it on
 * here: `readSecret` already classifies "cancelled" and "invalidated"
 * separately from "empty", and every caller already refuses to treat either as
 * a signed-out session. The handling is in place; only these two lines change.
 */
export const REFRESH_TOKEN_WRITE_OPTIONS: Keychain.SetOptions = {
  accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  storage: Keychain.STORAGE_TYPE.AES_GCM_NO_AUTH,
};

/**
 * Outcome of a read.
 *
 * The distinction that matters is `empty` versus everything else. `empty` means
 * there is genuinely no stored session and signing the user out is correct.
 * Every other status means we could not read the entry *right now*, and
 * treating those as "no session" is exactly the silent-logout bug the audit
 * flagged: every call site caught, returned null, and let the caller conclude
 * the user was signed out.
 */
export type SecureReadStatus =
  /** Entry read successfully. */
  | "ok"
  /** No such entry. The only status that means "signed out". */
  | "empty"
  /** Device locked, or item not accessible yet. Transient — retry later. */
  | "locked"
  /** User dismissed an authentication prompt. Transient — user-driven. */
  | "cancelled"
  /** Biometric enrolment changed or the key was destroyed. Permanent. */
  | "invalidated"
  /** Anything else. Treated as transient, because guessing costs a session. */
  | "error";

export type SecureReadResult = {
  status: SecureReadStatus;
  /** The stored value, present only when status is "ok". */
  value: string | null;
  /** The stored username, present only when status is "ok". */
  username: string | null;
};

/**
 * Best-effort classification of a native Keychain rejection.
 *
 * The platforms disagree on codes and wording, and react-native-keychain passes
 * both through mostly untouched, so this matches on text. It is deliberately
 * conservative: anything unrecognised becomes "error", never "empty", because
 * the cost of a wrong "empty" is an unexplained sign-out and the cost of a
 * wrong "error" is a retry.
 */
export const classifyKeychainError = (error: unknown): SecureReadStatus => {
  const message = [
    (error as any)?.message,
    (error as any)?.code,
    String(error ?? ""),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  // Android: KeyPermanentlyInvalidatedException, raised after a fingerprint or
  // face is enrolled or removed. iOS drops the item instead, which surfaces as
  // "empty" — correct there, since the item really is gone.
  if (/invalidat/.test(message)) return "invalidated";

  // -128 errSecUserCanceled (iOS); "cancel"/code 10 and 13 (Android BiometricPrompt).
  if (/cancel|-128\b/.test(message)) return "cancelled";

  // -25308 errSecInteractionNotAllowed — the item exists but the device is
  // locked and its accessibility class forbids reading it right now.
  if (/-25308|interaction not allowed|not accessible|device is locked|user not authenticated/.test(message)) {
    return "locked";
  }

  return "error";
};

/**
 * Read one entry. Never throws.
 *
 * This is the single accessor. Before it existed, `getTokenData()` called
 * `getGenericPassword()` with no service name at all — reading the *default*
 * entry rather than "authTokenService", so it saw a different item than the
 * rest of the app.
 */
export const readSecret = async (
  service: string,
  options?: Keychain.GetOptions
): Promise<SecureReadResult> => {
  try {
    const credentials = await Keychain.getGenericPassword({
      ...options,
      service,
    });
    if (!credentials) {
      return { status: "empty", value: null, username: null };
    }
    return {
      status: "ok",
      value: credentials.password,
      username: credentials.username,
    };
  } catch (error) {
    const status = classifyKeychainError(error);
    // The service name is a constant from the inventory above, never a secret.
    log.warn("[keychain] read failed", { service, status });
    return { status, value: null, username: null };
  }
};

/**
 * Read one entry, flattened to its value.
 *
 * For callers that genuinely cannot act on the distinction. Prefer readSecret:
 * null here is ambiguous between "no session" and "locked right now", and that
 * ambiguity is what the finding is about.
 */
export const readSecretValue = async (
  service: string,
  options?: Keychain.GetOptions
): Promise<string | null> => (await readSecret(service, options)).value;

/**
 * Cipher families that mean the Android Keystore actually held the key. Anything
 * else on Android is the legacy Facebook-conceal path, which is not Keystore.
 */
const ANDROID_KEYSTORE_STORAGE: ReadonlyArray<string> = [
  Keychain.STORAGE_TYPE.AES_GCM_NO_AUTH,
  Keychain.STORAGE_TYPE.AES_GCM,
  Keychain.STORAGE_TYPE.RSA,
];

/**
 * Warn when an entry did not land in the storage we asked for.
 *
 * We do not refuse to store it — on a device with no Keystore hardware the
 * alternative is an app that cannot sign in — but an install running below the
 * intended protection should not be invisible. This is the observable stand-in
 * for `securityLevel: SECURE_HARDWARE`, which would throw instead of degrade.
 *
 * iOS reports `storage: "keychain"` for everything, so there is nothing to
 * compare there; the accessibility class is the control that matters on that
 * platform and it is set on every write.
 */
const reportStorageBacking = (
  service: string,
  result: false | Keychain.Result
) => {
  if (!result) {
    log.warn("[keychain] write reported failure", { service });
    return;
  }
  if (Platform.OS !== "android") return;

  const storage = (result as Keychain.Result).storage;
  if (storage && !ANDROID_KEYSTORE_STORAGE.includes(storage)) {
    log.warn("[keychain] entry stored below the intended protection", {
      service,
      storage,
    });
  }
};

/**
 * Write one entry with the shared options.
 *
 * Throws on failure, unlike the reads. A write that silently does nothing means
 * the next read finds no session; callers that can tolerate that catch it
 * explicitly.
 */
export const writeSecret = async (
  service: string,
  username: string,
  value: string,
  options: Keychain.SetOptions = SECURE_WRITE_OPTIONS
): Promise<void> => {
  const result = await Keychain.setGenericPassword(username, value, {
    ...options,
    service,
  });
  reportStorageBacking(service, result);
};

/** Delete one entry. Never throws — a cleanup must not block a sign-out. */
export const resetSecret = async (service: string): Promise<void> => {
  try {
    await Keychain.resetGenericPassword({ service });
  } catch (error) {
    log.warn("[keychain] reset failed", { service });
  }
};

/**
 * Delete every entry in the inventory.
 *
 * This is what logout calls. Resetting a subset is how the member record and
 * the persisted state blob came to outlive the session that created them.
 */
export const clearAllSecureEntries = async (): Promise<void> => {
  await Promise.all(ALL_KEYCHAIN_SERVICES.map((service) => resetSecret(service)));
};
