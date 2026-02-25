import React from 'react';
import { Text, View } from 'react-native'; // Import Text
import { SvgUri } from 'react-native-svg'; // Import SvgUri
import { useSelector } from 'react-redux';
import { s } from '../../constants/styels/scale';
import { getThemedCommonStyles } from '../CommonStyles';
import { useThemeColors } from '../../hooks/themedHook/useThemeColors';
import { useLngTranslation } from '../../hooks/languagesHook/useLngTranslation';
import ViewComponent from '../view/view';
interface NoDataComponentProps {
  Description?: any;
}
const NoDataComponent = ({ Description = false }: NoDataComponentProps) => {
  const { t } = useLngTranslation();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const appThemeSetting = useSelector((state: any) => state.userReducer?.appTheme)
  const lightThemeImageUri = 'https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/nodataimage.svg';
  const blackThemeImageUri = 'https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/arthapay_nodata.svg';

  let message: string;
  if (Description) { // If Description is truthy (e.g., a string key, true, a number)
    message = t(String(Description)); // Convert to string to handle boolean/number Descriptions for t()
  } else { // If Description is falsy (e.g., false, null, undefined, 0, "")
    message = t("GLOBAL_CONSTANTS.NO_DATA_AVAILABLE");
  }

  return (
    <View style={commonStyles.p14}>

      {appThemeSetting === 'dark' ? (
        <ViewComponent style={[commonStyles.alignCenter, commonStyles.mxAuto, { width: s(120), height: s(120) }]}>

          <SvgUri
            height={s(120)}
            width={s(120)}
            uri={blackThemeImageUri}
            style={[commonStyles.mxAuto]}
          />
        </ViewComponent>
      ) : (
        <ViewComponent style={[commonStyles.alignCenter, commonStyles.mxAuto, { width: s(120), height: s(120) }]}>
          <SvgUri
            height={s(120)}
            style={[commonStyles.alignCenter]}
            width={s(120)}
            uri={lightThemeImageUri}
          />
        </ViewComponent>
      )}
      <Text style={[commonStyles.sectionSubTitleText, commonStyles.textCenter, commonStyles.mt6]}>
        {message}
      </Text>
    </View>
  );
};

export default NoDataComponent;
