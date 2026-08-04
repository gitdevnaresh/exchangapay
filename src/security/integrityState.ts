/**
 * Holds the current device-integrity verdict for the process.
 *
 * Deliberately NOT a redux-persist slice. The store is persisted to the Keychain,
 * and a cached "ok" verdict rehydrating on a device that has since been rooted is
 * exactly the failure this check exists to prevent. The verdict is re-derived on
 * every cold start and lives only in memory.
 *
 * Kept out of Redux for a second reason: the API interceptor needs the verdict
 * synchronously on every request, and reaching into the store from there would
 * couple the transport layer to reducer shape.
 */

import { useSyncExternalStore } from "react";
import {
  evaluateDeviceIntegrity,
  IntegrityReport,
  UNKNOWN_REPORT,
} from "./deviceIntegrity";

type Listener = () => void;

let current: IntegrityReport = UNKNOWN_REPORT;
const listeners = new Set<Listener>();
let evaluation: Promise<IntegrityReport> | null = null;

const emit = () => listeners.forEach((listener) => listener());

/** Synchronous read for non-React callers (API interceptor, service layer). */
export const getIntegrityReport = (): IntegrityReport => current;

/**
 * Runs the check once per app launch. Safe to call from several places — later
 * callers await the first evaluation instead of starting another.
 */
export const initializeDeviceIntegrity = (): Promise<IntegrityReport> => {
  if (evaluation) return evaluation;

  evaluation = evaluateDeviceIntegrity()
    .then((report) => {
      current = report;
      emit();
      return report;
    })
    .catch(() => {
      // evaluateDeviceIntegrity() already fails open; this is belt-and-braces so
      // a throw here can never leave the app without a verdict object.
      current = { ...UNKNOWN_REPORT, evaluatedAt: Date.now() };
      emit();
      return current;
    });

  return evaluation;
};

/**
 * Forces a re-check. Worth calling when the app returns to the foreground after a
 * long background stint, since a device can be rooted between sessions.
 */
export const refreshDeviceIntegrity = (): Promise<IntegrityReport> => {
  evaluation = null;
  return initializeDeviceIntegrity();
};

const subscribe = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/** React binding. Re-renders when the verdict lands. */
export const useDeviceIntegrity = (): IntegrityReport =>
  useSyncExternalStore(subscribe, getIntegrityReport, getIntegrityReport);
