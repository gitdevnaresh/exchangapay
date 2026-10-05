package com.exchangapay.tst

import android.content.ClipData
import android.content.ClipDescription
import android.content.ClipboardManager
import android.content.Context
import android.os.Build
import android.os.PersistableBundle
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

/**
 * Clipboard writes used by src/utils/clipboard.ts. Every write hands its TTL to
 * ClipboardExpiry, so the clear survives the app being backgrounded or killed
 * (L-13). `setSensitiveString` (the TOTP setup key) also flags the clip
 * IS_SENSITIVE so Android 13+ masks it in the copy preview and keyboards do
 * not offer it as a suggestion. Both resolve true when the clip was set, false
 * otherwise; never reject.
 */
class SecureClipboardModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = NAME

    @ReactMethod
    fun setEphemeralString(text: String, label: String, ttlMs: Double, promise: Promise) {
        promise.resolve(write(ClipData.newPlainText(label, text), text, ttlMs))
    }

    @ReactMethod
    fun setSensitiveString(text: String, label: String, ttlMs: Double, promise: Promise) {
        val clip = ClipData.newPlainText(label, text)
        clip.description.extras = PersistableBundle().apply {
            // The constant is API 33+; the key is honoured by keyboards and
            // OEM clipboards below that, so set it on every version.
            val key = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                ClipDescription.EXTRA_IS_SENSITIVE
            } else {
                EXTRA_IS_SENSITIVE
            }
            putBoolean(key, true)
        }
        promise.resolve(write(clip, text, ttlMs))
    }

    /** Clears a clip whose deadline passed while no alarm could run. */
    @ReactMethod
    fun clearExpired() {
        ClipboardExpiry.clearIfExpired(reactContext)
    }

    private fun write(clip: ClipData, text: String, ttlMs: Double): Boolean =
        try {
            val clipboard =
                reactContext.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
            clipboard.setPrimaryClip(clip)
            ClipboardExpiry.schedule(reactContext, text, ttlMs.toLong())
            true
        } catch (_: Throwable) {
            false
        }

    companion object {
        const val NAME = "SecureClipboard"
        private const val EXTRA_IS_SENSITIVE = "android.content.extra.IS_SENSITIVE"
    }
}
