import { useCallback, useEffect, useRef } from "react";
import * as LocalAuthentication from "expo-local-authentication";
import { useLngTranslation } from "../../../hooks/useLngTranslation";
import { useDispatch, useSelector } from "react-redux";
import { Alert, AppState } from "react-native";
import SecurityService from "../../../services/security";
import { showAppToast } from "../../../newComponents/ToasterMessages/ShowMessage";
import { isErrorDispaly } from "../../../utils/helpers";
import PatternLockHelper from "../../../utils/patternLockHelper";
export default function useBiometricAuth() {
  const { t } = useLngTranslation();
  const dispatch = useDispatch();
  const appState = useRef(AppState.currentState);
  const isColdStart = useRef(true);
  const showBiometricPrompt = useSelector(
    (state: any) => state.userReducer.showBiometricPrompt
  );

  const enableBiometric = async () => {
    const obj = {
      type: "FaceResgEnabled",
      isEnable: true,
    };
    try {
      const response = await SecurityService.enableFingerPrint(obj);
      if (response.status === 200) {
        // showAppToast("Biometric authentication enabled successfully", 'success');
      } else {
        showAppToast(isErrorDispaly(response), "error");
      }
    } catch (error) {
      showAppToast(isErrorDispaly(error), "error");
    }
  };
  const handleAlert = () => {
    Alert.alert(
      t("GLOBAL_CONSTANTS.APP_LOCK"),
      t("GLOBAL_CONSTANTS.AUTHENTICATION_REQUIRED"),
      [
        {
          text: t("GLOBAL_CONSTANTS.UNLOCK_NOW"),
          onPress: () => authenticateUser(),
        },
      ],
      { cancelable: false }
    );
  };
  const authenticateUser = useCallback(async () => {
    // console.log(showBiometricPrompt, "showBiometricPrompt");
    // if (!showBiometricPrompt) return;

    try {
      const availableTypes = await LocalAuthentication.getEnrolledLevelAsync();
      if (availableTypes > 0) {
        const authResult = await LocalAuthentication.authenticateAsync({
          promptMessage: t("GLOBAL_CONSTANTS.AUTHENTICATE_TO_ACCESS_APP"),
        });

        if (authResult.success) {
          return true;
          // enableBiometric();
          // dispatch({ type: "showBiometricPrompt", payload: false });
        } else {
          // handleAlert();
          return false;
        }
      }
    } catch (error) {
      console.error("Biometric authentication failed:", error);
      return false;
    }
  }, [t, showBiometricPrompt, dispatch]);
  // useEffect(() => {
  //     const subscription = AppState.addEventListener('change', async (nextAppState) => {
  //         // App was in background/killed and is coming to foreground
  //         if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
  //             if (isColdStart.current) {
  //                 await authenticateUser();
  //                 isColdStart.current = false;
  //             }
  //         }
  //         // App is going to background
  //         if (nextAppState.match(/inactive|background/)) {
  //             isColdStart.current = true;
  //         }
  //         appState.current = nextAppState;
  //     });
  //     // Initial check on mount
  //     if (isColdStart.current && showBiometricPrompt) {
  //         authenticateUser();
  //         isColdStart.current = false;
  //     }
  //     return () => subscription.remove();
  // }, [showBiometricPrompt, authenticateUser]);

  const checkPatternLock = useCallback(async () => {
    try {
      const isPatternSet = await PatternLockHelper.isPatternSet();
      return isPatternSet;
    } catch (error) {
      console.error("Error checking pattern lock:", error);
      return false;
    }
  }, []);

  const verifyPattern = useCallback(async (pattern: number[]) => {
    try {
      const isValid = await PatternLockHelper.verifyPattern(pattern);
      return isValid;
    } catch (error) {
      console.error("Error verifying pattern:", error);
      return false;
    }
  }, []);

  const lockApp = useCallback(() => {
    // This can be called to manually lock the app for testing
    // You can dispatch an action to trigger app lock
    dispatch({ type: "LOCK_APP", payload: true });
  }, [dispatch]);

  return { authenticateUser, checkPatternLock, verifyPattern, lockApp };
}
