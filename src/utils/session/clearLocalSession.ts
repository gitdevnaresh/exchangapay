import Cookies from "@react-native-cookies/cookies";
import store, { persistor } from "../../store";
import { clearAllSecureEntries } from "../storage/keychainPolicy";
import { rotatePersistKey } from "../crypto/persistKey";
import { clearDecryptCache } from "../../hooks/useEncryption_Decryption";
import { clearAttestationToken, clearBiometricKeys, clearCachedAppLock } from "../../security";
import { log } from "../logger";
import { LOGOUT } from "../../redux/Actions/ActionsTypes";

interface ClearLocalSessionOptions {
    clearCookies?: boolean;
}

const attempt = async (label: string, work: () => Promise<unknown> | unknown) => {
    try {
        await work();
    } catch (error: any) {
        log.warn("[session] clear step failed; continuing", { step: label, error: error?.message });
    }
};

/**
 * Wipes everything this device holds for the signed-in user. Shared by
 * logout (useLogOut) and the splash screen's failed-restore path so both end
 * a session the same way (VAPT L-09).
 *
 * Auth0's own credential store is not cleared here: `clearCredentials` comes
 * from the `useAuth0` hook, so each caller clears it before calling this.
 * Every step is best-effort; one failing never stops the rest.
 */
export const clearLocalSession = async (options?: ClearLocalSessionOptions): Promise<void> => {
    const { clearCookies = true } = options || {};

    // Drop memoized plaintext so decrypted PII does not outlive the session
    clearDecryptCache();
    // The attestation token belongs to this session, not the next user.
    clearAttestationToken();
    // Clears every Keychain service listed in keychainPolicy.ts.
    await attempt("secureEntries", clearAllSecureEntries);
    await attempt("persistPurge", () => persistor.purge());
    // Rotate after the purge so any leftover copy becomes unreadable.
    await attempt("persistKey", rotatePersistKey);
    // The biometric key pair must not carry over to the next user.
    await attempt("biometricKeys", clearBiometricKeys);
    // The app-open lock is a per-account setting.
    await attempt("appLockCache", clearCachedAppLock);

    if (clearCookies) {
        await attempt("cookies", () => Cookies.clearAll());
        await attempt("webkitCookies", () => Cookies.clearAll(true));
    }

    // Reset every Redux slice to its initial state (store/index.tsx rootReducer),
    // not just the login flag and userInfo: member profile, personal info,
    // transfer and beneficiary details all live in memory until this runs.
    store.dispatch({ type: LOGOUT });
};
