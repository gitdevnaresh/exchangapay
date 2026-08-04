/**
 * Filesystem probes backing the H-04 device-integrity check.
 *
 * These are heuristics, deliberately kept in one place so the path lists can be
 * reviewed and extended without touching the scoring logic. None of them is
 * authoritative — an attacker with root can hide every one of these files. They
 * exist as a risk *signal* to feed fraud monitoring, and as friction; the real
 * enforcement is server-side attestation (see attestation.ts).
 */

/** Root management binaries and Magisk artefacts. */
export const ANDROID_ROOT_PATHS = [
  "/system/app/Superuser.apk",
  "/system/xbin/su",
  "/system/bin/su",
  "/sbin/su",
  "/su/bin/su",
  "/system/su",
  "/system/bin/failsafe/su",
  "/system/sd/xbin/su",
  "/system/bin/.ext/.su",
  "/system/usr/we-need-root/su-backup",
  "/system/xbin/daemonsu",
  "/data/local/su",
  "/data/local/xbin/su",
  "/data/local/bin/su",
  "/vendor/bin/su",
  "/system/etc/init.d/99SuperSUDaemon",
  "/system/bin/magisk",
  "/sbin/magisk",
  "/data/adb/magisk",
  "/data/adb/modules",
  "/dev/com.koushikdutta.superuser.daemon/",
];

/** Instrumentation frameworks — Frida, Xposed, Substrate. */
export const ANDROID_HOOK_PATHS = [
  "/data/local/tmp/frida-server",
  "/data/local/tmp/re.frida.server",
  "/system/lib/libfrida-gadget.so",
  "/system/lib64/libfrida-gadget.so",
  "/system/framework/XposedBridge.jar",
  "/system/lib/libxposed_art.so",
  "/system/lib/libsubstrate.so",
  "/data/data/de.robv.android.xposed.installer",
  "/data/data/io.va.exposed",
];

// Note: there is deliberately no "is /system writable" probe here. On Android 10+
// dm-verity keeps the system partition read-only even under root, so the check
// yields false negatives on exactly the devices it is meant to catch, while
// leaving stray files behind if it ever did succeed.

/** Jailbreak package managers and the binaries they drag in. */
export const IOS_JAILBREAK_PATHS = [
  "/Applications/Cydia.app",
  "/Applications/Sileo.app",
  "/Applications/Zebra.app",
  "/Applications/Checkra1n.app",
  "/Applications/blackra1n.app",
  "/Applications/FakeCarrier.app",
  "/private/var/lib/apt",
  "/private/var/lib/cydia",
  "/private/var/stash",
  "/etc/apt",
  "/etc/ssh/sshd_config",
  "/usr/sbin/sshd",
  "/usr/bin/ssh",
  "/usr/libexec/ssh-keysign",
  "/bin/bash",
  "/bin/sh",
  "/var/checkra1n.dmg",
  "/var/binpack",
];

/** iOS hooking runtimes. */
export const IOS_HOOK_PATHS = [
  "/Library/MobileSubstrate/MobileSubstrate.dylib",
  "/Library/MobileSubstrate/DynamicLibraries",
  "/usr/lib/substrate",
  "/usr/lib/substitute-inserter.dylib",
  "/usr/lib/TweakInject",
  "/usr/lib/frida",
  "/usr/lib/frida/frida-agent.dylib",
];

/**
 * Path outside the app container. The iOS sandbox denies this to every stock
 * app; a jailbreak that disables the sandbox lets the write through.
 */
export const IOS_SANDBOX_ESCAPE_PATH = "/private/.exchangapay_integrity_probe";
