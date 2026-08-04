/**
 * Gate for the operations that hurt most if the device is attacker-controlled:
 * crypto withdrawal, card PIN reveal, credential change.
 *
 * Follows the audit's Tier-2 guidance — warn and degrade, do not hard-block
 * everything. A blanket block generates support load and is patched out in
 * minutes anyway, so:
 *
 *   compromised  block these three operations, explain why, offer no override.
 *                The user still has a fully working app for everything else.
 *   suspect      warn once and let the user proceed deliberately.
 *   ok/unknown   no interruption at all.
 *
 * Enforcement is off in __DEV__ (see isEnforcementEnabled) so emulators and debug
 * builds behave normally for developers and QA.
 */

import { Alert } from "react-native";
import crashlytics from "@react-native-firebase/crashlytics";
import { isEnforcementEnabled } from "./deviceIntegrity";
import { getIntegrityReport } from "./integrityState";

export type HighRiskOperation =
  | "CRYPTO_WITHDRAWAL"
  | "CARD_PIN_REVEAL"
  | "PASSWORD_CHANGE";

const OPERATION_LABELS: Record<HighRiskOperation, string> = {
  CRYPTO_WITHDRAWAL: "Crypto withdrawals",
  CARD_PIN_REVEAL: "Viewing your card PIN",
  PASSWORD_CHANGE: "Changing your password",
};

const confirm = (title: string, message: string): Promise<boolean> =>
  new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
        { text: "Continue", style: "destructive", onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) }
    );
  });

const notify = (title: string, message: string): Promise<false> =>
  new Promise((resolve) => {
    Alert.alert(title, message, [{ text: "OK", onPress: () => resolve(false) }], {
      cancelable: true,
      onDismiss: () => resolve(false),
    });
  });

/**
 * Returns true when the caller should go ahead. Never throws — on any internal
 * error the operation is allowed, because silently breaking a withdrawal is worse
 * than missing one heuristic.
 */
export const guardHighRiskAction = async (
  operation: HighRiskOperation
): Promise<boolean> => {
  try {
    const report = getIntegrityReport();

    // Report regardless of whether we enforce: the durable value of a
    // client-side check is as a risk factor in fraud monitoring, not as a block.
    if (report.level === "compromised" || report.level === "suspect") {
      crashlytics().log(
        `High-risk op ${operation} on ${report.level} device: ${report.signals.join(",")}`
      );
    }

    if (!isEnforcementEnabled()) return true;

    if (report.level === "compromised") {
      return notify(
        "Device security check failed",
        `${OPERATION_LABELS[operation]} are unavailable on this device because it appears to be rooted, jailbroken, or running software that can read and modify the app.\n\n` +
          "Your account is safe. To continue, use the app on a device that has not been modified."
      );
    }

    if (report.level === "suspect") {
      return confirm(
        "Unrecognised device setup",
        `This device shows an unusual configuration, so ${OPERATION_LABELS[
          operation
        ].toLowerCase()} may not be secure here.\n\nContinue anyway?`
      );
    }

    return true;
  } catch {
    return true;
  }
};
