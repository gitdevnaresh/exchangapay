import { Platform } from "react-native";
import { useSelector } from "react-redux";
import { useAuth0 } from "react-native-auth0";
import { useNavigation, CommonActions } from "@react-navigation/native";
import DeviceInfo from "react-native-device-info";
import AuthService from "../services/auth";
import { fcmNotification } from "../utils/FCMNotification";
import { DRAWER_CONSTATNTS } from "../screens/AccountDashboard/constants";
import { readRefreshToken } from "../utils/storage/authTokens";
import OnBoardingService from "../services/onBoardingService";
import { clearLocalSession } from "../utils/session/clearLocalSession";
import { log } from "../utils/logger";
import { suspendTokenRefresh, resumeTokenRefresh } from "../utils/helpers";


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

// One logout at a time, app-wide. Repeated taps (or two screens calling it)
// share the in-flight run instead of each wiping the session and resetting
// to Splash again. Module-level so every useLogout() instance sees it.
let logoutInFlight: Promise<void> | null = null;

const useLogout = () => {
    const { clearCredentials, clearSession, revokeRefreshToken } = useAuth0();
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

    const logout = (options?: LogoutOptions): Promise<void> => {
        if (!logoutInFlight) {
            logoutInFlight = runLogout(options).finally(() => {
                logoutInFlight = null;
            });
        }
        return logoutInFlight;
    };

    const runLogout = async (options?: LogoutOptions) => {
        const { clearCookies = true } = options || {};
        try {
            // L-02: first, so a refresh racing logout neither revokes-then-restores
            // the session nor leaves the rotated refresh token un-revoked.
            await attempt("suspendTokenRefresh", () => suspendTokenRefresh());
            await attempt("fcmToken", () => withTimeout(OnBoardingService.updateFcmToken()));
            if (userInfo) {
                await attempt("logoutLog", () => withTimeout(logOutLogData()));
            }
            await attempt("revokeRefreshToken", async () => {
                const { status, value } = await readRefreshToken();
                if (status !== "ok" || !value) return;
                try {
                    await withTimeout(revokeRefreshToken({ refreshToken: value }));
                } catch {
                    try {
                        await withTimeout(revokeRefreshToken({ refreshToken: value }));
                    } catch (error) {
                        log.error("[logout] refresh token could not be revoked; it stays valid at Auth0 until it expires", error);
                    }
                }
            });
        } finally {
            await attempt("auth0Credentials", clearCredentials);
            // Keychain, persisted state, caches, keys, cookies, and every Redux
            // slice — the same wipe the splash screen runs (L-09).
            try {
                await clearLocalSession({ clearCookies });
            } finally {
                // Never leave refresh suspended, or the next login could not refresh.
                resumeTokenRefresh();
            }
            // Before the reset: Splash reads the FCM token on mount, and if the
            // delete has not landed yet it reads the old one, which the next
            // login registers and Firebase then rejects — no pushes until reinstall.
            await attempt("fcmUnregister", () => withTimeout(fcmNotification.unRegister()));
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: DRAWER_CONSTATNTS.SPLASH_SCREEN }],
                })
            );
            // L-03: clearSession opens a browser tab on Android. Run it only after
            // the reset, so the tab closes back onto Splash instead of the screen
            // that started logout (which then flashed before Splash).
            if (Platform.OS === "android") {
                await attempt("auth0BrowserSession", () => clearSession());
            }
        }
    };

    return { logout };
};

export default useLogout;
