/**
 * Keychain / Keystore access for persisted state (security finding H-05).
 *
 * Replaces `redux-persist-keychain-storage@0.1.1` — 27 lines, no tests, last
 * published around 2018, and taking every default. The code below is not much
 * longer, but the defaults are ours to set, which is the entire point: the
 * previous adapter wrote with `ACCESSIBLE.AFTER_FIRST_UNLOCK`, and that flag
 * puts the item in iCloud and iTunes backups. Session state and the key that
 * protects it should not leave the handset.
 */

import {
  readSecretValue,
  resetSecret,
  SECURE_WRITE_OPTIONS,
  writeSecret,
} from "../storage/keychainPolicy";

/**
 * H-11 consolidated the write options this module used to define into
 * src/utils/storage/keychainPolicy.ts, so that every entry in the app —
 * tokens, member record, persisted state — is written with one reviewed set
 * rather than three that drift apart. Re-exported because existing callers
 * import it from here.
 *
 * The reasoning behind AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY rather than
 * WHEN_UNLOCKED_THIS_DEVICE_ONLY, which applies to persisted state as much as
 * to the tokens, now lives with the constant.
 */
export { SECURE_WRITE_OPTIONS };

/**
 * redux-persist storage adapter. One Keychain entry per persist key, with the
 * service name doubling as the entry name (redux-persist uses a single key,
 * `persist:root`, so this is one entry in practice).
 */
export const createKeychainStorage = () => ({
  async getItem(key: string): Promise<string | null> {
    return readSecretValue(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    await writeSecret(key, "persist", value);
  },

  async removeItem(key: string): Promise<void> {
    await resetSecret(key);
  },
});
