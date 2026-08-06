/**
 * App environment — all values come from the .env file loaded at build time
 * by react-native-config. Switch environments by running:
 *
 *   npm run env:tst   →  copies .env.tst  to .env, then rebuild
 *   npm run env:prod  →  copies .env.prod to .env, then rebuild
 *   npm run env:dev   →  copies .env.dev  to .env, then rebuild
 *
 * The native layer (applicationId, auth0Domain, Firebase) is driven by the
 * same .env file — see ANDROID_APPLICATION_ID / ANDROID_AUTH0_DOMAIN in
 * android/app/build.gradle and .env.example.
 */

import { log } from "./src/utils/logger";

const VALID_ENV_NAMES = ["dev", "tst", "prod"];
const REQUIRED = [
  "AUTH0_ISSUER",
  "AUTH0_CLIENT_ID",
  "AUTH0_AUDIENCE",
  "UPLOAD_URL",
  "CARDS_URL",
];
let cachedEnv = null;
let cachedConfig = null;

const getRawConfig = () => {
  if (!cachedConfig) {
    try {
      const pkg = require("react-native-config");
      cachedConfig = pkg?.default ?? pkg;
    } catch (error) {
      throw new Error(
        "[Environment] Could not load react-native-config. " +
          "Make sure the native module is linked and the app is rebuilt after changing .env."
      );
    }
  }

  if (!cachedConfig || typeof cachedConfig !== "object") {
    throw new Error(
      "[Environment] react-native-config did not return a config object. " +
        "Ensure the native module is linked and the app is rebuilt after changing .env."
    );
  }
  return cachedConfig;
};

const validateEnv = (config) => {
  const APP_ENV = config.APP_ENV;
  if (!APP_ENV || !VALID_ENV_NAMES.includes(APP_ENV)) {
    throw new Error(
      `[Environment] APP_ENV="${APP_ENV}" is invalid. ` +
        "Set APP_ENV to dev, tst, or prod in your .env file and rebuild."
    );
  }
  return APP_ENV;
};

const buildEnv = () => {
  if (cachedEnv) {
    return cachedEnv;
  }

  const config = getRawConfig();
  const APP_ENV = validateEnv(config);

  const missing = REQUIRED.filter((k) => !config[k]);
  if (missing.length) {
    log.warn("[Environment] Missing required .env variables", { missing });
  }

  cachedEnv = {
    envName: APP_ENV,
    oAuthConfig: {
      issuer: config.AUTH0_ISSUER,
      clientId: config.AUTH0_CLIENT_ID,
      audience: config.AUTH0_AUDIENCE,
      scope: config.AUTH0_SCOPE,
    },
    sentry: {
      enabled: config.SENTRY_ENABLED === "true",
      dsn: config.SENTRY_DSN,
      environment: APP_ENV,
      sendPii: config.SENTRY_SEND_PII === "true",
      enableLogs: config.SENTRY_ENABLE_LOGS === "true",
      replaysSessionSampleRate: Number(config.SENTRY_REPLAYS_SESSION_RATE ?? 0),
      replaysOnErrorSampleRate: Number(config.SENTRY_REPLAYS_ERROR_RATE ?? 0),
    },
    attestation: {
      playIntegrityCloudProject: config.PLAY_INTEGRITY_CLOUD_PROJECT ?? "",
      enforcementEnabled: config.ATTESTATION_ENFORCEMENT_ENABLED === "true",
      challengePath:
        config.ATTESTATION_CHALLENGE_PATH ??
        "api/v1/security/attestation/challenge",
    },
    apiUrls: {
      uploadUrl: config.UPLOAD_URL,
      cardsUrl: config.CARDS_URL,
      marketUrl: config.MARKET_URL,
    },
    localization: {
      defaultResourceName: config.DEFAULT_RESOURCE_NAME,
    },
  };

  return cachedEnv;
};

export const getAllEnvData = (_envName) => buildEnv();
export const getCurrentEnvName = () => getRawConfig().APP_ENV;
export const isProductionEnv = () => getRawConfig().APP_ENV === "prod";
