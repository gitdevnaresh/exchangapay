/**
 * Crypto surface (security finding H-06).
 *
 * Import from "utils/crypto" rather than reaching into the individual files, so
 * that changing the cipher stays a one-directory change.
 */

export {
  CryptoError,
  decryptAny,
  detectFormat,
  encryptCBC,
  encryptGCM,
  FORMAT_CBC,
  FORMAT_GCM,
  normalizeSecretKey,
} from "./aes";
export type { CryptoFailure, WireFormat } from "./aes";

export {
  getLegacyFormatCounts,
  recordLegacyFormatDecrypt,
  resetLegacyFormatCounts,
} from "./legacyTelemetry";
export type { LegacyFormat } from "./legacyTelemetry";

export {
  getIntegrityFailureCounts,
  recordDecryptFailure,
  resetIntegrityFailureCounts,
} from "./integrityTelemetry";
export type { CryptoContext } from "./integrityTelemetry";

export {
  AT_REST_USES_AEAD,
  BACKEND_SUPPORTS_AEAD,
  LEGACY_FORMAT_REMOVAL_DATE,
  LEGACY_FORMATS_ENABLED,
} from "./policy";
