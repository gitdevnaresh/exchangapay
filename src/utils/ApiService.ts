/**
 * The hardened API surface for the cards / upload backends.
 *
 * The interceptor stack itself now lives in ./apiInterceptors so that
 * src/utils/api.tsx runs the identical one (security finding H-01). Nothing
 * about the behaviour of these two instances changed when it moved.
 */

import { create } from "apisauce";
import {
  applyStandardInterceptors,
  getUrl,
} from "./apiInterceptors";

const api = create({
  baseURL: getUrl("cardsUrl"),
});
const uploadapi = create({
  baseURL: getUrl("uploadUrl"),
});
applyStandardInterceptors(api);
// The upload instance never carried the client IP or an idempotency key, and
// multipart bodies must not be labelled application/json.
applyStandardInterceptors(uploadapi, {
  contentType: "multipart/form-data",
  ipAddress: false,
  idempotency: false,
});

// H-08: crash-reporting consent used to live here, governing Crashlytics only,
// while Sentry had no consent step at all. Both channels now read one decision —
// see src/utils/telemetry/consent.ts. The storage key changed from
// "crashReportingConsent" to "telemetryConsent"; nothing had ever written the
// old one, so there is no stored value to migrate.

// The optional `config` argument is an axios request config, passed straight
// through by apisauce. Added for M-02 so the OTP transport can mark its
// capability probe with `silentStatuses`; every existing call site omits it and
// is unaffected.
export const get = async (url: string, params?: any, config?: any) => {
  return api.get(url, params, config);
};

export const post = async (url: string, data: any, config?: any) => {
  return api.post(url, data, config);
};

export const put = async (url: string, data?: any, config?: any) => {
  return api.put(url, data, config);
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
