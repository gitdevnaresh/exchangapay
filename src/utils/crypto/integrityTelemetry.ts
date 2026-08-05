/**
 * Decrypt-failure instrumentation (security finding H-06).
 *
 * WHY THIS EXISTS
 * ---------------
 * H-06's core complaint about AES-CBC is that an attacker who can modify a
 * ciphertext can make controlled edits to the plaintext, and *nothing detects
 * it*. AES-GCM fixes that, and this build now writes GCM everywhere.
 *
 * What it cannot fix is the data it did not write. Installs that have not
 * updated are still sending CBC, records encrypted before the switch are still
 * in the backend and the Keychain, and the decoder must keep reading all of it
 * (see policy.ts step 4). For that traffic, prevention is still unavailable —
 * but detection is not. Every realistic tampering attempt leaves a trace on the
 * decrypt path:
 *
 *   - GCM (0x02) — the tag fails. Reason "tampered". This is proof, not a hint:
 *     the only ways to get here are a modified blob or a wrong key.
 *   - CBC (0x01) — no tag, so a bit-flip in the *last* block usually breaks
 *     PKCS7 padding and surfaces as "decrypt-failed". A flip in an earlier block
 *     corrupts that block into noise and is NOT caught by the cipher; it is
 *     caught downstream when the result fails to parse as the JSON/number/date
 *     the caller expected. CBC malleability is real and this does not pretend
 *     otherwise — but a client that suddenly starts failing to decrypt is a
 *     signal worth having, and today the app throws it away silently.
 *
 * So: count every decrypt failure, tag it by context and reason, and ship the
 * counts. A spike is the tripwire for exactly the attack the finding describes,
 * and the counts also tell us when it is safe to retire the legacy branches.
 *
 * WHAT IS REPORTED: a context name, a failure reason, and a count. Nothing else.
 * No ciphertext, no plaintext, no key, no field name, no user identifier. A
 * crypto-failure metric that carried any of those would be a worse leak than the
 * weakness it is tracking.
 */

import type { CryptoFailure } from "./aes";

/**
 * Where the blob came from. Worth separating because the two have different
 * threat models: `network` is attacker-reachable in transit, so a cluster of
 * failures there is a possible active attack, while `at-rest` is data this app
 * wrote to its own Keychain-backed store, where the same failure is almost
 * always a stale or corrupt record.
 */
export type CryptoContext = "network" | "at-rest" | "unknown";

type FailureKey = `${CryptoContext}:${CryptoFailure}`;

const counts = new Map<FailureKey, number>();

/**
 * Tamper is reported per-event rather than once per session, because the second
 * and third occurrence are what distinguishes "one corrupt record" from "someone
 * is sitting in the middle of this connection". Capped so a broken key cannot
 * turn a render loop into a Sentry firehose.
 */
const TAMPER_REPORT_LIMIT = 5;
let tamperReports = 0;

/** Non-tamper reasons are noisy by nature — report the first of each, then count. */
const reported = new Set<FailureKey>();

/** Read the per-session counters. Exposed for tests and for a debug screen. */
export const getIntegrityFailureCounts = (): Readonly<Record<string, number>> =>
  Object.fromEntries(counts);

/** Test seam — resets counters and the report latches. */
export const resetIntegrityFailureCounts = (): void => {
  counts.clear();
  reported.clear();
  tamperReports = 0;
};

/**
 * Sentry is required lazily and defensively, for the same reason as in
 * legacyTelemetry: this sits on the decrypt path, which runs during render
 * across hundreds of call sites. A telemetry import that throws — or a Sentry
 * client that is not initialised yet at cold start — must never be able to take
 * down a decrypt.
 */
const send = (
  context: CryptoContext,
  reason: CryptoFailure,
  count: number
): void => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    const Sentry = require("@sentry/react-native");
    Sentry.captureMessage(`crypto.decrypt_failure:${reason}`, {
      // A verified authentication-tag failure is an integrity event, not a bug
      // report. Everything else is far more likely to be a stale record or a
      // field that was never encrypted in the first place.
      level: reason === "tampered" ? "error" : "warning",
      tags: {
        "crypto.context": context,
        "crypto.failure": reason,
      },
      extra: { count },
    });
  } catch {
    // Telemetry is best-effort by definition.
  }
};

/**
 * Record one failed decrypt. Called from the decrypt path, so it must stay cheap
 * and must never throw — a failure to report a failure cannot be allowed to
 * become a second failure.
 */
export const recordDecryptFailure = (
  context: CryptoContext,
  reason: CryptoFailure
): void => {
  try {
    const key: FailureKey = `${context}:${reason}`;
    const next = (counts.get(key) ?? 0) + 1;
    counts.set(key, next);

    if (reason === "tampered") {
      if (tamperReports < TAMPER_REPORT_LIMIT) {
        tamperReports += 1;
        send(context, reason, next);
      }
      return;
    }

    if (!reported.has(key)) {
      reported.add(key);
      send(context, reason, next);
    }
  } catch {
    // See above.
  }
};
