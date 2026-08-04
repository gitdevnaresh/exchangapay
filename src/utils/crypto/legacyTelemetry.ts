/**
 * Legacy wire-format instrumentation (security finding H-06).
 *
 * The decrypt path still accepts two pre-0x01 formats. We cannot delete them
 * blind — some records in the Keychain and in the backend may still be in the
 * old shape, and dropping the branch would render them permanently unreadable.
 * So instead we measure: count every legacy decrypt, surface the count, and
 * delete the branch when the number reaches zero. See policy.ts for the removal
 * procedure and deadline.
 *
 * WHAT IS REPORTED: a format name and a count. Nothing else. No ciphertext, no
 * plaintext, no key, no field name — a legacy-format metric that carried any of
 * those would be a worse leak than the weakness it is tracking.
 */

import {
  LEGACY_FORMAT_REMOVAL_DATE,
  LEGACY_FORMATS_ENABLED,
} from "./policy";

/**
 * `zero-iv` is the weak one: a fixed all-zero IV, so identical plaintext always
 * produced identical ciphertext. `v2-hex` used a random IV but a bespoke
 * `v2:<hex-iv><base64-ct>` envelope that predates the versioned binary header.
 */
export type LegacyFormat = "zero-iv" | "v2-hex";

const counts: Record<LegacyFormat, number> = { "zero-iv": 0, "v2-hex": 0 };

/** Formats already reported this session — the metric is a signal, not a firehose. */
const reported = new Set<LegacyFormat>();

/** Read the per-session counters. Exposed for tests and for a debug screen. */
export const getLegacyFormatCounts = (): Readonly<Record<LegacyFormat, number>> => ({
  ...counts,
});

/** Test seam — resets counters and the once-per-session report latch. */
export const resetLegacyFormatCounts = (): void => {
  counts["zero-iv"] = 0;
  counts["v2-hex"] = 0;
  reported.clear();
};

/**
 * Past the removal deadline a legacy decrypt is no longer "expected residue",
 * it is a missed migration — so it stops being a warning and becomes an error.
 */
const isOverdue = (): boolean =>
  new Date().toISOString().slice(0, 10) >= LEGACY_FORMAT_REMOVAL_DATE;

/**
 * Sentry is required lazily and defensively. This module sits on the decrypt
 * path, which runs during render across hundreds of call sites; a telemetry
 * import that throws (or a Sentry client that is not initialised yet at cold
 * start) must never be able to take down a decrypt.
 */
const send = (format: LegacyFormat, count: number): void => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    const Sentry = require("@sentry/react-native");
    Sentry.captureMessage(`crypto.legacy_format:${format}`, {
      level: isOverdue() ? "error" : "warning",
      tags: {
        "crypto.legacy_format": format,
        "crypto.legacy_overdue": String(isOverdue()),
      },
      extra: {
        count,
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
 */
export const recordLegacyFormatDecrypt = (format: LegacyFormat): void => {
  counts[format] += 1;
  if (!reported.has(format)) {
    reported.add(format);
    send(format, counts[format]);
  }
};

/** True while any legacy branch is still reachable. Used by tests as a tripwire. */
export const legacyFormatsEnabled = (): boolean => LEGACY_FORMATS_ENABLED;
