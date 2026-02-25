import React, { useEffect } from 'react';
import { BackHandler, Dimensions } from 'react-native';
import { getThemedCommonStyles } from '../../../components/CommonStyles';
import Container from '../../../components/container/container';
import { useNavigation } from '@react-navigation/native';
import { useThemeColors } from '../../../hooks/themedHook/useThemeColors';
import PageHeader from '../../../components/pageHeader/pageHeader';
import ViewComponent from '../../../components/view/view';
import { RocketComming, RocketCommingDark, } from '../../../assets/svg';
import { useIsDarkTheme } from '../../../hooks/themedHook';
import TextMultiLanguage from '../../../components/textComponets/multiLanguageText/textMultiLangauge';
import SafeAreaViewComponent from '../../../components/safeArea/safeArea';


const ComingSoon = ({ pageHeader = true }: { pageHeader?: boolean }) => {
  const { width, height } = Dimensions.get("window");

  const navigation = useNavigation();
  const NEW_COLOR = useThemeColors();
  const isDarkTheme = useIsDarkTheme();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => { handleBackPress(); return true; }
    );
    return () => backHandler.remove();

  }, [])

  const handleBackPress = () => {
    navigation.goBack();
    return true;
  };

  return (
    <SafeAreaViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      <Container style={[commonStyles.container]}>
        {pageHeader && <PageHeader title='GLOBAL_CONSTANTS.COMING_SOON' onBackPress={handleBackPress} />}

        <ViewComponent style={[commonStyles.myAuto]}>
          <ViewComponent>

            <ViewComponent
              style={[commonStyles.mxAuto, {
                width: width * 0.8,
                height: height * 0.50,
              }, commonStyles.commonscreensbottom]}
            >
              {isDarkTheme ? (
                <RocketComming width="100%" height="100%" />
              ) : (
                <RocketCommingDark width="100%" height="100%" />
              )}
            </ViewComponent>
            <TextMultiLanguage style={[commonStyles.nodatascreentitle]} text={'GLOBAL_CONSTANTS.COMING_SOON'} />
            <TextMultiLanguage style={[commonStyles.nodatascreenPara]} text={"GLOBAL_CONSTANTS.COMING_SOON_CONTENT"} />
          </ViewComponent>


        </ViewComponent>
      </Container>

    </SafeAreaViewComponent>
  );
};


export default ComingSoon;
