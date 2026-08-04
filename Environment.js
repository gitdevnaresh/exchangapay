/**
 * The app's view of its environment.
 *
 * The three environment definitions moved to environments/*.js, and this module
 * reads only the one environments/active.js points at — security finding H-13.
 * A build therefore contains exactly one Auth0 client ID, one issuer and one
 * set of API hosts, rather than the whole tenant layout. Read active.js before
 * changing anything here; it explains the mechanism and what a migration needs.
 *
 * The exports below are unchanged, and every call site should keep calling
 * getAllEnvData() with no argument (finding C-05).
 */

import { log } from "./src/utils/logger";
import activeEnv from "./environments/active";

/**
 * Build-time environment name.
 *
 * APP_ENV is inlined by the bundler once a build-time environment mechanism is
 * in place (react-native-config, or babel-plugin-transform-inline-environment-variables).
 * Neither is installed yet, so this is currently always null. It is read only
 * to detect a *mismatch* with the environment this build actually carries —
 * selecting an environment is environments/active.js's job now, because a value
 * read at runtime cannot remove the other environments from the bundle.
 * The guard on `process` keeps this safe in any JS runtime the bundle may load in.
 */
const BUILD_ENV =
  (typeof process !== "undefined" && process.env && process.env.APP_ENV) || null;

/**
 * The environment this build targets.
 *
 * DELIBERATELY the test tenant — see security finding C-05 and the notes in
 * environments/active.js. Resolution is single-sourced: this constant is
 * derived from the config that is actually bundled, so the two cannot disagree
 * the way a separate string constant could.
 */
const DEFAULT_ENV = activeEnv.envName;

if (BUILD_ENV && BUILD_ENV !== DEFAULT_ENV) {
  // A build script set APP_ENV without repointing environments/active.js. The
  // bundle physically contains only DEFAULT_ENV, so honouring APP_ENV here is
  // not possible — say so loudly rather than shipping a build that thinks it is
  // something it is not.
  log.warn("[Environment] APP_ENV does not match the bundled environment", {
    requested: BUILD_ENV,
    bundled: DEFAULT_ENV,
  });
}

const resolveEnvName = (envName) => {
  if (envName && envName !== DEFAULT_ENV) {
    // Passing a literal environment name is what allowed the app to straddle
    // two backends (C-05); now it is also unsatisfiable, since the other
    // environments are not in the bundle. Warn and serve the bundled one.
    log.warn("[Environment] Ignoring a request for a non-bundled environment", {
      requested: envName,
      bundled: DEFAULT_ENV,
    });
  }
  return DEFAULT_ENV;
};

/**
 * Returns the config block for the environment this build targets — which is
 * what every call site wants, and what every call site currently does by
 * calling this with no argument. The parameter is retained so existing callers
 * keep compiling; it no longer selects anything.
 */
export const getAllEnvData = (envName) => {
  resolveEnvName(envName);
  return activeEnv;
};

/** Name of the environment this build targets, e.g. "tst". */
export const getCurrentEnvName = () => DEFAULT_ENV;

/** True only for genuine production builds. Use to gate anything env-sensitive. */
export const isProductionEnv = () => DEFAULT_ENV === "prod";
