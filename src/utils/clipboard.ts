import Clipboard from "@react-native-clipboard/clipboard";
import { NativeModules } from "react-native";

// Wallet addresses, transaction hashes and MFA setup keys should not stay on
// the clipboard, because any other installed app can read it. So every copy is
// cleared automatically after this long.
export const CLEAR_CLIPBOARD_AFTER_MS = 30_000;

let clearClipboardTimer: ReturnType<typeof setTimeout> | null = null;

// Fallback only, for when the SecureClipboard native module is unavailable. A
// setTimeout is paused while the app is backgrounded and dies with the
// process, and the getString() check raises the iOS paste banner, so it is
// never used alongside a native write (L-13). Only the latest copy keeps a
// timer; it only clears our own text, never something copied since.
const clearAfter = (text: string, ttlMs: number): void => {
  if (clearClipboardTimer) {
    clearTimeout(clearClipboardTimer);
  }
  clearClipboardTimer = setTimeout(async () => {
    clearClipboardTimer = null;
    try {
      const current = await Clipboard.getString();
      if (current === text) {
        Clipboard.setString("");
      }
    } catch {
      // fail silently — clearing is best-effort
    }
  }, ttlMs);
};

// Callers routinely pass optional values (`reffInfo?.referralCode`, a seed
// parsed out of an otpauth:// URI that may not match), so accept nullish and
// no-op rather than making every call site guard.
//
// The write goes through SecureClipboard so the expiry survives a backgrounded
// or killed app: iOS gets a pasteboard expiration date, Android an AlarmManager
// clear. Falls back to a plain write with the JS clear if the module is
// missing or the native write fails.
//
// For values that are meant to be shared and are NOT secret (a payment link, a
// terms link), pass `autoClear = false` to copy without auto-clearing.
export const copyEphemeral = (
  text: string | null | undefined,
  label = "Value",
  ttlMs = CLEAR_CLIPBOARD_AFTER_MS,
  autoClear = true
): void => {
  if (!text) return;
  if (!autoClear) {
    Clipboard.setString(text);
    return;
  }
  const fallback = () => {
    Clipboard.setString(text);
    clearAfter(text, ttlMs);
  };
  const secureClipboard = NativeModules.SecureClipboard;
  if (!secureClipboard?.setEphemeralString) {
    fallback();
    return;
  }
  secureClipboard
    .setEphemeralString(text, label, ttlMs)
    .then((copied: boolean) => {
      if (!copied) fallback();
    })
    .catch(fallback);
};

/**
 * Clears a copied value whose TTL ran out while nothing could clear it. Call
 * on launch and whenever the app returns to the foreground. No-op on iOS,
 * where the pasteboard enforces the expiration date itself.
 */
export const clearExpiredClipboard = (): void => {
  try {
    NativeModules.SecureClipboard?.clearExpired?.();
  } catch {
    // best-effort
  }
};

/**
 * For secrets (the TOTP setup key). `@react-native-clipboard/clipboard` cannot
 * flag a clip, so this goes through the in-app SecureClipboard module: Android
 * marks the clip IS_SENSITIVE (masked in the copy preview, kept out of
 * keyboard suggestions); iOS writes it localOnly (no Universal Clipboard) with
 * an expiration date. Both platforms clear it natively after the TTL (L-13),
 * so there is no JS timer (and no iOS paste banner from its getString check).
 *
 * Resolves false — and copies nothing — when the flagged write is unavailable,
 * so a secret never lands on the clipboard unflagged (VAPT L-06).
 */
export const copySensitive = async (
  text: string | null | undefined,
  label = "Value",
  ttlMs = CLEAR_CLIPBOARD_AFTER_MS
): Promise<boolean> => {
  if (!text) return false;
  const secureClipboard = NativeModules.SecureClipboard;
  if (!secureClipboard?.setSensitiveString) return false;
  try {
    const copied: boolean = await secureClipboard.setSensitiveString(
      text,
      label,
      ttlMs
    );
    return copied;
  } catch {
    return false;
  }
};
