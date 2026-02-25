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
import ImageUri from '../../../../components/imageComponents/image';
import { s } from '../../../../constants/styels/scale';
import ScrollViewComponent from '../../../../components/scrollView/scrollView';
import AlertsCarousel from '../../Dashboard/components/allertCases';
import ParagraphComponent from '../../../../components/textComponets/paragraphText/paragraph';
import ConfirmLogout from '../../../commonScreens/logout/comfirmLogout';
import { supportMail } from '../../../../../cofiguration';
import useLogout from '../../../../hooks/logout/useLogout';
import { store } from '../../../../redux/reducers';
import { RootState } from '../interface';
type AppDispatch = typeof store.dispatch;

const AccountProgress = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [saveLoading, setSaveLoading] = useState<boolean>(false)
  const userInfo = useSelector((state: RootState) => state.userReducer?.userDetails);
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const [isVisible, setIsVisible] = useState(false)
  const { logout } = useLogout();
  const [refresh, setRefresh] = useState<boolean>(false);
  const { getMemDetails } = useMemberLogin();
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
    await logout()
  };
  const onRefresh = () => {
    setRefresh(true);
    getMemDetails(false, "AccountProgress");
    setRefresh(false);
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
  return (
    <SafeAreaView style={[commonStyles.screenBg, commonStyles.flex1]}>
      <Container style={[commonStyles.container, commonStyles.flex1]}>
        <ViewComponent style={[commonStyles.flex1]}>
          <AlertsCarousel commonStyles={commonStyles} screenName="Onbaording" />
          <ViewComponent style={[commonStyles.flex1]}>
            <ScrollViewComponent contentContainerStyle={{ flexGrow: 1 }} refreshing={refresh} onRefresh={onRefresh} >
              <ViewComponent style={[commonStyles.flex1, { justifyContent: 'space-between' }]}>
                <ViewComponent style={[commonStyles.flex1, { justifyContent: 'center', paddingBottom: 24 }]}>
                  <ParagraphComponent text={userInfo?.customerState} style={[commonStyles.fs24, commonStyles.fw700, commonStyles.textCenter, commonStyles.sectionGap, commonStyles.textWhite,]} />
                  {userInfo?.customerState == 'Under Review' && (
                    <ViewComponent>
                      <ImageUri source={require('../../../../assets/images/underReview.png')} width={s(120)} height={s(120)} style={[commonStyles.mxAuto]} />
                      <TextMultiLanguage text={'GLOBAL_CONSTANTS.UNDER_REVIEW_MESSAGE'} style={[commonStyles.sectionsubtitlepara, commonStyles.textCenter,]} />
                      <ParagraphComponent
                        style={[
                          commonStyles.textCenter,
                          commonStyles.sectionsubtitlepara
                        ]}
                        text={'GLOBAL_CONSTANTS.SUPPORT_UNDER_REVIEW'}
                      />
                      <TouchableOpacity onPress={handleClickMail}>
                        <ParagraphComponent
                          style={[
                            commonStyles.textCenter,
                            commonStyles.textlinks,
                            commonStyles.mt10
                          ]}
                          text={userInfo?.metadata?.AdminEmail || supportMail}
                        />
                      </TouchableOpacity>
                    </ViewComponent>
                  )}

                  {userInfo?.customerState == 'Rejected' && (
                    <ViewComponent>
                      <Ionicons
                        name="close-circle-outline"
                        size={100}
                        color={NEW_COLOR.TEXT_RED}
                        style={[commonStyles.mxAuto, commonStyles.titleSectionGap]}
                      />
                      <ParagraphComponent
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
                              commonStyles.primarytext
                            ]}
                            text={`${':'} ${userInfo?.reason || userInfo?.remarks}`}
                          />
                        }
                      />
                      <TextMultiLanguage
                        text={'GLOBAL_CONSTANTS.REJECTED_MESSAGE'}
                        style={[
                          commonStyles.primarytext,
                          commonStyles.textCenter,
                          commonStyles.mb6, commonStyles.mt6

                        ]}
                      />


                      <ParagraphComponent
                        style={[
                          commonStyles.sectionsubtitlepara,
                          commonStyles.textCenter,
                          commonStyles.mb6
                        ]}
                        text={"GLOBAL_CONSTANTS.REJECT_UNDER_REVIEW"}
                      >
                        <ParagraphComponent
                          style={[
                            commonStyles.textCenter,
                            commonStyles.textlinks
                          ]}
                          text={userInfo?.metadata?.AdminEmail || supportMail}
                          onPress={handleClickMail}
                        />

                        {/* Add second child example */}
                        <ParagraphComponent
                          style={[
                            commonStyles.sectionsubtitlepara,
                            commonStyles.textCenter,
                          ]}
                          text={"GLOBAL_CONSTANTS.FOR_MORE_INFORMATION"}
                        />
                      </ParagraphComponent>
                    </ViewComponent>
                  )}











                  {userInfo?.customerState == 'Closed' && (
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
                          commonStyles.sectionsubtitlepara,
                          commonStyles.textCenter,
                          commonStyles.mb6
                        ]}
                        text={"GLOBAL_CONSTANTS.REJECT_UNDER_REVIEW"}
                      >
                        <ParagraphComponent
                          style={[
                            commonStyles.textCenter,
                            commonStyles.textlinks
                          ]}
                          text={userInfo?.metadata?.AdminEmail || supportMail}
                          onPress={handleClickMail}
                        />

                        {/* Add second child example */}
                        <ParagraphComponent
                          style={[
                            commonStyles.sectionsubtitlepara,
                            commonStyles.textCenter,
                          ]}
                          text={"GLOBAL_CONSTANTS.FOR_MORE_INFORMATION"}
                        />
                      </ParagraphComponent>


                    </ViewComponent>
                  )}

                  {userInfo?.customerState != 'Under Review' &&
                    userInfo?.customerState != 'Rejected' &&
                    userInfo?.customerState != 'Closed' && (
                      <ViewComponent>
                        <ImageUri
                          source={require('../../../../assets/images/gifSuccess.gif')}
                          width={s(100)}
                          height={s(100)}
                          style={[commonStyles.mxAuto, commonStyles.titleSectionGap]}
                        />
                        <TextMultiLanguage
                          text={'GLOBAL_CONSTANTS.WELCOME_TO_RAPIDZ'}
                          style={[commonStyles.sectionTitle, commonStyles.textCenter, commonStyles.mb6]}
                        />
                        <TextMultiLanguage
                          text={'GLOBAL_CONSTANTS.INPROGRESS_MESSAGE'}
                          style={[commonStyles.sectionsubtitlepara, commonStyles.textCenter, commonStyles.mb6]}
                        />
                        <ParagraphComponent
                          style={[
                            commonStyles.sectionsubtitlepara, commonStyles.textCenter
                          ]}
                          text={'GLOBAL_CONSTANTS.OUR_SUPPORT_TEAM_IS_HERE_TO_HELP'}
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
                        <TextMultiLanguage
                          text={'GLOBAL_CONSTANTS.IF_YOU_HAVE_ANY_QUESTIONS_OR_NEED_ASSISTANCE'}
                          style={[
                            commonStyles.sectionsubtitlepara, commonStyles.textCenter
                          ]}
                        />
                        <TextMultiLanguage
                          text={'GLOBAL_CONSTANTS.THANK_YOU_FOR_CHOOSING_RAPIDZ_MONEY'}
                          style={[
                            commonStyles.textWhite,
                            commonStyles.textCenter,
                            commonStyles.fs16,
                            commonStyles.fw400,
                            commonStyles.mt16,
                          ]}
                        />
                      </ViewComponent>
                    )}

                </ViewComponent>

                <ViewComponent>
                  <ButtonComponent
                    title={'GLOBAL_CONSTANTS.REFRESH'}
                    loading={saveLoading}
                    onPress={() => updateUserInfo()}
                  />
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

export default AccountProgress;

