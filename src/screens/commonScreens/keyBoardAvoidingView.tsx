import React, { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, ViewStyle } from "react-native";

interface KeyboardAvoidingWrapperProps {
    children: ReactNode;
    style?: ViewStyle | ViewStyle[];
}
const KeyboardAvoidingWrapper: React.FC<KeyboardAvoidingWrapperProps> = ({ children, style }) => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, style]}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
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
