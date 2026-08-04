/**
 * Telemetry surface (security finding H-08).
 *
 * Everything that ships data off the device goes through here: one consent
 * decision, one scrubber, one place to see what Sentry is configured to do.
 */

export {
  getTelemetryConsentSync,
  hasTelemetryConsent,
  initializeTelemetry,
  setTelemetryConsent,
  TELEMETRY_CONSENT_KEY,
} from "./consent";

export {
  buildSentryOptions,
  isSentryEnabled,
  scrubEvent,
  withoutScreenCapture,
} from "./sentryOptions";
export type { SentryEnvConfig } from "./sentryOptions";
