import { create } from "apisauce";
import { getAllEnvData, getCurrentEnvName } from "../../Environment";
import { redact, redactToString } from "./redact";
import * as Keychain from "react-native-keychain";
import crashlytics from "@react-native-firebase/crashlytics";
import { getApplicationName } from "react-native-device-info";
import store from "../store";
import * as Sentry from "@sentry/react-native";
import idempotencyConfig, { fastHash } from "./idempotency";
import { getAttestationToken, getIntegrityReport, toRiskHeader } from "../security";
const appName = getApplicationName();

/**
 * H-04: carry the device posture to the backend on every request.
 *
 * X-Device-Risk        client-side verdict. Advisory — it comes from a process the
 *                      attacker controls, so the backend must treat it as a fraud
 *                      *signal* (risk scoring, step-up auth, review queues), never
 *                      as an authorisation decision.
 * X-Device-Attestation platform-signed attestation, present only once the native
 *                      module is in place. THIS is the one the backend enforces
 *                      on. See src/security/attestation.ts for the remaining work.
 *
 * Both fail open: no verdict and no token still produces a normal request, so a
 * probe failure can never take the app offline.
 */
const applySecurityHeaders = async (config: any) => {
  try {
    config.headers["X-Device-Risk"] = toRiskHeader(getIntegrityReport());
    const attestation = await getAttestationToken();
    if (attestation) {
      config.headers["X-Device-Attestation"] = attestation;
    }
  } catch {
    // Never let device posture break the request path.
  }
};
const GetTokens = async () => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: "authTokenService",
    });
    if (credentials) {
      const { token } = JSON.parse(credentials.password);
      return token;
    }
    return null;
  } catch (err) {
    return null;
  }
};
const logApiErrorToSentry = async (error: any, userInfo: any) => {
  const { config, response } = error;

  Sentry.withScope(scope => {
    // 1. Set User
    scope.setUser({ id: userInfo?.userId ?? userInfo?.id ?? 'unknown_user' });

    // 2. Set Tags (for filtering and searching in Sentry)
    scope.setTag('api_endpoint', config?.url ?? 'unknown');
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
      message: `API call to ${config?.url} failed with status ${response?.status}`,
      level: 'error',
    });

    // 5. Capture the actual exception
    Sentry.captureException(error);
  });
};

const getUserInfo = async (): Promise<string | null> => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: "userInfoService",
    });
    if (credentials) {
      const userInfo = JSON.parse(credentials.password);
      return userInfo;
    }
    return null;
  } catch (err) {
    return null;
  }
};

const handleErrorCapture = () => async (error: any) => {
  const { config, response, message } = error;
  const method = config?.method?.toUpperCase();
  // await was missing, so this was a pending Promise and `userInfo.userId` was
  // always undefined — every report was attributed to "unknown" (C-07).
  const userInfo: any = await getUserInfo();

  // --- 1. Log to Firebase Crashlytics ---
  crashlytics().log(`API Error at ${config?.url}`);
  crashlytics().setUserId(userInfo?.userId ?? "unknown");
  crashlytics().setAttributes({
    endpoint: config?.url ?? "unknown",
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

const getUrl = (path: string) => {
  // No literal env name: the target is resolved once, in Environment.js. Passing
  // "prod" here while other modules passed "tst" is how the app came to straddle
  // two backends (C-05).
  const envList = getAllEnvData();
  // trim: leading/trailing whitespace makes axios treat the baseURL as a
  // relative path and resolve it against the bundle's file:// document base
  return (envList.apiUrls[path] || "").trim();
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
const api = create({
  baseURL: getUrl("cardsUrl"),
});
const uploadapi = create({
  baseURL: getUrl("uploadUrl"),
});
api.axiosInstance.interceptors.request.use(async (config: any) => {
  const token = await GetTokens();
  const userInfo = store.getState();
  config.headers.Authorization = `Bearer ${token}`;
  if (userInfo?.UserReducer?.ipInfo) {
    config.headers.ipAddress = `${userInfo?.UserReducer?.ipInfo.ip || ""}`;
  }
  config.headers["Content-Type"] = "application/json";
  await applySecurityHeaders(config);
  if ((config?.method || "").toLowerCase() === "post" && config?.url) {
    const entry = findIdempotencyEntry(config.url);
    if (entry) {
      const payload = isRecord(config.data) ? config.data : {};
      const userId =
        userInfo?.UserReducer?.userInfo?.id ||
        "";
      config.headers["X-Idempotency-Key"] = buildIdempotencyKey(
        String(userId),
        entry.params,
        payload
      );
    }
  }
  return config;
});
uploadapi.axiosInstance.interceptors.request.use(async (config: any) => {
  const token = await GetTokens();
  config.headers.Authorization = `Bearer ${token}`;
  config.headers["Content-Type"] = "multipart/form-data";
  await applySecurityHeaders(config);
  return config;
});

// Response interceptors - This setup remains the same
api.axiosInstance.interceptors.response.use(undefined, handleErrorCapture());
uploadapi.axiosInstance.interceptors.response.use(
  undefined,
  handleErrorCapture()
);

// H-08: crash-reporting consent used to live here, governing Crashlytics only,
// while Sentry had no consent step at all. Both channels now read one decision —
// see src/utils/telemetry/consent.ts. The storage key changed from
// "crashReportingConsent" to "telemetryConsent"; nothing had ever written the
// old one, so there is no stored value to migrate.

export const get = async (url: string) => {
  return api.get(url);
};

export const post = async (url: string, data: any) => {
  return api.post(url, data);
};

export const put = async (url: string, data?: any) => {
  return api.put(url, data);
};

export const remove = (url: string, data: any) => {
  return api.delete(url, {}, { data });
};
export const fileget = async (url: string) => {
  return uploadapi.get(url);
};

export const filepost = async (url: string, data: any) => {
  return uploadapi.post(url, data);
};

export const fileput = async (url: string, data: any) => {
  return uploadapi.put(url, data);
};

export const fileremove = (url: string, data: any) => {
  return uploadapi.delete(url, data);
};
