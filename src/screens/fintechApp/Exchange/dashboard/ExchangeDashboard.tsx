import React, { useEffect, useState, FC, useCallback, useRef } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BackHandler } from "react-native";
import { useIsFocused, useFocusEffect } from "@react-navigation/native";
import ExchangeBalanceCarousel from "../../../commonScreens/Carousel/exchangeBalanceCarousel";
import RecentTransactions from "../../../commonScreens/transactions/recentTransactions";
import KycVerifyPopup from "../../../commonScreens/kycVerify";
import DashboardLoader from "../../../../components/loader";
import LineChartComponet from "../../../../components/graphs/Linchart";
import NoDataComponent from "../../../../components/noData/noData";
import TextMultiLanguage from "../../../../components/textComponets/multiLanguageText/textMultiLangauge";
import ParagraphComponent from "../../../../components/textComponets/paragraphText/paragraph";
import { DaysLookup } from "../../Dashboard/constant";
import { homeanalyticsGraph } from "../../../../skeletons/homeDashboard/skeltons";
import Loadding from "../../../../components/skelton/skeltons";
import { useSelector, useDispatch } from "react-redux";
import { ApiResponse, BalanceItem, CryptoAsset, CryptoAssets, FiatAsset, GraphTransaction, FiatResponse, GraphResponse, RBSheetRefType, RootState } from "../constants/constants";
import { showAppToast } from "../../../../components/toasterMessages/ShowMessage";
import { isErrorDispaly } from "../../../../utils/helpers";
import ExchangeCommonService from "../../../../apiServices/exchange/common/exchangeCommonService";
import SafeAreaViewComponent from "../../../../components/safeArea/safeArea";
import ViewComponent from "../../../../components/view/view";
import ScrollViewComponent from "../../../../components/scrollView/scrollView";
import Container from "../../../../components/container/container";
import CommonTouchableOpacity from "../../../../components/touchableComponents/touchableOpacity";
import ActionButton from "../../../../components/gradianttext/gradiantbg";
import SellIcon from "../../../../components/svgIcons/mainmenuicons/buyexchange";
import { RootStackParamList } from "../../../../navigations/navigation-types";
import { setExchangeDashboard } from "../../../../redux/actions/actions";
import { useThemeColors } from "../../../../hooks/themedHook/useThemeColors";
import { CoinImages, getThemedCommonStyles } from "../../../../components/CommonStyles";
import { useScreenPerfLogger } from "../../../../hooks/performance/performanceHook";
import SellExchangeIcon from "../../../../components/svgIcons/mainmenuicons/buysell";
import FlatListComponent from "../../../../components/flatList/flatList";
import SvgFromUrl from "../../../../components/svgIcon";
import { CurrencyText } from "../../../../components/textComponets/currencyText/currencyText";
import { s } from "../../../../components/theme/scale";
import { getTabsConfigation } from '../../../../../configuration';

type ExchangeDashboardProps = NativeStackScreenProps<RootStackParamList, "Exchange">;

const ExchangeDashboard: FC<ExchangeDashboardProps> = React.memo((props: ExchangeDashboardProps) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const isFocused = useIsFocused();
  const scrollViewRef = useRef<{ scrollTo: (options: { y: number; animated: boolean }) => void } | null>(null);
  const [refresh, setRefresh] = useState(false);
  const cardGraphSkelton = homeanalyticsGraph();
  const userInfo = useSelector((state: RootState) => state.userReducer?.userDetails);
  const { exchangeDashboard } = useSelector((state: RootState) => state.userReducer);
  const dispatch = useDispatch();
  const Configuration = getTabsConfigation('ADDS_AND_GRAPG_CONFIGURATION');
  const isExchangeKyc = getTabsConfigation("EXCHANGE");
  // Derived state from Redux - Exchange Dashboard
  const exchangeBalance = exchangeDashboard?.balance || [];
  const exchangeCryptoAssets = exchangeDashboard?.cryptoAssets || { assets: [] };
  const exchangeFiatAssets = exchangeDashboard?.fiatAssets || [];

  const hasExchangeData = () => {
    const balanceHas = Array.isArray(exchangeBalance) && exchangeBalance.length > 0;
    const cryptoHas = Array.isArray(exchangeCryptoAssets?.assets) && exchangeCryptoAssets.assets.length > 0;
    const fiatHas = Array.isArray(exchangeFiatAssets) && exchangeFiatAssets.length > 0;
    return balanceHas || cryptoHas || fiatHas;
  };
  const { stopTrace } = useScreenPerfLogger("Wallets_dashboard");

  const hasLoadedOnce = useRef(false);
  const isInitializing = useRef(false);

  const [state, setState] = useState({
    balanceData: { cryptoBalance: 0, fiatBalance: 0 },
    apiData: [] as BalanceItem[],
    errormsg: "",
    isLoading: true,
    kycModelVisible: false,
    recentTranscationReload: false,
    cryptoRefresh: false,
    cryptoData: { assets: [] as CryptoAsset[] },
    fiatData: { assets: [] as FiatAsset[] },
    grphDetails: [] as GraphTransaction[],
    activeYear: '7',
    graphDetailsLoading: false,
    apiCallsCompleted: { balance: false, crypto: false, fiat: false, cryptoList: false },
    initialChartLoaded: false,
    exchangeCryptoList: [] as CryptoAsset[],
    isRefreshing: false,
    graphData7Days: null as GraphTransaction[] | null,
    graphData30Days: null as GraphTransaction[] | null
  });

  const updateState = (newState: Partial<typeof state>) => {
    setState(prev => ({ ...prev, ...newState }));
  };


  const getBalanceData = async () => {
    try {
      const response = await ExchangeCommonService.getTotalFiatandCryptoBalances() as ApiResponse<BalanceItem[]>;
      if (response?.ok) {
        const data = response.data;
        const cryptoBalance = data?.find((item) => item?.name === 'Crypto Balance')?.value || 0;
        const fiatBalance = data?.find((item) => item?.name === 'Fiat Balance')?.value || 0;
        updateState({
          balanceData: { cryptoBalance, fiatBalance },
          apiData: data
        });
        dispatch(setExchangeDashboard({ balance: data }));
      } else {
        showAppToast(isErrorDispaly(response), 'error');
      }
    } catch (error) {
      showAppToast(isErrorDispaly(error), 'error');
    } finally {
      setState(prev => ({ ...prev, apiCallsCompleted: { ...prev.apiCallsCompleted, balance: true } }));
    }
  };


  const getExchangeCryptoList = async () => {
    try {
      const response = await ExchangeCommonService.getexchangeCryptoList(1, 10) as ApiResponse<CryptoAssets>;
      if (response?.ok) {
        dispatch(setExchangeDashboard({ cryptoAssets: response.data }));
      } else {
        showAppToast(isErrorDispaly(response), 'error');
      }
    } catch (error) {
      showAppToast(isErrorDispaly(error), 'error');
    } finally {
      setState(prev => ({ ...prev, apiCallsCompleted: { ...prev.apiCallsCompleted, crypto: true, cryptoList: true } }));
    }
  };

  const getFiatData = async () => {
    try {
      const response = await ExchangeCommonService.getSelecteCryptoBalance() as ApiResponse<FiatResponse>;
      if (response?.ok) {
        updateState({ fiatData: { assets: response.data?.fiatAssets || [] } });
        dispatch(setExchangeDashboard({ fiatAssets: response.data?.fiatAssets || [] }));
      } else {
        showAppToast(isErrorDispaly(response), 'error');
      }
    } catch (error) {
      showAppToast(isErrorDispaly(error), 'error');
    } finally {
      setState(prev => ({ ...prev, apiCallsCompleted: { ...prev.apiCallsCompleted, fiat: true } }));
    }
  };



  const getExchangeGraphData = async (isDays?: string) => {
    // Check if data exists in state first
    if (isDays === '7' && state.graphData7Days) {
      updateState({ grphDetails: state.graphData7Days });
      return;
    }
    if (isDays === '30' && state.graphData30Days) {
      updateState({ grphDetails: state.graphData30Days });
      return;
    }

    try {
      updateState({ graphDetailsLoading: true });
      const response = await ExchangeCommonService.getExchangeGraph(isDays || '7') as ApiResponse<GraphResponse>;

      if (response?.ok) {
        const graphData = response.data.transactionsModels || [];
        updateState({
          grphDetails: graphData,
          ...(isDays === '7' && { graphData7Days: graphData }),
          ...(isDays === '30' && { graphData30Days: graphData })
        });
      } else {
        showAppToast(isErrorDispaly(response), 'error');
      }
    } catch (error) {
      showAppToast(isErrorDispaly(error), 'error');
    } finally {
      updateState({ graphDetailsLoading: false });
    }
  };

  const fetchInitialData = async (calledFromRefresh = false) => {

    // Don't modify isLoading if called from refresh - let onRefresh handle it
    if (!calledFromRefresh) {
      const shouldShowLoader = Configuration?.DASHBOARD_LOADER;
      const hasRedux = hasExchangeData();
      const shouldSetLoading = shouldShowLoader || !hasRedux;

      updateState({
        isLoading: shouldSetLoading,
        errormsg: "",
        recentTranscationReload: false,
        cryptoRefresh: !state.cryptoRefresh,
        activeYear: '7',
        graphData7Days: null,
        graphData30Days: null,
        apiCallsCompleted: { balance: false, crypto: false, fiat: false, cryptoList: false }
      });
    } else {
      // Only update non-loading related state when called from refresh
      updateState({
        errormsg: "",
        recentTranscationReload: false,
        cryptoRefresh: !state.cryptoRefresh,
        activeYear: '7',
        graphData7Days: null,
        graphData30Days: null,
        apiCallsCompleted: { balance: false, crypto: false, fiat: false, cryptoList: false }
      });
    }

    try {
      await Promise.all([
        getBalanceData(),
        getFiatData(),
        getExchangeCryptoList()
      ]);
    } catch (error) {
      showAppToast(isErrorDispaly(error), 'error');
    } finally {
      // Only set loading to false if not called from refresh
      if (!calledFromRefresh) {
        updateState({ isLoading: false });
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      // Check if Redux data exists and configuration allows loader
      const shouldShowLoader = Configuration?.DASHBOARD_LOADER;
      const hasRedux = hasExchangeData();

      // Initialize component state from Redux data if available
      if (hasRedux) {
        const cryptoBalance = exchangeBalance?.find((item) => item?.name === 'Crypto Balance')?.value || 0;
        const fiatBalance = exchangeBalance?.find((item) => item?.name === 'Fiat Balance')?.value || 0;

        updateState({
          balanceData: { cryptoBalance, fiatBalance },
          apiData: exchangeBalance,
          cryptoData: exchangeCryptoAssets,
          exchangeCryptoList: exchangeCryptoAssets?.assets || [],
          fiatData: { assets: exchangeFiatAssets }
        });
      }

      // Show loader based on configuration or Redux data
      if (shouldShowLoader) {
        updateState({ isLoading: true });
      } else {
        updateState({ isLoading: !hasRedux });
      }

      const initializeData = async () => {
        if (isInitializing.current) {
          return;
        }

        isInitializing.current = true;
        updateState({ activeYear: '7', initialChartLoaded: false });
        updateState({
          errormsg: "",
          cryptoRefresh: !state.cryptoRefresh,
          apiCallsCompleted: { balance: false, crypto: false, fiat: false, cryptoList: false }
        });

        hasLoadedOnce.current = true;

        // Always make API calls to refresh data
        try {
          await Promise.all([
            getBalanceData(),
            getFiatData(),
            getExchangeCryptoList()
          ]);
        } catch (error) {
          showAppToast(isErrorDispaly(error), 'error');
        } finally {
          isInitializing.current = false;
        }
      };

      initializeData();
      stopTrace();
      // Only scroll if ref is available and component is mounted
      setTimeout(() => {
        if (scrollViewRef?.current) {
          scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        }
      }, 100);
      return () => {
      };
    }, [hasExchangeData(), Configuration?.DASHBOARD_LOADER])
  );

  // Dashboard loader control - show until crypto API completes
  useEffect(() => {
    // Don't interfere with loading state during refresh
    if (state.isRefreshing) return;

    const cryptoApiCompleted = state.apiCallsCompleted.crypto;

    // Hide loader only when crypto API call is completed
    if (cryptoApiCompleted && state.isLoading) {
      updateState({ isLoading: false });
    }
  }, [state.apiCallsCompleted.crypto, state.isRefreshing]);

  // Load chart data independently (not tied to dashboard loader)
  useFocusEffect(
    useCallback(() => {
      if (!state.initialChartLoaded) {
        getExchangeGraphData('7');
        updateState({ initialChartLoaded: true });
      }
    }, [state.initialChartLoaded])
  );

  // Load chart data when activeYear changes (but not on initial load)
  useEffect(() => {
    if (state.initialChartLoaded && state.activeYear !== '7') {
      getExchangeGraphData(state.activeYear);
    }
  }, [state.activeYear, state.initialChartLoaded]);

  useEffect(() => {
    const backAction = () => {
      return true; // Prevent default back behavior
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  const onRefresh = useCallback(() => {
    setRefresh(true);
    updateState({ isLoading: true, isRefreshing: true });

    Promise.all([
      fetchInitialData(true),
      getExchangeGraphData(state.activeYear)
    ]).finally(() => {
      setRefresh(false);
      updateState({ isLoading: false, isRefreshing: false });
    });
  }, [state.activeYear]);

  const crypto = getTabsConfigation("EXCHANGE");

  const closekycModel = () => {
    updateState({ kycModelVisible: false });
  };

  const handleBuyNav = useCallback(() => {
    if (isExchangeKyc?.IS_EXCHANGE_SKIP_KYC_VERIFICATION_STEP !== true && userInfo?.kycStatus?.toLowerCase() !== "approved") {
      setState(prev => ({ ...prev, kycModelVisible: true }));
    } else {
      props.navigation.navigate('ExchangeCryptoList');
    }
  }, []);
  const handleSellNav = useCallback(() => {
    if (isExchangeKyc?.IS_EXCHANGE_SKIP_KYC_VERIFICATION_STEP !== true && userInfo?.kycStatus?.toLowerCase() !== "approved") {
      setState(prev => ({ ...prev, kycModelVisible: true }));
    } else {
      props.navigation.navigate('ExchangeCryptoList', { type: 'sell' });
    }
  }, []);



  const handleRecentTranscationReloadDetails = (reload: boolean, error?: string | null) => {
    updateState({ recentTranscationReload: reload });
    if (error) {
      updateState({ errormsg: '' });
    }
  };

  const handleYears = (item: { name?: string; code?: string }) => {
    const newYear = item?.name;
    updateState({ activeYear: newYear });

    // Use stored data if available, otherwise call API
    if (newYear === '7' && state.graphData7Days) {
      updateState({ grphDetails: state.graphData7Days });
    } else if (newYear === '30' && state.graphData30Days) {
      updateState({ grphDetails: state.graphData30Days });
    } else {
      getExchangeGraphData(newYear);
    }
  };

  return (
    <SafeAreaViewComponent style={[commonStyles.screenBg]}>
      {state.isLoading ? (
        <ViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
          <DashboardLoader />
        </ViewComponent>
      ) : (
        <ScrollViewComponent ref={scrollViewRef} refreshing={refresh} onRefresh={onRefresh}>
          <Container style={[commonStyles.container]}>
            <ViewComponent>
              <ViewComponent>
                <ViewComponent style={[commonStyles.sectionGap]}>
                  <ExchangeBalanceCarousel
                    cryptoBalance={exchangeBalance?.find((item) => item?.name === 'Crypto Balance')?.value || state.balanceData.cryptoBalance}
                    fiatBalance={exchangeBalance?.find((item) => item?.name === 'Fiat Balance')?.value || state.balanceData.fiatBalance}
                    apiData={exchangeBalance.length > 0 ? exchangeBalance : state.apiData}
                    assets={{
                      crypto: exchangeCryptoAssets?.assets?.length > 0 ? exchangeCryptoAssets.assets : state.cryptoData.assets,
                      fiat: exchangeFiatAssets?.length > 0 ? exchangeFiatAssets : state.fiatData.assets
                    }}
                  />
                </ViewComponent>
                <ViewComponent>

                  <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap10, commonStyles.sectionGap]}>
                    {crypto?.QUCIKLINKS?.Buy && (
                      <ViewComponent style={[commonStyles.flex1]}>
                        <CommonTouchableOpacity>
                          <ActionButton
                            text="GLOBAL_CONSTANTS.BUY"
                            useGradient
                            onPress={handleBuyNav}
                            customIcon={<SellIcon />}
                          />
                        </CommonTouchableOpacity>
                      </ViewComponent>
                    )}
                    {crypto?.QUCIKLINKS?.Sell && (
                      <ViewComponent style={[commonStyles.flex1]}>
                        <CommonTouchableOpacity>
                          <ActionButton
                            text="GLOBAL_CONSTANTS.SELL"
                            onPress={handleSellNav}
                            customTextColor={NEW_COLOR.BUTTON_TEXT}
                            customIcon={<SellExchangeIcon />}
                          />

                        </CommonTouchableOpacity>

                      </ViewComponent>

                    )}
                  </ViewComponent>
                </ViewComponent>
              </ViewComponent>
              <ViewComponent>
                <TextMultiLanguage text={"GLOBAL_CONSTANTS.CRYPTO"} style={[commonStyles.sectionTitle, commonStyles.titleSectionGap]} />
                <FlatListComponent
                  data={exchangeCryptoAssets?.assets || []}
                  scrollEnabled={false}
                  ListEmptyComponent={state.apiCallsCompleted.crypto ? <NoDataComponent /> : null}
                  ItemSeparatorComponent={() => <ViewComponent style={[commonStyles.transactionsListGap]} />}
                  renderItem={({ item }) => (
                    <CommonTouchableOpacity
                      onPress={() => props.navigation.navigate('ExchangeCryptoDetails', {
                        coinName: item?.name,
                        coinCode: item?.code,
                        coinIcon: CoinImages[item?.code?.toLowerCase()],
                        balance: item?.amount || 0,
                        balanceInUSD: item?.amountInUSD || 0
                      })}
                      style={[commonStyles.cardsbannerbg]}
                    >
                      <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                        <ViewComponent style={{ width: s(32), height: s(32) }}>
                          <SvgFromUrl
                            width={s(32)} height={s(32)}
                            uri={CoinImages[item?.code?.toLowerCase()]}
                          />
                        </ViewComponent>
                        <ViewComponent style={[commonStyles.flex1, commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter]}>
                          <ViewComponent>
                            <ParagraphComponent text={item?.name} style={[commonStyles.primarytext]} />
                            <ParagraphComponent text={item?.code} style={[commonStyles.secondarytext]} />
                          </ViewComponent>
                          <ViewComponent style={[commonStyles.alignEnd]}>
                            <CurrencyText value={item?.amount || 0} decimalPlaces={4} currency={item?.code} style={[commonStyles.primarytext]} />
                          </ViewComponent>
                        </ViewComponent>
                      </ViewComponent>
                    </CommonTouchableOpacity>
                  )}
                />
              </ViewComponent>
              <ViewComponent style={[commonStyles.sectionGap]} />
              <RecentTransactions accountType={"Exchange"} handleRecentTranscationReloadDetails={handleRecentTranscationReloadDetails} />
              <ViewComponent style={[commonStyles.sectionGap]} />
              {(
                <ViewComponent>
                  <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.titleSectionGap]}>
                    <TextMultiLanguage text="GLOBAL_CONSTANTS.SPENDING" style={[commonStyles.sectionTitle]} />
                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
                      {DaysLookup?.map((item, index: number) => (
                        <React.Fragment key={item?.name}>
                          {state.activeYear === item?.name ? (
                            <ViewComponent style={[commonStyles.graphactivebuttons]}>
                              <ParagraphComponent style={[commonStyles.graphactivebuttonstext]} text={item?.code} />
                            </ViewComponent>
                          ) : (
                            <CommonTouchableOpacity
                              onPress={() => handleYears(item)}
                              style={commonStyles.graphinactivebuttons}
                              activeOpacity={0.9}
                            >
                              <ParagraphComponent
                                style={[
                                  state.activeYear === item?.name ? commonStyles.textAlwaysWhite : commonStyles.textWhite,
                                  commonStyles.graphinactivebuttonstext
                                ]}
                                text={item?.code}
                              />
                            </CommonTouchableOpacity>
                          )}
                          {index !== DaysLookup.length - 1 && <ViewComponent style={{ width: 8 }} />}
                        </React.Fragment>
                      ))}
                    </ViewComponent>
                  </ViewComponent>
                  <ViewComponent>
                    {state.graphDetailsLoading && <Loadding />}
                    {(!state.graphDetailsLoading && state.grphDetails?.length > 0) && <LineChartComponet data={state.grphDetails || []} />}
                    {!state.graphDetailsLoading && state.grphDetails?.length <= 0 && (<NoDataComponent />)}
                  </ViewComponent>
                  {state.kycModelVisible && <KycVerifyPopup closeModel={closekycModel} addModelVisible={state.kycModelVisible} />}
                </ViewComponent>

              )}

              <ViewComponent style={[commonStyles.sectionGap]} />
            </ViewComponent>
          </Container>
        </ScrollViewComponent>
      )}
    </SafeAreaViewComponent>
  );
});

export default ExchangeDashboard;