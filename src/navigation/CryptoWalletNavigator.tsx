import React from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';
import CryptoWallet from '../screens/Crypto/dashboard/CryptoWallet';
import { CryptoWalletStackParamList } from './navigation-types';

 
const Stack = createNativeStackNavigator<CryptoWalletStackParamList>();

const CryptoWalletNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="CryptoWallet">
      <Stack.Screen name="CryptoWallet" component={CryptoWallet} />
    </Stack.Navigator>
  );
};
export default CryptoWalletNavigator;
