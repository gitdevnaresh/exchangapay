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

export { guardHighRiskAction } from "./guard";
export type { HighRiskOperation } from "./guard";

export {
  clearAttestationToken,
  getAttestationToken,
  isAttestationAvailable,
} from "./attestation";
