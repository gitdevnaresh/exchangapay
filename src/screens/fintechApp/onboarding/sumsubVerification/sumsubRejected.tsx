import React, { useEffect, useState } from 'react';
import { SafeAreaView, TouchableOpacity, Linking, BackHandler } from 'react-native';
import AuthService from '../../../../apiServices/onBoarding/auth';
import { useDispatch, useSelector } from 'react-redux';
import { getThemedCommonStyles } from '../../../../components/CommonStyles';
import Container from '../../../../components/container/container';
import { setUserInfo } from '../../../../redux/actions/actions';
import ButtonComponent from '../../../../components/buttons/button';
import { useThemeColors } from '../../../../hooks/themedHook/useThemeColors';
import ViewComponent from '../../../../components/view/view';
import useMemberLogin from '../../../../hooks/userInfoHook';
import TextMultiLanguage from '../../../../components/textComponets/multiLanguageText/textMultiLangauge';
import { Ionicons } from '@expo/vector-icons';
import ScrollViewComponent from '../../../../components/scrollView/scrollView';
import AlertsCarousel from '../../Dashboard/components/allertCases';
import ParagraphComponent from '../../../../components/textComponets/paragraphText/paragraph';
import ConfirmLogout from '../../../commonScreens/logout/comfirmLogout';
import { useSumsubSDK } from '../../../../hooks/sumsubHooks/useSumsubSDK';
import { t } from 'i18next';
import { supportMail } from '../../../../../configuration';
import useLogout from '../../../../hooks/logout/useLogout';
import { store } from '../../../../redux/reducers';
import { RootState } from '../interface';
type AppDispatch = typeof store.dispatch;

const SumsubRejected = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [saveLoading, setSaveLoading] = useState<boolean>(false)
  const userInfo = useSelector((state: RootState) => state.userReducer?.userDetails);
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const [isVisible, setIsVisible] = useState(false)
  const { launchSumsubSDK } = useSumsubSDK()
  const { getMemDetails, isOnboarding } = useMemberLogin();
  const { logout } = useLogout();
  useEffect(() => {
    const onBackPress = () => {
      return true; // prevent default behavior
    };
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, []);
  const handleClose = () => {
    setIsVisible(false)
  }
  const handleConfirm = async () => {
    setIsVisible(false)
    handleLgout();
  }
  const handleLogoutBtn = () => {
    setIsVisible(true)
  }

  const handleLgout = async () => {
    await logout();
  };
  const updateUserInfo = () => {
    setSaveLoading(true)
    AuthService.getMemberInfo().then((userLoginInfo: any) => {
      dispatch(setUserInfo(userLoginInfo.data));
      if (userLoginInfo.data?.customerState === "Approved") {
        getMemDetails();
        setSaveLoading(false)
      } else {
        getMemDetails(false, "AccountProgress");
        setSaveLoading(false)
      }
    }).catch(() => {
      setSaveLoading(false)
    })
  }
  const handleClickMail = () => {
    const url = `mailto:${userInfo?.metadata?.AdminEmail || supportMail}`;
    Linking.openURL(url)
  }
  const handleContinue = () => {
    launchSumsubSDK();
  };
  const handleRefresh = () => {
    getMemDetails(true);
  };
  return (
    <SafeAreaView style={[commonStyles.screenBg, commonStyles.flex1]}>
      <Container style={[commonStyles.container, commonStyles.flex1]}>
        <ViewComponent style={[commonStyles.flex1]}>
          <AlertsCarousel commonStyles={commonStyles} screenName="Onbaording" />
          <ViewComponent style={[commonStyles.flex1]}>
            <ScrollViewComponent contentContainerStyle={{ flexGrow: 1 }}>
              <ViewComponent style={[commonStyles.flex1, { justifyContent: 'space-between' }]}>
                <ViewComponent style={[commonStyles.flex1, { justifyContent: 'center', paddingBottom: 24 }]}>
                  <ParagraphComponent text={`${userInfo?.accountType?.toLowerCase() === "business" ? "KYB" : "KYC"} ${t("GLOBAL_CONSTANTS.VERFICATION_RREJECTED")}`}
                    style={[commonStyles.fs24, commonStyles.fw700, commonStyles.textCenter, commonStyles.sectionGap, commonStyles.textWhite,]} />
                  <ViewComponent>
                    <Ionicons
                      name="close-circle-outline"
                      size={100}
                      color={NEW_COLOR.TEXT_RED}
                      style={[commonStyles.mxAuto, commonStyles.titleSectionGap]}
                    />
                    {userInfo?.kycRemarks && <ParagraphComponent
                      style={[
                        commonStyles.textCenter,
                        commonStyles.fs16,
                        commonStyles.fw400,
                        commonStyles.textRed,
                      ]}
                      text={'GLOBAL_CONSTANTS.REASON'}
                      children={
                        <ParagraphComponent
                          style={[
                            commonStyles.sectionsubtitlepara
                          ]}
                          text={`${':'} ${userInfo?.kycRemarks}`}
                        />
                      }
                    />}
                    <TextMultiLanguage
                      text={'GLOBAL_CONSTANTS.KYC_REJECTED_MESSAGE'}
                      style={[
                        commonStyles.sectionsubtitlepara,
                        commonStyles.textCenter,
                        commonStyles.mb6

                      ]}
                    />
                    <ParagraphComponent
                      style={[
                        commonStyles.sectionsubtitlepara,
                        commonStyles.textCenter,
                        commonStyles.mb6
                      ]}
                      text={'GLOBAL_CONSTANTS.KYC_REJECTED_UNDER_REVIEW_AT'}
                    />
                    <TouchableOpacity onPress={handleClickMail}>
                      <ParagraphComponent
                        style={[
                          commonStyles.textCenter,
                          commonStyles.textlinks
                        ]}
                        text={userInfo?.metadata?.AdminEmail || supportMail}
                      />
                    </TouchableOpacity>
                    <ParagraphComponent
                      style={[commonStyles.sectionsubtitlepara, commonStyles.textCenter]}
                      text={"GLOBAL_CONSTANTS.THANK_YOU_FOR_YOUR_UNDERSTANDING"}
                    />
                  </ViewComponent>

                </ViewComponent>

                <ViewComponent>
                  {userInfo?.reKYC?.toLowerCase() == 'reapply' && <ButtonComponent
                    title={`${t("GLOBAL_CONSTANTS.RESUBMIT")} ${userInfo?.accountType?.toLowerCase() === "business" ? "KYB" : "KYC"}`}
                    loading={saveLoading}
                    onPress={handleContinue}
                  />}
                  {userInfo?.reKYC?.toLowerCase() !== 'reapply' && <ButtonComponent
                    title={t("GLOBAL_CONSTANTS.REFRESH")}
                    loading={isOnboarding}
                    onPress={handleRefresh}
                  />}
                  <ViewComponent style={[commonStyles.buttongap]} />
                  <ButtonComponent
                    title={'GLOBAL_CONSTANTS.LOGOUT'}
                    solidBackground={true}
                    onPress={() => handleLogoutBtn()}
                  />
                  <ViewComponent style={[commonStyles.buttongap]} />
                </ViewComponent>

                <ConfirmLogout
                  isVisible={isVisible}
                  onClose={handleClose}
                  onConfirm={handleConfirm} />
              </ViewComponent>
            </ScrollViewComponent>
          </ViewComponent>
        </ViewComponent>
      </Container>
    </SafeAreaView>
  );
};

export default SumsubRejected;

