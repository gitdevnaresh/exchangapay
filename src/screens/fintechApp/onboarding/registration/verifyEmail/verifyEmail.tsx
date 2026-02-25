import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView } from 'react-native';
import { isErrorDispaly } from '../../../../../utils/helpers';
import ErrorComponent from '../../../../../components/errorDisplay/errorDisplay';
import { useSelector } from 'react-redux';
import { getThemedCommonStyles } from '../../../../../components/CommonStyles';
import OnBoardingService from '../../../../../apiServices/onBoarding';
import Container from '../../../../../components/container/container';
import ButtonComponent from '../../../../../components/buttons/button';
import useEncryptDecrypt from '../../../../../hooks/encDecHook';
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors';
import DashboardLoader from '../../../../../components/loader';
import { VerifyEmailIcon } from '../../../../../assets/svg';
import useMemberLogin from '../../../../../hooks/userInfoHook';
import ViewComponent from '../../../../../components/view/view';
import { s } from '../../../../../constants/styels/scale';
import ParagraphComponent from '../../../../../components/textComponets/paragraphText/paragraph';
import ConfirmLogout from '../../../../commonScreens/logout/comfirmLogout';
import useLogout from '../../../../../hooks/logout/useLogout';
import ScrollViewComponent from '../../../../../components/scrollView/scrollView';
import { RootState, VerifyEmailProps } from '../../interface';


const VerifyEmail = (props: VerifyEmailProps) => {
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [loadMail, setLoadMail] = useState<boolean>(false);
  const [logoutLoader, setLogoutLoder] = useState<boolean>(false);
  const { decryptAES } = useEncryptDecrypt();
  const userEmailEncrypted = useSelector((state: RootState) => state?.userReducer?.userDetails?.email);
  const email = (props?.route?.params?.email ?? decryptAES(userEmailEncrypted)) ?? '';
  const [loading, setLoading] = useState<boolean>(false);
  const [timerResend, setTimerResend] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const { getMemDetails, isOnboarding } = useMemberLogin();
  const [isVisible, setIsVisible] = useState(false)
  const { logout } = useLogout();
  const [refresh, setRefresh] = useState<boolean>(false);
  useEffect(() => {
    if (isActive) {
      const intervalId = setInterval(() => {
        setTimerResend(prev => {
          if (prev <= 1) {
            clearInterval(intervalId);
            setIsActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [isActive]);
  const onRefresh = async () => {
    setRefresh(true);
    try {
      setErrorMsg('');
      getMemDetails(false, "VerifyEmail");
    } finally {
      setRefresh(false);
    }
  };
  const resendMail = async () => {
    setErrorMsg('');
    setLoadMail(true);
    const verifyMailsend = await OnBoardingService.v3resendVerifyMail(null);
    if (verifyMailsend.ok) {
      setLoadMail(false);
      setTimerResend(60);
      setIsActive(true);
    } else {
      setErrorMsg(isErrorDispaly(verifyMailsend));
      setLoadMail(false);
    }
  };

  const updateUserInfo = () => {
    setErrorMsg('');
    getMemDetails(false, "VerifyEmail");
  };

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
    setLogoutLoder(true);
    await logout();
    setLogoutLoder(false);
  };

  return (
    <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>
      <Container style={commonStyles.container}>
        {loading && (
          <ViewComponent style={[commonStyles.flex1, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter]}>
            <DashboardLoader />
          </ViewComponent>
        )}

        {!loading && (
          <ViewComponent style={[commonStyles.flex1]}>
            <ScrollViewComponent
              showsVerticalScrollIndicator={false} refreshing={refresh} onRefresh={onRefresh}
              style={[commonStyles.flex1]}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ flexGrow: 1, justifyContent: "space-between" }}  // ?? pushes buttons to bottom
            >
              {/* ============ TOP CONTENT ============ */}
              <ViewComponent>
                {errorMsg && (
                  <>
                    <ViewComponent style={[commonStyles.mt32]}>
                      <ErrorComponent message={errorMsg} onClose={() => setErrorMsg('')} />
                    </ViewComponent>
                    {/* <ViewComponent style={[commonStyles.mt16]} /> */}
                  </>
                )}

                {/* <AlertsCarousel commonStyles={commonStyles} screenName='Onbaording' /> */}
                <ViewComponent style={[commonStyles.sectionGap]} />
                <ParagraphComponent
                  text={"GLOBAL_CONSTANTS.ALL_MOST_THERE"}
                  style={[commonStyles.Verifyemailtitle]}
                />
                <ViewComponent style={[commonStyles.sectionGap]} />

                <ViewComponent>
                  <ParagraphComponent
                    text={"GLOBAL_CONSTANTS.WE_SENT_EMAIL"}
                    style={[commonStyles.verifyemailpara, commonStyles.mb4]}
                  />

                  <ViewComponent style={[commonStyles.textCenter]}>
                    <ParagraphComponent
                      text={`${email} `}
                      style={[commonStyles.verifyemail, commonStyles.mb6]}
                    />
                  </ViewComponent>

                  <ParagraphComponent
                    text={"GLOBAL_CONSTANTS.PLEASE_CLICK_THE_LINK"}
                    style={[commonStyles.verifyemailpara]}
                  />
                </ViewComponent>

                <ViewComponent style={[commonStyles.mxAuto, commonStyles.mt32, commonStyles.titleSectionGap]}>
                  <VerifyEmailIcon />
                </ViewComponent>
                <ParagraphComponent style={[commonStyles.verifyemailpara]} text={"GLOBAL_CONSTANTS.DID_NOT_RECIEVE"} />
                {!isActive ? (
                  <ViewComponent style={{ alignItems: "center" }}>
                    <ParagraphComponent style={[commonStyles.verifyemailpara]}>
                      {!loadMail ? (
                        <ParagraphComponent
                          text={"GLOBAL_CONSTANTS.CLICK_HERE"}
                          style={[commonStyles.loginparalink]}
                          onPress={() => resendMail()}
                        />
                      ) : (
                        <ActivityIndicator size={s(14)} color={NEW_COLOR.TEXT_PRIMARY} />
                      )}

                      <ParagraphComponent text={" "} style={[commonStyles.verifyemailpara]} />

                      <ParagraphComponent
                        text={"GLOBAL_CONSTANTS.TO_RECEIVE_A_NEW"}
                        style={[commonStyles.verifyemailpara]}
                      />
                    </ParagraphComponent>
                  </ViewComponent>
                ) : (
                  <ViewComponent style={[commonStyles.mt6]}>
                    <ParagraphComponent
                      style={[commonStyles.verifyemail]}
                      text={"GLOBAL_CONSTANTS.RESEND_EMAIL"}
                      children={
                        <>
                          <ParagraphComponent
                            text={`  ${timerResend}`}
                            style={[commonStyles.loginparalink, commonStyles.ml8]}
                            children={<ParagraphComponent text={" Sec"} style={[commonStyles.loginparalink]} />}
                          />
                        </>
                      }
                    />
                  </ViewComponent>
                )}

              </ViewComponent>
              <ViewComponent style={[commonStyles.sectionGap]} />

              <ConfirmLogout
                isVisible={isVisible}
                onClose={handleClose}
                onConfirm={handleConfirm} />

              <ViewComponent>
                <ButtonComponent
                  title={"GLOBAL_CONSTANTS.REFRESH"}
                  onPress={updateUserInfo}
                  loading={isOnboarding}
                />
                <ViewComponent style={commonStyles.buttongap} />
                <ButtonComponent
                  title={"GLOBAL_CONSTANTS.LOGOUT"}
                  onPress={handleLogoutBtn}
                  solidBackground={true}
                  loading={logoutLoader}
                />
                <ViewComponent style={commonStyles.sectionGap} />
              </ViewComponent>

            </ScrollViewComponent>
          </ViewComponent>
        )}
      </Container>
    </SafeAreaView>

  );
};

export default VerifyEmail;



