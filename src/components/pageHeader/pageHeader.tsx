import React from "react";
import { View, TouchableOpacity, StyleProp, ViewStyle, TextStyle } from "react-native";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { s } from "../../constants/styels/scale";
import ImageUri from "../imageComponents/image";
import ParagraphComponent from "../textComponets/paragraphText/paragraph";
import { useLngTranslation } from "../../hooks/languagesHook/useLngTranslation";
import { useThemeColors } from "../../hooks/themedHook/useThemeColors";
import { getThemedCommonStyles } from "../CommonStyles";
import BackArrow from "../svgIcons/cardsicons/backarroe";
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
}) => {
  const { t } = useLngTranslation();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  return (
    <View style={[commonStyles.pageheader]}>
      <TouchableOpacity activeOpacity={0.8} onPress={onBackPress} style={[commonStyles?.backArrow, commonStyles.Pageheadericonbg]}>
        <BackArrow />
      </TouchableOpacity>
      {showLogo ? <View style={[{ minWidth: s(100), minHeight: s(48) }]}>
        <ImageUri width={s(100)} height={s(48)} style={[commonStyles.mxAuto]} uri='https://digitalbankdevtststorage.blob.core.windows.net/digitalbankimages/logo-dark.svg' />
      </View>
        :
        <View style={[commonStyles.flex1]}><ParagraphComponent style={[commonStyles.pageheadertitle, titleStyle]} text={t(title ?? "")} numberOfLines={1} /></View>}
      <View style={[commonStyles?.dflex, commonStyles.gap12, headerRightStyle, { minWidth: s(24) }]}>
        {rightActions && <View>
          {rightActions}
        </View>}
        {isrefresh && <TouchableOpacity activeOpacity={0.6} onPress={onRefresh}>
          <MaterialIcons name="refresh" size={s(24)} color={NEW_COLOR.TEXT_WHITE} style={[commonStyles.Pageheaderrefreshicon]} />
        </TouchableOpacity>}
      </View>
    </View>
  );
};

export default PageHeader;

