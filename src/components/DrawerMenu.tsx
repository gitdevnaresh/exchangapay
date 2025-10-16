import { StyleSheet, TouchableOpacity, View, Image, ActivityIndicator, ScrollView, BackHandler, Dimensions } from "react-native";
import React, { useEffect, useState } from "react";
import { useAuth0 } from "react-native-auth0";
import { useNavigation, CommonActions, useIsFocused } from "@react-navigation/core";
import { useDispatch, useSelector } from "react-redux";
import { isLogin, loginAction, setUserInfo } from "../redux/Actions/UserActions";
import ParagraphComponent from "./Paragraph/Paragraph";
import { NEW_COLOR } from "../constants/theme/variables";
import Icon from "react-native-vector-icons/AntDesign";
import Ionicons from "react-native-vector-icons/Ionicons";
import { commonStyles } from "./CommonStyles";
import { HeadPhones, InfornationIcon, LanguageIcon, PricingIcon, SecurityIcon, AccountNumber, ChevronRight, AccountInfoIcon, ViewIcon, PersonalInfoIcon, KycInfoIcon } from "../assets/svg";
import ProfileService from "../services/profile";
import { launchImageLibrary } from "react-native-image-picker";
import { s } from "../constants/theme/scale";
import DeviceInfo from "react-native-device-info";
import AuthService from "../services/auth";
import Container from "./Container";
import { fcmNotification } from "../utils/FCMNotification";
import DefaultButton from "./DefaultButton";
import BaseCurrency from "../screens/Profile/baseCurrency";
import { DRAWER_CONSTATNTS } from "../screens/AccountDashboard/constants";
import Cookies from '@react-native-cookies/cookies';
import useEncryptDecrypt from "../hooks/useEncryption_Decryption";
import CryptoServices from "../services/crypto";
import * as Keychain from "react-native-keychain";
import { isErrorDispaly } from "../utils/helpers";
import OnBoardingService from "../services/onBoardingservice";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get('window');

const isPad = width > 600;
const DrawerModal = (props: any) => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const dispatch = useDispatch();
  const { clearSession } = useAuth0();
  const { close } = props;
  const { userInfo } = useSelector((state: any) => state.UserReducer);
  const [profileImage, setProfileImage] = useState<any>(null);
  const [imgLoader, setImageLoader] = useState<boolean>(false);
  const [logoutLoader, setLogoutLoder] = useState<boolean>(false);
  const [pricingModelVisible, setPricingModelVisible] = useState<boolean>(false);
  const { decryptAES } = useEncryptDecrypt();
  const [securityInfo, setSecurityInfo] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<any>("")
  useEffect(() => {
    if (!logoutLoader) {
      getMemDetails();
      getSeccurityInfo();
    }
  }, [isFocused]);

  useEffect(() => {
    if (userInfo) {
      setProfileImage(userInfo.imageURL);
    }
  }, [userInfo]);

  const getSeccurityInfo = async () => {
    setLoading(true)
    try {
      const response = await CryptoServices.getSecurityDetails();
      if (response?.ok) {
        setSecurityInfo(response?.data);
        setLoading(false)
      } else {
        setSecurityInfo(null)
        setLoading(false)
        setErrorMsg(isErrorDispaly(response))

      }
    } catch (err) {
      setLoading(false);
      setErrorMsg(isErrorDispaly(err))
      setSecurityInfo(null)
      setLoading(false)

    }
  };


  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      DRAWER_CONSTATNTS.HARDWARE_BACK_PRESS, () => {
        handleNavigateHome();
        return true;
      }
    );
    return () => backHandler.remove();
  }, []);

  const handleLgout = async () => {
    setLogoutLoder(true);
    Cookies.clearAll(true);
    dispatch(setUserInfo(""));
    dispatch(isLogin(false));
    dispatch(loginAction(""));
    await logOutLogData();
    const response = await OnBoardingService.updateFcmToken();
    await clearSession();
    await Keychain.resetGenericPassword({ service: 'chat_conversation_Id' });
    await Keychain.resetGenericPassword({ service: "authTokenService" });

    navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [{ name: DRAWER_CONSTATNTS.SPLASH_SCREEN }],
      })
    );
    fcmNotification.unRegister();
    setLogoutLoder(false);
  };

  const logOutLogData = async () => {
    const ip = await DeviceInfo.getIpAddress();
    const deviceName = await DeviceInfo.getDeviceName();
    const obj = {
      "id": "",
      "state": "",
      "countryName": "",
      "ipAddress": ip,
      "info": `{brand:${DeviceInfo.getBrand()},deviceName:${deviceName},model: ${DeviceInfo.getDeviceId()}}`
    }
    const actionRes = await AuthService.logOutLog(obj);
  };

  const getMemDetails = async () => {
    try {
      const userLoginInfo: any = await AuthService.getMemberInfo();
      setPricingModelVisible(false);
      if (userLoginInfo?.status == 200) {
        dispatch(setUserInfo(userLoginInfo.data));
      }
    }
    catch (error) {
    }
  };


  const handleEditPress = () => {
    navigation.navigate(DRAWER_CONSTATNTS.ADD_KYC_INFORMATION, {
      accountType: props?.route?.params?.accountType,
      isKycUpdated: true,
    });
    if (close) {
      close();
    }
  };

  const selectImage = async () => {
    try {
      const result = await launchImageLibrary({ mediaType: "photo" });
      if (result.assets) {
        const formData = new FormData();
        formData.append("profileImage", {
          uri: result.assets[0].uri,
          type: result.assets[0].type,
          name: result.assets[0].fileName,
        });
        setImageLoader(true);
        const avatharRes = await ProfileService.profileAvathar(formData);
        if (avatharRes.status === 200) {
          setProfileImage(avatharRes?.data[0]);
          updateUserInfo();
          setImageLoader(false);
        } else {
          setImageLoader(false);
        }

      } else if (result.didCancel) {
        setImageLoader(false);
      } else {
        setImageLoader(false);
      }
    } catch (err) {
      setImageLoader(false);
    }
  };

  const updateUserInfo = () => {
    AuthService.getMemberInfo()
      .then((userLoginInfo: any) => {
        dispatch(setUserInfo(userLoginInfo.data));
      })
      .catch((error) => { });
  };
  const scoreColorPannel: any = {
    "good": commonStyles.textGoodStatus,
    "avrage": commonStyles.textOrange,
    "low": commonStyles.textRed,
    "poor": commonStyles.textRed,
    "excellent": commonStyles.textGreen
  };
  function hideEmail(email: string) {
    if (email) {
      const parts = email?.split('@');
      if (parts?.length !== 2) {
        return email;
      }
      const username = parts[0];
      const domain = parts[1];
      const hiddenUsername = username.charAt(0) + '*'.repeat(4);
      const maskedEmail = hiddenUsername + '@' + domain;
      return maskedEmail;
    } else {
      return '--'
    }
  };

  const handleNavigateHome = () => {
    navigation.navigate(DRAWER_CONSTATNTS.DASHBOARD, {
      screen: DRAWER_CONSTATNTS.HOME,
      animation: 'slide_from_left'
    });
  };

  const handleNavigateProfileInfo = () => {
    navigation.navigate(DRAWER_CONSTATNTS.PERSONAL_INFo_VIEW);
    if (close) {
      close();
    }
  };


  const handleNavigateToSecurity = () => {
    navigation.navigate(DRAWER_CONSTATNTS.SECURITY);
    if (close) {
      close();
    }
  };

  const navigatePersonalinfo = () => {
    navigation.navigate("addressesList");
    if (close) {
      close();
    }
  };

  const handlePriceCurrenyModel = () => {
    setPricingModelVisible(!pricingModelVisible)
  };

  const handleNavigateHelpCentre = () => {
    props?.navigation?.navigate(DRAWER_CONSTATNTS.HELP_CENTER)
  };

  const handleLogout = () => {
    handleLgout();
  };

  const HandleNavigateRefarral = () => {
    props?.navigation?.navigate(DRAWER_CONSTATNTS.MY_REFERRAL_SCREEN)
  };
  const handleNavigatePayees = () => {
    navigation.navigate("cryptoPayeesList")
  }

  return (
    <SafeAreaView style={[commonStyles.screenBg, commonStyles.flex1]}>
      <ScrollView>
        <Container style={commonStyles.container}>
          <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8, commonStyles.justifyContent]}>
            <View
              style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
              <TouchableOpacity style={[styles.px8]} onPress={handleNavigateHome} >
                <Icon name={DRAWER_CONSTATNTS.ARROW_LEFT} size={s(22)} color={NEW_COLOR.TEXT_BLACK} style={{ marginTop: 3 }} />
              </TouchableOpacity>
              <ParagraphComponent text={DRAWER_CONSTATNTS.PROFILE} style={[commonStyles.fs16, commonStyles.fw700, commonStyles.textBlack]} />
            </View>
            <TouchableOpacity onPress={handleNavigateProfileInfo} activeOpacity={0.8}  >
              <View
                style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]} >
              </View>
            </TouchableOpacity>
          </View>
          <View style={commonStyles.mb43} />
          <View style={[styles.profiletop]}>
            <View style={[styles.topab]}>
              <Image source={require("../assets/images/profile-top.png")} style={{ height: s(20), width: s(160) }} />
            </View>

            <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.flex1, commonStyles.gap24, styles.SectionStyle, commonStyles.mb16]} >
              <TouchableOpacity onPress={selectImage}>
                <View style={styles.wauto}>
                  {imgLoader ? (
                    <ActivityIndicator size={DRAWER_CONSTATNTS.LARGE} color={NEW_COLOR.TEXT_GREY} />
                  ) : (
                    <Image
                      resizeMode={DRAWER_CONSTATNTS.COVER}
                      style={styles.defaultimg}
                      source={
                        profileImage
                          ? { uri: profileImage }
                          : require("../assets/images/profile/avathar.png")
                      }
                    />
                  )}
                </View>
              </TouchableOpacity>
              <View style={[commonStyles.flex1]}>
                <View>
                  <ParagraphComponent text={`${decryptAES(userInfo?.firstName) || ""} ${decryptAES(userInfo?.lastName) || ""}`} style={[commonStyles.fs16, commonStyles.textBlack, commonStyles.fw600, { marginBottom: 2 }]} numberOfLines={1} />
                  <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
                    <View>
                      <AccountNumber height={s(14)} width={s(14)} />
                    </View>
                    <ParagraphComponent text={hideEmail(decryptAES(userInfo.email)) || ""} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textGrey]} />
                  </View>
                </View>
              </View>
              <View>
                <TouchableOpacity onPress={handleNavigateProfileInfo} activeOpacity={0.7}>
                  <ViewIcon height={s(24)} width={s(24)} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={[styles.bottomab]}>
              <Image source={require("../assets/images/profile-top.png")} style={{ height: s(20), width: s(160) }} />
            </View>
          </View>
          <View style={[commonStyles.mb16]} />
          <View style={[styles.menuSection]}>
            <TouchableOpacity
              onPress={handleNavigateToSecurity}
            >
              <View style={[styles.listFlex]}>
                <View style={[commonStyles.dflex, commonStyles.gap16, commonStyles.alignCenter]}>
                  <SecurityIcon height={22} width={22} />
                  <ParagraphComponent text={DRAWER_CONSTATNTS.SECURITY_CENTER} style={[commonStyles.fs14, commonStyles.textBlack, commonStyles.fw500]} />
                </View>
                <View style={[commonStyles.dflex, commonStyles.gap16, commonStyles.alignCenter]}>
                  {/* <ParagraphComponent text={securityInfo?.level?.toUpperCase() || ""} style={[scoreColorPannel[securityInfo?.level?.toLowerCase() || ''], commonStyles.fs12, commonStyles.fw600,]} /> */}
                  <View>
                    {loading ? (
                      <ActivityIndicator size="small" color={NEW_COLOR.LOGO_TEXT} />
                    ) : (
                      <ParagraphComponent
                        text={securityInfo?.level ? securityInfo.level : "Poor"}
                        style={[scoreColorPannel[securityInfo?.level?.toLowerCase() || 'poor'], commonStyles.fs12, commonStyles.fw600]}
                      />
                    )}
                  </View>
                  <ChevronRight style={{ marginTop: 2 }} />
                </View>
              </View>
            </TouchableOpacity>
            <View style={[commonStyles.hLine, styles.py16]} />
            <TouchableOpacity onPress={handleNavigateProfileInfo}  >
              <View style={[styles.listFlex]}>
                <View style={[commonStyles.dflex, commonStyles.gap16, commonStyles.alignCenter]}>
                  <AccountInfoIcon height={22} width={22} />
                  <ParagraphComponent text={DRAWER_CONSTATNTS.ACCOUNT_INFORMATION} style={[commonStyles.fs14, commonStyles.textBlack, commonStyles.fw500]} />
                </View>
                <ChevronRight />
              </View>
            </TouchableOpacity>
            <View style={[commonStyles.hLine, styles.py16]} />
            <View>
              <TouchableOpacity
                onPress={navigatePersonalinfo}>
                <View style={[styles.listFlex]}>
                  <View style={[commonStyles.dflex, commonStyles.gap16, commonStyles.alignCenter]}>
                    <PersonalInfoIcon height={22} width={22} />
                    <ParagraphComponent text={DRAWER_CONSTATNTS.PERSONAL_INFORMATION} style={[commonStyles.fs14, commonStyles.textBlack, commonStyles.fw500]} />
                  </View>
                  <ChevronRight />
                </View>
              </TouchableOpacity>
              <View style={[commonStyles.hLine, styles.py16]} />
              <View>
                <TouchableOpacity onPress={handleEditPress}>
                  <View style={[styles.listFlex]}>
                    <View style={[commonStyles.dflex, commonStyles.gap16, commonStyles.alignCenter]}>
                      <KycInfoIcon height={s(22)} width={s(22)} />
                      <ParagraphComponent text={DRAWER_CONSTATNTS.KYC_INFORMATION} style={[commonStyles.fs14, commonStyles.textBlack, commonStyles.fw500]} />
                    </View>
                    <ChevronRight />
                  </View>
                </TouchableOpacity>
                <View style={[commonStyles.hLine, styles.py16]} />
              </View>
            </View>
            <View>
              <TouchableOpacity onPress={handleNavigatePayees}>
                <View style={[styles.listFlex]}>
                  <View style={[commonStyles.dflex, commonStyles.gap16, commonStyles.alignCenter]}>
                    <Ionicons name="people-outline" color={NEW_COLOR.TEXT_GREY} size={22} />
                    <ParagraphComponent text="Whitelist Address" style={[commonStyles.fs14, commonStyles.textBlack, commonStyles.fw500]} />
                  </View>
                  <ChevronRight />
                </View>
              </TouchableOpacity>
              <View style={[commonStyles.hLine, styles.py16]} />

            </View>

            <View>
              <TouchableOpacity onPress={HandleNavigateRefarral}>
                <View style={[styles.listFlex]}>
                  <View style={[commonStyles.dflex, commonStyles.gap16, commonStyles.alignCenter]}>
                    <Ionicons name={DRAWER_CONSTATNTS.GIFT_OUTLINE} color={NEW_COLOR.TEXT_GREY} size={22} />
                    <ParagraphComponent text={DRAWER_CONSTATNTS.MY_REFERRALS} style={[commonStyles.fs14, commonStyles.textBlack, commonStyles.fw500]} />
                  </View>
                  <View style={[commonStyles.dflex, commonStyles.gap16, commonStyles.alignCenter]}>
                    <ChevronRight style={{ marginTop: 2 }} />
                  </View>
                </View>
              </TouchableOpacity>
              <View style={[commonStyles.hLine, styles.py16]} />
            </View>
            <TouchableOpacity onPress={handlePriceCurrenyModel}>
              <View style={[styles.listFlex]}>
                <View style={[commonStyles.dflex, commonStyles.gap16, commonStyles.alignCenter]}>
                  <PricingIcon height={22} width={22} />
                  <ParagraphComponent text={DRAWER_CONSTATNTS.PRICING_CURRENCY} style={[commonStyles.fs14, commonStyles.textBlack, commonStyles.fw500]} />
                </View>
                <View style={[commonStyles.dflex, commonStyles.gap16, commonStyles.alignCenter]}>
                  <ParagraphComponent text={userInfo?.currency || " "} style={[commonStyles.textGrey, commonStyles.fs12, commonStyles.fw500]} />
                  <ChevronRight />
                </View>
              </View>
            </TouchableOpacity>
            <View style={[commonStyles.hLine, styles.py16]} />
            <TouchableOpacity>
              <View style={[styles.listFlex]}>
                <View style={[commonStyles.dflex, commonStyles.gap16, commonStyles.alignCenter]}>
                  <LanguageIcon height={22} width={22} />
                  <ParagraphComponent text={DRAWER_CONSTATNTS.DISPLAY_LANGUAGE} style={[commonStyles.fs14, commonStyles.textBlack, commonStyles.fw500]} />
                </View>
                <View style={[commonStyles.dflex, commonStyles.gap16]}>
                  <ParagraphComponent text={DRAWER_CONSTATNTS.ENGLISH} style={[commonStyles.textGrey, commonStyles.fs12, commonStyles.fw500]} />
                </View>
              </View>
            </TouchableOpacity>
            <View style={[commonStyles.hLine, styles.py16]} />
            <TouchableOpacity>
              <View style={[styles.listFlex]}>
                <View style={[commonStyles.dflex, commonStyles.gap16, commonStyles.alignCenter]}>
                  <InfornationIcon height={22} width={22} />
                  <ParagraphComponent text={DRAWER_CONSTATNTS.VERSION} style={[commonStyles.fs14, commonStyles.textBlack, commonStyles.fw500]} />
                </View>
                <View style={[commonStyles.dflex, commonStyles.gap16, commonStyles.alignCenter]}>
                  <ParagraphComponent text={`V ${DeviceInfo.getVersion()}`} style={[commonStyles.textBlack, commonStyles.fs12, commonStyles.fw500]} />
                </View>
              </View>
            </TouchableOpacity>
            <View style={[commonStyles.hLine, styles.py16]} />
            <TouchableOpacity onPress={handleNavigateHelpCentre}>
              <View style={[styles.listFlex]}>
                <View style={[commonStyles.dflex, commonStyles.gap16, commonStyles.alignCenter]}>
                  <HeadPhones height={s(22)} width={s(22)} />
                  <ParagraphComponent text={DRAWER_CONSTATNTS.HELP_CENTER_FAQ} style={[commonStyles.fs14, commonStyles.textBlack, commonStyles.fw500]} />
                </View>
                <ChevronRight />
              </View>
            </TouchableOpacity>


          </View>
          <View style={commonStyles.mb43} />
          <View style={commonStyles.mb16} />

          <DefaultButton
            title={DRAWER_CONSTATNTS.LOG_OUT}
            customTitleStyle={''}
            style={undefined}
            customContainerStyle={undefined}
            backgroundColors={undefined}
            colorful={undefined}
            onPress={handleLogout}
            transparent={undefined}
            loading={logoutLoader}
            disable={logoutLoader}
            iconRight={true}
          />
          <View style={commonStyles.mb24} />
        </Container>
      </ScrollView>


      {pricingModelVisible && <BaseCurrency baseCurrency={userInfo.currency} updatemodelvisible={(isLoad: boolean) => { if (isLoad) { getMemDetails() } else { setPricingModelVisible(false) } }} />}

    </SafeAreaView>
  );
};

export default DrawerModal;

const styles = StyleSheet.create({
  py16: {
    marginVertical: 16,
  },
  menuSection: {
    backgroundColor: NEW_COLOR.MENU_CARD_BG,
    borderRadius: 16,
    padding: 24,
  },
  SectionStyle: {
    borderWidth: 1, borderColor: NEW_COLOR.SEARCH_BORDER,
    borderRadius: 24,
    borderStyle: 'dashed',
    backgroundColor: NEW_COLOR.BG_BLACK,
    paddingVertical: 18,
    paddingHorizontal: 20, minHeight: 150
  },
  wauto: { alignSelf: "flex-start" },
  logout: {
    backgroundColor: NEW_COLOR.BTN_PINK,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 100,
    paddingVertical: 16,
  },
  defaultimg: {
    width: s(100),
    height: s(100),
    borderRadius: 100 / 2,
    overflow: "hidden",
  },
  mb50: {
    marginBottom: 50,
  },
  circle: {
    minWidth: 24,
    minHeight: 24,
    borderRadius: 100 / 2,
    backgroundColor: NEW_COLOR.TEXT_ORANGE,
    justifyContent: 'center',
    alignItems: 'center', flexDirection: "row",
    paddingHorizontal: 6
  },
  pl15: {
    paddingLeft: 15,
  },
  px8: { paddingVertical: 8 },
  loaderbg: {

  },
  mb60: { marginBottom: 60 },
  ml20: { marginLeft: 20 },
  listFlex: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

  }, downArrow: {
    marginLeft: 10,
  },
  pr16: { paddingRight: 16 },
  profiletop: { position: 'relative' },
  topab: { position: 'absolute', top: isPad ? -16 : -12, left: isPad ? "30%" : '28%', },
  bottomab: { position: 'absolute', bottom: isPad ? 0 : 4, left: isPad ? "30%" : '28%', zIndex: -1 }
});
