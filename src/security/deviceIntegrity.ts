/**
 * Device integrity (Tier 2: client-side detection).
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
 *     startup path. If it times out the level is "unknown". That never blocks the
 *     app, but high-risk operations re-check and do not treat it as trusted
 *     (see guard.ts).
 *   - Enforcement is disabled in __DEV__ so that developers and CI on emulators
 *     are never blocked. The verdict is still computed and reported.
 *
 * Native modules (DeviceSecurity / DeviceSecurityIOS) repeat these checks outside
 * the JS bridge; both layers are OR-ed, and a missing module falls back to JS.
 */

import { Linking, NativeModules, Platform } from "react-native";
import RNFS from "react-native-fs";
import DeviceInfo from "react-native-device-info";
import { isProductionEnv } from "../../Environment";
import {
  ANDROID_HOOK_PATHS,
  ANDROID_ROOT_PATHS,
  IOS_HOOK_PATHS,
  IOS_JAILBREAK_PATHS,
  IOS_JAILBREAK_SCHEMES,
  IOS_SANDBOX_ESCAPE_PATH,
} from "./probes";

// ⚠️ TESTING ONLY. `true` checks emulators/simulators in dev/tst and enforces the
// block even in Debug builds. MUST be `false` before committing.
const CHECK_EMULATOR_IN_TEST = false;

export type IntegritySignal =
  | "ROOT_BINARY"
  | "BOOTLOADER_UNLOCKED"
  | "JAILBREAK_PATH"
  | "SANDBOX_ESCAPE"
  | "HOOK_FRAMEWORK"
  | "DEBUGGER_ATTACHED"
  | "EMULATOR"
  | "NO_SCREEN_LOCK"
  | "DEVELOPER_OPTIONS"
  | "ADB_ENABLED"
  | "DEBUG_BUILD";

/**
 * ok          — nothing found.
 * suspect     — weak signals (no device passcode). Warn, allow.
 * compromised — root/jailbreak/hooking framework, emulator, or dev options /
 *               USB debugging in a release build. Blocks the app.
 * unknown     — checks could not complete. Never blocks the app (a slow probe
 *               must not lock a user out of their money), but it is not trusted
 *               for high-risk operations: guard.ts re-checks and warns.
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
  "BOOTLOADER_UNLOCKED",
  "JAILBREAK_PATH",
  "SANDBOX_ESCAPE",
  "HOOK_FRAMEWORK",
  "DEBUGGER_ATTACHED",
  "DEVELOPER_OPTIONS",
  "ADB_ENABLED",
  "EMULATOR",
];

/** On a non-prod emulator only real root/hook evidence counts (see collectSignals). */
const NON_PROD_EMULATOR_SIGNALS: IntegritySignal[] = ["ROOT_BINARY", "HOOK_FRAMEWORK"];

const EVALUATION_TIMEOUT_MS = 4000;
const BOOT_STATE_TIMEOUT_MS = 800;
/** Longer budget for the re-check a high-risk operation runs on an "unknown" verdict. */
export const RECHECK_TIMEOUT_MS = 8000;

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

/**
 * iOS: can any jailbreak package manager be opened? Requires the schemes in
 * LSApplicationQueriesSchemes (Info.plist); otherwise always false.
 */
const canOpenJailbreakScheme = async (): Promise<boolean> => {
  for (const url of IOS_JAILBREAK_SCHEMES) {
    const opens = await settleWithin(
      Linking.canOpenURL(url).then((v) => v === true),
      1500,
      false
    );
    if (opens) return true;
  }
  return false;
};

/** Maps native reason strings onto the existing signals. */
const NATIVE_REASON_SIGNALS: Record<string, IntegritySignal> = {
  native_root_file: "ROOT_BINARY",
  native_su_path: "ROOT_BINARY",
  native_test_keys: "ROOT_BINARY",
  native_hook_artifact: "HOOK_FRAMEWORK",
  native_hook_injected: "HOOK_FRAMEWORK",
  native_jailbreak_file: "JAILBREAK_PATH",
  native_sandbox_write: "SANDBOX_ESCAPE",
  native_suspicious_dylib: "HOOK_FRAMEWORK",
  native_debugger_attached: "DEBUGGER_ATTACHED",
  native_root_mount: "ROOT_BINARY",
  native_frida_thread: "HOOK_FRAMEWORK",
  native_frida_port: "HOOK_FRAMEWORK",
  native_bootloader_unlocked: "BOOTLOADER_UNLOCKED",
};

/** Calls one native probe. A missing module or a fault yields no reasons. */
const readNativeReasons = async (
  moduleName: string,
  method: string,
  timeoutMs = 2000
): Promise<string[]> => {
  const native = NativeModules[moduleName];
  if (typeof native?.[method] !== "function") {
    return [];
  }
  const result = await settleWithin<any>(native[method](), timeoutMs, null);
  return Array.isArray(result?.reasons)
    ? result.reasons.filter((r: unknown): r is string => typeof r === "string")
    : [];
};

const collectNativeSignals = async (): Promise<IntegritySignal[]> => {
  // Android: the file/mount probes and the key-attestation boot-state check
  // (catches root hidden by DenyList/Shamiko) run in parallel. The boot
  // state is pre-computed from MainApplication.onCreate, so it is normally
  // ready; it gets a short budget so it can never lengthen the splash wait. If
  // it is not ready yet, the next foreground re-check picks it up.
  const reasons =
    Platform.OS === "ios"
      ? await readNativeReasons("DeviceSecurityIOS", "getJailbreakStatus")
      : (
          await Promise.all([
            readNativeReasons("DeviceSecurity", "getRootStatus"),
            readNativeReasons("DeviceSecurity", "getBootState", BOOT_STATE_TIMEOUT_MS),
          ])
        ).flat();

  const signals: IntegritySignal[] = [];
  for (const reason of reasons) {
    const signal = NATIVE_REASON_SIGNALS[reason];
    // Xcode / Android Studio attach a debugger to every debug build.
    if (signal === "DEBUGGER_ATTACHED" && __DEV__) continue;
    if (signal) signals.push(signal);
  }

  // Developer Options / USB debugging block release builds only, never __DEV__.
  if (Platform.OS === "android" && !__DEV__) {
    const flags = await settleWithin<any>(
      NativeModules.DeviceSecurity?.getFlags?.() ?? Promise.resolve(null),
      2000,
      null
    );
    if (flags?.developerOptionsEnabled) signals.push("DEVELOPER_OPTIONS");
    if (flags?.adbEnabled) signals.push("ADB_ENABLED");
  }

  return signals;
};

const collectSignals = async (): Promise<IntegritySignal[]> => {
  // Root/hook probes are never skipped because an emulator was detected —
  // tst builds are the release builds, and a rooted emulator must not get a clean
  // verdict. Outside prod, signals every stock emulator has (EMULATOR, ADB,
  // developer options, no screen lock, unlocked bootloader) are ignored so QA
  // keeps testing on emulators exactly as before; only root/hook signals count
  // (use Google Play system images — Google APIs images ship su and are rooted).
  // The iOS Simulator is still skipped: it reads the Mac filesystem (/bin/sh,
  // /etc/ssh …) and cannot run a device-signed release build.
  const nonProdEmulator =
    !isProductionEnv() && !CHECK_EMULATOR_IN_TEST && (await isEmulator());
  if (nonProdEmulator && Platform.OS === "ios") return [];

  const signals: IntegritySignal[] = [];

  const rootPaths =
    Platform.OS === "ios" ? IOS_JAILBREAK_PATHS : ANDROID_ROOT_PATHS;
  const hookPaths = Platform.OS === "ios" ? IOS_HOOK_PATHS : ANDROID_HOOK_PATHS;

  const [rooted, hooked, sandboxEscaped, schemeOpens, emulated, unlocked, native] =
    await Promise.all([
      anyPathExists(rootPaths),
      anyPathExists(hookPaths),
      Platform.OS === "ios" ? canEscapeSandbox() : Promise.resolve(false),
      Platform.OS === "ios" ? canOpenJailbreakScheme() : Promise.resolve(false),
      isEmulator(),
      hasNoScreenLock(),
      collectNativeSignals().catch(() => [] as IntegritySignal[]),
    ]);

  if (rooted) {
    signals.push(Platform.OS === "ios" ? "JAILBREAK_PATH" : "ROOT_BINARY");
  }
  if (hooked) signals.push("HOOK_FRAMEWORK");
  if (sandboxEscaped) signals.push("SANDBOX_ESCAPE");
  if (schemeOpens) signals.push("JAILBREAK_PATH");
  if (emulated) signals.push("EMULATOR");
  if (unlocked) signals.push("NO_SCREEN_LOCK");
  if (__DEV__) signals.push("DEBUG_BUILD");

  // JS and native layers overlap; report each signal once.
  for (const signal of native) signals.push(signal);
  const unique = Array.from(new Set(signals));
  return nonProdEmulator
    ? unique.filter((signal) => NON_PROD_EMULATOR_SIGNALS.includes(signal))
    : unique;
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
export const evaluateDeviceIntegrity = async (
  timeoutMs: number = EVALUATION_TIMEOUT_MS
): Promise<IntegrityReport> => {
  const signals = await settleWithin(
    collectSignals(),
    timeoutMs,
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
export const isEnforcementEnabled = (): boolean => !__DEV__ || CHECK_EMULATOR_IN_TEST;

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
