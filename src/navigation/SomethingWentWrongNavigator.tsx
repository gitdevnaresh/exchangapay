import React from 'react';

import {SomethingWentWrongStackParamList} from './navigation-types';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import SomethingWentWrong from '../screens/UpdateScreens/SomethingWentWrong';

 
const Stack = createNativeStackNavigator<SomethingWentWrongStackParamList>();

const SomethingWentWrongNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="SomethingWentWrong">
      <Stack.Screen name="SomethingWentWrong" component={SomethingWentWrong} />
    </Stack.Navigator>
  );
};
export default SomethingWentWrongNavigator;
