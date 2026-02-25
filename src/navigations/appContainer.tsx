import { createNavigationContainerRef, NavigationContainer, NavigationState } from "@react-navigation/native";
import BankCreationForm from "../screens/fintechApp/bank/AccountCreation/components/bankCreateForm";
import WalletsBankCreation from "../screens/fintechApp/bank/AccountCreation/components/walletsBankCreateForm";
import BankPaywithWalletTabs from "../screens/fintechApp/bank/AccountCreation/components/bankPaywithWalletTabs";
import PayWithFiatPreview from "../screens/fintechApp/bank/AccountCreation/components/paywithFiatSummary";
import PayWithCryptoWalletSummery from "../screens/fintechApp/bank/AccountCreation/components/payWithCryptoWalletSummary";
import AllAccounts from "../screens/fintechApp/bank/Dashboard/allAccounts";
import Accounts from "../screens/fintechApp/bank/Dashboard/accounts";
import { AddressListScreen, BankKYCScreen } from "../screens/fintechApp/bank/AccountCreation/PersonalKyc";
import BankKycPreview from "../screens/fintechApp/bank/AccountCreation/PersonalKyc/components/bankKycPriview";
import BankKycProfileStep2 from "../screens/fintechApp/bank/AccountCreation/PersonalKyc/components/kycProfileStep2";
import CreateAccountInformation from "../screens/fintechApp/bank/AccountCreation/components/noAccount";
import { BankKybDocumentsStep, BankKybReview } from "../screens/fintechApp/bank/AccountCreation/BusinessKyb";
import BankKybAddUbosDetailsForm from "../screens/fintechApp/bank/AccountCreation/BusinessKyb/components/addUbosForm";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store } from "../redux/reducers";
import { DynamicTabs } from "../screens/commonScreens/tabs/dynamicTabs";
import TransactionDetails from "../screens/commonScreens/transactions/details";
import SomethingWentWrong from "../components/somethingWentWrong/SomethingWentWrong";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Linking, StatusBar, useColorScheme } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import Notifications from "../screens/commonScreens/notifications/notifications";
import { setReferralCode } from "../redux/actions/actions";
import CryptoDeposit from "../screens/fintechApp/wallets/deposit/cryptoDeposit";
import CrptoWithdraw from "../screens/fintechApp/wallets/withdraw/cryptoWithdraw";
import ApplyCard from "../screens/fintechApp/cards/apply_card/fee";
import AllCards from "../screens/fintechApp/cards/apply_card";
import SumsubNavigation from "../screens/fintechApp/cards/apply_card/sumsubNavigation";
import HelpCenter from "../screens/fintechApp/profile/helpCenter/helpCenter";
import Security from "../screens/fintechApp/profile/security/security";
import KycProfile from "../screens/fintechApp/onboarding/kyc/kycProfile";
import KycProfileStep2 from "../screens/fintechApp/onboarding/kyc/kycProfileStep2";
import KycProfilePreview from "../screens/fintechApp/onboarding/kyc/kycProfilePriview";
import CompleteKyc from "../screens/fintechApp/onboarding/kyc/kycsuccessPage";
import ChooseAccountType from "../screens/fintechApp/onboarding/registration/personalInformation/chooseAccountType";
import CustomerRigister from "../screens/fintechApp/onboarding/registration/personalInformation/personalInformation";
import KybUboList from "../screens/fintechApp/onboarding/kyb/ubos/kybUboList";
import KybDirectorDetailsList from "../screens/fintechApp/onboarding/kyb/directors/kybDirectorDetails";
import KybAddDirectorsDetailsForm from "../screens/fintechApp/onboarding/kyb/directors/addDirectorsForm";
import KybInfoPreview from "../screens/fintechApp/onboarding/kyb/review/kybReview";
import AddPersonalInfo from "../screens/fintechApp/onboarding/kyc/kyckybaddress";
import KybAddUbosDetailsForm from "../screens/fintechApp/onboarding/kyb/ubos/addUbosForm";
import KybCompanyData from "../screens/fintechApp/onboarding/kyb/company/companyData";
import VerifyEmail from "../screens/fintechApp/onboarding/registration/verifyEmail/verifyEmail";
import AccountProgress from "../screens/fintechApp/onboarding/accountStatus/accountProgress";
import Addressbook from "../screens/fintechApp/profile/addressbook/Index";
import AddressbookCrypto from "../screens/fintechApp/profile/addressbook/crytoPayee/addressbookCrypto";
import AddressbookCryptoList from "../screens/fintechApp/profile/addressbook/crytoPayee/addressbookCryptoList";
import AddressbookCryptoView from "../screens/fintechApp/profile/addressbook/crytoPayee/addressbookCryptoView";
import LoginHome from "../screens/commonScreens/splashScreen/splaceScreen";
import ApplySuccess from "../screens/fintechApp/cards/apply_card/apply_card_kyc/applySuccess";
import analytics from "@react-native-firebase/analytics"
import '@react-native-firebase/app';  // Initialize Firebase App
import crashlytics from '@react-native-firebase/crashlytics';
import Settings from "../screens/fintechApp/profile/settings/settings";
import CardsInfo from "../screens/fintechApp/cards/myCards";
import Auth0Signup from "../screens/fintechApp/onboarding/registration/signup/auth0Signup";
import MembersDashBoard from "../screens/fintechApp/profile/referrals";
import MemberDetails from "../screens/fintechApp/profile/referrals/memberDetails";
import MembersList from "../screens/fintechApp/profile/referrals/membersList";
import MemberAllTransactions from "../screens/fintechApp/profile/referrals/memberAllTransactions";
import AddContact from "../screens/fintechApp/profile/addressbook/crytoPayee/addContact";
import AllCardsList from "../screens/fintechApp/cards/myCards/myCardsList/AllCardsList";
import UpgradeFees from "../screens/fintechApp/profile/membership/upgradeFees";
import UpgradeMemberShip from "../screens/fintechApp/profile/membership/membershipUpgrade";
import MembershipUpgradePreview from "../screens/fintechApp/profile/membership/membershipUpgrade/privew";
import UpgradeMemberShipSuccess from "../screens/fintechApp/profile/membership/membershipUpgrade/success";
import CoinDetailsScreen from "../screens/commonScreens/coinDetails";
import ProfileDrawer from "../screens/fintechApp/profile/profileInfo/profileDrawer";
import { getThemedCommonStyles } from "../components/CommonStyles";
import { useThemeColors } from "../hooks/themedHook/useThemeColors";
import PhoneVerificationScreen from "../screens/fintechApp/onboarding/phoneVerification";
import Sumsub from "../screens/fintechApp/onboarding/sumsubVerification/sumsubVerification";
import RegistrationSuccess from "../screens/fintechApp/onboarding/registration/personalInformation/registrationSuccuss";
import PayInGrid from "../screens/fintechApp/payments/payin/payinTabs";
import InvoiceSummary from "../screens/fintechApp/payments/payin/cryptoPayin/View";
import StaticPaymentView from "../screens/fintechApp/payments/payin/cryptoPayin/View/staticPayinView";
import CreateStaticPayment from "../screens/fintechApp/payments/payin/cryptoPayin/static";
import InvoiceForm from "../screens/fintechApp/payments/payin/cryptoPayin/invoice/invoiceForm";
import InvoiceFormItemDetails from "../screens/fintechApp/payments/payin/cryptoPayin/invoice/invoiceIFormItemDetails";
import ItemDetails from "../screens/fintechApp/payments/payin/cryptoPayin/invoice/addItem";
// import Bank from "../screens/fintechApp/bank/deposit";
import FiatPayin from "../screens/fintechApp/payments/payin/fiatPayin";
import FiatPayinAdd from "../screens/fintechApp/payments/payin/fiatPayin/addFiatPayin";
import FiatPayinView from "../screens/fintechApp/payments/payin/fiatPayin/View";
import VaultList from "../screens/fintechApp/payments/payout/crypto/vaultLists";
import CryptoPayout from "../screens/fintechApp/payments/payout/crypto/cryptoPayout";
import CryptoSend from "../screens/fintechApp/payments/payout/crypto/send/send";
import PayoutSummeryDetails from "../screens/fintechApp/payments/payout/crypto/summary";
// import AddressListScreen from "../screens/fintechApp/bank/kyc/AddressListScreen";
import CryptoPortfolio from "../screens/fintechApp/wallets/common/CryptoPortfolio";
import AllAssetsTabs from "../screens/fintechApp/wallets/common/AllAssetsTabs";
import SelectVaults from '../screens/fintechApp/wallets/common/vaults/SelectVaults';
import VaultDetails from '../screens/fintechApp/wallets/common/vaults/VaultDetails'
// import BankKybDocumentsStep from "../screens/fintechApp/bank/kybInformation/BankKybDocumentsStep";
import AddShareHolderDetailsForm from "../screens/fintechApp/onboarding/kyb/shareHolders/addShareHoldersDetails";
import KycForm from "../screens/fintechApp/cards/apply_card/apply_card_kyc/kycForm";
import AppLockScreen from "../screens/commonScreens/appLock/appLock";
import SecurityDashboard from "../screens/fintechApp/profile/security";
import FiatPayinsList from "../screens/fintechApp/payments/payin/fiatPayin/View/fiatPayInLIst/fiatPayInList";
import RepresentiveDetailsForm from "../screens/fintechApp/onboarding/kyb/representive/addRepresentiveDetailsForm";
import FiatCoinLIst from "../screens/fintechApp/payments/payout/fiat/fiatCoinsLIst";
import Support from "../screens/fintechApp/profile/support";
import SupportAllCases from "../screens/fintechApp/profile/support/allcases";
import SupportCaseView from "../screens/fintechApp/profile/support/view";
import CaseViewDetails from "../screens/fintechApp/profile/support/caseViewDetails";
import FiatDeposit from "../screens/fintechApp/wallets/deposit/fiatDeposit";
import FiatWithdrawForm from "../screens/fintechApp/wallets/withdraw/fiatWithdraw";
import FiatWithdrawSummary from "../screens/fintechApp/wallets/withdraw/fiatWithdraw/summary";
import CryptoWithdrawSummary from "../screens/fintechApp/wallets/withdraw/cryptoWithdraw/orderSummary/CryptoWithdrawSummary";
import AssetSelector from "../screens/fintechApp/wallets/common/assetsSection/AssetSelector";
import SumsubSuccess from "../screens/fintechApp/onboarding/sumsubVerification/sumsubSuccess";
import RewaordsDashBoard from "../screens/fintechApp/profile/rewards";
import RewardsList from "../screens/fintechApp/profile/rewards/rewardsList/rewardsListTabs";
import RewardViewDetails from "../screens/fintechApp/profile/rewards/View/rewardsViewDetails";
import YourRewardsScreen from "../screens/fintechApp/profile/rewards/yourRewards";
import TransactionList from "../screens/fintechApp/transactions/transactionsList";
import RewardsTransactionList from "../screens/fintechApp/profile/rewards/rewardsTransactions";
import BindCard from "../screens/fintechApp/cards/myCards/bindCard";
import MfaScreen from "../screens/fintechApp/onboarding/mfa/mfaScreen";
import EnableProvider from "../screens/fintechApp/payments/payout/crypto/kycKybRequirements/enableprovider";
import KycKybRequirementsForm from "../screens/fintechApp/payments/payout/crypto/kycKybRequirements/kycKybRequirementsForm";
import KybView from "../screens/fintechApp/onboarding/kyb/view";
import PaymentPending from "../screens/fintechApp/payments/payout/crypto/kycKybRequirements/pendingScreen/pending";
import AppUpdate from "../components/appUpdateComponent/appUpdateComponent";
import PersonalKycForm from "../screens/fintechApp/payments/payout/crypto/kycKybRequirements/PayoutCryptoKycForm/personalKycForm";
import { CardDetailView, CardHistoryList, InviteMember, TeamCardsListView, TeamCardsView, TeamIndex, TeamList, TeamTransactionsListView } from "../screens/fintechApp/profile/teams";
import AllCoinsList from "../screens/fintechApp/wallets/common/walletsAllAssets/coinList";
import WalletsFiatPayinsList from "../screens/fintechApp/payments/payin/fiatPayin/View/fiatPayInLIst/walletsFiatPayinsList";
import WalletsAddFiatPayin from "../screens/fintechApp/payments/payin/fiatPayin/addFiatPayin/walletsAddFiatPayin";
import PaymentsAddFiatPayin from "../screens/fintechApp/payments/payin/fiatPayin/addFiatPayin/paymentsAddFiatPayin";
import PaymentsFiatPayinsList from "../screens/fintechApp/payments/payin/fiatPayin/View/fiatPayInLIst/paymentsFiatPayinsList";
import WalletsAssetsSelector from "../screens/fintechApp/wallets/common/assetsSection/walletsAssetsSelector";
import WalletsFiatCoinDetails from "../screens/fintechApp/wallets/common/selectFiatCoinDetails/walletsFiatCoindeatils";
import CoinDetails from "../screens/fintechApp/wallets/common/selectFiatCoinDetails/coinDetails";
import WalletsFiatPayoutWithdraw from "../screens/fintechApp/payments/payout/fiat/fiatPayoutWithdraw/walletsPayoutWithdraw";
import PaymentsFiatPayoutWithdraw from "../screens/fintechApp/payments/payout/fiat/fiatPayoutWithdraw/paymentsPayoutWithdraw";
import BrlPersonalKycForm from "../screens/fintechApp/wallets/deposit/fiatDeposit/brlDeposit";
import CoomonAssetsSelector from "../screens/fintechApp/wallets/common/assetsSection/commonAssetsSelector";
import BrlDepositView from "../screens/fintechApp/wallets/deposit/fiatDeposit/brlDeposit/brlDeposit";
import BuyExchange from "../screens/fintechApp/Exchange/buy/buyExchange";
import BuyExchangeSummary from "../screens/fintechApp/Exchange/buy/BuyExchangeSummary";
import SellExchange from "../screens/fintechApp/Exchange/sell/sellExchange";
import SellExchangeSummary from "../screens/fintechApp/Exchange/sell/SellExchangeSummary";
import CardsKybInfoPreview from "../screens/fintechApp/cards/apply_card/apply_card_kyb/kybField";
import BusinessLogin from "../screens/fintechApp/onboarding/accountStatus/businessAccount";
import SumsubRejected from "../screens/fintechApp/onboarding/sumsubVerification/sumsubRejected";
import SendReply from "../screens/fintechApp/profile/support/caseViewDetails/sendReply";
import BrlEnableProvider from "../screens/fintechApp/wallets/deposit/fiatDeposit/brlDeposit/brlEnablePermission";
import CloseAccount from "../screens/fintechApp/onboarding/accountStatus/closeAccount";
import { useTokenRefresh } from "../hooks/refreshTokenHook";
import { setGlobalNavigationRef } from "../utils/helpers";
import RelogIn from "../components/relogin/ReLogin";
import MemberTransactionViewDetails from "../screens/fintechApp/profile/referrals/memberTransactionDetails";
import SetLimits from "../screens/fintechApp/cards/myCards/actions/setLimits";
import CardSetPin from "../screens/fintechApp/cards/myCards/actions/cardSetPin";
import CardWithdraw from "../screens/fintechApp/cards/myCards/actions/cardWithdraw";
import AccessDenied from "../screens/fintechApp/onboarding/accountStatus/accessDenied";
import SplashScreen from "../screens/commonScreens/splashScreen";
import UboFormDetails from "../screens/commonScreens/addUboForm/ubosFormDetails";
import OnboardingStepOne from "../screens/commonScreens/splashScreen/addsStep1";
import OnboardingStepTwo from "../screens/commonScreens/splashScreen/addsStep2";
import ComingSoon from "../screens/commonScreens/commingSoon/comingSoon";
import { Logger } from '../utils/Logger';
import PersonalInfo from "../screens/fintechApp/profile/personalInformation/personalInformation";
import EditPersonalInfo from "../screens/fintechApp/profile/personalInformation";
import AllPersonalInfo from "../screens/fintechApp/profile/addresses/allAddresses";
import AddProfileAddress from "../screens/fintechApp/profile/addresses/addProfileAddress";
import Auth0Signin from "../screens/fintechApp/onboarding/signin/auth0Signin";
import ForgotPasswordScreen from "../screens/fintechApp/onboarding/forgotPassword";
import AddressViewDetails from "../screens/fintechApp/profile/addresses/addressView";
import NewProfile from "../screens/fintechApp/profile/profileInfo";
import PayoutTransactions from "../screens/fintechApp/payments/payout/payoutTransations";
import PayOutList from "../screens/fintechApp/payments/payout/payoutList";
import AddressbookFiatView from "../screens/fintechApp/profile/addressbook/fiatPayee/addressbookFiatView";
import CommonWithDrawSummary from "../screens/fintechApp/bank/withdraw/components/commonWithdrawummary";
import SendFiatAmount from "../screens/fintechApp/bank/withdraw/components/SendFiatAmount";
import AccountDetails from "../screens/fintechApp/profile/addressbook/fiatPayee/accountDetails/accountDetails";
import AddRecipient from "../screens/fintechApp/profile/addressbook/fiatPayee/addRecipient/addrecipient";
import CryptoList from "../screens/fintechApp/Exchange/common/cryptoList";
import CryptoDetails from "../screens/fintechApp/Exchange/dashboard/cryptoDetails/CryptoDetails";
import Bank from "../screens/fintechApp/bank/Deposit/components";
import Currencypop from "../screens/fintechApp/bank/Dashboard/Currencypop";
import BankAddPersonalInfo from "../screens/fintechApp/bank/AccountCreation/PersonalKyc/components/kyckybaddress";
import WalletsBankKybReview from "../screens/fintechApp/bank/AccountCreation/BusinessKyb/components/walletsKybReview";
import WalletsPaywithWalletTabs from "../screens/fintechApp/bank/AccountCreation/components/walletsPaywithWalletTabs";
import WalletsKycPreview from "../screens/fintechApp/bank/AccountCreation/PersonalKyc/components/walletsKycPreview";
import WalletsWithDrawSummary from "../screens/fintechApp/bank/withdraw/components/walletsWithdrawSummary";
import ReApplyPayoutKyb from "../screens/fintechApp/payments/payout/crypto/components/reApplyKycKyb";
import CardSetupStatus from "../screens/fintechApp/cards/apply_card/cardSetupStatus";
const AppContainer = () => {
  const Stack = createNativeStackNavigator();
  const appThemeSetting = useSelector((state: any) => state.userReducer?.appTheme);
  const [isReady, setIsReady] = useState(false);
  const dispatch = useDispatch();
  const navigationRef = createNavigationContainerRef();
  const routeNameRef = useRef<string | null>(null);
  const navigationcontainerref = useRef<any>(null)
  const isOnboardingSteps = useSelector((state: any) => state.userReducer?.isOnboardingSteps);
  const colorScheme = useColorScheme();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const [enableAuthenticator, setEnableAuthenticator] = useState<boolean>(false);
  const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
  const { scheduleTokenRefresh } = useTokenRefresh();
  const showBiometricPrompt = useSelector((state: any) => state.userReducer.showBiometricPrompt);
  useEffect(() => {
    if (userInfo && showBiometricPrompt) {
      setEnableAuthenticator(true);

    }
  }, [])
  useEffect(() => {
    if (userInfo) {
      scheduleTokenRefresh();
    }
  }, [userInfo])

  useEffect(() => {
    const handleUrl = (url: string | null) => {
      if (url) {
        const referralCode = extractReferralCodeFromUrl(url);
        if (referralCode) {
          dispatch(setReferralCode(referralCode));
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
    const subscription = Linking.addEventListener('url', onLinkOpen);
    return () => subscription.remove();
  }, [dispatch]);

  const extractReferralCodeFromUrl = (url: any) => {
    try {
      const urlObj = new URL(url);
      const referralCode = urlObj.searchParams.get('referralCode') || urlObj.searchParams.get('code');
      return referralCode;
    } catch (error) {
      return null;
    }
  };
  if (!isReady) {
    return null;
  }

  const getActiveRouteName = (state: NavigationState | undefined): string | null => {
    if (!state) return null;
    const route = state.routes[state.index];
    if (route.state) {

      return getActiveRouteName(route.state as NavigationState);
    }
    return route.name;
  };

  const handleNavigationReady = () => {
    const currentRouteName = getActiveRouteName(navigationRef.current?.getRootState());
    routeNameRef.current = currentRouteName;
    if (currentRouteName) {
      analytics().logScreenView({
        screen_name: currentRouteName,
        screen_class: currentRouteName,
      });
    }
  }

  const handleNavigationStateChange = async (state: NavigationState | undefined) => {
    const previousRouteName = routeNameRef.current;
    const currentRouteName = getActiveRouteName(state);
    if (previousRouteName !== currentRouteName && currentRouteName) {
      try {
        await analytics().logScreenView({
          screen_name: currentRouteName,
          screen_class: currentRouteName,
        });
        crashlytics().setAttribute('screen', currentRouteName);
      } catch (error) {
        Logger.error("Analytics: Failed to log screen_view", error);
      }
    }
    routeNameRef.current = currentRouteName;
  }
  let backgroundSource;
  // Determine if the dark theme should be used
  if (appThemeSetting !== 'system' && appThemeSetting !== undefined && appThemeSetting !== null) {
    backgroundSource = appThemeSetting === 'dark';
  } else {
    backgroundSource = colorScheme === 'dark';
  }
  const getAnimationForRoute = (route: any) => {
    const { animation } = route.params || {};
    switch (animation) {
      case 'slide_from_left':
        return { animation: 'slide_from_left' };
      case 'slide_from_right':
        return { animation: 'slide_from_right' };
      case 'slide_from_bottom':
        return { animation: 'slide_from_bottom' };
      case 'fade':
        return { animation: 'fade' };
      default:
        // Default animation
        return {};
    }
  };

  return (
    <Provider store={store}>
      <GestureHandlerRootView style={[{ flex: 1 }, commonStyles.headerspace, commonStyles.screenBg]}>

        <StatusBar
          barStyle={backgroundSource ? "light-content" : "dark-content"}
          translucent={true}
          backgroundColor={backgroundSource ? "#000" : "#fff"}
        />
        {enableAuthenticator && <AppLockScreen onUnlock={() => setEnableAuthenticator(false)} />}
        {!enableAuthenticator && <NavigationContainer ref={(ref) => {
          navigationcontainerref.current = ref;
          setGlobalNavigationRef(ref);
        }}
          onReady={handleNavigationReady} // Pass the function reference
          onStateChange={handleNavigationStateChange}  >
          <Stack.Navigator
            initialRouteName={isOnboardingSteps ? "SplaceScreenW2" : "SplaceScreen"}
            screenOptions={{
              headerShown: false,
              gestureEnabled: true,
              gestureDirection: 'horizontal',
              animation: 'slide_from_right',
              animationDuration: 300,
            }}
          >
            {/* Authentication */}
            <Stack.Screen name="SplaceScreen" component={SplashScreen} />
            <Stack.Screen name="AccountProgress" component={AccountProgress} />

            {/* OnBoarding */}
            <Stack.Screen name="SplaceScreenW2" component={LoginHome} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="VerifyEmail" component={VerifyEmail} />
            <Stack.Screen name="ChooseAccountType" component={ChooseAccountType} />
            <Stack.Screen name="CustomerRigister" component={CustomerRigister} />
            <Stack.Screen name="OnboardingStepOne" component={OnboardingStepOne} />
            <Stack.Screen name="OnboardingStepTwo" component={OnboardingStepTwo} />
            <Stack.Screen name="Auth0Signin" component={Auth0Signin} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="Auth0Signup" component={Auth0Signup} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
            <Stack.Screen name="EditPersonalInfo" component={EditPersonalInfo} />
            <Stack.Screen name="PhoneVerificationScreen" component={PhoneVerificationScreen} />
            <Stack.Screen name="RegistrationSuccess" component={RegistrationSuccess} />
            <Stack.Screen name="SumsubSuccess" component={SumsubSuccess} />
            <Stack.Screen name="MfaScreen" component={MfaScreen} />
            <Stack.Screen name="BusinessLogin" component={BusinessLogin} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="SumsubRejected" component={SumsubRejected} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="CloseAccount" component={CloseAccount} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="AccessDenied" component={AccessDenied} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />


            {/* kyc & kyb */}
            <Stack.Screen name="Sumsub" component={Sumsub} options={{ headerShown: false }} />
            <Stack.Screen name="KycProfile" component={KycProfile} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="KycProfileStep2" component={KycProfileStep2} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="KycProfilePreview" component={KycProfilePreview} options={{ headerShown: false }} />
            <Stack.Screen name="CompleteKyc" component={CompleteKyc} options={{ headerShown: false }} />
            <Stack.Screen name="KybCompanyData" component={KybCompanyData} options={{ headerShown: false }} />
            <Stack.Screen name="KybUboList" component={KybUboList} options={{ headerShown: false }} />
            <Stack.Screen name="KybAddUbosDetailsForm" component={KybAddUbosDetailsForm} options={{ headerShown: false }} />
            <Stack.Screen name="KybDirectorDetailsList" component={KybDirectorDetailsList} options={{ headerShown: false }} />
            <Stack.Screen name="KybAddDirectorsDetailsForm" component={KybAddDirectorsDetailsForm} options={{ headerShown: false }} />
            <Stack.Screen name="KybInfoPreview" component={KybInfoPreview} options={{ headerShown: false }} />
            <Stack.Screen name="AddPersonalInfo" component={AddPersonalInfo} options={{ headerShown: false }} />
            <Stack.Screen name="AddShareHolderDetailsForm" component={AddShareHolderDetailsForm} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="KycForm" component={KycForm} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="addProfileAddress" component={AddProfileAddress} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="RepresentiveDetailsForm" component={RepresentiveDetailsForm} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="KybView" component={KybView} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />

            {/* Common Screens */}
            <Stack.Screen name="SomethingWentWrong" component={SomethingWentWrong} options={{ headerShown: false }} />
            <Stack.Screen name="ComingSoon" component={ComingSoon} options={{ headerShown: false }} />
            <Stack.Screen name="RelogIn" component={RelogIn} options={{ headerShown: false }} />

            {/* Tabs */}
            <Stack.Screen name="Dashboard" component={DynamicTabs} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="Hub" component={DynamicTabs} />
            {/* Profile */}
            <Stack.Screen name="Settings" component={Settings} options={{ headerShown: false }} />
            <Stack.Screen name="NewProfile" component={NewProfile} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route) })} />
            <Stack.Screen name="PersonalInfo" component={PersonalInfo} options={{ headerShown: false }} />
            <Stack.Screen name="HelpCenter" component={HelpCenter} options={{ headerShown: false }} />
            <Stack.Screen name="AllCardsList" component={AllCardsList} />
            <Stack.Screen name="UpgradeFees" component={UpgradeFees} options={{ headerShown: false }} />
            <Stack.Screen name="UpgradeMemberShip" component={UpgradeMemberShip} options={{ headerShown: false }} />
            <Stack.Screen name="MembershipUpgradePreview" component={MembershipUpgradePreview} options={{ headerShown: false }} />
            <Stack.Screen name="UpgradeMemberShipSuccess" component={UpgradeMemberShipSuccess} options={{ headerShown: false }} />

            <Stack.Screen
              name="ProfileDrawer"
              component={ProfileDrawer}
              options={{
                headerShown: false,
                presentation: 'transparentModal',
                animation: 'none',
              }} />

            {/* Transactions */}
            <Stack.Screen name="CardsTransactions" component={TransactionList} options={{ headerShown: false }} />
            <Stack.Screen name="TransactionDetails" component={TransactionDetails} />

            {/* profile drawer */}
            <Stack.Screen name="Security" component={Security} options={{ headerShown: false }} />
            <Stack.Screen name="Addressbook" component={Addressbook} options={{ headerShown: false }} />
            <Stack.Screen name="AddressbookCrypto" component={AddressbookCrypto} options={{ headerShown: false }} />
            <Stack.Screen name="AddressViewDetails" component={AddressViewDetails} options={{ headerShown: false }} />
            <Stack.Screen name="AddressbookCryptoList" component={AddressbookCryptoList} options={{ headerShown: false }} />
            <Stack.Screen name="AddressbookCryptoView" component={AddressbookCryptoView} options={{ headerShown: false }} />
            <Stack.Screen name="AllPersonalInfo" component={AllPersonalInfo} options={{ headerShown: false }} />
            <Stack.Screen name="Notifications" component={Notifications} options={{ headerShown: false }} />
            <Stack.Screen name="AddContact" component={AddContact} options={{ headerShown: false }} />
            <Stack.Screen name="AddressbookFiatView" component={AddressbookFiatView} options={{ headerShown: false }} />
            <Stack.Screen name="AddRecipient" component={AddRecipient} options={{ headerShown: false }} />
            <Stack.Screen name="AccountDetails" component={AccountDetails} options={{ headerShown: false }} />
            <Stack.Screen name="SecurityDashboard" component={SecurityDashboard} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            {/* Support */}
            <Stack.Screen name="Support" component={Support} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="SupportAllCases" component={SupportAllCases} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="SupportCaseView" component={SupportCaseView} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="CaseViewDetails" component={CaseViewDetails} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="SendReply" component={SendReply} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />


            {/* Rewards */}
            <Stack.Screen name="RewaordsDashBoard" component={RewaordsDashBoard} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="RewardsList" component={RewardsList} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="RewardViewDetails" component={RewardViewDetails} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="YourRewardsScreen" component={YourRewardsScreen} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="RewardsTransactionList" component={RewardsTransactionList} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />


            {/* Members */}
            <Stack.Screen name="MembersDashBoard" component={MembersDashBoard} options={{ headerShown: false }} />
            <Stack.Screen name="MembersList" component={MembersList} options={{ headerShown: false }} />
            <Stack.Screen name="MemberDetails" component={MemberDetails} options={{ headerShown: false }} />
            <Stack.Screen name="MemberAllTransactions" component={MemberAllTransactions} options={{ headerShown: false }} />
            <Stack.Screen name="MemberTransactionViewDetails" component={MemberTransactionViewDetails} options={{ headerShown: false }} />
            {/* wallets */}
            <Stack.Screen name="CoinDetails" component={CoinDetailsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="WalletsAllCoinsList" component={AllCoinsList} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="WalletsFiatPayinsList" component={WalletsFiatPayinsList} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="PaymentsAddFiatPayin" component={PaymentsAddFiatPayin} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="WalletsAddFiatPayin" component={WalletsAddFiatPayin} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="WalletsAssetsSelector" component={WalletsAssetsSelector} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="WalletsFiatCoinDetails" component={WalletsFiatCoinDetails} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />


            {/* Deposit */}
            <Stack.Screen name="CryptoDeposit" component={CryptoDeposit} options={{ headerShown: false }} />

            {/* Withdraw */}
            <Stack.Screen name="CrptoWithdraw" component={CrptoWithdraw} options={{ headerShown: false }} />
            {/* {Banks} */}
            <Stack.Screen name="createAccountForm" component={BankCreationForm} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route) })} />
            <Stack.Screen name="payWithWalletTabs" component={BankPaywithWalletTabs} options={{ headerShown: false }} />
            <Stack.Screen name="payWithFiatPreview" component={PayWithFiatPreview} options={{ headerShown: false }} />
            <Stack.Screen name="payWithCryptoWalletSummery" component={PayWithCryptoWalletSummery} options={{ headerShown: false }} />
            <Stack.Screen name="AllAccounts" component={AllAccounts} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="SendAmount" component={SendFiatAmount} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="Bank" component={Bank} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="Currencypop" component={Currencypop} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="SummeryDetails" component={CommonWithDrawSummary} options={{ headerShown: false }} />
            <Stack.Screen name="Accounts" component={Accounts} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="CardSetupStatus" component={CardSetupStatus} />
            {/* apply cards  */}
            <Stack.Screen name="ApplyCard" component={ApplyCard} />
            <Stack.Screen name="AllCards" component={AllCards} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="SumsubNavigation" component={SumsubNavigation} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="ApplySuccess" component={ApplySuccess} />
            <Stack.Screen name="CardsInfo" component={CardsInfo} />
            <Stack.Screen name="bindCard" component={BindCard} />
            <Stack.Screen name="setLimits" component={SetLimits} />
            <Stack.Screen name="cardSetPin" component={CardSetPin} />
            <Stack.Screen name="cardWithdraw" component={CardWithdraw} />
            <Stack.Screen name="CardsKybInfoPreview" component={CardsKybInfoPreview} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="uboFormDetails" component={UboFormDetails} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />


            {/* Payments */}
            <Stack.Screen name="PayInGrid" component={PayInGrid} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="InvoiceSummary" component={InvoiceSummary} />
            <Stack.Screen name="StaticPaymentView" component={StaticPaymentView} />
            <Stack.Screen name="CreateStaticPayment" component={CreateStaticPayment} />
            <Stack.Screen name="InvoiceForm" component={InvoiceForm} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="InvoiceFormItemDetails" component={InvoiceFormItemDetails} />
            <Stack.Screen name="ItemDetails" component={ItemDetails} />
            <Stack.Screen name="FiatPayin" component={FiatPayin} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="FiatPayinView" component={FiatPayinView} />
            <Stack.Screen name="FiatPayinAdd" component={FiatPayinAdd} />
            <Stack.Screen name="PayOutList" component={PayOutList} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="CryptoPayout" component={CryptoPayout} options={{ headerShown: false }} />
            <Stack.Screen name="VaultList" component={VaultList} options={{ headerShown: false }} />
            <Stack.Screen name="CryptoSend" component={CryptoSend} options={{ headerShown: false }} />
            <Stack.Screen name="PayoutSummary" component={PayoutSummeryDetails} options={{ headerShown: false }} />
            <Stack.Screen name="FiatPayout" component={PaymentsFiatPayoutWithdraw} options={{ headerShown: false }} />
            <Stack.Screen name="FiatPayinsList" component={PaymentsFiatPayinsList} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="PayoutTransactions" component={PayoutTransactions} options={{ headerShown: false }} />
            <Stack.Screen name="FiatCoinLIst" component={FiatCoinLIst} options={{ headerShown: false }} />
            <Stack.Screen name="PaymentPending" component={PaymentPending} options={{ headerShown: false }} />
            <Stack.Screen name="PaymentsFiatPayinsList" component={PaymentsFiatPayinsList} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />

            {/* payout Provider Screens */}
            <Stack.Screen name="EnableProvider" component={EnableProvider} options={{ headerShown: false }} />
            <Stack.Screen name="KycKybRequirementsForm" component={KycKybRequirementsForm} options={{ headerShown: false }} />
            <Stack.Screen name="PersonalKycForm" component={PersonalKycForm} options={{ headerShown: false }} />
            <Stack.Screen name="ReApplyPayoutKyb" component={ReApplyPayoutKyb} options={{ headerShown: false }} />




            {/* BankKyc */}
            <Stack.Screen name="BankKYCScreen" component={BankKYCScreen} options={{ headerShown: false }} />
            <Stack.Screen name="BankKycProfileStep2" component={BankKycProfileStep2} options={{ headerShown: false }} />
            <Stack.Screen name="BankKycProfilePreview" component={BankKycPreview} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="BankAddPersonalInfo" component={BankAddPersonalInfo} options={{ headerShown: false }} />
            <Stack.Screen name="AddressListScreen" component={AddressListScreen} options={{ headerShown: false }} />
            <Stack.Screen name="CreateAccountInformation" component={CreateAccountInformation} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />


            {/* BankKyb */}
            <Stack.Screen name="BankKybInfoPreview" component={BankKybReview} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="BankKybAddUbosDetailsForm" component={BankKybAddUbosDetailsForm} options={{ headerShown: false }} />
            <Stack.Screen name="BankKybDocumentsStep" component={BankKybDocumentsStep} options={{ headerShown: false }} />


            {/* <Stack.Screen name="CompleteKyc" component={CompleteKyc} options={{ headerShown: false }} /> */}
            {/* <Stack.Screen name="KybCompanyData" component={KybCompanyData} options={{ headerShown: false }} /> */}
            {/* <Stack.Screen name="KybUboList" component={KybUboList} options={{ headerShown: false }} /> */}
            {/* <Stack.Screen name="KybAddUbosDetailsForm" component={KybAddUbosDetailsForm} options={{ headerShown: false }} /> */}
            {/* <Stack.Screen name="KybDirectorDetailsList" component={KybDirectorDetailsList} options={{ headerShown: false }} /> */}
            {/* <Stack.Screen name="KybAddDirectorsDetailsForm" component={KybAddDirectorsDetailsForm} options={{ headerShown: false }} /> */}
            {/* <Stack.Screen name="KybInfoPreview" component={KybInfoPreview} options={{ headerShown: false }} /> */}
            {/* <Stack.Screen name="AddPersonalInfo" component={AddPersonalInfo} options={{ headerShown: false }} /> */}
            {/* {WalletsFiat} */}
            <Stack.Screen name="CryptoPortfolio" component={CryptoPortfolio} options={{ headerShown: false }} />
            <Stack.Screen name="AllAssetsTabs" component={AllAssetsTabs} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="FiatCoinDetails" component={CoinDetails} options={{ headerShown: false }} />
            <Stack.Screen name="SelectVaults" component={SelectVaults} options={{ headerShown: false }} />
            <Stack.Screen name="FiatDeposit" component={FiatDeposit} options={{ headerShown: false }} />
            <Stack.Screen name="FiatWithdrawForm" component={FiatWithdrawForm} options={{ headerShown: false }} />
            <Stack.Screen name="FiatWithdrawSummary" component={FiatWithdrawSummary} options={{ headerShown: false }} />
            <Stack.Screen name="CryptoWithdrawSummary" component={CryptoWithdrawSummary} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="AssetSelector" component={CoomonAssetsSelector} options={{ headerShown: false }} />
            <Stack.Screen name="WalletsFiatPayoutWithdraw" component={WalletsFiatPayoutWithdraw} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="WalletsBankCreation" component={WalletsBankCreation} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="WalletsBankKybReview" component={WalletsBankKybReview} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="WalletsPaywithWalletTabs" component={WalletsPaywithWalletTabs} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="WalletsKycPreview" component={WalletsKycPreview} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="WalletsWithDrawSummary" component={WalletsWithDrawSummary} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="BrlPersonalKycForm" component={BrlPersonalKycForm} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="BrlDepositView" component={BrlDepositView} options={{ headerShown: false }} />
            <Stack.Screen name="BrlEnableProvider" component={BrlEnableProvider} options={{ headerShown: false }} />


            <Stack.Screen name="VaultDetails" component={VaultDetails} options={{ headerShown: false }} />
            {/* {Teams} */}
            <Stack.Screen name="Teams" component={TeamIndex} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="InviteMember" component={InviteMember} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="TeamCardsView" component={TeamCardsView} options={{ headerShown: false }} />
            <Stack.Screen name="TeamTransactionsListView" component={TeamTransactionsListView} options={{ headerShown: false }} />
            <Stack.Screen name="CardDetailView" component={CardDetailView} options={{ headerShown: false }} />
            <Stack.Screen name="CardHistoryList" component={CardHistoryList} options={{ headerShown: false }} />
            <Stack.Screen name="TeamCardsListView" component={TeamCardsListView} options={{ headerShown: false }} />
            <Stack.Screen name="TeamList" component={TeamList} options={{ headerShown: false }} />
            <Stack.Screen name="AppUpdate" component={AppUpdate} options={{ headerShown: false }} />
            {/* Exchange */}
            <Stack.Screen name="ExchangeCryptoList" component={CryptoList} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="CryptoExchange" component={BuyExchange} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="BuyExchangeSummary" component={BuyExchangeSummary} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="CryptoSellExchange" component={SellExchange} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="SellExchangeSummary" component={SellExchangeSummary} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
            <Stack.Screen name="ExchangeCryptoDetails" component={CryptoDetails} options={({ route }) => ({ headerShown: false, ...getAnimationForRoute(route), })} />
          </Stack.Navigator>
        </NavigationContainer>}

      </GestureHandlerRootView>
      {/* </PersistGate> */}
    </Provider>
  );
};

export default AppContainer;