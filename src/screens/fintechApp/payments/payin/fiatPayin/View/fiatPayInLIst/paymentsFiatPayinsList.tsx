import React, { useCallback, useEffect, useState } from 'react';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import FiatPayinsList from './fiatPayInList';
import PaymentService from '../../../../../../../apiServices/payments';
import { isErrorDispaly } from '../../../../../../../utils/helpers';
import { FIAT_PAYIN_CONSTANTS } from '../../constants';

const PaymentsFiatPayinsList = (props: any) => {
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
      const response = await PaymentService?.fiatpayinIdrList(1, 10);
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
    const returnTab = route.params?.returnTab ?? 1; // Default to fiat tab
    navigation.navigate('PayInGrid', { animation: 'slide_from_left', initialTab: returnTab,screenType:'Payments' });
  }, [navigation, route.params]);

  return <FiatPayinsList
    {...props}
    payInsList={payInsList}
    isLoading={isLoading}
    error={error}
    onRefresh={fetchPayInsList}
    onBackPress={handleBackPress}
    addFiatNavigation={FIAT_PAYIN_CONSTANTS.PAYMENTS_ADD_FIAT_PAYIN}
    screenName={props?.route?.params?.screenName}
  />;
};

export default PaymentsFiatPayinsList;