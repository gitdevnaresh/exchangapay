package com.exchangapay.tst

import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import java.security.KeyPairGenerator
import java.security.KeyStore
import java.security.SecureRandom
import java.security.cert.X509Certificate
import java.util.concurrent.atomic.AtomicBoolean

/**
 * Bootloader state from Android Key Attestation, evaluated on the device.
 *
 * The TEE signs the device's RootOfTrust (deviceLocked, verifiedBootState) into
 * the certificate of a freshly generated Keystore key. Magisk, KernelSU and
 * APatch all need an unlocked bootloader, and hiders such as DenyList / Shamiko
 * cannot change what the TEE signs — so this still catches root they hide.
 *
 * Client-side only: a hook on this class defeats it, like every other probe.
 * Any failure (old/broken Keystore, software-only attestation) yields null —
 * "no answer" — never a false "unlocked".
 */
object BootStateAttestation {
    private const val KEY_DESCRIPTION_OID = "1.3.6.1.4.1.11129.2.1.17"
    private const val KEY_ALIAS = "exchangapay_boot_state_probe"

    private const val TAG_CLASS_CONTEXT = 2
    private const val TAG_OCTET_STRING = 4
    private const val TAG_SEQUENCE = 16
    private const val TAG_ROOT_OF_TRUST = 704

    private const val SECURITY_LEVEL_SOFTWARE = 0
    private const val VERIFIED_BOOT_UNVERIFIED = 2
    private const val VERIFIED_BOOT_FAILED = 3

    data class RootOfTrust(val deviceLocked: Boolean, val verifiedBootState: Int)

    private var evaluated = false
    private var cached: Boolean? = null
    private val prewarmStarted = AtomicBoolean(false)

    /** Starts the check in the background once, so its answer is ready before JS asks. */
    fun prewarm() {
        if (prewarmStarted.compareAndSet(false, true)) {
            Thread({ isBootloaderUnlocked() }, "boot-state-probe").start()
        }
    }

    /**
     * true = bootloader unlocked / boot not verified; false = locked and verified;
     * null = no hardware-backed answer. Cached for the process: the state cannot
     * change without a reboot. Key generation can take ~1 s, so call off the UI
     * and React native-modules threads.
     */
    @Synchronized
    fun isBootloaderUnlocked(): Boolean? {
        if (!evaluated) {
            cached = try {
                readRootOfTrust()?.let { isUnlocked(it) }
            } catch (_: Throwable) {
                null
            }
            evaluated = true
        }
        return cached
    }

    // SelfSigned (1) with a locked bootloader is a custom-key OS such as
    // GrapheneOS — locked and verified, so it is not flagged.
    fun isUnlocked(rootOfTrust: RootOfTrust): Boolean =
        !rootOfTrust.deviceLocked ||
            rootOfTrust.verifiedBootState == VERIFIED_BOOT_UNVERIFIED ||
            rootOfTrust.verifiedBootState == VERIFIED_BOOT_FAILED

    private fun readRootOfTrust(): RootOfTrust? {
        val keyStore = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
        try {
            val challenge = ByteArray(16).also { SecureRandom().nextBytes(it) }
            val spec = KeyGenParameterSpec.Builder(KEY_ALIAS, KeyProperties.PURPOSE_SIGN)
                .setDigests(KeyProperties.DIGEST_SHA256)
                .setAttestationChallenge(challenge)
                .build()
            KeyPairGenerator.getInstance(KeyProperties.KEY_ALGORITHM_EC, "AndroidKeyStore").apply {
                initialize(spec)
                generateKeyPair()
            }
            val leaf = keyStore.getCertificateChain(KEY_ALIAS)?.firstOrNull() as? X509Certificate
                ?: return null
            val extension = leaf.getExtensionValue(KEY_DESCRIPTION_OID) ?: return null
            return parseKeyDescription(extension, challenge)
        } finally {
            try {
                keyStore.deleteEntry(KEY_ALIAS)
            } catch (_: Throwable) {
                // Nothing to clean up.
            }
        }
    }

    /**
     * Reads RootOfTrust from the KeyDescription extension:
     *   KeyDescription ::= SEQUENCE { attestationVersion, attestationSecurityLevel,
     *     keymasterVersion, keymasterSecurityLevel, attestationChallenge,
     *     uniqueId, softwareEnforced, hardwareEnforced }
     *   hardwareEnforced [704] RootOfTrust ::= SEQUENCE { verifiedBootKey,
     *     deviceLocked BOOLEAN, verifiedBootState ENUMERATED, ... }
     * Returns null for software-only attestation or a challenge mismatch.
     */
    internal fun parseKeyDescription(extensionValue: ByteArray, expectedChallenge: ByteArray?): RootOfTrust? {
        // X509Certificate.getExtensionValue wraps the extension in an OCTET STRING.
        val wrapper = Der(extensionValue).read()
        if (wrapper.tag != TAG_OCTET_STRING) return null
        val keyDescription = Der(wrapper.value).read()
        if (keyDescription.tag != TAG_SEQUENCE) return null

        val fields = Der(keyDescription.value).readAll()
        if (fields.size < 8) return null
        if (fields[1].intValue() == SECURITY_LEVEL_SOFTWARE) return null
        if (expectedChallenge != null && !fields[4].value.contentEquals(expectedChallenge)) return null

        val rootOfTrustTag = Der(fields[7].value).readAll()
            .firstOrNull { it.tagClass == TAG_CLASS_CONTEXT && it.tag == TAG_ROOT_OF_TRUST }
            ?: return null
        val rootOfTrust = Der(rootOfTrustTag.value).read()
        if (rootOfTrust.tag != TAG_SEQUENCE) return null

        val rootFields = Der(rootOfTrust.value).readAll()
        if (rootFields.size < 3) return null
        val lockedByte = rootFields[1].value
        return RootOfTrust(
            deviceLocked = lockedByte.isNotEmpty() && lockedByte[0] != 0.toByte(),
            verifiedBootState = rootFields[2].intValue(),
        )
    }

    internal class Tlv(val tagClass: Int, val tag: Int, val value: ByteArray) {
        fun intValue(): Int {
            var result = 0
            for (b in value) result = (result shl 8) or (b.toInt() and 0xFF)
            return result
        }
    }

    /** Minimal DER reader: tag (incl. high-tag-number form), definite length, value. */
    private class Der(private val buf: ByteArray) {
        private var pos = 0

        fun read(): Tlv {
            val first = next()
            val tagClass = first shr 6
            var tag = first and 0x1F
            if (tag == 0x1F) {
                tag = 0
                do {
                    val b = next()
                    tag = (tag shl 7) or (b and 0x7F)
                } while ((b and 0x80) != 0)
            }
            var length = next()
            if ((length and 0x80) != 0) {
                val count = length and 0x7F
                require(count in 1..4) { "unsupported DER length" }
                length = 0
                repeat(count) { length = (length shl 8) or next() }
            }
            require(length >= 0 && pos + length <= buf.size) { "truncated DER" }
            val value = buf.copyOfRange(pos, pos + length)
            pos += length
            return Tlv(tagClass, tag, value)
        }

        fun readAll(): List<Tlv> {
            val out = mutableListOf<Tlv>()
            while (pos < buf.size) out.add(read())
            return out
        }

        private fun next(): Int {
            require(pos < buf.size) { "truncated DER" }
            return buf[pos++].toInt() and 0xFF
        }
    }
}
