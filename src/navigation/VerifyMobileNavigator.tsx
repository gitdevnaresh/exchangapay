import React from 'react';

import {VerifyMobileStackParamList} from './navigation-types';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import VerifyMobile from "../screens/onBoarding/verifyMobile";

const Stack = createNativeStackNavigator<VerifyMobileStackParamList>();

const VerifyMobileNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="VerifyMobile">
      <Stack.Screen name="VerifyMobile" component={VerifyMobile} />
    </Stack.Navigator>
  );
};
export default VerifyMobileNavigator;