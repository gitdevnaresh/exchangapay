import React from 'react';

import {ResendPinStackParamList} from './navigation-types';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ResendPinComponent from '../screens/Tlv_Cards/ResendPin';
 
const Stack = createNativeStackNavigator<ResendPinStackParamList>();

const CryptoStackParamList = () => {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="ResendPin">
      <Stack.Screen name="ResendPin" component={ResendPinComponent} />
    </Stack.Navigator>
  );
};
export default CryptoStackParamList;
