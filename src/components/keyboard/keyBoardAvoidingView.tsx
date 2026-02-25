import React, { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { s } from "../../constants/styels/scale";
// Constants for keyboard offset values - optimized for most devices
const KEYBOARD_OFFSET_IOS = s(88); // iOS: Status bar (44) + Navigation bar (44)
const KEYBOARD_OFFSET_ANDROID = s(64); // Android: Same as iOS for consistency

interface KeyboardAvoidingWrapperProps {
  children: ReactNode;
  keyboardVerticalOffset?: number;
}
const KeyboardAvoidingWrapper: React.FC<KeyboardAvoidingWrapperProps> = ({
  children,
  keyboardVerticalOffset = Platform.OS === "ios" ? KEYBOARD_OFFSET_IOS : KEYBOARD_OFFSET_ANDROID,
}) => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      {children}
    </KeyboardAvoidingView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
export default KeyboardAvoidingWrapper;
