import { useDispatch, useSelector } from "react-redux";
import { useAuth0 } from "react-native-auth0";
import { useNavigation, CommonActions } from "@react-navigation/native";
import DeviceInfo from "react-native-device-info";
import Cookies from '@react-native-cookies/cookies';
import { isLogin, loginAction, setUserInfo } from "../redux/Actions/UserActions";
import AuthService from "../services/auth";
import { fcmNotification } from "../utils/FCMNotification";
import { DRAWER_CONSTATNTS } from "../screens/AccountDashboard/constants";
import * as Keychain from "react-native-keychain";
import OnBoardingService from "../services/onBoardingservice";


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
        // Clear Redux state
        dispatch(setUserInfo(""));
        dispatch(isLogin(false));
        dispatch(loginAction(""));
        await clearSession();
        const response = await OnBoardingService.updateFcmToken();
        if (userInfo) {
            await logOutLogData();
        }
        await Keychain.resetGenericPassword({ service: 'chat_conversation_Id' });
        await Keychain.resetGenericPassword({ service: "authTokenService" });
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
