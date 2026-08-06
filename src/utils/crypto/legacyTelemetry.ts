/**
 * Legacy wire-format instrumentation (security findings H-06, M-08).
 *
 * The decrypt path still accepts two pre-0x01 formats. We cannot delete them
 * blind — some records in the Keychain and in the backend may still be in the
 * old shape, and dropping the branch would render them permanently unreadable.
 * So instead we measure: count every legacy decrypt, surface the count, and
 * delete the branch when the number reaches zero. See policy.ts for the removal
 * procedure and deadline.
 *
 * WHAT IS REPORTED: a format name, a context, a count and the app version.
 * Nothing else. No ciphertext, no plaintext, no key, no field name — a
 * legacy-format metric that carried any of those would be a worse leak than the
 * weakness it is tracking.
 *
 * ===========================================================================
 * M-08 — WHY THIS FILE CHANGED
 * ===========================================================================
 * The exit condition on this finding is "watch `crypto.legacy_format`; flip
 * LEGACY_FORMATS_ENABLED once it reaches zero for a full release cycle". The
 * metric as originally built could not support that decision, for two reasons:
 *
 *   1. IT ALWAYS REPORTED 1. The send was latched to the first sighting of a
 *      format per session, and it passed `counts[format]` at that moment —
 *      which is 1, by construction. A session doing one legacy decrypt and a
 *      session doing fifty thousand produced the identical event. "Is it going
 *      down?" was unanswerable, so the only available decision procedure was
 *      the calendar — which is the thing the deadline exists to back up, not to
 *      be.
 *
 *   2. IT DID NOT SAY WHERE. `decryptAny` already knows whether a blob came off
 *      the wire or out of local storage — `integrityTelemetry.ts` keys its
 *      failures by exactly that — but the legacy counter dropped it. A non-zero
 *      metric therefore could not distinguish the two cases that need opposite
 *      responses:
 *
 *        network  the BACKEND is still emitting a legacy format. No client
 *                 change fixes this, and flipping the flag would break live
 *                 traffic for every user at once.
 *        at-rest  old records on THIS device. These drain as state is rewritten
 *                 and flipping the flag costs at most a re-fetch.
 *
 * Both are fixed below. Nothing about WHICH formats are accepted changed — this
 * file has never had a say in that, and still does not.
 */

import {
  LEGACY_FORMAT_REMOVAL_DATE,
  LEGACY_FORMATS_ENABLED,
} from "./policy";
import type { CryptoContext } from "./integrityTelemetry";

/**
 * `zero-iv` is the weak one: a fixed all-zero IV, so identical plaintext always
 * produced identical ciphertext. `v2-hex` used a random IV but a bespoke
 * `v2:<hex-iv><base64-ct>` envelope that predates the versioned binary header.
 */
export type LegacyFormat = "zero-iv" | "v2-hex";

/** Same shape as integrityTelemetry's FailureKey, for the same reason. */
type LegacyKey = `${LegacyFormat}:${CryptoContext}`;

const counts: Record<string, number> = {};

/**
 * Counts at which a report is sent: 1, 10, 100, 1000, 10000.
 *
 * Reporting every decrypt would be a firehose — this sits on a path that runs
 * during render across hundreds of call sites. Reporting only the first, which
 * is what this did before, throws the volume away. A logarithmic ladder keeps
 * the events per session in single digits while making the difference between
 * "three stale records" and "the backend never migrated" visible in the metric
 * itself.
 */
const REPORT_AT = [1, 10, 100, 1000, 10000];

const keyFor = (format: LegacyFormat, context: CryptoContext): LegacyKey =>
  `${format}:${context}`;

/**
 * Read the per-session counters, keyed `format:context`.
 * Exposed for tests and for a debug screen.
 */
export const getLegacyFormatCounts = (): Readonly<Record<string, number>> => ({
  ...counts,
});

/**
 * Total for one format across every context — the number the removal decision
 * is made on.
 */
export const getLegacyFormatTotal = (format: LegacyFormat): number =>
  Object.entries(counts)
    .filter(([k]) => k.startsWith(`${format}:`))
    .reduce((sum, [, v]) => sum + v, 0);

/**
 * True if any legacy decrypt this session came off the wire.
 *
 * This is the one that blocks the flag. Local residue drains by itself; a
 * backend still emitting a legacy format does not, and turning the flag off
 * while it does breaks every user at once.
 */
export const hasNetworkLegacyUsage = (): boolean =>
  Object.entries(counts).some(([k, v]) => k.endsWith(":network") && v > 0);

/** Test seam — resets counters and the report ladder. */
export const resetLegacyFormatCounts = (): void => {
  for (const k of Object.keys(counts)) delete counts[k];
};

/**
 * Past the removal deadline a legacy decrypt is no longer "expected residue",
 * it is a missed migration — so it stops being a warning and becomes an error.
 */
const isOverdue = (): boolean =>
  new Date().toISOString().slice(0, 10) >= LEGACY_FORMAT_REMOVAL_DATE;

/**
 * The app version is a dimension, not decoration: a legacy decrypt from a build
 * shipped before the migration is residue that will age out on its own, while
 * the same event from the current build is a live problem. Without it the
 * metric cannot tell "old installs still draining" from "not actually fixed".
 *
 * Required lazily and defensively, like Sentry below — this is the decrypt
 * path, and a telemetry import that throws must never take down a decrypt.
 */
const appVersion = (): string => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    const DeviceInfo = require("react-native-device-info");
    return `${DeviceInfo.getVersion()} (${DeviceInfo.getBuildNumber()})`;
  } catch {
    return "unknown";
  }
};

/**
 * Sentry is required lazily and defensively. This module sits on the decrypt
 * path, which runs during render across hundreds of call sites; a telemetry
 * import that throws (or a Sentry client that is not initialised yet at cold
 * start) must never be able to take down a decrypt.
 */
const send = (
  format: LegacyFormat,
  context: CryptoContext,
  count: number
): void => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    const Sentry = require("@sentry/react-native");
    Sentry.captureMessage(`crypto.legacy_format:${format}`, {
      level: isOverdue() ? "error" : "warning",
      tags: {
        "crypto.legacy_format": format,
        // M-08: the dimension that decides who owns the residue, and therefore
        // whether the flag can be flipped at all.
        "crypto.legacy_context": context,
        "crypto.legacy_overdue": String(isOverdue()),
        "app.version": appVersion(),
      },
      extra: {
        // The count at this rung of the ladder, plus the session snapshot, so a
        // single event answers "how much, and where" without needing events to
        // be summed across a session.
        count,
        sessionTotals: { ...counts },
        removalDate: LEGACY_FORMAT_REMOVAL_DATE,
      },
    });
  } catch {
    // Telemetry is best-effort by definition.
  }
};

/**
 * Record one decrypt of a legacy-format blob. Called from the decrypt path, so
 * it must stay cheap and must not throw.
 *
 * `context` defaults to "unknown" so an un-threaded caller still counts. A
 * metric full of "unknown" is itself a signal: it means a decrypt path was
 * added without saying where its data comes from.
 */
export const recordLegacyFormatDecrypt = (
  format: LegacyFormat,
  context: CryptoContext = "unknown"
): void => {
  const k = keyFor(format, context);
  const next = (counts[k] ?? 0) + 1;
  counts[k] = next;
  if (REPORT_AT.includes(next)) {
    send(format, context, next);
  }
};

/** True while any legacy branch is still reachable. Used by tests as a tripwire. */
export const legacyFormatsEnabled = (): boolean => LEGACY_FORMATS_ENABLED;
