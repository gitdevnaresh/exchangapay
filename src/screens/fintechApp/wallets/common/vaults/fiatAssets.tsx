import React, { useCallback, useEffect, useState } from 'react';
import { isErrorDispaly } from '../../../../../utils/helpers';
import ErrorComponent from '../../../../../components/errorDisplay/errorDisplay';
import { getThemedCommonStyles } from '../../../../../components/CommonStyles';
import { useIsFocused } from '@react-navigation/native';
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors';
import ViewComponent from '../../../../../components/view/view';
import WalletsService from '../../../../../apiServices/wallets';
import ScrollViewComponent from '../../../../../components/scrollView/scrollView';
import DashboardLoader from "../../../../../components/loader";
import CommonTouchableOpacity from '../../../../../components/touchableComponents/touchableOpacity';
import { FiatAsset, FiatData, FiatLoaders, FiatPortfolioProps } from './interface';
import TextMultiLanguage from '../../../../../components/textComponets/multiLanguageText/textMultiLangauge';
import AssetListComponent from './AssetListComponent';
import ActionButton from '../../../../../components/gradianttext/gradiantbg';
import WithdrawIcon from '../../../../../components/svgIcons/mainmenuicons/dashboardwithdraw';
import DeposistIcon from '../../../../../components/svgIcons/mainmenuicons/dashboarddeposist';
import { CurrencyText } from '../../../../../components/textComponets/currencyText/currencyText';
import SafeAreaViewComponent from '../../../../../components/safeArea/safeArea';
import { getTabsConfigation, isDecimalSmall } from '../../../../../../../cofiguration';
import { useSelector } from 'react-redux';
import { logEvent } from '../../../../../hooks/loggingHook';
import KycVerifyPopup from '../../../../commonScreens/kycVerify';
import { getVerificationData } from '../../../../../apiServices/common/countryService';
import EnableProtectionModel from '../../../../commonScreens/protection';

const FiatPortfolio = (props: FiatPortfolioProps) => {
  const isInTab = props?.isInTab || false;
  const [errormsg, setErrormsg] = useState<string>("");
  const [errormsgLink, setErrormsgLink] = useState<string>("");
  const [kycModelVisible, setKycModelVisible] = useState(false);
  const isFocused = useIsFocused();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const currency = getTabsConfigation('CURRENCY');
  const baseCurrency = useSelector((state: any) => state.userReducer?.userDetails?.currency);
  const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
  const [loaders, setLoaders] = useState<FiatLoaders>({
    fiatDataLoading: true,
  });
  const [withdrawLoader, setWithdrawLoader] = useState<boolean>(false);

  const [fiatData, setFiatData] = useState<FiatData>({
    totalBalanceInUSD: 0,
    assets: [],
    assetsPrev: []
  });
  const [enableProtectionModel, setEnableProtectionModel] = useState<boolean>(false)



  useEffect(() => {
    if (!isInTab || props?.isActiveTab) {
      initializeData();
    }
  }, [isFocused, isInTab, props?.isActiveTab]);

  const initializeData = async () => {
    setErrormsg("");
    setLoaders((prev: FiatLoaders) => ({ ...prev, fiatDataLoading: true }));

    await Promise.all([
      getFiatAssets(),
    ]);

    setLoaders((prev: FiatLoaders) => ({ ...prev, fiatDataLoading: false }));
  };

  const getFiatAssets = async (): Promise<void> => {
    try {
      const response = await WalletsService.getFiatVaultsList();
      if (response?.ok) {
        const responseData = response?.data as { totalBalanceInUSD?: number; assets?: FiatAsset[] };
        setFiatData({
          totalBalanceInUSD: responseData?.totalBalanceInUSD || 0,
          assets: responseData?.assets || [],
          assetsPrev: responseData?.assets || []
        });
      } else {
        setErrormsg(isErrorDispaly(response));
      }
    } catch (error) {
      setErrormsg(isErrorDispaly(error));
    }
  };

  const handleSearchResult = (result: any[]) => {
    setFiatData((prev: FiatData) => ({ ...prev, assets: result }));
  };

  const handleItemPress = (item: FiatAsset): void => {
    const currentScreenType = props?.screenType?.toLowerCase();

    if (currentScreenType === "deposit") {
      props.navigation?.navigate('FiatDeposit', {
        currency: item?.code
      });
    } else if (currentScreenType === "withdraw") {
      props.navigation?.navigate('FiatWithdrawForm', {
        currency: item?.code,
        screenName: props?.route?.params?.screenName
      });
    } else {
      props.navigation?.navigate('FiatCoinDetails', item);
    }
  };

  const handleCloseError = useCallback(() => {
    setErrormsg("");
  }, []);

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
    props.navigation?.navigate('AssetSelector', {
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
          props.navigation?.navigate('AssetSelector', {
            screenType: 'withdraw',
            title: 'GLOBAL_CONSTANTS.SELECT_ASSET_FOR_WITHDRAW'
          });
        } else {
          setEnableProtectionModel(true)
        }
      } else {
        setWithdrawLoader(false);
        setEnableProtectionModel(true)
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
            <ScrollViewComponent showsVerticalScrollIndicator={false}>
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

              {!props?.screenType && <ViewComponent style={[commonStyles.sectionGap]} />}

              {/* Action Buttons */}
              {!props?.screenType && <ViewComponent style={[
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
                      customTextColor={NEW_COLOR.TEXT_ALWAYS_WHITE}
                      customIcon={<DeposistIcon />}
                      disable={withdrawLoader}
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
                onItemSelect={() => { }}
                onItemPress={handleItemPress}
                onSearchChange={handleSearchResult}
              />
            </ScrollViewComponent>
          }
        </ViewComponent>
      )}

    </ViewComponent>
  );
};

export default FiatPortfolio;
