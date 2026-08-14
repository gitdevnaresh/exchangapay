

import Clipboard from "@react-native-clipboard/clipboard";

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
