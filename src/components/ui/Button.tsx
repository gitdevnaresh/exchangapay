import React, { useCallback } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableNativeFeedback,
  TouchableOpacity,
  View,
} from "react-native";
import renderNode from "./renderNode";

/**
 * Port of react-native-elements v3.4.3's Button
 * (node_modules/react-native-elements/dist/buttons/Button.js) covering the
 * props its one consumer — src/components/DefaultButton.tsx, and through it
 * every button in the app — actually passes: title, titleStyle, buttonStyle,
 * containerStyle, disabled, disabledStyle, disabledTitleStyle, loading,
 * loadingProps, icon, iconRight, onPress.
 *
 * The theme values RNE resolved through `withTheme` are inlined as the literals
 * from its default light theme (dist/config/colors.js), which is what this app
 * got: no RNE ThemeProvider was ever mounted. `type` is always the default
 * "solid" here, so the outline/clear branches are not carried over.
 */
const RNE_PRIMARY = "#2089dc";
const RNE_DISABLED = "hsl(208, 8%, 90%)";
// Color('hsl(208, 8%, 90%)').darken(0.3).string(), precomputed — the `color`
// package was an RNE dependency and is not worth keeping for one constant.
const RNE_DISABLED_TITLE = "hsl(208, 8%, 63%)";

export interface ButtonProps {
  title?: any;
  titleStyle?: any;
  titleProps?: any;
  buttonStyle?: any;
  containerStyle?: any;
  disabledStyle?: any;
  disabledTitleStyle?: any;
  loading?: boolean;
  loadingStyle?: any;
  loadingProps?: any;
  icon?: any;
  iconContainerStyle?: any;
  iconRight?: boolean;
  iconPosition?: "top" | "bottom" | "left" | "right";
  disabled?: boolean;
  raised?: boolean;
  TouchableComponent?: any;
  ViewComponent?: any;
  onPress?: (evt?: any) => void;
  [key: string]: any;
}

// Mirrors Color(titleColor).alpha(0.32).rgb().string() for the hex/rgb values
// this app uses; anything else falls back to the platform default ripple.
const rippleColor = (value: any): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }
  const hex = value.trim();
  const shorthand = /^#([\da-f])([\da-f])([\da-f])$/i.exec(hex);
  const full = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex);
  if (shorthand) {
    const [r, g, b] = shorthand.slice(1).map((c) => parseInt(c + c, 16));
    return `rgba(${r}, ${g}, ${b}, 0.32)`;
  }
  if (full) {
    const [r, g, b] = full.slice(1).map((c) => parseInt(c, 16));
    return `rgba(${r}, ${g}, ${b}, 0.32)`;
  }
  return undefined;
};

export const Button: React.FC<ButtonProps> = (props) => {
  const {
    TouchableComponent,
    containerStyle,
    onPress = () => null,
    buttonStyle,
    loading = false,
    loadingStyle,
    loadingProps: passedLoadingProps,
    title = "",
    titleProps,
    titleStyle: passedTitleStyle,
    icon,
    iconContainerStyle,
    iconRight = false,
    disabled = false,
    disabledStyle,
    disabledTitleStyle,
    raised = false,
    ViewComponent = View,
    iconPosition = "left",
    ...attributes
  } = props;

  const handleOnPress = useCallback(
    (evt: any) => {
      if (!loading) {
        onPress(evt);
      }
    },
    [loading, onPress]
  );

  const TouchableComponentInternal =
    TouchableComponent ||
    Platform.select<any>({
      android: TouchableNativeFeedback,
      default: TouchableOpacity,
    });

  const titleStyle = StyleSheet.flatten([
    { color: "white" },
    styles.title,
    passedTitleStyle,
    disabled && { color: RNE_DISABLED_TITLE },
    disabled && disabledTitleStyle,
  ]);

  const ripple = rippleColor((titleStyle as any)?.color);
  const background =
    Platform.OS === "android" && ripple
      ? TouchableNativeFeedback.Ripple(ripple, true)
      : undefined;

  const loadingProps = {
    color: "white",
    size: "small" as const,
    ...passedLoadingProps,
  };

  const positionStyle: Record<string, any> = {
    top: "column",
    bottom: "column-reverse",
    left: "row",
    right: "row-reverse",
  };

  return (
    <View
      style={[
        styles.container,
        { borderRadius: 3 },
        containerStyle,
        raised && !disabled && styles.raised,
      ]}
    >
      <TouchableComponentInternal
        onPress={handleOnPress}
        delayPressIn={0}
        activeOpacity={0.3}
        accessibilityRole="button"
        accessibilityState={{ disabled: !!disabled, busy: !!loading }}
        disabled={disabled}
        background={background}
        {...attributes}
      >
        <ViewComponent
          style={StyleSheet.flatten([
            styles.button,
            styles.buttonOrientation,
            {
              flexDirection:
                positionStyle[iconRight ? "right" : iconPosition] || "row",
            },
            {
              backgroundColor: RNE_PRIMARY,
              borderColor: RNE_PRIMARY,
              borderWidth: 0,
            },
            buttonStyle,
            disabled && { backgroundColor: RNE_DISABLED },
            disabled && disabledStyle,
          ])}
        >
          {loading && (
            <ActivityIndicator
              style={StyleSheet.flatten([styles.loading, loadingStyle])}
              color={loadingProps.color}
              size={loadingProps.size}
              {...loadingProps}
            />
          )}
          {!loading &&
            icon &&
            renderNode(View, icon, {
              containerStyle: StyleSheet.flatten([
                styles.iconContainer,
                iconContainerStyle,
              ]),
            })}
          {!loading &&
            !!title &&
            renderNode(Text, title, { style: titleStyle, ...titleProps })}
        </ViewComponent>
      </TouchableComponentInternal>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 3,
    padding: 8,
  },
  buttonOrientation: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 3,
    padding: 8,
  },
  container: {
    overflow: "hidden",
    borderRadius: 3,
  },
  title: {
    fontSize: 16,
    textAlign: "center",
    paddingVertical: 1,
    ...Platform.select({
      android: {
        fontFamily: "sans-serif-medium",
      },
      default: {
        fontSize: 18,
      },
    }),
  },
  iconContainer: {
    marginHorizontal: 5,
  },
  loading: {
    marginVertical: 2,
  },
  raised: {
    backgroundColor: "#fff",
    overflow: "visible",
    ...Platform.select({
      android: {
        elevation: 4,
      },
      default: {
        shadowColor: "rgba(0,0,0, .4)",
        shadowOffset: { height: 1, width: 1 },
        shadowOpacity: 1,
        shadowRadius: 1,
      },
    }),
  },
});

export default Button;
