/**
 * The one place auth tokens are written and read — security finding H-11.
 *
 * ===========================================================================
 * WHY THE REFRESH TOKEN LIVES SEPARATELY
 * ===========================================================================
 * Both tokens used to sit in a single JSON blob under "authTokenService", so
 * every access-token read — one per API call — also handed the caller the
 * refresh token. They have very different risk profiles: an access token
 * expires in minutes, a refresh token mints new ones indefinitely and survives
 * a password change unless the backend revokes it.
 *
 * Splitting them means the frequently-read entry no longer carries the
 * long-lived credential, and the long-lived one can take a stricter
 * accessibility class (WHEN_UNLOCKED_THIS_DEVICE_ONLY) than the app could
 * tolerate on the entry it reads on every request. See REFRESH_TOKEN_WRITE_OPTIONS
 * in keychainPolicy.ts for the biometric question.
 *
 * ===========================================================================
 * MIGRATION
 * ===========================================================================
 * Installs upgrading from a build that wrote the combined blob still have their
 * refresh token inside "authTokenService". readRefreshToken() falls back to it
 * and moves it across on first use, so an upgrade does not sign everyone out.
 * The legacy field is stripped from the auth entry at the same time.
 */

import { jwtDecode } from "jwt-decode";
import { log } from "../logger";
import {
  KEYCHAIN_SERVICES,
  readSecret,
  REFRESH_TOKEN_WRITE_OPTIONS,
  resetSecret,
  writeSecret,
  type SecureReadStatus,
} from "./keychainPolicy";

/** What "authTokenService" holds. `refresh_token` is legacy — see the header. */
type AuthRecord = {
  token?: string;
  expiryTime?: number | string;
  /** @deprecated pre-H-11 layout; migrated away on first read. */
  refresh_token?: string;
};

export type TokenRead<T> = {
  status: SecureReadStatus;
  value: T | null;
};

/**
 * True when a read failed for a reason that says nothing about whether the user
 * is signed in — a locked device, a dismissed prompt, an unclassifiable native
 * error. Callers must not sign the user out on these.
 */
export const isTransientTokenFailure = (status: SecureReadStatus): boolean =>
  status === "locked" || status === "cancelled" || status === "error";

const parseAuthRecord = (raw: string | null): AuthRecord | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as AuthRecord) : null;
  } catch {
    // A corrupt entry is not a session. Treated as empty by the callers below.
    return null;
  }
};

const readAuthRecord = async (): Promise<TokenRead<AuthRecord>> => {
  const result = await readSecret(KEYCHAIN_SERVICES.AUTH_TOKEN);
  if (result.status !== "ok") {
    return { status: result.status, value: null };
  }
  return { status: "ok", value: parseAuthRecord(result.value) };
};

const writeAuthRecord = async (record: AuthRecord): Promise<void> => {
  await writeSecret(
    KEYCHAIN_SERVICES.AUTH_TOKEN,
    "authToken",
    JSON.stringify(record)
  );
};

/**
 * Store a freshly issued token pair.
 *
 * `expiryTime` is derived here rather than trusted from the caller — it is the
 * value the refresh scheduler runs on. A token that will not decode is not
 * stored at all: writing one would leave the app holding a credential it can
 * never schedule a refresh for.
 */
export const storeAuthTokens = async (
  accessToken: string,
  refreshToken?: string | null
): Promise<void> => {
  const decoded: any = jwtDecode(accessToken);
  const expiryTime = decoded.exp * 1000;

  await writeAuthRecord({ token: accessToken, expiryTime });

  // An absent refresh token must not wipe a good one: Auth0 only returns a new
  // refresh token when rotation is enabled, and callers pass through whatever
  // they were given.
  if (refreshToken) {
    await writeSecret(
      KEYCHAIN_SERVICES.REFRESH_TOKEN,
      "refreshToken",
      refreshToken,
      REFRESH_TOKEN_WRITE_OPTIONS
    );
  }
};

/** The access token, with the reason when there isn't one. */
export const readAccessToken = async (): Promise<TokenRead<string>> => {
  const { status, value } = await readAuthRecord();
  return { status, value: value?.token || null };
};

/** Access-token expiry in seconds since the epoch, as `exp` is defined. */
export const readAccessTokenExpiry = async (): Promise<TokenRead<number>> => {
  const { status, value } = await readAuthRecord();
  if (status !== "ok" || !value?.token) {
    return { status, value: null };
  }
  try {
    const decoded: any = jwtDecode(value.token);
    return { status: "ok", value: decoded?.exp ?? null };
  } catch {
    return { status: "empty", value: null };
  }
};

/**
 * The refresh token, migrating it out of the legacy combined entry if that is
 * where it still lives.
 */
export const readRefreshToken = async (): Promise<TokenRead<string>> => {
  const current = await readSecret(KEYCHAIN_SERVICES.REFRESH_TOKEN);
  if (current.status === "ok" && current.value) {
    return { status: "ok", value: current.value };
  }
  // Anything other than "no entry here" is a live failure, not an invitation to
  // fall back — a locked device would otherwise silently re-migrate every time.
  if (current.status !== "empty") {
    return { status: current.status, value: null };
  }

  const legacy = await readAuthRecord();
  if (legacy.status !== "ok") {
    return { status: legacy.status, value: null };
  }
  const legacyToken = legacy.value?.refresh_token;
  if (!legacyToken) {
    return { status: "empty", value: null };
  }

  try {
    await writeSecret(
      KEYCHAIN_SERVICES.REFRESH_TOKEN,
      "refreshToken",
      legacyToken,
      REFRESH_TOKEN_WRITE_OPTIONS
    );
    // Only strip the legacy copy once the new entry is safely written.
    const { refresh_token, ...rest } = legacy.value as AuthRecord;
    await writeAuthRecord(rest);
    log.info("[auth] refresh token migrated to its own keychain entry");
  } catch (error) {
    // The token is still readable where it is; try again next refresh.
    log.warn("[auth] refresh token migration deferred");
  }

  return { status: "ok", value: legacyToken };
};

/** Drop both token entries. Used by the sign-out paths. */
export const clearAuthTokens = async (): Promise<void> => {
  await resetSecret(KEYCHAIN_SERVICES.AUTH_TOKEN);
  await resetSecret(KEYCHAIN_SERVICES.REFRESH_TOKEN);
};
