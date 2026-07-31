import QuickCrypto from "react-native-quick-crypto";
import { Buffer } from "@craftzdog/react-native-buffer";

// ---------------------------------------------------------------------------
// AES-CBC/PKCS7 via react-native-quick-crypto (NATIVE, off the JS interpreter)
// ---------------------------------------------------------------------------
// Same scheme and wire format as `useEncryptDecrypt` (src/hooks/useEncryption_
// Decryption.tsx) — the only difference is that the key is passed in rather
// than read from Redux, because this module is used by the redux-persist
// transform, which runs outside React.
//
//   encrypt -> base64( [0x01][16-byte random IV][AES-CBC-PKCS7 ciphertext] )
//   decrypt -> accepts the above, the legacy `v2:` hex-IV form, and the legacy
//              all-zero-IV form written by the previous crypto-js code.
//
// Replaces a hardcoded all-zero IV (VAPT HIGH-02): identical plaintext now
// produces different ciphertext on every call.
const BACKEND_RANDOM_IV_VERSION = 1;
const AES_IV_SIZE = 16;
const AES_BLOCK_SIZE = 16;
const IV_PREFIX = "v2:";

/** Strip spaces/dashes and validate key length — mirrors C# NormalizeKey. */
function normalizeSecretKey(secretKey: string): string {
    if (!secretKey) throw new Error("SecretKey is missing");
    const normalized = secretKey.replace(/[ -]/g, "");
    const byteLen = Buffer.byteLength(normalized, "utf8");
    if (![16, 24, 32].includes(byteLen)) {
        throw new Error(`AES key must be 128/192/256-bit after normalization (got ${byteLen * 8}-bit)`);
    }
    return normalized;
}

/** Pick the CBC variant from the key byte-length (crypto-js auto-detected this). */
function cbcAlgorithm(keyByteLength: number): "aes-128-cbc" | "aes-192-cbc" | "aes-256-cbc" {
    switch (keyByteLength) {
        case 16: return "aes-128-cbc";
        case 24: return "aes-192-cbc";
        case 32: return "aes-256-cbc";
        default: throw new Error(`Unsupported AES key length: ${keyByteLength}`);
    }
}

export const decryptAES = (cipherText: string, secretKey: string): string => {
    try {
        if (!cipherText || !secretKey) return "";
        const keyBuf = Buffer.from(normalizeSecretKey(secretKey), "utf8");

        let iv: Buffer;
        let cipherBuf: Buffer;

        if (cipherText.startsWith(IV_PREFIX)) {
            const data = cipherText.slice(IV_PREFIX.length);
            iv = Buffer.from(data.slice(0, 32), "hex");
            cipherBuf = Buffer.from(data.slice(32), "base64");
        } else {
            const bytes = Buffer.from(cipherText, "base64");
            if (
                bytes.length > 1 + AES_IV_SIZE &&
                bytes[0] === BACKEND_RANDOM_IV_VERSION &&
                bytes.length % AES_BLOCK_SIZE === 1
            ) {
                iv = bytes.subarray(1, 1 + AES_IV_SIZE);
                cipherBuf = bytes.subarray(1 + AES_IV_SIZE);
            } else {
                // Legacy fallback: static all-zero IV, ciphertext is the bare base64.
                iv = Buffer.alloc(AES_IV_SIZE, 0);
                cipherBuf = Buffer.from(cipherText, "base64");
            }
        }

        const decipher = QuickCrypto.createDecipheriv(cbcAlgorithm(keyBuf.length), keyBuf, iv);
        return Buffer.concat([decipher.update(cipherBuf), decipher.final()]).toString("utf8") || "";
    } catch (error: any) {
        throw new Error("Decryption failed: " + error?.message);
    }
};

export const encryptAES = (plainText: string, secretKey: string): string => {
    try {
        const keyBuf = Buffer.from(normalizeSecretKey(secretKey), "utf8");
        const iv = QuickCrypto.randomBytes(AES_IV_SIZE);

        const cipher = QuickCrypto.createCipheriv(cbcAlgorithm(keyBuf.length), keyBuf, iv);
        const cipherBuf = Buffer.concat([cipher.update(plainText || "", "utf8"), cipher.final()]);

        return Buffer.concat([
            Buffer.from([BACKEND_RANDOM_IV_VERSION]),
            Buffer.from(iv),
            cipherBuf,
        ]).toString("base64");
    } catch (error: any) {
        throw new Error("Encryption failed: " + error?.message);
    }
};
