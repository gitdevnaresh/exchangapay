/**
 * AES core — the single implementation of this app's wire format (H-06).
 *
 * This used to exist twice: once in `src/hooks/useEncryption_Decryption.tsx` for
 * React callers and once in `src/utils/helpers/encryptionDecryption.tsx` for the
 * redux-persist transform, with subtly different failure behaviour. Two copies of
 * a crypto routine drift, and the drift is invisible until something is already
 * unreadable. Both are now thin wrappers over this module; the only thing they
 * still decide for themselves is where the key comes from and what a failure
 * looks like to the caller.
 *
 * ---------------------------------------------------------------------------
 * WIRE FORMATS
 * ---------------------------------------------------------------------------
 * 0x02  AEAD, current       base64( [0x02][12B nonce][16B tag][ciphertext] )
 *       AES-GCM. The tag covers the ciphertext AND the version byte (passed as
 *       associated data), so neither the payload nor the format label can be
 *       altered without detection. This is the format that fixes H-06.
 *
 * 0x01  CBC, backend-compat base64( [0x01][16B random IV][AES-CBC-PKCS7 ct] )
 *       Confidentiality only. Byte-for-byte compatible with the C# backend and
 *       the web app. Still the default for backend traffic until the server
 *       speaks GCM — see BACKEND_SUPPORTS_AEAD in policy.ts.
 *
 * v2:   legacy              "v2:" + hex(16B IV) + base64(AES-CBC-PKCS7 ct)
 * (none) legacy, WEAK       base64( AES-CBC-PKCS7 ct ) with an all-zero IV
 *       A fixed IV makes encryption deterministic: identical plaintext produces
 *       identical ciphertext, which leaks equality between records. Decrypt-only,
 *       counted, and scheduled for deletion — see legacyTelemetry.ts.
 *
 * ---------------------------------------------------------------------------
 * WHY CBC STILL EXISTS
 * ---------------------------------------------------------------------------
 * AES-CBC is malleable: flipping a bit in the IV flips the same bit of the first
 * plaintext block, with no error raised. An attacker who can modify ciphertext in
 * transit can therefore make controlled edits to the decrypted value without
 * knowing the key. That is exactly what a MAC prevents and CBC does not have.
 * Removing it is a two-sided change — the backend has to be able to read what we
 * send — so the client half ships first and the switch is one constant.
 */

import QuickCrypto from "react-native-quick-crypto";
import { Buffer } from "@craftzdog/react-native-buffer";
import { LEGACY_FORMATS_ENABLED } from "./policy";
import { recordLegacyFormatDecrypt } from "./legacyTelemetry";

export const FORMAT_CBC = 0x01;
export const FORMAT_GCM = 0x02;

const AES_IV_SIZE = 16;
const AES_BLOCK_SIZE = 16;
/** 96 bits — the only nonce size GCM is actually specified and optimised for. */
const GCM_NONCE_SIZE = 12;
/** 128 bits — full-length tag. Truncating the tag weakens forgery resistance. */
const GCM_TAG_SIZE = 16;
const LEGACY_IV_PREFIX = "v2:";

/** Smallest valid 0x02 blob: header + nonce + tag + zero-length ciphertext. */
const GCM_MIN_SIZE = 1 + GCM_NONCE_SIZE + GCM_TAG_SIZE;

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export type CryptoFailure =
  /** No key available — usually a logged-out or not-yet-hydrated caller. */
  | "missing-key"
  /** Key is not 128/192/256-bit after normalisation. */
  | "bad-key-length"
  /** AEAD tag did not verify. The data was altered, or the key is wrong. */
  | "tampered"
  /** Not a shape this app has ever emitted. */
  | "malformed"
  /** Everything else the cipher rejected (bad padding, truncation, ...). */
  | "decrypt-failed";

export class CryptoError extends Error {
  readonly reason: CryptoFailure;

  constructor(reason: CryptoFailure, message: string) {
    super(message);
    this.name = "CryptoError";
    this.reason = reason;
  }
}

// ---------------------------------------------------------------------------
// Key handling
// ---------------------------------------------------------------------------

/**
 * A key is either the backend's human-readable `sk` string, or raw bytes.
 *
 * Raw bytes exist for at-rest encryption (H-05), where the key is a random
 * 256-bit value this app generates rather than a string the backend issued.
 * Squeezing that through the UTF-8 string path would cost entropy: a 32-byte
 * key expressed as a printable 32-character string carries well under 256 bits.
 */
export type SecretKey = string | Uint8Array;

/**
 * Strip spaces/dashes and validate length — mirrors the C# NormalizeKey so the
 * same human-readable key string yields the same bytes on both sides.
 */
export function normalizeSecretKey(secretKey: string): string {
  if (!secretKey) {
    throw new CryptoError("missing-key", "SecretKey is missing");
  }
  const normalized = secretKey.replace(/[ -]/g, "");
  const byteLen = Buffer.byteLength(normalized, "utf8");
  if (![16, 24, 32].includes(byteLen)) {
    throw new CryptoError(
      "bad-key-length",
      `AES key must be 128/192/256-bit after normalization (got ${byteLen * 8}-bit)`
    );
  }
  return normalized;
}

/** crypto-js auto-detected the variant from key length; QuickCrypto needs it named. */
function cbcAlgorithm(keyByteLength: number): string {
  switch (keyByteLength) {
    case 16: return "aes-128-cbc";
    case 24: return "aes-192-cbc";
    case 32: return "aes-256-cbc";
    default:
      throw new CryptoError("bad-key-length", `Unsupported AES key length: ${keyByteLength}`);
  }
}

function gcmAlgorithm(keyByteLength: number): string {
  switch (keyByteLength) {
    case 16: return "aes-128-gcm";
    case 24: return "aes-192-gcm";
    case 32: return "aes-256-gcm";
    default:
      throw new CryptoError("bad-key-length", `Unsupported AES key length: ${keyByteLength}`);
  }
}

const keyBuffer = (secretKey: SecretKey) => {
  if (typeof secretKey !== "string") {
    const raw = Buffer.from(secretKey);
    if (![16, 24, 32].includes(raw.length)) {
      throw new CryptoError(
        "bad-key-length",
        `AES key must be 16/24/32 bytes (got ${raw.length})`
      );
    }
    return raw;
  }
  return Buffer.from(normalizeSecretKey(secretKey), "utf8");
};

// ---------------------------------------------------------------------------
// Encrypt
// ---------------------------------------------------------------------------

/**
 * Authenticated encryption. Output: base64( [0x02][nonce][tag][ciphertext] ).
 *
 * The version byte is fed in as associated data so it is covered by the tag.
 * Without that, an attacker could rewrite 0x02 to 0x01 and hand the remainder to
 * the unauthenticated CBC parser — a downgrade that would undo the whole point.
 */
export const encryptGCM = (plainText: string, secretKey: SecretKey): string => {
  const keyBuf = keyBuffer(secretKey);
  const header = Buffer.from([FORMAT_GCM]);
  const nonce = Buffer.from(QuickCrypto.randomBytes(GCM_NONCE_SIZE));

  const cipher: any = QuickCrypto.createCipheriv(
    gcmAlgorithm(keyBuf.length) as any,
    keyBuf as any,
    nonce as any
  );
  cipher.setAAD(header);
  const cipherBuf = Buffer.concat([
    cipher.update(plainText || "", "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  if (tag.length !== GCM_TAG_SIZE) {
    throw new CryptoError("decrypt-failed", `Unexpected GCM tag length: ${tag.length}`);
  }

  return Buffer.concat([header, nonce, tag, cipherBuf]).toString("base64");
};

/**
 * Confidentiality-only encryption in the backend's format.
 * Output: base64( [0x01][16B random IV][AES-CBC-PKCS7 ciphertext] ).
 *
 * No integrity protection — see the header comment. Use encryptGCM wherever the
 * far side can read it.
 */
export const encryptCBC = (plainText: string, secretKey: SecretKey): string => {
  const keyBuf = keyBuffer(secretKey);
  const iv = Buffer.from(QuickCrypto.randomBytes(AES_IV_SIZE));

  const cipher: any = QuickCrypto.createCipheriv(
    cbcAlgorithm(keyBuf.length) as any,
    keyBuf as any,
    iv as any
  );
  const cipherBuf = Buffer.concat([
    cipher.update(plainText || "", "utf8"),
    cipher.final(),
  ]);

  return Buffer.concat([Buffer.from([FORMAT_CBC]), iv, cipherBuf]).toString("base64");
};

// ---------------------------------------------------------------------------
// Decrypt
// ---------------------------------------------------------------------------

export type WireFormat = "gcm" | "cbc" | "v2-hex" | "zero-iv";

/**
 * Classify a blob without decrypting it. Exported for tests and for the
 * migration metric; the branches below must stay in sync with this.
 *
 * Order matters. The 0x02 check runs first, so a blob that claims to be GCM is
 * always tag-checked before any plaintext is produced — a failed tag can never
 * silently hand the payload to an unauthenticated parser. (One narrow exception,
 * for old records that happen to start with a 0x02 byte, is handled and argued
 * for in decryptAny.)
 */
export const detectFormat = (cipherText: string): WireFormat | null => {
  if (!cipherText) return null;
  if (cipherText.startsWith(LEGACY_IV_PREFIX)) return "v2-hex";

  const bytes = Buffer.from(cipherText, "base64");

  if (bytes.length >= GCM_MIN_SIZE && bytes[0] === FORMAT_GCM) return "gcm";

  if (
    bytes.length > 1 + AES_IV_SIZE &&
    bytes[0] === FORMAT_CBC &&
    bytes.length % AES_BLOCK_SIZE === 1
  ) {
    return "cbc";
  }

  // Legacy zero-IV blobs are a bare CBC stream, so the only structure they have
  // is a non-zero whole number of blocks. Anything else is not ours.
  if (bytes.length > 0 && bytes.length % AES_BLOCK_SIZE === 0) return "zero-iv";

  return null;
};

const decryptGCM = (bytes: any, keyBuf: any): string => {
  const header = bytes.subarray(0, 1);
  const nonce = bytes.subarray(1, 1 + GCM_NONCE_SIZE);
  const tag = bytes.subarray(1 + GCM_NONCE_SIZE, GCM_MIN_SIZE);
  const cipherBuf = bytes.subarray(GCM_MIN_SIZE);

  const decipher: any = QuickCrypto.createDecipheriv(
    gcmAlgorithm(keyBuf.length) as any,
    keyBuf,
    nonce
  );
  decipher.setAAD(header);
  decipher.setAuthTag(tag);

  try {
    // final() is where the tag is checked. If the ciphertext, the nonce or the
    // version byte was touched, this throws and no plaintext is returned —
    // that is the tamper detection H-06 asked for.
    return Buffer.concat([decipher.update(cipherBuf), decipher.final()]).toString("utf8");
  } catch (error: any) {
    throw new CryptoError(
      "tampered",
      `AES-GCM authentication failed: ${error?.message ?? "tag mismatch"}`
    );
  }
};

/**
 * Cheap plausibility check on a decrypted string.
 *
 * Needed only by the ambiguous-blob retry below. CBC has no integrity check, so
 * decrypting the wrong bytes does not raise an error — it yields noise, and PKCS7
 * accepts that noise roughly 1 time in 256. This is the guard that stops such a
 * "success" from being handed back as data.
 *
 * Everything this app encrypts is text: JSON, names, addresses, numbers, base64.
 * Noise is not. Rejecting the U+FFFD replacement character and stray C0 control
 * bytes drops the false-accept rate to negligible while accepting every real
 * value.
 */
const looksLikeText = (value: string): boolean => {
  if (value.includes("�")) return false;
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code < 0x20 && code !== 0x09 && code !== 0x0a && code !== 0x0d) return false;
    if (code === 0x7f) return false;
  }
  return true;
};

const decryptCBCWith = (cipherBuf: any, iv: any, keyBuf: any): string => {
  const decipher: any = QuickCrypto.createDecipheriv(
    cbcAlgorithm(keyBuf.length) as any,
    keyBuf,
    iv
  );
  return Buffer.concat([decipher.update(cipherBuf), decipher.final()]).toString("utf8");
};

/**
 * Decrypt one of the two legacy formats and, on success, count it towards the
 * removal metric. Failures are deliberately NOT counted: a failure is far more
 * likely to be a wrong key or a corrupt record than a genuine old-format row,
 * and counting those would keep the metric permanently above zero, which would
 * mean the legacy branch never gets deleted.
 */
const decryptLegacy = (
  cipherText: string,
  format: "v2-hex" | "zero-iv",
  keyBuf: any
): string => {
  if (!LEGACY_FORMATS_ENABLED) {
    throw new CryptoError("malformed", `Legacy format "${format}" is no longer accepted`);
  }

  if (format === "v2-hex") {
    // Unambiguous: nothing else in this app starts with "v2:".
    const data = cipherText.slice(LEGACY_IV_PREFIX.length);
    const plain = decryptCBCWith(
      Buffer.from(data.slice(32), "base64"),
      Buffer.from(data.slice(0, 32), "hex"),
      keyBuf
    );
    recordLegacyFormatDecrypt(format);
    return plain;
  }

  // The zero-IV format has no header at all, which makes it this decoder's
  // catch-all: any block-aligned base64 that matched nothing else ends up here,
  // including a 0x02 blob whose version byte an attacker rewrote to dodge the
  // AEAD check. CBC will not complain about that — it has no integrity check,
  // and PKCS7 accepts noise about 1 time in 256. So the output is screened
  // before it is returned. Without this, relabelling a GCM blob is a working
  // downgrade attack against the fix.
  const plain = decryptCBCWith(
    Buffer.from(cipherText, "base64"),
    Buffer.alloc(AES_IV_SIZE, 0),
    keyBuf
  );
  if (!looksLikeText(plain)) {
    throw new CryptoError(
      "decrypt-failed",
      "Legacy zero-IV decrypt produced non-text output; refusing it"
    );
  }
  recordLegacyFormatDecrypt(format);
  return plain;
};

/**
 * Decrypt any format this app has ever emitted.
 *
 * Throws CryptoError on failure — callers decide whether that surfaces as an
 * exception or as an empty string. It never returns a partially-verified result:
 * for 0x02 the tag is checked before any plaintext is handed back.
 */
export const decryptAny = (cipherText: string, secretKey: SecretKey): string => {
  if (!cipherText) {
    throw new CryptoError("malformed", "Ciphertext is empty");
  }
  const keyBuf = keyBuffer(secretKey);
  const format = detectFormat(cipherText);

  if (format === "gcm") {
    const bytes = Buffer.from(cipherText, "base64");
    try {
      return decryptGCM(bytes, keyBuf);
    } catch (error) {
      // A legacy zero-IV blob is a bare CBC stream, so roughly 1 in 256 of them
      // begins with a 0x02 byte and lands here by mistake. The old code read
      // those fine; without this retry they would become permanently
      // unreadable, which is not an acceptable outcome for KYC and card data.
      //
      // This does NOT weaken tamper detection. Reaching it requires the GCM tag
      // to have already failed, and decryptLegacy screens its own output —
      // PKCS7 rejects noise ~255 times out of 256 and the text check rejects
      // essentially all of the remainder. What survives both is neither
      // attacker-chosen nor reachable without the attacker already being able
      // to present a legacy blob directly. The whole path disappears when
      // LEGACY_FORMATS_ENABLED goes false.
      if (LEGACY_FORMATS_ENABLED && bytes.length % AES_BLOCK_SIZE === 0) {
        try {
          return decryptLegacy(cipherText, "zero-iv", keyBuf);
        } catch {
          // Fall through and report the real problem: the tag did not verify.
        }
      }
      throw error;
    }
  }

  if (format === "cbc") {
    const bytes = Buffer.from(cipherText, "base64");
    try {
      return decryptCBCWith(
        bytes.subarray(1 + AES_IV_SIZE),
        bytes.subarray(1, 1 + AES_IV_SIZE),
        keyBuf
      );
    } catch (error: any) {
      throw new CryptoError("decrypt-failed", `AES-CBC decrypt failed: ${error?.message}`);
    }
  }

  if (format === "v2-hex" || format === "zero-iv") {
    try {
      return decryptLegacy(cipherText, format, keyBuf);
    } catch (error: any) {
      if (error instanceof CryptoError) throw error;
      throw new CryptoError("decrypt-failed", `Legacy decrypt failed: ${error?.message}`);
    }
  }

  throw new CryptoError("malformed", "Unrecognised ciphertext format");
};
