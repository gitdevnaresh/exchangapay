/**
 * The at-rest encryption key for persisted Redux state (security finding H-05).
 *
 * ---------------------------------------------------------------------------
 * WHY THIS EXISTS AT ALL
 * ---------------------------------------------------------------------------
 * The previous transform took its key from the member record: it read
 * `userInfoService` out of the Keychain and used `userInfo.sk`. That has two
 * fatal problems.
 *
 *   1. There is no key before login. `getSecretKey()` returned null, `KEY.sk`
 *      threw, and the inbound transform caught it and returned the state
 *      UNENCRYPTED. A failure mode that silently writes plaintext is worse than
 *      no encryption, because it looks like it is working.
 *
 *   2. Reading the Keychain is asynchronous, so the transform had to be async —
 *      and redux-persist transforms are applied synchronously
 *      (`transforms.reduce(...)` then `JSON.stringify`). An async transform
 *      returns a Promise, `JSON.stringify(Promise)` is `{}`, and rehydration
 *      hands the reducer a Promise instead of state. That is almost certainly
 *      the "redux-persist issue" the transform was disabled to debug.
 *
 * So the key here is: (a) independent of login, (b) a random 256 bits rather
 * than something derived from data, and (c) loaded into memory once at startup
 * so the transform can read it synchronously.
 *
 * ---------------------------------------------------------------------------
 * WHAT THIS DOES AND DOES NOT BUY
 * ---------------------------------------------------------------------------
 * Be clear-eyed: this key lives in the same Keychain as the blob it protects.
 * An attacker who can dump the Keychain gets both. Encrypting the blob raises
 * the bar against partial extractions, backup scraping and anything reading the
 * store file directly — it does not defeat a full Keychain compromise.
 *
 * The defence that does work against that is not storing the secrets in the
 * first place, which is what the strip transform in encryptionTransfermation.tsx
 * handles. These two changes are complementary and neither replaces the other.
 */

import QuickCrypto from "react-native-quick-crypto";
import { Buffer } from "@craftzdog/react-native-buffer";
import * as Keychain from "react-native-keychain";
import { SECURE_WRITE_OPTIONS } from "./keychain";

/** Versioned so a future key-derivation change can migrate rather than collide. */
const PERSIST_KEY_SERVICE = "exchangapay.persistKey.v1";
const PERSIST_KEY_BYTES = 32;

/**
 * Held in memory for the process lifetime. This is what makes the synchronous
 * transform possible; see the header. It is never written to Redux, so it
 * cannot be persisted back into the blob it encrypts.
 */
let cachedKey: Uint8Array | null = null;

/** Synchronous read for the transform. Null until bootstrap has completed. */
export const getPersistKey = (): Uint8Array | null => cachedKey;

const generate = (): Uint8Array =>
  Uint8Array.from(QuickCrypto.randomBytes(PERSIST_KEY_BYTES));

const write = async (key: Uint8Array): Promise<void> => {
  await Keychain.setGenericPassword(
    "persistKey",
    Buffer.from(key).toString("base64"),
    { ...SECURE_WRITE_OPTIONS, service: PERSIST_KEY_SERVICE }
  );
};

/**
 * Load the key, creating it on first launch. Call once, before persistence
 * starts. Idempotent — later calls return the cached key.
 *
 * Throws if the Keychain is unreachable. The caller decides what that means;
 * see startPersistence() in src/store/index.tsx, which chooses to start the app
 * with no persisted state rather than hang on the splash screen.
 */
export const loadOrCreatePersistKey = async (): Promise<Uint8Array> => {
  if (cachedKey) return cachedKey;

  const existing = await Keychain.getGenericPassword({
    service: PERSIST_KEY_SERVICE,
  });

  if (existing && existing.password) {
    const stored = Uint8Array.from(Buffer.from(existing.password, "base64"));
    if (stored.length === PERSIST_KEY_BYTES) {
      cachedKey = stored;
      return cachedKey;
    }
    // A wrong-length entry means a corrupt or half-written record. Replacing it
    // orphans whatever it used to encrypt, which is the correct trade: that
    // data is already undecryptable, and the alternative is a permanent failure.
  }

  const fresh = generate();
  await write(fresh);
  cachedKey = fresh;
  return cachedKey;
};

/**
 * Replace the key with a fresh one. Called on logout, after the persisted blob
 * has been purged: if a purge is interrupted or a copy survives in a backup or
 * a forensic image, rotating the key makes the leftovers unreadable rather than
 * merely deleted.
 *
 * Best-effort by design — a logout must complete even if the Keychain refuses.
 */
export const rotatePersistKey = async (): Promise<void> => {
  try {
    const fresh = generate();
    await write(fresh);
    cachedKey = fresh;
  } catch {
    // Leave the old key in place; the blob it protected has already been purged.
  }
};

/** Test seam. */
export const __resetPersistKeyCache = (): void => {
  cachedKey = null;
};
