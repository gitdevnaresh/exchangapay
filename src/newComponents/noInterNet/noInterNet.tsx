import React from 'react';
import {Modal } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import Container from '../container/container';
import { s } from '../../constants/theme/scale';
import ViewComponent from '../view/view';
import { useThemeColors } from '../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../assets/styles/CommonStyles';
import TextMultiLanguage from '../textComponets/multiLanguageText/textMultiLangauge';
import { NoInternetIcon } from '../../assets/vectorAssets';

 
const NetworkStatus = () => {
  const netInfo = useNetInfo();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  return (
    !netInfo.isConnected && (
      <ViewComponent>
        <Modal visible={true} style={{ flex: 1, margin: 0,backgroundColor:NEW_COLOR.BG_PURPLE }}>
        <Container>
          <ViewComponent style={[commonStyles.flex1,commonStyles.justifyCenter,commonStyles.alignCenter,commonStyles.dflex]}>
            <ViewComponent style={[commonStyles.alignCenter,commonStyles.flex1,commonStyles.justifyCenter]}>
              <NoInternetIcon width={s(120)} height={s(92)}/>
              <ViewComponent style={[commonStyles.sectionGap]} />
              <TextMultiLanguage style={[commonStyles.fs16,commonStyles.fw500, commonStyles.textGrey,commonStyles.textCenter]} text={"GLOBAL_CONSTANTS.SOMETHING_WENT_WRONG_INTERNET_CONNECTION_PLEASE_CHECK"} />
              <ViewComponent style={[commonStyles.mb24]} />
              <ViewComponent style={[commonStyles.sectionGap]} />
            </ViewComponent>
          </ViewComponent>
        </Container>
      </Modal>
      </ViewComponent>
    )
  );
}; 
export default NetworkStatus;