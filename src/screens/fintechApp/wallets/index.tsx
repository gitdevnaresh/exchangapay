import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { InteractionManager, RefreshControl } from "react-native";
import "moment-timezone";
import FlatListComponent from "../../../components/flatList/flatList";
import { useIsFocused, useNavigation, useFocusEffect } from "@react-navigation/native";
import Container from "../../../components/container/container";
import { s } from "../../../constants/styels/scale";
import { isErrorDispaly } from "../../../utils/helpers";
import LineChartComponet from "../../../components/graphs/Linchart";
import { CoinImages, getThemedCommonStyles } from "../../../components/CommonStyles";
import NoDataComponent from "../../../components/noData/noData";
import RecentTransactions from "../../commonScreens/transactions/recentTransactions";
import SafeAreaViewComponent from "../../../components/safeArea/safeArea";
import ScrollViewComponent from "../../../components/scrollView/scrollView";
import ViewComponent from "../../../components/view/view";
import CommonTouchableOpacity from "../../../components/touchableComponents/touchableOpacity";
import ErrorComponent from "../../../components/errorDisplay/errorDisplay";
import { homeServices } from "../../../apiServices/homeDashboard";
import ImageUri from "../../../components/imageComponents/image";
import { CurrencyText } from "../../../components/textComponets/currencyText/currencyText";
import { useDispatch, useSelector } from "react-redux";
import { CRYPTO_CONSTANTS, DaysLookup } from "./constant";
import { getVerificationData } from "../../../apiServices/common/countryService";
import KycVerifyPopup from "../../commonScreens/kycVerify";
import { useThemeColors } from "../../../hooks/themedHook/useThemeColors";
import DashboardLoader from "../../../components/loader";
import ActionButton from "../../../components/gradianttext/gradiantbg";
import DeposistIcon from "../../../components/svgIcons/mainmenuicons/dashboarddeposist";
import WithdrawIcon from "../../../components/svgIcons/mainmenuicons/dashboardwithdraw";
import ParagraphComponent from "../../../components/textComponets/paragraphText/paragraph";
import ExchangeBalanceCarousel from "../../commonScreens/Carousel/exchangeBalanceCarousel";
import WalletsService from "../../../apiServices/wallets";
import TextMultiLanguage from "../../../components/textComponets/multiLanguageText/textMultiLangauge";
import ProfileService from "../../../apiServices/profile";
import { setScreenPermissions, setWalletsDashboard, setNavigationSource, setWalletActionFilter } from "../../../redux/actions/actions";
import CreateAccountService from "../../../apiServices/bank/createAccount"; import { GraphDetailItem } from "../Dashboard/constant";
import { homeanalyticsGraph } from "../../../skeletons/homeDashboard/skeltons";
import Loadding from "../../../components/skelton/skeltons";
import { showAppToast } from "../../../components/toasterMessages/ShowMessage";
import { useScreenPerfLogger } from "../../../hooks/performance/performanceHook";
import EnableProtectionModel from '../../commonScreens/protection';
import SuccessBottomSheet from "../../commonScreens/successBottomSheet/successBottomSheet";
import { getTabsConfigation, walletsTabsNavigation } from "../../../../cofiguration";

const WalletsHome = React.memo(() => {
    const [grphDetails, setgraphDetails] = useState<any>([]);
    const [errormsg, setErrormsg] = useState<any>("");
    const [activeYear, setActiveYear] = useState<string>('7');
    const isFocused = useIsFocused();
    const [refresh, setRefresh] = useState<boolean>(false);
    const scrollViewRef = useRef(null);
    const navigation = useNavigation<any>();
    const Configuration = getTabsConfigation('ADDS_AND_GRAPG_CONFIGURATION');
    const quickLinksConfiguration = getTabsConfigation('WALLETS');
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
    const { selectedAddresses, identityDocuments, personalDob, walletsDashboard } = useSelector((state: any) => state.userReducer);

    // Derived state from Redux - Wallets Dashboard
    const allBalanceInfo = walletsDashboard?.balance || [];
    const assets = walletsDashboard?.cryptoAssets?.assets || [];
    const defaultVault = walletsDashboard?.cryptoAssets?.defaultVault || {};
    const cryptoData = walletsDashboard?.cryptoAssets || null;
    const fiatData = { assets: walletsDashboard?.fiatAssets || [] };

    // Legacy aliases: some parts of the file still reference these older variable names
    // Define them here to avoid TS errors and keep backward compatibility.
    const walletsDashboardBalance = walletsDashboard?.balance || [];
    const walletsDashboardCryptoAssets = walletsDashboard?.cryptoAssets || { assets: [], defaultVault: {} };
    const walletsDashboardFiatAssets = walletsDashboard?.fiatAssets || [];

    // Helper to determine if dashboard has any meaningful data
    const hasDashboardData = useCallback(() => {
        const currentState = walletsDashboard || {};
        const balanceHas = Array.isArray(currentState.balance) && currentState.balance.length > 0;
        const cryptoHas = Array.isArray(currentState.cryptoAssets?.assets) && currentState.cryptoAssets.assets.length > 0;
        const fiatHas = Array.isArray(currentState.fiatAssets) && currentState.fiatAssets.length > 0;

        return balanceHas || cryptoHas || fiatHas;
    }, [walletsDashboard]);

    const [quikLinksLoader, setQuikLinksLoader] = useState<boolean>(false);
    const [kycModelVisible, setKycModelVisible] = useState<boolean>(false);
    const [errormsgLink, setErrormsgLink] = useState<string>("");
    const NEW_COLOR = useThemeColors();
    const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);
    const [screenLoading, setScreenLoading] = useState<boolean>(true);
    const dispatch = useDispatch<any>();
    const navigationSource = useSelector((state: any) => state.userReducer?.navigationSource);
    const [graphDetailsLoading, setGraphDetailsLoading] = useState<boolean>(false);
    const [apiCallsCompleted, setApiCallsCompleted] = useState({ balance: false, cryptoList: false, fiatList: false });
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [recentTranscationReload, setRecentTranscationReload] = useState(false);
    const [initialChartLoaded, setInitialChartLoaded] = useState(false);
    const hasInitiallyLoaded = useRef(false);
    const isInitializing = useRef(false);
    const isLoadingGraph = useRef(false);
    const successSheetRef = useRef<any>(null);
    const subScreens = useSelector((state: any) => state.userReducer?.screenPermissions);
    const menuItems = useSelector((state: any) => state.userReducer?.menuItems);
    const walletsPermissionId = menuItems?.find((item: any) => item?.featureName.toLowerCase() === CRYPTO_CONSTANTS.WALLETS)?.id;
    const cardGraphSkelton = homeanalyticsGraph();
    const { stopTrace } = useScreenPerfLogger("Home_dashboard");
    const [graphData7Days, setGraphData7Days] = useState<any>(null);
    const [graphData30Days, setGraphData30Days] = useState<any>(null);
    const [enableProtectionModel, setEnableProtectionModel] = useState<boolean>(false)

    useEffect(() => {
        if (walletsPermissionId && !subScreens?.Vaults) {
            ProfileService.getScreenPermissions(walletsPermissionId).then((res: any) => {
                if (res?.data) {
                    dispatch(setScreenPermissions({ Vaults: res?.data }));
                }
            }).catch((error: any) => {
                setErrormsg(isErrorDispaly(error));
            });
        }
    }, [isFocused, walletsPermissionId, subScreens?.Vaults]);
    const walletsActionsPermissions = subScreens?.Vaults?.permissions;
    const CryptoWalletsPermission = walletsActionsPermissions?.tabs?.find((tab: any) => tab.name?.replaceAll(' ', '')?.toLowerCase() === CRYPTO_CONSTANTS.CRYPTO_ACTION)?.isEnabled ?? true;
    const FiatWalletsPermission = walletsActionsPermissions?.tabs?.find((tab: any) => tab.name?.replaceAll(' ', '')?.toLowerCase() === CRYPTO_CONSTANTS.FIAT_ACTION)?.isEnabled ?? true;
    useFocusEffect(
        useCallback(() => {
            dispatch(setNavigationSource(""));
            InteractionManager.runAfterInteractions(() => {
                const shouldShowLoader = Configuration?.DASHBOARD_LOADER;
                const hasRedux = hasDashboardData();

                // Show loader based on configuration or Redux data
                if (shouldShowLoader) {
                    setScreenLoading(true);
                } else {
                    setScreenLoading(!hasRedux);
                }

                const initializeData = async () => {
                    if (isInitializing.current) {
                        return;
                    }

                    isInitializing.current = true;
                    setActiveYear('7');
                    setInitialChartLoaded(false);
                    setErrormsg("");
                    setApiCallsCompleted({ balance: false, cryptoList: false, fiatList: false });
                    setGraphData7Days(null);
                    setGraphData30Days(null);
                    hasInitiallyLoaded.current = true;

                    try {
                        await Promise.all([
                            getuserAccountsBalances(),
                            getShownAssets(),
                            getFiatAssets()
                        ]);
                    } catch (error) {
                        setErrormsg(isErrorDispaly(error));
                    } finally {
                        isInitializing.current = false;
                    }
                };

                initializeData();
                if (!isLoadingGraph.current) {
                    getGraghData('7');
                }
                return () => { };
            });
            stopTrace();
        }, [hasDashboardData(), Configuration?.DASHBOARD_LOADER])
    );

    // Dashboard loader control - optimized to prevent excessive state updates
    useEffect(() => {
        if (isRefreshing) return;

        const shouldShowLoader = Configuration?.DASHBOARD_LOADER;
        const hasReduxData = hasDashboardData();
        const allCriticalCompleted = Object.values(apiCallsCompleted).every(Boolean);

        let newScreenLoading = screenLoading;

        if (shouldShowLoader) {
            if (allCriticalCompleted && screenLoading) {
                newScreenLoading = false;
            }
        } else {
            if (hasReduxData && screenLoading) {
                newScreenLoading = false;
            } else if (!hasReduxData && !screenLoading) {
                newScreenLoading = true;
            }
        }

        if (newScreenLoading !== screenLoading) {
            setScreenLoading(newScreenLoading);
        }
    }, [apiCallsCompleted, walletsDashboard, Configuration?.DASHBOARD_LOADER, isRefreshing]);



    const fetchInitialData = useCallback(async (calledFromRefresh = false) => {
        if (!calledFromRefresh) {
            setApiCallsCompleted({ balance: false, cryptoList: false, fiatList: false });
        }

        try {
            await Promise.all([
                getuserAccountsBalances(),
                getShownAssets(),
                getFiatAssets()
            ]);
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
        }
    }, []);

    const onRefresh = useCallback(() => {
        setRefresh(true);
        setScreenLoading(true);
        setIsRefreshing(true);
        setGraphData7Days(null);
        setGraphData30Days(null);

        Promise.all([
            fetchInitialData(true),
            getGraghData(activeYear)
        ]).finally(() => {
            setRefresh(false);
            setScreenLoading(false);
            setIsRefreshing(false);
        });
    }, [activeYear, fetchInitialData]);

    const getGraghData = async (isDays: any) => {
        // Check if data exists in cache first
        if (isDays === '7' && graphData7Days) {
            setgraphDetails(graphData7Days);
            return;
        }
        if (isDays === '30' && graphData30Days) {
            setgraphDetails(graphData30Days);
            return;
        }

        if (isLoadingGraph.current) {
            return;
        }

        isLoadingGraph.current = true;
        setGraphDetailsLoading(true)
        try {
            const response: any = await WalletsService.getWalletsSpendingChartDashboard(isDays)
            if (response?.ok) {
                const chartData = response?.data?.transactionsModels;
                setgraphDetails(chartData);

                // Cache the data
                if (isDays === '7') {
                    setGraphData7Days(chartData);
                } else if (isDays === '30') {
                    setGraphData30Days(chartData);
                }
            } else {
                showAppToast(isErrorDispaly(response), 'error');
            }
        } catch (error) {
            showAppToast(isErrorDispaly(error), 'error');
        } finally {
            setGraphDetailsLoading(false)
            isLoadingGraph.current = false;
        }
    };
    const getuserAccountsBalances = async () => {
        let response: any;
        try {
            response = await homeServices.getTotalBalance();
            if (response?.ok) {
                dispatch(setWalletsDashboard({ balance: response?.data }));
            } else {
                showAppToast(isErrorDispaly(response), 'error');
            }
        } catch (error) {
            showAppToast(isErrorDispaly(error), 'error');
        } finally {
            setApiCallsCompleted(prev => ({ ...prev, balance: true }));
        }
    };
    const handleYears = (item: any) => {
        const newYear = item?.name;
        setActiveYear(newYear);

        // Use cached data if available, otherwise call API
        if (newYear === '7' && graphData7Days) {
            setgraphDetails(graphData7Days);
        } else if (newYear === '30' && graphData30Days) {
            setgraphDetails(graphData30Days);
        } else {
            getGraghData(newYear);
        }
    };
    const errorMSgHandle = () => {
        setErrormsg("");
    }
    const handleRecentTranscationReloadDetails = (reload: boolean, error?: string | null) => {
        setRecentTranscationReload(reload);
        if (error) {
            setErrormsg(error);
        }
    }

    const handleSellNavigateDeposit = () => {
        if (userInfo?.kycStatus?.toLowerCase() !== 'approved') {
            setKycModelVisible(true);
        } else {
            navigation?.navigate(walletsTabsNavigation, { screenType: 'Deposit' })
        }
    }
    const cryptoWithdraw = async () => {
        setErrormsg('');
        setErrormsgLink('');
        if (userInfo?.kycStatus?.toLowerCase() !== 'approved') {
            setKycModelVisible(true);
        } else {
            setQuikLinksLoader(true);
            const securityVerififcationData: any = await getVerificationData();
            if (securityVerififcationData?.ok) {
                setQuikLinksLoader(false);
                if ((securityVerififcationData?.data?.isEmailVerification === false || securityVerififcationData?.data?.isEmailVerification === null) && (securityVerififcationData?.data?.isPhoneVerified === false || securityVerififcationData?.data?.isPhoneVerified === null)) {
                    setEnableProtectionModel(true);
                } else {
                    navigation?.navigate(walletsTabsNavigation, { screenType: 'Withdraw', screenName: "Wallets", originalSource: navigationSource || "Wallets" });
                }
            } else {
                setQuikLinksLoader(false);
                setEnableProtectionModel(true);
            }
        }
    };
    const getShownAssets = async () => {
        try {
            const response: any = await WalletsService.getShowVaults();
            if (response?.ok) {
                const data = response?.data;
                const wallets = data?.wallets || [];
                const cryptoPayload = {
                    assets: wallets[0]?.assets || [],
                    defaultVault: wallets[0] || {}
                };
                dispatch(setWalletsDashboard({ cryptoAssets: cryptoPayload }));
            } else {
                showAppToast(isErrorDispaly(response), 'error');
            }
        } catch (error) {
            showAppToast(isErrorDispaly(error), 'error');
        } finally {
            setApiCallsCompleted(prev => ({ ...prev, cryptoList: true }));
        }
    };
    const getFiatAssets = async () => {
        try {
            const response: any = await WalletsService.getFiatVaultsList();
            if (response?.ok) {
                dispatch(setWalletsDashboard({ fiatAssets: response?.data?.assets || [] }));
            } else {
                showAppToast(isErrorDispaly(response), 'error');
            }
        } catch (error) {
            showAppToast(isErrorDispaly(error), 'error');
        } finally {
            setApiCallsCompleted(prev => ({ ...prev, fiatList: true }));
        }
    };

    const handleLink = () => {
        navigation?.navigate('Security')
    }
    const closekycModel = () => {
        setKycModelVisible(false);
    };
    const handleNavigate = (coinItem: any) => {
        navigation.navigate('CoinDetails', { coinData: coinItem, defaultVault: defaultVault });
    }

    const handleFiatNavigate = async (item: any) => {
        if (item?.actionType?.toLowerCase().includes('bankaccountcreation') || item?.actionType?.toLowerCase().includes('bankdepositfiat')) {
            // If KYC state exists and is not approved AND accountStatus is null, open BankKYCScreen

            if (item?.accountStatus) {
                if (item?.accountStatus?.toLowerCase() === 'approved') {
                    navigation.navigate('WalletsFiatCoinDetails', item);
                    return;
                }
                if (item?.accountStatus?.toLowerCase() !== 'approved') {
                    navigation.navigate('Bank', { currency: item.code, screenName: "WalletsAllCoinsList", screenType: 'Deposit' });
                    return;
                }
            } else {
                navigation.navigate('CreateAccountInformation', { selectedVault: item, screenName: "WalletsDashboard", })
                return
            }

        } else if (item?.actionType?.toLowerCase().includes('depositfiat') && item?.code?.toLowerCase() === 'brl') {
            if (item?.accountStatus?.toLowerCase() == null) {
                navigation.navigate("BrlEnableProvider", {
                    VaultData: item,
                    screenName: "Wallets"
                });
            }
            else if (item?.accountStatus.toLowerCase() == 'submitted') {
                navigation.navigate("PaymentPending", { screenName: "Wallets" })
            }
            else if (item?.accountStatus.toLowerCase() == 'rejected') {
                navigation.navigate("PaymentPending", {
                    screenName: "Wallets",
                    status: "rejected",
                    remarks: item?.remarks,
                    VaultData: item
                })
            } else {
                navigation.navigate('WalletsFiatCoinDetails', item);
            }
        }
        else {
            navigation.navigate('WalletsFiatCoinDetails', item);
        }
    }
    const hadleSeeAll = (initialTab: number) => {
        dispatch(setWalletActionFilter(null));
        navigation.navigate(walletsTabsNavigation, { initialTab: initialTab })
    }
    const closeEnableProtectionModel = () => {
        setEnableProtectionModel(false)
    }

    return (
        <SafeAreaViewComponent style={[commonStyles.screenBg]}>
            {screenLoading ? (
                <ViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                    <DashboardLoader />
                </ViewComponent>
            ) : (
                <ScrollViewComponent ref={scrollViewRef} refreshing={refresh} onRefresh={onRefresh} >
                    <Container style={[commonStyles.container]}><>
                        {errormsg && (<ErrorComponent message={errormsg} onClose={errorMSgHandle} children={errormsgLink || ""} handleLink={handleLink} />)}
                        <ViewComponent>
                            <ViewComponent style={[commonStyles.sectionGap]}>
                                <ExchangeBalanceCarousel
                                    cryptoBalance={allBalanceInfo[0]?.value || 0}
                                    fiatBalance={allBalanceInfo[1]?.value || 0}
                                    apiData={allBalanceInfo.length > 0 ? allBalanceInfo : []}
                                    assets={{
                                        crypto: assets.length > 0 ? assets : [],
                                        fiat: walletsDashboardFiatAssets.length > 0 ? walletsDashboardFiatAssets : []
                                    }}
                                />
                            </ViewComponent>
                        </ViewComponent>
                        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyCenter, commonStyles.alignCenter, commonStyles.flex1, commonStyles.sectionGap, commonStyles.gap10]}>
                            {quickLinksConfiguration?.QUCIKLINKS?.Deposit && <ViewComponent style={[commonStyles.flex1]}>
                                <ActionButton
                                    text="GLOBAL_CONSTANTS.DEPOSIT"
                                    useGradient
                                    onPress={handleSellNavigateDeposit}
                                    customIcon={<DeposistIcon />}
                                />
                            </ViewComponent>}
                            {quickLinksConfiguration?.QUCIKLINKS?.Withdraw && <ViewComponent style={[commonStyles.flex1]}>
                                <ActionButton
                                    text="GLOBAL_CONSTANTS.WITHDRAW"
                                    onPress={cryptoWithdraw}
                                    customTextColor={NEW_COLOR.BUTTON_TEXT}
                                    customIcon={<WithdrawIcon />}
                                    loading={quikLinksLoader}
                                />
                            </ViewComponent>}
                        </ViewComponent>
                        {CryptoWalletsPermission && <ViewComponent style={[commonStyles.sectionGap]}>
                            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.titleSectionGap]}>
                                <TextMultiLanguage text={"GLOBAL_CONSTANTS.CRYPTO"} style={commonStyles.sectionTitle} />
                                <CommonTouchableOpacity style={[commonStyles.dflex, commonStyles.alignCenter]} onPress={() => hadleSeeAll(0)}>
                                    <TextMultiLanguage text={"GLOBAL_CONSTANTS.SEE_ALL"} style={[commonStyles.sectionLink]} />
                                </CommonTouchableOpacity>
                            </ViewComponent>
                            <FlatListComponent
                                data={assets}
                                maxToRenderPerBatch={5}
                                initialNumToRender={3}
                                windowSize={5}
                                scrollEnabled={false}
                                ListEmptyComponent={apiCallsCompleted.cryptoList ? <NoDataComponent /> : null}
                                ItemSeparatorComponent={() => <ViewComponent style={[commonStyles.transactionsListGap]} />}
                                renderItem={({ item }: { item: any }) => (
                                    <CommonTouchableOpacity activeOpacity={1} onPress={() => handleNavigate(item)} style={[commonStyles.cardsbannerbg]}>
                                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                                            <ViewComponent style={{ width: s(36), height: s(36) }}>
                                                <ImageUri uri={CoinImages[item?.code?.toLowerCase()] || item?.image} />
                                            </ViewComponent>
                                            <ViewComponent style={[commonStyles.flex1, commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter]}>
                                                <ViewComponent>
                                                    <ParagraphComponent text={item?.name} style={[commonStyles.primarytext]} />
                                                    <ParagraphComponent text={`${item?.code ?? ''}`} style={[commonStyles.secondarytext]} />
                                                </ViewComponent>
                                                <ViewComponent style={[commonStyles.alignEnd]}>
                                                    <CurrencyText value={item?.amount ?? 0} decimalPlaces={4} currency={item?.code} style={[commonStyles.primarytext]} />
                                                </ViewComponent>
                                            </ViewComponent>
                                        </ViewComponent>
                                    </CommonTouchableOpacity>
                                )}
                            />
                        </ViewComponent>}
                        {(FiatWalletsPermission && walletsDashboardFiatAssets?.length > 0) && <ViewComponent style={[commonStyles.sectionGap]}>
                            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.titleSectionGap]}>
                                <TextMultiLanguage text={"GLOBAL_CONSTANTS.FIAT"} style={commonStyles.sectionTitle} />
                                <CommonTouchableOpacity style={[commonStyles.dflex, commonStyles.alignCenter]} onPress={() => hadleSeeAll(1)}>
                                    <TextMultiLanguage text={"GLOBAL_CONSTANTS.SEE_ALL"} style={[commonStyles.sectionLink]} />
                                </CommonTouchableOpacity>
                            </ViewComponent>
                            <FlatListComponent
                                data={walletsDashboardFiatAssets || []}
                                scrollEnabled={false}
                                ListEmptyComponent={apiCallsCompleted.fiatList ? <NoDataComponent /> : null}
                                ItemSeparatorComponent={() => <ViewComponent style={[commonStyles.transactionsListGap]} />}
                                renderItem={({ item }: { item: any }) => (
                                    <CommonTouchableOpacity activeOpacity={1} onPress={() => handleFiatNavigate(item)} style={[commonStyles.cardsbannerbg]}>
                                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                                            <ViewComponent style={{ width: s(36), height: s(36) }}>
                                                <ImageUri uri={CoinImages[item?.code?.toLowerCase()] || item?.image} />
                                            </ViewComponent>
                                            <ViewComponent style={[commonStyles.flex1, commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter]}>
                                                <ParagraphComponent text={item?.name} style={[commonStyles.primarytext]} />
                                                <CurrencyText value={item?.amount ?? 0} decimalPlaces={2} currency={item?.code} style={[commonStyles.primarytext]} />
                                            </ViewComponent>
                                        </ViewComponent>
                                    </CommonTouchableOpacity>
                                )}
                            />
                        </ViewComponent>}
                        {Configuration.RECENT_ACTIVITY.Crypto && (
                            <RecentTransactions
                                accountType={CRYPTO_CONSTANTS.VAULTS}
                                recentTranscationReload={recentTranscationReload}
                                handleRecentTranscationReloadDetails={handleRecentTranscationReloadDetails}
                            />
                        )}
                        <ViewComponent style={[commonStyles.sectionGap]} />
                        {Configuration.GRAPH.Crypto &&
                            <ViewComponent>
                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.titleSectionGap]}>
                                    <TextMultiLanguage text={"GLOBAL_CONSTANTS.SPENDING"} style={[commonStyles.sectionTitle,]} />
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
                                        {DaysLookup?.map((item: any, index: number) => (
                                            <React.Fragment key={item.name}>
                                                {activeYear === item?.name ? (
                                                    <ViewComponent
                                                        style={[commonStyles.graphactivebuttons]} >
                                                        <ParagraphComponent
                                                            style={[commonStyles.graphactivebuttonstext]} text={item.code} />
                                                    </ViewComponent>
                                                ) : (
                                                    <CommonTouchableOpacity
                                                        onPress={() => handleYears(item)}
                                                        style={commonStyles.graphinactivebuttons} activeOpacity={0.9} >
                                                        <ParagraphComponent style={[activeYear === item?.name ? commonStyles.textAlwaysWhite : commonStyles.textWhite, commonStyles.graphinactivebuttonstext]} text={item?.code} />

                                                    </CommonTouchableOpacity>
                                                )}
                                                {index !== DaysLookup.length - 1 && (<ViewComponent style={{ width: s(8) }} />)}

                                            </React.Fragment>
                                        ))}
                                    </ViewComponent>
                                </ViewComponent>
                                <ViewComponent>
                                    {graphDetailsLoading && <Loadding contenthtml={cardGraphSkelton} />}
                                    {(!graphDetailsLoading && grphDetails?.length > 0) && <LineChartComponet
                                        data={(grphDetails || []).map((item: GraphDetailItem) => ({
                                            ...item,
                                            color: item.color ?? "#000000",
                                            dataPointsColor: item.dataPointsColor ?? "#11998E",
                                            textColor: item.textColor ?? NEW_COLOR.TEXT_WHITE,
                                        }))}
                                    />}
                                    {!graphDetailsLoading && grphDetails?.length <= 0 && (<NoDataComponent />)}
                                    {kycModelVisible && <KycVerifyPopup closeModel={closekycModel} addModelVisible={kycModelVisible} />}
                                    <ViewComponent>
                                        {enableProtectionModel && <EnableProtectionModel
                                            navigation={navigation}
                                            closeModel={closeEnableProtectionModel}
                                            addModelVisible={enableProtectionModel}
                                        />}
                                    </ViewComponent>

                                </ViewComponent>
                            </ViewComponent>}
                        <ViewComponent style={[commonStyles.sectionGap]} />
                    </>
                    </Container >
                </ScrollViewComponent>
            )}
            <SuccessBottomSheet
                sheetRef={successSheetRef}
                navigation={navigation}
            />
        </SafeAreaViewComponent>
    );
});
export default WalletsHome;
