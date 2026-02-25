import React, { useCallback, useEffect, useState } from 'react';
import { isErrorDispaly } from '../../../../../utils/helpers';
import ErrorComponent from '../../../../../components/errorDisplay/errorDisplay';
import { getThemedCommonStyles } from '../../../../../components/CommonStyles';
import { useIsFocused, useNavigation, useFocusEffect } from '@react-navigation/native';
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors';
import ViewComponent from '../../../../../components/view/view';
import WalletsService from '../../../../../apiServices/wallets';
import ScrollViewComponent from '../../../../../components/scrollView/scrollView';
import DashboardLoader from "../../../../../components/loader";
import CommonTouchableOpacity from '../../../../../components/touchableComponents/touchableOpacity';
import TextMultiLanguage from '../../../../../components/textComponets/multiLanguageText/textMultiLangauge';
import ActionButton from '../../../../../components/gradianttext/gradiantbg';
import WithdrawIcon from '../../../../../components/svgIcons/mainmenuicons/dashboardwithdraw';
import DeposistIcon from '../../../../../components/svgIcons/mainmenuicons/dashboarddeposist';
import { CurrencyText } from '../../../../../components/textComponets/currencyText/currencyText';
import SafeAreaViewComponent from '../../../../../components/safeArea/safeArea';
import { getTabsConfigation, isDecimalSmall } from '../../../../../../cofiguration';
import { useSelector, useDispatch } from 'react-redux';
import { logEvent } from '../../../../../hooks/loggingHook';
import { useLngTranslation } from '../../../../../hooks/languagesHook/useLngTranslation';
import KycVerifyPopup from '../../../../commonScreens/kycVerify';
import { FiatAsset, FiatData, FiatLoaders, FiatPortfolioProps } from '../vaults/vaultsInterface';
import AssetListComponent from '../vaults/AssetListComponent';
import { setWalletActionFilter } from '../../../../../redux/actions/actions';
import { getVerificationData } from '../../../../../apiServices/common/countryService';
import EnableProtectionModel from '../../../../commonScreens/protection';

const WalletsFiatPortfolio = (props: FiatPortfolioProps) => {
  const isInTab = props?.isInTab || false;
  const [errormsg, setErrormsg] = useState<string>("");
  const [errormsgLink, setErrormsgLink] = useState<string>("");
  const [searchText, setSearchText] = useState<string>("");
  const [kycModelVisible, setKycModelVisible] = useState(false);
  const isFocused = useIsFocused();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const currency = getTabsConfigation('CURRENCY');
  const baseCurrency = useSelector((state: any) => state.userReducer?.userDetails?.currency);
  const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
  const walletActionFilter = useSelector((state: any) => state.userReducer?.walletActionFilter);
  const { t } = useLngTranslation();
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const [loaders, setLoaders] = useState<FiatLoaders>({
    fiatDataLoading: true,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [withdrawLoader, setWithdrawLoader] = useState<boolean>(false);
  const [enableProtectionModel, setEnableProtectionModel] = useState<boolean>(false);
  const [fiatData, setFiatData] = useState<FiatData>({
    totalBalanceInUSD: 0,
    assets: [],
    assetsPrev: []
  });

  useFocusEffect(
    useCallback(() => {
      // Set filter based on screenType (override existing filter if different)
      if (props?.screenType && walletActionFilter !== props.screenType.toLowerCase()) {
        dispatch(setWalletActionFilter(props.screenType.toLowerCase()));
      }
      if (!isInTab || props?.isActiveTab) {
        initializeData();
      }
    }, [isInTab, props?.isActiveTab])
  );

  const initializeData = async () => {
    setErrormsg("");
    setLoaders((prev: FiatLoaders) => ({ ...prev, fiatDataLoading: true }));

    await Promise.all([
      getFiatAssets()
    ]);

    setLoaders((prev: FiatLoaders) => ({ ...prev, fiatDataLoading: false }));
  };

  const getFiatAssets = async (): Promise<void> => {
    try {
      let response
      if (props?.screenType?.toLowerCase() === 'withdraw' || walletActionFilter === 'withdraw') {
        response = await WalletsService.getFiatCoinListsList('withdraw');
      } else {
        response = await WalletsService.getFiatVaultsList();
      }
      if (response?.ok) {
        const responseData = response?.data as { totalBalanceInUSD?: number; assets?: FiatAsset[] };
        let filteredAssets = responseData?.assets || [];
        // Filter assets based on walletActionFilter
        if (walletActionFilter === 'deposit') {
          filteredAssets = filteredAssets.filter((asset: FiatAsset) =>
            asset?.actionType?.toLowerCase().includes('deposit') ||
            asset?.actionType?.toLowerCase().includes('payin') ||
            asset?.actionType?.toLowerCase().includes('bankaccountcreation')
          );
        } else if (walletActionFilter === 'withdraw') {
          filteredAssets = filteredAssets.filter((asset: FiatAsset) =>
            asset?.actionType?.toLowerCase().includes('withdraw') ||
            asset?.actionType?.toLowerCase().includes('payout')
          );
        }
        setFiatData({
          totalBalanceInUSD: responseData?.totalBalanceInUSD || 0,
          assets: filteredAssets,
          assetsPrev: filteredAssets
        });
      } else {
        setErrormsg(isErrorDispaly(response));
      }
    } catch (error) {
      setErrormsg(isErrorDispaly(error));
    }
  };

  const handleChangeSearch = useCallback((val: string): void => {
    const value = val.trim();
    setSearchText(value);
    if (value) {
      const filterData = fiatData?.assetsPrev?.filter((item: FiatAsset) =>
        item.code?.toLowerCase().includes(value.toLowerCase())
      ) || [];
      setFiatData((prev: FiatData) => ({ ...prev, assets: filterData }));
    } else {
      setFiatData((prev: FiatData) => ({ ...prev, assets: fiatData?.assetsPrev }));
    }
  }, [fiatData?.assetsPrev]);
  const handleItemPress = (item: FiatAsset): void => {
    // Priority 1: Bank account creation/deposit
    if (item?.actionType?.toLowerCase().includes('bankaccountcreation') || item?.actionType?.toLowerCase().includes('bankdepositfiat')) {
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
        navigation.navigate('CreateAccountInformation', { selectedVault: item, screenName: "WalletsAllCoinsList", screenType: 'Deposit', fromWalletsFiat: true })
        return
      }
    }

    // Priority 2: BRL deposit
    else if (item?.actionType?.toLowerCase().includes('depositfiat') && item?.code?.toLowerCase() === 'brl') {
      if (item?.accountStatus?.toLowerCase() == null) {
        navigation.navigate("BrlEnableProvider", {
          VaultData: item,
          screenName: "Wallets"
        });
      }
      else if (item?.accountStatus.toLowerCase() == 'submitted') {
        navigation.navigate("PaymentPending", {
          screenName: "Wallets",
          sourceScreen: props?.isInTab ? "WalletsAllCoinsList" : "WalletsDashboard"
        })
      }
      else if (item?.accountStatus.toLowerCase() == 'rejected') {
        navigation.navigate("PaymentPending", {
          screenName: "Wallets",
          status: "rejected",
          remarks: item?.remarks,
          VaultData: item,
          sourceScreen: props?.isInTab ? "WalletsAllCoinsList" : "WalletsDashboard"
        })
      }
      else {
        navigation.navigate('WalletsFiatCoinDetails', item);
      }
    }

    // Priority 3: Check for walletActionFilter or screenType specific navigation
    else if (walletActionFilter || props.screenType) {
      const currentScreenType = walletActionFilter || props.screenType?.toLowerCase();
      const actionType = item?.actionType?.toLowerCase() || '';
      if (currentScreenType === 'withdraw') {
        if (actionType?.includes('payoutfiat')) {
          navigation.navigate('WalletsFiatPayoutWithdraw', { selectedVault: item, screenName: "WalletsAllCoinsList" });
        }
        else if (actionType.includes('bankaccountcreation') || actionType.includes('bankwithdrawfiat')) {
          if (item?.accountStatus?.toLowerCase() === 'approved') {
            navigation.navigate('SendAmount', { walletCode: item.code, name: item.name, selectedId: item.id, screenName: "WalletsAllCoinsList", screenType: 'Withdraw' });
          } else if (item?.accountStatus?.toLowerCase() == null) {
            navigation.navigate('WalletsBankCreation', { selectedVault: item, screenName: "WalletsAllCoinsList", screenType: 'Withdraw' });
          } else {
            navigation.navigate('Bank', { currency: item.code, screenName: "WalletsAllCoinsList", screenType: 'Withdraw' });
          }
        }

        else {
          navigation.navigate('FiatWithdrawForm', {
            currency: item?.code,
            screenName: "WalletsAllCoinsList", screenType: 'Withdraw'
          })

        }
      }


      else if (currentScreenType === 'deposit') {
        if (actionType.includes('payinfiat')) {
          navigation.navigate('WalletsFiatPayinsList', { data: item, mount: item?.amount, screenName: "WalletsAssetsSelector" });
        }
        else {
          navigation.navigate('FiatDeposit', { currency: item.code });
        }
      }
    }

    // Default: Navigate to coin details
    else {
      navigation.navigate('WalletsFiatCoinDetails', item);
    }
  };
  const handleCloseError = useCallback(() => {
    setErrormsg("");
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        getFiatAssets()
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const closekycModel = () => {
    setKycModelVisible(false);
  };

  const handleLink = () => {
    props.navigation?.navigate('Security');
    setErrormsg("");
    setErrormsgLink("");
  };

  const handleDeposit = (): void => {
    logEvent("Button Pressed", { action: "Fiat Deposit", nextScreen: "Fiat Coin Selection", currentScreen: "Fiat tab" })
    props.navigation?.navigate('WalletsAssetsSelector', {
      screenType: 'deposit',
      title: 'GLOBAL_CONSTANTS.SELECT_ASSET_FOR_DEPOSIT'
    });
  };
  const handleWithdraw = async (): Promise<void> => {
    logEvent("Button Pressed", { action: "Fiat Withdraw", nextScreen: "Fiat Coin Selection", currentScreen: "Fiat tab" });
    setErrormsg('');
    setErrormsgLink('');
    if (userInfo?.kycStatus !== "Approved") {
      setKycModelVisible(true);
    } else {
      setWithdrawLoader(true);
      const securityVerififcationData: any = await getVerificationData();
      if (securityVerififcationData?.ok) {
        setWithdrawLoader(false);
        if ((securityVerififcationData?.data?.isEmailVerification === true || securityVerififcationData?.data?.isPhoneVerified === true)) {
          props.navigation?.navigate('WalletsAssetsSelector', {
            screenType: 'withdraw',
            title: 'GLOBAL_CONSTANTS.SELECT_ASSET_FOR_WITHDRAW'
          });
        } else {
          setWithdrawLoader(false);
          setEnableProtectionModel(true);
        }
      } else {
        setWithdrawLoader(false);
        setEnableProtectionModel(true);

      }
    }
  };
  const closeEnableProtectionModel = () => {
    setEnableProtectionModel(false)
  }

  return (
    <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
      {loaders?.fiatDataLoading && (
        <SafeAreaViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
          <DashboardLoader />
        </SafeAreaViewComponent>
      )}

      {!loaders?.fiatDataLoading && (
        <ViewComponent style={[commonStyles.flex1]}>
          {
            <ScrollViewComponent
              showsVerticalScrollIndicator={false}
              refreshing={refreshing}
              onRefresh={onRefresh}
            >
              <ViewComponent style={commonStyles.sectionGap} />
              {errormsg != "" && (
                <ErrorComponent
                  message={errormsg}
                  onClose={handleCloseError}
                  handleLink={errormsgLink ? handleLink : undefined}
                >
                  {errormsgLink || ""}
                </ErrorComponent>
              )}
              {kycModelVisible && <KycVerifyPopup closeModel={closekycModel} addModelVisible={kycModelVisible} />}
              <ViewComponent>
                {enableProtectionModel && <EnableProtectionModel
                  navigation={props.navigation}
                  closeModel={closeEnableProtectionModel}
                  addModelVisible={enableProtectionModel}
                />}
              </ViewComponent>
              {/* Total Fiat Value Section */}
              <ViewComponent>
                <TextMultiLanguage
                  text='GLOBAL_CONSTANTS.TOTAL_FIAT'
                  style={[
                    commonStyles.transactionamounttextlabel
                  ]}
                />
                <CurrencyText
                  value={fiatData?.totalBalanceInUSD || 0}
                  prifix={currency[baseCurrency]}
                  smallDecimal={isDecimalSmall}
                  style={[
                    commonStyles.transactionamounttext
                  ]}
                />

              </ViewComponent>

              {!props?.screenType && !walletActionFilter && <ViewComponent style={[commonStyles.sectionGap]} />}

              {/* Action Buttons */}
              {!props?.screenType && !walletActionFilter && <ViewComponent style={[
                commonStyles.dflex,
                commonStyles.alignStart,
                commonStyles.justifyContent,
                commonStyles.gap10
              ]}>
                <ViewComponent style={[commonStyles.flex1]}>
                  <CommonTouchableOpacity>
                    <ActionButton
                      text="GLOBAL_CONSTANTS.DEPOSIT"
                      onPress={handleDeposit}
                      useGradient={true}
                      disable={withdrawLoader}
                      customTextColor={NEW_COLOR.TEXT_ALWAYS_WHITE}
                      customIcon={<DeposistIcon />}
                    />
                  </CommonTouchableOpacity>
                </ViewComponent>

                <ViewComponent style={[commonStyles.flex1]}>
                  <CommonTouchableOpacity>
                    <ActionButton
                      text="GLOBAL_CONSTANTS.WITHDRAW"
                      onPress={handleWithdraw}
                      customTextColor={NEW_COLOR.BUTTON_TEXT}
                      customIcon={<WithdrawIcon />}
                      loading={withdrawLoader}
                      disable={withdrawLoader}
                    />
                  </CommonTouchableOpacity>
                </ViewComponent>
              </ViewComponent>}

              <ViewComponent style={[commonStyles.sectionGap]} />
              <AssetListComponent
                assets={fiatData?.assets}
                selectedItem={null}
                searchText={searchText}
                onSearchChange={handleChangeSearch}
                onItemSelect={() => { }}
                onItemPress={handleItemPress}
              />
            </ScrollViewComponent>
          }
        </ViewComponent>
      )}

    </ViewComponent>
  );
};

export default WalletsFiatPortfolio;
