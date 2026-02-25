import React, { useCallback, useEffect, useState } from 'react';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import FiatPayinsList from './fiatPayInList';
import PaymentService from '../../../../../../../apiServices/payments';
import { isErrorDispaly } from '../../../../../../../utils/helpers';
import { FIAT_PAYIN_CONSTANTS } from '../../constants';

const WalletsFiatPayinsList = (props: any) => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const isFocused = useIsFocused();

  const [payInsList, setPayInsList] = useState<any[]>([]);
  const [error, setError] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
      fetchPayInsList();
  }, [isFocused]);

  const fetchPayInsList = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await PaymentService?.walletsfiatpayinIdrList('null');
      if (response?.ok) {
        const data: any = response?.data || [];
        setPayInsList(data.data);
      } else {
        setError(isErrorDispaly(response));
      }
    } catch (e) {
      setError(isErrorDispaly(e));
    } finally {
      setIsLoading(false);
    }
  };
  const handleBackPress = useCallback(() => {
    if (props?.route?.params?.screenName === 'WalletsAssetsSelector') {
      navigation.navigate('WalletsAssetsSelector', { 
        screenType: 'deposit',
        title: 'GLOBAL_CONSTANTS.SELECT_ASSET_FOR_DEPOSIT',
        animation: 'slide_from_left'
      });
    } else {
      navigation.navigate('WalletsAllCoinsList', { 
        animation: 'slide_from_left', 
        initialTab: 1, 
        screenType: FIAT_PAYIN_CONSTANTS.DEPOSIT 
      });
    }
  }, [navigation, props?.route?.params]);

  return <FiatPayinsList
    {...props}
    payInsList={payInsList}
    isLoading={isLoading}
    error={error}
    onRefresh={fetchPayInsList}
    onBackPress={handleBackPress}
    addFiatNavigation={FIAT_PAYIN_CONSTANTS.WALLETS_ADD_FIAT_PAYIN}
    screenName={props?.route?.params?.screenName}
  />;
};

export default WalletsFiatPayinsList;