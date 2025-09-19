import React from 'react';

import {FreezeUnFreezeStackParamList} from './navigation-types';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import FreezeComponent from '../screens/Tlv_Cards/Freeze';
 
const Stack = createNativeStackNavigator<FreezeUnFreezeStackParamList>();

const HomeNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false,gestureEnabled: false}}
      initialRouteName="FreezeUnFreeze">
      <Stack.Screen name="FreezeUnFreeze" component={FreezeComponent} />
    </Stack.Navigator>
  );
};
export default HomeNavigator;
