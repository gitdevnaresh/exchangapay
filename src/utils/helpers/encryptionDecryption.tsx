/**
 * At-rest encryption for the redux-persist transform.
 *
 * The scheme itself lives in `src/utils/crypto/aes.ts` — this file used to carry
 * a second copy of it, which is what H-06 flagged. All that is left here is the
 * two things that are genuinely local: the key arrives as an argument (the
 * transform runs outside React, so there is no Redux to read it from) and a
 * failure throws rather than returning an empty string, because the transform
 * needs to distinguish "could not decrypt" from "decrypted to nothing".
 *
 * This path writes AES-GCM (format 0x02). Persisted state never leaves the
 * device, so there is no backend to coordinate with and no reason to keep
 * writing unauthenticated CBC here. Reads still accept every older format.
 */

import { AT_REST_USES_AEAD } from "../crypto/policy";
import { decryptAny, encryptCBC, encryptGCM } from "../crypto/aes";

export const decryptAES = (cipherText: string, secretKey: string): string => {
    try {
        if (!cipherText || !secretKey) return "";
        return decryptAny(cipherText, secretKey);
    } catch (error: any) {
        throw new Error("Decryption failed: " + error?.message);
    }
};

export const encryptAES = (plainText: string, secretKey: string): string => {
    try {
        return AT_REST_USES_AEAD
            ? encryptGCM(plainText, secretKey)
            : encryptCBC(plainText, secretKey);
    } catch (error: any) {
        throw new Error("Encryption failed: " + error?.message);
    }
};
