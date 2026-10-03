package com.exchangapay.tst

import android.os.Build
import android.provider.Settings
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File
import java.net.InetSocketAddress
import java.net.Socket

/**
 * Native root / hook detection, used by src/security/deviceIntegrity.ts.
 * Methods never reject; a failing probe just reports no signal.
 */
class DeviceSecurityModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = NAME

    init {
        // Normally already started from MainApplication.onCreate; no-op then.
        BootStateAttestation.prewarm()
    }

    /**
     * Resolves `{ compromised, reasons }` with "native_bootloader_unlocked"
     * when the TEE reports an unlocked bootloader. Runs on its own thread: key
     * generation must not hold up the other probes on the native-modules thread.
     */
    @ReactMethod
    fun getBootState(promise: Promise) {
        Thread({
            val reasons = Arguments.createArray()
            try {
                if (BootStateAttestation.isBootloaderUnlocked() == true) {
                    reasons.pushString("native_bootloader_unlocked")
                }
            } catch (_: Throwable) {
                // No answer -> no signal.
            }
            promise.resolve(Arguments.createMap().apply {
                putBoolean("compromised", reasons.size() > 0)
                putArray("reasons", reasons)
            })
        }, "boot-state-probe").start()
    }

    /** Resolves `{ developerOptionsEnabled, adbEnabled }`. Never rejects. */
    @ReactMethod
    fun getFlags(promise: Promise) {
        var developerOptionsEnabled = false
        var adbEnabled = false
        try {
            val resolver = reactContext.contentResolver
            developerOptionsEnabled = Settings.Global.getInt(
                resolver, Settings.Global.DEVELOPMENT_SETTINGS_ENABLED, 0,
            ) == 1
            adbEnabled = Settings.Global.getInt(
                resolver, Settings.Global.ADB_ENABLED, 0,
            ) == 1
        } catch (_: Throwable) {
            // Unreadable setting -> report "not set".
        }
        val map = Arguments.createMap().apply {
            putBoolean("developerOptionsEnabled", developerOptionsEnabled)
            putBoolean("adbEnabled", adbEnabled)
        }
        promise.resolve(map)
    }

    /** Resolves `{ compromised, reasons }`: su/Magisk files, su on PATH, test-keys, hook files/libs. */
    @ReactMethod
    fun getRootStatus(promise: Promise) {
        val reasons = Arguments.createArray()
        try {
            if (anyPathExists(ROOT_PATHS)) reasons.pushString("native_root_file")
            if (suOnPath()) reasons.pushString("native_su_path")
            if (hasTestKeys()) reasons.pushString("native_test_keys")
            if (anyPathExists(HOOK_PATHS)) reasons.pushString("native_hook_artifact")
            if (procMapsHasInstrumentation()) reasons.pushString("native_hook_injected")
            if (mountsHaveRootArtifacts()) reasons.pushString("native_root_mount")
            if (hasFridaThread()) reasons.pushString("native_frida_thread")
            if (isFridaPortOpen()) reasons.pushString("native_frida_port")
        } catch (_: Throwable) {
            // Report whatever was collected before the fault.
        }
        val map = Arguments.createMap().apply {
            putBoolean("compromised", reasons.size() > 0)
            putArray("reasons", reasons)
        }
        promise.resolve(map)
    }

    private fun anyPathExists(paths: Array<String>): Boolean =
        paths.any { path ->
            try {
                File(path).exists()
            } catch (_: Throwable) {
                false
            }
        }

    // "test-keys" builds are not manufacturer-signed: a custom/rooted ROM.
    private fun hasTestKeys(): Boolean =
        try {
            Build.TAGS?.contains("test-keys") == true
        } catch (_: Throwable) {
            false
        }

    private fun suOnPath(): Boolean =
        try {
            val path = System.getenv("PATH") ?: SU_PATH_FALLBACK
            path.split(":").any { dir ->
                try {
                    File(dir, "su").exists()
                } catch (_: Throwable) {
                    false
                }
            }
        } catch (_: Throwable) {
            false
        }

    // A frida/xposed/substrate library mapped into this process means a live hook.
    private fun procMapsHasInstrumentation(): Boolean =
        try {
            val maps = File("/proc/self/maps")
            if (!maps.exists()) {
                false
            } else {
                maps.bufferedReader().useLines { lines ->
                    lines.any { line ->
                        val lower = line.lowercase()
                        INSTRUMENTATION_TOKENS.any { lower.contains(it) }
                    }
                }
            }
        } catch (_: Throwable) {
            false
        }

    // Magisk, KernelSU and APatch mount over system paths. /proc/self/mounts
    // is readable by every app (unlike /data/adb), so their mounts show up here
    // unless a hider such as Shamiko unmounts them for this process.
    private fun mountsHaveRootArtifacts(): Boolean =
        try {
            File("/proc/self/mounts").bufferedReader().useLines { lines ->
                lines.any { line ->
                    val parts = line.split(" ")
                    val device = parts.getOrNull(0)?.lowercase() ?: ""
                    val mountPoint = parts.getOrNull(1) ?: ""
                    device.contains("magisk") ||
                        device == "ksu" ||
                        device == "apatch" ||
                        mountPoint.startsWith("/debug_ramdisk") ||
                        mountPoint.contains("/.magisk")
                }
            }
        } catch (_: Throwable) {
            false
        }

    // Frida's agent keeps its thread names even when the gadget library
    // is renamed, so a renamed gadget is still visible here.
    private fun hasFridaThread(): Boolean =
        try {
            File("/proc/self/task").listFiles()?.any { task ->
                try {
                    val name = File(task, "comm").readText().trim().lowercase()
                    FRIDA_THREAD_NAMES.any { name.contains(it) }
                } catch (_: Throwable) {
                    false
                }
            } ?: false
        } catch (_: Throwable) {
            false
        }

    // frida-server listens on 127.0.0.1:27042 by default. React methods run
    // on the native-modules thread, so this short connect never touches the UI.
    private fun isFridaPortOpen(): Boolean =
        try {
            Socket().use { socket ->
                socket.connect(InetSocketAddress("127.0.0.1", FRIDA_DEFAULT_PORT), 150)
                true
            }
        } catch (_: Throwable) {
            false
        }

    companion object {
        const val NAME = "DeviceSecurity"

        private const val FRIDA_DEFAULT_PORT = 27042

        // Frida-only names. Generic GLib names (gmain, gdbus) are left out: a false
        // positive here blocks the whole app.
        private val FRIDA_THREAD_NAMES = arrayOf(
            "gum-js-loop",
            "pool-frida",
        )

        private const val SU_PATH_FALLBACK =
            "/sbin:/system/sbin:/system/bin:/system/xbin:/vendor/bin"

        private val ROOT_PATHS = arrayOf(
            "/sbin/su",
            "/system/bin/su",
            "/system/xbin/su",
            "/system/sd/xbin/su",
            "/system/bin/failsafe/su",
            "/data/local/su",
            "/data/local/bin/su",
            "/data/local/xbin/su",
            "/su/bin/su",
            "/system/xbin/daemonsu",
            "/system/app/Superuser.apk",
            "/system/app/Superuser/Superuser.apk",
            "/system/etc/init.d/99SuperSUDaemon",
            "/dev/com.koushikdutta.superuser.daemon/",
            "/system/app/Magisk.apk",
            "/sbin/magisk",
            "/cache/.disable_magisk",
            // /data/adb/* removed — unreadable by untrusted_app under
            // SELinux, so always false. See mountsHaveRootArtifacts().
        )

        private val HOOK_PATHS = arrayOf(
            "/data/local/tmp/frida-server",
            "/data/local/tmp/re.frida.server",
            "/data/local/tmp/frida-gadget",
            "/system/lib/libfrida-gadget.so",
            "/system/lib64/libfrida-gadget.so",
            "/sbin/.magisk/modules/riru_lsposed",
            "/system/framework/XposedBridge.jar",
            "/system/lib/libxposed_art.so",
            "/system/bin/app_process_xposed",
        )

        private val INSTRUMENTATION_TOKENS = arrayOf(
            "frida",
            "frida-agent",
            "frida-gadget",
            "gum-js-loop",
            "linjector",
            "libsubstrate",
            "xposed",
            // Zygisk / LSPosed / Riru / Shamiko modules mapped into the app.
            "zygisk",
            "lsposed",
            "lspd",
            "riru",
            "edxp",
            "shamiko",
        )
    }
}
