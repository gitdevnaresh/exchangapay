import { useNavigation, useRoute } from '@react-navigation/native';
import ViewComponent from '../../../newComponents/view/view';
import Container from '../../../newComponents/container/container';
import PageHeader from '../../../newComponents/pageHeader/pageHeader';
import ButtonComponent from '../../../newComponents/buttons/button';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import TextMultiLanguage from '../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import ImageUri from '../../../newComponents/imageComponents/image';
import { COMMON_SVG_URLS } from '../../../assets/blobUrls';
import { s } from '../../../constants/theme/scale';

type ComingSoonRouteParams = {
  Dashboard?: boolean;
  customHeader?: {
    title?: string;
    showBackButton?: boolean;
  };
  customNavigtion?: () => void
};

const ComingSoon = ({ pageHeader = true, customNavigtion }: { pageHeader?: boolean, customNavigtion?: () => void }) => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { Dashboard = false, customHeader } = route.params || {};

  const NEW_COLOR = useThemeColors();

  const commonStyles = getThemedCommonStyles(NEW_COLOR);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => { handleBackPress(); return true; }
    );
    return () => backHandler.remove();
  }, []);

  const handleBackPress = () => {
    if(customNavigtion) {
      customNavigtion();
    }else{
      navigation.goBack();
    }
    return true;
  };

  const hanledashboard = () => {
    navigation.navigate('Dashboard');
  };

  return (
    <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
      <Container>
        {pageHeader && (
          <PageHeader 
            title={customHeader?.title || "GLOBAL_CONSTANTS.COMING_SOON"} 
            onBackPress={customHeader?.showBackButton !== false ? handleBackPress : undefined} 
          />
        )}

        <ViewComponent style={[commonStyles.flex1, commonStyles.justifyCenter, commonStyles.alignCenter]}>
          <ViewComponent style={[commonStyles.alignCenter, commonStyles.sectionGap]}>
            <ViewComponent style={[commonStyles.mb36]}>
              <ImageUri uri={COMMON_SVG_URLS.comingSoon} width={s(120)} height={s(90)} />
            </ViewComponent>

            <TextMultiLanguage
              style={[
                commonStyles.textCenter,
                commonStyles.textWhite,
                commonStyles.fs24,
                commonStyles.fw700,
                commonStyles.mb16
              ]}
              text={"GLOBAL_CONSTANTS.COMING_SOON"}
            />

          <ViewComponent>
            <TextMultiLanguage
              style={[
                commonStyles.textlinkgrey,
                commonStyles.textCenter,
                commonStyles.fw400,
                commonStyles.fs14
              ]}
              text={"GLOBAL_CONSTANTS.WE_ARE_WORKING_HARD_TO_BRING_YOU_NEW_FEATURES"}
            />
          </ViewComponent>
        </ViewComponent>
        <ViewComponent style={[commonStyles.sectionGap]}/>
        <ViewComponent style={[commonStyles.sectionGap]}/>
        </ViewComponent>
        {Dashboard && (
          <ViewComponent style={[commonStyles.pb24]}>
            <ButtonComponent 
              title={"GLOBAL_CONSTANTS.GO_TO_HOME"} 
              onPress={hanledashboard}
              capitalizeTitle={false}
            />
          </ViewComponent>
        )}
      </Container>
    </ViewComponent>
  );
};
export default ComingSoon;