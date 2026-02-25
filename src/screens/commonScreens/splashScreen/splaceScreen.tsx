import * as React from "react";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { getThemedCommonStyles } from "../../../components/CommonStyles";
import useMemberLogin from "../../../hooks/userInfoHook";
import ViewComponent from "../../../components/view/view";
import ButtonComponent from "../../../components/buttons/button";
import { useThemeColors } from "../../../hooks/themedHook/useThemeColors";
import CardLogoComponent from "../../../components/arthacardlogo/cardlogo";
import TextMultiLangauge from "../../../components/textComponets/multiLanguageText/textMultiLangauge";
import { ActivityIndicator, Dimensions, StyleSheet, useColorScheme } from "react-native";
import AuthService from "../../../apiServices/onBoarding/auth";
import { isCustodial, loginAction, setAllBalanceInfo, setBankDashboardDetails, setDeleteScreenPermissions, setHomeDashboardCards, setHomeWallets, setMenuItems, setPaymentsDashboard, setScreenPermissions, setUserProfileDetails } from "../../../redux/actions/actions";
import { GetStartedImage } from "../../../assets/svg";
import { useIsDarkTheme } from "../../../hooks/themedHook";
import { useAuth0 } from "react-native-auth0";
import { getAllEnvData } from "../../../../Environment";
import { storeToken } from "../../../apiServices/onBoarding/auth0Service";
import SafeAreaViewComponent from "../../../components/safeArea/safeArea";
import { s } from "../../../constants/styels/scale";
import useNotifications from "../../../hooks/notifications/useNotification";
import ProfileService from "../../../apiServices/profile";
import { Logger } from '../../../utils/Logger';
import { getTabsConfigation } from "../../../../cofiguration";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const SplaceScreen = React.memo((props: any) => {
  const isFocused = useIsFocused();
  const userinfo = useSelector((state: any) => state.userReducer?.userDetails);
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const { getMemDetails, isOnboarding } = useMemberLogin();
  const { authorize, getCredentials, user } = useAuth0();
  const [loading, setLoading] = React.useState(false);
  const dispatch = useDispatch<any>();
  const navigation = useNavigation<any>();
  const isDarkTheme = useIsDarkTheme();
  const appThemeSetting = useSelector((state: any) => state.userReducer?.appTheme);
  const colorScheme = useColorScheme();

  const isUserLogin = user !== undefined && user !== null;
  const identityConfig = getTabsConfigation("IDENITY_CONFIG");
  React.useEffect(() => {
    if (identityConfig.AUTH0) {
      if (userinfo && userinfo != null) {
        getMemDetails(false, undefined, true);
        MenuPermission();
      }
    }

  }, [userinfo, isFocused]);
  React.useEffect(() => {
    if (identityConfig.AUTH0_SDK_LOGIN) {
      if (isUserLogin) {
        setInfo();
      }
    }
  }, [isUserLogin, isFocused]);
  React.useEffect(() => {
    if (identityConfig.AUTH0_SDK_LOGIN && props?.route?.params?.isAuth0SdkLogin) {
      handleLoginWithSdk()
    }
  }, [isFocused])
  const {
    fcmToken,
  } = useNotifications({
    isAuthenticated: true, // Pass your auth state
    onNotificationPress: (data) => {
      // Handle when user taps notification
    }
  });


  const getNotificationPermission = async () => {
    try {
      const object = { value: fcmToken }
      await ProfileService.postPushNotification(object);
    } catch (error) {
      Logger.error("Error getting FCM token:", error);
    }
  };

  const getoAuthConfig = (path: string) => {
    const envList = getAllEnvData();
    return envList.oAuthConfig[path];
  }
  const handleLoginWithSdk = async () => {
    dispatch(loginAction(""));
    dispatch(isCustodial(true));
    setLoading(true);
    try {
      await authorize({
        scope: getoAuthConfig('scope'),
        audience: getoAuthConfig('audience'),
      })
    } catch (e) {

    }
    setLoading(false);
  };

  const handleSignUpWithSdk = async () => {
    setLoading(true);
    try {
      dispatch(loginAction(""));
      await authorize({
        scope: getoAuthConfig('scope'),
        audience: getoAuthConfig('audience'),
        additionalParameters: { screen_hint: 'signup' }
      })
    } catch (e) {

    }
    setLoading(false);
  };

  const setInfo = async () => {
    setLoading(true);
    try {
      const res = await getCredentials();
      if (res && res.accessToken) {
        await storeToken(res.accessToken, res.refreshToken || '');
        getMemDetails(false, undefined, true);
        MenuPermission();
        getNotificationPermission();
      } else {
      }
      setLoading(false);
    } catch (err: any) {
      dispatch(loginAction(""));
      setLoading(false);
    }
  };

  const clearAllRecucerData = () => {
    dispatch(setUserProfileDetails(null));
    dispatch(setAllBalanceInfo(0));
    dispatch(setHomeDashboardCards({ myCards: [] }));
    dispatch(setHomeWallets([]));
    dispatch(setBankDashboardDetails({ createAccDetails: [], totalBalance: "" }));
    dispatch(setPaymentsDashboard({ recentPaymentLinksData: [], payoutBalance: {}, cryptoData: {}, kpiData: [] }));
  };

  const handleLogin = () => {
    clearAllRecucerData();
    if (identityConfig.AUTH0_SDK_LOGIN) {
      handleLoginWithSdk();
    } else {
      navigation?.navigate("Auth0Signin");

    }

  };

  const onSignupPress = () => {
    clearAllRecucerData();
    if (identityConfig.AUTH0_SDK_LOGIN) {
      handleSignUpWithSdk();
    } else {
      navigation?.navigate("Auth0Signup");
    }
  };



  const MenuPermission = () => {
    AuthService.getMenuItems()
      .then((res: any) => {
        if (res?.data?.length > 0) {
          dispatch(setMenuItems(res?.data));
          dispatch(setDeleteScreenPermissions({}));
        }
      })
      .catch(() => { });
  };

  // Optional background selection logic (you can still use this with ImageBackground if needed)
  let backgroundSource;
  if (appThemeSetting !== "system") {
    backgroundSource =
      appThemeSetting === "dark"
        ? require("../../../assets/images/registration/fastdarkbg.png")
        : require("../../../assets/images/registration/fastlight.png");
  } else {
    backgroundSource =
      colorScheme === "dark"
        ? require("../../../assets/images/registration/fastdarkbg.png")
        : require("../../../assets/images/registration/fastlight.png");
  }

  // Dynamic image sizing so it doesn't push buttons off-screen
  const IMAGE_MAX_HEIGHT = SCREEN_HEIGHT * 0.35; // 35% of screen height
  const IMAGE_MAX_WIDTH = SCREEN_WIDTH - s(48);   // leave some horizontal padding
  const { width, height } = Dimensions.get("window");
  return (
    <SafeAreaViewComponent
      style={[commonStyles.screenBg,]}
    >
      <ViewComponent
        style={[
          commonStyles.mxAuto,
          commonStyles.mt32,
          commonStyles.sectionGap,
        ]}
      >
        <CardLogoComponent />
      </ViewComponent>
      <ViewComponent style={[commonStyles.flex1, commonStyles.justifyContent, commonStyles.sectionGap]}>
        <ViewComponent>
          <ViewComponent
            style={[{
              width: width * 0.9,
              height: height * 0.46,
            },]}
          >
            {isDarkTheme ? (
              <GetStartedImage width="120%" height="100%" />
            ) : (
              <GetStartedImage width="100%" height="100%" />
            )}
          </ViewComponent>
          <ViewComponent style={[commonStyles.px24,]}>

            <TextMultiLangauge
              text="GLOBAL_CONSTANTS.THE_MOST_TRUSTED_WAY_BUILD"
              style={[
                commonStyles.textWhite,
                commonStyles.fs30,
                commonStyles.fw600,
                commonStyles.mb8
              ]}
            />
            <TextMultiLangauge
              text="GLOBAL_CONSTANTS.Manage_YOUR_MONEY_WITH"
              style={[
                commonStyles.textlinkgrey,
                commonStyles.fs16,
                commonStyles.fw600,
              ]}
            />
          </ViewComponent>
        </ViewComponent>
        {!(isOnboarding || loading) && <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.sectionGap]}>
          <ViewComponent style={[commonStyles.px24, commonStyles.flex1]}>
            <ButtonComponent
              title={"GLOBAL_CONSTANTS.LOGIN"}
              customTitleStyle={{ color: NEW_COLOR.TEXT_BLACK }}
              customButtonStyle={{ backgroundColor: NEW_COLOR.TEXT_WHITE }}
              onPress={handleLogin}
            />
          </ViewComponent>
          <ViewComponent style={[commonStyles.px24, commonStyles.flex1]}>
            <ButtonComponent
              title={"GLOBAL_CONSTANTS.REGISTER_NOW"}
              onPress={onSignupPress}
              solidBackground={true}
            />
          </ViewComponent>
        </ViewComponent>}

        {(isOnboarding || loading) && <ViewComponent><ActivityIndicator size={"large"} color={NEW_COLOR.BUTTON_BG} /></ViewComponent>}



      </ViewComponent>
    </SafeAreaViewComponent>

  );
});

export default SplaceScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "space-between", // top & bottom sections
  },
  topSection: {
    paddingBottom: s(16),
  },
  imageWrapper: {
    marginTop: s(16),
    marginBottom: s(8),
    alignItems: "center",
    justifyContent: "center",
  },
  bottomSection: {
    paddingBottom: s(80), // some bottom spacing for safe area / tab bar
  },
});