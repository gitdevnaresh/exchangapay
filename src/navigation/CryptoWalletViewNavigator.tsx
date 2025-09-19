import React from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';
import CryptoWalletView from '../screens/Crypto/dashboard/CryptoWalletView';
import { CryptoWalletViewStackParamList } from './navigation-types';

 
const Stack = createNativeStackNavigator<CryptoWalletViewStackParamList>();

const CryptoWalletViewNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="CryptoWalletView">
      <Stack.Screen name="CryptoWalletView" component={CryptoWalletView} />
    </Stack.Navigator>
  );
};
export default CryptoWalletViewNavigator;
