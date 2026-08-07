/**
 * One HTTP stack for the third-party hosts we talk to directly.
 *
 * P-03 flagged `apisauce` and `axios` as overlapping dependencies. They are not
 * two bundles — apisauce *is* a wrapper over axios and pulls in the same single
 * copy — but three modules did reach past the configured apisauce clients and
 * call `axios` straight, so those requests carried none of the interceptor
 * stack the rest of the app runs on: a failed webhook or chat call disappeared
 * instead of reaching Sentry/Crashlytics.
 *
 * These clients are built with apisauce so `applyThirdPartyInterceptors` can be
 * attached (error capture only — a third party gets neither our session
 * credential nor our fraud signal, same rule as `marketApi` in ./api.tsx).
 * Callers get the underlying `axiosInstance` methods, which is the very object
 * apisauce itself drives, so request and error behaviour — including throwing
 * on a non-2xx — is unchanged from the direct `axios.post` calls these replaced.
 *
 * Construction is lazy and memoised: ./apiInterceptors reaches the redux store,
 * whose reducers pull in the service modules that import this file. Building an
 * instance at module scope closed that cycle and left
 * `applyThirdPartyInterceptors` undefined for whichever module happened to
 * evaluate first.
 */

import { create } from "apisauce";
import type { AxiosInstance, AxiosRequestConfig } from "axios";
import { applyThirdPartyInterceptors } from "./apiInterceptors";

// Make.com automation endpoint used by the profile / onboarding webhooks.
const WEBHOOK_BASE_URL = "https://hook.eu2.make.com";
// Kommo support chat. Requests are HMAC-signed by the caller and pass absolute
// URLs, which axios honours over the baseURL.
const KOMMO_BASE_URL = "https://amojo.kommo.com";

const clients = new Map<string, AxiosInstance>();

const clientFor = (baseURL: string): AxiosInstance => {
  const existing = clients.get(baseURL);
  if (existing) {
    return existing;
  }
  const instance = applyThirdPartyInterceptors(create({ baseURL }))
    .axiosInstance as AxiosInstance;
  clients.set(baseURL, instance);
  return instance;
};

const lazyClient = (baseURL: string) => ({
  get: (url: string, config?: AxiosRequestConfig) =>
    clientFor(baseURL).get(url, config),
  post: (url: string, data?: any, config?: AxiosRequestConfig) =>
    clientFor(baseURL).post(url, data, config),
  put: (url: string, data?: any, config?: AxiosRequestConfig) =>
    clientFor(baseURL).put(url, data, config),
});

export const webhookHttp = lazyClient(WEBHOOK_BASE_URL);

export const kommoHttp = lazyClient(KOMMO_BASE_URL);
