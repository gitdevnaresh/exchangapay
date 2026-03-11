import React from 'react';
import { Text, View } from 'react-native'; // Import Text
import { SvgUri } from 'react-native-svg'; // Import SvgUri
import { useSelector } from 'react-redux';
import { s } from '../../constants/theme/scale';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useLngTranslation } from '../../hooks/useLngTranslation';

import { getThemedCommonStyles } from '../../assets/styles/CommonStyles';
import ViewComponent from '../view/view';
import { COMMON_SVG_URLS } from '../../assets/blobUrls';
interface NoDataComponentProps {
  Description?: any;
  isPopup?: boolean; // Add isPopup prop
  noDataStyle?: object; // Add noDataStyle prop
}
const NoDataComponent = ({ Description = false, isPopup = false, noDataStyle = {} }: NoDataComponentProps) => {
  const { t } = useLngTranslation();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const REVERSE_NEW_COLOR = useThemeColors(true);
    const reversCommonStyles = getThemedCommonStyles(REVERSE_NEW_COLOR);
 
  const appThemeSetting = useSelector((state: any) => state.userReducer?.appTheme)
  const lightThemeImageUri = COMMON_SVG_URLS.nodataLight;
  const blackThemeImageUri = COMMON_SVG_URLS.nodataDark;


  let message: string;
  if (Description) { // If Description is truthy (e.g., a string key, true, a number)
    message = t(String(Description)); // Convert to string to handle boolean/number Descriptions for t()
  } else { // If Description is falsy (e.g., false, null, undefined, 0, "")
    message = t("GLOBAL_CONSTANTS.NO_DATA_AVAILABLE");
  }

  // Choose styles based on isPopup
  const stylesToUse = isPopup ? reversCommonStyles : commonStyles;

  return (
    <View style={[stylesToUse.p14, noDataStyle]}>

      {appThemeSetting === 'dark' ? (
        <SvgUri
          height={s(80)}
          width={s(80)}
          uri={blackThemeImageUri}
          style={[stylesToUse.mxAuto]}
        />
      ) : (
        <ViewComponent style={stylesToUse.alignCenter}>
        <SvgUri
          height={s(80)}
            style={[stylesToUse.alignCenter]}
          width={s(80)}
          uri={lightThemeImageUri}
        />
        </ViewComponent>
      )}
      <Text style={[stylesToUse.fs14, stylesToUse.fw500, stylesToUse.textWhite, stylesToUse.textCenter, stylesToUse.mt8]}>
        {message}
      </Text>
    </View>
  );
};

export default NoDataComponent;