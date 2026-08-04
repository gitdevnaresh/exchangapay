/**
 * Where an in-app WebView is allowed to navigate, and what counts as a genuine
 * completion callback — security finding H-10.
 *
 * The withdrawal 2FA step loaded a URL that came straight out of an API response
 * into a WebView with no origin restriction, then decided "2FA succeeded" by
 * asking whether the *current* URL contained a certain substring — and posted the
 * user's bearer token to that URL. `https://evil.com/?x=/api/v1/Common/
 * TwoFactorAuthenticationCodeState` satisfied that check.
 *
 * Three separate controls live here, and each one closes the hole on its own:
 *
 *   1. `isAllowedTwoFactorUrl` — nothing is loaded unless its host is one we
 *      configured for this build (the API host, or the Auth0 tenant).
 *   2. `matchTwoFactorCallback` — completion is recognised by parsed host + exact
 *      path, never by substring, so a path or query fragment cannot forge it.
 *   3. It returns only the *query string*. The caller rebuilds the request against
 *      the fixed API client, so no credential is ever sent to a dynamic URL.
 *
 * Hosts come from Environment.js, so a build points at exactly the backend and
 * identity tenant it was configured for — there is no literal environment name in
 * this file (finding C-05).
 */

import { getAllEnvData } from "../../Environment";

export type ParsedHttpsUrl = {
  /** Lower-cased host, without port. */
  host: string;
  /** Port, or "" when the URL carries none. */
  port: string;
  /** Path, always starting with "/". */
  path: string;
  /** Query including the leading "?", or "" when there is none. */
  query: string;
};

/**
 * Deliberately stricter than a URL parser.
 *
 * React Native's built-in `URL` is a set of regexes over the raw string, and it
 * disagrees with WebKit/Chromium on exactly the inputs an attacker reaches for:
 * `https://evil.com\@api.exchangapay.com/` is host `evil.com` to the WebView
 * (the backslash is normalised to a slash) but host `api.exchangapay.com` to
 * `URL.hostname`. Validating with one and loading with the other is how
 * allow-lists get walked past.
 *
 * So the authority here may contain only letters, digits, dots and hyphens. No
 * userinfo, no backslash, no percent-encoding, no whitespace, no unicode — any
 * of those and the URL is rejected outright rather than interpreted. That leaves
 * nothing for the two parsers to disagree about.
 */
const HTTPS_URL =
  /^https:\/\/([A-Za-z0-9.-]+)(?::(\d{1,5}))?(\/[^?#\s]*)?(\?[^#\s]*)?(?:#\S*)?$/;

/** Guards against pathological inputs before the regex ever runs. */
const MAX_URL_LENGTH = 2048;

export const parseHttpsUrl = (raw: unknown): ParsedHttpsUrl | null => {
  if (typeof raw !== "string") return null;

  const candidate = raw.trim();
  if (!candidate || candidate.length > MAX_URL_LENGTH) return null;

  const match = HTTPS_URL.exec(candidate);
  if (!match) return null;

  const host = match[1].toLowerCase();
  // "api.exchangapay.com." and "api..com" are accepted by some resolvers and
  // would not string-compare equal to the configured host.
  if (host.startsWith(".") || host.endsWith(".") || host.includes("..")) {
    return null;
  }

  return {
    host,
    port: match[2] || "",
    path: match[3] || "/",
    query: match[4] || "",
  };
};

/** Host of a configured URL, which may or may not carry a scheme or a path. */
const hostOf = (value: unknown): string => {
  if (typeof value !== "string") return "";
  const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  return parseHttpsUrl(withScheme)?.host || "";
};

const unique = (values: string[]): string[] =>
  values.filter((value, index) => value && values.indexOf(value) === index);

/**
 * Backend hosts for this build. Every entry of `apiUrls` is included so that a
 * new entry in Environment.js cannot silently fall outside the allow-list.
 */
export const getApiHosts = (): string[] => {
  const env: any = getAllEnvData();
  return unique(Object.values(env?.apiUrls || {}).map(hostOf));
};

/**
 * Auth0 asset hosts for the Universal Login page.
 *
 * Sub-resources are not gated by `onShouldStartLoadWithRequest` on Android, but
 * Auth0 does bounce the top-level document through its CDN in some tenant
 * configurations. These are Auth0-owned static-content hosts, not tenants, so
 * they cannot be registered by an attacker the way `evil.us.auth0.com` could —
 * which is why this list is explicit rather than a `*.auth0.com` wildcard.
 */
const AUTH0_CDN_HOSTS = [
  "cdn.auth0.com",
  "cdn.eu.auth0.com",
  "cdn.us.auth0.com",
  "cdn.au.auth0.com",
];

/** Identity-provider hosts for this build: the configured tenant, and its CDN. */
export const getIdentityHosts = (): string[] => {
  const env: any = getAllEnvData();
  return unique([hostOf(env?.oAuthConfig?.issuer), ...AUTH0_CDN_HOSTS]);
};

/** Every host the 2FA WebView may navigate to. */
export const getTwoFactorAllowedHosts = (): string[] =>
  unique([...getApiHosts(), ...getIdentityHosts()]);

/**
 * Origins for the WebView's `originWhitelist` prop. Belt to the
 * `onShouldStartLoadWithRequest` braces — the two controls are independent and
 * either one alone keeps the WebView on our hosts.
 */
export const getTwoFactorAllowedOrigins = (): string[] =>
  getTwoFactorAllowedHosts().map((host) => `https://${host}`);

/** True only for an https URL on a host this build was configured with. */
export const isAllowedTwoFactorUrl = (raw: unknown): boolean => {
  const parsed = parseHttpsUrl(raw);
  return !!parsed && getTwoFactorAllowedHosts().includes(parsed.host);
};

/** The path the backend redirects to once the 2FA challenge is answered. */
export const TWO_FACTOR_STATE_PATH =
  "/api/v1/Common/TwoFactorAuthenticationCodeState";

/**
 * RFC 3986 query characters. The query is forwarded to our own API verbatim so
 * the flow keeps working whatever parameters the backend adds; anything outside
 * this set means the URL is not one our backend produced, so it is refused
 * rather than passed on.
 */
const QUERY_CHARS = /^\?[A-Za-z0-9\-._~%!$&'()*+,;=:@/?]*$/;

/**
 * Recognise the 2FA completion callback.
 *
 * Returns the query string to replay against the fixed API client ("" when the
 * callback carries none), or null when this navigation is not the callback.
 * Never returns anything the caller could mistake for a URL.
 */
export const matchTwoFactorCallback = (raw: unknown): string | null => {
  const parsed = parseHttpsUrl(raw);
  if (!parsed) return null;

  // The callback is served by our backend, not by the identity provider.
  if (!getApiHosts().includes(parsed.host)) return null;

  const path = parsed.path.replace(/\/+$/, "");
  if (path.toLowerCase() !== TWO_FACTOR_STATE_PATH.toLowerCase()) return null;

  if (parsed.query && !QUERY_CHARS.test(parsed.query)) return null;

  return parsed.query;
};
