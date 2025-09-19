import React from 'react';

import {AccountProgressStackParamList} from './navigation-types';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AccountProgress from '../screens/onBoarding/accountProgress';

const Stack = createNativeStackNavigator<AccountProgressStackParamList>();

const BankNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="AccountProgress">
      <Stack.Screen name="AccountProgress" component={AccountProgress} />
    </Stack.Navigator>
  );
};
export default BankNavigator;
