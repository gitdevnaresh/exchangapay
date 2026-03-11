import React, { useCallback, useEffect } from 'react';
import Container from '../../../newComponents/container/container';
import ViewComponent from '../../../newComponents/view/view';
import PageHeader from '../../../newComponents/pageHeader/pageHeader';
import TextMultiLanguage from '../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import ImageUri from '../../../newComponents/imageComponents/image';
import { COMMON_SVG_URLS } from '../../../assets/blobUrls';
import { s } from '../../../constants/theme/scale';


const ApplyCardAllSet: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const isFocussed=useIsFocused();
  const cardId = route.params?.cardId;
  const card = route.params?.card;

  const handleContinue = useCallback(() => {
    navigation.navigate('GetMyCard', { cardId, card });
  }, [navigation, cardId, card]);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleContinue();
    }, 1000);
    return () => clearTimeout(timer);
  }, [isFocussed]);

  return (
    <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
      <Container>
        <PageHeader
          onBackPress={handleBackPress}
        />

        <ViewComponent style={[commonStyles.myAuto]}>
          <ViewComponent style={[commonStyles.mxAuto]}>
              <ImageUri uri={COMMON_SVG_URLS.success} width={s(120)} height={s(92)} />

            </ViewComponent>

          <ViewComponent style={[commonStyles.mt32,commonStyles.textCenter, {paddingHorizontal: s(50)}]}>
            <TextMultiLanguage
              text="GLOBAL_CONSTANTS.CONGRATULATIONS_ALL_SET"
              style={[commonStyles.fs24, commonStyles.fw700, commonStyles.textWhite, commonStyles.textCenter, commonStyles.mb16]}
            />
            <TextMultiLanguage
              text={'GLOBAL_CONSTANTS.THANK_YOU_FOR_VERIFYING'}
              style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textGrey, commonStyles.textCenter]}
            />
          </ViewComponent>

          <ViewComponent style={[commonStyles.sectionGap]} />
        </ViewComponent>

        <ViewComponent style={[commonStyles.sectionGap]} />
      </Container>
    </ViewComponent>
  );
};

export default ApplyCardAllSet;
