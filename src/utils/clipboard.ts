

import Clipboard from "@react-native-clipboard/clipboard";

export const copyEphemeral = (text: string, label = "Value", ttlMs = 60_000): void => {
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
