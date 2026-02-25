import React, { useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSumsubSDK } from '../../../../hooks/sumsubHooks/useSumsubSDK';
import DashboardLoader from '../../../../components/loader';

const SumsubNavigation: React.FC = () => {
  const { launchSumsubSDK } = useSumsubSDK();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { cardParams } = route.params;
  const [hasLaunched, setHasLaunched] = useState(false);

  useEffect(() => {
    const initiateSumsub = async () => {
      if (hasLaunched) return; // Prevent multiple launches
      
      try {
        setHasLaunched(true);
        await launchSumsubSDK(cardParams);
        navigation.navigate('AllCards');
      } catch (error) {
        navigation.navigate('AllCards');
      }
    };

    initiateSumsub();
  }, [hasLaunched]);

  return <DashboardLoader />;
};

export default SumsubNavigation;