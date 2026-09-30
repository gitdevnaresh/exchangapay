import { useCallback, useRef } from "react";
import { BackHandler } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

/**
 * Handle the Android hardware back button for the current screen.
 *
 * The listener is registered only while the screen is focused, so a screen left
 * mounted under another one (e.g. ApplyCard under AllFAQs) does not hijack the
 * back press of the screen on top.
 */
const useHardwareBack = (onBack: () => void) => {
  const onBackRef = useRef(onBack);
  onBackRef.current = onBack;

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          onBackRef.current();
          return true;
        }
      );
      return () => subscription.remove();
    }, [])
  );
};

export default useHardwareBack;
