import "react-native-get-random-values";
import React, { useEffect, useMemo, useState } from "react";
import { Provider } from "react-redux";
import { persistor, store } from "./redux/reducers";
import { getAllEnvData } from "../Environment";
import * as Font from "expo-font";
import i18n from "./language";
import { ApplicationProvider } from "@ui-kitten/components";
import * as eva from "@eva-design/eva";
import { PersistGate } from "redux-persist/integration/react";
import AppUpdate from "./newComponents/appUpdateComponent/appUpdateComponent";
import AppVersions from "./apiServices/versionUpdateServices/appUpdateApis";
import DeviceInfo from "react-native-device-info";
import { Platform } from "react-native";
import { I18nextProvider } from "react-i18next";
import CardsAppContainer from "./navigations/cardsApp_AppContainer";
import NetworkStatus from "./newComponents/noInterNet/noInterNet";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useNetInfo } from "@react-native-community/netinfo";
import { useTokenRefresh } from "./hooks/refreshTokenHook";
import { toastConfig } from "./newComponents/ToasterMessages/Toastermessages";
import Toast from "react-native-toast-message";
import { initializeCrashlytics } from "./utils/ApiService";
import { FronteggWrapper } from '@frontegg/react-native';
import * as Sentry from "@sentry/react-native";
import { initializeNotifications } from "./pushNotifications";
import ViewComponent from "./newComponents/view/view";
import { Bullswipe } from "./assets/svg";
import { s } from "./constants/theme/scale";
import { useThemeColors } from "./hooks/useThemeColors";
import { getThemedCommonStyles } from "./assets/styles/CommonStyles";


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
    const { refreshToken } = useTokenRefresh();
    const NEW_COLOR=useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);

    useEffect(() => {
        const initializeApp = async () => {
            try {
                await initializeNotifications();
                await refreshToken();
                await loadFonts();
                checkVersionUpdate(); // This can run without await if it's not critical for the first render
            } catch (error) {
                setIsInitializing(false);
            } finally {
                setIsInitializing(false);
            }
        };
        initializeCrashlytics();
        initializeApp();
    }, []);

    useEffect(() => {
        if (versionInfo) {
            checkAppVersion(); // Only run when versionInfo is ready
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
                    (applicant) => applicant.applicationId === applicationId
                );
                if (filterApplicant && filterApplicant.length > 0) {
                    versionDetailsInfo = filterApplicant[0].applicationInfo;
                }
            }
            if (Platform.OS === "ios") {
                let liveVersoionForce = versionDetailsInfo['iosForceUpdateVersion'];
                let liveVersoion = versionDetailsInfo['iosBuildVersion'];

                // Safe type checking before indexOf
                liveVersoionForce = (typeof liveVersoionForce === 'string' && liveVersoionForce.indexOf('.') > 0) ? liveVersoionForce.replaceAll('.', '') : liveVersoionForce;
                liveVersoion = (typeof liveVersoion === 'string' && liveVersoion.indexOf('.') > 0) ? liveVersoion.replaceAll('.', '') : liveVersoion;
                let currrentVersoion = (versionName.indexOf('.') > 0 && typeof versionName === 'string') ? versionName.replaceAll('.', '') : versionName;

                setIsForceUpdate(Number(liveVersoionForce) > Number(currrentVersoion));
                setIsUpdate(Number(liveVersoion) > Number(currrentVersoion));

            } else {
                let liveVersoionForce = versionDetailsInfo["androidForceUpdateVersion"];
                let liveVersoion = versionDetailsInfo["androidBuildVersion"];
                setIsForceUpdate(liveVersoionForce > versionName);
                setIsUpdate(liveVersoion > versionName);
            }
        } catch (error) {
            console.error("Error checking app version:", error);
        }
    };


    const checkVersionUpdate = async () => {
        try {
            const res = await AppVersions.getAppVersions();
            if (res.data?.jsonVersion) {
                setVersionInfo(JSON.parse(res.data.jsonVersion));
            }
        } catch (err) {
            // console.log(err)
        }
    };

    const handleUpdateLater = () => {
        setIsUpdate(false);
    };


    // const requestUserPermission = async () => {
    // PermissionsAndroid.request(
    // PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    // );
    // const authStatus = await messaging().requestPermission();
    // const enabled =
    // authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    // authStatus === messaging.AuthorizationStatus.PROVISIONAL;


    // if (enabled) {
    // }
    // };
    const loadFonts = async () => {
        await Font.loadAsync({
            "Manrope-Bold": require("./assets/fonts/Manrope-Bold.ttf"),
            "Manrope-Medium": require("./assets/fonts/Manrope-Medium.ttf"),
            "Manrope-Regular": require("./assets/fonts/Manrope-Regular.ttf"),
            "Manrope-Light": require("./assets/fonts/Manrope-Light.ttf"),
            "Manrope-ExtraLight": require("./assets/fonts/Manrope-ExtraLight.ttf"),
            "Manrope-ExtraBold": require("./assets/fonts/Manrope-ExtraBold.ttf"),
            "Manrope-SemiBold": require("./assets/fonts/Manrope-SemiBold.ttf"),
        });
        setFontsLoaded(true);
    };
    const getoAuthConfig = (path) => {
        const envList = getAllEnvData("tst");
        return envList.oAuthConfig[path];
    };
    const LaunchPlaceholder = useMemo(() => (
        <ViewComponent style={[
              commonStyles.flex1,commonStyles.screenBg,commonStyles.alignCenter,commonStyles.justifyCenter]} >
            <Bullswipe width={s(200)} height={s(50)} />
       </ViewComponent>
   ), [commonStyles]);

     if (isInitializing || !fontsLoaded) {
       return LaunchPlaceholder;
     }

    return (
      <ViewComponent style={[commonStyles.flex1,commonStyles.screenBg]}>
        <FronteggWrapper
            keepSessionLive={true}
        >
            <Provider store={store}>
                <PersistGate loading={null} persistor={persistor}>
                    <ApplicationProvider {...eva} theme={eva.light}>
                        <SafeAreaProvider>
                            <I18nextProvider i18n={i18n}>
                                {/* <AppLockWrapper> */}
                                {!netInfo.isConnected && <NetworkStatus />}
                                <CardsAppContainer />

                                <Toast config={toastConfig} bottomOffset={60} />
                                <AppUpdate
                                    show={isUpdate || isForceUpdate}
                                    forceUpdate={isForceUpdate}
                                    updateLatter={handleUpdateLater} // Pass the handler function
                                />
                                {/* </AppLockWrapper> */}
                            </I18nextProvider>
                        </SafeAreaProvider>
                    </ApplicationProvider>
                </PersistGate>
            </Provider>
        </FronteggWrapper>
        </ViewComponent>
    );
});
