import { Alert, BackHandler } from "react-native";
import { useNavigation } from "@react-navigation/native";
import useHardwareBack from "./useHardwareBack";
import { DASHBOARD_CONSTANTS } from "../screens/AccountDashboard/constants";

/**
 * Android hardware back for screens the app opens with a navigation reset (the
 * onboarding gates: verify email, phone, referral, KYC, under review, ...).
 *
 * If the screen has somewhere to go back to (e.g. Sumsub opened from the card
 * flow) it goes back; when it is the root, it asks before leaving the app
 * instead of silently sending it to the background.
 *
 * `onBack` runs first and can return true to consume the press itself, e.g. to
 * step back inside a multi-step screen.
 */
const useExitAppOnBack = (onBack?: () => boolean) => {
  const navigation = useNavigation();

  useHardwareBack(() => {
    if (onBack?.()) {
      return;
    }
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    Alert.alert(
      DASHBOARD_CONSTANTS.EXIT_APP_TITLE,
      DASHBOARD_CONSTANTS.EXIT_APP_MESSAGE,
      [
        { text: DASHBOARD_CONSTANTS.NO, style: "cancel" },
        { text: DASHBOARD_CONSTANTS.YES, onPress: () => BackHandler.exitApp() },
      ],
      { cancelable: false }
    );
  });
};

export default useExitAppOnBack;
