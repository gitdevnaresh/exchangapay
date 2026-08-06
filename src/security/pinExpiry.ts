/**
 * Certificate pin-set expiry telemetry — security finding M-03.
 *
 * The two platforms fail in opposite directions on the same date, and neither
 * failure is visible from inside the app:
 *
 *   Android fails OPEN. Past <pin-set expiration> the platform simply stops
 *     enforcing pinning. No exception, no log line, no user-visible symptom —
 *     the app keeps working perfectly, with a security control that is no longer
 *     there. This is the one that matters: the Gradle guard already refuses to
 *     build an expired pin-set, so the residual risk is entirely an app already
 *     installed in the field crossing the date without a release. Nothing on the
 *     device notices, so the only way to know is to be told from the device.
 *
 *   iOS fails CLOSED. ATS has no expiry of its own; the date below is the
 *     certificate's. Once the pinned SPKI stops matching, the app cannot reach
 *     the API at all, and the remedy is an App Store release with its review
 *     latency. Advance warning is worth more here, not less.
 *
 * So this reports rather than enforces. It cannot fix either case at runtime —
 * it exists so the fleet's pin state is observable before the date rather than
 * inferred from a release calendar afterwards.
 *
 * The dates come from security/pinning-policy.json. They are not repeated here;
 * see the pinSet._comment block in that file for why.
 */

import { Platform } from "react-native";
import * as Sentry from "@sentry/react-native";
import { log } from "../utils/logger";
import pinningPolicy from "../../security/pinning-policy.json";

const MS_PER_DAY = 86_400_000;

const { androidExpiration, iosExpiration, warnWithinDays } =
  pinningPolicy.pinSet;

export type PinStatus = "ok" | "expiring" | "expired";

/**
 * A type alias rather than an interface on purpose: only a type alias gets an
 * implicit index signature, which is what lets the report be passed straight to
 * log.warn() and Sentry's breadcrumb `data` without casting through `unknown`.
 */
export type PinExpiryReport = {
  platform: string;
  /** ISO date (YYYY-MM-DD) the pin-set lapses on this platform. */
  expiry: string;
  daysLeft: number;
  status: PinStatus;
  /** Which way this platform breaks past the date. */
  failureMode: "fails-open" | "fails-closed";
};

/** The pin-set expiry that applies to the platform the app is running on. */
export const getPinExpiry = (platform: string = Platform.OS): string =>
  platform === "ios" ? iosExpiration : androidExpiration;

/**
 * Whole days from `now` until an ISO date.
 *
 * Parsed as explicit UTC midnight. A bare YYYY-MM-DD is already treated as UTC,
 * but relying on that is relying on a parsing rule that differs for other date
 * formats — and a date check that is off by a timezone is one that fires a day
 * late in exactly the timezones furthest from us.
 */
export const daysUntil = (isoDate: string, now: number = Date.now()): number =>
  Math.floor((Date.parse(`${isoDate}T00:00:00Z`) - now) / MS_PER_DAY);

export const classifyPinExpiry = (daysLeft: number): PinStatus => {
  if (daysLeft <= 0) return "expired";
  if (daysLeft <= warnWithinDays) return "expiring";
  return "ok";
};

/**
 * Builds the report without touching Sentry. Separated so the decision can be
 * tested without a telemetry transport.
 */
export const buildPinExpiryReport = (
  platform: string = Platform.OS,
  now: number = Date.now()
): PinExpiryReport => {
  const expiry = getPinExpiry(platform);
  const daysLeft = daysUntil(expiry, now);
  return {
    platform,
    expiry,
    daysLeft,
    status: classifyPinExpiry(daysLeft),
    failureMode: platform === "ios" ? "fails-closed" : "fails-open",
  };
};

/**
 * Called once at app start.
 *
 * Deliberately fails silently: a telemetry call must never be the reason an app
 * does not finish launching. A thrown error here would take out everything
 * after it in the startup effect.
 */
export const reportPinExpiry = (
  platform: string = Platform.OS,
  now: number = Date.now()
): PinExpiryReport | null => {
  try {
    const report = buildPinExpiryReport(platform, now);

    // The metric. Set on every launch regardless of status, because "how many
    // installs are past the date" is only answerable if the healthy ones report
    // too — tags are indexed and aggregatable, so the fleet's pin state can be
    // queried directly. Scalar tags rather than the Sentry metrics API, which
    // has changed shape across SDK majors; a tag has not.
    Sentry.setTag("pin_status", report.status);
    Sentry.setTag("pin_expiry", report.expiry);
    Sentry.setContext("certificate_pinning", {
      platform: report.platform,
      expiry: report.expiry,
      daysLeft: report.daysLeft,
      status: report.status,
      failureMode: report.failureMode,
      policy: "security/pinning-policy.json",
    });

    if (report.status === "ok") {
      return report;
    }

    // The breadcrumb. Inside the warning window every subsequent event on this
    // device carries the pin state, so an unrelated crash report during the
    // lapse arrives already saying the pinning was stale.
    Sentry.addBreadcrumb({
      category: "security.pinning",
      level: report.status === "expired" ? "error" : "warning",
      message: `Pin-set ${report.status} (${report.expiry}, ${report.daysLeft}d, ${report.failureMode})`,
      data: report,
    });

    log.warn(
      "[M-03] Certificate pin-set expiry — re-verify SPKI hashes and extend the date in security/pinning-policy.json",
      report
    );

    // An event, not just a breadcrumb, only once actually lapsed. The previous
    // version raised one on every launch for the whole warning window, which on
    // a fleet of any size buries the day it genuinely matters under three months
    // of identical noise. Expiry is the state worth paging on: on Android it
    // means installs in the field are running unpinned right now.
    if (report.status === "expired") {
      Sentry.captureMessage(
        `[M-03] Certificate pin-set expired on ${report.expiry} (${report.platform}, ${report.failureMode})`,
        "error"
      );
    }

    return report;
  } catch (error) {
    log.error("[M-03] Pin expiry telemetry failed", error);
    return null;
  }
};
