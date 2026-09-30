import React, { useEffect, useState } from "react";
import { BackHandler, Platform, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SvgUri } from "react-native-svg";
import ParagraphComponent from "./Paragraph/Paragraph";
import DefaultButton from "./DefaultButton";
import { commonStyles } from "./CommonStyles";
import { s } from "../constants/theme/scale";
import { NEW_COLOR } from "../constants/theme/variables";
import { REMOTE_ASSETS } from "../constants";
import { isEnforcementEnabled, useDeviceIntegrity } from "../security";

// Full-app block for a rooted / jailbroken / emulator device. Once shown it
// stays for the session; the check re-runs on every return to the foreground.
const DeviceSecurityGate = () => {
  const report = useDeviceIntegrity();
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (isEnforcementEnabled() && report.level === "compromised") {
      setBlocked(true);
    }
  }, [report]);

  // Swallow the Android back button so the block cannot be dismissed.
  useEffect(() => {
    if (!blocked) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => sub.remove();
  }, [blocked]);

  if (!blocked) return null;

  return (
    <View style={[StyleSheet.absoluteFill, commonStyles.screenBg]}>
      <SafeAreaView style={[commonStyles.flex1, commonStyles.container]}>
        <View
          style={[
            commonStyles.flex1,
            commonStyles.justifyCenter,
            commonStyles.alignCenter,
          ]}
        >
          <SvgUri uri={REMOTE_ASSETS.logoOrange} width={s(61)} height={s(56)} />
          <ParagraphComponent
            text="Device not supported"
            style={[
              commonStyles.fs22,
              commonStyles.fw700,
              commonStyles.textCenter,
              commonStyles.textBlack,
              styles.title,
            ]}
          />
          <ParagraphComponent
            text="For your security, Exchanga Pay can't run on this device because it appears to be rooted, jailbroken or an emulator, or has Developer Options / USB debugging turned on. Please turn these off or use a real, unmodified device."
            style={[
              commonStyles.fs16,
              commonStyles.textCenter,
              commonStyles.textBlack,
            ]}
          />
        </View>
        {/* iOS has no public API to close an app. */}
        {Platform.OS === "android" && (
          <DefaultButton
            title="Close App"
            customTitleStyle={styles.buttonTitle}
            onPress={() => BackHandler.exitApp()}
          />
        )}
      </SafeAreaView>
    </View>
  );
};

export default DeviceSecurityGate;

const styles = StyleSheet.create({
  title: {
    marginTop: s(24),
    marginBottom: s(16),
  },
  buttonTitle: {
    color: NEW_COLOR.TEXT_ALWAYS_WHITE,
  },
});
