import React, { useEffect, useState } from "react";
import { NativeModules, Platform, View } from "react-native";
import { enableScreens } from "react-native-screens";
import { NavigationContainer } from "@react-navigation/native";
import FileViewer from "react-native-file-viewer";
import notifee, { EventType } from "@notifee/react-native";
import { useNetInfo } from "@react-native-community/netinfo";
import { RootStackParamList } from "./navigation-types";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SplashScreen from "../screens/SplashScreen";
import { navigationRef } from "./RootNavigation";
import SendCryptoDetails from "../screens/Crypto/sendCryptoDetails";
import CryptoReceive from "../screens/Crypto/cryptoReceive";
import CryptoSelectAsset from "../screens/Crypto/deposit/selectAsset";
import PdfExcelComponent from "../screens/Statement/Index";
import Dashboard from "../screens/AccountDashboard/index";
import Success from "../screens/Success/Index";
import Crypto from "../screens/AccountDashboard/Crypto";
import EditProfile from "../screens/Profile/editprofile";
import NewCard from "../screens/Tlv_Cards/NewCard";
import SendCryptoSuccess from "../screens/Crypto/sendCryptoSuccess";
import CardDetails from "../screens/Tlv_Cards/CardDetails";
import { useDispatch, useSelector } from "react-redux";
import CryptoCoinReceive from "../screens/Crypto/cryptoCoinReceive";
import CardBalance from "../screens/Tlv_Cards/CardBalance";
import VerifyEmail from "../screens/onBoarding/verifyEmail";
import VerifyMobile from "../screens/onBoarding/verifyMobile";
import RigisterCustomer from "../screens/onBoarding/rigistration";
import FillSumsub from "../screens/onBoarding/sumsub";
import AccountProgress from "../screens/onBoarding/accountProgress";
import PersonalInfo from "../screens/Profile/PersonalInfo";
import Security from "../screens/Profile/Security";
import ChangePassword from "../screens/Profile/ChangePassword";
import MyReferrals from "../screens/Profile/myReferral";
import Notifications from "../screens/AccountDashboard/Notifications";
import NoInternet from "../screens/UpdateScreens/NoInternet";
import SomethingWentWrong from "../screens/UpdateScreens/SomethingWentWrong";
import ExchangaCard from "../screens/Crypto/dashboard/ExchangaCard";
import CryptoWallet from "../screens/Crypto/dashboard/CryptoWallet";
import ViewallMyCards from "../screens/Tlv_Cards/ViewallMyCards";
import AllNewCards from "../screens/Tlv_Cards/AllTopCards";
import ApplyCard from "../screens/Tlv_Cards/ApplyCard";
import FreezeComponent from "../screens/Tlv_Cards/Freeze";
import ReportLossComponent from "../screens/Tlv_Cards/ReportLoss";
import ReplaceCardComponent from "../screens/Tlv_Cards/ReplaceCard";
import ResendPinComponent from "../screens/Tlv_Cards/ResendPin";
import AddPersonalInfo from "../screens/Profile/addpersonalinfo";
import ApplyExchangaCard from "../screens/cards/ApplyExchangaCards";
import FeeStep from "../screens/cards/FeeStep";
import SecurityQuestion from "../screens/Profile/SecurityQuestion";
import DrawerModal from "../components/DrawerMenu";
import DepositSubmitted from "../screens/Tlv_Cards/DepositSubmitted";
import ToBeReviewedStep from "../screens/cards/ToBeReviewed";
import CryptoCardsTransaction from "../screens/Crypto/cryptoCardTransations/CryptoCardsTransaction";
import ComingSoon from "../components/ComingSoon";
import ChangePasswordSuccess from "../screens/Profile/ChangePasswordSuccess";
import EXChangaCardDownloadBill from "../screens/Crypto/cryptoCardTransations/DownloadBill";
import Authentication from "../screens/Profile/authentication";
import VerifyCode from "../screens/Profile/verifyCode";
import AllFaqs from "../screens/Tlv_Cards/AllFaqs";
import Feedback from "../screens/Feedback/Feedback";
import HelpCenter from "../screens/HelpCenter/HelpCenter";
import QuickLink from "../screens/QuickLinks/QuickLinks";
import CryptoWalletView from "../screens/Crypto/dashboard/CryptoWalletView";
import QuickcardLink from "../screens/QuickLinks/QuickcardLink";
import QuickApplicationInfo from "../screens/QuickLinks/QuickApplicationInfo";
import QuickKYCInfo from "../screens/QuickLinks/QuickKycInfo";
import ApplicatoionReview from "../screens/QuickLinks/QuickApplication";
import QuickCardsList from "../screens/QuickLinks/QuickLinkCardsList";
import FeedbackSuccess from "../screens/Feedback/FeedbackSuccessPage";
import PersonalInfoView from "../screens/Profile/PersonalInfoView";
import RigistrationReferral from "../screens/onBoarding/rigistrationReferral";
import ActionRestricted from "../screens/onBoarding/actionRestricted";
import ParagraphComponent from "../components/Paragraph/Paragraph";
import { commonStyles } from "../components/CommonStyles";
import { NEW_COLOR } from "../constants/theme/variables";
import ChooseAccountType from "../screens/onBoarding/chooseAccountType";
import AddKycInfomation from "../screens/Profile/addKycInfomation";
import MessagePopUp from "../screens/Profile/messagePopup";
import AddAccountInformation from "../screens/Profile/accountInformation/addAccountInformation";
import PhoneOtpVerification from "../screens/onBoarding/phoneOtpVerification";
import SumsubCompnent from "../components/sumsub";
import AddUserDetails from "../screens/onBoarding/addUserDetails";
import UnderReview from "../screens/onBoarding/kycUnderReview";
import CryptoPayees from "../screens/Addressbook/CryptoPayeesList";
import AddEditPayeeScreen from "../screens/Addressbook/AddCryptoPayee";
import SelectCrypto from "../screens/Addressbook/SelectCryptoCoin";
import PayeeDetails from "../screens/Addressbook/CryptoPayeeView";
import UserAddressListScreen from "../screens/Profile/AddressesList";
import EmailOtpVerification from "../screens/Addressbook/payeeEmailVerification";
import CompleteKyc from "../screens/onBoarding/CompleteKyc";
import SessionExpired from "../components/secessionExpired";
import { isSetIpInfo } from "../redux/Actions/UserActions";
enableScreens();

const Stack = createNativeStackNavigator<RootStackParamList>();
const AppContainer = () => {
  const netInfo = useNetInfo();
  const dispatch = useDispatch();
  const [isConnected, setIsConnected] = useState(false);
  const userInfo = useSelector((state: any) => state.UserReducer?.userInfo);
  const isSessionExpired = useSelector((state: any) => state.UserReducer?.isSessionExpired);
  useEffect(() => {
    if (netInfo.isConnected != null) {
      if (!netInfo.isConnected) {
        setIsConnected(true);
        getIpAddress();
      } else {
        setIsConnected(false);
      }
    } else {
      setIsConnected(false);
    }

  }, [netInfo.isConnected]);

  const getIpAddress = async () => {
    // const ip = await DeviceInfo.getIpAddress();

    try {
      const response = await fetch("https://ipinfo.io/json");
      const data = await response.json();
      dispatch(isSetIpInfo(data));
    } catch (error) {
      return "Unable to fetch IP address";
    }
  }


  useEffect(() => {

    getIpAddress();
    return notifee.onForegroundEvent(async ({ type, detail }) => {
      const notificationType = detail.notification?.data?.type;
      if (type === EventType.PRESS) {
        if (Platform.OS === "ios" && notificationType === "Document_IOS") {
          NativeModules.FileManagerModule.getDocumentDirectoryPath(
            async (documentDirectory: string) => {
              try {
                await FileViewer.open(
                  documentDirectory + "/" + detail.notification?.body!
                );
              } finally {
              }
            }
          );
        } else if (
          Platform.OS === "android" &&
          notificationType === "Document_Android"
        ) {
          await NativeModules.FileManagerModule.goToFolder("Downloads");
        }
      }
    });

  }, []);

  const getAnimationForRoute = (route: any) => {
    const { animation } = route.params || {};

    switch (animation) {
      case "slide_from_left":
        return { animation: "slide_from_left" };
      case "slide_from_right":
        return { animation: "slide_from_right" };
      case "slide_from_bottom":
        return { animation: "slide_from_bottom" };
      case "fade":
        return { animation: "fade" };
      default:
        // Default animation
        return {};
    }
  };
  return (
    <NavigationContainer ref={navigationRef}>
      <View style={[{ backgroundColor: NEW_COLOR.SCREENBG_WHITE, flex: 1, }, userInfo?.accountStatus === "Inactive" ? { paddingTop: Platform.OS === "ios" ? 50 : 24 } : null]}>
        {userInfo?.accountStatus === "Inactive" &&
          <View style={[{ backgroundColor: "#6b5151", width: "100%", paddingVertical: 3, position: "absolute", top: Platform.OS === "ios" ? 60 : 0, zIndex: 10 }]}>
            <ParagraphComponent text={"Account Deactivated"} style={[commonStyles.textCenter, commonStyles.textBlack, commonStyles.fs14, commonStyles.fw500]} />
          </View>}
        <Stack.Navigator screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          gestureDirection: "horizontal",
          animation: "slide_from_right",
          animationDuration: 300,
        }}>
          <Stack.Screen name="SplashScreen" component={SplashScreen} />
          <Stack.Screen name="CryptoReceive" component={CryptoReceive} />
          <Stack.Screen name="SelectAsset" component={CryptoSelectAsset} />
          <Stack.Screen name="ComingSoon" component={ComingSoon} />
          <Stack.Screen name="PdfExcelComponent" component={PdfExcelComponent} />
          <Stack.Screen name="Dashboard" component={Dashboard} />
          <Stack.Screen name="Success" component={Success} />
          <Stack.Screen name="Crypto" component={Crypto} />
          <Stack.Screen name="Notifications" component={Notifications} />
          <Stack.Screen name="NewCard" component={NewCard} />
          <Stack.Screen name="ExchangaCard" component={ExchangaCard} />
          <Stack.Screen name="CryptoWallet" component={CryptoWallet} />
          <Stack.Screen name="CryptoWalletView" component={CryptoWalletView} />
          <Stack.Screen name="CrypoTransaction" component={CryptoCardsTransaction} />
          <Stack.Screen name="CryptoCardsTransaction" component={CryptoCardsTransaction} />
          <Stack.Screen name="EXChangaCardDownloadBill" component={EXChangaCardDownloadBill} />
          <Stack.Screen name="SendCryptoDetails" component={SendCryptoDetails} />
          <Stack.Screen name="SendCryptoSuccess" component={SendCryptoSuccess} />
          <Stack.Screen name="CardDetails" component={CardDetails} />
          <Stack.Screen name="ViewallMyCards" component={ViewallMyCards} />
          <Stack.Screen name="ApplyCard" component={ApplyCard} options={({ route }) => ({
            ...getAnimationForRoute(route),
          })} />
          <Stack.Screen name="AllFAQs" component={AllFaqs} />
          <Stack.Screen name="FreezeUnFreeze" component={FreezeComponent} />
          <Stack.Screen name="Authentication" component={Authentication} />
          <Stack.Screen name="VerifyCode" component={VerifyCode} />
          <Stack.Screen name="ReportLoss" component={ReportLossComponent} />
          <Stack.Screen name="ReplaceCard" component={ReplaceCardComponent} />
          <Stack.Screen name="ResendPin" component={ResendPinComponent} />
          <Stack.Screen name="AllNewCards" component={AllNewCards} />
          <Stack.Screen name="CryptoCoinReceive" component={CryptoCoinReceive} />
          <Stack.Screen name="CardBalance" component={CardBalance} />
          <Stack.Screen name="DepositSubmitted" component={DepositSubmitted} />
          <Stack.Screen name="VerifyEmail" component={VerifyEmail} />
          <Stack.Screen name="VerifyMobile" component={VerifyMobile} />
          <Stack.Screen name="RegisterAccount" component={RigisterCustomer} />
          <Stack.Screen name="Sumsub" component={FillSumsub} />
          <Stack.Screen name="AccountProgress" component={AccountProgress} />
          <Stack.Screen name="PersonalInfo" component={PersonalInfo} />
          <Stack.Screen name="DrawerModal" component={DrawerModal} />
          <Stack.Screen name="Security" component={Security} />
          <Stack.Screen name="SecurityQuestion" component={SecurityQuestion} />
          <Stack.Screen name="ChangePassword" component={ChangePassword} />
          <Stack.Screen name="ChangePasswordSucess" component={ChangePasswordSuccess} />
          <Stack.Screen name="MyReferrals" component={MyReferrals} />
          <Stack.Screen name="EditProfile" component={EditProfile} />
          <Stack.Screen name="AddPersonalInfo" component={AddPersonalInfo} />
          <Stack.Screen name="ApplyExchangaCard" component={ApplyExchangaCard} />
          <Stack.Screen name="FeeStep" component={FeeStep} />
          <Stack.Screen name="CardSuccess" component={ToBeReviewedStep} />
          <Stack.Screen name="Feedback" component={Feedback} />
          <Stack.Screen name="HelpCenter" component={HelpCenter} />
          <Stack.Screen name="SomethingWentWrong" component={SomethingWentWrong} />
          <Stack.Screen name="QuickLink" component={QuickLink} />
          <Stack.Screen name="QuickcardLink" component={QuickcardLink} />
          <Stack.Screen name="QuickApplicationInfo" component={QuickApplicationInfo} />
          <Stack.Screen name="QuickKYCInfo" component={QuickKYCInfo} />
          <Stack.Screen name="ApplicatoionReview" component={ApplicatoionReview} />
          <Stack.Screen name="QuickCardsList" component={QuickCardsList} />
          <Stack.Screen name='FeedbackSuccess' component={FeedbackSuccess} />
          <Stack.Screen name='PersonalInfoView' component={PersonalInfoView} />
          <Stack.Screen name='rigistrationreferral' component={RigistrationReferral} />
          <Stack.Screen name='actionRestricted' component={ActionRestricted} />
          <Stack.Screen name="chooseAccountType" component={ChooseAccountType} />
          <Stack.Screen name="addKycInfomation" component={AddKycInfomation} />
          <Stack.Screen name="addAccountInformation" component={AddAccountInformation} />
          <Stack.Screen name="messagePopUp" component={MessagePopUp} />
          <Stack.Screen name="phoneOtpVerification" component={PhoneOtpVerification} />
          <Stack.Screen name="sumsubCompnent" component={SumsubCompnent} />
          <Stack.Screen name="addUserDetails" component={AddUserDetails} />
          <Stack.Screen name="underReview" component={UnderReview} />
          <Stack.Screen name="addressesList" component={UserAddressListScreen} />
          <Stack.Screen name="cryptoPayeesList" component={CryptoPayees} />
          <Stack.Screen name="addPayee" component={AddEditPayeeScreen} />
          <Stack.Screen name="selectCryptoCoin" component={SelectCrypto} />
          <Stack.Screen name="payeeDetails" component={PayeeDetails} />
          <Stack.Screen name="emailOtpVerification" component={EmailOtpVerification} />
          <Stack.Screen name="completeKyc" component={CompleteKyc} />
        </Stack.Navigator>

      </View>
      {isConnected && <NoInternet show={isConnected} />}
      {isSessionExpired && <SessionExpired />}
    </NavigationContainer>
  );
};

export default AppContainer;
