import { log } from "./src/utils/logger";

const ENV = {
  dev: {
    envName: "dev",
    oAuthConfig: {
      issuer: "exchangapay.us.auth0.com",
      clientId: "7cpZsKwJutx5HU5lMvqib4eqvYCK0WtO",
      audience: "https://ExchangaApi.net",
      scope: "openid profile email",
    },
    // dev had no Sentry config at all, so the old `oAuthConfig.sentryLoggs`
    // read as undefined. Stated explicitly now rather than left to fall through.
    sentry: {
      enabled: false,
      dsn: "",
      environment: "dev",
      sendPii: false,
      enableLogs: false,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,
    },
    apiUrls: {
      uploadUrl: "https://devapi.exchangapay.com/",
      cardsUrl: "https://devapi.exchangapay.com/",
    },
    localization: {
      defaultResourceName: "Exchanga Pay",
    },
  },
  prod: {
    envName: "prod",
    oAuthConfig: {
      issuer: "exchangapay.eu.auth0.com",
      clientId: "0zf1gFmgg6rp3BezUDn1jAimFY5FF3hH",
      audience: "https://ExchangaApi.net",
      scope: "openid profile email",
    },
    // Telemetry (security finding H-08). Moved out of oAuthConfig — it has
    // nothing to do with OAuth — and split into named fields. One flag,
    // `sentryLoggs`, used to gate three unrelated things: whether Sentry ran at
    // all, SDK log verbosity, and by omission the fact that nobody had decided
    // about Session Replay. `sentryEnvornment` was also misspelled.
    //
    // Raising the replay rates here does NOT enable replay: the integration is
    // filtered out in src/utils/telemetry/sentryOptions.ts, which documents what
    // has to happen first. Turning it on is a reviewed code change.
    sentry: {
      /** Whether Sentry.init() runs. Off means no production error visibility. */
      enabled: true,
      dsn: "https://97c9602ff0c4f74c3f55743eace18039@o4510198382919680.ingest.us.sentry.io/4510198383902720",
      /** Was `sentryEnvornment`. Must match envName, or prod incidents file under the wrong project. */
      environment: "prod",
      /** IP address, cookies and request headers — including Authorization. Keep false. */
      sendPii: false,
      /** SDK log verbosity. Nothing to do with whether Sentry is enabled. */
      enableLogs: false,
      /** Session Replay of card, PIN and KYC screens. Keep at 0. */
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,
    },
    apiUrls: {
      uploadUrl: "https://api.exchangapay.com/",
      cardsUrl: "https://api.exchangapay.com/",
    },
    localization: {
      defaultResourceName: "Exchanga Pay",
    },
  },
  tst: {
    envName: "tst",
    oAuthConfig: {
      issuer: "exchangapay-tst.eu.auth0.com",
      clientId: "QN7NMqYHzengFUnmR0HCvenDCSOwGwNs",
      audience: "https://ExchangaTstApi.net",
      scope: "openid profile email enroll offline_access",
    },
    // Telemetry (security finding H-08). Moved out of oAuthConfig — it has
    // nothing to do with OAuth — and split into named fields. One flag,
    // `sentryLoggs`, used to gate three unrelated things: whether Sentry ran at
    // all, SDK log verbosity, and by omission the fact that nobody had decided
    // about Session Replay. `sentryEnvornment` was also misspelled.
    //
    // Raising the replay rates here does NOT enable replay: the integration is
    // filtered out in src/utils/telemetry/sentryOptions.ts, which documents what
    // has to happen first. Turning it on is a reviewed code change.
    sentry: {
      /** Whether Sentry.init() runs. Off means no production error visibility. */
      enabled: true,
      dsn: "https://97c9602ff0c4f74c3f55743eace18039@o4510198382919680.ingest.us.sentry.io/4510198383902720",
      /** Was `sentryEnvornment`. Must match envName, or prod incidents file under the wrong project. */
      environment: "tst",
      /** IP address, cookies and request headers — including Authorization. Keep false. */
      sendPii: false,
      /** SDK log verbosity. Nothing to do with whether Sentry is enabled. */
      enableLogs: false,
      /** Session Replay of card, PIN and KYC screens. Keep at 0. */
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,
    },
    apiUrls: {
      uploadUrl: "https://tstapi.exchangapay.com/",
      cardsUrl: "https://tstapi.exchangapay.com/",
    },
    localization: {
      defaultResourceName: "Exchanga Pay",
    },
  },
};

/**
 * Build-time environment name.
 *
 * APP_ENV is inlined by the bundler once a build-time environment mechanism is in
 * place (react-native-config, or babel-plugin-transform-inline-environment-variables).
 * Neither is installed yet, so this is currently always null and DEFAULT_ENV applies.
 * The guard on `process` keeps this safe in any JS runtime the bundle may load in.
 */
const BUILD_ENV =
  (typeof process !== "undefined" && process.env && process.env.APP_ENV) || null;

/**
 * The environment this build targets when a caller does not name one explicitly.
 *
 * DELIBERATELY PINNED TO "tst" — see security finding C-05. This is not the same
 * bug the audit found (a function that accepted an argument and silently discarded
 * it); resolution below is now honest and single-sourced. But the *native* layer is
 * hardwired to the test tenant, and JavaScript alone cannot move this app to
 * production:
 *
 *   android/app/build.gradle   applicationId  com.exchangapay.tst
 *   android/app/build.gradle   auth0Domain    exchangapay-tst.eu.auth0.com
 *   android/app/google-services.json          project exchangapay-tst-f570a
 *   ios/GoogleService-Info.plist              project exchangapay-tst-f570a
 *
 * The Auth0 callback scheme is registered natively against the *test* tenant, so
 * flipping this constant on its own would point the API and Auth0 at production
 * while the OAuth redirect and Firebase config still belong to test — login would
 * fail outright, not degrade gracefully. Note also that ENV.prod's scope omits
 * `offline_access`, so prod sessions would not refresh.
 *
 * Changing this value is the LAST step of the migration, not the first.
 */
const DEFAULT_ENV = "tst";

const resolveEnvName = (envName) => {
  const requested = envName || BUILD_ENV || DEFAULT_ENV;
  if (!ENV[requested]) {
    log.warn("[Environment] Unknown environment requested; falling back", {
      requested,
      fallback: DEFAULT_ENV,
    });
    return DEFAULT_ENV;
  }
  return requested;
};

/**
 * Returns the config block for `envName`, or for the environment this build
 * targets when called with no argument — which is how every call site should
 * call it. Passing a literal environment name hardcodes one module to one
 * backend and is what allowed the app to straddle two environments before.
 */
export const getAllEnvData = (envName) => ENV[resolveEnvName(envName)];

/** Name of the environment this build targets, e.g. "tst". */
export const getCurrentEnvName = () => resolveEnvName();

/** True only for genuine production builds. Use to gate anything env-sensitive. */
export const isProductionEnv = () => resolveEnvName() === "prod";
