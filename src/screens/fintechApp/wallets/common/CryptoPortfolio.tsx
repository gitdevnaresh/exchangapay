import React, { useCallback, useMemo, useState } from 'react';
import { InteractionManager, SafeAreaView } from 'react-native';
import { isErrorDispaly } from '../../../../utils/helpers';
import ErrorComponent from '../../../../components/errorDisplay/errorDisplay';
import { getThemedCommonStyles } from '../../../../components/CommonStyles';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { homeServices } from '../../../../apiServices/homeDashboard';
import TextMultiLangauge from '../../../../components/textComponets/multiLanguageText/textMultiLangauge';

import SelectVault from '../../../commonScreens/vaults/selectVaults';
import { getTabsConfigation, isDecimalSmall } from '../../../../../cofiguration';
import { useThemeColors } from '../../../../hooks/themedHook/useThemeColors';
import ViewComponent from '../../../../components/view/view';
import WalletsService from '../../../../apiServices/wallets';
import CommonTouchableOpacity from '../../../../components/touchableComponents/touchableOpacity';
import AddVault from './vaults/addVaults';
import ActionButton from '../../../../components/gradianttext/gradiantbg';
import BankDeposistIcon from '../../../../components/svgIcons/mainmenuicons/bankdeposist';
import ScrollViewComponent from '../../../../components/scrollView/scrollView';
import { CurrencyText } from '../../../../components/textComponets/currencyText/currencyText';
import DashboardLoader from "../../../../components/loader";
import WithdrawIcon from '../../../../components/svgIcons/mainmenuicons/dashboardwithdraw';
import AssetsSection from '../../Dashboard/components/AssetsSection';
import { logEvent } from '../../../../hooks/loggingHook';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { useLngTranslation } from '../../../../hooks/languagesHook/useLngTranslation';
import KycVerifyPopup from '../../../commonScreens/kycVerify';
import { setWalletActionFilter } from '../../../../redux/actions/actions';
import { getVerificationData } from '../../../../apiServices/common/countryService';
import EnableProtectionModel from '../../../commonScreens/protection';
import WalletAddIcon from '../../../../components/svgIcons/mainmenuicons/walletadd';
import SearchComponent from '../../../../components/searchComponents/searchComponent';

const CryptoPortfolio = (props: any) => {
  const isInTab = props?.isInTab || false;
  const [errormsg, setErrormsg] = useState("");
  const [errormsgLink, setErrormsgLink] = useState("");
  const navigation = useNavigation<any>();
  const NEW_COLOR = useMemo(() => useThemeColors(), []);
  const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);
  const currency = getTabsConfigation('CURRENCY');
  const [loaders, setLoaders] = useState<any>({
    coinDtaLoading: false,
    totalBalLoading: true,
    isLoadingAssts: false,
    addModelVisible: false,
    kycModelVisible: false,
  });
  const [withdrawLoader, setWithdrawLoader] = useState<boolean>(false);
  const commonConfiguartion = getTabsConfigation("COMMON_CONFIGURATION");
  const { baseCurrency, userInfo, walletActionFilter } = useSelector(
    (state: any) => ({
      baseCurrency: state.userReducer?.userDetails?.currency,
      userInfo: state.userReducer?.userDetails,
      walletActionFilter: state.userReducer?.walletActionFilter,
    }),
    shallowEqual
  );
  const { t } = useLngTranslation();
  const dispatch = useDispatch();
  const [enableProtectionModel, setEnableProtectionModel] = useState<boolean>(false)

  const [lists, setLists] = useState<any>({
    vaultsList: [],
    vaultsPrevList: [],
    coinsList: [],
    coinsPrevList: [],
    cryptoData: [],
    totalInBaseAmount: 0
  });
  const [refresh, setRefresh] = useState<boolean>(false);

  const crypto = getTabsConfigation('CRYPTO');

  useFocusEffect(
    useCallback(() => {
      if (props?.screenType && walletActionFilter !== props.screenType.toLowerCase()) {
        dispatch(setWalletActionFilter(props.screenType.toLowerCase()));
      }

      if (!isInTab || props?.isActiveTab) {
        const task = InteractionManager.runAfterInteractions(() => {
          initializeData();
        });

        return () => task.cancel();
      }
    }, [isInTab, props?.isActiveTab, props?.screenType, walletActionFilter, dispatch])
  );


  const initializeData = async () => {
    setErrormsg("");
    setLoaders((prev: any) => ({ ...prev, totalBalLoading: true }));

    await Promise.all([
      fetchCrypTototalBal(),
      getCryptoCoins()
    ]);

    setLoaders((prev: any) => ({ ...prev, totalBalLoading: false }));
  };

  const onRefresh = async () => {
    setRefresh(true);
    try {
      await Promise.all([
        fetchCrypTototalBal(),
        getCryptoCoins()
      ]);
    } finally {
      setRefresh(false);
    }
  };

  const handleFontSize = (amount: number | string) => {
    const totalCryptoValue = amount?.toString();
    return totalCryptoValue?.length > 9 ? commonStyles.fs20 : commonStyles.fs30;
  };

  const getCryptoCoins = async () => {
    try {
      const response: any = await WalletsService.getShowVaults();
      if (response?.ok) {
        const wallets = response?.data?.wallets || [];
        const assets = wallets?.[0]?.assets || [];
        const totalInBaseAmount = response?.data?.totalInBaseAmount || 0;
        setLists((prev: any) => ({
          ...prev,
          vaultsList: wallets,
          vaultsPrevList: wallets,
          coinsList: assets,
          coinsPrevList: assets,
          totalInBaseAmount: totalInBaseAmount
        }));
      } else {
        setErrormsg(isErrorDispaly(response));
      }
    } catch (error) {
      setErrormsg(isErrorDispaly(error));
    }
  };

  const fetchCrypTototalBal = async () => {
    try {
      const response: any = await homeServices.getTotalBalance();
      if (response?.ok) {
        const cryptoData = response?.data?.[0];
        setLists((prev: any) => ({ ...prev, cryptoData: cryptoData }));
      } else {
        setErrormsg(isErrorDispaly(response));
      }
    } catch (error) {
      setErrormsg(isErrorDispaly(error));
    }
  };

  const totalCryptoValue = lists?.totalInBaseAmount ?? 0;
  const handleCryptoCoinDetails = (val: any, selectedVault: any) => {
    const currentScreenType = walletActionFilter || props?.screenType;
    if (currentScreenType) {
      const screenName = props?.route?.params?.screenName || "WalletsAllCoinsList";
      const originalSource = props?.route?.params?.originalSource || "Wallets";
      props.navigation.push(currentScreenType === "deposit" ? "CryptoDeposit" : "CrptoWithdraw", {
        propsData: {
          cryptoCoin: val?.code,
          coinBalance: val?.amount,
          coinValue: val?.coinValueinNativeCurrency,
          coinNa: val?.walletCode,
          oneCoinVal: val?.amountInUSD,
          percentages: val?.percent_change_1h,
          logo: val?.logo,
          coinName: val?.code,
          marchentId: selectedVault?.id,
          merchantName: selectedVault?.merchantName || selectedVault?.name,
          coinId: val?.id
        },
        screenName: screenName,
        originalSource: originalSource
      });
    } else {
      props.navigation.push("VaultDetails", {
        cryptoCoin: val?.code,
        coinBalance: val?.amount,
        coinValue: val?.coinValueinNativeCurrency,
        coinNa: val?.walletCode,
        oneCoinVal: val?.amountInUSD,
        percentages: val?.percent_change_1h,
        logo: val?.logo,
        coinName: val?.code,
        marchentId: selectedVault?.id,
        merchantName: selectedVault?.merchantName || selectedVault?.name,
        coinId: val?.id,
      });
    }
  };

  const handleCloseErrror = useCallback(() => {
    setErrormsg("");
  }, []);

  const setCoinsList = (data: any) => {
    setLists((prev: any) => ({
      ...prev,
      coinsList: data || [],
      coinsPrevList: data || []
    }));
  };


  const handleNavigate = useCallback(async () => {
    logEvent("Button Pressed", { action: "Crypto wallet withdraw button", currentScreen: "Crypto wallet", nextScreen: "Select Coin" })

    if ((commonConfiguartion?.IS_SKIP_KYC_VERIFICATION_STEP !== true) && (userInfo?.kycStatus !== "Approved" && (userInfo?.metadata?.IsInitialKycRequired == false && userInfo?.metadata?.IsInitialVaultRequired == true))) {
      setLoaders((prev: any) => ({ ...prev, kycModelVisible: true }));
    } else {
      setWithdrawLoader(true);
      const securityVerififcationData: any = await getVerificationData();
      if (securityVerififcationData?.ok) {
        setWithdrawLoader(false);
        if ((securityVerififcationData?.data?.isEmailVerification === true || securityVerififcationData?.data?.isPhoneVerified === true)) {
          navigation.navigate('SelectVaults', { screenName: "WalletsAllCoinsList", originalSource: props?.route?.params?.originalSource || "Wallets" });
        } else {
          setEnableProtectionModel(true)
        }
      } else {
        setWithdrawLoader(false);
        setEnableProtectionModel(true)

      }
    }
  }, [navigation, userInfo?.kycStatus, t]);

  const handleDepositNavigate = useCallback(() => {
    logEvent("Button Pressed", { action: "Crypto wallet deposit button", currentScreen: "Crypto wallet", nextScreen: "Select Coin" })
    //   if (userInfo?.kycStatus !== "Approved") {
    //   setLoaders((prev: any) => ({ ...prev, kycModelVisible: true }));
    // } else{
    // navigation.navigate('SelectVaults', { screenName: 'Deposit' });
    // }
    navigation.navigate('SelectVaults', { screenName: 'Deposit' });
  }, [navigation]);

  const closeVaultModel = useCallback(() => {
    setLoaders((prev: any) => ({ ...prev, addModelVisible: !loaders?.addModelVisible }))
  }, [loaders?.addModelVisible]);
  const saveVaultMethod = () => {
    getCryptoCoins();
    setLoaders((prev: any) => ({ ...prev, addModelVisible: false }))

  };
  const handleAddVault = useCallback(() => {
    logEvent("Button Pressed", { action: "Crypto wallet add vault button", currentScreen: "Crypto wallet" });
    setLoaders((prev: any) => ({ ...prev, addModelVisible: true }))
  }, [loaders?.addModelVisible])

  const closekycModel = () => {
    setLoaders((prev: any) => ({ ...prev, kycModelVisible: false }));
  };

  const handleLink = () => {
    navigation.navigate('Security');
    setErrormsg("");
    setErrormsgLink("");
  };
  const closeEnableProtectionModel = () => {
    setEnableProtectionModel(false)
  }
  const handleSearchResult = (result: any[]) => {
    setLists((prev: any) => ({ ...prev, coinsList: result }));
  };
  return (
    <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
      {loaders?.totalBalLoading &&
        <SafeAreaView style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
          <DashboardLoader />
        </SafeAreaView>
      }



      {!loaders?.totalBalLoading && (
        <ViewComponent style={[commonStyles.flex1]}>
          {
            <ScrollViewComponent
              showsVerticalScrollIndicator={false}
              refreshing={refresh}
              onRefresh={onRefresh}
            >
              <ViewComponent style={commonStyles.sectionGap} />
              {errormsg != "" && (
                <ErrorComponent
                  message={errormsg}
                  onClose={handleCloseErrror}
                  handleLink={errormsgLink ? handleLink : undefined}
                >
                  {errormsgLink || ""}
                </ErrorComponent>
              )}
              <ViewComponent>
                <ViewComponent>
                  <TextMultiLangauge
                    text={"GLOBAL_CONSTANTS.TOTAL_CRYPTO"}
                    style={[
                      commonStyles.transactionamounttextlabel
                    ]}
                  />
                  <CurrencyText value={totalCryptoValue} smallDecimal={isDecimalSmall} prifix={currency[baseCurrency]} decimalPlaces={2} style={[handleFontSize(totalCryptoValue), commonStyles.transactionamounttext]} />
                </ViewComponent>
                <ViewComponent style={[commonStyles.sectionGap]} />
              </ViewComponent>
              {!props?.screenType && !walletActionFilter && <ViewComponent>
                <ViewComponent
                  style={[
                    commonStyles.quicklinksgap,
                    commonStyles.sectionGap
                  ]}
                >
                  {crypto?.QUCIKLINKS?.AddVault && (<ViewComponent style={[commonStyles.quicklinksflex]}>

                    <CommonTouchableOpacity>
                      <ActionButton
                        text={"GLOBAL_CONSTANTS.WALLET"}
                        onPress={handleAddVault}
                        customTextColor={NEW_COLOR.TEXT_ALWAYS_WHITE}
                        useGradient
                        customIcon={<WalletAddIcon />}
                      />
                    </CommonTouchableOpacity>
                  </ViewComponent>)}
                  <ViewComponent style={[commonStyles.quicklinksflex]}>
                    {crypto?.QUCIKLINKS?.Deposit && (
                      <CommonTouchableOpacity>
                        <ActionButton
                          text={"GLOBAL_CONSTANTS.DEPOSIT"}
                          onPress={handleDepositNavigate}
                          useGradient={true}
                          disable={withdrawLoader}
                          customTextColor={NEW_COLOR.TEXT_ALWAYS_WHITE}
                          customIcon={<BankDeposistIcon />}
                        />
                      </CommonTouchableOpacity>
                    )}
                  </ViewComponent>
                  <ViewComponent style={[commonStyles.quicklinksflex]}>
                    {crypto?.QUCIKLINKS?.Withdraw && (
                      <CommonTouchableOpacity>
                        <ActionButton
                          text={"GLOBAL_CONSTANTS.WITHDRAW"}
                          onPress={handleNavigate}
                          customTextColor={NEW_COLOR.BUTTON_TEXT}
                          customIcon={<WithdrawIcon />}
                          loading={withdrawLoader}
                          disable={withdrawLoader}
                        />
                      </CommonTouchableOpacity>
                    )}
                  </ViewComponent>
                </ViewComponent>
              </ViewComponent>}
              <SearchComponent data={lists?.coinsPrevList || []} customBind="code" onSearchResult={handleSearchResult} placeholder="GLOBAL_CONSTANTS.SEARCH" />
              <ViewComponent>
                {lists?.vaultsList?.length > 1 ? (
                  <SelectVault
                    setCoinsList={setCoinsList}
                    vaultsList={lists?.vaultsList}
                    coinsList={lists?.coinsList}
                    valutsPrevList={lists?.vaultsPrevList}
                    isLoading={loaders?.coinDtaLoading}
                    disable={true}
                    handleNavigate={handleCryptoCoinDetails}
                    key={'selectVaultComponent'}
                  />
                ) : (
                  <AssetsSection
                    commonStyles={commonStyles}
                    GraphConfiguration={getTabsConfigation('ADDS_AND_GRAPG_CONFIGURATION')}
                    assets={lists?.coinsList}
                    vaultsLists={lists}
                    vaultCoinsLists={lists}
                    handleNavigate={handleCryptoCoinDetails}
                    NEW_COLOR={NEW_COLOR}
                    setCoinsList={setCoinsList}
                    showHeader={false}
                  />
                )}
              </ViewComponent>
            </ScrollViewComponent>
          }
        </ViewComponent>
      )}
      <ViewComponent style={[commonStyles?.mb20]} />
      <ViewComponent style={[commonStyles?.mb20]} />

      {loaders?.addModelVisible && <AddVault addModelVisible={loaders?.addModelVisible} closeModel={closeVaultModel} saveVault={saveVaultMethod} />}
      {loaders?.kycModelVisible && <KycVerifyPopup closeModel={closekycModel} addModelVisible={loaders?.kycModelVisible} />}
      <ViewComponent>
        {enableProtectionModel && <EnableProtectionModel
          navigation={props.navigation}
          closeModel={closeEnableProtectionModel}
          addModelVisible={enableProtectionModel}
        />}
      </ViewComponent>
    </ViewComponent>
  );
};

export default CryptoPortfolio;
