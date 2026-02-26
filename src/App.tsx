import 'react-native-get-random-values';
import React, { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { persistor, store } from "./redux/reducers";
import { Auth0Provider } from "react-native-auth0";
import { getAllEnvData } from "../Environment";
import * as Font from "expo-font";
import i18n from "./language";
import { ApplicationProvider } from '@ui-kitten/components';
import * as eva from '@eva-design/eva';
import { PersistGate } from "redux-persist/integration/react";
import AppUpdate from "./components/appUpdateComponent/appUpdateComponent";
import AppVersions from "./apiServices/versionUpdateServices/appUpdateApis";
import DeviceInfo from "react-native-device-info";
import { Platform } from "react-native";
import { I18nextProvider } from "react-i18next";
import NetworkStatus from "./components/noInterNet/noInterNet";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useNetInfo } from "@react-native-community/netinfo";
import { toastConfig } from './components/toasterMessages/Toastermessages';
import Toast from 'react-native-toast-message';
import notifee, { AndroidImportance } from "@notifee/react-native";

// import { fcmNotification } from "./utils/FCMNotification";
// import { PermissionsAndroid } from "react-native";
// import messaging from "@react-native-firebase/messaging";
import * as Sentry from '@sentry/react-native';
import { SentryUserSetup } from './hooks/loggingHook/sentryData';
import AppContainer from './navigations/appContainer';
import perf from '@react-native-firebase/perf';
import { enableScreens } from "react-native-screens";
import { Logger } from './utils/Logger';
import { SecureErrorBoundary } from './components/errorBoundary';
import { validateSecureRandom } from './utils/secureRandom';

const { oAuthConfig } = getAllEnvData();
if (oAuthConfig.sentryLoggs) {
  Sentry.init({
    dsn: oAuthConfig.sentryDsn,
    // Set tracesSampleRate to 1.0 to capture 100%
    // Adds more context data to events (IP address, cookies, user, etc.)
    // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
    sendDefaultPii: oAuthConfig.sentryLoggs,
    environment: oAuthConfig.sentryEnvornment,
    replaysSessionSampleRate: 1.0,
    replaysOnErrorSampleRate: 1,
    integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

    // uncomment the line below to enable Spotlight (https://spotlightjs.com)
    // spotlight: __DEV__,
  });
}
export default Sentry.wrap(function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [isForceUpdate, setIsForceUpdate] = useState(false);
  const [versionInfo, setVersionInfo] = useState();
  const netInfo = useNetInfo();
  enableScreens();
  // --- Start App Launch Trace immediately ---
  useEffect(() => {
    startAppLaunchTrace();
  }, []);
  let appStartTrace: any;
  const startAppLaunchTrace = async () => {
    try {
      await perf().setPerformanceCollectionEnabled(true);
      appStartTrace = await perf().startTrace('app_launch_to_home');
    } catch (error) {
    }
  };
  const stopAppLaunchTrace = async () => {
    try {
      if (appStartTrace) {
        await appStartTrace.stop();
        appStartTrace = null;
      }
    } catch (error) {
      Logger.error('Error stopping App Launch Trace', error);
    }
  };

  // --- Initialize App ---
  useEffect(() => {
    const initializeApp = async () => {
      try {
        validateSecureRandom();
        // fcmNotification.initiate(onNotificationAction);
        // requestUserPermission();
        await loadFonts();
        await requestNotificationPermission();
        checkVersionUpdate(); // This can run without await if it's not critical for the first render
      } catch (error) {
        setIsInitializing(false)
      } finally {
        setIsInitializing(false);
      }
    };

    initializeApp();
  }, []);
  // --- Stop App Launch Trace when Home Screen Data is Ready ---
  // TODO: Connect these to actual Redux state or API loading flags
  // Example: const homeDataLoaded = useSelector(state => state.home.dataLoaded);
  // Example: const userLoaded = useSelector(state => state.user.isLoaded);
  const homeDataLoaded = !isInitializing && fontsLoaded; // Using initialization flags for now
  const userLoaded = !isInitializing; // Using initialization flags for now

  useEffect(() => {
    if (homeDataLoaded && userLoaded) {
      stopAppLaunchTrace();
    }
  }, [homeDataLoaded, userLoaded]);

  // --- Version Check ---
  useEffect(() => {
    if (versionInfo) {
      checkAppVersion();
    }
  }, [versionInfo]);

  const checkAppVersion = async () => {
    try {
      const versionName = DeviceInfo.getBuildNumber();
      const applicationId = DeviceInfo.getBundleId();
      const versionNumber = DeviceInfo.getVersion();
      let versionDetailsInfo = versionInfo || {};
      if (versionDetailsInfo?.Info && versionDetailsInfo?.Info?.length > 0) {
        const filterApplicant = versionDetailsInfo.Info?.filter(
          applicant => applicant.applicationId === applicationId,
        );
        if (filterApplicant && filterApplicant.length > 0) {
          versionDetailsInfo = filterApplicant[0].applicationInfo;
        }
      }
      if (Platform.OS === 'ios') {
        let liveVersoionForce = versionDetailsInfo['iosForceUpdateVersion'];
        let liveVersoion = versionDetailsInfo['iosBuildVersion'];
        liveVersoionForce = liveVersoionForce.indexOf('.') > 0 ? liveVersoionForce.replaceAll('.', '') : liveVersoionForce;
        liveVersoion = liveVersoion.indexOf('.') > 0 ? liveVersoion.replaceAll('.', '') : liveVersoion;
        let currrentVersoion = (versionName.indexOf('.') > 0 && typeof versionName === 'string') ? versionName.replaceAll('.', '') : versionName;
        setIsForceUpdate(liveVersoionForce > versionNumber);
        setIsUpdate(Number.parseFloat(liveVersoion) > Number.parseFloat(currrentVersoion));
      } else {
        let liveVersoionForce = versionDetailsInfo['androidForceUpdateVersion'];
        let liveVersoion = versionDetailsInfo['androidBuildVersion'];
        setIsForceUpdate(liveVersoionForce > versionName);
        setIsUpdate(liveVersoion > versionName);
      }

    } catch (error) {
      Logger.error('Error checking app version', error);
    }
  };

  const checkVersionUpdate = async () => {
    try {
      const res = await AppVersions.getAppVersions();
      if (res.data?.jsonVersion) {
        setVersionInfo(JSON.parse(res.data.jsonVersion));
      }
    } catch (err) {
    }
  };

  const handleUpdateLater = () => {
    setIsUpdate(false);
  };

  const requestNotificationPermission = async () => {
    try {
      const authStatus = await notifee.requestPermission();

      // Create default channel for Android
      if (Platform.OS === "android") {
        await notifee.createChannel({
          id: "default",
          name: "Default Channel",
          importance: AndroidImportance.HIGH,
        });
      }

      return authStatus;
    } catch (error) {
      return null;
    }
  };
  const loadFonts = async () => {
    await Font.loadAsync({
      // "Blinker-Thin": require("./assets/fonts/Blinker-Thin.ttf"), // 100
      // "Blinker-ExtraLight": require("./assets/fonts/Blinker-ExtraLight.ttf"), // 200
      // "Blinker-Light": require("./assets/fonts/Blinker-Light.ttf"), //300
      // "Blinker-Regular": require("./assets/fonts/Blinker-Regular.ttf"), //400
      // "Blinker-SemiBold": require("./assets/fonts/Blinker-SemiBold.ttf"), //600
      // "Blinker-Bold": require("./assets/fonts/Blinker-Bold.ttf"), //700
      // "Blinker-ExtraBold": require("./assets/fonts/Blinker-ExtraBold.ttf"), //800
      // "Blinker-Black": require("./assets/fonts/Blinker-Black.ttf"), //900
      // Poppins fonts
      // "Poppins-Thin": require("./assets/fonts/Poppins-Thin.ttf"),
      // "Poppins-ExtraLight": require("./assets/fonts/Poppins-ExtraLight.ttf"),
      // "Poppins-Light": require("./assets/fonts/Poppins-Light.ttf"),
      // "Poppins-Regular": require("./assets/fonts/Poppins-Regular.ttf"),
      // "Poppins-Medium": require("./assets/fonts/Poppins-Medium.ttf"),
      // "Poppins-SemiBold": require("./assets/fonts/Poppins-SemiBold.ttf"),
      // "Poppins-Bold": require("./assets/fonts/Poppins-Bold.ttf"),
      // "Poppins-ExtraBold": require("./assets/fonts/Poppins-ExtraBold.ttf"),
      // "Poppins-Black": require("./assets/fonts/Poppins-Black.ttf")
      "Manrope-Bold": require("./assets/fonts/Manrope-Bold.ttf"),
      "Manrope-Medium": require("./assets/fonts/Manrope-Medium.ttf"),
      "Manrope-Regular": require("./assets/fonts/Manrope-Regular.ttf"),
      "Manrope-Light": require("./assets/fonts/Manrope-Light.ttf"),
      "Manrope-ExtraLight": require("./assets/fonts/Manrope-ExtraLight.ttf"),
      "Manrope-ExtraBold": require("./assets/fonts/Manrope-ExtraBold.ttf"),
      "Manrope-SemiBold": require("./assets/fonts/Manrope-SemiBold.ttf"),
      "Rowdies-Light": require("./assets/fonts/Rowdies-Light.ttf"),

    });
    setFontsLoaded(true);
  };
  const getoAuthConfig = (path) => {
    const envList = getAllEnvData();
    return envList.oAuthConfig[path];
  };
  if (isInitializing || !fontsLoaded) {
    return null; // Or return a proper splash screen component
  }

  return (
    <SecureErrorBoundary>
      <Auth0Provider
        domain={getoAuthConfig('issuer')}
        clientId={getoAuthConfig('clientId')}
      >
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <ApplicationProvider {...eva} theme={eva.light}>
              <SafeAreaProvider>
                <SentryUserSetup />
                <I18nextProvider i18n={i18n}>
                  {/* For ArthaPay Project enable this */}
                  {/* <AppContainerW2 /> */}

                  {/* For MLM Project enable this */}
                  {/* <MLMAppContainer />     */}
                  {/* <SamratAppContainer /> */}
                  {!netInfo.isConnected && (<NetworkStatus />)}
                  <AppContainer />
                  {/*
                    Adjust bottomOffset to position the toast appropriately.
                    If you have a tab bar or other elements at the bottom,
                    you'll want the offset to be greater than their height.
                  */}
                  <Toast config={toastConfig} bottomOffset={60} />
                  <AppUpdate
                    show={isUpdate}
                    forceUpdate={isForceUpdate}
                    updateLatter={handleUpdateLater} // Pass the handler function
                  />

                </I18nextProvider>
              </SafeAreaProvider>
            </ApplicationProvider>
          </PersistGate>
        </Provider>
      </Auth0Provider>
    </SecureErrorBoundary>
  );
});