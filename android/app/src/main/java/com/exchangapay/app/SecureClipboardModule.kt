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
 * Clipboard writes for secrets (the TOTP setup key), used by
 * src/utils/clipboard.ts `copySensitive`. The clip is flagged IS_SENSITIVE so
 * Android 13+ masks it in the copy preview and keyboards do not offer it as a
 * suggestion. Clearing after the TTL stays in JS. Resolves true when the clip
 * was set, false otherwise; never rejects.
 */
class SecureClipboardModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = NAME

    /** `ttlMs` is accepted for parity with iOS; Android has no clip expiry API. */
    @ReactMethod
    fun setSensitiveString(text: String, label: String, ttlMs: Double, promise: Promise) {
        try {
            val clipboard =
                reactContext.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
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
            clipboard.setPrimaryClip(clip)
            promise.resolve(true)
        } catch (_: Throwable) {
            promise.resolve(false)
        }
    }

    companion object {
        const val NAME = "SecureClipboard"
        private const val EXTRA_IS_SENSITIVE = "android.content.extra.IS_SENSITIVE"
    }
}
