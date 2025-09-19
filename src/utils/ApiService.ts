import { create } from "apisauce";
import { getAllEnvData } from "../../Environment";
import * as Keychain from "react-native-keychain";
import crashlytics from "@react-native-firebase/crashlytics";
import { getApplicationName } from "react-native-device-info";
import store from "../store";
import { isSessionExpired } from "../redux/Actions/UserActions";

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
