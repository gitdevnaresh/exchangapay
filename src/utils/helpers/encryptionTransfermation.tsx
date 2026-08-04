/**
 * redux-persist transform for saved app state (security finding H-05).
 *
 * Two layers, in this order, because they defend against different things:
 *
 *   1. STRIP  — secrets are removed before anything is written. This is the one
 *               that actually matters. An attacker who dumps the Keychain gets
 *               the state blob and the key protecting it in the same sweep, so
 *               the only reliable protection for a credential is not to have
 *               written it down.
 *   2. ENCRYPT — AES-GCM under a device-bound key that has nothing to do with
 *               the user's data (see persistKey.ts). Raises the bar against
 *               backup scraping and partial extraction, and means the blob is
 *               tamper-evident rather than merely unreadable.
 *
 * BOTH CALLBACKS ARE SYNCHRONOUS, AND MUST STAY THAT WAY. redux-persist applies
 * transforms with `transforms.reduce(...)` followed by `JSON.stringify`, so an
 * `async` callback returns a Promise, serialises to `{}`, and rehydrates as a
 * Promise object instead of state. The previous version of this file was async;
 * that is what broke persistence and got the whole transform commented out in
 * the store. If you need something asynchronous here, load it at startup and
 * read it from memory — that is exactly what getPersistKey() is for.
 */

// Package root, not "redux-persist/es/createTransform": the deep ESM path is
// untransformed in Jest, so importing it makes this module untestable.
import { createTransform } from "redux-persist";
import { decryptAny, encryptGCM } from "../crypto/aes";
import { getPersistKey } from "../crypto/persistKey";

/**
 * Fields that must never reach durable storage, per persisted slice.
 *
 * `sk` is the field-level encryption key for all of the user's personal data.
 * Persisting it next to the data it protects makes that encryption decorative,
 * which is the core of the finding. It is re-fetched with the member record on
 * every launch, so nothing depends on it surviving a restart.
 */
const SECRET_FIELDS = ["sk", "accessToken", "refreshToken", "idToken", "token"];

const stripSecrets = (value: any): any => {
  if (!value || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(stripSecrets);

  const out: Record<string, any> = {};
  for (const key of Object.keys(value)) {
    if (SECRET_FIELDS.includes(key)) continue;
    out[key] = stripSecrets(value[key]);
  }
  return out;
};

/**
 * Slice-level narrowing on top of the field-level strip.
 *
 * `personalInfo` is a full PII record (name, address, date of birth) that every
 * screen using it re-fetches anyway, so it buys nothing at rest and costs a lot
 * if extracted.
 */
const narrow = (state: any, key: string): any => {
  if (key === "UserReducer") {
    const { personalInfo, ...rest } = state || {};
    return rest;
  }
  return state;
};

const encryptTransform = createTransform(
  // INBOUND: Redux -> storage
  (inboundState: any, key) => {
    const stripped = stripSecrets(narrow(inboundState, key as string));
    const persistKey = getPersistKey();

    if (!persistKey) {
      // No key means bootstrap has not run. Returning `undefined` tells
      // redux-persist to skip this slice entirely. The one thing we must never
      // do here is fall back to writing plaintext — the old code did exactly
      // that on error, which is how an encryption layer ends up not encrypting.
      return undefined;
    }

    try {
      return encryptGCM(JSON.stringify(stripped), persistKey);
    } catch {
      return undefined;
    }
  },

  // OUTBOUND: storage -> Redux
  (outboundState: any, key) => {
    const persistKey = getPersistKey();
    if (!persistKey || typeof outboundState !== "string") return undefined;

    try {
      return JSON.parse(decryptAny(outboundState, persistKey));
    } catch {
      // Undecryptable or tampered. Returning `undefined` starts this slice from
      // its reducer default, which for an auth-bearing slice means the user
      // signs in again — the correct response to state we cannot vouch for.
      return undefined;
    }
  }
);

export default encryptTransform;
export { stripSecrets, narrow };
