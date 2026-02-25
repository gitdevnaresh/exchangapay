import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, RefreshControl, Share } from "react-native";
import "moment-timezone";
import { useNavigation, useFocusEffect, NavigationProp, ParamListBase } from "@react-navigation/native";
import { isErrorDispaly } from "../../../utils/helpers";
import TransactionService from "../../../apiServices/common/transaction";
import { CoinImages, getThemedCommonStyles, statusColor, } from "../../../components/CommonStyles";
import RecentTransactions from "../../commonScreens/transactions/recentTransactions";
import SafeAreaViewComponent from "../../../components/safeArea/safeArea";
import ViewComponent from "../../../components/view/view";
import ErrorComponent from "../../../components/errorDisplay/errorDisplay";
import { useDispatch, useSelector } from "react-redux";
import CardsModuleService from "../../../apiServices/cards";
import KycVerifyPopup from "../../commonScreens/kycVerify";
import { DayLookupItem, HOME_CONST, HOME_CONSTS, NAVIGATIONS_CONST } from "./constant";
import { useThemeColors } from "../../../hooks/themedHook/useThemeColors";
import DashboardLoader from "../../../components/loader";
import ScrollViewComponent from "../../../components/scrollView/scrollView";
import { ScrollView } from "react-native-gesture-handler";
import BalanceCarousel from "./components/BalanceCarousel";
import QuickActionButtons from "./components/QuickActionButtons";
import UserCardsSection from "./components/UserCardsSection";
import SpendingChartSection from "./components/SpendingChartSection";
import AssetsSection from "./components/AssetsSection";
import KycVerificationBanner from "./components/KycVerificationBanner";
import { homeServices } from "../../../apiServices/homeDashboard";
import KpiComponent from "../../../components/kpiComponent/kpiComponent";
import { BankAccount } from "../bank/interface";
import CreateAccountService from "../../../apiServices/bank/createAccount";
import FlatListComponent from "../../../components/flatList/flatList";
import CommonTouchableOpacity from "../../../components/touchableComponents/touchableOpacity";
import { s } from "../../../constants/styels/scale";
import ParagraphComponent from "../../../components/textComponets/paragraphText/paragraph";
import { CurrencyText } from "../../../components/textComponets/currencyText/currencyText";
import ImageUri from "../../../components/imageComponents/image";
import TextMultiLanguage from "../../../components/textComponets/multiLanguageText/textMultiLangauge";
import { setAccountInfo, setAllBalanceInfo, setHomeDashboardCards, setHomeWallets, setNavigationSource, setWalletActionFilter } from "../../../redux/actions/actions";
import PaymentService from "../../../apiServices/payments";
import { BankImage } from "../../../assets/svg";
import AntDesign from '@expo/vector-icons/AntDesign';
import useEncryptDecrypt from "../../../hooks/encDecHook";
import AlertsCarousel from "./components/allertCases";
import { ApiCallsCompletedState, Asset, HomeProps, VerificationField, Configuration, GraphConfiguration, CommonConfiguration, Balance, ApiResponse, TransactionData, VaultsList, VaultCoinsList, PaymentKpiItem, RootState, MenuItem } from "./interface";
import { logEvent } from "../../../hooks/loggingHook";
import { useLngTranslation } from "../../../hooks/languagesHook/useLngTranslation";
import { showAppToast } from "../../../components/toasterMessages/ShowMessage";
import Container from "../../../components/container/container";
import { BANK_CONST } from "../bank/constants";
import Loadding from "../../../components/skelton/skeltons";
import useMemberLogin from "../../../hooks/userInfoHook";
import { useScreenPerfLogger } from "../../../hooks/performance/performanceHook";
import { transactionCard } from "../../../skeletons/skeltonViews";
import { getVerificationData } from "../../../apiServices/common/countryService";
import EnableProtectionModel from "../../commonScreens/protection";
import AccountRow from "./components/bankAcounts";
import InviteFriend from "./components/inviteFriend";
import { getAllEnvData } from "../../../../Environment";
import { KpiItem } from "../profile/teams";
import WalletsService from "../../../apiServices/wallets";
import { ProfilePrimaryServices } from "../../../apiServices/profile/primary";
import { accountDasboardBalance } from "../../../skeletons/skeleton_views";
import { getTabsConfigation, walletsTabsNavigation } from '../../../../configuration';

const Home = React.memo((props: HomeProps) => {
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [errormsg, setErrormsg] = useState("");
  const [activeYear, setActiveYear] = useState('7');
  const [refresh, setRefresh] = useState<boolean>(false)
  const [recentTranscationReload, setRecentTranscationReload] = useState(false)
  const [recentTransactionsData, setRecentTransactionsData] = useState<TransactionData[]>([])
  const scrollViewRef = useRef<ScrollView>(null);
  const userInfo = useSelector((state: RootState) => state.userReducer?.userDetails);
  const Configuration = getTabsConfigation("HOME") as Configuration;
  const GraphConfiguration = getTabsConfigation('ADDS_AND_GRAPG_CONFIGURATION') as GraphConfiguration;
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  const myCradsState = useSelector((state: RootState) => state.userReducer?.homeDashboardCards);
  const [kycModelVisible, setKycModelVisible] = useState(false)
  const [defaultVault, setDefaultVault] = useState<Record<string, unknown>>({});
  const [errormsgLink, setErrormsgLink] = useState("");
  const currency: Record<string, string> | undefined = getTabsConfigation('CURRENCY');
  const NEW_COLOR = useMemo(() => useThemeColors(), []);
  const allBalanceInfo = useSelector((state: RootState) => state.userReducer.allBalanceInfo);
  const transactionCardContent = transactionCard(5);
  const [fiatAmount, setFiatAmount] = useState<number>(0);
  const [cryptoAmount, setCryptoAmount] = useState<number>(0);
  const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);
  const [vaultsLists, setVaultsLists] = useState<VaultsList>({ vaultsList: [], vaultsPrevList: [] });
  const [vaultCoinsLists, setVaultsCoinsList] = useState<VaultCoinsList>({ coinsList: [], coinsPrevList: [] });
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const dispatch = useDispatch();
  const [paymentsKpiData, setPaymentsKpiData] = useState<PaymentKpiItem[] | null>(null);
  const assets = useSelector((state: RootState) => state.userReducer.homeWallets);
  const { decryptAES } = useEncryptDecrypt();
  const [apiCallsCompleted, setApiCallsCompleted] = useState<ApiCallsCompletedState>({ balance: false, cards: false, verification: false, assets: false, accounts: false, transactions: false });
  const [spendingChartData, setSpendingChartData] = useState<unknown>(null);
  const [spendingChartLoading, setSpendingChartLoading] = useState(false);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [initialChartLoaded, setInitialChartLoaded] = useState(false);
  const [graphData7Days, setGraphData7Days] = useState<unknown>(null);
  const [graphData30Days, setGraphData30Days] = useState<unknown>(null);
  const { getMemDetails } = useMemberLogin();
  const { t } = useLngTranslation();
  const menuItemsFromStore = useSelector((state: RootState) => state.userReducer?.menuItems);
  const tabs = menuItemsFromStore?.filter((tab: MenuItem) => tab?.isEnabled);
  const showCardsSection = tabs?.some((tab: MenuItem) => tab?.featureName?.toLowerCase() === HOME_CONST.CARDS);
  const showBankSection = tabs?.some((tab: MenuItem) => tab?.featureName?.toLowerCase() === HOME_CONST.BANK);
  const showPaymentsSection = tabs?.some((tab: MenuItem) => tab?.featureName?.toLowerCase() === HOME_CONST.PAYMENTS);
  const showWalletsSection = tabs?.some((tab: MenuItem) => tab?.featureName?.toLowerCase() === HOME_CONST.WALLETS);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isInitializing = useRef(false);
  const hasLoadedOnce = useRef(false);
  const [quikLinksLoader, setQuikLinksLoader] = useState<boolean>(false);
  const { stopTrace } = useScreenPerfLogger("Home_dashboard")
  const [enableProtectionModel, setEnableProtectionModel] = useState<boolean>(false)
  const commonConfiguartion = getTabsConfigation("COMMON_CONFIGURATION") as CommonConfiguration;
  const commonComponentConfig = getTabsConfigation('COMMON_CONFIGURATION') as CommonConfiguration;
  const { oAuthConfig } = getAllEnvData();
  const baseUrl = oAuthConfig?.sumsubWebUrl
  const [referralCode, setReferralCode] = useState<KpiItem[]>([]);
  const bankImageSize = Configuration.BANK_BANNER_SECTION_TITTLE ? s(100) : s(74);

  const hasDashboardData = useCallback(() => {
    const hasBalance = allBalanceInfo !== null && allBalanceInfo !== undefined && allBalanceInfo !== 0;
    const hasAssets = Array.isArray(assets) && assets.length > 0;
    const hasReduxData = hasBalance || hasAssets;
    return hasReduxData;
  }, [allBalanceInfo, assets]);

  const fetchInitialData = useCallback(async () => {
    setErrormsg("");
    setErrormsgLink("");
    getReferralKpis()
    setApiCallsCompleted({
      balance: false,
      cards: false,
      verification: false,
      assets: false,
      accounts: false,
      transactions: false
    });

    const promises = [
      // getShownAssets(),
      // getuserAccountsBalances(),
      getRecentTransactions()
    ];
    if (showWalletsSection == true) {
      promises.push(getShownAssets());
      promises.push(getuserAccountsBalances());
    }
    if (showCardsSection) {
      promises.push(getMyCards());
    }

    if (showPaymentsSection) {
      promises.push(paymentsKpis());
    }

    if (showBankSection) {
      promises.push(getAccounts());
    }
    await Promise.all(promises);
  }, []);
  const getReferralKpis = async () => {
    try {
      const response = await ProfilePrimaryServices.getReferralKPis();
      if (response.ok) {
        let ReferalCode: KpiItem[];
        const responseData = response.data as KpiItem[];
        ReferalCode = responseData.filter((item: KpiItem) => item.name == "Referral Code");
        setReferralCode(ReferalCode);

      }
      else {
      }
    }
    catch (error) {
    }
  };
  useEffect(() => {
    getReferralKpis()
  }, [])
  useFocusEffect(
    useCallback(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: true });
      }
      if (isInitializing.current) return;
      isInitializing.current = true;

      const shouldShowLoader = GraphConfiguration?.DASHBOARD_LOADER;
      const hasRedux = hasDashboardData();

      if (!hasLoadedOnce.current) {
        if (shouldShowLoader) {
          setDashboardLoading(true);
        } else {
          setDashboardLoading(!hasRedux);
        }
        hasLoadedOnce.current = true;
      }

      setActiveYear('7');
      setInitialChartLoaded(false);
      setErrormsg("");
      setErrormsgLink("");
      setKycModelVisible(false);
      setGraphData7Days(null);
      setGraphData30Days(null);

      fetchInitialData().catch((error) => {
        setErrormsg(isErrorDispaly(error));
      }).finally(() => {
        isInitializing.current = false;
        if (!hasLoadedOnce.current || !hasRedux) {
          setDashboardLoading(false);
        }
      });

      getSpendingChartData('7');

      stopTrace();
      return () => { };
    }, [])
  );

  // Load chart data when activeYear changes (but not on initial load)
  useEffect(() => {
    // This effect runs when `activeYear` changes, but not on the initial mount
    // because of the `initialChartLoaded` guard.
    if (initialChartLoaded) {
      getSpendingChartData(activeYear);
    }
  }, [activeYear]);
  useEffect(() => {
    if (isRefreshing || isInitializing.current) return;

    const shouldShowLoader = GraphConfiguration?.DASHBOARD_LOADER;
    const hasReduxData = hasDashboardData();
    const criticalAPIsCompleted = apiCallsCompleted.verification && apiCallsCompleted.assets && apiCallsCompleted.balance;

    if (shouldShowLoader) {
      if (criticalAPIsCompleted && dashboardLoading) {
        setDashboardLoading(false);
      }
    } else {
      if (hasReduxData && dashboardLoading) {
        setDashboardLoading(false);
      }
    }
  }, [apiCallsCompleted, allBalanceInfo, assets, isRefreshing]);


  const onRefresh = useCallback(() => {
    setRefresh(true);
    setDashboardLoading(true);
    setIsRefreshing(true);

    // Clear cached data on refresh
    setGraphData7Days(null);
    setGraphData30Days(null);

    Promise.all([
      getMemDetails(true),
      fetchInitialData(),
      getSpendingChartData(activeYear)
    ]).finally(() => {
      setRefresh(false);
      setDashboardLoading(false);
      setIsRefreshing(false);
    });
  }, [activeYear, fetchInitialData]);
  const getuserAccountsBalances = async () => {
    try {
      const response = await homeServices.getTotalBalance() as ApiResponse<Balance[]>;
      if (response?.ok) {
        const balances = response?.data || [];
        const cryptoBalance = balances.find((b: Balance) => b?.name?.toLowerCase()?.replace(/\s/g, "") === "cryptobalance")?.value || 0;
        const fiatBalance = balances.find((b: Balance) => b?.name?.toLowerCase()?.replace(/\s/g, "") === "fiatbalance")?.value || 0;
        setCryptoAmount(cryptoBalance);
        setFiatAmount(fiatBalance);
        dispatch(setAllBalanceInfo(cryptoBalance + fiatBalance));
      } else {
        showAppToast(isErrorDispaly(response), "error");
      }
    } catch (error) {
      showAppToast(isErrorDispaly(error), "error");
    } finally {
      setApiCallsCompleted((prev) => ({ ...prev, balance: true }));
    }
  };

  const getMyCards = async () => {
    setErrormsg('');
    const pageSize = 10;
    const pageNo = 1
    try {
      const response: ApiResponse = await CardsModuleService.getCards(pageSize, pageNo);
      if (response?.ok) {
        dispatch(setHomeDashboardCards({ myCards: response?.data }));
      } else {
        dispatch(setHomeDashboardCards({ myCards: [] }));
      }
    }
    catch (error) {
      setErrormsg(isErrorDispaly(error));
      dispatch(setHomeDashboardCards({ myCards: [] }));
    }
    finally {
      setApiCallsCompleted(prev => ({ ...prev, cards: true }));
    }
  };
  const handleChangeSearch = useCallback((val: string) => {
    let value = val.trim();
    if (value) {
      let filterData = vaultCoinsLists?.coinsPrevList?.filter((item: Asset) => {
        return (
          item.code?.toLowerCase().includes(value.toLowerCase())
        );
      });
      setVaultsCoinsList((prev: VaultCoinsList) => ({ ...prev, coinsList: filterData }))
    }
    else {
      setVaultsCoinsList((prev: VaultCoinsList) => ({ ...prev, coinsList: vaultCoinsLists?.coinsPrevList }))
    }
  }, [vaultCoinsLists?.coinsPrevList]);

  const getShownAssets = async () => {
    try {
      const response = await WalletsService.getShowVaults() as ApiResponse<{ wallets: Vault[] }>;
      if (response?.ok) {
        const data = response?.data;
        const wallets = data?.wallets || [];
        setDefaultVault(wallets[0]);
        dispatch(setHomeWallets(wallets[0]?.assets));
        setVaultsLists((prev: VaultsList) => ({ ...prev, vaultsList: wallets, vaultsPrevList: wallets }))
        setVaultsCoinsList((prev: VaultCoinsList) => ({ ...prev, coinsList: wallets[0]?.assets, coinsPrevList: wallets[0]?.assets }))
      } else {
        showAppToast(isErrorDispaly(response), 'error');
      }
    } catch (error) {
      showAppToast(isErrorDispaly(error), 'error');
    } finally {
      setApiCallsCompleted(prev => ({ ...prev, assets: true }));
    }
  };
  const getSpendingChartData = async (days: number | string) => {
    // Check if data exists in cache first
    if (days === '7' && graphData7Days) {
      setSpendingChartData(graphData7Days);
      return;
    }
    if (days === '30' && graphData30Days) {
      setSpendingChartData(graphData30Days);
      return;
    }

    setSpendingChartLoading(true);
    try {
      const response = await WalletsService.getWalletsSpendingChartDashboard(days) as ApiResponse<{ transactionsModels: unknown }>;
      if (response?.ok) {
        const chartData = response?.data?.transactionsModels;
        setSpendingChartData(chartData);

        // Cache the data
        if (days === '7') {
          setGraphData7Days(chartData);
        } else if (days === '30') {
          setGraphData30Days(chartData);
        }
      } else {
        setSpendingChartData(null);
        showAppToast(isErrorDispaly(response), 'error');
      }
    } catch (error) {
      setSpendingChartData(null);
      showAppToast(isErrorDispaly(error), 'error');
    } finally {
      if (!initialChartLoaded) setInitialChartLoaded(true);
      setSpendingChartLoading(false);
    }
  };

  const handleYears = (item: DayLookupItem) => {
    const newYear = item?.name;
    setActiveYear(newYear);

    // Use cached data if available, otherwise call API
    if (newYear === '7' && graphData7Days) {
      setSpendingChartData(graphData7Days);
    } else if (newYear === '30' && graphData30Days) {
      setSpendingChartData(graphData30Days);
    } else {
      getSpendingChartData(newYear);
    }
  };

  const errorMSgHandle = () => {
    setErrormsg("");
  }
  const handleRecentTranscationReloadDetails = useCallback((reload: boolean, error?: string | null) => {
    setRecentTranscationReload(reload)
    if (error) {
      setErrormsg('');
    }
  }, []);
  const handleSellNavigateDeposit = () => {
    if ((commonConfiguartion?.IS_SKIP_KYC_VERIFICATION_STEP !== true) && (userInfo?.kycStatus !== "Approved" && (userInfo?.metadata?.IsInitialKycRequired == false && userInfo?.metadata?.IsInitialVaultRequired == true))) {
      setKycModelVisible(true);
    } else {
      dispatch(setWalletActionFilter('deposit'));
      dispatch(setNavigationSource("Dashboard"));
      logEvent("Button Pressed", { action: "Deposit Button", nextScreen: "Wallets Deposit", currentScreen: "Dashboard" })
      navigation?.navigate(walletsTabsNavigation, { screenType: 'Deposit', initialTab: 0 });
    }
  }
  const handleWithdrawPress = async () => {
    logEvent("Button Pressed", { action: "Withdraw Button", nextScreen: "Wallets Withdraw", currentScreen: "Dashboard" })
    setErrormsg('');
    setErrormsgLink('');
    if ((commonConfiguartion?.IS_SKIP_KYC_VERIFICATION_STEP !== true) && (userInfo?.kycStatus !== "Approved" && (userInfo?.metadata?.IsInitialKycRequired == false && userInfo?.metadata?.IsInitialVaultRequired == true))) {
      setKycModelVisible(true);
    } else {
      setQuikLinksLoader(true);
      const securityVerififcationData: ApiResponse<VerificationField> = await getVerificationData();
      if (securityVerififcationData?.ok) {
        setQuikLinksLoader(false);
        if ((securityVerififcationData?.data?.isEmailVerification === true || securityVerififcationData?.data?.isPhoneVerified === true)) {
          dispatch(setWalletActionFilter('withdraw'));
          dispatch(setNavigationSource("Dashboard"));
          navigation?.navigate(walletsTabsNavigation, { screenType: 'Withdraw', screenName: "Dashboard", originalSource: "Dashboard", initialTab: 0 });
        } else {
          setEnableProtectionModel(true);
        }
      } else {
        setQuikLinksLoader(false);
        setEnableProtectionModel(true);
      }
    }

  }
  const closekycModel = () => {
    setKycModelVisible(false)
  }
  const closeEnableProtectionModel = () => {
    setEnableProtectionModel(false)
  }
  const handleRedirectToKyc = () => {
    if (userInfo?.kycStatus !== "Approved") {
      setKycModelVisible(!kycModelVisible)
      return;
    }
    setKycModelVisible(!kycModelVisible)
  }
  const handleSeeAll = useCallback(() => {
    props.navigation.navigate("AllCardsList", { type: "MyCards" });
  }, [props.navigation]);

  const handleLink = useCallback(() => {
    navigation.navigate("Security");
    setErrormsg("");
    setErrormsgLink("");
  }, [navigation]);


  const handleNavigate = useCallback(
    (coinItem: Asset) => {
      dispatch(setWalletActionFilter(null));
      dispatch(setNavigationSource("Dashboard"));

      navigation.navigate("CoinDetails", {
        coinData: coinItem,
        defaultVault: defaultVault,
        originalSource: "Dashboard",
      });
    },
    [dispatch, navigation, defaultVault]
  );
  const getAccounts = async () => {
    setAccountsLoading(true);
    try {
      const response = await CreateAccountService.bankKpis() as ApiResponse<BankAccount[]>;
      if (response?.ok) {
        setAccounts([...response?.data || []]);
      } else {
        showAppToast(isErrorDispaly(response), 'error');
      }
    } catch (error) {
      showAppToast(isErrorDispaly(error), 'error');
    } finally {
      setAccountsLoading(false);
      setApiCallsCompleted(prev => ({ ...prev, accounts: true }));
    }
  }
  const paymentsKpis = async () => {
    try {
      const response = await PaymentService.paymentKpiDetails() as ApiResponse<PaymentKpiItem[]>;
      if (response.ok) {
        const filterData = response?.data?.filter((item: PaymentKpiItem) => item?.name == 'Pay-In' || item?.name == 'Pay-Out')
        setPaymentsKpiData(filterData || [])
      } else {
        showAppToast(isErrorDispaly(response), 'error');
      }
    } catch (errors) {
      showAppToast(isErrorDispaly(errors), 'error');
    }
  }
  const handleSmartCardCarouselError = () => {
    setErrormsg(''); // Set the main error message
    setErrormsgLink("");
  };
  const handleBankNavigate = (value: BankAccount) => {
    dispatch(setAccountInfo(value));
    navigation.navigate(BANK_CONST.CURRENCY_POP, {
      accountNumber: decryptAES(value?.accountNumber), avialableBal: value?.amount,
      accountId: value?.productid,
      walletCode: value?.currency,
      name: value?.name, screenName: "Dashboard",
      selectedId: value?.id
    });
  };
  const handleAccountsSeeAll = useCallback(() => {
    dispatch(setNavigationSource("Dashboard"));
    navigation.navigate("Accounts", { screenName: "Dashboard" });
  }, [dispatch, navigation]);
  const navAccountCreate = async () => {
    setErrormsg('');
    setErrormsgLink('');
    if (userInfo?.kycStatus !== "Approved") {
      setKycModelVisible(!kycModelVisible);
    } else {
      const securityVerififcationData: ApiResponse<VerificationField> = await getVerificationData();
      if (securityVerififcationData?.ok) {
        if ((securityVerififcationData?.data?.isEmailVerification === true || securityVerififcationData?.data?.isPhoneVerified === true)) {
          navigation.navigate('createAccountForm', { screenName: "Dashboard" });
        } else {
          setEnableProtectionModel(true);
        }
      } else {
        setEnableProtectionModel(true);
      }

    }

  }
  const setCoinsList = useCallback((data: Asset[] | null) => {
    if (data) {
      setVaultsCoinsList((prev: VaultCoinsList) => ({ ...prev, coinsList: data, coinsPrevList: data }))
    }
    else {
      setVaultsCoinsList((prev: VaultCoinsList) => ({ ...prev, coinsList: [], coinsPrevList: [] }))
    }
  }, []);

  const getRecentTransactions = async () => {
    setTransactionsLoading(true);
    try {
      const response = await TransactionService.getNonCustodianTransactions("All", null, null) as ApiResponse<TransactionData[]>;
      if (response.ok) {
        const transactionData = response?.data;
        const data = Array.isArray(transactionData) ? transactionData : Array.isArray(transactionData?.data) ? transactionData.data : [];
        setRecentTransactionsData(data);
      }
    } catch (error) {
      setRecentTransactionsData([]);
    } finally {
      setTransactionsLoading(false);
      setApiCallsCompleted(prev => ({ ...prev, transactions: true }));
    }
  };
  const handleKpiNavigation = useCallback(
    (item: PaymentKpiItem) => {
      const normalizedName = item?.name?.toLowerCase().replace(/[^a-z0-9]/gi, "");

      if (normalizedName === HOME_CONSTS.PAYIN) {
        navigation.navigate(NAVIGATIONS_CONST.PAYIN_GRID, { fromScreen: NAVIGATIONS_CONST.DASHBOARD });
      } else if (normalizedName === HOME_CONSTS.PAYOUT) {
        navigation.navigate(NAVIGATIONS_CONST.PAYOUT_LIST, { fromScreen: NAVIGATIONS_CONST.DASHBOARD });
      }
    },
    [navigation]
  );

  const renderAccountItem = useCallback(
    ({ item }: { item: BankAccount }) => (
      <AccountRow item={item} onPress={handleBankNavigate} commonStyles={commonStyles} decryptAES={decryptAES} />
    ),
    [handleBankNavigate, commonStyles, decryptAES]
  );

  /** ✅ NEW: Memoized Empty bank banner (no UI change) */
  const emptyBankBanner = useMemo(() => {
    return (
      <ViewComponent>
        <CommonTouchableOpacity activeOpacity={0.9} onPress={navAccountCreate} style={[commonStyles.applycardbannerbg,]}>
          <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
            <ViewComponent style={[commonStyles.flex1]}>
              {Configuration?.BANK_BANNER_SECTION_TITTLE && <ParagraphComponent style={[commonStyles.cardbannertitle]} text={"GLOBAL_CONSTANTS.ACCOUNT"} />}
              <TextMultiLanguage text={"GLOBAL_CONSTANTS.CREATE_BANK_DESICREPTION"} style={[commonStyles.bannertext]} />
              <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap4]}>
                <TextMultiLanguage text={"GLOBAL_CONSTANTS.ACCOUNT"} style={[commonStyles.bannerlinkprimary]} />
                <AntDesign name="arrowright" size={20} style={[commonStyles.arrowiconprimary]} />
              </ViewComponent>
            </ViewComponent>
            <ViewComponent style={{ width: bankImageSize, height: bankImageSize }}>
              <BankImage width={bankImageSize} height={bankImageSize} />
            </ViewComponent>
          </ViewComponent>
        </CommonTouchableOpacity>
      </ViewComponent>
    );
  }, [commonStyles, navAccountCreate]);

  const spendingChartSection = useMemo(() => (
    <SpendingChartSection
      GraphConfiguration={GraphConfiguration}
      graphDetails={spendingChartData}
      activeYear={activeYear}
      handleYears={handleYears}
      graphDetailsLoading={spendingChartLoading}
    />
  ), [GraphConfiguration, spendingChartData, activeYear, handleYears, spendingChartLoading]);
  const handleInviteFriend = async () => {
    try {
      const code = referralCode[0]?.value;
      const referralUrl = `${baseUrl}/app?referralCode=${code}`;
      await Share.share({
        message: `${t("GLOBAL_CONSTANTS.HELLO_I_WOULD_LIKE_TO_INVITE")}${referralCode[0]?.value}.\n${t("GLOBAL_CONSTANTS.IAM_USING_ARTHAPAYMENTS")}${referralUrl}`
      });
    } catch (error) {
      Alert.alert((error as Error).message);
    }
  }
  return (
    <SafeAreaViewComponent style={[commonStyles.screenBg]}>
      {dashboardLoading && (
        <DashboardLoader />
      )}
      {!dashboardLoading &&
        <ScrollViewComponent ref={scrollViewRef} refreshing={refresh} onRefresh={onRefresh}>
          <Container style={[commonStyles.container]}>
            {errormsg !== "" && (
              <ErrorComponent message={errormsg} onClose={errorMSgHandle} handleLink={errormsgLink ? handleLink : undefined}>
                {errormsgLink || ""}
              </ErrorComponent>
            )}
            {commonComponentConfig?.inviteFriends && <CommonTouchableOpacity style={[commonStyles.sectionGap]} onPress={handleInviteFriend}>
              <InviteFriend handleInviteFriend={handleInviteFriend} />
            </CommonTouchableOpacity>}
            {userInfo && (
              <KycVerificationBanner
                Configuration={Configuration}
                userInfo={userInfo}
                commonStyles={commonStyles}
                handleRedirectToKyc={handleRedirectToKyc}
                t={t}
              />
            )}
            <AlertsCarousel commonStyles={commonStyles} />
            {showWalletsSection && (
              <BalanceCarousel
                commonStyles={commonStyles}
                allBalanceInfo={allBalanceInfo}
                fiatAmount={fiatAmount}
                cryptoAmount={cryptoAmount}
                currencyCode={currency && userInfo?.currency ? currency[userInfo?.currency] : ""}
                userInfo={userInfo}
                NEW_COLOR={NEW_COLOR}
              />
            )}
            {showWalletsSection && <QuickActionButtons
              commonStyles={commonStyles}
              Configuration={Configuration}
              handleSellNavigateDeposit={handleSellNavigateDeposit}
              handleWithdrawPress={handleWithdrawPress}
              NEW_COLOR={NEW_COLOR}
              withdrawButtonLoader={quikLinksLoader}
            />}

            {showCardsSection && (
              <UserCardsSection
                commonStyles={commonStyles}
                Configuration={Configuration}
                myCradsState={myCradsState}
                handleSeeAll={handleSeeAll}
                screenName={"Dashboard"}
                onSmartCardCarouselError={handleSmartCardCarouselError}
              />
            )}
            {showBankSection && <>
              <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.titleSectionGap]}>
                <TextMultiLanguage text={"GLOBAL_CONSTANTS.ACCOUNTS"} style={commonStyles.sectionTitle} />
                {!accountsLoading && accounts.length > 0 && <CommonTouchableOpacity style={[commonStyles.dflex, commonStyles.alignCenter]} onPress={handleAccountsSeeAll}>
                  <TextMultiLanguage text={"GLOBAL_CONSTANTS.SEE_ALL"} style={[commonStyles.sectionLink]} />
                </CommonTouchableOpacity>}
              </ViewComponent>
              {accountsLoading ? (
                <ViewComponent style={[commonStyles.sectionGap]}>{accountDasboardBalance()}</ViewComponent>
              ) : accounts.length > 0 ? (
                <FlatListComponent
                  data={accounts}
                  scrollEnabled={false}
                  ItemSeparatorComponent={() => <ViewComponent style={[commonStyles.transactionsListGap]} />}
                  numColumns={1}
                  maxToRenderPerBatch={5}
                  initialNumToRender={5}
                  windowSize={5}
                  renderItem={renderAccountItem}
                />
              ) : (
                emptyBankBanner
              )}
              <ViewComponent style={[commonStyles.sectionGap]} />
            </>}
            {showPaymentsSection && <>
              <TextMultiLanguage text={"GLOBAL_CONSTANTS.PAYMENTS"} style={[commonStyles.sectionTitle, commonStyles.titleSectionGap]} />
              {paymentsKpiData && <KpiComponent data={paymentsKpiData} loading={false} kpiNavigation={(item: PaymentKpiItem) => handleKpiNavigation(item)} />}
              <ViewComponent style={[commonStyles.sectionGap]} />
            </>}
            {showWalletsSection && <AssetsSection
              commonStyles={commonStyles}
              GraphConfiguration={GraphConfiguration}
              assets={assets}
              vaultsLists={vaultsLists}
              vaultCoinsLists={vaultCoinsLists}
              handleChangeSearch={handleChangeSearch}
              handleNavigate={handleNavigate}
              NEW_COLOR={NEW_COLOR}
              setCoinsList={setCoinsList}
            />}
            {GraphConfiguration?.RECENT_ACTIVITY?.HOME && (
              transactionsLoading ? (
                <ViewComponent style={[commonStyles.sectionGap]}>
                  <TextMultiLanguage text={"GLOBAL_CONSTANTS.RECENT_TRANSACTIONS"} style={[commonStyles.sectionTitle, commonStyles.titleSectionGap]} />
                  <Loadding contenthtml={transactionCardContent} />
                </ViewComponent>
              ) : (
                <RecentTransactions
                  accountType={"All"}
                  initialData={recentTransactionsData}
                  recentTranscationReload={recentTranscationReload}
                  handleRecentTranscationReloadDetails={handleRecentTranscationReloadDetails}
                  dashboardLoading={false}
                />
              )
            )}
            <ViewComponent style={[commonStyles.sectionGap]} />
            {spendingChartSection}
            <ViewComponent style={[commonStyles.sectionGap]}>
              {kycModelVisible && <KycVerifyPopup closeModel={closekycModel} addModelVisible={kycModelVisible} />}
            </ViewComponent>
            <ViewComponent style={[commonStyles.sectionGap]}>
              {enableProtectionModel && <EnableProtectionModel
                navigation={navigation}
                closeModel={closeEnableProtectionModel}
                addModelVisible={enableProtectionModel}
              />}
            </ViewComponent>
            <ViewComponent style={[commonStyles.mb5]} />
          </Container>
        </ScrollViewComponent>
      }
    </SafeAreaViewComponent>
  );
});

export default Home;
