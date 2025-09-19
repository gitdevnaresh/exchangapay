import React from 'react';

import {SendCryptoSuccessStackParamList} from './navigation-types';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import SendCryptoSuccess from '../screens/Crypto/sendCryptoSuccess';

 
const Stack = createNativeStackNavigator<SendCryptoSuccessStackParamList>();

const SendCryptoSuccessNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="SendCryptoSuccess">
      <Stack.Screen name="SendCryptoSuccess" component={SendCryptoSuccess} />
    </Stack.Navigator>
  );
};
export default SendCryptoSuccessNavigator;
