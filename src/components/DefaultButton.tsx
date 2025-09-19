import React from "react";
import { Dimensions, StyleSheet, TouchableOpacity } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { Button } from "react-native-elements";
import { ms, s } from "../constants/theme/scale";
import { NEW_COLOR } from "../constants/theme/variables";
import AntDesign from "react-native-vector-icons/AntDesign";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Feather from "react-native-vector-icons/Feather";

const { width } = Dimensions.get("window");
const isPad = width > 600;

interface DefaultButtonProps {
  icon?: any;
  title: any;
  style?: any;
  onPress?: () => void;
  customTitleStyle?: any;
  customButtonStyle?: any;
  customContainerStyle?: any;
  backgroundColors?: any;
  disable?: any;
  loading?: any;
  colorful?: any;
  transparent?: any;
  refresh?: boolean;
  iconRight?: boolean;
  iconCheck?: boolean;
  iconArrowRight?: boolean;
  iconPlus?: boolean;
  closeIcon?: boolean;
  loadingProps?: any;
}

const DefaultButton = ({
  icon,
  iconRight = false,
  title = "label",
  onPress,
  customTitleStyle,
  customButtonStyle,
  customContainerStyle,
  backgroundColors = [
    NEW_COLOR.BACKGROUND_DANGER,
    NEW_COLOR.BACKGROUND_PRIMARY,
  ],
  disable = false,
  loading = false,
  refresh = false,
  colorful = false,
  transparent = false,
  iconCheck = false,
  iconArrowRight = true,
  iconPlus = false,
  loadingProps,
  closeIcon = false,
}: DefaultButtonProps) => (
  <LinearGradient
    colors={colorful ? backgroundColors : ["transparent", "transparent"]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={{
      borderRadius: 4,
      position: "relative",
    }}
  >
    <Button
      titleStyle={[
        styles.buttonTitle,
        colorful ? styles.colorfulButtonTitle : null,
        transparent ? styles.transparentButtonTitle : null,
        customTitleStyle,
      ]}
      buttonStyle={[
        styles.button,
        loading ? styles.buttonLoading : null,
        colorful || transparent ? styles.colorfulButton : null,
        customButtonStyle,
      ]}
      disabledStyle={[
        styles.button,
        loading ? styles.buttonLoading : null,
        colorful || transparent ? styles.colorfulButton : null,
        customButtonStyle,
      ]}
      disabledTitleStyle={[
        styles.buttonTitle,
        colorful ? styles.colorfulButtonTitle : null,
        transparent ? styles.transparentButtonTitle : null,
        customTitleStyle,
      ]}
      loadingProps={{
        color: NEW_COLOR.TEXT_ALWAYS_WHITE,
        ...loadingProps,
      }}
      containerStyle={[styles.container, customContainerStyle]}
      title={title}
      onPress={onPress}
      loading={loading}
      icon={icon}
      disabled={disable}
      iconRight={iconRight}
    />
    {iconArrowRight && (
      <TouchableOpacity
        style={{
          position: "absolute",
          top: isPad ? 22 : 8,
          right: 12,
          backgroundColor: NEW_COLOR.BACKGROUND_WHITE,
          padding: 10,
          borderRadius: 100 / 2,
        }}
        activeOpacity={1}
        onPress={onPress}
      >
        <AntDesign name={"arrowright"} size={18} color={NEW_COLOR.BG_ORANGE} />
      </TouchableOpacity>
    )}
    {iconPlus && (
      <TouchableOpacity
        style={{
          position: "absolute",
          top: isPad ? 22 : 8,
          right: 12,
          backgroundColor: NEW_COLOR.BACKGROUND_WHITE,
          padding: 10,
          borderRadius: 100 / 2,
        }}
        activeOpacity={1}
        onPress={onPress}
      >
        <AntDesign
          onPress={onPress}
          name={"plus"}
          size={18}
          color={NEW_COLOR.BG_ORANGE}
        />
      </TouchableOpacity>
    )}
    {iconCheck && (
      <TouchableOpacity
        style={{
          position: "absolute",
          top: isPad ? 22 : 8,
          right: 12,
          backgroundColor: NEW_COLOR.BACKGROUND_WHITE,
          padding: 10,
          borderRadius: 100 / 2,
        }}
        activeOpacity={1}
        onPress={onPress}
      >
        <Feather
          onPress={onPress}
          name="check"
          size={18}
          color={NEW_COLOR.BG_ORANGE}
        />
      </TouchableOpacity>
    )}
    {closeIcon && (
      <TouchableOpacity
        style={{
          position: "absolute",
          top: isPad ? 22 : 8,
          right: 12,
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          padding: 10,
          borderRadius: 100 / 2,
        }}
        activeOpacity={1}
        onPress={onPress}
      >
        <AntDesign
          onPress={onPress}
          name="close"
          size={18}
          color={NEW_COLOR.TEXT_BLACK}
        />
      </TouchableOpacity>
    )}
    {refresh && (
      <TouchableOpacity
        style={{
          position: "absolute",
          top: isPad ? 22 : 8,
          right: 12,
          backgroundColor: NEW_COLOR.BACKGROUND_WHITE,
          padding: 10,
          borderRadius: 100 / 2,
        }}
        activeOpacity={1}
        onPress={onPress}
      >
        <MaterialIcons
          onPress={onPress}
          name="refresh"
          size={18}
          color={NEW_COLOR.TEXT_ORANGE}
        />
      </TouchableOpacity>
    )}
  </LinearGradient>
);

export default React.memo(DefaultButton);
const styles = StyleSheet.create({
  container: {
    borderRadius: 6,
  },
  button: {
    backgroundColor: NEW_COLOR.BG_ORANGE,
    color: "#FFFFFF",
    borderRadius: 100,
    paddingVertical: ms(8),
    minHeight: ms(58),
    position: "relative",
  },
  buttonLoading: {
    paddingVertical: ms(16),
  },
  colorfulButton: {
    backgroundColor: NEW_COLOR.BG_CANCEL,
    color: NEW_COLOR.TEXT_WHITE,
  },
  buttonTitle: {
    fontSize: ms(18),
    color: "#FFFFFF",
    textTransform: "capitalize",
    fontFamily: "PlusJakartaSans-SemiBold",
    fontWeight: "700",
  },
  colorfulButtonTitle: {
    color: NEW_COLOR.TEXT_LIGHT,
  },
  transparentButtonTitle: {
    color: NEW_COLOR.TEXT_ALWAYS_WHITE,
    fontSize: ms(16),
  },
});
