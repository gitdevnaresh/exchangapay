package com.exchangapay.tst

import android.util.Base64
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.module.annotations.ReactModule
import com.google.android.play.core.integrity.IntegrityManagerFactory
import com.google.android.play.core.integrity.IntegrityTokenRequest

/**
 * H-04 — Play Integrity, the Android half of Tier 1.
 *
 * Everything in src/security/deviceIntegrity.ts runs inside the process the
 * attacker controls, so it can be patched out. This cannot: Google Play services
 * produces the verdict outside the app and signs it with a key the app never
 * sees. The app is only a courier — it fetches an opaque token and hands it to
 * the API layer, which sends it as X-Device-Attestation.
 *
 * THE TOKEN MEANS NOTHING UNTIL THE BACKEND DECODES IT. A client that inspects
 * its own verdict has learned nothing an attacker cannot rewrite. Server-side:
 * decode via the Play Integrity API and reject unless
 *   deviceIntegrity  contains MEETS_DEVICE_INTEGRITY  (rejects rooted/emulated)
 *   appIntegrity     is PLAY_RECOGNIZED               (rejects repackaged builds)
 *   requestDetails.nonce matches the nonce that was issued for this request
 *   requestDetails.requestPackageName is this app's applicationId
 *
 * Fails by rejecting the promise, never by throwing into the app: the JS side
 * turns any failure into "no token", and a missing token must never stop a
 * legitimate user transacting. That is deliberate — until the backend enforces,
 * blocking on our side would only break real users while an attacker patches the
 * check out anyway.
 */
@ReactModule(name = PlayIntegrityModule.NAME)
class PlayIntegrityModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = NAME

    /**
     * @param nonce              server-issued and single-use once the endpoint in
     *                           attestation.ts exists. Encoded here rather than in
     *                           JS because Play requires URL-safe base64 with no
     *                           padding — the backend must apply the same encoding
     *                           before comparing it with what it issued.
     * @param cloudProjectNumber the Google Cloud project number linked to the app.
     *                           Optional for builds installed from Play, which are
     *                           linked automatically; required otherwise.
     */
    @ReactMethod
    fun requestToken(nonce: String?, cloudProjectNumber: String?, promise: Promise) {
        if (nonce.isNullOrBlank()) {
            promise.reject(ERROR_CODE, "A nonce is required to request an integrity token")
            return
        }

        try {
            val request = IntegrityTokenRequest.builder().setNonce(encodeNonce(nonce))
            cloudProjectNumber?.trim()?.toLongOrNull()?.let(request::setCloudProjectNumber)

            IntegrityManagerFactory.create(reactApplicationContext)
                .requestIntegrityToken(request.build())
                .addOnSuccessListener { response -> promise.resolve(response.token()) }
                // Play services missing, throttled, offline, or the Integrity API
                // not enabled for this app. All of them mean "no verdict", which
                // the caller treats as no token rather than as a bad device.
                .addOnFailureListener { error ->
                    promise.reject(ERROR_CODE, error.message ?: "Integrity token unavailable", error)
                }
        } catch (throwable: Throwable) {
            promise.reject(ERROR_CODE, throwable.message ?: "Integrity token unavailable", throwable)
        }
    }

    /** Play requires the nonce as URL-safe base64, unpadded, 16–500 bytes. */
    private fun encodeNonce(nonce: String): String =
        Base64.encodeToString(
            nonce.toByteArray(Charsets.UTF_8),
            Base64.URL_SAFE or Base64.NO_WRAP or Base64.NO_PADDING
        )

    companion object {
        const val NAME = "PlayIntegrityModule"
        private const val ERROR_CODE = "play_integrity_unavailable"
    }
}
