import React, { useEffect } from "react";
import {
  AppState,
  
  PermissionsAndroid,
  Platform,
  StatusBar,
  View,
  ActivityIndicator,
} from "react-native";
import type { AppStateStatus } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { Auth0Provider } from "react-native-auth0";
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
import store, { persistor, startPersistence } from "./src/store";
import OnBoardingService from "./src/services/onBoardingService";
import crashlytics from "@react-native-firebase/crashlytics";
import messaging from "@react-native-firebase/messaging";
import ForceUpdate from "./src/screens/UpdateScreens/ForceUpdate";
import { fcmNotification } from "./src/utils/FCMNotification";
import { getAllEnvData } from "./Environment";
import {
  buildSentryOptions,
  initializeTelemetry,
  isSentryEnabled,
} from "./src/utils/telemetry";
import { log } from "./src/utils/logger";
import { useTokenRefresh } from "./src/hooks/useTokenRefresh";
import RNBootSplash from "react-native-bootsplash";
import {
  initializeDeviceIntegrity,
  refreshDeviceIntegrity,
  reportPinExpiry,
} from "./src/security";
import { cleanupLegacyTokenStorage } from "./src/utils/storage/storagePolicy";

import * as Sentry from "@sentry/react-native";
import { version as appVersion } from './package.json';

const releaseName = `${DeviceInfo.getBundleId()}@${appVersion}+${DeviceInfo.getBuildNumber()}`;

// Safety check
if (!store) {
  log.error("Store is undefined! This will cause the app to crash.");
}

export default Sentry.wrap(function App() {
  const [sentryConfig, setSentryConfig] = React.useState<any>(null);
  const sentryInitialized = React.useRef(false);

  React.useEffect(() => {
    try {
      const envData = getAllEnvData();
      setSentryConfig(envData.sentry);
    } catch (error) {
      log.error("Failed to load environment config", error);
    }
  }, []);

  React.useEffect(() => {
    if (sentryConfig && !sentryInitialized.current && isSentryEnabled(sentryConfig)) {
      Sentry.init(
        buildSentryOptions(sentryConfig, releaseName, [
          Sentry.feedbackIntegration(),
        ])
      );
      sentryInitialized.current = true;
    }
  }, [sentryConfig]);
  const [theme, setTheme] = React.useState<"light" | "dark">("dark");
  const [isUpdate, setIsUpdate] = React.useState<boolean>(false);
  const [isForceUpdate, setIsForceUpdate] = React.useState<boolean>(false);
  const [versionInfo, setVersionInfo] = React.useState<any>();

  useTokenRefresh();
  React.useEffect(() => {
    try {
      crashlytics().log("App mounted.");
      AsyncStorage.getItem("theme")
        .then((value) => {
          if (value === "light" || value === "dark") setTheme(value);
        })
        .catch((error) => {
          log.error("Error getting theme", error);
        });
      // H-08: loads the stored consent decision and applies it to Sentry and
      // Crashlytics together. Until it resolves, getTelemetryConsentSync() is
      // false and events are dropped — startup errors are not sent optimistically.
      initializeTelemetry();
      // M-03: pin expiry telemetry. The dates used to be hardcoded here, a
      // fourth copy of two dates that also live in the Android pin-set, the iOS
      // Info.plist and the iOS build phase. They now come from
      // security/pinning-policy.json via src/security/pinExpiry.ts, which also
      // explains why the two platforms carry different dates.
      reportPinExpiry();
      // H-05: load the at-rest key, then let redux-persist rehydrate. Unlike
      // the integrity probe below this one DOES gate rendering — PersistGate
      // holds its loading component until it resolves — because rehydrating
      // before the key exists would discard the stored state as undecryptable.
      startPersistence();
      // H-07: erase the tokens and encryption key that a previous build's
      // AsyncStorage token store may have left in plaintext on this device.
      // Deleting the code does not delete what it already wrote.
      cleanupLegacyTokenStorage();
      // H-04: fire-and-forget. Bounded internally and fails open, so it never
      // delays the splash screen or gates rendering on a filesystem probe.
      initializeDeviceIntegrity();
    } catch (error) {
      log.error("Error in app initialization", error);
    }
  }, []);

  // A device can be rooted between sessions, so a launch-time verdict goes stale.
  // Re-check on foreground; the result only ever reaches high-risk operations.
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState: AppStateStatus) => {
      if (nextState === "active") {
        refreshDeviceIntegrity();
      }
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    checkVersionUpdate();
    fcmNotification.initiate(onNotificationAction);
    requestUserPermission();
    RNBootSplash.hide({ fade: true });
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

  const onNotificationAction = (notificationData: any) => { };
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
    } catch (err) {
      log.error("[L-02] checkVersionUpdate failed", err);
    }
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
      const currentBuild = parseInt(versionName, 10);
      const platformKey = Platform.OS === "ios" ? "iosBuildVersion" : "androidBuildVersion";
      const forceKey = Platform.OS === "ios" ? "iosForceUpdateVersion" : "androidForceUpdateVersion";
      const remoteBuild = parseInt(versionDetailsInfo?.[platformKey], 10);
      const forceUpdateBuild = parseInt(versionDetailsInfo?.[forceKey], 10);

      if (versionDetailsInfo && !isNaN(remoteBuild) && remoteBuild > currentBuild) {
        setIsForceUpdate(!isNaN(forceUpdateBuild) && forceUpdateBuild > currentBuild);
        setIsUpdate(true);
      }
    } catch (error) {
      log.error("[L-02] checkAppVersion failed", error);
    }
  };
  const getoAuthConfig = (path: string) => {
    const envList = getAllEnvData();
    return (envList.oAuthConfig as any)[path];
  };
  // Don't render if store is not available
  if (!store) {
    log.error("Cannot render app: store is undefined");
    return null;
  }

  // Loading component for PersistGate
  const LoadingComponent = () => (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000",
      }}
    >
      <ActivityIndicator size="large" color="#fff" />
    </View>
  );

  return (
    <Auth0Provider
      domain={getoAuthConfig("issuer")}
      clientId={getoAuthConfig("clientId")}
    >
      <Provider store={store}>
        <PersistGate loading={<LoadingComponent />} persistor={persistor}>
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
        </PersistGate>
      </Provider>
    </Auth0Provider>
  );
});
