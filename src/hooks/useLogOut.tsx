import { useDispatch, useSelector } from "react-redux";
import { useAuth0 } from "react-native-auth0";
import { useNavigation, CommonActions } from "@react-navigation/native";
import DeviceInfo from "react-native-device-info";
import Cookies from '@react-native-cookies/cookies';
import { isLogin, setUserInfo } from "../redux/Actions/UserActions";
import AuthService from "../services/auth";
import { fcmNotification } from "../utils/FCMNotification";
import { DRAWER_CONSTATNTS } from "../screens/AccountDashboard/constants";
import { clearAllSecureEntries } from "../utils/storage/keychainPolicy";
import { readRefreshToken } from "../utils/storage/authTokens";
import OnBoardingService from "../services/onBoardingService";
import { clearDecryptCache } from "./useEncryption_Decryption";
import { clearAttestationToken, clearBiometricKeys, clearCachedAppLock } from "../security";
import { persistor } from "../store";
import { rotatePersistKey } from "../utils/crypto/persistKey";
import { log } from "../utils/logger";


interface LogoutOptions {
    clearCookies?: boolean;
}

const LOGOUT_NETWORK_TIMEOUT_MS = 5000;

const withTimeout = <T,>(promise: Promise<T>, ms = LOGOUT_NETWORK_TIMEOUT_MS): Promise<T> =>
    new Promise<T>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("timeout")), ms);
        promise.then(
            value => { clearTimeout(timer); resolve(value); },
            error => { clearTimeout(timer); reject(error); },
        );
    });

const attempt = async (label: string, work: () => Promise<unknown> | unknown) => {
    try {
        await work();
    } catch (error: any) {
        log.warn("[logout] step failed; continuing", { step: label, error: error?.message });
    }
};

const useLogout = () => {
    const dispatch = useDispatch();
    const { clearCredentials, revokeRefreshToken } = useAuth0();
    const navigation = useNavigation<any>();
    const { userInfo } = useSelector((state: any) => state.UserReducer);

    const logOutLogData = async () => {
        const ip = await DeviceInfo.getIpAddress();
        const deviceName = await DeviceInfo.getDeviceName();
        const obj = {
            "id": "",
            "state": "",
            "countryName": "",
            "ipAddress": ip,
            "info": `{brand:${DeviceInfo.getBrand()},deviceName:${deviceName},model: ${DeviceInfo.getDeviceId()}}`
        };
        await AuthService.logOutLog(obj);
    };

    const logout = async (options?: LogoutOptions) => {
        const { clearCookies = true } = options || {};
        try {
            await attempt("fcmToken", () => withTimeout(OnBoardingService.updateFcmToken()));
            if (userInfo) {
                await attempt("logoutLog", () => withTimeout(logOutLogData()));
            }
            await attempt("revokeRefreshToken", async () => {
                const { status, value } = await readRefreshToken();
                if (status === "ok" && value) {
                    await withTimeout(revokeRefreshToken({ refreshToken: value }));
                }
            });
        } finally {
            // Drop memoized plaintext so decrypted PII does not outlive the session
            clearDecryptCache();
            // The attestation token belongs to this session, not the next user.
            clearAttestationToken();
            await attempt("auth0Credentials", clearCredentials);
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

            // Clear Redux state
            dispatch(setUserInfo(""));
            dispatch(isLogin(false));
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: DRAWER_CONSTATNTS.SPLASH_SCREEN }],
                })
            );
            await attempt("fcmUnregister", () => fcmNotification.unRegister());
        }
    };

    return { logout };
};

export default useLogout;
