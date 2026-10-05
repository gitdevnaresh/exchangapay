package com.exchangapay.tst

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.os.Build
import java.security.MessageDigest

/**
 * L-13: OS-owned expiry for clipboard writes made through SecureClipboardModule.
 *
 * The JS clear in src/utils/clipboard.ts is a setTimeout, which dies with the
 * process and is paused while the app is backgrounded, so a copied value could
 * stay on the clipboard indefinitely. Here the deadline is handed to
 * AlarmManager, which delivers ClipboardClearReceiver even after the process
 * has been killed (it starts a fresh one to run the receiver).
 *
 * Only a SHA-256 of the copied text is persisted, never the text itself.
 *
 * Android 10+ refuses clipboard reads to an app without focus, so when the
 * alarm fires in the background the receiver cannot see what is on the
 * clipboard and clears it unconditionally. When the clipboard is readable (app
 * in the foreground, or Android 9 and below), a value the user copied after
 * ours is left alone.
 */
object ClipboardExpiry {
    private const val PREFS = "secure_clipboard_expiry"
    private const val KEY_HASH = "hash"
    private const val KEY_EXPIRES_AT = "expiresAt"
    private const val REQUEST_CODE = 0x13

    /** Records the pending clear and schedules the alarm for [ttlMs] from now. */
    fun schedule(context: Context, text: String, ttlMs: Long) {
        val app = context.applicationContext
        val expiresAt = System.currentTimeMillis() + ttlMs.coerceAtLeast(1_000L)
        prefs(app).edit()
            .putString(KEY_HASH, sha256(text))
            .putLong(KEY_EXPIRES_AT, expiresAt)
            .apply()

        val alarms = app.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        // Inexact on purpose: exact alarms need SCHEDULE_EXACT_ALARM on 12+.
        // Doze can defer this by a few minutes; it still fires after a kill.
        alarms.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, expiresAt, pendingIntent(app))
    }

    /**
     * Clears the clipboard if our value's deadline has passed. Safe to call at
     * any time (alarm, app launch, return to foreground); a no-op otherwise.
     */
    fun clearIfExpired(context: Context) {
        val app = context.applicationContext
        val prefs = prefs(app)
        val hash = prefs.getString(KEY_HASH, null) ?: return
        if (System.currentTimeMillis() < prefs.getLong(KEY_EXPIRES_AT, 0L)) return

        try {
            val clipboard = app.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
            // Null when the clipboard is empty or (Android 10+) unreadable from here.
            val current = clipboard.primaryClip
            val ours = current == null || current.itemCount == 0 ||
                sha256(current.getItemAt(0).coerceToText(app).toString()) == hash
            if (ours) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                    clipboard.clearPrimaryClip()
                } else {
                    clipboard.setPrimaryClip(ClipData.newPlainText("", ""))
                }
            }
        } catch (_: Throwable) {
            // best-effort, like the JS clear
        } finally {
            prefs.edit().clear().apply()
        }
    }

    private fun prefs(context: Context) =
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    private fun pendingIntent(context: Context): PendingIntent =
        PendingIntent.getBroadcast(
            context,
            REQUEST_CODE,
            Intent(context, ClipboardClearReceiver::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

    private fun sha256(text: String): String =
        MessageDigest.getInstance("SHA-256")
            .digest(text.toByteArray(Charsets.UTF_8))
            .joinToString("") { "%02x".format(it) }
}

/** Fired by the alarm ClipboardExpiry.schedule sets. Not exported. */
class ClipboardClearReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        ClipboardExpiry.clearIfExpired(context)
    }
}
