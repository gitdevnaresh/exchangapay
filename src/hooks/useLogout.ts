import AsyncStorage from "@react-native-async-storage/async-storage";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";
import { getAllEnvData } from "../../Environment";
import { getTabsConfigation } from "../../configuration";
import { useAuth0 } from "react-native-auth0";


const useLogout = () => {
  const { clearSession } = useAuth0();
  const Configuration = getTabsConfigation('IDENITY_CONFIG');
  const geAuthConfig = (path: string) => {
    const envList: any = getAllEnvData();
    return envList?.oAuthConfig[path]
  }
  const issuerUrl = geAuthConfig('issuer');
  const redirectUri = geAuthConfig('redirect_uri');
  const logout = async () => {
    if (Configuration.AUTH0) {
      await clearSession()
    }
    if (Configuration.ID_SERVER) {
      try {
        const logoutUrl = `${issuerUrl}/connect/endsession?` +
          `id_token_hint=${await AsyncStorage.getItem("Token")}` +
          `&post_logout_redirect_uri=${redirectUri}`;

        AsyncStorage.setItem("Token", '');

        if (Platform.OS === "web") {
          window.location.href = logoutUrl;
        } else {
          await WebBrowser.openAuthSessionAsync(logoutUrl, redirectUri);
        }
      } catch (error) {
        // console.error("Logout Error:", error);
      }
    }
  };

  return { logout };
};

export default useLogout;
