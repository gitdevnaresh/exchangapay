import { create } from "apisauce";
import { getAllEnvData } from "../../Environment";
import * as Keychain from "react-native-keychain";
import crashlytics from "@react-native-firebase/crashlytics";
import { getApplicationName } from "react-native-device-info";
import store from "../store";
import * as Sentry from "@sentry/react-native";
const appName = getApplicationName();
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
const logApiErrorToSentry = async (error: any) => {
  const { config, response } = error;
  const userInfo: any = getUserInfo();

  Sentry.withScope(scope => {
    // 1. Set User
    scope.setUser({ id: userInfo?.id ?? 'unknown_user' });

    // 2. Set Tags (for filtering and searching in Sentry)
    scope.setTag('api_endpoint', config?.url ?? 'unknown');
    scope.setTag('api_method', config?.method?.toUpperCase() ?? 'unknown');
    scope.setTag('api_status_code', response?.status?.toString() ?? 'no_response');
    scope.setTag('app_name', appName);
    scope.setTag('environment', "development");

    // 3. Set Extras (for additional data, not searchable but visible in the issue)
    scope.setExtra('Request Body', config?.data);
    scope.setExtra('Response Data', response?.data);

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
  const userInfo: any = getUserInfo();
  const token = await GetTokens();
  // --- 1. Log to Firebase Crashlytics (Your original code) ---
  crashlytics().log(`API Error at ${config?.url}`);
  crashlytics().setUserId(userInfo.userId ?? "unknown");
  crashlytics().setAttributes({
    endpoint: config?.url ?? "unknown",
    method: method ?? "unknown",
    status: response?.status?.toString() ?? "no response",
    appName,
    environment: "development",
    response: JSON.stringify(response?.data),
    userId: userInfo.userId ?? "unknown",
    token: token ?? "unknown",
    request: JSON.stringify(config?.data ?? {}),
  });

  if (["POST", "PUT"].includes(method)) {
    crashlytics().log(`Request Body: ${JSON.stringify(config?.data || {})}`);
  }

  if (config?.data) {
    crashlytics().log(`Request Body: ${JSON.stringify(config.data)}`);
  }

  if (response?.data) {
    crashlytics().log(`Response Body: ${JSON.stringify(response.data)}`);
  }

  if (message) {
    crashlytics().log(`Message: ${message}`);
  }

  if (error.stack) {
    crashlytics().log(`Stack Trace: ${error.stack}`);
  }
  logApiErrorToSentry(error);
  crashlytics().recordError(error);
  return Promise.reject(error);
};

const getUrl = (path: string) => {
  const envList = getAllEnvData("prod");
  return envList.apiUrls[path];
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
  return config;
});
uploadapi.axiosInstance.interceptors.request.use(async (config: any) => {
  const token = await GetTokens();
  config.headers.Authorization = `Bearer ${token}`;
  config.headers["Content-Type"] = "multipart/form-data";
  return config;
});

// Response interceptors - This setup remains the same
api.axiosInstance.interceptors.response.use(undefined, handleErrorCapture());
uploadapi.axiosInstance.interceptors.response.use(
  undefined,
  handleErrorCapture()
);

export const initializeCrashlytics = async () => {
  await crashlytics().setCrashlyticsCollectionEnabled(true);
  crashlytics().log("Crashlytics initialized in development mode");
};

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
