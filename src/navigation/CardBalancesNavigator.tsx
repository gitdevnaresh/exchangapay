import React from 'react';

import {CardBalanceStackParamList} from './navigation-types';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import CardBalance from '../screens/Tlv_Cards/CardBalance';
 
const Stack = createNativeStackNavigator<CardBalanceStackParamList>();

const CardBalanceSNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="CardBalance">
      <Stack.Screen name="CardBalance" component={CardBalance} />
    </Stack.Navigator>
  );
};
export default CardBalanceSNavigator;