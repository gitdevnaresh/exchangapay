/**
 * One-time-code transport — security finding M-02.
 *
 * ===========================================================================
 * THE FINDING
 * ===========================================================================
 * Verification codes travelled in the URL path:
 *
 *     GET api/v1/Security/PhoneVerification/482913
 *     PUT api/v1/Security/VerifyGoogleAuthenticator/135790
 *     GET api/v1/Customer/PhoneVerification/482913
 *
 * TLS and pinning protect that in flight, but the request *line* is recorded by
 * design at every hop that terminates or observes TLS — the API gateway access
 * log, the WAF, the CDN, the reverse proxy, any APM agent. A code issued with a
 * five-minute lifetime then sits in log storage for the retention period, which
 * is months. For the Google Authenticator route the value in the path is a live
 * second factor.
 *
 * ===========================================================================
 * WHY THIS IS A CLIENT SHIM AND NOT A ONE-LINE EDIT
 * ===========================================================================
 * The fix is to carry the code in the request body. Where the code travels is
 * half of a contract, and the backend owns the other half: changing the client
 * alone to POST a body against a route that only accepts GET-with-path-segment
 * would not harden anything, it would simply stop phone verification and 2FA
 * enrolment from working — the two flows that gate onboarding and account
 * security.
 *
 * So this module does both, in the right order:
 *
 *   1. Call the body-based route first. When the backend ships it (see
 *      security/M02_OTP_TRANSPORT_CONTRACT.md) the code stops appearing in the
 *      request line, with no app release and no store review.
 *   2. If that route does not exist yet, fall back to the legacy path form once
 *      and remember the answer for the rest of the session, so verification
 *      keeps working exactly as it does today.
 *
 * The finding does not fully close until step 1 succeeds in production. What
 * this module buys is that the closing move is a backend deploy rather than a
 * coordinated backend deploy plus an app release plus waiting for users to
 * update — and, separately, that the client-side half of the exposure (the code
 * reaching Crashlytics and Sentry via `config.url`) is closed right now by
 * redactUrl in src/utils/redact.ts.
 *
 * ===========================================================================
 * WHY THE FALLBACK IS THIS NARROW
 * ===========================================================================
 * Only 404 / 405 / 501 trigger it. Those mean "no such route" — the request was
 * refused before anything read the code, so retrying on the legacy route costs
 * the user nothing.
 *
 * Every other outcome is returned untouched, and the distinction is
 * load-bearing:
 *
 *   400 / 401 / 409  the backend READ the code and rejected it. Retrying would
 *                    burn a second attempt against the rate limit and could
 *                    consume a single-use code, so a user who typed one wrong
 *                    digit would be locked out twice as fast.
 *   429              rate limited. Retrying is precisely the wrong response.
 *   5xx              the backend may have consumed the code before failing. A
 *                    retry risks double-submission.
 *   no status at all network error or timeout. There is no evidence the route
 *                    is missing, so falling back would convert every flaky
 *                    connection into a permanent downgrade to the leaky path.
 *
 * The cache is per session and in memory only. A backend deploy mid-session is
 * picked up on next launch; persisting the verdict would make one bad probe
 * survive the fix that corrected it.
 */

import type { AxiosRequestConfig } from "axios";
import * as Sentry from "@sentry/react-native";
import { log } from "../utils/logger";

/**
 * `silentStatuses` is a real request option, so declare it as one.
 *
 * The alternative was casting it to `any` at each call site, which would have
 * compiled and told the next reader nothing — and would have silently accepted
 * a typo in the field name, leaving the probe reporting a crash per session
 * with no compile error to say so.
 */
declare module "axios" {
  export interface AxiosRequestConfig {
    /**
     * HTTP statuses that are an expected answer for this request rather than a
     * fault. Suppresses the crash report only; the promise still rejects.
     * Honoured by handleErrorCapture in src/utils/apiInterceptors.ts.
     */
    silentStatuses?: number[];
  }
}

/** The subset of an apisauce response this module needs. */
type ApiLikeResponse = {
  ok?: boolean;
  status?: number | null;
  data?: any;
  problem?: string | null;
};

/**
 * Statuses that mean "this route does not exist here".
 *
 * 501 is included because some gateways answer an unrouted method that way
 * rather than 405.
 */
const ROUTE_ABSENT = [404, 405, 501];

/**
 * Pass as the axios config of the secure attempt so a probe against a
 * not-yet-migrated backend does not raise a crash report. See the
 * `silentStatuses` handling in src/utils/apiInterceptors.ts.
 */
export const OTP_PROBE_CONFIG: AxiosRequestConfig = {
  silentStatuses: ROUTE_ABSENT,
};

/** channel -> does the body-based route exist on this backend? */
const secureRouteAvailable = new Map<string, boolean>();

/** Test seam. Never call from application code. */
export const __resetOtpTransportCache = () => secureRouteAvailable.clear();

export type OneTimeCodeCall<T extends ApiLikeResponse> = {
  /** Stable id for the endpoint pair, used as the capability cache key. */
  channel: string;
  /** The body-based call. Preferred, and the one that closes the finding. */
  secure: () => Promise<T>;
  /** The legacy path-segment call. Used only while the backend lacks `secure`. */
  legacy: () => Promise<T>;
};

/**
 * Submit a one-time code, preferring the body-based route.
 *
 * Returns the underlying apisauce response unchanged in every case, so call
 * sites keep reading `res.status` / `res.data` exactly as before. This function
 * never throws on its own account.
 */
export const verifyOneTimeCode = async <T extends ApiLikeResponse>({
  channel,
  secure,
  legacy,
}: OneTimeCodeCall<T>): Promise<T> => {
  // Already established this backend has not migrated: go straight to the route
  // that works. One probe per channel per session, not one per attempt.
  if (secureRouteAvailable.get(channel) === false) {
    return legacy();
  }

  const response = await secure();
  const status = response?.status ?? null;

  if (status !== null && ROUTE_ABSENT.includes(status)) {
    if (secureRouteAvailable.get(channel) !== false) {
      secureRouteAvailable.set(channel, false);
      log.warn(
        "[M-02] Body-based verification route is absent; falling back to the " +
          "legacy path form. The one-time code will appear in the backend " +
          "request line until this route is deployed.",
        { channel }
      );
      Sentry.addBreadcrumb({
        category: "security.m02",
        level: "warning",
        message: `[M-02] legacy path transport used for ${channel}`,
      });
    }
    return legacy();
  }

  // Any real answer — success or rejection — proves the route is there.
  if (status !== null) {
    secureRouteAvailable.set(channel, true);
  }

  return response;
};
