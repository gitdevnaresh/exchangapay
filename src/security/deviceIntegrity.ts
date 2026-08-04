/**
 * H-04 — device integrity (Tier 2: client-side detection).
 *
 * The app previously had no way to tell a stock phone from one where an attacker
 * has full control. On a rooted device with Frida an attacker hooks the biometric
 * prompt, the Redux store, Keychain reads and the HTTP interceptors in minutes.
 *
 * IMPORTANT — what this file is and is not:
 *
 *   It is NOT a security boundary. Every check below runs inside the process the
 *   attacker controls, so every check below can be patched out. Treat it as a
 *   risk signal, not as enforcement.
 *
 *   The enforcement half is server-side attestation — see attestation.ts and the
 *   backend work listed there. A compromised-device verdict is most valuable when
 *   it reaches your backend (it does, via the X-Device-Risk header in
 *   ApiService.ts) and feeds fraud monitoring.
 *
 * Design rules, so this can never take the app down:
 *
 *   - Every probe is individually wrapped and fails open. A probe that throws or
 *     hangs contributes nothing rather than producing a false positive.
 *   - The whole evaluation is bounded by EVALUATION_TIMEOUT_MS and runs off the
 *     startup path. If it times out the level is "unknown", which is treated as
 *     trusted.
 *   - Enforcement is disabled in __DEV__ so that developers and CI on emulators
 *     are never blocked. The verdict is still computed and reported.
 *
 * Deliberately built on dependencies the app already ships (react-native-fs,
 * react-native-device-info) rather than adding a native module mid RN-0.83
 * upgrade. If you later want stronger, harder-to-strip checks, jail-monkey or a
 * commercial RASP product (Guardsquare, Promon SHIELD, Appdome) drops in behind
 * this same interface — only evaluateDeviceIntegrity() needs to change.
 */

import { Platform } from "react-native";
import RNFS from "react-native-fs";
import DeviceInfo from "react-native-device-info";
import {
  ANDROID_HOOK_PATHS,
  ANDROID_ROOT_PATHS,
  IOS_HOOK_PATHS,
  IOS_JAILBREAK_PATHS,
  IOS_SANDBOX_ESCAPE_PATH,
} from "./probes";

export type IntegritySignal =
  | "ROOT_BINARY"
  | "JAILBREAK_PATH"
  | "SANDBOX_ESCAPE"
  | "HOOK_FRAMEWORK"
  | "EMULATOR"
  | "NO_SCREEN_LOCK"
  | "DEBUG_BUILD";

/**
 * ok          — nothing found.
 * suspect     — weak signals (emulator, no device passcode). Warn, allow.
 * compromised — root/jailbreak/hooking framework present. Block high-risk ops.
 * unknown     — checks could not complete. Treated as trusted: a probe failure
 *               must never lock a legitimate user out of their money.
 */
export type IntegrityLevel = "ok" | "suspect" | "compromised" | "unknown";

export interface IntegrityReport {
  level: IntegrityLevel;
  signals: IntegritySignal[];
  evaluatedAt: number;
}

/** Signals that on their own mean the device is untrustworthy. */
const CRITICAL_SIGNALS: IntegritySignal[] = [
  "ROOT_BINARY",
  "JAILBREAK_PATH",
  "SANDBOX_ESCAPE",
  "HOOK_FRAMEWORK",
];

const EVALUATION_TIMEOUT_MS = 4000;

export const UNKNOWN_REPORT: IntegrityReport = {
  level: "unknown",
  signals: [],
  evaluatedAt: 0,
};

/**
 * Resolves to `fallback` if the promise rejects or outruns `ms`. Every probe goes
 * through here, which is what makes the "fails open" rule above true rather than
 * aspirational.
 */
const settleWithin = <T>(
  promise: Promise<T>,
  ms: number,
  fallback: T
): Promise<T> =>
  new Promise<T>((resolve) => {
    let done = false;
    const finish = (value: T) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      resolve(value);
    };
    const timer = setTimeout(() => finish(fallback), ms);
    promise.then(finish).catch(() => finish(fallback));
  });

/** True only if the path definitively exists. Any error means "no". */
const pathExists = (path: string): Promise<boolean> =>
  settleWithin(
    RNFS.exists(path).then((exists) => exists === true),
    1500,
    false
  );

const anyPathExists = async (paths: string[]): Promise<boolean> => {
  const results = await Promise.all(paths.map(pathExists));
  return results.some(Boolean);
};

/**
 * Writes outside the app container. The iOS sandbox refuses this for every stock
 * app, so a success means the sandbox is not being enforced. Cleans up after
 * itself; a failed unlink is ignored because the write already gave the verdict.
 */
const canEscapeSandbox = async (): Promise<boolean> => {
  try {
    await RNFS.writeFile(IOS_SANDBOX_ESCAPE_PATH, "probe", "utf8");
  } catch {
    return false;
  }
  try {
    await RNFS.unlink(IOS_SANDBOX_ESCAPE_PATH);
  } catch {
    // Nothing to do — the device is already flagged.
  }
  return true;
};

const isEmulator = (): Promise<boolean> =>
  settleWithin(
    DeviceInfo.isEmulator().then((v) => v === true),
    1500,
    false
  );

/**
 * No passcode/biometric means anyone holding the phone reaches the app, and on
 * Android it also means the Keystore cannot bind keys to user authentication.
 */
const hasNoScreenLock = (): Promise<boolean> =>
  settleWithin(
    DeviceInfo.isPinOrFingerprintSet().then((isSet) => isSet === false),
    1500,
    false
  );

const collectSignals = async (): Promise<IntegritySignal[]> => {
  const signals: IntegritySignal[] = [];

  const rootPaths =
    Platform.OS === "ios" ? IOS_JAILBREAK_PATHS : ANDROID_ROOT_PATHS;
  const hookPaths = Platform.OS === "ios" ? IOS_HOOK_PATHS : ANDROID_HOOK_PATHS;

  const [rooted, hooked, sandboxEscaped, emulated, unlocked] = await Promise.all(
    [
      anyPathExists(rootPaths),
      anyPathExists(hookPaths),
      Platform.OS === "ios" ? canEscapeSandbox() : Promise.resolve(false),
      isEmulator(),
      hasNoScreenLock(),
    ]
  );

  if (rooted) {
    signals.push(Platform.OS === "ios" ? "JAILBREAK_PATH" : "ROOT_BINARY");
  }
  if (hooked) signals.push("HOOK_FRAMEWORK");
  if (sandboxEscaped) signals.push("SANDBOX_ESCAPE");
  if (emulated) signals.push("EMULATOR");
  if (unlocked) signals.push("NO_SCREEN_LOCK");
  if (__DEV__) signals.push("DEBUG_BUILD");

  return signals;
};

const scoreSignals = (signals: IntegritySignal[]): IntegrityLevel => {
  if (signals.some((signal) => CRITICAL_SIGNALS.includes(signal))) {
    return "compromised";
  }
  // DEBUG_BUILD alone is not a risk worth surfacing — it is every developer's
  // daily state and is stripped from release builds anyway.
  if (signals.some((signal) => signal !== "DEBUG_BUILD")) return "suspect";
  return "ok";
};

/**
 * Runs the full check. Never rejects; the worst case is an "unknown" verdict.
 */
export const evaluateDeviceIntegrity = async (): Promise<IntegrityReport> => {
  const signals = await settleWithin(
    collectSignals(),
    EVALUATION_TIMEOUT_MS,
    null as IntegritySignal[] | null
  );

  if (signals === null) {
    return { ...UNKNOWN_REPORT, evaluatedAt: Date.now() };
  }

  return {
    level: scoreSignals(signals),
    signals,
    evaluatedAt: Date.now(),
  };
};

/**
 * Whether a verdict should actually stop the user. Detection always runs and is
 * always reported; only the blocking behaviour is gated on this, so that debug
 * builds and emulators stay fully usable during development and QA.
 */
export const isEnforcementEnabled = (): boolean => !__DEV__;

export const isDeviceCompromised = (report: IntegrityReport): boolean =>
  report.level === "compromised";

/**
 * Compact wire format for the X-Device-Risk header, e.g.
 * "compromised;ROOT_BINARY,HOOK_FRAMEWORK". Signal names only — no device
 * identifiers, no paths, nothing that would turn the header itself into a
 * fingerprinting or disclosure channel.
 */
export const toRiskHeader = (report: IntegrityReport): string =>
  report.signals.length > 0
    ? `${report.level};${report.signals.join(",")}`
    : report.level;
