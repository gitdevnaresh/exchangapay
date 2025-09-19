import React from 'react';

import {SendCryptoDetailsStackParamList} from './navigation-types';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import SendCryptoDetails from '../screens/Crypto/sendCryptoDetails';
 
const Stack = createNativeStackNavigator<SendCryptoDetailsStackParamList>();

const SendCryptoDetailsNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="SendCryptoDetails">
      <Stack.Screen name="SendCryptoDetails" component={SendCryptoDetails} />
    </Stack.Navigator>
  );
};
export default SendCryptoDetailsNavigator;
