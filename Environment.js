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

import Config from "react-native-config";
import { log } from "./src/utils/logger";

const APP_ENV = Config.APP_ENV;

if (!APP_ENV || !["dev", "tst", "prod"].includes(APP_ENV)) {
  throw new Error(
    `[Environment] APP_ENV="${APP_ENV}" is invalid. ` +
      "Set APP_ENV to dev, tst, or prod in your .env file and rebuild."
  );
}

const env = {
  envName: APP_ENV,
  oAuthConfig: {
    issuer: Config.AUTH0_ISSUER,
    clientId: Config.AUTH0_CLIENT_ID,
    audience: Config.AUTH0_AUDIENCE,
    scope: Config.AUTH0_SCOPE,
  },
  sentry: {
    enabled: Config.SENTRY_ENABLED === "true",
    dsn: Config.SENTRY_DSN,
    environment: APP_ENV,
    sendPii: Config.SENTRY_SEND_PII === "true",
    enableLogs: Config.SENTRY_ENABLE_LOGS === "true",
    replaysSessionSampleRate: Number(Config.SENTRY_REPLAYS_SESSION_RATE ?? 0),
    replaysOnErrorSampleRate: Number(Config.SENTRY_REPLAYS_ERROR_RATE ?? 0),
  },
  attestation: {
    playIntegrityCloudProject: Config.PLAY_INTEGRITY_CLOUD_PROJECT ?? "",
  },
  apiUrls: {
    uploadUrl: Config.UPLOAD_URL,
    cardsUrl: Config.CARDS_URL,
    walletGridUrl: Config.WALLET_GRID_URL,
    bankUrl: Config.BANK_URL,
    walletApiUrl: Config.WALLET_API_URL,
    authUrl: Config.AUTH_URL,
    marketUrl: Config.MARKET_URL,
  },
  localization: {
    defaultResourceName: Config.DEFAULT_RESOURCE_NAME,
  },
};

// Guard: every required field must be present. A missing value means the .env
// file is incomplete — fail loudly at startup rather than making a silent
// request to undefined.
const REQUIRED = [
  "AUTH0_ISSUER", "AUTH0_CLIENT_ID", "AUTH0_AUDIENCE",
  "UPLOAD_URL", "CARDS_URL", "AUTH_URL",
];
const missing = REQUIRED.filter((k) => !Config[k]);
if (missing.length) {
  log.warn("[Environment] Missing required .env variables", { missing });
}

export const getAllEnvData = (_envName) => env;
export const getCurrentEnvName = () => APP_ENV;
export const isProductionEnv = () => APP_ENV === "prod";
