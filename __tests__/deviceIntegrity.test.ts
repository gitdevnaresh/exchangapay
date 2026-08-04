/**
 * H-04 — verifies the device-integrity verdict logic.
 *
 * The point of these tests is the two properties the fix depends on: a rooted or
 * hooked device must score "compromised", and a probe that fails must never
 * produce a false positive that locks a legitimate user out of their money.
 *
 * Written to be Platform-agnostic — the mock answers "yes" for the root paths of
 * whichever OS jest reports, so the same assertions hold either way.
 */

import {
  ANDROID_HOOK_PATHS,
  ANDROID_ROOT_PATHS,
  IOS_HOOK_PATHS,
  IOS_JAILBREAK_PATHS,
} from "../src/security/probes";

jest.mock("react-native-fs", () => ({
  exists: jest.fn(),
  writeFile: jest.fn(),
  unlink: jest.fn(),
}));

jest.mock("react-native-device-info", () => ({
  isEmulator: jest.fn(),
  isPinOrFingerprintSet: jest.fn(),
}));

import RNFS from "react-native-fs";
import DeviceInfo from "react-native-device-info";
import {
  evaluateDeviceIntegrity,
  toRiskHeader,
} from "../src/security/deviceIntegrity";

const mockExists = RNFS.exists as jest.Mock;
const mockWriteFile = RNFS.writeFile as jest.Mock;
const mockUnlink = RNFS.unlink as jest.Mock;
const mockIsEmulator = DeviceInfo.isEmulator as jest.Mock;
const mockIsPinSet = DeviceInfo.isPinOrFingerprintSet as jest.Mock;

const ROOT_PATHS = [...ANDROID_ROOT_PATHS, ...IOS_JAILBREAK_PATHS];
const HOOK_PATHS = [...ANDROID_HOOK_PATHS, ...IOS_HOOK_PATHS];

/** Stock device: nothing on disk, sandbox intact, real hardware, passcode set. */
const stockDevice = () => {
  mockExists.mockResolvedValue(false);
  mockWriteFile.mockRejectedValue(new Error("EPERM: sandbox"));
  mockUnlink.mockResolvedValue(undefined);
  mockIsEmulator.mockResolvedValue(false);
  mockIsPinSet.mockResolvedValue(true);
};

beforeEach(() => {
  jest.clearAllMocks();
  stockDevice();
});

describe("evaluateDeviceIntegrity", () => {
  it("clears a stock device", async () => {
    const report = await evaluateDeviceIntegrity();
    expect(report.level).toBe("ok");
  });

  it("flags a device with a root/jailbreak binary as compromised", async () => {
    mockExists.mockImplementation((path: string) =>
      Promise.resolve(ROOT_PATHS.includes(path))
    );

    const report = await evaluateDeviceIntegrity();

    expect(report.level).toBe("compromised");
    expect(
      report.signals.includes("ROOT_BINARY") ||
        report.signals.includes("JAILBREAK_PATH")
    ).toBe(true);
  });

  it("flags an instrumentation framework as compromised", async () => {
    mockExists.mockImplementation((path: string) =>
      Promise.resolve(HOOK_PATHS.includes(path))
    );

    const report = await evaluateDeviceIntegrity();

    expect(report.level).toBe("compromised");
    expect(report.signals).toContain("HOOK_FRAMEWORK");
  });

  it("treats an emulator as suspect, not compromised", async () => {
    mockIsEmulator.mockResolvedValue(true);

    const report = await evaluateDeviceIntegrity();

    expect(report.level).toBe("suspect");
    expect(report.signals).toContain("EMULATOR");
  });

  it("treats a device with no screen lock as suspect", async () => {
    mockIsPinSet.mockResolvedValue(false);

    const report = await evaluateDeviceIntegrity();

    expect(report.level).toBe("suspect");
    expect(report.signals).toContain("NO_SCREEN_LOCK");
  });

  // The fail-open guarantee. A throwing probe must not read as evidence of
  // tampering, or a filesystem quirk starts blocking withdrawals.
  it("does not flag a device when probes throw", async () => {
    mockExists.mockRejectedValue(new Error("EACCES"));
    mockIsEmulator.mockRejectedValue(new Error("bridge unavailable"));
    mockIsPinSet.mockRejectedValue(new Error("bridge unavailable"));

    const report = await evaluateDeviceIntegrity();

    expect(report.level).not.toBe("compromised");
    expect(report.signals).not.toContain("ROOT_BINARY");
    expect(report.signals).not.toContain("JAILBREAK_PATH");
  });

  it("never rejects, whatever the probes do", async () => {
    mockExists.mockImplementation(() => {
      throw new Error("synchronous explosion");
    });

    await expect(evaluateDeviceIntegrity()).resolves.toBeDefined();
  });
});

describe("toRiskHeader", () => {
  it("serialises level and signals without leaking device details", () => {
    expect(
      toRiskHeader({
        level: "compromised",
        signals: ["ROOT_BINARY", "HOOK_FRAMEWORK"],
        evaluatedAt: 0,
      })
    ).toBe("compromised;ROOT_BINARY,HOOK_FRAMEWORK");
  });

  it("omits the separator when there are no signals", () => {
    expect(toRiskHeader({ level: "ok", signals: [], evaluatedAt: 0 })).toBe("ok");
  });
});
