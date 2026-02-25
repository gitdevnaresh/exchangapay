import React, { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { isErrorDispaly } from "../../../../utils/helpers";
import { getThemedCommonStyles, CoinImages as ImportedCoinImages, statusColor } from "../../../../components/CommonStyles";
import Container from "../../../../components/container/container";
import ErrorComponent from "../../../../components/errorDisplay/errorDisplay";
import TransactionService from "../../../../apiServices/common/transaction";
import RecentTransactions from "../../../commonScreens/transactions/recentTransactions";
import { setAccountInfo, setScreenPermissions, setBankDashboardDetails } from "../../../../redux/actions/actions";
import KycVerifyPopup from "../../../commonScreens/kycVerify";
import { BANK_CONST, ACCOUNTDASH_CONSTANTS } from "../constants";
import { getTabsConfigation } from '../../../../../configuration';
import SpendingChartSection from "../../Dashboard/components/SpendingChartSection";
import DashboardLoader from "../../../../components/loader";
import ScrollViewComponent from "../../../../components/scrollView/scrollView";
import { DayLookupItem } from "../../Dashboard/constant";
import KycVerificationBanner from "../../Dashboard/components/KycVerificationBanner";
import SafeAreaViewComponent from "../../../../components/safeArea/safeArea";
import CommonTouchableOpacity from "../../../../components/touchableComponents/touchableOpacity";
import ViewComponent from "../../../../components/view/view";
import WithdrawIcon from "../../../../components/svgIcons/mainmenuicons/dashboardwithdraw";
import ActionButton from "../../../../components/gradianttext/gradiantbg";
import BankDeposistIcon from "../../../../components/svgIcons/mainmenuicons/bankdeposist";
import { AntDesign } from '@expo/vector-icons';
import { BankAccount, ReduxState } from "../interface";
import { showAppToast } from "../../../../components/toasterMessages/ShowMessage";
import TextMultiLanguage from "../../../../components/textComponets/multiLanguageText/textMultiLangauge";
import { BankImage } from "../../../../assets/svg";
import { CurrencyText } from "../../../../components/textComponets/currencyText/currencyText";
import FlatListComponent from "../../../../components/flatList/flatList";
import { logEvent } from "../../../../hooks/loggingHook";
import useMemberLogin from "../../../../hooks/userInfoHook";
import SvgFromUrl from "../../../../components/svgIcon";
import useEncryptDecrypt from "../../../../hooks/encDecHook";
import ParagraphComponent from "../../../../components/textComponets/paragraphText/paragraph";
import ProfileService from "../../../../apiServices/profile";
import { getVerificationData } from "../../../../apiServices/common/countryService";
import AddIcon from "../../../../components/addCommonIcon/addCommonIcon";
import BankServices from "../../../../apiServices/bank";
import { useThemeColors } from "../../../../hooks/themedHook/useThemeColors";
import CardsBalanceSection from "../../cards/dashoard/CardsBalanceSection";
import { s } from "../../../../components/theme/scale";
import EnableProtectionModel from "../../../commonScreens/protection";
import { useLngTranslation } from "../../../../hooks/languagesHook/useLngTranslation";
import { Logger } from "../../../../utils/Logger";

const GraphConfiguration = getTabsConfigation('ADDS_AND_GRAPG_CONFIGURATION');
const CoinImages: Record<string, string> = ImportedCoinImages;

const ItemSeparator: React.FC<{ commonStyles: any }> = ({ commonStyles }) => (
  <ViewComponent style={[commonStyles.mt10]} />
);

const BankDashboard = React.memo(() => {
  const { t } = useLngTranslation();
  const isFocused = useIsFocused();
  const dispatch = useDispatch<any>();
  const [refresh, setRefresh] = useState<boolean>(false);
  const { getMemDetails } = useMemberLogin();
  const { decryptAES } = useEncryptDecrypt();
  const bankDashboardDetails = useSelector((state: any) => state.userReducer?.bankDashboardDetails);
  const scrollViewRef = useRef<any>(null);
  const [enableProtectionModel, setEnableProtectionModel] = useState<boolean>(false)

  const hasDashboardData = () => {
    return (Array.isArray(bankDashboardDetails?.createAccDetails) && bankDashboardDetails.createAccDetails.length > 0) ||
      (bankDashboardDetails?.totalBalance && bankDashboardDetails.totalBalance !== "");
  };

  const [state, setState] = useState({
    errormsg: "",
    errormsgLink: "",
    kycModelVisible: false,
    activeYear: '7',
    bankSpendingChartData: null,
    bankSpendingChartLoading: false,
    recentTranscationReload: false,
    recentTransactionsData: [] as any[],
    graphData7Days: null as any,
    graphData30Days: null as any,
    withdrawLoader: false
  });

  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [apiCallsCompleted, setApiCallsCompleted] = useState({ accountDetails: false });

  const updateState = (newState: Partial<typeof state>) => {
    setState(prev => ({ ...prev, ...newState }));
  };
  const subScreens = useSelector((state: any) => state.userReducer?.screenPermissions);
  const menuItems = useSelector((state: any) => state.userReducer?.menuItems);
  const BanksId = menuItems?.find((item: any) => item?.featureName?.toLowerCase() === ACCOUNTDASH_CONSTANTS.BANK_FEATURE_NAME)?.id;
  useEffect(() => {
    if (BanksId && !subScreens?.Banks) {
      ProfileService.getScreenPermissions(BanksId)
        .then((res: any) => {
          if (res?.data) {
            dispatch(setScreenPermissions({ Banks: res?.data }));
          }
        })
        .catch((error: any) => {
          Logger.error('getScreenPermissions failed', { error, BanksId });
          dispatch(setScreenPermissions({ Banks: '' }));
        });
    }
  }, [isFocused, BanksId, subScreens?.Banks]);

  const bankPermissions = subScreens?.Banks?.permissions;
  const canShowDeposit = bankPermissions?.tabs?.find((tab: any) => tab.name?.toLowerCase() === ACCOUNTDASH_CONSTANTS.ACTION_NAME_DEPOSIT)?.isEnabled;
  const canShowWithdraw = bankPermissions?.tabs?.find((tab: any) => tab.name?.toLowerCase() === ACCOUNTDASH_CONSTANTS.ACTION_NAME_WITHDRAW)?.isEnabled;
  const userInfo = useSelector((state: ReduxState) => state.userReducer?.userDetails);
  const currency = getTabsConfigation('CURRENCY')
  const navigation = useNavigation<any>();
  const baseCurrency = useSelector((state: any) => state.userReducer?.userDetails?.currency);
  useEffect(() => {
    try {
      if (isFocused) {
        // Only scroll if ref is available and component is mounted
        setTimeout(() => {
          if (scrollViewRef?.current) {
            scrollViewRef.current.scrollTo({ y: 0, animated: true });
          }
        }, 100);
        dispatch({ type: 'SET_IS_REAPPLY', payload: false });
        const shouldShowLoader = GraphConfiguration?.DASHBOARD_LOADER;
        const hasData = hasDashboardData();

        if (shouldShowLoader || !hasData) {
          setDashboardLoading(true);
        }

        // Reset activeYear to '7' when screen is focused
        updateState({ activeYear: '7', kycModelVisible: false });
        initializeData();
      }
    } catch (error) {
      Logger.error('Main useEffect failed', { error });
    }
  }, [isFocused]);

  useEffect(() => {
    const criticalAPIsCompleted = apiCallsCompleted.accountDetails;
    if (criticalAPIsCompleted && dashboardLoading) {
      setDashboardLoading(false);
    }
  }, [apiCallsCompleted, dashboardLoading]);
  const initializeData = async () => {
    updateState({
      errormsg: "",
      recentTranscationReload: true,
      graphData7Days: null,
      graphData30Days: null
    });

    const hasData = hasDashboardData();
    const shouldShowLoader = GraphConfiguration?.DASHBOARD_LOADER;
    if (shouldShowLoader || !hasData) {
      setDashboardLoading(true);
      setApiCallsCompleted({ accountDetails: false });
      await Promise.all([getAccountDetails()]);
    } else {
      setApiCallsCompleted({ accountDetails: true });
      getAccountDetails();
    }
    getBankGraphData(state.activeYear || "7");
    getRecentTransactions();
  };

  const onRefresh = async () => {
    try {
      setDashboardLoading(true);
      getMemDetails(true);
      updateState({
        recentTranscationReload: true,
        graphData7Days: null,
        graphData30Days: null
      });
      setApiCallsCompleted({ accountDetails: false });
      await Promise.all([getAccountDetails()]);
      getBankGraphData(state.activeYear || "7");
      getRecentTransactions();
    } catch (error) {
      Logger.error('onRefresh failed', { error });
      setDashboardLoading(false);
    }
  };

  const getAccountDetails = async () => {
    try {
      const [kpiResponse, accountResponse] = await Promise.all([
        BankServices.bankKpis(),
        BankServices.getAccountDetailsOfMobileBank()
      ]);
      let createAccDetails: BankAccount[] = [];
      let totalBalance = "";

      if (kpiResponse.ok && Array.isArray(kpiResponse.data)) {
        createAccDetails = kpiResponse.data as BankAccount[];
      } else if (!kpiResponse.ok) {
        showAppToast(isErrorDispaly(kpiResponse), 'error');
      }

      if (accountResponse.ok && accountResponse.data) {
        totalBalance = (accountResponse.data as any)?.totalAmount?.toString() || "0";
      } else if (!accountResponse.ok) {
        showAppToast(isErrorDispaly(accountResponse), 'error');
      }
      dispatch(setBankDashboardDetails({ createAccDetails, totalBalance }));
    } catch (error) {
      Logger.error('getAccountDetails failed', { error });
      showAppToast(isErrorDispaly(error), 'error');
    } finally {
      setApiCallsCompleted(prev => ({ ...prev, accountDetails: true }));
    }
  };

  const getBankGraphData = async (activeYear: string) => {
    try {
      // Check if data exists in cache first
      if (activeYear === '7' && state.graphData7Days) {
        updateState({ bankSpendingChartData: state.graphData7Days });
        return;
      }
      if (activeYear === '30' && state.graphData30Days) {
        updateState({ bankSpendingChartData: state.graphData30Days });
        return;
      }

      const response: any = await TransactionService.getBankGraph(activeYear);
      if (response.ok) {
        const chartData = response.data?.transactionsModels;
        updateState({
          bankSpendingChartData: chartData,
          ...(activeYear === '7' && { graphData7Days: chartData }),
          ...(activeYear === '30' && { graphData30Days: chartData })
        });
      } else {
        updateState({ bankSpendingChartData: null });
        showAppToast(isErrorDispaly(response), 'error');
      }
    } catch (error) {
      Logger.error('getBankGraphData failed', { error, activeYear });
      updateState({ bankSpendingChartData: null });
      showAppToast(isErrorDispaly(error), 'error');
    }
  };

  const getRecentTransactions = async () => {
    try {
      const response: any = await TransactionService.getNonCustodianTransactions(BANK_CONST.ACCOUNT, null, null);
      if (response.ok) {
        const data = Array.isArray(response?.data) ? response.data : Array.isArray(response?.data?.data) ? response.data.data : [];
        updateState({ recentTransactionsData: data });
      } else {
        updateState({ recentTransactionsData: [] });
        showAppToast(isErrorDispaly(response), 'error');
      }
    } catch (error) {
      Logger.error('getRecentTransactions failed', { error });
      updateState({ recentTransactionsData: [] });
      showAppToast(isErrorDispaly(error), 'error');
    }
  };

  const handleChage = (value: BankAccount) => {
    try {
      dispatch(setAccountInfo(value));
      navigation.navigate(BANK_CONST.CURRENCY_POP, {
        name: value?.name,
        screenName: "frombankDashboard",
        walletCode: value?.currency,
        selectedId: value?.id
      });
    } catch (error) {
      Logger.error('handleChage failed', { error, accountId: value?.id });
      showAppToast(isErrorDispaly(error), 'error');
    }
  };

  const handleYears = async (item: DayLookupItem) => {
    try {
      const newYear = item?.name || "7";
      updateState({ activeYear: newYear, bankSpendingChartLoading: true });

      // Use cached data if available, otherwise call API
      if (newYear === '7' && state.graphData7Days) {
        updateState({ bankSpendingChartData: state.graphData7Days, bankSpendingChartLoading: false });
      } else if (newYear === '30' && state.graphData30Days) {
        updateState({ bankSpendingChartData: state.graphData30Days, bankSpendingChartLoading: false });
      } else {
        await getBankGraphData(newYear);
        updateState({ bankSpendingChartLoading: false });
      }
    } catch (error) {
      Logger.error('handleYears failed', { error, year: item?.name });
      updateState({ bankSpendingChartLoading: false });
    }
  };

  const navAccountSelect = async () => {
    try {
      logEvent("Button Pressed", { action: "Bank create account quicklink", currentScreen: "Bank Dashboard", nextScreen: "Bank account creation" })
      updateState({ errormsgLink: "" });
      if (userInfo?.kycStatus !== "Approved") {
        updateState({ kycModelVisible: true });
      } else {
        const securityVerififcationData: any = await getVerificationData();
        if (securityVerififcationData?.ok) {
          if ((securityVerififcationData?.data?.isEmailVerification === true || securityVerififcationData?.data?.isPhoneVerified === true)) {
            navigation.navigate(ACCOUNTDASH_CONSTANTS.CREATE_ACCOUNT_FORM);
          } else {
            setEnableProtectionModel(true);
          }
        } else {
          showAppToast(isErrorDispaly(securityVerififcationData), 'error');
        }
      }
    } catch (error) {
      Logger.error('navAccountSelect failed', { error, kycStatus: userInfo?.kycStatus });
      showAppToast(isErrorDispaly(error), 'error');
    }
  };

  const handleLink = () => {
    try {
      navigation.navigate('Security');
      updateState({ errormsg: "", errormsgLink: "" });
    } catch (error) {
      Logger.error('handleLink failed', { error });
    }
  };

  const handleDeposit = () => {
    try {
      logEvent("Button Pressed", { action: "Bank deposit quicklink", currentScreen: "Bank Dashboard", nextScreen: "Bank select account" })
      navigation.navigate(BANK_CONST.ACCOUNTS, { type: BANK_CONST.DEPOSITE })
    } catch (error) {
      Logger.error('handleDeposit failed', { error });
      showAppToast(isErrorDispaly(error), 'error');
    }
  };

  const handleWithdraw = async () => {
    try {
      logEvent("Button Pressed", { action: "Bank withdraw quicklink", currentScreen: "Bank Dashboard", nextScreen: "Bank select account" })
      updateState({ errormsgLink: "" });
      if (userInfo?.kycStatus !== "Approved") {
        updateState({ kycModelVisible: true });
      } else {
        updateState({ withdrawLoader: true });
        const securityVerififcationData: any = await getVerificationData();
        if (securityVerififcationData?.ok) {
          updateState({ withdrawLoader: false });
          if ((securityVerififcationData?.data?.isEmailVerification === true || securityVerififcationData?.data?.isPhoneVerified === true)) {
            navigation.navigate(BANK_CONST.ACCOUNTS, { type: BANK_CONST.WITHDRAW });
          } else {
            setEnableProtectionModel(true);
          }
        } else {
          updateState({ withdrawLoader: false });
          showAppToast(isErrorDispaly(securityVerififcationData), 'error');
        }
      }
    } catch (error) {
      Logger.error('handleWithdraw failed', { error, kycStatus: userInfo?.kycStatus });
      updateState({ withdrawLoader: false });
      showAppToast(isErrorDispaly(error), 'error');
    }
  };
  const closeEnableProtectionModel = () => {
    setEnableProtectionModel(false)
  }

  const handleRedirectToKyc = () => {
    updateState({ kycModelVisible: true });
  };

  const handleSeeAll = () => {
    try {
      navigation.navigate(BANK_CONST.ACCOUNTS, { screenName: "bankDashboard" });
    } catch (error) {
      Logger.error('handleSeeAll failed', { error });
      showAppToast(isErrorDispaly(error), 'error');
    }
  };

  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);

  const separatorComponent = useCallback(
    () => <ItemSeparator commonStyles={commonStyles} />,
    [commonStyles]
  );

  const handleRecentTranscationReloadDetails = (reload: boolean, error?: string | null) => {
    updateState({ recentTranscationReload: reload });
    if (error) {
      updateState({ errormsg: error });
    }
  };

  const closekycModel = () => {
    updateState({ kycModelVisible: false });
  };

  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]} >
      {dashboardLoading ? (
        <SafeAreaViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
          <DashboardLoader />
        </SafeAreaViewComponent>
      ) : (
        <ScrollViewComponent ref={scrollViewRef} refreshing={refresh} onRefresh={onRefresh}>
          <Container style={[commonStyles.container]}>
            {state.errormsg !== "" && (
              <ErrorComponent message={state.errormsg} onClose={() => updateState({ errormsg: "" })} handleLink={state.errormsgLink ? handleLink : undefined}>
                {state.errormsgLink || ""}
              </ErrorComponent>
            )}

            {userInfo && (
              <KycVerificationBanner
                Configuration={getTabsConfigation("HOME")}
                userInfo={userInfo}
                commonStyles={commonStyles}
                handleRedirectToKyc={handleRedirectToKyc}
                t={t}
              />
            )}

            <CardsBalanceSection cardBalance={{ usd: bankDashboardDetails?.totalBalance || "", eur: bankDashboardDetails?.totalBalance || "" }} isShowprifix={true} prifix={currency[baseCurrency]} coins={''} coinSelection={() => { }} balanceLabel="GLOBAL_CONSTANTS.TOTAL_BALANCE" />

            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10, commonStyles.sectionGap, commonStyles.justifyContent]}>

              {canShowDeposit && (
                <ViewComponent style={[commonStyles.flex1]}>
                  <CommonTouchableOpacity>
                    <ActionButton
                      text="GLOBAL_CONSTANTS.DEPOSITE"
                      onPress={handleDeposit}
                      customTextColor={NEW_COLOR.TEXT_ALWAYS_WHITE}
                      useGradient
                      customIcon={<BankDeposistIcon />}
                    />
                  </CommonTouchableOpacity>
                </ViewComponent>
              )}

              {canShowWithdraw && (
                <ViewComponent style={[commonStyles.flex1]}>
                  <CommonTouchableOpacity>
                    <ActionButton
                      text="GLOBAL_CONSTANTS.WITHDRAW"
                      onPress={handleWithdraw}
                      customTextColor={NEW_COLOR.BUTTON_TEXT}
                      customIcon={<WithdrawIcon />}
                      loading={state.withdrawLoader}
                      disable={state.withdrawLoader}
                    />
                  </CommonTouchableOpacity>
                </ViewComponent>
              )}
            </ViewComponent>


            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.titleSectionGap]}>
              <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10]}>
                <ParagraphComponent text={"GLOBAL_CONSTANTS.ACCOUNTS"} style={[commonStyles.sectionTitle]} />
                <ViewComponent style={[commonStyles.actioniconbg]} >
                  <ViewComponent style={[commonStyles.actioniconbg]} >
                    <AddIcon onPress={navAccountSelect} />
                  </ViewComponent>

                </ViewComponent>
              </ViewComponent>

              {(bankDashboardDetails?.createAccDetails || []).length > 0 &&
                <ParagraphComponent text={"GLOBAL_CONSTANTS.SEE_ALL"} style={[commonStyles.sectionLink]} onPress={handleSeeAll} />}



            </ViewComponent>

            {(bankDashboardDetails?.createAccDetails || []).length > 0 ? (
              <FlatListComponent
                data={bankDashboardDetails?.createAccDetails || []}
                scrollEnabled={false}
                ItemSeparatorComponent={<ViewComponent style={[commonStyles.transactionsListGap]} />}
                numColumns={1}
                renderItem={({ item }: any) => {
                  return (
                    <ViewComponent style={[commonStyles.flex1,]}>
                      <CommonTouchableOpacity onPress={() => handleChage(item)} style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.cardsbannerbg]}>
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent,]}>
                          <ViewComponent style={[commonStyles.dflex, commonStyles.gap16, commonStyles.alignCenter]}>
                            <ViewComponent style={{ width: s?.(32), height: s?.(32) }}>
                              <SvgFromUrl uri={item?.currency?.toLowerCase() === 'usd' ? CoinImages['bankusd'] : CoinImages[item?.currency?.toLowerCase() || '']}
                                width={s(32)}
                                height={s(32)}
                              />
                            </ViewComponent>
                            <ViewComponent style={item?.bankStatus?.toLowerCase() !== 'approved' ? [commonStyles.justifyCenter] : ""}>
                              <ParagraphComponent style={[commonStyles.secondarytext, commonStyles.flexWrap, commonStyles.gap8]} text={item?.name} />
                              {item?.bankStatus?.toLowerCase() === 'approved' && item?.accountNumber && <ParagraphComponent style={[commonStyles.primarytext]} text={decryptAES(item.accountNumber)} />}
                              {item?.bankStatus?.toLowerCase() !== 'approved' && (
                                <ParagraphComponent
                                  style={[commonStyles.primarytext, { color: statusColor[item?.bankStatus?.toLowerCase() === 'rejected' ? item?.bankStatus?.toLowerCase() : 'pending'] || statusColor[ACCOUNTDASH_CONSTANTS.PENDING] }]}
                                  text={item?.bankStatus?.toLowerCase() === 'rejected' ? `${item?.bankStatus}` : 'Pending'}
                                />
                              )}
                            </ViewComponent>
                          </ViewComponent>
                          <ViewComponent style={[commonStyles.flex1]}>
                            <CurrencyText value={item?.amount} prifix={currency[item?.currency]} symboles={true} style={[commonStyles.primarytext, { textAlign: 'right' }]} />
                          </ViewComponent>
                        </ViewComponent>
                      </CommonTouchableOpacity>
                    </ViewComponent>
                  );
                }}
              />
            ) : (
              <ViewComponent>
                <CommonTouchableOpacity activeOpacity={0.9} onPress={navAccountSelect} style={[commonStyles.applycardbannerbg]}>
                  <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
                    <ViewComponent style={[commonStyles.flex1,]}>
                      <TextMultiLanguage text={"GLOBAL_CONSTANTS.CREATE_BANK_DESICREPTION"} style={[commonStyles.bannertext]} />
                      <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap4]}>
                        <TextMultiLanguage text={"GLOBAL_CONSTANTS.ACCOUNT"} style={[commonStyles.sectionLink]} />
                        <AntDesign name="arrowright" size={20} style={[commonStyles.arrowiconprimary, commonStyles.mt2]} />

                      </ViewComponent>

                    </ViewComponent>
                    <ViewComponent style={{ width: s(70), height: s(70), alignItems: 'center', justifyContent: 'center', }}>
                      <BankImage width={s(70)} height={s(70)} />
                    </ViewComponent>
                  </ViewComponent>
                </CommonTouchableOpacity>
              </ViewComponent>
            )}

            <ViewComponent style={[commonStyles.sectionGap]} />
            <RecentTransactions
              accountType={BANK_CONST.ACCOUNT}
              initialData={state.recentTransactionsData}
              handleRecentTranscationReloadDetails={handleRecentTranscationReloadDetails}
              dashboardLoading={dashboardLoading}
            />
            <ViewComponent style={[commonStyles.sectionGap]} />
            <SpendingChartSection
              GraphConfiguration={GraphConfiguration}
              graphDetails={state.bankSpendingChartData ?? []}
              activeYear={state.activeYear}
              handleYears={handleYears}
              graphDetailsLoading={state.bankSpendingChartLoading}
              disableInternalFetch={true}
            />

            <ViewComponent style={[commonStyles.sectionGap]}>
              {state.kycModelVisible && <KycVerifyPopup closeModel={closekycModel} addModelVisible={state.kycModelVisible} />}
            </ViewComponent>
            <ViewComponent style={[commonStyles.sectionGap]}>
              {enableProtectionModel && <EnableProtectionModel
                navigation={navigation}
                closeModel={closeEnableProtectionModel}
                addModelVisible={enableProtectionModel}
              />}
            </ViewComponent>
          </Container>
        </ScrollViewComponent>
      )}
    </ViewComponent>
  );
});

export default BankDashboard;