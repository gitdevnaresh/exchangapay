import React from 'react';
import { StyleSheet, View, StyleProp, TextStyle, ViewStyle, Text } from 'react-native';
import { Button } from 'react-native-elements'; // Assuming Button is from react-native-elements
import { IconNode } from 'react-native-elements/dist/icons/Icon'; // Import IconNode
import { useLngTranslation } from "../../hooks/languagesHook/useLngTranslation";
import { ms, s } from '../../constants/styels/scale';
import { useThemeColors } from '../../hooks/themedHook/useThemeColors';
import { useColorScheme } from 'react-native';
import { getThemedCommonStyles } from '../../components/CommonStyles';
import { LinearGradient } from 'expo-linear-gradient';

interface DefaultButtonProps {
  icon?: IconNode; // Changed from ReactNode to IconNode for react-native-elements Button
  title?: string; // Assumed to be a translation key or plain string
  suffix?: string;
  onPress?: () => void;
  customTitleStyle?: StyleProp<TextStyle>; // For text styles
  customButtonStyle?: StyleProp<ViewStyle>; // For view styles
  customContainerStyle?: StyleProp<ViewStyle>; // For view styles
  disable?: boolean;
  loading?: boolean;
  multiLanguageAllows?: boolean;
  solidBackground?: boolean;
}

const ButtonComponent = ({
  icon,
  title = 'Continue',
  suffix,
  onPress,
  customTitleStyle,
  customButtonStyle,
  customContainerStyle,
  disable = false,
  loading = false,
  multiLanguageAllows = true,
  solidBackground = false,
}: DefaultButtonProps) => {
  const { t } = useLngTranslation();
  const NEW_COLOR = useThemeColors();
  const isDark = useColorScheme() === 'dark';
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const styles = screenStyles(NEW_COLOR);

  // --- Disabled palette (theme-first with fallbacks) ---
  const DISABLED_BG =
    NEW_COLOR.BUTTON_DISABLED_BG ?? (isDark ? '#334155' : '#E2E8F0'); // used for filled variant
  const DISABLED_TEXT =
    NEW_COLOR.BUTTON_TEXT_DISABLED ?? NEW_COLOR.TEXT_DISABLED ?? (isDark ? '#64748B' : '#94A3B8');

  // Enabled text color by variant
  const enabledTextColor = solidBackground
    ? NEW_COLOR.SECONDARYBUTTON_TEXT
    : NEW_COLOR.PRIMARYBUTTON_TEXT;

  // Final title color
  const titleColor = disable ? DISABLED_TEXT : enabledTextColor;


  const buttonContent = (

    <Button
      titleStyle={[
        commonStyles.buttonTitle,
        customTitleStyle,
        { color: titleColor, textTransform: "none" },
      ]}
      disabledTitleStyle={[
        commonStyles.buttonTitle,
        customTitleStyle,
        { color: DISABLED_TEXT },
      ]}
      buttonStyle={[
        styles.button,
        loading && styles.buttonLoading,
        customButtonStyle,
        styles.transparentButton, // inner kept clear; wrapper controls bg
      ]}
      disabledStyle={[
        styles.button,
        loading && styles.buttonLoading,
        customButtonStyle,
        styles.transparentButton,
      ]}
      loadingProps={{ color: solidBackground ? NEW_COLOR.TEXT_PRIMARY : NEW_COLOR.BUTTONLOADER }}
      containerStyle={[styles.buttonContainer, customContainerStyle]}
      title={`${multiLanguageAllows ? t(title) : title}${suffix ? ` ${suffix}` : ''}`}
      onPress={onPress}
      loading={loading}
      icon={
        <View style={{ flexDirection: 'row', gap: s(2) }}>
          {icon}
          <Text />
        </View>
      }
      disabled={disable}
    />
  );

  return solidBackground ? (
    <View style={[commonStyles.solidContainer, customContainerStyle]}>
      {buttonContent}
    </View>
  ) : (
    <LinearGradient
      colors={[NEW_COLOR.BUTTON_LINEARGRADIANT1, NEW_COLOR.BUTTON_LINEARGRADIANT2]}
      start={{ x: 0, y: 0 }} // top
      end={{ x: 0, y: 1 }}   // bottom      
      style={[styles.container, customContainerStyle, commonStyles.gradientButton]}
    >
      {buttonContent}
    </LinearGradient>
  );
};

export default ButtonComponent;

const screenStyles = (NEW_COLOR: any) => StyleSheet.create({
  container: {
    borderRadius: 5,
  },
  buttonContainer: {
    borderRadius: 5,
    overflow: 'hidden',
  },
  button: {
    borderRadius: 5,
    paddingVertical: ms(8),
    minHeight: ms(48),
    borderWidth: 0, // Removed border since we're using gradient
    fontSize: ms(38),
    fontFamily: "Manrope-Medium",
  },
  transparentButton: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },

  buttonLoading: {
    paddingVertical: ms(8),
    color: NEW_COLOR.TEXT_WHITE
  },
});
