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
  apiUrls: {
    uploadUrl: "https://devapi.exchangapay.com/",
    cardsUrl: "https://devapi.exchangapay.com/",
  },
  localization: {
    defaultResourceName: "Exchanga Pay",
  },
};
