import React, { useEffect } from 'react';
import { Linking, BackHandler } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getThemedCommonStyles } from '../../../../components/CommonStyles';
import Container from '../../../../components/container/container';
import ButtonComponent from '../../../../components/buttons/button';
import { useThemeColors } from '../../../../hooks/themedHook/useThemeColors';
import ViewComponent from '../../../../components/view/view';
import TextMultiLanguage from '../../../../components/textComponets/multiLanguageText/textMultiLangauge';
import { Ionicons } from '@expo/vector-icons';
import ScrollViewComponent from '../../../../components/scrollView/scrollView';
import AlertsCarousel from '../../Dashboard/components/allertCases';
import ParagraphComponent from '../../../../components/textComponets/paragraphText/paragraph';
import SafeAreaViewComponent from '../../../../components/safeArea/safeArea';
import CommonTouchableOpacity from '../../../../components/touchableComponents/touchableOpacity';
import { getTabsConfigation, supportMail } from '../../../../../configuration';
import useLogout from '../../../../hooks/logout/useLogout';
import { RootState } from '../interface';
const CloseAccount = () => {
  const userInfo = useSelector((state: RootState) => state.userReducer?.userDetails);
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const { logout } = useLogout();
  const identityConfig = getTabsConfigation("IDENITY_CONFIG");
  useEffect(() => {
    const onBackPress = () => {
      return true; // prevent default behavior
    };
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, []);

  const handleConfirm = async () => {
    handleLgout();
  }


  const handleLgout = async () => {
    let navigation = identityConfig?.AUTH0_SDK_LOGIN ? "Auth0Signin" : ""
    await logout(identityConfig?.AUTH0_SDK_LOGIN, navigation)
  };
  const handleClickMail = () => {
    const url = `mailto:${userInfo?.metadata?.AdminEmail || supportMail}`;
    Linking.openURL(url)
  }
  return (
    <SafeAreaViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
      <Container style={[commonStyles.container, commonStyles.flex1]}>
        <ViewComponent style={[commonStyles.flex1]}>
          <AlertsCarousel commonStyles={commonStyles} screenName="Onbaording" />
          <ViewComponent style={[commonStyles.flex1]}>
            <ScrollViewComponent contentContainerStyle={{ flexGrow: 1 }}>
              <ViewComponent style={[commonStyles.flex1, { justifyContent: 'space-between' }]}>
                <ViewComponent style={[commonStyles.flex1, { justifyContent: 'center', paddingBottom: 24 }]}>
                  <ParagraphComponent text={userInfo?.customerState} style={[commonStyles.fs24, commonStyles.fw700, commonStyles.textCenter, commonStyles.sectionGap, commonStyles.textWhite,]} />
                  <ViewComponent>
                    <Ionicons
                      name="close-circle-outline"
                      size={100}
                      color={NEW_COLOR.TEXT_RED}
                      style={[commonStyles.mxAuto]}
                    />
                    <TextMultiLanguage
                      text={'GLOBAL_CONSTANTS.THIS_ACCOUNT_IS_NO_LONGER_ACTIVE'}
                      style={[
                        commonStyles.sectionTitle,
                        commonStyles.textCenter,
                        commonStyles.mb6
                      ]}
                    />
                    <ParagraphComponent
                      style={[
                        commonStyles.textCenter,
                        commonStyles.sectionsubtitlepara,
                        commonStyles.mb6

                      ]}
                      text={'GLOBAL_CONSTANTS.REJECT_UNDER_REVIEW'}
                    />
                    <CommonTouchableOpacity onPress={handleClickMail}>
                      <ParagraphComponent
                        style={[
                          commonStyles.textCenter,
                          commonStyles.textlinks
                        ]}
                        text={userInfo?.metadata?.AdminEmail || supportMail}
                      />
                    </CommonTouchableOpacity>
                  </ViewComponent>
                </ViewComponent>

                <ViewComponent>
                  <ButtonComponent
                    title={'GLOBAL_CONSTANTS.LOGIN'}
                    onPress={() => handleConfirm()}
                  />
                  <ViewComponent style={[commonStyles.buttongap]} />
                </ViewComponent>
              </ViewComponent>
            </ScrollViewComponent>
          </ViewComponent>
        </ViewComponent>
      </Container>
    </SafeAreaViewComponent>
  );
};

export default CloseAccount;

