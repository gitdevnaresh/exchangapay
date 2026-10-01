package com.exchangapay.tst

import android.app.DownloadManager
import android.content.ActivityNotFoundException
import android.content.Intent
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

/**
 * Opens the system Downloads screen when a document notification is tapped,
 * used by src/utils/documentNotification.ts. Only the fixed "Downloads"
 * folder is supported; any other value from JS is refused so a notification
 * payload cannot steer the app to an arbitrary location. Resolves true when
 * the screen was opened, false otherwise; never rejects.
 */
class FileManagerModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = NAME

    @ReactMethod
    fun goToFolder(folder: String, promise: Promise) {
        if (folder != DOWNLOADS) {
            promise.resolve(false)
            return
        }
        try {
            val intent = Intent(DownloadManager.ACTION_VIEW_DOWNLOADS)
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            reactContext.startActivity(intent)
            promise.resolve(true)
        } catch (_: ActivityNotFoundException) {
            promise.resolve(false)
        } catch (_: Throwable) {
            promise.resolve(false)
        }
    }

    companion object {
        const val NAME = "FileManagerModule"
        private const val DOWNLOADS = "Downloads"
    }
}
