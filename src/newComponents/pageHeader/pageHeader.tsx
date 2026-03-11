import React from "react";
import { View, TouchableOpacity, StyleProp, ViewStyle, TextStyle } from "react-native";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { s } from "../theme/scale";
import ImageUri from "../imageComponents/image";
import ParagraphComponent from "../textComponets/paragraphText/paragraph";
import { useLngTranslation } from "../../hooks/useLngTranslation";
import { useThemeColors } from "../../hooks/useThemeColors";
import { getThemedCommonStyles } from "../../assets/styles/CommonStyles";
import BackArrow from "../../assets/mainmenuicons/backArrow";
import { COMMON_SVG_URLS } from "../../assets/blobUrls";
interface PageHeaderProps {
  onBackPress?: () => void;
  title?: string;
  titleStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  isrefresh?: boolean;
  onRefresh?: () => void;
  rightActions?: React.ReactNode;
  showLogo?: boolean;
  headerRightStyle?: StyleProp<ViewStyle>;
  backIcon?: boolean;
  disable?: boolean;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  onBackPress,
  title,
  titleStyle,
  containerStyle,
  isrefresh,
  onRefresh,
  rightActions,
  showLogo = false,
  headerRightStyle,
  backIcon = true,
  disable = false,
}) => {
  const { t } = useLngTranslation();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  return (
    <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.mb16, containerStyle]}>
      <View style={[commonStyles.dflex, commonStyles.alignCenter]}>
        {backIcon && <TouchableOpacity activeOpacity={0.8} onPress={onBackPress} disabled={disable} style={[commonStyles?.backArrow, commonStyles.mt3, { marginLeft: -16 },]}>
          <BackArrow />
        </TouchableOpacity>}
        {showLogo ? <View style={[{ minWidth: s(100), minHeight: s(48) }]}>
          <ImageUri width={s(100)} height={s(48)} style={[commonStyles.mxAuto]} uri={COMMON_SVG_URLS.pageheaderDarkThemeIcon}/>
        </View>
          :
          <View><ParagraphComponent style={[commonStyles.fs18, commonStyles.fw600, commonStyles.textCenter, titleStyle, { maxWidth: s(325) }]} text={t(title ?? "")} numberOfLines={1} /></View>}

      </View>
      <View style={[commonStyles?.dflex, commonStyles.gap12, headerRightStyle, { minWidth: s(24) }]}>
        {rightActions && <View style={[commonStyles.alignCenter, commonStyles.dflex, commonStyles.mb4]}>
          {rightActions}
        </View>}
        {isrefresh && <TouchableOpacity activeOpacity={0.6} onPress={onRefresh}>
          <MaterialIcons name="refresh" size={s(24)} color={NEW_COLOR.TEXT_WHITE} style={[commonStyles.mt4]} />
        </TouchableOpacity>}
      </View>
    </View>

  );
};

export default PageHeader;
