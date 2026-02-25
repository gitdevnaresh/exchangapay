import React from 'react';
import { View, Modal, Dimensions } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import Container from '../container/container';
import { useThemeColors } from '../../hooks/themedHook/useThemeColors';
import { getThemedCommonStyles } from '../CommonStyles';
import TextMultiLanguage from '../textComponets/multiLanguageText/textMultiLangauge';
import { useIsDarkTheme } from '../../hooks/themedHook';
import { NoInternetLightImage, NOWifi } from '../../assets/svg';
import ViewComponent from '../view/view';

const NetworkStatus = () => {
  const netInfo = useNetInfo();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const isDarkTheme = useIsDarkTheme();
  const { width, height } = Dimensions.get("window");

  return (
    !netInfo.isConnected && (
      <View style={[]}>
        <Modal visible={true} style={[commonStyles.screenBg]}>
          <Container style={commonStyles.container}>
            <View style={[commonStyles.myAuto]}>
              <View style={[commonStyles.mxAuto, commonStyles.alignCenter]}>

                <ViewComponent
                  style={[{
                    width: width * 0.8,
                    height: height * 0.28,
                    alignSelf: "center",
                  }, commonStyles.sectionGap]}
                >
                  {isDarkTheme ? (
                    <NOWifi width="100%" height="100%" />
                  ) : (
                    <NoInternetLightImage width="100%" height="100%" />
                  )}
                </ViewComponent>
                <TextMultiLanguage style={[commonStyles.nodatascreentitle]} text={"GLOBAL_CONSTANTS.NO_INTERNET_TITLE"} />
                <TextMultiLanguage style={[commonStyles.nodatascreenPara]} text={"GLOBAL_CONSTANTS.NO_INTERNET_CONTENT"} />
              </View>
            </View>
          </Container>
        </Modal>
      </View>
    )
  );
};



export default NetworkStatus;