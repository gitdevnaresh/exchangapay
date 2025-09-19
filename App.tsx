import React, { useEffect } from "react";
import { LogBox, PermissionsAndroid, Platform, StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { Auth0Provider } from "react-native-auth0";
import SplashScreen from "react-native-splash-screen";
import AppContainer from "./src/navigation/AppContainer";
import * as eva from "@eva-design/eva";
import { default as darkTheme } from "./src/constants/theme/dark.json";
import { default as lightTheme } from "./src/constants/theme/light.json";
import { default as customTheme } from "./src/constants/theme/appTheme.json";
import { ApplicationProvider, IconRegistry } from "@ui-kitten/components";
import { default as customMapping } from "./src/constants/theme/mapping.json";
import { EvaIconsPack } from "@ui-kitten/eva-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AssetsIconsPack from "./src/assets/AssetsIconsPack";
import DeviceInfo from "react-native-device-info";
import store from "./src/store";
import OnBoardingService from "./src/services/onBoardingservice";
import crashlytics from "@react-native-firebase/crashlytics";
import messaging from "@react-native-firebase/messaging";
import ForceUpdate from "./src/screens/UpdateScreens/ForceUpdate";
import { fcmNotification } from "./src/utils/FCMNotification";
import { getAllEnvData } from "./Environment";
import { initializeCrashlytics } from "./src/utils/ApiService";
import { useTokenRefresh } from "./src/hooks/useTokenRefresh";

LogBox.ignoreAllLogs(true);

console.log("App.tsx - Store imported:", typeof store);

// Safety check
if (!store) {
  console.error("Store is undefined! This will cause the app to crash.");
}

export default function App() {
  const [theme, setTheme] = React.useState<"light" | "dark">("dark");
  const [isUpdate, setIsUpdate] = React.useState<boolean>(false);
  const [isForceUpdate, setIsForceUpdate] = React.useState<boolean>(false);
  const [versionInfo, setVersionInfo] = React.useState<any>();

  useTokenRefresh();
  React.useEffect(() => {
    crashlytics().log("App mounted.");
    AsyncStorage.getItem("theme").then((value) => {
      if (value === "light" || value === "dark") setTheme(value);
    });
    initializeCrashlytics();
  }, []);

  useEffect(() => {
    checkVersionUpdate();
    fcmNotification.initiate(onNotificationAction);
    requestUserPermission();
    SplashScreen.hide();
  }, []);

  const requestUserPermission = async () => {
    PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
    }
  };

  const onNotificationAction = (notificationData: any) => {};
  useEffect(() => {
    checkAppVersion();
  }, [versionInfo]);
  const checkVersionUpdate = async () => {
    try {
      const res: any = await OnBoardingService.neoMobileVersioncheck();
      if (res.status === 200 && res.data?.jsonVersion) {
        if (typeof res.data.jsonVersion === "string") {
          setVersionInfo(JSON.parse(res.data.jsonVersion));
        } else if (typeof res.data.jsonVersion == "object") {
          setVersionInfo(res.data.jsonVersion);
        }
      }
    } catch (err) {}
  };
  const checkAppVersion = async () => {
    try {
      const versionName = DeviceInfo.getBuildNumber();
      const applicationId = DeviceInfo.getBundleId();
      let versionDetailsInfo = versionInfo;
      if (versionDetailsInfo?.Info && versionDetailsInfo?.Info?.length > 0) {
        const filterApplicant = versionDetailsInfo.Info?.filter(
          (applicant: any) => applicant.applicationId === applicationId
        );
        if (filterApplicant && filterApplicant.length > 0) {
          versionDetailsInfo = filterApplicant[0].applicationInfo;
        }
      }
      if (
        versionDetailsInfo &&
        versionDetailsInfo[
          Platform.OS === "ios" ? "iosBuildVersion" : "androidBuildVersion"
        ] > versionName
      ) {
        setIsForceUpdate(
          versionDetailsInfo[
            Platform.OS === "ios"
              ? "iosForceUpdateVersion"
              : "androidForceUpdateVersion"
          ] > versionName
        );
        setIsUpdate(true);
      }
    } catch (error) {}
  };
  const getoAuthConfig = (path: string) => {
    const envList = getAllEnvData("tst");
    return (envList.oAuthConfig as any)[path];
  };
  // Don't render if store is not available
  if (!store) {
    console.error("Cannot render app: store is undefined");
    return null;
  }

  return (
    <Auth0Provider
      domain={getoAuthConfig("issuer")}
      clientId={getoAuthConfig("clientId")}
    >
      <Provider store={store}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <IconRegistry icons={[EvaIconsPack, AssetsIconsPack]} />
            <ApplicationProvider
              {...eva}
              theme={
                theme === "light"
                  ? { ...eva.light, ...customTheme, ...lightTheme }
                  : { ...eva.dark, ...customTheme, ...darkTheme }
              }
              /* @ts-ignore */
              customMapping={customMapping}
            >
              <SafeAreaProvider>
                <StatusBar
                  barStyle={
                    // theme === "dark" ? "light-content" : "dark-content"
                    // "dark-content"
                    "light-content"
                  }
                  translucent={false}
                  backgroundColor={"#000"}
                />
                <AppContainer />
                {isUpdate && (
                  <ForceUpdate
                    show={isUpdate}
                    forceUpdate={isForceUpdate}
                    updateLatter={() => setIsUpdate(false)}
                  />
                )}
              </SafeAreaProvider>
            </ApplicationProvider>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </Provider>
    </Auth0Provider>
  );
}
