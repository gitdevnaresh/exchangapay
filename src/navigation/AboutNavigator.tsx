import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './navigation-types';
import NewCard from '../screens/cards';

const Stack = createNativeStackNavigator<RootStackParamList>();

const CryptoStackParamList = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="About">
      <Stack.Screen name="About" component={NewCard} />
    </Stack.Navigator>
  );
};
export default CryptoStackParamList;
