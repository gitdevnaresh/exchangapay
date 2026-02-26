import { SecureStorage } from '../utils/secureStorage';
import { create } from "apisauce";
import '@react-native-firebase/app';
import crashlytics, { log } from '@react-native-firebase/crashlytics';
import { getAllEnvData, getAppName } from "../../Environment";
import Keychain from "react-native-keychain";
import * as Sentry from "@sentry/react-native";
import DeviceInfo from "react-native-device-info";
import perf from "@react-native-firebase/perf";
import idempotencyConfig, { fastHash } from "../utils/idempotencyConfig";
import { logEvent } from "../hooks/loggingHook";
import { Logger, sanitizeData } from "../utils/Logger";

// Get Token and UserId
const GetToken = async () => {
  try {
    const credentilas = await Keychain.getGenericPassword({ service: "authTokens" });
    if (credentilas) {
      const { accessToken } = JSON.parse(credentilas.password);
      return accessToken;
    }
    // No credentials found - this is a critical security state
    // throw new Error("AUTH_TOKEN_NOT_FOUND");
  } catch (e) {
    Logger.error("Error fetching token from Keychain", {
      originalError: e.message,
      context: "TOKEN_RETRIEVAL"
    });
    crashlytics().log("Error fetching token from Keychain");
    crashlytics().recordError(e);

    // Throw error to halt execution (fail-closed)
    // throw new Error("SECURE_SESSION_FAILED");
  }
};

//ip Addresss
const getIPAddress = async () => {
  try {
    const ipAddress = await DeviceInfo.getIpAddress();
    if (!ipAddress) {
      // throw new Error("IP_ADDRESS_NOT_AVAILABLE");
    }
    return ipAddress;
  } catch (error) {
    Logger.error("Error getting IP Address", {
      originalError: error.message,
      context: "IP_RETRIEVAL"
    });

    // Throw error to halt execution (fail-closed)
    // throw new Error("NETWORK_SECURITY_FAILED");
  }
};
const logApiErrorToSentry = async (error: any) => {
  const { config, response } = error;
  const userId = await GetUserId();

  Sentry.withScope(scope => {
    // 1. Set User
    scope.setUser({ id: userId ?? 'unknown_user' });

    // 2. Set Tags (for filtering and searching in Sentry)
    scope.setTag('api_endpoint', config?.url ?? 'unknown');
    scope.setTag('api_method', config?.method?.toUpperCase() ?? 'unknown');
    scope.setTag('api_status_code', response?.status?.toString() ?? 'no_response');
    scope.setTag('app_name', appName);
    scope.setTag('environment', "development");

    // 3. Set Extras (SANITIZED data only)
    scope.setExtra('Request Body', sanitizeData(config?.data));
    scope.setExtra('Response Data', sanitizeData(response?.data));

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

const GetUserId = async () => await SecureStorage.getSecureItem("UserInfo");
const appName = getAppName();
// Get base URLs
const getUrl = (path: string) => {
  const envList = getAllEnvData();
  return envList.apiUrls[path];
};
const baseURL = getUrl("apiUrl");

// Create APIs
const api = create({ baseURL });
const uploadapi = create({ baseURL });
const marketBaseUrl = create({ baseURL: getUrl("marketBaseUrl") });
const cardsApi = create({ baseURL: getUrl("cardsUrl") });
const paymentApi = create({ baseURL: getUrl("paymentsBaseUrl") });
const bankBaseUrl = getUrl("bankApiUrl");
export const bankApi = create({ baseURL: bankBaseUrl });
const rewardsApi = create({ baseURL: getUrl("rewards") });
const exchangeApi = create({ baseURL: getUrl("exchangeApiUrl") });

const currentApiVersion = "api/v1/";

const findIdempotencyEntry = (url: string) => {
  if (!url) return null;
  return idempotencyConfig.find((entry) => {
    if (entry.path.includes("{")) {
      const regexPath = entry.path.replace(/{[^}]+}/g, "[^/]+");
      return new RegExp(regexPath + "$").test(url);
    }
    return url.endsWith(entry.path) || url === entry.path;
  });
};

const buildIdempotencyKey = (userId: string, params: string[], payload: any) => {
  const parts = [userId];
  params.forEach((key) => {
    parts.push(payload?.[key] ?? "");
  });
  return fastHash(parts.join(":"));
};

const getDeviceId = async () => {
  try {
    return await DeviceInfo.getUniqueId();
  } catch (e) {
    return "";
  }
};

// Add token to requests
const attachAuthToken = async (config: any, isUpload = false) => {
  const token = await GetToken();
  const ip = await getIPAddress();
  config.headers.ipAddress = `${ip || ""}`;
  config.headers.Authorization = appName === "digitalBankW3" ? `${token}` : `Bearer ${token}`;
  config.headers["Content-Type"] = isUpload ? "multipart/form-data" : "application/json";
  // Idempotency logic for POST requests
  if (config.method === "post") {
    const entry = findIdempotencyEntry(config.url);
    if (entry) {
      const userId = await GetUserId();
      const idempotencyKey = buildIdempotencyKey(userId || "", entry.params, config.data);
      const deviceId = await getDeviceId();
      config.headers["X-Idempotency-Key"] = idempotencyKey;
      if (typeof config.data === "object" && config.data !== null) {
        config.data = { ...config.data, deviceId };
      }
      logEvent("Idempotency", {
        endpoint: config.url,
        method: config.method?.toUpperCase() || 'unknown',
        data: JSON.stringify(config.data),
      });
    }
  } else {
    logEvent("Idempotency", {
      endpoint: config.url,
      method: config.method?.toUpperCase() || 'unknown',
      appName: appName,
    });
  }
  return config;
};

api.axiosInstance.interceptors.request.use(config => attachAuthToken(config));
uploadapi.axiosInstance.interceptors.request.use(config => attachAuthToken(config, true));
cardsApi.axiosInstance.interceptors.request.use(config => attachAuthToken(config));
paymentApi.axiosInstance.interceptors.request.use(config => attachAuthToken(config));
bankApi.axiosInstance.interceptors.request.use(config => attachAuthToken(config));
rewardsApi.axiosInstance.interceptors.request.use(config => attachAuthToken(config));
exchangeApi.axiosInstance.interceptors.request.use(config => attachAuthToken(config));
// Error logging
const handleErrorCapture = () => async (error: any) => {
  const { config, response, message } = error;
  const method = config?.method?.toUpperCase();
  const userId = await GetUserId();
  const token = await GetToken();
  // Handle 401 token expiry

  crashlytics().log(`API Error at ${config?.url}`);
  crashlytics().setUserId(userId || "unknown");
  crashlytics().setAttributes({
    endpoint: config?.url || "unknown",
    method: method || "unknown",
    status: response?.status?.toString() || "no response",
    appName,
    userId: userId || "unknown",
    token: token?.password || "unknown",

  });

  if (["POST", "PUT"].includes(method)) {
    crashlytics().log(`Request Body: ${JSON.stringify(config?.data || {})}`);
  }

  if (message) crashlytics().log(`Message: ${message}`);
  if (error.stack) crashlytics().log(`Stack: ${error.stack}`);
  crashlytics().recordError(error);
  await logApiErrorToSentry(error);

  return Promise.reject(error);

};
const addFirebaseNetworkTrace = (axiosInstance: any) => {
  axiosInstance.interceptors.request.use(async (config: any) => {
    try {
      const metric = await perf().newHttpMetric(
        config.baseURL + config.url,
        config.method?.toUpperCase(),
      );
      config.__firebaseMetric = metric;
      await metric.start();
    } catch (e) {
      Logger.warn("Firebase Perf start error", e);
    }
    return config;
  });

  axiosInstance.interceptors.response.use(
    async (response: any) => {
      try {
        const metric = response.config.__firebaseMetric;
        if (metric) {
          metric.setHttpResponseCode(response.status);
          await metric.stop();
        }
      } catch (e) {
        Logger.warn("Firebase Perf stop error", e);
      }
      return response;
    },
    async (error: any) => {
      try {
        const metric = error.config?.__firebaseMetric;
        if (metric) {
          metric.setHttpResponseCode(error.response?.status || 0);
          await metric.stop();
        }
      } catch (e) {
        Logger.warn("Firebase Perf error stop error", e);
      }
      return Promise.reject(error);
    }
  );
};

// Apply Firebase network tracing
addFirebaseNetworkTrace(api.axiosInstance);
addFirebaseNetworkTrace(uploadapi.axiosInstance);
addFirebaseNetworkTrace(marketBaseUrl.axiosInstance);
addFirebaseNetworkTrace(cardsApi.axiosInstance);
addFirebaseNetworkTrace(paymentApi.axiosInstance);
addFirebaseNetworkTrace(bankApi.axiosInstance);
addFirebaseNetworkTrace(rewardsApi.axiosInstance);
addFirebaseNetworkTrace(exchangeApi.axiosInstance);

api.axiosInstance.interceptors.response.use(undefined, handleErrorCapture());
uploadapi.axiosInstance.interceptors.response.use(undefined, handleErrorCapture());
marketBaseUrl.axiosInstance.interceptors.response.use(undefined, handleErrorCapture());
cardsApi.axiosInstance.interceptors.response.use(undefined, handleErrorCapture());
paymentApi.axiosInstance.interceptors.response.use(undefined, handleErrorCapture());
bankApi.axiosInstance.interceptors.response.use(undefined, handleErrorCapture());
rewardsApi.axiosInstance.interceptors.response.use(undefined, handleErrorCapture());
exchangeApi.axiosInstance.interceptors.response.use(undefined, handleErrorCapture());
// Export API methods
export const get = (url: string) => api.get(url);
export const post = (url: string, data: any) => api.post(url, data);
export const put = (url: string, data: any) => api.put(url, data);
export const remove = (url: string, data: any) => api.delete(url, { data });

export const fileget = (url: string) => uploadapi.get(url);
export const filepost = (url: string, data: any) => uploadapi.post(url, data);
export const fileput = (url: string, data: any) => uploadapi.put(url, data);
export const fileremove = (url: string, data: any) => uploadapi.delete(url, data);

export const cardsGet = (url: string) => cardsApi.get(url);
export const cardsPost = (url: string, data: any) => cardsApi.post(url, data);
export const cardsPut = (url: string, data: any) => cardsApi.put(url, data);
export const marketsget = (url: string) => marketBaseUrl.get(url);

export const paymentGet = (url: string) => paymentApi.get(url);
export const paymentPost = (url: string, data: any) => paymentApi.post(url, data);
export const paymentPut = (url: string, data: any) => paymentApi.put(url, data);

export const bankget = (url: string) => bankApi.get(url);
export const bankpost = (url: string, data: any) => bankApi.post(url, data);
export const bankput = (url: string, data: any) => bankApi.put(url, data);
export const bankremove = (url: string, data: any) => bankApi.delete(url, data);

export const rewardsget = (url: string) => rewardsApi.get(url);
export const rewardspost = (url: string, data: any) => rewardsApi.post(url, data);
export const rewardsput = (url: string, data: any) => rewardsApi.put(url, data);
export const rewardsremove = (url: string, data: any) => rewardsApi.delete(url, data);

export const exchangeget = (url: string) => exchangeApi.get(url);
export const exchangepost = (url: string, data: any) => exchangeApi.post(url, data);
export const exchangeput = (url: string, data: any) => exchangeApi.put(url, data);
export const exchangeremove = (url: string, data: any) => exchangeApi.delete(url, data);
