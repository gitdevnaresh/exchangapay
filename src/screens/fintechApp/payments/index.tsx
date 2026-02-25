import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { RefreshControl } from "react-native"; // Import FlatList
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useThemeColors } from "../../../hooks/themedHook/useThemeColors";
import { getThemedCommonStyles } from "../../../components/CommonStyles";
import { isErrorDispaly } from "../../../utils/helpers";
import ErrorComponent from "../../../components/errorDisplay/errorDisplay";
import ParagraphComponent from "../../../components/textComponets/paragraphText/paragraph";
import { s } from "../../../constants/styels/scale";
import NoDataComponent from "../../../components/noData/noData";
import { DASHBOARD_SECTION_TYPES, PAYMENT_LINK_CONSTENTS } from "./constants";
import PaymentService from "../../../apiServices/payments";
import RecentPaymentLinks from "./payin/recentPayins";
import LineChartComponet from "../../../components/graphs/Linchart";
import DashboardLoader from "../../../components/loader";
import { TransactionsResponse } from "./interface";
import { DaysLookup } from "../Dashboard/constant";
import KpiComponent from "../../../components/kpiComponent/kpiComponent";
import RecentPayoutList from "./payout/recentPayout";
import TextMultiLanguage from "../../../components/textComponets/multiLanguageText/textMultiLangauge";
import SafeAreaViewComponent from "../../../components/safeArea/safeArea";
import ViewComponent from "../../../components/view/view";
import CommonTouchableOpacity from "../../../components/touchableComponents/touchableOpacity";
import { showAppToast } from "../../../components/toasterMessages/ShowMessage";
import Loadding from "../../../components/skelton/skeltons";
import { homeanalyticsGraph } from "../../../skeletons/skeleton_views";
import FlatListComponent from "../../../components/flatList/flatList";
import PaymentsBalanceCarousel from "./components/paymentBalaces";
import ActionButton from "../../../components/gradianttext/gradiantbg";
import PayinCoinIcon from "../../../components/svgIcons/mainmenuicons/payinIcon";
import PayoutCoinIcon from "../../../components/svgIcons/mainmenuicons/payoutIcon";
import WalletsService from "../../../apiServices/wallets";
import KycVerifyPopup from "../../commonScreens/kycVerify";
import { useDispatch, useSelector } from "react-redux";
import { logEvent } from "../../../hooks/loggingHook";
import TransactionService from "../../../apiServices/common/transaction";
import { useLngTranslation } from "../../../hooks/languagesHook/useLngTranslation";
import useMemberLogin from "../../../hooks/userInfoHook";
import ProfileService from "../../../apiServices/profile";
import { setPaymentsDashboard, setScreenPermissions } from "../../../redux/actions/actions";
import { useScreenPerfLogger } from '../../../hooks/performance/performanceHook';
import { getVerificationData } from '../../../apiServices/common/countryService';
import EnableProtectionModel from "../../commonScreens/protection";
import { getTabsConfigation } from '../../../../cofiguration';

const PaymentsDashboard = React.memo((props: any) => {
    const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
    const [cryptoData, setCryptoData] = useState<any>({});
    const [errormsg, setErrormsg] = useState<any>("");
    const [graphDetails, setgraphDetails] = useState<TransactionsResponse[]>([]);
    const [graphLoading, setGraphLoading] = useState<boolean>(false);
    const [refresh, setRefresh] = useState<boolean>(false)
    const isFocused = useIsFocused();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const navigation = useNavigation<any>();
    const [kpiError, setKpiError] = useState<string>('');
    const [payoutBalance, setPayoutBalance] = useState<any>({});
    const [vaultsLists, setVaultsLists] = useState<any>({ vaultsList: [], vaultsPrevList: [] });
    const [vaultCoinsLists, setVaultsCoinsList] = useState<any>({ coinsList: [], coinsPrevList: [] });
    const [kpiData, setKpiData] = useState<any>([])
    const [activeDay, setActiveDay] = useState('7');
    const payments = useMemo(() => getTabsConfigation(PAYMENT_LINK_CONSTENTS.PAYMENTS_QUICK), []);
    const AddsConfig = useMemo(() => getTabsConfigation(PAYMENT_LINK_CONSTENTS.ADDS_AND_GRAPH_CONFIGUE), []);
    const cardGraphSkelton = homeanalyticsGraph();
    const [kycModelVisible, setKycModelVisible] = useState<boolean>(false);
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails); // Define a more specific type for state if possible
    const currency = getTabsConfigation('CURRENCY');
    const [errormsgLink, setErrormsgLink] = useState("");
    const { t } = useLngTranslation();
    const { getMemDetails } = useMemberLogin();
    const [recentPaymentLinksData, setRecentPaymentLinksData] = useState<any>(undefined);
    const [recentPayoutsData, setRecentPayoutsData] = useState<any>(undefined);
    const subScreens = useSelector((state: any) => state.userReducer?.screenPermissions);
    const menuItems = useSelector((state: any) => state.userReducer?.menuItems);
    const PaymentsId = menuItems?.find((item: any) => item?.featureName === 'Payments')?.id;
    const dispatch = useDispatch<any>();
    const dashboardData = useSelector((state: any) => state.userReducer?.paymentsDashboardData);
    const GraphConfiguration = getTabsConfigation('ADDS_AND_GRAPG_CONFIGURATION');
    const { stopTrace } = useScreenPerfLogger("Payments_dashboard")
    const [graphData7Days, setGraphData7Days] = useState<any>(null);
    const [graphData30Days, setGraphData30Days] = useState<any>(null);
    const [payoutLoader, setPayoutLoader] = useState<boolean>(false);
    const flatListRef = useRef<any>(null);
    const [enableProtectionModel, setEnableProtectionModel] = useState<boolean>(false)
    useEffect(() => {
        if (flatListRef.current) {
            flatListRef.current.scrollToOffset({ offset: 0, animated: true });
        }
        if (PaymentsId && !subScreens?.Payments) {
            ProfileService.getScreenPermissions(PaymentsId).then((res: any) => {
                if (res?.data) {
                    dispatch(setScreenPermissions({ Payments: res?.data }));
                }
            }).catch((error: any) => { });
        }
    }, [isFocused, PaymentsId, subScreens?.Payments])
    const paymentsPermissions = subScreens?.Payments?.permissions;
    const payInPermissions = paymentsPermissions?.tabs?.find((tab: any) => tab.name?.replaceAll(/\s/g, '')?.toLowerCase() == "payin")?.isEnabled;
    const payoutPermissions = paymentsPermissions?.tabs?.find((tab: any) => tab.name?.replaceAll(/\s/g, '')?.toLowerCase() == "payout")?.isEnabled;
    const getRecentPaymentLinks = async () => {
        try {
            const response: any = await PaymentService.getAllPaymentLinks("payins", null, 1, 5);
            if (response.ok) {
                const linksData = response?.data?.data || [];
                setRecentPaymentLinksData(linksData);
                dispatch(setPaymentsDashboard({
                    recentPaymentLinksData: linksData
                }));
            }
        } catch (error) {
            setRecentPaymentLinksData([]);
        }
    };

    const getRecentPayouts = async () => {
        try {
            const response: any = await PaymentService.getPayOutList(1, 5, null);
            if (response.ok) {
                setRecentPayoutsData(response?.data?.data || []);
            }
        } catch (error) {
            setRecentPayoutsData([]);
        }
    };
    const fetchData = useCallback(async () => {
        setErrormsg("");
        setErrormsgLink("");
        setActiveDay('7');
        setGraphLoading(true);
        setGraphData7Days(null);
        setGraphData30Days(null);
        const promises: any = [
            kpiDetails(),
            getGraghData('week'),
            getRecentPaymentLinks(),
            getRecentPayouts()
        ];
        try {
            await Promise.all(promises);
        } catch (error) {
            showAppToast(isErrorDispaly(error), 'error');
        } finally {
            setIsLoadingDashboard(false);
            setGraphLoading(false);
        }
    }, []);

    const getWalletsList = useCallback(async () => {
        try {
            const response: any = await WalletsService?.getShowVaults()
            if (response?.ok) {
                const data = response?.data;
                const wallets = data?.wallets || [];
                setVaultsLists((prev: any) => ({ ...prev, vaultsList: wallets, vaultsPrevList: wallets }))
                setVaultsCoinsList((prev: any) => ({ ...prev, coinsList: wallets[0]?.assets, coinsPrevList: wallets[0]?.assets }))
            } else {
                showAppToast(isErrorDispaly(response), 'error');
            }
        } catch (error) {
            showAppToast(isErrorDispaly(error), 'error');
        }
    }, []);
    const closekycModel = () => {
        setKycModelVisible(!kycModelVisible);
    }
    const closeEnableProtectionModel = () => {
        setEnableProtectionModel(false)
    }
    const kpiDetails = useCallback(async () => {
        try {
            const response: any = await PaymentService.paymentKpiDetails()
            if (response.ok) {
                const filterData = response?.data?.filter((item: any) => item.name !== "Pay-In" && item.name !== "Pay-Out");
                const payinData = response?.data?.filter((item: any) => item.name == "Pay-In");
                const payoutData = response?.data?.filter((item: any) => item.name == "Pay-Out");
                dispatch(setPaymentsDashboard({
                    payoutBalance: payoutData,
                    cryptoData: payinData,
                    kpiData: filterData
                }));
                setCryptoData(payinData)
                setKpiData(filterData);
                setKpiError('')
            } else {
                showAppToast(isErrorDispaly(response), 'error');
            }
        } catch (errors) {
            showAppToast(isErrorDispaly(errors), 'error');
        }
    }, []);

    // const fetchCrypTototalBal = useCallback(async () => {
    //     const response: any = await PaymentService.paymentAvailabeBalance();
    //     if (response?.ok) {
    //         setErrormsg("");
    //     } else {
    //         showAppToast(isErrorDispaly(response), 'error');
    //     }
    // }, []);

    // const fetchPayouTototalBal = useCallback(async () => {
    //     const response: any = await PaymentService.paymentPayoutBalance();
    //     if (response?.ok) {
    //         setErrormsg("");
    //     } else {
    //         showAppToast(isErrorDispaly(response), 'error');
    //     }
    // }, []);

    const getGraghData = useCallback(async (isYear: any) => {
        // Check if data exists in cache first
        const yearKey = isYear === 'week' ? '7' : isYear;
        if (yearKey === '7' && graphData7Days) {
            setgraphDetails(graphData7Days);
            return;
        }
        if (yearKey === '30' && graphData30Days) {
            setgraphDetails(graphData30Days);
            return;
        }

        setGraphLoading(true);
        try {
            const response = await PaymentService.paymentDashBoadGraph(isYear || "7");
            if (
                response.ok &&
                response.data &&
                typeof response.data === 'object' &&
                'transactionsModels' in response.data &&
                Array.isArray((response.data as any).transactionsModels)
            ) {
                const chartData = (response.data as any).transactionsModels;
                setgraphDetails(chartData);

                // Cache the data
                if (yearKey === '7') {
                    setGraphData7Days(chartData);
                } else if (yearKey === '30') {
                    setGraphData30Days(chartData);
                }
            } else {
                showAppToast(isErrorDispaly(response), 'error');
            }
        } catch (error) {
            showAppToast(isErrorDispaly(error), 'error');
        } finally {
            setGraphLoading(false);
        }
    }, [graphData7Days, graphData30Days]);

    const handleLink = () => {
        logEvent("Button Pressed", { action: "Payments payin quicklink", currentScreen: "Payments Dashboard", nextScreen: "PayinList" })
        if (userInfo?.kycStatus !== "Approved") {
            setKycModelVisible(!kycModelVisible);
        } else {
            navigation.navigate({ name: 'PayInGrid' });
        }
    };

    const transactions = useCallback(() => {
        navigation?.navigate({
            name: 'CardsTransactions', params: {
                trasactionType: PAYMENT_LINK_CONSTENTS.PAYMENTS,
                cardId: props?.cardId,
                currency: props?.currency
            }
        });

    }, [navigation, props?.cardId, props?.currency]);

    const payOut = async () => {
        logEvent("Button Pressed", { action: "Payments payout quicklink", currentScreen: "Payments Dashboard", nextScreen: "PayOutListt" })
        setErrormsg('');
        setErrormsgLink('');

        if (userInfo?.kycStatus !== "Approved") {
            setKycModelVisible(!kycModelVisible);
        } if (userInfo?.kycStatus !== "Approved") {
            setKycModelVisible(!kycModelVisible);
        } else {
            setPayoutLoader(true);
            const securityVerififcationData: any = await getVerificationData();
            if (securityVerififcationData?.ok) {
                setPayoutLoader(false);
                if ((securityVerififcationData?.data?.isEmailVerification === true || securityVerififcationData?.data?.isPhoneVerified === true)) {
                    navigation.navigate({ name: 'PayOutList' });
                } else {
                    setPayoutLoader(false);
                    setEnableProtectionModel(true)


                }
            } else {
                setPayoutLoader(false);
                setEnableProtectionModel(true)

            }
        }
    };

    const handleChangeSearch = useCallback((val: string) => {
        let value = val.trim();
        if (value) {
            let filterData = vaultCoinsLists?.coinsPrevList?.filter((item: any) => {
                return (
                    item.code?.toLowerCase().includes(value.toLowerCase())
                );
            });
            setVaultsCoinsList((prev: any) => ({ ...prev, coinsList: filterData }))
        }
        else {
            setVaultsCoinsList((prev: any) => ({ ...prev, coinsList: vaultCoinsLists?.coinsPrevList }))
        }
    }, [vaultCoinsLists?.coinsPrevList]);

    const handleErrormsg = useCallback(() => {
        setErrormsg("")
    }, []);

    const handleNavigateSecurity = useCallback(() => {
        navigation.navigate({ name: 'Security' });
    }, [navigation]);

    const setCoinsList = useCallback((data: any) => {
        if (data) {
            setVaultsCoinsList((prev: any) => ({ ...prev, coinsList: data, coinsPrevList: data }))
        }
        else {
            setVaultsCoinsList((prev: any) => ({ ...prev, coinsList: [], coinsPrevList: [] }))
        }
    }, []);
    const handleNaviagetePaymentModes = useCallback((item: any, selectedVault: any) => {

        navigation.navigate('CoinDetails', { coinData: item, defaultVault: selectedVault });

    }, [navigation]);


    const handleYears = useCallback((item: any) => {
        const data = (item?.name === "7") ? "week" : item?.name;
        const yearKey = item?.name;
        setActiveDay(yearKey);

        // Use cached data if available, otherwise call API
        if (yearKey === '7' && graphData7Days) {
            setgraphDetails(graphData7Days);
        } else if (yearKey === '30' && graphData30Days) {
            setgraphDetails(graphData30Days);
        } else {
            getGraghData(data);
        }
    }, [getGraghData, graphData7Days, graphData30Days]);

    const handleFontSize = (amount: number | string) => {
        const totalCryptoValue = amount?.toString();
        if (totalCryptoValue?.length > 9) {
            return commonStyles.fs20
        } else {
            return commonStyles.fs28
        }
    }
    useEffect(() => {
        if (isFocused) {
            const hasData = dashboardData?.kpiData?.length > 0 || dashboardData?.recentPaymentLinksData?.length > 0;
            const shouldShowLoader = GraphConfiguration?.DASHBOARD_LOADER;
            if (shouldShowLoader || !hasData) {
                setIsLoadingDashboard(true);
            }
            fetchData();
        }
        stopTrace();
    }, [isFocused]);

    const onRefresh = useCallback(() => {
        setIsLoadingDashboard(true);
        getMemDetails(true);
        setRefresh(false);
        setGraphData7Days(null);
        setGraphData30Days(null);
        fetchData().finally(() => setRefresh(false));
    }, [fetchData]);
    const dashboardContentData = useMemo(() => [
        { type: DASHBOARD_SECTION_TYPES.SPACER, height: commonStyles.mb20.marginBottom }, // Add a small spacer at the top if needed
        { type: DASHBOARD_SECTION_TYPES.HEADER_BALANCES },
        { type: DASHBOARD_SECTION_TYPES.SPACER, height: commonStyles.sectionGap.marginBottom },
        { type: DASHBOARD_SECTION_TYPES.QUICK_LINKS },
        { type: DASHBOARD_SECTION_TYPES.SPACER, height: commonStyles.sectionGap.marginBottom },
        ...(AddsConfig.KPIS?.Payments ? [{ type: DASHBOARD_SECTION_TYPES.KPIS }] : []),
        { type: DASHBOARD_SECTION_TYPES.SPACER, height: commonStyles.sectionGap.marginBottom },
        { type: DASHBOARD_SECTION_TYPES.VAULTS },
        { type: DASHBOARD_SECTION_TYPES.SMALL_SPACER, height: commonStyles.mb20.marginBottom },
        { type: DASHBOARD_SECTION_TYPES.RECENT_PAYMENT_LINKS },
        { type: DASHBOARD_SECTION_TYPES.SMALL_SPACER, height: commonStyles.mb20.marginBottom },
        { type: DASHBOARD_SECTION_TYPES.RECENT_PAYOUTS },
        { type: DASHBOARD_SECTION_TYPES.SMALL_SPACER, height: commonStyles.mb24.marginBottom },
        ...(AddsConfig.GRAPH?.Payments ? [{ type: DASHBOARD_SECTION_TYPES.GRAPH }] : []),
        { type: DASHBOARD_SECTION_TYPES.SPACER, height: commonStyles.sectionGap.marginBottom }, // Bottom spacer
    ], [AddsConfig, commonStyles]);
    const renderDashboardItem = useCallback(({ item }: { item: { type: string, height?: number } }) => {
        switch (item.type) {
            case DASHBOARD_SECTION_TYPES.HEADER_BALANCES:
                return (
                    <>
                        {errormsg && <ErrorComponent message={errormsg} onClose={handleErrormsg} handleLink={handleNavigateSecurity} >
                            {errormsgLink}
                        </ErrorComponent>}
                        <PaymentsBalanceCarousel commonStyles={commonStyles} payinBalance={dashboardData?.cryptoData?.[0]?.value} payoutBalance={dashboardData?.payoutBalance?.[0]?.value} currencyCode={currency[dashboardData?.cryptoData?.[0]?.baseCurrency] || currency[userInfo?.currency]} NEW_COLOR={NEW_COLOR} />
                    </>
                );
            case DASHBOARD_SECTION_TYPES.QUICK_LINKS:
                return (
                    <ViewComponent>
                        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.gap10]}>
                            <ViewComponent style={[commonStyles.flex1]}>
                                {payInPermissions && <ActionButton text={"GLOBAL_CONSTANTS.PAY_IN"} useGradient onPress={handleLink} customIcon={<PayinCoinIcon />} />}
                            </ViewComponent>
                            <ViewComponent style={[commonStyles.flex1]}>
                                {payoutPermissions && <ActionButton text={"GLOBAL_CONSTANTS.PAY_OUT"} onPress={payOut} customTextColor={NEW_COLOR.TEXT_PRIMARY} customIcon={<PayoutCoinIcon />} />}

                            </ViewComponent>

                        </ViewComponent>
                        <ViewComponent style={[commonStyles.sectionGap]} />
                    </ViewComponent>
                );
            case DASHBOARD_SECTION_TYPES.KPIS:
                return <KpiComponent data={dashboardData?.kpiData || []} error={kpiError} loading={false} clearError={setKpiError} />;
            case DASHBOARD_SECTION_TYPES.RECENT_PAYMENT_LINKS:
                return (
                    <ViewComponent>
                        <ViewComponent style={[commonStyles.sectionGap]} />
                        <RecentPaymentLinks
                            accountType={PAYMENT_LINK_CONSTENTS.PAYMENTS}
                            initialData={dashboardData?.recentPaymentLinksData}
                            dashboardLoading={isLoadingDashboard || dashboardData?.recentPaymentLinksData === undefined}
                        />
                    </ViewComponent>
                );
            case DASHBOARD_SECTION_TYPES.RECENT_PAYOUTS:
                return <RecentPayoutList
                    initialData={recentPayoutsData}
                    dashboardLoading={isLoadingDashboard || recentPayoutsData === undefined}
                />;
            case DASHBOARD_SECTION_TYPES.GRAPH:
                return (
                    <ViewComponent>
                        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.mb16]}>
                            <ViewComponent>
                                <TextMultiLanguage text={"GLOBAL_CONSTANTS.SPENDING"} style={[commonStyles.sectionTitle, commonStyles.titleSectionGap]} />
                            </ViewComponent>
                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter,]}>
                                {DaysLookup?.map((dayItem: any, index: number) => (
                                    <React.Fragment key={dayItem.name}>
                                        {activeDay === dayItem.name ? (
                                            <ViewComponent style={[commonStyles.graphactivebuttons]} >
                                                <ParagraphComponent style={[commonStyles.graphactivebuttonstext]} text={dayItem.code} />
                                            </ViewComponent>
                                        ) : (<CommonTouchableOpacity onPress={() => handleYears(dayItem)} style={commonStyles.graphinactivebuttons} activeOpacity={0.9} >
                                            <ParagraphComponent style={[activeDay === dayItem?.name ? commonStyles.textAlwaysWhite : commonStyles.textWhite, commonStyles.graphinactivebuttonstext]} text={dayItem.code} />

                                        </CommonTouchableOpacity>)}
                                        {index !== DaysLookup.length - 1 && <ViewComponent style={{ width: 8 }} />}
                                    </React.Fragment>
                                ))}
                            </ViewComponent>
                        </ViewComponent>
                        <ViewComponent >
                            {graphLoading ? (<Loadding contenthtml={cardGraphSkelton} />) : (
                                <>
                                    {Array.isArray(graphDetails) && graphDetails.length > 0 ? (
                                        <LineChartComponet
                                            data={graphDetails
                                                .filter(dataItem => dataItem && typeof dataItem === 'object')
                                                .map((dataItem: any) => ({
                                                    ...dataItem,
                                                    name: dataItem.name || 'Series',
                                                    data: Array.isArray(dataItem.data) ? dataItem.data : [],
                                                    color: dataItem.color || "#000000",
                                                    dataPointsColor: dataItem.dataPointsColor || "#11998E",
                                                    textColor: dataItem.textColor || NEW_COLOR.TEXT_WHITE
                                                }))
                                            }
                                        />
                                    ) : (
                                        <ViewComponent>
                                            <NoDataComponent Description={"GLOBAL_CONSTANTS.NO_DATA_AVAILABLE"} />
                                        </ViewComponent>
                                    )}
                                </>
                            )}
                        </ViewComponent>
                        {kycModelVisible && <KycVerifyPopup closeModel={closekycModel} addModelVisible={kycModelVisible} />}
                        <ViewComponent>
                            {enableProtectionModel && <EnableProtectionModel
                                navigation={navigation}
                                closeModel={closeEnableProtectionModel}
                                addModelVisible={enableProtectionModel}
                            />}
                        </ViewComponent>
                    </ViewComponent>
                );
            default:
                return null;
        }
    }, [errormsg, handleErrormsg, handleNavigateSecurity, cryptoData, commonStyles, handleFontSize, payoutBalance, payments, handleLink, payOut, transactions, AddsConfig.KPIS?.Payments, kpiData, kpiError, setKpiError, setCoinsList, vaultsLists?.vaultsList, vaultCoinsLists?.coinsList, vaultsLists?.vaultsPrevList, handleNaviagetePaymentModes, handleChangeSearch, graphLoading, cardGraphSkelton, graphDetails, NEW_COLOR, activeDay, handleYears, recentPaymentLinksData, recentPayoutsData, isLoadingDashboard]);
    return (
        <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
            {isLoadingDashboard ? (
                <SafeAreaViewComponent><DashboardLoader /></SafeAreaViewComponent>
            ) : (
                <ViewComponent style={[commonStyles.container, commonStyles.flex1]}>
                    <FlatListComponent
                        ref={flatListRef}
                        data={dashboardContentData}
                        renderItem={renderDashboardItem}
                        keyExtractor={(item, index) => `${item?.type || 'item'}_${index}`}
                        showsVerticalScrollIndicator={false}
                        refreshControl={<RefreshControl tintColor={NEW_COLOR.BUTTON_BG} refreshing={refresh} onRefresh={onRefresh} />}
                    />
                </ViewComponent>
            )}
        </ViewComponent>
    );
});

export default PaymentsDashboard;


