/**
 * Development environment.
 *
 * NOT reachable from the bundle unless environments/active.js points here — see
 * that file, and security finding H-13.
 */

export default {
  envName: "dev",
  oAuthConfig: {
    issuer: "exchangapay.us.auth0.com",
    clientId: "7cpZsKwJutx5HU5lMvqib4eqvYCK0WtO",
    audience: "https://ExchangaApi.net",
    /**
     * H-13: was "openid profile email". Aligned with the other environments so
     * refresh tokens and MFA enrolment behave the same everywhere — a scope
     * that differs per environment produces bugs that only appear after a
     * promotion, which is exactly what happened to `offline_access`.
     */
    scope: "openid profile email enroll offline_access",
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
  // H-04 — see environments/tst.js for what this is and when it is required.
  attestation: {
    playIntegrityCloudProject: "",
  },
  // H-01: every host the app talks to is named here — no base URL literals in src/.
  apiUrls: {
    uploadUrl: "https://devapi.exchangapay.com/",
    cardsUrl: "https://devapi.exchangapay.com/",
    // UNVERIFIED FOR THIS ENVIRONMENT. src/utils/api.tsx hardcoded one set of
    // hosts for all three environments, so there is no dev-tier value to
    // recover — these are the literals it used, carried over so behaviour is
    // unchanged. Confirm the dev equivalents with the backend team before this
    // environment is used for anything that must not touch test data.
    walletGridUrl: "https://neowalletgrid.azurewebsites.net/",
    bankUrl: "https://neobank.azurewebsites.net/",
    walletApiUrl: "https://neowalletapi.azurewebsites.net/",
    authUrl: "https://tstlogin.suissebase.io",
    // Third party. Never receives a bearer token or a device-risk header.
    marketUrl: "https://api.coingecko.com/",
  },
  localization: {
    defaultResourceName: "Exchanga Pay",
  },
};
