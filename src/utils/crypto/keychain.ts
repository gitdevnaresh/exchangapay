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

import * as Keychain from "react-native-keychain";

/**
 * Write options for everything this module owns.
 *
 * accessible: AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY
 *   The `_THIS_DEVICE_ONLY` suffix is the part that matters — it excludes the
 *   item from encrypted backups and from device-to-device migration, so an
 *   extracted backup no longer yields the app's session state.
 *
 *   WHEN_UNLOCKED_THIS_DEVICE_ONLY is one notch stronger, and is deliberately
 *   NOT used: this app wakes for FCM background messages, and state written
 *   while the handset is locked would fail silently under that flag. Failing
 *   writes are a worse outcome than a locked-device read window that already
 *   requires the device to have been unlocked once since boot.
 *
 * storage: AES_GCM_NO_AUTH (Android)
 *   Android Keystore AES-GCM without a biometric prompt. `AES_GCM` would demand
 *   user authentication on every read, which redux-persist does constantly.
 *
 * securityLevel is deliberately unset. Requesting SECURE_HARDWARE makes
 * react-native-keychain throw outright on devices with no TEE, which would take
 * persistence down entirely on that hardware; the default already prefers
 * hardware backing where it exists.
 */
export const SECURE_WRITE_OPTIONS: Keychain.SetOptions = {
  accessible: Keychain.ACCESSIBLE.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
  storage: Keychain.STORAGE_TYPE.AES_GCM_NO_AUTH,
};

/**
 * redux-persist storage adapter. One Keychain entry per persist key, with the
 * service name doubling as the entry name (redux-persist uses a single key,
 * `persist:root`, so this is one entry in practice).
 */
export const createKeychainStorage = () => ({
  async getItem(key: string): Promise<string | null> {
    const credentials = await Keychain.getGenericPassword({ service: key });
    return credentials ? credentials.password : null;
  },

  async setItem(key: string, value: string): Promise<void> {
    await Keychain.setGenericPassword("persist", value, {
      ...SECURE_WRITE_OPTIONS,
      service: key,
    });
  },

  async removeItem(key: string): Promise<void> {
    await Keychain.resetGenericPassword({ service: key });
  },
});
