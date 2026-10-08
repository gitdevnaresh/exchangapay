import { useEffect, useState } from "react";
import AuthService from "../services/auth";
import { useDispatch } from "react-redux";
import DeviceInfo from "react-native-device-info";
import { post } from "../utils/ApiService";
import {
  CommonActions,
  useNavigation,
  useNavigationState,
} from "@react-navigation/native";
import { isLogin, setUserInfo } from "../redux/Actions/UserActions";
import { reportSessionExpired } from "../utils/helpers";
import crashlytics from "@react-native-firebase/crashlytics";
import messaging from "@react-native-firebase/messaging";
import { log } from "../utils/logger";
import useChekBio from "./useCheckBio";
import { KEYCHAIN_SERVICES, writeSecret } from "../utils/storage/keychainPolicy";

interface GetMemDetailsParams {
  isNewLogin?: boolean;
  fcmTken?: string | null;
  isSplashScreen?: boolean;
  handleSetLoading?: (value: boolean) => void;
  isReferralRequired?: boolean;
  isReferralMandatory?: boolean;
}

const useMemberLogin = () => {
  const [memberLoader, setLoading] = useState(false);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const { isLoading } = useChekBio();
  const currentRouteName = useNavigationState((state) => {
    const route = state.routes[state.index];
    return route.name;
  });

  // Splash reads the token asynchronously, so the one it passes can still be
  // empty; ask Firebase directly rather than registering nothing. The server
  // ignores a token it already has, so calling this on every launch is safe.
  const updateFcmToken = async (fcmToken?: any) => {
    try {
      const token = fcmToken || (await messaging().getToken());
      if (!token) return;
      await post(`/api/v1/Notification/SaveUserToken`, { token });
    } catch (error) {
      log.warn("[FCM] could not register push token");
    }
  };
  const loginLogData = async (data: any) => {
    const ip = await DeviceInfo.getIpAddress();
    const deviceName = await DeviceInfo.getDeviceName();
    const obj = {
      id: "",
      state: "",
      countryName: "",
      ipAddress: ip,
      info: `{brand:${DeviceInfo.getBrand()},deviceName:${deviceName},model: ${DeviceInfo.getDeviceId()}}`,
    };

    const actionRes = await AuthService.loginLog(obj);
  };
  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  const getMemDetails = async (
    userInfo?: GetMemDetailsParams,
    IsCheckBio?: boolean,
    isOnlyMember?: boolean
  ) => {
    try {
      setLoading(true);
      const userLoginInfo: any = await AuthService.getMemberInfo();
      const userDetails = userLoginInfo?.data;
      if (userLoginInfo?.status === 200) {
        // M-07: only the identifiers crash reporting needs reach the Keychain
        // (apiInterceptors getUserInfo). The full record carries `sk`, the
        // key for the user's field-encrypted PII; it stays in memory (Redux,
        // stripped from persistence) and is re-fetched here on every launch.
        // Overwriting the entry also drops the full record older builds wrote.
        await writeSecret(
          KEYCHAIN_SERVICES.USER_INFO,
          "userInfo",
          JSON.stringify({ id: userDetails?.id, userId: userDetails?.userId })
        );
        dispatch(setUserInfo(userDetails));
        if (isOnlyMember) {
          return;
        }
        dispatch(isLogin(true));
        if (userInfo?.isNewLogin) {
          loginLogData(userLoginInfo.data);
        }
        // Restored sessions too: after an iOS reinstall the Keychain session
        // survives but Firebase issues a new token the server has never seen.
        if (userInfo?.isSplashScreen) {
          updateFcmToken(userInfo?.fcmTken);
        }
        if (userDetails?.role !== "Customer") {
          return navigation.dispatch(
            CommonActions.reset({
              index: 1,
              routes: [{ name: "actionRestricted" }],
            })
          );
        }
        if (userDetails?.customerState?.toLowerCase() === "suspected fraud") {
          return (navigation.dispatch(
            CommonActions.reset({
              index: 1,
              routes: [{ name: "suspectedFraud" }],
            })
          ));

        }
        if (!userDetails?.isEmailVerified) {
          if (currentRouteName !== "VerifyEmail") {
            navigation.dispatch(
              CommonActions.reset({
                index: 1,
                routes: [{ name: "VerifyEmail" }],
              })
            );
          }
        } else if (
          !userDetails?.isPhoneNumberVerified &&
          userDetails?.isPhoneNumberverfiyWhileSignup
        ) {
          return navigation.dispatch(
            CommonActions.reset({
              index: 1,
              routes: [{ name: "phoneOtpVerification" }],
            })
          );
        } else if (
          !userDetails?.isCustomerReferralCode &&
          userDetails?.isReferralRequiredOrNot
        ) {
          navigation.dispatch(
            CommonActions.reset({
              index: 1,
              routes: [
                {
                  name: "rigistrationreferral",
                  params: {
                    isReferralMandatory: userInfo?.isReferralMandatory,
                  },
                },
              ],
            })
          );
        } else if (
          userDetails?.customerKycRequiredorNot &&
          !userDetails?.isKYC &&
          userDetails.isSumsubKyc
        ) {
          if (
            currentRouteName !== "sumsubCompnent" &&
            currentRouteName !== "underReview"
          ) {
            return navigation.dispatch(
              CommonActions.reset({
                index: 1,
                routes: [{ name: "sumsubCompnent" }],
              })
            );
          }
        } else if (
          userDetails?.customerKycRequiredorNot &&
          !userDetails?.isKYC &&
          !userDetails?.isSumsubKyc
        ) {
          navigation.navigate("addKycInfomation", {
            isKycUpdated: false,
            screenName: "splash_Screen",
          });
        } else if (
          userDetails?.isKYC &&
          !userDetails?.isSumsubKyc &&
          userDetails.customerState !== "Approved"
        ) {
          if (currentRouteName !== "underReview") {
            navigation.dispatch(
              CommonActions.reset({
                index: 1,
                routes: [{ name: "underReview" }],
              })
            );
          }
        } else {
          if (!IsCheckBio) {
            navigation.dispatch(
              CommonActions.reset({
                index: 1,
                routes: [{ name: "Dashboard" }],
              })
            );
          } else {
            setIsOnboarding(true);
          }
        }
      } else if (userLoginInfo?.status === 401) {
        reportSessionExpired();
        return;
      } else {
        navigation.navigate("SomethingWentWrong");
      }
    } catch (error: any) {
      crashlytics().recordError(error);
      navigation?.navigate("SomethingWentWrong");
      setLoading(false);
    }
  };

  return { memberLoader, getMemDetails, isOnboarding };
};

export default useMemberLogin;
