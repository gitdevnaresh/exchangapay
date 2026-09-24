import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import * as Sentry from "@sentry/react-native";
import crashlytics from "@react-native-firebase/crashlytics";
import { commonStyles } from "../CommonStyles";
import { NEW_COLOR } from "../../constants/theme/variables";
import { ms, s } from "../../constants/theme/scale";
import { log } from "../../utils/logger";

interface Props {
  children: React.ReactNode;
  /** Optional label so Sentry/logs can tell which boundary fired. */
  boundaryName?: string;
  /**
   * Optional custom fallback. Receives the error and a reset() that clears the
   * boundary state and re-attempts to render the children.
   */
  fallback?: (error: Error, reset: () => void) => React.ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * App-level error boundary. A render/lifecycle throw below this point is caught
 * here instead of white-screening the whole app, reported to Sentry and
 * Crashlytics, and a recoverable fallback is shown.
 *
 * The default fallback uses the static NEW_COLOR tokens and commonStyles
 * directly (no useStyleSheet / ui-kitten theme context), and bare RN primitives
 * rather than ParagraphComponent / DefaultButton, so it still renders when the
 * crash came from a provider or a shared component.
 */
class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    const boundaryName = this.props.boundaryName ?? "root";
    log.error("ErrorBoundary caught error:", error);
    try {
      Sentry.withScope((scope) => {
        scope.setTag("errorBoundary", boundaryName);
        scope.setExtra("componentStack", info.componentStack);
        Sentry.captureException(error);
      });
      crashlytics().setAttribute("errorBoundary", boundaryName);
      crashlytics().recordError(error);
    } catch {
      // Never let telemetry throw from the boundary itself.
    }
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (error) {
      if (this.props.fallback) {
        return this.props.fallback(error, this.reset);
      }

      return (
        <View
          style={[
            commonStyles.flex1,
            commonStyles.screenBg,
            commonStyles.justifyCenter,
            commonStyles.alignCenter,
            commonStyles.px24,
          ]}
        >
          <Text
            style={[
              commonStyles.textAlwaysWhite,
              commonStyles.fs24,
              commonStyles.fw700,
              commonStyles.textCenter,
              commonStyles.mb16,
            ]}
          >
            Something went wrong
          </Text>
          <Text
            style={[
              commonStyles.textGrey,
              commonStyles.fs14,
              commonStyles.fw400,
              commonStyles.textCenter,
              commonStyles.mb24,
            ]}
          >
            The app hit an unexpected error. You can try again.
          </Text>
          <TouchableOpacity
            onPress={this.reset}
            accessibilityRole="button"
            activeOpacity={0.8}
            style={styles.retryButton}
          >
            <Text
              style={[
                commonStyles.textAlwaysWhite,
                commonStyles.fs16,
                commonStyles.fw600,
              ]}
            >
              Try again
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  retryButton: {
    backgroundColor: NEW_COLOR.BG_ORANGE,
    minHeight: ms(58),
    paddingHorizontal: s(40),
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ErrorBoundary;
