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
import OnBoardingService from "../services/onBoardingservice";
import { clearDecryptCache } from "./useEncryption_Decryption";
import { clearAttestationToken } from "../security";
import { persistor } from "../store";
import { rotatePersistKey } from "../utils/crypto/persistKey";


interface LogoutOptions {
    clearCookies?: boolean;
}

const useLogout = () => {
    const dispatch = useDispatch();
    const { clearSession } = useAuth0();
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
        if (clearCookies) {
            await Cookies.clearAll();
        };
        // Drop memoized plaintext so decrypted PII does not outlive the session
        clearDecryptCache();
        // H-04: the attestation token is bound to this device/session, not to
        // whoever signs in next.
        clearAttestationToken();
        // Clear Redux state
        dispatch(setUserInfo(""));
        dispatch(isLogin(false));
        await clearSession();
        const response = await OnBoardingService.updateFcmToken();
        if (userInfo) {
            await logOutLogData();
        }
        // H-05 / H-11: logout previously reset two Keychain services and left
        // the rest behind, so the member record, the persisted state blob, its
        // encryption key and the chat identifiers all survived sign-out and
        // lived on until the next login happened to overwrite them. One call,
        // driven by the inventory in keychainPolicy.ts, so a service added
        // later is cleared without anyone remembering to come back here.
        await clearAllSecureEntries();
        await persistor.purge();
        // Rotate after the purge: if the purge is interrupted, or a copy of the
        // blob survives in a backup or a forensic image, the leftovers become
        // unreadable rather than merely deleted.
        await rotatePersistKey();
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: DRAWER_CONSTATNTS.SPLASH_SCREEN }],
            })
        );
        fcmNotification.unRegister();
    };

    return { logout };
};

export default useLogout;
