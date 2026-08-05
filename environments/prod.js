/**
 * Production environment.
 *
 * NOT reachable from the bundle unless environments/active.js points here — see
 * that file, and security finding H-13. Keeping the config in the repo is fine;
 * shipping it in a test build is what discloses the tenant layout.
 *
 * BEFORE THIS IS EVER SELECTED, the production Auth0 client must be checked in
 * the console (H-13, and none of it can be done from the app):
 *   - registered as Native / public, PKCE required, no client secret
 *   - Password / ROPC grant disabled
 *   - `offline_access` and `enroll` granted — the scope below asks for both
 *   - not authorised for the Management API audience
 *   - Attack Protection on: brute force, suspicious IP, breached passwords
 * The native layer also still points at the test tenant; see DEFAULT_ENV in
 * Environment.js (finding C-05).
 */

export default {
  envName: "prod",
  oAuthConfig: {
    issuer: "exchangapay.eu.auth0.com",
    clientId: "0zf1gFmgg6rp3BezUDn1jAimFY5FF3hH",
    audience: "https://ExchangaApi.net",
    /**
     * H-13: was "openid profile email" — no `offline_access`, so a correctly
     * configured production build would have received no refresh token and
     * token refresh would have silently stopped working, ending every session
     * at access-token expiry. `enroll` is included for the same reason: the MFA
     * enrolment flow needs it, and its absence would only have surfaced in
     * production. Aligned deliberately with environments/tst.js.
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
    environment: "prod",
    /** IP address, cookies and request headers — including Authorization. Keep false. */
    sendPii: false,
    /** SDK log verbosity. Nothing to do with whether Sentry is enabled. */
    enableLogs: false,
    /** Session Replay of card, PIN and KYC screens. Keep at 0. */
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
  },
  // H-04 — see environments/tst.js. Production ships from Google Play, which
  // links the Cloud project itself, so this stays empty unless the production
  // build is ever distributed outside Play.
  attestation: {
    playIntegrityCloudProject: "",
  },
  // H-01: every host the app talks to is named here — no base URL literals in src/.
  apiUrls: {
    uploadUrl: "https://api.exchangapay.com/",
    cardsUrl: "https://api.exchangapay.com/",
    // MUST BE CONFIRMED BEFORE A PRODUCTION RELEASE. src/utils/api.tsx hardcoded
    // a single set of hosts for every environment, so no production values exist
    // to recover; these are that one set, carried over verbatim. `authUrl` in
    // particular is plainly a TEST login host — shipping it in a production
    // build would point authentication at the test tenant. Treat this block as
    // a release blocker, not a default.
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
