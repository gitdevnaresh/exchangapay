/**
 * Test environment.
 *
 * One file per environment so that a build carries the identifiers of exactly
 * one tenant — see environments/active.js and security finding H-13. Nothing
 * imports this file except active.js; adding another importer puts two tenants
 * in the bundle again and fails __tests__/environmentConfig.test.js.
 */

export default {
  envName: "tst",
  oAuthConfig: {
    issuer: "exchangapay-tst.eu.auth0.com",
    clientId: "QN7NMqYHzengFUnmR0HCvenDCSOwGwNs",
    audience: "https://ExchangaTstApi.net",
    /**
     * H-13: this scope set is the reference the other environments are aligned
     * to. `offline_access` is what makes refresh tokens available at all —
     * without it checkAndRefreshToken() has nothing to refresh with and the
     * session simply ends at access-token expiry.
     */
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
  // Device attestation (security finding H-04). Play Integrity links builds
  // installed from Google Play to their Cloud project automatically; a build
  // distributed any other way — internal QA, Firebase App Distribution,
  // sideloaded — must name the project number here or the token request fails.
  // Not a secret: it identifies a project, it does not authorise anything.
  // Empty means "rely on Play linkage"; iOS ignores this entirely.
  attestation: {
    playIntegrityCloudProject: "",
  },
  // H-01: every host the app talks to is named here. A base URL literal under
  // src/ cannot be repointed per environment, which is how the test build came
  // to hold production hosts; __tests__/apiLayerHardening.test.ts now fails on
  // any `create({ baseURL: "https://..." })` left in src/.
  apiUrls: {
    uploadUrl: "https://tstapi.exchangapay.com/",
    cardsUrl: "https://tstapi.exchangapay.com/",
    // Hosts recovered from the hardcoded literals in src/utils/api.tsx. These
    // were the *only* values that layer ever used, in every build — the test
    // build was talking to them as-is, so these are the test-tier values by
    // observation rather than by configuration. They still carry live traffic
    // (bank transfers, balances, payee additions) and are NOT covered by the
    // certificate pin-set — see H-02. Migrate them behind *.exchangapay.com or
    // add them to the pin-set; until then this block is the record of what is
    // unpinned.
    walletGridUrl: "https://neowalletgrid.azurewebsites.net/",
    bankUrl: "https://neobank.azurewebsites.net/",
    walletApiUrl: "https://neowalletapi.azurewebsites.net/",
    authUrl: "https://tstlogin.suissebase.io",
    // Third party. Never receives a bearer token or a device-risk header —
    // see applyThirdPartyInterceptors in src/utils/apiInterceptors.ts.
    marketUrl: "https://api.coingecko.com/",
  },
  localization: {
    defaultResourceName: "Exchanga Pay",
  },
};
