/**
 * Telemetry surface (security finding H-08).
 *
 * Everything that ships data off the device goes through here: one scrubber,
 * one place to see what Sentry is configured to do.
 */

export {
  buildSentryOptions,
  isSentryEnabled,
  scrubEvent,
  withoutScreenCapture,
} from "./sentryOptions";
export type { SentryEnvConfig } from "./sentryOptions";
