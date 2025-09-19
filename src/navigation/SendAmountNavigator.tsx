import React from 'react';

import {SendAmountStackParamList} from './navigation-types';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import SendAmount from '../screens/Send/SendAmount';

 
const Stack = createNativeStackNavigator<SendAmountStackParamList>();

const SendAmountNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="SendAmount">
      <Stack.Screen name="SendAmount" component={SendAmount} />
    </Stack.Navigator>
  );
};
export default SendAmountNavigator;
