/**
 * Telemetry redaction — security finding C-07.
 *
 * API request and response bodies were being serialised wholesale into Firebase
 * Crashlytics attributes and Sentry extras. Crash-report fields are not secret
 * storage: they are readable by every project member and exportable to BigQuery.
 * For this app the bodies carry card numbers, CVVs, PINs, wallet addresses, KYC
 * payloads and encrypted passwords — card data in particular makes whole-body
 * logging a PCI-DSS violation, not merely a privacy problem.
 *
 * The model here is ALLOW-LIST, not deny-list. A deny-list of sensitive key names
 * fails silently the first time the backend adds a field nobody thought of, and
 * that failure is invisible until it shows up in an audit. So: every value is
 * replaced with "[REDACTED]" unless its key is explicitly known to be safe.
 *
 * Keys are preserved even when values are redacted. That is deliberate — knowing
 * a failing response contained `cardNumber` and `errorCode` is most of the
 * diagnostic value, and the shape alone leaks nothing.
 */

export const REDACTED = "[REDACTED]";

/**
 * Keys whose values may be sent to telemetry. Deliberately tiny.
 *
 * Before adding to this list, ask whether the field could EVER carry customer
 * data on any endpoint — `message` and `description` are the usual traps, since
 * backends happily interpolate account details into human-readable text.
 */
export const SAFE_KEYS = new Set([
  "traceId",
  "correlationId",
  "requestId",
  "errorCode",
  "statusCode",
  "httpStatus",
  "status",
  "code",
]);

/**
 * Belt-and-braces: even a key on the allow-list is redacted if its name looks
 * sensitive. Guards against someone widening SAFE_KEYS carelessly later.
 */
export const SENSITIVE_KEY =
  /pass|pin|cvv|cvc|card|token|secret|otp|ssn|dob|address|phone|email|name|auth|key|credential|iban|wallet|balance|amount|expiry|cred|jwt|bearer/i;

/**
 * Path segments after which the rest of the URL is a one-time secret (M-02).
 *
 * The finding is that verification codes travel in the request line. Half of
 * that exposure is the backend's access log and needs a backend change; the
 * other half is ours and does not: `config.url` was written verbatim into
 * Crashlytics attributes and a Sentry tag on every failed request, so a
 * mistyped OTP put the real code into crash reporting — which is exactly the
 * "readable by every project member, exportable to BigQuery" store C-07 exists
 * to keep secrets out of. `redactUrl` below closes that half unilaterally.
 *
 * The rule is structural rather than a list of known routes. A list is a
 * deny-list by another name: it is correct only until someone adds
 * `api/v1/Security/ConfirmEmailCode/{code}` and does not think to update it.
 * Matching on the *route noun* means a new verification endpoint is covered the
 * day it is written, without anyone remembering anything.
 *
 * The cost is over-redaction — `Master/SendOTP/{type}` loses `{type}` — which
 * is the right direction to be wrong in for a crash report.
 */
const SECRET_ROUTE_MARKER =
  /verif|otp|authenticat|confirm|activate|reset|recover|challenge/i;

/** Query-parameter names whose values must never reach telemetry. */
const SECRET_PARAM = /code|nonce|challenge/i;

/** Objects nested deeper than this are dropped entirely rather than walked. */
const MAX_DEPTH = 4;

/** Arrays are truncated, so one huge response cannot flood the crash report. */
const MAX_ARRAY_ITEMS = 10;

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/**
 * Recursively redact a value for telemetry.
 *
 * Primitives at the top level return "[REDACTED]": a bare string reaching this
 * function has no key to vet it against, so it cannot be shown to be safe.
 */
export const redact = (value: unknown, depth = 0): unknown => {
  if (value === null || value === undefined) return value;
  if (depth >= MAX_DEPTH) return REDACTED;

  if (Array.isArray(value)) {
    const items = value.slice(0, MAX_ARRAY_ITEMS).map((v) => redact(v, depth + 1));
    return value.length > MAX_ARRAY_ITEMS
      ? [...items, `[+${value.length - MAX_ARRAY_ITEMS} more]`]
      : items;
  }

  if (!isPlainObject(value)) return REDACTED;

  const out: Record<string, unknown> = {};
  for (const [key, v] of Object.entries(value)) {
    if (!SAFE_KEYS.has(key) || SENSITIVE_KEY.test(key)) {
      out[key] = REDACTED;
      continue;
    }
    out[key] = isPlainObject(v) || Array.isArray(v) ? redact(v, depth + 1) : v;
  }
  return out;
};

/**
 * Strip one-time secrets out of a request URL before it reaches telemetry (M-02).
 *
 *   api/v1/Security/PhoneVerification/482913
 *     -> api/v1/Security/PhoneVerification/[REDACTED]
 *   api/v1/Security/VerifyGoogleAuthenticator/135790?resend=true
 *     -> api/v1/Security/VerifyGoogleAuthenticator/[REDACTED]?resend=true
 *
 * The endpoint identity survives, so the report still says which call failed —
 * that is the whole diagnostic value. Only the secret is removed.
 *
 * Never throws. A telemetry helper that can throw turns a failed request into a
 * crashed request.
 */
export const redactUrl = (url: unknown): string => {
  if (typeof url !== "string" || !url) return "unknown";
  try {
    const queryStart = url.indexOf("?");
    const path = queryStart === -1 ? url : url.slice(0, queryStart);
    const query = queryStart === -1 ? null : url.slice(queryStart + 1);

    let inSecret = false;
    const safePath = path
      .split("/")
      .map((segment) => {
        if (inSecret && segment) return REDACTED;
        if (SECRET_ROUTE_MARKER.test(segment)) inSecret = true;
        return segment;
      })
      .join("/");

    if (query === null) return safePath;

    const safeQuery = query
      .split("&")
      .map((pair) => {
        const eq = pair.indexOf("=");
        if (eq < 0) return pair;
        const key = pair.slice(0, eq);
        return SENSITIVE_KEY.test(key) || SECRET_PARAM.test(key)
          ? `${key}=${REDACTED}`
          : pair;
      })
      .join("&");

    return `${safePath}?${safeQuery}`;
  } catch {
    return REDACTED;
  }
};

/**
 * Redact and serialise. Crashlytics attribute values must be strings.
 * Never throws: telemetry must not be able to break the request path.
 */
export const redactToString = (value: unknown): string => {
  try {
    return JSON.stringify(redact(value)) ?? REDACTED;
  } catch {
    return REDACTED;
  }
};
