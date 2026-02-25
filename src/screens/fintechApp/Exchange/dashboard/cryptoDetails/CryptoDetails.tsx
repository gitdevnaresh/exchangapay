import React, { useCallback, useState, useMemo } from 'react';
import { BackHandler } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors';
import { getTabsConfigation, isDecimalSmall } from '../../../../../../configuration';
import { getThemedCommonStyles } from '../../../../../components/CommonStyles';
import { CRYPTO_CONSTANTS, RootState } from '../../constants/constants';
import ViewComponent from '../../../../../components/view/view';
import ScrollViewComponent from '../../../../../components/scrollView/scrollView';
import Container from '../../../../../components/container/container';
import PageHeader from '../../../../../components/pageHeader/pageHeader';
import ErrorComponent from '../../../../../components/errorDisplay/errorDisplay';
import { CurrencyText } from '../../../../../components/textComponets/currencyText/currencyText';
import CommonTouchableOpacity from '../../../../../components/touchableComponents/touchableOpacity';
import ActionButton from '../../../../../components/gradianttext/gradiantbg';
import SellExchangeIcon from '../../../../../components/svgIcons/mainmenuicons/buysell';
import RecentTransactions from '../../../../commonScreens/transactions/recentTransactions';
import KycVerifyPopup from '../../../../commonScreens/kycVerify';
import { RootStackParamList } from '../../../../../navigations/navigation-types';
import BuyExchangeIcon from '../../../../../components/svgIcons/mainmenuicons/buyexchange';
import { NavigationProp } from '@react-navigation/native';
import { CryptoExchangeParams } from '../../interfaces/exchangeInterfaces';

type ExchangeCryptoDetailsProps = {
  navigation: NavigationProp<RootStackParamList>;
  route: {
    params?: CryptoDetailsData;
  };
};

interface CryptoDetailsData {
  coinName: string;
  coinCode: string;
  coinIcon: string;
  balance: number;
  balanceInUSD: number;
}

const CryptoDetails: React.FC<ExchangeCryptoDetailsProps> = React.memo((props) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);
  const userInfo = useSelector((state: RootState) => state.userReducer?.userDetails);

  const [errormsg, setErrormsg] = useState("");
  const [kycModelVisible, setKycModelVisible] = useState(false);
  const [recentTranscationReload, setRecentTranscationReload] = useState(false);
  // Get coin data from navigation params
  const coinData: CryptoDetailsData = props.route?.params ?? {
    coinName: 'Bitcoin',
    coinCode: 'BTC',
    coinIcon: '',
    balance: 0,
    balanceInUSD: 0
  };

  const crypto = getTabsConfigation("EXCHANGE");

  const handleCloseError = useCallback(() => {
    setErrormsg("");
  }, []);

  const handleRecentTranscationReloadDetails = (reload: boolean, error?: string | null) => {
    setRecentTranscationReload(reload);
    if (error) {
      setErrormsg('');
    }
  };

  const closekycModel = () => {
    setKycModelVisible(false);
  };

  const handleBuyNav = useCallback(() => {
    if ((crypto?.IS_EXCHANGE_SKIP_KYC_VERIFICATION_STEP !== true) && (userInfo?.kycStatus == null || userInfo?.kycStatus == CRYPTO_CONSTANTS?.DRAFT || userInfo?.kycStatus == "Submitted")) {
      setKycModelVisible(true);
    } else {
      (props.navigation?.navigate as (screen: string, params: CryptoExchangeParams) => void)('CryptoExchange', {
        cryptoCoin: coinData?.coinCode,
        coinFullName: coinData?.coinName,
        logo: coinData?.coinIcon,
        amountInUSD: coinData?.balanceInUSD
      });
    }
  }, [coinData]);

  const handleSellNav = useCallback(() => {
    if (((crypto?.IS_EXCHANGE_SKIP_KYC_VERIFICATION_STEP !== true)) && (userInfo?.kycStatus == null || userInfo?.kycStatus == CRYPTO_CONSTANTS?.DRAFT || userInfo?.kycStatus == "Submitted")) {
      setKycModelVisible(true);
    } else {
      (props.navigation?.navigate as (screen: string, params: CryptoExchangeParams) => void)('CryptoSellExchange', {
        cryptoCoin: coinData?.coinCode,
        coinFullName: coinData?.coinName,
        logo: coinData?.coinIcon,
        amountInUSD: coinData?.balanceInUSD
      });
    }
  }, [coinData]);

  const handleBack = useCallback(() => {
    props.navigation.goBack();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        handleBack();
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription?.remove();
    }, [handleBack])
  );

  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      <ScrollViewComponent showsVerticalScrollIndicator={false}>
        <Container style={[commonStyles.container]}>
          {/* Page Header */}
          <PageHeader title={coinData?.coinName || ''} onBackPress={handleBack} />

          {errormsg !== "" && (
            <ErrorComponent
              message={errormsg}
              onClose={handleCloseError}
            />
          )}


          {/* Coin Balance Section */}
          <ViewComponent>
            <CurrencyText
              value={coinData?.balance || 0}
              currency={coinData?.coinCode || ''}
              smallDecimal={isDecimalSmall}
              decimalPlaces={4}
              style={[commonStyles.transactionamounttext]}
            />
          </ViewComponent>

          <ViewComponent style={[commonStyles.sectionGap]} />

          {/* Action Buttons */}
          <ViewComponent style={[
            commonStyles.dflex,
            commonStyles.alignCenter,
            commonStyles.justifyContent,
            commonStyles.gap10
          ]}>
            {crypto?.QUCIKLINKS?.Buy && (
              <ViewComponent style={[commonStyles.flex1]}>
                <CommonTouchableOpacity>
                  <ActionButton
                    text="GLOBAL_CONSTANTS.BUY"
                    onPress={handleBuyNav}
                    useGradient={true}
                    customTextColor={NEW_COLOR.TEXT_ALWAYS_WHITE}
                    customIcon={<BuyExchangeIcon />}
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

          <ViewComponent style={[commonStyles.sectionGap]} />

          {/* Recent Transactions */}
          <RecentTransactions accountType={"Exchange"} recentTranscationReload={recentTranscationReload} handleRecentTranscationReloadDetails={handleRecentTranscationReloadDetails} />

          <ViewComponent style={[commonStyles.sectionGap]}>
            {kycModelVisible && <KycVerifyPopup closeModel={closekycModel} addModelVisible={kycModelVisible} />}
          </ViewComponent>
        </Container>
      </ScrollViewComponent>
    </ViewComponent>
  );
});

export default CryptoDetails;