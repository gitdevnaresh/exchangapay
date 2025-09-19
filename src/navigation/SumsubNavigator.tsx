import React from 'react';

import {SumsubStackParamList} from './navigation-types';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Sumsub from '../screens/onBoarding/sumsub';

const Stack = createNativeStackNavigator<SumsubStackParamList>();

const SumsubNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="Sumsub">
      <Stack.Screen name="Sumsub" component={Sumsub} />
    </Stack.Navigator>
  );
};
export default SumsubNavigator;
