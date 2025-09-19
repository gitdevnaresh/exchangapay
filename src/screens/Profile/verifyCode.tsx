import React, { useEffect, useState } from "react";
import QRCode from "react-native-qrcode-svg";
import { StyleService, useStyleSheet } from "@ui-kitten/components";
import {
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ImageBackground,
  BackHandler,
  Linking,
} from "react-native";
import Clipboard from "@react-native-clipboard/clipboard";
import { Container } from "../../components";
import CopyCard from "../../components/CopyCard";
import Feather from "react-native-vector-icons/Feather";
import { NEW_COLOR, WINDOW_WIDTH } from "../../constants/theme/variables";
import ParagraphComponent from "../../components/Paragraph/Paragraph";
import { commonStyles } from "../../components/CommonStyles";
import { useDispatch } from "react-redux";
import DefaultButton from "../../components/DefaultButton";
import { Field, Formik } from "formik";
import InputDefault from "../../components/DefaultFiat";
import { s } from "../../constants/theme/scale";
import { useRoute } from "@react-navigation/native";
import ProfileService from "../../services/profile";
import AuthService from "../../services/auth";
import { setUserInfo } from "../../redux/Actions/UserActions";
import ErrorComponent from "../../components/Error";
import { isErrorDispaly } from "../../utils/helpers";
import AntDesign from "react-native-vector-icons/AntDesign";
import LabelComponent from "../../components/Paragraph/label";
import CommonPopup from "../../components/commonPopup";
import { set } from "lodash";

const VerifyCode = React.memo((props: any) => {
  const styles = useStyleSheet(themedStyles);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [errormsg, setErrormsg] = useState<boolean | string>(false);
  const route = useRoute();
  const [isHelpPopupVisible, setIsHelpPopupVisible] = useState<boolean>(false);
  const { data } = route.params;
  const initValues = {
    code: "",
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
  function extractSecretFromOTPAuthURI(uri: string) {
    const regex = /secret=([^&]+)/;
    const match = uri.match(regex);
    if (match && match[1]) {
      return match[1];
    } else {
      return null;
    }
  }
  const handleGoBack = () => {
    if (props?.route?.params?.isWithdrawScreen) {
      props?.navigation?.goBack();
    } else {
      props.navigation.navigate("Security");
    }
  };

  const onSubmit = async (value: any) => {
    if (value.code == "") {
      setErrormsg("Please enter verification code.");
    } else {
      try {
        setSaveLoading(true);
        const verifedRes = await ProfileService.varificationGoogleAuthenticate(
          value.code
        );
        if (verifedRes.data) {
          enableGoogleAuth();
        } else {
          setErrormsg("Invalid code!");
          setSaveLoading(false);
        }
      } catch (err: any) {
        setErrormsg(isErrorDispaly(err));
        setSaveLoading(false);
      }
    }
  };
  const enableGoogleAuth = async () => {
    try {
      const payloadData = {
        type: "GoogleAuthEnabled",
        isEnable: true,
      };
      const verifedRes = await ProfileService.setGoogleAuthenticateEnable(
        payloadData
      );
      if (verifedRes.status == 200) {
        handleGoBack();
        getMemDetails();
        setSaveLoading(false);
      } else {
        setSaveLoading(false);
        setErrormsg(isErrorDispaly(verifedRes));
      }
    } catch (err: any) {
      setErrormsg(isErrorDispaly(err));
      setSaveLoading(false);
    }
  };
  const copyToClipboard = async () => {
    const text: string = extractSecretFromOTPAuthURI(data);
    try {
      await Clipboard.setString(text);
    } catch (error: any) {
      Alert.alert("Failed to copy text to clipboard:", error);
    }
  };
  const dispatch = useDispatch();
  const getMemDetails = async () => {
    try {
      const userLoginInfo: any = await AuthService.getMemberInfo();

      if (userLoginInfo?.status == 200) {
        dispatch(setUserInfo(userLoginInfo.data));
      }
    } catch (error) {}
  };

  const handleCloseError = () => {
    setErrormsg("");
  };

  const handleNavigateHelp = () => {
    setIsHelpPopupVisible(!isHelpPopupVisible);
  };
  const handleClosePopup = () => {
    setIsHelpPopupVisible(false);
  };
  const handleLinkPress = () => {
    Linking.openURL("https://youtube.com/@exchangapay?si=LleGF4kws1IPgPvX");
  };

  return (
    <SafeAreaView style={[commonStyles.screenBg, commonStyles.flex1]}>
      <ScrollView>
        <Container style={commonStyles.container}>
          <View
            style={[
              commonStyles.dflex,
              commonStyles.alignCenter,
              commonStyles.gap16,
              commonStyles.mb32,
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleGoBack()}
            >
              <AntDesign
                name="arrowleft"
                size={22}
                color={NEW_COLOR.TEXT_BLACK}
              />
            </TouchableOpacity>
            <ParagraphComponent
              style={[
                commonStyles.fs16,
                commonStyles.textBlack,
                commonStyles.fw800,
              ]}
              text={`Secure Your Account`}
            />
          </View>
          <>
            <View style={[]} />
            <View
              style={[
                commonStyles.dflex,
                commonStyles.sectionStyle,
                commonStyles.gap16,
              ]}
            >
              <Feather
                name="info"
                size={24}
                color={NEW_COLOR.TEXT_GREY}
                style={{ marginTop: 6 }}
              />
              <ParagraphComponent
                style={[
                  commonStyles.fs12,
                  commonStyles.fw600,
                  styles.mr24,
                  styles.pr16,
                  commonStyles.textGrey,
                ]}
                text={
                  "Scan the QR Code below using your preferred authenticator app or manually enter the following code into your preferred authenticator app, and then enter the provided one-time code below."
                }
              />
            </View>
            <View style={[commonStyles.mb32]} />
            <ImageBackground
              resizeMode="contain"
              style={{ position: "relative", height: 385 }}
              source={require("../../assets/images/cards/light-purplebg.png")}
            >
              <View>
                {data && (
                  <>
                    <View
                      style={[
                        commonStyles.dflex,
                        commonStyles.alignCenter,
                        commonStyles.justifyCenter,
                        { height: 236, paddingTop: 16 },
                      ]}
                    >
                      <View style={[commonStyles.justifyCenter]}>
                        <View
                          style={[
                            styles.bgWhite,
                            commonStyles.justifyCenter,
                            commonStyles.dflex,
                          ]}
                        >
                          <QRCode
                            color={NEW_COLOR.TEXT_WHITE}
                            backgroundColor="transparent"
                            value={data}
                            size={s(190)}
                          />
                        </View>
                      </View>
                    </View>
                    <View style={[styles.border]} />
                    <View
                      style={[
                        commonStyles.dflex,
                        commonStyles.justifyCenter,
                        commonStyles.alignCenter,
                      ]}
                    >
                      <View style={[commonStyles.flex1]}>
                        <ParagraphComponent
                          style={[
                            commonStyles.fs14,
                            commonStyles.fw500,
                            commonStyles.textCenter,
                            commonStyles.textGrey,
                          ]}
                          text={"Secure Your Account security code"}
                        />
                        <View style={[]}>
                          <ParagraphComponent
                            style={[
                              commonStyles.fs14,
                              commonStyles.fw600,
                              commonStyles.textBlack,
                              commonStyles.textCenter,
                              { marginBottom: 8 },
                            ]}
                            text={`${extractSecretFromOTPAuthURI(data)}`}
                          />

                          <View style={[commonStyles.mxAuto]}>
                            <CopyCard onPress={() => copyToClipboard()} />
                          </View>
                        </View>
                      </View>
                    </View>
                  </>
                )}
              </View>
            </ImageBackground>

            <View style={[commonStyles.mb24]} />
            {errormsg && (
              <ErrorComponent message={errormsg} onClose={handleCloseError} />
            )}
            <Formik
              initialValues={initValues}
              onSubmit={onSubmit}
              // validationSchema={CreateAccSchema}
              enableReinitialize
            >
              {(formik) => {
                const { touched, handleSubmit, errors, handleBlur } = formik;
                return (
                  <View>
                    <Field
                      touched={touched.code}
                      name="code"
                      label={"Enter your one-time code "}
                      error={errors.code}
                      handleBlur={handleBlur}
                      customContainerStyle={{}}
                      placeholder={"Enter Code"}
                      component={InputDefault}
                      maxLength={6}
                      keyboardType="numeric"
                      Children={
                        <LabelComponent
                          text=" *"
                          style={commonStyles.textError}
                        />
                      }
                    />
                    <View style={[commonStyles.mb16]} />
                    <ParagraphComponent
                      style={[
                        commonStyles.fs16,
                        commonStyles.fw700,
                        commonStyles.textAlwaysWhite,
                        commonStyles.mb10,
                        commonStyles.textCenter,
                      ]}
                      text="Need Help"
                    />

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={handleNavigateHelp}
                    >
                      <ParagraphComponent
                        style={[
                          commonStyles.fs14,
                          commonStyles.fw600,
                          commonStyles.textOrange,
                          commonStyles.textCenter,
                        ]}
                        text="View Our Step By Step Guide"
                      />
                    </TouchableOpacity>

                    <View style={[commonStyles.mb43]} />

                    <View style={[commonStyles.mb43]} />
                    <View style={[commonStyles.mb43]} />
                    <DefaultButton
                      title="Continue"
                      style={undefined}
                      loading={saveLoading}
                      disable={saveLoading}
                      onPress={handleSubmit}
                    />
                    <View style={[commonStyles.mb32]} />
                  </View>
                );
              }}
            </Formik>
          </>
        </Container>
        <CommonPopup
          isVisible={isHelpPopupVisible}
          isCloseIconRequired={true}
          handleClose={handleClosePopup}
          isBackdropPressAllowed={true}
          closeIconColor={NEW_COLOR.TEXT_ALWAYS_WHITE}
          backdropStyle={{ backgroundColor: "rgba(0, 0, 0, 0.40)" }}
          content={
            <ScrollView
              style={{ maxHeight: 480, width: "100%" }}
              showsVerticalScrollIndicator={false}
            >
              <ParagraphComponent
                style={[
                  commonStyles.fs20,
                  commonStyles.fw700,
                  commonStyles.textBlack,
                  commonStyles.mb24,
                ]}
              >
                Step-by-Step Guide (Android & iOS)
              </ParagraphComponent>

              <View style={[commonStyles.mb14]}>
                <ParagraphComponent
                  style={[
                    commonStyles.fw500,
                    commonStyles.fs20,
                    commonStyles.textBlack,
                  ]}
                  text={"1. Download an Authenticator App"}
                />
                <ParagraphComponent
                  style={[
                    commonStyles.fs14,
                    commonStyles.fw500,
                    commonStyles.textpara,
                    commonStyles.mt14,
                  ]}
                >
                  Install a trusted 2FA app from your device's app store
                </ParagraphComponent>
                <View
                  style={[
                    commonStyles.dflex,
                    commonStyles.mt14,
                    commonStyles.alignCenter,
                    commonStyles.gap10,
                  ]}
                >
                  <View style={styles.bulletDot} />
                  <ParagraphComponent
                    text={
                      "Recommended: Google Authenticator or Microsoft Authenticator."
                    }
                    style={[
                      commonStyles.fs14,
                      commonStyles.fw500,
                      commonStyles.textpara,
                    ]}
                  />
                </View>
                <View
                  style={[
                    commonStyles.dflex,
                    commonStyles.mt8,
                    commonStyles.alignCenter,
                    commonStyles.gap10,
                  ]}
                >
                  <View style={styles.bulletDot} />
                  <ParagraphComponent
                    text={
                      "Available on both the Google Play Store and Apple App Store"
                    }
                    style={[
                      commonStyles.fs14,
                      commonStyles.fw500,
                      commonStyles.textpara,
                    ]}
                  />
                </View>
              </View>

              <View>
                <ParagraphComponent
                  style={[
                    commonStyles.fw500,
                    commonStyles.fs20,
                    commonStyles.textBlack,
                    commonStyles.mt16,
                  ]}
                  text={"2. Open the App and Add a New Account"}
                />
                <View
                  style={[
                    commonStyles.dflex,
                    commonStyles.mt14,
                    commonStyles.alignCenter,
                    commonStyles.gap10,
                  ]}
                >
                  <View style={styles.bulletDot} />
                  <ParagraphComponent
                    text={"Launch the authenticator app "}
                    style={[
                      commonStyles.fs14,
                      commonStyles.fw500,
                      commonStyles.textpara,
                    ]}
                  />
                </View>
                <View
                  style={[
                    commonStyles.dflex,
                    commonStyles.mt8,
                    commonStyles.alignCenter,
                    commonStyles.gap10,
                  ]}
                >
                  <View style={styles.bulletDot} />
                  <ParagraphComponent
                    text={
                      'Tap "+", "Add Account", or "Get Started", depending on your app'
                    }
                    style={[
                      commonStyles.fs14,
                      commonStyles.fw500,
                      commonStyles.textpara,
                    ]}
                  />
                </View>
                <View
                  style={[
                    commonStyles.dflex,
                    commonStyles.mt8,
                    commonStyles.alignCenter,
                    commonStyles.gap10,
                  ]}
                >
                  <View style={styles.bulletDot} />
                  <ParagraphComponent
                    text={
                      'Choose "Scan a QR code" (or "Enter a setup key manually")'
                    }
                    style={[
                      commonStyles.fs14,
                      commonStyles.fw500,
                      commonStyles.textpara,
                    ]}
                  />
                </View>
              </View>

              <View>
                <ParagraphComponent
                  style={[
                    commonStyles.fw500,
                    commonStyles.fs20,
                    commonStyles.textBlack,
                    commonStyles.mt16,
                  ]}
                  text={"3. Scan the QR Code"}
                />
                <View
                  style={[
                    commonStyles.dflex,
                    commonStyles.mt14,
                    commonStyles.alignCenter,
                    commonStyles.gap10,
                  ]}
                >
                  <View style={styles.bulletDot} />
                  <ParagraphComponent
                    text={`Use your device's camera to scan the QR code displayed in the app `}
                    style={[
                      commonStyles.fs14,
                      commonStyles.fw500,
                      commonStyles.textpara,
                    ]}
                  />
                </View>
                <View
                  style={[
                    commonStyles.dflex,
                    commonStyles.alignCenter,
                    commonStyles.gap10,
                  ]}
                >
                  <View style={styles.bulletDot} />
                  <ParagraphComponent
                    text={
                      'Alternatively, select "Enter a setup key manually", and enter the code provided'
                    }
                    style={[
                      commonStyles.fs14,
                      commonStyles.fw500,
                      commonStyles.textpara,
                    ]}
                  />
                </View>
                <View
                  style={[
                    commonStyles.dflex,
                    commonStyles.mt8,
                    commonStyles.alignCenter,
                    commonStyles.gap10,
                  ]}
                >
                  <ParagraphComponent
                    text={"(e.g.,FRWNCVBDEFPEJUBKGI4UEYHRORWGYRJZ)"}
                    style={[
                      commonStyles.fs14,
                      commonStyles.fw500,
                      commonStyles.textpara,
                    ]}
                  />
                </View>

                <View
                  style={[
                    commonStyles.dflex,
                    commonStyles.mt8,
                    commonStyles.alignCenter,
                    commonStyles.gap10,
                  ]}
                >
                  <View style={styles.bulletDot} />
                  <ParagraphComponent
                    text={`Account Name: Choose any name you'd like to help identify this account (e.g. "Exchanga Pay")`}
                    style={[
                      commonStyles.fs14,
                      commonStyles.fw500,
                      commonStyles.textpara,
                    ]}
                  />
                </View>
                <View
                  style={[
                    commonStyles.dflex,
                    commonStyles.mt8,
                    commonStyles.alignCenter,
                    commonStyles.gap10,
                  ]}
                >
                  <View style={styles.bulletDot} />
                  <ParagraphComponent
                    text={"Key Type: Time-based"}
                    style={[
                      commonStyles.fs14,
                      commonStyles.fw500,
                      commonStyles.textpara,
                    ]}
                  />
                </View>
              </View>

              <View>
                <ParagraphComponent
                  style={[
                    commonStyles.fw500,
                    commonStyles.fs20,
                    commonStyles.textBlack,
                    commonStyles.mt16,
                  ]}
                  text={"4. Enter the 6-Digit Code"}
                />
                <View
                  style={[
                    commonStyles.dflex,
                    commonStyles.mt14,
                    commonStyles.alignCenter,
                    commonStyles.gap10,
                  ]}
                >
                  <View style={styles.bulletDot} />
                  <ParagraphComponent
                    text={
                      "Once your authenticator app is set up, it will display a 6-digit code"
                    }
                    style={[
                      commonStyles.fs14,
                      commonStyles.fw500,
                      commonStyles.textpara,
                    ]}
                  />
                </View>
                <View
                  style={[
                    commonStyles.dflex,
                    commonStyles.mt8,
                    commonStyles.alignCenter,
                    commonStyles.gap10,
                  ]}
                >
                  <View style={styles.bulletDot} />
                  <ParagraphComponent
                    text={
                      "Enter this code in the Enter your the time code field in the Exchanga Pay app"
                    }
                    style={[
                      commonStyles.fs14,
                      commonStyles.fw500,
                      commonStyles.textpara,
                    ]}
                  />
                </View>
              </View>
              <View style={[commonStyles.mb16]} />
              <TouchableOpacity activeOpacity={0.8} onPress={handleLinkPress}>
                <ParagraphComponent
                  style={[
                    commonStyles.fs14,
                    commonStyles.fw600,
                    commonStyles.textOrange,
                    commonStyles.textCenter,
                  ]}
                  text="View Our Step By Step Video Guide Here"
                />
              </TouchableOpacity>
            </ScrollView>
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
});

export default VerifyCode;

const themedStyles = StyleService.create({
  sectionStyle: {
    borderWidth: 1,
    borderColor: NEW_COLOR.BORDER_GREY,
    borderRadius: 16,
    backgroundColor: NEW_COLOR.SECTION_LIGHTORANGE_BG,
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  flexWrap: {
    flexWrap: "wrap",
  },
  mr24: { marginRight: 24 },
  infoCard: {
    backgroundColor: NEW_COLOR.BG_LIGHTORANGE,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 16,
  },
  copyBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  mt34: { marginTop: 34 },
  w318: { marginHorizontal: 28, marginBottom: -32, zIndex: 9 },
  bgpurple: {
    backgroundColor: NEW_COLOR.BG_PURPLE,
    padding: 8,
    borderRadius: 100,
    width: (WINDOW_WIDTH * 48) / 100,
  },
  whiteCircle: {
    backgroundColor: NEW_COLOR.BACKGROUND_WHITE,
    padding: 8,
    borderRadius: 100,
  },
  px8: { paddingHorizontal: 8 },
  pr16: { paddingRight: 16 },
  mt42: { marginTop: 42 },
  borderCircle: {
    borderRadius: 100,
    paddingHorizontal: 24,
    borderWidth: 1,
    paddingVertical: 12,
    minWidth: (WINDOW_WIDTH * 26) / 100,
    maxWidth: (WINDOW_WIDTH * 40) / 100,
  },
  ml6: {
    marginLeft: 16,
  },
  ml4: {
    marginLeft: 4,
  },
  ml8: {
    marginLeft: 8,
  },
  mb32: {
    marginBottom: 32,
  },
  bgWhite: {
    backgroundColor: NEW_COLOR.BACKGROUND_WHITE,
    padding: 4,
    marginLeft: "auto",
    marginRight: "auto",
  },
  listItem: {
    marginVertical: 8,
    flexDirection: "row",
    flex: 1,
    flexWrap: "wrap",
    flexShrink: 1,
  },
  mb20: {
    marginBottom: 20,
  },
  border: {
    borderTopWidth: 2,
    marginBottom: 10,
    opacity: 0.2,
    width: "96%",
  },
  bulletDot: {
    width: s(6),
    height: s(6),
    borderRadius: 8 / 2,
    backgroundColor: NEW_COLOR.PARA_GREY,
  },
});
