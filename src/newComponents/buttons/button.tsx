import React from 'react';
import { View, StyleProp, TextStyle, ViewStyle } from 'react-native';
import { Button } from 'react-native-elements';
import { IconNode } from 'react-native-elements/dist/icons/Icon';
import { useLngTranslation } from "../../hooks/useLngTranslation";
import { useThemeColors } from '../../hooks/useThemeColors';
import { ThemeColors } from '../../constants/theme/variables';
import { getThemedCommonStyles } from '../../assets/styles/CommonStyles';

interface DefaultButtonProps {
  icon?: IconNode;
  title?: string;
  onPress?: () => void;
  customTitleStyle?: StyleProp<TextStyle>;
  customButtonStyle?: StyleProp<ViewStyle>;
  customContainerStyle?: StyleProp<ViewStyle>;
  disable?: boolean;
  loading?: boolean;
  multiLanguageAllows?: boolean;
  solidBackground?: boolean;
  capitalizeTitle?: boolean;
  currency?: string;
}

const ButtonComponent = ({
  icon,
  title = 'Continue',
  onPress,
  customTitleStyle,
  customButtonStyle,
  customContainerStyle,
  disable = false,
  loading = false,
  multiLanguageAllows = true,
  solidBackground = false,
  capitalizeTitle = true,
  currency,
}: DefaultButtonProps) => {
  const { t } = useLngTranslation();
  const NEW_COLOR: ThemeColors = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const displayTitle = currency
    ? `${multiLanguageAllows ? t(title) : title} ${currency}`
    : (multiLanguageAllows ? t(title) : title);

  // Compose style keys from CommonStyles
  const buttonTitleStyle = [
    commonStyles.fw700,
    commonStyles.fs16,
    capitalizeTitle && commonStyles.textCapitalize, // Conditionally apply
    solidBackground ? commonStyles.textAlwaysWhite : commonStyles.buttonText,
    customTitleStyle,
  ];

  const buttonStyle = [
    commonStyles.justifyCenter,
    commonStyles.alignCenter,
    commonStyles.px16,
    commonStyles.bgtransparent,
    commonStyles.h56,
    customButtonStyle,
  ];

  const disabledStyle = [
    ...buttonStyle,
    commonStyles.bgGrayLight,
  ];

  const disabledTitleStyle = [
    commonStyles.fw700,
    commonStyles.fs16,
    capitalizeTitle && commonStyles.textCapitalize, // Conditionally apply
    commonStyles.textGrey6,
    customTitleStyle,
  ];

  const containerStyle = [
    commonStyles.rounded5,
    commonStyles.bgtransparent,
    customContainerStyle,
  ];

  const solidContainerStyle = [
    commonStyles.btn_Gray,
    commonStyles.rounded100,
    commonStyles.overflowHidden,
    customContainerStyle,
    disable && commonStyles.bgGrayLight,
  ];

  const outlineContainerStyle = [
    commonStyles.bg_yellow,
    commonStyles.rounded100,
    commonStyles.overflowHidden,
    customContainerStyle,
    disable && commonStyles.bgGrayLight,
  ];

  return (
    <View style={solidBackground ? solidContainerStyle : outlineContainerStyle}>
      <Button
        titleStyle={buttonTitleStyle}
        buttonStyle={buttonStyle}
        disabledStyle={disabledStyle}
        disabledTitleStyle={disabledTitleStyle}
        loadingProps={{
          color: NEW_COLOR.TEXT_ALWAYS_WHITE,
        }}
        containerStyle={containerStyle}
        title={displayTitle}
        onPress={onPress}
        loading={loading}
        icon={icon}
        disabled={disable}
      />
    </View>
  );
};

export default ButtonComponent;