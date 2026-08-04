/**
 * Crypto migration switches (security finding H-06).
 *
 * These are deliberately plain constants rather than remote config. A remote
 * kill-switch for the cipher an app uses to talk to its backend is a
 * denial-of-service waiting to happen: a bad flag push would leave every client
 * emitting a format the server cannot read. Flipping these is a code change that
 * ships, and gets reviewed, with a matching backend release.
 */

/**
 * Whether the C# backend can accept and emit the 0x02 AES-GCM format.
 *
 * MIGRATION ORDER — do not reorder these steps:
 *   1. (done) Client DECRYPT accepts 0x02. Shipping this first means the backend
 *      can start emitting GCM the moment it is ready, without waiting on an app
 *      release or on user update adoption.
 *   2. Backend ships GCM encrypt + decrypt.
 *   3. Flip this flag to `true` and ship. Client requests are now authenticated.
 *   4. Backend drops 0x01 acceptance once telemetry shows no old clients left.
 *
 * Flipping this before step 2 breaks every write path in the app, because the
 * backend will try to read a GCM blob as CBC and fail.
 *
 * NOTE for the backend implementer: the single version byte (0x02) is passed as
 * the GCM *associated data*. It is authenticated but not encrypted. Without it,
 * an attacker can rewrite the version byte to 0x01 and force a downgrade to the
 * unauthenticated CBC parser. In .NET this is the `associatedData` parameter of
 * `AesGcm.Encrypt` / `AesGcm.Decrypt`.
 */
export const BACKEND_SUPPORTS_AEAD = false;

/**
 * At-rest encryption (redux-persist -> Keychain) never leaves the device, so it
 * has no backend to coordinate with and moves to GCM immediately.
 */
export const AT_REST_USES_AEAD = true;

/**
 * Whether to keep decrypting the two pre-0x01 formats: the `v2:` hex-IV form and
 * the all-zero-IV form written by the old crypto-js code.
 *
 * The zero-IV form is the one flagged as weak — a fixed IV means identical
 * plaintext always produced identical ciphertext, which leaks equality between
 * records. The encrypt side was fixed previously; this is the read side.
 *
 * REMOVAL PROCEDURE:
 *   1. Watch the `crypto.legacy_format` metric (see legacyTelemetry.ts).
 *   2. Once it is zero for a full release cycle, set this to `false` and ship.
 *   3. One release later, delete the legacy branches in aes.ts entirely.
 */
export const LEGACY_FORMATS_ENABLED = true;

/**
 * Hard deadline for step 2 above. Past this date the legacy-format telemetry is
 * escalated from a warning to an error so it cannot be quietly ignored — see
 * `reportLegacyFormatUsage`. Kept as an ISO date string so it is greppable.
 */
export const LEGACY_FORMAT_REMOVAL_DATE = "2026-11-01";
