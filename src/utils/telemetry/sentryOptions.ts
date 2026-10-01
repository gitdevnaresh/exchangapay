/**
 * Sentry configuration (security finding H-08).
 *
 * Built here rather than inline in App.tsx so the decisions below can be
 * asserted by tests. "Session Replay is off" is not something you want to be
 * verifying by eye in a 300-line component every time someone edits it.
 *
 * ---------------------------------------------------------------------------
 * SESSION REPLAY IS OFF, DELIBERATELY
 * ---------------------------------------------------------------------------
 * The previous config recorded video-like replays of 10% of all sessions and
 * 100% of sessions that hit an error, with no masking configuration at all.
 *
 * In this app the screens being recorded are card numbers, CVVs, PINs, wallet
 * addresses, KYC document capture, statements and support chats. Relying on a
 * library's default masking for that is not a decision anyone made — it is a
 * decision nobody made. For an app that displays PANs and PINs the defensible
 * answer is not to record at all.
 *
 * BEFORE YOU TURN IT BACK ON, all of the following, in order:
 *   1. maskAllText, maskAllImages and maskAllVectors set explicitly.
 *   2. Every card, PIN and KYC screen wrapped in Sentry.Mask.
 *   3. Recordings pulled from a test device and WATCHED, on those screens.
 *   4. A DPIA, because replay of a payment UI is high-risk processing.
 * Raising the sample rates in Environment.js does nothing on its own — the
 * integration is not registered below, so this is a code change, reviewed,
 * not a config tweak.
 *
 * ---------------------------------------------------------------------------
 * sendDefaultPii IS FALSE
 * ---------------------------------------------------------------------------
 * It was `true`, directly underneath a comment stating it must stay false. When
 * true, Sentry attaches the IP address, cookies and request headers — including
 * Authorization, which is the bearer-token leak finding C-07 was about.
 *
 * L-11: it is hard-coded, not read from config. It used to follow
 * SENTRY_SEND_PII, so one .env line could undo C-07 with no code change and no
 * review. Turning it on is now a code change, same as Session Replay.
 */

import { redact, REDACTED, SENSITIVE_KEY } from "../redact";

export type SentryEnvConfig = {
  enabled?: boolean;
  dsn?: string;
  environment?: string;
  enableLogs?: boolean;
  replaysSessionSampleRate?: number;
  replaysOnErrorSampleRate?: number;
};

/**
 * `extra` keys our own code sets whose values are safe or already redacted at
 * the call site. Allow-list, like redact.ts: an unknown key is redacted.
 */
const SAFE_EXTRA_KEYS = new Set([
  "count",
  "sessionTotals",
  "Request Body",
  "Response Data",
]);

/**
 * Contexts that carry device/runtime facts or our own non-customer data. Any
 * other context is passed through redact().
 */
const SAFE_CONTEXTS = new Set([
  "os",
  "device",
  "app",
  "runtime",
  "culture",
  "trace",
  "react_native_context",
  "certificate_pinning",
]);

/**
 * Values that look like customer data whatever key they sit under: an email,
 * a 12–19 digit run (PAN / account number), or a JWT.
 */
const PII_VALUE =
  /[^\s@]+@[^\s@]+\.[^\s@]+|\b\d{12,19}\b|eyJ[\w-]+\.[\w-]+\.[\w-]+/;

// Last gate before an event leaves the device: strips cookies, headers and user
// fields, and redacts request, breadcrumb, extra, tag and context data.
export const scrubEvent = (event: any): any | null => {
  if (!event) return null;

  if (event.request) {
    delete event.request.cookies;
    delete event.request.headers;
    if (event.request.data) {
      event.request.data = redact(event.request.data);
    }
  }

  // sendDefaultPii: false should already prevent this. Belt and braces, because
  // a future option change should not silently start shipping IP addresses.
  // Keep only the opaque id. Deleting named fields missed username, geo and
  // anything a later setUser() call adds.
  if (event.user) {
    event.user = event.user.id != null ? { id: event.user.id } : undefined;
  }

  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs.map((crumb: any) =>
      crumb && crumb.data ? { ...crumb, data: redact(crumb.data) } : crumb
    );
  }

  if (event.extra) {
    const extra: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(event.extra)) {
      extra[key] =
        SAFE_EXTRA_KEYS.has(key) && !SENSITIVE_KEY.test(key)
          ? value
          : redact(value);
    }
    event.extra = extra;
  }

  // Tags are checked by value rather than allow-listed: the SDK adds its own
  // (os.name, event.origin, ...) and they are the main triage dimensions. Not
  // by key either — SENSITIVE_KEY's /pin/ would hit the pin_status/pin_expiry
  // certificate-pinning tags, and tag names come from code, not customer data.
  if (event.tags) {
    for (const [key, value] of Object.entries(event.tags)) {
      if (PII_VALUE.test(String(value))) {
        event.tags[key] = REDACTED;
      }
    }
  }

  if (event.contexts) {
    // The user-set device name, e.g. "Jane's iPhone".
    if (event.contexts.device) {
      delete event.contexts.device.name;
    }
    for (const key of Object.keys(event.contexts)) {
      if (!SAFE_CONTEXTS.has(key)) {
        event.contexts[key] = redact(event.contexts[key]);
      }
    }
  }

  return event;
};

/**
 * Whether Sentry should be initialised at all. A DSN-less config is treated as
 * disabled regardless of the flag — init() without a DSN is a silent no-op that
 * looks like working telemetry.
 */
export const isSentryEnabled = (config: SentryEnvConfig | undefined): boolean =>
  Boolean(config && config.enabled && config.dsn);

/**
 * Names of integrations that capture the screen. Matched case-insensitively
 * against the integration's `name`, which every Sentry integration carries.
 */
const REPLAY_INTEGRATION = /replay|screenshot|canvas/i;

/**
 * Strip any screen-capturing integration a caller passes in.
 *
 * A comment saying "do not add the replay integration" is advice. This is the
 * part that holds when someone follows a Sentry upgrade guide that says to add
 * it back.
 */
export const withoutScreenCapture = (integrations: any[]): any[] =>
  (integrations || []).filter(
    (integration) => !REPLAY_INTEGRATION.test(integration?.name ?? "")
  );

/**
 * Build the options passed to Sentry.init().
 *
 * Sample rates are forced to 0 unless the config says otherwise, and the replay
 * integration is filtered out regardless — config and code have to agree, and
 * where they disagree the safe value wins.
 *
 * `integrations` is a parameter rather than built here so this module stays free
 * of the Sentry SDK and therefore unit-testable. feedbackIntegration is fine to
 * pass: it is user-initiated, and captures nothing on its own.
 */
export const buildSentryOptions = (
  config: SentryEnvConfig,
  release: string,
  integrations: any[] = []
) => ({
  dsn: config.dsn,
  environment: config.environment,
  release,

  sendDefaultPii: false,
  enableLogs: config.enableLogs === true,

  replaysSessionSampleRate: config.replaysSessionSampleRate ?? 0,
  replaysOnErrorSampleRate: config.replaysOnErrorSampleRate ?? 0,

  integrations: withoutScreenCapture(integrations),

  beforeSend: scrubEvent,
});
