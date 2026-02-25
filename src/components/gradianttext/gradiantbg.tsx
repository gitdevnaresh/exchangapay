import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleProp,
  TextStyle,
  ViewStyle,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { useThemeColors } from '../../hooks/themedHook/useThemeColors';
import { s } from '../../constants/styels/scale';
import { getThemedCommonStyles } from '../CommonStyles';
import { useLngTranslation } from '../../hooks/languagesHook/useLngTranslation';
import { useSelector } from 'react-redux';
import ViewComponent from '../view/view';           // ✅ custom component
import { NEW_COLOR } from '../../constants/styels/variables';
import CommonTouchableOpacity from '../touchableComponents/touchableOpacity';

interface ActionButtonProps {
  text: string;
  useGradient?: boolean;
  isRed?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  customTextColor?: string;
  customBgColor?: string;
  customIcon?: React.ReactNode;
  height?: number;
  width?: number;
  borderRadius?: number;
  disable?: boolean;
  loading?: boolean;
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
  disable,
  loading
}) => {
  const COLORS = useThemeColors();
  const commonStyles = getThemedCommonStyles(COLORS);
  const appThemeSetting = useSelector((state: any) => state.userReducer?.appTheme);
  const colorScheme = useColorScheme();
  const backgroundSource =
    appThemeSetting !== 'system' && appThemeSetting != null
      ? appThemeSetting === 'dark'
      : colorScheme === 'dark';

  const { t } = useLngTranslation();

  // two default text colors based on useGradient
  const textColor =
    customTextColor ??
    (useGradient
      ? NEW_COLOR.ACTION_PRIMARYTEXT              // for filled / gradient button (Deposit)
      : isRed
        ? NEW_COLOR.ACTION_PRIMARYTEXT
        : NEW_COLOR.ACTION_PRIMARYTEXT); // for outline / secondary (Withdraw)

  const pillHeight = height ?? s(44);
  const pillRadius = borderRadius ?? pillHeight / 2;

  const content = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {customIcon}
      <Text
        style={[
          commonStyles.textCenter,
          { color: textColor },
          commonStyles.actionbuttontext,
          customIcon ? { marginLeft: s(6) } : null,
          textStyle,
        ]}
        numberOfLines={1}
      >
        {t(text)}
      </Text>
      {loading && <ViewComponent style={{ "paddingLeft": s(4) }}><ActivityIndicator size={"small"} color={textColor} /></ViewComponent>}
    </View>
  );

  const buttonBaseStyle: ViewStyle = {
    height: pillHeight,
    minHeight: pillHeight,
    borderRadius: pillRadius,
    paddingHorizontal: s(16),
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  };

  if (useGradient) {
    return (
      <CommonTouchableOpacity onPress={onPress} disabled={disable} activeOpacity={0.8}>
        <ViewComponent
          style={[
            buttonBaseStyle,
            { backgroundColor: customBgColor ?? NEW_COLOR.ACTIONPRIMARYBUTTON_BG, width },
            style,
          ]}
        >
          {content}
        </ViewComponent>
      </CommonTouchableOpacity>
    );
  }

  return (
    <CommonTouchableOpacity
      onPress={onPress}
      disabled={disable}
      activeOpacity={0.8}
      style={[
        buttonBaseStyle,
        {
          width,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: customBgColor ?? COLORS.ACTIONSECONDARYBORDER,
        },
        style,
      ]}
    >
      {content}
    </CommonTouchableOpacity>
  );
};

export default ActionButton;