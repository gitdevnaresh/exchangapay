import React from 'react';

import {CryptoReceiveStackParamList} from './navigation-types';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import CryptoReceive from '../screens/Crypto/cryptoReceive'

 
const Stack = createNativeStackNavigator<CryptoReceiveStackParamList>();

const CryptoReceiveNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="CryptoReceive">
      <Stack.Screen name="CryptoReceive" component={CryptoReceive} />
    </Stack.Navigator>
  );
};
export default CryptoReceiveNavigator;
