/**
 * M-05 (clipboard writes with no expiry) and N-05 (the TOTP seed specifically).
 *
 * These cover what a unit test can actually prove: that the value lands, that
 * it is gone once the TTL elapses, and that an expiring timer never wipes a
 * value the user copied afterwards.
 *
 * They deliberately do NOT claim to cover the two residual risks, because a
 * fake timer cannot reproduce either:
 *   - iOS suspends JS timers while the app is backgrounded, so the clear lands
 *     on resume rather than at the deadline.
 *   - Killing the app destroys the pending timer, and nothing clears the
 *     clipboard at next launch.
 * Both need a device. See the manual test plan.
 */

import Clipboard from "@react-native-clipboard/clipboard";
import { copyEphemeral } from "../clipboard";

const pasteboard = Clipboard as unknown as {
  __getContents: () => string;
  __setContents: (t: string) => void;
  __reset: () => void;
};

const SEED = "FRWNCVBDEFPEJUBKGI4UEYHRORWGYRJZ";

beforeEach(() => {
  jest.useFakeTimers();
  pasteboard.__reset();
});

afterEach(() => {
  jest.useRealTimers();
});

describe("copyEphemeral", () => {
  it("puts the value on the clipboard immediately", () => {
    copyEphemeral(SEED, "Authenticator secret", 30_000);
    expect(pasteboard.__getContents()).toBe(SEED);
  });

  it("still holds the value one tick before the TTL expires", async () => {
    copyEphemeral(SEED, "Authenticator secret", 30_000);
    await jest.advanceTimersByTimeAsync(29_999);
    expect(pasteboard.__getContents()).toBe(SEED);
  });

  it("clears the TOTP seed once its 30s TTL elapses (N-05)", async () => {
    copyEphemeral(SEED, "Authenticator secret", 30_000);
    await jest.advanceTimersByTimeAsync(30_000);
    expect(pasteboard.__getContents()).toBe("");
  });

  it("defaults to a 60s TTL when none is given", async () => {
    copyEphemeral("0xdeadbeef", "Wallet Address");
    await jest.advanceTimersByTimeAsync(59_999);
    expect(pasteboard.__getContents()).toBe("0xdeadbeef");
    await jest.advanceTimersByTimeAsync(1);
    expect(pasteboard.__getContents()).toBe("");
  });

  it("does not wipe a value the user copied afterwards", async () => {
    copyEphemeral(SEED, "Authenticator secret", 30_000);
    await jest.advanceTimersByTimeAsync(10_000);

    // User copies a wallet address before the seed's timer fires.
    copyEphemeral("0xdeadbeef", "Wallet Address");
    await jest.advanceTimersByTimeAsync(20_000); // seed's deadline passes

    expect(pasteboard.__getContents()).toBe("0xdeadbeef");
  });

  it("clears the later value on its own schedule", async () => {
    copyEphemeral(SEED, "Authenticator secret", 30_000);
    await jest.advanceTimersByTimeAsync(10_000);
    copyEphemeral("0xdeadbeef", "Wallet Address", 60_000);

    await jest.advanceTimersByTimeAsync(60_000);
    expect(pasteboard.__getContents()).toBe("");
  });

  it("leaves an unrelated clipboard value untouched", async () => {
    copyEphemeral(SEED, "Authenticator secret", 30_000);
    // Something outside the app takes the pasteboard.
    pasteboard.__setContents("a shopping list");

    await jest.advanceTimersByTimeAsync(30_000);
    expect(pasteboard.__getContents()).toBe("a shopping list");
  });

  it.each([
    ["an empty string", ""],
    ["null", null],
    ["undefined", undefined],
  ])("no-ops on %s rather than writing it", (_label, value) => {
    pasteboard.__setContents("previous");
    copyEphemeral(value as string | null | undefined);
    expect(pasteboard.__getContents()).toBe("previous");
    expect(Clipboard.setString).not.toHaveBeenCalled();
  });

  it("survives a clipboard read that rejects", async () => {
    copyEphemeral(SEED, "Authenticator secret", 30_000);
    (Clipboard.getString as jest.Mock).mockRejectedValueOnce(
      new Error("clipboard unavailable")
    );
    await expect(jest.advanceTimersByTimeAsync(30_000)).resolves.not.toThrow();
  });
});
