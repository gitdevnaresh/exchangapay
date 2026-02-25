import { SecureStorage } from '../../utils/secureStorage';
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";
import { getAllEnvData } from "../../../Environment";
import { getTabsConfigation } from '../../../configuration';
import { useAuth0 } from "react-native-auth0";
import { useDispatch } from "react-redux";
import { clearCardsDashboard, clearExchangeDashboard, clearWalletsDashboard, isLogin, loginAction, setAllBalanceInfo, setBankDashboardDetails, setDeleteScreenPermissions, setHomeDashboardCards, setHomeWallets, setNotificationShown, setPaymentsDashboard, setUserInfo, setUserProfileDetails, setNoticesShownThisSession } from "../../redux/actions/actions";
import Keychain from 'react-native-keychain';
import { CommonActions, useNavigation } from "@react-navigation/native";
import { useNoticesManager } from "../notifications/useNoticesManager";


const useLogout = () => {
  const { clearSession } = useAuth0();
  const Configuration = getTabsConfigation('IDENITY_CONFIG');
  const geAuthConfig = (path: string) => {
    const envList: any = getAllEnvData();
    return envList?.oAuthConfig[path]
  }
  const issuerUrl = geAuthConfig('issuer');
  const redirectUri = geAuthConfig('redirect_uri');
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { resetNoticesState } = useNoticesManager();
  
  const logout = async (isAuth0SdkLogin?: boolean, navigationPath?: string) => {
    // Reset notices state on logout
    resetNoticesState();
    dispatch(setNoticesShownThisSession(false));
    
    dispatch(setUserProfileDetails({}));
    dispatch(setDeleteScreenPermissions({}));
    dispatch(clearWalletsDashboard());
    dispatch(clearExchangeDashboard());
    dispatch(setBankDashboardDetails({ createAccDetails: [], totalBalance: "" }))
    // Clear Cards Dashboard Redux data using clearCardsDashboard action
    dispatch(clearCardsDashboard());
    dispatch(setBankDashboardDetails({ createAccDetails: [], totalBalance: "" }));
    dispatch(setPaymentsDashboard({ recentPaymentLinksData: [], payoutBalance: {}, cryptoData: {}, kpiData: [] }));
    dispatch(setAllBalanceInfo(0));
    dispatch(setHomeDashboardCards({ myCards: [] }));
    dispatch(setHomeWallets([]));
    dispatch(setNotificationShown(false));
    if (Configuration.AUTH0_SDK_LOGIN) {
      await clearSession();
      dispatch(setUserInfo(""));
      dispatch(isLogin(false));
      await Keychain.resetGenericPassword({ service: 'authTokens' });
      dispatch(loginAction(null));
      setTimeout(() => {
        navigation.dispatch(
          CommonActions.reset({
            index: 1,
            routes: [{ name: navigationPath || "SplaceScreenW2", params: { isAuth0SdkLogin } }],
          })
        );
      }, 800);
      return;
    }
    if (Configuration.ID_SERVER) {
      try {
        const logoutUrl = `${issuerUrl}/connect/endsession?` +
          `id_token_hint=${await SecureStorage.getSecureItem("Token")}` +
          `&post_logout_redirect_uri=${redirectUri}`;

        SecureStorage.setSecureItem("Token", '');

        if (Platform.OS === "web") {
          window.location.href = logoutUrl;
        } else {
          await WebBrowser.openAuthSessionAsync(logoutUrl, redirectUri);
          return;
        }
      } catch (error) {
        return;
      }

    }
    if (Configuration.AUTH0) {
      dispatch(setUserInfo(""));
      dispatch(isLogin(false));
      // await logout();
      await Keychain.resetGenericPassword({ service: 'authTokens' });
      dispatch(loginAction(null));
      setTimeout(() => {
        if (navigationPath) {
          navigation.navigate(navigationPath);
        } else {
          navigation.dispatch(
            CommonActions.reset({
              index: 1,
              routes: [{ name: "SplaceScreenW2", params: { isAuth0SdkLogin } }],
            })
          );
        }
      }, 800);
    }
    return;
  };

  return { logout };
};

export default useLogout;
