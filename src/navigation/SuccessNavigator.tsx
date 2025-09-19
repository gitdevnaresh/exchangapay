import React from 'react';

import {SuccessStackParamList} from './navigation-types';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Success from '../screens/Success/Index';

const Stack = createNativeStackNavigator<SuccessStackParamList>();

const SuccessNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="Success">
      <Stack.Screen name="Success" component={Success} />
    </Stack.Navigator>
  );
};
export default SuccessNavigator;
