import {
  createNavigationContainerRef,
  NavigationContainer,
  NavigationState,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store } from "../redux/reducers";
import { DynamicTabs } from "./dynamicTabs";
import SomethingWentWrong from "../screens/commonScreens/SomethingWentWrong";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Linking, Platform, StatusBar, useColorScheme } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import Notifications from "../screens/commonScreens/notifications/notifications";
import { setReferralCode } from "../redux/actions/actions";
import analytics from "@react-native-firebase/analytics";
import "@react-native-firebase/app"; // Initialize Firebase App
import crashlytics from "@react-native-firebase/crashlytics";
import Settings from "../screens/profile/settings/settings";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import RelogIn from "../screens/commonScreens/ReLogin";
import { useThemeColors } from "../hooks/useThemeColors";
import WithdrawSelectCurrency from "../screens/withdraw/currencySelection/WithdrawSelectCurrency";
import WithdrawSelectNetwork from "../screens/withdraw/networkSelection/WithdrawSelectNetwork";
import DepositCurrencySelect from "../screens/deposite/depositCoinSelection";
import DepositMethodSelect from "../screens/deposite/depositMethodSelection";
import DepositView from "../screens/deposite/depositView";
import DepositSelectNetwork from "../screens/deposite/depositNetworkSelection";
import SplashScreen from "../screens/onboarding/splashScreen";
import LoginComponent from "../screens/onboarding/login/login";
import AmountEnterScreen from "../screens/withdraw/enterAmount";
import AddNewAddress from "../screens/addPayee/addNewAddress/addNewAddress";
import AddAccountNickname from "../screens/addPayee/addNickName/addNickName";
import InviteFriends from "../screens/commonScreens/InviteFriends";
import NewProfile from "../screens/profile";
import MfaScreen from "../screens/onboarding/login/MfaScreen";
import ForgotPasswordScreen from "../screens/onboarding/forgotPassword";
import MfaEnrollmentScreen from "../screens/onboarding/login/MfaEnrollmentScreen";
import SignupComponent from "../screens/onboarding/signup/signup";
import EmailVericication from "../screens/onboarding/signup/emailVerification";
import ConfirmDetails from "../screens/addPayee/confirmDetails";
import EmailAuthenticationScreen from "../screens/profile/security/Email";
import EmailOtpVericication from "../screens/profile/security/Email/emailOtpVerfication";
import EmailChange from "../screens/profile/security/Email/emailChange";
import WithdrawSummary from "../screens/withdraw/withdrawSummary";
import WithdrawSuccess from "../screens/withdraw/success/withdrawSuccess";
import PhoneAuthenticationScreen from "../screens/profile/security/Phone";
import PhoneOtpVericication from "../screens/profile/security/Phone/phoneOtpVerfication";
import PhoneNumberChange from "../screens/profile/security/Phone/PhoneNumberChange";
import Security from "../screens/profile/security";
import ConfirmPassword from "../screens/onboarding/signup/rigistration";
import BindPhoneComponent from "../screens/onboarding/bindPhone";
import PayeeSuccess from "../screens/addPayee/payeeSuccess/payeeSuccess";
import PayeesList from "../screens/addPayee/payeesList.tsx";
import ChangePassword from "../screens/profile/security/changePassword";
import CurrencyList from "../screens/currencyList/currencyList";
import AppLock from "../screens/profile/security/appLock";
import CardPrivacyControls from "../screens/profile/security/CardPrivacyControls";
import PhoneVerification from "../screens/onboarding/bindPhone/phoneOtpVerification";
import AutoLock from "../screens/profile/security/appLock/AutoLock";
import TransactionDetails from "../screens/TransactionDetails";
import TransactionList from "../screens/transactions/transactionsList";
import PatternLock from "../screens/profile/security/appLock/patternLock";
import GoogleAuthentication from "../screens/profile/security/googleAuthentication";
import MyCardsList from "../screens/cards/myCards/list";
import MyCards from "../screens/cards/myCards";
import ChooseCard from "../screens/cards/applyCards/chooseCard/chooseCard";
import CardApplicationOrder from "../screens/cards/applyCards/cardApplicationOrder/cardApplicationOrder";
import AddressForm from "../screens/commonScreens/addressForm/addressForm";
import FreezeUnFreeze from "../screens/cards/myCards/freezeUnfreeze";
import CardSettings from "../screens/cards/myCards/cardSettings/cardSettings";
import SecuritySettings from "../screens/cards/myCards/cardSettings/securitySettings/securitySettings";
import CardApplicationList from "../screens/cards/myCards/CardApplicationList/cardApplicationList";
import ReplaceCard from "../screens/cards/myCards/cardSettings/replaceCard/replaceCard";
import DeleteCard from "../screens/cards/myCards/cardSettings/deleteCard/deleteCard";
import Appearance from "../screens/profile/settings/appearance/Appearance";
import Language from "../screens/profile/settings/language/language";
import CardLimit from "../screens/cards/myCards/limit";
import ShareScreen from "../screens/profile/share/share";
import Community from "../screens/profile/community/community";
import SupportCentre from "../screens/profile/supportCenter/supportCenter";
import AboutUs from "../screens/profile/aboutUs/aboutUs";
import { getThemedCommonStyles } from "../assets/styles/CommonStyles";
import ComingSoon from "../screens/commonScreens/comingSoon/comingSoon";
import DeleteAccount from "../screens/profile/security/deleteAccount/deleteAccount";
import Permissions from "../screens/profile/settings/permissions/permissions";
import PersonalInfo from "../screens/profile/PersonalInfo";
import ProfileUpload from "../screens/profile/ProfileAvatarPickerScreen";
import Hub from "../screens/Hub/hub";
import SearchForHelp from "../screens/profile/supportCenter/searchOfHelp";
import BillStatementList from "../screens/cards/myCards/billStatement";
import ExportBillStatement from "../screens/cards/myCards/billStatement/exportBillStatement";
import WithdrawTransactionDetails from "../screens/withdraw/transactionDetails/withdrawTransactionDetails";
import AppLockScreen from "../screens/commonScreens/appAuthentication/commonAppAuthentication";
import ParagraphComponent from "../newComponents/textComponets/paragraphText/paragraph";
import ViewComponent from "../newComponents/view/view";
import AssetsScreen from "../screens/Dashboard/AssetsScreen";
import { t } from "i18next";
import WhiteListAddresses from "../screens/profile/whiteListAddresses/whitelistAddress";
import LearnMoreView from "../screens/Dashboard/components/learnMoreView";
import CurrencySelection from "../screens/profile/whiteListAddresses/currencySelection/currencySeletion";
import NetworkSelection from "../screens/profile/whiteListAddresses/networkSelection/networkSelection";
import AddProfileWalletaddress from "../screens/profile/whiteListAddresses/profileAddWalletAddress/addProfileWalletAdddress";
import AddWhiteListNickname from "../screens/profile/whiteListAddresses/addWhitelistNickname/addWhitelistNickname";
import WhitelistConfirmDetails from "../screens/profile/whiteListAddresses/whitelistConfirmDetails/whitelistConfirmDetails";
import WhiteListSuccess from "../screens/profile/whiteListAddresses/whiteListSuccess/whitelistSuccess";
import Send from "../screens/send";
import TransferAmount from "../screens/send/transferAmount/transferAmount";
import Receive from "../screens/send/recieve";
import SendTransactionStatus from "../screens/send/transactionStatus/transactionStatus";
import SendSuccess from "../screens/send/sendSuccess/sendSuccess";
import SetAmount from "../screens/send/recieve/setAmount";
import SupportAllCases from "../screens/profile/caseMangement/allcases";
import SupportCaseView from "../screens/profile/caseMangement/view";
import CaseViewDetails from "../screens/profile/caseMangement/caseViewDetails";
import CaseManagement from "../screens/profile/caseMangement";
import CaseAlertsCarousel from "../screens/Dashboard/components/caseAlertCarousel";
import SendReplay from "../screens/profile/caseMangement/caseViewDetails/caseReplay/sendMessage";
import SelectCountry from "../screens/onboarding/sumsub/selectCountry";
import WhiteListView from "../screens/profile/whiteListAddresses/whiteListView";
import ShareQrCode from "../screens/send/recieve/shareQr";
import ShareReferral from "../screens/refer/referAndEarn/shareReferral";
import ReferralProgram from "../screens/refer/referralProgram";
import ReferralTransactionList from "../screens/refer/transactionComponents/ReferralTransactionList";
import CryptoBackTransactionList from "../screens/rewards/transactions/CryptoBackTransactionList";
import CryptoBackTransactionDetails from "../screens/rewards/transactions/details";
import ReferralTransactionDetails from "../screens/refer/transactionComponents/details";
import CardTopUp from "../screens/cards/myCards/topUp";
import TopUpSuccess from "../screens/cards/myCards/topUp/topupSuccess";
import FrontEggLoginComponent from "../screens/onboarding/login/loginFrontEgg";
import ChangePasswordComponent from "../screens/profile/security/changePassword/frontEggChangePassword/changePassword";
import DevicesList from "../screens/profile/security/devices/devicesList";
import FrontEggLogin from "../screens/frontEggOnboarding/login/frontEggLogin";
import FrontEggConfirmPassword from "../screens/frontEggOnboarding/signup/frontEggPassword";

import FrontEggSignup from "../screens/frontEggOnboarding/signup/frontEggSignUp";


import FrontEggEmailVerification from "../screens/frontEggOnboarding/signup/frontEggEmailVerification";
import IdentityVerifications from "../screens/profile/personalnfoScreens/approvedScreens/identityVerification";
import PersonalInformation from "../screens/profile/personalnfoScreens/personalInformation/personalInformation";
import GoogleAthenticatorEnable from "../screens/profile/security/googleAuthentication/googleAuthenticatorView";
import GoogleAthenticatorDisable from "../screens/profile/security/googleAuthentication/athenticatorDisable/athenticatorDisable";
import MfaAuthenticator from "../screens/frontEggOnboarding/login/frontEggAuthenticator";
import RecoveryCode from "../screens/profile/security/googleAuthentication/googleAuthenticatorView/recoveryCode";
import MFARecoveryCode from "../screens/frontEggOnboarding/login/mfaRecovery";
import LoginVerificationScreen from "../screens/profile/security/LoginVerificationScreen";
import AdvanceProtectionScreen from "../screens/profile/security/AdvanceProtectionScreen";
import ManageYourAccountScreen from "../screens/profile/security/ManageYourAccountScreen";
import PaymentPriority from "../screens/profile/paymentAndAlerts/paymentPriority";
import PaymentAlerts from "../screens/profile/paymentAndAlerts/paymentAlerts";
import LowbalanceAlert from "../screens/profile/paymentAndAlerts/lowbalanceAlert/lowbalanceAlert";
import CardKycRequirements from "../screens/cards/applyCards/kycRequirements/kycRequirements";
import FeeStep from "../screens/cards/applyCards/feeStep/feeStep";
import ActionRestricted from "../screens/onboarding/actionRestricted/actionRestriction";
import {
  UserPersonalInformation,
  ContactInformation,
  FinancialInformation,
  ApplyCardAllSet,
  GetMyCard,
} from "../screens/cards/kycMultiStep";
import SupportTickets from "../screens/profile/supportCenter/sendUsMessage/supportTIckets";
import CreateTicket from "../screens/profile/supportCenter/sendUsMessage/createTicket/createTicket";
import SupportChat from "../screens/profile/supportCenter/sendUsMessage/supportChat/supportChat";
import SupportChatReplay from "../screens/profile/supportCenter/sendUsMessage/supportChat/chatReplay";
import SupportedCountry from "../screens/cards/kycMultiStep/suportedCountry/supportedCountry";
import WithdrawMethodSelect from "../screens/withdraw/selectMethod";
import WithdrawFiat from "../screens/withdraw/withdrawFiat/withdrawFiat";
import AddBeneficiary from "../screens/withdraw/withdrawFiat/addBeneficiary/addBeneficiary";
import BankInformation from "../screens/withdraw/withdrawFiat/bankInformation/bankInformation";


const CardsAppContainer = () => {
  const Stack = createNativeStackNavigator();
  const appThemeSetting = useSelector(
    (state: any) => state.userReducer?.appTheme
  );
  const [isReady, setIsReady] = useState(false);
  const dispatch = useDispatch();
  const navigationRef = createNavigationContainerRef();
  const routeNameRef = useRef<string | null>(null);
  const navigationcontainerref = useRef(null);
  const isOnboardingSteps = useSelector(
    (state: any) => state.userReducer?.isOnboardingSteps
  );
  const colorScheme = useColorScheme();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
  const intervalRef = useRef<any>(null);
  const [enableAuthenticator, setEnableAuthenticator] =
    useState<boolean>(false);
  const isBiometricEnabled = useSelector((state: any) => state.userReducer?.isBiometricEnabled);
  const autoLockTime = useSelector((state: any) => state.userReducer?.autoLockTime);
  const linking = {
    prefixes: [
      "https://app.bullswipe.com",
      "bullswipe://",
      "com.bullswipe.test://",
    ],
    config: {
      screens: {
        Settings: "settings",
        SignupComponent: "signup",
        frontEggSignup: "frontEggSignup",
      },
    },
  };
  const insets = useSafeAreaInsets();
  useEffect(() => {
    if (userInfo && isBiometricEnabled) {
      setEnableAuthenticator(true);
    }
  }, []);

  useEffect(() => {
    if (!isBiometricEnabled || autoLockTime <= 0) return;
    const timeoutMs = autoLockTime * 60 * 1000;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setEnableAuthenticator(true);
    }, timeoutMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };

  }, [isBiometricEnabled, autoLockTime]);


  const [pendingNavigation, setPendingNavigation] = useState<{ referralCode: string } | null>(null);

  useEffect(() => {
    const handleUrl = (url: string | null) => {
      if (url) {
        const referralCode = extractReferralCodeFromUrl(url);
        if (referralCode) {
          dispatch(setReferralCode(referralCode));
          setPendingNavigation({ referralCode });
        }
      }
      setIsReady(true);
    };

    const initialUrl = async () => {
      const initialUrl = await Linking.getInitialURL();
      handleUrl(initialUrl);
    };
    const onLinkOpen = ({ url }: { url: string }) => {
      handleUrl(url);
    };
    initialUrl();
    const subscription = Linking.addEventListener("url", onLinkOpen);
    return () => subscription.remove();
  }, [dispatch]);

  // Handle pending navigation after navigation is ready
  useEffect(() => {
    if (pendingNavigation && navigationRef.current?.isReady()) {
      setTimeout(() => {
        navigationRef.current?.navigate("frontEggSignup", { referralCode: pendingNavigation.referralCode });
        setPendingNavigation(null);
      }, 500); // Increased delay for APK builds
    }
  }, [pendingNavigation, navigationRef.current?.isReady()]);

  const extractReferralCodeFromUrl = (url: any) => {
    const urlObj = new URL(url);
    const referralCode = urlObj.searchParams.get("referralCode") || urlObj.searchParams.get("referral");
    return referralCode;
  };
  if (!isReady) {
    return null;
  }

  const getActiveRouteName = (
    state: NavigationState | undefined
  ): string | null => {
    if (!state) return null;
    const route = state.routes[state.index];
    if (route.state) {
      return getActiveRouteName(route.state as NavigationState);
    }
    return route.name;
  };

  const handleNavigationReady = () => {
    const currentRouteName = getActiveRouteName(
      navigationRef.current?.getRootState()
    );
    routeNameRef.current = currentRouteName;
    if (currentRouteName) {
      analytics().logScreenView({
        screen_name: currentRouteName,
        screen_class: currentRouteName,
      });
    }

    // Handle pending navigation for cold start
    if (pendingNavigation) {
      setTimeout(() => {
        navigationRef.current?.navigate("frontEggSignup", { referralCode: pendingNavigation.referralCode });
        setPendingNavigation(null);
      }, 1000); // Longer delay for cold start
    }
  };

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
  const handleNavigationStateChange = async (
    state: NavigationState | undefined
  ) => {
    const previousRouteName = routeNameRef.current;
    const currentRouteName = getActiveRouteName(state);
    if (previousRouteName !== currentRouteName && currentRouteName) {
      try {
        await analytics().logScreenView({
          screen_name: currentRouteName,
          screen_class: currentRouteName,
        });
        crashlytics().setAttribute("screen", currentRouteName);
      } catch (error) {
        console.error("Analytics: Failed to log screen_view", error);
      }
    }
    routeNameRef.current = currentRouteName;
  };
  let backgroundSource;
  // Determine if the dark theme should be used
  if (
    appThemeSetting !== "system" &&
    appThemeSetting !== undefined &&
    appThemeSetting !== null
  ) {
    backgroundSource = appThemeSetting === "dark";
  } else {
    backgroundSource = colorScheme === "dark";
  }
  const handleAuthSuccess = () => {
    setEnableAuthenticator(false);
  };
  const statusBarBackgroundColor = backgroundSource ? "#000" : "#fff";
  const isStatusBarTranslucent = true; // Matches the current StatusBar prop
  return (
    <Provider store={store}>
      <GestureHandlerRootView
        style={[{ flex: 1 }, commonStyles.pt34, commonStyles.screenBg]}
      >
        <StatusBar
          barStyle={backgroundSource ? "light-content" : "dark-content"}
          translucent={true}
          backgroundColor={backgroundSource ? "#000" : "#fff"}
        />
        <NavigationContainer
          linking={linking}
          ref={navigationRef}
          onReady={handleNavigationReady} // Pass the function reference
          onStateChange={handleNavigationStateChange}
        >
          {userInfo && userInfo?.customerAccountStatus === false && (
            <ViewComponent
              style={[
                {
                  backgroundColor: NEW_COLOR.TITLE_GREY,
                  width: "100%",
                  paddingVertical: 3,
                  position: "absolute",
                  top: Platform.OS === "ios" ? 40 : 40,
                  zIndex: 10,
                },
              ]}
            >
              <ParagraphComponent
                text={t("GLOBAL_CONSTANTS.ACCOUNT_DEACTIVATED")}
                style={[
                  commonStyles.textCenter,
                  commonStyles.textBlack,
                  commonStyles.fs14,
                  commonStyles.fw500,
                ]}
              />
            </ViewComponent>
          )}
          <Stack.Navigator
            initialRouteName={
              isOnboardingSteps ? "SplaceScreen" : "SplaceScreen"
            }
            screenOptions={{
              headerShown: false,
              gestureEnabled: true,
              gestureDirection: "horizontal",
              animation: "slide_from_right",
              animationDuration: 300,
            }}
          >
            {/* Authentication */}
            {/* <Stack.Screen name="SplaceScreen" component={SplashScreen} /> */}

            {/* OnBoarding */}
            <Stack.Screen
              name="SplaceScreen"
              component={SplashScreen}
              options={{ headerShown: false, animation: "slide_from_left" }}
            />
            <Stack.Screen name="login" component={LoginComponent} />
            <Stack.Screen name="FrontEggLoginComponent" component={FrontEggLoginComponent} />
            <Stack.Screen
              name="ForgotPasswordScreen"
              component={ForgotPasswordScreen}
            />
            <Stack.Screen name="MfaScreen" component={MfaScreen} />
            <Stack.Screen
              name="MfaEnrollment"
              component={MfaEnrollmentScreen}
            />
            <Stack.Screen name="signup" component={SignupComponent} options={({ route }) => ({
              headerShown: false,
              ...getAnimationForRoute(route),
            })} />
            <Stack.Screen name="verifyEmail" component={EmailVericication} />
            <Stack.Screen name="confirmPassword" component={ConfirmPassword} />
            <Stack.Screen name="bindPhone" component={BindPhoneComponent} />
            <Stack.Screen
              name="PhoneVerification"
              component={PhoneVerification}
            />
            {/* sumsub */}
            <Stack.Screen name="SelectCountry" component={SelectCountry} />

            {/* Common Screens */}
            <Stack.Screen
              name="SomethingWentWrong"
              component={SomethingWentWrong}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="RelogIn"
              component={RelogIn}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ComingSoon"
              component={ComingSoon}
              options={{ headerShown: false }}
            />

            {/* Tabs */}
            <Stack.Screen
              name="Dashboard"
              component={DynamicTabs}
              options={({ route }) => ({
                initialTab: route.params?.initialTab,
                animation: "none",
              })}
            />
            <Stack.Screen
              name="Home"
              component={DynamicTabs}
              options={({ route }) => ({
                initialTab: route.params?.initialTab,
              })}
            />

            {/* Profile */}
            <Stack.Screen
              name="Settings"
              component={Settings}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="NewProfile"
              component={NewProfile}
              options={({ route }) => ({
                headerShown: false,
                ...getAnimationForRoute(route),
              })}
            />
            <Stack.Screen
              name="EmailAuthenticationScreen"
              component={EmailAuthenticationScreen}
              options={({ route }) => ({
                headerShown: false,
                ...getAnimationForRoute(route),
              })}
            />
            <Stack.Screen
              name="EmailOtpVericication"
              component={EmailOtpVericication}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="EmailChange"
              component={EmailChange}
              options={({ route }) => ({
                headerShown: false,
                ...getAnimationForRoute(route),
              })}
            />
            <Stack.Screen
              name="PhoneAuthenticationScreen"
              component={PhoneAuthenticationScreen}
              options={({ route }) => ({
                headerShown: false,
                ...getAnimationForRoute(route),
              })}
            />
            <Stack.Screen
              name="PhoneOtpVericication"
              component={PhoneOtpVericication}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="PhoneNumberChange"
              component={PhoneNumberChange}
              options={({ route }) => ({
                headerShown: false,
                ...getAnimationForRoute(route),
              })}
            />
            <Stack.Screen
              name="ChangePassword"
              component={ChangePassword}
              options={({ route }) => ({
                headerShown: false,
                ...getAnimationForRoute(route),
              })}
            />
            <Stack.Screen
              name="AppLock"
              component={AppLock}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AutoLock"
              component={AutoLock}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="PatternLock"
              component={PatternLock}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="PaymentPriority"
              component={PaymentPriority}
              options={{ headerShown: false }}
            />

            {/* low Balance alert */}
            <Stack.Screen
              name="LowbalanceAlert"
              component={LowbalanceAlert}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="PersonalInfo"
              component={PersonalInfo}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ProfileUpload"
              component={ProfileUpload}
              options={{ headerShown: false }}
            />

            {/* share */}
            <Stack.Screen
              name="ShareScreen"
              component={ShareScreen}
              options={{ headerShown: false }}
            />
            {/* community */}
            <Stack.Screen
              name="Community"
              component={Community}
              options={{ headerShown: false }}
            />
            {/* support center */}
            <Stack.Screen
              name="SupportCentre"
              component={SupportCentre}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="SearchForHelp"
              component={SearchForHelp}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="SupportTickets"
              component={SupportTickets}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="CreateTicket"
              component={CreateTicket}
            />
            <Stack.Screen
              name="SupportChat"
              component={SupportChat}
            />
            <Stack.Screen
              name="SupportChatReplay"
              component={SupportChatReplay}
            />
            {/* about us */}
            <Stack.Screen
              name="AboutUs"
              component={AboutUs}
              options={{ headerShown: false }}
            />

            {/* settings */}
            <Stack.Screen name="Appearance" component={Appearance} />
            <Stack.Screen name="Language" component={Language} />

            {/* Transactions */}
            <Stack.Screen
              name="TransactionList"
              component={TransactionList}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="CryptoBackTransactionList"
              component={CryptoBackTransactionList}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="CryptoBackTransactionDetails"
              component={CryptoBackTransactionDetails}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="TransactionDetails"
              component={TransactionDetails}
            />
            <Stack.Screen name="Permissions" component={Permissions} />
            <Stack.Screen
              name="WhiteListAddresses"
              component={WhiteListAddresses}
            />
            <Stack.Screen
              name="WhiteListView"
              component={WhiteListView}
            />

            {/* profile drawer */}
            <Stack.Screen
              name="Security"
              component={Security}
              options={({ route }) => ({
                headerShown: false,
                ...getAnimationForRoute(route),
              })}
            />
            <Stack.Screen
              name="GoogleAuthentication"
              component={GoogleAuthentication}
              options={({ route }) => ({
                headerShown: false,
                ...getAnimationForRoute(route),
              })}
            />
            <Stack.Screen
              name="GoogleAthenticatorEnable"
              component={GoogleAthenticatorEnable}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="GoogleAthenticatorDisable"
              component={GoogleAthenticatorDisable}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="RecoveryCode"
              component={RecoveryCode}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="Notifications"
              component={Notifications}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="IdentityVerifications"
              component={IdentityVerifications}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="PersonalInformation"
              component={PersonalInformation}
              options={{ headerShown: false }}
            />
            {/* Security and Access */}
            <Stack.Screen
              name="LoginVerificationScreen"
              component={LoginVerificationScreen}
              options={({ route }) => ({
                headerShown: false,
                ...getAnimationForRoute(route),
              })}
            />
            <Stack.Screen
              name="AdvanceProtectionScreen"
              component={AdvanceProtectionScreen}
              options={({ route }) => ({
                headerShown: false,
                ...getAnimationForRoute(route),
              })}
            />
            <Stack.Screen
              name="ManageYourAccountScreen"
              component={ManageYourAccountScreen}
              options={({ route }) => ({
                headerShown: false,
                ...getAnimationForRoute(route),
              })}
            />

            <Stack.Screen
              name="PaymentAlerts"
              component={PaymentAlerts}
              options={({ route }) => ({
                headerShown: false,
                ...getAnimationForRoute(route),
              })}
            />



            {/* Deposit */}
            <Stack.Screen
              name="DepositView"
              component={DepositView}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="DepositCurrencySelect"
              component={DepositCurrencySelect}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="DepositMethodSelect"
              component={DepositMethodSelect}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="DepositSelectNetwork"
              component={DepositSelectNetwork}
              options={{ headerShown: false }}
            />

            <Stack.Screen name="Support" component={CaseManagement} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="SupportAllCases" component={SupportAllCases} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="SupportCaseView" component={SupportCaseView} options={({ route }) => ({
              headerShown: false,
              ...getAnimationForRoute(route),
            })} />
            <Stack.Screen name="CaseViewDetails" component={CaseViewDetails} options={({ route }) => ({
              headerShown: false,
              ...getAnimationForRoute(route),
            })} />
            <Stack.Screen name="SendReplay" component={SendReplay} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />

            {/* Withdraw */}
            <Stack.Screen
              name="WithdrawSelectCurrency"
              component={WithdrawSelectCurrency}
              options={({ route }) => ({
                headerShown: false,
                ...getAnimationForRoute(route),
              })}
            />
            <Stack.Screen
              name="WithdrawSelectNetwork"
              component={WithdrawSelectNetwork}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AmountEnterScreen"
              component={AmountEnterScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="WithdrawSummary"
              component={WithdrawSummary}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="WithdrawSuccess"
              component={WithdrawSuccess}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="WithdrawTransactionDetails"
              component={WithdrawTransactionDetails}
              options={{ headerShown: false }}
            />





            {/* withdraw back */}
            <Stack.Screen
              name="WithdrawSelectCurrencyBack"
              component={WithdrawSelectCurrency}
              options={{ headerShown: false, animation: "slide_from_left" }}
            />
            <Stack.Screen
              name="WithdrawSelectNetworkBack"
              component={WithdrawSelectNetwork}
              options={{ headerShown: false, animation: "slide_from_left" }}
            />
            {/* Withdrawfiat */}

             <Stack.Screen
              name="WithdrawMethodSelect"
              component={WithdrawMethodSelect}
                options={({ route }) => ({
                headerShown: false,
                ...getAnimationForRoute(route),
              })}
            />
            <Stack.Screen
              name="WithdrawFiat"
              component={WithdrawFiat}
              options={({ route }) => ({
                headerShown: false,
                ...getAnimationForRoute(route),
              })}
            />
             <Stack.Screen
              name="AddBeneficiary"
              component={AddBeneficiary}
              options={({ route }) => ({
                headerShown: false,
                ...getAnimationForRoute(route),
              })}
            />
              <Stack.Screen
              name="BankInformation"
              component={BankInformation}
              options={({ route }) => ({
                headerShown: false,
                ...getAnimationForRoute(route),
              })}
            />
            {/* SEND */}

            <Stack.Screen
              name="Send"
              component={Send}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="TransferAmount"
              component={TransferAmount}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Receive"
              component={Receive}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="SetAmount"
              component={SetAmount}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ShareQrCode"
              component={ShareQrCode}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="SendTransactionStatus"
              component={SendTransactionStatus}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="SendSuccess"
              component={SendSuccess}
              options={{ headerShown: false }}
            />

            {/* add payee */}
            <Stack.Screen
              name="AddNewAddress"
              component={AddNewAddress}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AddAccountNickname"
              component={AddAccountNickname}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ConfirmDetails"
              component={ConfirmDetails}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="PayeeSuccess"
              component={PayeeSuccess}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="PayeeList"
              component={PayeesList}
              options={{ headerShown: false }}
            />

            {/* profile Payees */}
            <Stack.Screen
              name="CurrencySelection"
              component={CurrencySelection}
            />
            <Stack.Screen
              name="NetworkSelection"
              component={NetworkSelection}
            />
            <Stack.Screen
              name="AddProfileWalletaddress"
              component={AddProfileWalletaddress}
            />
            <Stack.Screen
              name="AddWhiteListNickname"
              component={AddWhiteListNickname}
            />
            <Stack.Screen
              name="WhitelistConfirmDetails"
              component={WhitelistConfirmDetails}
            />
            <Stack.Screen
              name="WhiteListSuccess"
              component={WhiteListSuccess}
            />

            {/* My cards  */}
            <Stack.Screen name="MyCardsList" component={MyCardsList} />
            <Stack.Screen
              name="MyCards"
              component={MyCards}
              options={({ route }) => ({
                headerShown: false,
                ...getAnimationForRoute(route),
              })}
            />
            <Stack.Screen name="FreezeUnFreeze" component={FreezeUnFreeze} />
            <Stack.Screen
              name="CardApplicationList"
              component={CardApplicationList}
            />
            <Stack.Screen
              name="CardLimit"
              component={CardLimit}
              options={({ route }) => ({
                headerShown: false,
                ...getAnimationForRoute(route),
              })}
            />
            <Stack.Screen
              name="BillStatementList"
              component={BillStatementList}
            />
            <Stack.Screen
              name="ExportBillStatement"
              component={ExportBillStatement}
            />

            {/* card Settings */}
            <Stack.Screen name="CardSettings" component={CardSettings} />
            <Stack.Screen
              name="SecuritySettings"
              component={SecuritySettings}
            />
            <Stack.Screen name="ReplaceCard" component={ReplaceCard} />
            <Stack.Screen name="DeleteCard" component={DeleteCard} />

            {/* card topup */}
            <Stack.Screen name="CardTopUp" component={CardTopUp} />
            <Stack.Screen name="TopUpSuccess" component={TopUpSuccess} />

            {/* apply card */}
            <Stack.Screen
              name="ChooseCard"
              component={ChooseCard}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="CardApplicationOrder"
              component={CardApplicationOrder}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="CardKycRequirements"
              component={CardKycRequirements}
              options={{ headerShown: false }}
            />

            {/* Multi-Step KYC Screens */}
            <Stack.Screen
              name="UserPersonalInformation"
              component={UserPersonalInformation}
              options={({ route }) => ({
                headerShown: false,
                ...getAnimationForRoute(route),
              })}
            />
            <Stack.Screen
              name="ContactInformation"
              component={ContactInformation}
              options={({ route }) => ({
                headerShown: false,
                ...getAnimationForRoute(route),
              })}
            />
            <Stack.Screen
              name="FinancialInformation"
              component={FinancialInformation}
              options={({ route }) => ({
                headerShown: false,
                ...getAnimationForRoute(route),
              })}
            />
            <Stack.Screen
              name="ApplyCardAllSet"
              component={ApplyCardAllSet}
              options={({ route }) => ({
                headerShown: false,
                ...getAnimationForRoute(route),
              })}
            />
            <Stack.Screen
              name="GetMyCard"
              component={GetMyCard}
              options={({ route }) => ({
                headerShown: false,
                ...getAnimationForRoute(route),
              })}
            />

            <Stack.Screen
              name="FeeStep"
              component={FeeStep}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="SupportedCountry"
              component={SupportedCountry}
              options={({ route }) => ({
                headerShown: false,
                ...getAnimationForRoute(route),
              })}
            />

            {/* Address Form */}
            <Stack.Screen
              name="AddressForm"
              component={AddressForm}
              options={{ headerShown: false }}
            />
            {/*currencyListscreen*/}
            <Stack.Screen
              name="CurrencyList"
              component={CurrencyList}
              options={{ headerShown: false }}
            />
            {/* cardPrivicyControls */}
            <Stack.Screen
              name="CardPrivacyControls"
              component={CardPrivacyControls}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="DeleteAccount"
              component={DeleteAccount}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Hub"
              component={Hub}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Rewards"
              component={DynamicTabs}
              options={({ route }) => ({
                initialTab: route.params?.initialTab,
              })}
            />
            <Stack.Screen
              name="CaseAlertsCarousel"
              component={CaseAlertsCarousel}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AssetsScreen"
              component={AssetsScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="LearnMoreView"
              component={LearnMoreView}
              options={{ headerShown: false }}
            />

            {/* Refer screens */}
            <Stack.Screen
              name="Refer"
              component={DynamicTabs}
              options={({ route }) => ({
                initialTab: route.params?.initialTab,
              })}
            />
            <Stack.Screen
              name="ShareReferral"
              component={ShareReferral}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ReferralProgram"
              component={ReferralProgram}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ReferralTransactionList"
              component={ReferralTransactionList}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ReferralTransactionDetails"
              component={ReferralTransactionDetails}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ChangePasswordComponent"
              component={ChangePasswordComponent}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="devicesList"
              component={DevicesList}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="frontEggSignup"
              component={FrontEggSignup}
              options={{ headerShown: false }}

            />
            <Stack.Screen
              name="FrontEggLogin"
              component={FrontEggLogin}
              options={({ route }) => ({
                headerShown: false,
                ...getAnimationForRoute(route),
              })}

            />

            <Stack.Screen
              name="frontEggConfirmPassword"
              component={FrontEggConfirmPassword}
              options={{ headerShown: false }}
            />



            <Stack.Screen
              name="frontEggEmailVerification"
              component={FrontEggEmailVerification}
              options={{ headerShown: false }}

            />
            <Stack.Screen
              name="mfaAuthenticator"
              component={MfaAuthenticator}
              options={{ headerShown: false }}

            />
            <Stack.Screen
              name="mfaRecovery"
              component={MFARecoveryCode}
              options={{ headerShown: false }}

            />
            <Stack.Screen
              name="actionRestricted"
              component={ActionRestricted}
              options={{ headerShown: false }}

            />

          </Stack.Navigator>
        </NavigationContainer>
        {enableAuthenticator && <AppLockScreen onSuccess={handleAuthSuccess} />}
      </GestureHandlerRootView>
      {/* </PersistGate> */}
    </Provider>
  );
};

export default CardsAppContainer;
