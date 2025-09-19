import React from 'react';

import {VerifyEmailStackParamList} from './navigation-types';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import VerifyEmail from '../screens/onBoarding/verifyEmail';

 
const Stack = createNativeStackNavigator<VerifyEmailStackParamList>();

const VerifyEmailNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="VerifyEmail">
      <Stack.Screen name="VerifyEmail" component={VerifyEmail} />
    </Stack.Navigator>
  );
};
export default VerifyEmailNavigator;
