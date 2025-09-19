import React from 'react';

import {CrypoTransactionStackParamList} from './navigation-types';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import CrypoTransaction from '../screens/Crypto/cryptoTransations/Transaction';
import CryptoCardsTransaction from '../screens/Crypto/cryptoCardTransations/CryptoCardsTransaction';
 
const Stack = createNativeStackNavigator<CrypoTransactionStackParamList>();

const CrypoTransactionStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="CrypoTransaction">
      <Stack.Screen name="CrypoTransaction" component={CryptoCardsTransaction} />
    </Stack.Navigator>
  );
};
export default CrypoTransactionStackNavigator;