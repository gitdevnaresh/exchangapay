import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleProp,
  TextStyle,
  ViewStyle,
  useColorScheme,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '../../hooks/useThemeColors';
import { s } from '../theme/scale';
import { useLngTranslation } from '../../hooks/useLngTranslation';
import { useSelector } from 'react-redux';
import { getThemedCommonStyles } from '../../assets/styles/CommonStyles';

interface ActionButtonProps {
  text: string;
  useGradient?: boolean;
  isRed?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  customTextColor?: string;
  customBgColor?: string;  // ✅ NEW: solid background color
  customIcon?: React.ReactNode; // ✅ NEW: custom icon component
  height?: number;
  width?: number;
  borderRadius?: number;
  disable?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  text,
  useGradient = false,
  isRed = false,
  onPress,
  style,
  textStyle,
  customTextColor,
  customBgColor,
  customIcon,
  height,
  width,
  borderRadius,
  disable
}) => {
  const COLORS = useThemeColors();
  const commonStyles = getThemedCommonStyles(COLORS);
   const appThemeSetting = useSelector((state: any) => state.userReducer?.appTheme);
    const colorScheme = useColorScheme();
    let backgroundSource;
  if (appThemeSetting !== 'system' && appThemeSetting !== undefined && appThemeSetting !== null) {
    backgroundSource = appThemeSetting === 'dark';
  } else {
    backgroundSource = colorScheme === 'dark';
  }
 const { t } = useLngTranslation();
  let textColor: string;
  if (customTextColor) {
    textColor = customTextColor;
  } else if (disable) {
    textColor = COLORS.TEXT_GREY;
  } else if (isRed) {
    textColor = COLORS.WHITE;
  } else if (useGradient) {
    textColor = backgroundSource ? "#000" : "#fff";
  } else {
    textColor = COLORS.TEXT_ALWAYS_BLACK; // Match button.tsx buttonText color
  }


  const content = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: s(8),
        width:width ?? '100%',
        height:height ?? "100%"
      }}
    >
      {customIcon} 
      <Text
        style={[
          commonStyles.textCenter,
          { color: textColor },
          commonStyles.fs12,
          commonStyles.fw600,
          textStyle,
        ]}
      >
        {t(text)}
      </Text>
    </View>
  );

  const buttonBaseStyle: ViewStyle = {
    width: width ?? s(178),
    height:height ?? s(44),
    borderRadius:borderRadius ?? s(100) / 2,
    justifyContent: 'center',
    alignItems: 'center',
  };

  if (useGradient) {
    return (
      <TouchableOpacity onPress={onPress}
      disabled={disable}
      >
        <LinearGradient
          colors={[COLORS.GRADIENT_START ?? '#11998E', COLORS.GRADIENT_END ?? '#23CD63']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[buttonBaseStyle, style]}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disable}
      style={[
        buttonBaseStyle,
        { backgroundColor: disable ? COLORS.INPUT_BORDER : (customBgColor ?? COLORS.BG_YELLOW) },
        style,
      ]}
    >
      {content}
    </TouchableOpacity>
  );
};

export default ActionButton;
