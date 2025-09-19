import React from 'react';

import {CryptoCoinReceiveStackParamList} from './navigation-types';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import CryptoCoinReceive from '../screens/Crypto/cryptoCoinReceive';

 
const Stack = createNativeStackNavigator<CryptoCoinReceiveStackParamList>();

const CryptoReceiveNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="CryptoCoinReceive">
      <Stack.Screen name="CryptoCoinReceive" component={CryptoCoinReceive} />
    </Stack.Navigator>
  );
};
export default CryptoReceiveNavigator;