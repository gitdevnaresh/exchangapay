/**
 * The one logging abstraction — security finding M-16.
 *
 * `console.*` calls were scattered across 20 files, including the authentication
 * path ("Calling getMemDetails with:", which carried the FCM token). Hermes does
 * NOT strip console output from release bundles, so every one of those lines
 * reached the platform log — `logcat` on Android, `os_log` on iOS — readable by
 * anyone with ADB access or a diagnostic app holding READ_LOGS.
 *
 * Two defences, deliberately layered:
 *   1. `babel-plugin-transform-remove-console` deletes every `console.*` call
 *      from production bundles (see babel.config.js). That covers this module,
 *      third-party packages, and any call site a future developer forgets.
 *   2. This module, so the decision about what may be logged is made once rather
 *      than at 100 call sites. Structured data is redacted through the same
 *      allow-list used for telemetry (see redact.ts, finding C-07) before it
 *      reaches a Sentry breadcrumb.
 *
 * Rule for call sites: the `message` argument is a developer-authored constant.
 * Never interpolate runtime values into it — pass them as `data` so they go
 * through redaction. `log.debug("user", user)`, not `log.debug(\`user ${user}\`)`.
 */

import * as Sentry from "@sentry/react-native";
import crashlytics from "@react-native-firebase/crashlytics";
import { redact } from "./redact";

type LogData = Record<string, unknown> | undefined;

/** Breadcrumb category — lets Sentry group app logs apart from HTTP/nav crumbs. */
const CATEGORY = "app";

/**
 * Reduce an unknown thrown value to the smallest useful, non-sensitive shape.
 *
 * Axios rejections are the reason this exists: `error.config` holds the request
 * headers, and the Authorization bearer token with them. Serialising the whole
 * error object into a breadcrumb would reintroduce C-07 through the back door,
 * so only the name, a bounded message, and any HTTP status survive.
 */
const describeError = (error: unknown): Record<string, unknown> => {
  if (error === null || error === undefined) return {};

  if (error instanceof Error) {
    const status = (error as any)?.response?.status ?? (error as any)?.status;
    return {
      name: error.name,
      message: String(error.message).slice(0, 200),
      ...(typeof status === "number" ? { status } : {}),
    };
  }

  if (typeof error === "string") return { message: error.slice(0, 200) };

  // Anything else (rejected plain objects, API error envelopes) is untrusted
  // structured data — send it through the allow-list rather than guessing.
  return { value: redact(error) };
};

/** Redact structured context. Never throws: logging must not break a code path. */
const safeData = (data: LogData): Record<string, unknown> | undefined => {
  if (!data) return undefined;
  try {
    return redact(data) as Record<string, unknown>;
  } catch {
    return undefined;
  }
};

const breadcrumb = (
  level: "debug" | "info" | "warning" | "error",
  message: string,
  data: LogData
) => {
  try {
    Sentry.addBreadcrumb({
      category: CATEGORY,
      level,
      message,
      data: safeData(data),
    });
  } catch {
    // Sentry may be uninitialised (sentryLoggs off). Not a reason to fail.
  }
};

export const log = {
  /**
   * Development-only tracing. Produces nothing at all in a release build — no
   * console output, no breadcrumb. Use this for anything you would previously
   * have written as a bare `console.log`.
   */
  debug: (message: string, data?: LogData): void => {
    if (__DEV__) {
      console.log(`[debug] ${message}`, data ?? "");
    }
  },

  /** Notable non-error events worth having as context on a later crash. */
  info: (message: string, data?: LogData): void => {
    if (__DEV__) {
      console.log(`[info] ${message}`, data ?? "");
    }
    breadcrumb("info", message, data);
  },

  /** Recoverable problems: a fallback was taken, a value was unexpected. */
  warn: (message: string, data?: LogData): void => {
    if (__DEV__) {
      console.warn(`[warn] ${message}`, data ?? "");
    }
    breadcrumb("warning", message, data);
  },

  /**
   * Failures worth investigating. Reports to Sentry and Crashlytics with the
   * error reduced to a safe shape; `App.tsx`'s `beforeSend` scrubs whatever is
   * left. Non-Error throwables are wrapped so the stack still points here.
   */
  error: (message: string, error?: unknown, data?: LogData): void => {
    if (__DEV__) {
      console.error(`[error] ${message}`, error ?? "", data ?? "");
    }

    const details = { ...describeError(error), ...(safeData(data) ?? {}) };
    breadcrumb("error", message, details);

    try {
      const captured =
        error instanceof Error ? error : new Error(`${message}`);
      Sentry.captureException(captured, {
        tags: { logger: CATEGORY },
        extra: { message, ...details },
      });
      crashlytics().log(`${message} ${JSON.stringify(details)}`);
      crashlytics().recordError(captured);
    } catch {
      // Telemetry is best-effort; never let it surface as a second failure.
    }
  },
};

export default log;
