import Clipboard from "@react-native-clipboard/clipboard";
import { NativeModules } from "react-native";

const clearAfter = (text: string, ttlMs: number): void => {
  setTimeout(async () => {
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
export const copyEphemeral = (
  text: string | null | undefined,
  label = "Value",
  ttlMs = 60_000
): void => {
  if (!text) return;
  Clipboard.setString(text);
  clearAfter(text, ttlMs);
};

/**
 * For secrets (the TOTP setup key). `@react-native-clipboard/clipboard` cannot
 * flag a clip, so this goes through the in-app SecureClipboard module: Android
 * marks the clip IS_SENSITIVE (masked in the copy preview, kept out of
 * keyboard suggestions); iOS writes it localOnly (no Universal Clipboard) with
 * an expiration date. The JS clear still runs as a backstop.
 *
 * Resolves false — and copies nothing — when the flagged write is unavailable,
 * so a secret never lands on the clipboard unflagged (VAPT L-06).
 */
export const copySensitive = async (
  text: string | null | undefined,
  label = "Value",
  ttlMs = 30_000
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
    if (copied) {
      clearAfter(text, ttlMs);
    }
    return copied;
  } catch {
    return false;
  }
};
