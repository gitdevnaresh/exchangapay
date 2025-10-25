import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  ScrollView,
  SafeAreaView,
  Switch,
  BackHandler,
  ImageBackground,
} from "react-native";
import { useIsFocused } from "@react-navigation/core";
import { Container } from "../../components";
import DefaultButton from "../../components/DefaultButton";
import ProfileService from "../../services/profile";
import AntDesign from "react-native-vector-icons/AntDesign";
import { securityCEnterVerify } from "./skeleton_views";
import Loadding from "../../components/skeleton";
import { NEW_COLOR, WINDOW_HEIGHT, WINDOW_WIDTH } from "../../constants/theme/variables";
import ParagraphComponent from "../../components/Paragraph/Paragraph";
import { s } from "../../constants/theme/scale";
import Icon from "react-native-vector-icons/AntDesign";
import TextInputField from "../../components/textInput";
import LabelComponent from "../../components/Paragraph/label";
import { commonStyles } from "../../components/CommonStyles";
import ReactNativeBiometrics from "react-native-biometrics";
import Authentication from "./authentication";
import { Overlay } from "react-native-elements";
import ErrorComponent from "../../components/Error";
import Feather from "react-native-vector-icons/Feather";
import { isErrorDispaly } from "../../utils/helpers";
import useMemberLogin from "../../hooks/useMemberLogin";
import CommonPopup from "../../components/commonPopup";
import { IconRefresh } from "../../assets/svg";
import useLogout from "../../hooks/useLogOut";
import useEncryptDecrypt from "../../hooks/useEncryption_Decryption";

const Security = (props: any) => {
  const isFocused = useIsFocused();
  const [securityInfo, setSecurityInfo] = useState(null);
  const [verificationFieldLoading, setVerificationFieldLoading] = useState<boolean>(false);
  const [isVisableVerifcation, setIsVisableVerifcation] = useState<boolean>(false);
  const securityVerifySk = securityCEnterVerify(1);
  const rnBiometrics = new ReactNativeBiometrics();
  const [accountDeleteErrMsg, setAccountDeleteErrMsg] = useState<string | null>(null);
  const [accountDeleteLoader, setAccountDeleteLoader] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [isAuthInfoPopupVisible, setIsAuthInfoPopupVisible] = useState<boolean>(false);
  const [isDisableAuthPopupVisible, setIsDisableAuthPopupVisible] = useState(false);
  const { getMemDetails } = useMemberLogin();
  const { logout } = useLogout();
  const { decryptAES } = useEncryptDecrypt();

  useEffect(() => {
    getSecurityInfo()
  }, [isFocused]);
  const handleRefrsh = () => {
    getSecurityInfo();
  };



  const enbleGoogleAuthenticator = async (data: boolean, isProceed?: boolean) => {
    if (!data && !isProceed) {
      setIsDisableAuthPopupVisible(true);
      return;
    }
    try {
      const verifedRes = await ProfileService.updateGoogleAuthenticateSwitch(data);
      if (verifedRes.status === 200) {
        if (data) {
          setIsAuthInfoPopupVisible(true);
        }
        setVerificationFieldLoading(false);
      } else {
        setIsAuthInfoPopupVisible(false);
        setVerificationFieldLoading(false);
      }
    } catch (err) {
      setVerificationFieldLoading(false);
    }
  };

  const handleProceedDisableAuth = async () => {
    setIsDisableAuthPopupVisible(false);
    await enbleGoogleAuthenticator(false, true);
    await getSecurityInfo();
  };

  const handleCancelDisableAuth = () => {
    setIsDisableAuthPopupVisible(false);
  };

  const toggleFaceRecognisationSwitch = async (data: boolean) => {
    setVerificationFieldLoading(true);
    try {
      const obj = {
        type: "FaceResgEnabled",
        isEnable: data,
      };
      const verifedRes = await ProfileService.setFaceRecognisationSwitch(obj);
      if (verifedRes.status === 200) {
        getSecurityInfo();
        getMemDetails({}, false, true)
      } else {
        setVerificationFieldLoading(false);
      }
    } catch (err) {
      setVerificationFieldLoading(false);
    }
  };
  const checkBio = (data: any) => {
    rnBiometrics.isSensorAvailable().then((resultObject) => {
      const { available, biometryType } = resultObject;
      if (available) {
        rnBiometrics
          .simplePrompt({ promptMessage: "Confirm fingerprint" })
          .then((resultObject) => {
            const { success } = resultObject;
            if (success) {
              toggleFaceRecognisationSwitch(data);
            } else {
            }
          })
          .catch(() => { });
      } else {
        toggleFaceRecognisationSwitch(data);
      }
    });
  };
  const toggleSequrityQuationsSwitch = async (data: boolean) => {
    if (data) {
      props.navigation.push("SecurityQuestion", {
        isEnable: true,
      });
    } else {
      setVerificationFieldLoading(true);
      try {
        const obj = {
          type: "SecurityQuestions",
          isEnable: data,
        };
        const verifedRes = await ProfileService.setSequrityQuationsSwitch(obj);
        if (verifedRes.status === 200) {
          getSecurityInfo();
        } else {
          setVerificationFieldLoading(false);
        }
      } catch (err) {
        setVerificationFieldLoading(false);
      }
    }
  };






  const getSecurityInfo = async () => {
    setVerificationFieldLoading(true);
    try {
      const verifedRes = await ProfileService.getSeccurityInfo();
      if (verifedRes.status === 200) {
        setSecurityInfo(verifedRes.data);
        setVerificationFieldLoading(false);
      } else {
        setVerificationFieldLoading(false);
      }
    } catch (error) {
      setVerificationFieldLoading(false);

    }

  };
  const verifyCodeSucess = async () => {
    setIsVisableVerifcation(false)
  }
  const verifyCodeClose = async () => {
    setIsVisableVerifcation(false)
  }
  const handlePress = () => {
    props.navigation.push("SecurityQuestion", {});
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        handleGoBack();
        return true;
      }
    );
    return () => backHandler.remove();
  }, []);
  const handleGoBack = () => {
    props.navigation.goBack();
  };
  const toggleOverlay = () => {
    setVisible(!visible);
  };
  const deleteAccount = async () => {
    setAccountDeleteLoader(true);
    try {
      const verifedRes = await ProfileService.deleteAccount();
      if (verifedRes.status === 200) {
        setVisible(false);
        setAccountDeleteLoader(false);
        await logout();

      } else {
        setAccountDeleteLoader(false);

        setAccountDeleteErrMsg(isErrorDispaly(verifedRes));
      }
    } catch (err) {
      setAccountDeleteLoader(false);

      setAccountDeleteErrMsg(isErrorDispaly(err))
    } finally {
      setAccountDeleteLoader(false);
    }
  }
  const CloseOverlay = () => {
    setAccountDeleteErrMsg(null)
    setVisible(false);
  };

  const closeAuthInfoPopup = () => {
    setIsAuthInfoPopupVisible(false);
    getSecurityInfo()
  };

  const scoreColorPannel = {
    "good": commonStyles.textGoodStatus,
    "avrage": commonStyles.textOrange,
    "low": commonStyles.textRed,
    "poor": commonStyles.textRed,
    "excellent": commonStyles.textGreen
  };
  return (

    <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Container style={commonStyles.container}>
          <View>

            <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16, commonStyles.justifyContent]}>
              <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
                <TouchableOpacity style={[]} onPress={handleGoBack} >
                  <View>
                    <AntDesign name="arrowleft" size={22} color={NEW_COLOR.TEXT_BLACK} style={{ marginTop: 3 }} />
                  </View>
                </TouchableOpacity>
                <ParagraphComponent text={"Security Center"} style={[commonStyles.fs16, commonStyles.textBlack, commonStyles.fw800]} />
              </View>
              <TouchableOpacity activeOpacity={0.6} onPress={handleRefrsh}>
                <IconRefresh height={s(24)} width={s(24)} />
              </TouchableOpacity>
            </View>
            <View style={[commonStyles.mbs24]} />

            {verificationFieldLoading && (
              <Loadding contenthtml={securityVerifySk} />
            )}
            {!verificationFieldLoading && (
              <>
                <View style={commonStyles.bgBlack}>
                  <ImageBackground resizeMode="contain" imageStyle={{ left: "40%" }} source={require('../../assets/images/cards/security.png')} >
                    <View style={[styles.sectionBg]}>
                      <View>
                        <ParagraphComponent
                          text={securityInfo?.percentage || 0}
                          style={[
                            scoreColorPannel[
                            securityInfo?.level?.toLowerCase() || "low"
                            ],
                            commonStyles.fw600,
                            styles.fs36,
                            commonStyles.textBlack
                          ]}
                        />
                        <ParagraphComponent
                          text="Your Security Score"
                          style={[
                            commonStyles.textBlack,
                            commonStyles.fw300,
                            commonStyles.fs12,

                          ]}
                        />
                      </View>
                    </View>
                  </ImageBackground>
                </View>
                <ParagraphComponent
                  text={`Your current wallet status is `}
                  style={[
                    commonStyles.textBlack,
                    commonStyles.fw500,
                    commonStyles.fs12,
                    commonStyles.textCenter,
                    commonStyles.mt10
                  ]}
                  children={
                    <ParagraphComponent
                      style={
                        scoreColorPannel[
                        securityInfo?.level?.toLowerCase() || "low"
                        ]
                      }
                      text={`${securityInfo?.level || "Poor"}`}
                    />
                  }
                />
                <View style={commonStyles.mb24} />
                <TouchableOpacity onPress={handlePress}>
                  <View style={[styles.settingsBtn]}>
                    <View style={[commonStyles.flex1]}>
                      <ParagraphComponent
                        style={[
                          commonStyles.textAlwaysWhite,
                          commonStyles.fw600,
                          commonStyles.fs14,
                        ]}
                        text="Set security questions"
                      />
                      <ParagraphComponent
                        style={[
                          styles.securityScore,
                          commonStyles.textAlwaysWhite,
                        ]}
                        text="To improve your security score"
                      />
                    </View>
                    <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
                      <ParagraphComponent
                        style={[
                          commonStyles.textOrange,
                          commonStyles.fs12,
                          commonStyles.fw600, commonStyles.mb4
                        ]}
                        text="Setting"
                      />
                      <Icon
                        name="right"
                        size={16}
                        color={NEW_COLOR.TEXT_GREY}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
                <View style={commonStyles.mb24} />
                <ParagraphComponent
                  style={[
                    commonStyles.textBlack,
                    commonStyles.mb16,
                    commonStyles.fw700,
                    commonStyles.fs16,
                  ]}
                  text={"Card Service"}
                />
                <View style={[commonStyles.sectionStyle]}>
                  <View>
                    <LabelComponent
                      text="Email"
                      style={[
                        styles.inputLabel,
                        commonStyles.fs12,
                        commonStyles.fw500,
                      ]}
                    />
                    <TextInputField
                      value={decryptAES(securityInfo?.email) || ""}
                      editable={false}
                      style={[commonStyles.disabledBg]}
                    />
                  </View>
                  <View style={commonStyles.mb24} />
                  <View>
                    <LabelComponent
                      text="Phone"
                      style={[
                        styles.inputLabel,
                        commonStyles.fs12,
                        commonStyles.fw500,
                      ]}
                    />
                    <TextInputField
                      value={decryptAES(securityInfo?.phone) || ""}
                      editable={false}
                      style={[commonStyles.disabledBg]}
                    />
                  </View>
                </View>
                <View style={commonStyles.mb24} />

                <ParagraphComponent
                  text={"Security Settings"}
                  style={[
                    commonStyles.textBlack,
                    commonStyles.mb16,
                    commonStyles.fw700,
                    commonStyles.fs16,
                  ]}
                />
                <View style={[commonStyles.sectionStyle]}>
                  <View
                    style={[
                      commonStyles.dflex,
                      commonStyles.justifyContent,
                      commonStyles.alignCenter,
                    ]}
                  >
                    <ParagraphComponent
                      style={[
                        commonStyles.fs14,
                        commonStyles.fw500,
                        commonStyles.textBlack,
                        styles.opacity6,
                      ]}
                      text="Google /Microsoft Authenticator"
                    />
                    <View style={styles.h24}>
                      <Switch
                        trackColor={{ false: "#767577", true: "#F55D52" }}
                        thumbColor={"#f4f3f4"}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={enbleGoogleAuthenticator}
                        value={securityInfo?.isAuth0Enabled}
                      />
                    </View>
                  </View>
                  <View style={[commonStyles.hLine, styles.py16]} />
                  <TouchableOpacity
                    onPress={() => {
                      props?.navigation.navigate("ChangePassword");
                    }}
                  >
                    <View
                      style={[
                        commonStyles.dflex,
                        commonStyles.justifyContent,
                        commonStyles.alignCenter,
                      ]}
                    >
                      <ParagraphComponent
                        style={[
                          commonStyles.fs14,
                          commonStyles.fw500,
                          commonStyles.textBlack,
                          styles.opacity6,
                        ]}
                        text="Change Password"
                      />
                      <Icon
                        name="right"
                        size={16}
                        color={NEW_COLOR.TEXT_BLACK}
                        style={styles.ml10}
                      />
                    </View>
                  </TouchableOpacity>
                  <View style={[commonStyles.hLine, styles.py16]} />
                  <View
                    style={[
                      commonStyles.dflex,
                      commonStyles.justifyContent,
                      commonStyles.alignCenter,
                    ]}
                  >
                    <ParagraphComponent
                      style={[
                        commonStyles.fs14,
                        commonStyles.fw500,
                        commonStyles.textBlack,
                        styles.opacity6,
                      ]}
                      text="Facial/Fingerprint Recognition"
                    />
                    <View style={styles.h24}>
                      <Switch
                        trackColor={{ false: "#767577", true: "#F55D52" }}
                        thumbColor={"#f4f3f4"}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={checkBio}
                        value={securityInfo?.isFaceResgEnabled}
                      />
                    </View>
                  </View>
                </View>
                <View style={commonStyles.mb24} />
                <ParagraphComponent
                  text={"Other Settings"}
                  style={[
                    commonStyles.textBlack,
                    commonStyles.mb16,
                    commonStyles.fw700,
                    commonStyles.fs16,
                  ]}
                />
                <View style={[commonStyles.sectionStyle]}>
                  <View
                    style={[
                      commonStyles.dflex,
                      commonStyles.justifyContent,
                      commonStyles.alignCenter,
                    ]}
                  >
                    <ParagraphComponent
                      style={[
                        commonStyles.fs14,
                        commonStyles.fw500,
                        commonStyles.textBlack,
                        styles.opacity6,
                      ]}
                      text="Security Questions"
                    />
                    <View style={styles.h24}>
                      <Switch
                        trackColor={{ false: "#767577", true: "#F55D52" }}
                        thumbColor={"#f4f3f4"}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={toggleSequrityQuationsSwitch}
                        value={securityInfo?.isSecurityQuestionsEnabled}
                      />
                    </View>
                  </View>
                  <View style={[commonStyles.hLine, styles.py16]} />
                  <TouchableOpacity activeOpacity={0.7} onPress={toggleOverlay}>
                    <View
                      style={[
                        commonStyles.dflex,
                        commonStyles.justifyContent,
                        commonStyles.alignCenter,
                      ]}
                    >
                      <ParagraphComponent
                        style={[
                          commonStyles.fs14,
                          commonStyles.fw500,
                          commonStyles.textBlack,
                          styles.opacity6,
                        ]}
                        text="Delete Account"
                      />
                      <View >
                        <Icon
                          name="right"
                          size={16}
                          color={NEW_COLOR.TEXT_BLACK}
                          style={styles.ml10}
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
                <View style={commonStyles.mb43} />
                {visible && <Overlay overlayStyle={[styles.overlayContent, { width: WINDOW_WIDTH - 50, maxHeight: WINDOW_HEIGHT - 100 }]} isVisible={visible} onBackdropPress={toggleOverlay}>
                  <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10, commonStyles.justifyContent, commonStyles.mb32]}>
                    <ParagraphComponent style={[commonStyles.fs16, commonStyles.fw800, commonStyles.textBlack,]} text="Delete Account ?" />
                    <AntDesign name="close" size={28} color={NEW_COLOR.TEXT_BLACK} onPress={CloseOverlay} />
                  </View>
                  {accountDeleteErrMsg && (
                    <ErrorComponent
                      message={accountDeleteErrMsg}
                      onClose={() => setAccountDeleteErrMsg("")}
                    />
                  )}
                  <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textBlack, commonStyles.alignCenter]} text="Are you sure you want to delete account" />
                  <View style={[commonStyles.mb43]} />
                  <DefaultButton
                    title={"Confirm"}
                    icon={<Feather name="check" size={s(22)} color={NEW_COLOR.TEXT_ALWAYS_WHITE} style={{ marginRight: 8, }} />}
                    disable={accountDeleteLoader}
                    loading={accountDeleteLoader}
                    onPress={deleteAccount}
                  />
                  <View style={[commonStyles.mb16]} />
                  <DefaultButton
                    title={"Cancel"}
                    icon={<AntDesign name="close" size={22} color={NEW_COLOR.TEXT_BLACK} style={{ marginRight: 8 }} />}
                    transparent={true}
                    onPress={CloseOverlay}
                  />
                </Overlay>}
              </>
            )}
          </View>
          {isVisableVerifcation && <Authentication isVisable={isVisableVerifcation} isSucess={() => verifyCodeSucess()} isClose={() => verifyCodeClose()} />}
          {isAuthInfoPopupVisible && (
            <CommonPopup
              isVisible={isAuthInfoPopupVisible}
              handleClose={closeAuthInfoPopup}
              title="Check Your Email"
              content={
                <ParagraphComponent
                  text="We've sent an email to your registered email address with instructions to complete your multifactor authentication setup. Please check your inbox."
                  style={[commonStyles.textAlwaysWhite, commonStyles.fs14, commonStyles.textCenter]}
                />
              }
              buttonName="Close"
              onButtonPress={closeAuthInfoPopup}
              isCancelRequired={false}
              isCloseIconRequired={false}
              isBackdropPressAllowed={true}
              closeIconColor={NEW_COLOR.TEXT_ALWAYS_WHITE}
            />
          )}
          {isDisableAuthPopupVisible && (
            <CommonPopup
              isVisible={isDisableAuthPopupVisible}
              handleClose={handleCancelDisableAuth}
              title="Disable Multifactor Authentication"
              content={
                <View>
                  <ParagraphComponent
                    text="Are you sure you want to disable Multifactor Authentication? This action will reduce the security of your account."
                    style={[commonStyles.textAlwaysWhite, commonStyles.fs14, commonStyles.textCenter]}
                  />
                  <View style={[commonStyles.mb24]} />
                  <View style={[commonStyles.gap16, commonStyles.justify]}>
                    <DefaultButton
                      title="Proceed"
                      style={[commonStyles.flex1]}
                      onPress={handleProceedDisableAuth}
                    />
                    <DefaultButton
                      title="Cancel"
                      style={[commonStyles.flex1, { backgroundColor: NEW_COLOR.DISABLED_INPUTBG }]
                      }
                      onPress={handleCancelDisableAuth}
                      transparent
                    />
                  </View>
                </View>


              }
              isCancelRequired={false}
              isCloseIconRequired={false}
              isBackdropPressAllowed={true}
              closeIconColor={NEW_COLOR.TEXT_ALWAYS_WHITE}

            />
          )}
        </Container>
      </ScrollView>
    </SafeAreaView>

  );
};

export default Security;

const styles = StyleSheet.create({
  overlayContent: {
    paddingHorizontal: s(28),
    paddingVertical: s(24),
    borderRadius: 25, backgroundColor: NEW_COLOR.POP_UP_BG
  },
  py16: {
    marginVertical: 16,
  },
  SectionStyle: {
    borderWidth: 1,
    borderColor: NEW_COLOR.BORDER_GREY,
    borderRadius: 24,
    padding: 14,
  },
  sectionBg: {
    borderWidth: 1,
    borderColor: NEW_COLOR.BORDER_GREY,
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 26,
    borderStyle: 'dashed'
  },
  settingsBtn: {
    backgroundColor: NEW_COLOR.MENU_CARD_BG,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12, gap: 16,
  },
  opacity6: { opacity: 0.6 },
  inputLabel: {
    color: NEW_COLOR.TEXT_GREY,
  },
  securityScore: { opacity: 0.6 },
  fs64: {
    fontSize: 64,
    lineHeight: 80,
  },
  h24: { height: 24 },

  ml10: { marginLeft: 10 },
  mt48: { marginTop: 48 },
  ml12: { marginLeft: 12 },
  pr16: { paddingRight: 16 },
  fs36: { fontSize: 36 },
  background: { right: 24 }
});
