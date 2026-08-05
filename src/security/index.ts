/**
 * Device-integrity and attestation surface (security finding H-04).
 *
 * Import from "../security" rather than reaching into the individual files, so
 * that swapping the detection backend (jail-monkey, a RASP SDK) stays a one-file
 * change.
 */

export {
  evaluateDeviceIntegrity,
  isDeviceCompromised,
  isEnforcementEnabled,
  toRiskHeader,
  UNKNOWN_REPORT,
} from "./deviceIntegrity";
export type { IntegrityLevel, IntegrityReport, IntegritySignal } from "./deviceIntegrity";

export {
  getIntegrityReport,
  initializeDeviceIntegrity,
  refreshDeviceIntegrity,
  useDeviceIntegrity,
} from "./integrityState";

export {
  cacheAppLock,
  clearCachedAppLock,
  isAppLockEnabled,
  readCachedAppLock,
} from "./appLock";

export { guardHighRiskAction } from "./guard";
export type { GuardOptions, HighRiskOperation } from "./guard";

export {
  clearBiometricKeys,
  createBiometricKey,
  describeBiometricOutcome,
  getBiometricStatus,
  hasBiometricKey,
  isSignatureBiometricsEnabled,
  requireUserPresence,
  signBiometricChallenge,
} from "./biometricAuth";
export type { BiometricOutcome, BiometricStatus } from "./biometricAuth";

export {
  clearAttestationToken,
  getAttestationToken,
  isAttestationAvailable,
} from "./attestation";
export { requiresAttestation } from "./attestationPolicy";

export {
  buildCardHtmlDocument,
  CARD_HTML_CSP,
  CARD_HTML_WEBVIEW_PROPS,
  isCardHtmlNavigationAllowed,
  MAX_HTML_LENGTH,
  sanitizeCardHtml,
  sanitizeNotesHtml,
} from "./htmlPolicy";

export {
  getApiHosts,
  getIdentityHosts,
  getTwoFactorAllowedHosts,
  getTwoFactorAllowedOrigins,
  isAllowedTwoFactorUrl,
  matchTwoFactorCallback,
  parseHttpsUrl,
  TWO_FACTOR_STATE_PATH,
} from "./webViewUrlPolicy";
export type { ParsedHttpsUrl } from "./webViewUrlPolicy";
