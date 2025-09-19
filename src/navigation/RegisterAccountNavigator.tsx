import React from 'react';

import {RegisterAccountStackParamList} from './navigation-types';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import RegisterAccount from '../screens/onBoarding/rigistration';

 
const Stack = createNativeStackNavigator<RegisterAccountStackParamList>();

const BankNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="RegisterAccount">
      <Stack.Screen name="RegisterAccount" component={RegisterAccount} />
    </Stack.Navigator>
  );
};
export default BankNavigator;
