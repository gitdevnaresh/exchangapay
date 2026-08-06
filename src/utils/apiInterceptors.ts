/**
 * The single outbound HTTP chokepoint — security finding H-01.
 *
 * The app used to have two HTTP layers. src/utils/ApiService.ts carried the
 * whole security stack (bearer token, device posture, idempotency, redacted
 * telemetry); src/utils/api.tsx carried seven apisauce instances built from
 * hardcoded host literals with no interceptors at all — and it was not
 * vestigial, it moved bank transfers, balances and payee additions.
 *
 * Every control below therefore lives here rather than next to one instance.
 * A control attached to a chokepoint is enforced by construction; a control
 * attached to a convention is enforced by memory, and memory is what produced
 * the second layer. __tests__/apiLayerHardening.test.ts asserts that every
 * exported instance actually went through applyStandardInterceptors() or
 * applyThirdPartyInterceptors(), so a new instance cannot quietly opt out.
 */

import type { ApisauceInstance } from "apisauce";
import { getAllEnvData, getCurrentEnvName } from "../../Environment";
import { redact, redactToString, redactUrl } from "./redact";
import { isTransientTokenFailure, readAccessToken } from "./storage/authTokens";
import { KEYCHAIN_SERVICES, readSecretValue } from "./storage/keychainPolicy";
import crashlytics from "@react-native-firebase/crashlytics";
import { getApplicationName } from "react-native-device-info";
import store from "../store";
import * as Sentry from "@sentry/react-native";
import idempotencyConfig, { fastHash } from "./idempotency";
import {
  getAttestationToken,
  getIntegrityReport,
  requiresAttestation,
  toRiskHeader,
} from "../security";

const appName = getApplicationName();

const ATTESTATION_CHALLENGE_HEADER = "X-Device-Attestation-Challenge";
const ATTESTATION_ACTION_HEADER = "X-Device-Attestation-Action";

type AttestationChallenge = {
  challengeId: string;
  nonce: string;
};

const getAttestationConfig = () => {
  const env = getAllEnvData() as any;
  return {
    enforcementEnabled: env?.attestation?.enforcementEnabled === true,
    challengePath:
      env?.attestation?.challengePath ||
      "api/v1/security/attestation/challenge",
  };
};

const createAttestationError = (message: string): Error => {
  const error: any = new Error(message);
  error.code = "ERR_DEVICE_ATTESTATION_REQUIRED";
  error.isDeviceAttestationError = true;
  return error;
};

const requestUrl = (config: any, path: string): string => {
  if (/^https?:\/\//i.test(path)) return path;
  const baseUrl = String(config?.baseURL || "").replace(/\/+$/, "");
  if (!baseUrl) {
    throw createAttestationError(
      "Unable to obtain a device-attestation challenge"
    );
  }
  return `${baseUrl}/${path.replace(/^\/+/, "")}`;
};

const requestAction = (config: any): string => {
  const method = String(config?.method || "POST").toUpperCase();
  const path = String(config?.url || "")
    .split(/[?#]/)[0]
    .replace(/^\/+/, "");
  return `${method} /${path}`;
};

/**
 * Obtains a one-time nonce from the same API host that will consume the
 * protected request. The request itself intentionally bypasses axios so it
 * cannot recurse through this interceptor.
 */
const getServerAttestationChallenge = async (
  config: any
): Promise<AttestationChallenge> => {
  const { challengePath } = getAttestationConfig();
  const action = requestAction(config);
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (config?.headers?.Authorization) {
    headers.Authorization = String(config.headers.Authorization);
  }

  let response: Response;
  try {
    response = await fetch(requestUrl(config, challengePath), {
      method: "POST",
      headers,
      body: JSON.stringify({ action }),
    });
  } catch {
    throw createAttestationError(
      "Unable to obtain a device-attestation challenge"
    );
  }
  if (!response.ok) {
    throw createAttestationError(
      "Device attestation is unavailable. Please try again."
    );
  }

  let payload: any;
  try {
    payload = await response.json();
  } catch {
    throw createAttestationError(
      "Invalid device-attestation challenge response"
    );
  }
  if (
    typeof payload?.challengeId !== "string" ||
    payload.challengeId.length < 16 ||
    typeof payload?.nonce !== "string" ||
    payload.nonce.length < 16
  ) {
    throw createAttestationError(
      "Invalid device-attestation challenge response"
    );
  }
  return { challengeId: payload.challengeId, nonce: payload.nonce };
};

/**
 * Resolves a base URL from the bundled environment.
 *
 * H-01: every host the app talks to is named in environments/*.js. No base URL
 * literal may remain under src/ — a literal cannot be repointed per environment,
 * which is how a test build came to hold production hosts (see H-04 scenario C).
 */
/**
 * Resolve a configured API host by key.
 *
 * N-01: this used to return `(apiUrls[path] || "").trim()` — an empty string for
 * a key that does not exist. When the environment source of truth moved from
 * environments/*.js to .env, three keys stopped being defined and three apisauce
 * instances were built with a base URL of `""`. Nothing threw, nothing warned,
 * nothing was logged: axios accepted the empty base URL and resolved every
 * relative path against a document base that does not exist in a React Native
 * bundle. The failure surfaced as a spinner, on the dashboard's primary render
 * path, and only became visible when someone read the config by hand.
 *
 * A missing configuration key is a build-time mistake and must behave like one.
 * Throwing here means it fails in the first `npx jest` run, in the first debug
 * launch, and in `__tests__/envContract.test.ts` — all of which happen before a
 * user could ever see it.
 *
 * Note this throws at module load for `create({ baseURL: getUrl(...) })`, which
 * is the intent: a build with an unresolvable host is not a build that should
 * start and degrade, it is one that should never have got past the first
 * developer to run it.
 */
export const getUrl = (path: string) => {
  // No literal env name: the target is resolved once, in Environment.js. Passing
  // "prod" here while other modules passed "tst" is how the app came to straddle
  // two backends (C-05).
  // H-13 gave the env config a concrete shape (one module per environment), so
  // the lookup is annotated rather than implicitly `any`.
  const apiUrls: Record<string, string> = getAllEnvData().apiUrls;
  // trim: leading/trailing whitespace makes axios treat the baseURL as a
  // relative path and resolve it against the bundle's file:// document base
  const value = (apiUrls[path] || "").trim();
  if (!value) {
    throw new Error(
      `[Environment] apiUrls.${path} is not defined (security finding N-01). ` +
        `Add it to the apiUrls block in Environment.js and to every .env file, ` +
        `then add the host to security/pinning-policy.json or the Android pin-set. ` +
        `Defined keys: ${Object.keys(apiUrls).join(", ") || "(none)"}.`
    );
  }
  return value;
};

/**
 * H-04: carry the device posture to the backend on every request.
 *
 * X-Device-Risk        client-side verdict. Advisory — it comes from a process the
 *                      attacker controls, so the backend must treat it as a fraud
 *                      *signal* (risk scoring, step-up auth, review queues), never
 *                      as an authorisation decision.
 * X-Device-Attestation platform-signed by Google Play Integrity or Apple App
 *                      Attest, so it cannot be forged from inside a modified
 *                      app. THIS is the one the backend enforces on — until it
 *                      verifies the token and rejects on a bad verdict, the
 *                      header is just cargo. See src/security/attestation.ts.
 *                      Sent only on the high-risk requests in
 *                      attestationPolicy.ts: Play Integrity is quota'd per app
 *                      per day, so attesting everything would exhaust it and
 *                      leave the requests that matter unattested.
 *
 * Both fail open: no verdict and no token still produces a normal request, so a
 * probe failure can never take the app offline.
 *
 * Never applied to third-party hosts — device posture is our fraud signal, and
 * CoinGecko has no business receiving it.
 */
export const applySecurityHeaders = async (config: any) => {
  try {
    config.headers["X-Device-Risk"] = toRiskHeader(getIntegrityReport());
    if (!requiresAttestation(config?.url)) return;
    const { enforcementEnabled } = getAttestationConfig();
    const challenge = enforcementEnabled
      ? await getServerAttestationChallenge(config)
      : null;
    // A supplied nonce is always server-issued. In advisory mode this remains
    // compatible with deployments that have not rolled out the endpoint yet;
    // enforcement mode never permits a client-generated nonce.
    const attestation = await getAttestationToken(challenge?.nonce);
    if (attestation) {
      config.headers["X-Device-Attestation"] = attestation;
    }
    if (challenge) {
      config.headers[ATTESTATION_CHALLENGE_HEADER] = challenge.challengeId;
      config.headers[ATTESTATION_ACTION_HEADER] = requestAction(config);
    }
    if (enforcementEnabled && !attestation) {
      throw createAttestationError(
        "Device attestation is unavailable. Please try again on a supported device."
      );
    }
  } catch {
    // The rollout defaults to advisory mode so existing users keep working.
    // Once the backend challenge endpoint is enabled, missing/invalid
    // attestation is a hard failure — sending the sensitive request would
    // recreate the exact bypass this control exists to prevent.
    if (getAttestationConfig().enforcementEnabled)
      throw createAttestationError(
        "Device attestation is required for this action. Please try again."
      );
  }
};

/**
 * H-11: reads the access token through the single accessor, and distinguishes
 * "there is no session" from "the keychain would not answer just now".
 *
 * The distinction is not academic. Returning null for a transient failure sends
 * the request with no credential, the backend answers 401, and the 401 handler
 * signs the user out — a locked handset would have looked exactly like an
 * expired session.
 */
export const GetTokens = async (): Promise<string | null> => {
  const { status, value } = await readAccessToken();
  if (status === "ok") {
    return value;
  }
  if (isTransientTokenFailure(status)) {
    // Fail the request instead of sending an unauthenticated one. The caller
    // sees a network-style error and can retry; the session is left intact.
    const error: any = new Error("Credentials are temporarily unavailable");
    error.isKeychainUnavailable = true;
    throw error;
  }
  return null;
};

const logApiErrorToSentry = async (error: any, userInfo: any) => {
  const { config, response } = error;

  Sentry.withScope(scope => {
    // 1. Set User
    scope.setUser({ id: userInfo?.userId ?? userInfo?.id ?? 'unknown_user' });

    // 2. Set Tags (for filtering and searching in Sentry)
    // M-02: redactUrl, not config.url. A failed verification carries the OTP in
    // the path, and a Sentry tag is indexed, searchable and retained for months.
    scope.setTag('api_endpoint', redactUrl(config?.url));
    scope.setTag('api_method', config?.method?.toUpperCase() ?? 'unknown');
    scope.setTag('api_status_code', response?.status?.toString() ?? 'no_response');
    scope.setTag('app_name', appName);
    scope.setTag('environment', getCurrentEnvName());

    // 3. Set Extras — allow-list redacted (C-07). Keys survive so the shape of a
    //    failing payload is still diagnosable; values do not.
    scope.setExtra('Request Body', redact(config?.data));
    scope.setExtra('Response Data', redact(response?.data));

    // 4. Add a Breadcrumb for context within the issue timeline
    Sentry.addBreadcrumb({
      category: 'http.error',
      message: `API call to ${redactUrl(config?.url)} failed with status ${response?.status}`,
      level: 'error',
    });

    // 5. Capture the actual exception
    Sentry.captureException(error);
  });
};

const getUserInfo = async (): Promise<string | null> => {
  const raw = await readSecretValue(KEYCHAIN_SERVICES.USER_INFO);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch {
    // Only used to attribute crash reports; a corrupt record is not worth
    // failing a request over.
    return null;
  }
};

export const handleErrorCapture = () => async (error: any) => {
  // H-11: a request abandoned because the keychain was momentarily unreadable
  // never reached the network. It is expected on a locked handset, carries no
  // diagnostic value, and would otherwise flood crash reporting.
  if (error?.isKeychainUnavailable) {
    return Promise.reject(error);
  }
  // M-02: a caller may declare statuses that are an expected answer rather than
  // a fault. The only user is the OTP transport, which probes once per session
  // for the body-based route and reads 404/405/501 as "backend not migrated
  // yet". Reporting that as a crash would put one manufactured error in every
  // session's timeline and train the team to ignore this endpoint's reports.
  // Deliberately narrow: it suppresses the *report*, never the rejection, so
  // the caller still sees the failure and decides what it means.
  const silentStatuses: number[] = Array.isArray(error?.config?.silentStatuses)
    ? error.config.silentStatuses
    : [];
  if (error?.response?.status && silentStatuses.includes(error.response.status)) {
    return Promise.reject(error);
  }
  const { config, response, message } = error;
  const method = config?.method?.toUpperCase();
  // await was missing, so this was a pending Promise and `userInfo.userId` was
  // always undefined — every report was attributed to "unknown" (C-07).
  const userInfo: any = await getUserInfo();

  // --- 1. Log to Firebase Crashlytics ---
  crashlytics().log(`API Error at ${redactUrl(config?.url)}`);
  crashlytics().setUserId(userInfo?.userId ?? "unknown");
  crashlytics().setAttributes({
    // M-02: the raw URL used to be written here. On a mistyped OTP that put the
    // live code into a Crashlytics attribute, which is exportable to BigQuery.
    endpoint: redactUrl(config?.url),
    method: method ?? "unknown",
    status: response?.status?.toString() ?? "no response",
    appName,
    environment: getCurrentEnvName(),
    userId: userInfo?.userId ?? "unknown",
    // C-07: the `token` attribute is gone for good. A live bearer credential has
    // no diagnostic value in a crash report, and anyone with Firebase project
    // access could read it and replay it as the user.
    // Bodies are allow-list redacted rather than serialised whole.
    response: redactToString(response?.data),
    request: redactToString(config?.data),
  });

  // The request and response bodies used to be logged again here, three times
  // over, in plain text. setAttributes above carries the redacted shape; the
  // duplicate log lines added nothing but exposure.
  if (message) {
    crashlytics().log(`Message: ${message}`);
  }

  if (error.stack) {
    crashlytics().log(`Stack Trace: ${error.stack}`);
  }
  await logApiErrorToSentry(error, userInfo);
  crashlytics().recordError(error);
  return Promise.reject(error);
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const normalizePath = (url: string): string => {
  const sanitizedUrl = url.split("#")[0];
  const withoutOrigin = sanitizedUrl.replace(/^https?:\/\/[^/]+\/?/, "");
  return withoutOrigin.replace(/^\/+/, "");
};

const findIdempotencyEntry = (url: string) => {
  const requestPath = normalizePath(url);
  return idempotencyConfig.find((entry) => {
    if (entry.path.includes("{")) {
      const regexPath = entry.path.replace(/{[^}]+}/g, "[^/]+");
      return new RegExp(`^${regexPath}$`, "i").test(requestPath);
    }
    return requestPath === entry.path || requestPath.endsWith(entry.path);
  });
};

const buildIdempotencyKey = (
  userId: string,
  params: string[],
  payload: Record<string, unknown>
) => {
  const parts = [userId];
  params.forEach((key) => {
    const value = payload[key];
    parts.push(
      typeof value === "string" || typeof value === "number" ? String(value) : ""
    );
  });
  return fastHash(parts.join(":"));
};

/**
 * X-Idempotency-Key on the money-moving POSTs listed in ./idempotency.
 *
 * Applied on every instance rather than one, because the paths it protects are
 * not all reachable through the same instance — a retried transfer is a double
 * transfer regardless of which apisauce object issued it.
 */
export const applyIdempotency = (config: any, userId: string) => {
  if ((config?.method || "").toLowerCase() !== "post" || !config?.url) {
    return;
  }
  const entry = findIdempotencyEntry(config.url);
  if (!entry) {
    return;
  }
  const payload = isRecord(config.data) ? config.data : {};
  config.headers["X-Idempotency-Key"] = buildIdempotencyKey(
    String(userId),
    entry.params,
    payload
  );
};

export interface StandardInterceptorOptions {
  /**
   * Content-Type to set on every request. "application/json" for the JSON APIs,
   * "multipart/form-data" for the upload instances.
   */
  contentType?: string;
  /** Attach the resolved client IP from the store. Default true. */
  ipAddress?: boolean;
  /** Attach X-Idempotency-Key on configured money-moving POSTs. Default true. */
  idempotency?: boolean;
}

/**
 * The full stack, for any instance talking to our own backends.
 *
 * Bearer token · client IP · Content-Type · device posture · idempotency, plus
 * the redacted error-capture response interceptor.
 */
export const applyStandardInterceptors = (
  instance: ApisauceInstance,
  options: StandardInterceptorOptions = {}
) => {
  const {
    contentType = "application/json",
    ipAddress = true,
    idempotency = true,
  } = options;

  instance.axiosInstance.interceptors.request.use(async (config: any) => {
    const token = await GetTokens();
    const state: any = store.getState();
    // Only send the header when there is something to send. `Bearer null` reads
    // to the backend as a malformed credential rather than an absent one.
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (ipAddress && state?.UserReducer?.ipInfo) {
      config.headers.ipAddress = `${state?.UserReducer?.ipInfo.ip || ""}`;
    }
    if (contentType) {
      config.headers["Content-Type"] = contentType;
    }
    await applySecurityHeaders(config);
    if (idempotency) {
      applyIdempotency(config, state?.UserReducer?.userInfo?.id || "");
    }
    return config;
  });

  instance.axiosInstance.interceptors.response.use(
    undefined,
    handleErrorCapture()
  );

  return instance;
};

/**
 * For third-party hosts (CoinGecko market data).
 *
 * Deliberately NOT the standard stack. Sending our bearer token to a host we do
 * not control hands out a live session credential, and sending X-Device-Risk
 * hands out a fraud signal. Only the error interceptor applies, so a failing
 * market-data call is still visible in telemetry instead of a silent spinner.
 */
export const applyThirdPartyInterceptors = (instance: ApisauceInstance) => {
  instance.axiosInstance.interceptors.response.use(
    undefined,
    handleErrorCapture()
  );
  return instance;
};
