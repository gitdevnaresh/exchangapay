import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "apisauce";
import '@react-native-firebase/app';
import crashlytics from '@react-native-firebase/crashlytics';
import { getAllEnvData, getAppName } from "../../Environment";
import Keychain from "react-native-keychain";
import * as Sentry from '@sentry/react-native'; // ✅ IMPORT SENTRY
import DeviceInfo from "react-native-device-info";
 
// Get Token and UserId
const GetToken = async () => {
  try {
    const credentials = await Keychain.getGenericPassword({ service: "authTokens" });
    if (credentials) {
      const { accessToken } = JSON.parse(credentials.password);
      return accessToken;
    }
  } catch (e) {
    console.log("GetToken Error:", e);
    // Log to both services if token retrieval fails
    crashlytics().log("Error fetching token from Keychain");
    crashlytics().recordError(e);
    Sentry.captureException(e, { extra: { context: 'GetToken Error' }}); // ✅ Log to Sentry
  }
};
//ip Addresss
const getIPAddress = async () => {
  try {
    const ipAddress = await DeviceInfo.getIpAddress();
    return ipAddress;
  } catch (error) {
    console.log("Error getting IP Address:", error);
  }
}; 


const GetUserId = async () => await AsyncStorage.getItem("UserInfo");
const appName = getAppName();
 
// Get base URLs
const getUrl = (path: string) => {
  const envList = getAllEnvData("[tst]");
  return envList.apiUrls[path];
};
 
const baseURL = getUrl("apiUrl");
 
// Create API instances
const api = create({ baseURL });
const uploadapi = create({ baseURL });
const marketBaseUrl = create({ baseURL: getUrl("marketBaseUrl") });
const cardsApi = create({ baseURL: getUrl("cardsUrl") });
const paymentApi = create({ baseURL: getUrl("paymentsBaseUrl") });
 
// Attach token to requests
const attachAuthToken = async (config: any, isUpload = false) => {
  const token = await GetToken();
  const ip = await getIPAddress();
  config.headers.ipAddress = `${ip || ""}`;
  config.headers.Authorization = appName === "digitalBankW3" ? `${token}` : `Bearer ${token}`;
  config.headers["Content-Type"] = isUpload ? "multipart/form-data" : "application/json";
  return config;
};
 
// Request interceptors
api.axiosInstance.interceptors.request.use(config => attachAuthToken(config));
uploadapi.axiosInstance.interceptors.request.use(config => attachAuthToken(config, true));
cardsApi.axiosInstance.interceptors.request.use(config => attachAuthToken(config));
paymentApi.axiosInstance.interceptors.request.use(config => attachAuthToken(config));
 
 
// ✅ NEW: Sentry Error Logging Function
// This function structures the error report for Sentry with rich context.
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
 
 
// MODIFIED: Error Capture Interceptor for BOTH Firebase and Sentry
const handleErrorCapture = () => async (error: any) => {
  const { config, response, message } = error;
  const method = config?.method?.toUpperCase();
  const userId = await GetUserId();
  const token = await GetToken();
 
  // --- 1. Log to Firebase Crashlytics (Your original code) ---
  crashlytics().log(`API Error at ${config?.url}`);
  crashlytics().setUserId(userId ?? "unknown");
  crashlytics().setAttributes({
    endpoint: config?.url ?? "unknown",
    method: method ?? "unknown",
    status: response?.status?.toString() ?? "no response",
    appName,
    environment:"development",
    response: JSON.stringify(response?.data),
    userId: userId ?? "unknown",
    token: token ?? "unknown",
    request: JSON.stringify(config?.data ?? {}),
  });
 
  if (["POST", "PUT"].includes(method)) {
    crashlytics().log(`Request Body: ${JSON.stringify(config?.data || {})}`);
  }
 
  if (message) crashlytics().log(`Message: ${message}`);
  if (error.stack) crashlytics().log(`Stack: ${error.stack}`);
  crashlytics().recordError(error);
 
 
  // ✅ --- 2. Log to Sentry ---
  await logApiErrorToSentry(error);
 
 
  return Promise.reject(error);
};
 
// Response interceptors - This setup remains the same
api.axiosInstance.interceptors.response.use(undefined, handleErrorCapture());
uploadapi.axiosInstance.interceptors.response.use(undefined, handleErrorCapture());
marketBaseUrl.axiosInstance.interceptors.response.use(undefined, handleErrorCapture());
cardsApi.axiosInstance.interceptors.response.use(undefined, handleErrorCapture());
paymentApi.axiosInstance.interceptors.response.use(undefined, handleErrorCapture());
 
// ✅ Enable Crashlytics logging in development (This is from your original code and is good to keep)
export const initializeCrashlytics = async () => {
  await crashlytics().setCrashlyticsCollectionEnabled(true);
  crashlytics().log("Crashlytics initialized in development mode");
};
 
// Export API methods - This setup remains the same
export const get = (url: string) => api.get(url);
export const post = (url: string, data: any) => api.post(url, data);
export const put = (url: string, data: any) => api.put(url, data);
export const remove = (url: string, data: any) => api.delete(url, data);
 
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