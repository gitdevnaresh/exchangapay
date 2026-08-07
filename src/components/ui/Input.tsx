import React from "react";
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import renderNode from "./renderNode";

/**
 * Port of react-native-elements v3.4.3's Input
 * (node_modules/react-native-elements/dist/input/Input.js), keeping the same
 * three-part layout (container → animated input row → error line), the same
 * default styles, the shake animation and the imperative
 * focus/blur/clear/isFocused handle its ref holders rely on.
 *
 * Theme values are inlined from RNE's default light theme, which is what this
 * app resolved to — no RNE ThemeProvider was mounted.
 */
const RNE_GREY3 = "#86939e";
const RNE_BLACK = "#242424";
const RNE_ERROR = "#ff190c";

const renderText = (content: any, defaultProps: any, style: any) =>
  renderNode(Text, content, {
    ...defaultProps,
    style: StyleSheet.flatten([style, defaultProps && defaultProps.style]),
  });

export interface InputProps {
  containerStyle?: any;
  disabled?: boolean;
  disabledInputStyle?: any;
  inputContainerStyle?: any;
  leftIcon?: any;
  leftIconContainerStyle?: any;
  rightIcon?: any;
  rightIconContainerStyle?: any;
  InputComponent?: any;
  inputStyle?: any;
  errorProps?: any;
  errorStyle?: any;
  errorMessage?: any;
  label?: any;
  labelStyle?: any;
  labelProps?: any;
  renderErrorMessage?: boolean;
  style?: any;
  [key: string]: any;
}

export class Input extends React.Component<InputProps> {
  private shakeAnimationValue = new Animated.Value(0);
  private input: any;

  focus() {
    this.input.focus();
  }
  blur() {
    this.input.blur();
  }
  clear() {
    this.input.clear();
  }
  isFocused() {
    return this.input.isFocused();
  }
  setNativeProps(nativeProps: any) {
    this.input.setNativeProps(nativeProps);
  }

  shake = () => {
    const { shakeAnimationValue } = this;
    shakeAnimationValue.setValue(0);
    Animated.timing(shakeAnimationValue, {
      duration: 375,
      toValue: 3,
      easing: Easing.bounce,
      useNativeDriver: true,
    }).start();
  };

  render() {
    const {
      containerStyle,
      disabled,
      disabledInputStyle,
      inputContainerStyle,
      leftIcon,
      leftIconContainerStyle,
      rightIcon,
      rightIconContainerStyle,
      InputComponent = TextInput,
      inputStyle,
      errorProps,
      errorStyle,
      errorMessage,
      label,
      labelStyle,
      labelProps,
      renderErrorMessage = true,
      style,
      ...attributes
    } = this.props;

    const translateX = this.shakeAnimationValue.interpolate({
      inputRange: [0, 0.5, 1, 1.5, 2, 2.5, 3],
      outputRange: [0, -15, 0, 15, 0, -15, 0],
    });

    const hideErrorMessage = !renderErrorMessage && !errorMessage;

    return (
      <View style={StyleSheet.flatten([styles.container, containerStyle])}>
        {renderText(
          label,
          { style: labelStyle, ...labelProps },
          {
            fontSize: 16,
            color: RNE_GREY3,
            ...Platform.select({
              android: { fontFamily: "sans-serif-medium" },
              default: { fontWeight: "bold" },
            }),
          }
        )}

        <Animated.View
          style={StyleSheet.flatten([
            {
              flexDirection: "row",
              borderBottomWidth: 1,
              alignItems: "center",
              borderColor: RNE_GREY3,
            },
            inputContainerStyle,
            { transform: [{ translateX }] },
          ])}
        >
          {leftIcon && (
            <View
              style={StyleSheet.flatten([
                styles.iconContainer,
                leftIconContainerStyle,
              ])}
            >
              {renderNode(View, leftIcon)}
            </View>
          )}

          <InputComponent
            testID="RNE__Input__text-input"
            underlineColorAndroid="transparent"
            editable={!disabled}
            ref={(ref: any) => {
              this.input = ref;
            }}
            style={StyleSheet.flatten([
              {
                color: RNE_BLACK,
                fontSize: 18,
                flex: 1,
                minHeight: 40,
              },
              inputStyle,
              disabled && styles.disabledInput,
              disabled && disabledInputStyle,
              style,
            ])}
            placeholderTextColor={RNE_GREY3}
            {...attributes}
          />

          {rightIcon && (
            <View
              style={StyleSheet.flatten([
                styles.iconContainer,
                rightIconContainerStyle,
              ])}
            >
              {renderNode(View, rightIcon)}
            </View>
          )}
        </Animated.View>

        <Text
          {...errorProps}
          style={StyleSheet.flatten([
            {
              margin: 5,
              fontSize: 12,
              color: RNE_ERROR,
            },
            errorStyle && errorStyle,
            hideErrorMessage && {
              height: 0,
              margin: 0,
              padding: 0,
            },
          ])}
        >
          {errorMessage}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 10,
  },
  disabledInput: {
    opacity: 0.5,
  },
  iconContainer: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    paddingRight: 4,
    marginVertical: 4,
  },
});

export default Input;
