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
            await attempt("auth0Credentials", clearCredentials);
            // Keychain, persisted state, caches, keys, cookies, and every Redux
            // slice — the same wipe the splash screen runs (L-09).
            await clearLocalSession({ clearCookies });
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
