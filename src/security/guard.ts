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
import { describeBiometricOutcome, requireUserPresence } from "./biometricAuth";
import { log } from "../utils/logger";

export type HighRiskOperation =
  | "CRYPTO_WITHDRAWAL"
  | "CARD_PIN_REVEAL"
  | "CARD_DETAILS_REVEAL"
  | "CARD_INFO_VIEW"
  | "ADD_PAYEE"
  | "PASSWORD_CHANGE"
  | "TWO_FACTOR_SETTINGS";

const OPERATION_LABELS: Record<HighRiskOperation, string> = {
  CRYPTO_WITHDRAWAL: "Crypto withdrawals",
  CARD_PIN_REVEAL: "Viewing your card PIN",
  CARD_DETAILS_REVEAL: "Viewing your card number and CVV",
  CARD_INFO_VIEW: "Viewing your card information",
  ADD_PAYEE: "Adding a withdrawal address",
  PASSWORD_CHANGE: "Changing your password",
  TWO_FACTOR_SETTINGS: "Changing your security settings",
};

/**
 * The prompt each operation shows at its step-up (H-14).
 *
 * Naming the operation matters: a bare "Confirm fingerprint" trains users to
 * approve any prompt that appears, which is what makes a stolen-handset attack
 * work. The user should be able to tell an expected prompt from one they did
 * not ask for.
 */
const STEP_UP_PROMPTS: Record<HighRiskOperation, string> = {
  CRYPTO_WITHDRAWAL: "Confirm it's you to send crypto",
  CARD_PIN_REVEAL: "Confirm it's you to view your PIN",
  CARD_DETAILS_REVEAL: "Confirm it's you to view your card details",
  CARD_INFO_VIEW: "Confirm it's you to view your card information",
  ADD_PAYEE: "Confirm it's you to add a withdrawal address",
  PASSWORD_CHANGE: "Confirm it's you to change your password",
  TWO_FACTOR_SETTINGS: "Confirm it's you to change security settings",
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

export type GuardOptions = {
  /**
   * Skip the biometric step-up because the caller performs its own, richer
   * challenge. Only the withdrawal screen uses this: it prompts, and on a device
   * with no sensor falls back to Auth0 2FA or SMS OTP, which is a stronger
   * answer than this guard can give. Two prompts for one action teaches users to
   * tap through them.
   */
  skipPresenceCheck?: boolean;
};

/**
 * Ask the user to prove presence, and explain it if they cannot.
 *
 * H-14: this fails CLOSED. "No sensor" used to mean "carry on"; it now means the
 * operation does not happen, after the device passcode has been offered as a
 * fallback. The only devices that cannot answer are ones with no screen lock at
 * all, and those should not be moving money.
 *
 * This is a presence check, not authentication — a modified app can bypass it.
 * See the header of biometricAuth.ts for what closing that gap requires.
 */
const requireStepUp = async (operation: HighRiskOperation): Promise<boolean> => {
  const outcome = await requireUserPresence(STEP_UP_PROMPTS[operation]);
  if (outcome === "confirmed") return true;

  if (outcome === "cancelled") {
    // The user said no. Respect it without a lecture.
    return false;
  }

  if (outcome === "unavailable" && __DEV__) {
    // Emulators frequently have neither a fingerprint nor a passcode, and a
    // hard block there stops development dead. Release builds refuse — note
    // this concession applies ONLY to a device that cannot ask. A cancelled or
    // failed prompt behaves identically in every build, so QA sees what users
    // see.
    log.warn("[biometrics] dev build: proceeding without a screen lock", {
      operation,
    });
    return true;
  }

  return notify(
    `${OPERATION_LABELS[operation]} — not confirmed`,
    describeBiometricOutcome(outcome) || ""
  );
};

/**
 * Returns true when the caller should go ahead. Never throws on the device
 * posture checks — on an internal error there, the operation is allowed, because
 * silently breaking a withdrawal is worse than missing one heuristic.
 *
 * The biometric step-up (H-14) is the exception to that: it fails closed. A
 * presence check that gives up when it cannot run is the finding.
 */
export const guardHighRiskAction = async (
  operation: HighRiskOperation,
  options?: GuardOptions
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

    // Device-integrity enforcement is off in dev builds. The step-up is not:
    // it is the control the user actually experiences, so it runs everywhere.
    if (!isEnforcementEnabled()) {
      return options?.skipPresenceCheck ? true : requireStepUp(operation);
    }

    if (report.level === "compromised") {
      return notify(
        "Device security check failed",
        `${OPERATION_LABELS[operation]} are unavailable on this device because it appears to be rooted, jailbroken, or running software that can read and modify the app.\n\n` +
          "Your account is safe. To continue, use the app on a device that has not been modified."
      );
    }

    if (report.level === "suspect") {
      const proceed = await confirm(
        "Unrecognised device setup",
        `This device shows an unusual configuration, so ${OPERATION_LABELS[
          operation
        ].toLowerCase()} may not be secure here.\n\nContinue anyway?`
      );
      if (!proceed) return false;
    }

    // Last, so the user is only asked to authenticate for an action that is
    // actually going ahead.
    return options?.skipPresenceCheck ? true : requireStepUp(operation);
  } catch {
    // Reached only if the device-posture probes throw. The step-up above has
    // its own handling and does not rely on this.
    return true;
  }
};
